# Phase 28 — Relationships, preparation, referrals and starting guidance

This canonical volume defines the native relationship journey from first preparation through deliberate sharing, contact correction, archive, departure and return; bounded self-service contact intake; referral timing/history/continuation; and optional organization guidance. It contains REQ28-R01–REQ28-R43 and their stable user-story and acceptance identifiers. All stated outcomes are requirements, not evidence that current code already implements them.

The authorized full-phase specification adopts the selected product outcomes and reconciled engineering requirements here. Historical D1/D3 packet labels are not retroactively changed to blanket-ratified. Later explicit amendments govern their overlapping behavior: D28 permits a selected pre-expiry Resume to end the departure schedule in favor of qualified normal current-work retention; D39 uses calendar-date semantics for New referral windows only, while Continued windows retain elapsed 24-hour days. Accepted existing windows retain their original semantic basis and endpoint.

## Shared source and authorization contract

- Native P9/P4 sources own CRM assertions, identity resolution, relationship lineage and accepted changes. P12 and the shared subtract-only field/source resolver own current authority. P28 supplies the workspace. Source mutation, required minimal audit/activity and source-owned accepted-outcome evidence commit together, or use a specifically qualified existing owner composition; no best-effort callback can substitute for required acceptance.
- Resolve exact Tenant, active acting context, source purpose, subject and field/history authority from trusted context. Submitted identifiers select a target to authorize; they cannot author tenant, human actor, original author, owner, approver or audit attribution. Authorize both old state and resulting state. A membership, role name, authorship, email match, saved selection or a service credential does not substitute for permission.
- Apply authorization and safe-field projection before enumeration, search, counts, ordering, paging, serialization, recovery, export and other reached egress. Hidden and absent subjects must not form an existence oracle. Current result-release checks after waits, context-scoped query/cursor keys, and rejection of known-obsolete client responses prevent stale-context disclosure. Do not promise recall of already delivered bytes.
- Tenant-aware relationships, non-null required identities, valid state combinations, immutable accepted provenance and durable effect uniqueness enforce the source invariants. Qualify grants, old-row `USING`, resulting-row `WITH CHECK`, column mutation, views/RPC ownership, Storage and privileged paths. `FORCE RLS` is not a substitute for service-role semantic authorization. No general browser writer may bypass an owner command.
- Every mutation has durable source-owned business-effect identity, expected-revision or equivalent conflict handling, and current-authority recovery. Duplicate/reclaimed delivery cannot repeat an effect; changed meaning cannot reuse accepted intent. Distinguish definitely rejected, accepted, accepted-but-refreshing and outcome-unknown. Failed refresh does not undo accepted work; old receipts do not overwrite a newer current state. Use existing native change evidence rather than a new generic CRM/provider command journal.
- Ordinary use remains available with optional modules Off when its own prerequisites qualify. Configuration, enablement, source readiness and actor authority are different facts. A missing source gates only its dependent effect and gives a truthful authorized repair path. Feature Off is not deletion, global grant revocation, stopping expiry, undoing accepted work or permission to replay old actions on re-enable.
- Use exact Core shared Base UI/base-maia and semantic tokens. Complete journeys work with keyboard, screen reader, touch, 320 CSS-pixel reflow/zoom, international names and relevant address formats, explicit source-correct zones, and weak networks. Essential feedback is persistent and not dependent only on color, hover or toast. No unsupported persistent private offline cache or automatic privileged offline replay.
- Source-retention/body custody, business history, security audit and technical telemetry remain distinct. Avoid raw contact/preparation/referral bodies in broad logs or analytics. Required history does not imply unlimited plaintext. Restore must apply newer restriction, erasure/disposition and consumed-effect authority before reads/jobs reopen.

**Decision basis:** completeness C01–C03/C06/C08/C12–C20; P9 A4/A17/A18; P12 four-principal/context rules at its canonical authorization section; ADR-0001; ADR-0209; ADR-0211 only for actual projection-policy widening; CRM Core requirements. This common contract is normative alongside each story's specific outcomes, not an optional test checklist. All REQ28-R acceptance criteria are evaluated with this contract.

## REQ28-R01 — Choose the correct working context

**Story US28-R01:** As a missionary, I want to enter the correct organization and ministry context, so that my work affects the intended people and records.

**Decision basis:** completeness C01/C02/C06/C14/C17; P12 current Tenant Authorization Context; glossary Ministry Assignment versus Active Tenant Assignment.

Zero admitted contexts yields an honest no-access/setup state and only a real permitted help destination. One context opens directly; multiple admitted contexts can be deliberately selected without exposing unadmitted names/counts.

Show the consequential current organization/subject. Saved context selection is revalidated; another role's grants are not unioned into the request.

Switching does not move a draft, recipient, uploaded file, accepted effect or recovery request to the other context. Guard unsaved work with ordinary local recovery where still authorized; discard known-obsolete responses and clear data that is no longer readable.

A useful first native job does not require a guide, coach, goal, connected provider, import or AI.

- **AC28-R01-01:** Given zero, one or several currently admitted working contexts, when Maya enters the workspace, then she receives respectively a truthful no-access/setup result, direct entry, or a choice containing only admitted contexts; unavailable sources do not appear as an empty authorized list.
- **AC28-R01-02:** Given a saved context or another role, when a request is authorized, then exact current Tenant, Ministry Assignment and purpose are resolved from trusted context without role union or caller-controlled actor attribution.
- **AC28-R01-03:** Given a draft, upload, selected recipient or outstanding response in one context, when Maya changes context or loses its authority, then none is applied to the new context and known-obsolete responses cannot restore protected old content; accepted source effects remain recoverable only under current authority.
- **AC28-R01-04:** Given optional guide, coaching, goal, provider, import and AI capabilities are unavailable or Off, when ordinary native work is otherwise authorized, then Maya can complete its first useful job without enabling them.

## REQ28-R02 — Save restricted preparation

**Story US28-R02:** As a missionary, I want to save early prospect preparation with incomplete knowledge, so that I can prepare without prematurely sharing a person's details.

**Decision basis:** D1 selected decision and C01/C02/C08–C11/C14–C15; D2 C04; D27 C04; completeness C13/C14/C16. **Owner extension:** bounded P9 preparation source for unresolved assertions, with qualified P4/P9 canonical reuse; no second CRM.

A short form accepts the owner-required minimum without forcing a household, country, address, email, ask amount, giving status, next task, stage, coach or invented canonical Party.

Newly supplied identity/contact assertions and planning remain restricted from ordinary relationship staff across all reached surfaces. Independently authorized organizational facts about the same person remain independently available.

Successful reload returns the same accepted preparation and original authorship. A saved preparation is not a verified contact, actual encounter, Request, cultivation enrollment, gift, commitment, newsletter subscription or publication.

Save/recovery observes the common atomicity/current-authority contract. No external provider is needed.

- **AC28-R02-01:** Given an authorized restricted-preparation scope and only its source-required minimum assertions, when Maya saves, then one preparation is accepted and reloadable without inventing an email, household, country, ask, giving status, task, coach or canonical Party.
- **AC28-R02-02:** Given newly supplied preparation facts and separately authorized CRM facts about the same person, when Maya saves and staff query, then newly supplied facts remain restricted while independent CRM facts retain their own authority.
- **AC28-R02-03:** Given repeated delivery or an accepted Save with a lost response, when Maya recovers under current authority, then the same preparation and original authorship are returned, required source/change evidence is complete, and no encounter, Request, cultivation enrollment, gift, subscription or publication is fabricated.
- **AC28-R02-04:** Given an in-progress Save, definite validation rejection, acknowledged acceptance or unknown outcome, when Maya returns to the form or list, then each state has distinct persistent feedback, safe input and list position are preserved where still readable, and keyboard/screen-reader focus and error/status feedback support the same recovery without another source entry.

## REQ28-R03 — Resolve identity without disclosure

**Story US28-R03:** As a missionary, I want safe identity matching and clear unresolved results, so that saving preparation neither duplicates a relationship nor exposes another person's protected record.

**Decision basis:** D1 C03/C12; D2 C05/C06; D4 C04; D17 C05/C06; P4 identity owner; CRM Core identity/merge requirements.

Names, email, phones and shared addresses are evidence, never universal person keys or automatic merge instructions. Qualified authorized canonical identity may be reused without retyping.

Establish minimum candidate/result authority before exposing an existence-dependent branch. Hidden matches cannot alter disclosed counts, suggestions, detail links, result shape or repair routes into an existence signal.

A blocked canonical admission does not masquerade as an accepted staff share; ordinary restricted assertions remain usable where source rules permit. Do not create a second P27 enrollment for the same continuing purpose merely to avoid matching.

Relevant retained/archived records participate in authorized source resolution even when absent from the active list; matching does not automatically unarchive or merge private histories.

- **AC28-R03-01:** Given a matching name, shared address, email or phone, when preparation is resolved, then no automatic merge or universal identity assumption occurs; qualified authorized identity can be reused without duplicate entry.
- **AC28-R03-02:** Given an otherwise identical hidden or absent candidate, when Maya searches, previews or accepts, then counts, suggestions, links, outcomes and repair routes disclose no distinguishing protected identity information.
- **AC28-R03-03:** Given an authorized retained or archived matching source, when new preparation is admitted, then source resolution considers it without unarchiving or combining private histories; blocked canonical admission never reports successful staff sharing or creates a substitute managed-work enrollment.

## REQ28-R04 — Understand preparation audience

**Story US28-R04:** As a missionary, I want to understand who can see my preparation, so that an ordinary Save never surprises me with wider disclosure.

**Decision basis:** D1 C01/C06/C07/C11/C14; D2 C04; completeness C14; ADR-0209.

Explain the organization and restricted initial audience before Save; keep preparation working state, contact availability to staff and private-note audience distinct.

Protect newly supplied facts through search, task labels, timelines, exports, notifications, AI, audit content, accessibility text and caches as well as the detail page. D1 itself admits none of those optional external consumers.

Saving/contact storage grants no permission to contact. Each later send resolves its own current recipient/purpose/restriction evidence.

- **AC28-R04-01:** Given the preparation form, when Maya reviews and saves, then the organization and restricted audience are explained before acceptance and Save does not broaden contact availability or private-note audience.
- **AC28-R04-02:** Given protected preparation content, when reached search, task labels, timelines, accessibility text, notifications, audit display, caches or optional egress are evaluated, then the same source and field restrictions apply before disclosure; unadmitted optional consumers receive no content.
- **AC28-R04-03:** Given a saved contact assertion, when a later communication is attempted, then current recipient, purpose and restriction authority is checked independently and storage itself grants no contact permission.

## REQ28-R05 — Share eligible contact facts with staff

**Story US28-R05:** As a missionary, I want to make eligible contact facts available to staff deliberately, so that the organization can use its ordinary CRM without receiving my private preparation.

**Decision basis:** ratified D2 C01–C06/C14; D1 selected restricted start; P4/P9/P12.

Review the exact eligible contact facts, organization and ordinary staff audience before one explicit acceptance. Cancel or failed acceptance leaves the prior state intact.

Accepted sharing creates/reuses canonical contact facts only through the qualified P4/P9 owner. Independent authoritative facts are not silently overwritten.

Ordinary authorized staff discover the shared contact without per-contact invitations or collaborator grants. Existing protected-record, purpose and field floors still apply; sharing does not give Maya general staff visibility.

Private planning, earlier notes/activity, attachments, referral context and care information are not copied, summarized or relabeled into shared history.

- **AC28-R05-01:** Given eligible restricted preparation, when Maya reviews organization, ordinary staff audience and exact contact facts and explicitly shares, then the canonical owner accepts or reuses only those facts without overwriting independent authoritative values.
- **AC28-R05-02:** Given Cancel, denial or a failed share, when the result is shown, then prior availability remains intact and no staff grant or contact record is falsely claimed.
- **AC28-R05-03:** Given an accepted share, when authorized staff discover it, then ordinary protected-record, purpose and field floors apply without per-contact invitation; Maya gains no general staff access and private planning, earlier activity, attachments, referral context and care information remain unshared.

## REQ28-R06 — Optionally notify selected staff

**Story US28-R06:** As a missionary, I want to optionally tell selected staff that a contact is available, so that attention is directed without changing access or assigning work.

**Decision basis:** D2 C07–C13/C18; P9 source event, P6 recipient/communication truth, P17 Information presentation. Exact source-purpose contract is a required enabler.

