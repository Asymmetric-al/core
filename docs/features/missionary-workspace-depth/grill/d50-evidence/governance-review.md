# D50 governance review — recurring campaign origin

October 18, 2026. Independent, scoped source review of Q50 answer A. This file is
new research evidence only. No formal owner source, ADR, OpenSpec, application,
schema, live configuration or GitHub record was changed. No previous executable
model, checker or probe was executed or imported. The findings below establish
documented contracts and inspected implementation shapes, not runtime proof or
observed user behavior.

## Recommended disposition and corrected decision

**Accept with required amendments.** Preserve the selected origin behavior while
retaining legitimate, separately authorized prospective attribution amendments.

> Each continuing recurring line retains the campaign association accepted for
> that line, including a source-qualified absence of a campaign. Reassigning its
> tracking code does not move later installments to another campaign. Ordinary
> amount, schedule, payment-method, provider-binding or pause/resume changes do
> not replace that association. A deliberate authorized prospective attribution
> amendment may change later eligible occurrences through the existing P16
> versioned command; preserve the original association and all earlier evidence.
> Campaign-only amendments preserve a truthful source code. Generated recurring
> contributions copy their occurrence line's qualified attribution. Independently
> recorded gifts retain their own attribution when matched to a commitment.
> Restart after cancellation uses the existing fresh-checkout contract.

"Original campaign" therefore describes the default continuing provenance, not
an absolute prohibition on correcting a mistake or making an authorized
prospective change. No new tenant choice between live and frozen attribution,
general rule engine, recurring editor, approval engine or physical table layout
is needed to implement this answer.

## Verified ownership and exact amendment inventory

| Source                                                                                                                                                                                                                                                               | Verified contract                                                                                                                                                                          | Minimal owner reconciliation                                                                                                                                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [P13 story 129](../../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:433), [copy-forward](../../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:1606)                 | Source-code origin and display snapshot freeze and copy to installments after retirement.                                                                                                  | Specify that the qualified campaign association, including known absence, is also inherited from the recurring line's accepted attribution version. A later registry mapping is not a new campaign source. Preserve explicit versioned amendments rather than saying all attribution can never change. |
| [P13 live exception](../../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:1608), [campaign-axis contract](../../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:1624) | Current live mapping conflicts with frozen campaign identity, as E7 records.                                                                                                               | Extend D49's ordinary-gift ruling to generated continuing installments: report the accepted line/occurrence campaign basis. The registry remains prospective setup; do not add an independently mutable posted campaign field.                                                                         |
| [P16 ownership matrix](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:428), [term versions](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1565)                                                       | Attribution belongs to the recurring line; immutable term versions permit prospective attribution amendments. Campaign derives through the source code rather than a second mutable field. | Pin the exact accepted campaign meaning at line/version grain. An amount/date/method edit inherits the currently qualified attribution version unless that exact command explicitly and validly amends attribution. Preserve both origin evidence and later amendment history.                         |
| [P16 occurrence lines](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1619)                                                                                                                                                           | Immutable occurrence-line snapshots generate contributions; generation does not reread mutable checkout attribution.                                                                       | Require reconstructable campaign association/known absence and its exact source version on that seam. Do not use a group-, cohort-, invoice- or subscription-wide campaign where lines have different origins.                                                                                         |
| [P16 preview/apply](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:695)                                                                                                                                                               | Authority/revision/claims-bound previews apply under lock; provider operations have permanent identities.                                                                                  | Include relevant attribution version and exact affected line set in prospective amendment acceptance. Claimed/in-flight work retains its accepted snapshot; future unclaimed work may change only through the existing qualified supersession path.                                                    |
| [P16 restart](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:680)                                                                                                                                                                     | Canceled lines never resume in place; new checkout does not carry old attribution forward.                                                                                                 | Preserve unchanged. Pause/resume is continuation; canceled-line Restart giving is a new accepted origin. A provider executor replacement is not that restart.                                                                                                                                          |
| [P16 fulfillment](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:968)                                                                                                                                                                 | An effective contribution line and expectation are distinct; conserved applications join them through several independently qualified proof paths.                                         | State explicitly that fulfillment linkage never overwrites independently captured gift attribution. Contribution-generated lineage may copy occurrence attribution; an after-the-fact match may not.                                                                                                   |
| [ADR-0013](../../../../adr/0013-explicit-recurring-groups-and-compatible-billing-cohorts.md), [recurring OpenSpec](../../../../../openspec/changes/add-recurring-giving/specs/donation-lifecycle/spec.md:5)                                                          | Stable line identity survives cohort split, provider replacement and term/calendar changes; exact line/item allocation is mandatory.                                                       | Add origin-preservation outcomes to the existing line/version/occurrence scenarios. Do not freeze origin at provider subscription, invoice header or group grain; do not require cohort splits solely because reporting campaigns differ.                                                              |
| [ADR-0206](../../../../adr/0206-immutable-posted-financial-facts-and-owner-operational-state.md:19), [D49](../phase28-d49-preserve-earlier-campaign-attribution-decision.md)                                                                                         | Posted facts stay immutable; earlier gift attribution changes through explicit P13 correction, not setup.                                                                                  | Preserve unchanged. A future commitment amendment does not rewrite earlier installments, refunds or independently captured matched gifts.                                                                                                                                                              |
| [Program E7](../../../../prds/program-roadmap/decisions-and-gates.md:51), [P27 owner gate](../../../../prds/sitestacker-parity/phase-27-donor-development/owner-reconciliation.md:41)                                                                                | Recurring-origin, hierarchy, temporal reporting and adapter qualification are separate requirements.                                                                                       | Mark the recurring-origin product choice selected after D50 is recorded. Keep remaining hierarchy/entry-boundary meaning and exact adapter proof explicit; do not declare all E7 closed.                                                                                                               |

