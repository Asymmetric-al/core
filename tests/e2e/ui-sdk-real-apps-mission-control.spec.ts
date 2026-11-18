import {
  expect,
  test,
  type Locator,
  type Page,
  type PlaywrightWorkerArgs,
  type Route,
  type TestInfo,
} from "@playwright/test";

import { adminBaseURL } from "./base-urls";
import { getDemoRoleMap } from "./helpers/demo-auth";
import { installDemoSessionInBrowser } from "./helpers/install-demo-session";
import { hideNextDevOverlay } from "./helpers/next-dev-overlay";
import { skipUnlessRequired } from "./ui-sdk-real-apps-required";

// Mission Control's keyboard and agent flows proven in the real Next.js dev
// server: App Router with Cache Components, real hydration, the shell's
// shortcut manager and `AgentBridge`, and real key presses and pointer moves.
// `ui-sdk-real-apps.spec.ts` covers the shell itself; this file covers the
// pages that build on it. Placeholder Supabase serves no product data, so
// each test answers the page's own client API calls with fixtures, in the
// shapes the route handlers return, and records what the page sends.
//
// Playwright's Chromium is not an Apple platform here, so `mod` is Control.

const VIEWPORTS = [
  { label: "1280", width: 1280, height: 900, phone: false },
  { label: "375", width: 375, height: 812, phone: true },
] as const;
type Viewport = (typeof VIEWPORTS)[number];

const HYDRATION = /hydrat|did not match|server rendered html/i;

// A second Mission Control dev server, started separately with
// NEXT_PUBLIC_PDF_STUDIO_NATIVE_BUILDER_ENABLED=true: next dev allows one
// server per app directory, and the flag is read when the page compiles.
const nativePdfBaseURL = process.env.PLAYWRIGHT_ADMIN_PDF_NATIVE_URL;

type KeyRecord = {
  key: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  repeat: boolean;
  defaultPrevented: boolean;
};
type AgentTool = { name: string; execute: (input: unknown) => unknown };
type SpecWindow = Window & {
  __keyLog?: KeyRecord[];
  __tools?: Map<string, AgentTool>;
};

// ---------------------------------------------------------------------------
// Console and hydration

type Collected = { hydration: string[]; errors: string[] };
const consoleOf = new WeakMap<Page, Collected>();

function collectConsole(page: Page) {
  const collected: Collected = { hydration: [], errors: [] };
  consoleOf.set(page, collected);
  page.on("console", (message) => {
    const text = `${message.type()}: ${message.text()}`;
    if (HYDRATION.test(message.text())) collected.hydration.push(text);
    else if (message.type() === "error") collected.errors.push(text);
  });
  page.on("pageerror", (error) => {
    const text = `pageerror: ${error.message}`;
    if (HYDRATION.test(error.message)) collected.hydration.push(text);
    else collected.errors.push(text);
  });
}

async function snap(page: Page, testInfo: TestInfo, name: string) {
  await testInfo.attach(name, {
    body: await page.screenshot(),
    contentType: "image/png",
  });
}

async function attachJson(testInfo: TestInfo, name: string, value: unknown) {
  await testInfo.attach(name, {
    body: JSON.stringify(value, null, 2),
    contentType: "application/json",
  });
}

// ---------------------------------------------------------------------------
// Sign-in, navigation and readiness

/**
 * Skips the suite, with the reason, when the server is not running or its
 * admin demo role is not configured; in CI it fails instead
 * (`ui-sdk-real-apps-required.ts`). Any other answer than 200 is a broken
 * server, and fails the suite.
 */
async function requireMissionControl(
  playwright: PlaywrightWorkerArgs["playwright"],
) {
  const request = await playwright.request.newContext();
  try {
    const availability = new URL("/api/auth/demo-account", adminBaseURL);
    const response = await request
      .get(availability.toString(), { timeout: 120_000 })
      .catch((error: unknown) =>
        error instanceof Error ? error : new Error(String(error)),
      );
    if (response instanceof Error) {
      // No server listening skips the block; a server that hangs or errors fails it.
      if (!/ECONNREFUSED/.test(response.message)) throw response;
      skipUnlessRequired(
        true,
        `The Mission Control server at ${adminBaseURL} did not answer: ${response.message}`,
      );
      return;
    }
    // A working server answers 200, with each role's availability inside.
    expect(
      response.status(),
      `The Mission Control demo availability endpoint at ${availability.toString()} answered ${response.status()}: ${await response.text()}`,
    ).toBe(200);
    const roles = getDemoRoleMap(await response.json()) ?? {};
    skipUnlessRequired(
      !roles.admin,
      `The admin demo account is not configured at ${adminBaseURL}.`,
    );
  } finally {
    await request.dispose();
  }
}

// Shortcuts register in passive effects, and a key's state change paints on
// the next frame, so two animation frames are the event to wait for.
const nextFrames = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );

/** Records every keydown that reaches `window`, after the app's own handlers. */
async function recordKeys(page: Page) {
  await page.evaluate(() => {
    const log: KeyRecord[] = [];
    (window as SpecWindow).__keyLog = log;
    window.addEventListener("keydown", (event) =>
      log.push({
        key: event.key,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        repeat: event.repeat,
        defaultPrevented: event.defaultPrevented,
      }),
    );
  });
}

const keyLog = (page: Page) =>
  page.evaluate(() => [...((window as SpecWindow).__keyLog ?? [])]);

/** The logged keydowns of keys other than a modifier on its own. */
const pressedKeys = async (page: Page) =>
  (await keyLog(page)).filter(
    (key) => !["Control", "Shift", "Alt", "Meta"].includes(key.key),
  );

/**
 * Signs in as the demo admin, opens `path` and waits until `ready` shows and
 * has hydrated. `ready` should be something only client data renders.
 */
async function openMissionControl(
  page: Page,
  path: string,
  viewport: Viewport,
  ready: Locator,
  baseURL = adminBaseURL,
) {
  await page.setViewportSize({
    width: viewport.width,
    height: viewport.height,
  });
  const session = await installDemoSessionInBrowser(page, "admin", baseURL);
  expect(session.ok, `The admin demo sign-in answered ${session.status}`).toBe(
    true,
  );
  await page.goto(new URL(path, baseURL).toString(), {
    waitUntil: "domcontentloaded",
    timeout: 180_000,
  });
  // The first hit of a route compiles it.
  await expect(ready).toBeVisible({ timeout: 180_000 });
  await expect
    .poll(
      () =>
        ready.evaluate((element) =>
          Object.keys(element).some((key) => key.startsWith("__reactFiber$")),
        ),
      { timeout: 120_000 },
    )
    .toBe(true);
  await nextFrames(page);
  await recordKeys(page);
}

const bodyHasFocus = (page: Page) =>
  page.evaluate(() => document.activeElement === document.body);

async function focusBody(page: Page) {
  await page.evaluate(() =>
    (document.activeElement as HTMLElement | null)?.blur(),
  );
  await expect.poll(() => bodyHasFocus(page)).toBe(true);
}

/**
 * Resolves once every Support Hub request the page sent before it has
 * reached the stub: the stub records a write when its request arrives, and
 * requests reach their route in the order the page sends them.
 */
async function supportRequestsArrived(page: Page) {
  await page.evaluate(() =>
    fetch("/api/admin/support/labels").then((response) => response.text()),
  );
}

// ---------------------------------------------------------------------------
// WebMCP stand-in (as in ui-sdk-real-apps.spec.ts)

/** A browser `document.modelContext` that keeps registered tools on `window`. */
function installWebMcpStandIn() {
  const tools = new Map<string, AgentTool>();
  (window as SpecWindow).__tools = tools;
  Object.defineProperty(document, "modelContext", {
    configurable: true,
    value: {
      registerTool(tool: AgentTool, options?: { signal?: AbortSignal }) {
        tools.set(tool.name, tool);
        options?.signal?.addEventListener("abort", () =>
          tools.delete(tool.name),
        );
        return Promise.resolve();
      },
    },
  });
}

