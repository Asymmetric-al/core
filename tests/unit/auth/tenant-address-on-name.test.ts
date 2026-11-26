import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as address from "../../../packages/auth/tenant-address";
import * as decisions from "../../../packages/auth/tenant-address-decisions";

const TA = "00000000-0000-0000-0000-000000000001";
const TB = "6f1c2a4e-9b3d-4c5e-8f7a-0b1c2d3e4f5a";

type Module = Record<string, unknown>;
function fn<T extends (...args: never[]) => unknown>(
  module: Module,
  name: string,
): T {
  const value = module[name];
  expect(typeof value, `${name} is exported`).toBe("function");
  return value as T;
}

const parseSubRoleAddress = (pathname: string) =>
  fn<(p: string) => unknown>(address, "parseSubRoleAddress")(pathname);
const startsWithOrganizationId = (pathname: string) =>
  fn<(p: string) => boolean>(address, "startsWithOrganizationId")(pathname);
const refusesAddressOnName = (pathname: string, roleClass: string) =>
  fn<(p: string, r: string) => boolean>(address, "refusesAddressOnName")(
    pathname,
    roleClass,
  );
const nameAddressPrefix = (subRole: string | null) =>
  fn<(s: string | null) => string>(address, "nameAddressPrefix")(subRole);

