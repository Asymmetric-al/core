# Phase29 — Request access and exact recipient reading

The complete common safeguards in REQ29-P01–P18 apply to every reached source command, reader and recovery path. The complete source-specific prose below preserves its exact timing, cardinality, attribution, eligibility and exception rules. The compact acceptance outcomes are observable product behavior, not a replacement for the complete contract. Source/native/provider and intended-user qualification remain required; publication proves none of them.

Detailed research, repeated proof instructions, operating evidence and source-by-source coverage remain in the exact source trace. Shared authorization, database, current disclosure, durable intent, concurrency, accessibility, capacity and migration obligations are tested through the common requirements in each applicable source context, without duplicating a research instruction for every question.

## REQ29-A01 — Confirm recipients for external private document requests

**Story US29-A01:** As an intended recipient, I want to confirm access to one private document request without unnecessary enrollment, so that I can respond without exposing it to someone who only has its link.

**Decision basis:** Q01, complete incorporated source clauses and current explicit later refinements; REQ29-P01–P18. Exact paragraph, clause, proof and journey locators are mapped individually.

**Scope.** Apply this floor to external private-document collection requests. A request is one source-owned requirement and its relevant recipient/instruction revision, not an HTTP request. Preserve unrelated giving, receipts, newsletter and collaboration contracts unless expressly amended.

**Identity meaning.** Record the method and actual proof established. Label ordinary email proof **Email confirmed**, never **Identity verified**. A mailbox, native principal, person described, acting representative and business recipient are distinct. No first/last/newest matching Party inference or alias guessing.

**Shared admission.** Extend the existing Phase 4/native Auth and Phase 12 authenticated-human admission path narrowly for this exact request purpose without organization enrollment. The source grant constrains the authenticated principal and does not create a generic fifth role/context, anonymous private access, NHI impersonation or alternate JWT issuer. Existing member/public/NHI/operator semantics remain intact.

**Recipient authority.** Adopt a closed document-request-recipient authority for legitimate recipients without a Party. Bind tenant/environment, requesting source, request/revision, intended recipient/address revision and allowed purpose/actions. Use only this named producer branch; do not borrow Phase 28's newsletter-only exception or manufacture constituent records.

**Proof and reuse.** Invitation is insufficient. Fresh proof is delivered only to the fixed current source-approved address after deliberate eligible action. Reuse existing proof only under an explicit qualified request-purpose rule proving principal, exact address/revision, method, age, request binding and current source policy. Contact/provider email equality alone grants nothing. Stronger source assurance cannot be downgraded to email.

**Doorway and session.** Reuse ADR-0025/0037 selector-plus-fragment transport and deliberate protected POST. GET/HEAD, passive scanner visits and prefetch create no authorized session or send. The doorway is scanner-resistant, not scanner-proof: an advanced scanner can submit forms, and an exchange never proves a human actor. Initial landing state is non-authorizing. Preserve the exact frozen qualified Tenant Donor Portal Host and existing private headers; use only an explicitly qualified same-tenant continuation to the existing participant surface. No credential-bearing redirect or cross-host Domain cookie.

**Action separation.** Authorize instructions, initiate transfer, finalize, see status, preview, original download, replace and review separately. Upload permission supplies no directory, previous-submission, other-recipient, CRM, count/search or broader file read. A clean scan or confirmed recipient cannot accept evidence, complete a business requirement or sign anything.

**Recipient correction.** The source alone changes intended recipient or materially changes request instructions through a versioned successor. Fence obsolete proofs/grants and pending promotion, preserve attribution and accepted evidence. Do not transfer previous-submission access to a replacement recipient by default. Same address after a change is not the same revision.

**Recovery and representation.** Offer wrong-account switch, governed resend and source-owned correction/recovery. A user cannot type a replacement destination into the verification screen. Staff cannot set a verified flag or request the recipient's secret. Authorized helpers/representatives require existing source authority and separate actor attribution; Q01 neither universally permits nor bans shared mailboxes. A source without a qualified recipient/assurance policy cannot activate that purpose.

**Persistence and authorization.** Derive actor, tenant, source and admission from trusted server context and current authoritative records. Use opaque identities, non-null required scope, same-tenant/source foreign-key relationships, unique logical operations, and immutable recipient/request/byte references where issued. Prevent changing authority-bearing columns through general updates. RLS/grants/command validation must agree on old and new row states and actual execution roles; privileged workers re-prove their narrowly delegated source authority.

**Retry and races.** Consume the exact request-bound proof application/redemption and create/recover its one admitted result through an atomic authoritative command or equivalently proved recoverable owner protocol. Separately qualified reuse of parent native proof still requires a new independently authorized request binding. Scope idempotency to the intended effect and semantic fingerprint; same key/different intent conflicts. Co-commit local facts and required outbox work. Handle provider success/response loss as unknown until reconciled; never manufacture a fresh-key resend to hide uncertainty. Link/code siblings cannot both independently redeem.

**Currentness and clocks.** Recheck current actor/service identity and operation-appropriate source authority at every protected operation. Participant actions and reads additionally require their current exact recipient/request admission; independently admitted worker processing re-proves its own source/worker authorization and withdrawal fences, not the former browser session. Apply these checks to finalization, promotion, full/range/conditional reads and recovered results as appropriate. Keep request due date, invitation expiry, proof expiry, session expiry, upload-grant expiry and byte retention distinct. Use server time and exact qualified profiles; neither reads nor resend renew the business deadline. Define the atomic admission point for revocation races.

**Private custody.** Transfer only into server-reserved private staging through a finite purpose-bound grant. Verify exact object identity, type/size/integrity and current authority independently of browser/provider success. No overwrite, public URL or old bucket fallback. Transfers not durably received before their admission ends stay unavailable and follow owner cleanup/hold policy; late scan success cannot revive revoked source authority. Durably received intake can continue independently authorized source processing after browser-session expiry, without granting new participant access.

**Communication.** P4/request producer owns proof and occurrence; P17 prepares exact meaning-specific content; P6 alone dispatches and records outcomes. Qualify initial invitation, user-requested confirmation, resend, correction and any required security notice separately. Preserve consent/contact/provider restrictions; do not treat marketing unsubscribe, do-not-contact, hard bounce and complaint as one Boolean. No direct provider/SMTP or alternate-channel bypass when delivery is blocked.

**Abuse and privacy.** Bound guesses, sends, outstanding reservations, bytes and processing with shared qualified controls at request/recipient/tenant and suitable network/global scopes. Resend cannot reset attempt budgets. Avoid attacker-triggered permanent account/request lockout. Pre-confirmation errors and metadata remain non-enumerating; secrets/private filenames/addresses/bodies stay out of ordinary URLs, logs, analytics, queues, search and replay. Rate-limiter outage cannot silently remove protections.

**Usability.** One logical code input with full paste, autofill and leading-zero support; shared safe-link alternative where qualified. No forced password creation or profile completion merely to respond, default CAPTCHA puzzle, unnecessary repeated confirmation or staff File Manager shell. Preserve source-required stronger authentication or step-up. Preserve exact authorized return and accepted results across delay/retry. Use clear pending/received/processing/review labels, keyboard/screen-reader/mobile and low-bandwidth recovery, safe localization and non-lossy address handling.

**Audit and lifecycle.** Keep request creation, proof delivery, confirmation, admission, transfer, processing, review and business acceptance as separate evidence. Distinguish provider accepted from delivered, granted from bytes served, and served from human reading. Record opaque correlation, actual actor/proof provenance, source/recipient revisions, result and correction lineage under appropriate restricted retention; auth secrets are not file records. Restore applies revocation/disposal history before serving anything.

**Qualification and rollout.** Expand schema/readers first, fence incompatible writers, then qualify exact purpose/host/provider and enable a bounded cohort. Unknown versions fail closed. Imported or historical verified flags/links grant no new authority. Rollback may disable new admission while preserving evidence and denial fences; it must not return new recipients to old donor/signup/public-storage behavior. No whole Phase 34/41 dependency and no activation from mocked tests or configuration alone.

- **AC29-A01-01:** An intended recipient who has no donor, missionary, staff, organization membership or Party completes the exact qualified request-confirmation route without acquiring any of those affiliations.
- **AC29-A01-02:** Possession of an invitation, a forwarded/scanned link, an equal email string, an email-verified flag or unrelated sign-in exposes no protected request and admits no document action.
- **AC29-A01-03:** Current confirmation proof is reused only for its qualified principal, mailbox revision, request, purpose and freshness; any mismatch or stronger source requirement produces the actual qualified confirmation/assurance route.
- **AC29-A01-04:** An initial GET, HEAD, prefetch or scanner visit neither discloses protected metadata nor grants authority. Deliberate entry and proof preserve the frozen qualified mailbox/host and cannot be redirected by caller input.
- **AC29-A01-05:** Expiry, revocation or supersession prevents newly affected participant operations, including late finalization and result disclosure, while independently authorized admitted processing/review/retention can continue without renewing participant access.
- **AC29-A01-06:** Shared-mailbox and representation cases retain truthful limited mailbox-control evidence; the result never claims legal identity, exclusive human identity, signing authority, authenticity or business acceptance.

## REQ29-A02 — Files for Asym work and exact submitted-file readback

**Story US29-A02:** As a person supplying requested material, I want to see truthful receipt and safely read my exact received file, so that I can check what was supplied without unrelated access.

**Decision basis:** Q02, complete incorporated source clauses and current explicit later refinements; REQ29-P01–P18. Exact paragraph, clause, proof and journey locators are mapped individually.

**Purpose boundary.** Accept durable files only through an authorized Asym source operation or a narrow admitted resource/media purpose. Existing meaningful drafts, reusable assets, staging and retained obligations qualify before/after active placement. Do not offer arbitrary drive storage, sync or generic anyone-link authority.

**Context-first intake.** Derive tenant, source owner, purpose and profile from trusted server context; let ordinary task entry supply them. Where needed, choose among permitted source contexts before transfer. A folder, file extension, user-supplied owner/purpose string or AI classification is not admission. Unknown source/profile fails closed without fabricating a business record.

**Source and byte separation.** Preserve logical source document/occurrence, exact byte version, rendition generation, provider copy and individual typed use as different identities. One byte identity may serve multiple independently admitted same-scope uses; digest equality does not merge rights, provenance, permissions, currentness or retention. No universal file-current pointer or one semantic owner for all domains.

**Submission confirmation.** Confirm the exact durably received submission/version and only its currently permitted metadata. This is not a financial receipt or evidence acceptance. Selected locally, transferring, received, preparing/available preview and source review are different facts. Missing/failed preview never changes a received submission into not received or accepted.

**Own-submission read.** Add an explicit source-approved read of the exact admitted actor/recipient/request/submission occurrence/version. It is not a global search by uploader/email/Party/filename/hash. Reassignment, helpers and shared mailboxes follow Q01 and source authority; a replacement recipient inherits no old bytes automatically.

**Current access.** Reauthorize metadata, status, thumbnail, pages/tiles/grids, full/range/HEAD/conditional responses, retry/result recovery and alternative representations. Q01 confirmation alone is insufficient. Deny before serialization; no stale positive cache, browser return or alternate endpoint may bypass current source restrictions.

**Deliberate bounded viewer.** Keep readback in the same small request experience with exact version label, status, useful navigation and return context. Opening a list/request or receiving a filename does not eagerly convert/download every file. Reuse shared qualified controls and reading mechanics; no new office editor, global search/OCR/AI corpus or personal drive is implied.

**Exact rendition and honest coverage.** Bind a result to immutable input identity/digest, source restriction generation, profile/build/options and output digests/coverage. A new upload or profile creates distinct lineage. Do not mutate the original, declare completeness from exit0, silently replace a received version with latest, or describe partial conversion as the whole original.

**Hostile content isolation.** Validate actual allowed content and enforce inherited bounded profiles. Parser/converter has no ambient credentials, unapproved network or host-file access. Bound real streamed expansion, images, descendants, memory/CPU/scratch/time. Scripts/macros/formulas/external relationships remain inert. Browser isolation complements processor isolation; scanning alone is insufficient.

**Formats and truthful failure.** Reuse the accepted D32 reading profile and exact ceilings where consumed; independently qualify the new request audience and each promised format lane. Preserve PDF/Office/text/image coverage limits. No extension-based trust, raw active document embed, automatic original download, public URL or third-party viewer fallback. Accepted-for-custody and previewable are different.

**Accessible content and controls.** Preserve available native text, reading order, structure and exact values in qualified views. Test keyboard/AT/mobile/zoom/RTL plus content, not only dialog labels. Filename alt text is not a document equivalent; rasterized text is not sufficient. An inaccessible source needs honest limitation and a source-authorized accessible equivalent/assistance path; do not silently add OCR/AI, change originals or expand download access.

**Permission and purpose transitions.** Original download, replacement/deletion, previous versions, post-closure access, staff-added documents, other recipients and public/external delivery require their own source decisions. Q02 does not automatically grant them or remove already-qualified source rights. Reuse/link/publication uses exact source commands and cannot make a private item public or certify an expense/receipt/application.

**Atomic generation and recovery.** Keep the stable exact source/version/profile/projection/restriction input reuse key distinct from separately identified technical generations. Coalesce at most one current eligible live generation within that scope. Same operation/different intent conflicts; expiry may permit a new deliberate eligible generation without changing old command results/deadlines. Repeated opens cannot bypass an exhausted attempt budget. Current source/worker authority controls attempts/promotion; session closure does not cancel independently authorized work. Old workers cannot promote under a successor claim.

**Cleanup versus promotion.** Register tentative output before I/O. Conditional Ready promotion and deletion claim have one winner; deletion-claimed bytes cannot promote and stale tentative cleanup cannot delete promoted output. Immutable keys are never reused. Expiry, cancel, partial writes and lost provider responses reconcile exact copies with truthful failure/retry. No age-only purge of source originals.

**Data and SQL boundary.** Enforce required scope, same-tenant/source relationships, exact identity/version references, valid digests/nonnegative bounded sizes, semantic uniqueness and restricted state transitions. Caller cannot set actor, owner, classification, source, Ready, accepted or audit truth. Evaluate effective grants/RLS, old/new row predicates, functions/views and privileged worker paths; same-tenant UPDATE cannot reparent into a different authorized purpose.

**Organization and disposal.** Keep promised folders/tags/search/views/bulk management, consuming the source-specific contracts. Organization grants no access, retention or publication. Respect Phase23's separate Media folders and no-auto-purge floor. Visible or empty Used in is not complete use proof; holds, recovery, required disposition and concurrent new references are resolved by exact owners before physical deletion.

**Privacy and evidence.** Exclude raw private filenames, document text/cell values, addresses, source/provider URLs and tokens from ordinary logs, analytics, diagnostics and preview-executor payloads; use approved opaque references, states and bounded measurements. Required restricted source audit/provenance has its own exact access/retention rules and cannot preserve source-forbidden data. No private file upload to vendor issue/scanning services without authorization. Preview access evidence records actual actor/purpose/version/technical outcome under its owner, not human understanding or a new CRM/P6 interaction. Auth, original, rendition and audit retention remain separate.

**Migration and exit.** Inventory actual retained objects and references before migration. Preserve opaque identities and every independent use; admit legacy data only after owner/integrity/privacy/processing qualification. Unknown owner restricts and reconciles, not automatically deletes. Fence old public/mutable writers and mixed-version readers. Backup/restore/exit covers bytes plus metadata/references and applies adverse history before serving restored content.

**Operations and rollout.** Enforce finite source and shared-preview work budgets, fair tenant scheduling and bounded retries. Disable only affected unqualified profile/reader while preserving received evidence and safe submission/status where still qualified. Assign operational owners and exact signals before activation; no silent engine, public-storage or generic-download fallback.

**Definition of done.** Prove actual source admission, real-role SQL/permission boundaries, parser isolation/fidelity, every declared format, private delivery, races, migration/restore and accessible participant journeys. Preserve exact inherited obligations; configuration, filename chips, template previews, mocked tests and library dependencies are insufficient. No full future product becomes a prerequisite for its narrow shared file seam.

**Exact inherited profiles.** These values apply only to the named source/representation and units, never as generic intake limits:

- Original input; 20 MiB actual streamed bytes.
- Expansion/structure; 200 MiB cumulative actual expansion, 10,000 entries, XML depth 128, no DTD/entities/traversal/ambiguous package members.
- Pages/images; 200 output pages/visible slides; 40,000,000 pixels per image; 256 MiB aggregate decoded-image working data.
- Output; 50 MiB cumulative rendition content.
- Attempt; 60 elapsed seconds, 30 aggregate process-tree CPU seconds, 2 GiB memory, 512 MiB scratch.
- Healthy-load fixture; 100 simultaneous opens across 20 tenants: 80 repeated across 5 same-source files and 20 distinct cold files each ≤ 2 MiB and ≤ 10 pages or 1,000 cells. p95 server admission ≤ 1 s, cold Ready ≤ 60 s, warm first API content ≤ 2 s with declared worker capacity.
- Mobile fixture; 400 kbps, 300 ms round trip, 320 CSS-pixel viewport, plus maximum/overload/skew tests. Browser/render time is measured separately.

- **AC29-A02-01:** An admitted upload has an actual source owner and purpose, including eligible draft, resource, generation, import, hold or recovery work; no fake live placement or ceremonial business record is required solely to admit lawful bytes.
- **AC29-A02-02:** After durable source receipt, the intended participant sees the exact received submission and current technical/source status; upload, preview readiness and staff acceptance remain distinguishable.
- **AC29-A02-03:** View my submitted file resolves only the permitted received occurrence/version and qualified rendition. A same-email account, another source use or the file digest cannot grant the reader more scope.
- **AC29-A02-04:** Unsupported, unsafe, encrypted, oversized, incomplete or unavailable preview has an honest source-safe result and capable alternative only where separately permitted; it never opens a public URL or external viewer.
- **AC29-A02-05:** The representation identifies meaningful coverage/fidelity limits and preserves the required native text, semantics and exact values; a source-required inspection cannot succeed using an insufficient rendition.
- **AC29-A02-06:** Two independent uses of equal bytes keep different rights, currentness, provenance and retention. Contextual entry selects only actual admitted destinations and never creates an ownerless general drive.

## REQ29-A03 — Recipient corrections with exact review lineage

**Story US29-A03:** As an intended recipient, I want to correct the exact pending submission while preserving its history, so that staff review the right evidence without losing the earlier receipt.

**Decision basis:** Q03, complete incorporated source clauses and current explicit later refinements; REQ29-P01–P18. Exact paragraph, clause, proof and journey locators are mapped individually.

**Scope and eligibility.** Enable recipient-initiated correction only for the ordinary native request's exact unaccepted, currently eligible item. Respect source freeze, waiver, closure, deadline, recipient and permission state. Request-open or preview access alone is insufficient; a read does not create a lock.

**Exact target and cardinality.** Bind correction to the exact prior submission occurrence and current source review context. Replace only the targeted admitted use in the relevant review set. Preserve other supporting members and every independent use of the bytes; filenames/digests cannot choose intent.

**Atomic admission boundary.** After immutable byte finalization and current authority checks, commit correction receipt, successor relationship, review-set change and required durable history/effect intent coherently. From that commit, the predecessor cannot be accepted as the current candidate, even while new checks are pending. Local selection or transfer start does not change current review selection or acceptance. Authorized intake reservations, quota accounting and safe audit may occur without admitting the correction.

**Current authority and attribution.** Derive tenant, actor, recipient binding, source purpose and trusted audit attribution from server context; validate permitted selectors. Recheck relevant source revisions and current permission at authoritative admission and result disclosure. Workers use explicit source/service authority and cannot fabricate a human submission.

