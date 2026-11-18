// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
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
      button: ({
        children,
        ...props
      }: React.PropsWithChildren<Record<string, unknown>>) =>
        ReactModule.createElement("button", omitMotionProps(props), children),
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
    DropdownMenuGroup: ({ children }: React.PropsWithChildren) =>
      ReactModule.createElement("div", null, children),
    DropdownMenuLabel: ({ children }: React.PropsWithChildren) =>
      ReactModule.createElement("div", null, children),
    DropdownMenuRadioGroup: ({ children }: React.PropsWithChildren) =>
      ReactModule.createElement("div", null, children),
    DropdownMenuRadioItem: ({ children }: React.PropsWithChildren) =>
      ReactModule.createElement("div", null, children),
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
  isSaving: false,
  postPrivacy: "public" as const,
  postActionDisabled: false,
  setSelectedMedia: vi.fn(),
  setPostPrivacy: vi.fn(),
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

it("names the attached-media removal action and preserves the remaining order", () => {
  const first = { url: "/test-first.png", type: "image" as const };
  const second = { url: "/test-second.png", type: "image" as const };
  const setSelectedMedia = vi.fn();
  render(
    <PostComposerActions
      {...baseProps}
      selectedMedia={[first, second]}
      setSelectedMedia={setSelectedMedia}
      handlePost={vi.fn()}
    />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Remove attached photo 1" }),
  );
  const update = setSelectedMedia.mock.calls[0]![0] as (
    items: (typeof first)[],
  ) => (typeof first)[];
  expect(update([first, second])).toEqual([second]);
});

type AttachedMedia = { url: string; type: "image" | "video" };

function AttachedMediaComposer({ initial }: { initial: AttachedMedia[] }) {
  const [media, setMedia] = React.useState(initial);
  return (
    <PostComposerActions
      {...baseProps}
      selectedMedia={media}
      setSelectedMedia={setMedia}
      handlePost={vi.fn()}
    />
  );
}

it("names each remove button after its photo", () => {
  render(
    <AttachedMediaComposer
      initial={[1, 2, 3].map((n) => ({
        url: `/test-${n}.png`,
        type: "image",
      }))}
    />,
  );
  for (const n of [1, 2, 3]) {
    expect(screen.getByAltText(`Attached photo ${n}`)).toBeTruthy();
    expect(
      screen.getByRole("button", { name: `Remove attached photo ${n}` }),
    ).toBeTruthy();
  }
});

it("keeps focus on a remove button, then the audience control, as photos are removed", async () => {
  render(
    <AttachedMediaComposer
      initial={[1, 2, 3].map((n) => ({
        url: `/test-${n}.png`,
        type: "image",
      }))}
    />,
  );
  const removeButton = (n: number) =>
    screen.getByRole("button", { name: `Remove attached photo ${n}` });

  // The next photo takes the removed one's place, so its button gets focus.
  removeButton(2).focus();
  fireEvent.click(removeButton(2));
  await waitFor(() => expect(document.activeElement).toBe(removeButton(2)));
  expect(screen.getByAltText("Attached photo 2").getAttribute("src")).toBe(
    "/test-3.png",
  );

  // With no next photo, the previous photo's button gets focus.
  fireEvent.click(removeButton(2));
  await waitFor(() => expect(document.activeElement).toBe(removeButton(1)));

  // With no photos left, focus moves to the audience control beside them.
  fireEvent.click(removeButton(1));
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: /Public/ }),
    ),
  );
  expect(screen.queryByAltText(/Attached photo/)).toBeNull();
});

it("offers no stand-in media control that attaches stock images", () => {
  // The composer's real image upload lives in the editor toolbar. The old
  // "Add media" action attached a random stock photo and reported a
  // successful upload, so it must not come back.
  render(<PostComposerActions {...baseProps} handlePost={vi.fn()} />);
  expect(screen.queryByRole("button", { name: "Add media" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Uploading media" })).toBeNull();
});
