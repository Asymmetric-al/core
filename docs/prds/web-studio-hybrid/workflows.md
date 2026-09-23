Planning contract reconciled on 2026-09-22. Read [package authority and checkpoints](README.md) and [owner amendments](adoption-map.md). Source-era evidence is dated; runtime qualification remains open.

<a id="web-workflows"></a>

# Core Web Studio workflows

These are specified product journeys, not claims about observed ministry behavior. Persona names do not grant capabilities. All normal paths have corresponding adverse acceptance scenarios in the OpenSpec and test matrix. Existing owner contracts remain authoritative.

<a id="web-h-wf01-create-a-visual-first-site-and-first-page"></a>

## WF01 — Create a visual-first Site and first Page

**Actor:** Authorized Site administrator, then content editor.

**Entry:** Phase 24 has a private, exact Site context and qualified default presentation; no repository is required.

1. Use the existing Site setup flow. Choose an exact locale and a qualified design; do not create domains, enable Giving or publish as hidden effects of choosing a template.
2. Create an ordinary Page from a versioned Page Starter or blank. Starter use copies initial semantic values once and records provenance; it does not establish live inheritance.
3. Open the Asym editor, acquire the exact Page Editorial lease and show the private draft. A fresh copied Page gets fresh component instance IDs.
4. Enter content and supported sections. Save through the acknowledged D12 operation. Configure placement and Navigation through their own explicit controls/owners.
5. Use preview and the existing Site go-live review when ready. Domain/locale readiness remains Phase 24-owned.

**Authoritative effect:** Creates private Page/Editorial data. Public effect only through the existing Site/publication owner.

**Automation:** Autosave; validation; acknowledged preview refresh.

**Failure/recovery:** No qualified Site/presentation means the dependent creation path is unavailable with an owner link. Partial setup is never called Live. A failed Page save cannot create a public route.

**Observable proof:** Staff creates a useful page with no GitHub account; second Site never inherits another Site’s draft or brand accidentally.

<a id="web-h-wf02-compose-and-edit-a-page-visually"></a>

## WF02 — Compose and edit a Page visually

**Actor:** Content editor with compose capability.

**Entry:** Exact resource, active lease, allowed composition profile, qualified renderer.

1. Select through canvas, outline or field list. A selection resolves to a stable node and an approved field path, not a guessed DOM index.
2. Insert, move, duplicate or remove approved nodes. Offer Move up/down/to and insertion controls usable without dragging. Reject illegal destinations before committing; repeat the rule on the server.
3. Change text, media references and permitted instance variants in the inspector. Local preview may show unsaved changes but must label them unsaved.
4. Coalesce local edit intents into one acknowledged save stream. Save now and keyboard save flush the same stream without publishing.
5. Open review against an exact saved revision; later private edits remain visibly outside that review.

**Authoritative effect:** Only the Page Editorial revision advances. No route, shared section, theme or public head changes implicitly.

**Automation:** AU01 autosave; AU02 validation/preview.

**Failure/recovery:** On permission loss stop writes. On failed validation preserve editable input. On stale revision stop autosave and show Started from / Current draft / Your unsaved work. No silent merge.

**Observable proof:** Canvas and non-canvas operations produce identical canonical documents; text changed after developer redesign still updates the correct rendered field.

<a id="web-h-wf03-use-bounded-advanced-layouts"></a>

## WF03 — Use bounded advanced layouts

**Actor:** Site designer or compose-authorized editor.

**Entry:** HA-A1 adopted; composition/2 qualified for ordinary Page; Article remains restricted.

1. Insert Stack, Split or Grid from the small layout group. Names describe intent, not HTML/CSS implementation.
2. Place eligible leaves in named slots; use at most two container levels. Slot rules and descendant counts are checked on movement, paste, duplication and restore.
3. Choose bounded density, width, surface tone, alignment and layout variants. No CSS input, custom breakpoint JSON, hidden mobile copy or alternate reading order is accepted.
4. Inspect narrow, medium and wide previews plus free resize; the package’s responsive rules adapt the one DOM order.
5. Save and publish as a composition change using the same editorial/release path as WF02/WF08.

