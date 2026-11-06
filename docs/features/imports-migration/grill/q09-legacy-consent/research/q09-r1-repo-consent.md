# Q9 r1: Repository evidence on legacy consent and suppression (F12)

Read-only research on `t3/sync-with-github` (develop 629cb71dc). Accessed 2026-11-02. There were no database connections and no GitHub writes.

**Labels.** **ratified**: accepted PRD, ADR, decision log or roadmap text. **published**: OpenSpec contract. **implemented**: code or migration. **proposed**: unratified research clauses; my inferences are marked _(inference)_.

## 1. Asym's consent model

**Today's floor is negative-only.** Phase 3 makes the booleans `do_not_email` and `do_not_contact`, plus `email_suppressions`, "the floor". A "per-channel/per-topic consent preference center + SMS/mail/phone channels" is deferred (`phase-03-…md:322`, ratified). Its interface is `resolveConsent({channel: "email"|"export"|"generated_document"})` and returns `ok|do_not_email|do_not_contact|suppressed` (`:199-207`). The Phase 17 amendment says "`do_not_contact` remains the absolute contact floor and `email_suppressions` remains the email suppression authority". Provider remediation "never silently restores product consent" (`:401-402`, `:415-422`, ratified).

**Send-time and suppression.** Phase 6 A8 freezes the gate's verdict at send time, and A9 keeps one suppression source of truth with `source` provenance, reserving a `mailchimp` value, plus an `isExportEligible` contract (`phase-06-…md:154-155`, `:250`, ratified). ADR-0220:16 adds: "Do-not-contact and applicable channel restrictions fail closed, including receipts … Removing a provider suppression cannot automatically restore product consent" (ratified).

**Target model: purpose × channel.** Phase 12 makes purpose a mandatory resolver dimension, with "the consent/legal-basis axis AND-composed as its own floor … Channel × purpose contactability consent (readable ≠ contactable) unifies the existing `consent.ts` gate … (no 'override opt-in' for restricted/marketing)" (`phase-12-…md:1654`, ratified). Issue #680 is open and unbuilt.

**Message classes.** Phase 17 wants "required service messages structurally separated from marketing" (`phase-17-…md:159`). It calls the current caller-selected `transactional|marketing` "too coarse"; the class is to be derived from the producer contract (`:304`). Optional subscribed or marketing mail needs RFC 8058 `List-Unsubscribe` and a visible unsubscribe (`:2157-2160`) (ratified).

**How positive consent is obtained (ratified, per owner):**

- **Phase 28 newsletter.** "Deliberate participation in one named ministry newsletter" (`CONTEXT.md:2256-2263`). Guests confirm by email within 168 hours (`phase-28-…md:10`). A verified-address Join skips the second email where permitted (`CONTEXT.md:2265-2272`; `:689`). In effect this is double opt-in except on the verified path.
- **Phase 25 Ministry Update emails.** "Email MUST NOT be newly enabled without owner-qualified prior permission" (`phase-25-…/contracts/experience.md:49`).
- **SMS.** Affirmative evidence bound to the exact phone revision and purpose (`CONTEXT.md:3303-3307`).

**Legal bases.** Code and guides name only CAN-SPAM's "transactional or relationship" carve-out (`consent.ts:11-13`; `resend-integration.md:198`). Phases 4 and 5 cite CAN-SPAM, GDPR and AFP. **CASL appears in no owner document**, only in a vendored skill reference (`.agents/skills/email-best-practices/references/compliance.md:37-47`), which omits the registered-charity fundraising exemption. **Implied consent is not modelled anywhere**: neither CASL's two-year donation relationship nor a CAN-SPAM-style existing business relationship. The gate has no jurisdiction input and no consent expiry.

**Withdrawal** (ratified). An RFC 8058 reduction-only POST with an inert GET (`experience.md:59`). A new Off fences an older uncertain On (`:53`). SMS STOP is a hard suppression (`CONTEXT.md:3315-3319`). A merge keeps the "most-restrictive" consent (`phase-04-…md:185`).

