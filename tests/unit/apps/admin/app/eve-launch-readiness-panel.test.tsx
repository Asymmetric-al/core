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

function stubReadinessFetch(governance: Record<string, unknown>) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      json: async () => ({
        canActivate: false,
        canReview: false,
        governance,
        manifests: [],
        requestId: "43700000-0000-4000-8000-000000000099",
      }),
    })),
  );
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
      view.getByRole("textbox", { name: "Review or control reason" }),
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
      view.queryByRole("heading", { name: "Independent review" }),
    ).toBeNull();

    const reason = view.getByRole("textbox", {
      name: "Review or control reason",
    });
    const emergencyOff = view.getByRole("button", { name: "Emergency off" });
    expect((emergencyOff as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(reason, { target: { value: "Planned first-run stop" } });

    expect((emergencyOff as HTMLButtonElement).disabled).toBe(false);
    expect(
      (
        view.getByRole("button", {
          name: "Grant release.review",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);

    fireEvent.change(
      view.getByRole("textbox", { name: "Platform-owner profile ID" }),
      { target: { value: "43700000-0000-4000-8000-000000000002" } },
    );

    expect(
      (
        view.getByRole("button", {
          name: "Grant release.review",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
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
});
