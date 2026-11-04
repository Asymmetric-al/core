# Imports & Migration (Phase 30)

Language for moving an organization's records into Asym from a previous system, starting with SiteStacker. Phase 30 owns transport, staging, mappings, plans and import-run evidence; target owners keep every business rule (`docs/prds/sitestacker-parity/roadmap.md:4377`). Root `CONTEXT.md` terms still govern; terms here are specific to migration.

## Switching systems

**Switch**:
The one planned transfer of supporter and history authority for one Tenant from one source installation to Asym, through one Source profile, recorded with its source declaration, boundary, manifests, runs, attestations, reconciliation sign-offs, declared external executors and tail closure. A SiteStacker Switch is a Switch using the SiteStacker profile. It never moves a recurring executor; that is a Phase 16 formal cutover.
_Avoid_: cutover (collides with Posting Ownership Cutover, Field Account Operational Cutover and Phase 16 formal cutover), migration complete, big bang

**Switch lead**:
The ministry member named on a Switch as its accountable contact, who receives its notices and reminders. Defaults to the member who created the Switch and can be reassigned. The designation grants nothing: each decision is made by a ministry member holding that decision's capability.
_Avoid_: Switch owner (collides with Phase 12's Owner group), switch operator, migration admin

**Asym help access**:
The ministry-approved, time-limited, revocable access that lets one named Asym specialist do preparation work (mapping, practice runs, issue triage, proposals) on one Switch, with every action attributed to them. It never decides, commits, attests, sends, touches files or grants access. Internally it is the Phase 12 Operator Tenant Grant for `switch_preparation`.
_Avoid_: support login, impersonation, admin access, operator grant (to ministries)

**Switch Boundary**:
The recorded half-open UTC instant, shown in the Tenant's giving time zone and by default the first moment of a civil date, that classifies source facts as pre-switch history or post-switch legacy facts for Phase 30 import only. It never sets or implies a Phase 16, 20 or 21 boundary.
_Avoid_: freeze, cutoff date, midnight, date-only go-live, universal external freeze

**Editing pause**:
The ministry's attested action of stopping staff edits in the source system and setting each legacy surface to its recorded state around the Switch Boundary. Asym records it but cannot enforce it.
_Avoid_: freeze, lock, read-only SiteStacker

**Switch live**:
The state in which supporter and history authority has moved to Asym at the Switch Boundary.
_Avoid_: migration complete, done

**Switch closed**:
The state in which every legacy executor is proved stopped, formally cut over or ended, and the Legacy Recurring Tail is closed. Decommission sign-off is a separate, later checklist.
_Avoid_: fully migrated, done

**Minimum Switch Kit**:
The source families that must all be committable through their owners' import commands before a switch can be scheduled: Parties and households; contact points with consent and suppression evidence, including the final export of every audience in the ministry's email tool; one-time giving history including reversals; recurring evidence for the Phase 16 classifier.
_Avoid_: MVP import, core data

**Practice run**:
A staged rehearsal of a whole Switch in the live tenant's import area: every family planned together from one set of exports, each area checking rows without saving, with counts, both reconciliation levels and an issue list. It writes nothing to live records.
_Avoid_: dry run (per file), test import, trial migration

**Practice copy**:
A short-lived copy of one ministry's account in the Practice environment, into which a Practice run is committed through the real import commands so staff can click through it and its timings and mismatches can be measured. Never promoted; destroyed within its lifetime.
_Avoid_: sandbox, test tenant, staging tenant, clone

**Practice environment**:
The separate, Approved environment that holds Practice copies: production's release, region and size, with no live credentials, public routes, donor or missionary apps or sign-up, and outgoing email captured in a Practice outbox.
_Avoid_: sandbox, staging, preview, development

## Source coverage

**Source profile**:
The named way Asym reads one kind of source for a Switch: in the first release, the SiteStacker profile or the template profile. Each profile has its own Source profile status.
_Avoid_: connector, integration, adapter (Phase 31 and CMS usage)

**Direct support**:
The source tier in which Asym ships a named Source profile with presets, an export checklist and an omissions sheet. In the first release only SiteStacker has it.
_Avoid_: certified, native integration, compatible

**Reviewed transformation**:
The source tier in which the ministry or its helper brings any other system's data through Import templates, mapping columns at upload, under the same Switch rules. Asym qualifies the template format, never the vendor.
_Avoid_: supported vendor, generic import (as a promise), DIY migration

**Import template**:
A per-Tenant download for one record family, generated from the field catalog and owner template descriptors; XLSX with text-typed ID, date, postal-code and phone columns is preferred and CSV is accepted. Every row carries a stable source ID.
_Avoid_: vendor preset, starter template, sample file

**Remembered mapping**:
A confirmed column and value mapping kept for one Tenant and one source, reused only when a later file's headers match exactly and still shown for one-click confirmation. Each plan records the mapping version it used. Never shared between ministries.
_Avoid_: saved template (in vendor sense), learned mapping, preset

**Common-header list**:
Asym's own list of header names common in other systems' exports, written from vendor documentation and fake-record exports, used only to suggest column matches. Never learned from ministries' files and never a preset or support claim.
_Avoid_: alias pack, supported-vendor list, AI suggestions

**Value-mapping table**:
The step that lists each distinct value of a code column (gift types, payment methods, funds, campaigns, statuses, restriction codes) with its count, for the ministry to map to an existing Asym option or leave out. Unknown values are rejected by default.
_Avoid_: lookup import, picklist sync

**Visible exclusion**:
A ministry-accepted gap in what a Switch carries, shown with its reason, and for history with its Coverage start. It is never silent loss.
_Avoid_: skipped, dropped, not migrated

**Coverage start**:
The declared earliest date from which a history family is complete for a Switch. Conclusions that need earlier history (first gift, lapsed, first support) stay blocked rather than guessed.
_Avoid_: import start date, history cutoff

## Source evidence and identity

**Source Snapshot Manifest**:
The sealed set of export files for one Switch, each recording its byte identity, filter or partition, exporter role, source version, export times and on-screen control counts. The final manifest is taken after the Switch Boundary and may contain several files.
_Avoid_: the final export (as one file), snapshot (unqualified), file hash as identity

**Source Record Binding**:
The append-only link from (Tenant, environment, source system, installation or provider account, mode, record family, source ID, role) to an Asym target. One source row may bind several targets by role (person 1, person 2, household, organization, contact); a source household binds as its own record family. It follows Phase 4 survivors and blocks re-creation after erasure; replay and convergence rest on it, never on a file digest or manifest.
_Avoid_: source binding (Phase 21 usage), external ID as identity, provider ID as identity, execution binding (Phase 16)

**Imported household**:
A household Party created only from explicit source evidence: a source household ID shared by two or more people, or the template's Person 2 or Household ID columns. Its membership starts before the Switch Boundary with the date unknown, so historic gifts show household recognition; its head is the primary for mail and display only, never the legal donor. Households of one are not created.
_Avoid_: family account, joint donor, household of one

**Combined-name record**:
A person imported from one name field that names two people, such as "John & Mary Smith", flagged "may be two people". Asym never splits it; the ministry fixes it at the source before the final export, or staff rename it and add the spouse after the switch, leaving the gifts on the original record.
_Avoid_: joint donor, couple record

**Shared mailbox**:
The state of a person whose source email is held by another person in Asym, because Asym allows each email on one person. Shown as "shares a mailbox with {name}"; the address is kept as evidence, and an email match against it always goes to review.
_Avoid_: duplicate email, secondary email

**Exact repeat import**:
Re-submitting the same sealed Source Snapshot Manifest under the same mapping; it recognizes prior work and writes nothing. Any other snapshot converges on Source Record Bindings.
_Avoid_: refresh import, upsert, re-import update

## Evidence and qualification

**Synthetic evidence**:
A test artifact authored by Asym. It informs design and fixtures but never qualifies a source profile or the release gate.
_Avoid_: sample export, representative fixture

**Vendor-format sample**:
An artifact produced by a real source installation or its vendor that contains no real person or gift data, such as a fake-record export, a zero-row or header-only export, a pasted header line, or a vendor sample. It informs design but never qualifies a source profile.
_Avoid_: real export, synthetic fixture

**Representative real export**:
A ministry's real data exported under an agreement with data-processing terms into qualified custody in an Approved environment. It is the only evidence class that can qualify a source profile.
_Avoid_: production sample, test export

**Source profile status**:
The qualification state of a source export profile: _Unavailable_ until representative real evidence runs; _Pilot-qualified_ when a design partner's real export passes practice runs; _Supported_ when that pilot switch has gone live with reconciliation signed off and recovery exercised, scoped to the export surfaces, versions and exporter permissions actually exercised.
_Avoid_: beta, certified, compatible

**Design partner**:
The named first ministry for a source profile, switching on pilot terms; its live switch is the release's representative migration.
_Avoid_: beta customer, test tenant

**Approved environment**:
An environment a named approver who did not build it has confirmed, by live read-back, as fit to hold real personal data: current migrations, no anonymous or unscoped read policy on person or money tables, qualified staff-migration custody, no destructive script defaulting to it, recorded real-data status and recorded hosting region.
_Avoid_: production (as a synonym), secure environment

**Discovery declaration**:
The two-tier, no-personal-data questionnaire a prospective ministry completes before any real export; it is not the readiness census taken before the first practice run.
_Avoid_: census, intake form

**Evidence register**:
The private, per-artifact record of discovery evidence (class, installation pseudonym, source version, export surface, filter, exporter permission group, on-screen count, encoding readout, screening result, state and disposal).
_Avoid_: evidence folder, sample library

## Consent and restrictions

**Imported restriction**:
A block carried from a previous system or the ministry's email tool. It commits before any permission and keeps its source field, original value and date. Its scope follows what the signal means: the person, an address, a channel, a list, or appeals only. Only the person's own later action lifts it.
_Avoid_: suppression (reserved for `email_suppressions` types), opt-out flag, migrated unsubscribe

**Email list disposition**:
The one choice recorded at go/no-go for each ministry email list in the old system or its email tool: Move to Asym, Keep in the email tool, or Retire. A list is never sent from both.
_Avoid_: list sync, list migration

**Adopted email permission**:
An Asym permission created from a person's membership of a moved list. The person must not have withdrawn, the list must have been sent to within the 12 months before the Switch Boundary, and the evidence must meet the rule for where the person lives. It keeps its evidence and starts on Adoption hold. Missionary newsletter memberships adopted this way show "Joined in {previous system}".
_Avoid_: imported consent, migrated subscription, permission (bare; collides with root `Permission`)

**Consent adoption disposition**:
The published record for each moved list. It holds the list's mapping to an Asym target, its meaning, its last-sent date, its evidence rule and the Switch lead's attestation, together with each person's outcome: adopted, evidence only, held as stale, or blocked.
_Avoid_: Adoption Disposition (the Phase 22 public-ministry term), consent import

**Stale list**:
A list not sent to in the 12 months before the Switch Boundary. Its people are held, not adopted.
_Avoid_: inactive list, dormant subscribers

**Adoption hold**:
The starting state of every Adopted email permission. No optional message may reach the person until the purpose × channel check and every optional sender honor adopted permissions; sending then follows the warm-up rules.
_Avoid_: pending consent, quarantine

## After the switch

**Legacy Recurring Tail**:
The bounded period after a Switch goes live during which named legacy recurring arrangements keep being charged by the source system, PayPal or another processor as externally controlled and read-only under Phase 16, ending at the recorded tail closure date.
_Avoid_: grace period, side-by-side, dual run, parallel running

**Legacy Tail Backfill**:
One separately reviewed, bounded plan within the Legacy Recurring Tail that brings in append-only money facts, schedule-state and stop evidence, and restrict-only adverse contact facts recorded by legacy executors after the Switch Boundary. It never writes supporter details.
_Avoid_: catch-up (a Phase 16 Avoid term), sync, delta import, feed

**Recorded outside Asym**:
The permanent fact on every gift that reaches Asym through a Switch's history import (any Source profile) or a Legacy Tail Backfill: the gift was first recorded by another system, so Asym never issues a tax receipt, acknowledgment or statement line for it, and the ministry documents it outside Asym. Written with the gift and never removed; it is Phase 7's receipt-boundary fact, not a contribution status.
Never set by an Everyday import: a Gift file's rows are ordinary current gifts first recorded in Asym.
_Avoid_: already receipted (a previous receipt may not exist), legacy receipt, imported status, not a tax receipt (donor-facing)

**Covered-through date**:
The latest date up to which a Legacy Tail Backfill has reported a legacy arrangement's gifts. It only moves forward; expected gifts after it are "not yet reported", never missed. Shown to staff and missionaries as "gifts shown up to {Month D, YYYY}".
_Avoid_: last updated, sync date, legacy gift (means a bequest in fundraising)

**Move**:
A tail donor's confirmation that their recurring gift continues in Asym: a Phase 16 move-start that charges nothing until the old gift is proven stopped, then starts on the first original due date after that proof. It produces no welcome or end signal.
_Avoid_: migration (of a donor), re-signup, transfer, handover (as donor-facing copy)

**End date**:
The one date recorded for a Switch by which every unmoved legacy arrangement is ended with notice, unless its donor has not yet had a real offer (invitation at least 9 weeks and written end notice at least 30 calendar days before), in which case that gift's End date extends.
_Avoid_: cap (the 12-month maximum), deadline (in donor copy without a date), cutoff

**Continue link**:
The single, secure link each tail donor receives to keep, change or stop their gifts in Asym; opening it changes nothing, and after the End date the same link starts a new gift.
_Avoid_: move link, migration link, login link

**Legacy Surface Disposition**:
The ministry-attested state of one source-system, processor or missionary-held outward surface for one scope: Off at boundary, Kept on through tail (with owner and end condition), Not used, or Outside the ministry's control.
_Avoid_: automations-off attestation, kill switch, SiteStacker switched off

## Everyday imports

**Everyday import**:
A staff import after go-live and outside any Switch: either a People import or a Gift file, each chosen up front with its own template. It grants no permission, sends nothing, never sets Recorded outside Asym, and is paused while a Switch is between its Switch Boundary and go-live.
_Avoid_: bulk update, sync, re-import, delta import, data refresh

**People import**:
An Everyday import that adds new people and updates matched people under Write modes. It can carry names, contact details, tags and lists, existing custom fields, household columns (only from evidence) and restriction columns (restrict-only). Contact details are added, never replaced.
_Avoid_: contact import, upsert, list upload

**Gift file**:
An Everyday import of current gifts from a payout or report (for example DAF, workplace-giving or check deposits), read and mapped by Phase 30 and opened as a draft Phase 15 batch with an expected count and total. Each row names a payer of record and a recognised person; payout keys refuse a repeat; rows belonging to a legacy executor during a Legacy Recurring Tail are refused.
_Avoid_: gift import (ambiguous with a Switch's history), money import, payout sync, remittance (Phase 14's term)

**Write mode**:
The per-column choice for how a People import updates a matched person: Fill empty only (the default), Replace (opt-in, showing how many existing values will change) or Ignore. A blank cell never changes anything; Clear is a separate, confirmed action with a count.
_Avoid_: overwrite mode, merge mode, upsert, blank means delete

**Import reversal**:
Reversing one committed import from its Prepare reversal page within the Import reversal window. Everything the import created or changed appears once, in one of three groups: Can be reversed now, Needs its owner's correction (with a link to the owner's tool) or Stays as it is (with a plain reason). Asym itself reverses only People results (through Phase 9) and, through Phase 23's plan, website drafts: a value goes back only if nothing has written that field since the import; contact details, list memberships and household links the import added are removed as Entered in error; created people are archived only if Untouched. Money, giving history, notes, files and custom fields go to their owners' corrections; restrictions and opt-outs are never removed. Its own changes are attributed and fire no automations or messages. Always "import reversal": a bare "reversal" means a payment reversal.
_Avoid_: undo, Undo import, rollback, revert, restore snapshot, bare "reversal"

