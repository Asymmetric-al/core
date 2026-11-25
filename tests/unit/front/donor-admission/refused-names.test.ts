import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  D_A,
  D_B,
  donorRequest,
  expectRefused,
  READY_B,
  REFUSED_PROBES,
  resetOnMode,
  UNKNOWN,
  USER_D,
} from "./fixtures";

import type { Answer } from "./fixtures";

const state = vi.hoisted(() => ({
  userId: null as string | null,
  rows: [] as unknown[],
  refreshCookie: true,
  sessionReads: 0,
  lookups: [] as string[],
  lookupClients: 0,
  offMode: false,
  answer: (() => ({ data: [], error: null })) as (
    host: string,
    callIndex: number,
  ) => Answer,
}));

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://example.supabase.co",
    key: "anon-key",
    keyType: "anon",
  }),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: {
      cookies: {
        setAll: (
          cookies: Array<{ name: string; value: string }>,
          headers: Record<string, string>,
        ) => void;
      };
    },
  ) => ({
    auth: {
      getUser: async () => {
        state.sessionReads += 1;
        if (state.refreshCookie) {
          options.cookies.setAll([{ name: "sb-refreshed", value: "fresh" }], {
            "Cache-Control": "private, no-store",
          });
        }
        return { data: { user: state.userId ? { id: state.userId } : null } };
      },
    },
    rpc: async (fn: string) => {
      if (fn !== "current_user_assignments") throw new Error(fn);
      return { data: state.rows, error: null };
    },
  }),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => {
    if (state.offMode) {
      throw new Error("no lookup client when the switch is off");
    }
    state.lookupClients += 1;
    return {
      rpc: (fn: string, args: { p_host: string }) => {
        if (fn !== "resolve_verified_host") throw new Error(fn);
        state.lookups.push(args.p_host);
        const answer = state.answer(args.p_host, state.lookups.length);
        return { abortSignal: () => Promise.resolve(answer) };
      },
    };
  },
}));

const donorModule = await import("../../../../apps/donor/proxy");

beforeEach(() => {
  resetOnMode(state);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("on: refused names return 404 no-store with empty body, no Set-Cookie and zero session reads", () => {
  for (const host of [UNKNOWN, READY_B]) {
    it.each(REFUSED_PROBES)(`${host}: %s`, async (label, path, init) => {
      state.userId = USER_D;
      state.rows = [D_A, D_B];
      const response = await donorModule.proxy(donorRequest(host, path, init));
      await expectRefused(response, `${host} ${label}`);
      expect(state.sessionReads).toBe(0);
      expect(state.lookups).toEqual([host]);
    });
  }
});