**Authoritative effect:** A new canonical composition revision; does not mutate component source or Site brand.

**Automation:** Structural validation and preview only.

**Failure/recovery:** Unknown containers, excessive depth, over-limit nodes or illegal Hero placement remain unpublishable; raw input survives for repair, no trimming. Unsupported existing versions open safely without automatic conversion.

**Observable proof:** A long translated Split layout collapses without content loss or visual/DOM reordering; non-drag moves work on touch and keyboard.

<a id="web-h-wf04-select-and-replace-qualified-media"></a>

## WF04 — Select and replace qualified media

**Actor:** Content editor.

**Entry:** Same-Tenant media catalog and current Site-use policy.

1. Open the existing media picker from a declared field. Search only authorized current media; do not accept arbitrary bucket URLs as equivalent references.
2. Select a specific ready revision/rendition. Enter usage-local alt text, caption, crop and decorative treatment appropriate to this placement.
3. Preview the exact media reference in content. Stale/blocked media becomes an actionable validation result, not a silent replacement.
4. Save permitted draft references. Before release the media owner re-proves current eligibility, rights and ready rendition bytes.

**Authoritative effect:** Placement metadata changes; bytes and rights remain at Phase 29/D27.

**Automation:** Existing intake/rendition workflows and dependency-health refresh; no second pipeline.

**Failure/recovery:** A revoked image is suppressed through the existing adverse path even when present in a prior generation. Draft repair never exposes private originals.

**Observable proof:** Two placements of one image retain different alt/crop metadata; revoked rights defeat a stale candidate and cached positive qualification.

<a id="web-h-wf05-reuse-a-section-without-hidden-global-edits"></a>

## WF05 — Reuse a section without hidden global edits

**Actor:** Editor authorized for Page and, separately, reusable resource.

**Entry:** Root-only same-Site/exact-locale/family-compatible Reusable Section support.

1. Select an existing reusable section or explicitly create one using the existing D8 operation.
2. Insert a root reference in the Page. The canvas identifies shared content and its scope.
3. Edit shared content in its own resource session; do not use a Page lease to write it. Show authorized affected Pages.
4. Choose the existing owner’s exact publication closure; unrelated drafts remain private. Unlink/copy creates an independent local value only through the explicit supported command.

**Authoritative effect:** Separate Page and reusable revisions; release manifests determine actual impact.

**Automation:** Rebuild derived usage/health projection after acknowledged meaningful changes.

**Failure/recovery:** Recursive reuse, nesting reusable references in containers or cross-Site linkage is denied. An incomplete usage index cannot claim safe deletion or authorize publication.

**Observable proof:** Editing a shared quote does not silently publish ten drafts; independent local copy no longer tracks shared edits.

<a id="web-h-wf06-create-or-update-an-exact-locale-version"></a>

## WF06 — Create or update an exact-locale version

**Actor:** Locale-authorized editor.

**Entry:** Phase 24 locale exists; D22 lineage rules available.

1. Start blank or copy from an explicitly chosen exact source revision. Show provenance, not implied synchronization.
2. Translate content using the same supported composition grammar; each locale retains its own opaque node identities and editorial lease.
3. Preview RTL/CJK/long content with the chosen Site design. A missing locale does not fall back silently.
4. Publish only the selected locale through its existing operation. Whole-Site presentation replacement uses WF14, not ordinary publish-all.

**Authoritative effect:** An independent exact-locale private successor/public generation.

**Automation:** Source-changed comparison indicator and compatibility diagnostics; no automatic translation or overwriting.

**Failure/recovery:** Source edits after copy do not overwrite translated content. Missing family/locale support blocks dependent custom design activation, not unrelated valid locale editing.

