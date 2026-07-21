# Donor Anonymity, Guest Giving, and Contribution Identity

> Leadership decision document provided verbatim by Conrad (2026-07-02) during
> the OpenSpec refinement session. This is the authoritative design input for
> this change. Spec deltas in this change are derived from it.

**Product area:** Donor checkout, Contributions Hub, donor CRM, missionary-facing giving views
**Decision owner:** Conrad / Blake
**Build target:** `Asymmetric-al/core`
**Status:** Product/spec decision for implementation
**Last updated:** 2026-07-02

> **Controlling generated-document amendment (2026-07-21).** This change owns
> guest-giving identity capture, anonymity, payment/contribution truth, and the
> source facts needed for receipting. Phase 7 freezes legal-donor and
> receipt/statement eligibility/issuance facts. Phase 18 alone owns document
> definitions, publications, generation requests, exact PDF artifacts,
> currentness, access, and generated-document records evidence. Phase 17 alone
> owns message preparation, send, provider outcome, and communication history.
> The contribution never owns receipt render/artifact/delivery state; copies
> stream stored exact bytes and never rerender a snapshot. Where older design
> examples below conflict, this amendment and the active OpenSpec requirements
> control.

---

## 1. Executive answer

A donor should be able to **give online without first creating or logging into an account**.

That does **not** mean the gift is truly unknown to the organization. Online card and ACH giving requires enough donor, billing, and payment information to process the payment, prevent fraud, reconcile the gift, issue receipts, handle refunds/chargebacks, and maintain proper financial records.

The product decision is:

> Online donors can give without a pre-existing account. During checkout, we collect the required donor/payment information, create or match the donor record behind the scenes, and create claimable donor portal access without forcing a separate signup step.

Separately:

> A donor may choose to be anonymous to the missionary/public-facing views. That anonymity does not hide the donor from authorized admins/finance users.

For offline gifts:

> If the donor is truly unknown, staff can enter the gift as an unknown/anonymous offline contribution without inventing fake donor data. If the donor is known, staff should record the donor information and can still mark the gift anonymous to the missionary/public views.

---

## 2. Important distinction: three different concepts

Do not collapse these into one field.

### 2.1 Guest giving

**Meaning:** The donor does not need to sign in or manually create an account before giving.

Guest giving is allowed for online checkout.

The donor still provides required information during checkout:

- first name
- last name
- email address
- payment method
- billing details required by the processor/payment method
- mailing/billing address when required by payment method, fraud controls, ACH, receipts, or organization policy

The checkout flow should feel like:

> Give now.

Not:

> Create an account first, then give.

### 2.2 Donor record / account creation

Online checkout creates or matches a donor record behind the scenes.

This should be transparent but not heavy. The donor should not need to choose a password before giving.

Preferred model:

- create or match the CRM donor record immediately
- create/link donor portal access as **claimable**
- use email verification/magic link for later donor dashboard access
- do not silently create a password
- do not expose whether an email already belongs to another donor account

Suggested donor-facing language:

> We’ll use this information to process your gift, send your receipt, and give you access to your giving history.

### 2.3 Anonymity

**Meaning:** The donor’s name is hidden from missionary-facing and public-facing views.

Anonymity is a **visibility preference**, not a deletion of donor identity.

Admins/finance users still see the donor information when it exists.

Anonymous to missionary/public does not mean:

- anonymous to finance
- anonymous to admins
- anonymous to the payment processor
- anonymous in audit/reconciliation records
- deleted from tax/receipt records

---

## 3. Core product decisions

