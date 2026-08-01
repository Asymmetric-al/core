# Phase 17 Executable System-Message Manifest Specification

- **Status:** Normative Phase 17 companion specification
- **Parent PRD:** `phase-17-system-messages-template-management.md`
- **Decision coverage:** D1 and D16 directly; implementation envelopes and proof
  links for D2–D20
- **Activation posture:** This specification does not make any key Live. Every
  Target Live key remains `Reserved` until its exact proof-gated activation
  passes.

## Phase 19 finite producer-meaning amendment

Phase 19 admits exactly five statement communication meanings into this
manifest generation: ordinary current availability; source- and
exposure-proved current update; contract-permitted withdrawal; fresh
exact-current additional-copy fulfillment; and grouped staff delivery
attention. Portal availability alone, self-print/package readiness, run
progress or completion, transport retries, and missionary visibility are not
message occurrences. Route failure cannot produce a donor notice to the same
failed route. These meanings remain Reserved until each row has its complete
source fence, recipient resolver, Delivery Plan, protected-action contract, and
proof pack.

## Executable Target Live Contract Manifest

The catalog table names the product meanings. The executable manifest below
finishes the D1/D16 contract so an implementation agent never has to invent a
document class, fact wall, trigger, recipient, surface, permission, retention
class, fallback rule, sender, reply posture, or proof requirement.

### Compile-time composition, never runtime inheritance

Each Target Live contract references exactly one immutable shared profile and
supplies only the named per-key override slots shown below. A profile is a
versioned TypeScript constant, not tenant data and not a database-configured
policy. The catalog compiler:

1. resolves the exact profile version;
2. validates every named override against that profile's closed override schema;
3. expands the profile and overrides into one complete, flat contract object;
4. rejects an omitted mandatory field, unknown field, unversioned reference,
   unknown fact, unbound step, or contradictory override;
5. hashes the fully expanded object into the immutable activation manifest; and
6. emits generated docs, database read projections, synthetic fixtures, trigger
   bindings, and closure tests from that same object.

There is no runtime profile lookup, deep merge, default-by-accident, tenant
profile editor, or generic policy language. A profile change creates a new
profile version and manifest generation. A per-key change that alters meaning,
recipient, purpose, document class, protected action, or source truth requires a
successor message key rather than a silent override.

Every expanded contract also carries one closed `scope_kind`: `tenant` or
`platform`. Tenant contracts use the exact tenant isolation, publication,
permission, and tenant-owned Resend rules below. Platform contracts are
Asym-fixed, service-only, and may use only the separately proved Asym platform
Resend connection and a contract-declared verified recipient-authority branch.
Platform v1 reserves exactly one such branch, `eve_platform_owner`, backed by an
exact revision of `platform_owner_notification_records`; every other platform
recipient kind fails before intent creation. They cannot resolve tenant content,
data, credentials, recipients, or fallback transport. This manifest generation
contains **zero Eve platform-email keys**, so Eve #436 email is
non-dispatchable. A later generation must add one exact Reserved key per
ratified Eve source occurrence, a named `scope_kind: platform` profile, exact
source/fence/facts/protected core, and a named key-specific platform proof pack;
only a subsequently Live key may accept an intent. A generic `eve_alert` or
runtime `event_type` key is forbidden. Any future non-Eve platform audience must
first define a separate mutually exclusive typed authority branch, exact source
occurrence/fence, stable keys, and proof packs; absence never permits a generic
address. Eve's Discord operational channel is outside this email/in-product
manifest.

Every execution/history row propagates one structural owner tuple:
`scope_kind`, the exclusive `tenant_id` XOR `platform_scope_id`, and a generated
`scope_owner_id` used in composite parent/result FKs and all semantic,
idempotency, provider, claim, batch, and history keys. Tenant scope requires its
Party/contact revision and tenant delivery profile. Platform v1 requires
`platform_recipient_authority_kind = eve_platform_owner`, the exact revisioned
verified `platform_owner_notification_records` authority, and a service-only
profile backed by `platform_email_settings`; every tenant, Party, contact, site,
tenant-publication, and tenant-relation field is null. Any unknown or absent
platform authority kind rejects. A batch is single-scope. Tenant/client policies
cannot read or mutate platform rows, and no provider or caller field can choose
scope. This is the one Phase 6 spine, not a parallel email system or a fake
tenant.

The compiler MUST reject every `scope_kind: platform` contract unless its
expanded Recent-copy class is exactly `no_readable_copy`. It MUST also reject
any platform plan, surface, retention profile, or projection that can create or
reveal `communication_recent_sent_copies`. This invariant applies to future
platform keys even though the current generation contains none; a readable
platform copy requires a separately ratified contract and manifest-schema
version rather than relaxing this generation's default.

The complete expanded object MUST carry every field in **Code-owned definition**
plus these explicit D1 safety fields:

| Field                                       | Normative meaning                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `scope_kind`                                | explicitly `tenant` or `platform`; required in every expanded object and generated projection, with no inferred or caller-selected default                                                                                                                                                                                           |
| `document_class`                            | one closed data-exposure and legal-presentation class; it is not inferred from a template category                                                                                                                                                                                                                                   |
| `required_fact_keys`                        | the exact facts required in the complete authorized render DTO after the named recipient resolver has run and before channel materialization; producer-owned facts are validated before recipient resolution, resolver-owned facts may be added only by that server resolver, and either source missing a required fact fails closed |
| `conditional_fact_rules`                    | closed code-owned cases that make a named fact required; no expression language                                                                                                                                                                                                                                                      |
| `allowed_optional_fact_keys`                | the only additional facts the producer may project; every unlisted fact is rejected                                                                                                                                                                                                                                                  |
| `forbidden_fact_set_refs`                   | versioned defense-in-depth sets that must remain absent even if a producer or future schema attempts to provide them                                                                                                                                                                                                                 |
| `protected_render_keys`                     | the smallest required facts/actions whose truthful labels, relationships, and semantic grouping cannot be removed, hidden, contradicted, or device-hidden                                                                                                                                                                            |
| `surface_capability_envelope`               | the exact authoring, recipient, history, and source-action surfaces plus the capabilities re-proved at each read and action                                                                                                                                                                                                          |
| `retention_audit_class`                     | one Phase 3/6 retention policy key plus the exact material events that require append-only audit; it never stores the personalized body in durable history                                                                                                                                                                           |
| `prepared_artifact_retention_class_by_step` | exact closed material posture for every delivery step: an external provider-bound artifact class with an absolute ceiling, earlier terminal erasure triggers and body-free residue, or the explicit `prepared.none@1` no-artifact sentinel for `in_product`                                                                          |
| `in_product_presentation_policy_by_step`    | exact closed presentation policy for each `in_product` step; every non-in-product step is explicit `not_applicable`; no inherited default                                                                                                                                                                                            |
| `presentation_end_rule_by_step`             | exact code-owned source-applicability/end rule for each `in_product` step; every non-in-product step is explicit `not_applicable`; missing source-terminal coverage blocks generation                                                                                                                                                |
| `shared_profile_ref`                        | exact immutable profile id and version expanded at manifest build time                                                                                                                                                                                                                                                               |
| `decision_clause_ids`                       | stable D1–D20 traceability clauses satisfied by the contract                                                                                                                                                                                                                                                                         |
| `proof_test_ids`                            | stable automated/manual proof ids that must pass for the exact key and manifest generation                                                                                                                                                                                                                                           |

### Closed document classes

Phase 17 launches only the following applicable classes:

- `receipt@1` — Phase 7 official receipt facts for the legal donor. It preserves
  the three-document wall and permits deductibility fields only from the frozen
  receipt artifact.
- `donor_financial_service_notice@1` — a factual non-tax service notice about a
  completed or failed contribution operation. It cannot claim to be a receipt,
  statement, debt, cash received, or provider settlement.
- `staff_internal_authorization_notice@1` — a minimal role-safe notice that
  points an authorized staff member to source-owned work. It never carries the
  donor-facing financial record.
- `staff_internal_governance_notice@1` — a minimal system-message publication
  review notice. It cannot contain candidate body content or review-comment
  content.
- `staff_internal_repair_notice@1` — a grouped delivery-health notice. It cannot
  contain recipients, message content, credentials, mailbox addresses, or raw
  provider evidence.

`acknowledgment@1`, `recognition_notification@1`, and
`official_artifact_delivery@1` remain valid reserved classes for their owning
phases but are not used by a Target Live key below.

### Closed shared fact atoms

All fact values are Unicode-normalized, context-escaped,
control-character-free, length-bounded values produced by their declared owner.
Every machine-readable fact atom MUST explicitly declare one closed
`source_owner`: `producer_adapter` or `recipient_resolver`; omission is a
compile error and there is no generated default. For prose readability, atoms
grouped below under a producer-owned fact set are producer-owned unless a row
explicitly names the resolver, but manifest generation MUST materialize the
enum on every atom rather than infer it at runtime. Producer-owned atoms are
bound to the exact `fact_adapter_id/version` on that key's trigger binding.
Resolver-owned atoms are bound to that key's exact
`recipient_resolver_id/version`; a producer cannot supply or override them. The
validated union of the two nonoverlapping projections is the complete authorized
render DTO. `MoneySnapshot` is
`{minor_units: int64, currency: ISO-4217, display: frozen source-formatted
string}`. `FrozenDate` and `FrozenInstant` carry the raw date/UTC instant plus
the source-owned locale/time-zone display. Opaque display references are not
database ids and cannot authorize a read.

