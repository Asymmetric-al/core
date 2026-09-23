# Phase 24 D78 — Owner-qualified ordinary Page successor adversarial review

> **Status:** Completed `/grill-with-docs` decision evidence for D78. This is
> not a Phase 24 PRD, OpenSpec change, implementation plan, migration
> authorization, ticket specification, or production change.
>
> **Founder choice:** Option 2 — explicit owner-qualified equivalent Page
> successor.
>
> **Final disposition:** **Accept with required amendments.**
>
> **Review date:** 2026-08-31

## Final disposition

Option 2 is the best permanent direction, but the phrase “equivalent Page” is
too broad to become a data field or reusable domain fact. Core must instead
record one directional **Ordinary Page Successor Qualification** for one exact
historical address, one exact former Page release, and one different current
target Page release. It proves only that this old address may continue to this
target under the reviewed route generation. It does not merge Pages, declare
global equivalence, synchronize content, authorize another path, or create a
general redirect rule.

That amendment follows the strongest current practice:

- automatic continuity is appropriate when immutable identity proves the same
  Page changed address;
- a different Page requires an explicit semantic decision by its owner;
- no genuine replacement means a real not-found response; and
- the public effect must be one direct server-owned internal result, never a
  similarity fallback, arbitrary URL, chain, or provider rule.

The UX remains small. D77 supplies the exact collision pair before cutover;
ADR-0200 **Historical addresses** may reopen only that same fixed relation
afterward. One full-page review shows the former and current or exact D1-admitted
candidate results, hard scope facts, the plain-language semantic test, and one
initially unselected two-outcome RadioGroup. It adds no target search, Page-
purpose taxonomy, content diff, similarity score, AI, reason field, modal,
second approver, task, or workflow.

## Exact corrected decision to record

> **D78 — Owner-qualified exact ordinary Page succession.** For one D77
> ordinary-route collision in the same Tenant/environment—or ADR-0200 renewal of
> that same fixed relation after cutover—the ordinary Page owner may prepare one
> directional, address-scoped successor
> qualification from a previously public source Page to a different target Page
> using its current public release or one exact D1-admitted post-cutover
> candidate only when Core proves the same exact locale, Phase 23
> `general_page` family, public audience, Publication Reach, compatible safety
> class, exact releases/candidate digest, routes, Sites, and public generations.
> One currently
> authorized human with
> the Page owner's route-continuity effect on the source and authorized access
> to publish the target must review both exact production-faithful public
> releases and explicitly decide whether a person using the old address would
> find the same public subject, substantive purpose, and intended task. The
> choice starts unselected and is either **Use `<target Page>` for this
> address** or **Keep this address unavailable**. A slug, title, copied Page,
> template, content hash, taxonomy, analytics, search, or AI result never proves
> or preselects succession. The immutable relation is non-symmetric,
> non-transitive, non-bulk, and valid for only that source address and the exact
> reviewed evidence; changed evidence requires review again. It stores a stable
> internal Page identity, never a URL. D76 may activate pre-cutover proof; after
> cutover only the exact preserving D1 publication transaction may consume a same-
> relation candidate receipt. A serving Primary binding may serve the qualified target
> directly at the same path; a Redirect Site Domain or different target path
> compiles one direct final clean-`GET`/`HEAD` owner result to the current
> Primary route. No source query, fragment meaning, body, cookie, auth,
> attribution, return state, protected route, Vercel rule, Stripe/money effect,
> Page merge, content copy, provider mutation, or second route authority is
> created. ADR-0200/D79 preserves that exact revision/generation ceiling before
> cutover. After activation, the relation pins one opaque target Page/locale
> Page Purpose Continuity Version; each changed effective Page meaning-bearing
> dependency digest explicitly preserves the current version or declares that
> D80 must continue the candidate as a fresh independent private Page. D80
> leaves the source head/relations unchanged and the target inherits none.

## Evidence labels

- **Repository fact** — merged ADR, OpenSpec requirement, PRD, glossary, or
  founder-ratified Phase 24 decision in the current working package.
- **Current behavior** — code or schema present on `develop`; it does not prove
  intended Phase 22–24 behavior.
- **Proposed evidence** — open, unmerged Phase 22/23 documentation. It informs
  reconciliation but is not current runtime authority.
- **External fact** — current primary standard, provider, security,
  accessibility, search, or comparable-product documentation.
- **Product judgment** — the recommended bounded choice based on those facts.
- **Assumption** — a ministry/product claim requiring later user or production
  evidence.

## Current behavior, intended behavior, and best permanent path

| Layer                  | Verified current behavior                                                                                                                                           | Intended predecessor behavior                                                                         | Best permanent D78 path                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Ordinary Page identity | `Pages` has Tenant, mutable slug, title, drafts, layout/content; no required Site, locale lineage, immutable family, placement, or successor relation.              | Proposed ADR-0145 adds stable Site-scoped Page identity and immutable family.                         | Require the accepted Phase 23 identity/revision substrate; no tenant-only interim or D78 identity table.                    |
| Public read            | Payload read filters published content, sorts `-updatedAt`, and takes one latest row by slug.                                                                       | Proposed D1 compiles immutable Public Site Generations.                                               | D78 pins exact immutable source/target public releases and route generations; never mutable latest.                         |
| Same-Page move         | No current route history authority.                                                                                                                                 | Proposed ADR-0147 automatically preserves the same immutable ordinary Page within one Site/locale.    | Leave deterministic same-identity continuity automatic and outside D78.                                                     |
| Different-Page move    | No current relation or guarded repair.                                                                                                                              | Proposed ADR-0147 permits explicit same-Site/same-locale repair; D9 permits only exact owner proof.   | Reconcile one cross-Site D9-compatible qualification through the same Page route owner.                                     |
| Copied Page            | Current templates copy mutable layouts; no governed cross-Site identity contract.                                                                                   | Proposed ADR-0167 creates a fresh independent target Page identity with non-authoritative provenance. | Copy provenance may explain the pair but never proves or automates succession.                                              |
| Staff preview          | Current authenticated Page preview exists but is not an immutable generation comparison.                                                                            | Proposed Phase 23 pins private exact previews.                                                        | Reuse the qualified preview renderer for two exact public releases; no new diff/preview engine.                             |
| Authorization          | Current Payload access is Tenant-scoped and not the proposed exact Phase 12 Page-owner route effect.                                                                | Proposed ADR-0174 makes Phase 12 the sole permission brain and uses actor/service ports.              | Reuse that exact owner boundary on both Pages; Domain permission is insufficient; no new role/invite flow.                  |
| Public routing         | Current catch-all reads mutable content; `next.config.ts` includes host-blind permanent redirects including `/give`; global canonical metadata is host-insensitive. | Phase 5/D1/D77 require one owner-aware compiled route effect before content/cache.                    | Reader/adverse-first rollout; remove/fence bypasses; D78 never writes framework/Vercel redirect configuration.              |
| Domain roles           | No D72–D78 runtime exists.                                                                                                                                          | ADR-0193 gives one Primary Site Domain and redirect-only aliases; D76 moves one exact binding.        | Same-path direct service only on a serving Primary. Redirect-only roles compose one direct final route-owner result.        |
| Database/RLS           | No D78 table, constraints, policies, RPC, receipt, or migration exists.                                                                                             | D9/D77 require private append-only owner dispositions with exact scope.                               | One logical append-only owner relation/current head/receipt with same-scope integrity and privileged-command parity.        |
| OpenSpec               | No merged or active D78 implementation contract exists.                                                                                                             | Open PRs propose Phase 22/23 route behavior.                                                          | Record D78 now; amend Phase 23 ADR-0147, US23-003/OpenSpec, Phase 5, Phase 24 PRD, design, tasks, and tests together later. |

