// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  headers: new Headers(),
  demoOnly: true,
  visitor: [] as unknown[],
  screen: [] as Array<{ nextPath: string | null; demoOnly: boolean }>,
}));

vi.mock("next/headers", () => ({
  headers: async () => state.headers,
}));

vi.mock("@asym/env", () => ({
  serverEnv: {
    get DEMO_ONLY_LOGIN() {
      return state.demoOnly;
    },
  },
}));

vi.mock("@asym/auth/auth-screen", () => ({
  requireAnonymousVisitor: async (params: {
    searchParams?: Record<string, string | string[] | undefined>;
  }) => {
    state.visitor.push(params);
    const next = params.searchParams?.next;
    return { nextPath: typeof next === "string" ? next : null };
  },
}));

vi.mock("@asym/ui/components/auth/LoginScreen", () => ({
  LoginScreen: (props: { nextPath: string | null; demoOnly: boolean }) => {
    state.screen.push({ nextPath: props.nextPath, demoOnly: props.demoOnly });
    return null;
  },
}));

vi.mock(
  "../../../../apps/admin/src/cms-ui/web-studio/shell/payload-clipboard",
  () => ({ PayloadClipboardReset: () => null }),
);

const { default: LoginPage } =
  await import("../../../../apps/admin/app/(auth)/login/page");

const OPS = "ops.test";

type Element = {
  props: { children: Array<{ type: unknown; props: unknown }> };
};

async function render(next: string) {
  const element = (await LoginPage({
    searchParams: Promise.resolve({ next }),
  })) as unknown as Element;
  for (const child of element.props.children) {
    if (typeof child.type === "function") {
      (child.type as (props: unknown) => unknown)(child.props);
    }
  }
  return state.screen.at(-1)!;
}

beforeEach(() => {
  state.headers = new Headers({ host: OPS });
  state.demoOnly = true;
  state.visitor = [];
  state.screen = [];
  vi.stubEnv("OPERATIONS_NAMES", OPS);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("on: the sign-in page on an operations address", () => {
  beforeEach(() => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
  });

  it("lands on /operator whatever next says, and shows the password form even with DEMO_ONLY_LOGIN=true", async () => {
    expect(await render("/donors")).toEqual({
      nextPath: "/operator",
      demoOnly: false,
    });
    expect(state.visitor).toEqual([
      { appId: "admin", searchParams: { next: "/operator" } },
    ]);
  });

  it.each([
    [
      "a stamped request (a page-scope header)",
      { "x-asym-name-tenant": "00000000-0000-0000-0000-000000000001" },
    ],
    ["a front header", { "x-asym-front-origin": "https://a.test" }],
    ["another host", { host: "a.test" }],
  ])(
    "keeps next and DEMO_ONLY_LOGIN for %s, as today (guard)",
    async (_label, extra) => {
      state.headers = new Headers({ host: OPS, ...extra });
      expect(await render("/donors")).toEqual({
        nextPath: "/donors",
        demoOnly: true,
      });
    },
  );
});

describe.each([
  ["unset", undefined],
  ["0", "0"],
] as const)("off (switch %s): as today (guard)", (_label, value) => {
  it("keeps next and DEMO_ONLY_LOGIN on an operations name", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", value);
    vi.stubEnv("CORE_APP_BASE_PATH", "");
    expect(await render("/donors")).toEqual({
      nextPath: "/donors",
      demoOnly: true,
    });
  });
});
