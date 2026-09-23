# Phase 24 D8 — Site Retirement Adversarial Review

> **Status:** Completed `/grill-with-docs` decision evidence for D8. This is not
> a Phase 24 PRD, OpenSpec change, implementation plan, migration authorization,
> or ticket specification.
>
> **Founder choice:** Option 1 — permanent retirement; successor required.
>
> **Review date:** 2026-08-26
>
> **Later D12 clarification:** Before any writer—including Site retirement—may
> terminalize an Issued Giving Address, the admitted-operation result/recovery
> seam using the security floor from
> [ADR-0025: Producer-owned protected actions](../../adr/0025-producer-owned-protected-actions.md)
> and
> [ADR-0037: Scanner-resistant exact-artifact access](../../adr/0037-scanner-safe-exact-artifact-access.md),
> plus the per-scope pre-seam return-path fence, must be proved.
> Retirement never strands already-admitted donor results on the terminal Site
> address.

## Final disposition

**Accept with required amendments.**

The permanent-retirement direction is correct and is the clearest UX once D7
already provides reversible website and Giving pauses. The draft was not yet
safe to implement. “Read-only forever,” “public address,” “Retiring,” and
“cleanup complete” were too ambiguous; without a terminal database invariant,
an atomic retirement fence, retention limits, fresh domain proof, and precise
failure UX, teams could revive a Site, preserve personal data forever, reuse a
trusted address, or claim success while public content remained reachable.

In plain language:

- retirement is the final step after staff have already taken the website
  offline, paused new Site-attributed public gifts, and chosen another Default
  Site;
- after the final commit the same Site can never operate again;
- a future website is a new successor Site, never a restored copy of the old
  identity;
- old gifts, receipts, attribution, and audit facts keep pointing to the retired
  Site, but privacy owners may still delete or anonymize content and personal
  data;
- retirement never changes Stripe, Legal Entity, settlement, bank, accounting,
  recurring-gift, or historical money facts; and
- Core never guesses a redirect, successor, fund, or financial route.

## Evidence labels

- **Repository fact** — accepted ADR, OpenSpec requirement, PRD, or glossary on
  `develop`.
- **Current behavior** — code or schema present on `develop`; this proves only
  what runs now.
- **Proposed evidence** — open, unmerged Phase 22/23 work; useful input but not
  governing authority.
- **External fact** — current primary product, standards, or technical
  documentation.
- **Product judgment** — the recommended permanent choice after reconciling the
  evidence.
- **Assumption** — a claim requiring user or production proof before release.

## Corrected D8 decision — normative language

These clauses replace the draft D8 wording and MUST flow into the Phase 24 PRD
and later OpenSpec requirements.

### D8-R1 — Terminal lifecycle

For one exact Tenant, environment, and Site, retirement is a terminal lifecycle
transition from **not retired** to **retired**. After the authoritative commit,
the same Site identity MUST NOT return to setup, active, suspended, or any other
operable state. Any later public presence is a new successor Site with a new
Site identity and fresh readiness, domain, release, locale, currency, Giving,
authorization, and provider proof.

Retirement is not deletion, a reversible archive, D7 suspension, Tenant
offboarding, or provider cleanup. The product SHALL NOT expose “restore,”
“reactivate,” or “undo retirement.”

### D8-R2 — Preparation, commit, and displayed progress

Preparation is reversible and has no public effect. It computes a current,
complete impact digest and readiness checklist. The final server command
appends the terminal retired lifecycle version in one local transaction.

`Applying retirement`, `Retirement needs attention`, and `Retired` are derived
command/convergence presentations, not additional Site lifecycle states:

- **Applying retirement** means the terminal local fact exists and required
  containment/cleanup evidence is still converging;
- **Retirement needs attention** means the terminal fact exists but an external
  or derived effect is partial, failed, stale, or unknown; and
- **Retired** means the terminal fact exists and every required locally owned
  effect and declared external observation is proved.

Failure after the terminal commit never restores the Site. Staff repair or
reconcile the failed effect.

### D8-R3 — Blocking preconditions and current impact proof

The retirement commit MUST fail closed unless the same authoritative command
rechecks all of the following at commit time:

1. the actor has the current exact retirement capability and required session
   assurance;
2. the Site, Tenant, and environment match the trusted server context;
3. the Site is not the current Default Site for that Tenant and environment;
4. D7 Site Serving Suspension is current and observed contained;
5. D7 Site Public Giving Admission is paused or has never been enabled;
6. no source-owned lifecycle, legal, security, migration, export, preservation,
   or provider-control hold forbids retirement;
7. the impact digest covers every declared authoritative dependency and still
   matches their current revisions; and
8. every unresolved, truncated, timed-out, or unknown dependency is shown as a
   blocker, never as zero or safe.

The review MAY link directly to the smallest action that resolves a blocker.
It MUST NOT silently perform that action as part of retirement.

### D8-R4 — Atomic terminal fence

The terminal commit and every favorable Site command MUST serialize through the
same compare-and-set lifecycle head or monotonic lifecycle epoch. Once the
retirement commit wins, no serving recovery, public activation, publication,
Giving resume, new checkout admission, host/domain/locale/currency activation,
ordinary configuration mutation, outbound Site-link preparation, or other
operation that could make the Site operable may commit.

A favorable operation admitted before retirement may finish only under its
already frozen authority and owner contract. A stale browser, queued job,
duplicate request, delayed webhook, or provider callback can record observation
or failure but cannot recreate favorable Site authority.

### D8-R5 — Historical non-effects

Retirement MUST NOT cancel, refund, reassign, rewrite, merge, delete, or change
the meaning of prior contributions, pre-admitted checkout, recurring
commitments, receipts, statements, Source Codes, designations, public
generations, publications, messages already sent, accounting entries, audit
history, or attribution.

Pre-admitted checkout may finish, fail, or reconcile under its frozen D7/Giving
authority. Existing recurring commitments continue only while their own Phase
16/provider controls permit. Retirement does not select or mutate Legal Entity,
Settlement Account Binding, Stripe account, settlement, bank, currency, or
accounting identity.

### D8-R6 — Minimum history, privacy, and retention

Core MUST preserve the stable Site identifier, terminal lifecycle fact, exact
Tenant/environment scope, necessary historical relationship intervals, and
minimum audit/attribution evidence required to interpret durable business
records. Those facts are not reusable or caller-editable.

“Preserve history” does not mean “keep every byte forever.” CMS content,
personal data, restricted missionary names or locations, media, analytics,
exports, logs, backups, and generated documents remain subject to their owning
retention, legal-hold, erasure, anonymization, and access contracts. A display
label MAY be redacted while the stable identifier and non-sensitive historical
meaning remain. Retirement MUST NOT become a privacy-retention override.

### D8-R7 — Default Site and successor

An operating Tenant has exactly one current Default Site per environment. The
current Default Site cannot retire until a different eligible Site becomes
Default through the D4 transition. Retirement never chooses or creates that
successor automatically.

A successor Site is an explicit, ordinary new Site. It MAY receive a one-time
copy of eligible drafts or configuration through each owning domain's import
contract, but it does not inherit the retired Site's identity, lifecycle,
public-generation authority, permissions, provider proof, Giving readiness, or
historical facts. “Successor” is a descriptive relationship, not redirect or
financial authority.

### D8-R8 — Site identity, Core handles, provider URLs, and custom domains

Site identifiers are never reused. Display names may be reused because they are
not identity.

A public handle in a namespace Core owns and controls is permanently reserved
from its first assignment to a Site. Core SHALL keep an append-only
allocation/tombstone fact sufficient to reject reassignment. Private preview
tokens are not public handles; Phase 24 SHOULD avoid assigning a public handle
until public-address setup actually requires one. A provider-generated hostname,
including a `vercel.app` deployment URL, MUST NOT be presented as stable Site
identity or a canonical public address because Core cannot guarantee provider
reservation after deletion.

Custom-domain ownership is independent and is never inferred from historical
use. A later binding requires fresh control proof, uniqueness in the current
Tenant/environment binding set, a new provider binding and verified-host
generation, and fresh public activation. Old binding intervals remain
immutable. Historical cookies, caches, service workers, sessions, and client
storage MUST NOT grant or infer access after reassignment.

**D75 clarification:** every Tenant uses the same ordinary Add domain path only
after one Core-owned seven-day exact-host DNS-control challenge. An unproved
attempt reserves nothing. Successful proof is consumed in the same transaction
that acquires the platform-wide current claim and creates a new private binding
generation; the former row is never retargeted. New positive state is empty,
while D9–D15 adverse reservations remain. “Clean start” means no Core authority
is inherited, not that external browser/search/DNS history was erased.

