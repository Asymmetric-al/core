# D22 — Authorization, disclosure and source authority

Research-only appendix. Founder selected Q22 A: one request/response capability for funding and significant nonfinancial invitations. **Recommend Accept A with the inherited safeguards below; no additional approval workflow or founder micro-vote.** The extension changes product scope, not access or the authority of a reported response. Severity/likelihood describe plausible implementation failures, not demonstrated deployed vulnerabilities.

## Evidence and limits

Repository inspected at `225c02e9499bd6c0d493223cd4b1a4120ff787e3`. No live catalog, grants, credentials, production data or runtime access was inspected. A bounded search across API, database, admin/missionary source and migrations did not find a qualified P27 request/response implementation. That is not proof of deployed absence.

- **Selected direction:** [Q22:30–36,53–76](../phase27-q22-partnership-request-scope.md:30) separates request, response, commitment, fulfillment and task; monetary fields apply only where relevant. The question file's unanswered marker predates the founder's answer. [D21:31–50](../phase27-d21-paused-updates-review.md:31) delegates ordinary workflow judgment without widening access.
- **Governing intent:** [P12:1552–1556](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552), [1619–1636](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1619) and [2846–2869](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:2846) require current trusted context, separate entity/purpose/field/history authority, protected existence and all-door enforcement. [P3:273,284–291,308–311](../../../../prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md:273) requires classified new record types, separate edit/export rules and fail-closed projections. These are accepted requirements, not evidence that every current path implements them.
- **Organization authority:** [P16:445–460](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:445) separates Commitment Party, representative, service contact, remitter, collection authorizer and legal donor. A title, relationship or shared contact grants none of the others. Its common individual path explicitly avoids artificial representative records.
- **Current adjacent code:** [missionary activity writer:120–145](../../../../../packages/api/src/missionary-portal/donor.ts:120) checks existing donor access then stores a generic activity description; [DonorActivity:759–772](../../../../../packages/database/types/database.ts:759) has nullable generic amount/status/text, not qualified request/response semantics. [CRM detail:279–284](../../../../../packages/api/src/admin/crm/detail/service.ts:279) reads activity title/description/amount through an admin client. [CRM access:22–62](../../../../../packages/api/src/crm/auth/access.ts:22) uses coarse role/tenant checks; [migration:211–232](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:211) defines an activity SELECT policy through donor/staff relationships. None proves P27 purpose/field/representative authority.
- **OpenSpec floor:** [platform boundaries:270–287](../../../../../openspec/specs/platform-boundaries/spec.md:270) forbids scope broadening through shortcuts; [CRM:121–126,206–234](../../../../../openspec/specs/crm-core/spec.md:121) preserves separately qualified external projections and restricted-note authorization.

## A22-01 — Reported response is not organizational authority

**High; likely if one “accepted” flag drives every downstream effect.** A church contact can agree personally, relay a committee's statement, or offer a conditional introduction. Neither contactability nor permission to record that conversation proves authority to bind the organization. Conversely, requiring legal-representative verification before recording any response would invent a restrictive workflow.

**Clause:** “Record the request's exact Party and partnership, the actual respondent and any represented Party as distinct facts, with the reported response and relevant source/time/context. Record uncertainty or limits truthfully. Recording a response requires no new representation ceremony; any downstream Party instruction, commitment, payment, access or participation effect independently satisfies its owning contract. A contact link, title, relationship, previous donation or positive response grants no such authority.”

Preserve partial/conditional responses: agreeing to pray does not accept a simultaneous funding request or authorize sharing an introduced person's details. P16's evidence model governs financial commitments, not a new universal legal-agreement graph for ordinary invitations.

**Proof:** personal church-member yes; authorized financial representative acting outside the represented purpose; conditional hosting offer; prayer yes/funding undecided; third-party referral. Each remains accurately recordable by an authorized actor without manufacturing the corresponding downstream effect or contact permission.

## A22-02 — Request owner and trusted actor remain separate

**Critical; plausible.** Reusing generic staff access or client-supplied owner/Party IDs can turn request creation, reassignment or response entry into an unauthorized cross-source write.

