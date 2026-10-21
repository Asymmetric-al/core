# D15 — Connected personal sending: product and privacy boundaries

**Subsequent status — October 16, 2026 UTC:** the founder explicitly ratified the
[corrected D15 decision](../phase28-d15-connected-email-adversarial-review.md)
and its required amendments. That synthesis governs where this original research
contribution leaves options open or uses provisional wording. This note remains
evidence of the research performed; ratification proves no runtime capability.

Research only, October 16, 2026 UTC. The founder selected optional individual
connected-account sending. This note recommends the smallest useful extension
and the exact privacy/owner corrections it needs. It does not ratify the proposed
clauses, amend formal owners, qualify providers or establish implemented behavior.
The earlier Q15 note's awaiting-answer language is dated provenance, not the
current answer status.

## Recommendation and strongest alternatives

**Accept with required amendments.** A useful initial product lets a currently
authorized missionary deliberately write to one eligible contact, review the
actual recipient and proved personal sending account, send through the shared
communication boundary and see truthful submission/outcome evidence without
manually entering a duplicate sent-message fact. Native relationship work and a
clearly labeled email-app handoff remain useful without a connection.

This should work for an eligible restricted prospect as well as an eligible shared
CRM contact. It must not make D2 staff sharing a condition of emailing a prospect.
Eligibility still needs exact source, address, contactability and disclosure
qualification; restricted preparation alone establishes none of them. The
canonical Party branch and a specifically qualified restricted-preparation
no-Party branch are distinct permitted recipient authorities, never fallback
interpretations of an arbitrary address.

| Alternative                      | Strongest case                                                                                                     | Consequence for selected A                                                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Email-app handoff                | Least implementation/credential burden; uses the user's mature composer, attachments and reply workflow.           | Retain as honest fallback. Opening it proves no send, and it alone does not fulfill connected sending or automatic actual-outcome recording.       |
| Native tenant sender             | Reuses the existing organization Resend topology and common operational evidence.                                  | A different From/reply identity and relationship experience. It must not silently replace the selected own-account sender when a connection fails. |
| Bounded connected sending        | Completes one deliberate individual follow-up inside Asym with the actual personal account and one evidence chain. | Recommended. Qualify one useful provider profile before offering it, without promising a full inbox.                                               |
| Full mailbox/CRM synchronization | Adds broad inbox search, threading, contacts and richer external correspondence history.                           | Not selected; much larger disclosure and lifecycle scope. No read-all permission or imported history follows from A.                               |

No user interview, provider-preference distribution, message volume or measured
time saving was supplied. Reduced switching and duplicate recording are product
hypotheses supported by the selected job, not observed usage facts.

### Useful initial limits, not invented permanent exclusions

Recommend one explicit recipient per message, a normal subject and safely rendered
authored text with ordinary permitted links, one deliberate Send and replies in
the sender's email application. No Cc/Bcc, file attachments, contact-list fan-out,
automated sequences, arbitrary headers, send-as/shared mailboxes, inbox reading
or reply synchronization is required to deliver the selected individual job.

The single-recipient and no-attachment limits are review recommendations, not
pre-existing owner prohibitions or separate founder selections. Cc to a couple
and an attached support document are plausible useful jobs; do not pretend their
absence is costless or that all individual email is inherently one address.
State the initial limit plainly and test representative follow-up tasks. An
independently authorized email-app handoff can serve a richer message, but cannot
be advertised as automatically tracked or be offered as a harmless second send
while the managed send remains uncertain. Adding recipients or attachments later
needs exact purpose, custody and recipient-specific consequences, not a general
mailbox engine or arbitrary permission matrix.

## Exact inspected evidence

Paths are relative to `/workspace/core`. Owner intent, reviewed decisions and
current implementation remain separate evidence classes.

