# Phase26 — Support Hub & Conversation Management

**Specification status: fully ratified intended behavior; testing approach confirmed 15 September 2026. Implementation and runtime release proof remain outstanding.**

This complete specification comprises this user-story/implementation book, the three detailed normative requirement volumes, the Support glossary, the OpenSpec behavior/design/tasks package and the traceability register. Every detailed requirement and acceptance case is binding; none requires reconstructing the original conversation. Source research/history is evidence, not an additional feature or proof of implementation.

## Problem Statement

People contacting a ministry need to ask for help, receive an ordinary answer and continue the conversation without unnecessary accounts, repeated information or unclear next steps. Staff need to know who is responsible, what work remains, which information they may use and whether an action actually succeeded. Separate inboxes, disconnected CRM context, fragile drafts, ambiguous send results and cleanup that hides genuine obligations undermine that work.

The existing Support implementation supplies parts of the shell, data model, adapters and tests, but its current broad permissions, legacy parallel module, demonstration paths and incomplete intake/delivery boundaries do not establish the ratified behavior. Completion requires the coherent source, authorization, lifecycle, UX and evidence contracts below—not just a polished screen or a passing smoke test.

## Solution

Provide Support Hub as one staff surface within Asym, with ordinary email continuation and qualified contextual Help entry for requesters. Maintain one canonical Support source and work model; use the native shared CRM and the owning domain's authorized commands for protected actions. Reuse the established shared UI, authoring, publication, messaging, data and durable-execution capabilities with their existing authority.

The complete product includes clear current work and assignment, viable coverage, deliberate replies, private notes/drafts, useful guides and saved wording, readable conversations and source-safe documents, recoverable mistakes, accountable held intake, optional narrowly scoped future-mail holding, and honest attention/reporting. Keep common actions short, exceptions understandable and recovery in context. Do not make every ministry workflow a ticket, create a second CRM or introduce a second configurable automation platform.

The formal requirement registry and independently verifiable stories form one contract. Detailed requirements are normative; source research and historical alternatives are evidence rather than extra product features. Later amendments override only their stated earlier scope. No accepted constraint is weakened by grouping stories, sharing test infrastructure or moving detailed clauses to a named normative volume.

## User Stories

Global G01–G15 and the detailed registry apply to each relevant story. The numbered entries below identify independently verifiable goals and outcomes. Full acceptance suites named by a story remain required, not optional examples.

### 1. US26-D01-01 — Continue an ordinary help request by email

As a requester, I want to continue an ordinary help request by email, so that I can obtain help without registration, duplicate entry or lost messages.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D01-01-AC01:** A legitimate requester can ask for ordinary help and read and reply to the tenant's ordinary answer using email, without creating an Asym account, signing in, completing a CRM link, entering a ticket number, or passing through mandatory self-service. Required qualified Help entry points retain permitted context. **Full contract: REQ26-D01-R01.**

- **US26-D01-01-AC02:** An ordinary reply clearly identifies the tenant and carries a verified, activated, monitored return route prepared under the Phase 17/6 sender contract. The answer is readable in the email. **Full contract: REQ26-D01-R02.**

- **US26-D01-01-AC03:** Every accepted input has a durable source identity and exactly one recoverable disposition. An acknowledgment means the accepting owner can recover the promised work, not that downstream work is complete. **Full contract: REQ26-D01-R03.**

- **US26-D01-01-AC04:** Thread references and opaque route tokens correlate mail within trusted tenant scope; they never authenticate a person, grant CRM/financial authority, add external recipients, or authorize prior-history disclosure. Conflicting references or destinations do not select an arbitrary first match. **Full contract: REQ26-D01-R04.**

The D1 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 2. US26-D01-02 — Compose a correctly attributed reply using only permitted context

As a support worker, I want to compose a correctly attributed reply using only permitted context, so that I can answer safely while protected business actions keep their own authority.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D01-02-AC01:** The server derives tenant and acting active staff identity from authenticated context and records it immutably. Caller input cannot select author or audit identity; an unresolved actor does not become System. **Full contract: REQ26-D01-R05.**

- **US26-D01-02-AC02:** Internal notes and system-only events cannot enter the public-reply pipeline or appear in requester-visible email, history or exports, including through direct data access, workers or macros. Authorized internal display/export remains subject to note-access and audit policy. **Full contract: REQ26-D01-R06.**

- **US26-D01-02-AC03:** Creating a send intent is atomic with current authorization, exact content/recipient approval, a reviewed conversation version, permanent semantic deduplication, and required local history/dispatch evidence. Relevant unseen updates block stale sending and preserve the draft for explicit review. **Full contract: REQ26-D01-R07.**

- **US26-D01-02-AC04:** Support retains observed sender endpoints and explicit authorized links to Core Parties/records, including an unlinked or ambiguous state. No automatic Party creation, preferred-email overwrite, duplicate CRM store, or Support↔CRM sync is permitted. **Full contract: REQ26-D01-R08.**

The D1 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 3. US26-D01-03 — See truthful work, file availability and CRM context in one conversation

As a support worker, I want to see truthful work, file availability and CRM context in one conversation, so that I can act without confusing delivery, ownership or business completion.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D01-03-AC01:** Conversation lifecycle, assignment, read state, timers, drafts, send intent, provider acceptance, delivery evidence, and domain-action completion are separate facts. Pending is not Sent; provider acceptance is not Read. **Full contract: REQ26-D01-R09.**

- **US26-D01-03-AC02:** Use owner-governed content rendering, context-aware variable escaping, permitted link schemes, safe message display and bounded untrusted MIME/file processing. Attachments have independent truthful readiness/failure states. **Full contract: REQ26-D01-R10.**

- **US26-D01-03-AC03:** Support Hub and authorized CRM surfaces use the same owner-filtered facts and history. Staff can inspect permitted context, initiate an owner action, and return to their conversation, draft and queue position without unnecessary re-entry. **Full contract: REQ26-D01-R11.**

The D1 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 4. US26-D01-04 — Qualify and recover the canonical Support service

As a platform operator, I want to qualify and recover the canonical Support service, so that accepted work remains attributable, durable and safe through migration and outages.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D01-04-AC01:** Authoritative support state, required audit and related local effects commit atomically or leave durable repair evidence for every missing effect. Single/bulk/retry entry points enforce the same invariants. **Full contract: REQ26-D01-R12.**

- **US26-D01-04-AC02:** Support owns support work only. Use Phase 23 form occurrences, Phase 17 preparation, Phase 6 dispatch/history, Core identity/CRM/authorization, and qualified document/records boundaries. **Full contract: REQ26-D01-R13.**

- **US26-D01-04-AC03:** Inventory actual legacy records and preserve their identities/history with verified mappings or explicit read-only provenance. Backfill never sends old messages or repeats business effects. **Full contract: REQ26-D01-R14.**

- **US26-D01-04-AC04:** Before activation, prove ordinary account-free email contact/reply, scoped CRM continuity, authorization negatives, notes and recipient safety, concurrent/replayed commands, body/attachment recovery, provider ambiguity, migration and accessible mobile/keyboard journeys against actual owner seams. Record supported workload and provider/client capability limits from measurements. **Full contract: REQ26-D01-R15.**

The D1 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 5. US26-D02-01 — Save my tenant-specific initial reply preference

As a support worker, I want to save my tenant-specific initial reply preference, so that new drafts begin predictably without changing drafts I already reviewed.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D02-01-AC01:** The product default is Reply all. A signed-in staff member may persist Reply all or Reply to sender for their own work within one tenant, across devices. **Full contract: REQ26-D02-R01.**

- **US26-D02-01-AC02:** For an existing draft, restore its saved target and audience. For a new draft, an explicit Reply/Reply-all action takes precedence over the resolved personal preference; a confirmed absent preference uses Reply all. **Full contract: REQ26-D02-R02.**

- **US26-D02-01-AC03:** Support owns one narrowly typed personal reply preference keyed by validated tenant and authenticated user. The canonical self-preference command derives both from trusted server context, checks current Support access, and cannot select another agent, assignee, user or tenant from caller input. **Full contract: REQ26-D02-R06.**

The D2 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 6. US26-D02-02 — Review and deliberately change an exact reply audience

As a support worker, I want to review and deliberately change an exact reply audience, so that the visible addresses and disclosure match the reply I intend.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D02-02-AC01:** Each reply identifies the specific admitted external message being answered. Ordinary entry selects the latest eligible external message at draft initialization; an explicit per-message reply selects that message. **Full contract: REQ26-D02-R03.**

- **US26-D02-02-AC02:** Retain the draft's target, current explicit recipients, reply action/provenance, content, attachment selections, owner and revision across supported save/restore, navigation and temporary failures. A new incoming message, reassignment, Party merge, changed email or preference update cannot silently retarget or readdress it. **Full contract: REQ26-D02-R04.**

- **US26-D02-02-AC03:** Use Core's existing shared components and semantic tokens. Keep one text-labelled audience control near the From/To/Cc fields: Reply all, Reply to sender, or Custom recipients. **Full contract: REQ26-D02-R05.**

- **US26-D02-02-AC04:** An email participant, actual sender, authenticated user, linked CRM Party, represented organization, assigned support worker and CRM owner remain distinct. Support reads only authorized CRM context and initiates changes through the owning domain's authorized command. **Full contract: REQ26-D02-R07.**

The D2 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 7. US26-D02-03 — Send one native group reply with truthful member outcomes

As a support worker, I want to send one native group reply with truthful member outcomes, so that a shared thread does not duplicate mail or hide uncertain delivery.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D02-03-AC01:** One canonical admission command binds the trusted actor, current conversation/inbox/tenant rights, selected target, reviewed conversation revision, exact audience with To/Cc roles, body/attachment revision and recipient/content authority to a durable reply approval. Required send intents and audit/history references are captured atomically with authoritative state under D1. **Full contract: REQ26-D02-R08.**

- **US26-D02-03-AC02:** Before group-email activation, Phase 6/17 must admit an explicit grouped provider-submission/member relationship. One reviewed visible To/Cc group may have one native provider submission, while each admitted recipient copy retains its own authority, semantic identity, immutable preparation membership and communication history. **Full contract: REQ26-D02-R09.**

- **US26-D02-03-AC03:** Validate recipient count, header size, syntax, attachment limits and transport capabilities before approval against the qualified owner/provider contract. Reject excess with an actionable error and preserved draft; never truncate, silently split a group into a campaign or claim success before acceptance. **Full contract: REQ26-D02-R10.**

The D2 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 8. US26-D02-04 — Activate explicit audiences without rewriting old sends

As a delivery operator, I want to activate explicit audiences without rewriting old sends, so that legacy clients, migrations and failures cannot weaken the recipient contract.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D02-04-AC01:** Introduce preference and explicit-draft contracts compatibly before enabling the new default. Existing drafts keep their known audiences; insufficient historical target/audience evidence requires visible selection before sending, never a backfill from today's preference or CRM data. **Full contract: REQ26-D02-R11.**

- **US26-D02-04-AC02:** Trace D2 and D2-R01–R12 from the grill record and resolved glossary into the relevant owner ADR/OpenSpec reconciliation, design/tasks/tickets, implementation, outcome tests and release evidence through the authorized delivery stages. Do not treat a mocked UI test, model experiment, helper suite, vendor article or green unrelated CI as proof of runtime delivery, authorization or usability. **Full contract: REQ26-D02-R12.**

The D2 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 9. US26-D03-01 — Record exactly what Support currently owes

As a support worker, I want to record exactly what Support currently owes, so that Open, the two waits and Resolved remain understandable and honest.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D03-01-AC01:** A conversation has exactly one authoritative current work meaning. Open means Support currently owes a substantive next step or a due review/follow-up, including reviewing new input. **Full contract: REQ26-D03-R01.**

- **US26-D03-01-AC02:** A staff progress update, note, read action, assignment, CRM link or queued email does not itself choose Waiting or Resolved. Work changes follow explicit authorized staff intent or a qualified causal event under this contract. **Full contract: REQ26-D03-R02.**

- **US26-D03-01-AC03:** Maintain a current work snapshot plus append-only authoritative transition evidence. Each actual change records prior/new meaning, cause, trusted human/system actor, server admission/order, command/event identity and permitted causal reference in the same transaction. **Full contract: REQ26-D03-R05.**

- **US26-D03-01-AC04:** A first-time admitted relevant human reply returns the conversation to Open for review and invalidates its obsolete deferral, even if the sender's timestamp predates a prior resolution. Durable intake/effect identity prevents duplicate delivery from reopening work again. **Full contract: REQ26-D03-R08.**

The D3 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 10. US26-D03-02 — Set and manage one dependable shared follow-up

As a support worker, I want to set and manage one dependable shared follow-up, so that due review returns at the right instant without changing the meaning of a wait.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D03-02-AC01:** One current shared follow-up reminder may defer attention for a conversation without changing its work meaning. It has a durable identity, generation, finite due instant, purpose and originating actor/cause. **Full contract: REQ26-D03-R06.**

- **US26-D03-02-AC02:** Display the actual follow-up date, time and relevant time zone before committing. Resolve calendar expressions such as Tomorrow morning using the displayed shared time-zone context and an explicit visible wall-clock time; a duration must be named as a duration. **Full contract: REQ26-D03-R07.**

The D3 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 11. US26-D03-03 — Change work through the same guarded command from every entry point

As an authorized staff member, I want to change work through the same guarded command from every entry point, so that concurrent, repeated and bulk actions preserve authority and history.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D03-03-AC01:** All menu, keyboard, board, bulk, macro, system-event and reminder transitions use the same canonical Support command in the governed data layer. The server derives tenant, authenticated user and actual actor profile from trusted context, validates the current conversation/resource policy and reviewed work/conversation revisions, and admits only a typed allowed cause. **Full contract: REQ26-D03-R03.**

- **US26-D03-03-AC02:** Preserve tenant-aware keys and relationships for conversation, inbox, assignment, transition and reminder facts. Enforce a non-null canonical work value. **Full contract: REQ26-D03-R04.**

- **US26-D03-03-AC03:** Menu, keyboard, nondrag board actions, bulk and macros apply the same authorization, semantics, versions and evidence. Freeze the exact selected conversation IDs and reviewed scope for a bulk request; do not silently include newly matching rows. **Full contract: REQ26-D03-R11.**

The D3 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 12. US26-D03-04 — Retain my place while using complete work and CRM views

As a support worker, I want to retain my place while using complete work and CRM views, so that I can recover a conflict or follow an owner action without losing my draft.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D03-04-AC01:** Present one primary text-labelled work-status picker in the conversation header, near assignment and separate from reply audience. Its four items use stable sentence-case labels, a programmatically selected current value, a restrained icon and short descriptions within the menu. **Full contract: REQ26-D03-R09.**

- **US26-D03-04-AC02:** An ordinary status edit keeps the selected conversation, draft, scroll context and focus. Update queue membership and counts truthfully from confirmed state; a filtered-out conversation can remain open in the detail pane with a quiet moved-view indication. **Full contract: REQ26-D03-R10.**

- **US26-D03-04-AC03:** Support work status owns only Support's obligation. Requester, actual message participant, authenticated user, CRM Party, represented organization, assigned support worker and CRM record owner remain distinct. **Full contract: REQ26-D03-R12.**

- **US26-D03-04-AC04:** Apply the full authorized status/wait-side/assignment/due/recovery/search predicate before pagination, and compute counts from that same predicate. All unfinished conversations remain discoverable—including old, snoozed, unassigned or moved work and items beyond one page. **Full contract: REQ26-D03-R13.**

The D3 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 13. US26-D03-05 — Migrate and qualify work and reminder behavior

As a support operator, I want to migrate and qualify work and reminder behavior, so that old states and workers cannot hide due work or invent historical episodes.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D03-05-AC01:** Introduce compatible work/history/reminder contracts before enabling the four new labels. Inventory and fence legacy status writers, including the parallel support module, old clients, macros and direct DML. **Full contract: REQ26-D03-R14.**

- **US26-D03-05-AC02:** Trace D3 and D3-R01–R15 consistently through the glossary, feature ADR, governing OpenSpec/owner reconciliation, design/tasks/tickets, implementation, outcome tests and release evidence. The completed review is not runtime readiness. **Full contract: REQ26-D03-R15.**

The D3 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 14. US26-D04-01 — Send a reply with an explicitly chosen work effect

As a support worker, I want to send a reply with an explicitly chosen work effect, so that ordinary Send preserves work while combined actions are atomic and clear.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D04-01-AC01:** Plain Send reply carries explicit keep-work intent. Successful local admission creates no work transition or resolution episode and preserves the existing valid reminder identity, due instant and generation. **Full contract: REQ26-D04-R01.**

- **US26-D04-01-AC02:** Show Send reply as the default primary action and a separate adjacent control named After sending. Its single-select choices are Keep current status; Open; Waiting for requester; Waiting on our side; Resolved, each with a brief meaning and the current choice exposed. **Full contract: REQ26-D04-R02.**

- **US26-D04-01-AC03:** Use one server-authorized Support admission boundary for the reviewed reply and optional work action. It derives scope and actor from authenticated context, verifies exact target/audience/content and relevant revisions, validates the selected D3 transition, and commits the immutable command identity/hash, Support message intent, work/history/reminder effects and durable dispatch/recovery intent atomically. **Full contract: REQ26-D04-R03.**

- **US26-D04-01-AC04:** Support offers a compact Use template entry into the authorized Email Studio content library, filtered to content qualified for a human Support reply. The staff-facing insertion result is editable reply text/structure. **Full contract: REQ26-D04-R04.**

The D4 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 15. US26-D04-02 — Use governed reusable wording and authorized facts

As a support worker, I want to use governed reusable wording and authorized facts, so that my editable human reply matches its preview and prepared content.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D04-02-AC01:** Human Support replies, whether typed or based on reusable wording, remain outside the finite system-message catalog. Phase 26 owns human reply content and send intent. **Full contract: REQ26-D04-R05.**

- **US26-D04-02-AC02:** The server resolves only allow-listed typed values from the exact authorized tenant, conversation, admitted audience and permitted owner records. Rendering helpers receive already authorized values; caller-provided tenant, sender, actor, CRM association, sample merge values or unrestricted property maps are not authority. **Full contract: REQ26-D04-R06.**

- **US26-D04-02-AC03:** The ordinary composer previews the actual bounded reply with the shared presentation. A full-email preview remains available without making a modal preview a mandatory step for every reply. **Full contract: REQ26-D04-R07.**

The D4 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 16. US26-D04-03 — Deliver the exact approved native email envelope

As a delivery operator, I want to deliver the exact approved native email envelope, so that group members, provider evidence and bounded recovery remain truthful.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D04-03-AC01:** D2's exact To/Cc review and native visible-group requirement remain in force. A visible group receives one common approved body. **Full contract: REQ26-D04-R08.**

- **US26-D04-03-AC02:** Reuse ADR-0032's permanent occurrence slot and complete semantic/command hash checks. Same identity and same immutable input reconcile the existing effect; changed input conflicts; a genuinely new deliberate reply has a new authorized identity even when its text is identical. **Full contract: REQ26-D04-R09.**

- **US26-D04-03-AC03:** Use the tenant's proved, revisioned Resend sending connection and purpose-resolved Sender/Reply Identity under ADR-0029. No shared Asym sender fallback, caller-controlled From/Reply-To/headers or Support-only credential store is allowed. **Full contract: REQ26-D04-R10.**

- **US26-D04-03-AC04:** Preserve ADR-0032's three recovery conditions: unprepared, prepared definitely unsubmitted and may have submitted. An accepted response requires a valid provider message identity and an exact envelope/member match. **Full contract: REQ26-D04-R11.**

- **US26-D04-03-AC05:** Verify raw-body webhook signatures against the exact registered connection secret and bind event scope through the durable provider/envelope relationship, not caller tags, an email domain guess or a claimed tenant ID. Use the qualified provider event identity for dedupe and retain immutable evidence. **Full contract: REQ26-D04-R12.**

The D4 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 17. US26-D04-04 — Enforce prepared-content custody and current capacity

As a security and delivery operator, I want to enforce prepared-content custody and current capacity, so that expired, unsafe or oversized material cannot gain sending authority.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D04-04-AC01:** All command, message, template/presentation reference, preparation, envelope/member, attachment, transition and communication relationships preserve their true tenant/platform owner and environment. Use tenant-aware keys and foreign keys, non-null required identities/revisions, permanent semantic uniqueness, immutable admitted content and lawful state checks. **Full contract: REQ26-D04-R13.**

- **US26-D04-04-AC02:** Prepared execution material is encrypted and separately governed from Support conversation bodies, message history, Recent sent copy and generic logs. Phase 17's existing required/source-required receipt/financial-email class has a 30-day ceiling; its optional staff-email sibling of required in-product attention has a 7-day ceiling. **Full contract: REQ26-D04-R14.**

- **US26-D04-04-AC03:** Use current qualified provider capability/connection limits and response headers, counting API requests separately from recipient quota. Coordinate the shared tenant Resend team budget through Phase 6, including other Asym sends; external applications may also consume that team budget, so 429/Retry-After feedback remains necessary. **Full contract: REQ26-D04-R15.**

The D4 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 18. US26-D04-05 — Qualify the one canonical human-reply path

As a release owner, I want to qualify the one canonical human-reply path, so that no old sender or false proof can bypass the approved behavior.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D04-05-AC01:** Reconcile the qualified Phase 17/6 human-reply/group contract first, then compatible schema/grants/readers, then fenced writers and provider qualification, then limited activation. Inventory actual use of both support modules and queued legacy rows. **Full contract: REQ26-D04-R16.**

- **US26-D04-05-AC02:** Trace D4 and its clauses through the glossary/ADR and, the formal owner changes, design, tasks/tickets, tests and release evidence. Every production route must identify the same command, Support message, preparation, provider envelope/member and owner communication effect without logging bodies, protected URLs or raw secrets. **Full contract: REQ26-D04-R17.**

The D4 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 19. US26-D05-01 — End further follow-up for an honestly unanswered remaining need

As a support worker, I want to end further follow-up for an honestly unanswered remaining need, so that I can finish my responsibility without claiming the problem was solved.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D05-01-AC01:** No response is the reason staff deliberately ended further Support follow-up because clearly requested needed input remains absent. It is not a count of human messages or proof of refusal, neglect, delivery, satisfaction or an achieved business outcome. **Full contract: REQ26-D05-R01.**

- **US26-D05-01-AC02:** The review refers to the actual requested information and relevant admitted participants, not the original CRM contact alone or the last email's direction. Exact email matching, To/Cc participation, assignment or a tracking event does not establish verified identity, representation, authority or human understanding. **Full contract: REQ26-D05-R02.**

- **US26-D05-01-AC03:** An ending cannot waive a known required Support action, promise, currently relevant owner obligation that Support must follow through on, or required unreviewed recovery. Use the existing owner-authorized status/action/reference contracts for known guards. **Full contract: REQ26-D05-R03.**

- **US26-D05-01-AC04:** No response belongs to the applicable resolution episode with its actual server admission time, actor, reason and relevant review/source references. It is not a permanent label saying this person never responds. **Full contract: REQ26-D05-R08.**

- **US26-D05-01-AC05:** A due reminder returns work to Open for staff review; it never chooses No response. Eligibility remains available after that wake without an Open→Waiting→Resolved detour. **Full contract: REQ26-D05-R09.**

The D5 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 20. US26-D05-02 — Choose a local ending or an optional final human reply

As a support worker, I want to choose a local ending or an optional final human reply, so that the recipient and I understand exactly what was and was not communicated.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D05-02-AC01:** Expose one text-labelled **End follow-up…** entry alongside the existing completion/status controls, not a fifth work-state button or an ambiguous X. Opening it shows a compact review surface titled **End follow-up — No response**. **Full contract: REQ26-D05-R04.**

- **US26-D05-02-AC02:** Distinguish an internal ending from informing the requester. The local-only action sends no email, SMS, closing notification or satisfaction survey. **Full contract: REQ26-D05-R05.**

- **US26-D05-02-AC03:** Write final reply returns to the existing composer with a visible current-draft **Send and end follow-up** intent carrying the No response reason and reviewed ending basis. It neither discards/replaces an existing draft nor resolves work early. **Full contract: REQ26-D05-R06.**

- **US26-D05-02-AC04:** Use existing base-maia/Base UI shared components and semantic tokens. Keep one primary work-status control, one infrequent ending entry and one compact review surface. **Full contract: REQ26-D05-R13.**

The D5 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 21. US26-D05-03 — Recover, correct and report an ending truthfully

As a support reviewer, I want to recover, correct and report an ending truthfully, so that later input, uncertainty and owner obligations remain actionable.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D05-03-AC01:** All single-item, keyboard, bulk, macro, API and legacy paths use the canonical conditional Support mutation boundary for any ending. The server derives tenant/environment and actual authenticated user/profile actor from trusted context, checks current conversation/resource capability and known owner guards, and binds expected reviewed conversation/input/work/reminder revisions with the ending intent and evidence references. **Full contract: REQ26-D05-R07.**

- **US26-D05-03-AC02:** Before admission, blocked/unavailable eligibility or write failure leaves work, reason, reminder and draft unchanged. Show an actionable permitted explanation and preserve edits. **Full contract: REQ26-D05-R10.**

- **US26-D05-03-AC03:** Keep operational work endings separate from confirmed problem or owner-action outcomes. No response is distinguishable from ordinary Support completion and legacy reason-not-recorded history. **Full contract: REQ26-D05-R11.**

- **US26-D05-03-AC04:** A local-only ending is a Support work-history event, not an outbound communication. Authorized CRM views may reference/project that same Support fact with navigation back to its context; they do not create another authoritative interaction or duplicate Phase 6 communication event. **Full contract: REQ26-D05-R12.**

- **US26-D05-03-AC05:** Record actual command, tenant, actor, conversation, episode, reason, source/review revisions, timer effect and any linked optional send identity without duplicating bodies or credentials in logs. Distinguish business history, security/actor audit, provider evidence and diagnostic traces. **Full contract: REQ26-D05-R15.**

The D5 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 22. US26-D05-04 — Activate the bounded manual ending capability

As a release owner, I want to activate the bounded manual ending capability, so that legacy timers and writers cannot silently create automatic closure.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D05-04-AC01:** Before activation, inventory both support modules, exposed collections, routes, macros, keyboard/bulk paths, notification rules, future status automations, seed behavior and reporting consumers. Add compatible reason/episode/command contracts and readers first; fence old writers before enabling the new ending action. **Full contract: REQ26-D05-R14.**

- **US26-D05-04-AC02:** D5 accepts a narrowly defined staff-ending capability and awareness behavior. It does not introduce a generic ending-reason builder, new main work status, whole-product case model, AI classifier/agent, knowledge-base workflow, portal archive, notification engine, automatic timer, SLA policy, fixed follow-up quota, minimum waiting interval or merge/split/withdrawal policy. **Full contract: REQ26-D05-R16.**

The D5 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 23. US26-D06-01 — Configure shared coverage and qualified receiving pools

As an inbox administrator, I want to configure shared coverage and qualified receiving pools, so that new work has a real accountable home without granting extra access.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D06-01-AC01:** A new inbox's default first-assignment mode is Shared. No individual is assigned by that default; the responsible inbox retains visible Unassigned work. **Full contract: REQ26-D06-R01.**

- **US26-D06-01-AC02:** Live inbox activation identifies at least one currently authorized human in an explicitly named coverage roster, directly or through a qualified Support team with actual membership. Reuse that operational association for the receiving pool where appropriate; do not create a mandatory coverage-steward role or a second team/owner system. **Full contract: REQ26-D06-R02.**

- **US26-D06-01-AC03:** Pools reference uniquely identified tenant staff principals with current permission to handle the work and explicitly configured operational inclusion. Expand qualified live Support-team membership and deduplicate one principal across direct and team inclusion. **Full contract: REQ26-D06-R03.**

The D6 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 24. US26-D06-02 — Control receipt of new automatic assignments and understand my limit

As a support worker, I want to control receipt of new automatic assignments and understand my limit, so that availability and workload controls do not rewrite existing responsibilities.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D06-02-AC01:** Receive new Support assignments is an explicit per-person, per-tenant operational flag. It starts Off until that worker or an authorized administrator explicitly enables it; adding a team member or opening Asym never silently enables it. **Full contract: REQ26-D06-R04.**

- **US26-D06-02-AC02:** Automatic assignment limit is an optional positive integer per person for the current tenant's Support work. Unset means No limit, clearly labelled; zero, negative, fractional or out-of-range values are invalid, with Off available for stopping automatic receipt. **Full contract: REQ26-D06-R05.**

- **US26-D06-02-AC03:** A legitimate reply, due reminder, owner update or recovery can make already assigned work Open above the limit. Preserve its owner and actual D3 work; show the overage and stop further automatic admission. **Full contract: REQ26-D06-R06.**

The D6 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 25. US26-D06-03 — Apply one fair and guarded first-assignment policy

As an inbox administrator, I want to apply one fair and guarded first-assignment policy, so that rules and concurrent allocators cannot overwrite human intent or exceed automatic admission limits.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D06-03-AC01:** After trusted intake routing/classification and current human-control fences, explicitly ordered specific initial-assignment rules precede the inbox default. The first qualifying match supplies one typed result: leave Shared, select a qualified person, or select a qualified pool and a named supported allocator, with a responsible team only if explicit. **Full contract: REQ26-D06-R07.**

- **US26-D06-03-AC02:** Safe new-conversation intake admits at most one durable initial-assignment source identity. Its policy binding can change before initial placement, with lineage retained. **Full contract: REQ26-D06-R08.**

- **US26-D06-03-AC03:** Assign to me claims the reviewed currently Unassigned conversation for the actual eligible authenticated principal. One concurrent claim wins; another receives current authorized state/conflict without overwriting the winner. **Full contract: REQ26-D06-R09.**

- **US26-D06-03-AC04:** True rotation records a durable turn only on a successful qualifying automatic first assignment in the relevant allocation pool. Skips, failed attempts, duplicate events, manual assignments and pauses do not consume that turn. **Full contract: REQ26-D06-R10.**

The D6 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 26. US26-D06-04 — Save, pause and resume assignment policy with an honest impact

As an inbox administrator, I want to save, pause and resume assignment policy with an honest impact, so that pending intake is reconsidered without sweeping previously handled work.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D06-04-AC01:** One authoritative Assignment settings surface edits the selected inbox's intended fields through expected-version checks. Save publishes a new policy revision and durable re-evaluation intent; it does not resend unrelated stale signature, SLA, auto-resolve or sender settings. **Full contract: REQ26-D06-R11.**

- **US26-D06-04-AC02:** An automatic-to-Shared default change releases still-pending intents that now resolve to the default into visible Shared responsibility and ends their automatic pursuit. A valid specific automatic rule may still govern another pending item; the preview distinguishes the two. **Full contract: REQ26-D06-R12.**

- **US26-D06-04-AC03:** Pending initial assignment is reconsidered when required owner facts, receiving state, capacity or current configuration change, through Core's durable workflow/recovery capability. Bound attempts, use appropriate backoff and ensure missed wake-ups can be reconciled from durable intent. **Full contract: REQ26-D06-R13.**

- **US26-D06-04-AC04:** Use the existing Support list/detail/assignment surfaces and shared Base UI/Maia/Zinc components. Keep one visible Unassigned label, work status, relevant age/reminder, and Assign to me or Assign action. **Full contract: REQ26-D06-R16.**

The D6 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 27. US26-D06-05 — Qualify and recover assignment without a second identity or workflow system

As a support operator, I want to qualify and recover assignment without a second identity or workflow system, so that permissions, history, complete counts and migration remain dependable.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D06-05-AC01:** Model tenant-aware relationships for inboxes, coverage/pool membership, qualified staff, policy versions, conversation assignments and history. Enforce one effective current assignment, one current policy per inbox and one initial source per admitted new conversation; eliminate duplicate effective person membership. **Full contract: REQ26-D06-R14.**

- **US26-D06-05-AC02:** Requester, email participant, authenticated staff principal, CRM Party, represented organization, Support assignee, responsible Support team and CRM record owner remain distinct. Email matching, conversation links, assignment and pool membership establish none of the others. **Full contract: REQ26-D06-R15.**

- **US26-D06-05-AC03:** Authorized operators can see current assignment, Shared/pending/paused/review reason, policy/rule reference and relevant change history. Store business evidence separately from technical traces and owner-security audits. **Full contract: REQ26-D06-R17.**

- **US26-D06-05-AC04:** Inventory both support modules, legacy Boolean/settings seeds, browser selectors, direct assignment endpoints, macros, imports/bulk actions, automation writers, database grants and worker versions. Establish one canonical assignment policy/command/intent contract and compatible readers, then fence every old bypass before activating new distribution. **Full contract: REQ26-D06-R18.**

- **US26-D06-05-AC05:** D6-P01–P22 below are required domain/user-outcome proof groups, not a claim that source inspection implements them. Validate real isolated Postgres/RLS, simultaneous transactions, old/new deployment behavior, browser accessibility and end-to-end Support-to-CRM journeys under representative permissions and data volumes. **Full contract: REQ26-D06-R19.**

- **US26-D06-05-AC06:** Before live activation, bind the operational roles in the monitor table to real people and existing alert/recovery surfaces. Prevent security, ownership, replay and capacity-admission violations through proof; monitoring supplements those safeguards. **Full contract: REQ26-D06-R20.**

The D6 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 28. US26-D07-01 — Start temporary coverage for reviewed inboxes

As a support worker, I want to start temporary coverage for reviewed inboxes, so that current and later review work stays with qualified colleagues during my absence.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D07-01-AC01:** Coverage is an explicit temporary Support work arrangement for one actual staff principal in one tenant and a reviewed set of inbox IDs. There is at most one current episode for that principal/tenant, with a current revision and effective scope. **Full contract: REQ26-D07-R01.**

- **US26-D07-01-AC02:** While the episode is effective in an inbox, initial catch-up transfers currently assigned D3 Open conversations for the covered person, including Open conversations with a future deferral. Preserve the exact valid reminder, current Open meaning, responsible team and inbox. **Full contract: REQ26-D07-R02.**

- **US26-D07-01-AC03:** Coverage evaluates first-time relevant admitted human input, valid due reminders, current awaited owner results, fresh actionable adverse/recovery evidence and an authorized explicit Set Open command through the ratified D3 work boundary. This includes earlier Resolved/No response conversations that reopen and already-Open conversations that receive fresh review work. **Full contract: REQ26-D07-R03.**

- **US26-D07-01-AC04:** Use D6's qualified named coverage roster, not a second owner or backup role. Before an automatic release, establish a current authorized shared handling path with at least one qualified human other than the covered subject. **Full contract: REQ26-D07-R04.**

- **US26-D07-01-AC05:** Starting coverage does not change the stored per-person/per-tenant Receive new Support assignments preference. Active coverage adds an explicit restriction on new automatic assignment to that person in its covered inboxes, in addition to D6's normal permission, pool, receiving and limit checks. **Full contract: REQ26-D07-R05.**

