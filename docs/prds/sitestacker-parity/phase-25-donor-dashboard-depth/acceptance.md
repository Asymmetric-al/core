# Phase25 — Independently verifiable story acceptance

All shared and referenced domain contracts apply. These are future proof obligations; none is marked executed by publication. Story IDs are stable and distinct from the source question/clause identifiers.

## US25-U01 — As an account holder, I want a useful self-service Home with recognizable ordinary destinations, so that I can complete my task without a tour or staff detour.

- Source: Q01, Q19; normative contract: EX01, EX06, EX15.
- **AC01:** Current permitted shell and welcome render independently of unavailable finance or content.
- **AC02:** Giving/history/documents/preferences remain their qualified destinations; missing optional data creates no completion checklist.
- **AC03:** Ministry Updates has visible text on phone and desktop.

## US25-U02 — As a person who helps manage an organization's giving, I want the correct financial context without changing my personal reading or contact choices, so that I know whose records and choices I am acting on.

- Source: Q01, Q12, Q19, Q21, Q24; normative contract: EX01, EX05, EX07, EX09, EX14.
- **AC01:** Neutral entry preserves personal-first policy where a personal subject exists; no fake donor is created for representative-only access.
- **AC02:** A valid targeted or active represented task keeps its context through navigation/authentication.
- **AC03:** Switching represented finance does not switch personal Updates, profile, organization topics or notification engagement to another human.

## US25-U03 — As a donor using an older bookmark, I want recurring-giving links to retain their meaning while fixed-total pledges have a distinct destination, so that I never enter the wrong commitment product.

- Source: Q01, Q26; normative contract: EX01, EX02.
- **AC01:** Legacy /donor-dashboard/pledges GET/HEAD goes only to qualified recurring context at /donor-dashboard/recurring.
- **AC02:** Fixed Campaign commitments use /donor-dashboard/campaign-commitments; same-looking IDs are never translated.
- **AC03:** Invalid exact target is safely unavailable with permitted return, not another record or a mutation.

## US25-U04 — As a recipient of an organization-shared Updates link, I want to open my own permitted Updates, so that a forwarded link is useful without exposing its sender's feed.

- Source: Q01, Q02; normative contract: EX02, EX03.
- **AC01:** Shared link is on the current verified Tenant portal host and contains no donor/session/access credential.
- **AC02:** Different authorized openers see their own current content.
- **AC03:** Wrong/unverified host or unavailable access has an honest safe result without another-Tenant/public fallback.

## US25-U05 — As a signed-out reader, I want to sign in and continue to the exact task I opened, so that authentication does not lose my place.

- Source: Q01, Q02, Q19, Q24; normative contract: EX01, EX02.
- **AC01:** Normal, expired-session and cross-device entry preserve only the validated original current-Tenant destination.
- **AC02:** Exact post/document/operation unavailable after sign-in remains unavailable rather than silently substituting another.
- **AC03:** Auth and document capability exchanges retain their independent qualified protocols; navigation URL is not a grant.

## US25-U06 — As a reader sharing or opening content, I want honest safe links and copy feedback, so that I do not accidentally share protected information or assume copying succeeded.

- Source: Q01, Q02, Q24; normative contract: EX02, EX14, EX15.
- **AC01:** Exact supporter link and independently admitted public permalink have separate owner descriptors and metadata.
- **AC02:** Clipboard success appears only after the actual copy succeeds; failures retain a useful local alternative.
- **AC03:** Ordinary navigation/content GET/HEAD, previews, prefetch and navigation create no read, consent, message or financial effects; the independently qualified IC03 OAuth callback protocol remains permitted.

## US25-U07 — As an account holder without available financial records, I want a calm welcome and useful connection to ministry content, so that an empty account feels usable without invented giving.

- Source: Q19; normative contract: EX06, EX14.
- **AC01:** Only complete current source proof establishes financial absence; zero year-to-date/refunds/noncash/unknown/import gaps do not mean never gave.
- **AC02:** No empty scoreboards, General Fund/impact fiction or first-gift prompt hides pending/accepted work.
- **AC03:** Safe name is unsplit or Welcome; no email fallback, new-donor flag or welcome cookie.

## US25-U08 — As a donor browsing Home, I want a short readable Ministry Updates preview, so that I can keep connected without an endless feed.

- Source: Q01, Q02, Q07, Q19; normative contract: EX03, EX06, EX15.
- **AC01:** At most three admitted source-ordered previews follow authorization, Hide and dedupe before limit.
- **AC02:** Safe title/source/date/excerpt wraps; separately admitted optional thumbnail is not required.
- **AC03:** Exact article opens only its qualified target; View all opens ordinary combined reading.

## US25-U09 — As a reader whose Updates are empty or hidden, I want one truthful local explanation and permitted management, so that I can recover my view without exposing or restoring hidden content.

- Source: Q02, Q07, Q19, Q24; normative contract: EX03, EX04, EX06, EX14.
- **AC01:** Private Home can retain one neutral Updates empty region; public P22 empty Updates collapses under its own contract.
- **AC02:** Hide is explained as cause only when safely proved; neutral Manage Updates may exist without claiming hidden posts.
- **AC03:** Unavailable reading is a local failure/retry, not No updates or caught up.

## US25-U10 — As a donor returning after activity or a slow request, I want the same stable Home with current truthful results, so that I can continue without losing place or repeating a gift.

- Source: Q12, Q19; normative contract: EX06, EX07, EX14.
- **AC01:** Accepted/processing/activation/received states remain source-defined and independent of wallet or document readiness.
- **AC02:** Affected sections refresh without replacing Home, stealing focus, reordering the reader or restarting welcome.
- **AC03:** Late responses after scope loss are fenced; Back restores only permitted current context.

## US25-U11 — As a Ministry Updates reader, I want one combined list of my permitted posts, so that I can begin reading without first choosing a ministry.

- Source: Q02, Q07; normative contract: EX03, EX04.
- **AC01:** All means current authorized ordinary content after Hide, not all tenant-published posts.
- **AC02:** Canonical identity/projection deduplicates placements and coauthors without merging different Updates.
- **AC03:** Reading/publication/engagement/message occurrence remain separate source facts.

## US25-U12 — As a reader looking for one ministry, I want a safe source filter that covers the actual reading set, so that I can find relevant posts even when they are not on the first loaded page.

- Source: Q02, Q07; normative contract: EX03, EX14.
- **AC01:** Options are current source-disclosable catalog results, with bounded owner continuation if needed.
- **AC02:** Exact single-source filter runs before paging and changes no follow/email/Hide/giving fact.
- **AC03:** No hidden source labels/counts or public directory are exposed.

## US25-U13 — As a reader changing a filter, I want a clear stable transition to the chosen view, so that I do not see another view's late results.

- Source: Q02, Q07; normative contract: EX03, EX15.
- **AC01:** Changed filter starts a new scoped window and fences old pages independently of abort success.
- **AC02:** Forbidden/stale source yields safe unavailable and deliberate All action, not automatic broadening.
- **AC03:** Clear changes only transient filter; input/result focus and relevant local loading remain understandable.

## US25-U14 — As a reader with many posts, I want complete deliberate continuation and a recoverable reading position, so that I can reach every permitted result without duplicates or false endings.

- Source: Q02, Q07; normative contract: EX03, EX14.
- **AC01:** Load more uses owner-qualified stable comparator/cursor, equal-key tie-break and authentic scoped expiry.
- **AC02:** Repeated/parallel loads produce no duplicate or omission in a stable window; changes yield typed currentness outcome.
- **AC03:** Any client eviction retains accessible backward continuation/anchor; exhaustion never implies reading.

## US25-U15 — As a reader during new publication or access change, I want stable reading that immediately respects current safety, so that new posts do not interrupt me and withdrawn data does not return.

- Source: Q02, Q07, Q19; normative contract: EX03, EX14.
- **AC01:** Ordinary new posts do not reorder above the active reader; refresh starts an explicit current window.
- **AC02:** Restrictive changes prevent new admission and retire locally forbidden data/cursors; delayed responses cannot repopulate them.
- **AC03:** No offline private cache or past permission is used as a new grant.

## US25-U16 — As a person who hid a ministry, I want to open a deliberate exact post while retaining my ordinary Hide choice, so that I can read a specific link without changing my preferences.

- Source: Q02, Q07, Q24; normative contract: EX02, EX03, EX04.
- **AC01:** Exact post is checked against current reading/media authority.
- **AC02:** Opening it does not clear Hide or change post email; returning to All retains Hide.
- **AC03:** Generic shared Updates and transient filters never bypass Hide or disclose hidden teasers.

## US25-U17 — As a reader of private content, I want only authorized safe text and media with useful local failures, so that protected material cannot leak through alternate copies.

- Source: Q02, Q07, Q24; normative contract: EX03, EX14.
- **AC01:** Current audience/revision/locale/safety governs body, thumbnail, original, optimizer, attachment and preview.
- **AC02:** Sanitization and external-link rules apply; public cache/media fallback cannot bypass private admission.
- **AC03:** Image/read/older-page failure stays local and never fabricates empty success or source content.

## US25-U18 — As a reader using an available reaction or comment, I want the same durable allowed response across surfaces, so that I can trust the result after returning.

- Source: Q02; normative contract: EX03, EX14, EX16.
- **AC01:** Only exact current response profile/audience admits the existing engagement controls.
- **AC02:** The one owner command derives actor, rechecks mutation authority and deduplicates intended effect.
- **AC03:** Reload/readback proves persistence; a disabled/demo/no-op response cannot be reported successful.

## US25-U19 — As a reader, I want to hide or show one ministry's posts, so that I control my ordinary reading without other changes.

- Source: Q07, Q21, Q24; normative contract: EX04, EX05.
- **AC01:** Control targets one owner-certified publishing source/purpose and independent display revision.
- **AC02:** Hide applies before limit in full reader/Home/overview across every placement.
- **AC03:** Show or safe Undo rechecks current rights, affects display only and restores no withdrawn content or email permission.

## US25-U20 — As a recipient, I want to choose eligible post emails independently of reading, so that I can receive either, both or neither.

- Source: Q07, Q21; normative contract: EX04, EX05.
- **AC01:** All four Show/Email combinations remain valid.
- **AC02:** Saved email On remains distinct from verification/suppression/notification/delivery; safe blocks use existing repair only.
- **AC03:** No toggle produces mail, bell/missionary alert, task, reading score or external newsletter request.

## US25-U21 — As a person editing preferences, I want each control to save only its intended value, so that one failure cannot erase another successful choice.

- Source: Q07, Q21; normative contract: EX04, EX05, EX14.
- **AC01:** Commands send explicit desired value/current exact revision/operation identity, with false distinct from omission.
- **AC02:** Owner atomically commits target/revision/evidence/fence, no inversion/full-object replacement/global Save.
- **AC03:** Saving/result/rejected/stale/unknown is local; independent known controls remain usable.

## US25-U22 — As a recipient withdrawing post emails, I want Off to remain effective even after an earlier uncertain On, so that reconnects and delayed work cannot silently opt me back in.

- Source: Q07, Q21; normative contract: EX04, EX05, EX14.
- **AC01:** Fresh owner-qualified Off is not indefinitely blocked by an unresolved On/client queue.
- **AC02:** Stale On cannot win later, including reconnect/retry; no automatic offline consent replay.
- **AC03:** Post-email Off before dispatch admission suppresses matching unstarted optional work; in-flight truth is honest without recall.

## US25-U23 — As a person whose preference response was lost, I want to reconcile the same operation and current state, so that I do not undo a successful save or repeat a changed instruction.

- Source: Q07, Q21; normative contract: EX04, EX05, EX14.
- **AC01:** Same payload/operation returns existing permitted result; changed meaning conflicts.
- **AC02:** Historical success cannot regress a newer current revision; stale conflict is explained rather than auto-retried On.
- **AC03:** Successful choice stays saved when feed/summary refresh fails; dependent view is separately refreshing/unavailable.

## US25-U24 — As a reader managing hidden sources, I want a discoverable safe management path with both controls, so that hiding content never traps me out of email or restoration settings.

- Source: Q07, Q21; normative contract: EX04, EX05, EX15.
- **AC01:** Hidden list/search/continuation includes only currently disclosable canonical sources.
- **AC02:** Hide/Off does not remove the edited row; post-menu removal preserves a recovery anchor/focus.
- **AC03:** No longer authorized source leaves no name/count/tombstone oracle; restore sends no backlog.

## US25-U25 — As an account holder opening Preferences, I want a useful current overview with simple direct choices, so that I can understand my settings before entering detail.

- Source: Q21; normative contract: EX05, EX15.
- **AC01:** Applicable areas follow Emails from organization, Ministry Updates, Receipt emails.
- **AC02:** One exact topic shows direct control; one exact ministry shows its two direct controls.
- **AC03:** No three mandatory empty cards, initial chooser, giant matrix, profile score or newsletter disabled section.

## US25-U26 — As an account holder with many topics or ministries, I want complete qualitative summaries and focused management, so that a large set remains understandable without misleading counts.

- Source: Q21; normative contract: EX05, EX14.
- **AC01:** Multiple targets use source-certified complete All/None/Mixed or exact equivalent including legitimate defaults.
- **AC02:** Reading and email summaries remain separate; no loaded-page denominator, numeric count or arbitrary ranked preview.
- **AC03:** Unknown/incomplete summary is marked honestly; neutral Manage is not represented as completed current summary.

## US25-U27 — As a person editing a focused preference, I want a direct contextual journey and predictable Back, so that I need no extra category or save ceremony.

- Source: Q07, Q21; normative contract: EX02, EX05, EX15.
- **AC01:** Exact post/receipt links reach the allowed control through safe sign-in return.
- **AC02:** Small detail may be inline; long sets have one focused account destination with bounded search and Back.
- **AC03:** Back/Done navigates only; Help/Manage/Back do not toggle labels or cancel accepted changes.

## US25-U28 — As a recipient facing an unavailable or ineligible choice, I want a truthful state and the appropriate existing next step, so that I do not mistake a disabled capability for an opt-out.

- Source: Q07, Q21; normative contract: EX04, EX05.
- **AC01:** Known absence/default, no optional topics, read-only, not eligible, blocked delivery and failed read remain distinct.
- **AC02:** No topic comes from template names or a decorative switch without an enforcing sender.
- **AC03:** Represented receipt scope affects only its qualified issuer/legal-donor area; Q13's pre-occurrence cutoff stays distinct from post-email dispatch cutoff.

## US25-U29 — As a donor with a current required step, I want one clear Needs attention section, so that I can find what actually needs my action.