The optional staff selection starts empty. Empty creates no notice; valid selected same-Tenant recipients receive one source-qualified informational in-product notice each. Duplicate selections normalize; invalid selections never fall back to all staff.

Selection does not define who may access the shared contact, assign responsibility or create a task. The action contacts no prospect and sends no email, SMS or push.

Sharing acceptance and notice requested/available/failed/unknown outcomes are distinct. A post-share notice failure repairs only the original notice, never repeats sharing or creates another contact.

Source/recipient eligibility is checked before notice availability, counts, display and opening. Replay may narrow recipients, never add substitutes. Read/open status is not follow-up completion.

- **AC28-R06-01:** Given the optional staff selector initially has no recipients, when sharing is accepted, then no notice is requested; valid explicit same-Tenant selections produce at most one informational in-product notice each, and invalid selections never expand to all staff.
- **AC28-R06-02:** Given selected notice recipients, when the share and notice are processed, then recipient choice grants no contact access, assignment or task and sends no email, SMS, push or prospect communication.
- **AC28-R06-03:** Given accepted sharing followed by a pending, failed or unknown notice outcome, when the user views or repairs it, then component outcomes remain distinct and only the original notice is retried without another share or contact.
- **AC28-R06-04:** Given revoked source or recipient eligibility, when notice availability, counts, display or opening are evaluated, then current authority withholds disallowed content and replay adds no substitute recipients; opening is not recorded as completed follow-up.

## REQ28-R07 — Recover sharing without false recall

**Story US28-R07:** As a missionary, I want accepted sharing and later corrections to have clear history, so that recovery does not promise an impossible unshare or recall.

**Decision basis:** D2 C10–C12/C18–C20; completeness C08/C15.

The source effect, required audit/recoverable receipt and optional identifier-only notice intent are atomically accepted. Repeated intended delivery produces one share and requested attention.

A failed refresh or lost response recovers the same outcome under current authority. A later narrowed permission can withhold the response without undoing the accepted share.

Sharing provides no generic Unshare, person deletion, permanent-publication promise or recall of previously delivered information. Source-authorized correction/restriction/disposition remains available through its own owner.

- **AC28-R07-01:** Given one deliberate share intent delivered repeatedly, when accepted, then the source effect, required minimal audit/recovery evidence and identifier-only notice intent commit together and do not duplicate the share or requested attention.
- **AC28-R07-02:** Given an accepted share whose response or refresh fails, when recovery occurs, then current authority determines the permitted outcome display without reversing or repeating accepted truth.
- **AC28-R07-03:** Given information has already been shared, when Maya seeks correction or removal, then the interface uses qualified source correction, restriction or disposition and offers no generic Unshare, deletion or recall promise.

## REQ28-R08 — Configure missionary contact correction

**Story US28-R08:** As an authorized tenant administrator, I want to control missionary contact correction through existing permissions, so that our organization can enable or withhold eligible edits without another permission system.

**Decision basis:** D5 C01–C04/C11/C15; D41 C04; P12; ADR-0209/0211; active roster-safety contract.

One focused entry in existing permissions exposes exact missionary-purpose action/scope and qualified field controls; show effective versus draft/pending results and inherited restrictions.

Policy administration and editing contacts are distinct capabilities. Saving a policy grants no private content access, broad CRM rights, staff promotion or per-contact collaborator power.

Preserve valid existing permissions. Missing/unknown authority denies the affected action; no universal all-tenants-On or all-tenants-Off preset is inferred. Removing one grant does not falsely claim that all independently valid paths disappeared.

Actual projection-policy widening follows ADR-0211 distinct-human approval/current-base apply. Ordinary already-authorized contact-value Save has no new approval queue.

- **AC28-R08-01:** Given an authorized policy administrator without contact-content access, when configuring missionary-purpose edit scope and fields, then the existing permission surface shows current versus pending effect and inherited restrictions without granting content or editing rights.
- **AC28-R08-02:** Given valid existing grants, a removed grant or missing authority, when effective policy is evaluated, then valid independent grants remain, the denied action is withheld, and no blanket default or all-access-revoked claim is inferred.
- **AC28-R08-03:** Given actual projection-policy widening, when it is proposed and applied, then the distinct-human approval and current-base rules of ADR-0211 apply; an ordinary already-authorized contact-value Save creates no additional approval queue.

## REQ28-R09 — Correct only eligible contact fields

**Story US28-R09:** As a missionary, I want to correct only eligible shared contact fields, so that I can keep useful information accurate without overwriting other facts.

**Decision basis:** D5 C04–C07/C09/C12/C13; D41 C05–C08/C10; completeness C13.

A source-qualified field inventory names each admitted field, subject/purpose, read/edit/Clear right, validation and required consequence. Edit requires view; sharing/authorship does not grant edit.

Editable values, readable-only values, not-viewable values, permission checking and temporary unavailability are distinct. Forbidden values are not serialized into disabled/hidden inputs.

Save submits only deliberately selected changes; omission means unchanged and Clear is explicit. Any invalid/forbidden submitted field rejects the entire selected action, even if apparently unchanged. A true no-op creates no artificial correction or interaction.

Atomic accepted Save preserves untouched fields and lawful provenance. A stale edit conflicts rather than silently overwriting newer facts. International names/phone/address meaning is preserved without mandatory email, Western split or inferred USA country.

- **AC28-R09-01:** Given a qualified field inventory, when Maya opens contact correction, then only currently viewable values are delivered, editable/read-only/checking/unavailable states are distinct, and edit authority never exceeds view authority.
- **AC28-R09-02:** Given an explicit selected change set, when Save is accepted, then omission preserves untouched values and explicit Clear follows that field's rules; any invalid or forbidden supplied field rejects the entire action and a true no-op creates no correction or interaction.
- **AC28-R09-03:** Given a newer source revision or changed permission, when a stale Save arrives, then it conflicts or denies without silent overwrite, and accepted changes retain source provenance and required audit evidence.
- **AC28-R09-04:** Given international names, phone or address assertions and an absent email, when qualified changes are saved, then source meaning is preserved without a forced Western split, required email or inferred USA country.

## REQ28-R10 — Preserve field meaning and safe drafts

**Story US28-R10:** As a missionary, I want contact changes and interrupted editing to respect each field's actual rules, so that an address correction does not become a consent or account change.

**Decision basis:** D5 C08–C10/C14; D41 C05/C07/C08; P9/P12/contact owners.

Contact correction alone verifies no possession, merges no identity, changes no login/legal/billing/public identity, authorizes no contact, and changes no money or private-note audience.

Apply exact changed-field consequences through the owner. A mandatory withdrawal fence or acceptance prerequisite succeeds before acceptance; independently asynchronous consequences use their qualified durable contract and truthful status. No D5-invented notification or donor-self email ceremony is added.

Preserve safe drafts on ordinary validation/conflict while readable. On loss of edit rights explain and prevent stale submission; on loss of read authority/context clear affected content and reject late responses. Restored rights do not auto-resubmit.

- **AC28-R10-01:** Given an eligible contact-value correction, when saved, then it does not independently verify possession, merge identity, alter account/legal/billing/public identity, authorize contact, change money or widen private notes.
- **AC28-R10-02:** Given a field with a mandatory owner consequence, when acceptance is attempted, then its prerequisite or withdrawal fence succeeds before acceptance; separately qualified asynchronous consequences remain recoverable with honest status rather than a fabricated all-success result.
- **AC28-R10-03:** Given a recoverable validation/conflict error, when the form remains readable, then safe user input is preserved; loss of edit authority blocks submission, loss of read authority clears protected content, and later restoration never auto-submits the draft.

## REQ28-R11 — Archive unused preparation

**Story US28-R11:** As a missionary, I want to archive unused still-unshared preparation, so that my active prospect list stays useful without deleting the person or independent work.

**Decision basis:** D4 C01/C02/C05/C06/C13; D3 selected boundary.

A single archive action moves the same preparation from Active to Archived under current authority; original authorship and history remain.

An obvious Active/Archived control makes it findable. No reason form, routine repeated confirmation, separate archive application or compulsory cleanup workflow is required.

Archive does not deactivate a Party/donor, change another worker's context, unshare contact facts, revoke permissions, close a partnership, complete/cancel tasks, stop reminders, change money or notify staff.

Where permitted source facts prove related open work, show its existing link and a short explanation; incomplete resolution is not “no open work.” Do not block ordinary archive on an exhaustive all-domain scan.

- **AC28-R11-01:** Given unused still-unshared preparation and current archive authority, when Maya chooses Archive, then the same entry moves from Active to Archived and remains findable through an ordinary Active/Archived control with unchanged authorship/history.
- **AC28-R11-02:** Given independent person, task, reminder, partnership, money, communication or another worker's context, when preparation is archived, then those facts and permissions are unchanged and no staff notice is sent.
- **AC28-R11-03:** Given qualified evidence of related open work, when Archive is offered, then its existing permitted link and consequence are explained; unavailable evidence is not called no open work and an exhaustive cross-domain scan is not required for ordinary archive.

## REQ28-R12 — Return archived preparation

**Story US28-R12:** As a missionary, I want to return eligible archived preparation to active work, so that setting something aside is reversible while current rules permit.

**Decision basis:** D4 C02–C04/C07–C12; D27 C05; D28 C07.

Persistent Return to active prospects acts on the same retained preparation. Optional Undo targets only its exact accepted archive and current qualifying revision, never restores a whole old row over later changes.

Return creates no replacement contact, revived grant, reopened completed task, restarted communication or verified contact fact. Purged/erased content is not recoverable.

A later deliberate D2 share may act on archived preparation without unarchiving; the review explains that independent effect. Return to Active is a separate deliberate working-state choice.

Concurrent archive/return/share and recovered old results preserve one ordered source history and current presentation.

- **AC28-R12-01:** Given eligible retained archived preparation, when Maya deliberately returns it to Active, then the same entry changes working state without a replacement contact, revived grant, reopened task or restarted communication.
- **AC28-R12-02:** Given a later change after an archive, when optional Undo is attempted, then it targets only the exact qualifying transition/revision and cannot restore an old row over newer truth; persistent Return remains the ordinary current-authority route.
- **AC28-R12-03:** Given eligible archived preparation, when a deliberate staff share is accepted, then sharing can succeed while the preparation remains Archived; concurrent or recovered archive, Return and share results preserve current ordered state and never recover purged bodies.

## REQ28-R13 — End access without exposing private work

**Story US28-R13:** As a missionary or responsible staff member, I want departure to end the right access without exposing private work, so that genuine organizational duties continue honestly.

**Decision basis:** selected D3; D3 C01–C07 as reconciled by ratified D2/D4/D27/D28 and completeness C12; P9/P12/ADR-0183 duty ownership.

Confirmed source participation/access termination fences the former reader without waiting for cleanup, handoff or a replacement. Inactivity, absent giving, missing voluntary logs, a closed browser or archive state is not a departure signal.

Departure/incapacity creates no new staff, administrator, coach, spouse, successor or cleanup reader of unshared preparation; no automatic share/export/transfer follows.

Already shared/independent CRM facts and accepted duties retain their owner permissions and continuity rules. No eligible assignee yields the source-owned exception, never guessed coverage or false Done.

Removing preparation cannot delete canonical people, erase financial/consent history, clear suppression or destroy another worker's records. An unshared prospect creates no mandatory handoff or missing-log task.

- **AC28-R13-01:** Given confirmed termination of the relevant participation or access, when it takes effect, then former access is fenced without waiting for handoff or cleanup; inactivity, missing logs or giving, a closed browser and archive state do not trigger departure.
- **AC28-R13-02:** Given unshared private preparation on departure or incapacity, when administration or handoff occurs, then no staff, administrator, coach, spouse, successor or cleanup reader is newly admitted and no automatic share, export or transfer occurs.
- **AC28-R13-03:** Given independently shared facts and accepted organizational duties, when a worker departs, then their owner permissions and continuity rules remain; a missing eligible assignee creates an owned exception rather than guessed coverage, while preparation disposal cannot delete independent people, suppression, finance or another worker's records.

## REQ28-R14 — Configure finite preparation retention

**Story US28-R14:** As an authorized tenant administrator, I want one finite post-departure preparation period, so that return needs are balanced with the organization's qualified privacy rules.

**Decision basis:** D28 C01–C04/C09/C10/C15/C17.

Configure one organization-wide positive whole-day period for this preparation purpose only, with fixed unit, supported limits, current saved value and concise advice to choose the shortest justified period. No per-person/project overrides or universal numeric default is selected.

