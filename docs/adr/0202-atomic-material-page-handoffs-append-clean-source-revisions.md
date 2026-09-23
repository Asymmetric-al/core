# ADR-0202: Material-purpose Page Handoffs append clean source Working successors

**Status:** Accepted (founder-ratified Phase 24 D81, 2026-08-31)

## Context

ADR-0201 requires a materially different public purpose to continue as a fresh
private Page rather than reuse the source Page's identity or public routes. It
leaves the source public release unchanged and transfers no current/historical
public route, continuity, Navigation, schedule, publication, permission,
provider, or money authority. ADR-0203 later permits only D2-owned succession
of one exact sealed private Draft-only Path Claim to a fresh target claimant-
ownership occurrence/version; that
is not reuse of the source identity or public route authority.
It intentionally deferred one private authoring question: after the exact saved
candidate becomes the new Page draft, what should the source's one visible
active draft—backed by separate Editorial and Placement Working heads—contain?

Leaving the candidate as an ordinary source draft would create two active
copies and invite an accidental second publication under the wrong Page
identity. Deleting, overwriting, or using a raw provider restore would hide the
staff member's work, weaken recovery, and conflict with proposed ADR-0156's
append-only Working Revision and lease contract. A new transferred-draft state
would avoid deletion but add another lifecycle, publish fence, recovery flow,
and operating burden for a bounded handoff.

Current CMS practice supports the required pieces, but no reviewed standard or
vendor defines this exact operation as a universal primitive. Payload's current
**revert to published** creates a new version equal to the published state and
keeps prior drafts. Sanity explicitly warns that copying draft work elsewhere
does not reset the original draft and tells editors to discard the leftover.
Payload and PostgreSQL support one all-or-none transaction, while WCAG supports
an explicit, reviewable, recoverable action without a redundant confirmation on
every ordinary save. The atomic composition below is therefore a bounded Core
product decision, not a claim that one vendor workflow is an industry mandate.

Current `develop` still has Tenant-only mutable Payload Pages, provider draft
status, and 300-millisecond provider autosave. It has no accepted Site/locale
Page identity, D12 Working Revision/lease boundary, D1 immutable public
generation, D2 Placement Revision, D23 transfer compiler, D79 purpose decision,
or D80 command. This ADR specifies the permanent model only; it cannot be
implemented by exposing today's Payload duplicate, restore, or latest-version
endpoints.

## Decision

### One explicit move-and-clean completion of D80

When D79's authorized material-purpose choice and D80's sealed independent-Page
plan are ready, the final action SHALL be **Move saved changes to new Page
draft**. It is the only D81 disposition and is part of D80's one command; D81
adds no standalone duplicate action, transferred-draft state, wizard, workflow,
approval, assignment, permission, or background cleanup.

The action SHALL create the D80 target and return the source Page's affected
private Working heads to the exact source-owned Editorial and Placement
revisions pinned by the same current D1 public generation. It SHALL do so only
by appending private successors and advancing private heads. It SHALL never
delete, overwrite, relabel, mutate, or destructively restore the pre-handoff
candidate; change the public generation; or reconstruct authoring state from
compiled HTML, a public read projection, an unpinned provider `latest`, or a
browser buffer.

For every source-owned Working axis in the sealed candidate pair that differs
from the exact D1-pinned live revision, Core SHALL append one cause-labelled
private successor populated from that authoritative revision and advance that
axis's Working head. An axis already equal to the pinned live revision SHALL
not receive a redundant no-op revision. Editorial and Placement remain distinct
D12 resources with distinct identities, permissions, heads, and leases; the
command coordinates an exact reviewed pair without fusing their models. Shared
or global owners, Reusable Sections, Navigation, schedules, comments, and every
other separately owned axis are never reset implicitly.

The target is the deterministic result of D80's finite, versioned transfer
manifest—not a byte-identical clone. Fresh Page, locale-lineage, block, anchor,
Working Revision, and Placement identities, materialized Page-local content,
validated references, and disclosed repairs are expected. Every admitted saved
member must receive an exhaustive result: safely transfer, materialize/remap,
explicitly omit with a named repair, or block. The exact untransformed source
candidate remains independently recoverable in source history, so a repairable
omission is visible and recoverable rather than silently lost.

