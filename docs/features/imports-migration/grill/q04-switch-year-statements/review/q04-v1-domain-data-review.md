# Q4 review v1: domain correctness, data and safety

Independent review of the founder's Option A for switch-year tax documents (`q04-decision-as-asked.md:11-20`, Parts 1–8). 2026-11-02, develop `629cb71dc`. Read-only; writes only this file.

**Labels.** _repo-ratified / repo-published / repo-integrated_ (re-read here at the cited line); _verified-primary / verified-vendor-doc_ (carried from r2/r4 with their URLs; not re-fetched); _inference_; _assumption_. Legal conclusions belong to counsel.

---

## 0. Disposition and ranked concerns

**Accept with required amendments.** A's core rule is the simplest safe model, and Canada needs it whichever option is chosen: each gift is documented by one system, and Asym never documents a gift the old system recorded. As written, though, A leaves some gifts with **no** tax document, and it does not make the "Asym never receipts imports" promise enforceable. Four parts are also overbuilt or conflict with owner contracts.

| #   | Concern                                                                                        | Severity                  | Likelihood  | Effect                    |
| --- | ---------------------------------------------------------------------------------------------- | ------------------------- | ----------- | ------------------------- |
| K1  | Asym can still receipt imported gifts: the fact is neither enforceable nor atomic              | Critical (CA) / High (US) | Medium      | Changes Part 3            |
| K2  | Tail gifts that only a processor records get no document from anyone                           | High                      | Medium-high | Changes Part 1; amends Q1 |
| K3  | Gifts Asym records before its document purposes or Canadian pack are live get no document ever | High                      | Medium      | Adds a gate               |
| K4  | "Received" is undefined, so the same check can land in both systems or in neither              | High                      | Medium-high | Changes Part 1            |
| K5  | The old system, or the ministry, cannot actually issue                                         | High                      | Medium      | Adds a gate               |
| K6  | Part 1's "may skip the old year-end statement" invites the _Durden_ problem                    | Medium-high               | Medium      | Delete                    |
| K7  | Part 2 ties tax season to tail closure, is unenforceable, and "two seasons" is false           | Medium                    | High        | Move to decommission      |
| K8  | Part 3's four-value status and per-gift checklist                                              | Medium (overbuild)        | High        | Replace                   |
| K9  | Part 8's distinct prefix conflicts with Phase 18; retention is incomplete                      | Medium                    | Certain     | Replace                   |
| K10 | Part 5: Support overview coupling, label honesty, import dating                                | Medium                    | Medium      | Narrow                    |
| K11 | Part 4: Late Fact Obligations are still created                                                | Low-medium                | High        | One owner sentence        |
| K12 | Document corrections after refunds or chargebacks of imported gifts                            | Low                       | Medium      | One clause                |
| K13 | Prototype routes render any `donations` row as a receipt or statement                          | Low                       | Low         | Spec test only            |

---

## 1. Concerns

### K1 — Asym can still receipt imported gifts

- **What goes wrong.** Part 3 records a four-value status and says "Asym never receipts any of these". It sets no immutability, no atomic write and no enforcement point. Owner texts as they stand route imports into issuance:
  - P7 E3 says "manual/imported/historical gifts … can be receipted" (`phase-07-…md:339`).
  - Published #577's positive test makes an imported contribution reach the Phase 18 request (r3 §1; not re-fetched).
  - B1 has no origin input (`:262`), and every read re-evaluates the mutable fold (`:219`).
  - CO's `unknown_offline` precedent lets a governed correction append successor facts that turn a not-receiptable gift receiptable (`contribution-operations.md:130-135`).
  - Under an active Canadian pack, Phase 7 creates a permanent plan fact "in the same transaction as source intake/posting" for every eligible cash occurrence (`phase-07-…md:307`), and "every other intake path" must consume it (`:64`; `statement-operations.md:422-423`).
  - Cumulative coverage excludes only "already individually receipted … or otherwise covered" facts, which means Asym's own coverage (`statement-operations.md:431-434`).