One preparation-retention day is exactly 24 hours, or 86,400 seconds. This elapsed-duration unit is distinct from the New referral calendar-day rule; settings explain that distinction without adding another unit selector.

Before activation, the source/privacy profile identifies supported finite range, body/derivative scope, departure trigger, ordinary-work rules, required evidence/hold schedules and copy disposal/restore obligations. All layers enforce the same range without zero/blank/negative/overflow/Forever coercion.

A missing/unqualified policy leaves affected new preparation unactivated; independent CRM work continues. It neither purges legacy content nor silently retains it forever. Unknown retained cohorts enter bounded restricted owner assessment with responsible owner and resolution deadline.

Ordinary policy Save is prospective from authoritative acceptance. Previously accepted departure episodes keep their policy/deadline; required legal/privacy corrections use a separate qualified auditable transition. Administration exposes no private body or inventory.

- **AC28-R14-01:** Given qualified source/privacy retention profiles, when authorized staff configure post-departure preparation retention, then one organization-wide finite positive whole-day value within the same supported bounds is saved without person/project overrides or a silently selected numeric default.
- **AC28-R14-02:** Given zero, blank, negative, fractional, overflowing or unsupported input, when Save is attempted, then it is rejected without Forever coercion, rounding or unintended changes; policy administration exposes no private preparation inventory.
- **AC28-R14-03:** Given no qualified policy, when new dependent preparation is activated, then activation remains gated while independent CRM work continues; retained unknown cohorts enter bounded restricted owner assessment rather than guessed purge or indefinite silent retention.
- **AC28-R14-04:** Given existing accepted departure episodes, when an ordinary policy revision is accepted, then only later applicable departures use it and existing deadlines remain unchanged; mandatory legal/privacy corrections require their distinct auditable transition.

## REQ28-R15 — Preserve the true departure clock

**Story US28-R15:** As a returning missionary, I want the original departure deadline applied accurately, so that delayed events and policy edits cannot arbitrarily preserve or erase my preparation.

**Decision basis:** D28 C05/C06/C09/C11; D27 C07/C11.

A confirmed relevant source departure binds original human author, Tenant/ministry, participation episode, effective and observed times, durable event identity, and policy effective at that departure instant.

Compute the departure deadline from the authoritative effective departure instant plus the accepted number of 86,400-second days using checked UTC arithmetic. Preserve that accepted deadline across daylight-saving, display-zone and timezone-rule changes unless an independently qualified correction changes it.

Duplicate/out-of-order events do not restart the clock. A late event uses validated effective time/historical policy; missing/conflicting evidence enters restricted owner review rather than guessed deletion.

Exactly one ordinary departure episode controls a preparation at a time; earlier episodes remain history. Later genuine departure schedules only entries admitted to that later work context, not unselected older entries.

Ordinary reads/resume require trusted current time strictly before the still-applicable deadline. Equality is expired even if cleanup lags. Deadline checks occur after waits at acceptance, not only at request/transaction start.

- **AC28-R15-01:** Given a confirmed relevant departure, when its retention episode is accepted, then original human author, exact scope, participation episode, effective/observed times, source event identity and historically applicable policy remain attributable.
- **AC28-R15-02:** Given duplicate, delayed, out-of-order or conflicting departure evidence, when processed, then it cannot restart retention; qualified late evidence uses effective time and historical policy, while missing/conflicting evidence enters restricted owner review.
- **AC28-R15-03:** Given one current controlling episode and a later genuine departure, when scheduling runs, then only entries admitted to that later work context receive its new episode and unselected earlier entries retain their earlier deadline.
- **AC28-R15-04:** Given the controlling deadline, when a read or Resume reaches acceptance before, at or after it following any wait, then only strictly-before access can qualify; cleanup delay is never a grace period.
- **AC28-R15-05:** Given effective departure instant T and accepted period N spanning a daylight-saving transition, when the deadline is calculated or later displayed in another zone, then it remains T plus N times 86,400 seconds using checked UTC arithmetic; ordinary settings or timezone-rule changes do not recompute it, and an unrepresentable result is rejected rather than clamped.

## REQ28-R16 — Find eligible earlier preparation

**Story US28-R16:** As a returning missionary, I want to find my eligible earlier preparation when permitted, so that I can decide what is useful without automatically restoring all old work.

**Decision basis:** D27 C01–C06/C13–C15; D28 C15; glossary Preparation resumption.

The optional Earlier preparation view uses current same-organization/ministry/history authority and qualified original-human authorship. Matching email/name, prior membership or restored login alone is insufficient.

Search, counts, summaries, detail and recovery are authorized before disclosure; held-only/expired/erased/purged or another author's preparation is not exposed. A denied query differs safely from a temporary error and from an authorized empty result.

Show original saved/substantive-change dates honestly and use the familiar editor. No mandatory return wizard, per-entry staff approval, reason, bulk restoration or automatic selection.

Initial qualified retrieval uses 25 summary rows per page and a hard request maximum of 100, detail on demand; these are D27/D28's initial service bounds, not a total record cap or measured performance claim.

- **AC28-R16-01:** Given Maya has current exact organization/ministry/history rights and qualified original-human authorship, when she opens Earlier preparation, then only eligible retained entries are discoverable; matching name/email or restored login alone reveals nothing.
- **AC28-R16-02:** Given another author's, expired, held-only, erased or purged preparation, when search, counts, summary, detail or recovery runs, then it is not disclosed and a temporary failure is not mislabeled as an authorized empty result.
- **AC28-R16-03:** Given eligible earlier work, when Maya browses it, then truthful saved/substantive-change dates and the familiar editor are available without a required return wizard, staff approval, reason or bulk restoration; the initial service profile uses 25 summary rows and rejects requests above 100 rather than implying a total-record limit.

## REQ28-R17 — Resume selected preparation

**Story US28-R17:** As a returning missionary, I want to resume selected preparation deliberately, so that only useful retained work becomes current work again.

**Decision basis:** D27 C04–C08/C11/C12; D28 C07/C14.

Resume includes the same preparation in the exact current activation/work context; preserve original author, membership provenance, source facts and Active/Archived state. At most one effective inclusion exists for the same preparation/current context.

Accepted Resume strictly before expiry atomically admits only the selected entry to qualified normal current-work retention and ends applicability of its departure deadline. Retain original deadline/policy/departure history; display that it is now kept under normal current-work rules.

Missing current-work retention qualification rejects admission without cancelling its existing obligation. Viewing, login/reactivation or resuming another entry does not extend the remainder.

Archived entries remain Archived; a clearly labeled Return to active prospects may compose both current inclusion and archive return atomically when both checks pass.

Resume changes no grants, contact verification, sharing, coach rights, task/communication status, subscriptions, connected accounts, gifts or commitments. Old inclusion does not automatically survive ended participation; temporary withholding without ended participation does not require reselection.

- **AC28-R17-01:** Given current authority and qualified normal current-work retention before the departure deadline, when Maya explicitly resumes one entry, then the same entry gains at most one current-context inclusion, preserves authorship/working state, and only its departure deadline ceases to apply while original episode history remains.
- **AC28-R17-02:** Given missing current-work retention qualification or acceptance at/after departure expiry, when Resume is attempted, then admission fails without cancelling the old obligation; merely reading, logging in or resuming another entry changes no remaining deadline.
- **AC28-R17-03:** Given an Archived entry, when ordinary Resume succeeds, then it remains Archived; a separately clear Return to active prospects action may atomically compose both qualified effects without partial inclusion/return.
- **AC28-R17-04:** Given resumed preparation, when independent work is inspected, then no sharing, verification, grant, coach access, task, communication, subscription or money changed; ended participation requires deliberate eligible reselection, while temporary withholding without ended participation does not manufacture another inclusion ceremony.

## REQ28-R18 — Enforce expiry and qualified disposal

**Story US28-R18:** As a missionary and records operator, I want expiry, holds and disposal to be distinct, so that retained evidence does not become renewed ordinary access.

**Decision basis:** D28 C06–C08/C11–C13/C16/C17; D27 C07/C17; completeness C15.

At a controlling departure deadline, all dependent ordinary reads/discovery/resume stop even if a worker is late/failing. A successfully resumed entry is governed by current-work retention, not its ended departure schedule.

Holds preserve exact qualified custody only and confer no ordinary read/resume right. Hold review date is not automatic release. Hold, resume, correction and destructive acceptance share the qualified source ordering boundary.

Dispose only qualified bodies/actual derivatives; preserve independently scheduled minimal evidence and unrelated CRM/finance/consent facts. Report primary copy outcomes and backup limitations honestly; do not claim all copies destroyed from one successful row delete.

A stale deletion worker cannot remove a now-ineligible target. External deletion ambiguity, if such copies exist, is reconciled under the exact-object irreversible commitment; timeout cannot pretend the deletion is cancelled.

Restore uses complete forward restriction/disposition evidence before release and cannot recover purged bodies or renew deadlines.

- **AC28-R18-01:** Given a controlling preparation deadline, when it is reached, then ordinary discovery/read/Resume stop even if cleanup fails; a validly resumed entry follows normal current-work retention instead.
- **AC28-R18-02:** Given an applicable hold, valid preservation transition or stale destructive worker, when disposal competes, then source ordering prevents removal of an ineligible target; a hold grants no ordinary access and a review date does not release it.
- **AC28-R18-03:** Given qualified disposal, when its outcome is reported, then only scoped bodies/derivatives are removed, independently retained facts/evidence remain, and per-copy/backup or irreversible external ambiguity is reported truthfully rather than treating timeout as cancellation.
- **AC28-R18-04:** Given a restored backup, when reads or jobs reopen, then complete forward restrictions, dispositions and effect-consumption authority apply first without restoring purged content, forbidden access or renewed deadlines.

## REQ28-R19 — Import eligible contact assertions

**Story US28-R19:** As a permitted missionary, I want to import a supported contact file into restricted preparation, so that I can start work without manually recreating every eligible contact assertion.

**Decision basis:** D17 decision/C01–C05/C09; D1/D2; roadmap P30 target-owner acceptance. **Required owner amendment:** bounded missionary reviewer/committer and restricted-preparation target, not broad staff migration access.

Use one Choose file → Review → Import and results journey through P30 intake/P29 private custody/P4/P9 target/P12 authority. No staff-role substitution or routine second reviewer.

Initial field profile admits source-qualified name/display labels, email, phone and faithfully preserved/structured mailing-address assertions. A row needs a usable name/label, email or phone assertion; no universal email/location requirement or forced Party kind.

Explicit multiple-value mappings are required. Source IDs/type/context labels are provenance, not new Party facts. Unsupported notes/care/history/gifts/commitments/goals/credentials/schema/automation fields are shown excluded, never silently accepted.

Intake creates eligible restricted preparation or safely reuses an authorized reference; it neither bulk-updates existing contact fields nor automatically merges/shares/enrolls/sends/verifies anything.

- **AC28-R19-01:** Given permitted intake and a supported file, when Maya follows Choose file, Review, Import and results, then the bounded missionary profile requires no staff-role substitution or routine second reviewer and accepts only target-qualified restricted preparation or authorized reuse.
- **AC28-R19-02:** Given rows with a usable name/label, email or phone assertion, when mapped, then no universal email, location or Party-kind requirement is imposed; supported address meaning and explicit multiple values are preserved.
- **AC28-R19-03:** Given source IDs/type/context labels or unsupported notes, care, history, gifts, commitments, goals, credentials, schema or automation fields, when reviewed, then provenance remains provenance and unsupported fields are visibly excluded without contact overwrite, merge, sharing, enrollment, send or verification.

## REQ28-R20 — Review an immutable import plan

**Story US28-R20:** As a missionary, I want a trustworthy mapping preview, so that only the displayed eligible data is accepted.

**Decision basis:** D17 C03/C04/C10/C19 and ratified format profile.

Preview writes no contact facts and binds exact finalized bytes, selected sheet/header/rows, parser/catalog/mapping versions, purpose/target, proposed effects and relevant revisions. Any change generates a new reviewed plan.

Every candidate row is validated, not merely samples. Keep columns ordinally distinct when headers repeat or are blank; every nonempty column is mapped, explicitly excluded or unresolved.

Conflicting singular mappings, ragged extra cells and merged contact data require correction/exclusion; no silent truncation, last-column-wins or guessed fill-down.

Preserve meaningful Unicode, prefixes and original uncertainty. Do not split couples, infer a country, fabricate lost digits or call imported assertions verified. Warn when numeric cells may already have lost zeros/precision.

