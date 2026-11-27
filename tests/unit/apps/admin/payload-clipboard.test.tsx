// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";

import { signOutClientSession } from "@asym/auth/client-session";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearPayloadClipboard,
  PAYLOAD_CLIPBOARD_KEY,
  PayloadClipboardGuard,
  PayloadClipboardReset,
} from "../../../../apps/admin/src/cms-ui/web-studio/shell/payload-clipboard";

const root = process.cwd();
const read = (file: string) => readFileSync(path.join(root, file), "utf8");
const MARK = "asym_clipboard_reset";
const COPIED = '{"type":"blocks"}';

function signOut(signOutOnServer = async () => ({ ok: true })) {
  const redirect = vi.fn();
  return {
    redirect,
    result: signOutClientSession({
      signOutOnServer,
      createClient: () =>
        ({ auth: { signOut: async () => ({ error: null }) } }) as never,
      logger: { warn: vi.fn() },
      notify: vi.fn(),
      redirect,
    }),
  };
}

beforeEach(() => {
  localStorage.clear();
  document.cookie = `${MARK}=; Path=/; Max-Age=0`;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Payload's copy-and-paste store is emptied at each change of person or organization (WP6 rest, pull request 2, invariant 8; #2817)", () => {
  it("names the key the installed Payload keeps its clipboard under", () => {
    expect(PAYLOAD_CLIPBOARD_KEY).toBe("_payloadClipboard");
    expect(
      read(
        "apps/admin/node_modules/@payloadcms/ui/dist/elements/ClipboardAction/clipboardUtilities.js",
      ),
    ).toContain(`const localStorageClipboardKey = '${PAYLOAD_CLIPBOARD_KEY}';`);
  });

  it("removes only the clipboard, and survives a browser that refuses storage", () => {
    localStorage.setItem(PAYLOAD_CLIPBOARD_KEY, '{"type":"blocks"}');
    localStorage.setItem("payload-theme", "dark");
    clearPayloadClipboard();
    expect(localStorage.getItem(PAYLOAD_CLIPBOARD_KEY)).toBeNull();
    expect(localStorage.getItem("payload-theme")).toBe("dark");
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });
    expect(() => clearPayloadClipboard()).not.toThrow();
  });

  it("empties the store when it mounts, and renders nothing", () => {
    localStorage.setItem(PAYLOAD_CLIPBOARD_KEY, '{"type":"blocks"}');
    const { container } = render(<PayloadClipboardReset />);
    expect(localStorage.getItem(PAYLOAD_CLIPBOARD_KEY)).toBeNull();
    expect(container.innerHTML).toBe("");
  });

  it.each([
    [
      "the sign-in page, where every sign-out lands and every sign-in starts",
      "apps/admin/app/(auth)/login/page.tsx",
    ],
    [
      "Web Studio's organization choice, which every change of organization passes",
      "apps/admin/app/(auth)/web-studio/organization/layout.tsx",
    ],
  ])("is mounted on %s", (_label, file) => {
    const source = read(file);
    expect(source).toContain("<PayloadClipboardReset />");
    expect(source).toMatch(/payload-clipboard"/);
  });

  it("is emptied by Web Studio's Log out before the session ends", () => {
    expect(
      read("apps/admin/src/cms-ui/web-studio/shell/studio-top-bar.tsx"),
    ).toMatch(/clearPayloadClipboard\(\);\s*void signOutClientSession\(\);/);
  });
});

describe("Payload's copy-and-paste store never passes from one person to the next (WP6 rest, pull request 2, fix round F1)", () => {
  it("is emptied in the document that signs out, from any screen of the admin app, before the sign-in page loads, and the sign-out still finishes", async () => {
    render(<PayloadClipboardGuard />);
    localStorage.setItem(PAYLOAD_CLIPBOARD_KEY, COPIED);
    const { redirect, result } = signOut();
    expect(await result).toEqual({ ok: true, redirected: true });
    expect(localStorage.getItem(PAYLOAD_CLIPBOARD_KEY)).toBeNull();
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("is kept when the server refuses the sign-out, since the person is still signed in", async () => {
    render(<PayloadClipboardGuard />);
    localStorage.setItem(PAYLOAD_CLIPBOARD_KEY, COPIED);
    const { result } = signOut(async () => ({ ok: false }));
    expect((await result).ok).toBe(false);
    expect(localStorage.getItem(PAYLOAD_CLIPBOARD_KEY)).toBe(COPIED);
  });

  it("is emptied when a page opens in a browser that a sign-out or an arrival marked, and the mark is then removed; it renders nothing", () => {
    localStorage.setItem(PAYLOAD_CLIPBOARD_KEY, COPIED);
    document.cookie = `${MARK}=1; Path=/`;
    const { container } = render(<PayloadClipboardGuard />);
    expect(localStorage.getItem(PAYLOAD_CLIPBOARD_KEY)).toBeNull();
    expect(document.cookie).not.toContain(MARK);
    expect(container.innerHTML).toBe("");
  });

  it("is kept, inside one person's session, when no mark is there", () => {
    localStorage.setItem(PAYLOAD_CLIPBOARD_KEY, COPIED);
    render(<PayloadClipboardGuard />);
    expect(localStorage.getItem(PAYLOAD_CLIPBOARD_KEY)).toBe(COPIED);
  });

  it.each([
    [
      "every page of the admin app, where the mark is read",
      "apps/admin/app/layout.tsx",
      "<PayloadClipboardGuard />",
    ],
    [
      "every screen a person signs in, signs up, accepts an invitation or recovers a password on",
      "apps/admin/app/(auth)/layout.tsx",
      "<PayloadClipboardReset />",
    ],
  ])("is mounted on %s", (_label, file, element) => {
    const source = read(file);
    expect(source).toContain(element);
    expect(source).toMatch(/payload-clipboard"/);
  });
});
