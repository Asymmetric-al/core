# Proposal: Implement the Eve admin mount and global panel

## Why

Issues #425–#427 established the isolated Eve runtime, verified admin identity
and session ownership, and the operations-first workspace. Mission Control now
needs the compatible same-origin runtime mount and a lightweight assistant that
is available without leaving the current protected page.

This is the first admin-visible Eve runtime boundary. It must prove compatibility
with the repo's exact Next.js version and preserve the platform's data-minimizing,
fail-closed posture.

## What changes

- Compose Eve's official `withEve` integration around the existing Payload and
  Sentry admin configuration while retaining `packages/eve-runtime` as the
  isolated runtime workspace.
- Add an admin-only global Eve sheet to the protected Mission Control shell,
  including the Payload Web Studio path.
- Attach a fresh, explicit allowlist to every turn: safe route category, page
  identity, server-selected organization metadata, and panel state.
- Redact dynamic path segments by reducing paths to approved route categories;
  never inspect or serialize the DOM, records, tables, payments, donors, or form
  state.
- Render user and assistant text only. Tool inputs/results and model reasoning
  remain outside this lightweight surface.
- Make forwarded request cookies usable by the standalone Eve service without
  ambient `next/headers`, preserving the verified #426 auth and ownership gate.
- Prove the mount against Next.js 16.2.6 with the real production build and
  focused boundary tests.

## Authority and release posture

The panel grants no tools or new authority. The deterministic fixture model and
disabled-tool policy from #425 remain in force, as do protected-area policy,
approval, emergency-off, audit, auth/ownership, and the disabled master release
switch. Provider configuration and production release remain separate work.
