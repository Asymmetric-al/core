# Admin cleanup: Feed moderation and org updates

Part of task 5.4 in [tasks.md](../tasks.md). Base commit `629cb71dc`, analyzer
`@shadcn/lint@0.2.3` with Core's patch. Ledger batch: `admin-feed-2026-10-30`.

## Scope

Three files had 473 raw findings (455 `no-restyle`, 13 `no-arbitrary-values`,
5 `no-unknown-classes`). All three now report zero findings and zero warnings,
and their `suppressions.json` entries are pruned. No shared component,
token, contract, exception or suppression count was added or widened.

| File                                                           | Before |
| -------------------------------------------------------------- | -----: |
| `apps/admin/app/(app)/feed/content-moderation-sections.tsx`    |    285 |
| `apps/admin/app/(app)/feed/org-updates/page-client.tsx`        |    183 |
| `apps/admin/app/(app)/feed/content-moderation-page-client.tsx` |      5 |

## Changes

- Shared variants and sizes replace radius, shadow, uppercase and colour
  overrides on Button, Badge, Avatar, Tabs, menus and dialogs. Delete actions
  use the destructive variants of `AlertDialogAction` and `DropdownMenuItem`.
- "Org Updates" and "Moderation" navigation uses `ButtonLink`, so both are
  real anchors with client navigation. "Org Updates" keeps its existing
  `aria-label`, because its text is hidden on narrow screens. "Moderation"
  keeps its visible label inside the rendered `next/link`, so the DOM and
  static analysis read one name.
- Post details uses `DialogContent scrollable` instead of a local height cap.
- The moderation search is an `InputGroup` with a named clear button; its
  click target grew from 14px to 24px.
- The settings sheet renders one inner column with separators. Two labels
  that had no control became captions.
- `hidden xs:inline` became `hidden sm:inline`. Core defines no `xs`
  breakpoint, so author location and visibility text were never shown; they
  now show from `sm`.
- The moderation toolbar row wraps from `sm`. Before, the sort control sat
  under the sidebar and could not be clicked at 1280px, and filter and sort
  were cut off at 768px.
- An unknown `no-scrollbar` class (no generated CSS) and redundant transition
  lists were removed.

## Verification

- `bun run lint:ui <files> --raw`: 0 findings, 0 warnings. Admin
  `tsc --noEmit` passes.
- Eight focused unit files pass (56 tests), including
  `shadscan-moderation-composition`, `feed-org-updates-composer-actions`,
  `base-ui-select-nullability` and the gradient contract in
  `tests/unit/ui/class-overrides.test.tsx`.
- Browser, real routes on two dev servers (base commit and change), demo
  auth, local mock data: `feed-moderation` (21 steps at 1280, 768 and 390px)
  and `feed-org-updates` (15 steps at 1280 and 390px), 186 step runs. No
  page errors, step failures or horizontal overflow after the change.
  - Links are anchors that navigate; `buttonlink-names` confirms names and
    hrefs.
  - Escape and Cancel return focus to the trigger. The scrollable dialog
    keeps Approve reachable at every width.
  - Tabs, sort, filters and the settings radio and switch respond.
- Axe found no new violations. `label-content-name-mismatch`, `list` and
  `listitem` come from the app shell and are present before the change.
- Hash-bound review ledgers: the Shadscan finding-ledger proofs and React
  Doctor exceptions bound to these files were re-reviewed. Their hashes were
  rebound only where the recorded rationale still holds and React Doctor
  still emits the same diagnostic with a byte-identical source context;
  anything else was reviewed individually. `bun run verify:shadscan` and
  `bun run react-doctor:check` pass on this branch.

## Known gaps and follow-ups

- No ghost-destructive, ghost-success or warning menu-item variant exists;
  those actions use `ghost` or the default item with a coloured icon.
- `PostContent` accepts no opacity class, so draft previews are no longer
  dimmed; the Draft badge still marks them.
- `MotionCard = motion.create(Card)` hides Card provenance from the analyzer.
  Its gradient is a tested, documented composition and stays; its remaining
  radius and shadow overrides need manual review in the shared-UI task.
- Pre-existing and unchanged:
  - the stat cards overflow at 768px (a unit test pins `md:grid-cols-6`);
  - focus falls to the body after Clear search;
  - the reason text carries over between dialogs;
  - shared `InputGroup` shows a second focus ring from the global
    `:focus-visible` offset rule.

Evidence (ignored, hashed in the ledger): `.tmp/admin-lint-5-4/feed/`.