- **Why it matters.** In Canada, a second official receipt for an already-receipted gift: CRA penalties of 5–10% of the eligible amount, or 125% if false (r2, verified-primary). In the US it breaches C7 (`decision-log.md:104`) and P13 (`phase-13-…md:726`). Evidence: repo-ratified/published as cited; the outcome is inference.
- **Fix.**
  - One fact: _documented outside Asym_. Write it in the transaction that records the gift, before the plan is resolved.
  - Put it on the contribution, not the Party, so donor merges cannot move or drop it.
  - Let the database refuse invalid states. The preferred carrier is an immutable `document_authority ∈ {asym, outside_asym}` on the contribution header, set only by the Phase 13 import and backfill commands. Plan facts, receipt versions and statement inclusion rows then reference `(tenant_id, contribution_header_id, document_authority)` with `CHECK (document_authority = 'asym')`. This copies P7's issuer-binding composite FK (`:307`). An insert-only 1:1 Phase 7 row is an acceptable alternative.
  - Add a BEFORE UPDATE/DELETE trigger, which also binds `service_role`. Revoke TRUNCATE. Grant nothing to `authenticated` or `anon`, and FORCE RLS.
  - Take the tenant from the composite FK, never from the caller. Set the actor from the import run's re-proved authority (C16).
  - No staff UI toggle. No correction, merge, re-dating, refund or re-import command accepts the field.
  - Amend E3 and #577 before Phase 7 is built. This is time-sensitive, like D12.

### K2 — Processor-only tail gifts are documented by no one

- **What goes wrong.** Q1 clause 6 deliberately creates tail cohorts whose gifts come "from the ministry's own PayPal or processor reports for executors SiteStacker does not record" (`decision-log.md:32`). Examples are gateway-native ARB or Stripe subscriptions, and PayPal Standard subscriptions SiteStacker may not record (q01-r2 X2/X3/M5; IPN handling is inference). Q3 extends the same path to template sources (`:73`). A processor charges these gifts and has no record in the old system. Processors issue neither a CWA nor a CRA receipt, and Part 1 forbids Asym from issuing.
- **Why it matters.** Without a CWA the donor cannot deduct a single gift of $250 or more (§170(f)(8), r2 verified-primary). In Canada the gift gets no receipt at all.
- **Effect.** Changes Part 1 and amends Q1 clauses 6–7 (★).
- **Fix.**
  - The issuer is the **donor-record system that recorded the gift**, and processors are never issuers. Tail gifts that only a processor report records are therefore Asym's, under ordinary Phase 7 rules. This adds no new machinery; they simply do not carry the K1 fact.
  - If the old system records a cohort at all, it is both that cohort's single source basis (Q1 clause 9) and its issuer. This prevents double documents.
  - This depends on O13 (`:174`) and on Phase 7 dating from processor settlement evidence.
  - Many of these gifts will arrive after Start. Phase 19 already handles them as supplemental coverage. Advise a final backfill before the year-end Start.
- **Rejected alternative:** the ministry documents them by hand, though only Asym holds them.

### K3 — Gifts recorded before Asym can document them are never documented

- **What goes wrong.** Plan facts exist only for occurrences posted while the pack is active. Activation is prospective, with "Partial/backdated activation … or historical sweep" forbidden (`phase-18-document-purpose-authority-manifest.md:348`), and import cannot activate it (`phase-19-…md:934`). If Asym checkout or batch entry opens first, gifts in the gap get no plan fact, and the old system never recorded them. US purposes are likewise "Dark until … U.S. gates pass" (`phase-18-…manifest.md:132`).
- **Effect.** Adds a go-live gate. Q1 clause 4 already gates checkout on a Settlement Account Binding (`decision-log.md:30`); this gate sits alongside it.
- **Fix.** Asym's official document purposes for each Legal Entity are active before Asym records that entity's first gift. For Canadian receipting this means the Phase 18 pack. Its "Confirm history and activation" task (`:465`) sets a collision-safe starting serial (`:204`).

### K4 — "Received" is undefined, so the same gift can sit in both systems or neither