This source reconciliation adds semantic evidence to existing owner boundaries;
it does not prescribe new SQL names or duplicate the registry. A hash of source
display fields alone is not proof of campaign association: the accepted evidence
must reconstruct the campaign identity or known absence without today's mapping.

## Material risks and exact prevention

Likelihoods are qualitative implementation judgments given the inspected
contracts, not measured incident rates.

| Concern and why it matters                                                                                                                                                                    | Severity / likelihood                                                | Evidence and effect on answer                                                                                                                         | Exact requirement/prevention                                                                                                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A monthly installment changes campaign because a code was reused. Fundraising results then stop describing the origin of continuing support.                                                  | High / high if P13's live exception is copied.                       | P13:1608 and P16:1569 leave the campaign revision ambiguous. D50 resolves this ambiguity.                                                             | **The recurring line's accepted attribution version SHALL determine the campaign for its generated installments; current source-code registry assignment SHALL NOT replace it.**                                                                                                                                          |
| "Original forever" blocks legitimate prospective changes, or an amount/date edit silently resets origin.                                                                                      | High / medium.                                                       | P16:1569 already admits attribution term amendments; stable line identity survives ordinary changes. Narrows the slogan, preserves capability.        | **Ordinary term, calendar, payment or provider changes SHALL inherit the current accepted attribution version. A different campaign requires an explicit authorized prospective attribution amendment preserving original and prior evidence.**                                                                           |
| A campaign-only amendment invents another source code or directly edits an earlier posting.                                                                                                   | High / medium to high if the older source-code-only shape is reused. | P13:1609 and D49 identify this gap; ADR0206 prohibits posted updates. Required owner extension.                                                       | **Campaign-only amendments SHALL preserve a truthful source code. P16 owns prospective commitment attribution; P13 owns corrections to existing gift attribution. Neither operation implies the other.**                                                                                                                  |
| Shared invoices apply one campaign to every line or a cohort split resets provenance.                                                                                                         | High / medium.                                                       | P16:433,1621–1623 and ADR0013 require stable line and exact item allocation.                                                                          | **Attribution SHALL be line-scoped and copied from the exact occurrence line. Multiple campaign origins may coexist in one otherwise compatible cohort; no first-item or header-wide inference is permitted.**                                                                                                            |
| Matching an independently recorded check or one-time gift overwrites its actual campaign with the expectation's campaign. Reporting then conflates received attribution with fulfillment.     | High / plausible across manual/external workflows.                   | P16:76,191,983–1017 admits independent received gifts and typed applications; D49 preserves accepted gift attribution. No new product fork is needed. | **A fulfillment application SHALL NOT change the source contribution's campaign/source attribution. Received-by-gift-campaign and fulfilled-toward-commitment measures SHALL remain separately labelled and source-qualified.**                                                                                           |
| A delayed callback, retry or in-flight amendment moves an occurrence into a newer campaign version.                                                                                           | High / medium.                                                       | P16:587,703,1615,1623 freeze effective boundaries, claims and snapshots.                                                                              | **Retries and late evidence SHALL retain the exact accepted occurrence/line meaning. An amendment SHALL preserve claimed/in-flight snapshots and affect only owner-qualified later work. Future unclaimed supersession uses the existing source command; immutable snapshots are never patched in place.**                |
| Code retirement/campaign closure cancels lawful collection, forces migration, or silently changes origin; alternatively, preserved attribution is mistaken for permission to keep collecting. | High / medium if lifecycle meanings are conflated.                   | P13:1602,1606,1630 preserve referenced history; P16 independently owns collection authorization.                                                      | **Retirement/archive/closure SHALL NOT itself reassign attribution or reopen a campaign. Retained attribution grants no payment, solicitation or disclosure authority. Collection and amendment eligibility continue to follow their current owners; do not invent an automatic cancel or a forced campaign substitute.** |
| Unknown historic origin becomes "no campaign" or today's mapping; report rebuilds give fabricated certainty.                                                                                  | High / medium for retained legacy records.                           | D49 migration rule and inspected legacy implementation do not supply missing origin proof.                                                            | **Known absence SHALL require source-qualified evidence. Unknown origin remains unqualified for the affected attribution measure; never guess from current registry, first visible payment or caller-provided dates. Preserve independently valid money and schedule facts.**                                             |
| Attribution-only amendments/corrections do not invalidate caches, or hidden campaigns leak through previews and totals.                                                                       | High / medium.                                                       | D49 C03/C06, P13 one projection and disclosure-before-aggregation.                                                                                    | **Projection versions SHALL include relevant attribution changes and exact source coverage. Apply current tenant, entity, role, field and publication authority before rows, labels, totals and exports; no mixed-revision complete claim.**                                                                              |
| Separate P13/P16 history or provider metadata becomes a competing write authority.                                                                                                            | High / medium.                                                       | P16 ownership matrix, ADR0206 and recurring OpenSpec explicitly separate provider evidence, commitment intent and received money.                     | **P16 SHALL own prospective recurring attribution versions; P13 SHALL own posted gift attribution/corrections. Provider metadata and derived reports are evidence/projections only. Cross-owner handoff uses exact source identities, revisions and durable intent.**                                                     |

