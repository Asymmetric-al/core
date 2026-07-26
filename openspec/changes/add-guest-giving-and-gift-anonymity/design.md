# Guest Giving, Gift Anonymity, And Offline Donor Identity

## Status And Authority

This design is the forward implementation contract for
`add-guest-giving-and-gift-anonymity`. It aligns the feature with the settled
phase ownership model:

1. Phase 4 resolves the tenant-scoped Party and owns optional account claiming.
2. Phase 13 accepts and freezes canonical contribution and legal-donor source
   truth.
3. Phase 7 derives and versions official receipt facts and the Statement
   Subject.
4. Phase 18 produces the canonical official artifact.
5. Phase 17 prepares governed message content.
6. Phase 6 resolves contact/consent, dispatches, and records communication
   history.

For staff-entered offline gifts, Phase 15 `gift_entry_batches` is the only
entry and commit gateway before step 2. Quick entry is a batch of one.

Phase 18 alone owns document definitions, immutable publications, Generation
Requests, exact canonical PDF artifacts, currentness, access, protected
handoff, and document records/disposal. Portal access and delivery MUST use the
stored exact artifact bytes and MUST NOT rerender a live contribution, Party
profile, or receipt snapshot.

This file supersedes its earlier draft wherever that draft described a flat
legacy gift row, mutable receipt fields, profile-based receipt rendering, or a
standalone offline write endpoint. Those descriptions were repository evidence,
not target architecture.

## 1. Decision

Asym will support:

- guest-first online giving with no account wall;
- optional, verified account claiming after an accepted gift;
- one known legal-donor Party for every accepted online contribution;
- per-gift anonymity toward missionary and public audiences;
- staff entry of known-donor and intentionally unknown offline gifts; and
- one governed facts-to-artifact-to-content-to-delivery pipeline.

The system will not support:

- a client-selected canonical Party;
- a login created merely because checkout collected an email;
- a fake or shared anonymous Party;
- an online contribution whose legal donor is absent;
- direct staff writes to Phase 13 outside Phase 15;
- a second receipt or communication state machine beside the owner phases; or
- identity redaction implemented only in presentation components.

## 2. Ownership Map

| Concern                                   | Owner                                            | This change may do                                             | This change must not do                                  |
| ----------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------- | -------------------------------------------------------- |
| Current person/organization identity      | Phase 4 Party services                           | Supply validated tenant-scoped resolution inputs               | Treat email as identity, reveal a match, or bind a login |
| Account access                            | Phase 4 claim service                            | Offer an optional post-gift claim invitation                   | Grant access without verified possession                 |
| Accepted gift and allocation truth        | Phase 13                                         | Invoke acceptance and persist source evidence/visibility facts | Create a parallel gift store or mutate posted history    |
| Staff offline intake                      | Phase 15                                         | Add known/unknown row modes and a one-row quick-entry UX       | Expose a separate offline money writer                   |
| Receipt eligibility and official identity | Phase 7                                          | Emit the source occurrence after posting                       | Store or infer an official outcome on the contribution   |
| Official PDF/document                     | Phase 18                                         | Request the exact artifact for an approved facts version       | Render from a live Party profile                         |
| Message body/template                     | Phase 17                                         | Request governed content using typed facts                     | Build feature-local receipt copy                         |
| Contact, consent, dispatch, history       | Phase 6                                          | Submit a pinned communication intent                           | Send directly through a provider SDK                     |
| Role-scoped donor display                 | Phase 3/10 projection boundary plus source facts | Supply per-gift visibility facts                               | Leak identity into a response and hide it later in React |

## 3. Deleted And Superseded Legacy Evidence

The repository contained or described a legacy `public.donations` row,
`donor_id`, receipt identity/status columns, a profile-based saga, and a
candidate `POST /api/contributions/offline` route. None is a forward contract.

Implementation MUST delete or leave dead those paths as appropriate to the
fresh-build cutover. It MUST NOT:

