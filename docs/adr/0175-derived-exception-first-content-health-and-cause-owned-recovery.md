# ADR-0175: Derived exception-first Content Health and cause-owned recovery

**Status:** Accepted (founder-ratified Phase 23 D31 C-prime-R, 2026-08-24)

## Context

Phase 23 has multiple source-owned workflows whose failures can affect public
content: Page and navigation release, schedules, search projection, forms,
media, imports, localization, Preview, and other bounded CMS operations.
Without one product-level explanation, nonprofit ministry staff would have to
hunt across screens or interpret Payload, Supabase, Inngest, database, and
provider details. A raw operations dashboard would expose implementation
machinery, while scattered status badges alone would hide cross-surface
exceptions and recovery ownership.

The durable boundary is one quiet, exception-first, source-derived Content
Health projection and staff workspace. It explains current source truth,
visitor impact, responsibility, progress, evidence freshness, and the safest
next action. It owns no publication, workflow, audit, provider, authorization,
or repair truth. Source surfaces remain authoritative, D30 governs rare deep
diagnosis, and only cause-owned typed commands may perform direct recovery.

## Decision

<!-- prettier-ignore -->
> **C-prime-amended-and-hardened (C-prime-R) — One quiet, derived,
> exception-first Content Health Workspace and contextual Health Status over
> source-owned product facts, with evidence-freshness truth, visitor-impact and
> responsibility clarity, cause-owned typed Recovery Commands, and D30-governed
> operator diagnostics; never a second workflow, audit, provider, or publication
> authority.**
>
> 1. **One boundary and plain vocabulary.** The staff destination is **Content
>    health**, one currently actionable condition is a **Health issue**, a
>    source's minimal typed observation or receipt is **Health evidence**, the
>    rebuildable read model is the **Content Health Projection**, and a
>    corrective effect is a source-owned **Recovery command**. Staff-facing copy
>    uses the affected content, visitor impact, responsibility, and next action;
>    it does not require knowledge of Payload, Supabase, Inngest, queues, jobs,
>    webhooks, RLS, caches, indexes, adapters, or provider error codes.
> 2. **D31 derives and explains; it never becomes truth.** Publication,
>    withdrawal, navigation, schedule, search, media, form, localization,
>    import, safety, and configuration facts remain with their settled owners.
>    D31 may read their current product records, desired-state targets, receipts,
>    and bounded probes through typed adapters, then project a staff explanation.
>    Editing, deleting, acknowledging, snoozing, rebuilding, or losing the
>    projection cannot change content, public state, desired intent, permissions,
>    or an owning domain's recovery lifecycle.
> 3. **The issue-family registry is small, code-owned, and versioned.** Every
>    admitted family names its owner, source facts, exact scope, subject type,
>    safe summary template, visitor-impact evaluator, evidence-freshness budget,
>    responsibility rule, contextual destination, optional allowlisted Recovery
>    command, resolution proof, redaction policy, and tests. Launch covers the
>    Phase 23 operational families already required—release/unpublish,
>    schedules, routes/redirects/references, cache delivery, search convergence,
>    media processing, orphaned placement, Site/locale validity, forms, and
>    migration validation. Tenants cannot create arbitrary health rules,
>    scripts, thresholds, SQL, or provider mappings.
> 4. **Every issue has exact, non-defaulting scope and stable identity.** An
>    issue key binds contract version, environment, Tenant, optional affected
>    Site and locale, owner domain, issue family, subject type and immutable
>    subject identity, plus the desired-state generation or intent epoch whose
>    outcome is being checked. Missing, ambiguous, default, slug-derived,
>    cross-environment, or unproved scope fails closed. A Tenant-level issue may
>    appear in an affected Site's workspace, but the interface never silently
>    unions Sites or switches context.
> 5. **The projection stores the minimum current explanation, not a shadow
>    domain.** It may retain the issue key, safe labels, disposition, impact,
>    responsibility, source pointers/digests, evidence and transition times,
>    contextual/recovery references, safe correlation code, and bounded recent
>    resolution metadata. It stores no copied content body, form submission,
>    donor or missionary sensitive data, provider payload, raw log, stack trace,
>    credential, signed URL, arbitrary JSON state, or independent retry history.
>    Source receipts and the existing audit remain authoritative history.
> 6. **Fresh evidence is required for a favorable claim.** Each issue family has
>    one documented, testable code-owned freshness and overdue policy based on
>    visitor risk and the owning domain's delivery promise. **No issues need your
>    attention** appears only when every required family has supplied a current
>    successful watermark for the selected scope. Missing, stale, contradictory,
>    or unavailable evidence becomes **Health check incomplete**; it never
>    becomes zero, healthy, completed, or silently omitted.
> 7. **Resolution requires source-owned outcome proof.** Queue acceptance,
>    dispatch, worker completion, provider acceptance, cache invalidation,
>    notification delivery, or a user clicking an action is not resolution.
>    The owning adapter closes an issue only after current desired intent and
>    exact source/version/readback evidence prove the required outcome. A newer
>    intent supersedes the older issue; an old event or late receipt cannot close
>    or resurrect the wrong generation. No user-facing **Mark fixed** control
>    exists.
> 8. **Four active dispositions answer who acts next.** **Needs your action**
>    means an authorized tenant staff action is now required; **Being handled
>    automatically** means a bounded recovery is active and staff should wait;
>    **Needs platform attention** means Asym owns the next step and staff should
>    not experiment; **Health check incomplete** means Asym cannot currently
>    make a fresh favorable claim. Resolved issues move to **Recently resolved**
>    for a code-owned 30-day presentation window, which is not an audit or data-
>    retention promise.
> 9. **Impact, responsibility, progress, and urgency are separate facts.** A
>    source adapter evaluates confirmed or reasonably bounded public impact,
>    such as no confirmed visitor impact, content at risk, limited degradation,
>    public content unavailable, or privacy/safety risk. It separately identifies
>    **Your team**, **Automatic recovery**, or **Asym** as the next responsible
>    party. Presentation order uses safety and current visitor impact first,
>    then breached deadline, staff actionability, breadth, and age; a frightening
>    color or raw failure count never substitutes for those facts.
> 10. **Job states map through product meaning, not one universal lookup.**
>     Queued, running, retrying, completed, failed, dead-lettered, cancelled,
>     and overdue execution facts remain available in source receipts. Context
>     may show queued/running/completed progress after a staff action. The central
>     workspace includes in-progress work only when it is user-visible, long-
>     running, approaching a promise, or already an exception; routine fast work
>     stays silent. Failed, dead, cancelled, and overdue facts are classified by
>     current impact and next owner—not all labelled urgent and never all given
>     the same Retry button.
> 11. **Exception-first means quiet, not hidden.** Normal completed operations,
>     transient retries inside their proven recovery budget, passed checks, and
>     low-level provider events do not fill the default view or notification
>     stream. Active adverse public safety, staff-action, overdue, exhausted,
>     materially degraded, and incomplete-evidence conditions remain visible.
>     Automatic work is summarized by stable cause, not by attempt. Staff can
>     deliberately open Recently resolved or contextual receipts without a
>     permanent green-check dashboard.
> 12. **Grouping is causal and lossless.** Duplicate deliveries and repeated
>     observations update one stable issue. Multiple resources may group only
>     when they share the same owner, root cause, disposition, recovery, and
>     scope; the group shows an accurate count and a bounded affected-resource
>     preview with an accessible full list. Similar wording, time proximity, or
>     provider error alone cannot group issues. A worsened, reopened, differently
>     owned, or independently recoverable condition separates or reopens visibly.
> 13. **The workspace has one calm information architecture.** In the exact
>     active organization, environment, and Site context, the header shows
>     **Content health**, the scope, and **Last verified** time. Four ordinary,
>     link-native, URL-preserved views are **Needs your action**, **Being handled
>     automatically**, **Needs platform attention**, and **Recently resolved**;
>     no custom tab state or horizontal-only control is required. A privacy/safety
>     risk or broad current public harm appears first regardless of disposition;
>     otherwise **Needs your action** is the default. Health-check incompleteness
>     is a scoped coverage notice, not a fifth work view; any useful next step is
>     listed under the staff or platform view that owns it. It is always placed
>     before a favorable summary. Search and a small
>     set of URL-preserved filters cover content/type, locale, impact, and
>     disposition; launch has no configurable dashboard, widgets, scoring,
>     charts, saved-health views, or rule builder.
> 14. **Every issue row answers seven questions without opening diagnostics.**
>     It states: what happened; which content and exact Site/locale are affected;
>     what visitors may experience; who acts next; what is happening now; when
>     it was last verified and what deadline or next check applies; and the one
>     best available action. A stable status label, icon, and text—not color
>     alone—convey disposition. Provider codes and correlation identifiers live
>     under progressive detail or a Copy support details action, not in the
>     primary sentence.
> 15. **Central and contextual status are the same issue, not synchronized
>     copies.** A Page, navigation item, schedule, media item, form, search
>     profile, import, or other source surface may show one compact Health Status
>     chip and plain explanation resolved from the same issue key. It links to
>     the URL-addressable Content Health detail. The central issue's source action
>     returns to the exact authorized object and location. Fixing either view is
>     reflected by source proof everywhere; there is no manual dual update.
> 16. **Detail uses progressive disclosure and preserves orientation.** Launch
>     uses one canonical, full, URL-addressable issue page at every breakpoint;
>     it does not duplicate state and focus behavior across a desktop drawer and
>     mobile page. The route preserves heading, browser history, return path,
>     keyboard order, and deep links. Its first screen gives impact,
>     responsibility, next step, affected resources, and a plain timeline. A
>     secondary **Technical details for support** section may reveal safe evidence
>     times, versions/digests, transition classes, and a correlation code only
>     where authorized. Raw provider logs and D30 diagnostics never appear there.
> 17. **No-issue and unavailable states are truthful and useful.** After complete
>     fresh evidence, the empty state says **No issues need your attention**,
>     names the selected scope and verification time, and quietly links to recent
>     resolutions; it does not promise that every external service, crawler,
>     browser cache, or future operation is healthy. During initial calculation
>     it says **Checking content health**. Partial failure retains known active
>     issues, replaces unreliable counts with an unknown marker, identifies the
>     categories not freshly checked in plain language, and offers one safe next
>     step without suggesting repeated refreshes.
> 18. **The primary staff journey is discover, understand, act once, and verify.**
>     Navigation shows a numeric action count only for active **Needs your
>     action** issues. A separate plain, nonnumeric indicator may call attention
>     to privacy/safety risk, broad current public harm, or a materially
>     incomplete check that staff must understand; routine automatic work and
>     unchanged platform detail never badge the navigation. Opening an indicator
>     lands on the exact context and the highest-impact relevant issue. Staff
>     read one sentence, follow one cause-owned action, make the correction in
>     its familiar source surface, and return to **Verifying the fix**. The issue
>     resolves automatically only after proof; unknown outcomes show the last
>     acknowledged state and do not invite duplicate action.
> 19. **Onboarding from another CMS is staged and non-alarming.** D29 remains
>     import and migration authority. First use gets one dismissible compact
>     explanation above real current status—not a modal tour or coach-mark
>     carousel—and a persistent **What is being checked?** disclosure. Before an
>     imported draft is eligible for
>     D1 activation, D31 explains **Checking imported content**, then derives
>     migration-validation exceptions by familiar objects—Page, image, link,
>     locale, form, or navigation—not legacy provider tables or codes. Each issue
>     links to D29's exact validation or source editor. Existing public content
>     is not represented as changed merely because a health scan is running, and
>     no celebratory all-clear appears until required evidence is complete.
> 20. **Notifications follow transitions and responsibility, not retries.** The
>     quiet in-product workspace is the default. One deduplicated notification
>     may occur when a new issue first needs the recipient's action, materially
>     worsens, reopens, crosses its code-owned deadline, or changes responsibility.
>     Privacy/safety or broad current public harm follows the existing urgent
>     incident policy. Automatic attempts, unchanged reminders, successful
>     routine checks, and provider flapping do not notify. Delivery channel,
>     digest, and escalation remain with the existing notification capability;
>     D31 creates no email or paging engine.
> 21. **Acknowledgement, reminders, and resolution cannot be confused.** A
>     bounded shared **Reviewed** receipt may state which authorized staff member
>     saw the issue and when; it changes no disposition, impact, responsibility,
>     ordering, count, source fact, or release gate. D31 launches without shared
>     assignment, ownership claiming, approval, comments, due dates, or a **Mark
>     fixed** workflow. If an issue family permits **Remind me later**, it is a
>     personal presentation preference bounded by a code-owned maximum and never
>     extending beyond a source deadline when one exists. It never hides the issue from the shared
>     workspace, contextual status, or another user's view; it is unavailable for
>     privacy/safety or currently urgent issues and is cancelled by worsening,
>     reopening, responsibility change, or access change. Reviewed and reminded
>     issues resolve only through clause 7's source proof.
> 22. **The default action is a source-owned destination, not mutation.** Labels
>     are specific—**Open Page**, **Review navigation**, **Open schedule**,
>     **Review media**, **Review form route**, or **Review import**—and carry no
>     authority token. They open only an authorized exact-scope object and never
>     disclose an inaccessible object's existence. If the user cannot perform
>     the action, the interface truthfully says which kind of authorized staff
>     member is needed or that Asym is handling it; it does not offer a doomed
>     or privilege-escalating control.
> 23. **Direct recovery exists only as a registered typed command.** A source
>     owner may expose one narrowly named command only when reopening the source
>     editor would not solve the operational cause. The command contract binds
>     owner and command version, actual actor or service principal, exact
>     Tenant/environment/Site/locale/subject, current desired generation or
>     intent epoch, expected source state/version, authorization epoch,
>     idempotency key, bounded effect, outcome/readback proof, and receipt.
>     Generic **Retry**, **Replay**, **Force**, arbitrary job cancellation, raw
>     SQL, provider console links, and free-form repair payloads are forbidden.
> 24. **Recovery is current-state fenced and safe under concurrency.** Before
>     dispatch and consequential commit, the owner reloads current intent,
>     capability, safety floors, object lifecycle, references, and existing
>     receipt; it acquires the appropriate product work claim and compare-and-
>     set fence. Duplicate clicks, two tabs, automatic recovery, delayed events,
>     lost acknowledgements, or a newer edit produce the same receipt, a truthful
>     in-progress state, or a safe stale/conflict no-op—never a repeated or older
>     public effect. A command failure leaves source truth intact and reports the
>     next owner.
> 25. **Authorization is enforced at every read and action.** D30/Phase 12
>     current identity, Active Tenant Assignment, environment, Tenant, Site,
>     purpose, exact operation, capability, safety floor, governance epoch, and
>     expiry govern workspace entry, counts, issue detail, affected-resource
>     lists, support detail, contextual chips, source links, reminder preferences,
>     and Recovery commands. Filtering, navigation visibility, possession of an
>     issue ID, a Payload user, or a provider role grants nothing. Revocation
>     clears protected caches and blocks new action without rewriting historical
>     attribution.
> 26. **Tenant isolation is structural and testable.** The projection is private
>     and server-only by default. If any view or table is intentionally exposed
>     to Supabase API roles, it has RLS, explicit grants, stable exact-scope
>     predicates, and security-invoker behavior where a view is used. Projector
>     and recovery service access goes only through D30's registered service-
>     command port with mandatory Tenant/Site predicates. Cache, count, cursor,
>     search, deep-link, Realtime, export, support-detail, and error paths are
>     cross-Tenant tested; no service key, client-supplied scope, or default Site
>     reaches the browser contract.
> 27. **Privacy and safeguarding are adverse-first.** Staff summaries carry only
>     the minimum safe content label and impact explanation. Restricted-worker
>     existence, form answers, donor data, media URLs, private filenames,
>     unpublished prose, recipient addresses, IPs, provider responses, and raw
>     errors are omitted or policy-redacted. A user without permission receives
>     an existence-safe state. Privacy, consent, withdrawal, or safeguarding
>     uncertainty follows the owning source's immediate containment rule before
>     asynchronous cleanup; D31 reports that containment without leaking why to
>     an unauthorized audience.
> 28. **Providers remain implementation details and D30 owns deep diagnosis.**
>     Staff never browse Payload Jobs, Inngest runs/replays, Supabase tables,
>     Storage objects, logs, raw metrics, queues, or third-party consoles from
>     Content Health. The projection translates stable product evidence into
>     product language. If product evidence cannot explain an incident, an
>     authorized operator may follow the D30 incident-bound, short-lived,
>     read-only diagnostics lifecycle; diagnostics cannot mutate or satisfy a
>     Health issue, and any repair returns through a typed source command.
> 29. **Projection failure is visible but cannot block or counterfeit source
>     work.** Source editing, safety containment, D1 release rules, automatic
>     recovery, and authoritative receipts continue independently if D31 is
>     delayed or unavailable. The workspace retains still-valid known issues,
>     labels them with evidence age, shows **Health check incomplete**, and
>     withholds favorable counts. It never silently clears issues, blocks a safe
>     source action solely because its read model is down, or falls back to a raw
>     provider UI. Recovery of the projector uses replay-safe source facts and a
>     bounded reconciliation scan.
> 30. **The architecture is incremental, bounded, and fair.** Source transitions
>     normally advance the projection through Core's existing durable dispatch,
>     claims, idempotency, retry, recovery, and dead-letter seams; code-owned
>     reconciliation detects missed or stale evidence. Reads use indexed current
>     issue rows, bounded cursor pagination, set-based joins, selected columns,
>     and no request-time provider calls or per-row source queries. Reconciliation
>     is partitioned and checkpointed with per-Tenant fairness, concurrency and
>     rate controls, jittered backoff, cost budgets, and mass-close anomaly
>     guards. A rebuild proves expected-versus-actual scope before atomic
>     projection replacement.
> 31. **Operational observability measures whether D31 can be trusted.** Operators
>     receive low-cardinality metrics and privacy-safe traces for projection lag
>     and oldest watermark by family, stale/incomplete scope count, open issue
>     age and disposition, duplicate suppression, reopen and false-resolution
>     rate, recovery-command outcome/latency, reconciliation drift, backlog and
>     dead letters, notification volume, provider-adapter errors, per-Tenant
>     fairness, and query latency. Sustained privacy/safety containment failure,
>     cross-Tenant probe failure, false favorable status, or unreconciled
>     deletion pages immediately; ordinary subcritical drift creates operator
>     work, not staff alarm noise. Tenant IDs and content never become unbounded
>     metric labels.
> 32. **Accessibility, responsive behavior, and calm interaction are release
>     gates.** Content Health uses Core's PageShell, typography, spacing, Maia/
>     Zinc semantics, focus indicators, and shared responsive patterns rather
>     than a provider skin. Every route and action is keyboard and touch
>     reachable at every breakpoint; the hidden desktop rail has an equivalent
>     mobile entry. Rows reflow to cards without horizontal dependency, touch
>     targets remain adequate, headings and landmarks are ordered, text and
>     icons accompany color, and zoom/reflow do not hide scope or action. Polite
>     `role="status"` announces progress and verification; assertive alerts are
>     reserved for genuinely urgent changes; focus moves only for navigation or
>     a user-opened dialog, messages do not auto-dismiss, and motion respects
>     reduced-motion preferences.
> 33. **Language and time eliminate guesswork.** Copy starts with the affected
>     object and consequence—**Your About page is still public at its old
>     address**—rather than **redirect job failed**. It distinguishes **Saved**,
>     **Scheduled**, **Released**, **Visible**, **Updating**, **Contained**,
>     **Verified**, and **Resolved** instead of collapsing them into **Published**
>     or **Done**. Dates show a clear local absolute time and zone with relative
>     time only as support; deadlines and next checks never rely on color,
>     animation, or vague **soon**. Explanations answer **What this means** and
>     **What happens next** without blame, legal alarm, or infrastructure jargon.
> 34. **Contract, security, resilience, accessibility, and usability proof are
>     mandatory.** Tests cover every issue family and disposition, source-state
>     mapping, stale/missing/contradictory evidence, duplicate/out-of-order/late
>     events, generation supersession, concurrent and lost-ack recovery,
>     projector kill points, reconciliation and rebuild, permission revocation,
>     two-tab and context-switch behavior, RLS and direct-route cross-Tenant
>     isolation, redaction snapshots, provider exact-pin behavior, pagination
>     and load budgets, notification suppression, keyboard/screen-reader/reflow/
>     contrast/reduced-motion behavior, and rollback to last known good.
>     Task-based research with representative nonprofit communications staff,
>     occasional editors, translators, ministry leaders, and support operators
>     must prove that users can identify impact, responsibility, and the correct
>     next action without provider knowledge; launch-blocking ambiguity is fixed,
>     not documented as training debt.
> 35. **Delivery follows a safe tracer order.** First ratify vocabulary, source-
>     family registry, scope and freshness contracts, redaction, authorization,
>     and proof fixtures. Next prove a read-only staff-correctable tracer such as
>     a broken Page/navigation reference from source evidence through contextual
>     status, central issue, source edit, verification, and resolution; pair it
>     with one automatic/platform tracer such as D17 search lag to prove quiet
>     recovery, deadline transition, and no staff replay. Then add the exception-
>     first workspace, truthful incomplete/no-issue states, mobile/keyboard
>     parity, and operator observability. Add each other family only with its
>     owner adapter and tests. Enable source destinations
>     before direct commands; enable each Recovery command only after its
>     current-state fence, claim, idempotency, receipt, failure, and usability
>     proof pass. Backfill/rebuild in shadow, compare, then switch one read head;
>     never dual-author health truth.
> 36. **Explicit non-goals keep D31 small and maintainable.** D31 does not build
>     generic observability, incident management, an uptime/status page, content
>     scoring, SEO auditing, analytics, data stewardship, arbitrary validation,
>     assignments, approvals, comments, chat, a support inbox, tenant-defined
>     automations, provider administration, a second notification engine, a
>     workflow designer, a queue browser, bulk replay/cancel, direct database
>     repair, an external public-health API, or a second audit/retry/publication
>     authority. It ships one source-derived projection, one quiet staff
>     workspace, the same contextual status, and only proven cause-owned actions.

