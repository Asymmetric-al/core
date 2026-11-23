# 0001. Scan money-table embeds independently of the query root

**Status:** Recorded on 2026-11-23 from code comments in `tests/` removed under
AL-2676 ([#2751](https://github.com/Asymmetric-al/core/issues/2751)). It
describes the code as it is and ratifies no product intent. Accepted platform
intent is in [`docs/adr/`](../../../docs/adr/README.md).

## Context

Migration `20261120130004_giving_target_entities.sql` replaces each of the five
money tables' single-column foreign keys to `funds` and `missionaries`
(`donations`, `donor_pledges`, `staged_gifts`, `staged_gift_allocations`,
`donation_saga_outbox`) with composite `(tenant_id, target)` keys. During an
expand-then-contract rollout (plan 7.4), PostgREST embeds between those seven
tables must resolve against both the pre-migration and post-migration catalogs.

## Decisions

1. **Refuse relationship-choosing embeds independently of `.from(...)` root.**
   In `tests/unit/acceptance/issue-2676/money-embeds.realstack.acceptance.test.ts`,
   `isRelationshipChoosingViolation` rejects any string or template literal
   under `apps/` and `packages/` (tracked files and non-ignored untracked ones;
   tests, comments and JSX prose excluded) that chooses a relationship among the
   seven tables by anything other than the bare table name: a column hint
   (`missionaries!missionary_id`), a column-named embed (`fund:fund_id(...)` or
   `missionary_id(...)`), a key-name hint
   (`donations!donations_fund_id_fkey(...)`), a constraint-named embed or a
   hinted spread (`...funds!fund_id(...)`). Each of those forms resolves on only
   one side of `20261120130004`, whereas the bare table name resolves on both
   schemas in either direction because each schema holds one relationship per
   pair. Refusal applies wherever the literal sits (nested inside another embed,
   passed through a helper string or written as a spread). Cited: AL-2676 (WP3a
   part 1a), rounds M (M1), N (F1) and O (A); plan 7.4.
2. **Allow join modifiers and match `supabase-js` hint whitespace.** `JOIN_MODIFIERS`
   (`inner`, `left`) do not select a relationship and are allowed on bare table
   names. `EMBED` matches an optional `...` spread prefix, optional `alias:`,
   optional whitespace around `!` hints (because `supabase-js` strips whitespace
   around `!`) and `(`, while excluding property access (`obj.funds(`) and
   tokens directly following `!`. The scan loop separately rejects hint tokens
   preceded by `!` with intervening whitespace (such as
   `profiles! missionary_id(`) that the regex lookbehind cannot exclude alone.
3. **Bind `.from("…")` roots only for `INVENTORY` and `EXEMPTIONS`, never to
   waive Rule 2.** `FoundEmbed.root` binds via same-file constants, transitive
   helper string constants and named imports, holding `null` when unbound or
   `"<dynamic>"` when non-literal or ambiguous (for example, a variable bound to
   two roots).
   - `INVENTORY` is the closed list of hint-free embeds between the five money
     tables and `funds`/`missionaries` bound to a money or target root (six
     forward sites, zero reverse) and feeds the real-catalog half in the
     `migrate` job (`TENANT_GUARD_IT_ADMIN_DATABASE_URL`), where every listed
     pair and all ten money-to-target pairs must have one relationship and zero
     single-column keys. Unbound non-violating string tokens (such as the
     GraphQL SDL field `missionaries(limit, offset)` in
     `packages/graphql/handler.ts`) are governed by Rule 2 alone and need no
     entry in `INVENTORY`.
   - `EXEMPTIONS` is the closed escape from Rule 2 (currently the four `posts`
     selects in `packages/graphql/handler.ts`) and holds only when the AST binds
     the match to `.from("<parent>")` equal to `parent`, where `parent` is
     outside the seven tables altered by `20261120130004`.
4. **Known overlap and scanner limits.** The AST root binder overlaps with
   `tests/integration/api-contract/select-inventory.ts` (left unmerged in
   AL-2676; tracked under #2708). Selects assembled at run time from parts,
   hints interpolated into templates, computed relationships and views are not
   seen; root binding follows same-file constants and named imports only.