- **AC28-R20-01:** Given finalized bytes and selected sheet/header/rows, when Review is produced, then every candidate is validated and the plan binds those inputs, parser/catalog/mapping versions, target/purpose, proposed effects and relevant revisions without writing contact facts.
- **AC28-R20-02:** Given changed bytes, scope, mapping or relevant revision after review, when Import is attempted, then a new reviewed plan is required and the old preview cannot authorize different effects.
- **AC28-R20-03:** Given repeated/blank headers, ragged cells, conflicting singular mappings or merged contact cells, when reviewed, then ordinal columns remain distinct and every nonempty column is mapped, excluded or unresolved without silent truncation, last-column-wins or guessed fill-down.
- **AC28-R20-04:** Given Unicode names, couple labels, prefixes or numeric cells that may have lost digits, when previewed, then original meaning/uncertainty is preserved and precision warnings are shown without invented country, name splitting, digits or verification.

## REQ28-R21 — Recover and repeat imports safely

**Story US28-R21:** As a missionary, I want repeated intake to recognize prior accepted work safely, so that recovery does not duplicate contacts or overwrite native corrections.

**Decision basis:** D17 C05–C07/C17/C18; D41 C03; P4 identity boundary.

Retry returns durable row effect receipts. Reuploading identical bytes in the same qualified scope/profile identifies prior work and reviews remaining effects; row number/file hash/tool name alone is not identity authority.

Qualified external IDs bind Tenant, exact target/workspace, source instance, entity kind and established source binding. Reordered/changed files without stable qualified IDs require authorized review; no perfect deduplication claim.

Changed bound assertions preserve current fields, show only authorized discrepancies and direct to ordinary correction outside intake. “Previously imported” is historical acceptance, not a claim of current equality.

Hidden matches do not leak through candidates, accepted/reused/unchanged outcomes, downloads or target references. Reimport cannot reactivate Archived work, restore consent, revive erased content or replay automations.

- **AC28-R21-01:** Given a retried row or identical-byte reupload in the same qualified scope/profile, when reviewed or recovered, then durable prior acceptance is recognized and only remaining effects are proposed; file hash, row number or tool name alone is never person identity.
- **AC28-R21-02:** Given an external ID, when it identifies prior work, then exact Tenant, workspace target, source instance, entity kind and established binding qualify it; reordered/changed input without stable qualified identity goes through authorized review.
- **AC28-R21-03:** Given changed source assertions for an already accepted binding, when imported again, then current native values are preserved and only authorized discrepancies lead to ordinary correction; previously imported describes history, not current equality.
- **AC28-R21-04:** Given hidden matches, archived work, erasure or existing contact restrictions, when reimport runs, then outcomes/downloads disclose no hidden record and do not unarchive, revive content, restore consent or replay automation.

## REQ28-R22 — Preserve imported contact restrictions

**Story US28-R22:** As a missionary, I want imported contact restrictions handled accurately, so that a file cannot silently make a person contactable.

**Decision basis:** D17 C08/C09/C11; P6 recipient/contactability authority; D15 consumer gate.

Imported affirmative subscribed/active/donor flags grant no opt-in, verification, subscription or send authority.

Known negative/ambiguous contactability evidence is not silently ignored, including on reused/previously imported rows. Accept an affected row only when the exact contact/P6 owner atomically accepts scoped restriction/evidence and returns durable authority enforced by actual recipient/D15 gates; otherwise leave the row blocked.

The restriction receipt binds exact Tenant, preparation/recipient/contact revision, source occurrence, channel/list-purpose and provenance. Newsletter-X unsubscribe is not guessed into all-channel suppression, and unrelated independently lawful communication retains its owner meaning.

Import itself sends no message, confirmation, invitation, receipt, notice to the contact or historic trigger.

- **AC28-R22-01:** Given imported affirmative subscribed, active or donor flags, when a row is reviewed or accepted, then they grant no opt-in, verification, subscription or send authority.
- **AC28-R22-02:** Given negative or ambiguous contactability evidence on a new, reused or previously imported row, when acceptance is attempted, then the affected row remains blocked unless its exact contact/communication owner atomically accepts scoped evidence and a durable restriction receipt enforced by actual recipient gates.
- **AC28-R22-03:** Given a qualified restriction receipt, when later contact eligibility is evaluated, then exact Tenant, recipient/contact revision, occurrence, channel/list-purpose and provenance apply without converting one newsletter unsubscribe into all-channel suppression; intake itself sends no message or historic trigger.

## REQ28-R23 — Track truthful row outcomes

**Story US28-R23:** As a missionary, I want truthful per-row results and resumable progress, so that weak connections and partial failures do not force me to repeat accepted work.

**Decision basis:** D17 C11/C16/C18/C19; P30 bounded recoverable processing.

Each selected business candidate has exactly one current outcome: pending, accepted, previously-imported, skipped, needs-review, failed or not-processed; these counts sum to selected candidate total. Excluded rows/columns are separate. Counts describe rows, never automatically unique people.

Accepted distinguishes new preparation from reused authorized reference; not-processed identifies cancellation, expiry or authorization stop. Preserve outcome history and never label partial success all-failed.

Row or necessary owner-defined dependency-group acceptance atomically checks current scope/revision/cancellation/expiry/worker fence and persists effect, provenance, required restriction receipt and result/audit. No whole-file transaction is promised.

Reclaimed workers cannot commit with an old lease generation or skip unprocessed work. Recover from source effect receipts, not cursor position alone; reopen only retained/eligible input under current authority.

- **AC28-R23-01:** Given a reviewed selection, when results are displayed, then each business candidate has exactly one of pending, accepted, previously-imported, skipped, needs-review, failed or not-processed and those counts sum to the selected candidate total; exclusions are separate and rows are not called unique people.
- **AC28-R23-02:** Given partial acceptance followed by cancellation, expiry, denial or failure, when results reload, then accepted new/reused effects remain truthful and not-processed rows show the actual stop reason rather than an all-failed claim.
- **AC28-R23-03:** Given row or owner-required dependency-group acceptance, when it commits, then current scope/revision/cancel/expiry/worker fence and required effect/provenance/restriction receipt/result/audit succeed together without promising one whole-file transaction.
- **AC28-R23-04:** Given a reclaimed worker or lost response, when processing resumes, then stale lease generations cannot commit and durable source receipts prevent both skipped pending work and repeated accepted effects; expired/unreadable input is not reopened.

## REQ28-R24 — Cancel or discard intake

**Story US28-R24:** As a missionary, I want to cancel or discard an import with clear consequences, so that stopping it does not erase already accepted contacts.

**Decision basis:** D17 C16/C17/C21/C23; D4 deliberate Return; completeness C06/C15.

Cancel orders against row acceptance, stops future acceptance and reports rows already accepted. Cancellation alone need not discard still-eligible input.

Discard immediately blocks further input/artifact access and acceptance and starts the qualified disposal obligation. Deleting a run/file never deletes contacts.

Any source-qualified undo refuses unsafe reversal after later edits, merges, sharing or independent/immutable coverage and points to the source correction path. D17 does not require a new batch-undo engine.

A kill switch stops new acceptance while preserving durable outcomes; re-enable does not replay history or defeat current erasure dispositions.

- **AC28-R24-01:** Given import acceptance in progress, when Cancel orders against a row commit, then no later acceptance occurs and already accepted rows remain accurately reported without necessarily discarding eligible input.
- **AC28-R24-02:** Given Discard, when accepted, then raw/artifact access and further acceptance stop immediately and disposal begins without deleting accepted contact facts.
- **AC28-R24-03:** Given later edits, merges, sharing or independent immutable coverage, when an optional qualified undo is requested, then unsafe reversal is refused with a source correction path rather than a new generic batch-undo promise.
- **AC28-R24-04:** Given a stopped intake capability, when it is later re-enabled, then retained outcomes remain recoverable under current authority and no historic effect or erased input is automatically replayed.

## REQ28-R25 — Enforce the supported file profile

**Story US28-R25:** As a missionary, I want supported file limits and format problems explained before acceptance, so that the importer is predictable and does not execute spreadsheet content.

**Decision basis:** D17 C12/C22 and ratified Initial file and custody profile.

Enforce the ratified initial profile: uploaded file ≤10 MiB (10 × 1,048,576 bytes); selected-range nonblank processing data rows ≤10,000 before hidden/error/skip exclusions; parsed slots ≤500,000 across whole workbook/file including explicit empties; actual decompressed XLSX package ≤128 MiB; actual ZIP members ≤4,096; decoded cell text ≤32 KiB UTF-8; one explicitly selected worksheet; source columns ≤16,384. Stricter target-field limits win without truncation.

Count actual bytes/members/cells before and during work, not trusted Content-Length, dimensions or ZIP declarations. Sparse absent coordinates neither allocate nor count; hidden/unselected content still consumes applicable resource bounds. Reject traversal, ambiguous duplicate parts and unsafe entities/references.

Admit qualified CSV/data-only XLSX plus .tsv/.txt through the same text parser. Support UTF-8 with/without BOM, BOM-identified UTF-16 and explicit Windows-1252 recovery; preview confirms proposed comma/semicolon/tab dialect. Unsupported encoding has a useful resave instruction.

Execute no formulas/macros/embedded objects/external links and fetch no referenced resources. Reject encrypted/legacy/macro formats disguised by extension. Flag saved scalar formula caches as assertions; missing/error caches block affected mapped cells, and caches are never durable-ID proof.

Prove N−1/N/N+1 for every numeric boundary, worst-distribution memory/CPU/worker deadline, cancellation and tenant fairness. These are admitted qualification limits, not demonstrated capacity.

- **AC28-R25-01:** Given a supported input, when actual upload/parsing proceeds, then the limits are 10 MiB uploaded bytes, 10,000 selected-range nonblank data rows before hidden/error/skip exclusions with the header excluded, 500,000 parsed slots across the whole file/workbook including explicit empty slots, 128 MiB actual expanded XLSX bytes, 4,096 actual ZIP members, 32 KiB decoded UTF-8 per cell, one explicitly selected worksheet, and 16,384 source columns per CSV record or XLSX XFD. Each N+1 boundary fails without truncation, stricter target-field limits win, and declared lengths, dimensions or ZIP metadata cannot bypass actual accounting.
- **AC28-R25-02:** Given sparse, hidden, unselected or explicit-empty data, when resource totals are computed, then sparse absent coordinates allocate/count nothing while explicit slots and actual archive bytes/members count as specified; traversal, duplicate ambiguous parts and unsafe references are rejected.
- **AC28-R25-03:** Given qualified CSV/data-only XLSX or TSV/TXT text input, when previewed, then UTF-8 with/without BOM, BOM-identified UTF-16 or explicitly chosen Windows-1252 recovery and suggested comma/semicolon/tab dialect are confirmed without machine-locale inference; quoted separators/newlines are preserved and uncertain decoding is reviewable rather than silently replaced. Unsupported, encrypted, legacy or macro input receives a clear safe resave path rather than execution.
- **AC28-R25-04:** Given formulas, caches, macros, embedded objects or external links, when parsed, then nothing executes or fetches externally, scalar caches are flagged as unverified assertions, missing/error caches block affected mapped cells and no cache establishes durable identity.
- **AC28-R25-05:** Given the worst admitted input distribution and concurrent tenant work, when release qualification runs, then memory, CPU, deadlines, cancellation and fairness stay within the published measured envelope; profile limits alone are not presented as demonstrated capacity.

## REQ28-R26 — Dispose private intake material

**Story US28-R26:** As a missionary and records operator, I want private import custody with a clear working deadline, so that files and errors do not become an indefinite second contact database.

**Decision basis:** D17 C13/C20/C21/C23; P29; ADR-0212.

Originals, filenames, staging, previews, error files and recovery material use private P29 purpose-bound custody, finalized integrity and required quarantine/scan controls. A public image uploader or broad staff File Manager right is insufficient.

Working access/new row acceptance ends seven days after server-recorded finalized upload; reads, edits/retries/jobs do not extend it. Unfinished uploads are separately removed within 24 hours of initiation.

Purge eligible primary raw/derived content within 24 hours after expiry or discard; after the last lawful blocking hold/reference releases, purge within 24 hours. Holds delay physical disposal, not ordinary expiry. Accepted contact facts/minimal receipts use their source schedule; backups have their separate bounded schedule.

Recovery after expiry uses minimized accepted-effect receipts, not expired raw rows. A governed new upload/run may review remaining effects using prior lineage; it cannot renew the old deadline or repeat accepted effects.

