import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Payload's server functions in Web Studio (plan 5.2: "A save, upload or
 * publish whose tenant differs from the current cookie is refused with a
 * prompt to reload"; council on the joined release, JC2). They are server
 * actions posted to the page's own address, and they authenticate without a
 * REST request, so the REST check never saw them. The Payload layout runs
 * each through this check first: the document's claims (its tenant and row,
 * sent by the document's fetch hook) must name the row the Web Studio cookie
 * selects now, or the call is refused before any of Payload's handlers runs,
 * with the refusal the REST path gives, which the document recognizes and
 * asks the person to reload.
 */

const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const ROW_A = "00000000-0000-4000-8000-0000000000a1";
const ROW_B = "00000000-0000-4000-8000-0000000000b1";

const request = vi.hoisted(() => ({ headers: new Headers() }));
const access = vi.hoisted(() => ({
  selection: { kind: "selected", tenantId: "", assignmentId: "" } as
    | { kind: "selected"; tenantId: string; assignmentId: string }
    | { kind: "signed_out" }
    | { kind: "none" }
    | { kind: "unavailable" },
}));

vi.mock("next/headers", () => ({
  headers: async () => request.headers,
}));
vi.mock("../../../../apps/admin/src/cms/web-studio-access", () => ({
  readWebStudioSelection: async () => access.selection,
}));

const { runForWebStudioDocument, webStudioServerFunctionRefusal } =
  await import("../../../../apps/admin/src/cms/web-studio-server-function");

function claims(tenant?: string, assignment?: string): Headers {
  const headers = new Headers();
  if (tenant) headers.set("x-asym-web-studio-tenant", tenant);
  if (assignment) headers.set("x-asym-web-studio-assignment", assignment);
  return headers;
}

beforeEach(() => {
  access.selection = { kind: "selected", tenantId: TA, assignmentId: ROW_A };
  request.headers = claims(TA, ROW_A);
});

describe("which server function a Web Studio document may run", () => {
  // Last read of the first release, L3: rows that could not be read are an
  // ordinary failure, which the person can retry, never a refusal that asks
  // them to choose an organization again.
  it("fails, unrefused, when the person's rows cannot be read: no handler runs", async () => {
    access.selection = { kind: "unavailable" };
    const handler = vi.fn();
    const failed = await runForWebStudioDocument(handler).catch(
      (error: unknown) => error,
    );
    expect(handler).not.toHaveBeenCalled();
    expect(failed).toBeInstanceOf(Error);
    expect(
      String((failed as Error & { digest?: string }).digest ?? ""),
    ).not.toMatch(/ASYM_WEB_STUDIO_REFUSAL/);
    expect((failed as Error).message).toMatch(/try again/i);
  });

  it("runs one from a document rendered for the row the cookie selects", async () => {
    const handler = vi.fn(async () => ({ state: "ok" }));
    await expect(runForWebStudioDocument(handler)).resolves.toEqual({
      state: "ok",
    });
    expect(handler).toHaveBeenCalledOnce();
  });

  it.each([
    ["no claims at all", claims()],
    ["a tenant without its row", claims(TA)],
    ["a row without its tenant", claims(undefined, ROW_A)],
    ["the other organization", claims(TB, ROW_B)],
    ["another row of the same organization", claims(TA, ROW_B)],
  ])(
    "refuses one that names %s, before any handler runs",
    async (_label, headers) => {
      request.headers = headers;
      const handler = vi.fn();
      const refused = await runForWebStudioDocument(handler).catch(
        (error: unknown) => error,
      );
      expect(handler).not.toHaveBeenCalled();
      expect(refused).toBeInstanceOf(Error);
      expect((refused as Error & { digest?: string }).digest).toBe(
        "ASYM_WEB_STUDIO_REFUSAL;scope_mismatch",
      );
      expect((refused as Error).message).toBe(
        "This page was opened for a different organization. Reload the page to continue; nothing was saved.",
      );
    },
  );

  it("names an ended session and a missing choice as the REST path does", () => {
    expect(
      webStudioServerFunctionRefusal(claims(TA, ROW_A), { kind: "signed_out" }),
    ).toBe("no_session");
    expect(
      webStudioServerFunctionRefusal(claims(TA, ROW_A), { kind: "none" }),
    ).toBe("no_selection");
    expect(
      webStudioServerFunctionRefusal(claims(TA, ROW_A), {
        kind: "selected",
        tenantId: TA,
        assignmentId: ROW_A,
      }),
    ).toBeNull();
  });
});
