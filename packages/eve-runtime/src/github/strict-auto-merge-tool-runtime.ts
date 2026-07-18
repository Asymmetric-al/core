import { createHash } from "node:crypto";

import { executeEvePolicyTracerAsIdentity } from "@asym/api/eve/approval-budget";
import {
  createEveAuditStore,
  createGithubBotEveAuditIdentity,
} from "@asym/api/eve/audit";
import { createEveGovernanceStore } from "@asym/api/eve/governance";
import { executeEveStrictAutoMerge } from "@asym/api/eve/strict-auto-merge";

import {
  escalateEveStrictAutoMerge,
  inspectEveStrictAutoMerge,
  mergeEveStrictAutoMerge,
} from "./strict-auto-merge";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

export interface EveStrictAutoMergeToolRequest {
  accountableLogin: string;
  expectedHeadSha: string;
  pullRequestNumber: number;
}

export function eveStrictAutoMergeRunId(
  turnOrDeliveryId: string,
  request: EveStrictAutoMergeToolRequest,
): string {
  const hex = createHash("sha256")
    .update(JSON.stringify({ request, turnOrDeliveryId }))
    .digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export async function runEveStrictAutoMergeTool(input: {
  accountablePrincipalId: string;
  accountableTrigger: string;
  installationId: number;
  request: EveStrictAutoMergeToolRequest;
  runId: string;
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
  const mergeInput = {
    accountableLogin: input.request.accountableLogin,
    accountableTrigger: input.accountableTrigger,
    actorProfileId,
    expectedHeadSha: input.request.expectedHeadSha,
    identity,
    installationId: input.installationId,
    owner: "Asymmetric-al",
    pullRequestNumber: input.request.pullRequestNumber,
    repo: "core",
    runId: input.runId,
  } as const;
  return executeEveStrictAutoMerge(mergeInput, {
    auditStore: createEveAuditStore(admin.client),
    consultPolicy: ({ identity: verifiedIdentity, targetKey }) =>
      executeEvePolicyTracerAsIdentity({
        actionId: "engineering.github_merge.execute",
        identity: verifiedIdentity,
        supabaseAdmin: admin.client!,
        targetKey,
      }),
    escalate: ({ evidence, reasons }) =>
      escalateEveStrictAutoMerge({
        accountableLogin: mergeInput.accountableLogin,
        evidence,
        installationId: mergeInput.installationId,
        owner: mergeInput.owner,
        reasons,
        repo: mergeInput.repo,
      }),
    governanceStore: createEveGovernanceStore(admin.client),
    inspect: inspectEveStrictAutoMerge,
    merge: mergeEveStrictAutoMerge,
  });
}