## 2. What C10 actually says

- **Literal source** (`roadmap.md:4381`, ratified): "**SMS and directory import scope.** Historic phones and provider subscription flags remain evidence to classify, not automatic SMS consent … preserves adverse history and stays outward-effect-dark." It is literally about SMS.
- **Generalization.** C10 (`decision-log.md:367`) extends it to all channels via SMS-W03 (`governed-sms.md:112`, published): "Gifts, email opt-in, imported numbers, relationship labels, prior messages, HELP or START **alone** MUST NOT grant consent. Current do-not-contact and withdrawal MUST remain hard floors." Support: ADR-0170:128-129 ("contact import alone provide no consent"); Phase 28 clause 12 ("No … imported flag manufactures consent", `phase-28-…md:687`); Phase 28 M12 ("provider contacts, imports … never create membership", `communications.md:407`).

**Reading.** "Alone", "not automatic" and "evidence to classify" forbid treating an imported flag as consent by itself. They do not forbid importing the evidence, which Q1 cl.1(a) and Q3 cl.3 (`decision-log.md:87`, "evidence only, never consent") require.

**Is there an owner path from evidence to consent? None is qualified.** The closest texts:

- **Reviewed contact-list intake** (`CONTEXT.md:2381-2390`, ratified, Phase 28 D17 only): "Importing records a source assertion and its actual accepted outcome; it does not … grant contact permission, share contacts, enroll recipients … _Avoid_: … spreadsheet status as consent." It is not a general consent-evidence path.
- **Phase 25 R07 C10** (ratified per `phase-25-…/decision-log.md:373`; text in `research/phase25-r07-adversarial-review.md:471`): "Migration may adopt only semantically mapped, evidence-backed choices; preserve valid opt-outs/contact floors and never manufacture opt-in from defaults, a donation, follow … Publish the adoption disposition before activation." The same idea appears at `experience.md:49`.
- **D17 IC17-08** (`d17-evidence/identity-consent-integrity.md:234`, proposed evidence): "Positive preference migration requires a separately qualified exact recipient/contact/source/list-purpose adoption contract; this contact-intake profile has no such activation."
- **SMS-AT-28** (`governed-sms/specification.md:165`): "incomplete legacy evidence remains unconsented rather than silently repaired". _(Inference: complete evidence could be honoured by the owner.)_ SMS-W11 is "Consent-preserving migration" (`governed-sms.md:140-144`, published).
- **Phase 28 clause 18** (`phase-28-…md:699`): "never fabricate … consent … backfill only justified meaning."

**Re-permission or double opt-in campaigns for imported lists:** no owner text exists. The Phase 28 signup confirmation is the only confirmation mechanism, and it covers new Joins only. Phase 28 M01 says new signup entries are "not inferred On from … legacy contacts" (`communications.md:121`).

## 3. Importing suppression and adverse evidence

| Rule                                                                                                                                                                             | Source                                                    | Label     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | --------- |
| Suppression evidence is in the Minimum Switch Kit; "Parties, contacts and suppression evidence commit and reconcile first"                                                       | Q1 cl.1(a), cl.4 (`decision-log.md:35,38`)                | ratified  |
| Backfills carry "adverse contact facts (unsubscribe, do-not-contact, deceased, erasure) applied only to restrict"; never restore supporter details                               | Q1 cl.6 (`:40`); imports `CONTEXT.md:132`                 | ratified  |
| Opt-outs, do-not-contact and erasure recorded in Asym after the boundary stay "pending in legacy systems" until executed in SiteStacker, processors and missionary mail accounts | Q1 cl.12 (`:46`)                                          | ratified  |
| Erasure, do-not-contact and deceased apply first inside a backfill                                                                                                               | Q7 cl.7 (`:300`)                                          | ratified  |
| Do-not-contact and deceased donors get nothing from Asym; bounced or missing email goes to the mail-or-call list                                                                 | Q8 cl.5 (`:332-335`)                                      | ratified  |
| Provider unsubscribe, bounce and complaint land in the existing owner; "Apply the stricter applicable suppression"; "Reconnect must not reset suppressions"                      | `roadmap.md:4530,4570`                                    | ratified  |
| A newsletter-X unsubscribe is not an all-channel prohibition; the restriction is scoped                                                                                          | D17 C08; REQ28-R22 (`missionary-workspace-depth.md:4350`) | published |