| Fact key                                               | Type and source rule                                                                                                                                                                                                      |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `recipient.safe_display_name`                          | `SafeText<160>` from the exact authorized recipient projection; `source_owner: recipient_resolver`; synthetic in every preview/test                                                                                       |
| `contribution.public_reference`                        | `OpaqueDisplayReference<64>` from contribution operations; never a tenant selector or authorization                                                                                                                       |
| `contribution.gift_date`                               | `FrozenDate` from the effective contribution record                                                                                                                                                                       |
| `contribution.original_amount`                         | `MoneySnapshot` from the pre-correction effective ledger view                                                                                                                                                             |
| `contribution.corrected_amount`                        | `MoneySnapshot` from the post-correction effective ledger view                                                                                                                                                            |
| `contribution.refund_attempted_amount`                 | `MoneySnapshot` from the immutable source-operation requested amount; it is not provider-confirmed settlement and may be used only by the failed-refund contract to describe what was attempted                           |
| `contribution.refund_amount`                           | `MoneySnapshot` from the provider-confirmed refund outcome                                                                                                                                                                |
| `contribution.remaining_amount`                        | `MoneySnapshot` from the same authoritative effective fold; never template arithmetic                                                                                                                                     |
| `contribution.previous_designation_name`               | `SafeSourceLabel<200>` from the authorized pre-correction designation projection                                                                                                                                          |
| `contribution.current_designation_name`                | `SafeSourceLabel<200>` from the authorized post-correction designation projection                                                                                                                                         |
| `contribution.previous_payment_state`                  | closed donor-visible payment-state enum from the source reducer                                                                                                                                                           |
| `contribution.current_payment_state`                   | closed donor-visible payment-state enum from the source reducer                                                                                                                                                           |
| `contribution.receipt_effect`                          | closed enum: `none`, `replacement_issued`, `voided`, or `pending_source_action`; owned by Phase 7                                                                                                                         |
| `contribution.statement_effect`                        | closed enum: `none`, `future_statement_changed`, or `superseding_artifact_required`; owned by the statement source                                                                                                        |
| `correction.operation_reference`                       | `OpaqueDisplayReference<64>` from the immutable contribution operation                                                                                                                                                    |
| `correction.effective_at`                              | `FrozenInstant` from source finality                                                                                                                                                                                      |
| `correction.safe_explanation_code`                     | closed code-owned donor-safe explanation case; never raw provider text                                                                                                                                                    |
| `correction.personal_note`                             | optional escaped `SafeText<500>` captured by the contribution-operation boundary; no HTML, URL, tax claim, provider reason, other-Party identity, fundraising/marketing/consent ask, or replacement of the protected core |
| `receipt.legal_donor_display_name`                     | frozen legal-donor name from the Phase 7 receipt version                                                                                                                                                                  |
| `receipt.legal_donor_address`                          | frozen legal-donor address block from the Phase 7 receipt version; recipient-private                                                                                                                                      |
| `receipt.organization_legal_name`                      | frozen issuing-entity legal name from the Phase 7 receipt version                                                                                                                                                         |
| `receipt.organization_tax_identifier`                  | frozen issuing-entity tax identifier from the Phase 7 receipt version                                                                                                                                                     |
| `document.public_reference` / `document.revision`      | immutable Phase 18 generated-document identity and revision; U.S. and Canadian identity policies remain purpose-owned                                                                                                     |
| `document.issued_at` / `receipt.gift_date`             | Phase 18 `FrozenInstant` for document issuance plus Phase 7 `FrozenDate` for the source gift                                                                                                                              |
| `receipt.gross_amount`                                 | `MoneySnapshot` from the receipt version                                                                                                                                                                                  |
| `receipt.deductible_amount`                            | `MoneySnapshot` from the receipt version                                                                                                                                                                                  |
| `receipt.goods_services_statement`                     | closed Phase 7 statement case plus frozen display text                                                                                                                                                                    |
| `receipt.goods_services_fair_market_value`             | `MoneySnapshot`; conditionally required only when the Phase 7 case says goods/services were provided                                                                                                                      |
| `receipt.intangible_religious_benefit_text`            | frozen Phase 7 text; conditionally required only for that Phase 7 case                                                                                                                                                    |
| `receipt.in_kind_description`                          | frozen Phase 7 description; conditionally required for in-kind receipts and structurally excluded from template-authored valuation                                                                                        |
| `receipt.designation_lines`                            | bounded ordered Phase 7 projection of safe designation label plus frozen amount; no template aggregation                                                                                                                  |
| `document.currentness`                                 | closed Phase 18 `current` or `superseded` value constrained by Phase 7 source validity; only the current authorized artifact can supply a new-download action                                                             |
| `receipt.superseded_number_version`                    | immutable prior identity; required for replacement/correction messages                                                                                                                                                    |
| `receipt.replacement_reason_code`                      | closed Phase 7 reason; no free-text legal explanation                                                                                                                                                                     |
| `approval.request_reference`                           | `OpaqueDisplayReference<64>` from the correction request                                                                                                                                                                  |
| `approval.action_label`                                | code-owned safe label from the correction action enum                                                                                                                                                                     |
| `approval.status`                                      | closed `pending`, `approved`, `rejected`, or `cancelled` source state                                                                                                                                                     |
| `approval.requested_at` / `approval.pending_since`     | `FrozenInstant` from the source request                                                                                                                                                                                   |
| `approval.reminder_sequence`                           | bounded positive integer from the producer-owned SLA occurrence                                                                                                                                                           |
| `approval.escalated_at`                                | `FrozenInstant` from the producer-owned escalation occurrence                                                                                                                                                             |
| `approval.decision` / `approval.decided_at`            | closed source decision and `FrozenInstant`; no decision-note body in the notification                                                                                                                                     |
| `publication.candidate_reference`                      | `OpaqueDisplayReference<64>` for the exact immutable candidate                                                                                                                                                            |
| `publication.message_safe_title`                       | safe code/catalog title, not personalized subject or content                                                                                                                                                              |
| `publication.scope_label` / `publication.locale_label` | safe system-generated labels for exact scope and locale                                                                                                                                                                   |
| `publication.author_safe_label`                        | authorized staff display label; no email or hidden profile data                                                                                                                                                           |
| `publication.committed_at`                             | `FrozenInstant`                                                                                                                                                                                                           |
| `publication.protected_change_codes`                   | bounded closed codes describing protected dimensions changed; no document or diff body                                                                                                                                    |
| `publication.review_comment_count`                     | bounded integer only; no review-comment body                                                                                                                                                                              |
| `publication.review_decided_at`                        | `FrozenInstant`                                                                                                                                                                                                           |
| `repair.case_reference`                                | `OpaqueDisplayReference<64>` for one grouped D15 repair case                                                                                                                                                              |
| `repair.cause_code` / `repair.severity`                | closed D15 code-owned values                                                                                                                                                                                              |
| `repair.owner_label` / `repair.next_action_label`      | safe code-owned labels; no address or credential                                                                                                                                                                          |
| `repair.affected_count`                                | nonnegative bounded integer; no recipient list                                                                                                                                                                            |
| `repair.first_seen_at` / `repair.last_changed_at`      | `FrozenInstant`                                                                                                                                                                                                           |

No runtime record traversal is implied by these names. The named producer fact
adapter and server recipient resolver jointly materialize the complete
authorized DTO before channel materialization. The producer cannot supply or override
resolver-owned facts, and neither side may traverse arbitrary records.

### Versioned forbidden-fact sets

The fact allow-list is the primary control: any fact not in a key's required,
conditional, or allowed-optional list is rejected. These immutable sets are an
additional fail-closed barrier:

- `forbid.external_sensitive@1`: `care.*`, `staff.private_*`,
  `staff.permission_*`, `credentials.*`, `payment.card_*`, `payment.bank_*`,
  `payment.cvc`, `payment.routing_*`, `provider.raw_*`, `provider.decline_*`,
  `provider.risk_*`, `request.headers`, `transport.headers`, `record.arbitrary_*`,
  `recipient.query`, `action.raw_url`, and `action.secret`.
- `forbid.required_message_marketing@1`: `campaign.*`, `appeal.*`,
  `marketing.*`, `fundraising.ask_*`, `fundraising.solicitation`,
  `tracking.open_pixel`, `tracking.click_rewrite`, and `consent.capture_*`.
- `forbid.receipt_cross_party@1`: `soft_credit.*`, `tribute.*`,
  `matching.recognition_*`, `other_party.*`, `receipt.live_computation_*`, and
  `receipt.draft_*`.
- `forbid.correction_internal@1`: `correction.internal_reason`,
  `correction.staff_note`, `correction.approver_identity`,
  `donor.previous_identity`, `donor.current_identity`, `other_party.*`,
  `payment_method.*`, and `provider.*`.
- `forbid.staff_financial_detail@1`: `donor.*`, `missionary.*`, `care.*`,
  `contribution.original_amount`, `contribution.corrected_amount`,
  `contribution.refund_attempted_amount`, `contribution.refund_amount`,
  `contribution.remaining_amount`,
  `contribution.payment_method`, `correction.personal_note`,
  `correction.reason_free_text`, and `provider.*`.
- `forbid.publication_content@1`: `publication.document_body`,
  `publication.compiled_html`, `publication.compiled_text`,
  `publication.review_comment_body`, `publication.fact_values`, every
  `recipient.*` fact except the exact resolver-owned
  `recipient.safe_display_name`, `credentials.*`, and `action.secret`. That one
  exception remains `SafeText<160>` from the exact authorized recipient
  projection, cannot be supplied or overridden by a producer, and grants no
  access to any other current or future `recipient.*` fact.
- `forbid.repair_content@1`: `communication.recipient_address`,
  `communication.personalized_subject`, `communication.body`,
  `communication.fact_values`, `provider.raw_*`, `credentials.*`,
  `sender.address`, `reply.address`, and `action.secret`.

### Protected action descriptors used by Target Live contracts

These are producer-owned descriptors, never URLs or bearer tokens supplied by a
template:

| Descriptor id                         | Producer and harmless-landing postcondition                                                                                                                                                                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `receipt.open_current@1`              | Phase 18 opens the exact current artifact after current tenant/Party/source-validity/lineage/artifact authorization reproof; Phase 7 supplies eligibility/issuance/correction effect only, and GET never issues, replaces, corrects, or acknowledges anything |
| `contribution.open_history@1`         | contribution operations opens the authorized contribution detail/history; no mutation                                                                                                                                                                         |
| `giving.open_support@1`               | opens the tenant's protected giving-help route or exposes the D17 reply affordance; no dynamic mailbox or recipient data                                                                                                                                      |
| `approval.open_request@1`             | contribution operations opens the exact pending/outcome request; approval/rejection requires a fresh separately authorized source command                                                                                                                     |
| `publication.open_candidate_review@1` | Phase 17 opens the exact immutable candidate for an active independent reviewer; the notification click never approves                                                                                                                                        |
| `publication.open_candidate@1`        | Phase 17 opens the exact candidate and review result for a currently authorized editor; no mutation                                                                                                                                                           |
| `repair.open_case@1`                  | D15 opens one grouped repair case after current `system_messages.repair.manage` reproof; no force-send or blind replay                                                                                                                                        |

### Exact surface and capability envelopes

| Envelope id                   | Product surfaces                                                                                                                                                                             | Required capability/reproof                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `surface.donor_official@1`    | System Messages catalog/editor/preview/version history; donor email; donor-safe Phase 6 history; staff body-free history; optional eligible Recent copy; Phase 18 generated-document surface | authoring uses `system_messages.read`, `system_messages.draft.edit`, `system_messages.commit`, and the applicable exact `system_messages.publish.standard`, `system_messages.review.protected`, or `system_messages.publish.protected` capability; Recent copy uses `system_messages.recent_copy.reveal`; donor artifact read uses current Phase 18 access authority constrained by Phase 7 source validity |
| `surface.donor_financial@1`   | System Messages catalog/editor/preview/version history; donor email; donor-safe Phase 6 history; staff body-free history; optional eligible Recent copy; source contribution history         | same Phase 17 authoring capabilities; source suppression/history actions require contribution-operation capability; donor view re-proves current Party/contact projection                                                                                                                                                                                                                                   |
| `surface.staff_finance@1`     | active-tenant bell, notification center, exact source approval task/detail, body-free history, and optional staff email                                                                      | recipient must remain the exact active eligible approver or requester and retain source-record access; engagement never grants `contributions.approve_corrections`; content authoring uses Phase 17 capabilities                                                                                                                                                                                            |
| `surface.staff_publication@1` | active-tenant bell, notification center, candidate detail/review queue, and body-free history                                                                                                | review request recipient re-proves `system_messages.review.protected`; changes-requested recipient re-proves active candidate edit access; notification engagement never publishes                                                                                                                                                                                                                          |
| `surface.staff_repair@1`      | active-tenant bell, notification center, System Messages Needs attention, one grouped repair surface, and body-free history                                                                  | viewer re-proves `system_messages.read`; action additionally re-proves `system_messages.repair.manage`; no support impersonation may repair or reveal content                                                                                                                                                                                                                                               |

