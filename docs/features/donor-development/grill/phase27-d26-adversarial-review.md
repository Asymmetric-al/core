# Phase 27 D26 — shared working history with missionary autonomy

2026-10-11, Asia/Bangkok; research and execution evidence retain actual UTC dates.
**Amended D26 explicitly ratified, including the missionary-autonomy rider.**
Review disposition: **Accept with required amendments.** The founder subsequently
instructed, “Yes, ratify this amended D26.” The exact reviewed decision and its
safeguards are ratified without substantive change.
Reviewed against Core HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3`.
This is the completed decision review, not a formal PRD/OpenSpec, implemented
feature, permission activation or ticket publication.

The useful product is a shared memory for a particular ministry partnership.
A missionary may contribute useful context without acquiring a reporting quota,
supervisor, required task or performance score. The important correction is that
**shared by default describes where a deliberately written update goes; it does
not require missionaries to document their lives or expose their private notes.**
Safety and existing real responsibilities remain intact.

## Exact corrected decision

> **D26 — Offer shared working history for eligible partnership updates, with
> missionary participation under their own judgment.** When an authorized staff
> member or missionary deliberately records a new routine update in the clearly
> identified shared-partnership context, save it once and make its qualified
> content available to the current authorized collaborators for that exact
> partnership. Show the partnership and understandable sharing audience before
> saving and in the saved detail. An ordinary eligible update needs no second
> sharing step or supervisory approval.
>
> Missionaries decide whether and what appropriate context to contribute. Sharing
> or reading an update does not enroll or reopen managed cultivation work, assign
> a task, require stages or a next action, start coaching, require activity reports,
> create a quota, or authorize staff to judge performance from recorded activity
> or its absence. Offer separately deliberate personal follow-through where its
> existing source permits it. Previously accepted source work, actual commitments,
> gift-handling responsibilities and safety rules keep their own meaning; a shared
> update neither completes nor waives them. This is a product boundary, not an
> assertion about a missionary's employment status or every agency's policies.
>
> Sharing applies only to newly authored eligible working context. Do not publish
> existing private notes, imported history, personal messages, staff-only CRM
> activity, Support/member-care content, sensitive locations or restricted finance.
> Keep qualified private-note actions separate and show their real audience;
> never promise “Only you” from a generic Internal Notes or restricted label.
> If the intended source or audience is unavailable, explain that and keep the
> sharing action unavailable rather than silently choosing another audience.
>
> Phase 9 owns the qualified interaction source; Phase 27 owns development meaning
> and Phase 28 its permitted missionary experience. Preserve the exact encounter identity
> where an actual encounter exists; a general update does not require inventing one,
> and each contributor's attributed words. Distinct permitted notes may describe
> the same encounter without duplicating contact effects. Existing message, care,
> task and financial sources retain authority over their own facts. A shared
> timeline is a view, not a new diary database or a second source of truth.
>
> “Shared” means the current qualified audience and historical-access scope of
> this partnership, not all staff, all missionaries or everyone who can view the
> same church. Explain that appropriately authorized future collaborators may
> see its shared history. Assignment, links, merges and role changes grant nothing
> by themselves. Revocation stops future unauthorized access, including projections
> and recovered results; it does not erase lawful authorship history or guarantee
> recall of information already read or lawfully exported.
>
> Provide a calm, accessible Add update → Save update flow with clear attribution,
> truthful dates, optional follow-through, correction and understandable save/retry
> states. Bind each draft and save to its intended partnership and sharing context.
> Preserve lawful history, prevent duplicate effects and wrong-context saves, and
> handle sensitive corrections through the source's qualified restriction and
> retention process. Saving or sharing alone proves no donor contact, notification,
> readership, meaningful contact, task completion, stage change or financial success.
> A truthful source-recorded encounter may support separately qualified contact
> measures; their broader criteria remain a later decision.

## Evidence, alternatives and confidence

| Evidence                                                        | What was established and its limit                                                                                                                                                                   |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Ownership](d26-evidence/ownership.md)                          | P9/P3 exclusions, P12 authority, P27/P28 interaction and coaching direction; exact proposed reconciliation. Planning contracts are not delivered APIs.                                               |
| [Authorization](d26-evidence/authorization.md)                  | Current note/activity authorization, disclosure and replay hazards, exact audience/history controls and current primary database guidance. No live policy audit or deployed D26 vulnerability claim. |
| [Implementation and experiment](d26-evidence/implementation.md) | Adjacent source-code gaps and a new bounded synthetic database experiment. Neither the fixture nor source inspection qualifies actual Core authorization.                                            |
| [UX](d26-evidence/ux.md)                                        | Concrete lean flow, draft-context hazard, accessible recovery and fresh primary interface guidance. No shipped UI, measured beauty or usability result.                                              |
| [Ministry practice](d26-evidence/practice.md)                   | Nine fresh primary comparisons, including contrary agency practices. No invented interviews or universal missionary employment/supervision model.                                                    |
| [Independent challenge](d26-evidence/independent-review.md)     | Separate challenge of the integrated decision and evidence, with findings and resolution status.                                                                                                     |

**Repository facts.** [P9](../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:904)
literally excludes Party notes/activity from missionary projections;
[P3](../../../prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md:90)
excludes donor notes and scores. [P12](../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1540)
requires exact current action/field/context authority. The [P28 roadmap](../../../prds/sitestacker-parity/roadmap.md:4169)
requires one interaction log with agreed visibility, and assigns interactions to
P9 at line 4181. It describes invited read-only coaching, while retained goals and
check-ins need the autonomy qualification below. Neither side of this tension may
be quietly ignored. [Platform boundaries](../../../../openspec/specs/platform-boundaries/spec.md)
preserve the missionary workspace as a distinct experience rather than staff
operational depth. [CRM requirements](../../../../openspec/specs/crm-core/spec.md)
allow later-defined role-scoped slices; they do not automatically authorize this one.

**Current behavior from static code inspection.** Native CRM notes use
`standard`/`restricted`, with staff access and admin access to restricted notes.
They are not author-only. Their loose linked-record metadata, separate command-log
write containing the body, and stored-result replay are not the required D26 source
contract. The missionary donor-activity writer checks donor/missionary access but
does not implement the proposed partnership audience/history contract. The
missionary page keeps note text at page scope, selects the current donor at submit
and clears shared draft state on success: reusing it without context binding risks
wrong-context saves or late-result draft loss. These are evidenced reuse hazards,
not proof that a deployed D26 feature leaked information. See the appendices for
exact source files/lines and distinctions between tested and inspected behavior.

**External facts.** MPDX documents broad shared ministry accounts separately from
invited non-editing coaching access. Its coaching instructions also require some
Cru new staff to share with an initial coach. Reliant's current cohort guidance
combines participant-created goals with reporting expectations; other guidance
explicitly describes employed missionaries. Salesforce Nonprofit Cloud supports
confidential interaction summaries. These establish real comparable collaboration
and varied agency practices, not a universal mandate for either A or B. Source
editions, publication dates, retrieval dates and limitations are recorded in the
practice and UX appendices. No external convention overrides Core's source boundaries.

**Strongest alternative.** B—deliberately sharing each update—is strongest for
mixed personal/pastoral conversations and authors uncertain about the audience.
It can preserve one encounter source and is not inherently duplicate logging.
However, it adds a disclosure step to routine coordination and may leave useful
context unshared. A is preferable in a clearly shared, eligible writing context;
protected material retains separate qualified treatment. A general shared account,
mandatory missionary CRM reporting, automatic email/calendar ingestion or a new
personal-journal product would create unnecessary scope and risk. Keeping only
existing staff notes is simpler but cannot satisfy the selected collaboration need.

**Judgments and unknowns.** Voluntary missionary contribution and the lean flow
are product judgments grounded in the founder's instruction, not measured user
preferences. Tenant volumes, actual agency pilots, deployed policy/grant state,
exact source APIs and composed-interface accessibility remain unverified. These
are implementation qualification gates with acceptance criteria below, not reasons
to invent evidence or reopen routine design questions.

## Explicit owner reconciliation

The following is **exact proposed owner language** for the later /to-prd package;
no existing formal owner document is changed in this research turn. These clauses
must travel together. They resolve the product decision here without pretending a
research record activates a permission.

1. **P9 interaction source / P3 missionary projection exception:** “Preserve the
   prohibition on general donor/Party notes, private CRM activity and scores in
   missionary projections. An explicit exception MAY expose a newly authored,
   sharing-eligible development-interaction projection for an exact partnership,
   with its qualified current audience, fields, purpose and historical-access
   scope. This exception SHALL NOT relabel, migrate or summarize protected notes
   into shared content. P9 owns the qualified interaction identity and record;
   P27 owns its development meaning.”
2. **P12 / projection-widening controls:** “Register and qualify exact create,
   read, correct and restrict capabilities for this shared source. A missionary
   can receive a bounded workspace capability without becoming staff. Apply
   current acting-context authority, source disclosure floors and the existing
   [distinct-human approval requirement](../../../adr/0211-distinct-human-approval-for-projection-widening.md)
   when projection policy widens. Once that
   source/policy is qualified, an ordinary eligible update SHALL NOT require a
   supervisory approval or a fresh policy-widening decision.”
3. **P27 / active-work boundary:** “Reading or contributing shared partnership
   context SHALL NOT itself admit, reopen or advance managed cultivation work.
   The next-action-or-owned-exception invariant applies to deliberately admitted
   active work under D4/D6 and its accountable owner; it is not a requirement that
   every missionary interaction or update have a task. Actual source obligations
   keep their own lifecycle and cannot be completed by note visibility.”
4. **P28 / retained targets, check-ins and coaching:** “Shared working history
   SHALL support voluntary missionary contribution without compulsory logging,
   reporting quotas, missing-log penalties, performance rankings or staff approval
   of routine updates. Its activation SHALL NOT enroll a missionary in coaching
   or activity reporting. Goals, invited read-only coaching and qualitative
   check-ins are separately deliberate, qualified assistance; organization
   configuration SHALL NOT turn this shared-history capability into a mandatory
   missionary reporting system or imply performance from absent records. Existing
   accepted work and legal/financial source obligations remain intact.”
5. **P9/P12 history and membership:** “A shared context has an ongoing qualified
   audience, not a new per-entry recipient ACL engine. New collaborators may read
   earlier updates only through an explicit source/history-qualified grant.
   Assignment or linking alone SHALL NOT supply that grant. Removal/revocation
   applies to subsequent reads and result recovery; lawful accepted history
   remains subject to source correction, retention and disclosure policy.”

## Concrete user experience

Use the existing Asym record shell and `@asym/ui` Base UI/base-maia controls,
semantic Zinc tokens, readable hierarchy and restrained spacing. One calm history
area is enough; no new chat system, permission builder or compliance dashboard.
The following copy is illustrative and must be localized, not hard-coded English.

```text
Grace Church · Partnership with [permitted ministry name]

