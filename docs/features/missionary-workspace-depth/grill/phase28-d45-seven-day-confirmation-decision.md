# Phase 28 D45 — seven days to confirm newsletter signup

October 18, 2026. **Q45 answered A; decision accepted as selected.** The founder
answered **“A — Seven days.”** This records a product decision, not implemented
behavior or permission to change live settings.

## Decision

Native newsletter requests that require email confirmation have **seven elapsed
days (168 hours) from original durable acceptance** to complete confirmation.
The source fixes that original deadline. Confirmation must complete strictly
before it; at the deadline the request has expired. Current newsletter,
recipient and authorization rules still apply and can prevent completion sooner.

This is [D44's](phase28-d44-standard-confirmation-period-decision.md) single
Asym standard. Staff, missionaries and readers have no timing setting. Reading,
resending, retrying, delayed delivery, entry Off/On and organization disable do
not reset, extend or pause the clock. Future platform changes apply prospectively
without rewriting accepted deadlines. D42's qualified immediate Join does not
acquire an email-confirmation step, and confirmed subscriptions do not expire
when this window ends.

Use the actual source deadline in the permitted confirmation email and protected
review: **“Confirm by [localized date] at [time] [time zone].”** Displaying a
different locale or timezone changes presentation, not the instant. Keep the
existing P17 generic doorway and deliberate protected confirmation; no countdown,
date picker, extra modal or forced account. After expiry, offer **Join again**
only through a currently authorized signup entry, requiring a fresh deliberate
request. An old link never creates that request automatically.

## Exact scope and supersession

D45 replaces only D6-C15's proposed 72-hour confirmation lifetime and the
corresponding D6-P19 timing proof with **168 hours**. The original proposal is
[preserved](d45-evidence/d6-before-d45.txt). The three-day alternative in
[Q45](phase28-q45-newsletter-confirmation-duration-research.md) is not selected.
This does not ratify the surviving D6 packet or its proposed 24-hour purge bound.

Confirmation validity is separate from storage, consent-evidence retention,
deletion and backup disposition. D43-C11 and the existing privacy/custody owners
still require qualified, finite schedules before activation. Seven days neither
sets those schedules nor authorizes expired requests to become staff prospect
lists. Exact cleanup operation is an owner/design obligation; a further founder
choice is needed only for a genuinely different user-visible use or policy.
No such new use is proposed here.

## Adversarial check

### What could go wrong with this answer?

Calendar-day arithmetic, resend renewal or a delayed transaction could admit an
expired request. Require a source-derived 168-hour deadline and current time
recheck after any lock wait. Late delivery has an honest expired result and a
permitted fresh-start path; it never extends authority.

### What hidden assumptions are we making?

Seven days is an explicit product choice, not a measured optimum, legal period
or claim about how often missionaries or supporters read email. Provider delivery
and the reader's return time remain uncertain.

### How does this affect the whole product?

It fixes one P28 confirmation lifetime. Auth verification, established newsletter
membership, giving, P6 delivery and privacy retention keep their separate owners.
Tenant controls and current restrictions retain D42/D43 semantics.

### How does this affect the end-user experience?

Readers get a clear deadline and one next action at each existing stage. Staff
have no new setup. An interrupted confirmation recovers the same operation;
success is source-backed and never inferred from sending or opening an email.

### Does this follow modern best practices?

[Fresh primary research](d43-evidence/q44-primary-research.md) shows varied vendor
periods, including seven days, and documents delivery delays. It supports the
tradeoff without proving seven days best. The selected finite period balances
time to return with bounded unused authority.

### Does this fit Asym's existing repo and product direction?

Yes as planning intent: one source-owned rule, D44's simple UI, D42's distinct
immediate Join, D43's current restrictions and the existing P17 protected action.
Supabase/RLS qualification, owner reconciliation and real journey proof remain
required; this document does not establish them.

### Should we adjust the recommendation?

**Accept.** Record exactly seven elapsed days. The safeguards above implement
the already selected meaning; no additional product amendment or ratification
question is needed for this answer.

## Future proof and continuation

The eventual owner implementation must prove 168-hour calculation across DST,
leap dates and changed display timezones; acceptance immediately before and
denial exactly at/after expiry, including lock waits; unchanged deadlines after
resend/retry/disable; current restriction precedence; truthful lost-response
recovery; and accessible email/review/expiry/rejoin journeys. Repeated confirmation
cannot duplicate admission or reverse a later withdrawal. These are future
outcome tests, not tests of a running feature performed here.

D42/D43 and completeness C01–C20 remain unchanged. Earlier D1/D3/D6/D11–D13
amendment statuses and upstream E7/C-01 remain separate. No new glossary entity,
formal ADR/PRD/OpenSpec, ticket, application/schema, live setting or communication
is created. Phase 28 is not declared complete; the next question closes an
existing unresolved product default rather than adding a new feature.
