/**
 * Shared harness for the #2224 acceptance tests (testing cleanup C2,
 * upload/crop). Owned by Acceptance; implementers must not edit this file to
 * satisfy their PR.
 * Spec r1: https://github.com/Asymmetric-al/core/issues/2224#issuecomment-6369737684
 *
 * WHAT BUILDER MUST PROVIDE (pinned from the spec, §1, §4 and §8):
 *   - tests/e2e/upload-crop.spec.ts (rewritten, same path, 11 tests);
 *   - tests/unit/packages/lib/image-utils.test.ts (new; §8 allows the
 *     documented rename to image-utils-validation.test.ts on a #2214 collision);
 *   - the exact titles in TITLES below.
 *
 * HOW THE E2E SPEC IS EXERCISED WITHOUT A BROWSER
 * The real spec source is transpiled (typescript.transpileModule) and run
 * against a fake `@playwright/test` plus a small, deterministic model of the
 * donor settings page (`World`). The model follows the product seams the spec
 * cites (image-upload.tsx processFile/handleDrop/accept, image-cropper.tsx,
 * page-client.tsx avatar trigger, the stub /api/upload/image route and the
 * demo-account endpoint). Each knob in WorldConfig is one product behaviour
 * that a mutation check in spec §4 removes, so "the test fails when the
 * product behaviour is gone" can be checked in Vitest.
 *
 * Modelled Playwright surface (anything else throws `FakeUnsupported`, naming
 * the member, so a crash is never mistaken for a pass):
 *   test(), test.describe(.serial/.parallel/.skip/.fixme/.configure),
 *   test.beforeEach/afterEach/beforeAll/afterAll, test.step, test.skip,
 *   test.fixme, test.fail, test.slow, test.setTimeout, test.info, test.use;
 *   expect(), expect.soft(), expect.poll(); locator matchers toBeVisible,
 *   toBeHidden, toBeAttached, toBeEnabled, toBeDisabled, toHaveCount,
 *   toHaveText, toContainText, toHaveAttribute; page.goto, setViewportSize,
 *   viewportSize, locator, getByRole, getByText, getByLabel, getByTestId,
 *   waitForEvent(filechooser|request|response), waitForRequest,
 *   waitForResponse, waitForTimeout, waitForLoadState, on/once/off,
 *   route/unroute, evaluate/evaluateHandle (run in Node with a DataTransfer
 *   polyfill, global File, atob), keyboard.press, request, url;
 *   locator first/last/nth/filter/locator("..") chains, click,
 *   setInputFiles, dispatchEvent, getAttribute, textContent, innerText,
 *   count, isVisible, isHidden, isEnabled, boundingBox, waitFor, evaluate;
 *   fileChooser.setFiles; APIRequestContext get/post/fetch; APIResponse
 *   ok()/status()/json()/text()/headers()/url().
 */
import { createHash } from "node:crypto";
import * as realFs from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import ts from "typescript";
import { afterAll, expect as vexpect } from "vitest";

export const ROOT = process.cwd();
export const SPEC_REL = "tests/e2e/upload-crop.spec.ts";
export const SPEC_FILE = path.join(ROOT, SPEC_REL);
export const E2E_DIR = path.join(ROOT, "tests/e2e");
export const FIXTURES_DIR = path.join(E2E_DIR, "fixtures");
export const TEST_IMAGE = path.join(FIXTURES_DIR, "test-image.png");
export const TEST_IMAGE_SHA256 =
  "5cf9593cd3728efed55472e98939c8e40375ff10b49ccc37b4304685e4ece616";
export const TEST_IMAGE_BYTES = 3363;
export const HERE = path.join(ROOT, "tests/unit/acceptance/issue-2224");
/** The develop 4e31ff33 (== a200250f) version of the spec, for criterion 16. */
export const BASELINE_SPEC = path.join(
  HERE,
  "fixtures/baseline-upload-crop.spec.ts.txt",
);
export const MUTANT_CONFIG = path.join(
  HERE,
  "fixtures/image-utils-mutant.config.mts",
);
export const IMAGE_UTILS = path.join(ROOT, "packages/lib/image-utils.ts");
/** §1.6 / §8; the second name is the §8 rename on a #2214 collision. */
export const UNIT_FILE_CANDIDATES = [
  "tests/unit/packages/lib/image-utils.test.ts",
  "tests/unit/packages/lib/image-utils-validation.test.ts",
];
export const unitFile = () =>
  UNIT_FILE_CANDIDATES.find((f) => realFs.existsSync(path.join(ROOT, f)));

export const TITLES = {
  /** §1.7 / criterion 9. */
  largeFile: "settings copy advertises large-file auto-optimization",
  /** §1.8 / criterion 12: unchanged. */
  apiSuite: "Backend Image Processing",
  apiInvalidToken: "API endpoint should exist for image processing",
  apiMissingAuth: "API should reject requests without auth",
};
/** §1 "Expected count": 14 browser tests become 11. */
export const EXPECTED_E2E_COUNT = 11;
/** §1.5: the product contract at image-upload.tsx:452. */
export const ACCEPT_SET = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
/** §1.3 in-memory payload. */
export const INVALID_PAYLOAD = {
  name: "not-an-image.txt",
  mimeType: "text/plain",
};
export const UNSUPPORTED_MESSAGE =
  "Unsupported file type. Please use .jpg, .jpeg, .png, .webp, .gif";

export const read = (f: string) =>
  realFs.readFileSync(path.resolve(ROOT, f), "utf8");
export const sha256 = (f: string) =>
  createHash("sha256").update(realFs.readFileSync(f)).digest("hex");

const tmpDirs: string[] = [];
afterAll(() =>
  tmpDirs.forEach((d) => realFs.rmSync(d, { recursive: true, force: true })),
);
export function tempDir(prefix = "acc-2224-") {
  const d = realFs.realpathSync(
    realFs.mkdtempSync(path.join(tmpdir(), prefix)),
  );
  tmpDirs.push(d);
  return d;
}

/* Static source helpers ------------------------------------------------ */

export const specSource = () => realFs.readFileSync(SPEC_FILE, "utf8");

/** Text of `function name(...) {...}` or `const name = (...) => {...}`. */
export function functionBody(src: string, name: string): string | undefined {
  const re = new RegExp(
    `(?:function\\s+${name}\\s*\\(|(?:const|let)\\s+${name}\\s*=)`,
  );
  const m = re.exec(src);
  if (!m) return undefined;
  const open = src.indexOf("{", src.indexOf(")", m.index));
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}" && --depth === 0) return src.slice(m.index, i + 1);
  }
  return undefined;
}

/* World: the modelled donor settings page ------------------------------ */

export type Box = { x: number; y: number; width: number; height: number };
export type WorldConfig = {
  /** `accept` on both ImageUpload inputs; null removes the attribute. */
  accept: string | null;
  /** test-image.png is missing for fs and for Playwright path reads. */
  fixtureMissing: boolean;
  /** A valid image chosen via file chooser / setInputFiles opens the cropper. */
  chooserOpensDialog: boolean;
  /** The cropper dialog title (accessible name + heading text). */
  dialogTitle: string;
  /** handleDrop processes dataTransfer.files[0] (mutation check C: off). */
  dropOpensDialog: boolean;
  /** The Cancel button is rendered (mutation check A removes it). */
  cancelButton: boolean;
  cancelCloses: boolean;
  cancelEmitsUploadRequest: boolean;
  cancelShowsSuccessToast: boolean;
  cancelChangesAvatar: boolean;
  /** The "Upload public avatar" trigger's avatar; null = trigger absent. */
  avatar: { src?: string; fallback: string } | null;
  invalidToast: boolean;
  invalidMessage: string;
  invalidOpensDialog: boolean;
  /** Overrides the dialog box; null = boundingBox() returns null. */
  dialogBox?: Box | null;
  largeFileCopy: boolean;
  removeButton: boolean;
  uploadNewEnabled: boolean;
  /** GET /api/auth/demo-account. */
  demo: { status: number; body: unknown };
  /** POST /api/auth/demo-account (session install). */
  session: { status: number };
  /** /api/upload/image stub statuses. */
  upload: {
    missing: number;
    invalid: number;
    other: number;
    errorBody: boolean;
  };
};

