# Phase 28 D47 — coaching sharing includes the selected end date

October 18, 2026. **Q47 answered A; accepted as selected.** The founder answered
**“A — After 30 November ends.”** The date is the question's example, not an
instruction to create or change an actual coaching share.

## Decision

When Maya chooses an optional coaching-sharing end date, sharing may continue
**through that entire calendar day** in the displayed organization/source-approved
time zone. Use **“Share through [date]”**. For 30 November, the scheduled cutoff
is the start of 1 December in that zone. Access is denied at the cutoff.

Earlier organization limits, revocation and all current access rules still win.
A selected end date never guarantees access until then or extends an earlier
source-imposed limit. Keep the existing optional-date sharing review and an
obvious Stop sharing action; no time picker, additional timing setting, reminder
or new sharing flow is added.

The source resolves and retains the selected date, approved time zone and exact
cutoff when the change is accepted. Later travel, browser clock changes or
organization time-zone changes do not silently move that saved cutoff. Calendar
boundaries handle daylight-saving changes; this is not a fixed 24-hour duration.
Enforce the current cutoff on protected releases and commands even if a cleanup
job has not run, including after lock waits. Existing saved cutoffs are not
recalculated as a migration side effect.

Show the approved time zone beside the date. If an earlier organization limit
applies, explain the effective end accurately, including time when needed; do
not round it to the end of the day. A failed or uncertain Save keeps truthful
status and the existing same-operation recovery. Expired or revoked sharing is
not resumed by retry, old links or a later date edit. A new sharing episode uses
the existing authorized activation flow.

## Scope and supersession

D47 explicitly adopts the whole-selected-day meaning previously recommended in
[D11's decision and C02](phase28-d11-coaching-duration-decision.md#decision).
The [pre-D47 review](d47-evidence/d11-before-d47.txt) preserves that earlier
status. Ongoing sharing, selected modules, historical access, current permissions
and existing organization constraints retain their owners. This does not ratify
the entire D11 packet or select a universal sharing duration or retention period.

## Adversarial check

### What could go wrong with this answer?

Using a fixed number of seconds, a browser zone or delayed cleanup could extend
or shorten access. Preserve the source-resolved calendar boundary and enforce
it directly. A stricter earlier cutoff must never be rounded later.

### What hidden assumptions are we making?

The chosen day has an approved, displayed zone and a supported valid cutoff.
Validation must reject unresolvable or already-passed dates without saving false
authority. This decision does not establish a best duration for every ministry.

### How does this affect the whole product?

It fixes one coaching-share date convention. Newsletter confirmation remains
D45's 168 elapsed hours; referral periods, financial reporting dates and privacy
retention keep their separate rules. No cross-domain timer is introduced.

### How does this affect the end-user experience?

“Share through [date]” makes the inclusive day understandable. The date, zone,
saved state and any earlier limit remain visible in the existing review, with
no additional step or setting.

### Does this follow modern best practices?

[D11's primary-source review](phase28-d11-coaching-duration-decision.md#evidence-checks-and-limits)
supports clear optional expiry and removal. It does not establish a universal
date convention. The founder's explicit choice settles the meaning; actual
comprehension and accessibility still require user-facing qualification.

### Does this fit Asym's existing repo and product direction?

Yes as planning intent: D11's sharing source, P12 current authorization and the
existing Base UI/base-maia review remain authoritative. No new permission system,
clock service or parallel sharing record is required.

### Should we adjust the recommendation?

**Accept.** Record the selected whole-day meaning. The exact calendar calculation
and authorization checks are engineering obligations, not additional questions.

## Future proof and status

Prove access just before and denial exactly at/after the effective cutoff;
DST-short/long days; travel and changed display zones; earlier organization
limits; concurrent revoke/extend; lock waits; existing cutoff preservation;
failed/unknown Save; and accessible phone/keyboard/screen-reader review. No
already-delivered bytes or human knowledge can be recalled by expiry.

These are future outcome obligations, not runtime tests performed here. No
formal owner document, ADR/OpenSpec, application/schema, live setting, GitHub
state or real communication changes. The glossary needs no new term. Earlier
packet statuses and E7/C-01 remain separate; no Phase 28 completion or automatic
transition to formal specification is inferred. The
[session continuation](phase28-session.md#next-conversation-step) owns the next
question.
