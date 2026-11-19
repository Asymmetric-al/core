/**
 * `test-unit` runs as a matrix of shards, each `bun run test:unit
 * --shard=<i>/<N>`. Vitest decides which files a shard runs, so this checks,
 * with Vitest's own selection and shard assignment (support/vitest-run-files),
 * that the shards the workflow defines together run exactly the files the
 * unsharded `test:unit` runs, each file once and none of the acceptance
 * directory; and that `test:unit` plus the acceptance job run exactly what
 * Vitest's configuration includes, as `test:unit` alone did before the
 * acceptance directory moved to its own job.
 */
import { beforeAll, describe, expect, it } from "vitest";

import { buildVitestInvocation as acceptanceInvocation } from "../../../scripts/verify/acceptance-tests.mjs";
import { loadWorkflowJobs } from "../helpers/workflow-yaml";
import {
  filesVitestRuns,
  unitRunnerVitestArgs,
} from "./support/vitest-selection";

type Step = { name?: string; run?: string };
const job = loadWorkflowJobs(".github/workflows/ci.yml")["test-unit"]!;
const strategy = (job.strategy ?? {}) as {
  matrix?: Record<string, unknown>;
};
const shards = (strategy.matrix?.shard ?? []) as number[];
const count = shards.length;
const run =
  ((job.steps ?? []) as Step[]).find((step) => step.name === "Run unit tests")
    ?.run ?? "";

/** The step's command for one shard, as GitHub expands it. */
function shardArguments(shard: number): string[] {
  const command = run
    .replaceAll("${{ matrix.shard }}", String(shard))
    .replaceAll("${{ strategy.job-total }}", String(count));
  const [bun, verb, script, ...args] = command.trim().split(/\s+/);
  expect([bun, verb, script]).toEqual(["bun", "run", "test:unit"]);
  expect(command).not.toContain("${{");
  return args;
}

const inAcceptance = (file: string) =>
  file.startsWith("tests/unit/acceptance/");

describe("test-unit shards", () => {
  it("are numbered 1..N in a single matrix dimension, so strategy.job-total is N", () => {
    expect(Object.keys(strategy.matrix ?? {})).toEqual(["shard"]);
    expect(count).toBeGreaterThanOrEqual(2);
    expect(shards).toEqual(
      Array.from({ length: count }, (_value, index) => index + 1),
    );
  });

  describe("as Vitest assigns files", () => {
    let unsharded: string[] = [];
    let perShard: string[][] = [];
    let acceptance: string[] = [];
    let configured: string[] = [];

    beforeAll(async () => {
      const lists = await filesVitestRuns([
        unitRunnerVitestArgs([]),
        ...shards.map((shard) => unitRunnerVitestArgs(shardArguments(shard))),
        acceptanceInvocation("unused.json").args.slice(1),
        // test:unit before the acceptance directory moved: coverage only.
        ["run", "--coverage"],
      ]);
      unsharded = lists[0]!;
      perShard = lists.slice(1, 1 + count);
      acceptance = lists[1 + count]!;
      configured = lists[2 + count]!;
    }, 300_000);

    it("gives every shard files", () => {
      expect(perShard).toHaveLength(count);
      for (const files of perShard) expect(files.length).toBeGreaterThan(0);
    });

    it("runs each file in exactly one shard", () => {
      const all = perShard.flat();
      expect(new Set(all).size).toBe(all.length);
    });

    it("runs together exactly the files the unsharded test:unit runs", () => {
      expect([...perShard.flat()].sort()).toEqual(unsharded);
    });

    it("leaves the acceptance directory to the acceptance job", () => {
      expect(unsharded.filter(inAcceptance)).toEqual([]);
      expect(acceptance.length).toBeGreaterThan(0);
      expect(acceptance.every(inAcceptance)).toBe(true);
    });

    it("runs with the acceptance job exactly what Vitest's configuration includes, each file once", () => {
      expect(unsharded.filter((file) => acceptance.includes(file))).toEqual([]);
      expect([...unsharded, ...acceptance].sort()).toEqual(configured);
    });
  });
});
