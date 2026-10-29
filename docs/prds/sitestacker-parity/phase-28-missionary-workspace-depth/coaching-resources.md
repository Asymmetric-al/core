# Phase 28 — Coaching, activity targets, resources and regional discovery

This volume specifies intended product behavior. It does not claim that a source adapter, permission policy, interface, deployment or release test already exists or has passed. The Phase 28 shared requirements apply to every requirement below, including current authorization, tenant isolation, safe errors, accessible interfaces, durable outcomes and source-owned retention.

D8–D10, D23–D26, D37 and the completeness amendments provide ratified behavior. D11 supplies the selected ongoing-sharing choice, with D47 expressly adopting the whole-selected-calendar-day convention. D12 supplies the selected organization-managed resource library. D13 supplies the selected regional list, world map and organization control; D46 expressly adopts initial Off for new organizations. The detailed D11–D13 review recommendations are reconciled here as necessary specification and engineering safeguards; their inclusion does not rewrite the historical ratification record. In particular, D46 and D47 do not ratify every clause of their earlier review packets.

The product shall use the existing base-maia design system, Base UI primitives and semantic Zinc CSS-variable tokens. The requirements select no additional coaching service, learning platform, content system, analytics service, permission engine or map provider. Source ownership remains with the existing Identity/Permissions, Tasks/Interactions, financial, Communications, public-publication and document-custody domains. Ordinary sharing and content maintenance within qualified policy shall not acquire an unnecessary second-person approval; actual projection-policy widening remains subject to the governing approval decision.

## REQ28-C01 — Enter coaching with an individual identity and explicit organization

**Story US28-C01:** As an invited coach, I want to use my own account in the correct organization, so that I can prepare without sharing a missionary's credentials or receiving unrelated privileges.

**Decision basis:** D8-C01–C06; completeness context and authorization amendments; Identity/Permissions ownership.

Coach shall be a first-class tenant-scoped product role/preset using the existing membership-backed Active Tenant Assignment within the Tenant Authorization Context model. It shall not create a fifth authorization context, alias a staff role or imply donor access. Internal and organization-permitted external coaches shall use their own proved identities, existing qualified sign-in/recovery and applicable assurance gates.

- **AC28-C01-01:** A coach with one currently authorized organization can enter that context directly; a coach with several can explicitly switch between currently authorized organizations. A failed context load is distinguishable from having no contexts.
- **AC28-C01-02:** The active organization and coaching role remain evident in portfolio, detail and self-service actions. An email match, remembered selection, another role or another organization's invitation does not grant access.
- **AC28-C01-03:** A direct link validates current organization, membership, role and exact subject authority before releasing a person/project name, count, snippet or amount.
- **AC28-C01-04:** A context change cannot reparent a pending action or apply its delayed result to the new context. Sign-out or current context loss clears protected content and pending browser work under the shared session rules.
- **AC28-C01-05:** Missing or unrecognized coach role configuration produces an honest unavailable/access state; it does not fall back to donor, missionary or staff navigation and permissions.

## REQ28-C02 — Deliberately invite an eligible coach

**Story US28-C02:** As a missionary authorized to share, I want to invite a specific eligible coach, so that coaching starts with a clear recipient and scope.

**Decision basis:** D8 invitation, organization-ceiling and source-scope amendments; qualified protected-action and communication owners.

An invitation shall identify the intended recipient and exact organization, canonical missionary/ministry or Ministry Project subject, proposed modules, history and access duration. Organization permission is a ceiling; an invitation shall not automatically disclose every eligible module.

- **AC28-C02-01:** The invitation review shows the intended recipient, organization, canonical subject and proposed disclosure in plain language before the missionary submits it.
- **AC28-C02-02:** A missionary cannot invite outside the organization's current internal/external eligibility policy or beyond their own sharing authority. Unknown or unavailable eligibility grants nothing.
- **AC28-C02-03:** The source records a stable invitation occurrence, finite validity, exact scope/policy version and revocation state. Repeated submission of the same logical invitation recovers one business effect rather than creating duplicate active relationships or uncontrolled additional sends.
- **AC28-C02-04:** Reissue invalidates superseded proof under the protected-action owner's contract. A stale invitation or reissue request cannot defeat a later Stop, organization restriction or recipient change.
- **AC28-C02-05:** Only the qualified native invitation/access-notice purpose may deliver the invitation. An unbound or incompatible purpose produces a truthful unavailable result; it does not fall back to generic email or require creation of an artificial donor record.
- **AC28-C02-06:** Invitation/access notices use the exact meaning-specific contract, source occurrence/fence and admitted recipient-authority branch in a proof-activated communication profile. Preparation and dispatch recheck current authority/relevance; notices contain only approved minimal context and links, not progress reports or sensitive narratives by default.

## REQ28-C03 — Accept an invitation without confusing delivery, identity and access

**Story US28-C03:** As an intended coach, I want a clear acceptance and recovery journey, so that I can tell whether my invitation and access are actually ready.

**Decision basis:** D8 invitation lifecycle and replay requirements; existing Identity, protected-action and Communications contracts.

Delivery, pending recipient response, proved recipient identity and active coaching access shall remain distinct outcomes. Possessing an invitation is not sufficient identity proof or access activation.

- **AC28-C03-01:** Link preview, GET, HEAD, prefetch and mail-scanner requests do not accept an invitation, consume its acceptance effect or grant coaching access. Acceptance uses the existing qualified deliberate protected-action flow.
- **AC28-C03-02:** Sign-in and account recovery retain only an allowed continuation. Wrong-account recovery offers a usable next step without disclosing protected invitation context to that account.
- **AC28-C03-03:** Acceptance rechecks the intended identity, grantor authority, current membership, organization ceiling, invitation validity and exact scope. It does not trust permissions captured only when the invitation was sent.
- **AC28-C03-04:** If identity is accepted but source access cannot activate, the outcome explains that access is unavailable without falsely showing an active coaching relationship or exposing the withheld reason.
- **AC28-C03-05:** Lost responses recover the accepted source effect before retry. Expired, revoked and superseded invitations offer only the real authorized recovery path; they do not silently create a replacement invitation or broader grant.

## REQ28-C04 — Apply organization coaching controls precisely

**Story US28-C04:** As authorized organization staff, I want coaching controls to state their exact effect, so that I can permit or stop a capability without accidentally changing unrelated access.

**Decision basis:** D8 organization ceilings; D24–D26 module availability; completeness configuration amendments.

Existing owner controls shall govern external-coach eligibility and the qualified optional sharing modules. A saved availability preference shall not substitute for current source qualification or actor authority. The interface shall not add a master Phase 28 switch or a matrix of per-person exceptions.

- **AC28-C04-01:** Settings distinguish saved Off, missing source setup, temporary failure and an actor's lack of permission; they do not represent all four as the same disabled control.
- **AC28-C04-02:** Turning external coaching Off fences affected external current and pending access. It does not silently revoke independently valid internal grants or change canonical source records.
- **AC28-C04-03:** Turning a numeric, narrative or next-step sharing module Off fences that module's affected current and pending disclosures without stopping unrelated qualified modules or personal source work.
- **AC28-C04-04:** Re-enabling availability does not revive ended grants or previous module inclusions. A still-valid coach need not be invited again merely to make a fresh deliberate module inclusion.
- **AC28-C04-05:** Save reports an authoritative saved, failed or outcome-unknown result. A stale On command cannot undo a later Off; a local switch position is not proof of durable availability.

## REQ28-C05 — Prepare from a bounded portfolio of authorized subjects

**Story US28-C05:** As a coach, I want a useful portfolio of the people and Ministry Projects shared with me, so that I can prepare for each conversation without searching unrelated records.

**Decision basis:** D8 portfolio and canonical-subject requirements; D9 independent summary modules; P9 subject ownership.

The portfolio shall enumerate only currently admitted subjects within the active organization. A person, ministry/support assignment, Ministry Project, team, page and roster are distinct concepts; membership in one shall not silently expand another.

- **AC28-C05-01:** Search, counts, filters and pagination apply current authorization before enumeration. There is no cross-tenant union or cross-person feed of check-in bodies, private task text or donor details.
- **AC28-C05-02:** A Ministry Project uses its canonical subject identity. Project/team participation does not automatically disclose all members, child subjects or their financial information.
- **AC28-C05-03:** Portfolio cards provide bounded useful metadata and clear access/currentness states. Detailed charts and histories load only for the selected authorized subject rather than for every portfolio card.
- **AC28-C05-04:** Detail can present shared focus/goals, independently qualified support or activity summaries, shared check-ins and selected next steps. Failure of one source leaves independent safe modules usable.
- **AC28-C05-05:** Admitted shared evidence is described neutrally. Empty or unavailable information does not mean that a missionary did no work, failed to report or lacks support.
- **AC28-C05-06:** The portfolio contains no financial sum across people, ranking, effort score, donor list, gift-row drilldown or restricted precise location. Chart and text alternatives expose the same admitted values.

## REQ28-C06 — Preview the actual proposed disclosure

**Story US28-C06:** As a missionary, I want an accurate sharing preview, so that I understand what the named coach will receive before saving.

**Decision basis:** D8–D10 sharing review; D24–D26 exact inclusion review; subtract-only projection governance.

Preview shall use the proposed recipient projection intersected with the previewer's own current read authority. It shall not impersonate the coach or reveal information available through the coach's independent broader privileges.