Every deep link re-proves tenant, active membership, source-record access,
capability epoch, restricted-person policy, and exact destination code. A hidden
button, notification recipient row, or opaque reference is never authority.

### Closed in-product presentation policies

The current manifest admits exactly two policies. They govern user-facing
presentation only; `retention_audit_class`, prepared-material retention, and
email Recent sent-copy policy remain independent.

| Policy id                                          | Active presentation                                                                                                                                                                  | Presentation end and recent history                                                                                                                                                                                                                                                          |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `presentation.source_actionable_then_recent_90d@1` | **Needs attention** and **All** while the exact source rule is actionable and current access holds; read clears unread/badge only; archive is unavailable with a visible explanation | source terminal/superseded/expired/not-applicable sets `presentation_ended_at`; no unread debt if unseen; authorized non-unread recent history lasts exactly 90 days from that instant; access loss removes immediately; later authority/new transitions never revive or extend the old item |
| `presentation.information_30d_then_recent_90d@1`   | **All** only; unread/badge ends at earliest read, archive, correction/supersession, or `available_at + 30 days`; reversible archive never changes a deadline                         | authorized ordinary recent history lasts until `available_at + 90 days`; access loss removes immediately; correction/supersession ends unread treatment without rewriting evidence                                                                                                           |

At the 90-day ceiling the query path returns no presentation even if purge is
late. Purge removes preview/search material while separately governed body-free
audit and permitted tombstone/engagement evidence remain. UTC instants are
authoritative; local display, grouping, retry, tenant settings, and engagement
cannot extend them. Every future Reserved→Live in-product key must select one
policy and one exact end rule before activation.

The manifest's `presentation_end_rule_by_step` compiles directly into the
notification item's immutable `source_applicability_rule_ref`. The initial
closed rule registry contains exactly:

| Rule id                                          | Exact source applicability and end                                                                                                                                                                                                                                                                              | Required visible explanation while actionable                                      |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `presentation_end.approval_pending_current@1`    | exact request revision is `pending`, unexpired, uncanceled, unsuperseded and undecided; the generated step resolver proves the recipient remains its active eligible approver; a source terminal starts authorized recent history; access loss removes immediately with no recent-history visibility or revival | **This stays here until the approval is completed or canceled.**                   |
| `presentation_end.approval_outcome_current@1`    | exact decided outcome revision remains current; correction/supersession ends unread treatment early while the information-policy ceiling remains fixed; access loss removes immediately with no later revival                                                                                                   | `not_applicable` because this policy never appears in **Needs attention**          |
| `presentation_end.publication_review_current@1`  | exact immutable candidate revision awaits independent review; decision, publish, withdrawal, replacement, supersession, or staleness starts authorized recent history; reviewer-authority loss removes immediately with no recent-history visibility or revival                                                 | **This stays here until this review is completed or the draft changes.**           |
| `presentation_end.publication_changes_current@1` | exact candidate revision remains current/editable with changes requested; next commit/review decision, publish, withdrawal, supersession, or staleness starts authorized recent history; editor-authority loss removes immediately with no recent-history visibility or revival                                 | **This stays here until a revised draft is submitted or this draft is withdrawn.** |
| `presentation_end.repair_case_open_current@1`    | exact repair case remains open/current; close, resolution, or supersession starts authorized recent history; repair-recipient authority loss removes immediately with no recent-history visibility or revival; a later meaningful transition creates a new item                                                 | **This stays here until this delivery issue is resolved.**                         |

These are typed predicates implemented by the named source adapters and generated
recipient resolvers, not tenant-authored expressions or a generic rules engine.

Every tenant-customizable profile uses the same exact authoring envelope:
`system_messages.read` to inspect; `system_messages.draft.edit` to edit and run
synthetic preview; `system_messages.commit` to freeze a candidate;
`system_messages.publish.standard` only when the server's D11 predicate classifies
the exact diff as standard; and a different active principal with
`system_messages.review.protected` followed by
`system_messages.publish.protected` when the predicate classifies it as
protected. None of those capabilities grants a source-domain action,
Recent-copy reveal, connection/secret access, sender/reply administration, or
repair authority.

### Exact retention and audit classes

| Class id                            | Durable Phase 6 record                                                                                                                                                                               | Recent sent copy                                                                                      | Mandatory append-only audit                                                                                                                                                                                         |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `retention.official_receipt@1`      | `official`, at least seven years and preferably permanent under the Phase 3/6 policy version; body-free event plus exact immutable Phase 18 artifact reference and Phase 7 source issuance reference | tenant chooses 30 days (Recommended/default), 7 days, or Off; 30-day ceiling; protected actions inert | source issuance/supersession, document publication/artifact lineage, message publication/review, preparation, provider crossing/outcome/correction, authorized reveal/denial, suppression decision, retention purge |
| `retention.financial_operational@1` | `operational` for the exact Phase 3 policy version; body-free event and source operation reference; no body, personal note, recipient address, or provider payload                                   | tenant chooses 30 days (Recommended/default), 7 days, or Off; 30-day ceiling; protected actions inert | source notification/suppression decision, publication/review, preparation, provider crossing/outcome/correction, reveal/denial, retention purge                                                                     |
| `retention.authorization_notice@1`  | `operational`; immutable notification availability and engagement are separate; no donor facts or decision-note body                                                                                 | Off-only                                                                                              | source occurrence, recipient resolution result, availability, optional email eligibility/outcome, access denial, correction/supersession                                                                            |
| `retention.publication_notice@1`    | `operational`; immutable availability and engagement only                                                                                                                                            | Off-only                                                                                              | candidate commit, review routing, recipient resolution, availability, access denial, review outcome/correction                                                                                                      |
| `retention.repair_notice@1`         | `operational`; grouped case transition and safe counts only                                                                                                                                          | Off-only                                                                                              | repair-case open/change/close, recipient resolution, availability, preflight, resume/cancel result, access denial; never credential, recipient list, message body, or raw provider evidence                         |

The concrete duration behind `operational` remains a versioned Phase 3 policy,
not a Phase 17 tenant slider. D14's optional Recent copy is separate from both
durable history and Resend's independently governed external retention.

The Phase 10 strictest-applicable safety projection is evaluated after the
tenant duration choice and always wins. A restricted or high-risk recipient,
message, or reclassification forces **Recent copy = Off**, denies every reveal,
and enqueues priority purge of any existing readable Recent sent copy while
preserving only the body-free purge/tombstone evidence. No tenant setting,
support role, legal hold on unrelated history, restore, or older publication may
add readable content back.

### Closed provider-bound material retention classes

These classes govern only decryptable provider-bound preparation/submission
material. They do not change the durable body-free history class or the optional
Recent sent-copy policy above.

| Class id                           | Allowed contract use                                          | Immutable ceiling and earlier terminal triggers                                                                                                                                                                                                                                                                                   | Durable residue after purge                                                                                           |
| ---------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `prepared.external_required_30d@1` | required/source-required donor receipt and financial email    | earliest of 30 days after seal, intent expiry/utility boundary, protected-action expiry, erasure/privacy/safety stop; also terminal on proved acceptance, nonretryable/exhausted definite rejection, canceled/suppressed/superseded definitely-unsubmitted work, or end of the provider idempotency window for indeterminate work | hashes, ids, source/provider fences, normalized body-free outcome and content-free purge/backup/erasure evidence only |
| `prepared.optional_staff_7d@1`     | optional staff-email sibling of required in-product attention | same triggers, with a 7-day ceiling and earlier source-task/recipient-role loss                                                                                                                                                                                                                                                   | same                                                                                                                  |
| `prepared.none@1`                  | in-product-only contract                                      | no email provider-bound artifact or request bytes may be created                                                                                                                                                                                                                                                                  | ordinary in-product/body-free evidence under the retention/audit class                                                |

At seal, the implementation freezes `restricted_material_purge_due_at`; it can
only move earlier through an applicable terminal trigger. A batch submission
uses the earliest member deadline and may not extend any member. Decryption is
denied at the trigger instant; primary ciphertext, wrapped keys and
plaintext-capable caches purge within 24 hours. Indeterminate outcome evidence
may remain permanently unknown after bytes are purged, but it can never authorize
replay or restoration. A new class or changed ceiling is a new manifest
generation and cannot be tenant-authored.

### Fully expanded shared contract profiles

The following profiles supply every code-owned field not named as a per-key
override in the Target Live table.

#### `profile.receipt_required_email@1`

- `scope_kind`: `tenant`.
- `purpose/classification`: `giving_receipt` /
  `required_official_transactional@1`.
- `requiredness`: the Phase 7 producer emits only after receipt issuance and its
  delivery policy establish an eligible required email; Phase 17 cannot disable
  it. The one named exception is `contribution_receipt_corrected_v1`: the
  contribution-operation source may apply its existing capability- and
  reason-bound audited suppression decision, but Phase 17 content/settings
  still cannot suppress it.
- `audiences`: `phase7.legal_donor_delivery_contact@1`, cardinality exactly one
  authorized recipient per artifact; zero eligible contact blocks with a
  source-owned repair consequence and never substitutes another Party.
- `document_class`: `receipt@1`.
- `fact_schema`, `truth_core`, `actions`, and `source_identity`: exact per-key
  overrides.
- `channels/delivery_plan`: `plan.one_required_email@1`, step
  `recipient_email`, no tenant timing or channel override.
- `locale_policy`: `locale.official_language_first@1`, `platform_fixed`; exact
  compatible tenant/site publication first, then bounded compatible language
  parent/tenant default and protected system default. It can never change legal
  entity, jurisdiction, document class, facts, sender, or recipient.
- `layout_role`: `service_message@1`; the official artifact/fact block remains
  protected and semantic.
- `sender_purpose`: `giving_and_receipts`.
- `reply_posture`: `giving_help`.
- `recent_copy_policy`: `retention.official_receipt@1`.
- `prepared_artifact_retention_class_by_step`:
  `{ recipient_email: prepared.external_required_30d@1 }`.
- `in_product_presentation_policy_by_step`:
  `{ recipient_email: not_applicable }`.
