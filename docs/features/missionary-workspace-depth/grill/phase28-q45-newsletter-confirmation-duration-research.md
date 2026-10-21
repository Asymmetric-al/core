# Phase 28 Q45 — the standard newsletter confirmation duration

October 18, 2026. **Q45 answered A — Seven days.** The [D45 decision](phase28-d45-seven-day-confirmation-decision.md) records seven elapsed days (168 hours). The question and recommendation below preserve the preparation context.

[D44](phase28-d44-standard-confirmation-period-decision.md) records the founder's
choice of one standard finite Asym period, with no staff timing setting.
The original question explicitly left its numeric value open. At that checkpoint,
the next product decision was how long a reader has to complete the email-confirmation
branch; the implementation and time calculation remain engineering obligations.

## One question

**Q45 — How long should readers have to confirm their newsletter signup?**

- **A — Seven days (recommended).** More time for delayed email or returning
  later, with a clear deadline and no extra settings.
- **B — Three days.** A shorter confirmation window; readers need to start
  again sooner if they miss it.

Both mean elapsed time from the request's original durable acceptance: seven
days is 168 hours; three days is 72 hours. The action must occur strictly before
the resulting deadline. Delivery, opening, resend, retry or disabling signup
does not restart or pause the window. Current stronger rules may stop completion
earlier. Neither option would affect the duration of an established subscription,
D42's qualified immediate Join, or the separate data-retention policy.

## Research and recommendation

The [current six-source research](d43-evidence/q44-primary-research.md) documents
Broadcast's supported seven-day option, Brevo's 30-day DOI period, and
Mailchimp's warning that email delivery can be delayed. It also documents
24-hour and indefinite vendor behavior; indefinite authority conflicts with
Core's already ratified finite rule. These products do not define Core policy.

Seven days is a **product judgment**: it allows more time for ordinary delays
and a reader returning later without retaining action authority for a month.
It is not evidence that missionaries or supporters check email weekly, or
that seven days maximizes conversion. Three days preserves a shorter exposure
window but offers less completion time. It is a newly presented alternative,
not a ratification of D6's earlier unadopted 72-hour recommendation.

Thirty days has a direct mainstream precedent but retains uncompleted authority
longer; a one-day period offers less margin for delayed delivery. These are
considered alternatives, not additional default settings. There is no user
research proving one duration optimal. A free-form founder answer remains valid;
the two options keep the interview focused.

## UX and owner boundaries

The reader sees **“Confirm by [date] at [time] [time zone]”** in the permitted
email/protected review, using the source deadline and localized formatting.
The initial P17 selector-only doorway remains generic. No countdown, date picker,
additional modal, compulsory account or new duration control is introduced.
Expired readers may deliberately start again only through an available
authorized signup route; opening an old link never makes a fresh request.

Whichever duration is selected must be captured explicitly in the native source
policy and qualified with D43's exact-boundary, lock-wait, delayed-delivery,
retry, current-consent, disable/reenable, restore and accessible recovery cases.
Do not substitute an Auth OTP lifetime, provider deduplication limit or local
calendar-day rule. Broader owner reconciliation and qualification remain gates;
no actual native source/provider/UI result is asserted here.

The founder subsequently selected A. [D45](phase28-d45-seven-day-confirmation-decision.md)
records 168 hours from original acceptance; this is an explicit answer, not an
inference from D44. Retention remains separate. The [session continuation](phase28-session.md#next-conversation-step)
tracks subsequent answers and the current frontier. No formal specification, application/schema, GitHub state, live system or
real communication is changed. Earlier evidence remains preserved and no prior
program/model was executed.