| Ref | Source and inspected lines                                                                                                                                                                             | Governing fact or limit                                                                                                                                                                                                                                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E01 | `docs/features/missionary-workspace-depth/grill/phase28-founder-brief.md:111–129,241–249`; `phase28-q15-personal-email-connection-research.md` in the same directory                                   | P6/P17 own communications; opening a mail app is not a sent message; exact email scope remains source-qualified; no broad mailbox/address-book ingestion or silent offline sends. Q15 states the selected individual job and its alternatives. Its implementation observations are a linked bounded trace, not a new runtime test in this subtask.                            |
| E02 | `docs/features/missionary-workspace-depth/grill/phase28-d1-adversarial-review.md:30–59`                                                                                                                | Restricted contact assertions and preparation are protected from ordinary staff, including discovery/derivatives. Saving establishes no consent or canonical admission. P4/P9/P12 remain owners.                                                                                                                                                                              |
| E03 | `docs/features/missionary-workspace-depth/grill/phase28-d2-adversarial-review.md:40–69`                                                                                                                | Deliberate staff CRM availability shares eligible contact facts, not private notes/history, and does not contact the prospect or imply consent/subscription.                                                                                                                                                                                                                  |
| E04 | `docs/adr/0209-static-field-policies-and-subtract-only-projection.md:16–37`; `docs/adr/0212-one-export-policy-and-shared-csv-safe-cell.md:15–30`                                                       | Whole-field classification, one subtract-only resolver, no per-value provenance/runtime policy engine; visibility is not exportability. Internal/care/security content cannot escape via governed output. P17/P6 remain the preparation/dispatch owners. CSV encoding is not an email-content sanitizer.                                                                      |
| E05 | `docs/adr/0211-distinct-human-approval-for-projection-widening.md:16–37`                                                                                                                               | Actual policy widening requires distinct-human approval; this is not generalized approval for ordinary authorized edits or each Send.                                                                                                                                                                                                                                         |
| E06 | `openspec/changes/sitestacker-parity/specs/identity-and-access/spec.md:3–11,41–51,86–104`; `docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552–1556,1584–1588,1643–1655` | One validated context, current delegated execution, unknown-family fail-closed classification, exact source/egress purpose and contactability. Readable is not contactable; caller-declared purpose, another hat or provider credentials grant nothing.                                                                                                                       |
| E07 | `docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md:135–141,175,322–325,387–433`                                                                                                | One send seam and communication spine; exact recipient branch, including explicitly contract-permitted same-Tenant no-Party authority kind/id/revision without durable address. Later body-free history and bounded Recent sent copy supersede the old durable-subject/address shorthand. P16's stricter canonical recipient rule is not an arbitrary-address escape for D15. |
| E08 | `docs/adr/0029-tenant-owned-resend-and-composed-delivery-identities.md:18–23,43–59,73–80`; `docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md:3722–3735`                    | Current accepted email topology is one tenant Resend connection and fixed composed sender/reply identities. Personal missionary mail and multiple providers are explicitly excluded; D15 requires a narrow explicit amendment rather than direct SDK calls or a P31-only extension.                                                                                           |
| E09 | `docs/adr/0031-body-free-history-with-expiring-recent-copy.md:18–50`; P6 at E07 lines 398–417                                                                                                          | Permanent history is body-free; an ordinary personalized subject is content. Readable recent copies require a structurally support-safe class, bounded retention and their own exact current disclosure authority. Restricted/high-risk classes do not gain readable copies.                                                                                                  |
| E10 | `docs/prds/sitestacker-parity/phase-27-donor-development/context.md:7–13,17–49,93–115,132–154`; `docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:915–930`                   | Personal messages are not imported into shared history; shared context has its exact qualified audience. Protect bodies and metadata/derivatives. Sent personal email is outreach, not a completed human exchange, work completion or compulsory reporting.                                                                                                                   |
| E11 | `docs/prds/sitestacker-parity/phase-04-identity-account-claiming-foundation.md:491–495`; P9 at E10 lines 388–398,917–928                                                                               | Spouses/teammates remain distinct identities; relationship/shared email grants no collapsed identity, unioned grants or automatic history retargeting. P9 contact normalization remains a bounded owner seam, not permission for D15 to invent another contact master.                                                                                                        |
| E12 | `docs/prds/sitestacker-parity/roadmap.md:4431–4443`                                                                                                                                                    | P31 owns connection/transport facts; source owns action eligibility, business-effect identity and outcome. Connected is not delivered or business-complete. Reuse infrastructure rather than build an independent personal-email delivery engine.                                                                                                                             |

