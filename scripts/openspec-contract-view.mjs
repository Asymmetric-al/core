#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { renderContractView } from "./lib/openspec-contracts.mjs";

const [capability, mode] = process.argv.slice(2);
if (
  !capability ||
  !["--check", "--write"].includes(mode) ||
  process.argv.length !== 4
)
  throw new Error(
    "Usage: openspec-contract-view.mjs <capability> <--check|--write> (reads spec on stdin)",
  );
process.stdout.write(
  await renderContractView({
    capability,
    content: readFileSync(0, "utf8"),
    write: mode === "--write",
  }),
);