- **AC28-C06-01:** The review identifies exact subject, recipient, included modules, relevant periods and effective access duration. Draft choices confer no access.
- **AC28-C06-02:** The preview excludes fields the recipient would not receive and fields the missionary cannot currently read. Hiding parts of an otherwise overbroad payload is insufficient.
- **AC28-C06-03:** One source-owned Save accepts the exact reviewed scope. A material authority or scope change before application requires refreshed review rather than silently narrowing the selection and claiming it was saved unchanged.
- **AC28-C06-04:** Saving, accepted, definite failure and an unknown response remain persistently distinguishable. Recovery checks the durable source outcome before repeating the intent.
- **AC28-C06-05:** Selecting one module does not select another, export rights, private history, notifications or future recipients. Routine sharing inside approved policy requires no invented supervisor queue.

## REQ28-C07 — Keep coaching read-only

**Story US28-C07:** As a missionary receiving coaching, I want my coach to see the agreed information without controlling my records, so that accountability does not become unintended delegation.

**Decision basis:** D8 read-only coaching; D24–D26 projection boundaries.

The coaching role shall authorize only qualified reads. Accepting, declining or leaving an invitation/relationship and managing the coach's own preferences are separate self-service actions; they do not imply mutation of the missionary's work.

- **AC28-C07-01:** Coaching exposes no edit, comment, assign, remind, complete, reopen, delegate or impersonate command on missionary goals, activity, contacts, check-ins, tasks or finances.
- **AC28-C07-02:** Direct requests to underlying commands are denied even when the user can read the coaching summary. Interface hiding alone does not satisfy the boundary.
- **AC28-C07-03:** No raw donor, gift, commitment, interaction or task access is granted merely to calculate or display a permitted aggregate/summary.
- **AC28-C07-04:** Export, print and calendar/email publication require their own owner-admitted capability; the coaching role does not introduce them.
- **AC28-C07-05:** A person who separately holds a valid staff or other role must deliberately enter that authorized context for its actions. Coaching does not silently adopt the broader role.

## REQ28-C08 — Stop or leave an exact coaching share

**Story US28-C08:** As a missionary or coach ending a sharing relationship, I want a clear scoped Stop or Leave action, so that access ends without damaging source records or unrelated work.

**Decision basis:** D8 ending/revocation; D11/D47 access duration; D24–D26 independent Stop.

Ending shall close the exact episode or selected disclosure and fence dependent reads and unstarted effects. It shall preserve canonical records, required relationship history and independently lawful access.

- **AC28-C08-01:** Stop remains usable when unsaved sharing edits are invalid. The confirmation describes the exact share being ended and does not claim the person has no other permissions.
- **AC28-C08-02:** After the ending effect wins, stale Save, acceptance, date extension, replay, backup restoration or organization re-enable cannot reactivate the ended episode.
- **AC28-C08-03:** A later sharing relationship requires fresh deliberate activation under current rules. An Undo affordance cannot recreate authority without that action.
- **AC28-C08-04:** Concurrent accept/extend/Stop requests have one defined source order and recoverable outcomes. Duplicate ending requests do not duplicate history or secondary effects.
- **AC28-C08-05:** Previously seen information and already delivered copies cannot be recalled. Subsequent protected releases still deny ended access, including retained cache responses and delayed work.
- **AC28-C08-06:** Temporary source unavailability or a current permission-review hold is not automatically labeled a terminal ended relationship when the owning episode remains valid.

## REQ28-C09 — Include support summaries separately and deliberately

**Story US28-C09:** As a missionary, I want to choose whether my coach sees support summaries, so that sharing a goal or inviting a coach does not automatically disclose financial information.

**Decision basis:** Ratified D9; D8 module boundaries; P13/P7 and P16 source ownership.

Support summaries shall require explicit inclusion of a qualified output profile within a valid sharing episode. They shall distinguish planned/expected support from received contributions and from balances, payouts or compensation.

- **AC28-C09-01:** A new invitation, shared financial goal or organization enablement does not itself include support summaries.
- **AC28-C09-02:** Inclusion review identifies the canonical subject, legal entity, currency, period, basis, source coverage/currentness and applicable goal version that the coach can receive.
- **AC28-C09-03:** Expected/planned and received appear as separate labeled measures. Neither is presented as money currently available to spend or take home.
- **AC28-C09-04:** A blocked financial dependency withholds only the affected measure/action. Qualified nonfinancial coaching and independent safe measures remain usable.
- **AC28-C09-05:** Removing financial inclusion leaves the underlying money, commitments, goal and other shared modules unchanged and fences later financial summary releases.

## REQ28-C10 — Derive expected support from authoritative dated expectations

**Story US28-C10:** As a coach reading shared support progress, I want expected support to have a clear dated basis, so that I do not mistake a promise or planning estimate for received money.

**Decision basis:** D9 expected-support amendments; D10 historical expectation requirements; P16 ownership.

Expected support shall use qualified occurrence/installment facts and applicable commitment terms from the expectation owner. A separately admitted monthly-equivalent planning measure shall remain labeled as planning.

- **AC28-C10-01:** A dated-period total includes only qualified non-overlapping expectation components in that exact subject, currency and period. The same obligation cannot contribute through both an aggregate and its component occurrences.
- **AC28-C10-02:** Undated pledge face value, recurring receipt patterns and the current commitment balance do not invent dated expectations. Dividing an arbitrary pledge into months is not an accepted substitute.
- **AC28-C10-03:** If a monthly-equivalent measure is admitted, its source transform remains exact until display and its label distinguishes it from a scheduled installment or current-month expected receipt.
- **AC28-C10-04:** Missing historical terms or unproved occurrence coverage produces an explicit permitted unavailable state rather than a guessed zero, schedule or backcast.
- **AC28-C10-05:** Expected support never implies that the donor has paid, that money has been received or that a legally collectible debt exists.

## REQ28-C11 — Derive received support from effective contribution lines

**Story US28-C11:** As a missionary sharing received support, I want the figure to reflect actual authoritative contributions, so that the coach sees accurate progress without donor-level access.

**Decision basis:** Ratified D9 and D10; effective received contribution and authoritative gift-date owners.

Received support shall be the qualified current evaluation of effective received designated monetary contribution lines for the admitted subject and authoritative gift-date period, before organization assessments.

- **AC28-C11-01:** Each eligible canonical designation line contributes once; sibling allocations, duplicated joins and repeated provider events do not multiply the amount.
- **AC28-C11-02:** Promises, processing payments, recognition/soft credit, noncash valuation, payouts and out-of-scope fee cover do not contribute to this received measure.
- **AC28-C11-03:** Current authoritative corrections affect the fold and applicable gift-date period. Created, imported, posted-display or payout dates do not replace the gift-date owner's contract.
- **AC28-C11-04:** Uncertain commitment matching does not erase a separately valid receipt. Conversely, an expectation or commitment application does not create received money.
- **AC28-C11-05:** A ministry balance, net compensation or payout figure is not substituted when received-source coverage is unavailable. The unavailable measure remains truthful while independent modules continue.

## REQ28-C12 — Preserve exact money and meaningful comparisons

**Story US28-C12:** As a coach, I want financial figures and comparisons to retain their units and meaning, so that a polished chart cannot mislead me about support progress.

**Decision basis:** D9/D10 money, comparison and coverage amendments; canonical financial units.

Every financial display shall retain exact source currency, supported precision, period and basis. Comparisons require compatible subject, legal entity, currency, calendar, goal version and source coverage.

- **AC28-C12-01:** Arithmetic and transport preserve exact values without binary floating-point money, unsafe integer coercion, a universal two-decimal assumption or a forced USD conversion.
- **AC28-C12-02:** Different currencies are not summed or compared as one amount without an independently authorized conversion contract; this feature creates no such contract.
- **AC28-C12-03:** Expected and received are not added together or subtracted into a debt/arrears conclusion. Any approved comparison labels the exact compared measures.
- **AC28-C12-04:** Unknown, zero or incompatible denominators do not produce a percentage. A valid over-goal result is not capped at 100 percent or otherwise hidden.
- **AC28-C12-05:** Independent measures may show their own coherent as-of/currentness evidence. The interface does not claim a globally atomic financial snapshot merely because measures are displayed together.

## REQ28-C13 — Withhold unsafe or unproved financial aggregates

**Story US28-C13:** As a missionary, I want a support summary to protect the people behind it, so that summary-only coaching does not expose donor details through arithmetic or missing-data shortcuts.

**Decision basis:** D9/D10 aggregate privacy and current-projection amendments; P3/P10/P12 disclosure owners.

Inputs shall be admitted for the exact coaching-summary purpose before arithmetic. Existing qualified cohort/inference rules shall apply jointly to the released outputs; this specification invents no new numeric anonymity threshold.

- **AC28-C13-01:** A summary-only coach can receive an admitted aggregate without receiving raw source-row selection privileges.
- **AC28-C13-02:** Qualification tests small cells, overlapping periods/subjects, complements, deltas and repeated releases together. Suppressing one cell while exposing an equivalent reconstructing total or ratio does not pass.
- **AC28-C13-03:** Withheld, partial, stale, unknown and complete zero have distinct safe meanings. Missing source coverage is not displayed as zero or as a complete comparison.
- **AC28-C13-04:** Charts, accessible text, tooltips, counts and exports cannot expose values omitted from the primary admitted display.
- **AC28-C13-05:** Current disclosure/source checks apply when output is released, including cached or asynchronous output. A stale authorization snapshot cannot continue a stopped financial share.

## REQ28-C14 — Select a fixed earlier financial range

**Story US28-C14:** As a missionary, I want to add specific earlier financial periods, so that my coach receives exactly the history I reviewed.

**Decision basis:** Ratified D10 fixed earlier-period decision and amendments.

Historical financial access shall be a finite selection of literal reviewed periods with the source calendar and boundaries retained. This permission is separate from current-period access and from activity-summary continuation.

