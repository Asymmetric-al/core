# Delta for Imports And Migration

## ADDED Requirements

### Requirement: One Planned Switch Per Tenant And Source Installation

A Switch MUST move supporter and history authority for exactly one Tenant from exactly one source installation through one Source profile, and the product MUST NOT offer area-by-area or side-by-side switching. A second source for the same ministry MUST be a separate Switch with its own source declaration, and overlaps between sources MUST go to match review.

#### Scenario: A ministry starts its Switch

- GIVEN a ministry on one SiteStacker installation whose merchant accounts each map to one Legal Entity through a reviewer-accepted assertion
- WHEN a member holding Run the Switch starts a Switch
- THEN one Switch exists for that Tenant with its source declaration and the SiteStacker Source profile
- AND no option to refresh imports side by side or switch area by area is shown

#### Scenario: An installation is shared with another organization

- GIVEN a source installation or merchant account is shared with another organization
- WHEN the ministry tries to schedule a Switch
- THEN scheduling is refused as outside v1
- AND no source data is committed

### Requirement: Switch Scheduling Requires The Minimum Switch Kit And Owner Gates

A Switch MUST NOT be scheduled until every Minimum Switch Kit family is committable through its owner's typed import command, every other family is committable or a ministry-accepted Visible exclusion, every legacy recurring cohort has a Phase 16 external read-only target, a fresh readiness census is complete, and the owner gates O31, O41, O47 and O96 are live. For a ministry with recurring giving, no Switch MAY be offered or scheduled until O12, O31 and O36 to O40 are live.

#### Scenario: One kit family is missing

- GIVEN recurring evidence for the Phase 16 classifier cannot be committed through its owner command
- WHEN the ministry asks to schedule the Switch
- THEN scheduling is blocked with the missing family named
- AND no exception lets the Switch proceed

#### Scenario: A module will keep writing to migrated people

- GIVEN a SiteStacker module such as child sponsorship will keep writing to migrated people
- WHEN the ministry declares it as a residual system with no sync either way, a stated overlap count and written acceptance
- THEN scheduling may proceed with that declaration recorded
- AND without the declaration scheduling stays blocked

#### Scenario: Recurring giving exists before the tail owners are ready

- GIVEN the ministry has recurring giving and O12 or any of O36 to O40 is not live
- WHEN a member holding Run the Switch opens the Switch tab
- THEN no Switch is offered to that ministry and none can be scheduled
- AND the tab shows Cannot start yet with its reason

### Requirement: Switch Boundary Fixes Authority Without Setting Other Boundaries

Each Switch MUST record one Switch Boundary as a half-open UTC instant shown in the Tenant's giving time zone, and from that instant Asym MUST be the only writer for supporter identity, contact data, consent and suppression, relationships, custom data, imported giving history and all staff work, except email lists the ministry keeps in its email tool. The Switch Boundary MUST NOT set or imply a Phase 16, Phase 20 or Phase 21 boundary.

#### Scenario: The boundary classifies source facts

- GIVEN a Switch Boundary at the first moment of 1 March in the ministry's giving time zone
- WHEN a source gift dated after that instant appears in the final manifest
- THEN it is refused from the history import because it belongs to a Legacy Tail Backfill

#### Scenario: Switch live and Switch closed are distinct

- GIVEN supporter authority has moved at the boundary but a PayPal subscription still charges
- WHEN staff view the Switch
- THEN it shows Switch live, not Switch closed
- AND Switch closed is shown only once every legacy executor is proved stopped, formally cut over or ended and the Legacy Recurring Tail is closed

### Requirement: Switch Day Uses Measured Pauses And Opens Giving Once People And Restrictions Reconcile

Go/no-go MUST show the online-giving and editing pauses measured in the latest Practice copy and set each limit at 1.5 times the measured time. On Switch day, Parties, contact points and restriction evidence MUST commit and reconcile before Asym giving and exact continuity open, and Asym checkout MUST open only after a verified Phase 13 Settlement Account Binding exists. The remaining families MUST then commit through their owner commands with no outward effect before Switch live is recorded.

#### Scenario: A pause deadline is missed

- GIVEN the declared editing pause limit passes before commit
- WHEN the deadline is reached
- THEN the default action is to abort before commit and resume the source system
- AND nothing is committed to live records

#### Scenario: A donor gives in Asym before the final import completes

- GIVEN Asym giving has opened and remaining families are still committing
- WHEN a person gives in Asym who also exists in the final manifest
- THEN the match goes to match review
- AND no automatic merge occurs

#### Scenario: Families that wait are not committed on Switch day

- GIVEN a ministry-accepted Visible exclusion and a Ministry-held sealed export
- WHEN the remaining families commit on Switch day
- THEN neither is committed, and the Switch does not wait for them

#### Scenario: The readiness census is retaken at the final export

- GIVEN the final Source Snapshot Manifest has been taken after the Switch Boundary and the readiness census has not been retaken
- WHEN a member holding Run the Switch asks to commit its first family
- THEN the commit shows Cannot start yet with that reason
- AND once the readiness census is retaken, every changed answer is shown beside its earlier value

#### Scenario: Go/no-go needs a current Practice copy with no open mismatches

- GIVEN the latest Practice copy was not built on the current mapping version and production release, or it lists a row the plan accepted but the commit rejected that is still unresolved
- WHEN a member holding Run the Switch presses Go
- THEN Go is refused, naming the out-of-date copy or each unresolved mismatch

### Requirement: Source Record Bindings Drive Convergence

Every committed source row MUST bind to its Asym targets through an append-only Source Record Binding keyed by Tenant, environment, source system, installation or provider account, mode, record family, source ID and role, and replay and convergence MUST rest on those bindings, never on a file digest or manifest. Replaying the same sealed manifest under the same mapping MUST write nothing.

#### Scenario: An exact repeat import

- GIVEN a sealed Source Snapshot Manifest was committed under mapping version 4
- WHEN the same manifest is submitted again under mapping version 4
- THEN prior work is recognized and nothing is written

#### Scenario: A later snapshot differs

- GIVEN a later snapshot changes a bound person's phone and omits another person
- WHEN it is planned
- THEN the changed value is shown as a source-changed conflict for reviewed correction, never applied source-wins
- AND the missing row is reported and never treated as a deletion

#### Scenario: An erased person reappears in a file

- GIVEN a person was erased and their binding is tombstoned
- WHEN a later file contains their source ID
- THEN the row is skipped and no identity is re-created

### Requirement: Reconciliation Uses Two Levels And One Source Basis

Switch reconciliation MUST report counts and native-currency totals by Legal Entity, original currency and source basis at two levels: every final-manifest row has exactly one disposition and accepted totals tie to export totals, and export totals tie to independent controls captured outside the import files. Unexplained variance MUST block sign-off, and sign-off MUST bind to one report version.

#### Scenario: Template controls come from the template itself

- GIVEN a template-path Switch whose level-2 control totals were computed from the template files
- WHEN reconciliation is prepared
- THEN those totals are rejected as level-2 controls
- AND the ministry must supply the old system's own report or on-screen totals or processor reports

#### Scenario: Two sources overlap for one period

- GIVEN SiteStacker transaction exports and Historic Giving copies both cover the same gifts and period
- WHEN the source basis is declared
- THEN exactly one source basis is accepted for that population and period with an overlap proof
- AND Historic Giving ledger lines are never treated as gifts

### Requirement: A Switch Can Stop Or Abort Without Returning Authority

Every Switch and every run MUST be haltable, and abort MUST be available only before go-live; an abort MUST discard plans and keep committed rows invisible and undeleted so a later attempt converges, unless the aborted Switch is later purged as abandoned, when the owners dispose of those never-visible rows. After go-live, system-of-record authority MUST NOT return to the source system without a new founder decision.

#### Scenario: Abort before go-live

- GIVEN a Switch has committed some families but has not gone live
- WHEN a member holding Run the Switch aborts it
- THEN plans are discarded, committed rows stay invisible and any Practice copy is destroyed
- AND a later attempt converges on the same Source Record Bindings

#### Scenario: Abort is requested after go-live

- GIVEN a Switch is live
- WHEN someone looks for an abort action
- THEN none is offered
- AND corrections proceed through Prepare reversal and owner corrections only

### Requirement: Legacy Surface Dispositions Name One Responsible System Per Duty