Once assigned, a Core public handle is never released merely because analytics
show no visit or the Site never activated; observed exposure is not reliable
allocation authority.

### D8-R9 — Requests, routes, and redirects after retirement

Retirement removes every current host and route admission owned by the retired
Site. If a request for a retired Site still reaches Core, the launch-safe
response is an isolated, privacy-safe not-found result with no Site content,
tenant discovery, hidden status detail, cross-Site cache reuse, or indexing.

Retirement creates no automatic redirect to the Default Site, a sibling Site,
Tenant homepage, general fund, guessed successor, or provider URL. A later
same-resource redirect or explicit retirement notice requires a separately
accepted host/route decision, current ownership proof, privacy review, and the
route owner's immutable history. Missing proof stays not found. Public route
and Page tombstones remain owned by their Phase 22/23 contracts and cannot be
transferred or reinterpreted by Site retirement.

### D8-R10 — Never-public Site setup

A private, never-public Site Setup shell uses the same terminal lifecycle
instead of a second hard-delete path. Staff-facing copy MAY say
**Discard setup**, and ordinary lists MAY hide the result by default, but the
confirmation MUST say that the Site cannot be restored.

Only the minimized lifecycle, scope, allocation, security, and audit evidence
appropriate to an unexposed Site is retained. The command MUST NOT perform
public provider cleanup that the impact proof shows never existed, and it MUST
NOT claim that an exposed handle was never public merely because the current
Site has no active host.

### D8-R11 — Source of truth and ownership

Asym Postgres owns Site identity, lifecycle versions, the compare-and-set
current lifecycle head, command receipt, authorization evidence, and retirement
outbox. CMS owns content and immutable publication facts. Phase 22/23 route and
host owners own public binding/generation history. Giving owns checkout
admission, contributions, commitments, and financial execution. D4 owns the
Default Site transition. Providers, caches, DNS, probes, and UI labels are
executors or observations, never lifecycle write authority.

`cms.tenants.isActive`, a future `sites.is_active`, absence of content, a
provider project status, a domain deletion, a deployment URL, a cache purge, or
an analytics event MUST NOT imply retirement.

### D8-R12 — Authorization and consequence review

Site retirement is an independently grantable, high-impact capability resolved
through the Phase 12 Policy Decision Point. The server derives and revalidates
the actor, on-behalf-of identity, active assignment, Tenant, environment, Site,
capability, purpose, and assurance; caller-provided scope, role, actor, owner,
approval, or override values are ignored or rejected.

One currently authorized person may retire after fresh authentication and the
complete consequence review. There is no universal second-approver requirement;
a Tenant MAY apply a prospective quorum-aware policy that remains usable for a
one-admin Tenant. Support access and impersonation confer no ambient retirement
power. Impact details that would reveal unauthorized content or sensitive
ministry data are reduced to safe counts and owner-labelled blockers.

### D8-R13 — Idempotency, audit, and receipt

The semantic retirement request has a durable idempotency key bound to the
exact Tenant, environment, Site, expected lifecycle revision, impact digest,
reason, and command meaning. Same key and same meaning returns the original
receipt; same key with different meaning is rejected; retirement of an already
retired Site returns the terminal receipt without creating another lifecycle
version.

The local transaction records the terminal lifecycle version, new head,
business audit, durable outbox, and receipt atomically. Audit includes, without
secrets or raw provider payloads: actor and on-behalf-of identity, active
assignment, capability/assurance, exact scope, reason category and optional
note, predecessor and committed revision, impact digest, command/correlation
IDs, effective instant, declared effects/non-effects, and latest observation.
Technical logs are not the durable business audit.

### D8-R14 — Database, RLS, and mutation invariants

The physical design MAY follow repository naming conventions, but MUST
structurally enforce all of these invariants:

- exact Tenant, environment, Site, lifecycle revision, disposition, effective
  instant, actor class, command ID, and semantic idempotency fields are
  non-null; predecessor is null only for one genesis version;
- same-scope composite foreign keys prevent lifecycle versions, heads,
  receipts, bindings, observations, or outbox work from crossing Tenant,
  environment, or Site;
- each exact scope has one current head; positive revisions are monotonic;
  versions and terminal receipts are append-only;
- no valid successor to a retired lifecycle version can be non-retired, and a
  retired head cannot be advanced by an ordinary favorable command;
- referenced Site/lifecycle/history rows use `ON DELETE RESTRICT`, never
  cascade deletion;
- lifecycle rows contain no money, currency balance, Stripe secret, bank,
  settlement, Legal Entity, or accounting identity;
- equality-leading scope and current-status predicates used by RLS, impact
  reads, and compare-and-set have supporting composite indexes; time uses
  `timestamptz`;
- direct Data API mutation grants are revoked; operational tables use
  `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY` where the runtime
  role is subject to RLS;
- `SELECT`/`DELETE` policies use `USING`, `INSERT` uses `WITH CHECK`, and
  `UPDATE` uses both; scope columns are immutable so a permitted update cannot
  move a row into a forbidden scope, and append-only lifecycle/receipt/audit
  rows expose no direct `UPDATE`/`DELETE` grant or policy; and
- service-role or privileged paths use the one server command and repeat every
  exact-scope constraint. Any `SECURITY DEFINER` helper has a least-privileged
  owner, schema-qualified names, pinned empty `search_path`, and rejects
  caller-controlled actor/scope.

No provider or network call occurs while database locks are held.

### D8-R15 — Concurrency and failure posture

Retirement MUST race safely with Default-Site change, D7 recovery, activation,
publication, checkout admission, domain transfer, locale/currency activation,
message preparation, imports, and background jobs. One compare-and-set ordering
wins; stale impact or head revisions return **Review changes** without a partial
terminal write. Locks use one documented order.

After a successful local commit, provider cleanup is asynchronous,
idempotent, read-after-write reconciled, and retryable. A lost response returns
the same receipt on retry. An ambiguous provider outcome is inspected before a
mutating retry. Audit/outbox failure aborts the local transaction. Provider
failure sets **Retirement needs attention**, fails public behavior closed, and
never restores the Site.

### D8-R16 — Staff and public UX

The permanent action lives at **Site settings → Lifecycle**, visually and
semantically separate from D7 **Availability**. It is a full-page review, not a
toggle, crowded modal, bulk action, or first-level menu item. It has three
sections:

1. **Before you retire** — current readiness cards and direct repair actions;
2. **What retirement changes** — exact website, new-gift, domain, link, and
   configuration effects; and
3. **What retirement does not change** — recurring gifts, prior gifts,
   receipts, attribution, accounting, and privacy-owner retention.

The page shows exact Site name and stable reference, environment, current
Default status, known public hosts, consequence counts, data timestamp, and
whether the impact is complete. Unknown or stale data disables the final
action and gives one plain next step. After commit, the persistent receipt page
shows **Applying retirement**, **Retirement needs attention**, or **Retired**,
the effective time, actor, reason, proved effects, unresolved work, and one
owner-routed repair action. A toast alone is never completion evidence.

The flow uses semantic controls, visible focus, programmatic labels and
descriptions, inline errors, an `aria-live` status, least-destructive initial
focus, focus return, keyboard operation, 320 CSS-pixel reflow, 200% zoom, long
Unicode/RTL names, safe IDN display, localized `Intl` date/time, reduced
motion, low-bandwidth retry, and no color-only meaning. The confirmation does
not require typing the Site name.

### D8-R17 — Required user-facing copy

The final review MUST communicate these consequences in equivalent,
comprehension-tested plain language:

> **Retire {Site name} permanently**
>
> This cannot be undone. To operate a website later, create a new Site.
>
> Retirement permanently prevents this Site from going online, accepting new
> public gifts, publishing, or activating domains, languages, or currencies.
> It does not cancel existing recurring gifts or change prior gifts, receipts,
> attribution, accounting, or payment ownership.
>
> Core keeps the minimum history needed to understand prior activity. Content
> and personal data still follow their normal privacy and retention rules.
> Nothing redirects or moves automatically.

The readiness cards use consequence-first states and actions:

- **Website — Offline** or **Take website offline**;
- **New gifts from this Site — Paused / Never enabled** or
  **Pause new gifts**;
- **Default Site — {successor name}** or **Choose a new Default Site**; and
- **Domains, links, and operations — Reviewed** or **Review blockers**.

