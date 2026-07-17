<!-- Partner DRAFT for GitHub issue #428. Task list for the `add-eve-admin-mount-global-panel` OpenSpec change;
enters `Asymmetric-al/core` only via Asymmetric's OpenSpec workflow after sign-off. Acceptance and scope
grounded in [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md] and
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]. -->

## 1. Define the admin-mount-and-global-panel OpenSpec contract

- [ ] 1.1 Add the `eve-admin-mount-global-panel` capability via this change's spec delta
      (`specs/eve-admin-mount-global-panel/spec.md`), exposing the #427 shell on the #425 runtime behind the
      #426 auth gate without restating their contracts
- [ ] 1.2 State the seven requirements as spec: compatibility-gated Next.js mount; global panel across Mission
      Control; basic-page-context-only feed; no-silent-sensitive-data with tests both ways; verified-session
      auth + ownership enforcement; exposes-#427-shell-on-#425-runtime-without-redefining; and HITL / no new
      authority / spec-only
- [ ] 1.3 Validate: `bunx @fission-ai/openspec@latest validate add-eve-admin-mount-global-panel --strict`

## 2. Record the provisional Eve design decision EVE-DESIGN-0010 (admin mount and global panel)

- [ ] 2.1 Author the decision under provisional Eve design label EVE-DESIGN-0010 in this change's `design.md`, traceable from EVE-DESIGN-0007 (#425, runtime), EVE-DESIGN-0008
      (#426, admin auth), and EVE-DESIGN-0009 (#427, workspace shell)
- [ ] 2.2 At implementation time, promote the accepted decision into `docs/adr/` using the next available canonical number, then update all references.
- [ ] 2.3 Cross-link the resulting canonical ADR from the parent PRD and issue #428

## 3. Next.js compatibility gate and runtime isolation

- [ ] 3.1 Specify that the admin mount uses the Eve Next.js integration only after compatibility with the
      installed version (`next` 16.2.6) is proven, or is explicitly blocked on the stable 16.3 rollout
- [ ] 3.2 Specify that the Eve runtime stays a dedicated, Node-isolated workspace package, and that any
      newer-Next.js requirement is a separate prerequisite, not folded into this mount
- [ ] 3.3 Note the acceptance that compatibility tests prove the current installed Next.js works with the Eve
      integration, Payload, Sentry, Turbopack, and Cache Components (lands with the implementing PR)

## 4. Global panel, page context, and data boundary

- [ ] 4.1 Specify that a lightweight global Eve panel is available across Mission Control so an admin can ask
      for help from any admin page
- [ ] 4.2 Specify that the panel receives basic page context only — route, page identity, selected tenant or
      org, and safe UI state — and does not automatically receive table rows, donor details, payment data, raw
      form values, or sensitive records
- [ ] 4.3 Specify that the mount and panel never silently send raw records, payment data, donor details, table
      rows, or sensitive form values, and that panel tests verify both that basic page context is included and
      that sensitive data is not

## 5. Auth gate, shell/runtime hosting, and subordination

- [ ] 5.1 Specify that the mount is gated by the #426 auth boundary — tenant/user derived from verified session
      context only, and session create/continue/stream enforce ownership — and that it does not redefine it
- [ ] 5.2 Specify that the mount exposes the #427 operations-first shell on the #425 standalone runtime without
      redefining the shell's panels/decision-summary rule/role-gating or the runtime's contract
- [ ] 5.3 Draw the boundary: #425 owns the runtime; #426 the auth gate; #427 the shell; #418–#424 the governance
      slices; #428 owns the admin mount and global panel that exposes the shell into Mission Control
- [ ] 5.4 State that the change adds no live mount / Next.js integration wiring / global panel UI / data
      fetchers / Supabase schema, is HITL, grants no new authority, and keeps the release switch off until
      verified

## 6. Acceptance checks (HITL)

- [ ] 6.1 Maintainer review of the compatibility gate, global-panel availability, basic-page-context feed,
      no-silent-sensitive-data boundary, auth gating, and shell/runtime hosting boundary
- [ ] 6.2 Confirm compatibility is proven against the installed `next` 16.2.6 (or the mount is explicitly
      blocked on the 16.3 rollout) and that a newer-Next.js need is treated as a separate prerequisite
- [ ] 6.3 Confirm the global panel receives route, page identity, selected tenant/org, and safe UI state only,
      and that raw records, payment data, donor details, table rows, and sensitive form values are not sent
      silently — the charter data boundary
- [ ] 6.4 Confirm tenant/user derive from verified session context only and session create/continue/stream
      enforce ownership per the #426 auth gate
- [ ] 6.5 Confirm no live mount, Next.js integration wiring, global panel UI, data fetchers, or Supabase schema
      is included, and that the #425 runtime, #426 auth boundary, #427 shell, and #418–#424 governance slices
      are not redefined here
- [ ] 6.6 Confirm the change is subordinate to #417/#418, OpenSpec, `AGENTS.md`, `docs/ai/*`, and existing CI
      gates, is HITL, and keeps the release switch off until verified
- [ ] 6.7 Human sign-off before the change is opened as a PR against `Asymmetric-al/core:develop`
      (HITL, admin-visible mount — protected area, Gate 4 + Gate 8)
