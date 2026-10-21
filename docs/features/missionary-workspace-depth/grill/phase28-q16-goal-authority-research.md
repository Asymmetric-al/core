# Q16 frontier — who can set fundraising goals

Research date: October 16, 2026 UTC. **Answered A: missionary-managed when
permitted**, with staff control per missionary/project. D15's corrected decision
and amendments are explicitly ratified. This original frontier note is retained
as research; the [D16 review](phase28-d16-goal-management-adversarial-review.md)
records the answer and corrected amendments, explicitly ratified by the founder
on October 16, 2026 UTC.

## The single product choice

Maya is preparing for a new season of ministry and needs to adjust the monthly
support goal shown in her workspace.

**Should missionaries be able to set and update their fundraising goals when the
organization permits it, or should goal setting stay staff-only?**

- **A — Missionary-managed when permitted (recommended).** The organization
  chooses who may set goals. Maya can directly set or change an eligible
  fundraising goal when allowed; otherwise she sees the staff-managed goal.
- **B — Staff-managed goals initially.** Authorized staff set and change these
  goals. Maya can view the permitted goal and discuss changes with staff.

This concerns internal support-raising goals, including the monthly-goal example;
it does not settle optional activity-target metrics, coach write access, automatic
public publication or finance-plan approval. A coach's read-only access remains
read-only under either answer. Neither answer adds a compulsory approval queue.

**Recommendation rationale:** A reduces routine handoffs while allowing each
organization to retain staff control through its existing permission policy. B
is a legitimate stronger centralized policy, but making it the only product
mode removes discretion from organizations that authorize missionaries to plan
their own fundraising. This is a product judgment, not measured user research.

## Governing repository facts

- [Founder brief](phase28-founder-brief.md:147) requires recurring/special-gift
  goals, fundraising periods, optional activity targets and source-correct
  support. Its [goal boundary](phase28-founder-brief.md:153) preserves separate
  Phase 28 Goal Versions and explicit adoption from an approved finance plan.
- [P28 roadmap](../../../prds/sitestacker-parity/roadmap.md#phase-28) requires
  organization-configurable goals and distinguishes a fundraising goal from a
  balance, finance Support Plan or instruction to move money.
- [Retained goal owner requirements](../../../prds/program-roadmap/owner-constraints.md:128)
  permit an **authorized user** to create a Goal Version from an approved plan,
  with immutable provenance, without specifying missionary versus staff control.
  Later plan changes produce comparison suggestions, not live synchronization.
- [P21 goal bridge](../../../prds/sitestacker-parity/phase-21-field-accounts-decision-log.md:3044)
  preserves P28's exclusive goal authority. Changing either source does not
  automatically change public giving, commitments, compensation or payments.
- [ADR-0098](../../../adr/0098-optional-approved-support-plans-and-bounded-workspace-publication.md)
  establishes the independent Goal/Plan sources. [ADR-0123](../../../adr/0123-page-resolved-source-authoritative-public-support-progress.md)
  requires a prospective page release to change a public goal binding. Editing
  an internal goal must not silently alter the currently released public target.
- [D8-C10/C11](phase28-d8-adversarial-review.md:495) already qualifies goal meaning
  in coaching and separately deliberate optional targets/check-ins. Q16 does not
  reopen optional participation or confer goal-writing rights on coaches.

This is a genuine role/workflow choice. Arithmetic, tenant keys, money precision,
source versioning and permission-schema implementation are engineering questions,
not questions to delegate to the founder. No inspected owner clause fixes
staff-only or missionary-direct goal setting as the universal rule.

## Current behavior and why a simple legacy field edit is insufficient

The [portal service](../../../../packages/api/src/missionary-portal/service.ts:30)
reads legacy `funding_goal`/`current_funding`; the
[model](../../../../packages/api/src/missionary-portal/model.ts:357) defaults a
missing goal to zero and uses loaded gifts as a funding fallback. Those scalars
are not the intended purpose-qualified Goal Version source.

The [dashboard](../../../../packages/missionary/components/dashboard-home.tsx:244)
labels Monthly Support Goal. Its
[empty state](../../../../packages/missionary/components/dashboard-home.tsx:310)
says to set one without providing the action. The
[profile save](../../../../apps/missionary/app/profile/use-profile-page-view.ts:309)
and [strict profile API](../../../../packages/api/src/profile/index.ts:15) do not
admit a goal update. Collection/schema presence does not establish authority.

**Expanded D16 trace:** the above UI/profile-only observation is not mutation
absence. [GraphQL](../../../../packages/graphql/handler.ts:707), mounted in the
donor app, updates `funding_goal` through a service-only atomic audit RPC. The
[D16 source census](d16-evidence/current-source-and-ux.md) records that writer,
forward migration grants and missing D16 policy/version admission. Every reached
writer must converge or be fenced before a new setting promises control.

The [public giving projection](../../../../packages/api/src/public-giving/projection.ts:53)
also consumes the legacy scalar fields. A convenient direct write there could
couple internal planning and public presentation. Preserve the intended source
separation rather than copying that coupling. These are bounded static source
findings, not deployed permission, migration or runtime claims. The expanded
trace found helper exports/tests and an inspected mock-data worker page, not
proof that a current goal write changes that public page.

## Primary comparative evidence

Inspected October 16, 2026; no authenticated competitor test was performed.

- [MPDX Preferences](https://help.mpdx.org/article/454-preferences-settings),
  updated September 22, 2022, documents editable Monthly Goal with an instruction
  that the organization should set the amount. Its MPD Info section carries its
  own development caveat. This supports distinguishing who decides the amount
  from who types it, not importing a universal permission policy.
- [MPDX quick settings guide](https://help.mpdx.org/article/1368-mpdx-quick-reference-guide-settings),
  updated June 25, 2024, likewise describes an organization-recommended monthly
  goal and account-specific preferences. Dated guidance is not current API or
  authorization proof.
- [Sola features](https://www.trustsola.com/features) describes monthly and one-time
  goals and organization-configurable oversight. This is vendor-documented
  product direction; it does not prove exact editing rights, calculations or
  user satisfaction. Do not copy its unrelated accounting/sync claims.

## Consequences resolved by the D16 review

Use the existing P12 permission/settings system and the actual owner-qualified
goal command. Expose Edit only when genuinely permitted; distinguish the
Staff-managed policy from an individual reader who has View only access. A successful change must preserve its exact currency, period, scope,
version and attribution. Missing goals are not authoritative zeroes. Show what
changed without relabeling commitments, received gifts, finance plans or released
public targets. Concurrency, historical interpretation and source projections
have proposed exact safeguards in D16. The founder selected A and requested
staff on/off/optional control per missionary/project. After the initial review,
the founder explicitly clarified: “Editing permission only: staff allow or
disable missionary editing; setting a goal remains optional (recommended).”
That meaning is confirmed. D16 recommends Staff-managed / Missionary-managed
with Use organization default for inheritance. The clarification alone did not ratify the full amendment package. The founder
subsequently explicitly ratified D16 and its required amendments, including the
detailed control/default design and future proof obligations. No implementation
or runtime qualification follows from ratification.

## Other genuine frontier items retained

One-time reviewed supporter-list intake remains unresolved and distinct from
P21/P31 outbound continuity feeds. Source-qualified AI assistance also remains
open. They do not depend on asking them in the same round. SMS, compulsory
reporting and optional workflow engines are not prerequisites to native work;
already inherited boundaries are not posed again as new choices.
