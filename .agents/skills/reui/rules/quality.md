# Quality gates (security, accessibility, scroll)

These are the **done gate**, not a nice-to-have: before you call any ReUI work finished, call the MCP `get_audit_checklist` tool and pass every item below (plus the craft bar in [craft.md](./craft.md)). Then typecheck and lint.

## Security

- Never `dangerouslySetInnerHTML`. Render data as text/components.
- External links (`target="_blank"`) must always pair `rel="noopener noreferrer"`.
- No real PII, secrets, or tokens in demo or committed code. Remote media only from sources the project already allows.

## Accessibility

- Implicit list/card items that navigate get real anchors with a standard hover affordance.
- Icon-only or numeric buttons need an `aria-label`; decorative icons get `aria-hidden`.
- Every non-submit button is `type="button"`.
- Keyboard + focus: everything interactive is reachable in a sensible Tab order with a visible focus ring; layers (dialogs/sheets/menus) trap focus and close on `Escape`. ReUI components ship standard keyboard behavior - read each component's inline `api` rather than re-implementing it.
- Announce async UI: loading and error messages use `role="status"` / `aria-live` so they're not silent to screen readers.

## Scroll mechanics

- Make scroll regions with a parent-owned height: a `min-h-0` + flex chain down to the scroll container. Never guess a `max-h`.
- The scroll container owns `overflow-auto`; ancestors stay `min-h-0` so the height resolves.
