## 1. UI library policy

- [x] 1.1 Change the first test in `tests/unit/docs/ui-sdk-skill.test.ts` to
      assert the both-approved wording and reject the gaps-only wording.
- [x] 1.2 State the policy in root `AGENTS.md`, `packages/ui/AGENTS.md` and
      `docs/ai/rules/frontend.md`.
- [x] 1.3 Update the `ui-sdk` description, Core note and overlay, and its
      provenance notes; keep the upstream body byte-identical.
- [x] 1.4 Align `moai-library-shadcn`, `components-build`, the routing
      catalog, the stack registry, the Base UI compliance guide and the
      `packages/ui` readme.
- [x] 1.5 Rebind the two shadcn review-baseline hashes after confirming the
      review they support still holds, and regenerate the mirrors and
      installed-payload hashes.
- [x] 1.6 Edit the one sentence in `complete-base-ui-adoption` that proposed
      Base UI primitives for every ordinary control, so either archive order
      leaves one rule.

## 2. Skill retirement

- [x] 2.1 Change the inventory tests to expect the seven skills absent from
      every source, mirror, lock and audit record.
- [x] 2.2 Remove the seven skills, their lock entries and audit records, and
      update the audit counts.
- [x] 2.3 Remove their routing rows, point the `domain-model` alias only at
      `domain-modeling`, and record their sources and last hashes in the
      maintenance log.

## 3. Instruction fixes

- [x] 3.1 Root `AGENTS.md`: scoped instructions name the skill; fresh-checkout
      and docs-and-skills commands; both skill source trees.
- [x] 3.2 Routing catalog: the audit-hash step, a scoped `npm-deps-cleanup`
      refresh, the Stripe route and the shadcn skill order.
- [x] 3.3 `packages/ui`, `packages/api` and `packages/database` instructions:
      proportionate UI workflow and test locations.
- [x] 3.4 Rulebooks and guide: the docs-only lane, segment loading files, the
      Stripe skill, the TanStack trust order and the form hook's import.
- [x] 3.5 `nextjs-app-architecture`: the function names the installed Next.js
      exports.

## 4. Verify

- [x] 4.1 Skill mirror verification, strict validation, delta compatibility,
      the shadcn diff check and formatting pass.
- [x] 4.2 The docs, skill-script and shared UI unit tests pass.
- [x] 4.3 An independent review checks the guidance against the five UI cases
      and finds no contradiction between its owners.
- [ ] 4.4 The pre-push `bun run ci:preflight` and pull-request CI pass.