**Exact review and concurrency.** Acceptance pins exact reviewed occurrences and every relevant source/evidence-set revision. Serialize correction, acceptance and adverse source changes through a shared authoritative boundary; stale operations cannot apply to successor bytes. Use no broader locking scope than the invariant requires.

**New input, new qualification.** Every corrected input receives its own immutable identity, actual byte/length verification and required intake/processing qualification. No safety/preview verdict is inherited from a prior file. Provider response, extension, local preview and transfer completion cannot certify receipt, safety or acceptance.

**Durable idempotency and recovery.** Bind the semantic operation key to tenant, admitted principal, exact target/revisions and canonical intent including byte identity. Same intent returns its durable outcome under current disclosure rights; changed intent conflicts. Lost responses do not create fresh versions, tasks or messages. Expiry of a transport idempotency key cannot allow the same admitted correction effect to be applied twice; its durable intent/result relationship remains authoritative without using content equality as global submission identity.

**No silent fallback or destructive undo.** A received correction failing checks retains truthful history and blocks unqualified acceptance; it does not automatically reactivate the corrected predecessor. Reopening, deliberate source correction, disposal and cancellation remain separate owner commands. No undo-by-delete or source-wide rollback is implied.

**Minimal contextual recipient flow.** Offer the correction action at the exact item, current source instructions, accessible file choice, inline target/selection review and one deliberate send. No mandatory reason, repeated identity entry, extra confirmation modal or new drive/account is added unless the source's established contract requires it.

**Truthful state and cancellation.** Separate selected, transferring, unknown outcome, admitted receipt, checks, preview and business acceptance. Show measured progress or explicit indeterminate work. Confirm result persistently. Stop/close cannot promise rollback of a committed correction; reconcile ambiguous completion before retry.

**Reviewer continuity.** Keep displayed version and notes anchored. Announce a new correction without silently changing contents or stealing focus; direct staff to current evidence before a fresh decision. Counters distinguish files/submissions from required items and satisfied requirements. No receipt or preview event itself satisfies the item.

**Accessibility and localization.** Use shared Base UI/base-maia controls, semantic tokens, native selection alternatives, labels/errors/status relationships, stable focus, touch targets, mobile/zoom/RTL support and reduced motion. Preserve qualified document-content accessibility. Display clear time-zone/deadline context without changing authoritative server time.

**Privacy and disclosure.** Enforce current rights on all metadata, counts, history, processing status, preview and result recovery. Exclude private filenames/text/addresses/provider URLs/tokens from ordinary logs, analytics and executor payloads; use approved opaque references. Retained history, duplicate detection and new corrections cannot widen audience or create a searchable private corpus.

**Database and mutation safety.** Require immutable same-scope occurrence/version relationships, non-null required scope, validated byte/digest fields, unique semantic effects and constrained transitions. Prevent caller-controlled authority/acceptance fields and same-tenant reparenting. Verify effective grants, RLS old/new row checks, views/functions/storage and privileged command/worker paths; service-role mocks are insufficient.

**Processing and storage isolation.** Preserve admitted type/size/work limits, immutable keys, private byte access, isolated parsers, bounded expansion and safe renditions. Registration/promotion/cleanup claims must not race into deleting referenced bytes or promoting deletion-claimed objects. No cropping/reencoding originals, public uploader or external-viewer fallback.

**Owner and retention preservation.** Source domains retain acceptance, financial/legal meaning, publication, retention, holds and disposal. Q03 changes no issued document, claim confirmation, signature, accepted application or public release. Earlier bytes remain under source policy; replacement is not erasure or permission to browse all history.

**Coherent secondary effects.** Record required source history and durable secondary-effect intent with the authoritative correction. Existing workers/owners update projections and any separately authorized communications idempotently. Do not add unconditional mail, duplicate tasks, generic CRM interactions or a new workflow engine.

**Bounded operation.** Use finite source admission/reservation/byte/work budgets, fair tenant scheduling, bounded recovery and paginated authorized history. Preview limits remain preview limits; they do not become arbitrary file-intake limits or a maximum number of human corrections. Repeated opens cannot bypass processing budgets.

**Migration and safe rollout.** Activate only an exact source/audience/profile cohort whose writers, readers, review commands and recovery paths enforce the new revision boundary. Reconcile legacy immutable identities and permissions; do not infer lineage from name/time/hash. Disable affected initiation/acceptance paths safely without restoring superseded candidates or public fallback.

**Proof and operation.** Require the stated positive, negative, real-role, concurrency, failure, migration/restore and accessible-user proof before activation. Assign operators/signals/thresholds/responses. Preserve ratification/publication/implementation/qualification distinctions; passing existing seams or a polished screen does not complete Q03.

Q56 assembly correction admits the complete qualified input/recipe/output unit; raw page staging cannot fence a predecessor. Q60 changes current acceptance applicability through its separate source act while preserving historical acceptance; current unaccepted eligibility does not mean never historically accepted.

- **AC29-A03-01:** Only the exact current eligible unaccepted submission/item can be corrected; request-open or preview access alone cannot override freeze, closure, deadline, recipient or source restrictions.
- **AC29-A03-02:** Local selection and transfer leave the current review set unchanged. Qualified authoritative correction admission records the immutable successor and immediately fences its predecessor from current acceptance, preserving other supporting files.
- **AC29-A03-03:** Correction-first rejects stale predecessor acceptance; acceptance-first rejects an ineligible correction. A stale command never retargets the new version or silently widens its evidence set.
- **AC29-A03-04:** A received successor that fails checks stays truthfully received/blocked and never automatically restores the predecessor. A checker outage recovers the same attempt where possible without needless reupload.
- **AC29-A03-05:** A repeated correction intent returns the original source outcome without another version or effect; a genuine later correction has its own qualified lineage and cannot be merged solely by equal names or bytes.
- **AC29-A03-06:** The recipient has one contextual Send corrected file action with exact target/selection and persistent progress/result. Staff reading an older version receive an in-context change warning without silent content replacement or focus theft.
- **AC29-A03-07:** A Q56 assembly correction admits only the complete qualified unit; raw page staging cannot fence the predecessor. Q60 current applicability changes preserve the earlier acceptance history.

## REQ29-A04 — Submitted-original download under current source authority

**Story US29-A04:** As an intended recipient, I want to deliberately download my permitted exact Submitted Original, so that I can retain the received file without confusing a preview with the original.

**Decision basis:** Q04, complete incorporated source clauses and current explicit later refinements; REQ29-P01–P18. Exact paragraph, clause, proof and journey locators are mapped individually.

**Narrow ordinary capability.** Add a distinct current source-authorized Download submitted file action for the exact own-submission occurrence/member in the ordinary native profile. Upload, preview, correction, mailbox equality or retained custody does not imply it. Ordinary eligible delivery does not require per-file staff unlocking.

**Original identity.** Return the immutable bytes received for the explicitly selected submission version. Original is not first attempt, newest filename, summary, preview, redaction, repaired file or official document. Establish the trusted binding among source occurrence, byte identity, verified length/digest and qualified immutable provider copy before emission; never silently substitute. An end-of-stream hash alone is not preventive identity proof.

**Whole-original disclosure.** Require current permission for the entire unchanged original, including content/metadata omitted by preview and applicable parent/classification/purpose/residency restrictions. If not allowed, deny this action; any permitted processed/accessible alternative is distinct and truthfully labelled.

**Independent delivery qualification.** Qualify actual allowed original file families/features, integrity, hygiene/disposition and delivery mode. Preview success or business acceptance alone is insufficient; preview failure alone neither grants nor forbids an independently qualified download. No unsafe/unverified original bypass for its uploader.

**Deliberate contextual UX.** Provide the visible exact-file action alongside View, reachable by keyboard/touch without viewer or drive entry. One deliberate ordinary activation suffices; no routine extra reason/confirmation/account. No automatic download from page entry, hover, prefetch, preview failure, sign-in return or a retry loop.

**Honest feedback and recovery.** Report only observed preparation/handoff/transfer/error facts. Do not claim Saved, Downloaded successfully, Read or Accepted from a click or server response. Preserve task context and distinguish pending checks, unsafe, unavailable, lost access, changed version and custody failure with safe recovery.

**Safe private response.** Use the qualified Asym-controlled delivery boundary with appropriate attachment/media/no-sniff/private-cache behavior, safe source-approved filename suggestions and no privileged-origin active rendering. Private no-store applies to applicable success/error/redirect/304/416 paths. Errors and login redirects cannot masquerade as file bodies. Never expose raw reusable provider grants or public fallback URLs.

**Current authority and stream fences.** Reauthorize metadata and every new full/HEAD/range/conditional/recovery request through current source/PDP rules. Enforce inherited per-chunk expiry on long streams. Restriction blocks new grants and terminates in-flight delivery where feasible; no generic realtime grace or recall claim.

**Exact range and copy integrity.** Bind each admitted delivery to one immutable representation; validate supported range/conditional outcomes and enforce limits. A partial range requires trusted whole-object/version or qualified chunk-integrity binding. Reconnect cannot splice versions or revive earlier permission. A separately verified identical storage copy may serve the same identity; missing/corrupt copies require repair, not fabricated reconstruction.

**Data and privileged-path safety.** Derive trusted actor/tenant/purpose from server context. Protect required same-scope source/version/copy references, authority fields and integrity/disposition transitions. Verify effective grants/RLS/views/functions/storage and privileged gateway behavior. A read handler cannot accept caller-supplied owner/clearance or mutate acceptance/currentness.

**Existing metering and access evidence.** Apply P12's current tier audit/budget/residency contract, including its required before-serve and durable outbox behavior. Logger construction or an awaited helper that suppresses failures is not durability proof. Access evidence records actual technical outcomes, not saving/reading/consent. Repeated real reads remain accountable; no new CRM interaction or P6 message is created.

**Cache and telemetry privacy.** Protect private bytes and metadata across route/CDN/browser/service-worker/conditional paths. Do not persist an offline private file cache or expose source/provider URLs, tokens, raw private filenames/content/addresses through ordinary telemetry. No-store is not a claim that an intentional saved copy disappears.

**Accessible truthful controls.** Use Core Base UI/base-maia, shared semantic tokens and native semantics; label actions with exact permitted context and useful type/size. Prove keyboard/speech/AT/touch/zoom/reflow/RTL behavior. Preserve document-content accessibility distinctions and safe alternatives; download does not magically make a document accessible.

**Bounded transfer.** Prefer the simplest qualified browser-managed download and bounded server streaming/backpressure. Do not buffer the entire original in page-owned memory merely for progress or a success toast. Any alternative has declared finite source limits, response validation, cancellation/resource cleanup and supported-device proof.

**Read retries and currentness.** A repeated download is a new accountable read attempt, not another submission or a globally one-use permission. Reauthorize retries/resume; suppress accidental repeated initiation only while appropriate. Correction before read admission rejects a stale ordinary target; an active stream stays version-bound and obeys C08 without creating historical rights.

**Source semantics and retention.** Delivery changes no requirement satisfaction, review/claim/application/signature/publication outcome, retention/hold/disposal authority or request/session deadline. Preserve other source uses and existing specialized downloads. No previous-version archive, post-closure duration, other-person files, bulk export, sharing or general drive is granted.

**Read versus disposal.** Admit no new read from restricted/deletion-claimed/ineligible custody. Coordinate bounded read/copy lifecycle with cleanup so referenced valid bytes are not destroyed mid-operation and no read pins custody indefinitely or overrides source disposition. Restoration applies adverse history before delivery.

**Cohort rollout and legacy containment.** Integrate the narrow action in the native owner and Q01-compatible identity/PDP source package. Qualify every reader, URL, header, cache and alternate path before activation. Unknown legacy copies/lineage are restricted/reconciled, not inferred from names or deleted. A new gateway alone does not contain old public/presigned paths.

**Operational ownership.** Supply finite source byte/time/concurrency/range/budget limits and named operational responsibility before activation. Diagnose access, safety, provider, client and integrity failures separately. Disable affected delivery safely without weakening preview/correction boundaries, changing evidence or falling back publicly.

**Proof and completion.** Prove exact original identity, full-content authorization, real-role/private serving, races, range/cache/header behavior, actual browser/AT/recovery and source-cohort migration/restore. Qualify all declared original-delivery profiles; a button or generic Unavailable placeholder is not completion of A.

- **AC29-A04-01:** Download submitted file returns the unchanged exact Submitted Original only when whole-original disclosure is independently permitted; preview approval or staff acceptance alone is insufficient.
- **AC29-A04-02:** Every full/range/conditional/new recovery read rechecks current source authority and the exact immutable copy; expiry and revocation obey the source streaming boundary without a public or reusable unqualified URL fallback.
- **AC29-A04-03:** Browser-managed attachment delivery uses safe source-qualified naming and type handling without renaming source bytes or confusing an assembled output with its protected input originals.
- **AC29-A04-04:** An interrupted transfer remains a truthful partial/unknown local outcome; neither click nor completed server stream is reported as browser saving, human reading or business acceptance.
- **AC29-A04-05:** Download does not extend access/retention, grant other-person or historical bytes, or create sharing/export authority. Separately qualified source uses retain their own routes.
- **AC29-A04-06:** An authorized user completes or safely retries the download using keyboard/mobile/assistive technology without a routine reason form, forced preview or extra confirmation.

## REQ29-A05 — Current files and a concise participant submission history

**Story US29-A05:** As an intended recipient, I want to see current submissions and concise permitted history, so that I understand what changed and what action remains.

**Decision basis:** Q05, complete incorporated source clauses and current explicit later refinements; REQ29-P01–P18. Exact paragraph, clause, proof and journey locators are mapped individually.

**Ordinary scope.** Show currently authorized current members plus a concise participant Submission history for the exact request item. Superseded content gets no ordinary history read grant. Preserve independent current members and specialist/staff history rights.

**Exact lineage and currentness.** Derive earlier/current relationships from the source's admitted correction lineage, never filename, digest, timestamps or a universal latest pointer. Preserve Q03's predecessor fence and no silent revival; viewing history cannot mutate candidacy.

**Source truth and attribution.** Derive history from durable admitted source facts and trusted actor/context, preserving the meaning of the admitted request/item revision. A later label/instruction change cannot reinterpret the earlier act. No client-created receipt, raw audit feed or separate write authority. Distinguish source business history, participant projection, technical trace and security access evidence.

**Durable effect and causal order.** Preserve Q03's atomic source admission/state/history invariant. Projection retry/replay yields one visible fact per admitted source effect. Deterministic causal identity/order survives tied times, delayed events and replay; do not fabricate chronology from arrival order.

**Minimal participant metadata.** Release only current source-approved event wording, dates, actor/context and file descriptors. Filenames, counts, IDs, reasons and event existence are protected. Do not expose staff assessments, hidden requirements, audit payloads, old thumbnails, extracted text or provider references.

**Authorization before results.** Resolve trusted principal/tenant/request/item/purpose authority and filter safely before returned ordering, counts, facets, continuation and serialization. Do not union staff/audit privileges into the participant purpose. A mailbox match, uploader identity, current request membership or a browser-side filter cannot grant all historical metadata.

**Enforce A beyond the screen.** Deny ordinary recipient access to superseded content through APIs, preview/thumbnail/OCR/search/export paths, original/HEAD/range/conditional routes and stale URLs. Do not serialize old content references and merely hide controls. Preserve independently authorized source paths.

**Coherent current work.** Current files, status, actions and correction relationships reflect compatible relevant source state or explicit refreshing/unknown state. History never drives currentness. Revalidate privileged reads/mutations; preserve independent members, focus and the exact result of a committed correction.

**Honest failure and coverage.** Distinguish successful permitted empty history from unavailable, unauthorized, refreshing and known incomplete coverage. History failure cannot become No submissions, erase receipt, trigger re-upload or disable independently valid current work. Unknown current authority still fails closed.

**Data and privileged-path integrity.** Enforce required same-scope references, immutable admitted facts, trusted actor/time fields, valid lineage and semantic effect uniqueness. Prove actual grants/RLS/new-row checks/views/functions/RPC/storage/privileged paths; no client write or reassignment can turn a permitted row into forbidden history.

**Truthful time and actor.** Separate authoritative received/correction time from processing/display/import times; retain causal identity under ties. Localize readable dates/timezones without inferring location. Attribute You or a named actor only when current source projection and trusted evidence permit it.

**Small current-first UI.** Keep current status, confirmation, errors and next actions visible. Present short history as a readable list; use one clear secondary disclosure or bounded continuation only when useful. No full file explorer, mandatory extra modal, nested timeline system or disabled old-file button wall.

**Accessibility and field usability.** Reuse Core Base UI/base-maia, semantic lists/headings and existing tokens. Prove keyboard/speech/AT/touch/zoom/reflow/RTL/long-name behavior and focus stability. Announce material changes without repeatedly reading the whole history; keep low-bandwidth current work usable.

**Read lifecycle and side effects.** Reauthorize history reads/retries/continuations and clear unauthorized stale state through inherited contracts. Reading creates no new submission, acceptance, reminder, message, task, read receipt, session extension or historical-byte grant. Existing required access audit/metering still applies.

**Owned help without implicit B.** Before activation provide a working source-approved responder/route for earlier-submission questions. Clarification and any exceptional disclosure use independent current authority; no automatic old-file delivery, restore, new unlock toggle or guaranteed release. Give a truthful outcome when disclosure is not authorized.

**Retention and specialized ownership.** Participant omission neither deletes source history nor extends its retention. Preserve holds, lawful owner disposition, privacy suppression and official/source-specific historical rights. Restores apply current adverse history before serving. No access-duration or permanent archive promise.

**Finite retrieval and capacity.** Use bounded permission-safe queries/continuation and appropriate source-scope/order indexes. Declare and test finite page, response, query and concurrency budgets before activation. No all-history drain, unbounded client filtering, hidden-total leakage or needless binary/preview work.

**Cache, telemetry and audit.** Scope caches/late responses to current principal and source context; qualify switch/logout/revocation/restore paths. Private history must not enter public caches, offline stores or general logs; URLs may contain only approved opaque references, not sensitive descriptors or reusable authority. Apply inherited access-evidence rules without exposing the audit feed or fabricating business events.

**Migration and containment.** Reconcile source identities, coverage and old readers before cohort activation. Unknown legacy lineage stays explicit, not guessed from name/time/hash. Test mixed versions, alternate routes, safe disable/roll-forward and restore; rollback cannot re-enable old-byte access or erase required history.

**Proof and completion.** Qualify real-role metadata/content denial, source admission/races/replay, failure/coverage, actual browser/AT/mobile and owned help outcomes for every declared cohort. A decorative list, mocked suite or permanent unavailable placeholder is not completion. Trace this decision through later authorized owner/OpenSpec work.

This history projection grants no general archive, export or restore power. Q44, Q47 and Q56 retain their independently admitted later capabilities; an exclusion in the original history decision is not a global prohibition on them.

- **AC29-A05-01:** Current supporting files remain independent; only the exact corrected predecessor becomes superseded, and it is not silently restored when a successor fails.
- **AC29-A05-02:** The participant sees concise permitted source history with truthful receipt/correction state, without internal audit, another recipient or a prior-version byte archive.
- **AC29-A05-03:** Superseded-content restrictions hold for original, preview, thumbnail, extraction, search and export; hiding a current-list button is not the only enforcement.
- **AC29-A05-04:** A failed history/status read is shown as unavailable or unknown rather than no submission, and independently known receipt/success remains visible where permitted.
- **AC29-A05-05:** Historical help produces an actual source-authorized explanation or next action without an automatic old-file release, restored grant, new account or retention extension.
- **AC29-A05-06:** Long histories use current-authorized bounded navigation and preserve relevant focus/state without leaking denied existence through ordering or counts.

