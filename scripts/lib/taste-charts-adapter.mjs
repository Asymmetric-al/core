import { createHash } from "node:crypto";
import { lstat, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryPackage = fileURLToPath(
  new URL("../../package.json", import.meta.url),
);
const guidanceUrl = new URL(
  "../refresh-overlays/taste-charts-safety.json",
  import.meta.url,
);
const hash = (content) => createHash("sha256").update(content).digest("hex");

/** Patch only the reviewed chart asset as data; never import vendor code/config. */
export async function applyTasteChartCompatibility(targetRoot) {
  const guidance = JSON.parse(await readFile(guidanceUrl, "utf8"));
  let cursor = targetRoot;
  for (const part of ["", ...guidance.relativePath.split("/")]) {
    cursor = part ? path.join(cursor, part) : cursor;
    const entry = await lstat(cursor);
    if (
      entry.isSymbolicLink() ||
      (part === path.basename(guidance.relativePath)
        ? !entry.isFile()
        : !entry.isDirectory())
    )
      throw new Error("Taste chart source must use regular files/directories");
  }
  const file = path.join(targetRoot, guidance.relativePath);
  const source = await readFile(file, "utf8");
  const prettier = await import("prettier");
  const options = {
    ...(await prettier.resolveConfig(repositoryPackage)),
    parser: "babel",
  };
  let content = await prettier.format(source.replaceAll("\r\n", "\n"), options);
  if (hash(content) === guidance.coreNormalizedHash) return;
  if (hash(content) !== guidance.upstreamNormalizedHash)
    throw new Error(
      "Reviewed Taste chart source drifted or mixes upstream/Core",
    );
  for (const rule of guidance.replacements) {
    if (content.split(rule.upstream).length - 1 !== 1)
      throw new Error("Reviewed Taste chart replacement no longer matches");
    content = content.replace(rule.upstream, rule.core);
  }
  content = await prettier.format(content, options);
  if (hash(content) !== guidance.coreNormalizedHash)
    throw new Error("Reviewed Taste chart repair produced unexpected content");
  await writeFile(file, content, "utf8");
}
