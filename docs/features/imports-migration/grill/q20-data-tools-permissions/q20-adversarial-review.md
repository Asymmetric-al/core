# Q20 adversarial review: who can see and do what in Data Tools

**Decision under review:** Option B as asked (`q20-decision-as-asked.md`): a few clear permissions with sensible starting sets.

**Evidence:**

- `research/q20-r1-repo-permissions.md` (every ratified Phase 30 permission clause, Phase 12, 10, 3, 15 and 23 rules, code, open choices)
- `q20-r2-external-permissions.md` (17 products' import permissions, separation of powers, hidden records, downloads, small organisations, helpers)
- `q20-r3-repo-verification.md` (verification, Phase 12 model, floor scope, held-row authority, downloads, Gift files, Switch start, code feasibility, 20 edge cases, 19 discrepancies)
- `q20-r4-external-edge-cases.md` (authority during long jobs, last admin, request access, locked columns, export governance, small-team controls, protected people)

**Labels:**

| Label   | Meaning          |
| ------- | ---------------- |
| **[R]** | Repository fact  |
| **[E]** | External fact    |
| **[I]** | Inference        |
| **[J]** | Product judgment |
| **[A]** | Assumption       |

## 0. Summary

**B is right** [J].

- **The repo has already separated the powers.** Replace, Clear, reversal and Switch decisions are separate in Q5, Q12, Q18 and O52 [R].
- **Phase 12 bans folding distinct powers into one import permission.** The precedent is P12:2219-2226 [R].
- **Outside practice gates money and undo more tightly than people imports.** Planning Center, Virtuous, Salesforce, Pipedrive and Zoho all do this [E].
- **The alternatives fail.** A hands export power and bulk changes to every importer. C stalls a small team.

**But B as worded contradicted Phase 12 in five places and left four real holes** [R r3]:

1. **"Sensitive" meant two things.** "Granted to a named person, never in a template" is Phase 12's `explicit_only` class, and Owner never holds those. That collides with "Owners hold everything". Phase 12's own `sensitive` flag (Admin level only, never View or Manage) is the right fit.
2. **"Only Owners until Phase 12" can't be built.** Owner arrives with Phase 12, and today's "admin" role is true for every staff member.
3. **"Someone with full access" doesn't exist.** No one, Owners included, sees everything in Phase 12. Reviewing a protected match needs clearance.
4. **"Ask {names}" breaks Phase 12's request routing** and could disclose who holds clearance.
5. **An "Importer" starting set would be an 11th seed.** Phase 12 fixes ten.

**The holes:**

- **Narrowing a Switch file had no owner.**
- **A Gift file's funds step was blocked for uncleared finance staff,** because Q11 shows fund names only to cleared members, with no scope limit.
- **Making every download sensitive removed the "download, fix, upload again" path** for ordinary importers.
- **A cleared reviewer's decisions would fail under an uncleared colleague's Confirm.**

Further edges:

- import names that default to file names (personal data in a shared list);
- Gift-file money totals shown to people who can't see money;
- authority lost partway through a long import;
- helpers' grants that can't be limited to one Switch;
- downloads that change row counts and so reveal hidden people.

**Disposition: accept with required amendments** (§2). The corrected decision is in §3. It is simpler than B as asked: one fewer permission (downloads reuse the existing export permission or are part of preparing), no new starting set, and no interim role gate.

## 1. Category review

Tables use this layout: concern (what could go wrong and why it matters); severity and likelihood; evidence; effect on the answer; fix and spec language.

### 1.1 Problem validity, necessity and alternatives: material concern, yes (changes)

**The need is real** [R]:

- Q19 created an area with no permissions.
- O52, Q5 and Q18 name separate powers without a model.
- Today every staff member is a full admin (`permissions.ts:37-51`).

**Strongest alternative:** C, Owners only. It fails a ministry where the data-entry person isn't an Owner, and Owner membership itself needs just-in-time activation (P12:1594).

| Concern                                                                                                       | Severity · likelihood | Evidence                                        | Effect  | Fix / spec language                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Download as its own permission duplicates the existing export permission** and blocks the everyday fix path | High · high           | ADR-0212; P12:1498; DL:1131; OC:359-360 (r3 §5) | Changes | Remove it as a Data Tools permission. **Your own file's rows** (problem, left-out and held rows) download with Prepare. **Downloads that carry Asym data** (results lists, Switch Waiting rows) need the ministry's existing export permission. |
| **The Importer set is a new seed**                                                                            | Medium · certain      | P12:1595 "the full 10"                          | Changes | Add a Data Tools module to Phase 12's map (View, Manage, Admin). The Owner seed holds Admin. Ministries add Data Tools to any group in one step (Phase 12's precedent for Reports).                                                             |
| **Too vague:** "Run the Switch" vs Q5's per-decision wording                                                  | Medium · high         | DL:197 vs :198 (r3 R3-D12)                      | Changes | "Run the Switch is the Switch decision capability for every Switch decision Q5 lists. Money commits also need the money owner's permission (C16), and history correction keeps its own (Q13)."                                                  |
| **Narrowing has no owner**                                                                                    | High · certain        | ADR-IM-005:21                                   | Changes | "Narrowing a Switch file needs Run the Switch and clearance."                                                                                                                                                                                   |

### 1.2 Brittleness: material concern, yes

