# ADR-CD-009: Designation language separates fund, restriction, and memo

**Status:** Accepted (grill session 2026-05-28)

## Context

Contribution detail must show designation context accurately. The words fund, campaign, restriction, and memo are easy to blur, but each has different donor-facing, CRM, legal, and accounting meaning.

The product owner clarified that a fund is the main donor-facing giving destination and can represent a missionary, project, or campaign. A restriction is only for legal/accounting limitations. A memo is donor-provided text that can help identify intent but is not itself a fund.

## Decision

Use the following domain language:

- **Fund:** the donor-facing giving destination.
- **Missionary fund:** ongoing ministry support for a missionary or missionary family.
- **Project fund:** a specific ministry project or purpose; may be ongoing or long term.
- **Campaign:** a shorter-lived fund with a specific goal and defined fundraising season/timeframe.
- **Restriction:** a legal or accounting limitation on how the gift can be used.
- **Memo:** donor-provided note text, often from a paper-check memo line.

A designation line allocates gift amount to a fund. Restriction and memo are separate fields/concerns and must not be collapsed into the fund.

## Consequences

- Contribution detail copy should not call every donor designation a restriction.
- Receipt, CRM post, and reporting language must distinguish donor intent from legal/accounting restriction.
- Paper-check memo parsing can help determine a fund, but the saved designation must point to the resolved fund.
- Campaigns need goal/time/progress semantics beyond generic fund display.

## Alternatives rejected

- **Use restriction for all donor-designated gifts:** Legally and operationally misleading.
- **Treat memo as designation:** Memo is evidence/input, not the resolved destination.
- **Treat missionary/project/campaign as unrelated concepts:** In the giving flow, each is represented as a fund destination, with subtype-specific behavior.
