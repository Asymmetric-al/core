# Q19 frontier — first support for a ministry or for the organization

Research date: October 16, 2026 (Asia/Bangkok). **Founder answered A.**
D18's corrected newsletter-writing decision and required amendments are explicitly
ratified. This note preserves the original independent product choice. The
founder selected ministry/project-first support and requested deep UX research
and a full adversarial review. The [completed D19 review](phase28-d19-first-support-follow-up-adversarial-review.md)
concludes Accept with required amendments. The founder subsequently explicitly
ratified the corrected D19 decision and amendments on October 16, 2026 UTC.
Neither ratification nor this note creates a task/communication producer.

## The single product choice

Grace already gives to another ministry in the organization. She now makes her
first qualifying gift to Maya's ministry. Maya may reasonably want to recognize
that beginning of support even though Grace is not a new donor to the organization.
This is an illustrative scenario, not an observed user interview.

**Should Maya's first-support thank-you task be triggered by the first gift to
her ministry/project, or only by the donor's first gift to the organization?**

- **A — First support for the ministry/project (recommended).** Create the
  eligible personal follow-up when someone first supports that ministry/project,
  even if they already give elsewhere in the organization.
- **B — First support for the organization.** Create this particular first-gift
  follow-up only when the supporter is new to the organization's giving history.
  Other qualified follow-up reasons and manual relationship work remain available.

Recommendation: A recognizes the start of support for the particular ministry
without calling Grace a new organizational donor. It fits the missionary's job.
B produces fewer distinct first-support tasks, but can omit a meaningful moment
for a newly supported ministry. This is product judgment, not a measured increase
in giving, a universal ministry practice or a competitor-selected policy.

This choice concerns an **internal personal-follow-up task**. It neither sends
thanks automatically nor changes receipting, creates consent or grants donor
contact details. An organizational receipt may already contain thanks; it does
not by itself prove this separate personal interaction occurred. The task must
explain its reason and respect the existing scope, privacy and contact rules.

## Why this is genuinely open

- The [founder brief](phase28-founder-brief.md:165) already requires native
  source-qualified first/special/fulfillment/recurring-attention tasks. It says
  first/special must be defined relative to qualified history and purpose,
  preserves recognition/allocation/anonymity distinctions, and forbids duplicate
  effects and automatic donor-facing thanks from task existence. We are not
  reopening whether native tasks exist.
- [P28 retained owner obligations](../../../prds/program-roadmap/owner-constraints.md:74)
  place task and audience purpose in P28 while financial, eligibility, content
  and dispatch facts retain their owners.
- The [P28 roadmap](../../../prds/sitestacker-parity/roadmap.md:4173)
  requires first-gift work but does not choose organizational versus ministry
  first-support scope in the inspected clause.
- [P35](../../../prds/sitestacker-parity/roadmap.md:4837)
  explicitly keeps native P28 work independent of its later optional workflow
  pack. Its [first/special-gift section](../../../prds/sitestacker-parity/roadmap.md:4843)
  distinguishes organization-first and designation-first profiles and requires
  completeness-qualified history. The existence of both later profiles does not
  choose P28's initial meaning.
- The [ownership split](../../../prds/sitestacker-parity/roadmap.md:4859)
  retains P13 contribution truth, P14 recognition, P16 commitment/occurrence truth,
  P9 shared task sources and P28 native personal follow-up. A ministry/project is
  not automatically identical to one designation, a login or a responsible worker.
- D1–D18 resolve many visibility, communication, coaching and connection decisions,
  but do not select this first-support basis. Neither D16's goal nor D17's imported
  contact can establish a first received gift.

## Current source evidence

Read-only inspection, not a hosted or end-to-end qualification:

- The [missionary task API](../../../../packages/api/src/missionary-portal/tasks.ts:21)
  includes a `thank_you` task type. Its create path writes a
  [manual missionary task](../../../../packages/api/src/missionary-portal/tasks.ts:69)
  with `is_auto_generated: false`; the type alone is not a qualified gift-driven
  task producer or a definition of first support.
- The [task update path](../../../../packages/api/src/missionary-portal/task.ts:44)
  derives completion time from task status. Completing that row does not itself
  establish an actual call, sent message, donor response or received gift.
