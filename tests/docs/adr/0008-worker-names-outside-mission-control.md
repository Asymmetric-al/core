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
   - a `missionaries` select or embed that holds `display_name`, `full_name`,
     `first_name` or `last_name`, or a nested `profiles` embed with `*` or one
     of those;
   - a `profiles!missionary_id(...)` embed (the feed's author) holding more
     than `id` and `avatar_url`;
   - the code `author.first_name`, `author?.first_name`, `author.last_name` or
     `author?.last_name`.
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
5. **Planted cases pin the rules.** Ten planted sources fail (a profile name
   or a whole profile in a `missionaries` embed, a worker row's first name, a
   feed author's first name, `.from("parties")` with either quote, a
   `parties` embed, a whole profile from a `missionaries` root, and
   `post.author.first_name` / `author?.last_name` in code); four pass (a
   donor's own profile by id, a donor's profile under `donors`, the donor
   portal's new worker embed and the feed's new author embed).
6. **Fixtures for a worker who has no alias.** The rule forbids a
   restricted or high-risk Party without an alias, so the suites write that
   worker ("X") as the table owner with the alias trigger disabled for the one
   statement: `worker-names.realstack` inside its rolled-back transaction, and
   `identity-keys.postgrest` committed (PostgREST reads only committed rows)
   and deleted in its `afterAll`. A worker whose stored alias is only removed
   characters (U+FE0F, U+200B) is written the same way; it is the stored-row
   case a release must count before it ships (the pull request's stored-row
   gate).
7. **The PostgREST suite gives the portal a donor of its own.**
   `identity-keys.postgrest` adds a donor ("giver") with gifts and recurring
   gifts to the three workers, so the suite's earlier exact-row assertions
   for its first donor do not change, and it mocks only
   `getAuthContext` and the admin client (a real service-key client on the
   stack) to call `GET /api/donations` and the GraphQL handler, as
   `issue-2269/donations-embed.postgrest` does.

## Readers left open, with owners

- Comment authors (`public.post_comment_authors`, `20261120130005:30-42`;
  `packages/graphql/handler.ts` `addComment`, `author:profiles!user_id(*)`):
  WP5 part 2-r2, before its restrict control ships.
- Mission Control's receipt emails and PDFs to donors
  (`packages/api/src/admin/contribution-operations/operations.ts:225-256`):
  WP5 part 2-r2, outside this scanner's scope.
- Public giving (`packages/api/src/public-giving/`): WP7, the allowlist entry.

## Edits to existing suites (record D-18)

- `tests/unit/packages/database/donor-feed-posts.test.ts`: a post with no
  public author name is named "Missionary" (the ruling's fallback), not
  "Ministry Partner"; the reason is in the test's title.
- `worker-safety.realstack`'s agreement test gains the characters this
  package removes as samples and asserts their removal in each slot: the
  agreement alone passes on the base, because both functions shared the old
  class.
- Fixture shapes only (an author is `{ id, avatar_url }` plus
  `post_author_public_name`; a portal worker carries `worker_public_name`):
  `model.test.ts`, `featured-update-hero`, `featured-hero-scrim`,
  `feed-post-card-names` and `published-post-order`.
