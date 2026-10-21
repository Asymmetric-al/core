# D12 — organization-managed missionary resource library

**Disposition: Accept with required amendments.** The founder selected
**A — Organization-managed library**, emphasizing clean, easy, understandable,
clear and beautiful UX and the complete user journey. Recorded October 16,
2026 UTC against baseline `9cada8f3d8ab59db391d3fd20df77fcadeb09813`.

The product choice is selected. Detailed design below is a reviewed recommendation,
not separately ratified wording or implemented behavior. Earlier decisions retain
their individual statuses. This research session changes no formal owner/spec,
application, dependency, database, publication or ticket.

## Decision

> The initial missionary resource library is managed by authorized organization
> curators. Missionaries can find and use resources currently available to them;
> the ordinary missionary journey has no upload or submission workflow. A person
> separately authorized to curate retains that authority in its proper context.
>
> Provide one clear Resources entry with useful descriptions, simple search and
> direct access to qualified content. Keep browsing, opening and recovery usable
> on phones and constrained connections. Do not show unavailable authoring controls.
>
> Complete the organization curator's preparation, publication, correction and
> withdrawal journey. Publishing to the library is deliberate and audience-bound;
> uploading a file or passing a scan does not publish it or make it public.
>
> Reuse P29 document custody and P12 current authorization. Resource publication
> meaning belongs to the resource-purpose owner, not a folder or storage bucket.
> Removing availability preserves required history, retention and independent uses.

This selects a useful curated library, not a new LMS, compulsory reading program,
social feed, submission queue, public CMS, storage provider or analytics product.
Regional discovery is a separate next question. The exact resource publication
contract needs a bounded later owner amendment; it is not an existing producer
merely because P29 can store files.

## The smallest complete journey

**Enter and browse.** One **Resources** entry leads to **Resources from
[Organization]**. Use calm, text-first rows with a descriptive title, a short
explanation of what the resource helps with, and relevant format/language metadata.
Show known file size before download. An illustrative row, not an observed demand:

```text
Resources
Guides and materials provided by [Organization]

Search resources [                         ]

Preparing for a support conversation
A guide to planning and following up on a conversation.
PDF · English · [verified file size]
```

The title is the primary link; use a clearly named Download action where that is
the actual behavior. Do not add a mandatory preview modal, forced tour, decorative
hero or repeated Open buttons with indistinguishable accessible names. Small
category/language filters are justified only by the actual collection; no empty
filter panels or category-management platform. Categories organize, never grant
access. These presentation recommendations do not import Phase 23's Site Topic
Profile into an internal library.

**Find and open.** Search authorized titles/descriptions, with bounded results
and a clear reset when filters apply. Opening uses the qualified current content
or reader. Preserve the search, filter and list position on return, but re-prove
access before reusing protected results. Fetch large content only on deliberate
open; do not autoplay or preload entire files. If the supported profile admits
external links, identify the destination and provide ordinary safe navigation,
not a new embed, scraper or credential-sharing integration.

**Recover honestly.** Distinguish No resources available, No matching resources,
and Couldn't load resources — Retry. An empty permitted result says nothing about
hidden resources. If an old link is withdrawn or no longer authorized, show a safe
unavailable state and Back to resources without exposing protected names/reasons.
Retrying a temporary load failure does not reset the user's browsing context.
No Request access or Ask a curator button appears unless its real owner workflow
already exists and is authorized; do not invent an inbox to fill an empty state.

**Maintain.** In the authorized organization management context, the curator
prepares the description, qualified content/version and permitted audience,
reviews the missionary-facing result, then deliberately publishes. Show source
upload/scan/rights failures there with actionable recovery. Correction and
withdrawal remain discoverable beside the item; no routine additional approver
is required by this decision. Existing safety/permission rules still apply.
The current published version remains only while it is independently safe and
authorized; a failed replacement cannot silently swap it for incomplete content.
Confirmed withdrawal removes future library availability, not retained bytes or
independent uses. An unknown publish/withdraw outcome is recovered from the
authoritative status before retry. Preserve safe drafts on failure.

**Visual and accessible quality.** Reuse Core's `base-maia`, Base UI primitives,
semantic Zinc tokens, shared PageHeader, list/item and pagination patterns. Use
clear hierarchy, generous spacing, legible titles and restrained metadata. Support
keyboard and screen-reader navigation, visible focus, touch targets, 320 CSS-pixel
reflow, 400% zoom, long/localized text and reduced motion. Announce meaningful
result/loading/error changes without moving focus on each keystroke. Accessibility
includes the content itself: supported documents/media need usable reading order,
text alternatives or captions/transcripts as applicable. Do not claim that an
accessible list repairs an inaccessible PDF. Show language honestly; do not imply
automatic translation or offline availability.