| Concern                                                                                            | Severity · likelihood | Evidence                                  | Effect  | Fix                                                                                                                                                                                                                                                                                          |
| -------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Interim role gate.** "Only Owners until Phase 12" falls back to role names, which admit everyone | Blocker · certain     | `permissions.ts:64-71`; DL:1209; P12:1545 | Changes | "Data Tools stays switched off until Phase 12 can grant its permissions. No interim role gate."                                                                                                                                                                                              |
| **Authority changes mid-import:** leaving, removal, a just-in-time grant expiring                  | High · medium         | P12:1468, :1556, :1647; ASVS 8.3.2 [E]    | Changes | Each batch re-checks the confirmer's permission and clearance. On loss the import stops after the current batch as **Needs attention** with the reason "Stopped: {name} no longer has permission". Anyone holding the needed permissions can resume the remaining rows under their own name. |
| **Just-in-time grants end mid-run**                                                                | Medium · medium       | P12:1483, :1506                           | Changes | Confirm shows "Your access to {permission} ends at {time}. If it ends first, the import stops and someone with access can resume it." There are no time estimates (Q19).                                                                                                                     |
| **Fund names hidden from uncleared finance staff**                                                 | High · high           | DL:552 unconditional (r3 R3-D5)           | Changes | Amend Q11 cl.4: the fund-name rule applies to Switch real exports. Gift files show the file's own labels and the Asym designations the person can see (Phase 10 aliases apply).                                                                                                              |

### 1.3 Technical debt: material concern, yes

| Concern                                                                          | Severity · likelihood | Evidence                        | Effect  | Fix                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------------- | --------------------- | ------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A Data Tools download permission beside the export policy                        | Medium · high         | ADR-0212                        | Changes | Reuse the export policy (above).                                                                                                                                                                                                 |
| Keys in three formats: dotted (code), colon (money), bare (`security_clearance`) | Medium · certain      | `registry.ts:17-18` (r3 R3-D14) | Changes | Data Tools keys are dotted (for example `imports.view`). Phase 12 reconciles money and clearance key formats (D86).                                                                                                              |
| Alerts invented for three permissions not on Phase 12's closed list              | Low · certain         | P12:1498 (R3-D9)                | Changes | No new alert classes. Replace, Clear, Reverse and Run the Switch are Phase 12 `sensitive` (Admin rung), granted through Phase 12's sensitive-grant flow, and audited. Only export downloads alert, as export power already does. |
| A second "who can grant" lookup                                                  | Medium · medium       | P12:668-674, :1670              | Changes | Use Phase 12's access-request routing (O103).                                                                                                                                                                                    |

### 1.4 Edge cases: material concern, yes

E1–E30 are in §5. The cases that changed the answer:

- authority lost mid-import;
- a cleared reviewer with an uncleared confirmer;
- a ministry with no cleared preparer;
- a protected match during an everyday import;
- personal data in import names;
- Gift totals shown to people without money access;
- Asym help and helpers;
- downloads changing row counts.

### 1.5 Footguns: material concern, yes

| Concern                                                                          | Severity · likelihood | Evidence                                     | Effect    | Fix                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------- | --------------------- | -------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Naming clearance holders on a no-access page**                                 | High · medium         | P12:597-599, :668-674; P24-D38R:468          | Changes   | "You don't have access to Data Tools." plus a **Request access** button that goes to Phase 12's Access requests. No names. The same page shows for every Data Tools address, whether or not the import exists.  |
| **Hidden match → new person**, a duplicate under a protected worker's legal name | High · medium         | Salesforce and Rock behaviour [E r2]; P10:97 | Changes   | Held for review; never created, never shown.                                                                                                                                                                    |
| **Mapping a field you can't edit**                                               | Medium · medium       | P12:1619; P11:159; OC:366-372                | Changes   | The Columns step offers only fields the person may edit. If someone else confirms, Review lists "Won't be written: you can't edit {field}" and those columns are left out on Confirm. The write path re-checks. |
| **Coaching on a shared screen reveals values**                                   | Medium · medium       | Q5 cl.2 "uses the uncleared view" (r3 E17)   | Changes   | A **Hide values** switch on Data Tools pages for the current session. It can only remove information, never reveal more.                                                                                        |
| **Gift file confirmed without the money permission**                             | High · low            | P15:791-794                                  | No change | Confirm needs `finance:record_contribution`; preparing doesn't.                                                                                                                                                 |

### 1.6 Tenant safety: material concern, yes

| Concern                                              | Severity · likelihood | Evidence                  | Effect    | Fix                                                                                                                                                                                |
| ---------------------------------------------------- | --------------------- | ------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Asym help sees everyday imports and import names** | High · medium         | DL:216-220; r3 E9         | Changes   | "Asym help access sees only the Switch tab and its preparation actions: never the Imports list of everyday imports, import names, values before narrowing, or downloads."          |
| **Helper grants outlive the Switch**                 | Medium · medium       | P12:1670; DL:207 (R3-D17) | Changes   | Helper grants are ordinary Data Tools grants with an end date, by default the day the Switch closes (O105). They cover Data Tools, not only that Switch. The ministry chooses who. |
| **Foreign import IDs**                               | High · low            | P12:1650                  | No change | Data Tools holders see "not found". Non-holders see the no-access page for every path.                                                                                             |
| **Cache leaks of permissions**                       | High · low            | P12:1586                  | No change | Phase 12's epoch, with a cache capped at grant expiry.                                                                                                                             |

### 1.7 Database, RLS and authorization safety: material concern, yes