The final button is **Retire {Site name} permanently**. **Cancel** or **Back**
receives initial focus in a confirmation dialog. A reason category is required;
an optional note remains optional except where the selected reason's policy
requires evidence.

### D8-R18 — Capacity, convergence, and observability

Impact review uses bounded, owner-supplied summaries at declared revisions; it
does not perform an unbounded synchronous cross-domain graph scan or N+1
browser query. Truncation, timeout, or an unsupported dependency blocks the
command. The local transaction is short and contains no network work; external
effects run through durable, fairly scheduled, tenant-scoped reconciliation.

Retirement inherits D7's public containment budget: p99 within five seconds and
no inventoried host or required route cohort serving retired Site content after
thirty seconds. Phase 24 MUST declare and test supported per-Site host, route,
locale, currency, dependency, and queued-effect limits before release rather
than using “large” or “scalable.”

Every command and effect carries exact Tenant/environment/Site, lifecycle
revision, command, causation, correlation, attempt, and provider reference
where safe. Metrics use bounded dimensions; logs and traces omit secrets and
sensitive content.

### D8-R19 — Migration, rollout, rollback, and prerequisites

Implementation is blocked until the accepted Phase 5/10/12/13/16 contracts and
the reconciled Phase 22/23 host, route, Page, and content-lifecycle contracts
provide the dependencies D8 names. Phase 24 then uses this sequence:

1. expand append-only lifecycle/head/receipt/outbox and owner-summary seams;
2. backfill an explicit current not-retired head only from proved mappings,
   quarantining ambiguity;
3. deploy every public, admin, Giving, publication, host, locale/currency,
   messaging, and job reader/writer to reject terminal Sites;
4. deploy and qualify the checkout/payment-owned admitted-operation result/
   recovery seam, then source-prove migration or finality plus expiry/retirement
   of every pre-seam operation and replayable old return path per scope;
5. shadow impact summaries, fence decisions, and probes without allowing
   retirement;
6. prove isolation, concurrency, idempotency, accessibility, capacity, and
   production-shaped containment;
7. enable retirement only for scopes whose result/return fence passes, for a
   bounded cohort with a kill switch that disables new commands but does not
   ignore existing terminal facts; and
8. remove hard-delete and `isActive` authority only after no legacy reader or
   writer remains.

Old code that ignores retirement cannot coexist after commands are enabled.
After a terminal write, rollback cannot reactivate the Site or delete history;
the safe strategy is roll forward, repair effects, or create a successor Site.

### D8-R20 — Deliberate non-goals

D8 does not add scheduled retirement, automatic inactivity retirement, bulk
retirement, a configurable lifecycle engine, per-content cleanup tasks, cascade
deletion, automatic successor creation, automatic redirect generation,
automatic domain transfer, a universal two-person approval, or a new financial
control. D7 remains the reversible “not sure yet” path.

## Best UX/UI path

The staff experience stays linear and explicit:

```text
Site settings
├── Availability
│   ├── Website — Offline
│   └── New gifts from this Site — Paused
└── Lifecycle
    └── Retire Site permanently
        ├── Before you retire
        ├── What retirement changes
        ├── What retirement does not change
        └── Retire {Site name} permanently
```

Use a review page because staff need to compare several independent facts; use
a short confirmation dialog only for the final commit. Do not use a toggle:
retirement has no opposite action. Do not hide the recurring-gift non-effect in
help text. Do not use a typed-name ritual: fresh authentication, exact scope,
current impact proof, direct consequence copy, and a single explicit final
button provide stronger protection with less cognitive load.

For a never-public setup, the list action can say **Discard setup**, but the
review still says “cannot be restored.” For donors and other public visitors,
the default response reveals no Tenant or retirement detail. Donor Portal
history remains accessible only under its independent authorization and privacy
rules; missionary or public surfaces never expose provider-cleanup detail.

## Full adversarial category review

Every requested category is evaluated independently. “Changes D8” means Option
1 survives, but the selected wording is narrowed or made normative.

### 1. Problem validity, necessity, and alternatives

**Material concern exists in the draft; no concern invalidates the root need.**

| What could go wrong and why it matters                                                                                                                                                                                                        | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                                        | Effect on D8                                   | Permanent correction and exact language                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Staff could use terminal retirement for a temporary closure and lose the ability to reopen the Site. Conversely, leaving a genuinely ended Site paused forever provides no truthful final lifecycle and keeps it in active operational lists. | High / Medium-High    | **Repository fact:** D7 already supplies reversible serving and Giving controls. **External fact:** WordPress, Wix, Shopify, and GitHub commonly provide recovery windows, showing that irreversible deletion is exceptional. | Narrows Option 1 to a rare identity decision.  | Apply **D8-R1**, **D8-R16**, and **D8-R20**. The UX prominently routes uncertain cases to D7.               |
| “Preserve read-only forever” solves attribution by freezing every data owner’s retention policy.                                                                                                                                              | Critical / High       | **Repository fact:** ADR-0038 says immutability does not mean permanence and requires purpose-owned schedules and verified disposal.                                                                                          | Changes the selected wording, not terminality. | Apply **D8-R6**: preserve minimum non-reusable identity/history; all other records keep their owner policy. |

**Strongest alternative:** a restorable Site archive. It is common and protects
against mistakes, but it duplicates D7’s reversible closure and could revive
stale hosts, permissions, scheduled work, and public trust. The accepted path is
therefore D7 for uncertainty and D8 only when the exact Site identity must never
operate again. “Leave it paused forever” remains a valid no-build choice until
staff are certain; it is not a terminal lifecycle.

### 2. Brittleness

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                                                              | Severity / likelihood  | Evidence and reasoning                                                                                                           | Effect on D8                          | Permanent correction and exact language                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| A review becomes stale while another actor changes Default Site, resumes D7, publishes, binds a host, or starts checkout. A check-then-write implementation could retire under different facts than staff reviewed. | Critical / Medium-High | **Repository fact:** accepted publication/payment patterns use compare-and-set and fencing; D7 has independent policy revisions. | Changes the command contract.         | **D8-R3**, **D8-R4**, and **D8-R15** require a sealed impact digest, revision recheck, one ordering, and `Review changes` on mismatch. |
| Completion depends on Vercel, DNS, caches, or a provider callback, leaving an ambiguous lifecycle forever.                                                                                                          | High / Medium-High     | **Repository fact:** ADR-0015 treats provider outcome as unknown until reconciled.                                               | Separates lifecycle from convergence. | **D8-R2** commits terminal retirement locally; external uncertainty becomes **Retirement needs attention**, never lifecycle authority. |
| “Publicly exposed” is inferred from incomplete analytics and an address is reused after an unobserved visit.                                                                                                        | Critical / Medium      | **External fact:** Vercel does not reserve deleted provider URLs; analytics cannot prove non-use.                                | Strengthens address allocation.       | **D8-R8** reserves a Core public handle from first assignment and forbids provider URLs as stable identity.                            |

### 3. Technical debt

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                        | Severity / likelihood | Evidence and reasoning                                                                                                                                                                         | Effect on D8            | Permanent correction and exact language                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Teams add `is_retired` or reuse `isActive` in CMS, Giving, provider metadata, and Postgres, producing dual ownership and untraceable drift.                   | Critical / High       | **Current behavior:** Payload Tenant has one mutable `isActive` field; no operational Site table exists. **Repository fact:** platform boundaries separate operational and presentation truth. | Changes the data model. | **D8-R11** creates one operational lifecycle source; other systems are projections/evidence. **D8-R19** removes legacy authority only after cutover. |
| A generic “retired rows are read-only” guard blocks legitimate refunds, disputes, recurring occurrences, reconciliation, retention disposal, and corrections. | Critical / High       | **Repository fact:** Phase 16 permits later source-owned financial effects; historical Site attribution remains frozen.                                                                        | Narrows “read-only.”    | **D8-R4–R6** prohibit new favorable Site activity while permitting owner-authorized historical, corrective, financial, and disposal effects.         |