### Protected source checkpoint and bounded history

Before advancing any source Working head, Core SHALL append one logical handoff
event/cause, **Moved saved changes to a new Page draft**, grouping independently
resource-scoped Editorial and Placement checkpoint pins. It is not a fused
cross-axis D12 content resource. The event binds the exact source Page, locale,
per-axis candidate revision IDs and digests, exact public generation and pinned
source revisions, D79 decision, D80 manifest/policy versions, target initial
revisions, actor, time, and command receipt. The receipt stores identifiers,
hashes, causes, and result references; it does not duplicate Page bodies or
become a read/write authority.

The checkpoint protects the authoritative candidate revision(s) from ordinary
rolling-autosave or provider version pruning for the duration of the existing
authorized D12 recovery/retention promise. **Protected** does not mean immortal
or exempt from the repository's retention, legal hold, privacy, deletion, or
anonymization owners. Those owners may later dispose of content only after
their normal dependency and hold proof; the minimal append-only receipt and
non-sensitive digests remain for the period their governing audit policy
permits. Target deletion, Trash, purge, access loss, or later edits cannot make
the source checkpoint unintelligible or silently prune it.

Before implementation tickets, D12's versioned semantic-retention profile SHALL
register the `material_page_handoff` cause. Protection begins at the committed
handoff checkpoint. Ordinary pruning becomes eligible only when the profile's
recorded protection predicate has elapsed and no D12 recovery pin, D1
dependency, legal hold, privacy restriction, or other governing owner block is
current. An authorized privacy/deletion outcome may take precedence under its
own policy. Every release/prune decision records the profile version, owner
evidence, outcome, time, and permitted tombstone/receipt result. D81 invents no
day count or Tenant-configurable retention setting, and an adapter/provider
limit never supplies this predicate.

History SHALL compare the exact pre-handoff source candidate with the clean
source successor through D12's existing compare surface. Editorial and
Placement checkpoint axes authorize independently; an Editorial-history grant
never reveals a restricted staged path. The surface renders only authorized
axes or a generic unavailable result. It SHALL not introduce a live cross-Page
comparison subsystem. A link to the receipt-bound initial target revision
appears only after fresh exact target-resource read plus target-version/history
read authorization; current-target read alone is insufficient. Source-axis
history, target-resource, and target-version/history authority are checked
independently. If the target is gone or unreadable, the source history remains
useful and shows a generic, non-enumerating unavailable result rather than
leaking the target title, route, Site, locale, lifecycle, or existence.

### One short expected-head transaction

Preflight SHALL seal one expiring plan over the trusted actor/effect epoch;
exact Tenant, environment, Site, source Page, and locale; source candidate
Editorial and Placement Working revisions and dependency digest; current D1
public generation and its exact source-owned revision pins; D79 choice and
continuity head; source lease generations; schedule state; D80 manifest,
adapter, policy, target title, selected Parent Page/Top-level choice, trusted
resolved parent/root placement owner, normalized route claim, repairs,
ADR-0205's positively qualified reviewed sibling gap or append-last disposition,
D2 order-contract version, and semantic command identity. Browser form values never supply authoritative
scope, actor, owner, head, lease, or public pins.

Commit SHALL reauthorize and revalidate every mutable fact. In one short
transaction and deterministic resource-lock order, Core SHALL:

1. win or reconcile the scope-bound semantic-idempotency receipt;
2. fence the exact source Working/public/continuity/schedule/lease heads;
3. determine the exact qualified D81/D82/D83 successor-effect manifest and
   derive the sibling cohort represented by its post-clean current heads;
4. validate D84's explicit closed boundary against that final baseline or
   resolve append-last against its current tail;
5. create the complete private D80 target, transfer artifacts, and one fresh
   D84 target Placement/order result;
6. append the protected source handoff checkpoint;
7. append only the exact owner-qualified D81 clean source Working successors,
   D82 claim succession, and D83 derived-output successors in the sealed
   manifest, and advance only their exact heads;