- **US26-D07-01-AC06:** Set up coverage opens an existing shared dialog/drawer pattern showing the person/tenant, selected inboxes, end choice, current Open count, both Waiting meanings and relevant follow-ups through permitted context. Explain that Open including deferred Open transfers, quiet waits stay until they need review, and a previously resolved conversation may return through coverage. **Full contract: REQ26-D07-R06.**

The D7 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 29. US26-D07-02 — Retain or hand off a particular covered conversation deliberately

As an authorized handler, I want to retain or hand off a particular covered conversation deliberately, so that manual handling and scope changes cannot be undone by old coverage jobs.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D07-02-AC01:** Coverage of previously owned work is a distinct later-assignment purpose. It does not create a second initial-conversation source, advance D6 rotation, consume a new automatic-assignment turn or reenroll every Unassigned row in the intake allocator. **Full contract: REQ26-D07-R07.**

- **US26-D07-02-AC02:** An authorized person may deliberately assign or reaffirm a conversation to the covered worker through the normal assignment control. The focused action states Keep with Maria during this coverage, with the actual person's name, and explains that this conversation stays with that worker for the current episode, including later replies/follow-ups. **Full contract: REQ26-D07-R08.**

- **US26-D07-02-AC03:** Preserve governing Move Assignee Retention and Move-Cleared Assignee Queueing. A move fences old-scope coverage work and never becomes fresh intake. **Full contract: REQ26-D07-R09.**

The D7 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 30. US26-D07-03 — Change or end coverage at a clear instant

As a support worker, I want to change or end coverage at a clear instant, so that future transfers stop without reclaiming prior handoffs or restoring old preferences.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D07-03-AC01:** Use trusted server admission/order for episode start and commands. Optional end is a finite future UTC instant resolved from the displayed date/time and named time zone; Until I end is explicit absence of an automatic end, not an unknown or silently invented date. **Full contract: REQ26-D07-R10.**

- **US26-D07-03-AC02:** D6 Pause automatic assignments also fences D7's autonomous assignment releases in that inbox. Preserve current owners while paused; do not silently narrow the existing Pause promise. **Full contract: REQ26-D07-R11.**

The D7 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 31. US26-D07-04 — Enforce coverage independently of CRM and message ownership

As a support administrator, I want to enforce coverage independently of CRM and message ownership, so that assignment changes cannot reveal drafts, impersonate authors or grant protected access.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D07-04-AC01:** Self coverage is a fixed Support operation for one's own qualified work scope, authorized through current Core identity and relevant Support assignment/operational rights. Managing another person's coverage requires explicit existing/developed owner-authorized administration capability, not matching email, any staff role or membership in a receiving pool. **Full contract: REQ26-D07-R12.**

- **US26-D07-04-AC02:** Coverage is one fixed Support operation using product-owned state, claims and the shared workflow dispatch ledger; the runtime consumes identifier-only envelopes and current owner facts. It does not create a general automation definition editor, second workflow engine, new queue broker or application-local scheduler that owns business truth. **Full contract: REQ26-D07-R13.**

- **US26-D07-04-AC03:** Requester, participant, authenticated worker, CRM Party, represented organization, Support assignee, responsible team and CRM owner remain distinct. Coverage changes only Support handling. **Full contract: REQ26-D07-R14.**

- **US26-D07-04-AC04:** A coverage handoff does not transfer another person's private unsent draft, attachment preparation or recipient selection. Covering staff may read only authorized conversation parts and compose their own reply through D1/D2/D4. **Full contract: REQ26-D07-R15.**

The D7 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 32. US26-D07-05 — Keep coverage understandable and recoverable at scale

As a support operator, I want to keep coverage understandable and recoverable at scale, so that partial transfer, missing cover and delayed work remain visible through qualified UI and operations.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D07-05-AC01:** Use the existing Support context and shared Base UI/base-maia/Zinc primitives. The setup has one main action, Start coverage, explicit scope/end, a short effect summary and only relevant warnings. **Full contract: REQ26-D07-R16.**

- **US26-D07-05-AC02:** Reuse semantic controls, accessible names/descriptions, focus management, keyboard navigation, screen-reader state announcements and supported touch targets. Narrow layouts prioritize one setup/detail view with clear back navigation and retained state. **Full contract: REQ26-D07-R17.**

- **US26-D07-05-AC03:** Select/count coverage using complete canonical tenant/principal/inbox/work predicates before pagination. A display hydration miss is Unknown, not proof of no assignee/team. **Full contract: REQ26-D07-R18.**

- **US26-D07-05-AC04:** Qualify D6's canonical assignment/history/current identity and D3's causal work/reminder contracts before activating coverage. Add compatible coverage readers/state/effect contracts, complete predicates and permitted projections, then fence old writers and enable workers/UI in a tested sequence. **Full contract: REQ26-D07-R19.**

- **US26-D07-05-AC05:** Before live activation, map the named roles in the monitor table to actual people and existing notification/recovery surfaces. Security, ownership, current-control and idempotency invariants require prevention/proof, not monitoring alone. **Full contract: REQ26-D07-R20.**

The D7 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 33. US26-D08-01 — Reconcile work affected by confirmed loss of handling access

As an identity and support operator, I want to reconcile work affected by confirmed loss of handling access, so that security takes effect immediately while unfinished work retains truthful custody.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D08-01-AC01:** Only current authoritative identity/permission evidence that the person cannot handle the affected Support conversations admits an access-loss handoff. Qualify the real principal, tenant and resource scope through Core's owner contracts. **Full contract: REQ26-D08-R01.**

- **US26-D08-01-AC02:** At first durable Support admission, create or reconcile one current handoff pursuit for the actual tenant/person/inbox and confirmed loss cause, or a distinct later admitted work cause. Capture the inbox policy and revision once under current guards before enumerating its population; all child items inherit it. **Full contract: REQ26-D08-R04.**

- **US26-D08-01-AC03:** The initial access-loss cohort includes affected Open, Waiting for requester and Waiting on our side conversations, including Open with future deferral. Preserve current work meaning, exact valid reminders, responsible inbox/team, priority, recipients and owner-domain facts. **Full contract: REQ26-D08-R05.**

- **US26-D08-01-AC04:** Confirmed handling loss immediately makes the former person ineligible for protected actions and for presentation as a valid current handler. Reads distinguish confirmed unavailable from unknown display hydration. **Full contract: REQ26-D08-R06.**

The D8 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 34. US26-D08-02 — Choose the fixed access-loss handoff policy

As an inbox administrator, I want to choose the fixed access-loss handoff policy, so that new handoffs use a clear default or qualified review path without changing existing cases.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D08-02-AC01:** Each tenant inbox has one explicit access-loss handoff policy: Return to shared queue, the product default, or Review handoff first. Put it in the existing inbox Assignment settings, separate from new-intake routing, Receive and Pause. **Full contract: REQ26-D08-R02.**

- **US26-D08-02-AC02:** Configure policy and review C handoffs are explicit Support administration operations authorized by the existing/developed canonical capability registry and current resource scope. A role label, assignment, coverage-roster membership or ability to remove an account is insufficient. **Full contract: REQ26-D08-R03.**

The D8 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 35. US26-D08-03 — Settle current shared or review-first handoffs

As an authorized handoff reviewer, I want to settle current shared or review-first handoffs, so that Pause, moves, restoration and reopening cannot bypass the review that still applies.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D08-03-AC01:** Under A, release to the current responsible inbox's qualified shared handling through one conditional assignment/handoff/history boundary. Preserve the qualified team. **Full contract: REQ26-D08-R07.**

- **US26-D08-03-AC02:** Under C, ordinary claim, unassign, macro, bulk assignment, API, automation, move-retain and background jobs cannot bypass the current review requirement. The reviewer must possess current Support handoff-review and necessary assignment/resource authority. **Full contract: REQ26-D08-R08.**

- **US26-D08-03-AC03:** D6/D7 Pause continues to stop autonomous assignment releases, including D8's A Shared release. It does not stop owner-enforced denial, current unavailable presentation, mandatory invalid-assignment repair, durable discovery or visible Needs reassignment. **Full contract: REQ26-D08-R09.**

- **US26-D08-03-AC04:** Every effect rechecks current tenant, canonical assignee/control, work lineage, source-loss applicability, policy binding, destination, actor/reviewer and scope at the authoritative mutation boundary. Use the owner governance epoch and current guards, not cached browser state or transaction-start time as proof of current authorization. **Full contract: REQ26-D08-R10.**

- **US26-D08-03-AC05:** An authorized Resolve while C review is pending changes Support work only. Retain the unresolved review and bound mode/provenance. **Full contract: REQ26-D08-R11.**

- **US26-D08-03-AC06:** Use product-owned durable handoff/assignment effects and the shared workflow dispatch ledger with identifier-only envelopes, bounded claims, tenant-scoped concurrency and recoverable intent. Identity denial, Support invalidation, shared release/review disposition and notifications are distinct effects with honest completion evidence. **Full contract: REQ26-D08-R12.**

The D8 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 36. US26-D08-04 — Preserve separate data, CRM and sending authority during access loss

As a support administrator, I want to preserve separate data, CRM and sending authority during access loss, so that revoked authors and replacement handlers cannot rewrite admitted messages or historical evidence.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D08-04-AC01:** Make tenant-aware principal/inbox/conversation/assignment/handoff/history references and unique current-control/effect constraints enforceable. Trusted context supplies tenant, actor, system cause and reviewer; caller IDs are validated targets. **Full contract: REQ26-D08-R13.**

- **US26-D08-04-AC02:** A Support requester, message participant, authenticated principal, CRM Party, represented organization, Support assignee and CRM record owner remain distinct. Handoff changes Support handling only. **Full contract: REQ26-D08-R14.**

- **US26-D08-04-AC03:** Access-loss handoff sends no donor-facing notice, adds no recipient, changes no reply default and transfers no private unsent draft. New handlers compose under their own actual identities. **Full contract: REQ26-D08-R15.**

The D8 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 37. US26-D08-05 — Inspect complete handoff progress and qualify rollout

As a support operator, I want to inspect complete handoff progress and qualify rollout, so that missing display data, large portfolios and worker failures are not presented as successful reassignment.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D08-05-AC01:** Use the existing Maia/Base UI/Zinc system and Support assignment/settings/detail surfaces. Present two plainly labelled choices with one-sentence consequences; do not hide meaning behind an ambiguous switch or an unexplained A/C code. **Full contract: REQ26-D08-R16.**

- **US26-D08-05-AC02:** Find affected work from canonical IDs and complete server-side predicates before pagination. Browser-loaded lists, hydrated rosters, the current first 1,000/2,000 request/response caps or newest-N snapshots cannot define loss scope, shared coverage, review counts or completion. **Full contract: REQ26-D08-R17.**

- **US26-D08-05-AC03:** Retain durable source-loss reference, actual prior and resulting assignment/team, actor/system cause, policy revision, reviewed disposition, current-control version and per-item outcome. Distinguish technical traces, security audit, Support business history and actual human response metrics. **Full contract: REQ26-D08-R18.**

- **US26-D08-05-AC04:** Identity-driven assignment invalidation and the two fixed inbox handoff dispositions are Support lifecycle operations, not tenant-authored automation definitions. Their configuration/review uses qualified Support administration; their durable executor uses shared claims/dispatch. **Full contract: REQ26-D08-R19.**

- **US26-D08-05-AC05:** Introduce additive versioned policy/control/history and safe projections before enabling effects. Product default Shared is not authorization to sweep pre-existing invalid-owner backlog or reinterpret legacy status. **Full contract: REQ26-D08-R20.**

The D8 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 38. US26-D09-01 — Add or remove optional peer CRM context

As a support worker, I want to add or remove optional peer CRM context, so that relevance is useful without changing identity, audience or record ownership.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D09-01-AC01:** A conversation may have no related CRM Party or several. Each active relevance association means only that this existing person, household or organization is relevant to this request. **Full contract: REQ26-D09-R01.**

- **US26-D09-01-AC02:** Preserve observed sender endpoints and per-message participants independently of explicit related context. Correspondence attribution uses the existing qualified identity/communication/source contract, with its original source identity, direction and historical contact/attribution evidence. **Full contract: REQ26-D09-R02.**

- **US26-D09-01-AC03:** Support owns conversation-to-Party relevance facts. Their endpoints are non-null tenant, canonical Support conversation ID and canonical Party ID, with composite tenant-aware foreign keys to both owner records. **Full contract: REQ26-D09-R03.**

- **US26-D09-01-AC04:** A context mutation requires current authority to manage the exact Support conversation's context and the target owner's permission to reference the exact Party for this staff purpose. Derive tenant, actor and audit identity from trusted server context; requested IDs are targets, not authority. **Full contract: REQ26-D09-R04.**

- **US26-D09-01-AC05:** Link, remove, correction and conditional Undo use one Support-owned server command boundary. Bind the exact conversation, target set, expected current association/control revisions and durable operation identity. **Full contract: REQ26-D09-R05.**

The D9 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 39. US26-D09-02 — Find relevant Support conversations and genuine communication history

As a crm user, I want to find relevant Support conversations and genuine communication history, so that one authorized record view distinguishes context from actual correspondence.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D09-02-AC01:** Existing D1 owner-record references such as a gift, contribution, receipt or statement retain their closed typed owner contract and actual tenant/resource validation. Staff can follow a gift to its beneficiary or legal donor through the owning domain. **Full contract: REQ26-D09-R06.**

- **US26-D09-02-AC02:** For a requested Party, the canonical server read model selects Support conversations justified by an active explicit relevance association OR an independently qualified actual source-message attribution to that Party. Apply joint visibility, then deduplicate by tenant and canonical conversation ID before paging/counting. **Full contract: REQ26-D09-R07.**

- **US26-D09-02-AC03:** Add a compact Support conversations section through the qualified Phase 9 header/Overview model. Use the existing Communications capability/socket for View conversations and its complete Support conversations view, with the same Party-scoped gate and shared read contract. **Full contract: REQ26-D09-R08.**

- **US26-D09-02-AC04:** CRM Activity uses Phase 9's one read-composed timeline and existing P6 Communication branch. Support message payloads remain in Support; P6 retains its canonical source/member lineage and body-free governed event contract. **Full contract: REQ26-D09-R09.**

- **US26-D09-02-AC05:** On one Party's CRM Communication view, genuinely shared Support message/source lineage may render as one message tile after visibility filtering and canonical event-ID deduplication. Preserve every underlying recipient-copy event, identity, timestamp and delivery outcome. **Full contract: REQ26-D09-R10.**

The D9 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 40. US26-D09-03 — Correct links and attribution through owner lifecycle changes

As an authorized record reviewer, I want to correct links and attribution through owner lifecycle changes, so that removal, merge, redaction and unmerge do not rewrite actual mail or restore forbidden context.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D09-03-AC01:** Remove context link ends only the selected relevance association under current revision and authority. It deletes no Party, conversation, message, receipt, communication fact or relationship, and does not remove a person from To/Cc or a portal. **Full contract: REQ26-D09-R11.**

- **US26-D09-03-AC02:** Party merge/unmerge stays owned by Phase 4/9. Register Support relevance in the qualified re-point/dedupe and replay contract: canonicalize the survivor within the tenant, deduplicate overlapping active links, retain original association origins and merge audit, and preserve later authorized edits. **Full contract: REQ26-D09-R12.**

- **US26-D09-03-AC03:** Search, cards, previews and audit expose only currently permitted fields. Related context grants no consent or unrestricted transcript visibility to other staff, donors, missionaries or members of a linked organization/household. **Full contract: REQ26-D09-R13.**

The D9 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 41. US26-D09-04 — Move between the same conversation and owner actions

As a support or crm worker, I want to move between the same conversation and owner actions, so that I retain my place and draft while every destination checks its own permissions.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D09-04-AC01:** Keep observed sender and email audience separate from Related records. Add records uses the existing qualified Party search/selector with permitted type/name/disambiguation and current link state. **Full contract: REQ26-D09-R14.**

- **US26-D09-04-AC02:** From a CRM row, open the same canonical Support conversation/detail experience with current Support authorization. Preserve the originating Party, view/filter/scroll/selection and the actor's permitted private draft. **Full contract: REQ26-D09-R15.**

- **US26-D09-04-AC03:** Linking, unlinking or changing visible context neither adds recipients nor hot-swaps template variables, prepared material, sender, audience, business target or approved relation set. D1/D2/D4/P17/P6 remain authoritative. **Full contract: REQ26-D09-R16.**

- **US26-D09-04-AC04:** Use indexed tenant/Party/conversation and active association/source-attribution predicates. Union justified discovery paths and deduplicate before keyset pagination. **Full contract: REQ26-D09-R17.**

- **US26-D09-04-AC05:** Integrate through Phase 9's shared Party header/overview and per-tab endpoints with the common Party access helper, plus the qualified Support query contract. Keep business reads/writes in the shared business API; use established collection/read-model client patterns rather than bespoke tab-owned truth or a second CRM adapter. **Full contract: REQ26-D09-R18.**

The D9 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 42. US26-D09-05 — Recover and qualify the shared projections

As a support and crm operator, I want to recover and qualify the shared projections, so that counts, history, migration and traceability remain accurate without synchronization or duplicate state.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D09-05-AC01:** Record actual actor/system cause, tenant, source conversation, original/canonical target, association generation, command identity, server occurrence, outcome and merge/correction provenance in the owner audit. Protect audit mutation and viewing independently of ordinary record display. **Full contract: REQ26-D09-R19.**

- **US26-D09-05-AC02:** Persist the authoritative link outcome and required audit/invalidation or shared dispatch intent together. Dispatch, search-index, realtime or cache failure cannot lose the relation or duplicate it on retry. **Full contract: REQ26-D09-R20.**

- **US26-D09-05-AC03:** Follow accepted ADR0001 and the synchronized durable crm-core contract: Asym Postgres owns CRM truth behind packages/api, with native identity, permission and audit boundaries. Support must not introduce Twenty, a vendor-owned CRM datastore or a second internal CRM synchronization authority. **Full contract: REQ26-D09-R21.**

- **US26-D09-05-AC04:** Run D9-P01–P32 and applicable D1–D8/P6/P9/P12 prerequisites before release. Prove positive, negative, cross-tenant/resource, concurrency, merge/unmerge, redaction, migration, failure and complete-query outcomes at the real boundaries. **Full contract: REQ26-D09-R22.**

The D9 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 43. US26-D10-01 — Merge a reviewed pair of duplicate requests

As an authorized support worker, I want to merge a reviewed pair of duplicate requests, so that one current handling component preserves every original source and permits safe correction.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D10-01-AC01:** Merge is an explicit staff conclusion that two current Support work components represent the same request. The launch command joins one reviewed pair of current roots in the same tenant and current inbox. **Full contract: REQ26-D10-R01.**

- **US26-D10-01-AC02:** Keep each original conversation ID, its source messages, original endpoints/headers/times, attachment custody, source business references and history stable. Each original conversation belongs to exactly one current handling component. **Full contract: REQ26-D10-R02.**

- **US26-D10-01-AC03:** Merge control, active edge, ended-edge history and command receipt have non-null tenant/canonical endpoints, same-tenant foreign keys, protected actor/cause, operation identity and server occurrence. Enforce one active parent per original source, no self-edge and valid active/ended state combinations with database constraints. **Full contract: REQ26-D10-R03.**

- **US26-D10-01-AC04:** A merge or Undo requires current Support capability and resource authority for the complete affected components and exact resulting work/assignment/reminder actions. Current combined handling access is qualified across constituent source conversation protection; each message, attachment, note, CRM record and field keeps its own stricter owner floor. **Full contract: REQ26-D10-R04.**

- **US26-D10-01-AC05:** Preview is a current explanation, not a reservation. Commit binds exact source/destination roots, active topology/control revisions, relied-on source readiness, work/reminder/assignment and permission facts, and durable operation identity. **Full contract: REQ26-D10-R05.**

- **US26-D10-01-AC06:** An identical request reconciles its original receipt and reports latest current state separately. Changed semantic input under that identity conflicts. **Full contract: REQ26-D10-R06.**

The D10 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 44. US26-D10-02 — Continue handling merged work and original email routes

As a support worker, I want to continue handling merged work and original email routes, so that new input, drafts, reminders and assignments remain correctly scoped.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D10-02-AC01:** Every admitted message/recovery effect retains its immutable source identity. Resolve its original thread/source from qualified owner correlation, then resolve current handling atomically with the D3 effect. **Full contract: REQ26-D10-R07.**

- **US26-D10-02-AC02:** A reply retains its exact reviewed target-message/original-source lineage and D2 audience. Opening combined handling neither unions participants nor quotes source history into an external reply. **Full contract: REQ26-D10-R08.**

- **US26-D10-02-AC03:** Merge presents one resulting current D3 work plan. Open dominates when any source owes action or required review; matching waits may retain that meaning; mixed blocking waits use Waiting on our side when no immediate action is owed, as D3 already requires. **Full contract: REQ26-D10-R09.**

- **US26-D10-02-AC04:** The resulting conversation retains at most one current D3 reminder. Preserve a sole applicable reminder through current qualification. **Full contract: REQ26-D10-R10.**

- **US26-D10-02-AC05:** Propose the continuing conversation's current eligible handler/team, with a clear resulting handling summary. A transfer is a new explicitly authorized assignment, not historical owner restoration or D6 initial intake. **Full contract: REQ26-D10-R11.**

The D10 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 45. US26-D10-03 — Undo a specific current merge relationship

As an authorized support worker, I want to undo a specific current merge relationship, so that later activity and each resulting current work plan survive without historical rollback.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D10-03-AC01:** Provide persistent Undo merge for each still-active merge relationship. Undo ends that exact edge and detaches its current source subtree. **Full contract: REQ26-D10-R12.**

- **US26-D10-03-AC02:** Use one Undo algorithm immediately and after later activity. Show two resulting work/handling/follow-up plans. **Full contract: REQ26-D10-R13.**

- **US26-D10-03-AC03:** Inbound mail keeps qualified original-thread affinity; a staff reply follows its explicitly selected message/source; attachment and delivery evidence follow that message. Those facts remain with their original component after Undo, regardless of which combined screen displayed them. **Full contract: REQ26-D10-R14.**

- **US26-D10-03-AC04:** Keep D9 relevance associations on their original conversation endpoints. The combined Related records view deduplicates current permitted contributing links by canonical Party while retaining provenance. **Full contract: REQ26-D10-R15.**

The D10 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 46. US26-D10-04 — Inspect combined and original history with clear provenance

As a support or crm worker, I want to inspect combined and original history with clear provenance, so that navigation, context and message privacy remain coherent before and after separation.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D10-04-AC01:** For D9 Support conversations, resolve each permitted explicit-context or correspondence source basis through current handling, then deduplicate by tenant/current root BEFORE counts/pagination. One combined work item appears once per Party; keep honest reasons and source provenance. **Full contract: REQ26-D10-R16.**

- **US26-D10-04-AC02:** The continuing staff detail presents a single chronological, permission-qualified history of its current component, preserving original message IDs and occurrence times. Use restrained original-conversation provenance on source transitions/details; do not add a bright badge to every message or require constant switching between transcripts. **Full contract: REQ26-D10-R17.**

- **US26-D10-04-AC03:** Place Merge duplicate… in the existing More menu. Use qualified search/previous conversations with source ID, permitted subject, sender observations, current work and recent date for disambiguation. **Full contract: REQ26-D10-R18.**

- **US26-D10-04-AC04:** Undo merge… is available from the specific merge event/details and optionally success feedback. Both open the same small current-result preview, immediately or later. **Full contract: REQ26-D10-R19.**

- **US26-D10-04-AC05:** Messages, private notes, attachments, personalized fields, exports and AI consumers retain their source-owner access and retention/redaction rules. Merge/Undo does not broaden storage policies, regenerate public attachment URLs, copy bodies into audit/P6 or turn member-care content into general CRM history. **Full contract: REQ26-D10-R20.**

The D10 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 47. US26-D10-05 — Operate and qualify source-preserving merge and Undo

As a support operator, I want to operate and qualify source-preserving merge and Undo, so that secondary effects, scale, metadata and migration cannot fabricate completion or lose routing.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D10-05-AC01:** Canonical topology and current work are committed together; search/cache/realtime/CRM refresh and operational notifications follow durable identifier-only intent. A failed refresh cannot undo authoritative work or require another Merge. **Full contract: REQ26-D10-R21.**

- **US26-D10-05-AC02:** Use indexed tenant/original/active-parent/root and source-message predicates; enforce complete current membership and policy before pagination/counts. Avoid browser snapshot merging, per-message reparenting, entire-body rewrites, per-card owner fan-out or unbounded messages inside a transaction. **Full contract: REQ26-D10-R22.**

- **US26-D10-05-AC03:** Introduce stable original-source provenance, protected topology/control/history and current read/command contracts before enabling Merge. Never backfill semantic duplicates from subject/email/Party or treat old demo profile-merge content as evidence of an implemented conversation merge. **Full contract: REQ26-D10-R23.**

- **US26-D10-05-AC04:** Keep the explicitly reviewed continuing conversation's current staff subject. Original email subjects and headers remain unchanged; staff naming does not rewrite external threads. **Full contract: REQ26-D10-R24.**

- **US26-D10-05-AC05:** Prove D10-P01–P39 and relevant D1–D9 owner prerequisites before activation. Tests exercise actual database commands, grants/RLS/RPC and current PDP, routing, source events, concurrency, migrations, degraded projections and complete UI journeys. **Full contract: REQ26-D10-R25.**

The D10 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 48. US26-D11-01 — Request or reuse bounded accountable internal assistance

As a support worker, I want to request or reuse bounded accountable internal assistance, so that a specialist receives a useful authorized brief while Support retains requester responsibility.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D11-01-AC01:** Provide contextual Ask for help for a bounded internal action needing accountable tracking. Keep Internal note/mention for a quick consultation, direct authorized owner actions where appropriate, and Assign/Transfer for a deliberate whole-conversation handoff. **Full contract: REQ26-D11-R01.**

- **US26-D11-01-AC02:** The current authorized Support handler or responsible shared inbox remains responsible for requester communication. Creating, assigning, starting or completing internal work does not claim, transfer or restore that responsibility, change CRM record ownership, add a recipient or send a message. **Full contract: REQ26-D11-R02.**

- **US26-D11-01-AC03:** If an exact pending or completed owner operation/shared task already represents the bounded action, show it and allow authorized reuse. Do not create another task merely because another conversation needs its result. **Full contract: REQ26-D11-R03.**

- **US26-D11-01-AC04:** Persist only the Support relationship and its review evidence: stable original source, exact owner-work identity/purpose/scope, current interest generation, creation provenance, active or ended need, and the exact owner result/revision reviewed or relied upon. Task status, assignee, due date and owner business outcome are current owner projections, never independently editable Support copies. **Full contract: REQ26-D11-R04.**

- **US26-D11-01-AC05:** The specialist receives a useful task brief without requiring full Support-conversation access. Admission requires the source owner to authorize release of the explicit brief and selected references for the task purpose and destination. **Full contract: REQ26-D11-R05.**

- **US26-D11-01-AC06:** The command derives tenant, actor and session/NHI purpose from trusted context. An authorized eligible destination is a distinct field; never substitute the specialist's ID as the actor to make the present helper assign to that specialist. **Full contract: REQ26-D11-R06.**

The D11 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 49. US26-D11-02 — Admit assistance with one durable source binding

As a task and support operator, I want to admit assistance with one durable source binding, so that retry, permissions and work-plan changes do not create duplicate tasks or copied owner truth.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D11-02-AC01:** A single authoritative command admits the new shared task where needed, exact source interests, authorized brief revision, actor/cause history, durable command receipt and required dispatch intents atomically in the shared Postgres boundary. Linking existing work does not recreate or mutate that owner's operation. **Full contract: REQ26-D11-R07.**

- **US26-D11-02-AC02:** Use non-null tenant and source identity, stable original-conversation relationships, exact closed owner target, purpose/scope, generation and protected occurrence/actor attribution. Shared task children, queues, assignees and Support interests must enforce same-tenant relationships, with composite foreign keys where the shared Postgres owner exists. **Full contract: REQ26-D11-R08.**

- **US26-D11-02-AC03:** Retain the current task tables' revoked anon/authenticated raw access. Do not open direct browser table reads or writes as an integration shortcut. **Full contract: REQ26-D11-R09.**

- **US26-D11-02-AC04:** Ask for help preserves the current conversation status and reminder by default. Offer an explicit Waiting on our side choice only when the internal step is the current blocker; validate and atomically save the complete D3 plan with admission. **Full contract: REQ26-D11-R10.**

The D11 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 50. US26-D11-03 — Review returned work and deliberately end my interest

As a support worker, I want to review returned work and deliberately end my interest, so that results, corrections and current responsibility receive attention without canceling someone else’s operation.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D11-03-AC01:** Use shared task statuses and owner-qualified outcomes. For new generic assistance the shared owner must support understandable Assigned/Open, In progress, a typed Needs input or Blocked update while unfinished, and a completion or dismissal with a safe result/reason. **Full contract: REQ26-D11-R11.**

- **US26-D11-03-AC02:** Support reviews the exact owner result revision, decides whether its need is satisfied, requires more work or is no longer needed, and records that disposition. A simple Mark reviewed action may finish a satisfied need; it does not send email or resolve the conversation. **Full contract: REQ26-D11-R12.**

- **US26-D11-03-AC03:** Qualify named shared notification occurrences for assistance assignment, relevant return/input/blockage and custody/recovery. The generic assignment/mention slot is currently deferred in P17; activation must supply its typed producer, audience, source applicability, dedupe and end rules rather than assuming a generic bell already implements it. **Full contract: REQ26-D11-R13.**

- **US26-D11-03-AC04:** Owner event/revision, work meaning and original source-interest generation identify relevance. Serialize current interest/review transitions with D3/D10 controls; resolve original sources to current continuing conversations at effect admission. **Full contract: REQ26-D11-R14.**

- **US26-D11-03-AC05:** Keep immutable creation origin separate from the exact reviewed original sources whose Support work needs the result. General assistance for the current combined request binds that current reviewed member set; selected source-specific work binds its actual affected subset. **Full contract: REQ26-D11-R15.**

- **US26-D11-03-AC06:** Stop following this work ends this conversation's exact current interests, with a clear reason and durable receipt. It does not cancel work used elsewhere, erase source history, retract a result or roll back a financial effect. **Full contract: REQ26-D11-R16.**

The D11 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 51. US26-D11-04 — Collaborate through a clear private task and CRM journey

As a support or specialist worker, I want to collaborate through a clear private task and CRM journey, so that internal content and owner outcomes are not silently sent to the requester.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D11-04-AC01:** Requester, email participant, authenticated user, CRM Party/relationship, represented organization, Support handler, task destination and CRM owner remain distinct. No CRM identity is required or created by asking for help. **Full contract: REQ26-D11-R17.**

- **US26-D11-04-AC02:** Ask for help and Return update are internal commands, visually and structurally separate from the requester reply composer. An internal task comment cannot be changed into an external reply by changing a mode flag. **Full contract: REQ26-D11-R18.**

- **US26-D11-04-AC03:** Minimize brief/result content and classify it at the owning boundary. Current task, source and owner restrictions apply to body search, excerpts, counts, notification/email previews, mobile views, exports, audit readers and storage. **Full contract: REQ26-D11-R19.**

- **US26-D11-04-AC04:** Use the existing Asym shell, shared controls and base-maia design language. Ask for help opens a contextual panel preserving conversation/CRM position. **Full contract: REQ26-D11-R23.**

The D11 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 52. US26-D11-05 — Qualify and recover assistance under realistic load

As a shared-task and support operator, I want to qualify and recover assistance under realistic load, so that source events, delivery failures and upgrades remain observable and safe.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D11-05-AC01:** Query current task/interest/outcome summaries server-side with tenant/owner policy before counts and pagination. Use indexes for exact receipt lookup, active source/work/purpose bindings, owner-event relevance and due/current queue work. **Full contract: REQ26-D11-R20.**

- **US26-D11-05-AC02:** A lost browser response shows Checking request and reconciles the original receipt; known rejection preserves the brief for correction. Stale source/destination/merge state refreshes a safe preview without posting to another target. **Full contract: REQ26-D11-R21.**

- **US26-D11-05-AC03:** Extend the shared task owner and its source contract additively. Existing contribution work retains its source, assignment and behavior; no global reinterpretation of historical task links or generic status reset. **Full contract: REQ26-D11-R22.**

- **US26-D11-05-AC04:** Carry D11-R01–R24 and D11-P01–P40 through the glossary/ADR, governing OpenSpec requirements, design, implementation tasks, tickets and release evidence without rewriting D1–D10. Record current implementation gaps separately from intended behavior. **Full contract: REQ26-D11-R24.**

The D11 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 53. US26-D12-01 — Create independent related work from an exact source message

As a support worker, I want to create independent related work from an exact source message, so that separate issues can be handled without moving or copying received correspondence.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D12-01-AC01:** Create related conversation is an authorized staff judgment that a requester issue merits independent handling, status or follow-up. Keep one coordinated conversation when clearer; use D11 for internal substeps and D10 for genuine duplicates. **Full contract: REQ26-D12-R01.**

- **US26-D12-01-AC02:** Create a new stable original conversation with staff-created provenance, server creation time, trigger reference and declared bounded request. Do not move/reparent original messages, change their sender/time/headers, clone attachments or rerun inbound ingestion. **Full contract: REQ26-D12-R02.**

- **US26-D12-01-AC03:** Use one narrow reciprocal related-work relationship between stable original conversation endpoints. No parent/main designation, implicit containment, transitive group ownership or generic arbitrary-record graph is introduced. **Full contract: REQ26-D12-R03.**

- **US26-D12-01-AC04:** The new work holds an authored minimal summary and explicit source-message/revision references. It does not copy the whole transcript, all internal notes, arbitrary selected paragraphs as received mail, old recipients or attachments. **Full contract: REQ26-D12-R04.**

- **US26-D12-01-AC05:** Derive tenant, actor, source identity, creation provenance and cause from trusted server/NHI context. Require current create/manage authority for the source action and new destination, exact context release and every included work/assignment/reminder/Party-link operation. **Full contract: REQ26-D12-R05.**

- **US26-D12-01-AC06:** Use non-null tenant and original endpoint identity, same-tenant foreign keys, typed trigger/citation relationships, protected occurrence/generation and actor/time fields. Enforce active unordered-pair uniqueness, no self-pair, valid active/ended relation state, staff-origin/no-native-mail consistency, and durable command/referral receipt uniqueness. **Full contract: REQ26-D12-R06.**

- **US26-D12-01-AC07:** One conditional source-owned transaction admits the new conversation, brief/release, exact citations, relation, current destination/source work plans, authorized optional links/interests, audit, durable command receipt and required identifier-only dispatch/invalidation intent. A known rejection creates none. **Full contract: REQ26-D12-R07.**

The D12 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 54. US26-D12-02 — Review both resulting work and custody plans

