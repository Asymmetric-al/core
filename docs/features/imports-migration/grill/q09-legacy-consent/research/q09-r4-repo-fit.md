# Q9 r4: Repository fit of option B (legacy consent and suppression)

Read-only research on `t3/sync-with-github` (develop `629cb71dc`), 2026-11-02. No database access, no GitHub writes (gh `view`/`list` only), no tracker or code changes. One vendor page fetched (Mailchimp export help).

**Labels** (per `docs/ai/document-authority.md:42-52`): **ratified** (accepted PRD, ADR, decision log, roadmap); **published** (OpenSpec contract or issue/PR packet); **implemented** (code or migration on develop); **proposed** (research, issue body, unratified clause); _(inference)_ is mine.

## Citation check of r1

| r1 claim                                                                                                     | OK?         | Correction                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P03 `:322` defers the per-channel/topic preference center and SMS/mail/phone channels                        | Y           | —                                                                                                                                                                                                                                                                       |
| P03 `:401-402` do-not-contact is the floor; `email_suppressions` is the suppression authority                | Y           | The "never silently restores product consent" sentence is at `:421-423` (r1 said `:415-422`)                                                                                                                                                                            |
| P12 `:1654` purpose × channel contactability, no "override opt-in"                                           | Y           | —                                                                                                                                                                                                                                                                       |
| P28 `:687` clause 12 and `:699` clause 18                                                                    | Y           | —                                                                                                                                                                                                                                                                       |
| P28 "guests confirm within 168 hours (`phase-28-…md:10`)"                                                    | **N**       | 168 hours is clause 10 at `:683` and `communications.md:13`. PRD `:22` says "seven elapsed days"                                                                                                                                                                        |
| Root `CONTEXT.md:2256-2272`                                                                                  | Y           | —                                                                                                                                                                                                                                                                       |
| `communications.md:121` (M01) and `:407` (M12)                                                               | Y           | `:121` is about Page signup entries, not memberships. The M12 contract mirror is `openspec/contracts/missionary-workspace-depth.md:1230`                                                                                                                                |
| P25 `experience.md:49`; `phase25-r07-adversarial-review.md:471`; P25 `decision-log.md:373`                   | Y           | `:373` is the 7 September ratification of Q07 C01–C22, which covers R07 C10                                                                                                                                                                                             |
| `identity-consent-integrity.md:234` (IC17-08)                                                                | Y           | The clause spans `:231-237`. It is proposed research                                                                                                                                                                                                                    |
| `consent.ts:176-231`; `packages/email/types.ts:17,34,36,910`                                                 | Y           | —                                                                                                                                                                                                                                                                       |
| `email_suppressions` "with free-text source and no Party, channel, purpose…" (`…backfill.sql:86-95,143-144`) | **Partial** | r1 omits `group_id` → `email_suppression_groups` (`:75-84`, `:90`). The gate ignores it (`consent.ts:151-155`; #2350). The unique key `(tenant_id, email, suppression_type)` allows **one** unsubscribe row per address, so it cannot hold two list-scoped unsubscribes |
| "REQ28-R22 (`missionary-workspace-depth.md:4350`)"                                                           | Y           | The full path is `openspec/contracts/missionary-workspace-depth.md:4350-4362`                                                                                                                                                                                           |
| "Batch-origin suppression … `owner-constraints.md:386-388`"                                                  | **Misread** | The quote is accurate, but it means suppressing **automation event fan-out** from an import. It is not contact suppression                                                                                                                                              |
| "No production marketing or campaign sender"                                                                 | Y           | Unused `CampaignStatus`/`CampaignAudienceType` types exist (`types.ts:21-31`). `template-test-send.ts:423` can send the marketing class, but only to test recipients. A P28 newsletter sender is Ready (#2117, §12)                                                     |
| Q8 cl.5 `:332-335`                                                                                           | ~           | It is at `:333-335`                                                                                                                                                                                                                                                     |
| ADR-0220 `:16`; P04 `:185` "most-restrictive"                                                                | Y           | —                                                                                                                                                                                                                                                                       |

## 1. Phase 28 Join rule (what part 4 would amend)

**Exact clauses** (PRD ratified; the contracts are published under spec #2064, now closed):

- **PRD `:687` cl.12:** "Require positive newsletter participation as well as negative suppression checks. No raw provider call, authenticated profile shortcut, Page setting or imported flag manufactures consent." **PRD `:689` cl.13:** a Join "still requires a deliberate newsletter-specific action".
- **REQ28-M12** (`communications.md:407`; contract `:1230`): "provider contacts, imports, P25 requests and a negative-only suppression helper never create membership". Consent evidence "binds destination/revision, instruction, qualified proof reference, policy/disclosure revision and trusted acceptance" (`:416`; contract `:1239`).
- **REQ28-M42** (`:1184-1186`; contract `:1831`): "Inventory actual legacy flags … Do not infer consent, freshness, verification or send outcomes from historical labels."
- **Also:** REQ28-M15 (`:497`) "Resolve positive exact-purpose membership"; REQ28-M19 (`:599-600`) "gift, referral, stage, tag, new email or household membership never subscribes"; glossary (`CONTEXT.md:2256-2263`) "deliberate participation in one named ministry newsletter". REQ28-R22 (contract `:4356`) covers only the D17 self-import profile.

**Organization versus missionary newsletters.** Phase 28 newsletters are missionary-run. The "Newsletter send authorization" glossary entry is "The missionary's deliberate decision" (`CONTEXT.md:2295-2300`). The #2117 approval ruled that "newsletters.send goes to the workspace's missionary" (OQ3 comment, 2026-10-25). Organization administrators only set signup policy (REQ28-M02, contract `:2673-2697`). Organization-wide newsletters and campaigns belong to **Phase 32** ("campaign/newsletter ownership explicitly reserved by the Phase 17 contract", `roadmap.md:4540`, ratified), and the donor-side control is P25's "Emails from [organization]" topic (`experience.md:63-67`). `roadmap.md:4560` gives Phase 28 "native newsletter-list operations" generally. _(Inference: a SiteStacker **organization** list, meaning the Site Newsletter component (q01-r1 E1, `:256`), has no Phase 28 home. Only a list a named missionary runs maps to Phase 28. Organization lists need a Phase 32 topic, and no topic exists yet, §3.)_ No owner defines a stored "newsletter owner" field.

**Was a migration exception foreseen?** Not in any published Phase 28 text. Cl.11 (`:685`) "Preserve explicit existing settings during migration" covers settings, not memberships. Cl.18 (`:699`) "retain accepted evidence; never fabricate … consent … backfill only justified meaning" is the only opening. IC17-08 (proposed) foresees "a separately qualified exact recipient/contact/source/list-purpose adoption contract", but gives the D17 profile "no such activation". The P28 D6 evidence (`d6-evidence/consent-delivery.md:95`, proposed) says the opposite: "Reconnect, import, migration and source rename cannot create opt-in."

**Smallest amendment.** Add to REQ28-M12 and PRD cl.12, and mirror it in the contract and glossary:

> "Exception: a Phase 30 Switch may create a native membership only through a qualified newsletter adoption contract. It needs a recorded old-list → named native newsletter mapping made before import, the person's evidenced prior participation in that list, no newer withdrawal or restriction, and a Switch-lead attestation. An adopted membership keeps its source and date, is labelled as joined in the previous system, sends no confirmation, and never adds anyone to a newsletter whose source list they were not on."

**Who ratifies.** The founder, as Phase 28 owner (Phase 28 decisions are Conrad's rulings). The edit must land in the Phase 28 sources themselves, because a consumer phase cannot amend by shorthand (C3; `document-authority.md:10-12`, `:30-33`). The Phase 3/6 consent owner must agree the evidence binding.

## 2. Phase 25 "owner-qualified prior permission" and the adoption disposition

**Owner text** (ratified via `decision-log.md:373`):

- **R07 C10** (`:471`): "Migration may adopt only semantically mapped, evidence-backed choices; preserve valid opt-outs/contact floors and never manufacture opt-in from defaults, a donation, follow, visible post or demo row. Publish the adoption disposition before activation."
- **EX04** (`experience.md:49`): "Email MUST NOT be newly enabled without owner-qualified prior permission … actual source succession/merge/contact change needs explicit owner continuity/adoption, not label/email matching or a union of permissions."
- **EX05** (`:67`): "Organization topics require the source/consent owner to supply immutable topic/purpose/channel, recipient mapping, effect, read/edit/default/**adoption provenance**, current revision and a consuming sender that enforces the choice."

Published REQ28-M12 (`:416`) binds each consent record to its destination, instruction, proof, policy and acceptance. As a pattern, the Phase 22 D21 "Public Ministry Adoption Disposition" gives each source item exactly one finite disposition and "never … infers authority from legacy data" (`CONTEXT.md:926-940`, ratified).

**What an adoption disposition must contain** _(inference from the texts above)_. **Per source list:** source system and instance, list id and label, mapped Asym target (P28 newsletter id or P25/P32 topic, purpose and channel), meaning (semantic mapping), owner and approver. **Per row:** Tenant, Party, contact-point revision, source occurrence, evidence fields (opt-in or confirm time, IP, form wording, gift dates), basis, disposition (adopted / evidence-only / re-confirm / blocked) and attester. The whole disposition is published before activation.

## 3. Purpose and list catalog; #680; related issues

**No owner defines the catalog.** P12 `:1654` ratifies "a closed CI-verified registry" but names no values. Phase 32 leaves "the first organization audience/purpose catalog" open (`roadmap.md:4615`), along with "organization-level versus per-missionary provider accounts" (`:4613`). P25 EX05 fixes three donor areas, in this order: "Emails from [organization], Ministry Updates, Receipt emails" (`experience.md:63`), and forbids inventing topics from Email Studio templates (`:65`).

**#680** (proposed). State OPEN, labels `complexity:hard`, `type:feature`, not Ready. 0 comments, no linked PR, no blockers. It blocks #2351, #1663, #1184 and #1141. Created 2026-07-08, updated 2026-10-19.

- **Body examples:** registry `service_delivery, donor_stewardship, finance_ops, member_care, marketing, security_admin, platform_support, ai_assist`; table `contactability_consent(party_id, channel, purpose, state 'granted'|'withdrawn'|'never')` with default deny and `ContactChannel = "email" | "sms"`.
- **Missing:** source, evidence, legal basis, expiry and jurisdiction columns; any mail or phone channel; any per-list purpose.
- **Stale claim:** the body says `consent.ts` is "NOT on this branch". It is present; PR #502 merged 2026-07-08 (`docs/adr/0220…:18`).

**Related issues** (all OPEN; searches for consent, suppression, deceased, CASL, "do not contact" and "preference center"):

- **#2351** [P28-R12b], not Ready: imported restrictions go through "#680's `(channel, purpose)` contactability component"; "R12 never writes `email_suppressions` and never calls that gate".
- **#2350**, not Ready: the gate ignores `group_id` (filed 2026-10-25). **#2086** [P28-R12a]: Ready.
- **Not Ready:** #557 (P6 provenance and `isExportEligible`), #555 (consent snapshot), #693 (P13 gate), #614 (P9 consent tab), #636, #495, #606/#2278 (add `parties.lifecycle_status … deceased`), #733 (P14 mail channel).
- **CASL:** zero issues. **Phase 32:** zero issues.

## 4. Jurisdiction inputs

**Contact.** Implemented: `donors.address JSONB` (`20250101000000_init_schema.sql:85`); the string "country" appears in no migration. Published but unbuilt: P25 postal value "uses one closed qualified country/territory code" (`contracts/identity.md:107`). Mailchimp exports carry `CC`/`REGION` (vendor doc, §9). _(Inference: these are IP-derived, so weak evidence of residence.)_

**Tenant.** `tenants` has no country (`init_schema.sql:14-24`). Phase 2 defers "issuing tenant/site jurisdiction/country" to Phase 7 (`phase-02:872-878`, ratified).

**Legal Entity.** A "Legal Issuer Profile Version" holds "registration or tax identifiers" (`CONTEXT.md:6793-6797`, ratified). Phase 18 has `legal_issuer_requirement: none | verified_us_issuer | active_ca_registered_charity_issuer` (`phase-18-document-purpose-authority-manifest.md:98`), and the `R-` serial is scoped to "the exact full CRA registration account (`BN + RR + four-digit reference`)" (`:198`), ratified. Code has only a request-context boolean (`generated-documents/purpose-catalog/types.ts:25,289-292`, implemented); there is no Legal Entity table in migrations. US: EIN on tax receipts (P07 `:123`), but no 501(c)(3)-status concept.

**Gap** _(inference)_. Registered-charity status exists only as a **document-issuer** proof. Messages are tenant-scoped (ADR-0029 `:18`) and never bound to a sending Legal Entity, so CASL s.3(g) ("sent by or on behalf of a registered charity") cannot be evaluated per message. No owner models implied consent, its expiry or contact jurisdiction for communications.

## 5. Phase 6 suppression and restriction model

**The model** (ratified). A8 (`:154`) freezes the gate verdict at send time. A9 (`:155`): "`email_suppressions` stays the source of truth for 'don't contact'", with `source` provenance (reserved `mailchimp`) and `isExportEligible`. `:250`: "No new suppression table." Glossary: `CONTEXT.md:20-21,26`.

**Can it hold each kind of block?**

| Block                     | Fits today?                                                                                                                                              |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| complaint                 | Yes, as `spam`                                                                                                                                           |
| cleaned                   | Yes, as `bounce` _(inference: Mailchimp "cleaned" means hard-bounced)_                                                                                   |
| list unsubscribe          | Only once per address, and the gate treats it as covering all marketing (#2350)                                                                          |
| do-not-solicit            | No; there is no purpose dimension                                                                                                                        |
| do-not-mail / do-not-call | No. The table and gate are email-keyed; `resolveConsent` channels are `email\|export\|generated_document` (P03 `:202`); P03 `:322` defers mail and phone |
| deceased                  | No (§6)                                                                                                                                                  |

**Postal mail as a channel** (planned, ratified). P14 activates P6 channel `mail` by a dated P6 amendment; its notification consent is "`do_not_contact` + deceased + address-present, fail-closed; marketing opt-outs do not apply" (`phase-14:741-744`; #733 open). P19 statements have a paper route (`phase-19:363`, `:406`). P28 newsletters keep "Email/Physical/Both/None" (`communications.md:599`), and "Email membership grants neither postal data nor physical consent" (`:646`). **Phone** is not a contact channel anywhere; P15 "phone" is card capture.

**D17 C08 atomic receipt.** Published as REQ28-R22 (contract `:4358-4360`) for the D17 profile only. IC17-09 (`:244-263`, proposed) generalizes it.

**Conflict.** P6 A9 says `email_suppressions` is the one source. #2351 routes imported restrictions to #680 and never to `email_suppressions`. Two landing owners for imported blocks are now in flight.

## 6. Deceased

**Planned owner: Phase 9 lifecycle status** (ratified). The `lifecycle_status` CHECK is `active|inactive|archived|deceased` (`phase-09:420`, `:761`), and "deceased/inactive are the lifecycle-status model" (`:847`); glossary `CONTEXT.md:2566-2570`. Tickets #606 and #2278 are open. Implemented: none. "deceased" appears in no migration or code, and `donors.status` is free text.

**Consumers** (ratified):

- **P14:** a deceased notify recipient is blocked at compose and send, but a deceased memorial subject does not block living recipients (`:779`). Standing rules auto-suspend on death (`:1228`). Statements: "a deceased-flagged recipient party's statement is held with a routed task, never auto-mailed" (`:478`, `:1931`).
- **P19:** "Preserve … deceased, representative … rules" (`:1040`). A Delivery Recipient may be a "representative" (`:184`), which is the estate route _(inference)_.

**Not covered.** The P03 `resolveConsent` reasons lack `deceased` (`:206`), and `consent.ts` never reads it. No owner text covers receipts for a deceased donor _(inference: hold them with a staff task, as P14 does for statements)_. Phase 4 is silent.

**Phase 30 text** (ratified): Q1 cl.6 (`:40`), Q7 cl.7 (`:300`) and Q8 cl.5 (`:333-335`). **Ownership** _(inference)_: Phase 9 owns the status, Phase 3/6 make it a gate input that fails closed, and Phase 14/19 own document holds.

## 7. Do Not Solicit

No owner text uses "do not solicit". The closest distinctions between solicitation and service messages (ratified): P17 `:1363` "Required service messages cannot be turned into fundraising/marketing; approved non-soliciting warmth is allowed" (repeated at `:3311`); P28 `communications.md:61-63`, where appeal closure "fences dependent unadmitted solicitation; independently authorized receipts, service and fulfillment keep their own authority"; P27 US27-F30 (`:282`) "membership-dependent solicitation restrictions at dispatch admission"; P14 `:743`, where a notification "is not marketing". Code distinguishes only `transactional` from `marketing` (`consent.ts:15-22`), and P17 calls that "too coarse" (`:304`).

_(Inference: do-not-solicit should block appeal, campaign and fundraising purposes and leave receipts and service messages alone. That needs #680's purpose axis, and nothing holds it today.)_

## 8. Phase 17 message classes and sending infrastructure

**Message classes** (ratified). Service messages are separated from marketing (`:159`), and message class is derived from the producer contract (`:304`). RFC 8058 one-click unsubscribe is required for "optional subscribed/marketing contracts" (`:2157-2161`), and "Required transactional messages cannot be relabeled marketing".

**Reputation.** Each ministry's reputation is separate: "Every tenant owns one Resend account/team, one proved transactional domain" (ADR-0029 `:18`); P17 `:2048` adds "plan/quota/reputation". Implemented: per-tenant key and settings in `tenant_email_settings` (`…backfill.sql:6-33`). Setup "recommend[s] isolation from marketing reputation" (`:2080`), but Sender Profiles are "same-domain" (ADR-0029 `:44`) and no owner defines a newsletter or marketing domain _(inference: newsletters and appeals to imported lists would share the receipts domain)_.

**Warm-up and staging.** No owner text ("warm" appears only as "warmth"). Precedents: Q8 cl.2 (`:318`, "first wave of 50 … pauses automatically at 3% bounces or any complaint") and P17-AR-EMAIL-08 containment (`:3541`). `daily_send_limit` (default 10000, `:24`) has no reader in code _(inference: not enforced)_.

**Engagement.** P17: "Tracking remains disabled; unexpected open/click evidence is advisory drift only" (`:2122-2123`, `:2134`). P6 A7 and P32 treat opens and clicks as provider evidence, "not proof of reading, consent" (`roadmap.md:4534`, `:4552`). So Asym will produce no engagement data, and "engaged readers first" can only use imported provider evidence and gift recency.

## 9. Engagement evidence available from exports

**SiteStacker.** Per-list subscriber CSV. "Status, opt-in time and source, and opt-out history are **undocumented**", and the export may hold only current subscribers (q01-r1 E1 `:256`; r07 `:174`). There are no engagement fields.

**Mailchimp in the repo.** Statuses including archived and deleted (q01-r1 `:377`), and a fresh export at each import (g4 F9 `:229`, proposed). The repo records no column names.

**Mailchimp vendor documentation** (fetched 2026-11-02, mailchimp.com/help/view-export-contacts). The export is a ZIP of subscribed, non-subscribed, unsubscribed and cleaned CSVs; "Archived contacts are exported separately". Columns: `MEMBER_RATING` ("member activity rating"), `OPTIN_TIME`, `OPTIN_IP` ("won't show for contacts who haven't completed the double opt-in process"), `CONFIRM_TIME`, `CONFIRM_IP`, `LAST_CHANGED`, `LEID`, `EUID`, `TAGS`, `CC`, `REGION`, `TIMEZONE`, `NOTES`. `UNSUB_TIME`/`CLEAN_TIME` are not on that page (unverified). No last-open date is documented.

_(Inference: permanently deleted members cannot be exported at all.)_

**Implication.** Express-consent evidence exists mainly for Mailchimp double opt-in. `MEMBER_RATING` plus gift dates are the only ordering signals. SiteStacker-only subscribers carry membership with no timestamp.

## 10. Root glossary terms (`CONTEXT.md`) to align with

**Existing terms:** `:20` Consent snapshot · `:21` Suppression / Unsubscribe / Bounce / Complaint (types in `email_suppressions`) · `:26` Export eligibility · `:70` Ministry Update (_Avoid_ "newsletter", "donor email") · `:120` Ministry Update Engagement · `:935` Public Ministry Adoption Disposition (Phase 22) · `:2256` Native newsletter subscription · `:2265` Verified-address newsletter signup · `:2275` Public newsletter signup entry · `:2287` Newsletter issue · `:2295` Newsletter send authorization · `:2369` _Avoid_ "personal account as consent exemption" · `:2381` Reviewed contact-list intake (_Avoid_ "spreadsheet status as consent") · `:2566` Lifecycle status vs cultivation stage (deceased) · `:3303` SMS consent evidence · `:3315` SMS hard suppression · `:7765` Newsletter request (_Avoid_ "Ministry Update email preference") · `:7806` Permission ("Authority to perform an action or access data").

**Not defined at root:** "consent" by itself, "contact restriction", "do-not-contact", "contactability", "preference", "Join".

**Collisions to avoid.** Bare "permission" collides with `:7806`, so prefer **"Adopted email permission"**. "Adoption Disposition" collides with `:935`, so prefer **"Consent adoption disposition"**. Use **"Imported restriction"** for blocks, because `:21` reserves "suppression" for `email_suppressions` types. Use "subscription" or "membership" only for a Phase 28 target.

## 11. Ratified clause text Q9 would amend (`grill/decision-log.md`)

- **Q1 1(a) `:35`:** "every **Minimum Switch Kit** family — Parties and households; contact points with consent and suppression evidence; one-time giving history including reversals; recurring evidence for the Phase 16 classifier — is committable through its owner's typed import command". The same line adds: "No exception lets a switch proceed with a kit family missing."
- **Q1 4 `:38`:** "Parties, contacts and suppression evidence commit and reconcile first; Asym giving and exact redirects then open".
- **Q1 7 `:41`:**
  - "Before any Asym sending or automation activates, the ministry records one state per surface per Site, Site Channel or list"
  - "Off: … organization Mailchimp sync"
  - "Outside control: missionary-owned Mailchimp lists, gateway-sent emails, PayPal notices."
- **Q1 12 `:46`:** "Opt-outs, do-not-contact and erasure requests recorded in Asym after the boundary are listed 'pending in legacy systems' until a named ministry user marks each executed in SiteStacker, each legacy processor and each connected missionary mailing account. Backfills never restore contact, consent or identity data for an erased or suppressed Party."
- **Q3 3 `:87`:** "contact points with explicit consent and adverse-evidence columns (evidence only, never consent)".
- **Q7 7 `:300`:** "Restrict-only contact facts (erasure, do-not-contact, deceased) apply before anything else."
- **Q8 2 `:315-320`:** "One campaign (sent by the ministry)". Messages are "service messages, one per donor". Sending is "staged, with a first wave of 50. It pauses automatically at 3% bounces or any complaint." "No SMS in v1."
- **Q8 5 `:333-335`:** "Do-not-contact and deceased donors: Asym sends them nothing. For each such gift, the ministry records how any legal notice duty is met … (O38)". "Bounced or no email: these donors go on the mail-or-call list."
- **§2 C10 `:367`:** "Imported subscription flags, phones, opt-ins, gifts or relationship labels never grant consent; do-not-contact and withdrawal are hard floors." Its sources: `roadmap.md:4381` (SMS-scoped), SMS-W03 ("**alone** MUST NOT"), ADR-0028, ADR-0170 `:128` ("contact import **alone** provide no consent"), and P28.
- **Related:** Phase 30 roadmap `:4351`, "Do not make import an alternate path around classification, consent or duplicate controls" (ratified).

## 12. Sequencing hazard: what sends today or soon

**Implemented senders:** receipts, transactional (`giving/receipts.ts:334`); contribution correction notices (`notifications/store.ts:468` → `send.ts:574-585`); staff approval emails (`approval-notification-email.ts:217`); template and test sends to test recipients (`template-test-send.ts:236-254`; `test-send.ts`). There is **no** marketing, campaign, newsletter or post-email sender, and no open PR adds one (searches for newsletter, campaign, marketing, consent, suppression, broadcast and Email Studio found none).

**Ready Phase 28 tickets:** **#2117** (M10-a "Review and send one newsletter"), blocked only by #2114 and #2116; it requires "Positive membership" and the existing negative gate, **not #680**. Also Ready: **#2114** (newsletter test send), **#2116** (membership manage), **#2122** (physical newsletter packet). **Not Ready:** #1638 (P25 post emails), #733 (P14 mail channel), #2380/#2381. **Phase 32:** no tickets.

**Verdict** _(inference)_:

- Imported donors landing before #680 are **not** exposed to organization marketing today, because no sender exists.
- They **are** exposed through Phase 28 the moment part 4 creates adopted memberships, since #2117 would send to them without #680.
- They are also exposed through receipts and the Q8 campaign if part 1 turns an unknown-scope block into `do_not_contact`, which blocks receipts (ADR-0220 `:16`; `consent.ts:198-201`).

## Fit of each part

**Part 1: Unsubscribes first, scoped, kept permanently.**

- **Owners:** Phase 3 (floor), Phase 6 (suppression source, A9), Phase 12 #680 (contactability), Phase 9 (deceased), Phase 30 (its own Q1).
- **Supports:**
  - Q1 cl.1(a), 4 and 6; Q7 cl.7.
  - P25 `experience.md:49` ("Migration preserves proved opt-outs and contact floors").
  - P04 `:185` ("most-restrictive").
  - `roadmap.md:4530` (stricter suppression wins).
  - REQ28-R22, for scoping and the atomic receipt.
- **Conflicts:**
  - Nothing can store the blocks. The email-keyed one-row-per-type key and the ignored `group_id` (§5) cannot keep "scope as source had it".
  - There is no landing for mail, phone, solicit or deceased blocks (P03 `:322`).
  - "Unknown scope = all channels" mapped to `do_not_contact` also blocks receipts and the Q8 service campaign.
  - With C08 "stays blocked" and Q1 1(a) "no exception", every affected row blocks the kit, so no Switch can be scheduled until an owner restriction-import command exists.
- **Smallest wording.** Add owner requirement O41 (P3/P6/P12): "An imported-restriction command atomically records each scoped block (channel, purpose or list, message class, source system and label, source date, Party/contact revision) and returns a durable receipt. Unknown scope blocks every channel for optional messages. Only an explicit source do-not-contact blocks required service messages. P6 and #680 agree which one stores imported blocks."

**Part 2: The email provider is part of the switch.**

- **Owner:** Phase 30 alone. The founder amends Q1.
- **Supports:**
  - q01-r1 `:377` and E2; g4 F9.
  - Q2 `:66` (header capture includes "the Mailchimp export").
  - Q3 `:88` (4(e) "email-platform sync").
  - P6 A9 (reserved `mailchimp` provenance).
- **Conflicts:**
  - Q1 cl.12 lists only SiteStacker, processors and missionary mailing accounts.
  - Q1 cl.7 turns sync Off but leaves the audience itself unaddressed.
  - Archived contacts export separately, and deleted ones cannot be exported (§9).
- **Smallest wording:**
  - Q1 1(a): "…contact points with consent and suppression evidence, **including a final-import export of every organization email-provider audience (subscribed, unsubscribed, cleaned, archived)**".
  - Q1 12: add "**each organization email-provider audience**".
  - Q1 7: add "organization email-provider audiences: Off at boundary, or Kept on with Asym opt-outs applied".

**Part 3: Permission carried over from evidence.**

- **Owners:** Phase 30 (Q3 cl.3, C10). Phase 3 and P12 #680 (storage and gate). Phase 25 (Ministry Update emails, EX04/EX05). Phase 32 (organization topics). Phase 7/18 (registered-charity fact).
- **Supports:**
  - P25 R07 C10 (ratified).
  - EX05 "adoption provenance".
  - IC17-08 (proposed).
  - P28 cl.18.
  - The word "alone" in SMS-W03 and ADR-0170.
- **Conflicts:**
  - Q3 cl.3 and C10 as worded.
  - `roadmap.md:4351`.
  - REQ28-M12/M42 for newsletters.
  - #680's `state` enum cannot hold a basis, evidence or expiry (CASL's 2-year window).
  - No owner knows contact jurisdiction or the sending Legal Entity (§4).
  - Organization lists have no target (§3).
- **Smallest wording:**
  - Q3 cl.3: "(evidence only; it becomes an Asym permission only through a consent adoption disposition published under Q9)".
  - C10: "…never grant consent **by themselves**; an owner-qualified adoption may adopt mapped, evidence-backed choices (P25 R07 C10)".
  - New owner requirement to P3/P12: contactability rows carry basis (`express`, `us_relationship`, `ca_charity_fundraising`, `ca_implied_until`), evidence reference and expiry.
  - New owner requirement to P7/P18: expose a registered-charity fact per Legal Entity to the communications gate.
  - Until these exist: Canadian and UK/EU rows are evidence-only.

**Part 4: Missionary newsletters carry over.**

- **Owners:** Phase 28 (the founder). Phase 6/3 for the evidence binding.
- **Conflicts and supports:** see §1. Phase 28 has no organization newsletters, so this part fits only lists a named missionary ran. Outside Mailchimp lists stay excluded (Q1 cl.7).
- **Smallest wording:** the §1 exception text, plus "adopted memberships stay held under part 5".

**Part 5: Sending gate.**

- **Owners:** Phase 30 can place a hold on its own adopted records. P6/P12 enforce it. P17/P32 own staging.
- **Supports:**
  - P12 `:1654`.
  - #680's "never = deny" default.
  - Q8 cl.2 staging precedent.
  - P17-AR-EMAIL-08.
- **Conflicts:**
  - #2117 does not wait for #680.
  - No warm-up owner exists.
  - Tracking is disabled.
  - The receipts domain is shared.
- **Smallest wording:** "Every adopted permission or membership starts held. No optional send admits an imported recipient until the P12 purpose × channel check and the adoption disposition are live. Then send in staged waves ordered by gift recency and imported provider rating, pausing at 3% bounces or any complaint (Q8 cl.2 rule)."

**Part 6: Deceased status.**

- **Owners:** Phase 9 (status), Phase 3/6 (gate), Phase 14/19 (documents).
- **Supports:** P9 `:761`, P14 `:478/:743/:779`, Q8 cl.5.
- **Conflicts:**
  - "Blocks all contact" contradicts P14's rule that a deceased memorial subject does not block living recipients. The block should apply to the person **as a recipient**.
  - Estate documents need a held, routed task rather than silence.
- **Smallest wording:** "P3 gate reason `deceased`, derived from P9 `lifecycle_status`, fails closed for every channel and class for that person as recipient. Required documents are held with a routed staff task (P14 D1.10), never auto-sent."

## Gaps and hazards (most severe first)

1. **A Ready newsletter sender bypasses the part 5 gate.** #2117, #2114 and #2116 need only membership and the opt-out gate. Adopted memberships (part 4) would be mailable before #680. The hold must be part of the adoption contract and enforced by P6.
2. **No owner can record imported blocks, so no Switch can be scheduled.**
   - `email_suppressions` holds one unsubscribe per address, the gate ignores `group_id` (#2350), and there is no mail, phone, solicit or deceased landing.
   - Under C08 those rows stay blocked, and Q1 1(a) allows no switch with a kit family missing.
   - P6 A9 ("one source") and #2351 ("never writes `email_suppressions`") disagree on the landing owner.
3. **Unknown scope mapped to `do_not_contact` blocks receipts and the Q8 move campaign** (ADR-0220 `:16`). Part 1 must distinguish channels from message classes.
4. **A shared sending domain.** Imported-list complaints would hit the same tenant domain that sends receipts and sign-in mail (ADR-0029 `:18,44`). P17 recommends isolation but no owner provides it.
5. **CASL cannot be applied.** There is no contact country (P25 `identity.md:107` is unbuilt) and no Legal Entity sender on messages. The registered-charity fact exists only for Phase 18 document issuance. #680 has no basis or expiry. Québec duties (r2) are unmodelled.
6. **No target for organization-run lists.** The Phase 32 catalog is open and Phase 32 has no tickets. P25 EX05 forbids invented topics.
7. **Weak evidence.** SiteStacker exports lack opt-in time and source. Asym tracking is disabled. Only `MEMBER_RATING` and gift dates can order sends.
8. **Mailchimp gaps.** Deleted members are unrecoverable and archived contacts need a separate export. SiteStacker's one-way sync shows "subscribed" where Mailchimp has suppressed, so the stricter value must win.
9. **No owner path for re-confirmation (UK/EU).** Phase 28 confirmation covers only new Joins. _(External: a re-permission request is itself a commercial or marketing email.)_
10. **Smaller items:**
    - The #680 body is stale about `consent.ts`.
    - `daily_send_limit` is not enforced.
    - A donor can clear `do_not_contact` themselves (`donor-portal/index.ts:116`) with no preserved source history.
    - C10's cited roadmap line is SMS-scoped.
