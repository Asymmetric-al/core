/** @vitest-environment jsdom */

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import * as React from "react";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useProfilePageView } from "../../../../../../apps/missionary/app/profile/use-profile-page-view";
import { getQueryClient } from "../../../../../../packages/database/providers/query-client";
import { QueryProvider } from "../../../../../../packages/database/providers/query-provider";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const apiProfile = {
  profile: {
    first_name: "Ada",
    last_name: "Lovelace",
    email: "ada@example.org",
    avatar_url: "",
    missionary: {
      phone: "",
      location: "London",
      tagline: "Analytical engines",
      bio: "",
      cover_url: "",
      social_links: {},
    },
  },
};

// The app mounts the shared QueryProvider (a singleton client), so the test
// does too and clears it between cases.
function createWrapper() {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryProvider>{children}</QueryProvider>;
  };
}

beforeEach(() => {
  getQueryClient().clear();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  getQueryClient().clear();
  vi.unstubAllGlobals();
});

describe("useProfilePageView", () => {
  it("loads the profile, tracks edits against it, and restores it on discard", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, apiProfile));

    const { result } = renderHook(() => useProfilePageView(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.fetchError).toBeNull();
    expect(result.current.profile.firstName).toBe("Ada");
    expect(result.current.profile.location).toBe("London");
    expect(result.current.initials).toBe("AL");
    expect(result.current.hasChanges).toBe(false);

    act(() => {
      result.current.updateProfile("location", "Paris");
    });
    expect(result.current.profile.location).toBe("Paris");
    expect(result.current.profile.firstName).toBe("Ada");
    expect(result.current.hasChanges).toBe(true);

    act(() => {
      result.current.handleDiscard();
    });
    expect(result.current.profile.location).toBe("London");
    expect(result.current.hasChanges).toBe(false);
    expect(toast.info).toHaveBeenCalledWith("Changes discarded");
  });

  it("commits a successful save as the new baseline", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, apiProfile))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    const { result } = renderHook(() => useProfilePageView(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.updateProfile("location", "Paris");
    });
    await act(async () => {
      await result.current.handleSave();
    });

    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/profile",
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(result.current.isSaving).toBe(false);
    expect(result.current.profile.location).toBe("Paris");
    expect(result.current.hasChanges).toBe(false);
    expect(toast.success).toHaveBeenCalledWith("Profile saved");
  });

  it("surfaces the API error message when saving fails", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, apiProfile))
      .mockResolvedValueOnce(jsonResponse(400, { error: "Bio is too short" }));
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { result } = renderHook(() => useProfilePageView(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.updateProfile("location", "Paris");
    });
    await act(async () => {
      await result.current.handleSave();
    });

    expect(toast.error).toHaveBeenCalledWith("Bio is too short");
    expect(result.current.isSaving).toBe(false);
    expect(result.current.hasChanges).toBe(true);
    consoleError.mockRestore();
  });

  it("exposes a load failure as fetchError and toasts once", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(500, { error: "Profile service unavailable" }),
    );

    const { result } = renderHook(() => useProfilePageView(), {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(result.current.fetchError).toBe("Profile service unavailable"),
    );
    expect(result.current.isLoading).toBe(false);
    expect(toast.error).toHaveBeenCalledWith("Profile service unavailable");
    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});