## REQ29-A06 — Bounded read-only access after normal request fulfillment

**Story US29-A06:** As an intended recipient, I want to return to the completed request while read access remains valid, so that I can understand its outcome without reopening collection.

**Decision basis:** Q06, complete incorporated source clauses and current explicit later refinements; REQ29-P01–P18. Exact paragraph, clause, proof and journey locators are mapped individually.

**Exact normal scope.** Apply the completed read-only mode only to normal source-confirmed fulfillment of the ordinary native request. Upload/scan/task/worker success, deadline, cancellation, rejection, withdrawal or security revocation cannot stand in for that outcome.

**Source completion and races.** Bind fulfillment to exact source evidence, relevant revision/member set and trusted attribution. Serialize completion versus ordinary admission at that source boundary; preserve Q03's early correction fence. Commit required source outcome/fence/history/effect intent durably and replay the same effect without renewed access. Source work may complete/reconcile under its own current authority after recipient access ends, without renewing that grant or exposing results through expired access.

**Historical completion and remediation.** Preserve the historical source outcome separately from later safety/eligibility change. Follow explicit owner-linked remediation/correction; never auto-reopen predecessor work or silently include new evidence/recipients under old authority.

**Business read-only boundary.** Reject ordinary new submission/correction and ungranted business mutations through every entry path. Permit only narrowly qualified read-support/help operations under current authority, including necessary technical preparation/audit; no blanket GET-only rule or supporting-operation bypass.

**Finite source access contract.** Before activating completed reads, require a resolved finite source policy/effective end and truthful presentation. Missing/null/unknown policy denies affected reads. Q06 selects no day count, anchor or renewal; completion/login/read/retry/help cannot incidentally extend or revive authority.

**Current scoped authority.** Revalidate exact principal/recipient revision, tenant/environment, source request/purpose/action and required assurance for every protected recipient operation. Independently admitted source/service operations use their own current authority. No membership fabrication, mailbox inference, staff-role union, public-completed fallback or transferable old grant.

**Current exact members only.** Preserve Q05's informational superseded history and Q04's exact current originals. Read only currently eligible own members within the qualified completed-request scope; no moving latest pointer, superseded bytes or implicit new-file audience expansion.

**Independent representation eligibility.** Completion and a future access date do not qualify every original/preview. Apply current safety, whole-original disclosure, custody integrity and rendition rules independently; no automatic fallback, substitute bytes or older-file revival. Authorized source workers keep their separate current authority.

**Expiry at the operation boundary.** Server time/source authority govern the applicable end. Deny new affected metadata/history/full/HEAD/range/conditional/recovery reads at or after it, regardless of delayed jobs/client clocks. Preserve inherited per-chunk expiry and feasible restriction termination without recall or grace claims.

**Session and re-entry.** Distinguish session/proof expiry from ended source access. Use Q01's qualified entry/proof reuse and safe same-source return; successful sign-in cannot renew/revive a grant or reopen submission. No extra account or per-view ceremony without source assurance need.

**Data and privilege integrity.** Protect scoped source/evidence/recipient references, valid state combinations, immutable source effect identity and trusted actor/time/expiry/clearance. Prove real-role grants/RLS/new-row behavior, views/functions/RPC/storage and privileged paths; generic status/expiry writes cannot create authority.

**Truthful outcomes and failure isolation.** Recover authoritative completion/admission after lost responses. Distinguish unknown source state, temporary outage, ended access, unavailable file and history-only failure. No default open/not_started/complete, false rejection or rollback of a committed outcome due to secondary failure.

**Ended access and owned help.** At source access end show only the permitted neutral end-state/help projection, without indefinite private receipt/history fallback. Assistance, resent links and new authentication grant no automatic renewal, old-file release or reopening; any fresh authority/remediation follows its source.

**Calm completed UX.** Use the same task context, truthful completion/current-next-step wording, clear applicable date/time/timezone, current eligible file actions and concise history. Remove ordinary mutation controls; avoid disabled-control walls, forced downloads, new archives, countdown noise or unselected emails.

**Accessibility and timing.** Reuse Core shared Base UI/base-maia semantics and prove keyboard/AT/speech/touch/mobile/zoom/RTL/focus/re-entry. Assess WCAG 2.2.1 mechanisms/exceptions for actual content-set limits; security wording/reauth alone is not proof. Preserve source authority in qualified timing/accommodation paths; do not misstate AAA guidance as AA.

**Privacy, caching and access evidence.** Protect completed metadata/bytes across routes, caches, error/conditional paths, back navigation and late responses. Apply current invalidation and existing tiered audit/metering. Keep private content/identities/URLs/tokens out of general telemetry; no offline archive or inferred human-read/acceptance event.

**Bounded serving and processing.** Use the inherited qualified bounded reads/renditions plus finite source page/payload/time/concurrency/egress budgets. No all-file prefetch, repeated regeneration, per-request scheduler or unbounded replay; slow clients and expiry release resources without weakening gates.

**Retention and source independence.** Completion/access end/help do not delete, extend retention, discharge holds or change other uses. Apply source disposition and adverse history before restore. Preserve official/specialist documents and worker authority without borrowing their grant durations or treating retention as access.

**Cohort rollout and alternate-path containment.** Qualify exact source completion writers, grant resolvers, old links, metadata/byte routes and read-support operations before activation. Reconcile legacy unknowns without inferring completion/expiry from status/age; test mixed versions, safe disable/roll-forward and restore with no broader fallback.

**Proof and trace.** Prove exact completion/races/replay, real-role current access, finite expiry, session return, all representation paths, browser/AT/mobile and source help for every declared cohort. Use Q07's actual source-fulfillment anchor and at-most720-elapsed-hour original completed profile; qualify actual source binding rather than inventing a runtime default. A completed-looking page or mocked test is not completion.

- **AC29-A06-01:** Only actual durable source fulfillment can establish completed-request meaning; upload, scan, task completion and a cached badge cannot do so.
- **AC29-A06-02:** Completed recipient access is business read-only for the admitted scope. Qualified technical rendition/delivery recovery and audit can continue without reopening intake.
- **AC29-A06-03:** Protected completed reading is unavailable until its finite source end and historical recipient eligibility are established; unknown policy is not an indefinite or default grant.
- **AC29-A06-04:** Independent staff/source work can finish after recipient access ends while preserving the original outcome; it neither renews recipient access nor discloses protected status without current rights.
- **AC29-A06-05:** The same request context distinguishes completed, expired, restricted, temporarily unavailable and unknown states and supplies its actual source help route.
- **AC29-A06-06:** Access ending does not dispose retained evidence, release a hold or recall delivered copies; exact original/preview qualification and superseded-content restrictions remain.

## REQ29-A07 — Fixed source-owned completed-request access end

**Story US29-A07:** As an intended recipient, I want to see a trustworthy fixed completed-access deadline, so that reading and delayed messages do not silently change my time.

**Decision basis:** Q07, complete incorporated source clauses and current explicit later refinements; REQ29-P01–P18. Exact paragraph, clause, proof and journey locators are mapped individually.

**Ordinary scope and adoption.** The 30-day policy SHALL apply only to prospectively admitted ordinary completed Private Document Requests explicitly bound to it. It SHALL NOT replace specialized document, CMS, staff, public or retention contracts.

**Exact anchor and unit.** The completed maximum SHALL be 720 elapsed hours from the one trustworthy source-recorded normal-fulfillment occurrence instant, bound to the exact effect and evidence scope. Client/effective business dates, processing time, notifications, first/last visit and mutable task timestamps SHALL NOT supply or reset that anchor.

**Eligibility and non-revival.** Completion SHALL resolve completed access only from trustworthy evidence of recipient eligibility, admitted policy and binding limits at fulfillment, followed by current authority checks. Today's state SHALL NOT manufacture historical admission. Missing read-admission evidence SHALL NOT block independently authorized source completion; such completion SHALL NOT restore ended recipient access or expose results through it.

**Preserved ceiling and earlier limits.** The source SHALL durably preserve the admitted end, no later than the completion maximum or any then-binding earlier end applicable to that authority and scope. A later source action that actually shortens authority SHALL preserve the narrowed end; removing/relaxing its cause SHALL NOT restore the prior later end without a separately qualified extension rule. Member-specific limits SHALL NOT accidentally terminate unrelated permitted members. Cap removal, policy relaxation/default change, replay, login, return, help, resend or retry SHALL NOT silently lengthen the admitted end.

**Current authority and recoverable conditions.** Every protected recipient operation SHALL revalidate current exact tenant/environment, principal/recipient revision, request, purpose, action, assurance and representation eligibility. Temporary failure or an explicitly reversible owner restriction MAY clear within unchanged valid authority; it SHALL NOT be confused with, or revive, expired/revoked authority.

**Durable completion and races.** Completion, relevant admission fences, policy/effect linkage and required durable history/effect intent SHALL agree through the source-owned atomic boundary or an equivalent fail-closed invariant. Native clock capture/checks SHALL account for relevant lock waits and current-state validation. Competing corrections, completion, reassignment and restrictions SHALL have a durable authoritative ordering; retries SHALL recover the same business effect/end while private replay responses still require current disclosure authority.

**Exclusive server boundary.** New affected protected operations SHALL be denied at or after the applicable end using qualified authoritative time at their enforcement boundary. Missing/nonfinite/invalid policy, provenance or time qualification SHALL deny affected access; no client clock, stale transaction time, delayed cleanup or unselected grace period SHALL extend it.

**All delivery paths.** Metadata/history, originals, previews, HEAD/range/conditional/resume and recovery paths SHALL preserve Q04/P12 current authorization, exact bytes, per-chunk expiry and feasible restriction termination. Provider links, caches and derived projections SHALL NOT create an alternate lasting grant.

**Durable data integrity.** Source relationships SHALL be tenant/environment consistent; trusted anchor/end/policy/effect/actor fields and legal state combinations SHALL be constrained at the authoritative mutation boundary. Preserve historical fulfillment and explicit correction/remediation evidence; unknown legacy facts or late completion SHALL NOT be repaired by inventing eligible access.

**Database and privilege proof.** Actual grants, column privileges, RLS USING/new-row behavior, composed policies, views, functions/RPCs, storage and service paths SHALL prevent scope forgery, attribution forgery, end extension and bypass. Client updates SHALL NOT turn an allowed row into an unauthorized state.

**Truthful deadline presentation.** The same request page SHALL show the actual effective end in readable localized date/time with clear timezone and sufficient precision near current status/actions. An earlier end SHALL replace the generic 30-day promise. Display, sorting, locale or timezone changes SHALL NOT change authority.

**Safe re-entry.** Session/proof expiry SHALL remain distinct from ended source access. Qualified same-request re-entry MAY restore a still-permitted view without new membership, repeated unnecessary enrollment or a reset deadline. Valid authentication SHALL NOT restore ended access or convert re-entry into an unrequested download.

**Honest failure and end states.** Unknown policy/outcome, technical outage, file unavailability, expired proof and ended access SHALL have truthful independently scoped states. After source access ends, only the permitted neutral help/end projection MAY remain; no permanent private receipt/history fallback or false deletion/rejection claim is allowed.

**Accessible shared UX.** The journey SHALL preserve Core's shared Base UI/base-maia system, clear names, keyboard/focus, touch, zoom/reflow, localization and meaningful non-repeating status. Each actual timing limit SHALL have documented applicable accessibility treatment; a 30-day maximum or security label alone SHALL NOT prove conformance.

**Independent custody and clocks.** Source access, intake due date, proof/session, delivery/worker/rendition and retention/hold/disposal clocks SHALL remain distinct. Expiry SHALL NOT delete evidence, extend retention, release a hold, recall downloaded copies or alter independent uses/rights.

**Delayed and partial effects.** Lost responses, delayed events/projections/notices and outages SHALL recover the original authoritative outcome/end without restarting or pausing the window. Required secondary effects SHALL use their existing durable owners; no email, reminder or renewal is implied by completion.

**Governed assistance.** The actual source help path SHALL explain or route the permitted problem without privileged bypass, private email attachment fallback, automatic extension or reopening. Any future fresh authority/accommodation SHALL be explicit, auditable and separately source-qualified.

**Bounded operation.** The implementation SHALL use existing owned service/worker paths, scoped bounded queries, explicit pagination and measured concurrency/egress budgets. Ordinary reads SHALL NOT require a global expiry sweep, provider call under a database lock, per-view deadline write or unbounded history/file fetch.

**Audit and privacy.** Durable evidence SHALL distinguish source completion, admitted policy/end, subsequent authority changes and actual access decisions from technical delivery outcomes. Diagnostics SHALL be correlation-safe and minimized; success SHALL NOT imply human reading, successful saving or evidence acceptance.

**Safe rollout and proof.** Rollout SHALL identify the exact prospective cohort, owner contract, real-role/provider/browser qualification and compatible reader/writer behavior. Unknown legacy requests SHALL NOT receive fabricated anchors or changed ends. Kill switch, restore and roll-forward SHALL preserve history and deny resurrected access; fallback SHALL NOT reopen intake or widen grants.

**Evidence-based policy ownership.** The source/product owner SHALL record 30 days as the chosen ordinary maximum and evaluate validated unmet needs or systematically earlier caps without silently changing grants. Cohort qualification SHALL identify source policies that leave no completed readback before claiming Q06/Q07 is delivered; no minimum guaranteed window or implicit cap relaxation follows. Monitoring SHALL use named signals, thresholds, owners and responses; it SHALL NOT substitute for authorization, accessibility or activation gates.

- **AC29-A07-01:** Eligible source fulfillment fixes the original completed end from that occurrence and its qualified policy, at most720 elapsed hours and actual applicable earlier limits; first reading and delayed delivery cannot restart it.
- **AC29-A07-02:** At the exclusive end, newly affected protected operations are denied even when cleanup is delayed, the browser clock is wrong or an old session still exists.
- **AC29-A07-03:** A genuine applicable adverse shortening remains binding; removing or relaxing its cause does not revive the formerly longer admission.
- **AC29-A07-04:** A delayed consumer can recover only the historical transition/end actually earned at fulfillment, then applies current rights; it cannot manufacture recipient admission from current facts.
- **AC29-A07-05:** Missing optional completed-read readiness does not prevent independently valid source fulfillment; the recipient view remains unavailable until its own historical/current proof is established.
- **AC29-A07-06:** Localized dates/timezones show the actual effective end with sufficient precision; display choices, help, opening or download do not change the authoritative instant.

## REQ29-A08 — Source-authorized fresh completed-request access

**Story US29-A08:** As an authorized source staff member, I want to grant separately reviewed fresh completed reading, so that a legitimate recipient can return without reviving old rights.

**Decision basis:** Q08, complete incorporated source clauses and current explicit later refinements; REQ29-P01–P18. Exact paragraph, clause, proof and journey locators are mapped individually.

**Eligible ordinary expiry.** Fresh Completed Request Access SHALL require a proved lawful Q16 completed-view root admission from either the original unfinished or a qualified fresh-unfinished route that ended by its ordinary timebox and a current permitted request purpose. Unknown historical admission, security revocation, genuine binding shortening, purpose/content-use expiry, disposal or other source prohibitions SHALL NOT be bypassed by a new identifier.

**Issuing authority.** The issuer SHALL have the exact current source capability to cause issuance within P12's live administrative scope, assignable ceiling and applicable assurance/SoD. A staff role, help assignment, read permission or service credential SHALL NOT substitute. The compatible grant type and continuing grantor/delegation dependencies SHALL be explicitly mapped and enforced.

**Recipient and proof separation.** The source SHALL prove current eligibility to issue for the same intended recipient/purpose without requiring an unexpired old read grant or an open recipient browser. Every protected use SHALL still require current Q01/P4 proof, compatible native admission and source/P12 authorization. Contact/principal recovery SHALL follow its owner; this command SHALL NOT retarget through an arbitrary email field.

**Original scope ceiling.** Each fresh scope SHALL be the reviewed intersection of the original ordinary completed-view admission, current eligible own-submission members/actions/context and the new permitted scope. It SHALL NOT derive from access logs, unions of fresh grants or later-added files. A narrower individual grant SHALL NOT silently redefine the original scope or a global restriction.

**Preserve prior truth.** Prior grant states/ends, fulfillment, submission lineage and history SHALL remain preserved. Fresh issuance SHALL NOT reset Q07, reopen intake/correction/review, restore superseded content, grant resharing/membership or clear a source restriction. Qualified temporary representation repair remains a separate operation.

**Complete finite policy.** The source SHALL apply Q16–Q19: both lawful origins, fresh source-issued up-to720 elapsed hours under actual earlier caps, unused time governed by that same end, and individually reviewed sequential periods without overlap or preset lifetime/cumulative caps. There is no deferred first-entry activation or automatic renewal. Unknown authority or source binding SHALL deny issuance; qualify exact native mapping rather than inventing staff dates or defaults.

**Meaningful bound review.** Staff SHALL review source-authorized recipient identification, exact scope/actions, qualified timing terms and controlling limits, including any exact end already determinable, before a deliberate grant command. The server SHALL bind those material facts and revalidate them at commit. Material changes require refreshed review; ordinary time advancing under unchanged terms does not. Show the actual end when the selected source rule resolves it; immediate denial SHALL NOT wait for confirmation.

**Atomic current issuance.** The owning source/P12 mutation boundary SHALL serialize issuance against relevant source, recipient, restriction, issuer, disposition and grant-history changes. Required grant/effect/provenance/audit and authorized secondary-effect intent SHALL commit durably together or through an equivalent fail-closed recovery contract. No parallel grant-state writer or provider call under the source lock is permitted.

**Semantic idempotency and disclosure.** One stable deliberate issuance identity SHALL converge on one effect across clicks, retries and transport IDs. Bind its exact context and immutable reviewed payload; conflicting reuse SHALL fail without mutation rather than generate a new intent. Separately permitted deliberate repetitions MAY have distinct identities even for identical scope and SHALL atomically satisfy the adopted repeat/overlap policy. Recovery SHALL preserve the original effect/end while private replay output requires current disclosure authority.

**Independent communications.** Issuance, current access, recipient proof, notification and file delivery SHALL have separate outcomes. Failed/lost delivery SHALL NOT create a grant, change recipient or reset time. Communications SHALL use P17/P6 only when separately authorized; Q08 selects no automatic email/reminder.

**Data and role invariants.** The implementation SHALL constrain same-tenant/environment/source/admission/recipient/member relationships, semantic uniqueness, required finite values, legal states and trusted attribution. Actual grants/RLS old-and-new-row behavior, views/RPCs/definer/storage/service paths SHALL prevent forged scope, issuer, approval, end and owner transitions.

**Current private reads.** Every protected metadata/history/original/preview/full/HEAD/range/conditional/resume/recovery path SHALL require current exact new authority and representation eligibility. Q04/P12 expiry, private caching and feasible revocation termination remain binding; no old URL or provider capability SHALL be sufficient authority.

**Small explicit staff UX.** Use existing source context and shared Core controls for one meaningful review plus Grant read access. Show only review metadata the issuer may inspect; do not require original-content reading as a proxy for administration. No generic sharing defaults, mandatory essay, arbitrary recipient picker, repeated generic confirmation, bulk issuance or new portal is implied.

**Truthful command states.** Distinguish not submitted, pending, committed, not committed, outcome unknown and current blocked/ended access. Do not optimistically announce a grant or message. Closing a dispatched UI SHALL NOT imply cancellation; recovery SHALL reconcile the same operation before proposing a new decision.