- **AC28-C14-01:** Any relative range choice resolves to exact dates before Save, and reloading the accepted choice shows those same dates.
- **AC28-C14-02:** Month rollover, importing an old gift, cache rebuild, invitation acceptance, re-invitation or later policy expansion does not enlarge the selected earlier range.
- **AC28-C14-03:** The available range choices come from policy and supported coverage rather than leaking the date of the first or last hidden gift.
- **AC28-C14-04:** Empty, reversed, unsupported or future-as-history selections are rejected with useful field guidance. None is interpreted as all time.
- **AC28-C14-05:** Changing or removing the range uses the same brief review and one Save, preserving other modules and source facts. Stale responses cannot restore removed periods.
- **AC28-C14-06:** This choice grants no private notes, activity history, historical goals, ministry balances or export capability.

## REQ28-C15 — Explain corrected values within fixed history

**Story US28-C15:** As a coach reviewing earlier support, I want corrections and unavailable periods to remain clear, so that a fixed date range is not mistaken for a frozen official statement.

**Decision basis:** D10 corrected-present historical evaluation, expectation lineage and gap requirements.

Fixed historical scope shall not freeze its values. It shall show the current qualified evaluation of those historical periods, not an as-known-at-the-time snapshot or an official period-close artifact.

- **AC28-C15-01:** A qualified current correction can alter a value within an admitted period; importing an old record cannot move its authoritative event into scope using its import date.
- **AC28-C15-02:** Historical expected amounts use the applicable immutable terms/occurrence versions. Today's commitment is not projected backwards over history.
- **AC28-C15-03:** Later ordinary fulfillment or cancellation does not erase a past expected amount unless the expectation owner authorizes a historical correction.
- **AC28-C15-04:** Missing, partial or withheld periods appear as permitted gaps. Charts do not bridge them as known values, and totals/ratios do not silently treat them as zero.
- **AC28-C15-05:** The currentness explanation makes clear when source corrections are reflected and avoids describing the display as a financial statement or period close.

## REQ28-C16 — Choose ongoing sharing or an optional end date

**Story US28-C16:** As a missionary, I want ongoing sharing where permitted or a simple optional end date, so that I can control access without managing needless timers.

**Decision basis:** Selected D11; D47; organization/source permission ceilings.

No scheduled end shall be an explicit valid choice only where current organization rules permit it. It shall not mean permanent access, missing configuration or exemption from reviews and restrictions.

- **AC28-C16-01:** The date input appears when an end is selected or required. An already saved choice is retained rather than silently reset by later editing.
- **AC28-C16-02:** Missing or legacy null duration data is not interpreted as permission for ongoing access. Current organization-required limits and eligibility still apply.
- **AC28-C16-03:** An organizational permission-review date is distinguished from a scheduled share-end date and is not displayed as a promise that access lasts until it.
- **AC28-C16-04:** The flow adds no universal duration, recurring-renewal requirement, time picker or independent clock for every shared module.
- **AC28-C16-05:** The missionary and coach can understand whether the exact share is ongoing, scheduled to end, currently withheld or ended without exposing restricted policy details.

## REQ28-C17 — Honor the complete selected Share through day

**Story US28-C17:** As a missionary selecting a sharing end date, I want Share through to include that whole day, so that the deadline matches the language I see.

**Decision basis:** D47 explicitly selected whole-day amendment to D11.

Share through [date] shall include the whole selected calendar day in the displayed source-approved organization time zone. The accepted choice shall retain that date, the approved zone and the resolved exclusive beginning-of-next-local-day cutoff.

- **AC28-C17-01:** The interface displays the applicable source-approved zone with the date. Acceptance retains the resolved cutoff; later travel, device-zone, locale or organization-zone changes do not move it.
- **AC28-C17-02:** Daylight-saving transitions use civil-day boundaries rather than a fixed 86,400-second addition. A shorter or longer local day still ends at its proper next-day boundary.
- **AC28-C17-03:** A date whose resolved cutoff has already passed is rejected. Today is selectable only while its cutoff remains in the future under trusted source time.
- **AC28-C17-04:** An earlier source or organization limit wins. If it falls partway through the selected day, the actual earlier time and safe zone explanation are shown rather than rounded later.
- **AC28-C17-05:** At the exclusive cutoff, protected release is denied. Scheduler delay, stale active state, token lifetime, device clock and a transaction that began earlier do not extend access.

## REQ28-C18 — Change duration without reviving an ended episode

**Story US28-C18:** As a missionary, I want to change a valid share's end deliberately, so that the saved access window stays predictable through retries and concurrent changes.

**Decision basis:** D11 duration safeguards; D47 fixed cutoff and non-revival amendment; D8 episode ownership.

Extending or removing an end shall require current authority and source-owned Save. It changes the duration of the exact eligible episode, not its modules, recipients or historical periods.

- **AC28-C18-01:** Save rechecks current authority and actual time after relevant waits before applying the change. An extension that loses a race with Stop or expiry does not resurrect the ended episode.
- **AC28-C18-02:** Removing an end is treated as widening within the existing sharing authority. It is not confused with an ordinary shortening or automatically classified as a separate projection-policy change.
- **AC28-C18-03:** A lost response can recover the original accepted outcome without reapplying its old intent over a newer end or Stop.
- **AC28-C18-04:** An ended episode uses the ordinary fresh activation journey. Editing its old date, restoring an old record or replaying an old command is not an activation path.
- **AC28-C18-05:** Ending duration controls access, not retention or deletion of source records, previously received information or independent lawful rights.

## REQ28-C19 — Create optional personal activity targets

**Story US28-C19:** As a missionary, I want to set my own useful activity targets, so that I can plan without compulsory reporting or a financial plan.

**Decision basis:** Ratified D23 optional activity targets; bounded Goal Versions extension.

A missionary may have multiple independent activity targets or none. Activity-only planning shall not require a money amount, currency, Support Plan, published Page or financial-goal permission.

- **AC28-C19-01:** Creation supports a qualified measure, positive whole target quantity, personal label, schedule, start/end and overview placement, with pause/resume available for the applicable lifecycle.
- **AC28-C19-02:** A private label retains the canonical measure name and a plain What counts explanation; a renamed target cannot redefine the underlying activity.
- **AC28-C19-03:** Suggested presets are adopted deliberately and editable by the missionary. Later staff preset changes do not enroll the person or overwrite accepted targets.
- **AC28-C19-04:** No target is a valid state. There is no mandatory quota, penalty, ranking, activity score, custom formula/weight or required narrative attached to having a target.
- **AC28-C19-05:** Target definitions and versions remain distinct from authoritative actual activity. No manually editable progress counter becomes the source of truth.

## REQ28-C20 — Count four clearly defined kinds of real activity

**Story US28-C20:** As a missionary, I want each activity measure to explain what counts, so that the displayed progress matches work I actually did.

**Decision basis:** D23 four supported source-qualified measures and outcome semantics.

The supported measures are Calls made, Personal messages, Conversations and Meetings held. Every adapter shall qualify actual occurrence, outcome and participation before contributing.

- **AC28-C20-01:** Calls made counts an actual outgoing attempt, including an unanswered call, busy result or voicemail. Opening a dialer without a real attempt does not count.
- **AC28-C20-02:** Personal messages counts one attributable manually sent or provider-accepted authored personal outreach occurrence. A provider-accepted message is explained as delivery not confirmed when that is the known outcome; a queued, draft or unknown send is not counted as sent.
- **AC28-C20-03:** A bounce does not erase an actual submitted personal message merely because delivery failed. A source correction establishing that submission never happened removes the false occurrence.
- **AC28-C20-04:** Conversations counts a canonical actual human exchange, including a brief decline. No sentiment, minimum word count or invented timing/thread heuristic determines whether the exchange happened.
- **AC28-C20-05:** Meetings held counts actual qualified participation, not a booking, no-show or generic completed checkbox. Automated replies, newsletters, receipt copies, opens and clicks do not fabricate personal outreach or a conversation.
- **AC28-C20-06:** If a source cannot establish the required outcome, the affected count/capability is unavailable rather than supplemented by a guess or manual counter.

## REQ28-C21 — Attribute and deduplicate activity correctly

**Story US28-C21:** As a missionary, I want progress attributed to the actual participant once, so that shared work and duplicate records do not distort my targets.

**Decision basis:** D23 occurrence identity, participant and cardinality amendments; source activity ownership.

Each canonical occurrence shall count once per supported measure, participant, scope and period. Measures may overlap and shall not be added into an invented total-activity score.

- **AC28-C21-01:** The actual qualified participant receives the occurrence, not automatically the logger, current task assignee, project owner or every team member.
- **AC28-C21-02:** Provider and manual representations of the same event, recipient copies and repeated relationship joins do not create additional occurrences.
- **AC28-C21-03:** Five calls that include two conversations display five calls and two conversations. The interface does not report seven total activities from those two measures.
- **AC28-C21-04:** If identity/correlation is uncertain, the projection retains an honest unavailable/uncertain result rather than merging or multiplying events through a speculative time heuristic.
- **AC28-C21-05:** Source correction or deduplication rederives the affected qualified count; it does not require editing a shadow counter in the target.

## REQ28-C22 — Use understandable activity calendars and occurrence dates

**Story US28-C22:** As a missionary, I want clear target dates and calendar rules, so that travel, late entry and partial periods do not change what my progress means.

**Decision basis:** D23 calendar, occurrence precision and schedule requirements.

Weekly is the default schedule; Monthly and one-off Custom dates are supported. Repeating targets use complete calendar periods. A Custom one-off may cover a partial period.

