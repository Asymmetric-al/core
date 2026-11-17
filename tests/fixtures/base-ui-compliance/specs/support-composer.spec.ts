import { test, expect } from "./test";

import type { Locator, Page, Route } from "@playwright/test";

// The real Support composer with a signed-in agent, which the Mission Control
// dev server cannot provide (placeholder Supabase has no agent profile). The
// spec answers the composer's requests and holds each send open, so the
// editor and focus can be read as the send left them before it lands.

test.use({
  fixture: { path: "/support-composer.html", heading: "Support composer" },
});

const VIEWPORTS = [
  { label: "1280", width: 1280, height: 844 },
  { label: "375", width: 375, height: 812 },
] as const;

const CONVERSATION = "conversation-composer";
const AGENT = "agent-avery";
const AGENT_RECORD = {
  id: AGENT,
  name: "Avery Admin",
  email: "avery@example.test",
  avatarUrl: null,
  title: "Donor care",
};
const SIGNATURE = "\n\n--\nAvery Admin\nDonor care\navery@example.test";

const STAMP = "2026-11-10T15:00:00.000Z";
// As support-composer-main.tsx seeds it, in the route handler's shape.
const CONVERSATION_RECORD = {
  id: CONVERSATION,
  tenantId: "00000000-0000-0000-0000-000000000001",
  inboxId: "inbox-care",
  subject: "Receipt for my March gift",
  status: "open",
  priority: "normal",
  channel: "email",
  assignee: null,
  team: null,
  externalContactEmail: "grace@example.test",
  externalContactName: "Grace Park",
  contact: null,
  labels: [],
  unreadCount: 0,
  messageCount: 1,
  firstMessageAt: STAMP,
  lastMessageAt: STAMP,
  lastCustomerMessageAt: STAMP,
  lastMessageDirection: "inbound",
  firstRespondedAt: null,
  firstResponseDueAt: null,
  nextResponseDueAt: null,
  resolvedAt: null,
  snoozedUntil: null,
  escalatedAt: null,
  boardOrder: 1,
  slaPolicyId: null,
  createdAt: STAMP,
  updatedAt: STAMP,
};

type Json = Record<string, unknown>;
type Sent = { method: string; path: string; body: Json | null };
type KeyRecord = {
  key: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  defaultPrevented: boolean;
};
type FocusLoss = { pending: boolean; what: string };
type SpecWindow = Window & {
  __keyLog?: KeyRecord[];
  __focusLosses?: FocusLoss[];
  __sendPending?: boolean;
};

/** Answers the composer's Support Hub calls and holds each send until released. */
class ComposerApi {
  readonly sent: Sent[] = [];
  readonly unexpected: string[] = [];
  private release: () => void = () => {};
  private held = Promise.resolve();

  holdNextSend() {
    this.held = new Promise((resolve) => {
      this.release = resolve;
    });
  }

  releaseSend() {
    this.release();
  }

  sends(kind: "replies" | "notes") {
    return this.sent.filter((request) =>
      request.path.endsWith(`/conversations/${CONVERSATION}/${kind}`),
    );
  }

  async install(page: Page) {
    await page.route("**/api/admin/support/**", (route) => this.answer(route));
  }

  private async answer(route: Route) {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (request.method() === "POST" && /\/(replies|notes)$/.test(path)) {
      this.sent.push({
        method: request.method(),
        path,
        body: (request.postDataJSON() as Json | null) ?? null,
      });
      await this.held;
      return route.fulfill({
        json: { message: { id: `sent-${this.sent.length}` } },
      });
    }
    // A send invalidates the Support Hub cache, which reads these again.
    if (request.method() === "GET") {
      if (path.endsWith("/agents"))
        return route.fulfill({ json: { agents: [AGENT_RECORD] } });
      if (path.endsWith("/canned-responses"))
        return route.fulfill({ json: { cannedResponses: [] } });
      if (path.endsWith(`/conversations/${CONVERSATION}`))
        return route.fulfill({ json: { conversation: CONVERSATION_RECORD } });
    }
    this.unexpected.push(`${request.method()} ${path}`);
    return route.fulfill({ status: 404, json: { error: "Not in fixture." } });
  }
}