**Observable proof:** A Thai Page and English source can diverge safely; copying produces private work and cannot change locale enablement.

<a id="web-h-wf07-change-site-appearance-or-a-supported-component-variant"></a>

## WF07 — Change Site appearance or a supported component variant

**Actor:** Designer with correct appearance/compose permission.

**Entry:** Qualified package exposes a declarative settings schema; current Brand Version from Phase 24.

1. Distinguish a Page instance variant from Site-wide appearance. Show affected scope before editing a Site-wide setting.
2. Choose registered colors/type roles, compatible fonts and finite design variants using platform fields.
3. Validate changes against all relevant content families/locales and existing media/brand rules.
4. Prepare the exact appearance candidate. Activate Site-wide design through D10/Phase 24, not a prose autosave.

**Authoritative effect:** Per-instance variants advance Editorial; Site appearance advances its own version and complete-cohort design activation.

**Automation:** Compatibility checking and fixed candidate preparation.

**Failure/recovery:** Unsupported setting values cannot enter publication. Switching packages does not erase old compatible settings or silently coerce them; explicit migration plan required.

**Observable proof:** Content-only editor cannot change a whole Site brand; Page variant changes do not affect sibling Sites.

<a id="web-h-wf08-review-and-publish-content-or-composition"></a>

## WF08 — Review and publish content or composition

**Actor:** Authorized content publisher or existing approved automatic-content path.

**Entry:** Exact acknowledged source and applicable tenant publication policy.

1. Flush the editor or select a known saved checkpoint. Display the exact included revision and explicitly excluded later drafts.
2. Prepare through the existing D1 command: collect exact semantic dependencies and current owner eligibility; compile outside short database locks.
3. Inspect the fixed Page or whole-Site candidate as applicable. Separate hard source invariants from advisory content assistance.
4. Activate only after fresh authority, expected-head and dependency proof. Preserve unrelated public content.
5. Show Published when the authoritative receipt commits; display cache/search convergence separately only when it needs attention.

**Authoritative effect:** One existing D1 generation/head transition and durable receipt/outbox.

**Automation:** AU07 convergence; no Git commit or Core code rebuild.

**Failure/recovery:** Lost acknowledgement resolves the existing receipt. A stale target or changed safety fact cannot be rounded into success. A newer private draft alone does not rewrite or necessarily invalidate an explicitly selected older reviewed revision.

**Observable proof:** Reviewer publishes the selected headline while later private draft remains private; failed compile keeps the previous safe generation.

<a id="web-h-wf09-schedule-exact-content-publication-or-removal"></a>

## WF09 — Schedule exact content publication or removal

**Actor:** Authorized scheduling actor.

**Entry:** D13 exact organization-owned appointment contract and compatible D1 path.

1. Choose one-time publish or unpublish. Show Site/path/locale, exact selected revision for publish, civil time, IANA zone, selected offset and UTC instant.
2. For repeated/nonexistent local times require a valid explicit interpretation. Validate publish-before-unpublish when both unresolved actions exist.
3. Record the immutable appointment and responsible owner; later autosave shows Not included in scheduled version.
4. Change, cancel or replace through fenced successors. At due time invoke the same D1 operation after current semantic/safety proof.
5. Routine initiator offboarding does not erase the organization’s valid appointment; explicit invalidation or owner policy does.

**Authoritative effect:** At most one unresolved appointment per Page/locale/action and one receipt per exact scheduled effect.

**Automation:** AU06 six-day-horizon dispatch and shared overdue reconciliation.

**Failure/recovery:** A stale dispatched event no-ops after cancel/reschedule. Unrelated publication permits only bounded reprepare preserving pinned meaning; semantic changes require attention. No job or date field is publication authority.

**Observable proof:** Execute/cancel races yield one permitted effect; an appointment after provider dedupe expiry still cannot publish twice.

