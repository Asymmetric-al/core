// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const reloadDocument = vi.hoisted(() => vi.fn());
vi.mock(
  "../../../../packages/database/document-reload",
  async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    reloadDocument,
  }),
);

const CLAIM = "x-asym-scope-generation";

const SCOPE = {
  userId: "00000000-0000-4000-8000-0000000000a1",
  tenantId: "00000000-0000-0000-0000-000000000001",
  assignmentId: "00000000-0000-4000-8000-000000000101",
  addressPrefix: "/00000000-0000-0000-0000-000000000001",
};
const AT_7 = { ...SCOPE, generation: 7 };
const AT_8 = { ...SCOPE, generation: 8 };

type Scope = typeof SCOPE & { generation?: number };

const fetchMock = vi.fn();

async function load() {
  vi.resetModules();
  const scope = await import("../../../../packages/database/document-scope");
  const own = await import("../../../../packages/database/own-api");
  return { ...scope, ...own };
}

function Probe({ label }: { label: string }) {
  return <p>{label}</p>;
}

async function fix(scope: Scope) {
  const loaded = await load();
  window.history.replaceState(null, "", `${scope.addressPrefix}/care`);
  const view = render(
    <loaded.DocumentScopeProvider scope={scope as never}>
      <Probe label="first" />
    </loaded.DocumentScopeProvider>,
  );
  return { ...loaded, view };
}

function sent(call = 0): Headers {
  return fetchMock.mock.calls[call]![1].headers as Headers;
}

beforeEach(() => {
  reloadDocument.mockReset();
  window.sessionStorage.clear();
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ownApiFetch sends the document's generation", () => {
  it("sends 7 from a scope at 7, beside the tenant and the row", async () => {
    const { ownApiFetch } = await fix(AT_7);
    await ownApiFetch("/api/admin/funds");
    expect(sent().get(CLAIM)).toBe("7");
    expect(sent().get("x-asym-tenant")).toBe(SCOPE.tenantId);
    expect(sent().get("x-asym-assignment")).toBe(SCOPE.assignmentId);
  });

  it("replaces a caller's value with the document's", async () => {
    const { ownApiFetch } = await fix(AT_7);
    await ownApiFetch("/api/admin/funds", {
      method: "POST",
      headers: { [CLAIM]: "6" },
    });
    expect(sent().get(CLAIM)).toBe("7");
  });

  it("sends none from a scope without a generation (guard)", async () => {
    const { ownApiFetch } = await fix(SCOPE);
    await ownApiFetch("/api/admin/funds");
    expect(sent().has(CLAIM)).toBe(false);
  });

  it("removes a caller's value from a scope without a generation and from a document with none", async () => {
    const scoped = await fix(SCOPE);
    await scoped.ownApiFetch("/api/admin/funds", { headers: { [CLAIM]: "6" } });
    expect(sent(0).has(CLAIM)).toBe(false);
    cleanup();
    const { ownApiFetch } = await load();
    await ownApiFetch("/api/auth/demo-account", {
      headers: { [CLAIM]: "6" },
    });
    expect(sent(1).has(CLAIM)).toBe(false);
  });

  it("retires the scope on the server's generation_mismatch: the next call is never sent (guard by reason)", async () => {
    const { ownApiFetch } = await fix(AT_7);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "x-asym-scope-refused": "generation_mismatch" },
      }),
    );
    const refused = await ownApiFetch("/api/admin/funds");
    expect(refused.headers.get("x-asym-scope-refused")).toBe(
      "generation_mismatch",
    );
    const next = await ownApiFetch("/api/admin/funds");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(next.status).toBe(401);
    expect(next.headers.get("x-asym-scope-refused")).toBe("retired");
  });
});

describe("a scope of another generation in the same document", () => {
  it("renders the notice and asks one reload when a provider at 8 reaches a document fixed at 7", async () => {
    const { DocumentScopeProvider, getDocumentScope } = await fix(AT_7);
    render(
      <DocumentScopeProvider scope={AT_8 as never}>
        <Probe label="second" />
      </DocumentScopeProvider>,
    );
    expect(screen.queryByText("second")).toBeNull();
    expect(reloadDocument).toHaveBeenCalledTimes(1);
    expect(getDocumentScope()).toEqual(AT_7);
  });

  it("renders the children of a second provider at 7 (guard)", async () => {
    const { DocumentScopeProvider } = await fix(AT_7);
    render(
      <DocumentScopeProvider scope={{ ...AT_7 } as never}>
        <Probe label="second" />
      </DocumentScopeProvider>,
    );
    expect(screen.getByText("second")).toBeTruthy();
    expect(reloadDocument).not.toHaveBeenCalled();
  });
});

describe("the Data API client's headers carry no generation (guard)", () => {
  it("sets only the tenant and the row from a scope at 7", async () => {
    const { applyRequestScopeHeaders, requestScopeHeaders } =
      await import("../../../../packages/database/request-scope-headers");
    expect(requestScopeHeaders(AT_7)).toEqual({
      "x-asym-tenant": SCOPE.tenantId,
      "x-asym-assignment": SCOPE.assignmentId,
    });
    const headers = applyRequestScopeHeaders(new Headers(), AT_7);
    expect([...headers.keys()].sort()).toEqual([
      "x-asym-assignment",
      "x-asym-tenant",
    ]);
  });
});
