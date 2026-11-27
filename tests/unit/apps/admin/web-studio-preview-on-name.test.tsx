// @vitest-environment jsdom

import {
  signWebStudioSelection,
  WEB_STUDIO_TENANT_COOKIE,
} from "@asym/auth/web-studio";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import PreviewPage from "../../../../apps/admin/app/(payload)/web-studio/preview/[collection]/[id]/page";
import { createSupabaseAuthStrategy } from "../../../../apps/admin/src/cms/auth/supabase-strategy";

const state = vi.hoisted(() => ({
  headers: new Headers(),
  rows: [] as Array<Record<string, unknown>>,
  userId: "",
  scope: {
    userId: "",
    tenantId: "",
    assignmentId: "",
    addressPrefix: "",
  },
  strategies: [] as Array<{
    name: string;
    authenticate: (args: never) => Promise<{ user: unknown }>;
  }>,
  findByID: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: async () => state.headers }));
vi.mock("next/server", () => ({ connection: async () => undefined }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("not-found");
  },
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));

async function runStrategies(args: Record<string, unknown>) {
  for (const strategy of state.strategies) {
    const result = await strategy.authenticate(args as never);
    if (result.user) return result;
  }
  return { user: null };
}

vi.mock("../../../../apps/admin/node_modules/payload/dist/index.js", () => ({
  createPayloadRequest: async ({
    req,
    user,
  }: {
    req: Record<string, unknown>;
    user?: unknown;
  }) => ({ context: {}, ...req, user: user ?? null }),
  executeAuthStrategies: async (args: Record<string, unknown>) =>
    runStrategies(args),
}));

const payloadStore = {
  find: vi.fn(async () => ({ docs: [] })),
  create: vi.fn(async (options: { data: object }) => ({
    id: 5,
    ...options.data,
  })),
  update: vi.fn(async (options: { id: unknown; data: object }) => ({
    id: options.id,
    ...options.data,
  })),
};

vi.mock("../../../../apps/admin/src/cms/get-payload", () => ({
  getPayloadClient: async () => ({
    ...payloadStore,
    authStrategies: state.strategies,
    auth: async ({ headers, req }: { headers: Headers; req?: object }) =>
      runStrategies({
        headers,
        payload: payloadStore,
        req: { context: {}, ...(req ?? { headers }) },
      }),
    findByID: state.findByID,
  }),
}));
vi.mock("../../../../apps/admin/src/cms/web-studio-access", () => ({
  requireWebStudioAccess: async () => ({
    scope: state.scope,
    organization: { name: "Alpha Mission", canSwitch: true },
  }),
}));

const SECRET = "unit-test-preview-on-name-secret";
const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const P = "00000000-0000-4000-8000-0000000000c1";
const Q = "00000000-0000-4000-8000-0000000000c2";
const R = "00000000-0000-4000-8000-0000000000c3";

function row(id: string, user: string, tenant: string, staffRole: string) {
  return {
    id,
    user_id: user,
    tenant_id: tenant,
    role: "staff",
    staff_role: staffRole,
    is_tenant_admin: false,
    updated_at: "2026-11-27T09:00:00.000000+00:00",
  };
}

const P_DEV = row("00000000-0000-4000-8000-000000000a01", P, TA, "development");
const P_FIN = row("00000000-0000-4000-8000-000000000a02", P, TA, "finance");
const Q_CARE = row(
  "00000000-0000-4000-8000-000000000a03",
  Q,
  TA,
  "member_care",
);
const R_DEV = row("00000000-0000-4000-8000-000000000b01", R, TB, "development");

async function signedInAs(
  userId: string,
  rows: Array<ReturnType<typeof row>>,
  selected: ReturnType<typeof row>,
) {
  state.userId = userId;
  state.rows = rows;
  state.scope = {
    userId,
    tenantId: selected.tenant_id,
    assignmentId: selected.id,
    addressPrefix: "",
  };
  const cookie = await signWebStudioSelection(
    { tenantId: selected.tenant_id, assignmentId: selected.id },
    SECRET,
  );
  state.headers = new Headers({
    cookie: `sb=1; ${WEB_STUDIO_TENANT_COOKIE}=${cookie}`,
    "x-asym-name-tenant": TA,
    "x-asym-name-generation": "7",
  });
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
  vi.stubEnv("PAYLOAD_SECRET", SECRET);
  vi.stubEnv("E2E_AUTH_BYPASS", undefined);
  vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
  vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
  const strategy = createSupabaseAuthStrategy({
    createSupabaseClient: (() => ({
      auth: {
        getUser: async () => ({
          data: { user: { id: state.userId, email: "staff@example.org" } },
        }),
      },
      rpc: async (fn: string) => {
        if (fn !== "current_user_assignments") throw new Error(fn);
        return { data: state.rows, error: null };
      },
    })) as never,
  });
  state.strategies = [
    {
      name: strategy.name,
      authenticate: (args) => strategy.authenticate(args),
    },
  ];
  state.findByID.mockImplementation(
    async ({ user }: { user: { tenantId: string } }) =>
      user.tenantId === TA
        ? { id: "page-1", title: "Draft of the year", _status: "draft" }
        : null,
  );
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

async function renderPreview() {
  return render(
    await PreviewPage({
      params: Promise.resolve({ collection: "pages", id: "page-1" }),
    }),
  );
}

function actedAs() {
  const [call] = state.findByID.mock.calls;
  return (call?.[0] as { user: { assignmentId: string } } | undefined)?.user
    .assignmentId;
}

describe("on: a draft preview opens on the name's headers, which carry no claim (F2)", () => {
  it("renders the draft for Q, who has one row (base: sent to the login page)", async () => {
    await signedInAs(Q, [Q_CARE], Q_CARE);
    await renderPreview();
    expect(
      screen.getByRole("heading", { name: "Draft of the year" }),
    ).toBeTruthy();
    expect(actedAs()).toBe(Q_CARE.id);
  });

  it.each([
    ["development", P_DEV],
    ["finance", P_FIN],
  ] as const)(
    "renders the draft for P on the %s row the cookie selects (base: sent to the login page)",
    async (_label, selected) => {
      await signedInAs(P, [P_DEV, P_FIN], selected);
      await renderPreview();
      expect(
        screen.getByRole("heading", { name: "Draft of the year" }),
      ).toBeTruthy();
      expect(actedAs()).toBe(selected.id);
    },
  );

  it("gives a person of another organization nothing (guard)", async () => {
    await signedInAs(R, [R_DEV], R_DEV);
    await expect(renderPreview()).rejects.toThrow();
    expect(state.findByID).not.toHaveBeenCalled();
  });
});
