import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  isOperationsAddress,
  isOperatorAreaPath,
  OPERATOR_AREA_ROOT,
  operationsNamesFromEnv,
  resetOperatorAreaLogForTests,
} from "../../../packages/auth/operator-area";
import {
  isValidOperationsNamesEnv,
  normalizeHostText,
  parseOperationsNames,
} from "../../../packages/env/src/operations-names";

function headersOf(entries: Record<string, string>): Headers {
  return new Headers(entries);
}

const NAMES = ["ops.example:443"] as const;

describe("AL-2675 WP2c part 2a, T1: which paths are the operator area", () => {
  it("roots the area at /operator", () => {
    expect(OPERATOR_AREA_ROOT).toBe("/operator");
  });

  it.each([
    "/operator",
    "/operator/",
    "/operator/x",
    "/operator/x/y",
    "/%6Fperator",
    "/%6Fperator/x",
    "/operator%2Fx",
    "/operator/%E0%A4%A",
    "/%6Fperator/%E0%A4%A",
  ])("treats %s as the area, raw or decoded once", (pathname) => {
    expect(isOperatorAreaPath(pathname)).toBe(true);
  });

  it.each([
    "/",
    "/Operator",
    "/OPERATOR",
    "/%4Fperator",
    "/operators",
    "/operator-x",
    "/operator.json",
    "/admin/operator",
    "/x/operator",
    "/%252Foperator",
  ])("does not treat %s as the area", (pathname) => {
    expect(isOperatorAreaPath(pathname)).toBe(false);
  });
});

describe("AL-2675 WP2c part 2a, T1: which requests come from an operations address", () => {
  it.each([
    ["the listed host", "ops.example:443"],
    ["upper-case ASCII letters", "OPS.example:443"],
    ["ASCII spaces and tabs at both ends", " \tops.example:443\t "],
  ])("admits %s", (_label, host) => {
    expect(isOperationsAddress(headersOf({ host }), NAMES)).toBe(true);
  });

  it("admits an x-forwarded-host equal to the host by the same rule", () => {
    expect(
      isOperationsAddress(
        headersOf({
          host: "ops.example:443",
          "x-forwarded-host": " OPS.EXAMPLE:443",
        }),
        NAMES,
      ),
    ).toBe(true);
  });

  it.each([
    ["a trailing dot", "ops.example.:443"],
    ["no port", "ops.example"],
    ["another port", "ops.example:444"],
    ["a leading no-break space", " ops.example:443"],
    ["a trailing no-break space", "ops.example:443 "],
    ["a trailing line feed", "ops.example:443\n"],
    ["an ideographic space", "　ops.example:443"],
    ["the Kelvin sign, which toLowerCase() folds to k", "Kops.example:443"],
    ["a dotted capital I, which toLowerCase() folds", "İops.example:443"],
    ["a subdomain", "x.ops.example:443"],
    ["another name", "evil.example:443"],
    ["an empty host", ""],
  ])("refuses a host with %s", (_label, host) => {
    expect(isOperationsAddress(headersOf({ host }), NAMES)).toBe(false);
    expect(
      isOperationsAddress(headersOf({ host }), ["kops.example:443", ...NAMES]),
    ).toBe(false);
  });

  it("refuses a request with no host header", () => {
    expect(isOperationsAddress(headersOf({}), NAMES)).toBe(false);
  });

  it.each([
    ["names another host", "evil.example:443"],
    ["drops the port", "ops.example"],
    ["lists two hosts", "ops.example:443, evil.example:443"],
    ["is empty", ""],
  ])("refuses when x-forwarded-host %s", (_label, forwarded) => {
    expect(
      isOperationsAddress(
        headersOf({ host: "ops.example:443", "x-forwarded-host": forwarded }),
        NAMES,
      ),
    ).toBe(false);
  });

  it.each(["x-asym-front-stamp", "x-asym-front-origin"])(
    "refuses a listed host that carries %s, valid or not",
    (header) => {
      expect(
        isOperationsAddress(
          headersOf({ host: "ops.example:443", [header]: "" }),
          NAMES,
        ),
      ).toBe(false);
      expect(
        isOperationsAddress(
          headersOf({ host: "ops.example:443", [header]: "x" }),
          NAMES,
        ),
      ).toBe(false);
    },
  );

  it("admits no host at all when the list is empty", () => {
    expect(
      isOperationsAddress(headersOf({ host: "ops.example:443" }), []),
    ).toBe(false);
    expect(isOperationsAddress(headersOf({ host: "" }), [])).toBe(false);
  });

  it("strips only ASCII space and tab, and lower-cases only ASCII A-Z", () => {
    expect(normalizeHostText(" \tAbC.Example:80\t ")).toBe("abc.example:80");
    expect(normalizeHostText(" x ")).toBe(" x ");
    expect(normalizeHostText("\nx\r")).toBe("\nx\r");
    expect(normalizeHostText("KİÉ")).toBe("KİÉ");
  });
});

