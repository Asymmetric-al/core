#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const SCAN_ROOTS = ["apps", "packages"];
const SCAN_EXTENSIONS = new Set([".tsx", ".css"]);
const SKIP_DIRS = new Set([
  ".next",
  ".turbo",
  "coverage",
  "dist",
  "node_modules",
]);
const RAW_TOKEN_PATTERN =
  /(?:^|[\s"'`:{[(])((?:(?:[a-z-]+|data-\[[^\]]+\]|aria-\[[^\]]+\]):)*(?:bg|text|border)-(?:slate|zinc|gray)-\d{2,3}(?:\/\d{1,3})?)/g;
const REPORT_LIMIT = 80;

const ALLOWLISTS = [
  {
    label: "maps",
    match: ({ file, line }) =>
      /\bmaps?\b|mapbox|leaflet|MapPin/i.test(file) ||
      /\bmaps?\b|mapbox|leaflet|MapPin/i.test(line),
  },
  {
    label: "charts",
    match: ({ file, line }) =>
      /\bcharts?\b|recharts|sparkline|graph/i.test(file) ||
      /\bcharts?\b|recharts|sparkline|graph/i.test(line),
  },
  {
    label: "status colors",
    match: ({ file, line }) =>
      /\b(status|badge|severity|success|warning|danger|error|failed|pending|approved|rejected|completed)\b/i.test(
        file,
      ) ||
      /\b(status|badge|severity|success|warning|danger|error|failed|pending|approved|rejected|completed)\b/i.test(
        line,
      ),
  },
  {
    label: "syntax highlighting",
    match: ({ file, line }) =>
      /\b(syntax|highlight|shiki|prism|code-block)\b/i.test(file) ||
      /\b(syntax|highlight|shiki|prism|pre|code)\b/i.test(line),
  },
  {
    label: "screenshots",
    match: ({ file, line }) =>
      /\b(screenshot|screenshots|boneyard|capture)\b/i.test(file) ||
      /\b(screenshot|screenshots|boneyard|capture)\b/i.test(line),
  },
  {
    label: "brand exceptions",
    match: ({ file, line }) =>
      /packages\/ui\/components\/public\//.test(file) ||
      /\b(brand|logo|marketing|hero|home-|about-)\b/i.test(file) ||
      /\b(brand|logo|marketing)\b/i.test(line),
  },
];

function toPosix(value) {
  return value.replaceAll("\\", "/");
}

function listFiles(root) {
  const absoluteRoot = path.join(REPO_ROOT, root);
  if (!existsSync(absoluteRoot)) {
    return [];
  }

  const files = [];
  const stack = [absoluteRoot];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) {
          stack.push(absolutePath);
        }
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      if (SCAN_EXTENSIONS.has(path.extname(entry.name))) {
        files.push(absolutePath);
      }
    }
  }

  return files.sort();
}

function allowlistLabel(finding) {
  const matched = ALLOWLISTS.find((allowlist) => allowlist.match(finding));
  return matched?.label ?? null;
}

function scanFile(absolutePath) {
  const relativePath = toPosix(path.relative(REPO_ROOT, absolutePath));
  const text = readFileSync(absolutePath, "utf8");
  const findings = [];

  text.split(/\r?\n/).forEach((line, index) => {
    for (const match of line.matchAll(RAW_TOKEN_PATTERN)) {
      const token = match[1];
      const finding = {
        file: relativePath,
        lineNumber: index + 1,
        line: line.trim(),
        token,
      };
      findings.push({
        ...finding,
        allowlist: allowlistLabel(finding),
      });
    }
  });

  return findings;
}

function formatFinding(finding) {
  return `${finding.file}:${finding.lineNumber} ${finding.token}`;
}

function main() {
  const files = SCAN_ROOTS.flatMap(listFiles);
  const findings = files.flatMap(scanFile);
  const reportable = findings.filter((finding) => !finding.allowlist);
  const allowedCounts = new Map();

  for (const finding of findings) {
    if (finding.allowlist) {
      allowedCounts.set(
        finding.allowlist,
        (allowedCounts.get(finding.allowlist) ?? 0) + 1,
      );
    }
  }

  console.log("# Shadcn Token Drift Report");
  console.log("");
  console.log("Mode: report-only (always exits 0; not a CI gate)");
  console.log(`Scanned files: ${files.length}`);
  console.log(`Raw palette hits: ${findings.length}`);
  console.log(`Reportable hits: ${reportable.length}`);
  console.log("");

  if (allowedCounts.size > 0) {
    console.log("Allowlisted hits:");
    for (const [label, count] of [...allowedCounts.entries()].sort()) {
      console.log(`- ${label}: ${count}`);
    }
    console.log("");
  }

  if (reportable.length === 0) {
    console.log("No reportable raw slate/zinc/gray bg/text/border utilities.");
    return;
  }

  console.log(`First ${Math.min(REPORT_LIMIT, reportable.length)} hits:`);
  for (const finding of reportable.slice(0, REPORT_LIMIT)) {
    console.log(`- ${formatFinding(finding)}`);
  }

  if (reportable.length > REPORT_LIMIT) {
    console.log(`- ... ${reportable.length - REPORT_LIMIT} more`);
  }

  const largestFileSize = Math.max(
    0,
    ...files.map((file) => statSync(file).size),
  );
  console.log("");
  console.log(`Largest scanned file: ${largestFileSize} bytes`);
}

main();
