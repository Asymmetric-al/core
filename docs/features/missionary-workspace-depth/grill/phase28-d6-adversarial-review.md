# Phase 28 D6 — native newsletter signup with missionary page control

**Disposition: Accept with required amendments.** Keep direct native signup and
give the appropriately authorized missionary one clear control over whether it
appears on the exact public ministry Page. Separate that choice from existing
subscriptions, permission to send, Page publication and protected-content access.

Reviewed October 16, 2026 (UTC), against
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`. This is a completed decision review
and research record, not a formal specification, implementation or release
qualification. The founder selected A and the missionary-control rider; the
additional amendments below are the review recommendation, not a subsequent
ratification. `/to-prd` and `/to-issues` remain separate explicit transitions.
No application, live permissions/data, provider, subscriber or GitHub state changed.

Later [D45](phase28-d45-seven-day-confirmation-decision.md) explicitly selects
seven elapsed days and narrowly supersedes the lifetime in C15/P19 below.
This does not adopt the separate 24-hour purge proposal or the surviving packet.

## Exact corrected decision to record

> **D6 — Direct native newsletter signup, deliberately offered by the missionary.**
> A visitor can join the named missionary newsletter from its qualified public
> ministry Page without donating, creating an account or waiting for the
> missionary to process a request. An appropriately authorized missionary
> chooses whether that exact Page offers signup through the existing Page
> experience. Show the choice, its actual public effect and any existing
> publication/readiness requirement clearly. Missionary status or appearing on
> a Page alone does not grant control or subscriber access.
>
> Use a short, accessible form with required Email, optional single Name,
> explicit newsletter purpose and one signup action. Keep it outside the giving
> transaction. A new admission, including a later re-subscription, requires
> fresh confirmation for that exact newsletter and address. Opening a link
> alone does not confirm; an explicit confirmation action completes the
> qualified admission. An already active identical subscription is unchanged
> and needs no repeated confirmation. Confirmation proves only the admitted
> mailbox/purpose evidence, not a person's identity, donor status or entitlement.
>
> Provide one control such as **Show newsletter signup on this page**, a brief
> explanation and an inert preview. Turning it off removes this entry and stops
> new signups through it. Existing subscribers remain subscribed. An already
> accepted, unexpired confirmation may finish while its newsletter purpose and
> recipient remain eligible. Closing the newsletter purpose or applying a
> relevant safety/consent restriction is a separate source action. Off neither
> unpublishes the Page nor stops all newsletters, deletes people, withdraws
> preferences or switches to an external request form.
>
> Off takes effect as a source-qualified narrowing; On follows the existing
> Page publication and current-readiness rules. A stale form or release cannot
> reverse a newer Off. Do not automatically enable the new native entry on
> existing Pages. Preserve existing external-newsletter request journeys where
> appropriate, with no reinterpretation of past requests as consent and no
> automatic fallback between the two purposes.
>
> P28 owns the native newsletter instruction and membership lifecycle through
> a bounded recipient source under P3's consent contract and wider restrictions.
> P6 consumes current source eligibility and owns send-time verdicts/snapshots,
> suppression evidence, intents and delivery, not a second subscriber master.
> P17 owns qualified content/preparation; P22/P23 own Page/public intake; P12 owns
> current authority. Reconcile the older P32-only subscription wording
> explicitly. Native work must not depend on optional external sync. Do not
> create a shadow CRM, provider-owned subscriber master or a broad missionary
> permission to browse/edit contacts.
>
> All acceptance, confirmation, withdrawal and visibility commands use trusted
> scope, current source authority, durable evidence and safe retry/concurrency
> behavior. Do not activate subscribers from an unproved public submission,
> clear stronger suppressions during re-subscription, leak subscriber existence
> or promise delivery from an accepted request. Visitor and missionary states
> must describe what actually happened and provide the permitted next action.

**Selected by the founder:** direct native signup, missionary choice over its
public placement, clear excellent UX for both audiences, deep Epistle/comparable
research and simplicity. **Required review amendments:** the exact boundaries
above and C01–C20 below. **Design judgment:** the recommended control/copy and
confirmation ceremony; these are not claims of user-tested preference or exact
existing UI. **Not selected:** automatic newsletter sends, digests, cadence
choices, physical-mail signup here, a general form builder, a verified-profile
shortcut, broader Page/CRM rights or a new approval inbox. The separately
requested native physical-newsletter workflow remains in Phase 28 scope.

## Evidence, present behavior and confidence

| Evidence                                                            | Verified finding and limit                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Page/control owners](d6-evidence/page-control-owners.md)           | P22/P23/P12 need a bounded native signup placement/control extension. Existing contributor assignment, publishing, derived settings, public safety and request semantics remain binding. Immediate Off is a proposed amendment, not an existing arbitrary missionary CMS power.                                                        |
| [Consent/delivery owners](d6-evidence/consent-delivery.md)          | Exact consent, proof, suppression, confirmation, withdrawal and delivery are separate. Native subscription needs explicit owner reconciliation; provider contact flags are insufficient. Current provider scope must be reconciled with older P17 wording.                                                                             |
| [Product/identity synthesis](d6-evidence/product-synthesis.md)      | A purpose-qualified no-Party recipient path has a P6 precedent but needs a native manifest/source extension. A newsletter subscriber need not become a donor, claimed person, prospect or broadly visible CRM record.                                                                                                                  |
| [Current runtime](d6-evidence/current-runtime.md)                   | Bounded source census found inert public Subscribe controls, a mobile-hidden mounted CTA, timer-only donor preference Save, no qualified native signup producer, differing CMS/operational Tenant identities and a negative-only consent gate. These are code facts and conditional reuse hazards, not demonstrated deployed exploits. |
| [UX and primary comparisons](d6-evidence/ux-research.md)            | Epistle, specialized ministry tools, newsletter/CMS/nonprofit products and accessibility sources inform the simple form/control. Marketing or dated help does not prove conversion, safety, confirmation semantics or representative missionary preference.                                                                            |
| [Technical research](d6-evidence/technical-research.md)             | Current Supabase/Postgres/RFC/OWASP guidance supports exact grants/RLS, source commands, bounded tokens, unsubscribe separation and durable recovery. Ten primary fetches are timestamped and hashed. No hosted Supabase proof is claimed.                                                                                             |
| [Disposable PostgreSQL probe](d6-evidence/postgres-probe/README.md) | PostgreSQL 17.11: **34/34 outcomes**, including **five observed two-session lock waits**. Tests bounded synthetic source ordering, scope, expiry, atomicity and replay. It does not test mailbox control, human intent, actual HTTP/abuse behavior, Core/P6, Supabase or delivery. Cleanup and artifact hashes were verified.          |
| [Original Q6 research](phase28-q6-newsletter-entry-research.md)     | Retains the strongest alternative: request-only public handoff plus separately qualified joining. Direct native signup removes a routine human handoff but requires a real consent/recipient producer.                                                                                                                                 |

**Evidence classification:** owner documents establish intended behavior; source
inspection establishes current code; primary documentation establishes published
vendor/standard behavior; the proposed lean shape is engineering/product
judgment. No real subscriber, donor or missionary was contacted. No authenticated
Epistle journey, conversion study, legal determination, accessibility conformance
or production performance result is claimed. Those limits do not justify
retaining an inert button or inventing consent.

The permanent path reuses sound patterns: one native source, exact Page
authority, source-owned form acceptance, derived settings, one communication
spine and the shared Base UI/base-maia design system. Prototype controls,
negative-only consent as enrollment, arbitrary CMS ID reuse and local success
timers are not patterns to preserve. Epistle's low-effort reader choices are
useful precedents; automatic digest delivery and every vendor's CRM admission
model are separate scope decisions.

## Concern register

Severity describes potential harm. Likelihood is conditional engineering
judgment, not a measured incident rate. Each concern's exact prevention is
carried into the referenced normative review clauses and proof scenarios.

### D6-R01 — A new label hides an unresolved subscription owner

**What/why:** changing Request newsletter to Sign up could still create only an
external handoff, or make native work depend on P32. A Page-local subscriber
table/provider audience would create competing consent truth. **Severity:
High. Likelihood: likely if the old route is reused unchanged. Evidence:** P25
EX11/EX16, P23 D26/ADR0170's older P32-only wording and the later native
independence amendment; page-control and product evidence. **Answer impact:**
retain A but require explicit coordinated owner changes. **Permanent fix:** one
P28 native relationship and exact P6/P17/P23 adapter; preserve the distinct
external request purpose. **Exact change:** C01/C04/C19; prove P01/P02/P22.

### D6-R02 — “My page” becomes broad CMS power or a dishonest switch

**What/why:** a missionary label, coauthor display or supplied Page ID could
change someone else's public entry. Saved On may not be live; a stale release
may silently undo Off. **Severity: High, Critical across tenants. Likelihood:
plausible; current authoring is staff-scoped, not this delegation. Evidence:**
P22 D1/D4/D5/D20/D23, P12 and the runtime census. **Answer impact:** narrows
control to the exact authorized Page and adds a usable positive path.
**Permanent fix:** source-owned control in existing Page editing, separate
desired/effective states, immediate qualified narrowing and publication-qualified
widening. **Exact change:** C02/C03/C10/C14; P03–P05/P18.

### D6-R03 — Hiding the form destroys consent or fails to stop new intake

**What/why:** Off could unsubscribe existing readers, strand valid confirmation,
leave old forms accepting indefinitely, select external Request as fallback or
act as a misleading global stop switch. **Severity: High. Likelihood: plausible
without distinct meanings. Evidence:** the selected visibility scope, P25's
prospective frozen request meaning and Page/source ownership. **Answer impact:**
defines Off precisely; it does not reject missionary control. **Permanent fix:**
entry generation, current acceptance fence, preserved accepted pending work,
independent purpose closure/suppression and explicit helper text. **Exact
change:** C02/C03/C07/C12; P05/P06/P13.

### D6-R04 — Public signup creates identity, consent or access it cannot prove

**What/why:** an attacker can enter another person's address; email matching
could overwrite CRM Name/contact details, create a donor, subscribe a household,
grant protected updates or populate a missionary's wider CRM. **Severity:
High–Critical. Likelihood: high if existing donor/follower or consent-helper
paths are repurposed. Evidence:** P4/P9/P12 boundaries; P6 no-Party precedent;
runtime negative-gate success and donor matching. **Answer impact:** narrows A to
an exact newsletter relationship. **Permanent fix:** fresh exact-purpose
confirmation, narrow recipient authority, no identity/Party write by email
equality and no inferred D1/D2/D5 rights. **Exact change:** C04–C06/C09/C13;
P07/P08/P11/P16.

### D6-R05 — Tokens and confirmation mail become an abuse or disclosure route

**What/why:** unbounded resend bombs inboxes; different results expose existing
subscribers or suppressions; GET-prefetch confirms without intent; leaked links
authorize another scope. **Severity: High. Likelihood: plausible for any public
email form without controls. Evidence:** OWASP, RFC 8058, current subscription
guidance and the missing producer. **Answer impact:** adds a bounded confirmation
ceremony, not a permanent CAPTCHA or new login. **Permanent fix:** minimal
scope-bound expiring capabilities, explicit confirm action, no GET effects,
durable deduplication, layered abuse limits and neutral destination-specific
responses. **Exact change:** C05/C06/C08/C15; P08–P10/P14.

### D6-R06 — Row security is mistaken for complete authorization

**What/why:** a privileged public handler can accept a forged Tenant/Page;
CMS IDs can be mistaken for operational Tenant UUIDs; a permitted update can
alter scope/actor/confirmed status; views/RPCs or direct API grants can expose
recipients. **Severity: Critical. Likelihood: plausible; the namespace mismatch
is concrete source evidence, not a proved exploit. Evidence:** runtime census,
Supabase/Postgres primary docs and P12. **Answer impact:** requires the existing
server boundary, not a new security system. **Permanent fix:** trusted mapping,
tenant-aware relationships, constrained commands and effective-role tests for
both old and proposed rows across every reachable path. **Exact change:**
C09/C10/C11; P03/P11/P12.

### D6-R07 — Newer intent loses to a retry, delayed event or Boolean reset

**What/why:** an old confirmation reactivates after withdrawal; duplicate clicks
send repeated mail; an old unsubscribe worker undoes a fresh re-subscription;
Off→On or closed→open revives stale pending work. **Severity: High. Likelihood:
plausible under normal retries/concurrency. Evidence:** source lifecycle rules,
Postgres transaction semantics and the distinct Page versus purpose meanings.
**Answer impact:** requires source generations and exact ordering. **Permanent
fix:** one durable effect identity, current relevant heads and atomic commands;
separate new human withdrawal from replay of an accepted operation. **Exact
change:** C06/C07/C11/C12; P09/P13–P15.

### D6-R08 — A partial failure produces false subscription or email claims

**What/why:** source state commits without audit/confirmation intent, mail is
submitted but response lost, or an unavailable provider triggers fresh sends.
The user sees success from a timer or a queue acknowledgment. **Severity: High.
Likelihood: concrete implementation precedent; prospective signup risk.
Evidence:** timer-only preferences, P6 durable intents and provider uncertainty.
**Answer impact:** changes acceptance/recovery, not the short ordinary journey.
**Permanent fix:** atomic source/evidence/required intent, separate delivery
status, bounded reconciliation and current readback. **Exact change:**
C11/C12/C14/C16; P10/P14/P15/P20.

### D6-R09 — A simple flow becomes confusing, inaccessible or harms giving

**What/why:** a popup, account gate, mandatory split Name, prechecked giving
opt-in, mobile-hidden CTA, cryptic pending state or fake disabled switch loses
trust. “Updates” may mean a different protected reading/email product.
**Severity: Medium–High. Likelihood: plausible; mobile exclusion is concrete
current code. Evidence:** UX research, P25 distinct preferences and current
surface trace. **Answer impact:** retains the selected capability while
constraining its form and explanation. **Permanent fix:** inline optional
newsletter panel, exact purpose, one existing Page control, accessible status
and recoverable short forms. **Exact change:** C04/C14/C17; P01/P17/P18/P23.

### D6-R10 — Private signup or restricted-worker data leaks through derivatives

**What/why:** recipient values enter shared HTML/RSC/CDN, URLs, telemetry,
exports or previews; email subjects/aliases expose a restricted person; old
drafts survive permission loss. **Severity: Critical for sensitive contexts.
Likelihood: plausible; no current cached-email leak was demonstrated.
Evidence:** P3/P10/P22/P25 public/private separation and the existing cached
public shell. **Answer impact:** limits eligible public newsletters and all
derivatives. **Permanent fix:** public-safe identity, no-store private interaction,
purpose-scoped read access and source retention across caches/logs/backups.
**Exact change:** C04/C06/C10/C15/C17; P12/P16/P19/P23.

### D6-R11 — Provider behavior contradicts Core's suppression assumptions

**What/why:** Resend Contact unsubscribe may not stop API mail; team-wide
suppression may span domains/tenants while older P17 text assumes region scope;
webhooks can be duplicated, missing or out of order. **Severity: High.
Likelihood: concrete documentation conflict if ignored. Evidence:** fresh
Resend suppression/contact docs in consent-delivery research. **Answer impact:**
requires a targeted owner amendment and deployment-scope proof. **Permanent
fix:** Core remains authoritative for exact consent; map actual provider
credential/suppression scope, preserve stronger gates, signature/identity
verification and reconciliation without false delivery claims. **Exact change:**
C01/C16/C19; P20/P21/P24.

### D6-R12 — Data quality and retention become a second CRM maintenance job

**What/why:** each attempt creates another person, untrusted names overwrite an
existing subscriber, shared mailboxes are merged, expired pending material
persists forever, or cleanup erases durable withdrawal/evidence. **Severity:
High. Likelihood: plausible without bounded identity/lifecycle rules.
Evidence:** P4/P9/P6 source split and product synthesis. **Answer impact:**
defines minimum data and preservation obligations. **Permanent fix:** exact
purpose/destination uniqueness, optional independently proved Party binding,
finite source material classes and supported correction/withdrawal paths.
**Exact change:** C09/C13/C15; P07/P11/P16/P19.

### D6-R13 — Scale and operational diagnosis are left to guesswork

**What/why:** public spam floods confirmation work; unindexed policy joins or
full CRM scans degrade large tenants; unbounded pending lists leak or exhaust
memory; staff repair consent directly in SQL. **Severity: Medium–High.
Likelihood: plausible; no production volume or latency measured. Evidence:**
public attack surface, current lack of native source and Supabase query/grant
guidance. **Answer impact:** requires bounded operation and source-owned repair,
not a new orchestration platform. **Permanent fix:** measured request/query/queue
budgets, scoped indexes, purpose-minimized diagnostics and bounded recovery.
**Exact change:** C08/C09/C18/C20; P20/P23/P24.

### D6-R14 — Migration or excess configuration undermines the whole capability

**What/why:** native signup is enabled from an old request flag; old handlers
remain writable; rollback restores withdrawn consent; live/public versions
disagree; a form-builder, cadence matrix or deny-only control adds complexity
without delivering the founder's job. **Severity: High. Likelihood: plausible;
the actual runtime is not the intended contract and local dependency versions
differ from manifests. Evidence:** source census, P22/P25 adoption and founder
simplicity requirement. **Answer impact:** requires explicit adoption and a
positive complete journey. **Permanent fix:** census, compatible source-first
rollout, fenced legacy writers, explicit Page enablement, one control and
outcome-based proof. **Exact change:** C02/C03/C14/C19/C20; P01/P02/P18/P22–P24.

## Every requested category evaluated

| #   | Category                                                      | Material concern and conclusion                                                                                                                                                                                                                                                                |
| --- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Problem validity, necessity, and alternatives                 | **Yes — R01/R09/R14.** The founder chose to remove a routine request handoff. Request-only is the strongest simpler alternative; it leaves that job incomplete. Do not bundle digest/cadence/form-builder scope or claim measured conversion gains.                                            |
| 2   | Brittleness                                                   | **Yes — R02/R03/R07/R11.** Publication, Page choice, proof, source readiness and provider scope change independently. One Boolean or assumed provider behavior is brittle.                                                                                                                     |
| 3   | Technical debt                                                | **Yes — R01/R06/R12/R14.** Avoid shadow subscriber/permission sources, raw CMS-ID reuse and copied prototype flows. Amend the exact owners and fence obsolete writers.                                                                                                                         |
| 4   | Edge cases                                                    | **Yes — R03–R08/R12.** Shared email, already subscribed, pending/re-subscription, typo, expired link, stale form, coauthor changes, withdrawal and source closure have explicit outcomes.                                                                                                      |
| 5   | Footguns                                                      | **Yes — R02–R06/R14.** Off cannot mean unsubscribe; preview cannot send; On cannot silently publish or grant access; confirmation cannot clear suppression or create a donor.                                                                                                                  |
| 6   | Tenant safety                                                 | **Yes — R02/R06/R10/R11.** Prove host/CMS/operational Tenant/subject/purpose mapping, composite relationships, caches and provider connection scope. Scope is never trusted from body IDs.                                                                                                     |
| 7   | Database, RLS, and authorization safety                       | **Yes — R04/R06/R07/R12.** Qualify grants, `USING`/`WITH CHECK`, constraints, old/new state, service-role/definer/view paths, trusted attribution and real-role negative access. No new money field is needed.                                                                                 |
| 8   | Overengineering                                               | **Yes — R01/R09/R14.** One fixed-purpose form and one Page control suffice. No new CRM, generic token platform, form builder, verification toggle, automatic digest or approval inbox.                                                                                                         |
| 9   | UX/UI and user friction                                       | **Yes — R02/R03/R08/R09.** Clear named newsletter, separate giving, phone access, optional international Name, truthful public/missionary status and meaningful recovery are required. Beauty is not established by source review.                                                             |
| 10  | Source of truth, ownership, and domain invariants             | **Yes — R01/R03/R04/R07/R12.** Separate Page entry, native relationship, consent/proof, contact identity and transport history. One current relationship per exact scope; immutable evidence and later admission generations remain distinct.                                                  |
| 11  | Hidden coupling                                               | **Yes — R01/R03/R04/R11.** Public placement must not control all sending; donor/follower/contact edits do not establish subscription; P32/provider contacts cannot become native authority.                                                                                                    |
| 12  | Failure modes                                                 | **Yes — R05/R08/R11/R13.** Durable acceptance, unknown outcome, confirmation failure, provider ambiguity and recovery must remain distinguishable and safe.                                                                                                                                    |
| 13  | Lifecycle, temporal correctness, concurrency, and idempotency | **Yes — R03/R07/R08.** Define intake Off versus purpose closure, exact expiry, withdrawal/re-subscription generations and stale/replayed effects; prove competing transactions.                                                                                                                |
| 14  | Data integrity risks                                          | **Yes — R04/R07/R12/R14.** Prevent duplicate active subscriptions, misbound identities, unrelated-field overwrites, stale reactivation and migration-created consent.                                                                                                                          |
| 15  | Security and privacy risks                                    | **Yes — R04–R06/R10/R12.** Token abuse, public enumeration, restricted aliases, subscriber metadata, exports/logs/backups and retention all retain purpose limits.                                                                                                                             |
| 16  | Scalability and performance risks                             | **Yes — R05/R13.** Abuse, hot recipient keys, policy joins and queue/backlog growth need measured bounds. No unsupported “fast,” volume or conversion claim is accepted.                                                                                                                       |
| 17  | Operational burden                                            | **Yes — R08/R11/R13/R14.** No manual consent reconstruction or direct SQL repair. Use source-owned cause-specific repair and exact compatibility proof, with a useful ordinary path.                                                                                                           |
| 18  | Observability and auditability gaps                           | **Yes — R07/R08/R10/R13.** Minimal durable intent/consent/Page history is separate from logs and provider events; correlation must not log tokens or raw recipient payloads.                                                                                                                   |
| 19  | Dependency and integration risks                              | **Yes — R01/R11/R14.** Native work is independent of P32/AI/SMS; actual P6/P17 producers and provider scope remain required. Declared and installed package versions are different evidence.                                                                                                   |
| 20  | Migration, rollout, and upgrade risks                         | **Yes — R02/R03/R14.** No inferred On/consent, mixed-version default widening or unsafe rollback. Preserve old request occurrences and fence legacy paths before enablement.                                                                                                                   |
| 21  | Testability, traceability, and proof                          | **Yes — all R concerns.** Exact C/P mapping, owner amendments, positive and negative complete journeys, real concurrency and release evidence are necessary; mocks and vendor claims are insufficient.                                                                                         |
| 22  | Other development hazards                                     | **No additional independent material concern found.** Checked financial effects, shared-account assumptions, new infrastructure, hidden compulsory workflows and unrelated phase dependencies; their relevant risks are already addressed above. No gift/receipt/finance change is authorized. |

## Required amendment clauses

- **D6-C01 — One native owner and explicit reconciliation.** P28 SHALL own the
  exact native instruction/membership lifecycle and bounded recipient purpose
  under P3's consent contract and wider restrictions. P6 SHALL consume current
  source eligibility and own send-time verdict/snapshot, suppression evidence,
  intents and delivery; it SHALL NOT become a second subscription master. P17
  owns qualified content/preparation. Reconcile
  P23 D26/ADR0170's P32-only wording and P25 EX11–EX13/EX16 explicitly. Preserve
  the external request lane and its exact accepted occurrences; optional P32
  sync SHALL NOT be a native prerequisite or write authority.
- **D6-C02 — Exact missionary control.** The qualified missionary SHALL have a
  usable source-owned action to control signup on the exact authorized Page,
  through P22/P23 typed placement and P12 capabilities. Subject display,
  missionary/coauthor/spouse/team status, authorship, CRM or finance access SHALL
  NOT substitute for this authority or grant subscriber access. Reuse the
  existing Page surface and publication workflow, not a general CMS grant.
- **D6-C03 — Public effect and initial adoption.** New native entries SHALL NOT
  be offered until deliberately chosen and qualified. Do not infer On from a
  published Page, sender connection, old Request button or previous contacts.
  A source-qualified Off SHALL stop new intake and controlled future serving;
  stale rendered forms and stale publication candidates SHALL NOT override it.
  On SHALL require current choice, normal publication and readiness. Saved,
  pending, shown, hidden and unavailable SHALL remain distinguishable.
- **D6-C04 — Short separate public journey.** The form SHALL identify the exact
  public-safe newsletter and collect required Email with optional single Name,
  concise purpose/privacy/withdrawal explanation and one deliberate action.
  No donation, account, phone/address, split legal-name fields, marketing bundle,
  prechecked consent or extra checkbox SHALL be added without an exact owner
  need. Keep the form outside checkout, with no forced popup or diversion from
  giving. Submitted values SHALL NOT choose sender, headers, templates, transport
  recipients beyond the bounded confirmation destination, or routing. Public
  content remains audience-invariant; private interaction does not.
- **D6-C05 — Confirmed new admission.** Each new admission or re-subscription
  SHALL require fresh exact-newsletter/address confirmation. No verified-profile
  shortcut is introduced here. An already active identical relationship is a
  no-op with no repeated confirmation mail. Pending acceptance, confirmed
  relationship, current send eligibility and actual delivery SHALL be distinct.
  Name/email submission SHALL NOT overwrite existing identity/contact data.
- **D6-C06 — Narrow confirmation and withdrawal capabilities.** Confirmation
  SHALL use a safely stored, purpose/destination/generation-bound expiring
  capability and an explicit action; GET, preview, scanner, delivery/open event
  or page load SHALL NOT activate. No token grants general login/CRM/preference
  access. Preserve login-free, reduction-only unsubscribe including qualified
  RFC 8058 processing. An old valid human link can begin a fresh current-scope
  withdrawal; an accepted operation's retry cannot undo later confirmed consent.
- **D6-C07 — Independent lifecycle meanings.** Page-entry Off SHALL NOT alter
  existing subscriptions, withdrawal access, Page reach, giving or independently
  lawful sending, nor select external Request as fallback. An already accepted
  pending occurrence MAY finish after Page-entry Off within its original validity
  and current exact purpose/recipient safety. Purpose closure, consent withdrawal,
  supersession or applicable suppression SHALL independently fence confirmation
  and unstarted sends. Reopening SHALL NOT resurrect withdrawn/expired evidence.
- **D6-C08 — Abuse protection without enumeration.** Public results and timing
  SHALL not reveal donor/contact/subscriber/suppression state. Public Page closure
  and syntax errors may be explained without destination-specific disclosure.
  Bound input, attempt/resend volume and recovery using qualified scope-aware
  abuse controls; account for shared networks and accessibility. Do not count a
  new HTTP key as new permission to send or let an unverified claim permanently
  occupy an address. Confirmation mail is itself an abuse-sensitive effect.
- **D6-C09 — Database integrity.** Require trusted non-null Tenant/purpose/source
  keys, tenant-aware foreign keys, exact-scope uniqueness, valid state/generation/
  expiry constraints, immutable attribution and indexed bounded read/recovery
  paths. Preserve owner email normalization and shared-mailbox semantics; no
  global email/person uniqueness. Retain lawful append-only evidence while
  source-owned deletion/purge handles payloads; no blanket Auth cascade or
  indefinite PII archive. No financial schema change is implied.
- **D6-C10 — One enforceable authorization boundary.** Resolve trusted host,
  CMS-to-operational Tenant mapping, current Page/subject/newsletter source and
  actor assurance server-side. Reject caller-controlled scope/authority/audit
  fields and forbidden state transformations. Preserve the existing
  protected-action/origin/CSRF boundaries for
  authenticated Page changes and confirmation. Preserve RFC 8058's distinct
  authorized cookieless POST rather than requiring a login or browser cookie.
  Prove effective table/column
  grants, both old/new row policies, views, functions/RPCs, service-role paths,
  direct APIs and any reached Storage/Realtime/export paths. Public readers
  SHALL have no subscriber enumeration or raw write rights.
- **D6-C11 — Atomic source acceptance.** Accept pending state with its required
  minimized evidence and durable confirmation intent atomically. Accept
  confirmation/withdrawal/entry changes with their required evidence atomically.
  Required source/dispatch fences must hold before acceptance; an eventual
  outbox is not a substitute. Separately asynchronous delivery can recover later
  without fabricating membership, losing accepted work or repeating its effect.
- **D6-C12 — Ordering and durable intent.** Serialize relevant competing Page,
  admission, withdrawal and safety changes at their authoritative boundary.
  The same durable intent/meaning reconciles one effect; changed meaning conflicts.
  Old accepted commands/receipts do not reapply or prove present state. Handle
  first-use and retry of unsubscribe separately from fresh human withdrawal;
  identical repeated POSTs do not prove new human intent. Unrelated changes
  SHALL NOT invalidate otherwise surviving authority by a blanket global epoch.
- **D6-C13 — Minimum recipient truth.** Use one qualified native relationship and
  contact authority; P6's no-Party pattern requires exact source/manifest
  admission before use. Optional independent Party linkage SHALL preserve its
  owner proof. Signup SHALL NOT create/merge/overwrite a canonical person, donor,
  household, private prospect, cultivation, follower, protected reader, financial
  access or staff-visible CRM contact merely from supplied values. D1–D5 retain
  their meanings. Ordinary contact correction SHALL NOT silently retarget consent.
- **D6-C14 — Truthful two-sided UI.** Show one existing-Page control, short
  consequence copy, inert preview and actual publication/readiness status.
  Confirm source acceptance before success; distinguish unknown, pending,
  subscribed, blocked and delivery outcomes without public enumeration. Keep
  authorized drafts through correctable errors; clear protected state on authority
  loss. Give the missionary concise contextual explanation and a qualified
  newsletter-recipient destination, not new per-signup alerts or a second inbox.
- **D6-C15 — Finite privacy and retention.** The confirmation-lifetime proposal
  is narrowly superseded by [D45](phase28-d45-seven-day-confirmation-decision.md):
  **seven elapsed days (168 hours) from initial durable acceptance**, with no
  extension by read/retry/resend. Before activation, qualify the exact source
  profile against this selected lifetime. The separate recommendation that
  unused secrets and redundant pending raw material leave active use at
  termination and purge within **24 elapsed hours**, subject to exact lawful
  custody exceptions that never extend action authority, remains unadopted.
  It is a review policy judgment, not a vendor limit or existing request rule.
  Declare the remaining finite resend/abuse bounds and exact consent-evidence
  retention under the privacy owner before activation, with boundary tests. Do not
  inherit external-request durations or provider idempotency windows. Separate
  minimal durable consent/withdrawal evidence from expiring names, addresses,
  tokens and delivery material. Apply policy to logs, exports, caches, backups,
  restores and denied/late responses; never extend authority through retention.
- **D6-C16 — Qualified delivery and provider scope.** Use the sole P6/P17 route
  and exact approved confirmation/newsletter profiles. Map actual provider team,
  connection, account, region, domain and suppression behavior; resolve the older
  P17 region-only assumption. Provider Contacts/unsubscribed status SHALL NOT
  replace Core's purpose consent gate. Preserve stronger restrictions, signed
  event identity, duplicate/out-of-order handling and ambiguous-outcome recovery.
  Re-subscription SHALL NOT silently remove a hard bounce, complaint or broader
  objection; visibility and signup never authorize a newsletter send.
- **D6-C17 — Accessible, international and safe presentation.** Reuse the shared
  base-maia/Base UI and semantic tokens. Use visible labels, native semantics,
  useful autocomplete, linked errors, persistent status, keyboard/focus support,
  touch targets, mobile reflow and a useful low-bandwidth/native form path.
  Preserve international names and supported addresses; localize copy and dates.
  Use only authorized public aliases in page/email/URL/preview metadata. Do not
  auto-copy private stories or add tracking as a condition of subscribing.
- **D6-C18 — Repair and audit without a new console.** Keep durable source
  evidence distinct from technical logs/provider events. Correlate exact source
  occurrence, operation, generation and scoped outcome without tokens/raw PII.
  Provide cause-owned status and permitted retry/correction; no direct SQL repair,
  consent guessing, blanket subscriber transfer or wider rights to diagnose a
  problem. Use the existing owners' operations and the monitor duties below.
- **D6-C19 — Compatible adoption.** Census exact Pages, forms, configurations,
  recipients, legacy flags/writers/grants and accepted requests. Add compatible
  source contracts before callers; fence old writers, preserve historical scope
  and test mixed versions. Enable only explicitly chosen qualified native entries.
  Kill switches stop affected new work while preserving required withdrawal,
  evidence and safe recovery. Rollback/restore SHALL NOT revive consent/access,
  resend old mail or restore a known unsafe predecessor.
- **D6-C20 — Positive complete proof and measured bounds.** Qualify a real
  authorized missionary's choice, public guest signup, confirmation, accurate
  recipient visibility and withdrawal through actual sources and browser/API
  paths. Include forbidden, duplicate, conflict, provider, migration and poor-
  network cases. Publish production-shaped workload/query/queue/latency bounds
  before release; unsupported numbers and synthetic passes are not evidence of
  usability, throughput or integration. Native work remains useful without P32,
  optional workflows, SMS or AI.

## Minimal UX and UI to deliver

The interface should look and behave like the rest of Core: ordinary page
typography and spacing, a compact newsletter panel, shared controls and a calm
persistent result. Keep the giving action prominent. Do not add a pop-up,
newsletter wizard, transport selector, campaign builder or large settings grid.
The following wording is recommended copy, to be tested with actual users and
localized; it does not freeze a route or pixel layout.

**Missionary, in the existing Page experience:**

> **Newsletter signup**
>
> **Show newsletter signup on this page**
>
> Visitors can sign up for [public name]'s email newsletter. New subscribers
> confirm their email first. Hiding this form stops new signups here; existing
> subscribers stay subscribed.

Use the existing save/publication action, an inert **Preview** and one accurate
status. A short details disclosure can explain that previously accepted signups
can still be confirmed before expiry while the newsletter and recipient remain
eligible. Do not turn every toggle into a
warning dialog. Confirmation of an ordinary Page choice is not a new approval
workflow; existing Page review still applies where required.

| Actual condition                                            | Missionary presentation and action                                                                                                                                               |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Qualified, authorized, currently shown                      | **Shown on your public page.** The control and preview reflect this exact newsletter. Turning Off invokes the qualified stop for new entry intake.                               |
| Deliberately Off                                            | **Hidden from your public page.** Existing subscribers and withdrawal remain available through their proper newsletter purpose. No automatic external Request appears.           |
| New native entry not yet chosen                             | Explain what the optional entry does and allow deliberate setup through the existing Page experience. Do not mislabel this as a previously saved Off choice.                     |
| On saved, normal review/publication pending                 | **Saved — awaiting publication/review**, using the owner's actual state. Preview is clearly preview and cannot send. Do not claim “Shown” until effective.                       |
| Page unpublished or otherwise not publicly reachable        | State that the entry is not publicly available; distinguish the saved preference from Page reach. The switch does not publish the Page.                                          |
| Current permission allows viewing but not changing          | Present the current permitted status and concise permission explanation without an active editing affordance. Do not expose unviewable source values.                            |
| Setup incomplete, source unavailable or safety limits apply | Give the safe cause and only the existing permitted next action. A dependency outage is not a saved Off. Do not display a broken active signup switch or private safety details. |
| Save response lost or another contributor changed it        | Preserve authorized local intent, reconcile the original operation and show current result/conflict. Do not blindly repeat On or claim that an accepted Off failed.              |

Explain this once in context when the missionary enables the entry, then keep
the short helper and status available. In the newsletter workspace, show
qualified confirmed recipients and a clearly named destination such as
**Newsletter subscribers** where current permission allows it. Pending proof
must not inflate confirmed-subscriber counts or appear as donor/partner
acquisition. Unknown data is not zero. No per-signup bell/email, task, compulsory
reporting or new inbox is introduced just to “communicate the feature.”

**Visitor, in a secondary panel on the public Page:**

> **Get [public name]'s newsletter**
>
> Receive [public name]'s email newsletter. New signups need email confirmation.
> You can unsubscribe at any time.
>
> Email · Name (optional) · **Sign up**

Use the exact safe newsletter name if different. Do not conflate this with
**Show in my Updates**, post-notification email, a protected reader relationship
or organization-wide marketing. No promised sending frequency unless the
source actually establishes it. Display the relevant privacy information without
a second compulsory consent checkbox for this sole-purpose action unless an
exact governing requirement needs one.

| Visitor state                                  | Clear behavior                                                                                                                                                                                                                                                                                            |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ready                                          | One column, visible labels, email autocomplete/keyboard, paste allowed, optional unsplit Name. No login, donor lookup or money step.                                                                                                                                                                      |
| Invalid input                                  | Explain the exact supported format beside the field; keep input/focus. Do not silently repair an address, strip plus tags or describe a service failure as an invalid email.                                                                                                                              |
| Submitting                                     | Stable progress and preserved focus; repeated activation reconciles the same operation. The form remains usable on slow connections and through the qualified native submission path.                                                                                                                     |
| Durably processed signup                       | **Signup received.** “If a confirmation email is needed and can be sent, we'll send you a link. Existing subscriptions stay unchanged.” This neutral receipt requires actual durable intake/recovery evidence; it is not permission to fabricate pending membership in every branch.                      |
| Confirmation email                             | Name the exact public-safe newsletter, explain the requested confirmation and provide its one protected action. No private worker metadata, tracking requirement, donor upsell or automatic welcome campaign.                                                                                             |
| Link opened                                    | A short exact-newsletter page with **Confirm subscription**. No automatic POST or activation on opening. No account/donation detour.                                                                                                                                                                      |
| Confirmation accepted                          | **You're subscribed to [newsletter].** State how to unsubscribe; no promised arrival or automatic first newsletter. Refresh/replay may show a different current state and must explain it truthfully.                                                                                                     |
| Expired/withdrawn/obsolete proof               | Explain that this link cannot complete the signup and offer a currently permitted fresh signup. No resurrection, silent address substitution or forced account creation.                                                                                                                                  |
| Nothing arrived                                | Give concise spam-folder/address-correction help and a bounded eligible resend path. A resend stays within the pending admission's original deadline; untrusted repeat submissions must not repeatedly invalidate otherwise usable pending proof. No public suppression explanation or subscriber lookup. |
| Signup entry turned Off while the form is open | On attempted new submit, explain that signup is no longer available on this page. Do not discard a completed signup or reinterpret it as an external request.                                                                                                                                             |
| Global service outage / unknown submit result  | Explain the actual unavailable or checking state. Recover the same operation before suggesting a new request. Do not promise that an email was sent or that no write occurred.                                                                                                                            |
| Withdrawal                                     | Keep the exact newsletter easy to leave without signing in. Describe the actual withdrawal scope and current result; do not cancel giving or expose other subscriptions.                                                                                                                                  |

**Accessibility/field conditions:** test keyboard order, focus during pending
submit, meaningful announcements, inline errors, long/localized strings,
international names, supported international email, zoom/reflow at 320 CSS
pixels and Core's 44px touch guidance. WCAG 2.2 AA's target minimum is 24 CSS
pixels with exceptions; these are different standards. Verify sticky giving
controls and on-screen keyboards do not obscure the action/error. Avoid autoplay,
layout-shifting celebration, hover-only explanations and mandatory heavy scripts.
The installed component wrapper's loading-focus behavior requires an actual
journey check; a Base UI feature is not proof of accessible composition.

## Lifecycle and invariants

Keep separate dimensions rather than one giant status enum:

| Source dimension     | Valid meaning and transition                                                                                                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page entry           | Not chosen, chosen Off or chosen On, with independent publication/effective availability. Scoped Off stops new intake; only current eligible release can make On effective.                               |
| Admission            | An eligible new intent becomes Pending, then Confirmed only through its fresh proof. It may expire, be withdrawn, superseded or become ineligible. An unproved request cannot reserve an address forever. |
| Current relationship | Confirmed membership can be withdrawn for its exact purpose; a later deliberate re-subscription needs new admission/proof. Confirmation is not continuous send eligibility.                               |
| Message              | Intent, prepared/admitted, provider accepted/unknown/failed and delivery evidence retain P6/P17 meanings. None alone establishes subscription or human reading.                                           |
| Restrictions         | Exact list withdrawal, broader consent objection, provider suppression, purpose closure, Page reach and source safety have distinct scope. A weaker control cannot clear a stronger restriction.          |

[D45](phase28-d45-seven-day-confirmation-decision.md) replaces the original
72-hour proposal with **168 elapsed hours from initial durable acceptance**,
not seven local calendar days or a resettable timer. At the expiry instant the
old proof cannot activate. The still-unadopted 24-hour terminal purge proposal
concerns unused secrets/redundant pending raw payload, not a promise to erase a
confirmed recipient source, required minimized consent evidence or delivered
mail. D45 does not adopt that retention proposal or this whole review packet.
The [pre-D45 review](d45-evidence/d6-before-d45.txt) preserves the original wording. The SQL
fixture used an arbitrary one-hour test window and does not validate these
production constants. Privacy-owned legal retention and actual abuse budgets
remain named activation qualifications, not invented universal periods.

Required invariants include one current exact-purpose/destination relationship,
no unproved public mutation of identity, no cross-Tenant relationship, no
subscription from a mere delivery/open event, no stale resurrection, no hidden
Page choice widening, no loss of already accepted evidence on secondary failure,
and no newsletter send from signup alone. Only independently qualified new subscribers may
enter a newly prepared audience; they are not inserted into an already frozen
newsletter send plan. Withdrawal stops matching unstarted work at the exact
owner boundary and cannot recall already admitted/delivered mail.

## Falsifiable acceptance and proof

These are required proof scenarios for the later authorized specification, not
claims that the real product has passed. Each must cite its source command,
current authorization and visible outcome.

| ID     | Required outcome                                                                                                                           | Negative/boundary counterpart                                                                                                                                                                                  |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D6-P01 | Qualified missionary enables the exact entry; guest joins, confirms, and an authorized missionary sees one confirmed newsletter recipient. | No donor account, donation, duplicate entry, generic CMS access, optional sync or manual signup handoff is needed. A deny-only control fails.                                                                  |
| D6-P02 | Existing external Request keeps its own copy, recipient routing, clocks and history.                                                       | No conversion of old requests, flags, contacts, follows or gifts into native consent; no fallback to external Request when native Off/unavailable.                                                             |
| D6-P03 | Exact contributor can control the assigned Page.                                                                                           | Another Tenant/Page/subject, unassigned displayed missionary, spouse/team member, stale/revoked contributor or caller scope/actor flag cannot.                                                                 |
| D6-P04 | Saved choice, published placement, public reach and readiness render accurately.                                                           | New On does not bypass review, publish the Page or show fake success; read-only/unknown/unavailable are distinct.                                                                                              |
| D6-P05 | Off versus new intake and Off versus stale On/release have defined atomic order.                                                           | A previously loaded form or old publication cannot accept/restore new intake after Off wins. Previously rendered pixels are not mistaken for current authority.                                                |
| D6-P06 | Accepted pending proof can finish after entry-only Off while still eligible.                                                               | Purpose withdrawal, safety restriction or expiry blocks it; On never resurrects revoked proof; existing readers/withdrawal/giving remain intact.                                                               |
| D6-P07 | Optional Name, supported international email and shared mailboxes retain source meaning.                                                   | Email equality cannot merge/overwrite people, subscribe household members, expose CRM or retarget another relationship.                                                                                        |
| D6-P08 | Each new admission/re-subscription needs exact fresh confirmation; active identical membership is a no-op without mail.                    | Auth verified flag, gift, follow, D2 sharing, D5 edit, request receipt and negative consent-gate success cannot substitute.                                                                                    |
| D6-P09 | Confirmation is exact-scope, single-effect and current.                                                                                    | GET/HEAD/prefetch/preview/auto-submit, cross-host/purpose/address, expired/revoked/superseded token and late replay cannot activate. POST alone is not claimed as human proof.                                 |
| D6-P10 | Public receipt/recovery is durable and non-enumerating.                                                                                    | Known/unknown/active/suppressed destinations reveal no private status through body/status/timing; public closure and syntactic invalidity remain understandable. Rate controls cannot send on every fresh key. |
| D6-P11 | Composite keys, constraints and exact uniqueness hold under real database roles.                                                           | Cross-Tenant parents, nullable scope bypasses, same-Tenant wrong purpose, forged confirmation/actor and invalid state fail without partial effects.                                                            |
| D6-P12 | Actual API/SQL/role paths preserve the same authority.                                                                                     | Deny raw subscriber reads/writes; test table/column grants, views/definers, REST/RPC/GraphQL, reached Realtime/Storage/exports, and distinct CMS/operational Tenant IDs.                                       |
| D6-P13 | Confirmation versus withdrawal, duplicate confirmation and scope closure/reopening resolve consistently.                                   | Accepted withdrawal first prevents activation; accepted confirmation first remains history but later withdrawal governs current state; Boolean reset does not resurrect.                                       |
| D6-P14 | Pending source, evidence and required intent are all accepted or none.                                                                     | Inject evidence/intent failure, crash and lost response; no stranded acceptance, duplicate mail or false subscription. Provider failure cannot roll back independently accepted source facts.                  |
| D6-P15 | Old human withdrawal links can begin a fresh exact-scope action without login; one-click delivery retries are idempotent.                  | First use after re-subscription differs from replay of an already accepted command; old retry cannot undo newer consent or affect another address/list; no false current-result claim.                         |
| D6-P16 | Newsletter-only authority stays narrow everywhere.                                                                                         | No roster/finance/private-note/protected-content access, CRM sharing, contact-edit power, cultivation or coaching effect through UI, counts, search, export, history or notification.                          |
| D6-P17 | Public signup works on mobile/desktop with keyboard/AT, zoom, long names/locales, supported email and poor connectivity.                   | No mobile-hidden CTA, mandatory split name/repeat email, silent normalization, inaccessible challenge, focus loss or donation interruption.                                                                    |
| D6-P18 | Missionary can explain what is live, what Off does, and whether readers confirmed.                                                         | Preview has no effects; unsupported controls/zeroes do not mislead; permission/context changes clear unsafe state and reject late responses.                                                                   |
| D6-P19 | D45's 168-hour expiry is proved at exact boundaries; terminal raw-material purge and legal evidence follow separately adopted owner policies. The old 24-hour proposal is not adopted by D45.         | Resend/read/retry/restore cannot extend tokens; retention never extends authority; backups, logs, exports and archived secrets obey qualified custody.                                                         |
| D6-P20 | Current consent/suppression and frozen audience/recipient meaning govern actual P6/P17 dispatch.                                           | No raw Resend bypass, mutable retargeting, new subscriber inserted into a released plan, rekey after provider idempotency expiry or delivery/read claim from acceptance.                                       |
| D6-P21 | Actual provider account/team/domain/region behavior matches source keys and diagnostics.                                                   | Shared-provider suppression cannot be ignored in another domain/region or leak another Tenant's relationship; Contact unsubscribe cannot replace native gating.                                                |
| D6-P22 | Census/backfill/mixed-version adoption preserves exact requests, consent and current restrictions.                                         | No automatic native On, inferred subscription, compatible-looking legacy write, unsafe rollback, backup revival or replayed historical mail.                                                                   |
| D6-P23 | Production-shaped query, client-memory, abuse, queue and latency budgets are measured with large/skewed tenants and constrained networks.  | No full donor scans/per-render subscriber lookup, unbounded list/queue, per-keystroke authority request or invented throughput claims.                                                                         |
| D6-P24 | Native signup/withdrawal remain usable without P32, optional workflows, AI or SMS; cause-owned recovery has evidence.                      | Missing required P6/P17/source qualification blocks the exact capability, not all workspace work; no substitute permission/provider engine or direct SQL repair.                                               |

**Executed mechanical proof:** the isolated PostgreSQL 17.11 fixture passed
34/34 expected outcomes and five actual lock-wait races: Off/intake in both
orders, withdrawal/confirmation in both orders, and simultaneous confirmation.
It also tested atomic intent/evidence failure, scoped foreign keys, denied public
reads/writes, expiry, stale address/purpose revisions, retained suppression and
historical retry without reactivation. It uses synthetic roles and no network
or provider. Its generic `processed` result makes no accepted/sent/subscribed
claim. It does not qualify human consent, a mailbox, HTTP timing/abuse resistance,
Core authority, actual P6/P17 producer acceptance or Supabase deployment.

## Adversarial check

### What could go wrong with this answer?

The simplest-looking form could send to an unproved address, create the wrong
CRM identity, expose a restricted worker, or tell the missionary it is live when
it is not. A broad Off could destroy subscriptions. R01–R14 and C01–C20 address
these without adding more ordinary settings.

### What hidden assumptions are we making?

The founder's selected need is verified; exact visitor preferences, conversion,
support volume and comprehension are not measured. A useful no-account native
recipient source and qualified P6/P17 producers need integration proof. The
original 72-hour recommendation was a product judgment, not a legal or vendor
requirement; D45 explicitly replaces it with seven elapsed days. Public
email is not assumed appropriate for every sensitive ministry.

### How does this affect the whole product?

It adds a narrow native admission purpose and Page control across existing
owners, with no changes to giving, identity claiming, protected Updates, staff
CRM sharing or external request history. The explicit P32-routing and provider
suppression conflicts must be reconciled in their owning artifacts.

### How does this affect the end-user experience?

The visitor gets one clear newsletter form, a purposeful confirmation and an
easy way to leave. The missionary gets one Page choice, preview, actual status
and an understandable subscriber destination. No extra operational inbox or
routine manual signup approval is introduced.

### Does this follow modern best practices?

Yes, as a constrained recommendation: explicit purpose, minimal input, distinct
pending/confirmed states, recipient control, abuse-aware proof and accessible
feedback. Epistle supports clear reader choices, not a verified confirmation
implementation. Mailchimp/GOV.UK/Google/provider evidence supports the separate
states; vendor defaults and broad legal claims do not override Core.

### Does this fit Asym’s existing repo and product direction?

Yes with explicit owner amendments. It follows native independence, exact
contributor authority, typed public forms, one communication spine and the
shared UI system. Current inert buttons, mock Save and negative-only consent
helpers do not implement this contract. No new independent ADR or generic engine
is justified; amend the affected existing owners during the authorized transition.

### Should we adjust the recommendation?

**Accept with required amendments.** Keep A and missionary control. Require the
corrected decision above, exact ownership, confirmed new admission, independent
Page/consent lifecycle and truthful UI. No additional founder micro-question is
needed to resolve ordinary design, database constraints or these safety semantics.

## Ruthless synthesis and order of work

1. **Before recording the review as complete:** preserve the founder's A and
   control rider; resolve the meaning of the control, proof, pending after Off,
   new-entry defaults and old requests in the exact decision. Record the owner
   conflicts and strongest alternative explicitly. This review does so; it does
   not falsely claim that source contracts were already amended or implemented.
2. **Capture in the later authorized specification:** reconcile P28/P6/P3/P17
   native relationship/consent/preparation, P22/P23 typed Page/form placement and
   source narrowing, P12 exact contributor/recipient rights, P4/P9 minimum
   identity/contact authority and P25's distinct external/native experience.
   Amend ADR0170's old P32-only routing and the corresponding canonical source
   and generated OpenSpec projections together. Do not edit a generated mirror
   alone. Add the bounded source/material profiles and the acceptance matrix.
3. **Qualify source boundaries before public activation:** resolve the actual
   P6 preparation/sealed-submission producer, token/recipient authority, precise
   consent/withdrawal fences and provider suppression congruence. Reconcile real
   CMS/operational Tenant mapping and active roles/grants. These are blockers
   only for this affected capability; E7 financial attribution and unrelated
   finance work must not become invented signup prerequisites.
4. **Require implementation safeguards:** constrained authoritative commands,
   scoped keys/constraints, one durable effect identity, atomic evidence/intent,
   current acceptance/dispatch authority and protected derivatives. Then compose
   the one control and short public flow through shared components. Integrate
   current subscriber visibility and withdrawal under their own capabilities.
5. **Adopt safely:** census before backfill; preserve external requests and all
   independently valid consent/restrictions; source-first compatible rollout;
   fence old writer paths; explicit Page enablement; prove new/old versions and
   safe kill/roll-forward behavior. A hidden new entry is a safe incomplete
   rollout state, not evidence that the feature is complete.
6. **Prove actual usefulness before release:** execute the real P01–P24 matrix,
   including source/API/browser, authority, migration, provider, mobile/AT and
   production-shaped workload tests. Representative visitors must understand
   whether they joined; missionaries must understand live status and Off. A
   critical wrong-consent/privacy or misleading-success outcome blocks release.
   The synthetic 34 checks support mechanics only; no pilot or throughput claim
   substitutes for these gates.
7. **Monitor only bounded residual risks after qualification:** use the named
   duties below. Monitoring cannot replace tenant isolation, consent proof,
   idempotency, required retention or a working positive journey.

| Residual signal                                                                                                                                                            | Threshold                                                                                                                   | Accountable owner                             | Required response                                                                                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unauthorized cross-scope read/write, activation without proof, or matching unstarted newsletter work admitted after an applicable withdrawal won its source/dispatch fence | **One confirmed event**                                                                                                     | P12/P3 security owner with P28 and P6         | Stop the affected intake/send capability, preserve minimal evidence, contain and correct the source boundary; requalify before reopening. Later transport completion of previously admitted/unknown work is not this invariant breach. |
| New intake accepted after effective Page Off, or stale release restores it                                                                                                 | **One confirmed event**                                                                                                     | P22/P23 Page/intake owner                     | Stop affected new intake; reconcile source generations and cached/public paths; repair and re-test both race orders. Preserve existing withdrawal.                                                                                     |
| Duplicate confirmation effect or stale confirmation/withdrawal replay changes newer intent                                                                                 | **One confirmed event**                                                                                                     | P28 admission owner with P6 delivery owner    | Pause the defective effect path, reconcile source receipts and generations, correct semantics and replay only authorized residual work.                                                                                                |
| Accepted pending work lacks its required evidence/intent, or recoverable delivery remains undiscoverable                                                                   | **One confirmed invariant breach**                                                                                          | P28 source owner with P6 operations           | Stop acceptance on the defective path; repair through the owner, not a manual subscriber insert; verify complete durable recovery.                                                                                                     |
| Token/raw pending material remains usable beyond expiry or held past its applicable purge bound without a qualified custody exception                                      | **One confirmed violation**                                                                                                 | P3 privacy owner with P28/P6 custody owners   | Revoke use immediately, purge through the owner, investigate every copy/restore path and prove correction.                                                                                                                             |
| Missionary/visitor misunderstands live status, existing-reader effect or pending versus subscribed                                                                         | **One reproducible wrong-action outcome in release testing; three distinct confirmed reports within 30 days after release** | Missionary/Donor product UX owners            | Block release for the former; for the latter reproduce both ends, correct copy/state/action placement and rerun the relevant journey. P25 already uses a three-in-thirty misunderstanding monitor; D6 extends its exact scope.         |
| Queue/query/latency/abuse work exceeds the published qualified source budget                                                                                               | **Any breach of the versioned tested numeric envelope**                                                                     | P28 service owner with P6/platform operations | Apply existing admission/backpressure and investigate the exact bottleneck; preserve accepted work. No budget means the release gate is unmet, not permission to monitor an undefined threshold.                                       |

These are proposed owner duties and release criteria, not newly configured
monitors or claims that alerts, tickets or dashboards were created. No general
legal retention period, arbitrary production request ceiling, fundraising
conversion target or first-newsletter arrival promise has been invented.