- extend or dual-write `public.donations`;
- introduce `receipt_status`, `receipt_name`, `receipt_email`, or
  `receipt_address` on Phase 13 records;
- create a system/anonymous donor to satisfy a non-null foreign key;
- retain `POST /api/contributions/offline` as a bypass around Phase 15; or
- treat a legacy API response, table, or test fixture as target authority.

Neutral lessons may be retained only when they do not preserve the old
architecture: validated field shapes, idempotency discipline, Stripe-hosted
credential collection, and plain-language error copy.

## 4. Domain Concepts

### 4.1 Guest

`guest` describes authentication state at checkout. It does not mean the legal
donor is unknown. Every accepted online contribution has a known,
tenant-scoped legal-donor Party.

### 4.2 Party

The Party is the current tenant-scoped identity anchor. A Party can exist
without a login. Checkout supplies identity evidence; only the Phase 4 service
may resolve or create the canonical Party.

### 4.3 Account claim

An account claim is a separate, optional, verified-possession operation. It
binds authenticated access to the Party only after the claimant proves control
of the approved contact point. Gift acceptance neither depends on nor implies
claim completion.

### 4.4 Legal donor

`legal_donor_party_id` is the accepted contribution's canonical Party
reference. Phase 13 also freezes the exact identity/contact source evidence
accepted for the gift. A later Party edit or same-person merge may improve
current CRM truth but cannot silently rewrite that evidence or an official
facts version.

### 4.5 Anonymous

Anonymity is a visibility preference, not absence of legal identity. It controls
what missionary and public audiences can see about one gift. It never hides
identity from authorized finance/admin users, the donor's own authorized view,
official-facts derivation, reconciliation, or audit.

### 4.6 Intentionally unknown offline

`unknown_offline` means staff possess valid gift evidence but no sufficient
legal-donor identity evidence. It is allowed only through Phase 15 and is the
only state in this feature where `legal_donor_party_id` may be null.

## 5. Online Guest Flow

### 5.1 User flow

1. Resolve tenant, site, locale, currency, Legal Entity, eligible designations,
   and Settlement Account Binding through their owner contracts.
2. Show the shortest complete checkout: gift allocation, donor/contact fields,
   the per-gift visibility choice, and Stripe-hosted payment collection.
3. Validate client input on the server. Amounts use integer minor units;
   allocation lines are positive, same-currency, and exactly conserve the
   payment-group gross amount.
4. Create or resume the provider operation using product and provider
   idempotency keys. The browser never decides success.
5. When the contribution reaches its defined acceptance boundary, call the
   Phase 4 tenant-scoped Party resolver with normalized identity/contact
   evidence. The client does not send a Party ID.
6. In the accepted contribution transaction, Phase 13 records the header,
   allocation lines/postings, legal-donor Party, exact source evidence,
   per-gift visibility choices, Legal Entity, Settlement Account Binding,
   currency, and correlation/idempotency identities.
7. Return a constant-shape result containing only the contribution reference
   and honest payment/contribution lifecycle state.
8. On the thank-you view, show the exact server state. Offer a quiet optional
   account-claim action after acceptance; do not add it as a checkout step.
9. Emit durable owner-domain occurrences for Phase 7 and other downstream
   consumers. No downstream failure rolls back accepted money.

### 5.2 Acceptance boundary

The acceptance boundary must be defined by the Phase 13/payment lifecycle
contract for the rail. Card success and delayed bank authorization are not the
same state. The service must be able to resume safely when:

- the provider operation exists but Party resolution has not completed;
- Party resolution completed but the Phase 13 transaction response was lost;
- Phase 13 committed but the client did not receive the response; or
- a delayed provider event arrives after the browser session ended.

Each durable effect uses a stable product idempotency identity. Recovery looks
up prior results before creating anything.

### 5.3 Required checkout inputs

Required inputs are purpose- and policy-derived:

