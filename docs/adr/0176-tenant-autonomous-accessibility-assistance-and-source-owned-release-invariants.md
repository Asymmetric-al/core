# ADR-0176: Tenant-autonomous Accessibility Assistance and source-owned release invariants

**Status:** Accepted (founder-ratified Phase 23 D32 C-prime-R, 2026-08-24)

## Context

Phase 23 must distinguish the accessibility mechanics Asym generates and
operates from the contextual content choices a Tenant makes. A universal
blocker, score, or compliance claim would overstate what automated checks can
prove and would police editorial judgment. A client-only advisory audit would
be bypassable and leave Asym-owned keyboard, focus, semantic, responsive,
motion, compiler, and package defects without exact release proof.

The durable boundary is one quiet, tenant-autonomous Accessibility Assistance
contract. Asym makes its authoring surfaces and generated output accessible by
construction; authors receive contextual help for choices they own; and only
narrow invariants already owned by D1, D9, D11, D27, or another ratified source
contract may refuse an exact successor release. Suggestions remain
non-blocking, D1 reviews the exact compiled candidate, package defects remain
with their owner, and D31 receives verified operational regressions rather than
editorial debt.

## Decision

<!-- prettier-ignore -->
> **C-prime-amended-and-hardened (C-prime-R) — One quiet,
> tenant-autonomous Accessibility Assistance Contract with
> accessible-by-construction Asym surfaces, contextual author choices,
> non-blocking editorial suggestions, narrow source-owned D1 release
> invariants, D9 package certification, and D31 platform-regression recovery.**
>
> 1. **One bounded assistance contract, not a compliance product.** D32 adds
>    one shared Accessibility Assistance contract to Web Studio and D1. It does
>    not create an accessibility department, approval workflow, legal review,
>    policy engine, issue tracker, crawler, score, certification product, or
>    second publication authority.
> 2. **The non-policing responsibility line is explicit.** Asym guarantees the
>    accessibility of Web Studio and the mechanics, components, compiler output,
>    capability islands, and certified package code that Asym generates or
>    admits. Tenants retain responsibility and final judgment for their message,
>    prose, imagery, brand, and other editorial choices. Assistance informs;
>    it does not grade, shame, approve, or police those choices.
> 3. **Settled authority remains intact.** D1 remains the exact Site Plan
>    compiler and release authority; D9 owns Presentation Package admission and
>    generated public behavior; D11 owns typed Rich Text, links, and Video; D22
>    owns exact locale lineages; D27 owns usage-local media meaning; D29 owns
>    staged imports; D30 owns staff authority and diagnostics; and D31 owns
>    verified operational regressions. D32 neither weakens nor silently expands
>    their ratified gates.
> 4. **One precise domain vocabulary.** The technical contract uses
>    **Accessibility Assistance**. Ordinary Page UI labels the entry point
>    **Accessibility help** and explains it as “Small checks that help more
>    people use this page.” This helpful label is not a separate state or
>    authority and does not collide with D24's public-versus-authenticated access
>    vocabulary.
> 5. **Exactly three ordinary finding classes.** A finding is one of
>    **Details to finish** for missing structured input already required to
>    produce an operable result, **Suggestion** for contextual human judgment,
>    or **Technical issue** for an Asym/package-owned defect. An unavailable or
>    stale check is stated separately and is never converted to a favorable
>    result.
> 6. **Web Studio itself is accessible.** The complete create, compose, reorder,
>    configure, review, Preview, Publish, error, and recovery journey meets the
>    D9 WCAG 2.2 AA floor with keyboard operation, visible and unobscured focus,
>    semantic reading order, accessible names, clear errors, touch, 320-pixel
>    reflow, 400% zoom, forced colors, reduced motion, and no drag-, hover-,
>    tooltip-, color-, or desktop-only action.
> 7. **Accessible by construction comes before checking.** Standard components,
>    starters, templates, forms, navigation, heading choices, token pairings,
>    generated identifiers, focus behavior, DOM order, responsive behavior,
>    status semantics, and reduced-motion behavior prevent platform defects
>    wherever Asym can know the answer. Healthy authors are not asked to repair
>    what the product can guarantee automatically.
> 8. **Creative freedom remains broad.** Tenants may choose radically different
>    brand expression, layouts, imagery, wording, animation style, loading
>    treatment, and certified custom presentation under D9. D32 does not enforce
>    a house aesthetic, content opinion, reading level, theology, campaign
>    message, or preferred prose.
> 9. **Editorial quality is never an automated gate.** Alternative-text quality,
>    link-copy quality where a meaningful name exists, plain-language quality,
>    complex-image description quality, caption accuracy, uncertain visual
>    contrast over content, and other human-judgment matters remain Suggestions.
>    They do not disable D1 or become a claim of noncompliance.
> 10. **Details to finish are narrow and source-owned.** This class applies only
>     when an already-ratified semantic contract or ordinary component validity
>     requires an explicit choice or value for truthful, operable output—such as
>     an action name/destination, D11 Video disposition, or D27 placement and
>     required-equivalent branch. Authors may choose any permitted value; Asym
>     does not second-guess the truth or quality of that editorial choice.
> 11. **D32 cannot create blockers by catalog update.** A new D32 rule cannot
>     become release-blocking merely because it is deterministic or a scanner
>     calls it serious. New source invariants require the owning domain's
>     explicit governance and proof; D32 only presents and rechecks the exact
>     blocking facts already owned elsewhere.
> 12. **Work is never held hostage.** Save, autosave, undo, recovery, copy,
>     version comparison, and D25 Preview remain available for all three finding
>     classes. Only an exact successor release can be refused for a pre-existing
>     source invariant or unproved platform/package contract, and the current
>     public generation remains live.
> 13. **Assistance appears at the decision, not as interruption.** Cheap checks
>     run after insertion, blur, save, or a short idle boundary—not every
>     keystroke. Guidance appears beside the affected field or block, begins
>     with the likely visitor consequence, offers one clear next action, and
>     keeps decision help collapsed. It never uses a toast or auto-opening modal.
> 14. **One quiet Page summary.** **Accessibility help** opens an in-flow,
>     reflow-safe section under the existing document state rather than a new
>     dashboard or desktop-only Inspector. It groups Details to finish,
>     Suggestions, Technical issue, and collapsed Previously reviewed. Passed
>     checks and technical detail remain collapsed.
> 15. **No score, grade, badge, or conformance claim.** D32 never shows a
>     percentage, red/green grade, Tenant ranking, legal status, `WCAG passed`,
>     `100% accessible`, or other implication that automated checks establish
>     accessibility or compliance. An empty list says only that no current
>     suggestions were found.
> 16. **Locate and repair preserve author context.** **Go to field** and
>     **View in preview** identify the exact source or rendered component,
>     preserve revision and undo state, scroll it clear of sticky chrome, move
>     focus only after intentional activation, expose the relationship
>     programmatically, and provide a reliable return path.
> 17. **Suggestions never add publication ceremony.** Suggestions keep the
>     ordinary Publish action and release review unchanged. Staff may open
>     **Accessibility help** from the Page workspace when they choose, but
>     Suggestions add no release-review row, `Publish anyway`, extra
>     confirmation, attestation, justification, waiver, reviewer approval, or
>     legal disclosure.
> 18. **Keep as written is bounded continuity, not waiver.** An author may choose
>     **Keep as written** without a reason. The exact suggestion moves under
>     collapsed Previously reviewed only while its rule-declared semantic
>     inputs, locale, and check-meaning version remain unchanged. Package or
>     compiler identity participates only when that rule explicitly depends on
>     it. The disposition is shared with the exact revision, reversible, and
>     proves neither accessibility nor compliance.
> 19. **There is no broad suppression surface.** D32 provides no `Ignore
>     forever`, `Dismiss all`, bulk approval, Tenant-wide disabled rule,
>     per-role policy matrix, or user preference that makes assistance
>     undiscoverable. Relevant edits or rule-meaning changes invalidate only the
>     affected continuity; unrelated edits do not resurrect it.
> 20. **Media choices remain contextual and humane.** At each D27 placement and
>     locale, staff answer “How does this image help the page?” with bounded
>     informative/decorative and already-ratified functional, image-of-text, or
>     complex branches as applicable. A meaningful use reveals its description
>     or equivalent field. The catalog may suggest prior text but never owns or
>     silently completes placement meaning.
> 21. **Links and actions use ordinary product language.** Components ask for
>     their visible label or accessible name and typed destination/action as
>     normal fields. A nameless or destinationless action is incomplete data;
>     a merely generic but meaningful phrase is a Suggestion. Icon-only and
>     bespoke visual treatments remain allowed when the author supplies the
>     action's name.
> 22. **Rich Text, headings, and media retain their owners.** D11's bounded
>     editor prevents unsupported structure and owns Video disposition; D7/D9
>     own semantic section output; and D1 evaluates the complete outline.
>     Questionable but still operable structure is advisory unless an owning
>     ratified contract already makes it invalid. Tables remain outside D11 v1
>     and enter this assistance contract only through a later, separately
>     ratified table-capable semantic component.
> 23. **Design choices are assisted, not homogenized.** Certified token and
>     component combinations provide safe defaults and immediate contrast/
>     motion/responsive feedback. Reliably detected platform or package defects
>     return to D9 ownership. Context-dependent color, imagery, prose, or visual
>     taste remains a Suggestion and cannot force every Tenant into the same
>     design.
> 24. **AI can suggest but never decide.** Any later separately qualified AI
>     assistance is explicit, private, locale-aware, labeled as a suggestion,
>     and requires accept, edit, or reject. It never inserts filenames or
>     generic strings, bulk-approves content, marks human review, publishes,
>     sends private candidates to an unapproved model, or claims conformance.
> 25. **D1 reviews the exact compiled candidate.** D1 derives the final typed
>     result over the exact Site, locale, Page, reusable dependencies,
>     Navigation, dynamic inputs, media placements, forms, public metadata,
>     capability islands, Presentation Package, compiler, and rule versions.
>     Page-local UI state and a scanner report are never final authority.
> 26. **No authoring path bypasses the contract.** UI, REST, GraphQL, Local API,
>     imports, schedules, reusable content, dynamic content, package activation,
>     and migration tooling cannot assert a passing result from client form
>     state. Authorization and exact-candidate validation remain server-derived;
>     suggestions remain non-blocking consistently on every path.
> 27. **Locale meaning never silently carries.** Each D22 locale lineage owns
>     its content guidance and Keep-as-written fingerprint. Source-language,
>     copied, AI-generated, or machine-translated descriptions are labeled for
>     target-locale review and never silently mark that locale reviewed. Counts
>     remain locale-specific and understandable.
> 28. **Reusable and dynamic findings route to the real owner.** A reusable
>     source issue appears once at that source with an authorized affected-Page
>     summary; Page-local placement meaning stays on the Page; dynamic or
>     package findings name their responsible owner. D1 still checks complete
>     closure so a referencing Page cannot appear falsely clear.
> 29. **Package defects are not editor blame.** D9 owns keyboard, focus,
>     semantic DOM, responsive, token, motion, no-JavaScript, capability-island,
>     and generated-code proof for custom packages. Staff see that their content
>     is saved and Asym or the maintainer owns the update; they never repair
>     React, CSS, DOM, ARIA, compiler, or package code.
> 30. **Failure is truthful and bounded.** Advisory-check unavailability is
>     disclosed, never shown as passed, and fails open for publication. Failure
>     to prove an already-mandatory source or platform invariant fails only the
>     exact successor closed. Unknown publication outcome is reconciled from D1
>     receipts; retry never guesses or publishes a different revision.
> 31. **Findings are derived, not a second workflow database.** One small,
>     versioned, code-owned catalog emits stable rule ID, class, source owner,
>     location, visitor-centered copy key, repair intent, affected semantic
>     digest, and check version. Only bounded exact-revision continuity and D1
>     proof are stored; there is no mutable issue truth, compliance history,
>     assignment graph, or unbounded finding ledger.
> 32. **Tenant safety and privacy are adverse-first.** Every check, count,
>     preview link, source jump, continuity record, and receipt is bound to the
>     authenticated actor's current Tenant, environment, Site, permission,
>     locale, and exact candidate. Unauthorized content is not enumerable.
>     Private candidates are not sent to external scanners or models by default,
>     and logs/metrics contain no rendered content, PII, or restricted facts.
> 33. **Performance and cost remain bounded.** Editing uses cheap local semantic
>     checks and digest reuse; D1 performs one bounded exact-candidate pass with
>     measured concurrency and budgets. D32 adds no request-time crawl,
>     per-keystroke whole-Site scan, remote release dependency, tenant-specific
>     scan schedule, or high-cardinality evidence stream.
> 34. **D31 receives regressions, not editorial debt.** Accepted or unchanged
>     Tenant Suggestions never become Content Health issues, notifications,
>     assignments, red debt, or operational scores. D31 receives only verified
>     platform/package regressions or adverse source-owned facts and routes them
>     to their cause owner. Safe aggregate D32 telemetry improves rule quality
>     without ranking Tenants or staff.
> 35. **Launch requires real human and technical proof.** Activation requires
>     exact-pin Payload adapter tests; UI/API/import/schedule/reuse/dynamic/
>     locale/package parity; automated accessibility tests; manual keyboard,
>     focus, screen-reader, touch, 320-pixel, 400%-zoom, forced-colors, and
>     reduced-motion verification; fault/race/bypass/load tests; and moderated
>     tasks with disabled and occasional nonprofit ministry staff. A clean axe
>     run alone is insufficient.
> 36. **Scope remains deliberately closed.** D32 ships no accessibility overlay,
>     legal-advice surface, public certification badge, Tenant compliance
>     report, staff surveillance, policy builder, custom WCAG profile, generic
>     rules engine, crawling service, third-party scanning dependency, approval
>     queue, accessibility inbox, generalized waiver system, or duplicate D1,
>     D9, D11, D27, D30, or D31 authority. Ratification authorizes documentation
>     only—not code, schema/RLS, migration, dependencies, provider adoption,
>     issue/spec publication, Git publication, deployment, production access,
>     D1 activation, or release.