- Source: Q12; normative contract: EX07.
- **AC01:** Admit only qualified Q11 human request, P16 recurring episode and Q03/Q09 durable preparations/accepted changes.
- **AC02:** Normal processing/ACH, ready documents, optional profile fields, old failure, intentional pause and staff repair are not invented chores.
- **AC03:** A missing CTA is not resolution; exact owner-required continuing status remains truthful.

## US25-U30 — As a donor scanning current needs, I want recognizable scoped context and one useful next link, so that I can choose an action confidently.

- Source: Q12; normative contract: EX01, EX02, EX07.
- **AC01:** Each ordinary row has task title, necessary safe target context, proved consequence/date only when useful, one exact owner doorway.
- **AC02:** Financial target and human contact/shared-login scope remain distinct; no hidden labels or invented debt/urgency.
- **AC03:** Opening/Home/Retry-read performs no payment/proof redemption/command.

## US25-U31 — As a donor with multiple needs, I want a compact stable preview with complete further access, so that important work is visible without an alert wall.

- Source: Q12; normative contract: EX07, EX15.
- **AC01:** Three ordinary rows; exact required prominent/Urgent source treatment survives cap.
- **AC02:** Present steps precede required waiting-only ordinary rows, then oldest certified current need with stable tie-break.
- **AC03:** More actions adds three in page flow with qualified continuation; no invented exact total or separate inbox.

## US25-U32 — As a donor returning to a need after delay or partial outage, I want current source truth without repeating completed work, so that I can recover safely and still use other portal areas.

- Source: Q12, Q17; normative contract: EX07, EX09, EX14.
- **AC01:** Distinct complete-empty/partial/not-applicable/unavailable results prevent false all-clear.
- **AC02:** Re-read original request/result; do not reset expiry, reuse old proof or recreate completed/indeterminate effects.
- **AC03:** Home source-only need and bell read/availability remain different; renewed direct access does not revive an old notice.

## US25-U33 — As a donor receiving notifications, I want only meaningful qualified notices, so that the bell is useful without every payment, post or email becoming noise.

- Source: Q17; normative contract: EX08, EX16.
- **AC01:** Exactly thirteen ordinary keys in the three source families require positive complete owner/catalog/recipient qualification.
- **AC02:** Mutually exclusive receipt/refund variants never duplicate one effect; no P16/P13 duplicate alert workaround.
- **AC03:** Ordinary gifts/ACH/saves/posts/export-ready/staff/import and unrelated recognition events create no item; protected required exceptions retain only exact qualified contracts.

## US25-U34 — As a donor opening the bell, I want a small All-first view with clear current actions and recent information, so that I can find a relevant notice without managing an inbox.

- Source: Q17; normative contract: EX09, EX15.
- **AC01:** Desktop named Popover shows five groups; phone opens full center; full center deliberately loads twenty.
- **AC02:** Current source-actionable before Recent, source-proved Urgent before Attention; complete overflow action count/path.
- **AC03:** Needs attention tab available; empty wording mentions notifications, not global completion.

## US25-U35 — As a human who shares responsibility for giving, I want my own scoped notification and read state, so that another representative cannot read or clear notices for me.

- Source: Q17; normative contract: EX09, EX14.
- **AC01:** Current Tenant/donor role/surface/selected giving context and exact human recipient all scope item/count/detail/engagement.
- **AC02:** Two treasurers have independent flags; no cross-Tenant staff feed or hidden-count oracle.
- **AC03:** Temporary access outage is unavailable, not source end; later rights do not revive old occurrence.

## US25-U36 — As a donor reading a notification, I want reading to clear only unread treatment, so that I do not accidentally resolve or execute the underlying task.

- Source: Q17; normative contract: EX08, EX09.
- **AC01:** Opening bell, scrolling, email open, prefetch and source completion do not record human read.
- **AC02:** Deliberate activation/Mark read uses narrow owner command; permitted navigation survives read-persistence failure.
- **AC03:** Read never charges/retries/cancels/completes source work; source-required status remains.

## US25-U37 — As a donor organizing an informational notice, I want safe limited Archive and Restore, so that I can tidy a view without hiding required work or reviving expired access.

- Source: Q17; normative contract: EX09.
- **AC01:** Only admitted Information/ended history can archive/restore; current required notice cannot be dismissed.
- **AC02:** No Mark unread/undo-read restarts ended eligibility.
- **AC03:** Restore honors original lifetime/current access and creates no source action.

## US25-U38 — As a donor marking current notifications read, I want a precise bounded scope that excludes later arrivals, so that new meaningful information remains discoverable.

- Source: Q17; normative contract: EX09, EX14.
- **AC01:** Accepted context/cutoff is durable and applied to each child's immutable availability, including late child of existing group.
- **AC02:** Unknown/repeated result reconciles the same effect, not a newly widened batch.
- **AC03:** Grouping retains independent child evidence and policy; no arbitrary ministry/date/email merge.

## US25-U39 — As a donor returning after time has passed, I want notification history to respect its actual source lifetime, so that old messages do not become new obligations.

- Source: Q17; normative contract: EX09, EX13.
- **AC01:** Information unread ends at first qualifying ending or availability+30 days; presentation ends availability+90 days.
- **AC02:** Actionable persists until actual once-set source end, then non-unread history90 days subject to current rights.
- **AC03:** Reads/restores/repair/late projection/retention lag never restart clocks; stricter source expiry wins.

## US25-U40 — As a donor encountering a notice outage or stale link, I want safe local recovery to current source information, so that a broken notification does not break the task or expose old data.

- Source: Q17; normative contract: EX09, EX14, EX16.
- **AC01:** List/count/detail/destination use current qualified source predicates and stable continuation.
- **AC02:** Denied/withdrawn/replaced document or ended action yields its exact safe source state, never old download/automatic generation.
- **AC03:** Local-only notice works without Resend; source pages remain usable during notification outage.

## US25-U41 — As a donor exploring one ministry, I want an optional direct full-page overview of that exact context, so that I can read and manage relevant records without a directory detour.

- Source: Q24; normative contract: EX02, EX10.
- **AC01:** Exact P22 Page/immutable typed-subject private descriptor qualifies the link.
- **AC02:** Multiple genuinely admitted distinguishable origins allow bounded deliberate choice only after asking; absent/unsafe association has no dead link.
- **AC03:** Existing post/gift/receipt/Manage links remain direct.

## US25-U42 — As a donor using ministry context after a fund change, I want the actual current fund scope with older records preserved, so that I am not misled into believing older giving moved.

- Source: Q24; normative contract: EX10, EX14.
- **AC01:** One current qualified D7 Designation, separately qualified D3 reading set; current means configuration not new-gift eligibility.
- **AC02:** Old different-binding records retain original History/detail; no union/historical overview mode or name-based join.
- **AC03:** Rebind invalidates stale composite and visibly qualifies new scope; no silent new-fund retarget.

## US25-U43 — As a reader on a ministry overview, I want small independently permitted sections in useful order, so that the page works with partial rights and on a phone.

- Source: Q24; normative contract: EX10, EX15.
- **AC01:** Full-page DOM order is context, Updates, Your giving with simple section jumps.
- **AC02:** Three admitted Update previews honor Hide and media permission; full reader carries exact source set.
- **AC03:** Identity/reading/finance are independent; no financial donor prerequisite, stale public biography or forced new CTA.

## US25-U44 — As a donor reviewing a ministry's recurring records, I want only exact matching line facts and honest further links, so that a shared arrangement cannot misstate my support for this fund.

- Source: Q24; normative contract: EX10.
- **AC01:** At most two real Current arrangements, exact permitted current-effective matching lines; pending activation uses accepted pending meaning only.
- **AC02:** Ended matching line remains Ended when another sibling keeps Current; required material facts survive preview caps.
- **AC03:** No group-as-ministry total; scoped View all really scopes, and History uses exact Designation with All History reachable.

## US25-U45 — As a person leaving and returning to a ministry overview, I want my authorized task and position to survive change, so that I can resume without seeing stale or unrelated records.

- Source: Q24; normative contract: EX02, EX10, EX14.
- **AC01:** Owner-only links reauthorize independently and navigation creates no business effects.
- **AC02:** Local failure preserves independent safe sections; retired/unprovable association does not erase lawful financial History.
- **AC03:** Back restores qualified scope/anchor or explains changed/unavailable context without substitution.

## US25-U46 — As a guest interested in a missionary newsletter, I want one short request without signing up or checking my inbox, so that I can express interest with minimal effort.

- Source: Q25; normative contract: EX11.
- **AC01:** Request newsletter collects optional single Name and required editable Email with short safe recipient/purpose disclosure.
- **AC02:** No donation/account/inbox verification/repeat email/phone/address/free story or bundled marketing choice.
- **AC03:** Opening and typing send nothing; external missionary enrollment remains outside Core.

## US25-U47 — As a signed-in newsletter requester, I want editable human prefills that stay private and affect only the request, so that convenience does not change my account or leak to another visitor.

- Source: Q25; normative contract: EX11, EX14.
- **AC01:** Only current authorized human values prefill; no represented contact substitution or verified-identity inference.
- **AC02:** Auth/profile/receipt/Updates choices remain unchanged by form edits.
- **AC03:** Published Page/form HTML/RSC stays auth/cookie invariant; private answers/receipt/reconciliation are no-store and absent from shared cache/URLs.

## US25-U48 — As a newsletter requester entering international data, I want a usable single-column form with honest rejection and no-JS support, so that I can submit without unnecessary format barriers.

- Source: Q25; normative contract: EX11, EX13, EX15.
- **AC01:** Preserve supported international name/address semantics, paste/autofill and one-address syntax; no silent domain/dot/tag fixes or split-name requirement.
- **AC02:** Stable submitting state preserves answers/focus; validation errors are accessible and rejection never says Received.
- **AC03:** Existing D26 native no-JS/replay boundary works without mandatory account or a second form engine.

## US25-U49 — As a newsletter requester after submitting, I want a durable Request received result and simple return, so that I know my request was recorded without a false delivery promise.

- Source: Q25; normative contract: EX11, EX12.
- **AC01:** One atomic occurrence/exact plan/primary/local child/dispatch set commits before confirmation.
- **AC02:** Normal work releases immediately; known unrecoverable capability/route is rejected with safe approved alternate.
- **AC03:** Result distinguishes acceptance from delivery/enrollment and adds no visitor email, account/donation upsell or arrival countdown.

## US25-U50 — As a newsletter requester with a lost response or double click, I want safe same-request reconciliation, so that uncertainty does not send the missionary duplicate requests.

- Source: Q25; normative contract: EX11, EX12, EX14.
- **AC01:** Same issued operation and payload returns same permitted result; changed payload/scope conflicts.
- **AC02:** Lost browser state/timeout cannot prove no server write or auto-submit new operation.
- **AC03:** No permanent email/missionary uniqueness prevents legitimate later requests.

## US25-U51 — As a newsletter requester who notices a submitted typo, I want an honest way to send corrected details, so that I can fix my request without believing the first handoff was recalled.

- Source: Q25; normative contract: EX11.
- **AC01:** Before submit normal edits create no effects.
- **AC02:** After acceptance Use a different email deliberately creates a new request and says earlier one may have been passed on.
- **AC03:** No accepted Edit/Undo/recall/external unsubscribe or hidden resend.

## US25-U52 — As a missionary receiving newsletter interest, I want a concise actionable governed email with truthful proof wording, so that I can handle the request through my usual external process.

- Source: Q25; normative contract: EX12.
- **AC01:** P17 publication carries escaped selected name/email/safe context and Email not confirmed through this request or exact qualified proof metadata.
- **AC02:** Tenant-owned sender/reply/connection and each frozen member control transport; visitor controls no headers/recipient/template/tags.
- **AC03:** Email works without a mandatory second inbox; no automatic subscriber/contact record or visitor send.

## US25-U53 — As a missionary checking a dashboard request, I want the same bounded request under my current exact authority, so that I can use the address without a duplicate workflow or data leak.

- Source: Q25; normative contract: EX12, EX13.
- **AC01:** Generic safe purpose/time preview contains no contact details or urgency.
- **AC02:** Detail requires frozen intended human intersect current same-Page/subject/purpose authority, including guest origin without fake supporter relation.
- **AC03:** Copy email follows actual clipboard success; Read/Archive/Copy does not record external enrollment/handled state.

## US25-U54 — As an operator supporting a newsletter handoff, I want independent durable outcomes and exact current recipient fences, so that one failed channel can recover without repeating success or leaking to a successor.

- Source: Q25; normative contract: EX12, EX14.
- **AC01:** Email Primary is complete only after each required member's conclusive acceptance; local availability is independent.
- **AC02:** Unknown/missing acceptance identity remains indeterminate; recover residual same sealed scope, no rekey/recipient/account change.
- **AC03:** Current recipient/suppression/connection/source changes stop unstarted disallowed work and never silently retarget old bodies.

## US25-U55 — As a newsletter requester or missionary, I want old request data and late work to expire at the declared limits, so that an old request cannot reappear as new or expose contact details indefinitely.

- Source: Q25; normative contract: EX13.
- **AC01:** No first email preparation/attempt or local availability after acceptance+7 elapsed days; normal processing remains immediate.
- **AC02:** Prepared send authority ends at earlier source/provider stops and physical disposal follows P6's24-hour bound.
- **AC03:** Core body/detail ends acceptance+30 days or earlier, CTA cannot outlive it, sent copy Off; read/restore/backup does not revive access.

## US25-U56 — As a legitimate guest sharing a network with other visitors, I want proportionate bounded request protection, so that abuse controls do not turn every ordinary request into a verification workflow.

- Source: Q25; normative contract: EX13, EX16.
- **AC01:** Code-owned finite field/byte/member/admission/backlog/retry profile is qualified with N/N+1 and load proof.
- **AC02:** Fast autofill, paste, international text or shared NAT alone is not conclusive abuse.
- **AC03:** Existing accessible risk treatment may reject/backpressure honestly; no accepted-drop, victim-address lockout, routine CAPTCHA or inbox step.

## US25-U57 — As a person using keyboard, assistive technology, zoom or a phone, I want the same complete readable and operable journeys, so that I can finish tasks without hidden labels, focus traps or clipped consequences.

- Source: Q01, Q02, Q07, Q12, Q17, Q19, Q21, Q24, Q25; normative contract: EX15, EX16.
- **AC01:** Visible names/current state, real headings/list/table/field semantics and actual Core touch hit areas hold at supported widths/zoom/RTL.
- **AC02:** Focus order/return, Escape/widget keys, field errors and once-only polite feedback work in real compositions.
- **AC03:** No essential clamp/hover-only action, nested interactive card, giant live region or automatic scroll/focus shift; axe complements manual proof.

