## Current stage — formal specification published

The founder selected `/to-spec`, confirmed the testing approach, and published the complete [Phase26 specification, AL-1656](https://github.com/Asymmetric-al/core/issues/1656) on 15 September 2026. Q41 is answered. On 16 September the founder separately authorized the documentation PR, including Blake attribution. Implementation remains future work. See [current contract and history routing](README.md) for the consolidated glossary, all ratified amendments and proof boundaries.

The original record below preserves its recorded chronology. Earlier pending questions, `/to-prd`-only stage instructions and publication restrictions are historical; they do not override the subsequent explicit instructions. Source hashes in the published trace identify the original capture, before this current-stage notice and repository formatting.

---

# Support Hub

Domain language for ordinary requests for help handled by tenant staff in Asym.
Shared Party, identity, communication, document and care terms remain defined by
their owning contexts and the root glossary.

## Language

**Support conversation**:
A tenant-owned exchange through which a legitimate requester and tenant staff
handle a request for help. Its work state does not establish completion of a
financial, document, CRM or other owner-domain action.
_Avoid_: generic ministry case, CRM person, proof of refund

**Support requester**:
The person communicating a request for help, including someone not linked to a
CRM Party or signed in to Asym. An observed sender address does not by itself
establish verified identity or authority to represent another person or organization.
_Avoid_: verified donor by email, mandatory customer account, automatic Party

**Email continuation**:
The ability to ask for ordinary support and read and reply to the tenant's answer
in an existing email client without an Asym account or portal visit merely to
converse. Any protected disclosure or consequential action retains its owner's
separate assurance requirements.
_Avoid_: email as identity proof, email-only protected access, portal ticket gate

**Personal reply default**:
A staff member's preferred starting reply action for new ordinary Support email
drafts in a tenant. Choosing a different action for one email does not change this
preference or confer authority to contact anyone.
_Avoid_: donor contact preference, sending policy, conversation subscription

**Reply target**:
The particular message a staff member is answering. It is distinct from the
conversation's linked CRM record, original requester or assigned support worker.
_Avoid_: current CRM email, every conversation participant

**Draft reply audience**:
The explicit set of recipients and their visible To/Cc roles for an unsent staff
reply. It is distinct from a personal starting preference and from the audience
of an already approved send.
_Avoid_: remembered conversation group, implied CRM access, internal followers

**Support work status**:
The current meaning of a conversation's support work: Open, Waiting for requester,
Waiting on our side or Resolved. It is distinct from assignment, read state,
message delivery and the outcome of an action owned by another domain.
_Avoid_: delivery status, giving status, read/unread, conversation owner

**Open support conversation**:
A conversation for which Support owes a substantive next step or a due review or
follow-up. An optional courtesy update alone does not end a genuine waiting period.
_Avoid_: unread conversation, necessarily assigned conversation, currently viewed

**Waiting for requester**:
Support work whose remaining active blocker is needed input from the admitted
people seeking help. This is not restricted to the original CRM-linked contact.
_Avoid_: last email was outbound, donor received our question, verified identity

**Waiting on our side**:
Support work awaiting a necessary colleague, owner-domain or outside-party input
that the tenant remains responsible for obtaining and following through on.
_Avoid_: transferred responsibility, completed owner action, every future task

**Resolved support conversation**:
A conversation whose Support obligation has deliberately been completed. Its
resolution does not prove delivery or completion of a financial, CRM, document or
care action, and later new work may require another review.
_Avoid_: read, deleted, immutable closed ticket, proof of refund

**Follow-up reminder**:
A scheduled return of a conversation to staff attention for review or follow-up.
It does not mean the awaited person replied or the awaited action completed.
_Avoid_: service commitment, waiting side, owner action completion

**Resolution episode**:
A recorded completion of a Support obligation within a conversation's history.
A later reopening does not erase that earlier completion or prove it never occurred.
_Avoid_: current resolved flag, delivery receipt, overwritten last-updated time

## Reply composition language

Terms established by the [ratified D4 decision](docs/adr/0004-send-with-explicit-work-intent-and-prepared-replies.md).

**Keep-work send**:
A reply action that performs no work transition and does not cancel or replace a valid follow-up reminder. It does not restore an old status or prevent independent new evidence from creating review work.
_Avoid_: Send and open, automatic wait, stale-status write-back

**Saved reply wording**:
Eligible reusable content copied into a staff reply for editing. It is distinct from shared presentation, a work-changing macro and a finite system-message template.
_Avoid_: send action, CRM edit, proof of receipt/refund, live shared fragment

**Prepared human reply**:
The exact authorized, validated and compiled reply material pinned for shared delivery. It is distinct from a mutable draft, a provider template and the permanent Support conversation record.
_Avoid_: current template alias, sent email proof, new system-message meaning

## Follow-up ending language

Terms established by the [ratified D5 decision](docs/adr/0005-explicit-no-response-ending-and-honest-awareness.md).

**Follow-up ending**:
An authorized staff decision that no further proactive Support follow-up is planned for the current reviewed need. Relevant new input may require review again.
_Avoid_: deleting the conversation, refusing future help, confirming a fix

**No response**:
The reason an eligible follow-up ended because clearly requested needed input remained absent at the reviewed point. Prior partial replies may exist; the reason does not prove successful contact, neglect or an achieved business outcome.
_Avoid_: no messages ever, donor fault, delivery confirmation, problem solved

**Ending reason**:
Why a particular Support follow-up episode ended. It is distinct from current work status, a person's behavior classification and an owning domain's business outcome.
_Avoid_: permanent person label, current delivery status, confirmed success

## Initial assignment language

Terms established by the [fully ratified D6 decision](docs/adr/0006-shared-intake-and-configurable-first-assignment.md). Earlier terms remain ratified.

**Shared intake**:
New Support work held visibly by a responsible inbox for its named staff coverage to review and explicitly claim or assign. It describes the default handling, not a promise that specifically enabled assignment rules never apply.
_Avoid_: no responsibility, automation globally paused, lost mail

**Unassigned support conversation**:
A conversation with no individual Support assignee. It may have a responsible team and may be intentionally shared or waiting for a qualified automatic first assignment.
_Avoid_: no inbox, no team, always new intake, extra work status

**Support coverage roster**:
The explicitly named authorized people responsible for reviewing an inbox's shared work. It may use a qualified Support team; it is distinct from individual assignment, attendance and permission ownership.
_Avoid_: implicit all staff, mandatory coverage-steward role, CRM household or Field Account Support Assignment

**Support receiving pool**:
The explicitly included qualified staff who may receive an automatic assignment for a routing result. A person appears once even when included directly and through teams. Inclusion does not grant access or ownership.
_Avoid_: everyone with a login, copied CRM owner group, permission role

**Receiving new Support assignments**:
A staff member's explicit tenant-specific choice to receive new automatic Support work. It is distinct from access, online presence, attendance, existing assignments and shared coverage.
_Avoid_: online, logged in, notifications enabled, abandoning current work

**Automatic assignment limit**:
An optional per-person limit used when admitting new automatic work, based on assigned Open Support conversations across the tenant. Existing or deliberately assigned responsibilities may exceed it without becoming invalid.
_Avoid_: total effort, hard cap on every obligation, SLA, browser-loaded count

**Round-robin assignment**:
Taking turns among eligible unique receiving staff, with a turn consumed by a successful automatic assignment. It does not estimate workload or effort.
_Avoid_: fewest Open, alphabetical-first selection on every call, equal effort

**Balanced assignment**:
Automatic selection of the eligible receiver with the fewest assigned Open Support conversations in the tenant, with rotating ties. It uses a declared work count, not an effort or productivity score.
_Avoid_: most spare slots, percentage utilization, donor-value priority, skill prediction

**Pending initial assignment**:
A still-current automatic first-assignment obligation for an admitted new conversation. It remains distinct from intentional Shared work and from a current Unassigned label alone.
_Avoid_: every old Unassigned item, new intake on reopen, current conversation work status

**Assignment pause**:
A temporary stop on an inbox's automatic assignment rules and default while relevant pending work remains held. It is distinct from choosing Shared handling or changing current owners.
_Avoid_: delete queue, revoke access, resolve work, automatic unassignment

## Absence coverage language

Ratified terms accompanying the [fully accepted D7 review](docs/adr/0007-explicit-absence-coverage-and-current-handoff-authority.md). D1–D6 terms remain ratified.

**Absence coverage**:
An explicit temporary arrangement for a staff member's selected Support inboxes, returning Open work to shared handling and covering later review work. It is distinct from receiving new work, online presence, leave approval and access.
_Avoid_: every inbox automatically, global Receive Off, staff attendance, donor-visible absence

**Coverage episode**:
One bounded occurrence of a person's declared Support coverage with an explicit scope and ending choice. A later period is a new episode rather than a revival of past authority.
_Avoid_: permanent absence flag, recurring shift, HR record

**Coverage handoff**:
A permitted transfer from an individual Support assignee into the conversation's existing shared handling during coverage. It does not establish that another individual accepted or answered the request.
_Avoid_: new intake, reply sent, issue resolved, guaranteed response

**Keep during coverage**:
A deliberate instruction that a particular conversation stays with the covered staff member for the current coverage episode. It is separate from simply replying or changing work status.
_Avoid_: second assignee, permanent skip, permission delegation, automatic receiving override

**Coverage gap**:
An incomplete handoff or shared-handling arrangement requiring qualified staff attention. An active coverage arrangement does not by itself prove the gap is resolved.
_Avoid_: Unassigned by inference, answered, automatically granted access

## Access-loss handoff language

Ratified terms accompanying the [fully accepted D8 review](docs/adr/0008-shared-access-loss-handoff-with-explicit-review-policy.md). D1–D7 terms remain ratified.

**Support access loss**:
An authoritative confirmation that a person may no longer handle particular Support work. It is distinct from declining new assignments, temporary absence and an uncertain lookup.
_Avoid_: inactive display flag, Receive Off, every removed permission, missing avatar

**Access-loss handoff**:
The controlled continuation of affected unfinished Support work after its previous handler loses authority to handle it. It preserves the conversation's work meaning and history without transferring another domain's permissions or ownership.
_Avoid_: account deletion, CRM owner transfer, new intake, completed business action

**Handoff review**:
An authorized decision that performs the next permitted handling disposition for a conversation. It is distinct from reviewing a reply or approving the underlying financial or CRM action.
_Avoid_: send approval, permission grant, ceremonial Approve before Assign

**Needs reassignment**:
A handling condition indicating that a conversation's valid continuing assignment or shared handoff remains unresolved. It is separate from Open, Waiting or Resolved and does not identify an unavailable former handler as currently responsible.
_Avoid_: new work status, ordinary claimable Shared by inference, no tenant responsibility

**Shared release**:
A completed permitted handoff into a conversation's responsible shared handling. It does not establish that an individual accepted, answered or resolved the request.
_Avoid_: merely clearing an assignee ID, human acceptance, message delivered

## Related records and CRM conversation language

Ratified terms accompanying the [fully accepted D9 review](docs/adr/0009-peer-related-records-and-source-owned-crm-history.md). The founder fully ratified peer related records and the complete amendment package on 11 September 2026. D1–D8 terms remain ratified and unchanged.

**Related record**:
An existing CRM person, household or organization explicitly relevant to a Support conversation. Related records are optional peers and do not identify the sender, add email recipients, prove representation or grant permissions.
_Avoid_: main customer, primary subject, automatic recipient, copied CRM relationship

**Related context**:
The reason a conversation appears on a CRM record through an explicit current relevance link. It is separate from evidence that a message was sent or received.
_Avoid_: contacted us, correspondence by inference, last contact

**Correspondence**:
Actual source-message history qualified by the owning communication and identity domains for a CRM Party. It does not prove that a named person personally wrote or read every message, or saw the whole conversation.
_Avoid_: current email match alone, all related records, authenticated human identity

**Support conversations**:
The CRM view of canonical Support work discoverable through permitted related context, qualified correspondence, or both. It is distinct from financial support and from individual Communication events.
_Avoid_: new ticket store, copied transcript, giving summary, second inbox

**Remove context link**:
An action ending a conversation's explicit relevance link to a CRM record. It does not erase independently valid correspondence or remove anyone from an email.
_Avoid_: delete record, delete communication, remove recipient, correct sender attribution

## Conversation merge and Undo language

Ratified terms accompanying the [fully accepted D10 review](docs/adr/0010-reviewed-duplicate-merge-with-current-state-undo.md). The founder fully ratified reviewed duplicate merging, Undo and every adopted amendment on 11 September 2026. D1–D9 terms remain ratified and unchanged.

**Original conversation**:
A Support conversation with its own original exchange and history, retained even when its work is handled together with another conversation.
_Avoid_: deleted duplicate, new CRM identity, copied transcript

**Continuing conversation**:
The current place staff handle a request whose confirmed duplicate conversations have been combined. It does not become a primary CRM Party or replace the original communication evidence.
_Avoid_: master customer, new requester, historical source replacement

**Conversation merge**:
A deliberate combination of confirmed duplicate Support work into one continuing conversation while preserving original exchanges and their evidence.
_Avoid_: Party merge, automatic same-subject grouping, successful resolution, email recipient union

**Undo merge**:
A reviewed separation of a specific conversation merge into current independently handled work, preserving later messages and actions. It does not rewind history or recall sent email.
_Avoid_: restore everything, undo refund, new duplicate message, generic topic split

## Internal assistance language

Ratified terms accompanying [D11's fully accepted answer and amendment review](docs/adr/0011-retained-support-responsibility-and-shared-internal-work.md). The founder fully ratified retained Support coordination and the complete terminology/amendment package on 11 September 2026. D1–D10 terms remain ratified and unchanged.

**Support coordinator**:
The current Support handler or responsible shared inbox coordinating the requester exchange. This describes existing responsibility rather than a separate role or another owner.
_Avoid_: new permission role, task creator, required second assignee, CRM owner

**Internal assistance**:
A bounded action requested from an authorized worker or team while Support retains responsibility for the requester exchange. A quick consultation need not become tracked work.
_Avoid_: second customer conversation, whole-conversation transfer, automatic approval

**Task brief**:
The minimum useful internal instructions and context authorized for the person or team doing the work. It does not grant access to the entire originating conversation or related records.
_Avoid_: copied transcript, access grant, CRM truth

**Active assistance need**:
The bounded input or result a particular Support request still expects from internal work. Several requests may rely on the same real work; following it does not own that work.
_Avoid_: copied task status, historical reference, requester promise by association

**Result review**:
Support's deliberate consideration of a particular internal result to decide its next step. It is distinct from opening the task, completing the task, approving a business action or replying to the requester.
_Avoid_: read receipt, refund approval, automatic resolution, delivery confirmation

**Stop following work**:
An explicit end to this conversation's need for particular internal work, preserving its allowed history. It does not itself cancel that work or affect other requests relying on it.
_Avoid_: cancel refund, delete task, erase history, end all consumers

## Independent related-conversation language

Ratified terms accompanying [D12's fully accepted answer and amendment review](docs/adr/0012-related-request-conversations-with-original-evidence.md). The founder fully ratified deliberate related conversations and this complete terminology/amendment package on 11 September 2026. D1–D11 terms remain ratified and unchanged.

**Related conversation**:
A separately handled Support request with useful context connecting it to another conversation. The relationship does not combine their obligations or grant access to either conversation or its CRM context.
_Avoid_: child ticket, main customer, merged duplicate, shared recipient list

**Source context**:
Permitted original evidence and clearly identified staff explanation that help another request be understood. It is distinct from correspondence actually received or sent in that conversation.
_Avoid_: copied customer email, new donor interaction, access grant

**New email thread**:
A deliberate independent email exchange about a separately handled requester issue. Organizing related work alone does not start that exchange or change the requester's existing mailbox history.
_Avoid_: renamed title alone, forwarded private note, automatically sent split notice

**Referred update**:
An existing source message or update deliberately brought to another conversation's attention for its relevant work. It remains the original evidence, rather than a newly received email in the destination.
_Avoid_: automatic topic routing, forwarded mail, copied inbound message

**Continued in another conversation**:
An explicit ending of this conversation's remaining follow-up after that work has an authorized current home elsewhere. It does not mean the requester's problem was solved.
_Avoid_: successful resolution, No response, permanent route redirect

**Created in error**:
An administrative correction retiring unused mistakenly created tracking while preserving evidence and a current home for any still-owed work.
_Avoid_: deleted email, erased history, successful resolution, recall

## New request confirmation language

Ratified terms accompanying [D13's fully accepted answer and amendment review](docs/adr/0013-qualified-new-request-confirmation.md). The founder fully ratified A and all these additions and complete amendments on 11 September 2026. D1–D12 terminology remains ratified and unchanged.

**New request confirmation**:
A brief automatic service email confirming that an eligible new Support email request has reached recoverable intake. It does not mean a staff member has read or answered it, or that a giving or other business action has completed.
_Avoid_: donation receipt, personal reply, resolution notice, guaranteed response time

**Automatic confirmation**:
The staff-visible classification of that system-generated service email and its actual delivery evidence. It is distinct from a human reply and from an internal note.
_Avoid_: agent response, successful resolution, hidden automatic message

**Confirmation eligibility**:
The current source-owned authority to attempt a new-request confirmation, including the request's origin, intended mailbox, applicable inbox policy, usefulness and sending safeguards. A conversation's existence or an email match is not eligibility.
_Avoid_: any new ticket, identity verification, consent reset

**Recent confirmation limit**:
A restriction on repetitive automatic confirmation attempts to the same mailbox within a tenant. It does not combine independent requests or people who share an address, and does not stop their requests reaching staff.
_Avoid_: duplicate requester, rejected request, delayed confirmation queue

## Internal reply-target language

Ratified terms accompanying [D14's fully accepted answer and complete amendment review](docs/adr/0014-source-scoped-internal-reply-targets.md). The founder fully ratified internal reply targets and the complete terminology/amendment package on 11 September 2026. D1–D13 terms remain ratified and unchanged.

**Internal reply target**:
An internal expectation for when a particular Support reply should be submitted. It is distinct from a follow-up reminder, a public response promise and completion of the underlying business action.
_Avoid_: donor guarantee, resolution deadline, reminder, staffing coverage

**Reply correspondent**:
The qualified correspondence scope to which a response is owed within an original conversation. It can involve a shared mailbox and does not prove a unique person, CRM Party or authority to represent someone else.
_Avoid_: automatically matched donor, household identity, recipient permission grant

**Reply period**:
A set of still-related incoming contributions awaiting a response or an explicit no-reply disposition for one original conversation and reply correspondent. Repeated input does not erase the oldest remaining wait.
_Avoid_: email count, conversation status, one timer for every merged request

**Reply coverage**:
The particular reviewed incoming contributions that a real human reply addresses through its qualified actual recipients. A reply to one correspondent does not automatically cover another or merely related work.
_Avoid_: recipient union, read receipt, message delivery guarantee, automatic context propagation

**No reply needed**:
An explicit reviewed disposition saying that selected incoming contributions no longer require a reply. Other Support work and follow-up can remain; it is not a response, successful resolution or permission to ignore a promise.
_Avoid_: target Off, solved request, automatic thank-you detection

**Reply work home**:
The current Support work item responsible for handling a particular reply obligation. Deliberate continuation can change that home without changing the original evidence or waiting time.
_Avoid_: copied conversation, new requester, primary CRM record, fresh clock

**Reply timing unknown**:
A lack of sufficient qualified evidence to determine a reply's timing or target interpretation. It does not by itself mean a reply is still owed, failed, delivered or on time.
_Avoid_: zero-minute response, automatic failure, successful response guarantee

## Conversation following language

Ratified terms accompanying [D15's fully accepted answer and complete amendment review](docs/adr/0015-deliberate-original-scoped-conversation-following.md). The founder fully ratified deliberate following and the complete terminology/amendment package on 11 September 2026. D1–D14 terms remain fully ratified and unchanged.

**Conversation following**:
A staff member's deliberate continuing interest in updates from selected original conversations. It is separate from responsibility, direct mentions and the right to read those conversations.
_Avoid_: assignment, automatic subscription, customer-wide following, access grant

**Follow scope**:
The original conversation histories a staff member deliberately selected for ongoing updates. Combining conversations does not silently include other histories or later additions.
_Avoid_: every merged or related conversation, CRM relationship, recipient list

**Following update**:
Optional information about a meaningful permitted change within a staff member's follow scope. It does not by itself create a duty or prove that someone read, answered or completed the work.
_Avoid_: required action, delivery receipt, acknowledgment, donor interaction

**Stop following conversation**:
Ending a staff member's optional updates for the selected conversations. It does not change who handles the conversation or end its interest in a delegated action.
_Avoid_: Stop following this work, Resolve, recall email, delete history

## Sensitive-content correction language

Ratified terms accompanying [D16's fully accepted answer and complete amendment review](docs/adr/0016-selective-permanent-source-redaction.md). The founder fully ratified selective permanent redaction and every adopted amendment and definition on 11 September 2026. D1–D15 terminology remains fully ratified and unchanged.

**Selective redaction**:
Permanent removal of deliberately selected content from an original Support message or its selected whole files, preserving the useful remainder and permitted communication facts. It has no ordinary reveal or Undo.
_Avoid_: edit message, hide temporarily, erase every copy everywhere, delete person

**Content restriction**:
An owner-authorized denial of ordinary access or use of affected content while its safe disposition is determined or completed. It is not proof that the content has been erased.
_Avoid_: completed redaction, conversation resolved, permission grant

**Removal from active use**:
A confirmed result that the selected original content and its governed active representations are no longer available for ordinary use. Any permitted deferred disposal remains separately accountable.
_Avoid_: recalled email, erased backup, closed privacy request

**Disposal complete**:
An evidenced result for the required removal obligations in the recorded scope, with any permitted exclusions identified honestly. It does not recall independent external copies or describe a held original as erased.
_Avoid_: queued cleanup, provider request accepted, erased everywhere, irreversible evidence status

## Routine Support retention language

Ratified terms accompanying [D17's fully accepted answer and complete amendment review](docs/adr/0017-automatic-support-content-expiry.md). The founder fully ratified automatic expiry after Support work ends and every adopted amendment and definition on 11 September 2026. D1–D16 terms stay fully ratified and unchanged.

**Support retention policy**:
The tenant's approved finite rule for how long ordinary Support content remains available after its genuine Support purpose ends. It does not set the lifetime of independent CRM, giving or official records.
_Avoid_: keep everything forever, Recent copy setting, reply target, universal legal period

**Content expiry**:
The end of ordinary authority to use a defined set of retained Support content under its policy. Physical disposal or required restricted custody may still be in progress, and later work cannot restore that expired content.
_Avoid_: Resolve, delete person, confirmed provider purge, reversible archive

**Retained conversation content**:
The original Support-owned text, files and equivalent representations still available within their current permitted lifetime. Human activity can affect that lifetime, while automatic content remains subject to disposal without renewing it.
_Avoid_: all metadata forever, CRM truth, only human messages, legal archive

**Support purpose review**:
An accountable review of the continuing need for older still-available Support content. It records justified continued use, an appropriate next review, actual work completion or qualified records custody; it does not grant a permanent hold.
_Avoid_: automated Resolve, routine approval of every expiry, Keep forever, legal-hold release

## Reusable Support wording language

Ratified terms accompanying [D18's fully accepted answer and complete amendment review](docs/adr/0018-personal-and-shared-saved-replies.md). The founder fully ratified My replies plus a curated shared library and every adopted amendment and definition on 11 September 2026. D1–D17 terms stay fully ratified and unchanged.

**My reply**:
Reusable wording maintained for one staff member's ordinary use within the current tenant. It remains tenant-governed content rather than a portable personal archive or shared publication.
_Avoid_: secret CRM storage, personal account template, automatically shared reply

**Shared reply**:
Reusable wording deliberately published for its authorized staff audience and maintained under tenant stewardship. Its creator's departure does not end the team's legitimate use.
_Avoid_: every staff member's private content, sent message, action macro

**Saved note**:
Reusable wording or structure qualified for an internal staff note. It is not requester-facing content and does not itself create a note or delegate work.
_Avoid_: external reply, assigned task, private message already sent

**Reply contribution**:
An explicitly offered snapshot of reusable wording for qualified shared-library review. It does not expose the contributor's other personal content or change when that source wording is later edited.
_Avoid_: automatic promotion, live personal dependency, copied conversation

**Fill-in field**:
A labelled space the staff author completes for one use of reusable wording. Its answer belongs to the current draft, not the reusable source or a CRM property.
_Avoid_: unresolved example text, CRM update, executable placeholder

## Intake review language

Ratified terms accompanying [D19's fully accepted answer and complete amendment review](docs/adr/0019-designated-inbox-intake-reviewers.md). The founder fully ratified designated reviewers per inbox with tenant oversight and every adopted amendment and definition on 12 September 2026. D1–D18 terms remain fully ratified and unchanged.

**Intake review**:
A qualified staff decision about retained incoming material held before ordinary Support admission. It is distinct from technical recovery, security classification and a change to future mail policy.
_Avoid_: every held message is spam, ticket resolution, sender verification

**Intake reviewer**:
A person deliberately responsible and currently qualified to decide ordinary held inputs within an authorized review scope. Designation alone does not grant access to an inbox, conversation or CRM record.
_Avoid_: all-powerful reviewer, every inbox member, CRM owner

**Dismissed input**:
A retained input deliberately kept out of ordinary Support work by a qualified review decision. It remains subject to its original permitted lifetime and does not imply sender blocking or completed deletion.
_Avoid_: blocked sender, deleted contact, resolved conversation

**Review coverage**:
The currently qualified people accountable for intake review within an inbox or other authorized review scope. Named responsibility without eligible people is a coverage gap.
_Avoid_: automatic permission grant, independent backup when it is the same person, ticket assignment

## Saved Support view language

Ratified terms accompanying [D20's fully accepted answer and complete amendment review](docs/adr/0020-personal-and-curated-shared-support-views.md). The founder fully ratified My views plus curated Shared views and every adopted amendment and definition on 12 September 2026. D1–D19 terms remain fully ratified and unchanged.

**My view**:
A staff member's saved way of finding current authorized Support conversations within a tenant. It is personal configuration, not a private inbox or permission to access additional records.
_Avoid_: private conversation, fixed list of people, copied results

**Shared view**:
A saved way of finding current authorized Support conversations, maintained for an explicit staff audience. Sharing its definition does not grant access to the conversations or CRM facts it describes.
_Avoid_: shared inbox, assignment rule, email audience, template publication

**View pin**:
A person's shortcut to an eligible saved view. Removing the shortcut does not change the saved definition or another person's navigation.
_Avoid_: copied view, shared ownership, route default

**Modified view**:
A working set of temporary changes to a saved view's criteria or ordering. The saved definition remains unchanged until its qualified owner deliberately saves those changes.
_Avoid_: automatically updated Shared view, new conversation state

## Support label language

Ratified terms accompanying [D21's fully accepted answer and complete amendment review](docs/adr/0021-optional-curated-support-labels.md). The founder fully ratified optional labels from a curated Support list and every adopted amendment and definition on 12 September 2026. D1–D20 terms remain fully ratified and unchanged.

**Support label**:
An optional term describing what a Support conversation concerns. It is conversation context, not a CRM Party tag, access classification or proof that an action was completed.
_Avoid_: priority, status, requester type, security permission

**Support label catalog**:
The tenant's curated list of general terms available for organizing Support conversations. Maintaining the list is a separate responsibility from applying its terms to work.
_Avoid_: private folders, CRM taxonomy, template library

**Applied label**:
A Support label currently attached to an original conversation. A combined conversation can show the same label once even when several originals carry it.
_Avoid_: copied survivor category, label change event, CRM relationship

**Archived label**:
A catalog term retired from new use while its permitted existing applications and meaning remain available. Restoring it allows future use without restoring labels removed from conversations.
_Avoid_: deleted label, erased history, restricted-content vault

## Support search language

Ratified terms accompanying [D22's fully accepted answer and complete amendment review](docs/adr/0022-source-qualified-conversation-search.md). The founder fully ratified conversation text and attachment filenames and every adopted amendment and definition on 12 September 2026. D1–D21 terms remain fully ratified and unchanged. Broader/AI search is a founder-stated future direction, outside this current decision.

**Searchable Support content**:
Admitted Support text or details whose owner permits search and whose current availability and access allow it in the person's context. Readable content is not necessarily searchable content.
_Avoid_: every stored body, Recent copy, unrestricted archive

**Search scope**:
The visible conversation context and selected filters within which a person is searching. It can narrow access but never grant access to additional records.
_Avoid_: all tenant data, implicit CRM-wide access

**Search match**:
A currently eligible source item that satisfies the entered search and explains why its conversation appears. It is navigation evidence, not proof a reply was sent or a business action completed.
_Avoid_: synthesized conversation text, AI answer, identity confirmation

**Find in conversation**:
Search within the current conversation's eligible retained sources, with navigation to the matching items. It preserves the current context rather than searching other conversations automatically.
_Avoid_: browser Find over loaded text, unrestricted transcript search

## Support signature language

Ratified terms accompanying [D23's fully accepted answer and complete amendment review](docs/adr/0023-inbox-signatures-and-governed-tiptap-authoring.md). The founder fully ratified A, Tiptap and every adopted amendment and definition on 12 September 2026. D1–D22 terms remain fully ratified and unchanged. Tiptap is the founder's selected editing technology, not a new domain term.

**Reply signature**:
A tenant-managed closing used on a human external Support reply, showing approved responder and team information. It is separate from required organization or legal content in the surrounding message.
_Avoid_: Sender Profile, digital signature, saved reply wording, personal signature library

**Public responder name**:
The approved name a person uses when responding externally for this tenant. It is not necessarily their legal name and does not establish permissions or representation.
_Avoid_: assignee name, login email, legal name, CRM owner

**Signature selection**:
An inbox's chosen approved signature version and language policy for new reply drafts. It does not change replies already prepared or sent.
_Avoid_: personal default, latest mutable template, sender identity

**Managed signature copy**:
The signature placed in a particular reply draft from its inbox's approved selection. It belongs to that draft and does not change when the reusable source is edited.
_Avoid_: live fragment, appended hidden footer, shared source edit

## Reply-and-work shortcut language

Ratified terms accompanying [D24's fully accepted answer and complete amendment review](docs/adr/0024-curated-reply-and-work-shortcuts.md). The founder fully ratified C and every adopted amendment and definition on 12 September 2026. D1–D23 terms remain fully ratified and unchanged. Future AI augmentation remains a research direction, not active capability.

**Reply-and-work shortcut**:
A curated combination of shared reply wording and suggested Support changes that staff prepare, review and deliberately submit together for one conversation.
_Avoid_: automatic workflow, executable template, bulk action, CRM command

**Pending shortcut changes**:
Support changes prepared with a private reply but not yet applied to live work. Editing or saving the draft does not perform them.
_Avoid_: current assignment, completed follow-up, queued delivery

**Shortcut version**:
A particular approved combination of reply wording and Support choices. Later edits do not silently change the version already prepared in a reply.
_Avoid_: latest mutable wording, personal copy, workflow run

**Shortcut-assisted reply**:
A human reply admitted with its reviewed shortcut association and final Support choices. It records actual use, not successful delivery, resolution or proof of a business action.
_Avoid_: picker selection, usage label, productivity score, AI outcome

## Support inbox setup language

Ratified terms accompanying [D25's fully accepted answer and complete amendment review](docs/adr/0025-equal-path-qualified-support-inbox-setup.md). The founder fully ratified C and every adopted amendment and definition on 12 September 2026. D1–D24 terms remain fully ratified and unchanged.

**Public Support address**:
The email address people use to contact an organization's Support team. It may differ from the approved address shown as the sender of replies.
_Avoid_: inbox name, staff login, receiving target, CRM owner

**Receiving path**:
The qualified route by which mail for a public Support address reaches its intended Support inbox. It can use existing-mail-service forwarding or dedicated receiving.
_Avoid_: sending permission, mailbox synchronization, identity proof

**Inbox activation**:
The deliberate start of ordinary Support handling under a reviewed, qualified inbox configuration. Mail may already be held safely while setup is incomplete.
_Avoid_: DNS verified, configuration saved, all mail processed

**Managed reply destination**:
A qualified Support address whose return path and accountable monitoring are managed within Asym. Its proof differs from access to a separate external mailbox.
_Avoid_: self-confirmed verification code, sender identity, personal email account

## Staff-recorded Support language

Ratified terms accompanying [D26's fully accepted answer and complete amendment review](docs/adr/0026-staff-recorded-support-and-complete-crm-access.md). The founder fully ratified A and every adopted amendment and definition on 12 September 2026. D1–D25 terms remain fully ratified and unchanged. Support ticket refers to the existing Support conversation, not another entity.

**Staff-recorded request**:
A request received by phone or in person that a staff member deliberately records for continuing Support handling. It can exist before any email or confirmed CRM association.
_Avoid_: incoming email, phone recording, automatically created CRM contact, second ticket

**Request brief**:
A concise staff-authored account of the Support need. It is distinct from a message from the requester or an independently recorded encounter.
_Avoid_: transcript, customer reply, copied CRM call log

**Reported request time**:
The time or date staff reports that the request was received, with its known precision. It is separate from when Asym recorded the request.
_Avoid_: verified email receipt, recording time, backdated response credit

**Support work readiness**:
An inbox's qualified ability to accept and maintain accountable Support work. It is separate from the readiness of its email receiving or sending paths.
_Avoid_: MX verified, sender ready, every channel active

## Public Support guidance language

Fully founder-ratified terms accompanying [D27 and every adopted amendment](docs/adr/0027-selected-public-guidance-in-support.md), 12 September 2026. D1–D27 terms are fully ratified; all prior definitions remain unchanged.

**Guidance source**:
An exact public Web Studio Page in its Site and language context that the source owner currently qualifies for public use. Its content, publication and public destination remain source-owned.
_Avoid_: internal procedure, CMS draft preview, copied Support article, matching URL as identity

**Guidance selection**:
A tenant's deliberate inclusion of an exact Guidance source in the Support finder. Selection is separate from publication; removing it does not unpublish its source or prohibit otherwise safe links already composed.
_Avoid_: article publication, per-revision approval, inbox article copy, private audience

**Guidance link**:
A link deliberately inserted from Guidance into the current Support reply or internal note, with frozen visible wording and destination and the minimal trusted source provenance required by the existing document and preparation contracts.
_Avoid_: live article embed, quotation, automatic reply, proof of completed business work

## Internal Support guidance language

Fully founder-ratified terms accompanying [D27-C and every adopted amendment](docs/adr/0027-selected-public-guidance-in-support.md#founder-ratification--13-september-2026), 13 September 2026. The earlier Guidance source, Guidance selection and Guidance link definitions remain Public-tab concepts; the following terms define the Internal-tab source. D1–D27 definitions are accepted. Q28 requester-feedback remains unanswered.

**Staff guide**:
Reusable, non-case-specific instructions for current Support staff in one tenant, maintained as an internal source. It is distinct from public guidance, a saved reply/note and an actual CRM or care record.
_Avoid_: internal CMS preview, public article, customer-ready reply, private case vault

**Staff guide draft**:
The unpublished working content of a Staff guide. Saving it does not change the guide currently available to ordinary readers.
_Avoid_: live guide, automatically approved article, personal conversation draft

**Staff guide publication**:
A deliberately released version of a Staff guide for its current authorized Support audience. It is not public website publication or permission to send the guide to requesters.
_Avoid_: Save draft, email preparation, public conversion, granted business authority

## D28 ratified feedback terms

Fully founder-ratified terms accompanying [ADR0028](docs/adr/0028-sampled-automatic-support-feedback.md), 13 September 2026. The four definitions and all associated D28 amendments are accepted.

- **Feedback completion candidate:** A generation-bound record of genuinely completed Support work waiting through the quiet interval; it has not yet been sampled.
- **Feedback opportunity:** The single durable sampling decision for an original Support conversation after qualified maturity. It is not a donor, CRM Party or provider attempt, and retries do not create a new opportunity.
- **Feedback invitation:** The distinct optional communication asking one qualified recipient to provide Support feedback. Selection, possible submission, delivery and response are separate facts.
- **Support feedback response:** One final rating and optional comment submitted through an invitation. It records possession-based feedback, not verified CRM identity, resolved business work or a new email.

## D29 ratified contextual Help terms

Fully founder-ratified terms accompanying [ADR0029](docs/adr/0029-contact-first-help-with-optional-guides.md), 13 September 2026. These four definitions and the complete D29 amendment package are accepted. D1–D29 and every adopted amendment are fully ratified; all earlier definitions remain unchanged.

- **Contextual Help entry:** A contact-first entry in a qualified public or app surface, with optional relevant public guidance. It is not a required self-service step, a new help-center destination or an authorization grant.
- **Help guide selection:** An ordered set of exact public guidance sources deliberately offered at a Contextual Help entry. Selection is separate from content publication and current public-discovery eligibility; it is not the staff Guidance finder or a copied article.
- **Form-origin Support request:** A requester's own message accepted from a qualified form occurrence into canonical Support handling. It is distinct from incoming email, a staff-recorded request brief and a duplicated CRM activity.
- **Published contact method:** A tenant-controlled email address or phone number deliberately published for people to use. Display or a link click does not prove contact, delivery, staffing, verified recipient authority or creation of Support work.

## D30 ratified Support overview terms

Fully founder-ratified terms accompanying [ADR0030](docs/adr/0030-focused-support-overview-and-future-configuration.md), 13 September 2026. These four definitions, the complete D30 amendments and eventual full configuration direction are accepted. D1–D30 and every adopted amendment are fully ratified; all earlier definitions remain unchanged. Support Hub remains the domain name.

- **Support overview:** The staff reporting home that brings current Support work and selected report results together with clear routes to their detail. It is not a new inbox, whole-product dashboard or performance score.
- **Work now:** A view of currently permitted unfinished or owed Support work, regardless of when it began. It is distinct from results selected by a historical reporting period.
- **Report block:** A focused presentation of one source-owned reporting question, retaining its meaning, population, unit and route to detail. Arrangement does not change those facts or grant access.
- **Report evaluation:** A particular permitted result for a report's stated scope and time basis, with the source's known completeness. It is not permanent authority to view old or restricted records.

## D31 ratified follow-up choice language

Fully founder-ratified terms accompanying [ADR0031](docs/adr/0031-consistent-follow-up-choices-and-authoritative-time.md), 13 September 2026. D1–D31 and all adopted amendments are ratified; earlier definitions remain unchanged.

**Follow-up quick choice**:
A ready-made timing choice for the shared Support conversation reminder, shown with its actual follow-up time before selection.
_Avoid_: automatic reply, personal alarm, service deadline

**Custom follow-up time**:
A date, time and timezone deliberately chosen by staff for the shared Support conversation reminder.
_Avoid_: CRM task due date, scheduled email, recurring schedule

## D32 ratified attachment viewing language

Fully founder-ratified terms accompanying [ADR0032](docs/adr/0032-broader-attachment-previews-and-source-owned-renditions.md), 13 September 2026. D1–D32 and all adopted amendments are ratified; earlier definitions remain unchanged.

**Original Support attachment**:
The exact file received or deliberately attached to an original Support message, with its own source context and current access restrictions.
_Avoid_: official receipt by appearance, CRM file copy, preview rendition

**Attachment preview**:
A read-only representation used to inspect a permitted original Support attachment while staying in its conversation context.
_Avoid_: edited original, official document issuance, email attachment reuse

**Preview coverage**:
The parts and features of an original attachment represented in its preview, together with meaningful omissions or limitations.
_Avoid_: verified business facts, complete original, validated financial result

## D33 ratified personal reading language

Fully founder-ratified terms accompanying [ADR0033](docs/adr/0033-personal-support-reading-and-source-preserving-compaction.md), 13 September 2026. D1–D33 and all adopted amendments, initial Compact and exact Base UI/Maia are ratified; earlier definitions remain unchanged.

**Personal Support reading default**:
The Compact or Full presentation a staff member chooses for future Support reading in the current tenant, initially Compact.
_Avoid_: inbox policy, CRM contact preference, smaller text

**Conversation reading mode**:
The Compact or Full presentation currently used to read permitted email content in a Support conversation, including a temporary choice for that visit.
_Avoid_: reply mode, message status, outgoing email format

**Repeated-content disclosure**:
An expandable part of a permitted message that lets staff inspect repeated quoted history or a repeated signature in place.
_Avoid_: redaction, deleted content, access grant

## D34 ratified composing language

Fully founder-ratified terms accompanying [ADR0034](docs/adr/0034-private-source-qualified-composing-awareness.md), 13 September 2026. D1–D34 and every adopted amendment are ratified; exact definitions and all earlier terms remain unchanged.

**Composing cue**:
A brief indication that another currently authorized staff member has recently worked on a private reply or note for the permitted Support source.
_Avoid_: draft preview, work reservation, verified continuous typing

**Composition episode**:
A period of a staff member's recent deliberate reply or note work, ending when they stop, leave or are no longer currently eligible to compose.
_Avoid_: shared draft, conversation ownership, proof of sending

**Composing awareness availability**:
Whether the current reader can obtain sufficiently current permitted composition cues.
_Avoid_: staff availability, absence of other work, sending permission

## D35 ratified note-correction language

Terms accompanying [ADR0035](docs/adr/0035-author-owned-internal-note-corrections-with-history.md). The founder fully ratified A and every amendment on 14 September 2026. D1–D35, including D29-X01, and all definitions remain fully ratified; the exact definitions below are unchanged.

**Internal note correction**:
A deliberate change by the original human author to their existing internal Support note, preserving its identity and original account of when it was posted.
_Avoid_: new event, privacy redaction, sent-message edit, another author's statement

**Internal note history**:
The currently permitted saved versions and edit attribution of one internal Support note. It is distinct from the conversation's other messages and from permanent audit evidence.
_Avoid_: forever archive, restore command, CRM note copy, notification replay

## D36 — Deliberate Support reply quotation (ratified)

**Support reply quotation**:
A deliberately included excerpt of an eligible earlier external email within a new Support reply, attributed to its source and distinct from the current reply target and recipients.
_Avoid_: Automatic transcript, forwarded message, internal note.

**Edited excerpt**:
A Support reply quotation whose meaning-bearing content has changed after insertion, visibly identified as adapted from its source rather than presented as that sender's unchanged message.
_Avoid_: Edited source message, corrected original email.

## D37 — Private Support reply drafts (fully ratified, including all amendments)

**Private Support reply draft**:
One staff member's saved, unfinished external Support reply, distinct from an admitted message, an internal note, a reusable Email Studio draft and the conversation's work status.
_Avoid_: Queued email, shared draft, CRM note, Support status.

**Draft origin**:
The original Support conversation where a private reply draft began. It remains distinct from an explicitly changed reply source and the current place staff handle merged work.
_Avoid_: Current reply target, merged conversation root, CRM owner.

## D38 — Private new Internal note drafts (fully ratified, including all amendments)

**Private Support note draft**:
One staff member's saved, unfinished new Internal note, distinct from a posted note, a correction to an existing note and an external Reply draft.
_Avoid_: Posted note, CRM note, shared draft, note revision.

## D39 — Personal conversation reading (fully ratified, including all amendments)

**Personal conversation read state**:
A staff member's own read/unread indication for permitted Support conversation content, distinct from shared work status, delivery evidence and notification engagement.
_Avoid_: Team read receipt, handled conversation, delivery status, colleague viewing history.

## D40 — Unwanted handling and future-mail holding (fully ratified, including all amendments)

**Unwanted designation**:
A reversible classification of admitted correspondence as outside ordinary Support work. It is distinct from deleting content, resolving legitimate work or judging a CRM person.
_Avoid_: Spam person, deleted conversation, successful resolution

**Future-mail hold**:
A separately chosen inbound policy that sends matching future email to review rather than ordinary Support work.
_Avoid_: Contact block, unsubscribe, automatic current-conversation deletion
