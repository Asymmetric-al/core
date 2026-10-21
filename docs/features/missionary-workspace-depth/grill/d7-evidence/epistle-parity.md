# D7 — Epistle newsletter capability evidence and bounded parity recommendation

Research date: **2026-10-16 UTC**. Research only. This note records public
primary-source evidence, current repository boundaries, material gaps and
recommendations for the founder's selected **A: the missionary deliberately
decides to send each newsletter**, together with the new requirement for a fully
functional integrated newsletter experience at or beyond Epistle's capability.
It does not ratify the review, amend owner specifications, claim implementation,
or reinterpret D6's selected-but-not-separately-ratified recommendations.

**The practical conclusion is a complete native newsletter workflow with an
explicit capability ledger, not a literal Epistle clone.** Epistle's advertised
automatic digests and recipient-selected cadence differ from selected A. That
difference must remain visible; it prevents an honest unqualified claim of
100% behavioral parity. The new rider also exposes a real media gap: Epistle
documents video updates, while current P22 D9 explicitly rejects video. Do not
hide that gap by relabeling still images as equivalent media support.

## Evidence method and limits

- **D-M — documented marketing:** a current first-party page explicitly names
  a behavior. Strong evidence that the vendor advertises it; not evidence of
  reliability, accessibility, implementation detail or complete availability.
- **D-H — documented help:** current official written instructions describe a
  workflow. Stronger procedural evidence, still not an authenticated test.
- **D-R — documented release note:** developer-supplied dated app history.
  Evidence of the stated release claim, not independently exercised behavior.
- **H — historical observation/documentation:** earlier repository research
  recorded a specific public sample or written training summary. Its original
  date and limits remain attached; it was not reverified today.
- **A — announced:** future-tense or “soon” language. Not released capability.
- **U — unknown:** the inspected sources do not establish the exact behavior.
  This means unresolved, not that Epistle lacks the feature.

All current sources below were read through the available public web reader on
October 16, 2026. Some responses can be cached/indexed; this is a read date, not
a claim that every sentence changed today. Direct HTTP requests to Epistle's
tour, robots and sitemap returned 403. Training and the public sample were not
accessible through the web reader either. No account was created, authenticated
area inspected, form submitted, subscriber added, invitation sent, email sent,
or provider configured. No user interview or comparative usability study was
conducted. Public screenshots and text are not an end-to-end demonstration.

The prior [P22 research evidence, section 24](../../../../prds/sitestacker-parity/phase-22-public-ministry-pages-research-evidence.md)
was read for its August 6, 2026 source register, written training summaries,
sample observations and unknowns. Its old $12 tour/MPD prices and 2018 privacy
date must not be repeated as current: today's pages show $14 and the privacy
policy says July 1, 2026. Pricing does not determine this capability decision.

## Primary source register

Matrix references below include the exact URL and inspection date through this
register. “Undated” means no substantive revision date was visible; a copyright
year or search engine crawl date is not substituted for one.

