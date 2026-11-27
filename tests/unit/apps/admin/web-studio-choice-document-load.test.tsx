// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ReactElement } from "react";

const USER = "00000000-0000-4000-8000-0000000000c1";
const TA = "00000000-0000-0000-0000-000000000001";
const A_DEV = "00000000-0000-4000-8000-0000000000a1";
const A_FIN = "00000000-0000-4000-8000-0000000000a2";
const SECRET = "unit-test-web-studio-choice-load";

const state = vi.hoisted(() => ({
  signedIn: {} as unknown,
  headers: new Headers(),
  set: [] as Array<Record<string, unknown>>,
  choices: {} as unknown,
}));
const loadDocument = vi.hoisted(() => vi.fn());
const actions = vi.hoisted(() => ({
  choose: vi.fn(async () => undefined),
  chooseToLoad: vi.fn(async () => ({
    load: "/admin/web-studio/collections/pages",
  })),
}));

vi.mock("server-only", () => ({}));
vi.mock("@asym/auth/context", () => ({
  getSignedInAssignments: async () => state.signedIn,
}));
vi.mock("@asym/api/auth/organization-choices", () => ({
  loadWebStudioOrganizationChoices: async () => state.choices,
}));
vi.mock("next/server", () => ({ connection: async () => undefined }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    set: (cookie: Record<string, unknown>) => state.set.push(cookie),
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
  unstable_rethrow: () => undefined,
}));
vi.mock(
  "../../../../packages/database/document-reload",
  async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    loadDocument,
  }),
);
vi.mock(
  "../../../../apps/admin/app/(auth)/web-studio/organization/actions",
  () => ({
    chooseWebStudioOrganization: actions.choose,
    chooseWebStudioOrganizationToLoad: actions.chooseToLoad,
  }),
);

const real = await vi.importActual<Record<string, unknown>>(
  "../../../../apps/admin/app/(auth)/web-studio/organization/actions",
);
const { default: WebStudioOrganizationPage } =
  await import("../../../../apps/admin/app/(auth)/web-studio/organization/page");

function row(id: string, staffRole: string) {
  return {
    assignmentId: id,
    userId: USER,
    tenantId: TA,
    revision: "r",
    membershipRole: "staff",
    staffRole,
    isTenantAdmin: false,
  };
}

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

function onName(js: boolean) {
  vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
  vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
  state.headers = new Headers({
    "x-asym-name-tenant": TA,
    "x-asym-name-generation": "7",
    ...(js ? { "next-action": "choose" } : {}),
  });
}

async function openChooserPage(params: Record<string, string>) {
  const page = WebStudioOrganizationPage({
    searchParams: Promise.resolve(params),
  }) as ReactElement<{ children: ReactElement }>;
  const choices = page.props.children as ReactElement<object> & {
    type: (props: object) => Promise<ReactElement>;
  };
  return choices.type(choices.props);
}

beforeEach(() => {
  vi.stubEnv("PAYLOAD_SECRET", SECRET);
  state.signedIn = {
    kind: "signed_in",
    userId: USER,
    assignments: [row(A_DEV, "development"), row(A_FIN, "finance")],
    organizationNames: new Map([[TA, "Alpha Mission"]]),
  };
  state.headers = new Headers();
  state.set = [];
  state.choices = {
    kind: "ok",
    organizations: [
      {
        tenantId: TA,
        name: "Alpha Mission",
        options: [
          { subRole: "development", assignmentId: A_DEV },
          { subRole: "finance", assignmentId: A_FIN },
        ],
      },
    ],
  };
  loadDocument.mockReset();
  actions.choose.mockClear();
  actions.chooseToLoad.mockClear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("on: the choice's action", () => {
  it("sets the cookie and answers the address to load, under the base path (base: no such action)", async () => {
    onName(true);
    const chooseToLoad = real.chooseWebStudioOrganizationToLoad as
      ((state: unknown, data: FormData) => Promise<unknown>) | undefined;
    expect(typeof chooseToLoad).toBe("function");
    await expect(
      chooseToLoad!(
        null,
        form({
          tenant: TA,
          assignment: A_FIN,
          next: "/web-studio/collections/pages",
        }),
      ),
    ).resolves.toEqual({ load: "/admin/web-studio/collections/pages" });
    expect(state.set).toHaveLength(1);
    expect(state.set[0]?.path).toBe("/admin/web-studio");
  });

  it("still answers a post without JavaScript with a redirect, a document load already", async () => {
    onName(false);
    const chooseToLoad = real.chooseWebStudioOrganizationToLoad as (
      state: unknown,
      data: FormData,
    ) => Promise<unknown>;
    expect(typeof chooseToLoad).toBe("function");
    await expect(
      chooseToLoad(
        null,
        form({ tenant: TA, assignment: A_FIN, next: "/web-studio" }),
      ),
    ).rejects.toMatchObject({ target: "/admin/web-studio" });
  });

  it("sets nothing for a row the person does not hold, and sends them back to the chooser", async () => {
    onName(true);
    const chooseToLoad = real.chooseWebStudioOrganizationToLoad as (
      state: unknown,
      data: FormData,
    ) => Promise<unknown>;
    expect(typeof chooseToLoad).toBe("function");
    await expect(
      chooseToLoad(
        null,
        form({
          tenant: TA,
          assignment: "00000000-0000-4000-8000-0000000000ff",
          next: "/web-studio",
        }),
      ),
    ).rejects.toMatchObject({
      target: "/web-studio/organization?next=%2Fweb-studio&refused=1",
    });
    expect(state.set).toEqual([]);
  });
});

describe("on: the chooser loads Web Studio as a document", () => {
  it("loads the answered address after a choice (base: the redirect is soft)", async () => {
    onName(true);
    render(await openChooserPage({ next: "/web-studio/collections/pages" }));
    fireEvent.click(screen.getByRole("button", { name: /Finance/ }));
    await waitFor(() =>
      expect(loadDocument).toHaveBeenCalledWith(
        "/admin/web-studio/collections/pages",
      ),
    );
    expect(actions.chooseToLoad).toHaveBeenCalledTimes(1);
    expect(actions.choose).not.toHaveBeenCalled();
  });
});

describe("off: today's chooser and action (guard)", () => {
  it("posts the choice to today's action and loads nothing itself", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "0");
    render(await openChooserPage({ next: "/web-studio/collections/pages" }));
    fireEvent.click(screen.getByRole("button", { name: /Finance/ }));
    await waitFor(() => expect(actions.choose).toHaveBeenCalledTimes(1));
    expect(actions.chooseToLoad).not.toHaveBeenCalled();
    expect(loadDocument).not.toHaveBeenCalled();
  });
});
