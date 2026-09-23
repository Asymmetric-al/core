# Phase 24 D7 — Site Serving and Giving Admission Adversarial Review

> **Status:** Completed `/grill-with-docs` decision evidence for D7. This is not
> a Phase 24 PRD, OpenSpec change, implementation plan, migration authorization,
> or ticket specification.
>
> **Founder choice:** Option 1 — separate website and Giving controls.
>
> **Review date:** 2026-08-26
>
> **Later D12 clarification:** Site Serving Suspension never intercepts the
> fixed-Asym admitted-operation provider-handoff/result routes. Any legacy Site-
> qualified result/return path requires an admitted-operation-only carve-out
> ahead of the Site gate or the D12 migration/expiry fence before website-
> offline activation for that scope.

## Final disposition

**Accept with required amendments.**

The two-control direction is correct. The original wording was not safe or
precise enough to implement because it did not define exact scope, in-flight
gift behavior, authoritative state, cache containment, authorization, recovery,
or proof. The corrected decision below replaces the draft D7 wording.

In plain language:

- staff can take one Site's public website offline without touching Giving;
- staff can stop new public gift checkouts from starting on one Site without
  taking the website offline;
- a gift checkout that was already admitted may still finish;
- existing recurring gifts are not changed by either Site control, but their
  own payment and safety controls still apply; and
- restoring either capability is a new, proved action, never a blind toggle.

## Evidence labels

- **Repository fact** — accepted ADR, OpenSpec requirement, PRD, or glossary on
  `develop`.
- **Current behavior** — code or schema present on `develop`; this is evidence
  of what runs today, not proof that the design is correct or permanent.
- **Proposed evidence** — open, unmerged Phase 22/23 work. It may inform Phase
  24 but is not governing authority.
- **External fact** — current primary product or technical documentation.
- **Product judgment** — a deliberate recommendation based on the evidence.
- **Assumption** — a claim that still requires real user or production proof.

## Corrected D7 decision — normative language

The following clauses are the exact D7 decision that must flow into the Phase
24 PRD and later OpenSpec requirements.

### D7-R1 — Two independent controls

Phase 24 SHALL provide two independent, consequence-labelled actions for one
exact Tenant, environment, and Site:

1. **Take website offline** controls public Site serving.
2. **Pause new gifts from this Site** controls admission of new public gift
   checkouts attributed to that Site.

Neither action changes the other. A combined UI workflow MAY request both
actions, but it remains orchestration over two authorities, commands, policy
heads, receipts, and recovery gates. No master `Site active` Boolean exists.

### D7-R2 — Website-offline scope and effect

**Take website offline** applies to all admitted hosts, aliases, locales, and
Site-owned public HTML, RSC/data, navigation, search, sitemap/feed, form,
OG/share, redirect, and Site-qualified media routes for the exact Site and
environment. It replaces public Site content at the trusted serving boundary
with the isolated temporary-unavailable response while preserving Site
identity, configuration, domains, immutable public generations, publication
history, drafts, and staff access.

It does not change Giving admission, existing or new recurring-gift policy,
Donor Portal availability, provider configuration, sibling Sites, messages,
Legal Entity, Settlement Account Binding, Stripe, settlement, bank, or
accounting identity. A separately admitted, content-independent Giving route
may remain reachable only when its own current safety and readiness proof is
valid.

As later clarified by D12, the checkout/payment-owned admitted-operation
provider-handoff and result-reader routes are independently addressed on the
qualified fixed Asym origin and remain reachable for already-admitted work
while Site content is offline. They expose no Site content and have zero new-
admission authority. A legacy Site-qualified result/return route must use an
exact admitted-operation-only carve-out evaluated before Site suspension or
remain behind D12's source-proved migration/old-return-expiry fence.

### D7-R3 — Site public-Giving scope and effect

**Pause new gifts from this Site** has launch scope
`Tenant × environment × Site × entry_method=public_checkout`. It blocks the
authoritative admission of new one-time gift groups and new recurring-commitment
enrolment through every Core-controlled public checkout, embedded form, API
handoff, hosted link, and QR/link route that carries that exact Site context.

The Site supplies presentation and attribution context only. The Giving domain
still resolves and freezes the exact Designation, Legal Entity, Settlement
Account Binding, processor account, environment, currency, rail, and payment
authority. The Site does not own or select any of them.

Sibling Sites, authenticated Donor Portal giving, staff/offline entry, imports,
and APIs without that public-Site entry context remain unchanged unless their
own authority is separately contained. If the product later wants a
Tenant-wide or Legal-Entity-wide Giving pause, Phase 13 must define it as a
separate control; Phase 24 must not widen this Site action silently.

### D7-R4 — Strictest owner wins

Containment uses the smallest **proven causal owner scope**, not always the
smallest visual Site scope. Existing public-safety owners may contain an exact
host, locale, route, Page, asset, or Site. Giving/payment owners may contain a
Designation, Legal Entity, Settlement Account Binding, processor account,
environment, currency, rail, recurring cohort, or command class and may
therefore affect several Sites.

All source-owned blockers compose strictest-wins. A Site action can add or
supersede only its own Site policy and can never clear, bypass, or claim success
over another owner's current hold.

### D7-R5 — Durable admission fence

The Giving-pause command establishes a monotonic committed admission revision
and effective instant. Public gift admission and the pause command MUST
serialize through the same authoritative policy head so there is one durable
ordering:

- an operation whose admission transaction wins before the pause commit freezes
  that admitted revision and may finish and reconcile; and
- an operation that has not been admitted when the pause wins returns the stable
  `giving_unavailable` domain result and creates no donation, recurring
  commitment, PaymentIntent, SetupIntent, Checkout Session, subscription, or
  other provider-side financial state.

The authoritative check occurs server-side before durable gift intent or
provider state is created. A browser flag, hidden button, cached page, URL
parameter, provider metadata value, or client-supplied Site/tenant/actor value
is never admission authority.

### D7-R6 — In-flight and recurring behavior

A checkout admitted before the pause may still finish, fail, time out, or
become provider-unknown under its frozen admission revision. The Site control
does not blindly cancel or refund it. A security/payment owner may cancel only
work proved cancelable and not submitted; indeterminate work is quarantined and
reconciled.

This Site control does not pause, cancel, amend, restart, or claim to stop
existing recurring commitments. Their scheduled execution, authorized
recovery, reconciliation, receipts, donor cancellation, reduction, and payment
method servicing remain owned by Phase 16 and continue only while their own
current authorization, provider-control, safety, and lifecycle gates allow.

The required staff and public wording is:

> This control does not pause or cancel existing recurring gifts. Their normal
> provider and processing status still applies.

### D7-R7 — Alternatives and fallbacks

An alternate public Giving route may be shown only when it is separately
labelled, independently current and safe, outside the contained scope, and
truthful about its attribution and financial owner. It must not inherit,
substitute, or guess a Designation, amount, cadence, Site, locale, currency,
Legal Entity, or Settlement Account Binding. Missing or unknown proof yields
**Giving unavailable**, never a fallback fund, platform Stripe account,
adjacent Site, or support-made routing guess.

### D7-R8 — Authoritative state and derived status

Asym Postgres owns two separate append-only policy-version streams and
compare-and-set current heads: one for Site serving and one for Site public-Gift
admission. CMS owns public content and immutable publication state; Giving owns
financial admission and execution; Vercel, Stripe, caches, probes, and UI
labels are executors or evidence, never write authority.

