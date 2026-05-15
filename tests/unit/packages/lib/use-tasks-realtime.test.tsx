/**
 * @vitest-environment jsdom
 */
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useTasks } from "../../../../packages/lib/hooks/use-tasks";

const mocks = vi.hoisted(() => {
  const channel = {
    on: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  };

  const supabase = {
    channel: vi.fn(() => channel),
    removeChannel: vi.fn(),
  };

  return { channel, supabase };
});

vi.mock("@asym/database/supabase", () => ({
  createBrowserClient: () => mocks.supabase,
}));

vi.mock("../../../../packages/lib/hooks/use-auth", () => ({
  useAuth: () => ({ profile: { id: "missionary-1" } }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

function TasksProbe() {
  useTasks({ autoFetch: false });
  return null;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.channel.on.mockReturnValue(mocks.channel);
  mocks.channel.subscribe.mockReturnValue(mocks.channel);
  vi.stubGlobal("fetch", vi.fn());
});

describe("useTasks server boundary", () => {
  it("does not open a browser Supabase realtime channel", () => {
    const { unmount } = render(<TasksProbe />);

    expect(mocks.supabase.channel).not.toHaveBeenCalled();
    expect(mocks.channel.on).not.toHaveBeenCalled();

    unmount();

    expect(mocks.supabase.removeChannel).not.toHaveBeenCalled();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
