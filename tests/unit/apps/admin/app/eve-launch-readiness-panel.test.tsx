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
import { EveLaunchReadinessPanel } from "../../../../../apps/admin/app/(app)/settings/eve/launch-readiness-panel";
import { getQueryClient } from "../../../../../packages/database/providers/query-client";
import { QueryProvider } from "../../../../../packages/database/providers/query-provider";

const CLEARED_GOVERNANCE = {
  emergencyOff: false,
  policyStatus: "ready",
  releaseEnabled: false,
  stateVersion: 12,
};

const DISABLE_RELEASE_LABEL = "Disable release (no emergency)";

const OPERATORS_URL = "/api/admin/eve/launch-readiness/operators";

const PLATFORM_OPERATORS = [
  {
    id: "43700000-0000-4000-8000-000000000002",
    displayName: "Ada Operator",
    email: "ada.operator@example.org",
  },
  {
    id: "43700000-0000-4000-8000-000000000003",
    displayName: null,
    email: "grace@example.org",
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

type PeopleAnswer = { status: number; operators?: unknown[] };

function stubReadinessFetch(
  governance: Record<string, unknown>,
  people: PeopleAnswer = { status: 200, operators: PLATFORM_OPERATORS },
) {
  const fetchMock = vi.fn(async (url: string, _init?: RequestInit) => {
    if (String(url).startsWith(OPERATORS_URL)) {
      const ok = people.status >= 200 && people.status < 300;
      return {
        ok,
        status: people.status,
        json: async () =>
          ok
            ? { operators: people.operators ?? [] }
            : {
                error:
                  people.status === 403
                    ? "Forbidden: requires a platform operator whose session passed a second factor"
                    : "Internal error",
              },
      };
    }
    return {
      ok: true,
      status: 200,
      json: async () => readinessBody(governance),
    };
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function choosePlatformOperator(
  view: ReturnType<typeof renderPanel>,
  search: string,
  optionName: RegExp,
) {
  const picker = await view.findByRole("combobox", {
    name: "Platform operator",
  });
  await waitFor(() =>
    expect(picker.getAttribute("aria-disabled")).not.toBe("true"),
  );
  fireEvent.click(picker);
  const searchBox = await view.findByRole("combobox", {
    name: "Search platform operators by name or email",
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

describe("Eve launch readiness panel (D-18: AL-2675 WP2c rest, pull request A: the picker asks the operator route, not role=super_admin, which listed nobody, and says platform operator)", () => {
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

    await choosePlatformOperator(view, "Ada", /Ada Operator/);

    expect(
      (
        view.getByRole("button", {
          name: "Grant: Can review launch evidence",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
  });

  it("says launch permissions can only go to a platform operator who belongs to this organization", async () => {
    // grant_eve_launch_permission accepts only a platform operator with a
    // live row in the tenant, so the form says so before the server refuses.
    stubReadinessFetch(CLEARED_GOVERNANCE);
    const view = renderPanel();

    await view.findByText("Latest manifest");

    const picker = await view.findByRole("combobox", {
      name: "Platform operator",
    });
    expect(picker.getAttribute("aria-describedby")).toBeTruthy();
    expect(
      view.getByText(
        "Only platform operators who belong to this organization are listed.",
      ).id,
    ).toBe(picker.getAttribute("aria-describedby"));
    expect(
      view.getByText(/can only be given to another platform operator/),
    ).toBeTruthy();
    expect(view.queryByText(/platform owner/i)).toBeNull();
  });

  it("lists the organization's platform operators by name and email and grants with the same payload", async () => {
    const fetchMock = stubReadinessFetch(CLEARED_GOVERNANCE);
    const view = renderPanel();

    await view.findByText("Latest manifest");
    // Only the operators the grant accepts here are eligible, never all users.
    expect(
      fetchMock.mock.calls.some(([url]) => String(url) === OPERATORS_URL),
    ).toBe(true);
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).startsWith("/api/admin/users"),
      ),
    ).toBe(false);

    fireEvent.change(
      view.getByRole("textbox", { name: "Reason for this change" }),
      { target: { value: "Second reviewer for launch" } },
    );
    // Searching by email finds a person who has no name on file.
    await choosePlatformOperator(view, "grace@", /grace@example\.org/);
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
    await view.findByRole("combobox", { name: "Platform operator" });

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

  it("says when no platform operator belongs to the organization, and offers no one", async () => {
    stubReadinessFetch(CLEARED_GOVERNANCE, { status: 200, operators: [] });
    const view = renderPanel();

    await view.findByText("Latest manifest");
    const picker = await view.findByRole("combobox", {
      name: "Platform operator",
    });
    await waitFor(() =>
      expect(
        view.getByText("No platform operators belong to this organization."),
      ).toBeTruthy(),
    );
    expect(
      picker.hasAttribute("disabled") ||
        picker.hasAttribute("data-disabled") ||
        picker.getAttribute("aria-disabled") === "true",
    ).toBe(true);
    expect(view.queryAllByRole("option")).toHaveLength(0);
    expect(
      view.queryByRole("textbox", { name: "Platform operator's profile ID" }),
    ).toBeNull();
  });

  it("shows only the non-operator sentence when the route refuses (403): no picker, no profile ID field, no retry", async () => {
    stubReadinessFetch(CLEARED_GOVERNANCE, { status: 403 });
    const view = renderPanel();

    await view.findByText("Latest manifest");
    expect(
      await view.findByText(
        "Only a platform operator can grant launch permissions.",
      ),
    ).toBeTruthy();
    expect(
      view.queryByRole("combobox", { name: "Platform operator" }),
    ).toBeNull();
    expect(view.queryByRole("textbox", { name: /profile ID/i })).toBeNull();
    expect(
      view.queryByRole("button", { name: "Load platform operators again" }),
    ).toBeNull();
    expect(
      view.queryByText(/No platform operators belong to this organization/),
    ).toBeNull();
    expect(view.queryByText(/could not load/i)).toBeNull();
  });

  it("falls back to a profile ID field when the people list cannot load", async () => {
    const fetchMock = stubReadinessFetch(CLEARED_GOVERNANCE, { status: 500 });
    const view = renderPanel();

    await view.findByText("Latest manifest");
    const idField = await view.findByRole("textbox", {
      name: "Platform operator's profile ID",
    });
    expect(
      view.getByText(/could not load the list of platform operators/i),
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
    const people: PeopleAnswer = { status: 500 };
    const fetchMock = stubReadinessFetch(CLEARED_GOVERNANCE, people);
    const view = renderPanel();

    await view.findByRole("textbox", {
      name: "Platform operator's profile ID",
    });
    // Plain guidance on where the ID lives, not just a bare UUID box.
    expect(view.getByText(/copy it from Authentication > Users/i)).toBeTruthy();
    const retry = view.getByRole("button", {
      name: "Load platform operators again",
    });

    people.status = 200;
    people.operators = PLATFORM_OPERATORS;
    await act(async () => {
      fireEvent.click(retry);
    });

    const picker = await view.findByRole("combobox", {
      name: "Platform operator",
    });
    expect(picker).toBeTruthy();
    expect(
      view.queryByRole("textbox", { name: "Platform operator's profile ID" }),
    ).toBeNull();
    expect(
      fetchMock.mock.calls.filter(([url]) => String(url) === OPERATORS_URL),
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

describe("Eve launch evidence import form", () => {
  it("ties the reason hint to the reason field", async () => {
    stubReadinessFetch(CLEARED_GOVERNANCE);
    const view = renderPanel();
    await view.findByText("Latest manifest");
    const reason = view.getByRole("textbox", {
      name: "Reason for this change",
    });
    expect(
      document.getElementById(reason.getAttribute("aria-describedby") ?? "")
        ?.textContent,
    ).toContain("Every button below needs a reason");
  });

  it.each([
    ["", "Paste the signed-off launch evidence."],
    ["{not json", "The launch evidence must be valid JSON."],
  ])(
    "reports evidence %j on the field instead of importing it",
    async (value, message) => {
      const fetchMock = stubReadinessFetch(CLEARED_GOVERNANCE);
      const view = renderPanel();
      await view.findByText("Latest manifest");
      const evidence = view.getByRole("textbox", {
        name: "Signed-off launch evidence (JSON)",
      });
      fireEvent.change(evidence, { target: { value } });
      const submit = view.getByRole("button", { name: "Validate and import" });
      expect(submit.hasAttribute("disabled")).toBe(false);
      expect(submit.getAttribute("type")).toBe("submit");

      await act(async () => {
        fireEvent.click(submit);
      });

      expect(evidence.getAttribute("aria-invalid")).toBe("true");
      expect(
        document.getElementById(evidence.getAttribute("aria-describedby") ?? "")
          ?.textContent,
      ).toBe(message);
      expect(document.activeElement).toBe(evidence);
      expect(
        fetchMock.mock.calls.filter(([, init]) => init?.method === "POST"),
      ).toHaveLength(0);

      fireEvent.change(evidence, { target: { value: "{}" } });
      expect(evidence.hasAttribute("aria-invalid")).toBe(false);
    },
  );

  it("imports valid evidence through the form", async () => {
    const fetchMock = stubReadinessFetch(CLEARED_GOVERNANCE);
    const view = renderPanel();
    await view.findByText("Latest manifest");
    const evidence = view.getByRole("textbox", {
      name: "Signed-off launch evidence (JSON)",
    });
    fireEvent.change(evidence, {
      target: { value: '{"schemaVersion":"eve-launch-manifest-v1"}' },
    });
    fireEvent.submit(evidence);
    await waitFor(() => {
      const post = fetchMock.mock.calls.find(
        ([, init]) => init?.method === "POST",
      );
      expect(JSON.parse(String(post?.[1]?.body))).toMatchObject({
        kind: "manifest",
        document: { schemaVersion: "eve-launch-manifest-v1" },
      });
    });
  });
});
