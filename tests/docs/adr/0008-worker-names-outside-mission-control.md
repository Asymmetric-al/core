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
     `full_name`, `first_name` or `last_name`, or a `profiles` embed at any
     depth under it with `*` or one of those (`*` since the fix round: the worker row has
     private columns, `phone`, `birth_date`, `location`, the Member Care
     columns, that a donor must never receive, so every reader lists its
     columns);
   - a post author's `profiles` embed holding more than `id` and
     `avatar_url`: one with the column hint `!missionary_id` or the
     constraint hint `!posts_missionary_id_fkey` anywhere, and any top-level
     `profiles` embed of a select whose root is `posts`, with or without a
     hint (PostgREST resolves the sole key without one), and any `profiles`
     embed nested in a `posts(...)` embed, whatever the outer root;
   - a template chunk that ends in `missionaries!`, `profiles!`, `posts!` or
     (since the r2a fix round) `post_comments!`, the hint interpolated before
     the parenthesis, and (since r2a's second round) a chunk that ends in one
     of those four names as a select item (at its start, or after `,`, `(`
     or an alias and `:`), as in `missionaries${h}(`: the embed cannot be
     read, so the scan fails closed;
   - the code `author.<name>` or `author?.<name>` for any of the four name
     columns.
2. **A donor's own profile is told apart by nesting.** A `profiles` embed is a
   worker read when it is nested in a `missionaries` embed, reached through
   `!missionary_id`, or at the top of a select whose root is `missionaries`.
   A root `.from("profiles")`, a `profiles` embed under `donors`, and a
   top-level `profiles` embed of a select whose root is another table are
   not. A top-level `profiles` embed in a literal whose root the scanner
   cannot find is treated as a worker read: the scan fails closed. Since WP5
   part 2-r2a a commenter's profile is no read at all (rule 1): a `profiles`
   embed under a `post_comments` root, or nested at any depth in a
   `post_comments(...)` embed, fails with any hint, because commenters come
   only from `public.post_comment_authors`; a `post_comments` embed itself is
   skipped like `donors` and `posts`.
3. **Roots are found as in 0001, from a first pass.** A literal's root is the
   `.from(...)` of the `.select(...)` it is passed to, directly or through a
   constant of the same file or one imported from another source file. Since
   WP5 part 2-r2a (gate f) the table name of a `.from(T)` comes from a first
   pass, before the walk, over every string literal a name is given in the
   file, as the initializer of a `const`, `let` or `var` or by a later
   assignment (`T = "missionaries"`, also to a `let` declared without a
   value); a name's values are the union of those and of the constant it is
   imported as, when it is imported too (a local name never hides an imported
   one, and a select constant is rooted in both files); a `.from(T)` takes
   every value as a root. A constant declared after its use, given two
   values, assigned later or shadowed is no longer missed. A computed select built from
   template parts is read part by part, by its tokens outside parentheses.
4. **A shrink-only allowlist.** `packages/api/src/public-giving/columns.ts`
   (`PUBLIC_WORKER_SELECT`, no caller; owner WP7, which also applies
   `do_not_publish`) is its one entry. An entry whose file no longer violates
   fails the test, so the list can only shrink.
5. **Planted cases pin the rules.** Twenty-three planted sources fail (a profile
   name or a whole profile in a `missionaries` embed, a worker row's first
   name, a feed author's first name, `.from("parties")` with either quote, a
   `parties` embed, a whole profile from a `missionaries` root,
   `post.author.first_name` / `author?.last_name` in code; and since the fix
   round a posts-root author by the constraint hint, by no hint and by the
   column hint, an unbound literal with the constraint hint,
   `post.author.display_name`, `author?.full_name`, and `missionaries(*)` as
   an embed and as a root; and since the last step a post author nested in a
   `posts` embed under another root and inside a `missionaries` embed, a whole
   profile two embeds deep in a `missionaries` embed, and a `missionaries` or
   `profiles` embed whose hint is interpolated); six pass (a donor's own profile by id, a donor's
   profile under `donors`, the donor portal's worker embed, the feed's author
   embed in a literal and under a posts root, and the donations read's
   explicit worker columns). WP5 part 2-r2a adds P1-P14, 16 failing sources
   (P8 is three: `use cache: remote`, `use cache: private` and a file-level
   `use cache`), and K1, so 40 failed; K2-K4 made 9 pass. Each P passed
   the scanner before r2a and K2 failed it. The r2a fix round adds P15-P26
   (a shadowed import as a root, as a cached select and as a select of every
   column; a `post_comments` embed with an interpolated hint; a `fetch` whose
   `next` sets `revalidate` by a shorthand property, whose `cache` is a
   template or a variable holding `force-cache`; a `let` assigned a root or a
   select after its declaration, with and without an initial value; a
   function and a file whose `use cache` follows `use strict`) and the guard
   K6 (`next: { revalidate: 60 }`), so 53 failed; the controls K5, K7, K8
   and K9 made 13 pass. Each of P15-P26 passed the scanner before the fix
   round. r2a's second round adds P27-P32 (a cached function returning a
   helper's read: of the same file, imported, two helpers deep, and an arrow
   helper calling `post_comment_authors`; a `fetch` whose options are a local
   constant holding `force-cache`; a hint interpolated with no `!`) and the
   guards K15 (`revalidate: false`) and K16 (`revalidate` a variable), so
   61 failed; the controls K10-K13 and K14 (`revalidate: 0`, which failed
   before) made 18 pass. Each of P27-P32 passed the scanner before the
   second round. The last round adds P33 (a cached call to an imported
   helper that reads a worker's name, with an unrelated nested function of
   the same name in the file), which passed before it, so **62 fail**; its
   control K17 (the helper reads no worker name) makes **19 pass**.