Fresh verification found `HEAD == origin/develop ==
7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Phase 22 PR #1323 remained
`OPEN/BLOCKED` at `70c50e8c97556c43be5543332fb0993b468b90ab` and Phase 23
PR #1340 remained `OPEN/BLOCKED` at
`9069dcad67f9630323474ca5ee8bcc85ca7bf0f6`.

## Current external evidence and bounded interpretation

| Primary source                                                                                                                                                                                                                         | Current finding                                                                                                                                                                              | D78 implication                                                                                                  | What Core does not import                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| [Google Site Moves](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes) (updated 2026-08-20)                                                                                                       | Map old URLs accurately to corresponding final URLs; consolidated content may receive several old URLs; irrelevant homepage redirects can confuse people and become soft 404s; avoid chains. | Different-Page succession is valid only for a genuine replacement and compiles direct to final.                  | Search guidance does not authorize ministry meaning or replace Page-owner proof.                                   |
| [Google crawl errors](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors) (updated 2025-12-18)                                                                                                   | Clear replacement: permanent redirect. No similar replacement: real `404`/`410`.                                                                                                             | D9 not-found is the safe default and uncertainty cannot be favorable.                                            | “Similar” is not a machine threshold or permission decision.                                                       |
| [HubSpot redirects](https://knowledge.hubspot.com/domains-and-urls/create-and-manage-url-redirects) (updated 2026-05-21)                                                                                                               | Same published item URL changes create immutable system redirects; different/manual redirects are separately permissioned and attributed.                                                    | Strong comparable evidence for automatic identity continuity versus explicit different-item judgment.            | HubSpot's arbitrary/external, bulk, flexible, priority, and status controls conflict with Core boundaries.         |
| [WordPress.com links](https://wordpress.com/support/permalinks-and-slugs/) (reviewed 2026-08-11)                                                                                                                                       | Changing one Page/post slug automatically preserves its old URL; separate content has separate URL identity.                                                                                 | Reinforces the same-identity/different-identity split.                                                           | WordPress smart/fuzzy redirects are not safe Core route authority.                                                 |
| [Webflow redirects](https://help.webflow.com/hc/en-us/articles/33961294898835-How-do-I-set-up-redirects-in-Webflow) (updated 2026-05-19)                                                                                               | Same-Page slug change can visibly create a 301; another path requires explicit mapping and publication.                                                                                      | Explicit review before public activation is mainstream.                                                          | Raw old/new path editing and provider publication do not own Core meaning.                                         |
| [Shopify redirects](https://help.shopify.com/en/manual/online-store/menus-and-links/url-redirect)                                                                                                                                      | Same-item handle changes offer continuity; a deleted item to a similar item is manual; protected paths and active-page precedence exist.                                                     | Keep protected owners excluded and never let a redirect shadow a current source route.                           | Commerce's broad manual redirect/import product and query behavior do not override D9.                             |
| [Blackbaud redirects](https://webfiles-sc1.blackbaud.com/files/support/netcommunity/q12012/us/spark/Content/BBNCURLRedirects.html) and [Neon One redirects](https://support.neonone.com/hc/en-us/articles/9811436298637-URL-Redirects) | Nonprofit CMS products expose page redirects for migrations; Neon gives live pages precedence.                                                                                               | Confirms the real nonprofit staff need while supporting source-route precedence.                                 | Their arbitrary URLs, wildcard/variables, CSV, external targets, and broad admin screens are rejected as footguns. |
| [OWASP redirect safety](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html)                                                                                                            | Prefer server-owned identifiers mapped to allowlisted targets; caller URLs create phishing/access risks.                                                                                     | Store target Page identity and resolve server-side.                                                              | No URL sanitizer or denylist substitutes for structural internal ownership.                                        |
| [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)                                                                                                                                                                                | Permanent redirects are cacheable; `308` preserves methods, but unsafe methods still require explicit application policy.                                                                    | Use Core's existing `308` contract for clean `GET`/`HEAD` only and warn that external caches are not recallable. | D78 never redirects form/payment/API mutations.                                                                    |
| [WCAG 2.2 On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input) and [Error Prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)                                               | Input should not unexpectedly change context; important changes need review/correction, but every ordinary edit does not need repeated confirmation.                                         | Initially unselected outcome plus one full-page review and later D76 confirmation is proportionate.              | No auto-submit, checkbox ceremony, nested modal, or repeated confirmation fatigue.                                 |
| [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) and [PostgreSQL policies](https://www.postgresql.org/docs/current/sql-createpolicy.html)                                                         | Grants and policies both matter; `UPDATE` needs old-row `USING` and new-row `WITH CHECK`; views/owners/service roles require care.                                                           | Keep mutation behind one server command and make append-only scope structural.                                   | RLS is defense in depth, not a second semantic-equivalence brain.                                                  |
| [Vercel project redirects](https://examples.vercel.com/docs/cli/redirects)                                                                                                                                                             | Project-level redirects apply across deployments/environments and take effect immediately.                                                                                                   | Shared-project Page semantics must not be written as Vercel rules.                                               | D78 performs zero provider route mutation; Vercel is execution/deployment evidence only.                           |

The nonprofit examples confirm the need, not their implementation quality.
Core deliberately remains narrower because Giving, identity, safety, multiple
Tenants, and one shared Vercel project make a generic redirect console unsafe.

## Assumptions and unresolved facts

- **Product judgment:** Ministries reasonably rebuild an ordinary About/contact/
  policy Page as a fresh Site-owned Page while intending to preserve its public
  address. This is plausible and supported by CMS migration products, but the
  frequency in Core tenants remains unmeasured. It affects prioritization, not
  the safety contract.
- **Assumption to verify in usability research:** an authorized Page publisher
  can apply the public-subject/purpose/task test without a taxonomy when shown
  exact releases and consequences. Representative ministry staff must prove
  comprehension; an AI score cannot substitute.
- **Resolved by D79:** exact reviewed revision/generation remains the safe
  pre-cutover ceiling. Post-activation ordinary releases may preserve one opaque
  Page Purpose Continuity Version through an explicit Page-owner Publish choice;
  material advancement requires fresh address-specific D78 proof. See ADR-0200.
- **Design-owned later:** physical table names, capability-key spelling,
  capacity limits, SLOs, and whether Page artifacts share a foreign-key-capable
  schema. D78 freezes invariants, not implementation names.

## Full adversarial category review

### 1. Problem validity, necessity, and alternatives

**Material concern exists — High severity / Medium likelihood.** **What could go
wrong:** Core could build a semantic redirect feature for a rare migration edge
case, or reject genuine rebuilt successors and unnecessarily break trusted
links. **Why it matters:** the first creates permanent complexity; the second
harms visitor continuity and search. **Evidence:** D77 identifies an actual
different-identity collision; proposed ADR-0167 deliberately creates fresh
cross-Site identities; Google, HubSpot, Webflow, Shopify, Blackbaud, and Neon all
recognize migration redirects. The strongest alternative is same immutable Page
identity only. **Decision effect:** narrows rather than invalidates Option 2.
**Permanent fix:** make D78 available only from one real D77 collision with a
fixed pair; keep same-Page automatic and no-successor not-found. **Exact spec
language:** D78-R1–R6, R11–R12, R22; AC1–AC16, AC27–AC28.

### 2. Brittleness

**Material concern exists — Critical / High.** **What could go wrong:** a
one-time attestation can silently depend on mutable titles, previews, routes,
permissions, or Page revisions and remain favorable after they change. **Why it
matters:** the old trusted address can serve different public meaning. **Evidence:**
current runtime reads mutable latest published rows; D9 requires exact heads;
proposed D1 uses immutable generations. **Decision effect:** Option 2 is valid
only when revision/generation-bound and CAS-checked. **Permanent fix:** pin every
source/target/owner/canonicalizer head, invalidate on drift, and fail unknown to
not-found. **Exact language:** D78-R4, R7, R13–R14, R17–R19; AC8–AC10,
AC23–AC26, AC32.

### 3. Technical debt

**Material concern exists — High / High.** **What could go wrong:** teams could
add a Page-purpose taxonomy, similarity engine, redirect collection, target
recommendation service, free-text reason store, or D78-specific resolver/adapters.
**Why it matters:** each duplicates Phase 23 Page/route ownership and becomes a
new migration, authorization, UI, testing, and operational surface. **Evidence:**
ADR-0147 already rejects a second redirect engine; D77 already owns comparison;
current CMS has no reliable purpose taxonomy. **Decision effect:** materially
narrows Option 2. **Permanent fix:** one append-only owner relation, one fixed-
pair review, existing preview/route/publication ports, and no semantic automation.
**Exact language:** D78-R2–R3, R6–R9, R15, R20–R22; AC2, AC11–AC18,
AC33, AC36–AC40.

### 4. Edge cases

**Material concern exists — Critical / High.** **What could go wrong:** Page to
Article, locale variants, target root, redirect-only domains, several old Pages
to one target, active source reuse, Unicode-equivalent paths, Page Trash,
unpublish, safety withdrawal, changed path, chained successors, or concurrent
cutover can produce wrong or ambiguous behavior. **Why it matters:** plausible
ministry migrations contain these cases and one wrong result may persist in
caches. **Evidence:** Phase 23 has two immutable ordinary families; D15 owns
canonicalization; D72–D77 own domain roles/routes; Google warns against chains.
**Decision effect:** requires exact family/locale/role/currentness rules.
**Permanent fix:** General Page-only launch, separate proof per source,
non-transitive relations, active-source precedence, stable Page target, direct
final compilation, and adverse-first target checks. **Exact language:** D78-R4,
R11–R13, R17–R19; AC6–AC10, AC27–AC32.

### 5. Footguns

**Material concern exists — Critical / High.** **What could go wrong:** staff
may approve because titles/paths look alike, mistake preparation for publication,
select a radio accidentally, or assume a copied Page stays synchronized. **Why
it matters:** a familiar URL can silently mislead visitors. **Evidence:** D9
rejects similarity; ADR-0167 makes copies independent; WCAG requires predictable
input effects. **Decision effect:** changes the draft UX. **Permanent fix:**
consequence first, exact former/proposed labels, plain semantic test, initially
unselected choices, explicit save, persistent prepared status, and no checkbox,
auto-submit, target picker, score, or hidden synchronization. **Exact language:**
D78-R5–R10; AC11–AC19.

### 6. Tenant safety

**Material concern exists — Critical / Medium.** **What could go wrong:** a
caller, cache, support path, or provider rule can bind a source in one Tenant/
Site to a target in another or leak restricted Page details to a Domain manager.
**Why it matters:** this is cross-Tenant content/brand disclosure and trusted-
address takeover. **Evidence:** Core principles make tenant safety primary;
current Pages are only Tenant-scoped; Vercel project routes are shared project
state. **Decision effect:** Option 2 requires structural same-scope proof and
permission-safe UX. **Permanent fix:** server-derived scope, composite same-
scope relationships, exact both-Page authorization, host/binding/cache
generation keys, private raw evidence, and zero provider routing writes.
**Exact language:** D78-R1, R4, R8, R15–R18; AC4–AC8, AC20–AC23, AC33–AC35.

### 7. Database, RLS, and authorization safety

**Material concern exists — Critical / High.** **What could go wrong:** nullable
scope, URL strings, application-only uniqueness, permissive grants, incomplete
`UPDATE` policies, a definer/view/service bypass, caller actor fields, or an
allowed update can move a relation into another scope. **Why it matters:** invalid
states become durable public routing authority. **Evidence:** PostgreSQL requires
constraints for cross-row integrity and distinguishes `USING` from `WITH CHECK`;
Supabase warns that views/owners/service roles can bypass expected RLS.
**Decision effect:** requires a privileged append-only command, not browser
CRUD. **Permanent fix:** non-null exact scope, one current head, stable Page
references, same-scope composite FK/typed digest validation, restrictive delete,
least grants/FORCE RLS, no update/delete on evidence, server-derived actor, and
privileged parity. **Exact language:** D78-R8, R14–R16; AC20–AC26, AC35.

### 8. Overengineering

**Material concern exists — High / High.** **What could go wrong:** “structured
proof” becomes a semantic ontology, multi-step wizard, approval queue, content-
diff service, embeddings index, or general redirect administration product.
**Why it matters:** complexity exceeds the narrow collision and burdens staff and
developers. **Evidence:** D77 already supplies the pair and D76 supplies final
publication; Phase 23 already supplies previews and route generation. **Decision
effect:** strongly narrows Option 2 without rejecting it. **Permanent fix:** one
question, two outcomes, one receipt, one owner relation; exact non-goals in
R6/R9/R22. **Exact language:** D78-R3, R5–R6, R9, R20, R22; AC11–AC18,
AC36, AC40.

### 9. UX/UI and user friction

**Material concern exists — High / High.** **What could go wrong:** a modal hides
evidence; giant live previews delay the safe action; side-by-side layout fails
at zoom/mobile; technical copy confuses staff; donors see a migration
interstitial or wrong brand. **Why it matters:** staff may choose mechanically
and visitors lose trust. **Evidence:** Core requires calm Base Maia/Zinc,
PageShell, progressive detail, 44px actions, 320px/400% proof; WAI requires
predictable controls. **Decision effect:** requires one full page and donor-
invisible routing. **Permanent fix:** consequence/hard facts first, on-demand
inert previews, semantic stacked order, descriptive links, initially unselected
RadioGroup, exact return focus, and public direct/404 result with no Asym/Vercel
copy. **Exact language:** D78-R7, R9–R11, R17–R18; AC13–AC19,
AC29–AC31, AC40.

### 10. Source of truth, ownership, and domain invariants

**Material concern exists — Critical / High.** **What could go wrong:** D78, the
UI, Payload redirects, Vercel, cache, search, or analytics can become a second
Page/route authority; “equivalent” can imply Page merge or transitive identity.
**Why it matters:** later edits and incident repair become irreconcilable.
**Evidence:** ADR-0145/0167 keep Page identity Site-owned and independent; D77
is derived only; Phase 5 owns runtime. **Decision effect:** replaces a global
equivalence concept with one directional route-owner qualification. **Permanent
fix:** explicit owner map and invariants, stable Page target, no raw URL,
non-symmetry/non-transitivity, and one current source disposition. **Exact
language:** D78-R2–R4, R11–R12, R15, R17–R18; AC2–AC12,
AC27–AC33.

### 11. Hidden coupling

**Material concern exists — High / Medium.** **What could go wrong:** D78 may
depend implicitly on Phase 23 same-Site query behavior, Payload preview internals,
D77 manifest shape, Vercel project rules, or a future purpose taxonomy. **Why it
matters:** upgrades or predecessor changes silently alter authority. **Evidence:**
proposed ADR-0147 currently preserves queries and limits repair to same Site;
D9/D78 are stricter and cross-Site. **Decision effect:** blocks implementation
until explicit predecessor amendments land. **Permanent fix:** typed Page-owner
port, provider-neutral immutable artifacts, no D78 adapter SPI, exact contract
versions, and traceable reconciliation. **Exact language:** D78-R2, R6–R8,
R17–R18, R21–R22; AC3, AC9–AC13, AC31–AC40.

### 12. Failure modes

**Material concern exists — Critical / High.** **What could go wrong:** preview
fails, permission changes, commit succeeds but response is lost, outbox/cache
lags, target is withdrawn after lookup, or D76/preserving D1 consumes a stale relation. **Why
it matters:** staff can retry into duplicates or public runtime can claim a
success it cannot safely serve. **Evidence:** Core/D9 requires unknown to fail
closed and receipts for ambiguous outcomes. **Decision effect:** requires
explicit state/failure copy and adverse-first runtime. **Permanent fix:** no
public effect on preparation, exact receipt resolution, current-head rechecks,
not-found on target ineligibility, cause-owned exceptions, and provider work
outside transactions. **Exact language:** D78-R7, R13–R14, R17–R20; AC13,
AC23–AC26, AC29–AC34.

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists — Critical / High.** **What could go wrong:** two
staff choose opposite outcomes, a Page changes between review and activation,
a request is retried with a different target, a correction rewrites history, or
a relation lives forever after meaning changes. **Why it matters:** two
individually valid actions can produce ambiguous public meaning. **Evidence:**
D1/D76 use expected-head CAS; permanent responses can be externally cached;
ADR-0200/D79 now governs post-activation releases. **Decision effect:** retains
the exact-revision pre-cutover ceiling and adds one-winner semantics plus the
post-activation continuity version. **Permanent fix:** append-only lifecycle,
semantic idempotency, expected-head lock/CAS, immutable receipts, correcting
successors, and D79's explicit preserve/advance rule. **Exact language:**
D78-R12–R14, R19; D79-R5–R18; AC23–AC28, AC32.

### 14. Data integrity risks

**Material concern exists — Critical / High.** **What could go wrong:** duplicate
current mappings, orphan target references, partial audit/outbox writes, stale
digests, source reuse, or accidental many-to-many equivalence corrupt routing
and reports. **Why it matters:** history and public results disagree and repair
requires direct DB work. **Evidence:** D9/D77 already require one exact current
effect and restrictive history. **Decision effect:** mandates structural
cardinality and atomic evidence. **Permanent fix:** one source head, immutable
versions, same-scope relationships, target admission, exact digest, atomic
outcome/receipt/audit/outbox, reconciliation, and no content duplication.
**Exact language:** D78-R3–R4, R12, R14–R16, R19; AC4–AC12,
AC23–AC28, AC35.

### 15. Security and privacy risks

**Material concern exists — Critical / Medium.** **What could go wrong:** raw
URL targets enable open redirects; unauthorized previews leak private content;
query/fragment/auth/cookie state crosses to a different Page; audit/logs retain
sensitive URLs or Page bodies. **Why it matters:** phishing, access bypass,
donor-intent leakage, or protected ministry disclosure can result. **Evidence:**
OWASP recommends server IDs/allowlists; D9 forbids context carry; D77 hides
protected routes. **Decision effect:** makes stable internal Page ID, minimal
evidence, inert preview, and no-context carry mandatory. **Permanent fix:**
server target resolution, exact authorization before rendering, private
`no-store` preview, field-minimized audit/telemetry, protected-owner exclusion,
and non-enumerating denial. **Exact language:** D78-R4, R7–R8, R15–R18;
AC5–AC13, AC20–AC22, AC30–AC35.

### 16. Scalability and performance risks

**Material concern exists — Medium / Medium.** **What could go wrong:** loading
two full Pages/media, checking permissions per field, storing large JSON proofs,
or compiling chains for thousands of historical paths makes review/runtime slow.
**Why it matters:** larger tenants, mobile staff, and low-bandwidth field teams
will suffer; request-time routing must remain bounded. **Evidence:** D77 already
uses keyset-paged exceptions and complete manifests; Phase 5 has an admitted
route budget; Core UI requires summary-first loading. **Decision effect:** no
architecture expansion but requires capacity proof. **Permanent fix:** one
indexed source-effect lookup, batched owner reads, small relational evidence,
server-rendered summary, on-demand previews, no request-time graph/similarity,
and ratified maximum-shape tests. **Exact language:** D78-R7, R17, R20–R21;
AC18–AC19, AC29–AC36.

### 17. Operational burden

**Material concern exists — High / Medium.** **What could go wrong:** staff must
review every route, operators maintain redirect/provider rules, or support
repairs ambiguous relations in SQL. **Why it matters:** nonprofit teams and Core
operations cannot sustain a migration project for routine moves. **Evidence:**
D77 already filters to true exceptions and D76 owns one cutover; provider tools
offer tempting parallel bulk controls. **Decision effect:** keeps review
exception-only and owner-native. **Permanent fix:** fixed D77 pair, safe
not-found one-click outcome, no bulk/provider console, typed correction command,
and actionable cause-owned status. **Exact language:** D78-R1, R8–R11,
R19–R22; AC1, AC11–AC22, AC33, AC37–AC40.

### 18. Observability and auditability gaps

**Material concern exists — High / High.** **What could go wrong:** logs say a
redirect exists but cannot prove who decided, what revisions were compared,
whether D76 consumed it, why it stopped, or whether runtime served it. **Why it
matters:** staff cannot explain/correct visitor harm and security cannot trace
scope breaches. **Evidence:** technical telemetry is not durable business
history; D9/D77 require receipts and owner evidence. **Decision effect:** makes
business audit and runtime monitors mandatory. **Permanent fix:** immutable
actor/criteria/evidence/outcome/activation/correction receipts plus minimized
metrics for unqualified effects, stale heads, wrong roles, chains, methods, and
projection lag. **Exact language:** D78-R13–R16, R19–R22; AC23–AC26,
AC33–AC40 and the monitor table.

### 19. Dependency and integration risks

**Material concern exists — High / High.** **What could go wrong:** open Phase
22/23 contracts remain incompatible, Payload provider behavior changes, Vercel
rules bypass Core, or external permanent caches retain a corrected result. **Why
it matters:** D78 can appear correct while a lower-precedence path still serves
different behavior. **Evidence:** PRs #1323/#1340 are open/blocked; current
Next redirects are host-blind; Vercel project rules span environments; RFC 9110
allows caching. **Decision effect:** blocks runtime activation, not the planning
decision. **Permanent fix:** reconcile ADR-0147/US23-003/OpenSpec, inventory and
fence bypasses, exact-pin provider adapters, zero D78 Vercel writes, and honest
cache warnings. **Exact language:** D78-R2, R17–R22; AC2–AC3,
AC29–AC40.

### 20. Migration, rollout, and upgrade risks

**Material concern exists — High / High.** **What could go wrong:** matching
slugs/titles or existing provider redirects are auto-backfilled; old readers
ignore D78; mixed code/schema treats missing proof as success; rollback deletes
active history. **Why it matters:** unsafe authority is introduced at the
highest-blast-radius moment. **Evidence:** current runtime has none of the
required generations; proposed predecessors are unmerged. **Decision effect:**
requires reader/adverse-first staged rollout. **Permanent fix:** expand
append-only schema, deploy denying readers, quarantine legacy rows, shadow-
compile, validate exact mappings, enable one cohort, preserve history/negative
effects on rollback, and use additive contract versions. **Exact language:**
D78-R2, R17, R19, R21–R22; AC3, AC32–AC40.

### 21. Testability, traceability, and proof

**Material concern exists — High / High.** **What could go wrong:** “same
purpose” remains vague, tests assert a row was inserted rather than visitor
behavior, or D78 differs across log/glossary/ADR/OpenSpec/tickets/code/tests.
**Why it matters:** subjective implementation and drift become inevitable.
**Evidence:** the current question has a criterion but no executable D78
contract; Phase 23 OpenSpec remains same-Site and query-preserving. **Decision
effect:** requires falsifiable requirements and complete traceability. **Permanent
fix:** D78-R1–R22, AC1–AC40, negative/authorization/concurrency/migration/a11y/
production-shaped tests, and exact cross-document terms. **Exact language:**
D78-R22; AC1–AC40.

### 22. Other development hazards

**Material concern exists — High / Medium.** **What could go wrong:** direct
same-path reuse ignores Primary/redirect-only role, permanent redirect copy says
Undo is instant, D78 becomes a Page editor, or a release claims every external
link was fixed. **Why it matters:** domain-role invariants, staff trust, and
rollback truth break outside the obvious data path. **Evidence:** ADR-0193
allows only one serving Primary; external caches/search/bookmarks are not Core
authority; D77 explicitly rejects complete-Internet claims. **Decision effect:**
adds role-aware route composition and copy constraints. **Permanent fix:**
Primary-only direct service, one direct final redirect for redirect-only roles,
no editing in review, and explicit limits on external convergence. **Exact
language:** D78-R9, R17–R22; AC18–AC19, AC29–AC34, AC39–AC40.

## Normative D78 requirements

### D78-R1 — Exact scope and no independent public effect

D78 applies only to either one ordinary Page collision surfaced by one current
D77 review inside one D76 same-Tenant/environment Site-to-Site Domain cutover,
or ADR-0200 post-cutover renewal of that same immutable source-address/target-
Page relation from **Historical addresses**. Opening, previewing, selecting,
saving, rejecting, canceling, or correcting a D78 decision changes no public
response until D76 or the exact preserving D1 publication command consumes the current
owner outcome.

### D78-R2 — Honest predecessor reconciliation

Runtime activation MUST remain unavailable until Phase 23 stable Site-owned
ordinary Page identities, exact locale lineages, public revisions, placements,
Public Site Generations, Phase 5 routing, D72–D77 Domain authority, and Phase 12
permissions are accepted and implemented. Proposed ADR-0147, US23-003, and the
Phase 23 OpenSpec MUST be amended for this narrow cross-Site, no-context-carry
case. Phase 22 ADR-0125 remains same-immutable-specialized-Page only.

### D78-R3 — One directional Ordinary Page Successor Qualification

The Page route owner owns one append-only, exact-source-address qualification
to one different stable target Page. It is not global Page equivalence, merge,
copy, inheritance, synchronization, canonical duplication, or a general
redirect record.

### D78-R4 — Complete structural eligibility

Favorable review requires current same Tenant/environment, exact locale,
Phase 23 `general_page` on both sides, public audience, exact Publication Reach,
compatible safety, exact prior
source publication, exact eligible current target publication or—only for the
same post-cutover relation—one exact D1-admitted publication-ready candidate,
stable internal target, current Sites/routes/generations/canonicalizer, and no protected owner,
additional/ambiguous collision beyond the reviewed pair, chain, loop, shadow,
stale, unknown, or adverse result.

### D78-R5 — One explicit human semantic criterion

One currently authorized human MUST decide whether a person using the old
address would find the same public subject, substantive purpose, and intended
task on the target. Updated presentation may qualify; merely related content,
homepage/category/search, different audience/locale/action, or uncertainty does
not. Uncertainty selects not-found.

### D78-R6 — No inference or semantic subsystem

Slug, title, copied/imported provenance, starter/template, block/body/hash,
taxonomy, search, backlinks, traffic, analytics, AI, embeddings, or similarity
MUST NOT prove, preselect, publish, renew, or become durable authority. D78 adds
no purpose taxonomy, score, diff, recommender, LLM, free-text reason, comments,
assignment, or approval workflow.

### D78-R7 — Exact evidence and safe previews

The review pins the exact prior source public revision and either the exact
current target public release or post-cutover D1-admitted candidate effective-
release dependency digest, plus routes, Sites, locale, audience/reach/safety
facts, renderer/contracts, and public generations. Previews are production-
faithful, authenticated, private/no-store/noindex, inert, effect-free,
individually loadable, and never substituted by mutable drafts, screenshots,
summaries, hashes, or reconstructed latest data.

### D78-R8 — Existing Page-owner authorization only

The sole Phase 12 resolver MUST prove the source Page route-continuity effect
and target read/publication scope at render, preview, and commit. Domain
permission, support/operator status, Payload account/role, URL possession,
caller IDs, or service credentials alone grant nothing. D78 creates no role,
invite, permission, assignment, or access-request flow.

### D78-R9 — One fixed-pair full-page staff review

D77 supplies the exact source/target pair before cutover. After cutover,
**Historical addresses** may reopen only the same immutable relation. **Review
Page continuity** opens one route-addressable full Page with consequence first,
hard facts, former/proposed releases, semantic criterion, and two outcomes. No
modal, Sheet, wizard, target search, arbitrary URL, redirect list, Page editing,
HTTP/provider controls, or bulk action appears.

### D78-R10 — Accessible, responsive, weak-network UX

The UI MUST use Core Base UI/base-maia/Zinc/PageShell patterns, semantic
headings/RadioGroup, descriptive preview links, 44px actions, visible focus,
textual statuses, URL bidi isolation/wrap/copy, stable former-then-proposed
order, 320px/400% reflow, keyboard/screen-reader/forced-color/reduced-motion/
localization/RTL proof, summary-first streaming, on-demand previews, one polite
meaningful announcement, and deterministic focus/refresh/back/resume behavior.

### D78-R11 — Two explicit outcomes and honest copy

The initially unselected RadioGroup offers **Use `<target Page>` for this
address** and **Keep this address unavailable**. Selection alone has no effect;
**Save this address decision** commits. Pre-cutover success says **prepared for
this domain move**, never Live. Post-cutover success says **Continuity prepared
for this Page update**, never restored/Live, and qualifies only fresh Core
requests after exact preserving D1 consumption; external cached redirects are not
recallable. Safe not-found stays available when favorable proof or preview is
unavailable.

### D78-R12 — Cardinality and non-transitivity

Each exact source route has one current disposition. A qualification is
directional, non-symmetric, non-transitive, and non-reusable. One target may
receive several sources only through separate explicit qualifications. Runtime
compiles every admitted source directly to the final stable target route.

### D78-R13 — Lifecycle and temporal ceiling

Prepared, consumed/active, superseded/adverse, and corrected history are
distinguishable immutable facts. Before D76, any effect-bearing source/target/
permission/safety/route/generation drift clears the choice and requires review.
After D76 activation, ADR-0200 governs later target releases: a changed effective
Page meaning-bearing dependency digest explicitly preserves the current opaque
Page Purpose Continuity Version or declares that D80 must create a fresh private
Page. Preserving requires a universal D78 assertion over every reviewed current
relation. D80 never advances the source head and its target inherits no D78/D79
state. Restore/copy cannot revive or inherit authority.

### D78-R14 — Atomicity, concurrency, and idempotency

One short expected-head transaction appends the owner outcome, current-head
successor, receipt, audit, and outbox fact together. Server context derives
scope/actor/capability/evidence. Identical replay returns one receipt; changed
input conflicts; opposite concurrent outcomes have one winner; lost response
resolves the receipt; no network/provider call occurs under locks.

### D78-R15 — Structural data integrity

Logical storage MUST retain non-null exact scope and source/target identities,
revisions, route/binding/public generations, canonical path/version, locale,
family, audience/reach/safety heads, criteria version, outcome, predecessor,
idempotency, actor epoch, receipt, and activation linkage. After activation,
ADR-0200 adds the non-null exact target Page/locale Page Purpose Continuity
Version while retaining the reviewed target revision as immutable evidence. It
stores no raw target URL or copied content. Same-store relationships use
composite same-scope integrity and restrictive delete; cross-store facts use
typed immutable references/digests revalidated by the owner port. Equality-
leading indexes support current source, target impact, receipt, outbox, and
runtime effect.

### D78-R16 — Grants, RLS, and privileged parity

Browser/Data API roles receive no direct mutation of qualification, disposition,
head, receipt, audit, or outbox facts. Applicable tables use least grants,
ENABLE/FORCE RLS, operation-correct `USING`/`WITH CHECK`, immutable scope, and
no update/delete path for append-only evidence. Owners/views/RPCs/definers/
service roles/workers/Payload/import/support/repair/AI repeat exact capability,
scope, expected-head, criteria, actor, and target checks; definer functions use
least privilege, schema qualification, and empty pinned `search_path`.

### D78-R17 — One owner-aware runtime and safe HTTP

Phase 5 resolves one indexed current route effect before mutable content,
framework redirects, or cache. Different-path navigation uses the governing
direct permanent response (`308`) only for clean `GET`/`HEAD`; unsafe methods
never redirect. Target Page identity resolves server-side to the final route.
No source query, fragment meaning, body, cookie, authorization, referrer
context, attribution, return state, raw URL, external hop, chain, or fallback
crosses.

### D78-R18 — Domain-role-aware public consequence

Direct same-path target service is allowed only when the moved hostname is a
current admitted serving Primary for the target Site. A Redirect Site Domain
remains redirect-only and composes one direct final owner-qualified result to
the target Primary; it never serves duplicate content. Binding role, host,
Site, locale, route effect, and public generations remain cache identity. A
not-public/private/moving/disconnected/unknown role produces no favorable
result.

### D78-R19 — Failure, adverse truth, correction, and rollback

Unknown authority is temporary unavailable before a durable negative; an
ineligible target yields D9 not-found, never another guessed target. Failures
remain cause-owned and visible to authorized staff. Corrections append; history
is not edited. Kill switch/rollback blocks new favorable decisions/cutovers and
preserves adverse results, current active safety, receipts, and history. Core
does not claim external permanent caches can be recalled.

### D78-R20 — Bounded performance and operational burden

D78 uses D77's exceptions and existing owner/preview ports, batched exact-head
reads, a small relational receipt, summary-first rendering, independent preview
loads, one indexed runtime effect, keyset paging upstream, and no request-time
graph/similarity/provider lookup. Ratified maximum Pages, paths, locales,
relations, concurrent reviews, preview size, and latency require production-
shaped evidence before activation.

### D78-R21 — Observability, migration, and rollout

Durable audit distinguishes qualification, negative outcome, D76 consumption,
adverse invalidation, and correction. Privacy-minimized monitors cover scope,
authority, stale evidence, wrong domain role, methods/context, chains, target
eligibility, outbox/projection, accessibility, and correction rate. Rollout is
reader/adverse-first, additive, shadowed, cohort-bounded, and provider-no-op.
Legacy redirects/copies are untrusted; no slug/title/content/AI backfill exists.

### D78-R22 — Traceability and non-goals

The decision MUST trace from log/glossary/ADR/review into Phase 23/24 PRDs,
Phase 5/12, OpenSpec, design, tasks, tickets, implementation, tests, migration,
and release evidence with identical terms and boundaries. D78 is not a Page
merge/move/copy/sync, redirect console, purpose ontology, AI feature, workflow,
provider integration, money/Stripe feature, or longer-lived target-revision
policy.

## Falsifiable acceptance criteria

1. **AC1 — Prepared only:** pre- or post-cutover D78 review/save/cancel changes
   no public, Domain, provider, cache, search, sitemap, content, notification,
   continuity head, or money effect until D76 or exact preserving D1 consumption.
2. **AC2 — Same Page stays automatic:** same immutable Page path continuity
   remains ADR-0147/D1-owned and creates no D78 work.
3. **AC3 — Prerequisite gate:** current runtime cannot enable D78; incompatible
   Phase 23/24 contracts fail visibly until reconciled.
4. **AC4 — Same Tenant/environment:** exact same scope qualifies; cross-scope
   attempts create no relation and disclose no target.
5. **AC5 — Exact Sites:** source and target Sites are server-derived and
   different; a caller cannot switch either.
6. **AC6 — Exact locale:** normalized exact BCP-47 equality is required;
   language-family or fallback similarity fails.
7. **AC7 — General Page only:** only `general_page`→`general_page` may qualify;
   Articles and every specialized family fail.
8. **AC8 — Protected owners excluded:** Giving/checkout/auth/callback/API/form/
   file/provider/protected/Phase 22 routes cannot enter or be targeted.
9. **AC9 — Exact public evidence:** source prior-public plus target current-
   public evidence are immutable and complete; only same-relation post-cutover
   renewal may use one exact D1-admitted publication-ready effective release,
   which has no effect before atomic consumption.
10. **AC10 — Hard mismatch:** audience, reach, safety, canonicalizer,
    publication, an additional/ambiguous collision, active shadow, chain, loop,
    unknown, or stale evidence removes favorable approval.
11. **AC11 — Fixed pair:** D77 supplies the pair before cutover; afterward only
    the existing relation may reopen it from **Historical addresses**. D78 has
    no target picker, search, arbitrary URL, or editable path.
12. **AC12 — No inference:** copied provenance/title/slug/body/hash/template/
    taxonomy/search/analytics/AI neither selects nor persists approval.
13. **AC13 — Exact preview:** each authorized exact release previews privately
    and inertly; draft/latest/screenshot fallback cannot approve.
14. **AC14 — Semantic criterion:** the UI asks the exact subject/purpose/task
    question with plain qualifying and non-qualifying examples.
15. **AC15 — Initially unselected:** neither favorable nor not-found outcome is
    preselected from system state, prior UI state, or heuristics.
16. **AC16 — Safe outcome:** **Keep this address unavailable** remains usable
    when favorable evidence/preview is absent or uncertain.
17. **AC17 — No on-input effect:** radio selection/preview does not save,
    publish, navigate, open another context, or move focus.
18. **AC18 — Summary first:** consequence and hard facts render before Page
    media; each preview loads independently and reserves layout.
19. **AC19 — Responsive/a11y:** 320px, 400%, keyboard, screen reader, visible
    focus, forced colors, reduced motion, long/RTL/IDN/URL, weak network, and
    meaningful status/focus tests pass.
20. **AC20 — Both-Page authorization:** source effect plus target read/publish
    scope is re-proved at render, preview, and commit.
21. **AC21 — Domain permission is insufficient:** a Domain manager without Page
    authority sees only D77's permission-safe owner blocker.
22. **AC22 — Trusted attribution:** Tenant/Sites/Pages/revisions/actor/capability/
    criteria/outcome heads derive from server context, never caller claims.
23. **AC23 — Atomic outcome:** relation or not-found, head, receipt, audit, and
    outbox commit together or none do. Post-cutover candidate qualification
    activates only in the exact preserving D1 release/continuity/route transaction;
    D80 consumes no D78 receipt.
24. **AC24 — Idempotent replay:** identical replay returns one result; changed
    target/evidence/outcome under the same semantic key conflicts.
25. **AC25 — Concurrent winner:** opposite authorized decisions yield one head;
    the loser sees current truth and cannot overwrite it.
26. **AC26 — Drift:** any effect-bearing drift before D76 or post-cutover preserving D1
    consumption yields **Page changed - Review again** and preserves the prior
    safe public/continuity authority.
27. **AC27 — No transitivity:** `A→B` plus `B→C` never emits `A→C`; a direct new
    owner qualification is required.
28. **AC28 — Separate many-to-one:** several old addresses may reach one target
    only after separate receipts; no bulk/select-all approval exists.
29. **AC29 — Domain role:** admitted Primary may serve same-path content
    directly; redirect-only alias never serves duplicate content; every not-
    public/private/moving/disconnected/unknown role has no favorable result.
30. **AC30 — Safe redirect:** different path/redirect-only role produces one
    final stable internal `308` for `GET`/`HEAD`; unsafe methods do not redirect.
31. **AC31 — No context carry:** query/body/cookie/auth/referrer/attribution/
    return state and fragment inheritance do not reach the target.
32. **AC32 — Target adverse:** unpublish/Trash/safety/locale/route/role/revision
    ineligibility produces not-found/blocked evidence, never another target.
33. **AC33 — Vercel no-op:** preparation/activation produces no Vercel Domain,
    project, route, redirect, rewrite, middleware, bulk, cache, or TLS mutation.
34. **AC34 — Money no-op:** no Stripe, checkout, Designation, amount, currency,
    cadence, gift, commitment, receipt, ledger, or donor attribution changes.
35. **AC35 — DB/RLS poison:** cross-scope FK, duplicate head, null scope,
    direct Data API DML, owner/view/definer/service bypass, actor spoof, and
    `USING`/`WITH CHECK` transformation attempts fail without partial facts.
36. **AC36 — Bounded shape:** maximum qualified route counts and preview sizes
    meet ratified SLOs with one indexed runtime lookup, batched owner reads, no
    N+1, no unbounded JSON scan, and no similarity/provider request.
37. **AC37 — No guessed migration:** legacy redirects/copies are quarantined;
    no slug/title/content/hash/AI backfill creates favorable authority.
38. **AC38 — Mixed-version safety:** old/new reader/writer/schema matrices never
    interpret missing criteria/head/role as favorable; rollback keeps adverse
    effects/history.
39. **AC39 — Trace:** log, glossary, ADR, review, PRD, OpenSpec, design, task,
    ticket, implementation, migration, tests, and release evidence use the same
    D78 relation, pre/post-cutover entries, scope, criteria, candidate rule,
    role, and non-goals.
40. **AC40 — Human proof:** representative ministry Page publishers, Domain
    managers without Page access, keyboard/screen-reader/mobile/zoom/slow-network
    users complete pre/post-cutover approve/not-found/stale/concurrent/denied
    journeys, explain the visitor result, fresh-request cache limit, and
    prepared-not-Live state without coaching, and reveal no need for a taxonomy,
    AI score, reason field, or second workflow.

## Source-of-truth map and invariants

| Fact                                       | Authority                                            | Consumers                               | Never authority                         |
| ------------------------------------------ | ---------------------------------------------------- | --------------------------------------- | --------------------------------------- |
| Page identity/family/Site/locale revisions | Phase 23 ordinary Page owner                         | D78, D1, preview, staff Page UI         | D78, slug/title, copied provenance      |
| Current public Page route/release          | Public Site Generation and Page route owner          | Phase 5, D77, D78, D76                  | mutable latest Payload, cache, provider |
| Public audience/reach/safety               | Phase 23 audience/reach + Phase 10/source safety     | D78 eligibility/runtime adverse guard   | staff checkbox, Page copy, AI           |
| Semantic succession for one address        | Ordinary Page route owner D78 qualification          | D77, D76, D1 route compiler             | D77 comparison, Domain manager, Vercel  |
| Domain role/binding                        | D72–D76 Domain authority                             | Phase 5, D78 route composition          | Page, URL string, provider project rule |
| Cutover                                    | D76 prepared cutover                                 | public binding heads, D77/D78           | D78 save, provider/DNS state            |
| Staff authority                            | Phase 12 exact capability resolver                   | Page owner command and projection       | Payload role, Domain permission alone   |
| Runtime result                             | Phase 5 indexed current route effect + adverse guard | visitor/donor HTTP response             | request input, CMS fallback, cache tag  |
| Business history                           | append-only qualification/disposition/receipt/audit  | staff evidence, incident/reconciliation | logs/traces/toasts                      |

Required invariants:

1. every Page identity belongs to one exact Tenant/environment/Site and one
   immutable family, and D78 launch admits only `general_page`;
2. one source route has at most one current owner disposition;
3. favorable D78 references one different stable internal target Page and no
   raw/external URL;
4. qualification is directional, path-specific, non-symmetric, non-transitive,
   non-bulk, and cannot merge or synchronize Pages;
5. source and target exact locale/family/audience/reach/safety/public evidence match;
6. protected/specialized owners are structurally ineligible;
7. the semantic human decision and every hard fact are both required;
8. before D76, D78 has no public effect and any effect-bearing drift blocks;
9. a serving Primary may serve direct; redirect-only roles never serve duplicate
   content and compile one final hop;
10. public runtime uses one current indexed owner effect before content/cache;
11. unknown/ineligible becomes temporary unavailable or D9 not-found, never a
    guessed Page; and
12. versions, receipts, actor attribution, corrections, and adverse history are
    immutable and never destructively rolled back.

## Staff and visitor UX specification

### Staff entry and hierarchy

D77 row action: **Review Page continuity**.

Page header:

> **Review Page continuity**  
> `stories.hoperelief.org/about`
>
> Decide whether this one old address should show Main Website's About Page
> after the domain moves. The safe alternative is Page not found.

Reading order:

1. **What visitors will experience** — exact address and direct/redirect/not-
   found consequence without HTTP/provider language.
2. **What Core already verified** — organization, environment, Site names,
   language, General Page family, public audience/reach, safety readiness, exact
   published-version labels. These are read-only hard facts, not semantic scores.
3. **Former Page** and **Page at this address after the move** — equal wide
   panels or stacked former-first groups, exact URLs, Site/locale, on-demand
   inert authenticated previews with descriptive names.
4. **Does this Page continue the same public meaning?** — the one subject/
   purpose/task explanation and initially unselected two-option RadioGroup.
5. **Save this address decision** — one commit; **Back to web address review**
   preserves D76/D77 position.

Do not render a six-row “same” table for visitor task/subject/purpose unless a
later owner contract actually owns those typed facts. D78's human judgment must
not be disguised as machine-computed truth. Hard facts may display **Matches**,
**Different**, or **Status unavailable** in text; one mismatch removes the
favorable option and links to the Page-owner surface.

### State copy

| State                        | Copy                                                                                                | Available action                                                             |
| ---------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Checking                     | **Checking the current Pages** — Core is verifying the exact published Pages and web-address facts. | Back only; safe outcome appears once source authority is known.              |
| Ready                        | **Ready to decide** — the required scope facts match. Review what each Page tells visitors.         | Two unselected outcomes.                                                     |
| Hard mismatch                | **These Pages cannot share this old address** — `<plain owner fact>` differs.                       | Open owner surface; Keep unavailable.                                        |
| Preview unavailable          | **Preview unavailable** — Core cannot prove the exact Page view right now.                          | Keep unavailable; Try again.                                                 |
| Drift                        | **Page changed - Review again** — one reviewed Page or web address changed.                         | Refresh exact evidence; prior radio cleared.                                 |
| Saving                       | **Saving this address decision**                                                                    | One busy submit; no duplicate.                                               |
| Pre-cutover favorable saved  | **Successor prepared for this domain move** — nothing is public yet.                                | Back to web address review.                                                  |
| Post-cutover favorable saved | **Continuity prepared for this Page update** — nothing is public yet.                               | Back to Historical addresses; preserving D1 must consume the exact receipt.  |
| Pre-cutover negative saved   | **Will show Page not found** — this old address will remain unavailable after the move.             | Back to web address review.                                                  |
| Post-cutover negative saved  | **Will show Page not found for fresh Core requests** — cached redirects cannot be recalled.         | Back to Historical addresses; preserving D1 must consume the exact receipt.  |
| Concurrent result            | **This address was decided while you were reviewing it**                                            | Show current authorized consequence; review again only through owner action. |
| Authority outage             | **We cannot verify Page continuity right now**                                                      | Preserve source; no favorable save.                                          |

### Visitor and donor behavior

- Before D76, nothing changes.
- After activation on a target Primary with the same path, visitors receive the
  target Page directly under complete tenant-native branding—no Asym/Vercel
  mark, interstitial, badge, migration notice, or identity explanation.
- If a redirect is required, it is one direct final internal result; visitors
  do not traverse a chain or see a transition screen.
- If no qualification exists or the target is ineligible, D9's neutral real
  not-found response appears with no Tenant/ministry history or guessed link.
- Giving/checkout/auth/forms/APIs/callbacks and any money/currency/cadence/
  designation context never enter D78, and donor intent never follows it.

## Failure, concurrency, migration, and test proof

Tests MUST cover positive General Page→General Page plus negative Article,
cross-family, cross-Tenant, cross-environment, cross-locale, private/restricted,
unpublished/Trash, active-source, target redirect/loop, reserved/protected,
raw/external URL, query/fragment, unsafe method, stale revision, stale
capability, role mismatch, and provider-bypass cases.

Concurrency tests race approval against not-found, target publish/unpublish/
move/Trash, source/target safety, locale change, binding role/cutover, capability
revocation, duplicate retry, lost response, worker/outbox replay, and D76
activation. Database tests prove structural current-head uniqueness, same-scope
relationships, restrictive deletion, grants/RLS/owner/view/RPC/definer/service
parity, immutable evidence, and no partial receipt/audit/outbox.

Production-shaped proof covers maximum paths/Pages/locales, several independent
source qualifications to one target, preview size/media failure, cold/warm/
multi-region route/cache behavior, 320px/400%/keyboard/screen reader/forced
colors/reduced motion/long localization/RTL/IDN, slow/offline/lost response,
session expiry, back/refresh/resume, focus return, and representative ministry
staff comprehension. Tests assert visible visitor/staff outcomes and invariants,
not merely row insertion or component snapshots.

## Named monitors and required responses

| Signal                                                      | Threshold                                                                                                           | Owner                         | Required response                                                                                                                                                  |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ordinary_page_successor_unqualified_positive_total`        | Any favorable direct/redirect result without one current D78 or same-identity owner proof                           | Public Runtime + Security     | P0; fence affected route/binding cohort to not-found, stop favorable writers/cutovers, preserve evidence, repair owner heads, and re-prove before enable.          |
| `ordinary_page_successor_cross_scope_total`                 | Any Tenant/environment/Site/locale/family mismatch admitted or disclosed                                            | Security/Authorization        | P0; quarantine scopes, revoke affected projections, stop writers, inspect grants/RLS/privileged history, and notify privacy owner.                                 |
| `ordinary_page_successor_protected_owner_total`             | Any D78 result for Giving/auth/callback/API/form/file/provider/protected/Phase 22 owner                             | Owning domain + Security      | P0; disable D78 cohort, preserve/reconcile requests, invoke owner-specific containment, never reroute.                                                             |
| `ordinary_page_successor_without_human_receipt_total`       | Any different-Page favorable effect without criteria-versioned human receipt                                        | Page/Public Routes            | P0; fail affected sources to not-found, block D76, and repair only through fresh owner review.                                                                     |
| `ordinary_page_successor_stale_evidence_total`              | Any favorable effect whose pinned revision/route/permission/safety/binding head is not current                      | Page/Public Runtime           | P0; adverse-fence exact effect, open owner exception, append correction, and inspect CAS/reader skew.                                                              |
| `ordinary_page_successor_chain_depth`                       | Any Core chain greater than one or any loop/transitive resolution                                                   | Public Routes                 | P0; withhold/fence effects, compile direct final owner relations, and pass graph-negative tests before re-enable.                                                  |
| `ordinary_page_successor_unsafe_method_total`               | Any D78 redirect or target reach for a method other than `GET`/`HEAD`                                               | Security + Public Runtime     | P0; disable route cohort, preserve request evidence without body leakage, and prove method isolation.                                                              |
| `ordinary_page_successor_context_carry_total`               | Any unapproved query, inherited fragment, body, cookie, auth, attribution, referrer, or return state reaches target | Privacy + Security            | P0; fence effect, stop sensitive logging, contain affected stores/sessions, and repair serializer/compiler.                                                        |
| `ordinary_page_successor_ineligible_target_favorable_total` | Any favorable response while target is unpublished, unsafe, wrong-locale/role, missing, or stale                    | Page + Public Runtime         | P0; fence the exact effect to not-found, stop favorable activation, preserve evidence, append a correcting owner result, and re-prove the target before re-enable. |
| `ordinary_page_successor_wrong_domain_role_total`           | Any redirect-only binding serves Page bytes or duplicates target origin                                             | Domain + Public Runtime       | P0; fence binding, restore redirect-only role, purge exact generation caches, and re-prove D72/D78 composition.                                                    |
| `ordinary_page_successor_vercel_mutation_total`             | Any D78-triggered Vercel project/bulk/deployment/middleware redirect or rewrite write                               | Hosting Platform + Security   | P0; halt D78/D76 rollout, remove through governed provider reconciliation, and prove Core remains sole route authority.                                            |
| `ordinary_page_successor_effect_backlog_age_seconds`        | p99 over 5 minutes or any item over 15 minutes                                                                      | Page/Public Operations        | Pause new favorable activation, retain safe prior/not-found effect, reconcile idempotently, and escalate owning outbox/cache cause.                                |
| `ordinary_page_successor_a11y_release_failure_total`        | Any unresolved critical WCAG 2.2/manual blocker in the D78 journeys                                                 | Accessibility owner           | Block release cohort; fix and manually reverify keyboard, screen reader, reflow, focus, and weak-network journeys.                                                 |
| `ordinary_page_successor_correction_rate`                   | Over 5% within 30 days with at least 20 activated D78 relations                                                     | Phase 24 Product + Page owner | Pause expansion, interview affected staff, inspect criteria/copy/pair quality, and improve UX/training—do not add AI auto-approval.                                |
| `ordinary_page_successor_review_usable_p95`                 | Exceeds the ratified launch usable-summary SLO for 3 consecutive 15-minute windows                                  | Web Studio                    | Pause cohort expansion, reduce critical bytes/queries, preserve safe outcome, and re-run production-shaped mobile/weak-network proof.                              |