- integer gross amount and ISO currency;
- one or more valid allocation lines that conserve the gross amount;
- tenant/site context resolved server-side, never trusted from display labels;
- donor name or organization name appropriate to the Party kind;
- purpose-eligible email when the selected rail or communication policy
  requires it;
- billing/address data only when required by payment, fraud, tax, or tenant
  policy;
- per-gift missionary/public visibility choices; and
- an idempotency key.

Phone, secondary address lines, marketing consent, and an account password are
not universal requirements. Marketing consent is purpose-separated and
unchecked by default. The tax/receipt purpose does not silently enroll anyone
in marketing.

### 5.4 Party resolution and non-enumeration

The Phase 4 resolver owns normalization, within-tenant matching, duplicate
handling, and safe create. The guest endpoint:

- never returns match confidence, match type, current Party data, claim state,
  or account existence;
- has constant response shape and equivalent user-facing copy for found and
  created outcomes;
- applies rate limiting and abuse controls without revealing which addresses
  are known;
- stores only the minimum source evidence needed for acceptance and official
  facts; and
- creates no Party for rejected or abandoned checkout.

Ambiguous identity evidence must not guess between Parties. The Phase 4
contract may create an unclaimed Party or route a tenant-safe exception while
preserving the accepted legal-donor source evidence. It may not attach a gift
to a merely similar Party.

### 5.5 Optional claiming

The thank-you page uses copy such as:

> Your gift is recorded. Want easier access to your history next time? Email me
> a secure link.

Claiming is:

- optional and never blocks the thank-you view;
- tenant-branded;
- magic-link/verified-possession first;
- expiring and single-use;
- rate-limited and enumeration-safe;
- audited separately from contribution acceptance; and
- retryable without duplicating the Party or gift.

A claim message goes through Phase 17 content and Phase 6 dispatch. Checkout
does not call an email provider directly.

### 5.6 Donor-facing states

The view may summarize independent folds, but must not collapse them into one
stored status:

- `Payment started` for an initiated delayed rail;
- `Payment received` only when provider finality supports it;
- `Gift recorded` only when Phase 13 acceptance supports it;
- `Receipt available` only when Phase 7 and Phase 18 support it; and
- `Email delivered` only when Phase 6 delivery evidence supports it.

Unknown or delayed states use calm, specific copy and a stable refresh/revisit
path. They never display a false success.

## 6. Staff Offline Flow

### 6.1 One entry doorway

Mission Control provides:

- **Quick entry** for one gift: a concise form backed by a one-row
  `gift_entry_batches` record; and
- **Batch entry** for multiple gifts: the full Phase 15 grid/review workflow.

Both invoke the same Phase 15 staging, validation, permission, review,
conservation, audit, deposit-reference, and atomic commit service. The quick
form hides internal batch vocabulary where it does not help staff; the durable
record remains a batch.

### 6.2 Known-donor row

The default mode is **Known donor**. Staff:

1. search the tenant-safe Party picker;
2. select an existing Party or use the Phase 4-backed create flow;
3. enter civil date, tender/method, amount, currency, Legal Entity,
   designation/allocation, deposit/batch evidence, and optional reference;
4. set the per-gift missionary/public visibility choice; and
5. validate and commit through Phase 15.

On commit, Phase 13 freezes the exact same-tenant
`legal_donor_party_id` and source identity/contact evidence. The Party picker
must respect role-scoped visibility and must not reveal restricted Parties
through result counts, timing, or error shape.

### 6.3 Unknown-donor row

Staff explicitly chooses **Donor is unknown**. The UI explains:

> Record this gift without inventing donor details. It will not qualify for an
> official receipt unless sufficient donor evidence is added through a
> correction later.

Required gift, allocation, dating, Legal Entity, currency, and deposit evidence
remain unchanged. Name, email, address, and Party are absent rather than filled
with placeholders. On commit:

- `donor_identity_status = unknown_offline`;
- `legal_donor_party_id = null`;
- no Party or contact point is created; and
- Phase 7 records the exact not-receiptable evaluation reason.

### 6.4 Draft changes and commit

Known/unknown mode may change while the row is a draft. Changing to known
requires a valid same-tenant Party and source evidence. Changing to unknown
clears draft identity input after a warning; it does not create a placeholder.

After commit, identity changes use the Phase 13/Contribution Operations
correction contract with capability, reason, before/after evidence, and audit.
The posted row is never reopened or edited in place.

### 6.5 Failure behavior

- Field validation identifies the row, field, reason, and correction without
  discarding valid draft work.
- A cross-tenant or restricted Party reference fails closed before commit.
- An atomic batch commit creates all applicable Phase 13 records or none.
- If the response is lost after commit, retry returns the prior result using
  batch/row idempotency identities.
- Downstream facts, artifact, content, or dispatch failures appear in their
  owner workspaces and never make the batch falsely appear unposted.
- No feature surface may fall back to a direct offline insert.

## 7. Canonical Data Contract

### 7.1 Phase 13 contribution header

The accepted header carries, at minimum, the owner-defined fields plus:

```text
donor_identity_status:
  known | unknown_offline

legal_donor_party_id:
  UUID, required for known, null only for unknown_offline

legal_donor_source_evidence:
  typed, schema-versioned immutable snapshot accepted for this contribution

anonymous_to_missionary:
  boolean per-gift fact

anonymous_to_public:
  boolean per-gift fact
```

The exact source-evidence struct is owned with the Phase 13/Phase 7 contract
and must be typed rather than an unrestricted bag. It can contain only approved
legal-donor identity/contact fields, Party kind, provenance, capture time, and
schema version. It must not contain payment credentials, care fields,
free-form notes, or unrelated CRM data.

Database invariants:

```text
known
  => legal_donor_party_id IS NOT NULL

unknown_offline
  => legal_donor_party_id IS NULL

online source
  => donor_identity_status = known

(tenant_id, legal_donor_party_id)
  => composite same-tenant Party reference
```

All tenant-scoped tables use the repository's composite-key, FORCE-RLS, and
Data API posture. Application checks supplement rather than replace structural
tenant isolation.

### 7.2 What the contribution header does not own

The header does not own:

- receipt eligibility, number, issue/cancel/replacement state, or Statement
  Subject — Phase 7;
- rendered document version, bytes, archival status, or artifact lifecycle —
  Phase 18;
- subject/body/layout selection or template binding — Phase 17; or
- recipient contact resolution, consent snapshot, provider result, delivery
  state, or communication history — Phase 6.

Operational staff views join these independently authoritative projections.
They must not recreate a convenience status column on the header.

### 7.3 Party-level preferences

A current Party preference may seed the checkbox for a new gift. Acceptance
copies the chosen value onto the contribution. Later preference changes apply
prospectively and do not rewrite earlier contributions.

### 7.4 Corrections

A donor-identity or visibility correction:

- never updates frozen source evidence in place;
- records an append-only source/cause-linked correction;
- requires the capability and reason defined by Contribution Operations;
- preserves prior and successor values;
- prompts Phase 7 to evaluate whether official facts require a successor; and
- never directly renders or sends.

## 8. Service Contracts

Names below describe public seams, not mandatory file placement.

### 8.1 Guest acceptance

```ts
type GuestContributionInput = {
  idempotencyKey: string;
  siteReference: string;
  legalEntityReference: string;
  currency: string;
  grossMinor: bigint;
  allocations: ReadonlyArray<{
    designationReference: string;
    amountMinor: bigint;
  }>;
  donor: {
    partyKind: "person" | "organization";
    displayName: string;
    email?: string;
    postalAddress?: StructuredPostalAddress;
  };
  visibility: {
    anonymousToMissionary: boolean;
    anonymousToPublic: boolean;
  };
  paymentMethodReference: string;
};

type GuestContributionResult = {
  contributionId: string;
  paymentLifecycle: "requires_action" | "processing" | "succeeded" | "failed";
  contributionLifecycle: "awaiting_payment" | "accepted" | "failed";
  nextAction?: SafeHostedPaymentAction;
};
```

