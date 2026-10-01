// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeAll, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1894: App composer regression test at its public UI boundary.
import type { ComposeCardActions as ComposeCardActionsComponent } from "../../../../../apps/admin/app/(app)/feed/org-updates/page-client";

let ComposeCardActions: typeof ComposeCardActionsComponent;

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
    await import("../../../../../apps/admin/app/(app)/feed/org-updates/page-client");
  ComposeCardActions = module.ComposeCardActions;
});

afterEach(cleanup);

const renderActions = (
  overrides: Partial<React.ComponentProps<typeof ComposeCardActions>> = {},
) =>
  render(
    <ComposeCardActions
      selectedMedia={[]}
      isUploading={false}
      isPublishing
      pendingAction="publish"
      visibility="public"
      isDisabled
      onAddMedia={vi.fn()}
      onRemoveMedia={vi.fn()}
      onSetVisibility={vi.fn()}
      onSaveDraft={vi.fn()}
      onPublish={vi.fn()}
      {...overrides}
    />,
  );

it("keeps only publish focusable during a pending publish", () => {
  const onPublish = vi.fn();
  const onSaveDraft = vi.fn();
  renderActions({ pendingAction: "publish", onPublish, onSaveDraft });
  const publishButton = screen.getByRole("button", { name: "Publish update" });
  publishButton.focus();
  expect(document.activeElement).toBe(publishButton);
  fireEvent.click(publishButton);
  fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
  expect(onPublish).not.toHaveBeenCalled();
  expect(onSaveDraft).not.toHaveBeenCalled();

  expect(screen.getByRole("button", { name: "Publish update" })).toHaveProperty(
    "disabled",
    false,
  );
  expect(
    screen
      .getByRole("button", { name: "Publish update" })
      .getAttribute("aria-disabled"),
  ).toBe("true");
  expect(screen.getByRole("button", { name: "Save draft" })).toHaveProperty(
    "disabled",
    true,
  );
});

it("keeps only draft focusable during a pending draft save", () => {
  const onPublish = vi.fn();
  const onSaveDraft = vi.fn();
  renderActions({ pendingAction: "draft", onPublish, onSaveDraft });
  const draftButton = screen.getByRole("button", { name: "Save draft" });
  draftButton.focus();
  expect(document.activeElement).toBe(draftButton);
  fireEvent.click(draftButton);
  fireEvent.click(screen.getByRole("button", { name: "Publish update" }));
  expect(onPublish).not.toHaveBeenCalled();
  expect(onSaveDraft).not.toHaveBeenCalled();

  expect(screen.getByRole("button", { name: "Save draft" })).toHaveProperty(
    "disabled",
    false,
  );
  expect(
    screen
      .getByRole("button", { name: "Save draft" })
      .getAttribute("aria-disabled"),
  ).toBe("true");
  expect(screen.getByRole("button", { name: "Publish update" })).toHaveProperty(
    "disabled",
    true,
  );
});
