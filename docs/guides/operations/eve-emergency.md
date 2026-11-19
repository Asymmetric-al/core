# Eve emergency and rollback runbook

Emergency-off always outranks a passing launch manifest and the release switch.
Any verified admin may engage it from Mission Control. Clearing it requires a
`super_admin`, keeps release off, and leaves the master and active-run switches
engaged until operators deliberately clear them through the existing governance
controls.

A planned, non-incident stop is a different control: a `super_admin` selects
**Disable release (no emergency)** to turn `release_enabled` off and roll back
any active launch record without engaging emergency state or the master and
active-run switches. Use **Emergency off** whenever an incident is suspected.

## Who can act until WP2c

Since WP2a (AL-2675) no request carries the `super_admin` role: a person acts
under a membership row, and a flagged staff row is a tenant administrator.
The platform owner's controls come back with WP2c's operator list. Until then:

- **A tenant administrator** engages **Emergency off**, places and clears
  retention holds, and reads the governance state, notification settings and
  their own tenant's audit history. A tenant administrator is a person with a
  live staff row carrying the administrator flag in that tenant, whatever
  their profile's role or tenant column says: the SQL behind these controls
  checks that row, as the application does (council round 2 on WP2a, R1;
  `20261118093000_eve_actor_checks_read_membership.sql`). A staff row without
  the flag, a revoked row, or a row in another tenant is refused.
- **Notification recipients** are the people with a stored, enabled setting
  for the tenant who now hold such a row there. Every stored setting was
  written for a `super_admin` profile, the only kind the recipient trigger
  admits. Nobody can be added until WP2c: the recipient change is closed, and
  the trigger still admits only a `super_admin` profile.
- **Nobody** clears emergency-off, selects **Disable release (no emergency)**,
  changes a kill switch, pauses or re-points a notification channel, changes a
  recipient, grants a launch permission or runs global retention expiry. The
  model policy changes only for a holder of an Eve AI settings grant.

So an emergency-off engaged now stays engaged, with release off and the
`all_automation` and `active_runs` switches on, until WP2c. Every gate is
listed in section 6, item 2, and every SQL check of an actor in section 7 of
`docs/audits/core-crm-cms-database-proofs/wp2a-membership-decision-table.md`.

## Immediate response

1. Open **Eve Operations → Launch readiness**, enter a concise non-sensitive
   incident reason, and select **Emergency off**. Do not wait for a diagnosis.
2. Confirm `release_enabled=false`, `emergency_off=true`, and the
   `all_automation` and `active_runs` switches are engaged. The transition rolls
   back any active launch record and is permanently audited.
3. Pause both notification channels if delivery itself is implicated. Disable
   the relevant GitHub, production-write, sandbox-network, dynamic-workflow, or
   model-policy kill switch as needed; more restrictive controls remain valid.
   Until WP2c nobody can pause a channel or change a kill switch: emergency-off
   has already engaged the master and active-run switches, and a channel whose
   delivery is implicated is stopped by revoking its credential at the
   provider, as below.
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
   remains off and master/active-run switches remain engaged. Until WP2c nobody
   holds that role, so this step and those after it wait for WP2c.
3. Deliberately clear only the restrictions approved for a new launch review.
4. Generate a new target-bound manifest and repeat the full
   [Eve launch runbook](./eve-launch.md). A prior manifest, review, activation,
   or canary never self-resumes Eve.
