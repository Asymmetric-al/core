## Purpose

Support Hub lets tenant staff handle ordinary requests with dependable ownership, permission-aware shared CRM context, private collaboration and recoverable communication, while requesters continue through qualified ordinary email or Help entry.

This capability binds the complete Phase26 user-story/implementation book (including G01–G15), normative requirement volumes A (D1–D13), B (D14–D26) and C (D27–D40), and the normative glossary. Stable US26/REQ26/AC26 identifiers identify the exact clauses; the publication index provides every full volume. The local formal package is the matching Phase26 documentation set. These requirements are not satisfied by the shortened scenarios alone.

## ADDED Requirements

### Requirement: US26-D01-01 — Continue an ordinary help request by email

The system SHALL provide the following observable outcome: As a requester, I want to continue an ordinary help request by email, so that I can obtain help without registration, duplicate entry or lost messages.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D01-01-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D01-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A legitimate requester can ask for ordinary help and read and reply to the tenant's ordinary answer using email, without creating an Asym account, signing in, completing a CRM link, entering a ticket number, or passing through mandatory self-service. Required qualified Help entry points retain permitted context. **Full contract: REQ26-D01-R01.**

#### Scenario: US26-D01-01-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D01-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** An ordinary reply clearly identifies the tenant and carries a verified, activated, monitored return route prepared under the Phase 17/6 sender contract. The answer is readable in the email. **Full contract: REQ26-D01-R02.**

#### Scenario: US26-D01-01-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D01-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Every accepted input has a durable source identity and exactly one recoverable disposition. An acknowledgment means the accepting owner can recover the promised work, not that downstream work is complete. **Full contract: REQ26-D01-R03.**

#### Scenario: US26-D01-01-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D01-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Thread references and opaque route tokens correlate mail within trusted tenant scope; they never authenticate a person, grant CRM/financial authority, add external recipients, or authorize prior-history disclosure. Conflicting references or destinations do not select an arbitrary first match. **Full contract: REQ26-D01-R04.**

### Requirement: US26-D01-02 — Compose a correctly attributed reply using only permitted context

The system SHALL provide the following observable outcome: As a support worker, I want to compose a correctly attributed reply using only permitted context, so that I can answer safely while protected business actions keep their own authority.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D01-02-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D01-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The server derives tenant and acting active staff identity from authenticated context and records it immutably. Caller input cannot select author or audit identity; an unresolved actor does not become System. **Full contract: REQ26-D01-R05.**

#### Scenario: US26-D01-02-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D01-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Internal notes and system-only events cannot enter the public-reply pipeline or appear in requester-visible email, history or exports, including through direct data access, workers or macros. Authorized internal display/export remains subject to note-access and audit policy. **Full contract: REQ26-D01-R06.**

#### Scenario: US26-D01-02-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D01-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Creating a send intent is atomic with current authorization, exact content/recipient approval, a reviewed conversation version, permanent semantic deduplication, and required local history/dispatch evidence. Relevant unseen updates block stale sending and preserve the draft for explicit review. **Full contract: REQ26-D01-R07.**

#### Scenario: US26-D01-02-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D01-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Support retains observed sender endpoints and explicit authorized links to Core Parties/records, including an unlinked or ambiguous state. No automatic Party creation, preferred-email overwrite, duplicate CRM store, or Support↔CRM sync is permitted. **Full contract: REQ26-D01-R08.**

### Requirement: US26-D01-03 — See truthful work, file availability and CRM context in one conversation

The system SHALL provide the following observable outcome: As a support worker, I want to see truthful work, file availability and CRM context in one conversation, so that I can act without confusing delivery, ownership or business completion.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D01-03-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D01-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Conversation lifecycle, assignment, read state, timers, drafts, send intent, provider acceptance, delivery evidence, and domain-action completion are separate facts. Pending is not Sent; provider acceptance is not Read. **Full contract: REQ26-D01-R09.**

#### Scenario: US26-D01-03-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D01-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use owner-governed content rendering, context-aware variable escaping, permitted link schemes, safe message display and bounded untrusted MIME/file processing. Attachments have independent truthful readiness/failure states. **Full contract: REQ26-D01-R10.**

#### Scenario: US26-D01-03-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D01-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Support Hub and authorized CRM surfaces use the same owner-filtered facts and history. Staff can inspect permitted context, initiate an owner action, and return to their conversation, draft and queue position without unnecessary re-entry. **Full contract: REQ26-D01-R11.**

### Requirement: US26-D01-04 — Qualify and recover the canonical Support service

The system SHALL provide the following observable outcome: As a platform operator, I want to qualify and recover the canonical Support service, so that accepted work remains attributable, durable and safe through migration and outages.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D01-04-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D01-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Authoritative support state, required audit and related local effects commit atomically or leave durable repair evidence for every missing effect. Single/bulk/retry entry points enforce the same invariants. **Full contract: REQ26-D01-R12.**

#### Scenario: US26-D01-04-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D01-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Support owns support work only. Use Phase 23 form occurrences, Phase 17 preparation, Phase 6 dispatch/history, Core identity/CRM/authorization, and qualified document/records boundaries. **Full contract: REQ26-D01-R13.**

#### Scenario: US26-D01-04-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D01-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Inventory actual legacy records and preserve their identities/history with verified mappings or explicit read-only provenance. Backfill never sends old messages or repeats business effects. **Full contract: REQ26-D01-R14.**

#### Scenario: US26-D01-04-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D01-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Before activation, prove ordinary account-free email contact/reply, scoped CRM continuity, authorization negatives, notes and recipient safety, concurrent/replayed commands, body/attachment recovery, provider ambiguity, migration and accessible mobile/keyboard journeys against actual owner seams. Record supported workload and provider/client capability limits from measurements. **Full contract: REQ26-D01-R15.**

### Requirement: US26-D02-01 — Save my tenant-specific initial reply preference

The system SHALL provide the following observable outcome: As a support worker, I want to save my tenant-specific initial reply preference, so that new drafts begin predictably without changing drafts I already reviewed.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D02-01-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D02-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The product default is Reply all. A signed-in staff member may persist Reply all or Reply to sender for their own work within one tenant, across devices. **Full contract: REQ26-D02-R01.**

#### Scenario: US26-D02-01-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D02-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** For an existing draft, restore its saved target and audience. For a new draft, an explicit Reply/Reply-all action takes precedence over the resolved personal preference; a confirmed absent preference uses Reply all. **Full contract: REQ26-D02-R02.**

#### Scenario: US26-D02-01-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D02-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Support owns one narrowly typed personal reply preference keyed by validated tenant and authenticated user. The canonical self-preference command derives both from trusted server context, checks current Support access, and cannot select another agent, assignee, user or tenant from caller input. **Full contract: REQ26-D02-R06.**

### Requirement: US26-D02-02 — Review and deliberately change an exact reply audience

The system SHALL provide the following observable outcome: As a support worker, I want to review and deliberately change an exact reply audience, so that the visible addresses and disclosure match the reply I intend.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D02-02-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D02-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Each reply identifies the specific admitted external message being answered. Ordinary entry selects the latest eligible external message at draft initialization; an explicit per-message reply selects that message. **Full contract: REQ26-D02-R03.**

#### Scenario: US26-D02-02-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D02-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Retain the draft's target, current explicit recipients, reply action/provenance, content, attachment selections, owner and revision across supported save/restore, navigation and temporary failures. A new incoming message, reassignment, Party merge, changed email or preference update cannot silently retarget or readdress it. **Full contract: REQ26-D02-R04.**

#### Scenario: US26-D02-02-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D02-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use Core's existing shared components and semantic tokens. Keep one text-labelled audience control near the From/To/Cc fields: Reply all, Reply to sender, or Custom recipients. **Full contract: REQ26-D02-R05.**

#### Scenario: US26-D02-02-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D02-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** An email participant, actual sender, authenticated user, linked CRM Party, represented organization, assigned support worker and CRM owner remain distinct. Support reads only authorized CRM context and initiates changes through the owning domain's authorized command. **Full contract: REQ26-D02-R07.**

### Requirement: US26-D02-03 — Send one native group reply with truthful member outcomes

The system SHALL provide the following observable outcome: As a support worker, I want to send one native group reply with truthful member outcomes, so that a shared thread does not duplicate mail or hide uncertain delivery.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D02-03-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D02-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** One canonical admission command binds the trusted actor, current conversation/inbox/tenant rights, selected target, reviewed conversation revision, exact audience with To/Cc roles, body/attachment revision and recipient/content authority to a durable reply approval. Required send intents and audit/history references are captured atomically with authoritative state under D1. **Full contract: REQ26-D02-R08.**

#### Scenario: US26-D02-03-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D02-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Before group-email activation, Phase 6/17 must admit an explicit grouped provider-submission/member relationship. One reviewed visible To/Cc group may have one native provider submission, while each admitted recipient copy retains its own authority, semantic identity, immutable preparation membership and communication history. **Full contract: REQ26-D02-R09.**

#### Scenario: US26-D02-03-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D02-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Validate recipient count, header size, syntax, attachment limits and transport capabilities before approval against the qualified owner/provider contract. Reject excess with an actionable error and preserved draft; never truncate, silently split a group into a campaign or claim success before acceptance. **Full contract: REQ26-D02-R10.**

### Requirement: US26-D02-04 — Activate explicit audiences without rewriting old sends

The system SHALL provide the following observable outcome: As a delivery operator, I want to activate explicit audiences without rewriting old sends, so that legacy clients, migrations and failures cannot weaken the recipient contract.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D02-04-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D02-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Introduce preference and explicit-draft contracts compatibly before enabling the new default. Existing drafts keep their known audiences; insufficient historical target/audience evidence requires visible selection before sending, never a backfill from today's preference or CRM data. **Full contract: REQ26-D02-R11.**

#### Scenario: US26-D02-04-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D02-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Trace D2 and D2-R01–R12 from the grill record and resolved glossary into the relevant owner ADR/OpenSpec reconciliation, design/tasks/tickets, implementation, outcome tests and release evidence through the authorized delivery stages. Do not treat a mocked UI test, model experiment, helper suite, vendor article or green unrelated CI as proof of runtime delivery, authorization or usability. **Full contract: REQ26-D02-R12.**

### Requirement: US26-D03-01 — Record exactly what Support currently owes

The system SHALL provide the following observable outcome: As a support worker, I want to record exactly what Support currently owes, so that Open, the two waits and Resolved remain understandable and honest.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D03-01-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D03-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A conversation has exactly one authoritative current work meaning. Open means Support currently owes a substantive next step or a due review/follow-up, including reviewing new input. **Full contract: REQ26-D03-R01.**

#### Scenario: US26-D03-01-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D03-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A staff progress update, note, read action, assignment, CRM link or queued email does not itself choose Waiting or Resolved. Work changes follow explicit authorized staff intent or a qualified causal event under this contract. **Full contract: REQ26-D03-R02.**

#### Scenario: US26-D03-01-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D03-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Maintain a current work snapshot plus append-only authoritative transition evidence. Each actual change records prior/new meaning, cause, trusted human/system actor, server admission/order, command/event identity and permitted causal reference in the same transaction. **Full contract: REQ26-D03-R05.**

#### Scenario: US26-D03-01-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D03-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A first-time admitted relevant human reply returns the conversation to Open for review and invalidates its obsolete deferral, even if the sender's timestamp predates a prior resolution. Durable intake/effect identity prevents duplicate delivery from reopening work again. **Full contract: REQ26-D03-R08.**

### Requirement: US26-D03-02 — Set and manage one dependable shared follow-up

The system SHALL provide the following observable outcome: As a support worker, I want to set and manage one dependable shared follow-up, so that due review returns at the right instant without changing the meaning of a wait.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D03-02-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D03-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** One current shared follow-up reminder may defer attention for a conversation without changing its work meaning. It has a durable identity, generation, finite due instant, purpose and originating actor/cause. **Full contract: REQ26-D03-R06.**

#### Scenario: US26-D03-02-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D03-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Display the actual follow-up date, time and relevant time zone before committing. Resolve calendar expressions such as Tomorrow morning using the displayed shared time-zone context and an explicit visible wall-clock time; a duration must be named as a duration. **Full contract: REQ26-D03-R07.**

### Requirement: US26-D03-03 — Change work through the same guarded command from every entry point

The system SHALL provide the following observable outcome: As an authorized staff member, I want to change work through the same guarded command from every entry point, so that concurrent, repeated and bulk actions preserve authority and history.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D03-03-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D03-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** All menu, keyboard, board, bulk, macro, system-event and reminder transitions use the same canonical Support command in the governed data layer. The server derives tenant, authenticated user and actual actor profile from trusted context, validates the current conversation/resource policy and reviewed work/conversation revisions, and admits only a typed allowed cause. **Full contract: REQ26-D03-R03.**

#### Scenario: US26-D03-03-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D03-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Preserve tenant-aware keys and relationships for conversation, inbox, assignment, transition and reminder facts. Enforce a non-null canonical work value. **Full contract: REQ26-D03-R04.**

#### Scenario: US26-D03-03-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D03-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Menu, keyboard, nondrag board actions, bulk and macros apply the same authorization, semantics, versions and evidence. Freeze the exact selected conversation IDs and reviewed scope for a bulk request; do not silently include newly matching rows. **Full contract: REQ26-D03-R11.**

### Requirement: US26-D03-04 — Retain my place while using complete work and CRM views

The system SHALL provide the following observable outcome: As a support worker, I want to retain my place while using complete work and CRM views, so that I can recover a conflict or follow an owner action without losing my draft.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D03-04-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D03-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Present one primary text-labelled work-status picker in the conversation header, near assignment and separate from reply audience. Its four items use stable sentence-case labels, a programmatically selected current value, a restrained icon and short descriptions within the menu. **Full contract: REQ26-D03-R09.**

#### Scenario: US26-D03-04-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D03-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** An ordinary status edit keeps the selected conversation, draft, scroll context and focus. Update queue membership and counts truthfully from confirmed state; a filtered-out conversation can remain open in the detail pane with a quiet moved-view indication. **Full contract: REQ26-D03-R10.**

#### Scenario: US26-D03-04-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D03-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Support work status owns only Support's obligation. Requester, actual message participant, authenticated user, CRM Party, represented organization, assigned support worker and CRM record owner remain distinct. **Full contract: REQ26-D03-R12.**

#### Scenario: US26-D03-04-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D03-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Apply the full authorized status/wait-side/assignment/due/recovery/search predicate before pagination, and compute counts from that same predicate. All unfinished conversations remain discoverable—including old, snoozed, unassigned or moved work and items beyond one page. **Full contract: REQ26-D03-R13.**

### Requirement: US26-D03-05 — Migrate and qualify work and reminder behavior

The system SHALL provide the following observable outcome: As a support operator, I want to migrate and qualify work and reminder behavior, so that old states and workers cannot hide due work or invent historical episodes.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D03-05-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D03-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Introduce compatible work/history/reminder contracts before enabling the four new labels. Inventory and fence legacy status writers, including the parallel support module, old clients, macros and direct DML. **Full contract: REQ26-D03-R14.**

#### Scenario: US26-D03-05-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D03-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Trace D3 and D3-R01–R15 consistently through the glossary, feature ADR, governing OpenSpec/owner reconciliation, design/tasks/tickets, implementation, outcome tests and release evidence. The completed review is not runtime readiness. **Full contract: REQ26-D03-R15.**

### Requirement: US26-D04-01 — Send a reply with an explicitly chosen work effect

The system SHALL provide the following observable outcome: As a support worker, I want to send a reply with an explicitly chosen work effect, so that ordinary Send preserves work while combined actions are atomic and clear.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D04-01-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D04-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Plain Send reply carries explicit keep-work intent. Successful local admission creates no work transition or resolution episode and preserves the existing valid reminder identity, due instant and generation. **Full contract: REQ26-D04-R01.**

#### Scenario: US26-D04-01-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D04-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Show Send reply as the default primary action and a separate adjacent control named After sending. Its single-select choices are Keep current status; Open; Waiting for requester; Waiting on our side; Resolved, each with a brief meaning and the current choice exposed. **Full contract: REQ26-D04-R02.**

#### Scenario: US26-D04-01-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D04-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use one server-authorized Support admission boundary for the reviewed reply and optional work action. It derives scope and actor from authenticated context, verifies exact target/audience/content and relevant revisions, validates the selected D3 transition, and commits the immutable command identity/hash, Support message intent, work/history/reminder effects and durable dispatch/recovery intent atomically. **Full contract: REQ26-D04-R03.**

#### Scenario: US26-D04-01-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D04-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Support offers a compact Use template entry into the authorized Email Studio content library, filtered to content qualified for a human Support reply. The staff-facing insertion result is editable reply text/structure. **Full contract: REQ26-D04-R04.**

### Requirement: US26-D04-02 — Use governed reusable wording and authorized facts

The system SHALL provide the following observable outcome: As a support worker, I want to use governed reusable wording and authorized facts, so that my editable human reply matches its preview and prepared content.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D04-02-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D04-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Human Support replies, whether typed or based on reusable wording, remain outside the finite system-message catalog. Phase 26 owns human reply content and send intent. **Full contract: REQ26-D04-R05.**

#### Scenario: US26-D04-02-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D04-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The server resolves only allow-listed typed values from the exact authorized tenant, conversation, admitted audience and permitted owner records. Rendering helpers receive already authorized values; caller-provided tenant, sender, actor, CRM association, sample merge values or unrestricted property maps are not authority. **Full contract: REQ26-D04-R06.**

#### Scenario: US26-D04-02-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D04-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The ordinary composer previews the actual bounded reply with the shared presentation. A full-email preview remains available without making a modal preview a mandatory step for every reply. **Full contract: REQ26-D04-R07.**

### Requirement: US26-D04-03 — Deliver the exact approved native email envelope

The system SHALL provide the following observable outcome: As a delivery operator, I want to deliver the exact approved native email envelope, so that group members, provider evidence and bounded recovery remain truthful.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D04-03-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D04-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** D2's exact To/Cc review and native visible-group requirement remain in force. A visible group receives one common approved body. **Full contract: REQ26-D04-R08.**

#### Scenario: US26-D04-03-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D04-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Reuse ADR-0032's permanent occurrence slot and complete semantic/command hash checks. Same identity and same immutable input reconcile the existing effect; changed input conflicts; a genuinely new deliberate reply has a new authorized identity even when its text is identical. **Full contract: REQ26-D04-R09.**

#### Scenario: US26-D04-03-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D04-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use the tenant's proved, revisioned Resend sending connection and purpose-resolved Sender/Reply Identity under ADR-0029. No shared Asym sender fallback, caller-controlled From/Reply-To/headers or Support-only credential store is allowed. **Full contract: REQ26-D04-R10.**

#### Scenario: US26-D04-03-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D04-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Preserve ADR-0032's three recovery conditions: unprepared, prepared definitely unsubmitted and may have submitted. An accepted response requires a valid provider message identity and an exact envelope/member match. **Full contract: REQ26-D04-R11.**

#### Scenario: US26-D04-03-AC05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D04-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Verify raw-body webhook signatures against the exact registered connection secret and bind event scope through the durable provider/envelope relationship, not caller tags, an email domain guess or a claimed tenant ID. Use the qualified provider event identity for dedupe and retain immutable evidence. **Full contract: REQ26-D04-R12.**

### Requirement: US26-D04-04 — Enforce prepared-content custody and current capacity

The system SHALL provide the following observable outcome: As a security and delivery operator, I want to enforce prepared-content custody and current capacity, so that expired, unsafe or oversized material cannot gain sending authority.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D04-04-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D04-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** All command, message, template/presentation reference, preparation, envelope/member, attachment, transition and communication relationships preserve their true tenant/platform owner and environment. Use tenant-aware keys and foreign keys, non-null required identities/revisions, permanent semantic uniqueness, immutable admitted content and lawful state checks. **Full contract: REQ26-D04-R13.**

#### Scenario: US26-D04-04-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D04-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Prepared execution material is encrypted and separately governed from Support conversation bodies, message history, Recent sent copy and generic logs. Phase 17's existing required/source-required receipt/financial-email class has a 30-day ceiling; its optional staff-email sibling of required in-product attention has a 7-day ceiling. **Full contract: REQ26-D04-R14.**

#### Scenario: US26-D04-04-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D04-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use current qualified provider capability/connection limits and response headers, counting API requests separately from recipient quota. Coordinate the shared tenant Resend team budget through Phase 6, including other Asym sends; external applications may also consume that team budget, so 429/Retry-After feedback remains necessary. **Full contract: REQ26-D04-R15.**

### Requirement: US26-D04-05 — Qualify the one canonical human-reply path

The system SHALL provide the following observable outcome: As a release owner, I want to qualify the one canonical human-reply path, so that no old sender or false proof can bypass the approved behavior.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D04-05-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D04-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Reconcile the qualified Phase 17/6 human-reply/group contract first, then compatible schema/grants/readers, then fenced writers and provider qualification, then limited activation. Inventory actual use of both support modules and queued legacy rows. **Full contract: REQ26-D04-R16.**

#### Scenario: US26-D04-05-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D04-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Trace D4 and its clauses through the glossary/ADR and, the formal owner changes, design, tasks/tickets, tests and release evidence. Every production route must identify the same command, Support message, preparation, provider envelope/member and owner communication effect without logging bodies, protected URLs or raw secrets. **Full contract: REQ26-D04-R17.**

### Requirement: US26-D05-01 — End further follow-up for an honestly unanswered remaining need

The system SHALL provide the following observable outcome: As a support worker, I want to end further follow-up for an honestly unanswered remaining need, so that I can finish my responsibility without claiming the problem was solved.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D05-01-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D05-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** No response is the reason staff deliberately ended further Support follow-up because clearly requested needed input remains absent. It is not a count of human messages or proof of refusal, neglect, delivery, satisfaction or an achieved business outcome. **Full contract: REQ26-D05-R01.**

#### Scenario: US26-D05-01-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D05-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The review refers to the actual requested information and relevant admitted participants, not the original CRM contact alone or the last email's direction. Exact email matching, To/Cc participation, assignment or a tracking event does not establish verified identity, representation, authority or human understanding. **Full contract: REQ26-D05-R02.**

#### Scenario: US26-D05-01-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D05-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** An ending cannot waive a known required Support action, promise, currently relevant owner obligation that Support must follow through on, or required unreviewed recovery. Use the existing owner-authorized status/action/reference contracts for known guards. **Full contract: REQ26-D05-R03.**

#### Scenario: US26-D05-01-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D05-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** No response belongs to the applicable resolution episode with its actual server admission time, actor, reason and relevant review/source references. It is not a permanent label saying this person never responds. **Full contract: REQ26-D05-R08.**

#### Scenario: US26-D05-01-AC05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D05-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A due reminder returns work to Open for staff review; it never chooses No response. Eligibility remains available after that wake without an Open→Waiting→Resolved detour. **Full contract: REQ26-D05-R09.**

### Requirement: US26-D05-02 — Choose a local ending or an optional final human reply

The system SHALL provide the following observable outcome: As a support worker, I want to choose a local ending or an optional final human reply, so that the recipient and I understand exactly what was and was not communicated.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D05-02-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D05-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Expose one text-labelled **End follow-up…** entry alongside the existing completion/status controls, not a fifth work-state button or an ambiguous X. Opening it shows a compact review surface titled **End follow-up — No response**. **Full contract: REQ26-D05-R04.**

#### Scenario: US26-D05-02-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D05-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Distinguish an internal ending from informing the requester. The local-only action sends no email, SMS, closing notification or satisfaction survey. **Full contract: REQ26-D05-R05.**

#### Scenario: US26-D05-02-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D05-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Write final reply returns to the existing composer with a visible current-draft **Send and end follow-up** intent carrying the No response reason and reviewed ending basis. It neither discards/replaces an existing draft nor resolves work early. **Full contract: REQ26-D05-R06.**

#### Scenario: US26-D05-02-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D05-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use existing base-maia/Base UI shared components and semantic tokens. Keep one primary work-status control, one infrequent ending entry and one compact review surface. **Full contract: REQ26-D05-R13.**

### Requirement: US26-D05-03 — Recover, correct and report an ending truthfully

The system SHALL provide the following observable outcome: As a support reviewer, I want to recover, correct and report an ending truthfully, so that later input, uncertainty and owner obligations remain actionable.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D05-03-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D05-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** All single-item, keyboard, bulk, macro, API and legacy paths use the canonical conditional Support mutation boundary for any ending. The server derives tenant/environment and actual authenticated user/profile actor from trusted context, checks current conversation/resource capability and known owner guards, and binds expected reviewed conversation/input/work/reminder revisions with the ending intent and evidence references. **Full contract: REQ26-D05-R07.**

#### Scenario: US26-D05-03-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D05-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Before admission, blocked/unavailable eligibility or write failure leaves work, reason, reminder and draft unchanged. Show an actionable permitted explanation and preserve edits. **Full contract: REQ26-D05-R10.**

#### Scenario: US26-D05-03-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D05-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Keep operational work endings separate from confirmed problem or owner-action outcomes. No response is distinguishable from ordinary Support completion and legacy reason-not-recorded history. **Full contract: REQ26-D05-R11.**

#### Scenario: US26-D05-03-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D05-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A local-only ending is a Support work-history event, not an outbound communication. Authorized CRM views may reference/project that same Support fact with navigation back to its context; they do not create another authoritative interaction or duplicate Phase 6 communication event. **Full contract: REQ26-D05-R12.**

#### Scenario: US26-D05-03-AC05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D05-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Record actual command, tenant, actor, conversation, episode, reason, source/review revisions, timer effect and any linked optional send identity without duplicating bodies or credentials in logs. Distinguish business history, security/actor audit, provider evidence and diagnostic traces. **Full contract: REQ26-D05-R15.**

### Requirement: US26-D05-04 — Activate the bounded manual ending capability

The system SHALL provide the following observable outcome: As a release owner, I want to activate the bounded manual ending capability, so that legacy timers and writers cannot silently create automatic closure.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D05-04-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D05-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Before activation, inventory both support modules, exposed collections, routes, macros, keyboard/bulk paths, notification rules, future status automations, seed behavior and reporting consumers. Add compatible reason/episode/command contracts and readers first; fence old writers before enabling the new ending action. **Full contract: REQ26-D05-R14.**

#### Scenario: US26-D05-04-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D05-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** D5 accepts a narrowly defined staff-ending capability and awareness behavior. It does not introduce a generic ending-reason builder, new main work status, whole-product case model, AI classifier/agent, knowledge-base workflow, portal archive, notification engine, automatic timer, SLA policy, fixed follow-up quota, minimum waiting interval or merge/split/withdrawal policy. **Full contract: REQ26-D05-R16.**

### Requirement: US26-D06-01 — Configure shared coverage and qualified receiving pools

The system SHALL provide the following observable outcome: As an inbox administrator, I want to configure shared coverage and qualified receiving pools, so that new work has a real accountable home without granting extra access.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D06-01-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D06-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A new inbox's default first-assignment mode is Shared. No individual is assigned by that default; the responsible inbox retains visible Unassigned work. **Full contract: REQ26-D06-R01.**

#### Scenario: US26-D06-01-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D06-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Live inbox activation identifies at least one currently authorized human in an explicitly named coverage roster, directly or through a qualified Support team with actual membership. Reuse that operational association for the receiving pool where appropriate; do not create a mandatory coverage-steward role or a second team/owner system. **Full contract: REQ26-D06-R02.**

#### Scenario: US26-D06-01-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D06-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Pools reference uniquely identified tenant staff principals with current permission to handle the work and explicitly configured operational inclusion. Expand qualified live Support-team membership and deduplicate one principal across direct and team inclusion. **Full contract: REQ26-D06-R03.**

### Requirement: US26-D06-02 — Control receipt of new automatic assignments and understand my limit

The system SHALL provide the following observable outcome: As a support worker, I want to control receipt of new automatic assignments and understand my limit, so that availability and workload controls do not rewrite existing responsibilities.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D06-02-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D06-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Receive new Support assignments is an explicit per-person, per-tenant operational flag. It starts Off until that worker or an authorized administrator explicitly enables it; adding a team member or opening Asym never silently enables it. **Full contract: REQ26-D06-R04.**

#### Scenario: US26-D06-02-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D06-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Automatic assignment limit is an optional positive integer per person for the current tenant's Support work. Unset means No limit, clearly labelled; zero, negative, fractional or out-of-range values are invalid, with Off available for stopping automatic receipt. **Full contract: REQ26-D06-R05.**

#### Scenario: US26-D06-02-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D06-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A legitimate reply, due reminder, owner update or recovery can make already assigned work Open above the limit. Preserve its owner and actual D3 work; show the overage and stop further automatic admission. **Full contract: REQ26-D06-R06.**

### Requirement: US26-D06-03 — Apply one fair and guarded first-assignment policy

The system SHALL provide the following observable outcome: As an inbox administrator, I want to apply one fair and guarded first-assignment policy, so that rules and concurrent allocators cannot overwrite human intent or exceed automatic admission limits.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D06-03-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D06-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** After trusted intake routing/classification and current human-control fences, explicitly ordered specific initial-assignment rules precede the inbox default. The first qualifying match supplies one typed result: leave Shared, select a qualified person, or select a qualified pool and a named supported allocator, with a responsible team only if explicit. **Full contract: REQ26-D06-R07.**

#### Scenario: US26-D06-03-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D06-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Safe new-conversation intake admits at most one durable initial-assignment source identity. Its policy binding can change before initial placement, with lineage retained. **Full contract: REQ26-D06-R08.**

#### Scenario: US26-D06-03-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D06-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Assign to me claims the reviewed currently Unassigned conversation for the actual eligible authenticated principal. One concurrent claim wins; another receives current authorized state/conflict without overwriting the winner. **Full contract: REQ26-D06-R09.**

#### Scenario: US26-D06-03-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D06-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** True rotation records a durable turn only on a successful qualifying automatic first assignment in the relevant allocation pool. Skips, failed attempts, duplicate events, manual assignments and pauses do not consume that turn. **Full contract: REQ26-D06-R10.**

### Requirement: US26-D06-04 — Save, pause and resume assignment policy with an honest impact

The system SHALL provide the following observable outcome: As an inbox administrator, I want to save, pause and resume assignment policy with an honest impact, so that pending intake is reconsidered without sweeping previously handled work.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D06-04-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D06-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** One authoritative Assignment settings surface edits the selected inbox's intended fields through expected-version checks. Save publishes a new policy revision and durable re-evaluation intent; it does not resend unrelated stale signature, SLA, auto-resolve or sender settings. **Full contract: REQ26-D06-R11.**

#### Scenario: US26-D06-04-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D06-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** An automatic-to-Shared default change releases still-pending intents that now resolve to the default into visible Shared responsibility and ends their automatic pursuit. A valid specific automatic rule may still govern another pending item; the preview distinguishes the two. **Full contract: REQ26-D06-R12.**

#### Scenario: US26-D06-04-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D06-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Pending initial assignment is reconsidered when required owner facts, receiving state, capacity or current configuration change, through Core's durable workflow/recovery capability. Bound attempts, use appropriate backoff and ensure missed wake-ups can be reconciled from durable intent. **Full contract: REQ26-D06-R13.**

#### Scenario: US26-D06-04-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D06-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use the existing Support list/detail/assignment surfaces and shared Base UI/Maia/Zinc components. Keep one visible Unassigned label, work status, relevant age/reminder, and Assign to me or Assign action. **Full contract: REQ26-D06-R16.**

### Requirement: US26-D06-05 — Qualify and recover assignment without a second identity or workflow system

The system SHALL provide the following observable outcome: As a support operator, I want to qualify and recover assignment without a second identity or workflow system, so that permissions, history, complete counts and migration remain dependable.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D06-05-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D06-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Model tenant-aware relationships for inboxes, coverage/pool membership, qualified staff, policy versions, conversation assignments and history. Enforce one effective current assignment, one current policy per inbox and one initial source per admitted new conversation; eliminate duplicate effective person membership. **Full contract: REQ26-D06-R14.**

