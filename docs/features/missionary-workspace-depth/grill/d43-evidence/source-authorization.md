# D43 — Source, authorization, and concurrency evidence

Reviewed 2026-10-18 against Core HEAD
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`. This is fresh documentary
research for Q43 A: an already accepted pending newsletter signup can finish
after its originating Page signup entry is turned Off, within its original
deadline and current rules. It does not change application code, migrations,
live configuration, formal OpenSpec state, or earlier evidence. No earlier
model, verifier, or other program was executed or imported.

**Disposition: Accept with required amendments.** The simple behavior is sound
when Off means stopping new intake from that exact entry. Its permanent
implementation must distinguish the accepted operational occurrence from the
Page's current presentation. This note's SA-C and SA-P identifiers are local
research references for the parent review, not newly ratified requirements.

## Governing evidence and current implementation

These are repository facts, not claims about hosted configuration or a working
native signup feature.

| Evidence                                                                                                                                                                                                                                                 | What was verified                                                                                                                                                                                                             | Consequence for D43                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ADR0170](../../../../adr/0170-purpose-bounded-public-form-definitions-and-domain-owned-routing.md:89) and [public-form OpenSpec](../../../../../openspec/changes/add-web-studio-cms/specs/web-studio-cms/spec.md:1017)                                  | The public server boundary derives current scope, validates the released definition, and atomically records occurrence, owner work, child intents, and dispatch requests before reporting acceptance.                         | A rendered form, queued HTTP request, or separate preliminary record is insufficient evidence of accepted signup. Certification of the P28 adapter remains necessary.                                                                           |
| [D6 C03–C07](../phase28-d6-adversarial-review.md:330), [D7 C12](../phase28-d7-adversarial-review.md:499), and [D42 ratification scope](../d42-evidence/ratification-scope.md:40)                                                                         | Page-entry Off, purpose closure, withdrawal, suppression, and delivery have distinct meanings. Q43 addresses D6-C07's remaining pending-after-Off choice. D6's proposed numeric proof and retention periods remain unadopted. | Do not expand Q43 A into blanket adoption of D6, a finite duration, retention schedule, global send stop, or new confirmation mechanism.                                                                                                        |
| [Public request context](../../../../../packages/api/src/cms/public/context.ts:11) and [reader contract](../../../../../packages/api/src/cms/public/reader.ts:9)                                                                                         | Current interfaces describe tenant-scoped published-content reading; the Site seam is still nullable in this source.                                                                                                          | A CMS read result does not authorize operational signup, confirmation, or subscriber access.                                                                                                                                                    |
| [Current CMS resolver](../../../../../apps/admin/src/cms/public/resolve-tenant.ts:22)                                                                                                                                                                    | `toPublicRequestContext` assigns `String(tenant.id)` to the operational tenant ID. The request resolver uses host/forwarded-host and slug lookup; preview/development selectors exist.                                        | Qualify the real CMS-to-operational tenant mapping and trusted ingress host boundary before reusing this helper for writes. No deployed exploit or host configuration is established by this read.                                              |
| [Public page reader](../../../../../apps/admin/src/cms/public/published-content-reader.ts:199)                                                                                                                                                           | A missing/unpublished Page returns a public read failure, and active tenant summary is checked separately.                                                                                                                    | Confirmation cannot require the origin Page still to render; use its accepted source binding and current safety authority. Do not expose unpublished Page content to achieve this.                                                              |
| [Consent helper](../../../../../packages/api/src/email/consent.ts:178)                                                                                                                                                                                   | It reads donor contact restrictions and tenant/address suppressions, defaults unknown message type to marketing, and can return allowed without positive subscription evidence.                                               | This is a negative safety floor, not newsletter membership or confirmation authority. D43 needs positive exact-purpose evidence in addition to applicable restrictions.                                                                         |
| [Suppression schema](../../../../../supabase/migrations/20260402090000_resend_email_foundation_backfill.sql:86) and [effective later grants](../../../../../supabase/migrations/20260426100000_resend_email_rls_grants.sql:1)                            | Suppressions are tenant/address/type rows, with an optional group relationship; later SQL enables RLS, revokes browser roles, and grants service-role access.                                                                 | Existing rows are not an exact-newsletter membership ledger. An earlier RLS-disabled foundation is not evidence of current public exposure. Hosted effective grants were not inspected.                                                         |
| [Dispatch ledger helper](../../../../../packages/api/src/workflows/ledger.ts:117) and [ledger SQL](../../../../../supabase/migrations/20260611134500_workflow_dispatch_ledger.sql:7)                                                                     | The helper makes a separate upsert, deduplicated by tenant and product key. It does not atomically commit a caller's separately written source occurrence.                                                                    | Reuse the shared ledger, but create the required source and dispatch records in the same source transaction. Calling this helper after a separate pending insert leaves the crash gap ADR0170 forbids.                                          |
| [Dispatch adapter](../../../../../packages/api/src/workflows/dispatch.ts:16), [work claims](../../../../../supabase/migrations/20260611181000_workflow_work_claims.sql:1), and [recovery scan](../../../../../packages/api/src/workflows/recovery.ts:47) | Handoff deduplication and work claims are distinct from product outcome idempotency; recovery repairs stored handoffs.                                                                                                        | A worker lease, provider request key, or retry cannot grant current confirmation authority or create a new human signup.                                                                                                                        |
| [Workflow envelope](../../../../../packages/api/src/workflows/events.ts:69)                                                                                                                                                                              | The shared envelope carries identifiers and bounded context; it is not a newsletter-specific schema.                                                                                                                          | Keep email addresses, capability secrets, body content, and raw answers out of events. Key-name filtering alone does not prove arbitrary context values are safe.                                                                               |
| [Admin client](../../../../../packages/database/supabase/admin.ts:15) and [workspace auth context](../../../../../packages/auth/context.ts:240)                                                                                                          | Privileged calls use the server service credential. Workspace auth derives its tenant from profile/memberships and treats missing profiles as unauthenticated workspace context.                                              | Public signup/confirmation must derive the target organization independently. A legitimate reader does not need staff membership or a new Auth account. A service credential does not perform the product authorization checks for the command. |
| [Template test send](../../../../../packages/api/src/email/template-test-send.ts:228)                                                                                                                                                                    | This test-specific producer skips its consent lookup when the admin client is unavailable, then calls transport.                                                                                                              | Do not copy that tolerance into native confirmation or marketing dispatch. This is a reuse hazard, not proof that D43 currently sends improperly.                                                                                               |
| [Provider webhook](../../../../../packages/api/src/email/webhooks/resend.ts:712)                                                                                                                                                                         | Adverse events can add suppression evidence; send-log status changes are recorded separately.                                                                                                                                 | Delivered/opened/clicked is not confirmation, and delayed adverse evidence cannot be treated as a new positive grant.                                                                                                                           |

Fresh `rg` searches over `apps`, `packages`, and `supabase/migrations` for
newsletter, public-form definition, native pending confirmation, and related
symbols found presentation/mock newsletter references and existing email/CMS
machinery, but no certified P28 native newsletter intake/confirmation producer
or membership schema. This is a bounded source finding, not proof that no
similarly named code exists anywhere. The proposal is intended behavior, not a
currently verified feature. No production database, Auth configuration,
provider account, secrets, or live reader data was accessed.

## Primary technical research

- PostgreSQL documents that ordinary Read Committed queries can observe
  different snapshots. A preflight read followed by unrelated writes does not
  prove serial ordering of Off, acceptance, confirmation, and withdrawal.
  A narrow owner transaction needs appropriate locks/version guards or a
  correctly retried serializable design. This does not require making the
  entire platform serializable. [Transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html).
- PostgreSQL and Supabase explicitly distinguish checks on old rows from
  permitted new rows. If an applicable UPDATE/ALL policy omits `WITH CHECK`,
  its `USING` expression can supply the new-row check. The vendored Supabase
  skill's blanket claim that omitted text necessarily allows reassignment is
  incorrect; evaluate effective policies and grants. Denials may produce zero
  changed rows rather than an error. Service-role access and unsafe views
  need separate review. [PostgreSQL policy semantics](https://www.postgresql.org/docs/current/sql-createpolicy.html)
  and [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
- Supabase describes email security products prefetching links and consuming
  Auth confirmation links, and recommends an intermediate explicit action as
  one mitigation. This supports D6's inert GET requirement; it does not mean
  native newsletter confirmation should call Supabase Auth confirmation or
  create an account. [Email templates and prefetching](https://supabase.com/docs/guides/auth/auth-email-templates#email-prefetching).

These sources were opened on 2026-10-18. They establish technical semantics,
not evidence that any competitor implements exactly Q43 A or that a particular
confirmation lifetime is appropriate for Core.

## Material findings and exact amendments

Severity and likelihood are engineering judgments about an unguarded
implementation, not measured incident rates. Each finding narrows or clarifies
A; none requires a second tenant toggle or a new inbox.

### SA-F01 — “Already requested” could admit work after Off

**Severity: High. Likelihood: High** if the implementation trusts the rendered
form or a preflight Boolean. A stale tab, in-flight post, or delayed publication
can create an admission after staff believe intake stopped. The public-form
contract requires durable acceptance, and Read Committed alone does not order
independent source writes. **Impact:** clarifies the acceptance boundary.

**SA-C01:** “New intake SHALL prove current exact entry availability, released
purpose/target binding, scope, and authorization at the authoritative acceptance
boundary. Acceptance and entry-Off SHALL have one defined serial order. Work
ordered before Off may finish under the accepted-occurrence rules; work ordered
after Off SHALL create no new pending occurrence or confirmation intent through
that entry. A stale form or request-start time SHALL NOT qualify as acceptance.”

**Proof:** SA-P01–P03. Recovery of an already committed acceptance returns its
permitted receipt; it is not a new admission. A rolled-back acceptance has no
such exception.

### SA-F02 — Page binding becomes mutable confirmation authority

**Severity: Critical across tenants, otherwise High. Likelihood: Medium.**
Looking up the Page's current newsletter, slug, owner, or host can redirect an
old capability into a different subscription. Requiring the Page still to
render can instead strand legitimate pending readers. The current public
reader and placeholder operational tenant conversion are not write authority.
**Impact:** requires immutable accepted binding and trusted operational scope.

**SA-C02:** “An accepted occurrence and every capability/effect SHALL retain
the exact Tenant, environment, newsletter purpose, destination, source
occurrence, and relevant generation admitted at acceptance. Page edits,
retargeting, host changes, reuse of a slug, reassignment, or deletion SHALL NOT
rebind that occurrence. Confirmation SHALL use this binding and current
source-authorized safety, not require the originating Page entry to be visible.
Presentation removal alone SHALL NOT erase the accepted occurrence; loss or
closure of required operational authority SHALL fail closed without fallback.”

Do not promise old links work through a domain no longer controlled by Asym.
Use the qualified operational confirmation endpoint and trusted environment
binding. The exact public-safe target label must also satisfy current privacy
rules; an old label snapshot does not authorize newly restricted disclosure.
**Proof:** SA-P04–P06.

### SA-F03 — Recovery and re-opening silently renew permission

**Severity: High. Likelihood: High.** A resend, new HTTP key, Off→On cycle,
restored backup, or replay can accidentally extend a deadline, reactivate a
withdrawn request, or clear a restriction. D6 and D42 require the opposite.
**Impact:** preserves lifecycle meaning instead of adding grace periods.

**SA-C03:** “Read, retry, recovery, an approved resend, and entry Off→On SHALL
NOT extend the accepted occurrence's original deadline, change its target, or
revive expired, withdrawn, cancelled, or superseded authority. Expiry SHALL
apply at the server's authoritative confirmation decision instant, including
at the exact deadline. A fresh deliberate request through a currently eligible
entry is a distinct source occurrence; a transport key alone is not fresh
human intent.”

The new-intake command must check a source-qualified current generation, not
only a Boolean that has returned to On. Do not reuse a stale Page release to
undo newer Off. Requiring a fresh qualified interaction after an admission-
relevant generation changes is safer than silently submitting stale semantics.
No numeric duration is adopted here. **Proof:** SA-P03, SA-P07–P09.

### SA-F04 — Withdrawal loses a race to an old confirmation

**Severity: High. Likelihood: Medium.** An atomic insert into a unique membership
table is insufficient if the command reads withdrawal before it changes or
replays an older positive result as current consent. **Impact:** requires a
single exact-scope source ordering for competing intentions.

**SA-C04:** “Confirmation, withdrawal, and relevant source closure or
supersession SHALL order against the same exact-purpose/destination intent
authority. A later accepted negative decision SHALL fence older pending or
retried positive effects. A receipt for a historical success SHALL NOT claim
that the reader is currently subscribed. A later deliberate rejoin may act
only through the separately qualified current admission path.”

Current temporary restrictions remain governed by their owner. Clearing a
restriction does not itself confirm pending work or resurrect a terminal
occurrence. **Proof:** SA-P10–P12.

### SA-F05 — Accepted work is lost between source and dispatch

**Severity: High. Likelihood: Medium.** Separately writing pending state and
then using the existing ledger helper can leave a reader with an accepted
request but no recoverable confirmation work after a crash. Provider success
with a lost response can also cause duplicate mail. **Impact:** requires the
already-governed atomic source transaction and independent post-commit effects.

**SA-C05:** “Pending acceptance, required minimized evidence, the bounded
confirmation intent, and its required durable dispatch request SHALL commit
together or not at all. Confirmation SHALL atomically record membership effect,
proof, and result evidence. External transport SHALL occur only after commit.
Recovery SHALL reuse the same business effect and reconcile ambiguous provider
outcomes before any permitted resend; an outage SHALL NOT fabricate acceptance,
delivery, or completion.”

The shared dispatch ledger and executor remain reusable infrastructure. Their
claim IDs and finite deduplication windows do not replace durable source
idempotency. **Proof:** SA-P13–P15.

### SA-F06 — Off either cancels promised mail or becomes a send bypass

**Severity: High. Likelihood: Medium.** Filtering all queued confirmation work
through current Page visibility contradicts A. Ignoring current purpose,
destination, suppression, or usefulness rules permits unsafe or useless mail.
The current helper is a negative gate, and its transactional option does not
prove that a particular public-request message is authorized.
**Impact:** clarifies the admitted effect without creating a resend feature.

**SA-C06:** “Page-entry Off alone SHALL NOT cancel the already accepted
occurrence's qualified confirmation delivery or recovery. Before submission,
the communication owner SHALL re-prove its exact source, recipient, content,
safety, and last-useful validity. No unstarted confirmation effect SHALL be
submitted when confirmation can no longer validly finish. Existing approved
resend/recovery policy may operate only within that same original occurrence
and deadline; this decision grants no new public resend endpoint, reminder,
grace period, replacement signup, or suppression override.”

Once transport may have accepted an effect, do not promise recall. A delayed
email may arrive after expiry; its link must explain that completion is no
longer available without creating fresh permission. **Proof:** SA-P16–P18.

### SA-F07 — A link or credential grants too much

**Severity: High, Critical if it crosses tenants. Likelihood: Medium.** GET,
prefetch, or a shared token can accidentally activate membership; a convenient
workspace auth wrapper can demand an account or substitute the reader's home
tenant. A broad status endpoint can enumerate recipient history.
**Impact:** preserves the narrow anonymous confirmation path alongside D42.

**SA-C07:** “Only the deliberate confirmation mutation with the valid exact
capability SHALL consume pending proof. GET, HEAD, preview, prefetch, provider
delivery/open/click events, and mere sign-in SHALL not activate membership,
rotate proof, extend expiry, or send mail. This capability grants only its
bounded result and confirmation action, not login, CRM access, general
preferences, or subscriber listing. Public failures SHALL not reveal unrelated
recipient state. Cookie-based privileged entry mutations SHALL retain current
actor authorization and CSRF protection.”

Keep capability secrets out of logs, analytics, referrers, shared caches, and
workflow envelopes. The confirmation experience requires no Auth account;
account-email changes must not silently retarget an already accepted mailbox
occurrence. D42's current qualified Auth proof remains a distinct admission
route. **Proof:** SA-P19–P21.

### SA-F08 — Table safety is assumed rather than proved

**Severity: Critical for unauthorized access; High for corruption. Likelihood:
Medium.** Server-only credentials bypass row policies, while a foreign key to
an unscoped ID does not prove tenant agreement. Broad upserts can turn a
permitted pending row into forbidden active state or replace source attribution.
**Impact:** requires schema invariants and complete privileged-path tests.

**SA-C08:** “Operational records SHALL have trusted non-null scope and source
keys, structurally tenant-aware relationships, immutable admitted bindings,
and enforceable valid-state/deadline constraints. There SHALL be at most one
active membership for the same qualified Tenant/newsletter/destination scope,
with preserved separate admission and withdrawal evidence. Caller data SHALL
NOT set tenant, actor, owner, accepted time, confirmation time, deadline,
generation, approval, or audit attribution. Browser roles SHALL have no direct
intake, evidence, membership, or token-table write path. Every service command,
RPC, view, storage path, export, and realtime surface SHALL preserve the same
authorization and disclosure limits.”

Require safe address comparison under the owning normalization contract; do
not invent Gmail-style dot/plus merging or merge people because mailboxes are
shared. Constraints should prevent cross-tenant relationships and duplicate
active effects; an unproved pending address must not permanently reserve that
address against its legitimate reader. Examine effective `USING` and new-row
checks for each actual mutation, including upsert, and do not infer safety or
failure from the presence/absence of literal `WITH CHECK`. **Proof:** SA-P22–P24.

### SA-F09 — Deletion, retention, or rollback resurrects old grants

**Severity: High. Likelihood: Medium.** Cascading Page/Auth deletion or purging
replay evidence while delayed tokens/jobs still exist can lose accountability
or revive consent after restore. Keeping all private material forever is also
unacceptable. Q43 does not settle a numeric retention period.
**Impact:** makes retention and rollout qualification explicit prerequisites.

**SA-C09:** “The source owner SHALL distinguish short-lived capability material,
pending personal data, durable minimized business/withdrawal evidence, security
audit, and technical telemetry. Page-entry Off SHALL NOT erase operational
evidence or restart retention. Cleanup, migration, restore, and rollback SHALL
preserve expired/withdrawn/superseded fences and exact historical attribution;
unknown old evidence SHALL NOT be treated as a current grant. The separately
governed finite lifetime and retention policy SHALL be approved before launch.”

Do not require an eternal identifiable evidence row: qualify minimized
anti-replay evidence and reconciliation with all token, queue, provider, export,
and backup lifetimes under the privacy owner. Mixed-version producers must not
accept requests until their exact source/version contract is ready. Disable
new intake safely without disabling legitimate withdrawal. **Proof:** SA-P25.

## Required production-shaped proof

These are falsifiable acceptance tests to require when the producer exists.
They were **not run** in this documentation review. Check durable database
effects, actual command results, and communication intents; mocks alone do not
prove database isolation or provider outcomes.

| ID     | Scenario and required outcome                                                                                                                                                                                                                                  |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SA-P01 | Race Off and a first valid submission using two real database sessions. Both serial orders are exercised: accepted-before-Off retains one pending occurrence; Off-before-acceptance creates none through that entry.                                           |
| SA-P02 | Lose the accepted response, then turn Off and retry. Recover exactly the permitted original receipt and one original intent. A rolled-back/unaccepted operation gets no recovery exception.                                                                    |
| SA-P03 | Submit a stale form while Off, replay a stale publish candidate, and exercise Off→On with changed target/generation. None may restore an obsolete entry or admit stale semantics; a fresh currently qualified action works.                                    |
| SA-P04 | Accept, turn entry Off, then confirm deliberately before expiry. Confirmation succeeds without rendering the hidden Page or requiring login. Another independently eligible entry remains separately governed.                                                 |
| SA-P05 | Retarget/reassign/rename/remove the origin Page or reuse its slug after acceptance. Never subscribe to the replacement newsletter; retain original operational outcome when only presentation changed and current authority permits it.                        |
| SA-P06 | Change host mapping, environment, tenant, Site, purpose, occurrence ID, destination, or generation in a submitted request/capability. No cross-scope read, membership, intent, or informative enumeration is produced.                                         |
| SA-P07 | Confirm just before, exactly at, and after original expiry. At/after expiry produces no membership effect. Include lock waits spanning expiry and authoritative time after the wait; a stale transaction-start time must not enlarge the window.               |
| SA-P08 | Open, retry, recover, and use any already approved resend path after Off. Deadline/target remain identical, permitted message effects remain bounded, and expired work is never renewed.                                                                       |
| SA-P09 | Expire or supersede pending work, then reopen entry or restore old queue data. It stays terminal. Fresh human intake must prove its own current entry and consent authority.                                                                                   |
| SA-P10 | Race confirmation and exact-purpose withdrawal. Either confirmation precedes a later effective withdrawal, or withdrawal fences old confirmation. No final active membership can be produced by an older effect after the negative decision.                   |
| SA-P11 | Confirm, withdraw, then replay the original success request. Historical receipt is distinguishable from current membership; no new active row or welcome effect occurs.                                                                                        |
| SA-P12 | Race purpose closure/safety restriction with confirmation and dispatch, then later reopen/clear restrictions through their owner. Old terminal work does not revive, and clearing a restriction alone does not confirm pending work.                           |
| SA-P13 | Crash before commit, after commit but before HTTP response, and after commit before Inngest handoff. There is either no accepted source effect or a complete recoverable source/evidence/intent/dispatch set.                                                  |
| SA-P14 | Concurrently confirm from two devices and consume duplicate worker deliveries. One membership effect and one logical confirmation outcome result. Different transport keys cannot bypass domain idempotency.                                                   |
| SA-P15 | Lose the provider response after possible acceptance. Preserve unknown/accepted evidence and reconcile before any allowed retry; never report “email delivered” solely from queue or provider acceptance.                                                      |
| SA-P16 | Delay the original unsent confirmation until after Page-entry Off but before its useful deadline. It may proceed under current exact source/safety rules; it does not require the origin entry to be On.                                                       |
| SA-P17 | Delay it until after useful expiry, withdrawal, source closure, or applicable hard suppression. No unstarted effect is submitted; the pending occurrence is not replaced to get another send.                                                                  |
| SA-P18 | Deliver a previously submitted email after expiry. Its explicit action cannot activate or renew anything; the reader receives a calm exact permitted result and only genuinely available next steps.                                                           |
| SA-P19 | GET/HEAD, email-link scanning, preview, route prefetch, open/click webhooks, and repeated reads do not consume capability, activate, renew, or send. Explicit valid confirmation does.                                                                         |
| SA-P20 | Confirm signed out, in a different browser, and signed into an unrelated organization's workspace. The exact mailbox capability works without new account/staff membership; unrelated cookies do not retarget it.                                              |
| SA-P21 | Exercise expired/forged/wrong-scope capabilities, public status probes, shared cache, referrer/log/analytics capture, and changed destination parameters. No private recipient history, token, or suppressed address is disclosed.                             |
| SA-P22 | Use anon, normal authenticated reader, unrelated staff, tenant-A staff against tenant B, and service command callers with forged fields. Check direct SQL/API/table/RPC/view/storage/realtime paths. Zero-row denials must also prove rows remained unchanged. |
| SA-P23 | Attempt cross-tenant foreign keys, null bindings, invalid states/deadlines, attribution changes, pending→active upserts, and concurrent duplicate active memberships. Constraints/authoritative commands reject invalid outcomes.                              |
| SA-P24 | Use addresses with case, apostrophes, plus signs, underscores, non-ASCII supported forms, and shared mailboxes. Apply the existing owner contract consistently, with no wildcard lookup, identity merge, or unproved indefinite reservation.                   |
| SA-P25 | Run supported mixed-version rollout, cleanup, backup restore, and rollback after pending, confirmed, withdrawn, expired, and superseded records exist. Preserve fences/evidence; no legacy code silently broadens authority or requeues invalid effects.       |

## Minimal permanent implementation direction

1. Record A with the source-accepted boundary and scope distinctions above.
   Preserve the explicit unresolved finite proof/retention policy; do not
   substitute Auth OTP lifetime, provider deduplication, or arbitrary numbers.
2. Reconcile the certified P28 owner with ADR0170/OpenSpec through the formal
   phase workflow. This audit does not amend ADR0170's older P32 wording.
3. Implement one source-qualified command boundary with exact bindings,
   constrained states, semantic idempotency, and atomic required dispatch.
   Reuse the existing Postgres, API layer, workflow executor, email owners,
   and narrow public interaction surface. No generalized consent engine,
   per-tenant scheduler, direct browser membership mutation, or second CRM.
4. Prove the actual SQL/grants and competing real transactions, then qualify
   the rendered confirmation and provider boundary. Do not call a passing
   documentary checker evidence that this behavior has shipped.

No material concern above is relegated to monitoring. Any nonzero unauthorized
cross-scope acceptance, activation after terminal expiry/withdrawal, or
duplicate active membership is a release-blocking correctness failure. Runtime
health instrumentation belongs to the parent review's named owner/threshold
requirements; it must not replace these invariants.