## Ruthless synthesis — strongest path forward

### Resolved before recording D78

1. Record a directional address-scoped qualification, not global Page
   equivalence.
2. Keep Pages independent and Site-owned; D78 neither copies nor merges them.
3. Reuse the existing Page route owner, Phase 12 resolver, exact preview, D77
   pair, D1 compiler, Phase 5 runtime, and D76 cutover.
4. Make non-semantic eligibility structural; keep semantic meaning one explicit
   human decision with no classifier, score, ontology, AI, note, or workflow.
5. Pin exact releases and heads; uncertainty and drift are not-found/blocking.
6. Make route delivery Primary/redirect-role aware, direct, internal, clean,
   `GET`/`HEAD` only, context-free, and provider-no-op.
7. Preserve append-only same-scope evidence, strict authorization/RLS, one-
   winner idempotency, correction, rollback, and monitors.

### Required in the consolidated spec and design

1. Amend proposed Phase 23 ADR-0147, US23-003, and OpenSpec from same-Site
   different-Page repair to this exact cross-Site qualification and replace its
   query-preservation behavior with D9's no-context-carry boundary here.
2. Add `Ordinary Page Successor Qualification` to the domain model and preserve
   the D72/D78 Domain-role composition.
3. Define logical storage/constraints/indexes/transactions/RLS/privileged ports
   without prematurely freezing table or capability-key names.
