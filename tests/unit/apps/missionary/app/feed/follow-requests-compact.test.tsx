/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import React, { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { FollowerRequestsCard } from "../../../../../../apps/missionary/app/feed/feed-follow-requests";

import type { FollowerRequest } from "../../../../../../apps/missionary/app/feed/feed-model";

const LONG_NAME =
  "Maria Fernanda de los Santos Rodríguez-Villanueva and family";

const request = (id: string, name: string): FollowerRequest => ({
  id,
  donor_id: `donor-${id}`,
  name,
  avatar_url: null,
  is_donor: false,
  access_level: "public",
  status: "pending",
  created_at: "2026-11-02T12:00:00.000Z",
  initials: name.slice(0, 2).toUpperCase(),
});

function Harness({ initial }: { initial: FollowerRequest[] }) {
  const [requests, setRequests] = useState(initial);
  return (
    <FollowerRequestsCard
      pendingRequests={requests}
      isLoadingRequests={false}
      onResolveRequest={(id) => {
        setRequests((prev) => prev.filter((item) => item.id !== id));
        return new Promise(() => {});
      }}
    />
  );
}

afterEach(cleanup);

describe("long names", () => {
  it("shows the whole name, wrapping instead of truncating", () => {
    render(<Harness initial={[request("r1", LONG_NAME)]} />);
    const name = screen.getByText(LONG_NAME);
    expect(name.className).not.toMatch(/\btruncate\b/);
    expect(name.className).toMatch(/\bwrap-break-word\b/);
    expect(
      screen.getByRole("listitem", { name: LONG_NAME }).textContent,
    ).toContain(LONG_NAME);
  });

  it("keeps Accept and Decline in the name’s column, side by side on phones", () => {
    render(<Harness initial={[request("r1", LONG_NAME)]} />);
    const name = screen.getByText(LONG_NAME);
    const accept = screen.getByRole("button", { name: `Accept ${LONG_NAME}` });
    const decline = screen.getByRole("button", {
      name: `Decline ${LONG_NAME}`,
    });
    const actions = accept.parentElement!;
    expect(decline.parentElement).toBe(actions);
    // Two equal columns on phones, so the buttons line up under the name
    // however long it is.
    expect(actions.className).toMatch(/\bgrid-cols-2\b/);
    // The name and the buttons share one column beside the avatar.
    const column = actions.parentElement!;
    expect(column.contains(name)).toBe(true);
    expect(column.className).toMatch(/\bmin-w-0\b/);
    expect(column.className).toMatch(/\bflex-1\b/);
  });
});

describe("compact on phones", () => {
  const two = [request("r1", "Logan Rivera"), request("r2", "Riley Walker")];

  it("starts as a short summary that still says people are waiting", () => {
    render(<Harness initial={two} />);
    const region = screen.getByRole("region", { name: "Follow requests" });
    expect(
      within(region).getByText("2 people are waiting for your answer."),
    ).toBeTruthy();

    const toggle = within(region).getByRole("button", {
      name: "Review requests",
    });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    // Only phones collapse: wide screens hide the toggle and always show
    // the list in the side column.
    expect(toggle.className).toMatch(/\blg:hidden\b/);

    const panel = document.getElementById(
      toggle.getAttribute("aria-controls")!,
    )!;
    expect(panel.contains(screen.getByRole("list"))).toBe(true);
    expect(panel.className).toMatch(/(^|\s)hidden(\s|$)/);
    expect(panel.className).toMatch(/\blg:block\b/);
    // The sentence carries the count; no badge repeats it.
    expect(within(region).queryByText("2", { exact: true })).toBeNull();
  });

  it("says one person in the singular", () => {
    render(<Harness initial={[request("r1", "Logan Rivera")]} />);
    expect(
      screen.getByText("1 person is waiting for your answer."),
    ).toBeTruthy();
  });

  it("expands to the full list and collapses again", () => {
    render(<Harness initial={two} />);
    const toggle = screen.getByRole("button", { name: "Review requests" });
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(toggle.textContent).toContain("Hide");
    const panel = document.getElementById(
      toggle.getAttribute("aria-controls")!,
    )!;
    expect(panel.className).not.toMatch(/(^|\s)hidden(\s|$)/);

    fireEvent.click(screen.getByRole("button", { name: "Hide requests" }));
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(panel.className).toMatch(/(^|\s)hidden(\s|$)/);
  });

  it("still moves focus to the next request, then the heading, once expanded", async () => {
    render(<Harness initial={two} />);
    fireEvent.click(screen.getByRole("button", { name: "Review requests" }));

    fireEvent.click(
      screen.getByRole("button", { name: "Accept Logan Rivera" }),
    );
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Accept Riley Walker" }),
      ),
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Decline Riley Walker" }),
    );
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("heading", { name: "Follow requests" }),
      ),
    );
    // With no one left there is nothing to review.
    expect(
      screen.queryByRole("button", { name: "Review requests" }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "Hide requests" })).toBeNull();
    expect(
      screen.getByText("No one is waiting. New requests will show up here."),
    ).toBeTruthy();
  });

  it("offers no toggle while loading or after a failed load", () => {
    render(
      <FollowerRequestsCard
        pendingRequests={two}
        isLoadingRequests
        onResolveRequest={async () => {}}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "Review requests" }),
    ).toBeNull();
    // Loading stays one line on phones; the skeleton rows belong to the side
    // column, so the feed below doesn't jump when requests arrive.
    const busy = document.querySelector('[aria-busy="true"]')!;
    const panel = busy.closest("[id]")!;
    expect(panel.className).toMatch(/(^|\s)hidden(\s|$)/);
    expect(panel.className).toMatch(/\blg:block\b/);
    cleanup();
    render(
      <FollowerRequestsCard
        pendingRequests={[]}
        isLoadingRequests={false}
        loadFailed
        onRetry={() => {}}
        onResolveRequest={async () => {}}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "Review requests" }),
    ).toBeNull();
    expect(screen.getByRole("alert").textContent).toContain(
      "We couldn’t load follow requests.",
    );
  });
});
