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
   `scanSources`, `evaluateEmbeds` and `isRelationshipChoosingViolation` reject
   every unquoted embed matching `EMBED` inside a string or template literal
   under `apps/` and `packages/` (tracked and non-ignored untracked
   `.js`/`.jsx`/`.mjs`/`.cjs`/`.ts`/`.tsx`/`.mts`/`.cts` files; test
   directories, `*.test.*`/`*.spec.*` files, comments and JSX prose excluded)
   that chooses a relationship among the seven tables by anything other than the
   bare table name: a column hint (`missionaries!missionary_id`), a
   column-named embed (`fund:fund_id(...)` or `missionary_id(...)`), a key-name
   hint (`donations!donations_fund_id_fkey(...)`), a constraint-named embed or a
   hinted spread (`...funds!fund_id(...)`). Quoted relationship names are not
   recognised by `EMBED`, a limit recorded as owed in PR #2753. Each refused
   form resolves on only one side of `20261120130004`, whereas the bare table
   name resolves on both schemas in either direction because each schema holds
   one relationship per pair. Refusal applies wherever the literal sits (nested
   inside another embed, passed through a helper string or written as a spread).
   Cited: AL-2676 (WP3a part 1a), rounds M (M1), N (F1) and O (A); plan 7.4.
2. **Allow join modifiers and match `supabase-js` hint whitespace.**
   `JOIN_MODIFIERS` (`inner`, `left`) do not select a relationship and are
   filtered out by `hintsOf`, so they are allowed on bare table names. `EMBED`
   matches an optional `...` spread prefix, optional `alias:`, optional
   whitespace around `!` hints (because `supabase-js` strips whitespace around
   `!`) and `(`, while excluding property access (`obj.funds(`) and tokens
   directly following `!`. `scanSources` separately rejects hint tokens
   preceded by `!` with intervening whitespace within 16 characters before the
   match (such as `profiles! missionary_id(`) that `EMBED`'s lookbehind cannot
   exclude alone.
3. **Fail closed on dynamic `.from(...)` roots, even for hint-free embeds.**
   `evaluateEmbeds` refuses any match whose `FoundEmbed.root` is `DYNAMIC_ROOT`
   (`"<dynamic>"`), even when the embed carries no relationship hint, and never
   grants an exemption for it (pinned by the negative scanner test for
   non-literal roots and reused builder names). `resolveTableArg`,
   `setOrDynamic` and `scanSources` produce `DYNAMIC_ROOT` when `.from(...)`
   has an argument the scanner cannot resolve to a single literal table name
   (a `const` bound to one string literal does resolve, through
   `stringConsts`), when one string constant or `.from(...)`
   builder variable name binds to two different roots in the same file, or when
   a repeated variable name binds to multiple roots. Without a statically known
   literal table, the scanner cannot verify whether a hint-free embed belongs in
   `INVENTORY` or whether an `EXEMPTIONS` entry actually sits on an unaltered
   parent table rather than one of the seven altered tables.
4. **Bind `.from("…")` roots using the narrowest enclosing select for
   `DYNAMIC_ROOT`, `INVENTORY` and `EXEMPTIONS`, never to waive Decision 1.**
   `indexFile` and `scanSources` bind `FoundEmbed.root` from inline
   `.from(...)...select(arg0)` spans (`inlineSelectSpans`), same-file variable
   declarations (`varDecls`), variable-bound `.from(...)` builders
   (`varFromRoots`), transitive helper string references and resolved relative
   or `@asym/` named imports, holding `null` when unbound or `DYNAMIC_ROOT`
   when the root cannot be resolved to a single literal table name. When
   inline selects nest, `scanSources` sorts
   enclosing `inlineSelectSpans` by ascending span width (`end - start`) and
   uses the narrowest enclosing select before checking variable declarations
   bound to `.from(...)` selects.
   - `INVENTORY` is the closed list of hint-free embeds between the five money
     tables and `funds`/`missionaries` bound to a money or target root (six
     forward sites, zero reverse) and feeds the real-catalog half in the
     `migrate` job (`TENANT_GUARD_IT_ADMIN_DATABASE_URL`), where every listed
     pair and all ten money-to-target pairs must have one relationship and zero
     single-column keys. Unbound non-violating string tokens (such as the
     GraphQL SDL field `missionaries(limit, offset)` in
     `packages/graphql/handler.ts`) are governed by Decision 1 alone and need no
     entry in `INVENTORY`.
   - `EXEMPTIONS` is the closed escape from Decision 1 (currently the four `posts`
     selects in `packages/graphql/handler.ts`) and holds only when `evaluateEmbeds`
     matches `FoundEmbed.root` to `parent`, where `parent` is outside the seven
     tables altered by `20261120130004`.
5. **Tolerate working-tree deletions when reading `git ls-files` paths.**
   `repoEvaluation` reads each path returned by `sourceFiles()` (`git ls-files
--cached --others --exclude-standard -- apps packages`) inside `try {
sources.set(file, readFileSync(file, "utf8")); } catch {}` so a file listed
   in Git's index but deleted in the working tree does not crash the scan. As
   written, that bare `catch {}` swallows any error thrown by `readFileSync`
   (not only `ENOENT`) and skips the file.
6. **Known overlap and scanner limits.** The AST root binder overlaps with
   `tests/integration/api-contract/select-inventory.ts` (left unmerged in
   AL-2676; tracked under #2708). Selects assembled at run time from parts,
   hints interpolated into templates, quoted relationship names, computed
   relationships and views are not seen; root binding follows variable
   declarations and resolved relative or `@asym/` named imports only (not
   reassignments or arbitrary module graphs).