<a id="web-h-wf10-recover-a-save-conflict-or-restore-a-draft"></a>

## WF10 — Recover a save conflict or restore a draft

**Actor:** Editor; distinct takeover permission when needed.

**Entry:** D12 lease and expected revision; readable current/history scope.

1. A second tab or person opens read-only with bounded editor identity. Choose return later or explicit authorized takeover.
2. Takeover atomically checkpoints and transfers the lease generation. Displaced tab becomes read-only and retains unsent work only in memory.
3. Compare Started from, Current draft and Your unsaved work. Copy intended changes into a newly authorized session rather than merge automatically.
4. Restore a historical version only as a new private draft after current compatibility proof and a checkpoint of the current draft.

**Authoritative effect:** A fenced lease transition and/or private editorial successor; never a public rewind.

**Automation:** Identical-key receipt recovery for lost acknowledgements only.

**Failure/recovery:** Hidden/suspended tabs stop lease renewal. Reauthentication does not restore revoked permission. Browser/device loss may lose never-acknowledged edits; the UI does not promise otherwise.

**Observable proof:** Two same-user tabs cannot race silently; restore retains published output and meaningful history.

<a id="web-h-wf11-connect-a-ministry-controlled-custom-repository"></a>

## WF11 — Connect a ministry-controlled custom repository

**Actor:** Asym connection manager with verified provider authority.

**Entry:** GitHub App minimum permission profile; exact Tenant/environment/Site project.

1. Choose Connect custom source from Site design/developer settings, not ordinary content onboarding.
2. Complete the provider installation flow with state/CSRF binding and independent verification of user authority for installation and repository.
3. Select the exact repository and one package root within it. Show access requested and confirm the Asym Site/environment target.
4. Persist verified immutable repository ID, installation link, approved package location and binding revision; never map solely by owner/name URL.
5. Validate the package manifest as data before executing anything. Show Connected separately from Package ready or Live.

**Authoritative effect:** One scoped binding plus attributable receipt; no source execution or public effect in the callback.

**Automation:** AU03 source discovery only after authorized connection.

**Failure/recovery:** Spoofed installation ID, repo transfer, expired state, missing provider rights and wrong Tenant fail closed. Ministry-owned repositories may be private; privacy is not clearance for operational data.

**Observable proof:** A repo administrator without Asym permission cannot connect another Tenant; an Asym admin without repository authority cannot seize source.

<a id="web-h-wf12-develop-a-custom-presentation-through-normal-tools"></a>

## WF12 — Develop a custom presentation through normal tools

**Actor:** Ministry-appointed developer.

**Entry:** Supported SDK/template, repository access and synthetic fixtures.

1. Clone the repository, install the locked project with the qualified toolchain and start the local production-shaped preview.
2. Edit React/TSX and styles using any suitable editor. Implement existing semantic inputs and declared visual controls; platform capabilities remain SDK-mediated.
3. Run typecheck, contract, binding, responsive, accessibility and dependency checks locally. Use source maps and real debugging rather than disconnected snippets.
4. Commit changes and submit normal source review. Code branches use fixtures or exact permitted snapshots, never authoritative CMS working branches.
5. Select an exact reviewed revision for Asym qualification. The external agent follows the same workflow and has no extra privilege.

**Authoritative effect:** Changes source only; no application database writes.

**Automation:** Optional AU03/AU04 builds on the approved integration branch, never publication.

**Failure/recovery:** A custom component without a working binding is rejected at qualification; hardcoded required fields must be detected by known binding tests and review. Arbitrary React editability is not guaranteed.

**Observable proof:** Fresh clone works without Core private source, production credentials, Asym IDE or model account; staff editing still works after redesign.

<a id="web-h-wf13-build-and-independently-admit-custom-presentation"></a>

## WF13 — Build and independently admit custom presentation

**Actor:** Source ingestion worker, independent qualifier and named maintainer.