8. retire or advance every current lease generation in the sealed source
   Editorial/Placement candidate pair so a stale tab,
   back/forward-cache instance, or queued autosave cannot reinstate the moved
   candidate; and
9. append the durable receipt, business audit, and outbox before commit.

Physical SQL write order may differ only when the transaction proves the same
final semantic topology. No immutable pre-existing revision is mutated; only
the qualified D81/D82/D83 manifest may advance an affected head or change its
owner-qualified source-clean/derived state. Every Page outside that manifest
retains its parent/order, D84 preserves the relative order of pre-existing
members in the final cohort, and D84 causes no additional source/descendant
effect.

The receipt binds the D84 disposition, causative D2 provenance, explicit
boundaries when applicable, actual committed predecessor/successor/boundary,
and order-contract version. Those identities are historical evidence only;
they do not become continuing target Placement relationships. Append-last
replay returns the original committed result and never resolves a newer tail.
Boundary evidence follows the same versioned `material_page_handoff` retention,
privacy, hold, deletion/anonymization, export, backup, and tombstone rules as
the checkpoint; it creates no purge-blocking permanent neighbor FK.

Every database and qualified Payload operation SHALL be awaited and participate
in the same transaction request. `disableTransaction` is forbidden. No network,
Vercel, DNS, TLS, preview, renderer, Media fetch, search, cache, analytics,
notification, integration, Stripe, or other provider call may run in that
transaction. If the source and target facts cannot participate in one
authoritative atomic persistence boundary, the action remains unavailable;
Core SHALL NOT add a distributed transaction or compensating saga for this
staff convenience.

Any failed authorization, lease, expected-head, public-pin, schedule, route,
reference, manifest, schema, retention, lifecycle, or constraint proof SHALL
leave the source candidate and lease unchanged and create no target. Database
uniqueness and same-scope referential constraints decide target identity,
route-claim, active-head, and semantic-command races. Transactions are short,
acquire locks in one documented order, never wait for user input, and retry
serialization/deadlock failures only by replaying the exact semantic command.

Same-key/same-input replay SHALL return the one previously authorized receipt
without another target, checkpoint, successor, audit effect, or lease change.
Same-key/different-input reuse SHALL fail as a semantic conflict. After an
unknown response, the client SHALL freeze successor source writes, reconcile
the durable receipt, and then show the committed result or permit a new review;
it SHALL NOT expose blind retry or call the operation failed merely because an
HTTP response was lost.

### Lease and editor behavior

The D81 action requires the current D12 lease generations for the sealed source
Editorial/Placement candidate pair as well as expected-revision CAS. If an
existing lease in that pair belongs to another actor/session, D81 blocks and
uses D12's ordinary return/takeover path; it never silently overrides that
editor. A lease coordinates editors but never replaces mutation-time
authorization, validation, or CAS. If another tab saves, publishes, takes over,
changes a source-owned axis, or changes the public generation after review,
commit fails with no partial effect.

Successful commit closes or fences every current lease in the sealed source
pair, even when an unchanged axis correctly receives no no-op successor. The
initiating browser reconciles success before any later autosave and leaves the source
editor. A stale source tab becomes read-only and refreshes to the clean Working
heads; its old generation cannot save. The target's active-editor lease is
never copied or silently transferred. Opening the target after success requires
fresh exact target read/edit authority and an ordinary fresh D12 target lease.
If that post-commit check fails, Core shows a permission-safe committed
confirmation without target title, path, detail, or navigation. Access loss
cannot roll back or expose the source candidate.

Unacknowledged browser-only edits are outside the candidate and SHALL block the
action with **Save these changes first**. D81 promises no recovery for content
the server never acknowledged. An unresolved publication appointment for any
affected source candidate must be cancelled through its existing owner before
handoff; unrelated unpublish or separately owned appointments are neither
silently cancelled nor broadened into D81.

### Focused Web Studio experience

D81 remains inside D80's existing inline PageShell consequence review. It adds
no modal, second confirmation, destructive styling, typed phrase, progress
wizard, cross-Page workspace, or timed toast. Immediately above the action, the
review SHALL show two stacked outcome rows in one semantic reading order:

