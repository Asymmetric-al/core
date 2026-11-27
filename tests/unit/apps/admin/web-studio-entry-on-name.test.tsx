// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  signWebStudioSelection,
  WEB_STUDIO_TENANT_COOKIE,
  webStudioEntryQuery,
  withWebStudioEntry,
} from "../../../../packages/auth/web-studio";

import type { ReactElement } from "react";

const USER = "00000000-0000-4000-8000-0000000000c1";
const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const SECRET = "unit-test-web-studio-entry-on-name";

const state = vi.hoisted(() => ({
  signedIn: {} as unknown,
  cookie: undefined as string | undefined,
  headers: new Headers(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@asym/auth/context", () => ({
  getSignedInAssignments: async () => state.signedIn,
}));
vi.mock("next/server", () => ({ connection: async () => undefined }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === WEB_STUDIO_TENANT_COOKIE && state.cookie !== undefined
        ? { name, value: state.cookie }
        : undefined,
    set: () => undefined,
  }),
  headers: async () => state.headers,
}));
class RedirectError extends Error {
  constructor(public readonly target: string) {
    super(`NEXT_REDIRECT:${target}`);
  }
}
vi.mock("next/navigation", () => ({
  redirect: (target: string) => {
    throw new RedirectError(target);
  },
  permanentRedirect: (target: string) => {
    throw new RedirectError(target);
  },
  unstable_rethrow: () => undefined,
}));

const { requireWebStudioAccess } =
  await import("../../../../apps/admin/src/cms/web-studio-access");
const { default: WebStudioOrganizationPage } =
  await import("../../../../apps/admin/app/(auth)/web-studio/organization/page");

function assignment(
  id: number,
  tenantId: string,
  membershipRole = "staff",
  staffRole: string | null = "development",
) {
  return {
    assignmentId: `00000000-0000-4000-8000-${id.toString(16).padStart(12, "0")}`,
    userId: USER,
    tenantId,
    revision: "r",
    membershipRole,
    staffRole: membershipRole === "staff" ? staffRole : null,
    isTenantAdmin: false,
  };
}
const P_DEV_A = assignment(0x901, TA);
const P_FIN_A = assignment(0x902, TA, "staff", "finance");
const P_DEV_B = assignment(0x903, TB);
const P = [P_DEV_A, P_FIN_A, P_DEV_B];
const Q = [assignment(0x911, TA, "staff", "member_care")];

function signedIn(assignments: unknown[]) {
  state.signedIn = {
    kind: "signed_in",
    userId: USER,
    assignments,
    organizationNames: new Map([
      [TA, "Alpha Mission"],
      [TB, "Bravo Mission"],
    ]),
  };
}

function onName() {
  vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
  vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
  state.headers = new Headers({
    "x-asym-name-tenant": TA,
    "x-asym-name-generation": "7",
  });
}

async function selectCookie(tenantId: string, assignmentId: string) {
  state.cookie = await signWebStudioSelection(
    { tenantId, assignmentId },
    SECRET,
  );
}

const finance = {
  tenantId: TA,
  assignmentId: P_FIN_A.assignmentId,
  addressPrefix: "/~finance",
};

beforeEach(() => {
  vi.stubEnv("PAYLOAD_SECRET", SECRET);
  signedIn(P);
  state.cookie = undefined;
  state.headers = new Headers();
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("on: the entry link", () => {
  beforeEach(onName);

  it("carries only role=<sub-role> from a /~<sub-role> document (base: organization and assignment)", () => {
    expect(webStudioEntryQuery(finance)).toEqual({ role: "finance" });
    expect(
      withWebStudioEntry("/web-studio/collections/pages?x=1#top", finance),
    ).toBe("/web-studio/collections/pages?x=1&role=finance#top");
  });

  it("carries nothing from an empty-prefix document", () => {
    expect(webStudioEntryQuery({ ...finance, addressPrefix: "" })).toBeNull();
    expect(
      withWebStudioEntry("/web-studio", { ...finance, addressPrefix: "" }),
    ).toBe("/web-studio");
  });
});

describe("on: the link back to Mission Control", () => {
  beforeEach(onName);

  it("is /~finance for P working in A's finance row (base: with A's ID)", async () => {
    await selectCookie(TA, P_FIN_A.assignmentId);
    const access = await requireWebStudioAccess("/web-studio");
    expect(access.organization.missionControlHref).toBe("/~finance");
  });

  it("is / for Q, with one staff row (base: /<A>)", async () => {
    signedIn(Q);
    const access = await requireWebStudioAccess("/web-studio");
    expect(access.organization.missionControlHref).toBe("/");
  });
});

describe("on: the chooser page reads no from", () => {
  beforeEach(onName);

  async function openChooserPage(params: Record<string, string>) {
    const page = WebStudioOrganizationPage({
      searchParams: Promise.resolve(params),
    }) as ReactElement<{ children: ReactElement }>;
    const choices = page.props.children as ReactElement<object> & {
      type: (props: object) => Promise<ReactElement>;
    };
    return choices.type(choices.props);
  }

  it("shows the same chooser with ?from=<A> as without it (base: a notice naming A)", async () => {
    render(await openChooserPage({ next: "/web-studio", from: TA }));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByText(/You came from/)).toBeNull();
  });
});

describe("off: today's entry (guard)", () => {
  it("names the organization and row from an ID document, and shows from", async () => {
    const scope = {
      tenantId: TA,
      assignmentId: P_FIN_A.assignmentId,
      addressPrefix: `/${TA}~finance`,
    };
    expect(webStudioEntryQuery(scope)).toEqual({
      organization: TA,
      assignment: P_FIN_A.assignmentId,
    });
    await selectCookie(TA, P_FIN_A.assignmentId);
    const access = await requireWebStudioAccess("/web-studio");
    expect(access.organization.missionControlHref).toBe(`/${TA}~finance`);
  });
});