`cms.tenants.isActive`, a future `sites.is_active`, provider state, a deployment
URL, cache state, and a UI toggle MUST NOT become D7 authority. Site lifecycle
and retirement, desired serving policy, desired Giving-admission policy,
source-owned holds, command outcome, and externally observed effect remain
separate facts.

The UI derives simple labels from those facts:

- **Online / Taking offline / Offline / Needs attention** for serving; and
- **Accepting new gifts / Pausing / Paused / Needs attention** for Site public
  Giving.

Internally, `partial`, `failed`, and `unknown` observations remain explicit;
they must never be projected as a favorable completed state.

### D7-R9 — Authorization

Website containment, website recovery, Giving containment, and Giving recovery
are independently grantable capabilities resolved through the Phase 12 Policy
Decision Point. Every command derives and revalidates the current active
assignment and exact Tenant, environment, Site, action, and purpose on the
server. Caller-provided role, tenant, Site, environment, actor, owner, approval,
or override fields are ignored or rejected.

One currently authorized person may contain quickly after a clear consequence
review and required reason; no universal second approver delays containment.
Recovery requires a fresh privileged action, current session assurance or
step-up, and fresh proof. A tenant may apply a prospective quorum-aware review
policy, but one-admin tenants degrade to single-actor with loud immutable audit
rather than an unsafe deadlock. Impersonation and support access confer no
ambient containment or recovery power.

### D7-R10 — Durable command and audit record

Every command records, without secrets or raw provider payloads: command ID,
semantic idempotency key, actor and on-behalf-of identity, active assignment,
capability and assurance level, exact scope, action, required reason category,
optional note, predecessor/current policy version, expected and committed
revision, effective instant, evidence references, correlation/incident ID,
impact summary, command outcome, and latest observed result.

Technical logs and traces are not the business audit. Audit history is
append-only and retained under the owning audit/retention contract. Public
incident copy never exposes internal IDs, exploit detail, sensitive missionary
information, secrets, or provider errors.

### D7-R11 — Database, RLS, and mutation invariants

The physical design may follow repository naming conventions, but it MUST make
these invariants structural:

- all Tenant, environment, Site, policy kind, revision, disposition, effective
  instant, actor class, command ID, and idempotency-key fields needed to prove
  authority are non-null; predecessor is null only on the single genesis
  version and is required thereafter;
- same-scope composite foreign keys prevent a policy version, head, receipt, or
  observation from linking across Tenant, environment, Site, or policy kind;
- each scope and policy kind has exactly one current head; revisions are
  positive and monotonic; predecessor/successor history is immutable;
- policy versions, receipts, and business observations cannot be updated or
  deleted; current heads advance only by compare-and-set;
- `ON DELETE RESTRICT` preserves referenced Site and policy history; Site
  retirement is a successor lifecycle fact, not cascade deletion;
- no money amount, currency balance, Stripe secret, bank identity, settlement
  identity, or accounting identity is stored on these Site-control records;
- foreign keys and the equality-leading scope used by reads, RLS, and CAS have
  supporting composite indexes; timestamps use `timestamptz`;
- Data API grants are revoked for direct mutation; operational tables use
  `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY` where the runtime
  role is subject to RLS;
- `SELECT`/`DELETE` policies use `USING`, `INSERT` uses `WITH CHECK`, and
  `UPDATE` uses both so an allowed update cannot move a head or record into
  another scope; scope columns are immutable, and append-only versions,
  receipts, and audit expose no direct `UPDATE`/`DELETE` grant or policy; and
- any privileged or service-role path goes through the one server command and
  repeats exact-scope constraints. If a `SECURITY DEFINER` helper is used, its
  owner is least-privileged, names are schema-qualified, `search_path` is pinned
  to empty, and caller-controlled actor or scope is rejected.

No external network call occurs while a database transaction holds policy or
admission locks. The transaction commits desired state plus durable outbox work;
provider/cache convergence is reconciled afterward.

### D7-R12 — Cache, edge, and observed containment

Website suspension is enforced before public content-cache selection. A cache
purge, DNS change, domain removal, framework revalidation, or provider dashboard
state is never the only enforcement layer. The command advances the serving
revision, invalidates/deletes every exact Site/host/locale cache cohort as
appropriate, writes durable reconciliation work, and probes every admitted
host plus representative locale, HTML/RSC/data, sitemap, form, OG, and media
routes.

The UI remains **Taking offline** until observation proves the adverse response.
Any stale success, missed alias, unexpected provider hostname, or unverified
egress is **Needs attention / partial**, never **Offline**. A predefined
provider/WAF quarantine is the break-glass path if the application or normal
serving control plane is compromised; project-wide provider suspension is used
only after an impact graph proves every co-hosted Site is intended.

### D7-R13 — Public response and failure posture

A known, temporarily offline Site returns a small platform-owned, safely
localized `503 Service Unavailable` response with `Cache-Control: no-store`, an
honest `Retry-After` only when known, last safely publishable organization
identity/contact information when still permitted, a localized timestamp, and
the next update path. It has no tenant-authored scripts, personalization, or
nonessential external dependencies. It preserves `robots.txt` and does not
pretend the Site was deleted by returning `404`, `403`, or `410`, or by adding
`noindex`.

Browser-facing caching remains `no-store`. A platform-targeted edge cache MAY
briefly cache only the identical isolated static response, never Site content,
when that behavior is separately proved not to delay recovery or leak scope.

Unknown, transferred, tombstoned, or privacy-ineligible hosts and resources
retain the Phase 5/10 privacy-safe not-found behavior. Planned prolonged closure
and retirement are separate workflows with their own search and redirect
policy; this emergency/temporary control must not quietly become either.

### D7-R14 — Recovery

Recovery is a new privileged successor command, never the inverse mutation of
an old event and never automatic merely because an incident timer elapsed.

Website recovery re-proves the complete D6 core-public manifest, current host
inventory/admission, the exact currently appointed immutable Public Site
Generation (or an explicitly appointed successor), public-safety floor,
expected serving head, cache/control-plane integrity, current actor authority,
and external route probes. Unchanged safe content need not be rebuilt or
republished; the recovery creates a successor **serving-policy** version.

Giving recovery independently re-proves current Site context, public entry
inventory, Designation eligibility, Legal Entity, Settlement Account Binding,
processor capability/account/environment, currency/rail, admission behavior,
and current actor authority, then creates a successor **Giving-admission**
policy version. Each command compare-and-swaps only its own head, clears only
its own predecessor disposition, and leaves every other owner hold effective.

A relevant deployment, domain, configuration, generation, provider-capability,
security, or policy change invalidates prior recovery proof. The result enters
a monitored window before incident resolution; monitoring is evidence, not
authority to auto-revert.

### D7-R15 — Messages and history

These actions do not rewrite or delete prepared or historical messages,
contributions, receipts, accounting records, or audit history. Their owning
service still rechecks current purpose, consent, safety, destination, and
public-link eligibility before dispatch and may suppress future dispatch.
Already dispatched messages are not recalled; their links resolve under the
current serving and Giving policy.

### D7-R16 — Staff and public UX

The two actions live together in **Site settings → Availability** as two
independent status cards, not switches and not one undifferentiated danger
zone. Each card shows the current state, exact Site/environment/scope, visitor
or donor impact, last verified time, actor, and one safe next action.

Each action uses a focused confirmation dialog with the least-destructive
choice initially focused, the exact consequence in the title/body, a required
reason category, an optional note unless `Other` or a security reason requires
detail, duplicate-submit prevention, and a persistent receipt/result. No typed
Site-name ritual is required. Success is never toast-only.

