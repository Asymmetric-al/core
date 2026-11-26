import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as requestHeaders from "../../../packages/auth/request-headers";

type Reading =
  | { kind: "off" }
  | { kind: "absent" }
  | { kind: "invalid" }
  | { kind: "valid"; generation: number };

const NAME_GENERATION = "x-asym-name-generation";
const SCOPE_GENERATION = "x-asym-scope-generation";
const TA = "00000000-0000-0000-0000-000000000001";

const api = requestHeaders as unknown as {
  NAME_GENERATION_HEADER: string;
  SCOPE_GENERATION_HEADER: string;
  PAGE_SCOPE_HEADERS: readonly string[];
  readNameGeneration: (headers: {
    get(name: string): string | null;
  }) => Reading;
  isNameGenerationRefused: (
    name: requestHeaders.NameTenantState,
    generation: Reading,
  ) => boolean;
};

function raw(value: string | null) {
  let reads = 0;
  return {
    headers: {
      get: (name: string) => {
        reads += 1;
        return name === NAME_GENERATION ? value : null;
      },
    },
    reads: () => reads,
  };
}

function on(basePath: string) {
  vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
  vi.stubEnv("CORE_APP_BASE_PATH", basePath);
}

beforeEach(() => on("/admin"));
afterEach(() => vi.unstubAllEnvs());

describe("the two generation headers", () => {
  it("names the trusted header and the document's claim", () => {
    expect(api.NAME_GENERATION_HEADER).toBe(NAME_GENERATION);
    expect(api.SCOPE_GENERATION_HEADER).toBe(SCOPE_GENERATION);
  });

  it("lists both among the headers a proxy removes from a client", () => {
    expect(api.PAGE_SCOPE_HEADERS).toContain(NAME_GENERATION);
    expect(api.PAGE_SCOPE_HEADERS).toContain(SCOPE_GENERATION);
  });
});

describe("readNameGeneration (index 6.1)", () => {
  it.each(["7", "10", "9007199254740991"])("reads %j as valid", (value) => {
    expect(api.readNameGeneration(raw(value).headers)).toEqual({
      kind: "valid",
      generation: Number(value),
    });
  });

  it.each([
    "",
    "0",
    "07",
    "+7",
    "-7",
    " 7",
    "7 ",
    "7.0",
    "1e3",
    "0x7",
    "7, 7",
    "٧",
    "７",
    "9007199254740992",
  ])("reads %j, untrimmed, as invalid", (value) => {
    expect(api.readNameGeneration(raw(value).headers)).toEqual({
      kind: "invalid",
    });
  });

  it("reads no header as absent", () => {
    expect(api.readNameGeneration(raw(null).headers)).toEqual({
      kind: "absent",
    });
  });

  it.each([undefined, "0"])(
    "answers off with the switch %j before reading any header",
    (value) => {
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", value);
      const source = raw("7");
      expect(api.readNameGeneration(source.headers)).toEqual({ kind: "off" });
      expect(source.reads()).toBe(0);
    },
  );
});

describe("isNameGenerationRefused", () => {
  const valid = { kind: "valid", tenantId: TA } as const;

  it.each(["/admin", "/missionary"])(
    "refuses an absent or invalid generation beside a valid name under %s",
    (basePath) => {
      on(basePath);
      expect(api.isNameGenerationRefused(valid, { kind: "absent" })).toBe(true);
      expect(api.isNameGenerationRefused(valid, { kind: "invalid" })).toBe(
        true,
      );
      expect(
        api.isNameGenerationRefused(valid, { kind: "valid", generation: 7 }),
      ).toBe(false);
    },
  );

  it("leaves an absent generation alone under the donor app's empty base, and still refuses an invalid one", () => {
    on("");
    expect(api.isNameGenerationRefused(valid, { kind: "absent" })).toBe(false);
    expect(api.isNameGenerationRefused(valid, { kind: "invalid" })).toBe(true);
  });

  it.each([
    [{ kind: "off" }, { kind: "off" }],
    [{ kind: "absent" }, { kind: "invalid" }],
    [{ kind: "invalid" }, { kind: "absent" }],
  ] as const)(
    "never refuses a generation without a valid name (%o)",
    (name, generation) => {
      expect(api.isNameGenerationRefused(name, generation)).toBe(false);
    },
  );
});