| Question                                                       | Decision                                                                                              |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Can a donor give online without signing in first?              | Yes.                                                                                                  |
| Does online giving require donor information?                  | Yes. Name, email, and payment/billing details required by the payment method and organization policy. |
| Do we create an account before checkout?                       | No manual account-first wall.                                                                         |
| Do we create/match donor records behind the scenes?            | Yes.                                                                                                  |
| Should the donor get future account access?                    | Yes, through claimable/magic-link access, not a forced password step.                                 |
| Can an online donor be anonymous?                              | Yes, but only to missionary/public views.                                                             |
| Can admins/finance still see the donor?                        | Yes.                                                                                                  |
| Can offline gifts be entered with no donor name?               | Yes, only when the donor is truly unknown.                                                            |
| Should staff type fake names like “Anonymous Anonymous”?       | No. Use an intentional unknown-donor mode.                                                            |
| Can a known offline donor request anonymity?                   | Yes. Record the donor, then mark the gift anonymous to missionary/public views.                       |
| Should anonymity be stored per donor or per gift?              | Store it per gift. A donor-level default may exist, but every contribution needs its own snapshot.    |
| Should receipts be sent for unknown offline cash?              | No, unless sufficient donor information is later provided.                                            |
| Should online payment success be based on the client UI alone? | No. Success must be confirmed by server-side donation/payment state.                                  |

---

## 4. Current repo context checked

These repo facts matter for implementation:

### 4.1 Checkout currently collects basic donor information

`apps/donor/app/(public)/checkout/checkout-client.tsx` currently models donor info as first name, last name, and email, and the Details step blocks continuing until those fields are present.

Relevant current shape:

- `DonorInfo` includes `email`, `firstName`, `lastName`.
- Details step says the information is for tax receipts and donation tracking.
- Continue button is disabled unless first name, last name, and email exist.

### 4.2 Checkout currently needs real payment wiring

The current checkout still uses raw-looking card inputs in the client and a simulated success flow. That must not become the production payment flow.

Implementation decision:

- Replace raw card/PAN/CVC inputs with Stripe-hosted UI such as Payment Element / Checkout Elements.
- Card data must tokenize directly through Stripe.
- PAN/CVC must never touch Asymmetric servers, logs, database, Gitea, GitHub, or app state.
- The success page must only show success after the server/payment state supports it.

### 4.3 Current donate API is authenticated

`apps/donor/app/api/donate/route.ts` is correctly a thin re-export to `@asym/api/donate`.

`packages/api/src/donate/index.ts` currently uses authenticated context and allows roles `donor`, `admin`, `staff`, and `super_admin`. It calls `begin_donation_saga` with `ctx.profileId` and `ctx.userId`.

That means true guest checkout is not just a UI change. It requires a new or extended server-side path that can create/match a donor record during checkout before calling the donation saga.

### 4.4 Current donation saga is profile-based

`begin_donation_saga` currently:

- requires tenant/profile/user context
- finds or creates a donor by `tenant_id + profile_id`
- creates a donation record with `tenant_id`, `donor_id`, `missionary_id`, `fund_id`, amount, currency, and processing status
- creates an outbox event for payment processing

This is a good foundation, but guest checkout needs the saga to support either:

1. a created/matched profile/user before the saga starts, or
2. a donor-based guest variant where `donor_id` is server-resolved before creating the donation.

Preferred implementation:

> Keep the saga server-only and extend it so the server can pass a resolved `donor_id` for guest checkout after it creates/matches the donor record. Do not let the client choose `donor_id`.

### 4.5 Current schema already allows important pieces

Current schema includes:

- `profiles` with name/email/role/tenant
- `donors` with contact fields, address JSON, giving preferences, Stripe customer ID, and gift summary fields
- `donations` with nullable `donor_id`, designation fields, amount, status, payment method, Stripe payment intent ID, and source-related fields
- `donor_pledges`, `donor_activities`, and gift summary tables

The nullable `donations.donor_id` is useful for truly unknown offline gifts. Do not force fake donor records if no donor identity exists.

### 4.6 Contributions Hub is already part of Mission Control direction

Mission Control includes a `Contributions Hub` described as:

- all contributions feed
- offline entry
- Stripe
- ACH
- tie-out

That is the correct home for offline gift entry and batch workflows.

### 4.7 Data access boundary must be preserved

Repo guidance says business database logic belongs in `packages/api/src/*`, and app API routes should stay as thin re-exports.

Implementation must follow that pattern:

- Put guest donation and offline contribution business logic in `packages/api/src/*`.
- Keep `apps/*/app/api/**/route.ts` thin.
- Do not move business Supabase logic into app route handlers.
- Use server-side API contracts and typed DTOs.

---

## 5. Online checkout behavior

### 5.1 Flow

Online donor flow:

1. Donor selects amount, frequency, fund/missionary/designation, and optional fee coverage.
2. Donor enters name and email.
3. Donor provides payment/billing details through Stripe-hosted UI.
4. Donor may check: **“Keep my name anonymous from the missionary/public view.”**
5. Server validates amount, designation, tenant, frequency, dates, and anonymity flags.
6. Server creates or matches donor record.
7. Server creates claimable donor portal access if needed.
8. Server creates donation/payment intent/outbox record.
9. Client confirms payment through Stripe.
10. Server/webhook updates final payment status.
11. Receipt is sent only after the appropriate payment state.
12. Donor can later access giving history through magic link or account activation.

### 5.2 Required fields

For online checkout, require:

- `first_name`
- `last_name`
- `email`
- processor-required billing/payment details
- `amount`
- `currency`
- `fund_id` or `missionary_id`
- `frequency`
- idempotency key

For card payments, postal code/address requirements can follow Stripe/payment-method settings and fraud policy.

For ACH/bank payments, collect whatever authorization and identity details are required by Stripe Financial Connections / ACH mandate flow.

### 5.3 Optional fields

Optional:

- phone
- full mailing address if not required by payment method
- donor note/memo
- organization/church name
- “give as organization” toggle
- donor default communication preferences
- default anonymity preference for future gifts

### 5.4 Online anonymity checkbox

Checkout should include a checkbox:

> Keep my name anonymous from the missionary/public view.

Helper text:

> We’ll still keep your information for receipts, payment processing, and administrative records, but your name will not be shown to the missionary or public giving views.

When checked:

- admin/finance users still see donor identity
- donor sees the gift in their giving history
- missionary views show “Anonymous donor”
- public views show “Anonymous donor”
- donor identity is not exposed through API responses to missionary/public surfaces
- anonymity preference is stored on the contribution itself

### 5.5 Online account creation

The donor should not be forced to create a password.

Preferred behavior:

- If the email matches an existing donor in the tenant, attach the gift to that donor record.
- If no donor exists, create a new donor record.
- Create or link a claimable donor portal identity using Supabase Auth/magic-link flow.
- Do not expose whether the email already existed.
- Send receipt to the provided email.
- Dashboard access requires email verification/magic link.

Important:

> “Account created behind the scenes” should mean claimable donor access and CRM donor record creation, not surprise password creation.

---

## 6. Offline contribution behavior

Offline gifts are entered through Contributions Hub.

### 6.1 Known donor offline gift

Use this when staff has donor information.

Examples:

- check with name/address
- bank transfer with donor identity
- cash envelope with name
- known donor hands cash/check to staff

Flow:

1. Staff searches existing donor.
2. Staff selects donor or creates donor record.
3. Staff enters gift details.
4. Staff selects designation/fund/missionary.
5. Staff chooses whether the gift is anonymous to missionary/public views.
6. System stores donation with `donor_id`.
7. System records receipt eligibility.
8. System updates donor history and contribution totals.
9. System audits who entered the gift.

If donor requests anonymity:

- record the donor normally
- set `anonymous_to_recipient = true`
- set `anonymous_to_public = true` if public-facing views exist
- missionary/public views show “Anonymous donor”
- admin/finance still sees donor identity

### 6.2 Truly unknown offline gift

Use this only when donor identity is unavailable.

Examples:

- anonymous cash
- offering box cash with no envelope/name
- gift where donor intentionally gave no identifying information and no receipt can be issued

Do not make staff invent fake donor data.

Flow:

1. Staff selects: **Donor unknown / anonymous offline gift**.
2. Staff enters gift amount, date, method, batch/deposit info, and designation.
3. `donor_id` remains null.
4. System sets donor identity status to unknown.
5. System records the source-owned `unknown_offline` identity fact and asks Phase 7 to derive the reason-carrying receipt eligibility; it does not create a mutable contribution-owned receipt status.
6. Missionary/public views show “Anonymous donor”.
7. Admin/finance can still see contribution details, batch, source, and internal notes.

Suggested admin helper text:

> Use this only when donor identity is truly unavailable. If donor information is known, attach the gift to the donor record and mark it anonymous to recipient if requested.