- `presentation_end_rule_by_step`: `{ recipient_email: not_applicable }`.
- `recovery_policy`: `recovery.required_compatible_whole_before_prepare@1`;
  after preparation, retry/reconcile only the same sealed message.
- `provider_policy`: `resend.required_transactional@2026-07-19`, tracking Off,
  one recipient, tenant-owned connection only.
- `surface_capability_envelope`: `surface.donor_official@1`.
- `retention_audit_class`: `retention.official_receipt@1`.
- `publication_review`: standard surrounding-copy changes may self-publish;
  changing a protected node, fact position/label, document wall, action, legal
  identity, or requiredness invokes D11 independent review.
- `decision_clause_ids`: `trace.receipt_required_email@1`, expanded to exact
  immutable clause ids in the dated traceability artifact.
- `proof_requirements`: `proof.receipt_email@1` plus the key-specific test ids.

#### `profile.donor_financial_correction@1`

- `scope_kind`: `tenant`.
- `purpose/classification`: `contribution_correction` /
  `required_transactional_service@1`.
- `requiredness`: `source_required_with_audited_suppression@1`. The producing
  contribution operation decides whether a donor notice is required. Money or
  official-document suppression requires the existing source capability,
  reason, and immutable audit; Phase 17 content/settings cannot suppress it.
- `audiences`: `contribution.authorized_affected_contact@1`, one independent
  recipient intent per authorized affected Party/contact revision; no old/new
  donor identity is inferred by the template.
- `document_class`: `donor_financial_service_notice@1` unless the exact key
  override uses the frozen Phase 7 receipt class.
- `fact_schema`, `truth_core`, `actions`, and `source_identity`: exact per-key
  overrides.
- `channels/delivery_plan`: `plan.one_source_required_email@1`, step
  `recipient_email`; no Phase 17 timer or additional recipient.
- `locale_policy`: `locale.correction_scope_inheritance_no_fallback@1`,
  `fallback_prohibited`. Normal whole-message inheritance from site to tenant in
  the requested locale is allowed. Cross-language and protected-system-default
  fallback are prohibited; missing/invalid/incompatible content blocks the
  notice and opens D15 repair without undoing the completed source operation.
- `layout_role`: `service_message@1`.
- `sender_purpose`: `giving_and_receipts`.
- `reply_posture`: `giving_help`.
- `recent_copy_policy`: `retention.financial_operational@1`.
- `prepared_artifact_retention_class_by_step`:
  `{ recipient_email: prepared.external_required_30d@1 }`.
- `in_product_presentation_policy_by_step`:
  `{ recipient_email: not_applicable }`.
- `presentation_end_rule_by_step`: `{ recipient_email: not_applicable }`.
- `recovery_policy`: `recovery.required_no_content_fallback@1`; exact sealed
  retry/reconciliation only after preparation.
- `provider_policy`: `resend.required_transactional@2026-07-19`, tracking Off,
  one recipient, tenant-owned connection only.
- `surface_capability_envelope`: `surface.donor_financial@1`.
- `retention_audit_class`: `retention.financial_operational@1` unless the exact
  receipt-correction key overrides it.
- `publication_review`: standard surrounding-copy changes may self-publish;
  protected financial meaning, required fact/action, suppression language, or
  document-class changes require D11 independent review.
- `decision_clause_ids`: `trace.donor_financial_correction@1`, expanded in the
  dated traceability artifact.
- `proof_requirements`: `proof.donor_financial_correction@1` plus key-specific
  test ids.

#### `profile.finance_approval_attention@1`

- `scope_kind`: `tenant`.
- `purpose/classification`: `contribution_approval_attention` /
  `internal_authorization@1`.
- `requiredness`: `plan.required_in_product_optional_email@1`. The in-product
  step is required for every exact eligible recipient. Email runs only when the
  code-owned contract permits the optional email slot, the tenant-published plan
  enables it, and recipient preference enables it.
- `audiences`: exact per-key resolver override; cardinality is one intent per
  active authorized staff Party+role. Losing access removes availability and
  blocks the action without rewriting history.
- `document_class`: `staff_internal_authorization_notice@1`.
- `fact_schema`, `truth_core`, `actions`, and `source_identity`: exact per-key
  overrides.
- `channels/delivery_plan`: required `staff_in_product` slot and optional
  `staff_email` slot. Producer-owned request/reminder/escalation/outcome
  occurrences supply timing; Phase 17 adds no timer.
- `locale_policy`: `locale.staff_language_first_system_safe@1`,
  `tenant_policy_eligible`, with compatible protected system default.
- `layout_role`: `not_applicable` for in-product and `service_message@1` for the
  optional email slot.
- `sender_purpose`: `staff_operations` for email; `not_applicable` in-product.
- `reply_posture`: `staff_operations_help` for email; `not_applicable`
  in-product.
- `recent_copy_policy`: Off-only.
- `prepared_artifact_retention_class_by_step`:
  `{ staff_in_product: prepared.none@1, staff_email: prepared.optional_staff_7d@1 }`.
- `in_product_presentation_policy_by_step`:
  `{ staff_in_product: presentation.source_actionable_then_recent_90d@1, staff_email: not_applicable }`, except the approval-outcome key's exact override to `presentation.information_30d_then_recent_90d@1`.
- `presentation_end_rule_by_step`: exact per-key rule in the Target Live mapping;
  `staff_email: not_applicable`.
- `recovery_policy`: the required local in-product item is independent of email;
  an optional email failure is suppressed/recorded and never creates or
  completes another approval task.
- `provider_policy`: `provider.local_in_product@1` plus
  `resend.optional_internal@2026-07-19` for email.
- `surface_capability_envelope`: `surface.staff_finance@1`.
- `retention_audit_class`: `retention.authorization_notice@1`.
- `publication_review`: protected action/destination/required-core changes
  require D11; ordinary wording outside the core may self-publish.
- `decision_clause_ids`: `trace.finance_approval_attention@1`, expanded in the
  dated traceability artifact.
- `proof_requirements`: `proof.staff_finance_attention@1` plus key-specific test
  ids.

#### `profile.publication_governance_attention@1`

- `scope_kind`: `tenant`.
- `purpose/classification`: `system_message_publication_governance` /
  `internal_governance@1`.
- `requiredness`: one required in-product item per exact active authorized
  recipient; no email step.
- `audiences`: exact per-key Phase 12 resolver override.
- `document_class`: `staff_internal_governance_notice@1`.
- `fact_schema`, `truth_core`, `actions`, and `source_identity`: exact per-key
  overrides.
- `channels/delivery_plan`: `plan.one_required_in_product@1`, step
  `staff_in_product`.
- `locale_policy`: `locale.staff_language_first_system_safe@1`,
  `platform_fixed` for fallback order; a tenant may customize surrounding text
  without changing the protected review meaning.
- `layout_role`, `sender_purpose`, `reply_posture`: `not_applicable`.
- `recent_copy_policy`: Off-only.
- `prepared_artifact_retention_class_by_step`:
  `{ staff_in_product: prepared.none@1 }`.
- `in_product_presentation_policy_by_step`:
  `{ staff_in_product: presentation.source_actionable_then_recent_90d@1 }`.
- `presentation_end_rule_by_step`: exact per-key rule in the Target Live mapping.
- `recovery_policy`: `recovery.required_local_system_default@1`; an invalid
  tenant publication resolves to the compatible immutable system default before
  preparation. Source review work remains authoritative.
- `provider_policy`: `provider.local_in_product@1`.
- `surface_capability_envelope`: `surface.staff_publication@1`.
- `retention_audit_class`: `retention.publication_notice@1`.
- `publication_review`: this message's protected action and review meaning
  require D11; ordinary surrounding wording may self-publish against the prior
  safe publication, preventing a bootstrap loop.
- `decision_clause_ids`: `trace.publication_governance_attention@1`, expanded in
  the dated traceability artifact.
- `proof_requirements`: `proof.publication_attention@1` plus key-specific test
  ids.

#### `profile.delivery_repair_attention@1`

- `scope_kind`: `tenant`.
- `purpose/classification`: `system_message_delivery_operations` /
  `internal_repair@1`.
- `requiredness`: one required in-product item per exact active repair-capable
  recipient when a grouped D15 case has a meaningful transition; no email step
  because broken tenant email cannot be the only alert path.
- `audiences`: `phase12.active_email_repair_operator@1`; one item per active
  Party+role, with attention grouping by case signature.
- `document_class`: `staff_internal_repair_notice@1`.
- `fact_schema`, `truth_core`, `actions`, and `source_identity`: exact per-key
  overrides.
- `channels/delivery_plan`: `plan.one_required_in_product@1`, step
  `staff_in_product`.
- `locale_policy`: `locale.staff_language_first_system_safe@1`,
  `platform_fixed` for fallback order; compatible immutable system default is
  mandatory.
- `layout_role`, `sender_purpose`, `reply_posture`: `not_applicable`.
- `recent_copy_policy`: Off-only.
- `prepared_artifact_retention_class_by_step`:
  `{ staff_in_product: prepared.none@1 }`.
- `in_product_presentation_policy_by_step`:
  `{ staff_in_product: presentation.source_actionable_then_recent_90d@1 }`.
- `presentation_end_rule_by_step`: exact per-key rule in the Target Live mapping.
- `recovery_policy`: `recovery.required_local_system_default@1`; the repair
  notification never becomes another repair case and never force-sends the
  affected communication.
- `provider_policy`: `provider.local_in_product@1`.
- `surface_capability_envelope`: `surface.staff_repair@1`.
- `retention_audit_class`: `retention.repair_notice@1`.
- `publication_review`: protected cause/action/impact semantics require D11;
  ordinary wording outside the core may self-publish.
- `decision_clause_ids`: `trace.delivery_repair_attention@1`, expanded in the
  dated traceability artifact.
- `proof_requirements`: `proof.delivery_repair_attention@1` plus key-specific
  test ids.

### Target Live key instances

The union of each key's `required`, `conditional`, and allowed `optional` facts
is its complete authorized render-DTO allow-list. The compiler derives two
nonoverlapping projections from every atom's closed `source_owner`: the producer
allow-list and the recipient-resolver allow-list. It independently validates
each projection, rejects every unlisted fact, rejects producer-supplied
resolver facts and resolver-supplied producer facts, then unions the two proved
projections. Per-key duplicate ownership lists and arbitrary record bags are
forbidden. Every fact named in `protected` must render in the Managed
source-owned semantic group.
All 18 Target Live keys inherit the explicit `scope_kind: tenant` from their one
named profile; a key override may not alter scope. This generation has no Eve
platform-email key. Eve email remains blocked until a later manifest generation
adds exact meaning-specific Reserved keys under a separately named
`scope_kind: platform` profile and each selected key passes its named
platform-scope proof pack to become Live. Absence never permits a generic key,
tenant key, direct sender, or platform fallback.

#### Receipt keys

