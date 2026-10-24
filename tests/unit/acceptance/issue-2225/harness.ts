/**
 * #2225 acceptance harness: transpiles a target spec and runs it against a
 * fake Playwright/Vitest plus a tiny simulated Support Hub (no browser,
 * server, network or secret). Owned by Acceptance; do not edit.
 * Spec: https://github.com/Asymmetric-al/core/issues/2225#issuecomment-6378138486
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import ts from "typescript";
import { expect as vexpect } from "vitest";

export const HUB = "tests/e2e/support-hub.smoke.spec.ts";
export const PERF = "tests/e2e/performance.spec.ts";
export const STRIPE = "tests/unit/packages/api/stripe-event-store.test.ts";
export const read = (rel: string) =>
  readFileSync(path.join(process.cwd(), rel), "utf8");
export const sha256 = (s: string) =>
  createHash("sha256").update(s).digest("hex");

/** Simulated state; crashed renders #__next_error__, noopToggle/ignoreStatus
 * are the spec's product mutations, layout/status are derived from goto. */
export type World = Partial<{
  demoStatus: number;
  roles: object;
  installOk: boolean;
  crashed: boolean;
  noopToggle: boolean;
  ignoreStatus: boolean;
  vitals: Record<string, number | null>;
  assets: { url: string; cacheControl: string }[];
  layout: string;
  status: string;
}>;
type Dyn = Record<string | symbol, unknown>;
export type Step = { kind: string; path: string; m?: string; not?: boolean };
type Fn = (...a: unknown[]) => unknown;
export type Case = { title: string; describes: string[]; fn: Fn };
type Opts = { env?: object; modules?: object; world?: World };

class Skip extends Error {}
const PATH = Symbol("path");
const ACTION = /^(click|fill|press|check|hover|tap)$/;
const fmt = (a: unknown) =>
  JSON.stringify(a, (_k, v) => (v instanceof RegExp ? String(v) : v)) ?? "";
const SHOW: Record<string, (vis: boolean, n: unknown) => boolean> = {
  toBeVisible: (vis) => vis,
  toBeAttached: (vis) => vis,
  toBeHidden: (vis) => !vis,
  toHaveCount: (vis, n) => (vis ? 1 : 0) === n,
};
const VITALS = { lcp: 900, fcp: 500, ttfb: 300, cls: 0 };
const CJS = { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 };
const res = (h: object, url = "", status = 200) => ({
  url: () => url,
  ok: () => status < 300,
  status: () => status,
  headers: () => h,
});

/** What a locator assertion observes in the simulated Support Hub. */
function judge(w: World, p: string, m: string, args: unknown[]) {
  const show = (vis: boolean) => SHOW[m]?.(vis, args[0]);
  if (p.includes("#__next_error__")) return show(!!w.crashed);
  if (/board view/i.test(p)) return show(w.layout === "board");
  if (/not found/i.test(p)) return show(!w.crashed);
  const item = /\bTable\b/.test(p) ? "table" : /\bBoard\b/.test(p) && "board";
  if (item && /pressed|checked/i.test(m + fmt(args)))
    return /"false"/.test(fmt(args)) !== (w.layout === item);
  if (!p.includes("Status filter") || !/Text/.test(m)) return undefined;
  const label = w.status === "open" ? "Open" : "All statuses";
  const x = args[0];
  if (x instanceof RegExp) return x.test(label);
  return m === "toHaveText" ? label === x : label.includes(String(x));
}

function fakes(w: World, steps: Step[]) {
  const proxy = (get: (k: string) => unknown, p: string) =>
    new Proxy({} as Dyn, {
      get(_t, k) {
        if (k === PATH) return p;
        return typeof k === "symbol" || k === "then" ? undefined : get(k);
      },
    });
  const click = async (p: string, k: string) => {
    steps.push({ kind: k, path: p });
    if (k !== "click" || w.noopToggle) return;
    if (/\bTable\b/.test(p)) w.layout = "table";
    else if (/\bBoard\b/.test(p)) w.layout = "board";
  };
  const call =
    (p: string, k: string) =>
    (...a: unknown[]) =>
      chain(`${p}.${k}(${fmt(a)})`);
  const chain = (p: string): Dyn =>
    proxy((k) => (ACTION.test(k) ? () => click(p, k) : call(p, k)), p);
  const handlers: Fn[] = [];
  const base: Record<string, unknown> = {
    request: {
      get: async () => ({
        ...res({}, "", w.demoStatus ?? 200),
        json: async () => ({ roles: w.roles ?? { admin: true } }),
      }),
    },
    on: (evt: string, h: Fn) => {
      steps.push({ kind: `on:${evt}`, path: "page" });
      if (evt === "response") handlers.push(h);
    },
    goto: async (url: string) => {
      steps.push({ kind: "goto", path: url });
      const q = new URL(url, "http://app.test").searchParams;
      w.layout = q.get("layout") ?? "board";
      w.status = w.ignoreStatus ? "all" : (q.get("status") ?? "all");
      for (const a of w.assets ?? [])
        for (const h of handlers)
          h(res({ "cache-control": a.cacheControl }, a.url));
      return res({ "content-type": "text/html; charset=utf-8" });
    },
    waitForLoadState: async (s: string) =>
      steps.push({ kind: "wait", path: s }),
    evaluate: async () => ({ ...VITALS, ...w.vitals }),
    content: async () => "<html><head></head><body></body></html>",
  };
  const page = proxy((k) => (k in base ? base[k] : chain("page")[k]), "page");
  const matchers = (p: string, not: boolean): Dyn =>
    proxy((m) => {
      if (m === "not") return matchers(p, !not);
      return async (...args: unknown[]) => {
        steps.push({ kind: "expect", path: p + fmt(args), m, not });
        if (judge(w, p, m, args) === not)
          throw new Error(
            `expect(${p}).${not ? "not." : ""}${m}${fmt(args)} failed`,
          );
      };
    }, "");
  const expect = (v: unknown, msg?: string) => {
    const p = (v as Dyn | null)?.[PATH];
    if (typeof p === "string") return matchers(p, false);
    steps.push({ kind: "expect", path: "value" });
    return vexpect(v, msg);
  };
  return { page, expect: Object.assign(expect, { soft: expect }) };
}