As a support worker, I want to review both resulting work and custody plans, so that continued work, reminders and internal interests remain owed in a valid current home.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D12-02-AC01:** The new conversation starts Open because independent work now needs attention. The original keeps its current valid plan by default. **Full contract: REQ26-D12-R08.**

- **US26-D12-02-AC02:** Prefill the new destination with the source's current inbox and current eligible handler; Shared remains Shared. Display that as a new reviewed assignment, not inherited authority or automatic creator ownership. **Full contract: REQ26-D12-R09.**

- **US26-D12-02-AC03:** Show the original reminder and any relevant promised follow-up when reviewing the two work plans. The new Open conversation has no inherited reminder by default; an explicit Open-plus-reminder uses D3. **Full contract: REQ26-D12-R10.**

The D12 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 55. US26-D12-03 — Start a deliberate native email thread for the new issue

As a support worker, I want to start a deliberate native email thread for the new issue, so that the new original owns its actual message and route without claiming old correspondence.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D12-03-AC01:** A staff-created conversation has no native email to reply to initially. Its primary external action is **Start email thread**, opening an explicit new composition owned by that new original conversation; its current root supplies handling and authorization only. **Full contract: REQ26-D12-R11.**

- **US26-D12-03-AC02:** Use the existing human Support communication producer with a narrowly qualified new-thread composition mode. Email Studio supplies eligible published Support templates and D4's content-only saved reply wording/presentation, with the same variable allow-list, current owner facts, safe fallback/missing-variable behavior and preview. **Full contract: REQ26-D12-R12.**

- **US26-D12-03-AC03:** Distinguish the internal message/member/intent IDs, Resend API email_id and actual RFC Message-ID. Resend's 8 July 2026 capability exposes actual message_id through email webhooks and GET email retrieval. **Full contract: REQ26-D12-R13.**

The D12 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 56. US26-D12-04 — Refer an old-route update and navigate related work

As a support worker, I want to refer an old-route update and navigate related work, so that the requester can reply normally while staff place only the permitted review where needed.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D12-04-AC01:** Admit old-route input to its original source/current D10 root normally. Do not redirect or fan it out by subject, AI topic inference, a related link or a prior continuation ending. **Full contract: REQ26-D12-R14.**

- **US26-D12-04-AC02:** Serialize create/referral/correction against source appends, current-root changes, work/assignment/reminder controls, D11 bindings and send admission using the canonical guarded mutation boundaries and consistent locking order. Preview is not a reservation; re-resolve current roots/permissions and material revisions at commit. **Full contract: REQ26-D12-R15.**

- **US26-D12-04-AC03:** Related endpoints and citations remain bound to originals. Project each permitted endpoint through its current D10 root and deduplicate before counts/pages. **Full contract: REQ26-D12-R16.**

- **US26-D12-04-AC04:** Requester endpoint, participant, authenticated user, CRM person/household/organization, represented party, Support handler, task worker and CRM owner stay distinct. No Party is mandatory or auto-created. **Full contract: REQ26-D12-R17.**

- **US26-D12-04-AC05:** Show a compact **Related conversations** section only when relevant, with permitted topic, current handler/work state and a clear link; do not display a graph, parent/child tabs or duplicate full transcripts. Source context is labelled **From another conversation** with the actual original time and a permitted View original action. **Full contract: REQ26-D12-R18.**

The D12 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 57. US26-D12-05 — Correct relationships, context or unused tracking

As an authorized support worker, I want to correct relationships, context or unused tracking, so that the actual mistake can be repaired without losing an obligation or recalling mail.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D12-05-AC01:** Provide current authorized **Remove relationship** and **Correct context** actions. Explain that removing related navigation does not delete conversations, erase required provenance/correspondence, undo current work or recall mail. **Full contract: REQ26-D12-R19.**

- **US26-D12-05-AC02:** Review creation may offer **Cancel unused conversation** only while the staff-created work has no subsequent independent activity, native/admitted/possibly submitted mail, external/owner effects, active merge participation, additional dependent continuation/referral or protected draft being discarded. Validate exact creation/control revisions and full current authority. **Full contract: REQ26-D12-R20.**

- **US26-D12-05-AC03:** Apply the original/source and new-work owner floors to briefs, title search, excerpts, attachments, exports, notification previews, audit readers and caches. Do not make a copied excerpt or expiring signed URL a permanent independent source authority. **Full contract: REQ26-D12-R22.**

The D12 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 58. US26-D12-06 — Qualify the complete related-work lifecycle and performance

As a support operator, I want to qualify the complete related-work lifecycle and performance, so that attention, metrics, migration and recovery remain source-accurate.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D12-06-AC01:** Creation/referral/current-custody changes create only the qualified source/task/Support attention required for actual current staff work. Use existing shared notification producer/presentation rules; OBL-028 generic assignment/mention must be qualified for the actual source and recipients before activation. **Full contract: REQ26-D12-R21.**

- **US26-D12-06-AC02:** Store real received/source occurrence, staff-created and current work-transition times separately. The selected trigger supplies an auditable request-received basis; additional old context does not arbitrarily backdate a new issue. **Full contract: REQ26-D12-R23.**

- **US26-D12-06-AC03:** Resolve related/current-root/citation summaries server-side under current policy before counts and pagination. Index tenant-scoped endpoint, source-message/referral, receipt and current-work lookups. **Full contract: REQ26-D12-R24.**

- **US26-D12-06-AC04:** Use existing Asym/base-maia shared controls. Create related conversation is a secondary contextual action distinct from Ask for help, Reply and Merge. **Full contract: REQ26-D12-R25.**

- **US26-D12-06-AC05:** Qualify the new staff-origin shape, D3 non-success ending, D2 new-thread mode, P17/P6 provider mapping, protected relations/citations/referrals, current-root controls and new notification occurrences before exposing the action. Preserve existing incoming and contribution/shared-task behavior. **Full contract: REQ26-D12-R26.**

- **US26-D12-06-AC06:** Carry D12-R01–R27 and D12-P01–P45 through the selected answer, glossary/ADR, governing OpenSpec/design/tasks/tickets/tests and release evidence. D12 explicitly proposes narrow D3 continuation/administrative-ending and D2 first-new-thread composition extensions; it preserves D10 original custody and D11 immutable interest meaning. **Full contract: REQ26-D12-R27.**

The D12 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 59. US26-D13-01 — Enable a clear New request confirmation policy

As an inbox administrator, I want to enable a clear New request confirmation policy, so that qualified new requests receive the selected service acknowledgment without hidden backlog sending.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D13-01-AC01:** The confirmation means only that qualified intake has durably accepted a recoverable Support request. It is an informational service email, distinct from a charitable-gift acknowledgment, staff reply, resolution notice, knowledge answer, receipt of payment or task notification. **Full contract: REQ26-D13-R01.**

- **US26-D13-01-AC02:** Expose exactly New requests (recommended), Outside service hours and Off for this purpose. A new inbox setup proposes New requests with the compatible Asym starter publication; an authorized administrator reviews and saves it as part of qualified inbox activation. **Full contract: REQ26-D13-R02.**

- **US26-D13-01-AC03:** Create a server-timed eligibility activation generation on enablement or mode change. An as-yet-unbound intake may bind only the current generation, and only if its qualified original provider receipt is at or after that generation's effective-from instant. **Full contract: REQ26-D13-R07.**

- **US26-D13-01-AC04:** Use a compact settings section with a labelled mode control, compatible template summary, sender summary, Preview and Edit in Email Studio. The outside-hours mode alone discloses the qualified calendar link/zone and missing-calendar blocker. **Full contract: REQ26-D13-R21.**

The D13 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 60. US26-D13-02 — Apply exact safe confirmation eligibility

As a receiving operator, I want to apply exact safe confirmation eligibility, so that a real recoverable request may be confirmed without loops, guessed recipients or stale mail.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D13-02-AC01:** Only a receiving-owner-qualified email that creates a genuinely new original requester conversation can originate this purpose. Persist the source occurrence, verified provider account/receive identity, original conversation, trusted first-receipt time, source/safety revision and decision even if later preparation fails. **Full contract: REQ26-D13-R03.**

- **US26-D13-02-AC02:** Specify this as the narrowly defined RFC 3834 service-responder use of the original RFC 5322 From mailbox. Require exactly one syntactically valid original From address and current trusted receiving/safety evidence permitting this low-content automatic response to it. **Full contract: REQ26-D13-R04.**

- **US26-D13-02-AC03:** Suppress automatic response to detected automatic mail, delivery/read reports, null reverse-path, non-`no` Auto-Submitted, applicable auto-response-suppression directives, list/bulk traffic, own delivery/return addresses or routes, known loop chains and qualified spam/abuse. Missing trustworthy raw/header evidence is not a clean result. **Full contract: REQ26-D13-R05.**

- **US26-D13-02-AC04:** Freeze `confirmation_utility_ends_at = qualified_first_provider_receipt_at + 15 minutes`. Dispatch authority exists only strictly before that instant, with no intentional delay. **Full contract: REQ26-D13-R06.**

The D13 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 61. US26-D13-03 — Publish a bounded truthful Support request received message

As an email studio publisher, I want to publish a bounded truthful Support request received message, so that branding and localization preserve the protected meaning and normal email continuation.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D13-03-AC01:** Admit one closed key `support.request_received` and one compatible Support service-confirmation document/profile generation. The final key spelling is a manifest implementation identifier, not a new user concept. **Full contract: REQ26-D13-R08.**

- **US26-D13-03-AC02:** Provide the **Support request received** starter as an Asym-structured Email Studio document with immutable publication/dependency pins under ADR0030. Its permitted facts are approved tenant public identity, the source-owned received meaning, safe reply-subject derivation, and optional governed calendar information. **Full contract: REQ26-D13-R09.**

- **US26-D13-03-AC03:** Use the qualified original message's RFC Message-ID for In-Reply-To and its validated bounded References chain plus that ID. Use the existing safe reply-subject plan, normally one `Re:` prefix and the original sanitized subject, with an approved neutral fallback when absent. **Full contract: REQ26-D13-R10.**

- **US26-D13-03-AC04:** P17 resolves the current permitted tenant/site sender and monitored Support return identity through ADR0029; it never uses the assigned worker's personal identity or a platform/default account fallback. Freeze the exact connection, credential revision, domain, sender and return authority at preparation/submission. **Full contract: REQ26-D13-R11.**

- **US26-D13-03-AC05:** Only compatible published P17 content is eligible. Resolve locale from qualified request context when available, otherwise the inbox's configured locale, then its published whole-message fallback policy. **Full contract: REQ26-D13-R16.**

The D13 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 62. US26-D13-04 — Admit and recover one current automatic confirmation

As a delivery operator, I want to admit and recover one current automatic confirmation, so that concurrency, human replies, contact restrictions and uncertainty never create another send.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D13-04-AC01:** The Support intake transaction commits the original source decision, complete immutable semantic command identity, canonical P17 occurrence slot binding or durable registration outbox, body-free history and required recovery work together. Where owners cannot share a database transaction, use the existing durable outbox and unique consumer receipt, not an unsafe dual write. **Full contract: REQ26-D13-R12.**

- **US26-D13-04-AC02:** Use existing owner tables/services where sound, adding only the narrow source decision/binding needed for this purpose. Require non-null tenant/environment/original source/purpose/generation, tenant-aware foreign keys for original conversation, received message, publication, intent and delivery, unique original-source/purpose occurrence and provider-account/receive identity, typed disposition/reason and UTC timestamptz deadlines. **Full contract: REQ26-D13-R13.**

- **US26-D13-04-AC03:** Add a narrow `prepared.automatic_confirmation_15m@1` class: the absolute R06 deadline, not 15 minutes after a delayed seal; the earliest privacy/safety/consent/utility terminal wins. Preparation freezes the whole published message, source facts, locale/fallback, presentation, audience and composed delivery identities. **Full contract: REQ26-D13-R14.**

- **US26-D13-04-AC04:** Keep source decision, preparation/submission and provider delivery outcomes separate. Meaningful source states are awaiting qualification, eligible, skipped with a reason, preparation blocked, prepared definitely unsubmitted, submission may have begun, and known provider outcomes; these are processing states, not extra Support statuses. **Full contract: REQ26-D13-R15.**

- **US26-D13-04-AC05:** An ordinary inbound continuation or reopened request is not another confirmation; repeated deliveries, merge/undo, internal actions, D12 new related work, first staff-origin email, referral and administrative correction are excluded triggers. A held original that qualifies within its frozen window is evaluated as that original, not a new conversation. **Full contract: REQ26-D13-R19.**

- **US26-D13-04-AC06:** The owner classifies this purpose as service/transactional; a caller cannot select that exemption. Enforce current address restrictions, hard bounces, complaints, manual blocks and applicable privacy restrictions through the qualified shared owner resolver, including no-Party requests. **Full contract: REQ26-D13-R20.**

The D13 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 63. US26-D13-05 — See honest automatic correspondence and operational readiness

As a support or crm worker, I want to see honest automatic correspondence and operational readiness, so that automatic confirmation does not replace human work, create a body archive or inflate stewardship metrics.

Given the current authoritative source/state and the caller’s actual rights, when this action is attempted—including denied, stale, duplicate and interrupted variants—then the following acceptance outcomes are required:

- **US26-D13-05-AC01:** Represent actual admitted automatic correspondence once through its P6 occurrence and original Support source linkage. Show Automatic confirmation with the real delivery state; a body-free processing detail records expected no-send decisions, without a fake outgoing bubble. **Full contract: REQ26-D13-R17.**

- **US26-D13-05-AC02:** The original requester, From mailbox, authenticated user, related Party, represented organization, assigned Support worker and CRM owner remain separate. No acknowledgment creates/merges a Party, changes an email preference/CRM owner, asserts representation or performs a giving/account/care action. **Full contract: REQ26-D13-R18.**

- **US26-D13-05-AC03:** The donor receives a brief readable tenant-branded service email with no personal staff signature, compulsory link, tracking CTA, campaign footer or duplicate confirmation. Make automatic attribution visible but quiet. **Full contract: REQ26-D13-R22.**

- **US26-D13-05-AC04:** Process indexed tenant/source/state/due-time pages through shared durable delivery and repair infrastructure, not a scan of every Support conversation or a per-conversation polling timer. No browser 2,000-row export/filter can select authoritative work. **Full contract: REQ26-D13-R23.**

- **US26-D13-05-AC05:** Qualify the P17 key/profile/material class, receiving authenticity contract, adapter/header/outcome semantics, current contactability and canonical Support writer boundaries before activation. Existing generic raw-template activity flags, local fake message IDs, permissive Support grants and separate source/history writes are not production proof. **Full contract: REQ26-D13-R24.**

- **US26-D13-05-AC06:** The starter below is an implementation deliverable. Historical CLI dry-run observations are evidence only; live qualified provider/compiler/mailbox proof remains required before activation, and no send is performed by specification publication. **Full contract: REQ26-D13-R25.**

- **US26-D13-05-AC07:** Keep the founder's selection, every proposed amendment, glossary, exploratory ADR, source evidence, UI/template contract, proof matrix and known limits linked and consistent. D1–D12 remain preserved. **Full contract: REQ26-D13-R26.**

The D13 owner/lifecycle, UX, proof and operational clauses in the normative detail registry are also required for the covered journey; their exact IDs remain independently traceable.

### 64. US26-D14-01 — Configure reply targets

As an inbox administrator, I want to configure optional First and Next durations and an explicit time basis, so that staff see a truthful expectation.

- **AC26-D14-P01:** Given the stated source/actor conditions, when the specified operation or event occurs, then Off/unconfigured starts with no active targets or seeded hours; existing queues/reminders work. Enable First only, Next only or both with deliberate durations and explicit basis.

- **AC26-D14-P02:** Given the stated source/actor conditions, when the specified operation or event occurs, then Zero, negative, nonfinite, fractional-minute, ambiguous days and overflow inputs reject with preserved fields; hours/minutes conversion is exact.

- **AC26-D14-P04:** Given the stated source/actor conditions, when the specified operation or event occurs, then New policy generation cannot adopt earlier received/unbound work; repeat processing and re-enable cannot target the same untargeted current burst. Ordinary edits preserve pending targets.

Full acceptance suite: AC26-D14-P01, AC26-D14-P02, AC26-D14-P03, AC26-D14-P04, AC26-D14-P05, AC26-D14-P06, AC26-D14-P07, AC26-D14-P08, AC26-D14-P37.

Binding primary requirements: REQ26-D14-R01, REQ26-D14-R02, REQ26-D14-R03, REQ26-D14-R04, REQ26-D14-R05, REQ26-D14-R20.

### 65. US26-D14-02 — See the correspondence still owed

As a Support responder, I want to see exact original correspondent contributions and waiting age, so that new input cannot hide an earlier obligation.

- **AC26-D14-P09:** Given the stated source/actor conditions, when the specified operation or event occurs, then Duplicate/automated/quarantined/unrelated input creates no new human reply period; qualified late release preserves original source age and separately exposes intake delay.

- **AC26-D14-P12:** Given the stated source/actor conditions, when the specified operation or event occurs, then Actual human reply to B cannot clear A; a group reply covers only reviewed actual accepted members. Reply-to/route correction preserves age and does not use CRM matching as authority.

- **AC26-D14-P14:** Given the stated source/actor conditions, when the specified operation or event occurs, then Input after frozen send coverage stays owed. Acceptance closes only covered oldest work and creates the proper original-time successor; definite rejection preserves older debt/deadline.

Full acceptance suite: AC26-D14-P09, AC26-D14-P10, AC26-D14-P11, AC26-D14-P12, AC26-D14-P13, AC26-D14-P14, AC26-D14-P15, AC26-D14-P16, AC26-D14-P51, AC26-D14-P55.

Binding primary requirements: REQ26-D14-R06, REQ26-D14-R07, REQ26-D14-R08, REQ26-D14-R10.

### 66. US26-D14-03 — Settle and correct reply obligations

As a Support responder, I want to use actual accepted replies or exact No reply needed corrections, so that response evidence and remaining promises stay honest.

- **AC26-D14-P17:** Given the stated source/actor conditions, when the specified operation or event occurs, then Draft/queued/automatic/internal-note/status/task events earn no human reply credit. Genuine human progress or clarification may count without resolution. No AI/body-length classifier decides semantic quality.

- **AC26-D14-P18:** Given the stated source/actor conditions, when the specified operation or event occurs, then Exact P6 acceptance time scores correctly. Bounded intervals wholly before/after/straddling due yield on-time/late/unknown; earlier ambiguity and definite rejection alter bounds correctly.

- **AC26-D14-P52:** Given the stated source/actor conditions, when the specified operation or event occurs, then Partial No reply needed cannot clear uncovered input; oldest-prefix versus non-prefix behavior and persistent Undo reconcile current work without duplicate periods, new source consumption or re-enabling Off targets.

Full acceptance suite: AC26-D14-P17, AC26-D14-P18, AC26-D14-P19, AC26-D14-P20, AC26-D14-P21, AC26-D14-P22, AC26-D14-P23, AC26-D14-P52.

Binding primary requirements: REQ26-D14-R09, REQ26-D14-R11.

### 67. US26-D14-04 — Find due work in its current home

As a Support responder, I want to review due or uncertain work through moves, waits, merges and continuations, so that deadlines remain visible without clock resets.

- **AC26-D14-P24:** Given the stated source/actor conditions, when the specified operation or event occurs, then Due creates one Open review while preserving a valid future reminder; overdue work is visible despite deferral. Explicit Open still clears the reminder.

- **AC26-D14-P31:** Given the stated source/actor conditions, when the specified operation or event occurs, then Cancel unused B/hand-off correction rehomes owed targets before retirement; stale A/B/root cycles, duplicate transfer and concurrent Undo cannot orphan work.

- **AC26-D14-P54:** Given the stated source/actor conditions, when the specified operation or event occurs, then A known overdue obligation remains the primary cue/filter match despite an earlier uncertain candidate; a future known target cannot hide an earlier candidate. Sample labels distinguish completed waits from emails.

Full acceptance suite: AC26-D14-P24, AC26-D14-P25, AC26-D14-P26, AC26-D14-P27, AC26-D14-P28, AC26-D14-P29, AC26-D14-P30, AC26-D14-P31, AC26-D14-P35, AC26-D14-P36, AC26-D14-P39, AC26-D14-P54.

Binding primary requirements: REQ26-D14-R12, REQ26-D14-R13, REQ26-D14-R14, REQ26-D14-R15, REQ26-D14-R19, REQ26-D14-R21.

### 68. US26-D14-05 — Interpret performance correctly

As an authorized reporting user, I want to compare due cohorts, uncertainty, completed waits and backlog, so that administrative cleanup does not improve the score.

- **AC26-D14-P40:** Given the stated source/actor conditions, when the specified operation or event occurs, then Targets due cohort uses frozen due and half-open selected interval/report zone; first/next instances differ from conversations, and candidate splits are not double-counted.

- **AC26-D14-P43:** Given the stated source/actor conditions, when the specified operation or event occurs, then Completed durations cannot hide unanswered backlog; bound calendars, current/source responsibility and responding actor dimensions remain explicitly separate across reassignment/merge.

- **AC26-D14-P53:** Given the stated source/actor conditions, when the specified operation or event occurs, then Unfinalized candidate due/completion intervals intersecting report boundaries appear once in separate uncertain-cohort coverage, outside exact denominators/duration samples; finalized-only data cannot imply complete coverage.

Full acceptance suite: AC26-D14-P40, AC26-D14-P41, AC26-D14-P42, AC26-D14-P43, AC26-D14-P44, AC26-D14-P53.

Binding primary requirements: REQ26-D14-R22, REQ26-D14-R23, REQ26-D14-R24.

### 69. US26-D14-06 — Retain cross-domain authority

As a jointly authorized Support and CRM user, I want to navigate between target work and CRM context, so that timing changes do not send mail or complete business actions.

- **AC26-D14-P45:** Given the stated source/actor conditions, when the specified operation or event occurs, then Support→CRM→Support navigation preserves context and joint access. Target changes create no CRM email/Party/owner/financial/task completion or D13 deadline promise.

- **AC26-D14-P47:** Given the stated source/actor conditions, when the specified operation or event occurs, then Privacy/retention/erasure/backup restore cannot expose raw target recipient/source data or recreate identities; permitted body-free history and current recovery remain coherent.

Full acceptance suite: AC26-D14-P45, AC26-D14-P47.

Binding primary requirements: REQ26-D14-R25, REQ26-D14-R27.

### 70. US26-D14-07 — Operate and qualify reply targets

As a Support platform operator, I want to secure, recover and roll out source-qualified target effects, so that races and repair cannot duplicate work or disclose content.

- **AC26-D14-P32:** Given the stated source/actor conditions, when the specified operation or event occurs, then Tenant-aware FKs, source/coverage uniqueness, collecting-only uniqueness and typed nullability reject invalid states while admitting legitimate sealed coexistence. No time-relative check rejects overdue rows.

- **AC26-D14-P33:** Given the stated source/actor conditions, when the specified operation or event occurs, then Direct SELECT/DML, HTTP/RPC/view/storage/export/cache and service-worker probes cannot forge actor/proof/tenant/source/policy or expose restricted target existence/content. Test old-row USING and new-row WITH CHECK.

- **AC26-D14-P34:** Given the stated source/actor conditions, when the specified operation or event occurs, then Intake/target-outbox or fulfillment/due-review crash points leave one recoverable effect; lost responses reconcile original operation IDs, and late UI responses cannot overwrite newer state.

Full acceptance suite: AC26-D14-P32, AC26-D14-P33, AC26-D14-P34, AC26-D14-P38, AC26-D14-P46, AC26-D14-P48, AC26-D14-P49, AC26-D14-P50.

Binding primary requirements: REQ26-D14-R16, REQ26-D14-R17, REQ26-D14-R18, REQ26-D14-R26, REQ26-D14-R28, REQ26-D14-R29, REQ26-D14-R30.

### 71. US26-D15-01 — Choose my exact follow scope

As a Support staff member, I want to explicitly Follow and Stop my current authorized originals, so that interest does not transfer assignment or access.

- **AC26-D15-P01:** Given the stated source/actor conditions, when the specified operation or event occurs, then Authenticate two staff principals/tenants/roles. Follow and preferences always bind the current trusted subject; spoofed tenant/agent/role/actor cannot enroll or alter another person.

- **AC26-D15-P03:** Given the stated source/actor conditions, when the specified operation or event occurs, then Following cannot grant read/send/CRM/care access. Hidden originals, names, counts and endpoints stay absent from picker, preview, errors and returned scope.

- **AC26-D15-P04:** Given the stated source/actor conditions, when the specified operation or event occurs, then Exact Follow retry returns one result/generation; same token with changed scope/desire conflicts. A timeout remains reconcilable without a second toggle.

Full acceptance suite: AC26-D15-P01, AC26-D15-P02, AC26-D15-P03, AC26-D15-P04, AC26-D15-P05, AC26-D15-P06, AC26-D15-P07, AC26-D15-P08, AC26-D15-P09, AC26-D15-P44.

Binding primary requirements: REQ26-D15-R01, REQ26-D15-R02, REQ26-D15-R03, REQ26-D15-R04, REQ26-D15-R05, REQ26-D15-R19.

### 72. US26-D15-02 — Receive useful permitted activity

As a following staff member, I want to receive the finite human activity set with proper self-event and overlap rules, so that required work stays visible without routine noise.

- **AC26-D15-P10:** Given the stated source/actor conditions, when the specified operation or event occurs, then E1 requires first qualified human input; automated/quarantined/duplicate/unrelated mail and attachment readiness repeats produce no follower body/notice.

- **AC26-D15-P11:** Given the stated source/actor conditions, when the specified operation or event occurs, then E2 requires actual accepted human reply and exact source/member evidence. Draft/queued/unknown/automatic mail earn no sent-human event; partial outcomes are not universal success.

- **AC26-D15-P12:** Given the stated source/actor conditions, when the specified operation or event occurs, then E3 exposes only permitted published human note evidence. System rows, drafts, denied notes and edit/redaction repeats cannot leak or create alert storms.

Full acceptance suite: AC26-D15-P10, AC26-D15-P11, AC26-D15-P12, AC26-D15-P13, AC26-D15-P14, AC26-D15-P15, AC26-D15-P16, AC26-D15-P17.

Binding primary requirements: REQ26-D15-R06, REQ26-D15-R07, REQ26-D15-R08.

### 73. US26-D15-03 — Control optional email and attention

As a following staff member, I want to control my optional email channel and understand notice expiry, so that preferences cannot suppress required reasons or revive old events.

- **AC26-D15-P18:** Given the stated source/actor conditions, when the specified operation or event occurs, then One E4 member with frozen A+B contributions survives Stop A while B is valid; Stop both suppresses it. New C or re-followed A cannot join that member.

- **AC26-D15-P20:** Given the stated source/actor conditions, when the specified operation or event occurs, then After successful release, replay returns exact plan/member pins. Current follower queries, plan edits and re-follow cannot change membership or occurrence identity.

- **AC26-D15-P22:** Given the stated source/actor conditions, when the specified operation or event occurs, then Whole P6 parent/count/digest/ordinal release is all-before-any. Missing/extra/stale/over-limit candidates or precommit crash release no partial set; postcommit lost response replays once.

Full acceptance suite: AC26-D15-P18, AC26-D15-P19, AC26-D15-P20, AC26-D15-P21, AC26-D15-P22, AC26-D15-P23, AC26-D15-P24, AC26-D15-P25, AC26-D15-P26, AC26-D15-P35, AC26-D15-P36, AC26-D15-P37, AC26-D15-P38, AC26-D15-P39, AC26-D15-P52, AC26-D15-P53, AC26-D15-P54.

Binding primary requirements: REQ26-D15-R09, REQ26-D15-R10, REQ26-D15-R11, REQ26-D15-R12.

### 74. US26-D15-04 — Preserve interests through source changes

As a following staff member, I want to retain exact original interests through topology and access changes, so that merges, role changes and regrant do not widen or transfer scope.

- **AC26-D15-P27:** Given the stated source/actor conditions, when the specified operation or event occurs, then Permission loss between command, candidate admission, dispatch, preview and click removes protected access/current presentation; same-tenant role changes cannot expose old notices.

- **AC26-D15-P28:** Given the stated source/actor conditions, when the specified operation or event occurs, then PDP/identity timeout fails closed while preserving intent. A positive revoke ends only affected generations; a transient outage is never fabricated as an access-loss event.

- **AC26-D15-P29:** Given the stated source/actor conditions, when the specified operation or event occurs, then Regrant/account claim/Party merge does not transfer or revive old following/unread history. New deliberate Follow permits only future events in the current exact staff scope.

Full acceptance suite: AC26-D15-P27, AC26-D15-P28, AC26-D15-P29, AC26-D15-P30, AC26-D15-P31, AC26-D15-P32, AC26-D15-P33, AC26-D15-P34.

Binding primary requirements: REQ26-D15-R13, REQ26-D15-R14, REQ26-D15-R15, REQ26-D15-R20.

### 75. US26-D15-05 — Find followed work accessibly

As a following staff member, I want to open complete current Following results and return to the source, so that my navigation and draft context remain coherent.

- **AC26-D15-P42:** Given the stated source/actor conditions, when the specified operation or event occurs, then Beyond 2,000 total rows and skewed tenants, keyset count/page/search predicates agree without client truncation, body hydration or N+1 privileged reads; record query plans and measured envelope.

- **AC26-D15-P43:** Given the stated source/actor conditions, when the specified operation or event occurs, then Following includes resolved active interests under All statuses; Latest followed update ignores unrelated merged activity; explicit filters and source changes preserve truthful count/sort units.

- **AC26-D15-P44:** Given the stated source/actor conditions, when the specified operation or event occurs, then Normal/partial Follow, pending/conflict/denied/offline, persistent Stop/Follow again and bounded selected Stop have exact current outcomes, preserved draft/selection and no unseen-scope sweep.

Full acceptance suite: AC26-D15-P42, AC26-D15-P43, AC26-D15-P44, AC26-D15-P45.

Binding primary requirements: REQ26-D15-R18, REQ26-D15-R21.

### 76. US26-D15-06 — Operate private follow evidence

As a privacy or Support operator, I want to secure and recover bounded source-qualified follow occurrences, so that audience compilation and restoration cannot disclose or replay messages.

- **AC26-D15-P40:** Given the stated source/actor conditions, when the specified operation or event occurs, then Database rejects cross-tenant FKs, duplicate active epochs/contributions/member slots, forbidden nulls, overlapping lifecycle state and caller-mutated principal/source/author fields; legitimate partial scope remains possible.

- **AC26-D15-P46:** Given the stated source/actor conditions, when the specified operation or event occurs, then Generation history survives pending audience qualification, then owner retention/erasure safely compacts it. Backup restore cannot reactivate Stops, expose revoked previews or replay old effects.

- **AC26-D15-P49:** Given the stated source/actor conditions, when the specified operation or event occurs, then Additive migration, one writer, no inferred enrollment/backlog, mixed-version guard rejection and roll-forward/rollback retain source and personal state after new guarded data exists.

Full acceptance suite: AC26-D15-P40, AC26-D15-P41, AC26-D15-P46, AC26-D15-P47, AC26-D15-P48, AC26-D15-P49, AC26-D15-P50, AC26-D15-P51.

Binding primary requirements: REQ26-D15-R16, REQ26-D15-R17, REQ26-D15-R22, REQ26-D15-R23, REQ26-D15-R24, REQ26-D15-R25, REQ26-D15-R26.

### 77. US26-D16-01 — Remove exact sensitive content

As an authorized redaction staff member, I want to select exact source text, metadata or files and review the remainder, so that unrelated legitimate history survives.

- **AC26-D16-P01:** Given the stated source/actor conditions, when the specified operation or event occurs, then Select one private paragraph and one file, review exact remainder, cancel/unmark safely, then commit once; ordinary work remains.

- **AC26-D16-P05:** Given the stated source/actor conditions, when the specified operation or event occurs, then Sensitive href/alt/title/comment/remote URL cannot survive selected object removal; preview discloses whole-link expansion.

- **AC26-D16-P07:** Given the stated source/actor conditions, when the specified operation or event occurs, then Stale, forged, empty, malformed and unsupported selection fails safely; arbitrary replacement HTML cannot rewrite history.

Full acceptance suite: AC26-D16-P01, AC26-D16-P02, AC26-D16-P03, AC26-D16-P04, AC26-D16-P05, AC26-D16-P06, AC26-D16-P07, AC26-D16-P08, AC26-D16-P28, AC26-D16-P35.

Binding primary requirements: REQ26-D16-R01, REQ26-D16-R02, REQ26-D16-R03, REQ26-D16-R04, REQ26-D16-R05, REQ26-D16-R06, REQ26-D16-R07.

### 78. US26-D16-02 — Make restriction effective once

As an authorized redaction operator, I want to commit a current restriction and durable owner cleanup responsibilities, so that alternate representations and retries cannot expose removed content.

- **AC26-D16-P09:** Given the stated source/actor conditions, when the specified operation or event occurs, then Transaction fault before acceptance has no false success; fault after acceptance leaves effective restriction and durable cleanup.

- **AC26-D16-P10:** Given the stated source/actor conditions, when the specified operation or event occurs, then Two tenants cannot read, redact, change scope, probe receipts or obtain storage content using each other's IDs.

- **AC26-D16-P11:** Given the stated source/actor conditions, when the specified operation or event occurs, then Reader/assignee/follower/requester/CRM owner without redaction capability denied; authorized actor succeeds only in source scope.

Full acceptance suite: AC26-D16-P09, AC26-D16-P10, AC26-D16-P11, AC26-D16-P12, AC26-D16-P13, AC26-D16-P14, AC26-D16-P15, AC26-D16-P16, AC26-D16-P17, AC26-D16-P18, AC26-D16-P19, AC26-D16-P21, AC26-D16-P22, AC26-D16-P23.

Binding primary requirements: REQ26-D16-R08, REQ26-D16-R09, REQ26-D16-R10, REQ26-D16-R11, REQ26-D16-R17, REQ26-D16-R18.

### 79. US26-D16-03 — Preserve independent work and records

As a jointly authorized Support and CRM user, I want to see the same corrected original through every lawful surface, so that redaction neither invents communication nor destroys another owner record.

- **AC26-D16-P20:** Given the stated source/actor conditions, when the specified operation or event occurs, then Merge during review and Undo after removal preserve exact original correction while unaffected originals remain.

- **AC26-D16-P24:** Given the stated source/actor conditions, when the specified operation or event occurs, then All authorized CRM appearances show the same safe source without new communication rows or Party/giving mutation.

- **AC26-D16-P25:** Given the stated source/actor conditions, when the specified operation or event occurs, then Restricted CRM user gets no extra snippet/count/hold details via Support correction; known independent copied note uses its owner.

Full acceptance suite: AC26-D16-P20, AC26-D16-P24, AC26-D16-P25, AC26-D16-P29, AC26-D16-P34.