## Exact requirements and source boundaries

**C01 — Curation authority.** The resource-purpose source owns the catalog entry,
publication meaning, current content/version selection and audience. P28 must
qualify that bounded native source contract during formal design; P29 does not
implicitly supply it. Curator is a responsibility under existing permissions,
not a new universal staff role or permission engine. Ordinary missionary library
access grants no create/publish/edit rights. Independent curator rights remain
valid only in their authorized context.

**C02 — One custody and access model.** P29 owns admitted bytes, immutable byte
identity/version, upload integrity, quarantine, retrieval and policy-governed
disposition; P10 supplies safety/classification and P12 current capabilities.
Bind the published entry to the exact qualified version or source release.
Changing a file path, folder, label or attachment must not silently publish new
content. No duplicate storage/CMS or raw bucket path becomes product authority.

**C03 — Private discovery and retrieval.** Apply current tenant, applicable
entity/purpose, audience and source conditions before enumeration, search matches,
counts, filters, filenames, thumbnails, previews and byte release. Internal
publication is not public release. Use the same current P12 context through
all reached service, storage and cache paths. A retained result or old URL cannot
substitute for authority; other tenants/hats cannot widen the request.

**C04 — Prove delivery behavior, not URL labels.** Qualify the existing P29
private retrieval path against real provider/browser/CDN behavior. Do not promise
current revocation from a signed URL alone or assume changing Auth keys invalidates
it. A private profile requiring current authorization must use requester-bound,
authorization-checked delivery and cache behavior that preserves that contract;
do not expose reusable bearer URLs as a shortcut. Withdrawal fences new discovery
and retrieval through that library publication/purpose without deleting held/shared
bytes; independent currently authorized uses remain governed by their owners.
Removing an external-link entry removes its library availability, not the external
destination or an already-known public URL. Bytes already delivered cannot be
recalled. This is a requirement on the existing custody owner, not a second
file-serving platform or a claim that the runtime already satisfies it.

**C05 — Safe publication lifecycle.** Distinguish prepared/unpublished, currently
published and withdrawn resource meaning from byte processing/quarantine state.
Publish/correct/replace/withdraw through the authoritative version-checked command
with trusted actor/scope, semantic retry identity and attributed durable history.
Recheck current content/rights before commit and release. Stale replacements or
retries cannot republish a withdrawn item or widen its audience. Deliberate later
publication requires current authority and review. Withdrawal is not deletion;
source holds, retention, prior versions and independent references retain meaning.

**C06 — Database safeguards.** Later schema design must enforce stable source
identity, same-tenant relationships to content/version/audience, valid required
references and state combinations, and an unambiguous current publication.
Unknown legacy ownership/classification/publication never defaults to visible.
Inspect table grants, actual RLS, both allowed old rows and proposed new rows,
views/RPC/function privileges and service paths. Caller input cannot set trusted
tenant/actor/publisher/audit attribution or rebind scope. Database isolation and
constraints complement the current source/P12 decision; no client-side filtering
or role label is an authorization boundary. No table names, limits or new generic
workflow schema are frozen by this research decision.

**C07 — Truthful compact UX.** Deliver the browse/search/open/return/recovery and
curator maintenance journeys above. Render controls from current capabilities;
server checks still govern stale screens. Show Updated only for the relevant
published content change and Reviewed only for an actual review. Do not equate a
download/open with reading, comprehension or course completion. Opening creates no
subscription, assigned task, notification or coaching visibility.

**C08 — Bounded useful retrieval.** Search/paginate the permitted corpus on the
server; do not download all files/rows to filter locally. Use existing exact-scope
indexes/query infrastructure and stable ordering. Fetch content lazily; avoid
per-result file signing and unnecessary thumbnail work. Supported types, size
limits and actual workload budgets belong to the qualified P29/source profile,
not arbitrary research numbers. No vector search, AI recommendations or full-text
document extraction dependency is selected.