### 6.3 Offline gift validation

Offline gift entry should require:

- tenant
- amount
- currency
- received date
- source/method: check, cash, ACH/manual, wire, stock, other
- designation/fund/missionary
- batch/deposit reference when applicable
- entered-by user
- the source facts Phase 7 requires to derive receipt eligibility and its reason
- anonymity flags

For checks, store check number/reference if needed, but do not store unnecessary bank account details.

For cash, require batch/deposit controls strong enough for finance reconciliation.

---

## 7. Visibility rules

### 7.1 Admin and finance views

Admins/finance users can see donor identity when it exists.

They need access for:

- receipts
- year-end statements
- reconciliation
- refunds
- chargebacks
- donor support
- duplicate cleanup
- fraud review
- audit history
- legal/financial recordkeeping

Admin/finance views should clearly display anonymity state:

- `Not anonymous`
- `Anonymous to missionary/public`
- `Unknown donor`

### 7.2 Missionary-facing views

Missionaries should see only what they need.

For non-anonymous known gifts, missionary views may show policy-approved donor display data.

For anonymous gifts, missionary views must show:

> Anonymous donor

Missionary views must not show:

- donor name
- donor email
- donor address
- phone
- payment IDs
- processor IDs
- internal notes
- admin receipt notes
- donor account ID/profile ID
- anything that can identify the donor indirectly

Missionary views may show, depending on policy:

- amount
- date
- designation
- frequency/recurring status
- general note only if staff/donor marked it shareable

### 7.3 Public/campaign views

Public campaign pages should use the same redaction rules as missionary views or stricter.

If `anonymous_to_public` is true, show:

> Anonymous donor

Do not expose donor identity in HTML, JSON payloads, hydration data, metadata, analytics events, or API responses.

### 7.4 Donor dashboard

The donor should see their own gift.

If the gift was marked anonymous, show a small status:

> Shown as anonymous to missionary/public views.

Do not imply the organization does not retain records.

---

## 8. Recommended data model

Use explicit fields. Do not rely on notes, display names, or fake donor rows.

### 8.1 Donations / contributions

Add or confirm fields similar to:

```sql
ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS donor_identity_status TEXT NOT NULL DEFAULT 'known',
  ADD COLUMN IF NOT EXISTS anonymous_to_recipient BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS anonymous_to_public BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS donor_display_name_snapshot TEXT,
  ADD COLUMN IF NOT EXISTS entered_by_user_id UUID,
  ADD COLUMN IF NOT EXISTS anonymity_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS anonymity_requested_source TEXT,
  ADD COLUMN IF NOT EXISTS anonymity_note TEXT;
```

Suggested values:

```text
donor_identity_status:
  known
  unknown_offline

anonymity_requested_source:
  online_checkout
  donor_request
  admin_entry
  import
  correction
```

Constraint guidance:

```sql
CHECK (donor_identity_status IN ('known', 'unknown_offline'));

CHECK (
  (donor_identity_status = 'unknown_offline' AND donor_id IS NULL)
  OR
  (donor_identity_status = 'known' AND donor_id IS NOT NULL)
);
```

If the current system needs to support known gifts without donor records temporarily, use a migration-safe transitional constraint, but the target model should be explicit.

### 8.2 Donor-level defaults

Donor records may have default preferences, but these must not replace contribution-level flags.

Store donor defaults in `donors.giving_preferences`, for example:

```json
{
  "defaultAnonymousToRecipient": false,
  "defaultAnonymousToPublic": false,
  "receiptDelivery": "email"
}
```

At checkout, copy the chosen value onto the contribution.

Reason:

> Anonymity is a per-gift decision. A later donor preference change should not silently rewrite historical gift visibility.

### 8.3 Offline unknown donors

Preferred model:

- use `donations.donor_id = null`
- set `donor_identity_status = 'unknown_offline'`
- do not create fake donor rows

Fallback only if a downstream system absolutely requires `donor_id`:

- create one system donor per tenant named `Unknown / Anonymous Donor`
- set `donors.is_system_anonymous = true`
- never use fake email, fake phone, or fake address
- keep this system donor out of donor engagement and receipting workflows