When ADR-0203/D82 applies, the existing Parent Page and Web address fields form
one placement group with the complete tenant-branded planned URL and **From
`<source>`'s saved draft** provenance. The helper says Core has not published
the address and that it will be reserved for the new private Page only after
the move. It is advisory, not a reservation. Editing either field removes the
special disposition and returns to ordinary D2 validation; D81 adds no
checkbox, RadioGroup, modal, or second action. When ADR-0204/D83 applies, an
always-visible permission-safe count immediately follows this group and says
related Pages stay under the source while their private derived addresses are
recalculated; the live website and Navigation do not change. Exact mappings
remain proportional D2 detail. The existing handoff action is the one closure-
level confirmation. Every incompatible or over-capacity closure uses ordinary
D2 cleanup first.

ADR-0205/D84 adds one read-only **Page tree position** row to that same group.
A positively proved tagged boundary shows reviewed **After/Before**, **First**,
**Last**, or **Only Page** meaning; a positively recorded default shows distinct
default **Last** or **Only Page** copy. D80's Top-level choice uses **at top
level**, not **under Home**. Missing/unknown provenance or a stale explicit
boundary uses the existing D2 **Review position** action and commits nothing;
hidden detail uses cause-neutral copy. D84 adds no mandatory selector or
confirmation and says Navigation and the live website do not change.

> **New Page · Private draft**  
> Short-term team application  
> `https://hoperelief.org/serve/short-term-teams`
>
> **About · Stays live; these Page changes leave its draft**  
> `https://hoperelief.org/about`

It SHALL then state:

> The safely transferable saved Page content and the new Page details shown
> above will become the private draft. Anything that cannot transfer safely is
> listed under Review after moving and remains in the exact protected source
> History. Nothing will be published. About stays live; these moved Page-owned
> changes are no longer active there. Separately managed content stays
> unchanged.
>
> If any of these changes still belong on About, go back and separate them
> before moving.

The comparison action is **Compare saved draft with live About**. The primary
action is **Move saved changes to new Page draft** and the secondary action is
**Back to editing**. The action is unavailable while autosave is pending,
source/public/route checks are unresolved, the exact candidate has a live
schedule, a required owner axis is unavailable, or any blocker remains; the
server nevertheless repeats every proof.

Progress is persistent and announced politely:

> Creating the new Page and removing these Page changes from About's active
> draft...

An error names the owner and repair without clearing the form. Source or public
drift says **About changed since this review. Review the latest saved version.
Nothing was moved.** An uncertain result says **Checking whether the changes
were moved...** and resolves the receipt before any further edit or submission.

When the fresh target read/edit and lease check passes, success navigates in the
same tab to the target editor, focuses its heading, and persistently shows:

> **Saved changes moved from About**  
> About stays live. These moved Page changes are no longer active there.
> Separately managed content was not changed. Nothing was published.

The ordinary target header still shows exact Site, tenant-branded domain,
locale, and **Draft - not live**. Secondary actions are **Open About** and,
only with current source-history authority, **View source history**. There is
no one-click **Undo** that deletes the target or silently rewrites either Page;
a later source recovery uses ordinary per-axis **Restore as a new draft** and
leaves the independent target intact. It never reclaims a target-owned path;
restoring an old colliding Placement requires an explicit new D2 source
placement or returns the exact collision.

If the fresh target check fails after commit, the current surface instead
persists **Saved changes moved. The source Page stays live and these moved Page
changes are no longer active there. Nothing was published. You no longer have
access to the new Page.** It exposes no target detail or link and directs staff
only to an existing authorized owner; it does not invent an access request or
undo the committed handoff.

The review reuses PageShell, Base UI, base-maia, and Zinc patterns with native
labels, visible focus, 44-pixel targets, one DOM/reading order, 320-CSS-pixel and
400-percent reflow, forced colors, reduced motion, keyboard and screen-reader
operation, bidi-isolated wrapping URLs, long/CJK/RTL translations, summary-first
weak-network rendering, and result recovery after reconnect. Meaning is never
carried only by color, icon, hover, animation, or toast. Selection alone never
mutates or navigates; progress/status is programmatically announced without
stealing focus. A failed submission moves focus once to the linked error
summary; activating a summary link moves focus to its repairable item.

