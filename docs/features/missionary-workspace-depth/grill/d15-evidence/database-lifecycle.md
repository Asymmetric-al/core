# D15 — connected personal email: durable lifecycle evidence

**Subsequent status — October 16, 2026 UTC:** the founder explicitly ratified the
[corrected D15 decision](../phase28-d15-connected-email-adversarial-review.md)
and its required amendments. That synthesis governs where this original research
contribution leaves options open or uses provisional wording. This note remains
evidence of the research performed; ratification proves no runtime capability.

Research/design review, 2026-10-16. The founder selected optional deliberate
individual sending through the missionary's connected account, subject to the
organization's permission. The clauses below are proposed safeguards/owner
amendments, not a new approved specification or proof of implementation.

The smallest sound extension is a source-owned private draft and deliberate Send
authorization, handed to the existing complete P6 preparation/intent/attempt
spine and sole external writer. P31 supplies a qualified personal-account
connection; P12 supplies current authority. There is no second mail queue,
provider-history database, inbox synchronization product or account-fallback
engine. One recipient still requires the complete bounded plan release.

## Source coverage and actual gaps

This is a targeted reading, not an exhaustive review of the large PRDs. Paths
below are relative to the repository root; numbers identify the inspected lines.

| Source                                                                                                                  | Governing evidence and limit                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md:175–176,257,325`                             | Complete bounded producer occurrence, permanent semantic identity, all-before-any release, source fence, immutable profile and final dispatch admission. A lease alone is not that final fence.                                                                                                                                 |
| Same P6, `387–390,425–429`; `docs/adr/0029-tenant-owned-resend-and-composed-delivery-identities.md:18–23`               | One `sendEmail` writer and the current one-tenant-Resend topology. D15 requires a narrow personal transport extension; these clauses do not already authorize Gmail/Graph or a direct SDK in the missionary app.                                                                                                                |
| Same P6, `524–564,571–585,598–616`                                                                                      | Frozen preparation; exact safe retry only; timeout is unknown; restricted material separated from body-free history; monotonic evidence and scoped correlation; no correlation by recipient email. Resend-specific keys, envelope and evidence rules need adapter qualification, not literal assumptions about other providers. |
| `docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md:2247–2259,2280–2308,2312–2345`            | Exact prepared bytes, authenticated encryption binding, optional separately governed readable copy, nonextendable material expiry, terminal destruction, body-free uncertainty and restore restrictions. The existing closed classes do not automatically cover personal mail.                                                  |
| Same P17, `3725`; `phase-17-system-message-census-2026-07-19.md:388–394`                                                | Missionary personal email is not the system-message catalog product. A source-authored individual-message lane must be qualified explicitly; inventing a system-template key is not a solution.                                                                                                                                 |
| `docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552–1556,1584–1587,2864–2887`             | One current PDP, exact trusted tenant context, live owner ceiling for service principals, fire-time resolution, structural tenant keys, coarse RLS plus private command boundaries. A service role or connection secret is not product authority.                                                                               |
| `docs/prds/sitestacker-parity/roadmap.md:4413–4419,4431–4449,4455–4457`                                                 | P31 owns credentials and transport; source owns eligibility/effect identity. Accepted work survives outages; explicit disconnect fences future work; unknown outcomes and safe recovery need source-specific qualification.                                                                                                     |
| `openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md:149,1104–1107,1251–1287,1334–1383,1466–1475` | Active change mirrors catalog closure, prepared/attempted recovery separation, material lifecycle, body-free history and server-derived scope. This is active intent, not implementation evidence. D15 must reconcile its authored-content and transport exceptions explicitly.                                                 |

The provider researcher inspected current official contracts; see
[provider-email.md](provider-email.md), E04–E06 and E08–E12. Graph `sendMail`
returns 202 without a message body and without a delivery guarantee. Gmail's
success response and SENT label also do not prove recipient delivery; its error
guide explicitly warns that a 200 need not mean successful sending. Neither
endpoint documents a client idempotency-key guarantee. This is an absence of a
documented guarantee, not a claim that the providers never deduplicate. The
local probe makes no provider requests.

## Minimal durable representation

These are logical records/boundaries, not a proposed new table inventory.

1. **Source draft/revision and authorization occurrence.** P28 owns authoring;
   P9/P28 owns the exact permitted recipient and purpose. A deliberate Send
   accepts the expected source revision once. Repeated clicks with different
   HTTP keys cannot mint another authorization. Distinct independently intended
   messages may share text; there is no global content-hash deduplication rule.
2. **Existing P6 released occurrence and immutable preparation.** The sealed
   member binds exact Tenant, source/authorization/revision/fence, admitted
   recipient branch and contact revision, purpose/safety profile, provider
   account/mailbox, visible sender/reply posture, connection/grant generation,
   serialized message hash and material deadline. The browser cannot submit an
   arbitrary Party, address, account, MIME header or scope as authority. A
   contract-permitted no-Party branch needs its exact source authority; this
   fixture exercises only an already-qualified same-Tenant Party branch.
3. **Existing P6 attempt and evidence.** Final current checks and durable attempt
   admission precede I/O. Internal message/effect identity exists before any
   provider ID. Queue/job IDs, credential generations and HTTP request keys are
   not new business effects. Provider IDs are optional, scoped evidence; Graph
   direct-send acceptance must work without inventing one.
4. **P31 connection and current secret resolution.** Stable provider account and
   grant identity are separate from rotating access-token bytes. Ordinary
   same-grant refresh may supply a current credential for an otherwise eligible
   exact attempt. It does not alter sender/content, revive revoked work, permit
   a retry of an unknown attempt, or mint a new effect. Replacement/reconsent,
   changed account, grant scope or sender identity is not ordinary refresh.
   Feature-local stopping and provider-wide consent revocation are different
   operations. Provider evidence E16 shows that Google revocation can affect
   other scopes/clients in the same project, while reducing a Microsoft request's
   scopes does not revoke an existing grant. P31 must qualify and explain the
   actual effect on a calendar connection; separate client IDs are not proof of
   isolation. The model's local connection toggle proves no OAuth revocation.
5. **Body-free communication history.** Reference the original source and exact
   attempt with safe classifications and outcome evidence. Neither provider
   acceptance nor a late callback creates staff/coach access to the source,
   content or relationship. There is no second personal-mail history authority.

The native draft, restricted prepared bytes, any separately authorized readable
sent projection, and body-free history have different purposes. In particular,
keeping a frozen native draft indefinitely after Send must not become an
unreviewed exact-body sent archive. The source owner must name the applicable
draft and terminal-content lifecycle; P17 must map the new authored lane to a
reviewed closed prepared-material class. This review selects no duration,
retention setting, universal sent-copy entitlement or new legal-hold product.

## Material concerns and proposed clauses

Severity describes harm if the flaw ships; likelihood is conditional design
risk, not an observed production incident. The clauses are recommendations for
the D15 owner amendment.

| Concern; severity / likelihood                                                                                                    | Exact proposed clause and consequence                                                                                                                                                                                                                                                                                                                                                                                                                             | Evidence/proof obligation                                                                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A second writer or invented template bypasses existing safety; Critical / likely if connected mail is treated as a UI SDK feature | **L01.** Personal mail SHALL use a closed P28 authored-message producer and qualified personal-account transport behind the sole P6 writer, preserving complete plan release, source eligibility and P17 preparation. Existing tenant-system/newsletter transport SHALL NOT fall back to a personal mailbox, or vice versa.                                                                                                                                       | P6:175,387–390,425–429; P17:3725. Actual import/call-site and end-to-end compiler checks remain required.                                                                                                            |
| Different keys or partial local commits duplicate/lose a deliberate send; High / likely under retries                             | **L02.** One accepted source authorization occurrence SHALL have one permanent semantic member identity. Authorization, its content-free audit and required identifier-only durable handoff SHALL commit atomically; no member is dispatchable before complete plan release. A conflict in immutable command input SHALL fail, not overwrite.                                                                                                                     | P6:175,257,325. M01–M02 model the invariants; real competing transactions and failure injection are unproved.                                                                                                        |
| Changed recipient, content or sender is sent under old approval; Critical / plausible                                             | **L03.** The authorized authored revision, recipient authority/contact revision, purpose, sender/reply, account/grant and exact prepared message SHALL remain immutable. A changed fact may stop the send; it SHALL NOT silently retarget, rerender or switch account. Source-qualified new review is separate from recovery of an already possibly submitted effect.                                                                                             | P6:524–534; P17:2280–2308. M03–M06,M17. Actual provider account/header behavior still needs qualification.                                                                                                           |
| Stale tenant, actor, grant or worker sends; Critical / plausible                                                                  | **L04.** Every authoring/read/authorization/decrypt/dispatch/repair operation SHALL derive its current P12 context and exact source purpose. At final attempt admission, the server SHALL re-prove current authority, source fence, contact safety, connection/grant and material validity with the expected state/version. A lease, JWT, service role, mailbox credential or prior Send grants no substitute authority.                                          | P12:1552–1556,1584–1587,2864–2887. M07–M08,M11–M14 only model supplied verdicts, not the PDP.                                                                                                                        |
| Cancellation is promised after submission may have begun; High / likely under races                                               | **L05.** A cancel/revoke/disconnect committed before final durable attempt admission SHALL prevent later ordinary submission. If admission wins, preserve the possible external effect and accept exact late evidence; do not promise recall or restore current rights. The status SHALL distinguish definite no-send from outcome unknown.                                                                                                                       | P6:175,524–564; P31:4449. M09–M14 cover both ordered interleavings, not concurrent transaction correctness.                                                                                                          |
| Lost response, stale worker or refresh blindly resends; High / likely under failures                                              | **L06.** Once an attempt may have begun, no worker, SDK, proxy, reconnect, new request key or new source occurrence used as retry SHALL replay it without exact provider-qualified safety proof. A crash after durable admission can be unknown even if I/O actually never occurred. Only authoritative proof of never-submitted or a definitive retryable rejection, with no earlier unresolved attempt and current checks, permits the qualified recovery path. | P6:529–564; provider E04–E12. M15–M16,M26. No blanket provider retry policy or exactly-once claim.                                                                                                                   |
| Token rotation freezes ordinary mail or changes sender; High / plausible                                                          | **L07.** Freeze stable account/mailbox, sender and connection/grant authority; resolve short-lived credentials under that same current grant. Record nonsecret attempt credential-version references. Token rotation SHALL neither create an effect nor widen or restore send authority. Account/grant replacement is fenced separately.                                                                                                                          | P6:176,528; P31:4413–4419; provider note “Stable grant.” This required OAuth qualification is not exercised by the model.                                                                                            |
| Acceptance is represented as delivery, reply or completed relationship work; High / likely                                        | **L08.** Local acceptance, possible submission, provider acceptance, recipient-server delivery and actual exchange SHALL remain separate evidence. Graph 202 and Gmail success SHALL produce only their documented acceptance fact. Do not auto-complete a conversation/task whose source completion requires more.                                                                                                                                               | P6:579–585; provider E05,E08,E10. M18. Model does not implement P9/P27 completion.                                                                                                                                   |
| Rich evidence or late proof exposes private source content; Critical / plausible                                                  | **L09.** Durable evidence SHALL be append-only normalized body-free facts correlated by exact scope/connection/internal effect identity. Current source/P12 projection controls each read, including late outcomes. Addresses, personalized subject/body, tokens and raw errors SHALL NOT enter durable log/metric/audit labels. Unknown/conflicting evidence SHALL quarantine without guessing identity or overwriting known truth.                              | P6:571–616; P12:2864–2887. M19–M20,M23,M28. Provider verification and database append-only enforcement remain unproved.                                                                                              |
| Expiry or preparation purge invents failure or preserves a replay archive; High / plausible                                       | **L10.** Select an explicit owner-reviewed material class and freeze its earliest nonextendable deadline. Apply immediate decryption/adapter denial and governed physical purge at the applicable terminal/deadline trigger; retain only permitted body-free uncertainty. Do not recreate payload from drafts, sent copies, provider history, logs or backups as recovery of accepted/unknown work.                                                               | P6:545–554; P17:2312–2343. M21–M22 use ten synthetic clock units, not a selected duration. Personal no-idempotency profiles must explicitly qualify when replay authority ends; there is no inherited Resend window. |
| Restore replays messages or revives erased content/access; Critical / plausible                                                   | **L11.** Before restored reads or workers resume, reconcile current authority, erasure/expiry/restriction ledgers and durable attempts against the external world. A backup's old `prepared` state SHALL NOT prove that no later submission occurred. Retain uncertainty and fence replay where newer external effects cannot be excluded; enable only work proved eligible under the current source/provider contract.                                           | P17:2259,2332–2343; P31:4443–4457. M24–M25,M27. This is a recovery discipline, not a permanent blanket queue hold or a claim that every historical backup fact is uncertain.                                         |
| Personal-email copying/deletion promises exceed actual authority; High / plausible                                                | **L12.** Disconnect stops new unadmitted work; it SHALL NOT claim deletion from the sender's mailbox, recipient inbox, backups or downstream copies. Source content cleanup, Asym encryption-material destruction, provider retention and possible external delivery SHALL remain distinct facts. No automatic recall, Sent Items deletion or broader mailbox scope is implied.                                                                                   | P17:2251,2332–2341; P31:4449; provider E08–E12. No external cleanup was tested.                                                                                                                                      |

## PostgreSQL/Supabase obligations — proposed and untested

The Python model does not exercise any of these. Production qualification must
use the real schema, roles, commands and source adapters, including hostile
direct SQL/RPC attempts and actual transaction races.

- Preserve complete composite scope FKs from source authorization to preparation,
  connection/grant, attempt and evidence. Tenant-bearing rows cannot reparent to
  another Tenant, actor, source, Party or connection. Use a closed typed recipient
  branch and non-null/exclusive-arc checks appropriate to that branch, rather
  than a nullable arbitrary email escape.
- Enforce a unique semantic producer-occurrence/member key independent of browser
  keys. Bind immutable command/member hashes and reject changed-input replay.
  Use the existing P6 occurrence/effect identity; no new independent mail ledger.
- Constrain immutable source/tenant/actor/recipient/account fields and legal state
  transitions at the private command boundary and database level where applicable.
  Expected version/epoch CAS and one consistent lock/fence order must join local
  admission, source revoke, connection disconnect and purge. Network I/O stays
  outside the database transaction; no database lock can make it atomic with mail.
- Apply P12's coarse forced Tenant RLS and least-privilege grants, then the same
  current PDP in all approved commands. Raw draft/preparation/token tables have
  no `anon`/`authenticated` table grants. Old-row eligibility and new-row scope
  integrity both require proof. Explicit `USING`/`WITH CHECK` is auditable; do
  not claim PostgreSQL omits update checks merely because `WITH CHECK` is
  omitted—where applicable it inherits `USING`. Fine permissions do not belong
  in relationship-heavy RLS joins or mutable JWT arrays.
- Test real invoker/definer execution, table ownership and `BYPASSRLS` behavior.
  A definer function needs its actual least-privilege owner, hardened search path,
  narrow execution grants and current trusted source context. Client-set IDs or
  session settings alone cannot establish that context. Service credentials
  remain server-side and never substitute for product authorization.
- Keep tokens and restricted bytes in separate governed custody. Bind encryption
  AAD to exact environment, scope, preparation/member and relevant authority;
  ensure queues contain references only. Prove real decrypt denial, key/cache
  purge, tombstone/backup restoration and logging absence. Hashes are evidence,
  not a substitute for encryption or authorization.
- Provider evidence lookup must start from a verified exact connection/account
  context and operation identity. Scope/account/provider-ID uniqueness is
  conditional on an ID actually existing; nullable Graph IDs must neither merge
  unrelated sends nor force fabricated IDs. Verify append-only privileges and
  conflict quarantine, not merely an application convention.
- Current-authority result recovery, history projections, cache invalidation,
  realtime refetch and private content viewing need negative tests for another
  Tenant/actor, a coach/staff member, revoked membership, switched active context,
  hidden recipient and permission loss after enqueue. The probe's audience set
  is a stand-in, not a new contact ACL or production authorization design.

## Executed local evidence

Command: `python3 docs/features/missionary-workspace-depth/grill/d15-evidence/probe.py`.
Result: **28/28 passed**. [probe-results.json](probe-results.json) contains the
execution timestamp, Python version, exact probe/source SHA-256 hashes, observed
results and declared limits. [probe.py](probe.py) uses only the standard library,
synthetic identities and `.invalid` addresses. No database, container, network,
real credentials, persistent service or provider effect was created. The only
generated artifact is the results JSON.

M01–M08 exercise local identity, staged atomic-release shape, immutable input,
scope and lease rules. M09–M17 cover both cancel/revoke/disconnect orderings,
lost responses, admission-before-I/O uncertainty and account fallback. M18–M23
cover acceptance truth, audience, minimized evidence, expiry/purge and exact
correlation. M24–M25 cover restored-state uncertainty and restored disclosure.
M26–M27 are intentionally unsafe controls: bypassing the no-replay gate or
replaying a prepared backup produces two external submissions in the stub.
M28 prevents contradictory late provider identity from overwriting known truth.

These are deterministic protocol/design probes with explicitly supplied current
authority and verified-evidence inputs. They are not implementation tests,
actual concurrent races, transactions, durable crash recovery, PostgreSQL/RLS,
Supabase Auth, encryption, OAuth, provider/SDK behavior, production retention,
UI tests, load tests, or proof of exactly-once delivery. The stub deliberately
performs every call; its duplicate controls demonstrate why an absent documented
deduplication guarantee matters, not what Gmail or Microsoft always do. The
model also deliberately cannot auto-resolve unknown outcomes or implement a
provider-specific safe retry. Those require real source/provider proof.