Partnership history                             Add update
Shared updates help you coordinate. Add one when it is useful.

Add partnership update
Shared with authorized staff and missionaries for this partnership.
Who can see this?

[Update text]
                                           Cancel   Save update
```

The audience explanation appears before typing and remains available; its detail
shows understandable permitted scope and names where disclosure allows them.
It explains future authorized collaborators without displaying a restricted roster.
Do not make users acknowledge the same audience on every save. If no qualified
shared audience can be explained, provide a clear unavailable state rather than
a mysterious disabled button or guessed tenant-wide destination.

| Situation                               | Clear behavior and next action                                                                                                                                                                                            |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Routine update                          | One deliberate save. Show author, source context, recorded time and qualified occurrence date if known. No required follow-up or staff approval.                                                                          |
| Real conversation versus internal note  | Preserve source event meaning. A free-text update is not proof of a call. Unknown occurrence time stays unknown; a recording timestamp is labeled as such.                                                                |
| Personal or sensitive context           | Offer an existing qualified private-note destination only where available, labeled with its actual audience. Otherwise cancel/retain only permitted unsent text. Never silently publish or promise a new private journal. |
| No shared updates                       | “No shared updates here yet.” No claim that no contact happened, a relationship is neglected, or hidden entries exist. Loading, failed history and filtered-empty are distinct.                                           |
| User wants follow-through               | Offer a separate optional source-backed personal action after saving; sharing alone does not create, assign or complete it. A real pre-existing obligation remains visible through its own permitted view.                |
| Paused or closed managed work           | Allow qualified factual history/correction without silently reopening work or outreach. The source determines permitted changes; a historical update does not revive cancelled reminders.                                 |
| Save pending / reply lost               | Clearly show Saving or outcome unknown. Recover the same accepted intent before offering a new attempt; do not create another encounter or claim everyone was notified.                                                   |
| Change partnership/role while drafting  | Bind the draft to its original qualified context. Require an explicit safe destination change where supported; never submit old text into the newly selected record or clear a new draft on a late old response.          |
| Permissions or intended audience change | Recheck at save and result disclosure. Reject an unsafe stale intent with refresh/correction. Preserve only data the user may still retain; never silently broaden sharing.                                               |
| Correction or accidental overshare      | Use the source's attributed correction/restriction path, suppress future unauthorized derivatives and show a safe outcome. Do not erase another contributor's words or promise recall from previous readers/exports.      |
| New or departed collaborator            | Explain current source/history access. A new assignment alone reveals nothing; a departed author remains honestly attributed where lawful but loses access after revocation.                                              |

Design for 320 CSS pixels/equivalent zoom, keyboard and touch, visible unobscured
focus, screen-reader names/descriptions, associated errors and restrained status
announcements. Use text as well as color. Support long/multiscript names, RTL,
localized dates and timezone travel without changing date-only facts. Prefer a
short text update on low bandwidth; no attachment or offline-sync product is
introduced. No default browser persistence of sensitive drafts, silent offline
replay, read receipts, all-collaborator broadcast or pressure to acknowledge each
entry. Donor/public/giving surfaces gain no extra step or exposure.

## Category-by-category adversarial review

Each row independently reports whether a material concern exists in unqualified A.
Severity/likelihood are prospective engineering judgments, not measured incident
rates: **high** threatens privacy, source truth or trust; **medium** threatens
usability/recovery/maintainability. “Plausible” means a credible path; “likely if
reused” is supported by a specific adjacent pattern. References to R/AC identify
the exact permanent language and falsifiable outcome below. All findings preserve
the selected collaboration direction; their effects explicitly narrow or amend it.

| Category                                                             | Material concern; what can fail and why                                                                                                                                                                                                       | Severity / likelihood; evidence                                                                                                             | Effect, permanent prevention and exact requirement/proof                                                                                                                                                                        |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **01 Problem validity, necessity, and alternatives**                 | **Yes.** A useful coordination feature could become compelled missionary reporting. That solves a different problem and damages trust. B is stronger for sensitive conversations; existing private notes alone do not deliver shared context. | High / plausible; founder rider, varied MPDX/Reliant policies and [practice](d26-evidence/practice.md). No measured universal preference.   | Amend A to voluntary new eligible shared composition, retain separate protected context and actual obligations. R01–R03; AC01–AC04.                                                                                             |
| **02 Brittleness**                                                   | **Yes.** Assuming “staff,” “missionary,” “standard” or a current roster has permanent sharing meaning breaks on roles, reassignment and new collaborators.                                                                                    | High / likely if existing labels are reused; P3/P9 exclusions and current note semantics in [authorization](d26-evidence/authorization.md). | Narrow “shared” to current qualified source/context/history authority, not labels or a snapshot roster. R04–R06; AC05–AC08.                                                                                                     |
| **03 Technical debt**                                                | **Yes.** A second missionary diary, copied CRM body or improvised per-entry ACL creates competing facts and costly repairs. Existing split note/audit writes are not a safe command template.                                                 | Medium / plausible; P9/P27 ownership and [implementation](d26-evidence/implementation.md).                                                  | Reuse the qualified source, one authoritative mutation and shared UI; qualify the missing seam once. R07–R09, R17; AC09, AC15, AC26.                                                                                            |
| **04 Edge cases**                                                    | **Yes.** Joint meetings, departed authors, paused work, unknown dates, duplicate names and cross-ministry churches can misattribute context or restart work.                                                                                  | High / plausible; distinct partnership identity, D7–D21 and draft/source findings in [UX](d26-evidence/ux.md).                              | Preserve contributor/source/context identity and independent lifecycle; no name matching or guessed dates. R02, R07, R10–R12; AC10–AC13, AC19.                                                                                  |
| **05 Footguns**                                                      | **Yes.** A generic “Internal Notes” box may look private while saving shared content; switching records or late replies can publish or clear the wrong draft.                                                                                 | High / concrete reuse hazard, not runtime reproduction; page-level state and admin `standard` write in [UX](d26-evidence/ux.md).            | Make sharing persistent before input, keep private route distinct and bind draft/result identity. R03, R11–R12; AC04, AC19–AC21.                                                                                                |
| **06 Tenant safety**                                                 | **Yes.** General church access, cross-tenant references, cached results or a merge could mix separate ministries' histories.                                                                                                                  | High / plausible; exact source scope in P12, loose current linked-record metadata.                                                          | Trusted tenant/actor context, typed tenant-aware references, no access from assignment/link/merge, scoped projections/caches. R04–R06, R08, R14; AC05–AC08, AC22.                                                               |
| **07 Database, RLS, and authorization safety**                       | **Yes.** RLS-valid updates can still retarget a row between two writable contexts; direct writes, permissive policy composition, definer/service paths or replay can bypass content/source rules.                                             | High / plausible; PostgreSQL semantics, current grants/code and bounded new experiment. No actual Core policy qualification.                | Check both old/new state and immutable origin, composite tenant/source relationships, qualified command, least grants and current replay disclosure. R08–R09; AC14–AC18. Money schema is unaffected; no money precision change. |
| **08 Overengineering**                                               | **Yes.** Universal encounter service, frozen per-note recipient lists, new workflow/coaching engine or approval on every note turns a simple shared history into administration.                                                              | Medium / plausible; owner separation and founder D21.                                                                                       | One shared composer/source view, existing qualified actions, no mandatory supervision or new generic engine. R01, R06–R07, R17; AC01–AC04, AC26.                                                                                |
| **09 UX/UI and user friction**                                       | **Yes.** Unclear audience, disappearing instructions, inaccessible save feedback or mandatory follow-up make sharing confusing or coercive.                                                                                                   | High / likely if adjacent UI copied; source findings plus W3C/Base UI guidance in [UX](d26-evidence/ux.md).                                 | Persistent context/help, one save, neutral empty states, optional next action, localizable accessible recovery; actual user comprehension gate. R11–R13; AC19–AC21, AC27–AC29.                                                  |
| **10 Source of truth, ownership, and domain invariants**             | **Yes.** A shared timeline may become a writer for contacts, tasks, care or money; two narratives may count as two meetings.                                                                                                                  | High / plausible; roadmap:4181 and retained one-log requirement.                                                                            | P9 owns encounter/update; P27 owns development meaning, projections cannot mutate other domains. Distinct attributed notes share qualified encounter identity. R07, R10; AC09–AC13.                                             |
| **11 Hidden coupling**                                               | **Yes.** A shared note could silently start a coaching relationship, enrollment, notification, contact score or source task. Access might depend on full P28/optional automation delivery.                                                    | High / plausible; P27/P28 task/target requirements and open contact policy.                                                                 | Explicit source effects only; native qualification for this lane without requiring unrelated products. R01–R02, R10, R17; AC01–AC03, AC11, AC26.                                                                                |
| **12 Failure modes**                                                 | **Yes.** Source save succeeds but audit/projection/reply fails; retry duplicates content or re-discloses a revoked result. Failure may be hidden as an empty timeline.                                                                        | High / plausible; split write/current result behavior and network ambiguity.                                                                | Atomic required local effects, durable outcome, current recovery authorization, separately repairable derivatives and truthful UI. R09, R12, R15; AC15–AC18, AC20, AC24.                                                        |
| **13 Lifecycle, temporal correctness, concurrency, and idempotency** | **Yes.** Concurrent role/audience changes, edits, duplicate retries and late callbacks can publish stale intent or rewrite another contribution.                                                                                              | High / plausible; source fence requirement and draft code.                                                                                  | Serialize exact authority/intent at source acceptance, optimistic content revisions and durable effect identity; explicit correction/restriction, truthful event/record time. R08–R10, R12; AC12–AC13, AC15–AC21.               |
| **14 Data integrity risks**                                          | **Yes.** Imports, similarity deduplication, copy-forward or deletion can lose authorship, fabricate dates and produce duplicate contact counts.                                                                                               | High / plausible; current donor activities are not a universal encounter source.                                                            | No auto-migration/sharing, exact provenance, source-owned merge/correction and durable history without narrative conflation. R03, R07, R10, R16; AC09–AC13, AC25.                                                               |
| **15 Security and privacy risks**                                    | **Yes.** Care, location, donor anonymity or private text can leak through bodies, counts, AI briefs, logs, notifications, exports or stale caches. “Private” can falsely imply author-only.                                                   | High / plausible, concrete full-body command-log reuse risk; [authorization](d26-evidence/authorization.md).                                | Minimize eligible content and all derivatives; no automatic protected-content extraction; current audience checks, qualified retention/disposal and incident correction. R03–R06, R14; AC04–AC08, AC22–AC23.                    |
| **16 Scalability and performance risks**                             | **Yes.** Unbounded history reads, authorization after pagination, per-entry audience fan-out or body logging degrade with long histories and many tenants.                                                                                    | Medium / plausible; no measured D26 capacity.                                                                                               | Scoped indexed keyset reads, authorization before visible counts/page boundaries, bounded enrichment and workload qualification. R15, R18; AC24, AC30. No unsupported latency/volume promise.                                   |
| **17 Operational burden**                                            | **Yes.** Orphaned authors/permissions, stranded corrections or vague “ask admin” recovery force direct database repair and agency reporting bureaucracy.                                                                                      | Medium / plausible; current source qualification gaps.                                                                                      | Existing source-owned recovery with named product/operational owners, preserved accepted work, no new mandatory reporting queue. R02, R14–R16, R20; AC23–AC25, AC32.                                                            |
| **18 Observability and auditability gaps**                           | **Yes.** Technical logs can expose content while failing to show who changed sharing or corrected a fact; absent updates can be misread as inactivity.                                                                                        | High / plausible; current log payload and activity defaults.                                                                                | Separate lawful business history, minimal security audit and content-free operational telemetry; do not measure missionary compliance from the log. R01, R09–R10, R14–R15; AC01, AC12, AC15, AC22–AC24.                         |
| **19 Dependency and integration risks**                              | **Yes.** CRM/provider exports or later integrations can treat shared scope as unrestricted, duplicate delivered effects or broaden access via a linked source.                                                                                | High / plausible; distinct owner sources and comparison products' broader sharing.                                                          | No new vendor dependency; source-qualified adapter projection, durable effect identity and no inferred delivery/contact. R04, R07, R10, R15, R17; AC08–AC11, AC22, AC24, AC26.                                                  |
| **20 Migration, rollout, and upgrade risks**                         | **Yes.** Backfilling existing notes as shared or old clients bypassing the new boundary could expose history. Disabling a feature could strand lawful corrections.                                                                            | High / plausible; existing staff-note semantics differ materially.                                                                          | No implicit reclassification, explicit retained-data census, expand/qualify/activate sequence, mixed-version denial and recovery-preserving kill switch. R03, R16; AC25.                                                        |
| **21 Testability, traceability, and proof**                          | **Yes.** Saying “authorized,” “shared,” “beautiful” or “voluntary” without source/UX outcomes makes contradictory implementations appear compliant. A synthetic pass can be overstated.                                                       | High / plausible; literal owner conflict and implementation absence.                                                                        | Exact owner clauses, R01–R20/AC01–AC32, real-role/source/UX gates, dated evidence and separate proof limits. R19–R20; AC27–AC32.                                                                                                |
| **22 Other development hazards**                                     | **Yes.** “Missionaries are not staff” can become a legal assumption or special security bypass; “keep history” can become permanent retention; perfection claims can conceal missing user evidence.                                           | High / plausible; Reliant counterexample and source privacy floors.                                                                         | Autonomy is a bounded product rule, source safety/retention still apply, no fabricated pilot or runtime claims. R01–R03, R14, R19–R20; AC02–AC04, AC23, AC31–AC32.                                                              |

## Exact requirements for the developing spec

- **R01 — Voluntary shared contribution.** The shared-history capability SHALL NOT
  require missionary logging, quotas, check-ins, supervisory review, rankings,
  missing-log penalties or inferred diligence. Reading/writing SHALL NOT enroll
  coaching or managed work. Ordinary permitted use SHALL remain available when
  the missionary records no update. This does not define employment status.
- **R02 — Independent real obligations.** Accepted source work, commitments and
  gift handling SHALL retain their own accountability and lifecycle. Sharing
  SHALL neither create nor complete them. Separately deliberate personal
  follow-through MAY reuse its qualified source without becoming a required field.
- **R03 — Eligible new content only.** Default sharing SHALL apply only to a newly
  authored eligible update deliberately saved in a qualified shared context.
  Existing/private/imported/care/financial/message content SHALL NOT be copied,
  reclassified or summarized into it automatically. A private-note destination
  SHALL expose its true audience or remain unavailable; no author-only promise
  may be inferred from `restricted` or Internal Notes.
- **R04 — Qualified scope.** Create/read/correct/restrict actions SHALL use current
  tenant, exact partnership/source, purpose, field and acting-context authority.
  Tenant, actor and attribution SHALL derive from trusted server context. Source
  policy qualification SHALL precede activation; ordinary saved updates SHALL
  NOT add a second approval once that policy is qualified.
- **R05 — Current and historical access.** New collaborator access to earlier
  history SHALL require the source/history-qualified grant; assignment, linking,
  merge, role title and church visibility SHALL NOT supply it. Revocation SHALL
  apply to future source and derived reads, exports and result recovery without
  rewriting lawful authorship or implying recall of previous disclosures.
- **R06 — Understandable ongoing audience.** The composer/detail SHALL identify
  the exact partnership and current qualified audience meaning, including possible
  authorized future readers, without exposing restricted roster information.
  Intended audience failure SHALL NOT fall back to broader sharing. Reuse source
  audience semantics; do not create a new frozen per-update recipient engine.
- **R07 — One source and attributed contributions.** P9 SHALL own the qualified
  encounter/update record and identity; P27 its development meaning and P28 the
  permitted workspace projection. Distinct contributor notes MAY reference the
  same encounter but SHALL preserve authorship and not duplicate encounter effects.
  A general update SHALL NOT require fabricating an encounter; use the exact
  typed encounter reference where an actual source encounter exists.
  Other message, care, task, finance and content owners SHALL remain authoritative.
- **R08 — Structural and mutation invariants.** Use tenant-aware typed source,
  context and author references, constrained valid visibility states and deliberate
  nullability/defaults. No default SHALL make unclassified data shared. Keep origin
  tenant/context/encounter and author immutable except an explicit source-qualified
  correction preserving provenance; ordinary UPDATE SHALL NOT retarget the row.
  Prevent destructive cascades from ordinary assignment/context removal. Enforce
  authorized old and new row states, least grants, safe views/RPCs/service paths,
  current source fences and exact content revisions; RLS alone is insufficient.
- **R09 — Atomic acceptance and durable recovery.** One authoritative command SHALL
  atomically commit the accepted update, required business/security evidence and
  local durable outcome/effect intent. Duplicate accepted intent SHALL return the
  same effect only after current disclosure authorization; changed content/context
  under the same identity SHALL conflict. Lost replies SHALL NOT create a second
  update. Required local failure SHALL roll back; secondary delivery/projection
  failure SHALL remain recoverable without undoing accepted truth.
- **R10 — Truthful history and consequences.** Preserve source event meaning,
  occurrence date/time when actually known, recorded-at time, contributor and
  corrections. Unknown facts SHALL remain unknown. A save/read/share SHALL NOT
  infer meaningful contact, consent, stage progression, task completion, notification
  delivery/readership or money. A joint encounter SHALL NOT become another call
  because another contributor or surface references it. A truthful source-recorded
  encounter MAY support separately qualified contact measures; D26 does not settle
  their broader criteria or prohibit valid manually recorded encounter evidence.
- **R11 — Lean composition.** Offer one clearly shared Add update/Save update flow,
  persistent audience/instructions, neutral empty/loading/error states, optional
  follow-through and a qualified correction path. No mandatory audience checkbox,
  staff approval, attachment, external message or duplicate logging is introduced.
- **R12 — Draft and asynchronous safety.** Bind draft and command intent to their
  source/partnership/audience context and operation identity. Switching context
  SHALL NOT submit old text elsewhere; late results SHALL NOT clear or replace
  another/newer draft. Show pending, accepted and unknown outcomes truthfully;
  preserve only still-permitted unsent data, recover the same intent and reject
  stale unsafe intent without silently widening. No silent offline replay.
- **R13 — Accessible localized experience.** Compose Core's existing shared UI
  with persistent names/help/errors, keyboard and screen-reader operation, visible
  unobscured focus, non-color-only status and responsive 320 CSS pixel reflow.
  Support long/multiscript names, RTL, date-only facts and timezone travel. Slow
  networks SHALL NOT turn failed/unknown reads into empty history or failed saves
  into successful sharing. Accessibility requires actual consumer verification.
- **R14 — Minimized disclosure and lawful correction.** Apply source classification
  to search/counts/briefs/AI, logs, notifications, exports and caches. No private
  body, metadata or existence leak may be laundered through a shared summary.
  Use minimized audit/telemetry rather than body copies. Qualified restriction,
  correction, retention, anonymization/deletion and backup restoration SHALL
  preserve safety and legally required history without promising endless retention
  or guaranteed recall. No new attachment-storage surface is authorized.
- **R15 — Repairable derived effects.** Source success SHALL be distinguishable
  from delayed views or optional downstream effects. Use existing durable source
  intent/reconciliation and current authorization; no replayed broad broadcast.
  Technical logs, security audit and permitted business history SHALL have distinct
  purposes. Operators SHALL repair through qualified source actions, not raw data edits.
- **R16 — Safe rollout and upgrade.** Census retained notes and writers; do not
  backfill private data as shared. Qualify source/policy/clients before activation,
  reject incompatible writers and rehearse mixed versions, rollback/roll-forward
  and restore. Disabling new shared writing SHALL preserve qualified reading,
  correction/restriction and existing accepted obligations where permitted.
- **R17 — Bounded native capability.** Reuse the existing source, shared components
  and permitted task hooks. Do not introduce a general diary, ACL/team engine,
  surveillance/coaching platform or vendor dependency. This lane SHALL remain
  independent of unrelated optional workflow, newsletter sync or full workspace
  delivery; only its exact required source/projection qualification is a gate.
- **R18 — Measured capacity.** Use scoped, indexed, bounded history reads with
  stable pagination and permission-safe counts; avoid full-history body loads,
  per-entry recipient fan-out and cross-tenant scans. Before activation, record
  numeric workload, payload/page, latency, concurrency and recovery budgets and
  validate at those bounds. No unmeasured quantitative performance promise is made.
- **R19 — Traceable proof.** Carry the exact D26 owner amendments, glossary meaning,
  requirements and outcome tests through /to-prd and separately /to-issues into
  implementation/release evidence. Distinguish source inspection, synthetic
  experiments, actual policy tests and observed user feedback. Do not infer
  production readiness, accessibility or acceptance from documentation checks.
- **R20 — Accountable qualification and operations.** Assign actual owners to the
  named roles in the synthesis before activation. Any privacy/source violation or
  unsafe pilot misunderstanding SHALL block expansion and trigger correction.
  Monitoring SHALL supplement, never replace, preventative authorization and
  source-integrity proof. No unsupported user research or universal agency rule
  SHALL be presented as verified fact.

## Falsifiable acceptance criteria

These are required real-product outcomes, not claims that the feature or these
tests already exist. The bounded experiment below addresses only named mechanics.

| ID       | Outcome that must be demonstrated                                                                                                                                                                                                                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **AC01** | A missionary can view/use the permitted partnership, decline to write and save one eligible update without forced tasks, stages, reports, quotas, coaching, approval or a negative activity/compliance signal.                                                                                                                                                           |
| **AC02** | Sharing and reading never admit/reopen work or add staff status. Existing accepted responsibility remains independently actionable; a gift handoff cannot be completed by a note.                                                                                                                                                                                        |
| **AC03** | An optional personal follow-up is created only by its separately deliberate qualified command; cancellation or failure does not falsely fail/duplicate the saved update.                                                                                                                                                                                                 |
| **AC04** | Existing private, imported, internal, care, location-sensitive and financial content remains protected. The separate private route states real readers; unavailable private capability never falls back to shared.                                                                                                                                                       |
| **AC05** | Cross-tenant IDs, other ministries sharing the same church, wrong purpose/context and forged actor/tenant fields yield no write or unauthorized source/metadata disclosure.                                                                                                                                                                                              |
| **AC06** | A new assignee receives no history without the exact qualified history grant; a properly authorized new collaborator can read the permitted earlier history with truthful audience explanation.                                                                                                                                                                          |
| **AC07** | Revocation before save blocks the save; revocation after save blocks subsequent reads/recovered bodies while preserving lawful accepted history. Test both serialized orders using actual roles and policies.                                                                                                                                                            |
| **AC08** | Additional appeal links, Party merges, acting-role changes and broader church access do not widen the update audience or silently move its origin.                                                                                                                                                                                                                       |
| **AC09** | Staff and missionary see one permitted source update; two distinct attributed accounts of one meeting retain their words and resolve to one encounter without duplicate contact effects.                                                                                                                                                                                 |
| **AC10** | A P6 message, Support/care event and financial record retain their original sources and disclosure floors; linking context does not copy protected bodies or become a competing writer.                                                                                                                                                                                  |
| **AC11** | Update creation/read/share alone cannot change stage, complete a task, send a donor message, grant consent, count money or qualify meaningful contact. An actual source-recorded encounter remains eligible evidence under separately qualified contact criteria, with no duplicate effect from sharing.                                                                 |
| **AC12** | Past, date-only and unknown encounter dates remain distinguishable from recording time across timezones. Departed authors are not replaced by the current owner; corrections retain lawful provenance.                                                                                                                                                                   |
| **AC13** | Paused/closed work can receive source-permitted truthful history/correction without reopening work, reviving reminders or fabricating a present-day encounter from recording/correction time. A genuinely current encounter retains its truthful date and independently qualified effects.                                                                               |
| **AC14** | Actual database roles cannot perform ordinary or unqualified retargeting of tenant/context/encounter/author through direct UPDATE, RPC/view/service paths, even when both old and new rows are individually writable. A separately source-authorized correction preserves provenance and current bounds. Check constraints, grants and policy composition independently. |
| **AC15** | Failure of required local audit/history/outcome writes rolls back the update; duplicate same-intent requests yield one accepted effect; changed payload/context under the same intent conflicts.                                                                                                                                                                         |
| **AC16** | Test save versus revoke/narrow, concurrent edits and different tenant/source commands in both applicable orders. No stale publication, last-writer history loss or unsafe transient state survives commit.                                                                                                                                                               |
| **AC17** | Lost replies recover the same result; retry after access removal cannot return a stored private body or event-existence detail beyond current authority.                                                                                                                                                                                                                 |
| **AC18** | Real grants, permissive/restrictive policies, `USING`/`WITH CHECK`, owner/service-role/definer behavior, search path and unsafe direct writes are tested in the actual environment; synthetic RLS success is insufficient.                                                                                                                                               |
| **AC19** | Draft for partnership A survives an explicit switch safely; it cannot be submitted into B. A late A response cannot clear B's draft or text typed after A was submitted.                                                                                                                                                                                                 |
| **AC20** | Slow saves, dropped replies, session loss and failed audience/history loads show distinct pending/unknown/unavailable states; retry does not duplicate content and no silent offline publication occurs.                                                                                                                                                                 |
| **AC21** | Before saving, a user can identify this partnership, who may read the update and how to avoid sharing sensitive text; changing audience authority while drafting never silently broadens the destination.                                                                                                                                                                |
| **AC22** | Restricted facts do not appear in snippets, titles, counts, search suggestions, AI briefs, telemetry, notifications, exports, cache keys/results or recovered command output. Test all enabled consumers with revoked readers.                                                                                                                                           |
| **AC23** | Correct/restrict a mistaken disclosure through a qualified source action; future unauthorized access and derivatives stop, lawful audit persists, delivered-copy limits are honest, and restore does not republish restricted content.                                                                                                                                   |
| **AC24** | A downstream outage leaves accepted source truth and permitted status recoverable; replay repairs the view/effect once without another update, contact count, notification or permission widening.                                                                                                                                                                       |
| **AC25** | Rehearse retained-data migration and mixed old/new clients with private fixtures; no automatic sharing/backfill or bypass occurs. Kill switch and restore preserve qualified recovery and accepted obligations.                                                                                                                                                          |
| **AC26** | Native shared history works with optional workflow/external-sync products unavailable and without a new diary, duplicated log, mandatory coaching service or blanket shared-account permission.                                                                                                                                                                          |
| **AC27** | Actual composed flow passes keyboard/touch/screen-reader, focus, semantic errors/status, contrast, 320 CSS pixel reflow/zoom and mobile-keyboard checks; shared primitives/axe alone do not prove it.                                                                                                                                                                    |
| **AC28** | Long/multiscript names, RTL, localized dates and timezone travel remain clear; unavailable/loading/filter-empty/no-visible-history states differ without leaking hidden entries.                                                                                                                                                                                         |
| **AC29** | Observe representative missionaries and staff adding, declining, finding and correcting an update. Any unsafe audience/private/coercion misunderstanding blocks pilot expansion until fixed and retested; no fabricated participant count or result.                                                                                                                     |
| **AC30** | Measure declared numeric capacity budgets using multiple tenants, a long-history tenant, maximum payload/page and concurrent authorization changes; bounded indexed plans and permission-safe pagination meet the admitted workload.                                                                                                                                     |
| **AC31** | Q26, D26, glossary and future owner/OpenSpec/design/tasks/tickets/tests/release evidence retain the same autonomy, source and sharing meaning; statuses never claim ratification, implementation or runtime proof not obtained.                                                                                                                                          |
| **AC32** | Release evidence names actual P9, P12/security, P27/P28 product/UX and operations owners, numeric budgets and recovery runbooks. Each monitor below has an assigned recipient and exercised response.                                                                                                                                                                    |

## Pressure tests and proof limits

The new [implementation evidence](d26-evidence/implementation.md) and
[isolated experiment record](d26-evidence/sharing-probe/README.md) report **7/7
passed on the first runtime attempt**, with three observed exact-backend blocking
schedules. Case 1 executes a genuine synthetic nonowner RLS counterexample:
both `USING` and `WITH CHECK` pass when both contexts are writable, yet source
retargeting occurs. Cases 2–7 execute owner-run commands with a fixed synthetic
actor and toy authority flags; they test fixed context, current disclosure,
conflict/retry and required-effect atomicity. Exact executions, results, input
hashes, PostgreSQL 17.11, isolation and exact-container cleanup are retained there.

The narrowing fixture combines read/write loss and admission closure under one
coarse context lock. It does not independently prove each real revocation/source
path. Read-before-narrowing demonstrates database admission order, not recall of
delivered bytes. Read-only historical-result recovery remains possible where read
authority survives loss of write permission; acceptance is not erased by revocation.

This is not actual Core P9/P12 schema, field/action grants, missionary policy,
retention, derived-cache invalidation, UI behavior or a capacity benchmark. No
production vulnerability or live access audit is claimed. Prior experiments were
not rerun. Real-role integration and the actual user flow remain release gates.
Document checks separately verify structure, links, source preservation and record
consistency; they do not transform design requirements into delivered behavior.

## Synthesis and ordered path

**Resolve before recording the answer.** Preserve A only with the exact voluntary
contribution, eligible-new-content, real-audience, source and historical-access
limits above. Explicitly identify P3/P9's contradiction and P28's target/reporting
ambiguity; do not rationalize them away. Distinguish ordinary source use from
policy widening. Compare B fairly and retain protected context outside shared
composition. The corrected decision records these judgments; no small follow-up
vote is needed under D21.

**Capture in spec/design.** On /to-prd, reconcile the five owner clauses, exact
R01–R20 and AC01–AC32 in the source owners and consumer requirements together.
Carry the glossary and current-versus-intended distinction forward. No new ADR is
needed merely to restate current authority; any actual governing contradiction
must be explicitly resolved. Later /to-issues carries those requirements to work
items. Neither command has been invoked in this turn.

**Build/prove in dependency order.**

1. Qualify the narrow P9 source and P3/P12 create/read/history/correct/restrict
   projection. Resolve policy widening through its existing control, without a
   universal approval on updates. Keep P28 voluntary assistance separate.
2. Implement source constraints and one authoritative command, minimal audit and
   current-authority result recovery. Test actual nonowner/service/definer paths,
   authority races and immutable provenance before exposing the composer.
3. Compose one shared record history and clear audience-bound draft flow. Reuse
   source corrections, optional follow-through and permitted derived views; no
   automatic surveillance, default broadcasts or extra journaling product.
4. Prove privacy/revocation across enabled consumers, recovery, accessible/mobile
   behavior and real missionary/staff comprehension. Resolve observed confusion
   in the flow; do not substitute more mandatory confirmations for clarity.
5. Census retained data and old writers, rehearse safe rollout/restore, measure
   workload and run a bounded authorized pilot with named operational ownership.
   Expand only after source, privacy and user-outcome gates pass. Disabling new
   writing must not destroy lawful history or strand qualified correction.

**Monitor only residual operational risks.** Named roles must be assigned to actual
people/on-call teams before activation. These thresholds are proposed operating
triggers, not claimed measured performance promises. Privacy, autonomy and source
integrity are preventive release requirements, not concerns deferred to monitoring.

| Signal                                                                                                          | Threshold                                                            | Named accountable owner                   | Response                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Unauthorized body/metadata disclosure, wrong-context save or stale recovered result                             | Any one verified occurrence                                          | P12/security owner with P9 source on-call | Contain affected write/projection, follow incident process, restrict/reconcile derivatives and requalify; no deletion of required evidence.    |
| Shared history imposes reporting/quotas/coaching or a pilot user believes private content is shared incorrectly | Any one confirmed behavior or unsafe misunderstanding                | P27/P28 product/UX owner                  | Stop expansion, remove coercive coupling or fix audience flow and retest with affected users.                                                  |
| Accepted update lacks required local audit/result or duplicates an encounter effect                             | Any one verified occurrence                                          | P9 source on-call                         | Contain mutation path, reconcile through qualified source correction and add real regression proof.                                            |
| Accepted source outcome has a stale required view or terminal reconciliation failure                            | Older than 5 minutes, or any terminal failure                        | P9 integration operations owner           | Show truthful accepted/pending state, replay exact durable intent and verify current audience; never create another update.                    |
| Sensitive correction/restriction cannot be carried out through qualified recovery                               | Any one confirmed case                                               | P9 data/privacy operations owner with P12 | Contain disclosure immediately, exercise source recovery and repair the broken action; no routine direct database edits.                       |
| Admitted workload budget exceeded                                                                               | Three consecutive 5-minute windows, or one exhausted recovery budget | P9 database/operations owner              | Bound affected requests, inspect scoped plans/backlog, repair capacity without weakening authorization. Set numeric budgets before activation. |

## Adversarial check

### What could go wrong with this answer?

“Shared” could become all-staff surveillance or expose existing private context.
Source reuse could publish to the wrong partnership or replay revoked content.
The amended scope, voluntary lane, exact qualified audience and source-command
requirements address those failures without adding mandatory approvals.

### What hidden assumptions are we making?

That clearly shared routine context improves coordination is a product judgment;
we have not measured tenant preference. Missionaries' agency relationships vary.
Current source code is adjacent functionality, not proof that required permissions,
privacy recovery or UX already work. Real policies and observed use must qualify them.

### How does this affect the whole product?

It requires a narrow P9/P3 shared projection exception, P12 qualification and an
explicit P28 autonomy limit while retaining one source log. It adds no new money,
message, care or task authority and does not introduce controls on donor/public
surfaces. Staff source work retains its existing accountability.

### How does this affect the end-user experience?

A missionary can share useful context once, understand its audience and get back
to ministry work. Staff see the same permitted context. Nobody must fill a report,
choose a task or seek approval merely to write. Correction, pending saves and
unavailable/private destinations are clear rather than silently guessed.

### Does this follow modern best practices?

It uses explicit context, minimal disclosure, truthful provenance, current access,
durable recovery and accessible progressive disclosure. Current missions examples
support collaboration but also contain supervision policies Core should not copy.
Official UX/database sources support safeguards, not invented universal workflows.

### Does this fit Asym’s existing repo and product direction?

Yes, with the explicit owner amendments. The roadmap calls for one shared-source
history and distinct missionary UX; current absolute note exclusions need narrow
reconciliation. Current `standard`/`restricted` fields and activity screens are
not enough to activate it. Shared UI, source ownership and optional-product
independence are preserved.

### Should we adjust the recommendation?

**Accept with required amendments.** Retain shared working history and explicitly
protect missionary choice, source boundaries and actual audience. The full review,
exact clauses, requirements, outcome tests and ordered qualification are recorded.
The [document checks](d26-evidence/review-checks.json) verify this research package;
they do not claim a shipped or user-validated feature.

## Explicit ratification

The founder explicitly ratified this amended D26 on 2026-10-11 (Asia/Bangkok).
The exact corrected decision, five proposed owner clauses, R01–R20 and AC01–AC32
are unchanged. Voluntary missionary participation and current source/audience
boundaries remain integral to the decision; this does not activate a permission.
All six original evidence appendices, the 7/7 experiment and the original 29-check
review report remain dated evidence. No runtime experiment was rerun.
The [ratification/continuation checks](d26-ratification-q27-validation.json) verify
this status update, preservation and the next substantive question. Formal owner
reconciliation/specification and ticket publication remain separately invoked
through /to-prd and /to-issues.
