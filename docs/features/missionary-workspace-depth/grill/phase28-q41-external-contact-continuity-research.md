# Q41 — contact updates for an existing external fundraising tool

Researched **October 18, 2026 (Asia/Bangkok)** against Core
`9cada8f3d8ab59db391d3fd20df77fcadeb09813` and its research working tree.
[D40 and its required amendments are explicitly ratified](phase28-d40-informational-missed-gift-adversarial-review.md#explicit-ratification).
**Q41 is answered B — Keep contact work in Asym.** The founder selected B on
October 18, 2026 and requested tenant control, complete UX research and a full
adversarial review. The [completed D41 review](phase28-d41-native-contact-work-adversarial-review.md)
returns **Accept with required amendments**; exact wording and amendments were
**explicitly ratified on October 18, 2026 (Asia/Bangkok)**. The [original unanswered question](d41-evidence/q41-before-answer.txt)
is preserved. This continues the [founder research session](phase28-founder-brief.md:21);
it creates no formal specification, implementation, integration activation,
ticket or external communication.

## The original product question, now answered B

Maya's organization is moving its work into Asym. During the transition, she
still uses an existing, organization-approved fundraising tool. An authorized
contact correction is made in Asym.

**Should the organization also be able to send approved contact updates from
Asym to that tool?**

- **A — Allow optional contact updates.** When the organization enables a
  qualified connection, eligible current contact details can flow one way from
  Asym to the supported tool. Asym remains authoritative; private preparation
  and notes stay excluded.
- **B — Keep contact work in Asym (recommended).** Add no external contact-update
  feed in this release. The separately governed giving feed retains its existing
  scope and qualification requirements.

This asks about an additional contact-update purpose. Neither answer removes
the accepted financial feed, grants access to all contacts, changes D17's inbound
contact-file intake, or makes a third-party tool necessary for ordinary Asym
work. The scenario is a possible transition journey, not an observed Asym
customer workflow or a claim that a connector is live.

## Recommendation and strongest alternative

The original recommendation was **B** on the available evidence; the founder
subsequently selected it. The following preserves the recommendation and its
strongest alternative. The founder's primary outcome is useful
native relationship work without another database. The already accepted P21/P31
giving feed supplies a bounded continuity option. An additional contact purpose
creates real disclosure, stale-copy and correction responsibilities; a concrete
design-partner need for it has not been established in this session. B keeps the
release smaller without withdrawing the accepted giving feed.

**A** is a credible alternative for organizations that need a longer transition:
an approved correction in Asym could reach the incumbent tool without someone
entering it twice. Missionary-software documentation demonstrates that this job
exists and that competing contact edits can confuse users. That supports asking
the question, not assuming demand or promising correct delivery. If A is chosen,
the selected purpose needs its own bounded source/field/recipient contract and
exact provider qualification through the existing feed owner.

Two independent document reviewers agreed that this is an unresolved product
choice. One favored A for transition continuity; the other favored B without
evidence of a design-partner need. The recommendation above is a product judgment,
not consensus, a usability result or a measured ministry preference.

## Repository facts and boundary reconciliation

| Evidence                                                                                                                                                                                 | Established meaning                                                                                                                                                                  | Consequence                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| [Founder outcome](phase28-founder-brief.md:11) and [connection scope](phase28-founder-brief.md:241)                                                                                      | Native workspace is the primary home; incumbent DonorHub/TntConnect/MPDX continuity is bounded and optional, with a useful manual path during outages.                               | A must remain a transition capability. B retains native work and the existing giving-feed scope.                                          |
| [ADR-0097](../../../adr/0097-source-authoritative-missionary-support-feed.md:5)                                                                                                          | P28 relationship/contactability families require separate ratification. P31 composes the authorized outbound feed; P30 owns inbound migration.                                       | Existing financial-feed approval does not approve a contact-update resource. This is a genuine new product choice.                        |
| [P28 owner constraints](../../../prds/program-roadmap/owner-constraints.md:143) and [P31 owner constraints](../../../prds/program-roadmap/owner-constraints.md:451)                      | Organization records stay organization-owned; export permission and privacy remain distinct. No P28 feed resource exists by implication.                                             | A cannot turn ordinary contact visibility into external disclosure authority or widen P21's financial field floor.                        |
| [P21 D8](../../../prds/sitestacker-parity/phase-21-field-accounts-decision-log.md:2444) and [quiet setup](../../../prds/sitestacker-parity/phase-21-field-accounts-decision-log.md:2682) | Feed is Off by default; staff use exact destination/recipient setup, bounded preview and truthful status. Stop sharing denies future disclosure without claiming downstream erasure. | These are inherited constraints, not new settings questions. A does not auto-enable contact sharing on existing subscriptions.            |
| [D17 C03](phase28-d17-contact-import-adversarial-review.md:191)                                                                                                                          | Selected self-service CSV/XLSX intake adds/reuses eligible contacts; historical relationship facts, notes, tasks and financial history are excluded.                                 | Neither option expands inbound migration or silently imports an external CRM database.                                                    |
| [CRM Core](../../../../openspec/specs/crm-core/spec.md:14)                                                                                                                               | Asym-owned server contracts retain identity and domain authority; external references do not become competing truth.                                                                 | P9 owns contact facts, P28 the proposed disclosure purpose, and P31 transport. No bidirectional edits or hidden external conflict winner. |
| [Roadmap open decisions](../../../prds/sitestacker-parity/roadmap.md:4219) and [source-specific adapters](../../../prds/sitestacker-parity/roadmap.md:4420)                              | Continuity scope remains open; adapters start from a concrete design-partner use case.                                                                                               | Product need and exact provider evidence must precede implementation; a logo or settings card is insufficient.                            |

These are intended owner contracts. This continuation does not establish that
an external contact feed is implemented, production-authorized or deployed. No
new authenticated provider, runtime, database, RLS or application test was run.
Earlier D40 implementation observations remain evidence for that bounded review,
not proof of this integration's capabilities.

## Primary comparisons opened for this question

All pages below were retrieved on October 18, 2026. Publisher dates are recorded
separately. Public documentation was inspected; no authenticated competitor
installation or independent customer study was tested.

| Source                                                                                                                                | Documented evidence                                                                                                                                             | Lesson and limit                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [MPDX data sync rules for Cru staff](https://help.mpdx.org/article/1021-mpdx-data-sync-rules-for-cru-staff), updated December 4, 2020 | Organization systems supply contact information. The article reports staff complaints when old contact values reappeared after local edits.                     | Continuity can meet a real user job, but unclear correction authority creates friction. This dated vendor-reported feedback is not Asym user research. Do not copy content-based identity matching or locked-field workarounds. |
| [MPDX FAQ](https://help.mpdx.org/article/202-mpdx-faqs), updated September 25, 2024                                                   | Documents daily organization donation updates and says additional organizations stopped being admitted in 2024.                                                 | Show actual currentness; do not advertise MPDX as generally available. Exact installed-base authorization still needs proof.                                                                                                    |
| [What is DonorHub?](https://www.tntware.com/donorhub/faqs/en/what-is-donorhub.aspx), no publication date shown                        | Positions its managed integration as allowing an organization to change donation systems while staff retain their MPD tools.                                    | Supports the transition job, not a verified Asym contact API or provider capability. Funding, security and reliability marketing claims are not adopted as evidence.                                                            |
| [HubSpot data sync](https://knowledge.hubspot.com/integrations/connect-and-use-hubspot-data-sync), updated October 2, 2026            | Documents direction, field review, pre-activation review and connection health. It also says its filters limit initial admission rather than all later updates. | Learn clear setup and status. Core requires current authority on every read/egress; initial-only filters, arbitrary mapping, broad resync and two-way conflict rules do not meet that contract.                                 |

The evidence supports clear source ownership, explicit sharing and honest
delivery status. It does not establish that all missionaries need another
contact connection, that any provider is qualified for Core, or a universal
refresh interval. Those unknowns cannot be resolved by calling a pattern a
modern best practice.

## Journey and safeguards preserved under either answer

1. Maya's ordinary contact work remains in the existing workspace, with current
   permissions and no connector dependency. No additional setup appears on her
   home dashboard merely because the organization has a giving connection.
2. If A is selected, staff configuration reuses the accepted **Settings →
   Integrations → Missionary tools** journey. Show the exact destination and
   recipient, the bounded information to be shared, meaningful omissions and
   the consequences of stopping. Do not create a new settings matrix or generic
   field-mapping builder.
3. Contact access is not export permission, newsletter enrollment or permission
   to contact someone. Source suppression, anonymity, current relationship scope
   and restrictions apply before enumeration and delivery. Approved contact
   information must not reveal an otherwise hidden donor through cross-feed
   correlation.
4. Private prospects, preparation, notes, interactions, coaching, tasks and new
   financial fields are outside this question. A is not a general relationship
   history feed. Existing P21 fields retain their own closed floor.
5. The authorized Asym source owns corrections. Destination limitations must be
   visible; unsupported meaning is omitted explicitly or blocks that capability.
   A delivery attempt or fetch cannot be labeled successfully applied without
   the exact provider evidence. Ordinary Asym work continues during delays.
6. Existing subscriptions do not gain contact scope automatically. Current
   recipient/subject and purpose authority must be separately proved. Stop
   sharing blocks future disclosure, including queued work; already downloaded
   provider/local/export/backup copies cannot be promised erased.
7. TntConnect remains limited to a vendor-authorized, production-certified
   DonorHub pathway; MPDX remains limited to explicitly authorized installed-base
   organizations. Restricted/high-risk workers retain the existing exclusion
   from ordinary activation. A positive product choice is not provider approval.
8. Use shared Base UI/base-maia patterns, plain text states, accessible keyboard
   controls and phone reflow. Actual UI qualification is future work; this note
   adds no mock screen or claim of usability testing.

If A is selected, the next review must settle the exact closed resource purpose,
correction/removal behavior and independently falsifiable authorization,
delivery and migration evidence before that family can be ratified. Existing
ADR-0097 obligations are not optional. If B is selected, no contact-update family
is added by this phase; the already governed feed and native workspace remain.

## Frontier status

D40's notice-policy integration, source qualification and runtime verification
remain delivery obligations, not another founder choice. The broader required
recurring-attention purpose still needs its named P16/source-work reconciliation;
D40 does not remove it. This question neither settles nor silently drops that
seam. No general question about whether required attention exists is needed.

Broader legacy-history migration would reopen D17's expressly bounded intake;
it is not implied by this question. Previously ratified referral timing,
coaching, email, newsletter and starting-guide choices remain intact.

**Q41 is answered B.** The [D41 review](phase28-d41-native-contact-work-adversarial-review.md)
records the selected release exclusion, exact tenant/native/giving boundaries,
all 22 review categories and proposed acceptance evidence. Its corrected wording
and required amendments are explicitly ratified. The original answer review
posed no Q42. No formal specification, implementation, live setting, ticket
or external communication is created.
