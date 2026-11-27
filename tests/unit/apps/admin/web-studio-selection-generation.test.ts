import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  signWebStudioSelection,
  WEB_STUDIO_TENANT_COOKIE,
} from "../../../../packages/auth/web-studio";

const TA = "00000000-0000-0000-0000-000000000001";
const ROW = "00000000-0000-4000-8000-000000000b01";
const SECRET = "unit-test-web-studio-selection-generation";

const state = vi.hoisted(() => ({
  cookie: undefined as string | undefined,
  headers: new Headers(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@asym/auth/context", () => ({
  getSignedInAssignments: async () => ({
    kind: "signed_in",
    userId: "00000000-0000-4000-8000-0000000000c1",
    assignments: [
      {
        assignmentId: "00000000-0000-4000-8000-000000000b01",
        userId: "00000000-0000-4000-8000-0000000000c1",
        tenantId: "00000000-0000-0000-0000-000000000001",
        revision: "r",
        membershipRole: "staff",
        staffRole: "development",
        isTenantAdmin: false,
      },
    ],
    organizationNames: new Map(),
  }),
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === WEB_STUDIO_TENANT_COOKIE && state.cookie !== undefined
        ? { name, value: state.cookie }
        : undefined,
  }),
  headers: async () => state.headers,
}));
vi.mock("next/navigation", () => ({
  redirect: (target: string) => {
    throw new Error(`NEXT_REDIRECT:${target}`);
  },
  unstable_rethrow: () => undefined,
}));

async function readSelection() {
  vi.resetModules();
  const { readWebStudioSelection } =
    await import("../../../../apps/admin/src/cms/web-studio-access");
  return readWebStudioSelection();
}

beforeEach(async () => {
  vi.stubEnv("PAYLOAD_SECRET", SECRET);
  state.cookie = await signWebStudioSelection(
    { tenantId: TA, assignmentId: ROW },
    SECRET,
  );
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("the row a server function must have been rendered for", () => {
  it("carries the name's generation with the switch on (base: none)", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
    state.headers = new Headers({
      "x-asym-name-tenant": TA,
      "x-asym-name-generation": "7",
    });
    await expect(readSelection()).resolves.toEqual({
      kind: "selected",
      tenantId: TA,
      assignmentId: ROW,
      generation: 7,
    });
  });

  it("carries none with the switch off (guard)", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "0");
    state.headers = new Headers({ "x-asym-name-generation": "7" });
    await expect(readSelection()).resolves.toEqual({
      kind: "selected",
      tenantId: TA,
      assignmentId: ROW,
    });
  });
});
