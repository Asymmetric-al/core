#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(scriptPath), "../..");
const require = createRequire(path.join(root, "package.json"));
const fontRoot = path.join(root, "packages/ui/fonts");
const manifest = JSON.parse(
  readFileSync(path.join(fontRoot, "manifest.json"), "utf8"),
);

if (!process.argv.includes("--network-isolated")) {
  assert.equal(
    process.platform,
    "linux",
    "Run this offline check in Linux/WSL.",
  );
  const result = spawnSync(
    "unshare",
    [
      "--user",
      "--map-root-user",
      "--net",
      process.execPath,
      scriptPath,
      "--network-isolated",
    ],
    { stdio: "inherit" },
  );
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}

const loopback = spawnSync("ip", ["link", "set", "lo", "up"], {
  encoding: "utf8",
});
assert.equal(loopback.status, 0, loopback.stderr);
assert.equal(
  readFileSync("/proc/net/route", "utf8").trim().split("\n").length,
  1,
);
const namespaceInterfaces = readFileSync("/proc/net/dev", "utf8")
  .split("\n")
  .filter((line) => line.includes(":"))
  .map((line) => line.split(":")[0].trim());
assert.deepEqual(
  namespaceInterfaces,
  ["lo"],
  "Only isolated loopback is permitted.",
);

const cacheRoot = path.join(root, ".tmp");
mkdirSync(cacheRoot, { recursive: true });
const temporary = mkdtempSync(path.join(cacheRoot, "core-local-fonts-"));
const nextCli = require.resolve("next/dist/bin/next");
const nextVersion = require("next/package.json").version;
const environment = { ...process.env, NEXT_TELEMETRY_DISABLED: "1" };
delete environment.NEXT_FONT_GOOGLE_MOCKED_RESPONSES;
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");

function fixture(name, fontImport) {
  const directory = path.join(temporary, name);
  const relativeImport = path.isAbsolute(fontImport)
    ? path
        .relative(path.join(directory, "app"), fontImport)
        .split(path.sep)
        .join("/")
    : fontImport;
  mkdirSync(path.join(directory, "app"), { recursive: true });
  writeFileSync(
    path.join(directory, "package.json"),
    JSON.stringify({
      name: `font-check-${name}`,
      private: true,
      type: "module",
    }),
  );
  writeFileSync(
    path.join(directory, "next.config.mjs"),
    `export default {turbopack:{root:${JSON.stringify(root)}}};\n`,
  );
  writeFileSync(
    path.join(directory, "app/layout.jsx"),
    `import {fontVariables} from ${JSON.stringify(relativeImport)};\nexport default function Layout({children}) {return <html lang="en"><head><link rel="icon" href="data:," /></head><body className={fontVariables}>{children}</body></html>;}\n`,
  );
  writeFileSync(
    path.join(directory, "app/page.jsx"),
    'export default function Page(){return <main><h1 style={{fontFamily:"var(--font-syne)"}}>Core font check</h1><p style={{fontFamily:"var(--font-inter)"}}>Partners and giving 0123456789</p><pre style={{fontFamily:"var(--font-geist-mono)"}}>const total = 12500;</pre></main>;}\n',
  );
  return directory;
}