- **AC28-C22-01:** The displayed period identifies exact dates and the qualified calendar. Internal exclusive boundaries preserve the shown inclusive-day meaning; a week is not assumed to equal exactly 168 elapsed hours.
- **AC28-C22-02:** A qualified organization work-calendar suggestion or an explicit personal zone/week-start selection supplies the calendar. Travel and later profile changes do not rebucket accepted history silently.
- **AC28-C22-03:** Actual occurrence date determines period membership rather than creation, import or task due date. Date-only facts retain that precision; uncertain or incompatible-calendar facts do not receive an invented midnight.
- **AC28-C22-04:** Creating or resuming a target within its current period includes earlier eligible recorded activity in that same displayed period. It creates no earlier targets, backlog or missed-work obligation.
- **AC28-C22-05:** The interface distinguishes no target, complete zero recorded, paused, ended, unplaced date and unavailable source. Zero recorded does not assert that no real-world work happened.

## REQ28-C23 — Revise targets without rewriting past meaning

**Story US28-C23:** As a missionary, I want to change a target with a clear effective period, so that earlier comparisons remain understandable.

**Decision basis:** D23 target revision, period composition and historical integrity amendments.

Target revisions shall retain their effective meaning. A quantity edit and a change of measure/scope/calendar are different operations with different consequences.

- **AC28-C23-01:** A quantity edit offers current period only, future periods only or current and future periods with clear effective dates.
- **AC28-C23-02:** Closed periods retain the accepted quantity version. Corrections to actual source activity may still rederive the numerator without rewriting the historical target.
- **AC28-C23-03:** Measure, scope or calendar changes are prospective. The new schedule begins at the next complete period in the new calendar no earlier than the prior current period's end.
- **AC28-C23-04:** Any resulting untargeted gap is shown honestly. There is no overlapping target period, prorated bridge or silent backdated change.
- **AC28-C23-05:** Valid above-target counts remain visible. Progress is not capped to hide the actual qualified result.

## REQ28-C24 — Pause and resume personal targets independently of recording

**Story US28-C24:** As a missionary, I want to pause a target without losing my work, so that planning can adapt to my circumstances.

**Decision basis:** D23 pause/resume and one-off lifecycle; D24 separate sharing lifecycle.

Pausing controls the target's active comparison and future periods. It shall not stop source recording, erase history or implicitly withdraw an independently shared coaching summary.

- **AC28-C24-01:** Pause removes the active comparison and stops future target periods while actual recording and qualified history remain available under their own rules.
- **AC28-C24-02:** Resume presents the applicable current/next period and its meaning before acceptance; it does not create overdue targets for the pause interval.
- **AC28-C24-03:** A one-off target resumes only within its original still-valid range. An ended one-off offers Add another target rather than silently extending or reopening its old dates.
- **AC28-C24-04:** The paused state explains its effect without implying that coaching access ended. Stopping a coaching inclusion remains a distinct action.
- **AC28-C24-05:** Duplicate or conflicting pause/resume requests recover one source-ordered outcome and preserve the accepted period/version history.

## REQ28-C25 — Deliberately include selected numeric activity summaries

**Story US28-C25:** As a missionary, I want to choose which numeric target summaries a coach can see, so that creating a personal target never shares it automatically.

**Decision basis:** Ratified D24 explicit inclusion and bounded numeric profile.

Activity summaries begin unshared. Current organization permission, a valid coaching episode and deliberate inclusion of the exact qualified target are required.

- **AC28-C25-01:** Review identifies the actual participant, canonical target lineage/measure, subject, first admitted period/calendar, named recipient and existing access duration.
- **AC28-C25-02:** The missionary's personal target label is marked Not shared in their selector and is omitted from the coach's projection. The shared measure retains its canonical understandable label.
- **AC28-C25-03:** Selecting numeric sharing grants no check-in text, task content, supporter information or underlying activity-row access.
- **AC28-C25-04:** One reviewed Save accepts the exact target inclusion. Missing permission, source qualification or current episode prevents inclusion without changing the personal target.
- **AC28-C25-05:** A newly created target, new coach or newly enabled module is not automatically included, and historic targets are not enrolled during migration.

## REQ28-C26 — Continue only the selected activity target's admitted periods

**Story US28-C26:** As a missionary sharing a recurring target, I want later periods to continue predictably, so that I do not repeatedly share the same target or accidentally expose earlier and different work.

**Decision basis:** D24-C07 ratified continuation contract and period/history limits.

For a recurring target, future periods of the same admitted target continue from the reviewed first period while the inclusion and episode remain active. Already admitted periods remain reviewable only within current rights, qualified retention and the bounded output profile.

- **AC28-C26-01:** The review states the first admitted period and future-continuation behavior. Invitation acceptance after rollover does not reset that first-period boundary.
- **AC28-C26-02:** Earlier periods, newly created targets and materially different target scope do not join the inclusion automatically. A one-off target admits its exact one-off period only.
- **AC28-C26-03:** Routine quantity revisions and qualified actual-source corrections update the applicable admitted periods without another sharing approval.
- **AC28-C26-04:** A new measure, participant, subject scope or calendar outside the approved profile requires new deliberate inclusion; it does not retarget the old permission.
- **AC28-C26-05:** Target pause/end and sharing Stop remain distinct. The coach may still see admitted history while current sharing permits it, and the interface explains that distinction without promising indefinite retention.

## REQ28-C27 — Show complete qualified activity comparisons without surveillance

**Story US28-C27:** As a coach, I want a truthful numeric comparison, so that I can discuss progress without interpreting incomplete records as effort or gaining private activity details.

**Decision basis:** D24 comparison, inference, projection and neutral-state amendments.

The initial profile shall provide a complete compatible qualified target/count comparison or an unavailable actual. A permission-reduced partial count shall not be presented as full attainment.

- **AC28-C27-01:** Count and target agree on participant, subject, canonical measure, period, calendar and applicable version. Incompatible or incomplete inputs withhold the comparison.
- **AC28-C27-02:** The numeric projection excludes supporter identities, activity bodies, individual record links, private target edit history and unsafe geographic calendar labels.
- **AC28-C27-03:** Existing aggregate and inference rules apply jointly to retained periods, overlaps and repeated output. Suppressed values are not reconstructed through another displayed ratio or total.
- **AC28-C27-04:** Complete zero recorded is distinct from no target, paused, partial and unavailable. No label implies laziness, relationship quality or mandatory reporting.
- **AC28-C27-05:** The coach cannot edit targets or counters, drill into activities, export, assign work, rank missionaries or sum several people's progress into a score.
- **AC28-C27-06:** Stop removes this disclosure even when another draft is invalid. Module Off fences current/pending inclusion; re-enable requires fresh inclusion but not a redundant invitation to a still-valid coach.

## REQ28-C28 — Offer a small optional question set

**Story US28-C28:** As authorized staff, I want to offer a few optional questions, so that missionaries have useful prompts without a compulsory reporting form.

**Decision basis:** Ratified D25 organization question profile.

An organization may maintain one ordered set of zero to five plain-text questions. New organizations start with no questions. Starter examples are optional suggestions rather than installed requirements.

- **AC28-C28-01:** Staff with the exact management capability can add, edit, retire and reorder questions, including keyboard-accessible Move up and Move down, and publish an attributed set through Save questions.
- **AC28-C28-02:** Every question and answer remains optional. There is no required flag, rating, signature, attachment, branching rule, per-project exception or completion report.
- **AC28-C28-03:** A set of zero questions leaves plain check-in writing available and does not withdraw already shared writing.
- **AC28-C28-04:** Question administration grants no access to missionary responses. Management preview uses examples rather than private or shared check-in content without independent read authority.
- **AC28-C28-05:** The interface supports at most five questions and 500 Unicode scalar values per question, shows actionable validation, and never truncates accepted input silently.

## REQ28-C29 — Keep answers attached to the question actually presented

**Story US28-C29:** As a missionary, I want my answers to retain their original questions, so that staff edits cannot later change what my words appear to answer.

**Decision basis:** D25 stable question identity, captured wording and editor-start revision.

Each question has stable identity and version. A check-in captures the exact set, wording and order presented when its editor starts, including before the first draft save.

- **AC28-C29-01:** Reordering or editing the organization's set while a missionary writes does not rebind existing answers by position or replace their captured wording.
- **AC28-C29-02:** A materially different question uses a new identity; existing answers are not silently recast as responses to the new meaning.
- **AC28-C29-03:** Retiring a question leaves the captured question with the applicable draft/shared answer, subject to independent safety and retention rules.
- **AC28-C29-04:** Write without questions can hide unused prompts while preserving any nonempty answers. It does not discard hidden text or publish it without review.
- **AC28-C29-05:** The share review and coach detail show the admitted captured wording associated with each answer rather than the latest organization prompt.

## REQ28-C30 — Write and save a private working check-in

**Story US28-C30:** As a missionary, I want to prepare a check-in privately, so that I can think before deciding whether to share it.

**Decision basis:** D25 private drafting and optional plain writing; completeness recovery requirements.

Check-ins shall offer voluntary Write check-in in coaching. Saving writing requires no title, period, target, eligible coach, reporting cadence or next action. A draft is unshared with coaches and question administrators; independent legally authorized source powers remain governed separately.

- **AC28-C30-01:** A missionary can write with no configured questions and no current coach. The interface does not convert the draft into a donor interaction, task or activity count.
- **AC28-C30-02:** Autosave distinguishes Saving, Draft saved and Not saved according to acknowledged persistence. It never describes an unacknowledged browser copy as saved.
- **AC28-C30-03:** Out-of-order requests and multi-device edits do not silently overwrite newer accepted text. A conflict preserves safe input and offers the actual recovery choice.
- **AC28-C30-04:** Weak-network recovery can preserve permitted in-memory input but does not promise private offline storage. Sign-out or a change of user/tenant clears protected display and pending browser work under the common rules.
- **AC28-C30-05:** Guidance clearly distinguishes unshared preparation from absolute secrecy and discourages restricted care, donor and location content; it does not claim perfect automatic detection of sensitive prose.