- **What goes wrong.** Part 1 says "received or charged". Three cases break:
  - a check postmarked before the boundary but keyed in Asym after it;
  - a deposit batch that straddles the boundary;
  - the same check keyed in both systems.

  Staff may classify by gift date against the boundary instant (`CONTEXT.md:11-12`), which puts a check in neither system's documents or in both. Phase 15's duplicate check is a non-blocking warning, and whether its lookback sees imported gifts is unverified (`phase-15-…md:260`). The Q3 generic checklist omits staff gift entry (`decision-log.md:74`), and Q1's "staff CRM editing" (`:33`) may not cover gift entry.

- **Why it matters.** Duplicate Canadian receipts, US documents for gifts that were never received, or no document at all, plus double-counted money.
- **Fix.**
  - Decide the issuer by the recording system, never by gift date, postmark or arrival. Every gift is recorded in exactly one system.
  - Turn "staff gift entry" Off at the boundary in both profiles.
  - Owner requirement on Phase 15: the duplicate warning includes imported gifts.
  - Keep A15 (`phase-07-…md:248`): a December check that Asym enters in January belongs to Asym's prior-year documents. Both the US ("one or more" CWAs) and the CRA (periodic receipts) allow this (r2, r4).

### K5 — The old system, or the ministry, cannot actually issue

- **What goes wrong.**
  - SiteStacker's Statements report is an add-on enabled by emailing WMTEK support, and nothing on its training site covers CRA receipts or receipt numbers (r4 §1; articles 151000115076 and a "canada" search; verified-vendor-doc).
  - SiteStacker's help centre was returning HTTP 402 (`decision-log.md` §7 g3).
  - Template-path sources (spreadsheets, or a vendor subscription that ends at the switch) may lose the ability to issue.
- **Why it matters.** Option A's whole premise fails silently.
- **Fix.** At go/no-go, for each Legal Entity, the ministry names who issues the old system's share — the old system **or the ministry's own process** — and attests that it can. The CRA lets the charity issue by any means, provided serials are unique across the charity (r4 §5). With no attestation, there is no go. Option B would not rescue Canada (C7, `phase-18-…manifest.md:348`).

### K6 — Part 1's "may skip the old year-end statement" (delete)

- **What goes wrong.** SiteStacker's year-end letter "will serve as your receipt for tax purposes" and certifies that no goods or services were received. No SiteStacker article shows its per-gift email carrying that statement (r4 §1; 151000122359 and 151000122018; verified-vendor-doc). A ministry that skips the letter leaves gifts of $250 or more with no compliant CWA. In _Durden_ the deduction was lost on exactly this ground (r2, secondary).
- **Fix.** Delete the permission. The ministry simply continues its existing document practice for the gifts the old system recorded. Asym gives no tax advice here.

### K7 — Part 2 ties tax season to Switch closure

- **What goes wrong.**
  - Asym cannot observe that the old system issued anything (ADR-IM-001:7).
  - Q1 clause 12 blocks "tail closure and decommission sign-off" while any item is open (`decision-log.md:38`). A new item would therefore also hold the tail, and its backfills, open through tax season.
  - Tail extensions are allowed (`:32`), so "at most two tax seasons" is false.
  - With a July boundary and a 12-month tail, the old system issues for two tax years, which keeps it licensed for about 19 months.
  - The glossary's "Switch closed … decommission is recorded" (`CONTEXT.md:24`) is not in Q1 clause 2 (`decision-log.md:28`).
- **Fix.**
  - Make "documents issued" and "records retained" ministry-attested **decommission** items. They block decommission sign-off and Switch closed, never tail closure.
  - Advise ending or handing over tail gifts before 31 December.

### K8 — Part 3's four-value status (overbuilt)

- **What goes wrong.**
  - SiteStacker's export columns name no receipt fields, and receipt fields mean different things across CRMs (r4 §1–§2). Nearly every row would be "unknown", and the per-gift checklist would flood.
  - "Not the ministry's to receipt" duplicates the legal-donor rules: DAF sponsors and intermediaries are the legal donor, and soft credits are `is_receiptable = FALSE` (`phase-07-…md:264`).
  - "Not yet receipted" is the old issuer's own knowledge, and Asym never acts on it.
  - None of the four values changes what Asym does.
