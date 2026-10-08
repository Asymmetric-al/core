import { spawn } from "node:child_process";
import { createHash, X509Certificate } from "node:crypto";
import {
  closeSync,
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  constants,
  fstatSync,
  openSync,
  readFileSync,
  readSync,
  readdirSync,
  realpathSync,
  statSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { stripVTControlCharacters } from "node:util";

// The deprecated `shadcn diff` can skip Base UI files and report no updates.
// A complete reviewed preview preserves Core customizations, not byte parity.
export const SHADCN_CLI_VERSION = "4.21.4";
export const SHADCN_REVIEW_BASELINE =
  "tooling/shadcn/upstream-review-baseline.json";
// Supporting implementations are required independently of the editable review
// baseline. Removing a hash entry must not silently stop guarding its contract.
export const SHADCN_REQUIRED_SUPPORTING_SOURCES = Object.freeze([
  "packages/lib/hooks/use-mobile.ts",
  "packages/ui/components/primitives/RichTextEditor.tsx",
  "packages/ui/components/primitives/chart-wrappers.tsx",
  "packages/ui/components/primitives/filter-bar.tsx",
  "packages/ui/components/primitives/image-cropper-helpers.ts",
  "packages/ui/components/primitives/image-cropper.tsx",
  "packages/ui/components/primitives/image-upload-helpers.ts",
  "packages/ui/components/primitives/image-upload.tsx",
  "packages/ui/components/primitives/map.tsx",
  "packages/ui/components/primitives/motion-preset.tsx",
  "packages/ui/components/primitives/page-shell.tsx",
  "packages/ui/components/primitives/responsive-container.tsx",
  "packages/ui/components/primitives/ripple-button.tsx",
  "packages/ui/components/primitives/tanstack-form.tsx",
  "packages/ui/components/primitives/theme-toggle.tsx",
  "packages/ui/lib/base-ui.ts",
  "packages/ui/lib/drawer-swipe-direction.ts",
  "packages/ui/lib/input-styles.ts",
  "packages/ui/lib/utils.ts",
  "packages/ui/styles/globals.css",
]);
// These seven public seams intentionally separate React implementations from
// CVA utilities. The editable baseline cannot omit or redirect their modules.
export const SHADCN_SOURCE_MAPPINGS = Object.freeze(
  [
    "badge",
    "button",
    "button-group",
    "combobox",
    "navigation-menu",
    "tabs",
    "toggle",
  ].map((name) =>
    Object.freeze({
      name,
      registryPath: `components/shadcn/${name}.tsx`,
      entrypoint: `components/shadcn/${name}.ts`,
      implementation: `components/shadcn/${name}-component.tsx`,
      support: `components/shadcn/${name}-variants.ts`,
    }),
  ),
);
export const SHADCN_MAPPED_SUPPORTING_SOURCES = Object.freeze(
  SHADCN_SOURCE_MAPPINGS.flatMap(({ entrypoint, support }) =>
    [entrypoint, support].map((file) => `packages/ui/${file}`),
  ).sort(),
);

const UI_DIRECTORY = "packages/ui";
const COMPONENT_DIRECTORY = "components/shadcn";
const PREVIEW_END = "└ Run without --dry-run to apply.";

function requireCondition(condition, message) {
  if (!condition) throw new Error(message);
}

function parseJson(output, label) {
  try {
    return JSON.parse(output);
  } catch {
    // JSON.parse errors can echo document contents, including registry headers.
    throw new Error(`Invalid ${label} JSON coverage`);
  }
}

export function sourceHash(source) {
  return createHash("sha256")
    .update(source.replace(/\r\n/g, "\n"))
    .digest("hex");
}

export function normalizePreview(output, root = "") {
  let text = stripVTControlCharacters(output).replace(/\r\n/g, "\n");
  // Normalize presentation details only. Preserve source and trailing spaces.
  if (root) {
    for (const variant of new Set([root, root.replaceAll("\\", "/")])) {
      text = text.replaceAll(variant, "<repo-root>");
    }
  }
  return text;
}

function safeRelativePath(value) {
  requireCondition(
    typeof value === "string" &&
      /^[A-Za-z0-9_./-]+$/.test(value) &&
      !value.startsWith("/") &&
      !value.split("/").includes(".."),
    "Invalid relative path in shadcn coverage",
  );
  return value;
}

function uniqueSorted(values, label) {
  requireCondition(
    Array.isArray(values) && values.length > 0,
    `Empty ${label} coverage`,
  );
  requireCondition(
    values.every((value) => typeof value === "string"),
    `Invalid ${label}`,
  );
  requireCondition(
    new Set(values).size === values.length,
    `Duplicate ${label} coverage`,
  );
  return [...values].sort();
}

function previewBody(output, component, root) {
  const text = normalizePreview(output, root);
  const start = `┌ shadcn add ${component} (dry run)`;
  const startOffset = text.indexOf(start);
  const endOffset = text.indexOf(PREVIEW_END, startOffset);
  requireCondition(
    startOffset >= 0 && endOffset >= 0,
    `Incomplete ${component} preview coverage`,
  );
  const outsidePreview =
    text.slice(0, startOffset) + text.slice(endOffset + PREVIEW_END.length);
  requireCondition(
    !/No updates found|DEPRECATED|files? not shown|showing first|truncated/i.test(
      outsidePreview,
    ),
    `Deprecated or truncated ${component} coverage`,
  );
  requireCondition(
    text.indexOf(start, startOffset + start.length) < 0,
    `Duplicate ${component} preview`,
  );
  return text.slice(startOffset, endOffset + PREVIEW_END.length);
}

export function parseDryRun(output, component, root) {
  const body = previewBody(output, component, root);
  const headers = [...body.matchAll(/^├ Files \((\d+)\).*$/gm)];
  const files = [
    ...body.matchAll(/^│\s+[~+=]\s+(.+?)\s+(overwrite|create|unchanged)\s*$/gm),
  ].map((match) => ({ path: safeRelativePath(match[1]), status: match[2] }));
  requireCondition(
    headers.length === 1 &&
      Number(headers[0][1]) === files.length &&
      files.length > 0,
    `Missing or truncated ${component} file coverage`,
  );
  uniqueSorted(
    files.map((file) => file.path),
    `${component} files`,
  );
  return { name: component, previewSha256: sourceHash(body), files };
}

export function parseFileDiff(output, component, requestedPath, root) {
  const body = previewBody(output, component, root);
  const headers = [
    ...body.matchAll(/^├ (.+?) \((overwrite|create|unchanged)\)$/gm),
  ];
  requireCondition(
    headers.length === 1 && headers[0][1] === requestedPath,
    `Missing or mismatched ${requestedPath} diff coverage`,
  );
  requireCondition(
    body.includes("│ └"),
    `Incomplete ${requestedPath} diff box`,
  );
  const lines = body
    .split("\n")
    .filter((line) => line.startsWith("│ │ "))
    .map((line) => line.slice(4));
  let hunks = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const hunk = /^@@ -\d+(?:,(\d+))? \+\d+(?:,(\d+))? @@/.exec(lines[index]);
    if (!hunk) continue;
    hunks += 1;
    let removed = 0;
    let added = 0;
    for (
      index += 1;
      index < lines.length && !lines[index].startsWith("@@");
      index += 1
    ) {
      const prefix = lines[index][0];
      requireCondition(
        [" ", "+", "-", "\\"].includes(prefix),
        `Invalid ${requestedPath} hunk coverage`,
      );
      if (prefix === " " || prefix === "-") removed += 1;
      if (prefix === " " || prefix === "+") added += 1;
    }
    index -= 1;
    requireCondition(
      removed === Number(hunk[1] ?? 1) && added === Number(hunk[2] ?? 1),
      `Truncated ${requestedPath} diff hunk`,
    );
  }
  requireCondition(
    hunks > 0 || headers[0][2] === "unchanged",
    `Empty ${requestedPath} diff coverage`,
  );
  return sourceHash(body);
}