Server responsibilities:

1. derive tenant/site/Legal Entity/Settlement Account Binding from trusted
   references;
2. validate money, currency, allocation, identity, and policy;
3. create/resume the Stripe operation idempotently;
4. at the acceptance boundary, invoke Phase 4 Party resolution;
5. atomically invoke Phase 13 acceptance with Party/source/visibility facts;
6. write an outbox/source occurrence for downstream owners; and
7. return a constant-shape result with no Party-resolution metadata.

The service accepts no canonical Party ID and returns none.

### 8.2 Account claim

```ts
requestClaimInvitation({
  tenantId,
  contributionId,
  purpose: "donor_portal_access",
});
```

The service resolves the allowable claim contact from Phase 4-controlled
evidence, applies rate/abuse controls, records a non-enumerating outcome, and
routes content and dispatch through Phases 17 and 6. The caller cannot supply a
different Party or arbitrary destination.

### 8.3 Offline staging and commit

```ts
type OfflineDonorIdentity =
  | {
      mode: "known";
      partyId: string;
    }
  | {
      mode: "unknown_offline";
    };

stageGiftEntryRow({
  batchId,
  rowRevision,
  donorIdentity,
  giftFacts,
  allocations,
  visibility,
  depositEvidence,
});

commitGiftEntryBatch({
  batchId,
  expectedRevision,
  idempotencyKey,
});
```

The staff UI may create a one-row batch automatically, but it calls these same
Phase 15 seams. The commit service resolves/re-proves the known Party,
validates the unknown mode, and writes Phase 13 through its official adapter.
There is no parallel offline route.

### 8.4 Role-scoped projection

```ts
projectContributionIdentity({
  effectiveAccess,
  contributionId,
  audience: "finance" | "admin" | "donor_self" | "missionary" | "public",
});
```

Projection is allow-list based and server-side. A redacted result is constructed
without restricted fields; it is not a full object with fields removed after
serialization.

## 9. Visibility Contract

| Audience                             | Known, visible gift                                            | Known, anonymous gift                                             | Unknown offline gift                                                     |
| ------------------------------------ | -------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Authorized finance/admin             | Legal-donor identity and source evidence allowed by capability | Same, plus visible anonymity indicator                            | Explicit "Unknown donor"; no invented identity                           |
| Donor viewing own authorized history | Own gift and selected visibility preference                    | Same                                                              | Not claimable until a governed identity correction establishes ownership |
| Missionary                           | Allowed donor display fields                                   | "Anonymous donor"; no stable donor/contact identifier             | "Anonymous donor" or tenant-approved unknown label with no identifier    |
| Public                               | Tenant-approved recognition display                            | Anonymous display                                                 | Anonymous display                                                        |
| Receipt facts                        | Phase 7 legal-donor Statement Subject                          | Same legal donor; audience anonymity does not alter receipt truth | Explicit not-receiptable reason until sufficient evidence exists         |

The same projection contract applies to:

- API responses and server-rendered payloads;
- exports and print/mail merge data;
- search and indexing documents;
- email/message variables;
- analytics and telemetry attributes;
- caches and background-job payloads;
- support/AI tools; and
- logs and error metadata.

Downstream consumers receive a safe projection or stable owner reference, not
raw Party data plus a request to remember redaction.

## 10. Official Facts, Documents, And Messages

### 10.1 Handoff chain

```text
Phase 13 accepted contribution/source correction
  -> Phase 7 official-facts evaluation and immutable version
  -> Phase 18 canonical artifact for that exact facts/template version
  -> Phase 17 governed message content and binding
  -> Phase 6 recipient/contact/consent resolution, dispatch, and history
```