Binding primary requirements: REQ26-D16-R12, REQ26-D16-R13.

### 80. US26-D16-04 — Keep drafts and outgoing copies safe

As an authorized responder, I want to block restricted derivatives while preserving separable authored work, so that a stale draft or prepared email cannot resend removed data.

- **AC26-D16-P26:** Given the stated source/actor conditions, when the specified operation or event occurs, then Draft, P17 preparation and P6 dispatch races respect source stop and actual in-flight evidence, including sealed mixed-member batches.

- **AC26-D16-P27:** Given the stated source/actor conditions, when the specified operation or event occurs, then Legacy signed URLs/CDN/browser cache and new gateway paths demonstrate the claimed restriction; prior downloads are honestly excluded.

- **AC26-D16-P30:** Given the stated source/actor conditions, when the specified operation or event occurs, then Search/CRM/Recent copy/prepared/export/AI/log owners each provide scoped cleanup evidence; missing owner prevents completion. An exact removed synthetic search value produces no hit/facet/count through the obsolete indexed revision.

Full acceptance suite: AC26-D16-P26, AC26-D16-P27, AC26-D16-P30, AC26-D16-P36.

Binding primary requirements: REQ26-D16-R14, REQ26-D16-R15, REQ26-D16-R16.

### 81. US26-D16-05 — Prove cleanup and lawful recovery

As a privacy or platform operator, I want to inspect minimal custody evidence and reconcile failed copies, so that completion states describe actual removal without recall promises.

- **AC26-D16-P16:** Given the stated source/actor conditions, when the specified operation or event occurs, then Audit/trace/error/job inspection contains no original payload, secret filename/URL, content diff or low-entropy secret hash.

- **AC26-D16-P31:** Given the stated source/actor conditions, when the specified operation or event occurs, then Old-code/new-schema and new-code/old-schema compatibility cannot expose corrected payload; unsupported workers fail safely.

- **AC26-D16-P33:** Given the stated source/actor conditions, when the specified operation or event occurs, then Kill switch stops new disposal without disabling restrictions/recovery; rollback cannot act as Undo.

Full acceptance suite: AC26-D16-P16, AC26-D16-P19, AC26-D16-P31, AC26-D16-P32, AC26-D16-P33, AC26-D16-P37, AC26-D16-P38, AC26-D16-P39, AC26-D16-P40.

Binding primary requirements: REQ26-D16-R19, REQ26-D16-R20, REQ26-D16-R21, REQ26-D16-R22, REQ26-D16-R23, REQ26-D16-R24.

### 82. US26-D17-01 — Publish finite retention policy

As a qualified policy administrator, I want to review and activate finite Days, Months or Years with permitted complete impact, so that existing and future expiry is clear without transcript access.

- **AC26-D17-P01:** Given the stated source/actor conditions, when the specified operation or event occurs, then Configure a blank finite policy, review old/new scope/effects and activate once; no default number or pre-confirmation expiry.

- **AC26-D17-P11:** Given the stated source/actor conditions, when the specified operation or event occurs, then Two concurrent policy edits conflict; identical retry/lost response reconciles one publication; same effective policy is a no-op.

- **AC26-D17-P12:** Given the stated source/actor conditions, when the specified operation or event occurs, then Extension E<d wins over stale old-due projection; no early expiry or destruction.

Full acceptance suite: AC26-D17-P01, AC26-D17-P06, AC26-D17-P10, AC26-D17-P11, AC26-D17-P12, AC26-D17-P13, AC26-D17-P14, AC26-D17-P15, AC26-D17-P20, AC26-D17-P21.

Binding primary requirements: REQ26-D17-R01, REQ26-D17-R02, REQ26-D17-R03, REQ26-D17-R06, REQ26-D17-R08, REQ26-D17-R09, REQ26-D17-R10, REQ26-D17-R11, REQ26-D17-R25.

### 83. US26-D17-02 — Keep content for real work purposes

As a qualified Support purpose owner, I want to base content life and overdue purpose review on original source evidence, so that status cycling and chatter cannot become unlimited custody.

- **AC26-D17-P02:** Given the stated source/actor conditions, when the specified operation or event occurs, then End eligible work; content remains until the approved deadline, then ordinary content expires while permitted facts remain.

- **AC26-D17-P05:** Given the stated source/actor conditions, when the specified operation or event occurs, then Delay P6 acceptance/rejection/unknown evidence: retention admission time stays truthful and delivery metrics stay independent.

- **AC26-D17-P16:** Given the stated source/actor conditions, when the specified operation or event occurs, then Expiry of frontier F includes its human and system/automatic content without automatic content renewing the clock; genuinely new later human message/file is excluded, duplicate old input cannot rehydrate F, and later automatic content cannot invent a fresh lifetime.

Full acceptance suite: AC26-D17-P02, AC26-D17-P03, AC26-D17-P04, AC26-D17-P05, AC26-D17-P06, AC26-D17-P07, AC26-D17-P08, AC26-D17-P09, AC26-D17-P16.

Binding primary requirements: REQ26-D17-R04, REQ26-D17-R05, REQ26-D17-R07.

### 84. US26-D17-03 — Retain useful truthful context after expiry

As a jointly authorized Support and CRM user, I want to see permitted content-free history and handle genuinely new mail, so that continuity does not depend on expired content or stale recipients.

- **AC26-D17-P25:** Given the stated source/actor conditions, when the specified operation or event occurs, then CRM All/Overview/current Support navigation shows one authorized source result with neutral title and accurate old-expired/new-content state.

- **AC26-D17-P30:** Given the stated source/actor conditions, when the specified operation or event occurs, then Old Reply/Reply all cannot reconstruct expired audience from CRM/caches; real new input and deliberate new outbound still work under D2/D12.

- **AC26-D17-P33:** Given the stated source/actor conditions, when the specified operation or event occurs, then Shared receipt bytes remain reachable only through independently authorized owner context; expired Support link cannot bypass expiry or mutate gift/task state.

Full acceptance suite: AC26-D17-P25, AC26-D17-P26, AC26-D17-P27, AC26-D17-P28, AC26-D17-P29, AC26-D17-P30, AC26-D17-P33.

Binding primary requirements: REQ26-D17-R13, REQ26-D17-R14, REQ26-D17-R15, REQ26-D17-R16, REQ26-D17-R18.

### 85. US26-D17-04 — Enforce expiry before cleanup

As a privacy or records operator, I want to end ordinary authority at the exact deadline with actual restricted preservation, so that worker lag and holds cannot fabricate access or deletion.

- **AC26-D17-P17:** Given the stated source/actor conditions, when the specified operation or event occurs, then Hold before/after logical expiry and before/after physical deletion preserves only still-existing required bytes with no ordinary reveal.

- **AC26-D17-P18:** Given the stated source/actor conditions, when the specified operation or event occurs, then Automatic frontier intent reuses D16 source transaction/cleanup; it cannot invoke arbitrary human selection or broaden other domains.

- **AC26-D17-P31:** Given the stated source/actor conditions, when the specified operation or event occurs, then Draft/prepare/dispatch expiry races honor actual P6 linearization, unknown sends, whole-envelope constraints and tighter material purge deadlines.

Full acceptance suite: AC26-D17-P17, AC26-D17-P18, AC26-D17-P19, AC26-D17-P31.

Binding primary requirements: REQ26-D17-R12, REQ26-D17-R17, REQ26-D17-R19.

### 86. US26-D17-05 — Operate complete source retention

As a privacy or platform operator, I want to qualify inventories, source gates, restore barriers and bounded cleanup, so that every surface honors expiry with accountable failure handling.

- **AC26-D17-P22:** Given the stated source/actor conditions, when the specified operation or event occurs, then Direct DB/API mutations cannot change tenant/source/frontier/actor/publicness/policy/hold or restore expired content; USING and WITH CHECK both tested.

- **AC26-D17-P23:** Given the stated source/actor conditions, when the specified operation or event occurs, then Function/view/storage/service-role paths and current revocation enforce the same source/custody boundaries.

- **AC26-D17-P24:** Given the stated source/actor conditions, when the specified operation or event occurs, then Conversation/inbox/Party deletion cannot incidentally remove required expiry/assignment/audit/control facts; no generic cascade used as expiry.

Full acceptance suite: AC26-D17-P22, AC26-D17-P23, AC26-D17-P24, AC26-D17-P32, AC26-D17-P34, AC26-D17-P35, AC26-D17-P36, AC26-D17-P37, AC26-D17-P38, AC26-D17-P39, AC26-D17-P40, AC26-D17-P41, AC26-D17-P42, AC26-D17-P43.

Binding primary requirements: REQ26-D17-R20, REQ26-D17-R21, REQ26-D17-R22, REQ26-D17-R23, REQ26-D17-R24, REQ26-D17-R26.

### 87. US26-D18-01 — Find and personalize useful wording

As a Support responder, I want to find and insert permitted wording in the right mode and language, so that composition is faster without wrong disclosure or CRM mutation.

- **AC26-D18-P01:** Given the stated source/actor conditions, when the specified operation or event occurs, then A permitted staff author creates My wording, finds Shared wording, inserts both and completes one ordinary guarded reply without leaving its CRM/Support context.

- **AC26-D18-P03:** Given the stated source/actor conditions, when the specified operation or event occurs, then Internal-note item cannot be retrieved/inserted through Reply; later mode switch, Replace/Undo and direct external send cannot carry internal-only provenance. Note admission itself uses no outgoing-email preparation; independently authorized post-derived attention retains its P17/P6 boundary. Picking never switches mode or activates mentions.

- **AC26-D18-P06:** Given the stated source/actor conditions, when the specified operation or event occurs, then Late search/insert results cannot move keyboard selection or target another tenant/composer/draft/caret.

Full acceptance suite: AC26-D18-P01, AC26-D18-P02, AC26-D18-P03, AC26-D18-P04, AC26-D18-P05, AC26-D18-P06, AC26-D18-P07, AC26-D18-P08, AC26-D18-P09, AC26-D18-P10, AC26-D18-P11, AC26-D18-P13, AC26-D18-P14, AC26-D18-P15, AC26-D18-P16, AC26-D18-P17, AC26-D18-P31, AC26-D18-P32, AC26-D18-P40, AC26-D18-P41.

Binding primary requirements: REQ26-D18-R01, REQ26-D18-R04, REQ26-D18-R05, REQ26-D18-R07, REQ26-D18-R08, REQ26-D18-R09, REQ26-D18-R10, REQ26-D18-R11, REQ26-D18-R12, REQ26-D18-R19, REQ26-D18-R25, REQ26-D18-R26.

### 88. US26-D18-02 — Save My replies privately

As a Support staff member, I want to save and edit personal wording through the shared authoring owner, so that reusable content remains private without harvesting transcripts.

- **AC26-D18-P01:** Given the stated source/actor conditions, when the specified operation or event occurs, then A permitted staff author creates My wording, finds Shared wording, inserts both and completes one ordinary guarded reply without leaving its CRM/Support context.

- **AC26-D18-P18:** Given the stated source/actor conditions, when the specified operation or event occurs, then Save/offer/import cannot preserve known donor-case payloads, protected links, private notes or expired material as unrestricted reusable wording.

- **AC26-D18-P19:** Given the stated source/actor conditions, when the specified operation or event occurs, then Same global user in two tenants cannot read/use/edit the other membership's personal item, favorites or cached body.

Full acceptance suite: AC26-D18-P01, AC26-D18-P18, AC26-D18-P19, AC26-D18-P20, AC26-D18-P22, AC26-D18-P30, AC26-D18-P34.

Binding primary requirements: REQ26-D18-R02, REQ26-D18-R03, REQ26-D18-R06, REQ26-D18-R18.

### 89. US26-D18-03 — Curate Shared replies deliberately

As a qualified reply curator, I want to review contributions and publish exact Shared revisions and audiences, so that maintained wording has no live personal dependency.

- **AC26-D18-P12:** Given the stated source/actor conditions, when the specified operation or event occurs, then Editing source wording marks declared translations honestly without live replacement or broad automatic withdrawal; safety restriction remains enforceable.

- **AC26-D18-P21:** Given the stated source/actor conditions, when the specified operation or event occurs, then Shared audience and editor scope are actual authorization, including old revisions/search/count/preview/assets. Narrowing denies newly forbidden access; widening qualifies all exposed variants/assets.

- **AC26-D18-P22:** Given the stated source/actor conditions, when the specified operation or event occurs, then My Save is a bounded authoring revision, not a system-template publication or bypass for protected material; Shared uses the correct review floor.

Full acceptance suite: AC26-D18-P12, AC26-D18-P21, AC26-D18-P22, AC26-D18-P25, AC26-D18-P26, AC26-D18-P42.

Binding primary requirements: REQ26-D18-R13, REQ26-D18-R14.

### 90. US26-D18-04 — Retire and restrict wording correctly

As a reply owner or curator, I want to archive, restore or restrict wording and handle departure distinctly, so that ordinary maintenance and safety withdrawal preserve lawful work.

- **AC26-D18-P27:** Given the stated source/actor conditions, when the specified operation or event occurs, then Ordinary Archive stops new picker/insert while safe already-inserted drafts remain usable; Restore revalidates without bypassing safety restriction.

- **AC26-D18-P28:** Given the stated source/actor conditions, when the specified operation or event occurs, then Unsafe-source revocation stops qualifying new preparation/unsubmitted work, honors actual quarantine effect, and leaves possible sends to P6 reconciliation.

- **AC26-D18-P30:** Given the stated source/actor conditions, when the specified operation or event occurs, then Restriction/expiry propagates through known copies, offers, exports/search and restore. Unsent insertion stays draft material, not a new admitted D17 original; independent generalized content follows its own valid owner policy.

Full acceptance suite: AC26-D18-P27, AC26-D18-P28, AC26-D18-P29, AC26-D18-P30, AC26-D18-P37, AC26-D18-P38, AC26-D18-P49.

Binding primary requirements: REQ26-D18-R15, REQ26-D18-R16, REQ26-D18-R17, REQ26-D18-R23, REQ26-D18-R24.

### 91. US26-D18-05 — Operate one secure library

As a Email Studio or Support operator, I want to enforce source, authorization, durable mutation and publication contracts, so that imports, copies and retries cannot create another authority.

- **AC26-D18-P23:** Given the stated source/actor conditions, when the specified operation or event occurs, then Generic DB/API updates cannot change tenant, custodian, scope, actor, purpose or published head into a forbidden state; USING/WITH CHECK and column grants are exercised.

- **AC26-D18-P34:** Given the stated source/actor conditions, when the specified operation or event occurs, then Duplicate/time-out/reordered saves and publications reconcile one durable effect; stale edits cannot overwrite a newer head or different candidate.

- **AC26-D18-P36:** Given the stated source/actor conditions, when the specified operation or event occurs, then Legacy raw HTML/macro/direct routes cannot bypass the owner; existing safe plain reply still uses P17/P6 and Resend.

Full acceptance suite: AC26-D18-P23, AC26-D18-P24, AC26-D18-P33, AC26-D18-P34, AC26-D18-P35, AC26-D18-P36, AC26-D18-P39, AC26-D18-P43, AC26-D18-P44, AC26-D18-P45, AC26-D18-P46, AC26-D18-P47, AC26-D18-P48, AC26-D18-P50.

Binding primary requirements: REQ26-D18-R20, REQ26-D18-R21, REQ26-D18-R22, REQ26-D18-R27, REQ26-D18-R28.

### 92. US26-D19-01 — Maintain viable intake review coverage

As a qualified inbox administrator, I want to choose eligible reviewers, backup and oversight, so that uncertain mail has accountable owners without new access grants.

- **AC26-D19-P01:** Given the stated source/actor conditions, when the specified operation or event occurs, then One small tenant person or one shared team can cover all inboxes; no mandatory hierarchy or second engine.

- **AC26-D19-P02:** Given the stated source/actor conditions, when the specified operation or event occurs, then A reviewer for inbox A cannot list, count, search, inspect or mutate unauthorized B or another tenant through any surface.

- **AC26-D19-P03:** Given the stated source/actor conditions, when the specified operation or event occurs, then Setup rejects missing viable coverage; planned replacement is atomic; security revocation is never blocked.

Full acceptance suite: AC26-D19-P01, AC26-D19-P02, AC26-D19-P03, AC26-D19-P04, AC26-D19-P40.

Binding primary requirements: REQ26-D19-R01, REQ26-D19-R02, REQ26-D19-R03, REQ26-D19-R04.

### 93. US26-D19-02 — Inspect and decide one held input

As an authorized intake reviewer, I want to safely inspect current gates and deliberately Release or Dismiss, so that legitimate work enters without changing future trust or identity.

- **AC26-D19-P05:** Given the stated source/actor conditions, when the specified operation or event occurs, then Multiple gates, spoofed reason text, malicious HTML, bidi/name edge cases and unscanned files retain actual restrictions without executing remote content.

- **AC26-D19-P06:** Given the stated source/actor conditions, when the specified operation or event occurs, then Loading failure, hidden/partial scope and page changes cannot claim zero or leak counts/snippets; screen reader receives accurate status.

- **AC26-D19-P08:** Given the stated source/actor conditions, when the specified operation or event occurs, then One-item destination change does not write future route/trust; future route changes cannot override dismissal or another unresolved gate.

Full acceptance suite: AC26-D19-P05, AC26-D19-P06, AC26-D19-P07, AC26-D19-P08, AC26-D19-P09, AC26-D19-P10, AC26-D19-P11, AC26-D19-P20, AC26-D19-P31, AC26-D19-P38, AC26-D19-P39.

Binding primary requirements: REQ26-D19-R05, REQ26-D19-R06, REQ26-D19-R07, REQ26-D19-R08, REQ26-D19-R09, REQ26-D19-R10, REQ26-D19-R11.

### 94. US26-D19-03 — Recover technical and mistaken decisions

As an authorized reviewer or recovery operator, I want to retry acquisition, cancel pending admission and correct committed mistakes, so that mail is neither lost nor falsely recalled or duplicated.

- **AC26-D19-P12:** Given the stated source/actor conditions, when the specified operation or event occurs, then Technical retry handles safe attachment-only/empty-content distinction, partial files and essential-body failure without safety release or byte loss.

- **AC26-D19-P13:** Given the stated source/actor conditions, when the specified operation or event occurs, then Crash before/after decision/outbox/admission and lost responses reconcile one input/admission effect. Release→Cancel→Release with old/new workers in either order yields only the current eligible admission.

- **AC26-D19-P14:** Given the stated source/actor conditions, when the specified operation or event occurs, then Cross-tenant stored source/inbox/route/team/membership endpoints, null tenant-review scope, invalid states and unsafe parent deletion are rejected; global identity binds through its actual membership.

Full acceptance suite: AC26-D19-P12, AC26-D19-P13, AC26-D19-P14, AC26-D19-P15, AC26-D19-P16, AC26-D19-P17, AC26-D19-P18, AC26-D19-P19, AC26-D19-P20, AC26-D19-P35, AC26-D19-P36.

Binding primary requirements: REQ26-D19-R12, REQ26-D19-R13, REQ26-D19-R14, REQ26-D19-R15, REQ26-D19-R16, REQ26-D19-R17, REQ26-D19-R18.

### 95. US26-D19-04 — Apply honest held-content deadlines

As a intake or records owner, I want to apply the 14-day ordinary and bounded unknown-time recovery contracts, so that review cannot renew content or launder waiting age.

- **AC26-D19-P21:** Given the stated source/actor conditions, when the specified operation or event occurs, then Known receipt yields exact 14×24-hour cutoff; unknown receipt stays separate restricted recovery with once-set trusted recovery anchor,24-hour review and14-day maximum normal recovery access, never fabricated receipt.

- **AC26-D19-P22:** Given the stated source/actor conditions, when the specified operation or event occurs, then Release requested before expiry but admission at/after expiry fails visibly; custody/admission strictly before cutoff uses proper D17 source class once.

- **AC26-D19-P23:** Given the stated source/actor conditions, when the specified operation or event occurs, then Dismiss/Return to review/reads/touches/failed release do not renew cutoff; expired content stays unavailable during cleanup lag.

Full acceptance suite: AC26-D19-P21, AC26-D19-P22, AC26-D19-P23, AC26-D19-P24, AC26-D19-P25, AC26-D19-P26, AC26-D19-P27, AC26-D19-P28.

Binding primary requirements: REQ26-D19-R19, REQ26-D19-R20, REQ26-D19-R21.

### 96. US26-D19-05 — Follow accountable review attention

As an authorized review or oversight staff member, I want to see current coverage, aging and outcomes through source-qualified attention, so that attention reaches its owner without CRM noise.

- **AC26-D19-P29:** Given the stated source/actor conditions, when the specified operation or event occurs, then Held input creates no Party, ordinary CRM timeline/last-contact or giving/care mutation; admitted source appears once only through D9 authority.

- **AC26-D19-P30:** Given the stated source/actor conditions, when the specified operation or event occurs, then CRM merge/deletion/permission loss and recipient changes do not rematch original identity or widen review/notification access.

- **AC26-D19-P31:** Given the stated source/actor conditions, when the specified operation or event occurs, then Dismiss/Release/Retry do not alter sender block/allow, consent, registration, recipient lists, future route or unrelated conversations.

Full acceptance suite: AC26-D19-P29, AC26-D19-P30, AC26-D19-P31, AC26-D19-P32, AC26-D19-P33, AC26-D19-P35.

Binding primary requirements: REQ26-D19-R22, REQ26-D19-R23, REQ26-D19-R24, REQ26-D19-R28.

### 97. US26-D19-06 — Qualify one secure intake path

As a intake platform operator, I want to enforce gates, finite custody and complete bounded migration, so that legacy writers and hostile bursts cannot bypass review.

- **AC26-D19-P14:** Given the stated source/actor conditions, when the specified operation or event occurs, then Cross-tenant stored source/inbox/route/team/membership endpoints, null tenant-review scope, invalid states and unsafe parent deletion are rejected; global identity binds through its actual membership.

- **AC26-D19-P15:** Given the stated source/actor conditions, when the specified operation or event occurs, then Auth ID differs from profile ID; audit records actual trusted tenant membership and rejects spoofed actor/tenant/timestamps.

- **AC26-D19-P19:** Given the stated source/actor conditions, when the specified operation or event occurs, then Concurrent release/dismiss/revoke/retry/expiry and stale policy jobs have one qualified result; revoked deciding-actor authority blocks pending admission while valid earlier admission keeps history.

Full acceptance suite: AC26-D19-P14, AC26-D19-P15, AC26-D19-P16, AC26-D19-P17, AC26-D19-P18, AC26-D19-P19, AC26-D19-P34, AC26-D19-P36, AC26-D19-P37, AC26-D19-P38, AC26-D19-P39, AC26-D19-P40, AC26-D19-P41, AC26-D19-P42.

Binding primary requirements: REQ26-D19-R25, REQ26-D19-R26, REQ26-D19-R27, REQ26-D19-R29, REQ26-D19-R30.

### 98. US26-D20-01 — Open and adjust useful views

As a Support staff member, I want to discover views and change the visible working query temporarily, so that finding work needs no setup or edits to colleagues settings.

- **AC26-D20-P01:** Given the stated source/actor conditions, when the specified operation or event occurs, then Support uses qualified shared named-view/list machinery; other registered subjects and existing CRM private/default behavior remain correct.

- **AC26-D20-P02:** Given the stated source/actor conditions, when the specified operation or event occurs, then First-time staff reach required queues and discover Views without pins or admin setup; My is understood as configuration.

- **AC26-D20-P03:** Given the stated source/actor conditions, when the specified operation or event occurs, then Identical names/criteria retain distinct stable IDs; active status follows selected ID/revision, never first filter match.

Full acceptance suite: AC26-D20-P01, AC26-D20-P02, AC26-D20-P03, AC26-D20-P04, AC26-D20-P05, AC26-D20-P08, AC26-D20-P09, AC26-D20-P10, AC26-D20-P11, AC26-D20-P12, AC26-D20-P27, AC26-D20-P28.

Binding primary requirements: REQ26-D20-R01, REQ26-D20-R02, REQ26-D20-R03, REQ26-D20-R04, REQ26-D20-R06, REQ26-D20-R07, REQ26-D20-R08.

### 99. US26-D20-02 — Save the exact reviewed query

As a Support staff member, I want to save, rename and resolve conflicts on the precise definition, so that scope and another revision cannot change silently.

- **AC26-D20-P06:** Given the stated source/actor conditions, when the specified operation or event occurs, then Save captures reviewed inbox/filter/sort/columns; valid zero result succeeds, failed preview is not zero, lost response reconciles.

- **AC26-D20-P07:** Given the stated source/actor conditions, when the specified operation or event occurs, then Current search literal is visible/included by deliberate review; opt-out updates scope; Shared copy rechecks audience without body harvesting.

- **AC26-D20-P13:** Given the stated source/actor conditions, when the specified operation or event occurs, then Rename B while A/modified filters are active changes only B metadata; criteria change requires B revision and explicit intent.

Full acceptance suite: AC26-D20-P06, AC26-D20-P07, AC26-D20-P13, AC26-D20-P15, AC26-D20-P16.

Binding primary requirements: REQ26-D20-R05, REQ26-D20-R15.

### 100. US26-D20-03 — Maintain Shared views without data grants

As a qualified view maintainer, I want to share, archive and restore definitions separately from personal copies, so that shared navigation never grants protected record access.

- **AC26-D20-P17:** Given the stated source/actor conditions, when the specified operation or event occurs, then Out-of-order save/auto-pin/archive/restore cannot revive stale settings/pins across lifecycle generations; restore returns unpinned, and current actions stay on exact IDs.

- **AC26-D20-P18:** Given the stated source/actor conditions, when the specified operation or event occurs, then Another tenant/member/ordinary curator cannot read/change My metadata, criteria, revisions, pins or counts via any path.

- **AC26-D20-P19:** Given the stated source/actor conditions, when the specified operation or event occurs, then Shared audience and maintenance are separate; ordinary personal-copy edits cannot affect Shared; archive/restore affects navigation honestly.

Full acceptance suite: AC26-D20-P17, AC26-D20-P18, AC26-D20-P19, AC26-D20-P20, AC26-D20-P21, AC26-D20-P22, AC26-D20-P23, AC26-D20-P24, AC26-D20-P25, AC26-D20-P42.

Binding primary requirements: REQ26-D20-R09, REQ26-D20-R10, REQ26-D20-R11, REQ26-D20-R16, REQ26-D20-R17, REQ26-D20-R18, REQ26-D20-R19.

### 101. US26-D20-04 — Personalize navigation and return

As a Support staff member, I want to pin and order my views across devices while preserving source context, so that personal convenience does not alter Shared or CRM defaults.

- **AC26-D20-P14:** Given the stated source/actor conditions, when the specified operation or event occurs, then Personal pin/unpin/reorder and layout persist cross-device without changing Shared definition or Support/CRM defaults.

- **AC26-D20-P26:** Given the stated source/actor conditions, when the specified operation or event occurs, then CRM record history retains D9 anchor; explicit Open in Support preserves return context and creates no CRM/contact/giving event.

- **AC26-D20-P27:** Given the stated source/actor conditions, when the specified operation or event occurs, then D3 status and D14 any-underlying-overdue/uncertainty meaning hold through targets, waits, moves and current queries; no new Due soon.

Full acceptance suite: AC26-D20-P14, AC26-D20-P26, AC26-D20-P27, AC26-D20-P28, AC26-D20-P29, AC26-D20-P30, AC26-D20-P39.

Binding primary requirements: REQ26-D20-R12, REQ26-D20-R20, REQ26-D20-R21.

### 102. US26-D20-05 — Keep live results and action targets truthful

As a Support staff member, I want to see complete authorized matches and stable selected IDs, so that live updates cannot hide work or retarget my command.

- **AC26-D20-P10:** Given the stated source/actor conditions, when the specified operation or event occurs, then Result preview/rows/matching counts/pages agree beyond the old 2,000 cap; independently authorized facet options still allow adding alternatives under Any.

- **AC26-D20-P20:** Given the stated source/actor conditions, when the specified operation or event occurs, then Hidden CRM predicate/sort/facet/count cannot infer protected facts; definition audience never grants source access.

- **AC26-D20-P25:** Given the stated source/actor conditions, when the specified operation or event occurs, then URL/query/revision search literals cannot leak through logs/referrers/unauthorized history or be executed as SQL/HTML/template instructions.

Full acceptance suite: AC26-D20-P10, AC26-D20-P11, AC26-D20-P12, AC26-D20-P20, AC26-D20-P25, AC26-D20-P29, AC26-D20-P30, AC26-D20-P31, AC26-D20-P33.

Binding primary requirements: REQ26-D20-R13, REQ26-D20-R14, REQ26-D20-R23, REQ26-D20-R24.

### 103. US26-D20-06 — Operate reliable view definitions

As a shared-view platform operator, I want to secure mutations and repair or migrate exact meaning, so that query convenience stays bounded and is not an action engine.

- **AC26-D20-P16:** Given the stated source/actor conditions, when the specified operation or event occurs, then Concurrent saves/retries preserve one accepted revision and explicit conflict; changed-payload reuse conflicts, updates cannot create missing IDs, and old receipts cannot revive later archive.

- **AC26-D20-P17:** Given the stated source/actor conditions, when the specified operation or event occurs, then Out-of-order save/auto-pin/archive/restore cannot revive stale settings/pins across lifecycle generations; restore returns unpinned, and current actions stay on exact IDs.

- **AC26-D20-P18:** Given the stated source/actor conditions, when the specified operation or event occurs, then Another tenant/member/ordinary curator cannot read/change My metadata, criteria, revisions, pins or counts via any path.

Full acceptance suite: AC26-D20-P16, AC26-D20-P17, AC26-D20-P18, AC26-D20-P21, AC26-D20-P22, AC26-D20-P23, AC26-D20-P24, AC26-D20-P32, AC26-D20-P34, AC26-D20-P35, AC26-D20-P36, AC26-D20-P37, AC26-D20-P38, AC26-D20-P40, AC26-D20-P41, AC26-D20-P42, AC26-D20-P43, AC26-D20-P44.

Binding primary requirements: REQ26-D20-R22, REQ26-D20-R25, REQ26-D20-R26, REQ26-D20-R27, REQ26-D20-R28.

### 104. US26-D21-01 — Apply optional readable labels

As an authorized Support staff member, I want to apply or remove labels on exact current source scope, so that categorization does not become another status or access rule.

- **AC26-D21-P01:** Given the stated source/actor conditions, when the specified operation or event occurs, then Zero labels permits intake, reply, handoff and valid Resolve; no default/catch-all/required taxonomy appears in any route.

- **AC26-D21-P09:** Given the stated source/actor conditions, when the specified operation or event occurs, then Failure at every boundary yields either no effect or one atomic committed membership/history/receipt, with truthful recovery after lost response.

- **AC26-D21-P10:** Given the stated source/actor conditions, when the specified operation or event occurs, then Repeated same Add/Remove is idempotent; changed payload/key conflicts; retry old Add after later Remove reports receipt/current state without resurrection.

Full acceptance suite: AC26-D21-P01, AC26-D21-P02, AC26-D21-P09, AC26-D21-P10, AC26-D21-P11, AC26-D21-P18, AC26-D21-P19, AC26-D21-P28.

Binding primary requirements: REQ26-D21-R01, REQ26-D21-R02, REQ26-D21-R04, REQ26-D21-R05, REQ26-D21-R06, REQ26-D21-R10, REQ26-D21-R11, REQ26-D21-R12.

### 105. US26-D21-02 — Maintain a stable vocabulary

As a qualified label maintainer, I want to create, rename, archive and restore terms distinctly, so that existing assignments remain understandable without reclassification.

- **AC26-D21-P03:** Given the stated source/actor conditions, when the specified operation or event occurs, then One Support catalog/source owner; no duplicated Party state, per-record catalog, new taxonomy service or unrelated CRM permission requirement.

- **AC26-D21-P05:** Given the stated source/actor conditions, when the specified operation or event occurs, then Concurrent same-name creation yields one identity or clear conflict, including archived names; no implicit merge, silent truncation or empty-slug failure.

- **AC26-D21-P06:** Given the stated source/actor conditions, when the specified operation or event occurs, then Edit selected B cannot save A's form; name-only edits preserve IDs/meaning/references and enforce revision conflicts without losing input.

Full acceptance suite: AC26-D21-P03, AC26-D21-P04, AC26-D21-P05, AC26-D21-P06, AC26-D21-P07, AC26-D21-P08, AC26-D21-P11, AC26-D21-P35.

Binding primary requirements: REQ26-D21-R03, REQ26-D21-R07, REQ26-D21-R08, REQ26-D21-R09.

### 106. US26-D21-03 — Use label views and reports honestly

As an authorized reporting user, I want to filter exact current membership and understand historical limits, so that renames, merges and archives cannot improve old outcomes.

- **AC26-D21-P20:** Given the stated source/actor conditions, when the specified operation or event occurs, then Any/All/No labels results and counts match complete authorized memberships including archived; unavailable metadata/ref never drops predicates or becomes false zero.

- **AC26-D21-P22:** Given the stated source/actor conditions, when the specified operation or event occurs, then Label edits/no-op retries do not alter D14 reply outcomes, D15 followed-update attention, D17 retention anchors or actual message timestamps.

- **AC26-D21-P23:** Given the stated source/actor conditions, when the specified operation or event occurs, then Report cohort, timezone bounds, merge deduplication, N/L/U, overlap percentages, empty and incomplete states agree between table/chart/drilldown/export.

Full acceptance suite: AC26-D21-P20, AC26-D21-P22, AC26-D21-P23, AC26-D21-P31.

Binding primary requirements: REQ26-D21-R15, REQ26-D21-R16, REQ26-D21-R17.

### 107. US26-D21-04 — Preserve label privacy across surfaces

As a jointly authorized CRM and Support user, I want to see only permitted source labels, so that labels cannot tag CRM people, send email or grant rights.

- **AC26-D21-P12:** Given the stated source/actor conditions, when the specified operation or event occurs, then Catalog reader/applicator/maintainer/exporter privileges are separate; D18/D19/D20 capabilities grant no implicit management.

- **AC26-D21-P13:** Given the stated source/actor conditions, when the specified operation or event occurs, then Cross-tenant label, conversation, actor, role, endpoint and lifecycle spoofing fail at API and database; a permitted update cannot move an edge to forbidden scope.

- **AC26-D21-P15:** Given the stated source/actor conditions, when the specified operation or event occurs, then Revoked permissions during picker/search/mutation/history/export prevent disclosure/effect; failure responses do not reveal hidden resources or raw protected input.

Full acceptance suite: AC26-D21-P12, AC26-D21-P13, AC26-D21-P14, AC26-D21-P15, AC26-D21-P16, AC26-D21-P17, AC26-D21-P21, AC26-D21-P24, AC26-D21-P25, AC26-D21-P27.

Binding primary requirements: REQ26-D21-R13, REQ26-D21-R14, REQ26-D21-R18, REQ26-D21-R19.