#### Scenario: US26-D06-05-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D06-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Requester, email participant, authenticated staff principal, CRM Party, represented organization, Support assignee, responsible Support team and CRM record owner remain distinct. Email matching, conversation links, assignment and pool membership establish none of the others. **Full contract: REQ26-D06-R15.**

#### Scenario: US26-D06-05-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D06-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Authorized operators can see current assignment, Shared/pending/paused/review reason, policy/rule reference and relevant change history. Store business evidence separately from technical traces and owner-security audits. **Full contract: REQ26-D06-R17.**

#### Scenario: US26-D06-05-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D06-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Inventory both support modules, legacy Boolean/settings seeds, browser selectors, direct assignment endpoints, macros, imports/bulk actions, automation writers, database grants and worker versions. Establish one canonical assignment policy/command/intent contract and compatible readers, then fence every old bypass before activating new distribution. **Full contract: REQ26-D06-R18.**

#### Scenario: US26-D06-05-AC05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D06-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** D6-P01–P22 below are required domain/user-outcome proof groups, not a claim that source inspection implements them. Validate real isolated Postgres/RLS, simultaneous transactions, old/new deployment behavior, browser accessibility and end-to-end Support-to-CRM journeys under representative permissions and data volumes. **Full contract: REQ26-D06-R19.**

#### Scenario: US26-D06-05-AC06

- **GIVEN** the actor, source, state and permission conditions specified by US26-D06-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Before live activation, bind the operational roles in the monitor table to real people and existing alert/recovery surfaces. Prevent security, ownership, replay and capacity-admission violations through proof; monitoring supplements those safeguards. **Full contract: REQ26-D06-R20.**

### Requirement: US26-D07-01 — Start temporary coverage for reviewed inboxes

The system SHALL provide the following observable outcome: As a support worker, I want to start temporary coverage for reviewed inboxes, so that current and later review work stays with qualified colleagues during my absence.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D07-01-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D07-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Coverage is an explicit temporary Support work arrangement for one actual staff principal in one tenant and a reviewed set of inbox IDs. There is at most one current episode for that principal/tenant, with a current revision and effective scope. **Full contract: REQ26-D07-R01.**

#### Scenario: US26-D07-01-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D07-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** While the episode is effective in an inbox, initial catch-up transfers currently assigned D3 Open conversations for the covered person, including Open conversations with a future deferral. Preserve the exact valid reminder, current Open meaning, responsible team and inbox. **Full contract: REQ26-D07-R02.**

#### Scenario: US26-D07-01-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D07-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Coverage evaluates first-time relevant admitted human input, valid due reminders, current awaited owner results, fresh actionable adverse/recovery evidence and an authorized explicit Set Open command through the ratified D3 work boundary. This includes earlier Resolved/No response conversations that reopen and already-Open conversations that receive fresh review work. **Full contract: REQ26-D07-R03.**

#### Scenario: US26-D07-01-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D07-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use D6's qualified named coverage roster, not a second owner or backup role. Before an automatic release, establish a current authorized shared handling path with at least one qualified human other than the covered subject. **Full contract: REQ26-D07-R04.**

#### Scenario: US26-D07-01-AC05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D07-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Starting coverage does not change the stored per-person/per-tenant Receive new Support assignments preference. Active coverage adds an explicit restriction on new automatic assignment to that person in its covered inboxes, in addition to D6's normal permission, pool, receiving and limit checks. **Full contract: REQ26-D07-R05.**

#### Scenario: US26-D07-01-AC06

- **GIVEN** the actor, source, state and permission conditions specified by US26-D07-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Set up coverage opens an existing shared dialog/drawer pattern showing the person/tenant, selected inboxes, end choice, current Open count, both Waiting meanings and relevant follow-ups through permitted context. Explain that Open including deferred Open transfers, quiet waits stay until they need review, and a previously resolved conversation may return through coverage. **Full contract: REQ26-D07-R06.**

### Requirement: US26-D07-02 — Retain or hand off a particular covered conversation deliberately

The system SHALL provide the following observable outcome: As an authorized handler, I want to retain or hand off a particular covered conversation deliberately, so that manual handling and scope changes cannot be undone by old coverage jobs.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D07-02-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D07-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Coverage of previously owned work is a distinct later-assignment purpose. It does not create a second initial-conversation source, advance D6 rotation, consume a new automatic-assignment turn or reenroll every Unassigned row in the intake allocator. **Full contract: REQ26-D07-R07.**

#### Scenario: US26-D07-02-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D07-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** An authorized person may deliberately assign or reaffirm a conversation to the covered worker through the normal assignment control. The focused action states Keep with Maria during this coverage, with the actual person's name, and explains that this conversation stays with that worker for the current episode, including later replies/follow-ups. **Full contract: REQ26-D07-R08.**

#### Scenario: US26-D07-02-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D07-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Preserve governing Move Assignee Retention and Move-Cleared Assignee Queueing. A move fences old-scope coverage work and never becomes fresh intake. **Full contract: REQ26-D07-R09.**

### Requirement: US26-D07-03 — Change or end coverage at a clear instant

The system SHALL provide the following observable outcome: As a support worker, I want to change or end coverage at a clear instant, so that future transfers stop without reclaiming prior handoffs or restoring old preferences.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D07-03-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D07-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use trusted server admission/order for episode start and commands. Optional end is a finite future UTC instant resolved from the displayed date/time and named time zone; Until I end is explicit absence of an automatic end, not an unknown or silently invented date. **Full contract: REQ26-D07-R10.**

#### Scenario: US26-D07-03-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D07-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** D6 Pause automatic assignments also fences D7's autonomous assignment releases in that inbox. Preserve current owners while paused; do not silently narrow the existing Pause promise. **Full contract: REQ26-D07-R11.**

### Requirement: US26-D07-04 — Enforce coverage independently of CRM and message ownership

The system SHALL provide the following observable outcome: As a support administrator, I want to enforce coverage independently of CRM and message ownership, so that assignment changes cannot reveal drafts, impersonate authors or grant protected access.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D07-04-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D07-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Self coverage is a fixed Support operation for one's own qualified work scope, authorized through current Core identity and relevant Support assignment/operational rights. Managing another person's coverage requires explicit existing/developed owner-authorized administration capability, not matching email, any staff role or membership in a receiving pool. **Full contract: REQ26-D07-R12.**

#### Scenario: US26-D07-04-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D07-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Coverage is one fixed Support operation using product-owned state, claims and the shared workflow dispatch ledger; the runtime consumes identifier-only envelopes and current owner facts. It does not create a general automation definition editor, second workflow engine, new queue broker or application-local scheduler that owns business truth. **Full contract: REQ26-D07-R13.**

#### Scenario: US26-D07-04-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D07-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Requester, participant, authenticated worker, CRM Party, represented organization, Support assignee, responsible team and CRM owner remain distinct. Coverage changes only Support handling. **Full contract: REQ26-D07-R14.**

#### Scenario: US26-D07-04-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D07-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A coverage handoff does not transfer another person's private unsent draft, attachment preparation or recipient selection. Covering staff may read only authorized conversation parts and compose their own reply through D1/D2/D4. **Full contract: REQ26-D07-R15.**

### Requirement: US26-D07-05 — Keep coverage understandable and recoverable at scale

The system SHALL provide the following observable outcome: As a support operator, I want to keep coverage understandable and recoverable at scale, so that partial transfer, missing cover and delayed work remain visible through qualified UI and operations.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D07-05-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D07-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use the existing Support context and shared Base UI/base-maia/Zinc primitives. The setup has one main action, Start coverage, explicit scope/end, a short effect summary and only relevant warnings. **Full contract: REQ26-D07-R16.**

#### Scenario: US26-D07-05-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D07-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Reuse semantic controls, accessible names/descriptions, focus management, keyboard navigation, screen-reader state announcements and supported touch targets. Narrow layouts prioritize one setup/detail view with clear back navigation and retained state. **Full contract: REQ26-D07-R17.**

#### Scenario: US26-D07-05-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D07-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Select/count coverage using complete canonical tenant/principal/inbox/work predicates before pagination. A display hydration miss is Unknown, not proof of no assignee/team. **Full contract: REQ26-D07-R18.**

#### Scenario: US26-D07-05-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D07-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Qualify D6's canonical assignment/history/current identity and D3's causal work/reminder contracts before activating coverage. Add compatible coverage readers/state/effect contracts, complete predicates and permitted projections, then fence old writers and enable workers/UI in a tested sequence. **Full contract: REQ26-D07-R19.**

#### Scenario: US26-D07-05-AC05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D07-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Before live activation, map the named roles in the monitor table to actual people and existing notification/recovery surfaces. Security, ownership, current-control and idempotency invariants require prevention/proof, not monitoring alone. **Full contract: REQ26-D07-R20.**

### Requirement: US26-D08-01 — Reconcile work affected by confirmed loss of handling access

The system SHALL provide the following observable outcome: As an identity and support operator, I want to reconcile work affected by confirmed loss of handling access, so that security takes effect immediately while unfinished work retains truthful custody.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D08-01-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D08-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Only current authoritative identity/permission evidence that the person cannot handle the affected Support conversations admits an access-loss handoff. Qualify the real principal, tenant and resource scope through Core's owner contracts. **Full contract: REQ26-D08-R01.**

#### Scenario: US26-D08-01-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D08-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** At first durable Support admission, create or reconcile one current handoff pursuit for the actual tenant/person/inbox and confirmed loss cause, or a distinct later admitted work cause. Capture the inbox policy and revision once under current guards before enumerating its population; all child items inherit it. **Full contract: REQ26-D08-R04.**

#### Scenario: US26-D08-01-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D08-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The initial access-loss cohort includes affected Open, Waiting for requester and Waiting on our side conversations, including Open with future deferral. Preserve current work meaning, exact valid reminders, responsible inbox/team, priority, recipients and owner-domain facts. **Full contract: REQ26-D08-R05.**

#### Scenario: US26-D08-01-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D08-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Confirmed handling loss immediately makes the former person ineligible for protected actions and for presentation as a valid current handler. Reads distinguish confirmed unavailable from unknown display hydration. **Full contract: REQ26-D08-R06.**

### Requirement: US26-D08-02 — Choose the fixed access-loss handoff policy

The system SHALL provide the following observable outcome: As an inbox administrator, I want to choose the fixed access-loss handoff policy, so that new handoffs use a clear default or qualified review path without changing existing cases.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D08-02-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D08-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Each tenant inbox has one explicit access-loss handoff policy: Return to shared queue, the product default, or Review handoff first. Put it in the existing inbox Assignment settings, separate from new-intake routing, Receive and Pause. **Full contract: REQ26-D08-R02.**

#### Scenario: US26-D08-02-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D08-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Configure policy and review C handoffs are explicit Support administration operations authorized by the existing/developed canonical capability registry and current resource scope. A role label, assignment, coverage-roster membership or ability to remove an account is insufficient. **Full contract: REQ26-D08-R03.**

### Requirement: US26-D08-03 — Settle current shared or review-first handoffs

The system SHALL provide the following observable outcome: As an authorized handoff reviewer, I want to settle current shared or review-first handoffs, so that Pause, moves, restoration and reopening cannot bypass the review that still applies.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D08-03-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D08-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Under A, release to the current responsible inbox's qualified shared handling through one conditional assignment/handoff/history boundary. Preserve the qualified team. **Full contract: REQ26-D08-R07.**

#### Scenario: US26-D08-03-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D08-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Under C, ordinary claim, unassign, macro, bulk assignment, API, automation, move-retain and background jobs cannot bypass the current review requirement. The reviewer must possess current Support handoff-review and necessary assignment/resource authority. **Full contract: REQ26-D08-R08.**

#### Scenario: US26-D08-03-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D08-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** D6/D7 Pause continues to stop autonomous assignment releases, including D8's A Shared release. It does not stop owner-enforced denial, current unavailable presentation, mandatory invalid-assignment repair, durable discovery or visible Needs reassignment. **Full contract: REQ26-D08-R09.**

#### Scenario: US26-D08-03-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D08-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Every effect rechecks current tenant, canonical assignee/control, work lineage, source-loss applicability, policy binding, destination, actor/reviewer and scope at the authoritative mutation boundary. Use the owner governance epoch and current guards, not cached browser state or transaction-start time as proof of current authorization. **Full contract: REQ26-D08-R10.**

#### Scenario: US26-D08-03-AC05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D08-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** An authorized Resolve while C review is pending changes Support work only. Retain the unresolved review and bound mode/provenance. **Full contract: REQ26-D08-R11.**

#### Scenario: US26-D08-03-AC06

- **GIVEN** the actor, source, state and permission conditions specified by US26-D08-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use product-owned durable handoff/assignment effects and the shared workflow dispatch ledger with identifier-only envelopes, bounded claims, tenant-scoped concurrency and recoverable intent. Identity denial, Support invalidation, shared release/review disposition and notifications are distinct effects with honest completion evidence. **Full contract: REQ26-D08-R12.**

### Requirement: US26-D08-04 — Preserve separate data, CRM and sending authority during access loss

The system SHALL provide the following observable outcome: As a support administrator, I want to preserve separate data, CRM and sending authority during access loss, so that revoked authors and replacement handlers cannot rewrite admitted messages or historical evidence.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D08-04-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D08-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Make tenant-aware principal/inbox/conversation/assignment/handoff/history references and unique current-control/effect constraints enforceable. Trusted context supplies tenant, actor, system cause and reviewer; caller IDs are validated targets. **Full contract: REQ26-D08-R13.**

#### Scenario: US26-D08-04-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D08-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A Support requester, message participant, authenticated principal, CRM Party, represented organization, Support assignee and CRM record owner remain distinct. Handoff changes Support handling only. **Full contract: REQ26-D08-R14.**

#### Scenario: US26-D08-04-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D08-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Access-loss handoff sends no donor-facing notice, adds no recipient, changes no reply default and transfers no private unsent draft. New handlers compose under their own actual identities. **Full contract: REQ26-D08-R15.**

### Requirement: US26-D08-05 — Inspect complete handoff progress and qualify rollout

The system SHALL provide the following observable outcome: As a support operator, I want to inspect complete handoff progress and qualify rollout, so that missing display data, large portfolios and worker failures are not presented as successful reassignment.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D08-05-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D08-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use the existing Maia/Base UI/Zinc system and Support assignment/settings/detail surfaces. Present two plainly labelled choices with one-sentence consequences; do not hide meaning behind an ambiguous switch or an unexplained A/C code. **Full contract: REQ26-D08-R16.**

#### Scenario: US26-D08-05-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D08-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Find affected work from canonical IDs and complete server-side predicates before pagination. Browser-loaded lists, hydrated rosters, the current first 1,000/2,000 request/response caps or newest-N snapshots cannot define loss scope, shared coverage, review counts or completion. **Full contract: REQ26-D08-R17.**

#### Scenario: US26-D08-05-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D08-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Retain durable source-loss reference, actual prior and resulting assignment/team, actor/system cause, policy revision, reviewed disposition, current-control version and per-item outcome. Distinguish technical traces, security audit, Support business history and actual human response metrics. **Full contract: REQ26-D08-R18.**

#### Scenario: US26-D08-05-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D08-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Identity-driven assignment invalidation and the two fixed inbox handoff dispositions are Support lifecycle operations, not tenant-authored automation definitions. Their configuration/review uses qualified Support administration; their durable executor uses shared claims/dispatch. **Full contract: REQ26-D08-R19.**

#### Scenario: US26-D08-05-AC05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D08-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Introduce additive versioned policy/control/history and safe projections before enabling effects. Product default Shared is not authorization to sweep pre-existing invalid-owner backlog or reinterpret legacy status. **Full contract: REQ26-D08-R20.**

### Requirement: US26-D09-01 — Add or remove optional peer CRM context

The system SHALL provide the following observable outcome: As a support worker, I want to add or remove optional peer CRM context, so that relevance is useful without changing identity, audience or record ownership.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D09-01-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D09-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A conversation may have no related CRM Party or several. Each active relevance association means only that this existing person, household or organization is relevant to this request. **Full contract: REQ26-D09-R01.**

#### Scenario: US26-D09-01-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D09-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Preserve observed sender endpoints and per-message participants independently of explicit related context. Correspondence attribution uses the existing qualified identity/communication/source contract, with its original source identity, direction and historical contact/attribution evidence. **Full contract: REQ26-D09-R02.**

#### Scenario: US26-D09-01-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D09-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Support owns conversation-to-Party relevance facts. Their endpoints are non-null tenant, canonical Support conversation ID and canonical Party ID, with composite tenant-aware foreign keys to both owner records. **Full contract: REQ26-D09-R03.**

#### Scenario: US26-D09-01-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D09-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A context mutation requires current authority to manage the exact Support conversation's context and the target owner's permission to reference the exact Party for this staff purpose. Derive tenant, actor and audit identity from trusted server context; requested IDs are targets, not authority. **Full contract: REQ26-D09-R04.**

#### Scenario: US26-D09-01-AC05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D09-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Link, remove, correction and conditional Undo use one Support-owned server command boundary. Bind the exact conversation, target set, expected current association/control revisions and durable operation identity. **Full contract: REQ26-D09-R05.**

### Requirement: US26-D09-02 — Find relevant Support conversations and genuine communication history

The system SHALL provide the following observable outcome: As a crm user, I want to find relevant Support conversations and genuine communication history, so that one authorized record view distinguishes context from actual correspondence.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D09-02-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D09-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Existing D1 owner-record references such as a gift, contribution, receipt or statement retain their closed typed owner contract and actual tenant/resource validation. Staff can follow a gift to its beneficiary or legal donor through the owning domain. **Full contract: REQ26-D09-R06.**

#### Scenario: US26-D09-02-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D09-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** For a requested Party, the canonical server read model selects Support conversations justified by an active explicit relevance association OR an independently qualified actual source-message attribution to that Party. Apply joint visibility, then deduplicate by tenant and canonical conversation ID before paging/counting. **Full contract: REQ26-D09-R07.**

#### Scenario: US26-D09-02-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D09-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Add a compact Support conversations section through the qualified Phase 9 header/Overview model. Use the existing Communications capability/socket for View conversations and its complete Support conversations view, with the same Party-scoped gate and shared read contract. **Full contract: REQ26-D09-R08.**

#### Scenario: US26-D09-02-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D09-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** CRM Activity uses Phase 9's one read-composed timeline and existing P6 Communication branch. Support message payloads remain in Support; P6 retains its canonical source/member lineage and body-free governed event contract. **Full contract: REQ26-D09-R09.**

#### Scenario: US26-D09-02-AC05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D09-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** On one Party's CRM Communication view, genuinely shared Support message/source lineage may render as one message tile after visibility filtering and canonical event-ID deduplication. Preserve every underlying recipient-copy event, identity, timestamp and delivery outcome. **Full contract: REQ26-D09-R10.**

### Requirement: US26-D09-03 — Correct links and attribution through owner lifecycle changes

The system SHALL provide the following observable outcome: As an authorized record reviewer, I want to correct links and attribution through owner lifecycle changes, so that removal, merge, redaction and unmerge do not rewrite actual mail or restore forbidden context.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D09-03-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D09-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Remove context link ends only the selected relevance association under current revision and authority. It deletes no Party, conversation, message, receipt, communication fact or relationship, and does not remove a person from To/Cc or a portal. **Full contract: REQ26-D09-R11.**

#### Scenario: US26-D09-03-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D09-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Party merge/unmerge stays owned by Phase 4/9. Register Support relevance in the qualified re-point/dedupe and replay contract: canonicalize the survivor within the tenant, deduplicate overlapping active links, retain original association origins and merge audit, and preserve later authorized edits. **Full contract: REQ26-D09-R12.**

#### Scenario: US26-D09-03-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D09-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Search, cards, previews and audit expose only currently permitted fields. Related context grants no consent or unrestricted transcript visibility to other staff, donors, missionaries or members of a linked organization/household. **Full contract: REQ26-D09-R13.**

### Requirement: US26-D09-04 — Move between the same conversation and owner actions

The system SHALL provide the following observable outcome: As a support or crm worker, I want to move between the same conversation and owner actions, so that I retain my place and draft while every destination checks its own permissions.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D09-04-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D09-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Keep observed sender and email audience separate from Related records. Add records uses the existing qualified Party search/selector with permitted type/name/disambiguation and current link state. **Full contract: REQ26-D09-R14.**

#### Scenario: US26-D09-04-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D09-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** From a CRM row, open the same canonical Support conversation/detail experience with current Support authorization. Preserve the originating Party, view/filter/scroll/selection and the actor's permitted private draft. **Full contract: REQ26-D09-R15.**

#### Scenario: US26-D09-04-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D09-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Linking, unlinking or changing visible context neither adds recipients nor hot-swaps template variables, prepared material, sender, audience, business target or approved relation set. D1/D2/D4/P17/P6 remain authoritative. **Full contract: REQ26-D09-R16.**

#### Scenario: US26-D09-04-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D09-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use indexed tenant/Party/conversation and active association/source-attribution predicates. Union justified discovery paths and deduplicate before keyset pagination. **Full contract: REQ26-D09-R17.**

#### Scenario: US26-D09-04-AC05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D09-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Integrate through Phase 9's shared Party header/overview and per-tab endpoints with the common Party access helper, plus the qualified Support query contract. Keep business reads/writes in the shared business API; use established collection/read-model client patterns rather than bespoke tab-owned truth or a second CRM adapter. **Full contract: REQ26-D09-R18.**

### Requirement: US26-D09-05 — Recover and qualify the shared projections

The system SHALL provide the following observable outcome: As a support and crm operator, I want to recover and qualify the shared projections, so that counts, history, migration and traceability remain accurate without synchronization or duplicate state.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D09-05-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D09-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Record actual actor/system cause, tenant, source conversation, original/canonical target, association generation, command identity, server occurrence, outcome and merge/correction provenance in the owner audit. Protect audit mutation and viewing independently of ordinary record display. **Full contract: REQ26-D09-R19.**

#### Scenario: US26-D09-05-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D09-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Persist the authoritative link outcome and required audit/invalidation or shared dispatch intent together. Dispatch, search-index, realtime or cache failure cannot lose the relation or duplicate it on retry. **Full contract: REQ26-D09-R20.**

#### Scenario: US26-D09-05-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D09-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Follow accepted ADR0001 and the founder-ratified Asym-owned CRM direction. The stale crm-core Twenty/dedicated-datastore paragraphs require explicit correction in governing OpenSpec work; they are not permission to reintroduce Twenty or internal CRM synchronization. **Full contract: REQ26-D09-R21.**

#### Scenario: US26-D09-05-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D09-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Run D9-P01–P32 and applicable D1–D8/P6/P9/P12 prerequisites before release. Prove positive, negative, cross-tenant/resource, concurrency, merge/unmerge, redaction, migration, failure and complete-query outcomes at the real boundaries. **Full contract: REQ26-D09-R22.**

### Requirement: US26-D10-01 — Merge a reviewed pair of duplicate requests

The system SHALL provide the following observable outcome: As an authorized support worker, I want to merge a reviewed pair of duplicate requests, so that one current handling component preserves every original source and permits safe correction.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D10-01-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D10-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Merge is an explicit staff conclusion that two current Support work components represent the same request. The launch command joins one reviewed pair of current roots in the same tenant and current inbox. **Full contract: REQ26-D10-R01.**

#### Scenario: US26-D10-01-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D10-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Keep each original conversation ID, its source messages, original endpoints/headers/times, attachment custody, source business references and history stable. Each original conversation belongs to exactly one current handling component. **Full contract: REQ26-D10-R02.**

#### Scenario: US26-D10-01-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D10-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Merge control, active edge, ended-edge history and command receipt have non-null tenant/canonical endpoints, same-tenant foreign keys, protected actor/cause, operation identity and server occurrence. Enforce one active parent per original source, no self-edge and valid active/ended state combinations with database constraints. **Full contract: REQ26-D10-R03.**

#### Scenario: US26-D10-01-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D10-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A merge or Undo requires current Support capability and resource authority for the complete affected components and exact resulting work/assignment/reminder actions. Current combined handling access is qualified across constituent source conversation protection; each message, attachment, note, CRM record and field keeps its own stricter owner floor. **Full contract: REQ26-D10-R04.**

#### Scenario: US26-D10-01-AC05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D10-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Preview is a current explanation, not a reservation. Commit binds exact source/destination roots, active topology/control revisions, relied-on source readiness, work/reminder/assignment and permission facts, and durable operation identity. **Full contract: REQ26-D10-R05.**

#### Scenario: US26-D10-01-AC06

- **GIVEN** the actor, source, state and permission conditions specified by US26-D10-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** An identical request reconciles its original receipt and reports latest current state separately. Changed semantic input under that identity conflicts. **Full contract: REQ26-D10-R06.**

### Requirement: US26-D10-02 — Continue handling merged work and original email routes

The system SHALL provide the following observable outcome: As a support worker, I want to continue handling merged work and original email routes, so that new input, drafts, reminders and assignments remain correctly scoped.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D10-02-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D10-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Every admitted message/recovery effect retains its immutable source identity. Resolve its original thread/source from qualified owner correlation, then resolve current handling atomically with the D3 effect. **Full contract: REQ26-D10-R07.**

#### Scenario: US26-D10-02-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D10-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A reply retains its exact reviewed target-message/original-source lineage and D2 audience. Opening combined handling neither unions participants nor quotes source history into an external reply. **Full contract: REQ26-D10-R08.**

#### Scenario: US26-D10-02-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D10-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Merge presents one resulting current D3 work plan. Open dominates when any source owes action or required review; matching waits may retain that meaning; mixed blocking waits use Waiting on our side when no immediate action is owed, as D3 already requires. **Full contract: REQ26-D10-R09.**

#### Scenario: US26-D10-02-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D10-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The resulting conversation retains at most one current D3 reminder. Preserve a sole applicable reminder through current qualification. **Full contract: REQ26-D10-R10.**

#### Scenario: US26-D10-02-AC05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D10-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Propose the continuing conversation's current eligible handler/team, with a clear resulting handling summary. A transfer is a new explicitly authorized assignment, not historical owner restoration or D6 initial intake. **Full contract: REQ26-D10-R11.**

### Requirement: US26-D10-03 — Undo a specific current merge relationship

The system SHALL provide the following observable outcome: As an authorized support worker, I want to undo a specific current merge relationship, so that later activity and each resulting current work plan survive without historical rollback.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D10-03-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D10-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Provide persistent Undo merge for each still-active merge relationship. Undo ends that exact edge and detaches its current source subtree. **Full contract: REQ26-D10-R12.**

#### Scenario: US26-D10-03-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D10-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use one Undo algorithm immediately and after later activity. Show two resulting work/handling/follow-up plans. **Full contract: REQ26-D10-R13.**

#### Scenario: US26-D10-03-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D10-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Inbound mail keeps qualified original-thread affinity; a staff reply follows its explicitly selected message/source; attachment and delivery evidence follow that message. Those facts remain with their original component after Undo, regardless of which combined screen displayed them. **Full contract: REQ26-D10-R14.**

#### Scenario: US26-D10-03-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D10-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Keep D9 relevance associations on their original conversation endpoints. The combined Related records view deduplicates current permitted contributing links by canonical Party while retaining provenance. **Full contract: REQ26-D10-R15.**

### Requirement: US26-D10-04 — Inspect combined and original history with clear provenance

The system SHALL provide the following observable outcome: As a support or crm worker, I want to inspect combined and original history with clear provenance, so that navigation, context and message privacy remain coherent before and after separation.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D10-04-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D10-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** For D9 Support conversations, resolve each permitted explicit-context or correspondence source basis through current handling, then deduplicate by tenant/current root BEFORE counts/pagination. One combined work item appears once per Party; keep honest reasons and source provenance. **Full contract: REQ26-D10-R16.**

#### Scenario: US26-D10-04-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D10-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The continuing staff detail presents a single chronological, permission-qualified history of its current component, preserving original message IDs and occurrence times. Use restrained original-conversation provenance on source transitions/details; do not add a bright badge to every message or require constant switching between transcripts. **Full contract: REQ26-D10-R17.**

#### Scenario: US26-D10-04-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D10-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Place Merge duplicate… in the existing More menu. Use qualified search/previous conversations with source ID, permitted subject, sender observations, current work and recent date for disambiguation. **Full contract: REQ26-D10-R18.**

#### Scenario: US26-D10-04-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D10-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Undo merge… is available from the specific merge event/details and optionally success feedback. Both open the same small current-result preview, immediately or later. **Full contract: REQ26-D10-R19.**

#### Scenario: US26-D10-04-AC05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D10-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Messages, private notes, attachments, personalized fields, exports and AI consumers retain their source-owner access and retention/redaction rules. Merge/Undo does not broaden storage policies, regenerate public attachment URLs, copy bodies into audit/P6 or turn member-care content into general CRM history. **Full contract: REQ26-D10-R20.**

### Requirement: US26-D10-05 — Operate and qualify source-preserving merge and Undo

The system SHALL provide the following observable outcome: As a support operator, I want to operate and qualify source-preserving merge and Undo, so that secondary effects, scale, metadata and migration cannot fabricate completion or lose routing.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D10-05-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D10-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Canonical topology and current work are committed together; search/cache/realtime/CRM refresh and operational notifications follow durable identifier-only intent. A failed refresh cannot undo authoritative work or require another Merge. **Full contract: REQ26-D10-R21.**

#### Scenario: US26-D10-05-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D10-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use indexed tenant/original/active-parent/root and source-message predicates; enforce complete current membership and policy before pagination/counts. Avoid browser snapshot merging, per-message reparenting, entire-body rewrites, per-card owner fan-out or unbounded messages inside a transaction. **Full contract: REQ26-D10-R22.**

#### Scenario: US26-D10-05-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D10-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Introduce stable original-source provenance, protected topology/control/history and current read/command contracts before enabling Merge. Never backfill semantic duplicates from subject/email/Party or treat old demo profile-merge content as evidence of an implemented conversation merge. **Full contract: REQ26-D10-R23.**

#### Scenario: US26-D10-05-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D10-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Keep the explicitly reviewed continuing conversation's current staff subject. Original email subjects and headers remain unchanged; staff naming does not rewrite external threads. **Full contract: REQ26-D10-R24.**

#### Scenario: US26-D10-05-AC05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D10-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Prove D10-P01–P39 and relevant D1–D9 owner prerequisites before activation. Tests exercise actual database commands, grants/RLS/RPC and current PDP, routing, source events, concurrency, migrations, degraded projections and complete UI journeys. **Full contract: REQ26-D10-R25.**

### Requirement: US26-D11-01 — Request or reuse bounded accountable internal assistance

The system SHALL provide the following observable outcome: As a support worker, I want to request or reuse bounded accountable internal assistance, so that a specialist receives a useful authorized brief while Support retains requester responsibility.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D11-01-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D11-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Provide contextual Ask for help for a bounded internal action needing accountable tracking. Keep Internal note/mention for a quick consultation, direct authorized owner actions where appropriate, and Assign/Transfer for a deliberate whole-conversation handoff. **Full contract: REQ26-D11-R01.**

#### Scenario: US26-D11-01-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D11-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The current authorized Support handler or responsible shared inbox remains responsible for requester communication. Creating, assigning, starting or completing internal work does not claim, transfer or restore that responsibility, change CRM record ownership, add a recipient or send a message. **Full contract: REQ26-D11-R02.**

#### Scenario: US26-D11-01-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D11-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** If an exact pending or completed owner operation/shared task already represents the bounded action, show it and allow authorized reuse. Do not create another task merely because another conversation needs its result. **Full contract: REQ26-D11-R03.**

#### Scenario: US26-D11-01-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D11-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Persist only the Support relationship and its review evidence: stable original source, exact owner-work identity/purpose/scope, current interest generation, creation provenance, active or ended need, and the exact owner result/revision reviewed or relied upon. Task status, assignee, due date and owner business outcome are current owner projections, never independently editable Support copies. **Full contract: REQ26-D11-R04.**