**Entry:** Exact authorized source request, budget, qualified build image and admission profile.

1. Capture exact Git tree, package location, lock and manifest through a credential-bearing trusted fetch service; remove Git credentials before any package script executes.
2. Run locked install/build/tests in isolated nonproduction execution with approved dependency acquisition, no production data and enforced resource budgets.
3. Produce immutable artifact digest, dependency/license evidence, source mapping and compatibility report. Do not trust self-reported repository checks as final proof.
4. Run platform-controlled conformance, browser, safety, dependency and boundary checks outside the submitted test oracle.
5. Qualified authority admits the exact version only after required maintainer/review proof. Human source approval does not automatically activate a website.

**Authoritative effect:** Immutable source/build/admission records and custody; public registry availability handled by controlled deployment.

**Automation:** AU04 qualification, AU05 exact candidate readiness.

**Failure/recovery:** Failure retains evidence with safe diagnostics; a result arriving after binding cancellation cannot advance. Registry or artifact corruption blocks use. A signature proves provenance, not behavioral safety.

**Observable proof:** Malicious postinstall cannot read the source-fetch token; weakened repository tests cannot pass independent forbidden-import/binding checks.

<a id="web-h-wf14-review-and-activate-a-custom-site-design"></a>

## WF14 — Review and activate a custom Site design

**Actor:** Design-intent reviewer, qualified admission owner, authorized design publisher.

**Entry:** Admitted artifact and deployment-compatible renderer; Phase 24 complete locale census.

1. Make the admitted package version available through the controlled public runtime build/registry. This deployment alone must not switch current Sites.
2. Prepare exact candidate generations for every public locale and a disposition for enabled nonpublic locales using current content and supported settings.
3. Review actual content across required families, viewports and reduced motion. Show exact package/source identity to authorized technical reviewers and understandable design scope to staff.
4. Commit through D10: re-prove permissions, cohort, dependency eligibility and every expected head; advance all or none.
5. Display design activation separately from delivery convergence. New source or drafts remain separate unless explicitly included in a successor candidate.

**Authoritative effect:** Existing D10 all-or-none head transition; no route/content/locale/money changes by implication.

**Automation:** AU07 delivery convergence.

**Failure/recovery:** Changed cohort, incompatible content, unavailable registry version or revoked eligibility blocks exact effect. Restore previous design prepares a new successor over current compatible content; never sets a mutable global theme pointer.

**Observable proof:** One locale failure prevents partial design activation; deployment skew never silently serves another package.

<a id="web-h-wf15-evolve-a-semantic-type-or-migrate-presentation-settings"></a>

## WF15 — Evolve a semantic type or migrate presentation settings

**Actor:** Platform catalog owner; authorized migration operator; affected editors.

**Entry:** Explicit catalog/schema amendment and new reader support already deployed.

1. Classify the request: visual-only change uses existing meaning; new authorable meaning requires the catalog owner, not a private package-only schema.
2. Define additive versioned schemas, standard fallback, editor fields, renderer mapping and exact historical migration behavior.
3. Prepare a no-write bounded migration plan over selected acknowledged revisions. Include counts, changed fields, incompatible cases and expected source revisions.
4. Commit private successors through registered operations after fresh policy/lease-or-audited-override proof. Preserve raw incompatible inputs for repair.
5. Publish only through ordinary exact release operations; retain old supported readers for referenced history until proof allows retirement.

**Authoritative effect:** Catalog and compatible private successor changes; no read-time migration or hidden publication.

**Automation:** AU09 compatibility analysis; owner-approved bounded migration batches.

**Failure/recovery:** Concurrent staff edits invalidate only affected planned mutations; do not replace their work. Unknown/newer schema does not drop nodes. An irreversible data shape change is roll-forward, not a fake rollback.

**Observable proof:** Old and new readers/writers are tested both ways; production content is never replaced by the developer database.