The flow supports keyboard operation, visible focus, Escape/cancel, focus
restoration, programmatic names/states, 320 CSS-pixel reflow, zoom, forced
colors, reduced motion, non-color status, at least 24×24 CSS-pixel targets with
approximately 44 pixels preferred for these critical actions, `role=status`
for non-interruptive progress, and an alert for failure. The public unavailable
page and Giving notice are mobile-first, low-bandwidth, and use the Site's safe
locale contract with a platform fallback.

### D7-R17 — Required user-facing consequence copy

Website confirmation:

> **Take {Site name} offline?**
>
> Visitors on {host count} public domain(s) will see a temporary unavailable
> page. Your content, domains, drafts, and history stay saved. This does not
> pause new gifts from this Site or cancel existing recurring gifts.

Giving confirmation:

> **Pause new gifts from {Site name}?**
>
> New public gift checkouts from this Site will not start. The website stays
> online. A checkout already underway may still finish. This control does not
> pause or cancel existing recurring gifts; their normal provider and
> processing status still applies.

Website public response:

> **This website is temporarily unavailable**
>
> We're working to restore access. Last updated: {localized timestamp}.
> {Safe contact or status link when available.}

Site public-Giving response:

> **New online gifts are temporarily unavailable here**
>
> This does not pause or cancel existing recurring gifts. Please try again
> after {truthful time or next-update wording}. {Independently verified
> alternative, if one exists.}

### D7-R18 — Quantitative release and monitoring contract

Giving admission has a zero-tolerance invariant: after the committed pause
revision, the count of newly admitted operations for that exact scope is zero.
Pre-admitted operations are counted separately and never misclassified.

For website serving, the initial production safety budget is:

- p99 external probe convergence within 5 seconds of the durable command;
- no inventoried admitted host or required route cohort serving Site content
  after 30 seconds; and
- no favorable **Offline** UI claim before all required probes pass.

These are Core release budgets, not Vercel promises. They must be proved under
production-shaped multi-region and failure testing. A miss marks the command
partial, pages the owning on-call, and invokes the predefined quarantine path;
it is not rounded into success.

### D7-R19 — Implementation prerequisites and cutover

D7 implementation has hard prerequisites on Phase 5 Site-aware host/public-read
and cache enforcement, Phase 10 public-safety composition, Phase 12 capability
and Tenant enforcement, Phase 13 authoritative gift admission and Settlement
Account Binding, Phase 16 recurring execution/control, and Phase 23 immutable
Public Site Generation and serving-head contracts. Open PRs #1323 and #1340 are
proposed dependencies, not implementation proof, until their conflicts are
resolved and their contracts land or are explicitly superseded.

Cutover order is: census → additive clean schema → deterministic explicit
backfill → constraint/RLS/totals proof → deploy all adverse-state readers →
production-shaped shadow/probe proof → one-authority enablement → legacy-reader
retirement. Current `isActive`, tenant-only routing, legacy pledge state,
tenant-stored Stripe keys, platform-key fallback, and missing `site_id` are not
grandfathered as authority. Ambiguous historical rows quarantine rather than
default. Rollback after a control version exists is forward recovery through a
successor version, never deletion or historical rewrite.

## Best UX/UI path

The permanent staff experience stays deliberately small:

```text
Site settings
└── Availability
    ├── Website: Online
    │   ├── What visitors can access
    │   └── [Take website offline]
    └── New gifts from this Site: Accepting
        ├── What donors can start
        └── [Pause new gifts]
```

After either command, the page keeps both cards visible so staff can immediately
see what did and did not change. The result card shows **Applying** until proof
finishes, then **Offline/Paused** or **Needs attention** with one next action.
This avoids the two worst UX errors: a master switch that causes hidden damage,
and a green toast that claims success before the public effect is observed.

Do not use a toggle. Toggle conventions imply an immediate, low-risk setting;
these actions need consequence review and independently observed completion.
Do not require typing the Site name. The action is reversible through a proved
successor and the extra ritual adds friction without improving scope proof.

For donors, remove the unusable form rather than leaving a disabled Donate
button with no explanation. Preserve recurring-gift servicing and receipts only
through independently safe routes. Never advertise an alternate payment route
merely to avoid an empty state.

## Full adversarial category review

Every requested category is evaluated independently. “Changes D7” means the
core two-control choice survives but the original wording is narrowed or made
normative.

### 1. Problem validity, necessity, and alternatives

**Material concern exists in the draft wording; no material concern invalidates
the root problem.**

| What could go wrong and why it matters                                                                                                                                                                                        | Severity / likelihood | Evidence                                                                                                                                                                                                                                                                                                                             | Effect on D7                                                 | Permanent correction and exact language                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| “Pause new online gifts” can be read as Site-only, Tenant-wide, or every digital entry method. Two teams could implement incompatible behavior and staff could believe revenue is stopped when an API or portal remains open. | Critical / High       | **Repository fact:** Entry Method is an independent gift axis in `CONTEXT.md`; D1 says Site is presentation/attribution only. **External fact:** Givebutter separates campaign visibility from stopping campaign payments and warns that attached auction behavior is separate.                                                      | Narrows the second action; does not invalidate two controls. | Apply **D7-R3** and label the launch action **Pause new gifts from this Site**.                          |
| A single master switch is simpler at first glance but crosses CMS, Giving, recurring, provider, and communication owners. Support-only containment is too slow and provider-level controls are too broad.                     | Critical / High       | **Repository fact:** `openspec/specs/platform-boundaries/spec.md` separates CMS public truth from CRM/Giving truth; ADR-0044 separates Site context from legal/financial identity. **External fact:** Shopify exposes separate storefront-access and checkout-pause concepts; Givebutter separates unlisting and payment acceptance. | Confirms Option 1.                                           | Apply **D7-R1**. A future guided “do both” flow may orchestrate the two commands but never replace them. |

**Strongest alternative:** one guided **Emergency containment** flow that previews
and requests both independent actions. It is useful only if later evidence shows
staff routinely need both. Building it now would add orchestration and partial-
success UX before the two foundations exist, so the permanent launch path is the
two cards on one Availability page.

### 2. Brittleness

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                                          | Severity / likelihood | Evidence                                                                                                                                                                                                                                                                 | Effect on D7                                                | Permanent correction and exact language                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Hiding a button, changing DNS, removing one domain, or purging one cache works only on the happy path. Aliases, provider URLs, RSC/data, OG images, embeds, and stale caches can remain public. | Critical / High       | **Current behavior:** public reads cache for 60 seconds in `packages/lib/cms/public-page.ts` and `apps/donor/lib/cms/client.ts`; Site is not yet populated in `PublicRequestContext`. **External fact:** Vercel invalidation can serve stale content while revalidating. | Changes D7 from a UI setting to proved serving containment. | Apply **D7-R2** and **D7-R12**. Offline is an observed result across an enumerated egress set, not a domain mutation. |
| A browser-side Giving gate is bypassable by old tabs, direct endpoints, embedded forms, QR codes, or replay.                                                                                    | Critical / High       | **Current behavior:** `/api/donate` has no Site/admission fence and returns a PaymentIntent client secret that the browser confirms later.                                                                                                                               | Changes D7.                                                 | Apply **D7-R3** and **D7-R5**; enforce at the authoritative server admission boundary.                                |

