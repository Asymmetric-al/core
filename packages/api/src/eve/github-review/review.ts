import { z } from "zod";

import { classifyEveAdminMemoryExclusions } from "../admin-memory";
import { scanEveSandboxPath } from "../sandbox/guardrails";

import type {
  EveGithubPreparedReview,
  EveGithubProtectedArea,
  EveGithubReviewOutput,
} from "./types";

const pathSchema = z
  .string()
  .min(1)
  .max(500)
  .regex(/^[^\0\r\n]+$/u, "GitHub paths may not contain control lines.");

const reviewOutputSchema = z
  .object({
    summary: z.string().trim().min(1).max(8_000),
    findings: z
      .array(
        z
          .object({
            path: pathSchema,
            line: z.number().int().positive(),
            side: z.enum(["LEFT", "RIGHT"]),
            severity: z.enum(["blocker", "high", "medium", "low"]),
            body: z.string().trim().min(1).max(2_000),
          })
          .strict(),
      )
      .max(25),
  })
  .strict();

function unwrapJson(value: string): string {
  const trimmed = value.trim();
  const match = /^```(?:json)?\s*([\s\S]*?)\s*```$/iu.exec(trimmed);
  return match?.[1] ?? trimmed;
}

export function parseEveGithubReviewOutput(
  value: string,
): EveGithubReviewOutput {
  let parsed: unknown;
  try {
    parsed = JSON.parse(unwrapJson(value));
  } catch {
    throw new Error("Eve GitHub review output must be one JSON object.");
  }

  const output = reviewOutputSchema.parse(parsed);
  const sensitiveText = [
    output.summary,
    ...output.findings.map((finding) => finding.body),
  ].join("\n");
  const exclusions = classifyEveAdminMemoryExclusions(sensitiveText);
  if (exclusions.length > 0) {
    throw new Error(
      `Eve GitHub review output was withheld by data-boundary policy: ${exclusions.join(", ")}.`,
    );
  }

  return output;
}

export function detectEveGithubProtectedAreas(
  changedPaths: readonly string[],
): EveGithubProtectedArea[] {
  return changedPaths.flatMap((path) => {
    const parsedPath = pathSchema.parse(path);
    const rules = [
      ...new Set(
        scanEveSandboxPath(parsedPath).findings.map((finding) => finding.rule),
      ),
    ].sort();
    return rules.length > 0 ? [{ path: parsedPath, rules }] : [];
  });
}

function escapeInlineCode(value: string): string {
  return value.replaceAll("`", "ˋ");
}

function normalizeLogin(value: string): string {
  return /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/u.test(value)
    ? value
    : "verified-github-sender";
}

export function prepareEveGithubReview(input: {
  accountableLogin: string;
  changedPaths: readonly string[];
  rawOutput: string;
}): EveGithubPreparedReview {
  const output = parseEveGithubReviewOutput(input.rawOutput);
  const changedPaths = new Set(
    input.changedPaths.map((path) => pathSchema.parse(path)),
  );
  for (const finding of output.findings) {
    if (!changedPaths.has(finding.path)) {
      throw new Error(
        `Inline finding path is not part of the reviewed change: ${finding.path}`,
      );
    }
  }

  const protectedAreas = detectEveGithubProtectedAreas([...changedPaths]);
  const protectedSummary =
    protectedAreas.length === 0
      ? "- None detected in the changed-file set."
      : protectedAreas
          .map(
            (area) =>
              `- \`${escapeInlineCode(area.path)}\` — ${area.rules.join(", ")}`,
          )
          .join("\n");
  const accountableLogin = normalizeLogin(input.accountableLogin);
  const body = [
    "## Eve review",
    "",
    output.summary,
    "",
    "### Protected-area scan",
    "",
    protectedSummary,
    "",
    "### Accountability",
    "",
    `Executed by the Eve GitHub App for the verified trigger from @${accountableLogin}.`,
    "",
    "<!-- eve:github:review:v1 -->",
  ].join("\n");

  return {
    body,
    comments: output.findings.map((finding) => ({
      body: `**${finding.severity.toUpperCase()}** — ${finding.body}`,
      line: finding.line,
      path: finding.path,
      side: finding.side,
    })),
    event: "COMMENT",
    protectedAreas,
  };
}

export const EVE_GITHUB_REVIEW_OUTPUT_INSTRUCTIONS = `Return only one JSON object with this exact shape:
{"summary":"A concise decision summary of what and why.","findings":[{"path":"relative/changed/file.ts","line":1,"side":"RIGHT","severity":"blocker|high|medium|low","body":"An actionable inline finding."}]}

Rules:
- Use event-neutral review language; do not approve, request changes, merge, label, rerun CI, push, or mutate PR state.
- Include only findings supported by the supplied PR diff or checked-out repository.
- Use only paths changed by the PR and diff-valid line numbers.
- Do not include raw reasoning, prompts, logs, secrets, credentials, PII, payments, one-time codes, or tenant facts.
- Use an empty findings array when there are no actionable inline findings.
- Do not wrap the JSON in Markdown fences.`;