#### Scenario: US26-D11-01-AC05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D11-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The specialist receives a useful task brief without requiring full Support-conversation access. Admission requires the source owner to authorize release of the explicit brief and selected references for the task purpose and destination. **Full contract: REQ26-D11-R05.**

#### Scenario: US26-D11-01-AC06

- **GIVEN** the actor, source, state and permission conditions specified by US26-D11-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The command derives tenant, actor and session/NHI purpose from trusted context. An authorized eligible destination is a distinct field; never substitute the specialist's ID as the actor to make the present helper assign to that specialist. **Full contract: REQ26-D11-R06.**

### Requirement: US26-D11-02 — Admit assistance with one durable source binding

The system SHALL provide the following observable outcome: As a task and support operator, I want to admit assistance with one durable source binding, so that retry, permissions and work-plan changes do not create duplicate tasks or copied owner truth.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D11-02-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D11-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A single authoritative command admits the new shared task where needed, exact source interests, authorized brief revision, actor/cause history, durable command receipt and required dispatch intents atomically in the shared Postgres boundary. Linking existing work does not recreate or mutate that owner's operation. **Full contract: REQ26-D11-R07.**

#### Scenario: US26-D11-02-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D11-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use non-null tenant and source identity, stable original-conversation relationships, exact closed owner target, purpose/scope, generation and protected occurrence/actor attribution. Shared task children, queues, assignees and Support interests must enforce same-tenant relationships, with composite foreign keys where the shared Postgres owner exists. **Full contract: REQ26-D11-R08.**

#### Scenario: US26-D11-02-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D11-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Retain the current task tables' revoked anon/authenticated raw access. Do not open direct browser table reads or writes as an integration shortcut. **Full contract: REQ26-D11-R09.**

#### Scenario: US26-D11-02-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D11-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Ask for help preserves the current conversation status and reminder by default. Offer an explicit Waiting on our side choice only when the internal step is the current blocker; validate and atomically save the complete D3 plan with admission. **Full contract: REQ26-D11-R10.**

### Requirement: US26-D11-03 — Review returned work and deliberately end my interest

The system SHALL provide the following observable outcome: As a support worker, I want to review returned work and deliberately end my interest, so that results, corrections and current responsibility receive attention without canceling someone else’s operation.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D11-03-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D11-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use shared task statuses and owner-qualified outcomes. For new generic assistance the shared owner must support understandable Assigned/Open, In progress, a typed Needs input or Blocked update while unfinished, and a completion or dismissal with a safe result/reason. **Full contract: REQ26-D11-R11.**

#### Scenario: US26-D11-03-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D11-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Support reviews the exact owner result revision, decides whether its need is satisfied, requires more work or is no longer needed, and records that disposition. A simple Mark reviewed action may finish a satisfied need; it does not send email or resolve the conversation. **Full contract: REQ26-D11-R12.**

#### Scenario: US26-D11-03-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D11-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Qualify named shared notification occurrences for assistance assignment, relevant return/input/blockage and custody/recovery. The generic assignment/mention slot is currently deferred in P17; activation must supply its typed producer, audience, source applicability, dedupe and end rules rather than assuming a generic bell already implements it. **Full contract: REQ26-D11-R13.**

#### Scenario: US26-D11-03-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D11-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Owner event/revision, work meaning and original source-interest generation identify relevance. Serialize current interest/review transitions with D3/D10 controls; resolve original sources to current continuing conversations at effect admission. **Full contract: REQ26-D11-R14.**

#### Scenario: US26-D11-03-AC05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D11-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Keep immutable creation origin separate from the exact reviewed original sources whose Support work needs the result. General assistance for the current combined request binds that current reviewed member set; selected source-specific work binds its actual affected subset. **Full contract: REQ26-D11-R15.**

#### Scenario: US26-D11-03-AC06

- **GIVEN** the actor, source, state and permission conditions specified by US26-D11-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Stop following this work ends this conversation's exact current interests, with a clear reason and durable receipt. It does not cancel work used elsewhere, erase source history, retract a result or roll back a financial effect. **Full contract: REQ26-D11-R16.**

### Requirement: US26-D11-04 — Collaborate through a clear private task and CRM journey

The system SHALL provide the following observable outcome: As a support or specialist worker, I want to collaborate through a clear private task and CRM journey, so that internal content and owner outcomes are not silently sent to the requester.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D11-04-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D11-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Requester, email participant, authenticated user, CRM Party/relationship, represented organization, Support handler, task destination and CRM owner remain distinct. No CRM identity is required or created by asking for help. **Full contract: REQ26-D11-R17.**

#### Scenario: US26-D11-04-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D11-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Ask for help and Return update are internal commands, visually and structurally separate from the requester reply composer. An internal task comment cannot be changed into an external reply by changing a mode flag. **Full contract: REQ26-D11-R18.**

#### Scenario: US26-D11-04-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D11-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Minimize brief/result content and classify it at the owning boundary. Current task, source and owner restrictions apply to body search, excerpts, counts, notification/email previews, mobile views, exports, audit readers and storage. **Full contract: REQ26-D11-R19.**

#### Scenario: US26-D11-04-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D11-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use the existing Asym shell, shared controls and base-maia design language. Ask for help opens a contextual panel preserving conversation/CRM position. **Full contract: REQ26-D11-R23.**

### Requirement: US26-D11-05 — Qualify and recover assistance under realistic load

The system SHALL provide the following observable outcome: As a shared-task and support operator, I want to qualify and recover assistance under realistic load, so that source events, delivery failures and upgrades remain observable and safe.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D11-05-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D11-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Query current task/interest/outcome summaries server-side with tenant/owner policy before counts and pagination. Use indexes for exact receipt lookup, active source/work/purpose bindings, owner-event relevance and due/current queue work. **Full contract: REQ26-D11-R20.**

#### Scenario: US26-D11-05-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D11-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A lost browser response shows Checking request and reconciles the original receipt; known rejection preserves the brief for correction. Stale source/destination/merge state refreshes a safe preview without posting to another target. **Full contract: REQ26-D11-R21.**

#### Scenario: US26-D11-05-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D11-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Extend the shared task owner and its source contract additively. Existing contribution work retains its source, assignment and behavior; no global reinterpretation of historical task links or generic status reset. **Full contract: REQ26-D11-R22.**

#### Scenario: US26-D11-05-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D11-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Carry D11-R01–R24 and D11-P01–P40 through the glossary/ADR, governing OpenSpec requirements, design, implementation tasks, tickets and release evidence without rewriting D1–D10. Record current implementation gaps separately from intended behavior. **Full contract: REQ26-D11-R24.**

### Requirement: US26-D12-01 — Create independent related work from an exact source message

The system SHALL provide the following observable outcome: As a support worker, I want to create independent related work from an exact source message, so that separate issues can be handled without moving or copying received correspondence.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D12-01-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Create related conversation is an authorized staff judgment that a requester issue merits independent handling, status or follow-up. Keep one coordinated conversation when clearer; use D11 for internal substeps and D10 for genuine duplicates. **Full contract: REQ26-D12-R01.**

#### Scenario: US26-D12-01-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Create a new stable original conversation with staff-created provenance, server creation time, trigger reference and declared bounded request. Do not move/reparent original messages, change their sender/time/headers, clone attachments or rerun inbound ingestion. **Full contract: REQ26-D12-R02.**

#### Scenario: US26-D12-01-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use one narrow reciprocal related-work relationship between stable original conversation endpoints. No parent/main designation, implicit containment, transitive group ownership or generic arbitrary-record graph is introduced. **Full contract: REQ26-D12-R03.**

#### Scenario: US26-D12-01-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The new work holds an authored minimal summary and explicit source-message/revision references. It does not copy the whole transcript, all internal notes, arbitrary selected paragraphs as received mail, old recipients or attachments. **Full contract: REQ26-D12-R04.**

#### Scenario: US26-D12-01-AC05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Derive tenant, actor, source identity, creation provenance and cause from trusted server/NHI context. Require current create/manage authority for the source action and new destination, exact context release and every included work/assignment/reminder/Party-link operation. **Full contract: REQ26-D12-R05.**

#### Scenario: US26-D12-01-AC06

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use non-null tenant and original endpoint identity, same-tenant foreign keys, typed trigger/citation relationships, protected occurrence/generation and actor/time fields. Enforce active unordered-pair uniqueness, no self-pair, valid active/ended relation state, staff-origin/no-native-mail consistency, and durable command/referral receipt uniqueness. **Full contract: REQ26-D12-R06.**

#### Scenario: US26-D12-01-AC07

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** One conditional source-owned transaction admits the new conversation, brief/release, exact citations, relation, current destination/source work plans, authorized optional links/interests, audit, durable command receipt and required identifier-only dispatch/invalidation intent. A known rejection creates none. **Full contract: REQ26-D12-R07.**

### Requirement: US26-D12-02 — Review both resulting work and custody plans

The system SHALL provide the following observable outcome: As a support worker, I want to review both resulting work and custody plans, so that continued work, reminders and internal interests remain owed in a valid current home.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D12-02-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The new conversation starts Open because independent work now needs attention. The original keeps its current valid plan by default. **Full contract: REQ26-D12-R08.**

#### Scenario: US26-D12-02-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Prefill the new destination with the source's current inbox and current eligible handler; Shared remains Shared. Display that as a new reviewed assignment, not inherited authority or automatic creator ownership. **Full contract: REQ26-D12-R09.**

#### Scenario: US26-D12-02-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Show the original reminder and any relevant promised follow-up when reviewing the two work plans. The new Open conversation has no inherited reminder by default; an explicit Open-plus-reminder uses D3. **Full contract: REQ26-D12-R10.**

### Requirement: US26-D12-03 — Start a deliberate native email thread for the new issue

The system SHALL provide the following observable outcome: As a support worker, I want to start a deliberate native email thread for the new issue, so that the new original owns its actual message and route without claiming old correspondence.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D12-03-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A staff-created conversation has no native email to reply to initially. Its primary external action is **Start email thread**, opening an explicit new composition owned by that new original conversation; its current root supplies handling and authorization only. **Full contract: REQ26-D12-R11.**

#### Scenario: US26-D12-03-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use the existing human Support communication producer with a narrowly qualified new-thread composition mode. Email Studio supplies eligible published Support templates and D4's content-only saved reply wording/presentation, with the same variable allow-list, current owner facts, safe fallback/missing-variable behavior and preview. **Full contract: REQ26-D12-R12.**

#### Scenario: US26-D12-03-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Distinguish the internal message/member/intent IDs, Resend API email_id and actual RFC Message-ID. Resend's 8 July 2026 capability exposes actual message_id through email webhooks and GET email retrieval. **Full contract: REQ26-D12-R13.**

### Requirement: US26-D12-04 — Refer an old-route update and navigate related work

The system SHALL provide the following observable outcome: As a support worker, I want to refer an old-route update and navigate related work, so that the requester can reply normally while staff place only the permitted review where needed.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D12-04-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Admit old-route input to its original source/current D10 root normally. Do not redirect or fan it out by subject, AI topic inference, a related link or a prior continuation ending. **Full contract: REQ26-D12-R14.**

#### Scenario: US26-D12-04-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Serialize create/referral/correction against source appends, current-root changes, work/assignment/reminder controls, D11 bindings and send admission using the canonical guarded mutation boundaries and consistent locking order. Preview is not a reservation; re-resolve current roots/permissions and material revisions at commit. **Full contract: REQ26-D12-R15.**

#### Scenario: US26-D12-04-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Related endpoints and citations remain bound to originals. Project each permitted endpoint through its current D10 root and deduplicate before counts/pages. **Full contract: REQ26-D12-R16.**

#### Scenario: US26-D12-04-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Requester endpoint, participant, authenticated user, CRM person/household/organization, represented party, Support handler, task worker and CRM owner stay distinct. No Party is mandatory or auto-created. **Full contract: REQ26-D12-R17.**

#### Scenario: US26-D12-04-AC05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Show a compact **Related conversations** section only when relevant, with permitted topic, current handler/work state and a clear link; do not display a graph, parent/child tabs or duplicate full transcripts. Source context is labelled **From another conversation** with the actual original time and a permitted View original action. **Full contract: REQ26-D12-R18.**

### Requirement: US26-D12-05 — Correct relationships, context or unused tracking

The system SHALL provide the following observable outcome: As an authorized support worker, I want to correct relationships, context or unused tracking, so that the actual mistake can be repaired without losing an obligation or recalling mail.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D12-05-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Provide current authorized **Remove relationship** and **Correct context** actions. Explain that removing related navigation does not delete conversations, erase required provenance/correspondence, undo current work or recall mail. **Full contract: REQ26-D12-R19.**

#### Scenario: US26-D12-05-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Review creation may offer **Cancel unused conversation** only while the staff-created work has no subsequent independent activity, native/admitted/possibly submitted mail, external/owner effects, active merge participation, additional dependent continuation/referral or protected draft being discarded. Validate exact creation/control revisions and full current authority. **Full contract: REQ26-D12-R20.**

#### Scenario: US26-D12-05-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Apply the original/source and new-work owner floors to briefs, title search, excerpts, attachments, exports, notification previews, audit readers and caches. Do not make a copied excerpt or expiring signed URL a permanent independent source authority. **Full contract: REQ26-D12-R22.**

### Requirement: US26-D12-06 — Qualify the complete related-work lifecycle and performance

The system SHALL provide the following observable outcome: As a support operator, I want to qualify the complete related-work lifecycle and performance, so that attention, metrics, migration and recovery remain source-accurate.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D12-06-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Creation/referral/current-custody changes create only the qualified source/task/Support attention required for actual current staff work. Use existing shared notification producer/presentation rules; OBL-028 generic assignment/mention must be qualified for the actual source and recipients before activation. **Full contract: REQ26-D12-R21.**

#### Scenario: US26-D12-06-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Store real received/source occurrence, staff-created and current work-transition times separately. The selected trigger supplies an auditable request-received basis; additional old context does not arbitrarily backdate a new issue. **Full contract: REQ26-D12-R23.**

#### Scenario: US26-D12-06-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Resolve related/current-root/citation summaries server-side under current policy before counts and pagination. Index tenant-scoped endpoint, source-message/referral, receipt and current-work lookups. **Full contract: REQ26-D12-R24.**

#### Scenario: US26-D12-06-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use existing Asym/base-maia shared controls. Create related conversation is a secondary contextual action distinct from Ask for help, Reply and Merge. **Full contract: REQ26-D12-R25.**

#### Scenario: US26-D12-06-AC05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Qualify the new staff-origin shape, D3 non-success ending, D2 new-thread mode, P17/P6 provider mapping, protected relations/citations/referrals, current-root controls and new notification occurrences before exposing the action. Preserve existing incoming and contribution/shared-task behavior. **Full contract: REQ26-D12-R26.**

#### Scenario: US26-D12-06-AC06

- **GIVEN** the actor, source, state and permission conditions specified by US26-D12-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Carry D12-R01–R27 and D12-P01–P45 through the selected answer, glossary/ADR, governing OpenSpec/design/tasks/tickets/tests and release evidence. D12 explicitly proposes narrow D3 continuation/administrative-ending and D2 first-new-thread composition extensions; it preserves D10 original custody and D11 immutable interest meaning. **Full contract: REQ26-D12-R27.**

### Requirement: US26-D13-01 — Enable a clear New request confirmation policy

The system SHALL provide the following observable outcome: As an inbox administrator, I want to enable a clear New request confirmation policy, so that qualified new requests receive the selected service acknowledgment without hidden backlog sending.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D13-01-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D13-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The confirmation means only that qualified intake has durably accepted a recoverable Support request. It is an informational service email, distinct from a charitable-gift acknowledgment, staff reply, resolution notice, knowledge answer, receipt of payment or task notification. **Full contract: REQ26-D13-R01.**

#### Scenario: US26-D13-01-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D13-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Expose exactly New requests (recommended), Outside service hours and Off for this purpose. A new inbox setup proposes New requests with the compatible Asym starter publication; an authorized administrator reviews and saves it as part of qualified inbox activation. **Full contract: REQ26-D13-R02.**

#### Scenario: US26-D13-01-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D13-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Create a server-timed eligibility activation generation on enablement or mode change. An as-yet-unbound intake may bind only the current generation, and only if its qualified original provider receipt is at or after that generation's effective-from instant. **Full contract: REQ26-D13-R07.**

#### Scenario: US26-D13-01-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D13-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use a compact settings section with a labelled mode control, compatible template summary, sender summary, Preview and Edit in Email Studio. The outside-hours mode alone discloses the qualified calendar link/zone and missing-calendar blocker. **Full contract: REQ26-D13-R21.**

### Requirement: US26-D13-02 — Apply exact safe confirmation eligibility

The system SHALL provide the following observable outcome: As a receiving operator, I want to apply exact safe confirmation eligibility, so that a real recoverable request may be confirmed without loops, guessed recipients or stale mail.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D13-02-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D13-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Only a receiving-owner-qualified email that creates a genuinely new original requester conversation can originate this purpose. Persist the source occurrence, verified provider account/receive identity, original conversation, trusted first-receipt time, source/safety revision and decision even if later preparation fails. **Full contract: REQ26-D13-R03.**

#### Scenario: US26-D13-02-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D13-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Specify this as the narrowly defined RFC 3834 service-responder use of the original RFC 5322 From mailbox. Require exactly one syntactically valid original From address and current trusted receiving/safety evidence permitting this low-content automatic response to it. **Full contract: REQ26-D13-R04.**

#### Scenario: US26-D13-02-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D13-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Suppress automatic response to detected automatic mail, delivery/read reports, null reverse-path, non-`no` Auto-Submitted, applicable auto-response-suppression directives, list/bulk traffic, own delivery/return addresses or routes, known loop chains and qualified spam/abuse. Missing trustworthy raw/header evidence is not a clean result. **Full contract: REQ26-D13-R05.**

#### Scenario: US26-D13-02-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D13-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Freeze `confirmation_utility_ends_at = qualified_first_provider_receipt_at + 15 minutes`. Dispatch authority exists only strictly before that instant, with no intentional delay. **Full contract: REQ26-D13-R06.**

### Requirement: US26-D13-03 — Publish a bounded truthful Support request received message

The system SHALL provide the following observable outcome: As an email studio publisher, I want to publish a bounded truthful Support request received message, so that branding and localization preserve the protected meaning and normal email continuation.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D13-03-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D13-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Admit one closed key `support.request_received` and one compatible Support service-confirmation document/profile generation. The final key spelling is a manifest implementation identifier, not a new user concept. **Full contract: REQ26-D13-R08.**

#### Scenario: US26-D13-03-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D13-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Provide the **Support request received** starter as an Asym-structured Email Studio document with immutable publication/dependency pins under ADR0030. Its permitted facts are approved tenant public identity, the source-owned received meaning, safe reply-subject derivation, and optional governed calendar information. **Full contract: REQ26-D13-R09.**

#### Scenario: US26-D13-03-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D13-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use the qualified original message's RFC Message-ID for In-Reply-To and its validated bounded References chain plus that ID. Use the existing safe reply-subject plan, normally one `Re:` prefix and the original sanitized subject, with an approved neutral fallback when absent. **Full contract: REQ26-D13-R10.**

#### Scenario: US26-D13-03-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D13-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** P17 resolves the current permitted tenant/site sender and monitored Support return identity through ADR0029; it never uses the assigned worker's personal identity or a platform/default account fallback. Freeze the exact connection, credential revision, domain, sender and return authority at preparation/submission. **Full contract: REQ26-D13-R11.**

#### Scenario: US26-D13-03-AC05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D13-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Only compatible published P17 content is eligible. Resolve locale from qualified request context when available, otherwise the inbox's configured locale, then its published whole-message fallback policy. **Full contract: REQ26-D13-R16.**

### Requirement: US26-D13-04 — Admit and recover one current automatic confirmation

The system SHALL provide the following observable outcome: As a delivery operator, I want to admit and recover one current automatic confirmation, so that concurrency, human replies, contact restrictions and uncertainty never create another send.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D13-04-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D13-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The Support intake transaction commits the original source decision, complete immutable semantic command identity, canonical P17 occurrence slot binding or durable registration outbox, body-free history and required recovery work together. Where owners cannot share a database transaction, use the existing durable outbox and unique consumer receipt, not an unsafe dual write. **Full contract: REQ26-D13-R12.**

#### Scenario: US26-D13-04-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D13-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use existing owner tables/services where sound, adding only the narrow source decision/binding needed for this purpose. Require non-null tenant/environment/original source/purpose/generation, tenant-aware foreign keys for original conversation, received message, publication, intent and delivery, unique original-source/purpose occurrence and provider-account/receive identity, typed disposition/reason and UTC timestamptz deadlines. **Full contract: REQ26-D13-R13.**

#### Scenario: US26-D13-04-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D13-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Add a narrow `prepared.automatic_confirmation_15m@1` class: the absolute R06 deadline, not 15 minutes after a delayed seal; the earliest privacy/safety/consent/utility terminal wins. Preparation freezes the whole published message, source facts, locale/fallback, presentation, audience and composed delivery identities. **Full contract: REQ26-D13-R14.**

#### Scenario: US26-D13-04-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D13-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Keep source decision, preparation/submission and provider delivery outcomes separate. Meaningful source states are awaiting qualification, eligible, skipped with a reason, preparation blocked, prepared definitely unsubmitted, submission may have begun, and known provider outcomes; these are processing states, not extra Support statuses. **Full contract: REQ26-D13-R15.**

#### Scenario: US26-D13-04-AC05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D13-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** An ordinary inbound continuation or reopened request is not another confirmation; repeated deliveries, merge/undo, internal actions, D12 new related work, first staff-origin email, referral and administrative correction are excluded triggers. A held original that qualifies within its frozen window is evaluated as that original, not a new conversation. **Full contract: REQ26-D13-R19.**

#### Scenario: US26-D13-04-AC06

- **GIVEN** the actor, source, state and permission conditions specified by US26-D13-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The owner classifies this purpose as service/transactional; a caller cannot select that exemption. Enforce current address restrictions, hard bounces, complaints, manual blocks and applicable privacy restrictions through the qualified shared owner resolver, including no-Party requests. **Full contract: REQ26-D13-R20.**

### Requirement: US26-D13-05 — See honest automatic correspondence and operational readiness

The system SHALL provide the following observable outcome: As a support or crm worker, I want to see honest automatic correspondence and operational readiness, so that automatic confirmation does not replace human work, create a body archive or inflate stewardship metrics.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: US26-D13-05-AC01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D13-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Represent actual admitted automatic correspondence once through its P6 occurrence and original Support source linkage. Show Automatic confirmation with the real delivery state; a body-free processing detail records expected no-send decisions, without a fake outgoing bubble. **Full contract: REQ26-D13-R17.**

#### Scenario: US26-D13-05-AC02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D13-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The original requester, From mailbox, authenticated user, related Party, represented organization, assigned Support worker and CRM owner remain separate. No acknowledgment creates/merges a Party, changes an email preference/CRM owner, asserts representation or performs a giving/account/care action. **Full contract: REQ26-D13-R18.**

#### Scenario: US26-D13-05-AC03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D13-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The donor receives a brief readable tenant-branded service email with no personal staff signature, compulsory link, tracking CTA, campaign footer or duplicate confirmation. Make automatic attribution visible but quiet. **Full contract: REQ26-D13-R22.**

#### Scenario: US26-D13-05-AC04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D13-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Process indexed tenant/source/state/due-time pages through shared durable delivery and repair infrastructure, not a scan of every Support conversation or a per-conversation polling timer. No browser 2,000-row export/filter can select authoritative work. **Full contract: REQ26-D13-R23.**

#### Scenario: US26-D13-05-AC05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D13-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Qualify the P17 key/profile/material class, receiving authenticity contract, adapter/header/outcome semantics, current contactability and canonical Support writer boundaries before activation. Existing generic raw-template activity flags, local fake message IDs, permissive Support grants and separate source/history writes are not production proof. **Full contract: REQ26-D13-R24.**

#### Scenario: US26-D13-05-AC06

- **GIVEN** the actor, source, state and permission conditions specified by US26-D13-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The starter below is an implementation deliverable. Historical CLI dry-run observations are evidence only; live qualified provider/compiler/mailbox proof remains required before activation, and no send is performed by specification publication. **Full contract: REQ26-D13-R25.**

#### Scenario: US26-D13-05-AC07

- **GIVEN** the actor, source, state and permission conditions specified by US26-D13-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Keep the founder's selection, every proposed amendment, glossary, exploratory ADR, source evidence, UI/template contract, proof matrix and known limits linked and consistent. D1–D12 remain preserved. **Full contract: REQ26-D13-R26.**

### Requirement: US26-D14-01 — Configure reply targets

The system SHALL provide the following observable outcome: As an inbox administrator, I want to configure optional First and Next durations and an explicit time basis, so that staff see a truthful expectation.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D14-P01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D14-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Off/unconfigured starts with no active targets or seeded hours; existing queues/reminders work. Enable First only, Next only or both with deliberate durations and explicit basis.

#### Scenario: AC26-D14-P02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D14-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Zero, negative, nonfinite, fractional-minute, ambiguous days and overflow inputs reject with preserved fields; hours/minutes conversion is exact.

#### Scenario: AC26-D14-P04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D14-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** New policy generation cannot adopt earlier received/unbound work; repeat processing and re-enable cannot target the same untargeted current burst. Ordinary edits preserve pending targets.

Additional binding suite/requirement identifiers: AC26-D14-P01, AC26-D14-P02, AC26-D14-P03, AC26-D14-P04, AC26-D14-P05, AC26-D14-P06, AC26-D14-P07, AC26-D14-P08, AC26-D14-P37. REQ26-D14-R01, REQ26-D14-R02, REQ26-D14-R03, REQ26-D14-R04, REQ26-D14-R05, REQ26-D14-R20.

### Requirement: US26-D14-02 — See the correspondence still owed

The system SHALL provide the following observable outcome: As a Support responder, I want to see exact original correspondent contributions and waiting age, so that new input cannot hide an earlier obligation.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D14-P09

- **GIVEN** the actor, source, state and permission conditions specified by US26-D14-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Duplicate/automated/quarantined/unrelated input creates no new human reply period; qualified late release preserves original source age and separately exposes intake delay.

#### Scenario: AC26-D14-P12

- **GIVEN** the actor, source, state and permission conditions specified by US26-D14-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Actual human reply to B cannot clear A; a group reply covers only reviewed actual accepted members. Reply-to/route correction preserves age and does not use CRM matching as authority.

#### Scenario: AC26-D14-P14

- **GIVEN** the actor, source, state and permission conditions specified by US26-D14-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Input after frozen send coverage stays owed. Acceptance closes only covered oldest work and creates the proper original-time successor; definite rejection preserves older debt/deadline.

Additional binding suite/requirement identifiers: AC26-D14-P09, AC26-D14-P10, AC26-D14-P11, AC26-D14-P12, AC26-D14-P13, AC26-D14-P14, AC26-D14-P15, AC26-D14-P16, AC26-D14-P51, AC26-D14-P55. REQ26-D14-R06, REQ26-D14-R07, REQ26-D14-R08, REQ26-D14-R10.

### Requirement: US26-D14-03 — Settle and correct reply obligations

The system SHALL provide the following observable outcome: As a Support responder, I want to use actual accepted replies or exact No reply needed corrections, so that response evidence and remaining promises stay honest.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D14-P17

- **GIVEN** the actor, source, state and permission conditions specified by US26-D14-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Draft/queued/automatic/internal-note/status/task events earn no human reply credit. Genuine human progress or clarification may count without resolution. No AI/body-length classifier decides semantic quality.

#### Scenario: AC26-D14-P18

- **GIVEN** the actor, source, state and permission conditions specified by US26-D14-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Exact P6 acceptance time scores correctly. Bounded intervals wholly before/after/straddling due yield on-time/late/unknown; earlier ambiguity and definite rejection alter bounds correctly.

#### Scenario: AC26-D14-P52

- **GIVEN** the actor, source, state and permission conditions specified by US26-D14-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Partial No reply needed cannot clear uncovered input; oldest-prefix versus non-prefix behavior and persistent Undo reconcile current work without duplicate periods, new source consumption or re-enabling Off targets.

Additional binding suite/requirement identifiers: AC26-D14-P17, AC26-D14-P18, AC26-D14-P19, AC26-D14-P20, AC26-D14-P21, AC26-D14-P22, AC26-D14-P23, AC26-D14-P52. REQ26-D14-R09, REQ26-D14-R11.

### Requirement: US26-D14-04 — Find due work in its current home

The system SHALL provide the following observable outcome: As a Support responder, I want to review due or uncertain work through moves, waits, merges and continuations, so that deadlines remain visible without clock resets.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D14-P24

- **GIVEN** the actor, source, state and permission conditions specified by US26-D14-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Due creates one Open review while preserving a valid future reminder; overdue work is visible despite deferral. Explicit Open still clears the reminder.

#### Scenario: AC26-D14-P31

- **GIVEN** the actor, source, state and permission conditions specified by US26-D14-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Cancel unused B/hand-off correction rehomes owed targets before retirement; stale A/B/root cycles, duplicate transfer and concurrent Undo cannot orphan work.

#### Scenario: AC26-D14-P54

- **GIVEN** the actor, source, state and permission conditions specified by US26-D14-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A known overdue obligation remains the primary cue/filter match despite an earlier uncertain candidate; a future known target cannot hide an earlier candidate. Sample labels distinguish completed waits from emails.

Additional binding suite/requirement identifiers: AC26-D14-P24, AC26-D14-P25, AC26-D14-P26, AC26-D14-P27, AC26-D14-P28, AC26-D14-P29, AC26-D14-P30, AC26-D14-P31, AC26-D14-P35, AC26-D14-P36, AC26-D14-P39, AC26-D14-P54. REQ26-D14-R12, REQ26-D14-R13, REQ26-D14-R14, REQ26-D14-R15, REQ26-D14-R19, REQ26-D14-R21.

### Requirement: US26-D14-05 — Interpret performance correctly

The system SHALL provide the following observable outcome: As an authorized reporting user, I want to compare due cohorts, uncertainty, completed waits and backlog, so that administrative cleanup does not improve the score.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D14-P40

- **GIVEN** the actor, source, state and permission conditions specified by US26-D14-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Targets due cohort uses frozen due and half-open selected interval/report zone; first/next instances differ from conversations, and candidate splits are not double-counted.

#### Scenario: AC26-D14-P43

- **GIVEN** the actor, source, state and permission conditions specified by US26-D14-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Completed durations cannot hide unanswered backlog; bound calendars, current/source responsibility and responding actor dimensions remain explicitly separate across reassignment/merge.

#### Scenario: AC26-D14-P53

- **GIVEN** the actor, source, state and permission conditions specified by US26-D14-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Unfinalized candidate due/completion intervals intersecting report boundaries appear once in separate uncertain-cohort coverage, outside exact denominators/duration samples; finalized-only data cannot imply complete coverage.

Additional binding suite/requirement identifiers: AC26-D14-P40, AC26-D14-P41, AC26-D14-P42, AC26-D14-P43, AC26-D14-P44, AC26-D14-P53. REQ26-D14-R22, REQ26-D14-R23, REQ26-D14-R24.

### Requirement: US26-D14-06 — Retain cross-domain authority

The system SHALL provide the following observable outcome: As a jointly authorized Support and CRM user, I want to navigate between target work and CRM context, so that timing changes do not send mail or complete business actions.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D14-P45

- **GIVEN** the actor, source, state and permission conditions specified by US26-D14-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Support→CRM→Support navigation preserves context and joint access. Target changes create no CRM email/Party/owner/financial/task completion or D13 deadline promise.

#### Scenario: AC26-D14-P47

- **GIVEN** the actor, source, state and permission conditions specified by US26-D14-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Privacy/retention/erasure/backup restore cannot expose raw target recipient/source data or recreate identities; permitted body-free history and current recovery remain coherent.