### 4. Edge cases

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                           | Severity / likelihood | Evidence and reasoning                                                                                                    | Effect on D8                     | Permanent correction and exact language                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The current or only Site retires and an operating Tenant temporarily has no Default; Tenant offboarding is smuggled into Site retirement.                        | Critical / Medium     | **Repository fact:** D4 requires exactly one Default Site per operating Tenant/environment.                               | Adds a hard blocker.             | **D8-R3** and **D8-R7** block retirement of the current Default; Tenant offboarding stays separate.                                                                             |
| A private setup, duplicate display name, no replacement Site, split replacement, or multiple future presences does not fit a mandatory one-successor relation.   | Medium / High         | **Product judgment:** replacement cardinality is not yet evidenced and names are not identity.                            | Removes unnecessary cardinality. | **D8-R7** treats successor as descriptive; zero, one, or several future Sites may exist, but none inherits authority. **D8-R10** covers private setup.                          |
| Pre-admitted checkout, recurring installments, refunds, disputes, late webhooks, scheduled releases, open editors, or backdated imports arrive after retirement. | Critical / High       | **Repository fact:** D7 and Phase 16 separate admission from later effects; provider events may be late or repeated.      | Adds explicit residual rules.    | **D8-R4**, **D8-R5**, and **D8-R15** reject new favorable authority but preserve trusted effects admitted under the original owner. Caller backdating never bypasses the fence. |
| A custom domain expires and is acquired by someone else, or stale cookies/service workers survive a legitimate move.                                             | Critical / Medium     | **External fact:** ICANN notes expired domains may become available; historical control does not prove present ownership. | Strengthens domain safety.       | **D8-R8** requires fresh proof, immutable binding intervals, clean host admission, and tests stale browser state.                                                               |

### 5. Footguns

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                                  | Severity / likelihood  | Evidence and reasoning                                                                                                                                           | Effect on D8             | Permanent correction and exact language                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| A toggle, overflow action, bulk command, ambiguous “Deactivate,” or toast lets staff permanently retire the wrong Site/environment without understanding recurring and history effects. | Critical / Medium-High | **External fact:** WCAG 3.3.4 requires reversible, checked, or confirmed important data actions; WAI dialog guidance recommends least-destructive initial focus. | Changes UI shape.        | **D8-R16–R17** require a dedicated page, exact scope, consequence review, fresh auth, named button, Cancel focus, and persistent receipt.   |
| Typed-name confirmation appears safe but fails with long, duplicate, Unicode, RTL, or IDN names and does not prove authority.                                                           | Medium / High          | **Product judgment:** authorization, current scope proof, and semantic confirmation are stronger controls.                                                       | Removes ritual friction. | **D8-R16–R17** explicitly reject typed-name ritual and require exact scoped confirmation.                                                   |
| Support, automation, AI, stale jobs, or duplicate clicks execute an irreversible command.                                                                                               | Critical / Medium      | **Repository fact:** Phase 12 rejects ambient operator authority; assistant authority cannot exceed the human.                                                   | Adds command exclusions. | **D8-R12–R13** and **D8-R20** require explicit current human authority, semantic idempotency, and no bulk/scheduled/autonomous launch path. |

### 6. Tenant safety

**Material concern exists and is release-blocking.**

| What could go wrong and why it matters                                                                                                                                                              | Severity / likelihood  | Evidence and reasoning                                                                                            | Effect on D8                          | Permanent correction and exact language                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A bare Site ID, caller field, provider metadata value, cache key, lineage relation, or service-role query crosses Tenant/environment scope and retires, serves, or reassigns another tenant’s Site. | Critical / Medium-High | **Repository fact:** ADR-0028 and Phase 12 require structural exact-scope isolation and non-enumerating failures. | Adds mandatory structural safeguards. | **D8-R3**, **D8-R12**, and **D8-R14** bind every relation/command to trusted Tenant × environment × Site and require poison tests for privileged paths. |
| A retired Core handle or cache cohort is assigned to another Tenant and leaks the first Tenant’s content or trust.                                                                                  | Critical / Medium      | **Repository fact:** Site is a stable Tenant-owned attribution context.                                           | Confirms non-reuse.                   | **D8-R8** permanently tombstones assigned Core handles; **D8-R9** requires isolated, Site-qualified public behavior.                                    |

### 7. Database, RLS, and authorization safety

**Material concern exists and is release-blocking.**

| What could go wrong and why it matters                                                                                                                                                           | Severity / likelihood  | Evidence and reasoning                                                                                                                                                                       | Effect on D8                     | Permanent correction and exact language                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A mutable scope column, policy with only `USING`, cascade delete, owner/service-role bypass, or two concurrent heads permits cross-tenant movement, reactivation, or loss of referenced history. | Critical / Medium-High | **External fact:** PostgreSQL/Supabase distinguish grants, `USING`, `WITH CHECK`, owner bypass, and `FORCE RLS`. **Current behavior:** no production-safe operational Site lifecycle exists. | Defines the minimum safe schema. | Apply every bullet of **D8-R14**, including composite same-scope FKs, `ON DELETE RESTRICT`, unique CAS head, terminal transition constraint, revoked direct mutation, `FORCE RLS`, privileged-path checks, and indexed predicates. |
| Caller-controlled actor, time, expected scope, approval, or reason attribution forges authority or backdates around retirement.                                                                  | Critical / Medium      | **Repository fact:** sensitive mutations must use trusted server context.                                                                                                                    | Changes the mutation boundary.   | **D8-R12–R14** derive scope/actor/time/authority server-side and bind immutable input into the receipt/idempotency meaning.                                                                                                        |

### 8. Overengineering

**Material concern exists in plausible implementations; no material concern
remains after the explicit exclusions.**

| What could go wrong and why it matters                                                                                                                                                                                                                   | Severity / likelihood | Evidence and reasoning                                                                                       | Effect on D8         | Permanent correction and exact language                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A generic lifecycle workflow engine, scheduled/bulk retirement, automatic replacement/redirect, distributed provider transaction, universal second approval, or configurable retention matrix solves speculative cases and makes a rare command brittle. | Medium / High         | **Repository fact:** Core favors source-owned commands, small-ministry usability, and outbox reconciliation. | Simplifies Option 1. | **D8-R20** explicitly excludes these features. One terminal command, one receipt, existing owner contracts, and optional policy-based quorum are sufficient. |

### 9. UX/UI and user friction

**Material concern exists and is product-critical.**

| What could go wrong and why it matters                                                                                                                       | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                           | Effect on D8                               | Permanent correction and exact language                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff confuse Offline, Paused, Discard setup, Applying retirement, Retired, and Needs attention; they may believe recurring gifts stop or records disappear. | High / High           | **Repository fact:** platform principles require honest money/operation state. **External fact:** Givebutter and Donorbox separate campaign closure from recurring plans.                                        | Requires a complete information hierarchy. | **D8-R16–R17** provide the three-section page, exact readiness cards, recurring non-effect, terminal warning, and persistent result states. |
| The impact graph times out or omits hidden restricted dependencies, but the UI shows zero and enables retirement.                                            | Critical / Medium     | **Repository fact:** unknown safety proof must fail closed.                                                                                                                                                      | Adds a UX blocker, not a spinner forever.  | **D8-R3**, **D8-R12**, and **D8-R18** show safe counts/owners; stale, truncated, or unknown means **Review blockers** and disables commit.  |
| Mobile, keyboard, screen reader, low-bandwidth, RTL, long names, IDNs, time zones, or session expiry makes the irreversible flow unusable or misleading.     | High / Medium-High    | **External fact:** WCAG 2.2 and WAI dialog guidance; current Vercel interface guidance requires semantic controls, visible focus, labels, inline errors, status announcements, and internationalized formatting. | Adds release gates.                        | Apply the accessibility and internationalization contract in **D8-R16**, plus the production-shaped tests below.                            |

### 10. Source of truth, ownership, and domain invariants

**Material concern exists and is architecture-critical.**

| What could go wrong and why it matters                                                                                                                 | Severity / likelihood | Evidence and reasoning                                                                                                                                       | Effect on D8               | Permanent correction and exact language                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- | ------------------------------------------------------------------------------------------------------- |
| CMS, Giving, a provider, DNS, cache, or UI independently claims the Site is retired or active, producing circular synchronization and favorable drift. | Critical / High       | **Repository fact:** platform boundaries make Asym Postgres operational authority and CMS presentation authority; ADR-0029 forbids copied operational truth. | Adds the ownership matrix. | **D8-R11** is normative; lifecycle wins on disagreement, while every other owner retains its own facts. |
| “Successor” becomes a one-to-one FK that transfers hosts, content, permission, Giving, Stripe, or trust.                                               | Critical / Medium     | **Repository fact:** D1 says Site never owns financial identity; D5 copy creates independent drafts.                                                         | Narrows the term.          | **D8-R7** makes successor descriptive only and forbids implicit inheritance.                            |

