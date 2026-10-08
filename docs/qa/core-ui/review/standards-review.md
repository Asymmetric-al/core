Standards axis — fixed point `21e861c4453bb09778dc8448f78b518d8e702233`, candidate `41cdce7ce3938461f6133aae38d08ff82373414c`.

Three concrete P1 regressions were confirmed and corrected in the shared follow-up worktree:

- `packages/ui/components/studio/EmailStudioPreview.tsx:138`: `bg-card` follows the host application's dark theme even though exported email bodies omit background/foreground colors. Actual Chromium rendered implicit and explicit black email text at 1.12:1 contrast. The centralized fixed-light document canvas and iframe `scheme-light` restore 21:1 without modifying `srcDoc`, sandboxing, preview devices, or tabs. This follows the frontend rulebook's contrast requirement and `packages/ui/AGENTS.md` purpose-based centralized-token rule.
- `packages/ui/components/public/home-sections.tsx:428`: the theme-dependent deployment fill becomes dark against an intentionally dark media scrim, producing 1.07:1 graphical contrast. The existing fixed media foreground token restores 11.17:1 in dark mode and 6.57:1 in light mode; progress values, transforms, accessible labels, and content remain intact.
- `packages/missionary/components/task-kanban-board.tsx:198`: fixed `h-125` discards the existing viewport allocation, leaving a 500px board on a 1,400px viewport. Restoring `calc(100vh - 320px)` through a scoped shared utility with the existing 500px minimum yields 524/500/1,080px at tested 844/800/1,400px viewport heights. The DnD engine, row IDs, sensors, sorting, callbacks, and scroll ownership are unchanged.

The shared/component diff review found no additional concrete P0/P1 standards violations. Fowler smells remain judgment heuristics; no speculative naming, duplication, abstraction, or formatter/linter findings are treated as merge blockers. Scope: the shared components/tokens and missionary component diff plus applicable authority/standards contracts; other product and operational slices have their independent review owners.

Verification: eight existing unit tests across two files, scoped ESLint, four-file Prettier, both affected package typechecks, and `git diff --check` passed. Fourteen matched before/after actual-component captures cover light/dark, narrow/wide, and short/tall states. After states all pass measured contrast/viewport checks; keyboard create/edit exact payloads, final-column scrolling, device width, HTML/text tabs, and original iframe payload are preserved. These are blocked-network local component fixtures, not Next.js application or provider workflow qualification.

## Fresh shared review comments

The notification-control reorder concern (`PRRT_kwDOQ4BXFs6qNEG4`) has no
reachable trigger in Core. Its sole product consumer passes headers from
`NOTIFICATION_CHANNELS` and builds every row's controls from that same list;
each switch reads and updates its own `channel.id`. Reordering the list preserves
both associations. Independent inspection verified current remote blobs and six
existing matrix/settings tests passed. Retain this shared positional contract;
an unsupported independent permutation does not justify a breaking API change.

The MIT-title Markdown suggestion (`PRRT_kwDOQ4BXFs6qNEGz`) is a formatting nit.
Retain the verbatim notice: fresh retrieval from the recorded upstream commit
`ef0fe1252d9b24d69bdedee48a69ec9b29d1f217` matches the checked-in file at SHA256
`09592ffefa6512b68dd7aa9031bc50d5d39cfcc9da08288f5eb1f9d236baca66`.
Its required copyright, permission and warranty clauses remain intact. This
external Markdown warning is not a failed repository gate.