Each arrow is a durable, idempotent handoff with correlation and owner-specific
state. No owner writes the next owner's truth preemptively.

### 10.2 Contact and identity separation

Phase 7 freezes the official legal-donor/Statement Subject facts. Phase 6
selects the current purpose-eligible destination at send time, subject to
consent, suppression, and destination-succession rules. A changed email does
not rewrite the artifact; a historical email in official source evidence is
not automatically the current send destination.

### 10.3 Failure isolation

- Phase 7 ineligible/blocked: no official artifact request; exact reason visible.
- Phase 18 render failure: money and facts stay correct; retry rendering.
- Phase 17 content failure: artifact stays correct; use contract-owned recovery.
- Phase 6 suppression/failure: no false delivery; retry or alternate governed
  channel under Phase 6 rules.
- Claim invitation failure: accepted gift and official receipt path continue
  independently.

## 11. Payment, Idempotency, And Concurrency

- Use Stripe-hosted collection; never submit raw credentials to Asym.
- Pin every provider call to the accepted Settlement Account Binding and mode.
- Use separate stable idempotency identities for provider creation, Phase 13
  acceptance, Phase 15 row commit, facts evaluation, artifact generation,
  content preparation, and dispatch.
- Verify webhook signatures and account/mode context before processing.
- Store provider observations before folding them into product state.
- Serialize competing acceptance/commit/correction operations at the owning
  aggregate and reject stale revisions.
- A retry must return or advance the same business operation, never create a
  second Party, charge, contribution, artifact, or message.
- Do not place raw identity/contact payloads in provider metadata. Use only
  opaque correlation identifiers permitted by the provider contract.

## 12. Security, Privacy, And Tenant Safety

### 12.1 Authorization

- Public checkout may create only the specific guest-gift intent.
- Party resolution and claim binding are server-only.
- Staff entry requires the Phase 15 entry capability.
- Post-acceptance identity/visibility corrections require the granular
  Contribution Operations capability and reason.
- Provider identifiers, raw source evidence, and full legal-donor identity are
  capability-scoped.
- UI hiding is never authorization.

### 12.2 Tenant isolation

Every Party, contribution, batch, Legal Entity, Settlement Account Binding,
allocation, correction, official fact, artifact, and communication reference
must prove the same tenant structurally and at the service boundary. Negative
tests attempt cross-tenant references for every composite relation.

### 12.3 Data minimization

- No Party before accepted contribution.
- No login before verified claim.
- No fake data for unknown gifts.
- No payment credentials in Asym.
- No hidden identity in redacted projections, job payloads, analytics, or logs.
- Source evidence uses typed fields and purpose-owned retention.
- Free-form staff notes are not legal-donor identity evidence.

### 12.4 Enumeration and abuse

Guest resolution and claim initiation use constant response shape, generic
copy, bounded timing variance, rate limits, replay protection, and
CAPTCHA/risk escalation when abuse thresholds require it. Logs may capture safe
correlation data but not disclose the match outcome to the client.

## 13. UX And Accessibility

### 13.1 Online checkout

- Keep guest giving the default; do not lead with "Create an account."
- Use one clear visibility checkbox/group near donor identity:
  "Hide my name from the missionary and public recognition." Explain that the
  organization still records the donor for receipts and administration.
- Do not use the legally ambiguous label "anonymous donation" without the
  audience explanation.
- Preserve entered non-sensitive fields through recoverable payment errors.
- Put delayed-rail timing and next steps in the result view.
- Offer claiming only after acceptance and as a secondary action.
- Meet WCAG 2.2 AA: programmatic labels, error association and summary,
  keyboard flow, visible focus, status announcements, 400% zoom/reflow, and
  adequate touch targets.

### 13.2 Staff quick entry

- Default to the known-donor picker.
- Place "Donor is unknown" beside the picker, not in an advanced settings
  drawer.
