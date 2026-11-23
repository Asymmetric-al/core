# Tasks: Adopt Tenant-Owned Domains With Paths For The Dashboards

Status is not kept here. The
[implementation record](../../../docs/audits/core-crm-cms-database-implementation-record.md#5-work-packages)
is the one place that says whether a package is ready, active, implemented,
integrated, verified or blocked. A checkbox is ticked only after the coordinator
has recorded the package as verified there, with its evidence.

Every package below works test first (red, green, refactor) at the nearest
stable seam, runs its focused tests and the applicable repository gates, proves
the items `design.md` lists for it under "Not verified" before it builds on
them, and states its rollback. A failed proof with no named fallback stops the
package and returns to the owner.

## 1. N0: record the decision (this change)

- [ ] 1.1 Proposal, design and spec deltas of this change; the new contract
      sections, with the bound active changes re-pointed.
- [ ] 1.2 The plan, the implementation record, the decision records, the
      requirement documents and the guides edited at the clause.
- [ ] 1.3 `bun run openspec:validate`, `bun run verify:openspec-deltas`,
      `bunx vitest run tests/unit/docs` and `bun run format:check` pass.

## 2. Amendments to packages in flight

- [ ] 2.1 WP3a part 1, before it merges: the claimed-name record (generation,
      surfaces, expected hosting project, ready or active); a Site without a
      domain; rows written only when a challenge passes; the donor-portal record
      keeps its ID and means home; no platform-host branch.
- [ ] 2.2 WP3b, re-scoped: the redirect to home with listed query values only;
      sign-in paths refused on Sites that are not home; the home lookup; no
      recorded allowlist entries.
- [ ] 2.3 WP2c part 2: the operator area only on an Asym operations address,
      refused on every tenant domain (ruling 4).

## 3. N1: first proofs on tenant names

- [ ] 3.1 The routing proof under A: the front, the stamp and its key, base
      paths, form actions, Web Studio and the assistant, prefetch, `~<sub-role>`
      under a base path, one app rolled back alone. On failure, ruling 2's steps;
      no spend.
- [ ] 3.2 Sign-in, data reads and writes, a full-size upload, media and the cache
      test on tenant names; a home with no website at `/`.
- [ ] 3.3 The added function calls and outbound data measured and reported
      before N6 is built (ruling 7).

## 4. N2: the organization from the domain

- [ ] 4.1 The organization from the verified name; the organization ID and the
      chooser leave the address; `~<sub-role>` stays; the isolation check
      rebuilt and proved with two tabs under two roles.
- [ ] 4.2 Page identity from the organization's record (name, base address,
      titles, social cards, install name); the footer credit off by default
      (ruling 3).
- [ ] 4.3 Web Studio's cookie carries the chosen membership and is refused when
      its organization differs from the domain's.

## 5. N3: serving under paths

- [ ] 5.1 Base paths for the staff and missionary apps, the front's rewrites,
      the signed stamp, the renames to `/admin` and `/missionary`, reserved paths
      matched before CMS pages. Starts only after N1's routing proof passes.

## 6. N4: first-party sign-in and protected mail links

- [ ] 6.1 Sign-in screens call Core's routes only; registration, recovery,
      invitation and change of email through protected-action links on the
      surface's verified name, with the provider's token sealed; no fallback.
- [ ] 6.2 Core's current-password check on every surface; rate limits per
      account and per address.

## 7. N5: onboarding and activation

- [ ] 7.1 Core's DNS challenge, the six recorded proofs, activation by the
      administrator, scheduled re-checks; an operator may start the first
      challenge (ruling 5); the first administrator's operator-issued link.
- [ ] 7.2 The no-holding-page move proved before any live website is onboarded
      (ruling 12).

## 8. N6: hardening

- [ ] 8.1 Controls 1 to 7: the session cookie, the content security policy and
      headers, third-party scripts only on giving pages, the four content gaps,
      exact-address write checks, framing, the first-party data path, the
      browser-exception list with map tiles on map pages (ruling 7).
- [ ] 8.2 The staff session gate: 12 hours, 60 minutes idle, fresh proof for 10
      minutes (ruling 9). Live before WP11.

## 9. N7: replacement and loss

- [ ] 9.1 No detach while DNS points; fencing; sign-in records host and
      generation; ending that name's sessions; reset and notify (ruling 10).
- [ ] 9.2 Recovery after losing home: operator-started successor, donors through
      the processor's billing page or a cancellation route, a spare name offered
      (ruling 11).

## 10. N8: release

- [ ] 10.1 A release check through a test tenant domain beside the three project
      health checks; under A, the direct checks are on the stamp's explicit list.
