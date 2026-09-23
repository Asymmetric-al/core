# Q29 — Independent final actual-question review

**13 September 2026. D1–D28 and all amendments are founder-ratified; Q29 remains unanswered.**

**Disposition: Pass.** The actual [question](phase26-q29-requester-help.md) presents one genuine product fork, three distinct alternatives and a single justified recommendation. No change to the founder-facing question is required by this review.

## What was checked

Read the actual question, [root evidence](phase26-q29-evidence.md), [independent gap review](phase26-q29-gap-review.md) and [vendor/UX research](phase26-q29-ux-research.md). Compared the question to the current D1/D27-C/D28 decisions, the exact P23/P24 owner contracts identified in the gap review and its [12 Git-object source pins](phase26-q29-data-source-evidence.json). Independently inspected the root's additional FAQ source observation in the current WSL checkout. No formal specification, runtime, database, provider or public content was changed.

| Review point                     | Result and reason                                                                                                                                                                                                                                                                                                    |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Genuine remaining choice         | **Pass.** D27-C governs staff discovery and internal consultation. Q29 chooses requester-facing discovery breadth. D1's direct intake and email continuation remain required; D28's feedback decision is separate.                                                                                                   |
| Three real alternatives          | **Pass.** A offers a small relevant public selection beside Contact support; B adds no contextual guidance panel while retaining ordinary CMS pages; C adds a dedicated browsable/searchable Help destination. They are different product scopes, not three renamed settings or a requirement to build all three.    |
| Single recommendation            | **Pass.** A is named and justified by point-of-need guidance plus immediate contact. The question does not imply that A is already selected or that it is universally best regardless of a tenant's actual content.                                                                                                  |
| Fair B and C cases               | **Pass.** B is explicitly strongest for sparse content or individual review. C is explicitly strongest for a substantial maintained library and independent browsing/search arrivals. C is allowed to be elegant and shareable; it is not portrayed as inherently cluttered, another CMS or technically improper.    |
| Immediate human contact          | **Pass.** Every option retains direct Contact support before or without search, article reading, rating or sign-in. Missing guidance leaves contact useful. No requester archive, chat or AI is introduced.                                                                                                          |
| P23/P24 ownership                | **Pass.** Public presentation/content remain Web Studio-owned. Site/locale/route/public discovery must be qualified by their current owners. The question does not turn app context into a personalized public CMS audience or claim that current reader methods implement a finder.                                 |
| Staff versus requester discovery | **Pass.** Internal Staff guides and private CRM/care data stay outside the public population. D27's ability to select Shared-by-link Pages for staff does not permit public suggestion/catalog/search. The current public-discovery disposition remains decisive.                                                    |
| Context and domain actions       | **Pass.** The illustration preserves permitted task context without claiming an actual tenant statement policy. Public suggestions do not inspect private giving/care records; actual receipt, identity or giving actions remain separately authorized. Reading is not Support intake, identity proof or completion. |
| Email Studio/P6 and D28          | **Pass.** Opening Help or reading guidance sends no email and creates no feedback opportunity. P17 governs only a subsequently qualified message and P6 its delivery. The question does not create a second form ledger or sender.                                                                                   |
| Evidence classification          | **Pass.** Vendor flows are evidence of actual documented alternatives, not proven Asym outcomes. Legacy Zendesk Classic is identified as such in the supporting research. P23/P24/P25 planning is not reported as deployed behavior. Tenant content volume and observed usability remain unknown.                    |
| Stage and precision              | **Pass.** Q29 is explicitly unanswered, and no D29 ADR or accepted glossary term is created. Article counts, layout, taxonomy, source schema and analytics are not frozen in an unselected question. The full selected-answer review follows the founder's choice.                                                   |

## One supporting-document clarification

The first independent gap and UX research drafts included a small search capability in A. The actual root question is narrower: A promises a small contextual public selection and immediate contact, **not a new full-library search/catalog**; C explicitly supplies the larger browse/search destination. The gap report now has an explicit final-question reconciliation preserving its earlier exploratory research as history. The same clarification was sent to the UX research owner so linked research cannot silently enlarge A.

This is a documentation-scope clarification, not a defect in the actual question. Public search that already belongs to P23 remains available under its existing contract; the narrow A neither disables it nor automatically adds a new Support-owned search UI.

## Current FAQ observation

Read `apps/donor/app/(public)/(hero)/faq/faq-client.tsx`, lines 34–91, at Core HEAD `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. It contains a hard-coded `FAQ_DATA` array with organization-specific financial, tax, receipt and policy assertions, including an explicit GiveHope reference. This supports the root's precise observation: a polished FAQ interface is not an authoritative tenant-curated public guidance source. No statement is made about deployed exposure or the truth of those assertions for any real tenant.

The earlier bounded filename query used Help/contact/intake terms and therefore did not include `/faq/`; its report expressly disclaimed a repository-wide or runtime absence conclusion. The new observation is consistent with that limit. Nothing in Q29 proposes copying the hard-coded claims or treating them as Asym policy.

## Final conclusion

The question is ready to present with **A — Relevant public guidance beside Contact support** as the single recommendation, B and C fully visible, and Q29 left unanswered. The source-owner, direct-contact, privacy, no-message-on-browse and no-second-CMS boundaries are coherent. This pass does not substitute for the selected answer's full adversarial review or later implementation/release proof.