const toolNames = (page: Page) =>
  page.evaluate(() =>
    [...((window as SpecWindow).__tools?.keys() ?? [])].sort(),
  );

function callTool(page: Page, name: string, input: unknown) {
  return page.evaluate(
    async ([toolName, toolInput]) => {
      const tool = (window as SpecWindow).__tools?.get(toolName);
      if (!tool) return { missing: toolName };
      try {
        return { result: await tool.execute(toolInput) };
      } catch (error) {
        return {
          thrown: error instanceof Error ? error.message : String(error),
        };
      }
    },
    [name, input] as const,
  );
}

// ---------------------------------------------------------------------------
// Support Hub fixtures, in the shapes `/api/admin/support/**` returns

const TENANT = "00000000-0000-0000-0000-000000000001";
const STAMP = "2026-11-10T15:00:00.000Z";

type Json = Record<string, unknown>;
type SentRequest = { method: string; path: string; body: Json | null };

const LABELS = [
  {
    id: "label-urgent",
    tenantId: TENANT,
    name: "Urgent",
    slug: "urgent",
    tone: "rose",
    description: null,
  },
  {
    id: "label-billing",
    tenantId: TENANT,
    name: "Billing",
    slug: "billing",
    tone: "amber",
    description: null,
  },
];

// The demo admin's bypass session is `e2e-admin-user`; with placeholder
// Supabase its profile, and so its email, cannot load.
const AGENTS = [
  {
    id: "agent-morgan",
    name: "Morgan Lee",
    email: "morgan@example.test",
    avatarUrl: null,
    title: "Donor care",
  },
  {
    id: "e2e-admin-user",
    name: "Avery Admin",
    email: "avery@example.test",
    avatarUrl: null,
    title: "Support admin",
  },
];

type MacroAction =
  { kind: "add_label"; labelId: string } | { kind: "snooze"; hours: number };

const URGENT: MacroAction = { kind: "add_label", labelId: "label-urgent" };
const BILLING: MacroAction = { kind: "add_label", labelId: "label-billing" };
const SNOOZE: MacroAction = { kind: "snooze", hours: 4 };

function macroFixture(actions: MacroAction[]) {
  return {
    id: "macro-triage",
    tenantId: TENANT,
    ownerAgentId: null,
    name: "Triage billing",
    description: "Flags a billing question and parks it for a few hours.",
    actions,
    createdAt: STAMP,
    updatedAt: STAMP,
  };
}

function conversationFixture(
  index: number,
  subject: string,
  name: string,
  minutesAgo: number,
) {
  const at = new Date(Date.now() - minutesAgo * 60_000).toISOString();
  const due = new Date(Date.now() + 6 * 60 * 60_000).toISOString();
  return {
    id: `conversation-${index}`,
    tenantId: TENANT,
    inboxId: "inbox-care",
    subject,
    status: "open",
    priority: "normal",
    channel: "email",
    assignee: null,
    team: null,
    externalContactEmail: `${name.split(" ")[0]!.toLowerCase()}@example.test`,
    externalContactName: name,
    contact: null,
    labels: [],
    unreadCount: 0,
    messageCount: 1,
    firstMessageAt: at,
    lastMessageAt: at,
    lastCustomerMessageAt: at,
    lastMessageDirection: "inbound",
    firstRespondedAt: null,
    firstResponseDueAt: due,
    nextResponseDueAt: null,
    resolvedAt: null,
    snoozedUntil: null,
    escalatedAt: null,
    boardOrder: index,
    slaPolicyId: null,
    createdAt: at,
    updatedAt: at,
  };
}

function messageFixture(conversation: Json) {
  const text = `Hello, a question about “${String(conversation.subject)}”.`;
  return {
    id: `${String(conversation.id)}-message-1`,
    tenantId: TENANT,
    conversationId: conversation.id,
    type: "email",
    direction: "inbound",
    isPrivate: false,
    deliveryState: "delivered",
    author: {
      id: `${String(conversation.id)}-donor`,
      role: "donor",
      name: conversation.externalContactName,
      email: conversation.externalContactEmail,
      avatarUrl: null,
    },
    body: { json: null, html: `<p>${text}</p>`, text },
    attachments: [],
    emailHeaders: null,
    outboundSendLogId: null,
    inboundEmailId: null,
    inboundAttachmentStatus: "none",
    postedAt: conversation.lastMessageAt,
    createdAt: conversation.lastMessageAt,
    updatedAt: conversation.lastMessageAt,
  };
}

/**
 * Answers every `/api/admin/support/**` call the inbox and settings pages
 * make, keeps what they change, and records every write.
 */
class SupportApiStub {
  readonly sent: SentRequest[] = [];
  macros: Json[];
  conversations: Json[];
  private held: Promise<void> | null = null;

  constructor({
    macros = [],
    conversations = [],
  }: { macros?: Json[]; conversations?: Json[] } = {}) {
    this.macros = macros;
    this.conversations = conversations;
  }

  writes(pattern: RegExp) {
    return this.sent.filter((request) => pattern.test(request.path));
  }

  /**
   * Holds the answer to every write until the returned function is called.
   * Each write is still recorded as it arrives, and changes nothing until
   * it is answered, as a save that has not landed.
   */
  holdWrites() {
    let release: () => void = () => {};
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    this.held = held;
    return () => {
      if (this.held === held) this.held = null;
      release();
    };
  }

  async install(page: Page) {
    await page.route("**/api/admin/support/**", (route) => this.answer(route));
  }

  private async answer(route: Route) {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^\/api\/admin\/support\//, "");
    const method = request.method();
    if (method !== "GET") {
      const body = (request.postDataJSON() as Json | null) ?? null;
      this.sent.push({ method, path, body });
      if (this.held) await this.held;
      return route.fulfill({ json: this.write(method, path, body) });
    }
    return route.fulfill({ json: this.read(path) });
  }

  private conversation(id: string) {
    return this.conversations.find((row) => row.id === id);
  }

  private read(path: string): Json {
    const access = { agentId: "e2e-admin-user", canManageAll: true };
    const conversation = /^conversations\/([^/]+)$/.exec(path);
    if (conversation) {
      return { conversation: this.conversation(conversation[1]!) ?? null };
    }
    const messages = /^conversations\/([^/]+)\/messages$/.exec(path);
    if (messages) {
      const row = this.conversation(messages[1]!);
      return { messages: row ? [messageFixture(row)] : [] };
    }
    switch (path) {
      case "conversations":
        return { conversations: this.conversations };
      case "macros":
        return { macros: this.macros };
      case "labels":
        return { labels: LABELS };
      case "agents":
        return { agents: AGENTS };
      case "teams":
        return { teams: [] };
      case "canned-responses":
        return { cannedResponses: [] };
      case "saved-views":
        return { savedViews: [], access };
      case "notification-preferences":
        return { preferences: [], access };
      case "signatures":
        return { signatures: [] };
      case "inboxes":
        return { inboxes: [] };
      case "inbox-settings":
        return { settings: [] };
      case "business-hours":
        return { businessHours: [] };
      case "sla-policies":
        return { slaPolicies: [] };
      case "automation-rules":
        return { automationRules: [] };
      default:
        return {};
    }
  }

  private write(method: string, path: string, body: Json | null): Json {
    const macro = /^macros\/([^/]+)$/.exec(path);
    if (macro && method === "PATCH" && body) {
      const saved = { ...macroFixture([]), ...body, updatedAt: STAMP };
      this.macros = this.macros.map((row) =>
        row.id === macro[1] ? saved : row,
      );
      return { macro: saved };
    }
    const action = /^conversations\/([^/]+)\/([a-z-]+)$/.exec(path);
    if (action) {
      const row = this.conversation(action[1]!);
      if (row && action[2] === "status" && body?.status) {
        row.status = body.status;
      }
      if (row && action[2] === "snooze" && body?.snoozedUntil) {
        row.status = "snoozed";
        row.snoozedUntil = body.snoozedUntil;
      }
      if (action[2] === "replies" || action[2] === "notes") {
        return { message: row ? messageFixture(row) : null };
      }
      return { conversation: row ?? null };
    }
    return {};
  }
}