## Consequences

- Staff receive one calm, exception-first Content Health workspace plus the
  same compact contextual Health Status on affected source surfaces.
- Health is a private, exact-scope projection of source-owned facts and
  receipts. Stale, incomplete, rebuilding, or unavailable evidence is visible
  and can never become a false green.
- Stable issue-family semantics are code-owned and versioned; Tenant
  configuration cannot create executable health rules or a second workflow
  system.
- Every issue separates visitor impact, responsibility, automation progress,
  and urgency, then answers the seven practical questions required by the
  ratified formulation.
- Contextual status and the central workspace share one issue identity and one
  canonical full issue page. The default recovery route opens the authoritative
  source surface.
- Direct Recovery Commands are exceptional, typed, exact-targeted,
  current-state fenced, independently authorized, idempotent, bounded,
  validated, and receipted.
- Phase 12 and D30 continue to own authorization and deep diagnostics. Ordinary
  staff never see raw providers, job attempts, database tools, or unrestricted
  operational data.
- The health projection may degrade independently without blocking source
  publication or recovery. Launch requires false-green prevention,
  reconciliation, Tenant-isolation, concurrency, accessibility, usability,
  and production-shaped performance proof.

## Evidence

- [D31 exact formulation and decision brief](../prds/sitestacker-parity/research/phase-23-d31-content-health-decision-brief.md)
- [D31 primary-source and repository research](../prds/sitestacker-parity/research/phase-23-d31-content-health-primary-source-research.md)
- [D31 staff journey and UX benchmark](../prds/sitestacker-parity/research/phase-23-d31-content-health-ux-benchmark.md)
- [D31 complete 17-category adversarial review](../prds/sitestacker-parity/research/phase-23-d31-content-health-adversarial-review.md)

Ratification authorizes documentation only. It does not authorize code, schema,
RLS, data repair, migration/backfill, dependency or provider adoption, plugin
installation, issue or specification publication, Git publication, deployment,
production access, D1 activation, or release.
