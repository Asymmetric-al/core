# D25 — Gifts awaiting finance: authority, privacy and responsibility

Research-only review of selected A. **Recommend Accept A through the narrow qualified P15 handoff source**, with the safeguards below. Reporting a gift awaiting finance is different from entering/posting a contribution, proving current physical possession or gaining financial access. Grades describe plausible implementation failures, not confirmed deployed vulnerabilities. No additional approval ceremony, custody ledger or permission grant is proposed.

## Evidence and current limits

Reviewed Core HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3`. No live database, effective grants, credentials, storage objects or physical handling process was inspected.

- [Q25:33–36,49–76](../phase27-q25-gift-handoff-visibility.md:33) selects responsible handoff tracking, qualified P15 source evidence and no pending money total. Its unanswered marker predates the founder's answer. Source qualification is required before release; missing infrastructure does not authorize a P27 shadow record.
- [P15:1885–1918](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:1885) requires explicit Tenant/Legal Entity, complete scoped references and a draft container distinct from postings; [1955–2018](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:1955) distinguishes draft input, committed-header identity, received dates and receiving staff. Those proposed fields alone do not establish current custody or a delivered handoff API. [P7:13–30](../../../../prds/sitestacker-parity/phase-07-receipt-statement-compliance-and-donor-credit.md:13) retains exact entity, legal-donor and receipt authority.
- [P12:1552–1556](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552), [1619–1637](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1619), [2846–2869](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:2846); [P3:273,284–291,308–311](../../../../prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md:273); and [P10:100–104](../../../../prds/sitestacker-parity/phase-10-sensitive-data-safety.md:100) govern current source/field/history authority, classification, alias/location, exports and protected existence. Accepted intent is not implementation evidence.
- **Current offline endpoint:** [offline-route:39–53](../../../../../packages/api/src/admin/contributions/offline-route.ts:39) checks `finance:manage_contributions`; [permissions:25–39](../../../../../packages/api/src/admin/contribution-operations/permissions.ts:25) resolves that through finance/admin role patterns. [offline-dependencies:36–60](../../../../../packages/api/src/admin/contributions/offline-dependencies.ts:36) remains unbound and raises 501. P15 identifies this bridge as a retirement target, not the permanent contribution writer.
- **Current adjacent staging:** [staged-gifts GET:106–136](../../../../../packages/api/src/admin/contributions/staged-gifts.ts:106) returns a Tenant-filtered `select("*")` under staff/admin roles. [StagedGiftRow:35–56](../../../../../packages/api/src/giving/staged-gifts.ts:35) includes donor and provider identifiers. [Initial schema:64–91](../../../../../supabase/migrations/20260512190000_phase_03_giving_pipeline.sql:64) requires an existing donation and defaults status to `received`; that word is not evidence of a physical check in someone's hand.

## A25-01 — A limited report must not confer finance powers

**Critical; plausible.** Making the existing finance endpoint available to every appeal reporter would grant the wrong authority; requiring all reporters to be finance operators would defeat the selected bounded handoff.

**Clause:** “Qualify the exact P15 action and minimum read projection for an authorized staff report of a gift awaiting finance, separately from donor creation/resolution, financial entry, posting, correction, receipt and bank/deposit actions. Derive actor and current authorization context at the server. A report, appeal link, physical possession or responsibility assignment grants none of those independent powers.”

The source qualification must explicitly establish who may exercise the narrow action through P12; D25 is not itself a grant to all staff or missionaries. Ordinary save may capture qualified evidence without requiring a second approver. P15's own conditional financial controls remain applicable when its later actions occur. A user unable to post must still be able to use the expressly authorized bounded handoff projection; a finance user gains no unrelated missionary/private-history access.

**Acceptance:** report-only versus post-only versus read-only actor; forged actor/owner; missionary participant without a source grant; alternate active assignment; replay after revocation. No contribution, receipt, payment or donor creation occurs merely because a handoff report succeeds.

## A25-02 — Recorded-by, reported holder and follow-through owner are separate facts

**High; likely if one owner/status field is overloaded.** Selecting finance as the responsible person does not prove finance physically received the check. A promise, received-date field, processor event or generic draft cannot prove present possession.

**Clause:** “Preserve the trusted recording actor, actual qualified receipt/possession evidence and its time/source, and current accountable follow-through responsibility distinctly. Report only what the evidence supports. A change of responsible person is not a physical transfer; a report recorded on another person's behalf cannot pretend the recording actor received the gift. A current possession claim requires the P15-qualified evidence/currentness rule, not a generic status toggle.”

An ordinary authorized staff attestation may be the narrow evidence mechanism if the P15 owner qualifies it; no photograph, second signature or general chain-of-custody engine is inherently needed. Show uncertainty truthfully instead of claiming objective continuous custody. The minimal source contract needs exact action meaning and correction/handoff evidence, not a parallel appeal ledger.

**Acceptance:** church says check is coming; draft started before receipt; one employee records another's report; responsibility reassigned before physical transfer; sender claims delivered but recipient disputes it; correction to receipt time. No fabricated possession, transfer or financial outcome.

## A25-03 — Unknown identity or wrong entity must not become invented financial truth

**Critical; plausible.** The presenting church/contact, name on an envelope, appeal beneficiary, collecting staff member and legal donor/issuer are not interchangeable. A convenient default entity can misdirect real property or post it under the wrong legal owner.

**Clause:** “Keep handling scope, reported source identity, intended beneficiary and authoritative financial Party/entity facts distinct. Use trusted Tenant scope and complete source references; an entity-bearing financial record retains P15/P7's explicit entity constraints. A limited reporter does not resolve the legal donor or select another entity by implication. Unknown, disputed or mismatched evidence stays an owned source exception until the authorized owner resolves it.”

The narrow P15 qualification must provide a truthful path for unresolved donor or intended-entity evidence without requiring fake donors/default entities or relaxing financial-root constraints. This is a source qualification requirement, not permission for a nullable cross-entity financial row or a P27 exception store. A check delivered to the wrong organization is not automatically a cross-Tenant transfer. [Current input:75–104](../../../../../packages/api/src/schemas/contributions-offline.ts:75) permits unknown-offline only for cash/other; that old complete-entry schema must not force an operational reporter to invent identity. P15's anonymous-cash path and P7 legal-donor rules still own eventual acceptance.

**Acceptance:** known presenter/unknown legal donor; unreadable payer; wrong entity; foreign Party ID; ambiguous duplicate donor; beneficiary different from payer; unknown cash. Preserve truthful handling responsibility without a receipt, identity disclosure, unauthorized transfer or false attribution.

## A25-04 — Handoff evidence is not an image-upload or bank-detail feature

**Critical; plausible.** Check images reveal account/routing details, signatures, addresses and potentially protected ministry identity. Files attached to a broad task or public asset store could outlive or exceed the source projection.

**Clause:** “Keep D25 evidence minimal and classified. Do not add scanned-check/deposit-image upload, OCR, raw bank/card fields or a private-file shortcut. Any future document reference consumes the separately qualified Phase 29 source/object permission and retention boundary. Readable handoff status does not imply readable financial identity, amount, reference or attachment.”

[P15:143–147](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:143) explicitly reserves images to P29 and excludes readable bank/card input. An allowed check reference is not a request to transcribe bank-account details into notes. **Current unsuitable reuse:** [email assets:146–169](../../../../../packages/api/src/email/assets.ts:146) uploads with an admin client and returns a public URL; [its migration:1–16](../../../../../supabase/migrations/20260511024000_email_assets_storage_bucket.sql:1) deliberately creates a public bucket. This is valid email-asset behavior, not a check-evidence store.

**Acceptance:** pasted bank number or sensitive note never enters generic logs/task previews; no new image picker/storage route; protected donor/worker projection uses permitted identity; future foreign-object reference or revoked deep link cannot resolve through the handoff. No snapshot of private finance fields is necessary to show permitted progress.

## A25-05 — Eligible responsibility and source closure cannot depend on permanent access

**Critical disclosure / High lost-work risk; plausible.** Creator departure can leave a real check unattended, while a broad finance-group fallback can disclose it. A reporter may legitimately learn the handoff is resolved without receiving the whole financial record.

**Clause:** “Choose and re-prove the current eligible source-work owner independently from the recorder or reported holder. Assignment grants no access. Reassignment and access loss preserve the source obligation; no guessed admin, group broadcast or stale creator fallback. If no eligible recipient can be established, retain an actionable source-owned responsibility exception for independently authorized recovery.”

Apply [ADR0183:57–75,87–118](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:57): safe task facts, source-protected details, current recipient checks and source-controlled closure. Exact finance facts may settle the handoff through the qualified source contract without granting the original reporter a full financial read. Current status/history/result disclosure remains independently authorized. Generic task Complete/Delete, appeal removal, closing the partnership or losing access cannot assert finance recorded the gift.

**Acceptance:** owner leaves with property still reported in hand; owner becomes ineligible between selection and save; no eligible successor; notification queued before revocation; finance records the exact item while the reporter cannot view the contribution; hidden versus absent financial match. No stranded obligation, disclosure expansion or fabricated completion.

## A25-06 — Loss, retention and historical closure must remain truthful

**High property/accountability / Critical privacy; plausible.** A TTL, closed appeal or deleted staff profile can erase the only evidence of a check. Keeping every sensitive body forever creates the opposite failure.

**Clause:** “Lost, unlocated, returned, disputed or mistakenly reported property receives a truthful source disposition and any remaining accountable action. It never becomes Recorded by finance by inference or disappears through ordinary deletion. Keep the lawful structural evidence needed to explain handoff/outcome; minimize and dispose of personal content under the source's retention, hold and redaction rules. End work when its qualified disposition permits, without inventing perpetual tasks.”

[P15:737–744](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:737) already warns that a draft may be the only record of a physical check, requires surfaced retention handling, and separates PII pruning from lifecycle evidence. D25 adds no new duration. Current access governs historical closure, search, exports and audit; former responsibility is not permanent access. A returned or corrected financial posting does not by itself prove a new physical handoff is needed.

**Acceptance:** stale unposted item; discarded appeal; staff profile anonymized; check cannot be located; later recovered item; gift posted then returned; privacy erasure with lawful structural retention. Source facts remain explainable without unjustified sensitive copies or false physical/financial completion.

## A25-07 — Database, replay and restore must preserve the source boundary

**Critical; plausible.** A forged completion reference, service-role write, stale replay or old backup could close the wrong handoff, reinstate a recipient or disclose private finance data.

**Clause:** “Use complete Tenant/source/entity references as applicable and server-derived actor provenance. Check permitted old and resulting states across command, import, repair, views/RPC and privileged paths. Commit accepted handoff changes with required local evidence/work disposition and scoped intent receipts coherently. Dedupe and finance matching must not disclose hidden source rows. Replays reauthorize result disclosure and never create a second gift, duplicate responsibility or overwrite a newer disposition.”

Current migration history is not a deployed-grant assertion: [initial staging:412–421](../../../../../supabase/migrations/20260512190000_phase_03_giving_pipeline.sql:412) revokes raw browser access; [later migration:9–14](../../../../../supabase/migrations/20260513173739_expose_phase_03_service_tables_to_rest.sql:9) grants authenticated privileges; [false policies:16–22](../../../../../supabase/migrations/20260513173938_add_phase_03_rest_visibility_deny_policies.sql:16) are ordinary permissive policies. A false permissive policy is not an overriding deny when another permissive policy admits a row. Future qualification follows P12's raw-table revocation and effective-policy/privileged-path tests.

Fresh [PG17 CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html) confirms omitted UPDATE/ALL `WITH CHECK` inherits `USING`; omission alone is not a vulnerability. Effective roles, grants and policy composition govern actual protection. [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control) documents separate operation policies and service-key bypass; a service upload or signed URL is not source authorization. This is no instruction to build storage in D25.

**Acceptance:** allowed old row→wrong Tenant/entity/owner/finance reference; malicious status/provenance; source revision/assignment revocation race; same versus changed-intent retry; failed local history write; terminal replay after revocation; hidden-match error parity; direct and privileged path checks. Restore reconciles current source outcomes, responsibility, revocation, consumed effects and content disposal before affected readers/workers activate; if unavailable, hold them rather than revive old possession or expose removed data.

## Qualification boundary

No application, SQL/RLS, storage or physical-process test was run here. Existing endpoints, staged rows and planned P15 models establish specific seams and limitations, not a working D25 feature. The narrow source action/projection, eligible responsibility and evidence meaning must be implemented and proven before release; full future finance, P29 uploads and universal approval are not prerequisites invented by this review. The acceptance cases above are targeted proof gates, not claims of current protection.