Required invariants are: immutable Site/Tenant/environment identity; exactly one
current lifecycle head; retirement terminal; Site/Core handle never reused;
no favorable Site operation after the terminal fence; historical attribution
never reassigned; owner-authorized residual effects remain valid; Default Site
cardinality never breaks; and lifecycle never selects financial identity.

### 11. Hidden coupling

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                               | Severity / likelihood  | Evidence and reasoning                                                                                 | Effect on D8                      | Permanent correction and exact language                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Retirement cascades to CMS deletion, recurring cancellation, refund, message send, accounting mutation, domain transfer, Tenant closure, or provider-account change. | Critical / Medium-High | **Repository fact:** platform boundaries and ADR-0044 preserve separate owners and financial identity. | Narrows retirement effects.       | **D8-R5**, **D8-R7–R11**, and **D8-R20** forbid every implicit cross-owner effect; an owner may react only through its separately authorized contract. |
| Public and admin code treats CMS content absence or provider deletion as the lifecycle, so restoring an old backup revives the Site.                                 | Critical / Medium      | **Current behavior:** current resolver is Tenant-only and has no Site lifecycle.                       | Adds a read-boundary requirement. | **D8-R4**, **D8-R9**, and **D8-R19** require every favorable reader/writer to recheck the operational lifecycle head before commands ship.             |

### 12. Failure modes

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                                                          | Severity / likelihood  | Evidence and reasoning                                                                                                             | Effect on D8                           | Permanent correction and exact language                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The local commit succeeds but cache, CMS, DNS, domain, search, or provider cleanup fails, times out, or returns ambiguous success. Rolling back would revive an identity after staff were told it was terminal. | Critical / Medium-High | **Repository fact:** ADR-0015 requires reconcile-before-retry for unknown provider outcomes; ADR-0030 says purge is not isolation. | Defines forward-only failure handling. | **D8-R2**, **D8-R4**, and **D8-R15** keep the Site terminal, fail public behavior closed, show **Needs attention**, and retry/reconcile owner work idempotently. |
| The response is lost after commit or audit/outbox fails around the write.                                                                                                                                       | High / Medium          | **Repository fact:** accepted durable-command patterns couple business fact, receipt, and outbox.                                  | Adds atomicity/idempotency.            | **D8-R13** returns the original receipt on retry; audit/outbox failure aborts the local transaction.                                                             |
| External copies, search caches, screenshots, or third-party archives remain after Core cleanup.                                                                                                                 | Medium / High          | **Product judgment:** Core cannot truthfully recall uncontrolled copies.                                                           | Narrows success claims.                | **D8-R17** says Core stops serving; it never promises deletion from the Internet. Provider/external observations are scoped and timestamped.                     |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists and is release-blocking.**

| What could go wrong and why it matters                                                                                                                                               | Severity / likelihood  | Evidence and reasoning                                                                                       | Effect on D8                     | Permanent correction and exact language                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Two individually valid operations—retire/resume, retire/publish, retire/default-change, retire/domain-attach, retire/checkout-admit—jointly violate a terminal or Default invariant. | Critical / Medium-High | **Repository fact:** D4/D7 and accepted CAS patterns already identify independent heads and races.           | Adds one deterministic ordering. | **D8-R3–R4** and **D8-R15** require documented lock order/CAS, current digest, and one winner.                                                               |
| Scheduled or backdated retirement, late job completion, or replay changes the effective time or creates two terminal facts.                                                          | Critical / Medium      | **Repository fact:** server time and durable business-effect idempotency are established platform practices. | Clarifies valid transitions.     | **D8-R1**, **D8-R13**, and **D8-R20** allow only immediate not-retired → retired; no reverse/scheduled transition; same semantic replay returns one receipt. |

Preparation/cancellation is not lifecycle. The only D8 business transition is
`not retired → retired`. `retired` is terminal. Cleanup observations may move
among pending, partial, unknown, failed, and proved without changing lifecycle.

### 14. Data integrity risks

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                                           | Severity / likelihood | Evidence and reasoning                                                                       | Effect on D8                            | Permanent correction and exact language                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deleting the Site row, repointing old gifts/Pages/Source Codes, rewriting domain intervals, or reusing a handle changes historical meaning and can corrupt receipts, reporting, and donor trust. | Critical / Medium     | **Repository fact:** Phase 13 freezes attribution and uses retire-never-delete Source Codes. | Confirms identity/history preservation. | **D8-R5–R8** and **D8-R14** use immutable IDs/intervals, restricted deletion, and no historical reassignment.                                                        |
| Retired Sites disappear from all joins or remain in active selectors, causing broken reports or new work against a terminal Site.                                                                | High / High           | **Product judgment:** historical and favorable reads require different projections.          | Adds projection requirements.           | Historical views return a minimal authorized retired-Site label/ID; active/new selectors exclude it. This is required by **D8-R4**, **D8-R6**, and the proof matrix. |

### 15. Security and privacy risks

**Material concern exists and is release-blocking.**

| What could go wrong and why it matters                                                                                                                                    | Severity / likelihood  | Evidence and reasoning                                                                                                                                                                                            | Effect on D8                             | Permanent correction and exact language                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Permanent staff/public display of Site names, domain history, locations, reasons, analytics, content, or provider errors exposes missionaries or sensitive ministry work. | Critical / Medium-High | **Repository fact:** Phase 10 treats restricted-worker exposure as physical safety; ADR-0038 limits retained records. **External fact:** GDPR/ICO storage limitation requires purpose-based retention and review. | Materially narrows “history survives.”   | **D8-R6**, **D8-R9**, **D8-R12–R13**, and **D8-R18** require a PII-light tombstone, least privilege, non-enumerating public result, minimized notes, and redacted telemetry. |
| A privileged actor or support impersonation retires a sensitive Site without current authority, or impact details leak hidden dependencies.                               | Critical / Medium      | **Repository fact:** Phase 12 capabilities and server-derived scope are required.                                                                                                                                 | Adds fresh assurance and safe summaries. | **D8-R12** requires dedicated capability, current assignment, fresh authentication, exact human confirmation, and safe owner-labelled blockers.                              |
| Retirement is mistaken for privacy deletion or legal preservation and either erases required records or keeps prohibited data.                                            | Critical / Medium      | **Repository fact:** ADR-0038 separates record schedules, holds, and disposal.                                                                                                                                    | Changes semantics.                       | **D8-R6** explicitly preserves owner retention/erasure/hold authority.                                                                                                       |

### 16. Scalability and performance risks

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                                  | Severity / likelihood | Evidence and reasoning                                                                                                          | Effect on D8              | Permanent correction and exact language                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Synchronously scanning every Page, locale, route, domain, generation, cache key, gift, message, and provider call times out, holds locks, leaks cross-tenant data, or gives false zero. | High / Medium-High    | **Repository fact:** D7 requires short transactions and owner-bounded reconciliation; providers impose rate/propagation limits. | Changes execution design. | **D8-R18** uses bounded versioned owner summaries, blocks on truncation/unknown, keeps the commit short, and fans out through a durable outbox. |
| Event-history scans or retired rows burden every public request and active selector as tenants grow.                                                                                    | High / Medium         | **Product judgment:** hot gates need current-head/indexed lookup; history belongs off hot paths.                                | Adds capacity criteria.   | **D8-R14** requires indexed current heads; **D8-R18** requires declared maximums and production-shaped qualification.                           |

No unverified numeric scale claim is accepted. The only inherited timing promise
is D7’s already-recorded p99 five-second / hard thirty-second public containment
budget; Phase 24 must measure realistic maximum cardinalities before release.

### 17. Operational burden

**Material concern exists.**

| What could go wrong and why it matters                                                                                                            | Severity / likelihood | Evidence and reasoning                                                                                      | Effect on D8                  | Permanent correction and exact language                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff/support track cleanup in spreadsheets, manually inspect Vercel/DNS/cache dashboards, or use direct SQL repair when partial effects persist. | High / Medium-High    | **Repository fact:** platform principles reject manual glue as the normal path.                             | Adds one operational surface. | **D8-R2**, **D8-R13**, **D8-R15**, and **D8-R17** aggregate owner statuses on one durable receipt and expose one cause-owned repair action. Direct DB repair is not a normal recovery path. |
| Every retired Page/domain creates an individual operational task and overwhelms small ministries.                                                 | Medium / Medium       | **Product judgment:** bounded owner cohorts are sufficient; exceptions need cause ownership, not item spam. | Prevents task explosion.      | **D8-R18** batches idempotent owner work and creates human tasks only for persistent, actionable exceptions.                                                                                |

