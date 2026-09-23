# ADR-0188: Retain reviewed translations across ordinary source drift

**Status:** Accepted (founder ruling after required amendments, Phase 24 D67 —
2026-08-30)

## Context

A reviewed exact-locale resource can remain useful after the source it was
translated from changes. Automatically withdrawing every older translation
turns routine copy edits into broken ministry links and campaigns. Continuing
to serve content that its authoritative owner has explicitly declared no longer
true, lawful, private, secure, operationally valid, or safe is a different and
more serious problem. Treating both as one `stale` flag either causes outages or
permits unsafe serving.

Current Core has no localization configuration, exact-locale content lineage,
Translation Basis, Site Locale Public Release, source disposition, or resource-
level generation compiler. Phase 23's exact-locale lineage, Public Site
Generation, and Content Health contracts remain proposed in open PR #1340, not
merged runtime truth. This ADR defines target behavior and requires accepted
compatible foundations before implementation.

## Decision

Core uses two lanes and keeps their facts independent.

### Ordinary editorial freshness

Every exact target-language revision owns one immutable **Translation
Provenance** disposition: **Translated** pins exactly one **Translation Basis**;
**Independently authored** pins none and is not compared with a source; **Legacy ·
source unclassified** pins none and derives **Could not be checked**. A
Translation Basis identifies the same structurally isolated deployment
environment, Tenant, Site, stable resource, a distinct exact source locale,
exact authoritative translation-input revision, and versioned source-owner
canonicalization profile plus digest. A
successor may deliberately classify legacy content, but history never mutates.
Core never infers provenance or basis from English, Default Site Locale, matching
identity/path/text, timestamps, authoring order, provider fallback, or mutable
provider status.

Only a current authoritative source publication can change freshness. Drafts,
autosaves, rejected candidates, future scheduled publications, audit changes,
folders, Topics, provider keys, cache events, elapsed time, tasks, and unrelated
operational facts do not. When the current translation-input identity differs
from the target's reviewed basis under the same or explicitly compatible
canonicalization profile/version, **Out of date** is derived. Freshness compares
the complete versioned translation-input identity, never a bare digest. An
unproved or incompatible profile transition, legacy-unclassified provenance, or
unreadable evidence yields **Could not be checked**; independent provenance is
not source-compared, and a currently public independent target appears in D66's
**Current** bucket only as requiring no translation follow-up. Its detail remains
**Independently authored**, never a claimed comparison. A profile change alone
never invents **Out of date**. Neither state is a mutable publication state.

Ordinary drift does not edit, auto-translate, substitute, redirect, relabel,
withdraw, or warn visitors about the last reviewed target version. That exact
version remains in the current authorized generation with its route,
Navigation, search, sitemap, reciprocal alternatives, and explicitly authorized
language-labelled links. Translation freshness is staff-only editorial context,
not public safety or cache age.

ADR-0189's Site **Suggested translation sources** preference only ranks an
explicit Copy/Compare chooser. Changing it never selects, creates, clears, or
replaces a Translation Basis; changes provenance/freshness; rebases an existing
target; or affects the public generation. D67 continues to compare a Translated
target with its exact pinned Basis regardless of later preference order.