### 3. Technical debt

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                    | Severity / likelihood | Evidence                                                                                                                                                                                                                                      | Effect on D7                                                   | Permanent correction and exact language                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Reusing `cms.tenants.isActive` or adding `sites.is_active` creates a god Boolean whose meaning grows every phase and whose history is lost.               | High / High           | **Current behavior:** Payload Tenant has one non-versioned `isActive` checkbox. **Repository fact:** D1/D6 separate Site, Giving, and public activation.                                                                                      | Changes the data model.                                        | Apply **D7-R8** and **D7-R11**: two append-only policy streams and CAS heads; lifecycle/retirement remain separate. |
| Extending tenant-stored Stripe keys or platform fallback would make a Site pause accidentally account-selecting and preserve a known transitional hazard. | Critical / High       | **Current behavior:** `packages/api/src/stripe/tenant-client.ts` reads tenant secret keys and can fall back to environment keys. **Repository fact:** ADR-0044 requires explicit Legal Entity and effective-dated Settlement Account Binding. | Blocks reuse of current Stripe resolution as permanent design. | Apply **D7-R3** and **D7-R19**. The Site action never selects or mutates provider identity.                         |

### 4. Edge cases

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                            | Severity / likelihood | Evidence                                                                                                                                                                                                      | Effect on D7                              | Permanent correction and exact language                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| A donor opened checkout before the pause, received a client secret, and confirms after the pause. Calling that a post-pause admission or claiming it was canceled would be false. | Critical / High       | **Current behavior:** `checkout-client.tsx` confirms Stripe after `/api/donate` returns. **External fact:** Stripe client secrets can complete a PaymentIntent; cancellation is state-dependent and can fail. | Narrows the promise.                      | Apply **D7-R5**, **D7-R6**, and the exact copy in **D7-R17**. Linearize admission, not final settlement.                       |
| One alias or locale is missed; a transferred/unknown host returns the same message as an administratively paused known Site; a long closure is treated as a temporary incident.   | High / Medium-High    | **Repository fact:** Phase 5 requires unknown hosts to fail closed. **External fact:** Google distinguishes temporary 503 outages from longer closure and crawl policy.                                       | Changes response and lifecycle semantics. | Apply **D7-R12** and **D7-R13**. Keep known temporary 503, privacy-safe not-found, retirement, and prolonged closure distinct. |
| Giving is paused while the website is offline, or only one is paused; an alternate route is safe for one control but unsafe for the other.                                        | High / High           | **Product judgment:** these are four valid combinations, each with different copy.                                                                                                                            | Clarifies D7.                             | Apply **D7-R1**, **D7-R7**, and show both status cards after every action.                                                     |

### 5. Footguns

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                  | Severity / likelihood | Evidence                                                                                                                                                    | Effect on D7              | Permanent correction and exact language                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A toggle or one ambiguous “Deactivate Site” action can remove public access, cut off gifts, or imply recurring cancellation without consequence review. | Critical / High       | **External fact:** Carbon advises against toggles when confirmation is required; WCAG 3.3.4 requires error prevention for important financial/data actions. | Changes UI shape.         | Apply **D7-R16** and **D7-R17**: action buttons, exact confirmation, reason, persistent result; no master switch.                                            |
| A support operator, stale tab, retry, or duplicate click repeats or broadens a command.                                                                 | High / Medium         | **Repository fact:** Phase 12 rejects ambient operator authority. **External fact:** Stripe recommends idempotent, webhook-reconciled effects.              | Changes command contract. | Apply **D7-R5**, **D7-R9**, and **D7-R10**. Same idempotency key/same semantic command returns the original receipt; same key/different payload is rejected. |

### 6. Tenant safety

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                | Severity / likelihood  | Evidence                                                                                                                                                                                                                         | Effect on D7                           | Permanent correction and exact language                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Caller-controlled Tenant/Site IDs, cache keys without Site scope, provider metadata, or a service-role query can pause, resume, serve, or admit for the wrong tenant. | Critical / Medium-High | **Repository fact:** ADR-0028 requires a typed tenant/Site public choke point; Phase 12 requires structural Tenant scope. **Current behavior:** Site remains null and legacy recurring webhook lookup may fall back to metadata. | Adds release-blocking isolation rules. | Apply **D7-R9**, **D7-R11**, and the tenant-poison tests in the proof section.                         |
| Project-wide Vercel suspension or provider-account changes can affect sibling tenants/Sites sharing infrastructure.                                                   | Critical / Medium      | **External fact:** Vercel project pause is project-wide.                                                                                                                                                                         | Narrows break-glass use.               | Apply **D7-R12**. Provider-wide action requires an impact graph; ordinary control is exact Site scope. |

### 7. Database, RLS, and authorization safety

**Material concern exists and is release-blocking.**

| What could go wrong and why it matters                                                                                                                                   | Severity / likelihood  | Evidence                                                                                                                                                                                                                                                                   | Effect on D7                        | Permanent correction and exact language                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| An allowed head update can replace Tenant/Site scope, or a policy using only `USING` can move a row into a forbidden state. A service-role path can bypass RLS entirely. | Critical / Medium-High | **Current behavior:** the legacy schema disables RLS on most core money tables. **Repository fact:** Phase 9/12 require composite Tenant keys and one authorization source. **External fact:** Supabase requires RLS/`FORCE RLS`, indexed predicates, and least privilege. | Adds mandatory structural controls. | Apply every bullet of **D7-R11**; test `USING`, `WITH CHECK`, direct grants, function ownership/search path, and privileged poison IDs.    |
| Two concurrent pause/recovery or gift/pause transactions can produce two heads or admit after the fence.                                                                 | Critical / Medium-High | **Repository fact:** accepted publication/provider ADRs require CAS and fencing. **Postgres fact:** check-then-write is race-prone.                                                                                                                                        | Changes lifecycle and schema.       | Apply **D7-R5** and **D7-R11**: unique current head, short transaction, monotonic revision, same-head serialization, semantic idempotency. |
| Cascading delete or nullable scope can erase history or create orphaned unscoped policy.                                                                                 | Critical / Low-Medium  | **Product judgment** grounded in the repository's immutable financial/publication pattern.                                                                                                                                                                                 | Adds constraints.                   | Apply **D7-R11**: required scope, same-scope FKs, `ON DELETE RESTRICT`, append-only history.                                               |

Money precision is not applicable to these control records because **D7-R11
forbids money columns here**. Currency and amount checks remain in the Giving
domain.

### 8. Overengineering

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                                                                                | Severity / likelihood | Evidence                                                                                                                                                                                                       | Effect on D7                | Permanent correction and exact language                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A generic kill-switch DSL, stored seven-state workflow, cross-domain atomic transaction, per-route staff controls, auto-resume scheduler, or custom incident platform would be difficult to reason about and duplicate owner domains. | High / Medium-High    | **Repository fact:** accepted ADRs favor closed purpose-owned state and reject generic workflow engines/fallback DSLs. **Product judgment:** launch needs two actions and derived observation, not a platform. | Narrows implementation.     | Apply **D7-R1**, **D7-R4**, **D7-R8**, and **D7-R14**. Store two policy heads and evidence; derive simple labels; reuse Phase 10/13/16 owner controls.                        |
| Rebuilding or republishing unchanged content on every recovery adds friction and couples serving policy to content generation.                                                                                                        | Medium / High         | **Repository fact:** immutable generations and serving appointment are distinct proposed Phase 23 concepts.                                                                                                    | Changes the original draft. | Apply **D7-R14**: re-prove the appointed generation and create a new serving-policy version; publish a successor generation only when content itself changed or failed proof. |

