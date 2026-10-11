# D24 — Recorded appeal audience: authorization and privacy

Research-only review of selected A: record the appeal's working list and change it deliberately. **Recommend Accept A with the inherited safeguards below.** A recorded population is a coordination fact, not frozen permission or an independent contact directory. Grades describe plausible implementation failures, not confirmed deployed vulnerabilities.

## Evidence and limits

Reviewed Core HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3`. No production data, live grants, credentials or runtime policy was inspected. Bounded searches in CRM APIs, database types and migrations found no qualified P27 appeal-population service.

- [Q24:42–45,60–83](../phase27-q24-appeal-working-audience.md:42) distinguishes deliberately recorded population, current contact eligibility, actual recipients and historical asks/responses. It now records the founder's A and the completed review. [Owner constraints:45–48](../../../../prds/program-roadmap/owner-constraints.md:45) already prohibit suppressed ask suggestions and appeal inclusion.
- [P12:1552–1556](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552), [1619–1637](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1619) and [2846–2869](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:2846) govern current context, protected existence, fields/query inputs, egress and raw-table boundaries. [P3:273,284–291,308–311](../../../../prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md:273) requires classification of new record types and independently governed exports. These are accepted requirements, not assertions of complete current enforcement.
- [P10:100–104,127–143](../../../../prds/sitestacker-parity/phase-10-sensitive-data-safety.md:100) establishes current security floors, governed identity, classified audit and controlled scrub, with an explicit warning that past external exports cannot be recalled. P12's later exact-context/floor requirements govern; older broad role descriptions are not appeal permissions.
- **Current saved views:** [named-views.ts:21–25,91–106](../../../../../packages/api/src/admin/crm/table-preferences/named-views.ts:21) stores personal gift-history settings, with reads filtered by Tenant/profile/table. [Migration:5–28](../../../../../supabase/migrations/20260611170000_crm_table_named_views.sql:5) has settings JSON, enabled RLS and raw browser revocations. These are neither an appeal population nor a shared segment authority.
- **Current list/export seams:** [CRM service:46–75](../../../../../packages/api/src/admin/crm/service.ts:46) applies record/tag/search filters; [202–249](../../../../../packages/api/src/admin/crm/service.ts:202) paginates and builds grid rows. [Report export:9–44](../../../../../packages/api/src/admin/crm/reports/export.ts:9) uses the coarse CRM access helper, builds a report, logs filters/count and serializes CSV. [Generic CSV:57–109](../../../../../packages/ui/components/shadcn/data-table/utils/export.ts:57) selects client-visible columns and selected/filtered rows. Those mechanics alone prove no P3/P12 export, field-input or snapshot authority.
- **Current consent:** [email consent:110–164,178–232](../../../../../packages/api/src/email/consent.ts:110) checks donor flags and address suppressions for a supplied Tenant/message type; it does not establish appeal planning admission, canonical Party representation or the meaning of never-ask. [Support bulk helper:8–21](../../../../../apps/admin/features/support-hub/lib/bulk-mutations.ts:8) summarizes `Promise.allSettled`; it is not a durable population command or proof of authorized per-item outcomes.

## A24-01 — Membership never expands source scope or Party authority

**Critical; plausible.** A list manager could otherwise include a foreign Party, retarget an entry to another appeal, or treat a church row as permission over its linked contacts and requests.

**Clause:** “Derive actor and Tenant Authorization Context at the server. Bind every entry/change to the exact appeal and canonical Party with complete Tenant-consistent references; validate any applicable entity-bearing source or financial scope separately. Independently authorize candidate discovery, list changes, historical reads, exports and downstream actions. Appeal membership, creation, ownership or responsibility grants no additional source visibility or action authority.”

A Tenant-level Party need not be invented as a separate Party per Legal Entity; entity-bearing effects still need the correct inner scope. Recording an organization in the plan neither expands its contacts into recipients nor proves any contact's authority to bind it. Preserve [P16's separate roles:445–460](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:445).

**Acceptance:** foreign Party/appeal, allowed old entry retargeted to forbidden scope, another entity's financial source, read-only manager, missionary relationship without the required grant, and organization with multiple contacts. No cross-scope partial write or implicit person/recipient grant.

## A24-02 — Current eligibility and deliberate population history are separate

**Critical contact/privacy / High workflow integrity; likely without separate facts.** A recorded row may later become suppressed, protected or inaccessible; changing a saved filter must not remove its historical participation or silently admit replacements.

**Clause:** “Keep deliberate inclusion/exclusion/removal history separate from current action eligibility. Current never-ask/contact restrictions govern suggestions, actionable inclusion and each outward effect. A retained row is not contact permission; current row/field/history floors still govern whether and how anyone sees it. Do not erase actual requests/responses when eligibility changes, and do not copy old contact details as a fallback when the current projection is unavailable.”

User exclusion is not a new global suppression record. Conversely, global suppression cannot be undone by re-adding the entry or choosing another channel without the applicable contact authority. Restored eligibility never reverses an explicit exclusion/removal or revives ended work; remaining plan membership and any newly permitted action are evaluated truthfully under current owner rules. The list is not a newsletter enrollment, recipient group, invitation send or authorization to create all possible follow-up tasks.

**Acceptance:** suppression before add; suppression after inclusion and before outward action; protected-person reclassification; saved-filter drift; explicit removal followed by resumed eligibility; organization email changed; already asked person no longer eligible. History survives lawfully without an actionable contact leak or fabricated ask/response.

## A24-03 — Candidate counts and dedupe must not reveal protected membership

**Critical; plausible.** “Already listed,” excluded totals, count differences, financial filters, bucket labels or import error rows can disclose a person or relationship hidden from the actor.

**Clause:** “Apply current row and field/input floors before candidate search, selection counts, filtering, sorting and aggregation. Report the scope actually authorized and measured; withheld/incomplete coverage is not a measured zero or an undisclosed-member count. Existing membership or exclusion may be disclosed only through an independently authorized minimal projection. Dedupe/reuse never supplies access.”

If an admission needs metadata the actor is not entitled to observe, use the established uniform unavailable/admission boundary before attempted creation; do not rely on a duplicate-key error or result wording to hide existence. A lawful minimal membership projection need not reveal private historical details. Trusted internal integrity checks do not authorize returning their raw counts or reasons. This adds no new permission grant or coordination role.

**Acceptance:** hidden-existing versus absent entry, existing excluded entry, field hidden but used as filter, narrow financial/geographic query, count-minus-visible-rows attack, failed page versus zero results and bulk duplicate response. Counts, pagination, exports and permitted drill-down agree without revealing protected residuals.

## A24-04 — Bulk selection is finite intent, not standing authority

**Critical authorization / High integrity; plausible.** Re-evaluating a saved filter in a worker can add people never selected; trusting a browser's selected IDs can admit stale or forbidden records. `Promise.allSettled` does not establish which effects durably committed.

**Clause:** “Bind a deliberate bulk action to its exact appeal, operation and finite selected population under the validated initiating context. Saved filters identify candidates; their later matches do not silently enter accepted intent. Re-prove applicable current authority, entry state and eligibility at each accepted item effect and current permission for its result. Persist enough source-owned intent/outcome to distinguish committed, failed, conflicted and unresolved items without a copied private directory.”

Use the qualified independent-item pattern from [D4:38–54](../phase27-d4-adversarial-review.md:38) where appropriate: each membership change and required local history are atomic; independent members may have different outcomes, clearly reported. A bulk retry binds the original intent and does not re-add removed/excluded entries after a newer deliberate change. Cancellation prevents unaccepted future work at the defined fence; it cannot undo committed history or claim recall of external contact. Do not require indefinite transactions or an all-or-nothing group merely for simplicity.

**Acceptance:** filter/candidate drift, malicious IDs, same-user context switch, revocation/suppression during execution, concurrent exclusion/add, late callback, lost-success retry, same token with changed selection and cancellation between items. Revoke-first prevents a new effect; accepted-before-revoke remains truthful while later disclosure is restricted. No unauthorized recipient or copied PII appears in result rows.

## A24-05 — Recorded population must not become a private copied directory

**Critical; plausible.** Snapshotting names, emails, addresses, financial facts, exact ministry locations or free-text exclusion reasons can bypass later reclassification and retention. Identifiers themselves can reveal protected relationships.

**Clause:** “Persist the minimum scoped membership and change evidence needed for the appeal, with classified source references and governed lawful historical facts. Resolve current display/contact fields through the current source projection. Treat selection manifests, membership IDs, exclusion reasons and provenance as governed data. No full Party/contact snapshot, protected body or raw filter payload belongs in general logs, task previews, exports or browser persistence by default.”

Export is a separate authorized action using P3's field policy, consent/contact-purpose rules, audit and CSV protection; screen visibility or inclusion in a selected row model is insufficient. Non-contact historical reporting remains independently governed, not an excuse for a contact export. Caches and job results bind current principal/context/purpose/governance scope and invalidate on relevant changes. [The current preference cache:92–99](../../../../../packages/database/hooks/admin-crm-table-preferences.ts:92) is a table-ID settings cache, not a qualified appeal population cache. [The generic command logger:46–85](../../../../../packages/api/src/crm/commands/log.ts:46) redacts credential-like keys, not every sensitive list/filter payload.

**Acceptance:** revoked view after export preparation; private exclusion reason in CSV/error; alias replacing a legal name; retained selection after account/context change; revoked fetch arriving late; export formula injection; restricted rows in audit/analytics/telemetry. Already released exports remain unretractable; later release and controlled copies respect current fences.

## A24-06 — Merge/import cannot re-enroll excluded people or rewrite outcomes

**High integrity / Critical authority; plausible.** An identity merge may collide two appeal entries, combine an included and excluded identity, or appear to double asks/gifts. An import may interpret a matching email as permission or restore outdated membership over a newer decision.

**Clause:** “Use the Phase 4 owner for same-real-Party, same-Tenant canonical identity repair. Preserve original source membership/change/request/response evidence and most-restrictive consent; merge is not an owner transfer or new inclusion decision. Resolve a collision without duplicate current canonical entries or automatic renewed outreach. Conflicting inclusion/exclusion evidence cannot silently produce an actionable included outcome. Import uses the same authorized source command and current-state checks; ambiguous identity and missing authority are not inferred from names or email.”

[P4 A9:185](../../../../prds/sitestacker-parity/phase-04-identity-account-claiming-foundation.md:185) already limits mutable reference repair and protects frozen financial facts; D24 does not redefine financial attribution. The source must preserve both histories while selecting a safe, explicit conflict disposition; this does not demand reopening every unrelated merge or building another identity engine. Unmerge/replay must not resurrect excluded work, overwrite newer deliberate changes or multiply requests/fulfillment.

**Acceptance:** both duplicates included; included versus excluded; cross-Tenant attempted merge; identical email for distinct Parties; merge during add; unmerge after later removal; repeat import with stale selection. Current canonical counting is truthful and no branch fabricates consent, asked/committed/received facts or access.

## A24-07 — All database doors and restore paths enforce the same boundary

**Critical; plausible.** Raw service writes, permissive policies or an old backup can bypass the source's membership/exclusion and current permission contract.

**Clause:** “Enforce complete scoped references, trusted actor provenance, allowed old rows and allowed resulting rows across normal commands, imports, workers, repair, views/RPC and privileged paths. Inspect effective grants and policy composition; raw browser access remains prohibited under P12. Couple accepted membership changes with required local history and scoped receipts. Normalize protected constraint errors, and never treat a zero-row denied write as success.”

Fresh [PG17 CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html) confirms omitted UPDATE/ALL `WITH CHECK` inherits `USING`; omission is not inherently a vulnerability. [PG17 row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html) warns integrity checks bypass RLS and can disclose existence. Actual grants and execution roles determine view/function/service behavior; RLS alone does not enforce field disclosure, purpose or concurrent cross-row eligibility. The [Supabase RLS reference](https://supabase.com/docs/guides/database/postgres/row-level-security) is consistent on old/new-row checks; no claim about this project's effective deployed catalog follows.

Keep lawful history under [D7:240–255](../phase27-d7-adversarial-review.md:240): ordinary removal cannot cascade away required request/response evidence, while redaction, anonymization, erasure and retention still govern copied/derived content. Before restored readers/workers activate, reconcile membership changes, current identity, suppression/revocation, consumed effects and disposal fences. If they cannot be proved, hold affected paths rather than expose an old directory or restart excluded outreach.

**Acceptance:** nonowner-role old/new row tests; foreign source FK; direct status/actor tampering; service/import parity; conflicting add/remove race; failed history write; old backup predating merge/exclusion/revocation/erasure. Restored durable intent is not permission to run again.

## Proof boundary

This is a bounded source and primary-document review, not an exhaustive security scan. No D24 SQL/API/browser or live policy test was run. The acceptance cases above remain implementation qualification requirements. Current code establishes reusable mechanics and specific limitations; neither saved views, CSV sanitation, role checks nor adjacent bulk tests establish a safe recorded appeal audience. No additional approval ceremony, private supporter directory, automatic recipient expansion or permanent historical access is proposed.