function installedCliEntry(root) {
  let manifest;
  let packageDirectory;
  let installed;
  try {
    manifest = JSON.parse(
      readFileSync(path.join(root, "package.json"), "utf8"),
    );
    packageDirectory = realpathSync(path.join(root, "node_modules/shadcn"));
    installed = JSON.parse(
      readFileSync(path.join(packageDirectory, "package.json"), "utf8"),
    );
  } catch {
    throw new Error("Missing declared project-installed shadcn CLI");
  }
  requireCondition(
    manifest.devDependencies?.shadcn === SHADCN_CLI_VERSION,
    "Project must declare the exact pinned shadcn CLI version",
  );
  requireCondition(
    installed.name === "shadcn" && installed.version === SHADCN_CLI_VERSION,
    "Project-installed shadcn CLI version mismatch",
  );
  const bin =
    typeof installed.bin === "string" ? installed.bin : installed.bin?.shadcn;
  requireCondition(
    typeof bin === "string" && bin.length > 0 && !path.isAbsolute(bin),
    "Invalid project-installed shadcn CLI entry",
  );
  let entry;
  try {
    entry = realpathSync(path.join(packageDirectory, bin));
    const relative = path.relative(packageDirectory, entry);
    requireCondition(
      relative !== ".." &&
        !relative.startsWith(`..${path.sep}`) &&
        !path.isAbsolute(relative) &&
        statSync(entry).isFile(),
      "Invalid project-installed shadcn CLI entry",
    );
  } catch {
    throw new Error("Invalid project-installed shadcn CLI entry");
  }
  return entry;
}