| Stable key                          | Shared profile                     | Exact source and fact override                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Protected action / core                                                                                                                                                             | Forbidden sets                                                                                       | Proof pack            |
| ----------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------- |
| `giving_receipt_issued_v1`          | `profile.receipt_required_email@1` | source `phase7.receipt.issued@1` plus exact `phase18.document.current_ready@1`, fence `{source_receipt_id, source_version, logical_document_id, document_revision}`; Phase 7 requires recipient/legal donor/organization/gift/money/goods-services and applicable FMV/religious-benefit/in-kind facts; Phase 18 requires `document.public_reference`, `document.revision`, `document.issued_at`, `document.currentness`, and exact artifact action; optional none                                          | `receipt.open_current@1`; protect Phase 7 legal/tax/money facts and Phase 18 document identity/currentness/action                                                                   | `forbid.external_sensitive@1`, `forbid.required_message_marketing@1`, `forbid.receipt_cross_party@1` | `P17-KEY-RCPT-ISS@1`  |
| `giving_receipt_replaced_v1`        | `profile.receipt_required_email@1` | source `phase7.receipt.replacement_issued@1` plus exact Phase 18 successor artifact, fence `{source_receipt_id, source_version, predecessor_source_version, logical_document_id, document_revision}`; all issued required/conditional facts plus Phase 18 predecessor/replacement identity and the source-owned replacement reason; optional none                                                                                                                                                          | `receipt.open_current@1`; issued core plus explicit replacement/supersession identity; prior artifact is never rewritten                                                            | same as receipt issued                                                                               | `P17-KEY-RCPT-REPL@1` |
| `contribution_receipt_corrected_v1` | `profile.receipt_required_email@1` | source `contribution.receipt_correction_effect@1` plus exact `phase18.document.current_ready@1`, fence `{operation_id, operation_outcome_version, source_receipt_id, source_version, logical_document_id, document_revision}`; recipient resolver remains `phase7.legal_donor_delivery_contact@1`; requiredness overrides only to `source_required_with_audited_suppression@1`; replacement facts plus `correction.operation_reference` and `correction.effective_at`; optional `correction.personal_note` | `receipt.open_current@1`; Phase 18 replacement identity/action plus source operation reference; cannot duplicate `giving_receipt_replaced_v1` for the same semantic source identity | same as receipt issued plus `forbid.correction_internal@1`                                           | `P17-KEY-RCPT-CORR@1` |

#### Donor financial correction keys

`facts.donor_correction_base@1` is the exact required base:
`recipient.safe_display_name`, `contribution.public_reference`,
`contribution.gift_date`, `correction.operation_reference`,
`correction.effective_at`, and `correction.safe_explanation_code`. The only
allowed optional fact is `correction.personal_note`, and only under the source
privacy rule stated below.

| Stable key                                 | Exact producer source/fence                                                                                            | Required / conditional / optional facts                                                                                                                                                                                   | Protected action and render core                                                                                                                                           | Additional forbidden rule                                                        | Proof pack                |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------- |
| `contribution_refund_failed_v1`            | `contribution.refund_failed@1`; `{operation_id, provider_outcome_revision}`                                            | `facts.donor_correction_base@1` + `contribution.original_amount`, `contribution.refund_attempted_amount`; optional `correction.personal_note`; `contribution.refund_amount` is forbidden because no settled refund exists | `giving.open_support@1`; protect failed-not-received wording, attempted amount/currency, source finality, support route; never state funds moved                           | raw/provider decline reason and any settled-refund amount/claim remain forbidden | `P17-KEY-REFUND-FAIL@1`   |
| `contribution_refund_completed_v1`         | `contribution.refund_completed_unspecified_kind@1`; `{operation_id, provider_outcome_revision}`                        | base + `contribution.original_amount`, `contribution.refund_amount`, `contribution.remaining_amount`; optional `correction.personal_note`                                                                                 | `contribution.open_history@1`; protect provider-confirmed completion, refund and remaining amounts/currency, effective time                                                | generic variant requires refund kind `unspecified`                               | `P17-KEY-REFUND-DONE@1`   |
| `contribution_partial_refund_completed_v1` | `contribution.partial_refund_completed@1`; `{operation_id, provider_outcome_revision}`                                 | completed schema; additionally source invariant `contribution.refund_amount > 0` and `contribution.remaining_amount > 0`; template never calculates either                                                                | same as completed, with protected **partial refund** label                                                                                                                 | no generic/full alias                                                            | `P17-KEY-REFUND-PART@1`   |
| `contribution_full_refund_completed_v1`    | `contribution.full_refund_completed@1`; `{operation_id, provider_outcome_revision}`                                    | completed schema; additionally source invariant `contribution.remaining_amount = 0`; template never calculates equality                                                                                                   | same as completed, with protected **full refund** label                                                                                                                    | no generic/partial alias                                                         | `P17-KEY-REFUND-FULL@1`   |
| `contribution_amount_corrected_v1`         | `contribution.amount_corrected@1`; `{operation_id, correction_version}`                                                | base + `contribution.original_amount`, `contribution.corrected_amount`; optional `correction.personal_note`                                                                                                               | `contribution.open_history@1`; protect original/corrected money with currency and effective time                                                                           | no refund or receipt claim                                                       | `P17-KEY-AMOUNT-CORR@1`   |
| `contribution_designation_changed_v1`      | `contribution.designation_changed@1`; `{operation_id, correction_version}`                                             | base + `contribution.previous_designation_name`, `contribution.current_designation_name`; optional `correction.personal_note`                                                                                             | `contribution.open_history@1`; protect previous/current relationship and effective time; source adapter must omit a restricted designation label the recipient may not see | no unrestricted missionary/project data                                          | `P17-KEY-DESIG-CORR@1`    |
| `contribution_payment_state_corrected_v1`  | `contribution.payment_state_corrected@1`; `{operation_id, payment_state_revision}`                                     | base + `contribution.previous_payment_state`, `contribution.current_payment_state`, `contribution.receipt_effect`, `contribution.statement_effect`; optional `correction.personal_note`                                   | `contribution.open_history@1`; protect old/new state, finality, and source-owned receipt/statement consequence; never infer settlement                                     | raw provider state/reason remains forbidden                                      | `P17-KEY-PAYSTATE-CORR@1` |
| `contribution_donor_relinked_v1`           | `contribution.donor_relinked@1`; `{operation_id, donor_link_revision, recipient_party_id, recipient_contact_revision}` | exactly `facts.donor_correction_base@1`; optional `correction.personal_note` only when the source privacy classifier permits it                                                                                           | `giving.open_support@1`; protect the statement that the record association changed and the support route; never name the previous/new Party or imply money changed         | no previous/current donor identity                                               | `P17-KEY-DONOR-RELINK@1`  |

Every row in this table also inherits
`forbid.external_sensitive@1`, `forbid.required_message_marketing@1`, and
`forbid.correction_internal@1`. Its `document_class`, surface, sender, reply,
locale, recovery, provider, retention, and audit values are exactly
`profile.donor_financial_correction@1`; no key may override them.
`P17-KEY-REFUND-FAIL@1` MUST include a fixture where the requested amount is
present but no provider-confirmed settled refund exists, and MUST prove the
render says **attempted** and **not received**, never refunded, settled, or
funds moved. Completed-refund proof packs MUST reject
`contribution.refund_attempted_amount` unless a future contract explicitly
allows it for a distinct meaning.

#### Contribution approval attention keys

`facts.approval_pending_base@1` is exactly
`recipient.safe_display_name`, `approval.request_reference`,
`approval.action_label`, `approval.status` constrained to `pending`, and
`approval.requested_at`. No optional facts are allowed.

| Stable key                           | Exact source/fence and recipient resolver                                                                                                      | Required facts                                                                                                                                              | Protected action/core                                                                                                                                              | Proof pack          |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| `contribution_approval_requested_v1` | `contribution.approval_requested@1`; `{request_id, state_revision, notification_sequence}`; `contribution.active_eligible_approver@1`          | exactly `facts.approval_pending_base@1`                                                                                                                     | `approval.open_request@1`; protect **Approval needed**, exact action label, source reference, pending state, and source-owned action                               | `P17-KEY-APR-REQ@1` |
| `contribution_approval_reminder_v1`  | `contribution.approval_reminder_due@1`; `{request_id, state_revision, reminder_sequence}`; `contribution.active_eligible_approver@1`           | pending base + `approval.pending_since`, `approval.reminder_sequence`                                                                                       | same action; protect **Still waiting for approval**, pending state, and producer-owned occurrence; no tenant timer                                                 | `P17-KEY-APR-REM@1` |
| `contribution_approval_escalated_v1` | `contribution.approval_escalated@1`; `{request_id, state_revision, escalation_revision}`; `contribution.active_eligible_escalation_approver@1` | pending base + `approval.pending_since`, `approval.escalated_at`                                                                                            | same action; protect **Escalated approval**, pending state, and source-owned escalation; no automatic approval or fabricated urgency                               | `P17-KEY-APR-ESC@1` |
| `contribution_approval_outcome_v1`   | `contribution.approval_decided@1`; `{request_id, state_revision, decision_revision}`; `contribution.active_requester@1`                        | exactly `recipient.safe_display_name`, `approval.request_reference`, `approval.action_label`, `approval.status`, `approval.decision`, `approval.decided_at` | `approval.open_request@1`; protect exact decision and time; no decision-reason body, donor detail, or implication that notification engagement changes the outcome | `P17-KEY-APR-OUT@1` |

All four use `profile.finance_approval_attention@1`, permit no optional facts,
and inherit `forbid.external_sensitive@1` plus
`forbid.staff_financial_detail@1`. The optional email slot receives the same
minimal fact envelope as the in-product slot; it cannot become a richer leak.

#### Phase 17 governance and repair attention keys

