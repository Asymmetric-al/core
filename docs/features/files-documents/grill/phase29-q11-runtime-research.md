# Phase29 Q11 — when the finite unfinished-access clock is established

20 October 2026. Source-grounded research after the parent's report that Conrad ratified Q10 A and its complete amendments. Repository: `/home/conrad/code/core`, last verified HEAD `3d85897ebf1515008ef5c676b1c58a15422fb9ab`. No Q11 option, initial number, extension/recovery power or implementation is selected by this note.

Read-only source/manifests and public official documentation. No private rows, credentials, provider calls, runtime configuration or product edits. No tests were needed or run for this next-question research. Only this research document was written.

## Recommendation

Ask when the **unfinished-stage end** is established:

> **Should the request's finite unfinished-access end be fixed when the source first makes access available, or should a finite working period begin on the recipient's first qualified entry, with a separately finite deadline for entering?**

Recommend **A — Resolve the finite unfinished-access end at the original source issuance.** The source makes its original recipient-purpose access available under the admitted policy; draft creation, template preparation, SMTP/API acceptance, delivered/opened/clicked events, generic sign-in and later reissue do not define that source act.

This need not select “N days after issuance.” It selects establishment of the end at issuance. The later calculation could use an approved finite source profile or already-governing program terms. Its formula, count, temporal arithmetic and editing authority remain explicit later decisions. No mandatory date picker or invented requested-by date follows.

The strongest delayed-entry alternative is **B — A finite latest-entry window, then one finite first-qualified-entry working interval**. The parent reports that source-owner review confirmed its prospective compatibility with Q10 under the explicit semantics below; B is still an unselected founder alternative. It can preserve working time for someone who legitimately enters later. It adds an unstarted/started state, a second finite rule, concurrent-entry recovery and more complicated terms.

The important tradeoff is real: A can consume useful time during delivery delay, recipient absence and staff review. B can lengthen the unfinished lifecycle and still needs usable staff-review time before its resulting end. There are no measured Asym invitation-open, connectivity or review-time distributions supporting an optimal policy. Simplicity supports A; measurements could justify B.

## Do not repeat Q10's scope mistake

Q10 A is now settled. The initial boundary under either clock design is the finite **unfinished-stage** boundary. Eligible normal fulfillment while it remains valid transitions into the already-declared Q07 completed policy; independent genuine overall/purpose/security caps still bind. This is not a single cap on both stages.

An unused-entry deadline or outer unfinished bound must retain its actual declared scope. It must not silently become a completed-read cutoff merely because it is absolute, was fixed at issuance or lives in a field named `expires_at`. Conversely, a true overall cap cannot be relabeled as an unused-entry or unfinished-only deadline.

Q10's after-wait source occurrence, durable outcome, current authorization, no-revival and stale-expiry fencing remain mandatory. Q11 does not change the 720-hour completed maximum or permit late actual fulfillment to revive ended unfinished authority.

## B has two different coherent meanings

Do not use “finite outer/unused limit” as if it names one rule:

| B variant                                                           | Exact meaning                                                                                                                                                                                                             | User consequence                                                                                                                                                          |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Finite latest entry, then a finite working interval**             | The recipient must first qualify before a declared latest-entry instant. Successful entry resolves one finite working end. That working end can be later than the latest-entry instant, subject to independent true caps. | A person entering just before the latest-entry deadline can still receive the declared working interval. Unused eligibility and eventual working access are both bounded. |
| **First-entry interval clipped by a hard unfinished-stage ceiling** | First entry resolves a working end no later than an already-declared absolute unfinished ceiling.                                                                                                                         | A late entrant can have very little working time; this is not a guarantee of the full interval.                                                                           |

Both can be finite. The first need not be indefinite: a finite latest-entry instant plus a bounded finite working interval yields a finite maximum unfinished end. The second is tighter but sacrifices some of B's benefit. Neither unfinished bound automatically survives into a valid completed stage under Q10.

For the concrete A/B founder question, use the first as the now-owner-reconciled B and state that behavior openly. The clipped variant remains a comparator, not a second recommended B or an unnoticed implementation fallback. Do not silently choose between them in a formula after the answer. No numerical value is proposed for either limit.

Neither option establishes new role/extension authority. Declaring a prospective conditional first-entry rule is different from a staff member resetting an admitted end later.

### Resolved owner reconciliation for B

Q10-C02 requires a finite applicable unfinished end and exact authority before activation; C04 preserves the scope of every limit and prohibits restoring a longer end by removing a genuine shortening cause. B cannot evade either clause.

