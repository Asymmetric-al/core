# Phase 30 user stories, part 3: The import journey and import reversal

Stories 226–362 of the Phase 30 specification's continuous numbered list.

These stories specify how Mission Control staff take an Everyday import (a People import or a Gift file) from file to result on one Import page, how columns and values are matched by rule inside Asym, and how a committed import is taken back through an import reversal. Every story and acceptance criterion is normative and independently verifiable, and the bracketed references name the ratified decision clauses, Phase 30 ADRs and owner requirements (O#) it rests on; where a later ratified amendment changed a clause, these stories state the amended rule. A story that depends on an owner requirement is not done until that requirement is live. The Common safeguards (tenant isolation, a server-derived actor, Phase 12 permission checks, IDs-only logs and WCAG 2.2 AA) apply to every story here and are specified in part 4.

## Starting an import (Q12, Q19)

226. As a staff member with Data Tools Manage, I want to choose People import or Gift file before I upload anything, each with its own template, so that the file I prepare fits the kind of import I mean. [Q12 clause 1; Q19 clause 4; ADR-IM-012; ADR-IM-019]
     - **Acceptance:**
       - A new import cannot reach its File step until its kind is set to People import or Gift file.
       - Each kind offers its own Import template for download, and neither kind offers the other's template.
       - The Import page and the Imports list show the kind of every import.
       - Data Tools offers no everyday kind for church remittance breakdowns, the missionary self-import, website content or Field Account openings, which stay on their owners' screens.

227. As a staff member working in the People list, I want an "Import people" action that opens a People import in Data Tools, so that I can start an import from where I already work. [Q19 clause 2; ADR-IM-019; O93]
     - **Acceptance:**
       - "Import people" opens a new import in Data Tools with People import already chosen, Data Tools breadcrumbs and a link back to the People list.
       - "Import people" appears only for a person for whom the People import flow works, and never as a dead button or as a disabled button without a written reason.
       - The existing dead buttons on the People list are removed or wired before "Import people" ships.

228. As a finance staff member working in Contributions, I want an "Upload a Gift file" action beside New batch, so that I can turn a payout or deposit report into gift batches without leaving my work. [Q19 clause 2; ADR-IM-019; O94]
     - **Acceptance:**
       - "Upload a Gift file" opens a new import in Data Tools with Gift file already chosen, Data Tools breadcrumbs and a link back to Contributions.
       - "Upload a Gift file" appears only for a person for whom the Gift file flow works, and never as a dead button or as a disabled button without a written reason.
       - The existing dead buttons in Contributions are removed or wired before "Upload a Gift file" ships.

229. As a staff member with Data Tools Manage, I want everyday import start actions to say plainly when they are paused for a Switch, so that no everyday import collides with the Switch's final import. [Q12 clause 1; Q19 clause 8; ADR-IM-012; ADR-IM-019]
     - **Acceptance:**
       - Between a Switch's Switch Boundary and go-live, every everyday import start action, including both shortcuts, reads "Paused during the Switch, from {Boundary} until go-live." and starts nothing.
       - An everyday import that is Waiting to start when the Switch Boundary is reached does not start, and its Import page shows the same pause reason.
       - Once go-live is recorded, everyday import start actions are available again without anyone switching them back on.

230. As a ministry Data Tools Admin, I want People imports to stay unavailable until Phase 4's matching fix is live, so that no import attaches a row to the wrong person on email alone. [Q12 clause 5; ADR-IM-012; O47]
     - **Acceptance:**
       - Until O47 is live, no ministry sees a People import start action or the "Import people" shortcut.
       - Once O47 is live, People imports become available without any change to an existing import draft or committed import.

## The Import page and import drafts (Q19, Q20)

231. As a staff member with Data Tools Manage, I want each import to have one Import page that carries it from file to results, so that I always know where an import stands and what comes next. [Q19 clause 4; ADR-IM-019]
     - **Acceptance:**
       - A People import shows the steps File, Columns, Values and Review and import, and the Values step appears only when a code column is matched.
       - A Gift file shows the steps File and totals, Columns, Funds and values, and Review and import.
       - After Confirm, progress, results and Prepare reversal appear on the same Import page, not on a separate page.

232. As a staff member with Data Tools Manage, I want the import draft saved after every change, so that a closed browser, an expired session or a switch of device never loses my work. [Q19 clause 4; ADR-IM-019]
     - **Acceptance:**
       - An import draft reopened on another device after the browser was closed returns to the same step with every match, value choice and decision kept.
       - A session that expires during Review loses nothing, and after signing in again the person returns to the same step.
       - Apart from the upload itself, no step needs the page to stay open for work to be kept.

233. As a staff member with Data Tools Manage, I want to reopen any step I have already visited, so that I can correct a column or value choice without starting again. [Q19 clause 4; ADR-IM-019]
     - **Acceptance:**
       - Every visited step can be reopened from the step indicator.
       - Changing anything on a reopened step rebuilds Review, and Review then states that it was rebuilt because of that change.
       - Reopening a step without changing anything leaves Review as it was.

234. As a staff member with Data Tools Manage continuing a colleague's import draft, I want my changes and theirs never to overwrite each other, so that two people can share one draft safely. [Q19 clause 4; Q20 clause 9; ADR-IM-019; ADR-IM-020]
     - **Acceptance:**
       - Any Data Tools Manage holder can open and continue any import draft in the ministry, and every change records who made it.
       - A save made against an older version of the plan is refused with the name of the person who changed it and when, and the person is asked to reload.
       - After the refusal, neither person's earlier saved changes are lost.

235. As a staff member with Data Tools Manage, I want new imports named by kind, date and time rather than by file name, so that personal data in file names does not spread through a shared list. [Q19 clause 3 as amended by Q20; Q20 clause 9; ADR-IM-020]
     - **Acceptance:**
       - A new import is named by its kind plus date and time in the ministry's time zone, for example "People import, 4 Nov 2026, 10:42".
       - The file name never becomes the import's name unless a person types it in, and it shows on the Import page only to Data Tools Manage holders.
       - A renamed import shows its new name on its Import page and in the Imports list.

236. As a ministry Data Tools Admin, I want everyday import drafts that nobody has changed for 14 days discarded with their file, so that abandoned files holding personal data do not linger. [Q19 clause 14; Q15 Retention class as amended by Q19; ADR-IM-019]
     - **Acceptance:**
       - An everyday import draft (a People import or Gift file not yet confirmed) unchanged for 14 days becomes Discarded and its file is deleted.
       - From 7 days before that date, the discard date shows on the import draft and in the Imports list.
       - Any change to the import draft restarts the 14 days.
       - No email or other message is sent about the discard, and a Discarded import cannot be reopened or continued.

## The File step (Q19, Q11, Q15)

237. As a staff member with Data Tools Manage, I want to see accepted file types and limits before I choose a file, so that I don't waste time uploading a file Asym can't read. [Q19 clause 4; ADR-IM-019]
     - **Acceptance:**
       - The File step offers "Choose file" and a drop zone, and states the accepted file types and size limits before any file is chosen.
       - A file can be chosen and uploaded by keyboard alone through "Choose file".
       - A file of an unaccepted type is refused with a message listing the accepted types, and nothing from it is stored.

238. As a staff member with Data Tools Manage on an unreliable connection, I want an interrupted upload to resume where it stopped, so that a large file doesn't have to start again. [Q19 clause 4; Q15 clause 2; ADR-IM-019; O99]
     - **Acceptance:**
       - Upload progress shows how much of the file has been received.
       - After a dropped connection, the upload resumes from where it stopped rather than from the start.
       - An unfinished upload is deleted after 24 hours.

239. As a staff member with Data Tools Manage, I want Asym to show what it found in my file, so that I can tell at once whether it read the file correctly. [Q19 clause 4; ADR-IM-019]
     - **Acceptance:**
       - After upload, the File step shows the number of data rows, the number of columns, the sheet used and the detected text encoding.
       - When the encoding is uncertain, the person is asked to confirm it before the Columns step opens.
       - Cell formulas are read as text and never calculated.
       - An ID column whose values were turned into scientific notation or lost their leading zeros is reported with how to fix the file.

240. As a staff member with Data Tools Manage, I want to pick the sheet and confirm the header row, so that a title row or a second sheet never shifts every column. [Q11 clause 1; Q19 clause 4; ADR-IM-011]
     - **Acceptance:**
       - A workbook with more than one sheet asks which sheet to use before any column is read.
       - The person must confirm which row holds the headers before any column is matched.
       - Rows above the confirmed header row are not counted as data rows.

241. As a finance staff member, I want a Gift file to require its expected count and total before I go further, so that the gift batches carry a control I can balance against. [Q12 clause 7; Q19 clause 4; ADR-IM-012; O50]
     - **Acceptance:**
       - A Gift file cannot leave the File and totals step until both an expected number of gifts and an expected total are entered.
       - When the file's rows don't match the expected count or total, Review states the difference in words and as an amount.
       - The draft gift batches the Gift file creates carry the expected count and total, and Phase 15's balancing decides whether they can be posted.

242. As a staff member with Data Tools Manage, I want the file checked in the background, so that I can leave a large file to be read and come back to Review. [Q19 clauses 4 and 7; ADR-IM-019]
     - **Acceptance:**
       - While the plan is being built, the import's status is "Checking file" and the person can leave the page.
       - When the plan is built, the status becomes "Ready to review".
       - A file that cannot be read writes nothing and shows, on the File step, what happened and one next step.

## The Columns step (Q11, Q19, Q20)

243. As a staff member with Data Tools Manage, I want every column matched by rules in a fixed order and labelled with how it was matched, so that I can trust and check each match. [Q11 clause 1 as amended by Q19; Q19 clause 4; ADR-IM-011; ADR-IM-019]
     - **Acceptance:**
       - Each column of an unedited Asym Import template is matched to its field by exact key, with no "Suggested — review required" label.
       - For any other file, a remembered mapping for that source is used first, then Asym's Common-header list, then rule-based similar matches labelled "Suggested — review required".
       - Each column shows the column, three example values from the file, the Asym field and exactly one of "Remembered", "Same name", "Suggested — review required" or "Chosen by you".
       - No match score, percentage or confidence figure appears anywhere on the Columns step.

244. As a staff member with Data Tools Manage, I want to confirm every match myself, so that no column is written to a field nobody chose. [Q11 clause 1; ADR-IM-011]
     - **Acceptance:**
       - Continue stays unavailable until every non-empty column has a confirmed match or has been left out.
       - A suggested match that was never confirmed is never used for any row.
       - A person can confirm every remembered match at once with one action.

245. As a staff member with Data Tools Manage, I want a remembered mapping offered only when my file's headers match it exactly, so that a changed export is never matched silently by an old mapping. [Q11 clause 2; ADR-IM-011]
     - **Acceptance:**
       - A remembered mapping is offered only when the file's headers match its remembered headers exactly.
       - A file with even one renamed header gets no remembered mapping, and its columns are matched afresh.
       - A remembered mapping that is offered is shown for one-click confirmation and is never applied without it.
       - Matches the person confirms are remembered for that ministry and that source for the next file.

246. As a ministry Data Tools Admin, I want our mappings and headers never to reach another ministry, so that our confidential labels stay ours. [Q11 clause 2; ADR-IM-011]
     - **Acceptance:**
       - A remembered mapping belongs to one ministry and one source, and is never offered in any other ministry.
       - No header text or match confirmed in one ministry ever appears as a suggestion in another ministry.
       - The Common-header list does not change as a result of any ministry's import.

247. As a ministry Data Tools Admin, I want each import to record the mapping version it used, so that we can always tell which mapping produced an import's results. [Q11 clause 2; ADR-IM-011]
     - **Acceptance:**
       - Every plan records the version of the mapping it used.
       - Changing or deleting a remembered mapping later does not change the version recorded on any earlier import.

248. As a staff member with Data Tools Manage, I want a non-empty column I haven't matched to stop me until I match it or leave it out, so that no column of my file is lost without a decision. [Q11 clause 1; Q19 clause 4; ADR-IM-011]
     - **Acceptance:**
       - A non-empty column that is neither matched nor left out blocks Continue, and the step names that column.
       - A column with no values never blocks Continue.
       - Several unmatched columns can be left out in one action.
       - Every column left out is recorded as a Visible exclusion with its reason.

249. As a staff member with Data Tools Manage, I want missing required fields and doubled matches caught on the Columns step, so that Review never starts from an incomplete plan. [Q19 clause 4; ADR-IM-019]
     - **Acceptance:**
       - When no column is matched to a field the import kind requires, Continue is unavailable and the step names the missing field.
       - When two columns are matched to one field, Continue is unavailable and a plain message names both columns.

250. As a staff member with Data Tools Manage, I want dates and phone numbers read the way my file means them, so that no date or number is changed by a guess. [Q11 clause 4; Q19 clause 4; ADR-IM-011; ADR-IM-019]
     - **Acceptance:**
       - Each date column gets a chosen date format with a live example taken from the file.
       - A date column whose values can be read both day-first and month-first is flagged, and no date in it is written until the person chooses the format.
       - Each phone column gets a default country that the person can change.

251. As a staff member with Data Tools Manage, I want an everyday import to offer only the existing fields I may edit, so that an import neither creates fields nor writes where I have no right to write. [Q12 clause 1; Q19 clause 4; Q20 clause 7; ADR-IM-012; ADR-IM-020]
     - **Acceptance:**
       - The Columns step of an everyday import offers only fields that already exist, including existing custom fields, and no action that creates a field or a Field draft.
       - The Columns step offers only fields the person may edit.
       - A column the person cannot map to an editable field can still be left out.

252. As a staff member with Data Tools Manage confirming a colleague's import, I want columns I can't edit to be listed and left out rather than written, so that my Confirm never writes beyond my own rights. [Q20 clause 7; ADR-IM-020]
     - **Acceptance:**
       - When the confirmer cannot edit a mapped field, Review lists "Won't be written: you can't edit {field}" for that field.
       - Those columns are left out at Confirm, and no value from them is written for any row.
       - A field whose edit right is removed after Review is still not written, because the write itself checks the right again.

## The Values and Funds steps (Q11, Q13, Q16, Q20)

253. As a staff member with Data Tools Manage, I want each distinct value in a code column listed with its count, so that I decide once per value rather than once per row. [Q11 clause 3 as amended by Q16; Q19 clause 4; ADR-IM-011]
     - **Acceptance:**
       - For each code column (such as gift types, payment methods, funds, campaigns, statuses and restriction codes), the Value-mapping table lists every distinct value with the number of rows that hold it.
       - Values that differ only in letter case, spacing or punctuation are grouped for one decision.
       - Each distinct value is either matched to an existing Asym option or left out.

254. As a staff member with Data Tools Manage, I want unknown values refused unless I match them, so that no stray code becomes a new option by accident. [Q11 clause 3 as amended by Q16; ADR-IM-011]
     - **Acceptance:**
       - A source value with no match to an existing option is never written as option text, even on a field that allows open values.
       - An everyday import offers no action that creates an option, fund or designation, and options are added only in a Switch.
       - A row whose required value has no match cannot be written until the value is matched or the row is left out.

255. As a staff member with Data Tools Manage, I want leaving a value out to leave only that cell blank, so that one unknown code does not discard the rest of the row. [Q11 clause 3; ADR-IM-011]
     - **Acceptance:**
       - Leaving a value out leaves that cell blank in every row that holds it, and the rest of each row is still imported.
       - A row whose required value was left out shows under Needs fixing on Review.
       - A blank left by a left-out value never changes a stored value.

256. As a ministry Data Tools Admin, I want value mappings remembered by option identity rather than label, so that renaming an option in Asym doesn't break them. [Q11 clause 3 as amended by Q16; ADR-IM-011]
     - **Acceptance:**
       - Confirmed value mappings are remembered for that ministry and source.
       - After an option's label is renamed in Asym, a remembered value mapping still points to the same option.

257. As a finance staff member, I want the Funds and values step to show my file's own fund labels beside the designations I can see, so that I can match funds without needing clearance. [Q11 clause 4 as amended by Q20; Q20 clause 4; ADR-IM-020]
     - **Acceptance:**
       - The Funds and values step shows the file's own fund labels and only the designations the person can see, with Phase 10 aliases where they apply.
       - Finance staff without clearance can complete the Funds and values step of a Gift file.
       - A gift row whose fund is left out cannot be written.

258. As a finance staff member, I want sending gifts to the General Fund to be a deliberate, counted choice, so that unmatched funds never land there by default. [Q11 clause 3 as amended by Q13; ADR-IM-011]
     - **Acceptance:**
       - No source fund is matched to the General Fund unless a person chooses it.
       - Review states how many gifts the General Fund choice covers.

## Keeping the import inside Asym (Q11, Q19)

259. As a ministry Data Tools Admin, I want column and value matching done entirely inside Asym with no AI, so that our files, headers and values never leave Asym for matching. [Q11 clause 5; ADR-IM-011]
     - **Acceptance:**
       - Uploading, reading, matching, reviewing and committing an import makes no request to any AI service or to any hosted or embedded importer service.
       - Every suggestion comes only from remembered mappings, the Common-header list or rule-based similarity.
       - The missionary self-import's matching is rule-based in the same way.

260. As a ministry Data Tools Admin, I want the Eve assistant panel absent from Data Tools, so that nobody pastes our source values into an AI from the import journey. [Q11 clause 5 as amended by Q19; Q19 clause 12; ADR-IM-019]
     - **Acceptance:**
       - The Eve assistant panel is not shown on any Data Tools page, including every step of the Import page and the import reversal page.
       - No control on a Data Tools page sends file content, headers or values to Eve.

261. As a founder of Asym, I want each Switch to record how its columns were matched and how long matching took, so that I can judge when to revisit optional AI help with evidence. [Q11 clause 6; ADR-IM-011]
     - **Acceptance:**
       - Each Switch records the share of its non-empty columns matched by key or preset, by remembered mapping, by the Common-header list, by an accepted suggestion, by hand, or left out, and the shares add up to all non-empty columns.
       - Each Switch records the time spent matching columns and values.
       - The record holds shares and times only, with no cell values.

## People import writes (Q12, Q20)

262. As a staff member with Data Tools Manage, I want every column to fill only empty fields unless someone deliberately chooses otherwise, so that an import can't wipe good data by default. [Q12 clause 2; Q19 clause 4; ADR-IM-012]
     - **Acceptance:**
       - Every mapped column starts on "Fill empty only", and the write mode is chosen per column on Review.
       - "Fill empty only" writes only to fields that are empty in Asym and leaves every populated field unchanged.
       - A column set to "Ignore" writes nothing for any row.
       - Values that will be written into empty fields are counted under "Will be filled in".

263. As a Data Tools Admin, I want to choose Replace for a column and see exactly how many values will change, so that I replace existing data only knowingly. [Q12 clause 2 as amended by Q20; Q19 clause 4; Q20 clause 1; ADR-IM-012; ADR-IM-020; O102]
     - **Acceptance:**
       - "Replace" is offered only to a person holding the Replace permission of Replace and Clear, and holding only the Clear permission does not offer it.
       - Choosing "Replace" for a column shows "N existing values will change", where N is the exact number of populated fields the column would change.
       - Committing changes exactly N existing values for that column, apart from fields changed in Asym since the plan was made.
       - A Data Tools Manage holder without the Replace permission can prepare and confirm a People import using only "Fill empty only" and "Ignore".

264. As a staff member with Data Tools Manage, I want a blank cell never to change anything, so that gaps in a file never erase stored values. [Q12 clause 2; ADR-IM-012; O51]
     - **Acceptance:**
       - A blank cell leaves the stored value unchanged under every write mode, including "Replace".
       - No setting, for one column or for the whole import, makes blank cells clear stored values.

265. As a Data Tools Admin, I want clearing values to be a separate action with its own count and confirmation, so that nothing is cleared as a side effect of an import. [Q12 clause 2 as amended by Q20; Q20 clause 1; ADR-IM-012; O51; O102]
     - **Acceptance:**
       - Clearing is a separate action for one column at a time, offered only to a person holding the Clear permission of Replace and Clear, and holding only the Replace permission does not offer it.
       - The Clear action states how many stored values it will clear and needs its own confirmation.
       - Confirming it clears exactly that many values, and without that confirmation no value is cleared.

266. As a staff member with Data Tools Manage, I want new contact details added beside existing ones rather than replacing them, so that no working email, phone or address is lost. [Q12 clause 3; ADR-IM-012; O51]
     - **Acceptance:**
       - A new email, phone or address in the file is added to the matched person, and every existing one stays.
       - A new contact detail becomes primary only when the row says it should.
       - When a row makes a new address the current one, the previous address is kept with an end date and is not deleted.

267. As a donor whose spouse appears in an import, I want an address change for one household member never to spread to the others, so that my own address stays correct. [Q12 clauses 1 and 3; Q10 clause 1; ADR-IM-012]
     - **Acceptance:**
       - An address change written for one person changes no other household member's address.
       - A household is created only from the file's explicit household columns, such as Household ID or Person 2, and never from a shared address, email or surname.
       - No household of one person is created.

268. As a staff member with Data Tools Manage, I want tags and list memberships only ever added, so that an import never quietly takes anyone off a list. [Q12 clause 3; ADR-IM-012; O51]
     - **Acceptance:**
       - Tags in the file are added to the matched person, and tags not in the file stay.
       - List memberships in the file are added, and no import removes anyone from a list.
       - Adding a list membership grants no email permission and sends nothing.

269. As a staff member with Data Tools Manage, I want change-of-address results and shared emails held for my decision, so that a family match or a shared mailbox never moves the wrong person's details. [Q12 clause 3; Q10 clauses 4 and 7; ADR-IM-012]
     - **Acceptance:**
       - Every address from a change-of-address (NCOA) file goes to Needs your decision and is never applied without a person's decision.
       - A new email already held by another person goes to Needs your decision and never causes a failure during commit.
       - Asym offers no automatic connection to a change-of-address service.

270. As a staff member who edited a record after the plan was made, I want my newer change kept rather than overwritten by the import, so that newer work always wins. [Q12 clause 4; Q19 clause 4; ADR-IM-012]
     - **Acceptance:**
       - A field changed in Asym after the plan was made is never written by the import.
       - Such rows are counted under "Changed in Asym since: kept".
       - A change made after Review was shown but before the row is written is still kept.

271. As a donor who asked not to be contacted, I want an import to keep my do-not-contact restriction exactly as it is, so that a spreadsheet can never put me back on a mailing. [Q12 clause 4; Q9; ADR-IM-012; O41]
     - **Acceptance:**
       - A matched do-not-contact person is updated like anyone else and flagged in the import's results.
       - The person's do-not-contact restriction is unchanged after the import.
       - A restriction column can add a restriction and never lifts or loosens one.

272. As a staff member with Data Tools Manage, I want rows matched first by source ID and then only by email plus first name, so that an import updates the right person or asks me. [Q12 clause 5; Q10 clause 7; ADR-IM-012; O47]
     - **Acceptance:**
       - A row whose source ID is remembered for that source matches that person first.
       - Without a source ID match, a row matches on email only when the first name also agrees and the email is not a Shared mailbox, and otherwise goes to Needs your decision.
       - Any uncertain match goes to Needs your decision, and no import merges two people.
       - Importing the same People file a second time shows its matched rows as "No change" and creates no duplicate people.

273. As a donor, I want an everyday import to grant nothing and send me nothing, so that being on a ministry's spreadsheet never signs me up for messages. [Q12 clause 6; ADR-IM-012; O78]
     - **Acceptance:**
       - An import sends no email, letter or text and fires no welcome, automation or field-change trigger.
       - A person added by an everyday import receives no newsletter or appeal until they opt in themselves, while receipts for their own new gifts still go to them.
       - A dated opt-in in the file is kept only as evidence, and an everyday import records no consent and grants no email permission.

274. As a ministry Data Tools Admin, I want the actions left out of v1 to be absent, so that nobody can delete, merge or change money by spreadsheet. [Q12 clause 9; ADR-IM-012]
     - **Acceptance:**
       - No everyday import deletes people or records in bulk, merges people, uploads pledges or records consent.
       - A Gift file only creates new draft gifts and never changes an existing gift.
       - No everyday import connects to a change-of-address service.

## Held for review (Q12, Q20)

275. As a missionary whose record is protected, I want a file row that matches me held rather than shown or duplicated, so that an import neither reveals me nor creates a second record under my legal name. [Q12 clause 4 as amended by Q20; Q20 clause 6; ADR-IM-020; O44]
     - **Acceptance:**
       - A row matching a record the preparer can't see, a staff member or someone marked deceased is Held for review.
       - Every held row shows the same wording, "Held for review: someone who can see the matching records will review these rows. Nothing has changed for them.", whatever the reason.
       - A held row is never created as a new person and never shows which record it matched.
       - The Held for review count is the same for every viewer, and the rest of the import goes ahead.

276. As a cleared reviewer with Data Tools Manage, I want to review held rows after commit and commit them under my own permissions, so that rows nobody else may see still reach the right records. [Q12 clause 4 as amended by Q20; Q20 clause 6; ADR-IM-020]
     - **Acceptance:**
       - After commit, any Data Tools Manage holder who can see a held row's matched record, including the preparer if they can, can review that row on the same Import page.
       - The reviewer either commits each held row or leaves it out, and every write is attributed to the reviewer and made under the reviewer's own permissions.
       - The confirmer's Confirm never writes a held row.
       - A held row's matched record and current values are shown only to people who can see that record.

277. As a cleared reviewer, I want held rows to reach me through the Tasks Hub without naming anyone, so that held rows get reviewed without revealing who or what they match. [Q20 clause 6; ADR-IM-020; O97]
     - **Acceptance:**
       - A Tasks Hub item for an import's held rows reaches only people eligible to review them.
       - The item names neither the matched record nor any other eligible reviewer.

278. As a staff member with Data Tools Manage, I want held rows to have a visible review deadline, so that nobody is surprised when unreviewed rows are left out. [Q20 clause 6; Q15 clause 2; ADR-IM-020]
     - **Acceptance:**
       - Held rows not reviewed by the import file's deletion date, 30 days after commit, become "Left out: not reviewed in time".
       - While rows are held, the Import page shows the date by which they must be reviewed.
       - An import with held rows shows "Needs attention", never "Done".

279. As a Data Tools Admin, I want to be told when no Data Tools Manage holder has clearance, so that held rows for protected people don't wait with nobody able to review them. [Q20 clause 6; ADR-IM-020]
     - **Acceptance:**
       - Data Tools Admins see a setup notice whenever no Data Tools Manage holder in the ministry has clearance.
       - The notice disappears once at least one Data Tools Manage holder has clearance.

280. As a ministry privacy role, I want held matches to protected people counted as restricted-access attempts, so that repeated probing through imports is noticed. [Q20 clause 6; ADR-IM-020; O104]
     - **Acceptance:**
       - Each held match to a protected person writes a restricted-access audit entry that contains no plaintext from the row.
       - Each such held match counts toward Phase 12's restricted-read budget.

## Gift files (Q12, Q20)

281. As a finance staff member, I want a Gift file to become draft gift batches in Contributions, so that every gift passes the normal batch review before anything is posted. [Q12 clause 7; ADR-IM-012; O50; O94]
     - **Acceptance:**
       - Confirming a Gift file creates draft Phase 15 gift batches only, and the import posts, receipts or thanks nothing.
       - The Gift file lists and links every gift batch it created, and each gift batch links back to the Gift file.

282. As a donor whose gift arrives in a Gift file, I want it treated as an ordinary current gift, so that I'm thanked and receipted normally once it's posted. [Q12 clause 7; ADR-IM-012; O50]
     - **Acceptance:**
       - Gift file rows enter Phase 15 as ordinary current gifts and get normal batch-gated receipts and thank-yous once posted.
       - No Gift file gift is ever marked Recorded outside Asym.
       - No Gift file gift's acknowledgment is held as an import-origin acknowledgment.

283. As a finance staff member, I want a payout that was already imported refused, so that the same money can never be recorded twice. [Q12 clause 7; ADR-IM-012; O50]
     - **Acceptance:**
       - Every Gift file row carries the platform's payout and transaction keys.
       - A row whose payout or transaction key was already imported is refused, and Review shows it as already imported with its count.
       - Uploading the same Gift file a second time creates no gift.

284. As a finance staff member, I want each gift row to name its payer of record and the person recognised, so that receipts and thank-yous go to the right party. [Q12 clause 7; ADR-IM-012; O50]
     - **Acceptance:**
       - Each Gift file row names a payer of record (the person, or a DAF sponsor, workplace-giving platform or employer) and a recognised person.
       - Receipts and thank-yous follow Phase 7 and Phase 14 rules and never a choice made in the file.
       - The advisor of a donor-advised fund gift gets a "not a tax receipt" thank-you and never a tax receipt.
       - An employer's matching gift and the employee's own gift become two separate gifts.

285. As a finance staff member during a Legacy Recurring Tail, I want rows charged by a legacy executor refused, so that old subscription gifts are not recorded and receipted twice. [Q12 clause 7; ADR-IM-012; O35; O50]
     - **Acceptance:**
       - While a Legacy Recurring Tail is open, every row that belongs to a declared legacy executor, such as a PayPal report of old subscriptions, is refused with its reason.
       - The refusal tells the person that those gifts arrive only through a Legacy Tail Backfill.
       - No refused row becomes a gift or triggers a receipt.

286. As a staff member with Data Tools Manage but without the gift-entry permission, I want to prepare a Gift file and hand Confirm to a colleague who has it, so that preparation and money entry stay with the right people. [Q12 clause 8 as amended by Q20; Q20 clause 4; ADR-IM-020]
     - **Acceptance:**
       - A Data Tools Manage holder can prepare every step of a Gift file without `finance:record_contribution`.
       - A person without `finance:record_contribution` sees no Confirm on a Gift file, and a written line says why.
       - A colleague holding Data Tools Manage and `finance:record_contribution` can confirm the same Gift file.

287. As a View holder without access to contributions, I want Gift file amounts hidden from me, so that I can follow imports without seeing money I'm not allowed to see. [Q19 clause 3 as amended by Q20; Q20 clause 4; ADR-IM-020]
     - **Acceptance:**
       - Gift file amounts show on the Import page and in the Imports list only to people who can see contributions.
       - People who cannot see contributions see the same Gift file's counts without any amount.

## Review and import (Q19, Q20)

288. As a staff member with Data Tools Manage, I want Review to account for every row of my file in one equation, so that I can trust that nothing went missing. [Q19 clause 4 as amended by Q20; Q20 clause 5; ADR-IM-019; ADR-IM-020]
     - **Acceptance:**
       - Review shows counts for Needs fixing, Needs your decision, New, Will be filled in, No change, Changed in Asym since: kept, Left out and Held for review, and they add up exactly to the file's data rows.
       - Every data row is counted in exactly one of those groups.
       - Every viewer sees the same counts for the same plan.
       - For a large file, the group counts show first and each group's rows load page by page.

289. As a staff member with Data Tools Manage, I want each change shown in words as "Now", "In your file" and "Result", so that I can see exactly what will happen to a matched record. [Q19 clause 4 as amended by Q20; Q20 clause 5; ADR-IM-019; ADR-IM-020]
     - **Acceptance:**
       - Each field that a matched row would change shows "Now", "In your file" and "Result" in words.
       - "Now" and any other Asym-side fact about a record show only to people who can see that record.
       - "In your file" shows the file's own cells to Data Tools Manage holders.

290. As a staff member with Data Tools Manage, I want each decision shown with both sides and its reason, and bulk choices limited to one reason, so that I can't accept the wrong matches wholesale. [Q19 clause 4; ADR-IM-019]
     - **Acceptance:**
       - Each row under Needs your decision shows both sides and the reason it needs a decision.
       - A bulk action applies only to rows sharing one reason, for example adding every row in one reason group as new people.
       - No control accepts every decision on Review at once.
       - A row needing a decision is never written until a person decides it or leaves it out.

291. As a staff member with Data Tools Manage, I want every problem to say what happened and one next step, so that I can fix it without help. [Q19 clauses 4 and 11; ADR-IM-019]
     - **Acceptance:**
       - Every row under Needs fixing states what happened and one next step in plain words.
       - A row that looks like a totals row is reported under Needs fixing rather than imported.
       - No status or problem label on Review uses the word "error".

292. As a staff member with Data Tools Manage, I want to fix problem cells in Asym with a record of each fix, so that small problems don't need another upload. [Q19 clause 4; ADR-IM-019; O94]
     - **Acceptance:**
       - In an everyday import, a problem cell can be fixed one cell at a time or by find and replace within one column.
       - Each fix records who made it, when, the old value and the new value.
       - The old and new values are deleted when that import's reversal window ends, and erasure removes them. Row, column, who and when remain.
       - Fixing cells in Asym leaves the uploaded file itself unchanged.
       - In a Switch, Review offers no cell editing, and problems are fixed at the source.

293. As a staff member with Data Tools Manage, I want to download my problem rows, fix them in my spreadsheet and upload them again with my decisions kept, so that I can fix many rows the way I'm used to. [Q19 clause 4; Q20 clause 8; ADR-IM-019; ADR-IM-020]
     - **Acceptance:**
       - Problem rows can be downloaded, fixed outside Asym and uploaded again to the same import.
       - After the fixed rows are uploaded again, every decision already made on that import is kept.
       - The download holds only the file's own cells and the reasons, never Asym-side values.

294. As a staff member with Data Tools Manage, I want to leave problem rows out on purpose, so that the rest of an everyday import can go ahead today. [Q19 clause 4; ADR-IM-019]
     - **Acceptance:**
       - In an everyday import, problem rows can be left out deliberately and are counted under Left out.
       - A left-out row is never written.
       - Left-out rows can be downloaded.
       - An import with any left-out rows finishes as "Needs attention", not "Done".

## Confirming an import (Q19, Q20)

295. As a staff member with Data Tools Manage, I want the Confirm button of a People import to name the result, so that I know exactly what pressing it will do. [Q19 clause 4; ADR-IM-019]
     - **Acceptance:**
       - The Confirm button of a People import names the result in counts, for example "Add 1,980 people and fill in 310 values".
       - The counts on the button equal the counts the import commits, apart from rows changed in Asym after the plan was made.

296. As a finance staff member, I want a Gift file's Confirm to say that nothing is posted yet, so that nobody mistakes creating draft gift batches for posting money. [Q19 clause 4; Q12 clause 7; ADR-IM-019]
     - **Acceptance:**
       - A Gift file's Confirm button names the result with counts and the total, for example "Create 3 draft gift batches: 214 gifts, $18,440.00".
       - The line "Nothing is posted and no receipts are sent until someone posts these batches in Contributions." appears with the button.

297. As a Data Tools Admin, I want Confirm to warn me when Replace is on, so that a Replace is never confirmed by accident. [Q19 clause 4; ADR-IM-019]
     - **Acceptance:**
       - With "Replace" on for any column, the Confirm button is warning-styled.
       - The warning-styled button states how many existing values will change.

298. As a staff member with Data Tools Manage, I want pressing Confirm twice to start only one import, so that a double-click never imports a file twice. [Q19 clause 4; ADR-IM-019]
     - **Acceptance:**
       - A second press of Confirm, a double-click or a retried request creates no second import and shows the import already running.
       - Confirming a plan that someone changed since it was shown is refused, and the newer plan is shown instead.

299. As a staff member with Data Tools Manage, I want an old or changed plan rebuilt before Confirm, so that I never commit a plan built on yesterday's data. [Q19 clause 4; ADR-IM-019]
     - **Acceptance:**
       - A plan built more than 24 hours earlier is rebuilt before Confirm, and the rebuilt Review shows what changed.
       - A plan whose file changed is rebuilt before Confirm, and the rebuilt Review shows what changed.
       - Nothing is written from a plan that needed rebuilding.

300. As a staff member with time-limited Data Tools access, I want Confirm to show when my access ends, so that I don't start an import that will stop when my access runs out. [Q20 clause 11; ADR-IM-020]
     - **Acceptance:**
       - When the confirmer's access is time-limited, Confirm shows the date, time and ministry time zone at which it ends.
       - When the confirmer's access is not time-limited, Confirm shows no end time.

## Importing (Q19, Q20)

301. As a staff member with Data Tools Manage, I want the import to run in the background after Confirm, so that I can get on with other work. [Q19 clause 5; ADR-IM-019]
     - **Acceptance:**
       - After Confirm, the Import page says "You can leave this page."
       - Closing the browser or leaving the page while the import runs neither stops nor slows it.

302. As a staff member with Data Tools Manage, I want progress shown from real counts and named phases with no time estimate, so that progress is never invented. [Q19 clause 5; ADR-IM-019]
     - **Acceptance:**
       - Progress names the current phase with real counts, for example "Saving 3,000 of 12,000 rows".
       - No time estimate or time remaining appears anywhere on the Import page.
       - Each phase change and the finish are announced politely to screen readers, at most once per phase.

303. As a staff member with Data Tools Manage, I want a second heavy job to wait and say what it is waiting for, so that two imports never run at once in my ministry. [Q19 clause 5; Q15 clause 13; ADR-IM-019]
     - **Acceptance:**
       - When another heavy job is running for the ministry, a later Confirm shows "Waiting to start, after {name}'s {import} (started {time})".
       - The waiting import starts on its own when the other job ends, and two heavy jobs never run at once for one ministry.
       - At start, the waiting import checks the confirmer's permissions, the plan's freshness and the Switch pause again, and if a check fails it does not start and shows the reason.

304. As a staff member with Data Tools Manage, I want to cancel an import before anything is written, so that changing my mind costs nothing. [Q19 clauses 5 and 7; ADR-IM-019]
     - **Acceptance:**
       - Until the first row is written, the Import page offers "Cancel import".
       - "Cancel import" leaves every record unchanged, and the import shows "Stopped".

305. As a staff member with Data Tools Manage, I want to stop an import that has started writing, and be told what stays, so that I know how to get back to where I was. [Q19 clauses 5 and 7; ADR-IM-019]
     - **Acceptance:**
       - Once writing starts, the Import page offers "Stop after this batch" instead of "Cancel import".
       - "Stop after this batch" explains that rows already saved stay and that Prepare reversal is the way back.
       - The import shows "Stopping" until the current batch ends and then "Needs attention", because rows were written.

306. As a staff member with Data Tools Manage, I want a lasting banner when an import finishes or fails, so that I can't miss the outcome. [Q19 clause 5; ADR-IM-019]
     - **Acceptance:**
       - Finishing or failing shows a banner on the Import page that stays until the person leaves the page.
       - No finish or failure is shown only in a pop-up that disappears on its own.

307. As a ministry Data Tools Admin, I want each batch of an import to check the confirmer's permission again, so that someone who loses access can't keep writing. [Q20 clause 11; ADR-IM-020]
     - **Acceptance:**
       - Before each batch, the import checks the confirmer's permissions and clearance again.
       - When the confirmer has lost a needed permission, the import stops after the current batch and shows "Needs attention" with "Stopped: {name} no longer has permission".
       - A time-limited grant that expires mid-import stops the import in the same way.

308. As a staff member holding the needed permissions, I want to resume an import that stopped for lost permission, so that a colleague leaving doesn't strand half an import. [Q20 clause 11; ADR-IM-020]
     - **Acceptance:**
       - Anyone holding every permission the import needs can resume its remaining rows.
       - Rows written after resuming are attributed to the person who resumed, and rows written before stay attributed to the original confirmer.
       - A person missing any needed permission is not offered resume.

309. As a staff member with Data Tools Manage, I want an import interrupted by a failure to carry on without writing anything twice, so that a crash never duplicates or loses rows. [Q19 clause 5; ADR-IM-019]
     - **Acceptance:**
       - An import interrupted by a server failure resumes from its remaining rows and writes no row twice.
       - If the same failure repeats, the import stops as "Needs attention" with a plain reason when rows were written, or "Failed" when nothing was written.
       - When an import kind is switched off during an import, the import stops after the current batch as "Needs attention" and can be resumed when the kind is switched back on.

310. As a staff member with Data Tools Manage, I want finish and attention notices to reach me once through the usual channels, so that I don't need to watch the page. [Q19 clause 10; Q5 clause 1 as amended by Q19; ADR-IM-019; O96; O97]
     - **Acceptance:**
       - "Finished" and "Needs attention" notices come only through Phase 17 staff notifications.
       - Each notice exists as one actionable copy and never duplicates a Tasks Hub item for the same import.
       - Imports that need a person appear in the Tasks Hub through its registered projection, never as rows in today's task table.
       - Until O96 is delivered, no import notice is sent by any other route and the Imports list remains the way back to every import; People imports and Gift files do not wait for O96, which is needed before the first Switch.

## Results and status (Q19)

311. As a staff member with Data Tools Manage, I want results that account for every row, on the same Import page, so that I can see exactly what the import did. [Q19 clause 6; ADR-IM-019]
     - **Acceptance:**
       - Every data row of the file has exactly one outcome, and the outcome counts add up to the file's data rows.
       - The counts on the Import page match the counts shown for that import in the Imports list.
       - Rows left out or waiting can be downloaded on demand as text-typed spreadsheets.

312. As a staff member with Data Tools Manage, I want results to link to the people the import touched, so that I can check them straight away. [Q19 clauses 2 and 6; ADR-IM-019; O93]
     - **Acceptance:**
       - A People import's results offer "View these people", which opens the People list filtered to people added or changed by this import.
       - The filtered People list links back to the Import page.

313. As a finance staff member, I want a Gift file's results to link to each draft gift batch it created, so that I can review and post them in Contributions. [Q19 clauses 2 and 6; ADR-IM-019; O94]
     - **Acceptance:**
       - A Gift file's results list every draft gift batch it created, each with a link to it in Contributions.
       - Each draft gift batch links back to the Gift file's Import page.

314. As a staff member with Data Tools Manage, I want possible duplicates the import found handed to Phase 4's duplicate queue, so that duplicates are resolved where merges belong. [Q19 clause 6; Q12 clause 5; ADR-IM-019; O95]
     - **Acceptance:**
       - Possible duplicates found by the import are filed in Phase 4's duplicate queue carrying the import's identity, and the results link to them.
       - No possible duplicate is merged by the import.

315. As a staff member following an import, I want one status vocabulary that never shows success when something is wrong, so that I can trust a status at a glance. [Q19 clause 7; ADR-IM-019]
     - **Acceptance:**
       - Every import shows exactly one of Draft, Checking file, Ready to review, Waiting to start, Importing, Stopping, Done, Needs attention, Stopped, Failed or Discarded, each with a colour, an icon and its words.
       - "Done" appears only when no row is left out, waiting or needing review, including held rows, and otherwise the status is "Needs attention".
       - "Stopped" and "Failed" appear only when nothing was written, and an import that wrote some rows shows "Needs attention".
       - No import status reads "error", "completed with errors" or "partial success".

316. As a staff member following an import, I want import reversal progress shown as a second label beside the import's status, so that I can see both what the import did and whether it was taken back. [Q19 clause 7; ADR-IM-019]
     - **Acceptance:**
       - An import with an import reversal shows one of Reversal prepared, Reversing, Reversed or Partly reversed as a second label beside its status.
       - The second label shows wherever the import's status shows, including the Imports list.

## Downloads of your file's rows (Q20)

317. As a staff member with Data Tools Manage, I want to download my own file's problem, left-out and held rows without any Asym data, so that I can fix them at the source without seeing records I may not see. [Q20 clause 8; Q15 clause 4 as amended by Q20; ADR-IM-020]
     - **Acceptance:**
       - Data Tools Manage holders can download their file's problem, left-out and held rows.
       - The download contains only the file's own cells and each row's reason, never an Asym-side value.
       - Held rows are included with the same held wording, so the downloaded row count equals the count shown on screen.

318. As a ministry Data Tools Admin, I want every import download streamed, safe to open and capped, so that downloads never leave copies behind or run formulas. [Q20 clause 8; ADR-IM-020]
     - **Acceptance:**
       - Every download is generated when requested, streamed and never stored.
       - Every download is text-typed and formula-safe, so a cell starting with "=" opens as text.
       - A download of more than 1,000,000 rows is refused with a prompt to filter first.

319. As a staff member with Data Tools Manage, I want downloads that include Asym data to follow the ministry's export permission, so that importing never becomes a back door for exporting. [Q20 clause 8; ADR-IM-020]
     - **Acceptance:**
       - A download that includes Asym data, such as a results list, is offered only to people holding the ministry's existing export permission, and contains only rows they can see on screen.
       - Protected people are never included in a download that includes Asym data.
       - A person without export permission is not offered such downloads but can still download their own file's rows.

## Where Prepare reversal appears (Q18, Q12)

320. As a ministry member with the reversal permission, I want "Prepare reversal" on every committed People import and Gift file while its window is open, so that a wrong import can be taken back from its own page. [Q18 clause 1; Q12 clause 8 as amended by Q18; Q19 clause 6; ADR-IM-018; O102]
     - **Acceptance:**
       - "Prepare reversal" appears on each committed People import and each committed Gift file until its Import reversal window closes.
       - "Prepare reversal" is shown only to a ministry member holding the reversal permission, and others who can see the import see the deadline line without the action.
       - An import that stopped with rows written, shown as "Needs attention", still offers "Prepare reversal" within its window.

321. As a ministry member with the reversal permission, I want "Prepare reversal" on each Switch run after go-live, so that a Switch run that went wrong can be taken back like any other import. [Q18 clauses 1 and 7; ADR-IM-018]
     - **Acceptance:**
       - "Prepare reversal" appears on each Switch run once the Switch has gone live, until 30 days after go-live.
       - No Switch run shows "Prepare reversal" before go-live, and the way back there is to stop the Switch or fix and re-run the family.
       - Practice copies show no "Prepare reversal".

322. As a missionary who imports my own contacts, I want my self-import corrected by changing entries one at a time rather than by an import reversal, so that my workspace stays as simple as it was agreed. [Q18 clause 1; Q12 clause 8 as amended by Q18; ADR-IM-018]
     - **Acceptance:**
       - The missionary self-import shows no "Prepare reversal" and has no route that reverses it as a whole.
       - Entries a missionary self-import added can still be changed one at a time.

323. As a ministry member with the reversal permission, I want pressing "Prepare reversal" to change nothing, so that I can look before I decide. [Q18 clause 1; ADR-IM-018]
     - **Acceptance:**
       - Pressing "Prepare reversal" writes nothing to any person, gift, note, file or field.
       - Leaving the prepared page without confirming changes nothing.
       - An import that changed nothing shows that there is nothing to reverse.

324. As a ministry member with the reversal permission, I want only one prepared page for an import at a time, so that two colleagues never prepare competing import reversals. [Q18 clauses 1 and 6; ADR-IM-018]
     - **Acceptance:**
       - When two people press "Prepare reversal" on the same import, both see the same prepared page.
       - While a prepared page exists, the import shows the second label "Reversal prepared".

## The import reversal page (Q18)

325. As a ministry member with the reversal permission, I want everything the import created or changed shown once in one of three groups, so that I see the whole effect of the import in one place. [Q18 clause 2; ADR-IM-018]
     - **Acceptance:**
       - Every item the import created or changed appears exactly once, under Can be reversed now, Needs its owner's correction or Stays as it is.
       - The three groups' counts add up to the import's totals.
       - Counts on the page are whole-import counts and the same for every viewer.
       - Owners' finer groupings appear as reasons within the three groups, never as extra groups.

326. As a ministry member with the reversal permission, I want each item that needs another owner's correction to link straight to that owner's tool, so that I don't have to hunt for where to fix it. [Q18 clauses 2 and 3; ADR-IM-018]
     - **Acceptance:**
       - Each item under Needs its owner's correction links directly to the owner's tool for that item.
       - Confirming the import reversal changes nothing under Needs its owner's correction.

327. As a ministry member with the reversal permission, I want every item that stays as it is to give its reason in plain words, so that I understand why it can't be taken back. [Q18 clauses 2, 3 and 4; ADR-IM-018]
     - **Acceptance:**
       - Each item under Stays as it is shows its reason in plain words, such as "Erased since".
       - Restrictions, opt-outs and suppression evidence always appear under Stays as it is, with the reason that they are never removed.
       - Retired designations created from mapping appear under Stays as it is, with the reason that they are kept for history.

328. As a finance staff member, I want a Gift file's import reversal to list every gift batch it produced with Phase 15's own action, so that money is corrected only by its owner. [Q18 clause 3; Q12 clause 8 as amended by Q18; ADR-IM-018; O90]
     - **Acceptance:**
       - Every gift batch the Gift file produced, including follow-on batches, is listed under Needs its owner's correction with its current state.
       - A draft gift batch links to Phase 15 to discard it, and a posted gift batch links to Phase 15 to reverse it.
       - Phase 15's page states any donor-visible effects, such as corrected or void receipts, and any approval step before anything happens.
       - The import reversal itself writes no money and posts nothing.

329. As a ministry member with the reversal permission, I want a Switch run's import reversal to send each family to its owner's correction path, so that history, money and fields are corrected the way their owners require. [Q18 clause 3; ADR-IM-018]
     - **Acceptance:**
       - People results of a Switch run after go-live appear under Can be reversed now when they pass the People checks, and otherwise under Stays as it is.
       - Giving history appears under Needs its owner's correction, linking to Phase 13's void and re-adopt.
       - Recurring gifts and tail evidence link to Phase 16, and notes, interactions, files, applications and care records link to their owners' correction run.
       - Custom fields and options the Switch created link to the Created-by-Switch list.

330. As a website editor, I want the import reversal of a website content import to use the same three-group page with Phase 23's own rules, so that content is taken back only where it is still safe to. [Q18 clauses 1, 2 and 3; ADR-IM-018; O91]
     - **Acceptance:**
       - A website content import's prepared page groups items into the same three groups, with Phase 23's seven groupings shown as reasons.
       - Items Phase 23 can move to Trash or give a private restoring revision appear under Can be reversed now.
       - Edited, referenced, scheduled or published items appear under Stays as it is.

331. As a ministry member with the reversal permission, I want an itemised results list on demand under my own permissions, so that I can check each item without a stored file of personal data. [Q18 clause 6; ADR-IM-018]
     - **Acceptance:**
       - A results list showing each item, what happened and why is generated when requested.
       - The results list shows only items about records the viewer can see.
       - The results list is never stored as a file.

## People checks in an import reversal (Q18, Q12)

332. As a staff member who edited a record after an import, I want an import reversal never to overwrite my edit, so that my later work is kept. [Q18 clause 4; Q12 clause 8 as amended by Q18; ADR-IM-018; O87]
     - **Acceptance:**
       - A value, including a custom field value, goes back only if nobody and nothing has written that field since the import, including a later import.
       - A field written since the import with the same value the import wrote is left as it is.
       - Each check is made again at the moment the item is changed, so an item changed after the page was prepared is left as it is and listed with its reason.

333. As a ministry member with the reversal permission, I want values that were empty before the import emptied again and counted, so that I know how many fields will become blank. [Q18 clause 4; ADR-IM-018; O87]
     - **Acceptance:**
       - A field that was empty before the import becomes empty again when it passes the check.
       - The page states separately how many values will become empty again.

334. As a ministry member with the reversal permission, I want to take back imports in any order, so that I can fix an older bad import without first taking back a newer good one. [Q18 clause 4; ADR-IM-018; O87]
     - **Acceptance:**
       - When import A and then import B wrote the same field, reversing A leaves that field as it is with the reason that a later import changed it.
       - Reversing B puts back A's value together with A's write, so a later import reversal of A then puts back the original value.
       - No import reversal is refused only because a newer import exists.

335. As a ministry member with the reversal permission, I want a person's tags treated as one field, so that tags go back only when nobody has changed them. [Q18 clause 4; ADR-IM-018; O87]
     - **Acceptance:**
       - A person's tags go back to their state before the import only if the person's tags have not changed since.
       - Any change to the person's tags since the import leaves all their tags as they are, with the reason.

336. As a ministry member with the reversal permission, I want contact details the import added removed as entered in error only when nothing depends on them, so that the record stops claiming details that were never true without losing used ones. [Q18 clause 4; ADR-IM-018; O87]
     - **Acceptance:**
       - An email, phone or address the import added is removed as Entered in error only if it is unchanged since the import and nothing was sent to it.
       - An added email that has since received a receipt or message stays as it is.
       - When an added address is removed as Entered in error, the address the import ended is reopened, and when the added address stays, the ended address stays ended.

337. As a donor added to a list by an import, I want my membership removed as a correction rather than as an unsubscribe, so that the record is fixed without inventing a choice I never made. [Q18 clause 4; Q12 clause 8 as amended by Q18; ADR-IM-018; O87]
     - **Acceptance:**
       - A list membership the import added is removed as Entered in error only if it is unchanged since the import and nothing was sent to it.
       - Removing it records no unsubscribe, records or lifts no block, and sends nothing.
       - A membership the person confirmed themselves since the import stays as it is.

338. As a ministry member with the reversal permission, I want household links the import added removed only when unchanged, so that household history is corrected without breaking real households. [Q18 clause 4; ADR-IM-018; O87; O88]
     - **Acceptance:**
       - A household link the import added is removed as Entered in error only if it is unchanged since the import and nothing was sent to that household.
       - A household the import created whose members are all archived by the import reversal is archived with its last member.

339. As a ministry member with the reversal permission, I want people the import created archived only if they are Untouched, so that no one with real activity disappears. [Q18 clause 4; Q12 clause 8 as amended by Q18; ADR-IM-018; O87]
     - **Acceptance:**
       - A person the import created is archived only if, since the import, nobody edited them; no gift (including a draft), pledge, recurring gift, note, task, file, relationship, consent or restriction event was added; they were not merged on either side; nothing was sent to them; they got no portal account; they were not assigned to a missionary or staff member; and no other import updated them.
       - A person merged since the import stays as they are even if later unmerged.
       - Viewing, searching or exporting the person does not stop them from being archived.
       - A created person who fails any part of the check stays as they are, with the reason.

340. As a staff member, I want an archived person kept rather than deleted, so that their history and any restriction stay on record. [Q18 clause 4; ADR-IM-018; O88]
     - **Acceptance:**
       - An archived person is left out of sends, lists, segments, default search and counts, and still shows as archived in history and reports.
       - An import reversal never deletes a person, gift, note, file or history entry.
       - A restriction the import recorded on a person who is then archived stays with the archived record.

341. As a ministry member with the reversal permission, I want wrong values on people the import created corrected by importing a corrected file, so that those people are fixed in one go and matched again by source ID. [Q18 clause 4; ADR-IM-018]
     - **Acceptance:**
       - The import reversal page offers no way to blank individual values on people the import created.
       - Importing a corrected file matches those same people by source ID and updates them under the usual write modes.

342. As a donor who opted out, I want an import reversal never to remove my restrictions or opt-outs, so that taking back an import never puts me back on a mailing. [Q18 clauses 3 and 4; ADR-IM-018]
     - **Acceptance:**
       - After an import reversal, every restriction, opt-out and piece of suppression evidence remains, including any the import itself recorded.
       - No import reversal records or lifts a block.

## Confirming an import reversal (Q18)

343. As a ministry member with the reversal permission, I want the prepared page itself to be the confirmation, so that taking back an import needs no extra ritual. [Q18 clause 5; ADR-IM-018; O102]
     - **Acceptance:**
       - Confirming takes one press of the final button on the prepared page, with no typed phrase and no second person.
       - Only a ministry member holding the reversal permission can confirm, and the permission is checked again at confirm.
       - No Asym operator identity can prepare or confirm an import reversal.

344. As a ministry member with the reversal permission, I want the final button to name the result in plain, non-money words, so that I know exactly what will happen. [Q18 clauses 5 and 11; ADR-IM-018]
     - **Acceptance:**
       - The final button names the result with counts, for example "Restore 1,204 values and archive 37 people".
       - The final button never says "reverse", "undo", "void" or "refund".

345. As a ministry member with the reversal permission, I want a prepared page to expire, so that I never confirm counts that have gone stale. [Q18 clauses 5 and 6; ADR-IM-018]
     - **Acceptance:**
       - A prepared page is valid for 24 hours or until the Import reversal window closes, whichever comes first, and shows when it expires.
       - Confirming an expired page is refused, and while the Import reversal window is open and no import reversal of that import has been confirmed, the person is asked to prepare again.
       - An expired page is never revived; while the window is open and no import reversal of that import has been confirmed, preparing again builds a new prepared page.
       - A page prepared on day 29 of the window cannot be confirmed on day 31.

## Running an import reversal (Q18)

346. As a ministry member with the reversal permission, I want an import reversal to run in the background with progress and a notice when it finishes, so that I don't have to watch it. [Q18 clause 6; ADR-IM-018; O96]
     - **Acceptance:**
       - After confirming, the import reversal runs in the background and the person can leave the page.
       - Progress is announced politely to screen readers, and the person is notified when it finishes.
       - Finishing shows a lasting banner with the outcome counts, never only a pop-up that disappears on its own.

347. As a ministry member with the reversal permission, I want to stop an import reversal after its current batch, so that I can halt it without leaving items half-changed. [Q18 clause 6; ADR-IM-018]
     - **Acceptance:**
       - "Stop" stops the import reversal after the current batch and says that items already reversed stay reversed.
       - A stopped import reversal can be resumed for its remaining items.

348. As a ministry member with the reversal permission, I want only one People import or import reversal running in my ministry at a time, so that they never work on the same people at once. [Q18 clause 6; ADR-IM-018]
     - **Acceptance:**
       - While a People import or import reversal runs for a ministry, a second one for that ministry waits and says what it is waiting for.
       - The waiting one starts only after the running one ends.

349. As a ministry member with the reversal permission, I want each import reversed at most once and each item changed at most once, so that retries and resumes never double-apply. [Q18 clause 6; ADR-IM-018]
     - **Acceptance:**
       - Once an import reversal of an import has been confirmed, no second import reversal of that import can be prepared or confirmed, even if the first stopped or failed.
       - A stopped or failed import reversal resumes only its remaining items.
       - Retries, resumes and double-clicks never change an item twice and never create a second import reversal.
       - The finished counts come from what actually happened, not from the prepared page.

350. As a staff member with Data Tools Manage, I want importing a file again after its import reversal to ask me before restoring archived people, so that nobody is restored or duplicated silently. [Q18 clause 6; Q12 clause 8 as amended by Q18; ADR-IM-018]
     - **Acceptance:**
       - No action offers to redo an import reversal, and importing the file again applies it afresh.
       - People archived by the earlier import reversal who match by source ID appear in the new import's plan as one grouped decision.
       - Those people are never unarchived without that decision and never created again as duplicates.

## The import reversal window (Q18, Q15)

351. As a ministry member with the reversal permission, I want a 30-day Import reversal window, so that wrong imports can be taken back while their prior values are kept only briefly. [Q18 clause 7; Q15 clause 11 as amended by Q18; ADR-IM-018]
     - **Acceptance:**
       - The window closes 30 days after commit for an everyday import and 30 days after go-live for a Switch run.
       - After the window closes, "Prepare reversal" is no longer offered and any confirm is refused.
       - No reminder email is sent before the window closes.

352. As a staff member following an import, I want the import reversal deadline shown as an absolute date and time in my ministry's time zone, so that nobody misreads it. [Q18 clause 7; Q19 clauses 3 and 6; ADR-IM-018]
     - **Acceptance:**
       - The Import page shows the deadline as, for example, "You can reverse this import until 3 December 2026, 5:00 PM Eastern Time", with "in 30 days" as a hint.
       - The deadline names the ministry's time zone and stays correct across a daylight-saving change.
       - The same deadline appears in the Imports list for that import.

353. As a ministry member with the reversal permission, I want an import reversal confirmed before the deadline to finish even if the deadline passes while it runs, so that a timely decision is never cut short. [Q18 clause 7; ADR-IM-018]
     - **Acceptance:**
       - An import reversal confirmed before the deadline completes after the deadline passes.
       - Reversal prior values are deleted when the window ends, and not before any import reversal confirmed in time has finished.

354. As a ministry privacy role, I want a legal hold to keep reversal prior values without extending the window, so that evidence is preserved without keeping a bulk change open. [Q18 clause 7; Q15 clause 9; ADR-IM-018]
     - **Acceptance:**
       - Under a legal hold, reversal prior values are kept past the window's end.
       - Under a legal hold, preparing or confirming an import reversal after the window is still refused.

355. As a ministry privacy role, I want erasing a person to remove their reversal prior values and keep any import reversal away from them, so that erasure is complete. [Q18 clause 7; Q15 clause 8; ADR-IM-018; O92]
     - **Acceptance:**
       - Erasing a person removes their reversal prior values and their plan-edit cell values. Row, column, who and when remain.
       - An import reversal skips an erased person, listing them as "Erased since", and writes nothing to them.

## Effects, history and evidence (Q18)

356. As a donor, I want an import reversal to fire no messages or automations, so that correcting an import never reaches me. [Q18 clause 8; ADR-IM-018; O89]
     - **Acceptance:**
       - With live automations on the affected fields, lists and tags, an import reversal fires no automation, field-change trigger, send, welcome or goodbye.
       - The only donor-visible effects come from Phase 15 reversing a posted gift batch, under Phase 15's rules.

357. As a staff member viewing a record, I want each change an import reversal made shown as a new attributed entry, so that the record's history stays honest. [Q18 clause 9; ADR-IM-018; O87]
     - **Acceptance:**
       - Each change an import reversal makes appears as a new history entry naming the import and the confirmer, for example "Restored by reversal of import 12, confirmed by J. Smith".
       - The import's own history entries remain after the import reversal.

358. As a ministry Data Tools Admin, I want an import reversal record that shows who did what without row content, so that we have evidence without another copy of personal data. [Q18 clause 9; ADR-IM-018]
     - **Acceptance:**
       - The import reversal record keeps who prepared it, who confirmed it, when, the counts and each item's outcome code.
       - The import reversal record contains no row content.

## A wrong file (Q18)

359. As a ministry privacy role, I want a file that should never have been in Asym taken out of use at once and then erased, so that a wrong file is handled as the privacy matter it is. [Q18 clause 10; ADR-IM-018; O67; O92]
     - **Acceptance:**
       - An import of another organisation's data, the wrong people or sensitive columns can be reversed at once within its window, taking its results out of use.
       - The privacy role can then erase those people through the erasure path, which also removes them from the held file and removes their reversal prior values.

360. As a ministry privacy role, I want the import and import reversal records to give me what my breach log needs, so that I can report a wrong file without a separate system. [Q18 clause 10; ADR-IM-018]
     - **Acceptance:**
       - The import and import reversal records together give the counts, times and actors of the import, its import reversal and any erasure.
       - Every action an Asym specialist took on the import under Asym help access is attributed to that named specialist in those records.
       - When Asym staff caused a wrong-file import under an operator grant, Asym tells the ministry without undue delay.

## Words for import reversal (Q18)

361. As a staff member, I want import reversal described in words that can't be mistaken for moving money, so that nobody panics or takes the wrong action. [Q18 clause 11; ADR-IM-018]
     - **Acceptance:**
       - The action that opens the page reads "Prepare reversal", and the feature is called "import reversal" wherever it is named, never a bare "reversal".
       - The words "Undo import", "rollback", "revert" and "restore snapshot" appear nowhere in Data Tools or on the import reversal page.
       - Buttons for people results name the result, for example "Restore … values" or "archive … people", and never say "reverse" or "undo".
       - Actions that reverse, void or refund money are carried out only on the money owners' own pages, reached through links to them, and Data Tools and the import reversal page offer no money reversal, void or refund action of their own.

## No record family without its correction path (Q18)

362. As a ministry Data Tools Admin, I want a record family importable only once its correction path works, so that nothing can be imported that can't be corrected. [Q18 clause 12; C23; ADR-IM-018]
     - **Acceptance:**
       - A record family can be switched on for an everyday import or a Switch only when its row in the import reversal routing is published and its link or command works.
       - A family whose correction path does not yet exist cannot be imported by any route.

## Dependencies referenced

- O35 — A connected-account charge Asym did not create is never an Asym-recorded gift and waits for a Legacy Tail Backfill (Phase 13).
- O41 — One scoped restriction-import command, restrict-only, with source evidence (Phases 3 and 6 with Phase 12).
- O44 — Deceased lifecycle status as a fail-closed recipient reason (Phase 9 with Phases 3, 14, 16 and 19).
- O47 — Email matching only when the first name agrees and no shared mailbox, otherwise review; a gate for People imports (Phase 4).
- O50 — Phase 15 accepts a file-origin draft batch of ordinary current gifts with expected count and total, repeat-refusing keys, payer of record and recognised person, and the legacy-tail refusal (Phase 15).
- O51 — Owner write commands with per-field fill empty, replace, ignore and a separately confirmed clear; contact details added, never replaced; tags and lists add only (Phase 9 with Phases 4 and 11).
- O67 — Privacy finder across every tier for subject access and erasure (Phase 3).
- O78 — Field-value-change triggers never fire on import-origin writes (Phase 34 with Phase 11).
- O87 — People reversal command: "not written since" checks, tags as one field, entered-in-error removal, Untouched check, attributed effect-dark writes (Phase 9 with Phases 4 and 11).
- O88 — What "archived" means for a person, including archiving an emptied household (Phase 9).
- O89 — Import reversal writes suppressed like import writes (Phases 34, 11, 6 and 14).
- O90 — Gift file lists every resulting gift batch with discard or batch reverse in Phase 15 (Phase 15 with Phase 13).
- O91 — Phase 23's seven groups mapped onto the three import reversal page groups as reasons (Phase 23).
- O92 — Erasure reaches reversal prior values; erased people are never written by an import reversal (privacy owner with Phase 9).
- O93 — "Import people" on the People list, shown only where it works, and the "Added or changed by import" filter (Phase 9).
- O94 — "Upload a Gift file" in Contributions, gift batches linked back to the Gift file, and the shared editable grid for fixing cells (Phase 15).
- O95 — Phase 4 command for import-filed duplicate candidates carrying the import's identity (Phase 4).
- O96 — Data Tools "Finished" and "Needs attention" notices as Phase 17 staff notifications, needed before the first Switch (Phase 17).
- O97 — Tasks Hub projection for imports needing a person, with held-row items routed only to eligible reviewers (Tasks Hub owner).
- O99 — Resumable upload through the File safety check with determinate progress (Phase 29).
- O102 — Data Tools permission module with View, Manage and Admin levels, Replace, Clear and Reverse flagged sensitive (Phase 12).
- O104 — Held matches to protected people counted as restricted-access attempts without plaintext (Phases 10 and 12).