**P6 and the "atomic receipt".** P6 is **Phase 6, the Shared Communication Event Model**, owner of suppression, eligibility, intent, dispatch and history. The "receipt" is a durable authority receipt from the contact/P6 owner, not a tax receipt. D17 C08 (`phase28-d17-contact-import-adversarial-review.md:235-249`, ratified): "An affected row is accepted only when the qualified contact/P6 owner atomically accepts the exact scoped restriction/evidence and returns durable authority consumed by the actual recipient and D15 gates; otherwise that row remains blocked. The receipt binds exact Tenant, preparation/recipient authority, contact revision, source occurrence, channel/list-purpose and provenance." IC17-09 (`identity-consent-integrity.md:244-263`, proposed) applies it generally, with no uploader "global suppression write authority".

**Not yet available:** deceased is a planned Phase 9 lifecycle chip with no field in code (`phase-09-…md:420`). DSAR and erasure are a reserved, unbuilt seam (`phase-03-…md:321`). Batch-origin suppression is required (`owner-constraints.md:386-388`) but not implemented.

## 4. Mailchimp and email providers

- **At the boundary.** Q1 cl.7 (`decision-log.md:41`, ratified) turns "organization Mailchimp sync" **Off at boundary** and classes "missionary-owned Mailchimp lists" as **Outside the ministry's control**.
- **Phase 32** (`roadmap.md:4506-4590`, ratified, unbuilt) owns the external bridge and organization campaigns:
  - "A supporter relationship alone does not authorize export" (`:4526`).
  - "internal segmentation is not recipient consent" (`:4552`).
  - "Identity, permission to view a contact, permission to export and marketing consent remain distinct" (`:4584`).
  - The audience and purpose catalog, and organization-level versus per-missionary provider accounts, are open (`:4613-4615`).
- **Phase 6** reserves only `mailchimp` provenance and `isExportEligible` (`phase-06-…md:55`).
- **SiteStacker behaviour.** Sync is one way, so Mailchimp-side unsubscribes never return. A contact deleted in Mailchimp "can NEVER resubscribe" through the API (`r10-gap-g4.md:83-84`).
- **Fresh export each time** (proposed). g4 F9 needs a fresh Mailchimp export "at **each** import of subscription-relevant data" (`:229`). q01-r1 item 3.2 lists subscribed, unsubscribed, cleaned, complained, archived and deleted members (`q01-r1…md:377`); freeze step 4 turns off sync and disconnects missionaries (`:388`).
- **Constant Contact** appears only as SiteStacker's per-list CSV target (`q01-r1:85`). There is no owner text; Phase 32's "Future provider seam" is provider-neutral (`roadmap.md:4534`).

## 5. SMS

- **Transport is structurally unavailable.** "Imports can preserve classified evidence but cannot manufacture consent or registration readiness" (ADR-0028:28-31, 40-41, ratified). "Imported evidence MUST NOT fabricate consent or readiness" (`outbound-communications.md:1153-1154`, published). Phase 43 adds "Imported phone lists, gifts, email subscriptions … do not establish SMS consent" (`roadmap.md:5598`; SMS-AT-05/28). Q8 cl.2: "No SMS in v1" (`decision-log.md:320`).
- **Phones import as contact data only.** D17 admits phone assertions (`owner-constraints.md:341-345`). Format, mobile capability, identity and consent "are different facts" (`specification.md:46`). q01-r1 E9 (proposed): "Exclude as consent." SiteStacker documents no SMS consent field.

## 6. Phase 28 D17 missionary self-import

