# Tasks: Build The CRM, CMS And Database Foundation

Status is not kept here. The
[implementation record](../../../docs/audits/core-crm-cms-database-implementation-record.md#5-work-packages)
is the one place that says whether a package is ready, active, implemented,
integrated, verified or blocked. A checkbox below is ticked only after the
coordinator has recorded the package as verified there, with its evidence.

Each package's acceptance list in
[plan section 12](../../../docs/audits/core-crm-cms-database-target-architecture.md#12-dependency-ordered-implementation-plan)
is normative; the tasks below name its parts and do not narrow it. Every package
works test first (red, green, refactor) at the nearest stable seam, runs its
focused tests and then the applicable repository gates, creates each migration
with `bun run supabase -- migration new <name>`, rewrites or retires in the same
change the frozen suites and gate entries whose seam it replaces, adds
field-policy manifest rows for every column it adds, amends the
current-behaviour documents its code changes, and states its rollback.

## 0. Thin proofs (settle plan section 15.2 risks first)

- [ ] 0.1 TP5 (#2675): serve one Mission Control section under a tenant path
      segment by proxy rewrite and measure navigation and prefetching, with the
      sub-role suffix; written measurement, not merged code. Before WP2b's first
      release.
- [ ] 0.2 TP1 (#2677): one caller-token CRM list and detail read, with the policy
      cost measured on 50,000 seeded rows and the membership check written with a
      constant argument. Before WP2b's second release.
- [ ] 0.3 TP3 (#2680): one release-backed public page with admission in the
      proxy, a withdrawn page answering 404 and its image refused, and the
      200-visitor burst measurement. Before WP7.
- [ ] 0.4 TP2 (#2681): one fully constrained money command ("apply payment
      outcome" with its wrapper) called with no tenant set: a valid anchor
      succeeds, an unknown one changes nothing, another tenant's anchor cannot
      select this one. First issue of WP8a.
- [ ] 0.5 TP4 (#2681): one provider operation recovered after a lost response,
      parked after the provider's window and creating nothing. First issue of
      WP8a.

## 1. WP0 — Stop the dangerous things (#2672)

- [ ] 1.1 Role mutation refuses a platform role and the caller as target; its
      SQL function requires an admin of the target tenant.
- [ ] 1.2 The hosted seed refuses to run.
- [ ] 1.3 Schema push is off for any non-loopback host.
- [ ] 1.4 Legacy staged-gift routes require the finance capability and the state
      check.
- [ ] 1.5 The checkout success screen makes no receipt claim.
- [ ] 1.6 Each defect has a test that failed before and passes after; rollback
      is revert.

## 2. WP0b — Honest public basics (#2673)

- [ ] 2.1 One shared block registry, used by Web Studio's preview; every block
      type renders in preview from it.
- [ ] 2.2 Password recovery through Supabase Auth in all three apps, with a
      recovery email round trip in each.

## 3. WP1 — Census, database roles and the release pipeline (#2674)

- [ ] 3.1 WP1.1 database foundation: roles `cms_owner` and `cms_runtime`; the
      command schema (`tenant_guard`) granted use of `auth` and `authz`; the
      `platform` schema; default privileges and the 21 demo policies revoked;
      bucket limits; `backup_*` and retired `crm_*` tables dropped after the
      census, keeping `crm_command_logs`; the environment marker; the catalog
      gate with `platform` and the definer-function rules; the field-policy
      manifest replacing the dated capture; the reset scripts' marker check.
- [ ] 3.2 WP1.2 Payload on 4.0.0-beta.9 or newer with the Node floor raised,
      connecting as `cms_runtime` and migrating as `cms_owner`; the
      `SUPABASE_DB_URL` fallback deleted; `vendor/payload-upstream` removed or
      relabelled.
- [ ] 3.3 WP1.3 the release job (fixed order, migration heads, health
      functions), production deployment moved off Vercel's Git integration, and
      the preview project workflow in one repository-wide concurrency group.
- [ ] 3.4 WP1.4 sign-up email confirmation on, a custom SMTP sender and Auth email
      limit per hosted project, and register and recovery screens passing a
      return address.
- [ ] 3.5 WP1.5 the read-only census of both hosted projects, with exports kept
      outside the repository, for the owner's sign-off (D-01, D-02).
- [ ] 3.6 WP1.6 the platform proofs on a disposable hosted project (blocked on
      D-03; local runs first): non-bypass definer functions with the `auth`
      grant, custom login roles through the pooler, Payload start-up as
      `cms_runtime`, and the tenant and assignment headers across origins.
- [ ] 3.7 WP1.7 development rebuilt from source through the release job's one-off
      first rebuild, on the census sign-off (blocked on D-01).
- [ ] 3.8 Acceptance: schema fingerprint equality; `cms_runtime` cannot create a
      table or read `public.donors`; no demo policy, default grant or retired
      table remains; the manifest gate; no deployment outside the job; the
      promotion gate cases; serialized preview rebuilds; the marker refusal; a
      hosted sign-up round trip. Exit: no application holds a `postgres`
      connection string.

## 4. WP2 — Membership as the only authority (#2675)

- [ ] 4.1 WP2a membership and resolver: `granted_by`, `revoked_at` and the
      tenant-administrator flag; the one-assignment rule with the surface's role
      class as input; capability bundles per sub-role; the assignment chooser.
- [ ] 4.2 WP2b first release: the tenant on every request (page segment, the
      shared fetch wrapper with its lint rule, both headers from session clients
      and browser collections, the scoped browser data layer) while the database
      still ignores it; Payload's REST routes under `/web-studio/api` with the
      path-scoped cookie.
- [ ] 4.3 WP2b second release: the activation review; `authz.current_tenant_id()`
      repointed to the request header with the live-membership condition; the
      tenant condition on every signed-in policy; own-row branches bound to their
      class; write grants revoked on governed tables; Realtime publication
      emptied; the member directory function; restricted-note policies on the
      tenant-administrator flag.
- [ ] 4.4 WP2c operators: the operator list with forced RLS and its one script;
      TOTP enrolment and challenge; the shared operator and MFA check; the
      staff-read helper for read policies; every `is_super_admin()` branch
      removed.
- [ ] 4.5 Acceptance per plan WP2, including the two-tenant fixture and the
      decision table reviewed before cutover. Exit: the profile-role fallback
      test inverted; no policy reads the token claim or calls
      `is_super_admin()`. Rollback: revert down to WP2b's first release.

## 5. WP3 — Tenants, Sites and legal entities (#2676)

- [ ] 5.1 Provisioning, tenant-status and Site commands; verified Site domains
      and the host resolver; legal entities with their reserved fee-cover fund;
      the approval-policy row written explicitly; the members screen.
- [ ] 5.2 Foreign keys to `tenants` become `RESTRICT`; demo-tenant constants
      removed from non-test code. Acceptance per plan WP3.

## 6. WP4 — Server lanes (#2677)

- [ ] 6.1 WP4a plumbing and CRM: `withOperation` split into the caller-token
      client and a separate platform wrapper counted by the allowlist gate; CRM
      reads and writes moved to the caller's token, each with a two-tenant test;
      the missionaries staff read policy or view.
- [ ] 6.2 WP4b portals, Support Hub, member care, the assistant runtime and the
      rest moved; portal and export responses routed through the projection
      resolver; member-care policies narrowed and writes moved behind care
      commands; care images into custody after WP7's media-use table; the donor
      GraphQL endpoint retired (D-07).
- [ ] 6.3 Exit: the allowlist holds only platform-lane entries, system-entry
      callers and the entries owned by WP6, WP7 and WP8.

## 7. WP5 — Identity keys (#2678)

- [ ] 7.1 `parties`, `donors.party_id`, `account_links` and the claim command with
      email proof; invitation acceptance creating the link; own-row access moved
      from `profile_id` to the link; ministry-assignment keys.
- [ ] 7.2 The three Phase 10 fields on the Party, `private.party_restricted` with
      its one read function and the set-worker-identity, restrict and lift
      commands; the alias constraint trigger; the unreviewed-level signal.
- [ ] 7.3 External identifiers and the import-batch column; tenant columns on
      `donor_activities`, `follower_requests` and `missionary_tasks`; the empty
      `persons` scaffold dropped.
- [ ] 7.4 Closing step after WP4b: drop `profiles.role`, `profiles.tenant_id`,
      `donors.profile_id` and `missionaries.profile_id`. Exit and rollback per
      plan WP5.

## 8. WP6 — CMS clean target (#2679)

- [ ] 8.1 The four proofs before the baseline: hand-written constraints surviving
      a generated migration, supplied UUIDs, JSON blocks, and Core-issued signed
      upload with Payload holding metadata only.
- [ ] 8.2 The target collections (`site-presentations`, `pages`, `navigation`,
      `media`, `principal-links`), `tenantScoped()`, the actor and service ports,
      the override inventory, the strategy on Core's resolver, GraphQL removed.
- [ ] 8.3 Media custody: `public.media_assets`, the upload and finalize commands,
      the private bucket and the storage module, the delete command, the media
      route on the signed-in path.
- [ ] 8.4 The replacement in one change inside a maintenance window, on the
      census sign-off. Exit: no prototype collection remains.

## 9. WP7 — Publishing and the public site (#2680)

- [ ] 9.1 Release, head, publish-intent and media-use tables with locale and
      reach; the request-publish, fulfil-publish and withdraw commands; the
      publication policy and the tenant's reach default.
- [ ] 9.2 Admission in the donor app's proxy, the release-backed
      `PublishedContentReader`, release-keyed caching, the neutral not-found
      page, the narrowed proxy matcher.
- [ ] 9.3 Review state on `posts`, profile revisions, approve, withdraw, restrict
      and lift with their publishing effect; the partners-only read policy; the
      donor feed read live on the caller's token; the shared block registry in
      the public renderer; containment.
- [ ] 9.4 Exit: every public page, navigation set and image is served from a
      release or an approved operational revision after admission. Forward only
      after the switch.

## 10. WP8 — Money kernel (#2681)

- [ ] 10.1 WP8a payment accounts, events and intake: onboarding and the binding
      lifecycle; the Connect endpoint and account-bound events; the intake
      command with allocation lines, fee cover, source codes, anonymity, the
      signed-in hand-off and the abuse controls; payment outcome with the
      identity outcomes; leases and provider-operation records; the abandonment
      scanner; invoice and subscription events parked.
- [ ] 10.2 WP8b review, posting and receipts: approve and relink commands, the
      automatic posting entry behind a tenant setting, write-once posted tables,
      receipt facts and stored files, the email gateway's delivery record, the
      effective-amount view.
- [ ] 10.3 WP8c corrections, refunds, disputes and reconciliation: the commands
      with capability, reason and approval-policy rules, spread across lines,
      the reconciliation job and the resolve command.
- [ ] 10.4 Exit: every reader of a gift amount uses the effective-amount view;
      no legacy money route or writer remains; reconciliation runs clean.

## 11. WP9 — First complete cross-surface slice (#2682)

- [ ] 11.1 The ten-step two-tenant journey in CI, passing with a worker
      interrupted once; development's marker then set to `shared` on the
      owner's approval.

## 12. WP10 — Operations (#2683)

- [ ] 12.1 Support grants as a request context; the Auth admin module; locking a
      login; erasure and account closure; offboarding by export; the restore
      rehearsal; visibility of stuck work. Each item's evidence per plan WP10.

## 13. WP12 — Recurring giving, first slice (#2685)

- [ ] 13.1 The provider proof first (plan section 15.2).
- [ ] 13.2 Monthly gifts by card on the accepted recurring model; renewals as one
      gift per paid invoice; failed renewals without automatic retry; the
      donor's controls; stops, disconnection and subscription state; customers
      per binding. Exit: the WP9 journey gains a monthly gift with one renewal.

## 14. WP13 — First import (#2686)

- [ ] 14.1 Upload, dry run, commit and reversal as bounded jobs that re-resolve
      the stored assignment; workers and funds before gifts; imported gifts
      posted and immutable. Exit: the fixture and large-tenant files import
      cleanly.

## 15. WP14 — Rest of the restricted-worker foundation (#2687)

- [ ] 15.1 Clearance and access grants, the sensitive-read audit, country risk,
      reclassification and the publication firewall with its lint; the
      `party_restricted` read function narrowed to clearance or a live grant.
      Exit: the Phase 10 PRD's acceptance and the plan's additions pass.

## 16. WP11 — Production database (#2684)

- [ ] 16.1 Blocked on the owner (D-02) and on WP10, WP12, WP13 and WP14: rebuild
      or replace the production-named project, set its marker to `production`
      last, and pass the qualification suite on the pinned Payload version.

## 17. Documentation track — this change (#2688)

- [ ] 17.1 This change's proposal, design, tasks and spec deltas, validated with
      `bun run openspec -- validate build-crm-cms-database-foundation --strict`
      and `bun run verify:openspec-deltas`.
- [ ] 17.2 ADR-0224 to ADR-0239 and the registry entry.
- [ ] 17.3 Dated amendments to ADR-0011, 0027, 0028, 0030, 0119, 0124, 0126,
      0145, 0171, 0174, 0178, 0179, 0206, 0207, 0209, 0210 and 0213.
- [ ] 17.4 The Phase 10 PRD, the Phase 23 decision log, the roadmap and the
      `sitestacker-parity` sensitive-fields contract amendments.
- [ ] 17.5 Each package adds to this change, when it lands, any delta its
      acceptance list implies beyond those here, and amends the current-behaviour
      documents its code changes.
- [ ] 17.6 Archive only after every package is verified in the implementation
      record and merged; reconcile the legacy recurring delta with
      `sitestacker-parity`'s Phase 16 delta at that time.
