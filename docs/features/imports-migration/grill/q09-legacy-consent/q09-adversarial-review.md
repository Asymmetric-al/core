# Q9 — Legacy consent and suppression evidence: adversarial check of Option B

Founder answer (2026-11-02): **"B. Bring the evidence across. Research modern best pratices and make sure we are doing it correctly and will work well."** Decision as asked: `q09-decision-as-asked.md`.

**Evidence.** `research/q09-r1-repo-consent.md` (repo consent model), `q09-r2-external-consent.md` (law and ESP rules), `q09-r3-external-best-practice.md` (consent data models, migration playbooks, deliverability, re-permission outcomes, enforcement record), `q09-r4-repo-fit.md` (citation check of r1, owner fit, sequencing hazards). Two claims were re-verified directly on 2026-11-02:

- **CASL s.10(13)(a)** limits gift-based implied consent to a gift "where that other person is a registered charity as defined in subsection 248(1) of the Income Tax Act", a political party or a candidate (laws-lois.justice.gc.ca, fetched).
- **#2117** (Ready, `[P28-M10] Review and send one newsletter`) admits recipients by "Positive membership" plus the "Phase 3 positive authority and Phase 6 frozen recipient intent". It has no Phase 30 adoption hold.

This is research, not legal advice. Counsel items are listed in §6.

**Disposition: accept with required amendments.** B is the industry pattern: Dynamics maps lists to topics, Salesforce, Raiser's Edge and HubSpot carry legal basis and capture fields, and every ESP imports suppressions as permanent blocks. Three parts were wrong in law and three would not have worked in this repo. The corrected text is in §2.

## 1. Adversarial check

### What could go wrong

1. **Blocks lost in the move.** This is the most common migration failure on record:
   - The Conservative Party (ICO £10,000, 2021) lost unsubscribe records when changing email provider.
   - Reed Online (£40,000, 2022) emailed opted-out people about 24 hours before its new CRM's block landed.
   - Porter Airlines (CRTC $150,000, 2015) said "a move to a new email platform caused the errors", and it could not prove consent per address.

   _Safeguard:_ blocks commit first, a block reconciliation must equal zero missing before sign-off, and the email tool's final export is taken after old sending stops.

2. **"All channels if unknown" stops receipts.** Asym's do-not-contact also blocks receipts (ADR-0220 `:16`; `consent.ts:198-201`), so turning an unknown-scope email opt-out into do-not-contact would silently stop tax receipts and the Q8 move campaign. M3AAWG defaults an unscoped email unsubscribe to "all mail", meaning all email, not all channels. _Fix:_ scope by signal type (§2 clause 1).
3. **The "one re-confirmation request" is illegal in the cases it was meant for.**
   - The ICO fined Flybe £70,000 and Honda £13,000 (2017): "Sending emails to determine whether people want to receive marketing without the right consent is still marketing."
   - CASL s.1(3) makes a consent-request email itself a commercial electronic message.

   _Fix:_ never email to ask for permission. Ask only when the person next gives, signs in or replies.

