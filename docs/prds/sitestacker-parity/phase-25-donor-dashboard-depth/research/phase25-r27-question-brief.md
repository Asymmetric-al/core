> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Fully ratified, 9 September 2026:** Conrad accepted Q27 A1–A5/J01–J18/V01–V14/C01–C22, reviewed Maia defaults,24h retired live raw/365d minimized evidence limits, and all source/mail-history/replay/use-generation safeguards. Earlier proposed/unanswered wording below is historical. T01–T20 remain required target proof; ratification does not certify implementation.

> **Current status, 9 September 2026:** Conrad selected A, one current personal mailing address, easy to update. The [completed review](phase25-r27-adversarial-review.md) proposes corrected execution for ratification. The unanswered wording below is historical pre-answer research.

# Question 27 — How much mailing-address management donors need

9 September 2026. Q26 is fully ratified: A1–A5/J01–J18/V01–V14/C01–C22, zero ordinary pledge artifacts for none, authorized history, text progress and all reviewed request/dispute defaults. **Q27 is unanswered.** This is a donor-visible scope choice for completing personal contact details, not a claim that a postal editor or address book already exists.

## The one decision

**For a person's mailing contact with this organization, should the portal let them update one current address, or manage several saved addresses and explicitly choose the current one?**

<!-- prettier-ignore -->
| Option | Donor experience | Benefit | Cost / boundary |
| --- | --- | --- | --- |
| **A — One current mailing address, easy to update. Recommended.** | My details shows the current organization-purpose mailing address. Edit opens a small form; Save records the new current value under its source contract. No personal address library. | A straightforward task for a move or correction; few controls and no separate primary/default-selection concept. | Someone who switches back to a prior address re-enters it or uses browser autofill. This limits the portal capability, not the CRM's storage cardinality or historical evidence. |
| **B — Saved addresses, with one chosen for current mail.** | Donors may add, edit and remove saved postal alternatives, then explicitly select which one the organization should use as current. | Convenient for people who repeatedly switch between real mailing destinations. | Adds address-list, selection, privacy, stale-address and removal behavior. It is additional portal scope requiring a narrow owner contract, not an already shipped contact service. No seasonal scheduler or per-gift address selector is inherent. |

Both options concern the same current personal mailing purpose with one organization. Neither authorizes global profile mirroring, household/org address edits, a billing-address change, postal enrollment or automatic document reissue. Existing staff-held alternatives, source history and permitted purpose-specific destinations remain under their owners; A does not delete or flatten them.

## Concrete example

Illustrative scenario, not an observed ministry workflow: Maria has moved and wants future postal correspondence from this organization to reach her new address.

With A, she opens My details → Mailing address → Edit, replaces the old address and saves. The result clearly identifies the organization/purpose that changed. There is no address collection to maintain.

With B, she can retain both addresses and deliberately choose the new one for current mail. That is useful if she later switches back often. We have not established that repeat-switching is common among Asym donors, so the example demonstrates the tradeoff rather than claiming a ministry requirement.

Under either option, a separately reviewed statement destination follows P19's existing material-change rules. The application must not promise that all outstanding envelopes are instantly redirected, that a printed receipt's address is rewritten, or that a payment provider's billing address changed. Historical documents and already submitted physical work retain their own source truth.

## Best recommendation

**A — One current mailing address, easy to update.** It completes a recognizable donor task with the least additional management UI. The stronger multi-address capability should be chosen because donors need to switch between saved destinations, not because e-commerce products have address books.

This is a product recommendation, not measured evidence that donors never have multiple addresses. B is legitimate and can remain small; it does not have to include seasonal automation, address rules or a general CRM contact manager. If founder knowledge establishes a recurring need to switch addresses, that supports B. No such Asym-specific evidence was found in this research.

The implementation must not make A artificially restrictive: support the qualified international address formats, manual entry and browser autofill; preserve entered values on errors; allow correction without a new account; do not silently overwrite an explicitly updated mailing contact with a later stale wallet/import value. Do not require an address simply to complete a profile percentage. The exact source-required purpose and clear/removal constraints must be qualified in the selected-answer review.

## Repository facts and why the scope is open