**Accessible coherent journey.** Preserve shared Base UI/base-maia, semantics, keyboard/focus, touch, zoom/reflow, speech/AT, localization and actual deadline precision. Display material errors/status without repetition or private leakage. Reauthentication SHALL preserve safe context without unrequested download, broader enrollment or a private offline archive.

**Independent retention.** Fresh access SHALL NOT extend retention, release holds, reverse disposal, reconstruct expired-content authority, change independent source uses or promise recall of received copies. Retained bytes and newly generated renditions SHALL NOT supply recipient permission.

**Accountable recipient handoff.** Every enabled profile SHALL have a real source-qualified neutral help and entry/handoff route. Help, email threading, sign-in and resend SHALL NOT authorize issuance. No private details, approval promise or external attachment workaround is allowed where the current caller lacks disclosure authority.

**Bounded operation.** Issuance and review SHALL use scoped bounded queries/pages and the existing grant/worker mechanisms, with measured policy/repetition/egress budgets. No unbounded graph/history traversal, sweep-based correctness, N+1 provider review or global cross-tenant lock is justified by this choice.

**Durable minimal history.** Preserve attributable issuance intent/effect, original linkage, reviewed scope, policy/end, current authority changes and separate communication outcomes under owned audit rules. Diagnostics SHALL be minimized; sensitive free text, tokens, filenames/content and recipient addresses SHALL NOT spill into general telemetry.

**Prospective qualified rollout.** Admit only explicitly qualified source cohorts through compatible owner contracts and reader/writer versions. No grant backfill from generic tasks/emails/old URLs. Restore must reconcile adverse/current authority before serving; kill/roll-forward must preserve source history and deny wider fallback or reopened intake.

**Correction and revocation.** The source SHALL provide a currently authorized way to revoke or correct an erroneous fresh issuance, preserving the historical act and inherited active-delivery fences. Revocation SHALL NOT imply recall or deletion of evidence, and technical retry SHALL NOT undo it.

**Proof and ownership.** C01–C21 SHALL be traceable into canonical owner sources, derived OpenSpec, later authorized tasks/tickets and release proof. Activation requires real-role/concurrency/provider/browser/accessibility and handoff evidence. Residual monitoring SHALL have a named signal, threshold, owner and response; public benchmarks or mock tests SHALL NOT stand in for that proof.

Q16–Q19 replace the earlier fresh-read reservations with both lawful origins, fixed issuance anchoring, the up-to720-hour profile and individually reviewed nonoverlapping later periods. All actual adverse facts, original completed-scope ceilings and current checks remain.

- **AC29-A08-01:** Fresh completed reading requires a lawful Q16 completed-view root and the relevant eligible ordinary expiry/current lineage. Security revocation, binding shortening, disposed material or a generic Expired badge cannot bypass that proof.
- **AC29-A08-02:** The fresh reviewed member/version/action scope is bounded by the original completed-view ceiling and current eligibility; never-viewed admitted members remain eligible without download telemetry, while later unrelated files, other recipients and superseded bytes do not enter.
- **AC29-A08-03:** One deliberate source-qualified Grant read access applies Q17–Q19 terms and current issuer/recipient restrictions, including exact expected basis after waits; no arbitrary recipient or date is accepted.
- **AC29-A08-04:** A matching lost-response retry recovers the original grant/end before considering new work. Changed material conflicts, and closing the form cannot promise the original command was canceled.
- **AC29-A08-05:** The recipient returns through current Q01 proof into the same bounded completed read-only context; proof, representation, grant and optional Q20 notice failures remain separate recoverable states.
- **AC29-A08-06:** Fresh access changes neither original fulfillment/history nor retention, membership, intake or resharing authority, and it cannot automatically renew itself.

## REQ29-A09 — Requested-by targets preserve otherwise-authorized intake

**Story US29-A09:** As a recipient or reviewer, I want to understand Requested by separately from access and receipt, so that coordination dates do not fabricate rejection or completion.

**Decision basis:** Q09, complete incorporated source clauses and current explicit later refinements; REQ29-P01–P18. Exact paragraph, clause, proof and journey locators are mapped individually.

**Ordinary target.** The ordinary request's due date SHALL be a requested-by target. Passing it alone SHALL NOT deny otherwise-authorized submission or Q03 correction, end reads, approve evidence, complete/cancel the request or create a late-approval gate. Specialized source policies remain authoritative.

**Current admission.** Every new admission SHALL enforce current tenant/environment/source/recipient/purpose/item/revision authority, finite access, binding intake limits, freeze/closure/completion and custody eligibility. Unknown authority SHALL deny the affected action. Q08 fresh access SHALL remain read-only.

**Trustworthy receipt timing.** The source SHALL durably preserve exact submission admission time and available immutable target-applicability evidence. If target-only failure prevents proof, timing SHALL remain explicitly unresolved; recovery must prove the admission-time terms, never substitute today's target or invent a verdict. Transfer start, client clock, provider dates, callback arrival, scanner completion, reviewer action and response receipt SHALL NOT replace receipt time.

**Qualified date meaning.** Target comparison SHALL use a qualified source interpretation, timezone/calendar where applicable and authoritative precision. For a resolved instant, strictly later is late and equality is not late. Date-only/absent/unknown states SHALL be distinct; no accidental UTC-midnight, browser-local or generic Studio default. Actual cutoff/expiry boundary rules remain separate.

**Historical integrity.** Authorized date changes SHALL preserve original receipt and applicable target evidence. Current outstanding-work projection MAY follow the source's new terms without silently rewriting historical timeliness. Erroneous facts require explicit attributed owner correction with prior evidence preserved. No generic task edit, backdate, retry, migration or derived flag SHALL grant new authority or erase a prior received act.

**Truthful outstanding work.** Recipient-overdue status SHALL require actual currently outstanding recipient work under its applicable target. Pending scanning/review or missing business acceptance alone SHALL NOT make timely submitted work recipient-overdue. Failed checks SHALL preserve receipt while accurately identifying any source-required next action.

**Correction and new obligations.** Each correction SHALL have its own receipt and exact Q03 relationship. Additional/clarification/replacement work SHALL use explicitly applicable source terms, without unrelated retroactive lateness or an automatic new interval. A correction SHALL NOT inherit predecessor approval or safety results.

**Exact review fencing.** Durable correction admission SHALL atomically apply Q03's predecessor fence and relevant evidence-set change. Stale review/completion SHALL NOT accept a superseded candidate; sibling material and independent uses remain intact. Failed successors SHALL NOT silently revive predecessors.

**Serialized source effects.** Admission SHALL serialize with relevant target/revision, recipient, hard-limit, freeze, acceptance, completion and revocation changes. Qualified compatible target-only changes need not force reupload or confirmation; material meaning/scope changes keep their actual guards. Required receipt/history/effect intent SHALL be durable together or use an equivalent fail-closed recovery contract. Actual time SHALL be reevaluated after waits; no provider operation under a source lock.

**Durable idempotency.** One deliberate submission identity SHALL converge on one exact durable effect across retry, double click, callback duplication and transport-key expiry. Bind submitted bytes and material recipient/item/purpose/correction/instruction scope; conflicting reuse SHALL fail. Server-resolved compatible target-only changes MAY be captured at first admission without replacing intent. Once admitted, replay retains its original time and captured terms/unresolved state. New corrections are separately identified; replay disclosure requires current permission.

**Unknown outcomes.** A transport/provider timeout SHALL NOT prove nonreceipt. Recover the same operation before duplicate submission or destructive cleanup; cleanup SHALL prove nonadmission/unreferenced custody under source policy. A missing response SHALL NOT move an already committed receipt after the target.

**Target-only failure.** Unavailable target information SHALL NOT be treated as no target, a late result or a hard cutoff. Independently proved actions SHALL remain usable under a qualified source recovery contract preserving the receipt, available immutable provenance and unresolved timing. Reconcile only trustworthy admission-time terms; otherwise retain unknown timing. If missing information is needed to prove authority or a binding cutoff, deny that action. Activation requires resolved timing semantics and this recovery policy.

**Trusted scope and attribution.** Tenant, actor, recipient, author/owner, source, review/approval facts and receipt time SHALL derive from trusted current context or validated source relationships, not caller declarations. Protected metadata, counts, history, cache keys, exports and recovery SHALL preserve exact role/tenant scope.

**Database enforcement.** The schema/mutation design SHALL enforce same-tenant relationships, semantic uniqueness, immutable provenance, legal states/nullability/delete behavior and bounded indexed access. Effective grants/RLS old-and-new-row behavior, views/RPC/definer/service/storage paths SHALL prevent authorized-row transitions into forbidden states.

**Private file boundaries.** Late intake SHALL retain file type/size/rate/quota, integrity, safety and representation gates. Original/preview/history reads remain independently authorized under Q04/Q05; lateness SHALL NOT publish files, revive superseded bytes, extend retention or bypass disposal/holds.

**Simple truthful UX.** Keep the existing request/item context, Requested by wording, current allowed action, exact correction target and durable receipt. Lateness alone SHALL NOT create a validation error, mandatory essay, repeated confirmation, new account/drive view or approval queue. Use action-specific blocked and unknown states.

**Accessible temporal UX.** Preserve Base UI/base-maia, shared semantics/tokens, keyboard/focus, speech/AT, touch, reflow, localization/RTL and time-zone clarity. Material progress/errors SHALL be perceivable without color-only/toast-only feedback or focus theft. Reauthentication/retry SHALL preserve safe context without unrequested replay or private offline storage.

**Workflow boundaries.** Target passage SHALL NOT let a task/timer complete, revoke or close the source through shorthand. Separately authorized reminders/escalations SHALL recheck exact current source work and governing dispatch rules. Q09 SHALL select no new message, cadence, escalation or generic execution platform.

**Bounded operation.** Use existing custody/command/task/worker paths, bounded scoped queries/pages, suitable indexes and measured request/tenant/byte/concurrency budgets. No complete-history scan per row, provider fan-out per timing label or cron dependency for authority correctness. Abuse limits SHALL preserve ordinary qualified retries.

**Minimal accountable history.** Preserve source-attributed receipt, target/revision applicability, correction and source decision history. Diagnostic telemetry SHALL minimize private names, addresses, filenames/content, tokens and deadline details. Staff correction/help SHALL use a real owner route; support messages do not grant rights.

**Safe adoption.** Adopt prospectively for qualified ordinary-source cohorts and compatible reader/writer versions. No blanket reinterpretation of legacy deadlines or guessed receipt targets. Backfill only from reliable source evidence; unknown stays unknown. Rollback/restore SHALL preserve new receipt history and current adverse authority without reopening intake.

**Trace and qualification.** Trace this selected answer and complete amendments into the authorized glossary/ADR, canonical owner requirements, generated OpenSpec, design/tasks, tickets, implementation and release proof at their proper stages. Native role/concurrency/provider/browser and representative-user evidence SHALL precede activation. Adjacent unit tests SHALL NOT be represented as that proof.

- **AC29-A09-01:** Passing Requested by alone neither closes otherwise authorized intake nor grants access, rejects evidence or fulfills the request; the actual hard source access boundary still applies.
- **AC29-A09-02:** Durable receipt uses trusted source admission time and immutable target-applicability evidence. For an instant target, receipt strictly after it is late and equality is not late.
- **AC29-A09-03:** Timely material awaiting technical checks or staff review is not shown as recipient-overdue merely because fulfillment is still pending.
- **AC29-A09-04:** Date-only or unknown target semantics retain their actual source precision/zone. A target-only outage does not fabricate lateness or block independently proved work, but missing facts needed for authority deny that act.
- **AC29-A09-05:** A target change preserves earlier receipt/target evidence and does not reset an access end or erase historical lateness; factual mistakes use attributed correction.
- **AC29-A09-06:** Concurrent admission and source restriction/closure use the current after-wait boundary; duplicate callbacks preserve one receipt and its original timing.

## REQ29-A10 — Separate finite unfinished and completed request access

**Story US29-A10:** As an intended recipient, I want to move from unfinished work into the correct completed reading stage, so that the source outcome determines my actions and deadline.

**Decision basis:** Q10, complete incorporated source clauses and current explicit later refinements; REQ29-P01–P18. Exact paragraph, clause, proof and journey locators are mapped individually.

**Prospective stage scope.** The ordinary source policy SHALL declare finite unfinished access and its eligible Q06/Q07 transition before admission. The unfinished deadline SHALL NOT cap a validly admitted completed stage solely through its old stage role. Existing or unknown overall limits SHALL NOT be relabeled; specialized owners remain authoritative.

**Complete finite initial policy.** Activation SHALL require a finite applicable unfinished end and exact source/recipient/action scope. Q10 selects no initial duration/anchor or extension. Null, infinity, missing policy, absent visit or unfinished review SHALL NOT mean indefinite access.

**Qualified fulfillment.** Completed admission SHALL require exact durable normal fulfillment strictly before the applicable exclusive unfinished end with proved at-fulfillment policy and recipient eligibility. Receipt, scan, task flag, backdated caller time and processing time SHALL NOT substitute. Source completion may succeed independently without recipient admission.

**Preserve true caps.** Every limit SHALL retain its declared action/stage/purpose scope. Q07's original 720-hour maximum, admitted applicable overall caps and later genuine cross-stage shortening SHALL remain effective. Removing a cause SHALL NOT restore a longer end. A stage-only change cannot silently alter a different limit or create new editing power.

**Atomic source order.** Fulfillment/admission SHALL share the relevant serialized source order with correction/review-set, recipient, revocation, disposition and policy changes. Required facts/provenance/effect intent SHALL be durable atomically or through an equivalent recoverable fail-closed owner contract. Check current state/time after waits; never call providers under source locks.

**Historical recovery.** Delayed/retried processing SHALL prove the original fulfillment occurrence, policy, exact scope, eligibility and applicable caps, then apply current authority. Recover the original end; never processing-time plus 30 days, current-state fabrication or revival from actual late fulfillment.

**Fenced expiry and projections.** Expiry jobs, timers, caches and projections SHALL check current authoritative stage/effect/policy before consequences. A stale unfinished command SHALL NOT end a valid completed admission; lag SHALL NOT extend truly ended authority. A proven derived-expiry error requires attributed owner repair preserving genuine adverse history, not blanket disregard of Expired/Revoked state. Enforce current expiry without sweep dependence.

**One durable effect.** One source fulfillment occurrence and recipient-admission consequence SHALL converge across duplicate events, concurrent workers, lost responses and key expiry. Bind exact context/payload; conflicting reuse SHALL fail. Retries cannot reopen, widen scope, alter the original end or leak stored results without current disclosure authority.

**Read-only exact scope.** Normal fulfillment SHALL stop ordinary submission/correction. Preserve Q03's predecessor fence and relevant evidence-set ordering. Completed reads SHALL include only the exact eligible recipient/purpose/current own-submission scope and Q04/Q05 actions; no new siblings, historical bytes, recipients or independent uses are added.

**No lifecycle reset.** Later invalidation, new work, reopening requests or factual correction SHALL use the owning domain's explicit procedure with prior evidence retained. They SHALL NOT reset completion/end, revive ordinary intake, restore predecessors or automatically issue Q08 access. Canceled/rejected/withdrawn outcomes do not become normal fulfillment by shorthand.

**Proof and credentials.** Eligibility for the declared source transition SHALL NOT require the recipient browser to be open. Every protected use still requires current qualified proof and permission. Stage transition SHALL NOT extend invitation/session/provider credentials; reuse compatible valid proof or the existing qualified re-entry path without unselected enrollment or ceremony.

**Every private delivery.** Current authorization and exact representation eligibility SHALL protect metadata/history/search/counts, originals/previews, replay and all full/HEAD/range/conditional/resume/stream paths. Old tokens/URLs or cached stage state SHALL NOT grant access. Preserve inherited stream expiry, feasible revocation and honest copy limitations.

**Truthful independent outcomes.** Business completion, recipient admission, current access, proof/session, file readiness, notification and observer uncertainty SHALL remain distinct. Missing admission does not invalidate independently permitted source completion. Unknown outcome SHALL be reconciled before new effects; preserve independently proved work during partial failures, without fabricated success, expiry, rejection or empty history.

**Recipient and staff clarity.** Keep the same source task context, truthful Received/Awaiting review/Complete states, current relevant boundary and actual completed-read end. Staff delay SHALL NOT become recipient lateness. Surface the access consequence to the appropriately authorized source owner; do not invent extra approval, reminder cadence, forced download or urgency-driven false completion.

**Accessible temporal journey.** Preserve shared Base UI/base-maia, semantics, keyboard/focus, speech/AT, touch, reflow/RTL/localization and qualified timing behavior. No countdown-only/color-only/toast-only essential information or background focus theft. Actual session and opportunity timers require applicable accessibility proof, not a blanket security exemption.

**Database and role enforcement.** Enforce same-tenant/environment/source/recipient/evidence relationships, semantic uniqueness, required finite values, legal states, trusted attribution and deliberate delete behavior. Actual grants, effective USING/WITH CHECK, views/RPC/definer/service/storage paths SHALL prevent forged time/scope/stage and allowed-row updates into forbidden states.

**Custody and retention.** Stage transition/expiry SHALL NOT alter records retention, holds, independent source uses or disposal authority. Technical checks and qualified representation repair may continue under their own authority without new recipient rights, clock extension, substitute content or recall claims.

**Communication boundary.** Transition, notification and entry delivery SHALL remain separate effects. Q10 selects no automatic message or cadence. Any separately authorized communication SHALL use P17/P6, exact source event identity and current eligibility; resend/failure SHALL NOT reset time or attach private files as a bypass.

**Bounded architecture.** Reuse source/PDP/custody/tasks/worker infrastructure. Use bounded scoped queries, indexed effect/eligibility lookups, appropriate contention boundaries and measured budgets. No new permission engine, workflow service, complete-history scan per read, global lock or provider fan-out is justified.

**Durable minimal evidence.** Preserve original policy/limit scope, fulfillment, eligibility basis, admission/end, genuine restriction and remediation provenance under owned records rules. Separate durable business/security history from minimized technical diagnostics. No private filenames/content, recipient addresses, selectors/verifiers or sensitive policy reasons in general telemetry.

**Prospective compatible rollout.** Enable only qualified cohorts and compatible readers/writers/expiry jobs. Do not relabel legacy ends, backfill eligibility from task timestamps or revive access on restore. Kill/rollback/roll-forward SHALL preserve facts and deny unsafe fallback; they cannot reintroduce the obsolete stage cap or reopen submissions.

**Qualified usefulness and trace.** Before activation, prove useful source review timing, exact real-role/race/provider/recipient journeys and an accountable help route. Unfinished-expiry recovery and Q08 fresh policies remain explicit separate capabilities. Trace this choice through glossary/ADR, authorized owner/OpenSpec sources, tasks/tickets and release evidence; adjacent tests are not native qualification.

- **AC29-A10-01:** Only normal durable fulfillment while actual unfinished authority is valid, with proved historical policy/scope/recipient eligibility, admits the original completed stage.
- **AC29-A10-02:** The unfinished end governs that stage, not a valid later completed stage. Eligible fulfillment fixes the completed end from F plus at most720 elapsed hours under genuinely applicable earlier restrictions.
- **AC29-A10-03:** Fulfillment before versus at/after the exclusive unfinished boundary yields the specified distinct recipient-admission results; late independent source completion never revives expired access.
- **AC29-A10-04:** Delayed projection of a timely eligible transition recovers its original completed end without requiring the recipient to have been online or extending it from recovery time.
- **AC29-A10-05:** Business completion, recipient admission, current proof/session, representation readiness and notice outcome remain distinct; neither a transition nor a failed mail attempt creates another stage.
- **AC29-A10-06:** The request explains the next actor and actual relevant ends without blaming a timely participant for staff processing or describing an enclosing application/financial process as approved.