export const DEFAULT_WORLD: WorldConfig = {
  accept: ACCEPT_SET.join(","),
  fixtureMissing: false,
  chooserOpensDialog: true,
  dialogTitle: "Crop Image",
  dropOpensDialog: true,
  cancelButton: true,
  cancelCloses: true,
  cancelEmitsUploadRequest: false,
  cancelShowsSuccessToast: false,
  cancelChangesAvatar: false,
  avatar: { fallback: "DD" },
  invalidToast: true,
  invalidMessage: UNSUPPORTED_MESSAGE,
  invalidOpensDialog: false,
  largeFileCopy: true,
  removeButton: true,
  uploadNewEnabled: true,
  demo: { status: 200, body: { roles: { donor: true } } },
  session: { status: 200 },
  upload: { missing: 401, invalid: 401, other: 501, errorBody: true },
};

export class FakeUnsupported extends Error {
  constructor(member: string) {
    super(
      `FakeUnsupported: ${member} is not modelled by the #2224 acceptance ` +
        "harness (tests/unit/acceptance/issue-2224/harness.ts lists the surface)",
    );
  }
}
class SkipSignal extends Error {
  constructor(public reason: string) {
    super(`skipped: ${reason}`);
  }
}

type FileLike = { name: string; mimeType: string; buffer: Buffer };
type Step =
  | { k: "css"; sel: string }
  | {
      k: "role";
      role: string;
      opts?: { name?: string | RegExp; exact?: boolean };
    }
  | { k: "text"; text: string | RegExp; exact?: boolean }
  | { k: "label"; text: string | RegExp; exact?: boolean }
  | { k: "testid"; id: string }
  | { k: "nth"; n: number }
  | { k: "filter"; opts: Record<string, unknown> };
type El = {
  id: string;
  parent?: string;
  role?: string;
  name?: string;
  text?: string;
  label?: string;
  css: string[];
  attrs?: Record<string, string | null>;
  visible: boolean;
  enabled?: boolean;
};

const BASE_URL = "http://localhost:3001";
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
const isImageBytes = (b: Buffer) =>
  b.subarray(0, 4).equals(PNG_SIG) ||
  (b[0] === 0xff && b[1] === 0xd8) ||
  b.subarray(0, 3).toString() === "GIF" ||
  b.subarray(8, 12).toString() === "WEBP";
const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".txt": "text/plain",
};