## Independent gifts and fulfillment: settled engineering boundary

P16's [summary](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:76)
and [application contract](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:983)
make the distinction concrete. A source-consuming application connects an
already effective contribution line to an expectation. Complete recurring
provider lineage is only one accepted authority; donor instruction, structured
remittance and staff-confirmed application are separate paths. A campaign match
is not among the conservation/compatibility checks that creates or changes money.

For example, a recurring expectation retains Campaign A. A separately recorded
gift has accepted Campaign B and is properly applied to that expectation. Its
received attribution stays B; the application may fulfill A's recurring line
under the qualified commitment measure. This is not duplicate money, and the
two measures must not be summed or labelled as equivalent. If the gift's own
campaign was incorrect, use D49's separate P13 correction. The application itself
cannot be repurposed as that correction. The same separation applies to
[recurring-to-fixed coverage](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:997).

**No additional founder question is needed for this boundary.** It follows from
the existing source ownership and D49 rather than selecting a new attribution
policy. D50 should state it to prevent the phrase "all later installments" from
being applied indiscriminately to every gift that eventually fulfills a target.

## Tenant control and the small user journey

Keep existing tenant controls over prospective recurring availability, source
management, role capabilities and applicable amendment/correction approval.
Do not add a live-versus-origin mode or let a general management toggle erase
accepted origins. Missing or disabled future capability must not prevent
qualified protective stops or erase history. D50 does not add donor/missionary
campaign-edit authority or a campaign field to ordinary payment-repair forms.