function validatePublicCa(file) {
  let descriptor;
  try {
    const absoluteFile = realpathSync(path.resolve(file));
    descriptor = openSync(
      absoluteFile,
      constants.O_RDONLY | constants.O_NONBLOCK,
    );
    const limit = 1024 * 1024;
    const metadata = fstatSync(descriptor);
    if (!metadata.isFile() || metadata.size > limit) throw new Error();
    // Limit the read even if the public trust file grows after fstat.
    const bytes = Buffer.alloc(limit + 1);
    let length = 0;
    for (;;) {
      const count = readSync(descriptor, bytes, length, bytes.length - length);
      length += count;
      if (length > limit) throw new Error();
      if (count === 0) break;
    }
    const pem = new TextDecoder("utf-8", { fatal: true }).decode(
      bytes.subarray(0, length),
    );
    const certificates = [
      ...pem.matchAll(
        /-----BEGIN CERTIFICATE-----([\s\S]*?)-----END CERTIFICATE-----/g,
      ),
    ];
    if (
      certificates.length === 0 ||
      pem
        .replace(
          /-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g,
          "",
        )
        .trim()
    )
      throw new Error();
    for (const certificate of certificates) {
      const payload = certificate[1].replace(/\s/g, "");
      if (!/^[A-Za-z0-9+/]+={0,2}$/.test(payload)) throw new Error();
      const der = Buffer.from(payload, "base64");
      const x509 = new X509Certificate(der);
      if (
        der.toString("base64") !== payload ||
        !x509.raw.equals(der) ||
        !x509.ca
      )
        throw new Error();
    }
    return absoluteFile;
  } catch {
    throw new Error("Invalid public CA certificate transport");
  } finally {
    if (descriptor !== undefined) {
      try {
        closeSync(descriptor);
      } catch {
        throw new Error("Invalid public CA certificate transport");
      }
    }
  }
}

