import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const importMapPath = path.resolve(
  process.cwd(),
  "app/(payload)/admin/importMap.js",
);

const lintHeader = "/* eslint-disable import-x/no-duplicates, import-x/order */";
const typedExport = "/** @type {Record<string, unknown>} */\nexport const importMap =";

async function ensureImportMapExists() {
  await access(importMapPath);
}

function ensureLintHeader(content) {
  if (content.startsWith(lintHeader)) {
    return content;
  }

  return `${lintHeader}\n${content}`;
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

async function run() {
  await ensureImportMapExists();

  const current = await readFile(importMapPath, "utf8");
  const withHeader = ensureLintHeader(current);
  const withTypedExport = ensureTypedExport(withHeader);

  if (withTypedExport !== current) {
    await writeFile(importMapPath, withTypedExport, "utf8");
    console.log(`Post-processed Payload import map at ${importMapPath}`);
  } else {
    console.log("Payload import map already post-processed.");
  }
}

run().catch((error) => {
  console.error("Failed to post-process Payload import map.", error);
  process.exitCode = 1;
});