## REQ29-A11 — Fix unfinished access at original source issuance

**Story US29-A11:** As an authorized source staff member, I want to issue original access with its fixed source-owned deadline, so that delivery and first opening cannot reset collection.

**Decision basis:** Q11, complete incorporated source clauses and current explicit later refinements; REQ29-P01–P18. Exact paragraph, clause, proof and journey locators are mapped individually.

**Original source issuance.** The source SHALL define one original access-issuance effect for the exact tenant/environment, purpose, request and recipient revision. It SHALL establish access availability under approved policy, distinct from drafts, task creation, credentials, delivery, confirmation and fulfillment. Caller-controlled metadata SHALL NOT manufacture the act or attribution.

**Complete finite terms.** At issuance the source SHALL resolve and preserve a valid finite original unfinished end. Null, infinity, invalid arithmetic and already-ended live admissions SHALL be rejected. Initial count, calculation units/calendar convention and any editing power SHALL be explicitly selected and qualified before activation, not borrowed from credential or other-purpose defaults.

**Immutable admitted result.** The original policy/calculation result and applicable limit scopes SHALL be recoverable unchanged. Due-date/default/locale/template changes SHALL NOT recompute the end. Preflight estimates and actual results SHALL be distinguished; material actor-approval or command-precondition conflicts require safe reconciliation, not silent widening.

**Exact authority and entry.** Issuance SHALL prove the issuer's exact source capability and current source/recipient/host/policy, independently of task visibility or broad staff role. Required Q01 confirmation/current proof remains necessary for protected use. GET/HEAD/scanner activity, generic login and return visits SHALL neither issue access nor restart time.

**Business idempotency.** Duplicate/concurrent commands SHALL converge on one original semantic admission despite new transport keys, retries and crashes. Resolve an existing effect before computing new timing/defaults: original issuance time and end are first-admission outputs, not regenerated intent fields. Same-intent retry SHALL recover them; conflicting material intent SHALL fail. A new credential/message SHALL NOT create a new source period. Scope uniqueness to the actual owner lifecycle.

**Coherent durable effect.** Required issuance terms, actor/policy evidence and durable secondary-effect intent SHALL be atomic or equivalently recoverable under a proved fail-closed source contract. No orphan live admission or phantom send may arise from partial writes. Unknown commit SHALL be reconciled before new effects or destructive compensation.

**Time and concurrent changes.** Qualify issuance occurrence/linearization, authoritative current time and relevant source/permission order after waits, including repeated waits and physical commit across a boundary. Rollback creates no issuance. An old transaction timestamp, stale lease or provider timestamp SHALL NOT establish authority; provider calls SHALL NOT occur under source locks.

**Restrictions and nonextension.** Preserve the original end while honoring true scoped revocation/shortening and current action restrictions. Clearing a genuine shortening cause SHALL NOT restore a longer end. Reauth, delivery repair, activity, due edits, copying, reopening and replay SHALL NOT automatically extend/reissue source authority.

**Credentials and communication.** Preserve separate original admission, credential and prepared-message identities. Replacement credentials follow their owning contract, including new message identity where required, while retaining original source terms. Delivery retry/failure/open/click SHALL NOT start, pause or reset recipient time or widen scope.

**Fulfillment causality.** Ordinary completed admission SHALL require original source admission and exact historical eligibility at the qualified fulfillment decision, before its applicable unfinished end. First issuance after earlier completion SHALL NOT backfill that eligibility. Qualified pre-visit or atomic source fulfillment remains possible without an online browser or arbitrary strict timestamp separation. Q07/Q10 limits and no-revival rules remain binding.

**Honest outcome recovery.** Distinguish issued/not issued/unknown, communication outcomes, assurance, file readiness, source completion and current access. Temporary proof/observer failure SHALL NOT be presented as proved source-access expiry/revocation or a definitive not-issued outcome; protected use still fails closed until current proof and authority are established. Recover the same result only under current disclosure authority.

**Structural authorization.** Enforce same-scope relationships, required finite values, semantic uniqueness, immutable original facts, trusted attribution and deliberate delete rules. Actual grants, effective USING/WITH CHECK, views/RPCs, definer/service and storage paths SHALL reject forbidden state transitions. Preserve P12's sole capability resolver, coarse tenant RLS and owning mutation boundary; qualify Q01's exact participant successor, not a generic new context or profile-role fallback.

**Current private use.** Apply current exact source/recipient/action/representation authority on metadata, history, previews, originals, replay, full/HEAD/range/conditional/resume and stream paths. Cached dates or valid technical tokens SHALL not authorize access. Preserve Q04's expiry/revocation/stream contract and Q10's stage-aware expiry; no job-lag grace.

**Truthful task UI.** Keep one source context, separate Requested by and actual access end, clear next actor, received/review/current-file states and scoped staff delivery diagnostics. Do not blame recipients for review, require timer-start confirmation, force downloads, create duplicate requests for retry or promise unselected recovery.

**Accessible temporal UX.** Preserve Core's shared UI system and qualify actual keyboard/AT/mobile/reflow/RTL/localized date and authentication flows. Show a stable truthful instant and timezone; essential information SHALL not depend on color, countdown, toast or tooltip alone. Evaluate each actual timer against applicable accessibility requirements.

**Owned lifecycle changes.** Recipient/host/purpose changes, issuer dependency loss, factual correction, reopening, new work and active-expiry recovery SHALL use explicit owner procedures with prior facts preserved. No broad rule that staff departure always revokes or preserves access, no retargeting by email match, and no implied new extension capability.

**Retention and privacy.** Access expiry SHALL not determine evidence deletion, holds or independent file-use permissions. Retain minimal required original/effect/adverse provenance under owned retention/disposal rules. General logs, messages and caches SHALL not contain private file details, raw proof, sensitive reasons or durable bearer material. No download-recall claim.

**Provider and route readiness.** Activate only a qualified source entry/host/assurance/communication contract. A known unsupported path SHALL not be called usable. Post-issuance failures retain original history/end and trigger owned safe repair; provider success/failure/unknown SHALL not rewrite authority or authorize platform/Site/provider-host fallback.

**Bounded implementation.** Reuse source/PDP/custody/communication/recovery infrastructure with scoped indexed reads, bounded pages/retries and measured per-cohort budgets. Preserve existing P12 R6 governed-read and owner-required mutation-fence contracts. No new global serialization, full-history scan per use, provider call per authorization, second timer service or generic permission engine follows from Q11.

**Durable explainability.** Authorized history SHALL explain who issued what scope, under which original terms, with which outcome, restrictions and recoveries. Distinguish business/security evidence from operational telemetry. Do not infer actual receipt, reading, human intent or device saving from transport events.

**Compatible rollout and restore.** Use prospective qualified cohorts, explicit policy/type mappings and compatible readers/writers/workers. Never backfill issuance from email/task timestamps or replace unknown ends with defaults. Mixed versions, restore and rollback SHALL preserve original effects and adverse history; unsafe fallback stays closed until reconciled.

**Readiness and trace.** Prove an adequate complete finite policy, recipient/reviewer/help journeys and real-role/concurrency/provider/UI behavior before activation. Trace Q11 through glossary/ADR, authorized canonical owners/generated OpenSpec, tasks/tickets and release evidence. Numeric policy, active recovery, Q08 settings and notifications remain explicit decisions; selected documents and adjacent tests are not native qualification.

- **AC29-A11-01:** Original access begins at the qualified source issuance occurrence, not draft creation, transfer, prepared mail, provider acceptance, first opening or proof completion.
- **AC29-A11-02:** The original occurrence/end and relevant policy/limit provenance are immutable source results; matching retries recover them and cannot return a false Draft or reset time.
- **AC29-A11-03:** Current issuer, intended recipient revision, source/purpose/host and required dependencies are checked at admission after waits. Invalid or missing finite live terms do not become now-plus-default.
- **AC29-A11-04:** Prepare now/issue later checks actual readiness at later issuance; issue now/deliver later retains the already admitted clock. Delivery failure has its own recovery without another issuance.
- **AC29-A11-05:** Known unsupported entry or required durability failure cannot be called issued; once issuance is known committed, ancillary failure cannot erase it or request another timer-start confirmation.
- **AC29-A11-06:** The ordinary numerical profile is Q12, with true independently scoped earlier restrictions; requested-by changes, staff departure without an actual dependency or credential refresh cannot invent a different clock.

## REQ29-A12 — Sixty elapsed days for ordinary unfinished request access

**Story US29-A12:** As an intended recipient, I want to see the actual ordinary sixty-day unfinished end, so that I can plan without hidden rolling or sender-selected time limits.

**Decision basis:** Q12, complete incorporated source clauses and current explicit later refinements; REQ29-P01–P18. Exact paragraph, clause, proof and journey locators are mapped individually.

**Exact ordinary profile.** Newly admitted qualified ordinary requests SHALL use a nominal unfinished end of original Q11 source issuance plus 1,440 elapsed hours (5,184,000 seconds). This is not calendar months/days, business days, end-of-day, a requested-target buffer or first-entry time. Preserve the qualified source instant/precision model.

**Scoped earlier limits.** Resolve the actual whole-unfinished end no later than the nominal result and genuinely applicable earlier whole-stage limits. Every limit SHALL retain action/item/representation/stage/purpose/overall scope. Requested targets, upload cutoffs and proof/representation TTLs SHALL NOT automatically become whole-request or completed-stage caps.

**No discretionary interval.** “Up to” SHALL mean the selected profile under genuine restrictions and source transitions, not arbitrary sender/tenant choice from zero to sixty. No date editor, override, pause/grace, renewal, duration menu or new policy-builder capability is created.

**Original output and provenance.** Preserve original issuance, exact admitted policy/result, calculation meaning and relevant limit provenance. Same-intent recovery SHALL resolve the existing effect before new arithmetic/defaults. Transport keys, credentials, target/calendar/locale changes and current defaults SHALL NOT reset or recompute a later original end.

**Valid finite source arithmetic.** Required issued-state times/results SHALL be finite, correctly typed, unambiguous and within supported range/precision. Reject malformed/null/infinite/overflowed or already-ended live terms; no now-plus-default, local-midnight or truncation fallback. Authoritative comparisons SHALL preserve the exclusive boundary.

**Current source order.** Preserve Q11 exact issuer/recipient/context capability and currentness, after-wait checks, causal occurrence/physical-commit distinction and coherent durable effect. No browser/provider timestamp, early SQL time sample, stale lease or queued wake alone establishes current authority.

**Correct completed transition.** Eligible normal fulfillment SHALL stop ordinary writes and apply Q07/Q10's distinct completed end, which may be earlier or later than the unfinished end. Do not use max(U,F+720h), retain a minimum sixty-day entitlement or impose an old stage-only U as a completed cap.

**No revival or pause.** Delivery, first entry, proof refresh, activity, workflow pause, correction, upload start and source review SHALL NOT pause/replenish the source interval. Actual completion after unfinished expiry cannot create ordinary completed admission. Recover proved prior effects under original terms and current disclosure; no processing-time clock.

**Due-target independence.** Requested-by targets remain nonauthorizing under Q09. Missing/past/changed targets SHALL NOT silently change this period. A later target must be surfaced as a possible timing mismatch, not represented as permission beyond access or turned into a universal target-only rejection rule.

**Prospective exact adoption.** Apply the profile only to explicitly bound new ordinary effects. Preserve valid existing/specialized terms. Map Workflow's fourteen-day suggestion to its actual source/credential scope and explicitly amend any conflicting ordinary-source clause during authorized publication. Do not silently relabel or extend old rights, import renewal or change other-purpose settings.

**Short technical capabilities.** Entry credentials, proof/sessions, provider URLs, worker leases and caches SHALL keep their independently qualified shorter limits/current checks. Do not mint a sixty-day bearer/session capability or remove Q01 assurance because the source period is longer.

**Structural authorization.** Preserve sole P12 resolver, exact native participant integration, coarse tenant RLS and required grant mutation boundary. Trusted actor/tenant/recipient/source/policy/time/approval attribution SHALL be server-derived or validated at its authoritative boundary; same-scope constraints and effective old/new-row enforcement SHALL prevent forbidden state transformations on every path.

**Every private use.** Current source stage, exact recipient/action/representation authority and applicable end SHALL protect metadata/history/counts/search/replay and full/HEAD/range/conditional/resume/stream paths. A future nominal timestamp or stale successful cache SHALL NOT authorize access; preserve inherited tiered audit and stream/revocation rules.

**Durable expiry enforcement.** Source expiry SHALL not depend on a single long process/browser timer, cleanup sweep or provider TTL. Persisted ends/current permission remain authoritative. Durable wakes and projections SHALL be bounded, replay-safe and stage-aware; early/stale/late execution cannot revoke valid completed access, prolong ended rights or delete evidence.

**Truthful UX.** Show actual applicable end/zone/precision, separate Requested by, next actor, received/review state and permitted actions in the existing source context. Explain prospectively that completed access has its own end and can end sooner. No full-sixty-day promise, forced download, extra timer ceremony or recipient blame for review.

**Accessible recovery.** Qualify actual timing/authentication/status/mobile/AT journeys. Proof/observer outages fail closed for affected actions without false source-expiry/rejection/deletion claims. Preserve confirmed work and other independently authorized actions; no countdown/tooltip/color/toast-only essential information.

**Retention and minimization.** This access period SHALL not determine evidence retention, holds, deletion/anonymization, backups or independent file uses. Preserve required original/adverse provenance under owned records rules; general telemetry and support surfaces SHALL not expose credentials, private files or unnecessary sensitive identity details.

**Lifecycle and help authority.** Contact/recipient/host changes, issuer-dependency changes, new work, reopening, active-expiry recovery and Q08 fresh access SHALL follow their exact owner procedures. A selected count creates no new grant/edit power or email-attachment bypass. Help must be accountable without promising unselected remedies.

**Bounded costs and dependencies.** Preserve existing source/worker/storage interfaces and P12 R6 governance-read/mutation-fence contracts. Qualify query/page/lock/latency/egress/retry budgets and provider limits. No new global serialization beyond owner-required fences, unbounded scans, long-lived resident process/browser timer per request or second scheduling/permission platform. Bounded durable wakes in the existing qualified substrate remain allowed.

**Durable evidence.** Authorized history SHALL explain original profile/issuance/result, genuine restrictions, receipts, source completion and recovery separately from delivery/engagement logs. Do not infer reading, receipt, human intent or current access from provider events; source effect identity must survive provider dedupe expiry.

**Compatible migration and restore.** Version/bind profiles prospectively and prove mixed readers/writers/workers, policy changes, restore, stop and rollback/roll-forward. Do not backfill unknown issuance from tasks/emails, replace old ends with sixty days, lose later restrictions or run old calendar/stage semantics on new effects.

**Qualification and trace.** The sixty-day choice is product judgment. Before activation, prove actual remaining opportunity under caps for intended recipient/reviewer/help cohorts plus real-role/time/race/provider/browser/AT outcomes. Trace Q12 through existing glossary, ADR, authorized owner/generated OpenSpec, tasks/tickets and release evidence. Unknown numeric service budgets or unusable cohorts are gates, not “monitor later.”

- **AC29-A12-01:** The ordinary nominal original unfinished end is actual Q11 issuance plus exactly1,440 elapsed hours (5,184,000 seconds), not a calendar-day or first-open calculation.
- **AC29-A12-02:** Up to sixty days permits only actual applicable earlier limits/current restrictions; it does not expose sender/tenant discretion from zero to sixty or minimize unrelated dates.
- **AC29-A12-03:** Eligible timely fulfillment uses the distinct at-most720-hour completed stage, which may end before or after the original unfinished end according to its actual occurrence and limits.
- **AC29-A12-04:** Precision/range/offset/leap/DST display and immediately-before/at/after checks preserve elapsed-time authority; invalid, nonfinite or overflowed values never become a default.
- **AC29-A12-05:** Shorter proof/session/credential expiry uses qualified recovery within the source period and never becomes a competing undocumented request-access clock.
- **AC29-A12-06:** Existing admissions retain proved terms during migration; no legacy task/email/URL infers a sixty-day grant, and expiry neither deletes evidence nor releases independent holds.

## REQ29-A13 — Source-authorized fresh unfinished-request access

**Story US29-A13:** As an authorized source staff member, I want to give the same recipient fresh bounded access to remaining work, so that expired collection can continue under a new qualified decision.

**Decision basis:** Q13, complete incorporated source clauses and current explicit later refinements; REQ29-P01–P18. Exact paragraph, clause, proof and journey locators are mapped individually.

Fresh unfinished access MUST be a deliberate prospective source admission for the same intended recipient, request and continuing original purpose; it MUST NOT edit the ended grant, reopen completed work, confer membership or authorize general storage.

The source MUST prove original lawful admission and eligible ordinary unfinished expiry; unknown, adverse, binding-shortened, cancelled or independently prohibited states MUST NOT be relabeled ordinary expiry, including after an adverse cause is removed. Each limit retains its actual action/stage/purpose scope.

Original issuance/results, expired ends, receipt/acceptance facts and adverse history MUST remain attributable and unchanged. Previously admitted outcomes MUST be recovered on their original lineage, with current disclosure checks.

Fresh issuance MUST use the exact current source capability and P12 administrative scope/live assignable ceiling, qualified grant type and continuing issuer/delegation dependencies through the sole owning mutation boundary; read/review/support authority or a role name MUST NOT substitute.

Tenant, principal, actor, intended recipient/revision, source and authoritative timestamps/status MUST derive from trusted context and source facts; client selectors MUST be independently resolved. Current qualified Q01 proof MUST precede recipient use and MUST NOT create broader membership or source authority.

Reviewed requirement/action scope MUST be bounded by original admitted purpose/requirement lineage and current eligibility. Eligible pending work MAY admit new first submissions or immutable Q03 successors; accepted/frozen writes, new requirements/purposes/recipients and historical-byte access MUST remain excluded from this lane.

Read, submission and correction rights MUST be explicit and distinct. The fresh terms MUST declare eligible completed-read scope; completion MUST resolve current own-submission members within that scope without deriving reading from writing, unioning expired grants or widening a reviewed subset. Independently permitted accepted-file reading MUST NOT be prohibited merely because writes are frozen.

Fresh admission MUST have proved prospective causal authority at its source effect boundary. Completion-before-admission and gap completion MUST NOT obtain backfilled eligibility. A source-qualified atomic admission then fulfillment MAY qualify; equal timestamps alone MUST establish neither permission nor rejection.

The owner MUST apply Q14's source-issued up-to720-elapsed-hour period, including unused access, and Q15's individually reviewed nonoverlapping sequential admissions without a preset lifetime/cumulative cap. Resolved first-admission outputs MUST be preserved on retries. Missing policy MUST NOT mean infinity, automatic sixty days, one-use lifetime or any unselected renewal rule.

One eligible normal fulfillment during valid fresh unfinished authority MUST stop ordinary writes and MAY admit the declared completed view under Q07: end no later than F plus 720 elapsed hours and genuine applicable caps. Stage-only ends MUST NOT become overall caps; observation/retry/reopen MUST NOT reset F/end. Further Q08 eligibility MUST NOT be widened without an explicit compatible owner decision.

Issuance, relevant grant-state changes, requirement/correction/acceptance and fulfillment MUST satisfy the owners' coherent serialization/fence contract with current authority/state/time rechecked after waits. Use required P12 grant mutation fencing; providers MUST NOT run under source locks, and scheduling concurrency MUST NOT substitute for database invariants.