function approvedProxyEnvironment() {
  const proxies = {};
  for (const key of [
    "HTTP_PROXY",
    "HTTPS_PROXY",
    "http_proxy",
    "https_proxy",
  ]) {
    const value = process.env[key];
    // An empty lowercase setting disables its uppercase counterpart in undici.
    if (value === undefined || value === "") continue;
    let url;
    try {
      url = new URL(value);
    } catch {
      throw new Error("Invalid approved HTTP(S) proxy transport");
    }
    requireCondition(
      /^https?:\/\/[^/?#@\\\s]+\/?$/i.test(value) &&
        ["http:", "https:"].includes(url.protocol) &&
        Boolean(url.hostname) &&
        !url.username &&
        !url.password &&
        !url.search &&
        !url.hash &&
        url.pathname === "/",
      "Invalid approved HTTP(S) proxy transport",
    );
  }
  // Resolve precedence rather than forwarding ignored or unsupported variables.
  // The pinned registry client already uses EnvHttpProxyAgent. Forward only
  // approved routes and an optional validated existing public CA bundle;
  // TLS overrides, NODE_OPTIONS, ALL_PROXY and NO_PROXY remain excluded.
  for (const key of ["HTTP_PROXY", "HTTPS_PROXY"]) {
    const value = process.env[key.toLowerCase()] ?? process.env[key];
    if (value) proxies[key] = value;
  }
  if (
    Object.keys(proxies).length > 0 &&
    process.env.NODE_EXTRA_CA_CERTS !== undefined &&
    process.env.NODE_EXTRA_CA_CERTS !== ""
  ) {
    proxies.NODE_EXTRA_CA_CERTS = validatePublicCa(
      process.env.NODE_EXTRA_CA_CERTS,
    );
  }
  return proxies;
}

export function createCliRunner({
  cwd,
  root = fileURLToPath(new URL("../..", import.meta.url)),
  command = process.execPath,
  prefix,
  timeoutMs = 120_000,
}) {
  requireCondition(
    Number.isSafeInteger(timeoutMs) && timeoutMs > 0 && timeoutMs <= 120_000,
    "Invalid shadcn CLI coverage timeout",
  );
  // Execute the frozen project dependency; parallel registry reads must not
  // race a package installer or depend on an undeclared global/cache CLI.
  const cliPrefix = prefix ?? [installedCliEntry(root)];
  const environment = Object.fromEntries(
    [
      "PATH",
      "HOME",
      "USER",
      "LOGNAME",
      "TMPDIR",
      "TEMP",
      "TMP",
      "XDG_CACHE_HOME",
      "LANG",
      "LC_ALL",
      "CI",
      "SystemRoot",
      "SYSTEMROOT",
      "PATHEXT",
    ]
      .filter((key) => process.env[key] !== undefined)
      .map((key) => [key, process.env[key]]),
  );
  Object.assign(environment, approvedProxyEnvironment());
  environment.NO_COLOR = "1";
  environment.COLUMNS = "80";
  return (args) =>
    new Promise((resolve, reject) => {
      // A retry repeats only known read-only registry requests. The same
      // installed entry, arguments, total deadline and cumulative output cap
      // apply to every attempt; failed output is never accepted as coverage.
      const cliArgs = [...args];
      const argv = [...cliPrefix, ...cliArgs];
      const readOnly =
        (cliArgs.length === 2 &&
          cliArgs[0] === "info" &&
          cliArgs[1] === "--json") ||
        (cliArgs[0] === "add" &&
          /^[a-z][a-z0-9-]*$/.test(cliArgs[1] ?? "") &&
          ((cliArgs.length === 3 && cliArgs[2] === "--dry-run") ||
            (cliArgs.length === 4 && cliArgs[2] === "--diff")));
      let child;
      let bytes = 0;
      let attempts = 0;
      let terminationError;
      let forceKill;
      let backoff;
      let settled = false;
      const settle = (error, output) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        clearTimeout(forceKill);
        clearTimeout(backoff);
        if (error) reject(error);
        else resolve(output);
      };
      const terminate = (error) => {
        if (terminationError || settled) return;
        terminationError = error;
        clearTimeout(timeout);
        clearTimeout(backoff);
        if (child) {
          child.kill();
          forceKill = setTimeout(() => child?.kill("SIGKILL"), 1000);
        } else settle(error);
      };
      const timeout = setTimeout(() => {
        terminate(new Error("shadcn CLI coverage timed out"));
      }, timeoutMs);
      const launch = () => {
        if (settled) return;
        attempts += 1;
        let stdout = "";
        child = spawn(command, argv, {
          cwd,
          env: environment,
          shell: false,
          stdio: ["ignore", "pipe", "pipe"],
        });
        // Settle after close so source views outlive every CLI reader,
        // including delayed termination. Drain stderr without disclosing it.
        child.stderr.resume();
        child.stdout.on("data", (chunk) => {
          bytes += chunk.length;
          if (bytes > 4_000_000) {
            terminate(
              new Error("shadcn CLI coverage exceeded the output limit"),
            );
          } else if (!terminationError) stdout += chunk;
        });
        child.on("error", () => {
          const error = new Error("Unable to start the pinned shadcn CLI");
          if (child.pid === undefined) settle(error);
          else terminate(error);
        });
        child.on("close", (code) => {
          clearTimeout(forceKill);
          child = undefined;
          if (terminationError) settle(terminationError);
          else if (code === 0) settle(undefined, stdout);
          else {
            const output = stripVTControlCharacters(stdout).replace(
              /\r\n/g,
              "\n",
            );
            const registryErrors =
              output.match(/^Failed to fetch from registry.*$/gm) ?? [];
            // Contradictory registry or TLS diagnostics fail closed. Only one
            // unambiguous anonymous public transient error may be retried.
            const transient =
              code === 1 &&
              readOnly &&
              registryErrors.length === 1 &&
              !/\b(?:TLS|SSL|certificates?|self[- ]signed|unable to verify|ERR_TLS_[A-Z_]+|CERT_[A-Z_]+|UNABLE_TO_VERIFY_[A-Z_]+)\b/i.test(
                output,
              )
                ? registryErrors[0].match(
                    /^Failed to fetch from registry \((502|503|504)\): https:\/\/ui\.shadcn\.com\/r\/[A-Za-z0-9._/-]+$/,
                  )
                : undefined;
            if (transient && attempts < 3) {
              console.warn(
                `[shadcn-diff] public registry HTTP ${transient[1]}; retry ${attempts + 1}/3 within the existing CLI coverage deadline.`,
              );
              backoff = setTimeout(launch, 100 * attempts);
            } else {
              const cause = transient
                ? `; public registry HTTP ${transient[1]} after ${attempts} attempts`
                : "";
              settle(
                new Error(
                  `shadcn CLI coverage failed (exit ${code ?? "unknown"}${cause})`,
                ),
              );
            }
          }
        });
      };
      launch();
    });
}

