// @vitest-environment jsdom
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useTasks } from "@asym/lib/hooks/use-tasks";
vi.mock("../../../../packages/lib/hooks/use-auth", () => ({
  useAuth: () => ({ profile: { id: "missionary-test" } }),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
describe("task fetch result lifecycle", () => {
  it("clears loading and exposes a network rejection through the non-throwing result boundary", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network unavailable")),
    );
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toContain("network unavailable");
    expect(result.current.tasks).toEqual([]);
  });
  it("clears loading for HTTP failures and preserves their readable error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "No task access" }), {
          status: 403,
        }),
      ),
    );
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("No task access");
  });
});
