# D2 sharing and optional notification: focused PostgreSQL evidence

The final disposable PostgreSQL 17.11 run passed **43/43 expected outcomes** on
October 15, 2026, America/Los_Angeles (October 16 UTC). This includes deliberately
unsafe counterexamples, expected SQL errors and one actual two-session race.
It is not a Core implementation, migration, specification, notification producer
or qualification of Supabase/Auth/Data API/provider behavior.

## Why this probe

The founder chose generally staff-visible contact sharing with an optional
notification to **chosen staff**, not an all-staff broadcast. The notification
picker changes attention recipients, not the shared contact's access audience.
The narrow mechanical questions are whether source acceptance can keep its
required audit and optional durable notification request together, and whether
retries/worker failures can create contradictory source or notification truth.

The owning contracts were read before choosing the experiment:

- `docs/adr/0027-one-notification-presentation-and-engagement-model.md`, opening
  decision through the D31 clarification: source state, notification availability
  and personal engagement remain separate. Information is not a task or business
  completion. Access loss removes presentation; retries cannot revive old items.
- `docs/adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md`, source
  transaction/projection contract at lines 630–646: durable identifier-only
  intent accompanies the source transaction; projections reconcile later through
  qualified existing owners and database identities.
- Current `packages/api/src/missionary-portal/donor.ts`, activity command at
  lines 120–146: legacy access check followed by activity insertion; this is not
  a D2 share or notification producer.
- Current contribution notification store, `logContributionNotificationEvent`,
  and Eve notification store's create/claim/complete functions plus their
  `20260718093000_eve_email_discord_notifications.sql` tables/functions: existing
  scoped examples of dedupe and claim-token handling. Those finance/Eve records,
  recipient rules and provider-oriented statuses cannot be adopted as D2 source
  meaning. Their presence is not qualification of the shared P6/P17 contract.

[sources.json](sources.json) records file hashes and the relevant primary
PostgreSQL source references. D1's passing RLS/identity mechanics were not rerun.

## Results

| Hypothesis                                                                                        | Observed result                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Source share, required audit and optional durable source notification request can commit together | Off accepted one share and receipt with no request. On accepted a share and pending request. Injected required-audit failure, failure before request insertion, and failure after request/receipt all rolled the transaction back. Recovery accepted one result. Every accepted share had exactly one audit row.         |
| Source-semantic identity can survive two browser keys                                             | Two actual `sharer` sessions used different keys for the same source/reviewed revision and selection. The second observed `Lock:transactionid` while the first held acceptance open. Both returned share ID 6; final state was one share, one notification request and two command receipts.                             |
| Changed retry meaning must not add surprise notification                                          | Exact replay recovered the accepted share. Changing Off to On conflicted (`22023`) both under the same command key and under a new key for the already-accepted transition; the Off transition remained Off with no request. This does not decide whether a future separate deliberate “notify now” action should exist. |
| Chosen recipient set is part of command meaning                                                   | Duplicate/reordered recipient IDs normalized to the same sorted set. Reordered exact retry returned the same share. A different set conflicted under either the same key or a new key for the same accepted transition. On with no selected staff rejected. There is no default staff recipient or broadcast fallback.   |
| Claiming work is not availability/readership                                                      | Claim returned one and left no local item. Another claim returned zero. Stale claim token could not materialize after recovery. The final local item was available with `read_at` and `archived_at` still null. No email/provider or personal reading was inferred.                                                      |
| Projector failure cannot undo accepted sharing                                                    | An injected failure after inserting a local item rolled back that item while preserving the already-committed share and pending worker responsibility. Recording failure and retrying the same source request created one item. The projector role could not mutate source rows.                                         |
| Claimed status needs matching evidence                                                            | Local processing rejected `delivered` as a status (`23514`). `materialized` without its actual local item failed its FK (`23503`). Completed/stale claim replay failed instead of duplicating an item. These are toy processing labels, not proposed product status vocabulary.                                          |
| Current recipient ineligibility does not widen the set or reverse sharing                         | The selected synthetic recipient became ineligible before projection. Processing stopped with no replacement recipient/item; the accepted share remained true. This tests a point check, not the full revoke-versus-admission race or real recipient qualification.                                                      |
| Scoped relational constraints reject obvious contradictions                                       | Composite Tenant/share FK rejected a cross-tenant intent; the exact source-purpose unique identity rejected a duplicate. Full source ownership and authorization remain unproved.                                                                                                                                        |
| Split writes and browser-key-only dedupe are insufficient                                         | The unsafe fixture committed source sharing, then failed before separate notification insertion: share remained true with no durable request. Another unsafe fixture accepted two notices for the same source under different browser keys. These are synthetic counterexamples, not reported Core vulnerabilities.      |

