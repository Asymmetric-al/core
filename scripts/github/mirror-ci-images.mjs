import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const MIRROR_REGISTRY = "ghcr.io/asymmetric-al/";
const REGISTRY_HOST = "ghcr.io";
const DIGEST = /^sha256:[0-9a-f]{64}$/;
const TAGGED_REFERENCE =
  /^[a-z0-9][a-z0-9._-]*(?:\/[a-z0-9][a-z0-9._-]*)+:[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$/;
const KEYS = "digest,mirror,source";
const RETRIES = ["--retry-times", "3"];

export function readImageList(file) {
  const images = JSON.parse(readFileSync(file, "utf8"))?.images;
  if (!Array.isArray(images) || images.length === 0)
    throw new Error(`${file} lists no images`);
  return images.map((entry, index) => {
    const where = `${file} images[${index}]`;
    const keys = Object.keys(entry ?? {})
      .sort()
      .join(",");
    if (keys !== KEYS)
      throw new Error(`${where} has keys ${keys}; expected ${KEYS}`);
    const { source, digest, mirror } = entry;
    if (!TAGGED_REFERENCE.test(source))
      throw new Error(
        `${where}: source must be a registry/repository:tag, not ${source}`,
      );
    if (!DIGEST.test(digest))
      throw new Error(
        `${where}: digest must be sha256:<64 hex>, not ${digest}`,
      );
    if (!TAGGED_REFERENCE.test(mirror) || !mirror.startsWith(MIRROR_REGISTRY))
      throw new Error(
        `${where}: mirror must be ${MIRROR_REGISTRY}<name>:<tag>, not ${mirror}`,
      );
    return { source, digest, mirror };
  });
}

export const repositoryOf = (reference) =>
  reference.slice(0, reference.lastIndexOf(":"));

export const pullReference = (image) => `${image.mirror}@${image.digest}`;

function skopeo(args, input) {
  const result = spawnSync("skopeo", args, {
    input,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error)
    throw new Error(`skopeo could not start: ${result.error.message}`);
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: String(result.stderr ?? "").trim(),
  };
}

function readDigest(reference) {
  const result = skopeo(["inspect", "--raw", `docker://${reference}`]);
  if (result.status !== 0) return { found: false, detail: result.stderr };
  const hex = createHash("sha256").update(result.stdout).digest("hex");
  return { found: true, digest: `sha256:${hex}` };
}

export function mirrorImage(image) {
  const target = `${repositoryOf(image.mirror)}@${image.digest}`;
  const present = readDigest(target);
  if (present.found && present.digest === image.digest)
    return `${target} is already in the organization's registry`;

  const from = `${repositoryOf(image.source)}@${image.digest}`;
  const copy = skopeo([
    "copy",
    "--all",
    "--preserve-digests",
    ...RETRIES,
    `docker://${from}`,
    `docker://${image.mirror}`,
  ]);
  if (copy.status !== 0)
    throw new Error(
      `copying ${from} to ${image.mirror} failed: ${copy.stderr}`,
    );

  const copied = readDigest(target);
  if (!copied.found)
    throw new Error(
      `${target} cannot be read after the copy: ${copied.detail}`,
    );
  if (copied.digest !== image.digest)
    throw new Error(
      `${target} reads back as ${copied.digest}, not ${image.digest}`,
    );
  return `${target} copied from ${from} and read back with the same digest`;
}

export function mirrorImages(file, env) {
  const images = readImageList(file);
  if (!env.REGISTRY_USER || !env.REGISTRY_TOKEN)
    throw new Error("REGISTRY_USER and REGISTRY_TOKEN are required");
  const login = skopeo(
    [
      "login",
      REGISTRY_HOST,
      "--username",
      env.REGISTRY_USER,
      "--password-stdin",
    ],
    env.REGISTRY_TOKEN,
  );
  if (login.status !== 0)
    throw new Error(`skopeo login ${REGISTRY_HOST} failed: ${login.stderr}`);
  try {
    return images.map((image) => {
      const line = mirrorImage(image);
      console.log(line);
      return line;
    });
  } finally {
    skopeo(["logout", REGISTRY_HOST]);
  }
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const [file] = process.argv.slice(2);
  try {
    if (!file)
      throw new Error(
        "Usage: node scripts/github/mirror-ci-images.mjs <image list>",
      );
    mirrorImages(file, process.env);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