## US25-U58 — As an account holder whose session or rights change, I want private state and all alternate access paths to respect the current boundary, so that old caches or direct URLs cannot expose another person's data.

- Source: Q01, Q02, Q07, Q12, Q17, Q19, Q21, Q24, Q25; normative contract: EX14.
- **AC01:** P12/source admission precedes fields/options/counts/order/paging and applies to each destination/alternate API/media/Storage path.
- **AC02:** Scope-matched caches and materializations retire on loss; late results are fenced independently of abort.
- **AC03:** No privileged fallback, raw private SSR/browser persistence, telemetry payload or Realtime permission inference.

## US25-U59 — As a maintainer operating these donor services, I want minimal useful source-owned diagnostics and bounded monitoring, so that I can recover real failures without surveilling donors or inventing tasks.

- Source: Q02, Q07, Q12, Q17, Q19, Q21, Q24, Q25; normative contract: EX14, EX17.
- **AC01:** Source/operation/slot/revision/outcome evidence is useful but raw contact/content/proof fields are excluded.
- **AC02:** Exact source thresholds have an accountable owner and response; uncertainty and successful children are preserved.
- **AC03:** Confirmed disclosure/duplicate/expired access is contained and requalified; no blanket donor cleanup or broad unsafe fallback.

## US25-U60 — As a release owner, I want one qualified owner path and honest complete-journey evidence, so that a polished screen cannot hide unsafe or unimplemented behavior.

- Source: Q01, Q02, Q07, Q12, Q17, Q19, Q21, Q24, Q25; normative contract: EX16.
- **AC01:** Required source amendments, schema/grants/purpose versions/consuming senders and current capability gates precede activation.
- **AC02:** Mixed-version/backfill/rollback retires contradictory readers/writers without historical send/read revival or lost valid records.
- **AC03:** Existing Playwright primary seam plus real owner/native Auth/provider/SQL/media/document/accessibility proof covers adverse cases; mocks/skips/ratification are not release proof and G01 remains explicit.

## US25-I01 — As a donor, I want open my own giving immediately on a neutral visit, so that ordinary personal tasks need no account chooser.

- Source: Q04; normative contract: IC02.
- **AC01:** Personal giving opens first when available.
- **AC02:** Only independently authorized represented contexts appear; no cross-device last-used preference is added.

## US25-I02 — As a representative-only donor, I want enter the giving I am permitted to manage without creating a personal gift record, so that I can complete legitimate work with my existing access.

- Source: Q04; normative contract: IC02.
- **AC01:** One represented context opens directly; several require a clear initial choice.
- **AC02:** No artificial personal donor, gift, claim or staff role is created.

## US25-I03 — As a donor representative, I want see whose giving I am viewing while my login remains mine, so that I do not confuse representation with impersonation.

- Source: Q04; normative contract: IC01, IC02.
- **AC01:** Active represented name is visible on financial pages and reviews.
- **AC02:** A narrow document/commitment grant does not open broad history, wallet or profile; names/options/counts are also authorized.

## US25-I04 — As a donor, I want switch giving contexts without retargeting work or preferences, so that my accepted instructions and private information stay correctly scoped.

- Source: Q04; normative contract: IC02, IC15.
- **AC01:** Switching causes no financial, default, consent, Site/brand or identity effect.
- **AC02:** Accepted tasks remain in original scope; stale responses cannot render beneath a new heading.
- **AC03:** Only genuinely unsaved loss requires a discard warning.

## US25-I05 — As an authorized nonfinancial portal user, I want reach my admitted reading or document task without a financial donor gate, so that legitimate access does not depend on having donated.

- Source: Q04, Q14; normative contract: IC02.
- **AC01:** The existing P12 context and current assignment/resource grant are required; no fifth context or profile/demo fallback.
- **AC02:** Public and exact guest handoffs retain their existing owner boundaries.
- **AC03:** Missing/failed lookup is not widened access.

## US25-I06 — As a donor, I want use email first and clearly labelled qualified social alternatives, so that sign-in remains familiar and understandable.

- Source: Q14; normative contract: IC03, IC05, IC15.
- **AC01:** Email remains primary; offered qualified social choices use Google/Apple/Facebook order and full labels.
- **AC02:** No automatic provider guessing, One Tap, mandatory popup or unrelated profile-completion step.
- **AC03:** Unqualified methods are not presented as working.

## US25-I07 — As a donor, I want choose the link or code in the first sign-in email, so that I can sign in on the device that is convenient.

- Source: Q14; normative contract: IC03.
- **AC01:** One qualified issuance has both alternatives and completes once.
- **AC02:** Paste/autofill and leading zeros work in one logical code input.
- **AC03:** Consumed proof is not reusable on another device or a transferable session.

## US25-I08 — As a donor, I want have email previews and scanners leave my sign-in proof untouched, so that opening or checking a message cannot authenticate or mutate my account.

- Source: Q11, Q14; normative contract: IC03.
- **AC01:** Email GET/HEAD/preview is inert; selector and fragment verifier require deliberate protected POST.
- **AC02:** Stripped fragment has no fallback authority.
- **AC03:** A legitimate validated OAuth callback retains its own standard exchange protocol.

## US25-I09 — As a donor, I want recover from expired codes, resends, denied provider consent and lost responses, so that I can finish without repeated messages or duplicate accounts.

- Source: Q14; normative contract: IC03, IC05, IC15.
- **AC01:** Reconcile the exact attempt and reject late predecessor results.
- **AC02:** No mail/OAuth on rendering; resend follows qualified source replacement/cooldown.
- **AC03:** Return to the same safe entry and usable proved method without guessed equivalent email.

## US25-I10 — As an account holder, I want have a new social identity prove the required native trust before joining my account, so that a stale or misleading email assertion cannot acquire my credentials.

- Source: Q14; normative contract: IC04, IC16.
- **AC01:** G01 must be satisfied by an officially supported exact deployment control before affected activation.
- **AC02:** Direct native authorize/link/exchange/refresh/credential endpoints are tested, not only Core.
- **AC03:** Already-bound subject sign-in is distinguished; no experimental broker/fork or silent provider removal.

## US25-I11 — As a donor, I want have provider identity and email treated according to their actual evidence, so that my account and giving are not inferred from mutable metadata.

- Source: Q14; normative contract: IC01, IC04, IC05.
- **AC01:** Stable provider/app/subject evidence governs; email/name/relay suffix is not identity.
- **AC02:** Google authoritative/non-authoritative cases, Facebook absent/returned email and Apple real/relay cases are qualified.
- **AC03:** Social consent grants no CRM claim, marketing or financial permission.

## US25-I12 — As an account holder, I want connect or disconnect a sign-in method deliberately, so that I keep the correct account and a usable recovery route.

- Source: Q14; normative contract: IC05, IC08.
- **AC01:** Link proves current account and new subject; attached-elsewhere is a conflict, not merge/transfer.
- **AC02:** Unlink requires an actually usable alternative, not identity count alone.
- **AC03:** Possible shared-email/session changes follow the email/security contract; unknown effects reconcile without blind replay.

## US25-I13 — As an Apple sign-in user, I want use relay privacy and recover when my Apple account changes, so that convenience does not disclose my underlying mailbox or strand access.

- Source: Q14; normative contract: IC05, IC16.
- **AC01:** Actual Apple app/domain/relay sender capacity and authentication are qualified.
- **AC02:** No required underlying email or full name; relay suffix changes are supported.
- **AC03:** Web-secret rotation and lifecycle/revocation handling are proved without financial deletion or giving cancellation.

## US25-I14 — As a Facebook sign-in user, I want use a publicly qualified login and receive a clear fallback when email is unavailable, so that a development-only success does not become a broken donor experience.

- Source: Q14; normative contract: IC05, IC16.
- **AC01:** Actual app mode, identity/email scope and ordinary non-role account work.
- **AC02:** Missing/denied email yields safe email fallback without fake principals.
- **AC03:** Adopted deauthorization/privacy/deletion events use the identity/privacy owner and preserve financial records.

## US25-I15 — As a donor, I want understand the organization's brand and the external provider handoff, so that I know which service is authenticating me.

- Source: Q14; normative contract: IC02, IC05.
- **AC01:** Asym-controlled entry/mail/recovery stays Tenant-branded on verified host.
- **AC02:** Only provider consent/mandatory marks use the narrow shared Asym/provider exception.
- **AC03:** Tenant offered-entry settings do not claim a global method prohibition.

## US25-I16 — As a donor changing email, I want enter one new address and explicitly select the uses I want to change, so that I avoid repeated effort without updating unrelated contact records.

- Source: Q11; normative contract: IC06.
- **AC01:** Targeted use alone is selected; additional use requires deliberate selection.
- **AC02:** Actual separate current/pending addresses are shown, including different/missing cases.
- **AC03:** Exact old-to-new effects and known readiness are reviewed before accepted immutable intent.

## US25-I17 — As a donor changing email, I want complete the necessary mailbox proofs without redundant challenges, so that my change is secure and understandable.

- Source: Q11; normative contract: IC06, IC07.
- **AC01:** Normal email-only change requires current authorization and new possession in either order.
- **AC02:** Current proof may satisfy fresh authorization; existing stronger policies remain.
- **AC03:** Contact proof reuse is exact same-request/purpose/address/Party only; no automatic verification inheritance.

## US25-I18 — As a donor changing both email uses, I want see each real result and resume only unfinished work, so that a partial failure does not undo or repeat a successful change.

- Source: Q11; normative contract: IC07, IC08, IC09.
- **AC01:** Acceptance/provider event is not completion.
- **AC02:** Confirmed, pending, incomplete, blocked and indeterminate remain separate per owner.
- **AC03:** Auth success is preserved if contact fails; lost responses reconcile the same operation.

## US25-I19 — As a donor changing email, I want leave, correct or recover a pending request truthfully, so that I do not accidentally cancel or revive an old proof.

- Source: Q11; normative contract: IC07.
- **AC01:** Draft Cancel discards only draft; Finish later preserves accepted pending work until qualified expiry.
- **AC02:** Different address uses proved supersession and resets proof progress.
- **AC03:** Lost-old-inbox recovery uses existing identity authority, never unverified staff relink or a new account.

## US25-I20 — As an established donor, I want keep my verified claim when I change a contact address, so that mutable contact data does not erase or transfer my history.

- Source: Q11; normative contract: IC01, IC06.
- **AC01:** Established claim proof and current contact proof/revision are separate.
- **AC02:** New address inherits no verification; recycled/ambiguous email cannot overwrite an established binding.
- **AC03:** Initial clean unclaimed-record policy remains separately governed; no unobservable recycling guarantee.

## US25-I21 — As an account holder across organizations, I want have shared credential changes reconcile current access everywhere they apply, so that old sensitive authority cannot survive an identity transition.

- Source: Q11; normative contract: IC02, IC08.
- **AC01:** Affected existing Tenant assignments use the P12 transition/epoch owner without exposing their inventory.
- **AC02:** Ordinary rights survive only where permitted; sensitive/restricted grants follow their required re-attestation.
- **AC03:** Contact-only changes do not invoke this global path; no temporary fence creates permanent arbitrary revocation.

## US25-I22 — As a donor finishing email verification, I want keep the exact completing device signed in while other old sessions are retired, so that I can continue safely without an inaccurate session promise.

- Source: Q11; normative contract: IC08.
- **AC01:** Retained session is bound to same principal/request, even on another device.
- **AC02:** Cleanup success needs native completion/readback and all-door current authorization proof.
- **AC03:** Delayed logout-others cannot later revoke newly authorized sessions; a completed request cannot replay cleanup.

## US25-I23 — As a donor changing contact email, I want retain my authored communication choices and receive only the required qualified messages, so that a contact edit does not enroll me or redirect old mail.

- Source: Q11; normative contract: IC09.
- **AC01:** Future delivery uses exact new revision/purpose; old queued recipients are never rewritten.
- **AC02:** Two required verification messages and qualified old-address security notice follow the sole message owners; current-address native obligations are reconciled.
- **AC03:** No suppression clearing, newsletter/receipt policy effect, direct sender or completion rollback after notice failure.

## US25-I24 — As an authenticated account holder, I want receive a truthful address-unavailable result without disclosure of another donor, so that the system does not claim an assurance its provider cannot supply.

- Source: Q11; normative contract: IC09.
- **AC01:** Public claiming remains uniform; accepted authenticated credential-existence limitation is narrow.
- **AC02:** No giving, profile or Tenant membership details, identity selection or merge follows.
- **AC03:** Abuse controls and qualification cover directly reachable native endpoints.

## US25-I25 — As a donor, I want update the name used for this organization's ordinary contact without a surname requirement, so that my actual name survives the system's formatting assumptions.

- Source: Q27; normative contract: IC10.
- **AC01:** One unsplit Unicode source value preserves order, mononyms and scripts.
- **AC02:** Exact person/field/purpose permission and subtype authority are required.
- **AC03:** Independent structured/legal/public/Auth/billing/represented names are not overwritten; missing data creates no compulsory profile task.

## US25-I26 — As a donor, I want keep or clear an optional usable contact phone, so that contact information does not become an authentication or consent change.

- Source: ; normative contract: IC10, IC15.
- **AC01:** Preserve human input/extensions; parse dialing only with sufficient region evidence.
- **AC02:** No rigid numeric mask, guessed country, forced verification or phone-required detour.
- **AC03:** Clear cannot resurrect a profile/mobile fallback or change SMS/MFA/channel preference.

## US25-I27 — As a donor updating personal contact, I want receive one durable result through every supported editor or API, so that a partial write or alternate route cannot contradict my change.

- Source: ; normative contract: IC10, IC16.
- **AC01:** Complete validation precedes one transaction with revision/audit/activity.
- **AC02:** Lost response reconciles; refresh failure does not redefine committed save; stale/ABA fails safely.
- **AC03:** REST/GraphQL/RPC and readers converge, including the donor phone save-then-403 regression.

## US25-I28 — As a donor, I want see one optional current mailing address with only permitted actions, so that postal contact remains a simple occasional task.

- Source: Q27; normative contract: IC11.
- **AC01:** Exact source summary, absence, unreadable and read-only are distinct.
- **AC02:** No address prerequisite for unrelated giving; independently required billing/issuer facts remain.
- **AC03:** No library/default selector/map/badge or inferred represented/global address.

## US25-I29 — As a donor editing postal contact, I want use one clear inline form that preserves my address and place in the page, so that I can make a routine update without a wizard or verification trip.