All query text, acting SQL roles, expected results/errors, actual results and the
concurrent sent/received transcript are in [results.json](results.json).
[roles.json](roles.json) confirms `sharer` and `projector` are non-superusers,
non-BYPASSRLS roles. PostgreSQL waited on an observed lock before the harness
released the first transaction; the concurrency claim does not rely on a sleep.

## Scoped engineering recommendation

Qualify one existing-owner source acceptance boundary for the selected sharing
facts/revision and audience. It should commit its required audit, durable receipt
and, when chosen, a **durable source notification request** together. This does
not require full P6/P17 materialization or provider delivery in that transaction.
If required local intent cannot persist, do not claim that combined acceptance
succeeded; if later projection fails, keep the truthful accepted share and an
independently recoverable notification result.

Bind the exact semantic input to recovery: source identity, relevant reviewed
revision, share meaning, notification On/Off, normalized chosen recipient IDs,
purpose and any qualified destination/surface scope. Identical commands recover
the same currently permitted receipt. A new random retry key must not create
another share transition or another notice. Changing the selection is new intent,
not permission to reinterpret the already-accepted command. The final service
must distinguish current source state from historical acceptance and authorize
receipt recovery anew; this fixture does not implement those later owner rules.

Use tenant-complete composite references and source-owned permanent uniqueness
at the admitted semantic grain. A notification-request identifier must point
back to that exact source transition/purpose; it must not be an email address,
worker run ID, random UI key or provider ID. The worker envelope should carry
only the opaque source/request identifiers needed to resolve approved chosen
recipients and minimized presentation under current authority. The synthetic
request stores only ID tokens and processing metadata, never contact details,
private notes or a copied payload. It cannot grant source access.

P6/P17 retain downstream delivery intent, plans, applicability, presentation,
availability/engagement and recovery ownership. Do not add a second task queue,
notification platform, transport, scheduled broadcast or automatic external send.
The existing exact producer and its contract must be identified and qualified;
neither this experiment nor the scoped Eve/finance examples supplies it.

## Reproduction, custody and limits

- [setup.sql](setup.sql) and [run.py](run.py) are disposable mechanics; the runner
  imports only D1's preserved subprocess/assertion/concurrency harness. Its hash
  is included in the final result alongside both new source hashes.
- The final run used image
  `postgres@sha256:2d2b8998d31037bf721cfdf764d76ba74171b4fab3431b7f72c27c56ddbdf9e3`,
  container `phase28-d2-pg`, `--rm --network none`, no published ports and no
  application mounts. [environment.json](environment.json) captures version and
  mounts. Trust authentication existed only inside this isolated synthetic DB.
- On a new empty container with that exact name/digest, wait for `pg_isready`,
  then run `PYTHONDONTWRITEBYTECODE=1 python run.py`. Stop that exact container
  afterward, including after a failed run. The final run's container and
  anonymous data volume were removed; [cleanup.json](cleanup.json) verifies
  absence. No hosted database, real contact, message or provider was used.
- The schema is intentionally **not** a proposed production schema: source
  rows and grants are simplified, tenant is fixed to 1, authorization is not a
  real PDP, source reviewed revisions are synthetic, and fault arguments are
  harness-only injection points. Direct fixture grants are not a recommended
  application access model.
- Recipient-set normalization/retry binding was tested with multiple IDs, but
  materialization was deliberately limited to one selected recipient. Multi-
  recipient fanout, partial outcomes, source disappearance, policy/version
  changes, concurrent recipient revocation, claim expiry, process death,
  re-sharing/new generation, migration/restore and retention were not qualified.
  The local prototype rejects multi-recipient materialization rather than
  claiming full availability from one child.
- No current-authority admission, Supabase Auth/PostgREST, Core services/RLS,
  disclosed-field selection, private-note exclusion, hidden-match behavior,
  UI accessibility, performance or provider-send qualification is claimed.
  The 43 passing expectations establish the stated mechanics only.