4. Specify the full-page UX, exact copy/states, inert preview contract, public
   visitor results, accessibility, weak-network behavior, and no-provider/
   no-money effects.
5. Carry D78-R1–R22, AC1–AC40, invariants, monitors, and predecessor dependencies
   into tasks/tickets/test evidence.

### Implementation safeguards required before activation

1. Land stable Site-owned Page identities/public generations and one owner-aware
   adverse-first reader before any D78 writer.
2. Inventory/fence current host-blind Next/Vercel/Payload redirect and mutable
   catch-all paths.
3. Implement pure preparation and one atomic Page-owner command with exact-head
   receipts, then shadow-compile without public effect.
4. Prove database/RLS/privileged parity, route/method/context negatives,
   concurrent/adverse races, preview isolation, maximum shape, and human/a11y
   journeys.
5. Enable one Tenant cohort, observe all named signals, and expand only after
   the ratified release gate passes.

### Monitor rather than build now

Only the named correction-rate and usable-summary signals may justify later UX
changes. They have thresholds, owners, and responses above. Neither can justify
automatic semantic approval, AI, a purpose ontology, or a general redirect
product without a new explicit decision.

## Traceability and repository status

- Decision: D78 in the Phase 24 decision log.
- Domain term: `CONTEXT.md` **Ordinary Page Successor Qualification**.
- Architecture: ADR-0199.
- Evidence: this review.
- Related authority: D9, D72–D77, ADR-0193, ADR-0197, ADR-0198, Phase 5, Phase
  12, proposed Phase 23 ADR-0145/0147/0167/0174, and proposed Phase 22 ADR-0125.