**Clause:** “Derive actor and Tenant Authorization Context at the server. Bind the request to its exact existing partnership, Party, Tenant and applicable immutable Legal Entity/ministry scope. Independently authorize the requested mutation and any responsibility assignment; assigning an owner grants no source visibility or action authority. Reject retargeting or field changes outside the permitted resulting state. Re-prove current context at submission, deferred execution, replay and result projection.”

Use the established P12 principal classes; do not make an NHI impersonate the originating human or accept a caller's role, selected Tenant, ministry link or business-purpose label as processing authority. A shared request does not settle the separately governed staff/missionary content projection.

**Proof:** foreign Party/journey/owner; inactive or recreated assignment; read-only actor; missionary relationship without the required source grant; allowed old row transformed into forbidden new scope; revocation ordered before acceptance; replay after revocation. Accepted historical effect remains truthful while current response disclosure is independently constrained.

## A22-03 — Conditional fields must preserve both truth and field permissions

**High; likely with a generic form or partial-update merge.** Hidden monetary values can be accidentally cleared/defaulted, retained behind a nonfinancial label, or exposed through a total. A hidden field is not known absent, and a nonfinancial request is not a zero-valued gift.

**Clause:** “Financial applicability governs the relevant fields and owner validation; it never bypasses source scope or field permissions. Nonfinancial requests require no dummy amount, currency or campaign. Keep unknown, absent, withheld, zero and not-applicable distinct. Omitted protected fields are not commands to clear or default them; explicit unauthorized values are rejected. A deliberate change of request meaning cannot erase or silently rewrite accepted commitments, responses or fulfillment links.”

Validate monetary currency/entity/destination semantics under [the financial owner:22–27](../../../../prds/program-roadmap/owner-constraints.md:22); this appendix does not decide whether a not-yet-designated monetary request is admissible. Whatever optional fields that owner permits, required source keys remain independently constrained and supplied references must match their complete source scope. A mixed invitation may have a qualified financial part without making prayer/hosting outcomes monetary fulfillment.

**Proof:** omitted versus explicit null/zero; field hidden after permission change; overposted amount/currency; nonfinancial request with leftover money; monetary unknown; foreign destination with money omitted; meaningful request revision after a partial response. No unauthorized partial write or silent financial-history loss.

## A22-04 — Prayer and hosting content can disclose protected people

**Critical; plausible.** Free text can contain health/care information, third-party names, a worker's legal name, exact location or travel schedule. “Nonfinancial” is no confidentiality classification.

**Clause:** “Register and classify request, response, provenance and follow-through fields through the existing P3/P12 census and projection rules. Collect only relevant content; do not demand private prayer narratives or itineraries to track an invitation. Apply current protected-person, field, purpose, geographic-precision, alias and history floors to every projection and derivative. A shared partnership/request does not automatically expose private care, Support or missionary content.”

This does not classify every prayer request as a member-care case, force every hosting invitation into an itinerary system, or require per-request approval. Normal recordable context stays usable within its qualified projection. Derived titles/snippets cannot downgrade the source's sensitivity.

**Proof:** protected missionary alias/location; third-party health detail in a response; ordinary prayer invitation without sensitive content; note/file attachment from a more restricted parent; clearance removed after a preview was cached. No forbidden plaintext/existence in form defaults, errors, validation hints, recent items or generated summaries.

## A22-05 — Follow-through is not permission to contact or disclose

**Critical disclosure / High unauthorized contact; plausible.** A task preview or auto-generated message can reveal the request body to a newly assigned person. Agreeing to pray or make an introduction does not enroll anyone in newsletters, permit contact with the introduced person, or lift suppression.

**Clause:** “Use existing shared-task and communication owner boundaries. Assignment supplies no access. Task list facts and notifications use only a separately authorized, minimized source projection; protected bodies remain source references. Resolve eligible recipients under current source authority, with no guessed owner/admin fallback. Contact suggestions, appeal inclusion, export for contact and sending obey the single applicable consent/suppression authority; recording an authorized historical response does not itself send or enroll anyone.”