### 9. UX/UI and user friction

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                           | Severity / likelihood | Evidence                                                                                                                                                                                       | Effect on D7                    | Permanent correction and exact language                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Staff cannot predict whether donors, the site, recurring gifts, sibling Sites, or the portal will be affected. A toast disappears before they can verify the result.             | High / High           | **External fact:** comparable giving/CMS tools separate form/site availability; W3C requires programmatic status messages. **Product judgment:** impact clarity is the main trust requirement. | Changes the interaction design. | Apply **D7-R16** and exact copy in **D7-R17**. Keep both cards visible and result persistent.                                              |
| Disabled Donate controls, ambiguous “maintenance,” missing local language, inaccessible dialogs, or large scripts increase donor abandonment and exclude mobile/assistive users. | High / High           | **External fact:** WCAG 2.2 reflow, target, dialog, focus, and status-message guidance; Blackbaud closes forms with a supporter-facing message instead of deleting them.                       | Adds acceptance criteria.       | Apply **D7-R13**, **D7-R16**, and the accessibility tests below. Remove the unusable form and show a concise localized reason/next update. |
| Mandatory typed-name confirmation or two-person approval for every pause burdens tiny ministries and encourages bypass.                                                          | Medium / High         | **Repository fact:** Phase 12 is quorum-aware and avoids generic second approval.                                                                                                              | Simplifies UX.                  | Apply **D7-R9** and **D7-R16**: one authorized actor, focused confirmation, recent assurance, reason; no typed-name ritual.                |

### 10. Source of truth, ownership, and domain invariants

**Material concern exists and is architectural.**

| What could go wrong and why it matters                                                                                                        | Severity / likelihood | Evidence                                                                                                                                                         | Effect on D7               | Permanent correction and exact language                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Payload, Site settings, Stripe, Vercel, cache, and probes can each appear to own “active,” creating dual writes and circular synchronization. | Critical / High       | **Repository fact:** OpenSpec makes CMS public truth and CRM/Giving operational truth distinct; ADR-0001 keeps authoritative operational truth in Asym Postgres. | Changes authority model.   | Apply **D7-R8**. Site serving policy and Giving admission policy are authoritative local facts; CMS/provider/edge states are consumed truth or evidence. |
| Site could become a shadow payment owner by storing an account/binding or choosing a fallback.                                                | Critical / High       | **Repository fact:** ADR-0044 and D1 prohibit it.                                                                                                                | Reinforces and narrows D7. | Apply **D7-R3**, **D7-R7**, and the no-money columns rule in **D7-R11**.                                                                                 |

Permanent invariants are: one Site belongs to one Tenant; one policy head exists
per exact scope/kind; policy history is append-only; no Site control changes
financial identity; no favorable state is inferred from provider success; no
owner clears another owner's hold; pre-admitted and post-fence gifts are never
reclassified; retirement never deletes control history.

### 11. Hidden coupling

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                | Severity / likelihood | Evidence                                                                                                                                                                                    | Effect on D7                                                      | Permanent correction and exact language                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Public website and checkout currently live in the donor app, so a deployment-, route-, or project-level switch may couple otherwise independent product capabilities. | High / High           | **Current behavior:** donor public CMS and checkout share application/runtime surfaces. **Repository fact:** platform boundaries are product ownership boundaries even inside one monorepo. | Requires logical choke points independent of deployment topology. | Apply **D7-R2**, **D7-R3**, and **D7-R12**. Co-location cannot redefine scope.                                     |
| “Website offline” could silently suppress prepared communication or “Giving paused” could modify recurring recovery because they share links/provider objects.        | High / Medium         | **Repository fact:** Phase 16 and communications own their lifecycles.                                                                                                                      | Narrows non-effects.                                              | Apply **D7-R6** and **D7-R15**. Link resolution uses current policy; records and owner lifecycles remain separate. |

### 12. Failure modes

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                            | Severity / likelihood  | Evidence                                                                                                                                                  | Effect on D7                                     | Permanent correction and exact language                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| The policy commit succeeds but the client loses the response, an edge misses the change, or one probe fails. Retrying can duplicate commands or the UI can claim a false success. | Critical / Medium-High | **External fact:** distributed cache and webhook/provider work is asynchronous and may duplicate or reorder.                                              | Adds truthful intermediate results and recovery. | Apply **D7-R10**, **D7-R12**, and **D7-R18**. Retry returns the receipt; partial remains visible and pages the owner. |
| The outage page itself depends on CMS, tenant JavaScript, fonts, analytics, or a compromised origin and fails during the incident.                                                | High / Medium          | **Product judgment** consistent with incident-response isolation.                                                                                         | Changes public fallback.                         | Apply **D7-R13**: small platform-owned static response with only safe snapshot data and no nonessential dependency.   |
| Stripe times out after a request may have succeeded; cancellation or refund is guessed.                                                                                           | Critical / Medium      | **Repository fact:** ADR-0015 requires outcome-unknown quarantine/reconciliation. **External fact:** Stripe events may arrive out of order and duplicate. | Narrows Site authority.                          | Apply **D7-R6** and **D7-R14**. Inspect/reconcile under the payment owner; never claim stopped or blindly compensate. |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists and is release-blocking.**

| What could go wrong and why it matters                                                                                                                                 | Severity / likelihood  | Evidence                                                                                                | Effect on D7                        | Permanent correction and exact language                                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Pause races with admission, recovery, domain transfer, publication, retirement, role revocation, or a second command; late work can resurrect a stale favorable state. | Critical / Medium-High | **Repository fact:** publication and provider ADRs require expected-head CAS, fencing, and fresh proof. | Changes state transitions.          | Apply **D7-R5**, **D7-R8**, and **D7-R14**. One CAS winner; stale expected revision fails; foreign holds remain.                                                                     |
| A scheduled auto-resume uses old evidence after configuration, policy, provider, or security state changed.                                                            | Critical / Medium      | **Product judgment** supported by NIST recovery guidance.                                               | Rejects automatic inverse behavior. | Apply **D7-R14**. No automatic resume in D7; fresh successor command and evidence only.                                                                                              |
| Idempotency is tied only to HTTP delivery, so a retry after an epoch change creates a second business effect.                                                          | Critical / Medium      | **Repository fact:** accepted money/publication contracts require durable semantic idempotency.         | Changes API requirements.           | Apply **D7-R5** and **D7-R10**. Idempotency binds actor, exact scope, action, intended predecessor/revision, and business effect; replay returns the original outcome across epochs. |

Valid transitions are `serving → suspended` and `suspended → serving` by a new
policy version, and `accepting → paused` and `paused → accepting` by a new policy
version. Repeating the same intended effect is idempotent. Retirement is
terminal for serving recovery unless the Site lifecycle owner creates a valid
successor lifecycle action; D7 cannot resume a retired Site.

### 14. Data integrity risks

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                              | Severity / likelihood | Evidence                                                                                                                    | Effect on D7         | Permanent correction and exact language                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Duplicate heads, missing predecessor links, mutable actor/reason, cross-scope foreign keys, or defaulted Site attribution make audit and enforcement contradictory. | Critical / Medium     | **Current behavior:** legacy recurring tables allow nullable Tenant and lack Site attribution; most legacy RLS is disabled. | Blocks legacy reuse. | Apply **D7-R11** and **D7-R19**. Explicit non-null scope, composite FKs, one head, immutable versions, ambiguous quarantine. |
| A cached or imported “paused” projection becomes write authority, or a backfill invents historical suspension.                                                      | High / Medium         | **Repository fact:** Asym Postgres owns truth; provider/projection state cannot win.                                        | Changes migration.   | Apply **D7-R8** and **D7-R19**. Backfill only current explicit starting policy; do not fabricate historical events.          |

### 15. Security and privacy risks

**Material concern exists.**