- The [dashboard presenter](../../../../packages/missionary/components/dashboard-view.ts:48)
  consumes a portal snapshot. A loaded/capped display or existing `first_gift_date`
  field cannot supply completeness-qualified financial history by convention.
  The [current service](../../../../packages/api/src/missionary-portal/service.ts:194)
  reads at most 250 legacy donations for the missionary. The
  [legacy first-gift backfill](../../../../supabase/migrations/20260214090000_foundation_1_schema.sql:384)
  calculates a donor-level minimum date, without the proposed ministry and
  settlement qualification. Neither is the future first-support authority.

This bounded portal/task search did not establish a live first-gift producer.
It does not prove absence across every branch/deployment or assert that existing
manual tasks are production vulnerabilities. Source qualification and retained-data
migration remain necessary; the interview does not change those APIs.

## Targeted primary comparisons

Checked October 16, 2026. No authenticated product test or real donor data was used.

| Source                                                                                                                                                       | Documented behavior and useful lesson                                                                                                                                 | Limit                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [TntConnect MPD tutorial](https://www.tntware.com/tntconnect/help/en/pages/contacts_mpdtabtutorial.aspx), undated                                            | The tutorial's first-gift example concerns joining the user's support team and proceeds to a thank-you task. Useful relationship-specific stewardship precedent.      | Does not specify an integrated organization's canonical ministry/designation history or settle Asym's policy.                                          |
| [MPDX notifications](https://help.mpdx.org/article/1199-notifications), updated 2022-09-26                                                                   | Documents task-generating event choices including a partner starting giving and special/larger or resumed gifts. Distinct reasons help explain why follow-up appears. | Does not define the history scope for started giving. Its optional task switch is not adopted over Core's required native task behavior.               |
| [DonorElf News Feed Events](https://donorelf.helpscoutdocs.com/article/34-news-feed-events), historical indexed evidence; retained update 2016-11-24         | Search-index text associates a new donor's first gift with a suggested thank-you note. Clear event/reason/action remains useful.                                      | Fresh direct open still returned 404. Not current demonstrated behavior, reliable first-scope definition, or authority for catch-up/retention rules.   |
| [Virtuous email receipt template](https://support.virtuous.org/hc/en-us/articles/360050894512-How-do-I-Create-an-Email-Receipt-Template), updated 2025-07-02 | A receipt email may include warm thank-you wording with a tax receipt.                                                                                                | Do not falsely claim receipts never thank people. Neither the email nor tax receipt establishes completion of a distinct missionary relationship task. |

These comparisons support intelligible personal follow-up. They do not prove
fundraising improvement, select a financial algorithm or introduce dependencies.

## Original investigation frontier, now resolved by the D19 review

The following prospective questions are retained as the original research
frontier. The completed review supersedes their conditional framing with exact
C01–C24 requirements and P01–P30 release proofs; they are not unanswered product
questions or permission to infer financial/contact authority.

If A is selected, qualify the stable ministry/project subject and its exact
financial/designation mappings. A new worker, login, assignment, designation code,
page, import or recurring plan cannot automatically restart first-ever history.
Only the qualified allocation belongs in the missionary projection. Unknown or
incomplete history cannot be represented as “first” merely because the visible
list has no older row. Preserve upstream temporal-attribution gates rather than
invent a workspace substitute.

Define the source occurrence and permanent purpose identity, current responsible
person, safe task reason, same-purpose reuse and coordination with organizational
work. Distinct intended communications may coexist; the same obligation must not
be duplicated by events, correction, imports or future workflows. Native work
must function with those optional workflows disabled.

P14 legal donor/recognition/recipient distinctions and anonymity remain controlling.
[Church-member acknowledgment exclusion](../../../prds/sitestacker-parity/phase-14-donor-credit-operations.md:1023)
is not silently reopened by A. The separately reserved
[mediated thank-you idea](../../../prds/sitestacker-parity/phase-14-donor-credit-operations.md:1173)
is another product/owner question, not implied by this task. A new recurring
arrangement's [initial payment](../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:535)
is not necessarily the supporter's first-ever gift; pending/failed payment is
not received support. P16 missed-occurrence notices do not become automatic
outreach by analogy with first-support work.

If B is selected, use an explicit organization-history basis without exposing
other ministries' giving or treating a lack of missionary visibility as no
previous gift. Preserve other independently qualified follow-up and manual work.

The review after the answer must resolve corrections/refunds, out-of-order and
historic imports, multiple currencies/commitments, simultaneous gifts, DAF and
church/remittance/household recognition, anonymous or uncontactable supporters,
shared project ownership, lost responses, task completion and current permissions.
These are requirements to research and qualify, not additional choices silently
accepted now. No numeric threshold, contact authority, send rule, data model or
activation is selected by preparing Q19.