Before any Asym sending or automation activates, the ministry MUST record one Legacy Surface Disposition per surface per Site, Site Channel or list (Off at boundary, Kept on through tail with owner and end condition, Not used, Outside the ministry's control, or Pointed to Asym for a moved hostname). Exactly one system MUST be responsible for each donor-facing duty per cohort.

#### Scenario: A backfill re-confirms dispositions

- GIVEN dispositions were attested at go/no-go
- WHEN each Legacy Tail Backfill is reviewed
- THEN every disposition is shown as ministry attested and re-confirmed
- AND an overlap-and-gap check reports "No known overlap in the inspected scope" with the inspected scope recorded

#### Scenario: Asym is asked to claim the old system is off

- GIVEN the ministry attested giving forms as Off at boundary
- WHEN staff view the Switch summary
- THEN Asym never states that the source system was frozen or switched off
- AND the state is shown as ministry attested

### Requirement: Only A Representative Real Export Qualifies A Source Profile

Every evidence artifact MUST be classed as Synthetic evidence, a Vendor-format sample or a Representative real export, and only a Representative real export MAY qualify a Source profile. Synthetic evidence and Vendor-format samples MUST NOT meet the release gate. No Switch MAY be scheduled on an Unavailable profile, and on a Pilot-qualified profile only its design partner's Switch MAY be scheduled until the profile is Supported.

#### Scenario: Profile status advances

- GIVEN a design partner's real export passes practice runs with both reconciliation levels
- WHEN the profile status is updated
- THEN it becomes Pilot-qualified
- AND it becomes Supported only after that pilot Switch goes live with reconciliation signed off and recovery exercised in production

#### Scenario: Scheduling on an Unavailable profile

- GIVEN no design partner's real export has yet passed practice runs with both reconciliation levels on the template profile
- WHEN a member holding Run the Switch asks to schedule a template-profile Switch
- THEN scheduling is refused because the profile is Unavailable
- AND the scheduling task shows Cannot start yet with that reason

#### Scenario: A second ministry on a Pilot-qualified profile

- GIVEN the SiteStacker profile is Pilot-qualified from its design partner's practice runs and is not yet Supported
- WHEN a member of another ministry holding Run the Switch asks to schedule that ministry's SiteStacker Switch
- THEN scheduling is refused until the profile is Supported

### Requirement: Real Donor Data Follows Staged Evidence And Qualified Custody

Real donor exports MUST NOT enter any Asym environment, including the Practice environment, until a signed agreement with data-processing terms reviewed by counsel and signed by named people, the ministry's own Tenant with the single-installation checks done, an Approved environment, a qualified Phase 29 staff-migration custody profile, restricted-by-default classification, a complete retained-state census (D13) and a fresh readiness census all exist.

#### Scenario: No environment is Approved

- GIVEN no environment has passed the live read-back by an approver who did not build it
- WHEN a ministry offers a real export
- THEN Asym accepts no real export
- AND the profile stays Unavailable, never shown as beta

#### Scenario: The agreement leaves out a required term or role

- GIVEN a signed agreement that does not cover breach notice, retention including backups, or subprocessors including any AI tool
- WHEN a ministry offers a real export
- THEN Asym accepts no real export
- AND the agreement counts only once counsel has reviewed it, named people have signed it, it covers at least roles, purpose, export scope, subprocessors (including any AI tool), hosting region, access, retention including backups, deletion and breach notice, and counsel has decided the special-category basis
- AND no real export is accepted until an environment approver who did not build the environment, a legal owner and the signatories are named

#### Scenario: The read-back finds a super-admin escape

- GIVEN an environment's live read-back shows an is_super_admin() or role-string escape on a person, money, Phase 29 or Phase 30 table, and someone holds super_admin there
- WHEN a ministry offers a real export
- THEN the environment is not Approved and Asym accepts no real export
- AND approval needs a read-back showing no such escape, or that nobody holds super_admin in that environment

### Requirement: Pre-Real-Data Fixes Come Before Real Data And Any Switch

O31's pre-real-data fixes MUST be live before real donor data enters any Asym environment, including the Practice environment, and before any Switch is offered, whether or not the ministry has recurring giving: the payment platform-key fallback and the any-tenant USD lane removed, the hard-coded tenant removed, and the CMS tenant resolver honouring whether a tenant is active.

#### Scenario: Pre-real-data fixes are not live

- GIVEN a ministry with no recurring giving and O31's pre-real-data fixes are not live
- WHEN a member holding Run the Switch opens the Switch tab
- THEN no Switch is offered to the ministry
- AND no real export is accepted in any environment

### Requirement: Source Coverage Uses Direct Support Or Reviewed Transformation

The product MUST offer Direct support only for the SiteStacker Source profile and MUST bring every other system through Reviewed transformation with Import templates, without vendor presets or vendor support claims. Card and bank numbers, credentials, logins and password hashes, automation definitions as live behavior and child sponsorship MUST be Visible exclusions, and missing history MUST carry a Coverage start.

#### Scenario: A ministry leaves another CRM

- GIVEN a ministry exports from a system with no named profile
- WHEN it starts a Switch
- THEN it uses the template profile under the same Switch rules
- AND no screen claims that vendor is supported

#### Scenario: Older history cannot be exported

- GIVEN SiteStacker Historic Giving before 2015 has no self-serve export
- WHEN the ministry records the exclusion
- THEN it is shown as "history before {date} not covered"
- AND first-gift and lapsed conclusions that need earlier history stay blocked

### Requirement: Import Templates Protect Identifiers And Independent Controls

Import templates MUST be generated per Tenant from the field catalog and owner template descriptors, preferring XLSX with text-typed ID, date, postal-code and phone columns. Validation MUST reject IDs in scientific notation or with detectably lost leading zeros, ambiguous dates and rows without a stable source ID.

#### Scenario: A spreadsheet tool mangled IDs

- GIVEN a template file whose source IDs appear as 1.23E+05
- WHEN the file is checked
- THEN those rows are rejected with a plain reason
- AND nothing is planned for them

#### Scenario: A family has no source IDs

- GIVEN a source system without IDs for gifts
- WHEN the ministry prepares templates
- THEN it must assign stable IDs before the first practice run
- AND rows without a source ID are blocked because they cannot converge on re-import

#### Scenario: Templates cover every template family

- GIVEN a template-profile Switch
- WHEN the ministry downloads Import templates
- THEN templates are offered for Parties and households, contact points with explicit consent and adverse-evidence columns held as evidence, relationships, custom fields and collections, one-time giving history with reversals, and recurring evidence for the Phase 16 classifier
- AND soft credits and tributes are offered only where their owners allow, and no template is offered for a money family whose owner has not published a template descriptor
- AND a consent column becomes an Adopted email permission only through the adoption rules

### Requirement: Tax Document Issuer Is Fixed At First Recording

Every gift that reaches Asym through a Switch history import or a Legacy Tail Backfill MUST carry Recorded outside Asym, written once by the owner import command in the same transaction as the money fact, and Asym MUST NOT create a receipt plan, acknowledgment, Canadian plan fact or official-document line for it; the gift MUST stay outside every Phase 19 official purpose's source scope and create no Late Fact Obligation. Correction, re-dating, merge, refund or reversal MUST NOT change the fact.

#### Scenario: A history gift is committed

- GIVEN a SiteStacker gift from last year is adopted through Phase 13's command
- WHEN it commits
- THEN it carries Recorded outside Asym with the source system and any previous receipt number as staff-only evidence
- AND no receipt plan, acknowledgment, Canadian plan fact, official-document line or Late Fact Obligation exists for it

#### Scenario: A Gift file after go-live

- GIVEN a Gift file of DAF payouts is posted through Phase 15
- WHEN its gifts are recorded
- THEN they do not carry Recorded outside Asym
- AND Asym documents them under Phase 7 and Phase 14 rules

#### Scenario: Issuer is decided by date

- GIVEN a backfilled tail gift dated after the Switch Boundary
- WHEN its issuer is determined
- THEN it is still Recorded outside Asym because the issuer follows first recording, never the date

### Requirement: Switch-Year Readiness And Decommission Attest Tax Documents

Go/no-go MUST be blocked while any issuing Legal Entity's pre-boundary gifts or Legacy Tail cohort lacks a named tax-document issuer, while that entity's Asym tax-document setup is not active, or while staff gift entry in the old system is not Off at boundary. Decommission sign-off MUST require attestations that tax documents owed for gifts recorded outside Asym are issued or ready, and where the old records are kept. A legacy charge after a Move MUST NOT be excluded as a duplicate.

#### Scenario: A possible duplicate across systems

- GIVEN a backfilled gift with the same matched Party, amount and check number as an Asym gift dated 3 days apart
- WHEN the backfill is reviewed
- THEN the gift waits for a staff decision
- AND a confirmed duplicate is excluded with a reason and staff are prompted to check whether both systems issued a receipt

#### Scenario: A legacy charge after a Move

- GIVEN a tail donor's recurring gift continues in Asym through a Move and the old system charges them once more afterwards
- WHEN a Legacy Tail Backfill carrying that charge is reviewed and committed
- THEN the charge is recorded as a real second charge carrying Recorded outside Asym and is flagged for refund through the original processor
- AND it is never excluded as a duplicate, even when it matches an Asym gift by Party, amount and date

#### Scenario: Tail closure before tax season

- GIVEN the tail closes in October and switch-year documents are not yet issued
- WHEN tail closure is signed off
- THEN tail closure and Switch closed are not blocked
- AND decommission sign-off stays blocked until both tax attestations are recorded

#### Scenario: A donor views a switch-year gift

- GIVEN a donor's gift is Recorded outside Asym
- WHEN they open its detail in the portal
- THEN they read that the ministry sends this gift's tax receipt separately and it isn't in statements here
- AND no receipt action appears and the words "not a tax receipt" are never used

### Requirement: The Ministry Decides Through Ordinary Access Only

Every Switch decision MUST be made by a ministry member holding that decision's permission, and the Switch lead designation MUST grant nothing. No Asym identity MAY make or hold a Switch decision or any Data Tools permission, except that Asym's named legal role MAY place and release a Legal hold without reading any content. Hands-on Asym help MUST NOT use super_admin, a shared or borrowed login, impersonation, a ministry membership, SQL or service-role access on tenant data.

#### Scenario: The lead is reassigned

- GIVEN the member who created the Switch is its Switch lead
- WHEN another member holding Run the Switch reassigns the lead
- THEN notices go to the new lead
- AND neither member gains or loses any permission

#### Scenario: A ministry completes a Switch alone

- GIVEN no Asym help access was ever granted
- WHEN the ministry works through every task
- THEN every step can be completed without Asym access

#### Scenario: An Asym engineer tries a platform shortcut

- GIVEN an Asym engineer holds platform access
- WHEN they try to act on a ministry's Switch outside Asym help access
- THEN no decision, commit or data view is possible through that path

### Requirement: Asym Help Access Is Approved Time-Limited And Preparation-Only

Asym help access MUST be requested by a named, MFA-protected Asym specialist for one Switch with a reason, approved by one ministry member who may manage access, and last 7, 14 or 30 days or until Switch closed or revocation. It MUST allow only mapping, practice runs, issue triage and plan or match proposals, attributed as "{name} · Asym", and MUST NOT commit, decide, attest, upload, preview or download files, export or grant access.

#### Scenario: A request is not answered

- GIVEN a specialist requested help access 7 days ago
- WHEN nobody has approved it
- THEN the request expires and the ministry has been emailed about it

#### Scenario: Access ends during a job

- GIVEN a specialist's practice run is in progress
- WHEN the ministry revokes their help access
- THEN the job pauses at its next chunk
- AND the specialist can no longer see the Switch tab

#### Scenario: The specialist tries to confirm

- GIVEN a specialist holds active help access
- WHEN they open a plan ready to commit
- THEN no Confirm, attest, upload or download action is available to them
- AND they cannot enter census answers or reconciliation controls, send, change consent, or grant clearance or permissions
- AND they never see Practice copies, sealed families or values before narrowing

#### Scenario: An Asym path tries to approve help access

- GIVEN a specialist's help-access request is waiting for approval
- WHEN any Asym path tries to approve it, or to create, elevate or replace a ministry member so that member can approve it
- THEN it is refused and logged
- AND only a ministry member who may manage access can approve it

#### Scenario: More help is needed after access ends

- GIVEN a specialist's help access has ended
- WHEN the ministry needs more hands-on help, including for a Legacy Tail Backfill
- THEN a new request must be approved by one ministry member who may manage access
- AND the ended access never reopens or extends in place

### Requirement: Practice Runs Write Nothing Live And Never Qualify Alone

A Practice run MUST stage the whole Switch from one set of exports and check every Minimum Switch Kit row through its owner's no-write check using the same acceptance rules as its commit, writing nothing to live records. Practice-copy results MUST be rehearsal evidence only and MUST NOT qualify a Source profile, replace reconciliation sign-off, satisfy recovery exercised or meet the zero-effect acceptance gate.

#### Scenario: A practice run completes

- GIVEN a full set of exports
- WHEN a practice run finishes
- THEN it shows per-family create, update, skip and review counts, both reconciliation levels, the issue list and each staged record's source file, row and ID
- AND no live record has changed

#### Scenario: A rolled-back commit is offered as a check

- GIVEN a Minimum Switch Kit owner offers only a check that commits and then rolls back its transaction
- WHEN Phase 30 evaluates it as a practice check
- THEN it does not count as a no-write check, and the kit area is shown as not yet checkable

### Requirement: Practice Copies Live Only In The Practice Environment

A Practice copy MUST be built only by a member holding Run the Switch, only in the separate Approved Practice environment, through the real owner import commands, and MUST hold no credentials, settlement bindings, hosts, giving addresses, issuer or serial state, integrations, grants, logins or source files. Each Tenant MUST have at most one live copy, lasting 14 days from ready with one 14-day extension, and nothing but content-free status MAY flow back.

#### Scenario: A copy is destroyed early

- GIVEN a live Practice copy
- WHEN a person in it is erased in production
- THEN the copy is destroyed within 24 hours, access is revoked first, and the purge receipt appears in the Switch history

#### Scenario: Someone tries to promote a copy

- GIVEN a Practice copy with corrected data
- WHEN anyone looks for a promote action
- THEN none exists and nothing flows back to production

#### Scenario: Staff work inside a copy

- GIVEN a member opens the copy
- WHEN they try to send an email or issue a receipt
- THEN the action says "Not available in a practice copy"
- AND every page shows a persistent text banner and a "Practice copy ·" title prefix

#### Scenario: A dress rehearsal times every family and lists mismatches

- GIVEN a member holding Run the Switch builds a Practice copy from a Practice run
- WHEN the plan is committed into it through the same owner import commands, omitting only the Switch Boundary and go-live steps
- THEN every family is timed, including one forced interruption and resume
- AND each row the plan accepted but the commit rejected is listed as a mismatch
- AND the copy records the mapping version and production release it was built on

### Requirement: Legacy Tail Backfills Are Bounded Reviewed And Append-Only

Facts recorded after the Switch Boundary by a legacy executor MUST enter only through separately reviewed Legacy Tail Backfills on a fixed cadence until the recorded tail closure date, by default no later than 12 months after go-live. A backfill MUST apply restrict-only contact facts first, carry only append-only money facts, schedule-state and stop evidence, and MUST NOT create or update supporter details or override an Asym edit.

#### Scenario: A refund arrives for an imported gift

- GIVEN a backfill contains a refund linked to an imported original by an exact scoped reference
- WHEN the backfill commits
- THEN the refund is appended and linked
- AND the original gift is never edited

#### Scenario: A backfilled fact has no binding match

- GIVEN a settled charge whose payer has no exact Source Record Binding
- WHEN the backfill is planned
- THEN the fact waits in match review
- AND no person is created or updated from it

#### Scenario: A backfill is asked to restore an erased person

- GIVEN a Party was erased in Asym after the boundary
- WHEN a backfill carries their contact details
- THEN no contact, consent or identity data is restored for them

### Requirement: Tail Gifts Are Silent To Donors And Honest To Staff

Gifts carrying Recorded outside Asym, with their refunds, chargebacks and corrections, MUST trigger no donor message, staff or missionary task or notice, welcome, tribute letter, milestone, or first-gift, new-supporter, started, recontinued or special-gift result, while still counting in totals. Staff and missionary views MUST label legacy arrangements "{previous system} · gifts shown up to {Month D, YYYY}" and judge them only up to their Covered-through date.

#### Scenario: A tail gift is backfilled

- GIVEN a SiteStacker recurring charge from last week arrives in a backfill
- WHEN it commits
- THEN no donor, staff or missionary effect fires and resulting events carry historical=true
- AND the gift counts in the supporter's giving totals

#### Scenario: A backfill is late

- GIVEN an arrangement's Covered-through date is 1 May and today is 20 May
- WHEN its expected gifts are evaluated
- THEN gifts after 1 May show as not yet reported, never missed or lapsed
- AND the Switch lead receives one reminder only when the backfill is overdue by cadence plus 7 days

#### Scenario: A charge appears that Asym did not create

- GIVEN the ministry's connected payment account shows a charge Asym did not create
- WHEN it is ingested
- THEN it is never recorded as an Asym gift and waits for the backfill or an external-intake match

### Requirement: Legacy Arrangements End Only On Stop Evidence

A legacy arrangement MUST end only on source stop evidence or a stop staff confirm in the backfill review. A decline MUST NOT count as a stop, and a replacement schedule for the same supporter and designation MUST count as a continuation unless staff mark it a stop. An end MUST produce exactly the signals an Asym recurring arrangement's end produces, while a move or a planned end at tail closure MUST produce none.

#### Scenario: A declined legacy charge

- GIVEN a backfill shows a legacy arrangement's charge was declined and carries no source stop evidence
- WHEN the backfill is reviewed
- THEN the decline does not end the arrangement
- AND no end signal is produced for it

### Requirement: Tail Donors Move Or End Only With Notice

Each Switch MUST record one End date, by default 10 weeks after campaign launch and never after the cap, and a legacy gift MUST be ended only if its donor was invited at least 9 weeks and sent a written end notice at least 30 calendar days before that date; otherwise its End date MUST extend as a recorded extension. A Move MUST charge nothing until stop evidence for the old gift is recorded, then start on the first original due date strictly after that evidence.

#### Scenario: A donor keeps their gift through the Continue link

- GIVEN a donor opens their Continue link
- WHEN the page loads
- THEN nothing changes until they press Keep, which is a POST
- AND the page shows each gift's amount, frequency, designation, card brand and last four digits, last old charge date, first new charge date and new statement name

#### Scenario: A late invitation

- GIVEN a donor was first invited 6 weeks before the End date
- WHEN the End date arrives
- THEN their gift is not ended and its End date extends as a recorded extension within the cap

#### Scenario: A PayPal donor moves

- GIVEN a donor confirms a Move of a PayPal subscription with card entry
- WHEN the ministry has not yet recorded PayPal stop evidence
- THEN Asym charges nothing and the gift stays on the To-cancel list
- AND after stop evidence the first Asym charge is never a catch-up

#### Scenario: A donor Asym must not email

- GIVEN a tail donor is marked do-not-contact or deceased
- WHEN the campaign is sent
- THEN Asym sends them nothing, a deceased donor's gift goes on the To-cancel list, and the ministry records how any legal notice duty is met

### Requirement: The Tail Closes After The Reversal Window With Privacy Items Cleared

The Legacy Recurring Tail MUST close only after the last old charge plus its reversal window (card 120 days, PayPal 180, US bank debit 60, Canadian PAD 90), extended while any dispute is open. Opt-outs, do-not-contact and erasure requests recorded in Asym after the boundary MUST stay "pending in legacy systems" until a named ministry user marks each executed, and tail closure and decommission sign-off MUST be blocked while any is open.

#### Scenario: A dispute is still open

- GIVEN the card reversal window has passed but one dispute is unresolved
- WHEN closure is requested
- THEN closure is refused until the dispute resolves

#### Scenario: An opt-out is not yet executed in SiteStacker

- GIVEN a donor opted out in Asym after the boundary
- WHEN the closure review is opened
- THEN the item is listed as pending in legacy systems and closure is blocked
- AND kept email-tool lists show a 2-day target for executing it

#### Scenario: A legacy arrangement is still unresolved

- GIVEN the reversal window has passed and no dispute or pending privacy item is open
- WHEN a legacy arrangement has not been handed over through Phase 16, ended with donor notice and a restart invitation, or reclassified by Phase 16 as ongoing external
- THEN closure is refused and the arrangement is named
- AND after closure no backfill can be planned or committed

#### Scenario: A decommission checklist item is not attested

- GIVEN a Switch has closed, both tax-document attestations are recorded and no item is pending in legacy systems
- WHEN a member holding Run the Switch signs off decommission before the ministry has attested the old system's access reduction, credential rotation and the decision to delete or retain its data
- THEN decommission sign-off is refused

#### Scenario: A Practice copy is still live at decommission

- GIVEN a Switch has closed and every other decommission checklist item is attested
- WHEN decommission sign-off is requested while a Practice copy of the Tenant is live
- THEN sign-off is refused until the copy's destruction is confirmed

### Requirement: The SiteStacker Licence Ends Only Once Its Final Duties Are Done

Recording the end of the SiteStacker licence MUST be refused until SiteStacker's last charge has run, the switch-off export taken after that charge is in custody and its tax documents for gifts recorded outside Asym are issued. The licence end does not wait for tail closure. Once it has ended, processor reports MUST be the only source for reversals of its old charges, and the old merchant, gateway and PayPal accounts MUST stay listed as open until the reversal window closes.

#### Scenario: The licence end is recorded too early

- GIVEN SiteStacker's last charge has run and the switch-off export taken after that charge is in custody, but its tax documents for gifts recorded outside Asym are not yet issued
- WHEN the end of the SiteStacker licence is recorded
- THEN it is refused and the outstanding item is named
- AND the refusal does not depend on whether the tail has closed

#### Scenario: Only the boundary manifest is in custody

- GIVEN SiteStacker's last charge has run, the Source Snapshot Manifest sealed at the Switch Boundary is in custody, and the tax documents for gifts recorded outside Asym are issued, while the switch-off export taken after that charge is not in custody
- WHEN the end of the SiteStacker licence is recorded
- THEN it is refused and the missing switch-off export is named

#### Scenario: The licence ends while the reversal window is open

- GIVEN SiteStacker's last charge has run, the switch-off export taken after that charge is in custody and its tax documents for gifts recorded outside Asym are issued, but the reversal window has not closed
- WHEN the end of the SiteStacker licence is recorded
- THEN it is accepted without waiting for tail closure
- AND processor reports become the only source for reversals of its old charges, and the old merchant, gateway and PayPal accounts are listed as staying open until the reversal window closes

### Requirement: Imported Restrictions Commit First And Only Tighten

Every Imported restriction from the old system and the ministry's email tool MUST commit before any Adopted email permission, keep its source field, original value, original date and source record, and take the scope its signal means. The stricter value MUST win across duplicates, merges and sources, and nothing but the person's own later action, or a staff correction of a wrong deceased mark with evidence, MAY lift a block.

#### Scenario: Do not solicit is imported

- GIVEN a source person marked do not solicit
- WHEN restrictions commit
- THEN appeals and fundraising are blocked on every channel
- AND receipts and service messages still go

#### Scenario: An unrecognized restriction value

- GIVEN a restriction column contains the value "XQ"
- WHEN the plan is built
- THEN the row is held for review and no block or email permission is guessed
- AND a blank value means unknown, with no email permission and no block

#### Scenario: A deceased person

- GIVEN a source person marked deceased
- WHEN they commit
- THEN they are ineligible as a recipient on every channel, documents due to them are held with a staff task for the estate, and the record is never deleted or merged into a relative's

### Requirement: Each Email List Moves Stays Or Retires

At go/no-go each ministry email list MUST receive exactly one Email list disposition (Move to Asym, Keep in the email tool, or Retire) and MUST NOT be sent from both systems. A list MAY move only where Asym has a home for it and only once O42 and O43 are live, and the final export of every audience in the email tool, including unsubscribed, cleaned and archived contacts and spam complaints, MUST be imported.

#### Scenario: An organization-wide newsletter

- GIVEN an organization-wide list with no Asym home in v1
- WHEN the ministry chooses its disposition
- THEN only Keep in the email tool or Retire is offered

#### Scenario: A kept list returns unsubscribes

- GIVEN a list kept in the email tool
- WHEN its unsubscribes, cleaned addresses and complaints are imported at least every 4 weeks and at list close
- THEN they apply in Asym restrict-only
- AND opt-outs recorded in Asym go on the pending in legacy systems list with a 2-day target

### Requirement: Adopted Email Permissions Need Evidence And Start On Hold

A person on a moved list MUST receive an Adopted email permission only through the list's published Consent adoption disposition and only if they had not withdrawn, the list was sent to in the 12 months before the Switch Boundary and their evidence meets the rule for where they live. Each MUST keep its evidence and start on Adoption hold, and no optional message MAY reach an imported person until the purpose and channel check and every optional sender honor adopted permissions, holds and blocks.

#### Scenario: A stale list

- GIVEN a moved list was last sent 14 months before the boundary
- WHEN adoption is evaluated
- THEN the whole list is held as a Stale list and nobody is adopted

#### Scenario: A UK recipient without a dated opt-in

- GIVEN a UK resident on a moved list with membership but no dated opt-in record
- WHEN adoption is evaluated
- THEN they keep evidence only and receive no Adopted email permission
- AND nobody is emailed to ask for permission

#### Scenario: Evidence follows where the person lives

- GIVEN a US recipient, or a Canadian recipient of a registered charity, with sourced list membership
- WHEN adoption is evaluated
- THEN that membership is sufficient evidence
- AND a UK or EU recipient, or a Canadian recipient of a ministry that is not a registered charity, needs a dated opt-in
- AND residence comes from the imported postal country, or from the ministry's country when that country is unknown

#### Scenario: A missionary newsletter carries over

- GIVEN a list a named missionary ran through the old system
- WHEN it moves
- THEN memberships show "Joined in {previous system} on {date}", send no confirmation, start held and never authorize ministry appeals

#### Scenario: A moved list without a published disposition

- GIVEN a list given Move to Asym whose Consent adoption disposition has not been published
- WHEN adoption is evaluated
- THEN nobody on the list receives an Adopted email permission

#### Scenario: An Adopted email permission keeps its evidence

- GIVEN a moved list whose published Consent adoption disposition records its mapping to an Asym target, its meaning, its last-sent date, its evidence rule, the Switch lead's attestation and each person's outcome
- WHEN a qualifying person on it receives an Adopted email permission
- THEN it keeps the source system, list, original dates, IP and wording where present, the list mapping and the Switch lead's attestation
- AND the attestation records who vouched and never replaces the evidence

### Requirement: People Come First And Households Only From Evidence

Every source person MUST become exactly one Asym person, and households and spouse links MUST be created only from explicit source evidence: a source household ID shared by two or more people, a source spouse relationship, or the template's Person 2 or Household ID columns. A shared address, email or surname MUST only ever produce a suggestion, and Asym MUST NOT split a Combined-name record.

#### Scenario: Two people share an address

- GIVEN two source people share a postal address but no household ID or spouse relationship
- WHEN they commit
- THEN they import as two people with no household
- AND staff may see a suggestion only

#### Scenario: A combined name

- GIVEN a single name field "John & Mary Smith"
- WHEN it imports
- THEN one person is created and flagged "may be two people"
- AND the flag never blocks the Switch

#### Scenario: A household without a head

- GIVEN a source household with two heads
- WHEN it imports
- THEN the Imported household is created without a primary and listed for staff, with membership starting before the Switch Boundary, date unknown

### Requirement: Each Email Has One Holder And Each Gift One Legal Donor

When two source people share an email, the email MUST go to exactly one holder in this order: the person the source recorded it on, the payer of an active legacy recurring gift, the source's primary person, then the reviewer's pick; the other person MUST import without it as a Shared mailbox, keeping the address as evidence. The source's gift owner MUST stay the legal donor, and Asym MUST NOT re-attribute imported gifts or create a joint donor.

#### Scenario: Spouses share an email

- GIVEN spouses share one source email recorded on the wife
- WHEN they import
- THEN the wife holds the email and the husband is shown as "shares a mailbox with {name}"
- AND the address is kept as evidence on the husband, to be added as his contact email once Phase 4 and Phase 9 allow two people to share one (O48)

#### Scenario: A group with no gifts

- GIVEN a source group such as a committee with no gifts
- WHEN the plan is built
- THEN it is listed for the ministry to classify and is not created as an organization

#### Scenario: A group with gifts

- GIVEN a source group with gifts, or one the ministry marks as an organization
- WHEN the plan commits
- THEN it becomes an organization and that organization holds its gifts
- AND a contact person imports as their own person with a contact link, and does not become the legal donor

### Requirement: Matching Never Merges Automatically

Import matching MUST use source IDs first, and an email match MUST also need the first name to agree, with any Shared mailbox marker sending the match to review. No import MAY merge records; real duplicates MUST import as separate people and go to Phase 4's duplicate queue after commit, and matching MUST NOT ship before O47 is live.

#### Scenario: Email matches but first name differs

- GIVEN an incoming row's email matches an existing person whose first name differs
- WHEN the plan is built
- THEN the row goes to review
- AND nothing is attached automatically

#### Scenario: Same-household pair

- GIVEN two people in the same household
- WHEN duplicate candidates are filed
- THEN they are shown as likely spouses, not duplicates

### Requirement: Column Matching Is Rule-Based And Confirmed By A Person

Column matching MUST use exact template keys and SiteStacker presets, then Remembered mappings for that Tenant and source, then the Common-header list, then fuzzy matches labelled "Suggested — review required", and a person MUST confirm the header row and every match. A Remembered mapping MUST be reused only on an exact header match within its Tenant and source, and a non-empty unmatched column MUST block the plan until matched or left out.

#### Scenario: Headers match a remembered mapping exactly

- GIVEN a ministry's previous file used identical headers
- WHEN the new file is uploaded
- THEN the Remembered mapping is shown for one-click confirmation labelled "Remembered"
- AND the plan records the mapping version used

#### Scenario: Another ministry used the same headers

- GIVEN ministry A has a Remembered mapping for these headers
- WHEN ministry B uploads a file with the same headers
- THEN ministry A's mapping is never offered to ministry B

#### Scenario: A column is left unmatched

- GIVEN a non-empty column has no match
- WHEN the person tries to continue
- THEN Continue is blocked until it is matched or left out
- AND leaving columns out is recorded as a Visible exclusion

### Requirement: The Value-Mapping Table Stores Stable Option Identities

The Value-mapping table MUST list each distinct source value of a code column with its count, group case, space and punctuation variants for one decision each, and store each mapping as the target option's stable ID, never its label. Unknown values MUST be rejected by default, a row missing a required value MUST be blocked, no option, fund or field MAY be created automatically, and no imported record MAY receive any field's default value.

#### Scenario: An option label is renamed later

- GIVEN "Monthly" was mapped to option ID abc and the label later changes to "Every month"
- WHEN the Remembered mapping is reused
- THEN it still targets option ID abc

#### Scenario: An unknown payment method

- GIVEN a payment method value with no mapping
- WHEN the plan is built
- THEN the value is rejected by default and rows needing it are blocked

#### Scenario: An existing field has a default value

- GIVEN an existing custom field whose default value is "Yes" and an import row with no value for that field
- WHEN the row creates a new person
- THEN that field is left empty and no default value is applied

### Requirement: Nothing Leaves Asym For Mapping

Mapping MUST use no AI and no hosted or embedded importer service, file parsing MUST run inside Asym, and Asym staff's own AI tools MUST NOT process a ministry's real exports, headers, sample values, error output or screenshots. The Eve assistant panel MUST NOT be shown on Data Tools pages in v1, and ambiguous dates MUST be flagged, never guessed.

#### Scenario: A staff member opens a Data Tools page

- GIVEN the Eve panel is enabled elsewhere in Mission Control
- WHEN a Data Tools page renders
- THEN no Eve panel is shown

#### Scenario: An ambiguous date

- GIVEN a date column with values like 03/04/2019
- WHEN the column is mapped
- THEN the person must choose a format with a live example
- AND no format is guessed

### Requirement: Everyday Imports Are Chosen Up Front And Grant And Send Nothing

An Everyday import MUST be either a People import or a Gift file, chosen up front with its own template, MUST map only to existing fields and options, and MUST grant no permission, send nothing, fire no welcome or automation and never set Recorded outside Asym. Everyday imports MUST pause while a Switch is between its Switch Boundary and go-live.

#### Scenario: A dated opt-in column

- GIVEN a People import file contains a dated opt-in column
- WHEN the import commits
- THEN the opt-in is kept as evidence only
- AND imported people receive no newsletters or appeals until they opt in themselves

#### Scenario: An unknown option value in a People import

- GIVEN a People import column mapped to an existing custom field whose options have no match for one of the file's values
- WHEN the person decides that value in the Value-mapping table
- THEN no "Add these N values" or archived-option action is offered
- AND the value can only be matched to an existing option or left out

#### Scenario: Starting an import during the Switch

- GIVEN a Switch is between its Switch Boundary and go-live
- WHEN a staff member tries to start a People import
- THEN the start action says "Paused during the Switch, from {Boundary} until go-live."
- AND no import is created

### Requirement: People Import Write Modes Never Lose Existing Data

Each People import column MUST use one Write mode (Fill empty only by default, Replace as an opt-in showing "N existing values will change", or Ignore), a blank cell MUST NOT change anything, and clearing values MUST be a separate confirmed action with a count. New emails, phones and addresses MUST be added, never replaced, old addresses MUST be kept with an end date, and tags and lists MUST only be added.

#### Scenario: Default write mode

- GIVEN a matched person with an existing phone and an empty employer field
- WHEN a People import with a different phone and an employer runs with defaults
- THEN the employer is filled in and the new phone is added without becoming primary
- AND the existing phone is unchanged

#### Scenario: Replace without the permission

- GIVEN a Data Tools Manage holder without Replace and Clear
- WHEN they open the write-mode choice
- THEN Replace is not offered as a Write mode and no Clear action is available to them

#### Scenario: A change-of-address file

- GIVEN a People import contains addresses from an NCOA service
- WHEN the plan is built
- THEN those address changes go to review
- AND an address change never spreads to other household members

### Requirement: Newer Work Wins Over An Import Plan

A field changed in Asym after the plan was made MUST be a conflict and MUST NOT be overwritten, and Review MUST count it under "Changed in Asym since: kept", showing each difference as "Now / In your file / Result". Matching MUST use the remembered source ID, then email plus first name, and send anything uncertain to review; imports MUST NOT lift restrictions, and do-not-contact people MAY be updated but MUST be flagged in the report.

#### Scenario: A field edited after planning

- GIVEN a plan was built at 10:00 and a staff member edited the person's title at 10:30
- WHEN the import commits at 11:00
- THEN the title is kept and counted under "Changed in Asym since: kept"

#### Scenario: A new email already held by someone else

- GIVEN a People import adds an email already held by another person
- WHEN the plan is built
- THEN the row goes to review instead of moving or duplicating the email

### Requirement: Review Groups Add Up To The File Rows

Review MUST show counts for Needs fixing, Needs your decision, New, Will be filled in, No change, Changed in Asym since: kept, Left out and Held for review, and these counts MUST add up to the file's rows. No group, status or problem label MAY use the word "error". These groups present Q12's preview categories; how each category maps onto a group is left to implementation.

#### Scenario: A file with held and left-out rows

- GIVEN a People import file of 1,000 data rows, some of them held for review and some left out
- WHEN the Review step renders
- THEN each row is counted in exactly one group and the groups add up to 1,000
- AND no group, status or problem label uses the word "error"

### Requirement: Gift Files Open Draft Phase 15 Batches

A Gift file MUST be read and mapped by Phase 30 and opened as one or more draft Phase 15 gift batches with a required expected count and total, and Phase 15 MUST own review, posting, receipts and thank-yous for those ordinary current gifts. Each row MUST name a payer of record and a recognised person, payout keys MUST refuse a repeat, and rows that belong to a legacy executor during a Legacy Recurring Tail MUST be refused.

#### Scenario: A Gift file is confirmed

- GIVEN a mapped Gift file of 214 gifts totalling $18,440.00
- WHEN a person with Data Tools Manage and finance:record_contribution confirms
- THEN draft batches are created and the confirmation reads "Nothing is posted and no receipts are sent until someone posts these batches in Contributions."

#### Scenario: The same payout is uploaded twice

- GIVEN a payout already imported with its platform key
- WHEN the same payout is uploaded again
- THEN its rows are refused as repeats

#### Scenario: Old PayPal subscriptions appear in a Gift file

- GIVEN a Legacy Recurring Tail is open and a Gift file contains rows from old PayPal subscriptions
- WHEN the plan is built
- THEN those rows are refused and arrive only through Legacy Tail Backfills

### Requirement: Giving History Commits Gift By Gift With Complete Fixed Gift Facts

Switch giving history MUST be imported gift by gift through Phase 13's adoption command for every payment type, and a gift MUST commit only when every Fixed gift fact is known, without any default for fund, date, currency, Site or Legal Entity. Amounts MUST stay in the source currency without conversion, gift dates MUST be the source-recorded calendar date never shifted through a time zone, and refunds and reversals MUST be separate entries linked to their original by exact source reference.

#### Scenario: A gift has no fund mapped

- GIVEN a history gift whose source fund is unmapped
- WHEN the run is planned
- THEN it becomes a Waiting row with "No fund mapped"
- AND it is never committed to the General Fund unless the ministry explicitly maps that source fund there

#### Scenario: A refund larger than its original

- GIVEN a source refund larger than what remains on its original
- WHEN the run is planned
- THEN it becomes a Waiting row and is never matched by guesswork

#### Scenario: A currency Asym cannot take today

- GIVEN a history gift in a valid ISO currency Asym does not accept for new gifts
- WHEN it is adopted
- THEN it commits in that currency with its decimal places checked and totals kept per currency

### Requirement: Funds And Designations Map Once Without Automatic Creation

Each source fund or missionary MUST map once in the Value-mapping table showing its gift count, total per currency and date range, and a person MAY create retired designations from the mapping step, singly or in a confirmed batch, through the owner's command. Nothing MAY be created automatically, new active funds MUST be created in the owner's normal screen, and fund names and gift memos MUST pass Phase 10's safety rules before they are stored.

#### Scenario: A departed missionary's fund

- GIVEN a source fund for a missionary who left in 2018
- WHEN the person creates a Retired designation from the mapping step
- THEN it is kept for history, never givable and needs no login

#### Scenario: Donors and missionaries see designation names

- GIVEN a gift memo and a legacy fund label imported from the source
- WHEN a missionary or donor views the gift
- THEN they see Asym's designation name, never the source label, and memos stay staff-only

### Requirement: Giving History Never Moves Money And Anonymity Fails Closed

History and its refunds MUST NOT create Field Account activity or balance, Support Cycle input, payout, fee, accounting entry, settlement link, receipt, statement line, thank-you or task. Legal Entity and Site MUST resolve only from the ministry's signed Source mapping statement, and missionaries MUST see a history donor's identity only when the source positively marks the gift as not anonymous or the ministry attests the old system had no anonymity option.

#### Scenario: Source has no anonymity flag

- GIVEN a group of history gifts without any anonymity marker and no ministry attestation
- WHEN a missionary views those gifts
- THEN they see each gift without the donor

#### Scenario: A merchant account is missing from the statement

- GIVEN a history gift from a merchant account not covered by the Source mapping statement
- WHEN the run is planned
- THEN it becomes a Waiting row and no Legal Entity or Site is inferred or defaulted

#### Scenario: A noncash gift

- GIVEN a stock gift in the source
- WHEN history is planned
- THEN it is a Visible exclusion "history not yet covered" keeping its description, until Phases 13 and 15 settle noncash value

### Requirement: History Sign-Off Requires Reader Readiness And A Spot Check

Before the first real Switch commits history, every surface that shows or sums gifts MUST pass the Reader readiness check on a Practice copy as a go/no-go item. History sign-off MUST require zero Waiting rows, no unexplained variance, a per-year breakdown by Legal Entity, currency and year with totals per designation, and a History spot check of 20 random gifts and the 5 largest.

#### Scenario: A reader dates gifts by insert time

- GIVEN a dashboard sums gifts by row creation time
- WHEN the Reader readiness check runs
- THEN the check fails and go/no-go is blocked

#### Scenario: A spot check mismatch

- GIVEN one of the 5 largest gifts differs from the old system's screen
- WHEN the History spot check is recorded
- THEN sign-off stops

#### Scenario: A wrong gift after go-live

- GIVEN a committed history gift is wrong after go-live
- WHEN it is corrected
- THEN it is voided with a reason and re-adopted under the same Source Record Binding with its own permission, never deleted or edited in place

### Requirement: Every Record Family Goes Only To Its Protected Home

Notes and finished interactions MUST go to the Phase 9 timeline, missionary-authored notes to that missionary's private notes, care records to Phase 38's sealed care records, applications to Phase 41 as facts and their documents to the sealed personnel area, and files and photos to Phase 29 private storage, each at least as protected as intended. A family without its home MUST wait; care and personnel files MUST NOT be uploaded before their sealed home exists, and only their digest is recorded.

#### Scenario: Imported notes appear on the timeline

- GIVEN a source call note recorded by a former staff member
- WHEN it imports
- THEN it is read-only with "Imported from {system}" and "Recorded by {name} in {system}", dated by its original occurrence date
- AND no user account is created

#### Scenario: Care home does not exist yet

- GIVEN Phase 38's sealed care home is not live
- WHEN the ministry maps care records
- THEN no care bytes are accepted and the digest is recorded at the Switch Boundary
- AND a later import accepts only a copy whose digest matches

#### Scenario: An open task in the source

- GIVEN a task still open in the source at the Switch
- WHEN it imports
- THEN it becomes history marked "Open in {system} at the Switch" with no assignee, reminder or automation

#### Scenario: An application's reference letter

- GIVEN a source application with a reference letter and a background-check report
- WHEN applications import
- THEN its status, dates, decision and background-check date, outcome and expiry go to Phase 41 as facts
- AND the letter and report go only to the sealed personnel area, or, while that home does not exist, stay with the ministry as a Ministry-held sealed export with only their digest recorded at the Switch Boundary

### Requirement: Notes Files Applications And Care Commit Only After Their Safety Gates

Notes, interactions, files, applications and care records MUST NOT commit for any ministry until the current leaks D40 to D49 are fixed, every surface that reads notes, activities or files passes the Reader readiness check (O68), and counsel's answers on health data, references and retention for that family are recorded. Until all three hold, the commit MUST stay unavailable with its reason, and a Switch MUST NOT wait for these families.

#### Scenario: A leak is still open

- GIVEN D40 is not yet fixed and the ministry's Switch includes imported notes
- WHEN the notes family would commit
- THEN the commit is unavailable with that reason shown
- AND the notes wait in the retained final manifest as a ministry-accepted Visible exclusion, to be imported later, and the Switch does not wait for them

### Requirement: Record Tiers Come From Source Categories Never Content

The ministry MUST set a Record tier (Staff, Restricted, or Sealed for care or personnel) or Leave behind per source category or file type, never by scanning content; unknown categories start Restricted and anything about a minor or restricted worker is at least Restricted. A shared entry MUST take the strictest tier, loosening MUST need the tier's holder and a reason, and missionaries and donors MUST see nothing from these families except a missionary's own private notes.

#### Scenario: A category answers yes to care

- GIVEN the mapping step asks whether a category contains care, counselling, health or safeguarding information
- WHEN the ministry answers yes
- THEN only Sealed (care) or Leave behind is offered

#### Scenario: Loosening without the holder

- GIVEN a Restricted note
- WHEN a staff member who is not the tier's holder tries to make it Staff
- THEN the change is refused
- AND tightening by anyone with the permission is allowed and audited

### Requirement: Every Imported File Passes The File Safety Check

Every imported file, including everyday import files, Switch exports, XLSX, ZIP and the missionary self-import's text files, MUST pass the File safety check, including a malware scan Asym runs itself and never a third-party upload service, before it is stored. Files that fail MUST NOT be imported and MUST be listed with reasons, and stored files MUST be download-only under opaque names and never in public buckets.

#### Scenario: An infected attachment

- GIVEN a source photo fails the malware scan
- WHEN the File safety check runs
- THEN the file is not imported and is listed with its reason for the ministry's archive

#### Scenario: A structural-only check is proposed

- GIVEN a self-import text file under 10 MiB passes size and type checks
- WHEN the scanner is unavailable
- THEN the file is not accepted and self-import activation waits for Phase 29's scanner

### Requirement: Every Artifact Follows Its Retention Class

Every stored Phase 30 artifact MUST carry a Retention class, and an artifact without one MUST NOT be stored. The final Source Snapshot Manifest MUST be deleted at the earlier of 90 days after Switch closed or 24 months after go-live, other classes MUST follow their recorded clocks, and the daily Retention sweep MUST delete through the storage service, verify each deletion and log it with no personal data.

#### Scenario: Unfinished upload

- GIVEN an upload left unfinished
- WHEN 24 hours pass
- THEN the Retention sweep deletes it and records the deletion without personal data

#### Scenario: A plan edit outlives its reversal window

- GIVEN an import whose reversal window has ended and no Legal hold covers its plan edits
- WHEN the Retention sweep runs
- THEN the old and new cell values are deleted
- AND row, column, who and when remain

#### Scenario: Abandoned Switch

- GIVEN a Switch aborted before go-live with no uploading, mapping, planning, committing or signing off for 180 days
- WHEN the sweep runs
- THEN its files and staging are purged after warnings at 150 and 173 days
- AND its never-visible committed rows are disposed by the owners

#### Scenario: The sweep is rolled out

- GIVEN the Retention sweep is newly deployed
- WHEN it first runs
- THEN it runs in report-only mode and any pause is audited

### Requirement: Verify Your Copy Replaces Any Raw Export Return

Asym MUST NOT send a raw export back to a ministry. At sign-off and in the 30-day and 7-day deletion reminders, Verify your copy MUST hash the ministry's local files in the browser against the recorded per-file digests, including each file inside a ZIP, uploading nothing, and record a copy confirmation.

#### Scenario: A file was re-saved

- GIVEN the ministry opened and re-saved an exported CSV
- WHEN Verify your copy runs
- THEN that file is reported as not matching its digest
- AND the guidance says to keep files exactly as exported

#### Scenario: A deferred family is imported later

- GIVEN Asym has deleted the final manifest
- WHEN the ministry imports a deferred family
- THEN Asym accepts only files whose digests exactly match the recorded digests

### Requirement: Legal Hold Stops Every Deletion Path

A Legal hold MUST be placed only by a member holding Run the Switch or Asym's named legal role, which never reads content, with a typed reason, scope and review date. It MUST stop every deletion path for its scope, MUST NOT auto-release, MUST be released only by a named person with a reason, and MUST NOT extend an Import reversal window.

#### Scenario: A hold over a due deletion

- GIVEN a final manifest is due for deletion and under a Legal hold
- WHEN the Retention sweep runs
- THEN nothing in the hold's scope is deleted

#### Scenario: A hold and an Import reversal window

- GIVEN an everyday import under a Legal hold whose 30-day window has ended
- WHEN someone looks for Prepare reversal
- THEN no import reversal is offered, although its Reversal prior values are kept

### Requirement: Erasure Reaches Held Files, Reversal Prior Values And Plan-Edit Cell Values

Erasing a person MUST immediately suppress them in every held file through their Source Record Binding tombstone and remove their Reversal prior values and plan-edit values, and each affected held file MUST be rewritten as a successor within 14 days without their own rows and with their identity blanked elsewhere, keeping money amounts, source IDs and the original digest on record. Refused identifier columns MUST be stripped from held copies within 14 days of sign-off through the same rewrite.

#### Scenario: Erasure during a Switch

- GIVEN a donor is erased while the final manifest is held
- WHEN a later run reads the manifest
- THEN the donor's rows are skipped immediately
- AND the successor file without them exists within 14 days
- AND their plan-edit cell values are removed while row, column, who and when remain

#### Scenario: An import reversal reaches an erased person

- GIVEN a person erased after an import
- WHEN that import is reversed
- THEN the person is skipped as "Erased since" and never written to

### Requirement: Uploads And Heavy Jobs Stay Within Limits

Staff-migration uploads MUST follow the Size profile (CSV or TSV up to 2 GB per file; XLSX up to 50 MB and 1 GB uncompressed at no more than 100:1; ZIP with per-entry limits; up to 10 GB and 20 million rows per Switch), be resumable and direct to storage, and run one heavy job per ministry at a time.

#### Scenario: A zip bomb

- GIVEN an XLSX whose uncompressed size exceeds 100 times its compressed size
- WHEN it is checked
- THEN it is refused before parsing with the limit stated

#### Scenario: A second heavy job

- GIVEN one ministry's People import is running
- WHEN another member confirms a Gift file
- THEN it shows "Waiting to start, after {name}'s {import} (started {time})" and starts on its own with a re-check

### Requirement: Downloads Stream On Demand And Stay Within Limits

Every download MUST stream on demand, never be stored, be text-typed and formula-safe through the one encoder, be audited by identifiers only and be limited to 1,000,000 rows, a larger set being refused with a prompt to filter first.

#### Scenario: A very large download

- GIVEN a results list of 1,400,000 rows
- WHEN someone requests the download
- THEN it is refused with a prompt to filter first

### Requirement: Downloads Follow Their Permission And Never Include Protected People

A download of the file's own problem, left-out and held rows MUST need Data Tools Manage or the Prepare permission and contain only the file's own cells and each row's reason, never an Asym-side value, with held rows included under the same reason. A download with Asym data, such as a results list or a Switch's Waiting rows, MUST need the ministry's existing export permission plus on-screen visibility of its rows and MUST NOT include protected people.

#### Scenario: Your file's rows carry no Asym data

- GIVEN a People import with problem rows and held rows
- WHEN a Data Tools Manage holder downloads the file's rows
- THEN the download holds only the file's own cells and each row's reason, held rows carry the held wording and the row count equals the count on screen
- AND no Asym-side value appears

#### Scenario: A results list needs the export permission

- GIVEN a Data Tools Manage holder without the ministry's export permission
- WHEN they open a committed import's results
- THEN no results-list download is offered, while their own file's rows stay downloadable
- AND a holder of the export permission gets only rows they can see on screen, with no protected person

### Requirement: A Person Decides Every Unmatched Column In A Switch

In a Switch, a person MUST decide every unmatched column, seeing its fill rate, samples and distinct-value count, by mapping it to a built-in or existing field, creating a field, or leaving it out. A Field draft MUST be keyed by its own draft ID, offered only as "Our team only" or Restricted with no default value, and created at the real commit through Phase 11's batch command all or none. Sealed content MUST never become a custom field, and everyday imports MUST use existing fields only.

#### Scenario: One draft fails at commit

- GIVEN five Field drafts and one exceeds the Tenant's field limit
- WHEN the real commit creates fields
- THEN no field is created and the plan reports the failing draft

#### Scenario: A column looks like a calculated value

- GIVEN a column named "Lifetime giving"
- WHEN the person maps it
- THEN it is steered with "Asym calculates this from history"
- AND creating a lookalike field needs explicit confirmation and a reason

#### Scenario: After the Switch

- GIVEN a Switch was aborted after creating fields
- WHEN staff open the Created-by-Switch list
- THEN fields with no values can be retired in one step

### Requirement: Options Blanks And Sensitive Identifiers Are Handled Deliberately

New options MUST be added only in a Switch, through "Add these N values" after review, where a history-only value MAY also become an archived option never selectable for new entry. Blank tokens MUST be declared per column, partial dates MUST NOT be padded, one column MUST map to one target, collections MUST import only into Phase 11 collections created first, and a column whose header names an SSN or SIN, card number, card security code, bank account or passport number MUST NOT be mapped.

#### Scenario: A refused header

- GIVEN a column headed "SSN"
- WHEN the person tries to map it
- THEN no target accepts it and no override exists

#### Scenario: Values that look like card numbers

- GIVEN a "Reference" column whose values look like card numbers
- WHEN the plan is built
- THEN the column is blocked for review
- AND a person may override a false match only with a logged reason

#### Scenario: No matching collection

- GIVEN SiteStacker "Multiple Items" records and no matching Phase 11 collection
- WHEN the plan is built
- THEN they are a Visible exclusion "not yet covered" and no collection is created from mapping

### Requirement: Website Content And Old Links Keep Owner Outcomes

Website content MUST move only through ADR-0173 private drafts published by people, MUST NOT gate go-live, and Phase 30 MUST NOT publish, activate or hold routes. Each Old link list row MUST be handed to its owner for exactly one outcome: an exact ADR-0147 old-address mapping for an ordinary page, a Kept giving link admitted by a person and served in place, a Phase 22 mapping where admitted, or otherwise the Site not-found page, identical for every unmapped path and without expiry.

#### Scenario: A giving link is kept

- GIVEN an old giving link for one designation
- WHEN a person admits it as an equivalent address of that designation's Asym giving page
- THEN it is served in place and never redirected, so a gift through it can reach only that designation

#### Scenario: A restricted missionary's old page

- GIVEN an old page named a now-restricted missionary
- WHEN the path is requested
- THEN the response is the same Site not-found page as any unmapped path
- AND the real-name link is never tied to the missionary's alias page

#### Scenario: A query-driven giving link

- GIVEN an old giving link that depends on query parameters
- WHEN it is requested
- THEN it gets the Site not-found page, which may offer the ministry's giving search

### Requirement: Ministry Domains Move In Stages After Readiness Checks

A ministry's hostnames MUST move to Asym through Phase 24's custom-domain flow one at a time: account hostname, then giving hostname, then the main website only after a Domain readiness check re-run within 24 hours before the move. Before Asym serves any ministry domain, host-blind redirects MUST be removed or made tenant-aware, the host MUST come only from the trusted resolver, and logs and error reports MUST drop query strings. Leftover records MUST be re-checked 30 days after the move.

#### Scenario: Unmatched old paths after a move

- GIVEN a domain stage moved 3 weeks ago
- WHEN the weekly list is produced
- THEN the Switch lead sees unmatched old paths with counts, holding the path only with no query string or IP
- AND can point a path to a page or keep it as a giving link in one step

### Requirement: The Domain Readiness Check Clears Every Item Before The Main Website Moves

The Domain readiness check MUST confirm that the old system's still-running donor pages don't depend on that hostname; that the ministry controls the registrar account and registration, with more than 12 months to expiry and the lock on; that Asym's certificate is issued before DNS changes (CAA allows it, no stray AAAA records, HTTPS-only settings respected); that email records are carried over; that no leftover records point at retired services; and that DNS TTL was lowered in advance.

#### Scenario: The registrar lock is off

- GIVEN the Domain readiness check finds the registrar lock off
- WHEN the ministry tries to point its main website to Asym
- THEN the move is blocked with that item named

#### Scenario: A stray AAAA record

- GIVEN the Domain readiness check finds an AAAA record still pointing the main website hostname at the old host
- WHEN the ministry tries to point its main website to Asym
- THEN the move is blocked with that item named

### Requirement: Prepare Reversal Builds One Three-Group Page And Changes Nothing

Prepare reversal MUST appear on each committed People import, Gift file, website content import and, after go-live, each Switch run, and MUST NOT appear on the missionary self-import, Practice copies or Switch runs before go-live. Pressing it MUST change nothing and MUST build one page listing everything the import created or changed exactly once under Can be reversed now, Needs its owner's correction with a working link, or Stays as it is with a plain reason.

#### Scenario: A Gift file's import reversal

- GIVEN a Gift file produced one posted and one draft batch
- WHEN Prepare reversal is pressed
- THEN both batches appear under Needs its owner's correction linking to Phase 15 to reverse the posted batch and discard the draft
- AND Phase 30 posts no compensating entry

#### Scenario: Restrictions from an import

- GIVEN a People import added do-not-mail restrictions
- WHEN the import reversal page is built
- THEN those restrictions appear under Stays as it is and are never removed

#### Scenario: A Switch run after go-live

- GIVEN a Switch run within 30 days of go-live
- WHEN Prepare reversal is pressed
- THEN People results that pass the People checks are listed under Can be reversed now, through Phase 9, and the rest under Stays as it is
- AND restrictions, opt-outs, suppression evidence and Retired designations are listed under Stays as it is with a plain reason, and every other family under Needs its owner's correction with a link to the owner's tool

#### Scenario: A Switch run before go-live

- GIVEN a Switch run committed before go-live
- WHEN staff look for Prepare reversal
- THEN none is offered and the way back is stopping the Switch or fixing and re-running the family

### Requirement: People Results Reverse Only When Not Written Since The Import

At the moment each item changes, an import reversal MUST restore a value only if nobody and nothing, including a later import, has written that field since the import, restoring which write it came from. Contact details, list memberships and household links the import added MUST be removed as Entered in error only if unchanged and nothing was sent to them, and people the import created MUST be archived only if Untouched.

#### Scenario: A value edited after the import

- GIVEN an import filled a person's employer and a staff member later edited it
- WHEN the import reversal runs
- THEN the employer is left as edited and listed under Stays as it is with the reason

#### Scenario: A created person received an email

- GIVEN a person the import created was later sent a receipt
- WHEN the import reversal runs
- THEN the person is not archived because they are not Untouched

#### Scenario: A list membership is removed

- GIVEN an import added a list membership and nothing was sent to it
- WHEN the import reversal removes it as Entered in error
- THEN no unsubscribe is recorded and no block is lifted

### Requirement: Import Reversal Runs Effect-Dark Within Its Window

An import reversal MUST be confirmable only within the Import reversal window, 30 days from commit for everyday imports and from go-live for a Switch run, shown as an absolute date and time in the ministry's time zone, and a prepared page MUST expire after 24 hours or when the window closes. An import reversal's own changes MUST fire no automations, field-change triggers, sends, welcomes or goodbyes and MUST be attributed.

#### Scenario: Confirming names the result

- GIVEN a prepared import reversal of a People import
- WHEN a member holding Reverse imports reviews it
- THEN the final button reads in non-money words such as "Restore 1,204 values and archive 37 people", with no typed phrase or second person

#### Scenario: Re-importing after an import reversal

- GIVEN people archived by an import reversal
- WHEN the same file is imported again
- THEN those people are restored only through one explicit grouped decision in that import's plan

### Requirement: Each Import Is Reversed Once And A Stopped Import Reversal Resumes

Confirming an expired page MUST be refused and an expired page MUST NOT be revived; while the Import reversal window is open and no import reversal of that import has been confirmed, the person MUST be asked to prepare again. Each import MUST be reversed at most once, and a stopped or failed import reversal MUST resume for its remaining items rather than start a second one.

#### Scenario: An import reversal is stopped

- GIVEN an import reversal is running
- WHEN the member presses Stop
- THEN it stops after the current batch, items already reversed stay reversed, and the rest can resume

#### Scenario: An expired page

- GIVEN a page prepared 25 hours ago for an import still inside its Import reversal window, with no import reversal of that import confirmed
- WHEN a member holding Reverse imports presses its final button
- THEN the confirm is refused and they are asked to prepare again

### Requirement: A Record Family Is Importable Only With Its Correction Path

A record family MUST become importable, by Everyday import or Switch, only when its row in the import reversal table is published and its owner correction link or command works. A wrong file MUST be treated as a privacy matter: an import reversal takes it out of use, the ministry's privacy role erases affected people, and the import and import reversal records supply counts, times and actors for the breach log.

#### Scenario: An owner correction path is missing

- GIVEN Phase 41's correction path for applications is not published
- WHEN a Switch plan includes applications
- THEN applications are not importable and are recorded as a Visible exclusion

#### Scenario: Another organization's file

- GIVEN a staff member imported another organization's donor file by mistake
- WHEN they prepare and confirm the import reversal and the privacy role erases those people
- THEN the held file, Reversal prior values and plan-edit cell values are reached by the erasure

### Requirement: Data Tools Is One Area With Shortcuts Where Staff Work

Data Tools MUST be one System-group sidebar entry next to Admin with no sidebar children and tabs with their own addresses (Imports, Switch, Remembered mappings), and its visibility in the sidebar and Cmd-K MUST come from one server-side permission decision, never role names. "Import people" on the People list and "Upload a Gift file" in Contributions MUST open the same Data Tools flow with the kind chosen, and MUST appear only where the flow works for that person.

#### Scenario: A shortcut without permission

- GIVEN a staff member who may not prepare an import, holding neither Data Tools Manage nor the Prepare permission, views the People list
- WHEN the page renders
- THEN no "Import people" shortcut is shown and no disabled button appears without a written reason

#### Scenario: A shortcut during the Switch pause

- GIVEN a Switch is between its Switch Boundary and go-live and a member can use the People import flow
- WHEN the People list renders
- THEN "Import people" reads "Paused during the Switch, from {Boundary} until go-live." in visible text and starts nothing

#### Scenario: Owner-placed imports

- GIVEN Web Studio content import, the missionary self-import, Field Account opening and church remittances exist
- WHEN Data Tools renders its Imports list
- THEN those owner-placed imports are not listed there

### Requirement: The Imports List Is The Guaranteed Way Back

The Imports list MUST list every People import, Gift file and Switch run newest first, paged on the server, with name, kind, status, who started it, when in the ministry's named time zone, rows, outcome counts and reversal deadline, and filters for Needs attention, kind, status, person and date. Default import names MUST be the kind plus date and time, the file name MUST show only to Manage holders on the import page, and Gift-file amounts MUST show only to people who can see contributions.

#### Scenario: A View holder opens the list

- GIVEN a member with Data Tools View only
- WHEN they open the Imports list
- THEN they see statuses, counts and who started each import, but no values, file names or actions

#### Scenario: Notices bring people back

- GIVEN an import finishes as Needs attention
- WHEN the starter is notified
- THEN one actionable notice arrives through Phase 17 staff notifications and the item appears in the Tasks Hub through a registered Source work projection, with no duplicate alert, task-table row or separate email sender

### Requirement: One Import Page Carries The Whole Import

Each import MUST have one Import page that is saved after every change, survives a closed browser, an expired session or another device, and is protected by a plan revision so two people never overwrite each other. The Confirm button MUST name the result, a plan older than 24 hours or whose file changed MUST be rebuilt before Confirm, and an everyday Import draft unchanged for 14 days MUST be discarded with its file, with the date shown on the draft and in the Imports list 7 days ahead.

#### Scenario: Two people edit one draft

- GIVEN two Manage holders open the same Import draft
- WHEN both save a change from the same plan revision
- THEN only the first save wins and the second sees the change without losing their input

#### Scenario: Confirming with Replace on

- GIVEN a People import with Replace chosen for one column
- WHEN the Review step renders
- THEN the Confirm button is warning-styled and states how many existing values will change

#### Scenario: A stale plan

- GIVEN a plan built 30 hours ago
- WHEN the person presses Confirm
- THEN the plan is rebuilt first and the page shows what changed

#### Scenario: An everyday draft nobody changes

- GIVEN a People import draft last changed 14 days ago
- WHEN its discard date arrives
- THEN the draft is discarded with its file, its discard date having been shown on the draft and in the Imports list from 7 days ahead
- AND no email is sent about it

### Requirement: Imports Run In The Background With One Status Vocabulary

Imports MUST run in the background with progress from real counts and named phases and no time estimates, milestones announced politely to screen readers and a lasting banner when finished or failed. Every import MUST use one status vocabulary (Draft, Checking file, Ready to review, Waiting to start, Importing, Stopping, Done, Needs attention, Stopped, Failed, Discarded) shown as colour, icon and words, with Done only when nothing is left out, waiting or needing review.

#### Scenario: A partly written import

- GIVEN an import stopped after writing 3,000 of 12,000 rows
- WHEN its status is shown
- THEN it is Needs attention, never Stopped or Failed
- AND the page explains that saved rows stay and Prepare reversal is the way back

#### Scenario: Cancelling before writes

- GIVEN an import is Waiting to start
- WHEN the person presses Cancel import
- THEN nothing changes and the status is Stopped

### Requirement: The Switch Task List Is Derived From Recorded State

The Switch tab MUST be a task list derived from recorded Switch state, never stored separately, grouped as Get ready, Prepare and practise, Decide, Switch day, After go-live and Close; each task MUST show one status (Not started, In progress, Needs attention, Done, or Cannot start yet with its reason), one line, a link and who last updated it, with no assignments. Data Tools MUST open on the Switch while a Switch is before go-live, and the tab MUST become a read-only record after Switch closed.

#### Scenario: A blocked task

- GIVEN the Practice environment is not Approved
- WHEN the ministry views the Prepare and practise group
- THEN the Practice copy task shows Cannot start yet with that reason

#### Scenario: After go-live

- GIVEN the Switch went live yesterday and backfill tasks need attention
- WHEN a member opens Data Tools
- THEN it opens on Imports with a Switch banner

#### Scenario: A ministry with no Switch

- GIVEN a ministry that has no Switch
- WHEN a member opens the Data Tools entry
- THEN it opens on the Imports tab

#### Scenario: Steps after Switch closed

- GIVEN a Switch has closed and its decommission checklist is not yet signed off
- WHEN a member holding Run the Switch opens the Switch tab
- THEN it is a read-only record and no completed task can be changed from it
- AND steps that remain possible after Switch closed stay available to people allowed to take them, including the decommission checklist and its sign-off, Verify your copy before the final export's deletion, and placing or releasing a Legal hold

### Requirement: Data Tools Access Has Three Levels On Phase 12

Data Tools access MUST be one Phase 12 permission row with View, Manage and Admin levels, where Replace and Clear, Reverse imports and Run the Switch are Phase 12 sensitive permissions available only at Admin. The Owner group MUST hold Data Tools Admin, no other seed MAY hold Data Tools, existing users MUST get nothing on launch, clearance MUST NOT be part of any level, and Data Tools MUST stay off until Phase 12 can grant these permissions.

#### Scenario: A Gift file confirmation without finance access

- GIVEN a Manage holder without finance:record_contribution
- WHEN they complete a Gift file
- THEN they cannot confirm it, and they see the Gift file's amounts only if they can see contributions; otherwise they see counts only

#### Scenario: Narrowing a Switch export

- GIVEN a member holding Run the Switch but not clearance
- WHEN they try to narrow a Switch real export
- THEN narrowing is refused because it needs Run the Switch and clearance

### Requirement: Each Data Tools Permission Stays Grantable On Its Own

Each individual Data Tools permission MUST stay grantable on its own for advanced cases, such as Prepare without Run for a helper. Replace and Clear is the pair of Replace, offered as a column's Write mode, and Clear, the separate clearing action; a person holding only one of them MUST be offered only that action.

#### Scenario: A Prepare-only helper

- GIVEN a helper granted Prepare without Run
- WHEN they finish a People import's Review step
- THEN no Confirm action is available to them
- AND they can still see and fix the file's own cells and download their file's rows

#### Scenario: Clear without Replace

- GIVEN a member granted Clear but not Replace
- WHEN they work on a People import
- THEN Replace is not offered as a Write mode
- AND the separate, confirmed Clear action with its count is offered to them

### Requirement: Asym-Side Facts Show Only To People Who Can See The Record

A row's Asym-side facts (match, record, current values and outcome detail) MUST show only to people who can see that record, the file's own cells only to Manage or Prepare holders, and counts MUST be whole-file and identical for everyone. The Columns step MUST offer only fields the person may edit. People without Data Tools access MUST see one no-access page with Request access naming no one, and Data Tools holders MUST get not found for another ministry's import or an unknown identifier.

#### Scenario: A field the confirmer cannot edit

- GIVEN a column mapped by someone else to a field the confirmer cannot edit
- WHEN the confirmer reaches Review
- THEN it lists "Won't be written: you can't edit {field}" and that column is left out, and the write path re-checks

#### Scenario: No access

- GIVEN a staff member without Data Tools access opens a Data Tools address
- WHEN the page renders
- THEN it reads "You don't have access to Data Tools." with Request access, the same whether or not the import exists, belongs to another Tenant or is unknown

### Requirement: Switch Real Exports Stay Restricted Until Narrowed

In a Switch real export, uncleared members, helpers and Asym help access MUST see restricted people only by alias, and only headers, counts and validation summaries until a cleared member holding Run the Switch narrows a column or declares that the file names no restricted person. Source fund names MUST show only to cleared members, before and after Narrowing, and others see each fund's counts without its name. Narrowing applies only to Switch real exports.

#### Scenario: Fund names in a narrowed Switch export

- GIVEN a Switch real export whose fund column has been narrowed
- WHEN a Manage holder without clearance opens its source funds in the Value-mapping table
- THEN they see each source fund's counts without its name
- AND a cleared member sees the names

### Requirement: Rows Touching Protected People Are Held For Review

Any row matching a record the preparer cannot see, a staff member or someone marked deceased MUST be Held for review with one wording for every reason, MUST NOT be created as a new person, show the match or change the counts, and the rest of the import MUST proceed. After commit, a Manage holder who can see the matched record MUST review and commit those rows under their own permissions, and rows not reviewed by the file's deletion date MUST become "Left out: not reviewed in time".

#### Scenario: A match to a restricted worker

- GIVEN a People import row matches a restricted-tier worker the preparer cannot see
- WHEN the plan is built
- THEN the row reads "Held for review: someone who can see the matching records will review these rows. Nothing has changed for them."
- AND counts equal those a viewer who can see the worker would get, and the attempt is recorded in the restricted-access audit without plaintext

#### Scenario: Nobody eligible reviews

- GIVEN held rows remain unreviewed 30 days after commit
- WHEN the file's deletion date passes
- THEN they become "Left out: not reviewed in time"

### Requirement: Authority Is Rechecked While An Import Runs And Helpers Stay Bounded

Each batch of a running import MUST re-check the confirmer's permissions and clearance and, on loss, stop after that batch as Needs attention ("Stopped: {name} no longer has permission"), resumable by any eligible member under their own name. Helpers MUST hold ordinary Data Tools grants ending by default the day the Switch closes; Asym help access MUST see only the Switch tab's preparation actions; Hide values MUST hide every value for the session and never reveal more.

#### Scenario: Permission removed mid-import

- GIVEN an import is running under a member's authority
- WHEN an Owner removes that member's Data Tools Manage
- THEN the import stops after the current batch with the reason shown
- AND another eligible member resumes the rest under their own name

#### Scenario: Coaching on a shared screen

- GIVEN a member turns on Hide values before sharing their screen
- WHEN they open an Import page
- THEN every value is hidden for the session while counts and statuses remain

#### Scenario: Asym help access in Data Tools

- GIVEN a specialist holds Asym help access
- WHEN they open Data Tools
- THEN they see only the Switch tab's preparation actions, never the Imports list, import names, values before Narrowing or downloads

### Requirement: Ratified Rules Are Tightened Never Loosened By Delegation

The Phase 28 D17 engineering defaults (including 50 rows per step, a 60-second run lease, one self-import per ministry with a second refused, a 90-day hold review, an hourly clean-up cadence) MUST apply only as missionary self-import profile configuration, never as engine-wide constants, and staff imports MUST queue a second heavy job as Waiting to start. A delegated grant MAY tighten a founder-ratified rule but MUST NOT loosen it; only the founder relaxes a ratified clause by re-ratifying it.

#### Scenario: A staff import uses self-import limits

- GIVEN the shared reader seam serves both profiles
- WHEN a staff People import starts
- THEN it uses the staff Size profile limits, not the self-import's 50-row step

#### Scenario: The self-import's remaining defaults

- GIVEN the missionary self-import profile is configured but not yet activated
- WHEN its activation is considered
- THEN it is not activated until its performance envelope has been measured and recorded and each default has been confirmed or changed against that measurement
- AND its backup window is read from production retention and its limit operator is a configurable role, never a person's handle
- AND changing any self-import value leaves every staff import profile unchanged

#### Scenario: A delegated ruling would skip scanning

- GIVEN a ticket ruling under delegated authority accepts structural-only checks without a malware scan
- WHEN the implementation is reviewed against this capability
- THEN the ruling does not apply and every file still passes the File safety check

### Requirement: Imports Stay Tenant-Scoped Attributed And Effect-Dark

Every Phase 30 command, query and job MUST derive Tenant, actor and permissions from trusted server context, write only through owner commands, attribute every change, and keep job payloads and logs to identifiers only with no file names or values. Imports, backfills and import reversals MUST NOT trigger a donor-facing message or effect, take a payment or create a public effect; imports and import reversals MUST also send nothing, enroll no one and fire no automation or field-change trigger.

#### Scenario: A cross-Tenant identifier

- GIVEN a Data Tools holder submits another Tenant's import ID, or an unknown one, to a Data Tools command
- WHEN the command runs
- THEN it returns not found and writes nothing

#### Scenario: A retried chunk

- GIVEN a job chunk committed but its acknowledgement was lost
- WHEN the chunk is retried
- THEN no owner write happens twice and the row outcomes are unchanged

#### Scenario: Zero outward effects in the end-to-end tracer

- GIVEN a full import runs in the journey seam's end-to-end tracer
- WHEN the outbox and provider adapters are inspected
- THEN no message, enrollment, payment or public effect was produced

#### Scenario: The zero-effect acceptance gate with a live automation

- GIVEN a production-shaped test with a live automation on the fields, lists and tags an import changes
- WHEN the import commits and its import reversal is then confirmed
- THEN neither fires a send, automation, field-change trigger, welcome, goodbye, receipt, enrollment, payment or public effect
- AND the zero-effect acceptance gate is met only when this test and the end-to-end tracer both show zero effects, and never by Practice-copy results

#### Scenario: A Gift file's batch is posted

- GIVEN a Gift file created draft gift batches and nothing was sent
- WHEN a person posts one of those batches in Contributions
- THEN Phase 15 issues receipts and thank-yous for its gifts as ordinary current gifts under Phase 7 and Phase 14 rules
- AND none of those gifts carries Recorded outside Asym or historical=true

### Requirement: Data Tools Meets The Repository UI And Accessibility Standards

Data Tools MUST use exact base-maia and shared packages/ui components (stepper, file input with drop zone and resumable transfer, live-region announcer, task-list composition), Phase 15's accessible editable grid for fixes and DataTableResponsive for lists, and MUST meet WCAG 2.2 AA including reflow to 320 CSS px, 24 px targets and no time limit that loses work. Per-tenant status MUST be streamed and never cached.

#### Scenario: Keyboard-only import

- GIVEN a keyboard-only user
- WHEN they upload, map, review, confirm and open results
- THEN every step is operable and announced, and the authenticated axe checks at 1280, 768 and 320 CSS px pass

#### Scenario: A dropped connection during upload

- GIVEN an upload is half complete
- WHEN the connection drops and returns
- THEN the upload resumes from where it stopped with determinate progress

### Requirement: Data Tools Activates Only Behind Its Gates

Data Tools MUST be default-deny and appear for a ministry only when at least one import kind is on, and each kind (People import, Gift file, Switch) MUST have its own kill switch. No Switch giving history or Legacy Tail Backfill money MAY commit until the owner commands that write Recorded outside Asym exist and the prototype portal receipt link and text statement are retired (O24). No Legacy Tail Backfill MAY commit until O13 exists and O33, O34 and the zero-donor-messages test pass.

#### Scenario: A kind is switched off

- GIVEN Gift files are switched off for a ministry while People imports are on
- WHEN a member with access opens Data Tools
- THEN no "Upload a Gift file" shortcut or other Gift file start action appears, and existing Gift file records remain readable
- AND Prepare reversal stays available on each committed Gift file until its Import reversal window closes

#### Scenario: Phase 12 permissions are absent

- GIVEN the Data Tools permission module is not available
- WHEN any user, including an Owner, requests a Data Tools address
- THEN no Data Tools entry, shortcut or route responds

### Requirement: Switch Start Waits For Asym Preconditions

A Switch's Start action MUST appear only to holders of Run the Switch, and only while the Switch kind is on for the ministry and Asym's own preconditions hold: an Approved Practice environment, O31's pre-real-data fixes, an Approved environment for real data confirmed by its live read-back, a qualified Phase 29 staff-migration custody profile, a complete retained-state census (D13), Phase 17 staff notices (O96) and, for a ministry with recurring giving, O12 and O36 to O40 live.

#### Scenario: Start comes before the readiness census

- GIVEN Asym's own preconditions hold and the Switch kind is on for the ministry, but no readiness census has been answered
- WHEN a member holding Run the Switch opens the Switch tab
- THEN the Start action is present
- AND after Start the scheduling task shows Cannot start yet until the census is complete