| What could go wrong and why it matters                                                                                  | Severity / likelihood  | Evidence                                                                                                                                                                                        | Effect on D7                          | Permanent correction and exact language                                                                            |
| ----------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| A compromised admin session weaponizes outage/recovery, or recovery restores compromised content.                       | Critical / Medium      | **Repository fact:** Phase 12 requires named capabilities, active assignment, step-up/epochs, and audited operator access. **External fact:** NIST requires integrity-checked, scoped recovery. | Adds separate capabilities and proof. | Apply **D7-R9** and **D7-R14**. Fast single-actor containment; fresh-assurance, proof-gated recovery.              |
| Public status or audit records expose missionary location, exploit detail, internal IDs, provider payloads, or secrets. | Critical / Medium      | **Repository fact:** Phase 10 requires strictest-wins public projection and telemetry redaction.                                                                                                | Narrows copy and evidence.            | Apply **D7-R10** and **D7-R13**. Public safe snapshot only; restricted evidence separate; no secrets/raw payloads. |
| Cache/search/OG/media remains a secondary disclosure channel after HTML is offline.                                     | Critical / Medium-High | **Repository fact:** Phase 10 treats every public egress as part of the firewall.                                                                                                               | Broadens website egress inventory.    | Apply **D7-R2** and **D7-R12**. Probe and contain all Site-qualified egress, not just pages.                       |

Retention, anonymization, backup, and export rules are not newly invented here:
the policy/audit records follow their source-owned retention contract and contain
only minimized identifiers/evidence references. Site retirement cannot erase
security or financial history.

### 16. Scalability and performance risks

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                                 | Severity / likelihood | Evidence                                                                                                                                                                          | Effect on D7                                  | Permanent correction and exact language                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Large Sites can have many aliases/locales/routes; synchronous purge/probing inside the command times out, while unbounded fan-out or one database query per route creates load spikes. | High / Medium         | **External fact:** Vercel has multiple cache layers and global propagation; domain/provider APIs have limits. **Repository fact:** roadmap records Vercel domain API rate limits. | Changes execution model.                      | Apply **D7-R11**, **D7-R12**, and **D7-R18**. Short authoritative commit, bounded durable outbox, cohort invalidation, sampled representative routes plus complete host inventory, backpressure and reconciliation.             |
| Per-request complex RLS/function calls or unindexed scope predicates turn the safety check into a latency and availability bottleneck.                                                 | High / Medium         | **External fact:** Supabase recommends indexed RLS predicates and cached auth function evaluation.                                                                                | Adds performance proof.                       | Apply the index/least-privilege rules in **D7-R11**; benchmark admission and public gates at production-shaped tenant/host counts.                                                                                              |
| A control-plane incident causes a thundering herd of uncached 503 or restore requests.                                                                                                 | High / Low-Medium     | **Product judgment.**                                                                                                                                                             | Adds operational test, not a new abstraction. | The static unavailable response is independently cache-safe at the edge while browser caching is `no-store`; recovery uses request collapsing/cohort warming owned by the public runtime. Prove it under the chaos tests below. |

### 17. Operational burden

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                            | Severity / likelihood | Evidence                                                                                                              | Effect on D7                                   | Permanent correction and exact language                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff or support maintain a spreadsheet of domains/forms/QR codes and manually guess whether containment worked. Hidden tribal knowledge creates false assurance. | High / High           | **External fact:** comparable products expose form/site scope, but external links can remain independently reachable. | Adds machine inventory and one status surface. | Apply **D7-R3**, **D7-R12**, and **D7-R16**. Generate the inventory from authoritative bindings and show exceptions; no support-only normal path. |
| Every partial result creates one task per route or recurring gift and overwhelms a small ministry.                                                                | Medium / Medium       | **Repository fact:** accepted provider ADR groups incidents by causal scope.                                          | Narrows operations design.                     | One cause-owned incident/repair item per command/scope with drill-down evidence; do not fan out staff tasks.                                      |

### 18. Observability and auditability gaps

**Material concern exists and is release-blocking.**

| What could go wrong and why it matters                                                                                           | Severity / likelihood | Evidence                                                                                                       | Effect on D7                    | Permanent correction and exact language                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Logs show the command ran but cannot prove what visitors saw, who acted, which revision won, or whether a gift was pre-admitted. | Critical / High       | **Repository fact:** accepted audit/provider contracts separate technical logs from durable business evidence. | Adds receipts and observations. | Apply **D7-R10**, **D7-R12**, and **D7-R18**. Correlate command, policy revision, admission revision, external probe, and provider reconciliation without logging secrets. |
| A favorable dashboard hides partial aliases, stale regions, or foreign holds.                                                    | Critical / Medium     | **External fact:** incident tools distinguish active work, monitoring, and resolution.                         | Changes status semantics.       | Apply **D7-R8** and **D7-R14**. Desired, command, observed, and foreign-hold facts remain visible and separate.                                                            |

### 19. Dependency and integration risks

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                   | Severity / likelihood  | Evidence                                                                                                                                          | Effect on D7                 | Permanent correction and exact language                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vercel cache/project behavior, Stripe PaymentIntent/Checkout behavior, hosted links, webhook delay/duplicates, or provider schema changes contradict Core's local claim. | Critical / Medium-High | **External fact:** Stripe events may be duplicate/out of order; PaymentIntent cancellation is state-limited; Vercel invalidation may serve stale. | Keeps providers subordinate. | Apply **D7-R5**, **D7-R6**, **D7-R8**, and **D7-R12**. Local policy owns intent; provider state is reconciled evidence; unknown never becomes favorable. |
| A Stripe account/binding incident spans Sites, while a Site control is too narrow; a Vercel project action is too broad.                                                 | Critical / Medium      | **Repository fact:** ADR-0015 owns account/binding control-loss quarantine.                                                                       | Clarifies owner composition. | Apply **D7-R4**. Use the causal owner control; do not stretch the Site command.                                                                          |

### 20. Migration, rollout, and upgrade risks

**Material concern exists and is release-blocking.**

| What could go wrong and why it matters                                                                                                                      | Severity / likelihood  | Evidence                                                                                                                                        | Effect on D7                                                                | Permanent correction and exact language                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Old code ignores a newly written adverse policy during a mixed-version deployment, so staff see “paused” while an old edge or API still serves/admit gifts. | Critical / High        | **Current behavior:** current host resolution is Tenant-only, current checkout has no Site gate, and current Stripe resolution is transitional. | Blocks early control enablement.                                            | Apply **D7-R19**. Deploy and prove all readers first; enable commands only after no old adverse-blind path remains.                                                                                    |
| Website-offline catches a legacy Site-qualified return/result after durable admission, so a completed donor sees the unavailable Site and may retry.        | Critical / Medium-High | **Later D12 evidence:** admitted-operation result authority is independent; pre-seam return paths can outlive deployment.                       | Adds an exact carve-out/migration fence without weakening Site containment. | **D7-R2 plus D12-R8–R10/R20:** fixed Asym operation routes bypass only the Site presentation gate; legacy paths require an admitted-only carve-out or proved migration/expiry before scope activation. |
| A default one-Site backfill assigns ambiguous historic gifts or hostnames and rewrites attribution.                                                         | Critical / Medium      | **Repository fact:** defaults may prefill new setup but never rewrite existing scope/history.                                                   | Narrows migration.                                                          | Apply **D7-R19**. Prove one-to-one mappings; quarantine ambiguity; do not invent historical pause or Site attribution.                                                                                 |
| Rollback deletes policy rows or restores the old Boolean after new decisions exist.                                                                         | Critical / Low-Medium  | **Repository fact:** immutable successor patterns govern financial/publication recovery.                                                        | Changes rollback strategy.                                                  | Apply **D7-R14** and **D7-R19**. Roll forward through successor policy; schema remains backward-compatible until legacy readers are retired.                                                           |