In the existing campaign/code editor, explain that reassigning the tracking code
does not move existing recurring support. In the existing authorized recurring
detail, show permitted campaign attribution and a clear history. Only an actor
with the actual attribution-amendment capability sees the deliberate amendment
action; a general amount/date/payment change has no extra campaign question.
For a prospective amendment, show old/new campaign, exact affected lines and
effective occurrence boundary, including any already in-flight occurrence that
does not change. Use the existing review, status and accessible error patterns.
Do not equate an accepted metadata-only amendment with a new payment or trigger
a new charge, schedule epoch, provider executor or donor notice merely for
campaign reporting. Any separately needed outward message retains P6/P17 scope.

## Inspected current implementation and limits

The inspected [Stripe recurring handler](../../../../../packages/api/src/stripe/recurring.ts:100)
looks up a legacy `donor_pledges` row by subscription ID and updates its mutable
status and schedule summary. Its documented shape is not the target stable-line,
term-version and occurrence-line attribution contract. The formal
[recurring OpenSpec supersession](../../../../../openspec/changes/add-recurring-giving/specs/donation-lifecycle/spec.md:86)
already says the legacy one-subscription/one-pledge row is migration evidence and
must not be extended as the target write model. An inspected implementation
comment cannot override that ruling.

The [contribution reader](../../../../../packages/api/src/admin/contribution-operations/operations.ts:316)
still reads a flat `donations.campaign_id`, as D49's evidence records. Neither
reader establishes reconstructable commitment-origin campaign evidence,
campaign-only term amendments or correct source-to-occurrence handoff. No actual
database grants, live RLS, retained data or provider campaign state were inspected.
This is a qualification gap, not a proven exploit or claim that every relevant
implementation is absent.

## Required outcome proof and remaining scope

Before activation, prove these observable outcomes using the real source paths:

1. A continuing line with Campaign A, and one with qualified no campaign, keep
   that meaning after registry reassignment and ordinary amount/date/cadence/end/
   method/provider changes, pause/resume and code retirement.
2. An exact prospective attribution amendment changes only its admitted later
   occurrences, preserves the real source code and all previous origin/version
   evidence, and does not change unselected sibling lines or trigger money.
3. A shared multi-line cohort preserves different origins; split/join/provider
   replacement retains each stable line's attribution without first-item fallbacks.
4. Already claimed/in-flight occurrences and retries retain their accepted
   version under concurrent amendment; future unclaimed supersession follows the
   owner contract. Lost responses recover one operation, not another term version.
5. A separately captured one-time/offline gift keeps its attribution after
   fulfillment matching; linkage and P13 correction remain independently governed.
6. Campaign closure/archive retains attribution without auto-cancel, auto-reopen,
   forced substitution or implied current collection/publication authority.
7. Canceled-line Restart giving uses fresh attribution through canonical checkout;
   ordinary resume and provider-binding replacement do not create a new origin.
8. Refunds and earlier-gift corrections follow the exact P13 lineage; a future
   commitment amendment does not reinterpret their campaign retrospectively.
9. Unknown legacy origin, known absence, denied fields and unavailable projection
   are distinguishable; migration never backfills from today's map. Rollback and
   restore cannot switch accepted installment meaning to live mapping.
10. Wrong-tenant/wrong-entity/stale-authority and forbidden old/new states fail at
    API, database/RLS and privileged/import seams; immutable posted rows survive.
11. Attribution-only changes invalidate affected projections; all reports use
    consistent source revisions, admitted line sets, currency and disclosure.
12. The actual shared UI works with keyboard, screen reader, narrow layouts,
    translated/long names and uncertain network outcomes without adding campaign
    decisions to ordinary donor payment or schedule management.

D50 settles the recurring-origin campaign choice. It does not independently
choose campaign hierarchy history, the initial ordinary-gift capture boundary,
or a new import-time inference rule. Those owner meanings and the exact E7
adapter remain to be reconciled/qualified. The design should first combine D49
and D50 with existing owners and ask another product question only if a real
observable policy fork remains. Schema, locking, data census and missing
historical evidence are engineering/source-owner obligations, not founder polls.