### Source of truth, authorization, and structural safety

D1 owns the immutable source public generation and its revision pins. D12 owns
source Working Revisions, heads, leases, checkpoints, comparison, and restore.
D2 owns Placement/path claims. ADR-0203/D82 permits D2 to supersede only the
exact eligible sealed Draft-only Path Claim and append a fresh target claimant-
ownership occurrence/version in
the same transaction; the immutable source Placement Revision remains private
History and no public route authority transfers. D23's compiler owns transfer
classification; D80 owns the independent target plan and receipt. D79 owns only
the sparse purpose-continuity assertion. Phase 12 owns actor effects.
ADR-0204/D83 lets D2 establish one completely qualified source-descendant
derived closure in that transaction without changing descendant identity,
direct Placement inputs, History, Navigation, or any other owner fact. It does
not make D81 a hierarchy owner. ADR-0205/D84 lets the same D2 owner consume
positive placement-command provenance, validate one tagged closed target
boundary or resolve a known append-last default against the same final
baseline, and generate the fresh target's position. D81 owns neither the order
representation nor a continuing neighbor relationship.
Retention/privacy, Navigation, Reusable Sections, Media, schedules, search,
providers, and money retain their existing authority. The D80-D84 receipt
coordinates references but becomes authority for none of them.

D81 reuses D79's exact source release-decision effect, the source Editorial
read/edit effect, the exact source Placement edit/supersede effect whenever that
axis differs, target Page create/edit/placement effects, and D12 lease/head
authority already required by D79/D80. Target Placement authority never implies
source Placement authority. It creates no role or bypass. Commit derives actor,
Tenant, environment, Site, locale, source/target identity, public pins, and audit
attribution from trusted server context and rechecks every source and target
owner scope. Source Editorial/Placement history and target resource/version
links perform fresh independent reads.

Browser and Data API roles SHALL have no direct mutation grant for handoff
receipts, checkpoints, active heads, lease generations, target creation,
provenance, repairs, audit, or outbox. Applicable exposed tables use least
grants and ENABLE/FORCE RLS; selects/deletes use `USING`, inserts use `WITH
CHECK`, and mutable head updates use both old-row `USING` and resulting-row
`WITH CHECK`. Append-only records expose no general update/delete. Composite
same-scope foreign keys ensure every head and revision belongs to the exact
Tenant/environment/Site/locale/resource; restrictive deletes and non-null owner
references prevent cascade erasure or orphaned cross-scope state. Equality-
leading indexes cover the actual scoped lookup and policy shapes.

Views, RPCs, security-definer functions, table owners, service/BYPASSRLS roles,
workers, Payload Local API, imports, migrations, support, and repairs repeat the
same source/target authorization, expected-head, lease, scope, and audit proof.
Privileged functions use least-privileged owners, schema-qualified names, an
empty pinned `search_path`, and revoked default execution. Supabase RLS is
defense in depth for exposed Core tables; it is never claimed to constrain a
privileged Payload connection.

Payload may implement private persistence only through an exact-build-qualified
adapter. Actor-scoped Local API calls pass the authenticated principal, shared
transaction request, `overrideAccess: false`, `overrideLock: false`,
`fallbackLocale: false`, explicit draft intent, and depth-zero relationships.
Native duplicate, copy-to-locale, raw restore, and provider **latest** remain
disabled as product commands. The current log-only `afterChange` hook is not
the durable D81 business audit.

### Public, donor, provider, and money boundary

D81/D82 has zero public effect. The source public generation, current/historical
routes, D78 relations, D79 continuity head, Navigation, schedule, search,
sitemap, cache, analytics, and donor result remain byte-for-byte and
semantically unchanged. The target remains private, `no-store`, and `noindex`
until its own later D1 release. Donors and visitors see no transition status,
interstitial, draft, redirect, platform branding, or additional request hop.

D81/D82 sends no Vercel Domains, redirect, deployment, DNS, TLS, project, host,
middleware, CDN, or cache mutation. It creates no Stripe, merchant, bank,
currency, price, gift, recurring schedule, ledger, designation, receipt,
form-submission, email, donor-account, or financial fact. System-cause source
successors and checkpoints are side-effect-dark: they emit no publication,
search, cache, notification, integration, provider, or money work beyond the
durable business audit/outbox required to prove the command itself.