### 21. Testability, traceability, and proof

**Material concern exists in the draft; the corrected decision is falsifiable.**

| What could go wrong and why it matters                                                                                                                                                 | Severity / likelihood | Evidence                                                                                             | Effect on D7              | Permanent correction and exact language                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| “Pauses Giving” or “takes site offline” is asserted by a unit test around a Boolean while public, authorization, concurrency, cache, provider, and migration outcomes remain unproved. | Critical / High       | **Repository fact:** accepted ADRs require permanent negative, fencing, and production-shaped gates. | Adds full proof matrix.   | The acceptance suite below is normative and every future artifact must trace to **D7-R1–R19**.                            |
| Terms drift among “disable,” “suspend,” “unpublish,” “deactivate,” “pause,” Site, tenant, channel, and campaign.                                                                       | High / High           | **Repository fact:** `CONTEXT.md` is the shared vocabulary authority.                                | Requires glossary update. | Record **Site Serving Suspension** and **Site Public Giving Admission** in `CONTEXT.md`; use the button copy only for UI. |

### 22. Other development hazards

**Material concern exists.**

| What could go wrong and why it matters                                                                                                        | Severity / likelihood | Evidence                                                                                                                         | Effect on D7                                                                       | Permanent correction and exact language                                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D7 is turned into tickets against proposed Phase 22/23 contracts before their open review conflicts are reconciled, freezing a disputed seam. | High / High           | **Repository/GitHub fact:** PR #1323 and PR #1340 are open and unmerged as of this review; Phase 24 has no PRD/OpenSpec package. | Does not block recording the product decision; blocks implementation-ready status. | Apply **D7-R19**. Reconcile predecessor contracts first, then trace D7 through PRD/OpenSpec/design/tasks.                                                                                                                |
| Creating an ADR now collides with unmerged Phase 22/23 ADR numbering or elevates an un-groomed design detail to governing authority.          | Medium / Medium       | **Repository fact:** accepted ADR numbering on `develop` and open predecessor ADR series are not yet reconciled.                 | Changes documentation sequence.                                                    | Keep D7 in the grooming decision log plus this evidence. Create the final ADR only after predecessor authority is settled and the Phase 24 PRD proves the decision is hard to reverse, surprising, and tradeoff-bearing. |
| “Temporary” becomes indefinite without owner, next update, or recovery review.                                                                | High / Medium         | **External fact:** incident-management practice separates containment, monitoring, and resolution.                               | Adds operational ownership.                                                        | Apply **D7-R10**, **D7-R13**, and the monitor table below. A prolonged closure must enter its separate workflow.                                                                                                         |

## Permanent acceptance and proof matrix

The future Phase 24 OpenSpec and release evidence MUST prove user-visible and
domain outcomes, not implementation details alone.

### Positive and non-effect tests

- Take one Site offline; every admitted host/locale/public route returns the
  isolated response while sibling Sites, admin/editor access, drafts,
  configuration, immutable generations, and independent Donor Portal routes
  remain unchanged.
- Admit an operation, take the Site offline, then complete/return in both event
  orders: the fixed Asym handoff/result remains truthful and accessible with no
  Site content or new-admission authority. A legacy Site-qualified result route
  passes only through the exact carve-out or a proved migration/expiry fence.
- Pause new gifts from one Site; every public entry route for that Site rejects
  before durable/provider creation while its website, sibling Sites, staff
  offline entry, unrelated APIs, and authenticated portal paths remain
  unchanged.
- Prove existing recurring execution state, retries, reconciliation, receipts,
  cancellation, reduction, and payment-method servicing were not mutated by
  either Site command.
- Prove an independently safe alternate route appears only when it is outside
  the contained scope and carries its own exact attribution/financial proof.

### Negative, authorization, and isolation tests

- Cross-Tenant, cross-Site, cross-environment, sibling-Site, wrong-host,
  wrong-locale, wrong-entry-method, default-Site fallback, metadata-selected
  Tenant, and poisoned service-role IDs cannot read or mutate another scope.
- Unknown/transferred/tombstoned hosts remain privacy-safe not-found; a known
  temporarily offline Site is not mislabelled as missing.
- Direct endpoint, stale browser, copied URL, embed, QR code, hosted link, API
  handoff, RSC/data request, sitemap, OG, search, redirect, and Site-qualified
  media cannot bypass current policy.
- Missing, revoked, expired, wrong-purpose, impersonated, or stale-epoch actor
  authority fails before enumeration or mutation and does not disclose whether
  another tenant/Site exists.
- Database tests prove direct grants, `USING`, `WITH CHECK`, `FORCE RLS`,
  privileged command scope, immutable scope, append-only history, same-scope
  composite FKs, indexed policy predicates, unique heads, and delete
  prohibition.

### Boundary, concurrency, idempotency, and failure tests

- Pause and admission race in both orders; only the durable linearization winner
  determines whether the gift is pre-admitted or rejected.
- Pause vs recovery, recovery vs retirement, domain transfer vs suspension,
  publication vs recovery, actor revocation vs command, and two concurrent
  commands produce one CAS winner and no stale favorable state.
- Same semantic idempotency key and payload returns the original receipt after
  lost response, restart, and epoch change; same key with a different command or
  scope is rejected.
- Provider timeout, duplicate/out-of-order webhook, outcome unknown, cache
  purge failure, edge-region miss, probe failure, queue delay, process crash,
  and outage-page dependency failure remain visible, replayable, and safe.
- A pre-admitted PaymentIntent/Checkout Session can finish and is classified
  correctly; post-fence work creates no internal/provider object.
- Recovery with an independent safety/provider/recurring hold leaves that hold
  effective and does not claim full availability.

### Migration, performance, accessibility, and production-shaped tests

- Clean install, explicit one-Site backfill, ambiguous quarantine, shadow read,
  mixed-version deployment, authority cutover, legacy-reader retirement, and
  forward recovery after new policy writes all preserve history and scope.
- Production-shaped tests cover the declared maximum Sites per Tenant, admitted
  hosts per Site, enabled locales, route cohorts, concurrent checkouts, policy
  changes, probes, and queue backlog. Those cardinality limits must be declared
  in the Phase 24 PRD rather than hidden in code.
- External multi-region probes prove the p99 5-second and hard 30-second serving
  budgets; admission metrics prove zero post-fence starts.
- Keyboard, screen reader, 320 CSS-pixel reflow, 200%/400% zoom as applicable,
  visible focus, focus trap/return, Escape/cancel, forced colors, reduced motion,
  status announcement, error alert, non-color state, touch target, localization,
  long organization/Site names, RTL, and low-bandwidth behavior all pass.

### Traceability rule

Every Phase 24 artifact SHALL cite the applicable `D7-R#` clauses:

```text
Founder answer
  -> D7 decision log
  -> CONTEXT.md vocabulary
  -> Phase 24 PRD requirements
  -> OpenSpec requirements and scenarios
  -> design invariants and migration manifest
  -> tasks and GitHub tickets
  -> implementation and named tests
  -> deployment qualification and release evidence
```

A changed clause requires a recorded superseding founder decision and a
downstream consistency check. Ticket text or implementation cannot silently
weaken it.

## Named monitors and required response

Only residual runtime uncertainty belongs in monitoring. The contract itself is
not deferred to monitoring.