- Explain the consequence once, inline; do not make staff complete a legal
  wizard.
- Keep the common path to one form and one confirmation.
- Show "Recorded and posted", "Recorded — awaiting review", or an exact
  exception outcome from Phase 15 truth.
- Offer a link to the underlying batch/audit evidence for staff who need it,
  without forcing batch vocabulary on casual entry.

### 13.3 Batch entry

- Reuse Phase 15 grid, row inspector, accessible row-editor mode, issue rail,
  autosave/revision conflict, and atomic review/commit behavior.
- Identity mode is a typed row field with clear chips: `Known donor` or
  `Unknown donor`.
- Validation links directly to the row and field and preserves all other valid
  work.
- Finance can filter unknown-donor rows before commit and after posting.

### 13.4 Role-scoped display

- Missionary/public views display the tenant-approved anonymous label and no
  clickable identity affordance.
- Finance sees a visible "Hidden from missionary/public" indicator so support
  staff understand why views differ.
- Donor self-view confirms the selected privacy setting and provides the
  governed correction/help path where policy permits it.

## 14. Observability And Operations

Record metrics and structured, PII-minimized events for:

- guest attempts, accepted contributions, and abandonment before acceptance;
- Party found/created/ambiguous outcomes internally, never client-visible;
- duplicate prevention/idempotency replay;
- provider-to-Phase-13 handoff age and failures;
- Phase 15 known/unknown row counts and validation reasons;
- unknown-offline aging and later identity corrections;
- role-projection denial/redaction failures;
- separately labelled Phase 7 facts, Phase 18 artifact, Phase 17 governed
  content, and Phase 6 dispatch/history handoff backlog and age;
- claim invitation requested/suppressed/delivered/expired; and
- cross-tenant guard violations and forbidden legacy-writer attempts.

Alerts are exception-based. They identify the owning phase, correlation ID,
tenant, safe aggregate reference, age, and next action without logging donor
PII or provider secrets.

## 15. Performance And Scale

- Guest acceptance p95 budget excludes unavoidable provider challenge time and
  must not wait for document rendering or message delivery.
- Party lookup is tenant-scoped and indexed on the Phase 4 canonical normalized
  fields.
- Phase 15 uses its certified row/batch ceiling; quick entry does not add a
  second execution engine.
- Redaction happens in shared projections suitable for list/batch use; avoid
  per-row network calls and N+1 Party resolution.
- Downstream owner handoffs use durable outbox processing with bounded retry,
  dead-letter visibility, per-tenant fairness, and backpressure.

## 16. Fresh-Build Cutover

This product has no production legacy data to preserve. Build the canonical
model directly:

1. create/extend the Phase 4, 13, and 15 target contracts;
2. remove old migrations or forward plans that would create the retired
   flat-gift/receipt/offline-writer topology;
3. point checkout and all staff entry surfaces to the canonical services;
4. add structural tests that fail if a legacy writer or direct provider send
   reappears; and
5. seed only canonical development/test fixtures.

No compatibility view, dual-write, data copier, shadow writer, or runtime
fallback is required. Historical repository examples remain labelled
superseded and must not be copied into new code.

## 17. Acceptance Criteria

### 17.1 Online

- A donor completes a valid gift without signing in or creating a password.
- The client neither supplies nor receives a canonical Party identifier.
- Found versus created Party outcomes are indistinguishable to the client.
- Abandonment creates no Party or financial/official record.
- Accepted truth exists in Phase 13 with exact allocation, legal-donor source
  evidence, and per-gift visibility facts.
- Raw payment credentials never reach Asym.
- Browser return before finality shows an honest pending state.
- Claiming is optional, possession-gated, and failure-isolated.

### 17.2 Anonymity

- Missionary/public payloads contain no hidden Party/contact identifier.
- Authorized finance sees legal-donor truth and the visibility indicator.
- The donor's own authorized history shows the gift and selected setting.
- A correction requires capability/reason and appends complete audit evidence.
- Exports, search, analytics, messages, caches, and jobs use the same projection
  rule.