### Rollout and proof boundary

D81 cannot activate before accepted Phase 23 stable Site/locale Page identity,
separate Editorial/Placement revisions, D12 Working Revisions and lease/CAS,
D1 generations and revision pins, D2 route constraints and complete route-
effect provenance, D23 compiler, D79/D80, ADR-0203/D82,
Phase 12 owner effects, durable business audit/outbox, and a qualifying common
PostgreSQL transaction boundary are implemented and proved. D80's D33 Production
Capacity Profile scenario SHALL include the complete D80-D84 transaction,
source checkpoint and clean successors, lease fencing, receipt reconciliation,
and exact Vercel Qualification Attachment evidence across Min, Typical, and
Measured max cohorts. D81 adds no Vercel API cell because it performs no Vercel
operation.

Rollout is additive: add retained revision readers and cause types, source-head
and lease fences, extend the D80 receipt, shadow complete preflight with no
write, prove failpoints and hostile scopes, then enable for one Tenant cohort.
Old writers are fenced from D79 material-purpose publication and from saving
through a retired source lease. Mixed code/schema or unknown manifest versions
fail closed. Rollback disables new handoffs, preserves committed targets,
checkpoints, clean source successors, receipts, and public serving, and never
deletes a target or resurrects the source candidate as active. Roll-forward
uses retained readers and a newly proved exact command.

## Consequences

- Staff get one truthful action: saved Page work becomes one independent private
  target, the source editor becomes clean, nothing public changes, and exact
  recovery remains in History.
- The source has no ordinary publishable duplicate candidate and no new
  transferred-draft status, cleanup workflow, timer, or notification burden.
- “Clean” means append-and-advance from exact public pins. It never means delete,
  overwrite, raw restore, latest-provider read, or compiled-output reconstruction.
- Editorial and Placement remain separate axes. Only changed, sealed source
  axes receive successors; separate owners are not reset.
- The target conserves admitted meaning through D80's compiler but has fresh
  identities and no copied authority. ADR-0203 allows only a fresh target
  claim to succeed the exact sealed Draft-only Path Claim through D2; it does
  not copy a route or source Placement identity.
- Atomicity, lease fencing, expected heads, and receipt reconciliation cost
  implementation and proof, but they prevent the much larger cost of partial
  targets, lost work, duplicate Pages, stale-tab resurrection, or repair sagas.
- Protected checkpoints add bounded storage. Governing retention/privacy rules
  remain authoritative; ordinary provider pruning alone cannot break recovery.
- D81 adds no public resolver, Vercel call, money path, general duplicate,
  semantic merge, cross-Page synchronization, or new staff permission model.

## Rejected alternatives and unsafe interpretations

- keep the transferred candidate as an ordinary publishable source draft;
- add a long-lived non-publishable transferred-draft state and cleanup flow;
- ask every handoff to choose clean versus keep;
- delete, overwrite, relabel, or destructively restore the source candidate;
- call provider **revert to published** outside the Core owner boundary;
- reset from public HTML, cached output, browser state, or provider `latest`;
- fuse Editorial and Placement or reset Navigation/shared/global owner state;
- byte-clone the provider Page or copy IDs, permissions, schedules, public/
  protected routes,
  history, publication, continuity, audit, operational, or money authority;
- create the target and clean the source in different transactions, a saga, or
  an eventually consistent cleanup job;
- permit stale tabs or old lease generations to autosave after success;
- blind retry after an unknown result or idempotency scoped only to one HTTP
  request;
- make source recovery depend on target survival or current target access;
- keep every source body forever without retention/privacy authority;
- add semantic field splitting, automatic merge, cross-Page compare, bespoke
  Undo, modal ceremony, workflow, approval, assignment, or notification;
- claim RLS constrains a bypassing provider connection or service role;
- run Vercel, Stripe, search, cache, notification, or other network effects in
  the transaction; or
- expose D81 on the current Tenant-only Payload Page model.

## Activation boundary