**C09 — Operations and rollout.** Assign accountable organization curation and
source/custody incident ownership. Record relevant publish/replace/withdraw
history separately from technical logs; use P29's classification-required access
audit without logging file bodies, signed tokens or private queries by default.
Before activation, census reached files/providers and legacy public links;
migrate only source-qualified entries with exact byte/version provenance.
Mixed clients, backfill, rollback/restore and search/cache rebuilds must not
resurrect withdrawn or unauthorized entries. Safe disable preserves audit/holds.

**C10 — Traceability and proof.** Carry D12/C01–C10 and P01–P10 below into later
authorized owner/OpenSpec/design/tests. Qualify the resource-purpose contract and
P29 access profile before shipping dependent UI. Confirm usability with actual
missionaries/curators and representative content; recommendations and component
availability do not prove task success, accessibility or current implementation.

## Focused adversarial review

Likelihood is conditional engineering judgment, not an observed incident rate.
Each requirement referenced below is exact prevention language, not a new concern
left for the founder to reconstruct.

| Concern                                                    | What could go wrong and why it matters                                                                                                            | Severity / likelihood without prevention           | Evidence; effect on A                                                                                                      | Permanent fix and exact amendment                                                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| R01 — Library without a publishing owner                   | A file folder becomes publication authority, or every staff member can publish; stale/unreviewed resources reach users.                           | High / plausible                                   | P29 separates custody from business meaning; narrows implementation, preserves A.                                          | Qualify the bounded resource-purpose source and complete curator journey: C01/C02/C05, P01/P04/P05.                      |
| R02 — Private material leaks through discovery or delivery | A hidden filename, facet, thumbnail or cached signed URL exposes material after access ends or across tenants.                                    | High / plausible                                   | P12 current context, P29 metadata/byte requirements and current Supabase delivery docs; requires exact release safeguards. | Current source authorization across every representation and qualified delivery/cache: C03/C04/C06, P02/P03/P06.         |
| R03 — Replacement/withdrawal corrupts meaning              | An upload swaps reviewed content, retries republish a withdrawn item, or removal deletes bytes used elsewhere.                                    | High / plausible                                   | P29 immutable version/retention separation; adds explicit lifecycle.                                                       | Exact content binding, conditional atomic mutation/audit, scoped withdrawal: C02/C05/C06/C09, P04/P05/P09.               |
| R04 — Attractive but unusable browsing                     | Heavy previews, vague labels, broken Back behavior, inaccessible files or indistinguishable empty/error states prevent successful use.            | Medium / likely if only a visual list is delivered | Core UI contract, USWDS/WCAG guidance; adds complete journey and content quality.                                          | Text-first useful metadata, direct opening, accessible content and recovery: C07/C08/C10, P07/P08.                       |
| R05 — Small library grows into another product             | Submission queues, mandatory reading, new taxonomies/storage or speculative automation add friction and permanent maintenance.                    | Medium / plausible                                 | Founder A; P29 no second CMS/approval service; ADR-0163 is scoped to public Pages/Articles.                                | Keep reader/curator purposes bounded, existing owners and optional content-driven filters: C01/C02/C07/C08, P01/P08/P10. |
| R06 — Legacy and operational state look qualified          | Public URLs, unknown classifications, stale search or failed maintenance remain advertised as working, creating disclosure or unusable resources. | High / plausible                                   | Current source lacks a demonstrated complete library; P29 requires provider census and recovery proof.                     | Explicit migration/admission, truthful states, scoped audit and tested rebuilding: C03/C06/C09/C10, P06/P09/P10.         |

