# Q66 — Choose the concrete records-policy example

**Current status:** Conrad fully ratified **Q66 A, full tenant flexibility/changeability and all required amendments**, including Document Records Policy, on 2026-10-29. The [ratified review](phase29-q66-adversarial-review.md), [ADR0066](../docs/adr/0066-tenant-controlled-ordinary-document-records-policies.md) and [applied consequential amendments](phase29-q66-consequential-amendments.md) record the complete decision and scoped Q62/Q63/Q65 supersession. Earlier question/review material is dated history. One researched Q67 question is authorized without selecting its answer or claiming GF approval/native readiness.

## Historical question preparation — before selection, 2026-10-29

2026-10-29, Asia/Bangkok. **Q01–Q65 are fully ratified. Q66 is unselected.** This question selects the evidence for the next bounded policy-mapping exercise. It does not approve a records schedule, choose a retention period, change Q65 or authorize implementation.

## The practical question

We now have a documented workflow and its two distinct purposes: collect/review a partner's requested agreement evidence, and optionally admit suitable evidence for ongoing partner reference. The remaining policy work needs an actual organizational context. Core's generic mechanisms and a document called an agreement do not supply that context.

A targeted connected-document search found an existing **Global Fellowship** package: a records schedule, security/records/legal-hold procedure and review notes prepared on 23 October 2026. The schedule and procedure are marked **For approval**; the inspected procedure's approval/effective-version field is blank. Approval or an operative successor may exist elsewhere, but the inspected text does not establish either. These documents are useful concrete evidence, not already-approved Asym rules.

**One decision: should we use this Global Fellowship draft package as the first worked policy example, or use a different organization's policy?**

| Option                                                                              | What happens next                                                                                                                                                                                                             | Benefit                                                                                                                               | Tradeoff                                                                                                                                                   |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Use the Global Fellowship draft package as the worked example (recommended)** | Map only the relevant collection and ongoing-reference obligations against the ratified Core model. Identify actual matches, conflicting meanings, missing facts and responsible-owner decisions. Keep draft status explicit. | Uses real available ministry material without making the user recreate it; exposes concrete gaps while preserving tenant flexibility. | It is not verified as an operative policy or an observed instance of the Core workflow. Applicable classes, authority and exact rules still need evidence. |
| **B — Use another organization's policy**                                           | Use a preferred actual organization and its named policy/reference, whether approved or explicitly still a draft, with its real status recorded.                                                                              | Better when another organization is the intended first tenant or has a more applicable approved schedule.                             | Needs that organization/policy identified; its authority and applicability still require checking.                                                         |

**Recommendation: A for the worked example.** The relevant material is already available, so it is more useful than inventing a universal trigger or asking staff to fill a policy questionnaire. If another operative schedule is the intended first baseline, B is stronger evidence and should take precedence. Either choice preserves a general product with source-approved tenant variations; it does not make Global Fellowship's policy the default for all tenants.

For A, no reupload or private agreement is needed. For B, the organization name and policy reference are enough to start; we will research the supplied source before asking for genuinely missing facts. This is one evidence-selection question, not a request to decide every legal field now.

## Why this is the next question

The ratified [Q61 source register](phase29-q61-source-register.md) still identifies **R-POL-ordinary**: actual classes, applicability, typed starts, preservation/privacy bounds, permitted choices, hold powers and disposition evidence. [Q62](../docs/adr/0062-approved-policy-application-for-ordinary-requests.md) settles applying a qualified policy with a clear summary; [Q63](phase29-q63-adversarial-review.md) permits only expressly policy-authorized automatic disposal. [Q64](phase29-q64-adversarial-review.md) supplies the collection reference; [Q65](../docs/adr/0065-optional-source-owned-partner-document-reference.md) supplies the optional continuing-use contract. None declares an ordinary tenant's actual schedule approved.

We considered asking whether retention should start at receipt or at collection completion. Both are established mechanisms. Choosing one before identifying the governed record obligation and its actual policy would add unsupported semantics. It could also incorrectly give a later acceptance-correction record an already-expired interval or restart all earlier evidence. That abstract trigger vote is therefore not the next question.

The actual source binding, retained-data census, effective native Auth/RLS/custody and intended-user qualification remain separate evidence requirements. Choosing a policy example cannot close them. It also cannot expand the selected workflow into grant administration, signing, clinical records or financial authority merely because a candidate schedule mentions those areas.

## Connected evidence and read limits

The parent searched Google Drive for retention policy and read the complete returned text of these three relevant documents. The bounded search returned ten results; a separate bounded Pages search supplied no relevant policy evidence. Neither search proves that no other schedule or approval exists. Only relevant provenance, status and bounded findings are retained here; raw private policy bodies and their legal-period examples are not copied into Core.

