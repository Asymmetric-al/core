/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useRef } from "react";
import {
  ShellNavigationProvider,
  useShellNavigation,
  useStudioDirtyState,
  useStudioFullscreen,
} from "../../../../apps/admin/components/studio/shell-navigation-guard";
const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  push.mockReset();
});
function Editor({
  dirty = true,
  fullscreen = false,
}: {
  dirty?: boolean;
  fullscreen?: boolean;
}) {
  useStudioDirtyState(dirty);
  const root = useRef<HTMLDivElement>(null);
  useStudioFullscreen(fullscreen, root);
  const { requestAction } = useShellNavigation();
  return (
    <div ref={root} tabIndex={-1}>
      <a href="/crm">CRM</a>
      <button onClick={() => requestAction(() => push("/reports"))}>
        Search result
      </button>
    </div>
  );
}
describe("shell editor navigation", () => {
  it("confirms links and page-search commands, and lets staff keep editing", async () => {
    const view = render(
      <ShellNavigationProvider>
        <Editor />
      </ShellNavigationProvider>,
    );
    fireEvent.click(view.getByRole("link", { name: "CRM" }));
    expect(view.getByRole("alertdialog").textContent).toContain(
      "Discard unsaved changes?",
    );
    fireEvent.click(view.getByRole("button", { name: "Keep editing" }));
    expect(push).not.toHaveBeenCalled();
    fireEvent.click(view.getByRole("button", { name: "Search result" }));
    fireEvent.click(view.getByRole("button", { name: "Discard changes" }));
    await waitFor(() =>
      expect(push).toHaveBeenCalledExactlyOnceWith("/reports"),
    );
  });
  it("leaves modified links alone and stops prompting once saved", () => {
    const view = render(
      <ShellNavigationProvider>
        <Editor />
      </ShellNavigationProvider>,
    );
    fireEvent.click(view.getByRole("link", { name: "CRM" }), { ctrlKey: true });
    expect(view.queryByRole("alertdialog")).toBeNull();
    view.rerender(
      <ShellNavigationProvider>
        <Editor dirty={false} />
      </ShellNavigationProvider>,
    );
    fireEvent.click(view.getByRole("button", { name: "Search result" }));
    expect(push).toHaveBeenCalledWith("/reports");
  });
  it("restores a blocked history traversal before asking to discard", () => {
    const go = vi.spyOn(history, "go").mockImplementation(() => {});
    const view = render(
      <ShellNavigationProvider>
        <Editor />
      </ShellNavigationProvider>,
    );
    history.pushState({}, "", "/email");
    fireEvent.popState(window, {
      state: { ...history.state, coreShellIndex: 0 },
    });
    expect(go).toHaveBeenCalledWith(1);
    fireEvent.popState(window, {
      state: { ...history.state, coreShellIndex: 1 },
    });
    expect(view.getByRole("alertdialog")).toBeTruthy();
    fireEvent.click(view.getByRole("button", { name: "Discard changes" }));
    expect(go).toHaveBeenLastCalledWith(-1);
  });
  it("does not overwrite a later framework history wrapper during cleanup", () => {
    const originalPush = history.pushState;
    try {
      const view = render(
        <ShellNavigationProvider>
          <Editor dirty={false} />
        </ShellNavigationProvider>,
      );
      const wrappedPush = history.pushState;
      const frameworkPush: History["pushState"] = function (data, unused, url) {
        wrappedPush.call(this, data, unused, url);
      };
      history.pushState = frameworkPush;
      view.unmount();
      expect(history.pushState).toBe(frameworkPush);
      history.pushState({}, "", "/crm");
      expect(history.state.coreShellIndex).toBeUndefined();
    } finally {
      history.pushState = originalPush;
    }
  });

  it("moves focus into fullscreen and restores the previous control on exit", () => {
    const view = render(
      <ShellNavigationProvider>
        <button>Full screen</button>
        <Editor dirty={false} />
      </ShellNavigationProvider>,
    );
    const trigger = view.getByRole("button", { name: "Full screen" });
    trigger.focus();
    view.rerender(
      <ShellNavigationProvider>
        <button>Full screen</button>
        <Editor dirty={false} fullscreen />
      </ShellNavigationProvider>,
    );
    expect(
      document.activeElement?.contains(view.getByRole("link", { name: "CRM" })),
    ).toBe(true);
    view.rerender(
      <ShellNavigationProvider>
        <button>Full screen</button>
        <Editor dirty={false} />
      </ShellNavigationProvider>,
    );
    expect(document.activeElement).toBe(trigger);
  });
});