| Review category                           | Material concern?              | Assessment                                                                                                                                                                                                                              |
| ----------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problem validity, necessity, alternatives | Yes — R01/R05                  | A meets the requested shared guidance direction with less work than submissions. An existing folder/link list is simpler only if it supplies the same qualified discovery, ownership and access; no user-demand measurement is claimed. |
| Brittleness                               | Yes — R02/R06                  | Old links, absent classifications, changed rights and stale indexes cannot be assumed safe.                                                                                                                                             |
| Technical debt                            | Yes — R01/R05/R06              | Avoid duplicate custody, publication flags with no owner and a parallel taxonomy/approval engine.                                                                                                                                       |
| Edge cases                                | Yes — R02–R04                  | Withdraw while open, failed replacement, dual-role user, untranslated content, empty results and inaccessible files have explicit outcomes.                                                                                             |
| Footguns                                  | Yes — R01–R03                  | Upload is not publish, internal is not public, and withdraw is not delete.                                                                                                                                                              |
| Tenant safety                             | Yes — R02                      | Search, metadata, bytes, audiences and retained state must stay within the validated context.                                                                                                                                           |
| Database, RLS and authorization           | Yes — R02/R03/R06              | Structural scope/version integrity and both old/new mutation authority are required alongside actual grants and service-path proof.                                                                                                     |
| Overengineering                           | Yes — R05                      | No submission queue, new LMS, AI search, CMS, provider or routine extra approval.                                                                                                                                                       |
| UX/UI and friction                        | Yes — R04                      | Readable direct links, useful metadata, accessible content and distinct failure states matter more than decorative density.                                                                                                             |
| Source of truth and invariants            | Yes — R01/R03                  | Resource meaning, bytes, publication, permissions and retention retain distinct owners.                                                                                                                                                 |
| Hidden coupling                           | Yes — R01/R02/R05              | Folder/path, public CMS topics, cache tokens and familiar role labels cannot decide library access.                                                                                                                                     |
| Failure modes                             | Yes — R03/R04/R06              | Partial upload/publication, lost responses and unavailable retrieval need safe outcomes and recovery.                                                                                                                                   |
| Lifecycle, concurrency and idempotency    | Yes — R03                      | Simultaneous replacement/withdrawal and retried publication must preserve the current qualified version and narrowing.                                                                                                                  |
| Data integrity                            | Yes — R03/R06                  | Exact references, migration provenance and rebuild behavior prevent silent substitution and resurrection.                                                                                                                               |
| Security and privacy                      | Yes — R02/R06                  | Current access includes metadata/bytes; signed URLs and downloaded copies have distinct limits.                                                                                                                                         |
| Scalability and performance               | Yes — R04/R05                  | Bounded results, indexed scope and lazy bytes avoid full-corpus loading; actual workloads remain unmeasured.                                                                                                                            |
| Operational burden                        | Yes — R01/R06                  | Named curation and recoverable maintenance are required, without inventing recurring review chores or automatic notices.                                                                                                                |
| Observability and auditability            | Yes — R03/R06                  | Durable publication history differs from technical logs and classification-required download audit.                                                                                                                                     |
| Dependencies and integrations             | Yes — R02/R06                  | Existing provider/CDN access semantics need qualification; no new integration is selected.                                                                                                                                              |
| Migration, rollout and upgrades           | Yes — R06                      | Unknown legacy entries stay unadmitted; old public links and mixed versions need explicit handling.                                                                                                                                     |
| Testability, traceability and proof       | Yes — R01–R06                  | The outcome cases below are required; static components and prose do not establish a working library.                                                                                                                                   |
| Other development hazards                 | No additional material concern | Checked money writes, donor consent, public-page publication, geography and coach contributions; none is granted by this choice.                                                                                                        |

## Acceptance scenarios

These are required future proofs; no D12 runtime suite was run in this turn.

| Proof                                  | Observable outcome                                                                                                                                                                                                                                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P01 — Complete reader and curator jobs | An authorized curator prepares/publishes a qualified resource; a missionary finds/opens it. Ordinary readers cannot submit/publish; a separately authorized curator retains proper contextual powers.                                                                                                         |
| P02 — Denied discovery                 | Ordinary reader discovery exposes no names, snippets, counts, filters or previews from other-tenant, out-of-purpose, unpublished or unauthorized items. Authorized curators can inspect permitted drafts in their maintenance context. Missing and denied links give the same safe response.                  |
| P03 — Current delivery                 | Revocation/withdrawal before a new request blocks dependent library discovery/retrieval across actual service, storage, CDN and browser paths, including cached signed URLs. Independent authorized uses remain valid; external destinations/public URLs and already received copies are not claimed revoked. |
| P04 — Content safety/version           | Unfinished/quarantined uploads cannot publish. Replacement cannot expose unreviewed bytes, and failed replacement preserves only an independently valid prior publication.                                                                                                                                    |
| P05 — Races and unknown outcomes       | Both replacement/withdrawal orders, duplicate publication and lost responses preserve one authoritative result; stale retry cannot republish. Scope/actor/version tampering fails.                                                                                                                            |
| P06 — Safe retained state              | Back navigation, tenant/hat switch, search rebuild, previews and cached lists re-prove access; source failure is not silently shown as an empty successful library.                                                                                                                                           |
| P07 — Useful phone journey             | Representative users find, understand, open and return to a resource on constrained connections without duplicate steps, automatic large downloads or lost browsing position.                                                                                                                                 |
| P08 — Accessibility and clarity        | Keyboard/screen-reader, 320 CSS-pixel/400% zoom, long/localized titles, language/format labels and supported content alternatives work. Empty/no-match/error/unavailable states are distinguishable.                                                                                                          |
| P09 — Migration and history            | Qualified entries preserve exact content provenance; unknown legacy records stay hidden; withdraw/rollback/restore retain history, holds and independent uses.                                                                                                                                                |
| P10 — Supported operation              | Production-shaped queries meet the declared owner budgets; audit attributes publication changes, failure reaches its responsible owner, and no submission/notification/course effect is accidentally introduced.                                                                                              |