Additional binding suite/requirement identifiers: AC26-D14-P45, AC26-D14-P47. REQ26-D14-R25, REQ26-D14-R27.

### Requirement: US26-D14-07 — Operate and qualify reply targets

The system SHALL provide the following observable outcome: As a Support platform operator, I want to secure, recover and roll out source-qualified target effects, so that races and repair cannot duplicate work or disclose content.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D14-P32

- **GIVEN** the actor, source, state and permission conditions specified by US26-D14-07 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Tenant-aware FKs, source/coverage uniqueness, collecting-only uniqueness and typed nullability reject invalid states while admitting legitimate sealed coexistence. No time-relative check rejects overdue rows.

#### Scenario: AC26-D14-P33

- **GIVEN** the actor, source, state and permission conditions specified by US26-D14-07 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Direct SELECT/DML, HTTP/RPC/view/storage/export/cache and service-worker probes cannot forge actor/proof/tenant/source/policy or expose restricted target existence/content. Test old-row USING and new-row WITH CHECK.

#### Scenario: AC26-D14-P34

- **GIVEN** the actor, source, state and permission conditions specified by US26-D14-07 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Intake/target-outbox or fulfillment/due-review crash points leave one recoverable effect; lost responses reconcile original operation IDs, and late UI responses cannot overwrite newer state.

Additional binding suite/requirement identifiers: AC26-D14-P32, AC26-D14-P33, AC26-D14-P34, AC26-D14-P38, AC26-D14-P46, AC26-D14-P48, AC26-D14-P49, AC26-D14-P50. REQ26-D14-R16, REQ26-D14-R17, REQ26-D14-R18, REQ26-D14-R26, REQ26-D14-R28, REQ26-D14-R29, REQ26-D14-R30.

### Requirement: US26-D15-01 — Choose my exact follow scope

The system SHALL provide the following observable outcome: As a Support staff member, I want to explicitly Follow and Stop my current authorized originals, so that interest does not transfer assignment or access.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D15-P01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D15-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Authenticate two staff principals/tenants/roles. Follow and preferences always bind the current trusted subject; spoofed tenant/agent/role/actor cannot enroll or alter another person.

#### Scenario: AC26-D15-P03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D15-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Following cannot grant read/send/CRM/care access. Hidden originals, names, counts and endpoints stay absent from picker, preview, errors and returned scope.

#### Scenario: AC26-D15-P04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D15-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Exact Follow retry returns one result/generation; same token with changed scope/desire conflicts. A timeout remains reconcilable without a second toggle.

Additional binding suite/requirement identifiers: AC26-D15-P01, AC26-D15-P02, AC26-D15-P03, AC26-D15-P04, AC26-D15-P05, AC26-D15-P06, AC26-D15-P07, AC26-D15-P08, AC26-D15-P09, AC26-D15-P44. REQ26-D15-R01, REQ26-D15-R02, REQ26-D15-R03, REQ26-D15-R04, REQ26-D15-R05, REQ26-D15-R19.

### Requirement: US26-D15-02 — Receive useful permitted activity

The system SHALL provide the following observable outcome: As a following staff member, I want to receive the finite human activity set with proper self-event and overlap rules, so that required work stays visible without routine noise.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D15-P10

- **GIVEN** the actor, source, state and permission conditions specified by US26-D15-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** E1 requires first qualified human input; automated/quarantined/duplicate/unrelated mail and attachment readiness repeats produce no follower body/notice.

#### Scenario: AC26-D15-P11

- **GIVEN** the actor, source, state and permission conditions specified by US26-D15-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** E2 requires actual accepted human reply and exact source/member evidence. Draft/queued/unknown/automatic mail earn no sent-human event; partial outcomes are not universal success.

#### Scenario: AC26-D15-P12

- **GIVEN** the actor, source, state and permission conditions specified by US26-D15-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** E3 exposes only permitted published human note evidence. System rows, drafts, denied notes and edit/redaction repeats cannot leak or create alert storms.

Additional binding suite/requirement identifiers: AC26-D15-P10, AC26-D15-P11, AC26-D15-P12, AC26-D15-P13, AC26-D15-P14, AC26-D15-P15, AC26-D15-P16, AC26-D15-P17. REQ26-D15-R06, REQ26-D15-R07, REQ26-D15-R08.

### Requirement: US26-D15-03 — Control optional email and attention

The system SHALL provide the following observable outcome: As a following staff member, I want to control my optional email channel and understand notice expiry, so that preferences cannot suppress required reasons or revive old events.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D15-P18

- **GIVEN** the actor, source, state and permission conditions specified by US26-D15-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** One E4 member with frozen A+B contributions survives Stop A while B is valid; Stop both suppresses it. New C or re-followed A cannot join that member.

#### Scenario: AC26-D15-P20

- **GIVEN** the actor, source, state and permission conditions specified by US26-D15-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** After successful release, replay returns exact plan/member pins. Current follower queries, plan edits and re-follow cannot change membership or occurrence identity.

#### Scenario: AC26-D15-P22

- **GIVEN** the actor, source, state and permission conditions specified by US26-D15-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Whole P6 parent/count/digest/ordinal release is all-before-any. Missing/extra/stale/over-limit candidates or precommit crash release no partial set; postcommit lost response replays once.

Additional binding suite/requirement identifiers: AC26-D15-P18, AC26-D15-P19, AC26-D15-P20, AC26-D15-P21, AC26-D15-P22, AC26-D15-P23, AC26-D15-P24, AC26-D15-P25, AC26-D15-P26, AC26-D15-P35, AC26-D15-P36, AC26-D15-P37, AC26-D15-P38, AC26-D15-P39, AC26-D15-P52, AC26-D15-P53, AC26-D15-P54. REQ26-D15-R09, REQ26-D15-R10, REQ26-D15-R11, REQ26-D15-R12.

### Requirement: US26-D15-04 — Preserve interests through source changes

The system SHALL provide the following observable outcome: As a following staff member, I want to retain exact original interests through topology and access changes, so that merges, role changes and regrant do not widen or transfer scope.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D15-P27

- **GIVEN** the actor, source, state and permission conditions specified by US26-D15-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Permission loss between command, candidate admission, dispatch, preview and click removes protected access/current presentation; same-tenant role changes cannot expose old notices.

#### Scenario: AC26-D15-P28

- **GIVEN** the actor, source, state and permission conditions specified by US26-D15-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** PDP/identity timeout fails closed while preserving intent. A positive revoke ends only affected generations; a transient outage is never fabricated as an access-loss event.

#### Scenario: AC26-D15-P29

- **GIVEN** the actor, source, state and permission conditions specified by US26-D15-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Regrant/account claim/Party merge does not transfer or revive old following/unread history. New deliberate Follow permits only future events in the current exact staff scope.

Additional binding suite/requirement identifiers: AC26-D15-P27, AC26-D15-P28, AC26-D15-P29, AC26-D15-P30, AC26-D15-P31, AC26-D15-P32, AC26-D15-P33, AC26-D15-P34. REQ26-D15-R13, REQ26-D15-R14, REQ26-D15-R15, REQ26-D15-R20.

### Requirement: US26-D15-05 — Find followed work accessibly

The system SHALL provide the following observable outcome: As a following staff member, I want to open complete current Following results and return to the source, so that my navigation and draft context remain coherent.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D15-P42

- **GIVEN** the actor, source, state and permission conditions specified by US26-D15-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Beyond 2,000 total rows and skewed tenants, keyset count/page/search predicates agree without client truncation, body hydration or N+1 privileged reads; record query plans and measured envelope.

#### Scenario: AC26-D15-P43

- **GIVEN** the actor, source, state and permission conditions specified by US26-D15-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Following includes resolved active interests under All statuses; Latest followed update ignores unrelated merged activity; explicit filters and source changes preserve truthful count/sort units.

#### Scenario: AC26-D15-P44

- **GIVEN** the actor, source, state and permission conditions specified by US26-D15-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Normal/partial Follow, pending/conflict/denied/offline, persistent Stop/Follow again and bounded selected Stop have exact current outcomes, preserved draft/selection and no unseen-scope sweep.

Additional binding suite/requirement identifiers: AC26-D15-P42, AC26-D15-P43, AC26-D15-P44, AC26-D15-P45. REQ26-D15-R18, REQ26-D15-R21.

### Requirement: US26-D15-06 — Operate private follow evidence

The system SHALL provide the following observable outcome: As a privacy or Support operator, I want to secure and recover bounded source-qualified follow occurrences, so that audience compilation and restoration cannot disclose or replay messages.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D15-P40

- **GIVEN** the actor, source, state and permission conditions specified by US26-D15-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Database rejects cross-tenant FKs, duplicate active epochs/contributions/member slots, forbidden nulls, overlapping lifecycle state and caller-mutated principal/source/author fields; legitimate partial scope remains possible.

#### Scenario: AC26-D15-P46

- **GIVEN** the actor, source, state and permission conditions specified by US26-D15-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Generation history survives pending audience qualification, then owner retention/erasure safely compacts it. Backup restore cannot reactivate Stops, expose revoked previews or replay old effects.

#### Scenario: AC26-D15-P49

- **GIVEN** the actor, source, state and permission conditions specified by US26-D15-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Additive migration, one writer, no inferred enrollment/backlog, mixed-version guard rejection and roll-forward/rollback retain source and personal state after new guarded data exists.

Additional binding suite/requirement identifiers: AC26-D15-P40, AC26-D15-P41, AC26-D15-P46, AC26-D15-P47, AC26-D15-P48, AC26-D15-P49, AC26-D15-P50, AC26-D15-P51. REQ26-D15-R16, REQ26-D15-R17, REQ26-D15-R22, REQ26-D15-R23, REQ26-D15-R24, REQ26-D15-R25, REQ26-D15-R26.

### Requirement: US26-D16-01 — Remove exact sensitive content

The system SHALL provide the following observable outcome: As an authorized redaction staff member, I want to select exact source text, metadata or files and review the remainder, so that unrelated legitimate history survives.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D16-P01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D16-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Select one private paragraph and one file, review exact remainder, cancel/unmark safely, then commit once; ordinary work remains.

#### Scenario: AC26-D16-P05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D16-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Sensitive href/alt/title/comment/remote URL cannot survive selected object removal; preview discloses whole-link expansion.

#### Scenario: AC26-D16-P07

- **GIVEN** the actor, source, state and permission conditions specified by US26-D16-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Stale, forged, empty, malformed and unsupported selection fails safely; arbitrary replacement HTML cannot rewrite history.

Additional binding suite/requirement identifiers: AC26-D16-P01, AC26-D16-P02, AC26-D16-P03, AC26-D16-P04, AC26-D16-P05, AC26-D16-P06, AC26-D16-P07, AC26-D16-P08, AC26-D16-P28, AC26-D16-P35. REQ26-D16-R01, REQ26-D16-R02, REQ26-D16-R03, REQ26-D16-R04, REQ26-D16-R05, REQ26-D16-R06, REQ26-D16-R07.

### Requirement: US26-D16-02 — Make restriction effective once

The system SHALL provide the following observable outcome: As an authorized redaction operator, I want to commit a current restriction and durable owner cleanup responsibilities, so that alternate representations and retries cannot expose removed content.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D16-P09

- **GIVEN** the actor, source, state and permission conditions specified by US26-D16-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Transaction fault before acceptance has no false success; fault after acceptance leaves effective restriction and durable cleanup.

#### Scenario: AC26-D16-P10

- **GIVEN** the actor, source, state and permission conditions specified by US26-D16-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Two tenants cannot read, redact, change scope, probe receipts or obtain storage content using each other's IDs.

#### Scenario: AC26-D16-P11

- **GIVEN** the actor, source, state and permission conditions specified by US26-D16-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Reader/assignee/follower/requester/CRM owner without redaction capability denied; authorized actor succeeds only in source scope.

Additional binding suite/requirement identifiers: AC26-D16-P09, AC26-D16-P10, AC26-D16-P11, AC26-D16-P12, AC26-D16-P13, AC26-D16-P14, AC26-D16-P15, AC26-D16-P16, AC26-D16-P17, AC26-D16-P18, AC26-D16-P19, AC26-D16-P21, AC26-D16-P22, AC26-D16-P23. REQ26-D16-R08, REQ26-D16-R09, REQ26-D16-R10, REQ26-D16-R11, REQ26-D16-R17, REQ26-D16-R18.

### Requirement: US26-D16-03 — Preserve independent work and records

The system SHALL provide the following observable outcome: As a jointly authorized Support and CRM user, I want to see the same corrected original through every lawful surface, so that redaction neither invents communication nor destroys another owner record.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D16-P20

- **GIVEN** the actor, source, state and permission conditions specified by US26-D16-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Merge during review and Undo after removal preserve exact original correction while unaffected originals remain.

#### Scenario: AC26-D16-P24

- **GIVEN** the actor, source, state and permission conditions specified by US26-D16-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** All authorized CRM appearances show the same safe source without new communication rows or Party/giving mutation.

#### Scenario: AC26-D16-P25

- **GIVEN** the actor, source, state and permission conditions specified by US26-D16-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Restricted CRM user gets no extra snippet/count/hold details via Support correction; known independent copied note uses its owner.

Additional binding suite/requirement identifiers: AC26-D16-P20, AC26-D16-P24, AC26-D16-P25, AC26-D16-P29, AC26-D16-P34. REQ26-D16-R12, REQ26-D16-R13.

### Requirement: US26-D16-04 — Keep drafts and outgoing copies safe

The system SHALL provide the following observable outcome: As an authorized responder, I want to block restricted derivatives while preserving separable authored work, so that a stale draft or prepared email cannot resend removed data.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D16-P26

- **GIVEN** the actor, source, state and permission conditions specified by US26-D16-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Draft, P17 preparation and P6 dispatch races respect source stop and actual in-flight evidence, including sealed mixed-member batches.

#### Scenario: AC26-D16-P27

- **GIVEN** the actor, source, state and permission conditions specified by US26-D16-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Legacy signed URLs/CDN/browser cache and new gateway paths demonstrate the claimed restriction; prior downloads are honestly excluded.

#### Scenario: AC26-D16-P30

- **GIVEN** the actor, source, state and permission conditions specified by US26-D16-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Search/CRM/Recent copy/prepared/export/AI/log owners each provide scoped cleanup evidence; missing owner prevents completion. An exact removed synthetic search value produces no hit/facet/count through the obsolete indexed revision.

Additional binding suite/requirement identifiers: AC26-D16-P26, AC26-D16-P27, AC26-D16-P30, AC26-D16-P36. REQ26-D16-R14, REQ26-D16-R15, REQ26-D16-R16.

### Requirement: US26-D16-05 — Prove cleanup and lawful recovery

The system SHALL provide the following observable outcome: As a privacy or platform operator, I want to inspect minimal custody evidence and reconcile failed copies, so that completion states describe actual removal without recall promises.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D16-P16

- **GIVEN** the actor, source, state and permission conditions specified by US26-D16-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Audit/trace/error/job inspection contains no original payload, secret filename/URL, content diff or low-entropy secret hash.

#### Scenario: AC26-D16-P31

- **GIVEN** the actor, source, state and permission conditions specified by US26-D16-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Old-code/new-schema and new-code/old-schema compatibility cannot expose corrected payload; unsupported workers fail safely.

#### Scenario: AC26-D16-P33

- **GIVEN** the actor, source, state and permission conditions specified by US26-D16-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Kill switch stops new disposal without disabling restrictions/recovery; rollback cannot act as Undo.

Additional binding suite/requirement identifiers: AC26-D16-P16, AC26-D16-P19, AC26-D16-P31, AC26-D16-P32, AC26-D16-P33, AC26-D16-P37, AC26-D16-P38, AC26-D16-P39, AC26-D16-P40. REQ26-D16-R19, REQ26-D16-R20, REQ26-D16-R21, REQ26-D16-R22, REQ26-D16-R23, REQ26-D16-R24.

### Requirement: US26-D17-01 — Publish finite retention policy

The system SHALL provide the following observable outcome: As a qualified policy administrator, I want to review and activate finite Days, Months or Years with permitted complete impact, so that existing and future expiry is clear without transcript access.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D17-P01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D17-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Configure a blank finite policy, review old/new scope/effects and activate once; no default number or pre-confirmation expiry.

#### Scenario: AC26-D17-P11

- **GIVEN** the actor, source, state and permission conditions specified by US26-D17-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Two concurrent policy edits conflict; identical retry/lost response reconciles one publication; same effective policy is a no-op.

#### Scenario: AC26-D17-P12

- **GIVEN** the actor, source, state and permission conditions specified by US26-D17-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Extension E<d wins over stale old-due projection; no early expiry or destruction.

Additional binding suite/requirement identifiers: AC26-D17-P01, AC26-D17-P06, AC26-D17-P10, AC26-D17-P11, AC26-D17-P12, AC26-D17-P13, AC26-D17-P14, AC26-D17-P15, AC26-D17-P20, AC26-D17-P21. REQ26-D17-R01, REQ26-D17-R02, REQ26-D17-R03, REQ26-D17-R06, REQ26-D17-R08, REQ26-D17-R09, REQ26-D17-R10, REQ26-D17-R11, REQ26-D17-R25.

### Requirement: US26-D17-02 — Keep content for real work purposes

The system SHALL provide the following observable outcome: As a qualified Support purpose owner, I want to base content life and overdue purpose review on original source evidence, so that status cycling and chatter cannot become unlimited custody.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D17-P02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D17-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** End eligible work; content remains until the approved deadline, then ordinary content expires while permitted facts remain.

#### Scenario: AC26-D17-P05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D17-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Delay P6 acceptance/rejection/unknown evidence: retention admission time stays truthful and delivery metrics stay independent.

#### Scenario: AC26-D17-P16

- **GIVEN** the actor, source, state and permission conditions specified by US26-D17-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Expiry of frontier F includes its human and system/automatic content without automatic content renewing the clock; genuinely new later human message/file is excluded, duplicate old input cannot rehydrate F, and later automatic content cannot invent a fresh lifetime.

Additional binding suite/requirement identifiers: AC26-D17-P02, AC26-D17-P03, AC26-D17-P04, AC26-D17-P05, AC26-D17-P06, AC26-D17-P07, AC26-D17-P08, AC26-D17-P09, AC26-D17-P16. REQ26-D17-R04, REQ26-D17-R05, REQ26-D17-R07.

### Requirement: US26-D17-03 — Retain useful truthful context after expiry

The system SHALL provide the following observable outcome: As a jointly authorized Support and CRM user, I want to see permitted content-free history and handle genuinely new mail, so that continuity does not depend on expired content or stale recipients.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D17-P25

- **GIVEN** the actor, source, state and permission conditions specified by US26-D17-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** CRM All/Overview/current Support navigation shows one authorized source result with neutral title and accurate old-expired/new-content state.

#### Scenario: AC26-D17-P30

- **GIVEN** the actor, source, state and permission conditions specified by US26-D17-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Old Reply/Reply all cannot reconstruct expired audience from CRM/caches; real new input and deliberate new outbound still work under D2/D12.

#### Scenario: AC26-D17-P33

- **GIVEN** the actor, source, state and permission conditions specified by US26-D17-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Shared receipt bytes remain reachable only through independently authorized owner context; expired Support link cannot bypass expiry or mutate gift/task state.

Additional binding suite/requirement identifiers: AC26-D17-P25, AC26-D17-P26, AC26-D17-P27, AC26-D17-P28, AC26-D17-P29, AC26-D17-P30, AC26-D17-P33. REQ26-D17-R13, REQ26-D17-R14, REQ26-D17-R15, REQ26-D17-R16, REQ26-D17-R18.

### Requirement: US26-D17-04 — Enforce expiry before cleanup

The system SHALL provide the following observable outcome: As a privacy or records operator, I want to end ordinary authority at the exact deadline with actual restricted preservation, so that worker lag and holds cannot fabricate access or deletion.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D17-P17

- **GIVEN** the actor, source, state and permission conditions specified by US26-D17-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Hold before/after logical expiry and before/after physical deletion preserves only still-existing required bytes with no ordinary reveal.

#### Scenario: AC26-D17-P18

- **GIVEN** the actor, source, state and permission conditions specified by US26-D17-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Automatic frontier intent reuses D16 source transaction/cleanup; it cannot invoke arbitrary human selection or broaden other domains.

#### Scenario: AC26-D17-P31

- **GIVEN** the actor, source, state and permission conditions specified by US26-D17-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Draft/prepare/dispatch expiry races honor actual P6 linearization, unknown sends, whole-envelope constraints and tighter material purge deadlines.

Additional binding suite/requirement identifiers: AC26-D17-P17, AC26-D17-P18, AC26-D17-P19, AC26-D17-P31. REQ26-D17-R12, REQ26-D17-R17, REQ26-D17-R19.

### Requirement: US26-D17-05 — Operate complete source retention

The system SHALL provide the following observable outcome: As a privacy or platform operator, I want to qualify inventories, source gates, restore barriers and bounded cleanup, so that every surface honors expiry with accountable failure handling.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D17-P22

- **GIVEN** the actor, source, state and permission conditions specified by US26-D17-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Direct DB/API mutations cannot change tenant/source/frontier/actor/publicness/policy/hold or restore expired content; USING and WITH CHECK both tested.

#### Scenario: AC26-D17-P23

- **GIVEN** the actor, source, state and permission conditions specified by US26-D17-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Function/view/storage/service-role paths and current revocation enforce the same source/custody boundaries.

#### Scenario: AC26-D17-P24

- **GIVEN** the actor, source, state and permission conditions specified by US26-D17-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Conversation/inbox/Party deletion cannot incidentally remove required expiry/assignment/audit/control facts; no generic cascade used as expiry.

Additional binding suite/requirement identifiers: AC26-D17-P22, AC26-D17-P23, AC26-D17-P24, AC26-D17-P32, AC26-D17-P34, AC26-D17-P35, AC26-D17-P36, AC26-D17-P37, AC26-D17-P38, AC26-D17-P39, AC26-D17-P40, AC26-D17-P41, AC26-D17-P42, AC26-D17-P43. REQ26-D17-R20, REQ26-D17-R21, REQ26-D17-R22, REQ26-D17-R23, REQ26-D17-R24, REQ26-D17-R26.

### Requirement: US26-D18-01 — Find and personalize useful wording

The system SHALL provide the following observable outcome: As a Support responder, I want to find and insert permitted wording in the right mode and language, so that composition is faster without wrong disclosure or CRM mutation.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D18-P01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D18-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A permitted staff author creates My wording, finds Shared wording, inserts both and completes one ordinary guarded reply without leaving its CRM/Support context.

#### Scenario: AC26-D18-P03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D18-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Internal-note item cannot be retrieved/inserted through Reply; later mode switch, Replace/Undo and direct external send cannot carry internal-only provenance. Note admission itself uses no outgoing-email preparation; independently authorized post-derived attention retains its P17/P6 boundary. Picking never switches mode or activates mentions.

#### Scenario: AC26-D18-P06

- **GIVEN** the actor, source, state and permission conditions specified by US26-D18-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Late search/insert results cannot move keyboard selection or target another tenant/composer/draft/caret.

Additional binding suite/requirement identifiers: AC26-D18-P01, AC26-D18-P02, AC26-D18-P03, AC26-D18-P04, AC26-D18-P05, AC26-D18-P06, AC26-D18-P07, AC26-D18-P08, AC26-D18-P09, AC26-D18-P10, AC26-D18-P11, AC26-D18-P13, AC26-D18-P14, AC26-D18-P15, AC26-D18-P16, AC26-D18-P17, AC26-D18-P31, AC26-D18-P32, AC26-D18-P40, AC26-D18-P41. REQ26-D18-R01, REQ26-D18-R04, REQ26-D18-R05, REQ26-D18-R07, REQ26-D18-R08, REQ26-D18-R09, REQ26-D18-R10, REQ26-D18-R11, REQ26-D18-R12, REQ26-D18-R19, REQ26-D18-R25, REQ26-D18-R26.

### Requirement: US26-D18-02 — Save My replies privately

The system SHALL provide the following observable outcome: As a Support staff member, I want to save and edit personal wording through the shared authoring owner, so that reusable content remains private without harvesting transcripts.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D18-P01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D18-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A permitted staff author creates My wording, finds Shared wording, inserts both and completes one ordinary guarded reply without leaving its CRM/Support context.

#### Scenario: AC26-D18-P18

- **GIVEN** the actor, source, state and permission conditions specified by US26-D18-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Save/offer/import cannot preserve known donor-case payloads, protected links, private notes or expired material as unrestricted reusable wording.

#### Scenario: AC26-D18-P19

- **GIVEN** the actor, source, state and permission conditions specified by US26-D18-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Same global user in two tenants cannot read/use/edit the other membership's personal item, favorites or cached body.

Additional binding suite/requirement identifiers: AC26-D18-P01, AC26-D18-P18, AC26-D18-P19, AC26-D18-P20, AC26-D18-P22, AC26-D18-P30, AC26-D18-P34. REQ26-D18-R02, REQ26-D18-R03, REQ26-D18-R06, REQ26-D18-R18.

### Requirement: US26-D18-03 — Curate Shared replies deliberately

The system SHALL provide the following observable outcome: As a qualified reply curator, I want to review contributions and publish exact Shared revisions and audiences, so that maintained wording has no live personal dependency.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D18-P12

- **GIVEN** the actor, source, state and permission conditions specified by US26-D18-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Editing source wording marks declared translations honestly without live replacement or broad automatic withdrawal; safety restriction remains enforceable.

#### Scenario: AC26-D18-P21

- **GIVEN** the actor, source, state and permission conditions specified by US26-D18-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Shared audience and editor scope are actual authorization, including old revisions/search/count/preview/assets. Narrowing denies newly forbidden access; widening qualifies all exposed variants/assets.

#### Scenario: AC26-D18-P22

- **GIVEN** the actor, source, state and permission conditions specified by US26-D18-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** My Save is a bounded authoring revision, not a system-template publication or bypass for protected material; Shared uses the correct review floor.

Additional binding suite/requirement identifiers: AC26-D18-P12, AC26-D18-P21, AC26-D18-P22, AC26-D18-P25, AC26-D18-P26, AC26-D18-P42. REQ26-D18-R13, REQ26-D18-R14.

### Requirement: US26-D18-04 — Retire and restrict wording correctly

The system SHALL provide the following observable outcome: As a reply owner or curator, I want to archive, restore or restrict wording and handle departure distinctly, so that ordinary maintenance and safety withdrawal preserve lawful work.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D18-P27

- **GIVEN** the actor, source, state and permission conditions specified by US26-D18-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Ordinary Archive stops new picker/insert while safe already-inserted drafts remain usable; Restore revalidates without bypassing safety restriction.

#### Scenario: AC26-D18-P28

- **GIVEN** the actor, source, state and permission conditions specified by US26-D18-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Unsafe-source revocation stops qualifying new preparation/unsubmitted work, honors actual quarantine effect, and leaves possible sends to P6 reconciliation.

#### Scenario: AC26-D18-P30

- **GIVEN** the actor, source, state and permission conditions specified by US26-D18-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Restriction/expiry propagates through known copies, offers, exports/search and restore. Unsent insertion stays draft material, not a new admitted D17 original; independent generalized content follows its own valid owner policy.

Additional binding suite/requirement identifiers: AC26-D18-P27, AC26-D18-P28, AC26-D18-P29, AC26-D18-P30, AC26-D18-P37, AC26-D18-P38, AC26-D18-P49. REQ26-D18-R15, REQ26-D18-R16, REQ26-D18-R17, REQ26-D18-R23, REQ26-D18-R24.

### Requirement: US26-D18-05 — Operate one secure library

The system SHALL provide the following observable outcome: As a Email Studio or Support operator, I want to enforce source, authorization, durable mutation and publication contracts, so that imports, copies and retries cannot create another authority.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D18-P23

- **GIVEN** the actor, source, state and permission conditions specified by US26-D18-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Generic DB/API updates cannot change tenant, custodian, scope, actor, purpose or published head into a forbidden state; USING/WITH CHECK and column grants are exercised.

#### Scenario: AC26-D18-P34

- **GIVEN** the actor, source, state and permission conditions specified by US26-D18-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Duplicate/time-out/reordered saves and publications reconcile one durable effect; stale edits cannot overwrite a newer head or different candidate.

#### Scenario: AC26-D18-P36

- **GIVEN** the actor, source, state and permission conditions specified by US26-D18-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Legacy raw HTML/macro/direct routes cannot bypass the owner; existing safe plain reply still uses P17/P6 and Resend.

Additional binding suite/requirement identifiers: AC26-D18-P23, AC26-D18-P24, AC26-D18-P33, AC26-D18-P34, AC26-D18-P35, AC26-D18-P36, AC26-D18-P39, AC26-D18-P43, AC26-D18-P44, AC26-D18-P45, AC26-D18-P46, AC26-D18-P47, AC26-D18-P48, AC26-D18-P50. REQ26-D18-R20, REQ26-D18-R21, REQ26-D18-R22, REQ26-D18-R27, REQ26-D18-R28.

### Requirement: US26-D19-01 — Maintain viable intake review coverage

The system SHALL provide the following observable outcome: As a qualified inbox administrator, I want to choose eligible reviewers, backup and oversight, so that uncertain mail has accountable owners without new access grants.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D19-P01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D19-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** One small tenant person or one shared team can cover all inboxes; no mandatory hierarchy or second engine.

#### Scenario: AC26-D19-P02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D19-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A reviewer for inbox A cannot list, count, search, inspect or mutate unauthorized B or another tenant through any surface.

#### Scenario: AC26-D19-P03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D19-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Setup rejects missing viable coverage; planned replacement is atomic; security revocation is never blocked.

Additional binding suite/requirement identifiers: AC26-D19-P01, AC26-D19-P02, AC26-D19-P03, AC26-D19-P04, AC26-D19-P40. REQ26-D19-R01, REQ26-D19-R02, REQ26-D19-R03, REQ26-D19-R04.

### Requirement: US26-D19-02 — Inspect and decide one held input

The system SHALL provide the following observable outcome: As an authorized intake reviewer, I want to safely inspect current gates and deliberately Release or Dismiss, so that legitimate work enters without changing future trust or identity.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D19-P05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D19-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Multiple gates, spoofed reason text, malicious HTML, bidi/name edge cases and unscanned files retain actual restrictions without executing remote content.

#### Scenario: AC26-D19-P06

- **GIVEN** the actor, source, state and permission conditions specified by US26-D19-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Loading failure, hidden/partial scope and page changes cannot claim zero or leak counts/snippets; screen reader receives accurate status.

#### Scenario: AC26-D19-P08

- **GIVEN** the actor, source, state and permission conditions specified by US26-D19-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** One-item destination change does not write future route/trust; future route changes cannot override dismissal or another unresolved gate.

Additional binding suite/requirement identifiers: AC26-D19-P05, AC26-D19-P06, AC26-D19-P07, AC26-D19-P08, AC26-D19-P09, AC26-D19-P10, AC26-D19-P11, AC26-D19-P20, AC26-D19-P31, AC26-D19-P38, AC26-D19-P39. REQ26-D19-R05, REQ26-D19-R06, REQ26-D19-R07, REQ26-D19-R08, REQ26-D19-R09, REQ26-D19-R10, REQ26-D19-R11.

### Requirement: US26-D19-03 — Recover technical and mistaken decisions

The system SHALL provide the following observable outcome: As an authorized reviewer or recovery operator, I want to retry acquisition, cancel pending admission and correct committed mistakes, so that mail is neither lost nor falsely recalled or duplicated.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D19-P12

- **GIVEN** the actor, source, state and permission conditions specified by US26-D19-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Technical retry handles safe attachment-only/empty-content distinction, partial files and essential-body failure without safety release or byte loss.

#### Scenario: AC26-D19-P13

- **GIVEN** the actor, source, state and permission conditions specified by US26-D19-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Crash before/after decision/outbox/admission and lost responses reconcile one input/admission effect. Release→Cancel→Release with old/new workers in either order yields only the current eligible admission.