| Ref | Primary source                                                                                                                     | Date and strength                                                         | Useful evidence and limits                                                                                                                                                                                                                                   |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| E1  | [Epistle Tour](https://www.epistle.org/tour/)                                                                                      | Current read 2026-10-16; undated; D-M                                     | Picture/video updates, drafts, captions, version restoration, automatic update-to-email compilation, daily/weekly/monthly reader cadence, responses and engagement claims. No authenticated authoring or sending test.                                       |
| E2  | [Epistle home](https://www.epistle.org/)                                                                                           | Current read 2026-10-16; undated; D-M                                     | Corroborates the update/email/response loop. Scale and fundraising statements are vendor claims, not comparative performance evidence.                                                                                                                       |
| E3  | [Epistle Security](https://www.epistle.org/security/)                                                                              | Current read 2026-10-16; undated; D-M                                     | Distinguishes private posts, invisible sites and notification-only email. It also warns against content whose leakage could cause harm. Technical assertions are not an independent audit or an Asym safety policy.                                          |
| E4  | [Epistle MPD](https://www.epistle.org/mpd/)                                                                                        | Current read 2026-10-16; undated; D-M/A                                   | Physical-mail export and broader MPD features are advertised. “Soon all available” in the app is announced coverage, not proof that every MPD feature is in current mobile releases.                                                                         |
| E5  | [Epistle iOS listing](https://apps.apple.com/us/app/epistle/id6498960558)                                                          | Current read 2026-10-16; D-R                                              | Version 1.27, 2024-10-16, names in-feed pictures/video; 1.24, 2024-10-04, names login/deep links; 1.0.29, 2025-02-17, names partner segments. Developer statements, not an Apple-verified feature or accessibility audit.                                    |
| E6  | [Epistle Android listing](https://play.google.com/store/apps/details?id=org.epistle.app.prod)                                      | Current read 2026-10-16; listing displays updated 2026-07-25; D-M         | Advertises updates and responses. “Bug fixes and performance enhancements” does not identify feature parity across platforms. Store ratings are not a controlled UX study.                                                                                   |
| E7  | [Epistle privacy policy](https://www.epistle.org/privacy-policy/)                                                                  | Current read 2026-10-16; effective 2026-07-01                             | Describes collected content categories and deletion requests. Mentioning audio or software files does not document a newsletter audio/attachment authoring feature.                                                                                          |
| E8  | [Epistle training](https://www.epistle.org/training/)                                                                              | H: inspected 2026-08-06 in P22 section 24; inaccessible today             | Prior written lesson summaries cover publishing, inviting partners, CSV contact import/export and physical newsletters. Nine videos were embedded; prior investigators did not infer uncaptioned visual steps. Exact current instructions remain unverified. |
| E9  | [Public sample ministry site](https://orourkes-mexico.epistle.org/) and [Subscribe](https://orourkes-mexico.epistle.org/subscribe) | H: inspected 2026-08-06; inaccessible today                               | One sample showed an update feed, permalink, external Give link and signup form. No signup was submitted. Old sample content and one tenant cannot establish universal defaults, confirmation or private audience behavior.                                  |
| E10 | [Epistle MPD and AI workshop](https://www.epistle.org/srlc/workshop/)                                                              | Current search-result body read 2026-10-16; no reliable article date; D-M | Gives newsletter-drafting prompts for use with AI. Training examples do not establish a shipped built-in newsletter assistant, model choice, safety contract or required integration.                                                                        |
| E11 | [Epistle app](https://www.epistle.org/app/)                                                                                        | Current read 2026-10-16; undated; D-M                                     | Links iOS/Android availability. Not evidence that every web capability works in both apps or offline.                                                                                                                                                        |
| G1  | [Ghost: Publishing and scheduling](https://ghost.org/help/publishing-content/)                                                     | Current read 2026-10-16; undated; D-H                                     | Distinct publishing/email choices, desktop/mobile previews, test mail and one-off scheduling with configured timezone. Shareable preview URLs are a vendor behavior, not permission to bypass P22 authenticated preview.                                     |
| G2  | [Ghost: Delivering emails](https://ghost.org/help/delivering-emails/)                                                              | Current read 2026-10-16; undated; D-H                                     | Email-only, publish-only or both; subject adjustment; selected recipients and a summary before send; unsubscribe separate from site membership. This is a strong comparable deliberate-send pattern.                                                         |
| G3  | [Ghost: Editor cards](https://ghost.org/help/cards/)                                                                               | Current read 2026-10-16; undated; D-H                                     | Explicit video/audio/file upload instructions and web playback, plus email-only content and greeting fallbacks. These are Ghost features; they do not prove Epistle supports the same formats, files or transports.                                          |
| M1  | [Mailchimp: Preview and Test Your Email](https://mailchimp.com/help/preview-and-test-your-email-campaign/)                         | Current read 2026-10-16; undated; D-H                                     | Desktop/mobile and recipient previews differ from real tests; ordinary tests do not exercise contact-specific merge content. Link checking has exclusions. No one preview guarantees every inbox or every link.                                              |
| M2  | [Mailchimp: About bot activity](https://mailchimp.com/help/about-bot-activity/)                                                    | Current read 2026-10-16; undated; D-H                                     | Automated scanners, privacy systems and previews can inflate opens/clicks. Filtering improves estimates, not proof of a human reading or relationship strength.                                                                                              |
| W1  | [W3C WAI: Audio and video accessibility](https://www.w3.org/WAI/media/av/)                                                         | Current read 2026-10-16; updated 2024-09-17                               | Plan captions, descriptions/transcripts and accessible players according to the media and applicable requirements. A descriptive media caption is not automatically a synchronized caption track.                                                            |
| W2  | [W3C: Understanding SC 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)                                    | Current read 2026-10-16; informative explanation of WCAG 2.2 AA           | Qualifying status messages must be available to assistive technology without taking focus. This does not require announcing every keystroke/autosave or a modal for every result.                                                                            |

A bounded search of official Epistle pages, training/support/how-to terms and
media/print terms found no additional inspectable current procedural contract
for the unknowns below. The inaccessible training/site inventory prevents an
exhaustive vendor census. This ledger is comprehensive for the inspected public
claims and the requested newsletter job, not a declaration that every Epistle
feature has been discovered.

## Capability ledger

“Required” below means already requested in the founder brief or a necessary
part of the chosen complete journey, not an implementation claim. “Recommend”
and “extension” remain review proposals. Owner names identify where qualification
belongs; they do not grant authority to an existing route merely by naming it.

### Compose, reuse, recover and render

| ID / user job                                                       | Epistle evidence and exact limit                                                                                                                 | Asym treatment, owner and proof needed                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| N01 — Write a short update or longer letter                         | E1/E2 D-M: authored updates; exact formatting controls U.                                                                                        | Required complete native writing path. P28 human-authored preparation with P17-safe composition facilities, outside the system-message catalog. A focused editor must produce usable email and plain-text output without HTML knowledge.                                                                    |
| N02 — Add photographs and contextual descriptions                   | E1 D-M: pictures and captions. Alt-text editor, decorative semantics, crop and image limit U.                                                    | P22 D9 owns governed source media; P17 newsletter placements need their own approved context and accessible output. Do not call a generic caption sufficient alt text. Prove image-blocked output and meaningful links.                                                                                     |
| N03 — Communicate a video story                                     | E1 D-M plus E5 D-R: video updates/in-feed video are explicit. Upload versus embed, formats, hosting, transcoding and actual playback controls U. | **Material parity gap.** Current P22 D9 is still-image-only. Recommend a bounded P22 media extension supporting the useful video story journey and authorized newsletter representation, before claiming this capability. Do not silently drop video or select a new video service.                         |
| N04 — Understand video in email and print                           | E1 does not establish inline inbox playback, poster-link behavior, captions/transcripts or printed representation: U.                            | Recommend an honest readable email representation with an authorized destination for viewing when required, plus a meaningful print alternative. A bodyless notice may need to omit even the title/poster. Qualify media access, recipient access and accessibility; never promise playback in every inbox. |
| N05 — Send standalone audio                                         | E7 names an information category, not authoring behavior: U. G3 documents this for Ghost only.                                                   | Not established as an Epistle newsletter parity requirement. Record unknown and seek bounded evidence if needed. An audio feature needs its own owner/media/accessibility qualification; do not smuggle it through “video parity.”                                                                          |
| N06 — Attach/download documents                                     | Epistle newsletter attachment, PDF, file-card and protected download support U. E7 is not feature proof.                                         | Required print/address exports are separate. Arbitrary content attachments are not authorized by the rider alone; document custody remains P29 if a specific use is adopted. A new attachment pipeline is not an acceptable shortcut around P22 media rejection.                                            |
| N07 — Save and return to a draft                                    | E1 D-M: drafts. Autosave frequency, offline mode, concurrency and device recovery U.                                                             | Required recoverable preparation. Show saving/saved/not saved/unknown accurately; retain lawful recoverable work without presenting local edits as durable. Prove interruption, reload and changed authorization.                                                                                           |
| N08 — Restore earlier writing                                       | E1 D-M: previous-version restoration. What happens to published or emailed content U.                                                            | Treat useful version recovery as a parity capability to qualify, not merely undo in browser memory. P22 revisions remain source truth; P28 newsletter drafts need defined restoration provenance. Restoring an authoring version never recalls an email or silently changes an authorized issue.            |
| N09 — Reuse an eligible Ministry Update                             | E1 D-M: updates can be compiled into email. A manual selective reuse UI or approval rule U.                                                      | Recommend deliberate reuse of exact eligible source revisions into a separately prepared issue, under P22/P28/P17/P6. Current public/supporter release alone does not authorize all newsletter recipients or transports. Prove safe selection, unavailable items, provenance and changed source status.     |
| N10 — Combine several stories into one issue                        | E1 D-M: multiple updates may become one email; user-controlled ordering/selection U.                                                             | Recommend bounded multi-update selection, ordering and introduction/closing content to reduce repeated work while retaining A. This is a composition extension, not permission for background generation or automatic sending. Avoid a second editable copy that claims to be the canonical Update.         |
| N11 — Get a good layout without repeated design work                | E1's compiled-email promise supports the job; exact template library, branding controls and customization U.                                     | Required approved layouts and content per brief. Recommend a restrained organization-approved default with useful optional layout choices, reused P17 compiler primitives and shared UI. No third-party editor or template marketplace is implied.                                                          |
| N12 — Use subject, sender, reply identity and salutations correctly | Epistle exact controls, merge syntax and fallbacks U. G2/M1 provide comparable procedural evidence.                                              | P17/P6 own approved sender/reply identity and preparation. P28 exposes permitted subject and personalization clearly. Preview missing/long/international names and truthful fallback; do not split a name by guessing or use a raw address as reply authority.                                              |
| N13 — Preview the actual medium and permitted audience              | Epistle exact preview/test modes U. G1/G2 D-H distinguish web/email/mobile; M1 explains test limits.                                             | Required mock previews and authorized test sends are separate. Synthetic previews stay inert and privacy-safe; any actual recipient-specific preview/test needs exact source authorization. A small-screen browser frame is not evidence of rendering in every mail client.                                 |
| N14 — Test without enrolling or messaging the real list             | Epistle test-send existence/semantics U. M1 documents bounded limitations in a mature comparator.                                                | Required authorized test path through qualified P17/P6, labeled as a test. Test acceptance is not final-send authorization, subscriber creation, delivery guarantee or a reason to bypass suppressions/source rules.                                                                                        |

### Audience, privacy and deliberate sending

| ID / user job                                          | Epistle evidence and exact limit                                                                                                                                   | Asym treatment, owner and proof needed                                                                                                                                                                                                                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| N15 — Join the intended newsletter                     | E9 H shows one public signup form; confirmation, defaults and enrollment result U.                                                                                 | D6 selected native signup needs its explicit owner amendment and qualification. Preserve the current review's exact-purpose confirmation/no-op/privacy distinctions; D7 must not convert legacy requests, gifts, follows or imported contacts into consent.                                  |
| N16 — Leave or change what is received                 | E1 D-M documents cadence choice, but unsubscribe/global suppression/topic/email-change semantics U. G2 documents newsletter unsubscribe distinct from site access. | Required actual newsletter consent/preferences with P3/P6 and D6 owners. Keep newsletter choice distinct from P25 Show in my Updates and post-email preference; display actual effective state and reason without inventing an all-purpose master subscription.                              |
| N17 — Choose eligible recipients or a useful subset    | E5 D-R documents partner segments. Exact rule model, overlaps and rights U.                                                                                        | Required audience review and exclusions. Reuse authorized CRM selection as a candidate set only; consent, valid destination, content disclosure and current suppression still gate each recipient. Do not invent a second roster or infer consent from tags.                                 |
| N18 — Know who will receive an issue before committing | Epistle exact final-review screen/estimate accuracy U. G2 D-H has a recipient/content summary.                                                                     | Required single understandable review: exact issue, source/audience meaning, eligible recipients/exclusions, sender and timing. Counts cannot include unauthorized identities or imply all candidates qualify. Unknown eligibility is not zero recipients or ready-to-send.                  |
| N19 — Personally decide each send                      | Epistle E1 advertises automatic dispatch, not per-issue approval.                                                                                                  | **Selected deliberate divergence:** P28 records the missionary's authorization for this issue, not a standing authorization for every future post. Do not hide automatic sends under “fully integrated.” Existing organization authority still applies.                                      |
| N20 — Automatically receive recurring digests          | E1 D-M: daily/weekly/monthly recipient cadence and automatic grouping. Cutoffs/timezones/backlog/correction/duplicates U.                                          | **Not selected for this release by A.** Preserve an explicit divergence entry. Do not claim three preference choices or an enabled digest engine. Publishing an Update is not native newsletter authorization. This does not switch off existing separately authorized P25 post notices.     |
| N21 — Schedule one decided issue                       | E1's automatic scheduling is not proof of a manual date/time picker. G1 D-H documents deliberate one-off scheduling.                                               | Recommend bounded one-off scheduling if included by the root review, with timezone, exact prepared issue, cancel and reconciliation. A is compatible with it but did not settle its policy automatically. No recurring campaign engine follows.                                              |
| N22 — Change a draft or schedule safely                | Epistle cancel, edit-after-schedule, frozen audience and late joiner behavior U.                                                                                   | Qualify source-owned revision/review rules and P6 current narrowing. Show which changes need a new decision; do not silently replace content, add recipients or retarget a compiled message. Cancellation cannot recall work already in flight.                                              |
| N23 — Send public or protected stories appropriately   | E3 D-M distinguishes private posts and invisible sites. Exact rights, revocation or media enforcement U.                                                           | P22 audience releases and P10/P12 safety remain authoritative. Newsletter membership grants neither protected-story nor CRM access. Reader links cannot promise content a recipient cannot currently read. Page publication is independent of email disclosure.                              |
| N24 — Avoid putting sensitive story content into email | E3 D-M documents notification-only email. This is not end-to-end encryption or recall.                                                                             | Qualify an owner-approved notification-only representation where applicable, with safe subject/title/link/media/filename behavior. Existing P25 post-notice purpose and newsletter purpose remain distinct; do not create duplicate notices accidentally.                                    |
| N25 — Import/export useful contact information         | E8 H documents CSV workflow; current exact schema/limits/consent import U.                                                                                         | Keep continuity under existing identity/import/export owners and P32 external boundaries. Contacts can be candidates without being subscribers. Newsletter export must disclose only permitted fields for an exact purpose; importing “subscribed” text is not automatically valid evidence. |

### Responses, outcomes, physical mail and platform continuity

| ID / user job                                           | Epistle evidence and exact limit                                                                                                                          | Asym treatment, owner and proof needed                                                                                                                                                                                                                                                    |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| N26 — Respond with acknowledgement, prayer or comments  | E2 D-M names responses; visibility, authentication, moderation and mail action behavior U.                                                                | Reuse P22 D12 exact supporter-release Engagement Space and tenant Response Profile. A newsletter-only recipient must not gain protected engagement rights. No duplicate likes/prayer history, anonymous identity inference or new social graph.                                           |
| N27 — Reply personally                                  | E4 D-M mentions direct messages. Native reply-to-email ingestion, shared inbox, threading and response privacy U.                                         | Approved reply identity is part of usable mail. A new inbox/DM system is not established by newsletter parity and the brief forbids another inbox. Root must identify the existing qualified route for an actual reply; do not count a link or opened mail app as a received interaction. |
| N28 — Include an appropriate giving route               | E2 D-M names giving response; E9 H observed an external Give link in one site. Donation processing/attribution U.                                         | Use the existing qualified giving destination when allowed; no new gift truth or paywall. A gift does not enroll a subscriber, prove readership or confer protected access.                                                                                                               |
| N29 — See whether sending worked                        | E2 D-M claims engagement insight; detailed attempt/bounce/complaint/partial/unknown reporting U.                                                          | Required P6 outcomes with body-free durable history and permitted bounded recent content. Prepared, submitted, provider-accepted, delivered and human response are separate. The UI needs a useful next repair action, not a single misleading green Sent count.                          |
| N30 — Learn from engagement without surveillance claims | E2 D-M names opens/reactions/comments. No independent accuracy or outcome study. M2 documents non-human opens/clicks.                                     | P22/P25 source events and P6 transport facts remain distinct. Label opens/clicks as limited diagnostics where authorized; never a “read,” prayer sincerity, relationship-health score, coaching surveillance or automated pressure list.                                                  |
| N31 — Recover partial/failed/unknown sends              | Epistle idempotency, error/retry and provider-indeterminate handling U.                                                                                   | Required P6 reconciliation and cause-specific residual repair. An unknown result must not offer an unqualified Send again. Reopening the issue/reloading/retrying the same authorized operation cannot duplicate accepted deliveries.                                                     |
| N32 — Prepare physical newsletters                      | E4 D-M: physical-mail option with export; E8 H: physical-newsletter workflow. Exact PDF layout, label stock, print fulfillment and mail proof U.          | Brief already requires useful native print lists and label data, Email/Physical/Both/None, missing-address repair, international addresses, salutations and safe household dedupe. Specify actual usable output; do not claim Epistle details not documented.                             |
| N33 — Keep physical and email results honest            | No exact Epistle status/export lifecycle documented: U.                                                                                                   | Exported, printed, mailed and delivered are different. A download is not postal dispatch. Enforce current authority at generation, avoid stale-cache export disclosure and explain that an already downloaded file cannot be recalled. Source-approved manual evidence must stay factual. |
| N34 — Read/search an integrated web history             | E4 D-M advertises ministry website; E9 H observed feed/permalink/filter UI. Full newsletter archive distinct from Updates, search and export semantics U. | Preserve P22 one canonical Update/feed and independent issue history. An emailed letter is not automatically a public post. If an issue archive is adopted, qualify its exact audience/source and avoid a competing publisher.                                                            |
| N35 — Work well on a phone                              | E1 D-M claims content works on partners' devices; E5/E6/E11 document app availability. Full phone authoring/offline parity U.                             | Required phone-friendly native web journey in existing shared UI. Prove real narrow-screen drafting/recovery/review, focus and keyboard behavior. Store presence does not by itself add a new native-app project to Phase 28.                                                             |
| N36 — Retain/export one's newsletter work               | E8 H proves contact CSV, not whole newsletter custody. Full revision/media/preferences/response/delivery export U.                                        | Preserve existing source custody/retention and authorized portability requirements. Do not advertise full Epistle migration or export completeness without a schema and real fixtures; do not retain personal content forever to make a history screen convenient.                        |
| N37 — Keep working without optional integrations        | E4 D-M advertises DonorHub/Partner Essentials sync; offline/degraded behavior U.                                                                          | Native email/print must work without P32 sync, optional workflows, SMS or AI. Existing native preparation/delivery qualification remains a genuine prerequisite, not something to bypass with a second provider.                                                                          |
| N38 — Get understandable help and accessible feedback   | Epistle accessibility conformance and actual support-response quality U; E5 has no declared accessibility-feature list.                                   | Required product quality, not a superiority claim. Existing base-maia/Base UI components, concise instructions and actual tested behavior. W1/W2 guide media and status treatment; absence of an app declaration does not prove an inaccessible app.                                      |

## Exact media, print and platform conclusions

1. **Video is documented; its transport mechanism is not.** A safe ledger says
   “video updates and in-feed video,” not “verified native video upload,”
   “YouTube embeds,” “all video formats,” or “video plays inside every email.”
   To satisfy the useful job, propose an explicit source/media extension and
   qualify the chosen ingest, presentation and authorized-access path. This note
   does not select hosting, codecs, numeric limits or a dependency.
2. **“Captions” is ambiguous.** Epistle's wording may mean descriptive text
   under a picture/video. It does not prove synchronized speech captions,
   transcripts, audio description or an accessible player. W1 supports planning
   those needs from the beginning. No WCAG compliance assertion follows from
   using an accessible component library alone.
3. **Audio and files are unresolved.** Broad privacy-policy categories and
   another vendor's feature cards cannot establish Epistle newsletter support.
   Ghost G3 explicitly documents uploaded media/files, useful as a concrete
   comparison of what good documentation would look like. Its permissive file
   support must not override Core's bounded media/document contracts.
4. **Physical export is documented, exact outputs are not.** Do not attribute
   PDF generation, print fulfillment, envelope printing, particular label
   templates, international correctness or household deduplication to Epistle
   without further evidence. Asym's own brief independently requires usable
   print/address work, so these unknowns do not justify omitting it.
5. **A draft/version feature is not a full export or offline feature.** Recover
   writing and preserve provenance, but do not promise source restoration can
   erase emails or undo public copies.
6. **Mobile apps exist; comprehensive MPD mobile coverage is announced.** Phone
   web quality is required by the brief. A new native app or all Epistle MPD
   features are not silently added by a newsletter parity sentence. Record that
   platform boundary plainly when describing parity.

## What belongs outside the newsletter parity claim

E4's donor/gift synchronization, multi-person donor profiles, field history,
commitments, income/expenses, currencies, fundraising reports, tasks and
coaching describe a broader MPD product. They matter to the overall Phase 28
research, but are not all necessary dependencies of newsletter authoring and
sending. Existing P9/P13/P14/P16/P21/P27 owners retain those facts. Importing the
vendor's product bundle would create duplicate CRM/finance authority.

Partner Essentials/DonorHub integrations are optional ecosystem capabilities;
they do not justify making native communications wait for P32. E10 workshop
prompts do not require an AI dependency. A giving link does not require a new
fundraising platform. E3's infrastructure assertions and E4's “top 1%”
deliverability statement have no public method/audit in the inspected pages;
they are not benchmark acceptance criteria or a promise Asym may repeat.

This scope distinction must not be used to discard a documented **newsletter**
capability merely because current owners lack it. Video, useful draft recovery,
content reuse, responses through their existing source, privacy-aware delivery
and physical output remain explicit ledger entries with qualification work.

## Current Core boundary and gap register

| Current source inspected                                                                                                                                            | Consequence for a permanent solution                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Founder brief §9](../phase28-founder-brief.md)                                                                                                                     | Native preparation, approved layouts/media, audience review/exclusions, previews/tests, scheduling scope, final decision, outcomes, repair and print are requested together. An editor-only screen or external-mail handoff does not complete the job.                                                                                          |
| [Q7 frontier](../phase28-q7-newsletter-sending-research.md)                                                                                                         | A chooses per-issue authorization. It explicitly did not automatically adopt manual reuse, automatic draft generation or one-off scheduling. The parity rider makes those capability proposals more important; their exact owner contracts still need review.                                                                                   |
| [P22 D9–D12](../../../../prds/sitestacker-parity/phase-22-public-ministry-pages.md)                                                                                 | D9 launch allows JPEG/PNG/still WebP; rejects video/documents/animation. D10 preview is authenticated and inert. D11 has canonical immutable Update revisions and independent releases. D12 already owns qualified likes/prayers/comments. Video and newsletter content reuse therefore need bounded amendments, not an app-local escape hatch. |
| [P25 experience EX04/EX11–EX13/EX16](../../../../prds/sitestacker-parity/phase-25-donor-dashboard-depth/contracts/experience.md)                                    | Show and post-email preferences are independent; the current public request-only doorway is not native enrollment. D6's proposed native pathway must be explicitly adopted, not retroactively inferred from old requests or follows.                                                                                                            |
| [P17](../../../../prds/sitestacker-parity/phase-17-system-messages-template-management.md) and [communication reconciliation](../phase28-communication-evidence.md) | Human-authored newsletters stay outside the fixed system-message catalog. Reuse qualified composition/sender/preparation facilities; do not misread the older blanket P32 newsletter sentence as canceling the later native P28 outcome. The exact human-authored adapter still needs proof.                                                    |
| [P6](../../../../prds/sitestacker-parity/phase-06-shared-communication-event-model.md)                                                                              | One scope-aware recipient/intent/delivery spine, current consent/suppression, immutable prepared meaning and reconciliation. A direct Resend call, separate subscriber sender or fresh retry key is not an acceptable workaround. This read is targeted to the applicable contracts, not a new runtime audit.                                   |
| [D6 UX evidence](../d6-evidence/ux-research.md)                                                                                                                     | Reuse precise signup/confirmation/existing-active/no-op/public-entry versus unsubscribe distinctions. D7 neither reopens signup decisions nor silently ratifies every D6 review recommendation.                                                                                                                                                 |
| [Shared UI configuration](../../../../../packages/ui/components.json)                                                                                               | Existing base-maia, Zinc semantic tokens and shared component system. Integrate the newsletter into the missionary workspace; do not introduce a separate design system or full staff Email Studio administration into ordinary use.                                                                                                            |

## Recommended complete journey, with selected policy separated from proposal

**Selected:** the missionary deliberately authorizes every newsletter. No
ordinary Update publication or subscriber cadence choice can stand in for that
decision. “Full control” means clear control within current organization,
recipient, source and safety authority; it is not a permission override.

**Recommended permanent product direction:** one native issue workflow with
writing/recovery, optional explicit selection of eligible Update content,
approved presentation, eligible audience review, honest previews/tests,
deliberate sending, current outcomes and cause-specific repair. Provide usable
print work from the same reviewed purpose without equating print export to
postal delivery. Resolve the video owner gap explicitly. Keep ordinary steps
small; do not make the missionary configure the communication infrastructure.

| Stage          | Minimal user-facing meaning/copy recommendation                                                                                 | Material boundary                                                                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Start          | **New newsletter**; optional **Add Ministry Update** when qualified                                                             | A fresh issue is not a public post, subscription change or automatic send. The reuse action is a proposed capability, not existing runtime.                                                      |
| Write          | **Draft saved** only after durable acknowledgement; **Saving…** / **Changes not saved** when those states are known             | An uncertain save says **Checking save status…** and reconciles; it is not a confirmed failure or success. Preserve lawful recovery without leaking to a newly unauthorized session.             |
| Reuse          | Identify the source story and revision in a concise detail view; ordinary body editing stays understandable                     | Changes do not mutate the canonical Update accidentally. Protected content, copied images and linked titles all need current newsletter admission.                                               |
| Prepare        | Show subject, permitted sender/reply identity, simple layout and output type; offer **Preview** and separate **Send test**      | Preview is inert; a test is an actual authorized communication. Test success does not prove all merge values, links, recipients or clients.                                                      |
| Review         | **Review newsletter** with content, recipient count and exclusions, actual disclosure mode, timing and print choices if used    | One concise review can be sufficient; no arbitrary multi-dialog approval wizard. The audience must be current and explainable. A changed material issue/audience cannot inherit an old decision. |
| Commit         | **Send newsletter**; if separately adopted, **Schedule newsletter** with clear timezone                                         | No ambiguous Publish label for an email-only act. Existing source approvals remain effective; A does not eliminate required safety review.                                                       |
| Result         | **Sending…**, **Send accepted**, **Some recipients need attention**, or **Checking send outcome…**, according to exact evidence | Final labels must match the qualified P6 state. Never collapse acceptance/delivery/human reading. Do not offer unqualified resend for an indeterminate provider result.                          |
| History/repair | One issue detail showing permitted results, exclusions and the exact available next action                                      | Retry only the qualified residual work; no hidden recipient expansion. Persistent detail is the recovery path, not an ephemeral toast alone.                                                     |
| Print          | **Prepare mailing list** / **Download labels** only for the actual supplied artifact                                            | Missing addresses are repairable exclusions. **Downloaded** does not mean **Mailed**. A later consent change cannot erase a copy already downloaded.                                             |

The exact screen count, labels and component composition are design proposals,
not new founder decisions. A side-by-side composer/preview may work on desktop;
on a phone, a simple edit/preview transition should preserve caret, content and
return position. Neither layout should expose the full staff administration
surface. Announce meaningful save/send/error states accessibly without flooding
screen-reader users with every autosave; keep actions operable by keyboard and
single pointer. Prove these behaviors in the real integrated journey.

## Strongest alternatives and honest tradeoffs

**Epistle-style automatic digests** are a real useful alternative: less repeated
effort and recipient-selected frequency. They introduce standing send authority,
grouping/cutoff/catch-up rules and preference/overlap behavior. Selected A rejects
that first-release scope. Do not portray the alternative as inherently unsafe,
but do not quietly reintroduce it to satisfy the parity slogan.

**Automatic draft preparation with a final human decision** can fit A's
authorization model. It is a separate composition capability with generation,
source-change and draft-recovery requirements, not something already selected.
Manual selection and good reusable layout are the lean recommendation until its
additional value is established.

**Ghost-style deliberate publishing/email choices** provide the strongest
current procedural comparison for A. Adopt clarity about the action and audience,
not Ghost's paid-member model, shareable preview authority, arbitrary HTML/files,
or implicit equivalence of site membership and newsletter eligibility.

**No-build/external newsletter handoff** avoids native implementation work but
fails the explicit complete integrated newsletter requirement and native
independence. It is useful as an existing transition path where already
authorized, not a satisfactory permanent substitute. A narrow native composer
that calls an external provider directly has the same ownership defect even if
its screen appears integrated.

## Material concerns and exact review clauses

Severity/likelihood below are qualitative engineering/product judgments, not
measured incident rates. “High likelihood” means likely to arise in ordinary use
if the omission persists; unknown vendor behavior is not evidence of failure.

| Concern                                                         | Severity / likelihood               | Evidence and decision impact                                                                                                                               | Proposed exact clause or correction                                                                                                                                                                                      |
| --------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R01 — Literal parity conflicts with A                           | High / high wording risk            | E1 versus selected per-issue authority. An unqualified promise conceals the most central behavior difference.                                              | **The newsletter capability ledger explicitly records automatic recipient-cadence digests as a deliberate divergence; no 100% behavioral-parity claim is made.**                                                         |
| R02 — Video silently disappears                                 | High / high scope risk              | E1/E5 versus current P22 D9 rejection. An image-only implementation cannot claim the documented video job.                                                 | **Video updates require a bounded source/media extension and end-to-end qualification; until then video remains an explicit parity gap, not a completed capability.**                                                    |
| R03 — Privacy vocabulary overpromises protection                | Critical / medium                   | E3's notification-only mode and current P22 release boundaries. Body, titles, thumbnails, URLs and files all disclose.                                     | **Newsletter delivery uses only the representation admitted for that audience and medium; “private” web access never promises email recall or confidentiality of forwarded copies.**                                     |
| R04 — “Fully integrated” creates a second publisher/sender      | Critical / medium                   | Existing P22/P17/P6 owners and exact adapter gaps. A shortcut can bypass safety and replay semantics.                                                      | **The native issue source composes existing qualified content and delivery owners; it creates no substitute Update authority, consent store, message catalog or provider path.**                                         |
| R05 — Cheap reuse broadens audience                             | Critical / medium-high              | P22 independent releases; N09/N17/N23. A publicly approved or supporter-approved story is not automatically safe for a different newsletter body/audience. | **Reuse binds exact content provenance and independently proves newsletter disclosure/recipient eligibility before the issue can be authorized.**                                                                        |
| R06 — Ordinary publication sends unexpectedly                   | High / high if semantics are merged | A versus automatic model; P25 post notices already exist.                                                                                                  | **Publishing an Update does not authorize a native newsletter. Existing post notifications keep their own purpose and preferences; intentional overlap is explained rather than silently deduplicated across purposes.** |
| R07 — Preview/test falsely proves final output                  | High / medium-high                  | M1/G1 and P17 synthetic preview. Dynamic data and clients differ; a test is a real effect.                                                                 | **Preview, authorized test delivery and the final issue decision are distinct; each label states what was actually checked and no test enrolls or contacts the real audience by implication.**                           |
| R08 — Recovery duplicates mail                                  | Critical / medium                   | P6 indeterminate/immutable intent requirements. Network interruption is normal.                                                                            | **Unknown send outcomes reconcile the same authorized operation before retry; only qualified residual work may be retried and no retry silently changes recipients or content.**                                         |
| R09 — Contact import or edit becomes consent                    | High / medium-high                  | E8 proves CSV only; P25/D6 and brief prohibit inferred enrollment.                                                                                         | **A contact, tag, gift, follow, old request or changed email address supplies no new newsletter consent; only the qualified purpose-specific source can admit delivery.**                                                |
| R10 — Physical work becomes a fake completion badge             | High / medium                       | Brief requires exact printable outputs; E4 only export claim.                                                                                              | **Provide usable authorized mailing artifacts and retain separate exported, printed, mailed and delivered meanings; downloaded copies cannot be recalled.**                                                              |
| R11 — Responses become a second inbox/social system             | High / medium                       | E2/E4 versus P22 D12 and brief. “Direct messages” is not proof of inbound-email parity.                                                                    | **Reuse qualified response and reply owners; newsletter membership alone grants no protected engagement, staff inbox or CRM rights.**                                                                                    |
| R12 — Open/click numbers become relational truth                | High / high interpretation risk     | E2 marketing plus M2 bot evidence.                                                                                                                         | **Engagement diagnostics are labeled with their limits and never presented as proof of reading, prayer, donor commitment or relationship health.**                                                                       |
| R13 — Mobile/media quality inferred from library or screenshots | High / medium-high                  | E5 no accessibility declaration; W1/W2; current shared UI.                                                                                                 | **Qualify the real phone, keyboard, assistive-technology and media journey; a component choice, public screenshot or feature list is not accessibility/usability proof.**                                                |
| R14 — Parity imports all MPD dependencies                       | High / high scope risk              | E4 broader product bundle and announced app coverage.                                                                                                      | **Newsletter parity excludes unrelated CRM/finance/coaching bundles and does not make native delivery depend on optional sync, AI, SMS or a new app. Newsletter-specific gaps remain explicit.**                         |
| R15 — Recovered versions silently rewrite a sent issue          | High / medium                       | E1 restoration claim leaves transport effects U; P22 immutable revisions/P6 envelope.                                                                      | **Restoration changes recoverable authoring work with provenance; it never rewrites sent evidence, recalls delivered content or supplies a new send decision.**                                                          |

## Qualification evidence needed before a parity claim

These are testable acceptance intentions, not tests executed in this research.
Feature counts, screenshots, mocked status badges and a successful provider API
call are insufficient.

1. An authorized missionary starts a fresh issue, saves and recovers an
   interrupted draft, restores a previous version deliberately, adds permitted
   media, previews, reviews eligible recipients and sends once through the
   qualified source/provider seam. A second session observes the same truth.
2. One and several exact eligible Ministry Update revisions can be reused
   without republishing or changing the source. Changed safety/release/rights
   before authorization and before dispatch have the appropriate bounded effect.
   An unavailable source does not silently fall forward to another revision.
3. The video extension proves real ingestion or explicitly selected media
   mechanism, authorized playback/link destination, captions and relevant text
   alternatives, email fallback, print representation, removal and access
   revocation. A screenshot of a play icon is not that proof.
4. Public, protected-reader, newsletter-only and notification-only situations
   disclose exactly their admitted content. Test subjects, posters, names,
   filenames, links, previews, plain text, forwarded copies and unauthenticated
   readers. Do not claim forwarded material can be revoked.
5. Candidate segments overlap and include unsubscribed, suppressed, invalid,
   missing-address and unauthorized people. Review and final recipients remain
   private and correct. Changed contact data cannot silently retarget an already
   compiled issue; newly added people cannot silently expand an authorized one.
6. A saved D6 newsletter subscription, P25 post-email choice and Show preference
   remain independent. Existing active signup, changed email, unsubscribe and
   current suppression obey their own owners. No gift/import/follow enrolls.
7. Preview and test distinguish synthetic content, actual permitted recipient
   data and real delivery. Test long/international names, missing names,
   right-to-left text, images blocked, narrow layouts and representative actual
   email clients; do not claim universal inbox rendering.
8. Duplicate clicks, lost responses, delayed provider events, partial success,
   unknown acceptance and expired retry windows do not create extra sends or
   hide uncertainty. The missionary can understand the next safe action from
   persistent issue detail.
9. If one-off scheduling is adopted, prove timezone, changed content/audience,
   cancel-before-dispatch, in-flight honesty and safe recovery. Separately prove
   that ordinary Update publication never starts a D7 newsletter automatically.
10. Physical/Both cases generate usable international mailing data with approved
    salutations, exact selection, safe household dedupe and missing-address
    repair. A download does not mark mailed or delivered. Already exported
    information is not falsely described as recallable.
11. P22 responses use existing exact authority/moderation and do not create a
    second reaction corpus; ordinary replies reach only their qualified route.
    Newsletter-only users cannot inspect protected feed or financial data.
12. Phone and keyboard users can edit, select/reorder content, recover, review
    and commit without hidden actions or lost focus. Screen readers receive
    meaningful status/errors without autosave noise. Long content, permissions
    changed mid-form and unavailable services have understandable recovery.
13. Repeat the useful native email/print journey with optional P32 integrations,
    AI, SMS and optional automation disabled. Missing actual mandatory source
    qualification remains a truthful unavailable state, not a shadow fallback.

The ledger should eventually attach actual implementation/proof artifacts and
one of: **qualified**, **explicit deliberate divergence**, **explicit remaining
gap**, or **not established as a relevant vendor capability**. Do not score a
marketing feature count as a percentage of parity. “Beyond Epistle” can be a
goal for integrated ownership, recovery, privacy clarity and accessible use;
comparative superiority requires evidence this public research does not supply.

## Unresolved assumptions requiring bounded follow-through

- The founder's rider refers to the useful newsletter experience, while A
  remains controlling for send authority. It does not silently authorize
  recurring digests or every MPD/mobile/AI product in Epistle's bundle.
- Exact Epistle upload/embed mechanics, attachments/audio, template/editor
  controls, tests, schedule cancellation, consent/import rules, response
  moderation, export fidelity and failure/retry semantics remain unknown.
  Current authenticated vendor testing would need a separately authorized
  test environment; none is claimed here.
- Manual source reuse, version recovery for newsletter drafts, the video
  extension and optional one-off scheduling need exact owner contracts and
  qualification. The selected outcome is not proof those contracts exist.
- P22 media safety and newsletter disclosure may require different delivery
  representations. No universal protected-video hosting or secure-email promise
  has been selected by this note.
- The root review must reconcile the rider with the documented divergence and
  visible gaps. It must not report “parity completed” from this research alone.

Only this evidence note was authored in this research lane. No formal decision,
ADR, PRD, application code, dependency, external record or live communication
was created or changed.
