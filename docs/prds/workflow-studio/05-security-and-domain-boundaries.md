# 6. Security, privacy, domain boundaries, and communications

## Authorization model

Use Core's existing PDP as the sole permission decision authority. Coarse tenant RLS is defense in depth. Every catalog read, draft mutation, publish, enrollment, task assignment, submission, operation execution, history view, export, file retrieval, and retry performs the required current checks. OWASP recommends deny-by-default and request-by-request enforcement; PostgreSQL documents RLS bypass behavior that makes privileged server checks essential [S13, S14].

Proposed Studio capabilities: `workflow.catalog.read`, `workflow.template.create`, `workflow.template.edit`, `workflow.template.publish`, `workflow.binding.enable`, `workflow.run.read`, `workflow.run.control`, `workflow.run.amend`, `workflow.task.reassign`, `workflow.operation.reconcile`, `workflow.template.export`, `workflow.audit.read`, and `workflow.restricted.design`. All are purpose/scope-limited. Having a capability never replaces a source-domain permission.

The existing Phase 12 NHI binds permitted actions, purposes, resources, classification ceilings, audience projections and one active human owner. Runtime authority is the live intersection of its own grants and the owner’s current resolved capabilities, further constrained by the source contract. Owner departure force-disables the NHI; capability loss immediately fences affected future work. Authorized ownership transfer must revalidate authority; an administrator’s later review is not a grace period. Access revocation takes effect at command and retrieval boundaries, not at the next template publication.

## Risk and publication review

Risk derives from actual data and operations, not the user-selected workflow title. Standard internal tasks use ordinary authorized publication. Broad outward communication, material audience changes, restricted-data access, and protected-domain integrations require the review demanded by those owners. No independent reviewer may approve their own protected action; a small tenant must appoint an eligible independent reviewer where required or use a supported external/manual path.

Source-required approval is bound to exact evidence/version. Delegation may change an eligible assignee without granting the delegate extra power. Timeouts, task completion, AI output, ownership labels, team membership, and a generic admin role do not supply approval evidence.

## Data minimization and information-flow safety

Envelopes to Inngest contain opaque IDs and safe routing metadata only. Step outputs, returns, logs, error messages, trace attributes, event names, cancellation payloads, and concurrency keys follow the same rule. Returning a full applicant record from `step.run` would persist it as execution state; do not do that. Load private records within the trusted action boundary, perform the allowed work, and return a minimal safe outcome reference.

Names, contact addresses, signed URLs, free-form notes, clinical data, secrets, attachments, and payment internals are prohibited in provider orchestration state. An opaque identifier can still be sensitive metadata; restricted workflow activation additionally requires provider data-handling/residency/access qualification. Encryption alone is not a privacy approval. Keep trace retention separate from source retention.

Conditions can leak information. A confidential clinical field cannot be converted into a public boolean or notification branch. Derived decision records inherit the input purpose/classification unless the source owns an approved safe summary. Ordinary admins cannot enumerate care template/run names, member lists, exception counts, access logs, or audit entries. Cross-role previews use synthetic fixtures unless the viewer is independently authorized to read real data.

## Communications

The owning business module decides audience and purpose. Phase 17 owns governed content, sender identity, and permitted delivery plans. Phase 6 owns eligibility checks, dispatch, and communication history; Resend is transport. Inbound replies remain Support Hub responsibility [R4]. The Studio invokes the exact code-owned producer binding for one Live Phase 17 meaning-specific system-message contract. That owner resolves the whole bounded Delivery Plan/publication, recipient projection, facts and protected action material, and releases the complete occurrence through Phase 6. A symbolic communications action is not a generic sender or permission to manufacture intent rows. Studio never calls Resend directly from a graph node or browser.

A message operation links to one prepared source communication intent, exact whole publication or approved resolver result, source facts, channel, semantic purpose key, and recipient projection. Do not put rendered bodies in workflow records. Optional delivery suppression is distinct from failure. A provider delivery event means only the state that provider actually proves, not reading, agreement, or task completion.

Separate transactional/process communications from marketing. Donation alone does not create newsletter consent. Required source messages, receipts, verification, and source-owned recurring recovery continue outside optional Studio activation. Generic journey frequency limits cannot suppress a mandatory security notice; optional journeys cannot duplicate a required domain notice. Phase 16's opt-in and bounded fixed-pledge reminders and recovery eligibility remain binding.