// ---------------------------------------------------------------------------
// The suites

test.use({ reducedMotion: "reduce" });
// The dev-only Next.js overlay covers bottom-left controls; see the helper.
test.beforeEach(async ({ context }) => {
  await hideNextDevOverlay(context);
});

test.describe("UI SDK flows in the real Mission Control", () => {
  // First hits compile routes.
  test.describe.configure({ timeout: 300_000 });

  test.beforeAll(async ({ playwright }) => {
    await requireMissionControl(playwright);
  });

  test.beforeEach(async ({ page }) => {
    collectConsole(page);
  });

  // Console errors from placeholder data are reported; a hydration error
  // fails the test.
  test.afterEach(async ({ page }, testInfo) => {
    const collected = consoleOf.get(page);
    if (!collected) return;
    await attachJson(testInfo, "console-errors", collected.errors);
    expect(collected.hydration, "hydration errors").toEqual([]);
  });

  for (const viewport of VIEWPORTS) {
    test(`Support macro editor: an agent, the keyboard and a pointer reorder the Actions list and Save sends the order at ${viewport.label}`, async ({
      page,
      context,
    }, testInfo) => {
      await context.addInitScript(installWebMcpStandIn);
      const api = new SupportApiStub({
        macros: [macroFixture([URGENT, BILLING, SNOOZE, URGENT])],
      });
      await api.install(page);
      const edit = page.getByRole("button", { name: "Edit Triage billing" });
      await openMissionControl(
        page,
        "/support/settings/macros",
        viewport,
        edit,
      );

      const sheet = page.getByRole("dialog", { name: "Edit “Triage billing”" });
      const list = sheet.getByRole("list", { name: "Macro actions" });
      const rows = list.getByRole("listitem");
      // What each row sets, top to bottom: a label's name or the snooze hours.
      const shown = () =>
        rows.evaluateAll((items) =>
          items.map((item) => {
            const field = item.querySelector<HTMLElement>(
              '[aria-label^="Action "][aria-label$=" label"], [aria-label$=" hours to snooze"]',
            );
            return field instanceof HTMLInputElement
              ? `${field.value} hours`
              : (field?.textContent?.trim() ?? "");
          }),
        );
      const save = sheet.getByRole("button", { name: "Save changes" });
      const macroWrites = () => api.writes(/^macros\//);

      const openEditor = async () => {
        await edit.click();
        await expect(sheet).toBeVisible();
        await expect(rows).toHaveCount(4);
      };
      const saveAndExpect = async (actions: MacroAction[]) => {
        const before = macroWrites().length;
        await save.click();
        await expect(sheet).toBeHidden();
        expect(macroWrites()).toHaveLength(before + 1);
        expect(macroWrites().at(-1)).toEqual({
          method: "PATCH",
          path: "macros/macro-triage",
          body: {
            id: "macro-triage",
            name: "Triage billing",
            description:
              "Flags a billing question and parks it for a few hours.",
            ownerAgentId: null,
            actions,
          },
        });
        await expect(page.getByText("Macro updated.")).toBeVisible();
      };

      // 1. An agent, through WebMCP, under Mission Control's allowlist.
      await expect
        .poll(() => toolNames(page), { timeout: 120_000 })
        .toEqual(["act", "query", "snapshot"]);
      await openEditor();
      expect(await shown()).toEqual(["Urgent", "Billing", "4 hours", "Urgent"]);
      await snap(page, testInfo, `macro-editor-${viewport.label}`);

      const ROW_KEYS = [
        "initial-draft-0",
        "initial-draft-1",
        "initial-draft-2",
        "initial-draft-3",
      ];
      const LIST = {
        component: "sortable-list",
        label: "Macro actions",
        actions: ["move"],
        value: ROW_KEYS,
      };
      // The editor names each row by its place, its type and what it sets,
      // so the two "Add label Urgent" rows still differ.
      const ROW_LABELS = [
        "Action 1: Add label Urgent",
        "Action 2: Add label Billing",
        "Action 3: Snooze",
        "Action 4: Add label Urgent",
      ];
      type Found = {
        result?: {
          value?: string[];
          items?: { value: string; label: string }[];
        }[];
      };
      const itemsOf = (found: unknown) => (found as Found).result?.[0]?.items;
      const itemLabels = (found: unknown) =>
        (itemsOf(found) ?? []).map((item) => item.label);
      const rowItems = (keys: string[], labels: string[]) =>
        keys.map((value, index) => ({ value, label: labels[index] }));

      // `snapshot` lists the one sortable list and names its rows by the
      // editor's labels, each one different.
      const snapshot = await callTool(page, "snapshot", {});
      await attachJson(testInfo, "snapshot", snapshot);
      expect(snapshot).toMatchObject({ result: [LIST] });
      expect(itemsOf(snapshot)).toEqual(rowItems(ROW_KEYS, ROW_LABELS));
      expect(new Set(itemLabels(snapshot)).size).toBe(ROW_LABELS.length);

      // `query` by text, and `query` within the list, name them the same way.
      const byText = await callTool(page, "query", { text: "Macro actions" });
      await attachJson(testInfo, "query-text", byText);
      expect(byText).toMatchObject({ result: [LIST] });
      expect(itemsOf(byText)).toEqual(rowItems(ROW_KEYS, ROW_LABELS));
      const within = await callTool(page, "query", { within: "Macro actions" });
      await attachJson(testInfo, "query-within", within);
      expect(within).toMatchObject({ result: [LIST] });
      expect(itemsOf(within)).toEqual(rowItems(ROW_KEYS, ROW_LABELS));

      // A move by a name taken from the snapshot reorders the rendered rows.
      const billingName = itemLabels(snapshot)[1]!;
      expect(billingName).toBe("Action 2: Add label Billing");
      const moved = await callTool(page, "act", {
        steps: [
          { ref: "Macro actions", action: "move", args: [billingName, 0] },
        ],
      });
      await attachJson(testInfo, "act", moved);
      const movedKeys = [
        ROW_KEYS[1]!,
        ROW_KEYS[0]!,
        ROW_KEYS[2]!,
        ROW_KEYS[3]!,
      ];
      expect(moved).toMatchObject({
        result: {
          ok: true,
          steps: [
            {
              step: 0,
              changes: [
                {
                  component: "sortable-list",
                  label: "Macro actions",
                  key: "value",
                  value: movedKeys,
                },
              ],
            },
          ],
        },
      });
      await expect
        .poll(shown)
        .toEqual(["Billing", "Urgent", "4 hours", "Urgent"]);
      // The rows are renamed for their new places.
      const afterMove = await callTool(page, "snapshot", {});
      await attachJson(testInfo, "snapshot-after-move", afterMove);
      expect(afterMove).toMatchObject({
        result: [{ ...LIST, value: movedKeys }],
      });
      expect(itemsOf(afterMove)).toEqual(
        rowItems(movedKeys, [
          "Action 1: Add label Billing",
          "Action 2: Add label Urgent",
          "Action 3: Snooze",
          "Action 4: Add label Urgent",
        ]),
      );
      await saveAndExpect([BILLING, URGENT, SNOOZE, URGENT]);

      // 2. The keyboard, from the first row's handle: Space picks it up,
      // ArrowDown moves it and Space drops it, with focus on the handle.
      await openEditor();
      expect(await shown()).toEqual(["Billing", "Urgent", "4 hours", "Urgent"]);
      const firstHandle = sheet.getByRole("button", {
        name: "Reorder action 1: Add label",
      });
      await firstHandle.focus();
      await expect(firstHandle).toBeFocused();

      // Escape during a move puts the row back without closing the sheet,
      // with focus on the handle; with nothing picked up, Escape closes it.
      await page.keyboard.press("Space");
      await expect(firstHandle).toHaveAttribute("aria-pressed", "true");
      await page.keyboard.press("ArrowDown");
      await expect(
        sheet.getByRole("button", { name: "Reorder action 2: Add label" }),
      ).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(sheet).toBeVisible();
      expect(await shown()).toEqual(["Billing", "Urgent", "4 hours", "Urgent"]);
      await expect(firstHandle).toHaveAttribute("aria-pressed", "false");
      await expect(firstHandle).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(sheet).toBeHidden();
      await openEditor();
      await firstHandle.focus();
      await expect(firstHandle).toBeFocused();

      await page.keyboard.press("Space");
      await expect(firstHandle).toHaveAttribute("aria-pressed", "true");
      await page.keyboard.press("ArrowDown");
      const movedHandle = sheet.getByRole("button", {
        name: "Reorder action 2: Add label",
      });
      await expect(movedHandle).toHaveAttribute("aria-pressed", "true");
      await expect(movedHandle).toBeFocused();
      await page.keyboard.press("Space");
      await expect(movedHandle).toHaveAttribute("aria-pressed", "false");
      await expect(movedHandle).toBeFocused();
      expect(await shown()).toEqual(["Urgent", "Billing", "4 hours", "Urgent"]);
      await snap(page, testInfo, `macro-keyboard-${viewport.label}`);
      await saveAndExpect([URGENT, BILLING, SNOOZE, URGENT]);

      // 3. A pointer drags the first row's handle below the second row.
      await openEditor();
      expect(await shown()).toEqual(["Urgent", "Billing", "4 hours", "Urgent"]);
      const handle = sheet.getByRole("button", {
        name: "Reorder action 1: Add label",
      });
      await handle.scrollIntoViewIfNeeded();
      const from = await handle.boundingBox();
      const target = await rows.nth(1).boundingBox();
      expect(from && target).toBeTruthy();
      const startX = from!.x + from!.width / 2;
      const startY = from!.y + from!.height / 2;
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX, startY + 8, { steps: 4 });
      await page.mouse.move(startX, target!.y + target!.height * 0.75, {
        steps: 12,
      });
      await page.mouse.up();
      await expect
        .poll(shown)
        .toEqual(["Billing", "Urgent", "4 hours", "Urgent"]);
      await saveAndExpect([BILLING, URGENT, SNOOZE, URGENT]);
    });

    test(`Support inbox: j, k, e and s, typing, the Support palette and Shift+? at ${viewport.label}`, async ({
      page,
    }, testInfo) => {
      const api = new SupportApiStub({ conversations: inboxConversations() });
      await api.install(page);
      const card = (index: number) =>
        page.getByRole("button", {
          name: new RegExp(`^${SUBJECTS[index - 1]}, from `),
        });
      await openMissionControl(page, "/support", viewport, card(1));
      await snap(page, testInfo, `inbox-${viewport.label}`);
      const selected = () => new URL(page.url()).searchParams.get("id");
      const conversationWrites = () => api.writes(/^conversations\//);
      // Every write the flow makes, so a late duplicate PATCH is caught.
      const WRITES = viewport.phone ? 2 : 3;
      // The board's lanes are regions named by status and count.
      const lane = (status: string) =>
        page.getByRole("region", {
          name: new RegExp(`^${status} conversations, `),
        });
      // The phone opens a conversation in a sheet named by its subject.
      const sheet = (index: number) =>
        page.getByRole("dialog", { name: SUBJECTS[index - 1] });
      const sincePress = async (count: number) =>
        (await pressedKeys(page)).slice(-count).map((key) => ({
          key: key.key,
          defaultPrevented: key.defaultPrevented,
        }));

      // Focus starts on the first card, without opening it.
      await card(1).focus();
      await expect(card(1)).toBeFocused();
      await expect(card(1)).toHaveAttribute("aria-current", "false");

      if (!viewport.phone) {
        // j and k move the open conversation and focus with it.
        await page.keyboard.press("j");
        await expect.poll(selected).toBe("conversation-1");
        await expect(card(1)).toHaveAttribute("aria-current", "true");
        await expect(card(1)).toBeFocused();
        await page.keyboard.press("j");
        await expect.poll(selected).toBe("conversation-2");
        await expect(card(2)).toHaveAttribute("aria-current", "true");
        await expect(card(1)).toHaveAttribute("aria-current", "false");
        await expect(card(2)).toBeFocused();
        await page.keyboard.press("k");
        await expect.poll(selected).toBe("conversation-1");
        await expect(card(1)).toHaveAttribute("aria-current", "true");
        await expect(card(1)).toBeFocused();
        expect(await sincePress(3)).toEqual([
          { key: "j", defaultPrevented: true },
          { key: "j", defaultPrevented: true },
          { key: "k", defaultPrevented: true },
        ]);
        expect(conversationWrites()).toEqual([]);
        await snap(page, testInfo, `inbox-k-${viewport.label}`);

        // s opens the open conversation's snooze menu; choosing a time
        // sends it once.
        const pane = page.getByRole("complementary", {
          name: "Conversation detail",
        });
        await page.keyboard.press("s");
        const snoozeMenu = page.getByRole("menu");
        await expect(snoozeMenu).toBeVisible();
        await expect(snoozeMenu).toContainText("Snooze until");
        await expect(
          snoozeMenu.getByRole("menuitem", { name: /^In 1 hour/ }),
        ).toBeVisible();
        expect(await sincePress(1)).toEqual([
          { key: "s", defaultPrevented: true },
        ]);
        await snap(page, testInfo, `inbox-s-${viewport.label}`);
        await page.keyboard.press("ArrowDown");
        await expect(
          snoozeMenu.getByRole("menuitem", { name: /^In 1 hour/ }),
        ).toBeFocused();
        const beforeSnooze = Date.now();
        await page.keyboard.press("Enter");
        await expect(snoozeMenu).toBeHidden();
        await expect.poll(() => conversationWrites().length).toBe(1);
        const [snoozed] = conversationWrites();
        expect(snoozed).toMatchObject({
          method: "PATCH",
          path: "conversations/conversation-1/snooze",
          body: {
            conversationId: "conversation-1",
            snoozedUntil: expect.any(String),
          },
        });
        const until = Date.parse(String(snoozed!.body!.snoozedUntil));
        expect(until).toBeGreaterThan(beforeSnooze + 50 * 60_000);
        expect(until).toBeLessThan(beforeSnooze + 70 * 60_000);
        // The snoozed card leaves the Open lane: focus and the selection go
        // to the card now in its place, and the next j steps on from there.
        await expect(
          lane("Snoozed").getByRole("button", {
            name: new RegExp(`^${SUBJECTS[0]}, from .*, status snoozed`),
          }),
        ).toBeVisible();
        await expect(card(2)).toBeFocused();
        await expect.poll(selected).toBe("conversation-2");
        await expect(card(2)).toHaveAttribute("aria-current", "true");
        await expect(
          pane.getByRole("heading", { name: SUBJECTS[1] }),
        ).toBeVisible();
        await snap(page, testInfo, `inbox-snoozed-${viewport.label}`);
        await page.keyboard.press("j");
        await expect.poll(selected).toBe("conversation-3");
        await expect(card(3)).toBeFocused();
        await expect(card(3)).toHaveAttribute("aria-current", "true");
        expect(await sincePress(1)).toEqual([
          { key: "j", defaultPrevented: true },
        ]);

        // From a card, e resolves its conversation once; the card leaves the
        // Open lane, focus and the selection go to the one left there, and
        // the next j steps on from there.
        await page.keyboard.press("e");
        await expect.poll(() => conversationWrites().length).toBe(2);
        expect(conversationWrites()[1]).toEqual({
          method: "PATCH",
          path: "conversations/conversation-3/status",
          body: { conversationId: "conversation-3", status: "resolved" },
        });
        await expect(page.getByText("Conversation resolved.")).toBeVisible();
        await expect(
          lane("Resolved").getByRole("button", {
            name: new RegExp(`^${SUBJECTS[2]}, from .*, status resolved`),
          }),
        ).toBeVisible();
        await expect(card(2)).toBeFocused();
        await expect.poll(selected).toBe("conversation-2");
        await snap(page, testInfo, `inbox-resolved-${viewport.label}`);
        await page.keyboard.press("j");
        await expect.poll(selected).toBe("conversation-3");
        await expect(card(3)).toBeFocused();
        await expect(card(3)).toHaveAttribute("aria-current", "true");
        await page.keyboard.press("k");
        await expect.poll(selected).toBe("conversation-2");
        await expect(card(2)).toBeFocused();
        expect(await sincePress(3)).toEqual([
          { key: "e", defaultPrevented: true },
          { key: "j", defaultPrevented: true },
          { key: "k", defaultPrevented: true },
        ]);
        expect(conversationWrites()).toHaveLength(2);

        // From the open conversation's pane, e resolves it once and focus
        // stays in the pane.
        const thread = pane.getByRole("region", { name: "Messages" });
        await thread.click();
        await expect(thread).toBeFocused();
        await page.keyboard.press("e");
        await expect.poll(() => conversationWrites().length).toBe(3);
        expect(conversationWrites()[2]).toEqual({
          method: "PATCH",
          path: "conversations/conversation-2/status",
          body: { conversationId: "conversation-2", status: "resolved" },
        });
        await expect(thread).toBeFocused();
        expect(selected()).toBe("conversation-2");
        // Once the move has landed, that e has written exactly once: every
        // request sent until now has reached the stub.
        await expect(
          lane("Resolved").getByRole("button", {
            name: new RegExp(`^${SUBJECTS[1]}, from .*, status resolved`),
          }),
        ).toBeVisible();
        await nextFrames(page);
        await supportRequestsArrived(page);
        expect(conversationWrites()).toHaveLength(WRITES);
      } else {
        // On a phone, j opens the next conversation in a sheet from the
        // board.
        await page.keyboard.press("j");
        await expect.poll(selected).toBe("conversation-1");
        await expect(sheet(1)).toBeVisible();
        // The modal sheet makes the board inert, so the card is found by id.
        await expect(
          page.locator('[data-conversation-id="conversation-1"] > button'),
        ).toHaveAttribute("aria-current", "true");
        await expect(
          sheet(1).getByRole("region", { name: "Messages" }),
        ).toBeVisible();
        await expect(sheet(1)).toBeFocused();
        await snap(page, testInfo, `inbox-j-${viewport.label}`);
        const focusInSheet = () =>
          page.evaluate(() =>
            Boolean(
              document.activeElement?.closest('[role="dialog"][data-open]'),
            ),
          );
        // Under the sheet the board is inert, so a card is found in its
        // lane by the lane's name and the card's id.
        const inLane = (status: string, id: string) =>
          page.locator(
            `[aria-label^="${status} conversations"] [data-conversation-id="${id}"]`,
          );
        // The first conversation's card in a lane, named for its status.
        const firstCardIn = (status: string) =>
          lane(status).getByRole("button", {
            name: new RegExp(
              `^${SUBJECTS[0]}, from .*, status ${status.toLowerCase()}`,
            ),
          });

        // In the sheet, j and k open the next and previous conversation
        // there, focus staying in the sheet.
        await page.keyboard.press("j");
        await expect.poll(selected).toBe("conversation-2");
        await expect(sheet(2)).toBeVisible();
        await expect(
          sheet(2).getByRole("region", { name: "Messages" }),
        ).toContainText(SUBJECTS[1]!);
        await expect.poll(focusInSheet).toBe(true);
        await page.keyboard.press("k");
        await expect.poll(selected).toBe("conversation-1");
        await expect(sheet(1)).toBeVisible();
        await expect.poll(focusInSheet).toBe(true);
        await page.keyboard.press("j");
        await expect.poll(selected).toBe("conversation-2");
        await expect(sheet(2)).toBeVisible();
        await expect.poll(focusInSheet).toBe(true);
        expect(await sincePress(3)).toEqual([
          { key: "j", defaultPrevented: true },
          { key: "k", defaultPrevented: true },
          { key: "j", defaultPrevented: true },
        ]);
        expect(conversationWrites()).toEqual([]);

        // Shift+? over the sheet lists the inbox keys that work in it: not
        // the page's sidebar key the sheet pauses, nor the Support palette's
        // Ctrl+K, which belongs to the inbox itself. Escape closes only the
        // list, back into the sheet.
        const sheetHelp = page.getByRole("dialog", {
          name: "Keyboard shortcuts",
        });
        await page.keyboard.press("Shift+?");
        await expect(sheetHelp).toBeVisible();
        const sheetRows = await sheetHelp
          .locator("li")
          .evaluateAll((items) =>
            items.map(
              (item) => item.firstElementChild?.textContent?.trim() ?? "",
            ),
          );
        await attachJson(testInfo, "phone-sheet-shortcut-help", sheetRows);
        expect([...sheetRows].sort()).toEqual(
          [
            "Next conversation",
            "Previous conversation",
            "Resolve conversation",
            "Show keyboard shortcuts",
            "Snooze",
          ].sort(),
        );
        await snap(
          page,
          testInfo,
          `phone-sheet-shortcut-help-${viewport.label}`,
        );
        await page.keyboard.press("Escape");
        await expect(sheetHelp).toBeHidden();
        await expect(sheet(2)).toBeVisible();
        await expect.poll(focusInSheet).toBe(true);

        // After j in the sheet, Escape closes it onto the card of the
        // conversation it showed last, not the card it was opened from, and
        // j works from there: it opens the first conversation.
        await page.keyboard.press("Escape");
        await expect(sheet(2)).toBeHidden();
        await expect.poll(selected).toBeNull();
        await expect(card(2)).toBeFocused();
        await expect(card(2)).toBeInViewport();
        await page.keyboard.press("j");
        await expect.poll(selected).toBe("conversation-1");
        await expect(sheet(1)).toBeVisible();
        await expect.poll(focusInSheet).toBe(true);
        expect(await sincePress(1)).toEqual([
          { key: "j", defaultPrevented: true },
        ]);
        await page.keyboard.press("Escape");
        await expect(sheet(1)).toBeHidden();
        await expect(card(1)).toBeFocused();

        // s in a sheet opened from its conversation's own card: one snooze
        // menu, a choice sends it once and focus goes back into the sheet.
        await page.keyboard.press("j");
        await expect.poll(selected).toBe("conversation-1");
        await expect(sheet(1)).toBeVisible();
        await expect.poll(focusInSheet).toBe(true);
        await page.keyboard.press("s");
        const snoozeMenu = page.getByRole("menu");
        await expect(snoozeMenu).toHaveCount(1);
        await expect(snoozeMenu).toBeVisible();
        await expect(snoozeMenu).toContainText("Snooze until");
        expect(await sincePress(2)).toEqual([
          { key: "j", defaultPrevented: true },
          { key: "s", defaultPrevented: true },
        ]);
        await snap(page, testInfo, `inbox-sheet-s-${viewport.label}`);
        await page.keyboard.press("ArrowDown");
        await expect(
          snoozeMenu.getByRole("menuitem", { name: /^In 1 hour/ }),
        ).toBeFocused();
        const beforeSnooze = Date.now();
        await page.keyboard.press("Enter");
        await expect(snoozeMenu).toBeHidden();
        await expect.poll(() => conversationWrites().length).toBe(1);
        const [snoozed] = conversationWrites();
        expect(snoozed).toMatchObject({
          method: "PATCH",
          path: "conversations/conversation-1/snooze",
          body: {
            conversationId: "conversation-1",
            snoozedUntil: expect.any(String),
          },
        });
        const until = Date.parse(String(snoozed!.body!.snoozedUntil));
        expect(until).toBeGreaterThan(beforeSnooze + 50 * 60_000);
        expect(until).toBeLessThan(beforeSnooze + 70 * 60_000);
        await expect(
          sheet(1).getByRole("button", { name: /^Snoozed until / }),
        ).toBeVisible();
        await expect.poll(focusInSheet).toBe(true);
        // The card that opened the sheet moved to the Snoozed lane.
        await expect(inLane("Snoozed", "conversation-1")).toHaveCount(1);

        // Escape closes the sheet onto that card in its new lane, brought on
        // screen, and j works from there.
        await page.keyboard.press("Escape");
        await expect(sheet(1)).toBeHidden();
        await expect.poll(selected).toBeNull();
        await expect(firstCardIn("Snoozed")).toBeFocused();
        await expect(firstCardIn("Snoozed")).toBeInViewport();
        await snap(page, testInfo, `inbox-sheet-snoozed-${viewport.label}`);
        await page.keyboard.press("j");
        await expect.poll(selected).toBe("conversation-1");
        await expect(sheet(1)).toBeVisible();
        await expect.poll(focusInSheet).toBe(true);
        expect(await sincePress(1)).toEqual([
          { key: "j", defaultPrevented: true },
        ]);

        // e in that sheet, opened from the conversation's own card again,
        // resolves it once. Escape closes the sheet before the save lands,
        // onto the card still in the Snoozed lane; once the save lands, the
        // card moves to the Resolved lane and focus follows it there.
        const releaseResolve = api.holdWrites();
        await page.keyboard.press("e");
        await expect.poll(() => conversationWrites().length).toBe(2);
        expect(conversationWrites()[1]).toEqual({
          method: "PATCH",
          path: "conversations/conversation-1/status",
          body: { conversationId: "conversation-1", status: "resolved" },
        });
        expect(await sincePress(1)).toEqual([
          { key: "e", defaultPrevented: true },
        ]);
        expect(selected()).toBe("conversation-1");
        await expect.poll(focusInSheet).toBe(true);
        await page.keyboard.press("Escape");
        await expect(sheet(1)).toBeHidden();
        await expect.poll(selected).toBeNull();
        await expect(firstCardIn("Snoozed")).toBeFocused();
        await expect(firstCardIn("Snoozed")).toBeInViewport();
        await expect(page.getByText("Conversation resolved.")).toHaveCount(0);
        releaseResolve();
        await expect(page.getByText("Conversation resolved.")).toBeVisible();
        await expect(inLane("Resolved", "conversation-1")).toHaveCount(1);
        await expect(inLane("Snoozed", "conversation-1")).toHaveCount(0);
        await expect(firstCardIn("Resolved")).toBeFocused();
        await expect(firstCardIn("Resolved")).toBeInViewport();
        // Once the move has landed, that e has written exactly once: every
        // request sent until now has reached the stub.
        await nextFrames(page);
        await supportRequestsArrived(page);
        expect(conversationWrites()).toHaveLength(WRITES);
        await snap(page, testInfo, `inbox-sheet-resolved-${viewport.label}`);

        // j works from the card in the Resolved lane, and Escape closes the
        // sheet onto it again.
        await page.keyboard.press("j");
        await expect.poll(selected).toBe("conversation-1");
        await expect(sheet(1)).toBeVisible();
        await expect.poll(focusInSheet).toBe(true);
        expect(await sincePress(1)).toEqual([
          { key: "j", defaultPrevented: true },
        ]);
        await page.keyboard.press("Escape");
        await expect(sheet(1)).toBeHidden();
        await expect(firstCardIn("Resolved")).toBeFocused();
        await expect(firstCardIn("Resolved")).toBeInViewport();
        expect(conversationWrites()).toHaveLength(WRITES);
      }

      // Typing in the search field types: no key moves, resolves or
      // snoozes anything, and none is taken from the field.
      const selectedBefore = selected();
      const search = page.getByRole("textbox", {
        name: "Search conversations",
      });
      await search.click();
      await expect(search).toBeFocused();
      await page.keyboard.type("jkes");
      await expect(search).toHaveValue("jkes");
      await expect(search).toBeFocused();
      expect(await sincePress(4)).toEqual(
        ["j", "k", "e", "s"].map((key) => ({ key, defaultPrevented: false })),
      );
      expect(selected()).toBe(selectedBefore);
      expect(conversationWrites()).toHaveLength(WRITES);

      // Cleared at once, before the typed search has reached the URL: the
      // field stays empty and the URL ends without a search.
      const query = () => new URL(page.url()).searchParams.get("q");
      await page.keyboard.press("Control+A");
      await page.keyboard.press("Backspace");
      await expect(search).toHaveValue("");
      await expect(search).toBeFocused();
      await expect.poll(query).toBeNull();
      await expect(search).toHaveValue("");
      // Cleared again the moment the typed search filters the board, without
      // waiting for the URL to show it: every conversation comes back, the
      // field stays empty and the URL ends without a search.
      await page.keyboard.type("jkes");
      await expect(card(1)).toHaveCount(0);
      await page.keyboard.press("Control+A");
      await page.keyboard.press("Backspace");
      await expect(search).toHaveValue("");
      await expect(card(1)).toBeVisible();
      await expect(card(2)).toBeVisible();
      await expect(card(3)).toBeVisible();
      await expect.poll(query).toBeNull();
      await expect(search).toHaveValue("");
      await expect(search).toBeFocused();
      // A search typed next is the one that lands: a late "jkes" would
      // have come back into the field ahead of it, or kept the URL.
      await page.keyboard.type("Ruth");
      await expect.poll(query).toBe("Ruth");
      await expect(search).toHaveValue("Ruth");
      await expect(card(3)).toBeVisible();
      await expect(card(1)).toHaveCount(0);
      await expect(card(2)).toHaveCount(0);
      // Clear search empties the field, keeps focus there and the URL ends
      // without a search; every conversation is back.
      await page.getByRole("button", { name: "Clear search" }).click();
      await expect(search).toHaveValue("");
      await expect(search).toBeFocused();
      await expect.poll(query).toBeNull();
      await expect(search).toHaveValue("");
      await expect(card(1)).toBeVisible();
      await expect(card(2)).toBeVisible();
      await expect(card(3)).toBeVisible();
      expect(conversationWrites()).toHaveLength(WRITES);

      // Ctrl+K from the inbox opens the Support palette, not Mission
      // Control's, and Ctrl+K inside it closes it.
      const supportPalette = page.getByRole("dialog", {
        name: "Support hub commands",
      });
      const missionControlPalette = page.getByRole("dialog", {
        name: "Mission Control navigation",
      });
      await card(3).focus();
      await page.keyboard.press("Control+K");
      await expect(supportPalette).toBeVisible();
      await expect(missionControlPalette).toHaveCount(0);
      const paletteSearch = supportPalette.getByRole("combobox");
      await expect(paletteSearch).toBeFocused();
      await expect(supportPalette).toContainText("Next conversation");
      await snap(page, testInfo, `inbox-palette-${viewport.label}`);
      await page.keyboard.press("Control+K");
      await expect(supportPalette).toBeHidden();
      await expect(missionControlPalette).toHaveCount(0);
      await expect(card(3)).toBeFocused();
      expect(await sincePress(2)).toEqual([
        { key: expect.stringMatching(/^k$/i), defaultPrevented: true },
        { key: expect.stringMatching(/^k$/i), defaultPrevented: true },
      ]);

      // Shift+? from inside the inbox lists the inbox keys.
      const help = page.getByRole("dialog", { name: "Keyboard shortcuts" });
      await page.keyboard.press("Shift+?");
      await expect(help).toBeVisible();
      const rows = await help.locator("li").evaluateAll((items) =>
        items.map((item) => ({
          description: item.firstElementChild?.textContent?.trim() ?? "",
          spoken: item.querySelector(".sr-only")?.textContent ?? "",
        })),
      );
      await attachJson(testInfo, "inbox-shortcut-help", rows);
      // Exactly what works there: the inbox's Ctrl+K replaces Mission
      // Control's page search, which is not listed.
      expect(rows).toEqual([
        { description: "Toggle sidebar", spoken: "Control+B" },
        { description: "Show keyboard shortcuts", spoken: "Shift+?" },
        { description: "Open command palette", spoken: "Control+K" },
        { description: "Next conversation", spoken: "J" },
        { description: "Previous conversation", spoken: "K" },
        { description: "Resolve conversation", spoken: "E" },
        { description: "Snooze", spoken: "S" },
      ]);
      await snap(page, testInfo, `inbox-shortcut-help-${viewport.label}`);
      await page.keyboard.press("Escape");
      await expect(help).toBeHidden();
      await expect(card(3)).toBeFocused();
      // No write came late, at any point in the flow.
      await supportRequestsArrived(page);
      expect(conversationWrites()).toHaveLength(WRITES);
    });

    // The sends themselves, with an agent, are proven in the Base UI
    // compliance harness (specs/support-composer.spec.ts).
    test(`Support composer: Ctrl+Enter in Reply and Internal note runs the send once and inserts no line break at ${viewport.label}`, async ({
      page,
    }, testInfo) => {
      const api = new SupportApiStub({ conversations: inboxConversations() });
      await api.install(page);
      const card = page.getByRole("button", {
        name: new RegExp(`^${SUBJECTS[2]}, from `),
      });
      await openMissionControl(page, "/support", viewport, card);
      // Placeholder Supabase serves no profile, so the demo admin has no
      // email and Support Hub cannot match them to an agent: it says so.
      await expect(page.getByText("Support agent setup")).toBeVisible();
      const setupToasts = page.locator("[data-sonner-toast]").filter({
        hasText:
          "You’re not set up as a support agent yet. Ask a support admin to set you up as an agent.",
      });

      await card.click();
      const detail = viewport.phone
        ? page.getByRole("dialog", { name: SUBJECTS[2] })
        : page.getByRole("complementary", { name: "Conversation detail" });
      await expect(
        detail.getByRole("region", { name: "Messages" }),
      ).toContainText("Hello, a question about");
      await detail.getByRole("button", { name: "Reply", exact: true }).click();

      for (const mode of [
        { tab: "Reply", editor: "Reply message", text: "Thanks for writing" },
        { tab: "Internal note", editor: "Internal note", text: "Called back" },
      ]) {
        const composer = detail.getByRole("group", {
          name: "Conversation composer",
        });
        if (mode.tab === "Internal note") {
          await composer.getByRole("tab", { name: "Internal note" }).click();
        }
        const editor = composer.getByRole("textbox", { name: mode.editor });
        await editor.click();
        await expect(editor).toBeFocused();
        await page.keyboard.type(mode.text);
        await expect(editor).toHaveText(mode.text);
        // A line break is a <br> in the paragraph, a new paragraph a <p>.
        await expect(editor.locator("p")).toHaveCount(1);
        await expect(editor.locator("br")).toHaveCount(0);
        // The previous pass's notice is gone, so only this send can show one.
        await expect(setupToasts).toHaveCount(0, { timeout: 30_000 });

        await page.keyboard.press("Control+Enter");
        // Without an agent, the send runs once and stops before any request,
        // saying why.
        await expect(setupToasts).toHaveCount(1);
        await nextFrames(page);
        await expect(setupToasts).toHaveCount(1);
        // The composer's shortcut took the key: no line break went in.
        expect((await pressedKeys(page)).at(-1)).toEqual({
          key: "Enter",
          ctrlKey: true,
          shiftKey: false,
          repeat: false,
          defaultPrevented: true,
        });
        await expect(editor.locator("p")).toHaveCount(1);
        await expect(editor.locator("br")).toHaveCount(0);
        await expect(editor).toHaveText(mode.text);
        await expect(editor).toBeFocused();
        expect(api.writes(/\/(replies|notes)$/)).toEqual([]);
        await snap(page, testInfo, `composer-${mode.tab}-${viewport.label}`);
      }
    });

    test(`Email Studio: Ctrl+S opens the one Save dialog, a held Ctrl+S never reaches the browser and Ctrl+Z in a field is the field's at ${viewport.label}`, async ({
      page,
    }, testInfo) => {
      const saves: SentRequest[] = [];
      await page.route("**/api/email/templates**", async (route) => {
        const request = route.request();
        if (request.method() !== "GET") {
          saves.push({
            method: request.method(),
            path: new URL(request.url()).pathname,
            body: (request.postDataJSON() as Json | null) ?? null,
          });
        }
        await route.fulfill({ json: { success: true, templates: [] } });
      });
      const name = page.getByRole("textbox", { name: "Template name" });
      await openMissionControl(page, "/email", viewport, name);
      // The React Email editor is local; the studio is ready once it is.
      await expect(name).toBeEnabled({ timeout: 120_000 });
      const saveDialog = page.getByRole("dialog", {
        name: "Save email template",
      });
      const openDialogs = page.locator(
        '[role="dialog"][data-open], [role="alertdialog"][data-open]',
      );

      // Once, from the page: the Save dialog opens and the key is taken.
      await focusBody(page);
      await page.keyboard.press("Control+S");
      await expect(saveDialog).toBeVisible();
      await expect(openDialogs).toHaveCount(1);
      expect((await pressedKeys(page)).at(-1)).toMatchObject({
        key: expect.stringMatching(/^s$/i),
        ctrlKey: true,
        repeat: false,
        defaultPrevented: true,
      });
      await snap(page, testInfo, `email-save-${viewport.label}`);
      await page.keyboard.press("Escape");
      await expect(saveDialog).toBeHidden();

      // Held: the first keydown opens the dialog, every repeat is taken
      // from the browser too, and none submits the dialog or opens another.
      await focusBody(page);
      const before = (await pressedKeys(page)).length;
      await page.keyboard.down("Control");
      for (let press = 0; press < 4; press += 1) {
        await page.keyboard.down("s");
      }
      await page.keyboard.up("s");
      await page.keyboard.up("Control");
      await expect(saveDialog).toBeVisible();
      await nextFrames(page);
      await expect(openDialogs).toHaveCount(1);
      expect((await pressedKeys(page)).slice(before)).toEqual(
        [false, true, true, true].map((repeat) => ({
          key: expect.stringMatching(/^s$/i),
          ctrlKey: true,
          shiftKey: false,
          repeat,
          defaultPrevented: true,
        })),
      );
      expect(saves).toEqual([]);
      await page.keyboard.press("Escape");
      await expect(saveDialog).toBeHidden();

      // Ctrl+Z outside a field is the studio's undo; in a text field it is
      // left to the field, whose own undo takes back the typing.
      await focusBody(page);
      await page.keyboard.press("Control+Z");
      expect((await pressedKeys(page)).at(-1)).toMatchObject({
        key: expect.stringMatching(/^z$/i),
        ctrlKey: true,
        defaultPrevented: true,
      });
      await name.click();
      await expect(name).toBeFocused();
      const original = await name.inputValue();
      await page.keyboard.press("End");
      await page.keyboard.type(" spring appeal");
      await expect(name).toHaveValue(`${original} spring appeal`);
      await page.keyboard.press("Control+Z");
      await expect(name).toHaveValue(original);
      await expect(name).toBeFocused();
      expect((await pressedKeys(page)).at(-1)).toMatchObject({
        key: expect.stringMatching(/^z$/i),
        ctrlKey: true,
        defaultPrevented: false,
      });
      expect(saves).toEqual([]);
    });

    test(`PDF Studio: Ctrl+S, held or not, never reaches the browser while the editor loads at ${viewport.label}`, async ({
      page,
    }, testInfo) => {
      // The Unlayer editor is a third-party embed, never loaded here.
      await page.route("https://editor.unlayer.com/**", (route) =>
        route.abort(),
      );
      const requests: string[] = [];
      await page.route("**/api/pdf-templates**", async (route) => {
        requests.push(`${route.request().method()} ${route.request().url()}`);
        await route.fulfill({ json: { success: true, templates: [] } });
      });
      const more = page.getByRole("button", {
        name: "More PDF template actions",
      });
      await openMissionControl(page, "/pdf", viewport, more);
      await snap(page, testInfo, `pdf-${viewport.label}`);
      const openDialogs = page.locator(
        '[role="dialog"][data-open], [role="alertdialog"][data-open]',
      );

      await focusBody(page);
      const before = (await pressedKeys(page)).length;
      await page.keyboard.press("Control+S");
      await page.keyboard.down("Control");
      for (let press = 0; press < 4; press += 1) {
        await page.keyboard.down("s");
      }
      await page.keyboard.up("s");
      await page.keyboard.up("Control");
      await nextFrames(page);
      expect((await pressedKeys(page)).slice(before)).toEqual(
        [false, false, true, true, true].map((repeat) => ({
          key: expect.stringMatching(/^s$/i),
          ctrlKey: true,
          shiftKey: false,
          repeat,
          defaultPrevented: true,
        })),
      );
      // Save waits for an editor, so no dialog opens without one.
      await expect(openDialogs).toHaveCount(0);
      expect(requests.filter((request) => !request.startsWith("GET"))).toEqual(
        [],
      );
    });

    test(`PDF Studio with the native builder: Ctrl+S opens the one Save dialog and a held Ctrl+S never reaches the browser at ${viewport.label}`, async ({
      page,
    }, testInfo) => {
      test.skip(
        !nativePdfBaseURL,
        "Set PLAYWRIGHT_ADMIN_PDF_NATIVE_URL to a Mission Control dev server started with NEXT_PUBLIC_PDF_STUDIO_NATIVE_BUILDER_ENABLED=true.",
      );
      // The native document builder needs no Unlayer embed: block it, so
      // Save can only work without it.
      await page.route("https://editor.unlayer.com/**", (route) =>
        route.abort(),
      );
      const writes: SentRequest[] = [];
      await page.route("**/api/pdf-templates**", async (route) => {
        const request = route.request();
        if (request.method() !== "GET") {
          writes.push({
            method: request.method(),
            path: new URL(request.url()).pathname,
            body: (request.postDataJSON() as Json | null) ?? null,
          });
        }
        await route.fulfill({ json: { success: true, templates: [] } });
      });
      const more = page.getByRole("button", {
        name: "More PDF template actions",
      });
      await openMissionControl(page, "/pdf", viewport, more, nativePdfBaseURL);
      const saveDialog = page.getByRole("dialog", {
        name: "Save PDF Template",
      });
      const openDialogs = page.locator(
        '[role="dialog"][data-open], [role="alertdialog"][data-open]',
      );

      // That server has the flag on: its menu offers a native document.
      await more.click();
      const newNative = page.getByRole("menuitem", {
        name: "New native document",
      });
      await expect(newNative).toBeVisible();
      await newNative.click();
      const source = page.getByRole("textbox", {
        name: "PDF template source",
      });
      await expect(source).toBeVisible();
      await expect(source).toHaveValue(/"name": "Untitled document"/);
      await snap(page, testInfo, `pdf-native-${viewport.label}`);

      // Once, from the page: the Save dialog opens and the key is taken.
      await focusBody(page);
      await page.keyboard.press("Control+S");
      await expect(saveDialog).toBeVisible();
      await expect(openDialogs).toHaveCount(1);
      expect((await pressedKeys(page)).at(-1)).toMatchObject({
        key: expect.stringMatching(/^s$/i),
        ctrlKey: true,
        repeat: false,
        defaultPrevented: true,
      });
      await snap(page, testInfo, `pdf-native-save-${viewport.label}`);
      await page.keyboard.press("Escape");
      await expect(saveDialog).toBeHidden();

      // Held: the first keydown opens the dialog, every repeat is taken
      // from the browser too, and none submits the dialog or opens another.
      await focusBody(page);
      const before = (await pressedKeys(page)).length;
      await page.keyboard.down("Control");
      for (let press = 0; press < 4; press += 1) {
        await page.keyboard.down("s");
      }
      await page.keyboard.up("s");
      await page.keyboard.up("Control");
      await expect(saveDialog).toBeVisible();
      await nextFrames(page);
      await expect(openDialogs).toHaveCount(1);
      expect((await pressedKeys(page)).slice(before)).toEqual(
        [false, true, true, true].map((repeat) => ({
          key: expect.stringMatching(/^s$/i),
          ctrlKey: true,
          shiftKey: false,
          repeat,
          defaultPrevented: true,
        })),
      );
      await page.keyboard.press("Escape");
      await expect(saveDialog).toBeHidden();

      // From the template source field too, Save takes the key and types
      // nothing there.
      await source.click();
      await expect(source).toBeFocused();
      const text = await source.inputValue();
      await page.keyboard.press("Control+S");
      await expect(saveDialog).toBeVisible();
      await expect(openDialogs).toHaveCount(1);
      expect((await pressedKeys(page)).at(-1)).toMatchObject({
        key: expect.stringMatching(/^s$/i),
        ctrlKey: true,
        defaultPrevented: true,
      });
      await page.keyboard.press("Escape");
      await expect(saveDialog).toBeHidden();
      await expect(source).toHaveValue(text);
      expect(writes).toEqual([]);
    });

    test(`Locations: the page hydrates without a mismatch and Escape cancels pin placement at ${viewport.label}`, async ({
      page,
    }, testInfo) => {
      // The map's base style is a third-party file: answer it with an empty
      // style so the map loads and takes clicks.
      await page.route("https://basemaps.cartocdn.com/**", (route) =>
        route.fulfill({
          json: {
            version: 8,
            sources: {},
            layers: [
              {
                id: "background",
                type: "background",
                paint: { "background-color": "#e4e4e7" },
              },
            ],
          },
        }),
      );
      await page.route("**/api/admin/locations", (route) =>
        route.request().method() === "GET"
          ? route.fulfill({
              json: {
                locations: [
                  {
                    id: "5b0c3a52-4c1e-4c47-9a39-3f1f5e0b9d11",
                    tenant_id: TENANT,
                    title: "Nairobi guesthouse",
                    lat: -1.2921,
                    lng: 36.8219,
                    type: "project",
                    linked_id: null,
                    summary: null,
                    image_public_id: null,
                    status: "published",
                    sort_key: 0,
                    created_at: STAMP,
                    updated_at: STAMP,
                  },
                ],
                linkedEntities: { missionaries: [], projects: [] },
              },
            })
          : route.abort(),
      );
      const place = page.getByRole("button", { name: "Place on map" });
      // Twice: a mismatch used to depend on the server's shared locations
      // state, so one clean load proved little.
      for (let load = 0; load < 2; load += 1) {
        await openMissionControl(page, "/mobilize/locations", viewport, place);
        // Enabled once the browser has loaded the locations without error.
        await expect(place).toBeEnabled({ timeout: 120_000 });
      }
      expect(consoleOf.get(page)!.hydration, "hydration errors").toEqual([]);
      const hint = page.getByText(
        "Click the map to place a pin. Press Escape to cancel.",
      );
      const editor = page.getByRole("dialog");
      const map = page.locator(".maplibregl-canvas");
      await expect(map).toBeVisible();

      await place.click();
      await expect(place).toHaveAttribute("aria-pressed", "true");
      await expect(hint).toBeVisible();
      await snap(page, testInfo, `locations-placing-${viewport.label}`);
      await expect(place).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(place).toHaveAttribute("aria-pressed", "false");
      await expect(hint).toBeHidden();
      expect((await pressedKeys(page)).at(-1)).toMatchObject({
        key: "Escape",
        defaultPrevented: true,
      });
      // Once cancelled, a click on the map places nothing.
      const box = await map.boundingBox();
      expect(box).toBeTruthy();
      await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
      await nextFrames(page);
      await expect(editor).toHaveCount(0);

      // While placing, the same click places a pin and opens the editor,
      // so the cancelled click above was a real map click.
      await place.click();
      await expect(place).toHaveAttribute("aria-pressed", "true");
      await expect(hint).toBeVisible();
      // The map's click handler takes the new mode in a passive effect.
      await nextFrames(page);
      await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
      await expect(editor).toBeVisible();
      await expect(
        page.getByText("Pin placed. Add the location's details."),
      ).toBeVisible();
      // The page hydrated without a server/client mismatch: the shared
      // afterEach fails the test on any hydration error.
    });
  }
});

const SUBJECTS = [
  "Receipt for my March gift",
  "Update my card details",
  "Change my mailing address",
];

function inboxConversations(): Json[] {
  return [
    conversationFixture(1, SUBJECTS[0]!, "Grace Park", 30),
    conversationFixture(2, SUBJECTS[1]!, "Daniel Ortiz", 60),
    conversationFixture(3, SUBJECTS[2]!, "Ruth Mensah", 90),
  ];
}
