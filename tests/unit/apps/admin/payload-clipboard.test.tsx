// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";

import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearPayloadClipboard,
  PAYLOAD_CLIPBOARD_KEY,
  PayloadClipboardReset,
} from "../../../../apps/admin/src/cms-ui/web-studio/shell/payload-clipboard";

const root = process.cwd();
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

beforeEach(() => {
  localStorage.clear();
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
      "apps/admin/app/(auth)/web-studio/organization/page.tsx",
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
