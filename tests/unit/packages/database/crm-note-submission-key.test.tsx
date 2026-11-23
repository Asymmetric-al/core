/** @vitest-environment jsdom */

import { act, cleanup, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCreateLinkedCrmNote } from "../../../../packages/database/hooks/admin-crm-detail";
import { useAdminCrmNotesGrid } from "../../../../packages/database/hooks/admin-crm-notes";
import { getQueryClient } from "../../../../packages/database/providers/query-client";
import { QueryProvider } from "../../../../packages/database/providers/query-provider";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const LIST = {
  configured: true,
  filters: { search: null },
  hasMore: false,
  limit: 50,
  missing: [],
  mode: "local",
  nextCursor: null,
  rollback: { existingCrmPath: "/crm" },
  rows: [],
  sort: { direction: "desc", field: "updatedAt" },
};

let replies: Array<() => Promise<Response>> = [];
const posted: Array<{ key: string | null; body: unknown }> = [];

beforeEach(() => {
  getQueryClient().clear();
  replies = [];
  posted.length = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_path: string, init: RequestInit = {}) => {
      if (init.method !== "POST") return Response.json(LIST);
      posted.push({
        key: new Headers(init.headers).get("idempotency-key"),
        body: JSON.parse(String(init.body)),
      });
      const next = replies.shift();
      if (!next) throw new Error("no reply queued");
      return next();
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  getQueryClient().clear();
});

function Wrapper({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}

const saved = () =>
  Promise.resolve(Response.json({ note: { id: "note" } }, { status: 201 }));
const lost = () => Promise.reject(new TypeError("Failed to fetch"));

async function attempt(run: () => Promise<unknown>) {
  await act(async () => {
    await run().catch(() => undefined);
  });
}

describe("one submission key for each CRM note the screen submits", () => {
  it.each([
    [
      "the notes page",
      () => {
        const { result } = renderHook(() => useAdminCrmNotesGrid(), {
          wrapper: Wrapper,
        });
        return (input: { title: string; body: string }) =>
          result.current.createNote(input);
      },
    ],
    [
      "the record drawer",
      () => {
        const { result } = renderHook(
          () => useCreateLinkedCrmNote("record-1"),
          { wrapper: Wrapper },
        );
        return (input: { title: string; body: string }) =>
          result.current.mutateAsync({
            ...input,
            linkedRecordId: "record-1",
            linkedRecordType: "donor_profile",
          });
      },
    ],
  ])(
    "%s sends the same key when it retries a submission and a new one for the next",
    async (_screen, mount) => {
      const create = mount();
      const note = { title: "Visit", body: "Family is well." };
      replies.push(lost, saved, saved, lost, saved);
      await attempt(() => create(note));
      await attempt(() => create(note));
      await attempt(() => create(note));
      await attempt(() => create({ ...note, body: "Changed" }));
      await attempt(() => create({ ...note, body: "Changed again" }));
      const keys = posted.map((post) => post.key);
      expect(keys).toHaveLength(5);
      for (const key of keys) expect(key).toMatch(UUID);
      expect(keys[1]).toBe(keys[0]);
      expect(keys[2]).not.toBe(keys[1]);
      expect(keys[3]).not.toBe(keys[2]);
      expect(keys[4]).not.toBe(keys[3]);
      for (const post of posted)
        expect(post.body).not.toHaveProperty("idempotencyKey");
    },
  );
});