The parent's independent owner review confirmed a compatible prospective model: finite latest-entry boundary `L` applies to the not-yet-entered state; first qualified entry at `T < L` resolves one finite working end `U`. At or after `L`, no new first-entry activation is admitted. Both rules and their scope are declared before admission. The later `U` is the consequence of the original conditional policy, not removal or relabeling of an unconditional cap.

Precisely identified pre-entry authority and current Q01 proof still control each operation. At qualified first entry, `U` is resolved before protected work is admitted. Every true source cap and binding genuine shortening remains effective; no policy edit or removal of an adverse state causes this conditional transition. If existing authority was admitted with an unconditional unfinished end, B cannot reinterpret it as activation-only or automatically extend it. Unknown old limit semantics stay closed pending actual owner resolution.

Owner review also confirms that pre-entry fulfillment at `F < L` can satisfy Q10 when the governing source actually permits normal fulfillment and all required historical recipient/policy eligibility is proved. A later visit cannot start an unfinished period on the completed request. No open browser becomes a universal prerequisite, and no unconfirmed or never-admitted recipient is assumed eligible. Missing proof cannot be replaced by a planned future entry.

This resolves compatibility/framing for the founder's choice. It does not select B, any number, a new recovery right, an actual command/schema or runtime qualification.

## What the machine actually implements

All paths below are relative to `/home/conrad/code/core`.

| Inspected seam              | Exact references                                                                        | Current behavior and Q11 relevance                                                                                                                                                                                                                                                                                       |
| --------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Account callback            | `packages/api/src/auth/callback.ts:6–17,28–59`                                          | GET exchanges a Supabase PKCE code, gets the user/profile role, then role-redirects or uses sanitized `next`. It sets private/no-store callback headers. No exact request-purpose/recipient issuance or first-entry effect is established here. Do not hook the business clock to a generic successful account callback. |
| Shared callback routes      | `apps/admin/app/auth/callback/route.ts:1`; corresponding donor and missionary paths`:1` | All re-export the account callback. That reuse does not qualify a request-only entry or tenant-host authority boundary.                                                                                                                                                                                                  |
| Return-path sanitizer       | `packages/auth/demo-login.ts:39–70`                                                     | Enforces a same-origin relative path and blocks certain auth loops; returns path/query/hash. Useful local redirect hygiene. It does not freeze the source's authoritative tenant host or authorize forwarding a protected fragment.                                                                                      |
| Account password login      | `packages/ui/components/auth/LoginScreen.tsx:142–170`                                   | Browser `signInWithPassword` then route replacement/refresh. No native entry identity is recorded. Account login is not an unfinished clock trigger or donor membership entitlement.                                                                                                                                     |
| General registration        | `packages/ui/components/auth/RegisterScreen.tsx:60–103`                                 | Enabled signup records account metadata and can wait for email verification. This is not the Q01 request-only confirmation flow, nor authority to enroll a request recipient.                                                                                                                                            |
| Auth configuration examples | `supabase/config.toml:151–161,208–211,248–253`                                          | Local JWT/OTP values and refresh reuse, plus commented session-timebox examples. These are unrelated authentication mechanisms; hosted configuration was not queried. They do not choose the initial request period.                                                                                                     |
| Email test-send bookkeeping | `packages/api/src/email/template-test-send.ts:254–288`                                  | Calls the mail adapter, then logs `requested_at`/`sent_at` with current application time. The log is not source issuance and does not establish recipient receipt or entry. This path is explicitly test-send, not native invitation production.                                                                         |
| Provider-event handling     | `packages/api/src/email/webhooks/resend.ts:639–646,688–710,737–751`                     | Resolves event IDs/tenant, persists provider event time and updates send-log state/time. A provider `occurred_at` or changed `sent_at` is not the source's original access admission/activation occurrence.                                                                                                              |
| Inbound fallback time       | `packages/api/src/workflows/adapters/inbound-email.ts:410–426`                          | Conversation routing falls back from missing `received_at` to current time. This is a separate integration convention and must not manufacture a historical source issuance/first-entry time.                                                                                                                            |
| Work dispatch/recovery      | `packages/api/src/workflows/ledger.ts:117–175,279–328`; `recovery.ts:47–69,114–139`     | Durable transport identity and recovery are useful. Reused dispatch key/source envelope does not prove native immutable issuance/entry terms; its handoff time must not start or reset a recipient period.                                                                                                               |
| Server lease clock          | `supabase/migrations/20260611181000_workflow_work_claims.sql:47–99`                     | Finite work claim with `NOW()` and stale-claim handling. A runner lease is not recipient authority; its timestamp convention is not a qualified after-wait source clock.                                                                                                                                                 |
| Source decision with wait   | `supabase/migrations/20260718015747_eve_approval_budget_policy.sql:565–568`             | Locks an approval then compares expiry to transaction-start `NOW()`. This is a concrete copying hazard for issuance/entry boundaries crossing a wait, not native behavior or a demonstrated hosted incident.                                                                                                             |