#### Scenario: AC26-D19-P14

- **GIVEN** the actor, source, state and permission conditions specified by US26-D19-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Cross-tenant stored source/inbox/route/team/membership endpoints, null tenant-review scope, invalid states and unsafe parent deletion are rejected; global identity binds through its actual membership.

Additional binding suite/requirement identifiers: AC26-D19-P12, AC26-D19-P13, AC26-D19-P14, AC26-D19-P15, AC26-D19-P16, AC26-D19-P17, AC26-D19-P18, AC26-D19-P19, AC26-D19-P20, AC26-D19-P35, AC26-D19-P36. REQ26-D19-R12, REQ26-D19-R13, REQ26-D19-R14, REQ26-D19-R15, REQ26-D19-R16, REQ26-D19-R17, REQ26-D19-R18.

### Requirement: US26-D19-04 — Apply honest held-content deadlines

The system SHALL provide the following observable outcome: As a intake or records owner, I want to apply the 14-day ordinary and bounded unknown-time recovery contracts, so that review cannot renew content or launder waiting age.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D19-P21

- **GIVEN** the actor, source, state and permission conditions specified by US26-D19-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Known receipt yields exact 14×24-hour cutoff; unknown receipt stays separate restricted recovery with once-set trusted recovery anchor,24-hour review and14-day maximum normal recovery access, never fabricated receipt.

#### Scenario: AC26-D19-P22

- **GIVEN** the actor, source, state and permission conditions specified by US26-D19-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Release requested before expiry but admission at/after expiry fails visibly; custody/admission strictly before cutoff uses proper D17 source class once.

#### Scenario: AC26-D19-P23

- **GIVEN** the actor, source, state and permission conditions specified by US26-D19-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Dismiss/Return to review/reads/touches/failed release do not renew cutoff; expired content stays unavailable during cleanup lag.

Additional binding suite/requirement identifiers: AC26-D19-P21, AC26-D19-P22, AC26-D19-P23, AC26-D19-P24, AC26-D19-P25, AC26-D19-P26, AC26-D19-P27, AC26-D19-P28. REQ26-D19-R19, REQ26-D19-R20, REQ26-D19-R21.

### Requirement: US26-D19-05 — Follow accountable review attention

The system SHALL provide the following observable outcome: As an authorized review or oversight staff member, I want to see current coverage, aging and outcomes through source-qualified attention, so that attention reaches its owner without CRM noise.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D19-P29

- **GIVEN** the actor, source, state and permission conditions specified by US26-D19-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Held input creates no Party, ordinary CRM timeline/last-contact or giving/care mutation; admitted source appears once only through D9 authority.

#### Scenario: AC26-D19-P30

- **GIVEN** the actor, source, state and permission conditions specified by US26-D19-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** CRM merge/deletion/permission loss and recipient changes do not rematch original identity or widen review/notification access.

#### Scenario: AC26-D19-P31

- **GIVEN** the actor, source, state and permission conditions specified by US26-D19-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Dismiss/Release/Retry do not alter sender block/allow, consent, registration, recipient lists, future route or unrelated conversations.

Additional binding suite/requirement identifiers: AC26-D19-P29, AC26-D19-P30, AC26-D19-P31, AC26-D19-P32, AC26-D19-P33, AC26-D19-P35. REQ26-D19-R22, REQ26-D19-R23, REQ26-D19-R24, REQ26-D19-R28.

### Requirement: US26-D19-06 — Qualify one secure intake path

The system SHALL provide the following observable outcome: As a intake platform operator, I want to enforce gates, finite custody and complete bounded migration, so that legacy writers and hostile bursts cannot bypass review.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D19-P14

- **GIVEN** the actor, source, state and permission conditions specified by US26-D19-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Cross-tenant stored source/inbox/route/team/membership endpoints, null tenant-review scope, invalid states and unsafe parent deletion are rejected; global identity binds through its actual membership.

#### Scenario: AC26-D19-P15

- **GIVEN** the actor, source, state and permission conditions specified by US26-D19-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Auth ID differs from profile ID; audit records actual trusted tenant membership and rejects spoofed actor/tenant/timestamps.

#### Scenario: AC26-D19-P19

- **GIVEN** the actor, source, state and permission conditions specified by US26-D19-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Concurrent release/dismiss/revoke/retry/expiry and stale policy jobs have one qualified result; revoked deciding-actor authority blocks pending admission while valid earlier admission keeps history.

Additional binding suite/requirement identifiers: AC26-D19-P14, AC26-D19-P15, AC26-D19-P16, AC26-D19-P17, AC26-D19-P18, AC26-D19-P19, AC26-D19-P34, AC26-D19-P36, AC26-D19-P37, AC26-D19-P38, AC26-D19-P39, AC26-D19-P40, AC26-D19-P41, AC26-D19-P42. REQ26-D19-R25, REQ26-D19-R26, REQ26-D19-R27, REQ26-D19-R29, REQ26-D19-R30.

### Requirement: US26-D20-01 — Open and adjust useful views

The system SHALL provide the following observable outcome: As a Support staff member, I want to discover views and change the visible working query temporarily, so that finding work needs no setup or edits to colleagues settings.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D20-P01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D20-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Support uses qualified shared named-view/list machinery; other registered subjects and existing CRM private/default behavior remain correct.

#### Scenario: AC26-D20-P02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D20-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** First-time staff reach required queues and discover Views without pins or admin setup; My is understood as configuration.

#### Scenario: AC26-D20-P03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D20-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Identical names/criteria retain distinct stable IDs; active status follows selected ID/revision, never first filter match.

Additional binding suite/requirement identifiers: AC26-D20-P01, AC26-D20-P02, AC26-D20-P03, AC26-D20-P04, AC26-D20-P05, AC26-D20-P08, AC26-D20-P09, AC26-D20-P10, AC26-D20-P11, AC26-D20-P12, AC26-D20-P27, AC26-D20-P28. REQ26-D20-R01, REQ26-D20-R02, REQ26-D20-R03, REQ26-D20-R04, REQ26-D20-R06, REQ26-D20-R07, REQ26-D20-R08.

### Requirement: US26-D20-02 — Save the exact reviewed query

The system SHALL provide the following observable outcome: As a Support staff member, I want to save, rename and resolve conflicts on the precise definition, so that scope and another revision cannot change silently.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D20-P06

- **GIVEN** the actor, source, state and permission conditions specified by US26-D20-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Save captures reviewed inbox/filter/sort/columns; valid zero result succeeds, failed preview is not zero, lost response reconciles.

#### Scenario: AC26-D20-P07

- **GIVEN** the actor, source, state and permission conditions specified by US26-D20-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Current search literal is visible/included by deliberate review; opt-out updates scope; Shared copy rechecks audience without body harvesting.

#### Scenario: AC26-D20-P13

- **GIVEN** the actor, source, state and permission conditions specified by US26-D20-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Rename B while A/modified filters are active changes only B metadata; criteria change requires B revision and explicit intent.

Additional binding suite/requirement identifiers: AC26-D20-P06, AC26-D20-P07, AC26-D20-P13, AC26-D20-P15, AC26-D20-P16. REQ26-D20-R05, REQ26-D20-R15.

### Requirement: US26-D20-03 — Maintain Shared views without data grants

The system SHALL provide the following observable outcome: As a qualified view maintainer, I want to share, archive and restore definitions separately from personal copies, so that shared navigation never grants protected record access.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D20-P17

- **GIVEN** the actor, source, state and permission conditions specified by US26-D20-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Out-of-order save/auto-pin/archive/restore cannot revive stale settings/pins across lifecycle generations; restore returns unpinned, and current actions stay on exact IDs.

#### Scenario: AC26-D20-P18

- **GIVEN** the actor, source, state and permission conditions specified by US26-D20-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Another tenant/member/ordinary curator cannot read/change My metadata, criteria, revisions, pins or counts via any path.

#### Scenario: AC26-D20-P19

- **GIVEN** the actor, source, state and permission conditions specified by US26-D20-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Shared audience and maintenance are separate; ordinary personal-copy edits cannot affect Shared; archive/restore affects navigation honestly.

Additional binding suite/requirement identifiers: AC26-D20-P17, AC26-D20-P18, AC26-D20-P19, AC26-D20-P20, AC26-D20-P21, AC26-D20-P22, AC26-D20-P23, AC26-D20-P24, AC26-D20-P25, AC26-D20-P42. REQ26-D20-R09, REQ26-D20-R10, REQ26-D20-R11, REQ26-D20-R16, REQ26-D20-R17, REQ26-D20-R18, REQ26-D20-R19.

### Requirement: US26-D20-04 — Personalize navigation and return

The system SHALL provide the following observable outcome: As a Support staff member, I want to pin and order my views across devices while preserving source context, so that personal convenience does not alter Shared or CRM defaults.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D20-P14

- **GIVEN** the actor, source, state and permission conditions specified by US26-D20-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Personal pin/unpin/reorder and layout persist cross-device without changing Shared definition or Support/CRM defaults.

#### Scenario: AC26-D20-P26

- **GIVEN** the actor, source, state and permission conditions specified by US26-D20-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** CRM record history retains D9 anchor; explicit Open in Support preserves return context and creates no CRM/contact/giving event.

#### Scenario: AC26-D20-P27

- **GIVEN** the actor, source, state and permission conditions specified by US26-D20-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** D3 status and D14 any-underlying-overdue/uncertainty meaning hold through targets, waits, moves and current queries; no new Due soon.

Additional binding suite/requirement identifiers: AC26-D20-P14, AC26-D20-P26, AC26-D20-P27, AC26-D20-P28, AC26-D20-P29, AC26-D20-P30, AC26-D20-P39. REQ26-D20-R12, REQ26-D20-R20, REQ26-D20-R21.

### Requirement: US26-D20-05 — Keep live results and action targets truthful

The system SHALL provide the following observable outcome: As a Support staff member, I want to see complete authorized matches and stable selected IDs, so that live updates cannot hide work or retarget my command.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D20-P10

- **GIVEN** the actor, source, state and permission conditions specified by US26-D20-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Result preview/rows/matching counts/pages agree beyond the old 2,000 cap; independently authorized facet options still allow adding alternatives under Any.

#### Scenario: AC26-D20-P20

- **GIVEN** the actor, source, state and permission conditions specified by US26-D20-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Hidden CRM predicate/sort/facet/count cannot infer protected facts; definition audience never grants source access.

#### Scenario: AC26-D20-P25

- **GIVEN** the actor, source, state and permission conditions specified by US26-D20-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** URL/query/revision search literals cannot leak through logs/referrers/unauthorized history or be executed as SQL/HTML/template instructions.

Additional binding suite/requirement identifiers: AC26-D20-P10, AC26-D20-P11, AC26-D20-P12, AC26-D20-P20, AC26-D20-P25, AC26-D20-P29, AC26-D20-P30, AC26-D20-P31, AC26-D20-P33. REQ26-D20-R13, REQ26-D20-R14, REQ26-D20-R23, REQ26-D20-R24.

### Requirement: US26-D20-06 — Operate reliable view definitions

The system SHALL provide the following observable outcome: As a shared-view platform operator, I want to secure mutations and repair or migrate exact meaning, so that query convenience stays bounded and is not an action engine.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D20-P16

- **GIVEN** the actor, source, state and permission conditions specified by US26-D20-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Concurrent saves/retries preserve one accepted revision and explicit conflict; changed-payload reuse conflicts, updates cannot create missing IDs, and old receipts cannot revive later archive.

#### Scenario: AC26-D20-P17

- **GIVEN** the actor, source, state and permission conditions specified by US26-D20-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Out-of-order save/auto-pin/archive/restore cannot revive stale settings/pins across lifecycle generations; restore returns unpinned, and current actions stay on exact IDs.

#### Scenario: AC26-D20-P18

- **GIVEN** the actor, source, state and permission conditions specified by US26-D20-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Another tenant/member/ordinary curator cannot read/change My metadata, criteria, revisions, pins or counts via any path.

Additional binding suite/requirement identifiers: AC26-D20-P16, AC26-D20-P17, AC26-D20-P18, AC26-D20-P21, AC26-D20-P22, AC26-D20-P23, AC26-D20-P24, AC26-D20-P32, AC26-D20-P34, AC26-D20-P35, AC26-D20-P36, AC26-D20-P37, AC26-D20-P38, AC26-D20-P40, AC26-D20-P41, AC26-D20-P42, AC26-D20-P43, AC26-D20-P44. REQ26-D20-R22, REQ26-D20-R25, REQ26-D20-R26, REQ26-D20-R27, REQ26-D20-R28.

### Requirement: US26-D21-01 — Apply optional readable labels

The system SHALL provide the following observable outcome: As an authorized Support staff member, I want to apply or remove labels on exact current source scope, so that categorization does not become another status or access rule.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D21-P01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D21-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Zero labels permits intake, reply, handoff and valid Resolve; no default/catch-all/required taxonomy appears in any route.

#### Scenario: AC26-D21-P09

- **GIVEN** the actor, source, state and permission conditions specified by US26-D21-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Failure at every boundary yields either no effect or one atomic committed membership/history/receipt, with truthful recovery after lost response.

#### Scenario: AC26-D21-P10

- **GIVEN** the actor, source, state and permission conditions specified by US26-D21-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Repeated same Add/Remove is idempotent; changed payload/key conflicts; retry old Add after later Remove reports receipt/current state without resurrection.

Additional binding suite/requirement identifiers: AC26-D21-P01, AC26-D21-P02, AC26-D21-P09, AC26-D21-P10, AC26-D21-P11, AC26-D21-P18, AC26-D21-P19, AC26-D21-P28. REQ26-D21-R01, REQ26-D21-R02, REQ26-D21-R04, REQ26-D21-R05, REQ26-D21-R06, REQ26-D21-R10, REQ26-D21-R11, REQ26-D21-R12.

### Requirement: US26-D21-02 — Maintain a stable vocabulary

The system SHALL provide the following observable outcome: As a qualified label maintainer, I want to create, rename, archive and restore terms distinctly, so that existing assignments remain understandable without reclassification.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D21-P03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D21-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** One Support catalog/source owner; no duplicated Party state, per-record catalog, new taxonomy service or unrelated CRM permission requirement.

#### Scenario: AC26-D21-P05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D21-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Concurrent same-name creation yields one identity or clear conflict, including archived names; no implicit merge, silent truncation or empty-slug failure.

#### Scenario: AC26-D21-P06

- **GIVEN** the actor, source, state and permission conditions specified by US26-D21-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Edit selected B cannot save A's form; name-only edits preserve IDs/meaning/references and enforce revision conflicts without losing input.

Additional binding suite/requirement identifiers: AC26-D21-P03, AC26-D21-P04, AC26-D21-P05, AC26-D21-P06, AC26-D21-P07, AC26-D21-P08, AC26-D21-P11, AC26-D21-P35. REQ26-D21-R03, REQ26-D21-R07, REQ26-D21-R08, REQ26-D21-R09.

### Requirement: US26-D21-03 — Use label views and reports honestly

The system SHALL provide the following observable outcome: As an authorized reporting user, I want to filter exact current membership and understand historical limits, so that renames, merges and archives cannot improve old outcomes.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D21-P20

- **GIVEN** the actor, source, state and permission conditions specified by US26-D21-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Any/All/No labels results and counts match complete authorized memberships including archived; unavailable metadata/ref never drops predicates or becomes false zero.

#### Scenario: AC26-D21-P22

- **GIVEN** the actor, source, state and permission conditions specified by US26-D21-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Label edits/no-op retries do not alter D14 reply outcomes, D15 followed-update attention, D17 retention anchors or actual message timestamps.

#### Scenario: AC26-D21-P23

- **GIVEN** the actor, source, state and permission conditions specified by US26-D21-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Report cohort, timezone bounds, merge deduplication, N/L/U, overlap percentages, empty and incomplete states agree between table/chart/drilldown/export.

Additional binding suite/requirement identifiers: AC26-D21-P20, AC26-D21-P22, AC26-D21-P23, AC26-D21-P31. REQ26-D21-R15, REQ26-D21-R16, REQ26-D21-R17.

### Requirement: US26-D21-04 — Preserve label privacy across surfaces

The system SHALL provide the following observable outcome: As a jointly authorized CRM and Support user, I want to see only permitted source labels, so that labels cannot tag CRM people, send email or grant rights.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D21-P12

- **GIVEN** the actor, source, state and permission conditions specified by US26-D21-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Catalog reader/applicator/maintainer/exporter privileges are separate; D18/D19/D20 capabilities grant no implicit management.

#### Scenario: AC26-D21-P13

- **GIVEN** the actor, source, state and permission conditions specified by US26-D21-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Cross-tenant label, conversation, actor, role, endpoint and lifecycle spoofing fail at API and database; a permitted update cannot move an edge to forbidden scope.

#### Scenario: AC26-D21-P15

- **GIVEN** the actor, source, state and permission conditions specified by US26-D21-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Revoked permissions during picker/search/mutation/history/export prevent disclosure/effect; failure responses do not reveal hidden resources or raw protected input.

Additional binding suite/requirement identifiers: AC26-D21-P12, AC26-D21-P13, AC26-D21-P14, AC26-D21-P15, AC26-D21-P16, AC26-D21-P17, AC26-D21-P21, AC26-D21-P24, AC26-D21-P25, AC26-D21-P27. REQ26-D21-R13, REQ26-D21-R14, REQ26-D21-R18, REQ26-D21-R19.

### Requirement: US26-D21-05 — Operate reliable label membership

The system SHALL provide the following observable outcome: As a Support platform operator, I want to secure atomic changes and complete bounded queries, so that races, migration and restore cannot corrupt source membership.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D21-P09

- **GIVEN** the actor, source, state and permission conditions specified by US26-D21-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Failure at every boundary yields either no effect or one atomic committed membership/history/receipt, with truthful recovery after lost response.

#### Scenario: AC26-D21-P10

- **GIVEN** the actor, source, state and permission conditions specified by US26-D21-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Repeated same Add/Remove is idempotent; changed payload/key conflicts; retry old Add after later Remove reports receipt/current state without resurrection.

#### Scenario: AC26-D21-P11

- **GIVEN** the actor, source, state and permission conditions specified by US26-D21-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Apply versus Archive/Restore/permission change has one valid ordered outcome; old pre-archive intents cannot become valid after restore.

Additional binding suite/requirement identifiers: AC26-D21-P09, AC26-D21-P10, AC26-D21-P11, AC26-D21-P13, AC26-D21-P14, AC26-D21-P16, AC26-D21-P26, AC26-D21-P29, AC26-D21-P30, AC26-D21-P32, AC26-D21-P33, AC26-D21-P34, AC26-D21-P36. REQ26-D21-R11, REQ26-D21-R12, REQ26-D21-R13, REQ26-D21-R14, REQ26-D21-R20, REQ26-D21-R21, REQ26-D21-R22, REQ26-D21-R23, REQ26-D21-R24.

### Requirement: US26-D22-01 — Search authorized content literally

The system SHALL provide the following observable outcome: As a Support staff member, I want to search supported source words and phrases predictably, so that real work is discoverable without hidden extra corpora.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D22-P01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D22-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Only selected A source types participate; attachment contents, OCR, AI, drafts, raw evidence, library and Recent-only terms yield no ordinary match.

#### Scenario: AC26-D22-P03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D22-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** All fragments match within one eligible item; words split across subject/name or different messages do not fabricate a result.

#### Scenario: AC26-D22-P04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D22-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Straight/curly phrases, apostrophes, escaped quotes/backslashes, literal OR/NOT/%/\_/punctuation and malformed quotes follow the specified grammar.

Additional binding suite/requirement identifiers: AC26-D22-P01, AC26-D22-P03, AC26-D22-P04, AC26-D22-P05, AC26-D22-P07, AC26-D22-P09, AC26-D22-P10, AC26-D22-P11, AC26-D22-P12, AC26-D22-P15, AC26-D22-P22. REQ26-D22-R01, REQ26-D22-R02, REQ26-D22-R03, REQ26-D22-R04, REQ26-D22-R05, REQ26-D22-R06, REQ26-D22-R07.

### Requirement: US26-D22-02 — Open the exact match

The system SHALL provide the following observable outcome: As a Support staff member, I want to understand the match and navigate to its source in context, so that search does not grant file, CRM or business authority.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D22-P08

- **GIVEN** the actor, source, state and permission conditions specified by US26-D22-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Highlights map to original visible graphemes; no synthetic quote or removed text, even after Unicode normalization or source revision.

#### Scenario: AC26-D22-P19

- **GIVEN** the actor, source, state and permission conditions specified by US26-D22-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** CRM linked through B cannot match A-only history; broader handling is deliberate and independently authorized.

#### Scenario: AC26-D22-P31

- **GIVEN** the actor, source, state and permission conditions specified by US26-D22-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Query generations, live reordering and pagination cannot retarget an opened conversation, draft or explicit bulk IDs; Refresh is truthful.

Additional binding suite/requirement identifiers: AC26-D22-P08, AC26-D22-P18, AC26-D22-P19, AC26-D22-P23, AC26-D22-P24, AC26-D22-P26, AC26-D22-P27, AC26-D22-P28, AC26-D22-P29, AC26-D22-P31, AC26-D22-P32, AC26-D22-P37. REQ26-D22-R08, REQ26-D22-R09, REQ26-D22-R17, REQ26-D22-R19, REQ26-D22-R20, REQ26-D22-R21, REQ26-D22-R22.

### Requirement: US26-D22-03 — Exclude restricted sources from discovery

The system SHALL provide the following observable outcome: As a source-authorized user, I want to have current permission applied before matches, counts and excerpts, so that indexes and stale browsers cannot reveal inaccessible content.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D22-P02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D22-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** One Support source/query owner and shared list/definition contract; no CRM corpus copy or second external search authority.

#### Scenario: AC26-D22-P17

- **GIVEN** the actor, source, state and permission conditions specified by US26-D22-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Query handles/cache/late results cannot cross tenant/user/acting-scope change; expired handle is unavailable rather than All.

#### Scenario: AC26-D22-P20

- **GIVEN** the actor, source, state and permission conditions specified by US26-D22-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Redaction/expiry/reclassification fence every hit/count/rank/snippet/filename before physical purge; old workers cannot revive them.

Additional binding suite/requirement identifiers: AC26-D22-P02, AC26-D22-P13, AC26-D22-P14, AC26-D22-P16, AC26-D22-P17, AC26-D22-P20, AC26-D22-P33. REQ26-D22-R10, REQ26-D22-R11, REQ26-D22-R12, REQ26-D22-R13, REQ26-D22-R14, REQ26-D22-R18.

### Requirement: US26-D22-04 — Recover complete bounded search

The system SHALL provide the following observable outcome: As a search platform operator, I want to build and query current source projections with honest incomplete states, so that lag and limits cannot masquerade as no results.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D22-P06

- **GIVEN** the actor, source, state and permission conditions specified by US26-D22-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Exact input 256-scalar/1,024-byte/16-atom boundaries and normalization expansion limits validate identically at UI/API; no silent truncation.

#### Scenario: AC26-D22-P21

- **GIVEN** the actor, source, state and permission conditions specified by US26-D22-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Restored DB/index/cache backups apply current withdrawal and source-revision barriers before serving.

#### Scenario: AC26-D22-P25

- **GIVEN** the actor, source, state and permission conditions specified by US26-D22-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Complete query predicates precede cap/count/page; timeout/backlog/oversize unit is distinct from exact zero and no hidden tail is omitted.

Additional binding suite/requirement identifiers: AC26-D22-P06, AC26-D22-P21, AC26-D22-P25, AC26-D22-P30, AC26-D22-P34, AC26-D22-P35, AC26-D22-P36, AC26-D22-P39, AC26-D22-P40. REQ26-D22-R15, REQ26-D22-R16, REQ26-D22-R24, REQ26-D22-R25, REQ26-D22-R26.

### Requirement: US26-D22-05 — Keep future search governed

The system SHALL provide the following observable outcome: As a platform capability owner, I want to preserve explicit indexing and source authority before extending search, so that ordinary search does not authorize AI or future corpora.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D22-P38

- **GIVEN** the actor, source, state and permission conditions specified by US26-D22-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Future-AI intent is recorded but no vectors, extraction, model/provider/egress key path, AI prompt or autonomous action runs now.

Additional binding suite/requirement identifiers: AC26-D22-P38. REQ26-D22-R23.

### Requirement: US26-D23-01 — Use the correct professional signature

The system SHALL provide the following observable outcome: As a Support responder, I want to see one eligible managed signature copy and refresh it deliberately, so that actual public identity is clear without silent message changes.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D23-P01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D23-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** One ordinary qualified responder replies with the approved personal name and team details without per-reply setup; team-only works when configured.

#### Scenario: AC26-D23-P03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D23-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Copy-in pins exact source revision; updating shared source cannot mutate existing draft, publication or admitted history.

#### Scenario: AC26-D23-P06

- **GIVEN** the actor, source, state and permission conditions specified by US26-D23-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Public-name edit leaves legal/auth/Party full name and contact data unchanged; allowed self-edit and denied cross-member/tenant mutation.

Additional binding suite/requirement identifiers: AC26-D23-P01, AC26-D23-P02, AC26-D23-P03, AC26-D23-P04, AC26-D23-P05, AC26-D23-P06, AC26-D23-P07, AC26-D23-P08, AC26-D23-P09, AC26-D23-P14, AC26-D23-P26, AC26-D23-P31, AC26-D23-P43. REQ26-D23-R01, REQ26-D23-R02, REQ26-D23-R03, REQ26-D23-R07, REQ26-D23-R08, REQ26-D23-R09, REQ26-D23-R10, REQ26-D23-R11, REQ26-D23-R12.

### Requirement: US26-D23-02 — Maintain signatures in Email Studio

The system SHALL provide the following observable outcome: As a qualified signature author or inbox administrator, I want to save, publish and apply exact revisions with distinct rights, so that private values are not published with shared content.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D23-P10

- **GIVEN** the actor, source, state and permission conditions specified by US26-D23-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Add/edit/duplicate/find/cancel/return preserve correct source, private draft and focus; metadata never appears as recipient content accidentally.

#### Scenario: AC26-D23-P11

- **GIVEN** the actor, source, state and permission conditions specified by US26-D23-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Autosave success, failure, offline, uncertain response, stale response and conflict show truthful state without lost newer work.

#### Scenario: AC26-D23-P12

- **GIVEN** the actor, source, state and permission conditions specified by US26-D23-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Save, publish and apply have separate outcomes; publishing sends nothing, preserves original head on failure and exposes exact impact.

Additional binding suite/requirement identifiers: AC26-D23-P10, AC26-D23-P11, AC26-D23-P12, AC26-D23-P13, AC26-D23-P15, AC26-D23-P18, AC26-D23-P27, AC26-D23-P29, AC26-D23-P30. REQ26-D23-R04, REQ26-D23-R05, REQ26-D23-R06, REQ26-D23-R20.

### Requirement: US26-D23-03 — Compose with canonical rich text

The system SHALL provide the following observable outcome: As a Support author, I want to use bounded Tiptap profiles with validation and durable editing, so that meaning survives modes, errors, devices and upgrades.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D23-P20

- **GIVEN** the actor, source, state and permission conditions specified by US26-D23-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Unknown nodes/marks/attrs/positions/protected metadata fail before parser normalization; invalid content cannot autosave a stripped replacement.

#### Scenario: AC26-D23-P22

- **GIVEN** the actor, source, state and permission conditions specified by US26-D23-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Document byte/depth/node/value and asset limits pass exact maximum and reject over-limit before expensive work, with useful errors.

#### Scenario: AC26-D23-P23

- **GIVEN** the actor, source, state and permission conditions specified by US26-D23-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Canonical structured document, HTML and plain text have the same allowed identity/meaning; caller HTML/text cannot override the document.

Additional binding suite/requirement identifiers: AC26-D23-P20, AC26-D23-P21, AC26-D23-P22, AC26-D23-P23, AC26-D23-P24, AC26-D23-P25, AC26-D23-P33, AC26-D23-P34, AC26-D23-P35, AC26-D23-P36, AC26-D23-P41. REQ26-D23-R13, REQ26-D23-R14, REQ26-D23-R15, REQ26-D23-R16, REQ26-D23-R23, REQ26-D23-R24, REQ26-D23-R25.

### Requirement: US26-D23-04 — Preserve source and identity authority

The system SHALL provide the following observable outcome: As a Email Studio or Support operator, I want to enforce source, responder, asset and draft boundaries through delivery, so that templates and stale tabs cannot rewrite history or disclose another identity.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D23-P15

- **GIVEN** the actor, source, state and permission conditions specified by US26-D23-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use/author/publish/review/inbox-config/send capabilities are independently allowed/denied through UI, API and direct database paths.

#### Scenario: AC26-D23-P18

- **GIVEN** the actor, source, state and permission conditions specified by US26-D23-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** One effective binding and valid lifecycle/cardinality hold under concurrent default writes; failures do not leave unintended no-default state.

#### Scenario: AC26-D23-P19

- **GIVEN** the actor, source, state and permission conditions specified by US26-D23-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Signature editor cannot create recipients, header changes, notes, acknowledgements, CRM updates, AI calls or provider sends.

Additional binding suite/requirement identifiers: AC26-D23-P15, AC26-D23-P16, AC26-D23-P17, AC26-D23-P18, AC26-D23-P19, AC26-D23-P27, AC26-D23-P28, AC26-D23-P31, AC26-D23-P32, AC26-D23-P37, AC26-D23-P38, AC26-D23-P42. REQ26-D23-R17, REQ26-D23-R18, REQ26-D23-R19, REQ26-D23-R21, REQ26-D23-R22.

### Requirement: US26-D23-05 — Qualify editor and email output

The system SHALL provide the following observable outcome: As a product release owner, I want to prove actual browser authoring and email rendering before rollout, so that a polished editor is not mistaken for delivered output proof.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D23-P33

- **GIVEN** the actor, source, state and permission conditions specified by US26-D23-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Actual Tiptap/React Email dependency closure and peers are qualified; no unsupported duplicate runtime or silent package upgrade.

#### Scenario: AC26-D23-P34

- **GIVEN** the actor, source, state and permission conditions specified by US26-D23-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Keyboard/screen-reader/accessible-outline authoring, variables, logo, save/review/publish and context return complete without drag/hover dependency.

#### Scenario: AC26-D23-P35

- **GIVEN** the actor, source, state and permission conditions specified by US26-D23-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Narrow/mobile/IME/virtual-keyboard/zoom/focus/low-bandwidth journeys preserve work and readable signature; static history avoids editor proliferation.

Additional binding suite/requirement identifiers: AC26-D23-P33, AC26-D23-P34, AC26-D23-P35, AC26-D23-P36, AC26-D23-P38, AC26-D23-P39, AC26-D23-P40, AC26-D23-P41, AC26-D23-P43, AC26-D23-P44. REQ26-D23-R26, REQ26-D23-R27, REQ26-D23-R28.

### Requirement: US26-D24-01 — Stage a useful reply-and-work shortcut

The system SHALL provide the following observable outcome: As a Support responder, I want to preview one shortcut and stage visible wording and work intent, so that repetitive entry falls without hidden execution or stacked plans.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D24-P01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D24-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A qualified staff member selects a curated reply shortcut, edits wording and admits one reply with the reviewed Support changes; no extra routine publication step.

#### Scenario: AC26-D24-P09

- **GIVEN** the actor, source, state and permission conditions specified by US26-D24-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Only one plan can be staged; conflicting status/handling/label requests cannot stack or silently overwrite.

#### Scenario: AC26-D24-P13

- **GIVEN** the actor, source, state and permission conditions specified by US26-D24-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Detach, mode change, navigation and restore cannot execute or leak a plan; detached copied wording retains source restrictions.