ADR-0190 permits an exact current server-acknowledged private Working Revision
to seed a private Translated target only after the source owner freezes or
reuses an immutable, retention-protected Copy Source Checkpoint. That checkpoint
may be historical Basis evidence, but it is not an authoritative source
publication and grants no target publication eligibility. The target stays
private until D1's current authoritative source publication pins the same exact
source revision represented by the checkpoint under the same compatible copy-
manifest/canonicalization identity, or this D67 compare/update/**Confirm
translation is still current** path creates a reviewed successor Basis against
the actual current publication.
A different publication never silently rebases the target, and rolling autosave
or mutable provider-latest state is never Basis evidence.

An authorized translator who can read the complete exact source-basis comparison
and authorize target review can compare with the latest source and either publish
an edited successor or choose **Confirm translation is still current**. The
latter creates an immutable target successor review/revision pinned to the new
Translation Basis without changing rendered bytes. Both paths use the target
content owner's ordinary publication policy and expected-head checks to create a
compatible successor generation; they never mutate a historical basis or attach
new evidence to an old generation. If source or target changes during review,
the command conflicts and preserves work/current public output. Source-only
conflict says **The source changed again. Review the latest source changes before
confirming.** Target-only conflict says **This French (Canada) translation
changed while you were reviewing it. Review the latest translation before
confirming.** Combined or indeterminate conflict names both possibilities. A
viewer without complete comparison and target-review authority sees neither the
diff nor Confirm and receives a permission-safe existing editor/admin handoff;
D67 creates no task.

### Source-governed public-use safety

A registered source contract may classify a successor as safety-governed. Its
existing source publication review then requires one unselected, source-owned
public-use disposition:

- **Keep reviewed translations public** — prior source meaning remains
  authorized for public use; translations may still be **Out of date** and this
  choice makes no claim about translation quality.
- **Make affected translations unavailable** — the source owner appends a typed,
  immutable revocation for the exact prior dependency set derived by the server.

The compiler and receipt always bind the complete closure. The review shows full
Site Locale labels/counts only when independent authorization proves that the
viewer may receive the complete set. Otherwise it uses non-enumerating closure-
class copy and a count-free action; missing detail permission never blocks urgent
containment. The semantic unselected fieldset legend is **What should happen to
existing translations when this update is published?** **Keep reviewed
translations public** explains **Use this only if the previous source meaning is
still safe to show. Translators will still see changes to review.** **Make
affected translations unavailable** explains **Use this if the previous source
meaning must no longer be shown. Access does not return automatically; a newly
authorized replacement is required.**

The final action derives from the proved, visible closure: **Publish and make 2
translations unavailable**, **Publish and restrict [public dependency family]**,
or **Publish
and take French (Canada) offline**. With hidden members it says **Publish and
apply the required public-use restriction**. The review uses the source owner's
existing reason when that domain requires one and adds no D67 free-text reason,
second approver, queue, task, or workflow. An already-governed automated source
may supply only the typed disposition its accepted contract authorizes. AI,
callers, translators, locale managers, status projections, and timers cannot
invent or waive it.

The same registered source owner may also invoke its existing explicit adverse-
only revocation command when containment cannot wait for a successor publication.
That path does not ask whether to keep public—the selected source command is
already unambiguously adverse—but it uses the same typed reason, exact server-
derived dependency closure, authorization, durable receipt, and recovery rules.
D67 does not require unsafe source meaning to remain public until replacement
copy exists.

Every registered safety-governed unpublish, retire, tombstone, and delete intent
must likewise produce an explicit continue/revoke disposition or complete adverse
fencing before its source transition. A referenced source revision, basis,
disposition, dependency, receipt, or audit is never hard-deleted; erasure and
retention operate through the owning privacy/records contract without destroying
the minimum referential evidence required to prevent re-serving.

An adverse disposition reuses D66's fence-first transition. The compiler, not
the caller, derives the smallest complete affected resource, finite code-owned
public dependency family, or universal Site Locale closure from exact generation
dependencies. The family is not a Phase 12 authorization capability or Tenant-
configurable taxonomy. A resource
revocation creates a successor generation that omits that resource; the compact
generation-level admission fence may temporarily deny the containing locale
during cutover. D67 creates no per-Page Edge Config authority. Unknown,
incomplete, stale, ambiguous, or cross-scope closure remains adverse at the
registered containing scope and reconciles the same command forward.

The receipt drives truthful source-publication status: **Publishing and applying
the public-use restriction… You can leave this page**; after the fence but before
the safe successor head, **Public access is blocked while Core finishes the
update**; after convergence, **Published** plus a permission-safe consequence;
and for an unknown result, **We're checking the result. Do not publish again.**
Only authoritative proof that neither fence nor head changed permits **Couldn't
publish—nothing changed**. Retry reads/reconciles the same receipt.

The Public Site Generation head remains the sole favorable serving authority.
The fence only subtracts. It never selects another locale or resource, grants
publication, or treats its absence as proof. A revoked source dependency is not
restored in place; recovery supplies new safe source/target evidence and each
owner's normal successor command. Giving, payment, message, privacy, security,
operational eligibility, and other domains retain their own truth and
revocation authority.

Initial Site Locale activation, whole-locale withdrawal/restoration, and
locale-wide contract transitions require `sites.publish_locales`. Subsequent
ordinary resource publications follow the Tenant's source-owned manual,
automatic, or scheduled CMS publication policy and do not require a second
locale-manager approval. A safety disposition is a narrow source safety floor,
not generic moderation.

## Data, authorization, and provider boundaries

- Translation bases, reviews, source dispositions, generation dependencies,
  receipts, and audits are immutable and exact-scope. Freshness and compact
  staff counts are rebuildable projections, never favorable heads or mutable
  `is_stale`/`is_safe` rows. Every projected row/count pins its evaluated source-
  and target-head watermark; **Current**, zero exceptions, and complete counts
  render only when that watermark covers the current authoritative heads.
  Otherwise the UI moves from **Checking** to **Status unavailable**/**Could not
  be checked**, never false green.