| Source                                                                                                                                                                      | Observed metadata/status                                                                                                 | What it establishes for this question                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [GF — Records Retention Schedule — 2026-10-23](https://docs.google.com/document/d/1X2CwpK3buhnJNskY79ya3uTscyZScqS6WJrBqWy0Xbs/edit)                                        | Prepared 23 October; modified 25 October 2026 at 07:42:41 UTC; marked For approval.                                      | An organization-specific candidate with differentiated record purposes and obligations. Its scope is GF's records, not automatic control of independent partners' records. It does not establish one retention period for this Asym profile. |
| [GF — Information Security, Records Retention, and Legal-Hold Procedure — 2026-10-23](https://docs.google.com/document/d/1PDnCasu6c_cTdPVvIo69zKeqwmGw7yaVMoIiGBptZZM/edit) | Modified 25 October 2026 at 07:41:10 UTC; marked For approval; approval/effective-version field blank in inspected text. | Candidate responsibilities, preservation, access and recovery context. A policy text is not a verified native permission, backup, tenant binding or operational approval.                                                                    |
| [GF — Information and Records Review and Use Notes — 2026-10-23](https://docs.google.com/document/d/17UbqS9jigldFV72Cx8tnC7vuRshnc92L54rj89XRVAw/edit)                      | Modified 25 October 2026 at 07:43:19 UTC; internal reference; authorization/effective-version record blank.              | Explicit draft/adoption distinctions and applicability/implementation gaps. Existing obligations are not silently shortened by newer working material.                                                                                       |

**Verified fact:** the candidate documents exist and have the inspected status/text. **Product recommendation:** use them as a bounded worked example. **Not established:** actual adoption, operative successor, intended first tenant, live GF-to-Asym identity mapping, observed use of the GEN-05 flow or the final policy for each record class. No legal conclusion or statutory period is imported from these drafts. If a later mapping relies on a legal rule, its current primary authority and actual applicability must be checked then.

Authenticated remote develop remains `629cb71dc206dd9aa7b2d5ed15aaf57914eee071`; the local grooming checkout remains `3d85897ebf1515008ef5c676b1c58a15422fb9ab`. No pull/reset occurred. Independent [owner](phase29-q66-owner-research.md), [runtime](phase29-q66-runtime-research.md) and [UX](phase29-q66-ux-research.md) notes preserve exact inspected Core scopes and evidence distinctions.

## Modern practice and limits

| Primary source checked 29 October 2026                                                                                                                                            | Relevant practice                                                                                                                           | What Core does with it                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Microsoft Purview records management](https://learn.microsoft.com/en-us/purview/records-management) and [file plan](https://learn.microsoft.com/en-us/purview/file-plan-manager) | Existing organizational schedules can be mapped; start basis, duration, disposition mode and authority descriptors are distinct.            | Map actual obligations and approval evidence. No Purview implementation, default clock, permissions model, classifier or policy console is selected.                                                                     |
| [Box retention policies](https://support.box.com/hc/en-us/articles/360043694374-About-Retention-and-Retention-Policies)                                                           | Policy configuration aligns with organizational rules; users can inspect retention information; several start mechanisms exist.             | Preserve Q62's concise visible summary. Do not import folder authority, date-reset behavior, longest-policy precedence, provider deletion claims or numeric examples.                                                    |
| [NARA scheduling guidance](https://www.archives.gov/records-mgmt/scheduling/sch-records)                                                                                          | Record descriptions and applicable disposition instructions precede implementation; age-based and event-based approaches are both possible. | Supports identifying the actual obligation before choosing a timer. This is US federal records guidance, not a nonprofit schedule or applicable law for every tenant. No federal approval process or period is imported. |

These are documented product/mechanism examples and source-management guidance, not evidence of Asym user satisfaction or approval of the candidate policy. No further feature, third-party integration or general-purpose records engine is needed for this evidence-selection step.

## Preliminary mapping to make the choice concrete

The following is a **worklist, not a policy assignment**. It identifies the work A would perform and equally applies to a supplied B source. No row receives a guessed retention value or automatic disposal eligibility.

| Core obligation to distinguish                             | Useful candidate evidence                                       | What must be resolved in the actual mapping                                                                                                                  |
| ---------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Original collection/review record                          | Candidate purpose and responsibility distinctions               | Exact governed record class and responsible authority; an unsigned requested document is not automatically a signed-contract class.                          |
| Accepted originals, complete evidence units and assemblies | Candidate preservation and material-evidence context            | Required versions, dependencies, copies, applicable period/trigger precision and any independent bounds; a summary does not automatically replace originals. |
| Optional Partner Document Reference                        | Candidate continuing-purpose and obligation context             | Independent reference-purpose policy, exact admission/basis and ending consequences; Q65 End is not a universal retention or deletion event.                 |
| Later correction and decision history                      | Candidate decision/evidence context                             | Separate treatment of a later act; do not restart old receipt/acceptance facts or silently place new records under an elapsed old clock.                     |
| Clarifications, access/control and security evidence       | Candidate differentiated messages/permission/security treatment | Which facts are necessary for which purpose; no retention of every conversation or universal agreement-body permission.                                      |
| Backups, residual copies, holds and recovery               | Candidate preservation/recovery and disposal context            | Actual covered copies, hold powers, disposition mode, recovery window and restoration behavior; written intent is not verified physical recovery.            |

The mapping must identify for each affected class its source/authority, purpose/applicability, policy/version, typed trigger and date precision, preservation/privacy bounds, authorized choices, hold/stop powers, disposition/recovery and closure evidence. Existing Q64/Q65 fields supply that structure. Unknown fields remain specifically named, with their affected action and responsible owner; they are not new frontline form fields or permission to retain everything forever.

## Ten boundaries under either answer

1. **Candidate versus operative authority.** A working document, modified date, available link, owner title or this answer does not prove approval. Locate the actual approved version and applicability before any consequential source binding. If approval exists elsewhere, reconcile that evidence rather than claim it cannot exist.
2. **Actual organizational scope.** GF is a candidate example only. Do not infer that it is the deployed first tenant, that the documented Core workflow is observed GF practice, or that its policy governs independent partners or every Asym tenant.
3. **Independent purposes and prior decisions.** Preserve all Q01–Q65 and the complete optional reference lifecycle. Original collection, later correction, ongoing use, communications/control and copies retain their own real obligations. No new signing, grant or clinical authority follows.
4. **Actual policy fields.** Classify the real obligation before mapping a typed trigger/period. Do not use generic created_at, upload, request completion, relationship end, last read, country from timezone or storage region as substitute evidence. Later facts do not rewrite historical dates.
5. **Disposal and holds.** The candidate text does not establish authority for automatic destruction merely because time passed. Q63's flexible platform capability remains ratified, but this profile cannot use it without express actual policy authorization and complete qualification. Missing authority stays an affected gate; existing independent duties and lawful unrelated routines remain intact.
6. **Supabase/Auth/Tenant boundary.** Drive access and organization names/IDs supply no Asym Tenant, actor, role, approval or service permission. Actual current identity/source/P12 decisions, coarse Tenant RLS, typed same-scope relationships, old/resulting-row checks, every-door projections and custody ordering remain required. A mapping artifact is not a new runtime write authority.
7. **Private-source handling.** Keep minimal source references and status in planning. Do not publish raw private policy bodies, agreement contents, legal advice, personal/care/location data or credentials. A private source link grants no product access; a later public artifact should use an authorized minimal summary.
8. **Close concrete gaps without blocking unrelated work.** The mapping must state each unresolved approval/applicability/binding fact, its owner, affected action and closure evidence. Native tests and real legacy/copy evidence remain separate qualification. Unknown is neither a guessed safe default nor a blanket stop on every tenant/source.
9. **Simple staff experience.** Reuse Q62's approved-default summary and Q65's contextual actions. This analysis does not add a tenant-wide policy wizard, per-request legal attestation, mandatory preview, extra approver, new notification or generic records console.
10. **Stage and trace.** Q66 selects only the first concrete mapping context after the user answers. It remains unselected now. No new glossary term or ADR0066 is warranted merely for a reversible example choice. Formal publication stays explicit /to-prd and /to-issues; there is no implementation, provider/database mutation, live disposal, outreach, deployment, commit/push or Q67 selection.

## Twelve composed checks for the next mapping

| ID  | Situation                                                          | Required outcome                                                                                 |
| --- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| J01 | The identified package is still a draft                            | Useful planning continues; no operative policy or deletion authority is inferred.                |
| J02 | A separate approval or newer policy is identified                  | Verify scope/version/effect; reconcile the actual authority and preserve provenance.             |
| J03 | Another organization is the intended first example                 | Use its actual context; do not carry GF's policy across tenants.                                 |
| J04 | Requested agreement is unsigned or has a different purpose         | Determine the real class; do not map by title alone.                                             |
| J05 | Collection completes and reference is independently added          | Distinct source purposes and policies; no mandatory new byte copy or invented shared timer.      |
| J06 | Reference ends or is replaced                                      | Preserve collection/history, other uses and actual Q65 consequences; no automatic deletion.      |
| J07 | A later acceptance correction occurs                               | Preserve old facts; map the later act and current reliance separately.                           |
| J08 | A hold or privacy/preservation conflict exists                     | Actual current authority and conflict handling; no longest/shortest winner by guess.             |
| J09 | Policy name is visible but reader/body authority is absent         | No tenant membership, document access, source history or mutation grant from the mapping.        |
| J10 | No actual trigger/bounds or approved automatic mode is established | Identify the precise affected gate and capable owner; no guessed clock or disposal.              |
| J11 | An old dataset or backup has unknown classification                | Use R-LEGACY and actual copy/restore proof; no backdated policy assignment or revived ended use. |
| J12 | Staff issues or maintains ordinary work after qualification        | Existing simple visible summaries and contextual actions; no new recurring policy form.          |

These are falsifiable review tasks, not completed native, legal, provider or user-study tests. They preserve Q65's 18 implementation proof groups and the earlier source/qualification gates.

## Adversarial check

### What could go wrong with this answer?

A real ministry draft could be mistaken for an approved global default, or a source document's author could be treated as a live tenant approver. The recommendation is explicitly a worked example; actual authority, scope and all runtime gates remain separate.

### What hidden assumptions are we making?

That Global Fellowship is a useful first example for the user. This is the one choice being asked. Neither its actual workflow, approval, jurisdictional applicability, live tenant identity nor current system configuration is assumed.

### How does this affect the whole product?

It grounds the already-ratified mechanism in concrete source material without specializing the product to one ministry. It preserves independently approved source/tenant variants and every specialist owner.

### How does this affect the end-user experience?

The agent performs the policy mapping once in planning. Ordinary staff continue seeing the meaningful approved summary and normal actions. The user need not reupload documents already found or invent policy values on every request.

### Does this follow modern best practices?

Yes as a research sequence: map actual organizational obligations, distinguish approval from configuration, and keep start basis/duration/disposition separate. Current primary examples support several mechanisms; they do not justify selecting an arbitrary one for an unidentified obligation.

### Does this fit Asym’s existing repo and product direction?

It directly addresses R-POL-ordinary under Q61–Q65 while retaining source ownership, current P12/Auth/RLS and custody/disposition safeguards. It does not change native authority or promote connected documents into Core's governing contract by discovery alone.

### Should we adjust the recommendation?

Recommend **A — use the available Global Fellowship draft package as the first worked policy example**, unless the user identifies a more appropriate operative policy under B. Do not ask for an abstract retention timer or another optional feature before doing that concrete mapping. Q66 remains unselected.

## Independent question review

Owner, runtime and UX reviewers read the complete question at SHA256 `eb64ecd4b41cc8454e341befc2d8c850129f1a4f1398d4450fe641218028ea11`. Their linked notes reconcile the actual connected-source discovery, Core authority, six preliminary mapping rows, ten boundaries, twelve composed checks and seven founder checks. No unresolved material question-scope finding remains. The exact known GF documents are candidates for the worked example, not adopted source policy; approval/operative applicability is not established by the inspected text and is not claimed universally absent.

Q66 remains unselected. The first example recommendation imports no statutory period, generic timer, tenant grant, manual-only platform restriction or automatic-disposal authority. Source provenance and bounded findings are retained without raw private policy bodies. Task-local `phase29-q65-ratification-and-q66-verification.json` records preservation, structure, links and exports, accompanied by scoped formatting checks. No new ADR/glossary term, native/hosted/user qualification, formal publication, implementation or Q67 is inferred.

## Historical selected answer and review — before ratification, 2026-10-29

Conrad selected **Q66 A — use the GF drafts as the worked example**, and expressly requires **full tenant flexibility and changeability**. **Accept with required amendments; full ratification pending.** The [complete review](phase29-q66-adversarial-review.md) and [proposed ADR0066](../docs/adr/0066-tenant-controlled-ordinary-document-records-policies.md) contain the identical22-clause decision and proposed Document Records Policy definition. The [exact consequential amendments](phase29-q66-consequential-amendments.md) reconcile earlier Q62/Q63/Q65 no-editor/code-owned wording at17 locations without silently editing prior ratified artifacts.

Authorized tenants own supported ordinary business-policy definitions and values, including blank/copy/custom authoring, draft edit, qualified activation, explicit existing-record application/correction, independent disposal pause/resume, retirement and fresh qualified reactivation. This is not preset-only or routine Asym developer/support work. The ordinary source owns semantic meaning/current applicability; P12 owns current powers/projections and P29 actual custody/disposition. Specialist source policies and platform capability/field meanings retain their owners. No universal rule/SQL language, general permission engine or mandatory second approver is introduced.

Governing changes use immutable effective meaning and successor drafts; source-proved non-operative label/detail edits can avoid pointless version churn while retaining attribution and historical displays. Prospective defaults do not postpone already-applicable duties: affected unsafe consequences are fenced before bounded current-impact reconciliation. Historical assignments and original results remain true. Existing-record changes have exact reviewed scope/current proof, truthful partial outcomes and capable recovery; no silent mass propagation or false rollback of physical effects. Pause works independently of invalid drafts; resume/reactivation require fresh current authority. Tenant changes cannot override independent obligations/holds, forge historical facts or grant body access.

The six-group GF mapping distinguishes ordinary collection, qualifying agreement evidence, ongoing reference, later corrections, communications/control and hold/copy/recovery obligations. The drafts' “requests” wording is not ordinary collection authority, and an uploaded agreement is not an executed contract by title. Approval/applicability/actual mode and profile values remain unestablished where not supplied; no raw private bodies, legal periods or global GF template is shipped. Existing Q62 simple issuer summaries and Q65 reference journeys remain complete.

Independent reviews reconcile all22 categories,eight analytic traces,28 journeys,18 native proof groups,four finite profiles,five accountable controls and seven founder checks. Current source remains629cb71dc206dd9aa7b2d5ed15aaf57914eee071. Actual native Auth/RLS/grants/context, policy-schema compatibility, custody/Stop races, legacy/copy/restore and intended-user evidence remain explicit qualification gates. Source/structural review is not native or hosted success.

ADR0066 records the durable new tenant-authoring boundary; Document Records Policy is the sole proposed term. All63 earlier ratified feature ADRs,34 Files terms and the entire root glossary remain unchanged at this review stage. Formal source/OpenSpec/design/tasks and tickets remain explicit /to-prd and /to-issues. No actual policy adoption, live reference/disposal, code/provider/database mutation, outreach, deployment, commit/push or Q67 is inferred.

## Full ratification — 2026-10-29

Conrad explicitly instructed on 2026-10-29, Asia/Bangkok: “Yes, fully ratify Q66 A with all required amendments, including the new glossary term. Record it and move to the next question in this Phase 29 grill-with-docs session, with research, practical options, and your recommendation.”

Q66 A, the explicit full tenant flexibility/changeability requirement and the entire reviewed package are fully ratified: 22 exact clauses, 22 category outcomes, six GF mapping groups, eight analytic traces, 28 composed journeys, 18 native proof groups, four finite profiles, five accountable controls and seven founder checks. C01–C21 remain exact; C22 changes only adoption, consequential-application and next-question-stage wording. All ten inverse-verified review refinements and independent full-package crosswalks remain preserved as dated evidence.

ADR0066 is ratified and Document Records Policy is adopted beside File Purpose. Preserve all 34 prior Files terms and the entire root glossary; Files now has35 terms and64 feature ADRs are ratified. Apply the nine reviewed consequential edits at17 exact locations in the Q62/Q63/Q65 ADR/review pairs and the Q63 ADR consequence. The sole stage normalization removes “proposed” from the now-adopted term in that consequence; no business meaning changes. Preserve each former statement as dated provenance and every unrelated byte/semantic requirement.

Authorized tenants own supported ordinary policy definitions and business values, with blank/copy/draft/activation, explicit existing-record impact, correction, independent Stop/Resume and retirement/reactivation. This is real self-service rather than Asym-only presets or routine developer/support configuration. Governing meaning remains versioned and historical facts immutable; source-proved non-operative metadata correction avoids needless version churn. Mandatory current duties cannot wait for optional impact work while unsafe effects continue. Tenant control preserves independent holds, applicable obligations, exact source attribution, current authorization and truthful physical outcomes.

The GF drafts remain a worked example with the reviewed classification and approval limits. The mapping does not convert ordinary collection into privacy requests or uploaded agreements into executed contracts. No actual GF approval, live Tenant, legal period or native source/custody/provider/user qualification is established by this product ratification. Current authenticated develop remains629cb71dc206dd9aa7b2d5ed15aaf57914eee071, unchanged; local checkout remains3d85897ebf1515008ef5c676b1c58a15422fb9ab, with no pull/reset.

Q01–Q66 are fully ratified grooming intent with the explicitly recorded scoped supersessions. One researched Q67 question is authorized without selecting its answer. Formal source/OpenSpec/design/task publication remains explicit /to-prd; tickets remain /to-issues. No implementation, hosted/provider/database mutation, live policy/disposal, outreach, deployment, commit or push is inferred.
