/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React, { useState } from "react";
import { afterEach, expect, it } from "vitest";

import { FollowerRequestsCard } from "../../../../../../apps/missionary/app/feed/feed-follow-requests";

import type { FollowerRequest } from "../../../../../../apps/missionary/app/feed/feed-model";

const request = (
  id: string,
  name: string,
  isDonor: boolean,
): FollowerRequest => ({
  id,
  donor_id: `donor-${id}`,
  name,
  avatar_url: null,
  is_donor: isDonor,
  access_level: "public",
  status: "pending",
  created_at: "2026-11-02T12:00:00.000Z",
  initials: name.slice(0, 2).toUpperCase(),
});

/** Like the page: the row leaves at once, the server answers later. */
function Harness() {
  const [requests, setRequests] = useState([
    request("r1", "Logan Rivera", true),
    request("r2", "Riley Walker", false),
  ]);
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

it("moves focus to the next request while the server is still answering", async () => {
  render(<Harness />);
  const accept = screen.getByRole("button", { name: "Accept Logan Rivera" });
  accept.focus();
  fireEvent.click(accept);

  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Accept Riley Walker" }),
    ),
  );
});

it("says when each person asked", () => {
  render(<Harness />);
  const rows = screen.getAllByRole("listitem");
  expect(rows[0]?.textContent).toMatch(/Gives to you · Asked \S/);
  expect(rows[1]?.textContent).toMatch(/Riley Walker\s*Asked \S/);
});
