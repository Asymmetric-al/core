import { createHash } from "node:crypto";

import { z } from "zod";

import { classifyEveAdminMemoryExclusions } from "../admin-memory";
import { hasBlockingSandboxFinding, scanEveSandboxWrite } from "../sandbox";

import type { EveGithubOperatorInput, EveGithubOperatorRequest } from "./types";

const textSchema = z.string().trim().min(1).max(8_000);
const branchSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[A-Za-z0-9._/-]+$/u);
const positiveInteger = z.number().int().positive();
const safeLabel = z
  .string()
  .trim()
  .min(1)
  .max(50)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._:/ -]*$/u);

function assertIssueBranch(issueNumber: number, branch: string): void {
  branchSchema.parse(branch);
  if (!branch.startsWith(`eve/issue-${issueNumber}-`)) {
    throw new Error(
      `Eve branches must use eve/issue-${issueNumber}-<slug> for issue-first traceability.`,
    );
  }
}

function assertExternalTextSafe(values: readonly string[]): void {
  const exclusions = classifyEveAdminMemoryExclusions(values.join("\n"));
  if (exclusions.length > 0) {
    throw new Error(
      `GitHub operation blocked by the business-data boundary: ${exclusions.join(", ")}.`,
    );
  }
}

function productDirectionPaths(request: EveGithubOperatorRequest): string[] {
  if (request.operation === "push_safe_fix") {
    return request.changedFiles.map((file) => file.path);
  }
  if (request.operation === "open_pull_request") {
    return request.changedPaths ?? [];
  }
  return [];
}

export function prepareEveGithubOperation(
  input: EveGithubOperatorInput,
): EveGithubOperatorInput {
  if (input.owner !== "Asymmetric-al" || input.repo !== "core") {
    throw new Error(
      "Eve's GitHub operator is restricted to Asymmetric-al/core.",
    );
  }
  positiveInteger.parse(input.installationId);
  const request = input.request;
  const exposedText: string[] = [];

  switch (request.operation) {
    case "create_issue":
      textSchema.parse(request.title);
      textSchema.parse(request.body);
      exposedText.push(request.title, request.body, ...(request.labels ?? []));
      request.labels?.forEach((label) => safeLabel.parse(label));
      break;
    case "create_branch":
      positiveInteger.parse(request.issueNumber);
      assertIssueBranch(request.issueNumber, request.branch);
      branchSchema.parse(request.baseBranch);
      break;
    case "open_pull_request":
      positiveInteger.parse(request.issueNumber);
      assertIssueBranch(request.issueNumber, request.branch);
      branchSchema.parse(request.baseBranch);
      textSchema.parse(request.title);
      textSchema.parse(request.body);
      exposedText.push(request.title, request.body);
      request.changedPaths?.forEach((path) => {
        const scan = scanEveSandboxWrite({ content: "", path });
        if (hasBlockingSandboxFinding(scan)) {
          throw new Error(`Pull request blocked for sensitive path: ${path}`);
        }
      });
      if (!request.body.includes(`Closes #${request.issueNumber}`)) {
        request.body = `${request.body.trim()}\n\nCloses #${request.issueNumber}`;
      }
      break;
    case "add_labels":
      positiveInteger.parse(request.issueNumber);
      positiveInteger.parse(request.targetNumber);
      if (request.labels.length === 0 || request.labels.length > 10) {
        throw new Error(
          "Eve label operations require between one and ten labels.",
        );
      }
      request.labels.forEach((label) => safeLabel.parse(label));
      exposedText.push(...request.labels);
      break;
    case "rerun_failed_workflow":
      positiveInteger.parse(request.issueNumber);
      positiveInteger.parse(request.workflowRunId);
      positiveInteger.parse(request.expectedRunAttempt);
      break;
    case "update_pull_request":
      positiveInteger.parse(request.issueNumber);
      positiveInteger.parse(request.pullRequestNumber);
      break;
    case "push_safe_fix": {
      positiveInteger.parse(request.issueNumber);
      assertIssueBranch(request.issueNumber, request.branch);
      textSchema.max(300).parse(request.commitMessage);
      exposedText.push(request.commitMessage);
      if (
        request.changedFiles.length === 0 ||
        request.changedFiles.length > 50
      ) {
        throw new Error("A safe fix must contain between one and fifty files.");
      }
      let requiresApproval = false;
      let totalBytes = 0;
      for (const file of request.changedFiles) {
        const content = file.content ?? "";
        totalBytes += Buffer.byteLength(content);
        exposedText.push(content);
        const scan = scanEveSandboxWrite({ content, path: file.path });
        if (hasBlockingSandboxFinding(scan)) {
          throw new Error(
            `Safe fix blocked for sensitive path or content: ${file.path}`,
          );
        }
        requiresApproval ||= scan.requiresApproval;
        if (file.status !== "deleted" && file.content === undefined) {
          throw new Error(`Safe fix content is missing for ${file.path}.`);
        }
      }
      if (totalBytes > 1_000_000) {
        throw new Error("A safe fix may not exceed 1 MB of source text.");
      }
      if (requiresApproval && !request.approvalId) {
        throw new Error(
          `Protected-area safe fixes require an approval ID for target ${eveGithubOperationTargetKey(input)}.`,
        );
      }
      break;
    }
  }

  assertExternalTextSafe(exposedText);
  if (
    (request.operation === "open_pull_request" ||
      request.operation === "push_safe_fix") &&
    typeof request.productDirection !== "boolean"
  ) {
    throw new Error(
      "GitHub operator requires an app-owned product-direction classification.",
    );
  }
  if (
    (request.operation === "open_pull_request" ||
      request.operation === "push_safe_fix") &&
    request.productDirection === true
  ) {
    const paths = productDirectionPaths(request);
    if (!paths.some((path) => path.startsWith("openspec/"))) {
      throw new Error(
        "Product-direction work must update OpenSpec before implementation.",
      );
    }
  }
  return input;
}

export function eveGithubOperationTargetKey(
  input: EveGithubOperatorInput,
): string {
  const request = input.request;
  const safeFixFingerprint =
    request.operation === "push_safe_fix"
      ? request.changedFiles.map((file) => ({
          contentHash:
            file.content === undefined
              ? null
              : createHash("sha256").update(file.content).digest("hex"),
          path: file.path,
          status: file.status,
        }))
      : null;
  const fingerprint = createHash("sha256")
    .update(
      JSON.stringify({
        operation: request.operation,
        owner: input.owner,
        repo: input.repo,
        issueNumber: "issueNumber" in request ? request.issueNumber : null,
        branch: "branch" in request ? request.branch : null,
        pullRequestNumber:
          "pullRequestNumber" in request ? request.pullRequestNumber : null,
        targetNumber: "targetNumber" in request ? request.targetNumber : null,
        workflowRunId:
          "workflowRunId" in request ? request.workflowRunId : null,
        safeFixFingerprint,
      }),
    )
    .digest("hex")
    .slice(0, 32);
  return `github_operation:${fingerprint}`;
}