Preferred: avoid the fallback unless forced.

### 8.4 Receipt-eligible donor facts

Checkout captures the receipt-eligible donor inputs needed by the owning source
domain. After payment reaches the required source state, Phase 7 freezes the
legal donor and receipt facts in its immutable authority and supplies one typed
Facts Package to Phase 18. These values do not become mutable `donations`
columns, a render snapshot, or delivery state.

Reason:

- donor name/address/email can change later
- receipts and audit records need historical accuracy
- year-end statements need stable source data

Protected source facts are not exposed to missionary/public views. Phase 18
renders only its purpose-scoped Approved Data View, and authorized copies stream
the same stored exact bytes.

---

## 9. API contracts

### 9.1 Online guest checkout endpoint

Add or extend a server-side API under `packages/api/src/*`.

Possible route:

```text
POST /api/donate/guest
```

or extend existing:

```text
POST /api/donate
```

with explicit support for guest mode.

The route handler under `apps/donor/app/api/**/route.ts` must remain a thin re-export.

Request shape:

```ts
type GuestDonationRequest = {
  // tenant is resolved server-side from host/route/session context and is
  // never accepted from the client (see server responsibilities, step 1)
  amount: number;
  currency: "usd";
  frequency: "one-time" | "monthly";
  missionaryId?: string;
  fundId?: string;
  coverFees: boolean;
  donor: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    billingAddress?: AddressInput;
  };
  anonymity: {
    anonymousToRecipient: boolean;
    anonymousToPublic?: boolean;
  };
  receipt: {
    email: string;
    name: string;
    address?: AddressInput;
  };
  idempotencyKey: string;
};
```

Server responsibilities:

1. Resolve tenant server-side.
2. Validate amount and currency.
3. Validate one valid designation: missionary or fund.
4. Validate donor name/email.
5. Normalize email.
6. Create or match donor record by tenant + normalized email.
7. Create/link claimable donor portal access.
8. Capture receipt-eligible donor inputs and, after source-confirmed success,
   freeze them through the Phase 7 facts authority for Phase 18.
9. Store anonymity flags on the contribution.
10. Create Stripe customer/payment intent through server-only Stripe client.
11. Use idempotency key.
12. Return only safe client data: `clientSecret`, `donationId`, `publishableKey`, status.
13. Never return donor existence/match details to the client.

### 9.2 Authenticated donor checkout

If donor is signed in:

- use authenticated donor/profile context
- prefill donor details
- allow updates where policy permits
- still store contribution-level anonymity flags
- still require server-authoritative amount/designation/payment state

### 9.3 Offline contribution endpoint

Possible route:

```text
POST /api/contributions/offline
```

Allowed roles:

- finance
- admin
- super_admin
- other approved staff roles by policy

Request shape:

```ts
type OfflineContributionRequest =
  | {
      donorMode: "known";
      // exactly one identity path is required: attach an existing donor via
      // donorId, or create one inline via donorInput — never neither, never both
      donorId?: string;
      donorInput?: DonorInput;
      amount: number;
      currency: "usd";
      receivedDate: string;
      method: "check" | "cash" | "manual_ach" | "wire" | "stock" | "other";
      designation: {
        missionaryId?: string;
        fundId?: string;
      };
      anonymousToRecipient: boolean;
      anonymousToPublic?: boolean;
      receiptRequested: boolean;
      batchId?: string;
      referenceNumber?: string;
      internalNote?: string;
    }
  | {
      donorMode: "unknown_offline";
      amount: number;
      currency: "usd";
      receivedDate: string;
      method: "cash" | "other";
      designation: {
        missionaryId?: string;
        fundId?: string;
      };
      batchId?: string;
      referenceNumber?: string;
      internalNote?: string;
    };
```

Server responsibilities:

- verify staff permission
- resolve tenant
- validate designation
- prevent fake donor data
- set `donor_id = null` for unknown offline gifts
- provide the exact source facts Phase 7 requires to derive receipt eligibility without creating contribution-owned receipt state
- audit who entered/edited the gift
- update contribution/donor totals where applicable
- keep donor identity out of missionary/public projections when anonymous

---

## 10. Payment processing best practices

### 10.1 Card data