- Source: Q27; normative contract: IC11, IC15.
- **AC01:** Full unclipped current lines prefill; country is explicit and saved-only prefilled.
- **AC02:** Save/Cancel/Remove, pending/error/no-op/conflict/current-result feedback are truthful and accessible.
- **AC03:** Dirty-only discard, same-operation recovery and memory-only draft preserve effort without background replay.

## US25-I30 — As an international donor, I want enter my address as appropriate structured fields or ordered postal lines, so that the software does not discard units or invent a domestic format.

- Source: Q27; normative contract: IC11.
- **AC01:** Exactly one tagged representation and explicit qualified country; switches preserve drafts for review.
- **AC02:** Eight200-scalar lines,200-scalar locality/region,64-scalar postal and16KiB payload limits reject excess without truncating.
- **AC03:** Unsupported physical consumer is separate from successful save; no parsing manual lines, lookup gate or legal-addressee change.

## US25-I31 — As a donor or authorized staff member, I want save a mailing change against its exact current revision, so that concurrent changes and retries cannot overwrite one another.

- Source: Q27; normative contract: IC12.
- **AC01:** One source aggregate/head and immutable value revision with same-Tenant/person/purpose constraints.
- **AC02:** Atomic binding/safety/audit/activity/event transition and nonce uniqueness; true no-op creates none.
- **AC03:** Equivalent retry returns original result separately from current state; old evidence disposal cannot re-enable stale mutation.

## US25-I32 — As a donor who moves, I want withdraw old personal-mailing use including formatting predecessors, so that mail cannot use an old residence merely because it referenced an earlier format.

- Source: Q27; normative contract: IC12, IC13.
- **AC01:** Formatting successors share use generation; material move/Clear withdraws the whole generation.
- **AC02:** A→B formatting then B→C move fences unadmitted A and B routes without an ancestry scan.
- **AC03:** Independent purpose destinations and other people are not retargeted or revoked by address-string equality.

## US25-I33 — As a donor with mail being prepared, I want understand the separate result for saved address and existing mail, so that the portal does not promise recall or silently start another delivery.

- Source: Q27; normative contract: IC13.
- **AC01:** Withdrawal and irreversible handoff serialize; winner determines hold versus submitted/unknown reconciliation.
- **AC02:** Prepared/downloaded/printed is not handoff; existing staff containment handles physical copies.
- **AC03:** No automatic successor/address/email/print fallback; exact source review and new occurrence govern succession.

## US25-I34 — As a donor, I want remove my current mailing address deliberately, so that I can stop that current use without changing giving or erasing required records.

- Source: Q27; normative contract: IC12, IC13.
- **AC01:** Blank edit and Cancel are not Remove; short confirmation names exact effect.
- **AC02:** Clear and use withdrawal are atomic and select no fallback.
- **AC03:** Later restore creates a new authorized revision/generation, preserving independent documents/consent/authorizations.

## US25-I35 — As a donor, I want have retired postal values and diagnostic copies kept only for their declared purposes, so that a simple move does not create an indefinite address trail.

- Source: Q27; normative contract: IC14.
- **AC01:** Immediate editor removal and24h live raw retirement;365d minimized change evidence with exact permitted holds/floors.
- **AC02:** Guard/reference-needed safety metadata has separate lifecycle and bounded terminal disposal, no raw/reversible value.
- **AC03:** Independent financial/delivery/backup classes retain owner rules and restore suppression; no global destruction claim.

## US25-I36 — As a donor, I want have same-account context and security changes remove stale private data, so that late requests cannot expose an old address or another giving context.

- Source: Q04, Q11, Q14, Q27; normative contract: IC15.
- **AC01:** Keys and result fences include assignment/human/subject/purpose/revisions.
- **AC02:** Dispose of affected Query/DB materialization and memory draft; reauthorize later reads/replays.
- **AC03:** No durable private browser/public-cache state or promise to recall delivered bytes.

## US25-I37 — As an authorized support operator, I want diagnose the exact identity or contact stage with safe evidence, so that I can recover work without raw credential handling or invented authority.

- Source: Q11, Q14, Q27; normative contract: IC07, IC09, IC15.
- **AC01:** Business outcomes and technical/message evidence are distinct and correlated by nonsecret references.
- **AC02:** No raw tokens/hooks/full private URLs/contact payloads in generic logs.
- **AC03:** Use existing owner recovery; staff cannot proxy proof, raw-relink accounts or promise unsupported cancellation.

## US25-I38 — As a release reviewer, I want verify complete identity/contact journeys at their real boundaries, so that green mocks cannot certify unsafe account or mailing behavior.

- Source: Q11, Q14, Q27; normative contract: IC16.
- **AC01:** Real browser/public API acceptance is supplemented by migrated restricted-role SQL/transaction races and native Auth/provider G01 checks.
- **AC02:** Required fixtures cannot silently skip; demo bypass, catalog/static and compatibility schemas are limited evidence.
- **AC03:** Keyboard/mobile/assistive comprehension and every alternate entry path prove the intended outcome.

## US25-I39 — As an implementation owner, I want adopt one source of truth while preserving accepted work and history, so that mixed versions and rollback do not restore old unsafe behavior.

- Source: Q11, Q14, Q27; normative contract: IC01, IC16.
- **AC01:** Owner schema/constraints/protocol before consumer; all reached readers/writers reconciled.
- **AC02:** Backfill only trusted binding/contact/current-choice evidence; ambiguous data is not guessed.
- **AC03:** Kill new work without losing accepted readback, security fences, withdrawals or independent historical artifacts.

## US25-I40 — As a platform or CRM operations owner, I want operate bounded identity and mailing work with explicit signals and responses, so that saturation or configuration drift is diagnosed without weakening safety.

- Source: Q11, Q14, Q27; normative contract: IC05, IC14, IC16.
- **AC01:** Qualify provider capacity, protocol limits and shaped source budgets before activation.
- **AC02:** Exact signal thresholds/owners/responses cover native errors, Apple rotation/relay, stale operations, postal fanout/performance/disposal and format friction.
- **AC03:** Monitoring never substitutes for an unresolved safety gate or silently introduces an address library.

## US25-R01 — As a donor, I want open current recurring giving with obvious access to past arrangements, so that I can manage present giving and find history without another chooser.

- Source: Q22; normative contract: RC03, RC04.
- **AC01:** Neutral entry opens Current with adjacent Past and no counts; exact authorized links and safe active return context open their actual target.
- **AC02:** Current-empty offers Past without saying I never gave; denied, unavailable, no matches and complete absence remain distinct.

## US25-R02 — As a donor with limited line access, I want see each real arrangement classified from the lines I may access, so that hidden siblings neither leak information nor hide my past giving.

- Source: Q22; normative contract: RC02, RC03.
- **AC01:** The owner admits rows and fields before complete group membership/classification; no admitted line yields no shell.
- **AC02:** A mixed admitted group appears once in Current with ended members reachable; changing only a hidden sibling changes no visible placement, order, count or action.
- **AC03:** Past requires affirmative terminal/resolved proof; an unknown classification never becomes Past by negation.

## US25-R03 — As a donor, I want understand paused, processing and terminal-but-unresolved giving, so that I know whether future intent or payment confirmation still needs attention.

- Source: Q18, Q22; normative contract: RC01, RC03, RC19, RC20.
- **AC01:** Bounded and indefinite pauses remain Current and neutral; pause end and next scheduled gift are separate.
- **AC02:** Accepted pending activation remains findable without claiming received money; unaccepted checkout or standalone setup is not an arrangement.
- **AC03:** Ended/Canceled intent retains its cause while required stop/payment reconciliation remains visible; later settlement does not reopen it.

## US25-R04 — As a donor, I want search my current or past recurring gifts and open exact details, so that I can find older or less visible gifts without changing financial scope.

- Source: Q22; normative contract: RC03, RC04.
- **AC01:** Search covers the complete authorized selected view, never loaded rows; query matching does not shrink classification or action scope.
- **AC02:** Search Past is explicit and preserves the visible query; no silent broadening or hidden count.
- **AC03:** Old links and Back restore the currently authorized target, view/query and safe position, with useful local unavailable handling.

## US25-R05 — As a donor with several gifts in an arrangement, I want read a compact preview and reach every permitted line, so that the group stays recognizable without hiding important consequences.

- Source: Q22; normative contract: RC04.
- **AC01:** At most two ordinary permitted line previews use relevant-current then stable line order; Past uses stable order.
- **AC02:** Material source-certified current context outside that cap remains visible once with exact access; matches beyond the cap are reachable.
- **AC03:** Full reader retains each line detail/Manage, no hidden-sibling hint, group total, Manage-all command or nested independent scrolling trap.

## US25-R06 — As a donor with a long recurring history, I want continue through all admitted arrangements and large groups, so that page and rendering limits do not silently lose records.

- Source: Q22; normative contract: RC04, RC26, RC27.
- **AC01:** Groups and large child sets have separate bounded source continuation, immutable creation ordering and stable tie-breaks.
- **AC02:** Cursor binds scope/view/query/order/basis and reauthorizes each page; incompatible membership changes use anchored refresh rather than false exhaustion.
- **AC03:** Accessible explicit Load more supports keyboard/AT; virtualization bounds DOM only and cannot substitute for source/network/memory bounds.

## US25-R07 — As a donor, I want see exact money, cadence and calendar facts, so that I do not agree to an invented amount or date.

- Source: Q03, Q09, Q15, Q18, Q22; normative contract: RC05.
- **AC01:** Supported currency exponents and large exact minor units survive parsing/formatting; no USD, zero, Active or monthly fallback.
- **AC02:** Cadence labels distinguish every2weeks, every4weeks and twice-monthly1st/15th; full twice-monthly amount applies to both slots.
- **AC03:** Missing/ambiguous imported zone, date or authority is qualified unavailable/quarantined rather than inferred from provider UTC.

## US25-R08 — As a donor, I want edit relevant recurring terms in one focused workspace, so that I can make a simple or combined change without a wizard.

- Source: Q09; normative contract: RC06.
- **AC01:** Generic Change shows current exact gift context and named Edit controls; no forced preliminary task choice or preselected increase.
- **AC02:** Several sections may remain open and compatible edits share one proposal/review; opening controls creates no command/setup/default.

## US25-R09 — As a donor, I want collapse sections or undo one edit without losing other work, so that the visible controls mean what they say.

- Source: Q09; normative contract: RC06.
- **AC01:** Collapse/remount preserves proposed values and errors; collapse is not undo.
- **AC02:** Undo removes only the explicit requested field change, not a stale baseline write; unrelated edits survive.
- **AC03:** Untouched fields are not resent as stale instructions; omission, invalid empty and explicit optional-value removal remain distinct.

## US25-R10 — As a donor, I want receive linked validation for the whole proposal, so that hidden or dependent errors cannot cause a wrong financial change.

- Source: Q09; normative contract: RC05, RC06.
- **AC01:** Whole-form and authoritative server validation include collapsed/unmounted inputs; field-level validators alone are insufficient.
- **AC02:** Review displays linked summary/inline errors, opens and focuses the affected input, and preserves other valid input.
- **AC03:** Typing/IME is not aggressively reformatted; editing-page Enter validates/reviews while disclosure/Undo never submit acceptance.

## US25-R11 — As a donor or authorized representative, I want review the full combined exposure of my requested changes, so that a reduction in one field does not hide a wider instruction elsewhere.

- Source: Q09; normative contract: RC02, RC06, RC07.
- **AC01:** Amount, frequency, earlier date, longer/removed end, fees, rail and designation are classified together under exact current authority.
- **AC02:** One compatible compound change applies all requested local terms or none; no safe-subset or per-field acceptance.
- **AC03:** Mixed line values require explicit owner-supported values; unsupported cross-group/currency/entity changes are not silently generalized.

## US25-R12 — As a donor, I want change my continuing date or optional end with clear calendar consequences, so that I know which future gifts move or stop.

- Source: Q09, Q18; normative contract: RC05, RC06.
- **AC01:** Next recurring date explicitly re-anchors future giving and shows next three source dates/fewer with exact reason, rather than moving one payment.
- **AC02:** End date remains optional/inclusive and cannot precede first continuing occurrence; cadence/date edits do not silently clear it.
- **AC03:** Month31/leap restoration, fixed twice-monthly slots and frozen giving zone follow the common kernel; historical original anchor is unchanged.

## US25-R13 — As a donor, I want check every material consequence before accepting a recurring change, so that my consent matches the actual effect.

- Source: Q03, Q09, Q18; normative contract: RC07.
- **AC01:** Current-to-proposed review exposes exact affected lines, amounts/currencies/fees, rail/method, dates/zone/end, charge grouping and immutable submitted effects without expansion.
- **AC02:** Preview binds complete current authority/source/provider basis and expires15minutes from issuance or earlier relevant change.
- **AC03:** Ordinary Save is noncharging; a separately named qualified Today effect requires exact financial authorization, which may share the same review.

## US25-R14 — As a donor, I want return from secure setup or authentication to the right stage, so that a provider callback is not mistaken for a completed recurring change.

- Source: Q03, Q06, Q09, Q16; normative contract: RC07, RC08.
- **AC01:** Bounded owner preparation/correlation exists before actual setup, and exact account/mode/Customer/method/current scope is read back after return.
- **AC02:** An unaccepted/stale proposal gets current review; an exact already-accepted authorization completion resumes the same command without redundant acceptance.
- **AC03:** Saved method, verification, authorization and applied recurring terms remain separately reported; abandon does not auto-detach/default/rebind.

## US25-R15 — As a donor, I want recover a change after a lost response, so that I do not accidentally submit it twice.

- Source: Q03, Q09, Q18; normative contract: RC07, RC25.
- **AC01:** Accepted command/subjects/result/outbox commit atomically; same identity/input reads the same result, changed meaning conflicts.
- **AC02:** Unknown provider outcome keeps original effect/reservation and uses Check status; new transport key or expired provider key cannot create another effect.
- **AC03:** Historical accepted facts remain immutable while current provider/result evidence advances independently.

## US25-R16 — As a donor, I want leave an unaccepted edit and still reach protective actions, so that unfinished input does not trap me or silently undo accepted work.

- Source: Q09; normative contract: RC06, RC07, RC20.
- **AC01:** Meaningful dirty in-app departure can offer Stay/Discard edits; clean navigation needs no ceremony and Discard is not Cancel giving.
- **AC02:** Safe same-session edits survive review/errors, but no universal crash/cross-device autosave is promised; possible accepted work is resolved first.
- **AC03:** Skip/Pause/Cancel/eligible Stop remain reachable despite invalid drafts, serialized with already accepted unknown work.

## US25-R17 — As a donor, I want start Replace from the exact saved method and see its qualified uses, so that I know which gifts are candidates without guessing from a card mask.