### 18. Observability and auditability gaps

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                       | Severity / likelihood | Evidence and reasoning                                                                 | Effect on D8                               | Permanent correction and exact language                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| A toast, provider response, cache purge, or log line cannot prove who permanently retired which Site under what authority/revision or what remained exposed. | High / High           | **Repository fact:** Core separates durable business history from technical telemetry. | Adds receipt and observation requirements. | **D8-R13** defines immutable business evidence; **D8-R18** defines correlation and bounded telemetry; the monitor table gives operational thresholds. |
| Partial cleanup is rounded to “Retired,” hiding donor/public exposure or a favorable late operation.                                                         | Critical / Medium     | **Repository fact:** platform principles require honest operational states.            | Changes completion projection.             | **D8-R2** separates terminal lifecycle from observed completion and makes unknown/partial **Needs attention**.                                        |

### 19. Dependency and integration risks

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                                                          | Severity / likelihood  | Evidence and reasoning                                                                                                                                       | Effect on D8                    | Permanent correction and exact language                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Vercel, DNS, registrars, caches, search engines, analytics, or Stripe disagree with Core; rate limits, duplicate/out-of-order callbacks, or schema changes turn a provider response into false lifecycle truth. | Critical / Medium-High | **External fact:** Vercel domain movement/proof is separate; provider-generated URLs are not reservable; payment/provider events can be delayed or repeated. | Keeps integrations subordinate. | **D8-R8**, **D8-R11**, and **D8-R15** make providers evidence, use fresh proof/readback, and reconcile unknown outcomes.       |
| A custom-domain move is inferred from prior binding or retirement and crosses tenants; a provider URL is marketed as permanent.                                                                                 | Critical / Medium      | **External fact:** current ownership must be re-proved; provider hostname allocation is outside Core control.                                                | Strengthens address semantics.  | Apply **D8-R8–R9**. Retirement neither transfers nor redirects a custom domain and never treats provider URL as Site identity. |

### 20. Migration, rollout, and upgrade risks

**Material concern exists and is release-blocking.**

| What could go wrong and why it matters                                                                                                                                          | Severity / likelihood | Evidence and reasoning                                                                                            | Effect on D8                            | Permanent correction and exact language                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current `cms.tenants.isActive=false`, missing `siteId`, absent provider state, or a tenant-only host is translated into a historical Site retirement and invents scope/history. | Critical / High       | **Current behavior:** public context `siteId` is null; resolver is Tenant-only; no operational Site table exists. | Blocks reuse/backfill of current flags. | **D8-R19** creates explicit current heads only from proved mappings, quarantines ambiguity, and forbids invented historical retirement.                    |
| A mixed-version reader ignores terminal facts after writers are enabled; rollback later restores old favorable behavior.                                                        | Critical / High       | **Repository fact:** adverse facts require all readers before writers and forward-only recovery.                  | Defines rollout/rollback.               | **D8-R19** deploys and proves every favorable gate first; after terminal facts exist, disable new commands if necessary but roll forward existing records. |

### 21. Testability, traceability, and proof

**Material concern exists in the draft; the corrected D8 is falsifiable.**

| What could go wrong and why it matters                                                                                                                              | Severity / likelihood | Evidence and reasoning                                                                                              | Effect on D8                        | Permanent correction and exact language                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A unit test around a Boolean claims “cannot reopen” while public routes, RLS, service roles, checkout, jobs, migration, privacy, and accessibility remain unproved. | Critical / High       | **Repository fact:** Core testing rules require public-seam, negative, integration, and production-shaped outcomes. | Adds the proof matrix below.        | Every future artifact and release must trace to **D8-R1–R20** and pass the specified positive, negative, boundary, concurrency, migration, performance, accessibility, and operational tests. |
| Terminology drifts among delete, archive, deactivate, discard, offline, pause, and retire.                                                                          | High / High           | **Repository fact:** `CONTEXT.md` is the ubiquitous-language authority.                                             | Requires immediate glossary update. | Add **Site Retirement**; `Discard setup` remains UI wording only; never call retirement archive/delete/pause.                                                                                 |

### 22. Other development hazards

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                             | Severity / likelihood  | Evidence and reasoning                                                                                                           | Effect on D8                                                     | Permanent correction and exact language                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 24 tickets or an ADR are created against unmerged Phase 22/23 route/content contracts, freezing conflicting authority or colliding with their ADR numbering. | High / High            | **Repository/GitHub fact:** PRs #1323 and #1340 are open/unmerged at review time; Phase 24 has no accepted PRD/OpenSpec package. | Does not block recording D8; blocks implementation-ready status. | Keep D8 in this grooming log/evidence. Reconcile predecessor authority before PRD/OpenSpec/design/tickets; assign the ADR only in that coherent package. |
| An assigned provider URL, Core handle, custom domain, display name, and Site ID are conflated, making non-reuse impossible to implement honestly.                  | Critical / Medium-High | **External fact:** provider hostnames and registrant-owned domains have different allocation/control semantics.                  | Changes terminology and schema.                                  | **D8-R8** separates opaque Site ID, Core-owned handle, private preview token, provider URL, custom domain, and display name.                             |
| The user expects a replacement redirect or content copy merely because the UI says “successor.”                                                                    | High / Medium          | **Repository fact:** D5 makes copy one-time/independent; proposed Phase 22 forbids inferred successor routes.                    | Narrows successor semantics.                                     | **D8-R7** states descriptive-only lineage and no automatic inheritance or redirect.                                                                      |

## Permanent acceptance and proof matrix

The future Phase 24 OpenSpec and release evidence MUST prove user-visible and
domain outcomes, not an implementation detail or happy-path UI alone.

### Positive and non-effect tests

- Retire an eligible operating Site and a never-public setup; each produces one
  terminal lifecycle version and one durable receipt for the exact scope.
- After commit, every active selector, activation, D7 recovery, publication,
  scheduled release, domain/host/locale/currency activation, ordinary
  configuration mutation, and new Site-public checkout admission rejects the
  retired lifecycle.
- A pre-admitted checkout may finish/fail/reconcile without creating a new
  admission; recurring occurrences, refunds, disputes, corrections, receipts,
  statements, and historical imports retain the original Site attribution.
- Prior contributions, commitments, receipts, accounting, Source Codes,
  publications, messages, and audits are byte-for-byte or semantically
  unchanged except for separately authorized append-only owner outcomes.
- Retirement changes no Legal Entity, Settlement Account Binding, Stripe
  account, settlement, bank, currency, designation, or accounting identity.
- The successor path creates a new opaque Site ID and private drafts only; it
  inherits no host, route, permission, Giving, provider, locale, currency,
  public generation, or trust authority.
- Authorized historical reporting resolves a minimal retired-Site projection;
  active/new-work selectors exclude it. Reused display names remain
  unambiguous through status plus a safe reference such as domain/retired date.
- A purpose-owned erasure, anonymization, hold, or verified disposal continues
  to work without deleting/reassigning the stable Site tombstone or financial
  reference.

### Negative, authorization, isolation, and privacy tests

- Current Default Site, stale/incomplete/truncated impact digest, website not
  observably offline, Giving not paused, active owner hold, expired assurance,
  missing capability, and session expiry all fail without a lifecycle write.
- Cross-Tenant, cross-environment, wrong-Site, guessed identifier, caller actor,
  caller time, caller role, caller approval, and provider-metadata poison
  attempts are non-enumerating and create no effect.
- RLS `USING`, `WITH CHECK`, grants, `FORCE RLS`, Data API, function owner,
  `SECURITY DEFINER` search path, service-role, direct SQL owner, and immutable
  scope/transition poison tests cannot cross scope, delete history, or create a
  favorable successor.
- Public, donor, missionary, ordinary editor, support impersonation,
  automation, scheduled, bulk, and AI-autonomous paths cannot retire a Site.
- The impact page reveals only details the actor may see; restricted dependencies
  become safe counts/owner blockers. Public responses expose no retirement
  reason, actor, internal ID, private Site name, location, content, or provider
  detail.
- A Core public handle assigned once cannot be assigned to another Site,
  Tenant, or environment. Provider-generated URLs are rejected as canonical
  Site identity. A moved custom domain requires fresh proof and cannot reuse
  old cookies/session/cache authority.
- No retired Giving/checkout URL forwards designation, amount, cadence,
  currency, Source Code, donor data, or other intent to another Site/fund.

### Boundary, concurrency, idempotency, and failure tests