## REQ28-C31 — Review and share one exact check-in version

**Story US28-C31:** As a missionary, I want to review the exact writing and audience before sharing, so that autosave and Share cannot be confused.

**Decision basis:** D25 publication revision, recipient set and explicit sharing amendments.

Share shall publish the exact reviewed revision to the entire reviewed eligible recipient set atomically. At least one recipient and some non-whitespace content are required.

- **AC28-C31-01:** The review shows the exact nonempty answers/freeform text, their captured questions, named eligible coaches, context and applicable access duration.
- **AC28-C31-02:** Draft autosave never publishes. The deliberate Share action is visibly distinct from private saving and reports its own durable outcome.
- **AC28-C31-03:** If content, audience eligibility or material authority changes before acceptance, the user receives refreshed review rather than a silently changed or partially published recipient set.
- **AC28-C31-04:** Share creates one current shared version with an explicit audience. It creates no email, notification send, task, activity count, donor interaction or implied coach assent.
- **AC28-C31-05:** An interrupted response recovers the same accepted publication. Global body-hash deduplication does not collapse separate legitimate check-ins with identical wording.

## REQ28-C32 — Revise or withdraw check-ins without hidden disclosure

**Story US28-C32:** As a missionary, I want edits to remain private until I update the shared version, so that a working revision cannot surprise my coach.

**Decision basis:** D25 one-current-shared-version, audience and independent Stop requirements.

After publication, editing shall produce private working changes while the coach continues to see the last currently admitted shared version. Update shared check-in is a separate deliberate reviewed action.

- **AC28-C32-01:** The author can identify private draft changes and the currently shared version. The coach receives no draft diff or private revision archive.
- **AC28-C32-02:** Updating deliberately replaces the current shared revision for its exact reviewed audience; different wording for different audiences uses separate check-ins rather than per-answer permissions or content branches.
- **AC28-C32-03:** Removing recipients or Stop works even when a private draft is invalid. Removing the final recipient uses the same Stop meaning and ends this publication's future access.
- **AC28-C32-04:** New coaches, new invitations and re-enabled narrative sharing do not inherit previous writing. Fresh deliberate sharing is required under current permissions.
- **AC28-C32-05:** Narrative-sharing Off fences its affected current and pending releases. Emptying the question set alone does not disable writing or withdraw publications.
- **AC28-C32-06:** A lost Stop/Update response is recoverable without republishing old text, restoring removed recipients or exposing text that is no longer authorized.

## REQ28-C33 — Read bounded plain-text check-ins accessibly

**Story US28-C33:** As a coach, I want readable shared check-ins with clear limits and states, so that I can prepare without seeing private writing or struggling on a weak connection.

**Decision basis:** D25 narrative projection, accessible UX, bounded input/query and retention requirements.

Lists shall expose admitted metadata only and load text on authorized detail. Plain text shall preserve Unicode and line breaks without executing markup or fetching remote content.

- **AC28-C33-01:** The list presents admitted date, author and an Updated indicator where applicable; detail presents the admitted shared/updated time and captured question headings. It includes no private draft, skipped-answer count, body snippet across the portfolio, historical version archive or raw source link. No check-ins shared is neutral and distinguishable safely from unavailable information.
- **AC28-C33-02:** Each answer and freeform response accepts at most 4,000 Unicode scalar values; the encoded request cap is 256 KiB. Metadata pagination defaults to 25 and caps each page at 100, without treating that page cap as the total accessible history.
- **AC28-C33-03:** Client and server count the same units, including emoji, combining input and input-method composition. Near-limit guidance is useful and does not interrupt every keystroke; content is never silently truncated.
- **AC28-C33-04:** Shared text is escaped plain text with meaningful line breaks. HTML, embedded media, attachments and remote URL previews are not introduced by check-in writing.
- **AC28-C33-05:** Later narrower input limits do not make previously accepted text unreadable. Finite source-owned schedules for abandoned drafts, accepted revisions and evidence must be qualified before activation; no new universal retention number is implied.
- **AC28-C33-06:** Loading, empty, failure, ended access and retry states work with keyboard, screen reader, reflow and low bandwidth without relying on color or a transient toast.

## REQ28-C34 — Select one existing next step for coaching

**Story US28-C34:** As a missionary, I want to share a selected next step from my existing tasks, so that my coach sees what I intend to do without creating a duplicate task.

**Decision basis:** Ratified D26 selected task summary; P9 task and source-controlled work ownership.

Share with coach on an eligible task and Coaching → Next steps shall converge on one authorized current-context selection/review flow. Eligibility depends on a qualified task-kind projection, not merely whether a task was created manually or automatically.

- **AC28-C34-01:** The picker searches only eligible tasks in the current admitted subject/context before counts and results. It does not expose a global task finder or hidden titles.
- **AC28-C34-02:** Independent follow-up and source-controlled kinds are available only when their exact minimal projection is qualified. Unknown kinds remain withheld while ordinary task work continues independently.
- **AC28-C34-03:** One review identifies one exact task occurrence, explicit eligible recipients, safe context and the existing access duration. It does not preselect all or future coaches.
- **AC28-C34-04:** The accepted action adds the entire reviewed eligible recipient set atomically. It introduces no second task, duplicate source deadline, extra expiry picker or invented approval queue.
- **AC28-C34-05:** Creating a task, adding a coach or enabling the module does not automatically share existing or future tasks.

## REQ28-C35 — Share a minimal approved task description with live facts

**Story US28-C35:** As a missionary, I want to approve a short safe description while the real due date and status stay current, so that the coach receives useful context without private task details.

**Decision basis:** D26 minimal projection and versioned descriptor; P9 source facts.

A coaching task summary shall contain an opaque summary handle, an approved plain-text description, current qualified due value/status and safe context/currentness. The description is an approved disclosure version; the due value and status derive from the same authoritative task.

- **AC28-C35-01:** Raw private title/body, supporter information, source record IDs/URLs, attachments, other assignees, private notes, money and task history are excluded.
- **AC28-C35-02:** A safe title can prefill the description only when the source qualifies that disclosure. Manually paraphrasing protected material does not bypass its restrictions.
- **AC28-C35-03:** The approved description accepts at most 240 Unicode code points, with consistent accessible input validation and no silent truncation.
- **AC28-C35-04:** Summary and picker pages default to 25 and cap each page at 100; every currently eligible item remains traversable without a total-workspace truncation claim.
- **AC28-C35-05:** Changes to authoritative due value or status update the admitted summary without a separately writable coaching copy or a new disclosure review when nothing meaning-bearing or eligibility-related changed.
- **AC28-C35-06:** Entry, focus and explicit refresh obtain a freshly authorized source result through the existing query pattern. The feature does not promise instant push delivery or add a new real-time subscription; previously viewed bytes cannot be recalled from an open tab.

## REQ28-C36 — Re-review task meaning when it changes

**Story US28-C36:** As a missionary, I want changed task meaning to require a new safe description, so that an earlier review cannot expose newly sensitive work.

**Decision basis:** D26 meaning-revision invalidation and current eligibility.

Each registered meaning-bearing title/description change shall durably invalidate the existing approved description. The system shall not infer that a change is harmless using cosmetic, similarity or AI heuristics.

- **AC28-C36-01:** After a meaning revision, the previously approved summary is withheld until a new qualified review; restoring the former text does not restore the old approval.
- **AC28-C36-02:** A subject, responsibility or classification change requalifies eligibility and cannot retarget an old share to a different task/context.
- **AC28-C36-03:** A due/status-only change does not prompt needless re-sharing while the task and projection remain eligible. A private note edit does not invalidate solely because it is an edit, unless it changes eligibility under the owner contract.
- **AC28-C36-04:** The missionary receives a clear actionable review state without leaking new private meaning to the coach. The coach sees a safe unavailable state rather than the stale approved description.
- **AC28-C36-05:** Concurrent edit/review/Stop requests cannot release a descriptor approved for an earlier meaning after that approval is invalidated.

## REQ28-C37 — Preserve task lifecycle without granting coaching control

**Story US28-C37:** As a coach, I want next-step status to retain its real meaning, so that I do not mistake task completion for an interaction, payment or message being completed.

**Decision basis:** D26 task occurrence, status and terminality amendments; D8 read-only role.

Task completion, cancellation and any permitted reopening remain source-owned. Sharing a task summary shall not create new lifecycle powers or business facts.

- **AC28-C37-01:** Completed and cancelled are distinct. Neither is automatically proof of a sent message, real interaction, financial receipt or satisfied commitment.
- **AC28-C37-02:** An Independent task may reopen the same occurrence only under its source contract. A source-controlled predecessor is not reopened; its replacement, recurrence or successor requires fresh selection.
- **AC28-C37-03:** The coach has no mutation, commenting, assigning, reminding, completing, reopening, exporting, raw drilldown or calendar/email publication action through the summary.
- **AC28-C37-04:** Stop sharing leaves the real task intact. Expiry and module Off fence the summary's current/pending disclosures; re-enable requires fresh sharing without a redundant invitation to a valid coach.
- **AC28-C37-05:** A denied source fetch is never represented as empty, completed or cancelled. Retry recovers the actual admitted source outcome without duplicating inclusion.

## REQ28-C38 — Find useful organization resources

**Story US28-C38:** As a qualified missionary or staff reader, I want a simple resource library, so that I can quickly find material my organization has approved for my current context.