### 108. US26-D21-05 — Operate reliable label membership

As a Support platform operator, I want to secure atomic changes and complete bounded queries, so that races, migration and restore cannot corrupt source membership.

- **AC26-D21-P09:** Given the stated source/actor conditions, when the specified operation or event occurs, then Failure at every boundary yields either no effect or one atomic committed membership/history/receipt, with truthful recovery after lost response.

- **AC26-D21-P10:** Given the stated source/actor conditions, when the specified operation or event occurs, then Repeated same Add/Remove is idempotent; changed payload/key conflicts; retry old Add after later Remove reports receipt/current state without resurrection.

- **AC26-D21-P11:** Given the stated source/actor conditions, when the specified operation or event occurs, then Apply versus Archive/Restore/permission change has one valid ordered outcome; old pre-archive intents cannot become valid after restore.

Full acceptance suite: AC26-D21-P09, AC26-D21-P10, AC26-D21-P11, AC26-D21-P13, AC26-D21-P14, AC26-D21-P16, AC26-D21-P26, AC26-D21-P29, AC26-D21-P30, AC26-D21-P32, AC26-D21-P33, AC26-D21-P34, AC26-D21-P36.

Binding primary requirements: REQ26-D21-R11, REQ26-D21-R12, REQ26-D21-R13, REQ26-D21-R14, REQ26-D21-R20, REQ26-D21-R21, REQ26-D21-R22, REQ26-D21-R23, REQ26-D21-R24.

### 109. US26-D22-01 — Search authorized content literally

As a Support staff member, I want to search supported source words and phrases predictably, so that real work is discoverable without hidden extra corpora.

- **AC26-D22-P01:** Given the stated source/actor conditions, when the specified operation or event occurs, then Only selected A source types participate; attachment contents, OCR, AI, drafts, raw evidence, library and Recent-only terms yield no ordinary match.

- **AC26-D22-P03:** Given the stated source/actor conditions, when the specified operation or event occurs, then All fragments match within one eligible item; words split across subject/name or different messages do not fabricate a result.

- **AC26-D22-P04:** Given the stated source/actor conditions, when the specified operation or event occurs, then Straight/curly phrases, apostrophes, escaped quotes/backslashes, literal OR/NOT/%/\_/punctuation and malformed quotes follow the specified grammar.

Full acceptance suite: AC26-D22-P01, AC26-D22-P03, AC26-D22-P04, AC26-D22-P05, AC26-D22-P07, AC26-D22-P09, AC26-D22-P10, AC26-D22-P11, AC26-D22-P12, AC26-D22-P15, AC26-D22-P22.

Binding primary requirements: REQ26-D22-R01, REQ26-D22-R02, REQ26-D22-R03, REQ26-D22-R04, REQ26-D22-R05, REQ26-D22-R06, REQ26-D22-R07.

### 110. US26-D22-02 — Open the exact match

As a Support staff member, I want to understand the match and navigate to its source in context, so that search does not grant file, CRM or business authority.

- **AC26-D22-P08:** Given the stated source/actor conditions, when the specified operation or event occurs, then Highlights map to original visible graphemes; no synthetic quote or removed text, even after Unicode normalization or source revision.

- **AC26-D22-P19:** Given the stated source/actor conditions, when the specified operation or event occurs, then CRM linked through B cannot match A-only history; broader handling is deliberate and independently authorized.

- **AC26-D22-P31:** Given the stated source/actor conditions, when the specified operation or event occurs, then Query generations, live reordering and pagination cannot retarget an opened conversation, draft or explicit bulk IDs; Refresh is truthful.

Full acceptance suite: AC26-D22-P08, AC26-D22-P18, AC26-D22-P19, AC26-D22-P23, AC26-D22-P24, AC26-D22-P26, AC26-D22-P27, AC26-D22-P28, AC26-D22-P29, AC26-D22-P31, AC26-D22-P32, AC26-D22-P37.

Binding primary requirements: REQ26-D22-R08, REQ26-D22-R09, REQ26-D22-R17, REQ26-D22-R19, REQ26-D22-R20, REQ26-D22-R21, REQ26-D22-R22.

### 111. US26-D22-03 — Exclude restricted sources from discovery

As a source-authorized user, I want to have current permission applied before matches, counts and excerpts, so that indexes and stale browsers cannot reveal inaccessible content.

- **AC26-D22-P02:** Given the stated source/actor conditions, when the specified operation or event occurs, then One Support source/query owner and shared list/definition contract; no CRM corpus copy or second external search authority.

- **AC26-D22-P17:** Given the stated source/actor conditions, when the specified operation or event occurs, then Query handles/cache/late results cannot cross tenant/user/acting-scope change; expired handle is unavailable rather than All.

- **AC26-D22-P20:** Given the stated source/actor conditions, when the specified operation or event occurs, then Redaction/expiry/reclassification fence every hit/count/rank/snippet/filename before physical purge; old workers cannot revive them.

Full acceptance suite: AC26-D22-P02, AC26-D22-P13, AC26-D22-P14, AC26-D22-P16, AC26-D22-P17, AC26-D22-P20, AC26-D22-P33.

Binding primary requirements: REQ26-D22-R10, REQ26-D22-R11, REQ26-D22-R12, REQ26-D22-R13, REQ26-D22-R14, REQ26-D22-R18.

### 112. US26-D22-04 — Recover complete bounded search

As a search platform operator, I want to build and query current source projections with honest incomplete states, so that lag and limits cannot masquerade as no results.

- **AC26-D22-P06:** Given the stated source/actor conditions, when the specified operation or event occurs, then Exact input 256-scalar/1,024-byte/16-atom boundaries and normalization expansion limits validate identically at UI/API; no silent truncation.

- **AC26-D22-P21:** Given the stated source/actor conditions, when the specified operation or event occurs, then Restored DB/index/cache backups apply current withdrawal and source-revision barriers before serving.

- **AC26-D22-P25:** Given the stated source/actor conditions, when the specified operation or event occurs, then Complete query predicates precede cap/count/page; timeout/backlog/oversize unit is distinct from exact zero and no hidden tail is omitted.

Full acceptance suite: AC26-D22-P06, AC26-D22-P21, AC26-D22-P25, AC26-D22-P30, AC26-D22-P34, AC26-D22-P35, AC26-D22-P36, AC26-D22-P39, AC26-D22-P40.

Binding primary requirements: REQ26-D22-R15, REQ26-D22-R16, REQ26-D22-R24, REQ26-D22-R25, REQ26-D22-R26.

### 113. US26-D22-05 — Keep future search governed

As a platform capability owner, I want to preserve explicit indexing and source authority before extending search, so that ordinary search does not authorize AI or future corpora.

- **AC26-D22-P38:** Given the stated source/actor conditions, when the specified operation or event occurs, then Future-AI intent is recorded but no vectors, extraction, model/provider/egress key path, AI prompt or autonomous action runs now.

Full acceptance suite: AC26-D22-P38.

Binding primary requirements: REQ26-D22-R23.

### 114. US26-D23-01 — Use the correct professional signature

As a Support responder, I want to see one eligible managed signature copy and refresh it deliberately, so that actual public identity is clear without silent message changes.

- **AC26-D23-P01:** Given the stated source/actor conditions, when the specified operation or event occurs, then One ordinary qualified responder replies with the approved personal name and team details without per-reply setup; team-only works when configured.

- **AC26-D23-P03:** Given the stated source/actor conditions, when the specified operation or event occurs, then Copy-in pins exact source revision; updating shared source cannot mutate existing draft, publication or admitted history.

- **AC26-D23-P06:** Given the stated source/actor conditions, when the specified operation or event occurs, then Public-name edit leaves legal/auth/Party full name and contact data unchanged; allowed self-edit and denied cross-member/tenant mutation.

Full acceptance suite: AC26-D23-P01, AC26-D23-P02, AC26-D23-P03, AC26-D23-P04, AC26-D23-P05, AC26-D23-P06, AC26-D23-P07, AC26-D23-P08, AC26-D23-P09, AC26-D23-P14, AC26-D23-P26, AC26-D23-P31, AC26-D23-P43.

Binding primary requirements: REQ26-D23-R01, REQ26-D23-R02, REQ26-D23-R03, REQ26-D23-R07, REQ26-D23-R08, REQ26-D23-R09, REQ26-D23-R10, REQ26-D23-R11, REQ26-D23-R12.

### 115. US26-D23-02 — Maintain signatures in Email Studio

As a qualified signature author or inbox administrator, I want to save, publish and apply exact revisions with distinct rights, so that private values are not published with shared content.

- **AC26-D23-P10:** Given the stated source/actor conditions, when the specified operation or event occurs, then Add/edit/duplicate/find/cancel/return preserve correct source, private draft and focus; metadata never appears as recipient content accidentally.

- **AC26-D23-P11:** Given the stated source/actor conditions, when the specified operation or event occurs, then Autosave success, failure, offline, uncertain response, stale response and conflict show truthful state without lost newer work.

- **AC26-D23-P12:** Given the stated source/actor conditions, when the specified operation or event occurs, then Save, publish and apply have separate outcomes; publishing sends nothing, preserves original head on failure and exposes exact impact.

Full acceptance suite: AC26-D23-P10, AC26-D23-P11, AC26-D23-P12, AC26-D23-P13, AC26-D23-P15, AC26-D23-P18, AC26-D23-P27, AC26-D23-P29, AC26-D23-P30.

Binding primary requirements: REQ26-D23-R04, REQ26-D23-R05, REQ26-D23-R06, REQ26-D23-R20.

### 116. US26-D23-03 — Compose with canonical rich text

As a Support author, I want to use bounded Tiptap profiles with validation and durable editing, so that meaning survives modes, errors, devices and upgrades.

- **AC26-D23-P20:** Given the stated source/actor conditions, when the specified operation or event occurs, then Unknown nodes/marks/attrs/positions/protected metadata fail before parser normalization; invalid content cannot autosave a stripped replacement.

- **AC26-D23-P22:** Given the stated source/actor conditions, when the specified operation or event occurs, then Document byte/depth/node/value and asset limits pass exact maximum and reject over-limit before expensive work, with useful errors.

- **AC26-D23-P23:** Given the stated source/actor conditions, when the specified operation or event occurs, then Canonical structured document, HTML and plain text have the same allowed identity/meaning; caller HTML/text cannot override the document.

Full acceptance suite: AC26-D23-P20, AC26-D23-P21, AC26-D23-P22, AC26-D23-P23, AC26-D23-P24, AC26-D23-P25, AC26-D23-P33, AC26-D23-P34, AC26-D23-P35, AC26-D23-P36, AC26-D23-P41.

Binding primary requirements: REQ26-D23-R13, REQ26-D23-R14, REQ26-D23-R15, REQ26-D23-R16, REQ26-D23-R23, REQ26-D23-R24, REQ26-D23-R25.

### 117. US26-D23-04 — Preserve source and identity authority

As a Email Studio or Support operator, I want to enforce source, responder, asset and draft boundaries through delivery, so that templates and stale tabs cannot rewrite history or disclose another identity.

- **AC26-D23-P15:** Given the stated source/actor conditions, when the specified operation or event occurs, then Use/author/publish/review/inbox-config/send capabilities are independently allowed/denied through UI, API and direct database paths.

- **AC26-D23-P18:** Given the stated source/actor conditions, when the specified operation or event occurs, then One effective binding and valid lifecycle/cardinality hold under concurrent default writes; failures do not leave unintended no-default state.

- **AC26-D23-P19:** Given the stated source/actor conditions, when the specified operation or event occurs, then Signature editor cannot create recipients, header changes, notes, acknowledgements, CRM updates, AI calls or provider sends.

Full acceptance suite: AC26-D23-P15, AC26-D23-P16, AC26-D23-P17, AC26-D23-P18, AC26-D23-P19, AC26-D23-P27, AC26-D23-P28, AC26-D23-P31, AC26-D23-P32, AC26-D23-P37, AC26-D23-P38, AC26-D23-P42.

Binding primary requirements: REQ26-D23-R17, REQ26-D23-R18, REQ26-D23-R19, REQ26-D23-R21, REQ26-D23-R22.

### 118. US26-D23-05 — Qualify editor and email output

As a product release owner, I want to prove actual browser authoring and email rendering before rollout, so that a polished editor is not mistaken for delivered output proof.

- **AC26-D23-P33:** Given the stated source/actor conditions, when the specified operation or event occurs, then Actual Tiptap/React Email dependency closure and peers are qualified; no unsupported duplicate runtime or silent package upgrade.

- **AC26-D23-P34:** Given the stated source/actor conditions, when the specified operation or event occurs, then Keyboard/screen-reader/accessible-outline authoring, variables, logo, save/review/publish and context return complete without drag/hover dependency.

- **AC26-D23-P35:** Given the stated source/actor conditions, when the specified operation or event occurs, then Narrow/mobile/IME/virtual-keyboard/zoom/focus/low-bandwidth journeys preserve work and readable signature; static history avoids editor proliferation.

Full acceptance suite: AC26-D23-P33, AC26-D23-P34, AC26-D23-P35, AC26-D23-P36, AC26-D23-P38, AC26-D23-P39, AC26-D23-P40, AC26-D23-P41, AC26-D23-P43, AC26-D23-P44.

Binding primary requirements: REQ26-D23-R26, REQ26-D23-R27, REQ26-D23-R28.

### 119. US26-D24-01 — Stage a useful reply-and-work shortcut

As a Support responder, I want to preview one shortcut and stage visible wording and work intent, so that repetitive entry falls without hidden execution or stacked plans.

- **AC26-D24-P01:** Given the stated source/actor conditions, when the specified operation or event occurs, then A qualified staff member selects a curated reply shortcut, edits wording and admits one reply with the reviewed Support changes; no extra routine publication step.

- **AC26-D24-P09:** Given the stated source/actor conditions, when the specified operation or event occurs, then Only one plan can be staged; conflicting status/handling/label requests cannot stack or silently overwrite.

- **AC26-D24-P13:** Given the stated source/actor conditions, when the specified operation or event occurs, then Detach, mode change, navigation and restore cannot execute or leak a plan; detached copied wording retains source restrictions.

Full acceptance suite: AC26-D24-P01, AC26-D24-P02, AC26-D24-P03, AC26-D24-P04, AC26-D24-P05, AC26-D24-P06, AC26-D24-P07, AC26-D24-P08, AC26-D24-P09, AC26-D24-P10, AC26-D24-P11, AC26-D24-P12, AC26-D24-P13, AC26-D24-P14, AC26-D24-P15, AC26-D24-P19.

Binding primary requirements: REQ26-D24-R01, REQ26-D24-R02, REQ26-D24-R03, REQ26-D24-R05, REQ26-D24-R07, REQ26-D24-R08, REQ26-D24-R09, REQ26-D24-R10, REQ26-D24-R11.

### 120. US26-D24-02 — Admit reply and work together

As an authorized responder, I want to review and send one complete current compound command, so that partial writes and uncertain delivery cannot contradict work state.

- **AC26-D24-P16:** Given the stated source/actor conditions, when the specified operation or event occurs, then Shortcut, source/asset, inbox, CRM-context and action scopes intersect on all APIs/reads/counts/targets; no cross-tenant or hidden-source leakage.

- **AC26-D24-P17:** Given the stated source/actor conditions, when the specified operation or event occurs, then Actual responder differs from assignee/CRM owner; Me uses trusted membership; target identity cannot be forged or matched by email.

- **AC26-D24-P18:** Given the stated source/actor conditions, when the specified operation or event occurs, then Tenant/account/conversation switch or late async result cannot personalize a new context with the previous donor's values.

Full acceptance suite: AC26-D24-P16, AC26-D24-P17, AC26-D24-P18, AC26-D24-P19, AC26-D24-P20, AC26-D24-P21, AC26-D24-P22, AC26-D24-P23, AC26-D24-P24, AC26-D24-P25, AC26-D24-P26, AC26-D24-P27, AC26-D24-P32, AC26-D24-P36.

Binding primary requirements: REQ26-D24-R12, REQ26-D24-R13, REQ26-D24-R14, REQ26-D24-R15, REQ26-D24-R21.

### 121. US26-D24-03 — Curate exact shortcut revisions

As a qualified shortcut curator, I want to select published wording and activate or repair the reviewed combination, so that wording publication and Support activation remain independent.

- **AC26-D24-P28:** Given the stated source/actor conditions, when the specified operation or event occurs, then Save wording, publish wording, save shortcut and activate shortcut have separate permissions/effects; partial contextual publish/activate success is truthful.

- **AC26-D24-P29:** Given the stated source/actor conditions, when the specified operation or event occurs, then Draft edit/duplicate/activate and expected-head races preserve the prior valid active revision; source upgrades require reviewed selection.

- **AC26-D24-P30:** Given the stated source/actor conditions, when the specified operation or event occurs, then Broken dependencies do not prevent Archive; Restore checks current meaning; routine archive differs from restriction and does not rewrite valid staged work.

Full acceptance suite: AC26-D24-P28, AC26-D24-P29, AC26-D24-P30, AC26-D24-P34, AC26-D24-P44.

Binding primary requirements: REQ26-D24-R04, REQ26-D24-R06, REQ26-D24-R16, REQ26-D24-R17, REQ26-D24-R18, REQ26-D24-R19.

### 122. US26-D24-04 — Inspect use and protect copied sources

As an authorized curator or operator, I want to see accurate admitted-use evidence and preserve current restrictions, so that statistics and portability cannot create a second transcript archive.

- **AC26-D24-P31:** Given the stated source/actor conditions, when the specified operation or event occurs, then Effective RLS USING/WITH CHECK, grants, columns, views, RPC/definer/service and direct routes prevent tenant/purpose/custody/actor/publication transformation.

- **AC26-D24-P33:** Given the stated source/actor conditions, when the specified operation or event occurs, then Authoring preview uses synthetic data; draft/export/maintenance history does not leak live resolved values or personal My replies.

- **AC26-D24-P34:** Given the stated source/actor conditions, when the specified operation or event occurs, then Maintainer/assignee/source-owner departure and same-email reuse preserve tenant custody while revoking actual access and flagging invalid targets.

Full acceptance suite: AC26-D24-P31, AC26-D24-P33, AC26-D24-P34, AC26-D24-P35, AC26-D24-P37, AC26-D24-P38, AC26-D24-P45, AC26-D24-P46, AC26-D24-P49.

Binding primary requirements: REQ26-D24-R20, REQ26-D24-R22, REQ26-D24-R23.

### 123. US26-D24-05 — Qualify bounded shortcuts and later AI

As a product release owner, I want to prove current fixed presets while reserving AI for later qualification, so that the feature stays a clear human tool rather than a workflow engine.

- **AC26-D24-P39:** Given the stated source/actor conditions, when the specified operation or event occurs, then Legacy raw content/mixed actions convert only to inactive eligible candidates; unsupported steps are not silently removed and activated.

- **AC26-D24-P40:** Given the stated source/actor conditions, when the specified operation or event occurs, then Mixed-version rollout fences all old macro/client/automatic writers; new draft cannot execute through the old loop.

- **AC26-D24-P47:** Given the stated source/actor conditions, when the specified operation or event occurs, then Current implementation has no AI provider/index/egress/background mining; future integration cannot bypass source/indexing/tenant/identity gates.

Full acceptance suite: AC26-D24-P39, AC26-D24-P40, AC26-D24-P41, AC26-D24-P42, AC26-D24-P43, AC26-D24-P47, AC26-D24-P48, AC26-D24-P50.

Binding primary requirements: REQ26-D24-R24, REQ26-D24-R25, REQ26-D24-R26, REQ26-D24-R27, REQ26-D24-R28, REQ26-D24-R29, REQ26-D24-R30.

### 124. US26-D25-01 — Complete the appropriate receiving path

As a Support administrator, I want to use an existing or dedicated address in a resumable journey, so that ordinary mail remains intact and external actions are clear.

- **AC26-D25-P01:** Given the stated source/actor conditions, when the specified operation or event occurs, then Equal initial choices lead to complete existing/new paths; neither forces an unsuitable address or asks for protocol knowledge.

- **AC26-D25-P02:** Given the stated source/actor conditions, when the specified operation or event occurs, then Both paths reuse one qualified tenant receiving product with no mailbox sync/history import/AI/provider expansion.

- **AC26-D25-P03:** Given the stated source/actor conditions, when the specified operation or event occurs, then Public address/inbox/team/From/Reply-To/CRM identity remain separate; mixed sensitive mailbox is not silently shared.

Full acceptance suite: AC26-D25-P01, AC26-D25-P02, AC26-D25-P03, AC26-D25-P04, AC26-D25-P07, AC26-D25-P08, AC26-D25-P09, AC26-D25-P10.

Binding primary requirements: REQ26-D25-R01, REQ26-D25-R02, REQ26-D25-R03, REQ26-D25-R04, REQ26-D25-R08, REQ26-D25-R09, REQ26-D25-R10.

### 125. US26-D25-02 — Prove actual addresses and message paths

As a qualified email administrator, I want to verify separate current receiving, public-destination and reply-return facts, so that activation depends on controlled evidence rather than a badge.

- **AC26-D25-P05:** Given the stated source/actor conditions, when the specified operation or event occurs, then Wrong/forged tenant tags/metadata/domain/headers cannot change authenticated connection scope; ambiguous owner is not exposed.

- **AC26-D25-P06:** Given the stated source/actor conditions, when the specified operation or event occurs, then Contradictory To/Cc/Bcc/Received/received_for/thread refs/plus tokens cannot choose an arbitrary source/inbox.

- **AC26-D25-P11:** Given the stated source/actor conditions, when the specified operation or event occurs, then Managed-route P17 proof and external-mailbox challenge cannot substitute for each other; own code receipt cannot self-confirm access.

Full acceptance suite: AC26-D25-P05, AC26-D25-P06, AC26-D25-P11, AC26-D25-P12, AC26-D25-P13, AC26-D25-P14, AC26-D25-P15, AC26-D25-P33.

Binding primary requirements: REQ26-D25-R07, REQ26-D25-R11, REQ26-D25-R12, REQ26-D25-R13, REQ26-D25-R14.

### 126. US26-D25-03 — Maintain routes without losing mail

As a qualified inbox administrator, I want to activate, replace, pause, repair or retire exact routes, so that earlier input and unknown sends stay accountable.

- **AC26-D25-P14:** Given the stated source/actor conditions, when the specified operation or event occurs, then Activation commits binding/history/continuation atomically or changes none; conflicting proof/capability/address fails safely.

- **AC26-D25-P16:** Given the stated source/actor conditions, when the specified operation or event occurs, then Early input reconciles completely under current source/D19 gates with original received/expiry/D13 utility/D14 obligation meaning intact.

- **AC26-D25-P19:** Given the stated source/actor conditions, when the specified operation or event occurs, then Per-inbox pause does not disable tenant-wide sending/SMTP custody or close work; failure types have distinct repair.

Full acceptance suite: AC26-D25-P14, AC26-D25-P16, AC26-D25-P17, AC26-D25-P18, AC26-D25-P19, AC26-D25-P20, AC26-D25-P22, AC26-D25-P23, AC26-D25-P29, AC26-D25-P37.

Binding primary requirements: REQ26-D25-R15, REQ26-D25-R16, REQ26-D25-R17, REQ26-D25-R18, REQ26-D25-R19, REQ26-D25-R20.

### 127. US26-D25-04 — Isolate provider authority

As a integration security operator, I want to bind distinct incoming and outgoing credential purposes to one proved account, so that receiving access cannot become a privileged sender or tenant selector.

- **AC26-D25-P21:** Given the stated source/actor conditions, when the specified operation or event occurs, then Incoming Full-access key is separate, encrypted, server-confined and rejected by every outbound/generic-proxy path.

- **AC26-D25-P24:** Given the stated source/actor conditions, when the specified operation or event occurs, then Tenant/account/environment composite FKs and trusted immutable creator/current actor evidence resist reparent/forgery.

- **AC26-D25-P27:** Given the stated source/actor conditions, when the specified operation or event occurs, then Effective RLS/grants/views/RPC/definer/service/storage and all direct writers enforce old/new-row and column boundaries.

Full acceptance suite: AC26-D25-P21, AC26-D25-P24, AC26-D25-P27, AC26-D25-P28, AC26-D25-P34, AC26-D25-P39, AC26-D25-P40.

Binding primary requirements: REQ26-D25-R05, REQ26-D25-R06, REQ26-D25-R22, REQ26-D25-R23, REQ26-D25-R28.

### 128. US26-D25-05 — Recover and dispose setup material

As a intake or platform operator, I want to reconcile input and provider failures under finite custody, so that retries and restore cannot renew content or fake verification.

- **AC26-D25-P25:** Given the stated source/actor conditions, when the specified operation or event occurs, then Large pending sets filter before pagination, resume deterministically and do not lose matching items beyond first batch.

- **AC26-D25-P26:** Given the stated source/actor conditions, when the specified operation or event occurs, then Failure after each local write/receipt/outbox point cannot leave falsely resolved input or missing authoritative audit.

- **AC26-D25-P32:** Given the stated source/actor conditions, when the specified operation or event occurs, then Giving/receipt/care actions, D13 confirmations, D23 signatures and D24 shortcuts retain owner authority; verification cannot invoke them.

Full acceptance suite: AC26-D25-P25, AC26-D25-P26, AC26-D25-P31, AC26-D25-P32, AC26-D25-P35, AC26-D25-P36, AC26-D25-P37, AC26-D25-P40, AC26-D25-P41, AC26-D25-P47, AC26-D25-P48, AC26-D25-P49.

Binding primary requirements: REQ26-D25-R21, REQ26-D25-R24, REQ26-D25-R25, REQ26-D25-R27.

### 129. US26-D25-06 — Qualify both setup paths

As a product release owner, I want to prove actual provider capability, complete tasks and operating limits, so that unsupported assumptions do not reach real tenants.

- **AC26-D25-P30:** Given the stated source/actor conditions, when the specified operation or event occurs, then Keyboard/touch/AT/zoom/reflow/IME/low-bandwidth both-path journeys expose all states/actions and return focus correctly.

- **AC26-D25-P38:** Given the stated source/actor conditions, when the specified operation or event occurs, then Registered resource/rate/quota/transaction/query bounds hold under exact boundaries, skewed tenants and concurrent inboxes.

- **AC26-D25-P42:** Given the stated source/actor conditions, when the specified operation or event occurs, then Legacy mappings backfill only evidenced facts; unknown/ambiguous data stays repairable without fabricated verification.

Full acceptance suite: AC26-D25-P30, AC26-D25-P38, AC26-D25-P42, AC26-D25-P43, AC26-D25-P44, AC26-D25-P45, AC26-D25-P46, AC26-D25-P50.

Binding primary requirements: REQ26-D25-R26, REQ26-D25-R29, REQ26-D25-R30, REQ26-D25-R31, REQ26-D25-R32.

### 130. US26-D26-01 — Record a real non-email Support need

As a Support or CRM staff member, I want to record one bounded request from either surface, so that work capture needs no second call log or forced identity.

- **AC26-D26-P01:** Given the stated source/actor conditions, when the specified operation or event occurs, then A received phone/in-person Support need is recordable; ordinary calls/tasks/care do not automatically create Support.

- **AC26-D26-P02:** Given the stated source/actor conditions, when the specified operation or event occurs, then Support-first and CRM-first use one source/command/detail identity with no mandatory Party, email or prior generic interaction.

- **AC26-D26-P03:** Given the stated source/actor conditions, when the specified operation or event occurs, then Record request creates no requester email, fictional mail event, D13 acknowledgement, auto-Party, optional follow or duplicate task; independently qualified staff attention retains its actual owner policy.

Full acceptance suite: AC26-D26-P01, AC26-D26-P02, AC26-D26-P03, AC26-D26-P05, AC26-D26-P06, AC26-D26-P08, AC26-D26-P09, AC26-D26-P11, AC26-D26-P12.

Binding primary requirements: REQ26-D26-R01, REQ26-D26-R03, REQ26-D26-R04, REQ26-D26-R05, REQ26-D26-R06, REQ26-D26-R09, REQ26-D26-R10, REQ26-D26-R11.

### 131. US26-D26-02 — Give manual work a real home

As a qualified Support staff member, I want to record Open work with eligible handling and an optional reminder, so that email readiness does not force fake addresses or unowned work.

- **AC26-D26-P04:** Given the stated source/actor conditions, when the specified operation or event occurs, then A named qualified work inbox can be set up and manual admission completed without dummy email addresses; no eligible inbox has a draft-preserving setup/handoff path; archived scope rejects new work; real email still requires D25/P17/P6 readiness.

- **AC26-D26-P07:** Given the stated source/actor conditions, when the specified operation or event occurs, then Open/Shared defaults and explicit eligible assignment/reminder choices obey D3/D6/D7/D8; invalid choices are not silently substituted.

Full acceptance suite: AC26-D26-P04, AC26-D26-P07.

Binding primary requirements: REQ26-D26-R07, REQ26-D26-R08.

### 132. US26-D26-03 — Work every justified request from CRM

As a jointly authorized CRM and Support user, I want to discover manual and email work and open the same canonical detail, so that cross-surface continuity preserves privacy and avoids duplicate state.

- **AC26-D26-P10:** Given the stated source/actor conditions, when the specified operation or event occurs, then Cross-tenant, CRM-only, Support-only and field/source-restricted principals receive no unauthorized rows/counts/briefs/IDs/attachments.

- **AC26-D26-P13:** Given the stated source/actor conditions, when the specified operation or event occurs, then Every eligible manual/email original is discoverable on each justified Party, deduped by current D10 root including overlapping bases.

- **AC26-D26-P14:** Given the stated source/actor conditions, when the specified operation or event occurs, then Complete CRM view works beyond 1000/2000/50 source caps, with filters/authorization/dedupe before paging and no cross-page omissions.

Full acceptance suite: AC26-D26-P10, AC26-D26-P13, AC26-D26-P14, AC26-D26-P15, AC26-D26-P16, AC26-D26-P17, AC26-D26-P18, AC26-D26-P19, AC26-D26-P20, AC26-D26-P21.

Binding primary requirements: REQ26-D26-R02, REQ26-D26-R12, REQ26-D26-R13, REQ26-D26-R14, REQ26-D26-R15, REQ26-D26-R16.

### 133. US26-D26-04 — Contact someone later deliberately

As an authorized Support responder, I want to start an email thread only with a newly reviewed qualified audience, so that an internal brief is never sent automatically and reply timing stays truthful.

- **AC26-D26-P22:** Given the stated source/actor conditions, when the specified operation or event occurs, then Internal brief/source is never inserted into a public email automatically; note/reply/signature/shortcut ownership remains correct.

- **AC26-D26-P23:** Given the stated source/actor conditions, when the specified operation or event occurs, then Later Start email thread requires explicit qualified audience/new lineage and immutable P17/P6 preparation/dispatch; no trigger invented.

- **AC26-D26-P47:** Given the stated source/actor conditions, when the specified operation or event occurs, then D14 starts no target for manual creation; accepted Start email establishes later Next; unknown acceptance retains candidate First/Next and earliest applicable possible deadline, without backdated credit.

Full acceptance suite: AC26-D26-P22, AC26-D26-P23, AC26-D26-P47, AC26-D26-P48.

Binding primary requirements: REQ26-D26-R17, REQ26-D26-R18, REQ26-D26-R19.

### 134. US26-D26-05 — Correct and retain original work honestly

As an authorized source owner, I want to correct links or unused mistaken work without abandoning obligations, so that topology, expiry and cancellation preserve provenance.

- **AC26-D26-P30:** Given the stated source/actor conditions, when the specified operation or event occurs, then Created-in-error cancellation retains every D12 unused-tracking exclusion, rejects used/completed work even with no current obligation, abandons no promise/task/review and never invents a source conversation.

- **AC26-D26-P31:** Given the stated source/actor conditions, when the specified operation or event occurs, then Party merge/unmerge and D10 merge/Undo preserve original source/association provenance and one qualified CRM row.

- **AC26-D26-P32:** Given the stated source/actor conditions, when the specified operation or event occurs, then Redaction/expiry removes every ineligible brief/title/file/search/draft derivative from both surfaces without deleting independent owner facts.

Full acceptance suite: AC26-D26-P30, AC26-D26-P31, AC26-D26-P32, AC26-D26-P33, AC26-D26-P34, AC26-D26-P41.

Binding primary requirements: REQ26-D26-R20, REQ26-D26-R21, REQ26-D26-R22, REQ26-D26-R23.

### 135. US26-D26-06 — Operate one secure manual source

As a Support platform operator, I want to admit lawful work and associations atomically and reconcile outcomes, so that races and old code cannot create duplicates or false mail.

- **AC26-D26-P24:** Given the stated source/actor conditions, when the specified operation or event occurs, then Create commits work/brief/handling/links/history/receipt/continuation together or none under validation or dependency failure.

- **AC26-D26-P25:** Given the stated source/actor conditions, when the specified operation or event occurs, then Double click, two tabs and lost response reconcile the same durable occurrence; changed payload conflicts; distinct needs remain possible.

- **AC26-D26-P26:** Given the stated source/actor conditions, when the specified operation or event occurs, then Party/link/source/handling permission changes during create reject safely with preserved permitted draft and no silent partial links.

Full acceptance suite: AC26-D26-P24, AC26-D26-P25, AC26-D26-P26, AC26-D26-P27, AC26-D26-P28, AC26-D26-P29, AC26-D26-P35, AC26-D26-P36, AC26-D26-P37, AC26-D26-P38, AC26-D26-P39, AC26-D26-P40, AC26-D26-P42, AC26-D26-P43, AC26-D26-P44, AC26-D26-P45, AC26-D26-P46, AC26-D26-P49, AC26-D26-P50.

Binding primary requirements: REQ26-D26-R24, REQ26-D26-R25, REQ26-D26-R26, REQ26-D26-R27, REQ26-D26-R28, REQ26-D26-R29, REQ26-D26-R30.

### 136. US26-D27-01

As a Support worker, I want to find a selected public guide in the right Site and language, so that I can consult relevant information without losing my reply.

- **AC26-D27-01-01:** The Public finder searches the complete qualified selected title, summary and body population, uses explicit scope and shows a passive preview with a deliberate public-page action.
  - **AC26-D27-01-02:** An Internal, draft, removed, unqualified or wrong-locale source is never substituted; incomplete search is not No matches.
  - **AC26-D27-01-03:** A guide failure affects only that source while safe composition and the other tab remain available.

  Primary precise requirements: REQ26-D27C-R03, REQ26-D27-R02, REQ26-D27-R03, REQ26-D27-R04, REQ26-D27-R07, REQ26-D27-R08, REQ26-D27-R09, REQ26-D27-R21, REQ26-D27-R23.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 137. US26-D27-02

As a Support worker, I want to insert a public guidance link at my intended selection, so that I can share useful information in one clear action.