**Prepare reversal**:
The action on a committed People import, Gift file, website content import or, after go-live, Switch run that builds its import reversal page. Pressing it changes nothing. Only a ministry member with the reversal capability confirms, with no typed phrase or second person, and the final button names the result in non-money words ("Restore 1,204 values and archive 37 people"). A prepared page lasts 24 hours or until the window closes. Not offered on the missionary self-import, Practice copies or Switch runs before go-live.
_Avoid_: Undo import, Revert, Rollback

**Untouched**:
A person an import created who, since that import, has not been edited; has had no gift (including a draft), pledge, recurring gift, note, task, file, relationship, consent or restriction event added; was not merged on either side; was sent nothing; has no portal account; is not assigned to a missionary or staff member; and was not updated by another import. Viewing, searching and exporting don't count. An import reversal archives only untouched people; Phase 9 publishes the check.
_Avoid_: unchanged, unused, inactive

**Entered in error**:
Ending a contact detail, list membership or household link because it was never true, as distinct from a real-world end such as a move, so history never claims it existed. An import reversal uses it only when the item is unchanged since the import and nothing was sent to it. Removing a list membership this way corrects the record: it is never an unsubscribe and never records or lifts a block.
_Avoid_: unsubscribe, ended, deleted

**Import reversal window**:
The 30 days in which an import reversal can be confirmed: from commit for everyday imports, and from go-live for a Switch run. Shown as an absolute date and time in the ministry's time zone. A reversal confirmed in time finishes; a legal hold keeps reversal prior values but doesn't extend the window.
_Avoid_: undo window, Everyday import undo