Use Stripe-hosted UI components.

Do not store or process raw:

- full card number
- CVC
- un-tokenized card data
- bank credentials

The current raw-looking checkout inputs must be replaced before real payment launch.

### 10.2 Server-authoritative money state

The client cannot decide that a gift succeeded.

The server/payment processor state must decide:

- `processing`
- `completed`
- `failed`
- `refunded`
- `disputed`

For ACH/bank payments, the donor-facing confirmation should distinguish authorization from settlement.

Good language:

> Bank transfer started. Processing — not yet collected.

Bad language:

> Donation complete.

when ACH has only been authorized but not settled.

### 10.3 Idempotency

All online and offline contribution creation must use idempotency where appropriate.

The existing donation saga already uses idempotency. Preserve and extend that pattern.

### 10.4 Metadata

Stripe metadata can include non-sensitive IDs needed for reconciliation:

- donation ID
- donor ID
- tenant ID
- fund ID
- missionary ID

Do not put raw PII in metadata unless needed and approved.

---

## 11. Receipt and recordkeeping rules

### 11.1 Online gifts

Online gifts with sufficient legal-donor facts may become receipt eligible only
under the Phase 7 source contract.

Receipt should be sent after appropriate payment status:

- card: after payment succeeds
- ACH/bank: only after processor-confirmed success; initiation/processing is not
  received and produces no official successful-payment receipt
- recurring: after each successful installment

Phase 18 creates and stores the exact canonical artifact. Phase 17 delivers that
artifact and records the independent send outcome. A delivery failure never
changes the gift, receipt facts/issuance, or artifact currentness.

### 11.2 Offline known gifts

Known offline gifts can be receipted if staff has sufficient donor information.

If the donor requests anonymity, the receipt still uses real donor identity. Anonymity only affects missionary/public visibility.

### 11.3 Offline unknown gifts

Unknown offline gifts are not receiptable unless donor information is later provided.

The Phase 7 eligibility authority records a reason-carrying `not_receiptable`
outcome. It is not a mutable contribution delivery/status field.

### 11.4 Year-end statements

Year-end statements should include all receiptable gifts tied to known donor records.

Unknown offline gifts should not appear in a donor’s year-end statement unless later matched to a donor.

### 11.5 Receipt content review

Receipt templates and year-end statements should be reviewed by finance/legal before production use.

For U.S. charitable gifts, receipt language often needs to address whether goods or services were provided in exchange for the gift. Do not let an agent invent final legal language without review.

---

## 12. Anonymity enforcement

### 12.1 Do not enforce anonymity only in React

Anonymity must be enforced in server-side DTOs, SQL views, or API projection logic.

Missionary/public endpoints should return already-redacted data.

Bad:

```ts
return donationWithDonor;
```

then hide donor name in the UI.

Good:

```ts
return {
  amount,
  date,
  donorDisplayName: donation.anonymous_to_recipient
    ? "Anonymous donor"
    : donor.display_name,
};
```

and omit donor email/address/profile ID entirely.

### 12.2 Redaction must apply to all outputs

Apply redaction to:

- missionary dashboard
- public campaign pages
- donor lists visible outside admin/finance
- exports available to missionaries
- notification/email templates sent to missionaries
- webhooks or automations that leave admin context
- analytics events
- hydrated page props / JSON payloads

### 12.3 Admin override and audit

Changing anonymity after a gift is created should require admin/finance permission and write an audit log:

- who changed it
- previous value
- new value
- reason/source
- timestamp

---

## 13. UX copy

### 13.1 Checkout anonymity checkbox

Label:

> Keep my name anonymous from the missionary/public view.

Helper:

> We’ll still keep your information for receipts, payment processing, and administrative records, but your name will not be shown to the missionary or public giving views.

### 13.2 Guest checkout account language

> No account needed to give. We’ll email your receipt and create secure access to your giving history.

### 13.3 Offline unknown gift option

Label:

> Donor unknown / anonymous offline gift

Helper:

> Use this only when donor identity is truly unavailable. If the donor is known, attach the gift to the donor record and mark it anonymous to recipient if requested.

### 13.4 Admin gift anonymity toggle

Label:

> Show this gift as anonymous to the missionary/public view.

Helper:

> Finance and admins will still see the donor record for receipts, reconciliation, and compliance.

### 13.5 Donor dashboard display

> This gift is shown as anonymous to the missionary/public view.

---

## 14. Permissions

### 14.1 Admin/finance

Can:

- see real donor identity when it exists
- enter offline gifts
- mark known gifts anonymous to recipient/public
- edit anonymity flags with audit
- issue receipts/statements
- reconcile batches
- handle refunds/disputes

### 14.2 Missionary

Can:

- see gift amount/date/designation where policy allows
- see donor name only when not anonymous
- never see hidden donor contact/payment/admin fields

### 14.3 Donor

Can:

- see their own gift history
- see whether each gift is anonymous to recipient/public
- set default anonymity preference for future gifts
- request corrections through support/admin flow

### 14.4 Public

Can:

- see public campaign donor display only when allowed
- see “Anonymous donor” when anonymous
- never receive raw donor identifiers

---

## 15. Build instructions for AI/dev agents

When implementing this, follow these rules:

1. Preserve the repo data-access boundary.
2. Put business logic in `packages/api/src/*`.
3. Keep app route handlers as thin re-exports.
4. Do not add raw Supabase business logic inside app routes.
5. Use Zod schemas before mutation.
6. Use server-authoritative amount/designation/payment state.
7. Do not let client-supplied donor IDs, tenant IDs, or payment status decide truth.
8. Do not store card number, CVC, or un-tokenized bank data.
9. Use Stripe Elements/Checkout Elements/Payment Element for payment collection.
10. Add contribution-level anonymity fields, not only donor-level defaults.
11. Support `donor_id = null` for truly unknown offline gifts.
12. Do not create fake donor rows for unknown cash.
13. Freeze receipt-eligible donor identity and gift facts in the Phase 7 source
    authority after source-confirmed success; use the Phase 18 service for the
    exact artifact and Phase 17 for delivery.
14. Redact donor identity server-side for missionary/public APIs.
15. Add audit logs for anonymity changes and offline entry.
16. Add tests for admin, donor, missionary, and public views.
17. Add E2E coverage for guest checkout and anonymous gift display.
18. Treat money, tenant, RLS, auth, receipts, and payment changes as protected areas requiring human review.

---

## 16. Acceptance criteria

### 16.1 Online guest giving

- [ ] Donor can complete checkout without signing in first.
- [ ] Checkout requires first name, last name, email, and payment/billing details needed by payment method.
- [ ] Checkout creates or matches a donor record server-side.
- [ ] Donor can later access giving history through verified email/magic link.
- [ ] Existing donor email matching does not leak account existence.
- [ ] Payment success is not simulated and is not client-authoritative.
- [ ] Card/ACH collection uses Stripe-hosted/tokenized UI.
- [ ] Server validates amount, currency, tenant, and designation.
- [ ] Donation is idempotent.
- [ ] Receipt is sent according to payment status.

### 16.2 Online anonymous-to-recipient gift

- [ ] Donor can check anonymity during checkout.
- [ ] Donation stores anonymity flags on the contribution.
- [ ] Admin/finance can see the donor.
- [ ] Missionary/public views show “Anonymous donor.”
- [ ] Missionary/public API payloads do not include hidden donor identifiers.
- [ ] Donor dashboard shows the gift and its anonymity status.

### 16.3 Offline known gift

- [ ] Staff can attach gift to existing donor.
- [ ] Staff can create donor if needed.
- [ ] Staff can mark gift anonymous to recipient/public.
- [ ] Admin/finance can still see donor.
- [ ] Missionary/public views respect anonymity.
- [ ] Receipt eligibility is recorded.
- [ ] Entry is audited.

### 16.4 Offline unknown gift

- [ ] Staff can intentionally select unknown/anonymous offline donor.
- [ ] No fake name/email is required.
- [ ] `donor_id` remains null or uses an explicit system-anonymous fallback only if absolutely required.
- [ ] Phase 7 derives `not_receiptable` with an explicit unknown-donor reason from the source-owned `unknown_offline` fact; the contribution owns no receipt/send status.
- [ ] Gift can still be designated and reconciled.
- [ ] Missionary/public views show “Anonymous donor.”
- [ ] Admin/finance can see batch/source/internal notes.