- Retirement races Default transition, D7 resume, activation, publish/schedule,
  host attach/transfer, locale/currency activation, configuration update,
  checkout admission, message preparation, import, and duplicate retirement.
  Exactly one expected-revision ordering wins and every invariant remains true.
- A stale review returns **Review changes** and no partial terminal fact. A
  favorable job admitted before the fence finishes only when its owner contract
  allows; a stale favorable commit after the fence is rejected and observed.
- Same semantic idempotency key/input returns the original receipt; same key
  with changed scope, revision, digest, or reason conflicts; already retired
  replay creates no second lifecycle version.
- Lost client response, worker crash before/after outbox claim, duplicate and
  out-of-order effect delivery, provider timeout, accepted-but-lost provider
  response, rate limit, and prolonged provider outage converge or remain
  truthfully **Needs attention** without reactivation.
- Audit or outbox write failure aborts retirement. No network call occurs while
  lifecycle locks are held. Owner effects are retry-safe at the durable business
  effect, not merely an HTTP request.
- Every inventoried admitted host/locale and representative HTML, RSC/data,
  sitemap/feed, form, OG/share, redirect, and Site-qualified media cohort stops
  serving Site content adverse-first. Missed aliases/provider URLs/caches never
  round partial observation into success.

### Migration, performance, accessibility, and production-shaped tests

- Inventory current tenant-only host resolution, null `siteId`, Payload
  `isActive`, Page deletion, public cache/provider URLs, and all favorable Site
  readers/writers before migration; ambiguous mappings quarantine rather than
  invent Site or retirement history.
- Prove old-code/new-schema and new-code/old-schema compatibility during expand
  and shadow stages. Once retirement commands are enabled, prove no
  adverse-blind mixed-version path and no rollback that ignores a terminal fact.
- Prove old-code admission → new retirement deployment → delayed provider/
  browser return, including a final payment with a replayable old return path.
  Retirement remains blocked until an exact independent result identity/session
  is migrated, or payment finality plus durable receipt access and old-return
  expiry/retirement are source-proved. Rollback preserves result access and
  never reverses terminal facts.
- Qualify supported maximum Sites per Tenant, hosts/aliases, locales,
  currencies, routes/pages, impact dependencies, concurrent commands, and
  queued owner effects. The impact page remains bounded; the local transaction
  does not scan history or call a provider.
- Demonstrate public containment p99 within five seconds and no Site content
  after thirty seconds for the maximum qualified host/route cohort, including
  warm/cold cache, multiple regions, deployment transition, and provider
  degradation.
- Test keyboard-only, screen reader, touch, 320 CSS-pixel reflow, 200% zoom,
  forced colors/high contrast, reduced motion, slow/offline network, duplicate
  submit, back navigation, session expiry, visible focus, inline errors,
  `aria-live` result, and focus return.
- Test long/duplicate Unicode Site names, CJK, combining characters, RTL, IDN
  Unicode plus safe ASCII form, locale and timezone formatting, and narrow
  mobile action labels without truncating the irreversible consequence.
- Run comprehension/usability tests with representative occasional ministry
  administrators. Release requires participants to distinguish retirement from
  D7 suspension, identify that recurring gifts continue, identify that history
  is not reassigned, and know that reopening requires a new Site. The research
  protocol and pass threshold must be declared before testing, not chosen after
  results.

### Traceability rule

Every normative D8 clause MUST map through:

```text
Grill answer → CONTEXT glossary → final ADR (if warranted)
→ Phase 24 PRD → OpenSpec requirements/scenarios → design
→ GitHub tasks/dependencies → schema/commands/UI
→ tests → deployment qualification → release evidence
```

The Phase 24 package SHALL contain a machine-reviewable D8-R1–R20 traceability
table. Any conflict in terminology, state, scope, timing, cardinality,
authorization, retention, or non-effect blocks implementation until the owning
artifact is reconciled. Proposed Phase 22/23 text cannot silently become
accepted authority merely because D8 links to it.

## Named monitors and required response

Only residual runtime uncertainty belongs in monitoring. No invariant or
unresolved design decision is deferred to a monitor.

| Signal                                                | Threshold                                                                                                                                                  | Owner                                | Required response                                                                                                                                                                     |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `retired_site_favorable_effect_total`                 | Any serving recovery, publish, host/locale/currency activation, ordinary configuration success, or other favorable Site commit after the terminal revision | Site Lifecycle + Security on-call    | Declare P0, reapply exact D7 containment, stop the stale worker/path, preserve evidence, reconcile the illegal effect, and block rollout/recovery until negative replay proof passes. |
| `retired_site_public_content_probe_total`             | Any inventoried host/required route cohort serves Site content 30 seconds after retirement commit                                                          | Public Runtime on-call               | Declare P0, show **Retirement needs attention**, invoke provider/WAF quarantine, enumerate missed egress/cache cohorts, and keep the completion projection blocked.                   |
| `retired_site_public_gift_admission_total`            | Any new Site-public checkout admission ordered after the retirement/D7 admission fence                                                                     | Giving on-call                       | Declare a money-integrity P0, contain the exact admission path, preserve provider/contribution evidence, reconcile without blind cancellation, and prove no further admissions.       |
| `site_retirement_convergence_seconds`                 | p99 above 5 seconds for 15 minutes, or any required public cohort above 30 seconds                                                                         | Public Runtime owner                 | Stop favorable completion claims, inspect queue/edge/cache/provider health, execute the containment drill, and open one cause-owned incident.                                         |
| `site_retirement_cleanup_needs_attention_age_seconds` | Local owner work older than 5 minutes or external/provider work without new evidence for 24 hours                                                          | Site Operations owner                | Surface one owner-labelled repair action, inspect/replay idempotently, escalate provider-control unknown, and never reactivate the Site.                                              |
| `retired_site_handle_reassignment_total`              | Any attempted assignment; any accepted assignment is P0                                                                                                    | Domain owner + Security on-call      | Hard-fail/quarantine the host generation, halt address allocation rollout, preserve evidence, and repair only through a new non-conflicting handle/Site.                              |
| `site_retirement_default_invariant_violation_total`   | Any retired current Default or any operating Tenant/environment with zero or multiple current Defaults                                                     | Site Lifecycle + Permissions on-call | Declare P0, block retirement/default writers, preserve both CAS histories, restore the invariant through an authorized forward transition, never reactivate the retired Site.         |
| `site_retirement_unauthorized_attempt_total`          | Five denied attempts by one principal in 10 minutes or any cross-Tenant attempt                                                                            | Security on-call                     | Re-evaluate or revoke the session epoch, retain minimized audit evidence, investigate actor/device, and notify under the security policy.                                             |
| `retired_site_historical_reference_break_total`       | Any unresolved retired `site_id` in a required finance, receipt, attribution, or authorized report projection                                              | CRM/Data owner                       | Block release or affected reporting, repair the projection/FK, and never retarget the historical fact to another Site.                                                                |
| `retired_site_retention_policy_gap_total`             | Any retained class lacks an owner/schedule, exceeds a declared privacy ceiling, or disposal bypasses an active hold                                        | Records owner + Privacy owner        | Restrict access, stop unsafe disposal/exposure, mark **Needs records review**, and repair through the governed schedule without changing Site identity.                               |

## Ruthless synthesis — permanent path forward

### Must be resolved before D8 is recorded

Resolved in the corrected decision:

1. Terminality applies to Site identity and future favorable operation, not to
   every later source-owned write.
2. Minimum identity/history is non-reusable; content and PII retain their
   purpose-owned retention, hold, erasure, anonymization, and disposal rules.
3. The authoritative lifecycle becomes retired in one local commit; Applying /
   Needs attention / Retired are truthful convergence presentations, never
   provider-owned lifecycle.
4. D7 offline/Giving-paused state, current Default eligibility, current
   authorization, and a complete impact digest are rechecked at commit, while
   the terminal epoch also fences every race.
5. Core-owned handle, provider URL, custom domain, display name, and Site ID are
   separate concepts. Assigned Core handles are tombstoned; provider URLs are
   never identity; custom-domain movement always needs fresh proof.
6. The exact staff copy, public privacy-safe default, successor non-inheritance,
   financial non-effects, and accessibility requirements are no longer implied.

### Must enter the Phase 24 PRD, OpenSpec, and design

1. D8-R1–R20 verbatim or a formally mapped equivalent.
2. The ownership matrix, lifecycle/observation state tables, transition
   constraints, compare-and-set ordering, and owner effect contracts.