Additional binding suite/requirement identifiers: AC26-D24-P01, AC26-D24-P02, AC26-D24-P03, AC26-D24-P04, AC26-D24-P05, AC26-D24-P06, AC26-D24-P07, AC26-D24-P08, AC26-D24-P09, AC26-D24-P10, AC26-D24-P11, AC26-D24-P12, AC26-D24-P13, AC26-D24-P14, AC26-D24-P15, AC26-D24-P19. REQ26-D24-R01, REQ26-D24-R02, REQ26-D24-R03, REQ26-D24-R05, REQ26-D24-R07, REQ26-D24-R08, REQ26-D24-R09, REQ26-D24-R10, REQ26-D24-R11.

### Requirement: US26-D24-02 — Admit reply and work together

The system SHALL provide the following observable outcome: As an authorized responder, I want to review and send one complete current compound command, so that partial writes and uncertain delivery cannot contradict work state.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D24-P16

- **GIVEN** the actor, source, state and permission conditions specified by US26-D24-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Shortcut, source/asset, inbox, CRM-context and action scopes intersect on all APIs/reads/counts/targets; no cross-tenant or hidden-source leakage.

#### Scenario: AC26-D24-P17

- **GIVEN** the actor, source, state and permission conditions specified by US26-D24-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Actual responder differs from assignee/CRM owner; Me uses trusted membership; target identity cannot be forged or matched by email.

#### Scenario: AC26-D24-P18

- **GIVEN** the actor, source, state and permission conditions specified by US26-D24-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Tenant/account/conversation switch or late async result cannot personalize a new context with the previous donor's values.

Additional binding suite/requirement identifiers: AC26-D24-P16, AC26-D24-P17, AC26-D24-P18, AC26-D24-P19, AC26-D24-P20, AC26-D24-P21, AC26-D24-P22, AC26-D24-P23, AC26-D24-P24, AC26-D24-P25, AC26-D24-P26, AC26-D24-P27, AC26-D24-P32, AC26-D24-P36. REQ26-D24-R12, REQ26-D24-R13, REQ26-D24-R14, REQ26-D24-R15, REQ26-D24-R21.

### Requirement: US26-D24-03 — Curate exact shortcut revisions

The system SHALL provide the following observable outcome: As a qualified shortcut curator, I want to select published wording and activate or repair the reviewed combination, so that wording publication and Support activation remain independent.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D24-P28

- **GIVEN** the actor, source, state and permission conditions specified by US26-D24-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Save wording, publish wording, save shortcut and activate shortcut have separate permissions/effects; partial contextual publish/activate success is truthful.

#### Scenario: AC26-D24-P29

- **GIVEN** the actor, source, state and permission conditions specified by US26-D24-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Draft edit/duplicate/activate and expected-head races preserve the prior valid active revision; source upgrades require reviewed selection.

#### Scenario: AC26-D24-P30

- **GIVEN** the actor, source, state and permission conditions specified by US26-D24-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Broken dependencies do not prevent Archive; Restore checks current meaning; routine archive differs from restriction and does not rewrite valid staged work.

Additional binding suite/requirement identifiers: AC26-D24-P28, AC26-D24-P29, AC26-D24-P30, AC26-D24-P34, AC26-D24-P44. REQ26-D24-R04, REQ26-D24-R06, REQ26-D24-R16, REQ26-D24-R17, REQ26-D24-R18, REQ26-D24-R19.

### Requirement: US26-D24-04 — Inspect use and protect copied sources

The system SHALL provide the following observable outcome: As an authorized curator or operator, I want to see accurate admitted-use evidence and preserve current restrictions, so that statistics and portability cannot create a second transcript archive.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D24-P31

- **GIVEN** the actor, source, state and permission conditions specified by US26-D24-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Effective RLS USING/WITH CHECK, grants, columns, views, RPC/definer/service and direct routes prevent tenant/purpose/custody/actor/publication transformation.

#### Scenario: AC26-D24-P33

- **GIVEN** the actor, source, state and permission conditions specified by US26-D24-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Authoring preview uses synthetic data; draft/export/maintenance history does not leak live resolved values or personal My replies.

#### Scenario: AC26-D24-P34

- **GIVEN** the actor, source, state and permission conditions specified by US26-D24-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Maintainer/assignee/source-owner departure and same-email reuse preserve tenant custody while revoking actual access and flagging invalid targets.

Additional binding suite/requirement identifiers: AC26-D24-P31, AC26-D24-P33, AC26-D24-P34, AC26-D24-P35, AC26-D24-P37, AC26-D24-P38, AC26-D24-P45, AC26-D24-P46, AC26-D24-P49. REQ26-D24-R20, REQ26-D24-R22, REQ26-D24-R23.

### Requirement: US26-D24-05 — Qualify bounded shortcuts and later AI

The system SHALL provide the following observable outcome: As a product release owner, I want to prove current fixed presets while reserving AI for later qualification, so that the feature stays a clear human tool rather than a workflow engine.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D24-P39

- **GIVEN** the actor, source, state and permission conditions specified by US26-D24-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Legacy raw content/mixed actions convert only to inactive eligible candidates; unsupported steps are not silently removed and activated.

#### Scenario: AC26-D24-P40

- **GIVEN** the actor, source, state and permission conditions specified by US26-D24-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Mixed-version rollout fences all old macro/client/automatic writers; new draft cannot execute through the old loop.

#### Scenario: AC26-D24-P47

- **GIVEN** the actor, source, state and permission conditions specified by US26-D24-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Current implementation has no AI provider/index/egress/background mining; future integration cannot bypass source/indexing/tenant/identity gates.

Additional binding suite/requirement identifiers: AC26-D24-P39, AC26-D24-P40, AC26-D24-P41, AC26-D24-P42, AC26-D24-P43, AC26-D24-P47, AC26-D24-P48, AC26-D24-P50. REQ26-D24-R24, REQ26-D24-R25, REQ26-D24-R26, REQ26-D24-R27, REQ26-D24-R28, REQ26-D24-R29, REQ26-D24-R30.

### Requirement: US26-D25-01 — Complete the appropriate receiving path

The system SHALL provide the following observable outcome: As a Support administrator, I want to use an existing or dedicated address in a resumable journey, so that ordinary mail remains intact and external actions are clear.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D25-P01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D25-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Equal initial choices lead to complete existing/new paths; neither forces an unsuitable address or asks for protocol knowledge.

#### Scenario: AC26-D25-P02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D25-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Both paths reuse one qualified tenant receiving product with no mailbox sync/history import/AI/provider expansion.

#### Scenario: AC26-D25-P03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D25-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Public address/inbox/team/From/Reply-To/CRM identity remain separate; mixed sensitive mailbox is not silently shared.

Additional binding suite/requirement identifiers: AC26-D25-P01, AC26-D25-P02, AC26-D25-P03, AC26-D25-P04, AC26-D25-P07, AC26-D25-P08, AC26-D25-P09, AC26-D25-P10. REQ26-D25-R01, REQ26-D25-R02, REQ26-D25-R03, REQ26-D25-R04, REQ26-D25-R08, REQ26-D25-R09, REQ26-D25-R10.

### Requirement: US26-D25-02 — Prove actual addresses and message paths

The system SHALL provide the following observable outcome: As a qualified email administrator, I want to verify separate current receiving, public-destination and reply-return facts, so that activation depends on controlled evidence rather than a badge.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D25-P05

- **GIVEN** the actor, source, state and permission conditions specified by US26-D25-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Wrong/forged tenant tags/metadata/domain/headers cannot change authenticated connection scope; ambiguous owner is not exposed.

#### Scenario: AC26-D25-P06

- **GIVEN** the actor, source, state and permission conditions specified by US26-D25-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Contradictory To/Cc/Bcc/Received/received_for/thread refs/plus tokens cannot choose an arbitrary source/inbox.

#### Scenario: AC26-D25-P11

- **GIVEN** the actor, source, state and permission conditions specified by US26-D25-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Managed-route P17 proof and external-mailbox challenge cannot substitute for each other; own code receipt cannot self-confirm access.

Additional binding suite/requirement identifiers: AC26-D25-P05, AC26-D25-P06, AC26-D25-P11, AC26-D25-P12, AC26-D25-P13, AC26-D25-P14, AC26-D25-P15, AC26-D25-P33. REQ26-D25-R07, REQ26-D25-R11, REQ26-D25-R12, REQ26-D25-R13, REQ26-D25-R14.

### Requirement: US26-D25-03 — Maintain routes without losing mail

The system SHALL provide the following observable outcome: As a qualified inbox administrator, I want to activate, replace, pause, repair or retire exact routes, so that earlier input and unknown sends stay accountable.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D25-P14

- **GIVEN** the actor, source, state and permission conditions specified by US26-D25-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Activation commits binding/history/continuation atomically or changes none; conflicting proof/capability/address fails safely.

#### Scenario: AC26-D25-P16

- **GIVEN** the actor, source, state and permission conditions specified by US26-D25-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Early input reconciles completely under current source/D19 gates with original received/expiry/D13 utility/D14 obligation meaning intact.

#### Scenario: AC26-D25-P19

- **GIVEN** the actor, source, state and permission conditions specified by US26-D25-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Per-inbox pause does not disable tenant-wide sending/SMTP custody or close work; failure types have distinct repair.

Additional binding suite/requirement identifiers: AC26-D25-P14, AC26-D25-P16, AC26-D25-P17, AC26-D25-P18, AC26-D25-P19, AC26-D25-P20, AC26-D25-P22, AC26-D25-P23, AC26-D25-P29, AC26-D25-P37. REQ26-D25-R15, REQ26-D25-R16, REQ26-D25-R17, REQ26-D25-R18, REQ26-D25-R19, REQ26-D25-R20.

### Requirement: US26-D25-04 — Isolate provider authority

The system SHALL provide the following observable outcome: As a integration security operator, I want to bind distinct incoming and outgoing credential purposes to one proved account, so that receiving access cannot become a privileged sender or tenant selector.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D25-P21

- **GIVEN** the actor, source, state and permission conditions specified by US26-D25-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Incoming Full-access key is separate, encrypted, server-confined and rejected by every outbound/generic-proxy path.

#### Scenario: AC26-D25-P24

- **GIVEN** the actor, source, state and permission conditions specified by US26-D25-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Tenant/account/environment composite FKs and trusted immutable creator/current actor evidence resist reparent/forgery.

#### Scenario: AC26-D25-P27

- **GIVEN** the actor, source, state and permission conditions specified by US26-D25-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Effective RLS/grants/views/RPC/definer/service/storage and all direct writers enforce old/new-row and column boundaries.

Additional binding suite/requirement identifiers: AC26-D25-P21, AC26-D25-P24, AC26-D25-P27, AC26-D25-P28, AC26-D25-P34, AC26-D25-P39, AC26-D25-P40. REQ26-D25-R05, REQ26-D25-R06, REQ26-D25-R22, REQ26-D25-R23, REQ26-D25-R28.

### Requirement: US26-D25-05 — Recover and dispose setup material

The system SHALL provide the following observable outcome: As a intake or platform operator, I want to reconcile input and provider failures under finite custody, so that retries and restore cannot renew content or fake verification.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D25-P25

- **GIVEN** the actor, source, state and permission conditions specified by US26-D25-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Large pending sets filter before pagination, resume deterministically and do not lose matching items beyond first batch.

#### Scenario: AC26-D25-P26

- **GIVEN** the actor, source, state and permission conditions specified by US26-D25-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Failure after each local write/receipt/outbox point cannot leave falsely resolved input or missing authoritative audit.

#### Scenario: AC26-D25-P32

- **GIVEN** the actor, source, state and permission conditions specified by US26-D25-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Giving/receipt/care actions, D13 confirmations, D23 signatures and D24 shortcuts retain owner authority; verification cannot invoke them.

Additional binding suite/requirement identifiers: AC26-D25-P25, AC26-D25-P26, AC26-D25-P31, AC26-D25-P32, AC26-D25-P35, AC26-D25-P36, AC26-D25-P37, AC26-D25-P40, AC26-D25-P41, AC26-D25-P47, AC26-D25-P48, AC26-D25-P49. REQ26-D25-R21, REQ26-D25-R24, REQ26-D25-R25, REQ26-D25-R27.

### Requirement: US26-D25-06 — Qualify both setup paths

The system SHALL provide the following observable outcome: As a product release owner, I want to prove actual provider capability, complete tasks and operating limits, so that unsupported assumptions do not reach real tenants.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D25-P30

- **GIVEN** the actor, source, state and permission conditions specified by US26-D25-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Keyboard/touch/AT/zoom/reflow/IME/low-bandwidth both-path journeys expose all states/actions and return focus correctly.

#### Scenario: AC26-D25-P38

- **GIVEN** the actor, source, state and permission conditions specified by US26-D25-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Registered resource/rate/quota/transaction/query bounds hold under exact boundaries, skewed tenants and concurrent inboxes.

#### Scenario: AC26-D25-P42

- **GIVEN** the actor, source, state and permission conditions specified by US26-D25-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Legacy mappings backfill only evidenced facts; unknown/ambiguous data stays repairable without fabricated verification.

Additional binding suite/requirement identifiers: AC26-D25-P30, AC26-D25-P38, AC26-D25-P42, AC26-D25-P43, AC26-D25-P44, AC26-D25-P45, AC26-D25-P46, AC26-D25-P50. REQ26-D25-R26, REQ26-D25-R29, REQ26-D25-R30, REQ26-D25-R31, REQ26-D25-R32.

### Requirement: US26-D26-01 — Record a real non-email Support need

The system SHALL provide the following observable outcome: As a Support or CRM staff member, I want to record one bounded request from either surface, so that work capture needs no second call log or forced identity.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D26-P01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D26-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A received phone/in-person Support need is recordable; ordinary calls/tasks/care do not automatically create Support.

#### Scenario: AC26-D26-P02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D26-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Support-first and CRM-first use one source/command/detail identity with no mandatory Party, email or prior generic interaction.

#### Scenario: AC26-D26-P03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D26-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Record request creates no requester email, fictional mail event, D13 acknowledgement, auto-Party, optional follow or duplicate task; independently qualified staff attention retains its actual owner policy.

Additional binding suite/requirement identifiers: AC26-D26-P01, AC26-D26-P02, AC26-D26-P03, AC26-D26-P05, AC26-D26-P06, AC26-D26-P08, AC26-D26-P09, AC26-D26-P11, AC26-D26-P12. REQ26-D26-R01, REQ26-D26-R03, REQ26-D26-R04, REQ26-D26-R05, REQ26-D26-R06, REQ26-D26-R09, REQ26-D26-R10, REQ26-D26-R11.

### Requirement: US26-D26-02 — Give manual work a real home

The system SHALL provide the following observable outcome: As a qualified Support staff member, I want to record Open work with eligible handling and an optional reminder, so that email readiness does not force fake addresses or unowned work.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D26-P04

- **GIVEN** the actor, source, state and permission conditions specified by US26-D26-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A named qualified work inbox can be set up and manual admission completed without dummy email addresses; no eligible inbox has a draft-preserving setup/handoff path; archived scope rejects new work; real email still requires D25/P17/P6 readiness.

#### Scenario: AC26-D26-P07

- **GIVEN** the actor, source, state and permission conditions specified by US26-D26-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Open/Shared defaults and explicit eligible assignment/reminder choices obey D3/D6/D7/D8; invalid choices are not silently substituted.

Additional binding suite/requirement identifiers: AC26-D26-P04, AC26-D26-P07. REQ26-D26-R07, REQ26-D26-R08.

### Requirement: US26-D26-03 — Work every justified request from CRM

The system SHALL provide the following observable outcome: As a jointly authorized CRM and Support user, I want to discover manual and email work and open the same canonical detail, so that cross-surface continuity preserves privacy and avoids duplicate state.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D26-P10

- **GIVEN** the actor, source, state and permission conditions specified by US26-D26-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Cross-tenant, CRM-only, Support-only and field/source-restricted principals receive no unauthorized rows/counts/briefs/IDs/attachments.

#### Scenario: AC26-D26-P13

- **GIVEN** the actor, source, state and permission conditions specified by US26-D26-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Every eligible manual/email original is discoverable on each justified Party, deduped by current D10 root including overlapping bases.

#### Scenario: AC26-D26-P14

- **GIVEN** the actor, source, state and permission conditions specified by US26-D26-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Complete CRM view works beyond 1000/2000/50 source caps, with filters/authorization/dedupe before paging and no cross-page omissions.

Additional binding suite/requirement identifiers: AC26-D26-P10, AC26-D26-P13, AC26-D26-P14, AC26-D26-P15, AC26-D26-P16, AC26-D26-P17, AC26-D26-P18, AC26-D26-P19, AC26-D26-P20, AC26-D26-P21. REQ26-D26-R02, REQ26-D26-R12, REQ26-D26-R13, REQ26-D26-R14, REQ26-D26-R15, REQ26-D26-R16.

### Requirement: US26-D26-04 — Contact someone later deliberately

The system SHALL provide the following observable outcome: As an authorized Support responder, I want to start an email thread only with a newly reviewed qualified audience, so that an internal brief is never sent automatically and reply timing stays truthful.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D26-P22

- **GIVEN** the actor, source, state and permission conditions specified by US26-D26-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Internal brief/source is never inserted into a public email automatically; note/reply/signature/shortcut ownership remains correct.

#### Scenario: AC26-D26-P23

- **GIVEN** the actor, source, state and permission conditions specified by US26-D26-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Later Start email thread requires explicit qualified audience/new lineage and immutable P17/P6 preparation/dispatch; no trigger invented.

#### Scenario: AC26-D26-P47

- **GIVEN** the actor, source, state and permission conditions specified by US26-D26-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** D14 starts no target for manual creation; accepted Start email establishes later Next; unknown acceptance retains candidate First/Next and earliest applicable possible deadline, without backdated credit.

Additional binding suite/requirement identifiers: AC26-D26-P22, AC26-D26-P23, AC26-D26-P47, AC26-D26-P48. REQ26-D26-R17, REQ26-D26-R18, REQ26-D26-R19.

### Requirement: US26-D26-05 — Correct and retain original work honestly

The system SHALL provide the following observable outcome: As an authorized source owner, I want to correct links or unused mistaken work without abandoning obligations, so that topology, expiry and cancellation preserve provenance.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D26-P30

- **GIVEN** the actor, source, state and permission conditions specified by US26-D26-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Created-in-error cancellation retains every D12 unused-tracking exclusion, rejects used/completed work even with no current obligation, abandons no promise/task/review and never invents a source conversation.

#### Scenario: AC26-D26-P31

- **GIVEN** the actor, source, state and permission conditions specified by US26-D26-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Party merge/unmerge and D10 merge/Undo preserve original source/association provenance and one qualified CRM row.

#### Scenario: AC26-D26-P32

- **GIVEN** the actor, source, state and permission conditions specified by US26-D26-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Redaction/expiry removes every ineligible brief/title/file/search/draft derivative from both surfaces without deleting independent owner facts.

Additional binding suite/requirement identifiers: AC26-D26-P30, AC26-D26-P31, AC26-D26-P32, AC26-D26-P33, AC26-D26-P34, AC26-D26-P41. REQ26-D26-R20, REQ26-D26-R21, REQ26-D26-R22, REQ26-D26-R23.

### Requirement: US26-D26-06 — Operate one secure manual source

The system SHALL provide the following observable outcome: As a Support platform operator, I want to admit lawful work and associations atomically and reconcile outcomes, so that races and old code cannot create duplicates or false mail.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D26-P24

- **GIVEN** the actor, source, state and permission conditions specified by US26-D26-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Create commits work/brief/handling/links/history/receipt/continuation together or none under validation or dependency failure.

#### Scenario: AC26-D26-P25

- **GIVEN** the actor, source, state and permission conditions specified by US26-D26-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Double click, two tabs and lost response reconcile the same durable occurrence; changed payload conflicts; distinct needs remain possible.

#### Scenario: AC26-D26-P26

- **GIVEN** the actor, source, state and permission conditions specified by US26-D26-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Party/link/source/handling permission changes during create reject safely with preserved permitted draft and no silent partial links.

Additional binding suite/requirement identifiers: AC26-D26-P24, AC26-D26-P25, AC26-D26-P26, AC26-D26-P27, AC26-D26-P28, AC26-D26-P29, AC26-D26-P35, AC26-D26-P36, AC26-D26-P37, AC26-D26-P38, AC26-D26-P39, AC26-D26-P40, AC26-D26-P42, AC26-D26-P43, AC26-D26-P44, AC26-D26-P45, AC26-D26-P46, AC26-D26-P49, AC26-D26-P50. REQ26-D26-R24, REQ26-D26-R25, REQ26-D26-R26, REQ26-D26-R27, REQ26-D26-R28, REQ26-D26-R29, REQ26-D26-R30.

### Requirement: US26-D27-01 — Qualified US26-D27-01

The system SHALL provide the following observable outcome: As a Support worker, I want to find a selected public guide in the right Site and language, so that I can consult relevant information without losing my reply.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D27-01-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D27-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The Public finder searches the complete qualified selected title, summary and body population, uses explicit scope and shows a passive preview with a deliberate public-page action.

#### Scenario: AC26-D27-01-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D27-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** An Internal, draft, removed, unqualified or wrong-locale source is never substituted; incomplete search is not No matches.

#### Scenario: AC26-D27-01-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D27-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A guide failure affects only that source while safe composition and the other tab remain available.

Additional binding suite/requirement identifiers: REQ26-D27C-R03, REQ26-D27-R02, REQ26-D27-R03, REQ26-D27-R04, REQ26-D27-R07, REQ26-D27-R08, REQ26-D27-R09, REQ26-D27-R21, REQ26-D27-R23.

### Requirement: US26-D27-02 — Qualified US26-D27-02

The system SHALL provide the following observable outcome: As a Support worker, I want to insert a public guidance link at my intended selection, so that I can share useful information in one clear action.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D27-02-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D27-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Insert link adds the current source title at a valid caret; Link selected text preserves eligible selected wording, exact draft purpose, recipients, signature and source-qualified provenance.

#### Scenario: AC26-D27-02-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D27-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Preview does not insert or send; changing a destination cannot retain a false selected-source assertion or bypass a source restriction.

#### Scenario: AC26-D27-02-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D27-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Stale selection returns me to a valid draft position without losing text; recovery and Undo retain applicable source eligibility.

Additional binding suite/requirement identifiers: REQ26-D27-R10, REQ26-D27-R11, REQ26-D27-R12, REQ26-D27-R13, REQ26-D27-R14, REQ26-D27-R15.

### Requirement: US26-D27-03 — Qualified US26-D27-03

The system SHALL provide the following observable outcome: As an authorized curator, I want to maintain the tenant's public guidance selection, so that staff receive useful current sources without another CMS.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D27-03-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D27-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Add, Remove and re-add operate on one flat tenant selection set with stable source identity, current generation, trusted attribution and a durable receipt.

#### Scenario: AC26-D27-03-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D27-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Selection cannot publish a CMS Page, promote Shared-by-link to public discovery, or grant CMS editing authority.

#### Scenario: AC26-D27-03-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D27-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Concurrent curation conflicts rather than overwrites; lost results reconcile the same operation; source restoration never re-adds a deliberately Removed selection.

Additional binding suite/requirement identifiers: REQ26-D27-R05, REQ26-D27-R06, REQ26-D27-R18, REQ26-D27-R22.

### Requirement: US26-D27-04 — Qualified US26-D27-04

The system SHALL provide the following observable outcome: As a Support worker, I want to consult clearly labelled Internal staff guides, so that I can follow reusable procedures while keeping them out of outgoing content.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D27-04-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D27-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Public and Internal are separate tabs; current published Staff guides are privately searchable and readable with explicit language and Support-staff purpose.

#### Scenario: AC26-D27-04-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D27-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Internal has no reply/note insertion, Copy article or conversion-to-saved-reply action; a guide link grants no source or business-action access.

#### Scenario: AC26-D27-04-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D27-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Withdrawal, deletion or permission loss clears forbidden content; new publication is signalled without replacing text mid-reading.

Additional binding suite/requirement identifiers: REQ26-D27C-R01, REQ26-D27C-R02, REQ26-D27C-R05, REQ26-D27C-R12, REQ26-D27C-R13, REQ26-D27C-R14, REQ26-D27C-R21, REQ26-D27C-R24.

### Requirement: US26-D27-05 — Qualified US26-D27-05

The system SHALL provide the following observable outcome: As an authorized guide maintainer, I want to draft, publish and maintain an Internal guide, so that common instructions can improve without accidental publication.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D27-05-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D27-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A guide has stable identity and language, accountable maintainer, validated restricted structured content, one current candidate and one immutable published head; Publish to staff reviews the exact candidate and audience.

#### Scenario: AC26-D27-05-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D27-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Save draft does not publish; restore creates a candidate, not a live revision; ordinary publication cannot release a separate safety restriction or override retained custody.

#### Scenario: AC26-D27-05-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D27-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Conflicts retain working text; archive/delete while editing explicitly handles unsaved work; deletion progress and orphaned maintenance remain accountable.

Additional binding suite/requirement identifiers: REQ26-D27C-R04, REQ26-D27C-R06, REQ26-D27C-R07, REQ26-D27C-R08, REQ26-D27C-R09, REQ26-D27C-R10, REQ26-D27C-R11, REQ26-D27C-R16.

### Requirement: US26-D27-06 — Qualified US26-D27-06

The system SHALL provide the following observable outcome: As a tenant security owner, I want to keep Public and Internal guidance within their actual source boundaries, so that source reuse cannot expose protected material.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D27-06-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D27-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Same-tenant source identity, current capabilities, valid heads, trusted fields and effective grants/RLS protect all ordinary and privileged reads, writes and derived data.

#### Scenario: AC26-D27-06-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D27-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Internal content never enters a public index, sitemap, requester guidance or AI corpus; common guides cannot become case, finance or member-care records.

#### Scenario: AC26-D27-06-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D27-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Adverse source changes deny new use before eventual purge; compatible restore replays restrictions before serving.

Additional binding suite/requirement identifiers: REQ26-D27C-R17, REQ26-D27C-R18, REQ26-D27C-R19, REQ26-D27C-R20, REQ26-D27C-R23, REQ26-D27-R19, REQ26-D27-R20.

### Requirement: US26-D27-07 — Qualified US26-D27-07

The system SHALL provide the following observable outcome: As a Support worker, I want to use Guidance through the same authorized Support and CRM context, so that I avoid re-entry without changing other domains.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D27-07-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D27-07 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The canonical reader/finder preserves source, draft, cursor, query, scroll and return context; governed Public-link preparation uses the existing P17 and P6 boundaries.

#### Scenario: AC26-D27-07-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D27-07 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Consulting or inserting guidance creates no Party, Activity, message, last-contact update, business completion or internal-guide email preparation.

#### Scenario: AC26-D27-07-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D27-07 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Only exact affected definitely-unsubmitted material is fenced; already or possibly submitted effects retain immutable identity and qualified reconciliation.

Additional binding suite/requirement identifiers: REQ26-D27C-R15, REQ26-D27C-R22, REQ26-D27-R16, REQ26-D27-R17.

### Requirement: US26-D27-08 — Qualified US26-D27-08

The system SHALL provide the following observable outcome: As a platform operator, I want to activate and operate qualified Guidance, so that staff get complete safe lookup and manageable recovery.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D27-08-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D27-08 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Current owner search, publication, body/schema bounds, finite custody, complete indexed pagination, accessibility and production-shaped proof pass before activation.

#### Scenario: AC26-D27-08-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D27-08 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Demo knowledge, editor previews, title/URL matching and open planning PRs are not source qualification; no new wiki, hierarchy, media or AI platform is introduced.

#### Scenario: AC26-D27-08-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D27-08 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Scoped kill switches preserve unrelated Public/Internal and ordinary Support behavior while safety, disposal and durable correction continue.

Additional binding suite/requirement identifiers: REQ26-D27C-R25, REQ26-D27C-R26, REQ26-D27C-R27, REQ26-D27C-R28, REQ26-D27C-R29, REQ26-D27C-R30, REQ26-D27-R24, REQ26-D27-R25, REQ26-D27-R26, REQ26-D27-R27, REQ26-D27-R28, REQ26-D27-R29, REQ26-D27-R30.

### Requirement: US26-D28-01 — Qualified US26-D28-01

The system SHALL provide the following observable outcome: As an authorized feedback manager, I want to enable a small automatic feedback policy, so that the tenant can sample feedback without staff selecting favored recipients.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D28-01-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D28-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Automatic invitations start Off; enabling requires qualified inboxes, an integer percentage 1–100 with preset 25, accountable feedback ownership and viable review coverage.

#### Scenario: AC26-D28-01-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D28-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** There is no per-agent selection, donation-tier or sentiment targeting, replacement draw, hidden zero mode or invitation reminder.

#### Scenario: AC26-D28-01-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D28-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Off and scope removal fence current definitely-unsubmitted effects immediately without disabling ordinary Support; On again does not process old completed history.

Additional binding suite/requirement identifiers: REQ26-D28-R01, REQ26-D28-R02, REQ26-D28-R03, REQ26-D28-R09.

### Requirement: US26-D28-02 — Qualified US26-D28-02

The system SHALL provide the following observable outcome: As a Support operator, I want to select feedback opportunities once from genuine completed work, so that sampling and reporting remain honest through repeated completion and merging.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D28-02-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D28-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A completion candidate retains resolution generation, frozen policy and completion-plus-24-hour due time; one mature opportunity per original records the unbiased 0–9999 draw and compares it with percent times 100.

#### Scenario: AC26-D28-02-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D28-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** No response, spam, restricted care, insufficient human email, owed work or unreviewed recovery cannot qualify; merge/Undo cannot provide another chance or rewrite prior draws.

#### Scenario: AC26-D28-02-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D28-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Relevant input invalidates an immature generation and cancels definitely-unsubmitted mature effects without replenishing consumed opportunity; concurrent and repeated commands return the same durable decision.

Additional binding suite/requirement identifiers: REQ26-D28-R04, REQ26-D28-R05, REQ26-D28-R06, REQ26-D28-R11.

### Requirement: US26-D28-03 — Qualified US26-D28-03

The system SHALL provide the following observable outcome: As a requester, I want to receive feedback invitations sparingly at a justified endpoint, so that the invitation does not repeatedly interrupt me or misrepresent my identity.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D28-03-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D28-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** One source-qualified endpoint is selected without a CRM guess; the final submission guard enforces the tenant-wide 30-day mailbox gap across qualified inboxes and linked originals.

#### Scenario: AC26-D28-03-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D28-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Shared/on-behalf ambiguity is skipped with a safe reason; an address is not proof of a person; no CC fanout or automatic changed-address substitution occurs.

#### Scenario: AC26-D28-03-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D28-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Possible submission consumes the opportunity/gap; only a proved finite no-future-crossing boundary can release historical uncertainty after the accepted interval.

Additional binding suite/requirement identifiers: REQ26-D28-R07, REQ26-D28-R08, REQ26-D28-R10.

### Requirement: US26-D28-04 — Qualified US26-D28-04

The system SHALL provide the following observable outcome: As a requester, I want to submit a short neutral response and stop future invitations, so that I can express my experience without creating an account or giving marketing consent.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D28-04-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D28-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The protected inert-GET/Continue/Submit doorway presents the fixed three-choice satisfaction question with no selection and an optional 2000-scalar plain comment; one response is admitted with its exact question/invitation version.

#### Scenario: AC26-D28-04-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D28-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Scanners cannot vote; used links reveal no old comment; staff cannot edit my score; the separate restriction-only opt-out is not consumed by rating use or expiry.

#### Scenario: AC26-D28-04-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D28-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Same-input retry resolves the original receipt; changed replay conflicts; response authority expires no later than issuance plus 14 days, while the separately issued opt-out credential lasts at most 90 days and its recorded preference does not expire with the credential.

Additional binding suite/requirement identifiers: REQ26-D28-R13, REQ26-D28-R14, REQ26-D28-R15, REQ26-D28-R16, REQ26-D28-R17.

### Requirement: US26-D28-05 — Qualified US26-D28-05

