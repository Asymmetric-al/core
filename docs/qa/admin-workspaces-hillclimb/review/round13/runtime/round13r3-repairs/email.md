# Round13r3 Email header repair

Date: November 12, 2026 (Asia/Bangkok).
Workspace: `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12` only.

## RED and exact repair

Read `../round13r2-tools-qualification/qualification-20261112-email-pdf.md` and opened the original `../round13r2-support-tools/run-20261111T210346808Z/batches/tools-02/capture/email-studio--small-tablet.png` (640x900). The PNG shows the unreadable collapsed name field; the report's 25.6px width is separate supplemental DOM evidence, not a measurement from that PNG.

Only product edit, at `apps/admin/app/(app)/email/email-studio-header.tsx:98`:

```diff
-      <div className="flex w-full min-w-0 items-center gap-3 sm:w-auto sm:flex-1">
+      <div className="flex w-full min-w-0 items-center gap-3 sm:w-auto sm:min-w-80 sm:flex-1">
```

The identity group gains a usable minimum at `sm` and wider, allowing adjacent actions to wrap rather than collapse the name field. Below `sm`, existing full-width mobile sizing is unchanged. Input composition, accessible label, controlled metadata, Unsaved badge, readiness/pending guards, action callbacks, Base UI/Maia primitives and tokens remain unchanged.

## Checks

- PASS: `bun run test:unit tests/unit/apps/admin/email/email-studio-header.test.tsx --no-coverage --maxWorkers=1` — 1 file, 7 tests.
- PASS: `bun run lint:ui "apps/admin/app/(app)/email/email-studio-header.tsx" tests/unit/apps/admin/email/email-studio-header.test.tsx`.
- PASS: `bunx --no-install prettier --check "apps/admin/app/(app)/email/email-studio-header.tsx" tests/unit/apps/admin/email/email-studio-header.test.tsx`.
- Exact single-class source replacement verified against the immediately preceding content. Existing public header tests remain byte-identical (SHA256 `AFE7C1337C714D8390E3F8C5767F268FF14D627AC0A7108DE7028781EE46960C`). No logic changed; no artificial class-string or layout assertion was added to jsdom tests.

## Browser limit and scope

Candidate implemented, not browser-qualified. Existing screenshot/geometry supplies RED; unit/lint/format passes do not establish responsive GREEN. Root owns post-integration checks at 390/639/640/641/1024/1440, clean and Unsaved: wait for the enabled named textbox; verify practical width, short-name `scrollWidth <= clientWidth + 1`, containment, no action overlap, local metadata editing and keyboard focus. Zoom/text reflow remains unverified. No Save/Send is needed.

No children, browser, collector, server, environment/provider, Git, freeze or ledger operations. No broad typecheck/build. PDF, Support, shared grid/primitives, harness and previous evidence were not edited. Installed admin Next.js CSS documentation resolved locally; no MCP call, fallback regeneration or upgrade was needed. This new report is the only non-product authored file.