- Source: Q03; normative contract: RC02, RC09.
- **AC01:** Owner resolves exact current credential/method/use tuples, not every historical token, shared Customer or matching mask.
- **AC02:** All currently admitted candidates are reachable with relevant amount/cadence/status; only eligible candidates start selected.
- **AC03:** Private/unknown uses never leak labels or counts and a capped page is not a complete inventory.

## US25-R18 — As a donor, I want adjust the eligible replacement selection deliberately, so that unselected or newly discovered gifts do not change unexpectedly.

- Source: Q03; normative contract: RC09.
- **AC01:** Select-all/count covers the declared complete authorized set, not visible rows; zero selection creates no replacement effect.
- **AC02:** New replacement method reclassifies compatibility/fees/authority without silently dropping selected incompatible uses or adding newly eligible/new uses.
- **AC03:** Oversized sets use explicit bounded grouping/reviews, never hidden first-N processing.

## US25-R19 — As a donor, I want choose a compatible saved method or securely add one inside Replace, so that I can finish without duplicating setup or losing the selected task.

- Source: Q03; normative contract: RC08, RC09.
- **AC01:** Qualified hosted card/bank collection and add-and-return preserves bounded safe selection correlation.
- **AC02:** Pending verification remains pending; expired financial review is rebuilt and no callback auto-applies selected gifts.
- **AC03:** Card-to-bank or fee-changing transitions require actual qualified after-state evidence, preserved fee-cover intent and explicit full financial terms.

## US25-R20 — As a financial authorizer, I want authorize each selected recurring group accurately, so that one convenient review does not become blanket collection authority.

- Source: Q03; normative contract: RC02, RC10.
- **AC01:** Each group obtains its own exact current collection authorization and group command.
- **AC02:** Donor-present grouped review is the narrow exception; staff bulk binding and cross-Party authority remain prohibited.
- **AC03:** Possessing a saved method, parent manifest or another group consent cannot authorize the new use.

## US25-R21 — As a donor, I want have my complete accepted replacement selection recorded before work begins, so that partial progress cannot lose what I approved.

- Source: Q03; normative contract: RC10, RC25.
- **AC01:** Typed nonexecuting parent has the actual old credential-lineage primary and exact-one-target protection, not a fake first group.
- **AC02:** Acceptance freezes full method/use/scope/evidence manifest and stable child intentions in one local transaction before effects.
- **AC03:** Parent performs zero provider effects; accepted selection cannot mutate and a changed instruction is a separately reviewed successor.

## US25-R22 — As a donor, I want replace only the selected compatible uses without unintended collections, so that future binding maintenance does not create extra payments.

- Source: Q03; normative contract: RC11.
- **AC01:** Owner chooses exact cohort/item mutation, qualified prospective selected-line split/legs or safe rejection; siblings retain their behavior.
- **AC02:** Adapter proves exclusive occurrence ownership, native method precedence and old-recovery control; all required legs reconcile before full confirmation.
- **AC03:** Replacement creates no charge, invoice pay, proration, catch-up, retry-slot reset, date advance, resume/restart/cancel, default or detach.

## US25-R23 — As a donor, I want see individual confirmed and unresolved replacement results, so that I can recover remaining work without repeating successful changes.

- Source: Q03; normative contract: RC07, RC10, RC11.
- **AC01:** Source-confirmed groups/legs stay confirmed while independent residuals show verification, checking, blocked or proved failure.
- **AC02:** No all-updated parent flag, whole-selection replay or automatic reversal to the old card.
- **AC03:** Result reload/reauth checks current scope and the same durable child identities even beyond provider idempotency retention.

## US25-R24 — As a donor, I want understand when an in-place credential edit affects shared uses, so that deselection does not promise an isolation the provider cannot supply.

- Source: Q03, Q06; normative contract: RC11.
- **AC01:** Shared expiry/billing metadata edit and provider updater continuity are separately qualified operations, not selective rebinding.
- **AC02:** Neither mask/fingerprint nor updater event establishes new authority/lineage or resets attempt pressure.
- **AC03:** The qualified operation discloses actual wider effect and cannot hide collection side effects behind Save.

## US25-R25 — As a donor, I want remove a saved method only after real live dependencies are safe, so that paused, pending or hidden uses do not break silently.

- Source: Q03, Q16; normative contract: RC12.
- **AC01:** Removal inventory and new binding/claim admission share one source fence; active, accepted, paused, recovery and unresolved work are included when they require the method.
- **AC02:** Hidden dependencies block safely without identity/count leakage; historical evidence-only refs and preference pointers alone are not permanent blockers.
- **AC03:** Visible unused count or active-cohort-only lookup cannot authorize detach.

## US25-R26 — As a donor, I want return from replacement to a separate current Remove review, so that I can replace gifts without being forced to delete the old method.

- Source: Q03, Q16; normative contract: RC09, RC12.
- **AC01:** In-use Remove offers existing guided Replace, then a freshly validated explicit Remove review.
- **AC02:** Partial/unselected/incompatible/unknown live dependencies still block unsafe removal; no Transfer-and-Delete implicit effect.
- **AC03:** I may finish replacement and keep the method; expired review needs new review, not repeated setup.

## US25-R27 — As a donor, I want recover an uncertain removal safely, so that a timeout does not trigger another detach or a false success.

- Source: Q03, Q16; normative contract: RC12, RC25.
- **AC01:** Exact removal command/fence commits before provider effect; new conflicting use remains blocked while pending/unknown.
- **AC02:** Only proved no-effect plus current source safety can release the fence; error response alone cannot.
- **AC03:** Result/reentry reconciles one operation; no promised reversible detach, reattachment, fake Undo or duplicate provider identity.

## US25-R28 — As a donor, I want retain newer preferences when an old method removal finishes, so that late cleanup cannot erase my current choice.

- Source: Q16; normative contract: RC12, RC14.
- **AC01:** Confirmed detach clears only still-matching effective/pending references, including private other-actor refs through server cleanup.
- **AC02:** Late removal of A after C is effective leaves C; remove effective A while pending B preserves B intent and advances only housekeeping revision.
- **AC03:** Cleanup failure reports removed plus pending cleanup and retries only cleanup; no default promotion, second detach or recurring change.

## US25-R29 — As a first-time donor or authorized representative, I want save a payment method without first making a gift, so that the wallet works before any financial history exists.

- Source: Q16; normative contract: RC02, RC08, RC13.
- **AC01:** Existing identity authority resolves a legitimate personal/represented Party and setup authority idempotently creates/resolves the normal exact Customer binding.
- **AC02:** No historical gift claim, recurring authorization lineage, forced donation or duplicate Customer workaround is required.
- **AC03:** Standalone read qualifies setup/attachment evidence; existing recurring access retains its independent authorization/control proof.

## US25-R30 — As a donor, I want optionally prefer a new method while saving it, so that I can express a convenience choice without changing existing giving.

- Source: Q16; normative contract: RC13.
- **AC01:** One initially unchecked checkbox says Prefer this method for new gifts, with persistent effect/scope description.
- **AC02:** Unchecked save, including first/only/last method, changes no current or pending preference; separate preference/Clear remains available.
- **AC03:** Checkbox is unsaved intent until Save; no extra modal, billing default, retry, fee, recurring binding or preference email.

## US25-R31 — As a donor or treasurer, I want keep my preferred method personal to my exact giving context, so that another actor, organization or account does not inherit it.

- Source: Q16; normative contract: RC02, RC13.
- **AC01:** Head scope includes stable human, giving Party, Tenant, Legal Entity and qualified settlement-account/account/mode/Customer context.
- **AC02:** Site/locale/currency/rail add no preference dimension, but every transaction qualifies its own eligibility.
- **AC03:** A different human/true issuer/account/Party gets no copied choice; same-Party canonical repair preserves proven intent only, never guesses conflicts.

## US25-R32 — As a donor verifying a bank method, I want know whether my optional preference is pending and when it expires, so that verification delay does not lose or misrepresent my choice.

- Source: Q16; normative contract: RC08, RC14.
- **AC01:** Current effective method remains until the latest preference qualifies; show actual pending preference deadline and independent bank step.
- **AC02:** Deadline is24elapsed hours after acceptance or10elapsed days from that same instant only for supported microdeposit classification before24hours.
- **AC03:** No resend/refresh revival; later valid bank save/verification may complete after preference expiry and I can explicitly choose preference afterward.

## US25-R33 — As a donor, I want change, reaffirm, clear or withdraw a pending preference predictably, so that late events do not undo my latest instruction.

- Source: Q16; normative contract: RC14.
- **AC01:** Explicit choice order uses expected intent revision; reaffirm/Clear supersedes old pending intent even if current visible value is unchanged.
- **AC02:** Withdraw/removal acts only on the still-current exact target; readiness checks intent identity/revision/deadline/current permission, not stale whole-row version.
- **AC03:** Expired/failed/superseded/withdrawn intents never resurrect predecessors; save-only and housekeeping do not cancel valid later intent.

## US25-R34 — As a donor, I want choose saved, new or Express payment through one secure checkout, so that the convenient starting choice never bypasses financial review.

- Source: Q16; normative contract: RC08, RC15.
- **AC01:** Express Checkout remains first; eligible preference starts selected in Asym saved choices and explicit transaction choice wins without changing standing preference.
- **AC02:** All branches reach one current quote/scope/authorization/finalizer and recurring initial-owner exclusivity.
- **AC03:** Required native CVC temporarily replaces the normal picker, preserves consent and verifies actual method/quote; no conflicting picker, assumed native preselection or raw CVC.

## US25-R35 — As a donor, I want receive separate truthful saving and preference results, so that one successful step is not undone because the other needs attention.

- Source: Q16; normative contract: RC08, RC14, RC15.
- **AC01:** Standalone hosted SetupIntent uses disclosed on_session setup purpose; saving/redisplay is not recurring/off-session authorization.
- **AC02:** Saved, ready, preferred, pending and unknown facts are independent; successful save is never auto-detached/re-added after preference failure.
- **AC03:** Required bank verification/mandate messages remain qualified despite receipt quieting, with no donation/receipt or extra preference notification.

## US25-R36 — As a returning donor, I want restart from the last agreed terms of my canceled gift, so that familiar suggestions are accurate rather than reconstructed from payments.

- Source: Q15; normative contract: RC16.
- **AC01:** Source terms effective at cancellation supply supported per-occurrence amount/currency/frequency, even if paused or never successfully funded.
- **AC02:** No last charged total, monthly equivalent, first-ever donation or never-effective future amendment is substituted.
- **AC03:** Ambiguous/ineligible history preserves safe context and valid inputs but requires current choice after independent restart/control qualification; no silent rounding/increase/FX.

## US25-R37 — As a returning donor, I want restart only the exact selected lines, so that shared historical charges do not select siblings or substitute ministries.

- Source: Q15; normative contract: RC02, RC16.
- **AC01:** Each selected line retains its separately qualified amount/frequency/destination; a group total is not copied into every line.
- **AC02:** Unavailable selected parts require deliberate scope revision, never silent dropping or substitute issuer/legal donor/merchant.
- **AC03:** History reading does not supply fresh-giving authority and the common personal case needs no extra role chooser.

## US25-R38 — As a returning donor, I want see all newly applicable defaults and optional end, so that same-as-before suggestions do not carry hidden old instructions.

- Source: Q15; normative contract: RC05, RC16.
- **AC01:** Only amount/frequency are historical financial suggestions; current schedule/timezone/fee/method choices follow canonical new checkout.
- **AC02:** Old date/end/pause/mandate/default/attribution/recovery budget is not reused.
- **AC03:** Until you cancel is visible; when former end existed, explain non-carryover with Set an end date; changing currency requires a fresh amount.

## US25-R39 — As a returning donor, I want review the actual initial charges and continuing schedule, so that a future start or twice-monthly plan never conceals a charge today.

- Source: Q15; normative contract: RC05, RC16.
- **AC01:** One initial attempt per disclosed compatible cohort follows final authorization, never one per line or twice-monthly leg.
- **AC02:** Today-start initial fulfills that ordinary slot; future/off-slot initial is out of series; fixed1st/15th rules and one exclusive invoice/product initial owner apply.
- **AC03:** Review shows exact Today/Next/Then, count/allocations/fees/end/zone and applicable authorization; bank initiation is Processing, not received money.

## US25-R40 — As a returning donor, I want recover an unresolved restart from any repeated entry, so that another tab or transport key cannot multiply initial gifts.

- Source: Q15; normative contract: RC17.
- **AC01:** Same unresolved action resolves one owner operation; overlapping different terms conflict/review rather than launch competing work.
- **AC02:** After acceptance, historical entry reaches linked current result; per-command typed successor mappings are immutable.
- **AC03:** A deliberate genuinely additional gift is possible with fresh authorization; no permanent unique-predecessor or amount/fund/method dedupe.

## US25-R41 — As a returning donor, I want understand old in-flight payments separately from my new gift, so that restart never revives canceled authority or hides unresolved collection.

- Source: Q15; normative contract: RC16, RC17.
- **AC01:** Fully canceled intent stays canceled; an independently supported active scheduled-cancel reversal is a different action.
- **AC02:** Known old in-flight settlement need not block independent fresh giving when old future control is proved fenced; unknown stop blocks unsafe restart.
- **AC03:** New execution isolates old invoice items, balances/credits, retries and debt without duplicate Customer, destructive cleanup or invoice-forgiveness shortcuts.

## US25-R42 — As a donor, I want choose a dated or indefinite pause in one straightforward form, so that I control the break without a guessed duration.

- Source: Q18; normative contract: RC18.
- **AC01:** Starts now is visible with optional future start; new ending choices are equally prominent and neither preselected.
- **AC02:** Date-bound versus manual resume uses one labeled control with revealed date; editing an existing pause shows its actual accepted values.
- **AC03:** No duration recommendation, survey, guilt, pause detour, unrelated profile step or duplicate confirmation.

## US25-R43 — As a donor, I want see payments before and after a scheduled pause, so that a future start or short pause has no concealed financial effect.

- Source: Q18; normative contract: RC18.
- **AC01:** Review separates Gifts before pause from First gift after pause plus next two source dates/fewer with end reason.
- **AC02:** Existing submitted effects and any immediate old-recovery closure remain visible; no nothing-changes-until-start promise.
- **AC03:** A valid short pause with no ordinary occurrence is allowed and explained, not converted to Skip or a fabricated missed gift.

## US25-R44 — As a donor, I want have pause boundaries preserve my existing schedule, so that a break suppresses gifts rather than creates debt or date drift.

