/**
 * #2708: the API contract job replays the migrate job's chain. Its "Apply
 * migrations" step runs scripts/verify/supabase-migrations.mjs, which spawns
 * scripts/verify/field-policy-census.mjs, and the census reads a pinned base
 * commit with `git show <repository_base_sha>:<path>`
 * (docs/security/field-policies/repository-supplement-v1.json). A default,
 * one-commit checkout does not hold that commit, so the step would fail on
 * GitHub while passing in a local clone. The migrate job checks out full
 * history for the same reason (1a1a9c01b). Pure: reads the workflow.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const WORKFLOW = ".github/workflows/api-contract.yml";

/** The `with:` options of the first actions/checkout step of `job`. */
export function checkoutOptions(
  workflow: string,
  job: string,
): Record<string, string> {
  const lines = workflow.replace(/\r\n/g, "\n").split("\n");
  const start = lines.findIndex((line) => line === `  ${job}:`);
  if (start < 0) throw new Error(`no job ${job}`);
  const end = lines.findIndex((line, i) => i > start && /^ {0,2}\S/.test(line));
  const body = lines.slice(start + 1, end < 0 ? undefined : end);
  const at = body.findIndex((line) =>
    /^\s*- uses: actions\/checkout@/.test(line),
  );
  if (at < 0) throw new Error(`job ${job} has no actions/checkout step`);
  const stepIndent = body[at]!.indexOf("-");
  const options: Record<string, string> = {};
  for (const line of body.slice(at + 1)) {
    if (line.trim() === "") continue;
    if (line.search(/\S/) <= stepIndent) break;
    const option = /^\s+([\w-]+):\s*(\S.*?)\s*(?:#.*)?$/.exec(line);
    if (option) options[option[1]!] = option[2]!;
  }
  return options;
}

describe("api-contract workflow checkout", () => {
  const options = checkoutOptions(
    readFileSync(path.join(repoRoot, WORKFLOW), "utf8"),
    "api-contract",
  );

  it("reads the checkout step", () => {
    expect(options["persist-credentials"]).toBe("false");
  });

  it("fetches the full history the migrate step's field-policy census reads", () => {
    expect(
      options["fetch-depth"],
      "actions/checkout fetch-depth (0 = full history; the census runs git show on a pinned base commit)",
    ).toBe("0");
  });
});