- **AC26-D27-02-01:** Insert link adds the current source title at a valid caret; Link selected text preserves eligible selected wording, exact draft purpose, recipients, signature and source-qualified provenance.
  - **AC26-D27-02-02:** Preview does not insert or send; changing a destination cannot retain a false selected-source assertion or bypass a source restriction.
  - **AC26-D27-02-03:** Stale selection returns me to a valid draft position without losing text; recovery and Undo retain applicable source eligibility.

  Primary precise requirements: REQ26-D27-R10, REQ26-D27-R11, REQ26-D27-R12, REQ26-D27-R13, REQ26-D27-R14, REQ26-D27-R15.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 138. US26-D27-03

As an authorized curator, I want to maintain the tenant's public guidance selection, so that staff receive useful current sources without another CMS.

- **AC26-D27-03-01:** Add, Remove and re-add operate on one flat tenant selection set with stable source identity, current generation, trusted attribution and a durable receipt.
  - **AC26-D27-03-02:** Selection cannot publish a CMS Page, promote Shared-by-link to public discovery, or grant CMS editing authority.
  - **AC26-D27-03-03:** Concurrent curation conflicts rather than overwrites; lost results reconcile the same operation; source restoration never re-adds a deliberately Removed selection.

  Primary precise requirements: REQ26-D27-R05, REQ26-D27-R06, REQ26-D27-R18, REQ26-D27-R22.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 139. US26-D27-04

As a Support worker, I want to consult clearly labelled Internal staff guides, so that I can follow reusable procedures while keeping them out of outgoing content.

- **AC26-D27-04-01:** Public and Internal are separate tabs; current published Staff guides are privately searchable and readable with explicit language and Support-staff purpose.
  - **AC26-D27-04-02:** Internal has no reply/note insertion, Copy article or conversion-to-saved-reply action; a guide link grants no source or business-action access.
  - **AC26-D27-04-03:** Withdrawal, deletion or permission loss clears forbidden content; new publication is signalled without replacing text mid-reading.

  Primary precise requirements: REQ26-D27C-R01, REQ26-D27C-R02, REQ26-D27C-R05, REQ26-D27C-R12, REQ26-D27C-R13, REQ26-D27C-R14, REQ26-D27C-R21, REQ26-D27C-R24.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 140. US26-D27-05

As an authorized guide maintainer, I want to draft, publish and maintain an Internal guide, so that common instructions can improve without accidental publication.

- **AC26-D27-05-01:** A guide has stable identity and language, accountable maintainer, validated restricted structured content, one current candidate and one immutable published head; Publish to staff reviews the exact candidate and audience.
  - **AC26-D27-05-02:** Save draft does not publish; restore creates a candidate, not a live revision; ordinary publication cannot release a separate safety restriction or override retained custody.
  - **AC26-D27-05-03:** Conflicts retain working text; archive/delete while editing explicitly handles unsaved work; deletion progress and orphaned maintenance remain accountable.

  Primary precise requirements: REQ26-D27C-R04, REQ26-D27C-R06, REQ26-D27C-R07, REQ26-D27C-R08, REQ26-D27C-R09, REQ26-D27C-R10, REQ26-D27C-R11, REQ26-D27C-R16.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 141. US26-D27-06

As a tenant security owner, I want to keep Public and Internal guidance within their actual source boundaries, so that source reuse cannot expose protected material.

- **AC26-D27-06-01:** Same-tenant source identity, current capabilities, valid heads, trusted fields and effective grants/RLS protect all ordinary and privileged reads, writes and derived data.
  - **AC26-D27-06-02:** Internal content never enters a public index, sitemap, requester guidance or AI corpus; common guides cannot become case, finance or member-care records.
  - **AC26-D27-06-03:** Adverse source changes deny new use before eventual purge; compatible restore replays restrictions before serving.

  Primary precise requirements: REQ26-D27C-R17, REQ26-D27C-R18, REQ26-D27C-R19, REQ26-D27C-R20, REQ26-D27C-R23, REQ26-D27-R19, REQ26-D27-R20.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 142. US26-D27-07

As a Support worker, I want to use Guidance through the same authorized Support and CRM context, so that I avoid re-entry without changing other domains.

- **AC26-D27-07-01:** The canonical reader/finder preserves source, draft, cursor, query, scroll and return context; governed Public-link preparation uses the existing P17 and P6 boundaries.
  - **AC26-D27-07-02:** Consulting or inserting guidance creates no Party, Activity, message, last-contact update, business completion or internal-guide email preparation.
  - **AC26-D27-07-03:** Only exact affected definitely-unsubmitted material is fenced; already or possibly submitted effects retain immutable identity and qualified reconciliation.

  Primary precise requirements: REQ26-D27C-R15, REQ26-D27C-R22, REQ26-D27-R16, REQ26-D27-R17.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 143. US26-D27-08

As a platform operator, I want to activate and operate qualified Guidance, so that staff get complete safe lookup and manageable recovery.

- **AC26-D27-08-01:** Current owner search, publication, body/schema bounds, finite custody, complete indexed pagination, accessibility and production-shaped proof pass before activation.
  - **AC26-D27-08-02:** Demo knowledge, editor previews, title/URL matching and open planning PRs are not source qualification; no new wiki, hierarchy, media or AI platform is introduced.
  - **AC26-D27-08-03:** Scoped kill switches preserve unrelated Public/Internal and ordinary Support behavior while safety, disposal and durable correction continue.

  Primary precise requirements: REQ26-D27C-R25, REQ26-D27C-R26, REQ26-D27C-R27, REQ26-D27C-R28, REQ26-D27C-R29, REQ26-D27C-R30, REQ26-D27-R24, REQ26-D27-R25, REQ26-D27-R26, REQ26-D27-R27, REQ26-D27-R28, REQ26-D27-R29, REQ26-D27-R30.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 144. US26-D28-01

As an authorized feedback manager, I want to enable a small automatic feedback policy, so that the tenant can sample feedback without staff selecting favored recipients.

- **AC26-D28-01-01:** Automatic invitations start Off; enabling requires qualified inboxes, an integer percentage 1–100 with preset 25, accountable feedback ownership and viable review coverage.
  - **AC26-D28-01-02:** There is no per-agent selection, donation-tier or sentiment targeting, replacement draw, hidden zero mode or invitation reminder.
  - **AC26-D28-01-03:** Off and scope removal fence current definitely-unsubmitted effects immediately without disabling ordinary Support; On again does not process old completed history.

  Primary precise requirements: REQ26-D28-R01, REQ26-D28-R02, REQ26-D28-R03, REQ26-D28-R09.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 145. US26-D28-02

As a Support operator, I want to select feedback opportunities once from genuine completed work, so that sampling and reporting remain honest through repeated completion and merging.

- **AC26-D28-02-01:** A completion candidate retains resolution generation, frozen policy and completion-plus-24-hour due time; one mature opportunity per original records the unbiased 0–9999 draw and compares it with percent times 100.
  - **AC26-D28-02-02:** No response, spam, restricted care, insufficient human email, owed work or unreviewed recovery cannot qualify; merge/Undo cannot provide another chance or rewrite prior draws.
  - **AC26-D28-02-03:** Relevant input invalidates an immature generation and cancels definitely-unsubmitted mature effects without replenishing consumed opportunity; concurrent and repeated commands return the same durable decision.

  Primary precise requirements: REQ26-D28-R04, REQ26-D28-R05, REQ26-D28-R06, REQ26-D28-R11.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 146. US26-D28-03

As a requester, I want to receive feedback invitations sparingly at a justified endpoint, so that the invitation does not repeatedly interrupt me or misrepresent my identity.

- **AC26-D28-03-01:** One source-qualified endpoint is selected without a CRM guess; the final submission guard enforces the tenant-wide 30-day mailbox gap across qualified inboxes and linked originals.
  - **AC26-D28-03-02:** Shared/on-behalf ambiguity is skipped with a safe reason; an address is not proof of a person; no CC fanout or automatic changed-address substitution occurs.
  - **AC26-D28-03-03:** Possible submission consumes the opportunity/gap; only a proved finite no-future-crossing boundary can release historical uncertainty after the accepted interval.

  Primary precise requirements: REQ26-D28-R07, REQ26-D28-R08, REQ26-D28-R10.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 147. US26-D28-04

As a requester, I want to submit a short neutral response and stop future invitations, so that I can express my experience without creating an account or giving marketing consent.

- **AC26-D28-04-01:** The protected inert-GET/Continue/Submit doorway presents the fixed three-choice satisfaction question with no selection and an optional 2000-scalar plain comment; one response is admitted with its exact question/invitation version.
  - **AC26-D28-04-02:** Scanners cannot vote; used links reveal no old comment; staff cannot edit my score; the separate restriction-only opt-out is not consumed by rating use or expiry.
  - **AC26-D28-04-03:** Same-input retry resolves the original receipt; changed replay conflicts; response authority expires no later than issuance plus 14 days, while the separately issued opt-out credential lasts at most 90 days and its recorded preference does not expire with the credential.

  Primary precise requirements: REQ26-D28-R13, REQ26-D28-R14, REQ26-D28-R15, REQ26-D28-R16, REQ26-D28-R17.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 148. US26-D28-05

As an authorized feedback reviewer, I want to review every submitted response in context, so that feedback leads to appropriate human attention without automatic promises.

- **AC26-D28-05-01:** Reports → Feedback and the canonical conversation expose current authorized invitation/response history and idempotent Mark reviewed with actor/time.
  - **AC26-D28-05-02:** Low scores do not alone create a ticket, apology, new contact, giving change or resolution; participation is not verified personal testimony or anonymous feedback.
  - **AC26-D28-05-03:** Loss of reviewer coverage creates safe oversight attention; justified follow-up uses existing owner commands and purpose-aware custody without renewing older transcripts.

  Primary precise requirements: REQ26-D28-R18, REQ26-D28-R19, REQ26-D28-R30.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 149. US26-D28-06

As a Support analyst, I want to see accurate feedback cohorts and exclusions, so that sampling and response rates cannot hide uncertainty.

- **AC26-D28-06-01:** Issued means submission may have begun; response fraction uses responses to that same issued cohort, including indeterminate submission, with separate eligibility/draw/suppression/delivery/response units.
  - **AC26-D28-06-02:** No response is neither positive nor negative; no leaderboards, cross-vendor benchmark, representativeness claim or deletion to improve scores is permitted.
  - **AC26-D28-06-03:** Later restrictions, corrections and topology changes preserve historical effect counts and disclose their actual denominator or availability consequence.

  Primary precise requirements: REQ26-D28-R24, REQ26-D28-R27.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 150. US26-D28-07

As a platform owner, I want to deliver and operate feedback through shared contact, content and transport owners, so that a survey feature cannot bypass communication or privacy controls.

- **AC26-D28-07-01:** P3 owns contactability and the persistent purpose opt-out, Support owns opportunities/responses/review, P17 owns the named response/preference descriptor pair and preparation, and P6 owns actual effect/submission recovery.
  - **AC26-D28-07-02:** No feedback action prepares before qualification or submits at/after due-plus-24-hour send-by; no raw endpoint, comment, action token or private case detail is used as diagnostics or public payload.
  - **AC26-D28-07-03:** Atomic constraints, grant/RLS closure, finite custody, migration fencing and accepted load/release proof remain prerequisites; ordinary human replies remain independent.

  Primary precise requirements: REQ26-D28-R12, REQ26-D28-R20, REQ26-D28-R21, REQ26-D28-R22, REQ26-D28-R23, REQ26-D28-R25, REQ26-D28-R26, REQ26-D28-R28, REQ26-D28-R29, REQ26-D28-R31.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 151. US26-D29-01

As a person seeking help, I want to contact the tenant immediately, so that I can ask for help without a questionnaire or self-service barrier.

- **AC26-D29-01-01:** The qualified Contact entry immediately shows required reply email and message, optional unsplit name, monitored published email and any deliberately published phone; contact precedes optional guides on narrow screens.
  - **AC26-D29-01-02:** No required account, subject, department, donor number, phone, upload, payment, article review or mandatory puzzle is added.
  - **AC26-D29-01-03:** Recoverable errors retain safe answers and show current independently qualified contact alternatives; unknown receipt is not success or a blind alternate-channel resend.

  Primary precise requirements: REQ26-D29-R01, REQ26-D29-R02, REQ26-D29-R03, REQ26-D29-R04, REQ26-D29-R05, REQ26-D29-R25.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 152. US26-D29-02

As a person seeking information, I want to open a relevant optional public guide, so that I can get information without losing my contact form.

- **AC26-D29-02-01:** Each entry offers zero to three explicitly selected Listed Page references in deliberate order, with current title/summary and a safe new-tab link.
  - **AC26-D29-02-02:** Shared-by-link staff selections, Internal guides, private context and unavailable sources cannot enter requester discovery or produce substitute articles.
  - **AC26-D29-02-03:** Guide-only failure suppresses only the qualified optional leaf; the independently valid contact closure remains usable and the current form stays intact.

  Primary precise requirements: REQ26-D29-R06, REQ26-D29-R07, REQ26-D29-R08, REQ26-D29-R09.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 153. US26-D29-03

As a signed-in requester, I want to review my own reply address and optional account context, so that staff can understand the request without receiving unauthorized account details.

- **AC26-D29-03-01:** Any self-prefill is visible/editable and one owner-qualified About context is removable; the server rechecks the actual tenant, principal, entry, source and revision.
  - **AC26-D29-03-02:** Represented-party or CRM-owner addresses never become requester defaults; matching email proves no identity or record rights; public content remains auth-invariant.
  - **AC26-D29-03-03:** Context loss removes unqualified references/prefill while retaining only safe visitor-authored text for deliberate requalification or Send without account details; logout, account/tenant change and successful receipt clear the full draft.

  Primary precise requirements: REQ26-D29-R10, REQ26-D29-R11, REQ26-D29-R12, REQ26-D29-R20.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 154. US26-D29-04

As a requester, I want to receive a dependable acknowledgment of my submitted request, so that I know whether the tenant actually accepted responsibility.

- **AC26-D29-04-01:** One Contact-purpose transaction admits the immutable form occurrence, exact route, durable primary Support acceptance, optional children and required continuation before the persistent Received message.
  - **AC26-D29-04-02:** A phone/email click, event publication or optional email is not acceptance; no fake incoming RFC email, provider ID or staff-note source is manufactured.
  - **AC26-D29-04-03:** Identical-intent retries reconcile the same privacy-safe receipt; changed input conflicts; deferred materialization stays discoverable and reuses the accepted route and original clocks.

  Primary precise requirements: REQ26-D29-R13, REQ26-D29-R14, REQ26-D29-R15, REQ26-D29-R16.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 155. US26-D29-05

As an authorized tenant manager, I want to optionally enable a neutral visitor email confirmation, so that browser receipt can be supplemented without duplicate or stale mail.

- **AC26-D29-05-01:** The P23 zero-or-one acknowledgment starts Off and uses a separately qualified web-Contact P17 profile, original 15-minute utility and shared tenant/mailbox 24-hour courtesy across email and form families.
  - **AC26-D29-05-02:** Publishing wording does not enable sending; no answer/context echo, CC, knowledge answer, permanent generated copy or second D13 confirmation is added.
  - **AC26-D29-05-03:** A qualified human reply for the same request and exact recipient ends additional confirmation-call/decrypt authority before or after possible submission; optional-child failure never rejects the accepted primary.

  Primary precise requirements: REQ26-D29-R17, REQ26-D29-R18, REQ26-D29-R19.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 156. US26-D29-06

As an authorized Help maintainer, I want to manage actual contact and guide placements through their owners, so that the tenant's contact path stays clear and supportable.

- **AC26-D29-06-01:** Requester help exposes public/app placements, exact locale, route, selected guides, readiness and source-owner preview/edit actions without duplicate editors.
  - **AC26-D29-06-02:** Public and app releases are not a claimed single transaction; publishing contact data is not verified destination authority; no fallback tenant/address or generic rules builder is invented.
  - **AC26-D29-06-03:** Repair and retirement preserve accepted requests, original routes, current safe alternatives and source privacy; old writers and hard-coded demo claims are fenced before activation.

  Primary precise requirements: REQ26-D29-R24, REQ26-D29-R28.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 157. US26-D29-07

As a requester using assistive technology or a narrow device, I want to complete the same contact journey accessibly, so that I can reach the tenant regardless of input method.

- **AC26-D29-07-01:** Native submission, labels, errors, receipt and no-JavaScript behavior preserve valid scope; accepted 10000-scalar message, 200-scalar name and 256-KiB raw ceilings are enforced server-side.
  - **AC26-D29-07-02:** 200-percent text resize alone is not reflow proof: verify 320-CSS-pixel width, 400-percent zoom from 1280 pixels, focus-not-entirely-obscured and actual target-size exceptions; standalone primary touch actions target 44 by 44 pixels.
  - **AC26-D29-07-03:** Mobile keyboards, RTL/long contact strings, low bandwidth, privacy/abuse, current grants and accepted two-tenant/load/retry proof must pass; no fake Received or unauthorized CRM mutation is tolerated.

  Primary precise requirements: REQ26-D29-R21, REQ26-D29-R22, REQ26-D29-R23, REQ26-D29-R26, REQ26-D29-R27, REQ26-D29-R29.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 158. US26-D30-01

As a Support worker, I want to see current work without losing normal navigation, so that I can find the next legitimate action quickly.

- **AC26-D30-01-01:** Overview offers All unfinished, Unassigned and Replies needing attention as distinct current-conversation counts, with truthful overlap and all-date links to independent review destinations.
  - **AC26-D30-01-02:** Counts do not add overlapping groups, hide deferred/waiting work, certify recovery complete or force Overview as everyone's landing page.
  - **AC26-D30-01-03:** Unknown scope is Selected inbox unavailable rather than All or zero; retired metadata remains only where current owner access permits it.

  Primary precise requirements: REQ26-D30-R02, REQ26-D30-R03, REQ26-D30-R04, REQ26-D30-R05.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 159. US26-D30-02

As a Support analyst, I want to review historical results under clear independent scope, so that each metric retains its actual meaning.

- **AC26-D30-02-01:** Results has its own period/zone and four fixed sections: Reply targets, Reply times, Current labels on conversations started and Feedback invitations issued.
  - **AC26-D30-02-02:** Work now's Currently handled in filter cannot silently change historical cohorts; no shared fake inbox dimension, health score, leaderboard or inferred business completion is added.
  - **AC26-D30-02-03:** Off preserves authorized history; unknown source/cohort/denominator remains explicit rather than a perfect percentage or fabricated empty result.

  Primary precise requirements: REQ26-D30-R06, REQ26-D30-R11, REQ26-D30-R12.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 160. US26-D30-03

As a Support analyst, I want to choose and inspect a precise reporting period, so that I understand the dates and partial interval behind the results.

- **AC26-D30-03-01:** Last 7 days, Last 30 days, This month and Custom show actual local endpoints/zone; new contexts use Last 30 days including today; Custom applies 1–366 inclusive dates ending no later than local today.
  - **AC26-D30-03-02:** Period boundaries are owner-compiled half-open intervals, not client-local guessed timestamps; changing reporting zone does not rewrite source calendars.
  - **AC26-D30-03-03:** Invalid input keeps previous values under their previous labels; a partial day/month shows Through the trusted evaluation instant.

  Primary precise requirements: REQ26-D30-R07.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 161. US26-D30-04

As a Support analyst, I want to open the exact source detail behind a result, so that I can inspect evidence without changing its denominator.

- **AC26-D30-04-01:** Target cohorts keep First/Next and assessed/finalized distinctions, times keep completed waits/median/nearest-rank p90, labels show up to five overlapping counts, and feedback uses the original issued cohort.
  - **AC26-D30-04-02:** A count of waits is not a count of conversations; no averaging percentages or percentiles, pie residual or unknown label metadata converted to No labels.
  - **AC26-D30-04-03:** Drilldown reauthorizes and either safely replays the evaluation or visibly re-evaluates the same meaning; Back restores permitted control/focus/scroll context.

  Primary precise requirements: REQ26-D30-R08, REQ26-D30-R09, REQ26-D30-R10, REQ26-D30-R15, REQ26-D30-R23.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 162. US26-D30-05

As a Support worker, I want to refresh useful results without disruptive motion, so that I can trust freshness while continuing my task.

- **AC26-D30-05-01:** Coherent Work now refreshes at most every 60 seconds while visible/online; historical blocks refresh for their accepted triggers, and Now becomes Out of date after 120 seconds without a qualified read.
  - **AC26-D30-05-02:** No late response may replace a newer scope, stale authority preserve forbidden values, or automatic refresh steal focus or announce every count.
  - **AC26-D30-05-03:** Each block independently distinguishes loading, empty, incomplete, failed and stale; one unavailable block cannot disable safe Support navigation.

  Primary precise requirements: REQ26-D30-R13, REQ26-D30-R14, REQ26-D30-R16, REQ26-D30-R27, REQ26-D30-R28.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 163. US26-D30-06

As a platform reporting owner, I want to evolve a fixed overview toward future full configuration, so that the accepted long-term direction remains possible without a premature builder.

- **AC26-D30-06-01:** Use stable owner-qualified definition/read/detail contracts and one current fixed composition; future compatible composition belongs to qualified shared Phase33 reporting.
  - **AC26-D30-06-02:** No layout database, arbitrary formula/join engine, drag editor, hidden Configure control or metric authority transfer ships in this phase.
  - **AC26-D30-06-03:** Versioned source contracts and compatible rollout preserve retained source meaning and safe detailed reports; future configuration needs its own complete permission and lifecycle contract.

  Primary precise requirements: REQ26-D30-R01, REQ26-D30-R17, REQ26-D30-R18, REQ26-D30-R26.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 164. US26-D30-07

As a platform security and operations owner, I want to serve complete authorized report results efficiently, so that derived views cannot leak or distort source truth.

- **AC26-D30-07-01:** Current source/field/component/tenant authority precedes aggregation, cache, prefetch and detail; exact counts, at-most-50 detail pages and the accepted production-shaped fixture/budgets are qualified.
  - **AC26-D30-07-02:** No raw-body download, broad first-page aggregate, copied CRM Activity, email schedule or report-view mutation is introduced.
  - **AC26-D30-07-03:** Restriction, failures and schema changes retain finite custody, explicit repair and compatible roll-forward; measured evidence, not source inspection alone, is required.

  Primary precise requirements: REQ26-D30-R19, REQ26-D30-R20, REQ26-D30-R21, REQ26-D30-R22, REQ26-D30-R24, REQ26-D30-R25, REQ26-D30-R29, REQ26-D30-R30, REQ26-D30-R31.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 165. US26-D31-01

As a Support worker, I want to choose a consistent quick follow-up time, so that I can schedule without doing calendar arithmetic.

- **AC26-D31-01-01:** Every entry offers In 1 hour, In 4 hours, Tomorrow and In 1 week with a stable reviewed exact date/time/zone, plus Choose date and time.
  - **AC26-D31-01-02:** Elapsed choices add 3600/14400 seconds then round upward to a minute; calendar choices use local date plus one/seven and current displayed minute, never business-day adjustment.
  - **AC26-D31-01-03:** Choices stay stable until deliberate refresh or edit; aging relative labels are qualified rather than silently moved.

  Primary precise requirements: REQ26-D31-R02, REQ26-D31-R03, REQ26-D31-R05.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 166. US26-D31-02

As a Support worker, I want to enter a custom date, time and zone directly, so that I can schedule an exact useful moment without endless calendar clicks.

- **AC26-D31-02-01:** Custom starts at today's date with time unset unless continuing/editing a candidate; Set/Update is deliberate and uses the exact validated future instant.
  - **AC26-D31-02-02:** Nonexistent wall times require correction and repeated wall times require an explicit offset choice; no silent rollover, ambiguous date parse or arbitrary short future horizon.
  - **AC26-D31-02-03:** Errors retain input; timezone changes re-resolve a reviewed candidate, while later timezone/travel/tzdb changes never rewrite an accepted instant or invent missing historical zone provenance.

  Primary precise requirements: REQ26-D31-R04, REQ26-D31-R06, REQ26-D31-R07, REQ26-D31-R08, REQ26-D31-R18.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 167. US26-D31-03

As a Support worker, I want to change or remove the shared reminder without altering unrelated work, so that follow-up remains understandable.

- **AC26-D31-03-01:** One current generation is replaced conditionally; Remove cancels that reminder/deferral, Work now is explicit Open, Resolve cancels and current due processing opens follow-up review.
  - **AC26-D31-03-02:** Opening a picker does not reopen, assign, change a CRM task, service target or owner deadline; merge/Undo uses the already reviewed resulting plan.
  - **AC26-D31-03-03:** Late jobs and stale generations cannot resurrect reminders; actual due work remains discoverable and applicable absence coverage runs through its own owner.

  Primary precise requirements: REQ26-D31-R01, REQ26-D31-R09.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 168. US26-D31-04

As a Support worker, I want to recover an uncertain reminder change across views and CRM, so that a retry preserves the time I actually selected.

- **AC26-D31-04-01:** Commands bind exact source, expected generation, reviewed instant and semantic operation identity; identical retry reconciles before applying new-admission future-time validation.
  - **AC26-D31-04-02:** A browser cancel or timeout is not rollback; caller tenant/actor/time fields cannot establish authority; no raw generic status-field bypass is accepted.
  - **AC26-D31-04-03:** Mixed bulk outcomes are shown per reviewed source and retry only eligible failed items; unavailable access/clock remains explicit without losing safe input.

  Primary precise requirements: REQ26-D31-R11, REQ26-D31-R13, REQ26-D31-R14, REQ26-D31-R15, REQ26-D31-R23.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 169. US26-D31-05

As a platform operator, I want to execute follow-up reliably through the existing owners, so that a long horizon or outage cannot silently lose work.

- **AC26-D31-05-01:** The actual owner schedules bounded durable execution and catch-up, using trusted admission/due clocks and accepted exact timing, source and database invariants.
  - **AC26-D31-05-02:** No unbounded provider sleep, persistent due-later-than-now constraint, new personal alarm, mandatory message or Tiptap date editor is introduced.
  - **AC26-D31-05-03:** Privacy/custody, current grants/RLS, migration, load and actual keyboard/mobile/AT proof qualify activation; Email Studio/P6 effects remain independently authorized.

  Primary precise requirements: REQ26-D31-R10, REQ26-D31-R12, REQ26-D31-R16, REQ26-D31-R17, REQ26-D31-R19, REQ26-D31-R20, REQ26-D31-R21, REQ26-D31-R22, REQ26-D31-R24.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 170. US26-D32-01

As a Support worker, I want to preview an eligible attachment where I am working, so that I can understand the file without losing context.

- **AC26-D32-01-01:** A metadata-first file card separates Preview from Download original and opens one deliberate read-only viewer with exact availability and return to the same source, draft and CRM origin.
  - **AC26-D32-01-02:** Preview is not download, send, OCR/search import or permission to see another source; unsupported/missing content is not an empty successful rendering.
  - **AC26-D32-01-03:** Current source restrictions clear invalid content and all derivatives; a preview limit may still leave a separately authorized original download available.

  Primary precise requirements: REQ26-D32-R03, REQ26-D32-R04, REQ26-D32-R16.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 171. US26-D32-02

As a Support worker, I want to read document, slide and image previews with honest coverage, so that I can rely on what the preview actually shows.

- **AC26-D32-02-01:** Initial eligible lanes are PNG/JPEG/WebP/still GIF, ordinary unencrypted PDF, DOCX, PPTX, XLSX, TXT and CSV under their exact profiles; documents/slides use inert static renditions.
  - **AC26-D32-02-02:** No scripts, macros, active forms, network resources, hidden comments/revisions/notes or unsupported layout are silently exposed or claimed complete.
  - **AC26-D32-02-03:** Meaningful omitted content, missing fonts/resources and fidelity limitations are explicit; ordinary source material is preserved and not edited by conversion.

  Primary precise requirements: REQ26-D32-R01, REQ26-D32-R09, REQ26-D32-R10, REQ26-D32-R11, REQ26-D32-R14.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 172. US26-D32-03

As a Support worker, I want to inspect spreadsheet and text values without changing them, so that file reading cannot recalculate or corrupt evidence.

- **AC26-D32-03-01:** XLSX uses visible sheets and saved values with original coordinates, typed/raw value preservation, explicit missing caches and date-system meaning; TXT/CSV are literal decoded data.
  - **AC26-D32-03-02:** No recalculation, external refresh, macro, import, source rewrite, hidden-sheet reveal, false zero, numeric identifier coercion or print-area-as-complete-workbook shortcut.
  - **AC26-D32-03-03:** Sparse bounds, malformed encoding, all-hidden/empty and unsupported features produce exact limited/unavailable outcomes without silently truncating complete content.

  Primary precise requirements: REQ26-D32-R12, REQ26-D32-R13.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 173. US26-D32-04

As a platform file owner, I want to create source-bound private renditions safely, so that untrusted files cannot escape their processing or permission boundary.

- **AC26-D32-04-01:** Original source and derived rendition have separate stable identities; private generation-bound admission, scan, isolated parsing, current authorization and atomic publication apply across browser, storage and workers.
  - **AC26-D32-04-02:** No provider URL or client MIME/ZIP metadata grants access or determines actual resource size; no ordinary app-origin executable preview or cross-tenant derivative reuse.
  - **AC26-D32-04-03:** Stop, expiry, revocation, failed attempts and late results cannot publish stale material; only classified transient failure allows the accepted second attempt.

  Primary precise requirements: REQ26-D32-R02, REQ26-D32-R05, REQ26-D32-R06, REQ26-D32-R07, REQ26-D32-R08, REQ26-D32-R17, REQ26-D32-R18, REQ26-D32-R22, REQ26-D32-R24.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 174. US26-D32-05

As a platform operator, I want to enforce exact preview budgets and recovery, so that one difficult file cannot overwhelm other tenants.

- **AC26-D32-05-01:** Apply the accepted input/package/page/pixel/cell/text/output ceilings and 60-second elapsed, 30-second process-tree CPU, 2-GiB memory and 512-MiB temporary-disk ceilings per attempt.
  - **AC26-D32-05-02:** No output silently truncated as complete, resource trust based only on metadata, unlimited retry or public conversion provider is introduced.
  - **AC26-D32-05-03:** Bounded scheduling, fair load, current parser dependencies, finite derivative custody, source-first rollout and actual malicious/fidelity/accessibility/load proof are release prerequisites.

  Primary precise requirements: REQ26-D32-R15, REQ26-D32-R25, REQ26-D32-R26, REQ26-D32-R27.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 175. US26-D32-06

As a Support worker, I want to use files coherently across Support and CRM, so that the platform preserves both source meaning and my work.

- **AC26-D32-06-01:** The shared reader preserves selection, focus, context and actual source permissions; typed links lead to their independently authorized owner.
  - **AC26-D32-06-02:** Opening a file does not copy it into Email Studio, Document Studio, another CRM record, AI corpus or outgoing attachment set, or prove a financial action.
  - **AC26-D32-06-03:** Base UI/base-maia, keyboard/AT, text alternatives, mobile/zoom and low-bandwidth failures remain usable under current source availability.

  Primary precise requirements: REQ26-D32-R19, REQ26-D32-R20, REQ26-D32-R21, REQ26-D32-R23, REQ26-D32-R28.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 176. US26-D33-01

As a Support worker, I want to choose my Compact or Full reading default where I read, so that I can use the presentation that suits me.

- **AC26-D33-01-01:** Compact is the absent-preference default; the labelled reading control saves my tenant-scoped personal choice for qualified future readings, while temporary disclosure remains local.
  - **AC26-D33-01-02:** A loading/failed preference is not confirmed absence; one person's preference cannot become tenant, assignment or conversation policy.
  - **AC26-D33-01-03:** The exact chosen state saves with honest feedback and concurrency handling; late responses do not overwrite a newer choice or reset a draft.

  Primary precise requirements: REQ26-D33-R01, REQ26-D33-R02, REQ26-D33-R03, REQ26-D33-R04, REQ26-D33-R05, REQ26-D33-R06, REQ26-D33-R07.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 177. US26-D33-02

As a Support worker, I want to read compact history without losing unique content, so that repeated email material does not overwhelm the conversation.

- **AC26-D33-02-01:** Only conservatively proved repeated quotation/signature regions fold, retaining source maps and explicit disclosure controls; unique content, important metadata and source meaning remain visible.
  - **AC26-D33-02-02:** Text similarity, destructive stripping or uncertain parsing cannot remove material; Full is safe complete presentation of available authorized content, not raw active HTML.
  - **AC26-D33-02-03:** Unsupported/ambiguous parsing uses the safe full-content fallback; source restrictions still override earlier disclosed content.

  Primary precise requirements: REQ26-D33-R08, REQ26-D33-R09, REQ26-D33-R10.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 178. US26-D33-03

As a Support worker, I want to find exact content and return without losing place, so that reading mode does not make work harder.

- **AC26-D33-03-01:** Conversation Find covers the qualified source population and opens the exact matching source/region, including folded text where lawful, while preserving selection, scroll, focus and draft.
  - **AC26-D33-03-02:** Search cannot silently omit folded content, reparent originals or treat a jump as business completion.
  - **AC26-D33-03-03:** CRM and file-reader returns use the same current-authorized source and personal setting; revoked content is cleared rather than restored from navigation cache.

  Primary precise requirements: REQ26-D33-R11, REQ26-D33-R12, REQ26-D33-R17.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 179. US26-D33-04

As a platform owner, I want to store only the small qualified personal reading preference, so that presentation cannot become another authority or disclosure path.

- **AC26-D33-04-01:** Closed preference values and tenant/real-person identity, conditional desired-state command, current grants/RLS and finite cache/source lifetimes govern every reader.
  - **AC26-D33-04-02:** No unread receipt, message edit, provider-mailbox sync, Email Studio rendering change, AI or duplicate CRM state follows from a reading preference.
  - **AC26-D33-04-03:** Compatible readers/writers, exact Base UI/base-maia, bounded folding/search and accepted browser/AT/performance proof precede activation.

  Primary precise requirements: REQ26-D33-R13, REQ26-D33-R14, REQ26-D33-R15, REQ26-D33-R16, REQ26-D33-R18, REQ26-D33-R19, REQ26-D33-R20, REQ26-D33-R21, REQ26-D33-R22, REQ26-D33-R23, REQ26-D33-R24, REQ26-D33-R25, REQ26-D33-R26.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 180. US26-D34-01

As a Support worker, I want to see when a teammate is actively composing, so that I can coordinate without treating a hint as a lock.

- **AC26-D34-01-01:** A quiet named cue reflects qualified current composing activity and complete permitted projection, with clear unavailable state and no fourth pane or viewer roster.
  - **AC26-D34-01-02:** No message content, keystrokes, recipient details, productivity history or raw client Presence identity are shared; no cue grants send or CRM authority.
  - **AC26-D34-01-03:** Stop, inactivity, hidden/unqualified context and source loss end the cue under current bounds; work and real send-collision review continue independently.

  Primary precise requirements: REQ26-D34-R01, REQ26-D34-R02, REQ26-D34-R04, REQ26-D34-R05.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 181. US26-D34-02

