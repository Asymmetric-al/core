# D38 independent cross-review resolution

October 18, 2026. Main review: [D38](../phase28-d38-separate-referral-periods-adversarial-review.md).

The governance, authorization/time and UX reviewers independently assessed B and
the main synthesis. Each supports **Accept with required amendments**. Their
research and current-code limits are preserved in the adjacent evidence notes.

## Material correction incorporated

The security reviewer found that the original C05/G1 could be interpreted as
delegating an unresolved user-visible initial-clock choice to implementation.
The original wording required a P9 contract but only called for a new decision
if owner intent differed. There was no adopted initial-anchor baseline.

The corrected decision, C05 and G1 now explicitly distinguish two steps:

1. Resolve the initial anchor and late-entry admission in the grill/domain-owner
   decision record before a later authorized specification treats them as settled.
2. P9/import owners qualify and test that adopted meaning, including date-only,
   unknown, late and historical import cases. They cannot default to created or
   imported time merely because it is easy to calculate.

This narrows the claim of closure: D38 finishes the two-period **configuration
scope** decision. It does not claim to finish the explicitly excluded initial
clock branch. No Q39 is posed in this answer review, and no number is selected.

## Other independently challenged points

- Two-field saves are atomic for submitted changes; untouched unconfigured
  fields do not block independently qualified work. These are compatible rules.
- Turning missionary self-service Off and withholding other source grants
  supplies tenant control without zero-as-Never or a new all-CRM switch.
- A New-only change does not invalidate unchanged Continued action terms.
  Relevant policy ABA and stale rejected intents remain fenced.
- Current source, SQL/RLS and UI behavior are not inferred from a proposal or
  structural verification. Exact accepted continued-window timing remains D36.

No further material contradiction was reported by the independent UX or
authorization/time cross-review. This is expert document review, not user testing
or live implementation proof.