| Concern                                                             | Severity · likelihood | Evidence                | Effect    | Fix                                                                                                                                                  |
| ------------------------------------------------------------------- | --------------------- | ----------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **The client chooses the actor or tenant**                          | High · low            | Repo rule               | No change | Tenant, actor, confirmer and reviewer come from server context. Every page, action and projection checks through the single Phase 12 decision point. |
| **A reviewer's decisions committed under someone else's authority** | High · medium         | P12:1619; C16 (r3 §4.4) | Changes   | "Held rows are committed by the reviewer, under the reviewer's permissions, as part of the same import record."                                      |
| **Raw values reachable from the browser**                           | High · medium         | Phase 3:614-616         | No change | No client grants on import tables (Q19).                                                                                                             |
| **Prepare without Run lets a preparer confirm**                     | Medium · low          | O52                     | Changes   | Two separate checks: `imports.prepare` and `imports.run`, both on the Manage rung. Helpers can be given Prepare only.                                |

### 1.8 Overengineering: material concern, yes (resolved)

| Refused                                        | Why                                                                                |
| ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| A Data Tools download permission               | The export policy exists                                                           |
| An Importer seed                               | Phase 12 adds modules to groups                                                    |
| New alert classes                              | Phase 12's sensitive-grant flow and audit suffice                                  |
| A second approver for sensitive actions        | Q5: no forced second person; Phase 12 handles the single-admin case                |
| Re-authentication for reversal or Replace      | Q18: the page is the confirmation; Phase 12's just-in-time access covers elevation |
| An export approval queue                       | Disproportionate for small ministries [E r4]                                       |
| A per-field permission grid in Data Tools      | Phase 11 and 12 own field access                                                   |
| Ownership-transfer wizards for drafts          | Any preparer can continue a draft                                                  |
| Real-time revocation streams                   | Per-batch re-checks suffice                                                        |
| A Data Tools "who has access" screen           | Phase 12's My Access and its access views                                          |
| A separate Phase 30 review queue for held rows | The import page plus a Tasks Hub item (O97)                                        |

### 1.9 UX/UI and user friction: material concern, yes

| Concern                                                                              | Severity · likelihood | Evidence          | Effect  | Fix                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------ | --------------------- | ----------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Too many permissions for small ministries.** Nonprofit products ship 2–4 roles [E] | Medium · medium       | r4 §7             | Changes | Ministries see one **Data Tools** row with three levels: **View** (follow imports), **Manage** (prepare and run), **Admin** (adds Replace and Clear, reversal, and the Switch). The individual permissions exist for Phase 12's advanced grants. |
| **Dead ends for people who can follow but not act**                                  | Medium · high         | Phase 12 story 19 | Changes | View holders see the list, status, counts and who, with one line on the page: "You can follow this import. Preparing and confirming need Data Tools Manage access." plus **Request access**. Actions they can't take are absent.                 |
| **Held rows look like failures**                                                     | Medium · medium       | Q19 vocabulary    | Changes | "Held for review" sits in the counts with a plain line: "Someone who can see the matching records will review these rows. Nothing has changed for them."                                                                                         |
| **Stuck held rows**                                                                  | Medium · high         | r3 §4.2           | Changes | Data Tools Admins see a setup notice when nobody with Manage access has clearance. Held rows expire with the import file, 30 days after commit (Q15), as "Left out: not reviewed in time". The deadline is shown.                                |
| **File names in a shared list**                                                      | Medium · high         | r3 E11            | Changes | The default import name is the kind plus date and time ("People import, 4 Nov 2026, 10:42"). The file name shows on the import page to Manage holders (amends Q19 cl.3).                                                                         |
| **Gift totals shown without money access**                                           | Medium · medium       | P13:1952          | Changes | Amounts show only to people who can see contributions. Others see counts.                                                                                                                                                                        |

### 1.10 Source of truth, ownership and domain invariants: material concern, yes

**Owners:**