<a id="web-h-wf16-replace-a-developer-reconnect-or-disconnect-source"></a>

## WF16 — Replace a developer, reconnect or disconnect source

**Actor:** Ministry repository controller and Asym connection manager.

**Entry:** Current source binding and rights/retention policy.

1. Update developer access in the ministry’s own repository; Asym access changes only through Asym authority.
2. For replacement repository, verify a new pending binding and package compatibility before explicit switch. Keep former source provenance in history.
3. Disconnect source access and increment its fence. Stop future source captures and unadmitted pending work; resolve in-flight results by receipt.
4. Keep existing licensed, safe, compatible admitted artifacts and normal CMS operations available. Explain independently owned Site retirement and safety withdrawal.
5. Provide a rights-scoped source/config/export manifest and maintainer handoff guide; do not promise a standalone copy of Asym.

**Authoritative effect:** Binding lifecycle changes, not deletion of content, retained artifacts or unrelated grants.

**Automation:** AU10 connection reconciliation; AU12 retention-qualified cleanup.

**Failure/recovery:** Outage is not proof of ownership transfer. Old events cannot reactivate disconnected binding. Reconnecting requires fresh two-domain verification.

**Observable proof:** Agency replacement during staff editing preserves content and live safe website; duplicate events cannot reconnect old source.

<a id="web-h-wf17-inspect-an-exact-private-preview"></a>

## WF17 — Inspect an exact private preview

**Actor:** Authorized editor/reviewer.

**Entry:** Saved revision/candidate entitlement; admitted code for real content.

1. Use live local visual feedback for editing, clearly labeled when unsaved. Refresh server preview only against acknowledged revisions.
2. Prepare a fixed candidate for review. Every route remains candidate-local, including navigation, links and 404s.
3. Access through session-bound preview authorization; opaque candidate IDs are not bearer permissions. Recheck scope on every protected request.
4. Inspect responsive, locale, reduced-motion and no-JS modes. Consequential islands show inert previews; they do not send, charge or enroll.
5. Expire/revoke preview safely. A closed preview does not redirect to a live private-looking URL or change content.

**Authoritative effect:** Private ephemeral preview and exact review evidence only.

**Automation:** AU02/AU05 preview refresh and preparation; AU12 expiration.

**Failure/recovery:** Canvas/preview crash cannot erase acknowledged data or reveal raw Payload Admin. Unknown origin/message/schema is ignored and audited without persisting hostile payload.

**Observable proof:** Preview cannot submit real donations/forms, access another Tenant or fall through to Live when a route is absent.

<a id="web-h-wf18-hand-over-the-website-and-use-approved-platform-capabilities"></a>

## WF18 — Hand over the website and use approved platform capabilities

**Actor:** Developer and real staff representative.

**Entry:** Admitted presentation and supported content/feature profiles.

1. Demonstrate new page creation, media replacement, layout changes, preview and appropriate publication with staff operating the controls.
2. Document which fields, variants and global settings staff control and which changes need a developer. Show affected-page impact for shared components.
3. Use giving, forms, navigation and dynamic lists only via their current owner-defined placements/capabilities. Do not create a new semantic block when its owner contract is unavailable.
4. For dynamic data store source-qualified references or selection intent, not copied donor/missionary/financial records. Financial totals cannot be hand-edited as if ledger-derived.
5. Provide maintenance, dependency and export instructions. External coding agents use the same fixture and source boundaries; no model connection is required for ordinary editing.

**Authoritative effect:** Handoff evidence and supported existing owner interactions; no new operational truth.

**Automation:** Existing owner workflows for actual public actions; previews remain dark.

**Failure/recovery:** Missing owner capability is intentionally unavailable. A misleading editable field or secret-bearing fixture fails handoff. Staff cannot be trained around a broken binding as a substitute for repair.

**Observable proof:** A staff member independently completes representative tasks; restricted worker identity never enters custom code props, fixtures, public search or logs.

---