## Free-authored text and governed CRM information

Freshly authored correspondence is a new source record family. Register and
classify its complete subject/body and derived representations for this exact
purpose before release. Ordinary composition can then be useful without a field
picker or approval for every sentence. Do not classify all newly typed material
as safe solely because it was typed, or infer that reading an internal note
authorizes sending it externally.

For system-fetched or generated content, enforcement is concrete: recipient
addresses, merge values, snippets, quotations, summaries, links, signatures and
templates must come through their qualified source/export projection. No protected
note or sensitive financial/care value becomes exportable by rendering it into
an email. Avoid adding such insertion features initially if no exact qualified
consumer exists.

For arbitrary user typing/pasting, a static field policy cannot prove the semantic
origin or safety of every phrase. State the permitted content rules honestly and
do not claim that manual retyping of protected facts is technically impossible.
Do not invent per-value provenance, semantic DLP or AI approval as a hidden
dependency. If a source/body is known to have a protected classification, changing
its representation or calling it personal email cannot remove the restriction.

The external mailbox also remains an external retention/access surface. A personal
account label, send-only OAuth permission or a private Asym composer does not mean
only the author can view the provider's Sent folder or recipient's copy. Explain
the actual sender/recipient before Send; preserve current organizational egress
and residency requirements without pretending a delivered email can be recalled.

## Concern register and exact candidate clauses

Likelihood is conditional engineering judgment, not an incident-rate estimate.
Each concern contains what, why, severity, likelihood, evidence, answer impact,
permanent fix and exact language.

### R01 — Contacting a restricted prospect could force staff disclosure

- **What:** Sending requires canonical staff-visible admission or D2 Share first.
- **Why:** This defeats D1 and can expose the new identity, address or preparation merely to complete ordinary follow-up.
- **Severity:** High.
- **Likelihood:** Plausible if an existing donor/Party-only composer is reused unchanged.
- **Evidence:** E02/E03; E07's explicit qualified no-Party branch.
- **Answer impact:** Preserve A for eligible restricted prospects without granting arbitrary-address sending.
- **Permanent fix:** Qualify exact P9 restricted-preparation recipient authority alongside the canonical recipient branch, with current source/contactability checks and protected history.
- **Exact clause PC01:** “Sending to an eligible restricted prospect SHALL NOT require D2 staff sharing, ordinary staff CRM discovery or fabricated Party admission. A no-Party recipient SHALL bind a specifically qualified same-Tenant source authority kind, identity, contact assertion revision and purpose; arbitrary addresses, hidden matches and stale source assertions SHALL NOT supply that authority.”

### R02 — Shared contact visibility could publish private correspondence

- **What:** Subject, body, sent-event details or snippets appear to anyone who can view the contact, church, household or partnership.
- **Why:** Contact availability and personal correspondence have different audiences; even a subject or sent fact can reveal private preparation.
- **Severity:** High, potentially critical for sensitive identity or care context.
- **Likelihood:** Plausible through a generic composed timeline or search index.
- **Evidence:** E02/E03/E09/E10.
- **Answer impact:** Requires a qualified private source/history projection, not a staff-only product or a newly inferred universal author-only guarantee.
- **Permanent fix:** Bind drafts, content, body-free outcome and all derivatives to the exact source and current disclosure purpose; any privileged disclosure needs its own existing or explicitly amended owner authority.
- **Exact clause PC02:** “D2 contact sharing SHALL NOT publish personal-message subjects, bodies, prior correspondence or protected outcome metadata. Every message, preview, event, count, search result and recovery result SHALL retain its exact source classification and current audience. Ordinary staff, coach, household or shared-contact access SHALL NOT supply personal-correspondence access.”

### R03 — Free text could be mistaken for an export-policy exemption

