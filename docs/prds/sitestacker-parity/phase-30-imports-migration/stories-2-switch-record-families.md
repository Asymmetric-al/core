# Phase 30 user stories, part 2: Switch record families and workspace

Stories 113–225 of the Phase 30 specification's continuous numbered list.

These stories specify how a Switch brings across giving history, notes and files, applications and care, custom fields, and website content and old links, how long Switch files are kept, how the Switch task list and Switch notices guide the ministry, and which permissions Switch decisions need. Every story is normative and independently verifiable: an implementation conforms only when each of its acceptance criteria can be shown to hold. The bracketed references after each story point to the ratified Phase 30 decisions (as amended by later ratified decisions), the matching ADR-IM records, binding predecessor constraints and related owner requirements, which are identified but not yet agreed, and a criterion that cannot hold until its owner delivers says "depends on O#". The Common safeguards (tenant isolation, a server-derived actor, Phase 12 permission checks, IDs-only logs and WCAG 2.2 AA) apply to every story below and are specified once in part 4.

## Giving history (Q13)

113. As a Switch decision holder, I want every gift year the source holds to come across as individual gifts, so that supporter histories are complete and never rebuilt from totals. [Q13 clause 1; ADR-IM-013; O16; O22; O53]
     - **Acceptance:**
       - Given a final export holding card, check, cash and bank-transfer gifts across every year the source holds, when history commits, then each source gift becomes exactly one history gift and no yearly or rolled-up total is ever created as a gift.
       - Every committed history gift carries Recorded outside Asym and its Source Record Binding, and no role can remove or change either afterwards.
       - No history gift is written by any path other than Phase 13's adoption command, whatever its payment type.
       - Given the same final manifest is committed again under the same mapping, then no new gift is created and the run recognises the earlier work.

114. As a Switch decision holder, I want to set a later Coverage start for history, so that years we choose not to bring are left out honestly rather than silently. [Q13 clauses 1 and 13; ADR-IM-013; O2; O3]
     - **Acceptance:**
       - Given a Coverage start of 1 January 2012, when history commits, then no gift dated before that day is committed and those gifts appear in reconciliation as a declared Visible exclusion with their count and total per currency.
       - A refund or reversal whose original gift falls before the Coverage start is left out with that original and counted in the same exclusion.
       - The Coverage start is shown on the Switch summary and wherever history appears, including staff views of imported history, the donor's own giving history and the missionary's existing Phase 14/28 views.
       - First-gift and lapse conclusions that would need history before the Coverage start stay blocked and are never guessed (depends on O2 and O3).
       - Changing the Coverage start after commit only adds earlier history through a new plan and never removes a committed gift.

115. As a Switch decision holder, I want a history gift to commit only when every Fixed gift fact is known, so that no gift is fixed forever with a guessed fact. [Q13 clause 2; ADR-IM-013; C6; O53]
     - **Acceptance:**
       - Given a source gift missing any Fixed gift fact (legal donor, payment type, Legal Entity, Site, currency, fund or missionary, date, amount), when the plan is built, then it becomes a Waiting row with a plain reason and is not committed.
       - No Fixed gift fact is ever taken from a default: there is no General Fund fallback, no "today", no USD and no Site or Legal Entity chosen on the ministry's behalf.
       - Given a source fund with no mapping, then its gifts wait with "No fund mapped" and none is designated to the General Fund.
       - Given a cash gift of zero, then it waits with a plain reason and is not committed.
       - Given a truly unknown offline donor (loose cash or an unidentified check), then the gift commits without a legal donor only when the ministry has marked it as an intentional unknown offline donor with its source batch as evidence.

116. As a Switch decision holder, I want Waiting rows grouped by plain reason with counts and totals, so that I can clear them group by group. [Q13 clause 2; Q19 clause 4; ADR-IM-013; ADR-IM-019]
     - **Acceptance:**
       - Given Waiting rows exist, then they are grouped by reason in plain words such as "No fund mapped", "Date unclear", "Refund without an original" and "Lines don't add up", each group showing its row count and total per currency.
       - Each reason group offers one next step and never labels its rows "error", "failed" or "rejected".
       - A Switch's Waiting rows are resolved by choosing a value, fixing the source file or leaving them out, and are never edited cell by cell in Asym.
       - Leaving a gift out records it as a Visible exclusion with its reason, and it counts in reconciliation.

117. As a Switch decision holder, I want amounts kept exactly in their source currency, so that history totals are exact and never converted. [Q13 clause 3; ADR-IM-013; O53]
     - **Acceptance:**
       - Given gifts in a two-decimal currency, a zero-decimal currency such as JPY and a three-decimal currency such as KWD, when history commits, then each amount round-trips exactly in its own currency and no conversion occurs.
       - Given a gift in a currency Asym cannot accept for giving today, such as CAD history on a USD-settling ministry, then it is accepted as history.
       - Given 100.5 JPY, then the gift waits because its decimals don't fit the currency.
       - Every history total, in reconciliation and in every reader, is shown per currency and never summed across currencies.

118. As a Switch decision holder, I want each gift dated by the calendar date the old system recorded, so that no gift moves to another day or year. [Q13 clause 3; ADR-IM-013; O54]
     - **Acceptance:**
       - Given a date-only source value, when the gift commits, then its gift date is that same calendar date whatever the server's or the ministry's time zone, including values exported as midnight UTC.
       - Given a gift dated after the Switch Boundary, then it is refused from history with a reason saying it belongs to a Legacy Tail Backfill.
       - Given a date column in an ambiguous format such as 03/04/2019, then it is flagged for the ministry to confirm and no date is guessed.
       - Given a missing or unreadable date, then the gift waits with "Date unclear" and is never dated today.
       - No per-gift dating attestation is asked for (depends on O54).

119. As a Switch decision holder, I want split gifts to add up exactly, so that no source total is adjusted to fit. [Q13 clause 3; ADR-IM-013]
     - **Acceptance:**
       - Given a split gift whose lines differ from its total by 1 minor unit, then it waits with "Lines don't add up" and neither the lines nor the total is adjusted.
       - Given a split gift whose lines add up exactly, then each line commits to its own designation and the gift total equals the source total.
       - A fee-cover line commits as a fee-cover line and is never folded into the gift amount.

120. As a Switch decision holder, I want refunds and reversals brought across as their own entries linked to their original, so that history shows what happened without editing any gift. [Q13 clause 4; ADR-IM-013; O53]
     - **Acceptance:**
       - Given a refund that names its original by exact source reference, then it commits as a separate entry linked to that original, and the original's amount is unchanged.
       - Refunds are never netted into their originals, and they fold into the original's totals under Phase 13's rules.
       - Given a gift in 2019 refunded in 2020, then no year total goes negative because the refund folds under the original's year.
       - Given a partial refund, then it commits for its own amount up to what remains of the original.
       - Given a chargeback later won by the ministry, then the reversal and the reinstatement commit as two linked entries, and if the source cannot show both, the pair waits.

121. As a Switch decision holder, I want reversals that cannot be linked exactly to wait, so that nothing is matched by guesswork. [Q13 clause 4; ADR-IM-013; O53]
     - **Acceptance:**
       - Given a reversal whose original is not in the import, then it waits with "Refund without an original".
       - Given a reversal dated before its original, or larger than what remains of the original by even 1 minor unit, then it waits.
       - Given a standalone negative-amount row, then it is treated as a reversal and waits unless it names an original by exact source reference.
       - No reversal is ever linked to a gift by similarity of amount, donor or date.

122. As a Switch decision holder, I want each source fund decided once in the Value-mapping table with its gift count, totals and date range, so that I can decide funds with confidence. [Q13 clause 5; Q11 clause 3 as amended by Q13; ADR-IM-013; ADR-IM-011]
     - **Acceptance:**
       - Each source fund appears once, showing its gift count, total per currency and first and last gift dates, sorted by total.
       - A fund with a likely existing Asym designation shows that designation first for the person to confirm.
       - Sending a fund to the General Fund happens only as an explicit choice, and that fund's gift count and total appear on the reconciliation pack.
       - A person can apply one designation to several selected funds at once, but no fund is decided without a person's confirmation.
       - Confirmed fund decisions are remembered for later practice runs from the same source.

123. As a Switch decision holder, I want to create Retired designations from the mapping step for funds and missionaries that no longer exist, so that their history is kept without making them givable. [Q13 clause 5; ADR-IM-013; O56]
     - **Acceptance:**
       - A person can create a Retired designation from a source fund singly, or for several selected funds after confirming the list, through the owner's command.
       - A Retired designation accepts history gifts and refuses every new gift, whether from checkout, a Phase 15 gift batch or a recurring gift.
       - A Retired designation for a departed missionary needs no user account or login.
       - No designation of any kind is created automatically, and new active funds are created only in the owner's normal screen, never from the mapping step.