**Decision basis:** Selected D12 organization-managed resource library; D37 resource reuse; Phase29 Q55/Q57–Q59 ratified review, reporting, staff-reader and personal-return amendments.

Resources from the organization shall provide text-first browsing with practical descriptions and honest format, language and known file-size information. Categories organize content; they do not grant access. The P28 owner adopts the complete Phase29 resource contracts at repository-root path `docs/prds/sitestacker-parity/phase-29-files-documents/organization-and-review-tools.md`, REQ29-C80–C86 and C95–C115, with their shared proof requirements. This repository-root reference applies equally from the canonical volume and generated contract companion. These add advisory review planning, actual review/correction, private problem reporting and handling, independently qualified staff readership/shared publications, and optional personal Save for later; they are source-owned extensions, not a competing library.

- **AC28-C38-01:** Search, filters, counts, thumbnails and pagination include only current authorized publications before enumeration, including when a saved search or old link is reopened.
- **AC28-C38-02:** Open and Download accurately identify their effects and their resource. No forced preview dialog, autoplay or whole-file prefetch is required to browse the library.
- **AC28-C38-03:** Returning from a resource preserves search/filter/list position where safe, while rechecking current access.
- **AC28-C38-04:** No available resources, no matching results, a load failure with Retry and an unavailable old link have distinct safe states. Hidden resource names are not disclosed, and the flow does not invent a request-access queue.
- **AC28-C38-05:** External resources use the qualified resource destination contract and identify the destination honestly. Library removal does not claim to erase an external site or recall a public URL.
- **AC28-C38-06:** Reading or opening a resource creates no completion record, course credit, coaching disclosure, subscription or automatic task. Ordinary missionaries are readers rather than content submitters.
- **AC28-C38-07:** Staff Resources uses the current qualified staff-resource purpose in the existing staff experience; missionary readership remains independent. No curator, missionary profile, fabricated Party, Support ticket or Support-read privilege is required solely for qualified staff resource reading. Dual-context people receive only current-context results. Support D27-C authored Staff guides retain their distinct owner and ticket-free Support-read consultation.
- **AC28-C38-08:** Eligible resources remain available after an advisory review target passes, with truthful Review due/current-plan/applicable-actual-review/unknown states. Actual rights, safety and withdrawal still govern. Record review, Change review date and factual correction follow REQ29-C80–C86; no generic Publish/Save invents review or recurring cadence.
- **AC28-C38-09:** Report a problem and Your reports follow REQ29-C95–C102 and the explicit staff report-purpose adoption in REQ29-C107. Body failure need not block a source-qualified metadata-based report. Own report-purpose return is distinct from resource access; Open/Handled/Withdrawn, editor/restoration and curator correction/handling require their actual current powers, without chat, new notice or other-reader disclosure.
- **AC28-C38-10:** Optional Save for later/Remove from saved follows REQ29-C110–C115. A private reference resolves only the same publication's current authorized head; it is not a byte copy, hold, subscription or completion fact. Known unavailable resource, unknown evaluation and denied own-purpose are distinct; permitted own Remove remains independent of resource reading, and removed preferences do not revive through restore.

## REQ28-C39 — Curate and publish resources intentionally

**Story US28-C39:** As an authorized resource curator, I want to prepare, review and publish material, so that the library contains intentional and current guidance.

**Decision basis:** D12 selected staff-managed library and reviewed publication/custody safeguards; Phase29 Q58 shared-publication amendment and Q55 exact review applicability; existing content/document owners.

Curatorial capability shall be explicit within authorized staff context, not universal staff power or a new missionary submission queue. Resource-purpose publication owns audience and meaning; document custody owns bytes, versions, integrity, scanning and retention. REQ29-C103–C109 governs one suitable publication deliberately serving Staff, Missionaries or both within exact organization/Tenant/environment; actual source/P12 eligibility narrows every read. One shared publication has one content/language/meaning/lifecycle/review plan, while separate publications remain available when these differ.

- **AC28-C39-01:** Prepare, unpublished, published and withdrawn publication states remain distinct from file processing or quarantine. Uploading, scanning or placing a file in a folder does not publish it.
- **AC28-C39-02:** Publish/correct/replace validates current authority, exact organization/audience, approved immutable content version, content safety and applicable rights before accepting the reviewed publication.
- **AC28-C39-03:** A newer file at a familiar path does not replace published content automatically. Publication binds the exact admitted version.
- **AC28-C39-04:** A failed replacement leaves the earlier publication available only if it independently remains safe and authorized. Failure does not silently publish an unreviewed alternate version.
- **AC28-C39-05:** Ordinary qualified curation adds no routine extra moderator. Existing actual safety, policy and rights approvals retain their owning requirements.
- **AC28-C39-06:** Accessible source content is part of acceptance: unusable reading order, missing required captions or absent necessary alternatives are not cured merely by accessible library chrome.
- **AC28-C39-07:** Audience changes require review of the complete affected scope and one deliberate current command; no implicit Both, hidden-family omission, membership enumeration or broad role grant. Draft may have no audience; published empty declared set is not allowed. Zero currently eligible people in a declared family does not automatically withdraw the publication.
- **AC28-C39-08:** Separate preparation may reuse only actual permitted fields/exact content, never reviews/reports/approval/grants/history. New publication and old narrowing are separate deliberate recoverable acts, without atomic Split, synchronization or delay of urgent restriction. Shared replacement applies to the one shared edition; review applicability is reevaluated against content/audience/purpose, without false inherited Last reviewed or forced new review target.

## REQ28-C40 — Withdraw resources through current custody and audience controls

**Story US28-C40:** As a curator, I want withdrawal to stop new library access reliably, so that outdated or unsafe material cannot remain available through stale navigation or download paths.

**Decision basis:** D12 reviewed withdrawal/current-delivery design; Phase29 Q58 audience/withdrawal/recovery refinements; document custody and permission boundaries.

Withdrawal shall fence this library's new discovery and retrieval without deleting independently held/shared bytes, unrelated lawful uses or required evidence. Already delivered bytes cannot be recalled.

- **AC28-C40-01:** Withdrawal wins over stale replacement/retry. A later publication is a deliberate currently authorized action rather than resurrection through an old command or restore.
- **AC28-C40-02:** Metadata, curatorial drafts and content retrieval have their own admitted audiences. Possession of a storage key or previously visible title does not authorize a new retrieval.
- **AC28-C40-03:** The private retrieval path enforces the actual current requester/source boundary through its delivery infrastructure. Signed URL naming, token rotation or client hiding alone is not accepted as proof of cutoff.
- **AC28-C40-04:** Unknown legacy ownership, classification or publication state remains unadmitted until qualified. A content import cannot manufacture publication authority.
- **AC28-C40-05:** Search results, thumbnails, accessible labels, caches, byte delivery and deferred work cannot disclose withdrawn content through a broader path.
- **AC28-C40-06:** The solution reuses resource publication and custody owners without introducing another storage system, CMS, content-policy engine or speculative full-body/AI search service.
- **AC28-C40-07:** Removing the final declared family offers explicit whole-publication Withdraw and leaves current publication unchanged until that act commits. Withdraw validates its own current authority/basis independently of unrelated invalid or unsaved draft fields, preserving draft safely. Removing one family, whole withdrawal, temporary reader denial and byte deletion remain distinct.
- **AC28-C40-08:** Re-add/reoffer is fresh current admission, never stale retry/backup revival. Independent report-purpose maintenance and permitted personal-reference cleanup remain separately governed. Real scoped protection/stewardship recovery remains available without a full-scope editing bypass, automatic old-audience restoration or compulsory re-upload of lawful retained content.

## REQ28-C41 — Discover, skip and return to an optional starting guide

**Story US28-C41:** As a missionary, I want an optional starting guide I can use in any order, skip and revisit, so that guidance supports my work without becoming a gate.

**Decision basis:** Ratified D37 optional guide and discoverability amendments.

An offered guide shall have one stable Getting started home within Resources. Home and Help entry points shall lead to that same guide. Ordinary work remains available independently.

- **AC28-C41-01:** The guide states that its suggestions are optional and can be used in any order. It adds no completion/acknowledgment gate, required method, reporting cadence, badge, score, due date or timed course.
- **AC28-C41-02:** A quiet Home invitation can be hidden and restored. Dismissal is an exact user-by-organization presentation preference that survives routine revisions and re-offering.
- **AC28-C41-03:** Hiding the invitation does not hide the stable Resources destination. The preference does not become staff or coach progress evidence.
- **AC28-C41-04:** A disabled or unavailable guide does not trap the missionary in onboarding or block independently qualified tasks, resources, coaching or ordinary workspace work.
- **AC28-C41-05:** Opening the guide or reading a suggestion does not record an interaction, task completion, gift, subscription, coaching assignment or communication send.

## REQ28-C42 — Author one practical organization guide

**Story US28-C42:** As authorized staff, I want to edit the organization's suggestions easily, so that guidance stays relevant without maintaining a course platform.

**Decision basis:** D37 authored profile, optionality and reuse limits.

The organization shall maintain one guide with a title, introduction and ordered plain-text suggestions. Staff may start blank or from original editable examples as unpublished draft; no existing tenant is automatically offered a guide.

- **AC28-C42-01:** A suggestion may be useful advice alone, with at most one approved resource reference and at most one registered existing workspace entry.
- **AC28-C42-02:** The editor does not accept arbitrary internal routes, record IDs, commands, executable markup or a second guide-owned external-link catalog. Commercial or restricted curriculum requires applicable rights rather than copied content by default.
- **AC28-C42-03:** Reordering works with keyboard and touch Move up/Move down controls; drag may supplement them but is not the sole method.
- **AC28-C42-04:** Save draft preserves working changes without changing the offered guide. Preview is clearly labeled and uses the real renderer without impersonating a missionary or treating curator read access as audience permission.
- **AC28-C42-05:** Publication requires at least one nonempty audience-safe suggestion. It requires no minimum number of links and adds no mandatory mode, multiple curricula, per-person exceptions or progress analytics.