One deliberate fresh effect MUST have a stable business identity, bound material reviewed input and immutable admitted outputs. Same-effect retries MUST converge; incompatible material input MUST conflict; distinct intentional issuances MUST satisfy adopted repetition/overlap atomically. Current private replay disclosure MUST be independently authorized.

Source effect, required attributable audit and durable follow-up intent MUST have a coherent commit/recovery outcome. Unknown commitment MUST be reconciled before another issuance; grant, usability, proof, delivery and entry facts MUST remain distinct. Closing a dispatched UI MUST NOT be represented as cancellation.

An unadmitted operation bound to ended authority MUST NOT silently acquire a fresh grant on retry, upload completion, callback or worker execution. A new currently authorized deliberate submission MAY reuse exact qualified custody only under the source contract, preserving real receipt timing, scan/acceptance state and immutable Q03 lineage. An ambiguous finalization response MUST NOT alone trigger deletion of potentially admitted bytes; use existing source reconciliation and custody/retention rules.

Data constraints and the sole source command MUST enforce same-tenant source/recipient/requirement/effect relationships, required provenance, finite resolved time ordering and valid state combinations. Historical grant/receipt/acceptance meaning MUST NOT be rewritten by general UPDATE/upsert/cascade. Unknown unresolved facts MUST be explicit, not permissive null/default values; owner retention/disposal remains separate.

Qualification MUST cover effective table/column/function grants, RLS old/new-row checks, composed policies, views, RPC/storage and privileged service/definer/job paths. A permitted mutation MUST NOT move a row into another tenant, recipient, scope or forbidden state. Coarse RLS MUST NOT replace P12/source checks, and omission of a literal WITH CHECK clause alone MUST NOT be called a vulnerability.

Every private metadata/byte door, including history, count/order, preview, original, HEAD/range/resume/cache/replay and active serving, MUST enforce Q04/Q05 current exact authority. Cache invalidation MUST NOT be the permission fence. An expired credential/provider URL MUST NOT revive or borrow fresh rights. Delivery/custody timestamps MUST NOT manufacture source admission; no claim may promise recall of disclosed bytes.

Staff MUST use one meaningful review of source-bound recipient, action/requirement/read scope and qualified timing/limits, with refreshed review for material changes. The existing request UI MUST preserve receipt truth and clear next actors; ordinary time advance MUST NOT cause another confirmation. No new arbitrary recipient/date picker, mandatory essay or universal extra approver is required.

Recipient entry/help/status MUST disclose only currently authorized facts. Successful qualified source issuance resolves its end under Q14; commitment does not establish current recipient usability, proof or notification. Use accessible localized actual state/terms, qualified proof reuse, keyboard/focus/status and mobile/low-bandwidth recovery; no forced account/download, unnecessary reupload, insecure attachment fallback or automatic communication follows.

Durable source/security history MUST distinguish original expiry, fresh review/admission, scope/timing provenance, issuer, actual outcome and later correction/revocation from technical logs and Q05 participant history. Correlation and diagnosis MUST use minimal protected identifiers; credentials, file bodies and sensitive location/care content MUST NOT leak to logs, analytics, URLs or unsupported export.

Use bounded indexed source work, pagination, tenant fairness and the owner's existing read/audit budgets; P12 R6's logical bound MUST apply at its governed-read scope. Declare and prove actual capacity/latency/reconciliation limits before activation. No unbounded history scan, resident long timer, new global lock beyond owner-required fences or second scheduler/permission platform is warranted.

Adopt prospectively with explicit old/new producer/reader/worker compatibility, dark outward backfill, exact activation lineage and gates before issuance. Old data MUST NOT be promoted from guessed history. Restore/rollback MUST preserve current adverse facts and prevent old authority replay; an old binary unable to honor new semantics MUST NOT serve the affected path.

Trace Q13 selection, reviewed amendments and eventual ratification separately through the glossary/ADR and later authorized owner/OpenSpec/design/task/issue/test/release artifacts. Activation MUST require the proof groups below; adjacent tests, static docs and comparator screenshots MUST NOT be presented as native feature qualification.

Implementation MUST reuse Core's source, Auth/P12, custody, serving, outbox and shared UI boundaries. No new policy engine, general drive, duplicate-request workaround, custom retention scheme, pre-expiry extension, automatic notification or silent Q08 expansion may be inferred. Open product policies MUST be resolved explicitly rather than frozen as incidental implementation defaults.

Q14/Q15 settle unfinished duration and repetition; Q16–Q19 separately settle later completed reading. Fresh unfinished permission never automatically issues a fresh completed grant.

- **AC29-A13-01:** Only the same intended recipient/purpose with lawful original admission and relevant ordinary unfinished expiry can receive a fresh period while work remains genuinely unfinished; cancellation, fulfillment and adverse endings are not ordinary expiry.
- **AC29-A13-02:** The issuer has exact current source issuance/admin scope and live assignable ceiling. Read access, reviewer assignment, generic staff status or knowledge of an address grants no issuance power.
- **AC29-A13-03:** The reviewed subset stays within admitted requirement/purpose lineage and current eligibility, including only explicitly qualified later additions/revisions; it neither unions expired rights nor grants another recipient.
- **AC29-A13-04:** Q14 fixes the finite fresh period and Q15 governs sequential nonoverlap. Missing actual native/source qualification denies issuance without inventing duration or cardinality.
- **AC29-A13-05:** Eligible normal fulfillment during fresh authority can admit the declared completed view; F after expiry cannot revive recipient rights, and fresh completed reading remains a separate Q16–Q19 decision.
- **AC29-A13-06:** The original fresh effect, material intent and admitted end survive retries and later changes; current disclosure is separate, and failed proof/mail/preview does not justify a cloned request.

## REQ29-A14 — Thirty-day fresh unfinished-request access

**Story US29-A14:** As an intended recipient, I want to receive the fixed thirty-day fresh unfinished period, so that unused time and delayed delivery do not create another clock.

**Decision basis:** Q14, complete incorporated source clauses and current explicit later refinements; REQ29-P01–P18. Exact paragraph, clause, proof and journey locators are mapped individually.

A newly admitted standard Fresh Unfinished Request Access MUST resolve its nominal unfinished end from the qualified fresh source issuance occurrence G plus exactly 720 elapsed hours. Successful source issuance MUST durably preserve its actual finite end and calculation/limit provenance with the source effect. Click, message, credential, first visit, mutable task date and observer time MUST NOT substitute for G.

The same end MUST bound never-entered access. This profile MUST NOT include an enter-by substage, first-entry business activation, pause, grace or activity reset. Retry MUST recover the same deliberate source effect and original outputs before any new calculation; changed output timestamps MUST NOT be treated as new material intent.

“Up to” MUST preserve genuine scoped earlier limits, binding shortening and current restrictions, not create a sender/tenant duration menu. Per-action/file/credential/retention dates MUST NOT become whole-stage limits by indiscriminate minimum calculation. Missing, invalid, nonfinite or already-ended live terms MUST NOT default to a new period.

Q13's eligible completion and declared read scope MUST remain separate: actual eligible F during valid authority stops writes and can admit an end no later than F plus Q07's independent 720 elapsed hours under genuine caps. No max(U,E), stale unfinished cap, retrospective eligibility or clock reset is permitted. The derived one-admission less-than-sixty-day result MUST NOT become a new overall/retention/repetition rule.

The existing request context MUST show the actual relevant end, source status and next actor after authorization, with Requested by separate. Successful issuance has a resolved end; inability to retrieve it is uncertainty/error, not ordinary awaiting-entry activation. Use one meaningful staff review/action, truthful proof/delivery/receipt/review states, accessible localized main-content timing and safe recovery; no unnecessary reupload or new account/confirmation/download step.

Reuse the Q13 source mutation/current-use and durable follow-up boundaries. Enforce supported instant/precision/range/unit semantics and qualified post-wait checks; do not use a client countdown, stale cache, a time-dependent CHECK alone, or one thirty-day resident timer as authority. Existing bounded durable wakes and owner-required fences remain allowed; no new timer service or numeric framework is required.

Adopt the standard profile prospectively through the exact source/owner binding and declared projections. Preserve existing admitted ends and specialized policies. Resolve Workflow fourteen-day wording at its actual credential/source scope, not by a global replacement. Required owner/design/test/release trace MUST distinguish selection, ratification, publication and qualification.

Q13's tenant/issuer/recipient, schema/RLS/service, immutable lineage, all-path private serving, audit, retention and rollout safeguards MUST remain binding without a parallel implementation. This profile resolves C09's timing/activation/unused reservation and specializes C19: successful source issuance resolves its end but does not establish recipient usability, proof or delivery. P13 MUST NOT require a first-entry substage; P19's shortening case MUST use actual narrower completed restrictions for this equal-duration profile. Qualify the focused and applicable inherited proofs; preserve dated Q13 records and trace this specialization. No duration editor, policy dashboard, additional state machine, reminder program or first-entry mechanism follows. Q15 governs unfinished repetition/nonoverlap; Q16–Q19 independently govern completed reading and Q20 its optional fresh-access notice. They are explicit later selections, not defaults inferred from this interval.

- **AC29-A14-01:** Fresh unfinished issuance fixes its nominal end at exactly720 elapsed hours later, limited only by actual applicable earlier caps/current restrictions.
- **AC29-A14-02:** The same end applies to unused access; first entry, resends, browser activity, pause, grace or an enter-by stage cannot add time.
- **AC29-A14-03:** Actual eligible fulfillment before that exclusive end can admit the separately bounded completed-read scope; it closes ordinary writes without resetting the original fresh period.
- **AC29-A14-04:** With equal uncapped thirty-day fresh/completed intervals, fulfillment on fresh day five ends completed reading on day35 and day29 on day59; an earlier final end requires a real narrower restriction.
- **AC29-A14-05:** Grant access to continue shows actual localized terms and resulting end without a separate timer-start ritual, mandatory email or a first-entry activation state.
- **AC29-A14-06:** Q15 repetition/nonoverlap and Q16–Q20 completed reading/notice contracts apply independently; their rules are not guessed from the chosen interval.

## REQ29-A15 — Sequential fresh unfinished-request access

**Story US29-A15:** As an authorized source staff member, I want to review another fresh unfinished period after eligible expiry, so that continuing work is possible without overlap or automatic renewal.

**Decision basis:** Q15, complete incorporated source clauses and current explicit later refinements; REQ29-P01–P18. Exact paragraph, clause, proof and journey locators are mapped individually.

The standard lane MAY admit further separately reviewed fresh periods after eligible ordinary expiry. Every period MUST retain Q14's fixed up-to-720-hour source-issued terms. No preset lifetime grant-count or cumulative-day ceiling is added; genuine source-specific limits remain binding. No automatic renewal, pre-expiry extension, future reservation or mandatory cooldown follows. Finite periods MUST NOT be represented as a finite aggregate lifetime or a right to future approval.

First fresh admission MUST retain original lawful-admission/ordinary-expiry proof. Every later one MUST also prove its relevant preceding fresh outcome, actual ending cause and current source lineage; an ancient original expiry, technical failure or incomplete history MUST NOT suffice. Current original purpose and a legitimate need for recipient access MUST exist. Source completion, adverse endings and genuine limits MUST retain their meaning and scope, including coincident nominal ends and removed adverse causes.

The same tenant/request/intended-recipient/original-admission lineage MUST have no overlapping valid unfinished fresh admissions, including disjoint subsets. The owning source/P12 mutation boundary MUST atomically qualify predecessor/material review state, absence of overlapping authority and current predicates after relevant waits. A stale unadmitted intent MUST NOT silently advance to an intervening predecessor; material changes require current review. Ordinary time advance alone MUST NOT cause a second confirmation. Existing qualified fences or equivalent constrained transactions MUST cover no-row and distinct-intent races; a disabled button, per-key lock, lease or sweep alone does not suffice.

An already committed matching deliberate intent MUST recover its exact original effect and immutable outputs under current disclosure before its old predecessor is treated as a new-action conflict. Recovery MUST NOT return the latest grant as the original result or present expired historical success as current permission. Unknown commitment/lookup MUST be reconciled, not treated as no effect. Failed delivery or post-commit error MUST NOT erase an admission. Unadmitted old commands MUST NOT borrow later authority; source effect, required audit and durable follow-up retain coherent recovery.

Each newly reviewed scope MUST remain within original admitted purpose/requirements and current eligibility, with separate write/current-read/completed-read scope. Expired scopes MUST NOT be unioned; a prior narrow subset alone MUST NOT become an invented permanent global restriction. Binding restrictions and independent rights retain their actual scope. Q13/Q07 completion, qualified atomic admission/fulfillment and delayed recovery MUST remain unchanged; no completed-source reopening, gap backfill, acceptance reversal or Q08 expansion follows.

Use the existing request context and one meaningful Grant access to continue review/action. Show authorized prior outcome, current need/subset, actual admitted end and next actor, keeping operation result, current usability, proof and delivery distinct. Independent staff review MUST NOT require recipient regrant or unnecessary reupload. Qualify the shared accessible mobile/low-bandwidth journey and truthful recovery. No new counter/date editor, extra account, mandatory essay, routine second approval, renewal hub or automatic reminder is required.

Preserve trusted same-tenant/source/recipient/predecessor relationships, semantic uniqueness, immutable attribution/outcomes and effective old/new-row and privileged-path authorization through Q13's existing data boundary. Use bounded indexed current-state and paginated historical access; no full-lineage scan on every issue/read or second write authority. Required historical/replay evidence, source audit and later adverse facts MUST survive supported recovery/restore; retention/holds remain separately owned and MUST NOT reset on regrant. Missing proof MUST NOT default to empty/new lineage.

Adopt prospectively with explicit trace: specialize Q13-C02/P01 for subsequent expiry and resolve Q13-C09/C12/P11 plus Q14-C08/P16's repeat-policy reservation for this standard lane. Preserve the remaining Q13/Q14 controls, source-specific policies, compatible old/new behavior and native qualification gates. Update authorized source-owner text and declared projections together; keep dated records as provenance. No quota, cooldown, scheduled approval, new framework, retention rule, duplicate-request bypass or silent Q08 decision may be introduced as an implementation default.

- **AC29-A15-01:** Another fresh unfinished period requires the relevant predecessor’s ordinary expiry and actual current unfinished need; an ancient expired root or missing history cannot bypass a later active/adverse admission.
- **AC29-A15-02:** Individually reviewed sequential periods have no preset lifetime count, cumulative-time cap or mandatory waiting gap, but cannot overlap within the exact context, even for disjoint subsets.
- **AC29-A15-03:** A valid period is not ended merely to make space for another. Legitimate adverse revocation remains distinct from ordinary expiry and is not relabeled after its cause is removed.
- **AC29-A15-04:** Each new reviewed subset uses original lineage and current eligibility; a previously narrow grant is not an invented permanent ceiling and prior grants are not unioned.
- **AC29-A15-05:** An old matching retry returns its original effect/end without substituting the newest grant or reviving old rights; a genuine later deliberate issuance has a separate qualified identity.
- **AC29-A15-06:** The interface distinguishes existing valid access that can be repaired from eligible expired access that may receive a new grant, with no automatic renewal or guaranteed future approval.

## REQ29-A16 — Fresh read recovery after either valid completed admission

**Story US29-A16:** As an authorized source staff member, I want to grant fresh reading after either lawful completed-view origin, so that recovery is consistent without widening the original scope.

**Decision basis:** Q16, complete incorporated source clauses and current explicit later refinements; REQ29-P01–P18. Exact paragraph, clause, proof and journey locators are mapped individually.

**/C03/C05–C22; applicable P01–P28.** Current issuance administration, recipient proof, read-only scope, coherent effects, all-path serving, rollout and qualification remain binding. C06 still requires a complete finite fresh timing/repeat policy before activation.

Q08 consideration MAY include eligible ordinary expiry of either the original ordinary completed admission or a completed admission actually established by lawful normal fulfillment under valid Q13/Q15 fresh unfinished authority. The source MUST prove the exact recipient/request lineage, causal admission, historical policy/scope/end and actual expiry. Generic completion, retained bytes, client origin flags, first-observed dates or what current policy would have allowed MUST NOT manufacture a historical admission.

Every new reviewed read scope MUST be bounded by the actual fulfillment-created completed admission's exact member/original-version/action/Q05-context ceiling, current eligibility and the approved subset. Original unfinished requirements, write rights, later files and unions of grants MUST NOT widen it. A later narrower Q08 subset alone MUST NOT redefine the ceiling; the narrow completed admission itself and genuine binding restrictions remain authoritative. The ceiling limits permission, not a frozen copy of current display facts.

Preserve original fulfillment, admitted ends, receipt/correction/acceptance facts and adverse history. Gap/no-admission cases MUST NOT acquire a first completed view retrospectively. Qualified recovery of a real timely admission MUST preserve its original facts, not reset time. Ordinary expiry MUST NOT hide revocation, binding shortening, purpose/content-use limits, disposal or coincident restrictions. An active grant with a proof/representation failure requires the appropriate existing recovery, not fabricated expiry.

Historical admission MUST NOT require prior visit, download or successful rendering. Deliberately admitted status/context-only scope MAY remain eligible only for those permitted actions; it MUST NOT become file access or a silent fallback success. Qualified representation repair MUST NOT add a member, substitute/add an authorized submitted-original version or grant a new read action; a new qualified rendition revision of the same admitted original remains allowed under its owner contract. Unknown root/expiry/current authority MUST close the affected action; independently proved eligible subsets or source work MUST NOT be blocked merely by an unrelated unavailable subview. Material scope reduction requires a truthful current review.

The existing Q08/source/P12 boundary MUST revalidate exact current issuer administration, recipient, purpose, reviewed scope, restrictions and qualified timing after relevant waits; recipient use requires current proof and every-door authorization. Bind stable intent to the exact historical admission and material terms, preserve coherent effect/audit/follow-up recovery and authorize private replay separately. Stale or changed root/scope input MUST NOT be repaired by widening, returning a different grant or creating a new intent automatically. Historical success MUST NOT imply present usability or notification.

Reuse the intended Grant read access action and completed-request experience for both origins. Show source-authorized scope, adopted finite terms, actual state/end when the chosen rule resolves it and a clear next action; administration MUST NOT require unauthorized file-body access. Preserve accessible proof/focus/status, localized and mobile/low-bandwidth recovery. No route picker, extra account, routine second confirmation, mandatory essay, reupload, intake/correction control, automatic message or new portal is required.

Preserve trusted same-scope root/member/effect relationships, immutable historical meaning and effective grants/RLS/privileged-path enforcement under Q08. Use bounded indexed baseline/member reads and authorized pagination; no full historical replay, inferred broad default or separate write authority. Prospective migration, mixed versions and restore MUST prove original eligibility and preserve later adverse facts; missing historic proof is not permission to backfill rights. Retention/holds/disposal and source completion MUST NOT reset on regrant.

Explicitly specialize Q08-C01/C04/P02/P05 and close only the Q13/Q14/Q15 reservation for this additional completed-admission origin. Apply Q17–Q19's fixed fresh source issuance, up-to720-elapsed-hour interval including unused access, and separately reviewed nonoverlapping sequential periods; exact authority qualification remains mandatory. Q07/Q14's thirty days and Q15's unfinished repetition policy MUST NOT become defaults. Missing policy MUST prevent issuance, not create a valid grant with terms invented later. Reconcile current owner text and declared projections at authorized integration; preserve dated history and applicable inherited proof. No new permission framework or other lane expansion follows.