As a Support worker, I want to receive responsive composing cues without stale certainty, so that the interface does not lag behind actual collaboration.

- **AC26-D34-02-01:** Leading start/stop are prompt; active/peer-cue refresh is 5 seconds and otherwise eligible reader refresh is 10 seconds, under the exact accepted liveness, lease, freshness and display-trust rules.
  - **AC26-D34-02-02:** Renewal without fresh qualifying input cannot extend the fresh-input frontier; background/ineligible readers do not fan out or keep cues alive.
  - **AC26-D34-02-03:** Old sequence/generation responses, delayed authorization and unknown controls cannot restore stale cues; clock uncertainty produces conservative unavailability.

  Primary precise requirements: REQ26-D34-R06, REQ26-D34-R09, REQ26-D34-R10, REQ26-D34-R13, REQ26-D34-R14.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 182. US26-D34-03

As a platform security owner, I want to authorize composing awareness through trusted source sessions, so that realtime transport cannot widen access.

- **AC26-D34-03-01:** Current tenant/profile/source/observer authority, server-issued bounded contexts and closed control/snapshot operations protect both database and private transport.
  - **AC26-D34-03-02:** No caller-supplied author, tenant, topic membership or published Presence payload substitutes for current authorization; service role is not authority by itself.
  - **AC26-D34-03-03:** Revocation, merge/Undo, session change and expired leases fence current operations and display before delayed transport cleanup; no public cache or cross-tenant state leakage.

  Primary precise requirements: REQ26-D34-R03, REQ26-D34-R07, REQ26-D34-R08, REQ26-D34-R11, REQ26-D34-R12.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 183. US26-D34-04

As a platform engineer, I want to integrate awareness without remounting or slowing the editor, so that typing and navigation remain stable.

- **AC26-D34-04-01:** The shared qualified coordinator owns bounded refresh/cleanup and the actual React/Next client lifecycle; real input, hydration, restored content and ordinary editor updates retain distinct meanings.
  - **AC26-D34-04-02:** No per-keystroke durable write, application-server WebSocket host, new paid collaboration service or full-surface client rendering is introduced.
  - **AC26-D34-04-03:** Current Supabase/Vercel/Next boundaries, bounded budgets, performance and page/session teardown are proved without claiming provider quotas establish application capacity.

  Primary precise requirements: REQ26-D34-R15, REQ26-D34-R16, REQ26-D34-R21.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 184. US26-D34-05

As a Support and CRM user, I want to keep awareness separate from my actual work and messages, so that coordination cues cannot accidentally cause an action.

- **AC26-D34-05-01:** The same currently authorized Support context works through CRM, while actual D4 send conflict protection and all existing work/attention owners remain authoritative.
  - **AC26-D34-05-02:** Cue events create no Email Studio preparation, P6 delivery, note, follow notification, CRM Activity or business completion.
  - **AC26-D34-05-03:** Transport outage is visible but does not disable safe work; exact operational thresholds, privacy cleanup, accessible presentation and real multi-client proof remain required.

  Primary precise requirements: REQ26-D34-R17, REQ26-D34-R18, REQ26-D34-R19, REQ26-D34-R20, REQ26-D34-R22, REQ26-D34-R23, REQ26-D34-R24, REQ26-D34-R25, REQ26-D34-R26, REQ26-D34-R27, REQ26-D34-R28.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 185. US26-D35-01

As an original note author, I want to edit my own eligible posted Internal note simply, so that I can correct a mistake without adding needless process.

- **AC26-D35-01-01:** Edit opens the note in place with Save changes/Cancel, preserves its source and authored chronology and shows Edited with accessible visible history after a real change.
  - **AC26-D35-01-02:** No arbitrary grace period, other-author rewrite, incoming/outgoing email edit, CRM-note mutation or edit of a staff-recorded brief is allowed.
  - **AC26-D35-01-03:** Cancellation and navigation preserve or explicitly discard local working text; changed current source/authority produces clear read-only/conflict recovery instead of silent loss.

  Primary precise requirements: REQ26-D35-R01, REQ26-D35-R02, REQ26-D35-R05, REQ26-D35-R08, REQ26-D35-R20.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 186. US26-D35-02

As a Support reader, I want to inspect trustworthy note history, so that I can understand what was corrected.

- **AC26-D35-02-01:** Current text and immutable authorized revisions preserve original author/time and actual correction actor/time, with simple history navigation and source-specific unavailable states.
  - **AC26-D35-02-02:** No ordinary edit erases history, changes authorship, restores restricted content or turns old content into a new note.
  - **AC26-D35-02-03:** Privacy/expiry applies to every version, derived search and external controlled copy; independently retained evidence stays truthful without an indefinite body archive.

  Primary precise requirements: REQ26-D35-R03, REQ26-D35-R12, REQ26-D35-R14, REQ26-D35-R15, REQ26-D35-R18.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 187. US26-D35-03

As a note author, I want to correct content without new file or mention side effects, so that minor editing remains predictable.

- **AC26-D35-03-01:** The accepted canonical correction profile retains qualified existing references/files/mention identity while allowing ordinary safe text correction through validation before normalization.
  - **AC26-D35-03-02:** An edit cannot invent new recipients, reissue mentions, append new work, silently attach files, become externally deliverable or use metadata stripping to bypass source purpose.
  - **AC26-D35-03-03:** Invalid/unknown schema and stale original references fail visibly while retaining safe local work for review.

  Primary precise requirements: REQ26-D35-R04, REQ26-D35-R06, REQ26-D35-R07.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 188. US26-D35-04

As a note author, I want to recover Save without duplicate revisions or lost corrections, so that another tab or network failure cannot overwrite my intent.

- **AC26-D35-04-01:** Save conditionally compares the expected note revision and canonical content; no-op adds no revision; real change atomically admits new revision/head/history/receipt and exact secondary obligations.
  - **AC26-D35-04-02:** Changed payload under the same operation conflicts; an uncertain response is not permission to overwrite, rekey or create a new version blindly.
  - **AC26-D35-04-03:** The same operation reconciles its result under current rights; concurrent changes preserve local text and require deliberate review.

  Primary precise requirements: REQ26-D35-R09, REQ26-D35-R10, REQ26-D35-R11.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 189. US26-D35-05

As a platform owner, I want to keep note correction within Support's authority, so that editing cannot leak or distort other domains.

- **AC26-D35-05-01:** Current author/source permissions, immutable tenant-aware revision relationships, effective grants/RLS/storage and source-purpose custody protect all ordinary and privileged paths.
  - **AC26-D35-05-02:** Correction creates no new email, external reply, CRM Activity, last-contact update or automatic successful work/target event; D34 awareness is reused only when qualified.
  - **AC26-D35-05-03:** Legacy migration needs trusted author/source evidence; bounded history/search, visual accessibility, finite logs and actual concurrency/privacy proof govern activation.

  Primary precise requirements: REQ26-D35-R13, REQ26-D35-R16, REQ26-D35-R17, REQ26-D35-R19, REQ26-D35-R21, REQ26-D35-R22, REQ26-D35-R23, REQ26-D35-R24, REQ26-D35-R25.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 190. US26-D36-01

As a Support worker, I want to write a new reply without automatic old-history bulk, so that my answer stays readable.

- **AC26-D36-01-01:** New replies start with my authored answer plus governed signature/footer; Add quote and source Quote message let me deliberately add permitted earlier message text.
  - **AC26-D36-01-02:** No automatic transcript, forwarding product, AI extractor or history-inclusion preference is added; earlier saved material is not silently stripped.
  - **AC26-D36-01-03:** Unloaded or ineligible source shows a clear recovery state without blocking unrelated safe authored text.

  Primary precise requirements: REQ26-D36-R01.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 191. US26-D36-02

As a Support worker, I want to add and edit a useful source quotation in place, so that adding context feels like ordinary writing.

- **AC26-D36-02-01:** Message or eligible selected excerpt inserts once at the current editor position with visible attribution and natural trim/format/remove/Undo; meaningful changes are labelled edited excerpt.
  - **AC26-D36-02-02:** Opening a picker does not insert; text selection is an accelerator rather than the only path; attachments/remote images are not silently included.
  - **AC26-D36-02-03:** Stale selection, long/unsupported representations and unavailable content preserve safe local work and disclose actual inclusion rather than promising hidden extraction.

  Primary precise requirements: REQ26-D36-R02, REQ26-D36-R03, REQ26-D36-R04, REQ26-D36-R05, REQ26-D36-R06, REQ26-D36-R07, REQ26-D36-R08, REQ26-D36-R12, REQ26-D36-R21.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 192. US26-D36-03

As a Support worker, I want to review quote disclosure when source or recipients change, so that I do not send context to an unintended audience.

- **AC26-D36-03-01:** Exact source/representation/provenance and reviewed recipient dependencies are qualified through draft changes, topology, preparation and local admission.
  - **AC26-D36-03-02:** Quoting does not change reply target, subject, recipients or ancestry; CRM/email matching and client provenance cannot certify private material shareable.
  - **AC26-D36-03-03:** Current restriction/expiry fences affected known material even in Undo, copied blocks or saved drafts; changed recipients receive proportionate exact disclosure review.

  Primary precise requirements: REQ26-D36-R09, REQ26-D36-R10, REQ26-D36-R11, REQ26-D36-R13, REQ26-D36-R15, REQ26-D36-R17.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 193. US26-D36-04

As a platform content and messaging owner, I want to compile the complete reviewed quote once, so that the sent message has the intended content and durable identity.

- **AC26-D36-04-01:** Shared canonical purpose/version validation precedes generic normalization; P17 prepares exact safe HTML/plain text and source dependencies, Support admits and P6 dispatches/reconciles the immutable effect.
  - **AC26-D36-04-02:** Untrusted source text is inert, never variables/instructions; no dispatch fetch/rerender, new email studio, body-copy CRM or source-authority bypass is permitted.
  - **AC26-D36-04-03:** Compatible versions preserve unknown/unsupported content read-only; source-first rollout, finite custody and actual rich-text/browser/provider proof remain required.

  Primary precise requirements: REQ26-D36-R14, REQ26-D36-R16, REQ26-D36-R18, REQ26-D36-R19, REQ26-D36-R20, REQ26-D36-R22, REQ26-D36-R23, REQ26-D36-R24, REQ26-D36-R25, REQ26-D36-R26.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 194. US26-D37-01

As a Support worker, I want to find my private saved Reply drafts in one place, so that I can resume interrupted work without reconstructing old filters.

- **AC26-D37-01-01:** My drafts shows the complete current-permitted personal population with source context, meaningful snippets, changed-source state and bounded ordering/search/inbox scope; direct restoration also works.
  - **AC26-D37-01-02:** Drafts are not work status, assignment, public messages, team-owned shared drafts or a product-wide My work queue.
  - **AC26-D37-01-03:** No stale/forbidden entry leaks source metadata; empty, unavailable, partial and save failure states are distinguished.

  Primary precise requirements: REQ26-D37-R01, REQ26-D37-R02, REQ26-D37-R03, REQ26-D37-R04, REQ26-D37-R05.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 195. US26-D37-02

As a Support worker, I want to have meaningful Reply work saved quietly, so that I do not lose content or have to press Save repeatedly.

- **AC26-D37-02-01:** The accepted 750-ms quiet and 5-second eligible-attempt schedule saves the complete canonical bundle only after meaningful user work, with at most one in-flight write and honest exact-candidate Saving/Saved state.
  - **AC26-D37-02-02:** Focus, hydration, signature-only/default initialization and no-op must not create phantom drafts; Saved is not Send-ready and incomplete permitted audience/assets remain truthful.
  - **AC26-D37-02-03:** IME, ongoing typing and delayed acknowledgment cannot lose the latest candidate or mislabel an older save current.

  Primary precise requirements: REQ26-D37-R06, REQ26-D37-R07, REQ26-D37-R08, REQ26-D37-R09, REQ26-D37-R10.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 196. US26-D37-03

As a Support worker, I want to resume the exact draft under current source authority, so that my text and audience are not silently retargeted.

- **AC26-D37-03-01:** Restoration resolves current owner/purpose/schema/source before editor initialization and preserves target, explicit audience, signature, attachments, quote dependencies and staged work intent.
  - **AC26-D37-03-02:** New messages, changed defaults, CRM email edits or assignment cannot replace saved audience or rerun staged work; unknown nodes are not dropped and resaved.
  - **AC26-D37-03-03:** Conflicts retain safe working text and require review; a restricted source yields only permitted recovery, never reconstruction from old cache.

  Primary precise requirements: REQ26-D37-R14, REQ26-D37-R15.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 197. US26-D37-04

As a Support worker, I want to switch pages and recover uncertain saves safely, so that interruptions do not turn into duplicate or lost work.

- **AC26-D37-04-01:** Source-owned private identity and conditional generation/operation receipts govern same-person tabs, navigation flush and retry; only actually acknowledged work is called Saved.
  - **AC26-D37-04-02:** Browser unload/beacon/background success is not assumed, no durable browser-body cache is added, and independent Reply/Note state is never converted.
  - **AC26-D37-04-03:** Known source changes and unavailable reads give targeted review or leave guards only for work actually at risk; safe persisted work needs no needless confirmation.

  Primary precise requirements: REQ26-D37-R11, REQ26-D37-R12, REQ26-D37-R13, REQ26-D37-R25.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 198. US26-D37-05

As a Support worker, I want to discard or send only the exact intended draft, so that one action cannot remove another person's or purpose's work.

- **AC26-D37-05-01:** Discard is a conditional private-source operation; Send atomically consumes only the exact admitted draft generation through the existing prepared-message/work boundary.
  - **AC26-D37-05-02:** No shared trash product, discard-after-unknown-send guess, duplicate effect, note conversion or automatic status/recipient action follows.
  - **AC26-D37-05-03:** Lost results reconcile permanent operation identity; accepted or possibly submitted communication uses its recovery owner rather than a recreated draft send.

  Primary precise requirements: REQ26-D37-R16, REQ26-D37-R17.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 199. US26-D37-06

As a platform owner, I want to protect and operate personal Reply persistence, so that private interrupted work stays safe across source and schema changes.

- **AC26-D37-06-01:** Tenant/profile/original/purpose cardinality, complete-bundle validation, effective grants/RLS/storage, exact indexes/pagination and finite source-derived custody govern all paths.
  - **AC26-D37-06-02:** Tiptap and Realtime are not persistence authorities; P17 supplies canonical authoring/preparation, not another draft store; CRM opens the same source without duplicate Activity/body.
  - **AC26-D37-06-03:** Trusted legacy provenance, incompatible-reader fences, current revocation, controlled cleanup and the accepted load/AT/browser proof are required before exposing My drafts.

  Primary precise requirements: REQ26-D37-R18, REQ26-D37-R19, REQ26-D37-R20, REQ26-D37-R21, REQ26-D37-R22, REQ26-D37-R23, REQ26-D37-R24, REQ26-D37-R26, REQ26-D37-R27, REQ26-D37-R28.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 200. US26-D38-01

As a Support worker, I want to find unfinished new Internal notes beside my Reply drafts, so that private work is easy to resume with a clear purpose.

- **AC26-D38-01-01:** The same My drafts owner/finder has distinct Reply and Internal note rows for independent immutable purposes on one original source; both can exist without conversion.
  - **AC26-D38-01-02:** A new note draft is not a posted note or D35 correction draft; no message, mention, work event or CRM Activity occurs on creation/save/resume.
  - **AC26-D38-01-03:** Current scope/read/save/post rights are separately rechecked; loss of Post alone can still allow qualified read-only inspection.

  Primary precise requirements: REQ26-D38-R01, REQ26-D38-R02, REQ26-D38-R03.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 201. US26-D38-02

As a Support worker, I want to save incomplete note content and files honestly, so that I can pause before everything is ready.

- **AC26-D38-02-01:** Meaningful canonical text, accepted reference changes and private selected files save as one versioned bundle using D37 timing/concurrency; pending files and inert mentions retain explicit state.
  - **AC26-D38-02-02:** No Reply recipients, signature, D24 reply plan or email preparation enters the Note profile; zero meaningful work creates no phantom draft.
  - **AC26-D38-02-03:** Unknown schema, upload failure and current source change preserve only lawful working material and show a specific recovery path.

  Primary precise requirements: REQ26-D38-R04, REQ26-D38-R07, REQ26-D38-R08, REQ26-D38-R09.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 202. US26-D38-03

As a Support worker, I want to post a ready Internal note deliberately, so that my team sees only what I chose to publish.

- **AC26-D38-03-01:** Add note atomically admits the note, initial immutable history, ready authorized assets, command result, exact draft consumption and required source/mention obligations.
  - **AC26-D38-03-02:** Zero body and zero ready files cannot post; a ready authorized attachment-only note is valid; selected pending files block posting until ready or removed.
  - **AC26-D38-03-03:** Unknown Post reconciles that operation before retry or discard; downstream notification failure does not erase an admitted note or create duplicate publication.

  Primary precise requirements: REQ26-D38-R15, REQ26-D38-R16.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 203. US26-D38-04

As a Support worker, I want to switch purposes and leave without losing either draft, so that the interface does not fight normal interruptions.

- **AC26-D38-04-01:** Switching preserves independent controllers; leaving flushes or guards every dirty purpose that would actually be lost, and resume shows the exact note origin and current posting destination.
  - **AC26-D38-04-02:** Safely retained working state need not block mode switches; topology change cannot silently post into the wrong current source; private drafts do not inherit shared note visibility.
  - **AC26-D38-04-03:** Current-authorized destination review, same-person conflicts and purpose-specific Discard preserve the other draft and D35 local correction behavior.

  Primary precise requirements: REQ26-D38-R05, REQ26-D38-R06, REQ26-D38-R12, REQ26-D38-R13, REQ26-D38-R14, REQ26-D38-R17, REQ26-D38-R21.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 204. US26-D38-05

As a platform owner, I want to apply the existing private draft lifecycle to Notes safely, so that the extension does not create another store or communication authority.

- **AC26-D38-05-01:** Current trusted actor/source/purpose, same-tenant relational constraints, effective grants/RLS/storage, generation/idempotency fences and finite asset/content custody govern the complete Note path.
  - **AC26-D38-05-02:** Saving never triggers mentions; posting-derived direct mentions remain independent of D15 optional Following; neither Tiptap nor Realtime grants source or delivery authority.
  - **AC26-D38-05-03:** Source privacy/expiry, departed users, source-first migration, legacy ambiguity and accepted browser/database/load proof remain binding while CRM uses the same canonical source.

  Primary precise requirements: REQ26-D38-R10, REQ26-D38-R11, REQ26-D38-R18, REQ26-D38-R19, REQ26-D38-R20, REQ26-D38-R22, REQ26-D38-R23, REQ26-D38-R24, REQ26-D38-R25, REQ26-D38-R26.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 205. US26-D39-01

As a Support worker, I want to see which permitted conversation content is unread for me, so that I can orient myself without changing the team's work.

- **AC26-D39-01-01:** Personal state is self-only; absent state means unread for current eligible other-authored content, including old/newly accessible content, while self-only/empty content creates no automatic cue.
  - **AC26-D39-01-02:** Reading is not understanding, assignment, follow/review completion, successful work, provider receipt or a teammate-reading roster; excluded system/delivery/cleanup events do not manufacture human unread.
  - **AC26-D39-01-03:** Permission expansion exposes unfamiliar eligible material and contraction preserves still-qualified progress without granting old rights.

  Primary precise requirements: REQ26-D39-R01, REQ26-D39-R02, REQ26-D39-R03, REQ26-D39-R04.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 206. US26-D39-02

As a Support worker, I want to catch up through one deliberate successful conversation opening, so that I do not need to scroll every historical original.

- **AC26-D39-02-01:** A current focused/visible reader with successfully presented latest eligible combined content can acknowledge the exact complete authorized snapshot vector, including proved folded older coverage.
  - **AC26-D39-02-02:** Prefetch, background tabs, HTTP success, editor focus, blank/error/unsupported render and an older-history jump cannot acknowledge newer content; no dwell surveillance or per-original viewport chore.
  - **AC26-D39-02-03:** Missing or unproved source coverage remains unread; incoming content during active composition stays unread with a New activity action and no scroll jerk.

  Primary precise requirements: REQ26-D39-R07, REQ26-D39-R08, REQ26-D39-R09.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 207. US26-D39-03

As a Support worker, I want to mark a conversation read or unread deliberately, so that my own intent remains useful across tabs.

- **AC26-D39-03-01:** The existing menu offers contextual Mark read/Mark unread over the current qualified source snapshot and personal state; manual unread stays through the current viewing epoch.
  - **AC26-D39-03-02:** Old tabs, retries, refetch, focus or merely replacing tokens cannot immediately clear a newer manual unread or create another actor's state.
  - **AC26-D39-03-03:** Explicit re-open/valid activation or Mark read follows the accepted conditional rules; failed/unknown mutations show honest personal state and never block unrelated safe work.

  Primary precise requirements: REQ26-D39-R10, REQ26-D39-R11, REQ26-D39-R12, REQ26-D39-R17.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 208. US26-D39-04

As a platform owner, I want to derive personal orientation from committed source truth, so that concurrency and access changes cannot create false reads.

- **AC26-D39-04-01:** Commit-ordered original content frontiers, compact current visibility coverage and trusted bounded command/activation contexts govern sparse personal state and combined projections.
  - **AC26-D39-04-02:** No wall-clock/max-message guess, client tenant/actor/source proof, global read fanout, unrestricted service-role path or permanent per-click history is accepted.
  - **AC26-D39-04-03:** Atomic conditional updates, cleanup anti-replay, original merge/Undo behavior and source-order initialization for existing history are proved with current grants/RLS and separate concurrent actors.

  Primary precise requirements: REQ26-D39-R05, REQ26-D39-R06, REQ26-D39-R13, REQ26-D39-R14, REQ26-D39-R18.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 209. US26-D39-05

As a Support and CRM user, I want to keep reading preferences and context separate from message authority, so that the same view is coherent across Asym.

- **AC26-D39-05-01:** The same current-authorized Support reader/personal state works through CRM, retains Compact/Full semantics and derives content validity from the safe shared renderer.
  - **AC26-D39-05-02:** Reading sends/prepares no Email Studio/P6 communication, clears no P17 notification group and creates no Party, Activity or business completion.
  - **AC26-D39-05-03:** Source expiry/revocation, unavailable personal state, bounded refresh and safe compatible rollout preserve privacy and useful current work; actual user/AT/load proof remains required.

  Primary precise requirements: REQ26-D39-R15, REQ26-D39-R16, REQ26-D39-R19, REQ26-D39-R20, REQ26-D39-R21, REQ26-D39-R22, REQ26-D39-R23, REQ26-D39-R24, REQ26-D39-R26.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 210. US26-D40-01

As an authorized Support worker, I want to mark truly unwanted admitted email correspondence aside, so that ordinary work views stay useful without misrepresenting service.

- **AC26-D40-01-01:** One current reviewed command applies an original-source Unwanted designation only to the exact eligible email-origin scope, admitting any exact justified No reply needed correction, history and result atomically.
  - **AC26-D40-01-02:** It is not a fifth work status, deletion, successful resolution or a person judgment; legitimate mixed work, promises and actionable recovery cannot be hidden.
  - **AC26-D40-01-03:** Conflicts, source expiry and pending/unknown effects keep truthful recovery; no row disappears before durable acceptance.

  Primary precise requirements: REQ26-D40-R01, REQ26-D40-R02, REQ26-D40-R03, REQ26-D40-R04, REQ26-D40-R08.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 211. US26-D40-02

As a Support worker, I want to restore current work and find unwanted history, so that a mistake is recoverable without rolling back reality.

- **AC26-D40-02-01:** Persistent Restore opens the valid current source for review under current coverage; the built-in Unwanted view contains only all-Unwanted components, while mixed ordinary work stays ordinary and search labels exact original matches.
  - **AC26-D40-02-02:** Restore cannot revive stale assignment/reminders, disposed content, prior sends or another original's classification; no duplicate mixed whole-component row or invented trash grace period.
  - **AC26-D40-02-03:** Relevant later input or newly actionable owner/delivery recovery resurfaces only its actual current work home; duplicates/already-reviewed evidence do not repeatedly reopen.

  Primary precise requirements: REQ26-D40-R05, REQ26-D40-R06, REQ26-D40-R25.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 212. US26-D40-03

As a Support worker, I want to keep lawful drafts and explanatory notes useful after marking, so that cleanup does not destroy private work or prevent explanation.

- **AC26-D40-03-01:** Private Reply/Note drafts can save/discard when lawful and authorized Internal notes/own-note corrections can explain without Restore; actual external Reply or new owner work requires Restore/current review.
  - **AC26-D40-03-02:** Mark does not cancel admitted or possibly submitted mail, prepare an explanation, create a new content event, change Following or mark notifications read.
  - **AC26-D40-03-03:** Existing uncertain communication retains actual owner recovery and cannot become an eternal blocker once independently reviewed non-actionable.

  Primary precise requirements: REQ26-D40-R07.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 213. US26-D40-04

As an authorized receiving-inbox manager, I want to hold future email from one exact observed mailbox, so that repeated unwanted intake can receive accountable review without a person ban.

- **AC26-D40-04-01:** A separate deliberate action starts from actual admitted inbound mail or an authorized qualified held input and reviews one actual receiving inbox plus single owner-qualified observed From mailbox.
  - **AC26-D40-04-02:** Mark never implicitly enables a hold; Release is not required merely to create it; current handling inbox, CRM email, Reply-To, quoted text and display name cannot select the pair.
  - **AC26-D40-04-03:** Ambiguous/multiple/unsupported addresses and source/authority changes require explicit current correction; no broad domain, plus/dot collapse, all-inbox or freeform rules expansion.

  Primary precise requirements: REQ26-D40-R09, REQ26-D40-R13.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 214. US26-D40-05

As an authorized receiving-inbox manager, I want to inspect and stop sender holds simply, so that policy remains understandable after the original message is gone.

- **AC26-D40-05-01:** Receiving Inbox settings → Sender holds offers Active/Stopped records, exact readonly pair, current authorized history and independent Stop holding; Hold again requalifies the same pair and coverage.
  - **AC26-D40-05-02:** Stop does not restore a conversation or release existing held input; Restore does not stop a rule; a body-expired original does not require retaining its body forever to manage lawful policy.
  - **AC26-D40-05-03:** Lost results reconcile each distinct operation; current receiving changes, coverage/offboarding, finite policy custody and scoped repair remain explicit.

  Primary precise requirements: REQ26-D40-R10, REQ26-D40-R15, REQ26-D40-R20.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 215. US26-D40-06

As an intake owner, I want to apply future-mail policy at first durable acceptance, so that retries and worker delays cannot change what future means.

- **AC26-D40-06-01:** Enable/Stop serializes with the first canonical accepted input/receiving occurrence, including absent-rule creation; retained policy evidence drives deferred routing and qualified exact matched-gate Release.
  - **AC26-D40-06-02:** Sender Date, provider receipt or later worker time cannot rewrite the decision; later rule state cannot attach an old gate, undo a Release or bypass other current safety gates.
  - **AC26-D40-06-03:** D19 retains one-input Release/Dismiss and viable recovery coverage; Stop leaves backlog intact and duplicate callbacks cannot duplicate ordinary admission.

  Primary precise requirements: REQ26-D40-R11, REQ26-D40-R12, REQ26-D40-R14.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 216. US26-D40-07

As a platform owner, I want to keep unwanted handling separate from CRM and communications, so that cleanup cannot become a hidden consent or message action.

- **AC26-D40-07-01:** Support owns designation/work projection, canonical intake owns the hold, P17 owns governed authoring/preparation and engagement, P6 owns actual local/provider effects, and CRM/business domains retain their facts/actions.
  - **AC26-D40-07-02:** An active inbound hold is not outgoing suppression, unsubscribe, portal suspension, provider spam training or CRM-person deletion; only a current ineligible Unwanted source fences its own exact definitely-unsubmitted optional mail.
  - **AC26-D40-07-03:** Qualified Release keeps original D13 utility/courtesy/human precedence, never a fresh window or D28 completion; actual/possibly submitted evidence and new actionable recovery remain truthful.

  Primary precise requirements: REQ26-D40-R21, REQ26-D40-R22, REQ26-D40-R24.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

### 217. US26-D40-08

As a platform security and operations owner, I want to enforce and operate the two independent effects safely, so that mistakes remain bounded and diagnosable.

- **AC26-D40-08-01:** Trusted tenant/actor/receiving/source keys, valid original topology, current operation-specific access, effective grants/RLS, finite custody, stable indexed pages and atomic result/history/continuation protect every path.
  - **AC26-D40-08-02:** No broad CRUD, new general engine, synthetic sender identity, raw-address diagnostics, history laundering, hidden legitimate work or unsupported rollback is permitted.
  - **AC26-D40-08-03:** Source-first migration, qualified parser/owner interfaces, accepted 25-initial/50-maximum pages and all exact release/operating controls precede activation; current code and helper probes are not runtime proof.

  Primary precise requirements: REQ26-D40-R16, REQ26-D40-R17, REQ26-D40-R18, REQ26-D40-R19, REQ26-D40-R23, REQ26-D40-R26, REQ26-D40-R27, REQ26-D40-R28, REQ26-D40-R29, REQ26-D40-R30.

  All additional adopted companion requirements and individual proof/control cases for this story are specified in the integral detailed registry and its traceability map.

## Implementation Decisions

### G01 — One authoritative boundary for each fact

Support owns original conversations and their source relationships, current Support work, assignments, permitted collaborations, private Support drafts, Support-specific preference semantics and the selected source-specific corrections. The shared personal-preferences capability owns persistence of the personal Compact/Full reading choice. CRM owns authoritative people, organizations, relationships and CRM-specific facts. Giving, finance, document, care, identity and other business domains retain their own commands, approvals, validation and history. A Support link or resolution never transfers authority or proves the associated business effect completed.

Use the canonical shared business API boundary for sensitive/multi-record commands and provider integration. App handlers remain thin. Use approved database collection/read projections for browser-visible data; do not add feature-local database clients or treat a read model as write authority. Source-first mutation and complete authorized projections are the permanent path, not preservation of an incompatible current adapter.

### G02 — Identity, audience and permission remain distinct

Keep requester, observed mailbox, message participant, authenticated user, acting profile, CRM Party, represented organization, assignee and record owner distinct. Tenant, authenticated actor and command authority come from validated server context; external provenance comes from the verified canonical ingress/receiving occurrence. An observed address, display name, matching CRM email, thread reference, assignment or claimed author does not establish verified human identity, representation or access.

Recheck each current operation's source, tenant and capability at the authoritative mutation and at result/replay access. A broad staff/admin entry gate is not sufficient for every action. Preserve the ratified distinctions between own-note editing, source restriction, policy management, held review, private draft ownership, CRM context and consequential owner actions. Background service credentials do not create blanket permission.

### G03 — Data invariants and database enforcement

Use existing canonical identity types and same-tenant relationships. Preserve immutable original/source/receiving/owner identities and trusted attribution; constrain closed state combinations, exact revisions, durable-effect uniqueness and source generations. Multi-record effects and required local history/dispatch obligations commit atomically under their actual owner, with deterministic conflict handling. A permitted update must not change a row into a forbidden tenant, source, author, audience, owner or state.

Qualify grants and every effective SELECT/USING/WITH CHECK policy, policy union, view, RPC, function owner/search path/EXECUTE right, Storage route and privileged service path. RLS alone is not the application boundary; application denial alone is not database proof. A column default, string naming convention, broad service role or application-only foreign-key assumption is insufficient. Deletion/cascade rules must preserve independently owned source, communication, audit and business facts. Apply each detailed retention/correction contract rather than imposing a universal append-only or never-delete rule.

### G04 — Original source and current combined presentation

Original source identity, custody, received/admitted evidence and historical events remain authoritative when current work is moved, merged, detached, linked, restored or viewed elsewhere. Combined membership, reader context and summaries are projections over qualified originals, not copied conversations with new ownership or universal access. The current component's work, assignment, priority and reminder plan, and guarded work-home transfer decisions/receipts, remain authoritative facts maintained by their owning commands. Never reconstruct that current plan from dormant original states. Topology changes bind the exact currently authorized source set and revisions; they cannot silently include later or hidden originals.

Preserve original eligibility, audiences, retention, private drafts, reading state, outstanding obligations and immutable communication facts according to the detailed decisions. Unknown legacy provenance remains explicit and restricted for qualified reconciliation, not guessed from names, dates, labels or current addresses. Merge and CRM identity changes cannot fabricate source permissions or rewrite historical authorship.

### G05 — Work, communication, reading and business outcomes are independent

Open, Waiting for requester, Waiting on our side and Resolved describe Support work. Assignment, personal read/unread, Follow, notification engagement, composing awareness, held review, unwanted designation and provider delivery are separate facts. User actions change only the explicitly admitted facts. Timers and newly actionable owner/provider evidence create actual review work without inventing human content or successful business completion.

Corrected historical mistakes retain their actual owner/audit path; generic cleanup cannot erase valid deadlines, misses, promises, survey cohorts or accepted effects. “No response,” “No reply needed” and Unwanted remain their distinct ratified dispositions, not synonyms for successful service. Do not derive status from last-message direction, current unread count or a provider callback alone.

### G06 — Complete Email Studio/P17 and P6 seam

Email Studio/P17 owns governed reusable content and publication, canonical authoring/schema, role/brand presentation, permitted variables, whole-message preparation and separately governed notification presentation/engagement. Support owns the human reply/draft and source-specific intent/eligibility; it does not build a parallel template studio or infer campaign/consent authority. Shared authoring validation does not turn an Internal-note Post into an email preparation.

For external communication, use the existing immutable prepared-message and sealed provider-submission boundaries. Freeze the qualified audience, facts, content, locale/fallback, presentation, sender/return route, connection and material identity under their owning contracts. P6 owns actual recipient/channel communication, dispatch, provider evidence and recovery. Queued or prepared is not sent/delivered; an ambiguous result cannot be retried as a new semantic intent or changed envelope. Reconcile under the original durable business identity and the actual bounded recovery rules.

Local in-product communication follows its existing no-provider-artifact contract and available projection. It does not create provider preparation, bytes, account identity, provider state or provider outcome. Direct mentions, source attention and optional Following retain their distinct producers and eligibility; viewing a conversation or housekeeping does not blanket-read/archive notification groups.

Current-source Unwanted may remove authority only for its own ineligible definitely-unsubmitted optional material. A future-mail hold is inbound per-occurrence policy, not an outbound or consent block across all conversations with the address. Cleanup creates no mail, template publication or provider spam report. Already or possibly submitted communication remains immutable and recoverable under its actual owner.

### G07 — Canonical intake and durable execution

The receiving/intake owner establishes verified provider ingress, durable input/recipient occurrence, receiving identity, body/attachment availability, qualified correlation and review gates. Source documents distinguish complete empty/file-only input from failed or unavailable hydration. Unsupported or uncertain input remains an owned truthful recovery condition, not silently dropped, passed through or admitted as complete.