This ADR records accepted target architecture only. D81 remains unavailable
until ADR-0201's full substrate and proof gates plus the source-checkpoint,
clean-successor, lease-fence, exact-replay, failpoint, retention/privacy,
cross-tenant/RLS, privileged-path, accessibility, weak-network, stale-tab,
lost-acknowledgement, and production-capacity tests in the D81 adversarial
review pass. ADR-0203/D82 additionally requires exact Draft-only Path Claim
provenance, canonical-equivalence, atomic claim-succession, restore, and zero-
effect proof. A source candidate with dependent descendant draft paths remains
available only through ADR-0204's exact closure provenance, bounded/resumable
preparation, phantom-safe fencing, exhaustive claim conservation, D33 capacity,
and public-delivery/external-provider zero-effect proof. Every other dependent closure remains
unavailable and uses ordinary D2 cleanup first. No runtime, schema, migration,
Supabase policy, OpenSpec delta, ticket, Vercel configuration, or production
state changes merely because this record is accepted.

Every target additionally requires ADR-0205's positive D2 reviewed-gap or known
append-last provenance, final-topology validation, fresh target order, zero
D84-caused collateral parent/order writes outside the sealed D81/D82/D83
manifest, semantic receipt, and accessible position consequence. Unknown or
stale position provenance uses ordinary D2 review before this transaction is
eligible.

## References

- [ADR-0205 - Reviewed sibling placement with append-last default](./0205-reviewed-sibling-placement-with-append-last-default.md)
- [Phase 24 D84 adversarial review](../prds/sitestacker-parity/phase-24-d84-reviewed-sibling-placement-adversarial-review.md)
- [ADR-0204 - Atomic source-tree draft-path re-derivation](./0204-atomic-source-tree-draft-path-rederivation.md)
- [Phase 24 D83 adversarial review](../prds/sitestacker-parity/phase-24-d83-source-tree-draft-path-rederivation-adversarial-review.md)
- [ADR-0203 - Atomic adoption of exact draft-only Page path claims](./0203-atomic-adoption-of-exact-draft-only-page-path-claims.md)
- [Phase 24 D82 adversarial review](../prds/sitestacker-parity/phase-24-d82-atomic-draft-path-adoption-adversarial-review.md)
- [ADR-0201 - Material Page-purpose changes create independent Pages](./0201-material-purpose-changes-create-independent-pages.md)
- [ADR-0200 - Stable Page identity with purpose-continuity versions](./0200-stable-page-identity-with-purpose-continuity-versions.md)
- [ADR-0199 - Owner-qualified exact ordinary Page succession](./0199-owner-qualified-exact-ordinary-page-succession.md)
- [Phase 24 D81 adversarial review](../prds/sitestacker-parity/phase-24-d81-atomic-material-page-handoff-adversarial-review.md)
- [Proposed ADR-0156 - Working Revisions and active editor](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [Proposed ADR-0167 - Exact Site-owned content and Copy-to-Site drafts](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0167-exact-site-owned-ordinary-content-with-independent-copy-to-site-drafts.md)
- [Proposed ADR-0177 - Provider-neutral Production Capacity Profile](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0177-provider-neutral-production-capacity-profile-and-vercel-qualification.md)
- [Proposed ADR-0145 - Page-local composition and Public Site Generations](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [Proposed ADR-0146 - Staged hierarchical public paths](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0146-staged-hierarchical-public-paths-under-coherent-site-generations.md)
- [Payload Drafts](https://payloadcms.com/docs/versions/drafts)
- [Payload Versions](https://payloadcms.com/docs/versions/overview)
- [Payload transactions](https://payloadcms.com/docs/database/transactions)
- [Payload Local API access control](https://payloadcms.com/docs/local-api/access-control)
- [Sanity Content Releases](https://www.sanity.io/docs/studio/content-releases)
- [Contentful versioning](https://www.contentful.com/help/faq/versioning/)
- [WordPress.com Page revisions](https://wordpress.com/support/page-post-revisions/)
- [PostgreSQL transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html)
- [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase database functions](https://supabase.com/docs/guides/database/functions)
- [WCAG 2.2 error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)
- [WCAG 2.2 on input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html)
- [WCAG 2.2 status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
