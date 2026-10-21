# D40 root evidence and synthesis inputs

Reviewed October 18, 2026 (Asia/Bangkok), Core
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`, research working tree.
This is source/document review, not deployed behavior or user feedback.

## Sources actually inspected

- Root AGENTS.md; founder brief sections 1–6; grill-with-docs, grilling and
  domain-modeling skills; document-authority.md; OpenSpec index; CRM core and
  platform boundaries; relevant active add-recurring-giving owner clauses.
- P28 owner-constraints native gift-event tasks; P16 missionary journey,
  communication contract and derived support health; P17 Reserved registry and
  bounded plan guidance; ADR-0001, ADR-0026, ADR-0027 and ADR-0183.
- D21 C06–C14 manual/native task coordination, permissions, corrections and
  failure recovery. Existing intentional work must survive informational D40.
- Shared UI AGENTS.md, frontend rules, components.json (base-maia, zinc,
  CSS-variable tokens, Base UI), accessibility-review skill. No UI code changed.
- Current donor recurring selection in missionary-portal/donors.ts and task
  creation in missionary-portal/tasks.ts; full bounded current-source review is
  delegated and recorded in source-and-authorization.md.

## Primary pages opened afresh

- https://help.mpdx.org/article/1199-notifications — updated September 26, 2022;
  separately selectable notice/email/task destinations, including missed gift.
- https://help.planningcenter.com/en/138360-donation-notifications.html — page
  displays October 15, 2026; configurable awareness and administrator limits.
- https://design-system.service.gov.uk/components/notification-banner/ — living
  guidance; contextual relevance matters, not blanket banners for every fact.
- https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html — feedback can
  be announced without moving focus; not every content change needs an alert.
- https://www.w3.org/WAI/WCAG22/Understanding/reflow.html — 320 CSS pixel
  non-excepted vertical content and 400% equivalent zoom are concrete criteria.
- https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html — 24 CSS
  pixel AA minimum with defined exceptions; preserve Core's stronger shared
  touch-target conventions rather than using this as a design target.
- https://www.postgresql.org/docs/17/sql-createpolicy.html — old/new row checks,
  inherited USING when WITH CHECK omitted, permissive OR and restrictive AND.
- https://supabase.com/docs/guides/database/postgres/row-level-security — RLS,
  grants, views and privileged paths must be considered together.
- https://supabase.com/changelog.md — web parser rejected Markdown; fetched
  directly via Python urllib. Read the latest entries and followed relevant
  https://supabase.com/changelog/cbc-tls-ciphers-deprecated (October 12, 2026).
  It announces older CBC TLS 1.2 HTTP API suites may be removed November 10 at
  earliest. This is a supported-device qualification consideration, not evidence
  that Asym users are affected. Do not weaken transport security or add a new
  dependency for this decision. No schema/library implementation occurs here.

The Supabase skill was used as a review aid. Its shortcut claim about an absent
WITH CHECK was checked against PostgreSQL's actual inheritance rules; omission
alone is not a demonstrated authorization bypass. Effective predicates, grants,
row transformations and privileged authority must be proved. No database access
or SQL execution was performed.

## Resolved design judgments

A means this one confirmed occurrence creates no automatic review/outreach task,
not that the arrangement never needs attention. The permitted historical miss
and current next schedule have independent temporal meaning. Unknown/currently
changed scheduling must never preserve a stale reassurance.

Tenant customization is one optional missionary in-product slot within the
existing P17 plan. Explicit contract amendment is needed; it is not inherited
from generic settings. Recommend default On only after qualification and Live
activation, retaining explicit Off. Off blocks new/unpresented optional notice
publication; already published items retain ordinary engagement/history. This
adds the least state and avoids an Off/On cycle reviving old events. Suppression
is terminal for that event/recipient/slot; no catch-up after re-enable.

D40 does not add donor outreach; P16/P6/P17 donor payment communications retain
their independent contracts. A blanket 'nothing sends automatically' claim
would be inaccurate. No tenant rule may erase financial facts, redefine miss,
re-enable automatic review for this case or bypass mandatory notices.

Manual follow-up uses the ordinary qualified P9 task command, with a durable
same-intent retry identity and authorized context reference. Distinct intended
work remains possible; global one-task-ever-per-occurrence uniqueness would be
wrong. A task neither confirms money nor completes a source incident. Existing
legacy task UI/API does not qualify that command simply by existing.
