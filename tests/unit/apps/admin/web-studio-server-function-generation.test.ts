import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  runForWebStudioDocument,
  webStudioServerFunctionRefusal,
} from "../../../../apps/admin/src/cms/web-studio-server-function";

import type { WebStudioSelectionState } from "../../../../apps/admin/src/cms/web-studio-access";

const TA = "00000000-0000-0000-0000-000000000001";
const ROW_A = "00000000-0000-4000-8000-0000000000a1";
const GENERATION = "x-asym-web-studio-generation";

const request = vi.hoisted(() => ({ headers: new Headers() }));
const access = vi.hoisted((): { selection: WebStudioSelectionState } => ({
  selection: { kind: "none" },
}));

vi.mock("next/headers", () => ({
  headers: async () => request.headers,
}));
vi.mock("../../../../apps/admin/src/cms/web-studio-access", () => ({
  readWebStudioSelection: async () => access.selection,
}));

function claims(generation?: string): Headers {
  const headers = new Headers({
    "x-asym-web-studio-tenant": TA,
    "x-asym-web-studio-assignment": ROW_A,
  });
  if (generation !== undefined) headers.set(GENERATION, generation);
  return headers;
}

const SELECTED = {
  kind: "selected",
  tenantId: TA,
  assignmentId: ROW_A,
  generation: 7,
} as const satisfies WebStudioSelectionState;

beforeEach(() => {
  access.selection = SELECTED;
});

describe("on: a server function carries the name's generation byte for byte", () => {
  it.each([
    ["6", "6"],
    ["7 and a no-break space", "7\u00a0"],
    ["07", "07"],
    ["7.0", "7.0"],
    ["no generation", undefined],
  ])(
    "refuses %s with scope_mismatch before any handler runs (base: run)",
    async (_label, generation) => {
      expect(webStudioServerFunctionRefusal(claims(generation), SELECTED)).toBe(
        "scope_mismatch",
      );
      request.headers = claims(generation);
      const handler = vi.fn(async () => "ran");
      const refused = await runForWebStudioDocument(handler).catch(
        (error: unknown) => error,
      );
      expect(handler).not.toHaveBeenCalled();
      expect((refused as { digest?: string }).digest).toMatch(
        /ASYM_WEB_STUDIO_REFUSAL;scope_mismatch/,
      );
    },
  );

  it("runs one with 7 and the cookie's tenant and row (guard)", async () => {
    request.headers = claims("7");
    const handler = vi.fn(async () => "ran");
    await expect(runForWebStudioDocument(handler)).resolves.toBe("ran");
    expect(handler).toHaveBeenCalledOnce();
  });
});

describe("off: a selection without a generation reads none (guard)", () => {
  it("runs one with tenant and row only, whatever generation the client sends", async () => {
    access.selection = { kind: "selected", tenantId: TA, assignmentId: ROW_A };
    for (const generation of [undefined, "6"]) {
      request.headers = claims(generation);
      const handler = vi.fn(async () => "ran");
      await expect(runForWebStudioDocument(handler)).resolves.toBe("ran");
    }
  });
});
