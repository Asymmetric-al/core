# D17 — contact-file intake: source, custody and permission boundaries

Research only, October 16, 2026 UTC. Inspected repository baseline:
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`.

The founder selected Q17 A, missionary self-service contact-file intake, as
reported in the current review assignment. The Q17/session documents still
showed the earlier awaiting-answer snapshot when inspected; that is not evidence
against the newer answer. This note proposes owner reconciliation for review. It
does not ratify detailed amendments, edit formal owners, select a vendor,
implement an importer, qualify a deployment or authorize an actual upload.

## Findings that change the decision wording

1. P30 explicitly describes **staff** uploading/reviewing the accepted plan.
   Self-service requires a bounded missionary actor/purpose extension, not merely
   another screen over a supposedly existing missionary import permission.
2. The first target is the D1-qualified **restricted preparation source**.
   Source-to-Party import does not substitute for it. Newly imported assertions
   must not become ordinary staff CRM facts, and importing them cannot require
   D2 sharing. Independently authorized existing contacts keep their source truth.
3. P30's retained high-confidence automatic-merge shorthand conflicts with P4's
   explicit never-automatic merge contract. P30's current roadmap makes automatic
   merge conditional on permission from the identity owner; P4 supplies none here.
   D17 grants no automatic merge or general merge capability.
4. Source file, parsed staging, preview, accepted preparation, shared contact,
   import receipt and retained evidence are separate facts with separate access
   and lifecycle. One visible upload-to-results journey can preserve these
   distinctions without a new workflow platform.
5. No inspected owner supplies a universal import retention period or file-size,
   row-count or processing-time limit. Exact purpose limits and schedules must be
   qualified. Other domains' invitation, finance, newsletter or draft timers are
   not authority for this import.

## Inspected source evidence

Line references identify the inspected local sources. They are target intent
unless explicitly identified as current source evidence; no runtime claim follows.

| ID  | Exact inspected source                                                                                                                                                                                                                                           | Controlling fact and consequence                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S01 | `docs/features/missionary-workspace-depth/grill/phase28-founder-brief.md:241–249`; `phase28-q17-contact-list-intake-research.md`, **The single product choice**, **Why the choice is genuinely open**, **Consequences to resolve after the answer**              | Imports use source validation, identity, provenance, suppression and qualified P30 migration. No broad mailbox/address-book ingestion, historical outreach or inferred consent. Q17 covers reviewed contact-file intake, not live synchronization, historical giving or automatic newsletter enrollment. One-time does not prohibit repeat files or recovery.                                                                                                         |
| S02 | `docs/prds/sitestacker-parity/roadmap.md:4315–4339,4349–4381`                                                                                                                                                                                                    | P30's initial actor is staff. Exact source bytes, mapping/version, scope and target revisions bind a no-write preview. Target services own acceptance; P30 owns transport, staging, mappings, plans and run evidence. Recoverable bounded batches, exact reimport, current authority, accurate per-row outcomes and outward-effect suppression are required. Format/source profiles and update/append/merge/reference behavior remain explicit qualification choices. |
| S03 | `docs/prds/program-roadmap/owner-constraints.md:318–354`                                                                                                                                                                                                         | Shared field-catalog mapping, consistent duplicate rules, stable source identities, provenance, safe reversal and typed target adapters are retained obligations. The high-band auto-merge phrase at 330 must be reconciled with S06; it is not an independent import permission. Background processing reuses the existing execution substrate.                                                                                                                      |
| S04 | `docs/prds/sitestacker-parity/roadmap.md:4235–4255,4261–4269,4277–4299`; `docs/prds/program-roadmap/owner-constraints.md:156–179,307–312`                                                                                                                        | P29 owns one byte/access model, immutable byte identity, scan/quarantine, current-purpose retrieval, authorized metadata, retention execution and truthful disposition. Source owners own meaning, purpose and retention policy. Private originals, filenames, previews and confidential audit are protected. Existing provider mentions require a current census; they are not a deployment or allocation decision.                                                  |
| S05 | `docs/features/missionary-workspace-depth/grill/phase28-d1-adversarial-review.md:30–50,368–436`; `phase28-d2-adversarial-review.md:375–404`; `phase28-d5-adversarial-review.md:25–48,361–379`                                                                    | D1 selected restricted start, including newly supplied contact assertions and derivatives; D2 and D5 are ratified. D1's exact preparation design remains the reviewed source proposal to reconcile, not a shipped service. D2 sharing is deliberate, contact-only and source-qualified. D5 permits eligible ordinary corrections under current tenant/field/source permissions, not blanket import overwrite.                                                         |
| S06 | `docs/prds/sitestacker-parity/phase-04-identity-account-claiming-foundation.md:138–165,185,207–236`; `openspec/specs/crm-core/spec.md:46–64,83–88`                                                                                                               | Identity, contact assertion, account claim and access are distinct. No cross-Tenant dedupe/link/merge. P4 A9 and its dedupe module explicitly never auto-merge; only qualified source references may be repaired. Contact capture does not verify a mailbox or create a login. Low-confidence matches cannot automatically link, overwrite or merge.                                                                                                                  |
| S07 | `docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:340–407,661–679,775–781,846–848,917–932,984–989`                                                                                                                                     | Party/household/org relationships are not imported free-text roles. No new inline Party contacts or second person master. Ordinary name/phone semantics are source-owned; name splitting, inferred phone region and unrelated identity/consent writes are prohibited. Import provenance uses source links, not Party kind/status. Protected notes cannot be imported into shared partnership history. P30 owns the full importer.                                     |
| S08 | `docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1538–1556,1584–1588,1600–1633,1670–1672`; `openspec/changes/sitestacker-parity/specs/identity-and-access/spec.md:5–9,41–84`                                                         | One PDP, current Active Tenant Assignment, exact source purpose, additive grants and subtract-only floors. Missionaries may receive bounded workspace grants without staff status. Deferred work re-resolves current context; roles, service credentials and other hats do not authorize. Administration differs from exercise. RLS is coarse defense in depth, not a substitute for source/field checks.                                                             |
| S09 | `docs/adr/0209-static-field-policies-and-subtract-only-projection.md:16–37`; `docs/adr/0210-code-authoritative-capability-foundation.md:16–37`; `docs/adr/0211-distinct-human-approval-for-projection-widening.md:16–37`; active identity spec above, `:143–157` | Whole-field classification and one subtract-only resolver; unknown fields fail closed outside Mission Control. No per-value policy engine. Capability meaning remains code-owned; dormant foundation overrides are not a working P12 settings system. Actual projection-policy widening requires distinct-human approval; routine imports under a qualified policy do not thereby require a second reviewer.                                                          |
| S10 | `docs/adr/0212-one-export-policy-and-shared-csv-safe-cell.md:15–40`; `docs/prds/sitestacker-parity/phase-11-custom-fields-custom-collections.md:129–153`                                                                                                         | Downloaded error/preview CSV is governed egress, not an exemption because its source was uploaded. Exportability differs from visibility; use the existing shared safe-cell encoder for CSV output, not a second implementation or destructive input normalization. Custom data uses immutable catalog identities and source validation; unknown columns cannot create arbitrary new properties or escape classifications.                                            |
| S11 | `docs/features/missionary-workspace-depth/grill/phase28-d3-adversarial-review.md:20–34`; `phase28-d4-adversarial-review.md:31–50`                                                                                                                                | D3 selects no new exceptional continuity access. Retention does not grant reading; removal cannot destroy independent facts or required evidence. Ratified D4 archive does not delete a contact, revoke a share or restart work. Reimport is not an excuse to reactivate archived preparation or restore old grants.                                                                                                                                                  |
| S12 | `docs/adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md:65–108`; `openspec/specs/crm-core/spec.md:14–26,114–126`; `docs/prds/sitestacker-parity/roadmap.md:4419–4433`                                                                                      | Asym owns CRM truth behind server contracts. Twenty is retired. P31 owns actual connections/transport; CSV intake does not need a connector or restore a shadow-sync stack. Named importer benchmarks are not adopted vendors.                                                                                                                                                                                                                                        |
| S13 | `openspec/project.md`, **Current vs intended**; `docs/ai/document-authority.md`, **Resolve the actual question**, **State vocabulary**                                                                                                                           | Explicit later decisions control intent; an active change or ratified document does not prove implementation, qualification or activation. Later formal amendments must reconcile actual owner clauses and declared projections rather than leave conflicting operative text under a banner.                                                                                                                                                                          |

## Minimal proposed ownership and lifecycle

This is an engineering/product recommendation for the accepted self-service job,
not an already implemented model or a new set of independent product rights.

| Fact or action                                                     | Single owner and necessary boundary                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Workspace entry and understandable journey                         | P28 presents upload → review/fix → import → accurate results, with manual entry still useful. No new general migration dashboard is required in the missionary app.                                                                                                                |
| Intake session, parser/mapping profile, preview, run, row receipts | P30, exact Tenant, actor context, purpose and selected target. Use one bounded source adapter, not a second importer owned by P28.                                                                                                                                                 |
| Original bytes and generated error-file bytes                      | P29 immutable private custody, scan/quarantine and current access; source purpose supplies the retention/disposition policy. General File Manager visibility, possession of a link and staff role are insufficient.                                                                |
| Parsed source data and proposed effects                            | P30 private non-authoritative staging with the D1 source audience and stricter applicable classification. Unsupported sensitive columns do not become ordinary searchable metadata merely because mapping ignores them.                                                            |
| Accepted unresolved contact assertions                             | Qualified P9 preparation source proposed under D1; P28 consumes it. File intake cannot manufacture a Party, donor, support relationship or financial subject merely to satisfy a foreign key.                                                                                      |
| Canonical identity/contact acceptance and corrections              | P4/P9 exact commands. Safely reuse an authorized source identity where admitted; do not expose hidden matches. D5 current eligible corrections remain separate from a newly granted import action.                                                                                 |
| Tenant enablement and actor powers                                 | Existing P12 administration/resolver and P3/P10 floors. Upload/read-own-staging/preview/commit are bounded semantic powers, not arbitrary role-name tests or a new per-file ACL product. Exact capability keys/default grants are later qualification, not facts established here. |
| Sharing, consent, cultivation and communication                    | Their existing D2/P6/P27 owners. Import grants none of these effects and does not waive their restrictions.                                                                                                                                                                        |
| Required audit and retained provenance                             | Existing source/audit owners, identifiers and necessary evidence under exact audiences. Minimal durable evidence is distinct from indefinitely retained full CSV/row bodies.                                                                                                       |

Recommended initial target profile: eligible contact assertions and safe reuse of
currently authorized existing sources. Do not infer **bulk mutation of shared
records** from Q17. Conflicting existing canonical values can remain unchanged
and direct an authorized user to the normal D5 correction action. That preserves
a useful import without coupling it to broad merge, household reconstruction,
custom-schema creation, notes/history, financial migration or consent import.
An explicit later qualified update profile can extend P30 without a parallel
parser or permission system. Exact accepted file formats/fields remain review
recommendations; P30's CSV/XLSX coverage does not require every consumer to accept
every format in its initial profile.

Minimal lifecycle, expressed as facts rather than mandated database enums:

1. **Private intake.** Resolve current authority before upload initiation. P29
   finalization/integrity/scan produces a usable private byte reference or an
   honest pending/quarantined/rejected outcome. A completed upload creates no CRM
   contact and grants no staff or processor access.
2. **Review.** P30 parses only a bounded supported profile and binds a no-write
   plan to the exact immutable file, parser/mapping version, target/purpose,
   actor context, row selections and relevant source revisions. Corrections to
   mapping or source facts produce a newly reviewable plan; they do not mutate
   what the user previously approved. Preview shows only authorized source facts.
3. **Commit and process.** A deliberate commit authorizes that exact plan. Each
   source acceptance re-proves current applicable authority and target state.
   Durable per-row source receipts establish which changes happened. The run
   can complete with issues; it must not label all rows failed after partial
   acceptance, or all rows imported because upload succeeded.
4. **Interrupted work.** Retry/resume the same accepted work from receipts.
   Revoked authority prevents new row acceptance and future protected readback;
   already accepted lawful rows are not silently rolled back. A changed plan
   requires current review of remaining work; receipts for prior accepted rows
   cannot disappear or be replayed as new effects.
5. **Cancel/discard.** Stop unaccepted work at its owner acceptance boundary.
   A worker already racing acceptance has a durable success-or-not-accepted
   result; Cancel cannot promise erasure of accepted contacts. Discarding a
   staging file is neither D4 archive nor deletion of imported CRM facts.
6. **Disposition.** Expire/dispose raw bytes, parsed staging, previews and error
   files under a qualified purpose schedule and holds. Preserve necessary
   minimized identity/provenance/receipt evidence. Safe disposal checks active
   and recovery references and reports partial/unknown provider outcomes. Restore
   cannot revive cancelled work, erased payloads, access or historical outreach.

Stable row-operation identity cannot rely on a row number, content hash, email or
phone alone. An immutable file/session identity plus its stable row ordinal may
identify one operation within that exact intake; it does not identify the person
across files. An immutable file digest identifies bytes, not proof that two
imports intend the same update. A retained source/profile record key can
support reimport when its owner permits; a CSV with no such key must not acquire
cross-file automatic overwrite semantics from guessed matches. Same-session
retry can still converge through durable session/row receipts. Show the supported
reimport behavior honestly rather than promise perfect deduplication of arbitrary
edited exports.

## Consequential concerns and exact amendments

Likelihood is conditional engineering judgment under the stated failure path,
not a measured incident rate. Each concern carries the eight requested dimensions.

### O01 — A staff-only importer cannot silently authorize missionary commits

- **What:** Merely mounting the P30 importer in the missionary surface either
  bypasses permissions or leaves self-service permanently dependent on staff.
- **Why:** P30's current actor wording is explicit; P12 distinguishes settings
  administration, source exercise, projection policy and role labels.
- **Severity:** High.
- **Likelihood:** Likely if the existing staff-oriented contract is reused without amendment.
- **Evidence:** S02, S08, S09.
- **Answer impact:** Accept A with a bounded actor/purpose amendment; no blanket
  staff role, importer-admin grant or routine second-person commit approval.
- **Permanent fix:** Register exact import target capabilities and a focused
  existing-settings entry, preserving the common PDP and current context.
- **Exact proposed clause OC01:** “P30 admits the currently authorized missionary
  as reviewer and committer for the qualified P28 contact-intake profile. Import
  administration, file access, preparation and target mutation remain separately
  admitted powers. Ordinary authorized imports need no staff review; actual
  projection-policy widening follows its existing distinct-human approval rule.”

### O02 — Intake can disclose private prospects or become a hidden-match oracle

- **What:** A generic Party import publishes newly supplied contacts; preview,
  duplicate counts or constraint failures reveal a hidden existing person.
- **Why:** D1 protects contact assertions as well as notes, across derivatives.
  D2 sharing and safe canonical admission are separate actions.
- **Severity:** Critical where protected identity or private preparation is disclosed.
- **Likelihood:** Likely if ordinary staff Party import is treated as the target.
- **Evidence:** S05–S09; D1 C01–C06; D2 C03–C07.
- **Answer impact:** The private preparation target must be useful and qualified;
  no requirement to share contacts before intake and no safe-looking deny-only UI.
- **Permanent fix:** Accept authorized private assertions through the preparation
  owner; keep canonical resolution distinct, and apply result authority before
  existence-dependent output, including counts, error downloads and recovery.
- **Exact proposed clause OC02:** “Newly supplied contact assertions enter the
  qualified restricted preparation source. Import neither shares them nor changes
  independent canonical facts. Authorized private acceptance need not assert a
  resolved Party identity. Any canonical lookup, reuse, conflict or result obeys
  current source admission and exposes no hidden-match signal; independently
  authorized existing facts retain their access and meaning.”

### O03 — File access, staff help and diagnostics become an alternate disclosure path

- **What:** Raw CSV, ignored columns, previews, file names, errors or worker logs
  expose data that the final contact projection correctly hides.
- **Why:** Import files can contain unrelated private notes or identifiers.
  Storage classification and source audience are both required; ordinary D1
  restriction is not automatically a Phase 10 endangered-worker classification.
- **Severity:** High; Critical for reached safety-restricted content.
- **Likelihood:** Likely if generic File Manager/admin/support visibility is reused.
- **Evidence:** S04, S05, S09–S11.
- **Answer impact:** No implicit new helpdesk, staff-reader or successor right.
- **Permanent fix:** Private purpose-bound custody and staging; minimized logs;
  authorize derivatives and any expressly provided assistance material separately.
- **Exact proposed clause OC03:** “Originals, staging, previews, filenames, error
  artifacts and recovery results preserve the source audience and stricter
  applicable classifications. Staff help and permission administration confer
  no file or private-preparation access. A user may deliberately provide material
  through an already qualified source path, but D17 creates no helper grant or
  general disclosure path. Sharing a contact under D2 does not share its source
  file or the file's other rows. Operational diagnostics contain only permitted
  identifiers, counts and outcomes, never unrestricted row bodies.”

### O04 — A high-confidence match becomes an unauthorized merge or overwrite

- **What:** P30's auto-merge shorthand, shared email or imported IDs cause merge,
  account attachment, consent carry-over or bulk replacement of canonical values.
- **Why:** Contact similarity is evidence, not person identity or source rights;
  P4 explicitly retains human-governed merge, and D5 grants only eligible edits.
- **Severity:** High to Critical for access-affecting merge or suppression bypass.
- **Likelihood:** Likely with conventional upsert-by-email importer defaults.
- **Evidence:** S03, S05–S08; P4 A9 and dedupe command; CRM Core weak-match requirement.
- **Answer impact:** Reconcile the conflicting retained sentence explicitly; no
  automatic merge or bulk canonical update is selected by A.
- **Permanent fix:** Separate matching, authorized reuse, proposed corrections
  and source-owned merge; retain safe source lineage across repeat imports.
- **Exact proposed clause OC04:** “D17 applies P4's no-automatic-merge rule.
  P30 confidence bands do not override it. Names, emails, phones and source IDs
  are untrusted match evidence until qualified by their owner. Import grants no
  claim, login, relationship or consent. Preserve existing canonical values
  unless an exact reviewed source update is independently admitted; the initial
  bounded profile may route such corrections to D5 rather than add bulk editing.”

### O05 — Preview approval becomes stale authority for a background batch

- **What:** A later worker applies changed mapping, newer contact values, another
  Tenant/hat or revoked permissions under an earlier successful preview.
- **Why:** A run spans time and partial acceptance; queue identity or service
  credentials cannot preserve the human's former authority.
- **Severity:** High.
- **Likelihood:** Plausible to likely without explicit source acceptance fences.
- **Evidence:** S02, S05, S08; active identity spec deferred-context requirements.
- **Answer impact:** Require current source acceptance without implying a whole
  file is one long transaction or that revocation erases lawful earlier rows.
- **Permanent fix:** Bind immutable reviewed plan, current context and target
  versions; fence each source acceptance and persist attributable row receipts.
- **Exact proposed clause OC05:** “Each accepted row belongs to the exact reviewed
  plan and source-purpose operation. Re-prove current authorization and affected
  target revision at acceptance. Changed scope, mapping or target state requires
  an honest conflict or new review, never silent retargeting. Permission loss
  stops unaccepted work and protected readback; it does not negate prior lawful
  acceptance. Workers cannot substitute service-role authority for the source actor.”

### O06 — Retry, reimport, Cancel and Undo have contradictory meanings

- **What:** Lost responses duplicate contacts; a row number or file digest is
  mistaken for business identity; cancelling/deleting a run removes later work.
- **Why:** Transport identity, source identity and current contact state differ.
  Partial processing and later D2/D4/D5 actions make universal undo unsafe.
- **Severity:** High.
- **Likelihood:** Likely with generic retry-all or delete-by-batch behavior.
- **Evidence:** S02, S03, S05, S11.
- **Answer impact:** Preserve useful restart and accurate partial results; do not
  promise arbitrary cross-file deduplication or a new contact-deletion right.
- **Permanent fix:** Durable source receipts, stable origin keys where qualified,
  resumable remaining work and exact source-owned reversal/correction checks.
- **Exact proposed clause OC06:** “Retry recovers the same accepted operation.
  Reimport uses qualified stable source identity and current source rules, never
  guessed email identity, row position or file hash as person authority. Cancel
  stops unaccepted work; accepted rows remain accurately reported. Undo, where
  the source supports it, cannot erase later edits, merges, shares, independent
  facts or required history. Reimport does not reactivate archived preparation,
  expired rights, opt-ins, completed work or past outreach.”

### O07 — Staging becomes permanent private storage, or cleanup destroys evidence

- **What:** Raw files are retained forever for convenience, or an arbitrary TTL
  deletes active recovery inputs/holds while receipts imply complete custody.
- **Why:** P29 executes a source schedule; it does not invent it. Byte expiry,
  operational recovery, accepted CRM retention and provenance have different jobs.
- **Severity:** High.
- **Likelihood:** Plausible without a selected purpose schedule and copy inventory.
- **Evidence:** S02–S05, S11; P29 roadmap 4261, 4291–4299.
- **Answer impact:** A remains useful, but activation requires explicit finite
  operational retention/limit choices and source-retention reconciliation.
- **Permanent fix:** Purpose-owned schedule for bytes/staging/results/evidence,
  current authorization, hold/reference checks and honest purge/restore outcomes.
- **Exact proposed clause OC07:** “Before activation, qualify exact file/row/work
  limits and separate retention schedules for raw bytes, staging, generated error
  files and necessary minimized source/run evidence. P29 executes authorized
  disposition after complete use/hold proof. No imported contact is deleted merely
  because staging expires; no retained file grants continued access. Report partial
  deletion truthfully and prevent restore from reviving erased content or work.
  Other domains' timers are not inherited import defaults.”

### O08 — Mapping/error output expands into schema, communication or vendor authority

- **What:** Unsupported columns create arbitrary custom fields; spreadsheet-safe
  output escaping mutates stored input; error download bypasses export policy;
  an importer vendor receives raw PII or a retired CRM stack is restored.
- **Why:** Source validation, field policy, exportability and external processing
  are independent. A supported file is not consent or an approved processor.
- **Severity:** High.
- **Likelihood:** Plausible with unqualified generic importer defaults.
- **Evidence:** S01–S03, S07, S09, S10, S12.
- **Answer impact:** Keep the bounded file workflow; no new vendor/AI, custom
  schema, live feed, historical data migration or external effect by inference.
- **Permanent fix:** Registered finite mappings to source-allowed fields; reject
  or visibly exclude unsupported columns; qualified error export and processor
  handling through existing owners, with manual entry independent.
- **Exact proposed clause OC08:** “The admitted profile enumerates supported
  formats, columns and exact source actions. Unknown fields cannot create schema,
  contact verification, consent, history or business effects. Preserve original
  contact semantics; CSV output alone uses the shared csvSafeCell encoder after
  current export projection. Any external processor requires its own approved
  purpose/data-handling contract. D17 introduces no vendor, external CRM, live
  synchronization, automatic messages, enrollment or financial migration.”

## Candidate operational retention profile

At the main reviewer's request, recommend **one fixed seven-day raw-intake
access/execution window from server-recorded finalized upload** for the bounded
contact-list profile. This is an explicit, unmeasured D17 product judgment, not
an inherited owner requirement or a claim that seven days is optimal. A fixed
deadline is easier to explain and prove than seven days after completion or last
edit combined with a separate thirty-day pending ceiling. Reads, edits, retries
and reopening do not renew it; a replacement is a new reviewed upload, not a
silent renewal of an approved plan. Give incomplete uploads a bounded custody
cleanup rule without adding another user-facing retention setting.

Show the expiry before commit. At expiry, deny raw/staging/error-artifact reads
and new source-row acceptance; a racing acceptance has a durable source outcome.
Preserve and reconcile already accepted contacts from minimal receipts. Remaining
data requires a fresh reviewed intake with safe prior-origin reconciliation.
Do not start work the qualified bounded processor already knows it cannot finish
within the remaining window, or promise that expiry undoes accepted changes.

Access/execution expiry is not proof of physical erasure. Select and prove a
separate numeric primary-copy purge target after the custody inventory; disclose
the bounded backup/hold treatment and prevent restore from renewing access or
execution. No inspected source justifies copying another feature's purge timer.
Accepted source/run provenance follows its own minimized history/hold policy,
not the raw-file seven-day timer. A lawful retention hold can preserve bytes
without preserving ordinary reader access. If representative job/recovery
evidence disproves the usable fixed window, revise this review recommendation
explicitly rather than introduce hidden sliding renewal.

## Necessary proof and unresolved qualifications

The following are future release obligations, not claimed passing tests:

- Positive self-service upload/review/commit/reopen through real P29/P30 and the
  D1 target, under an actual bounded missionary grant, without staff approval or
  D2 sharing for ordinary intake. Ordinary manual entry remains independent.
- Full audience matrix across raw bytes, metadata, staging, preview, error CSV,
  jobs, audit, counts, search, results and recovery: same-Tenant other missionary,
  ordinary staff, administrator without read authority, current qualified reader,
  revoked actor, other Tenant/hat, coach-only and public.
- No hidden-match oracle: safely exercise absent, hidden-existing and eligible
  existing identities, shared household/church mailboxes, same-name people,
  archived preparation and source-link collisions. Private input row counts are
  distinguishable from protected canonical-match counts; only authorized facts
  enter outcomes. Demonstrate successful ordinary private intake, not deny-only safety.
- Revocation/acceptance, target-edit/commit, mapping-edit/commit, duplicate worker,
  lost response, partial failure, cancel/resume and reimport races with durable
  source receipt reconciliation. Apply current authority to recovered results.
- Valid and malformed international names/phones; explicit empty versus absent
  fields; source metadata forgery; unsupported columns; malicious/oversized files;
  formula-leading cells on output without destructive normalization of input.
- Purpose retention and deletion across raw/derived copies, active jobs, holds,
  backup/restore and unknown deletion outcomes. Prove byte expiry does not delete
  accepted contacts and retained evidence does not restore access.
- No grant, login, claim, shared history, consent, contact, task, newsletter,
  financial, public or workflow effect from import alone; no dormant legacy
  fallback or old writer bypasses the same source/purpose fences.
- Exact budgets measured with representative authorized distributions. P12 R6's
  logical governance-read budget is inherited; it is not a per-file latency, row
  capacity, retention deadline or permission to load an entire roster into a browser.

Still to qualify in the main review: finite initial format/field profile; usable
source identity/reimport semantics for files without stable IDs; exact current
permission defaults and setting scope; byte/staging/evidence schedules and copy
disposition; actual custody/provider inventory; bounded parser/work quotas;
source adapters and real deployment/browser proof. These are not reasons to ask
the founder again whether missionaries may import their lists. Explicit new
rights such as helper access, bulk shared-record editing or automatic sharing
must not be smuggled into those implementation choices.

## Verification performed for this note

Read-only repository source reconciliation and deterministic document checks
only. No application/database/provider probe, actual import, hosted permission
test, ministry interview or numerical performance measurement was performed.

## Subsequent ratification

On October 16, 2026 UTC the founder explicitly ratified the corrected D17
decision and required amendments, including C01–C24, the initial profile and
P01–P28 as future proof obligations. The
[main D17 review](../phase28-d17-contact-import-adversarial-review.md) is the
reconciled decision. Earlier recommendation labels and conditional alternatives
in this evidence note describe pre-ratification research, not additional or
competing accepted choices. This changes intended-behavior status only; source
snapshots, executed experiments and all implementation/qualification limits
remain unchanged.
