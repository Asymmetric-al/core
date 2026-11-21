// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterAll, beforeAll, expect, it, vi } from "vitest";

/**
 * Last read of the first release, L1: Web Studio's document fetch decides
 * once per call. Asked "retired?" and then "which scope?" in two reads, a
 * session that changed between them sent Payload's REST call with no claims.
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
vi.mock("../../../../packages/database/document-reload", () => ({
  reloadDocument: vi.fn(),
  loadDocument: vi.fn(),
}));

const PERSON_A = "00000000-0000-4000-8000-0000000000c1";
const PERSON_B = "00000000-0000-4000-8000-0000000000c2";
const SCOPE = {
  userId: PERSON_A,
  tenantId: "00000000-0000-0000-0000-000000000002",
  assignmentId: "00000000-0000-4000-8000-0000000000b1",
  addressPrefix: "",
};

const sent: Headers[] = [];
const underlyingFetch = vi.fn(
  async (input: RequestInfo | URL, init?: RequestInit) => {
    sent.push(
      new Headers(
        init?.headers ?? (input instanceof Request ? input.headers : undefined),
      ),
    );
    return new Response("{}", { status: 200 });
  },
);
const originalFetch = window.fetch;

beforeAll(() => {
  window.history.replaceState(null, "", "/web-studio/collections/pages");
  window.fetch = underlyingFetch as typeof fetch;
  window.sessionStorage.clear();
});
afterAll(() => {
  cleanup();
  window.fetch = originalFetch;
});

it("a session that changes between two cookie reads never sends a REST call without the document's claims", async () => {
  const { WebStudioDocument } =
    await import("../../../../apps/admin/src/cms-ui/web-studio/shell/web-studio-document");
  reads.queue.push(PERSON_A);
  render(
    <WebStudioDocument
      scope={SCOPE}
      organization={{
        name: "Bravo Mission",
        canSwitch: true,
        missionControlHref: "/00000000-0000-0000-0000-000000000002",
      }}
    >
      <p>pages</p>
    </WebStudioDocument>,
  );

  reads.queue.push(PERSON_A, PERSON_B, PERSON_B, PERSON_B);
  await window.fetch("/web-studio/api/pages/7?draft=true", {
    method: "PATCH",
    body: "{}",
  });

  for (const headers of sent) {
    expect(headers.get("x-asym-assignment")).toBe(SCOPE.assignmentId);
    expect(headers.get("x-asym-tenant")).toBe(SCOPE.tenantId);
  }
});