4. **The Canadian 2-year gift rule was overstated.** It applies only to registered charities (s.10(13)(a), verified), as does the s.3(g) fundraising exemption. _Fix:_ a Canadian ministry that is not a registered charity needs dated opt-in evidence, like UK/EU.
5. **The sending gate can be bypassed.** #2117, a Phase 28 newsletter sender, is Ready and needs only positive membership plus today's gates. Adopted memberships would be mailable the moment they exist, before #680. _Fix:_ adopted permissions start on hold, and every optional sender must honor the hold (O42/O43).
6. **No place to store most blocks.** `email_suppressions` is keyed by email, holds one unsubscribe row per address, and the gate ignores `group_id` (#2350). Nothing can hold do-not-solicit, do-not-mail, do-not-call or deceased. Phase 6 A9 ("one source of truth") and #2351 ("never writes `email_suppressions`") disagree on where imported blocks land. Because Q1 1(a) allows no Switch with a kit family missing, this blocks every Switch until O41 exists. That is correct, but it is a real dependency.
7. **Reputation damage spreads to receipts.** Each ministry already has its own Resend account (ADR-0029 `:18`), but optional and required mail share one domain (`:44`). One bad first send to a stale imported list could put receipts in spam. _Fix:_ separate sending subdomain for optional mail (O45).
8. **Stale lists hit spam traps.** M3AAWG treats addresses not mailed in a year as a "dirty mailing list". Dormant addresses become recycled spam traps. _Fix:_ a list not sent to in the 12 months before the boundary is held as stale.
9. **Mailchimp gaps.**
   - Complaints are not in the CSV export; they come from the abuse-report API or view.
   - Archived contacts export separately.
   - Permanently deleted contacts cannot be recovered.
   - Exports expire after 30 days.
   - SiteStacker's one-way sync can show "subscribed" where Mailchimp has suppressed the person.

   _Fix:_ name each source, record deleted contacts as a Visible exclusion, and let the stricter value win.

10. **Disguised marketing.** AMEX was fined £90,000 (2021) for "service" emails that were marketing. _Safeguard:_ Q8 campaign emails and receipts carry no appeal or upsell. This needs a content check under O37.
11. **Deceased donors still charged or misaddressed.** Bloomerang ends recurring gifts on a deceased mark and never merges the record into a relative's. _Fix:_ the legacy gift goes on Q8's To-cancel list, documents are held for the estate, and the block applies to the person, not the household.

### Hidden assumptions

- **"Subscribed" in the old system means consent.** Not necessarily: SiteStacker exports no opt-in time or source, and its sync was one-way. Hence the evidence rules by jurisdiction, and the stricter value winning.
- **Asym can carry an organization newsletter.** It cannot yet. Phase 28 newsletters belong to missionaries, and organization-wide lists belong to Phase 32, which has no tickets. Most ministries will keep their organization newsletter in their email tool for a while. B had to say what happens to those lists, so clause 2 adds one sender per list.
- **Asym knows where donors live and whether the ministry is a registered charity.**
  - There is no country on contacts (`donors.address` is free JSON).
  - The registered-charity fact exists only as a Phase 18 receipt-issuer proof.
  - Clause 3 therefore uses the imported postal country (falling back to the ministry's country), and the ministry's recorded registration.
- **Opens show engagement.** They do not: Apple Mail Privacy Protection inflates them, and Asym tracking is disabled (P17 `:2122`). Ordering uses gift recency and the email tool's click-based member rating.
- **The Switch lead's attestation proves consent.** No regulator accepts attestation instead of per-address evidence (Porter; GDPR Art. 7(1)). The attestation records who vouched; the evidence travels separately.
- **The ministry was the sender in the old system.** True for SiteStacker and organization lists, and for missionary lists run through the ministry. It is false for missionaries' own outside Mailchimp lists, which stay outside (Q1 clause 7).

### Whole product

- **Where adoption first matters is Phase 28 missionary newsletters** (#2117 Ready). Organization lists cannot move until Phase 32 exists. Receipts and the Q8 campaign are required or service mail and need no adoption.
- **Kept organization lists stay in the ministry's email tool.**
  - Opt-outs recorded in Asym must reach the tool through Q1's "pending in legacy systems" list, within 2 days (Gmail and Yahoo honor unsubscribes within 48 hours or 2 days; the legal limit is 10 business days).
  - The tool's own unsubscribes, cleaned addresses and complaints come back into Asym as restrict-only facts.
  - **Gap:** new donors who give in Asym cannot be added to a kept list except through the tool's own signup form. That is a Phase 32 matter (O46).
- **Q1 clause 2 says Asym is the "only writer" of consent.** A kept list is the one honest exception, and it must be written into the decision rather than left implied.
- **Deceased cuts across money** (legacy gifts, Phase 16 schedules), **documents** (Phase 14/19 holds) and **identity** (Phase 4 merges). One lifecycle status owned by Phase 9 serves all of them.

### End-user experience

- **Donor.**
  - Nothing changes on switch day: no confirmation flood and no "you've been subscribed" email.
  - The same missionary's newsletter keeps arriving under the same name. The first Asym send carries one line: "You're getting this because you subscribed to {list} in {previous system}." Every optional email has one-click unsubscribe.
  - Their preferences show "Joined in {previous system} on {date}".
  - One opt-out holds everywhere within 2 days.
  - Nobody emails them to ask permission they never gave.
  - A grieving family gets nothing addressed to the person who died.
- **Switch lead.** One "Email lists and permissions" step in the Switch:
  - **Field meanings:** they confirm what each source restriction field means (pre-filled for SiteStacker).
  - **Lists:** they choose Move, Keep or Retire per list, enter the date the list was last sent, and attest.
  - **Counts:** they see live counts per list: _will keep receiving · blocked · evidence only · held as stale_. Practice runs (Q6) show the same counts before go/no-go.
- **Staff.** Each restriction shows its source and date on the person, for example "Do not call — from SiteStacker, 2 Apr 2019". Staff lists honor it, including Q8's mail-or-call list.
- **Missionary.** Their subscribers carry over with a "Joined in previous system" label. They cannot add anyone; Phase 28 rules govern new Joins.

### Modern best practice

| Part                        | Verdict                                                                                                                                                                                                         | Evidence                                                                           |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1. Blocks first             | **Matches** in principle. **Corrected:** scope by signal, address versus person keys, the stricter value wins, nothing lifts a block, an unrecognized value holds the row                                       | Klaviyo migration order; Dynamics duplicate rule; M3AAWG; enforcement record above |
| 2. Email tool in scope      | **Matches.** **Corrected:** complaints come from the API, archived contacts export separately, deleted contacts are a known gap, 30-day expiry, export after sends stop, one sender per list, 2-day propagation | Mailchimp export and abuse-report docs; Gmail 48 h; Yahoo 2 days                   |
| 3. Permission from evidence | **Matches** the industry shape. **Corrected:** CASL gift rule for registered charities only; no emailed re-permission; attestation does not replace evidence; stale-list hold                                   | CASL s.10(13)(a), s.1(3); ICO Flybe/Honda; Porter; M3AAWG "dirty list"             |
| 4. Missionary newsletters   | **Matches** where the ministry was the sender. **Added:** "on behalf of" sender naming (CASL Regs s.2(1)); permission scoped to that newsletter                                                                 | CRTC Regulations SOR/2012-36; Raiser's Edge categories within channels             |
| 5. Sending gate             | **Matches.** **Added:** concrete settings (separate subdomain, SPF/DKIM/DMARC, RFC 8058, provider warm-up, engaged first without opens, pause thresholds)                                                       | Gmail, Yahoo, Outlook 2025; RFC 8058; M3AAWG v4.0 (Aug 2026); Resend warm-up       |
| 6. Deceased                 | **Matches.** **Corrected:** applies to the person as a recipient, not the household; ends legacy gifts; estate document hold; never deleted                                                                     | Bloomerang; DMAchoice; P14 `:478`, `:779`                                          |

### Repo fit

- **Owners and texts that must change:** Phase 3/6/12 (O41, O42), Phase 28 (O43, ruled by the founder as owner), Phase 9 (O44), Phase 17 (O45), Phase 32/25 (O46).
- **Phase 30 texts this amends:** Q1 clauses 1(a), 2, 7 and 12; Q3 clause 3; C10; Q8 clause 5.
- **Supporting owner text exists:**
  - Phase 25 R07 C10 (ratified): "Migration may adopt only semantically mapped, evidence-backed choices … Publish the adoption disposition before activation".
  - P25 EX05: "adoption provenance".
  - P28 clause 18: "backfill only justified meaning".
  - P04 `:185`: the most restrictive value wins on merge.
  - `roadmap.md:4530`: the stricter suppression wins.
- **Conflicts recorded as discrepancies:**
  - D30: P6 A9 versus #2351 on where imported blocks land.
  - D31: the #680 body is stale about `consent.ts`, and its proposed table has no basis, evidence, expiry or hold.
- **Citation corrections from r4:**
  - The Phase 28 168-hour rule is at `:683`, not `:10`.
  - `owner-constraints.md:386-388` is about automation fan-out, not contact suppression.
  - `email_suppressions` has `group_id`, which the gate ignores.

### Adjusted recommendation

Keep B, amended as in §2. ★ marks changes from the decision as asked. The gates are arranged so that adoption never blocks a Switch: until O42 and O43 are live, every list is kept or retired and its people are carried as evidence only.

## 2. Corrected decision text

**Q9 — Legacy consent and suppression evidence.** Option B, amended.

1. ★ **Blocks first, scoped by what they mean.** Every restriction from the old system and the ministry's email tool commits before any permission. Each keeps its source field, original value, original date and source record. The Switch lead confirms what each source field means (pre-filled for SiteStacker; mapped at upload for templates). Scope follows the signal:

   | Source signal                                                  | What it blocks                                                                                   |
   | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
   | Do not contact; erasure                                        | The person on every channel, including required messages (receipts are held for staff, as today) |
   | Deceased                                                       | Clause 6                                                                                         |
   | Do not solicit                                                 | Appeals and fundraising on every channel; receipts and service messages still go                 |
   | Email opt-out with no list named; do not email; spam complaint | All optional email to that person; required email still goes                                     |
   | Unsubscribed from a named list                                 | That list and its Asym target                                                                    |
   | Hard bounce; "cleaned"                                         | That address is undeliverable (Q8's mail-or-call list applies)                                   |
   | Do not mail; do not call                                       | Post; phone. Shown to staff and honored by staff lists, including Q8's mail-or-call list         |
   - An unrecognized value holds the row for review. A blank means unknown: no permission and no block.
   - The stricter value wins across duplicates, merges, and the old system versus the email tool.
   - Nothing lifts a block except the person's own later action, or a staff correction of a wrong deceased mark with evidence. History is append-only.
   - The same scoping applies to restrict-only facts in Legacy Tail Backfills (Q1 clause 6).

2. ★ **Every ministry email list moves or stays, never both.**
   - **Required sources:** the final export of every audience in the ministry's email tool, meaning subscribed, unsubscribed, cleaned and archived contacts, plus spam complaints from the tool's complaint report. It is taken after old sending stops and within the tool's 30-day export window.
   - **Deleted contacts:** permanently deleted contacts are a Visible exclusion.
   - **Disposition:** at go/no-go each list gets one of three:
     - **Move to Asym.** Only where Asym has a home for the list: a named missionary's newsletter (Phase 28) or missionary update emails (Phase 25). Only once adoption is live (clause 7). The old list stops sending at the boundary.
     - **Keep in {email tool}.** The ministry keeps sending it there, as a Kept-on surface with an owner.
       - **Asym → tool:** opt-outs recorded in Asym go on the "pending in legacy systems" list with a 2-day target.
       - **Tool → Asym:** the tool's own unsubscribes, cleaned addresses and complaints come back into Asym restrict-only at least every 4 weeks and when the list closes.
       - **Later move:** the list can move later only under these same rules, with a fresh export.
     - **Retire.** Nobody is sent it again; its blocks still import.
   - **Organization-wide lists** have no Asym home until Phase 32, so in v1 they are kept or retired.
   - Amends Q1 clauses 1(a), 2 ("only writer" of consent, except kept lists), 7 and 12.
3. ★ **Permission carries over only from evidence.** A person on a moved list gets the matching Asym permission only when all of these hold:
   - they were on the list and had not withdrawn;
   - the list was sent to within the 12 months before the boundary (otherwise the whole list is held as stale);
   - their evidence meets their rule:
     - **US recipients, and Canadian recipients of a registered charity:** list membership with its source.
     - **UK/EU recipients, and Canadian recipients of a ministry that is not a registered charity:** a dated opt-in record, such as the email tool's opt-in or confirmation time. Otherwise evidence only.

   **Where the person lives** comes from the imported postal country; if that is unknown, the ministry's country is used.

   **Each permission keeps its evidence:** source system, list, original dates, IP and wording where present, the list mapping, and the Switch lead's attestation. The attestation records who vouched and never replaces the evidence.

   **Limits:**
   - Nobody is added to a list they were not on.
   - Nobody is emailed to ask for permission. People without enough evidence are asked only when they next give, sign in or reply.
   - No SMS permission carries over in v1. Exact-number evidence is kept for the SMS owner.

   Amends Q3 clause 3 and C10 (imported flags never grant consent "by themselves").

4. **Missionary newsletters carry over the same way.** This is a Phase 28 amendment, ruled by the founder as owner.
   - Only lists a named missionary ran through the ministry's old system qualify.
   - The membership shows "Joined in {previous system} on {date}", or "before {boundary date}" when no date exists.
   - It sends no confirmation, belongs to that missionary's newsletter, and never authorizes ministry appeals.
   - Messages name "{missionary} on behalf of {ministry}".
   - Missionaries' own outside lists stay theirs.
5. ★ **Adopted permissions start on hold; first sends are gentle.** No optional message reaches an imported person until the purpose × channel check (#680) enforces adopted permissions, holds and blocks, and every optional sender (including the Phase 28 newsletter sender, #2117) honors the hold. After that:
   - every optional message names its sender and carries a one-click unsubscribe honored within 2 days;
   - the first send to an adopted list carries one line: "You're getting this because you subscribed to {list} in {previous system}.";
   - optional mail goes from its own sending subdomain, separate from receipts, with SPF, DKIM and DMARC aligned;
   - waves follow the email provider's warm-up schedule, most recent givers and highest-rated readers first (never by opens);
   - sending pauses at 3% bounces or 0.1% complaints, and at any complaint in the first wave of 50 (as Q8).
6. ★ **Deceased.** A deceased status (Phase 9 lifecycle) makes the person ineligible as a recipient on every channel and for every message.
   - Documents due to them are held with a staff task for the estate or representative, never sent automatically.
   - Their legacy recurring gift goes on Q8's To-cancel list, not the move campaign.
   - The record is never deleted or merged into a relative's, and the status does not block a surviving spouse or a shared address.
   - Staff correct a wrong mark with evidence.
   - Amends Q8 clause 5.
7. **Gates.**
   - **Scheduling:** a Switch cannot be scheduled until O41 (scoped restriction import) is live, which follows from Q1's Minimum Switch Kit.
   - **Moving lists:** lists move to Asym only once O42 and O43 are live. Until then they are kept or retired, so adoption never blocks a Switch.

**Acceptance criteria**

- AC1. A mixed fixture covering every signal type produces blocks with exactly the clause 1 scopes. No row is defaulted to permission and no blank becomes permission.
- AC2. A donor with only an email opt-out still gets receipts. A do-not-contact donor gets nothing, and their receipt is held for staff.
- AC3. Block reconciliation by type and source system: source count minus Asym count = 0, otherwise sign-off is blocked.
- AC4. A later snapshot, backfill or provider value of "subscribed" for a blocked address leaves the block in place.
- AC5. Merging two people with conflicting status keeps the stricter one.
- AC6. A list with no send in the 12 months before the boundary yields only held, stale permissions.
- AC7. A UK/EU recipient, or a recipient of a non-registered Canadian ministry, without a dated opt-in gets no permission and no message asking for one.
- AC8. Creating an adopted membership sends nothing. The membership shows "Joined in {previous system}".
- AC9. While the hold is on, no optional sender (including a #2117-style newsletter send) admits an adopted person.
- AC10. For a kept list, an Asym opt-out appears on the pending list and is flagged overdue after 2 days. The tool's later unsubscribes arrive restrict-only.
- AC11. A deceased person gets nothing on any channel. Their documents are held with a task and their legacy gift is on the To-cancel list. A spouse at the same address is unaffected.
- AC12. A do-not-call person is not on any call list, and a do-not-mail person is not on any mail list.
- AC13. A practice run shows per-list counts: will keep receiving, blocked, evidence only, held as stale.

## 3. Monitors

| ID     | Signal                                                                              | Threshold                    | Owner                       | Response                                                        |
| ------ | ----------------------------------------------------------------------------------- | ---------------------------- | --------------------------- | --------------------------------------------------------------- |
| M-Q9-1 | Source blocks missing in Asym, by type                                              | 0                            | Phase 30; Switch lead signs | Block reconciliation sign-off                                   |
| M-Q9-2 | Messages sent to a blocked person or address                                        | 0                            | Phase 6                     | Halt the sender; incident review                                |
| M-Q9-3 | Pending-in-legacy items older than 2 days                                           | 0                            | Switch lead                 | Reminder at 24 h; Switch page alert at 2 days                   |
| M-Q9-4 | Complaint rate on sends to adopted people                                           | < 0.1% (any in the first 50) | Phase 17                    | Automatic pause; list review before resuming                    |
| M-Q9-5 | Bounce rate on sends to adopted people                                              | < 3%                         | Phase 17                    | Automatic pause                                                 |
| M-Q9-6 | Adopted permissions missing required evidence fields (UK/EU, non-registered Canada) | 0                            | Phase 12                    | Revert to evidence only                                         |
| M-Q9-7 | Share of each moved list still subscribed 90 days after go-live                     | Learning signal              | Phase 30                    | Recalibrate the stale-list rule and warm-up at the first switch |

## 4. Owner requirements (proposed O41–O46)

- **O41** (Phase 3/6 with Phase 12): one atomic, scoped restriction-import command.
  - Person-level and address-level blocks by channel, purpose or list, and message class (optional or required).
  - Source field, value, date and record; a durable receipt.
  - Visible to staff and honored by staff lists.
  - Append-only history, including donor self-service changes (`donor-portal/index.ts:116` keeps none today).
  - Settles where imported blocks live (D30).
- **O42** (Phase 12 #680 with Phase 3):
  - Adopted permissions carrying basis, evidence reference, original dates and a hold state, created only through a published consent adoption disposition (P25 R07 C10).
  - Holds enforced for every optional sender.
  - A recipient country and the ministry's registered-charity fact (from the Phase 7/18 Legal Entity record) available to the check.
- **O43** (Phase 28, the founder as owner): the newsletter adoption exception in PRD clause 12, REQ28-M12 and M42 and the glossary; adopted memberships labelled and held; #2117 honors the hold.
- **O44** (Phase 9 with Phase 3/14/19/16): a deceased lifecycle status as a fail-closed recipient reason; document hold with a staff task; never deleted or merged; legacy gifts routed to the To-cancel list.
- **O45** (Phase 17):
  - A separate sending subdomain for optional mail.
  - Warm-up, staged waves and automatic pause for optional sends.
  - "On behalf of" sender naming.
  - One-click unsubscribe honored within 2 days.
  - The permission-reminder line.
- **O46** (Phase 32 with Phase 25): a home for organization-wide lists. Until it exists, kept lists stay in the ministry's email tool, and new Asym donors reach them only through the tool's own signup.

## 5. Rejected alternatives

| Alternative                                                    | Why rejected                                                                                                                                                                                                                               |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A. Unsubscribes only; everyone re-confirms                     | Loses most lists: nfpSynergy found 16% would opt in to future appeals, and Unicef UK's 79% applied to active supporters only. The re-confirmation email is itself unlawful marketing for people without consent (Flybe/Honda; CASL s.1(3)) |
| C. Trust old flags                                             | No per-address proof (CASL s.13; GDPR Art. 7(1); Porter); breaks C10                                                                                                                                                                       |
| "All channels if unknown"                                      | Stops receipts and the Q8 campaign (ADR-0220 `:16`)                                                                                                                                                                                        |
| One emailed re-confirmation to UK/EU contacts without evidence | Flybe/Honda; CASL s.1(3)                                                                                                                                                                                                                   |
| The CASL 2-year gift rule for every Canadian ministry          | s.10(13)(a) covers registered charities only                                                                                                                                                                                               |
| The same list sent from both Asym and the email tool           | Two writers for one consent (Q1 rejected side by side)                                                                                                                                                                                     |
| Adopting SMS consent in v1                                     | No SMS transport (ADR-0028; Q8 clause 2); evidence is kept for the SMS owner                                                                                                                                                               |

## 6. Open for counsel

1. Do UK GDPR, EU GDPR (Art. 3(2)) or PECR reach a US or Canadian ministry emailing UK or EU donors?
2. CASL questions:
   - Is a missionary's appeal sent through Asym sent "on behalf of" the registered charity?
   - Does a gift from one spouse cover the other?
   - Does a gift through a donor-advised fund count?
3. What basis remains for a Canadian ministry that is not a registered charity? Is a plain update or appeal with no commercial element a non-CEM for it?
4. Québec P-39.1 s.12 and s.22: was philanthropic prospection a disclosed purpose, and which wording satisfies s.22?
5. Is using the ministry's own country for contacts with no postal country acceptable?
6. After a death, who may receive receipts and statements (executor, surviving spouse), in the US and under the CRA?
7. How long must consent evidence and suppression records be kept?
8. From r2: TCPA consent after a vendor change, and the effective date of the revoke-all amendment.