| Stable key                                        | Shared profile                               | Exact source/fence and recipient resolver                                                                                                                                                         | Required facts                                                                                                                                                                                                                                               | Protected action/core                                                                                                                                                                                              | Forbidden sets                                                | Proof pack                |
| ------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- | ------------------------- |
| `system_message_publication_review_requested_v1`  | `profile.publication_governance_attention@1` | `system_messages.protected_candidate_committed@1`; `{candidate_id, candidate_revision, review_request_id}`; `phase12.active_publication_reviewer@1`, excluding every substantive candidate editor | `recipient.safe_display_name`, `publication.candidate_reference`, `publication.message_safe_title`, `publication.scope_label`, `publication.locale_label`, `publication.author_safe_label`, `publication.committed_at`, `publication.protected_change_codes` | `publication.open_candidate_review@1`; protect **Review requested**, exact immutable candidate/scope/locale and independent-review action; no email click or notification engagement can approve                   | `forbid.external_sensitive@1`, `forbid.publication_content@1` | `P17-KEY-PUB-REVIEW@1`    |
| `system_message_publication_changes_requested_v1` | `profile.publication_governance_attention@1` | `system_messages.publication_changes_requested@1`; `{candidate_id, candidate_revision, review_decision_id}`; `publication.active_candidate_editors@1`                                             | `recipient.safe_display_name`, `publication.candidate_reference`, `publication.message_safe_title`, `publication.scope_label`, `publication.locale_label`, `publication.review_comment_count`, `publication.review_decided_at`                               | `publication.open_candidate@1`; protect **Changes requested**, exact candidate and review metadata; review comment body remains on the authorized source surface                                                   | same                                                          | `P17-KEY-PUB-CHANGES@1`   |
| `system_message_delivery_needs_attention_v1`      | `profile.delivery_repair_attention@1`        | `system_messages.repair_case_meaningful_transition@1`; `{repair_case_id, state_revision, transition_code}`; `phase12.active_email_repair_operator@1`; group by deterministic repair signature     | `recipient.safe_display_name`, `repair.case_reference`, `repair.cause_code`, `repair.severity`, `repair.owner_label`, `repair.affected_count`, `repair.first_seen_at`, `repair.last_changed_at`, `repair.next_action_label`                                  | `repair.open_case@1`; protect exact known cause, affected count, owner, and next safe action; never claim whether a donor was charged, contacted, retried, or made aware, and never expose affected people/content | `forbid.external_sensitive@1`, `forbid.repair_content@1`      | `P17-KEY-DELIVERY-ATTN@1` |

#### Exact Target Live in-product presentation mapping

| Stable key                                        | Presentation policy                                | `presentation_end_rule_by_step.staff_in_product` | Key-specific note                                                           |
| ------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------- |
| `contribution_approval_requested_v1`              | `presentation.source_actionable_then_recent_90d@1` | `presentation_end.approval_pending_current@1`    | exact request occurrence                                                    |
| `contribution_approval_reminder_v1`               | `presentation.source_actionable_then_recent_90d@1` | `presentation_end.approval_pending_current@1`    | new child may reopen unread; never extends or mutates an older item         |
| `contribution_approval_escalated_v1`              | `presentation.source_actionable_then_recent_90d@1` | `presentation_end.approval_pending_current@1`    | generated escalation resolver proves the exact current escalation recipient |
| `contribution_approval_outcome_v1`                | `presentation.information_30d_then_recent_90d@1`   | `presentation_end.approval_outcome_current@1`    | correction/supersession ends unread early without rewriting evidence        |
| `system_message_publication_review_requested_v1`  | `presentation.source_actionable_then_recent_90d@1` | `presentation_end.publication_review_current@1`  | exact immutable candidate and reviewer authority                            |
| `system_message_publication_changes_requested_v1` | `presentation.source_actionable_then_recent_90d@1` | `presentation_end.publication_changes_current@1` | exact current editable candidate and editor authority                       |
| `system_message_delivery_needs_attention_v1`      | `presentation.source_actionable_then_recent_90d@1` | `presentation_end.repair_case_open_current@1`    | later meaningful transition creates a new item and may reopen the group     |

`recurring_occurrence_missed_v1` remains Reserved in this generation and is not
silently activated or assigned by this table. Any future Reserved→Live
in-product key must add its exact policy and source-end rule in the same manifest
generation.

### Reserved catalog stubs — structurally non-executable

The compiler MUST emit one closed negative stub for every planning key below so
the 20 Reserved keys are named, counted, and rejectable without accidentally
granting them runtime capability. Each generated stub contains exactly
`{key, lifecycle: "Reserved", scope_kind: "tenant", source_owner,
blocker_codes, executable: false}`. It contains no profile, fact adapter,
recipient resolver, Delivery Plan, trigger binding, publication slot, editor,
preview, readiness control, intent route, provider route, or inherited Target
Live default. In particular, a Reserved key does not inherit a shared profile
merely because a future Live key may use one.

| Stable key                              | `source_owner` | `blocker_codes`                                                                              |
| --------------------------------------- | -------------- | -------------------------------------------------------------------------------------------- |
| `statement_current_updated_v1`          | `phase_19`     | `source_and_exposure_proof`, `exact_current_artifact`, `recipient_and_safety_contract`       |
| `recurring_recovery_started_v1`         | `phase_16`     | `source_fact_contract`, `recipient_contract`, `consent_contract`, `occurrence_contract`      |
| `recurring_action_required_v1`          | `phase_16`     | `producer_owned_action`, `safe_failure_reason`, `recovery_state_contract`                    |
| `recurring_occurrence_missed_v1`        | `phase_16`     | `role_safe_delivery_plan`, `no_debt_or_backcharge_claim`, `meaningful_state_change_contract` |
| `recurring_payment_truth_corrected_v1`  | `phase_16_7`   | `provider_confirmed_correction`, `artifact_consequence_contract`                             |
| `recurring_ach_initiated_v1`            | `phase_16`     | `processing_truth_contract`, `receipt_finality_contract`                                     |
| `recurring_upcoming_charge_v1`          | `phase_16`     | `notice_obligation_contract`, `amount_date_action_facts`                                     |
| `recurring_schedule_changed_v1`         | `phase_16`     | `effective_date_contract`, `in_flight_behavior`, `provider_sync_truth`                       |
| `fixed_pledge_upcoming_v1`              | `phase_16`     | `enrollment_contract`, `no_debt_or_cash_claim`                                               |
| `fixed_pledge_source_aware_followup_v1` | `phase_16`     | `matching_uncertainty_contract`, `stop_purpose_action`                                       |
| `identity_account_claim_invitation_v1`  | `phase_4`      | `fresh_invitation_authority`, `protected_handoff`, `expiry_and_revocation`                   |
| `identity_magic_link_v1`                | `identity`     | `signed_send_hook`, `tenant_recipient_action_mapping`, `hook_deadline_proof`                 |
| `identity_email_otp_v1`                 | `identity`     | `adopted_auth_flow`, `secret_exclusion`, `producer_rate_and_expiry`                          |
| `identity_password_recovery_v1`         | `identity`     | `scanner_safe_landing`, `fresh_proof`, `terminal_state_contract`                             |
| `identity_email_change_v1`              | `identity`     | `recipient_cardinality`, `token_hash_mapping`                                                |
| `document_artifact_ready_v1`            | `phase_18`     | `artifact_recipient_authority`, `protected_download_action`                                  |
| `statement_current_available_v1`        | `phase_19`     | `frozen_delivery_occurrence`, `exact_current_artifact`, `recipient_and_delivery_contract`    |
| `statement_current_withdrawn_v1`        | `phase_19`     | `source_owned_withdrawal`, `purpose_and_jurisdiction_admission`, `safe_help_contract`        |
| `statement_additional_copy_ready_v1`    | `phase_19`     | `fresh_copy_occurrence`, `exact_current_authority`, `no_lifecycle_replay`                    |
| `statement_delivery_attention_v1`       | `phase_19`     | `grouped_actionable_cause`, `staff_owner_contract`, `no_donor_failure_notice`                |

Reserved→Live is a manifest-generation change, not an in-place switch. The new
generation MUST replace the stub with one fully expanded contract, exact
producer and source fence, complete binding, migration disposition, and passing
key-specific proof pack. Until then, lookup may report **Coming later** from the
stub, but every execution entry point rejects it before durable intent creation.

### Trigger-binding registry

The catalog key defines meaning; a separate code-owned trigger-binding registry
defines how one authoritative producer occurrence becomes named Phase 6 steps.
It replaces the trigger authority implicit in
`email_template_system_bindings`. Tenants cannot add events, recipient
resolvers, conditions, timing, or channels. A tenant binding may select an
eligible complete publication for an already-defined slot, but it cannot create
or activate a product trigger.

Each compiled binding contains:

| Field                                     | Constraint                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `manifest_generation`                     | exact compatible activation generation                                                                                                                                                                                                                                                                              |
| `binding_id` / `binding_version`          | immutable code-owned identity; material change versions the binding and may require a successor key                                                                                                                                                                                                                 |
| `contract_key`                            | exact catalog key; only `Live` in the same generation can accept intent                                                                                                                                                                                                                                             |
| `producer_event_key`                      | one versioned producer-owned occurrence; unknown versions reject                                                                                                                                                                                                                                                    |
| `producer_owner`                          | accountable module/domain                                                                                                                                                                                                                                                                                           |
| `stable_producer_namespace_id`            | durable registry namespace used for occurrence-slot derivation; never a deployment or mutable implementation version                                                                                                                                                                                                |
| `source_fence_schema`                     | exact source id/epoch/revision tuple required for semantic idempotency and current applicability                                                                                                                                                                                                                    |
| `delivery_plan_contract_id/version`       | immutable bounded-plan contract that owns the legal step set; runtime resolution pins one exact effective tenant or platform plan id/version                                                                                                                                                                        |
| `plan_occurrence_token_schema_id/version` | exact `plan_occurrence_token@1`: canonical opaque 1–128-byte UTF-8, PII/secret-free and unique for one occurrence in the stable producer namespace; producer retains raw bytes for replay while Phase 6 persists only schema/version plus derived hash; separate from every member token and valid for zero members |
| `max_recipient_count_per_occurrence`      | finite code-owned upper bound applied before persistence; tenant settings cannot raise it and one logical occurrence is never chunked                                                                                                                                                                               |
| `step_key` / `step_ordinal`               | stable named Delivery Plan step and deterministic order                                                                                                                                                                                                                                                             |
| `channel` / `publication_slot`            | exactly `email` or `in_product` for Target Live; selects a complete channel-specific publication                                                                                                                                                                                                                    |
| `requiredness`                            | required or optional under one closed plan rule; no caller boolean                                                                                                                                                                                                                                                  |
| `condition_id`                            | one finite code-owned condition such as current recipient preference; no expression or rules language                                                                                                                                                                                                               |
| `recipient_role`                          | closed role named by the contract                                                                                                                                                                                                                                                                                   |
| `recipient_resolver_id/version`           | server-owned resolver returning exact authorized Party+role/contact revisions plus only its declared resolver-owned fact projection; never addresses or queries from content                                                                                                                                        |
| `earliest/expiry_source`                  | fixed immediate behavior or named producer-owned dates; Phase 17 does not invent business timing                                                                                                                                                                                                                    |
| `fact_adapter_id/version`                 | exact adapter that produces only the key's closed producer-owned fact projection; the validated union with the resolver projection forms the complete DTO                                                                                                                                                           |
| `action_issuer_id/version`                | exact producer action issuer or `none`                                                                                                                                                                                                                                                                              |
| `decision_clause_ids`                     | D1/D5/D6/D7/D8/D16 clauses governing the binding                                                                                                                                                                                                                                                                    |
| `proof_test_ids`                          | stable tests for producer occurrence, resolver/cardinality, facts, action, channel, idempotency, migration, and zero-side-effect rejection                                                                                                                                                                          |

The Target Live bindings are:

