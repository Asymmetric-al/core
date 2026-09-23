// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import React from "react";
import { afterEach, beforeAll, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1894: App composer regression test at its public UI boundary.
import type { PostComposerActions as PostComposerActionsComponent } from "../../../../apps/missionary/app/feed/worker-feed-page-client";

let PostComposerActions: typeof PostComposerActionsComponent;

vi.mock("@asym/lib/motion", async () => {
  const ReactModule = await import("react");
  const omitMotionProps = (props: Record<string, unknown>) => {
    const {
      animate,
      exit,
      initial,
      transition,
      whileHover,
      whileTap,
      ...domProps
    } = props;
    void animate;
    void exit;
    void initial;
    void transition;
    void whileHover;
    void whileTap;
    return domProps;
  };

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    LayoutGroup: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    motion: {
      create:
        (Component: React.ComponentType<React.PropsWithChildren>) =>
        ({
          children,
          ...props
        }: React.PropsWithChildren<Record<string, unknown>>) =>
          ReactModule.createElement(
            Component,
            omitMotionProps(props),
            children,
          ),
      div: ({
        children,
        ...props
      }: React.PropsWithChildren<Record<string, unknown>>) =>
        ReactModule.createElement("div", omitMotionProps(props), children),
    },
  };
});

vi.mock("next/dynamic", () => ({
  default: () =>
    function DynamicPlaceholder() {
      return null;
    },
}));

vi.mock("@asym/ui/components/shadcn/dropdown-menu", async () => {
  const ReactModule = await import("react");

  return {
    DropdownMenu: ({ children }: React.PropsWithChildren) =>
      ReactModule.createElement("div", null, children),
    DropdownMenuContent: ({ children }: React.PropsWithChildren) =>
      ReactModule.createElement("div", null, children),
    DropdownMenuItem: ({
      children,
      ...props
    }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) =>
      ReactModule.createElement("div", props, children),
    DropdownMenuSeparator: () => ReactModule.createElement("hr"),
    DropdownMenuTrigger: ({
      render,
    }: {
      render: React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>;
    }) => render,
  };
});

beforeAll(async () => {
  const module =
    await import("../../../../apps/missionary/app/feed/worker-feed-page-client");
  PostComposerActions = module.PostComposerActions;
});

afterEach(cleanup);

const baseProps = {
  selectedMedia: [],
  lastSaved: null,
  isUploading: false,
  isSaving: false,
  postPrivacy: "public" as const,
  postActionDisabled: false,
  setSelectedMedia: vi.fn(),
  setPostPrivacy: vi.fn(),
  simulateUpload: vi.fn(async () => undefined),
};

it.each([
  {
    status: "draft" as const,
    name: "Save draft",
    pendingName: "Save draft",
    peerName: "Publish",
  },
  {
    status: "published" as const,
    name: "Publish",
    pendingName: "Publishing update",
    peerName: "Save draft",
  },
])(
  "keeps only the manual $status initiator focusable and preserves its callback",
  async ({ status, name, pendingName, peerName }) => {
    let finish!: () => void;
    const promise = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const handlePost = vi.fn(() => promise);
    const view = render(
      <PostComposerActions {...baseProps} handlePost={handlePost} />,
    );
    const button = screen.getByRole("button", { name, exact: true });
    button.focus();
    fireEvent.click(button);
    view.rerender(
      <PostComposerActions
        {...baseProps}
        isSaving
        postActionDisabled
        handlePost={handlePost}
      />,
    );
    const pendingButton = screen.getByRole("button", {
      name: pendingName,
      exact: true,
    });
    const peer = screen.getByRole("button", { name: peerName, exact: true });
    expect(document.activeElement).toBe(pendingButton);
    expect(pendingButton.getAttribute("aria-disabled")).toBe("true");
    expect(pendingButton).toHaveProperty("disabled", false);
    expect(peer).toHaveProperty("disabled", true);
    fireEvent.click(pendingButton);
    fireEvent.click(peer);
    expect(handlePost).toHaveBeenCalledExactlyOnceWith(status);
    await act(async () => {
      finish();
    });
    view.rerender(
      <PostComposerActions {...baseProps} handlePost={handlePost} />,
    );
    expect(screen.getByRole("button", { name, exact: true })).toHaveProperty(
      "disabled",
      false,
    );
  },
);

it("keeps both actions natively disabled during background saving without announcing publishing", () => {
  const handlePost = vi.fn();
  render(
    <PostComposerActions
      {...baseProps}
      isSaving
      postActionDisabled
      handlePost={handlePost}
    />,
  );
  const draft = screen.getByRole("button", { name: "Save draft" });
  const publish = screen.getByRole("button", { name: "Publish", exact: true });
  expect(draft).toHaveProperty("disabled", true);
  expect(publish).toHaveProperty("disabled", true);
  fireEvent.click(draft);
  fireEvent.click(publish);
  expect(handlePost).not.toHaveBeenCalled();
});

it("keeps prerequisite-disabled actions out of the tab order", () => {
  render(
    <PostComposerActions
      {...baseProps}
      postActionDisabled
      handlePost={vi.fn()}
    />,
  );
  expect(screen.getByRole("button", { name: "Save draft" })).toHaveProperty(
    "disabled",
    true,
  );
  expect(
    screen.getByRole("button", { name: "Publish", exact: true }),
  ).toHaveProperty("disabled", true);
});