- Future artifacts: consolidated Phase 24 PRD/OpenSpec/design/tasks/tickets/code/
  migrations/tests/release proof. None is authorized by this grooming decision.

Current `develop` cannot implement D78 and no runtime, schema, migration,
Supabase policy, OpenSpec change, ticket, Vercel/Stripe/DNS request, deployment,
or production state changed during this decision. The working tree already
contained the user's Phase 24 documentation and remains intentionally dirty.

## D80 resolution amendment

D80 resolves a declared material change by creating a fresh independent private
Page under ADR-0201. It publishes nothing, never advances the D78 target's
continuity head, consumes no D78 receipt, and transfers no relation/version to
the new Page. D78 post-cutover preparation is consumed only by an ordinary
preserving D1 Page release. D81 now decides only the source private Working
Revision after the D80 handoff.

## References

- [ADR-0200](../../adr/0200-stable-page-identity-with-purpose-continuity-versions.md)
- [ADR-0201](../../adr/0201-material-purpose-changes-create-independent-pages.md)
- [D80 adversarial review](./phase-24-d80-material-purpose-new-page-adversarial-review.md)
- [D79 adversarial review](./phase-24-d79-stable-page-purpose-continuity-adversarial-review.md)
- [ADR-0199](../../adr/0199-owner-qualified-exact-ordinary-page-succession.md)
- [ADR-0198](../../adr/0198-critical-path-gated-exception-led-domain-move-route-review.md)
- [D77 adversarial review](./phase-24-d77-critical-path-exception-led-domain-move-route-adversarial-review.md)
- [D9 adversarial review](./phase-24-d9-retired-address-disposition-adversarial-review.md)
- [Phase 24 decision log](./phase-24-multi-site-management-decision-log.md)
- [Web Studio living spec](../../guides/architecture/web-studio-living-spec.md)