| Fact                                                 | Owner                                                                                |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Who holds what                                       | Phase 12 (grants, groups, seeds, sensitive flags, access requests, last-admin guard) |
| Clearance and protected people                       | Phase 10                                                                             |
| Money rights                                         | Phases 13 and 15                                                                     |
| Field edit rights                                    | Phase 11 with Phase 12                                                               |
| The atoms, the narrowing record and held-row records | Phase 30 (minted under Phase 12's rules)                                             |

**Invariants:**

| #   | Invariant                                                                                                                                                             |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | No Data Tools action without the matching Phase 12 permission at that moment.                                                                                         |
| P2  | No Asym-side fact about a record (match, identity, current values, outcome detail) is shown, downloaded or counted differently for someone who can't see that record. |
| P3  | Counts are whole-file and the same for every viewer.                                                                                                                  |
| P4  | No write under anyone's authority but the person who confirmed or reviewed it.                                                                                        |
| P5  | No interim permission path outside Phase 12.                                                                                                                          |
| P6  | No Asym identity holds a Data Tools permission (Q5). Asym help works only through its operator allow-list.                                                            |

### 1.11 Hidden coupling: material concern, yes

| Dependency                                                                                | Requirement                                     |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Phase 12 module, atoms, rungs, Owner seed                                                 | O102 (gates release)                            |
| Phase 12 access requests for module access                                                | O103                                            |
| Phase 10 and 12 counting held protected matches in the restricted-access audit and budget | O104                                            |
| Phase 12 grant end date for helpers                                                       | O105                                            |
| Phase 13/15 money keys                                                                    | Consumed as is; key-format reconciliation (D86) |
| O97 Tasks Hub item for held rows, routed to eligible reviewers                            | Existing O97, extended                          |

### 1.12 Failure modes: material concern, yes

| Failure                                   | Behaviour                                                                                |
| ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| Authority lost mid-import                 | Stops after the batch; Needs attention, with the reason; resumable by an eligible person |
| No eligible reviewer                      | Rows stay held; Admin setup notice; expire at the file's deletion date                   |
| Request-access routing finds no recipient | Phase 12's Access requests lane (P12:668-674)                                            |
| Permission service unavailable            | Fails closed: pages show the no-access page and jobs pause                               |

### 1.13 Lifecycle, temporal correctness, concurrency and idempotency: material concern, yes

| Item                                                    | Rule                                                                                                                 |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Held row states                                         | Held → Reviewed (committed by the reviewer or left out) → or Expired (left out, not reviewed in time). Forward-only. |
| Review writes                                           | Idempotent per row and plan revision.                                                                                |
| Two reviewers at once                                   | Plan revision check (Q19).                                                                                           |
| Revocation between Confirm and start (Waiting to start) | Re-checked at start (Q19); refused with the reason.                                                                  |
| Expiry                                                  | Measured in UTC and shown in the ministry's time zone.                                                               |

### 1.14 Data integrity risks: material concern, yes

| Risk                                             | Fix                                 |
| ------------------------------------------------ | ----------------------------------- |
| Duplicates under a protected worker's legal name | Held, never created                 |
| Partial writes on lost authority                 | Resumable; reversal still available |
| Columns silently dropped                         | Listed as "Won't be written"        |
| Count drift between viewers                      | P3                                  |

### 1.15 Security and privacy risks: material concern, yes

| Concern                                                                               | Severity · likelihood | Evidence                  | Effect  | Fix                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------- | --------------------- | ------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Probing by import.** An insider uploads names to test whether people are protected. | High · low            | Residual oracle (r3 §4.3) | Changes | Held matches to protected people count as restricted-access attempts in Phase 12's audit and budget (O104), so repeated probing alerts security holders. **Accepted residual:** someone who already knows a name, and knows that person isn't staff or deceased, can infer from a held row that the record is protected or outside their access. Accepted because the alternative (a duplicate under the legal name) is worse, and Q12 already requires review. |
| **Downloads of Asym data**                                                            | High · medium         | ADR-0212; P12:1531, :1663 | Changes | Export permission; exportable fields only; identifiers-only audit; `csvSafeCell` and text-typed output; streamed on demand, never stored; protected people never included (rows held or worked in Asym only).                                                                                                                                                                                                                                                   |
| **Own-file downloads**                                                                | Low · medium          | DL:1131                   | Changes | Only the file's own cells and reasons, never Asym-side values. Held rows are included with the same reason, so counts never change.                                                                                                                                                                                                                                                                                                                             |
| **Import names**                                                                      | Medium · high         | r3 E11                    | Changes | Default to kind plus date.                                                                                                                                                                                                                                                                                                                                                                                                                                      |

### 1.16 Scalability and performance: material concern, yes (requirement)

| Item                        | Rule                                                                                                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Per-batch permission checks | Cached under Phase 12's epoch. One check per batch is negligible [I].                                                                                      |
| Downloads                   | Streamed within the request, up to 1,000,000 rows (XLSX sheet limit 1,048,576). Larger sets must be filtered first, with no stored file (amends Q15 cl.4). |
| Held-row review             | Paged on the server.                                                                                                                                       |

### 1.17 Operational burden: material concern, yes (contained)

- **No Asym-run access recovery.** If a ministry loses its only Owner, Phase 12's break-glass applies (P12:1671), and it excludes protected plaintext.
- **Unverified:** whether break-glass is run by Asym, which would be a Q5 tension (r4 §2). This is recorded as D87 for Phase 12.
- **No manual cleanup.** Held rows expire on their own.

### 1.18 Observability and auditability gaps: material concern, yes

| Need              | Requirement                                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Audit             | Every grant, use of a sensitive permission, download, review and resume is attributed in Phase 12's audit and the import record. |
| Monitors          | M-Q20-1 to M-Q20-6.                                                                                                              |
| Explaining access | Phase 12's My Access explains why someone can or can't act. Data Tools adds no second explainer.                                 |

### 1.19 Dependency and integration risks: material concern, yes (contained)

- **No external dependencies.**
- **Hard internal dependency:** Phase 12 (O102), which gates release. #2281 and #2284 are not used as an interim: #2281's defaults contradict Q5, and its platform approval of tenant grants conflicts with Q5's "Asym never grants".

### 1.20 Migration, rollout and upgrade risks: material concern, yes

| Item                       | Rule                                                                                                                                                        |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default for existing users | Deny: no one but Owners holds Data Tools on rollout. Planning Center and Shopify switched new permissions on for existing users; that is rejected here [E]. |
| Release order              | O102 → O103 → O104. Then Data Tools can be switched on per kind (Q19).                                                                                      |
| Rollback                   | Removing grants is immediate and safe. Imports keep their records.                                                                                          |

### 1.21 Testability, traceability and proof: material concern, yes

AC1–AC24 are in §6.

**Traceability:**

- **Glossary:** Data Tools access levels, Held for review, Narrowing, Hide values.
- **ADR:** ADR-IM-020.
- **Amendments:**
  - Q5 (Run the Switch = the Switch decision capability; narrowing; helpers' end date);
  - Q11 cl.4 (fund names scoped to Switch exports);
  - Q12 cl.4 ("always go to review" → Held for review);
  - Q15 cl.4 (download size);
  - Q19 cl.3 (default import name).

### 1.22 Other development hazards: material concern, yes

| Hazard                                                      | Fix                                                |
| ----------------------------------------------------------- | -------------------------------------------------- |
| Phase 10 sets clearance per role; Phase 12 per person       | D85; Phase 12 wins (per person)                    |
| Q6 copies mirror role and clearance but not Phase 12 grants | D88; fails closed; Data Tools isn't used in copies |
| Q16 "sample values" against the floor                       | D88; samples follow the floor                      |
| Phase 15 "manage batches" key never minted                  | D86                                                |

## 2. Disposition

**Accept with required amendments.**

B's shape stands: a few clear permissions, the sensitive ones separate, and starting sets that keep it simple. The amendments align it with Phase 12:

- Phase 12's `sensitive` flag, with Owner holding the Data Tools Admin level;
- no new seed;
- no interim gate;
- no names on the no-access page;
- downloads reuse the export policy;
- held rows reviewed and committed by someone who can see the record;
- fund names scoped to Switch exports;
- neutral import names;
- money totals gated;
- per-batch authority checks;
- explicit rules for helpers and Asym help.

## 3. Corrected decision (to record)

**Q20: Data Tools permissions. Option B, amended.** (★ = changed or added.)

1. ★ **One Data Tools row with three levels.** Phase 12 adds a Data Tools module.
   - **What ministries see:**

     | Level      | Lets you                                                                                              |
     | ---------- | ----------------------------------------------------------------------------------------------------- |
     | **View**   | Follow imports: the menu, the Imports list, statuses, counts and who. No values.                      |
     | **Manage** | Prepare (upload, columns, values, decisions, fix cells, download your file's rows) and Run (confirm). |
     | **Admin**  | Everything above, plus **Replace and Clear**, **Reverse imports** and **Run the Switch**.             |

   - **The Admin-level permissions** are Phase 12 `sensitive`: never on the View or Manage level, granted through Phase 12's sensitive-grant flow, and audited.
   - **The individual permissions** stay grantable on their own for advanced cases, for example Prepare without Run for a helper.
   - **Keys** are dotted and minted by Phase 30 under Phase 12's rules.
2. ★ **Starting sets.**
   - The Owner group holds Data Tools Admin. No other seed holds Data Tools.
   - A ministry adds Data Tools View or Manage to any group, or to a person, in one step.
   - When it launches, existing users get nothing new.
   - **Clearance** is never part of any Data Tools level (Phase 12).
3. ★ **Run the Switch** is Q5's Switch decision capability.
   - **It covers:**
     - starting a Switch;
     - census answers, dispositions and attestations;
     - plan and match decisions;
     - reconciliation controls and sign-off;
     - commit, tail closure and decommission;
     - reassigning the lead;
     - Practice copies and legal hold.
   - **Also needed:** money commits need the money owner's permission (C16), history correction keeps its own (Q13), and creating fields needs Phase 11's.
   - **Narrowing** a Switch file needs Run the Switch **and** clearance.
   - **The Start action** appears only once Asym's preconditions are met (Q2, Q6; Q19 kind switch).
4. ★ **Money.**
   - **Gift files:** Manage is enough to prepare one. Confirm also needs Gift entry's `finance:record_contribution`.
   - **Amounts** in the Imports list and on pages show only to people who can see contributions; others see counts.
   - **Funds step:** shows the file's own labels and the designations the person can see (Phase 10 aliases apply).
   - **Q11 cl.4's "fund names only to cleared members"** applies to Switch real exports.
5. ★ **What people see of records.**
   - **Asym-side facts:** a match, which record, current values and the outcome detail for a row are shown only to people who can see that record.
   - **File cells:** your file's own cells are shown to Manage holders.
   - **Counts:** whole-file and the same for everyone.
   - **Restricted-file floor:** the Switch real-export floor (Q2, Q5) is unchanged. Everyday imports are not restricted until narrowed, because they are the ministry's own files.
6. ★ **Held for review.**
   - **Which rows:** any row matching a record the preparer can't see, a staff member, or someone marked deceased (Q12 cl.4).
   - **The wording**, the same for every reason: "Held for review: someone who can see the matching records will review these rows. Nothing has changed for them."
   - **What never happens:** a held row is never created as a new person, never shows the match, and never changes the counts. The rest of the import goes ahead.
   - **Who reviews:** after commit, any Manage holder who can see the matched record, including the preparer if they can. The reviewer commits those rows under their own permissions, on the same import record. A Tasks Hub item reaches eligible reviewers without naming anyone (O97).
   - **Deadline:** held rows not reviewed by the file's deletion date (30 days after commit, Q15) become "Left out: not reviewed in time". The date is shown.
   - **Setup notice:** Data Tools Admins see one when nobody with Manage has clearance.
   - **Accepted residual:** someone who knows a held row's person isn't staff or deceased can infer they are protected or outside their access. Held protected matches count in Phase 12's restricted-access audit and budget (O104).
7. ★ **Fields you can't edit.**
   - The Columns step offers only fields the person may edit.
   - If someone else confirms, Review lists "Won't be written: you can't edit {field}", and those columns are left out.
   - The write path re-checks.
8. ★ **Downloads.**
   - **Your file's rows** (problem, left-out and held rows) need Manage. They contain the file's own cells and reasons only, never Asym-side values. Held rows are included with the same reason.
   - **Downloads with Asym data** (results lists, Switch Waiting rows) need the ministry's existing export permission plus on-screen visibility. Protected people are never included.
   - **Every download:**
     - is streamed on demand and never stored;
     - is text-typed and formula-safe, with one encoder (ADR-0212);
     - is audited by identifiers only;
     - is limited to 1,000,000 rows; larger sets are filtered first (amends Q15 cl.4).
9. ★ **Seeing each other's work.**
   - **View holders** see every import's status, counts and who started it.
   - **Manage holders** can continue any draft, with every change attributed.
   - **Import names** default to the kind plus date and time ("People import, 4 Nov 2026, 10:42"), not the file name. The file name shows on the import page to Manage holders (amends Q19 cl.3).
10. ★ **People without access.**
    - No menu entry and no shortcuts.
    - Any Data Tools address shows "You don't have access to Data Tools." with **Request access**, which goes to Phase 12's Access requests. It names no one, and the page is the same whether or not the import exists.
    - **View holders** see one line on an import page, "You can follow this import. Preparing and confirming need Data Tools Manage access.", plus Request access. Actions they can't take are absent.
    - **Holders** opening another ministry's import get not found.
11. ★ **Authority while running.**
    - **Per-batch checks:** each batch re-checks the confirmer's permissions and clearance.
    - **On loss:** the import stops after the current batch as Needs attention: "Stopped: {name} no longer has permission".
    - **Resuming:** anyone holding the needed permissions can resume the rest under their own name.
    - **Time-limited access:** if the confirmer's access is time-limited, Confirm shows when it ends.
12. ★ **Helpers and Asym help.**
    - **Helpers (Q5):** ordinary Data Tools grants (usually Manage, or Prepare only) with an end date, by default the day the Switch closes (O105). They cover Data Tools, not only that Switch.
    - **Asym help access:** sees only the Switch tab and its preparation actions. Never the everyday Imports list, import names, values before narrowing, or downloads. No Asym identity holds a Data Tools permission.
13. ★ **Hide values.** A switch on Data Tools pages hides every value for the current session, for coaching on a shared screen (Q5 cl.2). It never reveals more.
14. ★ **No interim access.** Data Tools stays switched off until Phase 12 can grant these permissions (O102). There is no role-name gate, and #2281's platform approval is not used.

## 4. Ruthless synthesis

### Before recording

**Amendments:**

- Q5: Run the Switch, narrowing, helpers' end date.
- Q11 cl.4: fund names.
- Q12 cl.4: "always review" → Held for review.
- Q15 cl.4: download size.
- Q19 cl.3: default name.

**Glossary:**

- Data Tools access (View, Manage, Admin);
- Held for review;
- Narrowing;
- Hide values.

### Spec and design

- **The atoms:** `imports.view`, `imports.prepare`, `imports.run`, `imports.replace_values`, `imports.clear_values`, `imports.reverse`, `imports.switch`. Final names are set at spec.
- **Mapping:** the atoms placed on View, Manage and Admin.
- **Held-row review:** the step and its states.
- **Copy:** the no-access and follow-only text.
- **Downloads:** the two download kinds.
- **Proof:** AC1–AC24.

### Owner requirements, in order

| Order | Requirement                                                  |
| ----- | ------------------------------------------------------------ |
| 1     | **O102** (Phase 12): gates release                           |
| 2     | **O103** (Phase 12): access requests                         |
| 3     | **O104** (Phases 10 and 12): audit of held protected matches |
| 4     | **O105** (Phase 12): grant end date                          |
| 5     | **O97 extended** (Tasks Hub): held-row items                 |

### Implementation safeguards

- One Phase 12 check at every page, action, projection and batch.
- Server-derived actor.
- The reviewer commits held rows.
- Downloads streamed with one encoder.
- Fail closed when the permission service is unavailable.

### Monitors

| ID      | Signal                                                    | Threshold                                 | Owner                                | Response                                              |
| ------- | --------------------------------------------------------- | ----------------------------------------- | ------------------------------------ | ----------------------------------------------------- |
| M-Q20-1 | Held rows still unreviewed 7 days after commit            | > 0 in a ministry for 2 consecutive weeks | Phase 30 product owner               | Check reviewer coverage; nudge the Admin setup notice |
| M-Q20-2 | Ministries using Data Tools with no cleared Manage holder | Any                                       | Phase 30 product owner with Phase 10 | Contact the ministry's access manager through support |
| M-Q20-3 | Held protected matches by one uncleared uploader          | > 3 in 30 days                            | Phase 12 security holder             | Review for probing; Phase 12 alert                    |
| M-Q20-4 | Imports stopped for lost permission                       | > 5% of imports in a quarter              | Phase 30 product owner               | Review just-in-time lengths and grant practice        |
| M-Q20-5 | Data Tools access requests unanswered                     | > 7 days                                  | Phase 12 owner                       | Check routing and coordinators                        |
| M-Q20-6 | Asym-data downloads per person                            | Above the Phase 12 export budget          | Phase 12                             | The existing step-up or deny applies                  |

## 5. Edge cases

| #   | Case                                                                  | Outcome                                                                                   |
| --- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| E1  | A person leaves mid-draft                                             | The draft stays. Any Manage holder continues it. It is discarded after 14 days unchanged. |
| E2  | A person leaves mid-import                                            | It stops at the next batch: Needs attention. An eligible person resumes it.               |
| E3  | The last Owner tries to leave                                         | Phase 12's last-admin guard blocks it.                                                    |
| E4  | The only Owner is gone                                                | Phase 12 break-glass; protected plaintext excluded (D87).                                 |
| E5  | A just-in-time grant expires mid-import                               | Stops; resumable. Confirm showed the end time.                                            |
| E6  | An Owner without clearance                                            | Sees aliases. Can't narrow or review protected holds. Gets the setup notice.              |
| E7  | Someone cleared but without Data Tools access                         | Can't review held rows. The Admin setup notice explains what to grant.                    |
| E8  | A helper with Prepare only                                            | Prepares; cannot confirm; the grant ends at Switch closed.                                |
| E9  | Asym help access                                                      | Switch tab only; allow-list only.                                                         |
| E10 | Practice copies                                                       | Data Tools isn't used there (Q6).                                                         |
| E11 | A file name holding a worker's legal name                             | The list shows the kind plus date; the file name shows only to Manage holders.            |
| E12 | A Gift file seen by a View holder without money access                | Counts only.                                                                              |
| E13 | A Gift file prepared by someone without `finance:record_contribution` | Prepares; Confirm is absent with a reason line; a colleague with the permission confirms. |
| E14 | An uncleared finance person maps funds                                | Sees the file's labels and the designations they may see.                                 |
| E15 | Row matches a protected worker; the uploader is uncleared             | Held, same wording; counted in the restricted-access audit.                               |
| E16 | Row matches a visible staff member                                    | Held. The preparer can review it themselves after commit.                                 |
| E17 | A cleared reviewer, with an uncleared colleague confirming            | The colleague's Confirm writes everything else. The reviewer commits the held rows.       |
| E18 | No eligible reviewer for 30 days                                      | Rows become "Left out: not reviewed in time".                                             |
| E19 | A mapped field the confirmer can't edit                               | Listed "Won't be written" and left out.                                                   |
| E20 | Download of own problem rows                                          | File cells plus reasons; held rows included; no Asym values.                              |
| E21 | Results download by a cleared person with export permission           | Rows they can see; protected people never included.                                       |
| E22 | Results download without export permission                            | Absent; their own file's rows are still available.                                        |
| E23 | A 2-million-row Waiting-row set                                       | Filter by family or reason first; each download is at most 1,000,000 rows.                |
| E24 | A deep link without access                                            | The same no-access page for every Data Tools address.                                     |
| E25 | Another ministry's import, opened by a holder                         | Not found.                                                                                |
| E26 | Coaching on a shared screen                                           | Hide values on.                                                                           |
| E27 | Region-scoped preparer                                                | Out-of-region matches held; reviewed by someone with that scope.                          |
| E28 | Permission service unavailable                                        | Fail closed; jobs pause and resume later.                                                 |
| E29 | A Switch confirm needing money                                        | Run the Switch plus the money owner's permission (C16).                                   |
| E30 | A ministry turns on Data Tools Manage for a big group                 | Allowed; Phase 12 audits the change. Sensitive actions still need Admin.                  |

## 6. Acceptance criteria

**Levels and grants**

- **AC1:** With Phase 12 absent, no Data Tools entry, shortcut or route responds, for any role.
- **AC2:** A person with no Data Tools permission gets the same no-access page for every Data Tools address, existing or not, naming no one, with Request access going to Phase 12.
- **AC3:** View holders see the list, statuses, counts and who, but no values or actions, with the follow-only line.
- **AC4:** Manage holders can prepare and confirm People imports with Fill empty only, but not Replace, Clear, reverse or Switch actions.
- **AC5:** A Prepare-only grant can prepare but has no Confirm.
- **AC6:** Admin-level permissions can't be placed on View or Manage (build-time check). The Owner seed holds Data Tools Admin, and no other seed holds Data Tools.

**Money and the Switch**

- **AC7:** A Gift file's Confirm requires `finance:record_contribution`. Amounts are hidden from people without contribution access.
- **AC8:** An uncleared finance member can complete a Gift file's funds step.
- **AC9:** Narrowing requires Run the Switch plus clearance. Starting a Switch requires Run the Switch and Asym's preconditions.

**Held rows and visibility**

- **AC10:** A row matching a record the preparer can't see is held with the uniform wording. No person is created, the match isn't shown, and counts equal those of a viewer who can see it.
- **AC11:** An eligible reviewer commits held rows under their own permissions on the same import, attributed. An uncleared confirmer's Confirm never writes them.
- **AC12:** Held rows unreviewed at the file's deletion date become "Left out: not reviewed in time".
- **AC13:** Held protected matches create restricted-access audit entries without plaintext.
- **AC14:** The Columns step offers only fields the person may edit. Non-editable mapped fields are listed and left out at Confirm.

**Downloads**

- **AC15:** Own-file downloads contain only file cells and reasons. Held rows are included, and the row count equals the on-screen count.
- **AC16:** Asym-data downloads require export permission, contain only exportable fields the person can see, never include protected people, stream without storing, use `csvSafeCell` or text cells, and write an identifiers-only audit row.
- **AC17:** A download over 1,000,000 rows is refused with a prompt to filter.

**Running, helpers and display**

- **AC18:** Removing a permission mid-import stops it after the current batch with the reason. An eligible person resumes the rest under their own name.
- **AC19:** Confirm shows the end time of time-limited access.
- **AC20:** A helper grant ends on its end date. Asym help access never sees the everyday Imports list, import names or downloads.
- **AC21:** Default import names are the kind plus date and time. The file name is visible only to Manage holders.
- **AC22:** Hide values hides every value on Data Tools pages for the session and cannot reveal more.
- **AC23:** Data Tools Admins see the setup notice when no Manage holder has clearance.
- **AC24:** Every Data Tools page, action, projection and batch checks through the single Phase 12 decision point. Tests cover tenant mismatch, revocation and an expired just-in-time grant.

## 7. Owner requirements and discrepancies

**Owner requirements (proposed O102–O105, plus O97 extended):**

| #              | Requirement                                                                                                                                                                                                                                                                                                                             | Owner                      |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| O102           | A Data Tools `PermissionModule` with View, Manage and Admin levels; Phase 30's dotted atoms placed on them, with Replace, Clear, Reverse and Run the Switch flagged `sensitive` (Admin only); the Owner seed holds Data Tools Admin and no other seed holds Data Tools; existing users get nothing on launch. Gates Data Tools release. | Phase 12                   |
| O103           | A typed access-request kind for module access ("Request access to Data Tools"), routed by Phase 12's rules, never naming holders.                                                                                                                                                                                                       | Phase 12                   |
| O104           | Held matches to protected people count as restricted-access attempts in `sensitive_read_audit` and the restricted-read budget, without plaintext.                                                                                                                                                                                       | Phases 10 and 12           |
| O105           | Grant end dates usable for helpers (default: the day the Switch closes), ended by Phase 30 when the Switch closes.                                                                                                                                                                                                                      | Phase 12                   |
| O97 (extended) | The Tasks Hub item for held rows is routed only to people eligible to review them, never naming the record.                                                                                                                                                                                                                             | Tasks Hub owner (ADR-0183) |

**Discrepancies (proposed D83–D88):**

| #   | Discrepancy                                                                                                                                                                                                                                                                                   | Resolution                                                                                       |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| D83 | Q20 as asked used "sensitive" in Phase 12's `explicit_only` sense, which Owner never holds, while saying Owners hold everything. It also planned an Importer seed (Phase 12 fixes ten) and alerts outside Phase 12's closed list.                                                             | Q20 cl.1–2 use Phase 12's `sensitive` flag at the Admin level, no new seed, no new alerts (O102) |
| D84 | "Only Owners until Phase 12" and "someone with full access" have no Phase 12 meaning; today's "admin" role covers every staff member (`permissions.ts:64-71`).                                                                                                                                | Q20 cl.6, cl.14                                                                                  |
| D85 | Phase 10 sets clearance per role (P10:101); Phase 12 sets it per person (P12:1495).                                                                                                                                                                                                           | Phase 12 wins; Phase 10 to align                                                                 |
| D86 | Key formats: code accepts only dotted keys (`registry.ts:17-18`); money keys are colon-form (`finance:*`); `security_clearance` has no dot; Phase 15's "manage batches" key is never minted (P15:376); Phase 12 uses both `permissions.manage` and `permissions.manage_grants`/`_membership`. | Phase 12 reconciles; Data Tools keys are dotted                                                  |
| D87 | Phase 12's break-glass recovery for a lost sole admin (P12:1671) doesn't say who runs it. If Asym runs it, that is in tension with Q5's "no Asym identity decides".                                                                                                                           | Phase 12 to state it; Data Tools adds nothing                                                    |
| D88 | Q6 copies mirror role and clearance but not Phase 12 grants (DL:268, :272); Q16 cl.1 shows "sample values" for unmatched columns while un-narrowed values are hidden (DL:882 vs :213); Q5 used both a singular "Switch decision capability" and per-decision wording (DL:197 vs :198).        | Q6 fails closed; Q16 samples follow the floor; Q20 cl.3 resolves Q5                              |

## 8. Rejected alternatives

| Alternative                                                    | Why rejected                                                                                              |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| A. One Data Tools permission                                   | Hands export and bulk changes to every importer; Phase 12 precedent against it                            |
| C. Owners only                                                 | Stalls small teams; Owner needs just-in-time activation; blocks Q5 helpers                                |
| A Data Tools download permission                               | The export policy exists; it would block the everyday fix path                                            |
| An Importer seed                                               | Phase 12 fixes ten seeds; modules are added to groups                                                     |
| `explicit_only` for sensitive Data Tools permissions           | Owners could never hold them by default; every ministry would need extra grants before its first reversal |
| New alert classes                                              | Phase 12's sensitive-grant flow and audit suffice                                                         |
| Second approver or re-authentication                           | Q5 and Q18; Phase 12's just-in-time access covers elevation                                               |
| An interim role-name gate or #2281 platform approval           | Admits every staff member; contradicts Q5                                                                 |
| Naming people on the no-access page                            | Phase 12 routing; discloses who is cleared                                                                |
| Showing protected matches by alias                             | Links the legal name to the alias                                                                         |
| Creating a new person when the match is hidden                 | Duplicate under the legal name; P10:97                                                                    |
| Counting hidden matches differently                            | Reveals them (P12:1650; P28R:66)                                                                          |
| Leaving held rows out of downloads                             | Changes counts, which reveals them                                                                        |
| File names as default import names                             | Personal data in a shared list                                                                            |
| Applying the restricted-file floor to everyday imports         | The ministry's own files; would block every ordinary import                                               |
| A Phase 30 review queue for held rows                          | The import page plus the Tasks Hub item suffice                                                           |
| Real-time revocation streams; draft ownership-transfer wizards | Per-batch checks suffice; any preparer can continue a draft                                               |
| A Data Tools "who has access" screen                           | Phase 12's My Access                                                                                      |