- **Fix.** Keep the K1 binary fact and the K5 per-Legal-Entity attestation. The old receipt number or date, where exported, becomes optional provenance visible to staff only.

### K9 — Part 8's distinct prefix conflicts with Phase 18

- **What goes wrong.**
  - The display is "fixed `R-` plus an unbounded positive `BIGINT`" (`phase-18-…manifest.md:199`), and #944 forbids configurable prefixes (r3 §4, repo-published).
  - Phase 18 already settles continuity at activation (`:204`, `:465`).
  - Retention is incomplete: the CRA requires receipt copies for 2 years but source documents for 6 (r4 §5, verified-primary).
- **Fix.** Delete the prefix and rely on the K3 activation start. Add retention "for the jurisdiction's periods" to the decommission checklist.

### K10 — Part 5: Support overview, label honesty, import dating

- **(a) Support overview.** Its launch allow-list is household support and DAF recommendations only, and "unsupported recognition roles MUST create no fields" (`statement-operations.md:612-635`; `phase-18-…manifest.md:39-45`). Per-gift tax-source labels would amend Phase 19 for a feature that is Off by default. **Delete.**
- **(b) Label honesty.** "Labelled with where its tax document comes from" asserts something Asym does not know. For imported DAF, CanadaHelps or fiscal-sponsor gifts the claim is false, because the intermediary issues. Use neutral wording instead, following Fundraise Up (r4 §3) and the DAF copy (`financial.md:165`).
- **(c) Import dating.** "This year so far" needs P7's gift date in the issuer's time zone, and an unqualified date is "unavailable" (`financial.md:127`). Imported gifts carry no delivery-basis evidence, and Phase 7 fails closed (`phase-07-…md:246`). Without a rule, imported gifts drop **out** of the total, the opposite of what Part 5 intends.
  - **Fix.** Documented-outside gifts keep the old system's civil date as an informational date with no tax basis. Derive it in the source's declared reporting time zone, so the portal year matches the old statement. This also retires D28 (`decision-log.md:154`). It needs O4 (`:166`).
- **Keep.** The gift-detail label and a QCD-style year note (`financial.md:191`). Phase 25 already includes imports in history (`:25`).

### K11 — Part 4: Late Fact Obligations are still created

- **What goes wrong.** Any fact posted after Start creates an obligation that resolves to "no document action" (`phase-19-…md:977-990`; `statement-operations.md:328-331`). Obligations are counted and have a backlog runbook (r3 §3). Tail backfills, refunds and chargebacks would fill that backlog with noise.
- **Fix.** Phase 19 resolves these automatically, with no staff work. Phase 19 chooses whether that means "not created" or "auto-closed".

### K12 — Corrections after refunds or chargebacks

- **What goes wrong.** A backfilled refund linked to an imported original (`decision-log.md:32`) corrects Asym's history, but the old receipt is now overstated. Canada requires the issuer to cancel and replace it (Reg. 3501(4)–(5), r2). SiteStacker documents no chargeback capture (q01-r2 M3). This is an existing ministry duty, not one A creates.
- **Fix.** Item 1 below states that corrections stay with the issuing system. No Asym mechanism is needed.

### K13 — Prototype routes