## Evidence and limits

- [Founder brief](phase28-founder-brief.md:235) and [Q12 research](phase28-q12-resource-contributions-research.md)
  establish the open resource scope and the subsequently selected organization-managed direction.
- [P28/P29 roadmap](../../../prds/sitestacker-parity/roadmap.md:4181) and
  [retained P29 constraints](../../../prds/program-roadmap/owner-constraints.md#phase-29)
  establish resource/custody separation, immutable bytes, current metadata/access,
  and retention. Older dual-provider wording requires a census, not an assumption
  that every historical pipeline remains deployed.
- [Current identity OpenSpec](../../../../openspec/changes/sitestacker-parity/specs/identity-and-access/spec.md)
  preserves one validated context and server projection boundary; active intent is
  not implementation evidence. [ADR-0163](../../../adr/0163-versioned-release-bound-site-topic-profile-and-controlled-topic-sets.md)
  limits Site topics to eligible public Pages/Articles; do not transplant its
  catalog, numbers or permissions into this library.
- [Missionary navigation](../../../../apps/missionary/components/navigation-items.ts:31)
  has no Resources entry; [navigation search](../../../../apps/missionary/components/navigation-search.tsx:12)
  searches page labels. Bounded missionary source searches did not identify a
  resource-library page/API. This is a static observation, not a full-system or
  hosted-deployment absence claim. [PageHeader](../../../../packages/ui/components/page-header.tsx:33),
  shared Item/Pagination and [UI configuration](../../../../packages/ui/components.json)
  offer reusable patterns, not a completed library.
- Current primary [Supabase bucket](https://supabase.com/docs/guides/storage/buckets/fundamentals),
  [download](https://supabase.com/docs/guides/storage/serving/downloads) and
  [Smart CDN](https://supabase.com/docs/guides/storage/cdn/smart-cdn) documentation
  inspected October 16, 2026 distinguishes public access, signed-URL lifetime,
  Auth key changes and CDN cache lifetime. The CDN guidance warns cached responses
  can outlast token expiry. Its suggestion to delete objects for cutoff is not
  adopted as a general Core remedy: retained/shared bytes have independent owners.
  Qualify delivery under C04 instead. Documentation is not a live provider test.
  The changelog index was checked; no SDK/deployment/extension upgrade is made.
- [USWDS Collection](https://designsystem.digital.gov/components/collection/),
  [WCAG link purpose](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html)
  and [WCAG reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
  support descriptive compact lists and accessible navigation. Reuse Core's
  components; no library import, USWDS item-count rule or measured Asym result follows.

Performed repository/primary research, independent owner/UX review and structural
documentation checks. No application, Supabase authorization, file retrieval,
browser, user-study, accessibility or load test ran. Prior D8–D10 probes do not
qualify this library. No live document was uploaded, published or withdrawn.

## Synthesis and ordering

Record A now with the bounded meaning above. Preserve the distinction between
selected scope and the reviewed design recommendations; no extra ratification
step is needed to continue the next independent question.

During authorized specification, first assign the precise resource-purpose
publication contract and P29 access profile. Then capture C01–C10 and P01–P10 in
the owner/spec/design trace, including useful reader and curator states. Require
actual data/access, version/lifecycle and migration safeguards before activation;
implement the small native journey against those qualified contracts and prove
the complete outcome. Do not ship a convincing shell backed by public file links.

Residual monitoring has explicit responses: **any confirmed unauthorized
metadata/byte release** goes to the P12/security and P29 custody owners for
immediate containment and requalification. **Any reproducible broken or
misleading published resource** goes to the organization's resource curator for
correction/withdrawal, with the P28 source owner responsible for technical failure
recovery; verify the affected user journey before restoring availability.
Neither threshold replaces pre-release proof. Content popularity, completion
tracking, automatic review cadences and speculative performance targets are not
introduced as monitoring requirements.