const normCss = (s: string) =>
  s
    .trim()
    .replace(/'/g, '"')
    .replace(/\[([\w-]+)=([^"\]]+)\]/g, '[$1="$2"]');
const isParentSel = (s: string) => /^(xpath=)?\.\.$/.test(normCss(s));
const textMatch = (
  v: string | undefined,
  q: string | RegExp,
  exact?: boolean,
) => {
  if (v === undefined) return false;
  const norm = v.replace(/\s+/g, " ").trim();
  if (q instanceof RegExp)
    return new RegExp(q.source, q.flags.replace("g", "")).test(norm);
  return exact ? norm === q : norm.toLowerCase().includes(q.toLowerCase());
};

export type Request = { method: string; url: string };
type Listener = (arg: unknown) => unknown;

export class World {
  cfg: WorldConfig;
  dialogOpen = false;
  toasts: string[] = [];
  requests: Request[] = [];
  navigations: string[] = [];
  viewport = { width: 1280, height: 720 };
  avatar: WorldConfig["avatar"];
  events: {
    el: string;
    type: string;
    files: { name: string; type: string; size: number }[];
  }[] = [];
  inputFiles: {
    via: string;
    files: { name: string; mimeType: string; size: number; path?: string }[];
  }[] = [];
  listeners = new Map<string, Set<Listener>>();
  routes: {
    match: (u: string) => boolean;
    handler: (route: unknown, req: unknown) => unknown;
  }[] = [];
  vfs: Map<string, Buffer>;
  fsLog = { fixtureWrites: [] as string[], otherWrites: [] as string[] };

  constructor(cfg: Partial<WorldConfig> = {}, vfs = new Map<string, Buffer>()) {
    this.cfg = { ...DEFAULT_WORLD, ...cfg };
    this.avatar = this.cfg.avatar ? { ...this.cfg.avatar } : null;
    this.vfs = vfs;
  }

  elements(): El[] {
    const c = this.cfg;
    const els: El[] = [{ id: "body", css: ["body"], visible: true }];
    const root = (i: number): El => ({
      id: `root-${i}`,
      parent: "body",
      css: ["div", '[class*="relative"]', ".relative"],
      visible: true,
    });
    const input = (i: number): El => ({
      id: `input-${i}`,
      parent: `root-${i}`,
      label: "Upload image file",
      css: ["input", 'input[type="file"]', '[type="file"]'],
      attrs: {
        type: "file",
        accept: c.accept,
        "aria-label": "Upload image file",
      },
      visible: false,
      enabled: true,
    });
    els.push({
      id: "public-avatar",
      parent: "body",
      text: "Public Avatar",
      css: ["div"],
      visible: true,
    });
    els.push(root(0), input(0));
    if (this.avatar) {
      els.push({
        id: "avatar-trigger",
        parent: "root-0",
        role: "button",
        name: "Upload public avatar",
        label: "Upload public avatar",
        css: [
          "div",
          '[class*="relative"]',
          '[aria-label="Upload public avatar"]',
          '[role="button"]',
        ],
        attrs: { "aria-label": "Upload public avatar", role: "button" },
        visible: true,
        enabled: true,
      });
      if (this.avatar.src)
        els.push({
          id: "avatar-img",
          parent: "avatar-trigger",
          role: "img",
          css: ["img"],
          attrs: { src: this.avatar.src },
          visible: true,
        });
      else
        els.push({
          id: "avatar-fallback",
          parent: "avatar-trigger",
          text: this.avatar.fallback,
          css: ["span"],
          visible: true,
        });
    }
    els.push({
      id: "profile-photo",
      parent: "body",
      role: "heading",
      name: "Profile Photo",
      text: "Profile Photo",
      css: ["h3"],
      visible: true,
    });
    if (c.largeFileCopy)
      els.push({
        id: "copy",
        parent: "body",
        text: "JPG, GIF or PNG. Large files auto-optimized.",
        css: ["p"],
        visible: true,
      });
    els.push(root(1), input(1));
    els.push({
      id: "upload-new",
      parent: "root-1",
      role: "button",
      name: "Upload New",
      text: "Upload New",
      css: ["button"],
      visible: true,
      enabled: c.uploadNewEnabled,
    });
    if (c.removeButton)
      els.push({
        id: "remove",
        parent: "body",
        role: "button",
        name: "Remove",
        text: "Remove",
        css: ["button"],
        visible: true,
        enabled: true,
      });
    if (this.dialogOpen) {
      els.push({
        id: "dialog",
        parent: "body",
        role: "dialog",
        name: c.dialogTitle,
        css: ['[role="dialog"]'],
        visible: true,
      });
      els.push({
        id: "dialog-title",
        parent: "dialog",
        role: "heading",
        name: c.dialogTitle,
        text: c.dialogTitle,
        css: ["h2"],
        visible: true,
      });
      for (const i of [0, 1])
        els.push({
          id: `slider-${i}`,
          parent: "dialog",
          role: "slider",
          css: ["input", 'input[type="range"]'],
          visible: true,
          enabled: true,
        });
      if (c.cancelButton)
        els.push({
          id: "cancel",
          parent: "dialog",
          role: "button",
          name: "Cancel",
          text: "Cancel",
          css: ["button"],
          visible: true,
          enabled: true,
        });
      els.push({
        id: "apply",
        parent: "dialog",
        role: "button",
        name: "Apply Crop",
        text: "Apply Crop",
        css: ["button"],
        visible: true,
        enabled: true,
      });
    }
    this.toasts.forEach((t, i) =>
      els.push({
        id: `toast-${i}`,
        parent: "body",
        text: t,
        css: ["li", "[data-sonner-toast]"],
        visible: true,
      }),
    );
    return els;
  }

  textContent(id: string): string {
    const els = this.elements();
    const own = els.find((e) => e.id === id)?.text ?? "";
    const kids = els.filter((e) => e.parent === id);
    return own + kids.map((e) => this.textContent(e.id)).join("");
  }

  box(id: string): Box | null {
    if (id === "dialog") {
      if (this.cfg.dialogBox !== undefined) return this.cfg.dialogBox;
      const width = Math.min(512, this.viewport.width - 32);
      return {
        x: (this.viewport.width - width) / 2,
        y: 40,
        width,
        height: 480,
      };
    }
    return { x: 0, y: 0, width: 100, height: 40 };
  }

  emit(event: string, arg: unknown) {
    for (const l of [...(this.listeners.get(event) ?? [])]) l(arg);
  }

  async request(method: string, url: string) {
    const abs = new URL(url, BASE_URL).toString();
    this.requests.push({ method, url: abs });
    const req = {
      url: () => abs,
      method: () => method,
      headers: () => ({}),
      postData: () => null,
      resourceType: () => (url.includes("/api/") ? "fetch" : "document"),
    };
    for (const r of this.routes)
      if (r.match(abs)) {
        const route = {
          request: () => req,
          fulfill: async () => {},
          abort: async () => {},
          continue: async () => {},
          fallback: async () => {},
        };
        await r.handler(route, req);
      }
    this.emit("request", req);
    this.emit(
      "response",
      Object.assign(fakeResponse(200, {}, abs), { request: () => req }),
    );
    this.emit("requestfinished", req);
  }

  async handleFiles(files: FileLike[], via: "chooser" | "input" | "drop") {
    this.inputFiles.push({
      via,
      files: files.map((f) => ({
        name: f.name,
        mimeType: f.mimeType,
        size: f.buffer.length,
      })),
    });
    const f = files[0];
    if (!f) return;
    const c = this.cfg;
    const ext = "." + (f.name.split(".").pop() ?? "").toLowerCase();
    const typeOk =
      ACCEPT_SET.includes(f.mimeType) ||
      [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext);
    if (!typeOk) {
      if (c.invalidToast) this.toasts.push(c.invalidMessage);
      if (c.invalidOpensDialog) this.dialogOpen = true;
      return;
    }
    if (f.buffer.length > 50 * 1024 * 1024) {
      this.toasts.push(
        "File is extremely large (>50MB). Please use a smaller image.",
      );
      return;
    }
    if (!isImageBytes(f.buffer)) {
      this.toasts.push("Failed to load image");
      return;
    }
    if (via === "drop" ? c.dropOpensDialog : c.chooserOpensDialog)
      this.dialogOpen = true;
  }

  async cancel() {
    const c = this.cfg;
    if (c.cancelCloses) this.dialogOpen = false;
    if (c.cancelEmitsUploadRequest)
      await this.request("POST", "/api/upload/image");
    if (c.cancelShowsSuccessToast)
      this.toasts.push("Image uploaded successfully");
    if (c.cancelChangesAvatar && this.avatar)
      this.avatar = { ...this.avatar, src: `blob:${BASE_URL}/cropped` };
  }
}

function fakeResponse(status: number, body: unknown, url = BASE_URL) {
  return {
    __fakeResponse: true,
    ok: () => status >= 200 && status < 300,
    status: () => status,
    statusText: () => String(status),
    url: () => url,
    headers: () => ({ "content-type": "application/json" }),
    json: async () => body,
    text: async () => JSON.stringify(body),
    body: async () => Buffer.from(JSON.stringify(body)),
    dispose: async () => {},
  };
}

const PASS_THROUGH = new Set([
  "then",
  "toJSON",
  "asymmetricMatch",
  "nodeType",
  "$$typeof",
  "constructor",
  "inspect",
]);
/** Wraps an object so unknown members throw FakeUnsupported, never undefined. */
function strict<T extends object>(obj: T, label: string): T {
  return new Proxy(obj, {
    get(t, k, r) {
      if (typeof k === "symbol" || PASS_THROUGH.has(k))
        return Reflect.get(t, k, r);
      if (!(k in t)) throw new FakeUnsupported(`${label}.${String(k)}`);
      return Reflect.get(t, k, r);
    },
  });
}

/* Page / locator fakes ------------------------------------------------- */

/** Real milliseconds a fake wait lasts before it times out. */
const REAL_WAIT_MS = 150;

function urlMatcher(u: unknown): (url: string) => boolean {
  if (typeof u === "function")
    return (url) => Boolean((u as (x: unknown) => unknown)(new URL(url)));
  if (u instanceof RegExp) return (url) => u.test(url);
  if (typeof u === "string") {
    if (u.includes("*")) {
      const re = new RegExp(
        "^" +
          u
            .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
            .replace(/\*\*/g, "\u0000")
            .replace(/\*/g, "[^/]*")
            .replace(/\u0000/g, ".*") +
          "$",
      );
      return (url) => re.test(url);
    }
    return (url) => url === new URL(u, BASE_URL).toString();
  }
  throw new FakeUnsupported(`url matcher of type ${typeof u}`);
}

type Locator = Record<string, unknown> & { __steps: Step[]; __world: World };
const isLocator = (v: unknown): v is Locator =>
  typeof v === "object" && v !== null && "__steps" in (v as object);

const SUPPORTED_CSS = [
  "body",
  "div",
  "span",
  "img",
  "button",
  "input",
  "h2",
  "h3",
  "p",
  "li",
  'input[type="file"]',
  '[type="file"]',
  'input[type="range"]',
  '[role="dialog"]',
  '[role="button"]',
  '[class*="relative"]',
  ".relative",
  "[data-sonner-toast]",
  '[aria-label="Upload public avatar"]',
];

function matchStep(el: El, s: Step): boolean {
  switch (s.k) {
    case "css":
      return el.css.includes(normCss(s.sel));
    case "role":
      return (
        el.role === s.role &&
        (s.opts?.name === undefined ||
          textMatch(el.name, s.opts.name, s.opts.exact))
      );
    case "text":
      return textMatch(el.text, s.text, s.exact);
    case "label":
      return textMatch(el.label, s.text, s.exact);
    default:
      return false;
  }
}

function resolve(w: World, steps: Step[], scope?: El[]): El[] {
  const all = w.elements();
  const byId = new Map(all.map((e) => [e.id, e]));
  const isDesc = (e: El, anc: El) => {
    for (let p = e.parent; p; p = byId.get(p)?.parent)
      if (p === anc.id) return true;
    return false;
  };
  let cur: El[] | undefined = scope;
  for (const s of steps) {
    if (s.k === "css" && isParentSel(s.sel)) {
      const ids = new Set((cur ?? []).map((e) => e.parent).filter(Boolean));
      cur = [...ids].map((id) => byId.get(id!)!);
      continue;
    }
    if (s.k === "css" && !SUPPORTED_CSS.includes(normCss(s.sel)))
      throw new FakeUnsupported(`CSS selector ${JSON.stringify(s.sel)}`);
    if (s.k === "nth") {
      const list = cur ?? [];
      const i = s.n < 0 ? list.length + s.n : s.n;
      cur = list[i] ? [list[i]!] : [];
    } else if (s.k === "filter") {
      const o = s.opts;
      for (const k of Object.keys(o))
        if (!["has", "hasNot", "hasText", "hasNotText", "visible"].includes(k))
          throw new FakeUnsupported(`locator.filter({${k}})`);
      cur = (cur ?? []).filter((e) => {
        if (o.has && resolve(w, (o.has as Locator).__steps, [e]).length === 0)
          return false;
        if (o.hasNot && resolve(w, (o.hasNot as Locator).__steps, [e]).length)
          return false;
        if (
          o.hasText !== undefined &&
          !textMatch(w.textContent(e.id), o.hasText as string | RegExp)
        )
          return false;
        if (
          o.hasNotText !== undefined &&
          textMatch(w.textContent(e.id), o.hasNotText as string | RegExp)
        )
          return false;
        if (o.visible !== undefined && e.visible !== o.visible) return false;
        return true;
      });
    } else {
      const base = all.filter((e) => matchStep(e, s));
      cur =
        cur === undefined
          ? base
          : base.filter((e) => cur!.some((a) => isDesc(e, a)));
    }
  }
  return cur ?? [];
}

const describeSteps = (steps: Step[]) =>
  steps.map((s) => JSON.stringify(s)).join(" >> ");

class FakeDataTransfer {
  files: File[] = [];
  dropEffect = "none";
  effectAllowed = "all";
  types: string[] = [];
  items = {
    add: (f: unknown, type?: string) => {
      if (f instanceof File) {
        this.files.push(f);
        this.types.push("Files");
      } else if (typeof f === "string" && type) this.types.push(type);
    },
    clear: () => {
      this.files.length = 0;
    },
  };
  setData() {}
  getData() {
    return "";
  }
  clearData() {}
}

async function inBrowser<T>(fn: (arg: unknown) => T, arg: unknown) {
  const g = globalThis as Record<string, unknown>;
  const prev = g.DataTransfer;
  g.DataTransfer = FakeDataTransfer;
  try {
    return await fn(arg === undefined ? undefined : structuredClone(arg));
  } finally {
    if (prev === undefined) delete g.DataTransfer;
    else g.DataTransfer = prev;
  }
}

function toFiles(w: World, files: unknown): FileLike[] {
  const list = Array.isArray(files) ? files : [files];
  return list.map((f) => {
    if (typeof f === "string") {
      const abs = path.resolve(E2E_DIR, f);
      const buffer = vfsRead(w, abs);
      const mimeType =
        MIME_BY_EXT[path.extname(abs).toLowerCase()] ??
        "application/octet-stream";
      const name = path.basename(abs);
      w.inputFiles.push({
        via: "path",
        files: [{ name, mimeType, size: buffer.length, path: abs }],
      });
      return { name, mimeType, buffer };
    }
    const o = f as FileLike;
    return {
      name: o.name,
      mimeType: o.mimeType,
      buffer: Buffer.from(o.buffer),
    };
  });
}

function makeLocator(w: World, steps: Step[], page: () => unknown): Locator {
  const one = (action: string) => {
    const els = resolve(w, steps);
    if (els.length === 0)
      throw new Error(
        `locator.${action}: Timeout exceeded. waiting for locator(${describeSteps(steps)})`,
      );
    if (els.length > 1)
      throw new Error(
        `locator.${action}: strict mode violation: locator(${describeSteps(steps)}) resolved to ${els.length} elements`,
      );
    return els[0]!;
  };
  const chain = (s: Step) => makeLocator(w, [...steps, s], page);
  const fileChooser = (input: number) =>
    strict(
      {
        isMultiple: () => false,
        page: () => page(),
        element: () =>
          makeLocator(
            w,
            [
              { k: "css", sel: 'input[type="file"]' },
              { k: "nth", n: input },
            ],
            page,
          ),
        setFiles: async (files: unknown) =>
          w.handleFiles(toFiles(w, files), "chooser"),
      },
      "fileChooser",
    );
  const loc: Record<string, unknown> = {
    __steps: steps,
    __world: w,
    first: () => chain({ k: "nth", n: 0 }),
    last: () => chain({ k: "nth", n: -1 }),
    nth: (n: number) => chain({ k: "nth", n }),
    filter: (opts: Record<string, unknown>) => chain({ k: "filter", opts }),
    locator: (sel: string | Locator, opts?: Record<string, unknown>) => {
      if (isLocator(sel))
        return makeLocator(w, [...steps, ...sel.__steps], page);
      const l = chain({ k: "css", sel });
      return opts
        ? makeLocator(w, [...l.__steps, { k: "filter", opts }], page)
        : l;
    },
    getByRole: (
      role: string,
      opts?: { name?: string | RegExp; exact?: boolean },
    ) => chain({ k: "role", role, opts }),
    getByText: (text: string | RegExp, opts?: { exact?: boolean }) =>
      chain({ k: "text", text, exact: opts?.exact }),
    getByLabel: (text: string | RegExp, opts?: { exact?: boolean }) =>
      chain({ k: "label", text, exact: opts?.exact }),
    getByTestId: (id: string) => chain({ k: "testid", id }),
    page: () => page(),
    count: async () => resolve(w, steps).length,
    all: async () => resolve(w, steps).map((_, i) => chain({ k: "nth", n: i })),
    isVisible: async () => {
      const els = resolve(w, steps);
      if (els.length > 1) one("isVisible");
      return els[0]?.visible ?? false;
    },
    isHidden: async () => !(resolve(w, steps)[0]?.visible ?? false),
    isEnabled: async () => one("isEnabled").enabled !== false,
    isDisabled: async () => one("isDisabled").enabled === false,
    getAttribute: async (name: string) =>
      one("getAttribute").attrs?.[name] ?? null,
    textContent: async () => w.textContent(one("textContent").id),
    innerText: async () => {
      const e = one("innerText");
      return e.visible ? w.textContent(e.id) : "";
    },
    allTextContents: async () =>
      resolve(w, steps).map((e) => w.textContent(e.id)),
    boundingBox: async () => {
      const els = resolve(w, steps);
      if (els.length > 1) one("boundingBox");
      if (!els[0] || !els[0].visible) return null;
      return w.box(els[0].id);
    },
    waitFor: async (opts?: { state?: string }) => {
      const els = resolve(w, steps);
      const state = opts?.state ?? "visible";
      const ok =
        state === "attached"
          ? els.length > 0
          : state === "detached"
            ? els.length === 0
            : state === "hidden"
              ? !els.some((e) => e.visible)
              : els.some((e) => e.visible);
      if (!ok)
        throw new Error(
          `locator.waitFor: Timeout exceeded waiting for ${state}: ${describeSteps(steps)}`,
        );
    },
    click: async () => {
      const e = one("click");
      if (!e.visible)
        throw new Error(`locator.click: element is not visible: ${e.id}`);
      if (e.enabled === false)
        throw new Error(`locator.click: element is not enabled: ${e.id}`);
      if (e.id === "upload-new") w.emit("filechooser", fileChooser(1));
      else if (e.id === "avatar-trigger") w.emit("filechooser", fileChooser(0));
      else if (e.id === "cancel") await w.cancel();
      else if (e.id === "apply") {
        w.dialogOpen = false;
        await w.request("POST", "/api/upload/image");
      }
    },
    setInputFiles: async (files: unknown) => {
      const e = one("setInputFiles");
      if (!e.id.startsWith("input-"))
        throw new Error(
          "locator.setInputFiles: Node is not an HTMLInputElement",
        );
      await w.handleFiles(toFiles(w, files), "input");
    },
    dispatchEvent: async (type: string, init?: { dataTransfer?: unknown }) => {
      const e = one("dispatchEvent");
      const h = init?.dataTransfer as { __handle?: true; __value?: unknown };
      const dt = h && h.__handle ? h.__value : undefined;
      const files: File[] = dt instanceof FakeDataTransfer ? dt.files : [];
      w.events.push({
        el: e.id,
        type,
        files: files.map((f) => ({ name: f.name, type: f.type, size: f.size })),
      });
      // React's onDrop sits on the ImageUpload root; a drop on the input bubbles to it.
      const onUpload = e.id.startsWith("root-") || e.id.startsWith("input-");
      if (type === "drop" && onUpload && files[0]) {
        const f = files[0];
        const buffer = Buffer.from(await f.arrayBuffer());
        await w.handleFiles(
          [{ name: f.name, mimeType: f.type, buffer }],
          "drop",
        );
      }
    },
    evaluate: async (
      fn: (el: unknown, arg: unknown) => unknown,
      arg?: unknown,
    ) => {
      const e = one("evaluate");
      const node = {
        tagName: (e.css[0] ?? "div").toUpperCase(),
        getAttribute: (n: string) => e.attrs?.[n] ?? null,
        accept: e.attrs?.accept ?? "",
        type: e.attrs?.type ?? "",
        textContent: w.textContent(e.id),
      };
      return fn(node, arg === undefined ? undefined : structuredClone(arg));
    },
  };
  return strict(loc, "locator") as Locator;
}

function makeRequestContext(w: World) {
  type Opts = { method?: string; headers?: Record<string, string> };
  const respond = async (method: string, url: string, opts?: Opts) => {
    const abs = new URL(url, BASE_URL);
    w.requests.push({ method, url: abs.toString() });
    if (abs.pathname === "/api/auth/demo-account")
      return method === "GET"
        ? fakeResponse(w.cfg.demo.status, w.cfg.demo.body, url)
        : fakeResponse(w.cfg.session.status, {}, url);
    if (abs.pathname === "/api/upload/image") {
      const auth = Object.entries(opts?.headers ?? {}).find(
        ([k]) => k.toLowerCase() === "authorization",
      )?.[1];
      const u = w.cfg.upload;
      const status = !auth
        ? u.missing
        : auth === "Bearer invalid-token"
          ? u.invalid
          : u.other;
      const body =
        status === 401 && u.errorBody ? { error: "Unauthorized" } : {};
      return fakeResponse(status, body, url);
    }
    return fakeResponse(404, {}, url);
  };
  return strict(
    {
      get: (u: string, o?: Opts) => respond("GET", u, o),
      post: (u: string, o?: Opts) => respond("POST", u, o),
      fetch: (u: string, o?: Opts) => respond(o?.method ?? "GET", u, o),
      dispose: async () => {},
    },
    "request",
  );
}

function makePage(w: World) {
  let page: Record<string, unknown> = {};
  const getPage = () => page;
  const listen = (event: string, l: Listener) => {
    const set = w.listeners.get(event) ?? new Set();
    w.listeners.set(event, set);
    set.add(l);
    return set;
  };
  const waiter = (event: string, pred?: Listener, timeout?: number) =>
    new Promise<unknown>((res, rej) => {
      const l: Listener = (a) => {
        if (pred && !pred(a)) return;
        set.delete(l);
        clearTimeout(timer);
        res(a);
      };
      const set = listen(event, l);
      const timer = setTimeout(
        () => {
          set.delete(l);
          rej(
            new Error(
              `page.waitForEvent: Timeout ${timeout ?? 30000}ms exceeded while waiting for event "${event}"`,
            ),
          );
        },
        Math.min(timeout ?? REAL_WAIT_MS, REAL_WAIT_MS),
      );
    });
  const reqPred = (m: unknown): Listener => {
    if (typeof m === "function") return (r) => (m as Listener)(r);
    const f = urlMatcher(m);
    return (r) => f((r as { url: () => string }).url());
  };
  const root = (s: Step) => makeLocator(w, [s], getPage);
  const EVENTS = [
    "request",
    "response",
    "requestfinished",
    "requestfailed",
    "filechooser",
    "console",
    "pageerror",
  ];
  page = strict(
    {
      __fakePage: true,
      goto: async (url: string) => {
        w.navigations.push(url);
        w.dialogOpen = false;
        w.toasts = [];
        await w.request("GET", url);
        await w.request("GET", "/_next/static/chunks/main-app.js");
        return fakeResponse(200, {}, url);
      },
      url: () => new URL(w.navigations.at(-1) ?? "/", BASE_URL).toString(),
      setViewportSize: async (v: { width: number; height: number }) => {
        w.viewport = { ...v };
      },
      viewportSize: () => ({ ...w.viewport }),
      locator: (sel: string, opts?: Record<string, unknown>) =>
        opts
          ? makeLocator(
              w,
              [
                { k: "css", sel },
                { k: "filter", opts },
              ],
              getPage,
            )
          : root({ k: "css", sel }),
      getByRole: (
        role: string,
        opts?: { name?: string | RegExp; exact?: boolean },
      ) => root({ k: "role", role, opts }),
      getByText: (text: string | RegExp, opts?: { exact?: boolean }) =>
        root({ k: "text", text, exact: opts?.exact }),
      getByLabel: (text: string | RegExp, opts?: { exact?: boolean }) =>
        root({ k: "label", text, exact: opts?.exact }),
      getByTestId: (id: string) => root({ k: "testid", id }),
      waitForEvent: (event: string, o?: unknown) => {
        const opts =
          typeof o === "function"
            ? { predicate: o as Listener, timeout: undefined }
            : (o as { predicate?: Listener; timeout?: number } | undefined);
        if (
          !["filechooser", "request", "response", "requestfinished"].includes(
            event,
          )
        )
          throw new FakeUnsupported(`page.waitForEvent("${event}")`);
        return waiter(event, opts?.predicate, opts?.timeout);
      },
      waitForRequest: (m: unknown, o?: { timeout?: number }) =>
        waiter("request", reqPred(m), o?.timeout),
      waitForResponse: (m: unknown, o?: { timeout?: number }) =>
        waiter("response", reqPred(m), o?.timeout),
      waitForTimeout: async () => {},
      waitForLoadState: async () => {},
      on: (event: string, l: Listener) => {
        if (!EVENTS.includes(event))
          throw new FakeUnsupported(`page.on("${event}")`);
        listen(event, l);
        return page;
      },
      once: (event: string, l: Listener) => {
        const once: Listener = (a) => {
          w.listeners.get(event)?.delete(once);
          l(a);
        };
        listen(event, once);
        return page;
      },
      off: (event: string, l: Listener) => {
        w.listeners.get(event)?.delete(l);
        return page;
      },
      removeListener: (event: string, l: Listener) => {
        w.listeners.get(event)?.delete(l);
        return page;
      },
      route: async (
        m: unknown,
        handler: (route: unknown, req: unknown) => unknown,
      ) => {
        w.routes.push({ match: urlMatcher(m), handler });
      },
      unroute: async () => {},
      evaluate: (fn: (a: unknown) => unknown, arg?: unknown) =>
        inBrowser(fn, arg),
      evaluateHandle: async (fn: (a: unknown) => unknown, arg?: unknown) => {
        const value = await inBrowser(fn, arg);
        return strict(
          {
            __handle: true,
            __value: value,
            dispose: async () => {},
            jsonValue: async () => value,
          },
          "jsHandle",
        );
      },
      keyboard: strict(
        {
          press: async (key: string) => {
            if (key === "Escape") w.dialogOpen = false;
          },
        },
        "page.keyboard",
      ),
      request: makeRequestContext(w),
      close: async () => {},
    },
    "page",
  );
  return page;
}

/* Playwright-style expect ---------------------------------------------- */

type Current = {
  softErrors: { step?: string; message: string }[];
  stepStack: string[];
};
type Matchers = Record<string, (...a: unknown[]) => unknown>;

function pwMatchers(
  target: Locator | Record<string, unknown>,
  msg: string | undefined,
  soft: boolean,
  cur: () => Current,
  negated = false,
): unknown {
  const label = isLocator(target)
    ? `locator(${describeSteps(target.__steps)})`
    : "page/response";
  const check = (name: string, pass: boolean, detail: string) => {
    if (pass !== negated) return;
    const err = new Error(
      `${msg ? msg + "\n" : ""}expect(${label}).${negated ? "not." : ""}${name} failed: ${detail}`,
    );
    if (!soft) throw err;
    const c = cur();
    c.softErrors.push({ step: c.stepStack.at(-1), message: err.message });
  };
  const w = isLocator(target) ? target.__world : undefined;
  const els = () => resolve(w!, (target as Locator).__steps);
  const single = (name: string) => {
    const e = els();
    if (e.length > 1)
      throw new Error(
        `expect.${name}: strict mode violation: ${label} resolved to ${e.length} elements`,
      );
    return e[0];
  };
  const text = (name: string) => {
    const e = single(name);
    return e ? w!.textContent(e.id) : undefined;
  };
  const m: Record<string, unknown> = {
    toBeVisible: async (o?: { visible?: boolean }) => {
      const v = single("toBeVisible")?.visible ?? false;
      check("toBeVisible", o?.visible === false ? !v : v, `visible=${v}`);
    },
    toBeHidden: async () => {
      const e = els();
      check("toBeHidden", !e.some((x) => x.visible), `count=${e.length}`);
    },
    toBeAttached: async (o?: { attached?: boolean }) => {
      const n = els().length;
      check(
        "toBeAttached",
        o?.attached === false ? n === 0 : n > 0,
        `count=${n}`,
      );
    },
    toBeEnabled: async () => {
      const e = single("toBeEnabled");
      check("toBeEnabled", !!e && e.enabled !== false, `enabled=${e?.enabled}`);
    },
    toBeDisabled: async () => {
      const e = single("toBeDisabled");
      check(
        "toBeDisabled",
        !!e && e.enabled === false,
        `enabled=${e?.enabled}`,
      );
    },
    toHaveCount: async (n: number) => {
      const c = els().length;
      check("toHaveCount", c === n, `count=${c}, expected ${n}`);
    },
    toHaveText: async (t: string | RegExp) => {
      const txt = text("toHaveText");
      const norm = (s: string) => s.replace(/\s+/g, " ").trim();
      const pass =
        txt !== undefined &&
        (t instanceof RegExp ? t.test(txt) : norm(txt) === norm(t));
      check("toHaveText", pass, `text=${JSON.stringify(txt)}`);
    },
    toContainText: async (t: string | RegExp) => {
      const txt = text("toContainText");
      check(
        "toContainText",
        txt !== undefined && textMatch(txt, t),
        `text=${JSON.stringify(txt)}`,
      );
    },
    toHaveAttribute: async (name: string, value?: string | RegExp) => {
      const e = single("toHaveAttribute");
      const v = e?.attrs?.[name];
      const pass =
        e !== undefined &&
        v !== undefined &&
        v !== null &&
        (value === undefined ||
          (value instanceof RegExp ? value.test(v) : v === value));
      check("toHaveAttribute", pass, `${name}=${JSON.stringify(v)}`);
    },
    toBeOK: async () => {
      const r = target as { ok: () => boolean; status: () => number };
      check("toBeOK", r.ok(), `status=${r.status()}`);
    },
    toHaveURL: async (u: string | RegExp) => {
      const url = (target as { url: () => string }).url();
      const pass =
        u instanceof RegExp
          ? u.test(url)
          : url === new URL(u, BASE_URL).toString();
      check("toHaveURL", pass, url);
    },
  };
  Object.defineProperty(m, "not", {
    get: () => pwMatchers(target, msg, soft, cur, !negated),
  });
  return strict(m, "expect(locator)");
}

function softProxy(v: object, cur: () => Current): unknown {
  return new Proxy(v, {
    get(t, k) {
      const val = Reflect.get(t, k);
      if (typeof val === "function")
        return (...a: unknown[]) => {
          const record = (e: unknown) => {
            const c = cur();
            c.softErrors.push({
              step: c.stepStack.at(-1),
              message: e instanceof Error ? e.message : String(e),
            });
          };
          try {
            const r = (val as (...x: unknown[]) => unknown).apply(t, a);
            return r instanceof Promise ? r.catch(record) : r;
          } catch (e) {
            record(e);
          }
        };
      if (val && typeof val === "object") return softProxy(val, cur);
      return val;
    },
  });
}

function makeExpect(cur: () => Current) {
  const wrap = (actual: unknown, msg: unknown, soft: boolean) => {
    const message =
      typeof msg === "string" ? msg : (msg as { message?: string })?.message;
    const isPw =
      isLocator(actual) ||
      (!!actual &&
        typeof actual === "object" &&
        ("__fakePage" in actual || "__fakeResponse" in actual));
    if (isPw) return pwMatchers(actual as Locator, message, soft, cur);
    const v =
      message === undefined ? vexpect(actual) : vexpect(actual, message);
    return soft ? softProxy(v as object, cur) : v;
  };
  const e = ((a: unknown, m?: unknown) => wrap(a, m, false)) as ((
    a: unknown,
    m?: unknown,
  ) => unknown) &
    Record<string, unknown>;
  e.soft = (a: unknown, m?: unknown) => wrap(a, m, true);
  e.poll = (fn: () => unknown, m?: unknown) => {
    const run = (neg: boolean) =>
      new Proxy(
        {},
        {
          get: (_t, k) =>
            k === "not" && !neg
              ? run(true)
              : async (...a: unknown[]) => {
                  const v = vexpect(await fn(), m as string);
                  const target = (neg ? v.not : v) as unknown as Matchers;
                  return target[k as string]!(...a);
                },
        },
      );
    return run(false);
  };
  e.configure = () => e;
  e.extend = () => e;
  for (const k of [
    "any",
    "anything",
    "arrayContaining",
    "objectContaining",
    "stringContaining",
    "stringMatching",
  ])
    e[k] = (vexpect as unknown as Record<string, unknown>)[k];
  return e;
}

/* fs: reads honour fixtureMissing; writes outside tmp stay in memory ---- */

const vfsPath = (p: unknown) =>
  p instanceof URL ? p.pathname : path.resolve(String(p));
const TMP_ROOTS = [tmpdir(), realFs.realpathSync(tmpdir())];
const isTmp = (p: string) => TMP_ROOTS.some((t) => p.startsWith(t + path.sep));
const enoent = (p: string) =>
  Object.assign(new Error(`ENOENT: no such file or directory, open '${p}'`), {
    code: "ENOENT",
  });
function vfsRead(w: World, p: string): Buffer {
  if (w.vfs.has(p)) return w.vfs.get(p)!;
  if (w.cfg.fixtureMissing && p === TEST_IMAGE) throw enoent(p);
  return realFs.readFileSync(p);
}

function makeFs(getWorld: () => World) {
  const w = getWorld;
  const exists = (p: string) =>
    w().vfs.has(p) ||
    (!(w().cfg.fixtureMissing && p === TEST_IMAGE) && realFs.existsSync(p));
  const write = (p: string, data: unknown) => {
    if (isTmp(p)) return realFs.writeFileSync(p, data as string);
    const log = p.startsWith(FIXTURES_DIR + path.sep)
      ? w().fsLog.fixtureWrites
      : w().fsLog.otherWrites;
    log.push(p);
    w().vfs.set(p, Buffer.from(data as string));
  };
  const unlink = (p: string) => {
    if (isTmp(p)) return realFs.rmSync(p);
    if (!w().vfs.delete(p)) throw enoent(p);
  };
  type F = (...a: unknown[]) => unknown;
  const fsObj: Record<string, unknown> = {
    ...realFs,
    existsSync: (p: unknown) => exists(vfsPath(p)),
    accessSync: (p: unknown) => {
      if (!exists(vfsPath(p))) throw enoent(vfsPath(p));
    },
    statSync: (p: unknown, o?: unknown) => {
      const ap = vfsPath(p);
      const b = w().vfs.get(ap);
      if (b)
        return { isFile: () => true, isDirectory: () => false, size: b.length };
      if (w().cfg.fixtureMissing && ap === TEST_IMAGE) throw enoent(ap);
      return realFs.statSync(ap, o as never);
    },
    readFileSync: (p: unknown, enc?: unknown) => {
      const b = vfsRead(w(), vfsPath(p));
      const e =
        typeof enc === "string"
          ? enc
          : (enc as { encoding?: string })?.encoding;
      return e ? b.toString(e as BufferEncoding) : b;
    },
    writeFileSync: (p: unknown, d: unknown) => write(vfsPath(p), d),
    appendFileSync: (p: unknown, d: unknown) => write(vfsPath(p), d),
    unlinkSync: (p: unknown) => unlink(vfsPath(p)),
    rmSync: (p: unknown, o?: { force?: boolean }) => {
      try {
        unlink(vfsPath(p));
      } catch (e) {
        if (!o?.force) throw e;
      }
    },
    mkdirSync: (p: unknown, o?: unknown) => {
      const ap = vfsPath(p);
      if (isTmp(ap)) return realFs.mkdirSync(ap, o as never);
      if (!realFs.existsSync(ap)) w().fsLog.otherWrites.push(ap);
      return undefined;
    },
  };
  fsObj.promises = {
    ...realFs.promises,
    readFile: async (p: unknown, e?: unknown) =>
      (fsObj.readFileSync as F)(p, e),
    writeFile: async (p: unknown, d: unknown) => write(vfsPath(p), d),
    unlink: async (p: unknown) => unlink(vfsPath(p)),
    rm: async (p: unknown, o?: unknown) => (fsObj.rmSync as F)(p, o),
    access: async (p: unknown) => (fsObj.accessSync as F)(p),
    stat: async (p: unknown) => (fsObj.statSync as F)(p),
    mkdir: async (p: unknown, o?: unknown) => (fsObj.mkdirSync as F)(p, o),
  };
  return fsObj;
}

/* Loader: transpile the spec against the fake @playwright/test --------- */

type Fn = (...a: unknown[]) => unknown;
export type TestCase = {
  title: string;
  describes: string[];
  fn: Fn;
  src: string;
  modifiers: string[];
};
type Hook = { kind: string; describes: string[]; fn: Fn };
type Binding = Current & {
  world: World;
  modifiers: string[];
  testInfo: Record<string, unknown>;
  fixtures: Record<string, unknown>;
  steps: { title: string; error?: string }[];
};
export type Registry = {
  tests: TestCase[];
  hooks: Hook[];
  /** Declaration and runtime calls: describe.configure, use, setTimeout, skip... */
  calls: { kind: string; args: unknown[] }[];
  requires: string[];
  env: Record<string, string | undefined>;
  test: Record<string, unknown>;
  bind: (b: Binding | undefined) => void;
};

function transpile(src: string, file: string) {
  const patched = src
    .replace(/import\.meta\.dirname/g, JSON.stringify(path.dirname(file)))
    .replace(/import\.meta\.filename/g, JSON.stringify(file))
    .replace(/import\.meta\.url/g, JSON.stringify(pathToFileURL(file).href));
  return ts.transpileModule(patched, {
    fileName: file,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
}

/**
 * Loads a spec source (default: the real tests/e2e/upload-crop.spec.ts) as if
 * it lived at tests/e2e/upload-crop.spec.ts, with `env` over a CI-free env.
 * Local helpers (./helpers/*) load for real against the fakes.
 */
export function loadSpec(
  opts: { source?: string; env?: Record<string, string | undefined> } = {},
): Registry {
  const source = opts.source ?? specSource();
  const env: Record<string, string | undefined> = { ...process.env };
  delete env.CI;
  Object.assign(env, opts.env ?? {});
  for (const k of Object.keys(env)) if (env[k] === undefined) delete env[k];
  const proc = new Proxy(process, {
    get(t, k) {
      if (k === "env") return env;
      const v = Reflect.get(t, k);
      return typeof v === "function" ? v.bind(t) : v;
    },
  });
  let binding: Binding | undefined;
  const cur = () => {
    if (!binding)
      throw new Error(
        "#2224 harness: Playwright API used outside a running test",
      );
    return binding;
  };
  const test = ((title: string, a: unknown, b?: unknown) =>
    registerTest(
      title,
      (typeof a === "function" ? a : b) as Fn,
    )) as unknown as Record<string, unknown>;
  const reg: Registry = {
    tests: [],
    hooks: [],
    calls: [],
    requires: [],
    env,
    test,
    bind: (b) => {
      binding = b;
    },
  };
  const describeStack: string[] = [];
  const describeMods: string[][] = [];
  const registerTest = (title: string, fn: Fn, mods: string[] = []) => {
    reg.tests.push({
      title,
      describes: [...describeStack],
      fn,
      src: fn.toString(),
      modifiers: [...mods, ...describeMods.flat()],
    });
  };
  const modifier =
    (kind: string) =>
    (...args: unknown[]) => {
      reg.calls.push({ kind, args });
      if (typeof args[0] === "string" && typeof args.at(-1) === "function") {
        registerTest(args[0], args.at(-1) as Fn, [kind]);
        return;
      }
      if (!binding) {
        // Declaration-time modifier inside a describe applies to its tests.
        describeMods.at(-1)?.push(kind);
        return;
      }
      let cond: unknown = args.length === 0 ? true : args[0];
      if (typeof cond === "function") cond = (cond as Fn)(binding.fixtures);
      const reason =
        typeof args[1] === "string"
          ? args[1]
          : typeof args[0] === "string"
            ? args[0]
            : "";
      if (!cond) return;
      binding.modifiers.push(kind);
      if (kind === "skip" || kind === "fixme") throw new SkipSignal(reason);
    };
  const describe =
    (mods: string[]) => (title: unknown, a?: unknown, b?: unknown) => {
      const fn = (
        typeof title === "function" ? title : typeof a === "function" ? a : b
      ) as () => void;
      const named = typeof title === "string";
      if (named) describeStack.push(title);
      describeMods.push([...mods]);
      fn();
      describeMods.pop();
      if (named) describeStack.pop();
    };
  const d = describe([]) as unknown as Record<string, unknown>;
  d.serial = describe(["serial"]);
  d.parallel = describe(["parallel"]);
  d.skip = describe(["skip"]);
  d.fixme = describe(["fixme"]);
  d.only = describe(["only"]);
  d.configure = (o: unknown) =>
    reg.calls.push({ kind: "describe.configure", args: [o] });
  test.describe = d;
  for (const kind of ["beforeEach", "afterEach", "beforeAll", "afterAll"])
    test[kind] = (a: unknown, b?: unknown) =>
      reg.hooks.push({
        kind,
        describes: [...describeStack],
        fn: (typeof a === "function" ? a : b) as Fn,
      });
  for (const kind of ["skip", "fixme", "fail", "slow"])
    test[kind] = modifier(kind);
  test.only = (t: string, fn: Fn) => registerTest(t, fn, ["only"]);
  test.setTimeout = (ms: number) => {
    reg.calls.push({ kind: "setTimeout", args: [ms] });
    binding?.modifiers.push("setTimeout");
  };
  test.use = (o: unknown) => reg.calls.push({ kind: "use", args: [o] });
  test.extend = () => test;
  test.info = () => cur().testInfo;
  test.step = async (title: string, fn: () => unknown) => {
    const c = cur();
    const s: { title: string; error?: string } = { title };
    c.steps.push(s);
    c.stepStack.push(title);
    const before = c.softErrors.length;
    try {
      return await fn();
    } catch (e) {
      s.error = e instanceof Error ? e.message : String(e);
      throw e;
    } finally {
      if (!s.error && c.softErrors.length > before)
        s.error = c.softErrors
          .slice(before)
          .map((x) => x.message)
          .join("\n");
      c.stepStack.pop();
    }
  };
  const pw = { test, expect: makeExpect(cur), devices: {}, default: test };
  const fsObj = makeFs(() => cur().world);
  const cache = new Map<string, unknown>();
  const load = (code: string, file: string): unknown => {
    const mod = { exports: {} as Record<string, unknown> };
    const req = (id: string) => {
      reg.requires.push(id);
      if (id === "@playwright/test") return pw;
      if (id === "fs" || id === "node:fs") return fsObj;
      if (id === "fs/promises" || id === "node:fs/promises")
        return fsObj.promises;
      if (id === "process" || id === "node:process") return proc;
      if (id === "canvas")
        throw new Error(
          "Cannot find module 'canvas' (blocked by the #2224 harness)",
        );
      if (id.startsWith(".")) {
        const base = path.resolve(path.dirname(file), id);
        const hit = [
          base,
          `${base}.ts`,
          `${base}.tsx`,
          path.join(base, "index.ts"),
        ].find((p) => realFs.existsSync(p) && realFs.statSync(p).isFile());
        if (!hit) throw new Error(`Cannot find module '${id}' from ${file}`);
        if (!cache.has(hit))
          cache.set(
            hit,
            load(transpile(realFs.readFileSync(hit, "utf8"), hit), hit),
          );
        return cache.get(hit);
      }
      return createRequire(file)(id);
    };
    new Function(
      "require",
      "module",
      "exports",
      "__dirname",
      "__filename",
      "process",
      code,
    )(req, mod, mod.exports, path.dirname(file), file, proc);
    return mod.exports;
  };
  load(transpile(source, SPEC_FILE), SPEC_FILE);
  return reg;
}

/* Runner --------------------------------------------------------------- */

export type RunResult = {
  outcome: "passed" | "failed" | "skipped";
  error?: string;
  skipReason?: string;
  steps: { title: string; error?: string }[];
  softErrors: { step?: string; message: string }[];
  modifiers: string[];
  world: World;
  /** Every failure detail: main error, failed steps, soft errors. */
  details: string[];
};

export function find(
  reg: Registry,
  pred: (t: TestCase) => boolean,
  what: string,
) {
  const hits = reg.tests.filter(pred);
  if (hits.length !== 1)
    throw new Error(
      `#2224 harness: expected exactly one ${what}; found ${hits.length} in ${JSON.stringify(reg.tests.map((t) => t.title))}`,
    );
  return hits[0]!;
}

/** Locates the spec's tests by the roles §1 gives them. */
export const pick = {
  open: (r: Registry) =>
    find(
      r,
      (t) =>
        /open/i.test(t.title) &&
        /cropper|dialog/i.test(t.title) &&
        !/cancel|mobile|zoom|rotat/i.test(t.title),
      "cropper-open test (title /open/ and /cropper|dialog/)",
    ),
  cancel: (r: Registry) =>
    find(r, (t) => /cancel/i.test(t.title), "cancel test (title /cancel/)"),
  zoom: (r: Registry) =>
    find(r, (t) => /zoom|rotat/i.test(t.title), "zoom/rotation test"),
  mobile: (r: Registry) =>
    find(r, (t) => /mobile/i.test(t.title), "mobile test (title /mobile/)"),
  controls: (r: Registry) =>
    find(
      r,
      (t) => /controls/i.test(t.title) && !/zoom|rotat/i.test(t.title),
      "controls test",
    ),
  invalid: (r: Registry) =>
    find(
      r,
      (t) => /invalid|unsupported/i.test(t.title),
      "invalid-type test (title /invalid|unsupported/)",
    ),
  drag: (r: Registry) =>
    find(
      r,
      (t) => /drag|drop/i.test(t.title),
      "drag/drop test (title /drag|drop/)",
    ),
  accept: (r: Registry) =>
    find(
      r,
      (t) => /["'`]accept["'`]/.test(t.src),
      "accepted-types test (its body reads the `accept` attribute)",
    ),
  large: (r: Registry) =>
    find(
      r,
      (t) => t.title === TITLES.largeFile,
      `test titled "${TITLES.largeFile}"`,
    ),
  apiInvalid: (r: Registry) =>
    find(
      r,
      (t) => t.title === TITLES.apiInvalidToken,
      `test titled "${TITLES.apiInvalidToken}"`,
    ),
  apiMissing: (r: Registry) =>
    find(
      r,
      (t) => t.title === TITLES.apiMissingAuth,
      `test titled "${TITLES.apiMissingAuth}"`,
    ),
};
/** Tests that use the cropper (§1.1: no bypass may remain in any of them). */
export const CROPPER_TESTS = ["open", "cancel", "zoom", "mobile"] as const;

const isPrefix = (a: string[], b: string[]) => a.every((x, i) => b[i] === x);
const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

export async function runTest(
  reg: Registry,
  tc: TestCase,
  cfg: Partial<WorldConfig> | World = {},
): Promise<RunResult> {
  const world = cfg instanceof World ? cfg : new World(cfg);
  const page = makePage(world);
  const out = tempDir("acc-2224-out-");
  const t = reg.test;
  const testInfo = strict(
    {
      title: tc.title,
      titlePath: ["upload-crop.spec.ts", ...tc.describes, tc.title],
      file: SPEC_FILE,
      project: { name: "chromium-donor", use: {} },
      retry: 0,
      repeatEachIndex: 0,
      workerIndex: 0,
      parallelIndex: 0,
      outputDir: out,
      outputPath: (...s: string[]) => path.join(out, ...s),
      annotations: [] as unknown[],
      attachments: [] as unknown[],
      attach: async () => {},
      skip: t.skip,
      fixme: t.fixme,
      fail: t.fail,
      slow: t.slow,
      setTimeout: t.setTimeout,
      timeout: 90_000,
      status: "passed",
      expectedStatus: "passed",
    },
    "testInfo",
  );
  const fixtures = {
    page,
    request: makeRequestContext(world),
    browserName: "chromium",
    baseURL: BASE_URL,
    isMobile: false,
    context: strict({ request: makeRequestContext(world) }, "context"),
  };
  const binding: Binding = {
    world,
    modifiers: [...tc.modifiers],
    testInfo,
    fixtures,
    steps: [],
    softErrors: [],
    stepStack: [],
  };
  const res: RunResult = {
    outcome: "passed",
    steps: binding.steps,
    softErrors: binding.softErrors,
    modifiers: binding.modifiers,
    world,
    details: [],
  };
  if (tc.modifiers.some((m) => m === "skip" || m === "fixme")) {
    res.outcome = "skipped";
    res.skipReason = "declared skip/fixme";
    return res;
  }
  const hooks = (kind: string) =>
    reg.hooks.filter(
      (h) => h.kind === kind && isPrefix(h.describes, tc.describes),
    );
  reg.bind(binding);
  const body = async () => {
    for (const h of hooks("beforeAll")) await h.fn({ ...fixtures }, testInfo);
    for (const h of hooks("beforeEach")) await h.fn({ ...fixtures }, testInfo);
    await tc.fn({ ...fixtures }, testInfo);
  };
  let timer: NodeJS.Timeout | undefined;
  try {
    await Promise.race([
      body(),
      new Promise((_, rej) => {
        timer = setTimeout(
          () => rej(new Error("#2224 harness: fake test timed out after 15s")),
          15_000,
        );
      }),
    ]);
  } catch (e) {
    if (e instanceof SkipSignal) {
      res.outcome = "skipped";
      res.skipReason = e.reason;
    } else {
      res.outcome = "failed";
      res.error = message(e);
    }
  } finally {
    clearTimeout(timer);
  }
  try {
    for (const h of hooks("afterEach").reverse())
      await h.fn({ ...fixtures }, testInfo);
  } catch (e) {
    if (res.outcome === "passed") {
      res.outcome = "failed";
      res.error = message(e);
    }
  }
  reg.bind(undefined);
  if (res.outcome === "passed" && res.softErrors.length > 0) {
    res.outcome = "failed";
    res.error = res.softErrors.map((s) => s.message).join("\n");
  }
  // test.fail() inverts the outcome, as in Playwright.
  if (res.modifiers.includes("fail") && res.outcome !== "skipped")
    res.outcome = res.outcome === "failed" ? "passed" : "failed";
  res.details = [
    ...(res.error ? [res.error] : []),
    ...res.steps.filter((s) => s.error).map((s) => `${s.title}: ${s.error}`),
    ...res.softErrors.map((s) => `${s.step ?? ""}: ${s.message}`),
  ];
  return res;
}

/** Load fresh (module state such as the demo-auth cache resets) and run one test. */
export async function runFresh(
  choose: (r: Registry) => TestCase,
  cfg: Partial<WorldConfig> | World = {},
  opts: { env?: Record<string, string | undefined>; source?: string } = {},
) {
  const reg = loadSpec(opts);
  return runTest(reg, choose(reg), cfg);
}

/* Unit-file mutants (criterion 8) -------------------------------------- */

export const IMAGE_UTILS_MUTANTS: {
  id: string;
  why: string;
  from: string;
  to: string;
}[] = [
  {
    id: "max-49",
    why: "MAX_SAFEGUARD_SIZE_MB changes (50 -> 49)",
    from: "MAX_SAFEGUARD_SIZE_MB = 50",
    to: "MAX_SAFEGUARD_SIZE_MB = 49",
  },
  {
    id: "max-51",
    why: "MAX_SAFEGUARD_SIZE_MB changes (50 -> 51)",
    from: "MAX_SAFEGUARD_SIZE_MB = 50",
    to: "MAX_SAFEGUARD_SIZE_MB = 51",
  },
  {
    id: "max-2",
    why: "MAX_SAFEGUARD_SIZE_MB changes (50 -> 2): 2 MiB + 1 and 10 MiB must stay valid",
    from: "MAX_SAFEGUARD_SIZE_MB = 50",
    to: "MAX_SAFEGUARD_SIZE_MB = 2",
  },
  {
    id: "gte",
    why: "the size comparison switches from > to >=",
    from: "file.size > MAX_SAFEGUARD_SIZE_BYTES",
    to: "file.size >= MAX_SAFEGUARD_SIZE_BYTES",
  },
  {
    id: "no-size-check",
    why: "the size safeguard is removed",
    from: "file.size > MAX_SAFEGUARD_SIZE_BYTES",
    to: "false",
  },
  {
    id: "and-rule",
    why: "MIME-or-extension becomes MIME-and-extension",
    from: "!isValidMime && !isValidExtension",
    to: "!isValidMime || !isValidExtension",
  },
  {
    id: "mime-only",
    why: "the extension is ignored (MIME only)",
    from: "!isValidMime && !isValidExtension",
    to: "!isValidMime",
  },
  {
    id: "no-type-check",
    why: "invalid_type is never returned",
    from: "!isValidMime && !isValidExtension",
    to: "false",
  },
  {
    id: "too-large-code",
    why: "the file_too_large error code changes",
    from: 'error: "file_too_large"',
    to: 'error: "unknown"',
  },
  {
    id: "too-large-message",
    why: "the file_too_large product message changes",
    from: "File is extremely large (>${MAX_SAFEGUARD_SIZE_MB}MB). Please use a smaller image.",
    to: "Too large.",
  },
  {
    id: "invalid-code",
    why: "the invalid_type error code changes",
    from: 'error: "invalid_type"',
    to: 'error: "unknown"',
  },
];

export type UnitRun = {
  status: number | null;
  numTotal: number;
  numFailed: number;
  numPassed: number;
  output: string;
};

/** Runs the unit file under Vitest; image-utils.ts is replaced by `mutant` when given. */
export async function runUnitFile(
  file: string,
  mutant?: string,
): Promise<UnitRun> {
  const { spawn } = await import("node:child_process");
  const dir = tempDir("acc-2224-unit-");
  const report = path.join(dir, "report.json");
  const env: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env))
    if (v !== undefined && !/^(VITEST|NODE_V8_COVERAGE)/.test(k)) env[k] = v;
  if (mutant !== undefined) {
    const m = path.join(dir, "image-utils.mutant.ts");
    realFs.writeFileSync(m, mutant);
    env.ACC_2224_IMAGE_UTILS_MUTANT = m;
  }
  const args = [
    path.join(ROOT, "node_modules/vitest/vitest.mjs"),
    "run",
    file,
    "--config",
    MUTANT_CONFIG,
    "--root",
    ROOT,
    "--reporter=json",
    `--outputFile.json=${report}`,
    "--no-fsModuleCache",
    "--coverage.enabled=false",
  ];
  return new Promise((res) => {
    const child = spawn(process.execPath, args, { cwd: ROOT, env });
    let output = "";
    child.stdout.on("data", (b) => (output += b));
    child.stderr.on("data", (b) => (output += b));
    child.on("close", (status) => {
      let j: {
        numTotalTests?: number;
        numFailedTests?: number;
        numPassedTests?: number;
      } = {};
      try {
        j = JSON.parse(realFs.readFileSync(report, "utf8"));
      } catch {
        // No report: the counts stay 0, which every caller treats as a failure.
      }
      res({
        status,
        numTotal: j.numTotalTests ?? 0,
        numFailed: j.numFailedTests ?? 0,
        numPassed: j.numPassedTests ?? 0,
        output,
      });
    });
  });
}