async function mapTwo(values, operation) {
  const results = new Array(values.length);
  let index = 0;
  let failure;
  await Promise.all(
    [0, 1].map(async () => {
      while (!failure && index < values.length) {
        const current = index++;
        try {
          results[current] = await operation(values[current]);
        } catch (error) {
          failure ??= error;
        }
      }
    }),
  );
  if (failure) throw failure;
  return results;
}

function configIdentity(config) {
  return {
    style: config.style,
    rsc: config.rsc,
    tsx: config.tsx,
    iconLibrary: config.iconLibrary,
    tailwind: config.tailwind,
    aliases: config.aliases,
  };
}

function readSource(root, relativePath) {
  return readFileSync(path.join(root, safeRelativePath(relativePath)), "utf8");
}

function compare(actual, expected, label) {
  requireCondition(
    JSON.stringify(actual) === JSON.stringify(expected),
    `${label} changed; review and refresh the explicit upstream baseline`,
  );
}

function reviewedEntry(entry) {
  requireCondition(
    typeof entry.reason === "string" && entry.reason.trim().length > 20,
    `Missing customization review for ${entry.path}`,
  );
  uniqueSorted(entry.proofs, `${entry.path} review proofs`);
}

function verifyReviewProofs(root, baseline) {
  const entries = [
    ...baseline.files,
    ...baseline.localOnly,
    ...baseline.protectedSources,
    ...baseline.excludedDirectories,
  ];
  const requiredPaths = [
    ...new Set(
      entries.flatMap((entry) =>
        uniqueSorted(entry.proofs, `${entry.path} review proofs`),
      ),
    ),
  ].sort();
  for (const proof of requiredPaths) {
    safeRelativePath(proof);
    requireCondition(
      path.posix.normalize(proof) !== SHADCN_REVIEW_BASELINE,
      "Review baseline cannot hash itself",
    );
    requireCondition(
      path.posix.normalize(proof) === proof,
      "Noncanonical review proof coverage",
    );
  }
  const paths = uniqueSorted(
    baseline.proofSources?.map((entry) => entry.path),
    "review proof",
  );
  compare(paths, requiredPaths, "Review proof coverage");
  // Require the recorded inventory to have one stable ordering as well as the
  // complete referenced path set. An unrelated hashed file cannot replace proof.
  compare(
    baseline.proofSources.map((entry) => entry.path),
    paths,
    "Review proof order",
  );
  for (const entry of baseline.proofSources) {
    requireCondition(
      /^[a-f0-9]{64}$/.test(entry.sha256 ?? ""),
      `Invalid review proof hash for ${entry.path}`,
    );
    let source;
    try {
      source = readSource(root, entry.path);
    } catch {
      throw new Error(`Missing review proof ${entry.path}`);
    }
    compare(sourceHash(source), entry.sha256, `Review proof ${entry.path}`);
  }
}