3. The schema/RLS/grants/service-role invariants, address tombstone and binding
   intervals, impact-digest interface, durable receipt/outbox, and retention
   boundary.
4. The exact staff/public UX, responsive/accessibility behavior, empty/error/
   stale/unknown states, international name/domain behavior, and comprehension
   criteria.
5. The full proof and traceability matrices plus declared capacity profile,
   containment budget, rollout gates, kill switch, and forward-only recovery.

### Required implementation order

1. Reconcile and accept the predecessor Site/host/route/content contracts; Phase
   24 must explicitly supersede stale Phase 2 `is_active`, inline-domain, and
   public-fallback wording.
2. Establish one operational Site identity/lifecycle authority, exact Default
   invariant, dedicated capability, composite tenant scope, RLS/grants, and
   minimum-history/retention contract.
3. Deploy indexed terminal-lifecycle checks into every favorable public, CMS,
   Giving, publication, domain/locale/currency, admin, message, import, and job
   seam before enabling a retirement writer.
4. Add versioned owner impact summaries, the short terminal command, receipt,
   outbox, idempotent cleanup/reconciliation, and public containment probes.
5. Ship the full-page staff UX in shadow/read-only mode; validate wording and
   comprehension with representative ministry administrators and accessibility
   users.
6. Prove the complete matrix at production-shaped capacity, then enable a small
   cohort. The kill switch stops new retirements but never ignores a committed
   terminal lifecycle.
7. Remove hard-delete, duplicate Boolean, and adverse-blind legacy paths only
   after live evidence shows no use.

### Risks permitted only as monitored residuals

The monitor table above names every permitted residual: missed favorable
effects, stale public content, post-fence Giving admission, slow convergence,
stuck cleanup, handle reassignment, Default invariant breach, unauthorized
attempts, broken historical projections, and retention-policy gaps. Each has a
signal, threshold, owner, and mandatory response. Provider/external copies that
Core cannot control are disclosed as bounded observations, never represented as
proof that the Internet forgot the Site.

## Research synthesis

### Repository authority

- [`CONTEXT.md`](../../../CONTEXT.md) defines Site, Default Site, Site Setup,
  Site Public Activation, Site Serving Suspension, Site Public Giving
  Admission, and the strict separation from financial identity.
- [Platform principles](../../../openspec/specs/platform-principles/spec.md)
  order tenant safety, permission correctness, operational/money truth, donor
  clarity, and convenience.
- [Platform boundaries](../../../openspec/specs/platform-boundaries/spec.md)
  make Asym Postgres authoritative for operational truth, CMS authoritative for
  public presentation, and sensitive mutations server-owned.
- [ADR-0028](../../adr/0028-defense-in-depth-public-isolation.md) requires one
  typed, fail-closed public isolation boundary and permanent negative tests.
- [ADR-0029](../../adr/0029-reference-not-copy-cms-operational.md) keeps
  CMS references from becoming copied operational authority.
- [ADR-0030](../../adr/0030-function-level-tagged-caching-publish-signal.md)
  says cache invalidation is not isolation and reserves Site/locale cache
  dimensions.
- [ADR-0038](../../adr/0038-purpose-owned-records-schedules-and-verified-disposal.md)
  says immutability does not mean permanence and requires purpose-owned
  retention, legal holds, and verified disposal.
- [ADR-0044](../../adr/0044-canonical-legal-entity-financial-boundary.md)
  separates Site context from Legal Entity and settlement identity.
- [ADR-0015](../../adr/0015-provider-control-loss-quarantine-and-proof-gated-recovery.md)
  requires provider-unknown quarantine, readback, and proof-gated recovery.

### Current behavior, not permanent authority

- `packages/api/src/cms/public/context.ts` reserves `siteId` but currently sets
  it to null.
- `apps/admin/src/cms/public/resolve-tenant.ts` resolves Tenant by host, not an
  operational Site, and uses privileged Payload reads.
- `apps/admin/src/cms/collections/tenants.ts` exposes one mutable tenant-wide
  `isActive` field and super-admin delete; neither is Site retirement.
- `apps/admin/src/cms/collections/pages.ts` has Tenant-scoped Pages and direct
  deletion but no Site lifecycle boundary.
- `supabase/migrations` has no production operational Site lifecycle table.
- Phase 2 identifies the intended shared opaque Site ID and frozen gift
  attribution but contains provisional `is_active`, inline-domain, and fallback
  wording that D4/D7/D8 supersede.
- Proposed PR #1323 route tombstones and PR #1340 reference-aware Trash provide
  useful patterns, but both are unmerged evidence rather than governing
  authority as of this review.

### Current external primary evidence

- [Givebutter campaign closure](https://help.givebutter.com/en/articles/1772204-how-to-close-or-unlist-a-campaign)
  separates unlisting/closure from existing recurring plans and disallows
  deletion of used campaigns.
- [Donorbox campaign archive](https://donorbox.zendesk.com/hc/en-us/articles/360020293232-How-do-I-delete-or-deactivate-a-donation-form-or-campaign)
  preserves used campaign history rather than deleting it.
- [Blackbaud donation-page guidance](https://help.blackbaud.com/docs/0/assets/guided-fundraising/content/donation-pages-create-a-donation-page.html)
  keeps recurring gifts separate from archived-page new-gift behavior. Its
  default-page redirect is not imported because Core forbids guessed fallback.
- [WordPress.com deletion](https://wordpress.com/support/delete-site/),
  [Wix Trash](https://support.wix.com/en/article/moving-a-site-to-trash), and
  [Webflow archive](https://help.webflow.com/hc/en-us/articles/33961282119443-Archive-a-site)
  demonstrate address/lifecycle recovery tradeoffs; they support using D7 for
  uncertainty but do not own Core's permanent Site semantics.
- [Vercel domain behavior](https://vercel.com/docs/domains/working-with-domains),
  [domain transfer](https://vercel.com/docs/domains/working-with-domains/transfer-your-domain),
  and [ownership claims](https://vercel.com/docs/domains/working-with-domains/claim-domain-ownership)
  show that provider URLs are not reservable identity and custom-domain
  movement/proof are separate operations.
- [Google URL-removal guidance](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors)
  supports a real not-found/gone outcome when no replacement exists; its
  [site-move guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
  warns against irrelevant mass redirects. Core chooses a privacy-safe 404 as
  the launch default to avoid exposing retired/unknown status; a 410 or public
  notice needs the later route-owner decision.
- [ICANN domain-renewal guidance](https://www.icann.org/en/system/files/files/renew-domain-name-before-expires-infographic-30nov18-en.pdf)
  confirms that expired custom domains can become available to someone else.
- [ICO storage-limitation guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/storage-limitation/)
  and [IRS nonprofit recordkeeping](https://www.irs.gov/charities-non-profits/eo-operational-requirements-recordkeeping-requirements-for-exempt-organizations)
  support preserving required business evidence without indefinite custody of
  every content byte or personal fact.
- [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
  and [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
  document policy/grant/owner-bypass behavior behind **D8-R14**.
- [WCAG 2.2 error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data)
  and [WAI modal-dialog guidance](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
  support explicit review, least-destructive initial focus, keyboard/focus
  behavior, and persistent error/status handling.

## Resolved judgments and remaining assumptions

Verified repository and external facts support terminal non-reuse, separate
financial owners, privacy-bounded history, fresh custom-domain proof, and the
accessible consequence review. Product judgments resolved here are:

- D7 is a required, visible safety stage before terminal commit, and D8 also
  atomically fences every favorable race at commit;
- operational lifecycle is immediately terminal locally; cleanup state is a
  separate derived presentation;
- assigned Core-owned handles are permanently tombstoned, while private preview
  tokens and provider-generated URLs are not public Site identity;
- the launch-safe retired/unknown public result is privacy-safe not-found, not a
  public explanation or guessed redirect; and
- successor is descriptive and may be absent or non-singular, never inherited
  authority.

No unresolved assumption blocks recording D8. Before implementation, research
must validate the exact staff wording and the declared host/dependency capacity
with representative ministry administrators and production-shaped data.
Failure does not weaken terminality, isolation, or historical integrity; it
requires a revised UX or capacity design and a new recorded decision.

## D76 reconciliation (2026-08-30)

ADR-0197 does not make Site retirement a move option. A retiring/retired source
or destination is ineligible. If a source Primary lacks a different qualified
replacement, staff must prepare one or complete D8 separately; D76 cannot pause,
retire, unpublish, or infer a successor. Stable Site identity/history and every
terminal retirement rule remain unchanged.