## REQ28-C43 — Publish a coherent guide revision

**Story US28-C43:** As a guide curator, I want Publish to offer exactly the version I reviewed, so that missionaries never receive mixed or accidental draft content.

**Decision basis:** D37 publication, atomicity and recovery amendments.

First publication deliberately offers the guide; there is no separate enable toggle on top of that publication. Publish changes shall atomically accept the entire reviewed revision.

- **AC28-C43-01:** Not offered, Available and Disabled are distinguishable from the presence of unpublished draft changes. A successful draft save is never reported as publication.
- **AC28-C43-02:** A reader receives one complete admitted revision, not mixed old/draft/new title, advice or references.
- **AC28-C43-03:** A version conflict preserves safe editor input and requires the appropriate refreshed review. A failed replacement preserves the old release only if it remains independently valid.
- **AC28-C43-04:** Required publication evidence and the authoritative effect succeed together. If the required audit cannot be retained, publication does not report success.
- **AC28-C43-05:** A lost response recovers one accepted publication without duplicating or applying an old revision over a newer Disable or publication.

## REQ28-C44 — Resolve guide links through their existing owners

**Story US28-C44:** As a missionary, I want each guide suggestion to lead to a real permitted resource or workspace action, so that guidance stays useful and never exposes hidden material.

**Decision basis:** D37 bounded resource/action references and current reader admission.

Each reference shall resolve against the current resource or registered workspace-entry owner. Guide availability does not grant resource access or action authority.

- **AC28-C44-01:** Current reader permission is applied before link labels, URLs, counts and numbering. An inaccessible destination does not leak its title or existence through a numbered gap.
- **AC28-C44-02:** Independently safe advice may remain when its link is withdrawn. If safe separation cannot be proved, the affected suggestion is withheld rather than leaving unsafe dependent wording.
- **AC28-C44-03:** Following a workspace entry opens its ordinary authorized journey. Rendering, prefetching or opening the guide does not execute the destination's mutation or communication.
- **AC28-C44-04:** Withdrawn/invalid references produce one actionable maintenance notice for an authorized curator in existing management. They do not generate missionary nags, fabricated replacement links or a new support queue.
- **AC28-C44-05:** The guide and its dependencies are checked on new protected release; a cached rendered revision cannot continue exposing a destination after its current source permission is lost.
- **AC28-C44-06:** Advisory Review due alone neither invalidates a guide reference nor produces a maintenance notice. Actual source-invalid references retain the existing maintenance contract. A separate publication/successor hint never silently moves a personal save or grants new resource/report access.

## REQ28-C45 — Disable and re-offer guidance without losing independent work

**Story US28-C45:** As a guide curator, I want to stop offering guidance and later re-offer a reviewed version, so that I can maintain it safely without disrupting missionary work.

**Decision basis:** D37 Disable/Offer lifecycle and personal dismissal preservation.

Disable shall stop this guide's discovery and new delivery. Editing while Disabled shall not re-offer it. Offer guide is a deliberate current review of the exact intended draft or retained release.

- **AC28-C45-01:** Disable remains available despite an invalid draft and fences new guide releases, including stale cache responses and delayed publication work.
- **AC28-C45-02:** Disabling does not delete independent resources, tasks, check-ins, user work or required source history.
- **AC28-C45-03:** Offer revalidates the exact reviewed version and its references. An invalid draft does not silently cause a different retained version to be offered instead.
- **AC28-C45-04:** Old commands, restored data or retry cannot defeat a later Disable or erasure. A new Offer is distinguishable from recovery of an earlier accepted command.
- **AC28-C45-05:** Re-offering preserves the missionary's Home dismissal preference; it does not force an onboarding experience or imply required completion.

## REQ28-C46 — Enable regional discovery deliberately with one control

**Story US28-C46:** As authorized organization staff, I want one clear regional-discovery control, so that we can offer the list and map deliberately without changing public publication.

**Decision basis:** Selected D13 list/map/control; D46 explicitly selected initial new-organization default; completeness configuration safeguards.

New organizations shall start with Phase 28 regional discovery Off until authorized staff enable the qualified capability. Existing legitimate choices shall be preserved. Missing or unknown legacy configuration shall not imply On.

- **AC28-C46-01:** One setting controls both Phase 28 regional list and map views. It does not alter public Page visibility, the public directory, resources, other tenants or other map consumers.
- **AC28-C46-02:** On consumes only the current qualified source corpus and grants no new publication, location or access right. Saved On with unavailable source qualification still denies unsafe release and explains the actual safe setup state.
- **AC28-C46-03:** Off removes discovery entry points and blocks server release for this consumer, including stale caches and delayed responses. Re-enable recomputes current eligibility rather than reviving an old corpus.
- **AC28-C46-04:** Save derives organization/actor from trusted context, checks the expected revision, retains required evidence and offers authoritative readback. A stale On request cannot undo a newer Off.
- **AC28-C46-05:** The interface distinguishes Off, missing setup, denied management permission and source/renderer failure. It adds no per-region switch, personal exception, device-location request or policy matrix.

## REQ28-C47 — Use one safe published corpus for regional browsing

**Story US28-C47:** As a missionary, I want regional browsing to contain only approved public ministry information, so that exploration cannot reveal private people or locations.

**Decision basis:** D13 selected geography journey and reviewed source boundary; D46; current public-publication and privacy owners.

Both views shall use one currently Listed, disclosure-safe public-ministry corpus bound to the exact organization, legal entity, environment, Site and locale. The bounded Phase 28 broad-region consumer must be independently qualified; another phase's map exclusion is not silently removed.

- **AC28-C47-01:** No arbitrary default Site, cross-organization join or cross-locale fallback widens the corpus. Hidden and Shared-by-link entries contribute no regional totals, ordering or visible regions.
- **AC28-C47-02:** Approved broad-region mapping and geometry are admitted server-side before labels, counts, shapes, accessibility text, URLs or provider requests.
- **AC28-C47-03:** The browser receives no raw private coordinates for rounding; internal addresses are not geocoded, device location is not requested, and invented centroid pins do not imply a person's actual location.
- **AC28-C47-04:** An unknown region has no sensitive-location fallback. Otherwise admitted unmappable entries remain useful in the applicable list-only presentation without a fabricated map position.
- **AC28-C47-05:** Withdrawal, source restriction, Site/locale change and organization Off invalidate the affected output before new release. Counts and accessible labels cannot preserve excluded identities.

## REQ28-C48 — Explore regions with a complete list and usable map

**Story US28-C48:** As a missionary, I want to explore approved ministries using a list or a world map, so that I can use the view that works for my device and accessibility needs.

**Decision basis:** D13 selected list plus world map; reviewed low-bandwidth and accessibility design; D46 availability scope.

List and Map shall share one explicit regional selection and the same admitted corpus. The initial presentation may favor the lightweight list as a reversible design choice; the selected release scope includes a functioning map.

- **AC28-C48-01:** Changing the selected broad region updates both views. Panning or zooming the map does not silently change the list's filter, and Reset has a clear scope.
- **AC28-C48-02:** The actual world overview supports region selection and navigation without drag, pinch, hover or color being the only interaction. It does not trap ordinary page scrolling.
- **AC28-C48-03:** The list is a complete usable alternative with keyboard and screen-reader support. Opening an admitted public page and returning preserves current selection/position subject to refreshed authority.
- **AC28-C48-04:** Map assets load when needed. A renderer failure presents a truthful map error and Retry while the independent authorized list remains usable; a source failure is not mislabeled as an empty region.
- **AC28-C48-05:** Renderer, worker, style, font, attribution, license, network disclosure and supported-device behavior are qualified before release. An already installed library does not authorize a new provider or remote disclosure.
- **AC28-C48-06:** Temporary list fallback is resilience, not permanent completion of the map scope. Disabled, complete-empty, no-match, source failure and map failure remain distinct states.

## REQ28-C49 — Prove and operate the complete coaching and resource journeys

**Story US28-C49:** As the accountable product and service owners, we want explicit proof and operating signals, so that optional coaching and resources stay truthful, private and usable after launch.

**Decision basis:** D8–D10, D23–D26 and D37 proof/monitoring amendments; D46/D47; completeness proof requirements; D12/D13 reviewed engineering qualification.

The following are release requirements, not claims of completed tests. Source qualification, prevention and initial user-journey proof shall precede monitoring. Real accountable people shall be assigned to the named roles before activation.