124. As a ministry protecting restricted workers, I want source fund names and gift memos to pass Phase 10's safety rules before they are stored, so that no restricted worker's name leaks through history. [Q13 clause 5; ADR-IM-013; O57]
     - **Acceptance:**
       - Given a source fund name containing a restricted worker's legal name, then it is stored only after Phase 10's alias rules have been applied to it.
       - Gift memos are visible to staff only and never to missionaries or donors.
       - Missionaries and donors see the Asym designation name and never the source fund label.

125. As a Switch decision holder, I want DAF, employer-match and workplace-giving shapes applied at commit where the source records them, so that the payer of record and the recognised person are right from the start. [Q13 clause 6; ADR-IM-013; O58]
     - **Acceptance:**
       - Given a gift the source marks as a DAF grant, employer match or workplace gift in a mapped column, then it commits in Phase 14's shape with the payer of record as legal donor and the person recognised.
       - Given a gift with no such marker, then it commits as the source recorded it and is never re-attributed after commit.
       - Before commit, the plan shows how many gifts have memos suggesting a DAF, employer or platform payer, so the ministry can supply a marker column first.
       - Soft credits, tributes and matching links come across as stand-alone records where the source has them, and can also be added later from the retained final manifest.
       - Non-deductible portions are kept as evidence visible to staff only.

126. As a donor who asked to give anonymously, I want imported history to hide my identity from missionaries unless the source positively says otherwise, so that my request still holds after the Switch. [Q13 clause 6; ADR-IM-013; O58]
     - **Acceptance:**
       - Given a gift with no source flag marking it as not anonymous and no ministry attestation covering its group, then the missionary sees the gift without the donor.
       - Given the ministry signs an attestation that the old system had no anonymity option for a named group of gifts, then missionaries see donor identity for that group only, and the attestation records who signed and which group it covers.
       - A gift the donor asked to keep anonymous keeps its known donor for staff, with the anonymity fact recorded.

127. As a Switch decision holder, I want noncash gifts and families Asym cannot take left out visibly, so that nothing is valued or shaped by guesswork. [Q13 clause 6; Q1 clause 1(b) as amended by Q13; ADR-IM-013; ADR-IM-001]
     - **Acceptance:**
       - Noncash gifts, including stock, never commit as money and appear as a Visible exclusion marked "history not yet covered", with their count and each description kept.
       - Noncash gifts stay importable later only from the retained final manifest under the same Switch Boundary, once Phases 13 and 15 settle where a noncash value goes.
       - Any other family Asym cannot take at the Switch is a Visible exclusion importable later the same way, and is never committed in a different shape.

128. As a Switch decision holder, I want each gift's Legal Entity and Site resolved from our signed Source mapping statement, so that neither is ever inferred. [Q13 clause 7; ADR-IM-013; C19; O4; O59]
     - **Acceptance:**
       - The readiness census records, for each merchant account and each offline source (deposit account or batch type), its Legal Entity and Asym Site, signed by the ministry.
       - A ministry with one Legal Entity and one Site signs once, and that statement covers every source.
       - Given a gift from a merchant account or offline source the statement does not cover, then the gift waits and no Legal Entity or Site is chosen for it.
       - Legal Entity and Site are never inferred from each other, from a default or from values supplied in the file's rows.

129. As a ministry finance lead, I want history to move no money and trigger nothing, so that the Switch never changes balances, receipts or messages. [Q13 clause 8; ADR-IM-013; C7; O1; O33; O55]
     - **Acceptance:**
       - Committing history and its refunds creates no Field Account activity or balance, Support Cycle input or assessment, payout, fee, accounting entry or settlement link.
       - Committing history creates no receipt, statement line, thank-you, task or message.
       - After each history commit, a check across messages, tasks, receipt plans, Field Account activity, posting intents and settlement links finds zero references to history gifts or their refunds.
       - Field Accounts take pre-Switch money only through Phase 21's opening process.

130. As a Switch decision holder, I want the Reader readiness check passed before the first real Switch commits history, so that no screen shows or sums history wrongly. [Q13 clause 9; ADR-IM-013; O60]
     - **Acceptance:**
       - Before the first real history commit for any ministry, each surface that shows or sums gifts is classified as including, excluding or labelling history.
       - On a Practice copy holding history-shaped data (gift dates years ago, rows written today, CAD and JPY amounts and more than 1,000 gifts), each surface dates by gift date, sums per currency with correct decimals, shows every row with no silent limit and reads one gift store.
       - Receipts and statements include no gift carrying Recorded outside Asym, and missionary surfaces read gifts only through the Phase 3 projection.
       - Go/no-go is blocked while any classified surface fails, and the failing surface is named.

131. As a staff member, I want imported history labelled with its origin, so that I always know which gifts came through the Switch. [Q13 clause 10; ADR-IM-013]
     - **Acceptance:**
       - Staff whose Phase 12 permissions let them see contributions see every imported gift labelled "Imported from {system} · Switch {date}".
       - Gift lists can be filtered by origin.
       - Totals keyed on gift date show history in its own years and never as revenue for the month it was imported.

132. As a donor, I want my own imported history shown beside my Asym gifts, so that my giving record is complete. [Q13 clause 10; Q4 clause 5; ADR-IM-013; ADR-IM-004; O24]
     - **Acceptance:**
       - The donor's giving history and "This year so far" include their imported gifts by gift date.
       - No receipt action is offered on an imported gift.
       - The gift detail, the Receipts & statements note and the year-total line use Q4's neutral sentences and never say "not a tax receipt", "not a tax document" or "not deductible".
       - An amount in a currency other than the ministry's default shows with its currency code.

133. As a missionary, I want imported gifts to appear in my existing supporter views like Asym gifts, so that I can care for supporters without learning a separate screen. [Q13 clause 10; ADR-IM-013; O32; O58]
     - **Acceptance:**
       - Imported gifts appear in the same Phase 14/28 views as Asym gifts, labelled with the previous-system name the ministry set (by default "our previous giving system").
       - Those views cover supporters who gave in the last two years, and no separate Phase 30 history screen exists for missionaries.
       - The missionary never sees a gift memo, a source fund label or the donor on a gift that fails the anonymity rule.

134. As a Switch decision holder, I want a per-year reconciliation breakdown, so that I can tie history to the old system year by year. [Q13 clause 11; Q1 clause 9 as amended by Q13; ADR-IM-013; ADR-IM-001]
     - **Acceptance:**
       - The reconciliation pack shows count, total and distinct donors per Legal Entity × currency × year, plus totals per designation.
       - Every final-manifest row has exactly one disposition, and accepted totals tie to export totals to the minor unit.
       - Each independent control shows tied, unexplained variance or declared, and declared exclusions and the Coverage start are listed with counts and totals.
       - The pack lists the earliest and latest gift dates for the ministry to confirm, with no hard-coded earliest date.

135. As a Switch decision holder, I want a History spot check of 20 random gifts and the 5 largest, so that donor and meaning mistakes that totals can't reveal are caught before sign-off. [Q13 clause 11; ADR-IM-013]
     - **Acceptance:**
       - The spot check shows 25 gifts (20 chosen at random plus the 5 largest), each with its source row values beside the Asym gift.
       - The ministry marks each gift as checked against the old system's own screens, and each result is recorded with its actor.
       - Any reported mismatch stops sign-off and is recorded with its note.

136. As a Switch decision holder, I want sign-off blocked while anything in history is unresolved, so that history is never signed off with gaps. [Q13 clause 11; Q20 clause 3; ADR-IM-013; ADR-IM-020]
     - **Acceptance:**
       - Given any Waiting row remains, any variance is unexplained or any spot-check mismatch is open, when a holder of Run the Switch tries to sign off, then sign-off is refused and names what is still open.
       - A person without Run the Switch sees no sign-off action.
       - A sign-off records the reconciliation report version it approved, its actor and its time.

137. As a Switch decision holder, I want to fix history before go-live by discarding and running it again, so that mistakes never reach live views. [Q13 clause 12; Q1 clause 10 as amended by Q18; ADR-IM-013; ADR-IM-018]
     - **Acceptance:**
       - Before go-live, a wrong history plan is discarded and run again, its committed rows stay invisible, and the new run converges on the same Source Record Bindings without creating second gifts.
       - No "Prepare reversal" is offered on a Switch run before go-live.

