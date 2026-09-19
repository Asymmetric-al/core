/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PublishedFeedPane } from "../../../../../../apps/missionary/app/feed/feed-support-ui";

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

vi.mock("@asym/lib/motion", () => ({
  motion: new Proxy(
    {},
    {
      get:
        (_target, tag: string) =>
        ({
          children,
          ...props
        }: React.PropsWithChildren<Record<string, unknown>>) =>
          React.createElement(tag, omitMotionProps(props), children),
    },
  ),
}));

vi.mock("@asym/ui/components/shadcn/button", () => ({
  Button: ({
    children,
    ...props
  }: React.PropsWithChildren<
    React.ButtonHTMLAttributes<HTMLButtonElement>
  >) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

afterEach(() => {
  cleanup();
});

describe("PublishedFeedPane", () => {
  it("shows a load error instead of the empty-feed copy", () => {
    render(
      <PublishedFeedPane
        feedError="Failed to load published posts (500)"
        hasPosts={false}
        isLoading={false}
        onRetry={() => undefined}
      >
        <div>published posts</div>
      </PublishedFeedPane>,
    );

    expect(
      screen.getByRole("heading", { name: /couldn't load your feed/i }),
    ).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toMatch(
      /failed to load published posts/i,
    );
    expect(screen.getByRole("button", { name: /try again/i })).toBeTruthy();
    expect(screen.queryByText(/your feed is empty/i)).toBeNull();
    expect(screen.queryByText("published posts")).toBeNull();
  });

  it("keeps a successful empty feed distinct from a failed load", () => {
    render(
      <PublishedFeedPane feedError={null} hasPosts={false} isLoading={false}>
        <div>published posts</div>
      </PublishedFeedPane>,
    );

    expect(
      screen.getByRole("heading", { name: /your feed is empty/i }),
    ).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByText(/couldn't load your feed/i)).toBeNull();
  });

  it("keeps last-good posts visible when a later refresh fails", () => {
    render(
      <PublishedFeedPane
        feedError="Failed to load published posts (500)"
        hasPosts
        isLoading={false}
      >
        <div>Hello partners</div>
      </PublishedFeedPane>,
    );

    expect(screen.getByText("Hello partners")).toBeTruthy();
    expect(screen.queryByText(/your feed is empty/i)).toBeNull();
    expect(screen.queryByText(/couldn't load your feed/i)).toBeNull();
  });
});