### 16.5 Security and privacy

- [ ] No raw card/PAN/CVC fields ship in production checkout.
- [ ] No donor PII leaks in missionary/public responses when anonymous.
- [ ] No donor PII leaks through page props, analytics, exports, emails, or logs.
- [ ] Anonymity changes are audited.
- [ ] Protected-area classifier flags money/auth/RLS/tenant/payment/receipt changes.
- [ ] E2E covers anonymous display and admin visibility.

---

## 17. Test plan

### Unit tests

- Zod schema accepts guest donor info and anonymity flags.
- Zod schema rejects missing online name/email.
- Zod schema accepts unknown offline donor mode without name/email.
- Zod schema rejects fake/partial unknown donor modes.
- Redaction helper returns anonymous display name and omits donor identity.
- Admin projection includes donor identity.
- Missionary projection redacts donor identity.
- Phase 7 receipt eligibility for an unknown offline gift is `not_receiptable` with the expected reason, and the contribution stores no duplicate receipt state.
- Contribution-level anonymity overrides donor default.

### Integration tests

- Guest online donation creates/matches donor record.
- Guest online donation creates contribution with anonymity flags.
- Existing donor email match does not leak account existence.
- Offline known gift creates contribution with donor ID.
- Offline unknown gift creates contribution with null donor ID.
- Missionary API returns redacted payload for anonymous gift.
- Admin API returns full payload for same gift.
- Donor dashboard returns own gift and anonymity status.

### E2E tests

- Guest donor gives without signing in.
- Donor checks anonymous box.
- Payment confirmation uses real server/payment state, not simulated client success.
- Admin sees donor identity.
- Missionary sees anonymous donor.
- Unknown offline cash gift can be entered without fake donor data.
- Receipt is not sent for unknown offline gift.
- Known offline anonymous gift is receiptable but redacted from missionary.

---

## 18. MVP recommendation

For the Platform MVP, the shortest real value path is:

1. Fix/guard demo RLS and verify tenant isolation.
2. Replace simulated checkout with server-confirmed donation flow.
3. Add guest donor record creation/matching.
4. Add anonymous-to-recipient/public flags.
5. Add offline known/unknown gift entry in Contributions Hub.
6. Integrate Phase 7 receipt facts with one Phase 18 generated artifact and one
   Phase 17 governed delivery; add no contribution-owned receipt/send status.
7. Add missionary/public redacted views.
8. Add admin/finance full-visibility views.
9. Add tests and QA gates around money/tenant/auth/RLS.

The first demoable value moment:

> A donor gives online without pre-creating an account, receives a receipt, the gift is tied to a donor record, and if the donor chose anonymity the missionary sees “Anonymous donor” while finance/admins still see the real donor.

---

## 19. Open questions for Conrad/Blake

1. Should anonymity apply to missionary-only views, or missionary + public campaign views by default?
2. Should donor default anonymity be offered in donor settings, or only per gift for MVP?
3. Should offline unknown gifts support cash only, or also other methods?
4. Should receipt mailing address be required for all online gifts, or only where payment method/policy requires it?
5. Should churches/organizations be supported in MVP checkout, or later?
6. Should donor notes/memos be shareable with missionaries, and if so should anonymous gifts suppress those notes by default?
7. What staff roles besides finance/admin can enter offline gifts?
8. What is the exact receipt language approved by finance/legal?

---

## 20. Final plain-language decision

A donor can give without logging in first.

For online gifts, they still need to provide name, email, and payment/billing information as part of checkout. The system creates or matches the donor record behind the scenes and gives them claimable access to their giving history.

A donor can choose to be anonymous to the missionary/public views. That does not hide the donor from admins or finance, because the organization still needs the information for payment processing, receipts, donor support, reconciliation, refunds, chargebacks, and required records.

For offline gifts, if the donor is known, record the donor and optionally mark the gift anonymous to recipient/public. If the donor is truly unknown, enter the gift as an unknown offline contribution without fake donor data and mark it not receiptable unless donor information is later provided.