describe("AL-2675 WP2c part 2a, T1: which OPERATIONS_NAMES values are valid", () => {
  it.each([
    "ops.example",
    "ops.example:8443",
    "localhost:3130",
    "a.example,b.example",
    " a.example , b.example\t",
    "OPS.Example:443",
    "a-b.example:1",
  ])("accepts %s", (value) => {
    expect(isValidOperationsNamesEnv(value)).toBe(true);
  });

  it.each([
    "https://ops.example",
    "ops.example/x",
    "*.example",
    "ops..example",
    "ops.example.",
    ".ops.example",
    "ops.example:",
    "ops.example:123456",
    "ops.example:http",
    ":443",
    "ops example",
    "ops.examplé",
    "ops.example ",
    "[::1]:3130",
    "a.example,",
    "a.example,,b.example",
    ",",
    " ",
    "",
  ])("refuses %j", (value) => {
    expect(isValidOperationsNamesEnv(value)).toBe(false);
  });

  it("keeps the valid entries of a list with an invalid one, normalized", () => {
    expect(
      parseOperationsNames("OPS.example:443,https://evil.example, b.example"),
    ).toEqual({ names: ["ops.example:443", "b.example"], problem: "invalid" });
  });

  it("calls an unset or empty value missing, and a value with no valid entry invalid", () => {
    expect(parseOperationsNames(undefined)).toEqual({
      names: [],
      problem: "missing",
    });
    expect(parseOperationsNames("")).toEqual({ names: [], problem: "missing" });
    expect(parseOperationsNames("*.example")).toEqual({
      names: [],
      problem: "invalid",
    });
    expect(parseOperationsNames("ops.example")).toEqual({
      names: ["ops.example"],
      problem: null,
    });
  });
});

describe("AL-2675 WP2c part 2a, T1: OPERATIONS_NAMES read at run time", () => {
  let logged: unknown[][];

  beforeEach(() => {
    resetOperatorAreaLogForTests();
    logged = [];
    vi.spyOn(console, "error").mockImplementation((...args) => {
      logged.push(args);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetOperatorAreaLogForTests();
  });

  it("ignores an invalid entry, logs that the variable is invalid once, and names no value", () => {
    const env = {
      OPERATIONS_NAMES: "ops.example:443,https://secret-host.example/x",
    };
    expect(operationsNamesFromEnv(env)).toEqual(["ops.example:443"]);
    expect(operationsNamesFromEnv(env)).toEqual(["ops.example:443"]);
    expect(logged).toEqual([["[operator] OPERATIONS_NAMES is invalid"]]);
    expect(JSON.stringify(logged)).not.toContain("secret-host");
    expect(JSON.stringify(logged)).not.toContain("ops.example");
  });

  it.each([{}, { OPERATIONS_NAMES: "" }, { OPERATIONS_NAMES: undefined }])(
    "admits no host and logs missing once when the variable is %j",
    (env) => {
      expect(operationsNamesFromEnv(env)).toEqual([]);
      expect(operationsNamesFromEnv(env)).toEqual([]);
      expect(logged).toEqual([["[operator] OPERATIONS_NAMES is missing"]]);
      expect(
        isOperationsAddress(
          headersOf({ host: "localhost:3130" }),
          operationsNamesFromEnv(env),
        ),
      ).toBe(false);
    },
  );

  it("admits no host and logs invalid once when no entry is valid", () => {
    const env = { OPERATIONS_NAMES: "https://ops.example" };
    expect(operationsNamesFromEnv(env)).toEqual([]);
    expect(
      isOperationsAddress(
        headersOf({ host: "ops.example" }),
        operationsNamesFromEnv(env),
      ),
    ).toBe(false);
    expect(logged).toEqual([["[operator] OPERATIONS_NAMES is invalid"]]);
  });

  it("logs nothing for a valid list", () => {
    expect(
      operationsNamesFromEnv({ OPERATIONS_NAMES: "ops.example:443" }),
    ).toEqual(["ops.example:443"]);
    expect(logged).toEqual([]);
  });
});