Correction artifacts require current export policy and the same custody expiry. Prefer qualified XLSX explicit text cells without formulas/active links; any CSV uses ADR-0212's single shared encoder, quoting/CRLF/BOM and accurate limitations after spreadsheet save/reopen.

- **AC28-R26-01:** Given private originals and derived import material, when upload is finalized and custody begins, then exact purpose-bound authority, integrity and quarantine/scan rules protect originals, filenames, staging, preview, errors and recovery material without public uploader or broad File Manager access.
- **AC28-R26-02:** Given server-recorded finalized upload time, when seven days elapse, then ordinary working access and new row acceptance end without sliding on read/edit/retry; unfinished input is removed within 24 hours of initiation.
- **AC28-R26-03:** Given expiry, Discard or release of the last lawful blocking hold/reference, when disposal runs, then eligible primary raw/derived content is purged within 24 hours; holds do not extend ordinary access and accepted facts/minimal receipts/backups retain their separate qualified schedules.
- **AC28-R26-04:** Given expired raw input, when outcome recovery or a governed new run occurs, then minimized accepted-effect evidence prevents replay without reopening or renewing old custody; correction-artifact export requires current export permission and the same expiry, with explicit-text XLSX or the single ADR-0212 CSV contract.

## REQ28-R27 — Record the original referral date

**Story US28-R27:** As a missionary, I want to record when a referral was actually given to me, so that late entry does not pretend I received a fresh introduction today.

**Decision basis:** D39 C01/C03/C06/C13; P9 referral edge/source owner; glossary Original referral date.

Reuse qualified source evidence; ask one original-date question only when needed, with an explicit unknown path. Preserve original referral event, recipient, lineage and factual precision separately from entered/imported/accepted times.

Creation, first view, import, reassignment, merge or retry never creates a later original event or second initial window. A genuinely separate introduction requires source evidence, not another row.

Preserve a qualified date-only assertion without inventing midnight. Exact instants derive their calendar date in the declared organization calculation zone while retaining source precision/provenance. Known dates from another zone are not converted by inventing missing time.

Unknown/approximate dates remain unconfirmed, not Today/Active/Expired/Continue eligibility. Reject a clearly future event as already given; treat apparent future dates from date-line/zone differences through contextual validation. Planned work remains planned.

- **AC28-R27-01:** Given qualified original-referral evidence, when recording begins, then it is reused; otherwise one needed original-date input includes an unknown path and preserves recipient, lineage and factual precision separately from entry/import/acceptance time.
- **AC28-R27-02:** Given later entry, first view, reassignment, merge, import or retry, when recording is accepted, then none creates a new original introduction or another initial window without evidence of a genuinely distinct event.
- **AC28-R27-03:** Given date-only, exact-instant or other-zone date evidence, when interpreted, then date-only precision is preserved, exact instants derive the date in the declared organization zone, and missing time is never fabricated.
- **AC28-R27-04:** Given unknown/approximate or apparently future evidence, when validated, then unknown remains unconfirmed without deadline or Active/Expired/Continue status, clearly future completed events are rejected, and valid date-line cases receive contextual validation while planned work remains planned.

## REQ28-R28 — Calculate the New calendar window

**Story US28-R28:** As a missionary, I want the new referral's last follow-up day shown clearly, so that I know the real window without selecting another date.

**Decision basis:** D39 C02–C04/C13; explicit supersession of D38 C02 for New only.

New uses the configured positive whole calendar-day count N, original date D counted as day one, last included date D+N−1 in the declared organization zone. One day ends that same day; a 30-day October 1 example ends through October 30. These examples are not default durations.

Freeze D/N, zone, calendar interpretation, policy evidence and finite endpoint E at first acceptance. E is the first valid instant at the start of D+N in that zone: first valid instant after missing midnight, earlier repeated midnight occurrence, next existing date if target date is skipped.

Trusted time at/after E is expired regardless of cached flag or worker lag. Preserve E across travel, zone/settings and timezone-rule changes; where nominal last-day wording becomes misleading, show actual stored endpoint with current date/time/offset, declared zone and concise explanation.

A date-only referral can have less than 24 remaining hours; settings help makes calendar versus Continued elapsed-day meaning explicit. Do not add a clock-mode selector or per-item expiry override.

- **AC28-R28-01:** Given New period N and original date D, when a first calendar window is accepted, then D is day one, the nominal last included date is D+N−1 and N=1 ends that same calendar day; Maya chooses no per-referral date.
- **AC28-R28-02:** Given a qualified calculation zone, when the endpoint is frozen, then E is the first valid instant starting D+N, using the first valid instant after missing midnight, earlier repeated midnight or next existing date after a skipped date; D/N/zone/interpretation/policy evidence remain attributable.
- **AC28-R28-03:** Given stored E, when time reaches E or ordinary settings, travel, zone or timezone-rule data changes, then expiry remains tied to E rather than a stale flag or recomputation; misleading nominal wording is replaced by the actual endpoint with date/time/offset and zone.
- **AC28-R28-04:** Given New and Continued help or review, when displayed, then calendar-day inclusion and possible less-than-24-hours remainder are clear and distinct from elapsed-day continuation without a clock-mode setting.

## REQ28-R29 — Record late and incomplete referrals

**Story US28-R29:** As a missionary, I want a late or incomplete referral recorded honestly, so that useful history is not rejected or silently renewed.

**Decision basis:** D39 C05/C06/C10/C13/C14; D34 C03/C06.

A genuinely first window uses the current qualified New policy at deliberate source acceptance A against the original date; record when the policy was actually applied without pretending it governed historically or granting backdated access.

Active work is possible from A inclusive and before E with all current predicates. If E≤A, accepted recording yields Expired atomically without temporary Active or automatic Continue.

Preserve an existing accepted window; missing prior evidence is not proof no window existed. Unknown policy/zone/provenance blocks only dependent calculation/effect and gives a safe owner repair path, while truthful incomplete recording remains possible where admitted.

Historical recipient proof and current D34 projection rights separately determine what history Maya may see. “Recorded” and “active” are distinct outcomes.

- **AC28-R29-01:** Given a genuinely first referral window with original date evidence, when deliberately accepted at A, then the current qualified New policy is applied transparently without claiming historical governance or granting access before acceptance.
- **AC28-R29-02:** Given E≤A, when the late referral is accepted, then it is recorded as Expired without temporary Active or automatic Continue; when A<E, active use additionally requires all current predicates and ends at E.
- **AC28-R29-03:** Given an existing accepted window or missing prior proof, when recording resumes, then accepted terms are preserved and absence of evidence is not assumed to mean no window; unresolved policy/zone/provenance gates dependent calculation while permitted incomplete recording remains truthful.
- **AC28-R29-04:** Given a recorded expired referral, when Maya requests history, then separate historic-recipient and current projection authority determine the result rather than treating Recorded as Active.

## REQ28-R30 — Configure New and Continued periods

**Story US28-R30:** As authorized tenant staff, I want independent New and Continued referral periods in one place, so that our organization can configure its work without asking missionaries to administer dates.

**Decision basis:** D36 C01–C03/C05–C08; D38 C01–C08/C12/C15; D39 C02/C08/C09.

Two independent positive whole-number finite periods may be equal, smaller or greater than each other within the qualified supported range. New uses calendar days; Continued uses 86,400-second days. No inheritance, copied default, zero/blank-as-Never, third mode or per-missionary/project/referral override.

Before activation P9/API publishes exact supported integer/timestamp/serialization bounds enforced identically by UI/API/database; reject invalid, fractional, nonnumeric, unsafe and overflowing input without clamping/rounding.

Preserve qualified saved values. Unconfigured New blocks only dependent new initial acceptance; unconfigured Continued blocks only dependent Continue, including staff. Neither ends accepted work or disables other qualified actions. Read failure is not unconfigured.

One normal Save/Cancel applies deliberate valid changes atomically with expected base revision, audit and recovery. Untouched unconfigured values may stay absent; attempted Clear of a configured period fails. Relevant-kind changes alone invalidate relevant reviews; editing New alone does not invalidate unchanged Continued terms.

Ordinary edits are prospective and preserve accepted kind/period/end/policy/semantic basis. Saving a period never enables self-service or supplies action rights. Disabling action remains possible despite invalid unsaved drafts.

- **AC28-R30-01:** Given authorized settings access, when staff edit the two periods, then New calendar days and Continued 86,400-second days are independent finite positive integers that may be equal or different within qualified bounds, without inheritance, per-item override or implied Never.
- **AC28-R30-02:** Given invalid/fractional/nonnumeric/overflowing values or a changed base revision, when Save is attempted, then the entire selected change is rejected without clamping or partial update; valid selected changes commit atomically with audit and recovery.
- **AC28-R30-03:** Given one unconfigured kind, when its dependent action is attempted, then only that kind is gated; read failure is not Unconfigured, untouched absence may remain, and Clear of an already configured value fails while independently valid work remains usable.
- **AC28-R30-04:** Given accepted windows and unchanged terms of the other kind, when a policy changes, then existing windows and other-kind reviews remain intact; saving periods grants no action rights or self-service enablement and disabling an action remains possible despite an invalid unsaved draft.

## REQ28-R31 — Read minimal expired-referral history

**Story US28-R31:** As a missionary, I want limited expired-referral history in my ordinary referral view, so that I recognize earlier work without assuming I may still access its private details.

**Decision basis:** D34 C01–C06/C11/C15/C16; narrow active-relationship-only projection exception C02; ADR-0209.

Active remains initial view; an optional Expired filter exists only when current organization/source/history authority admits it. It is not a separate archive, inbox, review requirement or personal feature toggle.

Prove that this exact referral previously belonged to Maya's authorized work before ordinary expiry, including an eligible prior handoff recipient. Creation-time exclusivity is not required; new assignment, same email or Party merge is not historic proof.

Closed projection contains only approved recognizable name/safe alias, necessary source reference, Expired meaning and permitted known dates/precision. No email/phone/address/portrait/location/referrer/private context/notes/giving/history, nor fallback to hidden initials or raw IDs. Omit a row with no useful safe identification from results and counts.

Explain once that its follow-up window ended and contact details are not shown here. Expired never means donor refusal, Never Ask, lost support or low value. No broad contact-card link follows from this history purpose.

- **AC28-R31-01:** Given an authorized referral view, when opened, then Active is initial and the optional Expired filter appears only under its exact current history/source authority without another archive or required review workflow.
- **AC28-R31-02:** Given evidence the exact referral previously belonged to Maya's authorized work, including a valid prior handoff, when ordinary expiry history is projected, then that proof qualifies independently of creation recipient; new assignment, matching email or Party merge alone does not.
- **AC28-R31-03:** Given an eligible history entry, when listed or searched, then only approved recognizable identification, necessary source reference, Expired meaning and permitted known dates/precision are disclosed; hidden contact/context fields never supply labels, and entries lacking useful safe identification disappear from results and counts.
- **AC28-R31-04:** Given an Expired entry, when Maya reads its explanation, then the ended work window and unavailable contact details are clear without implying refusal, Never Ask, lost support or a broad contact-card grant.

## REQ28-R32 — Keep expired history purpose-limited

**Story US28-R32:** As a missionary, I want expired history to remain read-only and purpose-limited, so that opening an old referral does not renew it or erase independent access.

**Decision basis:** D34 C07–C14/C17/C18/C21/C22; D35 C10/C12.

Filtering/searching/reading changes no status, dates, retention, task, interaction or communication. Source telemetry is not an outreach event.

Withdrawal, invalidation, privacy revocation, departure and generic archived/ended statuses do not qualify as ordinary expiry. Source corrections affect current eligibility without rewriting lawful history.

Ordinary supporter access is evaluated independently: D34 denial does not remove another valid path, and that path does not expose protected referral context. Retention/hold alone grants no historical read.

Search only admitted fields, before pagination/counts; hidden phone/note matches reveal nothing. No new export, print list, AI, sync or offline roster is added.

- **AC28-R32-01:** Given expired history, when filtered, searched or opened, then no business state, date, retention, task, interaction or communication changes and telemetry is not treated as outreach.
- **AC28-R32-02:** Given withdrawal, invalidation, privacy revocation, departure or a generic archived/ended state, when history eligibility is evaluated, then it does not masquerade as ordinary expiry and retention/hold alone creates no read right.
- **AC28-R32-03:** Given a separate current supporter-access grant, when either history or ordinary contact is read, then each purpose is evaluated independently without a denial removing another valid path or that path exposing private referral context.
- **AC28-R32-04:** Given hidden phone, email, referrer, location or notes, when searching or counting, then no hidden match signal is disclosed before paging; history creates no new export, print, AI, sync or offline roster purpose.