- **What goes wrong.** `packages/api/src/donor-portal/receipts.ts:15-37` renders a "Donation Receipt" for any owned row; `service.ts:279-301` builds statements by UTC year with no origin filter; `history/columns.tsx:191` shows Receipt on every row. All are repo-integrated removal targets (`phase-19-…md:172`; #1031); imports target Phase 13 commands, not `donations`.
- **Fix.** Covered by the K1 invariant. Add a Phase 30 spec test: no switch goes live while any route renders documents from `donations`.

---

## 2. The fourteen categories

1. **Problem validity, necessity and alternatives — material.**
   - The question is necessary: D4, D26, D27, O15 and O18 are open, and #577 conflicts.
   - Option B (one combined US statement) is vendor norm (r2 §3) and spares the US the old system's tax season. It would need C7 amended, Phase 7 dating and goods/services facts for imported data, supplemental coverage for late imports, and suppression of the old statement. Canada still needs A, so B means **two** models.
   - A is simpler and safer for v1. Nothing is frozen against B later: the K1 fact records provenance, which stays true under any later policy.
   - Too vague: "received" (K4) and "never … tail gift" (K2).
2. **Brittleness — material:** K4, K5, K10(c).
3. **Technical debt — material:** K8 and K10(a) add fields with no behavior. K9 forks Phase 18 numbering.
4. **Edge cases — material:**
   - PayPal or processor-only tail gifts → K2.
   - Pre-boundary postmark entered in Asym, or the same check in both systems → K4.
   - Refunds and chargebacks → K11, K12.
   - Donor merges are safe because the fact is per contribution (K1).
   - Multi-Legal-Entity US+CA tenants: the attestation and the K3 gate are per Legal Entity, and each issuer keeps its own tax time zone.
   - Non-cash gifts: imports already obey describe-never-value (`phase-15-…md:922-926`). The fact excludes donor documents only, not ministry obligations such as Form 8282.
   - DAF, CanadaHelps and fiscal sponsors → K8, K10(b).
   - Soft credits never appear on official documents (r1 §4), so there is no concern.
   - A Canadian old system that cannot issue, or a template source with no statements → K5.
   - A tail spanning two tax years → K7.
   - Time zones → K10(c).
5. **Footguns — material:** K6, K4, K10(b), K13.
6. **Tenant safety — no material concern** beyond K1's enforcement details. The fact takes its tenant from composite FKs to the contribution and the Switch. The donor notice carries no donor data and Asym sends nothing.
7. **Database, RLS and authorization — material (K1):**
   - The fact lives on the contribution, is written in the same transaction, and is insert-only.
   - The FK and CHECK block any plan, receipt or inclusion row.
   - A trigger rejects UPDATE and DELETE.
   - There are no browser grants, and the tenant and actor are derived on the server.
   - No allowed update can flip a gift into receiptable.
   - Current `donations` writes are server-only (`20260625002117_…:161`, `:184-209`).
8. **Source of truth and invariants — material.**
   - **I1.** Each contribution has exactly one document authority, fixed at record time.
   - **I2.** An `outside_asym` contribution never has a plan fact, receipt version or official line.
   - **I3.** Pre-boundary imports and old-system backfills are always `outside_asym`; every other gift is `asym`.
   - **I4.** Each Legal Entity has an attested issuer for the old system's share before go-live.
   - I1–I3 can be made impossible to violate in the database. I4 is attested.
9. **Hidden coupling — material.** Phase 7 (E3, dating, O4), #577, Phase 13 D.6, Phase 15 duplicate lookback, Phase 16/13 O13, Phase 18 activation, Phase 19 late facts, Phase 25 labels, and Q1 clauses 6, 7 and 12.
10. **Failure modes — material:** K5 (silent non-issue), K3, K2.
11. **Lifecycle, temporal, concurrency and idempotency — material.**
    - Activation mid-switch → K3.
    - Late facts → K11.
    - Same-transaction writes prevent a race with Start.
    - Replays converge on Source Record Bindings, a unique fact and the same obligation slot (`phase-19-…md:985-988`).
12. **Data integrity — material:** double counting (K4); portal total against documents (K10).
13. **Security and privacy — no material concern.** Old receipt numbers stay staff-only. Labels name only the organization's chosen previous-system name. There is no new export or send.
14. **Dependencies and integration — material:** SiteStacker's add-on report and help centre (K5); PayPal and processor report quality for dating (K2); other CRMs' licences (K5).

---

## 3. Part by part

| Part                | Verdict                                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| 1 Who issues        | **Keep the core.** Define "recorded" (K4), add the processor-only rule (K2), delete the US skip (K6). |
| 2 Old system usable | **Move** to the decommission checklist and attest it (K7).                                            |
| 3 Receipt status    | **Replace** with one binary fact plus a per-Legal-Entity attestation (K1, K8).                        |
| 4 Late tail gifts   | **Keep** as one Phase 19 sentence (K11).                                                              |
| 5 Full-year view    | **Keep the portal; delete the Support overview change; neutral label; dating rule** (K10).            |
| 6 Timing            | **Keep as guidance.** Add that a tail splits the next year.                                           |
| 7 Donor notice      | **Keep.**                                                                                             |
| 8 Canada            | **Delete the prefix; move retention to decommission** (K9).                                           |

## 4. Current code, owner-doc intent, best path

| Aspect          | Current code                     | Owner-doc intent                                      | Best path                        |
| --------------- | -------------------------------- | ----------------------------------------------------- | -------------------------------- |
| Import boundary | None; prototype receipts any row | P13 D.6 names an undefined fact; E3 contradicts it    | DB-enforced fact (K1)            |
| Canadian plan   | Absent                           | Created at every eligible intake under the pack       | FK-excluded; pack before go-live |
| Late facts      | Absent                           | Obligation resolving to no action                     | Auto-resolved                    |
| Portal          | Receipt button on every row      | Imports shown; no implied receipt (`financial.md:21`) | Neutral label, year note         |

---

## 5. Corrected decision text

**Q4 — Switch-year tax documents. Option A, amended.**

1. ★ **One issuer per gift.** A gift's tax receipts, acknowledgments and year-end statements, and any correction to them, come only from the donor-record system that recorded it. Processors never issue. A gift's date, postmark or arrival never decides the issuer, and every gift is recorded in exactly one system.
   - **Outside Asym** (the old system or the ministry's own process): every gift imported as pre-boundary history, from any source, and every tail gift the old system records. Asym never issues, includes, replaces or corrects a tax document for these gifts.
   - **Asym**, under ordinary Phase 7 rules: every gift first recorded after the boundary that the old system does not record. This includes gifts entered in Asym, such as a check postmarked before the boundary, and tail gifts that only a processor report shows. If the old system records a cohort at all, it is that cohort's source and its issuer. (Amends Q1 clauses 6–7.)
2. ★ **Fixed fact.** Every gift in the "outside Asym" group carries _documented outside Asym_ and its Switch.
   - The fact is written in the transaction that records the gift.
   - No correction, merge, re-dating, refund or re-import can remove it.
   - The database, not only the eligibility check, prevents any Asym receipt, Canadian plan fact or official statement line for that gift.
   - Old receipt numbers or dates, where exported, are staff-only provenance.
   - These gifts keep the old system's civil date as an informational date.

   (Phase 7 defines the fact and amends E3 and #577.)

3. **No work from late facts.** Late backfills, refunds and chargebacks on these gifts resolve automatically to no document action, with no staff task (Phase 19).
4. ★ **Go/no-go, per Legal Entity.**
   - (a) The ministry names who issues the old system's share of the switch year, and of each later year with tail gifts, and attests that it can. This is recorded as a Legacy Surface Disposition, "Tax documents for gifts the old system recorded".
   - (b) Staff gift entry in the old system is Off at the boundary. Asym's check entry warns when a check matches an imported gift.
   - (c) Asym's official document purposes for that Legal Entity are active before Asym records its first gift. For Canadian receipting this is the Phase 18 pack, whose activation sets a starting serial that cannot collide with the old system's.
5. ★ **Decommission, not tail closure.** Two items are ministry-attested on the decommission checklist: "old-system documents issued for every year it recorded gifts", and "old-system receipt copies and gift records kept for the jurisdiction's retention periods". They block decommission sign-off, never tail closure or backfills. (Amends Q1 clause 12.)
6. **Donor view.** Portal history and "This year so far" include these gifts.
   - Gift detail says: "Recorded in {organization}'s previous giving system. Any tax receipt or statement for this gift comes from there."
   - A year that has both kinds of gift adds: "Your tax documents for this year come from both systems; keep both."
   - The Support overview is unchanged.
7. **Guidance, not rules.** Prefer a 1 January boundary and avoid November and December. A tail still splits the next year, so aim to hand over or end tail gifts by 31 December. Asym provides an editable donor notice for the ministry to send. Imports send nothing.

_Revisiting this, for example with a single US statement, needs a new founder decision, and any change applies only to documents issued afterwards. The fact in item 2 remains true under any later policy._

**Deleted from the version as asked:** the US skip permission; the four-value status and per-gift checklist; the Support overview change; the distinct Canadian prefix; "at most two tax seasons".