async function runUpstreamReviewInView({
  root,
  baseline,
  runCli,
  previewRoot = root,
  mappings = [],
}) {
  requireCondition(
    [2, 3].includes(baseline?.schemaVersion) &&
      baseline.cliVersion === SHADCN_CLI_VERSION,
    "Unsupported shadcn version or baseline coverage",
  );
  const version = normalizePreview(await runCli(["--version"])).trim();
  requireCondition(
    version === SHADCN_CLI_VERSION,
    "Pinned shadcn CLI version mismatch (deprecated output is not coverage)",
  );
  const config = parseJson(
    readSource(root, `${UI_DIRECTORY}/components.json`),
    "shared config",
  );
  compare(
    configIdentity(config),
    baseline.config,
    "Shared shadcn configuration",
  );
  const info = parseJson(await runCli(["info", "--json"]), "CLI info");
  requireCondition(
    info?.config?.base === "base" && info.config.style === config.style,
    "CLI did not resolve the configured Base UI style",
  );
  const components = uniqueSorted(info.components, "installed components");
  requireCondition(
    components.every((component) => /^[a-z0-9-]+$/.test(component)),
    "Invalid component coverage",
  );
  compare(
    components,
    uniqueSorted(
      baseline.components.map((component) => component.name),
      "baseline components",
    ),
    "Installed component coverage",
  );
  const directory = path.join(root, UI_DIRECTORY, COMPONENT_DIRECTORY);
  const entries = readdirSync(directory, { withFileTypes: true });
  const direct = entries
    .filter((entry) => entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name))
    .map((entry) => `${COMPONENT_DIRECTORY}/${entry.name}`)
    .sort();
  const sourceByRegistry = new Map(
    mappings.map((mapping) => [mapping.registryPath, mapping.implementation]),
  );
  const stock = components.map(
    (component) =>
      sourceByRegistry.get(`${COMPONENT_DIRECTORY}/${component}.tsx`) ??
      `${COMPONENT_DIRECTORY}/${component}.tsx`,
  );
  requireCondition(
    stock.every((file) => direct.includes(file)),
    "CLI component inventory is missing its local source",
  );
  const localOnly = direct.filter((file) => !stock.includes(file));
  compare(
    localOnly,
    uniqueSorted(
      baseline.localOnly.map((entry) => entry.path),
      "local adapters",
    ),
    "Local adapter coverage",
  );
  compare(
    entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort(),
    uniqueSorted(
      baseline.excludedDirectories.map((entry) => entry.path),
      "owned toolkit directories",
    ),
    "Owned toolkit directory coverage",
  );
  for (const entry of [...baseline.files, ...baseline.localOnly])
    reviewedEntry(entry);
  for (const entry of baseline.excludedDirectories) {
    requireCondition(
      entry.reason?.length > 20 && entry.proofs?.length > 0,
      `Missing scope review for ${entry.path}`,
    );
  }
  compare(
    uniqueSorted(
      baseline.protectedSources?.map((entry) => entry.path),
      "supporting source",
    ),
    [
      ...SHADCN_REQUIRED_SUPPORTING_SOURCES,
      ...(baseline.schemaVersion === 3 ? SHADCN_MAPPED_SUPPORTING_SOURCES : []),
    ].sort(),
    "Supporting source coverage",
  );
  verifyReviewProofs(root, baseline);
  for (const entry of baseline.protectedSources) {
    reviewedEntry(entry);
    compare(
      sourceHash(readSource(root, entry.path)),
      entry.localSha256,
      `Protected source ${entry.path}`,
    );
  }
  for (const entry of baseline.localOnly)
    compare(
      sourceHash(readSource(root, `${UI_DIRECTORY}/${entry.path}`)),
      entry.localSha256,
      `Local adapter ${entry.path}`,
    );
  const previews = await mapTwo(components, async (component) =>
    parseDryRun(
      await runCli(["add", component, "--dry-run"]),
      component,
      previewRoot,
    ),
  );
  compare(
    previews,
    baseline.components.map(({ name, previewSha256, files }) => ({
      name,
      previewSha256,
      files,
    })),
    "Upstream file/dependency preview coverage",
  );
  const owners = new Map();
  for (const component of previews) {
    for (const file of component.files) {
      const names = owners.get(file.path) ?? [];
      names.push(component.name);
      owners.set(file.path, names);
    }
  }
  const coveredFiles = [...owners.keys()].sort();
  compare(
    coveredFiles,
    uniqueSorted(
      baseline.files.map((file) => file.path),
      "baseline files",
    ),
    "Per-file diff coverage",
  );
  await mapTwo(baseline.files, async (entry) => {
    requireCondition(
      owners.get(entry.path).includes(entry.diffComponent),
      `Invalid diff owner for ${entry.path}`,
    );
    compare(
      owners.get(entry.path),
      entry.owners,
      `Diff owners for ${entry.path}`,
    );
    compare(
      sourceHash(
        readSource(root, `${UI_DIRECTORY}/${entry.localPath ?? entry.path}`),
      ),
      entry.localSha256,
      `Local source ${entry.path}`,
    );
    const diff = await runCli([
      "add",
      entry.diffComponent,
      "--diff",
      entry.path,
    ]);
    compare(
      parseFileDiff(diff, entry.diffComponent, entry.path, previewRoot),
      entry.diffSha256,
      `Upstream diff ${entry.path}`,
    );
  });
  return {
    components: components.length,
    files: coveredFiles.length,
    localAdapters: localOnly.length,
    toolkitDirectories: baseline.excludedDirectories.length,
  };
}

