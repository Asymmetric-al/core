import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const overlayRoot = fileURLToPath(
  new URL("../refresh-overlays/", import.meta.url),
);
const repositoryPackage = fileURLToPath(
  new URL("../../package.json", import.meta.url),
);
const digest = (data) => createHash("sha256").update(data).digest("hex");
async function regular(root, relative, optional = false) {
  const parts = relative.split("/");
  if (
    parts.some(
      (part) =>
        !part ||
        part === "." ||
        part === ".." ||
        /[\\:\u0000-\u001f\u007f]/u.test(part),
    )
  )
    throw new Error("Unsafe taste preview adapter path");
  let current = root;
  const base = await lstat(current);
  if (base.isSymbolicLink() || !base.isDirectory())
    throw new Error("Unsafe taste preview root");
  for (let index = 0; index < parts.length; index++) {
    current = path.join(current, parts[index]);
    let entry;
    try {
      entry = await lstat(current);
    } catch (error) {
      if (optional && error.code === "ENOENT") return null;
      throw error;
    }
    if (
      entry.isSymbolicLink() ||
      (index === parts.length - 1 ? !entry.isFile() : !entry.isDirectory())
    )
      throw new Error("Unsafe taste preview adapter target");
  }
  return current;
}
/** Copy only hash-reviewed data; never import vendor code or launch its tools. */
export async function applyTastePreviewCompatibility(targetRoot) {
  const config = JSON.parse(
    await readFile(
      await regular(overlayRoot, "taste-preview-safety.json"),
      "utf8",
    ),
  );
  if (config.version !== 2 || config.files.length !== 2)
    throw new Error("Invalid taste preview repair configuration");
  const prettier = await import("prettier");
  const options = {
    ...(await prettier.resolveConfig(repositoryPackage, {
      editorconfig: false,
    })),
    parser: "babel",
  };
  const planned = [];
  for (const entry of config.files) {
    if (!["scripts/inspect.mjs", "scripts/scenes.mjs"].includes(entry.path))
      throw new Error("Unexpected taste preview tool");
    const file = await regular(targetRoot, entry.path);
    const original = await readFile(file, "utf8");
    const normalized = await prettier.format(
      original.replaceAll("\r\n", "\n"),
      options,
    );
    if (digest(normalized) === entry.coreHash) continue;
    if (digest(normalized) !== entry.upstreamHash)
      throw new Error("Reviewed taste preview source drifted");
    const template = await readFile(
      await regular(overlayRoot, entry.template),
      "utf8",
    );
    if (digest(template) !== entry.coreHash)
      throw new Error("Taste preview template hash mismatch");
    planned.push({ file, content: template });
  }
  const documentPlans = new Map();
  for (const entry of config.documents ?? []) {
    if (!["SKILL.md", "references/scenes.md"].includes(entry.path))
      throw new Error("Unexpected taste preview document");
    let plan = documentPlans.get(entry.path);
    if (!plan) {
      const file = await regular(targetRoot, entry.path, true);
      if (!file) continue;
      plan = { file, content: await readFile(file, "utf8") };
      documentPlans.set(entry.path, plan);
    }
    if (
      plan.content.includes(entry.core) &&
      !plan.content.includes(entry.upstream)
    )
      continue;
    if (
      plan.content.split(entry.upstream).length - 1 !== 1 ||
      plan.content.includes(entry.core)
    )
      throw new Error("Reviewed taste preview guidance drifted");
    plan.content = plan.content.replace(entry.upstream, entry.core);
  }
  planned.push(...documentPlans.values());
  const helper = config.helper;
  if (
    helper.path !== "scripts/lib/preview-boundary.mjs" ||
    helper.template !== "taste-preview-boundary.mjs"
  )
    throw new Error("Unexpected taste preview boundary");
  const content = await readFile(await regular(overlayRoot, helper.template));
  if (digest(content) !== helper.sha256)
    throw new Error("Taste preview boundary hash mismatch");
  const existing = await regular(targetRoot, helper.path, true);
  if (existing && !(await readFile(existing)).equals(content))
    throw new Error("Core taste preview boundary drifted");
  if (!existing)
    planned.push({ file: path.join(targetRoot, helper.path), content });
  for (const item of planned) {
    await mkdir(path.dirname(item.file), { recursive: true });
    await writeFile(item.file, item.content);
  }
}
