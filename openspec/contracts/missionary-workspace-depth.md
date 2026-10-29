# missionary-workspace-depth normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-0036fda529f91e255eb8"></a>

## REQ28-Q10 — One authoritative source for each fact and command

<!-- BEGIN CONTRACT {"id":"0036fda529f91e255eb8","name":"REQ28-Q10 — One authoritative source for each fact and command"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Business mutations SHALL use the canonical shared API and authoritative source
commands; app routes remain adapters and browser collections expose only their
qualified operations. Public projections, search indexes, dashboards, task
groups and provider events SHALL not become write authorities. Each integration
SHALL identify its exact producer, consumer, fact and permitted effect. Existing
CRM, commitment, financial, content, communication, document and identity owners
remain authoritative. No parallel CRM, direct-provider shortcut, second outbox,
general inbox, external contact-update feed or new generic workflow engine is
introduced by composing Phase 28 journeys.

Story: US28-Q10. Source: proof.md. Decision basis: Ratified completeness C03/C08/C10/C13/C16; ADR0001; platform boundaries and data-access ownership.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-0327f1a890d0e7e9bd5b"></a>

## REQ28-R18 — Enforce expiry and qualified disposal

<!-- BEGIN CONTRACT {"id":"0327f1a890d0e7e9bd5b","name":"REQ28-R18 — Enforce expiry and qualified disposal"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

At a controlling departure deadline, all dependent ordinary reads/discovery/resume stop even if a worker is late/failing. A successfully resumed entry is governed by current-work retention, not its ended departure schedule.

Holds preserve exact qualified custody only and confer no ordinary read/resume right. Hold review date is not automatic release. Hold, resume, correction and destructive acceptance share the qualified source ordering boundary.

Dispose only qualified bodies/actual derivatives; preserve independently scheduled minimal evidence and unrelated CRM/finance/consent facts. Report primary copy outcomes and backup limitations honestly; do not claim all copies destroyed from one successful row delete.

A stale deletion worker cannot remove a now-ineligible target. External deletion ambiguity, if such copies exist, is reconciled under the exact-object irreversible commitment; timeout cannot pretend the deletion is cancelled.

Restore uses complete forward restriction/disposition evidence before release and cannot recover purged bodies or renew deadlines.

Story: US28-R18. Source: relationships.md. Decision basis: D28 C06–C08/C11–C13/C16/C17; D27 C07/C17; completeness C15.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-035bcf36efcf63fbf75c"></a>

## REQ28-M27 — Connect an owned account for personal sending

<!-- BEGIN CONTRACT {"id":"035bcf36efcf63fbf75c","name":"REQ28-M27 — Connect an owned account for personal sending"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- New unconfigured organization enablement is unavailable; deliberate enablement
  connects nobody. One own primary supported mailbox per principal/Tenant,
  provider-qualified identity and scope. Current organization/source capabilities
  apply; no staff role or generic tenant admin plaintext access is implied.
- Use qualified authorization-code/PKCE/OIDC proof, one-use expiring state bound
  to initiating tenant/principal/purpose. Typed From, UPN guesses, Gmail send-only
  getProfile/sendAs, calendar consent or wrong-account callback are not proof.
- Freeze stable provider/account/mailbox/connection/grant authority; same-grant
  short-lived-token refresh can supply current server credential with nonsecret
  attempt attribution. Reconsent/scope/account replacement is not ordinary refresh.
- Connect, identity tests and refresh send no email. Native newsletters remain
  separate and no system/newsletter sender falls back to the personal account.

Story: US28-M27. Source: communications.md. Decision basis: D15 C01/C03/C05/C09; Phase 6/17 and ADR 0029 narrow personal-provider topology amendment; Phase 31 grant ownership.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-044a138eded04f30331b"></a>

## REQ28-M03 — Join as a guest

<!-- BEGIN CONTRACT {"id":"044a138eded04f30331b","name":"REQ28-M03 — Join as a guest"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Require Email, allow one optional Name, identify the public-safe newsletter and
  explain purpose/withdrawal. No required gift/login/phone/postal/split legal name,
  prechecked marketing bundle, forced popup or checkout diversion.
- Resolve operational Tenant/Page/newsletter via the qualified published target
  and CMS-to-operational mapping. Posted tenant/actor/template/sender/header
  values are not authority. Optional name cannot overwrite canonical identity.
- For an eligible guest instruction requiring fresh proof, atomically accept
  one pending occurrence, exact scope/destination, original deadline, minimal
  evidence, durable operation outcome and required confirmation delivery intent.
  Only a durably accepted intake outcome permits “Signup received.” An
  active-identical request stays unchanged without unnecessary confirmation;
  restricted/ineligible outcomes remain non-enumerating and cannot claim a
  pending request or queue forbidden confirmation.
- Public receipt does not disclose prior membership, donor/CRM match or a
  restriction. It is not proof of confirmed subscription or message delivery.
- Duplicate HTTP keys cannot create endless mail; unverified intake cannot
  reserve an address indefinitely against its legitimate reader.

Story: US28-M03. Source: communications.md. Decision basis: D6 selected native public signup; D42 C09; D43 C08; Phase 3/4/6/17 source and proof owners.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-05c008d976eac9831975"></a>

## REQ28-Q01 — Useful first work after authorized setup

<!-- BEGIN CONTRACT {"id":"05c008d976eac9831975","name":"REQ28-Q01 — Useful first work after authorized setup"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The workspace SHALL provide a coherent path from authorized tenant setup to
first useful native relationship, task and appointment work through the existing
settings and navigation. Configured, enabled, source-ready and actor-permitted
SHALL remain distinct. Qualified baseline work SHALL remain useful with optional
guide, goals, coaching, personal connections and assistance Off. No mandatory
onboarding course, master Phase 28 switch or invented access-request workflow
shall become a prerequisite. Blocked work SHALL offer only a real permitted
setup, repair, retry or staff-contact destination without revealing hidden
configuration.

Story: US28-Q01. Source: proof.md. Decision basis: Ratified completeness C01/C06/C16/C17; D37 optional guide; platform surface and capability owners.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-0778cfa0155a3c05f721"></a>

## REQ28-C38 — Find useful organization resources

<!-- BEGIN CONTRACT {"id":"0778cfa0155a3c05f721","name":"REQ28-C38 — Find useful organization resources"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Resources from the organization shall provide text-first browsing with practical descriptions and honest format, language and known file-size information. Categories organize content; they do not grant access.

Story: US28-C38. Source: coaching-resources.md. Decision basis: Selected D12 organization-managed resource library; D37 resource reuse; reviewed source/audience safeguards reconciled in this specification.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-07f69d3e07380773a5f1"></a>

## REQ28-F26 — Qualify whole fixed-commitment fulfillment separately

<!-- BEGIN CONTRACT {"id":"07f69d3e07380773a5f1","name":"REQ28-F26 — Qualify whole fixed-commitment fulfillment separately"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Phase 16 SHALL issue the whole fixed-commitment milestone only for an accepted
positive money-derived application or linked-coverage delta that crosses the
whole applicable positive promise under the same terms. All lines, named
expectations and valid unscheduled capacity SHALL be accounted for within
the pledge's exact Legal Entity and currency; a different currency is not summed
into fulfillment. A term
reduction, release, ending, zero target, paid installment or recurring end is not
that milestone. One continuing fixed pledge SHALL have one automatic fulfillment
purpose; revision, alias, refund/reapply and responsibility changes do not reset
it. A genuinely new pledge has a new purpose. Accepted milestone evidence and
durable consumer intent belong to the owning command, not a side effect of a pure
evaluation or money-posting retry.

Story: US28-F26. Source: finance-stewardship.md. Decision basis: D32; P16 fulfillment ownership.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-0b83686d25181dceeac5"></a>

## REQ28-F43 — Deliver clear, accessible and safe everyday flows

<!-- BEGIN CONTRACT {"id":"0b83686d25181dceeac5","name":"REQ28-F43 — Deliver clear, accessible and safe everyday flows"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Flows SHALL reuse the existing design system and source record/task surfaces.
Expose relevant optional settings through their current owners; do not create a
finance setup wizard for missionaries. Show factual purpose, exact selected scope,
clear current next action and authoritative Save/Done feedback. Distinguish
unsent, saving, accepted, definitively rejected, unknown outcome, unavailable,
conflict and denied. Avoid mandatory narrative or redundant confirmation for
ordinary actions. Preserve international names/text, qualified currencies and
owner calendars; dates SHALL not silently change because of device timezone.
Supported keyboard, screen reader, focus, status announcements, contrast, reflow
and phone interaction SHALL work. Account/tenant changes or revocation SHALL clear
forbidden content and prevent late responses from displaying prior-context data.
No sensitive persistent offline queue or automatic replay of rejected actions is
introduced.

Story: US28-F43. Source: finance-stewardship.md. Decision basis: D16; D19–D22; D29–D33; D40; D48–D50.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-0d6ba964b7a6568e518d"></a>

## REQ28-F07 — Save goals once and handle conflicts honestly

<!-- BEGIN CONTRACT {"id":"0d6ba964b7a6568e518d","name":"REQ28-F07 — Save goals once and handle conflicts honestly"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

A goal save SHALL bind the reviewed goal identity, base revision, normalized
payload and semantic operation identity. Accepted version, head, required
history/audit and result SHALL commit coherently. Relevant concurrent edits and
current authority SHALL be revalidated at acceptance. Same-intent retry SHALL
recover its original result under current disclosure rights; changed payload
under that identity conflicts. An unchanged save SHALL not create another version.
Turning missionary editing Off preserves goal/history and fences future
unauthorized saves without changing goal visibility or publication.

Story: US28-F07. Source: finance-stewardship.md. Decision basis: D16 C09–C13.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-0f0611eafbff6c51052f"></a>

## REQ28-M11 — Withdraw without signing in

<!-- BEGIN CONTRACT {"id":"0f0611eafbff6c51052f","name":"REQ28-M11 — Withdraw without signing in"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Provide the qualified visible HTML/plain-text unsubscribe path and actual
  DKIM-covered RFC 8058 headers on delivered human newsletters. One-click POST
  is cookieless/login-free and needs no extra confirmation; GET/prefetch has no
  withdrawal effect.
- A still-valid human footer link may open the current exact list/destination
  review and establish a fresh deliberate current withdrawal. Replaying an
  already accepted withdrawal command cannot undo a later fresh rejoin.
- Provider one-click commands require stable source/business idempotency;
  identical repeated POST cannot be distinguished by wishful intent inference.
  Do not invalidate every old human link or require login to avoid replay.
- Withdrawal narrows unstarted applicable sends and pending admissions without
  rewriting delivered history or turning one list choice into global objection.
  Stronger independent restrictions retain their remedy/owner.

Story: US28-M11. Source: communications.md. Decision basis: D6 exact-scope withdrawal; D7 C12; D42 C19; D43 C07; Phase 3/6/17 consent and one-click protocol.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-104d67c1a419a29b32d7"></a>

## REQ28-M09 — Know the seven-day deadline

<!-- BEGIN CONTRACT {"id":"104d67c1a419a29b32d7","name":"REQ28-M09 — Know the seven-day deadline"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Set the source deadline to authoritative original acceptance plus 168 elapsed hours, once.
  Require trusted decision time **strictly before** expiry after lock waits.
  Equality is expired; DST/leap dates/local display zone cannot change validity.
- Render the actual source deadline in the permitted email/review as localized
  date, time and timezone. Generic selector doorway still reveals no deadline.
  No relative-only midnight, countdown or timing configuration.
- Read, resend, retries, provider delay, Page Off/On and organization Off/On never
  extend/pause/reset the clock. Future policy change is prospective; confirmed
  memberships do not expire at their old proof deadline.
- Expired link offers fresh Join only through a currently authorized entry.
  Old link never creates fresh intent automatically. Late delivery is honestly
  expired; no invented replacement validity.

Story: US28-M09. Source: communications.md. Decision basis: D44 A and D45 A: one Asym-controlled 168-hour period; D43 C03 strict expiry.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-1190118138df5adbab10"></a>

## REQ28-F01 — Distinguish support facts and relationship meaning

<!-- BEGIN CONTRACT {"id":"1190118138df5adbab10","name":"REQ28-F01 — Distinguish support facts and relationship meaning"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The workspace SHALL distinguish received monetary support, qualified recognition,
commitment expectations, monthly-equivalent planning, approved need, workspace
goal, Finance-confirmed balance and relationship facts. It SHALL identify amount
basis, exact ministry/project, Legal Entity, currency, applicable period and
source freshness where needed to interpret a figure. A missing, denied,
incomplete or unavailable value SHALL NOT become zero. A recorded gift SHALL NOT
prove contact permission, an active commitment or cultivation enrollment.

Story: US28-F01. Source: finance-stewardship.md. Decision basis: D16; D19; D21; D40; completeness C04/C05; P14 H3–H5; P16; P21 D8–D12; P27 REQ27-F78/F79.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-12018f22175b8faece85"></a>

## REQ28-R09 — Correct only eligible contact fields

<!-- BEGIN CONTRACT {"id":"12018f22175b8faece85","name":"REQ28-R09 — Correct only eligible contact fields"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

A source-qualified field inventory names each admitted field, subject/purpose, read/edit/Clear right, validation and required consequence. Edit requires view; sharing/authorship does not grant edit.

Editable values, readable-only values, not-viewable values, permission checking and temporary unavailability are distinct. Forbidden values are not serialized into disabled/hidden inputs.

Save submits only deliberately selected changes; omission means unchanged and Clear is explicit. Any invalid/forbidden submitted field rejects the entire selected action, even if apparently unchanged. A true no-op creates no artificial correction or interaction.

Atomic accepted Save preserves untouched fields and lawful provenance. A stale edit conflicts rather than silently overwriting newer facts. International names/phone/address meaning is preserved without mandatory email, Western split or inferred USA country.

Story: US28-R09. Source: relationships.md. Decision basis: D5 C04–C07/C09/C12/C13; D41 C05–C08/C10; completeness C13.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-138ae64a319b24f86242"></a>

## REQ28-R10 — Preserve field meaning and safe drafts

<!-- BEGIN CONTRACT {"id":"138ae64a319b24f86242","name":"REQ28-R10 — Preserve field meaning and safe drafts"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Contact correction alone verifies no possession, merges no identity, changes no login/legal/billing/public identity, authorizes no contact, and changes no money or private-note audience.

Apply exact changed-field consequences through the owner. A mandatory withdrawal fence or acceptance prerequisite succeeds before acceptance; independently asynchronous consequences use their qualified durable contract and truthful status. No D5-invented notification or donor-self email ceremony is added.

Preserve safe drafts on ordinary validation/conflict while readable. On loss of edit rights explain and prevent stale submission; on loss of read authority/context clear affected content and reject late responses. Restored rights do not auto-resubmit.

Story: US28-R10. Source: relationships.md. Decision basis: D5 C08–C10/C14; D41 C05/C07/C08; P9/P12/contact owners.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-139490a5c753edbaa95f"></a>

## REQ28-R19 — Import eligible contact assertions

<!-- BEGIN CONTRACT {"id":"139490a5c753edbaa95f","name":"REQ28-R19 — Import eligible contact assertions"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Use one Choose file → Review → Import and results journey through P30 intake/P29 private custody/P4/P9 target/P12 authority. No staff-role substitution or routine second reviewer.

Initial field profile admits source-qualified name/display labels, email, phone and faithfully preserved/structured mailing-address assertions. A row needs a usable name/label, email or phone assertion; no universal email/location requirement or forced Party kind.

Explicit multiple-value mappings are required. Source IDs/type/context labels are provenance, not new Party facts. Unsupported notes/care/history/gifts/commitments/goals/credentials/schema/automation fields are shown excluded, never silently accepted.

Intake creates eligible restricted preparation or safely reuses an authorized reference; it neither bulk-updates existing contact fields nor automatically merges/shares/enrolls/sends/verifies anything.

Story: US28-R19. Source: relationships.md. Decision basis: D17 decision/C01–C05/C09; D1/D2; roadmap P30 target-owner acceptance. **Required owner amendment:** bounded missionary reviewer/committer and restricted-preparation target, not broad staff migration access.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-152d127411ef5b8d75d1"></a>

## REQ28-M33 — Enable a bounded tenant-owned purpose

<!-- BEGIN CONTRACT {"id":"152d127411ef5b8d75d1","name":"REQ28-M33 — Enable a bounded tenant-owned purpose"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- One **Settings → AI features → Newsletter writing help** purpose starts Off.
  Activate only a qualified tenant-owned account/credential/model/region/data-use
  binding and explicit finite monthly spend and per-user daily request allowances;
  blank is not unlimited.
- Show provider data destination, data-use posture, billing owner, budget
  currency/period and health. Keys are write-only/server encrypted; no arbitrary
  endpoint/model or silent platform/account/model/region fallback.
- Initial monthly allowance periods are UTC calendar months and daily request
  windows UTC, displaying local reset time. Stable usage account survives key
  rotation/binding changes/re-enable; pending old-period reservations stay there.
- Lowering allowance below used/reserved use blocks new admissions without
  erasing charges/reservations. Provider spend caps are supplementary, not an
  exact invoice/tax/FX/external-key-use guarantee.

Story: US28-M33. Source: communications.md. Decision basis: D18 C01/C02/C09–C11 and ratified UTC periods; shared Phase 21 D10 tenant AI foundation.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-154807334e95f2d50667"></a>

## REQ28-R30 — Configure New and Continued periods

<!-- BEGIN CONTRACT {"id":"154807334e95f2d50667","name":"REQ28-R30 — Configure New and Continued periods"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Two independent positive whole-number finite periods may be equal, smaller or greater than each other within the qualified supported range. New uses calendar days; Continued uses 86,400-second days. No inheritance, copied default, zero/blank-as-Never, third mode or per-missionary/project/referral override.

Before activation P9/API publishes exact supported integer/timestamp/serialization bounds enforced identically by UI/API/database; reject invalid, fractional, nonnumeric, unsafe and overflowing input without clamping/rounding.

Preserve qualified saved values. Unconfigured New blocks only dependent new initial acceptance; unconfigured Continued blocks only dependent Continue, including staff. Neither ends accepted work or disables other qualified actions. Read failure is not unconfigured.

One normal Save/Cancel applies deliberate valid changes atomically with expected base revision, audit and recovery. Untouched unconfigured values may stay absent; attempted Clear of a configured period fails. Relevant-kind changes alone invalidate relevant reviews; editing New alone does not invalidate unchanged Continued terms.

Ordinary edits are prospective and preserve accepted kind/period/end/policy/semantic basis. Saving a period never enables self-service or supplies action rights. Disabling action remains possible despite invalid unsaved drafts.

Story: US28-R30. Source: relationships.md. Decision basis: D36 C01–C03/C05–C08; D38 C01–C08/C12/C15; D39 C02/C08/C09.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-15f487bbdb72cba6ba84"></a>

## REQ28-R07 — Recover sharing without false recall

<!-- BEGIN CONTRACT {"id":"15f487bbdb72cba6ba84","name":"REQ28-R07 — Recover sharing without false recall"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The source effect, required audit/recoverable receipt and optional identifier-only notice intent are atomically accepted. Repeated intended delivery produces one share and requested attention.

A failed refresh or lost response recovers the same outcome under current authority. A later narrowed permission can withhold the response without undoing the accepted share.

Sharing provides no generic Unshare, person deletion, permanent-publication promise or recall of previously delivered information. Source-authorized correction/restriction/disposition remains available through its own owner.

Story: US28-R07. Source: relationships.md. Decision basis: D2 C10–C12/C18–C20; completeness C08/C15.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-1694bfedd62b7c303584"></a>

## REQ28-M07 — Confirm through one protected deliberate action

<!-- BEGIN CONTRACT {"id":"1694bfedd62b7c303584","name":"REQ28-M07 — Confirm through one protected deliberate action"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Use P17's verified frozen Tenant Donor Portal origin/path, nonsecret HTTP
  selector and independent 256-bit fragment verifier. Minimal first-party script
  removes the fragment from browser history and deliberate same-origin POST
  establishes the bounded non-authorizing landing session; qualified review then
  exposes the exact Confirm subscription action under current source proof.
- GET/HEAD/prefetch/preview/scanner opening neither subscribes nor consumes proof.
  Selector-only responses reveal no organization/action/recipient/deadline/state.
  No automatic submit or stripped-fragment alternate protocol.
- Apply existing CSP/cache/referrer/cookie/HMAC/origin/CSRF/key-rotation contracts.
  Missing script leaves proof unconsumed with safe help. Retired/reassigned host
  fails safely, not a redirect guessing new authority. Original Page/device is
  unnecessary.
- Confirmation is not Auth email verification/OTP sign-in, CRM claiming, protected
  reading or identity merge. Do not substitute Auth sign-in or verification operations.

Story: US28-M07. Source: communications.md. Decision basis: D43 C06/C13; Phase 17 protected-action protocol with the bounded native-newsletter non-constituent descriptor amendment.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-17127651582f698bc49a"></a>

## REQ28-Q07 — Current acting authority without role union

<!-- BEGIN CONTRACT {"id":"17127651582f698bc49a","name":"REQ28-Q07 — Current acting authority without role union"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Every read, mutation, export, job and result recovery SHALL prove the currently
admitted tenant, acting context, subject, source eligibility and applicable
permission at its owning boundary. Trusted authentication/source context SHALL
derive actor, author, approver, ownership and audit attribution. Caller IDs are
requests to resolve, not authority. Staff, missionary, coach, donor and public
reader paths SHALL retain their exact contracts rather than the union of a
person's roles. A public reader's qualified signup or confirmation SHALL not
require invented workforce membership, a CRM profile or a staff context.
Service identities SHALL prove their qualified capability and current source
ceiling rather than impersonating a human session or relying on credentials
alone. Current address possession proof and newsletter consent remain distinct.

Story: US28-Q07. Source: proof.md. Decision basis: Ratified completeness C02/C13/C14; P3/P4/P10/P12; D42/D43 public-reader qualification.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-17ed9e58caac786ad41d"></a>

## REQ28-M28 — Privately compose and save a small individual message

<!-- BEGIN CONTRACT {"id":"17ed9e58caac786ad41d","name":"REQ28-M28 — Privately compose and save a small individual message"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Open from permitted contact/follow-up source, showing name and exact address,
  actual From, subject, safe basic formatting/plain text, safe links and optional
  visible signature. Qualified restricted D1 prospects need not be shared merely
  to satisfy a legacy schema; no arbitrary destination fallback or hidden match.
- Initial profile excludes attachments, CC/BCC, aliases, shared/delegated
  mailboxes, schedules, sequences, tracking and inbox/reply import.
- Raw private-draft, prepared-material and credential stores have no direct
  public or authenticated-browser table grants. Source commands consume the
  current capability decision over coarse tenant isolation, including privileged
  workers, views, search, exports, storage and realtime. Same human/account in
  two Tenants retains two isolated source contexts; settings access is not body
  access, and ordinary row edit cannot alter protected authority/outcome fields.
- One private source revision with conditional save; Saved requires persistence,
  conflicts preserve recoverable input. Unsaved navigation offers Save/Discard/
  Keep editing. No browser-crash/offline resend promise or send-on-Enter.
- Draft expires 30×24 elapsed hours after last meaningful successful author save;
  reads, identical autosave, retry and restore cannot extend it. Show expiry;
  retain current lifecycle/recovery revision, not unlimited sent-content history.

Story: US28-M28. Source: communications.md. Decision basis: D15 C02/C04/C06/C07/C14; Phase 9/28 private authored-message source and Phase 12 current access.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-17f514a83fa7be5d2b92"></a>

## REQ28-R27 — Record the original referral date

<!-- BEGIN CONTRACT {"id":"17f514a83fa7be5d2b92","name":"REQ28-R27 — Record the original referral date"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Reuse qualified source evidence; ask one original-date question only when needed, with an explicit unknown path. Preserve original referral event, recipient, lineage and factual precision separately from entered/imported/accepted times.

Creation, first view, import, reassignment, merge or retry never creates a later original event or second initial window. A genuinely separate introduction requires source evidence, not another row.

Preserve a qualified date-only assertion without inventing midnight. Exact instants derive their calendar date in the declared organization calculation zone while retaining source precision/provenance. Known dates from another zone are not converted by inventing missing time.

Unknown/approximate dates remain unconfirmed, not Today/Active/Expired/Continue eligibility. Reject a clearly future event as already given; treat apparent future dates from date-line/zone differences through contextual validation. Planned work remains planned.

Story: US28-R27. Source: relationships.md. Decision basis: D39 C01/C03/C06/C13; P9 referral edge/source owner; glossary Original referral date.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-1925a0a4d15a9c11e3c7"></a>

## REQ28-C47 — Use one safe published corpus for regional browsing

<!-- BEGIN CONTRACT {"id":"1925a0a4d15a9c11e3c7","name":"REQ28-C47 — Use one safe published corpus for regional browsing"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Both views shall use one currently Listed, disclosure-safe public-ministry corpus bound to the exact organization, legal entity, environment, Site and locale. The bounded Phase 28 broad-region consumer must be independently qualified; another phase's map exclusion is not silently removed.

Story: US28-C47. Source: coaching-resources.md. Decision basis: D13 selected geography journey and reviewed source boundary; D46; current public-publication and privacy owners.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-1a2667524a58b7128c76"></a>

## REQ28-Q04 — One coherent daily work journey

<!-- BEGIN CONTRACT {"id":"1a2667524a58b7128c76","name":"REQ28-Q04 — One coherent daily work journey"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Home and work detail SHALL show currently actionable work with its permitted
factual reason, relevant date, responsible actor and clear next step. Task,
appointment, actual interaction, Request response, commitment and received gift
SHALL remain distinct source facts. Optional actual-interaction recording may
reuse currently permitted entered context; it SHALL not copy private material
into shared history or impose mandatory logging. Opening a dialer or mail app,
copying contact details or checking a task SHALL not manufacture an attempt,
conversation, sent message, response, consent or payment. Decline, defer,
cancellation, no answer, no authorized contact method and nonfinancial support
SHALL remain ordinary supported outcomes. Actively managed P27 work retains a
valid next task or an owned actionable exception; displaying restricted early
preparation SHALL not enroll it in managed work.

Story: US28-Q04. Source: proof.md. Decision basis: Ratified completeness C03/C05/C08; P9 interaction/task ownership; P27 managed-work floor; D40 informational recurring miss.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-1cb2ff388715ee48ed7f"></a>

## REQ28-F36 — Revalidate corrections at application without rewriting history

<!-- BEGIN CONTRACT {"id":"1cb2ff388715ee48ed7f","name":"REQ28-F36 — Revalidate corrections at application without rewriting history"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Application SHALL re-prove current policy, canonical actor/approver, exact source
and material revision. A stricter effective policy governs uncommitted work; a
relaxed policy SHALL not automatically apply a waiting request. An authorized
deliberate continuation may use the same operation with renewed review when
required. Posted corrections SHALL append exact source changes and preserve
original facts, reason and before/after evidence; they SHALL not edit posted rows
in place. Existing qualified tenant policy SHALL survive upgrade. Missing,
invalid or unknown existing policy SHALL not be interpreted as permission to
bypass approval. The explicit light default is initialized for new organizations,
not substituted as a permissive read fallback.

Story: US28-F36. Source: finance-stewardship.md. Decision basis: D48; D49; ADR-0206.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-1f75139f87f1e840cbe1"></a>

## REQ28-M41 — Receive honest accessible feedback

<!-- BEGIN CONTRACT {"id":"1f75139f87f1e840cbe1","name":"REQ28-M41 — Receive honest accessible feedback"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Use shared Base UI/base-maia/Zinc components and semantic labels/status; actual
  320-CSS-pixel reflow, zoom, long translations, RTL/mixed scripts, IME and touch.
  No toast/color-only success, phantom buttons or new primitive/style system.
- Preserve authorized recoverable inputs/focus; current denial clears protected
  values and fences late responses. Show actual saved/accepted/pending/unknown,
  not optimistic timer success. Do not imply missing records mean no activity.
- Public intake's supported no-JavaScript path stays distinct from P17 protected
  doorway's minimal script requirement; missing proof script never weakens protocol.
- Test real representative complete setup→draft/signup→send/confirm→withdraw/
  stop/recover journeys, not only components; critical audience/status confusion
  blocks activation.

Story: US28-M41. Source: communications.md. Decision basis: D7/D14/D15/D18/D42/D43 complete-journey acceptance and shared Core accessibility/design contract.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-229bb7f336f4a029f95e"></a>

## REQ28-Q24 — Confirmed testing boundary and useful prior art

<!-- BEGIN CONTRACT {"id":"229bb7f336f4a029f95e","name":"REQ28-Q24 — Confirmed testing boundary and useful prior art"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The primary acceptance seam SHALL be the existing Playwright user journey
boundary across the missionary workspace, authorized staff controls and public
reader surfaces. Existing runners and shared UI SHALL be reused. Supporting
proof SHALL use actual database privilege/concurrency boundaries and the
qualified Auth/shared-delivery contracts where a browser cannot establish the
invariant. Focused Vitest tests may exercise exported canonical commands,
queries and component interfaces with controlled boundary fakes for fast
feedback; they SHALL not become a shadow product model or replace required real
proof. Tests SHALL assert independently specified user/domain outcomes rather
than reproduce the implementation, private helper calls or CSS details. No new
test framework is introduced.

Existing prior art includes the Missionary Account Frame browser journey,
session-guard flow, Tasks Page deletion recovery, Partners roster safety and
server redaction, client-session stale-response protection, shared operation
handler, workflow dispatch ledger, email recipient restriction/webhook contracts,
field-policy real-role SQL proof and donation replay transaction proof. Reuse
their appropriate public seams while retaining their limits: demo, mocked,
in-memory and SQL-text checks are not production authorization or concurrency
qualification.

Story: US28-Q24. Source: proof.md. Decision basis: User-confirmed /to-spec testing seams; ratified completeness C18/C20; Core testing/TDD contracts.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-22fe1132a6a42a9ad0cd"></a>

## REQ28-M08 — Finish a pending request after Page hide

<!-- BEGIN CONTRACT {"id":"22fe1132a6a42a9ad0cd","name":"REQ28-M08 — Finish a pending request after Page hide"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Acceptance must precede entry Off in a source serialization order; a loaded
  form, client time or merely started network request does not qualify.
- Bind original tenant/purpose/destination/source independently of mutable Page
  presentation. Slug/cosmetic edits, entry retargeting or unpublishing cannot
  retarget consent. Page disappearance alone does not prove purpose retirement.
- Complete only while exact purpose, proof, recipient, organization signup,
  withdrawal/revocation and original deadline remain valid. Real binding
  retirement/deletion or stronger restriction blocks it.
- Accepted confirmation dispatch may proceed after Page hide under the same
  current authority; organization signup disable fences it. No additional
  pending-after-Off toggle or cancellation queue is introduced.

Story: US28-M08. Source: communications.md. Decision basis: D43 C01–C05/C09; Phase 22/23 Page entry versus native source purpose.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-230004314b39162dbe85"></a>

## REQ28-C02 — Deliberately invite an eligible coach

<!-- BEGIN CONTRACT {"id":"230004314b39162dbe85","name":"REQ28-C02 — Deliberately invite an eligible coach"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

An invitation shall identify the intended recipient and exact organization, canonical missionary/ministry or Ministry Project subject, proposed modules, history and access duration. Organization permission is a ceiling; an invitation shall not automatically disclose every eligible module.

Story: US28-C02. Source: coaching-resources.md. Decision basis: D8 invitation, organization-ceiling and source-scope amendments; qualified protected-action and communication owners.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-243ef23f4a688c7b92a7"></a>

## REQ28-R15 — Preserve the true departure clock

<!-- BEGIN CONTRACT {"id":"243ef23f4a688c7b92a7","name":"REQ28-R15 — Preserve the true departure clock"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

A confirmed relevant source departure binds original human author, Tenant/ministry, participation episode, effective and observed times, durable event identity, and policy effective at that departure instant.

Compute the departure deadline from the authoritative effective departure instant plus the accepted number of 86,400-second days using checked UTC arithmetic. Preserve that accepted deadline across daylight-saving, display-zone and timezone-rule changes unless an independently qualified correction changes it.

Duplicate/out-of-order events do not restart the clock. A late event uses validated effective time/historical policy; missing/conflicting evidence enters restricted owner review rather than guessed deletion.

Exactly one ordinary departure episode controls a preparation at a time; earlier episodes remain history. Later genuine departure schedules only entries admitted to that later work context, not unselected older entries.

Ordinary reads/resume require trusted current time strictly before the still-applicable deadline. Equality is expired even if cleanup lags. Deadline checks occur after waits at acceptance, not only at request/transaction start.

Story: US28-R15. Source: relationships.md. Decision basis: D28 C05/C06/C09/C11; D27 C07/C11.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-27b5c23e5e6e7eed82cf"></a>

## REQ28-Q06 — Controls explain their exact consequences

<!-- BEGIN CONTRACT {"id":"27b5c23e5e6e7eed82cf","name":"REQ28-Q06 — Controls explain their exact consequences"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Every exposed tenant or personal control SHALL retain its adopted default and
declare its owner, permission, scope and consequences for new work, accepted
work, current reads, pending outward effects and reenable. Off SHALL not mean
generic deletion, blanket revocation or replay. Readiness SHALL remain derived
from real owners. Saving, accepted, failed, uncertain and effective states SHALL
be presented accurately; a saved choice awaiting an applicable publication step
is not yet an effective public change. Routine reversible changes SHALL not gain
unnecessary confirmation dialogs. Material consequences SHALL be explained
locally before acceptance using existing configuration surfaces.

Story: US28-Q06. Source: proof.md. Decision basis: Ratified completeness C06/C08/C12/C16; D24/D30/D32/D33/D37/D40 and D42–D45 source-specific controls.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-289007964f616c563b4f"></a>

## REQ28-R29 — Record late and incomplete referrals

<!-- BEGIN CONTRACT {"id":"289007964f616c563b4f","name":"REQ28-R29 — Record late and incomplete referrals"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

A genuinely first window uses the current qualified New policy at deliberate source acceptance A against the original date; record when the policy was actually applied without pretending it governed historically or granting backdated access.

Active work is possible from A inclusive and before E with all current predicates. If E≤A, accepted recording yields Expired atomically without temporary Active or automatic Continue.

Preserve an existing accepted window; missing prior evidence is not proof no window existed. Unknown policy/zone/provenance blocks only dependent calculation/effect and gives a safe owner repair path, while truthful incomplete recording remains possible where admitted.

Historical recipient proof and current D34 projection rights separately determine what history Maya may see. “Recorded” and “active” are distinct outcomes.

Story: US28-R29. Source: relationships.md. Decision basis: D39 C05/C06/C10/C13/C14; D34 C03/C06.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-29fb91922043e8fcabad"></a>

## REQ28-F19 — Keep purpose portions exact and corrections source-owned

<!-- BEGIN CONTRACT {"id":"29fb91922043e8fcabad","name":"REQ28-F19 — Keep purpose portions exact and corrections source-owned"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

A purpose SHALL identify the entire qualified gift scope or an exact supported
positive same-currency portion established by evidence. A purpose amount is not a
financial allocation or second balance. Multiple evidence records or portions
SHALL not duplicate the gift-purpose member. Ambiguous portions, unsupported
precision, cross-currency values and portions exceeding qualified source money
SHALL be rejected or held for source resolution without guessing. Original donor
instruction and its provenance remain distinct from currently surviving monetary
coverage. An ambiguous mixed partial reversal SHALL hold only the affected
reason; Phase 28 SHALL not prorate it itself or copy protected care context.

Story: US28-F19. Source: finance-stewardship.md. Decision basis: D29; D30; D31; ADR-0208.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-2a7b8ee66e8501597e18"></a>

## REQ28-R02 — Save restricted preparation

<!-- BEGIN CONTRACT {"id":"2a7b8ee66e8501597e18","name":"REQ28-R02 — Save restricted preparation"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

A short form accepts the owner-required minimum without forcing a household, country, address, email, ask amount, giving status, next task, stage, coach or invented canonical Party.

Newly supplied identity/contact assertions and planning remain restricted from ordinary relationship staff across all reached surfaces. Independently authorized organizational facts about the same person remain independently available.

Successful reload returns the same accepted preparation and original authorship. A saved preparation is not a verified contact, actual encounter, Request, cultivation enrollment, gift, commitment, newsletter subscription or publication.

Save/recovery observes the common atomicity/current-authority contract. No external provider is needed.

Story: US28-R02. Source: relationships.md. Decision basis: D1 selected decision and C01/C02/C08–C11/C14–C15; D2 C04; D27 C04; completeness C13/C14/C16. **Owner extension:** bounded P9 preparation source for unresolved assertions, with qualified P4/P9 canonical reuse; no second CRM.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-2b2e800c9b5f10aa6b8f"></a>

## REQ28-R28 — Calculate the New calendar window

<!-- BEGIN CONTRACT {"id":"2b2e800c9b5f10aa6b8f","name":"REQ28-R28 — Calculate the New calendar window"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

New uses the configured positive whole calendar-day count N, original date D counted as day one, last included date D+N−1 in the declared organization zone. One day ends that same day; a 30-day October 1 example ends through October 30. These examples are not default durations.

Freeze D/N, zone, calendar interpretation, policy evidence and finite endpoint E at first acceptance. E is the first valid instant at the start of D+N in that zone: first valid instant after missing midnight, earlier repeated midnight occurrence, next existing date if target date is skipped.

Trusted time at/after E is expired regardless of cached flag or worker lag. Preserve E across travel, zone/settings and timezone-rule changes; where nominal last-day wording becomes misleading, show actual stored endpoint with current date/time/offset, declared zone and concise explanation.

A date-only referral can have less than 24 remaining hours; settings help makes calendar versus Continued elapsed-day meaning explicit. Do not add a clock-mode selector or per-item expiry override.

Story: US28-R28. Source: relationships.md. Decision basis: D39 C02–C04/C13; explicit supersession of D38 C02 for New only.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-2b8ef7b2a678327a8391"></a>

## REQ28-R11 — Archive unused preparation

<!-- BEGIN CONTRACT {"id":"2b8ef7b2a678327a8391","name":"REQ28-R11 — Archive unused preparation"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

A single archive action moves the same preparation from Active to Archived under current authority; original authorship and history remain.

An obvious Active/Archived control makes it findable. No reason form, routine repeated confirmation, separate archive application or compulsory cleanup workflow is required.

Archive does not deactivate a Party/donor, change another worker's context, unshare contact facts, revoke permissions, close a partnership, complete/cancel tasks, stop reminders, change money or notify staff.

Where permitted source facts prove related open work, show its existing link and a short explanation; incomplete resolution is not “no open work.” Do not block ordinary archive on an exhaustive all-domain scan.

Story: US28-R11. Source: relationships.md. Decision basis: D4 C01/C02/C05/C06/C13; D3 selected boundary.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-2c293acc1d5e1db88f4b"></a>

## REQ28-R16 — Find eligible earlier preparation

<!-- BEGIN CONTRACT {"id":"2c293acc1d5e1db88f4b","name":"REQ28-R16 — Find eligible earlier preparation"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The optional Earlier preparation view uses current same-organization/ministry/history authority and qualified original-human authorship. Matching email/name, prior membership or restored login alone is insufficient.

Search, counts, summaries, detail and recovery are authorized before disclosure; held-only/expired/erased/purged or another author's preparation is not exposed. A denied query differs safely from a temporary error and from an authorized empty result.

Show original saved/substantive-change dates honestly and use the familiar editor. No mandatory return wizard, per-entry staff approval, reason, bulk restoration or automatic selection.

Initial qualified retrieval uses 25 summary rows per page and a hard request maximum of 100, detail on demand; these are D27/D28's initial service bounds, not a total record cap or measured performance claim.

Story: US28-R16. Source: relationships.md. Decision basis: D27 C01–C06/C13–C15; D28 C15; glossary Preparation resumption.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-2c99a853240880bb3d0f"></a>

## REQ28-F39 — Retain recurring origin and independent gift attribution

<!-- BEGIN CONTRACT {"id":"2c99a853240880bb3d0f","name":"REQ28-F39 — Retain recurring origin and independent gift attribution"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

A source-generated recurring installment SHALL inherit the applicable accepted
line, term and occurrence campaign association, including known none. Changing a
tracking-code map, amount, schedule, payment method, provider or pause/resume
SHALL not silently adopt a new campaign. A deliberate Phase 16 prospective
attribution amendment MAY affect explicitly identified future eligible occurrences
and SHALL preview the first affected occurrence; accepted/in-flight occurrences
retain their frozen lineage. Historical money changes only by the applicable
Phase 13 correction. An independently recorded gift later matched toward a
commitment SHALL retain its own accepted campaign; matching changes coverage,
not money origin. Cancel and fresh Restart giving use fresh authorization;
pause/resume remains continuation.

Story: US28-F39. Source: finance-stewardship.md. Decision basis: D50; E7 reconciliation; P16 term/occurrence/fulfillment.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-324c55c4e3b2ad6376b4"></a>

## REQ28-Q21 — Qualified rollout and safe containment

<!-- BEGIN CONTRACT {"id":"324c55c4e3b2ad6376b4","name":"REQ28-Q21 — Qualified rollout and safe containment"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Activation SHALL identify the exact release, environment, cohort, owner,
configuration and passed evidence. Readers, commands, source fences and required
recovery SHALL be compatible before exposure. Containment and rollback SHALL
stop affected unsafe admission/execution without erasing lawful accepted work,
restoring retired unsafe writers or replaying historical outward effects.
Rollback after new writes SHALL preserve newer authority and completion fences;
when that cannot be guaranteed, retain safe containment and use a qualified
forward repair. Staff/readers SHALL receive the truthful permitted outcome.

Story: US28-Q21. Source: proof.md. Decision basis: Ratified completeness C06/C08/C15/C16/C19/C20; existing activation and deployment owners.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-33ba980dbe621a31986b"></a>

## REQ28-F10 — Separate goal editing, disclosure and public publication

<!-- BEGIN CONTRACT {"id":"33ba980dbe621a31986b","name":"REQ28-F10 — Separate goal editing, disclosure and public publication"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Internal goal Save SHALL NOT publish a Page, alter a released public goal version,
share a coach view, create a task, send a notification or change finance. Public
adoption SHALL use the existing authorized publication/release boundary and exact
safe version. Field Account balances, assessments, reserves, availability and
compensation SHALL NOT become public support progress by resemblance or linkage.
Unavailable private data SHALL be safely suppressed rather than replaced by zero.

Story: US28-F10. Source: finance-stewardship.md. Decision basis: D16 C17–C20; P21; P22 D6/D13.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-35d3600157ffe1a4cd7c"></a>

## REQ28-F42 — Commit durable effects and recover without duplicate business work

<!-- BEGIN CONTRACT {"id":"35d3600157ffe1a4cd7c","name":"REQ28-F42 — Commit durable effects and recover without duplicate business work"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Each authoritative owner SHALL atomically accept its business effect, required
history/semantic receipt and required durable identifier-only consumer intent.
Cross-owner delivery MAY be asynchronous through existing dispatch/reconciliation;
no distributed transaction or best-effort-only event is presumed. Financial
posting SHALL not await recognition or task projection. Admission and disposition
SHALL re-prove relevant source dependencies and current authority after waits
under the owning invalidation fences. Same business purpose SHALL remain
deduplicated across transport keys, workflows, retries and aliases. Reads of old
receipts SHALL use current disclosure. Required minimal dedupe evidence SHALL
survive lawful PII redaction without restoring private payloads.

Story: US28-F42. Source: finance-stewardship.md. Decision basis: D16; D19–D22; D29–D33; D40; D48–D50.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-3640789c392759204f1f"></a>

## REQ28-Q08 — Authorization precedes every disclosure

<!-- BEGIN CONTRACT {"id":"3640789c392759204f1f","name":"REQ28-Q08 — Authorization precedes every disclosure"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Authorization and field classification SHALL be applied before enumeration,
joins, sorting, ranking, search, counts, facets, paging, export and serialization.
Task titles, notifications, logs, files, generated documents, cached values and
invalidation payloads SHALL retain the same current source audience. Cache keys
and cursors SHALL bind exact admitted scope and relevant source/authorization
revision. Neither a complete count nor the existence of a hidden record may be
revealed by an otherwise forbidden projection. Source-approved anonymity SHALL
be established positively; absence from a separate capped roster SHALL not
permit identity disclosure. Private stale data SHALL not be a fallback during
an outage.

Story: US28-Q08. Source: proof.md. Decision basis: Ratified completeness C09/C14; P3/P10/P12 projections; D24–D26 coaching/shared-context limits.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-38d243ed5e8565dbb3f0"></a>

## REQ28-M38 — Reserve usage before model dispatch

<!-- BEGIN CONTRACT {"id":"38d243ed5e8565dbb3f0","name":"REQ28-M38 — Reserve usage before model dispatch"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Before external dispatch, atomically claim unique invocation and reserve a
  certified maximum estimate against every applicable tenant/account/purpose
  envelope. Use fixed-precision sub-cent units with explicit currency, correct
  price units and nonnegative/overflow constraints; no network call inside lock.
- Include all billable categories, including hidden reasoning where applicable.
  Unknown price/unbounded exposure blocks dispatch. Settle proved usage exactly
  once; timeout, lease expiry or period rollover cannot release possibly billed
  exposure. This is operating usage, not a Field Account posting.
- At most one locally active/applicable generation per tenant/actor/purpose.
  An unknown old invocation may free that UI slot while retaining exposure and
  outstanding-work capacity; new request still meets all certified ceilings.
- Bound rates/concurrency per tenant/user/provider with fair scheduling; manual
  writing never waits for AI, and no polling creates implicit billed retries.

Story: US28-M38. Source: communications.md. Decision basis: D18 C10/C11/C13/C19; shared AI conservative reservation/settlement and bounded work.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-38e3a081ab02deea31d1"></a>

## REQ28-M19 — Keep recipient choices and Update notifications distinct

<!-- BEGIN CONTRACT {"id":"38e3a081ab02deea31d1","name":"REQ28-M19 — Keep recipient choices and Update notifications distinct"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Preserve Email/Physical/Both/None and exact topic/contact/suppression meaning;
  gift, referral, stage, tag, new email or household membership never subscribes.
- Newsletter membership, Show in my Updates, post-email notice, Page visibility
  and protected-reader authority remain separate. No automatic recipient cadence.
- When eligible selected Update has known post-notice overlap, review explains
  that newsletter is additional and permits content correction. Do not silently
  suppress an independently authorized purpose or invent known earlier delivery.
- Preference changes do not rewrite frozen historical authorization, but current
  narrowing applies to unsubmitted applicable copies. No generic already-emailed
  flag becomes an independent consent or dedupe authority.

Story: US28-M19. Source: communications.md. Decision basis: D7 C17; D6/D42/D43 membership controls; Phase 25 distinct Update and notification preferences.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-3d5747f29aff9ee4f244"></a>

## REQ28-F11 — Admit first-support work from complete subject history

<!-- BEGIN CONTRACT {"id":"3d5747f29aff9ee4f244","name":"REQ28-F11 — Admit first-support work from complete subject history"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The native first-support purpose SHALL require positive qualified monetary
support for the exact typed ministry/project subject, complete owner-certified
recorded history and coherent financial, recognition, attribution and canonical
identity revisions. It SHALL not claim first-ever support or a new donor to the
organization. Pledges, attempts, unsupported pending payment, valuations and
nonpositive corrections are not received support. Subject identity survives
worker succession, names, multiple designations, Page changes, years and currency
changes. Genuine prior support through a qualified recognition path remains
history even where that path never allowed contact.

Story: US28-F11. Source: finance-stewardship.md. Decision basis: D19 C01–C10.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-3fde482849868da3ffb8"></a>

## REQ28-M12 — Keep signup private and separate from CRM

<!-- BEGIN CONTRACT {"id":"3fde482849868da3ffb8","name":"REQ28-M12 — Keep signup private and separate from CRM"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Both proof paths converge on one source authority; provider contacts, imports,
  P25 requests and a negative-only suppression helper never create membership.
- No Party/donor/household/prospect/cultivation/follower/protected-reader/finance
  grant or canonical-contact overwrite follows from Email/Name or confirmation.
- Enforce non-null trusted tenant/purpose/destination identity and tenant-aware
  relationships. Optional account linkage has explicit null/delete behavior and
  is not the membership identity; account deletion does not cascade away required
  history or imply withdrawal of all independent memberships. Use source-owned
  supported email comparison, without invented plus/dot equivalence or a global
  person-by-email key. Consent evidence binds destination/revision, instruction,
  qualified proof reference, policy/disclosure revision and trusted acceptance.
- Browser roles cannot directly mutate positive admission, proof or evidence.
  Every privileged path preserves immutable tenant/actor/purpose, valid states
  and current source rules; no public proof table, subscriber feed or raw
  constraint response reveals private membership.
- Public Page HTML/RSC/CDN remains audience-invariant. Exact email, membership,
  receipts and controls are private request data, excluded from public cache,
  URLs, metadata and analytics; signout/context/host switch fences late responses.
- Address-specific status/manage/recovery requires current same-address proof or
  an exact qualified source capability. A guest receipt exposes only its own
  permitted operation; an authenticated but unqualified address is not history
  access. Error/timing/constraints do not enumerate hidden states.
- Apply bounded abuse controls without indefinite address reservation, mandatory
  inaccessible challenge or unsupported global person-by-email uniqueness.

Story: US28-M12. Source: communications.md. Decision basis: D42 C04–C06/C12/C13/C17/C20; D6 separate native membership; Phase 3/4/9/10/12 isolation.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-4164ab22b5ece33c10b1"></a>

## REQ28-M13 — Prepare and recover a real issue

<!-- BEGIN CONTRACT {"id":"4164ab22b5ece33c10b1","name":"REQ28-M13 — Prepare and recover a real issue"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Provide source-backed drafts/version recovery, subject/preheader, useful
  approved layouts, structured prose, safe personalization/media and clear saved
  state. Save/restoration preserves content, subject and every admitted media,
  owner-qualified attachment and metadata item atomically with source evidence;
  it uses expected revisions;
  concurrent edits yield recovery rather than silent overwrite.
- Memory/browser-local content is not Saved. No fixed-key unscoped localStorage
  becomes the source. Revocation/context change clears protected client state
  and prevents a late response restoring it.
- Reading/editing, content approval and exact-issue Send are separate capabilities.
  Existing organization content review is honored; approval alone cannot send.
- Keep a dated Epistle job ledger of required/implemented/proved support. D7 is
  complete newsletter scope, with automatic future digests an explicit difference.

Story: US28-M13. Source: communications.md. Decision basis: D7 C01–C04/C16; Phase 17 authored-content extension and Phase 22/23 existing review roles.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-4183c698a358ae7ca494"></a>

## REQ28-M18 — Understand partial sends and cancellation

<!-- BEGIN CONTRACT {"id":"4183c698a358ae7ca494","name":"REQ28-M18 — Understand partial sends and cancellation"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Show scheduled, sending, provider-accepted, delivered, failed, excluded,
  cancelled and unresolved only when supported by evidence. Preserve per-member
  independent outcomes and exact issue totals; no whole-issue Canceled over
  already admitted/unknown recipients.
- Stop all and only provably stoppable work. Preparation/queue lease is not
  submission; once the external attempt may have begun, preserve uncertainty.
- Same-effect Resend retry uses the exact frozen endpoint/bytes/order/header/
  account/key under current bounded P17 guarantees. Never re-render “equivalent”
  content, split an uncertain envelope or retry accepted members.
- No fresh attempt/key after unknown expiry; definite rejection requires exact
  provider/source proof. Signed duplicate/out-of-order/conflicting evidence
  reconciles monotonically or quarantines; it cannot fabricate a reply/read.

Story: US28-M18. Source: communications.md. Decision basis: D7 C12/C13; Phase 6/17 sealed submission, cancellation and monotonic outcome rules.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-41a7a58bb8c7f706852f"></a>

## REQ28-Q02 — Exact organization and ministry context

<!-- BEGIN CONTRACT {"id":"41a7a58bb8c7f706852f","name":"REQ28-Q02 — Exact organization and ministry context"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Entry SHALL resolve zero, one or multiple currently permitted ministry contexts.
One eligible context SHALL open without repeated selection; multiple contexts
SHALL provide a searchable permitted choice; zero contexts SHALL provide an
honest access/setup state. A failed context read SHALL not masquerade as zero.
The effective organization and subject SHALL be visible where an action's
consequence depends on them. Saved selection, financial recognition, an email
address, a guessed identifier or another acting role SHALL not grant access.
Deep links and back navigation SHALL resolve current authority before revealing
private titles, counts or details.

Story: US28-Q02. Source: proof.md. Decision basis: Ratified completeness C02/C13/C14; P3/P12 authorization; P27 assignment ownership.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-469071ec3309e06a382b"></a>

## REQ28-F41 — Enforce source contracts and tenant-safe resulting states

<!-- BEGIN CONTRACT {"id":"469071ec3309e06a382b","name":"REQ28-F41 — Enforce source contracts and tenant-safe resulting states"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Owner contracts SHALL define required identity, Tenant, Legal Entity where
applicable, typed subject, Party, currency/unit, source fact kind, accepted
revision, provenance, live/history cohort, current validity and lawful correction
lineage. Mandatory relationships SHALL be nonnull at their proper owner boundary;
restricted incomplete intake is not a nullable financial root. Same-tenant
relationships and semantic uniqueness SHALL be enforced structurally where
possible. Actor, recorder, tenant and audit attribution SHALL derive from trusted
current context; a selected subject/holder/approver SHALL be independently
validated. Required immutable finance, assertions and history SHALL not be
destroyed by relationship cascades. Exact currency validation precedes coercion.

Coarse tenant RLS SHALL backstop fine-grained Phase 12 purpose/field authority.
Qualification SHALL inspect grants, effective old-row and new-row policy
behavior, SELECT requirements, views, RPC/function ownership, privileged service
paths, imports, repair and export. Omitted explicit WITH CHECK alone is not proof
of a defect where applicable PostgreSQL policy inheritance supplies the check;
tests SHALL prove actual forbidden resulting states are impossible. Legacy
role-based routes, public projections and direct browser mutation paths SHALL be
converged or fenced before affected activation.

Story: US28-F41. Source: finance-stewardship.md. Decision basis: D16; D19–D22; D29–D33; D40; D48–D50; P12; ADR-0206/0208.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-48993c36191470541f08"></a>

## REQ28-F34 — Control new missed-gift notices without hiding truth

<!-- BEGIN CONTRACT {"id":"48993c36191470541f08","name":"REQ28-F34 — Control new missed-gift notices without hiding truth"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

One organization-wide **New missed-gift notices** control SHALL govern the
optional missionary in-product notification-plan slot. It starts On at qualified
Live activation and preserves an explicit Off choice. Off SHALL stop new notices,
including accepted but unpublished queued candidates, at the actual publication
boundary without rewriting sealed plans. Existing published history retains its
ordinary lifecycle. On SHALL not replay suppressed or historical notices. The
control SHALL not erase payment facts, next schedule, tasks, consent or donor
communications. No per-missionary threshold, retry calendar or channel matrix is
added; notification preference is never authority to inspect a source.

Story: US28-F34. Source: finance-stewardship.md. Decision basis: D40; P17/P6 notification ownership.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-4c2fdabae8fc909eb143"></a>

## REQ28-C38 — Find useful organization resources

<!-- BEGIN CONTRACT {"id":"4c2fdabae8fc909eb143","name":"REQ28-C38 — Find useful organization resources"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Resources from the organization shall provide text-first browsing with practical descriptions and honest format, language and known file-size information. Categories organize content; they do not grant access. The P28 owner adopts the complete [Phase29 resource contracts](../phase-29-files-documents/organization-and-review-tools.md#req29-c80--read-resources-with-honest-advisory-review-status), REQ29-C80–C86 and C95–C115, with their shared proof requirements. These add advisory review planning, actual review/correction, private problem reporting and handling, independently qualified staff readership/shared publications, and optional personal Save for later; they are source-owned extensions, not a competing library.

Story: US28-C38. Source: coaching-resources.md. Decision basis: Selected D12 organization-managed resource library; D37 resource reuse; Phase29 Q55/Q57–Q59 ratified review, reporting, staff-reader and personal-return amendments.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-4c7bdd73a0c7ac9e821d"></a>

## REQ28-M35 — Request one of six precise edits

<!-- BEGIN CONTRACT {"id":"4c7bdd73a0c7ac9e821d","name":"REQ28-M35 — Request one of six precise edits"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

The six permitted action labels are **Fix spelling & grammar**, **Rephrase**, **Simplify**, **Shorten**, **Lengthen**, and **Make more compelling**. No additional action or general prompt box is admitted by this profile.

- Save exact visible selection before invocation; pending/failed/conflicted save
  never sends an older version. No selection prompts selection, not whole-issue
  submission. Bind semantic range/identity/digest and saved revision server-side.
- Only disclosed eligible selected prose and necessary code-owned instructions
  leave Asym. No recipients/resolved merge fields, donor/finance/care/private
  prospect records, attachments, mailbox, previous issues, retrieval or learned
  writing-history profile.
- Preserve language, perspective, certainty, names/quotes/Scripture/cultural
  meaning. Lengthen develops supplied ideas or gives no-change guidance; compelling
  improves expression without inventing ask, urgency, impact or promises.
- Certify each enabled action × language × model/prompt profile with independently
  reviewed representative and adversarial ministry prose. Include facts,
  negation/qualifiers, author voice, religious/cultural meaning, Scripture/quotes,
  amounts/currencies/periods, anonymized places and malicious instructions.
  Report every case, failure and review method. Any critical fabricated claim,
  prohibited egress, protected-node mutation or unauthorized effect in that
  release suite blocks activation; similarity, number/name scans or acceptance
  rates do not prove meaning or voice. Provider/model/prompt/editor changes
  require affected-profile requalification.
- Authored prose is source-classified; draft storage alone is not ineligibility.
  Pasted/selected text cannot declassify known prohibited provenance. No claim
  that keyword/PII detector certifies arbitrary free text harmless.

Story: US28-M35. Source: communications.md. Decision basis: D18 C03–C05; exact six-action and selected-prose disclosure contract.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-4cb8097b3eee8cc544c2"></a>

## REQ28-R04 — Understand preparation audience

<!-- BEGIN CONTRACT {"id":"4cb8097b3eee8cc544c2","name":"REQ28-R04 — Understand preparation audience"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Explain the organization and restricted initial audience before Save; keep preparation working state, contact availability to staff and private-note audience distinct.

Protect newly supplied facts through search, task labels, timelines, exports, notifications, AI, audit content, accessibility text and caches as well as the detail page. D1 itself admits none of those optional external consumers.

Saving/contact storage grants no permission to contact. Each later send resolves its own current recipient/purpose/restriction evidence.

Story: US28-R04. Source: relationships.md. Decision basis: D1 C01/C06/C07/C11/C14; D2 C04; completeness C14; ADR-0209.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-4da30d6d2dcced99b4c6"></a>

## REQ28-F33 — Keep missed recurring gifts informational

<!-- BEGIN CONTRACT {"id":"4da30d6d2dcced99b4c6","name":"REQ28-F33 — Keep missed recurring gifts informational"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

When Phase 16 confirms that a scheduled automatic gift was not received after its
qualified recovery ended and confirms regular giving remains scheduled, the
permitted support view SHALL show those separate facts and the current next
scheduled gift. This condition alone SHALL create no automatic missionary review,
outreach task or donor message. Maya MAY deliberately add ordinary authorized
follow-up. Generic action-required status, missed-count thresholds or missing
observations SHALL not manufacture a missionary obligation. Provider/payment
repair, manual-expectation review, stale-source incidents and independently
established source duties retain their existing exact owners.

Story: US28-F33. Source: finance-stewardship.md. Decision basis: D40; completeness C05; P16.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-4e62a2da97c1fc5b849b"></a>

## REQ28-R06 — Optionally notify selected staff

<!-- BEGIN CONTRACT {"id":"4e62a2da97c1fc5b849b","name":"REQ28-R06 — Optionally notify selected staff"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The optional staff selection starts empty. Empty creates no notice; valid selected same-Tenant recipients receive one source-qualified informational in-product notice each. Duplicate selections normalize; invalid selections never fall back to all staff.

Selection does not define who may access the shared contact, assign responsibility or create a task. The action contacts no prospect and sends no email, SMS or push.

Sharing acceptance and notice requested/available/failed/unknown outcomes are distinct. A post-share notice failure repairs only the original notice, never repeats sharing or creates another contact.

Source/recipient eligibility is checked before notice availability, counts, display and opening. Replay may narrow recipients, never add substitutes. Read/open status is not follow-up completion.

Story: US28-R06. Source: relationships.md. Decision basis: D2 C07–C13/C18; P9 source event, P6 recipient/communication truth, P17 Information presentation. Exact source-purpose contract is a required enabler.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-507f22f7adadca4da585"></a>

## REQ28-M39 — Recover model failure without duplicate cost or stale edits

<!-- BEGIN CONTRACT {"id":"507f22f7adadca4da585","name":"REQ28-M39 — Recover model failure without duplicate cost or stale edits"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Distinguish admitted/not-dispatched/dispatched-unknown/completed usable,
  no-change/rejected/definitively failed and cancelled applicability.
- Proven pre-dispatch failure or authoritative billing evidence may release the
  corresponding exposure. Otherwise reconcile only through qualified provider
  guarantees; no blind replay/fallback. Deliberate Try another is new generation
  with new identity/current source/budget, not a retry of unknown billing.
- Cancel removes candidate applicability, not a promise remote work/billing
  stopped. Late old results never replace current candidate/draft.
- Apply timeout recovers original source receipt. No content/provider score is
  labeled verified or ready to send.

Story: US28-M39. Source: communications.md. Decision basis: D18 C12; provider uncertainty, applicability cancellation and source receipt recovery.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-50fdb7e469aee01863c8"></a>

## REQ28-M22 — Schedule a native Appointment without a provider

<!-- BEGIN CONTRACT {"id":"50fdb7e469aee01863c8","name":"REQ28-M22 — Schedule a native Appointment without a provider"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Add the bounded P9 Appointment source with expected revision, one-off timed
  start/end (end later), resolved instants, named source zone and local scheduling
  meaning; keep separate actual outcomes. Do not derive arbitrary times from a
  date-only task or attendance from elapsed time/task completion/provider RSVP.
- Resolve nonexistent/ambiguous local time explicitly. Viewer zone changes only
  display; source-zone edits review local time and instant. Future timezone-rule
  change goes through source revision, not adapter rewrite.
- Initial profile excludes all-day/recurrence until exact civil-date/series/
  exception semantics qualify. Use current task/interaction links without a
  second Tasks engine or automatic P27 exchange.

Story: US28-M22. Source: communications.md. Decision basis: D14 C02/C09; bounded Phase 9 Appointment source and Phase 27 outcome meaning.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-54db15b5ba18b2827df5"></a>

## REQ28-R31 — Read minimal expired-referral history

<!-- BEGIN CONTRACT {"id":"54db15b5ba18b2827df5","name":"REQ28-R31 — Read minimal expired-referral history"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Active remains initial view; an optional Expired filter exists only when current organization/source/history authority admits it. It is not a separate archive, inbox, review requirement or personal feature toggle.

Prove that this exact referral previously belonged to Maya's authorized work before ordinary expiry, including an eligible prior handoff recipient. Creation-time exclusivity is not required; new assignment, same email or Party merge is not historic proof.

Closed projection contains only approved recognizable name/safe alias, necessary source reference, Expired meaning and permitted known dates/precision. No email/phone/address/portrait/location/referrer/private context/notes/giving/history, nor fallback to hidden initials or raw IDs. Omit a row with no useful safe identification from results and counts.

Explain once that its follow-up window ended and contact details are not shown here. Expired never means donor refusal, Never Ask, lost support or low value. No broad contact-card link follows from this history purpose.

Story: US28-R31. Source: relationships.md. Decision basis: D34 C01–C06/C11/C15/C16; narrow active-relationship-only projection exception C02; ADR-0209.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-559071938489f9cd7892"></a>

## REQ28-R08 — Configure missionary contact correction

<!-- BEGIN CONTRACT {"id":"559071938489f9cd7892","name":"REQ28-R08 — Configure missionary contact correction"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

One focused entry in existing permissions exposes exact missionary-purpose action/scope and qualified field controls; show effective versus draft/pending results and inherited restrictions.

Policy administration and editing contacts are distinct capabilities. Saving a policy grants no private content access, broad CRM rights, staff promotion or per-contact collaborator power.

Preserve valid existing permissions. Missing/unknown authority denies the affected action; no universal all-tenants-On or all-tenants-Off preset is inferred. Removing one grant does not falsely claim that all independently valid paths disappeared.

Actual projection-policy widening follows ADR-0211 distinct-human approval/current-base apply. Ordinary already-authorized contact-value Save has no new approval queue.

Story: US28-R08. Source: relationships.md. Decision basis: D5 C01–C04/C11/C15; D41 C04; P12; ADR-0209/0211; active roster-safety contract.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-5aac7913216253756ea4"></a>

## REQ28-R23 — Track truthful row outcomes

<!-- BEGIN CONTRACT {"id":"5aac7913216253756ea4","name":"REQ28-R23 — Track truthful row outcomes"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Each selected business candidate has exactly one current outcome: pending, accepted, previously-imported, skipped, needs-review, failed or not-processed; these counts sum to selected candidate total. Excluded rows/columns are separate. Counts describe rows, never automatically unique people.

Accepted distinguishes new preparation from reused authorized reference; not-processed identifies cancellation, expiry or authorization stop. Preserve outcome history and never label partial success all-failed.

Row or necessary owner-defined dependency-group acceptance atomically checks current scope/revision/cancellation/expiry/worker fence and persists effect, provenance, required restriction receipt and result/audit. No whole-file transaction is promised.

Reclaimed workers cannot commit with an old lease generation or skip unprocessed work. Recover from source effect receipts, not cursor position alone; reopen only retained/eligible input under current authority.

Story: US28-R23. Source: relationships.md. Decision basis: D17 C11/C16/C18/C19; P30 bounded recoverable processing.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-5e22bcbc974d9789bf5a"></a>

## REQ28-M25 — Recover uncertain calendar effects

<!-- BEGIN CONTRACT {"id":"5e22bcbc974d9789bf5a","name":"REQ28-M25 — Recover uncertain calendar effects"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Reconcile only exact linked source/copy/operation via qualified provider
  correlation. Missing response is unknown, not failed. No title/email match,
  new-key create, changed destination or expired dedupe window proves absence.
- Dedicated-calendar setup has its own durable correlation/unknown recovery;
  an uncertain setup cannot create another calendar blindly.
- Bound safe retry/backoff/Retry-After and attention. Unsupported reconciliation
  stays unknown; no exactly-once guarantee or useless retry control.
- Clearly labeled manual handoff uses the same admitted projection and makes a
  separate non-updating copy; it is not a harmless retry while create is unresolved.

Story: US28-M25. Source: communications.md. Decision basis: D14 C08/C12/C13; Phase 31 correlation, finite recovery and provider qualification.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-5f314c5112eb19088b2d"></a>

## REQ28-Q26 — Measured capacity and complete bounded reads

<!-- BEGIN CONTRACT {"id":"5f314c5112eb19088b2d","name":"REQ28-Q26 — Measured capacity and complete bounded reads"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Before activation, source owners SHALL declare and meet production-shaped
volume, concurrency, completion/recovery and latency budgets for the intended
cohort. Evidence SHALL name dataset shape, tenant distribution, actual query
plans, pagination, error/latency distributions and limiting conditions.
Authorization predicates and source-appropriate compound indexes SHALL support
bounded reads and cleanup without global tenant contention. Each actual cap,
page size and supported bound SHALL be tested below, at and above the boundary;
truncation SHALL not change authoritative totals or completeness claims.
No unmeasured throughput claim, new generic performance platform or invented
numeric SLO is adopted here.

Story: US28-Q26. Source: proof.md. Decision basis: Ratified completeness C09/C14/C18; existing source budgets and measured-performance owners.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-6031207437774b5466f0"></a>

## REQ28-F27 — Let tenants combine compatible gift and fulfillment work

<!-- BEGIN CONTRACT {"id":"6031207437774b5466f0","name":"REQ28-F27 — Let tenants combine compatible gift and fulfillment work"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

One organization-wide setting SHALL offer **Combine compatible follow-ups** or
**Keep separate**. New qualified activations initially combine; an existing
separate deployment SHALL preserve that behavior until staff deliberately choose
otherwise. Unknown or invalid policy safely keeps separate. Separation disables
composition, not either required purpose. No missionary/project exception matrix
is introduced. Combination SHALL be limited to compatible special-gift work and
whole fixed-commitment fulfillment causally linked to the completing gift, with
the same Tenant, Legal Entity, exact subject, Party, current responsibility,
disclosure and Independent follow-up authority. First support, receipts, care,
financial exceptions and unrelated promises SHALL not be swept into this rule.

Story: US28-F27. Source: finance-stewardship.md. Decision basis: D32, organization-wide choice ratified.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-6141d6e1c25a87b61eb6"></a>

## REQ28-Q16 — Participation, retention and privacy across return

<!-- BEGIN CONTRACT {"id":"6141d6e1c25a87b61eb6","name":"REQ28-Q16 — Participation, retention and privacy across return"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Ending or suspending exact participation SHALL apply the source's current-read,
retained-duty, pending-effect and retention rules without a generic transfer or
delete operation. Staff or a successor SHALL not acquire private preparation
through reassignment, previews, exports or support tools. No eligible assignee
SHALL produce the source-owned owned exception instead of a guessed broad
fallback. Deliberate eligible resumption SHALL affect only selected preparation
and its adopted current-work/departure rule; it SHALL not restore old coaching
shares, subscriptions, sends or unrelated deadlines. Retention/disposition
SHALL cover actual controlled derivatives and restore handling under their
owners without treating access expiry as automatic destruction of lawful history.

Story: US28-Q16. Source: proof.md. Decision basis: Ratified completeness C06/C12/C14/C15; D27/D28; exact coaching, newsletter and duty owners.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-6462151abba0a1817988"></a>

## REQ28-M23 — Deliberately add one minimal calendar copy

<!-- BEGIN CONTRACT {"id":"6462151abba0a1817988","name":"REQ28-M23 — Deliberately add one minimal calendar copy"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Connect adds nothing. Explicit Add requires current Asym/source/provider
  authority and review of exact account/destination and copied projection.
- Copy only generic appointment label, qualified timing, opaque authenticated
  Asym link and unavoidable protocol metadata. No names/contact/private notes,
  precise location, meeting secrets, finance/care, attachments or attendees.
- Explain calendar sharing/admin/device-notification exposure; Private label or
  OAuth consent does not certify disclosure. Link possession grants no access.
- At most one active or unresolved copy per source appointment/principal/context;
  unique mapped provider event in its exact destination. One stable business
  identity outlives credentials/HTTP requests/worker leases.

Story: US28-M23. Source: communications.md. Decision basis: D14 C01/C03–C06; Phase 31 connection/adapter and Phase 28 minimal copy projection.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-65f6c1bd05bd22a7b6bd"></a>

## REQ28-R42 — Connect ordinary work without inventing facts

<!-- BEGIN CONTRACT {"id":"65f6c1bd05bd22a7b6bd","name":"REQ28-R42 — Connect ordinary work without inventing facts"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Within current permissions, preparation/referral can open existing native contact, appointment, task, interaction and P27 Request destinations with safe context reuse. A navigational action creates none of their facts automatically.

Task completion is distinct from recorded encounter, Request response, commitment, gift and send. Restricted preparation acquires no managed-work obligation just because it appears near the queue; managed P27 work retains its next-task-or-owned-exception rule.

Supported negative outcomes, inaccessible contacts, unknown source facts, no coach, optional modules Off and nonfinancial support remain usable ordinary paths. Do not fabricate a gift, send, contact consent or interaction to advance.

Where a composite UI performs separate source actions, show accepted/failed components honestly unless the actual owner contract provides atomicity. One accepted part is never repeated merely to repair another.

Story: US28-R42. Source: relationships.md. Decision basis: completeness C01–C03/C06/C08/C12/C16; D1 C10; D4 C05; D34–D39 no-implied-effects; P9/P27/ADR-0183. Detailed task/appointment/Request specifications remain their owning volume.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-6734d374d7e297b27c86"></a>

## REQ28-M42 — Operate and upgrade without replay or disclosure

<!-- BEGIN CONTRACT {"id":"6734d374d7e297b27c86","name":"REQ28-M42 — Operate and upgrade without replay or disclosure"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Inventory actual legacy flags, requests, contacts, templates/drafts, queues,
  old writers, provider mappings and Auth proof provenance. Do not infer consent,
  freshness, verification or send outcomes from historical labels.
- Add compatible owner schemas/constraints/commands before UI; fence legacy
  writers. Old workers reject unsupported profiles, new callers fail closed on
  missing schema/contract. Enable exact qualified tenant/provider/purpose only.
- Kill/rollback narrows new affected work while preserving withdrawals, accepted
  effect identities, unknown outcomes, lawful evidence and eligible manual work.
  Restore enters dispatch/protected-read quarantine until post-snapshot authority,
  expiry/withdrawal/attempt evidence is reconciled. Missing facts stay Recovery
  unknown and cannot authorize fresh creates/sends.
- Logs/audit/metrics use safe identifiers/hashes, bounded source-specific causes
  and owner actions, not raw prose/addresses/tokens. No routine SQL consent edits,
  cross-account replay or broad private-history access for diagnosis.

Story: US28-M42. Source: communications.md. Decision basis: D7 C20–C22; D14 C12–C16; D15 C18–C20; D18 C21–C24; D42 C21–C24; D43 C09–C15 and their adopted operating registers.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-67b35d617ae6f3e91913"></a>

## REQ28-Q23 — Durable history and actionable operations

<!-- BEGIN CONTRACT {"id":"67b35d617ae6f3e91913","name":"REQ28-Q23 — Durable history and actionable operations"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Business history SHALL identify the durable source effect, exact context,
responsible actor and relevant policy/version without unnecessary private body
content. It SHALL remain distinct from security audit, technical traces and
provider outcomes. Operators SHALL locate an accepted-but-unpresented effect
and recover through its qualified owner command instead of direct database
repair, deleting evidence to deduplicate, or blind resend. Required monitoring
SHALL retain the signal, threshold, accountable role and response below; release
ownership SHALL bind those roles to an actual operating roster. Known policy,
privacy and correctness failures are launch blockers rather than monitor-only
risks.

These shared signals SHALL supplement, not replace or relax, adopted
source-specific monitors; the stricter applicable trigger SHALL govern.

| Signal                                                                     | Threshold                                             | Accountable owner                                       | Required response                                                                                                   |
| -------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Cross-context disclosure or effect after required denial                   | One confirmed occurrence                              | P12 security operator and affected source owner         | Contain the path, preserve minimal evidence, correct and requalify before reopening.                                |
| Duplicate accepted intent or falsely reported saved/delivered result       | One confirmed occurrence                              | Owning command/dispatch operator                        | Stop the affected mutation/retry path, reconcile original effects and repair presentation without erasing evidence. |
| Money/unit/period/coverage mismatch or anonymous identity exposure         | One confirmed occurrence                              | Financial projection owner; P12 for identity            | Withhold the affected projection, correct source/consumer and qualify boundary cases before return.                 |
| Accepted operation exceeds its declared completion/recovery bound          | One operation beyond that qualified bound             | Exact source operations owner                           | Investigate and reconcile by original identity; an unset bound blocks activation.                                   |
| Critical journey confusion, accessibility blocker or repeated-entry defect | One reproducible blocking case in a supported journey | P28 product/design owner and implementing surface owner | Correct and retest the whole job; halt affected rollout if safe completion is blocked.                              |

Story: US28-Q23. Source: proof.md. Decision basis: Ratified completeness C08/C19 and its adopted monitoring table; P6 delivery history; security/privacy owners.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-682ff0ff3404aff22963"></a>

## REQ28-Q27 — Representative whole-journey and traceable release proof

<!-- BEGIN CONTRACT {"id":"682ff0ff3404aff22963","name":"REQ28-Q27 — Representative whole-journey and traceable release proof"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Before release, the product/design owner SHALL recruit representative missionary,
tenant-staff, donor/reader and coach participants for the applicable complete
jobs, including new/experienced, mobile/assistive and restricted-access cases.
Evidence SHALL record environment, configuration, attempts, outcomes, errors,
comprehension and repair steps. Any critical wrong-recipient, false-success,
privacy or money misunderstanding SHALL block the affected release. Vendor
research, synthetic models and automated accessibility checks alone SHALL not
be called a successful pilot. Every required journey SHALL trace decision and
glossary through owner ADR/OpenSpec, design, tasks, authorized issue, implementation
and executed release evidence. Selected, adopted, formally reconciled,
implemented, qualified and activated states SHALL remain distinct. Unperformed
steps and unresolved exact owner gates remain explicit without adding unrelated
features to claim completeness.

Story: US28-Q27. Source: proof.md. Decision basis: Ratified completeness C01–C03/C07/C18/C20; confirmed test seams; document-authority status vocabulary.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-68b9a37313e510684238"></a>

## REQ28-M34 — Choose whether to use writing help

<!-- BEGIN CONTRACT {"id":"68b9a37313e510684238","name":"REQ28-M34 — Choose whether to use writing help"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Off hides tools, denies that user's new requests/current candidate read/Use,
  ends private candidate-body availability and never revives them on reenable.
- It affects neither collaborators, accepted draft wording, ordinary Undo nor
  incurred/uncertain usage. Manual edit/save/templates/reuse/send remain usable
  without provider/AI setup.
- Quiet accessible action explains selected text goes to the organization's
  provider; provider/data-use changes refresh disclosure. No interrupted typing,
  mandatory recurring consent modal, voice score or covert usage ranking.

Story: US28-M34. Source: communications.md. Decision basis: D18 C01/C07/C18; personal preference versus tenant purpose and ordinary draft authority.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-6937225d4ecfd5ab9b6f"></a>

## REQ28-F25 — Conserve excess across gifts, terms and corrections

<!-- BEGIN CONTRACT {"id":"6937225d4ecfd5ab9b6f","name":"REQ28-F25 — Conserve excess across gifts, terms and corrections"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Phase 16 SHALL maintain a durable accepted association order per exact comparison
scope under its existing lock discipline. A first lawful late association appends
at acceptance; receipt dates and worker order SHALL not insert it retrospectively
into an accepted prefix. For qualified exact minor-unit values B (complete prior
compared support), G (this eligible gross-support portion excluding fee-cover,
before processor fees or Field Account assessments) and T (the recorded target
applicable to the original gift), the certificate SHALL equal
`max(B + G - T, 0) - max(B - T, 0)` and satisfy `0 ≤ excess ≤ G`.
The original terms, prefix and result SHALL remain evidence. Corrections SHALL
revalidate all causal dependencies, including earlier gifts; ordinary term
lowering creates no new past excess. Surviving excess SHALL not exceed the original
proved amount unless the owner explicitly supersedes an erroneous certificate.
Expiry or consumption of an old application instruction SHALL not block a
mandatory source correction or erase a lawful historical comparison.

Story: US28-F25. Source: finance-stewardship.md. Decision basis: D31 C01–C24.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-696d267cefa110a62e56"></a>

## REQ28-R12 — Return archived preparation

<!-- BEGIN CONTRACT {"id":"696d267cefa110a62e56","name":"REQ28-R12 — Return archived preparation"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Persistent Return to active prospects acts on the same retained preparation. Optional Undo targets only its exact accepted archive and current qualifying revision, never restores a whole old row over later changes.

Return creates no replacement contact, revived grant, reopened completed task, restarted communication or verified contact fact. Purged/erased content is not recoverable.

A later deliberate D2 share may act on archived preparation without unarchiving; the review explains that independent effect. Return to Active is a separate deliberate working-state choice.

Concurrent archive/return/share and recovered old results preserve one ordered source history and current presentation.

Story: US28-R12. Source: relationships.md. Decision basis: D4 C02–C04/C07–C12; D27 C05; D28 C07.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-6a62bc53709e82cbb336"></a>

## REQ28-F40 — Explain current hierarchy and historical report bases

<!-- BEGIN CONTRACT {"id":"6a62bc53709e82cbb336","name":"REQ28-F40 — Explain current hierarchy and historical report bases"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Each gift retains its accepted/effectively corrected campaign node. Current
structural subtree reporting SHALL use the current authorized campaign hierarchy;
moving a node can change ancestor totals without changing gift attribution.
**This campaign only** and **Including sub-campaigns** SHALL remain distinct
measures over a distinct qualified line set, not parent-own plus child totals.
Closed/archived hierarchy protection SHALL cover changes to ancestors or subtrees
that would alter protected historical meaning. Dated closures and issued
artifacts SHALL retain their exact hierarchy/source basis and never rebuild
against today's tree. Reconciliation SHALL include known-no-campaign amounts as
a valid bucket per currency and scope; unknown coverage prevents an assertion of
complete reconciliation. Visibility filters precede aggregation.

Story: US28-F40. Source: finance-stewardship.md. Decision basis: D49/D50; E7 reconciliation; P13 D13; P27 F78/F79.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-6d14dac2e767cd64f972"></a>

## REQ28-M20 — Reply through a real destination

<!-- BEGIN CONTRACT {"id":"6d14dac2e767cd64f972","name":"REQ28-M20 — Reply through a real destination"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Qualify a native newsletter reply purpose and confirmed monitored destination
  through P17/P6 and actual receiver; do not insert profile email dynamically or
  route every reply into Support Hub by convenience.
- Subscriber-only reader gets a permitted destination, not broken protected
  links or implicit P22 response/reading rights. Likes/prayers/comments use
  current exact P22 authority.
- Reply receipt/click/open is not automatically a CRM exchange, coach event,
  consent change or new inbox. No inbound mirror is required for D7 completion.

Story: US28-M20. Source: communications.md. Decision basis: D7 C19; Phase 17 native-newsletter reply-purpose extension and Phase 22 current reader/response authority.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-6e86785079a1ff99526e"></a>

## REQ28-Q05 — Completion follows the work's immutable contract

<!-- BEGIN CONTRACT {"id":"6e86785079a1ff99526e","name":"REQ28-Q05 — Completion follows the work's immutable contract"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The server-resolved work contract SHALL distinguish independent human follow-up
from source-controlled work. Its authority classification SHALL not be editable
by changing a client field, task type, board column or linked source. Independent
follow-up may finish without closing its linked source or recording compulsory
interaction. Source-controlled work SHALL close only through its qualified
owner outcome and SHALL reject generic Complete, Reopen, Delete and drag-to-Done
through every reachable writer. A visual group SHALL preserve each purpose's
identity, evidence, authorization and completion record.

Story: US28-Q05. Source: proof.md. Decision basis: Ratified completeness C03/C08; D19–D22/D29–D32 follow-up purposes; P27 source-owned work.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-709c0d8c0d09eb35db19"></a>

## REQ28-C30 — Write and save a private working check-in

<!-- BEGIN CONTRACT {"id":"709c0d8c0d09eb35db19","name":"REQ28-C30 — Write and save a private working check-in"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Check-ins shall offer voluntary Write check-in in coaching. Saving writing requires no title, period, target, eligible coach, reporting cadence or next action. A draft is unshared with coaches and question administrators; independent legally authorized source powers remain governed separately.

Story: US28-C30. Source: coaching-resources.md. Decision basis: D25 private drafting and optional plain writing; completeness recovery requirements.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-7114bae77c5a9772d31b"></a>

## REQ28-R36 — Correct referral timing with evidence

<!-- BEGIN CONTRACT {"id":"7114bae77c5a9772d31b","name":"REQ28-R36 — Correct referral timing with evidence"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Require exact scoped correction power, factual evidence, expected revision and deliberate before/after effective date/state review. General contact editing or a reason string alone is insufficient.

Recalculate from the originally accepted period/zone/semantic basis, never today's policy or a fresh start. Append actual correction history; preserve earlier assertions/acceptance/access history. Corrected endpoint may move either direction or repair a false Expired flag without another initial window or continuation.

All current read/action/display/expiry paths use the corrected effective result. If a continuation already exists, preserve its accepted terms and consumed lineage; do not reactivate predecessor, overlap cycles or silently reschedule successor. A true lineage contradiction enters owner reconciliation.

Correction cannot bypass withdrawal, refusal, erasure or revoked authority; ordinary Continue remains unavailable for active current work. No generic Undo or broad status/date PATCH.

Story: US28-R36. Source: relationships.md. Decision basis: D39 C07/C10–C12; D34 C14; D35 C12; P9 source correction.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-715b364ba1e4fcf738e4"></a>

## REQ28-Q11 — Database constraints and effective privileges

<!-- BEGIN CONTRACT {"id":"715b364ba1e4fcf738e4","name":"REQ28-Q11 — Database constraints and effective privileges"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

New or changed source relations SHALL define stable keys, required scope,
tenant-aware relationships and uniqueness, intentional nullability, valid state
combinations, finite/positive bounds where applicable, delete/restrict behavior
and protected history. Immutable scope and attribution may change only through
a qualified source transfer or correction. Constraints or a single authoritative
mutation boundary SHALL enforce invariants for old and resulting states.
Qualification SHALL inspect actual table grants, effective RLS old-row and
new-row checks, policy composition, views, function/RPC execution, storage and
privileged service paths. Explicit intended grants and actual Data API exposure
SHALL be verified independently of RLS. Definer/bypass paths SHALL have a
qualified bounded authorization contract; broad authenticated access or service
credentials alone are insufficient.

Story: US28-Q11. Source: proof.md. Decision basis: Ratified completeness C13/C14; P3/P12; source-owned Supabase/Postgres conventions.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-7369d9de6b1b0efe8b52"></a>

## REQ28-M31 — Keep personal content outside shared history

<!-- BEGIN CONTRACT {"id":"7369d9de6b1b0efe8b52","name":"REQ28-M31 — Keep personal content outside shared history"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Initial personal lane uses the no-readable-copy class. Separate unsent source draft,
  sealed execution material and body-free source/history outcomes.
- Durably recorded provider acceptance or terminal no-replay uncertainty closes
  the authorized source revision's readable/decrypt authority. Do not keep it
  forever as a draft, personalized timeline label, support copy or index.
- Definite pre-submission stop/rejection may preserve its still-eligible source
  draft for correction. Late evidence after purge never reconstructs body from
  provider, log, backup or Recent copy. External Sent copy/replies remain in the
  actual mailbox where retained; Asym promises no deletion/completeness.
- Primary execution ciphertext, wrapped keys and plaintext-capable caches purge
  within 24 hours after authority ends. Separately eligible source draft keeps its
  own clock; backup expiry/cryptographic erasure are distinct, not a false
  all-backups-gone-within-24h claim.
- Sending fact updates only qualified permitted outreach. It cannot complete a
  task, claim a human exchange, enroll coaching, subscribe or mutate money.

Story: US28-M31. Source: communications.md. Decision basis: D15 C11/C13/C14/C16 including no readable Sent copy and 24-hour primary execution-material purge.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-74f593e7e28e95a623a6"></a>

## REQ28-C46 — Enable regional discovery deliberately with one control

<!-- BEGIN CONTRACT {"id":"74f593e7e28e95a623a6","name":"REQ28-C46 — Enable regional discovery deliberately with one control"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

New organizations shall start with Phase 28 regional discovery Off until authorized staff enable the qualified capability. Existing legitimate choices shall be preserved. Missing or unknown legacy configuration shall not imply On.

Story: US28-C46. Source: coaching-resources.md. Decision basis: Selected D13 list/map/control; D46 explicitly selected initial new-organization default; completeness configuration safeguards.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-75ed4ae4347078f2365a"></a>

## REQ28-R33 — Control missionary continuation

<!-- BEGIN CONTRACT {"id":"75ed4ae4347078f2365a","name":"REQ28-R33 — Control missionary continuation"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Allow missionaries to continue expired referrals starts Off for new/unconfigured tenants; preserve an existing explicit qualified choice. Existing scoped grants decide eligible actors; no per-ministry matrix or personal switch.

Off stops new missionary-lane acceptance at the source boundary. It does not undo accepted cycles, expire active work, remove independently permitted history, cancel independent work or revoke staff's separate authority. Tenant staff can restrict their own action grants through existing administration.

A caller-supplied role/surface/mode cannot switch a missionary command into staff authority. Enabling alone grants no universal authority and does not replay rejected/stale intent.

Settings Save and source acceptance share relevant policy ordering, including unconfigured→first enable and A→B→A; pending/effective states stay truthful.

Story: US28-R33. Source: relationships.md. Decision basis: D35 C01/C02/C06/C19/C22; D36 C02; D38 C04; D39 C08.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-762ab9fd7f96dd9127fb"></a>

## REQ28-R13 — End access without exposing private work

<!-- BEGIN CONTRACT {"id":"762ab9fd7f96dd9127fb","name":"REQ28-R13 — End access without exposing private work"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Confirmed source participation/access termination fences the former reader without waiting for cleanup, handoff or a replacement. Inactivity, absent giving, missing voluntary logs, a closed browser or archive state is not a departure signal.

Departure/incapacity creates no new staff, administrator, coach, spouse, successor or cleanup reader of unshared preparation; no automatic share/export/transfer follows.

Already shared/independent CRM facts and accepted duties retain their owner permissions and continuity rules. No eligible assignee yields the source-owned exception, never guessed coverage or false Done.

Removing preparation cannot delete canonical people, erase financial/consent history, clear suppression or destroy another worker's records. An unshared prospect creates no mandatory handoff or missing-log task.

Story: US28-R13. Source: relationships.md. Decision basis: selected D3; D3 C01–C07 as reconciled by ratified D2/D4/D27/D28 and completeness C12; P9/P12/ADR-0183 duty ownership.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-79c9179418db1ea08adc"></a>

## REQ28-R25 — Enforce the supported file profile

<!-- BEGIN CONTRACT {"id":"79c9179418db1ea08adc","name":"REQ28-R25 — Enforce the supported file profile"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Enforce the ratified initial profile: uploaded file ≤10 MiB (10 × 1,048,576 bytes); selected-range nonblank processing data rows ≤10,000 before hidden/error/skip exclusions; parsed slots ≤500,000 across whole workbook/file including explicit empties; actual decompressed XLSX package ≤128 MiB; actual ZIP members ≤4,096; decoded cell text ≤32 KiB UTF-8; one explicitly selected worksheet; source columns ≤16,384. Stricter target-field limits win without truncation.

Count actual bytes/members/cells before and during work, not trusted Content-Length, dimensions or ZIP declarations. Sparse absent coordinates neither allocate nor count; hidden/unselected content still consumes applicable resource bounds. Reject traversal, ambiguous duplicate parts and unsafe entities/references.

Admit qualified CSV/data-only XLSX plus .tsv/.txt through the same text parser. Support UTF-8 with/without BOM, BOM-identified UTF-16 and explicit Windows-1252 recovery; preview confirms proposed comma/semicolon/tab dialect. Unsupported encoding has a useful resave instruction.

Execute no formulas/macros/embedded objects/external links and fetch no referenced resources. Reject encrypted/legacy/macro formats disguised by extension. Flag saved scalar formula caches as assertions; missing/error caches block affected mapped cells, and caches are never durable-ID proof.

Prove N−1/N/N+1 for every numeric boundary, worst-distribution memory/CPU/worker deadline, cancellation and tenant fairness. These are admitted qualification limits, not demonstrated capacity.

Story: US28-R25. Source: relationships.md. Decision basis: D17 C12/C22 and ratified Initial file and custody profile.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-7a24e090aa378f23ee93"></a>

## REQ28-M06 — See an existing membership or deliberately rejoin

<!-- BEGIN CONTRACT {"id":"7a24e090aa378f23ee93","name":"REQ28-M06 — See an existing membership or deliberately rejoin"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- At most one current membership exists per exact tenant/newsletter/destination
  identity. Active-identical Join is no-op and sends no new confirmation.
- Fresh eligible Rejoin may replace only that newsletter/destination's ordinary
  withdrawal, preserving history. It cannot clear global objection, complaint,
  hard bounce, person restriction or another source safety rule.
- No staff ticket or extra dialog solely for rejoin. The operation identity
  distinguishes fresh intent from replay: a new HTTP key alone is not fresh human
  rejoin, while a permanent address-only key cannot block legitimate future intent.
- Join/confirm/withdraw serialize on one source consent boundary. An old accepted
  Join retry recovers its historical receipt without reversing later withdrawal;
  withdrawal invalidates older unfinished instructions.

Story: US28-M06. Source: communications.md. Decision basis: D42 C10/C12/C14; D43 C07; Phase 3 exact-purpose consent and suppression.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-7b2a7d2aaa98e6072b36"></a>

## REQ28-F14 — Use explicit special-gift reasons

<!-- BEGIN CONTRACT {"id":"7b2a7d2aaa98e6072b36","name":"REQ28-F14 — Use explicit special-gift reasons"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Automatic special-gift eligibility SHALL use only the independently qualified
purpose/amount contracts below. Prior-giving comparisons SHALL NOT decide task
admission, unsolicited suggestions, badges, default prioritization or notices.
The exclusion includes relabeling a historical-comparison score, import marker,
model output or memo as a generic special-gift flag. Ordinary one-time payment,
missing commitment, catching up or paying in advance does not prove additional
support or excess. Authorized historical charts and deliberate user sorting may
remain, without becoming an automatic reason.

Story: US28-F14. Source: finance-stewardship.md. Decision basis: D21; D22; D29–D31.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-7b2e01be35c8928d5572"></a>

## REQ28-C39 — Curate and publish resources intentionally

<!-- BEGIN CONTRACT {"id":"7b2e01be35c8928d5572","name":"REQ28-C39 — Curate and publish resources intentionally"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Curatorial capability shall be explicit within authorized staff context, not universal staff power or a new missionary submission queue. Resource-purpose publication owns audience and meaning; document custody owns bytes, versions, integrity, scanning and retention. REQ29-C103–C109 governs one suitable publication deliberately serving Staff, Missionaries or both within exact organization/Tenant/environment; actual source/P12 eligibility narrows every read. One shared publication has one content/language/meaning/lifecycle/review plan, while separate publications remain available when these differ.

Story: US28-C39. Source: coaching-resources.md. Decision basis: D12 selected staff-managed library and reviewed publication/custody safeguards; Phase29 Q58 shared-publication amendment and Q55 exact review applicability; existing content/document owners.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-7b34c8f5bf5748452c8d"></a>

## REQ28-R21 — Recover and repeat imports safely

<!-- BEGIN CONTRACT {"id":"7b34c8f5bf5748452c8d","name":"REQ28-R21 — Recover and repeat imports safely"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Retry returns durable row effect receipts. Reuploading identical bytes in the same qualified scope/profile identifies prior work and reviews remaining effects; row number/file hash/tool name alone is not identity authority.

Qualified external IDs bind Tenant, exact target/workspace, source instance, entity kind and established source binding. Reordered/changed files without stable qualified IDs require authorized review; no perfect deduplication claim.

Changed bound assertions preserve current fields, show only authorized discrepancies and direct to ordinary correction outside intake. “Previously imported” is historical acceptance, not a claim of current equality.

Hidden matches do not leak through candidates, accepted/reused/unchanged outcomes, downloads or target references. Reimport cannot reactivate Archived work, restore consent, revive erased content or replay automations.

Story: US28-R21. Source: relationships.md. Decision basis: D17 C05–C07/C17/C18; D41 C03; P4 identity boundary.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-7e32403fe4eef9672361"></a>

## REQ28-M21 — Prepare useful physical newsletter work

<!-- BEGIN CONTRACT {"id":"7e32403fe4eef9672361","name":"REQ28-M21 — Prepare useful physical newsletter work"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- P28 qualified print/export source owns exact authorization/evidence with
  P3/P12 access and applicable custody; this is not generalized P17 print ownership.
- Use current qualified postal authority, international addresses, safe salutation
  and owner household deduplication. Email membership grants neither postal data
  nor physical consent. Missing addresses have permitted repair.
- Freeze exact selection and admitted rendition. A contact correction stales
  unsubmitted preflight and cannot silently retarget reviewed labels.
- Screen/export, download, printed, mailed and delivered remain distinct. Exclude
  personalized unsubscribe secrets and unrelated roster data; download is
  irreversible disclosure, not proof mailed/delivered or official P18 finance.

Story: US28-M21. Source: communications.md. Decision basis: D7 C18; Phase 3/12 disclosure, Phase 25 current postal-use authority, and qualified Phase 28 print/export custody.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-7f436830ae32db9553d7"></a>

## REQ28-M26 — Stop, remove, disconnect and resume separately

<!-- BEGIN CONTRACT {"id":"7f436830ae32db9553d7","name":"REQ28-M26 — Stop, remove, disconnect and resume separately"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Stop updates ends ordinary copy operations; Remove additionally requests
  exact-copy removal; appointment Cancel changes source truth and requests removal.
  Never delete an entire calendar or unrelated event.
- Explicit disconnect/current authority loss immediately fences old ordinary
  operations and stopped binding generations. It does not wait for cleanup or
  promise external erasure. Late evidence updates only its old attempt.
- Cleanup after ordinary access loss needs separate narrow teardown authority
  and provider permission over proved prior copies; otherwise show unresolved
  removal and safe guidance. Temporary token/provider failure pauses still-enabled
  work, unlike explicit Stop/Disconnect.
- Reconnect alone adds/resumes nothing stopped. Deliberate Resume reviews current
  destination, authority and reconciled exact retained copy without new identity.

Story: US28-M26. Source: communications.md. Decision basis: D14 C11/C15; Phase 31 connection/grant and bounded teardown authority.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-81f23f3d6cf4da086968"></a>

## REQ28-C40 — Withdraw resources through current custody and audience controls

<!-- BEGIN CONTRACT {"id":"81f23f3d6cf4da086968","name":"REQ28-C40 — Withdraw resources through current custody and audience controls"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Withdrawal shall fence this library's new discovery and retrieval without deleting independently held/shared bytes, unrelated lawful uses or required evidence. Already delivered bytes cannot be recalled.

Story: US28-C40. Source: coaching-resources.md. Decision basis: D12 reviewed withdrawal/current-delivery design; Phase29 Q58 audience/withdrawal/recovery refinements; document custody and permission boundaries.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-83cc3bbf0541acd36008"></a>

## REQ28-F09 — Reuse an approved Plan only by deliberate copy

<!-- BEGIN CONTRACT {"id":"83cc3bbf0541acd36008","name":"REQ28-F09 — Reuse an approved Plan only by deliberate copy"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

**Copy from approved Plan** SHALL be optional and available only with independent
current Plan-read and goal-write authority for the exact compatible scope,
currency and amount basis. The editor SHALL review the candidate amount and exact
approved version before saving. The accepted goal SHALL retain immutable copy
provenance. Later Plan changes SHALL NOT synchronize the goal, and later goal
changes SHALL NOT amend the approved Plan, budget, balance, reserve or
compensation. Manual goal use SHALL remain possible without any Plan.

Story: US28-F09. Source: finance-stewardship.md. Decision basis: D16 C15–C17; P21 D8–D12.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-885f5a98b2b50d31b994"></a>

## REQ28-M29 — Send once with a bounded useful lifetime

<!-- BEGIN CONTRACT {"id":"885f5a98b2b50d31b994","name":"REQ28-M29 — Send once with a bounded useful lifetime"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- From/To/content are ordinary review; no repetitive confirmation modal or staff
  approval queue. Source/purpose class and canonical eligibility control actual
  sending, not a user-selected transactional exemption.
- Atomically lock reviewed draft and accept one source authorization, audit and
  complete P6 release. Different browser keys for that accepted occurrence do
  not create new effects. Content/source/address/sender/grant changes need closure
  of provably-unsent old work and fresh relevant review.
- Set the usefulness deadline to local acceptance plus five minutes, immutable. Every new attempt,
  including proved-rejection retry, must be admitted before it. If no possibly
  submitted attempt exists at expiry, Not sent; preserve still-eligible draft.
- A pre-expiry admitted attempt can resolve/timeout afterward. Initial network
  deadline is 30 seconds; ambiguous timeout is Unknown, never safe automatic retry.
  Initial serialized message limit is 262,144 bytes (256 KiB), or stricter provider
  bound, validated before dispatch with clear correction. These are ratified
  product defaults, not provider maxima or empirical throughput claims.

Story: US28-M29. Source: communications.md. Decision basis: D15 C08/C10/C14/C17 including ratified 5-minute usefulness, 30-second network and 256-KiB limits.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-89ef22c323a648b0df7a"></a>

## REQ28-M17 — Authorize one issue now or once later

<!-- BEGIN CONTRACT {"id":"89ef22c323a648b0df7a","name":"REQ28-M17 — Authorize one issue now or once later"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Final review binds exact content, sender/reply, approved audience/exclusions,
  content approval and Send-now or one future instant/timezone. Commit source
  authorization, required evidence and durable bounded fanout intent atomically.
- Complete compiler release precedes dispatch of every admitted bounded plan.
  Duplicate devices/HTTP keys/jobs resolve the same accepted issue and recipient
  effect. Intentional new issue/correction is a separate reviewed source occurrence.
- Schedule authorizes only this issue; resolve nonexistent/ambiguous local time
  explicitly. Pin an enforced source schedule horizon and absolute usefulness
  deadline before activation, rather than borrowing Resend/system TTLs.
- Edit/reschedule must stop or transition definitely unsubmitted old work and
  require relevant fresh authorization. Cancelled/expired occurrences cannot
  revive after restore, reconnect, retries or a new worker.

Story: US28-M17. Source: communications.md. Decision basis: D7 C09–C11; Phase 6/17 complete compiler release, source authorization and one-off schedule.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-8a4244cfac842f77a4dd"></a>

## REQ28-M24 — Maintain the same copy on source changes

<!-- BEGIN CONTRACT {"id":"8a4244cfac842f77a4dd","name":"REQ28-M24 — Maintain the same copy on source changes"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Atomically commit source mutation, desired copy revision, audit and durable
  identifier work; perform provider I/O outside transactions. Only definitely
  undispatched work may coalesce; attempted envelopes/destinations are immutable.
- Connected is not synchronized. Show source saved, update pending, last proved
  revision/time, known rejection, uncertainty, conflict and confirmed removal.
- External edits never write native appointment facts. Exact conditional
  update/delete (or equally proved race boundary) detects managed-field and
  attendee/organizer drift; GET then unguarded PATCH is insufficient.
- Preserve unrelated allowed color/reminder fields. Conflict pauses copy with
  Restore from Asym or Stop updates. Missing/forbidden is not proven deletion;
  never silently recreate or emit invitations/cancellations.

Story: US28-M24. Source: communications.md. Decision basis: D14 C07/C10; Phase 9 source revision and Phase 31 conditional remote operation.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-8b58cc4f1915d6a85fd2"></a>

## REQ28-C26 — Continue only the selected activity target's admitted periods

<!-- BEGIN CONTRACT {"id":"8b58cc4f1915d6a85fd2","name":"REQ28-C26 — Continue only the selected activity target's admitted periods"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

For a recurring target, future periods of the same admitted target continue from the reviewed first period while the inclusion and episode remain active. Already admitted periods remain reviewable only within current rights, qualified retention and the bounded output profile.

Story: US28-C26. Source: coaching-resources.md. Decision basis: D24-C07 ratified continuation contract and period/history limits.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-91027ba640c5cb0d5e49"></a>

## REQ28-Q17 — Accessible, coherent Core interaction

<!-- BEGIN CONTRACT {"id":"91027ba640c5cb0d5e49","name":"REQ28-Q17 — Accessible, coherent Core interaction"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The composed experience SHALL use existing shared Base UI/base-maia primitives,
semantic tokens, typography and spacing. Each local job SHALL have an
understandable primary action, clear source/context and persistent material
outcome. Keyboard, screen-reader, touch, zoom and narrow-viewport use SHALL cover
the entire journey, including dialogs and errors. Boards and maps SHALL have
equivalent accessible list/menu operations; dragging, hover or color SHALL not
be the only affordance. Focus SHALL be preserved/restored appropriately and
material asynchronous results announced without stealing focus. A disappearing
toast alone SHALL not communicate success, failure, permission or expiry.

Story: US28-Q17. Source: proof.md. Decision basis: Ratified completeness C01–C03/C17/C18; existing Core Base UI/base-maia design and accessibility contracts.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-91619d8c6057db999b21"></a>

## REQ28-F29 — Make missionary offline reporting optional and Off by default

<!-- BEGIN CONTRACT {"id":"91619d8c6057db999b21","name":"REQ28-F29 — Make missionary offline reporting optional and Off by default"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

One organization-wide **Allow missionaries to report offline gifts** setting
SHALL initially be Off for new tenants and existing tenants without an explicit
qualified choice. Upgrades preserve a deliberately selected qualified On or Off.
On is necessary but not sufficient for a missionary's current reporting
capability. Staff entry SHALL remain usable without a missionary report. Phase 28
SHALL call the existing Phase 15 operational-intake owner; it SHALL not insert a
financial gift, staging record, parallel intake ledger or task-as-source record.
Enable only the qualified narrow reporting/handling/finance continuation lane,
without requiring every future accounting feature or a new workflow builder.

Story: US28-F29. Source: finance-stewardship.md. Decision basis: D33 C01–C04/C18/C23; P15; P27 F56–F74.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-926be6973d4479c0472e"></a>

## REQ28-Q18 — Localized and low-bandwidth work

<!-- BEGIN CONTRACT {"id":"926be6973d4479c0472e","name":"REQ28-Q18 — Localized and low-bandwidth work"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The UI SHALL preserve supported Unicode names, real country/address formats,
international email values and exact currency identity without invented required
name parts or domestic defaults. Consequential dates SHALL show an unambiguous
localized value and relevant timezone; relative-only copy or ambiguous midnight
SHALL not substitute for the deadline. Loading and retry SHALL work without
false empty, zero or saved states under latency and interruption. This release
SHALL not imply unsupported full offline sync, persistent restricted-device
caching or automatic replay of unapproved consequential work. Public intake
and the protected confirmation doorway retain their distinct script contracts.

Story: US28-Q18. Source: proof.md. Decision basis: Ratified completeness C17/C18; D39 date-only referral semantics; D42–D45 reader journey; international identity/address owners.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-94ddb3c55da856cb24fd"></a>

## REQ28-C04 — Apply organization coaching controls precisely

<!-- BEGIN CONTRACT {"id":"94ddb3c55da856cb24fd","name":"REQ28-C04 — Apply organization coaching controls precisely"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Existing owner controls shall govern external-coach eligibility and the qualified optional sharing modules. A saved availability preference shall not substitute for current source qualification or actor authority. The interface shall not add a master Phase 28 switch or a matrix of per-person exceptions.

Story: US28-C04. Source: coaching-resources.md. Decision basis: D8 organization ceilings; D24–D26 module availability; completeness configuration amendments.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-952c4fb9e03d1153da84"></a>

## REQ28-C38 — Find useful organization resources

<!-- BEGIN CONTRACT {"id":"952c4fb9e03d1153da84","name":"REQ28-C38 — Find useful organization resources"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Resources from the organization shall provide text-first browsing with practical descriptions and honest format, language and known file-size information. Categories organize content; they do not grant access. The P28 owner adopts the complete Phase29 resource contracts at repository-root path `docs/prds/sitestacker-parity/phase-29-files-documents/organization-and-review-tools.md`, REQ29-C80–C86 and C95–C115, with their shared proof requirements. This repository-root reference applies equally from the canonical volume and generated contract companion. These add advisory review planning, actual review/correction, private problem reporting and handling, independently qualified staff readership/shared publications, and optional personal Save for later; they are source-owned extensions, not a competing library.

Story: US28-C38. Source: coaching-resources.md. Decision basis: Selected D12 organization-managed resource library; D37 resource reuse; Phase29 Q55/Q57–Q59 ratified review, reporting, staff-reader and personal-return amendments.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-967b886374de48f5a56d"></a>

## REQ28-C01 — Enter coaching with an individual identity and explicit organization

<!-- BEGIN CONTRACT {"id":"967b886374de48f5a56d","name":"REQ28-C01 — Enter coaching with an individual identity and explicit organization"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Coach shall be a first-class tenant-scoped product role/preset using the existing membership-backed Active Tenant Assignment within the Tenant Authorization Context model. It shall not create a fifth authorization context, alias a staff role or imply donor access. Internal and organization-permitted external coaches shall use their own proved identities, existing qualified sign-in/recovery and applicable assurance gates.

Story: US28-C01. Source: coaching-resources.md. Decision basis: D8-C01–C06; completeness context and authorization amendments; Identity/Permissions ownership.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-97a426b9bfcf970844be"></a>

## REQ28-M02 — Understand organization signup controls

<!-- BEGIN CONTRACT {"id":"97a426b9bfcf970844be","name":"REQ28-M02 — Understand organization signup controls"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- The source-owned native signup capability can be disabled under existing
  settings/permission owners. Disabled blocks new and pending admissions and
  unstarted confirmation dispatch, while preserving existing subscriptions,
  unsubscribe, giving/Page reach and independently authorized newsletter delivery.
- Reenable permits a still-current unexpired original request to finish; it does
  not renew the clock, revive withdrawn/superseded proof or automatically replay
  a P6 intent already terminally suppressed.
- One organization option, **Let signed-in readers use their verified email**,
  governs D42. Its Off routes subsequent new/rejoin requests through confirmation;
  it does not change existing membership or automatically activate pending work.
- Default On applies only to newly deliberately enabled and qualified native
  capability. Preserve stricter policy and Page Off; missing/invalid policy is
  not On. No per-Page/provider/project/reader exceptions or duration editor.

Story: US28-M02. Source: communications.md. Decision basis: D42 C07; D43 C05/C09; Phase 3/12 source consent and settings authority.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-9ad69618a17e604a5a4d"></a>

## REQ28-R39 — Use and revisit the optional guide

<!-- BEGIN CONTRACT {"id":"9ad69618a17e604a5a4d","name":"REQ28-R39 — Use and revisit the optional guide"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Offered guide has one stable Resources entry; dismissible Home/Help links resolve to that same current guide. Home dismissal is user/Tenant-scoped, reversible and persists through routine revision/re-offer without becoming progress.

Any suggestion may be used in any order. No tenant setting or content acknowledgment gates ordinary work. No completion checklist, course sequence, staff/coach progress, streak, behavioral score or automated reminder.

Links navigate only; browsing, preview, prefetch and open do not create tasks, change stage, import contacts, send, give, subscribe or claim an interaction.

Current guide/resource/destination authority is checked before metadata disclosure and at use. Withhold denied target and dependent unsafe wording; retain independently safe advice only where declared conditions prove separation. Otherwise withhold the whole step without hidden numbered gaps/counts.

Story: US28-R39. Source: relationships.md. Decision basis: D37 C01/C03/C05/C06/C11/C12.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-9be34d2f842e4d26d6c7"></a>

## REQ28-F05 — Offer simple, scoped goal-management controls

<!-- BEGIN CONTRACT {"id":"9be34d2f842e4d26d6c7","name":"REQ28-F05 — Offer simple, scoped goal-management controls"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

One organization default SHALL initially be **Staff-managed**. The existing
settings surface SHALL offer Staff-managed or Missionary-managed. An exact typed
ministry/project subject MAY explicitly use the organization default or either
supported override; inheritance SHALL show the effective result. There is no
implicit household, project-member or Page cascade. Current goal-write authority
and the effective management policy are both required. Policy administration,
goal reading and goal writing SHALL remain independent capabilities. A goal is
optional; no actor must create one to use the workspace.

Story: US28-F05. Source: finance-stewardship.md. Decision basis: D16 C01–C06.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-9d26d6d074e469838d00"></a>

## REQ28-M40 — Keep suggestions short-lived and private

<!-- BEGIN CONTRACT {"id":"9d26d6d074e469838d00","name":"REQ28-M40 — Keep suggestions short-lived and private"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Candidate body is private to invoking actor under current source authority,
  encrypted, unavailable at completion+24 hours or earlier Use/Discard/supersession/
  source invalidation/personal Off/revocation. Primary body purge ≤1 hour later.
- Copied input persists only while admitted work can execute, ≤1 hour from
  admission, shorter when completed/no-longer-applicable and unnecessary for
  recovery. Unknown is not permission to retain input; expiry blocks late
  dispatch or reconstruction. Same ≤1-hour primary purge after access ends.
- Original/accepted draft wording follows ordinary source retention, not candidate
  expiry. Retain minimal body-free invocation/use/usage evidence under its owner;
  no prompt logs, rejected-suggestion library or body analytics.
- Before activation the exact provider account/model/region must qualify its
  retention, training use, subprocessors, residency and endpoint storage settings
  against tenant policy. A valid key alone is not readiness. Selected prose is
  untrusted data and cannot change instructions, credentials, sources or limits.
- No raw browser candidate/token table access or admin settings right to prose.
  Restore reapplies restriction/expiry before reads; provider no-training or
  a provider no-storage request is not represented as zero retention.

Story: US28-M40. Source: communications.md. Decision basis: D18 C14–C17/C20 including 24-hour candidate, one-hour copied-input and one-hour primary-purge periods.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-9d8472d0c4746331fd17"></a>

## REQ28-R40 — Disable and re-offer the guide

<!-- BEGIN CONTRACT {"id":"9d8472d0c4746331fd17","name":"REQ28-R40 — Disable and re-offer the guide"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Existing/new tenants begin without an offered guide; any seeded examples are draft-only. Deliberate publication is required before discovery.

Disable stops new guide discovery/delivery under current checks, even with invalid unsaved draft. It deletes no resource or independent work and grants no new audience.

Stale save/publish/retry/restore cannot re-offer it; re-offer is fresh authorized deliberate acceptance against current dependencies. Recover prior command outcome separately from current availability.

Reorder works without dragging, and complete curation/reader flows preserve keyboard/focus/status/reflow. No new onboarding vendor, course engine, tracking/URL-unfurl or video dependency.

Story: US28-R40. Source: relationships.md. Decision basis: D37 C07/C08/C10/C12–C15.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-9def00d68834e423153e"></a>

## REQ28-F24 — Recognize any source-confirmed positive excess

<!-- BEGIN CONTRACT {"id":"9def00d68834e423153e","name":"REQ28-F24 — Recognize any source-confirmed positive excess"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Any eligible strictly positive excess in the currency's exact supported minor
unit SHALL qualify without a minimum, percentage, epsilon or tenant amount
setting. Phase 16 SHALL own a bounded comparison association and per-gift excess
certificate distinct from fulfillment application capacity. The association SHALL
bind the entire compared portion to lawful source lineage and the exact recurring
occurrence line or whole fixed-pledge designation-line scope, including applicable
future named expectations and valid unscheduled capacity, within one exact Tenant,
Legal Entity and currency; no FX or cross-scope sum is permitted. Matching guesses,
unmatched residual, a reduced pledge total, one paid installment or capped
applications cannot certify excess. Phase 28 consumes the certificate and SHALL
not allocate, reserve or route money.

Story: US28-F24. Source: finance-stewardship.md. Decision basis: D31.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-9f0386023740fbd08849"></a>

## REQ28-M10 — Recover pending work without repeated enrollment

<!-- BEGIN CONTRACT {"id":"9f0386023740fbd08849","name":"REQ28-M10 — Recover pending work without repeated enrollment"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Lost responses recover the same durable operation under current authority.
  Confirmation atomically commits membership/evidence/result; no separate-success
  write gap. Provider failure leaves accepted source truth intact.
- Permitted deliberate resend can create a separately qualified delivery effect
  for the same occurrence/destination/deadline. Reconcile ambiguous older
  transport before replacement; rotation supersedes proof without renewal.
- D42 immediate Join converges with pending work and makes obsolete confirmation
  unable to revive later consent. No repeated welcome effect, reminder sequence,
  audience widening or auto-replay on reenable.

Story: US28-M10. Source: communications.md. Decision basis: D42 C16; D43 C08/C09; Phase 6 durable intent and provider outcome ownership.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-9f5db2667b1e2bd85d5d"></a>

## REQ28-R32 — Keep expired history purpose-limited

<!-- BEGIN CONTRACT {"id":"9f5db2667b1e2bd85d5d","name":"REQ28-R32 — Keep expired history purpose-limited"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Filtering/searching/reading changes no status, dates, retention, task, interaction or communication. Source telemetry is not an outreach event.

Withdrawal, invalidation, privacy revocation, departure and generic archived/ended statuses do not qualify as ordinary expiry. Source corrections affect current eligibility without rewriting lawful history.

Ordinary supporter access is evaluated independently: D34 denial does not remove another valid path, and that path does not expose protected referral context. Retention/hold alone grants no historical read.

Search only admitted fields, before pagination/counts; hidden phone/note matches reveal nothing. No new export, print list, AI, sync or offline roster is added.

Story: US28-R32. Source: relationships.md. Decision basis: D34 C07–C14/C17/C18/C21/C22; D35 C10/C12.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-9f8d3678b5b0ab712fd4"></a>

## REQ28-F12 — Preserve first-support purpose identity through repair

<!-- BEGIN CONTRACT {"id":"9f8d3678b5b0ab712fd4","name":"REQ28-F12 — Preserve first-support purpose identity through repair"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Durable coverage SHALL be keyed to the source-certified canonical supporter,
typed subject and first-support purpose within the tenant/entity scope. Source
event IDs, responsible worker and display task IDs are lineage, not substitute
business identity. Admission SHALL retain its durable task-projection intent.
Historical imports establish baseline without catch-up tasks. A source-invalid
unhandled admission SHALL be withdrawn without recording human completion;
qualified correction may restore that original live purpose or establish its
true later live first support only when no genuine prior support or human handling
contradicts it. A refund of genuine prior support never restarts firstness.

Story: US28-F12. Source: finance-stewardship.md. Decision basis: D19 C08–C12.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-a0a0bb9933cd7c92cc00"></a>

## REQ28-R05 — Share eligible contact facts with staff

<!-- BEGIN CONTRACT {"id":"a0a0bb9933cd7c92cc00","name":"REQ28-R05 — Share eligible contact facts with staff"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Review the exact eligible contact facts, organization and ordinary staff audience before one explicit acceptance. Cancel or failed acceptance leaves the prior state intact.

Accepted sharing creates/reuses canonical contact facts only through the qualified P4/P9 owner. Independent authoritative facts are not silently overwritten.

Ordinary authorized staff discover the shared contact without per-contact invitations or collaborator grants. Existing protected-record, purpose and field floors still apply; sharing does not give Maya general staff visibility.

Private planning, earlier notes/activity, attachments, referral context and care information are not copied, summarized or relabeled into shared history.

Story: US28-R05. Source: relationships.md. Decision basis: ratified D2 C01–C06/C14; D1 selected restricted start; P4/P9/P12.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-a26ee6c45e7b80aebd9a"></a>

## REQ28-Q14 — Truthful outcomes and recoverable partial success

<!-- BEGIN CONTRACT {"id":"a26ee6c45e7b80aebd9a","name":"REQ28-Q14 — Truthful outcomes and recoverable partial success"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Requested, pending, accepted, unavailable, failed and unknown outcomes SHALL be
distinguished according to the source contract. A failed readback SHALL not
turn an accepted write into failure. A composite action may promise a single
success only when the source guarantees that result; otherwise it SHALL expose
partial outcomes and retry only missing effects. Recovery SHALL recheck current
disclosure rights and resolve the original effect. Historic success SHALL not
assert a now-withdrawn membership or ended permission. Provider acceptance,
delivery, print/export and actual human response retain distinct meanings;
ambiguous irreversible effects require reconciliation before retry.

Story: US28-Q14. Source: proof.md. Decision basis: Ratified completeness C08/C16/C19; D42/D43 recovery; P6 external-outcome semantics.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-a30bb258e89da2e4b2a8"></a>

## REQ28-C35 — Share a minimal approved task description with live facts

<!-- BEGIN CONTRACT {"id":"a30bb258e89da2e4b2a8","name":"REQ28-C35 — Share a minimal approved task description with live facts"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

A coaching task summary shall contain an opaque summary handle, an approved plain-text description, current qualified due value/status and safe context/currentness. The description is an approved disclosure version; the due value and status derive from the same authoritative task.

Story: US28-C35. Source: coaching-resources.md. Decision basis: D26 minimal projection and versioned descriptor; P9 source facts.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-a42c8c65661d5e4170ea"></a>

## REQ28-Q22 — Restore does not restore forbidden authority

<!-- BEGIN CONTRACT {"id":"a42c8c65661d5e4170ea","name":"REQ28-Q22 — Restore does not restore forbidden authority"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Before restored reads and jobs reopen, recovery SHALL reconcile subsequent
revocations, consent withdrawals, suppression, disposition, replaced/expired
proof and consumed business effects against the recovered state. Source owners
SHALL define their authoritative reconciliation evidence and safe unavailable
result when it cannot be established. Restore SHALL not infer renewed rights
from a recovered active flag, email address, old session or pending queue item.
The process SHALL preserve lawful durable evidence while maintaining disposition
of controlled private copies under the owning retention policy.

Story: US28-Q22. Source: proof.md. Decision basis: Ratified completeness C12/C14/C15; source retention, suppression, revocation and consumed-effect contracts.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-a74310f3a24020f8c1fa"></a>

## REQ28-R01 — Choose the correct working context

<!-- BEGIN CONTRACT {"id":"a74310f3a24020f8c1fa","name":"REQ28-R01 — Choose the correct working context"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Zero admitted contexts yields an honest no-access/setup state and only a real permitted help destination. One context opens directly; multiple admitted contexts can be deliberately selected without exposing unadmitted names/counts.

Show the consequential current organization/subject. Saved context selection is revalidated; another role's grants are not unioned into the request.

Switching does not move a draft, recipient, uploaded file, accepted effect or recovery request to the other context. Guard unsaved work with ordinary local recovery where still authorized; discard known-obsolete responses and clear data that is no longer readable.

A useful first native job does not require a guide, coach, goal, connected provider, import or AI.

Story: US28-R01. Source: relationships.md. Decision basis: completeness C01/C02/C06/C14/C17; P12 current Tenant Authorization Context; glossary Ministry Assignment versus Active Tenant Assignment.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-ad05da12ad4da46f59f9"></a>

## REQ28-M30 — Understand personal-mail uncertainty without unsafe retry

<!-- BEGIN CONTRACT {"id":"ad05da12ad4da46f59f9","name":"REQ28-M30 — Understand personal-mail uncertainty without unsafe retry"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- States distinguish local accepted/pending, prepared definitely unsubmitted,
  submission may have begun, provider acceptance, proved no-send/rejection,
  unknown and independently proved later failure. Gmail success/Graph 202 does
  not prove Delivered, Read, Replied or actual exchange.
- Disable hidden send retries in SDK/client/proxy/worker. No follow-up call after
  accepted/indeterminate non-idempotent personal-provider work. Internal key,
  Message-ID, empty Sent search, lease expiry and missing webhook prove no absence.
- Only exact provider-qualified definite non-acceptance allows bounded identical
  retry under current source/grant/consent and original five-minute deadline.
  No changed account/key/body/clone or reconnect refresh escapes this rule.
- Unknown UI explains it may have been sent and points to the email app without
  promising search completeness, automatic resolution or general read permission.
  Attributed manual observation cannot become provider proof or unlock retry.
  Genuine later independent communication is not a forever contact lock or an
  automatically manufactured replacement for an unknown send.

Story: US28-M30. Source: communications.md. Decision basis: D15 C10/C11/C18; Phase 6/17 permanent attempt identity and exact non-idempotent provider profile.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-ae21619032eeb888bdb5"></a>

## REQ28-F13 — Make personal first-support completion truthful

<!-- BEGIN CONTRACT {"id":"ae21619032eeb888bdb5","name":"REQ28-F13 — Make personal first-support completion truthful"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

First-support work SHALL use the shared closed **Independent follow-up** task
contract. **Done** and **Not needed** are deliberate human dispositions, not
evidence of a conversation, send, receipt, financial resolution or permanent
suppression of other purposes. No narrative is required. Optional actual
interaction recording retains its own audience, occurrence and truth. A source
correction SHALL preserve a separately accepted call, promise or other undertaking
and reconcile any Phase 27 next-action requirement; opening, claiming or
commenting alone does not create such an undertaking. Contact actions require
independent current purpose/channel authority.

Story: US28-F13. Source: finance-stewardship.md. Decision basis: D19 C06/C07/C11/C13/C14; ADR-0183.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-b07ae303406f2d2d4ef9"></a>

## REQ28-R17 — Resume selected preparation

<!-- BEGIN CONTRACT {"id":"b07ae303406f2d2d4ef9","name":"REQ28-R17 — Resume selected preparation"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Resume includes the same preparation in the exact current activation/work context; preserve original author, membership provenance, source facts and Active/Archived state. At most one effective inclusion exists for the same preparation/current context.

Accepted Resume strictly before expiry atomically admits only the selected entry to qualified normal current-work retention and ends applicability of its departure deadline. Retain original deadline/policy/departure history; display that it is now kept under normal current-work rules.

Missing current-work retention qualification rejects admission without cancelling its existing obligation. Viewing, login/reactivation or resuming another entry does not extend the remainder.

Archived entries remain Archived; a clearly labeled Return to active prospects may compose both current inclusion and archive return atomically when both checks pass.

Resume changes no grants, contact verification, sharing, coach rights, task/communication status, subscriptions, connected accounts, gifts or commitments. Old inclusion does not automatically survive ended participation; temporary withholding without ended participation does not require reselection.

Story: US28-R17. Source: relationships.md. Decision basis: D27 C04–C08/C11/C12; D28 C07/C14.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-b25a7170abffc608f171"></a>

## REQ28-F08 — Show qualified progress without inventing finance

<!-- BEGIN CONTRACT {"id":"b25a7170abffc608f171","name":"REQ28-F08 — Show qualified progress without inventing finance"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Every progress comparison SHALL identify a compatible numerator and denominator
with exact scope, Legal Entity, currency, period and basis. It SHALL use complete
qualified source coverage, not a display page or mutable profile counter.
Monthly-equivalent commitments, dated expected occurrences and received money
SHALL remain distinct. Absent, zero, denied or incompatible targets SHALL produce
no ratio. Valid over-goal progress SHALL remain truthful rather than being capped
at 100%. Source corrections update current derived results without rewriting a
dated historical artifact or its goal version.

Story: US28-F08. Source: finance-stewardship.md. Decision basis: D16 C14–C18; P16; P21 D8–D12; P27 F78/F79.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-b2cabb6818a47f940f9d"></a>

## REQ28-R41 — Keep contact work native

<!-- BEGIN CONTRACT {"id":"b2cabb6818a47f940f9d","name":"REQ28-R41 — Keep contact work native"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Add no P28 external contact-update/contactability resource, feed, subscription, producer, dormant connector or contact-sync switch. Do not add automatic export or contact-refresh workarounds.

Existing D5 permissions can withhold editing while preserving independently permitted reads/staff work and source history. No separate D41 master flag.

The independently governed P21/P31 giving feed retains its exact field floor, default-Off/setup/current authorization/stop rules. Giving credentials/cursors cannot request contact enrichment, new methods or writeback; reject unsupported expansion before protected enumeration while valid giving work remains usable.

D17 intake, qualified communication/print/export and other independent purposes keep their own scope. A correction affecting an already authorized giving projection is not external contact sync. Native contact UI promises neither pending external synchronization nor “nothing ever leaves Asym.”

Story: US28-R41. Source: relationships.md. Decision basis: D41 C01–C05/C09/C11/C12/C16; D5; D17; P21/P31/ADR-0097.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-b3683367c98eb16289e0"></a>

## REQ28-M01 — Control the exact public signup entry

<!-- BEGIN CONTRACT {"id":"b3683367c98eb16289e0","name":"REQ28-M01 — Control the exact public signup entry"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Use the current exact-Page contributor/source capability, P22/P23 typed
  placement and existing publication/review workflow. Subject/spouse/coauthor,
  Ministry/Support Assignment or CRM access alone grants no Page mutation.
- New entries are not inferred On from a published Page, Resend connection, old
  Request button or legacy contacts. On needs deliberate choice, current
  readiness and normal release. Show Saved/awaiting review separately from Shown.
- Page-entry Off immediately stops new source intake through that entry,
  including cached forms/direct requests and stale publication candidates. It
  does not publish/unpublish the Page, change reach, remove consent, block
  independently permitted issue sends or replace signup with external Request.
- Display: “Hides signup from this page. Earlier requests can still be confirmed
  before they expire. Existing subscribers are unchanged.”
- Prove both orders of intake/Off, cached form, stale release, wrong Page actor
  and provider outage; no save outcome falsely claims public visibility.

Story: US28-M01. Source: communications.md. Decision basis: D6 selected native signup and exact-Page control; D43 C01–C05/C09; Phase 22/23 placement and release owners.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-b3a094a1ec4e206d7372"></a>

## REQ28-F30 — Record actual receipt with honest incomplete facts

<!-- BEGIN CONTRACT {"id":"b3a094a1ec4e206d7372","name":"REQ28-F30 — Record actual receipt with honest incomplete facts"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The report SHALL be a deliberate attributed assertion of actual organizational
receipt. A promise or a donor saying a check was mailed is insufficient. The form
SHALL distinguish trusted recorder/tenant/acceptance time from asserted receipt
time and precision, reported receiver/holder and accountable next actor. Unknown
donor, amount, currency, intended Legal Entity, allocation or tender details may
remain explicit in a restricted nonfinancial envelope; required source identity
and accountability remain nonnull. A normalized amount requires known validated
currency and precision; unresolved literal information is an assertion, not money.
No fake Party, zero amount, guessed USD, signature, check photograph, bank/card
data, OCR, routine second approval or compulsory essay is introduced.

Story: US28-F30. Source: finance-stewardship.md. Decision basis: D33 C04–C08/C17/C19; P15; P27 F56–F60/F68–F70.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-b74cfcee3566e1d41aad"></a>

## REQ28-R03 — Resolve identity without disclosure

<!-- BEGIN CONTRACT {"id":"b74cfcee3566e1d41aad","name":"REQ28-R03 — Resolve identity without disclosure"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Names, email, phones and shared addresses are evidence, never universal person keys or automatic merge instructions. Qualified authorized canonical identity may be reused without retyping.

Establish minimum candidate/result authority before exposing an existence-dependent branch. Hidden matches cannot alter disclosed counts, suggestions, detail links, result shape or repair routes into an existence signal.

A blocked canonical admission does not masquerade as an accepted staff share; ordinary restricted assertions remain usable where source rules permit. Do not create a second P27 enrollment for the same continuing purpose merely to avoid matching.

Relevant retained/archived records participate in authorized source resolution even when absent from the active list; matching does not automatically unarchive or merge private histories.

Story: US28-R03. Source: relationships.md. Decision basis: D1 C03/C12; D2 C05/C06; D4 C04; D17 C05/C06; P4 identity owner; CRM Core identity/merge requirements.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-b7a3017fa48cc338f8b6"></a>

## REQ28-Q15 — Exact money, dates and deadlines

<!-- BEGIN CONTRACT {"id":"b7a3017fa48cc338f8b6","name":"REQ28-Q15 — Exact money, dates and deadlines"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Money SHALL preserve the authoritative integer-minor-unit or exact fixed-scale
decimal representation, currency and supported precision. Floating-point
comparison or a universal two-decimal assumption SHALL not determine business
facts. Source-owned financial periods and half-open instant bounds SHALL remain
exact. Date-only values, actual occurrence time, recorded time and authorization
instants SHALL remain distinct. New-referral calendar rules, continued-referral
instant rules and confirmation deadlines retain their exact adopted contracts.
Device clocks, localization, retry, resend, delayed entry or a later policy
change SHALL not implicitly renew existing authority. Expiry SHALL be enforced
at the source decision after lock waits, not by a cleanup scheduler or stale
transaction-start timestamp.

Story: US28-Q15. Source: proof.md. Decision basis: Ratified completeness C11/C17; D28/D38/D39 and adopted newsletter timing; canonical money and source-period owners.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-b968e569e3cd603b978f"></a>

## REQ28-F17 — Correct grouped work without erasing independent obligations

<!-- BEGIN CONTRACT {"id":"b968e569e3cd603b978f","name":"REQ28-F17 — Correct grouped work without erasing independent obligations"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Source corrections SHALL affect only dependent unhandled automatic reasons or
members. Independent promises, actual interactions, human dispositions and
historical financial evidence remain. A qualified correction may restore an
originally live unconsumed gift-purpose under current eligibility; replay,
historical reclassification or a criterion change alone cannot restore handled
work. Conditional Undo SHALL resolve the current compatible group and preserve
correction lineage rather than reopening a second current copy. If this viewer
has no remaining authorized actionable work, their queue projection SHALL clear
without claiming hidden work is terminal.

Story: US28-F17. Source: finance-stewardship.md. Decision basis: D20 C08/C11/C12; D21; D32.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-ba60adb4844a0f3284f8"></a>

## REQ28-F16 — Complete exactly the reviewed gift members

<!-- BEGIN CONTRACT {"id":"ba60adb4844a0f3284f8","name":"REQ28-F16 — Complete exactly the reviewed gift members"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

A disposition SHALL bind a nonempty definite inspectable set of member identities,
material source/dependency revisions, purpose, responsibility, completion
authority, intended outcome and semantic intent. The server SHALL revalidate that
scope. A material selected change rejects the whole new disposition without
partial coverage; unrelated additions neither invalidate unchanged reviewed work
nor become handled. Exact coverage, history, receipt and residual task state SHALL
commit atomically. Same-intent recovery returns the original result rather than
reevaluating today's group. Hidden/unloaded members SHALL not be silently selected
or disclosed through residue counts.

Story: US28-F16. Source: finance-stewardship.md. Decision basis: D20 C06–C10/C17; D32.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-ba6b8f0051677995c0cf"></a>

## REQ28-Q25 — Real-source security and failure qualification

<!-- BEGIN CONTRACT {"id":"ba6b8f0051677995c0cf","name":"REQ28-Q25 — Real-source security and failure qualification"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Qualification SHALL exercise actual role/grant/RLS/function/storage boundaries
and privileged source paths in an isolated disposable environment, with both
allowed and denied actors. At least two real concurrent database sessions SHALL
challenge source races; serialized synthetic histories alone are insufficient.
Real qualified Auth proof SHALL be distinguished from demo bypass, locally
auto-confirmed signup, administrative confirmation and user-editable metadata.
Public confirmation SHALL exercise the existing P17 generic inert doorway,
fragment handoff, deliberate same-origin proof submission and qualified review,
including current authority and original deadline. Provider-contract tests
SHALL challenge ambiguity, duplicate/out-of-order events, delayed dispatch,
current suppression and terminal effects without sending real user messages
from unit tests. Research scripts or documentation validation SHALL not be
represented as application qualification.

Story: US28-Q25. Source: proof.md. Decision basis: Confirmed supporting test seams; ratified completeness C08/C13–C16/C18/C20; D42/D43 and P17 protected actions.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-bb1d2e0c955ec5c12bdb"></a>

## REQ28-Q19 — Real capability readiness and bounded dependencies

<!-- BEGIN CONTRACT {"id":"bb1d2e0c955ec5c12bdb","name":"REQ28-Q19 — Real capability readiness and bounded dependencies"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Every required journey SHALL name its real producer, command/projection,
compatible version, owner and readiness evidence. A configured setting, issue
title, generic sender or roadmap phase SHALL not qualify a producer. Missing
source readiness SHALL block only the affected effect with honest permitted
feedback; the required outcome remains in scope. D48–D50 settle C-01/E7 policy;
their publication SHALL not qualify the actual correction command, attribution
producer or coherent coverage adapter. Technical qualification SHALL implement
that settled meaning rather than invent another policy. Optional future products SHALL not become blanket prerequisites for
already qualified native work. A direct provider/table bypass or parallel source
SHALL not be used to hide missing readiness.

Story: US28-Q19. Source: proof.md. Decision basis: Ratified completeness C01/C07/C16/C20; P6/P17 producers; D48–D50 settled correction/attribution policy and remaining owner implementation/adapter qualification.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-bb83d1bbb814dca87ed5"></a>

## REQ28-F15 — Group compatible special gifts in one current task

<!-- BEGIN CONTRACT {"id":"bb83d1bbb814dca87ed5","name":"REQ28-F15 — Group compatible special gifts in one current task"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

There SHALL be at most one current compatible special-gift task for the same
Tenant, Legal Entity, typed subject, qualified follow-up Party, completion
authority and accountable responsibility scope. Each business contribution,
Party, subject and purpose SHALL have separate stable membership; multiple lines,
reasons, recognition paths, source revisions or deliveries do not multiply it.
Distinct equal-value/date gifts remain distinct. Shared tasks own membership and
reviewed disposition; Phase 28 owns purpose admission, not a second task ledger.
An old task surviving only for an independent undertaking does not automatically
remain the current special-gift group.

Story: US28-F15. Source: finance-stewardship.md. Decision basis: D20 C01–C05/C09; D21.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-be816166624e1b8bb4f1"></a>

## REQ28-F23 — Freeze the amount rule at its proper live boundary

<!-- BEGIN CONTRACT {"id":"be816166624e1b8bb4f1","name":"REQ28-F23 — Freeze the amount rule at its proper live boundary"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The source SHALL capture the relevant policy at the first owner-certified eligible
live received/support boundary independently of threshold success and worker or
recognition delay. A first genuine finality event may establish that boundary;
late processing of already eligible money does not. Changed thresholds apply
prospectively. Off or removal of one currency ends that unadmitted interval;
accepted intents and source-qualified correction of originally admitted,
unconsumed work retain their original rule. Re-enabling never revives an old held
or Off cohort. Conclusively invalid corrected reasons are withdrawn; uncertainty
is not zero and handled coverage does not restart.

Story: US28-F23. Source: finance-stewardship.md. Decision basis: D22.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-bff291759e9f030958b7"></a>

## REQ28-R38 — Author an optional starting guide

<!-- BEGIN CONTRACT {"id":"bff291759e9f030958b7","name":"REQ28-R38 — Author an optional starting guide"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Edit title/introduction/suggested content/order and approved destinations; begin blank or from original editable examples. No method, step count, script, quota or outcome is compulsory. Publish requires at least one nonempty audience-safe suggestion.

Each suggestion may contain advice without links, at most one approved resource reference and at most one registered existing workspace entry. No arbitrary internal route/record-ID/mutation payload/script/HTML or separate external-link catalog.

Staff review exact audience safety and rights to resources/material. No copying private record context, restricted commercial curricula or source metadata into a broader guide; no automatic semantic-classifier promise.

Save draft does not offer or modify the live revision. Preview/publish use current curation authority and expected base; Publish changes accepts one coherent whole revision atomically with minimal effect evidence.

Story: US28-R38. Source: relationships.md. Decision basis: D37 C02/C04/C05/C07/C09/C10; P28 guide owner, resource publication owner/P29 custody/P12 access.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-c0d5307115a98a532996"></a>

## REQ28-Q13 — Concurrency and correction preserve intent

<!-- BEGIN CONTRACT {"id":"c0d5307115a98a532996","name":"REQ28-Q13 — Concurrency and correction preserve intent"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Consequential commands SHALL bind the expected source state/revision or an
equivalent qualified conflict mechanism and serialize the relevant invariant
at authoritative acceptance. A prior UI permission check is not sufficient.
Contact edits SHALL apply only deliberately changed permitted fields, keeping
absent and deliberately cleared values distinct. A stale full-form save SHALL
not overwrite unrelated newer changes or invent a country or identity value.
Withdrawal, revocation, permission loss, source correction and configuration
changes SHALL be checked at the applicable owning boundary; later changes do
not erase previously lawful history or authorize a replay.

Story: US28-Q13. Source: proof.md. Decision basis: Ratified completeness C02/C08/C13/C14; D5 contact correction; source-owned revision and revocation contracts.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-c273a3132299f58b7cde"></a>

## REQ28-M36 — Preserve protected editor structure

<!-- BEGIN CONTRACT {"id":"c273a3132299f58b7cde","name":"REQ28-M36 — Preserve protected editor structure"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Keep footer/identity/unsubscribe nodes, tokens, media, fixed facts/quote blocks
  and link destinations outside generation; preserve identity/order/multiplicity.
- Use a qualified neutral semantic editor port, not raw DOM offsets or string
  matching. Unsupported boundary crossing gives useful selection guidance.
- Treat output as bounded validated prose/source structure, not HTML, new URLs,
  executable tags or personalization directives. No tool/browse/fetch/memory path.
- Initial selection ≤8,000 Unicode scalar values and ≤32,000 UTF-8 bytes;
  candidate ≤16,000 scalar values and ≤64,000 bytes. Reject oversize/truncated/
  structurally invalid output, never silently trim. Separately bound all provider
  billable tokens/instructions/reasoning; character length is not a cost estimate.

Story: US28-M36. Source: communications.md. Decision basis: D18 C06/C13 including ratified Unicode-scalar/UTF-8 bounds; neutral semantic editor contract.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-c27be69e151d8e17ffef"></a>

## REQ28-C05 — Prepare from a bounded portfolio of authorized subjects

<!-- BEGIN CONTRACT {"id":"c27be69e151d8e17ffef","name":"REQ28-C05 — Prepare from a bounded portfolio of authorized subjects"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The portfolio shall enumerate only currently admitted subjects within the active organization. A person, ministry/support assignment, Ministry Project, team, page and roster are distinct concepts; membership in one shall not silently expand another.

Story: US28-C05. Source: coaching-resources.md. Decision basis: D8 portfolio and canonical-subject requirements; D9 independent summary modules; P9 subject ownership.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-c55c6eb0e21f6a565901"></a>

## REQ28-M15 — Review the exact eligible audience

<!-- BEGIN CONTRACT {"id":"c55c6eb0e21f6a565901","name":"REQ28-M15 — Review the exact eligible audience"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Resolve positive exact-purpose membership, selected scope and disclosure
  before search/count/preview/export. Unknown eligibility is not zero; zero
  disables Send with permitted repair.
- A confirmed guest uses the qualified P6 `native_newsletter_membership`
  recipient branch: exact same-Tenant/newsletter membership id/revision bound
  to this authorized issue occurrence and sealed audience member, with no
  Party/contact or confirmation authority. Preparation, attempt admission and
  body-free history preserve that branch and frozen destination revision;
  current withdrawal or restriction narrows unstarted work. Membership alone
  never authorizes an issue, and signup creates no Party to satisfy transport.
- Seal the reviewed recipient/destination ceiling, revision, permissible source
  basis and digest. Shared mailbox deduplication/personalization must preserve
  person identity and never expose another person's facts.
- Later signups/live segment matches do not enter the issue. Later restrictions
  narrow; changed contact addresses never silently retarget accepted mail.
- Per-recipient copies and hidden exclusion reasons remain private; no browser
  To/CC/BCC/query is authority to expand.

Story: US28-M15. Source: communications.md. Decision basis: D7 C07/C09/C12; Phase 3 positive authority and Phase 6 frozen recipient intent/current narrowing.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-c9ff448f0bd4083f9e50"></a>

## REQ28-F18 — Confirm donor-stated additional-support purpose

<!-- BEGIN CONTRACT {"id":"c9ff448f0bd4083f9e50","name":"REQ28-F18 — Confirm donor-stated additional-support purpose"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Authorized staff and missionaries, when the organization grants the exact
capability, MAY confirm an explicit donor or authorized representative statement
that an eligible positive received gift or exact portion is additional support.
The capability SHALL be distinct from task editing, gift reading, financial
mutation and interaction authorship. One deliberate contextual Save SHALL record
and confirm minimal attributable evidence; no routine second reviewer, private
message body, essay or new checkout question is required. Qualified structured
instructions or a truthful authorized recorder attestation SHALL bind source,
Party/representative standing, method, occurrence precision, recorder and relevant
revisions. This assertion grants no financial allocation or contact authority.

Story: US28-F18. Source: finance-stewardship.md. Decision basis: D29.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-cb608b5737582df715fd"></a>

## REQ28-R35 — Recover continuation safely

<!-- BEGIN CONTRACT {"id":"cb608b5737582df715fd","name":"REQ28-R35 — Recover continuation safely"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Unknown response offers current-authority recovery of original intent. Accepted retry returns original performer/terms/endpoint; it cannot consume a later expired cycle or compute another deadline.

A definitive rejection remains no-effect even if policy later returns or time makes the referral eligible; fresh intent requires fresh deliberate action. If qualified recovery evidence has expired, reject safely without re-executing.

Distinguish accepted earlier outcome from current state after another expiry, correction or continuation. Recovered success does not mean Active now. Current disclosure may withhold fields without rolling back accepted business truth.

Stale expiry work targets exact cycle/end/revision and cannot end its successor. Reconnection does not queue automatic new privileged work.

Story: US28-R35. Source: relationships.md. Decision basis: D35 C08/C09/C15; D36 C09/C10/C14; D39 C10/C14.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-cc89929063c0f5d19d4b"></a>

## REQ28-M16 — Preview and test safely

<!-- BEGIN CONTRACT {"id":"cc89929063c0f5d19d4b","name":"REQ28-M16 — Preview and test safely"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Inert preview uses actual saved structure, sender/reply, subject/footer/link
  representation and safe sample personalization, with plain text available.
- Real test is explicitly labeled as real mail to an access-confirmed qualified
  reviewer whose current authority permits the actual draft disclosure.
- No arbitrary destination receives live subscriber fields; production
  unsubscribe/protected response actions are inert in tests. Test creates
  operational evidence, not a Party/business send or engagement event.
- Identify tested content revision. A successful test does not prove audience
  readiness or delivery to every subscriber; preview remains useful if tests fail.

Story: US28-M16. Source: communications.md. Decision basis: D7 C08; Phase 17 preview/test source qualification and Phase 6 operational evidence.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-cd45e8ebc72a2b56411f"></a>

## REQ28-Q12 — Durable effects and atomic required handoff

<!-- BEGIN CONTRACT {"id":"cd45e8ebc72a2b56411f","name":"REQ28-Q12 — Durable effects and atomic required handoff"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Every mutating intent SHALL have a source-owned durable effect identity scoped
to its exact tenant, purpose and business occurrence. Retrying the same intent
SHALL recover its permitted result without applying it again or overwriting a
newer correction; a different normalized intent reusing that identity SHALL
conflict. A fresh HTTP key alone SHALL not establish a new human instruction.
The source transition, required acceptance/history and required downstream
intent SHALL commit atomically or through the owning source's already qualified
durable recoverable mechanism. Best-effort callbacks SHALL not be the only
record of required work. Independent source actions composed in one screen
SHALL not be presented as a distributed transaction.

Story: US28-Q12. Source: proof.md. Decision basis: Ratified completeness C08/C13; source-purpose follow-up decisions; D42/D43; P6 durable delivery ownership.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-ce9b710d79a08863bd10"></a>

## REQ28-M32 — Stop sending and remove provider access honestly

<!-- BEGIN CONTRACT {"id":"ce9b710d79a08863bd10","name":"REQ28-M32 — Stop sending and remove provider access honestly"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Stop email immediately fences new local admissions; already admitted effect
  retains possible/known truth. Removing provider access first fences affected
  local purposes and discloses the real shared-grant impact.
- Track actual Google-project/Graph grant relationship. Two OAuth clients are
  not presumed independent; reduced requested scopes are not remote revocation.
  Do not request directory-admin grant powers merely for convenience.
- Calendar-only reconnect does not request mail scopes or reactivate stopped
  mail purpose. Accumulated scopes returned by a shared grant are recorded and
  disclosed accurately but confer no local sending permission.
- No other-Tenant private connection details are disclosed when explaining
  account-wide effects. No reconnect restores old send authority or body.

Story: US28-M32. Source: communications.md. Decision basis: D15 C12; Phase 31 actual provider grant scope and independent local purpose switches.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-d0a6d0dc44f1ccc1a8de"></a>

## REQ28-F37 — Preserve accepted gift campaign attribution

<!-- BEGIN CONTRACT {"id":"d0a6d0dc44f1ccc1a8de","name":"REQ28-F37 — Preserve accepted gift campaign attribution"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

An accepted gift's campaign association, including known no-campaign, SHALL remain
its Phase 13-owned reporting fact when a source code is reassigned. Source-code
mapping changes SHALL be prospective at the qualified producer's authoritative
campaign-association event. Each producer SHALL name that event and distinguish
capture-time source-code facts from an actually accepted campaign association.
Late processing, provider retry, historical import or caller backdating SHALL not
replace accepted association with today's registry. Where no earlier accepted
campaign fact exists, a preview SHALL not be fabricated as historical authority.
Known absence SHALL remain distinct from unknown legacy provenance. Mapping may
change after gifts exist; preservation applies to gift evidence, not a permanent
ban on editing the operational map.

Story: US28-F37. Source: finance-stewardship.md. Decision basis: D49; E7 reconciliation; P13 D14/D13.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-d0c42d63d3ea371bcf4a"></a>

## REQ28-Q20 — Retained-data census and safe migration

<!-- BEGIN CONTRACT {"id":"d0c42d63d3ea371bcf4a","name":"REQ28-Q20 — Retained-data census and safe migration"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Before affected activation, the implementation SHALL inventory reached legacy
records, readers, writers, grants and downstream consumers. Migration SHALL map
them to intended source owners while preserving required identity, provenance,
restrictions, completed evidence and unresolved work. Ambiguous records SHALL
follow an authorized exception/correction path; backfills SHALL not infer
identity matches, consent, mailbox proof, financial facts, completion or role
rights. Validation SHALL include mixed-version reads/writes and explicit
reconciliation of counts and domain invariants, rather than accepting a
successful migration command as sufficient evidence.

Story: US28-Q20. Source: proof.md. Decision basis: Ratified completeness C07/C12/C15/C20; exact source-owner migration and privacy contracts.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-d3659d8d23f1d182d8c0"></a>

## REQ28-C39 — Curate and publish resources intentionally

<!-- BEGIN CONTRACT {"id":"d3659d8d23f1d182d8c0","name":"REQ28-C39 — Curate and publish resources intentionally"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Curatorial capability shall be explicit within authorized staff context, not universal staff power or a new missionary submission queue. Resource-purpose publication owns audience and meaning; document custody owns bytes, versions, integrity, scanning and retention.

Story: US28-C39. Source: coaching-resources.md. Decision basis: D12 selected staff-managed library and reviewed publication/custody safeguards; existing content/document owners.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-d423c87c8432ed3f6452"></a>

## REQ28-R20 — Review an immutable import plan

<!-- BEGIN CONTRACT {"id":"d423c87c8432ed3f6452","name":"REQ28-R20 — Review an immutable import plan"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Preview writes no contact facts and binds exact finalized bytes, selected sheet/header/rows, parser/catalog/mapping versions, purpose/target, proposed effects and relevant revisions. Any change generates a new reviewed plan.

Every candidate row is validated, not merely samples. Keep columns ordinally distinct when headers repeat or are blank; every nonempty column is mapped, explicitly excluded or unresolved.

Conflicting singular mappings, ragged extra cells and merged contact data require correction/exclusion; no silent truncation, last-column-wins or guessed fill-down.

Preserve meaningful Unicode, prefixes and original uncertainty. Do not split couples, infer a country, fabricate lost digits or call imported assertions verified. Warn when numeric cells may already have lost zeros/precision.

Story: US28-R20. Source: relationships.md. Decision basis: D17 C03/C04/C10/C19 and ratified format profile.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-d5541ed07ebaae474f40"></a>

## REQ28-C49 — Prove and operate the complete coaching and resource journeys

<!-- BEGIN CONTRACT {"id":"d5541ed07ebaae474f40","name":"REQ28-C49 — Prove and operate the complete coaching and resource journeys"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following are release requirements, not claims of completed tests. Source qualification, prevention and initial user-journey proof shall precede monitoring. Real accountable people shall be assigned to the named roles before activation.

Story: US28-C49. Source: coaching-resources.md. Decision basis: D8–D10, D23–D26 and D37 proof/monitoring amendments; D46/D47; completeness proof requirements; D12/D13 reviewed engineering qualification.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-d5fd4cb68489fd1bc3f8"></a>

## REQ28-R26 — Dispose private intake material

<!-- BEGIN CONTRACT {"id":"d5fd4cb68489fd1bc3f8","name":"REQ28-R26 — Dispose private intake material"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Originals, filenames, staging, previews, error files and recovery material use private P29 purpose-bound custody, finalized integrity and required quarantine/scan controls. A public image uploader or broad staff File Manager right is insufficient.

Working access/new row acceptance ends seven days after server-recorded finalized upload; reads, edits/retries/jobs do not extend it. Unfinished uploads are separately removed within 24 hours of initiation.

Purge eligible primary raw/derived content within 24 hours after expiry or discard; after the last lawful blocking hold/reference releases, purge within 24 hours. Holds delay physical disposal, not ordinary expiry. Accepted contact facts/minimal receipts use their source schedule; backups have their separate bounded schedule.

Recovery after expiry uses minimized accepted-effect receipts, not expired raw rows. A governed new upload/run may review remaining effects using prior lineage; it cannot renew the old deadline or repeat accepted effects.

Correction artifacts require current export policy and the same custody expiry. Prefer qualified XLSX explicit text cells without formulas/active links; any CSV uses ADR-0212's single shared encoder, quoting/CRLF/BOM and accurate limitations after spreadsheet save/reopen.

Story: US28-R26. Source: relationships.md. Decision basis: D17 C13/C20/C21/C23; P29; ADR-0212.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-d66d6756d9104a501c21"></a>

## REQ28-R37 — Keep referral effects independent

<!-- BEGIN CONTRACT {"id":"d66d6756d9104a501c21","name":"REQ28-R37 — Keep referral effects independent"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Referral work periods are not contact consent, retention, task deadlines, supporter interest, coaching access or finance. Earlier privacy/source restrictions may end an access path without rewriting the window.

Continuation creates no donor response, new introduction, cultivation reopening, send, interaction credit, automatic duplicate task or revival of completed/cancelled work. Independent promised/planned follow-up follows its own source lifecycle.

Referrals to the same Party remain source-distinct. Merge/reassignment neither combines referral occurrences/history nor transfers another person's history rights. A qualified source collision resolves without another fake edge.

D27/D28 preparation retention does not become referral retention; continuing a new source cycle never resets old personal-data retention or restores held-only/erased content.

Story: US28-R37. Source: relationships.md. Decision basis: D34 C07/C08/C13/C14; D35 C10–C12/C16; D36 C11/C17; D39 C12.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-d806fc863a52a2818daa"></a>

## REQ28-F02 — Preserve continuing relationships independently of giving recency

<!-- BEGIN CONTRACT {"id":"d806fc863a52a2818daa","name":"REQ28-F02 — Preserve continuing relationships independently of giving recency"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The native relationship workspace SHALL admit independently authorized continuing
relationships without deriving their lifespan from financial recency. P14's
supports_policy_v2 financial recognition roster remains its own read model and P9's named
supports_policy_v1 remains unchanged. P14 historical inclusion SHALL retain its
own 365/730-day policy, but a historical exclusion SHALL NOT override an
independently qualifying current Phase 16 commitment. Display copy SHALL describe
financial recency neutrally; it SHALL NOT label the person or relationship
“lapsed.” Neither pathway grants contact fields or indefinite data retention.

Story: US28-F02. Source: finance-stewardship.md. Decision basis: Completeness C04; P9 supports_policy_v1; P14 H3/H4/H5.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-ddbc0d7b54a04a675458"></a>

## REQ28-F20 — Offer tenant-controlled one-time-need follow-up

<!-- BEGIN CONTRACT {"id":"ddbc0d7b54a04a675458","name":"REQ28-F20 — Offer tenant-controlled one-time-need follow-up"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

One organization-wide **One-time-need gift follow-up** control SHALL start Off.
There are no per-need, donor, missionary or currency exceptions. Enabling SHALL
use the existing automation-management capability and required preview, inert
test and recorded activation; the ordinary flow presents one understandable Turn
on action. The test SHALL create no real gift, task or outward message. Eligible
positive received gifts or exact portions require a documented donor-accepted
specific bounded need, confirmed through the exact purpose capability by
authorized staff or missionaries when permitted. “One-time” describes the need,
not the payment count, campaign end or default designation. Existing qualified
Request/appeal context is reused where applicable; no invented appeal or universal
need registry is required.

Story: US28-F20. Source: finance-stewardship.md. Decision basis: D30.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-ddf9e7143aa1dba8f7e0"></a>

## REQ28-R14 — Configure finite preparation retention

<!-- BEGIN CONTRACT {"id":"ddf9e7143aa1dba8f7e0","name":"REQ28-R14 — Configure finite preparation retention"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Configure one organization-wide positive whole-day period for this preparation purpose only, with fixed unit, supported limits, current saved value and concise advice to choose the shortest justified period. No per-person/project overrides or universal numeric default is selected.

One preparation-retention day is exactly 24 hours, or 86,400 seconds. This elapsed-duration unit is distinct from the New referral calendar-day rule; settings explain that distinction without adding another unit selector.

Before activation, the source/privacy profile identifies supported finite range, body/derivative scope, departure trigger, ordinary-work rules, required evidence/hold schedules and copy disposal/restore obligations. All layers enforce the same range without zero/blank/negative/overflow/Forever coercion.

A missing/unqualified policy leaves affected new preparation unactivated; independent CRM work continues. It neither purges legacy content nor silently retains it forever. Unknown retained cohorts enter bounded restricted owner assessment with responsible owner and resolution deadline.

Ordinary policy Save is prospective from authoritative acceptance. Previously accepted departure episodes keep their policy/deadline; required legal/privacy corrections use a separate qualified auditable transition. Administration exposes no private body or inventory.

Story: US28-R14. Source: relationships.md. Decision basis: D28 C01–C04/C09/C10/C15/C17.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-dee13a90a0301692e4ce"></a>

## REQ28-F32 — Preserve accepted reports across Off, retries and correction

<!-- BEGIN CONTRACT {"id":"dee13a90a0301692e4ce","name":"REQ28-F32 — Preserve accepted reports across Off, retries and correction"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Policy changes and report admission SHALL share an authoritative acceptance fence.
Off stops new missionary acceptance, including stale forms, but preserves accepted
reports, staff processing and independently permitted reads/corrections/handling.
Accepted report, required history, result receipt and durable accountable work
intent SHALL commit coherently. Same-intent recovery returns an earlier accepted
result even after Off under current read rights; changed payload conflicts. An
Off rejection is a terminal no-effect outcome, never queued for On. An intervening
Off/On cycle requires fresh deliberate review and a new intent for a previously
unaccepted form. Older actual receipts may be deliberately reported while
currently permitted with their real occurrence date. Closing a submitted form is
not cancellation of an accepted or indeterminate command.

Story: US28-F32. Source: finance-stewardship.md. Decision basis: D33 C09–C11/C15/C17/C20/C23.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-df90d4364a301b6e357f"></a>

## REQ28-M37 — Compare and deliberately use one suggestion

<!-- BEGIN CONTRACT {"id":"df90d4364a301b6e357f","name":"REQ28-M37 — Compare and deliberately use one suggestion"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Generation/streaming/preview/failure/discard never changes source. Only one
  complete validated candidate is applicable, with Use suggestion/Discard/Try
  another. No default acceptance, fanout, autonomous publication or sending.
- Use rechecks exact current source/capability/binding/purpose and compare-and-set
  revision/semantic target with permanent command identity. No auto-rebase.
  Accepted replay returns permitted receipt; effective no-change creates no
  forced successor revision. Current denial reveals no old body.
- Continue editing during generation; stale result does not overwrite it.
  Ordinary Undo uses current source-authorized edit, preserves intervening work
  and remains available with AI Off when edit authority survives.

Story: US28-M37. Source: communications.md. Decision basis: D18 C07/C08; conditional source edit and permanent Use command identity.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-e05c7d2687c6da2c5a36"></a>

## REQ28-F31 — Continue the same intake and keep handling separate

<!-- BEGIN CONTRACT {"id":"e05c7d2687c6da2c5a36","name":"REQ28-F31 — Continue the same intake and keep handling separate"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Finance SHALL continue or exactly reconcile the same Phase 15 intake through its
qualified batch/commit path. Lineage SHALL survive splits, moves, carry-forward,
corrections and linking an already-posted result without reposting or reissuing
receipts. Similar amount, name, date or check number is not exact reconciliation.
Independent reports retain separate origins until owner-qualified duplicate
resolution; neither universal one-report/one-header cardinality nor a general
matching engine is presumed. Financial recording, reported possession/transfer,
deposit, clearance, commitment and fulfillment SHALL remain separate. Each
accepted report SHALL have qualified next responsibility or an owned unresolved
exception using existing source work, not a guessed staff audience.

Story: US28-F31. Source: finance-stewardship.md. Decision basis: D33 C12–C16; P27 F61–F67.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-e300e2320d7080b0eb00"></a>

## REQ28-M14 — Reuse eligible Updates and media deliberately

<!-- BEGIN CONTRACT {"id":"e300e2320d7080b0eb00","name":"REQ28-M14 — Reuse eligible Updates and media deliberately"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Insert exact eligible source revisions/provenance through newsletter-specific
  projection. Draft changes do not mutate the upstream Update; upstream edits
  cannot rewrite authorized issue content. Send does not publish a public Page
  or web archive.
- Review titles, subject, alt text, captions, filenames/EXIF, posters, links,
  quoted replies and plain text as well as visible body. Private CRM/care/Support
  content is not laundered through quote, summary or AI.
- Support the actual bounded picture/video job using qualified custody and
  authorized presentation/playback. Do not pretend P22 still-image support admits
  arbitrary animation/audio/docs/video, or expose private media via a public URL.
- Current source/media safety withdrawal fences dependent unsubmitted copies;
  downloaded/received content cannot be recalled.

Story: US28-M14. Source: communications.md. Decision basis: D7 C05/C06/C15; Phase 22/23 media/reuse and Phase 27 D26 protected-source disclosure.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-e345866b392f68bee384"></a>

## REQ28-M05 — Use another address or recover unqualified proof

<!-- BEGIN CONTRACT {"id":"e345866b392f68bee384","name":"REQ28-M05 — Use another address or recover unqualified proof"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- Use another email enters the ordinary guest confirmation path without changing
  Auth email, creating a session/account, claiming a Party or granting access.
- Known ineligible proof can use that explicit path; an Auth/authority outage
  cannot silently send confirmation mail or claim active/pending membership.
  Offer deliberate recovery or the ordinary form.
- A→B→A address text does not revive retired revision proof. Subsequent account
  changes do not move subscriptions, rewrite consent or merge people sharing a
  mailbox. Unknown historical proof gets fallback, not fabricated backfill.

Story: US28-M05. Source: communications.md. Decision basis: D42 C02–C04/C09/C11; Phase 4 current subject/address revision and account authority.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-e4f71fa46143c3a6d195"></a>

## REQ28-F35 — Use organization-selected correction approval policy

<!-- BEGIN CONTRACT {"id":"e4f71fa46143c3a6d195","name":"REQ28-F35 — Use organization-selected correction approval policy"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Phase 13/12 SHALL own the applicable organization policy for staff-initiated
posted-gift corrections. The light new-organization default SHALL not impose a
blanket second approver. Organizations MAY require a different authorized human
generally or for supported categories/qualified amount thresholds through existing
policy capabilities. No arbitrary workflow builder or per-correction bypass is
added. Mandatory money-out/risk controls, exact current financial capabilities,
required reason, immutable history, concurrency and idempotency remain. Required
independence SHALL use canonical human identity; another role, profile or session
does not make the requester a different approver. Authenticated provider/bank
settlement, return or dispute evidence follows its own source correction path
without waiting for staff ceremony.

Story: US28-F35. Source: finance-stewardship.md. Decision basis: D48; P13 D5; P12; ADR-0009/ADR-0206.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-e5241ef2b860be9b3506"></a>

## REQ28-Q09 — Complete and intelligible support information

<!-- BEGIN CONTRACT {"id":"e5241ef2b860be9b3506","name":"REQ28-Q09 — Complete and intelligible support information"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Totals, comparisons, lists and trends SHALL use complete qualified source
projections with explicit tenant/subject, currency, period, coverage, correction
basis and freshness. Loaded pages and display caps SHALL not define totals,
firstness, absence or negative facts. Unknown, incomplete, stale, unavailable,
not applicable and known zero SHALL remain distinct. Received money, recognition,
commitment, forecast, Goal Version, Support Plan and spendable Field Account
information SHALL retain their named owners and meanings. Relationship
continuity SHALL not be inferred solely from a financial-recency band or changed
into a person-level lapsed status.

Story: US28-Q09. Source: proof.md. Decision basis: Ratified completeness C04/C09/C11; D16 goals; P13/P14/P16/P21 financial and recognition ownership.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-e7c6d2d077b6264f92d4"></a>

## REQ28-R43 — Operate and contain failures without weakening source rules

<!-- BEGIN CONTRACT {"id":"e7c6d2d077b6264f92d4","name":"REQ28-R43 — Operate and contain failures without weakening source rules"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

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

Story: US28-R43. Source: relationships.md. Decision basis: D17 operational table; D27/D28 operational thresholds; D34–D39 operational tables; D41 monitored risks; completeness C15–C19. The domain-owner role must have an assigned on-call or operational person before activation. Technical traces, durable accepted business effects and security audit are distinct; broad telemetry contains no private preparation or contact bodies.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-ea56fa4ba72554404a93"></a>

## REQ28-R24 — Cancel or discard intake

<!-- BEGIN CONTRACT {"id":"ea56fa4ba72554404a93","name":"REQ28-R24 — Cancel or discard intake"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Cancel orders against row acceptance, stops future acceptance and reports rows already accepted. Cancellation alone need not discard still-eligible input.

Discard immediately blocks further input/artifact access and acceptance and starts the qualified disposal obligation. Deleting a run/file never deletes contacts.

Any source-qualified undo refuses unsafe reversal after later edits, merges, sharing or independent/immutable coverage and points to the source correction path. D17 does not require a new batch-undo engine.

A kill switch stops new acceptance while preserving durable outcomes; re-enable does not replay history or defeat current erasure dispositions.

Story: US28-R24. Source: relationships.md. Decision basis: D17 C16/C17/C21/C23; D4 deliberate Return; completeness C06/C15.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-ed372df04b78bc486151"></a>

## REQ28-Q03 — Safe context changes with unfinished work

<!-- BEGIN CONTRACT {"id":"ed372df04b78bc486151","name":"REQ28-Q03 — Safe context changes with unfinished work"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Switching SHALL isolate source requests, cache entries, cursors, draft state,
recipient selections and delayed responses by exact admitted context. Saved
preparation remains under its original owner and current permission. Unsaved
work SHALL use applicable save/discard/cancel navigation choices rather than
silently moving to a new context. An accepted in-flight command may finish only
under its original source contract; its response SHALL not populate the new
context. Returning SHALL recover the original accepted result under current
permission before offering a new submission. Signing out or losing the selected
authority SHALL clear unsafe displayed/private state and reject late responses,
including when cancellation cannot stop the network request.

Story: US28-Q03. Source: proof.md. Decision basis: Ratified completeness C02/C08/C12/C14; D27/D28 preparation ownership; current session and cache boundaries.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-ee3eaa1a6f29ddb606d7"></a>

## REQ28-R34 — Continue an eligible referral once

<!-- BEGIN CONTRACT {"id":"ee3eaa1a6f29ddb606d7","name":"REQ28-R34 — Continue an eligible referral once"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Current exact source/cycle responsibility, action permission, ordinary-expiry eligibility, privacy and policy are required. History visibility alone is insufficient; the command admits expired inputs without requiring a fake already-active relationship.

Preview explains Continued period and estimated end date/time/zone. Maya chooses no date and supplies no routine reason/approval/referrer form; source-required prerequisites remain binding. A relevant changed policy, end calendar date or display-zone context requires refreshed review/new deliberate intent, not a second-by-second confirmation loop.

After required ordering/waits, capture fresh trusted database instant A; compute E=A+N×86,400 seconds exactly and atomically accept one new cycle with A/E/N/policy/audit/activity/outcome evidence. Active is A≤now<E subject to other current rules; at E it is expired.

Preserve original introduction/prior cycles. At most one successor consumes an expired cycle across missionary/staff and different transport keys. Accepted result shows actual endpoint and current permitted active projection, not blindly restored old private fields.

Story: US28-R34. Source: relationships.md. Decision basis: D35 C03–C07/C10/C17; D36 C04/C07–C10/C15/C16; D38 C09; P9 A4/A17.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-eebb8504da92813821fb"></a>

## REQ28-F03 — Qualify the exact financial source and audience

<!-- BEGIN CONTRACT {"id":"eebb8504da92813821fb","name":"REQ28-F03 — Qualify the exact financial source and audience"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Every financial projection or follow-up qualifier SHALL resolve the exact Tenant,
Legal Entity, canonical Party, typed Phase 9 Ministry Assignment or Ministry
Project, relevant monetary lines, currency and material owner revisions. A login,
worker name, household, Page, source code, legacy donor assignment or visible list
is not that identity. P14 SHALL supply subject-qualified recognition; Phase 28
SHALL NOT spread header credits across subjects, infer DAF/church members, or add
recognition to legal money. Current privacy and field floors SHALL apply before
enumeration, aggregation, ranking and action eligibility. P14's financial roster
floor does not become a contact directory through Phase 28.

Story: US28-F03. Source: finance-stewardship.md. Decision basis: D19–D22; D29–D33; P13/P14/P16; completeness C04/C05.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-f01b244e95df6d3f52ea"></a>

## REQ28-F28 — Reconcile placement and complete purposes independently

<!-- BEGIN CONTRACT {"id":"f01b244e95df6d3f52ea","name":"REQ28-F28 — Reconcile placement and complete purposes independently"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Current combination policy SHALL govern new and unfinished compatible work through
bounded owner reconciliation, with one active placement per purpose. Keep the
current special-gift anchor; move only unresolved fulfillment placement where
needed. Current policy SHALL fence a joint disposition immediately even while
projection catches up; a stale combine worker cannot override a later Separate
decision. A joint action SHALL bind the exact reviewed purpose/member set and
atomically record separate coverage receipts and resulting residue. Material
selected changes reject the whole new action; unrelated arrivals stay unhandled.
A fulfillment-only residue may stay in its container but SHALL release the current
special-gift grouping slot. Previously accepted dispositions survive later policy
changes. One optional actual interaction may reference explicitly covered
compatible work without inventing separate interactions.

Story: US28-F28. Source: finance-stewardship.md. Decision basis: D32 C06–C13; D20.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-f092782ce055739d65b3"></a>

## REQ28-F04 — Keep incomplete sources honest and independently recoverable

<!-- BEGIN CONTRACT {"id":"f092782ce055739d65b3","name":"REQ28-F04 — Keep incomplete sources honest and independently recoverable"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Automatic financial conclusions SHALL require complete, coherent owner-qualified
coverage for the exact conclusion. A capped list, empty response, stale cached
number, maximum of unrelated cursors or missing match SHALL NOT supply that proof.
Only the affected measure, qualifier or source lane SHALL be held when evidence is
unavailable. Qualified money facts, manual work and unrelated source lanes SHALL
continue. Owner repair SHALL preserve the original live/history cohort and
business identity; processing time is never a new gift date or activation event.

Story: US28-F04. Source: finance-stewardship.md. Decision basis: D16; D19–D22; D31; D40; E7 reconciliation.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-f3c3943ddcc1aa7e3f34"></a>

## REQ28-R22 — Preserve imported contact restrictions

<!-- BEGIN CONTRACT {"id":"f3c3943ddcc1aa7e3f34","name":"REQ28-R22 — Preserve imported contact restrictions"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Imported affirmative subscribed/active/donor flags grant no opt-in, verification, subscription or send authority.

Known negative/ambiguous contactability evidence is not silently ignored, including on reused/previously imported rows. Accept an affected row only when the exact contact/P6 owner atomically accepts scoped restriction/evidence and returns durable authority enforced by actual recipient/D15 gates; otherwise leave the row blocked.

The restriction receipt binds exact Tenant, preparation/recipient/contact revision, source occurrence, channel/list-purpose and provenance. Newsletter-X unsubscribe is not guessed into all-channel suppression, and unrelated independently lawful communication retains its owner meaning.

Import itself sends no message, confirmation, invitation, receipt, notice to the contact or historic trigger.

Story: US28-R22. Source: relationships.md. Decision basis: D17 C08/C09/C11; P6 recipient/contactability authority; D15 consumer gate.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-f8c227059fabfcfce1d1"></a>

## REQ28-F38 — Correct campaign attribution deliberately and independently

<!-- BEGIN CONTRACT {"id":"f8c227059fabfcfce1d1","name":"REQ28-F38 — Correct campaign attribution deliberately and independently"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

A campaign-only correction SHALL be a deliberate Phase 13 append-only operation
with exact selected gift/line scope, current permission, before/after evidence,
required reason and applicable correction-approval policy. It SHALL preserve the
truthful source code and original campaign history; changing a code merely to
force a campaign is not the required correction path. Current effective reports
SHALL include accepted corrections; issued historical artifacts remain immutable.
Campaign correction SHALL not change received money, designation allocation,
recognition, commitment or fulfillment. Existing qualified bulk correction may
retain its per-item outcome semantics; this requirement adds no bulk engine.

Story: US28-F38. Source: finance-stewardship.md. Decision basis: D48/D49; P13 correction ownership; ADR-0206.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-f8c5fa0c02393c93550e"></a>

## REQ28-F21 — Apply one-time-need policy changes prospectively

<!-- BEGIN CONTRACT {"id":"f8c5fa0c02393c93550e","name":"REQ28-F21 — Apply one-time-need policy changes prospectively"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Policy revisions SHALL preserve attributable history and authoritative admission
order. Eligibility binds the first owner-certified live received event and any
first later purpose confirmation within the same enabled interval. Off ends
admission for unadmitted candidates in that interval; accepted purpose intents,
task materialization and qualified repair of their unconsumed reasons survive.
Re-enabling starts a new interval and SHALL not replay an Off interval or
historical gifts. Other independently required reasons and manual work remain
available. Policy uncertainty SHALL not authorize new admission.

Story: US28-F21. Source: finance-stewardship.md. Decision basis: D30 C04–C08.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-f8ff1711c1021462246f"></a>

## REQ28-F06 — Keep one goal authority with truthful units and history

<!-- BEGIN CONTRACT {"id":"f8ff1711c1021462246f","name":"REQ28-F06 — Keep one goal authority with truthful units and history"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

A logical goal SHALL have one authoritative head and immutable attributed
versions. Its identity SHALL distinguish exact subject, purpose, currency and
goal/period meaning. Recurring support and special-purpose goals may coexist;
one shared project does not gain a separate authoritative goal per member.
Campaign/Designation goals SHALL remain Phase 13-owned rather than being copied
to enable missionary editing. Newly entered amounts SHALL be positive, finite,
within the qualified supported range and exactly representable in that currency.
Blank, end, absence and legacy zero SHALL remain distinct. Ordinary edits are
prospective at acceptance, with no implicit backdating, proration, currency change
or scheduled adjustment.

Story: US28-F06. Source: finance-stewardship.md. Decision basis: D16 C06–C10; ADR-0208; P13 campaign goals; P21 planning.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-fa5dbd6cb4b30ea506b7"></a>

## REQ28-F22 — Configure an optional inclusive amount rule

<!-- BEGIN CONTRACT {"id":"fa5dbd6cb4b30ea506b7","name":"REQ28-F22 — Configure an optional inclusive amount rule"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

One organization-wide amount-based rule SHALL initially be Off with no suggested
threshold. Staff MAY configure one positive exact supported threshold per
qualified currency through existing automation-management controls. A currency
without a configured amount SHALL supply no amount reason. There are no donor or
subject overrides, FX comparison, cumulative-history threshold or percentage rule.
Qualification SHALL use **greater than or equal to** the threshold against one
contribution's exact Party/subject/currency scope: qualified relevant monetary
allocations excluding fee-cover and unrelated support, before processor fees or
Field Account assessments, after effective monetary corrections; or the exact
P14-certified subject-recognition basis backed by that eligible money. Those
lenses SHALL never be added or arbitrarily prorated from a header credit.

Story: US28-F22. Source: finance-stewardship.md. Decision basis: D22.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-fdef3eba6f6fb0b74cc1"></a>

## REQ28-F44 — Qualify source lanes, migration and measurable operation

<!-- BEGIN CONTRACT {"id":"fdef3eba6f6fb0b74cc1","name":"REQ28-F44 — Qualify source lanes, migration and measurable operation"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

Each affected source lane SHALL activate only after its real producer, exact
owner adapter, authority/fence, coherent revision contract, semantic uniqueness,
history baseline, alternate-path closure, failure recovery and composed user
journey are qualified. Existing examples, static migrations and finite models do
not prove deployed behavior. Source ownership and product semantics above are
settled; missing producer evidence creates a bounded implementation/proof task,
not a new product-policy choice or a permanent omission of required reporting.
Migration SHALL inventory legacy units, counters, assignments, task history and
source provenance; backfill only proved facts without retrospective task floods,
fabricated campaign attribution or guessed opt-in. Mixed versions and restore
SHALL preserve current restrictions and consumed identities. Kill switches fence
unsafe admission while retaining lawful accepted work and staff recovery.

Before activation, each owner SHALL publish numeric payload/page/batch/retry
ceilings and query/command/recovery budgets with units, measured on realistic
skewed tenant workloads, and prove below/at/above behavior. Implementations SHALL
use bounded indexed reads/reconciliation and tenant-fair backpressure; they SHALL
not scan full history per visible card, silently truncate evidence or drop tiny
eligible gifts to meet capacity. Named maintainers SHALL own the adopted signals
below through existing operational/support channels. Monitoring is not a substitute
for prevention of known authorization or integrity defects.

Story: US28-F44. Source: finance-stewardship.md. Decision basis: D16; D19–D22; D29–D33; D40; D48–D50; E7 reconciliation.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-ffae4d1bbb745695fd77"></a>

## REQ28-M04 — Join with a current qualified verified account address

<!-- BEGIN CONTRACT {"id":"ffae4d1bbb745695fd77","name":"REQ28-M04 — Join with a current qualified verified account address"} -->

The system SHALL satisfy this contract and the common safeguards in the canonical specification.

The following behavior is required.

- A ready private view shows the exact current address, named newsletter, one
  Join/Rejoin action and Use another email; no repeated name/email or second
  consent dialog. Login alone never subscribes.
- Server validates current Supabase principal/session, accepted authenticator
  and P4 mailbox provenance for the exact subject/address revision. A profile
  email, cached JWT, cached session state, generic callback, administrative/autoconfirm
  timestamp or arbitrary linked identity is insufficient.
- Before immediate Join is enabled, the shared Auth owner must qualify an actual
  ordinary native mailbox-verification producer and its exact challenge,
  destination and redemption evidence. Keep only necessary proof/current-revision
  facts in application-owned private identity scope; do not add newsletter
  identity truth or custom objects to the managed Auth schema. Provider evidence
  qualifies only through its separately admitted P4 lane, with applicable
  A10/G01 gates preserved. Prior mailbox proof cannot admit an otherwise
  unqualified authenticator and is not fresh possession or donor-claim proof.
- Immediate Join is genuinely implemented for that ordinary qualified native
  proof lane; permanently forcing every reader through email fails D42.
- A qualified public reader needs no target-tenant staff/donor membership, fake
  profile or fifth P12 context. Impersonation/view-as cannot supply the reader's
  instruction. Public read projection remains read-only; the canonical source
  command admits the exact self action.
- Prove current-address/session/policy/restriction changes serialized at acceptance,
  including direct native Auth mutation. An identity read followed by an unrelated write
  or asynchronous invalidation does not prove this boundary.

Story: US28-M04. Source: communications.md. Decision basis: D42 C01–C05/C15; Phase 4 accepted mailbox/authenticator proof and Phase 12 public-reader boundary.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
