# D37 — Optional starting guide: publication and access safety

Research date: **2026-10-18 UTC**. Repository HEAD
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`, with the existing working tree.
Scope: selected Q37 A and the founder's confirmed **optional** direction:
the organization may offer, edit or disable a short starting guide; a missionary
may use, skip and return to it. No required course or new learning platform.

**Accept with required amendments.** A short native guide is feasible as one
organization-owned presentation over existing approved resources and permitted
workspace entry points. Publishing the guide must not publish a file, grant
access, execute the linked action or measure a missionary's competence.
The concrete guide/resource-purpose owner contract remains to be qualified;
existing CMS and Storage primitives do not establish that contract automatically.

This note records static source inspection and freshly retrieved primary
documentation. It does not change application/schema/formal specifications/live
data, run an older probe/model/verifier or claim an implemented guide. No actual
browser exploit, deployment ACL or concurrent database behavior was tested.

## Repository authority and source separation

| Source                                                                                                                                                                                                                                                                                                              | Binding consequence and limit                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Founder orientation intent](../phase28-founder-brief.md:77), [resource intent](../phase28-founder-brief.md:235)                                                                                                                                                                                                    | Optional contextual guidance belongs in the existing workspace and resource owners. No second CRM, compulsory course or LMS is implied.                                                                                                                                                                                          |
| [Q37 scope](q37-before-answer.txt:18)                                                                                                                                                                                                                                                                               | A is a small native path linking approved resources and existing work. It is more than republishing a PDF, but does not select saved completion, staff monitoring, tasks or a curriculum engine. The question's preserved unanswered status is historical evidence, not the founder's latest answer.                             |
| [D12 source boundaries](../phase28-d12-resource-library-decision.md:105)                                                                                                                                                                                                                                            | The selected library direction is organization-managed. The detailed D12 review distinguishes publication meaning from P29 custody and P12 current access. Its reviewed amendments retain their recorded status; D37 must explicitly adopt necessary compatible constraints rather than falsely ratifying the entire D12 review. |
| [P29 custody](../../../../prds/program-roadmap/owner-constraints.md:154), [source authority](../../../../prds/program-roadmap/owner-constraints.md:307), [roadmap](../../../../prds/sitestacker-parity/roadmap.md:4249)                                                                                             | Source domain owns publication, currentness, purpose and retention policy. P29 owns admitted exact bytes, processing, retrieval and disposition. A guide points to approved resource identity; a folder, signed URL or scan result cannot publish it. Historical provider mentions are not a live provider census.               |
| [Platform boundaries](../../../../../openspec/specs/platform-boundaries/spec.md:87), [data access boundary](../../../../guides/architecture/data-access-boundary.md:10)                                                                                                                                             | Operational authority remains behind Asym's server contracts. Public CMS publication and internal workspace guidance are different purposes. Reuse suitable machinery without silently assigning internal publication to public Pages or moving Payload runtime into the missionary app.                                         |
| [P12 exact context](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552), [egress](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1645), [purpose](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1654) | Current Tenant/assignment/capability/purpose applies to guide read, staff editing, target selection, previews and linked destinations. Reading a step is not source action authority or contact consent.                                                                                                                         |
| [ADR-0209](../../../../adr/0209-static-field-policies-and-subtract-only-projection.md:16), [ADR-0211](../../../../adr/0211-distinct-human-approval-for-projection-widening.md:16)                                                                                                                                   | Classify actual guide fields and use the shared conditional resolver. Do not invent per-value provenance visibility or a second permission engine. Actual projection-policy widening needs its governing approval; ordinary qualified guide editing does not automatically need a second publisher.                              |
| [P27 advisory guidance](../../../../prds/sitestacker-parity/phase-27-donor-development/partnerships.md:837)                                                                                                                                                                                                         | Stage guidance cannot impose gates or infer visits/changes. D37 is another advisory presentation, not authority to stage a person, create tasks or require acknowledgments.                                                                                                                                                      |
| [ADR-0171](../../../../adr/0171-tenant-wide-public-media-catalog-and-immutable-custody.md:14)                                                                                                                                                                                                                       | Payload upload/version primitives and Storage metadata do not by themselves establish immutable custody; public media is not a private resource store. Its public-media product model and numbers are not imported into D37.                                                                                                     |

**Lean authority model:** the guide owner owns the ordered instructional text and
destination references plus its current released version. A resource owner owns
the referenced resource's current approved exact release; P29 serves its bytes
under current access. Each workspace action owner owns the action and its
current permission/validation. A guide is neither a shadow copy of resources
nor a source of permissions. Publishing a guide does not need to copy every
resource version into a second store.

## Fresh static implementation evidence

Bounded searches of the missionary workspace, API and data packages did not
establish a qualified tenant-authored starting-guide or private resource
publication command. That is not a repository-wide or deployed-absence claim.
The following inspected paths establish useful existing behavior and concrete
reuse hazards; none is asserted to be the implemented D37 path.

| Current source                                                                                                                                                                        | Verified behavior                                                                                                                          | Consequence for D37                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Missionary Help menu](../../../../../apps/missionary/components/app-header.tsx:47)                                                                                                   | The inspected menu links to About.                                                                                                         | A reachable Help entry is useful existing placement, not proof of a guide/editor/publication lifecycle.                                                                                                                  |
| [CMS Pages](../../../../../apps/admin/src/cms/collections/pages.ts:50)                                                                                                                | Tenant-scoped staff mutations, public read policy, draft autosave and hooks are configured.                                                | Public Pages are not a default private guide family. Draft/version machinery may be reused only after actual audience, commands and owner contract are qualified.                                                        |
| [Public reader](../../../../../apps/admin/src/cms/public/published-content-reader.ts:128), [Local API call](../../../../../apps/admin/src/cms/public/published-content-reader.ts:151) | Explicit resolved Tenant and published filter, `overrideAccess: false`, public request context and serialized output.                      | Positive existing defenses. Their purpose is public content; passing a published guide through this path would not prove internal missionary audience or linked-resource access.                                         |
| [Public capability map](../../../../../apps/admin/src/cms/access/public-read.ts:176), [public policy](../../../../../apps/admin/src/cms/access/public-read.ts:207)                    | Pages are draftable; navigation/media are not. Public access uses the resolved Tenant and publication condition for draftable collections. | Do not turn the guide into public navigation or assume every collection has a draft/publish boundary. No current disclosure exploit was tested.                                                                          |
| [CMS access](../../../../../apps/admin/src/cms/access/tenant-access.ts:7), [Tenant hook](../../../../../apps/admin/src/cms/hooks/tenant.ts:5)                                         | Staff role and Tenant predicates govern access; super-admin paths differ; ordinary writes derive Tenant through a hook.                    | Useful scoping is present, but a staff role is not the new exact guide editor/publisher capability. Every privileged/API path needs the same source command and trusted identity; UI permission checks are insufficient. |
| [CMS audit hook](../../../../../apps/admin/src/cms/hooks/audit.ts:8)                                                                                                                  | Logs collection/operation/role/Tenant/user/document identifiers through `logger.info`.                                                     | This is technical logging. It does not prove durable business publication history, atomic release/audit or semantic retry recovery. Do not call it that without implementation evidence.                                 |
| [Organization settings](../../../../../packages/api/src/admin/org-settings.ts:9), [PATCH](../../../../../packages/api/src/admin/org-settings.ts:48)                                   | Explicit admin role gate, but a fixed Tenant id for the current visibility setting.                                                        | High/plausible reuse hazard. D37 disable/offer must derive the current Tenant and exact capability and use expected revision/accepted outcome. This is not a proven deployed cross-Tenant exploit.                       |
| [Navigation fields](../../../../../apps/admin/src/cms/collections/navigation.ts:69), [public href sanitizer](../../../../../packages/lib/cms/public-page.ts:150)                      | Navigation stores free text href; sanitizer rejects control characters/unsafe schemes and accepts several general URL forms.               | Positive URL hygiene exists, but a general public link is not an allowlisted internal workspace action or source reference. Do not accept arbitrary route/query/action payloads for D37.                                 |
| [Rich-text renderer](../../../../../packages/lib/cms/public-page-renderer.tsx:40), [link handling](../../../../../packages/lib/cms/public-page-renderer.tsx:111)                      | Text becomes React nodes; a bounded tag switch renders structured nodes; links have protocol checks.                                       | This is materially safer than raw HTML execution. It is not proof that every future node, URL form, embed or action destination is safe; D37 should remain simpler rather than copy unrestricted rich text/embeds.       |
| [Public media](../../../../../apps/admin/src/cms/collections/media.ts:16), [upload policy](../../../../../apps/admin/src/cms/collections/media.ts:55)                                 | Versionless public-media collection, image type list, `pasteURL: false`, local static storage configuration.                               | A positive restriction on URL ingestion, not a complete private file/revision/custody contract. The guide should reference an existing qualified resource instead of accepting uploads here.                             |
| [Public cache tags](../../../../../packages/api/src/cms/public/cache-tags.ts:3)                                                                                                       | Tags are documented as invalidation, not isolation; public content uses a bounded cache profile.                                           | Correct distinction. A public cache's expiry is not sufficient for private guide/source revocation. Tenant/principal/context/purpose/release/current-authority keys and safe release behavior must be qualified.         |
| [Portal query key](../../../../../packages/database/hooks/missionary-portal.ts:100), [query defaults](../../../../../packages/database/providers/query-client.ts:81)                  | A broad portal key and ordinary stale/cache lifetimes exist.                                                                               | Do not append private guide content without verifying exact context and release scoping. These values alone do not prove a leak or revocation correctness.                                                               |
| [Session cleanup](../../../../../packages/auth/client-session.ts:56), [async load version](../../../../../packages/auth/client-session.ts:138)                                        | Query cache is cleared for user switches/sign-out and obsolete auth-load results are discarded.                                            | Positive defenses must be preserved. They do not alone establish same-user Tenant/assignment/purpose/release changes for a new guide.                                                                                    |

The repository pins an internal Payload 4 build in
[the admin manifest](../../../../../apps/admin/package.json:39). Generic current
Payload documentation is useful for Local API access concepts, but does not
qualify that exact pinned runtime or authorize an upgrade. The repository's
Payload and Supabase skills were read/applied with owner instructions taking
precedence. No skill workflow was used to modify a live database.

## Current primary evidence and proportional interpretation

All sources below were fetched on 2026-10-18 UTC. Their documentation establishes
specific behavior, not production Core readiness or a ministry user study.

| Source                                                                                                                                                                 | Finding and applicable safeguard                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Payload Local API](https://payloadcms.com/docs/local-api/overview)                                                                                                    | Local API defaults may bypass access; docs describe explicit `overrideAccess: false` and user context, and distinguish lock override behavior. Existing public code explicitly sets access enforcement. Qualify actual internal guide calls, exact installed version and transaction context; do not infer safe publication from a library default or editor lock.                                  |
| [OWASP XSS prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)                                                | Untrusted text/URL/HTML need context-appropriate encoding, validated destinations and sanitization if HTML is allowed. Prefer plain text or existing bounded formatting. Staff-authored content is still untrusted input; no scripts, event handlers, arbitrary HTML or unsafe URL protocols. CSP is defense in depth, not the sole fix.                                                            |
| [OWASP SSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)                                        | SSRF concerns a server making attacker-influenced requests. An ordinary browser anchor is not by itself server SSRF. Do not add arbitrary link unfurling, URL import, thumbnail fetch or link-check crawlers for this feature. If a separately authorized source already fetches URLs, qualify its destination/DNS/redirect/network limits through that owner.                                      |
| [MDN anchors](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a)                                                                                  | Referrer policy controls contextual URL leakage; modern `_blank` implies noopener, while explicit safe new-tab handling remains appropriate for supported browsers. Use a clear external destination cue and privacy-safe referrer behavior without a warning modal for every link. An external site still sees ordinary network/browser context; do not promise anonymity.                         |
| [Supabase bucket fundamentals](https://supabase.com/docs/guides/storage/buckets/fundamentals), [downloads](https://supabase.com/docs/guides/storage/serving/downloads) | Public and private delivery differ. Signed URLs use a separate signing key and do not become invalid merely because Auth keys rotate. Store resource references, not reusable signed URLs; existing P29 retrieval must meet actual current authorization requirements.                                                                                                                              |
| [Supabase Smart CDN](https://supabase.com/docs/guides/storage/cdn/smart-cdn)                                                                                           | Cached signed responses can outlive token expiry; browser/CDN caches have independent behavior. Deleting shared/held bytes is not a general withdrawal remedy. Qualify requester-bound current authorization where required without creating another file-serving platform.                                                                                                                         |
| [Supabase backups](https://supabase.com/docs/guides/platform/backups)                                                                                                  | Database backup covers Storage metadata, not stored objects. Restoring metadata does not restore deleted bytes. Guide/source restore must reconcile current offering/release/restrictions and actual custody, never assume a referenced file exists or is releasable.                                                                                                                               |
| [Supabase changelog](https://supabase.com/changelog)                                                                                                                   | Fresh index checked; API exposure defaults and current platform changes require deployment-specific qualification. No changelog creates a private guide or changes the owners. Prior same-session PostgreSQL findings remain applicable: grants and RLS are distinct; omitted WITH CHECK can inherit USING; SECURITY DEFINER executes with owner privileges, not invariably an unrestricted bypass. |

## Material concerns, assessment and permanent resolution

Likelihood means a plausible implementation hazard **without the stated fix**,
not an observed incident rate. Every concern retains A while narrowing unsafe
implementation. This is not a request for new permission, storage or workflow
infrastructure.

| Concern                                         | What could go wrong; why it matters                                                                                                          | Severity / likelihood                                                         | Exact correction                                                                                                                     |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Public machinery mistaken for private authority | Publishing a CMS page/navigation item exposes an internal guide or linked names to the public or another audience.                           | High / plausible on unchanged reuse; current public reader/capabilities above | GS37-01/05/10: one explicit internal guide-purpose source, current resolver and no automatic public publication.                     |
| Draft/save/retry accidentally publishes         | Autosave leaks unfinished text; a stale editor overwrites a newer release or re-enables after disable; lost response repeats the effect.     | High / plausible under concurrency                                            | GS37-02/03: atomic whole-release revision and expected-base/semantic recovery, independent disable, no old-intent restoration.       |
| Guide grants or performs an action              | A URL opens a cross-Tenant record, auto-submits a form, creates tasks or bypasses prerequisites because the guide “approved” it.             | High / plausible with arbitrary href reuse                                    | GS37-04: typed destinations, current target owner checks and navigation without automatic mutation.                                  |
| Withdrawal leaves protected step metadata       | Hidden resource title/summary appears in guide text, counts, a disabled link or cached preview after resource withdrawal/restriction.        | High / plausible with stale flattened guide                                   | GS37-05/06: govern the whole dependent step before serialization/counting; exact current target checks and partial safe degradation. |
| Unsafe content/external requests                | Staff text contains executable HTML/URLs; an added unfurler makes server requests to private addresses; external URLs carry private context. | High / plausible if capabilities are added; no current D37 exploit            | GS37-04/07: plain/bounded content, safe typed links, no new server fetching/embeds/tracking or sensitive query insertion.            |
| Broad Tenant or publisher authority             | Fixed settings Tenant, role-only gate, arbitrary owner reassignment or permissive raw writes defeats guide scope.                            | High / plausible on copied code                                               | GS37-03/10: trusted current Tenant/actor, exact actions, tenant-aware relations and all entry-path parity.                           |
| Guide becomes compliance monitoring             | Opening/skipping is recorded as completion or deficiency; coaching/staff receives individual progress or inferred beginner status.           | Medium–high / plausible feature creep                                         | GS37-08: optional advisory use, no performance/completion ledger; required security audit remains distinct.                          |
| Private content inherits public caching/storage | A signed URL, CDN or cache returns content after current authority ends; restore re-enables withdrawn content or loses bytes.                | High / plausible if public delivery is reused                                 | GS37-06/09/11: current release/disclosure, safe keys, P29 custody, reference-safe retention and restoration.                         |
| Logging is mistaken for durable release history | Staff cannot tell what was published, by whom or whether an unknown save committed; operators use direct DB edits.                           | Medium–high / plausible given logger-only hook                                | GS37-03/12: source-owned durable minimized publication evidence and accepted-outcome recovery.                                       |
| Overbuilt implementation                        | New guide services, per-user curricula, hidden auto-tasks, URL crawlers or forced acknowledgments add maintenance and friction.              | Medium / plausible                                                            | GS37-01/04/08/12: one bounded native presentation, existing owners and measured simple reads.                                        |

## Exact proposed safeguards

**GS37-01 — One optional source-owned guide.** Use one bounded organization
starting-guide presentation owned by the qualified resource/guidance purpose.
Preserve separate identities for guide content, referenced resources and their
custody. Staff need current exact editing/publication authority in their Tenant;
ordinary missionary guide access grants neither. The offer remains optional
for both organization and missionary. No gate to ordinary work, role curriculum,
required acknowledgement or second content/storage service is introduced.

**GS37-02 — Draft, release and disable are deliberate.** A draft may be saved
without changing the currently offered guide. Publish a reviewed whole version,
including ordered text and typed destinations, atomically; readers never see a
mixture of versions. Editing or autosave cannot offer/re-enable the guide. An
authorized disable/withdraw must remain usable despite an invalid draft and
stop new guide admission without deleting draft/history/resource bytes or
revoking independent source access. A deliberate later offer uses current
authority/revision; an old publish/save retry cannot restore a withdrawn guide.
Use the existing owner's minimal lifecycle rather than inventing a second
approval engine. No second approver is implied except where an actual governing
projection/safety policy already requires one.

**GS37-03 — Current atomic publication and recovery.** Derive Tenant, actor,
publisher and attribution from trusted server context. Require expected guide
and relevant offering/source revisions at the owner acceptance boundary after
waits. Serialize publish/edit/disable and relevant authority changes, including
first publication into an absent current-head state. Commit the accepted release/
offering change, required durable audit and minimal accepted outcome correlation
together; any required secondary invalidation intent is durable in that same
commit. Unknown outcomes recover the original accepted result under current
disclosure permission, without republishing. Same correlation with different
intent conflicts; a rejected/stale command cannot later become effective through
background retry. No generic CRM/provider command journal is added.

**GS37-04 — Safe destinations, not executable steps.** A step destination is an
approved existing resource reference or a supported existing workspace entry/
action key, with only qualified safe parameters. The server resolves the route
for the current Tenant/context. Do not store arbitrary internal routes, API URLs,
redirect parameters, JavaScript, raw action payloads or bearer credentials.
Selecting a step navigates to currently eligible existing work; it does not
perform that work, submit data, create a task, send a message or bypass the
destination owner's ordinary deliberate action and validation. Browser prefetch
and GET reads cannot perform mutations. Resource links resolve their owner's
current approved exact release; path replacement cannot publish different bytes.
External web links remain approved resource-owner destinations, not another
guide-only URL catalog. A useful allowed action may remain reachable outside
the guide independently.

**GS37-05 — Current whole-step disclosure.** Apply the shared P12/ADR0209 guide
purpose and target conditions before serializing discovery, ordering, counts,
titles, descriptions, links, previews or errors. A linked record's hidden name
does not become safe because staff copied it into text or disabled the button.
Where a step's disclosure depends on a resource/action, govern the whole step
under that dependency. Retain only independently permitted generic guidance
when the destination is unavailable; do not infer a field's safety from ad hoc
text analysis or introduce per-value provenance policy. Curator preview uses
qualified editor/audience preview rules, not ambient impersonation or a union
of every role. Publication does not promise that every missionary can use
every linked action; the reader's current eligibility remains authoritative.

**GS37-06 — Withdrawal and partial failure.** Recheck the guide's current offered
release and target's current resource/action authority at governed display and
open/release boundaries. Source withdrawal, privacy restriction, quarantine or
permission loss removes unsafe dependent content/action, even if the guide was
published earlier. Do not silently substitute an unreviewed resource or new
destination. A single unavailable target need not remove unrelated permitted
steps; show an appropriate safe unavailable/Retry state where its existence is
already permitted. Distinguish unavailable source services from no configured
guide and no eligible content. Before final response release, recheck relevant
current authority; discard known-obsolete client responses. Do not promise to
recall already lawfully released bytes or control an already-known public URL.

**GS37-07 — Minimal content and external-link safety.** Use escaped plain text or
the existing qualified bounded formatting; no raw HTML, scripts, event handlers,
iframes, arbitrary embeds or guide-specific file upload. Validate link semantics
through their source owner and render with context-appropriate encoding. Reject
unsafe schemes, credential-bearing URLs, malformed network-path/redirect forms
and private bearer links; a string beginning with slash is not a permitted
workspace action. Do not append supporter/missionary identifiers, sensitive
locations, auth tokens or personal progress to external URLs. External links
have a clear destination cue, safe new-tab behavior if used, and referrer policy
appropriate to private context. Do not add tracking pixels, background unfurls,
URL imports, link-check crawlers or automatic external fetches. An anchor alone
is not server SSRF; separately authorized fetch capability requires its existing
owner's network/DNS/redirect safeguards, not a new D37 service.

**GS37-08 — No inferred progress or surveillance.** Viewing, opening, skipping,
closing or returning to the guide is not task completion, understanding,
fundraising activity, coaching disclosure, stage progress or a prerequisite.
Do not create individual completion reports, staff/coach progress dashboards,
scores or permanent novice/veteran classifications. Required access/security
audit and minimal operational telemetry still follow P12 and are not a
training-performance dataset. A simple existing personal presentation preference,
if actually selected, must not become a completion record or revive dismissed
prompts on every content edit. No saved progress ledger is needed by A.

**GS37-09 — One qualified custody/cache path.** Guide prose stays with its
qualified content owner. Files stay in P29; persist authorized resource references,
not copied bytes or reusable signed URLs. Internal publication is not public
release. Private document retrieval must meet the actual current requester/
purpose authorization contract through the existing custody owner; a signed URL,
JWT key change or public cache TTL alone cannot prove revocation. Cache identity
includes exact Tenant/current actor context/purpose/guide release and required
authority generation. Invalidation tags do not provide isolation. Source changes,
disable and identity/context switches reject obsolete reads; no offline cache
promise is added. Delivered external copies cannot be recalled.

**GS37-10 — Database and API integrity.** Qualify one current guide release per
declared guide scope and coherent same-Tenant links to the exact guide version,
steps and source references. Require valid destination variants and bounded
text/step payloads, with trusted identity/revision fields protected from ordinary
updates. Unknown legacy ownership/publication must not default to visible.
Use constraints and one authoritative command boundary appropriate to the actual
representation; this note freezes no table or new generic workflow schema.
Test grants, RLS old/new row behavior, views, RPC/Local API privileges and
service/operator paths together. Omitted WITH CHECK may inherit USING; that
does not enforce immutability between otherwise permitted states. SECURITY
DEFINER uses actual owner privileges, not a universal bypass guarantee. No broad
raw-table or public CMS grant is a shortcut to guide access.

**GS37-11 — Reference-safe retention and restore.** Disabling/replacing the guide
does not delete shared/held resources or create a new retention period for them.
Source-required publication history and private draft content follow their own
qualified minimized retention/disposal rules. P29 reconciles retained exact byte
references and actual objects; database backup is not byte backup. Before serving
or accepting new writes after restore/migration, reconcile current offering,
publication lineage, restrictions/erasure and custody readiness. Do not restore
withdrawn guide availability or stale signed URLs from a backup/cache, nor accept
an old publish command as a new effect. Safe rollback contains guide admission
without breaking ordinary work or discarding accepted source evidence.

**GS37-12 — Bounded operations and honest evidence.** Use existing resource
selection and source read/publication contracts with bounded steps/text and
server-side batch permission projection; do not perform one network authorization
or file-signing request per step. Publish concrete supported bounds and measured
query/render/recovery budgets before activation, not invented usage statistics.
Record durable identifiers-only release/disable history and original actor
separately from technical attempt/error logs. Diagnose broken destinations and
unknown publish outcomes through current owner tooling, never direct database
repair, silently re-enabling or replacing the destination. No extra vendor,
background workflow dependency or analytics service is necessary.

## Required falsifiable proof

These are later implementation/release obligations, not tests executed here.

| Proof                          | Observable outcome                                                                                                                                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P01 — Optionality              | Tenant can offer/edit/disable; missionary can skip/return; no guide read/use is required for any otherwise eligible ordinary work.                                                                           |
| P02 — Scope and roles          | Actual editor/publisher/reader/anonymous/service/operator paths enforce the exact Tenant and capability; caller ownership/publisher or role switching cannot widen them.                                     |
| P03 — Whole release            | Saving draft does not alter the released guide; a publish either commits the full ordered version or none, with no mixed text/targets.                                                                       |
| P04 — Competing commands       | Concurrent edits, publish against disable, first publish and stale A→B→A heads obey expected revisions and current authority; no old retry restores offering.                                                |
| P05 — Atomic failure/recovery  | Crash after source change but before required audit/correlation/invalidation intent gives rollback or one recoverable accepted effect; lost-response recovery cannot create another publication.             |
| P06 — Reauthorization          | Grant/source change during a wait and before response release denies stale effect/disclosure without erasing an already accepted effect. Already released bytes are not claimed recalled.                    |
| P07 — No execution             | Opening/prefetching a step creates no task, source mutation, message, stage event or permission; actual destination performs its normal authorized deliberate workflow.                                      |
| P08 — Typed destinations       | Arbitrary route/API/redirect/query payload, cross-Tenant resource and unknown action key fail; each supported action resolves safely for the current workspace.                                              |
| P09 — Withdrawn target         | After source withdrawal/quarantine/restriction, a stale guide shows no protected dependent title/description/count/link or bytes; other permitted steps remain usable.                                       |
| P10 — Current resource version | Only the resource owner's currently approved exact release is served; replacing bytes under a path cannot silently publish a new file; unknown/unavailable source never falls back to an old public URL.     |
| P11 — Content attacks          | Executable HTML, event attributes, JavaScript/data/file schemes, malformed relative/network-path URLs and unsafe embeds cannot execute or reach unintended destinations through authoring/rendering paths.   |
| P12 — External privacy         | No token/private identifier/referrer leakage introduced by guide-generated links; external indication is clear; no background third-party fetch, tracker, unfurler or SSRF-capable guide endpoint exists.    |
| P13 — No monitoring inference  | Open/skip/dismiss does not increment completion/activity or appear in staff/coach performance reports; required security audit remains correctly classified and permission-limited.                          |
| P14 — Context/cache            | User switch, same-user Tenant/assignment/purpose change, disable, new release and obsolete async response never render another context's guide or protected step; public cache keys/tags cannot substitute.  |
| P15 — Custody                  | Real P29 retrieval/CDN/browser behavior satisfies the required current-access profile; revoked Auth keys alone are not asserted to revoke signed URLs; shared held bytes survive guide withdrawal.           |
| P16 — Failures                 | No configuration, no eligible content and unavailable service are distinct without hidden-resource enumeration; permitted instructions/ordinary navigation remain usable during a target outage.             |
| P17 — Database transformations | Actual constraints/grants/RLS/Local API prevent guide/step/source ownership or accepted publication fields being rebound through a nominally allowed update.                                                 |
| P18 — Retention/restore        | Backup, mixed-version writer and rollback cannot republish withdrawn content, recover erased bodies or invent missing bytes; required minimized history and independent resources remain intact.             |
| P19 — Usable limits            | Published exact payload/query/render/recovery bounds pass production-shaped multi-tenant tests; no all-resource fetch, N-per-step authorization fan-out or large automatic downloads.                        |
| P20 — Operator evidence        | Authorized staff can identify current release, original publisher, accepted/unknown outcome and unavailable destination safely through owner tools; logger output alone is not mistaken for durable history. |

## Verification limits and delivery

This work adds only this evidence note. It qualifies no runtime, migration,
effective deployed grant, current provider allocation, private byte path, browser
security exploit, load budget or end-user result. The inspected existing public
defenses and session cleanup are acknowledged; unsupported guarantees are not
attributed to them. No older probes/models/verifiers were executed.

The source/design transition should first assign the guide publication purpose
and adopt the necessary D12/P29/P12 boundaries explicitly, then define the small
release/disable and typed-destination contracts. Qualify the concrete transaction,
authorization, content renderer and custody paths before activation. No new
general platform or mandatory progress workflow is needed.

### Primary retrieval integrity

All following documents returned HTTP 200 on 2026-10-18 UTC. Hashes identify
retrieved text only, not runtime qualification.

| Source                                                                                                                                                            | Retrieved UTC | SHA-256                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------ |
| [changelog.md](https://supabase.com/changelog.md)                                                                                                                 | 09:53:56      | `15b3d0d1a7dc3b3f2c0af4788e49acfdf2d2edbd2613f22de0705fa43b1cf58b` |
| [fundamentals.md](https://supabase.com/docs/guides/storage/buckets/fundamentals.md)                                                                               | 09:53:56      | `389b43c748948ea810054df2cfed1085fc24138a9a9d332dbfd82f97c407d39f` |
| [downloads.md](https://supabase.com/docs/guides/storage/serving/downloads.md)                                                                                     | 09:53:56      | `9bf68c24d45ac692d9a52e7af411fb3db2bccfad9d7a42be84098d31904bf8f1` |
| [smart-cdn.md](https://supabase.com/docs/guides/storage/cdn/smart-cdn.md)                                                                                         | 09:53:56      | `38e0b7c129d5fa4f2e14a890b4591ffdad1629ea64d56fe32bcf5b90891eff50` |
| [backups.md](https://supabase.com/docs/guides/platform/backups.md)                                                                                                | 09:53:56      | `59f3bb7a169c6fa7682a818d6046f6b0031c923ec2376bf096bb7f08bea87944` |
| [Cross_Site_Scripting_Prevention_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)               | 09:53:56      | `cd44319ce21cf19bfb9823e52076f2705589deedee20818f6d1d576886ec6695` |
| [Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html) | 09:53:56      | `9814e4cbf5d8bf715a3c709213e9738c2d65b87bf9637b30352e468a9ea28f4c` |
| [a](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a)                                                                                       | 09:53:57      | `474103f3b45c1e5699371580d300d17579c847acfd1dbc414eabd6f71cdf7800` |
| [overview](https://payloadcms.com/docs/local-api/overview)                                                                                                        | 09:53:57      | `ada705807c5b13005a3d453ca6012498d3176d3548fd9b7c08dd36196d94ceb4` |