| Signal                                          | Threshold                                                                                            | Owner                                   | Required response                                                                                                                                                                                         |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `site_public_gift_admissions_after_pause_total` | Any value above `0` for the exact committed scope/revision                                           | Giving on-call                          | Declare a P0 control breach, invoke the Phase 13 causal-scope hold, quarantine/reconcile every affected operation, preserve evidence, and block recovery until root cause and negative replay proof pass. |
| `site_suspension_content_served_probe_total`    | Any inventoried host/required cohort serves Site content 30 seconds after command commit             | Public Runtime on-call                  | Mark command **partial**, page immediately, invoke provider/WAF quarantine, enumerate missed egress, and keep recovery blocked.                                                                           |
| `site_control_convergence_seconds`              | p99 above 5 seconds for 15 minutes, or any command above 30 seconds                                  | Public Runtime owner                    | Open one cause-owned incident, stop favorable completion claims, inspect queue/edge/cache health, and run the containment drill.                                                                          |
| `site_control_desired_observed_mismatch`        | Any mismatch lasts more than 30 seconds                                                              | Site Operations owner                   | Show **Needs attention**, attach current probes/holds to the receipt, and route the one repair action; never auto-clear.                                                                                  |
| `site_control_unauthorized_attempt_total`       | 5 denied attempts by one principal in 10 minutes or any cross-Tenant scope attempt                   | Security on-call                        | Revoke/re-evaluate the session epoch, preserve minimized security audit, investigate actor/device, and notify the tenant under the security policy.                                                       |
| `site_recovery_regression_total`                | Any contained response or admission rejection recurs during the 15-minute recovery-monitoring window | Owning Public Runtime or Giving on-call | Return the projection to **Needs attention**, reapply the smallest owner hold if safe, retain the successor history, and reopen the incident.                                                             |

## Research synthesis

### Repository authority

- [`CONTEXT.md`](../../../CONTEXT.md) defines Site, Default Site, Site Setup,
  Site Public Activation, Entry Method, and financial-identity separation.
- [`openspec/specs/platform-boundaries/spec.md`](../../../openspec/specs/platform-boundaries/spec.md)
  makes CMS authoritative for public presentation and CRM/Giving authoritative
  for operational and money truth.
- [ADR-0028](../../adr/0028-defense-in-depth-public-isolation.md) requires one
  typed, fail-closed public read choke point and permanent negative isolation
  tests.
- [ADR-0030](../../adr/0030-function-level-tagged-caching-publish-signal.md)
  states that cache tags are invalidation handles, not cache isolation, and
  reserves Site/locale dimensions.
- [ADR-0044](../../adr/0044-canonical-legal-entity-financial-boundary.md)
  prohibits default/fallback financial identity and makes readiness axes
  independent.
- [ADR-0014](../../adr/0014-product-owned-rail-isolated-recurring-recovery.md)
  and [ADR-0015](../../adr/0015-provider-control-loss-quarantine-and-proof-gated-recovery.md)
  keep recurring execution and provider-control recovery source-owned,
  idempotent, fenced, and proof-gated.
- [ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)
  keeps operational truth in Asym Postgres and requires structural Tenant
  isolation.

### Current behavior, not permanent authority

- `packages/api/src/cms/public/context.ts` reserves `siteId` but always receives
  `null` today.
- `apps/admin/src/cms/public/resolve-tenant.ts` resolves Tenant from host but not
  an operational Site.
- `apps/admin/src/cms/public/published-content-reader.ts` applies tenant and
  published constraints, not D7 Site policy.
- `packages/lib/cms/public-page.ts` and `apps/donor/lib/cms/client.ts` use
  60-second public cache behavior.
- `apps/donor/app/(public)/(solid)/checkout/checkout-client.tsx` receives a
  PaymentIntent client secret and confirms later in the browser.
- `packages/api/src/donate/index.ts` has no authoritative Site/admission fence.
- `packages/api/src/stripe/tenant-client.ts` still contains tenant-key and
  environment fallback behavior that D1/D2 prohibit as permanent topology.
- `supabase/schema.sql` explicitly disables RLS on most legacy/demo tables;
  those tables are not an acceptable D7 foundation.

### Current external primary evidence

- [Givebutter campaign closure](https://help.givebutter.com/en/articles/1772204-how-to-close-or-unlist-a-campaign)
  separates visibility, new-payment acceptance, attached features, and existing
  recurring gifts.
- [Donorbox archived-campaign recurring behavior](https://donorbox.zendesk.com/hc/en-us/articles/360020294052-What-happens-to-recurring-donations-once-the-campaign-is-archived)
  preserves existing recurring plans, while account closure has broader effects.
- [Blackbaud Raiser’s Edge NXT](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-new-features.html)
  closes forms on a schedule without deleting them and provides supporter-facing
  closed-form messaging; its
  [portal](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-portal-tutorial.html)
  separately services recurring gifts.
- [Shopify Pause and Build](https://help.shopify.com/en/manual/your-account/pause-store)
  separates a readable storefront from checkout admission; its breadth also
  shows why Core must state exact channel scope.
- [Squarespace Site availability](https://support.squarespace.com/hc/en-us/articles/206537237-Can-I-put-my-account-on-hold),
  [Webflow publish/unpublish](https://help.webflow.com/hc/en-us/articles/33961351954579-How-do-I-publish-or-unpublish-a-Webflow-site),
  and [WordPress visibility](https://wordpress.com/support/privacy-settings/)
  show that public availability, per-page/domain visibility, and editing are
  distinct CMS concerns.
- [Stripe PaymentIntent lifecycle](https://docs.stripe.com/payments/paymentintents/lifecycle),
  [cancellation](https://docs.stripe.com/api/payment_intents/cancel), and
  [webhooks](https://docs.stripe.com/webhooks) prove why admitted/in-flight,
  cancelable, processing, succeeded, duplicate, and out-of-order states cannot
  be collapsed into a Site toggle.
- [Stripe Connect](https://docs.stripe.com/connect/saas-platforms-and-marketplaces)
  keeps connected-account responsibility and payment execution separate from
  a website's presentation context.
- [Vercel CDN](https://vercel.com/docs/caching/cdn-cache) and
  [ISR](https://vercel.com/docs/incremental-static-regeneration) document
  multiple cache layers, stale-on-revalidation behavior, and global purge
  characteristics; Core still owns the containment proof.
- [Google Search Central](https://developers.google.com/search/docs/crawling-indexing/pause-online-business)
  supports temporary 503 handling and warns against misleading long-lived
  shutdown behavior.
- [WCAG 2.2](https://www.w3.org/TR/wcag/),
  [ARIA modal dialogs](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/),
  and [status messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html)
  support the confirmation, focus, reflow, and persistent status requirements.
- [NIST SP 800-61r3](https://csrc.nist.gov/pubs/sp/800/61/r3/final) supports
  scoped containment, integrity-checked recovery, and post-recovery monitoring.

## Resolved judgments and remaining assumptions

Verified facts support the two-axis model and the required in-flight/cache
amendments. The following are product judgments now made explicit:

- the ordinary Site action stops new **public Site** checkout admission, not
  every Tenant entry method;
- pre-admitted checkout may finish rather than being blindly canceled;
- temporary outage uses a platform-owned 503 response; prolonged closure and
  retirement remain separate; and
- no automatic resume or generic incident-workflow engine ships in D7.

No unresolved assumption blocks recording D7. Before implementation, user
research must still validate labels and comprehension with representative
tenant staff, and production qualification must prove the declared host/locale
cardinality and containment budgets. Failing either does not permit weakening
the safety invariant; it requires a revised UX or implementation design and a
recorded decision.
