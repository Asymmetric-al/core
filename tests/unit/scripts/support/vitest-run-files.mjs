#!/usr/bin/env node
// Prints the test files one `vitest` argument list would execute, as decided
// by Vitest itself: its CLI parser, the repository's configuration (include
// and exclude), its filter matching and, under --shard, the configured
// sequencer's shard assignment. These are the calls Vitest.start and the pool
// make (getRelevantTestSpecifications, then sequencer.shard); nothing is
// re-implemented except the two lines of CLI normalisation that are not
// exported (cliExclude and includeTaskLocation, as normalizeCliOptions does).
//
// Usage: node vitest-run-files.mjs '<JSON array of arguments after "vitest">'
// from the repository root. One argument list per process: Vitest 5.0.5 keeps
// a CLI --exclude in shared state, so a second instance created in the same
// process would inherit the first one's exclusions.
import path from "node:path";
import { Writable } from "node:stream";

import { createVitest, parseCLI } from "vitest/node";

const RESULT_MARKER = "vitest-run-files:";

const args = JSON.parse(process.argv[2] ?? "[]");
if (!Array.isArray(args)) throw new Error("expected a JSON array of arguments");
const { filter, options } = parseCLI(["vitest", ...args]);
if (options.exclude) {
  options.cliExclude = [options.exclude].flat();
  delete options.exclude;
}
if (filter.some((entry) => entry.includes(":")))
  options.includeTaskLocation ??= true;
// The CLI normalises each filter (pathe's normalize) before matching.
const filters = filter.map((entry) =>
  path.posix.normalize(entry.replaceAll("\\", "/")),
);
const silent = new Writable({ write: (_chunk, _encoding, done) => done() });
const vitest = await createVitest(
  "test",
  { ...options, watch: false, run: true },
  {},
  { stdout: silent, stderr: process.stderr },
);
try {
  let specifications = await vitest.getRelevantTestSpecifications(filters);
  if (vitest.config.shard) {
    const Sequencer = vitest.config.sequence.sequencer;
    specifications = await new Sequencer(vitest).shard([...specifications]);
  }
  const files = [
    ...new Set(
      specifications.map((specification) =>
        path
          .relative(vitest.config.root, specification.moduleId)
          .replaceAll("\\", "/"),
      ),
    ),
  ].sort();
  process.stdout.write(`${RESULT_MARKER}${JSON.stringify(files)}\n`);
} finally {
  await vitest.close();
}