## REQ28-R33 — Control missionary continuation

**Story US28-R33:** As authorized tenant staff, I want one control for missionary continuation, so that self-service is optional without interrupting authorized staff work.

**Decision basis:** D35 C01/C02/C06/C19/C22; D36 C02; D38 C04; D39 C08.

Allow missionaries to continue expired referrals starts Off for new/unconfigured tenants; preserve an existing explicit qualified choice. Existing scoped grants decide eligible actors; no per-ministry matrix or personal switch.

Off stops new missionary-lane acceptance at the source boundary. It does not undo accepted cycles, expire active work, remove independently permitted history, cancel independent work or revoke staff's separate authority. Tenant staff can restrict their own action grants through existing administration.

A caller-supplied role/surface/mode cannot switch a missionary command into staff authority. Enabling alone grants no universal authority and does not replay rejected/stale intent.

Settings Save and source acceptance share relevant policy ordering, including unconfigured→first enable and A→B→A; pending/effective states stay truthful.

- **AC28-R33-01:** Given a new/unconfigured tenant, when continuation is configured, then the single organization-wide missionary-continuation control starts Off, preserves explicit qualified existing choices, and uses existing exact scope grants without a per-ministry or personal setting.
- **AC28-R33-02:** Given Off accepted before a missionary Continue, when acceptance is attempted, then the missionary lane is fenced while independently permitted staff action, history, accepted active cycles and unrelated work remain intact.
- **AC28-R33-03:** Given caller-supplied role/mode/surface or a later re-enable, when a command arrives, then it cannot escape through the staff lane, revive a rejected intent or auto-renew work; only fresh authorized intent may qualify.
- **AC28-R33-04:** Given configuration changes including unconfigured-to-enabled or A-to-B-to-A, when settings and continuation compete, then authoritative policy ordering produces a truthful effective result rather than a stale UI-only gate.

## REQ28-R34 — Continue an eligible referral once

**Story US28-R34:** As an authorized missionary or staff member, I want to continue one eligible expired referral in one action, so that current work resumes on the same truthful lineage.

**Decision basis:** D35 C03–C07/C10/C17; D36 C04/C07–C10/C15/C16; D38 C09; P9 A4/A17.

Current exact source/cycle responsibility, action permission, ordinary-expiry eligibility, privacy and policy are required. History visibility alone is insufficient; the command admits expired inputs without requiring a fake already-active relationship.

Preview explains Continued period and estimated end date/time/zone. Maya chooses no date and supplies no routine reason/approval/referrer form; source-required prerequisites remain binding. A relevant changed policy, end calendar date or display-zone context requires refreshed review/new deliberate intent, not a second-by-second confirmation loop.

After required ordering/waits, capture fresh trusted database instant A; compute E=A+N×86,400 seconds exactly and atomically accept one new cycle with A/E/N/policy/audit/activity/outcome evidence. Active is A≤now<E subject to other current rules; at E it is expired.

Preserve original introduction/prior cycles. At most one successor consumes an expired cycle across missionary/staff and different transport keys. Accepted result shows actual endpoint and current permitted active projection, not blindly restored old private fields.

- **AC28-R34-01:** Given ordinary expired-cycle eligibility, exact current responsibility, action/privacy authority and qualified Continued policy, when review opens, then the period and estimated endpoint/zone are shown without another date, routine reason, approval or referrer form; required source prerequisites remain enforced.
- **AC28-R34-02:** Given a relevant changed policy, resulting end calendar date or display-zone context after review, when acceptance is attempted, then fresh review and deliberate intent are required, while ordinary within-date drift causes no second-by-second confirmation loop.
- **AC28-R34-03:** Given valid final authority after all ordering waits, when Continue commits, then fresh trusted A and E=A+N×86,400 seconds, one successor cycle and required audit/activity/recovery evidence are accepted atomically; Active holds only for A≤now<E subject to other current restrictions.
- **AC28-R34-04:** Given competing authorized actors or different transport keys for one expired cycle, when both attempt continuation, then at most one successor consumes it, original lineage remains, and the accepted result shows the actual endpoint with current permitted fields instead of restored stale private content.

## REQ28-R35 — Recover continuation safely

**Story US28-R35:** As a missionary, I want safe recovery of a continuation outcome, so that retrying cannot open a second window or conceal a later expiry.

**Decision basis:** D35 C08/C09/C15; D36 C09/C10/C14; D39 C10/C14.

Unknown response offers current-authority recovery of original intent. Accepted retry returns original performer/terms/endpoint; it cannot consume a later expired cycle or compute another deadline.

A definitive rejection remains no-effect even if policy later returns or time makes the referral eligible; fresh intent requires fresh deliberate action. If qualified recovery evidence has expired, reject safely without re-executing.

Distinguish accepted earlier outcome from current state after another expiry, correction or continuation. Recovered success does not mean Active now. Current disclosure may withhold fields without rolling back accepted business truth.

Stale expiry work targets exact cycle/end/revision and cannot end its successor. Reconnection does not queue automatic new privileged work.

- **AC28-R35-01:** Given a lost response to accepted Continue, when the original intent is recovered, then the original performer/terms/endpoint are shown under current authority without another deadline or consumption of a later expired cycle.
- **AC28-R35-02:** Given a definitively rejected intent or expired qualified recovery evidence, when policy/time later changes and the old intent retries, then it produces no new effect; any further continuation requires fresh deliberate intent.
- **AC28-R35-03:** Given an earlier accepted continuation and later expiry/correction/continuation, when recovery displays the earlier outcome, then current state is distinguished from accepted history and protected fields may be withheld without reversing truth.
- **AC28-R35-04:** Given an old expiry worker or reconnection, when processing resumes, then exact cycle/end/revision fencing prevents ending a successor or queuing automatic privileged continuation.

## REQ28-R36 — Correct referral timing with evidence

**Story US28-R36:** As an independently authorized source corrector, I want to repair a mistaken referral date or expiry with evidence, so that correction restores truth without counterfeit renewal.

**Decision basis:** D39 C07/C10–C12; D34 C14; D35 C12; P9 source correction.

Require exact scoped correction power, factual evidence, expected revision and deliberate before/after effective date/state review. General contact editing or a reason string alone is insufficient.

Recalculate from the originally accepted period/zone/semantic basis, never today's policy or a fresh start. Append actual correction history; preserve earlier assertions/acceptance/access history. Corrected endpoint may move either direction or repair a false Expired flag without another initial window or continuation.

All current read/action/display/expiry paths use the corrected effective result. If a continuation already exists, preserve its accepted terms and consumed lineage; do not reactivate predecessor, overlap cycles or silently reschedule successor. A true lineage contradiction enters owner reconciliation.

Correction cannot bypass withdrawal, refusal, erasure or revoked authority; ordinary Continue remains unavailable for active current work. No generic Undo or broad status/date PATCH.

- **AC28-R36-01:** Given exact scoped correction authority, factual evidence and expected revision, when a referral timing correction is reviewed, then before/after effective dates/states are shown; contact-edit permission or a reason alone is insufficient.
- **AC28-R36-02:** Given accepted original period, zone and semantic basis, when correction commits, then the effective endpoint is recomputed from those terms in either direction with attributable history, never from today's policy or a fresh start.
- **AC28-R36-03:** Given a later accepted continuation, when original timing is corrected, then its accepted terms and consumed lineage remain intact without predecessor reactivation or overlap; genuine contradictions enter owned reconciliation.
- **AC28-R36-04:** Given withdrawal, refusal, erasure or revoked authority, when correction is attempted, then it cannot bypass those constraints; there is no broad status/date patch or generic Undo and an active referral is not eligible for ordinary Continue.

## REQ28-R37 — Keep referral effects independent

**Story US28-R37:** As a missionary, I want referrals to remain distinct from contact permission and other work, so that expiry or continuation never creates an unintended ministry action.

**Decision basis:** D34 C07/C08/C13/C14; D35 C10–C12/C16; D36 C11/C17; D39 C12.

Referral work periods are not contact consent, retention, task deadlines, supporter interest, coaching access or finance. Earlier privacy/source restrictions may end an access path without rewriting the window.

Continuation creates no donor response, new introduction, cultivation reopening, send, interaction credit, automatic duplicate task or revival of completed/cancelled work. Independent promised/planned follow-up follows its own source lifecycle.

Referrals to the same Party remain source-distinct. Merge/reassignment neither combines referral occurrences/history nor transfers another person's history rights. A qualified source collision resolves without another fake edge.

D27/D28 preparation retention does not become referral retention; continuing a new source cycle never resets old personal-data retention or restores held-only/erased content.

- **AC28-R37-01:** Given a referral window, when it expires or continues, then it does not grant contact consent, alter source retention/task deadlines/coaching/finance or imply supporter interest; earlier source/privacy restrictions can still withhold access.
- **AC28-R37-02:** Given successful Continue, when downstream records are inspected, then no donor response, introduction, cultivation reopening, send, interaction credit, duplicate task or revival of completed/cancelled work was fabricated.
- **AC28-R37-03:** Given multiple referral occurrences to one Party or a later merge/reassignment, when relationships are resolved, then exact occurrence/history and another recipient's history rights remain distinct without fake replacement edges.
- **AC28-R37-04:** Given preparation retention or held-only/erased referral content, when a referral cycle continues, then neither preparation deadlines nor old referral-body retention is reset and forbidden content is not restored.

## REQ28-R38 — Author an optional starting guide

**Story US28-R38:** As authorized tenant staff, I want to author one optional starting guide, so that our organization can offer useful suggestions without maintaining a course platform.

**Decision basis:** D37 C02/C04/C05/C07/C09/C10; P28 guide owner, resource publication owner/P29 custody/P12 access.

Edit title/introduction/suggested content/order and approved destinations; begin blank or from original editable examples. No method, step count, script, quota or outcome is compulsory. Publish requires at least one nonempty audience-safe suggestion.

Each suggestion may contain advice without links, at most one approved resource reference and at most one registered existing workspace entry. No arbitrary internal route/record-ID/mutation payload/script/HTML or separate external-link catalog.

Staff review exact audience safety and rights to resources/material. No copying private record context, restricted commercial curricula or source metadata into a broader guide; no automatic semantic-classifier promise.

Save draft does not offer or modify the live revision. Preview/publish use current curation authority and expected base; Publish changes accepts one coherent whole revision atomically with minimal effect evidence.

- **AC28-R38-01:** Given authorized guide curation, when staff create or edit a draft, then title, introduction, suggestion content/order and qualified destinations are editable from blank or original examples without a compulsory method, script, count, quota or outcome.
- **AC28-R38-02:** Given a suggestion, when validated for publication, then it may be advice-only or contain at most one approved resource and one registered existing workspace entry; arbitrary routes, record IDs, mutation payloads, HTML/scripts and a separate external-link catalog are not accepted.
- **AC28-R38-03:** Given exact audience/resource rights, when staff publish, then at least one nonempty audience-safe suggestion and one coherent revision commit under current authority/base with minimal accepted-effect evidence; draft Save alone never changes the live guide.
- **AC28-R38-04:** Given protected record context or material without rights, when curation is reviewed, then it is not copied into a broader guide and no automatic classifier is claimed to make unsafe text safe.

## REQ28-R39 — Use and revisit the optional guide

**Story US28-R39:** As a missionary, I want to use, skip and revisit the guide freely, so that suggestions help my work without measuring or controlling it.

**Decision basis:** D37 C01/C03/C05/C06/C11/C12.

Offered guide has one stable Resources entry; dismissible Home/Help links resolve to that same current guide. Home dismissal is user/Tenant-scoped, reversible and persists through routine revision/re-offer without becoming progress.

Any suggestion may be used in any order. No tenant setting or content acknowledgment gates ordinary work. No completion checklist, course sequence, staff/coach progress, streak, behavioral score or automated reminder.

Links navigate only; browsing, preview, prefetch and open do not create tasks, change stage, import contacts, send, give, subscribe or claim an interaction.

Current guide/resource/destination authority is checked before metadata disclosure and at use. Withhold denied target and dependent unsafe wording; retain independently safe advice only where declared conditions prove separation. Otherwise withhold the whole step without hidden numbered gaps/counts.