- Source: Q18; normative contract: RC05, RC18, RC19.
- **AC01:** Finite interval is start-inclusive/resume-exclusive in frozen arrangement zone, with resume strictly after start; indefinite has no invented upper date.
- **AC02:** Due in-window occurrences remain suppressed history; resume boundary is eligibility, not guaranteed charge date.
- **AC03:** Immutable opened/ended/superseded event fold preserves history and rejects cycles/conflicts; current effective ranges are serialized without rejecting valid superseded history.

## US25-R45 — As a donor whose initial bank gift is processing, I want pause future giving before activation finishes, so that I can protect future intent without pretending the initial payment stopped.

- Source: Q18; normative contract: RC17, RC19.
- **AC01:** Only accepted terms/line identity can pause; unaccepted draft has no arrangement.
- **AC02:** Initial payment outcome remains independent; pending_activation remains until initial-success, binding and current control/activation proof all pass.
- **AC03:** All provisioning/activation/claim/submission checks current pause/cancel/end fences; late success yields paused/ongoing/terminal only as the locked current fold permits.

## US25-R46 — As a donor, I want have my agreed final horizon apply in every state, so that paused or pending giving cannot restart after its authorized end.

- Source: Q18, Q22; normative contract: RC19, RC20.
- **AC01:** Passed inclusive horizon ends otherwise ongoing/paused/pending-activation intent, preserving prior cancellation/supersession and stop warnings.
- **AC02:** Late in-flight success/correction does not reopen intent and end alone does not prove external stop.
- **AC03:** Pause end beyond horizon promises no future gift; pause start beyond horizon gets explicit existing-end explanation without silent change.

## US25-R47 — As a donor, I want resume with a clear review of any eligible gift today, so that the same gesture cannot silently re-anchor or collect missed gifts.

- Source: Q18; normative contract: RC20.
- **AC01:** Manual/early resume shows exact next eligible occurrence/current method/amount and renewed authority if required.
- **AC02:** Still-live retained Today occurrence may be separately named/reviewed in the same action and collected only by its ordinary executor.
- **AC03:** Expired, terminally suppressed, missed, submitted or unknown slots cannot reopen; failure to qualify keeps pause or requires explicit later safe choice, never silent skip.

## US25-R48 — As a donor with a dated pause, I want resume automatically only while current conditions permit it, so that stored timers cannot collect through changed authority or controls.

- Source: Q18; normative contract: RC19, RC20.
- **AC01:** At accepted boundary the owner re-proves method, authorization, control, horizon and original occurrence eligibility.
- **AC02:** Late worker or later method repair creates no catch-up; indefinite pause requires an authorized command.
- **AC03:** Unproved widening stays fenced with exact source status/help while qualified local protective narrowing remains available.

## US25-R49 — As a donor, I want skip an eligible gift or cancel directly, so that I can stop future intent without a forced retention journey.

- Source: Q09, Q18, Q22; normative contract: RC07, RC20.
- **AC01:** Skip targets exact future unclaimed occurrence/epoch and required legs, preserving grid and history with no debt or catch-up.
- **AC02:** Submitted/maybe-submitted work cannot be skipped; cancellation records immediately and reports separately pending provider stop when unproved.
- **AC03:** No required survey, pause, retention offer or phone call; unfinished Change never blocks an independently permitted protective action.

## US25-R50 — As a donor completing a payment repair, I want know whether the full original task is actually finished, so that a saved or verified method is not mistaken for repaired recurring giving.

- Source: Q06; normative contract: RC07, RC08, RC21.
- **AC01:** Original admitted failure-led intent and targets remain exact; incomplete binding/authorization/reconciliation stays primary.
- **AC02:** Payment authentication that already pays, closed/terminal/unknown recovery and incomplete repairs expose no retry offer.
- **AC03:** A named real positive repair-kind/provider profile preserving original eligibility must pass before optional follow-up activates; candidates alone do not qualify.

## US25-R51 — As a donor after a fully qualified repair, I want receive one quiet relevant review link when appropriate, so that I can consider the earlier failed gift without a debt or batch demand.

- Source: Q06; normative contract: RC21.
- **AC01:** One exact currently eligible failed occurrence may show Review this scheduled gift with Done while original completion remains dominant.
- **AC02:** Zero eligible or ambiguous origin yields no offer/chooser; repaired method-use sets never become payment selection or catch-up totals.
- **AC03:** Generic Wallet/referrer/forged failure flags, shared masks and stale alerts supply no scope; failed optional read preserves completion with restrained help.

## US25-R52 — As a donor, I want finish or review a repair without accidentally stopping or initiating payment, so that navigation and consequential recovery remain clearly different.

- Source: Q06; normative contract: RC21.
- **AC01:** Offer/Review/GET/prefetch/Back/reload/auth-return reserve no slot/grant and create no financial effect.
- **AC02:** Separate exact financial acceptance plus current origin/CSRF/step-up admits the existing operation; challenge continues that same instruction.
- **AC03:** Done/ignore is navigation and does not suppress authorized retries; separate Stop retries affects unstarted old recovery only, not normal future giving.

## US25-R53 — As a donor with a card recovery opportunity, I want retry only the originally eligible scheduled gift, so that manual action cannot race automation or add recovery capacity.

- Source: Q06; normative contract: RC22.
- **AC01:** Exact accepted retry substitutes earliest remaining admitted card slot and fences automation/current pressure; original not-before and +2/+4/+6 windows remain.
- **AC02:** 48-hour old-recovery cutoff and24-hour prior-control proof protect next ordinary occurrence; unknown keeps reservation and prevents overlap.
- **AC03:** 15 unattended attempts in rolling30×24hours, strictest applicable limits, ordinary priority and trigger-plus-three-later-cycle policy remain separate from manual/network headroom; no history reset.

## US25-R54 — As a donor with an established returned bank gift, I want receive only the supported exact bank recovery option, so that card retry behavior is never copied into ACH.

- Source: Q06; normative contract: RC22.
- **AC01:** One unattended normal entry; only qualified established R01/R09 same-entry proof may yield an exact full-cohort one-use grant and Retry this bank donation review.
- **AC02:** Initial activation, R08/revocation/unauthorized/R11, hard/unknown and partial-line cases create no generic old debit; unknown reserves grant and prevents overlap.
- **AC03:** Runway parks at earlier third normal soft return or180calendar days without normal success/new authorized lineage; recovery success does not reset it; absence of proof leaves no retry and any separate gift uses normal checkout.

## US25-R55 — As a donor without fixed pledges, I want see no unsolicited fixed-pledge interface, so that an uncommon feature does not clutter my account or disclose hidden records.

- Source: Q26; normative contract: RC02, RC23.
- **AC01:** Conclusive none yields no nav/card/badge/placeholder/skeleton/search/settings/reminder/upsell artifact; cold unknown is omitted without recorded false absence.
- **AC02:** Positive admitted history/authority-review record can prove presence without loading amounts; absence needs complete source/permission evaluation.
- **AC03:** Exact-record rights do not automatically grant enumeration; direct attempted routes get safe local outcomes and return rather than wrong-product redirect.

## US25-R56 — As a donor with a fixed campaign commitment, I want read my pledge and received-and-applied amount in a simple list, so that a promise is not mistaken for payment or debt.

- Source: Q26; normative contract: RC23.
- **AC01:** Conditional Pledges destination uses20source records per page with immutable newest-created order and explicit Load more, including admitted history.
- **AC02:** Detail says Campaign commitment and shows independently permitted current promise/fulfillment as text, not a percentage or global total.
- **AC03:** P/F/resolution/inverse/zero/excess cases preserve the conserving source fold; no P-minus-F owed, release-as-paid or refund/credit inference.

## US25-R57 — As a donor with a fixed pledge, I want inspect actual plans and linked gifts or recurring arrangements, so that relationships do not invent dates, payments or extra access.

- Source: Q26; normative contract: RC02, RC23.
- **AC01:** Absent/part-undated/multi-designation plans keep exact source meaning without next-charge/overdue/monthly-normalized guesses.
- **AC02:** Related gift, document and recurring links reauthorize their exact targets and return context; pledge end alone never stops recurrence.
- **AC03:** Manual/external Other commitments remain available and all fixed contextual routes reach the one fixed owner, not duplicate lists or old recurring IDs.

## US25-R58 — As a donor with a fixed pledge, I want send a concise change request and recover its receipt, so that I can ask staff without directly editing financial terms.

- Source: Q26; normative contract: RC24, RC25.
- **AC01:** One required nonblank plain field enforces2000Unicode scalars and8KiBUTF-8 server-side; no attachments or staff financial editor.
- **AC02:** Immutable typed request and exact actionable receiving work commit together or remain durably owner-discoverable; no ownerless Request received.
- **AC03:** Same identity/input returns one receipt; changed payload conflicts; ordinary request cannot enter financial execution and confirms only its own non-effect.

## US25-R59 — As a donor who does not recognize a fixed commitment, I want send the exact commitment for protective authority review, so that disputing it does not require proving its original validity.

- Source: Q26; normative contract: RC02, RC24.
- **AC01:** Explicit I do not recognize route requires current portal/request plus narrow protective intake capability; it is not inferred from text.
- **AC02:** Deliberate dispute statement needs no ordinary prose and atomically enters existing bounded authority-review/forecast-reminder protection.
- **AC03:** No staff-role grant, end/refund/recurring stop/history loss or all-payments-stopped claim; other source authorities remain independent.

## US25-R60 — As a donor and authorized pledge reviewer, I want understand request progress and its bounded private text custody, so that silence, reading or expiry cannot masquerade as a completed change.

- Source: Q26; normative contract: RC24, RC26.
- **AC01:** Received/In review/Completed/Could not complete require exact source disposition; separate current terms may change through another authorized command.
- **AC02:** Original text is immutable; new information is a deliberate new occurrence and staff re-proves current authority before disposition.
- **AC03:** Encrypted body expires90elapsed days from acceptance, earlier erasure/exact hold rules apply; normalized evidence retains own policy, no fake completion or guessed action after erasure.

## US25-R61 — As a qualified pledge service contact, I want stop my own eligible reminders, so that stopping contact changes neither pledge nor another recipient preference.

- Source: Q26; normative contract: RC24.
- **AC01:** Only existing purpose-qualified own-recipient state/stop is exposed; no unsolicited enrollment On, cadence/channel builder or contact selector.
- **AC02:** Purpose-bound email stop works without portal pledge-view rights but grants no pledge navigation or other-person access.
- **AC03:** Pledge visibility alone cannot control another service contact; no new message key or request-notification event.

## US25-R62 — As a donor or representative, I want have every financial view and command honor current access, so that URLs, caches and privileged paths do not leak or move my data.

- Source: Q03, Q06, Q09, Q15, Q16, Q18, Q22, Q26; normative contract: RC02, RC25, RC26.
- **AC01:** Actual source/PDP, grants, composite references, immutable scopes and effective old/new row checks reject forbidden references and transformations.
- **AC02:** Context/auth loss cancels and rejects stale responses/returns; protected rows never persist in public caches/localStorage/URLs/logs.
- **AC03:** Service role/definer/worker access preserves current source authority; partial line visibility cannot reconstruct hidden amounts or authorize whole collection.

## US25-R63 — As a donor using mobile or assistive technology, I want complete every reviewed journey with readable controls and stable focus, so that essential actions work without visual, keyboard or bandwidth barriers.

- Source: Q03, Q06, Q09, Q15, Q16, Q18, Q22, Q26; normative contract: RC04, RC06, RC08, RC18, RC23, RC28.
- **AC01:** Shared exact base-maia/Base UI semantics, real labels/headings and restrained status/error announcements; no theme fork or staff-grid density by default.
- **AC02:** 320CSS-pixel reflow,200%text/400%zoom,44px primary targets, RTL/CJK/IME/long labels, reduced motion and supported screen-reader/browser/hosted-iframe focus are exercised.
- **AC03:** Material amounts/dates/errors/actions do not disappear behind clamp/hover/color/toast; Back/error links preserve meaningful position and no focus theft.

## US25-R64 — As a source operations owner, I want diagnose delayed or inconsistent work through bounded existing operations, so that routine repairs do not require database editing or repeat payments.

- Source: Q03, Q06, Q09, Q15, Q16, Q18, Q22, Q26; normative contract: RC26, RC27.
- **AC01:** Minimized exact operation/version/reason/control/lag evidence distinguishes accepted instruction from provider/delivery/current state.
- **AC02:** Five-minute unknown-effect and48-hour untriaged-request thresholds route to named owners without converting normal verification into failure.
- **AC03:** Actual source workload/selection/page/child/bytes/provider limits and inherited P16 latency/freshness budgets are proved; no silent cap, provider fanout or speculative new infrastructure.

## US25-R65 — As a release engineer, I want verify complete donor outcomes at the approved test seams, so that mocked success cannot activate an unqualified financial or document lane.

- Source: Q03, Q06, Q09, Q15, Q16, Q18, Q22, Q26; normative contract: RC25, RC27, RC28.
- **AC01:** Primary browser→protected owner→real isolated source/storage journey proves result and actual side effects; supporting real role/two-session races and property tests cover deeper invariants.
- **AC02:** Pinned exact account/mode/rail/provider positive profile, hosted CVC/ACH flows and replay/unknown controls are explicitly qualified before activation.
- **AC03:** Demo smoke, static SQL regex/catalog fixtures, migration-only success and current helper tests retain limits; no credentials/real provider writes in normal unit lane.

## US25-R66 — As a donor, I want retain truthful history and safe access through changes or rollout incidents, so that containment does not undo giving or restore unsafe old controls.

- Source: Q03, Q06, Q09, Q15, Q16, Q18, Q22, Q26; normative contract: RC01, RC07, RC17, RC19, RC27.
- **AC01:** Accepted terms/results/old occurrences stay immutable while current state and permissions advance independently.
- **AC02:** Mixed versions, old tabs, rollback and restore preserve accepted/unknown reconciliation/protective paths and deny unknown command versions.
- **AC03:** Reached legacy mock wallet, one-time normalization, direct generic provider/pledge writers and bad fallback readers are reconciled, not retained as emergency authority.

## US25-R67 — As a financial authorizer or receipt recipient, I want receive only qualified required communications for my exact purpose, so that quiet settings neither suppress mandatory notices nor create message spam.

- Source: Q03, Q06, Q09, Q15, Q16, Q18, Q26; normative contract: RC26.
- **AC01:** Only exact Live contracts release complete source-owned plans with current purpose recipients; Reserved/unknown creates zero communication state and no historical catch-up.
- **AC02:** Official receipt, authorization/recovery and service-contact recipient scopes remain distinct; no extra recovered/preference/same-state-failure email or open-as-awareness claim.
- **AC03:** Required setup/rail/network notices remain gates, including applicable seven-calendar-day alternative-method access and seven-day semiannual/annual upcoming baseline under stricter qualified rules.