- **AC28-C49-01:** Each protected source has exact tenant/subject/episode/version/occurrence ownership, trusted actor attribution and tenant-consistent relationships. Missing/null scope grants no access; invitation validity, positive revisions and valid start/end combinations are enforced. Required authorization history is append-only with attributed corrections and governed retention, not erased by a cascade. Old-state and resulting-state authorization are proved through effective grants, row policies, views/functions, storage, asynchronous readers and privileged paths; a permitted update cannot reparent, widen or revive a forbidden state.
- **AC28-C49-02:** Tests exercise duplicate requests, lost responses after acceptance, concurrent Save/Share/Stop, stale Publish after Disable, recipient or subject revocation during release, context switching, restored data and exact before/at/after expiry, including a wait crossing the deadline. Expected results assert durable domain outcomes and current disclosure rather than only implementation calls.
- **AC28-C49-03:** Financial tests cover source-line duplication, correction, historical terms, incompatible currencies/calendars, incomplete coverage and inference across retained releases. Activity tests cover the four real outcomes, participant attribution, duplicate representations, calendar precision, quantity revisions, one-off/pause and sharing continuation.
- **AC28-C49-04:** Narrative and task tests cover private autosave, captured prompt wording before first save, exact recipient publication, stopped access, limits/Unicode composition, meaning invalidation, due/status-only updates and source-controlled successors. Resource/guide/geography tests cover current bytes, withdrawn references, unsafe metadata, publication races and provider/network disclosure.
- **AC28-C49-05:** The real journeys meet WCAG 2.2 AA and Core interaction rules: complete keyboard/screen-reader operation, labels and useful errors, focus restoration, persistent outcomes, non-color meaning, non-excepted 320 CSS-pixel reflow, 200 percent text resizing and 400 percent zoom. Core uses 44-pixel hit areas; this is not misrepresented as WCAG's 24 CSS-pixel minimum and exceptions. RTL, long international names, input methods, reduced motion and safe localized currency/date/zone labels are exercised.
- **AC28-C49-06:** Weak-network/device tests prove bounded metadata-first browsing, lazy body/file/map loading, meaningful retry and safe input recovery without a false offline-save promise. No all-record browser filtering, per-card financial fan-out or silent truncation is accepted as complete behavior.
- **AC28-C49-07:** Before activation, owners declare and measure supported cardinalities, concurrency, request/query/memory, latency/freshness and recovery bounds against production-shaped data. The exact ratified operational thresholds below are preserved; unspecified budgets require owner qualification rather than invented universal numbers.
- **AC28-C49-08:** Migration and mixed-version tests preserve existing choices, prevent inferred historical enrollment/publication/grants, fence incompatible old writers and prove containment without deleting independent source history or reviving ended access. When old software cannot represent accepted new history, recovery uses a safe forward correction rather than unsafe rollback.
- **AC28-C49-09:** Retention for drafts, accepted narratives, source evidence, preferences and copies is finite and classification-owned where required; access expiry is not retention expiry. Activation requires the actual schedules and restore behavior without importing an unrelated phase's duration.
- **AC28-C49-10:** Decision, glossary, source-owner contracts, requirements, design, implementation work, tests and release evidence agree on role names, states, periods, defaults and exact limits. Documentary checks, synthetic examples and read-only code inspection are not reported as deployed authorization, provider or usability proof.
- **AC28-C49-11:** Each applicable signal in the following operating table has a working route to its named owner and the stated response. Monitoring never supplies permission to launch a known incorrect or unsafe journey.
- **AC28-C49-12:** Protected durable history records the actual actor, subject, purpose, reviewed scope/version, transition cause and stable effect identity, separately from technical logs and narrative bodies. Diagnostic events do not copy protected prose or invitation proof; an audit reference retained after access ends grants no right to read the former shared content.

| Signal                                                                                                                                                           | Threshold                                                                                                                   | Accountable owner                                                                                   | Required response                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wrong tenant/subject/recipient/field/period disclosure, unauthorized coaching write, private-draft release or ended-access resurrection                          | Any one confirmed occurrence                                                                                                | Security on-call and Identity/Permissions owner, with the affected domain owner                     | Fence the affected path/profile, preserve restricted evidence, contain and reconcile, and prove the failing case corrected before reactivation. Do not automatically disable unrelated source work. |
| Duplicate active relationship/inclusion or accepted effect; authoritative change missing required history; contradictory durable command outcome                 | Any one confirmed invariant breach                                                                                          | Coaching or guide command owner, with the affected source owner                                     | Stop affected mutations, recover from authoritative evidence, repair atomicity/semantic replay and requalify. Recovery shall not require routine direct database repair.                            |
| Financial amount, cohort, currency/unit or historical-period mismatch against the canonical reference                                                            | One reproducible nonzero discrepancy or wrong-period inclusion                                                              | Received/expectation metric owner, coordinated by the workspace owner                               | Withhold the affected measure, repair through source commands, rebuild the qualified projection and add regression proof.                                                                           |
| Source result presented as complete/current beyond its admitted coverage/freshness contract, or unavailable history presented as zero                            | Any confirmed case                                                                                                          | Owning source projection/operator                                                                   | Remove the false claim, show the safe unavailable/stale state, recover source coverage and retain independent safe modules.                                                                         |
| Activity count differs from a same-scope authoritative rebuild, has duplicate effects or wrong participation                                                     | Any reproducible mismatch                                                                                                   | Activity/communication source owner and workspace owner                                             | Suppress the exact result as unavailable, repair source/correlation, replay boundedly and test the counterexample; never repair a manual counter.                                                   |
| Accepted source activity remains behind in its target projection                                                                                                 | Lag greater than 60 seconds continuously for 5 minutes in the affected qualified scope                                      | Workspace service owner                                                                             | Keep Updating truthful, investigate backlog/invalidation, recover the projection and inspect misleading duplicate-entry prompts. This is an alert budget, not promised provider latency.            |
| Target read latency                                                                                                                                              | Server p95 greater than 1 second for 15 minutes at the approved tested workload                                             | API/database on-call                                                                                | Inspect scoped queries, fan-out and authorization cost; restore the approved budget or disable the expensive affected view without returning a partial total.                                       |
| General portfolio/summary/history/task query, memory, queue, latency, completeness or freshness regression                                                       | Any breach of its declared measured release-profile budget or applicable service objective                                  | Workspace/API operator and owning source/platform team                                              | Inspect scoped plans and load, repair indexing/batching or constrain admitted load truthfully; preserve authorization and requalify before expansion.                                               |
| Invitation delivery remains unresolved                                                                                                                           | Beyond the activated communication purpose's explicit retry/utility deadline                                                | Communications owner                                                                                | Show truthful delay/failure, recover the durable provider/source outcome within its contract, and do not duplicate invitation or grant.                                                             |
| Acknowledged check-in draft is lost, duplicate publication occurs or publication reaches a wrong recipient                                                       | Any one confirmed occurrence                                                                                                | Workspace engineering owner; security owner for exposure                                            | Pause affected writes/disclosure, preserve necessary metadata, recover through source history and prove the regression corrected.                                                                   |
| Technical check-in draft-save/Share failures                                                                                                                     | More than 1 percent of at least 100 attempts within 15 minutes, excluding expected denial/validation                        | Workspace on-call                                                                                   | Investigate dependency, latency and receipt state; narrow rollout and give truthful recovery status. Low-volume correctness incidents use the individual-incident thresholds.                       |
| Check-in question profile does not fit a useful optional organization workflow                                                                                   | An organization requests an exception to the five-question profile                                                          | Coaching product owner                                                                              | Review real task evidence and improve wording/freeform use first; change the bounded profile only through normal design review, without automatically building a form engine.                       |
| Stale task descriptor after invalidation, contradictory source status or duplicate active task inclusion                                                         | Any one confirmed invariant violation                                                                                       | Task and coaching engineering owners                                                                | Fence the affected kind/path, reconcile through its owner command and fix/test before restoration.                                                                                                  |
| Denied task fetch represented as empty/completed or needless review after due/status-only change                                                                 | One confirmed false state or reproducible false invalidation                                                                | Coaching/task engineering owner                                                                     | Correct state or meaning-revision mapping, withhold unsafe results and retest without weakening genuine disclosure checks.                                                                          |
| Guide navigation causes unintended source effects; accepted publication is lost; stale command re-offers a disabled guide                                        | Any one confirmed event or invariant breach                                                                                 | Security plus affected domain owner for exposure; guide engineering owner for publication integrity | Disable/stop the affected path, recover from source history without deleting independent work, and prove the race/replay case corrected.                                                            |
| A guide reference becomes withdrawn or invalid                                                                                                                   | Any detected unsafe destination                                                                                             | Authorized tenant guide curator; platform owner for resolver faults                                 | Withhold the unsafe target immediately and provide one actionable management notice to update/remove it; no automatic replacement or missionary nag.                                                |
| Regional output appears while Off or exposes excluded identity/location                                                                                          | Any one confirmed occurrence                                                                                                | Identity/Permissions security and workspace source owners                                           | Contain the affected consumer immediately and requalify its actual release paths.                                                                                                                   |
| Map fails on a supported device or its control state misleads                                                                                                    | Any reproducible failure                                                                                                    | Workspace UI/runtime owner                                                                          | Repair and retest the affected journey, preserving the safe list alternative.                                                                                                                       |
| Critical misunderstanding of organization/scope, expected versus received, fixed historical dates, target sharing, pause, private autosave, task wording or Stop | Any critical observed task failure in release/pilot; any credible task-sharing misunderstanding that could cause disclosure | Product/design owner                                                                                | Correct copy/interaction and repeat the affected task before expansion; do not treat preventable confusion as training debt or collect protected prose in analytics.                                |
| Repeated misconception that targets require reporting, imply delivery, add overlapping measures or auto-share                                                    | A validated critical release/pilot failure, or recurrence of a fixed misconception in two independent support reports       | Product/UX owner                                                                                    | Fix wording/flow and retest; keep exposure disabled where consent or disclosed meaning is unsafe. Do not optimize for logging volume.                                                               |
| Guide optionality, return path or draft/publication distinction remains confusing                                                                                | Same failure in two independent usability sessions or support reports                                                       | Workspace product/design owner                                                                      | Test a targeted correction to wording or placement without adding completion tracking or a mandatory walkthrough.                                                                                   |

The monitored values are adopted design triggers, not measured production baselines. No runtime suite, live provider qualification or human usability study is claimed by this specification. Qualification of the exact owner sources and the complete journeys remains a prerequisite for activation.
