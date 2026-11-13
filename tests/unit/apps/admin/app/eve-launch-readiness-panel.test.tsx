/** @vitest-environment jsdom */

/**
 * The launch readiness panel is the only human surface for the Eve release
 * gate, so these tests cover the two operator states that are easy to break:
 * the first-run state that has no imported manifest yet, and the post-launch
 * state where the release gate must be closable without declaring an emergency.
 *
 * The panel is wrapped in the repo's own `QueryProvider` so the provider and
 * the panel share one `@tanstack/react-query` module instance.
 */

import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Exercise the admin page at its public UI boundary.
import { EveLaunchReadinessPanel } from "../../../../../apps/admin/app/(app)/admin/eve/launch-readiness-panel";
import { getQueryClient } from "../../../../../packages/database/providers/query-client";
import { QueryProvider } from "../../../../../packages/database/providers/query-provider";

const CLEARED_GOVERNANCE = {
  emergencyOff: false,
  policyStatus: "ready",
  releaseEnabled: false,
  stateVersion: 12,
};

const DISABLE_RELEASE_LABEL = "Disable release (no emergency)";

const PLATFORM_OWNERS = [
  {
    id: "43700000-0000-4000-8000-000000000002",
    email: "ada.owner@example.org",
    first_name: "Ada",
    full_name: "Ada Owner",
    last_name: "Owner",
    role: "super_admin",
  },
  {
    id: "43700000-0000-4000-8000-000000000003",
    email: "grace@example.org",
    first_name: null,
    full_name: null,
    last_name: null,
    role: "super_admin",
  },
];

function readinessBody(governance: Record<string, unknown>) {
  return {
    canActivate: false,
    canReview: false,
    governance,
    manifests: [],
    requestId: "43700000-0000-4000-8000-000000000099",
  };
}

