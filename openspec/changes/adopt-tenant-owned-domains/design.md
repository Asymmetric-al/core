# Design: Adopt Tenant-Owned Domains With Paths For The Dashboards

## Status And Authority

This design records the owner's decision of 21 November 2026, the revised domain
and routing plan written for it (revision 4, 21 November 2026, "the routing
plan"), and the ruling of 24 November 2026 under the owner's standing rule D-16
that settled the routing plan's twelve decisions. The ruling is final and commits
no money. Where it differs from the routing plan's recommendation, the ruling is
what this change says.

Nothing here is implemented. The
[implementation record](../../../docs/audits/core-crm-cms-database-implementation-record.md)
is the only place that says what is implemented, integrated or verified.

`ministry.org` stands for an organization's own domain throughout.

## The Target

1. An organization proves it controls `ministry.org` with a DNS record Core asks
   for. Until a name is ready, nothing of the organization is served anywhere.
2. Its home domain serves the website at `/`, the donor account at
   `/donor-dashboard`, Mission Control at `/admin` and the missionary workspace
   at `/missionary`. A staff member with several roles keeps a short segment only
   they see, `/admin/~finance/…`.
3. The domain names the organization. No organization ID appears in any address.
4. Sign-in, registration, password recovery and every mail link happen on the
   organization's own names, sent from its own mail account; there is no Asym
   login, redirect or fallback.
5. A visitor's browser talks only to the organization's names, with one list of
   exceptions: the payment processor on giving pages, a bot challenge on giving
   and sign-in pages if chosen, and map tiles on map pages, with no provider script (ruling 7). Core's
   servers alone reach the database and hosting providers.
6. An organization with several websites names one domain its **home**, where
   accounts and dashboards live.
7. Losing or replacing a domain never leads to an Asym address. A later owner of
   the name inherits nothing Core controls.

Afterwards `admin.`, `donor.` and `missionary.asymmetric.al` serve only Asym's
operations checks and Asym's own demonstration organization, never a tenant.

What does not change: membership as the only authority, the database's check of
the organization on every row, one donor account per organization, a gift's Site
attribution, and money.

## The Twelve Rulings (24 November 2026, under D-16)

| #   | Question                                                 | Ruling                                                                                                                                                                                                                                                                                                                                              | Same as the routing plan's recommendation? | Deciding reason                                                                                                                                                | Unblocks, or check first                                                                                                                                                                                                                                                              |
| --- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Where the signed-in areas live                           | **A**, paths on one domain, as the owner chose                                                                                                                                                                                                                                                                                                      | No (the plan recommended B)                | A can be made acceptably safe (controls 1 to 7 below) and built (documented multi-zones; a no-fee merge of apps as fallback)                                   | N0 now. N1's routing proof before any N3 work; controls 1 to 7 live before WP11                                                                                                                                                                                                       |
| 2   | If the routing proof fails: spend, or merge the apps     | No spend; the no-fee steps first (below)                                                                                                                                                                                                                                                                                                            | No (the plan recommended spend)            | A ruler cannot commit money, and the per-request fee has no cap                                                                                                | Only if N1 fails                                                                                                                                                                                                                                                                      |
| 3   | The "Powered by Asymmetric.al" footer credit             | Off by default; an organization may switch it on                                                                                                                                                                                                                                                                                                    | Yes                                        | "The entire experience belongs to the tenant"                                                                                                                  | N2 page identity; reversal is one default there                                                                                                                                                                                                                                       |
| 4   | Where the operators' console lives                       | Only on an Asym operations address, refused on tenant domains                                                                                                                                                                                                                                                                                       | Yes                                        | It is Asym's own tool; no operator session beside tenant content                                                                                               | WP2c part 2                                                                                                                                                                                                                                                                           |
| 5   | Before an organization's domain is ready                 | Nothing tenant-facing until a tenant-owned name is ready; an operator may start the first challenge                                                                                                                                                                                                                                                 | Yes                                        | The owner's decision from the first click                                                                                                                      | WP3a part 1 amendment, N5; the ADR-0196 line in N0                                                                                                                                                                                                                                    |
| 6   | Core for accounts and dashboards only, website elsewhere | Yes, on a name the organization owns                                                                                                                                                                                                                                                                                                                | Yes                                        | Forcing a website move blocks adoption                                                                                                                         | N1 also proves a home with no website at `/`                                                                                                                                                                                                                                          |
| 7   | Provider hosts in a visitor's browser                    | Provider hosts: none from the browser, server-side allowed. Map tiles: a listed browser exception on map pages, with no provider script                                                                                                                                                                                                             | Partly (the plan proxied map tiles)        | Under A the hidden session already forces the first-party data path; tiles are data, not script, and proxying them costs unmeasured money for no security gain | N1 measures added function calls and outbound data; the figure is reported before N6 is built, and work stops if it needs a plan change or add-on. A full-size upload is proved; the 20 MiB beta (4 GB memory) only with the owner's word, else the product's upload limit comes down |
| 8   | Where the dashboards answer                              | The home domain only                                                                                                                                                                                                                                                                                                                                | Yes                                        | Under A each signed-in domain carries the same-origin risk                                                                                                     | WP3a part 1 amendment, WP3b re-scope                                                                                                                                                                                                                                                  |
| 9   | Staff sessions and fresh proof                           | Yes, as recommended: staff sessions end after 12 hours or 60 minutes idle; refunds, role changes, payment-account changes, domain changes and exports need fresh proof (password or second factor) lasting 10 minutes; changing a password, email address or second factor asks for the current one on every surface; Core's own gate enforces this | Yes                                        | Under A, the main containment left for a script acting as staff                                                                                                | N6 gate. Check first: N4 proves Core's current-password check                                                                                                                                                                                                                         |
| 10  | After a lost domain passes to a stranger                 | Reset passwords and notify                                                                                                                                                                                                                                                                                                                          | Yes                                        | The collected password opens every organization the person belongs to                                                                                          | N7. Check first: sign-in records host and generation                                                                                                                                                                                                                                  |
| 11  | Getting back in after losing the home domain             | Yes to all three: operator-started successor, donors through the processor's billing page, a spare name offered but not required                                                                                                                                                                                                                    | Yes                                        | Home-only makes home a single point of failure                                                                                                                 | N7. Check first: the billing page enabled for every payment account, and a cancellation route where it is not                                                                                                                                                                         |
| 12  | A holding page on a real domain during a website's move  | No holding page on a real domain                                                                                                                                                                                                                                                                                                                    | Yes                                        | The old website serves until the new one is proved                                                                                                             | Check first: N5's proof (a pre-generated certificate, the name checked before DNS moves, a way back) before onboarding any live website; pre-generation by the provider's command-line tool until an API is shown                                                                     |

Several rulings hold more than one decision:

- **7** is three: provider hosts (forced by A), map tiles (cost), and staff single
  sign-on, which Phase 44 revisits.
- **9** is two: session lengths, and the list of acts that need fresh proof, which
  WP8 and later money packages extend.
- **11** is three recovery measures.
- **1** also settles option C's question: no third-party website scripts unless
  the owner later chooses C.
- **2** exists only under A; **5** and **12** share the second-name path (an
  organization moving an existing website works on a second name it owns, such
  as `new.ministry.org`, until launch).
- **8** is revisited if N7's drill shows that losing home recovers too slowly.

### Decision 1: what A costs against B

The routing plan offered A (paths on one domain, the owner's form), B (staff and
missionary dashboards on their own tenant-owned names) and C (every signed-in
area on its own name). It recommended B. The owner chose A; the ruling keeps
the owner's choice and records its price, as written:

1. **Security:** under A a script on any page of the domain (a renderer flaw, a
   compromised payment or challenge script) acts as the signed-in staff member,
   and no strict policy stops injected inline script; under B the browser keeps
   the website out of the dashboards.
2. **Effort:** A adds five large, three medium, one small package; B three of
   each (N3 large not small, N6 large not medium).
3. **Operations:** A adds a front, a signed stamp and its key, a hop on every
   dashboard request, per-app rollback to prove, and a proof that can fail into
   decision 2; B needs three names per organization.
4. **People:** A is one name and one sign-in for a staff member who gives; B a
   second sign-in.
5. **Reversal:** B later discards N3 and the stamp; choosing before N3 starts
   costs nothing.

### Decision 2: before any spend

If N1's routing proof fails:

1. Find which check failed; fix it within the front at no fee (the stamp by a
   rewrite-set secret header, as Vercel documents, or a signature); re-run.
2. If it still fails, read the managed-routing price page. Only if two projects
   carry no fee at all, per-request included, move the missionary app into the
   donor app and route two projects.
3. Otherwise stop and bring the owner: "The routing proof failed because \_\_\_.
   Managed routing costs $250 a month for the third project plus $2 per million
   routed requests, uncapped: about $\_\_\_ a month at N1's measured volume. Approve
   with a monthly ceiling of $\_\_\_, or merge the apps (no fee; releases coupled;
   the largest job)?"

## How It Works Under A

- **One front.** The home domain is attached to the donor app (the front). It
  passes `/admin/…` to the staff app and `/missionary/…` to the missionary app.
  Those two get a base path, a fixed prefix in front of all their addresses.
  Crossing apps reloads the page. Reserved paths: no CMS page may take a
  dashboard, sign-in or system path.
- **The stamp.** Behind the front each dashboard app would see its own project
  address, from which today's code builds addresses and checks origins. So the
  front stamps each request with the verified address, signed so that only the
  front can make it, and the two apps refuse anything unstamped.
- **Six recorded proofs for each name:** control (Core's own single-use DNS TXT
  challenge, which starts a new generation of the name), attachment (an operator
  with a second factor), routing (the provider's authenticated answer, then the
  pointing record seen resolving), HTTPS (a certificate answering on the real
  name for this binding and generation), sign-in ready, and activation by the
  organization's administrator. Ready names admit staff; visitors see nothing
  until activation.
- **Sign-in and mail links are first-party.** Credentials go to Core's own route;
  Core's server talks to the auth provider and sets the session. Registration,
  recovery, invitation and change-of-email links are protected-action links that
  do nothing until a person presses the button, land on the organization's
  verified name for that surface (under A, the home domain), are refused on any
  other organization's domain or a later generation, and work in any browser.
  Mail comes from the organization's own mail account (ADR-0029), so no automated
  mail goes out before it is connected; the first administrator gets an
  operator-issued, single-use link handed over in person.
- **One domain shares one session, so paths are not security boundaries.**
  Controls 1 to 7 apply: (1) the session cookie unreadable by page scripts,
  secure-only and locked to its exact name; (2) a content security policy on
  every page, which must allow inline script because a strict one is
  incompatible with prerendering; (3) third-party scripts only on giving pages;
  (4) the four content gaps closed (the rich-text cleaner, a mail-image upload's
  extension, receipts' no-sniffing header, service workers refused); (5) write
  checks compare the exact address; (6) dashboards refuse to be framed and keep
  nothing sensitive in browser storage; (7) fresh proof and shorter staff
  sessions (ruling 9).
- **Replacing and losing a domain.** The new domain passes all six proofs first;
  one step moves home and the old domain refuses every signed-in page. A name is
  never detached while its DNS still points to the platform; it stays fenced. On
  evidence that a stranger controls a lost name, Core fences that generation,
  ends its sessions, and has those who signed in there reset their password,
  told why (ruling 10).

The routing plan's sections 3 to 9 and its appendix E hold the detail each
package inherits (file references, the stamp's two key arrangements, the cookie
writers, the link sources to replace). They are copied into each package's brief,
not into the repository.

## The Order Of Work

**Stops:** WP3b's parts that assume a separate portal host; WP3a part 2 as
drafted; further work on the organization ID in addresses.

**Goes on:** WP2c part 1, the release-job change and the record; WP4a (its write
check later reads the stamped address); WP3a part 1's migrations that part
cleanly from the domain model (being checked); WP3c's invitation table and issuer,
whose links take the protected-action form; WP5; WP6, except its edits to files
N2 moves.

**Amended before merging:** WP3a part 1's domain model (medium): each claimed
name records its generation, the surfaces it may serve, the hosting project that
should answer, and whether it is ready or active; a Site exists before its
domain; a row is written only when a challenge passes; the donor-portal record
keeps its ID and now means home. WP3b, re-scoped (medium): the redirect goes to
home, carries only listed query values, and sign-in paths are refused on Sites
that are not home. WP2c part 2's operator area (small): on the Asym operations
address only.

**New packages**

| #   | Package                                                                       | Size   | Waits for                                                                                |
| --- | ----------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------- |
| N0  | This change: the OpenSpec change and the edited documents                     | Medium | Nothing                                                                                  |
| N1  | First proofs on tenant names: routing, sign-in, data, uploads, media, caches  | Medium | N0                                                                                       |
| N2  | Organization from the domain; page identity; Web Studio cookie                | Large  | N1, and the WP3a part 1 amendment                                                        |
| N3  | Serving under paths: base paths, rewrites, the stamp, renames, reserved paths | Large  | N1's routing proof (ruling 1)                                                            |
| N4  | First-party sign-in and protected mail links                                  | Large  | N1                                                                                       |
| N5  | Onboarding: challenge, proofs, activation, monitoring                         | Large  | N1, the WP3a part 1 amendment                                                            |
| N6  | Hardening: cookie, policy, headers, content gaps, data path, staff sessions   | Large  | N1's cost figure (ruling 7); its headers start beside N1; the cookie work after N2 to N5 |
| N7  | Replacement and loss: fencing, ending sessions, recovery                      | Medium | N6                                                                                       |
| N8  | Release checks through a test tenant domain                                   | Small  | Lands with N3 or N2                                                                      |

**Sequence.** N0 first, then N1. Beside N1: the WP3a part 1 amendment, WP3b's
re-scope and N6's headers. Then N2, N3, N4 and N5; then N6's cookie work; then
N7. N8 lands with N3 or N2. Controls 1 to 7 are live before WP11.

**Effect on the program.** WP7 waits for the reserved paths. WP8's signed-in
giving runs on home. WP9 runs on a test tenant domain. WP11, the first real
organization, waits for N4 to N7. This adds five large, three medium and one
small package. No source gives a duration.

## Not Verified, And What Settles Each

| Item                                                                                                                                                                                                                                                                                                                | Settled by                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Behind the front: the host each dashboard app sees; that the signed stamp arrives; form actions, Web Studio and the assistant under a base path; session-setting responses never cached by the provider's network; redirect addresses; the role suffix under a base path                                            | N1 on a test deployment                                                                        |
| The stamp's verifying key: a rewrite-set secret header, as Vercel documents, or a signature; whether a header set by the front's routing reaches the two apps                                                                                                                                                       | N1                                                                                             |
| Added function calls and outbound data from the first-party data path (ruling 7)                                                                                                                                                                                                                                    | N1 measures; the figure is reported before N6 is built                                         |
| A full-size upload (5 MiB plus overhead) through a tenant name, and signed, transformed and ranged reads there; the 20 MiB body opt-in is a public beta needing the 4 GB memory setting                                                                                                                             | N1, before N6 is sized; the beta only with the owner's word, else the product limit comes down |
| Caches keyed by Site, name and generation through every cache, the provider's network included; a response that sets or refreshes a session never cached                                                                                                                                                            | N1 and N2                                                                                      |
| A home with no website at `/` (ruling 6)                                                                                                                                                                                                                                                                            | N1                                                                                             |
| The rebuilt isolation check: two tabs under two staff roles; a read and a write from a stale tab both refused                                                                                                                                                                                                       | N2                                                                                             |
| The provider's one-time token for each kind of link, and that the provider sends no mail of its own on these flows or from its public sign-up and recovery endpoints                                                                                                                                                | N4                                                                                             |
| Whether a per-domain allowlist is still needed, its size limit, and a fallback setting that resolves nowhere                                                                                                                                                                                                        | N4, on a disposable project                                                                    |
| The forwarded-address setting for rate limits working for Core's server-side calls                                                                                                                                                                                                                                  | N4                                                                                             |
| Core's own check of the current password on every surface (ruling 9)                                                                                                                                                                                                                                                | N4, before N6's gate                                                                           |
| The landing page's one inline script pinned by a per-request random value on one route                                                                                                                                                                                                                              | N4                                                                                             |
| A certificate pre-generated and the real name checked before DNS moves, then a cutover with a way back; whether pre-generation can be driven by API (the provider documents its dashboard and command-line tool only)                                                                                               | N5, before onboarding any live website (ruling 12)                                             |
| Registration-expiry data for each top-level domain                                                                                                                                                                                                                                                                  | N5                                                                                             |
| The first-administrator link for a person who already administers another organization                                                                                                                                                                                                                              | N5                                                                                             |
| Locking the session cookie to its exact name with the auth library's split cookies; which further auth-client call sites write cookies                                                                                                                                                                              | N6                                                                                             |
| Staff single sign-on behind a first-party route (ruling 7)                                                                                                                                                                                                                                                          | A proof before Phase 44 is planned in detail                                                   |
| Shortening the one-hour access-token window                                                                                                                                                                                                                                                                         | N7                                                                                             |
| Sign-in recording host and generation (ruling 10)                                                                                                                                                                                                                                                                   | N7, checked first                                                                              |
| The provider's authenticated answer that a removed name is absent, before a claim is released                                                                                                                                                                                                                       | N7                                                                                             |
| The processor's billing page enabled for every organization's account, and a cancellation route where it is not (ruling 11); a donor really stopping a monthly gift while home is unavailable                                                                                                                       | N7, checked first                                                                              |
| Whether a provider-side claim of a detached but still-pointed name is possible on today's DNS targets                                                                                                                                                                                                               | One disposable add, remove and re-add test                                                     |
| Managed routing's host behaviour and current prices (only if N1 fails)                                                                                                                                                                                                                                              | Ruling 2's steps                                                                               |
| The organization's mail-account price                                                                                                                                                                                                                                                                               | Read at onboarding design                                                                      |
| Hosted plan, credentials and Auth settings                                                                                                                                                                                                                                                                          | The WP1 census                                                                                 |
| WP3a part 1's independent migrations parting cleanly from the domain model                                                                                                                                                                                                                                          | The coordinator's check                                                                        |
| Which address serves a closed organization's export download (the plan's "Offboard a tenant (WP10)" row). Under rulings 4 and 8 the only consistent address is the closed organization's own home domain, and the plan does not yet say that name stays admitted after closure. An open question, not answered here | The package that owns closing an organization (WP10's offboarding)                             |
| Realtime stays off unless a tenant-hosted connection is proved                                                                                                                                                                                                                                                      | Before any live update is switched on                                                          |

A fact, not a doubt: the database provider allows a single custom domain per
project, so it is no route to a domain per tenant.

## Data Ownership, Security, Compatibility And Rollback

- **Ownership.** The claimed-name record (name, generation, organization,
  surfaces it may serve, expected hosting project, ready or active) is Core's,
  in the WP3 tables. The donor-portal host record keeps its ID, because gift
  intake records it; it now means the organization's home.
- **Security.** Membership and the database's row rules remain the only
  authority; the domain only selects the organization, and a path only routes.
  Controls 1 to 7 and ruling 9 contain the one-domain risk; they are live before
  the first real organization (WP11).
- **Compatibility.** WP2b's organization ID in the address is already merged; N2
  removes it and keeps `~<sub-role>`. No migration is in this change.
- **Rollback.** This change is documentation; reverting its commits restores the
  earlier text. Each package states its own rollback.
