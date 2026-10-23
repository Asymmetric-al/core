import { lstat, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/** Restore the reviewed launcher bytes before canonical mirror publication. */
export async function normalizeImpeccableLauncher(skillRoot) {
  let file = skillRoot;
  const parts = ["scripts", "impeccable.cmd"];
  for (let index = -1; index < parts.length; index++) {
    if (index >= 0) file = path.join(file, parts[index]);
    let entry;
    try {
      entry = await lstat(file);
    } catch (error) {
      // Minimal skill fixtures may omit this optional Windows support file.
      if (error?.code === "ENOENT" && index === parts.length - 1) return;
      throw error;
    }
    if (
      entry.isSymbolicLink() ||
      (index === parts.length - 1 ? !entry.isFile() : !entry.isDirectory())
    )
      throw new Error("Impeccable launcher must be a regular file: " + file);
  }
  const before = new TextDecoder("utf-8", {
    fatal: true,
    ignoreBOM: true,
  }).decode(await readFile(file));
  if (before.includes("\u0000"))
    throw new Error("Impeccable launcher must contain UTF-8 text: " + file);
  const after = before.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
  if (after !== before) await writeFile(file, after, "utf8");
}