function build(directory) {
  const result = spawnSync(process.execPath, [nextCli, "build"], {
    cwd: directory,
    env: environment,
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 5 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  return { status: result.status, output: result.stdout + result.stderr };
}

const normalizeRange = (value) =>
  value
    .replace(/\s+/g, "")
    .split(",")
    .map((part) =>
      part
        .replace(/^U\+/i, "")
        .split("-")
        .map((number) => Number.parseInt(number, 16).toString(16))
        .join("-"),
    )
    .sort()
    .join(",");

async function verifyBrowser(directory) {
  const { chromium, expect } = require("@playwright/test");
  const server = spawn(
    process.execPath,
    [nextCli, "start", "--hostname", "127.0.0.1", "--port", "41345"],
    {
      cwd: directory,
      env: environment,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let serverLog = "";
  server.stdout.on("data", (data) => {
    serverLog += data;
  });
  server.stderr.on("data", (data) => {
    serverLog += data;
  });
  const origin = "http://127.0.0.1:41345";
  let browser;
  try {
    await expect
      .poll(
        async () => {
          if (server.exitCode !== null) throw new Error(serverLog);
          try {
            return (await fetch(origin)).status;
          } catch {
            return 0;
          }
        },
        { timeout: 30_000 },
      )
      .toBe(200);
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const errors = [];
    const external = [];
    const fontRequests = new Set();
    await page.route("**/*", (route) => {
      if (!route.request().url().startsWith(`${origin}/`)) {
        external.push(route.request().url());
        return route.abort();
      }
      return route.continue();
    });
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("requestfailed", (request) =>
      errors.push(request.failure()?.errorText),
    );
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("response", (response) => {
      if (response.url().includes(".woff2")) fontRequests.add(response.url());
    });
    assert.equal(
      (await page.goto(origin, { waitUntil: "networkidle" })).status(),
      200,
    );
    let count = 0;
    for (const family of manifest.families) {
      const variable = await page.evaluate(
        (name) => getComputedStyle(document.body).getPropertyValue(name),
        family.variable,
      );
      assert(variable.includes(family.cssFamily));
      assert(variable.includes(family.fallback.family));
      for (const subset of family.subsets) {
        for (const weight of family.weights) {
          const faces = await page.evaluate(
            async ({ name, weight, text }) => {
              const fontWeight = weight.includes(" ") ? "400" : weight;
              return (
                await document.fonts.load(`${fontWeight} 24px "${name}"`, text)
              ).map((face) => ({
                weight: face.weight,
                range: face.unicodeRange,
                display: face.display,
                status: face.status,
              }));
            },
            { name: family.cssFamily, weight, text: subset.sampleText },
          );
          assert(
            faces.some(
              (face) =>
                face.status === "loaded" &&
                face.weight === weight &&
                face.display === family.display &&
                normalizeRange(face.range) ===
                  normalizeRange(subset.unicodeRange),
            ),
            `${family.name}/${subset.name}/${weight} failed to load`,
          );
          count += 1;
        }
      }
    }
    const downloadedHashes = await Promise.all(
      [...fontRequests].map(async (url) => {
        const response = await fetch(url);
        assert.equal(response.status, 200);
        return hash(Buffer.from(await response.arrayBuffer()));
      }),
    );
    const expectedHashes = manifest.families.flatMap((family) =>
      family.subsets.map((subset) => subset.sha256),
    );
    assert.deepEqual(
      [...new Set(downloadedHashes)].sort(),
      expectedHashes.sort(),
    );
    const preloadUrls = await page
      .locator('link[rel="preload"][as="font"]')
      .evaluateAll((links) => links.map((link) => link.href));
    const preloadHashes = await Promise.all(
      preloadUrls.map(async (url) =>
        hash(Buffer.from(await (await fetch(url)).arrayBuffer())),
      ),
    );
    const expectedPreloads = manifest.families.flatMap((family) =>
      family.subsets
        .filter((subset) => subset.name === family.preloadSubset)
        .map((subset) => subset.sha256),
    );
    assert.deepEqual(preloadHashes.sort(), expectedPreloads.sort());
    assert.deepEqual(external, []);
    assert.deepEqual(errors, []);
    console.log(
      `PASS: ${count} font faces, ${expectedHashes.length} exact assets, ${preloadHashes.length} expected preloads, no external requests`,
    );
  } finally {
    await browser?.close();
    if (server.exitCode === null) {
      server.kill("SIGTERM");
      await new Promise((resolve) => server.once("exit", resolve));
    }
  }
}

try {
  const positive = fixture("positive", path.join(fontRoot, "index.ts"));
  const result = build(positive);
  assert.equal(result.status, 0, result.output);
  assert(!result.output.includes("Using fallback font"), result.output);
  console.log(
    `PASS: Next ${nextVersion} compiles the actual shared font export with no external network`,
  );
  await verifyBrowser(positive);

  const negative = fixture("missing-asset", "../fonts/index.ts");
  cpSync(fontRoot, path.join(negative, "fonts"), { recursive: true });
  const missing = path.join(
    negative,
    "fonts",
    manifest.families[0].subsets[0].file,
  );
  assert(missing.startsWith(path.join(negative, "fonts") + path.sep));
  assert(existsSync(missing));
  rmSync(missing);
  const failure = build(negative);
  assert.notEqual(
    failure.status,
    0,
    "Missing font assets must fail compilation.",
  );
  assert(
    /(?:Font file not found|Can't resolve|Missing content when trying to generate the content hash for static asset)/.test(
      failure.output,
    ),
    failure.output,
  );
  console.log("PASS: deleting one required font file fails compilation");
} finally {
  assert(
    path.dirname(temporary) === cacheRoot &&
      path.basename(temporary).startsWith("core-local-fonts-"),
  );
  rmSync(temporary, { recursive: true, force: true });
}