Coordinate organization and missionary stewardship through shared purpose identities and source-approved audience/channel plans. Identical intended effects converge; distinct intentional messages remain possible. Conflicting bodies for one effect identity require resolution rather than arbitrary winner selection. Per-recipient channel preferences and current consent are enforced at dispatch.

Resend webhook consumers verify signatures using raw body, persist events before processing, and deduplicate by provider event identity. Out-of-order delivery cannot overwrite stronger or terminal source knowledge incorrectly. Bounce and complaint outcomes feed source-owned suppression and operational follow-up, not a new workflow-owned suppression field [S09].

## Source boundary matrix

| Owner                     | Studio may do                                                                     | Studio must not do                                                                                           |
| ------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| CRM / identity            | Request approved relationship/custom-data changes; coordinate claiming/onboarding | Create access through relationship membership; use a new CRM shadow record                                   |
| Contributions             | Consume qualifying posted facts; coordinate donor follow-up                       | Infer received money from raw webhooks; change gift/credit/legal-donor facts directly                        |
| Recurring commitments     | Observe named health/occurrence events; request permitted follow-up               | Own retries/dunning; turn inactivity into debt; restart canceled authorization                               |
| Documents / receipts      | Request existing source generation or evidence; observe current accepted artifact | Invent receipt facts, reuse an obsolete signature, or mark an upload accepted automatically                  |
| Field accounts / expenses | Mirror source follow-up tasks and request exact permitted coordination commands   | Approve expense truth, choose protected reviewers, create entries, infer wages or payment, dispose records   |
| Accounting                | Route investigation and open native review                                        | Create a release, replay a provider, post arbitrary journals, or treat workflow completion as reconciliation |
| Support Hub               | Configure adopted routing vocabulary; link conversation work                      | Send internal notes, create a second inbox, bypass loops/quarantine, expose care cases                       |
| CMS / publication         | Coordinate exact-revision reviews and request permitted publication               | Bypass restricted-worker checks or create a second published flag                                            |
| Reporting                 | Consume approved metrics and request source-owned report work                     | Create another semantic layer or duplicate report schedules/recipient rules                                  |
| Member care               | Coordinate source-qualified intake and follow-up within sealed scope              | Put care notes in CRM/workflow fields or allow broad admin disclosure                                        |
| Files / retention         | Reference private assets and request owner-permitted review                       | Treat a folder as evidence, release holds, dispose bytes on an arbitrary timer                               |

## Files, signing, and credentials

No public bucket or reusable public URL for applicant identity files, reference letters, expense evidence, or care material. Retrieval rechecks exact purpose and current user authority; allow private byte access only through the owning file service. Scanner/malware status and source review remain separate. Private resource download should be non-cacheable where the source requires it. Never email restricted evidence as an attachment just because sending links is inconvenient.

Use the existing governed tenant connection system for Resend and future certified providers. No workflow-specific API-key form. Missing/expired credentials block the affected operation with source-owned repair instructions. Unknown provider outcomes cannot be switched to another provider or manual lane until duplicate execution is ruled out. Revoke external links and future retrieval when work is canceled, but do not claim already delivered bytes can be recalled.

E-sign and background-check vendor selection are external qualification gates, not implementation shortcuts. The complete manual evidence path remains available where the source policy allows it. A scanned signed document is labeled manual reviewed evidence, not certified electronic-signature evidence. Candidate-sensitive assessments require their own classification and retention handling.

## Retention and disaster recovery

Apply source-owned purpose schedules, holds, jurisdiction policy, and authorized disposal. Studio does not set a universal retention period or keep full donor/applicant history forever. Purge transient simulations and support-safe logs on approved schedules; preserve only necessary opaque dedupe tombstones where lawful so restored data cannot create duplicate effects. Deletion of a source record must propagate a safe unavailable/redacted state, not silently recreate it from workflow snapshots.

A backup restore begins outbound-disabled. Compare source operation identities, recorded provider references, cancellation epochs, grant revocations, and disposal tombstones before re-enabling effects. Unknown in-flight work remains quarantined. Manual reconciliation is supported without inventing successful provider outcomes.

## AI boundary

An AI assistant can draft a workflow, suggest field mappings, explain a validation error, and propose an amendment. It uses the same AST, authorized catalog, synthetic simulation, and human publication flow. No free-form AI node controls money, screening acceptance, care decisions, permissions, or public publication. Incoming forms and email are untrusted data, not agent instructions. Sensitive AI egress requires the existing approved tenant-purpose capability; lack of an AI connection never disables the complete manual product.
