Planning contract reconciled on 2026-09-22. Read [package authority and checkpoints](README.md) and [owner amendments](adoption-map.md). Source-era evidence is dated; runtime qualification remains open.

<a id="web-automation"></a>

# Fixed Web Studio workflows and automations

> **Integration note:** AU01–AU12 are required native Web Studio behavior, not optional Phase 34 templates. Keep the three Web delivery checkpoints independent from Workflow Studio. See [IG-05](../program-roadmap/integration-guide.md#ig-05).

These twelve automations implement product behavior; they are **not** tenant-authored workflows, a second Workflow Studio or a generic scripting system. AU01/AU02 are editor/request behavior, not Inngest functions. Background automations use the existing shared ledger/claims/identifier-only envelope. Tenants are scoped product records inside shared execution infrastructure, not separate workflow applications (R10).

“Automatically prepared” does not mean “automatically published.” Ordinary editorial auto-publication remains possible only where the existing owner policy explicitly permits it. New executable code needs independent admission and exact design activation.

<a id="web-h-au01-coalesced-editorial-autosave"></a>

## AU01 — Coalesced editorial autosave

**Trigger:** Tab becomes idle after a legitimate edit or Save now.

**Owner / workflows:** D12 Editorial operations; WF02, WF03, WF10.

**Durable effect identity:** Resource + actor session + lease generation + request fingerprint.

**Required effect and transaction boundary:** Validate structure, reprove lease/revision/permission; commit content and receipt together. No ordinary notifications, Git builds or public effects.

**Retry/reconciliation:** Serialize/coalesce; same command/key on lost acknowledgement; stop successor saves for stale/revoked/unknown outcome.

**Cancellation/expiry:** Hide/suspend stops renewal; preserve tab work; no persistent offline queue.

**User/operational visibility:** Existing D12 status control; cause-owned compare/repair.

<a id="web-h-au02-acknowledged-working-preview-refresh"></a>

## AU02 — Acknowledged working-preview refresh

**Trigger:** Exact save receipt received.

**Owner / workflows:** Preview operations; WF02, WF08, WF17.

**Durable effect identity:** Resource + acknowledged revision + renderer profile.

**Required effect and transaction boundary:** Refresh only the saved preview version; later local edits labelled unsaved. Never publish.

**Retry/reconciliation:** Deduplicate/coalesce obsolete requests; a failed renderer does not roll back the saved draft.

**Cancellation/expiry:** Discard obsolete UI responses by scope/revision; not a source rollback.

**User/operational visibility:** Show saved-versus-preview status separately.

<a id="web-h-au03-source-discovery-and-reconciliation"></a>

## AU03 — Source discovery and reconciliation

**Trigger:** Verified bound Git event or permitted Check source.

**Owner / workflows:** Integration owner; WF11, WF12, WF16.

**Durable effect identity:** Binding epoch + repository ID + exact commit + package root + policy.

**Required effect and transaction boundary:** Persist event before dispatch; discover eligible revision and request a bounded capture/build. No source writes or automatic activation.

**Retry/reconciliation:** Authenticated webhook receipt dedupe plus business identity; shared bounded reconcile for missed deliveries.

**Cancellation/expiry:** Binding revoke fences new intake. Superseding a discovery does not cancel explicit reviewed work without policy.

**User/operational visibility:** Source available/unavailable/changed with safe repair.

<a id="web-h-au04-clean-build-and-qualification"></a>

## AU04 — Clean build and qualification

**Trigger:** Authorized exact capture accepted for build.

**Owner / workflows:** Presentation build/admission owner; WF12, WF13.

**Durable effect identity:** Capture digest + toolchain/recipe/policy + request identity; attempts separate.

**Required effect and transaction boundary:** Claim product work; run isolated code; record exact artifact/evidence; hand to independent admission. Never grant the worker serving-head writes.

**Retry/reconciliation:** Transient infrastructure retries bounded; deterministic code/schema failures stop with diagnostics; reconcile unknown external task before retry.

**Cancellation/expiry:** Fence commits then terminate best-effort. A completed canceled attempt remains history, not admitted success.

**User/operational visibility:** Bounded log/proof projection and responsible maintainer.

<a id="web-h-au05-fixed-preview-candidate-preparation"></a>

## AU05 — Fixed preview/candidate preparation

**Trigger:** Authorized exact preview selection or design-review request.

**Owner / workflows:** D25/D1 and D10 owner; WF08, WF14, WF17.

**Durable effect identity:** Exact selected closure + artifact/settings + profile + policy.

**Required effect and transaction boundary:** Briefly snapshot, compile outside locks, reprove and seal complete candidate or none. Later drafts not silently included.

**Retry/reconciliation:** Current expected-head races obey owning reprepare rules; unknown receipt looked up.

**Cancellation/expiry:** Cancel/expire prevents further candidate use; does not alter live heads.

**User/operational visibility:** Preparing/ready/needs-attention/expired; exact excluded newer changes.

<a id="web-h-au06-scheduled-publication-executor"></a>

## AU06 — Scheduled publication executor

**Trigger:** D13 appointment reaches bounded handoff/due time.

**Owner / workflows:** D13 with shared Inngest execution; WF09.

**Durable effect identity:** Appointment ID + generation + immutable action fingerprint.

**Required effect and transaction boundary:** Read organization authorization and current safety; execute the same D1 command, preserving unrelated work.

**Retry/reconciliation:** Shared ledger/claim and overdue recovery; no-before time; stale event no-op; semantic conflict needs attention.

**Cancellation/expiry:** Generation-fenced cancel/replace; cannot undo committed effect.

**User/operational visibility:** Upcoming/Needs attention/History; resolved exact time.

<a id="web-h-au07-public-projection-convergence"></a>

## AU07 — Public projection convergence

**Trigger:** Committed D1/D10 generation receipt.

**Owner / workflows:** Existing cache/search/media delivery owners; WF08, WF14.

**Durable effect identity:** Generation receipt + projection owner + target version.

**Required effect and transaction boundary:** Dispatch identifier-only intents; make derived systems reflect committed public generation. No new favorable authority.

**Retry/reconciliation:** Version-aware replay ignores older favorable results; own proof/read policy handles current adverse safety.

**Cancellation/expiry:** Contained affected projection; never roll back content because a notification failed.

**User/operational visibility:** Published distinct from delivery/indexing convergence.

<a id="web-h-au08-adverse-public-safety-containment"></a>

## AU08 — Adverse public safety containment

**Trigger:** Current source owner withdraws eligibility/rights or revokes package.

**Owner / workflows:** Phase 10/media/package safety owner; WF04, WF08, WF14, WF18.

**Durable effect identity:** Adverse decision identity + affected scope/version.

**Required effect and transaction boundary:** Suppress through authoritative read/egress boundary immediately; invalidate dependent previews/candidates and converge caches.

**Retry/reconciliation:** Idempotent adverse replay; prioritize over routine build jobs. No wait for optional webhook or search index.

**Cancellation/expiry:** Only source-authorized successor can restore; no general retry that clears a restriction.

**User/operational visibility:** Visible private owning cause, no restricted public explanation.

<a id="web-h-au09-compatibility-and-impact-refresh"></a>

## AU09 — Compatibility and impact refresh

**Trigger:** Qualified manifest/catalog/settings change or authorized impact query.

**Owner / workflows:** Catalog/presentation owner; WF05, WF07, WF13, WF15.

**Durable effect identity:** Exact version tuple + scope + projection epoch.

**Required effect and transaction boundary:** Derive affected Page count/details allowed by permission; detect unsupported bindings. No automatic content mutation.

**Retry/reconciliation:** Bounded incremental rebuild; incomplete projection labelled unknown, never unused.

**Cancellation/expiry:** Newer version supersedes projected result without altering history.

**User/operational visibility:** Change impact and proposed repair/upgrade plan.

<a id="web-h-au10-repository-lifecycle-handling"></a>

## AU10 — Repository lifecycle handling

**Trigger:** Verified transfer/archive/remove/visibility event or explicit disconnect.

**Owner / workflows:** Integration owner; WF11, WF16.

**Durable effect identity:** Provider event + binding epoch + current provider evidence.

**Required effect and transaction boundary:** Rename updates labels; ownership/control changes require re-verification; disconnect fences new source work. Preserve admitted safe artifacts.

**Retry/reconciliation:** Reconcile ambiguous provider outcome; outage is not proof of deletion. Older events cannot reactivate access.

**Cancellation/expiry:** Explicit reconnect verifies both domains and increments epoch.

**User/operational visibility:** Actionable connection state without affecting routine editor access.

<a id="web-h-au11-dispatch-and-unknown-outcome-recovery"></a>

## AU11 — Dispatch and unknown-outcome recovery

**Trigger:** Shared recovery scan finds accepted unhandled/uncertain work.

**Owner / workflows:** Existing shared dispatch + effect owner; WF08, WF09, WF13, WF14.

**Durable effect identity:** Original dispatch/request/receipt identity.

**Required effect and transaction boundary:** Repair delivery or query original outcome under current registered purpose. Do not invent success from queue status.

**Retry/reconciliation:** Bounded backoff and claim fencing; semantic failure routed to owner; provider dedupe window not sufficient.

**Cancellation/expiry:** Disabled dispatch retains product records and manual safe recovery.

**User/operational visibility:** One grouped cause-owned exception, no per-retry notifications.

<a id="web-h-au12-preview-expiry-and-retained-artifact-maintenance"></a>

## AU12 — Preview expiry and retained-artifact maintenance

**Trigger:** Qualified expiry/retention job or authorized maintenance request.

**Owner / workflows:** Preview and custody owners; WF14, WF16, WF17.

**Durable effect identity:** Expired preview or retention decision + exact resource version.

**Required effect and transaction boundary:** Expire grants/compute; derive retained use evidence; purge only separately authorized eligible disposable bytes.

**Retry/reconciliation:** Idempotent operations with unknown deletion reconciliation; missing references block disposal.

**Cancellation/expiry:** Legal/operational holds and active references take precedence; no age-only admitted-artifact purge.

**User/operational visibility:** Capacity/expiry view and exact custody receipt, no raw bucket repair.

<a id="web-h-execution-requirements-common-to-background-work"></a>

## Execution requirements common to background work

Each work record has exact owner/scope, immutable request fingerprint, current policy/binding generation when relevant, not-before time where applicable, attempt count, claim owner/generation/expiry, truthful lifecycle and terminal receipt. A claim is renewed only while work is active. A later worker must not accept a stale worker's commit. Database claims and constraints enforce this; orchestrator concurrency limits are flow control, not database locks.

Persist original effect intent before dispatch. Reconcile ambiguous provider acceptance instead of creating a successor request. Inngest's documented event-ID deduplication window is 24 hours, so receipt uniqueness and fencing must survive longer replays (E23). A provider cancellation can prevent future work but is not a transaction rollback (E25).

Do not expose arbitrary retry counts, destination URLs, pipeline scripts, operation names, event predicates or secret parameters as tenant settings. The only staff controls are owner-approved source selection, cancellation, exact scheduling, preview and explicit repair actions. Notifications reuse the existing notification/communication owners and their templates; no direct provider sends from a new job.

<a id="web-h-automation-exclusions"></a>

## Automation exclusions

No automatic transcript/issue synchronization, generic CRM mutation, donor action, private media copying, developer-agent publication, tenant code in the workflow interpreter, new approval DSL, per-Tenant cron, or Payload Jobs publishing runner. GitHub source events never execute arbitrary code in a request handler and never set a live content head.

---
