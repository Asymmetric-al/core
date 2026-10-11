# D28 practice evidence — optional giving ratings alongside foundational facts

Fresh primary-source research retrieved **2026-10-11 UTC**. The founder selected
A+B: retain foundational facts and offer giving ratings that a tenant can disable.
This appendix examines nonprofit practice and donor dignity. It does not select
an algorithm, enablement default, threshold, task cadence or implementation.

## Assessment

**A+B is a defensible product direction with explicit limits.** Published products
establish a real financial-segmentation use for RFM: giving recency, frequency and
amount. They do not establish that it measures a ministry relationship, predicts
this tenant's results or should determine who deserves care. Foundational facts
remain the useful common experience for financial and nonfinancial partnerships.

Three distinctions matter most:

- Giving ratings, composite engagement scores and external wealth/capacity
  estimates are different products. The latter two are not implied by A+B.
- Configuring weights, hiding a profile component, restricting a user's access
  and disabling tenant-wide computation/use are different controls. The reviewed
  documentation does not establish that every vendor offers the last control.
- A relative score can change when other donors' data changes. A numerical drop
  alone does not prove a change in this supporter’s giving or relationship.

## Current primary evidence

All linked pages were opened on the retrieval date. Undated pages have no verified
publication/update date; relative dates are reported as displayed, not converted
into invented dates. These are published descriptions, not live product tests.