[ADR0183:57–69](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:57) governs task recipients/content. [P6:47–59](../../../../prds/sitestacker-parity/phase-06-shared-communication-event-model.md:47) governs send-time evidence, suppression and reference events; Q22 preserves P17 delivery ownership. [Owner constraints:45–48](../../../../prds/program-roadmap/owner-constraints.md:45) already block suppressed ask suggestions/appeal inclusion. Do not create a second sender or new blanket service-contact classification for these requests.

**Proof:** follow-up owner lacks protected detail; contact opted out after drafting; intended recipient replaced or revoked before send; introduction mentions an unconsenting third party; eligible recipient set indeterminate. Internal recording remains separate from contact execution; unqualified delivery releases nothing and preserves the source-owned unresolved work.

## A22-06 — Every read and database path must enforce the same boundary

**Critical; plausible.** RLS is not field authorization; service clients, views, exports and query predicates can circumvent a correct detail screen. FK/uniqueness errors can reveal hidden Party/request existence.

**Clause:** “Apply current source and field/input floors before search, filtering, sorting, counts and aggregation; return only permitted output. Independently govern export, history, task/notification previews, audit and cache reuse. Inspect actual raw grants, effective policies, view/function execution roles and privileged paths. Enforce both permitted old rows and permitted resulting rows; nullable financial fields or a nonfinancial kind never widen access. Normalize protected-reference errors without copying database detail into public responses.”

Freshly checked [PG17 CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html) and [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security): UPDATE/ALL omitted `WITH CHECK` **inherits `USING`**. Omission alone is not a vulnerability. Grants remain independent; permissive policies combine with OR, restrictive ones with AND. Actual owner/service privileges control bypass; no blanket claim that every definer/view bypasses or enforces RLS. P12's raw-table revocations and private governed server boundary remain the intended solution, not new per-request role machinery.

**Proof:** ordinary and privileged entrypoints, REST/RPC/view/import/repair, prohibited old/new rows, forged scope, protected/absent reference parity, money-filter inference, count/pagination consistency, export projection and same-user context change. Assert allowed writes changed the intended row; a denied UPDATE may match zero rows instead of throwing. No toy owner-only test establishes production authorization.

## A22-07 — Histories, retries and disposal must not become hidden copies

**High integrity / Critical sensitive disclosure; plausible.** [The current command logger:46–85](../../../../../packages/api/src/crm/commands/log.ts:46) redacts credential-like keys, not arbitrary prayer text, names or location, and passes error messages separately. It is not a safe-payload proof for D22.

**Clause:** “Bind command identity to the exact actor/context, source, action and intent; accept the source change with its required local history/obligation effects coherently. A retry returns an authorized historical receipt without replaying a response, follow-up or contact, overwriting newer truth, or fabricating success. Logs and audit retain only qualified structural evidence, not protected request/response bodies by default. Lawful retention, correction, redaction, anonymization and erasure still apply to histories and derivatives.”

Use [D7's ratified history/restore boundary:240–255](../phase27-d7-adversarial-review.md:240): reconcile current authorization, consumed effects and disposal fences before restored readers/workers activate; hold affected paths if those fences cannot be recovered. Closure, former ownership or immutable event ordering never grants permanent plaintext access. Source corrections preserve what was actually reported without pretending the old report never occurred or retaining prohibited content indefinitely.

**Proof:** lost-success retry; same token with different source/payload; concurrent response/edit; failure between source and required local effect; unauthorized receipt readback; erased respondent/body; old backup predating revocation/disposal. No duplicated send, resurrected task/access or permanent sensitive snapshot.

## Verification boundary

This appendix adds requirements and acceptance cases only; no application/RLS/browser tests were run. The adjacent [conditional-money results](conditional-money-probe/results.json) report 8/8 disposable PostgreSQL 17.11 mechanics checks, including nullable CHECK and required-scope behavior. They are another agent's isolated evidence, not P12, live grants, consent, source-authority or deployment qualification. Implementing the bounded shared request capability still requires the relevant command/projection/recipient tests above. No new permission grant, mandatory representation ceremony, retention duration, external projection or approval queue is selected here.