The system SHALL provide the following observable outcome: As an authorized feedback reviewer, I want to review every submitted response in context, so that feedback leads to appropriate human attention without automatic promises.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D28-05-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D28-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Reports → Feedback and the canonical conversation expose current authorized invitation/response history and idempotent Mark reviewed with actor/time.

#### Scenario: AC26-D28-05-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D28-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Low scores do not alone create a ticket, apology, new contact, giving change or resolution; participation is not verified personal testimony or anonymous feedback.

#### Scenario: AC26-D28-05-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D28-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Loss of reviewer coverage creates safe oversight attention; justified follow-up uses existing owner commands and purpose-aware custody without renewing older transcripts.

Additional binding suite/requirement identifiers: REQ26-D28-R18, REQ26-D28-R19, REQ26-D28-R30.

### Requirement: US26-D28-06 — Qualified US26-D28-06

The system SHALL provide the following observable outcome: As a Support analyst, I want to see accurate feedback cohorts and exclusions, so that sampling and response rates cannot hide uncertainty.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D28-06-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D28-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Issued means submission may have begun; response fraction uses responses to that same issued cohort, including indeterminate submission, with separate eligibility/draw/suppression/delivery/response units.

#### Scenario: AC26-D28-06-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D28-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** No response is neither positive nor negative; no leaderboards, cross-vendor benchmark, representativeness claim or deletion to improve scores is permitted.

#### Scenario: AC26-D28-06-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D28-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Later restrictions, corrections and topology changes preserve historical effect counts and disclose their actual denominator or availability consequence.

Additional binding suite/requirement identifiers: REQ26-D28-R24, REQ26-D28-R27.

### Requirement: US26-D28-07 — Qualified US26-D28-07

The system SHALL provide the following observable outcome: As a platform owner, I want to deliver and operate feedback through shared contact, content and transport owners, so that a survey feature cannot bypass communication or privacy controls.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D28-07-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D28-07 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** P3 owns contactability and the persistent purpose opt-out, Support owns opportunities/responses/review, P17 owns the named response/preference descriptor pair and preparation, and P6 owns actual effect/submission recovery.

#### Scenario: AC26-D28-07-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D28-07 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** No feedback action prepares before qualification or submits at/after due-plus-24-hour send-by; no raw endpoint, comment, action token or private case detail is used as diagnostics or public payload.

#### Scenario: AC26-D28-07-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D28-07 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Atomic constraints, grant/RLS closure, finite custody, migration fencing and accepted load/release proof remain prerequisites; ordinary human replies remain independent.

Additional binding suite/requirement identifiers: REQ26-D28-R12, REQ26-D28-R20, REQ26-D28-R21, REQ26-D28-R22, REQ26-D28-R23, REQ26-D28-R25, REQ26-D28-R26, REQ26-D28-R28, REQ26-D28-R29, REQ26-D28-R31.

### Requirement: US26-D29-01 — Qualified US26-D29-01

The system SHALL provide the following observable outcome: As a person seeking help, I want to contact the tenant immediately, so that I can ask for help without a questionnaire or self-service barrier.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D29-01-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D29-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The qualified Contact entry immediately shows required reply email and message, optional unsplit name, monitored published email and any deliberately published phone; contact precedes optional guides on narrow screens.

#### Scenario: AC26-D29-01-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D29-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** No required account, subject, department, donor number, phone, upload, payment, article review or mandatory puzzle is added.

#### Scenario: AC26-D29-01-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D29-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Recoverable errors retain safe answers and show current independently qualified contact alternatives; unknown receipt is not success or a blind alternate-channel resend.

Additional binding suite/requirement identifiers: REQ26-D29-R01, REQ26-D29-R02, REQ26-D29-R03, REQ26-D29-R04, REQ26-D29-R05, REQ26-D29-R25.

### Requirement: US26-D29-02 — Qualified US26-D29-02

The system SHALL provide the following observable outcome: As a person seeking information, I want to open a relevant optional public guide, so that I can get information without losing my contact form.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D29-02-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D29-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Each entry offers zero to three explicitly selected Listed Page references in deliberate order, with current title/summary and a safe new-tab link.

#### Scenario: AC26-D29-02-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D29-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Shared-by-link staff selections, Internal guides, private context and unavailable sources cannot enter requester discovery or produce substitute articles.

#### Scenario: AC26-D29-02-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D29-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Guide-only failure suppresses only the qualified optional leaf; the independently valid contact closure remains usable and the current form stays intact.

Additional binding suite/requirement identifiers: REQ26-D29-R06, REQ26-D29-R07, REQ26-D29-R08, REQ26-D29-R09.

### Requirement: US26-D29-03 — Qualified US26-D29-03

The system SHALL provide the following observable outcome: As a signed-in requester, I want to review my own reply address and optional account context, so that staff can understand the request without receiving unauthorized account details.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D29-03-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D29-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Any self-prefill is visible/editable and one owner-qualified About context is removable; the server rechecks the actual tenant, principal, entry, source and revision.

#### Scenario: AC26-D29-03-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D29-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Represented-party or CRM-owner addresses never become requester defaults; matching email proves no identity or record rights; public content remains auth-invariant.

#### Scenario: AC26-D29-03-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D29-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Context loss removes unqualified references/prefill while retaining only safe visitor-authored text for deliberate requalification or Send without account details; logout, account/tenant change and successful receipt clear the full draft.

Additional binding suite/requirement identifiers: REQ26-D29-R10, REQ26-D29-R11, REQ26-D29-R12, REQ26-D29-R20.

### Requirement: US26-D29-04 — Qualified US26-D29-04

The system SHALL provide the following observable outcome: As a requester, I want to receive a dependable acknowledgment of my submitted request, so that I know whether the tenant actually accepted responsibility.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D29-04-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D29-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** One Contact-purpose transaction admits the immutable form occurrence, exact route, durable primary Support acceptance, optional children and required continuation before the persistent Received message.

#### Scenario: AC26-D29-04-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D29-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A phone/email click, event publication or optional email is not acceptance; no fake incoming RFC email, provider ID or staff-note source is manufactured.

#### Scenario: AC26-D29-04-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D29-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Identical-intent retries reconcile the same privacy-safe receipt; changed input conflicts; deferred materialization stays discoverable and reuses the accepted route and original clocks.

Additional binding suite/requirement identifiers: REQ26-D29-R13, REQ26-D29-R14, REQ26-D29-R15, REQ26-D29-R16.

### Requirement: US26-D29-05 — Qualified US26-D29-05

The system SHALL provide the following observable outcome: As an authorized tenant manager, I want to optionally enable a neutral visitor email confirmation, so that browser receipt can be supplemented without duplicate or stale mail.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D29-05-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D29-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The P23 zero-or-one acknowledgment starts Off and uses a separately qualified web-Contact P17 profile, original 15-minute utility and shared tenant/mailbox 24-hour courtesy across email and form families.

#### Scenario: AC26-D29-05-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D29-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Publishing wording does not enable sending; no answer/context echo, CC, knowledge answer, permanent generated copy or second D13 confirmation is added.

#### Scenario: AC26-D29-05-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D29-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A qualified human reply for the same request and exact recipient ends additional confirmation-call/decrypt authority before or after possible submission; optional-child failure never rejects the accepted primary.

Additional binding suite/requirement identifiers: REQ26-D29-R17, REQ26-D29-R18, REQ26-D29-R19.

### Requirement: US26-D29-06 — Qualified US26-D29-06

The system SHALL provide the following observable outcome: As an authorized Help maintainer, I want to manage actual contact and guide placements through their owners, so that the tenant's contact path stays clear and supportable.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D29-06-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D29-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Requester help exposes public/app placements, exact locale, route, selected guides, readiness and source-owner preview/edit actions without duplicate editors.

#### Scenario: AC26-D29-06-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D29-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Public and app releases are not a claimed single transaction; publishing contact data is not verified destination authority; no fallback tenant/address or generic rules builder is invented.

#### Scenario: AC26-D29-06-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D29-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Repair and retirement preserve accepted requests, original routes, current safe alternatives and source privacy; old writers and hard-coded demo claims are fenced before activation.

Additional binding suite/requirement identifiers: REQ26-D29-R24, REQ26-D29-R28.

### Requirement: US26-D29-07 — Qualified US26-D29-07

The system SHALL provide the following observable outcome: As a requester using assistive technology or a narrow device, I want to complete the same contact journey accessibly, so that I can reach the tenant regardless of input method.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D29-07-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D29-07 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Native submission, labels, errors, receipt and no-JavaScript behavior preserve valid scope; accepted 10000-scalar message, 200-scalar name and 256-KiB raw ceilings are enforced server-side.

#### Scenario: AC26-D29-07-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D29-07 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** 200-percent text resize alone is not reflow proof: verify 320-CSS-pixel width, 400-percent zoom from 1280 pixels, focus-not-entirely-obscured and actual target-size exceptions; standalone primary touch actions target 44 by 44 pixels.

#### Scenario: AC26-D29-07-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D29-07 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Mobile keyboards, RTL/long contact strings, low bandwidth, privacy/abuse, current grants and accepted two-tenant/load/retry proof must pass; no fake Received or unauthorized CRM mutation is tolerated.

Additional binding suite/requirement identifiers: REQ26-D29-R21, REQ26-D29-R22, REQ26-D29-R23, REQ26-D29-R26, REQ26-D29-R27, REQ26-D29-R29.

### Requirement: US26-D30-01 — Qualified US26-D30-01

The system SHALL provide the following observable outcome: As a Support worker, I want to see current work without losing normal navigation, so that I can find the next legitimate action quickly.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D30-01-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D30-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Overview offers All unfinished, Unassigned and Replies needing attention as distinct current-conversation counts, with truthful overlap and all-date links to independent review destinations.

#### Scenario: AC26-D30-01-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D30-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Counts do not add overlapping groups, hide deferred/waiting work, certify recovery complete or force Overview as everyone's landing page.

#### Scenario: AC26-D30-01-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D30-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Unknown scope is Selected inbox unavailable rather than All or zero; retired metadata remains only where current owner access permits it.

Additional binding suite/requirement identifiers: REQ26-D30-R02, REQ26-D30-R03, REQ26-D30-R04, REQ26-D30-R05.

### Requirement: US26-D30-02 — Qualified US26-D30-02

The system SHALL provide the following observable outcome: As a Support analyst, I want to review historical results under clear independent scope, so that each metric retains its actual meaning.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D30-02-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D30-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Results has its own period/zone and four fixed sections: Reply targets, Reply times, Current labels on conversations started and Feedback invitations issued.

#### Scenario: AC26-D30-02-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D30-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Work now's Currently handled in filter cannot silently change historical cohorts; no shared fake inbox dimension, health score, leaderboard or inferred business completion is added.

#### Scenario: AC26-D30-02-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D30-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Off preserves authorized history; unknown source/cohort/denominator remains explicit rather than a perfect percentage or fabricated empty result.

Additional binding suite/requirement identifiers: REQ26-D30-R06, REQ26-D30-R11, REQ26-D30-R12.

### Requirement: US26-D30-03 — Qualified US26-D30-03

The system SHALL provide the following observable outcome: As a Support analyst, I want to choose and inspect a precise reporting period, so that I understand the dates and partial interval behind the results.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D30-03-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D30-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Last 7 days, Last 30 days, This month and Custom show actual local endpoints/zone; new contexts use Last 30 days including today; Custom applies 1–366 inclusive dates ending no later than local today.

#### Scenario: AC26-D30-03-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D30-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Period boundaries are owner-compiled half-open intervals, not client-local guessed timestamps; changing reporting zone does not rewrite source calendars.

#### Scenario: AC26-D30-03-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D30-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Invalid input keeps previous values under their previous labels; a partial day/month shows Through the trusted evaluation instant.

Additional binding suite/requirement identifiers: REQ26-D30-R07.

### Requirement: US26-D30-04 — Qualified US26-D30-04

The system SHALL provide the following observable outcome: As a Support analyst, I want to open the exact source detail behind a result, so that I can inspect evidence without changing its denominator.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D30-04-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D30-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Target cohorts keep First/Next and assessed/finalized distinctions, times keep completed waits/median/nearest-rank p90, labels show up to five overlapping counts, and feedback uses the original issued cohort.

#### Scenario: AC26-D30-04-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D30-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A count of waits is not a count of conversations; no averaging percentages or percentiles, pie residual or unknown label metadata converted to No labels.

#### Scenario: AC26-D30-04-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D30-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Drilldown reauthorizes and either safely replays the evaluation or visibly re-evaluates the same meaning; Back restores permitted control/focus/scroll context.

Additional binding suite/requirement identifiers: REQ26-D30-R08, REQ26-D30-R09, REQ26-D30-R10, REQ26-D30-R15, REQ26-D30-R23.

### Requirement: US26-D30-05 — Qualified US26-D30-05

The system SHALL provide the following observable outcome: As a Support worker, I want to refresh useful results without disruptive motion, so that I can trust freshness while continuing my task.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D30-05-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D30-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Coherent Work now refreshes at most every 60 seconds while visible/online; historical blocks refresh for their accepted triggers, and Now becomes Out of date after 120 seconds without a qualified read.

#### Scenario: AC26-D30-05-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D30-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** No late response may replace a newer scope, stale authority preserve forbidden values, or automatic refresh steal focus or announce every count.

#### Scenario: AC26-D30-05-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D30-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Each block independently distinguishes loading, empty, incomplete, failed and stale; one unavailable block cannot disable safe Support navigation.

Additional binding suite/requirement identifiers: REQ26-D30-R13, REQ26-D30-R14, REQ26-D30-R16, REQ26-D30-R27, REQ26-D30-R28.

### Requirement: US26-D30-06 — Qualified US26-D30-06

The system SHALL provide the following observable outcome: As a platform reporting owner, I want to evolve a fixed overview toward future full configuration, so that the accepted long-term direction remains possible without a premature builder.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D30-06-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D30-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Use stable owner-qualified definition/read/detail contracts and one current fixed composition; future compatible composition belongs to qualified shared Phase33 reporting.

#### Scenario: AC26-D30-06-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D30-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** No layout database, arbitrary formula/join engine, drag editor, hidden Configure control or metric authority transfer ships in this phase.

#### Scenario: AC26-D30-06-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D30-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Versioned source contracts and compatible rollout preserve retained source meaning and safe detailed reports; future configuration needs its own complete permission and lifecycle contract.

Additional binding suite/requirement identifiers: REQ26-D30-R01, REQ26-D30-R17, REQ26-D30-R18, REQ26-D30-R26.

### Requirement: US26-D30-07 — Qualified US26-D30-07

The system SHALL provide the following observable outcome: As a platform security and operations owner, I want to serve complete authorized report results efficiently, so that derived views cannot leak or distort source truth.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D30-07-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D30-07 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Current source/field/component/tenant authority precedes aggregation, cache, prefetch and detail; exact counts, at-most-50 detail pages and the accepted production-shaped fixture/budgets are qualified.

#### Scenario: AC26-D30-07-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D30-07 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** No raw-body download, broad first-page aggregate, copied CRM Activity, email schedule or report-view mutation is introduced.

#### Scenario: AC26-D30-07-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D30-07 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Restriction, failures and schema changes retain finite custody, explicit repair and compatible roll-forward; measured evidence, not source inspection alone, is required.

Additional binding suite/requirement identifiers: REQ26-D30-R19, REQ26-D30-R20, REQ26-D30-R21, REQ26-D30-R22, REQ26-D30-R24, REQ26-D30-R25, REQ26-D30-R29, REQ26-D30-R30, REQ26-D30-R31.

### Requirement: US26-D31-01 — Qualified US26-D31-01

The system SHALL provide the following observable outcome: As a Support worker, I want to choose a consistent quick follow-up time, so that I can schedule without doing calendar arithmetic.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D31-01-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D31-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Every entry offers In 1 hour, In 4 hours, Tomorrow and In 1 week with a stable reviewed exact date/time/zone, plus Choose date and time.

#### Scenario: AC26-D31-01-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D31-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Elapsed choices add 3600/14400 seconds then round upward to a minute; calendar choices use local date plus one/seven and current displayed minute, never business-day adjustment.

#### Scenario: AC26-D31-01-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D31-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Choices stay stable until deliberate refresh or edit; aging relative labels are qualified rather than silently moved.

Additional binding suite/requirement identifiers: REQ26-D31-R02, REQ26-D31-R03, REQ26-D31-R05.

### Requirement: US26-D31-02 — Qualified US26-D31-02

The system SHALL provide the following observable outcome: As a Support worker, I want to enter a custom date, time and zone directly, so that I can schedule an exact useful moment without endless calendar clicks.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D31-02-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D31-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Custom starts at today's date with time unset unless continuing/editing a candidate; Set/Update is deliberate and uses the exact validated future instant.

#### Scenario: AC26-D31-02-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D31-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Nonexistent wall times require correction and repeated wall times require an explicit offset choice; no silent rollover, ambiguous date parse or arbitrary short future horizon.

#### Scenario: AC26-D31-02-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D31-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Errors retain input; timezone changes re-resolve a reviewed candidate, while later timezone/travel/tzdb changes never rewrite an accepted instant or invent missing historical zone provenance.

Additional binding suite/requirement identifiers: REQ26-D31-R04, REQ26-D31-R06, REQ26-D31-R07, REQ26-D31-R08, REQ26-D31-R18.

### Requirement: US26-D31-03 — Qualified US26-D31-03

The system SHALL provide the following observable outcome: As a Support worker, I want to change or remove the shared reminder without altering unrelated work, so that follow-up remains understandable.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D31-03-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D31-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** One current generation is replaced conditionally; Remove cancels that reminder/deferral, Work now is explicit Open, Resolve cancels and current due processing opens follow-up review.

#### Scenario: AC26-D31-03-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D31-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Opening a picker does not reopen, assign, change a CRM task, service target or owner deadline; merge/Undo uses the already reviewed resulting plan.

#### Scenario: AC26-D31-03-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D31-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Late jobs and stale generations cannot resurrect reminders; actual due work remains discoverable and applicable absence coverage runs through its own owner.

Additional binding suite/requirement identifiers: REQ26-D31-R01, REQ26-D31-R09.

### Requirement: US26-D31-04 — Qualified US26-D31-04

The system SHALL provide the following observable outcome: As a Support worker, I want to recover an uncertain reminder change across views and CRM, so that a retry preserves the time I actually selected.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D31-04-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D31-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Commands bind exact source, expected generation, reviewed instant and semantic operation identity; identical retry reconciles before applying new-admission future-time validation.

#### Scenario: AC26-D31-04-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D31-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A browser cancel or timeout is not rollback; caller tenant/actor/time fields cannot establish authority; no raw generic status-field bypass is accepted.

#### Scenario: AC26-D31-04-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D31-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Mixed bulk outcomes are shown per reviewed source and retry only eligible failed items; unavailable access/clock remains explicit without losing safe input.

Additional binding suite/requirement identifiers: REQ26-D31-R11, REQ26-D31-R13, REQ26-D31-R14, REQ26-D31-R15, REQ26-D31-R23.

### Requirement: US26-D31-05 — Qualified US26-D31-05

The system SHALL provide the following observable outcome: As a platform operator, I want to execute follow-up reliably through the existing owners, so that a long horizon or outage cannot silently lose work.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D31-05-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D31-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The actual owner schedules bounded durable execution and catch-up, using trusted admission/due clocks and accepted exact timing, source and database invariants.

#### Scenario: AC26-D31-05-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D31-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** No unbounded provider sleep, persistent due-later-than-now constraint, new personal alarm, mandatory message or Tiptap date editor is introduced.

#### Scenario: AC26-D31-05-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D31-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Privacy/custody, current grants/RLS, migration, load and actual keyboard/mobile/AT proof qualify activation; Email Studio/P6 effects remain independently authorized.

Additional binding suite/requirement identifiers: REQ26-D31-R10, REQ26-D31-R12, REQ26-D31-R16, REQ26-D31-R17, REQ26-D31-R19, REQ26-D31-R20, REQ26-D31-R21, REQ26-D31-R22, REQ26-D31-R24.

### Requirement: US26-D32-01 — Qualified US26-D32-01

The system SHALL provide the following observable outcome: As a Support worker, I want to preview an eligible attachment where I am working, so that I can understand the file without losing context.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D32-01-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D32-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A metadata-first file card separates Preview from Download original and opens one deliberate read-only viewer with exact availability and return to the same source, draft and CRM origin.

#### Scenario: AC26-D32-01-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D32-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Preview is not download, send, OCR/search import or permission to see another source; unsupported/missing content is not an empty successful rendering.

#### Scenario: AC26-D32-01-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D32-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Current source restrictions clear invalid content and all derivatives; a preview limit may still leave a separately authorized original download available.

Additional binding suite/requirement identifiers: REQ26-D32-R03, REQ26-D32-R04, REQ26-D32-R16.

### Requirement: US26-D32-02 — Qualified US26-D32-02

The system SHALL provide the following observable outcome: As a Support worker, I want to read document, slide and image previews with honest coverage, so that I can rely on what the preview actually shows.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D32-02-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D32-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Initial eligible lanes are PNG/JPEG/WebP/still GIF, ordinary unencrypted PDF, DOCX, PPTX, XLSX, TXT and CSV under their exact profiles; documents/slides use inert static renditions.

#### Scenario: AC26-D32-02-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D32-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** No scripts, macros, active forms, network resources, hidden comments/revisions/notes or unsupported layout are silently exposed or claimed complete.

#### Scenario: AC26-D32-02-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D32-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Meaningful omitted content, missing fonts/resources and fidelity limitations are explicit; ordinary source material is preserved and not edited by conversion.

Additional binding suite/requirement identifiers: REQ26-D32-R01, REQ26-D32-R09, REQ26-D32-R10, REQ26-D32-R11, REQ26-D32-R14.

### Requirement: US26-D32-03 — Qualified US26-D32-03

The system SHALL provide the following observable outcome: As a Support worker, I want to inspect spreadsheet and text values without changing them, so that file reading cannot recalculate or corrupt evidence.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D32-03-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D32-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** XLSX uses visible sheets and saved values with original coordinates, typed/raw value preservation, explicit missing caches and date-system meaning; TXT/CSV are literal decoded data.

#### Scenario: AC26-D32-03-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D32-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** No recalculation, external refresh, macro, import, source rewrite, hidden-sheet reveal, false zero, numeric identifier coercion or print-area-as-complete-workbook shortcut.

#### Scenario: AC26-D32-03-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D32-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Sparse bounds, malformed encoding, all-hidden/empty and unsupported features produce exact limited/unavailable outcomes without silently truncating complete content.

Additional binding suite/requirement identifiers: REQ26-D32-R12, REQ26-D32-R13.

### Requirement: US26-D32-04 — Qualified US26-D32-04

The system SHALL provide the following observable outcome: As a platform file owner, I want to create source-bound private renditions safely, so that untrusted files cannot escape their processing or permission boundary.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D32-04-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D32-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Original source and derived rendition have separate stable identities; private generation-bound admission, scan, isolated parsing, current authorization and atomic publication apply across browser, storage and workers.

#### Scenario: AC26-D32-04-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D32-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** No provider URL or client MIME/ZIP metadata grants access or determines actual resource size; no ordinary app-origin executable preview or cross-tenant derivative reuse.

#### Scenario: AC26-D32-04-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D32-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Stop, expiry, revocation, failed attempts and late results cannot publish stale material; only classified transient failure allows the accepted second attempt.

Additional binding suite/requirement identifiers: REQ26-D32-R02, REQ26-D32-R05, REQ26-D32-R06, REQ26-D32-R07, REQ26-D32-R08, REQ26-D32-R17, REQ26-D32-R18, REQ26-D32-R22, REQ26-D32-R24.

### Requirement: US26-D32-05 — Qualified US26-D32-05

The system SHALL provide the following observable outcome: As a platform operator, I want to enforce exact preview budgets and recovery, so that one difficult file cannot overwhelm other tenants.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D32-05-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D32-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Apply the accepted input/package/page/pixel/cell/text/output ceilings and 60-second elapsed, 30-second process-tree CPU, 2-GiB memory and 512-MiB temporary-disk ceilings per attempt.

#### Scenario: AC26-D32-05-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D32-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** No output silently truncated as complete, resource trust based only on metadata, unlimited retry or public conversion provider is introduced.

#### Scenario: AC26-D32-05-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D32-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Bounded scheduling, fair load, current parser dependencies, finite derivative custody, source-first rollout and actual malicious/fidelity/accessibility/load proof are release prerequisites.

Additional binding suite/requirement identifiers: REQ26-D32-R15, REQ26-D32-R25, REQ26-D32-R26, REQ26-D32-R27.

### Requirement: US26-D32-06 — Qualified US26-D32-06

The system SHALL provide the following observable outcome: As a Support worker, I want to use files coherently across Support and CRM, so that the platform preserves both source meaning and my work.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D32-06-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D32-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The shared reader preserves selection, focus, context and actual source permissions; typed links lead to their independently authorized owner.

#### Scenario: AC26-D32-06-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D32-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Opening a file does not copy it into Email Studio, Document Studio, another CRM record, AI corpus or outgoing attachment set, or prove a financial action.

#### Scenario: AC26-D32-06-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D32-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Base UI/base-maia, keyboard/AT, text alternatives, mobile/zoom and low-bandwidth failures remain usable under current source availability.

Additional binding suite/requirement identifiers: REQ26-D32-R19, REQ26-D32-R20, REQ26-D32-R21, REQ26-D32-R23, REQ26-D32-R28.

### Requirement: US26-D33-01 — Qualified US26-D33-01

The system SHALL provide the following observable outcome: As a Support worker, I want to choose my Compact or Full reading default where I read, so that I can use the presentation that suits me.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D33-01-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D33-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Compact is the absent-preference default; the labelled reading control saves my tenant-scoped personal choice for qualified future readings, while temporary disclosure remains local.

#### Scenario: AC26-D33-01-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D33-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A loading/failed preference is not confirmed absence; one person's preference cannot become tenant, assignment or conversation policy.

#### Scenario: AC26-D33-01-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D33-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The exact chosen state saves with honest feedback and concurrency handling; late responses do not overwrite a newer choice or reset a draft.

Additional binding suite/requirement identifiers: REQ26-D33-R01, REQ26-D33-R02, REQ26-D33-R03, REQ26-D33-R04, REQ26-D33-R05, REQ26-D33-R06, REQ26-D33-R07.

### Requirement: US26-D33-02 — Qualified US26-D33-02

The system SHALL provide the following observable outcome: As a Support worker, I want to read compact history without losing unique content, so that repeated email material does not overwhelm the conversation.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D33-02-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D33-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Only conservatively proved repeated quotation/signature regions fold, retaining source maps and explicit disclosure controls; unique content, important metadata and source meaning remain visible.

#### Scenario: AC26-D33-02-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D33-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Text similarity, destructive stripping or uncertain parsing cannot remove material; Full is safe complete presentation of available authorized content, not raw active HTML.

#### Scenario: AC26-D33-02-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D33-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Unsupported/ambiguous parsing uses the safe full-content fallback; source restrictions still override earlier disclosed content.

Additional binding suite/requirement identifiers: REQ26-D33-R08, REQ26-D33-R09, REQ26-D33-R10.

### Requirement: US26-D33-03 — Qualified US26-D33-03

The system SHALL provide the following observable outcome: As a Support worker, I want to find exact content and return without losing place, so that reading mode does not make work harder.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D33-03-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D33-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Conversation Find covers the qualified source population and opens the exact matching source/region, including folded text where lawful, while preserving selection, scroll, focus and draft.

#### Scenario: AC26-D33-03-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D33-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Search cannot silently omit folded content, reparent originals or treat a jump as business completion.

#### Scenario: AC26-D33-03-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D33-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** CRM and file-reader returns use the same current-authorized source and personal setting; revoked content is cleared rather than restored from navigation cache.

Additional binding suite/requirement identifiers: REQ26-D33-R11, REQ26-D33-R12, REQ26-D33-R17.

### Requirement: US26-D33-04 — Qualified US26-D33-04

The system SHALL provide the following observable outcome: As a platform owner, I want to store only the small qualified personal reading preference, so that presentation cannot become another authority or disclosure path.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D33-04-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D33-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Closed preference values and tenant/real-person identity, conditional desired-state command, current grants/RLS and finite cache/source lifetimes govern every reader.

#### Scenario: AC26-D33-04-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D33-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** No unread receipt, message edit, provider-mailbox sync, Email Studio rendering change, AI or duplicate CRM state follows from a reading preference.

#### Scenario: AC26-D33-04-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D33-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Compatible readers/writers, exact Base UI/base-maia, bounded folding/search and accepted browser/AT/performance proof precede activation.

Additional binding suite/requirement identifiers: REQ26-D33-R13, REQ26-D33-R14, REQ26-D33-R15, REQ26-D33-R16, REQ26-D33-R18, REQ26-D33-R19, REQ26-D33-R20, REQ26-D33-R21, REQ26-D33-R22, REQ26-D33-R23, REQ26-D33-R24, REQ26-D33-R25, REQ26-D33-R26.

### Requirement: US26-D34-01 — Qualified US26-D34-01

The system SHALL provide the following observable outcome: As a Support worker, I want to see when a teammate is actively composing, so that I can coordinate without treating a hint as a lock.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D34-01-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D34-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A quiet named cue reflects qualified current composing activity and complete permitted projection, with clear unavailable state and no fourth pane or viewer roster.

#### Scenario: AC26-D34-01-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D34-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** No message content, keystrokes, recipient details, productivity history or raw client Presence identity are shared; no cue grants send or CRM authority.

#### Scenario: AC26-D34-01-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D34-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Stop, inactivity, hidden/unqualified context and source loss end the cue under current bounds; work and real send-collision review continue independently.

Additional binding suite/requirement identifiers: REQ26-D34-R01, REQ26-D34-R02, REQ26-D34-R04, REQ26-D34-R05.

### Requirement: US26-D34-02 — Qualified US26-D34-02

The system SHALL provide the following observable outcome: As a Support worker, I want to receive responsive composing cues without stale certainty, so that the interface does not lag behind actual collaboration.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D34-02-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D34-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Leading start/stop are prompt; active/peer-cue refresh is 5 seconds and otherwise eligible reader refresh is 10 seconds, under the exact accepted liveness, lease, freshness and display-trust rules.

#### Scenario: AC26-D34-02-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D34-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Renewal without fresh qualifying input cannot extend the fresh-input frontier; background/ineligible readers do not fan out or keep cues alive.

#### Scenario: AC26-D34-02-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D34-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Old sequence/generation responses, delayed authorization and unknown controls cannot restore stale cues; clock uncertainty produces conservative unavailability.

Additional binding suite/requirement identifiers: REQ26-D34-R06, REQ26-D34-R09, REQ26-D34-R10, REQ26-D34-R13, REQ26-D34-R14.

### Requirement: US26-D34-03 — Qualified US26-D34-03

The system SHALL provide the following observable outcome: As a platform security owner, I want to authorize composing awareness through trusted source sessions, so that realtime transport cannot widen access.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D34-03-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D34-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Current tenant/profile/source/observer authority, server-issued bounded contexts and closed control/snapshot operations protect both database and private transport.

#### Scenario: AC26-D34-03-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D34-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** No caller-supplied author, tenant, topic membership or published Presence payload substitutes for current authorization; service role is not authority by itself.

#### Scenario: AC26-D34-03-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D34-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Revocation, merge/Undo, session change and expired leases fence current operations and display before delayed transport cleanup; no public cache or cross-tenant state leakage.

Additional binding suite/requirement identifiers: REQ26-D34-R03, REQ26-D34-R07, REQ26-D34-R08, REQ26-D34-R11, REQ26-D34-R12.

### Requirement: US26-D34-04 — Qualified US26-D34-04

The system SHALL provide the following observable outcome: As a platform engineer, I want to integrate awareness without remounting or slowing the editor, so that typing and navigation remain stable.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D34-04-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D34-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The shared qualified coordinator owns bounded refresh/cleanup and the actual React/Next client lifecycle; real input, hydration, restored content and ordinary editor updates retain distinct meanings.