Durable execution uses the existing product dispatch ledger, claims and canonical job entries. Workflows execute work; they do not own product state. Retain the qualified original intake/hold acceptance decision through retries, deferred routing and late hydration. This is purpose-specific: D6 still-pending automatic first assignment deliberately reevaluates the current published assignment policy while retaining original work identity and old/new decision lineage; D8's handoff mode remains bound once to its qualified episode. Apply each decision's actual current-versus-frozen policy rule rather than one universal snapshot rule. Keep workflow envelopes identifier-only and minimized. Deduplicate durable business effects, not merely HTTP delivery or content similarity. Provider outage and worker restarts cannot justify lost inputs, fresh send identities or a second rules engine.

### G08 — Native CRM continuity

The same qualified Support source is reachable from Support and authorized CRM context with preserved return position and private draft intent. CRM-only page loading, shared addresses and record linking are not proof of Support reading or permission. Unlinking, Party merges, archival, restrictions, deletion and permission changes use current domain authority without duplicating authoritative bodies/Activity or granting access through associations.

Protected disclosure, contact changes, receipts, giving/refunds and care actions use the owning domain's minimally sufficient assurance and command. Preserve approvals and audit attribution. Support records a truthful handoff/outcome reference; it does not complete the business action through a note or status. Asym Postgres is the CRM authority; stale Twenty/synchronization prose must not reintroduce a backing provider.

### G09 — Privacy and retention follow purpose and source

Apply the detailed source, native-note, guide, draft, attachment, prepared-artifact, held-input and policy-control custody contracts independently. Display actual availability/recovery deadlines; do not manufacture a universal retention period, cleanup grace window or new lifetime through view, merge, Mark/Restore or retries. Preserve independent legal/preservation requirements under their owners without treating a sender hold as a preservation hold.

Current restriction/expiry precedes authorized reads, previews, search, snippets, counts, pagination, signed access, logs and derived content. Source restrictions and negative generations must survive cache invalidation, cleanup, backup restore and stale clients. Already disclosed email cannot be recalled by changing a record. Retained operational metadata must have an explicit minimal purpose and finite schedule; do not retain sensitive body copies merely to explain a policy or retry.

### G10 — UI and editor continuity

Use the established shared Base UI system and exact base-maia theme, semantic tokens and canonical Tiptap profiles. Preserve selection, focus, scroll, Reply/Note separation, private candidate content, IME composition and recipient intent through navigation, incoming updates, compact/full changes and recovery. Place actions where the task occurs and use the accepted plain-language labels, concise confirmations and honest states. Do not add dialogs, settings, builders or approval steps absent a ratified need.

Keyboard, touch, assistive technology, focus return, reflow/zoom, long international names/addresses, localization/Thai/RTL, reduced motion and low-bandwidth states are required outcomes, not cosmetic follow-up. Automated accessibility checks supplement manual and intended-user evidence. Expose errors and unsupported content clearly; blank wrappers, disabled mystery buttons and silent skips are not successful presentation. Action targets and text/reflow requirements follow the exact accepted clauses, including D29-X01's distinctions.

### G11 — Concurrency, idempotency and unknown outcomes

Admit each consequential action against its exact current source/work/audience/content/policy/generation revision and trusted actor. Preserve the distinct required concurrency protocols for drafts, note corrections, reading, source merge/correction, assignment, timers, held Release, future policy and Send. Do not replace them with a universal timestamp, last-write-wins upsert, global lock or transport-only key.

Lost responses reconcile the same durable effect under current authority. HTTP cancellation is not rollback, absence of a client acknowledgment is not noncommit, and an optimistic UI is not durable truth. Conflicts preserve permitted user work and offer the current specific recovery; stale autosaves cannot resurrect submitted/discarded content, and stale retries cannot stop a newer policy generation. Actual current permission loss takes effect without waiting for a browser or workflow to cooperate.

### G12 — Honest efficient read models

Reuse canonical current read projections and stable complete pagination with the detailed authorized population and limits. No browser-only filtering of already exposed forbidden rows, eager full-body hydration or mounted editor instances for ordinary list rows, staff-by-message fanout or unbounded in-memory population is acceptable. The authorized conversation reader still loads and safely renders its qualified paged content. Search matches, counts and report denominators retain source/current-visibility meaning; errors and partial results are not an empty population.

Measure the ratified workload dimensions, query/lock behavior, concurrency, tenant skew, source size and latency budgets in production-shaped isolated qualification. Where the session deliberately requires measured values before activation, record that concrete qualification deliverable instead of inventing a universal number or promising instant operation. Preserve all chosen numerical boundaries exactly. Realtime is a qualified invalidation/advisory transport, not durable truth, continuous authorization or proof that a teammate remains present.

### G13 — Operations and audit have distinct records

Maintain the accepted durable business/security evidence and attribution for consequential source, policy, Send and owner actions. Keep it separate from minimized technical metrics and personal transient state. Do not create an employee readership log, store sensitive source payloads in diagnostics or confuse logs with recoverable business outcomes. Ordinary success should not generate a notification storm or new operational queue.

Every accepted residual control retains its signal, threshold, accountable owner role and response. Assign real accountable operators and qualify custody, review coverage and numerical budgets before activation. Monitoring is not a substitute for authorization, integrity or feasibility proof. Security revocation/offboarding proceeds even when it raises an owned coverage problem; do not block departure or grant access merely to preserve staffing.

### G14 — Source-first migration and legacy closure

Inventory actual legacy use, types, source links, recipient data, pending work, provider identities, history, custody and incompatible writer paths. Map only what can be proven, preserving original source facts; use explicit restricted/read-only provenance for unresolved mappings. Do not infer personal reads, sender holds, contacts, resolution credit, timestamps or renewed retention from old fixtures/counters/labels. Retire or fence competing writers before activating their replacement.

Roll out compatible data/constraints and source-control generations, authoritative commands and qualified readers before the new UI/automatic effects. Exercise mixed versions, interrupted backfills, replay, cleanup and backup/restore. Rollback preserves accepted effects, active restrictions, held custody and indeterminate communication; it does not simply restore the old broad writer or replay provider effects. Keep scoped kill switches and a rehearsed roll-forward/recovery path.

### G15 — Preserve established scope and shared owners

Do not add a requester My messages archive, broad external forwarding product, new mail provider suite, live chat/telephony/SMS/offline send queue, generic workflow/approval engine, second CRM, broad contact blocklist, automatic Party creation, unrestricted CRM search or new transcript/privacy-export product by implication. Preserve each detailed exclusion, including the exact selected guide/file scope and future configuration boundaries.

AI remains a core platform direction within human/tenant authority; the current Support decision does not introduce unratified AI models, indexes, extraction, automatic actions or claims about human identity. Phase34 remains the sole configurable rules vocabulary. Narrow typed Support/intake behavior does not justify another builder.

### D1–D13 — Decision-specific implementation decisions

**IDA01 — Canonical Support commands and projections.** One authoritative Support module owns original-source identity, current component handling, work/history/reminder control, assignment and source-scoped relations. Its public commands accept validated target/intent data and expected current revisions; tenant, actor and permission come from trusted context. Return the original command receipt separately from the latest authorized state. All alternate UI, keyboard, bulk, macro, import, service and worker entry points use the same authority. Database constraints, least-privilege grants and current policy close direct-write/read bypasses.

**IDA02 — Native CRM and owner actions.** CRM Parties and owner records remain authoritative. Support relevance and actual source-message attribution are separate typed facts; their permission-filtered union provides reverse discovery without copying CRM data or emitting fake communication. The shared CRM and Support interfaces preserve return context and private draft ownership. Protected changes run through the actual owning command, assurance, validation, approval and audit. Linking, resolving or transferring a conversation is never the underlying business effect.

**IDA03 — Governed authoring and external communication.** Support owns human content and reviewed intent. Email Studio/P17 supplies qualified reusable content/publication, authorized variable resolution, shared presentation, canonical preparation and finite execution-material classes. Native group transport preserves each recipient-copy authority while one sealed submission carries the reviewed visible group. P6 owns dispatch, actual member evidence and bounded exact-envelope reconciliation. No provider call occurs inside the database transaction; no new sender, compiler, provider-template authority or shadow delivery ledger is introduced.

**IDA04 — Intake, correlation and source continuity.** The canonical receiving owner establishes durable accepted input, trusted receiving identity, recoverable body/file custody and original correlation. Threading aids never authorize identity, recipients or CRM actions. Resolve original source first and current handling separately. Merge/Undo, related work, referral and staff-origin new threads preserve source facts and use one current-control mutation boundary. Unknown input or provenance remains owned visible recovery; no heuristic fallback silently chooses a tenant, thread or recipient.

**IDA05 — Work, assignment and shared durable execution.** Current work plus append-only attributable transitions owns the four meanings; timers and owner events create causally qualified review. Initial routing, temporary coverage and confirmed access-loss handling have distinct business sources and control fences. Product facts own permission and effect identity; shared claims, dispatch and bounded reconciliation provide execution. No generic second automation, task, scheduler, identity or event-sourcing platform is created. Internal assistance reuses the shared task owner or an exact owner operation and records narrow source interests rather than copied task state.

**IDA06 — Atomicity and current authorization.** Use guarded transactions and consistent lock order for the actual affected current controls, not a global distributed lock. Admit authoritative effects, required local history, immutable command identity and durable secondary intent together. Provider IO is separately sealed and fenced. Bind actual current policy/scope generations where the purpose requires them; leases, sender dates, UI disablement and generic updated-at values are not business authority. Lost responses reconcile original effects; stale input is never automatically retried as a fresh command.

**IDA07 — Compatible qualification and operations.** Shared identity, permission, task, CRM, preparation/delivery and receiving contracts are prerequisites where currently incomplete. Introduce compatible readers/schema before new effects, verify and fence all old writers, migrate known facts without replaying business effects, and qualify both N/N-1 and rollback after new data exists. Feature stops preserve accepted work, authorized inspection/correction and same-effect reconciliation. Use complete indexed authorized projections, bounded tenant-fair workers and the exact published performance/monitor contracts. Assign actual accountable people and alert/recovery surfaces before activation.

### D14–D26 — Decision-specific implementation decisions

Use the following stable capabilities and interfaces. Their complete invariants and values are the normative requirements, not private implementation helpers or a required file layout. A shared owner must be qualified for the exact purpose; mentioning reuse does not claim its current implementation already conforms.

### MOD26-D14 — Reply-target policy, calendar and response-coverage owner

Publishes immutable inbox configurations and calendars, admits original-correspondent contributions, qualifies exact human reply coverage from P6 acceptance, and exposes current owed work and honest due-cohort reports. Target changes neither send email nor settle CRM/owner work.

### MOD26-D15 — Personal Follow intent and source-activity producer

Owns self-authorized original-source epochs and the finite E1–E4 eligible activity contract. P17 owns presentation/engagement; P6 owns closed member release and optional email. Required direct attention remains independent of Follow and channel choices.

### MOD26-D16 — Source restriction and owner cleanup coordinator

Admits exact selected original-content corrections once, enforces current read/preparation/dispatch restrictions atomically, and dispatches identifier-only cleanup obligations to registered byte owners. No reveal archive or universal eraser is created.

### MOD26-D17 — Support content policy and source-purpose evaluator

Owns one finite tenant policy, immutable effective history, original content frontiers, native-human/purpose anchors, exact expiry and same-interval purpose review. Uses the restriction owner for cleanup and qualified independent custodians for preserved evidence.

### MOD26-D18 — Email Studio Saved Section specialization and Support insertion adapter

Email Studio owns one canonical reusable source with personal and Shared scopes, revisions, locales, assets and publication. Support performs a source-qualified structured copy into the actual Reply or Note draft with provenance and safe Undo. No synchronization or separate HTML authority exists.

### MOD26-D19 — Canonical held-input review and admission owner

Keeps receipt, gates, review decisions, source custody and admission orthogonal. Qualified reviewers decide one immutable input/recipient occurrence; technical/security/care/platform exceptions retain their owners. Release/Dismiss do not create future trust or CRM identity.

### MOD26-D20 — Shared named views with a Support subject profile

Owns exact versioned predicates and definitions separately from temporary working queries and self-owned pins/layout. Support supplies current authorized semantic query predicates; CRM retains its fixed source anchor. Definitions cannot authorize actions or protected data.

### MOD26-D21 — Curated Support label catalog and original membership owner

Keeps immutable term identity, normalized names, reversible catalog lifecycle and explicit Add/Remove source effects. Reports show current categorization for an exact cohort, without tag propagation into CRM or invented historical snapshots.

### MOD26-D22 — Source-qualified literal search projection

Indexes only eligible source-visible item text and filenames under current revisions. Exact query normalization/matching follows the canonical input contract; authorization precedes candidate matching and aggregation. Search is a read capability, not an attachment parser, CRM corpus or AI engine.

### MOD26-D23 — Email Studio signature section, public-responder resolver and canonical editor profiles

Keeps source publication, inbox binding, one copied managed signature slot and actual public responder facts distinct. Tiptap edits a canonical document through purpose profiles; P17 validates/compiles and P6 freezes/delivers the exact complete message.

### MOD26-D24 — Curated shortcut definition and compound human-reply admission

A fixed desired-state patch references one exact Shared wording dependency. Selection stages one private coherent proposal. One qualified local admission claims ready P17 preparation and commits message, allowed status/handling/label effects, history and dispatch intent atomically; provider I/O is outside it.

### MOD26-D25 — Tenant receiving connection, candidate route and proof owner

Both address paths converge on one qualified receiving contract. Three explicit shared-owner extensions are required: a separately protected incoming credential purpose under the same proved account; shared authenticated incoming/outgoing ingress with distinct reducers; and P17 managed Support reply-destination proof. Capture-capable candidate custody precedes ordinary activation without enabling ordinary sending.

### MOD26-D26 — Staff-recorded Support admission and qualified CRM projection

One command creates a bounded original request with source brief, current handling and exact reviewed relevance/source references. Manual-ready work does not require email-ready configuration. Both entry surfaces open the same canonical detail; later Start email thread is a separate qualified audience/preparation/delivery action.

### D27–D40 — Decision-specific implementation decisions

1. **Shared owner boundaries.** Support owns conversations, work, original-source disposition, Staff guides, feedback and private working state; shared personal preferences own the two-value reading choice; native CRM owns Parties and relationships; the contact/source owners qualify endpoints; P3 owns contactability and the persistent feedback-purpose opt-out. P17/Email Studio owns canonical purpose-aware authoring, governed publication, immutable complete preparation and separate notification presentation/engagement. P6 owns actual local/provider communication and reconciliation. Canonical intake owns receiving occurrences, held decisions and the fixed future-mail predicate. None of these read surfaces becomes another CRM, transport engine or generic workflow platform.

2. **Source and protocol contracts precede UI activation.** Implement current owner-qualified source identities, complete query populations, accepted-input and publication/control generations, trusted actor attribution, constrained tenant-aware relationships and effective database/storage authorization. Direct broad writes, stale role claims, guessed email/slug identity and generic Tiptap normalization cannot substitute for the accepted boundary. The registry spells out each changed producer, consumer, schema-purpose and command requirement; current scaffolding is not declared correct by reuse.

3. **Authoritative atomic commands.** Save, publish, post, send, mark, restore, policy changes, protected actions and their exact required history/continuation use durable semantic identities and current concurrency checks. Different operations remain separate. After a lost response reconcile the original receipt before deciding whether another operation is permitted; retries never create replacement draws, renewed deadlines, duplicate notes or mail. External I/O is controlled by its owning adapter, not included inside a pretend distributed transaction.

4. **Independent original sources and exact topology.** Merge, Undo, related requests, CRM link changes and current handling never rewrite original message/guide/opportunity/draft identity, scope, clocks or effect history. Derived combined views are permission-aware projections. D40’s current-source designations refine earlier blanket Open behavior for all-Unwanted results; later real work ends only the affected exclusion. D38 extends the same private finder with an independent Note purpose while D35 correction state remains local.

5. **Canonical document purposes and safe source presentation.** Use the shared Tiptap architecture with closed purpose/version validation before normalization. Staff guides are restricted reusable instruction sources; Notes are never outgoing email; quotations and public guide links preserve trusted source dependencies; static readers do not become editors or write authorities. Current privacy/source generation applies before lookup, rendering, preparation and actual send crossing.

6. **Finite retention and adverse barriers.** Declare and qualify every actual content, derivative, control, receipt, session, export, backup and log class under its proper owner. Restriction and current admission gates precede eventual purge. Restore cannot resurrect disposed source or reset a different source’s clock; independently permitted body-free evidence does not become a secret body archive. Derivative and policy custody remain distinct from original-message lifetime.

7. **Precise times and quantities.** Retain all accepted limits in the detailed registry, including independent reminder/calendar arithmetic, feedback quiet/utility/frequency/action windows, file resources, presence liveness/capacity, autosave cadence, pagination and report cohorts/budgets. Distinguish product bounds and required test fixtures from measured capacity. No new universal timeout, participant count or grace period is implied.

8. **One coherent visual system.** All staff UI consumes shared Base UI/base-maia and semantic tokens; public Help uses its qualified public-presentation owner. Small contextual actions, persistent honest recovery, stable focus/place and independent private purposes survive navigation. No fourth permanent Guidance pane, generic settings builder, silent forced self-service or extra workflow is introduced. Future full Overview configuration remains accepted direction through compatible shared reporting, not a builder shipped in this release.

9. **Compatible rollout and permanent correction.** Source/schema/grants/readers and operator custody precede new writers and UI. Inventory and fence alternate/legacy bypasses; mappings require trusted evidence, never fabricated identity, invitation history or source clocks. Retained supported reading/recovery and adverse fences survive disablement. New data requires qualified compatible rollback or roll-forward, not dropping fields or replaying effects.

The following stable capabilities expose the qualified commands and reads detailed in their requirement families. They are owner responsibilities, not a mandate for fourteen new services or tables.

- **MOD26-D27 — Guidance sources and contextual consultation.** Public selections resolve exact qualified public Page variants; Support owns private Staff-guide candidate/publication/lifecycle and search. Insertion copies only eligible Public link material through the canonical draft boundary; Internal remains consultation-only.

- **MOD26-D28 — Feedback policy, opportunity and protected response.** Support owns policy generations, random opportunity decisions, completion/cohort evidence and response review. P3 owns independent feedback contactability; P17/P6 own the bounded two-action invitation and actual communication.

- **MOD26-D29 — Contact purpose and source-qualified Help consumers.** Public and authenticated consumers use one certified primary Support acceptance boundary with their own actual identity/context qualification. Optional guides and visitor confirmation remain independently qualified presentation/child outcomes, never a second intake authority.

- **MOD26-D30 — Support overview projections.** Source owners supply complete, currently authorized Work now and historical grains with explicit evaluation, scope and detail contracts. Shared reporting composition can evolve without making Support own another domain’s facts or requiring a current dashboard builder.

- **MOD26-D31 — Follow-up resolver and shared reminder commands.** One calendar/elapsed resolver returns the exact reviewed instant, zone and interpretation; existing Support reminder admission, history and durable due recovery remain authoritative. A picker is not a separate scheduler or business deadline.

- **MOD26-D32 — Private attachment renditions.** The shared source-qualified file capability owns isolated bounded conversion, generation manifests, private reads and derivative disposal. Support, CRM and other legitimate readers reuse this capability without promoting technical renditions into original files, imports or official generated documents.

- **MOD26-D33 — Personal reading presentation.** Shared preferences persist one tenant/profile Compact-or-Full default; the common safe reader folds only proved repeated regions and keeps complete authorized Find/navigation. Temporary disclosure does not mutate the saved preference or source.

- **MOD26-D34 — Qualified ephemeral composing projection.** Trusted control/observer sessions and bounded source-authorized snapshots supply advisory staff composition. Realtime provides private invalidation hints, while actual collision protection remains the authoritative send/work boundary.

- **MOD26-D35 — Own-note correction and revision history.** One Support command validates the original author, current source and exact canonical correction, then atomically advances a revision and result. Local unsaved edits, retained history and privacy disposal remain distinct; correction does not republish mentions or new work.

- **MOD26-D36 — Deliberate quotation transformation.** A source-qualified selection copies an exact reviewed excerpt into one canonical Reply occurrence with stable provenance. Typed edits, source changes, disclosure review and preparation use that known dependency; neither reader nor provider dispatch fetches replacement source content.

- **MOD26-D37 — Private draft owner and finder.** Complete conditional bundle commands, finite receipts and terminal generations preserve one original/profile/purpose draft. The authorized finder projects metadata; Tiptap remains its active editor, with exact save, restore, conflict, discard and send-consumption semantics.

- **MOD26-D38 — Note-purpose draft and publication admission.** The same private draft owner adds an independent new-Note purpose. Add note atomically admits canonical note/assets and required post-derived obligations while consuming the exact draft; external Reply plans/audiences/preparations never enter the Note bundle.

- **MOD26-D39 — Private orientation state.** Source commit frontiers, authorization coverage and current activation/manual-intent generations govern exact personal acknowledgment. The common qualified reader and manual commands share this boundary across Support/CRM; it is neither a readership ledger nor P17 notification engagement.

- **MOD26-D40 — Original unwanted designation and exact-pair intake holds.** Support owns Mark/Restore over reviewed eligible originals and truthful work projection. Canonical intake owns independently managed receiving-inbox/mailbox holds and first-acceptance policy decisions; D19 retains single-occurrence Release/Dismiss.

## Testing Decisions

The founder confirmed one primary product acceptance harness through real authenticated Support/owner commands and authorized projections, including canonical intake/job entries, backed by disposable local Supabase. Use the established Vitest, Playwright, migration and SQL-proof patterns. The harness is testing infrastructure around the existing architecture, not a new production service or a claim that the current complete fixture already exists.

Keep the existing unit-test lane offline and secret-free. Wire the real-backend acceptance suite into a distinct integration invocation using the existing frameworks and local fixture/migration conventions; do not place live database calls into ordinary unit tests or assume the current integration gate already executes this missing suite. Seed synthetic identities through isolated test setup, then exercise actual session/command boundaries. Browser/API acceptance must assert that demo fallback is disabled and the backend is the intended disposable target. New production fixture endpoints or caller-controlled tenant/time/role shortcuts are not justified by the tests.

Complement that seam only where its observations cannot prove the contract: direct database grants/RLS/Storage/function and concurrent-connection tests; complete real-browser journeys over the same backend; and actual external-provider qualification. Deterministic external substitutes control network failures and ordering, but cannot replace real database authorization, durable owner writes or the P17/P6 state being asserted. Unit tests remain useful for meaningful parser/calculation boundaries without mirroring internal call sequences.

Each story carries observable setup, action and expected outcomes, including negative and failure cases. Test both allowed and forbidden state transitions, same/cross-tenant access, stale revisions, multiple sessions, duplicates, late/out-of-order input, lost responses, postcommit secondary-effect failure, expiry/restore, interrupted migration and truthful recovery. Assert the actual owning source and absence of duplicate/forbidden effects, not merely a response code or a mocked call.

Real browser proof covers complete Support-first, CRM-first and selected Help-entry journeys, native editor and read behavior, exact audiences, privacy, focus/IME/mobile/reflow and recoverable failures. Add axe and the existing navigation/performance patterns, plus manual keyboard/assistive-technology and the accepted intended-user task studies. A screenshot, source probe, synthetic persona or automated axe pass cannot be labeled user validation or full accessibility conformance.

The real-backend lane must assert its isolated target, actual authentication and migrations; demo or placeholder fallback, missing fixtures, a skipped prerequisite or “Conversation not found” cannot satisfy a required success case. Never use the opaque existing production environment file or live donor/care records as test fixtures. Provider proof uses an isolated explicitly authorized environment and preserves the distinction between deterministic tests and actual provider behavior.

Preserve every decision's exact proof cases and operational threshold. Consolidate shared setup and repeated infrastructure, not the observable outcomes. Every test has a stable story/requirement/acceptance mapping; required but unexecuted evidence remains visibly unexecuted. TDD and focused tests precede the applicable repository checks when implementation later occurs. Documentation validation now does not report feature tests as passed.

### D1–D13 — Decision-specific testing decisions

**TDA01 — Confirmed primary acceptance seam.** Drive the real authenticated Support/owner public commands and authorized read projections, plus canonical intake and durable-worker entry points, against disposable local Supabase with actual migrations, synthetic separate tenants, real principal/profile identities and current permissions. Assert user-visible outcomes and durable owner effects. The complete D1–D13 proof matrices below are mandatory; they are not replaced by a generic happy-path smoke.

**TDA02 — Database and concurrency proof.** Exercise real grants, RLS old-row and resulting-row policies and unions, raw-table denial, approved views/RPC execution, Storage and independently checked service paths. Use distinct connections and actual commit barriers for send/work, budget, reminders, rotation/capacity, coverage/end, loss/restore, link/Undo, merge/source, task/result and referral races. Check permanent effect identity, current control and authorization, absence of partial writes, and permitted replay after unknown responses. Test mixed-version writers, effect-free backfills, cleanup/restore and complete beyond-page-limit populations.

**TDA03 — Real browser and intended-user evidence.** Extend the existing Playwright/shared Base UI/base-maia/Tiptap patterns over the same real backend, with the authentication bypass explicitly disabled. Prove account-free request continuation, Support-first and CRM-first journeys, exact audiences and action effects, preserved drafts/position, internal/private content boundaries, independent work/referral/correction, honest errors and all accepted keyboard/IME/focus/mobile/reflow/localization/accessibility tasks. Automated accessibility and screenshots supplement manual assistive-technology and representative-user task studies; neither proves the latter.

**TDA04 — Qualified external boundaries.** Deterministic tests may substitute genuinely external provider/file-processing IO to control timeout, partial evidence, duplicates and late events. Do not mock the internal database, authorization, P17/P6 ownership or CRM effect being asserted. Separately qualify actual receiving, native To/Cc/member evidence, MIME, actual RFC message identity, threading, contactability, current provider limits and ambiguous submission in an authorized isolated environment before activation. Source probes, dry runs and mock success are evidence of their narrow execution only.

**TDA05 — Hermetic, truthful release evidence.** Reuse existing unit frameworks without disabling safe unit isolation; provide the qualified integration runner/profile that can use the disposable backend. Reject hosted/production targets, preserve opaque shared environments, fail missing qualification prerequisites rather than silently skip, and never treat Conversation not found as success. Record exact source/schema/dependency versions, workload dimensions, plans, latency/lock/query observations and per-proof result. No runtime tests or provider messages are claimed by specification publication.

### D14–D26 — Decision-specific testing decisions

The founder-confirmed primary seam uses real authenticated Support/owner commands and authorized projections, plus canonical intake/job entries when an event starts there, against disposable local Supabase/PostgreSQL with actual application/domain code and migrations. Synthetic tenants and distinct authenticated-user/profile identities exercise current permission boundaries. Do not mock database writes, authorization, P17/P6 ownership or the CRM mutation being proved.

Run direct database-grant/RLS/USING/WITH CHECK/function/view/Storage and privileged-path cases separately where API results cannot prove them. Use separate concurrent database sessions and real commit barriers for races. Real Playwright journeys use the same backend, actual routes, Base UI/base-maia and canonical Tiptap, with demonstration fallback disabled. Unit tests remain offline; the integration lane must explicitly target disposable local services and reject production/hosted targets.

External provider substitution is limited to deterministic transport behavior/failure/ordering. Actual receiving, sender/destination proof, credential scope, webhook authentication, hydration, Resend acceptance and email rendering require independently authorized isolated real-provider qualification before activation. A missing credential or fixture is unexecuted/failed qualification, not a skipped pass. This specification runs no runtime or provider test.

Each AC in normative volume B preserves its exact original observable outcome, boundaries and evidence limits. Operations controls retain each named signal, threshold, owner and response. Record supported numeric capacity profiles where the contract requires measured deployment values; no estimate or vendor limit substitutes. Intended-user task evaluation, manual keyboard/assistive technology, automated accessibility checks and source inspection remain separate kinds of proof.

### D27–D40 — Decision-specific testing decisions

1. The confirmed primary acceptance boundary is the real authenticated public Support/owner command and authorized projection boundary, plus canonical intake and durable-worker entries. Run actual application code and migrations against disposable local Supabase with synthetic tenants and distinct real test actors. Control only qualified external provider/file adapters. Never mock the database/authorization/owner effect that a test claims to prove.

2. Drive the real Support-first, CRM-first and qualified public/app Help journeys through committed Playwright patterns over that same backend. Verify actual persisted results after reload, another tab and another actor. Current shell smoke, not-found alternatives, demo bypass, legacy ticket tests and mocked template/test-send UI are prior art with limited scope, not acceptance evidence for this contract.

3. Add focused actual grants/RLS/column/view/RPC/Storage, resulting-row, separate-connection concurrency, migration/backfill and mixed-version proof. Browser denial does not prove direct database denial. Parse/render/profile and calendar pure tests remain useful where they test behavior; they do not replace the highest workflow seam.

4. Preserve every accepted per-decision proof case and operating control in the detailed registry and traceability. The registry’s source P/O identities retain exact accepted positive, negative, boundary, retry, privacy, lifecycle, numeric and production-shaped conditions. Shared setup may be consolidated; distinct required outcomes may not. Required fixture or authority absence fails qualification or is explicitly unexecuted, never a successful skip.

5. Keep controlled deterministic tests separate from actual provider contract qualification, real file-converter fidelity/security/resource proof, production-build navigation/load evidence, manual keyboard/AT/IME/mobile checks and intended-user studies. A synthetic scenario or expert walkthrough is not a participant; axe or a screenshot alone is not accessibility or usability conformance. The D29-X01 reflow/focus/target checks supplement rather than replace existing resize and mobile-keyboard tests.

## Out of Scope

This publication does not implement the feature, create an implementation-ticket graph, connect production inboxes, alter DNS, send real messages, recruit study participants or activate provider/data migrations. It does not redesign unrelated CRM, finance, care, CMS or platform administration. Per-decision exclusions remain normative and are not replaced by this shorter list.

### D1–D13 — Decision-specific out of scope

No standalone help-desk replacement for Asym; second CRM, task/permission/automation/template/delivery engine; transcript synchronization; identity matching by email as authorization; all-workflow ticket model; implicit claiming or status changes from reading/sending; autonomous topic splitting/merging/closure; copied internal content in external replies; provider-key workaround for uncertain mail; workforce/shift/calendar product; generic SLA builder; or unselected feature parity. Later D14–D40 additions apply only as explicitly ratified and are defined in their normative volumes.

### D14–D26 — Decision-specific out of scope

No second CRM, contact synchronization, unrestricted care/financial access, automatic Party creation, universal records platform, reveal archive, generic timer/rule builder, alternate email sender, provider mailbox synchronization, historical mailbox import, full provider-management console, raw HTML editor, AI/semantic search, embeddings, OCR/attachment-content search, autonomous shortcut execution or whole-platform workflow redesign is introduced. D24 future AI and D22 broader-search direction remain reserved explicit later work. D25 has two receiving paths; D26 work-only readiness adds no third email method.

No authoring, library/view/label/search action fabricates communication, changes consent, sends requester mail, grants CRM access or completes owner-domain actions. Actual independently authorized required maintenance/direct attention remains with its qualified producer; “quiet” ordinary UI is not a blanket suppression rule.

### D27–D40 — Decision-specific out of scope

No second CRM, generic workflow/rule builder, campaign or alternative provider platform, requester message archive, transcript export product, live chat/telephony, AI generation/retrieval/action authority, collaboration editor, shared private drafts, scheduled Support sends, new private-guide ACL hierarchy, source-body wiki import, browser-offline body archive or current configurable dashboard builder is added. Explicit ordinary OS copy/retyping and already delivered/downloaded external copies cannot be recalled by these controls. Future AI and full shared reporting configuration remain the separately governed accepted directions, not current capabilities.

## Further Notes

The source of accepted product intent is the fully ratified forty-decision record, including later D27-C, D29 renewed/X01 and all incorporated corrections. Current source behavior is separately evidenced. Native CRM authority follows platform ADR0001 and its existing retirement correction; stale vendor/synchronization prose is not a winning contract. Feature-scoped and platform-wide ADR numbers are distinct namespaces and must be referenced by their title/context when ambiguous.

The publication includes the complete detailed normative volumes and a traceability map, so an implementing agent need not reconstruct requirements from this conversation or from local-only links. The confirmed test plan and publication validation are evidence companions. The formal specification remains subject to explicitly recorded evidence-based corrections; ratification cannot make a disproven assumption correct.

Current prerequisite planning PRs are still open at the recorded checkpoint. Preserve accepted intended interfaces without claiming those predecessor implementations shipped. Qualify the actual dependent owner contracts before activation and record their exact evidence. No pending operational budget, source/custody inventory or provider qualification is permission to ship with a placeholder.

### D1–D13 — Decision-specific further notes

The current source contains useful shell, adapter and test patterns but lacks parts of the ratified canonical boundaries. Existing source is not preserved where it conflicts with the accepted contract. In particular, close alternate legacy send/write paths, current actor and tenant-transform bypasses, incomplete body/file custody and raw link/control exposure, capped read-model populations, inert or misleading routing policy and fake local message/provider facts. Shared owner contracts must be completed at their actual owners before feature activation; this specification does not introduce a parallel workaround.

The complete normative acceptance registry contains every D1–D13 R clause, ratified UX companion, owner/lifecycle table, proof matrix and operational threshold. Research/source observations, historical stage text, and independent proposals explicitly superseded by the final synthesis are recorded as non-normative in the traceability manifest. All final reconciliation conclusions are carried through their actual winning requirements. Earlier accepted records remain unchanged; this formal volume names later refinements instead of silently rewriting evidence.

### D14–D26 — Decision-specific further notes

The complete accepted source inventory and compact section-level traceability accompany this part. Normative volume B is self-contained for its requirements and acceptance/control text; local research files are provenance, not mandatory executable dependencies. Source HEAD was 7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd at the confirmed 15 September 2026 checkpoint. Current legacy behavior and historical source probes do not establish implementation. All release proof remains specified and unexecuted here.

### D27–D40 — Decision-specific further notes

D27-C supersedes only the Public-only/internal exclusion and retains original Public R02–R30. D29’s renewed review and X01 retain the original complete contact contract and add precise accessibility proof. D38 extends D37’s new-Note storage/list exclusion without changing local D35 posted-note edits. D39 excludes housekeeping/provider events from unread; D40 preserves current original classifications through topology while reopening actual new work. These operative relationships outrank historical pending/proposed/no-next-question language.

The full normative detail and source-section traceability are published together with the specification. Source facts, vendor comparisons, rejected alternatives and historical validation remain identified evidence rather than accidental requirements. No empirical user preference, production capacity, release proof or provider success is claimed from ratification or this synthesis.

The publication manifest and live index identify the complete public version. Local source paths in traceability are provenance, not missing normative dependencies; the accepted binding text is reproduced in the published requirement volumes.
