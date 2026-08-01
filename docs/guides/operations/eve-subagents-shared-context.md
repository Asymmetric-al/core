# Eve specialists and shared run context operations

The specialist catalog and shared run context are implemented but remain
provider-inert while Eve's master release switch is off.

## What is installed

`packages/eve-runtime/agent/subagents/` contains thirteen declared Eve child
agents. Every child has dedicated instructions, the shared catalog-driven
agent definition, a fixed-writer `shared_context` tool, and explicit overrides
that disable mutating shell, file-write, and network tools. The root agent sees
each directory name as a delegation tool.

Supabase stores three append-only metadata sets:

- `eve_shared_context_claims` for attributed run claims;
- `eve_shared_context_conflicts` for preserved disagreements; and
- `eve_shared_context_resolutions` for governed outcomes.

These tables are service-role only with RLS enabled. The append RPC verifies
that the root session belongs to the same tenant. Tool input has no tenant,
actor, run, session, or writer field.

## Required configuration

Apply `20260718070400_eve_subagent_shared_context.sql`. Configure the existing
Supabase service-role environment only in the runtime host, never the sandbox.
Admin sessions use #426's verified Supabase identity. GitHub sessions use the
tenant-linked Eve App service-principal configuration documented by the GitHub
operator guide.

Before production model use, activate a new #421 policy containing every
`specialist.*` role and passing each catalog eval gate. Existing active policies
that lack a role fail closed. The #423 catalog must contain hard budgets for
specialist delegation, shared-context writes, and conflict resolutions.

## Reading claims and conflicts

Query through the app-owned shared-context store using a verified session
identity and root session ID. Inspect the claim's provenance, evidence,
confidence, and risk before reuse. Shared context is advisory; verify GitHub,
CI, OpenSpec, repository, and product state at their authoritative sources.

Do not copy secrets, credentials, private keys, one-time codes, payment data,
donor/customer PII, raw production rows, sensitive tenant facts, or unredacted
logs into shared context. Rejections intentionally omit the proposed value from
audit records.

## Resolving disagreement

Do not edit or delete competing claims. A governed resolver selects only claim
IDs already preserved by the conflict and records the governing policy,
evidence considered, and outcome. Until a high-risk or protected disagreement
has a resolution, dependent autonomous action must remain blocked and follow
the applicable human escalation path.

## Verification

Before any launch:

1. run `bun run --filter @asym/eve-runtime info` and confirm zero diagnostics;
2. run `bun run --filter @asym/eve-runtime eval` and confirm all thirteen
   specialist delegation evals and the foundation smoke pass;
3. verify catalog, routing, model-role, budget, eval-gate, and cap unit tests;
4. verify valid, malformed, sensitive, cross-tenant, disagreement, resolution,
   and high-risk-blocking tests;
5. confirm the Supabase tables expose no anon or authenticated grants;
6. confirm the release switch remains off; and
7. run strict OpenSpec validation and `bun run ci:preflight`.

## Emergency stop and rollback

The global emergency stop, `all_automation`, `active_runs`,
`production_writes`, and dynamic-workflow controls take precedence over
delegation and writes. Model-policy and approval-budget blocks also fail closed.

To roll back capability, keep the release switch off, remove the declared
specialist runtime surface, and retire the affected model policy. Preserve
claims, conflicts, resolutions, policy decisions, and audit history. Do not
drop or rewrite governance evidence during an incident.