**Reversal prior values**:
The values an import replaced, kept server-side only so an import reversal can put them back. They are deleted when the Import reversal window ends (after any reversal confirmed in time finishes), kept longer only under a legal hold, and removed when the person is erased.
_Avoid_: undo values, snapshot, backup

## Giving history

**Fixed gift facts**:
The facts Phase 13 freezes when a history gift is committed and that no correction can change: the legal donor (the person, or a DAF sponsor, employer or platform), payment type, Legal Entity, Site, currency, fund or missionary, date and amount. A history gift commits only when all are known; none is ever taken from a default.
_Avoid_: required fields, mandatory columns, defaults

**Waiting row**:
A final-manifest row that cannot commit yet, shown with a plain reason (for example "No fund mapped", "Date unclear", "Refund without an original", "Lines don't add up") until the ministry maps it, fixes the file or leaves it out as a Visible exclusion. Sign-off needs zero Waiting rows.
_Avoid_: error, failed row, reject, quarantine (a Phase 13 money-matching term)

**Retired designation**:
A Phase 13/14 designation kept only for history: it accepts history from the Phase 13 adoption command, never a new gift, and needs no login for a departed missionary. Created by a person from the mapping step, never automatically.
_Avoid_: closed missionary, inactive fund (as an import state), archive fund

