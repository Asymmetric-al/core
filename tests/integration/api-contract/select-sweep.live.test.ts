/**
 * #2708: every statically resolvable `.select(...)` in packages/api/src runs
 * through the run's PostgREST against the migrated schema, as service_role
 * with `limit=0`: PostgreSQL still plans the column list and PostgREST still
 * resolves every embed and schema, so no data is needed. A phantom column
 * (23f2bd454), a phantom embed (#2269) or an unexposed schema (#1560) fails
 * here by name.
 */
import path from "node:path";

import { expect, it } from "vitest";

import { KNOWN_SELECT_DEFECTS, type KnownSelectDefect } from "./known-defects";
import { describeLive, serviceClient } from "./live-stack";
import { inventorySelects, type SelectSite } from "./select-inventory";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const ROOTS = ["packages/api/src"] as const;

type Failure = {
  sites: SelectSite[];
  code: string;
  message: string;
  details: string;
};

const compact = (select: string) => select.replace(/\s+/g, " ").trim();

const knownDefectOf = (failure: Failure): KnownSelectDefect | undefined =>
  KNOWN_SELECT_DEFECTS.find(
    (known) =>
      known.code === failure.code &&
      failure.sites.some(
        (site) => site.file === known.file && site.table === known.table,
      ),
  );

export function formatFailures(failures: readonly Failure[]): string {
  const lines = [
    `${failures.length} select(s) do not match the migrated schema as PostgREST serves it:`,
  ];
  for (const failure of failures) {
    const [first, ...rest] = failure.sites;
    const site = first!;
    const more = rest.length
      ? ` (also ${rest.map((s) => `${s.file === site.file ? "" : s.file}:${s.line}`).join(", ")})`
      : "";
    const target = site.schema
      ? `schema("${site.schema}").from("${site.table}")`
      : `from("${site.table}")`;
    const select = compact(site.select ?? "");
    lines.push(
      `- ${site.file}:${site.line}${more}`,
      `  ${target}.select("${select.length > 400 ? `${select.slice(0, 400)}…` : select}")`,
      `  ${failure.code}: ${failure.message}${failure.details ? ` (${failure.details})` : ""}`,
    );
  }
  return lines.join("\n");
}

describeLive("packages/api selects against the migrated schema", (stack) => {
  const sites = inventorySelects({ repoRoot, roots: ROOTS });
  const resolved = sites.filter((s) => s.table && s.select !== null);
  const unresolved = sites.filter((s) => !(s.table && s.select !== null));

  it("executes every resolvable select through PostgREST without an error", async () => {
    const client = serviceClient(stack);
    const groups = new Map<string, SelectSite[]>();
    for (const site of resolved) {
      const key = `${site.schema ?? ""}|${site.table}|${compact(site.select!)}`;
      groups.set(key, [...(groups.get(key) ?? []), site]);
    }

    const failures: Failure[] = [];
    const queue = [...groups.values()];
    const worker = async () => {
      for (let group = queue.shift(); group; group = queue.shift()) {
        const site = group[0]!;
        const from = site.schema ? client.schema(site.schema) : client;
        const { error } = await from
          .from(site.table!)
          .select(site.select!)
          .limit(0);
        if (error)
          failures.push({
            sites: group,
            code: error.code ?? "unknown",
            message: error.message,
            details: error.details ?? "",
          });
      }
    };
    await Promise.all(Array.from({ length: 6 }, worker));

    console.info(
      [
        `API contract: ${groups.size} distinct selects from ${resolved.length} call sites executed in ${ROOTS.join(", ")}.`,
        `Not statically resolvable (${unresolved.length}), so not verified here:`,
        ...unresolved.map((s) => `  ${s.file}:${s.line} ${s.unresolved}`),
      ].join("\n"),
    );
    failures.sort((a, b) =>
      `${a.sites[0]!.file}:${a.sites[0]!.line}`.localeCompare(
        `${b.sites[0]!.file}:${b.sites[0]!.line}`,
      ),
    );
    const unexpected = failures.filter((failure) => !knownDefectOf(failure));
    const known = failures.filter((failure) => knownDefectOf(failure));
    if (known.length > 0)
      console.info(
        `Known product defects, reported and not yet fixed (known-defects.ts):\n${formatFailures(known)}`,
      );
    expect(unexpected, formatFailures(unexpected)).toEqual([]);
    const stale = KNOWN_SELECT_DEFECTS.filter(
      (entry) => !known.some((failure) => knownDefectOf(failure) === entry),
    );
    expect(
      stale,
      `These known defects no longer reproduce; delete their entries from tests/integration/api-contract/known-defects.ts:\n${stale
        .map((entry) => `- ${entry.file} (${entry.table}, ${entry.code})`)
        .join("\n")}`,
    ).toEqual([]);
  });

  it("serves only the exposed schemas, as the hosted Data API does", async () => {
    const { error } = await serviceClient(stack)
      .schema("authz")
      .from("memberships")
      .select("user_id")
      .limit(0);
    expect(error?.code).toBe("PGRST106");
  });
});