| Contract family/key                                           | Producer event → named step → channel/publication slot                                                                   | Requiredness / recipient resolver                                                                                                                                 |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `giving_receipt_issued_v1`                                    | `phase7.receipt.issued@1` + `phase18.document.current_ready@1` → `recipient_email` → `email/service`                     | required only after both Phase 7 eligibility/issuance and exact Phase 18 artifact readiness; `phase7.legal_donor_delivery_contact@1`                              |
| `giving_receipt_replaced_v1`                                  | `phase7.receipt.replacement_issued@1` + exact Phase 18 successor artifact → `recipient_email` → `email/service`          | required only after current successor proof; same recipient resolver                                                                                              |
| `contribution_receipt_corrected_v1`                           | `contribution.receipt_correction_effect@1` + exact Phase 18 successor artifact → `recipient_email` → `email/service`     | source-required/audited suppression; `phase7.legal_donor_delivery_contact@1`                                                                                      |
| every other Target Live `contribution_*` donor correction key | its exact `contribution.<meaning>@1` row above → `recipient_email` → `email/service`                                     | source-required/audited suppression; same resolver                                                                                                                |
| `contribution_approval_requested_v1`                          | `contribution.approval_requested@1` → `staff_in_product` → `in_product/compact`; sibling `staff_email` → `email/service` | in-product required; email optional only when tenant and recipient preference are enabled; `contribution.active_eligible_approver@1`                              |
| `contribution_approval_reminder_v1`                           | `contribution.approval_reminder_due@1` → the same two slots                                                              | same, using exact reminder occurrence/resolver                                                                                                                    |
| `contribution_approval_escalated_v1`                          | `contribution.approval_escalated@1` → the same two slots                                                                 | same, using `contribution.active_eligible_escalation_approver@1`                                                                                                  |
| `contribution_approval_outcome_v1`                            | `contribution.approval_decided@1` → the same two slots                                                                   | in-product required; email optional; `contribution.active_requester@1`                                                                                            |
| `system_message_publication_review_requested_v1`              | `system_messages.protected_candidate_committed@1` → `staff_in_product` → `in_product/compact`                            | required; `phase12.active_publication_reviewer@1`, with editor/reviewer separation                                                                                |
| `system_message_publication_changes_requested_v1`             | `system_messages.publication_changes_requested@1` → `staff_in_product` → `in_product/compact`                            | required; `publication.active_candidate_editors@1`                                                                                                                |
| `system_message_delivery_needs_attention_v1`                  | `system_messages.repair_case_meaningful_transition@1` → `staff_in_product` → `in_product/compact`                        | required only for a code-owned meaningful transition; `phase12.active_email_repair_operator@1`; Attention Group suppresses duplicate noise but not source history |

Every Target Live binding uses `plan_occurrence_token@1`. The generated server
resolver creates one top-level scope/event/contract/effective-plan context even
when the complete candidate list is empty. Product producers make one compiler
call per occurrence and never submit independently committed children. The
private compiler transaction gives each resolved member its own token and
recipient-specific intent. Donor/exact-person resolvers declare
`max_recipient_count_per_occurrence = 1`. Staff-role resolvers declare the
code-owned `bounded_staff_role_fanout@1` ceiling of 50 and fail the whole
occurrence with a repair-visible boundedness reason rather than silently
truncating recipients. The plan compiler's initial global member ceiling is 200;
this is an execution-safety limit, not the Resend batch limit. M0 load evidence
must confirm or lower these exact values before any key becomes Live; raising
them requires measured load/concurrency proof and a manifest generation change.

For every row, the generated registry expands the family shorthand into an
individual binding. CI fails if one Target Live key lacks an exact row, if two
rows claim the same producer occurrence/step incompatibly, or if a current
producer can create intent outside a generated binding.

The runtime resolver reloads the append-only binding projection, resolves the
exact effective tenant or platform Delivery Plan id/version permitted by its
declared plan contract, and seals both identities into the intent transaction.
Producers cannot supply or override contract, generation, event, plan, step,
channel, publication slot, recipient role/resolver, fact adapter, action issuer,
or publication identity. Denormalized copies never outrank the projection.

### Trigger-binding target data model

Add the following generated/read-only records. The TypeScript registry remains
the authority:

| Record                                        | Required fields and constraints                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `system_message_catalog_generations`          | generation id/hash, build/source revision, created/reviewed/activated/retired facts, N/N-1 compatibility, manifest artifact digest, census source digest, obligation/exclusion artifact digest, traceability digest, release-pack allocation/subject-coverage digests, activation CAS; immutable                                                                                                                                                                                                                                                                                           |
| `system_message_catalog_projection`           | generation, contract key, semantic version, explicit `scope_kind`, lifecycle, owner, purpose, channels and proof status; generated immutable read projection, no tenant write                                                                                                                                                                                                                                                                                                                                                                                                              |
| `system_message_trigger_binding_projections`  | immutable projection id; generation, binding id/version, contract key, explicit `scope_kind`, producer event key/version/owner and stable namespace, source-fence schema id, delivery-plan contract id/version, plan-occurrence token schema id/version, finite maximum recipients per occurrence, step/ordinal, channel/publication slot, requiredness/condition id, recipient role/resolver version, timing source, fact adapter, action issuer, decision/test ids; append-only unique `(generation, binding id, binding version)`, generated immutable read projection, no tenant write |
| `system_message_catalog_contract_projections` | fully expanded flat contract fields including explicit `scope_kind`, exact shared profile ref, source hash and lifecycle for staff/support/readiness queries; generated immutable projection, not a second authoring source                                                                                                                                                                                                                                                                                                                                                                |

`email_template_system_bindings` is migrated into publication-assignment
evidence only. Once one-writer and history-read closure pass, it cannot select a
trigger, recipient, classification, requiredness, or channel.

### Asym-governed system-default publication namespace

The D3/D15 resolver may use a protected system default only when the expanded
contract explicitly permits it. System defaults MUST NOT be represented by a
fake tenant id or stored in tenant publication tables.

Add one separate Asym-only namespace:

| Record                                            | Required fields and constraints                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `system_message_system_default_publications`      | immutable id; contract key/generation; step key; channel/publication slot; canonical locale/direction; document class/fact-schema/profile versions; complete canonical structured document; deterministic HTML/text or compact in-product output; dependency pins/hashes; Asym publisher/reviewer evidence; quarantine/compatibility facts |
| `system_message_system_default_publication_heads` | exact `{contract key, compatible generation range, step key, channel slot, locale}` → immutable publication id; compare-and-swap revision, activation/quarantine facts; one current head per exact key; no tenant id                                                                                                                       |

Only the platform publication service may mutate a head or create a system
publication. Tenant/client roles have no write path and no direct table read;
the resolver service returns only the safe effective publication/trace allowed
to the current tenant capability. Every head change follows immutable commit,
applicable D11 independent review, impact simulation, N/N-1 compatibility, and
rollback evidence.

A system publication contains no tenant brand, recipient fact, credential,
sender, Reply-To, or live action token. At preparation it composes only with the
exact compatible tenant Brand Kit/Role Layout, the complete validated
nonoverlapping producer/resolver fact DTO, and producer-owned action descriptor,
then freezes all pins. Tenant and system content never field-merge.

Profile eligibility is exact:

- receipt, finance-approval, publication-governance, and repair profiles may use
  a compatible system default under their stated locale/recovery policy;
- donor financial correction contracts remain `fallback_prohibited` and cannot
  select this namespace; and
- an absent/incompatible/quarantined required system head is a release/readiness
  blocker, never an implicit hard-coded string.

### Dated completeness census and closure

The durable catalog package MUST include
`docs/prds/sitestacker-parity/phase-17-system-message-census-2026-07-19.md`.
That appendix promotes the cited producer research out of scratch space and is
hashed into every catalog generation. Its baseline is repository commit
`b14a8a369dfc495d293a1564a16b970329075fd4` plus the dated Phase 17 planning
package. It contains:

1. a mechanical runtime-producer census of direct `sendEmail`/Resend imports,
   receipt writers, contribution-correction writers, approval in-product/email
   writers, Supabase Auth-hook/config paths, scheduled/job/queue writers,
   template/binding readers, and communication-history writers;
2. a product-obligation census covering the 41 dated categories in this PRD,
   with source citation, owning phase, stable key or intentional deferral,
   blocker, migration disposition, and tenant-visibility classification;
3. the 38-key planning catalog: 18 Target Live candidates and 20 Reserved keys,
   with zero Retired keys at the fresh-build target; all keys start Reserved in
   runtime until proof-gated activation;
4. current migration evidence for receipt/replacement, every contribution
   correction variant, approval request/reminder/escalation/outcome, templates,
   versions, bindings, legacy queue/data, the orphan `refund_started` variant,
   provider evidence, and historical aliases;
5. explicit exclusions for template/connection tests, human support replies,
   newsletters/campaigns/journeys, missionary personal mail, and transport-dark
   SMS; and
6. canonical `phase17-obligation-exclusion-closure@1` with every contiguous
   unique `OBL-001`–`OBL-041` row's exact `{row_id, product_meaning,
