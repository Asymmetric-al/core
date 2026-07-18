# Eve emergency and rollback runbook

Emergency-off always outranks a passing launch manifest and the release switch.
Any verified admin may engage it from Mission Control. Clearing it requires a
`super_admin`, keeps release off, and leaves the master and active-run switches
engaged until operators deliberately clear them through the existing governance
controls.

## Immediate response

1. Open **Eve Operations → Launch readiness**, enter a concise non-sensitive
   incident reason, and select **Emergency off**. Do not wait for a diagnosis.
2. Confirm `release_enabled=false`, `emergency_off=true`, and the
   `all_automation` and `active_runs` switches are engaged. The transition rolls
   back any active launch record and is permanently audited.
3. Pause both notification channels if delivery itself is implicated. Disable
   the relevant GitHub, production-write, sandbox-network, dynamic-workflow, or
   model-policy kill switch as needed; more restrictive controls remain valid.
4. Terminate or quarantine external provider sessions and in-flight jobs using
   their provider control plane. Never paste credentials or provider response
   bodies into audit reasons, issues, or launch evidence.

If Mission Control is unavailable, roll back the candidate deployment through
the Vercel deployment controls and revoke/rotate the affected server-only
credential in its owning provider. Removing credentials reduces authority; it
does not clear emergency state or re-enable Eve.

## Diagnose and recover

- Inspect #419 launch, governance, budget, sandbox, GitHub, workflow, monitor,
  and notification audit records using safe summaries and correlation IDs.
- Preserve required replay metadata by placing an active `launch_manifest` or
  relevant category hold before normal retention expiry.
- Roll back the model policy through the existing evaluated model-policy path.
- Use a reviewed forward migration for schema/data repair; never reverse a
  shared production migration destructively without the database recovery plan.
- Restore provider credentials only after their scope and destination have been
  independently verified.

## Return to a launchable state

1. Resolve the incident and confirm every affected kill, provider, deployment,
   model, data, notification, and active-run path has a named owner.
2. A `super_admin` selects **Clear emergency (keep release off)**. Verify release
   remains off and master/active-run switches remain engaged.
3. Deliberately clear only the restrictions approved for a new launch review.
4. Generate a new target-bound manifest and repeat the full
   [Eve launch runbook](./eve-launch.md). A prior manifest, review, activation,
   or canary never self-resumes Eve.
