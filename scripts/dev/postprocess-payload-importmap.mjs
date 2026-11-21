import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { formatSource } from "../lib/format-source.mts";

/**
 * Payload may emit an import map under `web-studio/` (current) or `admin/` (legacy).
 * Long-term we ship a single canonical map per admin app; post-process every file
 * that exists so its formatting and typed export stay consistent after `cms:importmap`.
 */
const importMapCandidates = [
  path.resolve(process.cwd(), "app/(payload)/web-studio/importMap.js"),
  path.resolve(process.cwd(), "app/(payload)/admin/importMap.js"),
];

const lintHeader =
  "/* eslint-disable import-x/no-duplicates, import-x/order -- TODO(AL-000): auto-generated Payload import map */";
const typedExport =
  "/** @type {Record<string, unknown>} */\nexport const importMap =";

async function listExistingImportMaps() {
  const found = [];
  for (const candidate of importMapCandidates) {
    try {
      await access(candidate);
      found.push(candidate);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  return found;
}

function ensureTypedExport(content) {
  if (content.includes(typedExport)) {
    return content;
  }

  return content.replace(
    /^export const importMap =/m,
    "/** @type {Record<string, unknown>} */\nexport const importMap =",
  );
}

async function prepareFile(importMapPath) {
  const current = await readFile(importMapPath, "utf8");
  const normalized = current.replaceAll("\r\n", "\n");
  const body = normalized.startsWith(`${lintHeader}\n`)
    ? normalized.slice(lintHeader.length + 1)
    : normalized;
  const formatted = await formatSource(
    importMapPath,
    ensureTypedExport(body),
    "trusted",
  );
  return { importMapPath, current, formatted };
}

async function run() {
  const paths = await listExistingImportMaps();
  if (paths.length === 0) {
    throw new Error(
      `Payload import map not found. Tried:\n${importMapCandidates.join("\n")}`,
    );
  }

  for (const { importMapPath, current, formatted } of await Promise.all(
    paths.map(prepareFile),
  )) {
    if (formatted !== current) {
      await writeFile(importMapPath, formatted, "utf8");
      console.log(`Post-processed Payload import map at ${importMapPath}`);
    } else {
      console.log(
        `Payload import map already post-processed: ${importMapPath}`,
      );
    }
  }
}

run().catch((error) => {
  console.error("Failed to post-process Payload import map.", error);
  process.exitCode = 1;
});