- **What:** The composer merges restricted CRM values, or all newly authored content is declared unrestricted without a registered source policy.
- **Why:** Read access and authorship do not authorize external egress; a transformed value can disclose the same protected fact.
- **Severity:** Critical for excluded care/security or restricted identity disclosures.
- **Likelihood:** Plausible if generic note/template serialization is reused.
- **Evidence:** E04/E06 and the enforcement limits above.
- **Answer impact:** Requires bounded content qualification, not mandatory message approval or a new semantic policy engine.
- **Permanent fix:** Classify the complete authored-message family and qualify each system insertion/export path. Describe the limits of semantic controls honestly.
- **Exact clause PC03:** “Personal correspondence SHALL use a registered, purpose-qualified authored-content contract. System-resolved addresses, merged fields, quotes, summaries, links and derived values SHALL pass the owning source/export projection before composition or dispatch. Authorship, copying or reformatting SHALL NOT declassify protected content. The product SHALL NOT claim automatic semantic detection of all manually retyped or pasted protected facts.”

### R04 — Recipient address could collapse identities or widen audience

- **What:** A shared address, spouse/church relation or provider thread causes recipient substitution, duplicate association, automatic merge or shared access.
- **Why:** One mailbox may serve multiple people; delivery to it proves neither individual identity nor each person's consent or readership.
- **Severity:** High.
- **Likelihood:** Plausible with address-based matching, contact autocomplete or provider-derived history.
- **Evidence:** E07/E11; E06 exact current purpose/contactability.
- **Answer impact:** Keeps one useful recipient choice while rejecting inferred co-recipients and relationship-wide evidence.
- **Permanent fix:** Bind the chosen source recipient and exact address revision separately; use owner identity repair rather than sender heuristics. A changed or ambiguous destination requires safe resolution before dispatch.
- **Exact clause PC04:** “Recipient authority SHALL bind the chosen source subject and exact qualified address revision. A shared mailbox, matching address, relationship, provider thread or Party merge SHALL NOT automatically add recipients, collapse identities, transfer consent, expose history or credit a personal exchange to another person. Sending to one address establishes only its qualified communication outcome.”

### R05 — A connected provider could bypass the established sender boundary

- **What:** P31 calls a personal-mail SDK directly or silently falls back to the tenant sender when the personal account fails.
- **Why:** Identity, consent, audit and uncertain-outcome handling diverge; the displayed sender can differ from the actual sender.
- **Severity:** High.
- **Likelihood:** High if A is treated as a settings-card integration alone.
- **Evidence:** E07/E08/E12; this is an actual intent conflict, not a live exploit claim.
- **Answer impact:** Requires an explicit narrow P6/P17/ADR0029 amendment; preserves A rather than replacing it with organization mail.
- **Permanent fix:** Add an exact personal-account branch beneath the one preparation/send/evidence spine, with fixed proved sender/reply identity and current source/connection authority.
- **Exact clause PC05:** “D15 SHALL extend P6/P17 and ADR0029 explicitly for a qualified personal-account delivery branch through the sole sendEmail seam. P31 credentials and transport SHALL NOT independently authorize content, recipients or dispatch. No tenant, platform, alternate account or newly rotated identity SHALL silently substitute for the reviewed sender or replay an uncertain send.”

### R06 — Personal correspondence could become a permanent staff-readable archive

- **What:** The ordinary subject/body enters permanent communication history or generic support Recent sent copy without content and audience qualification.
- **Why:** Free-authored text cannot automatically satisfy structurally support-safe projection, and generic support visibility can expose private correspondence.
- **Severity:** High.
- **Likelihood:** Plausible when reusing existing email-history components.
- **Evidence:** E07 lines 398–417 and E09; E10 protected metadata and source/body retention distinction.
- **Answer impact:** Adds source-specific custody and explicit readable-copy eligibility, not a full mailbox or indefinite archive.
- **Permanent fix:** Separate the qualified authored source/draft, bounded immutable prepared artifact, permitted recent copy and permanent body-free outcome. Select the exact source retention and disclosure profile during authorized specification; no new arbitrary duration is selected here.
- **Exact clause PC06:** “Durable D15 communication history SHALL remain body-free and use only contract-proven safe titles and outcomes. Personalized subject/body storage and reveal SHALL follow the qualified source and P17 material contracts. A free-authored body SHALL NOT automatically enter a support-safe Recent sent copy or acquire staff reveal rights; restricted classes and unknown eligibility SHALL not gain that branch.”

### R07 — Useful automation could falsely prove a completed personal exchange

