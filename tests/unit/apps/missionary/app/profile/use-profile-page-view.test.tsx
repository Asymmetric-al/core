/** @vitest-environment jsdom */

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import * as React from "react";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useProfilePageView } from "../../../../../../apps/missionary/app/profile/use-profile-page-view";
import { getQueryClient } from "../../../../../../packages/database/providers/query-client";
import { QueryProvider } from "../../../../../../packages/database/providers/query-provider";

import type { ProfileData } from "../../../../../../apps/missionary/app/profile/profile-model";

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

// profilePatchSchema treats avatarUrl/coverUrl as z.string().url().nullable().
// Empty string is "Invalid URL"; omit or null are accepted.
function isSchemaValidPhotoUrl(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value !== "string" || value.length === 0) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isSchemaValidPhotoPatch(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const record = body as Record<string, unknown>;
  return (
    isSchemaValidPhotoUrl(record.avatarUrl) &&
    isSchemaValidPhotoUrl(record.coverUrl)
  );
}

function patchInits(): RequestInit[] {
  return fetchMock.mock.calls.flatMap((call) => {
    const init = call[1];
    if (
      typeof init === "object" &&
      init !== null &&
      "method" in init &&
      init.method === "PATCH"
    ) {
      return [init];
    }
    return [];
  });
}