- Current deployment isolation is one environment per Supabase project/database;
  environment is trusted command/cache/audit context, not a partial relational
  Site key. Same-Tenant, same-Site, stable-resource, exact-locale and exact-
  revision relationships use complete keys/FKs where one database owner permits
  them, typed versioned references across established stores, restrictive
  deletion, positive revisions, checked digests, `timestamptz`, and indexes for
  every FK, RLS predicate, source-head comparison, and reverse dependency read. A
  future shared-environment database must add environment to Site and every
  dependent key/FK atomically before D67 data enters it.
  A checked provenance sum enforces exactly one basis for **Translated**, none
  for **Independently authored**/**Legacy · source unclassified**, and distinct
  source/target locales. Referenced evidence uses restrictive deletion.
- Phase 12 current EffectiveAccess and the source owner's capability authorize
  each command. Operational authority relations enable and force RLS where
  applicable; policies use old-row `USING` and new-row `WITH CHECK`; views are
  security-invoker; hardened security-definer functions use an empty search path,
  fully qualified objects, and minimum execute grants. Direct DML from `anon`,
  `authenticated`, service/secret-role application paths, Payload bypass, and
  generic workers is revoked. Actor, scope, effective time, and audit attribution
  come from trusted server/database context. Payload access hooks use exact scope
  and `overrideAccess:false`; public reads use `fallbackLocale:false`.
- Commands bind expected source and target heads, affected-set digest, source
  contract version, authorization epoch, safety state, request meaning, and
  idempotency. Same key and meaning returns the original receipt; changed
  meaning conflicts. No remote call occurs while database locks are held.
- Ordinary freshness creates no Vercel write. Safety revocation reuses D66's
  compact generation admission adapter and scoped generation/cache invalidation;
  it makes no Vercel Domain API call, deployment, or per-resource Edge Config
  inventory.

## Staff and visitor experience

**Site → Languages** keeps one compact exception-first view. Its four ordinary-
content buckets are one ordered total function over a complete permitted
population at one current watermark:

1. No current exact-locale public target is **No public translation**, regardless
   of private-draft provenance or evidence. Authorized detail distinguishes
   **Draft exists** from **Not started**; otherwise it remains generic.
2. A current public **Independently authored** target is **Current** (no
   translation follow-up), with independent detail and no claimed comparison.
3. A current public legacy/unclassified target, or one whose required basis,
   profile, or source evidence is missing, incompatible, or unreadable, is
   **Could not be checked**.
4. Every remaining current public **Translated** target has compatible evidence:
   matching input identity is **Current** and a mismatch is **Out of date**.

The first matching rule wins, so each resource appears exactly once and
`ordinary_total` equals the sum of **Current**, **Out of date**, **No public
translation**, and **Could not be checked**.
A row may say
**French (Canada) · Published · 3 translations to review**, using localized
pluralization, or omit the number when the
viewer cannot safely receive a complete count. A partial safety closure takes
precedence as **Published · needs attention** with a permission-safe unavailable
count; a universal locale fence is **Needs attention**. The locale detail explains:
**These French (Canada) translations were reviewed before their source content
changed. Their current French (Canada) versions are still public.** Each item offers at
most **Review changes** and **View public page**.

The existing Web Studio editor shows a calm **Source changes to review** banner
and loads an authorized source comparison only on request. **Confirm translation
is still current** says that it keeps the public page unchanged and records the
latest review. Progress/success uses one polite `role="status"`; blocking conflict
uses a focus-linked error summary or `role="alert"` once, never repeated badge
announcements. Cause-specific conflict copy identifies source, target, or both.
D67 does not add a modal or confirmation to ordinary edits.

Safety review stays inside the authoritative source publication surface. Its
impact summary says exactly what becomes unavailable and that Core will not show
another language or unpublish unrelated resources. A contained public route
returns tenant-brand-native, privacy-safe unavailability with no source reason or
Asym branding. The source contract supplies one typed presentation disposition:
existence-concealed uses 404; permanently gone uses 410; transient/unknown safety
uses a `no-store` 503. It includes bounded `Retry-After` only when the owning
source/runtime proves a truthful interval; otherwise the header is omitted. Soft
200 is forbidden. A resource-level
result may offer **Go to [Site] home** only when that exact-locale home is
independently current. A public-dependency-family/locale closure offers only an independently
safe contact/status action and no cross-locale link. Ordinary out-of-date content
displays no visitor badge, banner, warning, or substituted language.

All flows use Core's Base Maia/Base UI primitives and semantic controls, work at
320 CSS pixels and 400% zoom, preserve long/CJK/RTL labels and `lang`/`dir`, do
not depend on color or hover, provide keyboard/screen-reader/forced-colors/
reduced-motion parity, and avoid eager diff or all-locale downloads on weak
networks. Controls meet WCAG 2.2's 24×24 CSS-pixel target minimum or spacing
exception; primary actions target 44×44. Public routes/language controls remain
understandable without JavaScript. Web Studio truthfully reports when its
required JavaScript/network is unavailable and preserves work.

## Consequences

- Stable reviewed public content survives routine source evolution while staff
  receive one honest, actionable exception list.
- Explicit source safety revocation wins immediately without making Phase 24 a
  legal, privacy, security, Giving, payment, or message authority.
- Core needs a versioned translation-input digest and exact Translation Basis,
  but no new workflow engine, policy DSL, timer, reminder, task, translation
  score, locale matrix, or generic revocation service.
- A source owner capable of safety consequences needs one typed adapter and
  review copy. This extends D66's small code-owned dependency inventory; it is
  not a second Tenant-editable registry or database checklist.
- Legacy/imported content receives a Translation Basis only from proven
  evidence. Otherwise current public output is preserved and staff see **Could
  not be checked**. No migration fabricates a source relation or revocation.
- Implementation is blocked until a consolidated Phase 24 OpenSpec delta and
  accepted equivalents of the required exact-locale lineage, compatible
  generation/dependency, and derived-health contracts exist.

## Rejected alternatives

- **Automatically withdraw every out-of-date translation:** mechanically fresh
  but turns harmless edits into broken campaigns, URLs, discovery, and staff
  avoidance.
- **A central “critical content” tier or generic safety engine:** duplicates
  domain judgment, creates classification drift, and invites broad outages.
- **Show the new source language at the target URL:** violates exact-locale
  identity, accessibility, SEO, and the D66 no-substitution invariant.
- **Ask on every source edit:** noisy, nonexpert, and incompatible with ordinary
  automatic/scheduled CMS publication.