- **AC28-R39-01:** Given an offered guide, when Maya enters Resources or dismissible Home/Help links, then they resolve the same current guide; dismissal is reversible, user/Tenant-scoped and survives ordinary revision/re-offer without progress tracking.
- **AC28-R39-02:** Given optional guidance, when Maya skips, returns or uses suggestions in any order, then ordinary work remains available without completion/acknowledgment gates, staff/coach progress, scores, streaks or automated reminders.
- **AC28-R39-03:** Given guide browsing, preview, prefetch or navigation, when performed, then no task, stage, import, send, gift, subscription or interaction is created.
- **AC28-R39-04:** Given a destination or resource is no longer admitted, when guide metadata or links are delivered or used, then unsafe targets/dependent wording are withheld; independently safe advice remains only under qualified separation, otherwise the whole step is omitted without revealing hidden numbering/counts.

## REQ28-R40 — Disable and re-offer the guide

**Story US28-R40:** As authorized tenant staff, I want to disable and later re-offer the guide deliberately, so that changes do not affect independent resources or secretly undo my choice.

**Decision basis:** D37 C07/C08/C10/C12–C15.

Existing/new tenants begin without an offered guide; any seeded examples are draft-only. Deliberate publication is required before discovery.

Disable stops new guide discovery/delivery under current checks, even with invalid unsaved draft. It deletes no resource or independent work and grants no new audience.

Stale save/publish/retry/restore cannot re-offer it; re-offer is fresh authorized deliberate acceptance against current dependencies. Recover prior command outcome separately from current availability.

Reorder works without dragging, and complete curation/reader flows preserve keyboard/focus/status/reflow. No new onboarding vendor, course engine, tracking/URL-unfurl or video dependency.

- **AC28-R40-01:** Given a new or existing tenant without deliberate publication, when the workspace opens, then no guide is offered and any examples remain drafts.
- **AC28-R40-02:** Given an offered guide and an invalid unsaved draft, when authorized staff Disable, then new discovery/delivery stops without deleting resources, changing independent work or requiring the draft to become valid.
- **AC28-R40-03:** Given Disable followed by stale Save, Publish, retry or restore, when processed, then it cannot re-offer the guide; a fresh current-authority re-offer is required and recovery distinguishes previous command acceptance from current availability.
- **AC28-R40-04:** Given keyboard, assistive technology, touch or narrow viewport use, when authoring, reordering or reading, then the complete flow works without drag-only controls or inaccessible status/focus and requires no new tracking, course, unfurl or video service.

## REQ28-R41 — Keep contact work native

**Story US28-R41:** As a missionary and tenant administrator, I want contact work to remain native in this release, so that useful ordinary work does not depend on another fundraising product.

**Decision basis:** D41 C01–C05/C09/C11/C12/C16; D5; D17; P21/P31/ADR-0097.

Add no P28 external contact-update/contactability resource, feed, subscription, producer, dormant connector or contact-sync switch. Do not add automatic export or contact-refresh workarounds.

Existing D5 permissions can withhold editing while preserving independently permitted reads/staff work and source history. No separate D41 master flag.

The independently governed P21/P31 giving feed retains its exact field floor, default-Off/setup/current authorization/stop rules. Giving credentials/cursors cannot request contact enrichment, new methods or writeback; reject unsupported expansion before protected enumeration while valid giving work remains usable.

D17 intake, qualified communication/print/export and other independent purposes keep their own scope. A correction affecting an already authorized giving projection is not external contact sync. Native contact UI promises neither pending external synchronization nor “nothing ever leaves Asym.”

- **AC28-R41-01:** Given this release, when external capabilities or requests are enumerated, then no P28 contact-update/contactability feed, producer, subscription, dormant connector or sync switch exists and automatic export/contact-refresh workarounds are not introduced.
- **AC28-R41-02:** Given D5 editing is withheld, when native contact work is used, then independently permitted reads, staff work and source history remain without a new D41 master switch.
- **AC28-R41-03:** Given an existing qualified giving feed, when it is configured or invoked, then its independent field floor, default-Off, admission and stop rules remain unchanged; giving credentials/cursors reject contact enrichment or writeback expansion before protected enumeration while valid giving remains usable.
- **AC28-R41-04:** Given native corrections, qualified intake or independent communication/export, when displayed, then truthful owner outcomes are shown without claiming pending contact synchronization or promising nothing ever leaves Asym.

## REQ28-R42 — Connect ordinary work without inventing facts

**Story US28-R42:** As a missionary, I want a connected but truthful daily journey, so that I can progress from preparation or referral to ordinary work without entering the same fact twice.

**Decision basis:** completeness C01–C03/C06/C08/C12/C16; D1 C10; D4 C05; D34–D39 no-implied-effects; P9/P27/ADR-0183. Detailed task/appointment/Request specifications remain their owning volume.

Within current permissions, preparation/referral can open existing native contact, appointment, task, interaction and P27 Request destinations with safe context reuse. A navigational action creates none of their facts automatically.

Task completion is distinct from recorded encounter, Request response, commitment, gift and send. Restricted preparation acquires no managed-work obligation just because it appears near the queue; managed P27 work retains its next-task-or-owned-exception rule.

Supported negative outcomes, inaccessible contacts, unknown source facts, no coach, optional modules Off and nonfinancial support remain usable ordinary paths. Do not fabricate a gift, send, contact consent or interaction to advance.

Where a composite UI performs separate source actions, show accepted/failed components honestly unless the actual owner contract provides atomicity. One accepted part is never repeated merely to repair another.

- **AC28-R42-01:** Given current permissions, when Maya navigates from preparation/referral to an existing contact, appointment, task, interaction or Request, then authorized context may be reused without creating any of those facts merely through navigation.
- **AC28-R42-02:** Given a completed task, when related domain state is evaluated, then it is not an encounter, response, commitment, gift or send; restricted preparation gains no managed-work duty, while real managed work retains its next-task-or-owned-exception rule.
- **AC28-R42-03:** Given negative outcomes, unknown facts, inaccessible contacts, no coach, optional modules Off or nonfinancial support, when ordinary work continues, then supported paths remain honest without inventing contact consent, money, sends or interactions.
- **AC28-R42-04:** Given a composite action spanning independent sources, when one part succeeds and another fails or becomes unknown, then component outcomes remain truthful unless the owner supplies actual atomicity and repair does not repeat an accepted component.

## State and control contract

These are independent source facts, not a universal status enum or new workflow framework.

| Source/control                | Accepted transition                                                                                                      | Effects that must not be inferred                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Restricted preparation        | Save/edit under current source authority; deliberate D2 share of eligible contact facts                                  | Canonical identity overwrite, shared private history, consent, managed-work enrollment         |
| Preparation working state     | Active → Archived; deliberate current-authority Return → Active                                                          | Person archive, grant change, canceled/restarted task or retention reset                       |
| Ended participation           | Terminate exact access and preserve independently owned duties                                                           | Automatic successor readership, private export, inactivity-as-departure                        |
| Earlier preparation inclusion | Exact eligible same-author/context Resume; one effective inclusion                                                       | Copy/new author, auto-unarchive, revived shares/old inclusion from ended participation         |
| Departure retention           | Source-confirmed episode → retained-before-deadline → expiry → qualified custody/disposal                                | Reads/return to login resetting deadline; hold as access; disposal lag as grace                |
| Selected pre-expiry Resume    | End selected departure schedule applicability and admit same entry to normal current-work retention                      | Extending unselected entries, indefinite retention, changing original history                  |
| Import                        | Finalized private input → immutable reviewed plan → bounded row outcomes; cancel/discard/expiry fence future effects     | Upload as business success; deleting run as deleting contacts; resume as repeat acceptance     |
| Initial referral              | Truthful original event + first deliberate acceptance produces active-if-current, expired-if-ended, or unresolved timing | Created/import date as new introduction; unknown as active/expired; later recording as renewal |
| Continued referral            | Consume eligible expired cycle once; accept new A/E/N terms                                                              | New person/introduction, consent, generic status restore, another cycle on retry               |
| Referral correction           | Evidence-backed append of current effective result using original timing basis                                           | New initial window, counterfeit continuation, predecessor reactivation after successor         |
| Missionary Continue Off       | Fence new missionary acceptance; keep qualified settings editable                                                        | Staff grant revocation, deleting history, ending accepted window or stopping expiry            |
| Guide                         | Draft save separate from publish; deliberate disable/re-offer                                                            | Course completion, tasks/sends, resource deletion, stale publish undoing Off                   |
| D5 edit permission removed    | Deny affected new edits; preserve other valid grants and independent views                                               | Global contact deletion/hidden status, new D41 sync flag or grant copied from role             |

## Implementation decisions and exact owner dependencies

1. **Preparation and inclusion belong to native CRM.** Add the smallest bounded P9 preparation/assertion and current-work inclusion contract required to deliver restricted start and D27. Reuse actual qualified mechanisms where present. P4 keeps canonical identity admission/repair; no fake Party/donor/Ministry Assignment foreign-key target, universal cardinality or parallel ACL/history ledger. D1 packet status stays historical; this is an explicit engineering decision of the authorized spec.
2. **Current authority and static projection registration are cross-surface contracts.** Register preparation, expired-history, continuation review/result, guide and intake result families in the existing static field-policy source. Conditional author/recipient/history/time logic belongs in the shared resolver. D34 requires only the named narrow expired-referral history exception to the active-relationship-only workspace rule; no ordinary supporter DTO widening.
3. **Native commands use P9 A17 with narrow source-owned recovery evidence.** Create/share/archive/return/resume/correct/referral transitions preserve required local atomic source/audit/activity semantics. Do not use payment idempotency headers, provider gates or a generic CRM command journal. P6/P17 own optional D2 notice materialization and current recipient admission separately.
4. **Lifecycle/time extension is source-owned.** P9 qualifies original referral evidence, exact lineage, accepted initial/continued windows, historical recipient proof, one-cycle consumption and evidence-backed correction. P12 qualifies exact read/action scopes and current authority fences. New calendar endpoints and Continued elapsed instants must coexist with unchanged retained windows; source kind/semantic-version omissions cannot silently choose a default.
5. **Retention is purpose-specific.** Preparation source/privacy owner owns departure/current-work policies, supported finite bounds, holds, primary/derivative copy inventory and restoration evidence. Referral custody is separate. P29/P30 own D17's already-ratified seven-day input window and 24-hour disposal duties; do not reuse those numbers for preparation or referral content.
6. **Import is an exact target profile of shared intake.** Amend P30's staff-only reviewer wording for a bounded P28 missionary actor, and P29 for exact private purpose custody. Target owners validate/admit data. Reconcile older P30 shorthand permitting high-band auto-merge with P4/current roadmap: D17 permits none. The adverse-contactability adapter must produce durable authority enforced by actual communication consumers before affected row acceptance.
7. **Guide ownership is bounded P28 content meaning, not public CMS authority.** Reuse qualified content/publication primitives after exact audience/availability qualification; draft/live revisions and one coherent current release are required. Resources retain their source publication and P29 bytes. A registered navigation destination does not confer action authority. D12's historical amendment packet status is not silently changed by D37 or this specification.
8. **Preserve selected scope and existing data.** No extra external contact feed, no blanket contact-permission backfill, no inference of private/shared/archive/expiry state from legacy statuses, no empty-database assumption. Inventory old readers/writers, source provenance, known/unknown historical timing and policy. Stop incompatible writers before exposing new scope; restore/rollback cannot widen permissions or resurrect content/consumed effects.

### Concrete source qualifications required, not broad future-phase dependencies

| Required outcome                     | Exact owner output needed before activation                                                                                                      | Independent work that remains useful                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| Restricted save/share/archive/return | P9 preparation + canonical admission + P12 source/field/history contracts and actual mutation/read qualification                                 | Existing independently authorized CRM/work                     |
| Return and retention                 | P4 original-human resolution; P9 participation/inclusion/departure/correction/disposition; finite privacy profiles; current-history grant        | Ordinary current work without any resumption                   |
| D2 selected staff notice             | Exact P9 event/P6 informational recipient contract/P17 presentation and durable result linkage                                                   | Accepted share with truthful notice pending/failed outcome     |
| Contact correction                   | Eligible field/source inventory and P12 policy path; owner-required destination/contact consequences; roster-rights reconciliation               | Read-only permitted facts and independent staff editing        |
| Contact intake                       | P30 missionary target profile/P29 private custody/parser qualification/P4 matching/P9 target; exact P6 negative-preference adapter where reached | Native manual preparation and already accepted import results  |
| Referral history                     | P9 qualified ordinary-expiry/historical-recipient producer; P12 minimal purpose projection and retention                                         | Independent current supporter/CRM work                         |
| Referral continuation/windows        | Native lineage/cycle mutation; exact actor/grant control; two qualified periods; clock/zone/semantic precision; correction/recovery              | Existing accepted windows and other admitted referral work     |
| Optional guide                       | P28 coherent draft/release/disable owner; qualified resource publication/custody; registered navigation targets                                  | All ordinary native work and independently permitted resources |

