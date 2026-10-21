# React Doctor tooling requalification

This October 21, 2026 record qualifies the supported public React Doctor 0.9.18
CLI. It is not a dependency-security certification or final modernization closure.
[Exact dispositions](react-doctor-requalification.json) and
[hash-bound exceptions](../../qa/react-doctor/exceptions.json) are current;
earlier dated reports remain historical evidence.

## Coverage and disposition

Both scanner versions expose 906 rule IDs. The new release adds a
`react-jsx-only` Rules of Hooks tag; metadata alone does not establish execution
changes. Native ESLint now independently checks plain TypeScript hooks across
all eight targets from repository and workspace cwd. Its regression rejects
conditional hooks, loops and hooks after early returns, and accepts a valid
unconditional control. Explicit Next root settings also preserve monorepo app
discovery in both cwd modes. That regression proves root-route discovery, not
the upstream plugin's complete grouped-route matching behavior.

The initial raw scan had 313 nonclassic findings. Independent source/consumer
review reconciled every prior exception: 282 remain supported and 14 are retired.
Retired React Compiler diagnostics are no longer emitted by the completed scan;
this does not establish source fixes or rule removal. The retired checkout
RadioGroup exception does not carry to the separate typed Stripe hook adapter.

Twenty actionable findings were fixed, removing 19 diagnostics. The retained
row-click diagnostic now has an equivalent native keyboard path and browser
proof. Ten other new findings are concrete false positives; the typed Stripe
adapter has a separate reviewed contract. The resulting 294 exceptions bind
exact diagnostic identities, source contexts, whole files and supporting files.
Any change invalidates the relevant evidence. No blanket ignores, accepted
inline disables, reduced severities or skipped applicable checks were added.

## Implemented corrections

- CRM tag/filter builders are pure helpers. Selection snapshots, cache freshness,
  route ownership, gift overlays and focus restoration stay with their owner.
- Inbox default rows share sentinel normalization; notification defaults and the
  six-field dirty comparison are extracted. Draft identity, equivalent-cache
  retention, cancel/save serialization and agent scoping remain intact. The
  automation setter matches its state name.
- Eleven static values/elements/callbacks moved to module scope. The signing
  snapshot still reads the current date when called. Unused `getTagStyle` is
  removed; consumed tag helpers remain. Equivalent padding uses `p-4`.
- The extracted native PDF pane preserves preview APIs and rollout. Mobile
  source text is 16px, resizing stays inside a scroll container, and preview
  bounds remain fixed. Its two existing grid-template lint exceptions moved
  with the unchanged owner. Removing duplicate inbox restyling sites pruned
  four more legacy findings, lowering the total from 4,829 to 4,825.
- Task titles use the shared native Button for Enter/Space. Row pointer
  shortcuts, table semantics and checkbox/status/menu isolation remain.

The ten original false positives are three actual rendered test consumers, two
external-store/hydration clock findings, four forms that already prevent native
submission before all early returns, and the floating-bar lookup over a capped
one/two-item array. The chart reason now correctly describes its synchronous
typed Legend adapter and preserved series order. Duplicate spinner contexts were
matched by actual reviewed controls, including exact Button anchors where
source offsets changed, rather than by counts or nearest lines. The read-only
PDF diagnostic list moved without adding row state, inputs or identity needs.

## Verification and limits

The focused component suite passes 112 tests, including checkout amounts and
idempotency, CRM overlays/focus, settings drafts and PDF rollout/server boundaries.
All 15 product workspaces pass typechecking. Eight browser cases pass across
desktop/mobile, light/dark and normal/reduced motion: long controlled JSON,
actual resizing, preview bounds, mobile text, keyboard activation and task action
isolation. These fixtures do not certify authenticated provider integration.

The iframe remains script-disabled. The fixture applies theme after navigation
and retains action traces, screenshots and sources while disabling DOM trace
snapshots, which inject scripts into frames. Axe explicitly excludes the static
iframe and audits editor chrome; generated print content is qualified separately
in the document migration. Runtime/network error guards remain strict. Mobile
dragging shrinks within the source pane instead of moving automation into the
script-disabled preview below it.

The final unsuppressed scan completed all eight targets with no skipped checks
and verified checkout/snapshot integrity. Strict configured scanning passed with
zero actionable findings and all 294 exact exceptions verified. Measured-coverage
regressions, the combined browser matrix (223 passed, five intentional skips)
and full repository preflight passed. Clean installation, exact-head CI,
previews and merge readback remain final checkpoint requirements.