function stubReadinessFetch(
  governance: Record<string, unknown>,
  people: { ok: boolean; users?: unknown[] } = {
    ok: true,
    users: PLATFORM_OWNERS,
  },
) {
  const fetchMock = vi.fn(async (url: string, _init?: RequestInit) => {
    if (String(url).startsWith("/api/admin/users")) {
      return {
        ok: people.ok,
        json: async () =>
          people.ok
            ? { users: people.users ?? [] }
            : { error: "Forbidden: requires one of admin role" },
      };
    }
    return { ok: true, json: async () => readinessBody(governance) };
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function choosePlatformOwner(
  view: ReturnType<typeof renderPanel>,
  search: string,
  optionName: RegExp,
) {
  const picker = await view.findByRole("combobox", {
    name: "Platform owner",
  });
  await waitFor(() =>
    expect(picker.getAttribute("aria-disabled")).not.toBe("true"),
  );
  fireEvent.click(picker);
  const searchBox = await view.findByRole("combobox", {
    name: "Search platform owners by name or email",
  });
  fireEvent.change(searchBox, { target: { value: search } });
  fireEvent.click(await view.findByRole("option", { name: optionName }));
}

function renderPanel() {
  return render(<EveLaunchReadinessPanel />, { wrapper: QueryProvider });
}

beforeEach(() => {
  getQueryClient().clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  getQueryClient().clear();
});

describe("Eve launch readiness panel", () => {
  it("announces an in-flight control change and prevents duplicate submission", async () => {
    let finishMutation: () => void = () => {};
    const pendingMutation = new Promise<void>((resolve) => {
      finishMutation = resolve;
    });
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method === "POST") await pendingMutation;
      return {
        ok: true,
        json: async () => ({
          canActivate: false,
          canReview: false,
          governance: CLEARED_GOVERNANCE,
          manifests: [],
        }),
      };
    });
    vi.stubGlobal("fetch", fetchMock);
    const view = renderPanel();
    await view.findByText("Latest manifest");
    fireEvent.change(
      view.getByRole("textbox", { name: "Reason for this change" }),
      {
        target: { value: "Planned maintenance" },
      },
    );
    const action = view.getByRole("button", { name: "Emergency off" });
    fireEvent.click(action);
    expect(await view.findByRole("status")).toHaveProperty(
      "textContent",
      "Updating launch readiness…",
    );
    expect(view.getByRole("status").closest('[aria-busy="true"]')).toBeNull();
    expect(action.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(action);
    expect(
      fetchMock.mock.calls.filter(([, init]) => init?.method === "POST"),
    ).toHaveLength(1);
    await act(async () => finishMutation());
    await waitFor(() => expect(view.queryByRole("status")).toBeNull());
  });

  it("keeps the control reason available before any manifest is imported", async () => {
    stubReadinessFetch(CLEARED_GOVERNANCE);
    const view = renderPanel();

    // Loaded state, still with zero manifests.
    await view.findByText("Latest manifest");
    expect(
      view.queryByRole("heading", { name: "Two-person review" }),
    ).toBeNull();

    const reason = view.getByRole("textbox", {
      name: "Reason for this change",
    });
    const emergencyOff = view.getByRole("button", { name: "Emergency off" });
    expect((emergencyOff as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(reason, { target: { value: "Planned first-run stop" } });

    expect((emergencyOff as HTMLButtonElement).disabled).toBe(false);
    expect(
      (
        view.getByRole("button", {
          name: "Grant: Can review launch evidence",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);

    await choosePlatformOwner(view, "Ada", /Ada Owner/);

    expect(
      (
        view.getByRole("button", {
          name: "Grant: Can review launch evidence",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
  });

  it("says launch permissions can only go to a platform owner", async () => {
    // grant_eve_launch_permission asserts the receiving profile is a
    // super_admin, so the form must say so before the server refuses.
    stubReadinessFetch(CLEARED_GOVERNANCE);
    const view = renderPanel();

    await view.findByText("Latest manifest");

    expect(
      await view.findByRole("combobox", { name: "Platform owner" }),
    ).toBeTruthy();
    expect(
      view.getByText(/can only be given to another platform owner/),
    ).toBeTruthy();
  });

  it("lists platform owners by name and email and grants with the same payload", async () => {
    const fetchMock = stubReadinessFetch(CLEARED_GOVERNANCE);
    const view = renderPanel();

    await view.findByText("Latest manifest");
    // Only platform owners are eligible, so the picker asks for exactly them.
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).startsWith("/api/admin/users?role=super_admin"),
      ),
    ).toBe(true);

    fireEvent.change(
      view.getByRole("textbox", { name: "Reason for this change" }),
      { target: { value: "Second reviewer for launch" } },
    );
    // Searching by email finds a person who has no name on file.
    await choosePlatformOwner(view, "grace@", /grace@example\.org/);
    fireEvent.click(
      view.getByRole("button", { name: "Grant: Can switch Eve on" }),
    );

    await waitFor(() =>
      expect(
        fetchMock.mock.calls.filter(([, init]) => init?.method === "POST"),
      ).toHaveLength(1),
    );
    const post = fetchMock.mock.calls.find(
      ([, init]) => init?.method === "POST",
    );
    expect(post?.[0]).toBe("/api/admin/eve/launch-readiness");
    expect(JSON.parse(String(post?.[1]?.body))).toEqual({
      kind: "permission",
      enabled: true,
      permission: "release.activate",
      profileId: "43700000-0000-4000-8000-000000000003",
      reason: "Second reviewer for launch",
    });
  });

  it("names permissions in plain words, not code identifiers", async () => {
    stubReadinessFetch(CLEARED_GOVERNANCE);
    const view = renderPanel();

    await view.findByText("Latest manifest");
    await view.findByRole("combobox", { name: "Platform owner" });

    expect(view.queryByText(/release\.(review|activate)/)).toBeNull();
    for (const name of [
      "Grant: Can review launch evidence",
      "Revoke: Can review launch evidence",
      "Grant: Can switch Eve on",
      "Revoke: Can switch Eve on",
    ]) {
      expect(view.getByRole("button", { name })).toBeTruthy();
    }
  });

  it("falls back to a profile ID field when the people list cannot load", async () => {
    const fetchMock = stubReadinessFetch(CLEARED_GOVERNANCE, { ok: false });
    const view = renderPanel();

    await view.findByText("Latest manifest");
    const idField = await view.findByRole("textbox", {
      name: "Platform owner's profile ID",
    });
    expect(
      view.getByText(/could not load the list of platform owners/i),
    ).toBeTruthy();

    fireEvent.change(
      view.getByRole("textbox", { name: "Reason for this change" }),
      { target: { value: "Recovering access" } },
    );
    fireEvent.change(idField, {
      target: { value: " 43700000-0000-4000-8000-000000000002 " },
    });
    fireEvent.click(
      view.getByRole("button", { name: "Revoke: Can review launch evidence" }),
    );

    await waitFor(() =>
      expect(
        fetchMock.mock.calls.filter(([, init]) => init?.method === "POST"),
      ).toHaveLength(1),
    );
    const post = fetchMock.mock.calls.find(
      ([, init]) => init?.method === "POST",
    );
    expect(JSON.parse(String(post?.[1]?.body))).toEqual({
      kind: "permission",
      enabled: false,
      permission: "release.review",
      profileId: "43700000-0000-4000-8000-000000000002",
      reason: "Recovering access",
    });
  });

  it("explains where to find a profile ID and retries the people list", async () => {
    const people: { ok: boolean; users?: unknown[] } = { ok: false };
    const fetchMock = stubReadinessFetch(CLEARED_GOVERNANCE, people);
    const view = renderPanel();

    await view.findByRole("textbox", { name: "Platform owner's profile ID" });
    // Plain guidance on where the ID lives, not just a bare UUID box.
    expect(view.getByText(/copy it from Authentication > Users/i)).toBeTruthy();
    const retry = view.getByRole("button", {
      name: "Load platform owners again",
    });

    people.ok = true;
    people.users = PLATFORM_OWNERS;
    await act(async () => {
      fireEvent.click(retry);
    });

    const picker = await view.findByRole("combobox", {
      name: "Platform owner",
    });
    expect(picker).toBeTruthy();
    expect(
      view.queryByRole("textbox", { name: "Platform owner's profile ID" }),
    ).toBeNull();
    expect(
      fetchMock.mock.calls.filter(([url]) =>
        String(url).startsWith("/api/admin/users"),
      ),
    ).toHaveLength(2);
  });

  it("draws unavailable release controls as outlines, not filled buttons", async () => {
    stubReadinessFetch(CLEARED_GOVERNANCE);
    const view = renderPanel();

    await view.findByText("Latest manifest");

    // No manifest has been imported, so activation stays unavailable.
    const activate = view.getByRole("button", {
      name: "Activate this deployment",
    });
    const emergencyOff = view.getByRole("button", { name: "Emergency off" });
    expect(activate.getAttribute("data-variant")).toBe("outline");
    expect(emergencyOff.getAttribute("data-variant")).toBe("outline");

    fireEvent.change(
      view.getByRole("textbox", { name: "Reason for this change" }),
      { target: { value: "Planned first-run stop" } },
    );

    expect(emergencyOff.getAttribute("data-variant")).toBe("destructive");
    expect(activate.getAttribute("data-variant")).toBe("outline");
  });

  it("offers a non-emergency release disable while release is enabled", async () => {
    stubReadinessFetch({ ...CLEARED_GOVERNANCE, releaseEnabled: true });
    const view = renderPanel();

    await view.findByText("Latest manifest");

    expect(
      view.getByRole("button", { name: DISABLE_RELEASE_LABEL }),
    ).toBeTruthy();
  });

  it("hides the release disable control when release is already off", async () => {
    stubReadinessFetch(CLEARED_GOVERNANCE);
    const view = renderPanel();

    await view.findByText("Latest manifest");

    expect(
      view.queryByRole("button", { name: DISABLE_RELEASE_LABEL }),
    ).toBeNull();
    expect(view.getByRole("button", { name: "Emergency off" })).toBeTruthy();
  });

  it("gives launch status pills tones that match what they mean", async () => {
    stubReadinessFetch({ ...CLEARED_GOVERNANCE, emergencyOff: false });
    const view = renderPanel();

    await view.findByText("Latest manifest");
    const tone = (label: string) =>
      view
        .getByText(label)
        .parentElement?.querySelector('[data-slot="badge"]')
        ?.getAttribute("data-variant");

    expect(view.queryByText("Release")).toBeNull();
    expect(view.queryByText("Emergency")).toBeNull();
    // No runtime target in the response, so setup is incomplete.
    expect(tone("Runtime target")).toBe("warning");
    expect(tone("Latest manifest")).toBe("outline");
  });
});
