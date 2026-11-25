# 0008. Outside Mission Control a worker is named only by its public name: the contract scanner and its fixtures

**Status:** Recorded on 2026-11-25 with AL-2678 (WP5 part 2-r1; issue 2805,
obligation 2 and note 1; the D-16 ruling on WP5 part 2, Q8 and Q9). Source
comments are banned since AL-2676
([#2751](https://github.com/Asymmetric-al/core/issues/2751)), so the reasons
behind these tests are written here. It describes the code as it is and
ratifies no product intent. Accepted platform intent is in
[`docs/adr/`](../../../docs/adr/README.md).

## Context

A worker in a sensitive place can be marked restricted or high-risk; from then
on only an alias may be shown outside Mission Control (plan section 12, WP5,
line 1003). Before this package the donor portal's gifts, recurring gifts,
receipts and statements, the Ministry Updates feed, `GET /api/donations` and
the donor GraphQL endpoint named a worker from the login profile, usually the
real name. Migration `20261126010000_wp5_2r1_worker_names.sql` adds the
service-key computed columns `public.worker_public_name(public.missionaries)`
and `public.post_author_public_name(public.posts)`, which fail closed: a
restricted or high-risk worker gets the alias or `NULL`, never
`parties.display_name`.

## Decisions

1. **One rule, enforced by a scanner.**
   `tests/unit/acceptance/issue-2678/worker-names.static.acceptance.test.ts`
   reads every non-test source under `apps/` and `packages/`, outside
   `apps/admin/**` and `packages/api/src/admin/**` (the scope of
   [0005](0005-pins-read-their-source.md)'s service-key ceiling and of
   Mission Control). It parses each file with the TypeScript compiler and looks
   only inside string and template literals, in the form of
   [0001](0001-money-table-embed-scanner.md)'s money-embed scanner. It fails
   on:
   - any read of `parties`: a `.from("parties")`, a literal that is exactly
     `parties`, or a `parties(` / `parties!` embed;
   - a `missionaries` select or embed that holds `*`, `display_name`,
     `full_name`, `first_name` or `last_name`, or a nested `profiles` embed
     with `*` or one of those (`*` since the fix round: the worker row has
     private columns, `phone`, `birth_date`, `location`, the Member Care
     columns, that a donor must never receive, so every reader lists its
     columns);
   - a post author's `profiles` embed holding more than `id` and
     `avatar_url`: one with the column hint `!missionary_id` or the
     constraint hint `!posts_missionary_id_fkey` anywhere, and any top-level
     `profiles` embed of a select whose root is `posts`, with or without a
     hint (PostgREST resolves the sole key without one);
   - the code `author.<name>` or `author?.<name>` for any of the four name
     columns.
2. **A donor's own profile is told apart by nesting.** A `profiles` embed is a
   worker read when it is nested in a `missionaries` embed, reached through
   `!missionary_id`, or at the top of a select whose root is `missionaries`.
   A root `.from("profiles")`, a `profiles` embed under `donors`, and a
   top-level `profiles` embed of a select whose root is another table (a
   comment's author under `post_comments`) are not. A top-level `profiles`
   embed in a literal whose root the scanner cannot find is treated as a
   worker read: the scan fails closed.
3. **Roots are found as in 0001.** A literal's root is the `.from(...)` of
   the `.select(...)` it is passed to, directly or through a constant of the
   same file or one imported from another source file. A computed select
   built from template parts is read part by part, by its tokens outside
   parentheses.
4. **A shrink-only allowlist.** `packages/api/src/public-giving/columns.ts`
   (`PUBLIC_WORKER_SELECT`, no caller; owner WP7, which also applies
   `do_not_publish`) is its one entry. An entry whose file no longer violates
   fails the test, so the list can only shrink.
5. **Planted cases pin the rules.** Eighteen planted sources fail (a profile
   name or a whole profile in a `missionaries` embed, a worker row's first
   name, a feed author's first name, `.from("parties")` with either quote, a
   `parties` embed, a whole profile from a `missionaries` root,
   `post.author.first_name` / `author?.last_name` in code; and since the fix
   round a posts-root author by the constraint hint, by no hint and by the
   column hint, an unbound literal with the constraint hint,
   `post.author.display_name`, `author?.full_name`, and `missionaries(*)` as
   an embed and as a root); six pass (a donor's own profile by id, a donor's
   profile under `donors`, the donor portal's worker embed, the feed's author
   embed in a literal and under a posts root, and the donations read's
   explicit worker columns).
6. **What the contract does not see.** A scanner of string literals cannot
   follow a read that is not spelled in one literal: a two-step read (the
   worker's `profile_id`, then `.from("profiles")` by that id), an inverted
   embed (`.from("profiles").select("display_name, missionaries!inner(id)")`),
   a select returned by a helper function or re-exported through more than
   one module, a name taken by destructuring (`const { first_name } =
post.author`) or by bracket access (`author["first_name"]`), SQL inside
   `.rpc(...)`, and a GraphQL resolver that maps another source. Each is a
   review item, not a test. A template expression inside a `missionaries(...)`
   or a post author's embed fails closed: the scanner cannot read the embed
   and reports it.
7. **Fixtures for a worker who has no alias.** The rule forbids a
   restricted or high-risk Party without an alias, so the suites write that
   worker ("X") as the table owner with the alias trigger disabled for the one
   statement: `worker-names.realstack` inside its rolled-back transaction, and
   `identity-keys.postgrest` committed (PostgREST reads only committed rows)
   and deleted in its `afterAll`. A worker whose stored alias is only removed
   characters (U+FE0F, U+200B) is written the same way; it is the stored-row
   case a release must count before it ships: of the pull request's four
   stored-row counts, the third (`private.party_alias_problem(id) IS NOT
NULL` on `public.parties`) and the fourth
   (`private.normalize_safety_text(legal_name) IS NULL` on
   `private.party_restricted`) must read 0.
8. **The PostgREST suite gives the portal a donor of its own.**
   `identity-keys.postgrest` adds a donor ("giver") with gifts and recurring
   gifts to the three workers, so the suite's earlier exact-row assertions
   for its first donor do not change, and it mocks only
   `getAuthContext` and the admin client (a real service-key client on the
   stack) to call `GET /api/donations` and the GraphQL handler, as
   `issue-2269/donations-embed.postgrest` does; for `POST /api/donations` it
   also mocks the Stripe client, the saga and the gift intake, which inserts
   the gift directly.
9. **The safety text's classes are derived, not trusted (fix round, F3).**
   `tests/unit/acceptance/issue-2678/safety-text-classes.static.acceptance.test.ts`
   reads both patterns from the migration and checks them against the
   runtime's own Unicode tables over U+0001 to U+10FFFF: every
   `Default_Ignorable_Code_Point`, assigned or not, is removed; every `Cf` is
   removed or is one of the named visible marks; every `Cc` that is not
   whitespace is removed; the whitespace class is exactly `White_Space`; and
   nothing else is removed but the Braille blank. A runtime with a later
   Unicode version that adds a code point to one of those classes fails it
   and names the code point. The suite printed Unicode 17.0 when the fix round
   ran.
10. **The projection's branches are pinned, and the allowlist fails closed
    (fix round, F5 and F6).** `worker-names.realstack` names a `high_risk`
    worker with and without an alias, a `sensitive` one without an alias, a
    `standard` one with an alias, a worker with no profile, and the post
    authors that `private.assignment_for_profile` must not guess (a worker of
    another organization only, a profile with one row in each organization,
    a profile with two rows in one). A copy of the function with
    `'high-risk'` misspelt fails it. With the level's CHECK and NOT NULL
    dropped inside its rolled-back transaction, it also proves an unknown or
    a NULL level gets the alias or NULL.

## Readers left open, with owners

- Comment authors (`public.post_comment_authors`, `20261120130005:30-42`;
  `packages/graphql/handler.ts` `addComment`, `author:profiles!user_id(*)`):
  WP5 part 2-r2, before its restrict control ships.
- Mission Control's receipt emails and PDFs to donors
  (`packages/api/src/admin/contribution-operations/operations.ts:225-256`):
  WP5 part 2-r2, outside this scanner's scope.
- Public giving (`packages/api/src/public-giving/`): WP7, the allowlist entry.
- The CMS template writer
  (`apps/admin/src/cms/create-from-template-endpoint.ts:402-438`) writes a
  worker's profile name into a giving page's title and slug. Inside Mission
  Control, so outside the scanner. Owner: WP7, which publishes those pages
  and applies `do_not_publish`; WP7 may not publish a worker's giving page
  until this writer names the worker by `worker_public_name`. Nothing public
  reads a CMS page until WP7.
- GraphQL's `posts`, `post` and `createPost` embed
  `missionaries!missionary_id` on `posts`, whose key names `profiles`, so
  PostgREST refuses them (`PGRST200`); they fail closed and show no name.
  Owner: WP4b (`packages/graphql/handler.ts`). When it repairs them it must
  select `post_author_public_name` and `author:profiles!missionary_id(id,
avatar_url)`.
- GraphQL's `Query.missionaries` and `Query.missionary` show the bio, the
  mission field and the funding figures of every worker of the organization,
  a restricted one included, to any signed-in member; no page calls them.
  Whether a restricted worker is listed at all is the publication rule
  (`do_not_publish`, WP7); the handler is WP4b's.

## Edits to existing suites (record D-18)

- `tests/unit/packages/database/donor-feed-posts.test.ts`: a post with no
  public author name is named "Missionary" (the ruling's fallback), not
  "Ministry Partner"; the reason is in the test's title.
- `worker-safety.realstack`'s agreement test gains the characters this
  package removes as samples and asserts their removal in each slot: the
  agreement alone passes on the base, because both functions shared the old
  class.
- `tests/unit/acceptance/issue-2269/donations-embed.realstack.acceptance.test.ts`
  C1: the pinned `DONATION_WITH_PARTIES_SELECT` moved twice, its reason in the
  title: first the worker's profile narrowed to `id, avatar_url` and
  `worker_public_name` was added; then, in the fix round, the worker row
  became an explicit column list (`id, tenant_id, bio, mission_field,
funding_goal, current_funding, created_at, updated_at`).
- Fixture shapes only (an author is `{ id, avatar_url }` plus
  `post_author_public_name`; a portal worker carries `worker_public_name`):
  `model.test.ts`, `featured-update-hero`, `featured-hero-scrim`,
  `feed-post-card-names`, `published-post-order` and
  `tests/e2e/donor-dashboard-frame.spec.ts`.