## US25-R68 — As a donor and privacy/source operator, I want have each deadline apply only to its actual purpose, so that temporary choices expire without erasing financial evidence or reviving stale authority.

- Source: Q03, Q06, Q09, Q15, Q16, Q18, Q26; normative contract: RC07, RC14, RC24, RC26, RC27.
- **AC01:** 15-minute review,2-minute bounded lease,24-hour/10-day preference and90-day fixed request-body clocks retain exact original starts; no refresh/retry/reauth reset.
- **AC02:** Normalized source evidence/semantic identity retains source life plus applicable audit, separate from raw provider90days, health cache13complete months and security30/90day classes.
- **AC03:** Holds preserve only exact restricted evidence; they do not revive expired financial authority, public access, optional preference or erased-body action.

## US25-D01 — As a donor, I want see only my currently authorized financial context, so that I can trust whose records I am viewing.

- Source: Q05, Q10, Q23; normative contract: D01.
- **AC01:** Given two Tenants and personal/represented subjects, each read, filter, count, export and document uses the exact admitted context.
- **AC02:** A late response after switching subject is discarded; household or shared email grants nothing.

## US25-D02 — As a donor with limited record rights, I want see only independently permitted amounts and labels, so that hidden ministry or family facts stay private.

- Source: Q05, Q20, Q23, Q28, Q29; normative contract: D01.
- **AC01:** A permitted allocation does not reveal forbidden parent totals, sibling counts, facets or ordering.
- **AC02:** A safe alias does not remove money independently granted by the source; unknown and withheld do not become0.

## US25-D03 — As a finance operator, I want have donor views agree with the same source revision, so that I can investigate discrepancies without editing portal totals.

- Source: Q05, Q23, Q28, Q29; normative contract: D01, D19.
- **AC01:** List/detail/summary compare at the declared coherent money/date/recognition basis.
- **AC02:** A mismatched or lagging basis is Updating/unavailable and owner recovery is nonfinancial from the read path.

## US25-D04 — As an international donor, I want read exact original currency values, so that my gifts are not rounded or converted incorrectly.

- Source: Q05, Q10, Q20, Q23; normative contract: D01, D11.
- **AC01:** 0/2/3-exponent currencies and values beyond JavaScript safe integer range retain exact source value.
- **AC02:** No fixed cents divisor, default currency, mixed-currency total or negative-to-zero repair appears.

## US25-D05 — As a donor, I want recognize a split gift as one gift, so that I do not reconstruct it from transaction fragments.

- Source: Q05, Q10; normative contract: D02.
- **AC01:** A100 gift split60/40 appears once with admitted original amount and allocations.
- **AC02:** Multiple attempts, documents and corrections do not duplicate its row or monetary effect.

## US25-D06 — As a donor whose bank payment is processing, I want see the actual recorded outcome, so that I know the instruction was accepted without being told money has arrived.

- Source: Q05, Q23; normative contract: D02, D12.
- **AC01:** An unposted source outcome has a qualified requested amount/status but no placeholder Contribution, receipt or tax date.
- **AC02:** Exact source posting correlation replaces/connects the same entry once; replay does not duplicate it.

## US25-D07 — As a donor whose gift changes, I want understand original and current facts together, so that a refund or return is not mistaken for a failed gift.

- Source: Q05; normative contract: D02.
- **AC01:** Original100 remains100; an admitted20 partial refund is separately visible and allocation effects are not guessed.
- **AC02:** Pending refund, returned, disputed and collection failure preserve distinct source meanings.

## US25-D08 — As a donor with two identical payments, I want retain both real gifts, so that similar dates and amounts do not merge my history.

- Source: Q05; normative contract: D02.
- **AC01:** Different source roots/cohorts/issuers/currencies remain distinct despite matching display fields.
- **AC02:** Only exact owner-proved correlation groups a preposting record with its posted Contribution.

## US25-D09 — As a donor with offline or imported gifts, I want find all source-qualified records available here, so that platform entry method does not erase legitimate history.

- Source: Q05, Q10; normative contract: D02.
- **AC01:** Admitted online/offline/imported records retain provenance and safe historical Site/fund facts.
- **AC02:** Drafts, uncommitted batches, unknown classification and ambiguous imports are not labeled received or One-time by default.

## US25-D10 — As a donor with noncash giving, I want see useful records without fabricated values, so that internal valuations are not confused with money or deductions.

- Source: Q05, Q23; normative contract: D02, D12.
- **AC01:** Admitted descriptions/quantities and correct documents remain available.
- **AC02:** Unknown/noncash monetary comparison and Home amount never use an internal appraisal or asset-sale value.

## US25-D11 — As a donor, I want open a gift directly and return to my place, so that reviewing details is effortless.

- Source: Q05, Q10; normative contract: D03, D05.
- **AC01:** Copied permitted detail links survive sign-in and refresh; Back restores scope and logical record position.
- **AC02:** Keyboard/touch users have the same explicit detail route without hover-only or duplicate hidden controls.

## US25-D12 — As a donor, I want find new changes to an older gift, so that important corrections are not buried.

- Source: Q05; normative contract: D03.
- **AC01:** The grouped History offers qualified recent-change discovery independent of a notification being available.
- **AC02:** Private notes do not reorder results; changed-time is not gift date and refresh does not move focus unexpectedly.

## US25-D13 — As a donor on an unreliable connection, I want distinguish missing records from failed loading, so that I can recover without giving again.

- Source: Q05, Q10; normative contract: D03.
- **AC01:** Loading, no matches, incomplete coverage, unlinked history, Updating and failure have distinct safe responses.
- **AC02:** Continuation failure preserves authorized loaded rows and retries reads only, not money or documents.

## US25-D14 — As a donor seeking help, I want reach the organization with relevant permitted context, so that I do not expose sensitive screenshots or processor identifiers.

- Source: Q05, Q08; normative contract: D03, D07.
- **AC01:** Help uses the existing exact admitted source/organization destination.
- **AC02:** Denied/missing targets remain non-disclosing; no new support inbox or financial repair command is created.

## US25-D15 — As a returning donor, I want start History with all available records, so that January does not make older gifts disappear.

- Source: Q10; normative contract: D04.
- **AC01:** Neutral entry has no current-year/five-year cutoff or numbered page controls.
- **AC02:** A deliberate target or Back restores its admitted scope instead of resetting to the neutral default.

## US25-D16 — As a donor, I want choose readable date periods, so that I know exactly which dates are included.

- Source: Q10, Q20; normative contract: D04.
- **AC01:** Presets and custom inclusive bounds use source date kind/timezone and show resolved concrete ranges.
- **AC02:** Leap/day/year boundaries are correct; unknown dates remain available unfiltered and no picker-open action applies a filter.

## US25-D17 — As a donor, I want filter several funds together, so that I can find the gifts connected to my chosen ministries.

- Source: Q10, Q20; normative contract: D04.
- **AC01:** OR applies within selected funds and AND across categories, against authorized whole-source facets before paging.
- **AC02:** Each matching gift appears once; archived safe labels remain available and private disambiguators do not leak.

## US25-D18 — As a donor, I want filter by the amount I originally supported, so that fee cover or refunds do not change what the filter means.

- Source: Q10, Q20; normative contract: D04.
- **AC01:** For100 support plus3 cover, Gift amount100 matches;103 and selected allocation40 do not.
- **AC02:** A qualified preposting equivalent is labeled Requested amount; current cart/terms or forbidden values never substitute.

## US25-D19 — As a donor using multiple currencies, I want choose currency with amount bounds, so that the query cannot silently convert my choices.

- Source: Q10, Q20; normative contract: D04.
- **AC01:** One known currency may visibly prefill; multiple choices require a deliberate currency for amount comparison.
- **AC02:** Removing currency resolves related bounds visibly in the same draft; blank bounds remain unbounded, not0.

## US25-D20 — As a donor, I want apply or discard filter edits predictably, so that closing a form cannot change my history.

- Source: Q10, Q20; normative contract: D04.
- **AC01:** Discrete presets may apply immediately; multi/range edits use Apply, including one mobile Filters sheet.
- **AC02:** Clear inside an editor changes draft only; outside Clear resets the applied query within the same giving context.

## US25-D21 — As a donor with an invalid filter, I want correct my input without losing it, so that errors do not silently broaden the result.

- Source: Q10, Q20; normative contract: D04.
- **AC01:** Reversed dates/amounts and unsupported currency precision remain visible with associated guidance.
- **AC02:** Forbidden/removed predicates require a safe current proposal; no silent swap, truncation or dropped constraint.

## US25-D22 — As a donor, I want use relevant secondary filters or find a gift, so that I can narrow history without a staff query builder.

- Source: Q10, Q20; normative contract: D04.
- **AC01:** Only source-approved status/type/provenance/Site/currency/method/search fields appear.
- **AC02:** Search is bounded over admitted full scope, not virtual DOM; Site never changes Tenant and unknown type remains unknown.

## US25-D23 — As a donor with long history, I want continue reading and scroll backward reliably, so that a large account remains usable.

- Source: Q10; normative contract: D05.
- **AC01:** One continuation runs at a time; accessible More gifts/retry accompanies automatic History continuation.
- **AC02:** Eviction requires source-supported backward/anchor retrieval; no full-prefix re-download or inaccessible earlier rows.

## US25-D24 — As a donor, I want keep meaningful position when history updates, so that new data does not interrupt what I am reading.

- Source: Q05, Q10; normative contract: D05.
- **AC01:** Append/resize/render-mode changes preserve record-and-within-item anchor, not recycled index.
- **AC02:** A relevant correction expires traversal coherently or preserves its contract; typed restart keeps filters and focus.

## US25-D25 — As a donor changing accounts, I want have private working data retired, so that old records cannot appear in the new context.

- Source: Q10, Q20, Q23; normative contract: D05.
- **AC01:** Logout, same-user subject/Tenant change and revocation retire both Query and DB retained rows.
- **AC02:** Ignored abort and late responses cannot repopulate prior materialization or persistent browser storage.

## US25-D26 — As a donor, I want find statements and receipts directly, so that I do not have to search transaction history first.

- Source: Q08; normative contract: D06.
- **AC01:** Desktop/mobile navigation explicitly names Receipts & statements.
- **AC02:** Neutral view has Annual statements then Individual receipts with older access and no initial type/year gate.

## US25-D27 — As a donor with several official documents, I want recognize the right document, so that copies and retries do not look like additional receipts.

- Source: Q08; normative contract: D06.
- **AC01:** Group actual issuer/purpose/period logical documents; keep legitimate separate documents distinct.
- **AC02:** Artifact retries/recipient copies do not duplicate entries and no overlapping/currency/recognition total is invented.

## US25-D28 — As a donor with an optional support overview, I want distinguish it from official tax records, so that recognition is not confused with legal giving.

- Source: Q08, Q29; normative contract: D06, D15.
- **AC01:** Support overview is labeled Not a tax document and appears only under its independent enabled purpose.
- **AC02:** Off produces no overview work/UI but does not deny a separately authorized DAF-awareness read.

## US25-D29 — As a donor, I want view, download and print available documents, so that I can keep my records without contacting staff.

- Source: Q08; normative contract: D06, D07.
- **AC01:** All entrances resolve the same exact current source artifact with allowed View/Download/local Print.
- **AC02:** Reading neither issues/sends/re-renders a document nor claims the device saved/read/printed it.

## US25-D30 — As a donor whose statement section fails, I want keep using my available receipts, so that one failure does not block the entire document area.

- Source: Q08; normative contract: D07.
- **AC01:** Safe independent inventory remains visible while failed section/continuation offers appropriate retry.
- **AC02:** Absent, dark, withdrawn and failed-read states do not become zero giving or fabricated documents.

## US25-D31 — As a donor awaiting a correction, I want get the current valid document, so that pending replacement does not serve an invalid fallback.

- Source: Q08; normative contract: D07.
- **AC01:** A still-admitted predecessor remains usable only under owner policy; a withdrawn predecessor does not.
- **AC02:** Promotion selects exact successor without mutating old bytes, splicing Range responses or listing versions as peers.

## US25-D32 — As a recipient of a document link, I want reach only the permitted document, so that an exact handoff cannot expose an account library.

- Source: Q08; normative contract: D07.
- **AC01:** Signed-in links preserve exact target; guest assurance is purpose-bound and not dashboard/list identity.
- **AC02:** Scanner GET/HEAD is inert; exact artifact bytes use current owner access and forwarding limits are described honestly.

## US25-D33 — As a donor needing another copy, I want request it only through the qualified document action, so that ordinary viewing never sends unexpected mail.

- Source: Q08; normative contract: D07.
- **AC01:** Send another copy is present only when the source admits its exact purpose/recipient/current destination.
- **AC02:** The deliberate copy operation follows existing owner idempotency/safety and is not retried by a failed View request.

## US25-D34 — As a donor with historical records, I want retain legitimate artifact access during rollout, so that new issuance darkness does not erase valid documents.

- Source: Q08, Q29; normative contract: D06, D07.
- **AC01:** Admitted existing artifacts remain independent of new-purpose generation availability.
- **AC02:** No foreign legacy artifact import/conversion/compatibility alias or generic snapshot receipt is used as fallback.

## US25-D35 — As a recurring donor, I want quiet eligible routine receipt emails, so that I can reduce noise while keeping my acknowledgments.

- Source: Q13; normative contract: D08.
- **AC01:** One exact issuer/legal-donor-purpose switch covers current and future eligible recurring gifts.
- **AC02:** Correct documents and giving continue; first/new-commitment and independently required notices retain their rules.

## US25-D36 — As a donor managing another legal donor, I want understand which receipt preference changes, so that my personal settings and represented giving do not mix.

- Source: Q13; normative contract: D08.
- **AC01:** The scope label names the qualified issuer and legal donor.
- **AC02:** Shared mailbox, document read or payment authority alone does not grant edit permission; another issuer/donor never inherits Off.

## US25-D37 — As a donor, I want see and save the actual receipt-email choice, so that a local toggle cannot pretend the server accepted it.

- Source: Q13; normative contract: D08.
- **AC01:** No-choice default preserves source delivery; read failure does not flash guessed On/Off.
- **AC02:** Expected-revision same-operation save gives durable local feedback; stale/unknown outcomes reconcile without silent overwrite or endless lock.

## US25-D38 — As a donor turning routine emails off, I want understand prospective delivery, so that already queued mail is not a broken promise.

