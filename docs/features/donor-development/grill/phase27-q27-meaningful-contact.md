# Phase 27 Q27 — what counts as recent personal contact

2026-10-11, Asia/Bangkok. **Amended D26 explicitly ratified; Q27 A selected;
amended D27 explicitly ratified with its clarifying safeguards.**
Research/interview only. D21 delegates ordinary controls and recovery details;
this question decides the meaning of a substantive development measure.

## Why this question is next

[D26](phase27-d26-adversarial-review.md) settles voluntary shared working history
and explicitly leaves meaningful-contact criteria open. The original brief's
interaction section requires distinguishing attempted calls, actual conversations,
meetings, sent messages, delivery evidence, automated receipts, internal notes and
Support records. Its relationship-context section separates contact recency from
giving measures and next-action health. These facts are indexed in
[the research log's E1](phase27-grill-log.md#dependency-and-conflict-register).

[P27's roadmap](../../../prds/sitestacker-parity/roadmap.md:4091) requires useful
visibility of untouched relationships and explainable relationship context. Before
such a view can be truthful, the product must decide what its personal-contact
date means. This is not a choice of button, reminder interval or database column.

## Founder question — A selected

**Q27 — If you send a personal message to a church or supporter and have not heard
back, should it count as recent personal contact?**

For example, a staff member sends a thoughtful personal follow-up to a church's
missions leader. There is no reply yet. This is an illustrative scenario, not an
observed tenant workflow or a requirement that every outreach receive an answer.

**A — Count actual conversations and exchanges (recommended).** A completed
conversation, meeting or substantive reply updates the partnership's main
personal-contact date. The personal message remains visible as outreach, with its
response state clear, but sending it alone does not reset that date.

**B — Count personal outreach too.** A purposeful personal message updates that
date even without a reply. Keep the fact that no response has been recorded clear.
This recognizes one-way relationship care, such as a personal thank-you that may
not need an answer.

**Recommendation:** A, because recent outreach and evidence of an actual exchange
are different facts when someone is preparing the next conversation. This is a
product judgment, not an industry standard or measured ministry preference. B has
a credible stewardship benefit; one-way care is not “meaningless.” Both options
keep outreach and actual exchanges distinguishable and visible within permissions.
The founder subsequently selected **A — Count actual conversations and exchanges**
and requested a focused review of current best practices and excellent UX.

## Boundaries in either option

- D26's voluntary missionary participation is unchanged. This is relationship
  context, not a missionary activity score, diligence judgment, logging quota or
  report. Missing or private history means incomplete knowledge, not neglect.
- A record edit, internal note, email-open signal, automated receipt or creation
  of a Support request alone cannot establish meaningful personal contact. A
  truthful manually recorded actual encounter remains eligible evidence under
  the eventual qualified criteria; recording it late does not change when it happened.
- Failed attempts, purposeful outreach, completed conversations and actual replies
  remain distinct source facts in both options. Provider acceptance, delivery and
  an email-open signal do not prove a person read or responded. No unrecorded reply
  may be inferred; unknown coverage is not a confirmed absence of all response.
- An older exchange date does not automatically demand another contact, penalize
  someone, reopen paused/closed work or override an agreed follow-up, quiet period,
  no-contact/never-ask restriction or source-owned obligation. This question does
  not choose aging thresholds, reminder cadence or automatic outreach.
- Preserve one actual encounter and its truthful occurrence date. Reading,
  resharing, correcting or adding another contributor's note is not another
  contact. A private encounter cannot leak through a visible recency date or count.
- Do not silently repurpose P9's generic `lastTouchAt`. Current code maps it to
  `donor.updated_at` in [the CRM model](../../../../packages/api/src/admin/crm/model.ts:58).
  The [earlier source investigation](phase27-crm-research.md:69) records its
  broader operational owner meaning. Neither a database edit nor that existing
  field proves the new development measure is delivered or correctly defined.
- User-facing labels and ordinary display/recovery behavior remain delegated
  design work. Avoid unexplained “meaningful” judgments or red/green moral scoring.
  Do not add a new task, event-log, communication or permission engine.

## Primary comparisons and limits

Checked 2026-10-10 UTC through independent read-only owner/practice research:

- [MPDX coaching documentation](https://help.mpdx.org/article/510-for-mpd-coaches),
  updated **2020-10-28**, distinguishes sent/received messages and attempted/completed
  calls. It supports keeping outcomes distinct, not imposing its activity targets
  or claiming a universal definition of meaningful contact. Rechecked in this
  session's D26 research; published instructions are not current runtime proof.
- [TntConnect Tasks & History](https://www.tntware.com/tntconnect/help/en/pages/taskhistory-overview.aspx),
  **undated**, freshly accessed for Q27, keeps distinct contact-type dates and
  distinguishes relational history from data changes. It supports honest history,
  not an assumption that all tenants use its categories or that A is mandatory.
- [HubSpot default contact properties](https://knowledge.hubspot.com/properties/hubspots-default-contact-properties),
  updated **2026-07-02**, freshly accessed for Q27, includes logged one-to-one email
  in Last contacted and tracks reply information separately. This is a credible
  comparison for B; it does not authorize importing its metric into Core or treating
  sent email as an actual exchange.

Two independent owner/practice reviews confirmed that this fork remains open and
substantive. Repository facts establish the need to define it; external products
demonstrate different useful approaches. No practitioner interview, measured
preference, prototype, runtime experiment or implemented contact measure is claimed.
No prior experiment was rerun. The [ratification/continuation checks](d26-ratification-q27-validation.json)
verify the exact D26 decision and evidence preservation separately from the
question as originally unanswered. Formal PRD/OpenSpec remains for /to-prd and tickets for
/to-issues.

## Recorded answer and focused review

[D27's completed review](phase27-d27-contact-recency-review.md) records **Accept,
with clarifying safeguards**, the exact decision, current primary comparisons,
source/UX findings, edge cases, R01–R08 and AC01–AC16. These are ordinary design
clarifications under D21, not a new material choice or repeat ratification gate.
The founder subsequently instructed, “Yes, ratify this amended D27.” The exact
reviewed decision and its safeguards are now explicitly ratified.

Use **Last recorded exchange** with a short explanation/source descriptor,
**Recent outreach** and the existing **Next follow-up**. Actual conversations,
relevant human responses and substantive human inbound messages can qualify
without a mandatory recorded message pair or a word-count/sentiment threshold.
Sending alone does not. A thank-you needing no reply acquires no waiting/overdue
warning. Completed tasks, calendar metadata, auto-replies, opens and generic
note saves cannot manufacture an exchange.

The date comes from the actual occurrence, not save time or the latest visible
timeline row. Missing, undated, unavailable and private history remain truthful
within current authority. D26's voluntary participation and real source/work
boundaries are preserved. Current broad Last contacted conventions in other
CRMs are acknowledged as credible alternatives, not misreported as supporting
the exact chosen definition.

Fresh research was performed on 2026-10-11 UTC. No new runtime experiment,
prototype, user interview or product implementation is claimed. The
[document checks](d27-evidence/review-checks.json) verify this record and preservation
of prior evidence; real source/UX qualification remains required before activation.