Bounded searches of `packages` and `apps` TS/TSX found no calls to `signInWithOtp`, `verifyOtp`, `generateLink`, `inviteUserByEmail`, `resetPasswordForEmail`, or `token_hash`. Searches of `packages/api/src`, `packages/auth` and migrations for protected-action/verifier/selector/first-entry/issuance terms reached unrelated qualification and E2E helpers rather than a qualified private-request issuance/activation implementation. This is evidence of the inspected gap, not an exhaustive proof that no differently named seam exists anywhere.

Manifest and installed-package checks agree on `@supabase/ssr 0.12.7`, `@supabase/supabase-js 2.117.3`, and `resend 6.32.1`; auth/database manifests pin Next `16.4.0`. These packages provide technical capabilities, not the missing source policy. No new SDK option, installation or dependency change is proposed.

## Owner contracts constrain both clocks

`docs/adr/0025-producer-owned-protected-actions.md:28–43` assigns purpose, tenant, recipient/resource, issuance, credential, expiry, redemption, completion and audit to the producing source. The doorway's host comes from the authoritative frozen tenant binding, not request/forwarded host, template content or a return URL.

Its GET/HEAD/scanner rules are explicit (`:45–72`): no business effect, grant consumption, session creation or proof of identity/human intent; fragment handling is constrained and not automatically submitted. Deliberate POST re-proves source/resource/recipient/issuance/state/current authority/expiry/revocation/replay and separately required assurance (`:74–92`). Therefore:

- A browser loading a landing page cannot start B.
- A successful bare verifier exchange is not automatically sufficient to prove the named recipient or all Q01 conditions.
- B must use the qualified source entry after the required proof/current checks; it must not add a gratuitous second “start timer” ceremony.
- Already-valid compatible proof can be reused only under the actual source contract. It does not convert general sign-in or role membership into a request entitlement.

`docs/adr/0037-scanner-safe-exact-artifact-access.md:45–67` explicitly warns that advanced scanners may execute JavaScript or submit forms, so “POST happened” is not a universal human-presence test. Its exact official-document checks and bounded replacement overlap are owned by that purpose. The fourteen-day guest grant/thirty-minute document session at `:83–88` are not this request's defaults.

Workflow's suggested fourteen-day external-task expiry remains an existing proposal to reconcile (`docs/prds/workflow-studio/01-product-and-experience.md:65–69`), not the answer to Q11. Q01 and current owner contracts prohibit using invitations as donor/staff enrollment.

## Issuance, reissue and delivery failure

For A, “issuance” should mean the source-controlled durable act first making this exact recipient/purpose access available under its complete admitted policy. It is not draft creation, a queue insertion, a provider timestamp or every new credential.

Once committed, reconstruct the same issuance/end after a lost reply or crash. If the source issuance rolled back, no original clock has been established merely because a worker attempted a send. If access was validly issued but notification delivery failed or remains unknown, record those separate outcomes; A's already-admitted clock does not silently pause or restart. Cohort usefulness and any separately approved recovery must handle that cost honestly.

Replacement or reissue has at least three distinct meanings:

1. Retry delivery of the same prepared action/message.
2. Replace an entry credential while preserving the same source authority.
3. Deliberately authorize a new or changed source permission.

Only the third could change authority, and Q11 does not grant that capability. ADR-0025`:45–50` requires a new communication/prepared-message identity for a newly issued credential; this does not make it a new underlying access period. Preserve original issuance/activation identity across resends and credential replacement. Do not inherit Phase18's exact overlap policy without its owner mapping.

Do not let a worker “reissue” because its transport dedupe key expired, an old token was already consumed, a response was lost, or delivery was delayed. Resolve the same source effect and current permission first; no automatic raw email-attachment workaround.

## Qualified first-entry edge cases

If B is selected later, its precise source command must handle these conditions before activation:

- Wrong recipient, failed/unfinished proof, revoked/expired source, invalid host/context or unsafe return target must not create activation.
- Concurrent tabs/devices, duplicate POSTs and response-loss retries converge on one original entry occurrence and terms. A later login/return does not slide it.
- Evaluate current clock and source/recipient state after relevant waits; preserve Q10's distinction between qualified source occurrence and physical database commit. An old transaction-start time cannot rescue expired unused-entry eligibility.
- A trusted previous qualifying entry whose reply/projection was lost is recovered using its original terms. Unknown evidence does not mean “never activated” followed by a new working interval.
- Both unused eligibility and working access are finite. An unvisited request does not remain activatable forever. Unknown clock values cannot be defaulted from the provider/session.
- Entry after normal fulfillment cannot start a new unfinished period or restart Q07. A source that can normally fulfill before first recipient entry needs a finite declared pre-entry state and Q10 eligibility proof; it may not wait indefinitely for future entry to invent the completed anchor.
- Initial entry must not accidentally become an extra universal Q10 prerequisite merely because B is chosen. No open browser is required for otherwise qualified source fulfillment. The source must resolve what its eligible pre-entry state means; this does not assert that a recipient lacking required prior source admission or confirmation is eligible.
- An initial-entry deadline and any true overall source cap must be distinguished. An entry that qualifies just before an activation-only deadline may have a later working end under the explicitly chosen variant; a genuine overall cap still constrains actual access.

These are model/qualification dependencies, not newly implemented tests or a second authentication system.

## Other possible anchors

| Candidate                                                          | Judgment                                                                                                                                                                                                                  |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source issuance establishing a fixed end                           | Recommended; exact source act and formula still need qualification. Fewer states and no activity-dependent reset.                                                                                                         |
| First qualified entry with separately finite waiting/working rules | Strongest realistic alternative where delayed entry matters enough. State the limit scopes precisely.                                                                                                                     |
| Provider sent/delivered timestamp                                  | Weak default: provider acceptance/recipient mail-server delivery is neither source authority nor named-recipient entry; delayed/missing/duplicate events also complicate outcomes.                                        |
| Open/click tracking                                                | Not a protected proof or source command, and inappropriate for the owner scanner/privacy contract.                                                                                                                        |
| First upload or first accepted file                                | Delays the clock until after useful protected operations; leaves pre-upload access needing a separate finite rule and disadvantages sources that can fulfill without a new file. Not a stronger simple default.           |
| Approved program/business date                                     | Can be part of A's later fixed-end calculation when the actual source owns it. Not necessarily a mutually exclusive third timing architecture.                                                                            |
| Requested-by date plus a buffer                                    | A later prospective formula, not already authorized by Q09. Requires missing/distant/changed-date handling and no silent permission edit. No buffer is chosen.                                                            |
| Last activity/inactivity reset                                     | A finite interval at each refresh can still extend the overall lifecycle indefinitely without another bound. More states and undefined activity; no demonstrated requirement justifies it as the ordinary recommendation. |

## Current official platform evidence

- [Supabase email templates](https://supabase.com/docs/guides/auth/auth-email-templates) documents confirmation links consumed by email prefetch and warns about link rewriting by tracking. That validates the scanner/transport concern; its generic workaround examples do not override Core's fixed fragment/POST owner contract.
- [Supabase PKCE flow](https://supabase.com/docs/guides/auth/sessions/pkce-flow) describes the local verifier and same-browser/device exchange constraint. Thus generic account-code success/failure is a technical proof-flow event, not a complete source entry; do not label its failure as request expiry. No experimental overlapping-flow option is adopted.
- [Resend event types](https://resend.com/docs/webhooks/event-types) distinguishes successful send API requests from delivery to the recipient's mail server. Neither proves the recipient entered the request.
- [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys) currently retains provider send keys for 24 hours. Source issuance/entry identity must survive independently; that provider window is not a source permission or renewal rule.
- [PostgreSQL 17 time functions](https://www.postgresql.org/docs/17/functions-datetime.html) distinguish transaction-start, statement-start and current wall time. This supplies clock semantics for qualification, not an initial duration or a physical-commit timestamp recipe.

These sources were checked for mechanisms and limitations, not to select a competitor's initial period or make a universal best-practice claim.

## Suggested next-question boundaries

Present A and the owner-reconciled **latest-entry window plus first-qualified-entry working interval** as the single recommended B, with A recommended overall. Keep the question about original unfinished-end establishment, after Q10's scope decision. Explain that A can lose time before recipient entry, while B adds a bounded waiting state and deferred working end. Do not silently replace B with the hard outer unfinished-ceiling variant.

Leave numbers, elapsed-versus-civil arithmetic for the initial period, who may change terms, exact activation/recovery command, reminder cadence, delivery fallback and Q08 fresh-read settings open. Neither an answer nor this research enables the native lane. Its complete finite policy, source ownership, proof/currentness, durable history and usable recipient/staff journey remain activation requirements.
