import { createHash } from "node:crypto";
import {
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  parse,
  relative,
  resolve,
  sep,
} from "node:path";

import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";

const secretKeys = [
  "QA_TEST_EMAIL",
  "QA_TEST_PASSWORD",
  "VERCEL_ADMIN_AUTOMATION_BYPASS_SECRET",
  "VERCEL_DONOR_AUTOMATION_BYPASS_SECRET",
  "VERCEL_MISSIONARY_AUTOMATION_BYPASS_SECRET",
] as const;

function secretRepresentations() {
  const variants = new Set<string>();
  for (const name of secretKeys) {
    const configured = process.env[name];
    if (!configured) continue;
    for (const secret of new Set([configured, configured.trim()])) {
      if (!secret) continue;
      const base64 = Buffer.from(secret, "utf8").toString("base64");
      const base64url = base64.replaceAll("+", "-").replaceAll("/", "_");
      for (const variant of [
        secret,
        encodeURI(secret),
        encodeURIComponent(secret),
        new URLSearchParams({ value: secret }).toString().slice(6),
        base64,
        base64.replace(/=+$/u, ""),
        base64url,
        base64url.replace(/=+$/u, ""),
      ])
        variants.add(variant);
    }
  }
  return [...variants].sort((left, right) => right.length - left.length);
}

function redact(value: unknown, limit = 200): string | null {
  if (typeof value !== "string") return null;
  const patterns = secretRepresentations().map((variant) =>
    variant
      .replace(/[|\\{}()[\]^$+*?.]/gu, "\\$&")
      .replace(/%[0-9a-f]{2}/giu, (escape) =>
        escape.replace(
          /[a-f]/giu,
          (letter) => "[" + letter.toLowerCase() + letter.toUpperCase() + "]",
        ),
      ),
  );
  // One replacement pass avoids rescanning the replacement marker. This is a
  // bounded set of known representations, not arbitrary obfuscation detection.
  const redacted = patterns.length
    ? value.replace(new RegExp(patterns.join("|"), "gu"), "[redacted]")
    : value;
  return redacted.slice(0, limit);
}

function canonicalPath(path: string): string {
  let current = resolve(path);
  const missing: string[] = [];
  for (;;) {
    try {
      return resolve(realpathSync(current), ...missing);
    } catch (error) {
      // Follow the nearest existing parent for new run directories. A dangling
      // symlink or inaccessible/non-directory parent is not a missing suffix.
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      if (lstatSync(current, { throwIfNoEntry: false })) throw error;
      const parent = dirname(current);
      if (parent === current) throw error;
      missing.unshift(basename(current));
      current = parent;
    }
  }
}

function inside(root: string, path: string) {
  const child = relative(root, path);
  return (
    child !== "" &&
    child !== ".." &&
    !child.startsWith(".." + sep) &&
    !isAbsolute(child)
  );
}

export function assertSmokeArtifactDirectories(
  report: string,
  outputs: string[],
) {
  const reportDirectory = canonicalPath(report);
  const outputDirectories = [...new Set(outputs.map(canonicalPath))];
  const workspace = canonicalPath(process.cwd());
  if (
    [reportDirectory, ...outputDirectories].some((directory) => {
      const existing = lstatSync(directory, { throwIfNoEntry: false });
      return (
        directory === parse(directory).root ||
        directory === workspace ||
        inside(directory, workspace) ||
        Boolean(existing && !existing.isDirectory())
      );
    }) ||
    outputDirectories.some(
      (output) =>
        output === reportDirectory ||
        inside(reportDirectory, output) ||
        inside(output, reportDirectory),
    )
  ) {
    throw new Error(
      "Smoke report and test-output directories must be separate run directories.",
    );
  }
  return { reportDirectory, outputDirectories };
}