- **What:** Provider acceptance becomes delivery, a human response, completed task or shared relationship progress; an unreturned thank-you becomes overdue work.
- **Why:** The selected benefit is automatic evidence of the actual send outcome, not fabricated interaction or mandatory reporting.
- **Severity:** High for misleading relationship history; medium for avoidable pressure/friction.
- **Likelihood:** Plausible with generic “Log Email” or task completion reuse.
- **Evidence:** E01 and E10 REQ27-C10/C11.
- **Answer impact:** Retain automatic truthful sending evidence without a second manual entry, but preserve owner meanings.
- **Permanent fix:** Project the exact qualified sending/outreach fact once; keep acceptance, delivery, uncertainty and actual personal exchange distinct.
- **Exact clause PC07:** “The qualified send outcome SHALL be recorded without requiring a duplicate manual sent-message entry. Submission/acceptance SHALL NOT be presented as confirmed recipient delivery, readership or completed human exchange. It SHALL NOT complete unrelated work, advance a relationship stage, enroll coaching, require a response or create shared context merely because the contact is shared.”

### R08 — Simplification could become either an empty product or an unselected inbox

- **What:** A connect card replaces actual sending, or initial scope expands to Cc/Bcc, attachments, mailbox import, threading and automatic campaigns by implication.
- **Why:** The first fails A; the second creates unselected rights and independent product obligations. Overly severe unexplained limits can also make real individual follow-up impractical.
- **Severity:** Medium–high.
- **Likelihood:** Plausible without a declared end-to-end profile and usability evidence.
- **Evidence:** E01/E08/E12; no demand or provider qualification was established by this subtask.
- **Answer impact:** State one useful bounded recommendation and its actual limits rather than attribute them to the founder's answer.
- **Permanent fix:** Qualify one real compose/send/outcome/recovery journey and test representative individual messages. Keep richer external handoff truthful and preserve separately selected D7 newsletters.
- **Exact clause PC08:** “Initial D15 SHALL provide a complete deliberately authored individual-send journey for each offered profile, with clear sender, recipient, content, outcome and recovery. Proposed single-recipient/no-attachment limits SHALL be disclosed as initial scope, not universal owner restrictions. No mailbox reading, automatic reply/history import, shared mailbox, bulk sequence or broader rights follow from connection.”

## Required owner reconciliation and proof

The minimal recommended producer model is a qualified **P9-owned relationship
message intent/source**, surfaced by **P28's private compose/send journey**.
Its exact authored source/draft ownership and custody must be stated in the
authorized specification, not improvised by storing a body in a generic activity
row. **P17** owns bounded authored-content preparation, composed sender/reply
identity and permitted material; **P6** owns the sole sending and outcome spine;
**P31** supplies only the qualified account/token/transport facts. This is a
proposed extension, not an assertion that those owners already supply D15.

Necessary explicit reconciliations are P6 recipient/source and sole-sender
contracts; P17's personal-email/provider exclusions and authored material;
ADR0029's Resend-only/sender topology; P9's restricted and canonical contact
producer; P3/P10/P12 classification, exact egress and contactability; and any
new personal readable-copy eligibility against ADR0031. Preserve P27's privacy
and outreach/exchange rules, P4 identity separation, D1/D2 boundaries and D7's
independently required native newsletter. No waiver of ADR0209/0211/0212 is
needed: apply their existing principles to the newly qualified family.

Real acceptance must demonstrate an eligible restricted prospect sent to without
staff disclosure or Party fabrication; an eligible shared contact whose message
and private history remain restricted; canonical and no-Party recipient negatives;
same-address distinct people; current suppression and source/export denial;
cross-Tenant/hat/account failures; immutable sender/recipient/content identity and
unknown-send recovery; exact automatic body-free evidence without fabricated
exchange; no protected values in generated content/history/telemetry; and a useful
mobile/accessible composer with honest richer-message handoff. Actual provider,
role/database, retention, accessibility and representative-user evidence belongs
to release qualification, not this research note.

No application, schema, formal owner, OpenSpec, account, credential, message,
mailbox or external service was changed. No runtime/provider/database test ran
in this subtask. No result from another D15 agent is claimed as this note's proof.