/** Load a spec into a registry; `modules` maps import-specifier suffixes. */
export function loadSpec(rel: string, opts: Opts = {}) {
  const w: World = { ...opts.world };
  const steps: Step[] = [];
  const { page, expect } = fakes(w, steps);
  const tests: Case[] = [];
  const hooks: Fn[] = [];
  const stack: string[] = [];
  const last = (a: unknown[]) => a.at(-1) as Fn;
  const reg = (title: string, ...a: unknown[]) =>
    tests.push({ title, describes: [...stack], fn: last(a) });
  const describe = (title: string, ...a: unknown[]) => {
    stack.push(title);
    last(a)();
    stack.pop();
  };
  const skip = (cond?: unknown, reason?: string) => {
    if (typeof cond !== "string" && (cond === undefined || cond))
      throw new Skip(reason);
  };
  const attach = async (name: string, o: { body?: unknown }) =>
    steps.push({ kind: "attach", path: `${name} ${String(o?.body)}` });
  const info = { attach, annotations: [], project: { name: "chromium" } };
  const beforeEach = (f: Fn) => hooks.push(f);
  const extra = { setTimeout() {}, info: () => info };
  const test = Object.assign(reg, { describe, skip, beforeEach, ...extra });
  const log = (...a: unknown[]) => steps.push({ kind: "log", path: fmt(a) });
  const modules: Record<string, unknown> = {
    "@playwright/test": { test, expect },
    vitest: { describe, it: test, test, expect },
    "./base-urls": { adminBaseURL: "http://admin.test" },
    "./helpers/demo-auth": {
      getDemoRoleMap: (b: { roles?: object }) => b?.roles ?? null,
    },
    "./helpers/install-demo-session": {
      installDemoSessionInBrowser: async () => ({
        ok: w.installOk !== false,
        status: w.installOk === false ? 500 : 200,
      }),
    },
    ...opts.modules,
  };
  const require = (id: string) => {
    const key = Object.keys(modules).find((k) => id.endsWith(k));
    if (!key) throw new Error(`#2225 harness: unexpected import ${id}`);
    return modules[key];
  };
  const js = ts.transpileModule(read(rel), { compilerOptions: CJS }).outputText;
  const env = { ...opts.env };
  const params = ["require", "exports", "console", "process", js];
  new Function(...params)(require, {}, { ...console, log }, { env });

  async function run(c: Case) {
    steps.length = 0;
    try {
      for (const h of hooks) await h({ page }, info);
      await c.fn({ page, request: page.request }, info);
      return { outcome: "passed", error: "", steps: [...steps] };
    } catch (e) {
      const outcome = e instanceof Skip ? "skipped" : "failed";
      const error = String((e as Error)?.message);
      return { outcome, error, steps: [...steps] };
    }
  }
  return { tests, run };
}

/** Run the single test whose title matches `re`, in a fresh registry. */
export async function runOne(rel: string, re: RegExp | number, o: Opts = {}) {
  const spec = loadSpec(rel, o);
  const found =
    typeof re === "number"
      ? spec.tests.slice(re, re + 1)
      : spec.tests.filter((t) => re.test(t.title));
  const titles = fmt(found.map((t) => t.title));
  if (found.length !== 1)
    throw new Error(`want one ${re} in ${rel}: ${titles}`);
  return { ...(await spec.run(found[0]!)), title: found[0]!.title };
}

/** Recorded expect steps whose locator matches `re` and matcher+args `m`. */
export const asserted = (steps: Step[], re: RegExp, m = /./) =>
  steps.filter(
    (s) => s.kind === "expect" && re.test(s.path) && m.test(s.m + s.path),
  );

/** Source text of one test block, from its title to the closing "  });". */
export function block(src: string, title: string) {
  const start = src.indexOf(`test("${title}"`);
  return start < 0 ? "" : src.slice(start, src.indexOf("\n  });\n", start) + 6);
}