source_owner_anchor, disposition, blocker_or_migration_rule,
tenant_visibility}` plus every ordered Explicit Exclusion as
   `{ordinal, canonical_text}`; and
7. machine-readable row ids, canonical artifact/source digests, and source
   hashes consumed by closure CI.

**Planning closure on 2026-07-19** means every source and obligation found in
that baseline has a cited disposition; it does not claim any key is built or
Live. M0 reruns the mechanical census on the implementation base revision. Each
activation and final Phase 17 release reruns it again. CI blocks when:

- a current in-scope producer or history writer lacks a census row;
- a current producer maps to an unknown, Reserved, or Retired key;
- a product obligation or explicit exclusion lacks a disposition/owner, or the
  canonical obligation/exclusion artifact disagrees with its census source;
- a Target Live key lacks an expanded contract, trigger binding, current source
  adapter, proof pack, or migration row;
- a binding lacks one plan-occurrence token schema or finite recipient limit,
  sibling bindings for one producer occurrence disagree on the schema, or the
  derived plan maximum exceeds the compiler ceiling;
- an in-product step lacks a known presentation policy or exact source-end rule,
  a non-in-product step is not explicit `not_applicable`, a key leaves a source
  terminal state unmapped, or the seven Target Live mappings above are missing;
- a direct provider/send import exists outside the approved Phase 6 executor
  without a census-governed nonproduction test/tooling entry carrying an
  accountable owner, mandatory review trigger, current expiry or explicit
  review reason, current-closure approval, and proof that it is unreachable
  from production bundles; or
- the census, manifest, generated projection, docs, and implementation source
  digests disagree.

The gate is an AST/import-and-registry closure check plus exact source tests, not
a fragile prose grep alone. New legitimate producers update the census and typed
registry in the same change.

### D1–D20 clause and test traceability

Promote the existing drafting matrix into the durable artifact
`docs/prds/sitestacker-parity/phase-17-decision-test-traceability-2026-07-19.md`.
Its clause ids (`G1`–`G10`, `D1-N1`, `D1-S1`, and the corresponding stable ids
through D20) are immutable. Every numbered release test and acceptance example
from the implementation's required checked-in register receives one stable id.
The cited source-record
line is authoring provenance, not an external authority dependency:

`P17-D<two-digit decision>-T<three-digit test>` and
`P17-D<two-digit decision>-E<three-digit example>`.

Before any `proved` state, implementation checks in
`packages/api/src/communications/contracts/phase17-release-pack-allocation.v1.ts`.
Its machine-readable `phase17-release-pack-allocation@1` fixture binds every
`T101+` range to its decision owner, exact endpoints, and stable
`P17-Dxx-SUBJnnn` atomic subject ids. Shorthand cells expand every underlying
numbered test into a distinct subject id. Every executable or named manual
artifact declares its matching decision and one or more covered subjects.
Closure validates exact case allocation, nonempty case-to-subject mapping, no
overlap, no duplicate/cross-owned/unknown subject, and aggregate exact subject
coverage. Fixture and coverage map use Unicode NFC, ordered arrays,
lexicographically ordered object keys, UTF-8 without BOM, and SHA-256 over exact
canonical JSON bytes; both digests enter release evidence.

The traceability row schema is:

| Field                   | Required value                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| `clause_id`             | exact durable decision-matrix id                                                                 |
| `decision_source`       | D-number, ratified date, and hashed source-record provenance line anchor                         |
| `prd_anchor`            | exact normative PRD heading/paragraph                                                            |
| `adr_anchor`            | applicable ADR and section, or `inapplicable — reason`                                           |
| `openspec_anchor`       | exact requirement and scenario, or `inapplicable — reason`                                       |
| `implementation_anchor` | target module/symbol/migration/registry entry; filled before implementation closure              |
| `test_ids`              | every stable automated/manual test and acceptance-example id that proves the clause              |
| `evidence_anchor`       | required, non-null status-discriminated evidence record defined below                            |
| `status`                | `specified`, `implemented`, `proved`, or `inapplicable-with-reason`; no percentage or soft state |

`evidence_anchor` is a closed discriminated union keyed by `status`; it is never
blank, null, or a generic artifact pointer:

- `specified` records the agreeing PRD, applicable ADR, OpenSpec, census,
  manifest, and traceability anchors and an explicit `pending implementation`
  posture, with no known contradiction.
- `implemented` records one code SHA, reviewed source anchors, any applicable
  migration or version, and focused tests. It makes no production-proof claim
  and does not require or imply a generation-bound proof artifact.
- `proved` records an immutable, generation-bound CI or named manual proof
  artifact containing the code SHA, environment, catalog generation, harness,
  result, evidence hash, and every applicable fixture, accessibility, security,
  provider, and stable-id proof result, with no open blocker.
- `inapplicable-with-reason` records the contract-accepted, code-owned reason;
  an empty, client-selected, or free-form waiver is invalid.

Closure validation MUST branch on `status`, require exactly that state's
evidence shape, and reject a missing field, a weaker evidence shape, or an
evidence record whose discriminator disagrees with the row. A shared minimum
must not collapse `implemented` into `proved` or allow evidence intended for one
state to authorize another.

Top-level ownership is fixed:

Every `ADR-0025` through `ADR-0032` identifier in this Phase 17 companion refers
exclusively to the canonical repository ADR files under `docs/adr/`; no
feature-local ADR namespace is eligible for these anchors.

| Decision | Primary PRD contract                                | ADR ownership | Primary OpenSpec requirement                                       | Test namespace |
| -------- | --------------------------------------------------- | ------------- | ------------------------------------------------------------------ | -------------- |
| D1       | executable profiles/fact/surface/retention envelope | none required | Message Contracts Bound Tenant Freedom                             | `P17-D01-*`    |
| D2       | whole-message inheritance/copy-on-customize         | none required | Complete Immutable Publications Resolve Deterministically          | `P17-D02-*`    |
| D3       | two resolvers and compatibility gates               | none required | Complete Immutable Publications Resolve Deterministically          | `P17-D03-*`    |
| D4       | canonical structured document/compiler              | ADR-0030      | One Structured Document Produces Accessible Email Artifacts        | `P17-D04-*`    |
| D5       | recipient identity, intent and transport batching   | none required | Preparation And Recovery Preserve One Recipient-specific Identity  | `P17-D05-*`    |
| D6       | producer-owned protected actions                    | ADR-0025      | Protected Actions Remain Producer-owned And Scanner-resistant      | `P17-D06-*`    |
| D7       | bounded Delivery Plans                              | ADR-0026      | Delivery Plans Are Bounded And Compile Through Channel-owned Seams | `P17-D07-*`    |
| D8       | one in-product presentation/engagement model        | ADR-0027      | In-product Notifications Are One Role-safe Attention Projection    | `P17-D08-*`    |
| D9       | transport-dark SMS evidence boundary                | ADR-0028      | SMS Governance Is Evidence-ready While Transport Is Unavailable    | `P17-D09-*`    |
| D10      | tenant-owned Resend connection                      | ADR-0029      | Every Tenant Uses Its Own Proved Resend Connection                 | `P17-D10-*`    |
| D11      | proportional independent publication review         | none required | Publication Review Is Proportional And Independent                 | `P17-D11-*`    |
| D12      | tenant-open locale activation/readiness             | none required | Locale Activation Requires Contract-scoped Readiness               | `P17-D12-*`    |
| D13      | Brand Kit, Role Layout and Saved Sections           | ADR-0030      | One Structured Document Produces Accessible Email Artifacts        | `P17-D13-*`    |
| D14      | body-free history and expiring Recent copy          | ADR-0031      | Communication History Is Durable Evidence Without A Body Archive   | `P17-D14-*`    |
| D15      | sealed preparation and whole-message recovery       | ADR-0032      | Preparation And Recovery Preserve One Recipient-specific Identity  | `P17-D15-*`    |
| D16      | census, executable catalog, bindings and activation | none required | One Code-governed System-message Catalog                           | `P17-D16-*`    |
| D17      | bounded reply purposes/destinations                 | ADR-0029      | Every Tenant Uses Its Own Proved Resend Connection                 | `P17-D17-*`    |
| D18      | editable-by-default minimum truth core              | ADR-0030      | Message Contracts Bound Tenant Freedom                             | `P17-D18-*`    |
| D19      | versioned package/import/export/transfer            | none required | System-message Portability Is Versioned And Destination-owned      | `P17-D19-*`    |
| D20      | default plus bounded Sender Profiles                | ADR-0029      | Every Tenant Uses Its Own Proved Resend Connection                 | `P17-D20-*`    |

Each expanded contract carries all applicable clause ids and proof test ids.
Shared profile tests may satisfy several keys, but each key still has one
key-specific producer/recipient/fact/action/step/end-to-end proof pack. CI fails
on an unreferenced decision clause, missing numbered test/example, proof id with
no executable/manual artifact, Live key with an unproved applicable id, or
implementation/test artifact that cites an unknown id. Moving a test file does
not change its stable id; weakening or deleting a ratified case requires an
explicit dated product-decision amendment.

### Additional release-blocking checks for this manifest

1. Expand every profile/key pair and snapshot-test the complete flat object;
   there are no `undefined`, inferred, or runtime-defaulted safety fields.
2. Compile all 18 Target Live candidates and 20 Reserved keys; Reserved entries
   generate no tenant publication, binding, preview, readiness, or send path.
3. Reject an unknown fact, a fact in any inherited forbidden set, a missing
   required/conditional fact, an unlisted optional fact, and a protected fact
   hidden/relabelled/contradicted by content/layout/responsive rules.
4. Prove each key's exact document class, recipient resolver, source fence,
   requiredness, step/channel, locale/fallback, sender, reply, retention/audit,
   prepared-artifact retention, recovery, surface/capability and provider policy
   after full expansion.
5. Prove every trigger event/version creates only its named step(s); unknown,
   Reserved, Retired, stale-generation, duplicate, and conflicting events create
   no intent or provider side effect.
6. Prove generated trigger projections and system-default heads cannot be
   written by tenant/client roles, attached across tenants, or selected via a
   fake tenant id.
7. Prove system-default selection only for an eligible profile and complete
   compatible slot/locale; donor correction no-fallback keys block instead.
8. Prove all 18 Target Live keys have exact key-specific proof packs and no two
   keys emit for the same semantic occurrence unless the manifest documents
   non-overlapping source predicates.
9. Prove the receipt-correction and receipt-replacement predicates are mutually
   exclusive for one semantic source identity, and generic/partial/full refund
   predicates are mutually exclusive.
10. Prove the dated census, `phase17-obligation-exclusion-closure@1`, expanded
    manifest, `phase17-release-pack-allocation@1` plus its subject-coverage map,
    generated projections, traceability matrix, OpenSpec and code source hashes
    close with zero unknown producer, obligation, exclusion, clause, test,
    subject or implementation artifact.
11. Prove `P17-RET-01` and `P17-RET-02`: class selection, minimum immutable
    deadline, earliest-member batch bound, immediate decrypt denial, bounded
    primary purge, backup/erasure state, permanent body-free residue and every
    submit/webhook/cancel/erasure/lease race without replay or restoration.
12. Prove the single shared `P17-SCOPE-01`: `scope_kind` is present in the
    required schema, all five profiles, all 18 expanded Target Live keys, and
    every generated projection; tenant/platform owner and recipient arcs,
    scope-aware FKs/keys, single-scope batches, service-only platform RLS,
    exact platform connection and authority revision, tenant backfill, and
    no-fake-tenant failures pass. The same artifact proves acceptance examples
    32 and 33 and the complete Eve ownership boundary: the current generation
    has zero Eve email keys; any future Eve email requires an exact Live
    platform-scoped key, the current Eve-owned platform-owner authority
    revision, and the service-only Asym Resend connection; Discord remains
    Eve-owned operational delivery outside Phase 17 System Messages and
    communication history. No second scope-proof authority is permitted.
13. Prove the strictest-applicable Recent-copy projection: restricted or
    high-risk creation and later reclassification force `Off`, deny active
    reveal immediately, enqueue priority purge, preserve only body-free
    purge/tombstone evidence, and make every restore path unable to recreate
    readable content.
14. Prove `plan_occurrence_token@1` encoding/bounds/non-PII and raw-token
    non-persistence; top-level authority with zero candidates; canonical ordering;
    finite recipient bounds; every pre-release crash point; released-parent claim
    visibility; closed new/replay/zero/conflict results; exact concurrent replay;
    changed-member conflict; same-scope parent/member FKs; and that
    limit-plus-one creates no header or child while no logical occurrence is
    chunked.

This is deliberately one typed registry, five shared profiles, a finite fact and
action vocabulary, one generated trigger projection, one protected system
publication namespace, and one traceability/census gate. It does not add a
rules engine, tenant trigger builder, second queue, generic workflow, provider
catalog, runtime profile inheritance, speculative key, or per-field permission
system.
