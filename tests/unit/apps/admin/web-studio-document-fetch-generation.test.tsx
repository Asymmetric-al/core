// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import path from "node:path";

import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const TA = "00000000-0000-0000-0000-000000000001";
const USER = "00000000-0000-4000-8000-0000000000c1";
const ROW = "00000000-0000-4000-8000-0000000000a1";
const CLAIM = "x-asym-scope-generation";
const FUNCTION_CLAIM = "x-asym-web-studio-generation";

const sent: Array<{ url: string; headers: Headers }> = [];
const ORIGINAL_FETCH = window.fetch;

function underlyingFetch() {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    sent.push({ url, headers: new Headers(init?.headers) });
    return new Response("{}", { status: 200 });
  }) as typeof fetch;
}

function forgetInstall() {
  Reflect.deleteProperty(window, Symbol.for("asym.webStudio.documentFetch"));
}

async function openStudio(generation: number | undefined) {
  vi.resetModules();
  forgetInstall();
  window.fetch = underlyingFetch();
  const { DocumentScopeProvider } =
    await import("../../../../packages/database/document-scope");
  const { WEB_STUDIO_SEGMENT } =
    await import("../../../../packages/auth/web-studio");
  const { installWebStudioDocumentFetch } =
    await import("../../../../apps/admin/src/cms-ui/web-studio/shell/web-studio-document-fetch");
  render(
    <DocumentScopeProvider
      scope={{
        userId: USER,
        tenantId: TA,
        assignmentId: ROW,
        addressPrefix: "",
        ...(generation === undefined ? {} : { generation }),
      }}
      segment={WEB_STUDIO_SEGMENT}
    >
      <p>Studio</p>
    </DocumentScopeProvider>,
  );
  installWebStudioDocumentFetch(window);
}

beforeEach(() => {
  sent.length = 0;
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  forgetInstall();
  window.fetch = ORIGINAL_FETCH;
});

describe("on: the Web Studio document sends the name's generation", () => {
  beforeEach(() => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
    window.history.replaceState(
      null,
      "",
      "/admin/web-studio/collections/pages",
    );
  });

  it("sends 7 on a REST call, replacing a caller's 6 (base: none sent, the caller's kept)", async () => {
    await openStudio(7);
    await window.fetch("/admin/web-studio/api/pages?limit=10", {
      headers: { [CLAIM]: "6" },
    });
    await window.fetch("/admin/web-studio/api/pages/1", { method: "PATCH" });
    expect(sent.map(({ headers }) => headers.get(CLAIM))).toEqual(["7", "7"]);
    expect(sent[0]!.headers.get("x-asym-tenant")).toBe(TA);
    expect(sent[0]!.headers.get("x-asym-assignment")).toBe(ROW);
  });

  it("sends 7 on a server function under Web Studio's own name, replacing a caller's 6 (base: none sent)", async () => {
    await openStudio(7);
    await window.fetch("/admin/web-studio/collections/pages/1", {
      method: "POST",
      headers: { "next-action": "act1", [FUNCTION_CLAIM]: "6" },
    });
    expect(sent).toHaveLength(1);
    expect(sent[0]!.headers.get(FUNCTION_CLAIM)).toBe("7");
    expect(sent[0]!.headers.get("x-asym-web-studio-tenant")).toBe(TA);
  });
});

describe("off: nothing is read or sent (guard)", () => {
  it("adds no generation to a REST call or a server function", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "0");
    vi.stubEnv("CORE_APP_BASE_PATH", "");
    window.history.replaceState(null, "", "/web-studio/collections/pages");
    await openStudio(undefined);
    await window.fetch("/web-studio/api/pages/1", { method: "PATCH" });
    await window.fetch("/web-studio/collections/pages/1", {
      method: "POST",
      headers: { "next-action": "act1" },
    });
    expect(sent).toHaveLength(2);
    expect(sent[0]!.headers.has(CLAIM)).toBe(false);
    expect(sent[1]!.headers.has(FUNCTION_CLAIM)).toBe(false);
  });
});

describe("the stock API view's link to the REST address", () => {
  async function marker(generation: number | undefined) {
    vi.resetModules();
    window.fetch = underlyingFetch();
    const { WebStudioDocument } =
      await import("../../../../apps/admin/src/cms-ui/web-studio/shell/web-studio-document");
    const { container } = render(
      <WebStudioDocument
        scope={{
          userId: USER,
          tenantId: TA,
          assignmentId: ROW,
          addressPrefix: "",
          ...(generation === undefined ? {} : { generation }),
        }}
        organization={{
          name: "Alpha Mission",
          canSwitch: false,
          missionControlHref: "/",
        }}
      >
        <p>Studio</p>
      </WebStudioDocument>,
    );
    return container.querySelector("[data-web-studio-scope]");
  }

  it("is not offered with the switch on: the document is marked, and the stylesheet hides the link there (base: offered)", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
    window.history.replaceState(
      null,
      "",
      "/admin/web-studio/collections/pages/1/api",
    );
    expect((await marker(7))?.getAttribute("data-web-studio-generation")).toBe(
      "7",
    );
    const css = readFileSync(
      path.join(
        process.cwd(),
        "apps/admin/src/cms-ui/web-studio/shell/studio-stock-views.css",
      ),
      "utf8",
    ).replace(/\s+/g, " ");
    expect(css).toContain(
      ":root:has([data-web-studio-generation]) .query-inspector__api-url-open-button { display: none; }",
    );
  });

  it("is offered with the switch off: no mark (guard)", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "0");
    window.history.replaceState(
      null,
      "",
      "/web-studio/collections/pages/1/api",
    );
    expect(
      (await marker(undefined))?.hasAttribute("data-web-studio-generation"),
    ).toBe(false);
  });
});
