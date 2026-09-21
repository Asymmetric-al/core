# D16 independent lifecycle and custody review

Reviewed 2026-09-11. Grooming evidence, not an implementation or legal opinion. Source worktree verified as `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10`; governing source revision supplied by root and consistent with this turn is `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. No application, database, provider, or GitHub mutation was performed. Only this review file is written by this reviewer.

## Independent disposition

**Accept A with required amendments.** A narrow source-owned permanent correction is preferable to destroying the whole conversation or keeping a revealable secret behind a cosmetic mask. It requires a truthful distinction between removal from current use, physical cleanup of managed copies, permitted preservation, and copies Asym cannot recall. These are lifecycle facts, not four ordinary user-selectable redaction modes.

The supported interaction is select exact text occurrences and whole attachments, review the resulting message, and deliberately confirm once. Cancel/Unmark before commitment remains available. A later merge Undo, backup restore, draft autosave, delayed provider hydration, replay, old app version, or permission regrant cannot restore removed payload. Redaction does not resolve work, count as a reply, clear an owed internal action, send a donor message, merge/delete a CRM person, or erase required financial facts.

## Repository evidence inspected

All paths below are relative to the verified Core worktree; feature grooming files are locally ratified, not claimed merged GitHub authority.

- `docs/adr/0031-body-free-history-with-expiring-recent-copy.md:18–50`: durable communication facts are body-free; Recent sent copy is separately encrypted, recipient-specific, bounded and subordinate. Restriction/erasure denies future reads. Restore reapplies current ledgers before reads.
- `docs/adr/0032-immutable-prepared-message-and-whole-message-recovery.md:32–38,40–98`: freezes bytes and sealed whole-envelope member mapping, distinguishes unprepared/definitely-unsubmitted/may-have-submitted, permits no split/rekey of a sealed envelope, and requires live safety/decrypt reproof. Existing prepared-material physical purge deadline is 24 hours after authority removal. This is a P17 material rule, not a universal Support or statutory retention duration.
- `docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md:172–175`: source body remains owner data; owner policy determines disposal; source fence before intent lock; atomic `dispatching` transition is the send linearization point. Prior change suppresses; later change cannot claim already authorized I/O was prevented.
- `docs/features/support-hub/grill/phase26-d4-adversarial-review.md:47–49,79–81,93–105,129–147`: reviewed human reply and prepared material are distinct; live safety checks, frozen attachment versions, no silent substitutions, source safety stop, current work recovery, compatible rollout.
- `docs/features/support-hub/grill/phase26-d10-adversarial-review.md:53–61,107–127,141–143,171–173`: merge affects handling topology, not source custody; Undo creates current work plans and preserves original evidence, cannot restore redacted content; actual P6 interactions remain separate.
- `docs/features/support-hub/grill/phase26-d12-adversarial-review.md:143–171`: citations do not become native correspondence; source references and authored summaries differ; context removal cannot silently end a referral obligation; actual notifications use owner source-end fences and no recall claim.
- `docs/features/support-hub/grill/phase26-d14-adversarial-review.md:65–87,113–115,149–173`: reply coverage is immutable causal evidence plus correction, not a content-edit side effect; current authorized reports keep honest outcome and denominator interpretation; old exports are captured snapshots, not silently rewritten history.
- `docs/features/support-hub/grill/phase26-d15-adversarial-review.md:77–113,178–193`: source corrections invalidate unsafe preview/destination/dispatch without routine follower notices; complete release and immutable per-member applicability; content-free interest/audit; restore cannot reactivate revoked presentation or old delivery.
- `openspec/specs/platform-boundaries/spec.md`: tenant/role boundaries, operational owner authority, server mutations, shared staff tasks; surface integration is not permission inheritance.

## Minimal permanent state model

Use three independently meaningful facts rather than one overloaded `redacted=true` field or a generic legal-workflow platform.

1. **Current source content and authority revision.** The source owner has one current sanitized representation and a monotonically advanced restriction/content revision. Prior unsafe revisions have no ordinary read, export, preparation, search or dispatch authority. The original conversation/message/attachment identity and permitted structural facts remain stable. Never make historical payload versions ordinarily readable through audit or Undo.
2. **One durable redaction operation receipt.** It records the reviewed target identity/revision, exact selection identities, trusted actor and policy basis, permanent operation identity, commit time and sanitized result revision. It records no removed text, original filename, dangerous URL, raw MIME or content-bearing before/after diff. Generic closed reason codes suffice by default; a required free-text explanation invites a second copy of the secret.
3. **Owner cleanup obligations and evidence.** Each affected managed material class has the responsible existing owner, exact source/artifact identity, policy-specific deadline, and status/evidence. The user normally sees one concise result; authorized details disclose pending cleanup, restricted preservation, provider limitations and backup disposition. A durable source restriction is not contingent on every downstream service being online.

The frontend can express the normal process as **Review → Removing… → Content removed**. Details must explain that content is removed from current Asym use while any managed cleanup remains pending. It must not advertise **Erased everywhere**. **Removal needs attention** is an operation/cleanup outcome and preserves restriction; it does not put content back. **Preservation required** is a distinct owner-policy result for destruction, not a hidden successful permanent-redaction result. No everyday disclosure of the legal matter or preserved secret is necessary.

### Valid transitions and correction paths

| Situation                                             | Required result                                                                                                                                                           |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Uncommitted selection → Cancel/Unmark                 | No source or cleanup mutation; discard transient selection state.                                                                                                         |
| Current authorized review → successful commit         | Atomically install safe current source result/restriction, immutable operation receipt, exact privacy/source fences and identifier-only cleanup/invalidation obligations. |
| Stale source/selection/authority/policy review        | Commit nothing; refresh only the affected review and preserve safe user selections when mapping remains provable. Never guess offset remapping.                           |
| Known preservation duty prohibits destruction         | Do not destroy. Permit only independently authorized restricted handling; show safe owner disposition and route to existing qualified privacy/records owner.              |
| Unknown/unavailable preservation decision             | Fail closed for destruction. Independently available source restriction may contain exposure; do not label it permanent deletion or infer no hold.                        |
| Commit succeeds, response is lost                     | Reconcile the same durable operation identity; return historical receipt plus current cleanup/source state. No repeated destructive effect.                               |
| Cleanup partially fails                               | Current restriction remains effective; bounded idempotent owner retries and grouped repair operate on the same obligation identity.                                       |
| Cleanup finishes                                      | Mark only the proved material targets complete. A legal backup/provider deadline still pending is not erased.                                                             |
| Already removed exact target                          | Return already removed/current result without disclosing old text or advancing duplicate activity/metrics.                                                                |
| Later independently valid new message repeats a value | Treat as new source content and a separate explicit correction when needed; do not silently redact all matching human speech or claim semantic erasure.                   |
| Restore/rollback                                      | Apply a non-rollbackable current restriction/disposal barrier before any source/derivative read, worker decryption, index rebuild or send.                                |

An implementation may name internal states differently. These observable meanings and transitions are the contract; there is no need to freeze a large enum or copy all existing P17 states into Support.

## Required exact clauses

### L01 — Selected occurrence, stable source and representation closure

“A redaction identifies exact content occurrences in one current original source revision and selected whole attachment identities. The server proves that the reviewed visible selection maps to the canonical source representations before mutation. Removing an occurrence also removes or denies every managed representation of that occurrence, including corresponding HTML/text, unsafe link attributes, raw MIME/original views and attachment derivatives. A visually hidden string, CSS overlay, replacement in only one body format, or still-downloadable original is not redaction. When precise mapping cannot be proved, offer the reviewed whole affected message body or whole attachment instead of silently guessing.”

Interpretation: retaining harmless source structure is legitimate, but a raw original that contains the secret must become inaccessible and enter owner disposal. A regenerated safe MIME/export must be labelled a sanitized representation, not the unchanged original. Exact repeated occurrences independently selected in the same message may be combined in one review. Other distinct messages are not presumed copies solely by text equality.

### L02 — One atomic source correction boundary

“Commit the sanitized current source result or irrevocable source-access restriction, advanced source/privacy revisions, trusted body-free redaction receipt, and identifier-only owner cleanup/invalidation obligations atomically. No success may mean only that a browser overlay changed. Every new read/preparation/export/dispatch admission re-proves the current revision. A downstream outage may delay physical disposal but cannot keep serving the prohibited revision after the commit.”

Atomicity is at Core’s trusted source/database boundary; do not attempt a database transaction around object-store/provider calls or require a distributed transaction across all surfaces. Readers need authoritative negative authorization even when physical data remains temporarily.

### L03 — Current preservation authority, not an admin checkbox

“Before destructive commit, the owning privacy/records contract supplies an affirmative current applicable retention/preservation disposition for the exact source scope. A missing, stale or unavailable decision does not mean no restriction. Where preservation prohibits destruction, keep the material restricted under the independently qualified owner policy and expose only a safe disposition to ordinary staff. Support cannot create a new unrestricted legal archive, bypass the hold, declare the hold released, or authorize a financial-record deletion. The owner records release/expiry and authorizes any later disposal.”

Root is researching applicability-specific US legal requirements. Do not reuse P6’s broad GDPR/CPRA baseline prose as a verified assertion that every nonprofit has identical duties, or that every backup may wait indefinitely. Do not import the official receipt retention period into accidental private paragraphs/attachments.

### L04 — Fixed semantic effect and retry identity

“A redaction operation identity is bound to exact tenant, source identity/revision, reviewed selection, current actor authority and semantic command. Exact replay reconciles the one original receipt; changed input under that identity conflicts. A later operation uses a fresh identity and current review. Enforce source revision and policy fences under the authoritative transaction so concurrent overlapping/disjoint edits cannot restore deleted bytes, overwrite an intervening correction or remove the wrong Unicode range. A delayed original request cannot recreate content after a subsequent correction.”

Do not retain plaintext selected text in request logs or a durable idempotency body. Use selector/revision identities and approved cryptographic command comparison; a new standalone hash of a short password/SSN as audit “evidence” is unnecessary and potentially guessable. Existing governed P6 message hashes are separate evidence and do not justify extra secret hashes.

### L05 — Prepared payloads and sealed envelope consequence

“A redaction advances only the exact source/dependency privacy fence and revokes affected unstarted preparation/dispatch authority. Never rewrite a frozen prepared body, replace an attachment in place, change a sealed envelope’s member list or send sanitized content under an occupied semantic/provider identity. Once an envelope is sealed, a source stop affecting any included member prevents a new submission or replay of that envelope. Other members retain their actual independent provider/outcome facts; any later legitimate replacement follows existing owner-authorized new-review/new-occurrence rules, not an automatic split/rekey workaround.”

This amendment is consequential: P17 rejects splitting/rechunking/rekeying sealed envelopes even when a subset becomes inapplicable. Unsealed independent sibling work may proceed under its existing policy; source redaction is not a tenant-wide stop. A narrow batching choice must not widen source privacy authority.

### L06 — Dispatch race and no recall

“Redaction and dispatch serialize through the same exact source/privacy fence before the intent/envelope transition. Redaction winning before dispatch linearization prevents affected I/O. Dispatch already linearized first is truthfully already authorized/in flight; keep accepted, rejected or indeterminate evidence without claiming recall. A later privacy stop removes any further payload decryption or same-key replay authority even where ordinary transient-failure recovery would otherwise permit it. Continue only body-free permitted reconciliation. Do not manufacture failure, resend under a new key or discard evidence to make redaction appear successful.”

The final I/O boundary is inevitably not an email recall mechanism. Existing in-flight bounded worker memory and recipient/provider copies cannot be retroactively proved erased by changing a DB row. Disclosure/incident response, if the actual case warrants it, belongs to the existing security/privacy owner and is not an automatic customer email for every redaction.

### L07 — Drafts, quotes and open clients

“Known source-derived quote fragments, persisted previews, private draft references, prepared artifacts and unsent queued material bind source lineage/currentness. Redaction invalidates their old source-derived values and blocks stale autosave/send/export; preserve unrelated authored draft text and require current review where a candidate changed. Do not republish old source bytes from editor undo buffers or offline replay. Already loaded source views receive invalidation and refresh/remove the affected content when connected; a lost invalidation is closed by current server checks on subsequent operations.”

“The system does not promise to discover all independent retyping, screenshots, clipboard copies or previously downloaded/sent external content. A deliberate independently authored summary or repeated quote is its own source and needs its owner’s authorized review/removal; a direct known source projection must not be mislabelled independent to evade correction. No blanket whole-CRM string scan or automatic semantic cascade is required.”

Nuance: stale view removal is best effort in an offline/already-rendered client; it cannot be a proof of remote memory wiping. This limitation does not excuse serving stale content from future authenticated requests.

### L08 — D10, D12 and CRM topology

“Redaction targets the original message/attachment owner regardless of the currently continuing conversation. Current combined, related, cited and CRM views re-resolve that source’s current permitted representation. Merge and Undo preserve the redaction/restriction and allowed source provenance; they never restore pre-redaction bodies, attachments, link previews or old signed URLs. A D12 citation is corrected through the source owner; an independently authored summary is separately governed. Redaction cannot remove an owed referral/internal action merely because its supporting text is unavailable. Keep the existing qualified work-review path if removal makes current action unclear.”

No extra ordinary CRM Activity row, last-contact update, duplicate P6 event, person deletion, giving update or broader access grant is created. Existing source-specific audit may show a safe content-removal event to authorized staff. Counts do not disclose restricted related records.

### L09 — Timing, following and legitimate history

“Retain permitted actual message/effect identities, timestamps and recipient evidence under their owning retention policy. Redaction does not fulfill, reset, cancel or score D14 reply periods, does not manufacture D15 human activity and does not reopen/resolve conversation work automatically. Correct unsafe existing D15 previews/destinations/unsent dispatch through the source fence without a routine follower notification. An actual demonstrated eligibility/time error uses D14’s explicit owner correction, not a content-edit shortcut.”

“Historical report snapshots remain truthful descriptions of their captured interpretation, but any managed export containing now-prohibited source content loses future download access and follows the applicable owner disposal policy. The fact that an export is immutable does not grant its private contents permanent display authority. An already downloaded external copy cannot be silently rewritten.”

### L10 — Managed copy inventory and truthful completion

“Activation requires a finite registered inventory of Support source representations and actual consuming material paths: database/raw MIME, attachment objects and derivatives, caches/indexes, in-product projections, P17 prepared/Recent material, provider retention, managed exports and backups. Each path declares whether it holds content, its authoritative denial/revision check, responsible owner, disposal mechanism and applicable deadline. No unknown content-bearing path may be declared outside scope merely because it is inconvenient. The cleanup receipt contains safe identity/evidence only and does not become a second content store.”

“Current content removal, live-system disposal, provider disposition and backup expiry/erasure are reported separately where unfinished. Retry cannot reset a deadline or restore decrypt/read authority. The UI must not call all managed copies erased while a recoverable backup/provider copy remains pending or required preservation remains active. Previously delivered mail/downloads outside Asym’s control are a stated limit, not silently counted as verified deletion. Reuse the existing owner retention, purge, grouped repair and restore mechanisms; do not create a generic DSAR workflow solely for this feature.”

Root should bind disposal deadlines to current applicable policy, including the independently researched US applicability distinctions. P17’s explicit existing 24-hour execution-material purge deadline must remain enforceable; it is not authority to invent one universal backup or Support transcript period.

### L11 — Restore and safe deployment

“Before enabling redaction, fence every older source reader/writer, attachment access route, export/index builder, hydration/import/replay path, draft sender and notification consumer that lacks the current restriction contract. Migrations do not redact by guessed keyword, infer historical legal basis, replay old mail, or recreate CRM identities. Maintain redaction/disposal evidence outside the backup rollback domain and reapply it before restored data becomes readable, decryptable, searchable or dispatchable. A feature kill switch may stop new redaction admission; it must retain all existing restrictions, cleanup/reconciliation and legitimate retained-source navigation. Rollback cannot deploy a broad legacy reader over already redacted sources.”

“A restored original whose current restriction evidence cannot be reconciled remains inaccessible for affected material while the owner repairs it. Restore does not renew deletion deadlines. The release proof includes source and dependency compatibility, not only forward database migration success.”

## Adversarial counterexamples and mandatory proof

These are reasoning cases to turn into independently executed domain/integration proofs. No database concurrency, browser or provider tests were executed by this reviewer.

| Proof | Counterexample / falsifiable expected outcome                                                                                                                                                                                                   |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LP01  | Two redactors review the same revision; one removes an emoji-containing span. The second stale UTF-16 offset cannot delete unrelated text or restore the first result; it must refresh/review.                                                  |
| LP02  | Selected text is absent visually but persists in plain text, HTML attribute, quoted MIME or attachment thumbnail. Every known representation is denied/removed; canonical unsupported mapping falls back visibly to whole body/file.            |
| LP03  | Source correction commits immediately before search/cache/export read. The old projection cannot satisfy a new request merely because asynchronous physical purge is delayed.                                                                   |
| LP04  | Crash after atomic source commit, before object deletion/outbox delivery. Current view stays safe; one durable cleanup obligation resumes without reminting activity.                                                                           |
| LP05  | Response lost after successful destructive commit. Same operation returns its original receipt and current state; changed selection with the same ID conflicts.                                                                                 |
| LP06  | Source becomes subject to a preservation decision during review. Current commit reproof blocks destruction; safe independently authorized containment remains possible. A gate outage is not no-hold.                                           |
| LP07  | Redaction races definitely-unsubmitted prepared reply. Source stop wins and prevents send; prepared bytes are not edited and reused. Legitimate later reply requires new explicit reviewed authority.                                           |
| LP08  | Redaction races final dispatch; verify both orders at actual shared fence. Earlier redaction blocks; earlier dispatch preserves in-flight/unknown fact. No false prevented label.                                                               |
| LP09  | A sealed two-member envelope contains one revoked source dependency. No filtered one-member payload/new key is sent; no allowed identical retry occurs after privacy stop. Existing independent evidence remains.                               |
| LP10  | Provider timeout preceded redaction. Reconcile without payload rehydration/replay after stop; unknown may remain unknown. Purge does not fabricate rejection.                                                                                   |
| LP11  | Offline draft autosaves/redelivers old known source quote after redaction. Old fragment revision cannot be saved/sent as current; unrelated authored draft text survives.                                                                       |
| LP12  | Delayed inbound hydration/import recreates old raw MIME or original attachment under the same source receipt. Tombstone/restriction is applied before visibility; no old payload resurrection.                                                  |
| LP13  | Merge B→A, redact B, Undo merge later. Original B remains separated correctly and still redacted; current assignments/work stay valid.                                                                                                          |
| LP14  | Related conversation cites B; CRM shows B through several qualified bases. All direct source projections show current safe content without duplicate rows or wider audience. Independent summary is separately identifiable.                    |
| LP15  | Redaction removes the only readable evidence of an owed action. Do not mark task/reply target complete; the current qualified owner reviews incomplete context without an automatic work-ending cascade.                                        |
| LP16  | D15 following preview and queued email depend on removed content. Current preview/inactive destination/unsent authority is invalidated; no mass redaction alert, new human event or recipient rescan.                                           |
| LP17  | D14 reply was timely before redaction. Timing fact and denominator stay truthful; restricted contents do not remain downloadable just because the report snapshot is historical.                                                                |
| LP18  | Attachment original has thumbnails, inline aliases and existing URLs. Every managed path stops future access under the same current restriction; signed URL lifetime assumptions are proved, not hidden behind UI.                              |
| LP19  | Backup older than redaction is restored. Before reads, reapply non-rollbackable current ledger; source/derived index/prepared object cannot decrypt/reappear. Missing ledger fails closed for affected content.                                 |
| LP20  | Cleanup deadline passes/provider cannot prove delete/retained backup still exists. UI reports the exact pending/failed owner disposition; no erased-everywhere result. Retry does not restart the deadline.                                     |
| LP21  | Ordinary staff without redaction permission, a different tenant, expired role, or worker with arbitrary caller actor attempts removal. Deny without revealing protected content, recording caller-supplied attribution, or changing the source. |
| LP22  | Feature disabled or N–1 binary deployed after a redaction. Current restriction and cleanup remain; no broad legacy API, original-MIME endpoint, export or replay path restores content.                                                         |
| LP23  | Independent new message contains the same short number/password-like value. No automatic semantic cascade into unrelated messages, CRM/Finance or another tenant; new reviewed scope is necessary.                                              |

## Operational controls with explicit owners and thresholds

The following are proposed activation/operational controls, not measured incidents. Exact physical deadlines derive from the applicable owner class; each obligation has an immutable `due_at`, so overdue is falsifiable without inventing a universal law.

| Signal                                                                    | Threshold                                                                    | Owner                                                                                        | Response                                                                                                                                                 |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prohibited source revision served/dispatch admitted after effective fence | Any confirmed occurrence                                                     | Support security owner plus affected consumer owner                                          | Stop the affected admission/read path, preserve body-free evidence, contain exposure, repair and reprove before reenabling.                              |
| Redaction receipt committed without required cleanup/outbox identity      | Any occurrence                                                               | Support API owner                                                                            | Treat as invariant breach; fence affected source/material, reconcile exact operation and repair atomic boundary.                                         |
| Managed cleanup obligation overdue                                        | `now >= due_at` and required completion evidence absent                      | Recorded material owner; P17 for preparation/Recent material, platform retention for backups | Group by root cause; preserve restriction; retry exact disposal/reconcile provider evidence; escalate owner deadline risk without recreating payload.    |
| P17 prepared material remains after existing purge limit                  | More than 24 hours after authority removal                                   | P17 preparation/security owner                                                               | Enforce deny/decrypt stop, purge known live material, investigate copies; no replay to “complete” send.                                                  |
| Restore would expose source missing current restriction reconciliation    | Any affected source                                                          | Platform restore/retention owner                                                             | Withhold affected reads/indexing/decrypt/dispatch until ledger proof; do not make entire tenant indiscriminately unavailable where exact scope is known. |
| Repeated redaction command conflicts due to genuinely changing source     | Track conflict rate and source cause; no invented numeric customer benchmark | Support product/API owner                                                                    | Inspect source mutation/map behavior and selection UX; ordinary material conflict is not automatically a security incident.                              |

For the final row, root should either choose a concrete locally measured release threshold later or keep it as a diagnostic rather than “monitor” acceptance deferral. The five safety controls above have exact thresholds and owner actions now. Usability metrics do not replace release proof.

## What must precede what

1. Record A’s exact owner boundary and truthful permanence meaning; distinguish source removal from total external erasure. Resolve current applicable preservation/disposal authority and no-restore rule in the decision language now.
2. Capture source representation and consumer inventory, per-material deadline/disposition contract, text-selection mapping and prepared-envelope fence consequences in the grooming design. Do not activate a UI whose backend still only hides content.
3. Implement later through the actual shared source mutation boundary, current-read contract and existing P6/P17 fences; qualify migration/restore/dependency disposal before activation. Prove the listed races with actual transactions and source consumers.
4. Ship the proportionate one-review interaction with current status and persistent safe operation detail. Do not ship bulk redaction, auto-detection, PDF/image editing, revealable retained originals or a new compliance workflow as prerequisites for this need.
5. Monitor only post-release operational drift of already proved safeguards with the exact signals above. Missing owner authority, current-read denial, send fencing, irreversible correction or restore proof is a release blocker, not something to discover by monitoring.

## Limits and nonclaims

This independent review inspected repository and locally ratified grooming text and exercised counterexamples by reasoning. It did not execute runtime DB/RLS/storage/provider/browser tests, verify every raw content path, measure load, certify UX, classify any tenant’s legal applicability or set a universal transcript retention period. The root’s source/data and legal reviews must close those evidence areas in the final proposal. No claim that current runtime already implements these safeguards is made.