#### Scenario: AC26-D34-04-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D34-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** No per-keystroke durable write, application-server WebSocket host, new paid collaboration service or full-surface client rendering is introduced.

#### Scenario: AC26-D34-04-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D34-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Current Supabase/Vercel/Next boundaries, bounded budgets, performance and page/session teardown are proved without claiming provider quotas establish application capacity.

Additional binding suite/requirement identifiers: REQ26-D34-R15, REQ26-D34-R16, REQ26-D34-R21.

### Requirement: US26-D34-05 — Qualified US26-D34-05

The system SHALL provide the following observable outcome: As a Support and CRM user, I want to keep awareness separate from my actual work and messages, so that coordination cues cannot accidentally cause an action.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D34-05-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D34-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The same currently authorized Support context works through CRM, while actual D4 send conflict protection and all existing work/attention owners remain authoritative.

#### Scenario: AC26-D34-05-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D34-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Cue events create no Email Studio preparation, P6 delivery, note, follow notification, CRM Activity or business completion.

#### Scenario: AC26-D34-05-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D34-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Transport outage is visible but does not disable safe work; exact operational thresholds, privacy cleanup, accessible presentation and real multi-client proof remain required.

Additional binding suite/requirement identifiers: REQ26-D34-R17, REQ26-D34-R18, REQ26-D34-R19, REQ26-D34-R20, REQ26-D34-R22, REQ26-D34-R23, REQ26-D34-R24, REQ26-D34-R25, REQ26-D34-R26, REQ26-D34-R27, REQ26-D34-R28.

### Requirement: US26-D35-01 — Qualified US26-D35-01

The system SHALL provide the following observable outcome: As an original note author, I want to edit my own eligible posted Internal note simply, so that I can correct a mistake without adding needless process.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D35-01-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D35-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Edit opens the note in place with Save changes/Cancel, preserves its source and authored chronology and shows Edited with accessible visible history after a real change.

#### Scenario: AC26-D35-01-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D35-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** No arbitrary grace period, other-author rewrite, incoming/outgoing email edit, CRM-note mutation or edit of a staff-recorded brief is allowed.

#### Scenario: AC26-D35-01-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D35-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Cancellation and navigation preserve or explicitly discard local working text; changed current source/authority produces clear read-only/conflict recovery instead of silent loss.

Additional binding suite/requirement identifiers: REQ26-D35-R01, REQ26-D35-R02, REQ26-D35-R05, REQ26-D35-R08, REQ26-D35-R20.

### Requirement: US26-D35-02 — Qualified US26-D35-02

The system SHALL provide the following observable outcome: As a Support reader, I want to inspect trustworthy note history, so that I can understand what was corrected.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D35-02-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D35-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Current text and immutable authorized revisions preserve original author/time and actual correction actor/time, with simple history navigation and source-specific unavailable states.

#### Scenario: AC26-D35-02-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D35-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** No ordinary edit erases history, changes authorship, restores restricted content or turns old content into a new note.

#### Scenario: AC26-D35-02-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D35-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Privacy/expiry applies to every version, derived search and external controlled copy; independently retained evidence stays truthful without an indefinite body archive.

Additional binding suite/requirement identifiers: REQ26-D35-R03, REQ26-D35-R12, REQ26-D35-R14, REQ26-D35-R15, REQ26-D35-R18.

### Requirement: US26-D35-03 — Qualified US26-D35-03

The system SHALL provide the following observable outcome: As a note author, I want to correct content without new file or mention side effects, so that minor editing remains predictable.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D35-03-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D35-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The accepted canonical correction profile retains qualified existing references/files/mention identity while allowing ordinary safe text correction through validation before normalization.

#### Scenario: AC26-D35-03-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D35-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** An edit cannot invent new recipients, reissue mentions, append new work, silently attach files, become externally deliverable or use metadata stripping to bypass source purpose.

#### Scenario: AC26-D35-03-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D35-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Invalid/unknown schema and stale original references fail visibly while retaining safe local work for review.

Additional binding suite/requirement identifiers: REQ26-D35-R04, REQ26-D35-R06, REQ26-D35-R07.

### Requirement: US26-D35-04 — Qualified US26-D35-04

The system SHALL provide the following observable outcome: As a note author, I want to recover Save without duplicate revisions or lost corrections, so that another tab or network failure cannot overwrite my intent.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D35-04-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D35-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Save conditionally compares the expected note revision and canonical content; no-op adds no revision; real change atomically admits new revision/head/history/receipt and exact secondary obligations.

#### Scenario: AC26-D35-04-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D35-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Changed payload under the same operation conflicts; an uncertain response is not permission to overwrite, rekey or create a new version blindly.

#### Scenario: AC26-D35-04-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D35-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The same operation reconciles its result under current rights; concurrent changes preserve local text and require deliberate review.

Additional binding suite/requirement identifiers: REQ26-D35-R09, REQ26-D35-R10, REQ26-D35-R11.

### Requirement: US26-D35-05 — Qualified US26-D35-05

The system SHALL provide the following observable outcome: As a platform owner, I want to keep note correction within Support's authority, so that editing cannot leak or distort other domains.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D35-05-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D35-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Current author/source permissions, immutable tenant-aware revision relationships, effective grants/RLS/storage and source-purpose custody protect all ordinary and privileged paths.

#### Scenario: AC26-D35-05-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D35-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Correction creates no new email, external reply, CRM Activity, last-contact update or automatic successful work/target event; D34 awareness is reused only when qualified.

#### Scenario: AC26-D35-05-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D35-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Legacy migration needs trusted author/source evidence; bounded history/search, visual accessibility, finite logs and actual concurrency/privacy proof govern activation.

Additional binding suite/requirement identifiers: REQ26-D35-R13, REQ26-D35-R16, REQ26-D35-R17, REQ26-D35-R19, REQ26-D35-R21, REQ26-D35-R22, REQ26-D35-R23, REQ26-D35-R24, REQ26-D35-R25.

### Requirement: US26-D36-01 — Qualified US26-D36-01

The system SHALL provide the following observable outcome: As a Support worker, I want to write a new reply without automatic old-history bulk, so that my answer stays readable.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D36-01-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D36-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** New replies start with my authored answer plus governed signature/footer; Add quote and source Quote message let me deliberately add permitted earlier message text.

#### Scenario: AC26-D36-01-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D36-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** No automatic transcript, forwarding product, AI extractor or history-inclusion preference is added; earlier saved material is not silently stripped.

#### Scenario: AC26-D36-01-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D36-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Unloaded or ineligible source shows a clear recovery state without blocking unrelated safe authored text.

Additional binding suite/requirement identifiers: REQ26-D36-R01.

### Requirement: US26-D36-02 — Qualified US26-D36-02

The system SHALL provide the following observable outcome: As a Support worker, I want to add and edit a useful source quotation in place, so that adding context feels like ordinary writing.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D36-02-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D36-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Message or eligible selected excerpt inserts once at the current editor position with visible attribution and natural trim/format/remove/Undo; meaningful changes are labelled edited excerpt.

#### Scenario: AC26-D36-02-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D36-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Opening a picker does not insert; text selection is an accelerator rather than the only path; attachments/remote images are not silently included.

#### Scenario: AC26-D36-02-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D36-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Stale selection, long/unsupported representations and unavailable content preserve safe local work and disclose actual inclusion rather than promising hidden extraction.

Additional binding suite/requirement identifiers: REQ26-D36-R02, REQ26-D36-R03, REQ26-D36-R04, REQ26-D36-R05, REQ26-D36-R06, REQ26-D36-R07, REQ26-D36-R08, REQ26-D36-R12, REQ26-D36-R21.

### Requirement: US26-D36-03 — Qualified US26-D36-03

The system SHALL provide the following observable outcome: As a Support worker, I want to review quote disclosure when source or recipients change, so that I do not send context to an unintended audience.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D36-03-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D36-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Exact source/representation/provenance and reviewed recipient dependencies are qualified through draft changes, topology, preparation and local admission.

#### Scenario: AC26-D36-03-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D36-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Quoting does not change reply target, subject, recipients or ancestry; CRM/email matching and client provenance cannot certify private material shareable.

#### Scenario: AC26-D36-03-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D36-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Current restriction/expiry fences affected known material even in Undo, copied blocks or saved drafts; changed recipients receive proportionate exact disclosure review.

Additional binding suite/requirement identifiers: REQ26-D36-R09, REQ26-D36-R10, REQ26-D36-R11, REQ26-D36-R13, REQ26-D36-R15, REQ26-D36-R17.

### Requirement: US26-D36-04 — Qualified US26-D36-04

The system SHALL provide the following observable outcome: As a platform content and messaging owner, I want to compile the complete reviewed quote once, so that the sent message has the intended content and durable identity.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D36-04-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D36-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Shared canonical purpose/version validation precedes generic normalization; P17 prepares exact safe HTML/plain text and source dependencies, Support admits and P6 dispatches/reconciles the immutable effect.

#### Scenario: AC26-D36-04-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D36-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Untrusted source text is inert, never variables/instructions; no dispatch fetch/rerender, new email studio, body-copy CRM or source-authority bypass is permitted.

#### Scenario: AC26-D36-04-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D36-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Compatible versions preserve unknown/unsupported content read-only; source-first rollout, finite custody and actual rich-text/browser/provider proof remain required.

Additional binding suite/requirement identifiers: REQ26-D36-R14, REQ26-D36-R16, REQ26-D36-R18, REQ26-D36-R19, REQ26-D36-R20, REQ26-D36-R22, REQ26-D36-R23, REQ26-D36-R24, REQ26-D36-R25, REQ26-D36-R26.

### Requirement: US26-D37-01 — Qualified US26-D37-01

The system SHALL provide the following observable outcome: As a Support worker, I want to find my private saved Reply drafts in one place, so that I can resume interrupted work without reconstructing old filters.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D37-01-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D37-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** My drafts shows the complete current-permitted personal population with source context, meaningful snippets, changed-source state and bounded ordering/search/inbox scope; direct restoration also works.

#### Scenario: AC26-D37-01-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D37-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Drafts are not work status, assignment, public messages, team-owned shared drafts or a product-wide My work queue.

#### Scenario: AC26-D37-01-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D37-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** No stale/forbidden entry leaks source metadata; empty, unavailable, partial and save failure states are distinguished.

Additional binding suite/requirement identifiers: REQ26-D37-R01, REQ26-D37-R02, REQ26-D37-R03, REQ26-D37-R04, REQ26-D37-R05.

### Requirement: US26-D37-02 — Qualified US26-D37-02

The system SHALL provide the following observable outcome: As a Support worker, I want to have meaningful Reply work saved quietly, so that I do not lose content or have to press Save repeatedly.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D37-02-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D37-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The accepted 750-ms quiet and 5-second eligible-attempt schedule saves the complete canonical bundle only after meaningful user work, with at most one in-flight write and honest exact-candidate Saving/Saved state.

#### Scenario: AC26-D37-02-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D37-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Focus, hydration, signature-only/default initialization and no-op must not create phantom drafts; Saved is not Send-ready and incomplete permitted audience/assets remain truthful.

#### Scenario: AC26-D37-02-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D37-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** IME, ongoing typing and delayed acknowledgment cannot lose the latest candidate or mislabel an older save current.

Additional binding suite/requirement identifiers: REQ26-D37-R06, REQ26-D37-R07, REQ26-D37-R08, REQ26-D37-R09, REQ26-D37-R10.

### Requirement: US26-D37-03 — Qualified US26-D37-03

The system SHALL provide the following observable outcome: As a Support worker, I want to resume the exact draft under current source authority, so that my text and audience are not silently retargeted.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D37-03-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D37-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Restoration resolves current owner/purpose/schema/source before editor initialization and preserves target, explicit audience, signature, attachments, quote dependencies and staged work intent.

#### Scenario: AC26-D37-03-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D37-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** New messages, changed defaults, CRM email edits or assignment cannot replace saved audience or rerun staged work; unknown nodes are not dropped and resaved.

#### Scenario: AC26-D37-03-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D37-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Conflicts retain safe working text and require review; a restricted source yields only permitted recovery, never reconstruction from old cache.

Additional binding suite/requirement identifiers: REQ26-D37-R14, REQ26-D37-R15.

### Requirement: US26-D37-04 — Qualified US26-D37-04

The system SHALL provide the following observable outcome: As a Support worker, I want to switch pages and recover uncertain saves safely, so that interruptions do not turn into duplicate or lost work.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D37-04-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D37-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Source-owned private identity and conditional generation/operation receipts govern same-person tabs, navigation flush and retry; only actually acknowledged work is called Saved.

#### Scenario: AC26-D37-04-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D37-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Browser unload/beacon/background success is not assumed, no durable browser-body cache is added, and independent Reply/Note state is never converted.

#### Scenario: AC26-D37-04-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D37-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Known source changes and unavailable reads give targeted review or leave guards only for work actually at risk; safe persisted work needs no needless confirmation.

Additional binding suite/requirement identifiers: REQ26-D37-R11, REQ26-D37-R12, REQ26-D37-R13, REQ26-D37-R25.

### Requirement: US26-D37-05 — Qualified US26-D37-05

The system SHALL provide the following observable outcome: As a Support worker, I want to discard or send only the exact intended draft, so that one action cannot remove another person's or purpose's work.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D37-05-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D37-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Discard is a conditional private-source operation; Send atomically consumes only the exact admitted draft generation through the existing prepared-message/work boundary.

#### Scenario: AC26-D37-05-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D37-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** No shared trash product, discard-after-unknown-send guess, duplicate effect, note conversion or automatic status/recipient action follows.

#### Scenario: AC26-D37-05-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D37-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Lost results reconcile permanent operation identity; accepted or possibly submitted communication uses its recovery owner rather than a recreated draft send.

Additional binding suite/requirement identifiers: REQ26-D37-R16, REQ26-D37-R17.

### Requirement: US26-D37-06 — Qualified US26-D37-06

The system SHALL provide the following observable outcome: As a platform owner, I want to protect and operate personal Reply persistence, so that private interrupted work stays safe across source and schema changes.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D37-06-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D37-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Tenant/profile/original/purpose cardinality, complete-bundle validation, effective grants/RLS/storage, exact indexes/pagination and finite source-derived custody govern all paths.

#### Scenario: AC26-D37-06-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D37-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Tiptap and Realtime are not persistence authorities; P17 supplies canonical authoring/preparation, not another draft store; CRM opens the same source without duplicate Activity/body.

#### Scenario: AC26-D37-06-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D37-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Trusted legacy provenance, incompatible-reader fences, current revocation, controlled cleanup and the accepted load/AT/browser proof are required before exposing My drafts.

Additional binding suite/requirement identifiers: REQ26-D37-R18, REQ26-D37-R19, REQ26-D37-R20, REQ26-D37-R21, REQ26-D37-R22, REQ26-D37-R23, REQ26-D37-R24, REQ26-D37-R26, REQ26-D37-R27, REQ26-D37-R28.

### Requirement: US26-D38-01 — Qualified US26-D38-01

The system SHALL provide the following observable outcome: As a Support worker, I want to find unfinished new Internal notes beside my Reply drafts, so that private work is easy to resume with a clear purpose.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D38-01-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D38-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The same My drafts owner/finder has distinct Reply and Internal note rows for independent immutable purposes on one original source; both can exist without conversion.

#### Scenario: AC26-D38-01-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D38-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A new note draft is not a posted note or D35 correction draft; no message, mention, work event or CRM Activity occurs on creation/save/resume.

#### Scenario: AC26-D38-01-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D38-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Current scope/read/save/post rights are separately rechecked; loss of Post alone can still allow qualified read-only inspection.

Additional binding suite/requirement identifiers: REQ26-D38-R01, REQ26-D38-R02, REQ26-D38-R03.

### Requirement: US26-D38-02 — Qualified US26-D38-02

The system SHALL provide the following observable outcome: As a Support worker, I want to save incomplete note content and files honestly, so that I can pause before everything is ready.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D38-02-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D38-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Meaningful canonical text, accepted reference changes and private selected files save as one versioned bundle using D37 timing/concurrency; pending files and inert mentions retain explicit state.

#### Scenario: AC26-D38-02-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D38-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** No Reply recipients, signature, D24 reply plan or email preparation enters the Note profile; zero meaningful work creates no phantom draft.

#### Scenario: AC26-D38-02-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D38-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Unknown schema, upload failure and current source change preserve only lawful working material and show a specific recovery path.

Additional binding suite/requirement identifiers: REQ26-D38-R04, REQ26-D38-R07, REQ26-D38-R08, REQ26-D38-R09.

### Requirement: US26-D38-03 — Qualified US26-D38-03

The system SHALL provide the following observable outcome: As a Support worker, I want to post a ready Internal note deliberately, so that my team sees only what I chose to publish.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D38-03-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D38-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Add note atomically admits the note, initial immutable history, ready authorized assets, command result, exact draft consumption and required source/mention obligations.

#### Scenario: AC26-D38-03-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D38-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Zero body and zero ready files cannot post; a ready authorized attachment-only note is valid; selected pending files block posting until ready or removed.

#### Scenario: AC26-D38-03-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D38-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Unknown Post reconciles that operation before retry or discard; downstream notification failure does not erase an admitted note or create duplicate publication.

Additional binding suite/requirement identifiers: REQ26-D38-R15, REQ26-D38-R16.

### Requirement: US26-D38-04 — Qualified US26-D38-04

The system SHALL provide the following observable outcome: As a Support worker, I want to switch purposes and leave without losing either draft, so that the interface does not fight normal interruptions.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D38-04-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D38-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Switching preserves independent controllers; leaving flushes or guards every dirty purpose that would actually be lost, and resume shows the exact note origin and current posting destination.

#### Scenario: AC26-D38-04-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D38-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Safely retained working state need not block mode switches; topology change cannot silently post into the wrong current source; private drafts do not inherit shared note visibility.

#### Scenario: AC26-D38-04-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D38-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Current-authorized destination review, same-person conflicts and purpose-specific Discard preserve the other draft and D35 local correction behavior.

Additional binding suite/requirement identifiers: REQ26-D38-R05, REQ26-D38-R06, REQ26-D38-R12, REQ26-D38-R13, REQ26-D38-R14, REQ26-D38-R17, REQ26-D38-R21.

### Requirement: US26-D38-05 — Qualified US26-D38-05

The system SHALL provide the following observable outcome: As a platform owner, I want to apply the existing private draft lifecycle to Notes safely, so that the extension does not create another store or communication authority.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D38-05-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D38-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Current trusted actor/source/purpose, same-tenant relational constraints, effective grants/RLS/storage, generation/idempotency fences and finite asset/content custody govern the complete Note path.

#### Scenario: AC26-D38-05-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D38-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Saving never triggers mentions; posting-derived direct mentions remain independent of D15 optional Following; neither Tiptap nor Realtime grants source or delivery authority.

#### Scenario: AC26-D38-05-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D38-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Source privacy/expiry, departed users, source-first migration, legacy ambiguity and accepted browser/database/load proof remain binding while CRM uses the same canonical source.

Additional binding suite/requirement identifiers: REQ26-D38-R10, REQ26-D38-R11, REQ26-D38-R18, REQ26-D38-R19, REQ26-D38-R20, REQ26-D38-R22, REQ26-D38-R23, REQ26-D38-R24, REQ26-D38-R25, REQ26-D38-R26.

### Requirement: US26-D39-01 — Qualified US26-D39-01

The system SHALL provide the following observable outcome: As a Support worker, I want to see which permitted conversation content is unread for me, so that I can orient myself without changing the team's work.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D39-01-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D39-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Personal state is self-only; absent state means unread for current eligible other-authored content, including old/newly accessible content, while self-only/empty content creates no automatic cue.

#### Scenario: AC26-D39-01-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D39-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Reading is not understanding, assignment, follow/review completion, successful work, provider receipt or a teammate-reading roster; excluded system/delivery/cleanup events do not manufacture human unread.

#### Scenario: AC26-D39-01-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D39-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Permission expansion exposes unfamiliar eligible material and contraction preserves still-qualified progress without granting old rights.

Additional binding suite/requirement identifiers: REQ26-D39-R01, REQ26-D39-R02, REQ26-D39-R03, REQ26-D39-R04.

### Requirement: US26-D39-02 — Qualified US26-D39-02

The system SHALL provide the following observable outcome: As a Support worker, I want to catch up through one deliberate successful conversation opening, so that I do not need to scroll every historical original.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D39-02-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D39-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A current focused/visible reader with successfully presented latest eligible combined content can acknowledge the exact complete authorized snapshot vector, including proved folded older coverage.

#### Scenario: AC26-D39-02-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D39-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Prefetch, background tabs, HTTP success, editor focus, blank/error/unsupported render and an older-history jump cannot acknowledge newer content; no dwell surveillance or per-original viewport chore.

#### Scenario: AC26-D39-02-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D39-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Missing or unproved source coverage remains unread; incoming content during active composition stays unread with a New activity action and no scroll jerk.

Additional binding suite/requirement identifiers: REQ26-D39-R07, REQ26-D39-R08, REQ26-D39-R09.

### Requirement: US26-D39-03 — Qualified US26-D39-03

The system SHALL provide the following observable outcome: As a Support worker, I want to mark a conversation read or unread deliberately, so that my own intent remains useful across tabs.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D39-03-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D39-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The existing menu offers contextual Mark read/Mark unread over the current qualified source snapshot and personal state; manual unread stays through the current viewing epoch.

#### Scenario: AC26-D39-03-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D39-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Old tabs, retries, refetch, focus or merely replacing tokens cannot immediately clear a newer manual unread or create another actor's state.

#### Scenario: AC26-D39-03-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D39-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Explicit re-open/valid activation or Mark read follows the accepted conditional rules; failed/unknown mutations show honest personal state and never block unrelated safe work.

Additional binding suite/requirement identifiers: REQ26-D39-R10, REQ26-D39-R11, REQ26-D39-R12, REQ26-D39-R17.

### Requirement: US26-D39-04 — Qualified US26-D39-04

The system SHALL provide the following observable outcome: As a platform owner, I want to derive personal orientation from committed source truth, so that concurrency and access changes cannot create false reads.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D39-04-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D39-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Commit-ordered original content frontiers, compact current visibility coverage and trusted bounded command/activation contexts govern sparse personal state and combined projections.

#### Scenario: AC26-D39-04-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D39-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** No wall-clock/max-message guess, client tenant/actor/source proof, global read fanout, unrestricted service-role path or permanent per-click history is accepted.

#### Scenario: AC26-D39-04-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D39-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Atomic conditional updates, cleanup anti-replay, original merge/Undo behavior and source-order initialization for existing history are proved with current grants/RLS and separate concurrent actors.

Additional binding suite/requirement identifiers: REQ26-D39-R05, REQ26-D39-R06, REQ26-D39-R13, REQ26-D39-R14, REQ26-D39-R18.

### Requirement: US26-D39-05 — Qualified US26-D39-05

The system SHALL provide the following observable outcome: As a Support and CRM user, I want to keep reading preferences and context separate from message authority, so that the same view is coherent across Asym.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D39-05-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D39-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** The same current-authorized Support reader/personal state works through CRM, retains Compact/Full semantics and derives content validity from the safe shared renderer.

#### Scenario: AC26-D39-05-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D39-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Reading sends/prepares no Email Studio/P6 communication, clears no P17 notification group and creates no Party, Activity or business completion.

#### Scenario: AC26-D39-05-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D39-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Source expiry/revocation, unavailable personal state, bounded refresh and safe compatible rollout preserve privacy and useful current work; actual user/AT/load proof remains required.

Additional binding suite/requirement identifiers: REQ26-D39-R15, REQ26-D39-R16, REQ26-D39-R19, REQ26-D39-R20, REQ26-D39-R21, REQ26-D39-R22, REQ26-D39-R23, REQ26-D39-R24, REQ26-D39-R26.

### Requirement: US26-D40-01 — Qualified US26-D40-01

The system SHALL provide the following observable outcome: As an authorized Support worker, I want to mark truly unwanted admitted email correspondence aside, so that ordinary work views stay useful without misrepresenting service.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D40-01-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D40-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** One current reviewed command applies an original-source Unwanted designation only to the exact eligible email-origin scope, admitting any exact justified No reply needed correction, history and result atomically.

#### Scenario: AC26-D40-01-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D40-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** It is not a fifth work status, deletion, successful resolution or a person judgment; legitimate mixed work, promises and actionable recovery cannot be hidden.

#### Scenario: AC26-D40-01-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D40-01 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Conflicts, source expiry and pending/unknown effects keep truthful recovery; no row disappears before durable acceptance.

Additional binding suite/requirement identifiers: REQ26-D40-R01, REQ26-D40-R02, REQ26-D40-R03, REQ26-D40-R04, REQ26-D40-R08.

### Requirement: US26-D40-02 — Qualified US26-D40-02

The system SHALL provide the following observable outcome: As a Support worker, I want to restore current work and find unwanted history, so that a mistake is recoverable without rolling back reality.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D40-02-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D40-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Persistent Restore opens the valid current source for review under current coverage; the built-in Unwanted view contains only all-Unwanted components, while mixed ordinary work stays ordinary and search labels exact original matches.

#### Scenario: AC26-D40-02-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D40-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Restore cannot revive stale assignment/reminders, disposed content, prior sends or another original's classification; no duplicate mixed whole-component row or invented trash grace period.

#### Scenario: AC26-D40-02-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D40-02 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Relevant later input or newly actionable owner/delivery recovery resurfaces only its actual current work home; duplicates/already-reviewed evidence do not repeatedly reopen.

Additional binding suite/requirement identifiers: REQ26-D40-R05, REQ26-D40-R06, REQ26-D40-R25.

### Requirement: US26-D40-03 — Qualified US26-D40-03

The system SHALL provide the following observable outcome: As a Support worker, I want to keep lawful drafts and explanatory notes useful after marking, so that cleanup does not destroy private work or prevent explanation.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D40-03-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D40-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Private Reply/Note drafts can save/discard when lawful and authorized Internal notes/own-note corrections can explain without Restore; actual external Reply or new owner work requires Restore/current review.

#### Scenario: AC26-D40-03-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D40-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Mark does not cancel admitted or possibly submitted mail, prepare an explanation, create a new content event, change Following or mark notifications read.

#### Scenario: AC26-D40-03-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D40-03 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Existing uncertain communication retains actual owner recovery and cannot become an eternal blocker once independently reviewed non-actionable.

Additional binding suite/requirement identifiers: REQ26-D40-R07.

### Requirement: US26-D40-04 — Qualified US26-D40-04

The system SHALL provide the following observable outcome: As an authorized receiving-inbox manager, I want to hold future email from one exact observed mailbox, so that repeated unwanted intake can receive accountable review without a person ban.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D40-04-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D40-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** A separate deliberate action starts from actual admitted inbound mail or an authorized qualified held input and reviews one actual receiving inbox plus single owner-qualified observed From mailbox.

#### Scenario: AC26-D40-04-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D40-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Mark never implicitly enables a hold; Release is not required merely to create it; current handling inbox, CRM email, Reply-To, quoted text and display name cannot select the pair.

#### Scenario: AC26-D40-04-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D40-04 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Ambiguous/multiple/unsupported addresses and source/authority changes require explicit current correction; no broad domain, plus/dot collapse, all-inbox or freeform rules expansion.

Additional binding suite/requirement identifiers: REQ26-D40-R09, REQ26-D40-R13.

### Requirement: US26-D40-05 — Qualified US26-D40-05

The system SHALL provide the following observable outcome: As an authorized receiving-inbox manager, I want to inspect and stop sender holds simply, so that policy remains understandable after the original message is gone.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D40-05-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D40-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Receiving Inbox settings → Sender holds offers Active/Stopped records, exact readonly pair, current authorized history and independent Stop holding; Hold again requalifies the same pair and coverage.

#### Scenario: AC26-D40-05-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D40-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Stop does not restore a conversation or release existing held input; Restore does not stop a rule; a body-expired original does not require retaining its body forever to manage lawful policy.

#### Scenario: AC26-D40-05-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D40-05 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Lost results reconcile each distinct operation; current receiving changes, coverage/offboarding, finite policy custody and scoped repair remain explicit.

Additional binding suite/requirement identifiers: REQ26-D40-R10, REQ26-D40-R15, REQ26-D40-R20.

### Requirement: US26-D40-06 — Qualified US26-D40-06

The system SHALL provide the following observable outcome: As an intake owner, I want to apply future-mail policy at first durable acceptance, so that retries and worker delays cannot change what future means.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D40-06-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D40-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Enable/Stop serializes with the first canonical accepted input/receiving occurrence, including absent-rule creation; retained policy evidence drives deferred routing and qualified exact matched-gate Release.

#### Scenario: AC26-D40-06-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D40-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Sender Date, provider receipt or later worker time cannot rewrite the decision; later rule state cannot attach an old gate, undo a Release or bypass other current safety gates.

#### Scenario: AC26-D40-06-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D40-06 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** D19 retains one-input Release/Dismiss and viable recovery coverage; Stop leaves backlog intact and duplicate callbacks cannot duplicate ordinary admission.

Additional binding suite/requirement identifiers: REQ26-D40-R11, REQ26-D40-R12, REQ26-D40-R14.

### Requirement: US26-D40-07 — Qualified US26-D40-07

The system SHALL provide the following observable outcome: As a platform owner, I want to keep unwanted handling separate from CRM and communications, so that cleanup cannot become a hidden consent or message action.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D40-07-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D40-07 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Support owns designation/work projection, canonical intake owns the hold, P17 owns governed authoring/preparation and engagement, P6 owns actual local/provider effects, and CRM/business domains retain their facts/actions.

#### Scenario: AC26-D40-07-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D40-07 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** An active inbound hold is not outgoing suppression, unsubscribe, portal suspension, provider spam training or CRM-person deletion; only a current ineligible Unwanted source fences its own exact definitely-unsubmitted optional mail.

#### Scenario: AC26-D40-07-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D40-07 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Qualified Release keeps original D13 utility/courtesy/human precedence, never a fresh window or D28 completion; actual/possibly submitted evidence and new actionable recovery remain truthful.

Additional binding suite/requirement identifiers: REQ26-D40-R21, REQ26-D40-R22, REQ26-D40-R24.

### Requirement: US26-D40-08 — Qualified US26-D40-08

The system SHALL provide the following observable outcome: As a platform security and operations owner, I want to enforce and operate the two independent effects safely, so that mistakes remain bounded and diagnosable.
The complete related normative clauses, exact acceptance suite and global source/authority invariants MUST remain satisfied. This requirement does not introduce new rights or replace an owning-domain action.

#### Scenario: AC26-D40-08-01

- **GIVEN** the actor, source, state and permission conditions specified by US26-D40-08 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Trusted tenant/actor/receiving/source keys, valid original topology, current operation-specific access, effective grants/RLS, finite custody, stable indexed pages and atomic result/history/continuation protect every path.

#### Scenario: AC26-D40-08-02

- **GIVEN** the actor, source, state and permission conditions specified by US26-D40-08 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** No broad CRUD, new general engine, synthetic sender identity, raw-address diagnostics, history laundering, hidden legitimate work or unsupported rollback is permitted.

#### Scenario: AC26-D40-08-03

- **GIVEN** the actor, source, state and permission conditions specified by US26-D40-08 and its exact normative clauses
- **WHEN** the specified operation or event occurs
- **THEN** Source-first migration, qualified parser/owner interfaces, accepted 25-initial/50-maximum pages and all exact release/operating controls precede activation; current code and helper probes are not runtime proof.

Additional binding suite/requirement identifiers: REQ26-D40-R16, REQ26-D40-R17, REQ26-D40-R18, REQ26-D40-R19, REQ26-D40-R23, REQ26-D40-R26, REQ26-D40-R27, REQ26-D40-R28, REQ26-D40-R29, REQ26-D40-R30.