function safeEvidence(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  let location = null;
  if (typeof record.url === "string") {
    try {
      const url = new URL(record.url);
      location = { origin: redact(url.origin), pathname: redact(url.pathname) };
    } catch {
      // Invalid URLs carry no useful origin/path evidence.
    }
  }
  return {
    location,
    title: redact(record.title),
    heading: redact(record.heading, 120),
    visiblePasswordInputs:
      typeof record.visiblePasswordInputs === "number"
        ? record.visiblePasswordInputs
        : null,
    network: Array.isArray(record.network)
      ? record.network.slice(-50).flatMap((entry: unknown) => {
          if (!entry || typeof entry !== "object") return [];
          const response = entry as Record<string, unknown>;
          if (
            typeof response.method !== "string" ||
            ![
              "GET",
              "HEAD",
              "POST",
              "PUT",
              "PATCH",
              "DELETE",
              "OPTIONS",
            ].includes(response.method) ||
            typeof response.status !== "number" ||
            !Number.isInteger(response.status) ||
            response.status < 100 ||
            response.status > 599 ||
            typeof response.url !== "string"
          )
            return [];
          try {
            const url = new URL(response.url);
            return [
              {
                method: response.method,
                status: response.status,
                origin: redact(url.origin),
                pathname: redact(url.pathname),
              },
            ];
          } catch {
            return [];
          }
        })
      : [],
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

type ResultRecord = {
  title: string | null;
  project: string | null;
  status: TestResult["status"];
  duration: number;
  evidence: ReturnType<typeof safeEvidence>;
};

/** This credential-bearing suite publishes allowlisted diagnostics only. */
export default class DevelopmentSmokeReporter implements Reporter {
  private reportDirectory: string;
  private outputDirectories: string[] = [];
  private results: ResultRecord[] = [];
  private evidenceFiles: { directory: string; record: ResultRecord }[] = [];
  private prepared = false;

  constructor(options: { outputFolder: string }) {
    this.reportDirectory = resolve(options.outputFolder);
  }

  onBegin(config: FullConfig, suite: Suite) {
    this.outputDirectories = [
      ...new Set(config.projects.map((project) => project.outputDir)),
    ];
    const directories = assertSmokeArtifactDirectories(
      this.reportDirectory,
      this.outputDirectories,
    );
    this.reportDirectory = directories.reportDirectory;
    this.outputDirectories = directories.outputDirectories;
    rmSync(this.reportDirectory, { recursive: true, force: true });
    mkdirSync(this.reportDirectory, { recursive: true });
    this.prepared = true;
    console.log(`Running ${suite.allTests().length} smoke tests`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    let evidence: ReturnType<typeof safeEvidence> = null;
    for (const attachment of result.attachments) {
      let ownedPath: string | undefined;
      if (attachment.path) {
        try {
          const resolved = canonicalPath(attachment.path);
          if (this.outputDirectories.some((root) => inside(root, resolved)))
            ownedPath = resolved;
        } catch {
          // Unresolvable paths are not owned evidence sources.
        }
      }
      if (attachment.name === "evidence.json") {
        try {
          const contents =
            attachment.body ?? (ownedPath ? readFileSync(ownedPath) : null);
          if (contents)
            evidence = safeEvidence(JSON.parse(contents.toString("utf8")));
        } catch {
          // Malformed/unavailable attachments do not enter the public bundle.
        }
      }
    }
    const record: ResultRecord = {
      title: redact(test.title, 500),
      project: redact(test.parent.project()?.name),
      status: result.status,
      duration: result.duration,
      evidence,
    };
    this.results.push(record);
    const projectOutput = test.parent.project()?.outputDir;
    const output = projectOutput ? canonicalPath(projectOutput) : undefined;
    if (output && this.outputDirectories.includes(output)) {
      const id = createHash("sha256")
        .update(test.id)
        .digest("hex")
        .slice(0, 20);
      const directory = join(output, `safe-${id}-retry-${result.retry}`);
      this.evidenceFiles.push({ directory, record });
    }
    console.log(`${record.project}: ${record.status}`);
  }

  onEnd(result: FullResult) {
    if (!this.prepared) return;
    const current = assertSmokeArtifactDirectories(
      this.reportDirectory,
      this.outputDirectories,
    );
    if (
      current.reportDirectory !== this.reportDirectory ||
      current.outputDirectories.some(
        (directory, index) => directory !== this.outputDirectories[index],
      )
    ) {
      throw new Error("Smoke artifact directories changed during the run.");
    }
    // Retain only the bounded bundle. This also removes unattached source
    // files copied by testInfo.attach(), never arbitrary attachment sources.
    for (const output of this.outputDirectories) {
      rmSync(output, { recursive: true, force: true });
      mkdirSync(output, { recursive: true });
    }
    for (const { directory, record } of this.evidenceFiles) {
      mkdirSync(directory, { recursive: true });
      writeFileSync(
        join(directory, "evidence.json"),
        JSON.stringify(record, null, 2) + "\n",
      );
    }
    const json = JSON.stringify(
      { status: result.status, tests: this.results },
      null,
      2,
    );
    const sanitizedDirectory = join(this.reportDirectory, "sanitized");
    mkdirSync(sanitizedDirectory, { recursive: true });
    writeFileSync(join(sanitizedDirectory, "results.json"), json + "\n");
    writeFileSync(
      join(sanitizedDirectory, "index.html"),
      `<!doctype html><html lang="en"><meta charset="utf-8"><title>Smoke diagnostics</title><h1>Smoke diagnostics</h1><pre>${escapeHtml(json)}</pre></html>\n`,
    );
  }
}
