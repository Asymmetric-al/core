# OpenPolicy Authoring Rules

## Read this first

If you are an AI agent updating donor legal content in this repo, do not start from branding or assumptions.

Read these files first:

- `docs/ai/stack-registry.md`
- `docs/ai/working-set.md`
- `docs/ai/OPENPOLICY-INTEGRATION.md`
- `docs/ai/OPENPOLICY-EVIDENCE-MAP.md`
- `apps/donor/openpolicy.ts`

Then inspect the current repo evidence before editing policy text.

## Non-negotiable rules

- Use the current OpenPolicy `defineConfig()` shape.
- Do not use old `definePrivacyPolicy()`-style APIs.
- Do not invent legal facts.
- Do not infer the legal entity from `GiveHope` branding alone.
- Keep source-level `TODO:` comments and public-safe review markers for anything not verified by code evidence or human instruction.
- Treat policy edits as product changes and document why each change was made.
- Keep Maia styling donor-local and repo-native.

## Acceptable evidence

You may strengthen or expand policy config when one of these is true:

- the fact is directly visible in code or config
- the fact is documented in repo operational docs
- the user explicitly instructs you to add or change it
- a human reviewer provides verified business or legal facts

You may not strengthen or expand policy config when:

- the only evidence is naming or branding
- the only evidence is a dependency that is not actually wired into donor-facing flows
- the repo only suggests a future capability
- the change would add jurisdiction-specific legal claims without counsel approval

## Authoring workflow

1. Read `apps/donor/openpolicy.ts`.
2. Read `docs/ai/OPENPOLICY-EVIDENCE-MAP.md`.
3. Re-check current repo evidence for the area you plan to change.
4. Update `apps/donor/openpolicy.ts` conservatively.
5. Keep or add source-level `TODO:` comments for maintainers and use public-safe review markers in rendered policy text for unresolved legal facts.
6. Update the evidence map if the claim surface changed.
7. Update the human-facing guide if workflows or file locations changed.
8. Run:
   - `bun run legal:validate`
   - `bun run legal:generate:md`
   - `bun run legal:generate:html`
   - `bun run legal:generate:pdf`
9. Summarize exactly what changed, what evidence justified it, and what still requires human review.

## Repo-specific cautions

- Stripe is safe to mention for payments because the repo has direct Stripe integrations.
- Supabase is safe to mention for auth, sessions, and data because the repo has direct Supabase client and env usage.
- Vercel, Resend, and Unlayer can be mentioned only in the qualified ways already documented in the evidence map.
- Explicit human-provided legal facts that have been approved for drafting should be treated as stronger than repo inference, but they still need to be documented in the evidence map.
- Do not reintroduce the old `support@givehope.org` fallback unless a human explicitly instructs you to roll back the current legal contact.
- Cloudinary should remain optional unless donor-facing usage is confirmed, not merely available.
- Sentry should remain out of the public subprocessor list unless production enablement is explicitly confirmed.
- Cookie analytics should remain conservative unless the donor public site actually ships analytics code.

## Future AI legal assistant pattern

If the repo later adds an AI legal assistant, keep the pattern narrow:

- compile current policy markdown from OpenPolicy
- place that markdown into the system prompt or retrieval context
- answer only from the current approved policy text
- refuse to improvise or answer beyond the policy text
- do not let the assistant invent legal interpretations or compliance claims

No runtime legal assistant is required for the current integration.