- Source: Q13; normative contract: D08.
- **AC01:** Off preceding P7 eligible occurrence decision records not requested without fabricating a send/suppression event.
- **AC02:** Previously admitted work follows its lifecycle; On affects future decisions only with no backlog or test receipt.

## US25-D39 — As a donor filing before annual statements are ready, I want obtain the needed acknowledgment, so that quieting does not postpone documentation.

- Source: Q13, Q08; normative contract: D08, D07.
- **AC01:** Qualified current individual artifacts remain retrievable without enabling email or waiting for annual processing.
- **AC02:** No universal January31 guarantee, under250-only restriction, waiver, read pixel or filing-date questionnaire is added.

## US25-D40 — As a donor, I want download the scope I am currently viewing, so that the file does not unexpectedly include different gifts.

- Source: Q20; normative contract: D09.
- **AC01:** Opening Download copies applied resolved filters once, excluding an unfinished History draft and later browsing changes.
- **AC02:** Scope summary names every narrowing; opening it starts neither extraction nor History change.

## US25-D41 — As a donor, I want adjust only my download filters, so that my browsing place and filters remain intact.

- Source: Q20; normative contract: D09.
- **AC01:** Change filters and reset affect the proposal only, in the same workspace without nested modals.
- **AC02:** Invalid or forbidden scope is corrected explicitly; no hidden widening or unqualified exact count.

## US25-D42 — As a donor reviewing an annual summary, I want download the same financial meaning, so that the file can explain the summary.

- Source: Q20, Q23; normative contract: D09, D12.
- **AC01:** Annual export captures exact legal subject, issuer/currency partitions, civil ranges, measure/version and all narrowing.
- **AC02:** Original Gift amount stays100 while qualified Current giving amount includes actual cover/inverses; generic exports retain the base census.

## US25-D43 — As a donor, I want start one recoverable file preparation, so that double clicks and a lost response do not create duplicate jobs.

- Source: Q20; normative contract: D10.
- **AC01:** Current valid10-minute review envelope and semantic identity admit one scoped request; conflicting payload rejects.
- **AC02:** One active preparation per initiating context is enforced without silently replacing another proposal.

## US25-D44 — As a donor, I want leave preparation running or cancel it explicitly, so that closing a window cannot cancel giving.

- Source: Q20; normative contract: D10.
- **AC01:** Close preserves accepted work; Cancel file preparation targets only the extract.
- **AC02:** Cancel/expiry racing finalization prevents late Ready; lost responses recover original operation.

## US25-D45 — As a donor, I want receive a complete file, so that a success state never hides truncation.

- Source: Q20; normative contract: D10.
- **AC01:** Coherent as-of extraction serializes every admitted root/column, verifies bytes/hash/size/count and publishes atomically before10min acceptance deadline.
- **AC02:** Partial/unknown/orphan upload remains private; empty means complete query with no matches, not failure.

## US25-D46 — As a donor returning to a prepared file, I want recognize its original scope and availability, so that a prior result cannot replace my current intent.

- Source: Q20; normative contract: D09, D10.
- **AC01:** Current Download starts a fresh current-filter proposal and separately exposes retained active/recent exact-context result.
- **AC02:** After private payload erasure only minimized result metadata appears; old filters are not reconstructed from audit.

## US25-D47 — As a donor downloading over a poor connection, I want retry the exact same authorized file, so that recovery cannot splice or regenerate its contents.

- Source: Q20; normative contract: D10.
- **AC01:** Authenticated download/Range retry names one exact artifact/generation and rechecks current authority.
- **AC02:** Reauth/retry/reading do not renew first-Ready24h expiry; replay/reentry never auto-downloads or claims saved.

## US25-D48 — As a donor whose permissions change, I want have future file access reflect current rights, so that an older file cannot bypass a new restriction.

- Source: Q20; normative contract: D10.
- **AC01:** Relevant row/field/subject contraction invalidates the whole artifact before further admitted bytes.
- **AC02:** Unrelated policy or later financial corrections do not rewrite an honest immutable as-of file; delivered bytes cannot be recalled.

## US25-D49 — As an export operator, I want dispose of temporary files without losing business records, so that privacy cleanup cannot alter giving.

- Source: Q20; normative contract: D10, D19.
- **AC01:** Failed/incomplete payload leaves within24h of acceptance; Ready bytes within24h first Ready; canceled access denies immediately with prompt purge.
- **AC02:** 30-day correlation cleanup never deletes gifts/audit or allows expired-envelope replay to start another request.

## US25-D50 — As a donor opening a spreadsheet, I want read exact safe values, so that names or large identifiers cannot execute formulas or silently round.

- Source: Q20; normative contract: D11.
- **AC01:** Trusted numeric cells preserve exact supported decimal meaning; arbitrary/full-width/whitespace formula-trigger text remains protected.
- **AC02:** BOM/CRLF/quoting, long Unicode and supported Excel/Sheets paths pass; unsupported roundtrip claims are not made.
- **AC03:** At Excel15/16 significant decimal digits, greater-precision values use protected exact text even when the integer remains JavaScript-safe.

## US25-D51 — As a donor reading Home, I want understand this year so far, so that a simple amount has a clear basis.

- Source: Q23; normative contract: D12.
- **AC01:** Each current legal-donor issuer/currency row uses actual year/range and visible fee-cover/refund monetary basis.
- **AC02:** At most three complete rows appear, with qualified broader access and no combined scalar, ranking or hero KPI.

## US25-D52 — As a donor supporting organizations in different timezones, I want see the correct calendar periods, so that midnight does not misdate my giving.

- Source: Q23; normative contract: D12.
- **AC01:** One server instant resolves each issuer year/today using authoritative gift DATE and verified timezone.
- **AC02:** Mixed-year issuers display neutral heading plus exact row ranges; wake/rollover never relabels old cached money.

## US25-D53 — As a donor whose older gift is refunded, I want see the correct current-effective cohort, so that refund date is not confused with gift date.

- Source: Q23; normative contract: D12.
- **AC01:** A2025 gift corrected in2026 changes its effective2025 cohort; a date correction can move cohorts independently.
- **AC02:** Pending refund is not subtracted; original documents change only through their own lawful successor process.

## US25-D54 — As a donor whose annual amount is zero, I want retain useful context and older access, so that I am not incorrectly treated as a new or lapsed donor.

- Source: Q23; normative contract: D12.
- **AC01:** No current-period money, refunded zero, noncash/recognition-only and genuine no history use distinct source facts.
- **AC02:** Existing arrangements, processing ACH and documents stay reachable with no catch-up or repeat-gift pressure.

## US25-D55 — As a donor checking an annual amount, I want open matching History and then broaden it, so that the drill-through stays understandable.

- Source: Q23, Q20; normative contract: D09, D12.
- **AC01:** Target carries exact scope/measure and original amount remains separate.
- **AC02:** Later source/rights changes refresh basis honestly; broadening resets only deliberately, not via silent fallback.

## US25-D56 — As a donor with an employer match, I want see known recorded progress and actual funds, so that I do not mistake an internal record for employer approval.

- Source: Q28; normative contract: D13.
- **AC01:** Identified/submitted/received/reversed/closed use exact recorded meaning; first receipt is not full program completion.
- **AC02:** Recorded time is not filing/fetch time; no connector, expected dollars, approval badge or six-step tracker is implied.

## US25-D57 — As a donor without a visible original gift, I want find my admitted matching record, so that legitimate external matches are still understandable.

- Source: Q28; normative contract: D13.
- **AC01:** Own-employee projection and independent secondary route work with null, hidden or preplatform origin.
- **AC02:** No fake gift, payer receipt, coworker information or broad represented-organization access is created.

## US25-D58 — As a donor with a partial or reversed match, I want see truthful current received facts, so that changes do not reverse my own gift or create debt.

- Source: Q28; normative contract: D13, D14.
- **AC01:** Amounts use complete permitted actual issuer/currency partitions; partial inverse remains received and complete zero unwind is reversed.
- **AC02:** Expected currency and visible subset cannot define actual total; negative invalid fold is source repair, not donor debt.

## US25-D59 — As a donor viewing older matching history, I want keep stable access without noise, so that a note edit does not rearrange my account.

- Source: Q28; normative contract: D13.
- **AC01:** 20 canonical roots use immutable creation order with Load more and admitted closed/reversed history.
- **AC02:** No record/unknown presence has zero ordinary artifacts; enabling/reading creates no Home/bell/task/email/credit effect.

## US25-D60 — As a matching operations staff, I want record or correct actual source truth atomically, so that donor views cannot contradict settlements.

- Source: Q28; normative contract: D14.
- **AC01:** Direct INSERT/UPDATE/repoint/close races enforce positive-money state walls with true contribution/expectancy locks.
- **AC02:** Credits may lag independently; coherent settlement read remains useful and stale events cannot double-apply inverse effects.

## US25-D61 — As a matching operations staff, I want merge or reimport a genuine duplicate safely, so that prior receipt history and totals survive.

- Source: Q28; normative contract: D14.
- **AC01:** Same verified employee/program/Tenant and cycle-free atomic lineage preserve reversed/zero-effective links.
- **AC02:** Tenant/external_source/external_ref pair prevents duplicate import; historical ingest sends no new acknowledgments or credits.

## US25-D62 — As a DAF advisor, I want see received grants attributed to me, so that I can recognize support without confusing it with personal receipts.

- Source: Q29; normative contract: D15.
- **AC01:** Narrow exact DAF-advisor read is independent of household and Support overview settings.
- **AC02:** Only actual admitted received grants appear; recommendations not received in Core create no pending tracker.

## US25-D63 — As a DAF advisor unfamiliar with tax terminology, I want understand why grants are absent from my annual contribution statement, so that I do not expect another deduction.

- Source: Q29; normative contract: D15.
- **AC01:** Visible reviewed explanation precedes list amounts and repeats on direct detail; selected-period documents link contextually.
- **AC02:** No claim I already deducted, no tooltip-only meaning or compulsory acknowledgment; jurisdiction comes from qualified issuer.

## US25-D64 — As a DAF advisor with partial recognition, I want avoid mistaking attributed credit for the full grant, so that my view does not overstate support or reveal others.

- Source: Q29; normative contract: D15.
- **AC01:** Full Grant received amount requires complete independent permission.
- **AC02:** Partial-only list omits dollars; qualified detail labels attributed amount, without inferred remainder or co-advisor facts.

## US25-D65 — As a DAF advisor returning to older grants, I want read stable corrected history, so that date uncertainty does not hide records.

- Source: Q29; normative contract: D15.
- **AC01:** 20 roots follow effective gift date then stableID; undated admitted records follow dated ones without using withheld dates for sort.
- **AC02:** Date correction refreshes basis coherently; no current-year-only cutoff or duplicate skipped roots.

## US25-D66 — As an ordinary donor without rare records, I want see no DAF, QCD or matching artifacts, so that my account stays calm and relevant.

- Source: Q28, Q29; normative contract: D13, D15, D17.
- **AC01:** No known admitted records gives no link/card/badge/filter/skeleton/reserved gap.
- **AC02:** An explicitly attempted route still has truthful safe loading/error/unavailable; unknown is not stored absence.

## US25-D67 — As a finance staff receiving an IRA gift, I want record the owner, custodian and intent distinctly, so that the gift receives the correct acknowledgment.

- Source: Q29; normative contract: D16.
- **AC01:** Actual owner or proved inherited-IRA beneficiary is contributor; institution brand/check drawer/age/code is not classification.
- **AC02:** Typed unresolved/admitted-QCD/independently-admitted-other result binds exact current source facts and immutable money.

## US25-D68 — As a finance staff with incomplete QCD evidence, I want preserve money while resolving the case, so that document readiness does not drive financial truth.

- Source: Q29; normative contract: D16.
- **AC01:** Closed unresolved reasons distinguish identity/custody/intent/issuer/contradiction; only source commands admit/supersede.
- **AC02:** Partial/withdrawn intent has no calculated deductible remainder or dark-purpose ordinary fallback; legitimate evidenced source successor remains possible.

## US25-D69 — As an IRA donor, I want understand my recorded intended QCD, so that the portal does not claim to determine my tax treatment.

- Source: Q29; normative contract: D17.
- **AC01:** Detail identifies IRA gift and evidenced intention only when source-admitted, with separate-acknowledgment/no-double-benefit copy.
- **AC02:** No age/annual-limit/RMD/deduction certification, compulsory tax interview or combined DAF/QCD bucket appears.

## US25-D70 — As an IRA donor, I want obtain my separate acknowledgment, so that I have the right document even when annual totals differ.

- Source: Q29, Q08; normative contract: D17, D07.
- **AC01:** Qualified us.qcd.acknowledgment@1 and actual current artifacts appear through relevant Receipts & statements grouping.
- **AC02:** Unknown/dark case cannot get generic receipt; a real active review alone permits checking copy; historical artifact access is preserved.

## US25-D71 — As a donor with ordinary and IRA giving, I want understand different summary and document totals, so that informational giving is not mistaken for deductible giving.

- Source: Q29, Q23; normative contract: D17, D12.
- **AC01:** 500 ordinary plus1000 admitted monetary IRA can yield Home1500, ordinary annual500 and QCD acknowledgment1000.
- **AC02:** Context explains coverage; QCD-only does not get fake ordinary annual cards and DAF never enters personal money.

## US25-D72 — As a release owner, I want activate only qualified source-backed capabilities, so that a polished screen cannot certify missing authority.

- Source: Q05, Q08, Q10, Q13, Q20, Q23, Q28, Q29; normative contract: D18.
- **AC01:** Owner schema/read/command/pack/adoption gates precede corresponding consumer; required skipped/mocked/native gaps remain not qualified.
- **AC02:** N/N-1 and rollback cannot revive old generic receipts/raw export/writers, reset clocks or erase valid history.

## US25-D73 — As a donor using assistive technology, I want complete record and document tasks without confusion, so that the polished UI remains usable for me.

- Source: Q05, Q08, Q10, Q13, Q20, Q23, Q28, Q29; normative contract: D03, D06, D18.
- **AC01:** Actual mobile/keyboard/screen-reader/reflow/zoom cases preserve visible meaning, real headings, focus and44px product touch targets.
- **AC02:** Six unfamiliar Q29 participants must show zero critical tax/document misconception after revision/retest; axe alone is not completion.

## US25-D74 — As an operations owner, I want detect and repair exact source failures, so that donors are not asked to correct the system.

- Source: Q05, Q20, Q23, Q28, Q29; normative contract: D19.
- **AC01:** Each defined signal has threshold, accountable maintainer and containment/recovery response before activation.
- **AC02:** Logs omit private data; source repair never becomes donor money mutation, duplicate send or invented success.
