#!/usr/bin/env node
import { readFileSync } from "node:fs";
import {
  renderContractView,
  renderContractViews,
} from "./lib/openspec-contracts.mjs";

const [capability, mode] = process.argv.slice(2);
if (
  !capability ||
  !["--check", "--write"].includes(mode) ||
  process.argv.length !== 4
)
  throw new Error(
    "Usage: openspec-contract-view.mjs <capability|--batch> <--check|--write> (reads spec or JSON batch on stdin)",
  );
const content = readFileSync(0, "utf8");
const write = mode === "--write";
process.stdout.write(
  capability === "--batch"
    ? JSON.stringify(await renderContractViews(JSON.parse(content), { write }))
    : await renderContractView({ capability, content, write }),
);
