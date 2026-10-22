# Quality gates (security, accessibility, scroll, self-checks)

<!-- BEGIN:core-reui-overlay -->

## Core usage

The ReUI checklist supplements Core's TDD, frontend, testing, data-access,
and design-system gates. For user-visible changes, verify keyboard/focus,
responsive states, contrast, and reduced motion in the running app. Call
`get_audit_checklist` when MCP is available; if unavailable, use this local gate
and the Core rulebooks and report that live checklist verification is missing.

<!-- END:core-reui-overlay -->

This is the **done gate**: before you call any ReUI work finished, call `get_audit_checklist` and pass every item below (plus the bar and the states in [layout.md](./layout.md)). Then run the self-checks, typecheck and lint, compare with [anti-patterns.md](./anti-patterns.md), and hand back in the 5 lines below.

## Security

- Never `dangerouslySetInnerHTML`. Render data as text/components.
- External links (`target="_blank"`) must always pair `rel="noopener noreferrer"`.
- No real PII, secrets, or tokens in demo or committed code. Remote media only from sources the project already allows.

## Accessibility

- Implicit list/card items that navigate get real anchors with a standard hover affordance. Hover on a display-only card: make the card a link to its detail, or give it no hover.
- `aria-current="page"` on the current route link, `"location"` on the current in-page section link.
- Destructive confirms use `AlertDialog`, not `Dialog`, and cannot be dismissed while pending.
- Icon-only or numeric buttons need an `aria-label`; decorative icons get `aria-hidden`.
- Every non-submit button is `type="button"`.
- Keyboard + focus: everything interactive is reachable in a sensible Tab order with a visible focus ring; layers (dialogs/sheets/menus) trap focus and close on `Escape`. ReUI components ship their keyboard behavior; never re-implement it.
- Announce async UI: loading and error messages use `role="status"` or `aria-live`.

## Scroll mechanics

- Make scroll regions with a parent-owned height: a `min-h-0` + flex chain down to the scroll container. Never guess a `max-h`.
- The scroll container owns `overflow-auto`; ancestors stay `min-h-0` so the height resolves.

## Self-checks

After every UI edit, run these with ripgrep on `<files>`: each file you wrote or changed, by path, never `components/ui` or `components/reui`. A clean check prints nothing; a hit prints `file:line:code`. The last filter drops comment lines.

```sh
# C1 banned motion: transition-all, bare or paint transitions, layout keys, bounce, overshoot, scale 0, hover and tap gestures, will-change
rg -nH 'transition-all|transition(-property)?: *[^;]*\b(all|width|height|top|left|margin|padding|box-shadow|filter)\b|[\x27\x60" ]transition( +(duration|ease|delay|hover|focus|active|group|motion)|[\x27\x60"])|transition-shadow|transition-\[[^\]]*\b(width|height|top|left|right|bottom|inset|margin|padding|filter|radius|background-position|background-size|all)\b|animate-bounce|will-change|willChange|bounce: *(0?\.0*[1-9]|[1-9])|[\x27"](backIn|backOut|backInOut|anticipate)[\x27"]|(cubic-bezier\(|ease: *\[)([^,]*,|([^,]*,){3})[ _]*(-|1\.[0-9]*[1-9]|[2-9])|scale: *0 *[,}]|\bscale-0\b|while(Hover|Tap|Focus)=|(initial|animate|exit)=\{\{[^}]*\b(width|height|maxHeight|top|left|margin|padding|boxShadow|filter|backdropFilter|borderRadius)[A-Za-z]*:' <files> | rg -v ':[0-9]+:\s*(//|/\*|\*(\s|/|$)|\{/\*)'
# C2 off-scale motion: a duration off 0, 100, 150, 200 and 300 (duration-500 only on a media hover zoom), ease-in or ease-out, a stagger step above 0.05
rg -nH 'duration-([1-9]|[1-9][0-9]|1(0[1-9]|[1-46-9][0-9]|5[1-9])|[23](0[1-9]|[1-9][0-9])|[4-9][0-9]{2}|[1-9][0-9]{3,})\b|duration-\[|\b([1-9]|[1-9][0-9]|1(0[1-9]|[1-46-9][0-9]|5[1-9])|[23](0[1-9]|[1-9][0-9])|[4-9][0-9]{2}|[1-9][0-9]{3,})ms\b|(^|[^0-9.])(0?\.(0[0-9]*|1[0-46-9][0-9]*|15[0-9]+|[23][0-9]+|[4-9][0-9]*)|1\.[0-9]+)s\b|duration: *([1-9]\b|0?\.(0[0-9]*|1[0-46-9][0-9]*|15[0-9]+|[23][0-9]+|[4-9][0-9]*)\b)|\bease-(in|out|in-out)\b|(staggerChildren: *|stagger\( *)(0?\.0[6-9]|0?\.[1-9]|[1-9])|delay: *[^,}]*\b(i|index|idx)\b *\* *(0?\.0[6-9]|0?\.[1-9]|[1-9])|delay: *(0?\.0[6-9]|0?\.[1-9]|[1-9])[0-9.]* *\* *\b(i|index|idx)\b' <files> | rg -v ':[0-9]+:\s*(//|/\*|\*(\s|/|$)|\{/\*)'
# C2 read by hand: a duration or delay that is not a number, every index delay (allowed: 0.05 or less on the first 6 items, as Math.min(i, 5) * 0.05, never on table rows)
rg -nH '([dD]uration|[dD]elay): *[^0-9 .]|delay: *[0-9.]+ *\*' <files> | rg -v ':[0-9]+:\s*(//|/\*|\*(\s|/|$)|\{/\*)'
# C3 state color: raw palette on a line that names a state
rg -nH '\b(text|bg|border|ring|fill|stroke)-(red|rose|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet)-[0-9]{2,3}\b' <files> | rg -i ':[0-9]+:.*\b(success|paid|active|completed?|done|approved|online|healthy|live|error|failed|critical|overdue|declined|rejected|cancell?ed|blocked|expired|warning|pending|degraded|due|info|processing|running|scheduled|queued)\b' | rg -v ':[0-9]+:\s*(//|/\*|\*(\s|/|$)|\{/\*)'
# C4 structure: a raw table, select or fixed overlay, framer-motion, Math.random() or Date.now()
rg -nH '<table\b|<select\b|fixed inset-0|from ["\x27]framer-motion|Math\.random\(|Date\.now\(' <files> | rg -v ':[0-9]+:\s*(//|/\*|\*(\s|/|$)|\{/\*)'
# C4 on a base-* style only (skip on radix-*): Radix asChild
rg -nH '\basChild\b' <files> | rg -v ':[0-9]+:\s*(//|/\*|\*(\s|/|$)|\{/\*)'
```

Fix every hit, run again, stop after the second run and list what is left with file and line. A C4 hit stays only when a comment in the file says why. These also stay, named on hand-back line 2: C1 on the motion.md sidebar row or on will-change set in a drag handler and removed when it ends; C2 on a media hover zoom; `Math.min(i, 5) * 0.05`.

No `rg` (a missing one also prints nothing): run each first pattern with your own search tool, skipping comment lines. No shell: read each changed file for what each `#` line names.

## Hand-back

End your reply with these 5 lines:

1. Installed: each item with its `previewUrl`.
2. Motion: each animated element and its [motion.md](./motion.md) table row, or "none".
3. States: covered, or which are missing.
4. Checks: C1 to C4, screenshots or "not visually verified", the audit checklist, typecheck, lint; each one run, or "not run" and why.
5. Deviations: any rule broken or check hit left, with file:line and why.