- **Scope** (`owner-constraints.md:333-355`, ratified): name, email, phone and address only. It "never auto-merges, bulk-updates existing contacts, shares, verifies, enrolls, sends or grants consent" (`:349-350`).
- **C08:** no opt-in, subscription, permission to contact or **global suppression write**; "subscribed/active/donor" grants nothing; adverse rows need the atomic P6 receipt or stay blocked. **C09:** no messages, confirmations, invitations or receipts; later sending is "a separate deliberate currently authorized action" (`:251-256`).
- **Status.** Published as REQ28-R22 (`relationships.md:413-425`). Nothing is implemented; #2369 is open and blocks #2083, #2084 and #2348.

## 7. Current code (implemented)

- **The gate.** `evaluateEmailConsent` (`packages/api/src/email/consent.ts:176-231`) is an **opt-out gate**:
  - It always blocks for `do_not_contact` and for the hard suppressions `bounce`, `spam` and `manual` (`:15-20`, `:81-85`, `:198-212`).
  - It blocks only marketing for `do_not_email` and `unsubscribe` (`:21-22`, `:214-228`).
  - An unknown message type counts as marketing (`:186-187`).
  - **There is no positive-consent requirement. A marketing send to any address with no opt-out passes.**
- **Types.** `packages/email/types.ts` defines:
  - `EmailMessageType = "transactional"|"marketing"` (`:17`)
  - `SuppressionType = unsubscribe|bounce|spam|manual` (`:34`)
  - `SuppressionSource = resend|user|admin|import` (`:36`)
  - `TRANSACTIONAL_EMAIL_TYPES` (`:910-917`)
- **Storage.** `donors.do_not_contact` and `do_not_email` (`20260214090000_foundation_1_schema.sql:378-379`) are `internal` and non-exportable (`20261005050728_field_policy_foundation.sql:525-534`). `email_suppressions` is keyed by **email string**, unique on `(tenant_id, email, suppression_type)` (`20260402090000_…backfill.sql:86-95,143-144`), with free-text `source` and no Party, channel, purpose or contact-revision column.
- **Writers.** Only the Resend webhook writes `email_suppressions` (`email/webhooks/resend.ts:712-733`). Donors set their own flags (`donor-portal/index.ts:116-119`). **Nothing imports subscription flags or suppressions**; `SuppressionSource 'import'` has no writer.
- **Callers.** Receipts (`giving/receipts.ts:339`, transactional), correction notices and test send. There is **no production marketing or campaign sender**, and no consent-record, subscription, topic, SMS-consent or deceased storage.

## 8. What a ministry could send to imported donors on day one

This assumes current owner rules and that the owners are implemented.

| Message                                                     | Day one?                                                                                            | Basis                                       |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Tax receipts or acknowledgments for **imported** gifts      | **No**: "Recorded outside Asym"; the old system or the ministry documents them                      | Q4 cl.1-2 (`decision-log.md:112-125`)       |
| Thank-you, welcome or first-gift for imported or tail gifts | **No**                                                                                              | Q7 cl.1 (`:275-279`); C9                    |
| Receipts for **new** Asym gifts by imported donors          | **Yes** (transactional); blocked by do-not-contact or hard suppression                              | Q4 cl.1; `consent.ts:15-27`; ADR-0220:16    |
| Tail move campaign (invitation, reminders, end notice)      | **Yes**, as ratified "service messages", except do-not-contact or deceased (mail-or-call); O38 open | Q8 cl.2, cl.5 (`:317`, `:332-336`)          |
| Account, password or verification email                     | No logins are imported; only after the donor claims an account                                      | Q3 cl.9 (`:93`); D17 C09                    |
| Missionary newsletters (Phase 28)                           | **No**: needs a deliberate per-newsletter Join; imports never create membership                     | `phase-28-…md:687`; `communications.md:407` |
| Ministry Update post-emails (Phase 25)                      | **No**, unless an owner-qualified, evidence-backed adoption is published first (none exists)        | `experience.md:49`; P25 R07 C10             |
| Organization appeals or campaigns (Phase 32)                | **Undetermined**: the purpose catalog and consent basis are open; segmentation is not consent       | `roadmap.md:4552,4584,4615`; P12:1654       |
| Personal 1:1 missionary email (D15)                         | Within current permissions and restrictions; "personal account as consent exemption" is barred      | `CONTEXT.md:2360-2369`                      |
| SMS                                                         | **No**                                                                                              | ADR-0028; Q8 cl.2                           |