The earlier timing/repetition reservations are resolved by Q17–Q19. Their exact current source-qualified terms apply to both lawful completed origins; no old grant is revived.

- **AC29-A16-01:** Both a completed view earned during original unfinished access and one earned during qualified fresh unfinished access can serve as a lawful fresh completed-read root.
- **AC29-A16-02:** An independent late completion with no eligible historical completed-view admission does not become a root merely because the business request is now fulfilled.
- **AC29-A16-03:** The root’s exact received-version/action/participant-history ceiling remains fixed; new later content, other persons and superseded bytes are not admitted by this recovery.
- **AC29-A16-04:** Q17–Q19 supply fixed issuance timing, the up-to720-hour profile and sequential nonoverlap; neither Q15 unfinished repetition nor Q07’s original interval is imported by analogy.
- **AC29-A16-05:** Current issuer/recipient/type dependencies and independent content rights govern each act; expired old recipient access is not itself a prerequisite for staff to review a new authorized grant.
- **AC29-A16-06:** The recipient sees one understandable completed-reading context and capable recovery, without an origin selector, extra account, forced reupload or staff-body-read escalation.

## REQ29-A17 — Fix fresh completed-read deadline at source issuance

**Story US29-A17:** As an authorized source staff member, I want to issue fresh completed reading with its end fixed at issuance, so that first entry and retries cannot shift the deadline.

**Decision basis:** Q17, complete incorporated source clauses and current explicit later refinements; REQ29-P01–P18. Exact paragraph, clause, proof and journey locators are mapped individually.

For the standard Q08 profile across both Q16 origins, qualified fresh source issuance MUST durably resolve and preserve one finite read end with its calculation/limit provenance. The same end MUST bound unused access; no separate first-entry activation/reading clock is selected. The event MUST be the new Q08 admission, not original issuance/fulfillment, a click, preliminary approval, credential, delivery, visit or observation. Q17 selects no numeric duration, units or formula.

Reviewed material input MUST remain bound to one stable deliberate issuance intent, distinct from source-generated occurrence/end outputs. Recover a matching committed effect before any fresh calculation. Retries, new transport keys, resends, proof/session renewal, visits and representation repair MUST NOT reset the end. Conflicting reuse MUST NOT silently replace intent or terms. Missing/unreadable required timing MUST trigger safe reconciliation, not a guessed end, open-ended success or first-entry-pending state.

Preserve the admitted end, original completion/submission history and genuine later limitations with their actual scope. Fixed expiry MUST NOT override current restrictions; a member/action-only limit MUST NOT automatically end unrelated permitted work. The predecessor's ordinary ended period MUST NOT be reused as the new grant's cap, while real continuing overall/purpose limits remain binding. Temporary proof/representation failure MUST NOT alone become permanent shortening, and removal of a genuine shortening cause MUST NOT silently extend the admission. Retention/disposal and delivered copies remain separately owned.

Use the existing source/P12 mutation and current-use boundaries. Qualify trusted occurrence, current issuer/recipient/purpose/scope/limit checks after relevant waits, exclusive-end behavior, deadline-spanning operations and concurrent adverse changes. Required admission/effect/provenance/audit and authorized follow-up MUST commit coherently or use the existing fail-closed recovery contract. No timestamp, early check, worker lease or provider outcome alone proves this contract; no provider call belongs under the source lock. Historical replay MUST require current disclosure and MUST NOT imply current usability or a new grant.

Effective data constraints/grants/RLS and every direct/RPC/view/function/definer/service/job/storage path MUST preserve exact tenant/environment/source/recipient/member/effect binding, semantic uniqueness, finite valid terms, trusted attribution and immutable historical meaning. An allowed mutation MUST NOT retarget, widen or extend a grant. Protected metadata and byte-serving paths MUST enforce current scope/end and inherited cache/range/stream fences; expiry MUST NOT depend on a browser, punctual sweep or signed URL lifetime.

Reuse one Grant read access action and the existing completed context. Review stable terms/known limits and label estimates before issuance; show the actual admitted end and relevant scoped earlier limits after a qualified result. Distinguish issuance, current usability, proof, representation, notification and uncertainty. A known unsupported handoff MUST NOT be called ready; late discovery consumes the fixed period. Preserve accessible, localized and mobile/low-bandwidth recovery without new account, timer/mode selector, routine second confirmation, reupload, automatic message or promise of another grant.

Apply the profile prospectively through qualified owners and compatible readers/writers/jobs. Preserve original effects and later restrictions through policy changes, migration and restore; do not backfill timing from tasks/emails or recompute missing historical ends using current defaults. Use bounded indexed current proof, authorized pagination and existing operational budgets. Diagnose timing failures through protected source/business/audit evidence without leaking credentials, file contents or sensitive recipient context. No new timer/permission service or permanent browser archive is required.

Explicitly specialize Q08-C06's anchor/activation/unused model, Q08-C07/P17's end-resolution behavior and the corresponding Q16-C06/C08 display/model references: successful new issuance resolves the finite end; observation failure does not create deferred activation. Preserve Q08-C14/P14 and all other applicable gates. Q18 supplies the exact numeric/calculation profile and Q19 the repeat/nonoverlap/cumulative rule; exact native qualification MUST be proved before activation. Q07/Q14/Q15 values/rules, arbitrary dates, future scheduling, pauses, grace, automatic renewal or another completed stage MUST NOT be inferred. Reconcile current owners and declared projections at authorized publication while preserving dated history.

Q18 resolves the numerical profile and Q19 the sequential/nonoverlap profile. Preserve exact precision and original source result versus current permission.

- **AC29-A17-01:** Fresh completed-read source issuance establishes the actual finite end; delivery, confirmation and first reading cannot defer or restart it.
- **AC29-A17-02:** Unused access is governed by the same admitted end, with no enter-by substage, pause or scheduled business activation hidden behind an issued result.
- **AC29-A17-03:** Unchanged reviewed terms tolerate ordinary time progression; material changes require refreshed review, and the final source occurrence/end is resolved after waits.
- **AC29-A17-04:** Unknown commitment recovers the original result; a known grant with failed observation remains committed rather than becoming a new deferred-start grant.
- **AC29-A17-05:** Q18 supplies the exact interval and Q19 the sequential/nonoverlap rule; invalid current source/type/finite-bound proof blocks issuance without new arbitrary values.
- **AC29-A17-06:** The UI distinguishes pre-issuance terms/estimates from the authoritative admitted end, while current proof and disclosure remain independently required.

## REQ29-A18 — Thirty elapsed days for fresh completed-read access

**Story US29-A18:** As an intended recipient, I want to understand the fixed thirty-day fresh completed-read period, so that I have clear timing without an implied perpetual archive.

**Decision basis:** Q18, complete incorporated source clauses and current explicit later refinements; REQ29-P01–P18. Exact paragraph, clause, proof and journey locators are mapped individually.

For the standard Q08 Fresh Completed Request Access profile across both Q16 eligible origins, the nominal read end is Q17's qualified new source issuance occurrence plus exactly **720 elapsed hours (2,592,000 seconds)**. One elapsed day means twenty-four hours. Preserve the actual admitted end and material policy/limit provenance as original source outputs. The same end applies when access is never used. No calendar month, civil-day increment, local midnight, business day, first-entry interval or staff date menu substitutes for this rule.

Apply genuine earlier limits at their actual scope. “Up to” does not guarantee a minimum usable period or authorize arbitrary duration selection. Grant-wide limits can shorten the period; member/action-only restrictions cannot end unrelated permitted actions. Ordinary predecessor expiry is historical, not a fresh cap. Continuing purpose/overall prohibitions and later real shortening remain binding; clearing a shortening cause cannot silently extend this same admission. Technical proof or representation failure is not itself permanent shortening. One grant end does not promise that every file remains available.

Recover a matching committed semantic source effect before calculating another end. Preserve its original occurrence, end and material provenance through retries, changed defaults, new transport identifiers, late observations, delivery retries, proof/session renewal and representation repair. Missing or unreadable required timing calls for safe source reconciliation, not now-plus-thirty, guessed nonexistence or activation pending. A historical expired result remains history under current disclosure; it creates no usable period. Conflicting material intent cannot manufacture a replacement effect.

Reuse Q17 source/P12 currentness and causal ordering, including relevant waits, races and operations that cross an exclusive end. Validate trusted required finite instants, units, supported range and precision. Whole-second duration units do not permit truncating the source occurrence or silently changing the admitted end. Effective constraints, tenant-aware relationships, attribution, semantic uniqueness, old/resulting-row RLS and privileged paths must preserve exact scope and immutable original results. No allowed update, upsert or parent mutation can widen or retarget this permission.

Apply current authority and the actual end at every protected metadata and byte-serving boundary. Correctness must survive process restarts, delayed workers and failed invalidation; it cannot rely on a browser clock, provider URL lifetime, cleanup sweep or one thirty-day Node timer. Reuse bounded indexed checks and existing recovery mechanisms. Starting a download before expiry does not authorize unlimited future serving; bytes already received cannot be recalled by online expiry.

Keep the existing **Grant read access** action and completed read-only context. Staff review the standard and material known limits once; label estimates until the source returns the actual result. Then show **Read-only access ends [date, time and zone]**, with current permitted actions and material earlier scoped limits where disclosure is allowed. Late arrival gets the real remainder; unused access shares the same end. Distinguish source expiry, proof/session failure, unavailable content, delivery failure and unknown issuance. Provide clear recovery in the same context, retaining shared Base UI/base-maia, accessible status/focus/authentication and mobile/low-bandwidth behavior. Shorter actual grant, proof and session timers require their own accessibility qualification. Add no extra account, duration picker, routine confirmation, forced download/reupload, automatic message or promise of another grant.

Apply this profile prospectively to its exact qualified source cohort. Mixed versions, policy changes, migration and restore must preserve prior effects, ends and later restrictions. No invented date backfill or broad fallback is allowed. Preserve Q16's exact completed member/submitted-original-version/ action/context ceiling, original fulfillment/receipts/corrections, immutable originals, retention/holds/disposal and independent domain ownership. Equal thirty-day values in other policies do not make them the same policy or create another completed stage. Asym remains a contextual use/production system for relevant files, not a personal drive.

Q19 permits individually reviewed sequential completed-read periods without a preset lifetime count or cumulative-time ceiling, overlap or automatic renewal. Earlier unselected-repeat text is historical only.

**Exact inherited profiles.** These values apply only to the named source/representation and units, never as generic intake limits:

- Nominal duration; 720 hours = 2,592,000 seconds = 2,592,000,000 milliseconds.
- Ordinary Node timer; 2,592,000,000 ms exceeds the documented 2,147,483,647 ms bound; an ordinary oversized delay becomes 1 ms. A shorter fitting timer would still not be durable authorization.

- **AC29-A18-01:** The fresh completed-read nominal end is actual qualified source issuance plus exactly720 elapsed hours, intersected with genuinely applicable earlier limits and current restrictions.
- **AC29-A18-02:** The same end applies to unused access and is exclusive; no calendar-month, first-open, grace, pause, user-selected duration or global retention constant replaces it.
- **AC29-A18-03:** Invalid/null/nonfinite/overflowed or already-ended new-admission terms cannot create a fresh grant; historical ended-effect recovery still preserves its original result.
- **AC29-A18-04:** Locale, timezone and daylight-saving display do not alter elapsed authority. Before/at/after-boundary reads and long waits follow the actual source clock.
- **AC29-A18-05:** Q19 supplies repetition/nonoverlap/cumulative behavior; actual native mapping and current source proof remain gates, without reopening the selected numerical rule.
- **AC29-A18-06:** Current narrowing does not rewrite history or imply that removing an adverse cause restores a longer original grant.
- **AC29-A18-07:** Issued, currently usable, ended/blocked, unused, proof/representation/delivery failure and unknown outcomes remain distinct. Late entry receives only the actual remainder; a status-only response promises neither files nor a fresh interval.

## REQ29-A19 — Sequential fresh completed-read access after expiry

**Story US29-A19:** As an authorized source staff member, I want to review later completed-read admissions after eligible expiry, so that legitimate reading can resume without overlapping rights.

**Decision basis:** Q19, complete incorporated source clauses and current explicit later refinements; REQ29-P01–P18. Exact paragraph, clause, proof and journey locators are mapped individually.

Allow the exact currently source-authorized staff actor to approve another fresh completed-read period after eligible ordinary expiry of the relevant preceding period for the same intended recipient and lawful Q16 completed admission. Preserve original completed proof, relevant predecessor/current lineage, actual ending causes and current purpose/authority. An ancient expired root, a copied request, missing history or no active-row result cannot create eligibility or bypass later adverse facts. Restrictions retain their real scope.

Each new deliberate admission uses Q17/Q18's fixed source-issued period of up to 720 elapsed hours, with the actual earlier-limited end, including unused access. There is no preset lifetime grant-count or cumulative-time ceiling, mandatory waiting gap, automatic renewal, pre-expiry extension or future reservation. No overlapping fresh read periods may exist in the same tenant/ environment/source/request/recipient/original-completed-admission context, including disjoint subsets. Other recipients and independent rights retain their owners. Do not terminate a valid period merely to make room for another. Legitimate revocation/remediation remains source-owned; its adverse ending cannot be relabeled ordinary expiry. No uninterrupted access or later approval is promised.

Each freshly reviewed subset is the original Q16 completed member/submitted- original-version/action/Q05-context ceiling intersected with current eligibility and this review. Do not union previous grants or silently ratchet the ceiling to the last discretionary narrow subset. Genuine binding limits remain. The request stays completed and read-only; fulfillment, receipts, accepted/ frozen evidence, correction lineage, immutable originals, retention/holds/ disposal and independent purposes remain unchanged. Retained files alone are not a sufficient reason for another admission or a personal archive.

Recover a matching committed intent on its exact original lineage and terms, under current disclosure, before applying new-admission rules. A later grant does not replace its historical result. A failed response after admission is still a committed effect; unknown commitment requires reconciliation. Only a confirmed pre-admission failure/rollback establishes no effect. Changed payloads, new transport keys and uncertainty cannot manufacture another approval.

For a genuinely unadmitted intent, revalidate material reviewed predecessor/ source state and exact current issuer capability, administrative scope and live assignable ceiling at the existing source/P12 mutation fence. Atomically enforce the same-context nonoverlap rule across different staff keys, subsets and nonexistent-next-row cases. A stale intent cannot silently advance after an intervening period ends. Do not park an ineligible command for automatic later issuance. Qualified checks after ordinary waits remain; no new browser- click clock or artificial cooldown is introduced. Preserve coherent required effect/audit/follow-up evidence and keep provider work outside source locks.

Protect trusted relationships, required finite state, semantic uniqueness, historical outputs and actor attribution across effective database grants, USING/WITH CHECK, policy composition and direct/view/RPC/definer/service/job/ storage paths. An allowed update/upsert/parent change cannot retarget, widen or reset a period. Each use requires current recipient proof, purpose and scope plus the exact mapped continuing grantor/delegation dependency; do not invent blanket survival or revocation on every issuer role change. An old expired/revoked credential cannot become sufficient by resolving to a newer grant. Compatible proof reuse remains allowed only under its owner contract.

Reuse the existing **Grant read access** action and completed context. Staff review the safe eligible purpose/subset and standard timing terms once, with estimates labeled before confirmed issuance and actual result/end afterward. Material changes require meaningful refresh; ordinary time passing alone does not. Distinguish new issuance, current use, proof, representation, delivery and unknown outcomes. Keep useful safe help, partial/status-only access, localized actual dates/zones, shared Base UI/base-maia and accessible mobile/low-bandwidth recovery. Preserve neutral unqualified responses and protected diagnostics.

Flexibility adds no arbitrary quota, forced account, mandatory essay, routine second approval, date editor, new request queue, renewal dashboard or automatic notification. Existing genuine source requirements remain. Repair still-valid access or perform independently permitted staff work without another grant. Do not clone/reopen a request, force reupload or use an attachment fallback to evade the source. Discretionary later access does not replace applicable accessibility requirements for the current interaction.

Use bounded indexed source-owned current/predecessor/intent proof and authorized paginated history, retaining P12 budgets and documented exceptions. A coherent current relation is not another write authority. Required minimal history follows its owner retention policy; no indefinite private payload log or full chain reconstruction is needed. Mixed versions, import/export, deletion, compaction and restore must preserve original effects/ends, fixed ceiling and later restrictions. No invented root/date backfill or broad fallback. Existing controls can stop unsafe new issuance while preserving history and current serving authority; no rollback may erase a later grant or adverse fact.

- **AC29-A19-01:** Each later fresh completed-read period proves the lawful Q16 root, relevant preceding ordinary expiry/current lineage and current permitted purpose; stale roots and adverse endings cannot bypass newer facts.
- **AC29-A19-02:** Individually reviewed periods may repeat without a preset lifetime count/cumulative-time ceiling or mandatory waiting gap, but cannot overlap within the exact context, including disjoint subsets.
- **AC29-A19-03:** Every reviewed scope stays within the original completed member/version/action/history ceiling intersected with current eligibility; neither unions nor last-grant ratcheting change that ceiling.
- **AC29-A19-04:** No valid current period is terminated to create another; an actual independent revocation or shortening retains its source consequence and cannot become ordinary expiry.
- **AC29-A19-05:** Old matching replay returns original terms and safe current status; it neither creates another period nor presents a newer grant as its own result.
- **AC29-A19-06:** Valid access is repaired through its actual entry/proof/representation route; expired eligible access may be separately considered, with no promised renewal, new archive or wider disclosure.

## REQ29-A20 — Default-on fresh-access email with staff control

**Story US29-A20:** As an authorized source staff member, I want to include or decline the exact fresh-access email during review, so that the recipient is informed without email becoming a permission grant.

**Decision basis:** Q20, complete incorporated source clauses and current explicit later refinements; REQ29-P01–P18. Exact paragraph, clause, proof and journey locators are mapped individually.

**Scope and retained choice.** Apply this optional email choice only to the ordinary native fresh unfinished and fresh completed-read source actions, first or subsequent periods. Keep their purposes distinct. For each genuinely new, known-eligible review initialize the visible choice selected; preserve the actual choice through validation, back navigation and safe draft recovery. Default initialization is not server authorization. Require an explicit valid reviewed choice under the command contract; missing, null, legacy or conflicting values must not default to true. A selected control need not be manually toggled to authorize its visible consequence at deliberate approval. Exclude original invitations, identity messages, reminders, review/fulfillment notices, bulk, other channels, staff alerts and specialist mandatory notices.

**Authority and eligibility.** Treat the choice as a source occurrence condition, never as a per-grant Delivery Plan override, recipient preference, message classification or access permission. Derive tenant/environment, actor, grant/source, intended recipient/address revision, permission and audit attribution from trusted context and qualified owner relationships. The exact Live contract, effective bounded plan, audience, recipient eligibility/suppression, sender/reply and source/action checks must permit the notice. Known unavailable/unknown paths must be explained safely; staff can deliberately choose an otherwise-lawful grant-only path. Do not silently downgrade a confirmed combined intent before admission if material eligibility/destination changes. A provider delay with a valid durable authorized path is distinct from missing authority. After known source commitment preserve that result and report the actual notice state. Q01's closed recipient amendment and specialist narrowing/mandatory rules remain binding.

