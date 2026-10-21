# Q35 — who may deliberately continue an expired referral

Research and answer-review date: **October 18, 2026 Asia/Bangkok**. Repository
`9cada8f3d8ab59db391d3fd20df77fcadeb09813` and current working tree.
The [corrected D34 decision and required amendments](phase28-d34-expired-referral-history-adversarial-review.md#explicit-ratification)
are explicitly ratified. **Q35 is answered A; tenant customization and disable
are requested.** The [D35 review](phase28-d35-referral-continuation-adversarial-review.md)
returns **Accept with required amendments**; the corrected decision and all
required amendments were explicitly ratified on October 18, 2026 Asia/Bangkok. This remains research under the
[founder boundary](phase28-founder-brief.md:21), not a formal specification,
permission grant or implementation authorization.

<a id="the-single-choice"></a>

## The original choice (answered A)

Maya finds an expired referral in her history and wants to pursue it again.
The referral is otherwise eligible to continue under the organization's current
source and privacy rules. This is an illustrative scenario, not an observed
incident or a claim that every expired referral can continue.

**Should Maya be able to continue the eligible referral herself, or should authorized staff make that decision?**

- **A — Allow missionary continuation when permitted (recommended).** Maya
  deliberately returns an eligible referral to active work when the organization
  authorizes her to do so. Authorized staff can still act within their own scope.
- **B — Authorized staff only.** Maya asks staff to continue the referral through
  their ordinary work. Missionaries cannot make that change themselves.

Both preserve the referral's history, require current action authority and keep
access and contact rules in force. Neither sends anything automatically. History
visibility alone cannot authorize continuation. Neither option grants old private
context, revives consumed tasks or makes withdrawal, invalidation or privacy
revocation equivalent to ordinary expiry.

A is recommended because it avoids a routine staff handoff for work the
organization deliberately permits Maya to manage. B centralizes the decision and
keeps missionary action rights narrower, at the cost of that handoff. This is a
product judgment, not measured Core user preference or proof that all ministries
need missionary self-service. No new approval queue is implied by either option.

## Why this question is now ready

D34 settled the preceding historical-discovery question. Its C23 expressly
reserved who may continue an expired referral; ratifying history did not settle
action authority. The [founder brief](phase28-founder-brief.md:137) requires
deliberate continuation after expiry while preserving contact restrictions, but
does not select the actor. Current source ownership and permission boundaries
permit a bounded actor choice without first inventing an expiry duration.

Independent governance and primary-research reviews agreed that no additional
product prerequisite blocks this one question. Exact source qualification still
blocks implementation activation. An actor decision cannot substitute for that
proof and does not reopen D34's ratified history design.

| Evidence inspected                                                                                                                                                                                                                           | What it establishes                                                                                                   | Limit for Q35                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [D34 C23](phase28-d34-expired-referral-history-adversarial-review.md#exact-required-amendments) and [ratification](phase28-d34-expired-referral-history-adversarial-review.md#explicit-ratification)                                         | Limited history and its amendments are accepted; continuation actor remains separate.                                 | An eligible history row is not an action grant.                                                                                                           |
| [Founder brief](phase28-founder-brief.md:137)                                                                                                                                                                                                | Referrals need provenance, expiry, cannot-pursue dispositions and deliberate continuation.                            | No actor, universal duration or mandatory new introduction is selected.                                                                                   |
| [P9 canonical edges](../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:353), [owner constraint](../../../prds/program-roadmap/owner-constraints.md:81), [CRM Core](../../../../openspec/specs/crm-core/spec.md) | Native CRM owns relationship identity, lifecycle and provenance; P28 consumes qualified commands.                     | A complete exact expired-referral continuation producer has not been established by the bounded investigation. A browser status edit is not a substitute. |
| [P12 principal and scope](../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552)                                                                                                                              | A missionary can hold bounded current tenant capabilities without being made staff; role names alone never authorize. | Does not automatically grant this continuation action or determine an organization default.                                                               |
| [P12 purpose/contactability](../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1654)                                                                                                                           | Readability, current action authority and contactability remain separately governed.                                  | Continuing work cannot bypass restrictions or imply permission to send.                                                                                   |
| [P27 reopening](../../../prds/sitestacker-parity/phase-27-donor-development/partnerships.md:377) and [CRM delta](../../../../openspec/changes/add-donor-development/specs/crm-core/spec.md)                                                  | Genuine cultivation return preserves history and rechecks current eligibility, responsibility and consumed effects.   | Cultivation reopening is not referral continuation. Its staff example neither authorizes nor forbids the narrower missionary action proposed here.        |

The D34 implementation inspection remains bounded static evidence: the legacy
missionary donor DTO/status mutation is not a qualified referral-history or
continuation contract. This question does not claim a deployed referral command,
actual database policy, migration or provider behavior has been tested. The
native ownership and governing privacy floors continue to apply under either
answer; external examples cannot override them.

## Fresh primary comparison

All four official pages were freshly opened on October 18, 2026. Retrieval is
distinct from publication/update date. No authenticated competitor application
or Core user study was tested.

| Primary source and date                                                                                                        | Documented behavior                                                                                                                                                                   | Useful lesson and conflict boundary                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [MPDX — Status, MPD Phase](https://help.mpdx.org/article/162-mpdx-status-mpd-phase), updated September 18, 2023                | Expired Referral is discoverable through All Hidden; contact status can be changed directly, individually or in bulk.                                                                 | Supports a deliberate direct action rather than a compulsory staff handoff. Its contact-wide status, bulk edits and retained data are not Core referral-renewal authority, contact consent or a selected bulk-continuation feature.   |
| [TntConnect — TNT Phase](https://www.tntware.com/tntconnect/help/en/pages/contacts_mpdphase.aspx), undated manual              | Expired Referral means a reasonable contact window passed. The guide suggests checking with the original referrer for updated information; refusal and unresponsiveness are separate. | Stale context deserves judgment. The suggestion does not mandate referrer reconfirmation, expose their identity, require staff approval or define a universal timer.                                                                  |
| [Dynamics 365 — Reopen leads](https://learn.microsoft.com/en-us/dynamics365/sales/re-open-lead-sales), updated May 29, 2026    | Closed Leads offers Reactivate Lead; availability depends on roles, licensing and administrator configuration.                                                                        | Demonstrates deliberate continuation within configured authority. A disqualified sales lead differs from an expired referral. The public article body was readable despite an authorization banner; no authenticated access was used. |
| [Pipedrive — Archive deals and leads](https://support.pipedrive.com/en/article/archive-deals-leads), updated September 3, 2026 | Explicit Unarchive action; unarchiving one's own items is documented as allowed. Standard visibility applies, and archived items can still support email.                             | Demonstrates separating action, visibility and contact behavior. Core must not copy ownership-as-permission, email access or archive semantics.                                                                                       |

These pages do not establish a required second staff approval for every ordinary
reactivation. That absence is not proof that no customer uses approvals. They
support offering a scoped direct action, while the actual authority and source
requirements remain Core decisions.

## Simple journey and limits of the question

If A is selected, the design direction is one contextual **Continue referral**
action for an eligible, currently authorized user. The result should explain the
source-confirmed current state and any real next step. Do not add a compulsory
explanation, repeated confirmation, referrer-reconfirmation form or approval
inbox without an actual source requirement. The precise command and UI remain
subject to the answer review and later qualified design.

Under B, staff act through their ordinary authorized source tools; this does not
select a new request system. In both cases, an unavailable action must not expose
protected referral details or encourage a workaround. Current privacy and
contactability may still limit what work is possible after continuation.

Neither choice selects a new follow-up duration, required fresh-referrer
evidence, bulk continuation, automatic new task, cultivation reopening,
notification or expansion of historical fields. These remain separate source
contracts or product choices where actually unresolved. Do not combine them into
this actor question or make the user choose an implementation mechanism.

Before activation, the eventual source path needs current tenant/actor/action
checks; preservation of source identity/history; distinction between ordinary
expiry and other adverse states; safe correction/concurrent continuation/retry
outcomes; honest UI success/failure; and current permission checks after waiting
or switching context. These are inherited qualification needs, not a new formal
specification or completed test suite.

## Status and preservation

D34 and all required amendments are ratified. Q35 is answered A. The founder
requests tenant customization/disable and a complete simple journey. D35 records
the corrected decision and amendments, explicitly ratified on October 18, 2026
Asia/Bangkok. One organization-wide control and initial Off are now ratified
product judgments; no universal expiry duration is selected. The original
answer review posed no Q36; [Q36 research](phase28-q36-referral-window-policy-research.md)
now records the separate unanswered period-policy choice. The
[original unanswered question](d35-evidence/q35-before-answer.txt) is preserved.
Original D34 evidence and exact pre-ratification D34/Q34 snapshots remain
preserved. The new [ratification verification](d34-evidence/ratification-verification.json)
checks current status, unchanged exact decision/C/P wording, local references
and prior hashes. No earlier model, probe or verifier ran. No formal PRD, ADR,
OpenSpec, implementation ticket, application/schema, live data, external
communication or GitHub state is changed.

The [pre-ratification Q35 snapshot](d35-evidence/q35-before-ratification.txt)
preserves the exact earlier status. [D35 ratification verification](d35-evidence/ratification-verification.json)
checks unchanged decision/amendments, current status and evidence preservation.
No earlier model, probe or verifier is rerun.