export function validateSourceMappings(root, baseline) {
  requireCondition(
    [2, 3].includes(baseline?.schemaVersion) &&
      baseline.cliVersion === SHADCN_CLI_VERSION,
    "Unsupported shadcn version or baseline coverage",
  );
  if (baseline.schemaVersion === 2) {
    requireCondition(
      !SHADCN_SOURCE_MAPPINGS.some((mapping) =>
        [mapping.entrypoint, mapping.implementation, mapping.support].some(
          (file) => existsSync(path.join(root, UI_DIRECTORY, file)),
        ),
      ),
      "Legacy baseline cannot omit split component upstream coverage",
    );
    requireCondition(
      !baseline.sourceMappings?.length,
      "Legacy baseline cannot declare split component mappings",
    );
    requireCondition(
      baseline.files.every((entry) => entry.localPath === undefined),
      "Legacy baseline cannot redirect canonical component sources",
    );
    return [];
  }
  compare(
    baseline.sourceMappings,
    SHADCN_SOURCE_MAPPINGS,
    "Split component mapping coverage",
  );
  const exports = parseJson(
    readSource(root, `${UI_DIRECTORY}/package.json`),
    "UI package",
  ).exports;
  for (const mapping of SHADCN_SOURCE_MAPPINGS) {
    requireCondition(
      baseline.components.some((entry) => entry.name === mapping.name),
      `Mapped component omitted: ${mapping.name}`,
    );
    requireCondition(
      !existsSync(path.join(root, UI_DIRECTORY, mapping.registryPath)),
      `Ambiguous canonical component source: ${mapping.registryPath}`,
    );
    compare(
      exports?.[`./components/shadcn/${mapping.name}`],
      `./${mapping.entrypoint}`,
      `Public component export ${mapping.name}`,
    );
    for (const file of [
      mapping.entrypoint,
      mapping.implementation,
      mapping.support,
    ]) {
      try {
        readSource(root, `${UI_DIRECTORY}/${file}`);
      } catch {
        throw new Error(`Missing split component source: ${file}`);
      }
    }
  }
  for (const file of baseline.files) {
    const mapping = SHADCN_SOURCE_MAPPINGS.find(
      (entry) => entry.registryPath === file.path,
    );
    compare(
      file.localPath,
      mapping?.implementation ?? file.path,
      `Canonical source mapping ${file.path}`,
    );
  }
  return SHADCN_SOURCE_MAPPINGS;
}

