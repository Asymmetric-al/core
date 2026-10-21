# Q18 frontier — optional writing help inside the newsletter editor

Research date: October 16, 2026 UTC. **Founder answered A; full review complete.** D17's corrected
decision and required amendments are explicitly ratified. This note preserves the original
independent product-scope choice. The subsequent [D18 review](phase28-d18-newsletter-writing-assistance-adversarial-review.md)
records A, the requested tenant-key/limits and author-control direction, and the
corrected recommendation. The founder subsequently explicitly ratified the corrected decision and required
amendments on October 16, 2026 (Asia/Bangkok); no
provider/model or implementation is activated.

## The single product choice

Maya has written a newsletter draft and wants help making a paragraph clearer
or shorter while keeping her own voice.

**Should the newsletter editor include optional AI writing help in this phase,
when the organization enables it?**

- **A — Include optional newsletter writing help (recommended).** Maya selects
  eligible text, requests help, reviews the suggested wording and chooses whether
  to use it. Sending remains a separate deliberate decision.
- **B — Keep newsletter writing manual initially.** Deliver the complete editor,
  templates and permitted content reuse; introduce qualified AI writing help later.

Recommendation: A serves a focused authoring job in the existing editor without
creating a general assistant. The author retains the original and controls what
is used. B is a legitimate first-release scope reduction, not rejection of Core's
AI direction or removal of already accepted public-page writing assistance.
This is product judgment, not measured missionary demand or usability evidence.

## What is already decided, and why this question remains open

- The [founder brief](phase28-founder-brief.md:251) explicitly asks what qualified
  drafting/explanation/preparation ships in P28 versus later. Ordinary work must
  remain complete without AI; private/care context, invented stories/commitments
  and autonomous contact are prohibited. These boundaries are not new questions.
- [Ratified D7](phase28-d7-adversarial-review.md:36) allows preparation suggestions
  to produce a draft but does not commit to a particular first-release AI helper.
  Its [source and independence contract](phase28-d7-adversarial-review.md:61)
  keeps native authoring/sending complete without optional AI. Selecting A would
  resolve the newsletter editing scope, not change per-issue sending authority.
- [ADR-0133](../../../adr/0133-source-bounded-public-page-writing-assistance.md:31)
  already selects the tenant-off-by-default **Public Page Writing Assistant**.
  It operates on exact eligible Page narrative sources, retains review-before-
  apply and cannot create a Ministry Update. The
  [active OpenSpec requirement](../../../../openspec/changes/add-public-ministry-pages/specs/public-ministry-pages/spec.md:851)
  confirms that boundary. Neither option reopens or removes that accepted feature.
- [ADR-0099](../../../adr/0099-claim-level-expense-truth-and-purpose-routed-tenant-ai.md:37)
  already provides the shared tenant AI foundation: purpose-bound provider/model
  configuration, minimum authorized data, invocation evidence, costs, revocation
  and manual fallback. A requires a bounded newsletter-source/purpose extension;
  the public-profile binding does not authorize newsletter text. Do not invent
  a second provider-settings system or a new broad missionary AI role.
- [P40](../../../prds/sitestacker-parity/roadmap.md:5227) describes a staff
  workbench; its [first suggestion domains remain open](../../../prds/sitestacker-parity/roadmap.md:5287).
  [Retained requirements](../../../prds/program-roadmap/owner-constraints.md:1338)
  require source-linked suggestions, current human acceptance and reuse of the
  shared foundation. An exact newsletter seam need not wait for all global search,
  analytics and stewardship features, nor acquire their powers.
- [Platform product intent](../../../../openspec/specs/platform-product-intent/spec.md:259)
  establishes AI direction. [Platform boundaries](../../../../openspec/specs/platform-boundaries/spec.md:239)
  already preserve current source authority and human approval for consequential
  effects. The choice is this editor's initial scope, not whether Asym uses AI.

The narrow example is intentional. D15 personal-email bodies, newly imported
contact files, restricted prospect work, donor history and finance are different
sources. A does not admit them, automatic roster scanning, recipient selection,
relationship ranking, generated commitments, translation or autonomous sending.
Eligible newsletter text must still satisfy the actual classification/egress
rules; user selection alone cannot declassify prohibited content.

## Current source evidence

Read-only source inspection on the repository baseline, not a hosted test:

- Missionary [email-studio route](../../../../apps/missionary/app/email-studio/page.tsx:10)
  mounts a [page advertising AI-powered content](../../../../apps/missionary/app/email-studio/page-client.tsx:41)
  but [shows Coming Soon and a disabled action](../../../../apps/missionary/app/email-studio/page-client.tsx:83).
  This is not an implemented composer or assistance contract.
- [Dashboard snapshot handling](../../../../packages/missionary/components/dashboard-home.tsx:65)
  and its [presenter](../../../../packages/missionary/components/dashboard-view.ts:87)
  derive task/donor alerts deterministically. Sparkles or an
  [Auto task badge](../../../../packages/missionary/components/task-row.tsx:233)
  do not prove an AI producer.
- Mission Control has an [Eve mount](../../../../apps/admin/app/mc-shell.tsx:485)
  and [conversation panel](../../../../apps/admin/app/eve/global-panel.tsx:184)
  using [admin session authorization](../../../../packages/eve-runtime/src/admin-session-auth.ts:29).
  Mounting that product in the missionary workspace would not supply the bounded
  newsletter permission/source contract.

A bounded missionary-route inspection found no qualified newsletter-assistance
endpoint. This does not prove absence from every branch or deployment. No runtime,
provider, prompt, model quality, current data-processing agreement or cost was tested.

## Comparable primary documentation

Checked October 16, 2026. These establish documented patterns, not Asym readiness
or proof of ministry outcomes. Neither vendor is selected as a dependency.

- [Mailchimp Write with AI](https://mailchimp.com/help/write-with-ai/) documents
  drafting and editing selected copy for phrasing, length and tone. The page
  labels availability beta with plan/geography limits. This supports contextual
  editing as a useful comparator, not a universal capability or quality claim.
- [HubSpot AI email creation](https://knowledge.hubspot.com/marketing-email/generate-marketing-emails-with-ai-email-creation),
  updated September 22, 2026 and labeled beta, documents AI access/data settings,
  editing and factual review. Its optional use of CRM, conversation and file data
  conflicts with Core's narrower source boundaries if copied indiscriminately;
  that broader retrieval is explicitly not adopted here. Its usage limits and
  audience/CTA generation do not become Asym requirements.

## Consequences to review after the answer

If A is selected, qualify an explicit P28/P17 newsletter text target and shared
AI purpose through P12/P10 and the existing execution foundation. Keep a small
contextual request → compare → use/discard journey, with current permission,
exact draft revision, clear source disclosure and manual recovery. Suggestions
must not overwrite concurrent edits, invent factual claims, authorize recipients
or send. The original survives failure, rejection and disabled assistance.

Exact actions, source ranges, classification eligibility, settings/defaults,
retention, provider/model certification, budget, evaluation and phone/accessibility
behavior need the subsequent review. Do not silently copy the Page assistant's
entire action catalog or timer into a different domain. The accepted general
framework supplies boundaries; it is not proof of a newsletter adapter.

If B is selected, the full D7 manual editor, templates, permitted content reuse,
native sending and recovery still ship. Existing accepted Page assistance remains
separate. Neither option authorizes a formal owner/spec edit before `/to-prd`,
tickets before `/to-issues`, an implementation, a provider call or external data
transfer. Q18 is answered A. The completed D18 review records required amendments and
proof obligations. The founder subsequently explicitly ratified the corrected
decision and required amendments; that is not provider or implementation qualification.
