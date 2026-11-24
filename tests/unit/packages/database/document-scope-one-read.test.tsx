// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Last read of the first release, L1: one decision per send. A wrapper that
 * asked "retired?" and then read the scope in a second step, which checked
 * the signed-in person again itself, sent a request with no scope when the
 * session changed between the two reads: the very request JR1 stops. Each
 * wrapper now reads once and acts on that one answer, so no request ever
 * leaves a document that fixed a scope without it.
 *
 * The person each cookie read sees is scripted: a queue of answers, then the
 * real reader.
 */

const reads = vi.hoisted(() => ({
  queue: [] as Array<string | null | undefined>,
}));
vi.mock(
  "../../../../packages/database/document-session",
  async (importOriginal) => {
    const real =
      await importOriginal<
        typeof import("../../../../packages/database/document-session")
      >();
    return {
      ...real,
      readBrowserSessionUserId: () =>
        reads.queue.length > 0
          ? reads.queue.shift()
          : real.readBrowserSessionUserId(),
    };
  },
);
const reloadDocument = vi.hoisted(() => vi.fn());
vi.mock(
  "../../../../packages/database/document-reload",
  async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return {
      ...actual,
      reloadDocument,
      loadDocument: vi.fn(),
    };
  },
);

const TENANT = "00000000-0000-0000-0000-000000000001";
const PERSON_A = "00000000-0000-4000-8000-0000000000a1";
const PERSON_B = "00000000-0000-4000-8000-0000000000b2";
const SCOPE = {
  userId: PERSON_A,
  tenantId: TENANT,
  assignmentId: "00000000-0000-4000-8000-000000000101",
  addressPrefix: `/${TENANT}`,
};

const fetchMock = vi.fn(async () => Response.json({}));

function sentHeaders(): Headers[] {
  return fetchMock.mock.calls.map((call) => {
    const [input, init] = call as unknown as [
      RequestInfo | URL,
      RequestInit | undefined,
    ];
    return new Headers(
      init?.headers ?? (input instanceof Request ? input.headers : undefined),
    );
  });
}

async function load() {
  vi.resetModules();
  const scope = await import("../../../../packages/database/document-scope");
  const ownApi = await import("../../../../packages/database/own-api");
  const browser = await import("../../../../packages/database/supabase/client");
  return { ...scope, ...ownApi, createBrowserClient: browser.createClient };
}

async function renderScopedPage(mod: Awaited<ReturnType<typeof load>>) {
  // The page fixes its scope while person A is signed in.
  reads.queue.push(PERSON_A);
  render(
    <mod.DocumentScopeProvider scope={SCOPE}>
      <p>care rows</p>
    </mod.DocumentScopeProvider>,
  );
}

beforeEach(() => {
  reads.queue.length = 0;
  reloadDocument.mockReset();
  fetchMock.mockClear();
  vi.stubGlobal("fetch", fetchMock);
  window.sessionStorage.clear();
  window.history.replaceState(null, "", `/${TENANT}/care`);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.history.replaceState(null, "", "/");
});

describe("one decision per send", () => {
  it("ownApiFetch: a session that changes between two cookie reads never sends the request without its scope", async () => {
    const mod = await load();
    await renderScopedPage(mod);

    // The first read sees person A, any later one person B.
    reads.queue.push(PERSON_A, PERSON_B, PERSON_B, PERSON_B);
    await act(async () => {
      await mod.ownApiFetch("/api/donor/settings", {
        method: "PATCH",
        body: "{}",
      });
    });

    for (const headers of sentHeaders()) {
      expect(headers.get("x-asym-assignment")).toBe(SCOPE.assignmentId);
      expect(headers.get("x-asym-tenant")).toBe(TENANT);
    }
  });

  it("the Data API fetch: the same", async () => {
    const mod = await load();
    await renderScopedPage(mod);
    const supabase = mod.createBrowserClient();

    reads.queue.push(PERSON_A, PERSON_B, PERSON_B, PERSON_B);
    await act(async () => {
      await supabase
        .from("donor_settings")
        .update({ theme: "dark" })
        .eq("id", 1);
    });

    const dataApi = fetchMock.mock.calls
      .map((call, index) => [String((call as unknown[])[0]), index] as const)
      .filter(([url]) => url.includes("/rest/v1/"));
    for (const [, index] of dataApi) {
      expect(sentHeaders()[index]!.get("x-asym-assignment")).toBe(
        SCOPE.assignmentId,
      );
    }
  });

  it("a person who changed at the send's one read: no network call", async () => {
    const mod = await load();
    await renderScopedPage(mod);

    reads.queue.push(PERSON_B, PERSON_B, PERSON_B);
    let response: Response | undefined;
    await act(async () => {
      response = await mod.ownApiFetch("/api/donor/settings", {
        method: "PATCH",
        body: "{}",
      });
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(response?.headers.get("x-asym-scope-refused")).toBe("retired");
  });
});