Release qualification must bind each semantic command/projection contract in this volume to its actual version, responsible source owner and activation evidence. A roadmap phase name or a rendered button is not that qualification. Missing support does not remove a required selected outcome from scope.

## REQ28-R43 — Operate and contain failures without weakening source rules

**Story US28-R43:** As an accountable source operator, I want bounded diagnostics and explicit containment triggers, so that privacy, integrity and usability failures are repaired without duplicate work or direct data alteration.

**Decision basis:** D17 operational table; D27/D28 operational thresholds; D34–D39 operational tables; D41 monitored risks; completeness C15–C19. The domain-owner role must have an assigned on-call or operational person before activation. Technical traces, durable accepted business effects and security audit are distinct; broad telemetry contains no private preparation or contact bodies.

The following source-specific triggers remain normative. They are not reasons to wait before correcting a known safety problem. A numeric deployment budget referenced below must be measured, published with workload/sample assumptions, and qualified before activation; an undefined budget does not permit activation.

| Signal                                                                                                                                                                            | Threshold                                                                                              | Accountable owner                                            | Required response                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Unauthorized read/write, cross-scope disclosure, hidden-match signal, revived grant, expired ordinary access or new contact-feed egress                                           | Any one confirmed event                                                                                | P12/security incident owner with affected P9/P29/P31 owner   | Contain exact affected readers/writers/egress and controllable caches, retain minimized evidence, repair through owners and requalify before reopening; preserve lawful independent giving/work. |
| Duplicate effect/inclusion/episode/cycle/disposition, altered origin or accepted endpoint, lost required audit, count mismatch, overwritten unrelated field or wrong-cycle expiry | Any one confirmed invariant violation                                                                  | Affected P9/P30 source owner                                 | Fence affected acceptance, reconcile accepted source evidence, preserve history and correct through owner commands with the exact regression case.                                               |
| Accepted import restriction not enforced by actual recipient gates                                                                                                                | Any accepted affected row without matching enforced owner receipt                                      | P6/contact owner                                             | Stop affected outreach/intake, reconcile exact restrictions and qualify real consumers; do not invent global Do Not Contact.                                                                     |
| Expired import raw/staging material remains readable or primary disposal is late                                                                                                  | Any post-cutoff read; any eligible primary purge beyond 24 hours                                       | P29 operations owner                                         | Deny access immediately, inspect references/holds and per-copy outcomes, perform bounded disposal and retain truthful evidence.                                                                  |
| Preparation destroyed despite earlier applicable hold/preservation, or independent record affected                                                                                | Any one confirmed violation                                                                            | P9 preparation/disposition owner                             | Stop destructive work, retain access restrictions, investigate source ordering/copy evidence and recover only through authorized procedures.                                                     |
| Preparation cleanup/copy/restricted-review obligation misses its qualified deadline                                                                                               | Any one overdue obligation                                                                             | P9 operations and privacy/records owners                     | Page the responsible operator, retain restriction and reconcile/escalate through the published response deadline; no silent indefinite queue.                                                    |
| Accepted Resume effect cannot be recovered with still-valid access                                                                                                                | Any one confirmed unrecoverable effect                                                                 | P9 service owner                                             | Repair acceptance/result persistence through source authority; never ask for a duplicate preparation.                                                                                            |
| Continuation acceptance and current projection disagree without an intervening source transition, or recovery ends unexplained                                                    | Any one reproducible occurrence                                                                        | P9/API operations owner                                      | Diagnose source and projection, repair through owners without another continuation.                                                                                                              |
| Unknown source/settings outcome exceeds qualified recovery time                                                                                                                   | Any one overdue outcome                                                                                | API on-call owner                                            | Recover safely or provide a definitive currently permitted status and an owned operational escalation; no supporter outreach.                                                                    |
| Saved policy unexpectedly invalid/missing, cross-kind readiness blocks an eligible action, or valid date-only/date-line input is rejected/unknown date gets a deadline            | Any one confirmed/reproducible occurrence                                                              | Tenant administration/P9 product/API owner                   | Keep dependent acceptance gated, preserve accepted cycles, repair mapping/precision/revision through owner controls without a guessed duration; stop correctness-affected expansion.             |
| Import limit escape, measured envelope breach or source-preset semantic mismatch                                                                                                  | Any one confirmed occurrence                                                                           | P30 runtime/profile owner                                    | Fence/quarantine affected job or preset, retain receipts and safe manual mapping, correct representative fixtures and requalify capacity before re-enabling.                                     |
| Preparation Resume or retention query/lock/error/backlog budget regression                                                                                                        | Two consecutive five-minute windows exceeding the published budget and declared minimum sample size    | Platform API/database on-call                                | Inspect safe traces/plans, restrict rollout/load or affected cleanup while retaining expiry enforcement and mandatory obligations.                                                               |
| Expired-history/continuation query, latency or recovery budget regression                                                                                                         | Three consecutive five-minute windows exceeding the published qualified budget                         | API/SRE owner with P9 query owner                            | Inspect scoped query/lock/load evidence, contain expensive work and remeasure without weakening authorization.                                                                                   |
| Separate-period/original-date request, import or recovery budget breach                                                                                                           | Any measured breach of its published G3 budget                                                         | API operations owner                                         | Limit affected work or stop expansion, inspect plans/lock/backlog evidence and restore the budget before expansion.                                                                              |
| Repeated history projection/permission repair for one incident                                                                                                                    | Three failed safe attempts or any terminal repair failure                                              | P9 operational owner with P12 support owner                  | Stop repeated retries and route an owned exception through existing operations; do not reopen records to repair display.                                                                         |
| Critical privacy/retention/Resume misunderstanding in qualification, or repeated substantiated pilot misunderstanding                                                             | One critical pre-release misunderstanding; two distinct substantiated pilot reports                    | P28 product/UX owner                                         | Block release or pause expansion, correct the flow/copy and repeat representative tests without collecting private-content surveillance.                                                         |
| Unsafe referral meaning, Off/consent/recovery/date interpretation or reproducible accessible/phone blocker                                                                        | Any one credible unsafe misunderstanding, validated support/usability incident or reproducible blocker | P28 product/design and shared accessibility owner            | Block/contain affected rollout, correct and repeat the whole journey before expansion; do not add settings reflexively.                                                                          |
| Import interpreted as sharing, subscribing or verifying contacts                                                                                                                  | Any observed qualification occurrence or supported production report                                   | P28 product/UX owner                                         | Correct copy/flow and repeat the affected task test before treating intake as qualified.                                                                                                         |
| Lost guide publication, stale re-offer or unaudited availability effect                                                                                                           | Any one verified invariant breach                                                                      | P28 guide engineering owner                                  | Stop affected mutations, recover through source history and requalify concurrency/replay without deleting independent work.                                                                      |
| Guide resource or entry is withdrawn/invalid                                                                                                                                      | Any detected unavailable destination                                                                   | Tenant authorized curator; platform owner for resolver fault | Immediately withhold unsafe target and show one actionable existing-management maintenance notice; no user nag or automatic replacement.                                                         |
| Repeated confusion about guide optionality, return path or draft/publication                                                                                                      | Same failure in two independent usability sessions or support reports                                  | P28 product/design owner                                     | Correct wording/placement and test the actual task without adding mandatory walkthroughs or completion tracking.                                                                                 |
| Shipping state falsely reports Synced, Erased or Saved                                                                                                                            | Any one reproducible report                                                                            | P28 product owner and source owner                           | Reconcile accepted truth, correct state/copy and rerun the affected journey.                                                                                                                     |

- **AC28-R43-01:** Given any trigger above crosses its stated threshold, when operations processes the signal, then the assigned owner executes the listed containment/repair response without waiting for a broader trend or weakening current authority.
- **AC28-R43-02:** Given activation is requested, when qualification is reviewed, then actual source adapters, finite supported bounds, numeric workload/recovery budgets, minimum samples, copy-disposal evidence and accountable on-call ownership are recorded; missing evidence gates the dependent capability rather than reclassifying a required journey as optional.
- **AC28-R43-03:** Given a restore, rollback, retry or repair, when normal reads and jobs resume, then newer restrictions, dispositions, exact accepted cycles/effects and current grants remain authoritative and no private bodies are placed into broad logs to diagnose the issue.
- **AC28-R43-04:** Given a representative missionary/staff or accessibility test exposes a listed critical misunderstanding or task blocker, when release is evaluated, then that affected journey does not activate until corrected and retested; vendor examples and planning models are not substitutes for this evidence.

## Testing decisions and release evidence

Tests should assert externally observable user/domain outcomes at the highest practical source/API-plus-projection seam; use real database roles and concurrency where authorization or atomicity is the claim. UI tests then prove the complete job, not snapshots of private implementation fields. Existing P9 A17 source changes, current contact-correction tests, qualified field-policy tests, common Tasks Hub consumer tests and import/retention owners are the extension seams; do not add one duplicate test framework per screen.

- **Positive journeys:** new eligible restricted save; canonical reuse without disclosure; deliberate staff share with zero/selected notices; tenant-authorized selected contact correction; archive/find/return; leave/return/selectively resume; contact import review/partial acceptance/recovery; initial current/late/unknown referral; expired view/Continue; guide draft/publish/disable/re-offer. Each must persist and reload through real source authority, not merely prove denials.
- **Negative authority matrix:** other Tenant, other ministry/current activation, wrong original author/historical recipient, denied fields/history, view-without-edit, settings-without-content, missionary Off versus staff independent lane, protected records, hidden/absent differential, raw API/table/RPC/storage/privileged route bypass. Test old/resulting-state ownership changes and service-role calls.
- **Concurrency and uncertain outcomes:** save versus correction/revocation; share/notice materialization; archive versus return/share; resume versus expiry/disposal/hold; departure/policy late ordering; row import/cancel/lease reclamation; competing continuation actors and transport keys; stale accepted retry after a later cycle; guide publish/Disable/re-offer; source accepted but response/refresh failed. Confirm one business effect and honest current state.
- **Boundary proof:** D17 actual bytes/expanded ZIP/member/cell/row/text/column N−1/N/N+1, repeated/blank columns and formula caches; original versus finalized upload timing; deadline equality; no sliding retry extension. New referral one-day/inclusive month/year/leap/DST/date-line/missing-midnight/repeated-midnight/skipped-date cases; Continued elapsed 24-hour semantics and time-after-lock-wait. Legacy accepted endpoints survive changed settings/timezone data.
- **Migration/restore:** unknown origin/author/precision/policy remains unresolved, never guessed; historical restrictions precede reopened reads; new/old clients cannot omit current kind/revision checks; imported/history copies do not revive erased or ended source effects; interrupted disposal outcomes remain honest. Preserve exact accepted facts and existing valid grants.
- **Complete UX proof:** representative missionary and staff participants on phone/desktop, slow/interrupted connection, keyboard/screen reader/zoom, long/RTL names and non-US address formats. They can explain restricted versus shared, notification versus access, archive versus deletion, current versus earlier preparation, Resume retention effect, New calendar versus Continued elapsed period, Expired versus refusal, recorded versus active, guide optionality and disabled behavior. Any critical privacy/false-success/wrong-context interpretation blocks release.
- **Performance/operations:** production-shaped authorized pagination beyond current source caps; query plans and rows scanned/returned; bounded parser/disposal/import work and fairness; exact source lock contention; batched guide destination resolution. Numerical latency/concurrency budgets must be measured and published for the activation cohort. Do not claim 10,000-row capacity or responsiveness from a small model.

## Explicit exclusions and non-effects

No separate person master/private CRM, new generic task engine, user-defined permission/retention/workflow builder, per-record referral duration, mandatory guide or coaching/course completion, staff access to private preparation on departure, automatically merged people, bulk contact overwrite, auto-restoration, automatic renewal, source-generic Undo, contact-update feed, direct email/provider transport, unsupported offline replay, or new money/consent/encounter facts is introduced. These exclusions preserve independently governed existing operations rather than disabling them globally.
