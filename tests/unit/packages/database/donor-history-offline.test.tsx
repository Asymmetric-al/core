/** @vitest-environment jsdom */
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";

import { useDonorHistoryTransactions } from "../../../../packages/database/hooks/donor-history";
import { onlineManager } from "../../../../packages/database/node_modules/@tanstack/react-query/build/modern/index.js";

/**
 * The device's connection, set on TanStack Query's online manager itself, so
 * it holds even before a mounted provider listens for the browser's events.
 */
function setOnline(online: boolean) {
  act(() => {
    onlineManager.setOnline(online);
  });
}

afterEach(() => {
  cleanup();
  setOnline(true);
});

// Giving history shows its skeleton while `isLoading`, so a first load that
// waits offline must read as loading, not as failed or as an empty history.
it("keeps a first load loading, not failed or empty, while it waits offline for the connection", async () => {
  setOnline(false);
  const { result } = renderHook(() => useDonorHistoryTransactions());
  // Long enough for a load that could run to answer.
  await act(() => new Promise((resolve) => setTimeout(resolve, 200)));
  expect(result.current.status).toBe("loading");
  expect(result.current.isLoading).toBe(true);
  expect(result.current.isError).toBe(false);
  expect(result.current.isReady).toBe(false);
  expect(result.current.data).toEqual([]);

  // The connection returns, so the load runs and answers.
  setOnline(true);
  await waitFor(() => expect(result.current.isReady).toBe(true));
  expect(result.current.isLoading).toBe(false);
  expect(result.current.isError).toBe(false);
  expect(result.current.data.length).toBeGreaterThan(0);
});