**Source mapping statement**:
The ministry's signed statement, recorded in the readiness census, of which Legal Entity and which Asym Site each merchant account and each offline source (deposit account or batch type) belongs to. The server resolves both from it; a ministry with one entity and one Site signs once.
_Avoid_: default entity, default Site, inferred entity

**Reader readiness check**:
The go/no-go proof that every surface that shows or sums gifts includes, excludes or labels history correctly: dated by gift date, summed per currency with correct decimals, no silent row limits, one gift store, receipts and statements excluding Recorded outside Asym, missionary data only through the projection. Proven with history-shaped data in a Practice copy.
_Avoid_: smoke test, UI check, report audit

**History spot check**:
The sign-off step in which the ministry compares 20 randomly chosen history gifts and the 5 largest, side by side with their source rows, against the old system's own screens. Any mismatch stops sign-off.
_Avoid_: sampling audit, QA sample

## Notes, files and sensitive records

**Record tier**:
The protection level of an imported note, interaction or file, set by the ministry per source category or file type and never by reading the content: Staff (tenant staff), Restricted (named roles) or Sealed (care or personnel). Unknown categories start Restricted; anything about a minor or a restricted worker is at least Restricted; an entry linked to several people takes the strictest of their tiers. Tightening is open to the capability; loosening needs the tier's holder and a reason.
_Avoid_: private flag, note permission, sensitivity score, visibility (Phase 9's own column name)

**Sealed family**:
Care records (care, counselling, health, crisis, safeguarding) or personnel records (references, assessments, medical or psychological evaluations, background-check reports), held only in the owner's sealed home, read-only and access-logged, whose existence is hidden from everyone outside the holder group. Shown elsewhere only as tenant-level counts.
_Avoid_: confidential note, locked record, private file

**Open at the Switch**:
The mark on an imported task that was still open in the source system at the Switch. It comes across as history with no assignee, reminder or automation; staff can turn any one into a real Asym task.
_Avoid_: migrated task, imported to-do, backlog

**Ministry-held sealed export**:
A care or personnel export the ministry keeps outside Asym while that family's sealed home does not yet exist. Asym records its digest at the Switch Boundary and later accepts it only from a copy whose digest matches.
_Avoid_: offline archive, escrow, pending upload

**File safety check**:
The single path every imported file takes before it is stored: quarantine, a malware scan Asym runs itself, a type allowlist and size cap, image re-encoding that removes location data, an opaque storage name, then download-only access. Files that fail are not imported and are listed with a reason for the ministry's archive.
_Avoid_: virus scan (alone), upload validation, preview

## Retention and size

**Retention class**:
The declared kind of a stored Phase 30 artifact that fixes its purpose, the event that starts its clock and its deletion date: final export (earlier of Switch closed + 90 days or go-live + 24 months); superseded and practice exports, backfill inputs, switch-off export and kept-list returns (30 days after superseded or signed off); per-run staging (30 days after that run is committed or discarded; final run 30 days after go-live); unfinished uploads (24 hours); import drafts (14 days after their last change); everyday import files (30 days after commit); reversal prior values (when the Import reversal window ends: 30 days after commit, or 30 days after go-live for a Switch run). An artifact without a class cannot be stored.
_Avoid_: TTL, expiry, archive period

**Legal hold**:
A typed, scoped, reviewed stop on every deletion path for named artifacts, placed by a Switch decision holder or Asym's named legal role (which never reads content). It never auto-releases; a named person releases it with a reason.
_Avoid_: extension, freeze, retention override

**Verify your copy**:
The sign-off step, repeated in the 30-day and 7-day deletion notices, in which the ministry's browser hashes the files it exported and compares them with the recorded digests, uploading nothing. It is recorded as a copy confirmation; Asym never sends the raw export back.
_Avoid_: download your data, backup verified, export copy

**Retention sweep**:
The daily database-driven job that deletes due artifacts not under a Legal hold through the storage service, verifies each deletion and records it in a deletion log with no personal data. It ran in report-only mode before deletion was enabled.
_Avoid_: cleanup cron, purge script, lifecycle rule

**Size profile**:
The measured limits for staff-migration uploads: CSV or TSV up to 2 GB per file; XLSX up to 50 MB and 1 GB uncompressed at no more than 100:1; ZIP allowed with per-entry limits; up to 10 GB and 20 million rows per Switch; one heavy job per ministry at a time. Raising a limit is a recorded profile change.
_Avoid_: max upload, file cap, quota

## Custom fields

**Field draft**:
A custom field or option a person has proposed in a Switch plan from an unmatched column or value, keyed by its own draft ID so it carries across practice runs and Remembered mappings. A practice run creates it only in that run's Practice copy; the real commit creates every draft through Phase 11's batch command, all or none, starting as "Our team only" or Restricted with no default value.
_Avoid_: pending field, auto field, proposed property

**Created-by-Switch list**:
The post-Switch list of every field and option a Switch created, with fill rates and links to settings, offering one-step retirement of fields that hold no values (for example after an aborted Switch).
_Avoid_: migration fields, import schema

**Blank token**:
A source value the ministry declares to mean "no value" for one column (for example "N/A", "?", "-", or SiteStacker's "No" for an unset yes/no field). Declared tokens import as blank; partial dates are never padded to a full date.
_Avoid_: null value, empty string, default

**Identifier refusal**:
The fixed rule that a column whose header names an SSN or SIN, card number, card security code, bank account or passport number cannot be mapped anywhere, and that values looking like card numbers or SSNs block the column for review (a person may override a false match with a logged reason). It is validation, not tier-setting; refused columns are also stripped from Asym's held copy.
_Avoid_: sensitivity scan, PII detection, data classification

## Website content and old links

**Old link list**:
The Switch's list of the ministry's old web addresses (host and path), built at the readiness census from the old sitemap or site export, known giving links, QR targets, text-to-give replies and any links the ministry adds, ordered with printed QR targets and giving links first. Phase 30 stages it and hands each row to its owner; it never holds or activates routes itself.
_Avoid_: redirect map, redirect table, URL migration

**Kept giving link**:
An old giving link a person has admitted as an equivalent address of the same designation's Asym giving page (Phase 24). It is served in place, never redirected, so a gift through it can only reach that designation, and it never expires.
_Avoid_: giving redirect, alias, forwarded link

**Site not-found page**:
The ministry's one not-found page for a Site, identical for every unmapped old link (retired, restricted, unmatched, query-driven or never mapped), so the response never reveals which missionaries are restricted. The ministry may design it to include its giving search.
_Avoid_: gone page, "Giving has moved" page, 410

**Domain readiness check**:
The checklist a ministry passes before its main website hostname is pointed to Asym, re-run within 24 hours before the move: the old system's still-running donor pages don't depend on that hostname; the ministry controls the registrar account, the registration has more than 12 months left and the lock is on; Asym's certificate is issued before DNS changes; email records are carried over; no leftover records point at retired services; DNS caching time was lowered. Leftover records are re-checked 30 days after the move.
_Avoid_: DNS cutover, go-live check

**Staged domain move**:
Moving a ministry's hostnames to Asym one at a time: the account hostname first (for the Continue link), then the giving hostname, then the main website after the Domain readiness check. Each moved hostname is recorded as "Pointed to Asym" among the Legacy Surface Dispositions.
_Avoid_: domain cutover, big-bang switch

## Data Tools

**Data Tools**:
The one Mission Control area, a single sidebar entry next to Admin, that holds the Switch, People imports and Gift files. Inside are tabs, each with its own address: Imports, Switch and Remembered mappings; later owners add tabs (Phase 40's data quality) without renaming. Imports placed by their owners (Web Studio content, the missionary self-import, Field Account opening, church remittances) stay on their owners' screens. "Import people" on the People list and "Upload a Gift file" in Contributions open the same flow here.
_Avoid_: import center, data management, migration hub, Data tools (lower-case)

**Imports list**:
The Data Tools tab listing every People import, Gift file and Switch run, newest first, with name, kind, status, who started it, when (in the ministry's named time zone), rows, outcome counts and reversal deadline. It is the guaranteed way back to any import. It lists imports, not record history: what happened to a record shows on that record.
_Avoid_: import history (for record history), job list, run log

**Import page**:
The one page per import that carries its whole life: File, Columns, Values (only when needed), Review and import, then progress, results and Prepare reversal. Saved after every change, it survives a closed browser, an expired session or another device. Its Review step shows counts that add up to the file's rows, and its final button names the result.
_Avoid_: import wizard, job page, run detail

**Import draft**:
An import that has a file but has not been confirmed. Saved after every change and protected by a plan revision so two people never overwrite each other. Discarded with its file 14 days after its last change, with the date shown 7 days ahead.
_Avoid_: pending import, saved import, staged import

**Needs attention**:
The import status used whenever an import finished or stopped with anything left out, waiting, needing review or partly written. "Done" is used only when every row was imported or deliberately unchanged. Imports never show a green finished state with problems.
_Avoid_: completed with errors, completed with warnings, partial success, failed (for partial writes)

**Switch task list**:
The Switch tab: the Switch's steps grouped as Get ready, Prepare and practise, Decide, Switch day, After go-live and Close, each with a status (Not started, In progress, Needs attention, Done, or Cannot start yet with its reason), a one-line description, a link and who last updated it. Derived from the Switch's recorded state, never stored separately; no assignments. A read-only record once the Switch is closed.
_Avoid_: migration checklist, project plan, onboarding tasks

**Data Tools access**:
The Phase 12 Data Tools permission row with three levels. **View** follows imports: the menu, the Imports list, statuses, counts and who, never values. **Manage** prepares (upload, columns, values, decisions, fixing cells, downloading your file's rows) and runs (confirms). **Admin** adds the sensitive permissions: Replace and Clear, Reverse imports and Run the Switch. The Owner group holds Admin; ministries add View or Manage to any group or person. Clearance is never part of any level. Data Tools stays off until Phase 12 can grant it.
_Avoid_: importer role, import admin, data steward

**Held for review**:
The import outcome for a row matching a staff member, someone marked deceased or anyone the preparer can't see. One wording for every reason; the row is never created as a new person, never shows the match and never changes the counts. After commit, a Manage holder who can see the matched record reviews it and commits it under their own permissions; rows not reviewed by the file's deletion date become "Left out: not reviewed in time".
_Avoid_: blocked, restricted match, hidden duplicate, quarantine

**Narrowing**:
A cleared ministry member's recorded decision, holding Run the Switch, that removes restricted content from a Switch export column by column, or declares the file names no restricted person, so uncleared preparers may see its values. It applies only to Switch real exports; everyday imports are the ministry's own files.
_Avoid_: redaction, scrubbing, clearing a file

**Hide values**:
A switch on Data Tools pages that hides every value for the current session, for coaching on a shared screen. It never reveals more than the person may already see.
_Avoid_: view as, impersonate, uncleared mode
