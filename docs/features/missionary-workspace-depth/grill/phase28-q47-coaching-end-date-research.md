# Phase 28 Q47 — what a coaching-sharing end date means

October 18, 2026. **Q47 answered A — After the selected day ends.**
[D47](phase28-d47-coaching-share-through-date-decision.md) records the choice.
The question and evidence below retain their preparation context.

[D46](phase28-d46-regional-discovery-default-decision.md) records regional
discovery Off until authorized staff enable it for a new organization.
[Clause reconciliation](phase28-post-d46-amendment-reconciliation.md) identifies
one remaining user-visible date convention in D11. This concerns an optional
end date for an already permitted coaching share, not mandatory expiry.

## One question

**If Maya selects 30 November as the end date for sharing with her coach, when
should that sharing end?**

- **A — After 30 November ends (recommended).** Use **“Share through 30 November”**;
  the coach may retain permitted access throughout that day.
- **B — When 30 November begins.** Access ends at the start of the selected day.

Both use the displayed organization/source-approved time zone. Earlier
organization limits, revocation and current access rules still take precedence.
The chosen date is not a guarantee of access until then. No time picker, extra
setting, reminder or new sharing flow is introduced by either choice.

## Evidence and recommendation

[D11's decision](phase28-d11-coaching-duration-decision.md#decision) and C02
explicitly call the through-day convention a recommendation. D11's selected
ongoing sharing and optional date do not themselves settle this boundary.
Later D24 and D26 reuse the sharing duration without adopting a different cutoff.
[Completeness C07](phase28-completeness-adversarial-review.md#c07--amendment-status-and-genuine-policy-gates)
preserves independent disposition of surviving observable policy.

This is a real access-duration choice: the two options differ by the selected
local calendar day. Recommend A because **Share through [date]** communicates
that whole-day meaning directly. B is viable if clearly described as stopping
when the date begins, but offers less of the chosen day. This is product judgment,
not an asserted universal convention or measured preference among missionaries.

The [recent D11 evidence](phase28-d11-coaching-duration-decision.md#evidence-checks-and-limits)
includes current owner requirements and primary sharing/expiry/accessibility
precedents. Those sources support explicit duration and removal; they do not
select this Core-specific date boundary. No new usability study, vendor runtime
test or actual coaching permission change is claimed.

## Implementation consequences, not more founder questions

The owner resolves the selected date and approved zone to one exact cutoff,
retains it and enforces it even if cleanup jobs lag. DST, travel and later zone
settings must not silently change the saved deadline. Earlier source limits
remain their exact cutoff, visibly explained rather than rounded to day-end.
The engineering implementation must prove boundaries, concurrency, revocation,
retries and truthful phone/accessible feedback. Neither choice resumes expired
sharing or changes shared modules, historical periods or other permissions.

Q47 is answered A. D47 narrowly adopts D11-C02's whole-day date meaning;
no blanket D11 or other packet ratification follows. The
[session continuation](phase28-session.md#next-conversation-step) tracks the next
question. E7 and C-01 remain separate
upstream owner gates. No formal document, code, database, live configuration,
provider or real communication changes.
