# Phase 23 D28 Search and Sharing Staff UX Benchmark

**Status:** Complete supporting UX evidence for the founder-ratified Phase 23
D28 C-prime-R decision. It explains the experience and measurable quality bar
without independently expanding the ratified authority or authorizing
implementation.

**Date:** 2026-08-23

**Ratified:** 2026-08-24

## UX objective

Help an occasional nonprofit ministry editor understand what a released Page
will communicate to search engines and link-sharing services, make only the
three useful editorial decisions, and recover from mistakes without learning
SEO terminology or assuming an external platform is under Asym's control.

The surface must be excellent for:

- a missionary editing on a phone and weak connection;
- a multilingual communications coordinator;
- a Site administrator changing organization-wide defaults;
- a reviewer validating the exact D1 candidate;
- an accessibility or safeguarding reviewer checking public imagery; and
- an operator diagnosing release correctness versus crawler/cache lag.

## Comparator evidence

### Payload

The [Payload SEO plugin](https://payloadcms.com/docs/plugins/seo) validates a
compact title/description/image group, generated values, search preview, and
character guidance. It also confirms that the public frontend—not the plugin—
must render metadata. Its field/tab behavior is too provider-shaped to become
the product contract, particularly on the repository's internal Payload 4 pin.

[Payload localization](https://payloadcms.com/docs/configuration/localization)
exposes locale-aware field editing but permits fallback by default. D22
requires the opposite: one active exact locale, visible scope, and no silent
inherited completion.

### Webflow

[Webflow SEO settings](https://help.webflow.com/hc/en-us/articles/33961237278611-Add-SEO-title-and-meta-description)
support Page-local title/description editing, generated collection patterns,
and a compact result preview. Its
[Open Graph settings](https://help.webflow.com/hc/en-us/articles/33961370297107-Control-the-look-of-social-shares-with-Open-Graph)
allow social title/description to reuse search metadata, supporting one shared
copy lane at launch.

Webflow separately labels
[Site search](https://help.webflow.com/hc/en-us/articles/33961242348179-Site-search),
which exposes a naming hazard: **Search** alone can mean on-site discovery.
D28 should use **Search engines & sharing**, leaving D17's **Site search**
unambiguous.

Webflow's localized settings support locale-specific presentation, but its
primary-locale inheritance is not suitable for D22. Asym must display missing
exact-locale copy as missing.

### Shopify

[Shopify's search listing editor](https://help.shopify.com/en/manual/promoting-marketing/seo/adding-keywords)
uses a compact preview and explains that search engines can rewrite results and
take time to refresh. That expectation-setting is more useful than a false
“optimized” score.

### Contentful and Sanity

[Contentful Live Preview](https://www.contentful.com/help/content-preview/live-preview/)
follows the editor's locale, while
[Sanity Presentation](https://www.sanity.io/docs/user-guides/preview-and-page-building)
demonstrates route-aware navigation and candidate preview. D28 should reuse
D25's exact whole-Site Preview and show a small metadata example in Page
settings; it should not build another visual-preview product.

### Accessibility sources

The W3C WAI
[forms tutorial](https://www.w3.org/WAI/tutorials/forms/),
[validation guidance](https://www.w3.org/WAI/tutorials/forms/validation/), and
[WCAG 2.2 target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
support persistent labels, programmatic instructions/errors, clear recovery,
announced status, keyboard access, and sufficiently large targets.

## Information architecture

### Staff terminology

- **Page settings → Search engines & sharing**: D28 Page-local surface.
- **Site settings → Search engines & sharing**: D28 Site profile.
- **Site search**: D17 on-site public search.
- **Listed publicly** and **Shared by link — public**: D2 reach terms inside
  D24's exact `public` audience, reused verbatim rather than renamed.
- **Preview Site**: D25 whole-Site candidate, not a D28 card simulator.

Avoid `SEO`, `SERP`, `robots`, `canonical`, `hreflang`, `Open Graph`, `Twitter
Card`, `schema`, `crawl budget`, and `indexing API` in the ordinary staff path.
Those terms may appear in operator documentation or an optional read-only
**Technical details** disclosure.

### Page settings hierarchy

The collapsed summary keeps four independent facts rather than compressing them
into one misleading badge:

1. candidate durability: **Editing**, **Saving**, or **Saved**;
2. publication: **Live** or **Not live**;
3. candidate validation: **Ready** or **Needs attention — {cause}**; and
4. provenance: **Generated** or **Customized — n of 3**.

It also shows the exact locale, reach/discovery explanation, and an explicitly
labelled **Planned public URL** with persistent copy: **Candidate changes appear
here only after release.** If a live generation exists, it separately shows
**Current public URL**—or **Currently live at this same address**—and the planned
D3 continuity outcome. **Preview Site** opens D25 candidate content. The planned
URL is not a public Preview and offers no Share/Copy action; only the current
live generation offers **Copy current public link**. Staff must not mistake a
candidate path or candidate content for a live link.

Opening the section shows resolved output before inputs:

1. assembled title and provenance;
2. description or omission and provenance;
3. share image and provenance;
4. two approximate examples; and
5. **Customize** actions for the three bounded values.

The user should never have to press **Generate**, open a technical field, or
infer how a Site default combines with Page content.

### Capability-specific presentation

Capabilities are independent:

1. view the exact resolved search/share candidate;
2. edit Page-locale overrides;
3. edit the Site profile; and
4. release the D1 candidate.

Reviewers and non-editors see the exact resolved candidate, provenance,
validation, candidate/live URLs, and examples read-only. They do not see dead
**Customize**, reset, profile-edit, or release controls. When a user can see a
cause but cannot resolve it, the message identifies the responsible role or
team rather than presenting an unusable button.

## Exact Page-editor interaction contract

### Shared text-override reconciliation

Title and description overrides use the same drift contract. Creating or
explicitly reaffirming either override records the contributing source
revision/digest as non-editorial provenance. If that source later changes, show
one deterministic **Review custom value** advisory with **Keep custom value**
and **Use generated …**. Reaffirming updates the basis; it does not create a
fourth editorial override or permanent nag.

### Title

- Label: **Page title for search and sharing**.
- Generated state: show the fully assembled result and
  **Generated from Page title + Site name**.
- Customize edits only the Page semantic portion. The compiler-owned Site
  prefix/suffix is visible but not mixed into the input.
- Source-basis review follows the shared text-override reconciliation contract.
- Recovery action: **Use generated title**. It deletes the override, updates
  the example immediately, and offers bounded undo.
- After Unicode whitespace/control normalization, a custom title must be
  nonblank. Clearing or entering only whitespace means **Use generated title**.
- No hard 60-character gate. Advisory copy can say
  **May be shortened in some results**.

### Description

- Label: **Short description**.
- Generated state uses the visible exact-locale Page summary and says so.
- If absent, show **No description will be sent** and the cause-owned action
  **Add a short summary**. Omission is not a red failure state.
- Custom state remains one shared search/social value.
- Source-basis review follows the shared text-override reconciliation contract.
- Blank/Unicode-whitespace-only custom input means **Use generated
  description**. Launch does not add a separate “intentionally suppress the
  generated description” state.
- No automatic Rich Text excerpt, AI writing, another-locale fallback, or Site
  boilerplate.
- Advisory copy explains that external services may choose visible Page text
  instead.

### Share image

- Label: **Share image**.
- Generated state names either the eligible Page media source or the Site
  default.
- Selection shows only D27-qualified items and the approved Social rendition.
- The picker preserves D27's rights/safety/Site/locale/alt/crop contract and
  cannot accept an external URL.
- An image becoming unqualified produces a cause-owned blocker or exact safe
  fallback result; it never quietly chooses the next image.
- Clearing a custom selection means **Use generated image**; it does not create
  a null override that suppresses the qualified default.
- The preview exposes usage-local image alt to accessibility reviewers without
  treating alt as decorative UI copy.

### Reset and save

- **Use generated …** deletes the override rather than copying the current
  generated text or media ID.
- Normalize Unicode whitespace and reject control-only text before comparing
  or persisting an effective change.
- Opening Customize and leaving unchanged writes nothing.
- Reset is recoverable with bounded undo and does not need a frightening modal.
- Save status follows D12's acknowledged-durability language. Browser-only or
  pending data is never shown as the released result.
- Concurrent stale saves fail with an understandable refresh/reconcile path,
  not last-write-wins.

## Approximate examples

Exactly two views ship:

1. **Search result — example**
2. **Shared link — example**

Both use the exact candidate locale and **Planned public URL**. The example has
no Share/Copy action. Nearby copy says **Candidate changes appear here only
after release** and uses **Preview Site** for D25 candidate viewing. If a live
generation exists, the summary separately retains **Current public URL**—or
states that the same address currently serves the prior live generation—and
the D3 continuity result. The disclosure is persistent and concise:

> **Example only. Search engines and social services may rewrite or cache what
> people see.**

Do not imitate Google, Bing, Facebook, LinkedIn, X, Messages, or WhatsApp
pixel-for-pixel. Do not fetch live provider output. Provider branding implies
precision Asym cannot guarantee and creates perpetual visual maintenance.

The example is content, not a second form. Assistive technology must encounter
one coherent representation without duplicate editable labels or a confusing
second focus order.

## Reach and status language

### Listed publicly

> **May appear in search after release. Search engines decide when and how it
> appears. Anyone can view and share this Page.**

### Shared by link — public

> **Anyone with the link can view and reshare this Page. We ask search engines
> not to index it and leave it out of discovery, but it is not secret.**

### Preview

> **Private candidate Preview. It creates no public search result or share
> card.**

### Operational states

Ordinary Page editors see candidate/live lifecycle plus the external-lag
disclosure. Crawler operations stay in a permissioned operator surface and name
the exact observed object and time:

- **Released at {time}** — D1 activated the exact generation.
- **Sitemap current at {time}** — the exact host artifact reflects it.
- **Public HTML verified at {time}** — the exact URL returned the expected
  status/head digest.
- **Bing IndexNow notification accepted for {host} at {time}** — that provider
  acknowledged receipt for the named host/URL batch.
- **Google Search Console reported sitemap fetched for {host/object} at
  {time}** — that named provider report observed the named artifact.
- **Bing Webmaster Tools report received for {host/object} at {time}** — that
  named provider report was received and is displayed as the report, not as
  release truth.

Never infer or relabel these as **Indexed**, **Ranking**, or
**Shared successfully**. If a provider report explicitly says indexed, retain
the provider and timestamp and still label it an external observation.

### Public Share and Copy link

- Native Web Share runs only from direct user activation in a secure context.
- **Copy link** remains available to keyboard and screen-reader users.
- If the Clipboard API is unavailable or denied, reveal the exact URL in a
  selected/read-only control with manual-copy instructions.
- Announce success only after the clipboard write is confirmed.
- Native-share cancellation is neutral, not an error or success.
- Never claim **Shared successfully**, infer a chosen target, or load a passive
  third-party SDK.

## Site-profile journey

1. An authorized Site administrator opens
   **Site settings → Search engines & sharing**.
2. The screen shows source-owned Site name/host/locales as read-only references,
   a small title-pattern choice with resolved examples, and the selected
   locale's exact Site × locale D27-qualified default social-card placement,
   including usage-local image context. Homepage description remains the exact-locale
   homepage's visible summary or ordinary Page override; the profile does not
   add another copy field.
3. The administrator creates a candidate profile revision. Nothing live
   changes.
4. A bounded impact summary is Page-locale-field aware rather than Page-only.
   It shows outcomes such as:
   - **Title stays custom**;
   - **Description changes**;
   - **Image changes**;
   - exact Page-locale-fields needing action, grouped by cause; and
   - representative current-versus-candidate examples.
5. The affected list is filterable and cursor-paginated; the UI never tries to
   render every Page synchronously.
6. The exact profile version and provenance appear in D1 release review, while
   ordinary staff are not forced to understand revision identifiers.
7. The profile revision is inert authoring truth. A favorable action always
   names and advances one exact locale through D1; there is no **Publish all
   languages** action or D10 shortcut. Other locale heads remain unchanged.
8. A failed candidate preserves the live locale generation and points to the
   exact cause.

## Locale journey

- One selected editing/release locale at a time; multiple locale heads may be
  live independently.
- Persistent scope text:
  **Editing Spanish (Mexico) — changes apply only to Spanish (Mexico)**.
- Repeat the exact locale beside controls and examples on narrow screens; do
  not rely on a distant page header.
- Locale status may summarize Ready/Missing/Needs attention, but all locale
  fields are not shown side-by-side in one dense form.
- Switching locales reloads exact resolved values and examples with fallback
  disabled.
- Long German titles, CJK without spaces, RTL layout, combining characters,
  emoji, and localized punctuation are tested as ordinary input, not rare
  exceptions.

## Warnings and blockers

### Block release only for correctness or safety

- wrong Tenant/environment/Site/locale reference;
- invalid or unverified public host;
- missing required visible Page title;
- canonical collision or invalid route closure;
- exact-locale lineage mismatch;
- malformed/unsafe serialized metadata or structured data;
- required share media no longer qualified with no exact safe fallback; or
- incomplete/stale D1 manifest dependency closure.

### Inform without marking Needs attention

- valid description omission: explain it in the expanded section;
- exact Site × locale D27-qualified default social-card placement: show it as
  normal provenance;
- likely shortening: show inline advisory copy;
- intentionally sparse released locale variants: explain actual eligibility;
- external crawler/social cache lag: show only the honest disclosure to
  editors and exact observations to operators; and
- similar-copy detection: place it in a bounded aggregate Site-quality view,
  not as a per-keystroke Page warning.

### Warn without blocking when action is genuinely useful

- a known placeholder or family-specific quality requirement;
- a custom value whose recorded contributing source basis changed; or
- a recoverable Page-locale-field issue that does not make the manifest unsafe.

Every message includes plain text, affected Page/locale/field, severity, source
cause, and one direct action when Asym or staff can act. **Add a short summary**
preserves pending edits and focuses/opens that exact locale's source field.
Media recovery uses **Complete image details** or **Choose another qualified
image** in the exact D27 placement. If the current user lacks permission, say
which role/team can resolve it. Color is never the sole signal. External
conditions with no direct fix are observations, not fake action buttons.

## Responsive and accessible requirements

- Use the existing Asym Base UI and Maia/Zinc information hierarchy.
- Persistent labels; placeholders never replace labels.
- Programmatically associate instructions, constraints, and errors.
- Visible keyboard focus and complete keyboard operation for customization,
  tabs, image selection, reset, affected-Page navigation, and Share/Copy link.
- Text plus icon for all states.
- Touch targets meet WCAG 2.2 sizing expectations.
- Status changes use polite, debounced live announcements rather than speaking
  on every keystroke.
- At 320 CSS pixels and 400% zoom, use a single-column form-first layout with a
  collapsible example below; no narrow split pane.
- Preserve reduced motion. D28 adds no decorative animation or scraper-style
  loading theater.
- Weak-network behavior retains acknowledged values, makes pending/retry state
  explicit, and never blanks the last valid example.

## Research and usability proof

Before activation, test task completion with representative occasional staff:

1. identify what will be generated without editing;
2. customize one title and explain what remains automatic;
3. reset to generated behavior;
4. explain the difference between Listed and Shared by link;
5. change one Site default and predict which Pages change;
6. identify why a Spanish description is missing rather than assuming English
   fallback;
7. select a qualified image and understand an unqualified-image message; and
8. distinguish Saved, Live, Sitemap current, a named external report, and actual
   indexing—including the valid state where a live Page also has a newer saved
   candidate;
9. identify Planned public URL versus Current public URL during a D2 move and
   use Preview Site rather than trying to open/share the candidate address; and
10. recover from denied Clipboard access using manual Copy link.

Measure first-attempt task success, time, reversal success, error recovery,
support questions, keyboard completion, screen-reader comprehension, mobile
completion, and comprehension of the approximate-preview disclosure. Improve
copy and grouping before adding product concepts.

## Deliberate UX exclusions

- no SEO score, traffic light, keyword density, ranking forecast, or “perfect”
  character length;
- no separate Google/Bing/Facebook/LinkedIn/X title or description;
- no editable canonical, robots, hreflang, sitemap, schema, raw head, or crawler
  notification control;
- no arbitrary remote share image;
- no AI-generated metadata in D28;
- no all-locale metadata spreadsheet;
- no live provider scraping or pixel-perfect provider simulator;
- no second whole-Site Preview system;
- no per-Page indexing switch detached from the settled D2 reach inside D24's
  exact `public` audience; and
- no plugin-generated tab structure as a product-level interaction contract.

## UX conclusion

The best experience is generated-first and explanation-rich, not field-rich.
The user sees the actual resolved candidate and its provenance, edits only
three Page-locale deltas, reverses each decision in one step, and always knows
which consequences Asym controls versus which an external platform controls.