6. **What the contract does not see.** A scanner of string literals cannot
   follow a read that is not spelled in one literal: a two-step read (the
   worker's `profile_id`, then `.from("profiles")` by that id), an inverted
   embed (`.from("profiles").select("display_name, missionaries!inner(id)")`),
   a select returned by a helper function or re-exported through more than
   one module, a name taken by destructuring (`const { first_name } =
post.author`) or by bracket access (`author["first_name"]`), SQL inside
   `.rpc(...)` (in a cached scope rule 2 reads
   `.rpc("post_comment_authors")`; other SQL in `.rpc(...)` stays unseen),
   a GraphQL resolver that maps another source, and a select
   built from a constant that is itself built from another constant or an
   array spread in the same file (the scanner binds a root to the constant
   passed to `.select(...)` and to the literals in its own initializer, not
   to the constants that initializer names). Each is a review item, not a
   test. A template expression inside a `missionaries(...)`
   or a post author's embed fails closed: the scanner cannot read the embed
   and reports it. Nor does it see a root when `.from(...)` and `.select(...)`
   are split across a local variable (`const q = db.from("missionaries");
q.select("*")`), a name given by a default or namespace import, by a
   logical assignment (`T ||= "missionaries"`, `T ??= ...`) or by
   destructuring (`const [T] = ["missionaries"]`). A name's values are the
   union of every string it is given anywhere in the file, whatever the
   scope: that can refuse a harmless query, never pass a harmful one.
7. **Fixtures for a worker who has no alias.** The rule forbids a
   restricted or high-risk Party without an alias, so the suites write that
   worker ("X") as the table owner with the alias trigger disabled for the one
   statement: `worker-names.realstack` inside its rolled-back transaction, and
   `worker-names.postgrest` committed (PostgREST reads only committed rows)
   and deleted in the shared fixture's `afterAll`. A worker whose stored alias is only removed
   characters (U+FE0F, U+200B) is written the same way; it is the stored-row
   case a release must count before it ships: of the pull request's four
   stored-row counts, the third (`private.party_alias_problem(id) IS NOT
NULL` on `public.parties`) and the fourth
   (`private.normalize_safety_text(legal_name) IS NULL` on
   `private.party_restricted`) must read 0.
8. **The PostgREST suite gives the portal a donor of its own.**
   Since WP5 part 2-r2a the worker-name tests are their own file,
   `worker-names.postgrest`, beside `identity-keys.postgrest`; both build the
   same stack rows from one module, `identity-keys.postgrest-fixture.ts`, and
   each keeps its own mocks. The fixture adds a donor ("giver") with gifts and
   recurring gifts to the three workers, so the identity-key suite's
   exact-row assertions for its first donor do not change, and
   `worker-names.postgrest` mocks only
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
   whitespace is removed; the whitespace class is exactly `White_Space`, read
   only with its `+`, and the removal class only without one; and nothing else
   is removed but a named list of characters that are blank though no
   property says so (the Braille blank U+2800, the Egyptian hieroglyph full
   and half blank U+13441 and U+13442, the musical symbol null notehead
   U+1D159), each of which it requires removed, and the Syriac abbreviation
   mark U+070F, a format character the Unicode Standard (16.0, section 9.3.1)
   calls zero-width, with no glyph of its own. A runtime with a later
   Unicode version that adds a code point to one of the derived classes fails
   it and names the code point. The named list cannot be derived: whether an
   assigned letter or symbol draws ink is a property of fonts, not of
   Unicode's tables, so a blank glyph nobody has listed can still pass. The
   suite printed Unicode 17.0 when the fix round ran.
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

11. **No server cache holds a worker's public name (WP5 part 2-r2a, gate
    b; rule 2).** The Ministry Updates feed (`getCachedFeedPosts` in
    `packages/api/src/posts/index.ts`) kept rows holding
    `post_author_public_name` under `"use cache"` with
    `cacheLife("minutes")`: up to an hour after a restriction. Nothing could
    expire it from where a restriction is made. `revalidateTag(tag, "max")`
    serves stale content to the next request, `updateTag` works only in a
    Server Action, the default cache handler is in memory per instance and per
    build (a tag expired in Mission Control never reaches the donor or the
    missionary app), and the safety commands run through `rpc/` with no route
    at all. So the feed is a request-time read in its Route Handler
    (`getFeedPosts`), and the contract fails, outside Mission Control: inside
    any function-like node (a declaration, a function expression, an arrow
    function with a block body, a method) or file whose leading directives
    (the string statements before any other, read from the syntax tree in
    either quote) include `"use cache"`, `"use cache: remote"` or
    `"use cache: private"`, a `.select(...)` whose text holds
    `worker_public_name` or `post_author_public_name`, directly or through a
    same-file or imported constant, and a `.rpc("post_comment_authors", ...)`;
    and since r2a's second round, a call from such a scope to a function
    that makes either read, itself or through the functions it calls: a
    function declaration or a function or arrow function assigned to a name,
    in the same file or imported by name from a scanned file, followed
    transitively, each function once (a cycle ends there). A call is
    resolved to every function of that name in the file and to the one it
    imports by that name, so it can refuse a harmless call, never pass a
    harmful one. The same helper called only from uncached code stays
    allowed. Anywhere: a call of
    `unstable_cache` imported by name from `next/cache` (under its own name or
    an `as` name), any call named `unstable_cache` and any `.unstable_cache(`
    on an object; and a `fetch(` whose options object, written at the call or
    held by a name bound once in the same file to an object literal, sets
    `cache` to `"force-cache"` (a literal, a template, or a name holding it),
    or sets a `next` object written there whose `revalidate` is a positive
    number, `false`, or anything that is not a number literal (fail closed);
    `revalidate: 0` does not cache (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/fetch.md`,
    "options.next.revalidate": `false` caches indefinitely, `0` prevents
    caching, a number caches for at most that many seconds). No handler has
    to expire anything when a worker is restricted (gate c). The tag
    `CACHE_TAGS.tenantPosts` and its `revalidateTag` calls stay and now
    expire nothing; removing them is WP7's. What the rule cannot see, each a
    review item: a table name computed at run time, held in an object or
    passed as a parameter; a helper reached through a variable that holds a
    function, a method of an object, a dynamic `import()`, or a module that
    re-exports it; a select constant built with `+`, `.join()`, a template
    with expressions, or through a second name (`const S = A`), which the
    rule cannot read as a string; a `"use cache: <name>"` kind other than
    remote and private (it needs `cacheHandlers`, which no app sets); a
    `fetch` whose options are built elsewhere (a parameter, a call, a name
    bound more than once), whose `next` is (`next: buildPolicy()`, the shape
    `packages/lib/cms/public-page.ts` builds, which no caller passes today),
    a `fetch(new Request(url, { cache: "force-cache" }))`, and a `fetch`
    called by another name; and `unstable_cache` reached through a local
    variable (`const memo = unstable_cache`), a bracket access
    (`ns["unstable_cache"]`) or a module that re-exports it.
12. **A restricted person is an anonymous partner to a colleague (WP5 part
    2-r2s; the D-16 ruling on r2a's readers, point 2).** A restriction changes
    `parties` only, so a restricted worker who gives to a colleague, or asks
    to follow one, was named to that colleague from `donors` and `profiles`.
    - **The fact.** `public.donor_is_restricted_party(public.donors)`
      (`20261126060000_wp5_2r2s_donor_restricted_party.sql`), a service-key
      computed column, is false only when the donor has a Party in its own
      organization and every Party linked to its login, or to a login of that
      Party, in any organization, is standard or sensitive; it is never NULL.
    - **The seam.** `isAnonymousToRecipient`
      (`packages/api/src/missionary-portal/redaction.ts`) takes a required
      `restrictedParty`, and its first line hides the donor unless that is
      exactly `false`: `true`, `null`, `undefined`, a missing key, a failed
      read and a donor absent from the rows read all hide. A hidden donor is
      "Anonymous partner", "AP" or `null`, never an alias, which would tell
      the colleague who it is. `isAnonymousToPublic` is unchanged.
    - **The contract.**
      `tests/unit/acceptance/issue-2678/supporter-names.static.acceptance.test.ts`
      parses `packages/api/src/{missionary-portal,missionaries,follower-requests}/`
      and `packages/graphql/` with the TypeScript compiler. A `.select(arg)`
      resolves from a literal, a template whose substitutions resolve, both
      branches of a conditional, a `+` of resolvable parts, any same-file
      variable of that name (every value kept) or a constant imported by a
      relative or `@asym/*` specifier; a `.select()` with no argument on a
      `donors` root is `*`, and `.from(T)` resolves `T` the same way. S1: a
      `donors` read (a root, or an embed at any depth, any alias or hint)
      holding anything but `id`, `tenant_id`, `profile_id`, `missionary_id`,
      `party_id` and the fact names `donor_is_restricted_party`; an
      unresolvable argument in a file whose strings name `donors` fails. S2:
      its file, or a file it imports by a relative path, calls
      `isAnonymousToRecipient` with an object literal holding
      `restrictedParty`. S3: no `restrictedParty: false` literal in non-test
      source under `apps/` or `packages/`. S4, the one allowlist entry:
      `DONATION_WITH_PARTIES_SELECT` is selected in
      `packages/graphql/handler.ts` only inside `myDonations` and
      `createDonation`, the caller's own gifts. Twelve planted cases are
      reported and four controls are not.
    - **What the contract cannot see**, each a review item: a table name
      computed at run time or passed as a parameter; a query builder held in
      a variable before `.select`; a reader outside the roots; a SQL function
      that returns donor columns; a mapper that passes the wrong field (the
      unit tests hold that); a `false` that is not a literal
      (`const f = false; isAnonymousToRecipient({ restrictedParty: f })`);
      and free text a colleague wrote earlier, such as a task's title.

## Readers closed by WP5 part 2-r2a

- Comment authors: `public.post_comment_authors`
  (`20261126050000_wp5_2r2a_comment_authors.sql`) names a worker by the
  post's organization's projection, and a commenter linked to a restricted or
  high-risk Party in any organization (a non-worker's restricted Party
  included), or a worker with no sole row in the post's organization, has no
  photo and is named only by an alias or not at all; GraphQL `addComment`
  reads no embed and returns the caller's own profile with the request's
  organization and role.
- Mission Control's updated receipt emails and PDFs to donors: each line's
  worker is named by `worker_public_name` when the snapshot is made, and
  again at every PDF download; a line with no `missionaryId`, a restricted or
  high-risk worker without an alias, and a worker the projection does not
  find have a null `missionaryName` (no "Missionary:" in the email, "—" in
  the PDF). The staff detail keeps its label inside Mission Control.

## Readers closed by WP5 part 2-r2s

A restricted person who gives to a colleague, or asks to follow one, is an
anonymous partner to that colleague (decision 12), for a `missionary` and a
`staff` caller alike, in every reader a colleague reaches: GraphQL
`Query.mySupporters` (`donor: null`; it now also leaves out a donor who chose
to give anonymously); Partners (`GET /api/missionary/donors`); the portal
snapshot (a gift keeps its donor id only when its donor was read and is
shown); tasks (`GET`, `POST` and `PATCH`, the donor's id kept); follower
requests (`GET` and `PATCH`, no donor id and no donor); the metrics route
(`donor_id: null`); and the donor writes (`PATCH` of a donor and `POST` of an
activity answer 404 "Donor relationship not found" for every hidden donor,
restricted or anonymous alike).

## Readers left open, with owners

Exactly thirteen. Short paths are under `packages/api/src/` (receipt files under
`admin/contribution-operations/`, `staged-gifts.ts` under
`admin/contributions/`); `handler.ts` is `packages/graphql/handler.ts`;
`checkout-client.tsx` is under `apps/donor/app/(public)/(solid)/checkout/`.

1. **Public donor names** (`projectPublicDonorDisplayName`,
   `missionary-portal/redaction.ts`, and `public-giving/gift-anonymity.ts`):
   no live caller. Owner: WP7, which applies the same Party safety rule
   before any public donor list.
2. **A future gift-notice email to a worker**: no code mails a worker about
   a donor today. Owner: WP8b, which applies the same rule.
3. **A donor record that no evidence links to the person**, such as an
   offline gift staff entered under the real name with no link to the
   person's login or Party: it is still shown under that name. Owner: WP4b.
4. **The Partners list's order** (`missionary-portal/donors.ts`, ordered by
   the stored name on the server): a hidden row's page and position follow
   the real name, as an anonymous partner's do. Owner: WP4b.
5. **The donor's own id on Partners rows and tasks** (ruling Q3): it opens
   and updates the row, names no one, and lets a colleague link a task made
   before a restriction to the anonymous row after it. Owner: WP4b.
6. **A restricted worker's photo (`profiles.avatar_url`) and post media,
   outside comments.** Readers: the feed (`posts/select.ts:2` →
   `posts/index.ts:53`, `packages/database/hooks/donor-feed-posts.ts:373-374`);
   the donor portal (`donor-portal/service.ts:73,94` →
   `model.ts:275,303,329`, `checkout-client.tsx:1540`); `/api/donations`
   (`donations/select.ts:11`); GraphQL
   (`handler.ts:262,281,303,332,536,814,854`, `:376,411,727`); public giving
   (`public-giving/columns.ts:39`, `projection.ts:62`); and the `profiles`
   bucket (`profile/image-url.ts:7`). Owners: WP7 (approved profile
   revisions, WP6/WP7 private media custody, admitted media route; plan
   `:345, :357-359, :1053-1054, :1066`); WP4b (GraphQL); WP14
   (`private.party_restricted.real_photo_ref`; plan `:984, :1335`).
7. **Public giving** (`public-giving/columns.ts:37-39`,
   `projection.ts:36-66`): the one allowlist entry, no caller. Owner: WP7,
   applying `worker_public_name`, the approved photo and `do_not_publish`.
8. **The CMS template writer**
   (`apps/admin/src/cms/create-from-template-endpoint.ts:402-438`) puts a
   worker's profile name in a giving page's title and slug; nothing public
   reads CMS pages until WP7. Owner: WP7. WP6 part 2b rewrites the file; WP7
   may not publish a worker's giving page until the writer uses
   `worker_public_name` and `do_not_publish`.
9. **A worker fund's name** (`funds.name` with `funds.missionary_id` set,
   `20250101000000_init_schema.sql:110`), a staff label, is shown on receipts
   (`giving/receipts.ts:190`, `receipt-pdf.ts:68`), in the donor portal
   (`donor-portal/service.ts:72,93`, `model.ts:264,302,318`) and in
   correction notifications (`notifications/store.ts:145-170`). A
   restriction does not rename it. Owner: WP7, with WP14's firewall.
10. **The allocation memo on updated receipts**, held in
    `staged_gift_allocations.memo` (`20260512190000:160`),
    `effective_values.designationLines[].memo`
    (`correction-effective-values.ts:95`) and the snapshot's `content`
    (`receipt-delivery.ts:285,365,405`). Only finance staff write it
    (`staged-gifts.ts:41,230`, `contribution-operations/route.ts:200-251`).
    It is shown as stored in the email (`giving/receipts.ts:192,208`) and the
    PDF (`receipt-pdf.ts:70`). Owner: WP8b (retires the snapshots, builds
    immutable receipt facts, rules plan `:441` against `:345` and on free-text
    memos), with WP14's firewall.
11. **GraphQL `posts`, `post`, `createPost`** (`handler.ts:300-335,533-539`)
    fail closed (`PGRST200`). Owner: WP4b; if repaired, they select
    `post_author_public_name`, and the photo moves with WP7.
12. **GraphQL `Query.missionaries` and `Query.missionary`**
    (`handler.ts:249-288`) show any member every worker's `bio`,
    `mission_field`, `funding_goal`, `current_funding` and
    `profile.avatar_url`, restricted included; no page calls them. Owners:
    WP4b (handler), WP7 (`do_not_publish`, approved photo).
13. **The `missionary_name` merge tags** (`packages/email/merge-tags.ts:157`,
    `packages/config/pdf-studio.ts:301-303`): not a reader today, since no
    code fills them; whoever wires them reads `worker_public_name`. Owner:
    WP8b or the template-resolution owner.

## Edits to existing suites (record D-18)

- WP5 part 2-r2a: `identity-keys.postgrest` split, move only (r1's seven
  tests to `worker-names.postgrest`, the shared stack rows to
  `identity-keys.postgrest-fixture.ts`; the same 15 titles and assertions).
- WP5 part 2-r2a: `contribution-receipt-delivery.test.ts` and
  `contribution-receipt-pdf.test.ts` pass the new required
  `workerPublicNames` map; the PDF test's map keeps "Riley Worker" for its
  assertion, and its snapshot stub gains `.in()` and becomes thenable. No
  assertion changed.
- WP5 part 2-r2a (gate g): `donations-worker-columns.test.ts`'s projecting
  stub throws, naming the part, on anything it cannot project
  (`name:column`, `column::text`, `...embed(...)`, `count()`), and
  `workerSelect` throws without a closed worker embed; it used to drop them.
- WP5 part 2-r2a: `tests/unit/workflows/local-supabase-paths.test.ts`'s
  identity-key reader list gains the receipts the PostgREST suite renders,
  its reason in the title.
- WP5 part 2-r2s, each reason in its title; no assertion is weakened:
  `packages/api/tests/unit/missionary-portal-redaction.test.ts`'s existing
  calls pass `restrictedParty: false`; the named-donor fixtures of
  `missionary-donors-list`, `missionary-portal-snapshot-redaction`,
  `model.test.ts`, `currency.test.ts` and `missionary-metrics-redaction`
  carry `donor_is_restricted_party: false`; the stubs of
  `donor-mutations.test.ts`, `donor-anonymous-mutations.test.ts` (a chain
  for each call) and `selected-authority.test.ts` answer the write guard's
  read; `donations-embed.realstack` site 4 selects
  `SUPPORTER_DONATION_SELECT` and `selectOf` resolves it, so C3 still
  resolves its embeds; `donations-embed.postgrest`'s profiled donor chose to
  be named, and an anonymous case answers `donor: null`;
  `donations-embed-endpoints.test.ts` checks `mySupporters`' select against
  `SUPPORTER_DONATION_SELECT`; `snapshot-select-schema.test.ts` counts a
  one-argument function on a table's row type as that table's computed
  column; `local-supabase.test.ts`, `local-supabase-paths.test.ts` and
  `REAL_DATABASE_FILES` gain the two new suites.

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