**Durable effect and exact replay.** Preserve the committed grant, explicit reviewed choice and required communication handoff/recovery evidence coherently at the existing authoritative boundary before claiming the combined operation accepted. No notice can describe an uncommitted grant; a crash between source write and secondary processing must be recoverable from durable exact source evidence. Providers run outside database locks. Recover matching committed work before evaluating new admission. A replay with false must not add a notice after plan/default/readiness changes; changed true/false or other material under a committed identity conflicts. Recovery may complete the already-authorized true notice under its original meaning. P6 exact-set release includes valid zero-member results; unknown compilation is not a valid omission. No replay may append an omitted member. Use permanent source/purpose/recipient communication identity and material equality; do not mistake a transport request key for the business effect.

**Current source and immutable recovery.** Keep all access clocks anchored to their ratified source issuance, with earlier limits; selection, queueing, delivery, opening and credential repair never reset them. Recheck exact source/grant/recipient/contact revision, plan/suppression, sender/reply/connection and protected-action applicability at the governing preparation/submission/use boundaries. A queued unfinished notice after fulfillment needs an exact qualified source/contract applicability or variant; otherwise do not dispatch it. Never rewrite a sealed unfinished notice into completed-read mail. Expired/revoked/no-longer-applicable work cannot advertise current access merely because it was selected earlier. Material changes use only authorized immutable recovery. A new credential, where allowed by ADR-0025, has its required new communication/prepared identity and recovery lineage without a new grant or clock. Old credentials do not resolve authority by finding the newest period.

**Provider truth and safe evidence.** Reuse P6/ADR-0032's sealed payload, exact envelope, account/environment identity, bounded same-key recovery and reconciliation rules. The provider's 24-hour deduplication window is not Core's business-history TTL or permission to replay with a new key. Possible submission remains indeterminate until exact evidence resolves it; no blind resend, changed envelope, physical exactly-once promise or guaranteed recall. Authenticate callbacks and correlate them against the durable exact provider account/connection/environment/message/attempt; payload tags, address and signed metadata alone are not tenant authority. Duplicate/out-of-order events must not rewind delivery truth or confuse engagement with receipt/reading. Retain only approved body-free evidence; never raw protected URLs, credential verifiers, secret-bearing click payloads or private document facts in logs/history/queues.

**One clear, accessible interaction.** Reuse the existing source review and supported shared controls. Show the permitted recipient/destination and selected consequence in ordinary readable content, with a final action whose visible and accessible names accurately distinguish grant-plus-email from grant-only. Checkbox changes alone have no grant/send/navigation effect. Preserve state/focus, keyboard/touch/reflow, approved locale/direction and actual localized end with time-zone context; avoid countdown-only or transient-only results. Show the grant and this notice's real status separately: For a staff-off choice, report this access notice was not requested, not that every independent email was suppressed. For selected notices, preserve requested intent and report the actual blocked/suppressed/non-applicable/unknown outcome; a zero-child result does not rewrite the choice. Queued/accepted is not delivered/read; possible submission is not definitely not sent. Explain safe next action in context. Use only the approved minimal subject/preview/body/action; no arbitrary recipient/composer/attachment, new account, routine second confirmation, manual-toggle ritual, new queue/dashboard or direct storage URL fallback.

**Data, privacy and bounded operation.** Enforce the tenant/environment/source/recipient relationship and permanent effect identity through qualified database keys, constraints and one authoritative mutation boundary. Ordinary roles cannot rewrite attribution, scope, choice, release membership or frozen message facts; inspect SELECT/INSERT/UPDATE/DELETE grants, RLS USING and WITH CHECK, RPC/view/storage and service-role paths, not only UI checks. No broadening by allowed updates, cross-tenant references or unchecked privileged lookup. Preserve immutable history and lawful retention/erasure; access expiry is not deletion and a hold is not access. Qualify the optional external-recipient prepared-material/utility class and Recent-copy posture explicitly; neither existing staff/financial classes nor Q14/Q18's 30-day access period may be inherited accidentally. Use bounded indexed source/intent lookup, paginated authorized history and existing per-tenant dispatch limits; no request-time historical scans, new mail queue, scheduler or dual truth.

**Publication, rollout and proof.** At authorized publication reconcile the exact listed Q08–Q19 notice reservations and current source/P4/P12/P17/P6 authors, then regenerate declared projections and link future design/tasks/tickets/tests/release evidence. Keep Q01 identity intent and all other ratified limits; do not copy unrelated purpose keys or require whole Phase34/41. Before Live activation qualify the exact contract/profile, finite material/utility posture, current authorization and all P01–P18 outcomes. Mixed-version/legacy data must never infer true, regenerate historical notices, revive credentials or replay provider-unknown work; restore preserves restrictions, immutable identities and original clocks. Provide a narrowly scoped dispatch stop and roll-forward recovery that preserve committed grants/history. Establish workload/queue/reconciliation budgets with the existing owner before activation, not invented numbers here. Treat GOV.UK's preselection counterevidence and actual staff comprehension as release evidence, not solved by source review. No new resend/automatic renewal/notification framework follows.

- **AC29-A20-01:** A genuinely new qualified fresh unfinished or completed-read grant review initializes its optional email choice On only when the exact source/recipient/Live contract/effective plan/channel allow it; missing or conflicting input is never On.
- **AC29-A20-02:** Staff can deliberately grant only. The visible choice survives validation and safe recovery, while a material destination/eligibility change requires current review rather than silent downgrade.
- **AC29-A20-03:** Grant, original choice and required durable notice handoff commit coherently. A crash cannot produce email about an uncommitted grant; known grant success survives later mail failure.
- **AC29-A20-04:** False replay never acquires mail after settings change; true recovery uses only its original qualified material and complete bounded release, including proved zero. Unknown compilation is not omission and replay cannot append a recipient.
- **AC29-A20-05:** Current source/privacy/contact/suppression/usefulness checks govern actual preparation/submission/entry without rewriting original plan pins, changing recipient or extending the grant.
- **AC29-A20-06:** Grant-only, selected-but-blocked, queued, possible submission and actual provider outcomes remain separate; the UI never claims all mail was suppressed, delivery/read success or recall from a local toggle.
- **AC29-A20-07:** Minimal approved content and the exact protected doorway carry no private file body or invented invitation/reminder/review purpose; callbacks retain authenticated exact attempt/account correlation.

## REQ29-A21 — Issue an exact private document share

**Story US29-A21:** As an authorized source staff member, I want to grant a named recipient bounded reading of exact private evidence, so that necessary sharing works without compulsory organization enrollment.

**Decision basis:** Q41, complete incorporated source clauses and current explicit later refinements; REQ29-P01–P18. Exact paragraph, clause, proof and journey locators are mapped individually.

Allow a named recipient to obtain source-authorized private document reading access without compulsory enrollment as a donor, missionary, staff member or organization member. The first concrete Q41 cohort is exact currently eligible evidence durably received from the participant or supplied by staff under Q28 and held by the ordinary Private Document Request source. That source owns a distinct outbound disclosure/read admission for its continuing lawful purpose; P29 supplies custody and the shared file experience. An issued unfinished or fulfilled request may qualify; fulfillment alone neither grants nor ends outbound access. Actual cancellation or an applicable adverse source restriction blocks new shares and affected future reads. Retention, acceptance, staff file access and a source reference alone do not establish disclosure authority. No new ordinary share admits historical/superseded material by inference or widens an existing specialist source lane.

Each new Private Document Share binds one exact tenant/environment, source/request/use, immutable selected evidence version, intended recipient/address revision, stated source purpose, explicitly permitted reading actions and a finite end. The staff actor must have the current source/P12 authority to administer that exact disclosure within its assignable ceiling; being able to read is not equivalent. That single source command may designate the named recipient under its qualified rules; no pre-created Party, guest directory entry or routine second approval is required. Q28 material carries all applicable restrictions of its supplied use, including any required origin permission for onward disclosure. Equal bytes and other independent uses neither confer nor automatically merge rights. The new Q41 lane pins the selected version and does not follow later uploads; independently qualified other-source current-version rules remain unchanged. A later correction or supersession never retargets the share and ends affected reads wherever the source ends eligibility. Declare P12 owner-transfer and grantor dependencies explicitly, including restricted-grantor departure; current qualified source administrators can manage the share without depending on its original issuer's continued availability.

Provide a qualified reading rendition for the actual permitted material. Original download is a separate explicit source-permitted action, never a preview-failure fallback. Do not issue a purportedly usable share with no qualified reading path: prepare/recover the rendition through the existing bounded owner process before issuance, or truthfully leave the share unissued. This is a source/custody readiness check, not mandatory grantor body inspection or a guarantee of continuous transport availability. Staff see the actual recipient, material/version, permitted actions and end in the existing source-context Share review. An owner-qualified finite default may populate the end; otherwise staff choose it there within the exact source's finite maximum and earlier limits. There is no universal share duration, implicit permanent grant, auto-renewal, follow-latest mode or inherited request-access clock.

Adopt the exact ordinary document-share recipient authority, including its legitimate no-Party branch, through source/native identity, P17 and P6. Qualify the complete initial invitation, requested confirmation and supported resend/correction/recovery paths with exact recipient, purpose, safe content, protected entry, deadlines and retention. The staff review identifies the actual invitation consequence of issuance, and temporary delivery delay remains visible separately from the committed share. P17 prepares; P6 alone dispatches and records delivery outcomes. Native Auth hooks must integrate that ownership rather than send through an untracked second mailer. Preserve consent/contact/provider restrictions and minimal safe identification; no evidence attachment, private title/body leak, arbitrary address, alternate-channel fallback or inherited Q20/Q31/Q35/Q40 notice default follows. Every actually required entry/communication branch must be qualified before offering the journey. Communication-only suppression gates messaging, not otherwise valid current reading; actual recipient/contact/proof invalidation or source privacy loss still denies affected reads. When fresh proof needs a blocked delivery path, do not bypass that restriction or claim access has succeeded.

Commit issuance, immutable original terms, actor attribution, business history and required delivery handoff coherently before dependent external effects. Use permanent semantic operation identity and a fingerprint of the intended scope; a matching committed operation is reconciled before new-command eligibility under current result-disclosure rights, and a reused key with different intent conflicts. Recover ambiguous source commit before retrying communication; provider acceptance with a lost response is unknown, not permission to create another share or fresh-key resend. Use complete exact Live P6 release or a fully proved zero; Reserved/unknown creates no historical send. Preserve sealed original material and every-call eligibility. Carry P17's closed three-cause recovery and at most two identical follow-up provider calls after the initial call, total within the earliest applicable deadline/window; other ambiguous outcomes reconcile only. A deliberate new qualified proof challenge is a separate bounded source act, not a disguised rekey of the old delivery. Source issuance, proof delivery, confirmation, admission, bytes served and human understanding remain distinct outcomes; provider failure does not undo issuance or justify pretending the recipient has access.

Persist mandatory scope and immutable version/use/recipient terms with tenant-aware typed relationships, finite timestamp and state checks, durable operation uniqueness and supporting indexes. Derive actor, tenant, authority, proof outcome and audit attribution from trusted execution context and current source records; caller-selected opaque IDs are only requested targets. Prevent issued authority columns from being reparented or rewritten through general updates. Actual grants, RLS SELECT/INSERT/UPDATE/DELETE policies, old-row USING and new-row WITH CHECK behavior, views/RPCs/functions, storage and privileged worker/service routes must preserve the same boundary. Restrict deletion that would erase source/evidence/audit relationships; apply owner-directed retention/anonymization without leaving an active dangling grant. No money or financial fact mutation is part of this share.

Keep source business history, restricted security/access evidence and operational telemetry separate. Record actual grantor/reader or delegated service, exact source/use/version/share, recipient/proof revision, original end, issue/revoke/correction and allowed/denied retrieval/transport outcome under their owner retention rules. Do not log secrets, codes, raw private content or unnecessary addresses; safe aggregate diagnosis must remain possible. Qualify the exact Party/no-Party resolver, authenticated-data material binding, dispatch/history and any current reveal branch. Auth/security credentials have no readable Recent copy; other optional copies need the exact compatible reveal contract and shorter-of tenant Off/7/30-day versus contract 0/7/30-day retention, with unknown classification zero. Closed protected delivery carriers retain only their qualified finite material; no fake Party or optional-copy prerequisite follows. Bound confirmation attempts/sends/reservations, active operations, response bytes/time, concurrency, storage and per-tenant/global resource use through qualified shared controls. Resend must not reset abuse budgets, outages must not silently remove them, and an attacker must not permanently lock another person's unrelated account. Reuse existing rendition and transport work; no zero-cost claim, general guest directory, chat, read receipt, signature, watermark/DRM system, reminder engine or new parser/search dependency follows.

Publish the exact source, native identity/P12, P17/P6 and custody changes through their canonical authoring sources and declared OpenSpec projections at the authorized specification stage. Expand schema/readers, fence incompatible writers and old signup/public-serving paths, prove the exact hosted roles/source/host/provider and finite operational budgets, then enable a bounded source/tenant cohort. Unknown profiles remain unavailable. Old email flags, public links, restored bytes or unproved migrated rows create no Q41 grant. Rollback can disable new issuance or affected delivery while preserving evidence, immutable terms and denial fences; it must never route limited readers into old donor enrollment or public storage. Native positive/negative, race/replay/restore, migration, accessibility and actual staff/recipient proof are required before activation. No entire future Workflow/application product is a prerequisite, and this grooming review proves none of those runtime outcomes.

Private sharing remains a separate outbound source use. Q65 ongoing-reference readers need their actual current reference-purpose authority, not copied collection/share grants or general access to the original request.

- **AC29-A21-01:** A qualified issuer creates one source-owned share for the exact recipient/address revision, purpose, immutable evidence/action scope and finite source-issued terms, without general anyone-link or membership authority.
- **AC29-A21-02:** The selected material has sufficient independently qualified reading coverage. Original download is a separate explicit action; preview failure never silently widens disclosure.
- **AC29-A21-03:** Issuance, immutable original terms/actor/history and required qualified invitation handoff remain coherent; a repeated intent returns the original result without another share or shifted end.
- **AC29-A21-04:** Current source restrictions, independent uses, recipient correction and finite validity remain effective; a share cannot create collection, acceptance, agreement-validity or Q65 reference authority.
- **AC29-A21-05:** Issuer UI shows exact safe scope, recipient, permitted actions, real end and actual invitation/result states, with a capable correction/stop route rather than a generic sharing badge.

## REQ29-A22 — Enter and read an exact private document share

**Story US29-A22:** As a named private-share recipient, I want to enter and read only my currently permitted shared evidence, so that a forwarded link or old proof cannot expose another person’s material.

**Decision basis:** Q41, complete incorporated source clauses and current explicit later refinements; REQ29-P01–P18. Exact paragraph, clause, proof and journey locators are mapped individually.

Adopt a narrow authenticated-human admission through native identity and P12's sole authorization decision point for this outbound purpose without broader organization enrollment. A native Auth identity/session may exist; it grants no share, Party, role or membership by itself. Preserve legitimate existing accounts and memberships. Remove or bypass only through an explicitly qualified trusted shared path the automatic donor/default-tenant effects for this purpose; never fabricate a donor/profile, trust caller-controlled metadata or add a parallel login/JWT/PDP. A bounded pending non-authorizing native identity/reservation is permitted if the provider requires it before proof; failed admission leaves no source access and has supported recovery/cleanup. Cleanup rechecks other genuine uses and cannot delete or reassign an identity merely to undo a failed share.

Invitation possession, an email string, a verified-email flag, ordinary account presence and prior collection proof do not alone admit the reader. Obtain current proof at the fixed source-approved mailbox through the qualified shared confirmation flow when sufficient compatible native proof is absent. Reuse proof only under an explicit qualified rule for the principal, exact recipient/address revision, source/share purpose, method, age and required assurance, with a fresh independently authorized binding to this share. Mailbox confirmation establishes mailbox control, not exclusive human identity, representation, signature, document authenticity, MFA, phishing resistance or a NIST assurance level. Stronger source assurance remains mandatory; an incompatible source cannot downgrade to the ordinary email path. Do not force another challenge for every page or range read.

Use the existing scanner-resistant protected doorway and frozen qualified host. Initial GET/HEAD, passive previews and prefetch disclose no protected metadata, grant no source admission and trigger no confirmation send. Deliberate qualified entry initiates the appropriate confirmation, and the final source admission coherently consumes/applies the exact proof and binds the native principal to the current share. Qualified sibling link/code paths cannot independently consume the same proof application twice. Account switching and same-tenant return preserve the exact intended document without credential-bearing redirects, cross-host cookies or role-home detours. A deliberate POST alone is not proof of a human, and a forwarded invitation alone remains insufficient.

Enforce current source/P12 permission on every protected metadata, filename, thumbnail, rendition, full/range/conditional response and any separately permitted original/download/print/export/recovery operation. Use requester-authorized private application retrieval or an equivalently proved current-authorization mechanism; a raw reusable signed storage URL, public bucket or external viewer is not a substitute. Keep caches, browser state and response ordering scoped to actual tenant/principal/share/source context and private delivery rules. Define the atomic read-admission point against revocation and bound every in-flight operation; stop newly admitted affected reads and additional serving steps as the qualified shared serving contract requires. Report the bounded in-flight/copy limit honestly rather than promise recall or unlimited access from an earlier check.

Keep proof expiry, session expiry, invitation/credential expiry, share end, rendition availability and byte retention distinct. Server time governs the finite interval, with access denied at or after its end. Confirmation, viewing, retry, resend, moving/renaming and future default changes cannot lengthen it. Before issuance a draft can change or be discarded. After issuance, wrong recipient/material/end is corrected by revoking the exact share and, only when still independently lawful, deliberately issuing a new share; old facts are not retargeted, reopened or erased. Expired, revoked or source-ended shares do not revive when identity, settings, source state or backups return. A temporary proof, authorization or technical block that did not end the share may clear only through its qualified owner repair within unchanged terms and all current gates; an unknown/denied result is not automatically a terminal revocation. Q41 cannot recreate the original participant's ended Q05–Q20/Q34 request-reading scope merely under another label.

Keep a small truthful UI: source-context Share review; direct protected document entry; visible permitted actions and exact end; usable account switch, confirmation delay, resend and capable source contact/correction; and a clear way to end the reader's session on a shared device. Use existing shared base-maia/Base UI components. Where a code is used, provide one logical labeled input with whole-code paste/autofill and leading-zero support; preserve safe context through mobile email/browser switching and low bandwidth. Use keyboard, focus, zoom, screen-reader/status and localization behavior that works through authentication and the actual reading rendition. Invitation, confirmation and recovery remain usable in plain text and with images blocked, showing safe minimal identification and the actual code or qualified entry action only through its permitted secret carrier. Do not collect unnecessary profile fields or imply that a preview prevents copying, that served bytes were understood, or that a recipient is legally identity-verified.

Private sharing remains a separate outbound source use. Q65 ongoing-reference readers need their actual current reference-purpose authority, not copied collection/share grants or general access to the original request.

- **AC29-A22-01:** A named share recipient enters only through the exact native identity/P12 and fixed-mailbox proof route, including a qualified no-Party branch; invitation possession, shared email, unrelated sign-in and old collection proof do not admit them.
- **AC29-A22-02:** GET/HEAD/prefetch/scanner visits reveal no protected content or admission; deliberate entry uses the frozen qualified host and cannot be retargeted.
- **AC29-A22-03:** Every metadata/preview/thumbnail/original/range/conditional/print/export action independently enforces current permitted scope and the exclusive share end; private cache or an old session cannot bypass it.
- **AC29-A22-04:** Proof/session/credential/rendition failure is repaired only within valid source terms; resend, return, recovery and source processing never restart the share or recall delivered copies.
- **AC29-A22-05:** Wrong account/contact, expired/revoked share and unknown result produce safe truthful next actions without new membership, forced body download, private existence leakage or SQL/operator-console repair.
