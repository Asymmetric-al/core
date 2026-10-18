# Phase 28 D44 — one standard newsletter confirmation period

October 18, 2026. Core `9cada8f3d8ab59db391d3fd20df77fcadeb09813` and the
research working tree. **Q44 answered A; decision accepted as selected.** This
records the founder's actual choice and the UX that follows it. It adds no
numeric duration, formal specification, application behavior or live setting.

## Decision

**One standard Asym period.** Native newsletter requests requiring confirmation
use one finite Asym-controlled period. Readers see their applicable original
deadline. There is no tenant, Page, missionary or reader duration setting.
Existing tenant signup controls, current recipient rules and D43's original
deadline safeguards remain in effect.

The founder selected A and required clear, excellent UX without needless
complexity. This accepts the standard-period direction; no additional approval
question about that direction is needed. The numeric duration was explicitly
excluded from Q44. The subsequent Q45 answer selects seven elapsed days in
[D45](phase28-d45-seven-day-confirmation-decision.md); it is not inferred from
this control-ownership decision. D6's older 72-hour proposal is superseded. Data retention
is a separate owner policy, not the duration of reader confirmation.

## Simple reader and staff experience

**Staff:** Use the existing settings and permission owners for signup availability
and Page placement, retaining D43's required control behavior. This does not
claim a ready native signup control is implemented. Do not add a duration field,
disabled duration input, advanced override
or per-newsletter exception. If useful, the existing help text can explain the
standard confirmation rule; there is no additional setup task. A template editor
can change permitted presentation but cannot change the source deadline or
publish a contradictory timing promise.

**Reader:** Keep the existing D42/D43 journey. A qualified signed-in reader's
immediate Join still has no pending-confirmation step. For other readers:

| Stage                                      | Clear presentation and behavior                                                                                                                                                                                                        |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accepted request                           | The appropriate privacy-safe check-email receipt. Do not claim delivery or completed subscription before the source establishes it.                                                                                                    |
| Confirmation email                         | Approved newsletter identity, **Continue to confirmation**, and **“Confirm by [localized date] at [time] [time zone].”** The deadline comes from the accepted source record, not the send time or an editable placeholder value.       |
| Initial protected doorway                  | P17's generic inert explanation and **Continue** action. Selector-only GET/HEAD must not disclose newsletter, address, expiry or state.                                                                                                |
| Qualified protected review                 | Approved newsletter facts, the same deadline and **Confirm subscription**. Use the existing explicit protected action without another modal, required donation or account creation.                                                    |
| Completed                                  | A persistent, truthful success result and the permitted unsubscribe/management path. An old receipt does not assert current membership after a later withdrawal.                                                                       |
| Expired or unavailable                     | Show the safe result permitted by current proof. Where expiry may be disclosed, **“This confirmation link has expired.”** Offer **Join again** only through a currently authorized signup entry; it starts a fresh deliberate request. |
| Uncertain result or interrupted connection | Explain that the result could not be checked and allow the same-operation retry. Never show optimistic subscription or extend the original window.                                                                                     |

The bracketed deadline above is illustrative copy, not a live value. Render an
unambiguous localized date/time and timezone; avoid “midnight,” relative-only
dates or a countdown. The deadline marks when the confirmation window ends;
confirmation must finish before it. It is not an end date for an established
subscription. Phone layout, keyboard operation,
visible focus, screen-reader announcements, zoom and long translated text use
the existing shared Base UI/Maia system. No new component library is warranted.
The public intake and protected doorway keep their distinct existing script
requirements; missing confirmation script support gives safe help, not an
alternate token protocol.

## Inherited boundaries and edge cases

These are applications of ratified D42/D43, not new policy choices:

- The source fixes the deadline at original durable acceptance. A later platform
  period change does not rewrite existing pending deadlines. Current stronger
  restrictions can still stop completion earlier.
- Reading, resending, retrying and hiding/showing an entry do not renew the
  request. Organization signup disable blocks admission while disabled; it does
  not pause the clock. Expired, withdrawn or revoked authority stays invalid.
- A delayed email may arrive after expiry. Recovery must not invent a fresh
  deadline or permit new intake through a hidden/disabled entry.
- Locale, travel, DST and device clocks change presentation, not validity.
  Confirmation at the exact deadline is expired, including after a lock wait.
- Different tenants can still have different signup availability, permissions
  and recipient restrictions. A standard period never grants access or weakens
  source rules, Supabase authorization, RLS or the protected-action protocol.
- Auth sign-in/email-verification lifetimes, provider retries and data-retention
  schedules do not supply this period. No subscription expires merely because
  its original confirmation window ends after successful admission.

## Evidence, proportionate review and future proof

The [six-source primary research](d43-evidence/q44-primary-research.md) was
freshly gathered on October 18. It documents materially different vendor
choices; it establishes no universal optimum. D44 follows the founder's
explicit simplicity choice. The strongest alternative, an organization setting,
adds validation, permission and support work without an established Core tenant
need. It is not selected. Indefinite validity is already excluded by D43.

The independent scope and UX checks in this continuation agree that no further
control decision is needed. They recommend seven elapsed days as the next
duration proposal, allowing a reader more time to return. That is a product
judgment, not measured ministry behavior or a conversion guarantee.

The existing [D43 acceptance matrix](phase28-d43-pending-newsletter-confirmation-adversarial-review.md#future-acceptance-and-traceability)
remains applicable. Its eventual implementation must additionally demonstrate:

1. No duration editor or per-tenant override is reachable through staff, Page,
   template or API configuration; authorized presentation still works.
2. The eventual standard value generates the same original deadline in email,
   protected review and authoritative source; changing it prospectively does
   not reset pending work.
3. Exact expiry, delay, resend, retry, disable/reenable, withdrawal and localized
   rendering behave as D43 requires, without a countdown or ambiguous date.
4. The complete accessible mobile journey retains the existing P17 privacy
   boundaries and a truthful available recovery path.

These are future acceptance obligations, not runtime tests run here. No new
behavioral model is needed for this control-removal choice. The
[documentary verification](d44-evidence/verification.json) checks preserved
evidence, unchanged ratified requirements, status and references. No earlier
program was executed/imported. No account, provider or live configuration was
accessed.

## Continuation and scope

D42 and D43 remain ratified. Q44's standard-period choice is now recorded;
[D45](phase28-d45-seven-day-confirmation-decision.md) subsequently records seven
elapsed days (168 hours). D6's older lifetime is superseded; its proposed purge
bound and surviving review packet are not adopted wholesale.
The [session continuation](phase28-session.md#next-conversation-step) tracks the current frontier. Earlier packet statuses, completeness
C01–C20 and upstream E7/C-01 are unchanged. Phase 28 is not declared complete.

This continuation applies [grill-with-docs](../../../ai/skills/grill-with-docs/SKILL.md),
[grilling](../../../ai/skills/grilling/SKILL.md) and
[domain-modeling](../../../ai/skills/domain-modeling/SKILL.md) under the
[founder brief](phase28-founder-brief.md). One meaningful question is asked at
a time. The glossary needs no new entity or implementation detail. `/to-prd`
and `/to-issues` remain separate transitions; no formal ADR/OpenSpec, ticket,
application/schema, live setting or communication is changed.