function patchBodies(): unknown[] {
  return patchInits().map((init) => JSON.parse(String(init.body)));
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

  it("persists a cover photo that is saved in the same tick as the upload", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, apiProfile));

    const { result } = renderHook(() => useProfilePageView(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const coverUrl = "https://cdn.example/new-cover.jpg";
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    // Profile Photos calls updateProfile(field, url); handleSave() in one
    // event. The save must read that pending edit, not the previous render.
    await act(async () => {
      result.current.updateProfile("coverUrl", coverUrl);
      await result.current.handleSave();
    });

    const body = patchBodies().at(-1);
    expect(body).toMatchObject({
      coverUrl,
      location: "London",
    });
    expect(isSchemaValidPhotoPatch(body)).toBe(true);
    expect(result.current.profile.coverUrl).toBe(coverUrl);
    expect(result.current.hasChanges).toBe(false);
    expect(toast.success).toHaveBeenCalledWith("Profile saved");
  });

  it("sends a schema-valid avatar-only PATCH when cover is empty", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, apiProfile));

    const { result } = renderHook(() => useProfilePageView(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const avatarUrl = "https://cdn.example/new-avatar.jpg";
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    await act(async () => {
      result.current.updateProfile("avatarUrl", avatarUrl);
      await result.current.handleSave();
    });

    const body = patchBodies().at(-1);
    expect(body).toMatchObject({ avatarUrl });
    expect(
      body &&
        typeof body === "object" &&
        "coverUrl" in body &&
        (body as { coverUrl: unknown }).coverUrl === "",
    ).toBe(false);
    expect(isSchemaValidPhotoPatch(body)).toBe(true);
    expect(result.current.profile.avatarUrl).toBe(avatarUrl);
    expect(result.current.hasChanges).toBe(false);
  });

  it("does not let an older overlapping photo save overwrite a newer one", async () => {
    const existingAvatar = "https://cdn.example/old-avatar.jpg";
    const existingCover = "https://cdn.example/old-cover.jpg";
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        profile: {
          ...apiProfile.profile,
          avatar_url: existingAvatar,
          missionary: {
            ...apiProfile.profile.missionary,
            cover_url: existingCover,
          },
        },
      }),
    );

    const { result } = renderHook(() => useProfilePageView(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const avatarUrl = "https://cdn.example/new-avatar.jpg";
    const coverUrl = "https://cdn.example/new-cover.jpg";
    const patchResolvers: Array<(value: Response) => void> = [];
    fetchMock.mockImplementation((input, init) => {
      if (
        typeof init === "object" &&
        init !== null &&
        "method" in init &&
        init.method === "PATCH"
      ) {
        return new Promise<Response>((resolve) => {
          patchResolvers.push(resolve);
        });
      }
      return Promise.resolve(jsonResponse(200, apiProfile));
    });

    let olderSave!: Promise<void>;
    act(() => {
      result.current.updateProfile("avatarUrl", avatarUrl);
      olderSave = result.current.handleSave();
    });

    act(() => {
      result.current.updateProfile("coverUrl", coverUrl);
      void result.current.handleSave();
    });

    // The older PATCH still includes the previous cover URL. If it were allowed
    // to stay in flight, a slower first response would restore that cover on
    // the server after the UI had already toasted the newer save.
    expect(patchResolvers).toHaveLength(1);
    expect(patchBodies()).toHaveLength(1);
    expect(patchBodies()[0]).toMatchObject({
      avatarUrl,
      coverUrl: existingCover,
    });

    await act(async () => {
      patchResolvers[0](jsonResponse(200, { ok: true }));
      await waitFor(() => expect(patchResolvers).toHaveLength(2));
    });

    expect(toast.success).not.toHaveBeenCalled();
    expect(patchBodies()[1]).toMatchObject({
      avatarUrl,
      coverUrl,
    });

    await act(async () => {
      patchResolvers[1](jsonResponse(200, { ok: true }));
      await olderSave;
    });

    const cached = getQueryClient().getQueryData<ProfileData>(["profile"]);
    expect(cached?.avatarUrl).toBe(avatarUrl);
    expect(cached?.coverUrl).toBe(coverUrl);
    expect(result.current.profile.avatarUrl).toBe(avatarUrl);
    expect(result.current.profile.coverUrl).toBe(coverUrl);
    expect(result.current.hasChanges).toBe(false);
    expect(patchInits()[0]?.signal?.aborted).toBe(false);
    expect(patchInits()[1]?.signal?.aborted).toBe(false);
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith("Profile saved");
  });

  it("aborts an in-flight save and restores the original profile on discard", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, apiProfile));

    const { result } = renderHook(() => useProfilePageView(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let resolveSave!: (value: Response) => void;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          resolveSave = resolve;
        }),
    );

    act(() => {
      result.current.updateProfile("location", "Paris");
    });

    let pendingSave!: Promise<void>;
    act(() => {
      pendingSave = result.current.handleSave();
    });

    expect(result.current.isSaving).toBe(true);

    act(() => {
      result.current.handleDiscard();
    });

    expect(patchInits()[0]?.signal?.aborted).toBe(true);
    expect(result.current.isSaving).toBe(false);
    expect(result.current.profile.location).toBe("London");
    expect(result.current.hasChanges).toBe(false);

    await act(async () => {
      resolveSave(jsonResponse(200, { ok: true }));
      await pendingSave;
    });

    expect(getQueryClient().getQueryData<ProfileData>(["profile"])).toEqual(
      result.current.profile,
    );
    expect(result.current.profile.location).toBe("London");
    expect(result.current.hasChanges).toBe(false);
    expect(toast.success).not.toHaveBeenCalledWith("Profile saved");
  });

  it("retries a queued photo save after the in-flight PATCH fails", async () => {
    const existingAvatar = "https://cdn.example/old-avatar.jpg";
    const existingCover = "https://cdn.example/old-cover.jpg";
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        profile: {
          ...apiProfile.profile,
          avatar_url: existingAvatar,
          missionary: {
            ...apiProfile.profile.missionary,
            cover_url: existingCover,
          },
        },
      }),
    );

    const { result } = renderHook(() => useProfilePageView(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const avatarUrl = "https://cdn.example/new-avatar.jpg";
    const coverUrl = "https://cdn.example/new-cover.jpg";
    const patchResolvers: Array<(value: Response) => void> = [];
    fetchMock.mockImplementation((input, init) => {
      if (
        typeof init === "object" &&
        init !== null &&
        "method" in init &&
        init.method === "PATCH"
      ) {
        return new Promise<Response>((resolve) => {
          patchResolvers.push(resolve);
        });
      }
      return Promise.resolve(jsonResponse(200, apiProfile));
    });
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    let olderSave!: Promise<void>;
    act(() => {
      result.current.updateProfile("avatarUrl", avatarUrl);
      olderSave = result.current.handleSave();
    });

    act(() => {
      result.current.updateProfile("coverUrl", coverUrl);
      void result.current.handleSave();
    });

    expect(patchResolvers).toHaveLength(1);

    await act(async () => {
      patchResolvers[0](jsonResponse(500, { error: "Save interrupted" }));
      await waitFor(() => expect(patchResolvers).toHaveLength(2));
    });

    expect(toast.error).not.toHaveBeenCalled();
    expect(patchBodies()[1]).toMatchObject({
      avatarUrl,
      coverUrl,
    });

    await act(async () => {
      patchResolvers[1](jsonResponse(200, { ok: true }));
      await olderSave;
    });

    const cached = getQueryClient().getQueryData<ProfileData>(["profile"]);
    expect(cached?.avatarUrl).toBe(avatarUrl);
    expect(cached?.coverUrl).toBe(coverUrl);
    expect(result.current.profile.coverUrl).toBe(coverUrl);
    expect(result.current.hasChanges).toBe(false);
    expect(toast.success).toHaveBeenCalledWith("Profile saved");
    expect(toast.error).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("does not discard edits typed while a save is in flight", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, apiProfile));

    const { result } = renderHook(() => useProfilePageView(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let resolveSave!: (value: Response) => void;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          resolveSave = resolve;
        }),
    );

    act(() => {
      result.current.updateProfile("location", "Paris");
    });

    let pendingSave!: Promise<void>;
    act(() => {
      pendingSave = result.current.handleSave();
    });

    act(() => {
      result.current.updateProfile("bio", "typed during save");
    });

    await act(async () => {
      resolveSave(jsonResponse(200, { ok: true }));
      await pendingSave;
    });

    expect(result.current.profile.location).toBe("Paris");
    expect(result.current.profile.bio).toBe("typed during save");
    expect(result.current.hasChanges).toBe(true);
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