export function createUpstreamSourceView(root, mappings) {
  const view = mkdtempSync(path.join(os.tmpdir(), "core-shadcn-source-"));
  const dispose = () => rmSync(view, { recursive: true, force: true });
  try {
    const copy = (source, target) => {
      const metadata = lstatSync(source);
      requireCondition(
        !metadata.isSymbolicLink(),
        "UI source view cannot copy source symlinks",
      );
      if (metadata.isDirectory()) {
        mkdirSync(target, { recursive: true });
        for (const entry of readdirSync(source)) {
          if (
            entry.startsWith(".env") ||
            [
              "node_modules",
              ".next",
              "dist",
              "coverage",
              "private",
              "secrets",
              "credentials",
            ].includes(entry)
          )
            continue;
          copy(path.join(source, entry), path.join(target, entry));
        }
      } else if (metadata.isFile()) {
        mkdirSync(path.dirname(target), { recursive: true });
        copyFileSync(source, target);
      }
    };
    for (const file of [
      "package.json",
      "bun.lock",
      "tsconfig.json",
      "tsconfig.base.json",
    ])
      if (existsSync(path.join(root, file)))
        copy(path.join(root, file), path.join(view, file));
    const ui = path.join(root, UI_DIRECTORY),
      copiedUi = path.join(view, UI_DIRECTORY);
    for (const file of [
      "package.json",
      "components.json",
      "tsconfig.json",
      "components",
      "lib",
      "hooks",
      "styles",
    ])
      if (existsSync(path.join(ui, file)))
        copy(path.join(ui, file), path.join(copiedUi, file));
    for (const directory of ["", UI_DIRECTORY]) {
      const modules = path.join(root, directory, "node_modules");
      if (existsSync(modules)) {
        const target = path.join(view, directory, "node_modules");
        mkdirSync(path.dirname(target), { recursive: true });
        symlinkSync(
          modules,
          target,
          process.platform === "win32" ? "junction" : "dir",
        );
      }
    }
    for (const mapping of mappings) {
      const canonical = path.join(copiedUi, mapping.registryPath);
      requireCondition(
        !existsSync(canonical),
        `Ambiguous projected source: ${mapping.registryPath}`,
      );
      copy(path.join(ui, mapping.implementation), canonical);
    }
    return { root: view, cwd: copiedUi, dispose };
  } catch (error) {
    dispose();
    throw error;
  }
}

export async function runUpstreamReview({ root, baseline, runCli }) {
  const mappings = validateSourceMappings(root, baseline);
  let view;
  try {
    if (mappings.length) view = createUpstreamSourceView(root, mappings);
    const runner =
      runCli ??
      createCliRunner({
        root,
        cwd: view?.cwd ?? path.join(root, UI_DIRECTORY),
      });
    return await runUpstreamReviewInView({
      root,
      baseline,
      runCli: runner,
      previewRoot: view?.root ?? root,
      mappings,
    });
  } finally {
    view?.dispose();
  }
}

async function main() {
  const root = fileURLToPath(new URL("../..", import.meta.url));
  try {
    const baseline = parseJson(
      readSource(root, SHADCN_REVIEW_BASELINE),
      "review baseline",
    );
    const result = await runUpstreamReview({ root, baseline });
    console.log(
      `[shadcn-diff] OK: ${result.components} installed components, ${result.files} explicit file diffs, ${result.localAdapters} local adapters reviewed; ${result.toolkitDirectories} owned toolkit directories outside the stock registry. Reviewed customizations unchanged; stock byte parity is not asserted.`,
    );
  } catch (error) {
    console.error(`[shadcn-diff] ${error.message}`);
    process.exitCode = 1;
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
)
  await main();
