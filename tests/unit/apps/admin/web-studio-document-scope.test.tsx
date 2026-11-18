// @vitest-environment jsdom
import {
  getDocumentScope,
  useDocumentScope,
} from "@asym/database/document-scope";
import { render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

/**
 * Each Web Studio document carries the tenant it was rendered for (plan 5.2;
 * AL-2675, WP2b slice C), as a document scope rendered through slice A's
 * `DocumentScopeProvider`, and every REST call it makes to Payload's routes
 * under `/web-studio/api` names that tenant and row. The server refuses one
 * that differs from the Web Studio cookie, so switching organization in
 * another tab never retargets an open form. Calls to Mission Control's own
 * `/api` routes are slice B's shared fetch wrapper's to scope, from the same
 * document scope; this leaves them alone.
 */

const TB = "00000000-0000-0000-0000-000000000002";
const SCOPE = {
  userId: "00000000-0000-4000-8000-0000000000c1",
  tenantId: TB,
  assignmentId: "00000000-0000-4000-8000-0000000000b1",
  addressPrefix: "",
};

const sent: Array<{ url: string; method: string; headers: Headers }> = [];
const underlyingFetch = vi.fn(
  async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    const fromRequest = input instanceof Request ? input.headers : undefined;
    sent.push({
      url,
      method: init?.method ?? (input instanceof Request ? input.method : "GET"),
      headers: new Headers(init?.headers ?? fromRequest),
    });
    return new Response("{}", { status: 200 });
  },
);
const originalFetch = window.fetch;

let WebStudioDocument: typeof import("../../../../apps/admin/src/cms-ui/web-studio/shell/web-studio-document").WebStudioDocument;
let useWebStudioOrganization: typeof import("../../../../apps/admin/src/cms-ui/web-studio/shell/web-studio-document").useWebStudioOrganization;

beforeAll(async () => {
  window.fetch = underlyingFetch as typeof fetch;
  ({ WebStudioDocument, useWebStudioOrganization } =
    await import("../../../../apps/admin/src/cms-ui/web-studio/shell/web-studio-document"));
});
afterAll(() => {
  window.fetch = originalFetch;
});

function Probe() {
  const scope = useDocumentScope();
  const organization = useWebStudioOrganization();
  return (
    <p>
      {scope?.tenantId} {organization?.name}
    </p>
  );
}

describe("a Web Studio document", () => {
  it("renders its scope through the document scope provider, with the organization for the chrome", () => {
    render(
      <WebStudioDocument
        scope={SCOPE}
        organization={{ name: "Bravo Mission", canSwitch: true }}
      >
        <Probe />
      </WebStudioDocument>,
    );

    expect(screen.getByText(`${TB} Bravo Mission`)).toBeTruthy();
    expect(getDocumentScope()).toEqual(SCOPE);
    expect(
      document
        .querySelector(`[data-web-studio-scope="${TB}"]`)
        ?.getAttribute("data-web-studio-assignment"),
    ).toBe(SCOPE.assignmentId);
  });

  it("names its tenant and row on every call to Payload's REST routes, writes and reads alike", async () => {
    sent.length = 0;
    await window.fetch("/web-studio/api/pages/7?draft=true", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
    await window.fetch(
      new Request(`${window.location.origin}/web-studio/api/media`, {
        method: "POST",
      }),
    );
    await window.fetch(
      new URL("/web-studio/api/cms-users/me", window.location.origin),
    );

    expect(sent).toHaveLength(3);
    for (const call of sent) {
      expect(call.headers.get("x-asym-tenant"), call.url).toBe(TB);
      expect(call.headers.get("x-asym-assignment"), call.url).toBe(
        SCOPE.assignmentId,
      );
    }
    expect(sent[0]!.headers.get("content-type")).toBe("application/json");
  });

  it("leaves other addresses alone: Mission Control's API, pages and other origins", async () => {
    sent.length = 0;
    await window.fetch("/api/admin/missionaries?limit=200");
    await window.fetch("/web-studio/collections/pages");
    await window.fetch("https://elsewhere.example/web-studio/api/pages", {
      method: "POST",
    });
    await window.fetch("/web-studio/apis");

    expect(sent).toHaveLength(4);
    for (const call of sent) {
      expect(call.headers.get("x-asym-tenant"), call.url).toBeNull();
      expect(call.headers.get("x-asym-assignment"), call.url).toBeNull();
    }
  });

  it("wraps fetch once however often it renders", () => {
    const wrapped = window.fetch;
    render(
      <WebStudioDocument
        scope={SCOPE}
        organization={{ name: "Bravo Mission", canSwitch: true }}
      >
        <Probe />
      </WebStudioDocument>,
    );
    expect(window.fetch).toBe(wrapped);
  });
});