138. As a ministry finance lead holding the history-correction capability, I want to correct a wrong gift or a whole run after go-live by voiding and re-adopting it, so that history is fixed without deleting anything. [Q13 clause 12 as amended by Q15; Q15 clause 4; Q20 clause 3; ADR-IM-013; ADR-IM-015; O53]
     - **Acceptance:**
       - Given a wrong gift or run after go-live, when a correction is confirmed, then the affected gifts are voided with a reason and re-adopted from the corrected source under the same Source Record Binding, and no gift is deleted or edited in place.
       - Before confirming, the person sees how many gifts and what total per currency will be voided and re-adopted, and a reason is required.
       - The corrected source is either the held final export, while Asym still holds it, or a ministry-supplied correction file with its own recorded digest reviewed under its own correction run.
       - Only a holder of the separate history-correction capability can confirm a correction, and Run the Switch alone does not allow it.
       - A Switch run's Prepare reversal lists giving history under "Needs its owner's correction" with a link to the correction, and never reverses history itself.
       - A correction records its actor, reason, counts and totals, and sends no message and creates no receipt or task.

139. As a donor who asks to be erased, I want my identity removed from imported history while the money facts stay, so that my privacy is honoured without breaking the ministry's totals. [Q13 clause 13; ADR-IM-013]
     - **Acceptance:**
       - Given an erasure, then the person's identity is removed from their history gifts, and the amounts, dates and designations still count in every total.
       - History follows the same retention, export and erasure rules as Asym gifts, with no separate rule per country.

## Notes, interactions, files, applications and care (Q14)

140. As a Switch decision holder, I want everything the source can export to go to its owner's protected home, so that no record lands in "the closest record" and loses its protection. [Q14 clauses 1 and 2; ADR-IM-014; O61; O62; O63; O64; O65; O69]
     - **Acceptance:**
       - Notes and finished interactions (note, call, meeting, visit, logged email) go to the Phase 9 timeline.
       - Notes written by missionaries go to that missionary's private notes and never to any staff-visible place.
       - Care, counselling, health, crisis and safeguarding records go only to Phase 38's sealed care records and never become CRM notes.
       - Applications go to Phase 41 as facts (status, dates, decision, and background-check date, outcome and expiry), while references, assessments, medical or psychological evaluations and check reports go to the sealed personnel area.
       - Files and photos go to Phase 29 private storage, attached to the record they belonged to.
       - A Switch is never held back because one of these families is waiting for its home.