Source checkpoint is develop/research HEAD `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. These facts were checked against current source rather than treating an old placeholder or contact reservation as implementation authority.

<!-- prettier-ignore -->
| Evidence | Established fact | Implication for this decision |
| --- | --- | --- |
| [P19 recipient/destination contract, lines626–640](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-19-year-end-statement-operations.md#L626-L640) | Current-primary selection, specific reviewed destinations and material changes differ. One-statement and future-statement choices have separate permissions; provider changes do not overwrite the CRM or silently choose successors. | Postal contact has a real delivery purpose, but editing it is not permission to rewrite all statement routes. The selected review must connect the exact current-contact owner and existing destination contract. |
| [P19 physical fulfillment, lines646–668](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-19-year-end-statement-operations.md#L646-L668) | Source-owned print/mail fulfillment already exists in intended scope, with distinct preparation, download and handoff evidence. | A current mailing contact is not speculative shipping functionality; no new mail-house or postage system is needed. |
| [P7 receipt and Party boundaries](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-07-receipt-statement-compliance-and-donor-credit.md#L236-L258), [frozen receipt facts](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-07-receipt-statement-compliance-and-donor-credit.md#L107) | Personal, household and organization Parties differ; receipt facts freeze legal donor identity/address. | A personal current-contact edit must not change another Party's address-of-record or historical receipt facts. |
| [P4 reserved contact points](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-04-identity-account-claiming-foundation.md#L248), [P9 A7](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md#L370-L379) | Multiple-email/phone contact points are reserved; general contact normalization was rejected for P9 at that stage. | Neither clause mandates one postal address nor permanently prohibits a later narrow saved-address capability. Both options need an explicit current postal owner contract; B must not smuggle in a general normalization project. |
| [P9 thin Party/subtype model](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md#L707-L720) | Party is a thin supertype; new inline contact columns are not the target. | A small UI does not justify a profile/Party JSON shortcut or a new parallel source of truth. This question does not select database tables. |
| Ratified Q11/Q21 | Q11 handles selected email-related changes; Q21 handles communication preferences. Neither selects the donor-visible postal-address management capability. | Preserve their independent scope rather than re-asking email/security, self-service priority or another summary-versus-form layout question. |
| Current donor settings and strict PATCH | The mailing-address fieldset is disabled Coming soon; the accepted settings payload has no postal address. Existing name/phone/avatar writes are sequential profile/donor updates. | This is an incomplete predecessor, not working postal self-service or an appropriate permanent mutation boundary. A new field must not be appended blindly to the generic PATCH. |

**Scope qualification:** this is an explicit new portal capability decision over a real existing contact/delivery purpose. The current repository does not already mandate donor postal CRUD or a saved-address book. A remains the recommended minimum; B adds reusable-address management. We are not presenting either as an already authorized runtime feature or a newly discovered mandatory address-book requirement.

The founder is choosing how much management donors need. Source ownership, field authorization, country support, historical preservation and exact propagation are engineering/owner requirements to resolve through the subsequent complete review, not facts the founder must guess.

## Current primary research

Sources retrieved on9September2026. They establish documented behavior, not comparative Asym completion, satisfaction or mail-delivery rates.

<!-- prettier-ignore -->
| Primary source | Useful evidence | Important limit |
| --- | --- | --- |
| [Fundraise Up — Set or update a mailing address](https://fundraiseup.com/support/set-update-mailing-address/) | Documents a focused Profile settings/Edit address task, distinct from editing a recurring plan's contact address. | Supports a compact edit, not proof the platform has no other address capability. Its latest-activity overwrite and automatic receipt-reissue behavior are not Core authority. |
| [PayPal — Add, change or remove an address](https://www.paypal.com/us/cshelp/article/how-do-i-add-change-or-remove-a-street-address-on-my-paypal-account-help239) | Demonstrates saved-address addition/edit/removal and choosing a home/current address. | A credible consumer precedent for B. Its account-country, billing and PO-box restrictions are PayPal-specific and must not become Asym mailing rules. |
| [GOV.UK — Address entry](https://design-system.service.gov.uk/patterns/addresses/) | Address format must fit the supported countries; autocomplete, sufficient space and manual alternatives matter. | Supports international usability under either option, not a universal UK form or compulsory lookup-provider dependency. |
| [Planning Center — Giving statements and receipts](https://www.planningcenter.com/blog/2023/12/giving-statements-tax-receipts-pro-tips-new-updates) | Advises keeping mailing details current for paper statement delivery. | Older official guidance is a practical purpose example, not new2026 evidence or a reason to import donor nags or legal rules. |

One concrete pitfall deserves attention: Fundraise Up documents that an outdated address returned by an express wallet can become the newest supporter address. Core should keep donor-selected current mailing contact, provider-returned transaction data and historical snapshots distinct. An apparently successful edit that a later payment silently undoes is poor UX and weak ownership.

## Common boundaries for either answer

- Personal organization-purpose mailing contact only. A household, represented organization or another Tenant needs its own exact authority and deliberate context; no automatic cross-role or cross-Party update.
- Mailing contact is distinct from sign-in email, phone used for authentication, card billing details, legal-donor identity and issued documents. Save address does not imply consent, enrollment, a receipt resend, a charge or an amended statement.
- Preserve P19's material-change/review/hold rules for outstanding destinations, including current-primary versus explicitly selected routes and submitted/unknown work. No promise of recalling already printed or handed-off mail.
- One current address in the portal does not delete staff alternatives/history or force single-row database storage. Multiple saved addresses does not create new identities, residency claims, automatic seasons or extra permissions.
- Use shared shadcn/Base UI Maia. A focused postal form does not need a grid, another global settings category, profile-completion meter, new address vendor or generic CRM builder.
- International formats, donor-chosen scripts, long addresses, appropriate PO boxes, countries without postal codes and manual entry need actual source-compatible support. Do not silently standardize away meaning or reject a legitimate address because a lookup fails.
- The selected-answer review must finish the current-value/missing/read-only/ambiguous-source cases, exact field/consumer ownership, concurrent changes and stale imports/provider suggestions, validation, add/edit/clear or saved-selection behavior, durable truthful outcomes, privacy/audit and rollout/proof. Do not split these into arbitrary cosmetic questions.

## Evidence limits and next step

Three independent lanes evaluated Profile coverage and challenged artificial questions. One lane initially favored whole-journey convergence because a postal address book is not an inherited requirement; the narrower scope proposal remains candid about that. The current P19 delivery contract establishes the real postal purpose. More address-management UI requires founder choice and explicit owner extension, not an assumption from a disabled screen or e-commerce popularity.

No target implementation, new tests, database/provider inspection, real postal operation, source/ADR/OpenSpec edit, dependency change or GitHub publication occurred. Q14 G01 and other source/activation gates remain unresolved. Q26's historical bundle is preserved. No /to-prd or /to-issues transition is implied.

**Q27 remains unanswered: A one current mailing address, easy to update, is recommended; B provides several saved addresses with an explicit current-mailing choice.**