### 17.3 Offline

- One-gift quick entry commits through a one-row `gift_entry_batches` record.
- Multi-row entry uses the same Phase 15 validation and commit engine.
- A known row requires a same-tenant Party.
- An unknown row needs no placeholder identity and keeps the legal-donor Party
  null.
- No direct staff offline writer exists.
- Retry after a lost response cannot duplicate money or downstream effects.
- A later identity correction preserves the original unknown evidence.

### 17.4 Official documents and communication

- Phase 7 alone determines official facts and eligibility.
- Phase 18 alone creates the canonical artifact.
- Phase 17 alone prepares governed message content.
- Phase 6 alone resolves contact/consent, dispatches, and records delivery.
- Failures and retries in any one phase do not mutate another phase's truth.

## 18. Test Plan

### Unit

- money/allocation/currency validation;
- identity-state and Party-nullability invariants;
- constant-shape guest result mapping;
- visibility projection allow-lists for every audience;
- permission/reason policy;
- source-evidence schema validation and PII rejection;
- delayed-payment and composite display-state copy; and
- official-owner routing decisions.

### Integration

- Phase 4 resolve/create → Phase 13 acceptance transaction;
- idempotent retries at every crash boundary;
- cross-tenant Party, Legal Entity, binding, allocation, batch, and artifact
  rejection;
- one-row quick entry and multi-row atomic Phase 15 commit;
- unknown-offline Phase 7 evaluation and later correction;
- outbox handoffs across Phase 7 → 18 → 17 → 6;
- current-contact delivery with frozen official identity;
- provider webhook signature/account/mode checks; and
- forbidden direct offline/legacy/provider-send paths.

### End to end

- first-time guest card gift;
- returning guest with no account-existence signal;
- delayed bank payment;
- optional successful and failed claim invitation;
- anonymous-to-missionary gift with finance comparison;
- known-donor quick-entry check;
- unknown offering-box cash;
- batch validation recovery and lost-response retry;
- source correction that creates a successor official-facts version; and
- keyboard, screen-reader, zoom/reflow, error, and status-announcement coverage
  for donor checkout and both staff entry modes.

### Property and adversarial

- allocation conservation for generated line sets;
- repeated/reordered provider and outbox events never duplicate effects;
- every known contribution has one same-tenant legal-donor Party;
- every accepted online contribution is known;
- only intentional offline unknown may have no legal-donor Party;
- no redacted projection includes a stable donor/contact identifier;
- current Party edits never rewrite frozen source or official facts; and
- no execution path can create staff-entered offline money without a Phase 15
  batch and commit identity.

## 19. Implementation Order

1. Land the Phase 13 identity/visibility source contract and database
   invariants, consuming Phase 4 tenant-isolation rules.
2. Extend Phase 15 row types, validation, quick-entry adapter, and commit
   mapping for known/unknown identity.
3. Implement guest acceptance with Stripe-hosted collection and Phase 4 →
   Phase 13 orchestration.
4. Implement the shared role-scoped identity projection and migrate every
   consumer to it.
5. Add optional Phase 4 claim invitation through Phases 17 and 6.
6. Connect Phase 13 occurrences to Phase 7 → Phase 18 → Phase 17 → Phase 6.
7. Delete/reject retired writers and add structural CI gates.
8. Complete security, tenant-isolation, accessibility, performance, and
   recovery verification before enabling the feature.

## 20. Final Product Rule

Guest giving removes an account barrier; it does not remove legal-donor truth.
Gift anonymity controls audience visibility; it does not create an unknown
donor. Intentionally unknown offline gifts are recorded honestly without fake
identity. Online and offline acceptance converge on Phase 13, all staff entry
converges on Phase 15, and official output follows the single
Phase 7 → Phase 18 → Phase 17 → Phase 6 chain.