beforeEach(() => {
  vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("on: a sub-role address", () => {
  it("reads /~<sub-role> as the prefix and the rest as the page", () => {
    expect(parseSubRoleAddress("/~finance/gifts")).toEqual({
      subRole: "finance",
      prefix: "/~finance",
      innerPathname: "/gifts",
    });
    expect(parseSubRoleAddress("/~member_care")).toEqual({
      subRole: "member_care",
      prefix: "/~member_care",
      innerPathname: "/",
    });
    expect(parseSubRoleAddress("/~development/")).toMatchObject({
      innerPathname: "/",
    });
  });

  it.each([
    ["another case", "/~Finance/gifts"],
    ["a prefix of a name", "/~fin/gifts"],
    ["a name and more", "/~finance_x/gifts"],
    ["a name joined by a tilde", "/~finance~development/gifts"],
    ["an encoded tilde", "/%7Efinance/gifts"],
    ["an encoded name", "/~%66inance/gifts"],
    ["a space before it", "/ ~finance/gifts"],
    ["a trailing space in the name", "/~finance /gifts"],
    ["no name", "/~/gifts"],
    ["an organization ID before it", `/${TA}~finance/gifts`],
    ["a second authority after it", "/~finance//evil.example"],
  ])("is not a sub-role address: %s", (_label, pathname) => {
    expect(parseSubRoleAddress(pathname)).toBeNull();
  });

  it("builds the prefix with no organization ID", () => {
    expect(nameAddressPrefix(null)).toBe("");
    expect(nameAddressPrefix("finance")).toBe("/~finance");
  });
});

describe("on: an organization ID at the start of the address", () => {
  it.each([
    ["the name's, lower case", `/${TA}/donors`],
    ["another's", `/${TB}/donors`],
    ["upper case", `/${TB.toUpperCase()}/x`],
    ["mixed case", `/${TB.slice(0, 9).toUpperCase()}${TB.slice(9)}`],
    ["bare", `/${TA}`],
    ["with a trailing slash", `/${TA}/`],
    ["before a tilde", `/${TA}~finance/x`],
    ["before an unknown tilde", `/${TA}~nobody`],
  ])("is an organization ID: %s", (_label, pathname) => {
    expect(startsWithOrganizationId(pathname)).toBe(true);
  });

  it.each([
    ["one character short", `/${TA.slice(1)}/x`],
    ["one character long", `/${TA}0/x`],
    ["not hex", `/${TA.replace("0", "g")}/x`],
    ["percent-encoded", `/%30${TA.slice(1)}/x`],
    ["not the first segment", `/donors/${TA}`],
    ["a page", "/donors"],
    ["the root", "/"],
  ])("is not an organization ID: %s", (_label, pathname) => {
    expect(startsWithOrganizationId(pathname)).toBe(false);
  });
});

describe("on: what is refused before any session read", () => {
  it.each([
    ["staff", `/${TA}/donors`],
    ["staff", `/${TB}/`],
    ["missionary", `/${TA}/feed`],
    ["staff", "/~finance/operator"],
    ["staff", "/~finance/%6Fperator"],
    ["staff", "/~finance/login"],
    ["staff", "/~finance/web-studio"],
    ["staff", "/~finance/web-studio/api/pages"],
    ["staff", "/~finance/api/x"],
    ["staff", "/~finance/choose-organization"],
    ["staff", "/~finance/auth/callback"],
    ["staff", "/~development/no-access"],
    ["missionary", "/~development/feed"],
    ["missionary", "/~development/login"],
    ["missionary", "/~development"],
  ])("%s: %s", (roleClass, pathname) => {
    expect(refusesAddressOnName(pathname, roleClass)).toBe(true);
  });

  it.each([
    ["staff", "/~finance/gifts"],
    ["staff", "/~finance"],
    ["staff", "/~member_care/donors"],
    ["staff", "/donors"],
    ["staff", "/~Finance/gifts"],
    ["staff", "/"],
    ["staff", "/login"],
    ["missionary", "/feed"],
  ])("is decided later, %s: %s", (roleClass, pathname) => {
    expect(refusesAddressOnName(pathname, roleClass)).toBe(false);
  });
});

describe("on: the helpers carry the sub-role, never an ID", () => {
  it("strips /~<sub-role> from the route pathname, and nothing else", () => {
    expect(address.stripTenantAddress("/~finance/gifts")).toBe("/gifts");
    expect(address.stripTenantAddress("/~finance")).toBe("/");
    expect(address.stripTenantAddress("/gifts")).toBe("/gifts");
    expect(address.stripTenantAddress(`/${TA}/gifts`)).toBe(`/${TA}/gifts`);
  });

  it("adds a /~<sub-role> prefix inside the segment, and nothing for an empty one", () => {
    expect(address.withTenantAddress("/~finance", "/gifts?x=1")).toBe(
      "/~finance/gifts?x=1",
    );
    expect(address.withTenantAddress("/~finance", "/")).toBe("/~finance");
    expect(address.withTenantAddress("/~finance", "/?x=1")).toBe(
      "/~finance?x=1",
    );
    expect(address.withTenantAddress("/~finance", "/~development/y")).toBe(
      "/~development/y",
    );
    expect(address.withTenantAddress("/~finance", "/login")).toBe("/login");
    expect(address.withTenantAddress("", "/gifts")).toBe("/gifts");
    expect(address.withTenantAddress("", "/")).toBe("/");
  });
});

describe("on: decisions over the name's rows", () => {
  const USER = "u";
  function row(
    tenantId: string,
    membershipRole: "staff" | "missionary" | "donor",
    staffRole: string | null,
    n: number,
  ) {
    return {
      assignmentId: `00000000-0000-4000-8000-${n.toString(16).padStart(12, "0")}`,
      userId: USER,
      tenantId,
      revision: "r",
      membershipRole,
      staffRole,
      isTenantAdmin: false,
    };
  }
  const P = [
    row(TA, "staff", "development", 1),
    row(TA, "staff", "finance", 2),
    row(TB, "staff", "development", 3),
    row(TA, "missionary", null, 4),
    row(TB, "missionary", null, 5),
  ];
  const Q = [row(TA, "staff", "member_care", 6)];
  type Decide = (input: {
    assignments: unknown[];
    roleClass: string;
    nameTenantId: string;
    subRole: string | null;
  }) => unknown;
  const decide = (input: Parameters<Decide>[0]) =>
    fn<Decide>(decisions, "decideNameAddress")(input);
  type List = (input: {
    assignments: unknown[];
    roleClass: string;
    nameTenantId: string;
  }) => unknown;
  const list = (input: Parameters<List>[0]) =>
    fn<List>(decisions, "listNameAddressChoices")(input);

  it("serves one row at the empty prefix and refuses any sub-role for it (R5)", () => {
    expect(
      decide({
        assignments: Q,
        roleClass: "staff",
        nameTenantId: TA,
        subRole: null,
      }),
    ).toEqual({ kind: "allow", assignment: Q[0], prefix: "" });
    expect(
      decide({
        assignments: Q,
        roleClass: "staff",
        nameTenantId: TA,
        subRole: "member_care",
      }),
    ).toEqual({ kind: "not_found" });
    expect(
      decide({
        assignments: P,
        roleClass: "missionary",
        nameTenantId: TA,
        subRole: null,
      }),
    ).toEqual({ kind: "allow", assignment: P[3], prefix: "" });
  });

  it("serves a held sub-role of several rows, and asks otherwise, within the name's organization only", () => {
    expect(
      decide({
        assignments: P,
        roleClass: "staff",
        nameTenantId: TA,
        subRole: "finance",
      }),
    ).toEqual({ kind: "allow", assignment: P[1], prefix: "/~finance" });
    for (const subRole of [null, "member_care"]) {
      expect(
        decide({
          assignments: P,
          roleClass: "staff",
          nameTenantId: TA,
          subRole,
        }),
      ).toEqual({ kind: "choose" });
    }
    expect(
      decide({
        assignments: P,
        roleClass: "staff",
        nameTenantId: TB,
        subRole: null,
      }),
    ).toEqual({ kind: "allow", assignment: P[2], prefix: "" });
    expect(
      decide({
        assignments: Q,
        roleClass: "staff",
        nameTenantId: TB,
        subRole: null,
      }),
    ).toEqual({ kind: "refuse" });
  });

  it("lists the name's rows only, each at its address without an ID", () => {
    expect(
      list({ assignments: P, roleClass: "staff", nameTenantId: TA }),
    ).toEqual([
      {
        tenantId: TA,
        assignmentId: P[1]!.assignmentId,
        subRole: "finance",
        prefix: "/~finance",
      },
      {
        tenantId: TA,
        assignmentId: P[0]!.assignmentId,
        subRole: "development",
        prefix: "/~development",
      },
    ]);
    expect(
      list({ assignments: Q, roleClass: "staff", nameTenantId: TA }),
    ).toEqual([
      {
        tenantId: TA,
        assignmentId: Q[0]!.assignmentId,
        subRole: "member_care",
        prefix: "",
      },
    ]);
  });
});

describe("off: the helpers are today's (guard)", () => {
  it("leaves a sub-role address alone and keeps the ID prefix", () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "0");
    expect(address.stripTenantAddress("/~finance/gifts")).toBe(
      "/~finance/gifts",
    );
    expect(address.stripTenantAddress(`/${TA}~finance/gifts`)).toBe("/gifts");
    expect(address.withTenantAddress(`/${TA}~finance`, "/gifts")).toBe(
      `/${TA}~finance/gifts`,
    );
    expect(address.withTenantAddress("/~finance", "/gifts")).toBe(
      "/~finance/gifts",
    );
    expect(address.buildTenantPrefix(TA, "finance")).toBe(`/${TA}~finance`);
  });
});
