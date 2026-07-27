# Design: Eve admin workspace operations shell

## Decision

Use the existing `/admin/eve` App Router page as a thin Server Component access
gate around a Client Component workspace. Keep its existing TanStack Query
panels and API boundaries instead of introducing a second aggregate store.

## Rendering model

- `page.tsx` verifies the current session and authorized admin role before
  rendering the workspace. It also supplies the unique route metadata used by
  Next.js route announcements.
- `page-client.tsx` remains the interactive shell because governance state
  refreshes and mutations already use TanStack Query.
- A semantic navigation index is first in reading and keyboard order. It links
  to every operational panel and does not carry authority or synthetic status.
- Existing panels keep their own loading, empty, error, and fail-closed states.

## Real-state mapping

| Workspace surface                             | App-owned source           |
| --------------------------------------------- | -------------------------- |
| Release, emergency, runs, failures            | Governance API (#418/#420) |
| Audit and decision summaries                  | Audit API (#419)           |
| Eval health, model policy, subagent overrides | Model-policy API (#421)    |
| Private memory and history                    | Memory API (#422)          |
| Approvals, budgets, recent actions            | Approval/budget API (#423) |
| Replay artifacts and holds                    | Retention API (#424)       |

GitHub activity (#430), notification delivery (#432), and the authenticated
chat mount (#428) have no live source yet. Their panels show only an explicit
unavailable connection state and the owning issue. They do not invent empty
success, mock activity, or delivery health.

## Authorization

The page gate uses the same repository role semantics as admin API routes.
Every privileged mutation remains server-authorized. Model-policy changes also
retain the separate `ai.settings.manage` grant. Client rendering and hidden
controls are never treated as the security boundary.

## Safety and presentation

The shell renders bounded governance metadata and redacted decision summaries.
It does not render prompts, model chain-of-thought, raw operational rows,
secrets, donor data, payment data, or sensitive form values. The release gate
remains disabled and the workspace itself grants no operational authority.

## Accessibility

The panel index is a labeled native navigation landmark with ordinary anchor
links, visible focus, DOM order matching visual order, and descriptive page
metadata. New status sections use real headings and text labels so color is not
the only state indicator.
