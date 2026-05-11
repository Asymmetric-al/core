# Support Hub — Operator guide for donor care staff

The Support Hub is the donor-care inbox inside Mission Control. This guide walks through a typical workflow for a donor care agent. Skim it once when you start; keep the keyboard map open while you ramp.

## The shape of the workspace

`/support` opens the inbox. The page is split into:

- **Stats strip** — at-a-glance counts (open / mine / unassigned / past due / SLA risk).
- **Saved views bar** — pinned filter presets shared by the workspace, plus the agent's own personal views.
- **View tabs + toolbar** — switches between All / Mine / Unassigned / Past Due / Escalated; status / label / assignee filters; board ↔ table layout toggle.
- **Body** — donor conversations rendered as a board (columns by status) or a table (columns by metadata).
- **Detail pane** (right rail on desktop, full-screen sheet on mobile) — donor email thread, internal notes, activity, and the reply / private-note composer.

Everything is deep-linkable. Bookmark a filter, share a URL with a teammate, the URL state survives refresh. Saved views capture the full filter so you can return to the same slice with one click.

## Triage

1. Scan the **stats strip** for the day's load (open + past due).
2. Open **Mine** if you already have work, or **Unassigned** if you're picking up the next available conversation.
3. Use the **status filter** to focus on `open` or `pending` while you triage.
4. Past Due conversations are flagged with a clock icon on the board card and a chip on the row. Treat them as the queue jumpers.
5. Escalated conversations are ringed in rose. Surface them above everything else.

## Replying to a donor

1. Click the conversation row / card. The detail pane opens; focus moves into the timeline.
2. Read the donor email. Activity rows (status changes, assignments, mentions) are interleaved chronologically.
3. Click **Reply** in the composer (or press `r`). The Tiptap editor accepts:
   - Bold / italic / underline, lists, blockquote, links — same toolbar across donor email and internal notes.
   - Slash command `/` — opens the canned response picker. Filter by title or shortcode (e.g. `/refund`).
   - Merge variables — `{{donor.name}}`, `{{donor.email}}`, `{{conversation.subject}}`, `{{agent.name}}`, `{{agent.title}}`. Tokens render as the resolved value before the donor sees the email.
4. Hit **Send reply** (or `Cmd/Ctrl + Enter`).
5. If the send fails, an inline retry banner appears at the top of the inbox. Click **Retry** to try again — the original payload is preserved.

## Internal collaboration

- Switch to the **Internal note** tab (or press `n`).
- Type `@` to mention a teammate. The mention surfaces in the timeline as an activity row and (Phase 8) will trigger an in-app + email notification.
- Save drafts by pressing **Save draft** in Reply mode. Drafts stay in the timeline with a `draft` badge and never go to the donor.

## Conversation actions

The header carries the conversation-level actions:

- **Status menu** — Open / Pending / Snoozed / Resolved.
- **Priority menu** — Urgent / High / Normal / Low.
- **Assignee menu** — pick an agent or clear it.
- **Labels popover** — toggle labels on / off; "Manage labels" jumps to settings.
- **Snooze menu** — preset durations + a custom date picker.
- **Macros menu** — run a saved sequence (assign + label + canned reply + snooze, etc.).
- **Resolve** — one-click close.

Quick keyboard alternatives:

| Action                       | Key                |
| ---------------------------- | ------------------ |
| Resolve                      | `e`                |
| Snooze 24h                   | `s`                |
| Open assignee menu           | `a`                |
| Open labels popover          | `l`                |
| Open macros popover          | `m`                |
| Reply mode                   | `r`                |
| Internal note mode           | `n`                |
| Send / save                  | `Cmd/Ctrl + Enter` |
| Open command palette         | `Cmd/Ctrl + K`     |
| Next / previous conversation | `j` / `k`          |
| Close overlay                | `Esc`              |

## Saved views

- Use **Save filter** in the saved-views bar to capture the current URL state as a named view.
- Choose a scope: **personal** (just you) or **workspace** (the whole team sees it).
- Selecting a saved view writes its filter into the URL — back/refresh keep working.
- Edit / delete a saved view via the chip kebab.

## Macros

A macro is a one-click sequence of conversation actions. Useful for common donor flows:

- "Send replacement receipt" — drops the canned receipt body into the editor + labels Finance + resolves.
- "Retry recurring card" — labels Recurring + sends the update-card link + snoozes 48h.
- "Escalate to Finance team" — assigns the Finance team + labels Escalated + bumps priority.

Run a macro from the conversation header (Wand icon) or the composer chrome. Each step posts an activity row in the timeline so anyone reading the conversation can audit what happened.

If a macro action fails (e.g. the canned response was deleted), the runner skips that step, logs `failed:` in the activity row, and continues with the rest. The composer surfaces the first failed step inline.

## CRM cross-links

When a donor conversation has CRM links (donor / contribution / missionary / church), chips appear under the donor email in the contact sidecar. Click a chip to open the related Mission Control surface (CRM list with the contact selected, contributions list filtered to the donor, etc.). Phase 8 will replace these with typed deep-links once the underlying detail pages ship.

If no chips appear and you have the donor email, click **Find in CRM** to jump into the CRM list pre-filtered to that email — you can then manually link the donor.

## SLA awareness

Each conversation tracks two SLA timers:

- **First response** — minutes from inbound to first agent reply.
- **Next response** — minutes between subsequent replies.

Past Due is computed against these timers. The SLA chip in the conversation header shows the remaining time + tone (calm / amber warning / rose past-due). Resolution timers are surfaced on the reports page.

## Mobile

- The right detail rail collapses into a full-screen sheet on screens ≤ md.
- The settings sub-nav collapses into a `Select` dropdown.
- Keyboard shortcuts still apply, but realistically you'll mostly use taps on mobile.

## When something feels off

- Refresh the page — the inbox state is fully URL-driven so refresh is safe.
- Use **Reset** in the toolbar to clear every filter back to defaults.
- Open the command palette (`Cmd/Ctrl + K`) and use **Switch view** to jump to a known-good slice.
- If a mutation appears to fail, look for the amber failure banner at the top of the inbox — it has a Retry button.
- Worst case: report the issue with the URL of the page (the URL captures the full filter state).
