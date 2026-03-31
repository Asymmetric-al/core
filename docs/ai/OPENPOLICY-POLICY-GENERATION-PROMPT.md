# Repo-Specific OpenPolicy Authoring Prompt

Use this prompt when updating `apps/donor/openpolicy.ts` in this repo.

## Prompt

You are updating OpenPolicy legal scaffolding in the Asymmetric-al/core monorepo.

Read these files first:

- `AGENTS.md`
- `docs/ai/stack-registry.md`
- `docs/ai/working-set.md`
- `docs/ai/OPENPOLICY-INTEGRATION.md`
- `docs/ai/OPENPOLICY-AUTHORING.md`
- `docs/ai/OPENPOLICY-EVIDENCE-MAP.md`
- `docs/guides/features/openpolicy-legal-pages.md`
- `apps/donor/openpolicy.ts`

Then inspect current repo evidence relevant to the donor app before changing anything.

Your job:

1. Update `apps/donor/openpolicy.ts` using the current `defineConfig()` shape from `@openpolicy/sdk`.
2. Only strengthen policy statements when they are supported by code, config, repo docs, or explicit human instruction.
3. Do not invent legal facts.
4. Do not infer the legal entity from `GiveHope` branding alone.
5. Keep source-level `TODO:` comments for maintainers and public-safe review markers in rendered text for any unverified legal entity, address, contact, governing law, effective date, refund, retention, or jurisdiction details.
6. Keep donor-specific rendering and provider boundaries intact.
7. Use repo-native styling only if you touch legal UI.
8. Update `docs/ai/OPENPOLICY-EVIDENCE-MAP.md` whenever policy claims change.
9. Update `docs/guides/features/openpolicy-legal-pages.md` if commands, file locations, or workflows change.
10. Run:
    - `bun run legal:validate`
    - `bun run legal:generate:md`
    - `bun run legal:generate:html`
    - `bun run legal:generate:pdf`

Evidence guidance:

- Stripe is safe to mention for payment processing when donor flows use it.
- Supabase is safe to mention for auth, sessions, and application data when code still supports that.
- Sentry is safe to mention for monitoring if it remains wired.
- Cloudinary, Resend, and Unlayer should only enter donor-facing policy text when donor-facing usage is clearly evidenced.
- Analytics must remain conservative until actual donor public-site analytics code is present.

Output requirements:

- Summarize each policy change and the exact evidence that justified it.
- List all remaining unresolved review markers and any source-level `TODO:` comments that still matter to future maintainers.
- Call out any statements that still require human or legal approval.
- Do not claim regulatory compliance unless the user explicitly provides approved language.
