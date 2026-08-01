import { createHash } from "node:crypto";

import { executeEvePolicyTracerAsIdentity } from "@asym/api/eve/approval-budget";
import {
  createEveAuditStore,
  createGithubBotEveAuditIdentity,
} from "@asym/api/eve/audit";
import {
  executeEveGithubOperation,
  type EveGithubChangedFile,
  type EveGithubOperatorRequest,
} from "@asym/api/eve/github-operator";
import { createEveGovernanceStore } from "@asym/api/eve/governance";

import { performEveGithubOperation } from "./operator";

import type { SandboxSession } from "eve/sandbox";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

export interface EveGithubToolRequest {
  approvalId?: string;
  baseBranch?: string;
  body?: string;
  branch?: string;
  changedPaths?: string[];
  commitMessage?: string;
  expectedRunAttempt?: number;
  issueNumber?: number;
  labels?: string[];
  operation:
    | "add_labels"
    | "create_branch"
    | "create_issue"
    | "open_pull_request"
    | "push_safe_fix"
    | "rerun_failed_workflow"
    | "update_pull_request";
  productDirection?: boolean;
  pullRequestNumber?: number;
  state?: "closed" | "open";
  targetNumber?: number;
  title?: string;
  workflowRunId?: number;
}

function required<T>(value: T | undefined, name: string): T {
  if (value === undefined) throw new Error(`GitHub operator requires ${name}.`);
  return value;
}

function toOperationRequest(
  input: EveGithubToolRequest,
  changedFiles: EveGithubChangedFile[],
): EveGithubOperatorRequest {
  switch (input.operation) {
    case "create_issue":
      return {
        operation: input.operation,
        body: required(input.body, "body"),
        labels: input.labels,
        productDirection: input.productDirection,
        title: required(input.title, "title"),
      };
    case "create_branch":
      return {
        operation: input.operation,
        baseBranch: required(input.baseBranch, "baseBranch"),
        branch: required(input.branch, "branch"),
        issueNumber: required(input.issueNumber, "issueNumber"),
      };
    case "open_pull_request":
      return {
        operation: input.operation,
        baseBranch: required(input.baseBranch, "baseBranch"),
        body: required(input.body, "body"),
        branch: required(input.branch, "branch"),
        changedPaths: input.changedPaths,
        issueNumber: required(input.issueNumber, "issueNumber"),
        productDirection: input.productDirection,
        title: required(input.title, "title"),
      };
    case "add_labels":
      return {
        operation: input.operation,
        issueNumber: required(input.issueNumber, "issueNumber"),
        labels: required(input.labels, "labels"),
        targetNumber: required(input.targetNumber, "targetNumber"),
      };
    case "rerun_failed_workflow":
      return {
        operation: input.operation,
        expectedRunAttempt: required(
          input.expectedRunAttempt,
          "expectedRunAttempt",
        ),
        issueNumber: required(input.issueNumber, "issueNumber"),
        workflowRunId: required(input.workflowRunId, "workflowRunId"),
      };
    case "update_pull_request":
      return {
        operation: input.operation,
        issueNumber: required(input.issueNumber, "issueNumber"),
        pullRequestNumber: required(
          input.pullRequestNumber,
          "pullRequestNumber",
        ),
        state: required(input.state, "state"),
      };
    case "push_safe_fix":
      return {
        operation: input.operation,
        approvalId: input.approvalId,
        branch: required(input.branch, "branch"),
        changedFiles,
        commitMessage: required(input.commitMessage, "commitMessage"),
        issueNumber: required(input.issueNumber, "issueNumber"),
        productDirection: input.productDirection,
      };
  }
}

function parseStatus(
  output: string,
): Map<string, EveGithubChangedFile["status"]> {
  const status = new Map<string, EveGithubChangedFile["status"]>();
  for (const entry of output.split("\0").filter(Boolean)) {
    const code = entry.slice(0, 2);
    const path = entry.slice(3);
    if (!path || code.includes("R") || code.includes("C")) {
      throw new Error("Safe fixes do not support renamed or copied files.");
    }
    status.set(
      path,
      code.includes("D")
        ? "deleted"
        : code === "??" || code.includes("A")
          ? "added"
          : "modified",
    );
  }
  return status;
}

