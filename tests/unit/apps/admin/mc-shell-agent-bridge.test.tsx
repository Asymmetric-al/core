/** @vitest-environment jsdom */

import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MCShell } from "../../../../apps/admin/app/mc-shell";
// eslint-disable-next-line no-restricted-imports -- AL-1864: Unit test of Mission Control's own Web Studio agent grant at its app boundary.
import { WEB_STUDIO_AGENT_PERMISSIONS } from "../../../../apps/admin/src/cms-ui/web-studio/agent-permissions";

import type { PropsWithChildren } from "react";

const shell = vi.hoisted(() => ({
  pathname: "/feed",
  bridgeProps: [] as unknown[],
}));
vi.mock("@asym/ui/components/primitives/agent-bridge", () => ({
  AgentBridge: (props: unknown) => {
    shell.bridgeProps.push(props);
    return <span data-testid="agent-bridge" />;
  },
}));
vi.mock("@asym/lib/mission-control/context", () => ({
  MCProvider: ({ children }: PropsWithChildren) => children,
  useMC: () => ({
    user: null,
    role: "admin",
    tenant: { id: "t1", name: "Give Hope", slug: "give-hope" },
    signOut: vi.fn(),
  }),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => shell.pathname,
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("../../../../apps/admin/app/eve/global-panel", () => ({
  EveGlobalPanel: () => null,
}));

beforeEach(() => {
  vi.stubGlobal("matchMedia", (media: string) => ({
    media,
    matches: false,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  shell.pathname = "/feed";
  shell.bridgeProps.length = 0;
});

describe("Mission Control agent bridge", () => {
  it("mounts one bridge that lets an agent reorder only the macro actions list", () => {
    const view = render(
      <MCShell>
        <h1>Content</h1>
      </MCShell>,
    );

    expect(view.getAllByTestId("agent-bridge")).toHaveLength(1);
    // No `confirm`: Mission Control has no approval prompt yet, so a step
    // marked `data-agent-confirm` stays with the person. Any other list, and
    // any other action, stays with the person too.
    expect(shell.bridgeProps).toStrictEqual([
      {
        allow: [
          {
            component: "sortable-list",
            label: "Macro actions",
            actions: ["move"],
          },
        ],
      },
    ]);
  });

  it("leaves Web Studio's bridge to the Payload layout, which serves those routes outside this shell", () => {
    shell.pathname = "/web-studio/collections/pages";
    const view = render(
      <MCShell>
        <h1>Content</h1>
      </MCShell>,
    );

    expect(view.getByRole("heading", { name: "Content" })).toBeTruthy();
    expect(view.queryAllByTestId("agent-bridge")).toHaveLength(0);
  });

  it("grants Web Studio's bridge only a move in the View menu's column order", () => {
    expect(WEB_STUDIO_AGENT_PERMISSIONS).toStrictEqual([
      { component: "sortable-list", label: "Column order", actions: ["move"] },
    ]);
  });
});
