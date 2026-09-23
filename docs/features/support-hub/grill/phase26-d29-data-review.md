# D29 — Independent data, intake and owner-boundary review

**13 September 2026. D29 A is selected; the complete amendments are proposed for founder review. D1–D28 remain fully ratified.**

**Disposition: Accept with required amendments.** A small optional public guidance selection beside immediate contact is coherent with Asym. The permanent path must qualify public presentation and ordinary contact independently, use the existing public/app owners, and provide a real non-email form-source contract. It must not expose the staff Guidance selection wholesale or manufacture email to reuse an email-shaped Support adapter.

This independent pass focuses on source authority, data/authorization, public/app context, form admission, failure and lifecycle. The root's main review supplies the complete 23-category synthesis. Nothing here authorizes implementation, formal OpenSpec/PRD changes, tickets, provider changes, DNS or real messages.

## Evidence and current behavior

[Exact source evidence](phase26-d29-data-source-evidence.json) records **29 immutable Git objects and 10 accepted session artifacts**. WSL directory and HEAD were verified: `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10`, `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. P23 was inspected at `9069dcad67f9630323474ca5ee8bcc85ca7bf0f6`, P24 at `ab1a1703a725be454376990a7fe68aef2e048026`, and P25 at `0624ca3841ea98e618fed0e2c490d24c0ef1d9c1`. Those planning objects are governing accepted intent in their respective open work, not deployed implementation proof. The root owns the fresh remote/PR check.

| Source fact                                                                                                                                                                                                                                                                                                                                                                                                        | Meaning and limit                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Current public context, lines 11–31](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/cms/public/context.ts#L11), [resolver, lines 22–29 and 128–180](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/src/cms/public/resolve-tenant.ts#L22)                                                                    | Current context leaves Site null; helper copies one CMS tenant ID into the operational string. Resolver has host/subdomain and limited development/preview aids. This does not establish P24 exact tenant/Site/locale/portal-host authority for D29. No deployed forged-host exploit is claimed.                                                |
| [PublishedContentReader, lines 132–144](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/cms/public/reader.ts#L132), [sole Payload public reader, lines 27–45](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/src/cms/public/published-content-reader.ts#L27)                                                  | The shared reader exposes Page, Navigation and Updates methods and an access-enforced public implementation. It is the boundary to extend, not proof that contextual Help already exists.                                                                                                                                                       |
| [P23 ADR0168, lines 22–40 and 65–89](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0168-one-exact-public-audience-and-app-owned-authenticated-surfaces.md#L22), [ADR0172, lines 122–130](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0172-versioned-site-search-sharing-profile-and-d1-compiler-ownership.md#L122) | One exact auth-invariant public audience. Shared-by-link Pages are anonymously accessible but excluded from on-site discovery. App-owned private content remains separate.                                                                                                                                                                      |
| [P23 ADR0159, lines 17–25](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0159-three-bounded-content-list-curation-strategies.md#L17), [ADR0158, lines 22–23](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0158-versioned-dynamic-source-catalog-and-content-list.md#L22)                                            | Exact ordered references and shrink-without-substitution already have an owner pattern. Dynamic Content List initially qualifies Article; that does not automatically qualify an arbitrary Page-based Help source. No new generic contextual rules engine is needed.                                                                            |
| [P23 public-form OpenSpec, lines 988–1069](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/openspec/changes/add-web-studio-cms/specs/web-studio-cms/spec.md#L988)                                                                                                                                                                                                              | One versioned purpose, one released Primary Outcome, atomic occurrence/work/child intents/outbox before Received, native no-JS public submission, bounded server validation. Support handoff and verified email handoff are alternatives, not dual owners.                                                                                      |
| [P23 form purpose research, lines 211–286 and 374–400](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/prds/sitestacker-parity/research/phase-23-d26-public-form-definitions-and-routing-decision-brief.md#L211)                                                                                                                                                          | General inquiry and other names are example catalog entries; exact semantic fields are qualification work, not an implemented Contact schema. Page placement cannot override routing. Launch excludes uploads/payments/save-and-resume. Transient downstream outages may accept bounded recoverable work; invalid destination authority cannot. |
| [P24, lines 347–379](https://github.com/Asymmetric-al/core/blob/ab1a1703a725be454376990a7fe68aef2e048026/docs/prds/sitestacker-parity/phase-24-multi-site-management.md#L347), [P25 US25-D14, line 206](https://github.com/Asymmetric-al/core/blob/0624ca3841ea98e618fed0e2c490d24c0ef1d9c1/docs/prds/sitestacker-parity/phase-25-donor-dashboard-depth.md#L206)                                                   | Public Site, portal host, exact locale and route families stay distinct. Donor help must carry relevant permitted context without sensitive screenshots or processor identifiers. This is not permission to copy private records into public CMS output.                                                                                        |
| [Current Support core SQL, lines 15–32 and 198–249](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260515025814_support_hub_core_modules.sql#L198), [inbound adapter, lines 12–28 and 40–45](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/inbound-router.ts#L12)              | Current schema is email-shaped: text IDs, required external email, default message timestamps/direction, channel=email. Inbound requires Resend/source-email fields. A certified form adapter cannot honestly reuse those fields by inventing values. D26 already requires removing analogous false manual-origin assumptions.                  |
| [Current Support RLS/grants, lines 520–574](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260515025814_support_hub_core_modules.sql#L520), [Support route helper, lines 31–86](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/route-helpers.ts#L31)                            | Broad staff CRUD and role/email-based helper behavior are observed foundations, not proof of narrow publication/intake/context authorization. Anonymous public form access must not be implemented by granting generic Support-table CRUD.                                                                                                      |

The named Supabase skill and current official [RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security) were read. The changelog Markdown fetch was retried through a normal HTTPS read after the web reader rejected its content type. This task changes no Supabase version, extension or infrastructure; current relevant adapter qualification remains required before implementation. The skill's shorthand about omitted WITH CHECK is corrected by the current docs and [PostgreSQL CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html): USING can supply the check when WITH CHECK is omitted. Effective old/new row predicates, privileges and immutable-field enforcement are what must be proved.

## Minimal permanent model

Use three existing owner lanes, with a narrow explicitly qualified entry contract:

1. **Optional public guidance presentation.** An exact qualified Help entry points to a small ordered set of stable public Page references. Content stays in Web Studio. No article body, public-status copy, inferred search query, private staff guide or general recommendation engine is stored in Support. The public Page's own selection/composition uses its normal P23 publication generation; an authenticated app's bounded context-to-guidance configuration is app-owned. Their maintenance UI can compose owner commands, but there is no fictitious cross-owner atomic release or mutable Support setting that silently changes a frozen public Page.
2. **Deliberate contact acceptance.** One narrow ordinary-inquiry purpose is qualified through the form/intake owner. Public website and authenticated app Help have distinct trusted producer adapters. Both reuse the purpose, acceptance receipt and exactly one configured Primary Outcome. Guidance eligibility is not a prerequisite to contact admission.
3. **Owning work and communications.** A certified Support destination admits one truthful form-origin request with current work/assignment and appropriate source custody. A verified-email Primary Outcome retains its existing bounded delivery evidence and creates no Support conversation. Optional acknowledgement/notification children retain P17/P6 authority. Actual later staff email has its own audience and transport lineage.

The app entry key should be a small code-owned task/surface discriminant, not raw URL matching or a tenant-authored conditional expression. Public context is exact tenant/Site/locale/Page; authenticated context may additionally contain a separately issued, current owner-qualified help-context reference, never caller-controlled CRM authority. A proposed minimal replyable form has required message and reply email, optional unsplit name, and no mandatory subject/category/phone, identity verification or uploads. This is a product recommendation to qualify, not an assertion that P23 already publishes those exact fields.

## Material findings and exact proposed clauses

Severity is impact before correction; likelihood is a reasoned estimate, not measured production frequency. Each clause below is proposed decision language for the root synthesis.

### DC01 — Optional guidance must not become a contact dependency

**High / likely without explicit separation. Changes A's failure contract.** A slow public-content request, empty selection or removed Page could leave Contact support disabled or hidden. This defeats the founder's specific priority and is not necessary for safety.

> “The Contact support entry and its qualified destination SHALL be available independently of optional guidance reads, preview, selection and client enhancement. Missing, empty, stale, withdrawn or unavailable guidance SHALL leave contact usable when its own owner remains qualified. The user SHALL never have to search, read, rate or dismiss an article to ask for help. A guide click creates no submission, resolved fact or feedback opportunity.”

**Proof:** Hold the guidance request indefinitely, return empty/unavailable, withdraw every selected guide and disable JavaScript; contact remains keyboard- and link-accessible. A contact-owner outage is separately truthful, never mislabelled as merely no guides.

### DC02 — Trust public and app entry scope independently

**Critical / plausible. Narrows contextual behavior.** Caller-controlled Tenant, raw forwarded host, arbitrary source URL or represented Party can choose another tenant's content or route. The current nullable Site helper cannot qualify the future contract by itself.

> “Public Help SHALL derive exact Tenant, environment, Site, locale, public route and active generation from the qualified public resolver. App Help SHALL derive Tenant/principal/surface from current P12/app context and select only a code-qualified entry key. Neither accepts browser-supplied scope as authority. No private donor attribute, CRM segment, form text, error payload or browsing history changes CMS-authored public output. Unknown tenant scope SHALL produce neutral safe failure, never guessed tenant contact.”

**Proof:** Forged host/forwarded host/query tenant, wrong Site/locale, stale active assignment, shared-device switch and cross-app cache hits disclose no foreign metadata or destination. Compare anonymous/authenticated public bytes under the same exact scope.

### DC03 — Public discovery is not the staff Guidance population

**Critical / plausible. Narrows source selection.** D27 staff selection includes Shared-by-link sources and D27-C includes internal guides. Publishing that registry would violate source discovery intent or disclose private procedures.

> “Requester guidance SHALL include only exact currently Listed-publicly, source-safe, routeable Page variants eligible for public discovery in the entry's qualified scope. Internal Staff guides, previews and Shared-by-link sources SHALL not enter suggestions, titles, counts, prefetch or public caches. Staff finder membership grants no requester publication or selection authority.”

**Proof:** Same title across internal, Shared-by-link, draft, other Site/locale and Listed sources returns only the exact admitted Page. Source transitions suppress adverse content before asynchronous cache/index cleanup.

### DC04 — Keep selection authority and release ownership singular

**High / plausible. Changes maintenance architecture.** A parallel Support Help configuration could become a second public publication head or live-edit a P23 generation. D27's flat staff registry is not a public-site release engine; P23 Content List's Article source is not automatic Page qualification.

> “A public Help placement SHALL use P23-owned exact selection intent and normal Page/Site release. An app-owned contextual mapping SHALL use its separately qualified current configuration command and public references. Neither copies article body or claims joint publication across owners. Exact refs, order and versions SHALL be validated; absent/withdrawn selected items shrink the selection without invented replacements. Removing a placement does not delete/unpublish its Page; ordinary source publication does not add a removed placement. Same-source nonterminal republication may restore a still-selected eligible item.”

**Proof:** Publish unrelated Page changes, edit an unreleased selection, remove/re-add, archive/unpublish/relist a source and race two curators. Verify exact owner generation, no lost change, no substitution and no implicit selection of newly translated material.

### DC05 — Selection privileges are distinct from reading and Support assignment

**High / plausible. Narrows authorization.** Any Support worker, inbox assignee or generic admin could publish public help or route a form to an unmanaged destination if the UI combines owner actions too loosely.

> “Maintenance SHALL require the current capability for the exact app configuration or CMS placement and source-reference use. Page editing/publication, public reach changes, form route publication, Support destination management and Email Studio publication remain separate owner actions. The server derives tenant and actor. A user may not widen scope, change ownership, publish into an unmanaged Site or route via a destination merely because they can read its label.”

**Proof:** Read-only Support reader, inbox manager without CMS rights, CMS author without destination rights, removed manager and privileged service path each receive the precise permitted/denied result. No denied target metadata appears in pickers/counts.

### DC06 — Contact owns exactly one Primary Outcome

**High / likely if implemented as a generic contact email. Changes intake architecture.** Sending a form to an inbox and also calling Support creates duplicate work; falling back from failed Support routing to email silently changes the user's promised owner.

> “Each released ordinary contact route SHALL choose exactly one certified Support handoff OR one action-qualified Verified Email Destination under P23. Staff notifications and visitor acknowledgement are independent children, not second Primary Outcomes. Browser/page-placement data SHALL not select recipients or override routing. The system SHALL not turn an email-only Primary Outcome into a Support record or fall back to a different owner after an ambiguous acceptance.”

**Proof:** Support success/notification failure, verified-email acceptance/bounce, absent destination, changed members and lost adapter result produce one preserved Primary Outcome and independently truthful children. No fallback duplicate is created.

### DC07 — Durable receipt must precede success, with safe retry after uncertainty

**High / likely over product lifetime. Changes the acceptance contract.** Mobile connection loss after commit can cause a second submission; recording a receipt before required outbox work can silently lose the accepted request.

> “Before returning Received, the owning transaction SHALL admit the exact validated occurrence, released purpose/route revision, Primary Outcome work intent, complete permitted child intents and shared dispatch/outbox records, or none. Semantic idempotency SHALL outlive provider/job dedupe windows. Retry of the same operation/payload reconciles its existing receipt; changed payload or scope cannot silently reuse it. An uncertain result SHALL be reconciled before offering a fresh submission. Identical text from different genuine occurrences is not a dedupe key.”

**Proof:** Crash before/after every commit boundary, duplicated POST, no-JS resubmit, parallel requests, lost response and changed-payload retry. Exactly one owner effect remains, without exposing the receipt/body to an unrelated requester.

### DC08 — Qualify a real ordinary-inquiry schema and missing-email behavior

**High / plausible. Changes fields and validation.** The published P23 contract supplies a purpose mechanism, not exact Contact fields. Copying arbitrary CMS questions or current email-shaped SQL would require unnecessary identifiers or accept unreachable work while promising a reply.

> “The ordinary replyable contact profile SHALL qualify a bounded message and reply email, with optional unsplit name and no mandatory subject/category/phone/CRM match/login. Missing or invalid reply email SHALL produce one accessible field error while preserving safe answers; the form SHALL not invent an address or Party. A separately configured real email/phone contact path remains available according to its own readiness; no phone service or callback is fabricated. Existing authorized self-contact may be visibly prefilled and edited, but never inferred from a represented Party or retained across an incompatible tenant/principal change. Entered identity is a requester claim, not verification.”

This is the recommended smallest complete **replyable** promise. If the final synthesis instead admits no-reply submissions, it must explicitly add an unreachable-source branch and truthful no-response expectation; a fake address is never acceptable. Uploads remain outside the P23 launch form contract; requesting sensitive screenshots is not a substitute for owner-authorized context.

**Proof:** Blank/invalid/international address input, optional names, long Unicode text, shared login, represented organization, autofill, lost session and wrong-tenant prefill. Valid unknown email does not create a CRM identity or initiate verification merely to ask an ordinary question.

### DC09 — Public and app producers cannot share untrusted scope or private payloads

**Critical / plausible. Changes the producer adapter contract.** The public endpoint derives a public Site generation; a portal Help request has authenticated owner context on a distinct host. Treating the portal as an arbitrary public Page or adding hidden private IDs to the public form bypasses source authorization.

> “Public website and authenticated app Help SHALL use explicit qualified producer adapters over the same purpose/occurrence/Primary Outcome semantics. Public producer scope is host/release-derived; app producer scope is current P12/principal/owner-derived. A contextual record link SHALL be an opaque purpose-bound owner reference revalidated at acceptance, not arbitrary hidden CRM JSON. On context loss/change, preserve only permitted ordinary contact content and require deliberate current requalification or removal of stale context; never silently retarget it.”

**Proof:** Form prepared under principal A then submitted under B, represented context changes, wrong source record, expired access, public anonymous request with forged context token and replay across environments. General contact remains possible without exposing the rejected record.

### DC10 — Form-origin Support work must remain truthful across CRM and email

**High / likely with current adapter reuse. Changes schema/DTO compatibility.** The current inbound adapter requires Resend IDs and email clocks. A visitor's text is neither provider email nor a staff-recorded D26 note. Fabricating one distorts history, CRM and service credit.

> “The certified Support handoff SHALL admit a typed visitor-form origin with immutable occurrence and trusted acceptance time. It SHALL preserve the visitor's admitted message and claimed contact as source data, with absent provider-email headers/IDs/timestamps until actual email exists. It SHALL not send a synthetic email to itself or call visitor content staff-recorded. D9/D26's same canonical Support detail and permission-aware CRM discovery shall consume qualified relevance/correspondence without duplicate Activity, Party creation or profile synchronization. Later staff email creates a real first mail lineage under current recipient authority.”

**Proof:** No prior email, later actual email, repeated form delivery, CRM linking/unlinking/merge, source expiry and legacy mapper behavior. All current consumers agree on the source; no fake Last email, inbound RFC message or donor last-contact effect appears.

### DC11 — Existing acknowledgments, targets and feedback need exact new-source qualification

**High / plausible. Narrows cross-feature triggers.** D13 explicitly accepts receiving-owner-qualified email and provider receipt. Generic created-conversation hooks could send both P23 and D13 confirmations or give a form fictitious first-email response timing and D28 eligibility.

> “A form submission SHALL not originate D13's email-source confirmation merely because it creates a conversation. Its optional P23 visitor acknowledgment is the separate qualified child. D14 targets and D28 feedback SHALL retain their exact accepted source predicates until an explicit new form-source applicability amendment qualifies trusted clock, audience, completion and evidence; no provider receipt, response credit or survey opportunity is inferred from form creation, article use or acknowledgment. An actual new email remains governed by its own source meaning.”

**Proof:** Form-only work, form plus acknowledgment, first staff mail, later real requester reply and repeated routing cause no duplicate confirmation or invented response credit. If the synthesis explicitly extends a source predicate, include direct positive/negative fixtures for that extension rather than treating it as already implemented.

### DC12 — Failure containment must not invent a functioning contact route

**High / plausible. Narrows fallback promises.** Guidance failure should not block contact, but all contact paths can themselves be unavailable. A stale cached address or fabricated phone number is not a safe availability strategy.

> “Guidance and contact failures SHALL be independent. A working qualified contact form remains usable when content fails. A contact-owner outage may accept only when its existing durable custody/retention/backlog contract can recover the promised work; otherwise it reports Not received and preserves safe input with an independently current qualified alternate contact if available. Unknown tenant, revoked route or invalid purpose cannot fall back to another tenant, destination or stale source. Offline UI shall not report Sent/Received or silently enqueue background contact.”

**Proof:** CMS outage, form owner outage, queue adapter outage, destination revoked, tenant unresolved, no JS, offline before POST and disconnection after commit. Distinguish not submitted from outcome unknown; reuse the same receipt path after reconnect. Do not add a device-offline sync platform or promise zero network failures.

### DC13 — Data constraints and RLS must enforce actual owner commands

**Critical / plausible. Changes storage/grants.** Existing broad same-tenant CRUD permits more than owner-qualified publication/intake. A private raw form envelope or configuration reference table must not become anonymously enumerable merely because its output is public.

> “Every operational configuration, occurrence and handoff has trusted non-null tenant scope, stable source identity, explicit valid state/recipient branches and tenant-aware owner relationships. Current Support text IDs remain text; CMS Page identities use typed soft references validated by the CMS owner, not cross-schema raw foreign keys or ID coercion. Unique entry configuration/head, occurrence idempotency and owner-effect constraints forbid duplicates. Public clients receive only narrow public projections and submission/receipt commands, with no raw configuration, occurrence or Support CRUD grants. Current command checks, effective USING/WITH CHECK, column privileges, invoker/definer views/functions and privileged worker paths SHALL preserve the same boundary.”

**Proof:** Actual `anon`, authenticated nonstaff, current scoped manager, other tenant and service-role command tests; forbidden tenant/actor/owner/state transformation; nullable branch constraints; duplicate ordered ref; stale expected revision; raw Data API and RPC attempts. Missing explicit WITH CHECK alone is not a finding when USING supplies the effective check.

### DC14 — Keep authority current without making copies permanent

**High / plausible. Changes lifecycle/custody.** Cached guide titles can survive withdrawal; raw form envelopes can become a second transcript archive; route change and restore can revive old authority or duplicate work.

> “Public guidance titles/links/preview and counts are derived under exact public generation plus current safety/reach proof; adverse withdrawal suppresses serving before physical cleanup. Contact occurrence, accepted Support content, short delivery repair envelope and body-free receipt/audit each retain their owning purpose/custody. Read, guide selection, CRM link, route repair or retry does not restart a source clock. Restore replays current restrictions/tombstones before serving or execution. Corrections preserve original effect meaning; neither reopening nor changing a route creates a new accepted occurrence.”

**Proof:** Withdrawal during cached read, source expiry during pending handoff, hold, purge/retry race, restore before restriction replay, route retirement after ambiguous success and currently permitted source correction. No raw answers, private context, receipt credentials or personal contact enter ordinary logs/analytics.

### DC15 — Safe rollout and evidence need explicit owner qualification

**High / likely if polished fixtures are treated as completed capability. Narrows release claims.** The current FAQ has hard-coded organization-specific financial claims, and existing Help/About is licensing information. A new feature cannot activate against those artifacts or incompatible email-only consumers.

> “Qualify the public/app Help entry, exact ordinary-inquiry purpose, Support/email Primary Outcome adapters, immutable receipts, current source projection and all consuming schema/DTO/search/report/history contracts before activation. Inventory hard-coded/demo Help claims and migrate only source-qualified references; never publish them as tenant policy. Use additive compatible migrations, old-writer fences and independently disable guidance without disabling qualified contact. Roll back only with proven new-data compatibility; otherwise roll forward without deleting accepted work.”

**Proof:** Empty tenant, legacy rows, old code/new schema, new code/old schema, paused guidance, paused intake, stale publisher and already-admitted work. Runtime SQL/provider/browser/accessibility proof is a release gate, not supplied by this source review.

## Owner map and logical constraint summary

| Authoritative fact                                                             | Owner                                                                 | D29 consumer duty                                                                                                       |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Public Page body, title, exact locale, route, release, reach and public safety | P23/P24 and actual classified source                                  | Use current public-safe projection; do not copy, override or infer.                                                     |
| Public Help placement/ordered selection                                        | Owning public Page/list release                                       | References and order only; ordinary P23 release; no mutable Support override.                                           |
| App Help entry/applicability and safe local draft                              | Owning app's bounded surface contract                                 | Current tenant/principal, approved task key and qualified public refs; no generic rules or persistent cross-user draft. |
| Contact form semantics/released route/occurrence/receipt/dispatch intent       | Shared P23 form/intake owner with explicit app producer qualification | One exact accepted operation; no second ledger, raw table write or route fallback.                                      |
| Support request and staff continuation                                         | Support certified handoff                                             | Real visitor-form origin, current D3/D6/D19 handling, D9 qualified CRM projection.                                      |
| Verified email Primary Outcome                                                 | Existing qualified email destination owner                            | Own recoverable delivery evidence; no duplicate Support record.                                                         |
| CRM/giving/identity contextual record and allowed disclosure                   | Existing source owner/P12                                             | Narrow current help-context reference; no automatic identity matching/creation or domain write.                         |
| Message content and preparation                                                | Email Studio/P17                                                      | Only actual qualified child or later reply; browsing has no message effect.                                             |
| Submission/delivery/provider truth                                             | P6                                                                    | Same effect, immutable prepared bytes and current source safety; no fabricated acceptance.                              |

Configuration lists need an explicit registered finite capacity, stable unique identity/order and batched current qualification. The user-facing small list does not justify hard-coding an unresearched performance claim or a second search engine. The accepted public/app source contracts should provide the exact limits and load budget during implementation qualification; they must be enforced server-side and visible in the maintenance experience, not silently clamped.

## Root-synthesis reconciliation and exact optional-leaf containment

The root's proposed complete D29 direction resolves the minimal field/selection choices: Help opens contact immediately, with at most **three** optional current Listed-publicly guide links and no new search/library. The ordinary-inquiry profile requires reply email and message, permits an optional unsplit name, and adds no subject/topic/login/attachments. Proposed limits are **10,000 Unicode scalar values** for the message, **200** for the name, and **256 KiB** for the raw request body, with the shared email owner's canonical limits. These are bounded product judgments, not existing source values or vendor norms. The form/parser must account for percent-encoded UTF-8 expansion and bound all metadata before parsing; 10,000 supplementary Unicode scalars can consume 120,000 bytes when each four-byte UTF-8 character is URL-percent encoded, before field names and other bounded fields.

Published monitored email/copy and optional published phone are separate **display** facts. Showing a qualified public contact address does not require a live Resend call, mailbox-open test or call-tracking service. Sending Asym-generated mail and accepting a form retain their separate readiness. No phone setup or staffing promise is invented.

The following is the exact P23 source-level amendment proposed to close the guidance-failure seam:

> “P23 SHALL qualify Optional Help guides as a bounded semantic leaf. The released Page intent pins at most three exact source-qualified Page references, their saved order, the leaf-contract and renderer generations, and its prequalified empty/unavailable presentation. D1 still releases one complete public generation. The leaf's current public-source admission may suppress unavailable or ineligible items without changing saved selection, rerouting contact, substituting guides, publishing another revision or rewriting the sealed Page. This explicitly qualifies Page references through the public reader; an existing Article Content-list source is not sufficient by inference. The form/direct-contact closure remains a required separate dependency. Optional guide failure alone suppresses that leaf and leaves the otherwise qualified contact presentation and command available. No ad-hoc template patching or favorable fallback to another generation is permitted.”

This uses the actual ADR0158 contained dynamic-source pattern and ADR0159 shrink-without-substitution semantics. It requires an explicit owner contract; it does not claim a new leaf is already implemented. Public guide inclusion still requires a normal Page/Site release; current source safety/reach may narrow the released reference list independently.

If the **Page/base/renderer/form closure itself** is unsafe or unavailable, the system must not manufacture a partial safe-looking generation. An independently qualified stable Contact route can remain reachable only through its own approved owner/host/current presentation; its identity cannot be guessed from a guide URL or unrelated latest mutable configuration. Public contact failure and optional guidance failure remain distinguishable. The app's bounded contextual mapping remains app-owned, with no shared mutable Support plan or personalized CMS audience.

## Required proof and operational closure

The tests described per clause are future actual proof, not executed in this source-only pass. They must include public website, authenticated donor app, relevant missionary/staff entry, unknown requester, CRM context and real no-JS/contact recovery journeys. Important zero-effect assertions are: no message on browse, no Party/Activity on selection, no second Primary Outcome, no false Received, no fake email origin and no auto-publication of Internal or Shared-by-link sources.

Only proportional residual operations belong in monitoring:

| Signal and threshold                                                                                       | Owner                                    | Response                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One confirmed cross-tenant/private/Shared-by-link discovery exposure or raw submission/credential leak     | Public content/security owner            | Stop affected serving/intake authority, contain current caches, preserve minimal evidence, repair and reprove negative access cases before re-enable.         |
| One accepted occurrence without its required durable owner intent/outbox, or one duplicate Primary Outcome | Form/intake owner plus destination owner | Stop affected admission, reconcile existing occurrence/effect identities, repair invariant; never ask visitors to create new copies of already accepted work. |
| One current contact entry with no qualified promised contact path                                          | Owning app/Site contact maintainer       | Expose truthful fallback/recovery, repair actual destination, requalify entry; do not substitute unverified addresses or invented staffing.                   |
| Owner-declared handoff retention/backlog/dead-letter threshold crossed                                     | Form/destination operations              | Recover or safely end exact pending work under existing custody; visible Needs attention, no unbounded retry or direct database repair.                       |

**Final synthesis:** Accept A with these owner/data amendments. First qualify exact public/app entry and inquiry-purpose ownership; then source references and current publication checks; then durable form admission and truthful Support-origin adaptation; then child communications and full CRM/context/recovery; prove lifecycle, authorization and mixed-version behavior before activation. A's usefulness comes from optional guidance and dependable direct contact. It does not require a new public library, mandatory self-service, private-knowledge publication, a generic form/rules platform or another CRM.
