// Child process of scripts/cms/qualify-payload-pin.mjs. It loads the proof
// body through the pinned Payload's own tsx, as the Payload CLI loads itself,
// runs one mode and prints one result line.
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { adminAppDir } from "./paths.mjs";

const RESULT_PREFIX = "PAYLOAD_QUALIFICATION_RESULT ";

const mode = process.argv[2];
const modes = {
  startup: "runStartupProof",
  start: "runStartAttempt",
  constraints: "runConstraintList",
  baseline: "runBaselineProof",
  "blocks-read": "runBlocksRead",
  "deleted-media-read": "runDeletedMediaRead",
  "pooling-probe": "runPoolingProbe",
};

if (!Object.hasOwn(modes, mode)) {
  console.error("Usage: payload-qualification-runtime.mjs <mode>");
  process.exit(2);
}

const adminRequire = createRequire(path.join(adminAppDir, "package.json"));
const payloadEntry = adminRequire.resolve("payload");
const payloadRequire = createRequire(payloadEntry);
const { tsImport } = await import(
  pathToFileURL(payloadRequire.resolve("tsx/esm/api")).href
);

const body = await tsImport(
  "./payload-qualification-body.mjs",
  import.meta.url,
);
const result = await body[modes[mode]]();
process.stdout.write(`\n${RESULT_PREFIX}${JSON.stringify(result)}\n`);
process.exit(0);