async function loadChangedFiles(
  sandbox: SandboxSession,
  expectedPaths: readonly string[],
): Promise<EveGithubChangedFile[]> {
  const observed = await sandbox.run({
    command:
      "git -C /workspace/repo status --porcelain=v1 -z --untracked-files=all",
  });
  if (observed.exitCode !== 0) {
    throw new Error("The sandbox change set could not be inspected.");
  }
  const status = parseStatus(observed.stdout);
  const expected = [...new Set(expectedPaths)].sort();
  const actual = [...status.keys()].sort();
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    throw new Error(
      "The declared safe-fix paths do not match the sandbox change set.",
    );
  }
  const symlinks = await sandbox.run({
    command: "find /workspace/repo -type l -printf '%P\\0'",
  });
  if (symlinks.exitCode !== 0) {
    throw new Error("The sandbox file types could not be inspected.");
  }
  const changedSymlinks = symlinks.stdout
    .split("\0")
    .filter((path) => expected.includes(path));
  if (changedSymlinks.length > 0) {
    throw new Error("Safe fixes do not support symbolic links.");
  }
  return Promise.all(
    expected.map(async (path) => {
      const fileStatus = status.get(path)!;
      const content =
        fileStatus === "deleted"
          ? undefined
          : ((await sandbox.readTextFile({
              encoding: "utf-8",
              path: `/workspace/repo/${path}`,
            })) ?? undefined);
      return { content, path, status: fileStatus };
    }),
  );
}

export function eveGithubOperationRunId(
  deliveryId: string,
  request: EveGithubToolRequest,
): string {
  const hex = createHash("sha256")
    .update(JSON.stringify({ deliveryId, request }))
    .digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export async function runEveGithubOperatorTool(input: {
  accountablePrincipalId: string;
  accountableTrigger: string;
  installationId: number;
  request: EveGithubToolRequest;
  runId: string;
  sandbox: SandboxSession;
}) {
  const actorProfileId = process.env.EVE_GITHUB_ACTOR_PROFILE_ID?.trim();
  const tenantId = process.env.EVE_GITHUB_TENANT_ID?.trim();
  if (
    !actorProfileId ||
    !tenantId ||
    !UUID_PATTERN.test(actorProfileId) ||
    !UUID_PATTERN.test(tenantId)
  ) {
    throw new Error(
      "Eve's tenant-linked GitHub service principal is unavailable.",
    );
  }
  const { getAdminClient } = await import("@asym/database/supabase/admin");
  const admin = getAdminClient();
  if (!admin.client) throw new Error("Eve's governance store is unavailable.");

  const changedFiles =
    input.request.operation === "push_safe_fix"
      ? await loadChangedFiles(
          input.sandbox,
          required(input.request.changedPaths, "changedPaths"),
        )
      : [];
  const identity = createGithubBotEveAuditIdentity({
    actorProfileId,
    actorRole: "super_admin",
    botId:
      process.env.EVE_GITHUB_APP_SLUG?.trim() ||
      process.env.GITHUB_APP_SLUG?.trim() ||
      "eve-asymmetric[bot]",
    initiatorId: input.accountablePrincipalId,
    initiatorType: "github_sender",
    tenantId,
  });
  return executeEveGithubOperation(
    {
      accountableTrigger: input.accountableTrigger,
      actorProfileId,
      identity,
      installationId: input.installationId,
      owner: "Asymmetric-al",
      repo: "core",
      request: toOperationRequest(input.request, changedFiles),
      runId: input.runId,
    },
    {
      auditStore: createEveAuditStore(admin.client),
      consultPolicy: ({ approvalId, identity: verifiedIdentity, targetKey }) =>
        executeEvePolicyTracerAsIdentity({
          actionId: "engineering.github_operation.write",
          approvalId,
          identity: verifiedIdentity,
          supabaseAdmin: admin.client!,
          targetKey,
        }),
      governanceStore: createEveGovernanceStore(admin.client),
      performOperation: performEveGithubOperation,
    },
  );
}