141. As a Switch decision holder, I want to choose a Record tier or Leave behind for each source category or file type, so that protection follows what the category is meant to hold. [Q14 clause 3; ADR-IM-014; O66]
     - **Acceptance:**
       - For each source category or file type, the mapping step shows its row count, date range and a sample (under the viewer's visibility) and offers Staff, Restricted, Sealed (care), Sealed (personnel) or Leave behind, each with plain help.
       - An unknown category starts as Restricted.
       - An entry about a minor or a restricted worker is at least Restricted, whatever tier its category has.
       - Sealed entries are kept separately from Staff and Restricted entries.

142. As a Switch decision holder, I want each category asked whether it holds care information, so that care content can only be sealed or left behind. [Q14 clause 3; ADR-IM-014; O62]
     - **Acceptance:**
       - Each category shows the question "Does this contain care, counselling, health or safeguarding information?" once.
       - Given the answer yes, then only Sealed (care) or Leave behind is offered for that category, and Staff and Restricted are not available.

143. As a ministry, I want tiers set only from source categories with no AI and no keyword scanning, so that our notes and files are never read to classify them. [Q14 clause 3; Q11 clause 5; ADR-IM-014; ADR-IM-011]
     - **Acceptance:**
       - No imported note, file, memo or category is sent to an AI service, and Asym never sets, suggests or changes a Record tier by reading or keyword-scanning content; after import, a tier changes only when a person moves it under the tier rules.
       - Given a note in a Staff category that mentions a third party's illness, then it imports under its category's tier and changes tier only when a person tightens it.

144. As a staff member holding the tier capability, I want to move an entry to a stricter tier, with loosening needing the tier's holder and a reason, so that protection only relaxes deliberately. [Q14 clauses 3 and 12; ADR-IM-014; O66]
     - **Acceptance:**
       - Any person with the capability can move an imported entry to a stricter tier, and the change is audited with the actor and time.
       - Loosening a tier is refused unless the person holds the current tier and gives a reason, and the change is audited with that reason.
       - Given an entry linked to several people, then it carries the strictest tier among them.

145. As a staff member outside the sealed holder group, I want sealed families to be invisible to me, so that their existence can't be inferred. [Q14 clauses 3, 9 and 11; ADR-IM-014; O62; O67]
     - **Acceptance:**
       - Ordinary staff see no row, count, search result or indicator of any person's Sealed records.
       - Sealed families appear on the Switch summary only as tenant-level counts.
       - Holders see Sealed records only in the owner's sealed area, and Asym help access never reaches a sealed family.

146. As a staff member, I want imported entries to keep their history as it was recorded, so that the timeline stays truthful. [Q14 clause 4; ADR-IM-014; O61]
     - **Acceptance:**
       - Imported entries are read-only and labelled "Imported from {system}", and corrections are added as notes.
       - The author is kept as text, "Recorded by {name} in {system}" (or "Recorded by {system}" when no person is known), and no user account is created for any source author.
       - Each entry is dated by its original occurrence date with its precision, and is never dated by the import date.
       - Given an entry with only a system timestamp, then that timestamp is used and flagged; given an entry with no date at all, then it waits.

147. As a staff member, I want imported notes cleaned only in exact and lossless ways, so that nothing is merged wrongly or cut short. [Q14 clause 4; ADR-IM-014; O61]
     - **Acceptance:**
       - Duplicate entries are removed only on exact keys (source ID, or email Message-ID where exported) and never by similarity.
       - HTML is kept as safe text with its line breaks, and scripts are never kept.
       - A note longer than the owner's limit is split into numbered parts and never cut short.
       - Text that cannot be read in its declared encoding waits instead of importing garbled.

148. As a staff member, I want tasks still open at the Switch to arrive as history I can choose to act on, so that stale tasks never flood anyone. [Q14 clause 4; ADR-IM-014; O61]
     - **Acceptance:**
       - An open source task imports as a timeline entry marked "Open in {system} at the Switch" with no assignee, reminder, notification or automation.
       - A filter shows every Open at the Switch entry, and turning one into a real Asym task creates exactly one task with the assignee the person chooses.
       - A recurring source task becomes one entry describing the recurrence and creates no repeating task.

149. As a missionary, I want only my own private notes from the old system to reach me, so that staff notes and other people's records stay private. [Q14 clause 5; ADR-IM-014; O63; O67]
     - **Acceptance:**
       - A missionary sees their own imported notes only in their private notes, and staff never see them.
       - Missionaries see no imported staff note, interaction, file, application or care record.
       - Donors see nothing imported from these families, including notes about themselves.

150. As a ministry, I want every imported file to pass one File safety check before it is stored, so that no harmful or exposing file is kept. [Q14 clause 6 as amended by Q15; ADR-IM-014; ADR-IM-015; O64]
     - **Acceptance:**
       - Every file is quarantined, scanned for malware by a scanner Asym runs itself (never a third-party upload service), and checked against a type allowlist and a size cap before it is stored; an imported attachment or photo is capped at 25 MB per file by default (Phase 29 sets the profile), and an import file itself is held to its qualified profile's limits: the Size profile for staff-migration uploads, and the missionary self-import's own profile limits for self-import files.
       - Images are re-encoded, and no stored image carries location data.
       - Stored files have opaque storage names and are served download-only through an actor-bound download grant, never shown inline.
       - No imported file is stored in a public bucket, and identical files are stored once per ministry and linked to each record they belong to.

151. As a Switch decision holder, I want files that cannot be imported listed with reasons, so that we can keep them in our own archive. [Q14 clause 6; ADR-IM-014]
     - **Acceptance:**
       - Infected, encrypted, oversized, unsupported and orphaned files are not imported, and each is listed with its reason for the ministry's archive.
       - The Switch shows a summary of those files by reason (for example "12 files kept in your archive: 8 too large, 3 encrypted, 1 failed a safety check"), and the list can be downloaded.
       - Files the source cannot export appear as a Visible exclusion "not exportable from {system}".
       - An infected file never leaves quarantine.

152. As a ministry, I want imported photos kept private, so that no one's image is published without consent. [Q14 clause 6; ADR-IM-014; O66]
     - **Acceptance:**
       - Imported photos are private and visible to staff only.
       - A photo is never shown on a public, donor or missionary surface without Phase 10's consent record.
       - Photos of minors and restricted workers are Restricted.

153. As a Switch decision holder, I want applications brought across as facts and in-progress applications handled safely, so that no applicant is lost or exposed. [Q14 clause 7; ADR-IM-014; O65]
     - **Acceptance:**
       - Once Phase 41's import exists, in-progress applications continue in Asym at their current step.
       - Until then, the readiness census lists every in-progress application, and the ministry finishes or pauses each in the old system.
       - Rejected and withdrawn applications come across as facts, and their documents are sealed or left behind as the ministry chooses.

154. As a Switch decision holder, I want logged one-to-one emails brought across and newsletter tracking left behind, so that history holds only meaningful contact. [Q14 clause 8; ADR-IM-014]
     - **Acceptance:**
       - One-to-one emails logged on records import as interactions.
       - Per-person newsletter sends, opens and clicks are not imported.
       - List membership and permission facts follow Q9's rules and never come from newsletter tracking.

155. As a Switch decision holder, I want non-sealed families whose home doesn't exist yet to wait in the retained final manifest, so that they can be imported later without a new export. [Q14 clause 9 as amended by Q15; Q1 clause 1(b) as amended by Q14 and Q15; ADR-IM-014; ADR-IM-015]
     - **Acceptance:**
       - Non-sealed families without a home wait in the retained final manifest under Phase 29 custody and are imported later under the same Switch Boundary.
       - Given the final export has passed its deletion date, then a later import is accepted only from the ministry's copy matching the recorded digests file by file.

156. As a Switch decision holder, I want care and personnel files kept by us with their digest recorded until their sealed home exists, so that Asym never holds them unprotected. [Q14 clause 9; Q1 clause 1(b) as amended by Q14; ADR-IM-014; O62; O64]
     - **Acceptance:**
       - No care or personnel file is accepted into Asym custody before its sealed home exists.
       - At the Switch Boundary, Asym records the digest of each Ministry-held sealed export and shows it on the Switch summary.
       - Given the sealed home later exists, then the export is accepted only from a copy whose digest matches the recorded one, and a copy that doesn't match is refused with a plain message.

157. As a ministry, I want these families committed only after today's leaks are fixed and their readers are checked, so that imported notes and files are never exposed on day one. [Q14 clauses 1 and 10; ADR-IM-014; O68]
     - **Acceptance:**
       - No note, interaction, file, application or care record commits for any ministry until the current leaks (D40–D49) are fixed.
       - Every surface that reads notes, activities or files passes the Reader readiness check before the first commit of these families.
       - A family commits only after counsel's answers on health data, references and retention for that family are recorded.
       - Until all three conditions hold, the commit for these families stays unavailable with its reason shown, and no Switch waits for them.

158. As a privacy officer, I want subject access and erasure to reach imported records in every tier, so that imported records honour people's rights. [Q14 clause 11 as amended by Q15; ADR-IM-014; O67]
     - **Acceptance:**
       - A subject access or erasure request handled through the privacy role finds imported records in every tier, including Sealed, unless a recorded Legal hold applies.
       - Review dates are set per family by the ministry, and safeguarding records are never deleted automatically.
       - Logs about these families carry no content.

159. As a Switch decision holder, I want wrong families and whole-run mistakes corrected by owner corrections, so that nothing is silently deleted. [Q14 clause 12; Q18 clause 3; ADR-IM-014; ADR-IM-018]
     - **Acceptance:**
       - Given an entry imported into the wrong family, then an owner correction moves it to its proper home once that home exists, and until then it is Restricted and its access is reviewed.
       - Given a whole-run mistake, then an owner correction run withdraws it with an audit record and the run is imported again, and no entry disappears without that record.
       - A Switch run's Prepare reversal lists notes and files under "Needs its owner's correction" with a link to the owner's tool.

160. As a Switch decision holder, I want the Switch summary to state each family's outcome, so that we know what came across and what we keep ourselves. [Q14 clauses 1 and 9; ADR-IM-014]
     - **Acceptance:**
       - The Switch summary lists each family as imported, waiting for its home, kept by the ministry or not exportable, with counts.
       - Sealed families appear on the summary only as tenant-level counts.

## Retention, size and deletion of Switch files (Q15)

161. As a ministry, I want Asym to keep our final export only for a fixed time, so that our donor database is not held longer than needed. [Q15 clause 1; ADR-IM-015; O70]
     - **Acceptance:**
       - The final export files are deleted at the earlier of 90 days after Switch closed or 24 months after go-live, and not before.
       - Given go-live on 1 March 2027 and Switch closed on 1 June 2027, then the deletion date shown is 30 August 2027.
       - Given the Switch is still not closed 24 months after go-live, then the final export is deleted 24 months after go-live.
       - No extension is offered, and only a Legal hold keeps the files longer.

162. As a ministry, I want shorter-lived Switch files deleted on fixed clocks, so that working copies never linger. [Q15 clauses 2 and 4; ADR-IM-015; O70]
     - **Acceptance:**
       - Practice and superseded exports, Legacy Tail Backfill inputs, the switch-off export and kept-list returns are deleted 30 days after being superseded, or 30 days after that backfill or return is signed off.
       - An unfinished upload is deleted after 24 hours.
       - Each run's staging is deleted 30 days after that run is committed or discarded, and the final run's staging 30 days after go-live.
       - Everyday import files are deleted 30 days after commit.

163. As a staff member, I want an unchanged everyday import draft discarded with its file after 14 days, with the date shown in advance, so that drafts never hold files indefinitely. [Q15 Retention class as amended by Q19; Q19 clause 14; ADR-IM-015; ADR-IM-019]
     - **Acceptance:**
       - An everyday import draft unchanged for 14 days is discarded together with its file.
       - The discard date shows on the draft and in the Imports list from 7 days before it.
       - Any change to the draft restarts the 14 days, and no email is sent about the discard.

164. As a ministry, I want every stored Switch artifact to have a Retention class and a published deletion date, so that nothing is kept without a stated reason. [Q15 clauses 6 and 12; ADR-IM-015; O70; O71]
     - **Acceptance:**
       - Each stored artifact has one Retention class and a deletion date shown in plain words on the Switch summary, and an artifact without a class cannot be stored.
       - Asym publishes a schedule listing each artifact, why it is kept, for how long and what starts its clock, and the schedule matches the Retention classes exactly.
       - Practice copies keep Q6's lifetime of 14 days plus one 14-day extension.

165. As a ministry, I want our own export files to be our record and Asym never to send raw exports back, so that restricted workers are never exported in bulk. [Q15 clauses 3 and 14; ADR-IM-015; O74]
     - **Acceptance:**
       - No screen, download or request returns a raw Switch export file to anyone, including the ministry.
       - The sign-off step shows "Keep the files exactly as exported; don't open and save them."
       - Committed records remain exportable through their owners' normal exports.
       - The Switch tells the ministry to keep read-only access to the old system or its own complete export for its legal retention, because Asym is never the old system's archive.

166. As a Switch decision holder, I want to verify our local copy against the recorded digests at sign-off, so that we know our copy will work for any later import. [Q15 clause 3; ADR-IM-015]
     - **Acceptance:**
       - The sign-off step lists each recorded file, including each file inside a ZIP, with its name, size and digest.
       - Verify your copy hashes the ministry's local files in the browser and uploads nothing.
       - A byte-identical file shows that it matches, and any changed file shows that it doesn't match because it was changed after export.
       - Each result is recorded as a copy confirmation with its actor and time.

167. As a Switch lead, I want reminders 30 and 7 days before the final export is deleted, so that we can verify our copy in time. [Q15 clause 3; Q19 clause 10; ADR-IM-015; ADR-IM-019; O96]
     - **Acceptance:**
       - The Switch lead and the holders of Run the Switch receive a notice 30 days and again 7 days before the final export's deletion date.
       - Each notice offers Verify your copy and states the deletion date in the ministry's time zone.
       - Any email copy of the notice carries no personal data.

168. As a Switch decision holder, I want a later import from our copy accepted only on an exact digest match, so that an edited copy never enters as Switch data. [Q15 clause 3; ADR-IM-015]
     - **Acceptance:**
       - A later import under the Switch accepts a ministry file only when its digest exactly matches the recorded digest, per file and per file inside a ZIP.
       - Given a copy that was opened and saved again in a spreadsheet program, then the plan is blocked with a message that the file doesn't match the one recorded at the Switch.
       - A deliberate correction file is never accepted as a matching copy and goes through its own correction run.

169. As a ministry member with export permission, I want a Switch's Waiting rows downloadable on demand as safe spreadsheets, so that we can fix them at the source without Asym storing a copy. [Q15 clause 4 as amended by Q20; Q20 clause 8; ADR-IM-015; ADR-IM-020]
     - **Acceptance:**
       - A Waiting rows download is generated when requested, streamed and never stored.
       - Every cell is text-typed and formula-safe, so values open exactly as they were in the source.
       - The download needs the ministry's existing export permission plus on-screen visibility of the rows, and never includes protected people.
       - A set larger than 1,000,000 rows cannot be downloaded until it is filtered below that number.
       - Each download is audited by identifiers only.

170. As a ministry, I want an abandoned Switch purged after 180 days without owner activity, with warnings first, so that a stalled Switch doesn't keep our data. [Q15 clause 5; Q1 clause 10 as amended by Q15; ADR-IM-015; ADR-IM-001]
     - **Acceptance:**
       - After 180 days without owner activity, the Switch's files and staging are purged, with warnings at 150 and 173 days.
       - Uploading, mapping, planning, committing and signing off restart the clock, and viewing or downloading does not.
       - Given a Switch aborted before go-live and then purged as abandoned, then its committed rows that were never visible are disposed of by their owners.

171. As a ministry, I want run evidence kept for the life of the account without supporter content, so that we can answer later questions after the files are gone. [Q15 clause 7; ADR-IM-015]
     - **Acceptance:**
       - Counts, totals, digests, mapping versions, sign-offs and actors stay for the life of the account.
       - Run evidence holds no donor or supporter row content.
       - Given a staff member named in run evidence is later erased, then they show as "former staff member".

172. As a supporter who asks to be erased, I want to be removed from every held Switch file, so that my data is not kept in raw exports. [Q15 clause 8; Q14 clause 11 as amended by Q15; ADR-IM-015; O72]
     - **Acceptance:**
       - Given an erasure, then the person is suppressed at once in every held file through their Source Record Binding tombstone, and no later parse or commit uses their rows.
       - Within 14 days, each affected held file is rewritten in the same format without the person's own rows and with their identity blanked where other rows reference them.
       - The rewritten file keeps money amounts and source IDs, and the original digest stays on record so the ministry's copy still matches.
       - Given a later re-upload containing the erased person, then the tombstone suppresses them, and no separate erasure list exists.

173. As a Switch decision holder, I want to place a Legal hold that stops every deletion, so that files needed for litigation, a regulator or an audit are kept. [Q15 clause 9; Q20 clause 3; ADR-IM-015; ADR-IM-020; O74]
     - **Acceptance:**
       - A holder of Run the Switch, or Asym's named legal role, can place a hold that records a typed reason, scope and review date.
       - A held artifact is deleted by no path, including the Retention sweep, the abandoned-Switch purge and account closure.
       - A hold never releases by itself; a named person releases it with a reason, and both placing and releasing are audited.
       - Asym's named legal role places and releases holds without being able to read any held content.
       - A hold keeps reversal prior values but does not extend the Import reversal window.

174. As a ministry closing its account, I want Switch files and staging deleted within 30 days, so that nothing outlives our relationship with Asym. [Q15 clause 10; ADR-IM-015]
     - **Acceptance:**
       - Within 30 days of tenant closure, all Switch files and staging are deleted unless a Legal hold applies.
       - Run evidence follows the tenant-closure rules for the ministry's other records.

175. As a ministry, I want deletion done by a verified daily sweep, so that records never say deleted while the files remain. [Q15 clause 12; ADR-IM-015; O70]
     - **Acceptance:**
       - A daily Retention sweep deletes due artifacts that are not under a hold through the storage service and verifies each deletion.
       - Each deletion is logged with the artifact, class, size, rule version and time, and with no names, content or per-person hashes.
       - The sweep ran in report-only mode before deletion was enabled, and pausing it is audited.
       - Database backups roll off within their stated window, and that window appears on the published schedule; stored files are not in backups, so a stored file's deletion is final.

176. As a ministry, I want our raw files and staging kept in our hosting region, so that our data stays where we were told it would be. [Q15 clause 12; ADR-IM-015; O71]
     - **Acceptance:**
       - Raw files and staging are stored only in the tenant's hosting region.
       - Background job payloads carry IDs only, and logs carry no row content.

177. As a Switch decision holder, I want uploads checked against the Size profile before parsing, so that oversized or dangerous files are refused clearly. [Q15 clause 13; ADR-IM-015; O70; O99]
     - **Acceptance:**
       - A CSV or TSV over 2 GB, or an XLSX over 50 MB, is refused before parsing with a plain message stating its size, the limit and how to split the file.
       - An XLSX that would expand beyond 1 GB, or at a ratio above 100:1, is refused before parsing.
       - A ZIP is accepted with each entry checked against its own limits.
       - Given files that would take a Switch over 10 GB or 20 million rows, then they are refused with guidance to split by family or year.
       - Uploads go directly to storage and are resumable, so a dropped connection resumes without starting again.

178. As a Switch decision holder, I want one heavy job per ministry at a time, so that Switch commits never compete with other imports. [Q15 clause 13; Q19 clause 5; ADR-IM-015; ADR-IM-019]
     - **Acceptance:**
       - Given one heavy job is running, when another is confirmed, then it shows "Waiting to start, after {name}'s {import} (started {time})" and starts on its own afterwards.
       - Two heavy jobs for one ministry never run at the same time.
       - A Size profile limit changes only through a recorded profile change with its actor.

179. As a ministry, I want refused identifier columns stripped from Asym's held copy within 14 days of sign-off, so that Asym does not keep identifiers it refused to import. [Q15 Retention class as amended by Q16; Q16 clause 9; ADR-IM-015; ADR-IM-016; O79]
     - **Acceptance:**
       - Within 14 days of sign-off, every column refused under Identifier refusal (SSN or SIN, card number, card security code, bank account, passport) is absent from each held file.
       - The stripped file is a successor in the same format, and the original digest stays on record so the ministry's copy still matches.

## Custom fields and option lists (Q16)

180. As a Switch decision holder, I want to decide every unmatched column myself with its fill rate and samples, so that nothing is created or lost without my decision. [Q16 clause 1; ADR-IM-016]
     - **Acceptance:**
       - Each unmatched column shows its header, fill rate (for example "312 of 4,210 filled"), sample values and distinct-value count.
       - For each unmatched column, the person chooses a built-in field, an existing field, a new field or leaving it out, and the plan stays blocked until every non-empty column has a choice.
       - All empty columns can be left out together in one confirmed step.
       - No column is left out by a fill-rate cutoff or any other automatic rule.

181. As a Switch decision holder, I want to create a field from the mapping screen, singly or in a review table, so that I choose its type after seeing how the values fit. [Q16 clause 2; ADR-IM-016; O75]
     - **Acceptance:**
       - The new field's name is prefilled from the header and editable, and help text and a section are optional.
       - Each type option shows how many of the column's values fit it, and text is the starting choice.
       - Phone numbers, ZIP codes and IDs can only be created as text.
       - Given values that don't fit the chosen type, then those rows wait and are never silently lost.
       - Several fields can be created together from one confirmed review table.

182. As a ministry, I want Switch-created fields to start at Staff or Restricted and visible to our team only, so that no new field exposes data. [Q16 clause 2; ADR-IM-016; O76; O77]
     - **Acceptance:**
       - The tier choice offers only Staff or Restricted, and a long-text field starts as Restricted.
       - Visibility offers only "Our team only" or Restricted, and the Switch never sets missionary, donor, export or public visibility.
       - Wider visibility can be set later only in Phase 11's own settings under its rules.
       - A column declared as care content cannot become a custom field and is offered only Sealed (care) or Leave behind; a column declared as personnel content cannot become a custom field and is offered only Sealed (personnel) or Leave behind.

183. As a Switch decision holder, I want Field drafts kept in the Switch plan under their own ID, so that my field decisions carry across practice runs. [Q16 clause 3; ADR-IM-016; O75]
     - **Acceptance:**
       - A Field draft keeps its decisions across practice runs and Remembered mappings.
       - Renaming a draft updates it, and deleting a draft removes it from the plan.
       - A practice run creates drafts only in its Practice copy, and no draft field or option appears in the live account before the real commit.

184. As a Switch decision holder holding Phase 11's field-creation capability, I want the real commit to create every Field draft or none, so that a partial set of fields never appears. [Q16 clause 3; Q20 clause 3; ADR-IM-016; ADR-IM-020; O75]
     - **Acceptance:**
       - The real commit creates all Field drafts through Phase 11's batch command, or none of them.
       - Before creating anything, the commit checks field limits and re-checks names and targets, and if any draft fails, nothing is created and the failing draft is named.
       - Running the commit again never creates a second copy of any draft.
       - The commit that creates fields is refused for a person without Phase 11's field-creation capability, even if they hold Run the Switch.

185. As a Switch decision holder, I want to see field capacity and name clashes before commit, so that the commit doesn't fail on something I could have fixed. [Q16 clause 3; ADR-IM-016; O75]
     - **Acceptance:**
       - Before commit, a summary states how many fields and options the Switch will create, how many options are archived and how many fields remain (for example "This Switch will create 23 fields and 147 options (14 archived). You have 77 fields left.").
       - A plan that would exceed Phase 11's field limit is blocked before commit with the remaining capacity shown.
       - A draft name that clashes with an existing field, a reserved name or another draft is blocked with the choice to use the existing field or rename the draft.

186. As a Switch decision holder, I want new options added only deliberately after a grouped review, so that option lists stay clean. [Q16 clause 4; Q11 clause 3 as amended by Q16; ADR-IM-016; ADR-IM-011; O76]
     - **Acceptance:**
       - The Value-mapping table groups case, space and punctuation variants (such as "Yes", "yes" and "YES") for one decision per group.
       - "Add these N values" appears only after the grouped list has been reviewed.
       - No option is ever created automatically, including on Phase 11 "open" fields, and an undecided value is never imported.
       - Given a column with more than 200 distinct values, then the screen recommends a text field and the person decides.

187. As a Switch decision holder, I want values used only in history added as archived options, so that old records keep their values without cluttering new entry. [Q16 clause 4; ADR-IM-016; O76]
     - **Acceptance:**
       - A value used only in history can be added as an archived option.
       - An import can set an archived option on an imported record.
       - Archived options are never selectable when staff enter or edit values.

188. As a staff member, I want imported choice values to hold each option's stable ID, so that renaming an option never breaks records or later runs. [Q16 clause 4; Q11 clause 3 as amended by Q16; ADR-IM-016; ADR-IM-011]
     - **Acceptance:**
       - Given an option renamed after import, then every imported record shows the new label.
       - Given a later practice run or correction using the same value decisions after the rename, then values still resolve to the same option.

189. As a Switch decision holder, I want columns that look like Asym's own facts steered to the built-in field, so that we never create a second source of truth. [Q16 clause 5; ADR-IM-016]
     - **Acceptance:**
       - Columns that look like built-in facts (spouse, deceased, do-not-mail, pledge, preferred name) are steered to the owner's field.
       - Calculated columns such as lifetime giving, age or last gift date show "Asym calculates this from history".
       - Creating a field that looks like a built-in or calculated value needs explicit confirmation and a recorded reason.
       - Gift-level money facts can never become custom fields.

190. As a Switch decision holder, I want each column to go to exactly one target, so that values are never merged or split during mapping. [Q16 clause 6; ADR-IM-016]
     - **Acceptance:**
       - Given a target already chosen for one column, when a second column is pointed at it, then the second choice is refused with a plain message.
       - No column can be split into two fields or merged with another column, and such changes are made in the file instead.
       - Household-level values go to the household and are never copied to its members.

191. As a Switch decision holder, I want to declare which values mean "no value" for each column, so that placeholders never become data. [Q16 clause 7; ADR-IM-016]
     - **Acceptance:**
       - Each column lets the person declare Blank tokens, with suggestions such as "N/A", "?" and "-", and SiteStacker's "No" for unset yes/no fields.
       - Cells holding a declared Blank token import as blank.
       - A partial date such as "1998" or "May 2003" is never padded to a full date, and goes to a text field or waits.

192. As a Switch decision holder, I want imported records never to receive a field default, so that history is never invented. [Q16 clause 8; ADR-IM-016; O76; O78]
     - **Acceptance:**
       - A field created by a Switch has no default value.
       - An imported record never receives any field's default value, including from existing fields that have one.
       - Field-change automations do not fire on imported values.

193. As a ministry, I want columns holding sensitive identifiers refused outright, so that SSNs and card, bank and passport numbers never enter Asym's records. [Q16 clause 9; ADR-IM-016]
     - **Acceptance:**
       - A column whose header names an SSN or SIN, card number, card security code, bank account or passport number cannot be sent to any target, and no override exists.
       - A column whose values look like card numbers or SSNs is blocked for review.
       - A person may override a false value match only with a logged reason, and the override is shown in the plan.

194. As a Switch decision holder, I want repeating linked records imported only into collections we created first, so that collections are always designed deliberately. [Q16 clause 10; ADR-IM-016]
     - **Acceptance:**
       - Repeating linked records (such as SiteStacker "Multiple Items" or linked entities) import into a Phase 11 collection the ministry created first in settings.
       - The mapping screen offers no way to create a collection.
       - Given no matching collection, then the records are a Visible exclusion marked "not yet covered".

195. As a staff member running an everyday import, I want only existing fields offered, so that new fields come only from deliberate Switch or settings work. [Q16 clause 11; Q19 clause 4; ADR-IM-016; ADR-IM-019]
     - **Acceptance:**
       - An everyday People import offers only existing fields and never offers to create a field or a Field draft.
       - Creating fields from mapping is available only in a Switch.

196. As a Switch decision holder, I want a Created-by-Switch list after the Switch, so that I can review and tidy what the Switch created. [Q16 clause 12; ADR-IM-016]
     - **Acceptance:**
       - The list shows every field and option the Switch created, each with its fill rate and a link to its settings.
       - A field with no values (for example after an aborted Switch) can be retired in one step.
       - Retiring is offered only for fields with no values.
       - Type changes after the Switch follow Phase 11's rules.

## Website content and old links (Q17)

197. As a ministry web editor, I want website content to move only through private drafts that people review and publish, so that the Switch never publishes anything. [Q17 clause 1; ADR-IM-017; C5]
     - **Acceptance:**
       - Imported website content arrives only as Phase 23 private drafts.
       - Phase 30 never publishes or activates a page, route or giving address.
       - Content can move before or after the Switch, and no content step blocks go-live.

198. As a Switch decision holder, I want an Old link list built at the readiness census, so that every important old address gets a decision. [Q17 clause 2; ADR-IM-017]
     - **Acceptance:**
       - The list is built from the old sitemap or site export, the ministry's known giving links, QR targets and text-to-give replies, plus any links the ministry adds.
       - Each row records the old host and path and where the row came from.
       - Rows are ordered by known importance, with printed QR targets and giving links first.
       - Phase 30 stages the list and hands each row to its owner, and never holds or activates a route itself.

199. As a Switch decision holder, I want each old link to get exactly one outcome from its owner, so that no address behaves two ways. [Q17 clause 3; ADR-IM-017; O83]
     - **Acceptance:**
       - Each old link ends with exactly one outcome: an ordinary page, a Kept giving link, a missionary or project page, or the Site not-found page.
       - An ordinary page points to its Asym page through ADR-0147's exact old-address mapping in a single hop, with its locale taken from source evidence and never guessed (depends on O83).
       - Case and trailing-slash variants of a mapped path reach the same outcome, and a query string never changes the target.

200. As a Switch decision holder, I want old missionary and project page links handled only by Phase 22, so that profile links follow their owner's rules. [Q17 clause 3; ADR-IM-017; O81]
     - **Acceptance:**
       - Given Phase 22 admits old-system sources, then a missionary or project page link gets an exact, person-admitted Phase 22 mapping (depends on O81).
       - Until Phase 22 admits them, every old missionary or project page link gets the Site not-found page.
       - Phase 30 never maps a missionary or project link itself.

201. As a Switch decision holder, I want to keep an old giving link as an equivalent address of the same designation's Asym giving page, so that printed envelopes and QR codes keep giving to the right place. [Q17 clause 3; ADR-IM-017; O80]
     - **Acceptance:**
       - A person keeps a giving link by admitting it as an equivalent address of the same designation's Asym giving page, after seeing that target.
       - A Kept giving link serves the giving page in place with no redirect, and a gift through it can reach only that designation.
       - A giving link cannot be kept for any designation other than the one it gave to.
       - Until O80 lands, giving links are kept one at a time, most important first, and afterwards a confirmed batch is also possible.
       - The list shows progress such as "Giving links kept: 41 of 52".

202. As a visitor following an old link, I want every unmapped old link to show the same Site not-found page, so that nothing reveals which missionaries are restricted. [Q17 clause 3; ADR-IM-017; O80; O82]
     - **Acceptance:**
       - Links for retired and restricted missionaries, unmatched or query-driven giving links and anything left unmapped all return the same not-found response for the Site, identical in status and content.
       - The not-found page is the Site's own and may offer the ministry's giving search.
       - A restricted worker's real-name link is never tied to their alias page.
       - Given a missionary becomes restricted after their giving link was kept, then that link returns the Site not-found page from the next request.

203. As a ministry, I want old-link continuity never to expire, so that links printed years ago keep working. [Q17 clause 4; ADR-IM-017]
     - **Acceptance:**
       - Page continuity and Kept giving links never expire and stay until their owner removes them.
       - No timer or age rule ever changes an old link's outcome.

204. As a Switch decision holder, I want our hostnames moved one stage at a time, so that the old system's still-running pages and the Continue link keep working. [Q17 clause 5; Q1 clause 7 as amended by Q17; ADR-IM-017; ADR-IM-001; O84]
     - **Acceptance:**
       - The ministry keeps its domain and moves it through Phase 24's custom-domain flow, choosing apex or `www` itself.
       - The stages run in this order: the account hostname first, then the giving hostname, then the main website.
       - Each moved hostname is recorded as "Pointed to Asym" among the Legacy Surface Dispositions.
       - The Continue link keeps working throughout every stage.

205. As a Switch decision holder, I want the main website moved only after the Domain readiness check passes, so that donors' card-update pages, our email and our certificates don't break. [Q17 clause 5; ADR-IM-017; O84]
     - **Acceptance:**
       - The check confirms that the old system's still-running donor pages don't depend on the hostname, that the ministry controls the registrar account and registration with more than 12 months to expiry and the registrar lock on, that Asym's certificate is issued before DNS changes (CAA allows it, no stray AAAA records remain and HTTPS-only settings are respected), that email records (MX, SPF, DKIM, DMARC) are carried over, that no leftover records point at retired services and that DNS caching time was lowered in advance.
       - The check must pass within the 24 hours before the move, and an older pass doesn't count.
       - Any failing item blocks the main website move and names the item.

206. As a ministry, I want leftover DNS records checked again 30 days after the main website moves, so that no forgotten record can be taken over. [Q17 clause 5; ADR-IM-017; O84]
     - **Acceptance:**
       - Thirty days after the main website moves, the leftover-records item is checked again and its result is recorded with the date.
       - Given a record still points at a retired service, then it is listed for the ministry to remove.

207. As a Switch decision holder, I want our text-to-give reply link changed at the Switch Boundary, so that donors who text still reach Asym giving. [Q17 clause 6; ADR-IM-017]
     - **Acceptance:**
       - At the Switch Boundary, the ministry is asked to change its text-to-give keyword's reply link to the Asym giving address.
       - Asym does not port text-to-give numbers.

208. As a Switch decision holder, I want QR codes handled by where they point, so that donors who scan still reach us or we know which codes will stop. [Q17 clause 6; ADR-IM-017]
     - **Acceptance:**
       - QR codes on the ministry's own domain work through their link's outcome.
       - QR codes and links on SiteStacker addresses or third-party QR or short-link services are flagged in the census as stopping when those services end.
       - New QR codes are offered only after the Asym giving address is issued.

209. As a ministry, I want today's donor-site host problems fixed before Asym serves our domain, so that our domain can never show another ministry's pages or misroute giving. [Q17 clause 7; ADR-IM-017; O85]
     - **Acceptance:**
       - Before Asym serves any ministry domain, app-wide permanent redirects of the give, donate and missionaries paths no longer apply on ministry hosts.
       - The host is taken only from the trusted resolver, and a spoofed forwarded host cannot select another tenant.
       - The not-found page is the Site's own with no hard-coded ministry name, and trailing slashes resolve in one hop.
       - Logs and error reports hold no query strings.
       - Old-link outcomes are real HTTP responses resolved before the page renders from the owners' tenant-scoped records, never a client-side redirect behind a success response.

210. As a Switch lead, I want a weekly list of old paths people still use for 90 days after each domain stage, so that I can catch links we missed. [Q17 clause 8; ADR-IM-017; O86]
     - **Acceptance:**
       - For 90 days after each domain stage, the Switch lead sees a weekly list of unmatched old paths with counts.
       - The list holds the path only, with no query string or IP address.
       - From the list, the lead can point a path to a page or keep it as a giving link in one step, through the owner's action.
       - Once 90 days have passed for a stage, its weekly list stops.

211. As a ministry, I want the Switch summary to say plainly which old links will keep working, so that we can set honest expectations with partners. [Q17 clause 9; ADR-IM-017]
     - **Acceptance:**
       - The Switch summary lists which old links will keep working, which will show not found and which depend on services Asym doesn't control.
       - The summary never claims that partner sites, emails or printed materials will be updated.

## Switch task list (Q19)

212. As a Switch decision holder, I want the Switch tab to be a task list grouped by stage, so that I always know where the Switch stands. [Q19 clauses 7 and 8; ADR-IM-019]
     - **Acceptance:**
       - The Switch tab shows its tasks in six groups in this order: Get ready, Prepare and practise, Decide, Switch day, After go-live, Close.
       - Each task shows its status, a one-line description of what it is, its link and "Last updated by {name}, {date}".
       - Each status is shown with colour, an icon and words, never colour alone.

213. As a Switch decision holder, I want each task's status derived from what the Switch has recorded, so that the list can never drift from reality. [Q19 clause 8; ADR-IM-019]
     - **Acceptance:**
       - Each task shows exactly one of Not started, In progress, Needs attention, Done or Cannot start yet.
       - A status changes only when the Switch's recorded state changes (for example a census answer, a practice run, a sign-off or go-live), and no one can set a status by hand.
       - A task never shows Done unless the recorded state shows it finished, and a task with anything waiting or needing review shows Needs attention.

214. As a Switch decision holder, I want tasks that can't start yet to say why, so that I know what to do first. [Q19 clause 8; ADR-IM-019]
     - **Acceptance:**
       - A task whose preconditions aren't met shows Cannot start yet with its reason in words, such as the task it is waiting for.
       - A task showing Cannot start yet offers no action that would start it.
       - Given its precondition becomes recorded, then the task shows Not started without anyone changing it.

215. As a ministry, I want no per-task assignments in the Switch task list, so that it reflects the Switch without becoming a second project tool. [Q19 clause 8; ADR-IM-019]
     - **Acceptance:**
       - No task has an assignee, due date or per-task reminder.
       - Each task shows who last updated it and when instead.

216. As a Switch decision holder, I want practice runs listed on the Switch tab, so that rehearsals stay with the Switch and out of the Imports list. [Q19 clauses 3 and 8; ADR-IM-019]
     - **Acceptance:**
       - Practice runs are listed on the Switch tab and never on the Imports list.
       - Real Switch runs appear on the Imports list as well as through their tasks.

217. As a staff member, I want Data Tools to open on the Switch until go-live, so that the Switch is the first thing we see while it is under way. [Q19 clause 8; ADR-IM-019]
     - **Acceptance:**
       - While a Switch is before go-live, Data Tools opens on the Switch tab.
       - After go-live, Data Tools opens on Imports, with a Switch banner while any Switch task needs attention.
       - The banner disappears once no Switch task needs attention.
       - The Switch tab and the Imports tab each keep their own address.

218. As a staff member, I want the Switch tab to become a read-only record once the Switch is closed, so that the Switch's record is kept but can't be changed from the list. [Q19 clause 8; Q1 clause 12 (Q4 amendment); Q4 clause 4; Q15 clauses 3 and 9; ADR-IM-004; ADR-IM-015; ADR-IM-019]
     - **Acceptance:**
       - After Switch closed, every completed task shows its final status and last update.
       - After Switch closed, the Switch tab is a read-only record and no completed task can be changed from it. Steps that remain possible after Switch closed stay available to people allowed to take them, including the decommission checklist and its sign-off, Verify your copy before the final export's deletion, and placing or releasing a Legal hold.
       - Everyday imports continue normally after Switch closed.

219. As a staff member, I want everyday imports clearly paused between the Switch Boundary and go-live, so that nothing competes with the Switch's final import. [Q19 clause 8; Q12; ADR-IM-019; ADR-IM-012]
     - **Acceptance:**
       - Between the Switch Boundary and go-live, every everyday import start action, including the shortcuts on the People list and in Contributions, says "Paused during the Switch, from {Boundary} until go-live." with the Boundary shown in the ministry's named time zone.
       - No everyday import can be started or confirmed during the pause.
       - Given an everyday import waiting to start when the Switch Boundary is reached, then it is held with that reason and writes nothing until go-live.
       - After go-live, the start actions return without anyone changing a setting.

220. As a Switch lead, I want Switch notices to reach me through staff notifications, so that I don't have to keep checking the tab. [Q19 clause 10; Q5 clause 1 as amended by Q19; ADR-IM-019; ADR-IM-005; O96; O97]
     - **Acceptance:**
       - Switch-lead notices and reminders arrive through Phase 17's staff notifications in the app, by email only if unread, and never as a duplicate of a Tasks Hub item.
       - Switch work that needs a person appears in the Tasks Hub through its registered projection, and never as ad hoc task rows or through a separate Data Tools email sender.
       - The first Switch is not offered until these notices exist (depends on O96).

## Switch decisions and permissions (Q20)

221. As a ministry Owner, I want every Switch decision to need Run the Switch, so that only people we trusted with it can decide. [Q20 clause 3; Q5 clause 1 as amended by Q20; Q15 clause 9; ADR-IM-020; ADR-IM-005; O102; O74]
     - **Acceptance:**
       - Starting a Switch, census answers, dispositions and attestations, plan and match decisions, reconciliation controls and sign-off, commit, tail closure, decommission, reassigning the lead, Practice copies and Legal holds each require Run the Switch; Asym's named legal role may also place a Legal hold, and release it with a reason, through its own Phase 12 legal-hold capability rather than any Data Tools permission, without reading any content.
       - Apart from a Legal hold placed or released by Asym's named legal role, a person without Run the Switch sees no action for these decisions, and each is refused if requested directly.
       - The Start action appears only once Asym's preconditions are met and the Switch kind is switched on for the ministry.
       - No Asym identity holds Run the Switch or any other Data Tools permission.

222. As a ministry finance lead, I want money commits, history corrections and field creation to need their owners' permissions as well, so that Run the Switch never widens anyone's authority. [Q20 clauses 3 and 11; ADR-IM-020; C16]
     - **Acceptance:**
       - A Switch commit that writes money needs Run the Switch plus the money owner's permission.
       - A history correction needs its own capability, and creating fields needs Phase 11's capability, and Run the Switch includes neither.
       - Given a confirmer loses a needed permission while a commit runs, then the commit stops after the current batch as Needs attention, saying "Stopped: {name} no longer has permission".

223. As a cleared ministry member holding Run the Switch, I want to narrow a Switch export before others see its values, so that restricted workers stay protected during preparation. [Q20 clauses 3, 4 and 5; Q5 clause 4 as amended by Q20; Q11 clause 4 as amended by Q20; ADR-IM-020; ADR-IM-005; ADR-IM-011]
     - **Acceptance:**
       - Narrowing a Switch real export needs both Run the Switch and clearance, and is refused if either is missing.
       - Narrowing is recorded column by column, or as a declaration that the file names no restricted person, with its actor and time.
       - Until a file is narrowed, uncleared preparers, helpers and Asym help access see only headers, counts and validation summaries, and see restricted people only by alias.
       - Free-text columns such as names, memos, notes and fund names are narrowed only after a cleared member confirms, column by column or for the whole file, that they name no restricted person, and until then uncleared preparers, helpers and Asym help access see none of their values; source fund names in a Switch real export stay visible only to cleared members, before and after narrowing.

224. As a cleared ministry member, I want source fund names in a Switch real export shown only to cleared members, so that fund names that name restricted workers stay hidden. [Q11 clause 4 as amended by Q20; Q20 clause 4; ADR-IM-011; ADR-IM-020]
     - **Acceptance:**
       - In a Switch real export, source fund names are shown only to cleared members, and others see each fund's counts without its name.
       - Amounts on Switch screens show only to people who can see contributions, and others see counts.
       - This rule applies to Switch real exports, and Gift files follow their own fund-label rule.

225. As a ministry, I want helpers' Data Tools grants to end, by default, when the Switch closes and Asym help access to stay inside the Switch, so that temporary help never becomes standing access. [Q20 clause 12; Q5 clauses 3 and 5 as amended by Q20; ADR-IM-020; ADR-IM-005; O105]
     - **Acceptance:**
       - A helper receives an ordinary Data Tools grant (usually Manage, or Prepare only) whose end date defaults to the day the Switch closes, and the grant covers Data Tools, not only that Switch.
       - Given Switch closed, then helper grants ending that day stop and those helpers lose the Data Tools access those grants gave, while a grant the ministry gave a different end date ends on that date instead.
       - Asym help access sees only the Switch tab and its preparation actions, and never the everyday Imports list, import names, values before narrowing or downloads.

## Dependencies referenced

- **O1** — Carry the historical disposition into ledger events as an explicit historical flag (owner: Phase 13 with Phase 34).
- **O2** — First-qualifying-gift fact defined over coverage-qualified history (owner: Phase 13).
- **O3** — The history-coverage record Phase 30 supplies (owner: Phase 30 spec, consumed by Phases 28, 33 and 35).
- **O4** — How the legal issuer resolves for imported gifts from reviewed mapping evidence (owner: Phases 7, 13 and 20).
- **O16** — Source-qualified import identity for money references (owner: Phases 13 and 14).
- **O22** — Recorded outside Asym written with each imported money fact and never removed (owner: Phase 7 with Phase 13).
- **O24** — Donor portal shows gifts recorded outside Asym with neutral sentences and no receipt action (owner: Phase 25 with Phase 19).
- **O32** — Missionary views label previous-system gifts and totals (owner: Phase 28).
- **O33** — Workflow, recipe and task producers stay silent for Recorded outside Asym facts (owner: Phases 34 and 35 with Phase 13).
- **O53** — One Phase 13 adoption command for every payment type, with append-only void-and-re-adopt corrections (owner: Phase 13 with Phase 15).
- **O54** — A source-recorded dating basis with no per-gift attestation (owner: Phase 7).
- **O55** — Adopted history and reversals treated as predecessor facts with no balance or posting effect (owner: Phases 21 and 20).
- **O56** — Retired designations that need no account and are never givable, created by a person from mapping (owner: Phases 13 and 14).
- **O57** — Fund labels and gift memos pass the Phase 10 alias firewall; memos staff-only (owner: Phases 10 and 13).
- **O58** — Anonymity fails closed for history; import shapes for DAF, matching, workplace giving and non-deductible portions (owner: Phases 14 and 28).
- **O59** — Site and Legal Entity of history gifts resolved from the signed Source mapping statement (owner: Phases 2 and 24 with Phases 7 and 13).
- **O60** — Reader readiness for every surface that shows or sums gifts (owner: each gift-reader owner).
- **O61** — Phase 9 import command for notes and interactions (owner: Phase 9).
- **O62** — Phase 38 sealed care home and import command (owner: Phase 38).
- **O63** — Missionary-authored notes go to the author's private notes or wait (owner: Phase 28).
- **O64** — Private CRM-attachment lane with the File safety check, sealed lanes and digest-only records (owner: Phase 29).
- **O65** — Phase 41 import of applications as facts, with documents to the sealed personnel lane (owner: Phase 41).
- **O66** — Record tiers Staff, Restricted and Sealed with tightening and loosening rules (owner: Phase 10).
- **O67** — Projection resolver blocking missionary and donor reads of imported records; privacy finder across every tier (owner: Phase 3).
- **O68** — Reader readiness extended to every surface that reads notes, activities or files (owner: each surface owner).
- **O69** — Phase 30's adapter list names notes, attachments, applications and care with their owner homes (owner: roadmap and owner-constraints owners).
- **O70** — Retention classes, holds, verified daily sweep, successor rewrites and the size profile (owner: Phase 29).
- **O71** — Hosting region, backup windows, IDs-only job payloads and the published retention schedule (owner: platform and operations).
- **O72** — Erasure suppresses held Switch files at once and rewrites them within 14 days (owner: Phase 3).
- **O74** — Legal-hold place and release capabilities; no capability returns a raw Switch export (owner: Phase 12).
- **O75** — Idempotent all-or-none batch creation of fields and options keyed by draft ID (owner: Phase 11).
- **O76** — No defaults on import-origin creates, no automatic options, archived options allowed, batch visibility limited to Staff or Restricted (owner: Phase 11).
- **O77** — Tenant-scoped field-policy rows for custom fields (owner: Phase 3).
- **O78** — Field-value-change triggers never fire on import-origin writes (owner: Phase 34 with Phase 11).
- **O79** — Refused identifier columns stripped from held Switch files within 14 days of sign-off (owner: Phase 29).
- **O80** — Person-admitted Kept giving links as equivalent addresses, singly or in a confirmed batch, suppressed at once by Phase 10 adverse truth (owner: Phase 24).
- **O81** — Whether old missionary and project page links may feed Phase 22 mappings (owner: Phase 22).
- **O82** — One tenant-branded Site not-found page identical for every unmapped path (owner: Phases 23 and 24).
- **O83** — Old-address lane accepts unprefixed sources with an explicit locale from source evidence (owner: Phase 23).
- **O84** — Domain readiness check and staged domain move from an outside host (owner: Phase 24).
- **O85** — Current donor-site host and redirect defects fixed before any ministry domain is served (owner: donor app and route owners, Phases 22, 23 and 24).
- **O86** — Unmatched-path counts per host for 90 days after each domain stage (owner: Phase 24 with Phase 30).
- **O96** — Data Tools and Switch-lead notices through Phase 17 staff notifications, needed before the first Switch (owner: Phase 17).
- **O97** — Registered Tasks Hub projection for imports and Switch work needing a person (owner: Tasks Hub owner).
- **O99** — Resumable upload to the Size profile through the File safety check (owner: Phase 29).
- **O102** — Data Tools permission module with View, Manage and Admin levels, Run the Switch flagged sensitive (owner: Phase 12).
- **O105** — Grant end dates for helpers, defaulting to the day the Switch closes (owner: Phase 12).