## What is settled

1. Imported opt-ins, flags, phones, gifts and labels are **evidence, never consent by themselves** (C10; SMS-W03; ADR-0170; Phase 28; D17 C08).
2. Consent and suppression evidence is a **Minimum Switch Kit** family that commits first; template columns are evidence only (Q1, Q3).
3. Adverse facts are **restrict-only**: applied first, never cleared by re-import, reconnect or provider remediation; merges keep the most restrictive.
4. Do-not-contact fails closed, receipts included; withdrawal is a hard floor.
5. Imports are outward-effect-dark.
6. Organization Mailchimp sync is Off at boundary; missionary lists are Outside control. No SMS in v1.

## What is open for the founder

1. **Adoption or re-permission.** Should well-evidenced legacy express consent be adoptable through an owner-qualified adoption contract? Examples: a SiteStacker newsletter subscription or a Mailchimp "subscribed" record with opt-in time, source or IP. Phase 25 R07 C10 and IC17-08 contemplate this. Or should every imported subscriber re-join through Phase 28 signup? Q3's "never consent" suggests the latter.
2. **Day-one basis for organization email to existing donors.** The options are an opt-out (CAN-SPAM-style) relationship basis, CASL implied consent from a gift in the last two years, the CASL registered-charity fundraising exemption _(external knowledge, unverified in the repo)_, or purpose-specific opt-in only. This needs a Phase 3 owner ruling and counsel, per US or Canadian ministry and recipient.
3. **F12 prerequisite.** Is a fresh provider suppression export, covering archived and deleted members, a hard go-live gate and required at every backfill? Must each connected missionary supply theirs?
4. **Scope of imported adverse evidence.** Should a SiteStacker list unsubscribe or a Mailchimp "cleaned" status be global or per list and purpose? D17 C08 says scoped, but there is no mapping table.
5. **Continued use of the organization's Mailchimp outside Asym** after go-live, and how Asym opt-outs propagate to it.

## Gaps and conflicts

1. **Q3 "never consent" versus Phase 25 R07 C10.** Q3 says "never consent", while Phase 25 R07 C10 says "Migration may adopt … evidence-backed choices" and SMS-AT-28 implies a complete-evidence path. Owner texts disagree on whether any adoption path exists.
2. **The live gate is opt-out, the owner target is positive purpose consent.** Owners target Phase 12 purpose×channel consent and Phase 28/25 positive participation. If imported donors land in `donors` before the Phase 12 axis exists, any future marketing sender would pass the gate for everyone not opted out. Today that is mitigated only by the absence of a marketing sender. _(inference)_
3. **No landing for scoped adverse evidence.** `email_suppressions` is keyed by email with no Party, channel, purpose or contact revision, which cannot hold the D17 C08 scoped receipt. Deceased, erasure and do-not-mail have no field. The `import` source has no provenance detail.
4. **Q1 cl.12's "pending in legacy systems" list omits the organization's Mailchimp audience.** Sync Off stops SiteStacker pushes, but the audience persists and may still be mailed.
5. **CASL is unmodelled.** There is no jurisdiction, expiry or implied-consent concept, and the skill reference omits the charity exemption. Canadian tenants are in scope.
6. **C10's cited line is SMS-scoped**; its all-channel reach rests on other sources.
7. **The move campaign's "service message" class is unconfirmed.** Its invitation offers a move to Asym, and Phase 17 derives class from the producer contract (`:304`). The Phase 17 owner and counsel should confirm. O38 remains open.
8. **No owner covers re-permission campaigns.** _(External knowledge: under CASL, an emailed consent request is itself a commercial electronic message.)_
