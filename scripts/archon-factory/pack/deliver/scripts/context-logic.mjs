// Context decisions: which governing files the packet includes, read from
// the recorded commit's objects. The working tree is writable by the check
// container, so a planted symlink there must never be followed.
import { readCommittedFile } from "../../.shared/git.mjs";
import { PROTECTED_GLOBS } from "./scope-logic.mjs";

const ROOT_RULES = ["AGENTS.md", "docs/ai/document-authority.md"];
const SHARED_AREAS = [
  "migrations",
  "lockfile",
  "shared-ui",
  "api-contract",
  "ci",
  "factory-policy",
];

// Samson's task. after-scope blocks protected paths and overlapping globs and
// reserves shared areas by exact name, so the rules are stated up front; the
// protected list is the gate's own.
export function scopeTask(repo) {
  return [
    "Decide whether this issue can be delivered as one candidate and scope it.",
    `Read the workspace at ${repo} (absolute paths only) to locate the code, tests, specs and nearest AGENTS.md files.`,
    "Read every governing PRD/OpenSpec clause the issue relies on in full, not only excerpts.",
    'source_paths: repository-relative globs Bezalel may edit (for example "packages/api/src/donations/**").',
    "test_paths: repository-relative globs where Ezra may write acceptance tests; they must not overlap source_paths.",
    "source_paths may be empty only when the issue changes acceptance tests alone; test_paths then lists every path to change.",
    `source_paths and test_paths must not reach ${PROTECTED_GLOBS.join(", ")} unless an operator authorized them in core/scope.allowProtected.`,
    "Source and test globs must not be able to match the same path.",
    `shared_areas: any of ${SHARED_AREAS.join(", ")} that this change touches. Names are compared exactly after trimming, so use exactly these canonical names.`,
    "Return decision=blocked with a precise blocker when requirements are ambiguous, prerequisites are unmet, or the work needs a person.",
  ].join("\n");
}
const pathPattern =
  /(?:^|[\s`(\[])((?:openspec|docs|apps|packages|scripts|supabase|tooling|tests)\/[A-Za-z0-9._\/-]+\.(?:md|yaml|yml|json|ts|tsx|mjs|sql))/g;

export function referencedPaths(texts) {
  const referenced = new Set(ROOT_RULES);
  for (const text of texts)
    for (const match of String(text ?? "").matchAll(pathPattern))
      referenced.add(match[1].replace(/[.,;:)]+$/, ""));
  return [...referenced];
}

export async function collectGoverning({
  git,
  repo,
  revision,
  referenced,
  budget = 160_000,
  limit = 32,
}) {
  const sources = [];
  const excerpts = [];
  let remaining = budget;
  for (const relative of referenced.slice(0, limit)) {
    let file = { state: "missing" };
    if (/^[a-f0-9]{40}$/.test(revision ?? ""))
      try {
        file = await readCommittedFile({ git }, repo, revision, relative, {
          maxBytes: remaining,
        });
      } catch {
        file = { state: "unreadable" };
      }
    if (file.state !== "ok") {
      sources.push({
        path: relative,
        bytes: file.state === "too-large" ? file.bytes : 0,
        included: false,
      });
      continue;
    }
    remaining -= file.text.length;
    sources.push({ path: relative, bytes: file.text.length, included: true });
    excerpts.push(`### ${relative}\n\n${file.text}`);
  }
  return { sources, excerpts };
}
