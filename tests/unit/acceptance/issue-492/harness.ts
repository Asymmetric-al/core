/**
 * #492 shared fixtures (spec r1, issue comment 6386501770; approved in
 * 6386521560). Owned by Acceptance. Modules are imported lazily so each test
 * fails for its own reason while the slice is missing.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

import ts from "typescript";
import { expect } from "vitest";

export const CAP_DIR = "packages/auth/capabilities";
export const DOC = "docs/security/capability-spine/registry.md";
export const words = (s: string) => s.trim().split(/\s+/);
export const MODULES = words(
  "registry bundles errors effective-capabilities rows",
);
export const sorted = (xs: Iterable<string>) => [...xs].sort();
export const read = (f: string) =>
  existsSync(f) ? readFileSync(f, "utf8") : "";

/** The 11 ContributionCapability keys, in incumbent tier order (3 / 6 / 9 / 11). */
export const CONTRIB = words(`contributions.view_detail
  contributions.request_corrections contributions.manage_table_preferences
  contributions.apply_corrections contributions.manage_receipts
  contributions.retry_crm_post contributions.approve_corrections
  contributions.run_refunds contributions.use_provider_actions
  contributions.manage_settings crm.gift_history.manage_view_defaults`);
export const STAFF = words(
  "admin.dashboard.access admin.crm.manage admin.gifts.manage admin.reports.view",
);
export const [VIEW, PROPOSE, APPROVE] = words(
  "permissions.view permissions.propose_widening permissions.approve_widening",
) as [string, string, string];
export const PERMS = [VIEW, PROPOSE, APPROVE];
export const ALL = [...CONTRIB, ...STAFF, ...PERMS];
export const SUBROLES = words("finance mobilizer development hr member_care");
export const CODES = words(`missing_context foreign_tenant inactive_source
  multiple_assignments unknown_subject tenant_overrides_dormant`);

/** Spec In 2 bundles (incumbent tiers 3 / 6 / 9 / 11) and the default-subject table. */
export const BUNDLES: Record<string, string[]> = {
  staff_base: STAFF,
  donor_care: CONTRIB.slice(0, 3),
  finance_staff: CONTRIB.slice(0, 6),
  finance_approver: CONTRIB.slice(0, 9),
  contribution_admin: CONTRIB,
  permissions_viewer: [VIEW],
  permissions_proposer: [VIEW, PROPOSE],
  permissions_approver: PERMS,
};
export const DEFAULTS: Record<string, string[]> = {
  "member:donor": [],
  "member:missionary": [],
  ...Object.fromEntries(
    SUBROLES.map((s) => [
      `staff:${s}`,
      ["staff_base", s === "finance" ? "finance_staff" : "donor_care"],
    ]),
  ),
  tenant_admin: ["staff_base", "finance_approver", "permissions_proposer"],
  platform_admin: ["staff_base", "contribution_admin", "permissions_approver"],
};
export const SUBJECTS = Object.keys(DEFAULTS);
export const expected = (subject: string) =>
  [...new Set(DEFAULTS[subject]!.flatMap((b) => BUNDLES[b]!))].sort();

/** Fixture ids are distinctive so the non-disclosure scan can find them. */
export const T = "tnt-7f3a91";
export const T2 = "tnt-c40e22";
export const assignment = (role: string, staffRole: string | null, o = {}) => ({
  kind: "assignment",
  assignmentId: `asg-${role}-${staffRole ?? "none"}-5d1`,
  tenantId: T,
  role,
  staffRole,
  isActive: true,
  ...o,
});
export const named = (subject: string, o = {}) => ({
  kind: "named",
  grantId: `grt-${subject}-9b4`,
  tenantId: T,
  subject,
  active: true,
  ...o,
});
export const sourceFor = (subject: string) => {
  const [head, tail] = subject.split(":");
  if (head === "member") return assignment(tail!, null);
  if (head === "staff") return assignment("staff", tail!);
  return named(subject);
};
export const ctx = (...sources: object[]) => ({ tenantId: T, sources });

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO(#492): lazily imported while the modules may be missing; type it once they land
type Mod = Record<string, any>;
export async function load(name: string): Promise<Mod> {
  const file = `${CAP_DIR}/${name}.ts`;
  expect(existsSync(file), `${file} must exist (spec In 1-5)`).toBe(true);
  return (await import(/* @vite-ignore */ resolve(file))) as Mod;
}

/** Resolves one subject's default source untyped (Reflect.apply, no casts). */
export async function resolveFor(subject: string, ...rest: unknown[]) {
  const { resolveEffectiveCapabilities: fn } = await load(
    "effective-capabilities",
  );
  const args = [ctx(sourceFor(subject)), ...rest];
  return Reflect.apply(fn, undefined, args) as string[];
}

/** Calls the resolver untyped (Reflect.apply, no casts) and returns the thrown error. */
export async function thrown(...args: unknown[]) {
  const { resolveEffectiveCapabilities: fn } = await load(
    "effective-capabilities",
  );
  const { CapabilityResolutionError } = await load("errors");
  let result: unknown;
  try {
    result = Reflect.apply(fn, undefined, args);
  } catch (error) {
    expect(error).toBeInstanceOf(CapabilityResolutionError);
    return error as Error & { code: string };
  }
  throw new Error(`expected a throw, got ${JSON.stringify(result)}`);
}

/**
 * Type-checks the capability files plus virtual fixture files placed in
 * CAP_DIR, with optional in-memory rewrites of real files. Returns diagnostics.
 */
export function typecheck(
  virtual: Record<string, string>,
  rewrite: Record<string, (src: string) => string> = {},
) {
  const cfg = ts.readConfigFile("packages/auth/tsconfig.json", ts.sys.readFile);
  const { options: base } = ts.parseJsonConfigFileContent(
    cfg.config,
    ts.sys,
    resolve("packages/auth"),
  );
  const off = { noUnusedLocals: false, noUnusedParameters: false };
  const options = { ...base, ...off, noEmit: true, incremental: false };
  const files = new Map<string, string>();
  for (const [f, src] of Object.entries(virtual))
    files.set(resolve(CAP_DIR, f), src);
  for (const [f, edit] of Object.entries(rewrite))
    files.set(resolve(f), edit(read(f)));
  const get = (f: string) => files.get(resolve(f));
  const host = ts.createCompilerHost(options);
  const { getSourceFile, fileExists, readFile } = host;
  host.fileExists = (f) => get(f) !== undefined || fileExists(f);
  host.readFile = (f) => get(f) ?? readFile(f);
  host.getSourceFile = (f, lang, ...rest) => {
    const text = get(f);
    if (text === undefined) return getSourceFile(f, lang, ...rest);
    return ts.createSourceFile(f, text, lang);
  };
  const roots = MODULES.map((m) => resolve(CAP_DIR, `${m}.ts`));
  const all = [...roots.filter(existsSync), ...files.keys()];
  const program = ts.createProgram(all, options, host);
  return ts.getPreEmitDiagnostics(program).map((d) => ({
    file: relative(".", d.file?.fileName ?? "."),
    line: 1 + (d.file?.getLineAndCharacterOfPosition(d.start ?? 0).line ?? -1),
    code: d.code,
  }));
}
export const inCapDir = (d: { file: string }) => dirname(d.file) === CAP_DIR;

/** Capability-file diagnostics after an in-memory edit of `file` (baseline must be clean). */
export function errorsAfter(file: string, edit: (src: string) => string) {
  expect(typecheck({}).filter(inCapDir), "baseline compiles clean").toEqual([]);
  return typecheck({}, { [file]: edit }).filter(inCapDir);
}