| Source, date and product scope                                                                                                                                                                                                                                                           | Verified published facts                                                                                                                                                                                                                                                                                                               | Limits and implication                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **S1. [Blackbaud RFM Giving Analysis](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-gb/content/bb-rfm-analysis.html)**. Undated Raiser’s Edge NXT help.                                                                                                      | Defines RFM through when, how often and how much a donor gives. Recommends it for appeal-response analysis and cautions against exhausting high-ranked donors or neglecting lower-ranked donors.                                                                                                                                       | A credible financial comparison. Its claims about interest and future giving are vendor guidance, not demonstrated effects in Christian missions. This page documents no tenant calculation-off control or configurable formula.                                     |
| **S2. [Salesforce: Configure RFM Scoring in Nonprofit](https://help.salesforce.com/s/articleView?id=sfdo.npc_fr_set_up_rfm_scoring.htm&language=en_US&type=5)**. Undated; Lightning Experience, Enterprise/Unlimited/Developer with Nonprofit Cloud; Fundraising_Admin permission group. | Admins select source/destination fields, source weights and component ranges. Sources must use compatible units; the calculation does not convert them. Monetary inputs need consistent currency. Computation can run manually or on a schedule.                                                                                       | Genuine configurability, not a universal ready-made formula or verified single off switch. This concerns Nonprofit Cloud Fundraising, not NPSP. Core need not copy its object picker or processing engine.                                                           |
| **S3. [Salesforce: Scoring Frameworks](https://help.salesforce.com/s/articleView?id=sfdo.npc_fr_scoring_frameworks_help_increase_fundraising_success.htm&language=en_US&type=5)**. Undated; same Nonprofit Cloud editions.                                                               | Describes individual R/F/M components and a combined score for reporting, segmentation and lists. Admins add scores to selected record pages. Values update when the calculation job runs.                                                                                                                                             | Separates display configuration from computation and establishes possible update lag. Published prediction/benefit language is not evidence of accuracy for Core. Removing a page component is not demonstrated tenant-wide disablement.                             |
| **S4. [Bloomerang: engagement calculation](https://help.bloomerang.com/en/articles/12632614-how-is-engagement-level-calculated-and-what-does-it-tell-me)**. Dated **2026-01-28**, Bloomerang CRM.                                                                                        | Describes a proprietary composite incorporating giving/pledges, memberships, soft credits, interactions, volunteering, website activity, email opens/clicks and communication preferences. Unsubscribing and reduced giving are negative factors in its published description.                                                         | This is broader than giving-pattern ratings and differs from D26/D27. The page does not document customer-editable weights or tenant-wide off. Do not infer either availability or impossibility from that omission.                                                 |
| **S5. [Bloomerang: Summary Page](https://help.bloomerang.com/en/articles/12632736-about-the-summary-page)**. Displayed “Updated over 2 months ago”; Bloomerang CRM.                                                                                                                      | Separates giving summary, engagement and a DonorSearch generosity measure. Engagement uses Cold through On Fire labels; generosity also incorporates wealth/property/philanthropic information.                                                                                                                                        | Financial history, composite engagement and externally informed capacity are not synonyms. These labels are vendor vocabulary, not a suitable default judgment about a church or person. No corresponding Core enrichment feature is implied.                        |
| **S6. [Bloomerang: User Permissions](https://help.bloomerang.com/en/articles/12632881-user-permissions)**. Displayed “Updated over 3 weeks ago”; CRM web/mobile, with version-specific caveats.                                                                                          | Restricted transaction permissions can also hide constituent-summary engagement/generosity information and other application areas.                                                                                                                                                                                                    | Evidence that derived measures can need financial access protection. Hiding information from selected users does not establish organization-wide calculation-off or a way to disable just the rating while preserving all facts. Do not copy its permission bundles. |
| **S7. [DonorPerfect: Donor Score explanation](https://www.donorperfect.com/nonprofit-technology-blog/fundraising-software/donor-score/)**. Published **2025-12-11**.                                                                                                                     | Describes a 0–100 score weighted 40% recency, 30% frequency and 30% monetary value, recalculated nightly. Compares donors with others in the tenant, separating individuals from organizations. Explicitly says other donors' giving can shift a donor's score. Uses internal giving history, not external enrichment, for this score. | A concrete alternative to fixed financial bands, with cohort-dependent changes. Formula details are this vendor's published model, not a Core recommendation. Its efficacy claims are unvalidated here; customization/off is not established.                        |
| **S8. [DonorPerfect: Donor Score factsheet](https://www.donorperfect.com/factsheets/donor-score/)**. Undated current product factsheet.                                                                                                                                                  | Says Donor Score is included in every DonorPerfect system, shown on donor profiles and available for constituent-list filtering/sorting.                                                                                                                                                                                               | Corroborates a current financial-analysis feature. “Included” does not mean a tenant cannot disable it, nor prove that it can. A testimonial is not comparative usability evidence. The linked detailed knowledge-base page returned only a loading/CSS-error shell. |
| **S9. [AFP: Donor Bill of Rights](https://afpglobal.org/donor-bill-rights)**. Undated current statement, jointly developed with other fundraising bodies.                                                                                                                                | Describes voluntary philanthropy, respectful and confidential handling of donation information, professional relationships and truthful answers.                                                                                                                                                                                       | An ethical reference, not a technical prescription, universal agency policy or legal determination. Neutral financial language and limited disclosure are product applications of these principles.                                                                  |

## Material concerns and exact proposed clarifications

Severity concerns consequence; likelihood below is qualitative exposure if the
mistake is implemented. No frequency in Core or missions agencies was measured.

**P1 — Relationship-worth inference. High impact; plausible.** S1/S4/S5/S7 use
language that can blur giving with broader engagement. Proposed clause: “Giving
ratings describe a defined financial pattern only. They do not rate a person's,
church's or ministry's worth, faithfulness, generosity, relationship quality or a
missionary's performance. Actual exchanges, outreach, preferences and follow-up
remain separate facts.” Prefer a compact financial descriptor with explanation
over flames, stars, a donor tier badge or a primary red/green health meter.

**P2 — Optional only cosmetically. High impact; plausible.** Proposed clause:
“Disabling tenant giving ratings ends their current operational use and new
rating-derived attention effects; merely hiding a card is insufficient. Ordinary
facts, permitted financial reporting and independently required work remain
available. Retained historical evidence is not presented as a current rating.”
The review must state how pending rating-only review work is handled without
silently completing genuine independent obligations. This is the founder's
requirement, not a claim that all compared vendors already do it.

**P3 — Rating drop misrepresented as donor behavior. High impact; credible from
S7.** Proposed clause: “An attention reason identifies whether the change came
from source giving, elapsed observation time, correction, coverage, cohort or
policy. A recalculated rating alone is not evidence of withdrawal or breach.”
Do not silently discard the enabled-mode review behavior contemplated by B;
qualify its concrete internal-review predicate. Do not generate repeated work
merely because the calculation ran again or label internal review as a required
solicitation. A rating never overrides an agreed follow-up or restriction.

**P4 — Financial lens and missingness. High impact; plausible.** Proposed clause:
“Show the subject, financial scope, observation period, source coverage and
calculation date. Distinguish not applicable, insufficient/unknown data, unavailable
data and an actual observed financial band. Neither no visible gifts nor a missing
rating becomes low relationship engagement.” A church's total agency giving is
not automatically giving to one missionary's ministry. Preserve authoritative
money/currency meaning; commitments, received gifts, soft credits and in-kind
valuations are not interchangeable inputs.

**P5 — False objectivity or configuration burden. Moderate impact; plausible.**
Proposed clause: “Expose the reason and relevant component facts for a rating;
identify the policy used. Do not present a band as a calibrated probability of
giving unless separately validated.” A tenant off control does not require an
arbitrary formula editor, external wealth screening or a second analytics suite.
Exact permitted configuration belongs in the owner review; a proprietary or
opaque composite is not necessary to honor B.

**P6 — Disclosure through derivatives. High impact; plausible.** Proposed clause:
“A rating, sort order, filtered result, count, export or task preview respects the
same qualified financial/context authority as its inputs and purpose.” Financial
ranking can expose information even when the amount is hidden. A missionary's
access to a partnership does not automatically authorize comparison against every
other ministry. Keep donor/public surfaces free of internal ratings; do not add
any donor input or checkout step for this feature.

## Mission-context pressure tests and the strongest alternative

These cases are illustrative, not reported agency workflows:

- A prayer partner has no financial participation. Foundational relationship facts
  remain useful; the financial rating is inapplicable rather than a weak score.
- A church gives annually while another supporter gives monthly. A shared band
  may describe different financial patterns, but does not establish a missed
  obligation or justify a contact before an agreed date.
- A supporter gives unchanged amounts while the comparison cohort changes. Any
  relative movement must explain the cohort effect, not claim declining support.
- A historical import or corrected refund changes apparent totals. Recalculation
  must not manufacture fresh donor behavior, contacts or duplicated review work.
- The tenant disables ratings. Existing follow-ups and qualified finance work
  remain actionable; the ordinary partnership view still works without scoring.

**Strongest narrower alternative:** facts, direct financial filters and explicit
review reasons without a combined rating reduce interpretation and maintenance
costs. A+B preserves that experience for tenants declining ratings. The benefit
of optional B is convenient financial segmentation for organizations that want
it; the evidence does not justify making it the default relationship lens or
claiming improved donations. Nor does it justify removing B after the founder
selected it.

Before activation, use real authorized staff/missionary evaluation to check that
people can explain a band's financial scope, distinguish giving recency from
D27 exchanges, recognize nonapplicable data, interpret a cohort-only change and
understand what off does. Verify rating-derived work independently from actual
obligations. No interview, pilot, measured preference, runtime test, success rate
or vendor efficacy comparison was performed here. No new public communication,
vendor integration, product code or formal owner document was changed.
