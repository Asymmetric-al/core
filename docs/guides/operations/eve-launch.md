# Eve launch runbook

Issue #437 provides Eve's final release gate. The gate is deliberately inert
after migration: it grants nobody launch permission, leaves `release_enabled`
off, and cannot activate from CI, a deployment, a service identity, a prompt,
or a passing manifest alone.

Use the **Launch readiness** panel in Mission Control for every human mutation.
The API is server-only and stores redacted evidence metadata in Supabase.

## Roles and separation

- A current `super_admin` creates the target-bound evidence manifest.
- Two different permissioned `super_admin` profiles review it. One records the
  `release` review and one records the `security` review. The manifest creator
  cannot review their own manifest.
- A current `super_admin` with `release.activate` performs activation. A
  platform owner must grant `release.review` or `release.activate` explicitly;
  migration and deployment grant neither permission.
- Review and activation permissions should be revoked after the launch window.

## 1. Prepare the exact target

Apply migrations through `20260718102000_eve_final_launch_verification`, deploy
the candidate, and configure these server-only values on that deployment:

- `EVE_LAUNCH_DEPLOYMENT_ID` (or Vercel's `VERCEL_DEPLOYMENT_ID`)
- `EVE_LAUNCH_ENVIRONMENT`
- `EVE_LAUNCH_REVISION` (or `VERCEL_GIT_COMMIT_SHA`)
- `EVE_LAUNCH_MIGRATION_VERSION`
- `EVE_LAUNCH_POLICY_VERSION`
- `EVE_LAUNCH_MODEL_POLICY_REVISION` (the active evaluated policy's 64-character hash)
- `EVE_LAUNCH_EVAL_CONFIG_REVISION` (a 64-character SHA-256 digest)

Do not copy credential values into the manifest. The panel must show **Runtime
target: Configured** and **Release: Off**. If the governance state changes,
produce a new manifest against the new state version.

## 2. Collect launch evidence while release is off

Build one `eve-launch-manifest-v1` JSON document using the schema exported by
`@asym/api/eve/launch-readiness`. Every evidence item must contain a safe
reference, SHA-256 digest, observation/expiry times, passing result, and the
exact target object shown by the deployed runtime.
Each observation and its allowed freshness window are capped at 24 hours.

The document must include exactly:

- implementation and operational proof for issues #417 through #436;
- all 15 composition checks, including auth/tenant isolation, audit and replay,
  eval/model/budget/approval behavior, protected areas, sandboxing, disabled
  trigger suppression, kill switches, runtime/UI/GitHub/subagents/workflows,
  monitors/memory/notifications, retention, deployment, and observability;
- all nine reversal checks listed in the exported schema;
- all eight runbook entries with their exact repository paths.

Run the exercises against the candidate without enabling release. Unit tests or
a merged PR alone are not sufficient composition evidence. Evidence expires;
the manifest itself may live for at most 24 hours.

## 3. Import, review, and authorize

1. Paste the complete JSON into **Signed-off launch evidence manifest** and
   select **Validate and import**. Any missing, duplicate, stale, mismatched,
   draft-only, or failed entry leaves it `not_ready`.
2. A platform owner grants `release.review` to each intended reviewer using
   their exact profile UUID and a non-sensitive reason.
3. The two independent reviewers inspect the target, content hash, evidence,
   runbooks, and current controls, then record release and security approvals.
   A rejection makes that manifest unusable; correct the evidence and create a
   new immutable manifest.
4. Grant `release.activate` only to the named activation operator.

## 4. Activate and complete the canary

Before selecting **Activate exact target**, confirm:

- the manifest is `ready`, unexpired, and matches the runtime target;
- governance policy is `ready`, emergency-off is clear, and all blocking kill
  switches are clear (`force_approval` may remain engaged);
- the release switch is still off and the displayed state version is current;
- the activation rationale identifies the reviewed change window without
  including secrets or sensitive donor data.

Activation performs every check again inside the database transaction, turns
on the existing #418 switch, records #419 audit evidence, and opens a 15-minute
canary. Confirm all six canaries: state visibility, current trigger gating,
audit, budget enforcement, safe notifications, and one non-destructive canary.
Record success before the deadline. The one-minute watchdog automatically
engages emergency-off if the canary expires.

## 5. Close and retain evidence

Verify the launch record is `completed`, the expected audit entries are visible,
and no unexpected notification or budget event occurred. Revoke temporary
launch permissions. Launch evidence is retained for 365 days as metadata only;
an active category hold prevents expiry. Use the retention panel for holds and
replay access. Follow [Eve emergency operations](./eve-emergency.md) for any
failure, rollback, or credential/provider disable.