## Consequences

- Web Studio, standard components, compilers, capability islands, and certified
  packages must be accessible by construction; staff are not asked to repair
  Asym- or package-owned code.
- Accessibility Assistance has exactly three ordinary finding classes:
  **Details to finish**, **Suggestion**, and **Technical issue**.
- Tenant editorial judgment remains autonomous. Suggestions do not add scores,
  compliance claims, approval, attestation, waiver, or publication ceremony.
- D32 cannot create a release blocker by catalog update. Only an exact invariant
  already governed by its source owner may refuse the exact successor release;
  Save, autosave, undo, recovery, copy, comparison, and Preview remain available.
- One quiet, contextual **Accessibility help** experience locates the affected
  source and rendered result without becoming a dashboard or second workflow.
- D1 remains exact-candidate authority across UI, API, import, schedule,
  reusable, dynamic, locale, and package paths; client state and scanner output
  cannot assert a passing result.
- Findings remain derived and privacy-minimal. Continuity is bounded to the
  exact revision, semantic digest, locale, and applicable check-meaning version.
- D31 receives only verified platform/package regressions or adverse
  source-owned facts, never accepted or unchanged Tenant Suggestions.
- Activation requires exact-provider, bypass, failure, concurrency, isolation,
  performance, accessibility, and representative disabled/nonprofit-staff proof.

## Evidence

- [D32 exact formulation and decision brief](../prds/sitestacker-parity/research/phase-23-d32-accessibility-assistance-decision-brief.md)
- [D32 primary-source and repository research](../prds/sitestacker-parity/research/phase-23-d32-accessibility-authoring-primary-source-research.md)
- [D32 complete quiet staff UX journey](../prds/sitestacker-parity/research/phase-23-d32-accessibility-authoring-ux-journey.md)
- [D32 complete 17-category adversarial review](../prds/sitestacker-parity/research/phase-23-d32-accessibility-authoring-adversarial-review.md)

Ratification authorizes documentation only. It does not authorize code, schema,
RLS, data repair, migration/backfill, dependency or provider adoption, plugin
installation, issue or specification publication, Git publication, deployment,
production access, D1 activation, or release.