async function recordKeys(page: Page) {
  await page.evaluate(() => {
    const log: KeyRecord[] = [];
    (window as SpecWindow).__keyLog = log;
    window.addEventListener("keydown", (event) =>
      log.push({
        key: event.key,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        defaultPrevented: event.defaultPrevented,
      }),
    );
  });
}

const lastKey = (page: Page) =>
  page.evaluate(() => (window as SpecWindow).__keyLog?.at(-1));

/**
 * Records every moment focus falls to the page: focus leaving an element for
 * nowhere, and every painted frame with nothing focused. Each entry notes
 * whether a send was pending then.
 */
async function watchFocusLoss(page: Page) {
  await page.evaluate(() => {
    const losses: FocusLoss[] = [];
    const spec = window as SpecWindow;
    spec.__focusLosses = losses;
    const pending = () => spec.__sendPending === true;
    const describe = (node: EventTarget | null) =>
      node instanceof Element
        ? `${node.tagName.toLowerCase()} "${node.getAttribute("aria-label") ?? node.textContent?.trim().slice(0, 40) ?? ""}"`
        : String(node);
    document.addEventListener(
      "focusout",
      (event) => {
        if (event.relatedTarget === null)
          losses.push({
            pending: pending(),
            what: `focus left ${describe(event.target)} for the page`,
          });
      },
      true,
    );
    const frame = () => {
      const active = document.activeElement;
      if (!active || active === document.body)
        losses.push({
          pending: pending(),
          what: "a frame painted with the page focused",
        });
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}

const bodyHasFocus = (page: Page) =>
  page.evaluate(() => document.activeElement === document.body);

const markPending = (page: Page, pending: boolean) =>
  page.evaluate((value) => {
    (window as SpecWindow).__sendPending = value;
  }, pending);

const focusLosses = (page: Page) =>
  page.evaluate(() => [...((window as SpecWindow).__focusLosses ?? [])]);

const nextFrames = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );

/** The editor's document as the user sees it: paragraphs and line breaks. */
async function expectDocument(
  editor: Locator,
  paragraphs: string[],
  lineBreaks: number,
) {
  await expect(editor.locator("p")).toHaveCount(paragraphs.length);
  // A line break is a <br> inside a paragraph.
  await expect(editor.locator("p br")).toHaveCount(lineBreaks);
  await expect(editor.locator("br")).toHaveCount(lineBreaks);
  await expect(editor.locator("p")).toHaveText(paragraphs);
}

/** The composer, its two editors and their send buttons. */
function composerOf(page: Page) {
  const composer = page.getByRole("group", { name: "Conversation composer" });
  return {
    composer,
    reply: composer.getByRole("textbox", { name: "Reply message" }),
    note: composer.getByRole("textbox", { name: "Internal note" }),
    // Named for the send, and for the send under way while it is pending.
    sendReply: composer.getByRole("button", {
      name: /^(Send|Sending) reply to donor$/,
    }),
    addNote: composer.getByRole("button", {
      name: /^(Add|Saving) internal note$/,
    }),
  };
}

/**
 * Holds the send `start` begins, checks what holds focus while it is pending
 * and that focus never fell to the page meanwhile, then lets it land and
 * checks focus went straight back to the cleared, editable editor.
 */
async function sendHeld(
  page: Page,
  api: ComposerApi,
  {
    kind,
    editor,
    start,
    whilePending,
  }: {
    kind: "replies" | "notes";
    editor: Locator;
    start: () => Promise<void>;
    whilePending: () => Promise<void>;
  },
) {
  const sentBefore = api.sends(kind).length;
  const lossesBefore = (await focusLosses(page)).length;
  api.holdNextSend();
  await markPending(page, true);
  await start();
  await expect.poll(() => api.sends(kind).length).toBe(sentBefore + 1);
  // Read-only while the send is pending.
  await expect(editor).toHaveAttribute("contenteditable", "false");
  await whilePending();
  await nextFrames(page);
  await markPending(page, false);
  expect(
    (await focusLosses(page))
      .slice(lossesBefore)
      .filter((loss) => loss.pending),
    "focus fell to the page while the send was pending",
  ).toEqual([]);
  api.releaseSend();
  // The send landed: the editor is cleared, editable again and focused.
  await expect(editor).toHaveAttribute("contenteditable", "true");
  await expect(editor).toHaveText("");
  await expect(editor).toBeFocused();
  await nextFrames(page);
  expect(
    (await focusLosses(page)).slice(lossesBefore),
    "focus fell to the page while the send landed",
  ).toEqual([]);
  expect(api.sends(kind)).toHaveLength(sentBefore + 1);
}

for (const viewport of VIEWPORTS) {
  test(`real Support composer: Ctrl+Enter sends the reply once and the note once without a line break, focus waits on the composer while each is pending and returns to the cleared editor, Shift+Enter breaks the line and Enter starts a paragraph at ${viewport.label}`, async ({
    page,
  }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    const api = new ComposerApi();
    await api.install(page);
    await recordKeys(page);
    await watchFocusLoss(page);
    const { composer, reply, note } = composerOf(page);
    await expect(reply).toBeFocused();

    // Reply: Ctrl+Enter sends the typed reply once, and the key never
    // reaches the editor as a line break. While it is pending the editor is
    // read-only and focus waits on the composer, not the page.
    await page.keyboard.type("Thanks for writing");
    await expectDocument(reply, ["Thanks for writing"], 0);
    await sendHeld(page, api, {
      kind: "replies",
      editor: reply,
      start: () => page.keyboard.press("Control+Enter"),
      whilePending: async () => {
        expect(await lastKey(page)).toEqual({
          key: "Enter",
          ctrlKey: true,
          shiftKey: false,
          defaultPrevented: true,
        });
        await expectDocument(reply, ["Thanks for writing"], 0);
        await expect(composer).toBeFocused();
      },
    });
    const [sentReply] = api.sends("replies");
    expect(sentReply!.body).toMatchObject({
      conversationId: CONVERSATION,
      authorAgentId: AGENT,
      mode: "send",
      payload: {
        json: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Thanks for writing" }],
            },
          ],
        },
        // The signature follows the reply, not a line break from the key.
        text: `Thanks for writing${SIGNATURE}`,
        html: expect.stringMatching(
          /^<p>Thanks for writing<\/p>\n<p class="support-signature">/,
        ),
        attachments: [],
      },
    });
    await expect(page.getByText("Reply sent.")).toBeVisible();
    expect(api.sends("notes")).toEqual([]);

    // Internal note: the same key adds the note once, with no line break.
    await composer.getByRole("tab", { name: "Internal note" }).click();
    await expect(note).toBeFocused();
    await page.keyboard.type("Called back");
    await expectDocument(note, ["Called back"], 0);
    await sendHeld(page, api, {
      kind: "notes",
      editor: note,
      start: () => page.keyboard.press("Control+Enter"),
      whilePending: async () => {
        expect(await lastKey(page)).toEqual({
          key: "Enter",
          ctrlKey: true,
          shiftKey: false,
          defaultPrevented: true,
        });
        await expectDocument(note, ["Called back"], 0);
        await expect(composer).toBeFocused();
      },
    });
    expect(api.sends("notes")[0]!.body).toEqual({
      conversationId: CONVERSATION,
      authorAgentId: AGENT,
      bodyText: "Called back",
      bodyHtml: "<p>Called back</p>",
    });
    await expect(page.getByText("Internal note added.")).toBeVisible();
    expect(api.sends("replies")).toHaveLength(1);

    // Back in Reply: Shift+Enter puts one line break in the paragraph and
    // Enter starts a new paragraph; neither sends.
    await composer.getByRole("tab", { name: "Reply" }).click();
    await expect(reply).toBeFocused();
    await page.keyboard.type("First line");
    await page.keyboard.press("Shift+Enter");
    await page.keyboard.type("second line");
    await expectDocument(reply, ["First linesecond line"], 1);
    await expect(reply).toBeFocused();
    await page.keyboard.press("Enter");
    await page.keyboard.type("Third");
    await expectDocument(reply, ["First linesecond line", "Third"], 1);
    await expect(reply).toBeFocused();
    await nextFrames(page);
    expect(api.sent).toHaveLength(2);

    // Ctrl+Enter sends that reply as written: one line break, two
    // paragraphs, nothing added by the key.
    await sendHeld(page, api, {
      kind: "replies",
      editor: reply,
      start: () => page.keyboard.press("Control+Enter"),
      whilePending: async () => {
        await expectDocument(reply, ["First linesecond line", "Third"], 1);
        await expect(composer).toBeFocused();
      },
    });
    expect(api.sends("replies")[1]!.body).toMatchObject({
      payload: {
        json: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "First line" },
                { type: "hardBreak" },
                { type: "text", text: "second line" },
              ],
            },
            { type: "paragraph", content: [{ type: "text", text: "Third" }] },
          ],
        },
      },
    });
    // The cleared editor takes the next words at once.
    await page.keyboard.type("Next");
    await expectDocument(reply, ["Next"], 0);
    expect(api.sends("replies")).toHaveLength(2);
    expect(api.sends("notes")).toHaveLength(1);
    expect(api.unexpected).toEqual([]);
  });

  test(`real Support composer: Send reply and Add note send once, keep focus on the busy button while pending and return it to the cleared editor at ${viewport.label}`, async ({
    page,
  }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    const api = new ComposerApi();
    await api.install(page);
    await watchFocusLoss(page);
    const { composer, reply, note, sendReply, addNote } = composerOf(page);
    await expect(reply).toBeFocused();

    // Reply: a click on Send reply sends it once; the button keeps focus
    // while it says the reply is sending.
    await page.keyboard.type("Your receipt is attached");
    await expect(sendReply).toBeEnabled();
    await sendHeld(page, api, {
      kind: "replies",
      editor: reply,
      start: () => sendReply.click(),
      whilePending: async () => {
        await expect(sendReply).toHaveAccessibleName("Sending reply to donor");
        await expect(sendReply).toHaveAttribute("aria-busy", "true");
        await expect(sendReply).toBeFocused();
      },
    });
    expect(api.sends("replies")[0]!.body).toMatchObject({
      conversationId: CONVERSATION,
      authorAgentId: AGENT,
      mode: "send",
      payload: {
        text: `Your receipt is attached${SIGNATURE}`,
        attachments: [],
      },
    });
    await expect(page.getByText("Reply sent.")).toBeVisible();
    await expect(sendReply).toHaveAccessibleName("Send reply to donor");
    // Nothing to send in the cleared editor.
    await expect(sendReply).toBeDisabled();

    // The same from the keyboard: Tab to Add note, Enter.
    await composer.getByRole("tab", { name: "Internal note" }).click();
    await expect(note).toBeFocused();
    await page.keyboard.type("Sent the receipt again");
    await expect(addNote).toBeEnabled();
    for (let presses = 0; presses < 8; presses += 1) {
      if (await addNote.evaluate((node) => node === document.activeElement))
        break;
      await page.keyboard.press("Tab");
    }
    await expect(addNote).toBeFocused();
    await sendHeld(page, api, {
      kind: "notes",
      editor: note,
      start: () => page.keyboard.press("Enter"),
      whilePending: async () => {
        await expect(addNote).toHaveAccessibleName("Saving internal note");
        await expect(addNote).toHaveAttribute("aria-busy", "true");
        await expect(addNote).toBeFocused();
      },
    });
    expect(api.sends("notes")[0]!.body).toEqual({
      conversationId: CONVERSATION,
      authorAgentId: AGENT,
      bodyText: "Sent the receipt again",
      bodyHtml: "<p>Sent the receipt again</p>",
    });
    await expect(page.getByText("Internal note added.")).toBeVisible();
    await expect(addNote).toBeDisabled();

    // The cleared editor takes the next words at once.
    await page.keyboard.type("Follow up Friday");
    await expectDocument(note, ["Follow up Friday"], 0);
    expect(api.sends("replies")).toHaveLength(1);
    expect(api.sends("notes")).toHaveLength(1);
    expect(api.unexpected).toEqual([]);

    // The watch above sees focus fall to the page: a click on the heading,
    // which takes no focus, leaves the page focused and is recorded.
    const lossesBefore = (await focusLosses(page)).length;
    await page.getByRole("heading", { name: "Support composer" }).click();
    await expect.poll(() => bodyHasFocus(page)).toBe(true);
    await nextFrames(page);
    const losses = (await focusLosses(page)).slice(lossesBefore);
    expect(losses[0]).toEqual({
      pending: false,
      what: expect.stringMatching(
        /^focus left div "Internal note" for the page$/,
      ),
    });
    expect(losses).toContainEqual({
      pending: false,
      what: "a frame painted with the page focused",
    });
  });
}
