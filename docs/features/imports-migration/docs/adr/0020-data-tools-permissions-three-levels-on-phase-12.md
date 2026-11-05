# ADR-IM-020: Data Tools permissions are three levels on Phase 12; protected matches are held, never revealed or duplicated

**Status:** Accepted 2026-11-04. Ratified by the founder in the Phase 30 grill (Q20), after a full ruthless review.

- **Record:** `docs/features/imports-migration/grill/decision-log.md` §1 Q20.
- **Evidence:** `grill/q20-data-tools-permissions/`. This holds research r1–r4 and `q20-adversarial-review.md`, which contains:
  - edge cases E1–E30;
  - invariants P1–P6;
  - acceptance criteria AC1–AC24.
- **Amends:**
  - **ADR-IM-005:** Run the Switch, narrowing, helper end dates and the limits of Asym help access.
  - **ADR-IM-011:** fund names and preview visibility.
  - **ADR-IM-012:** Held for review, and the capabilities.
  - **ADR-IM-015:** downloads.
  - **ADR-IM-019:** default import names and money amounts.
- **Preserves:**
  - Phase 12, which owns grants, groups, seeds, sensitive flags, access requests, the last-admin guard and break-glass;
  - Phase 10, which owns clearance and protected people;
  - Phases 13 and 15, which own money permissions;
  - ADR-0212, the export policy.

## Context

Q19 created Data Tools without permissions. Q5, Q12, Q18 and O52 had already named separate powers: Replace, Clear, reversal and Switch decisions.

**Current code:** every staff member is a full admin (`packages/auth/permissions.ts:37-51`). No import, clearance or export capability exists, and a ministry cannot yet grant permissions.

**Phase 12 rules that shape the answer:**

- A capability flagged `sensitive` can sit only at the Admin level, never at View or Manage.
- There are ten seeded templates, and Owner is locked to at least one holder.
- No one sees everything, Owners included. Clearance is per person and never part of a seed.
- A blocked record must look identical to a nonexistent one.
- Access requests go only to grant managers or named coordinators.
- Long-running work re-checks authority at fire time and per chunk.

**Practice:**

- Money imports and undo are gated more tightly than people imports (Planning Center, Virtuous, Salesforce, Pipedrive, Zoho).
- When an importer can't see a matching record, the usual industry answer is to create a duplicate (Salesforce, Rock). That would leave a protected missionary's legal name on an unprotected record.

## Decision

1. **Three levels in one Data Tools row (Phase 12 module):**

   | Level      | Covers                                                                                      |
   | ---------- | ------------------------------------------------------------------------------------------- |
   | **View**   | Follow imports. No values.                                                                  |
   | **Manage** | Prepare and Run.                                                                            |
   | **Admin**  | Adds Replace and Clear, Reverse imports and Run the Switch. These are Phase 12 `sensitive`. |

   Each individual permission can still be granted on its own, for example Prepare without Run for a helper. Keys are dotted.

2. **Starting sets.** Owner holds Admin. Ministries add View or Manage to any group or person in one step. Existing users get nothing on launch. Clearance is never part of any level.
3. **Run the Switch** is Q5's Switch decision permission. Narrowing also needs clearance.
4. **Money.**
   - Confirming a Gift file also needs `finance:record_contribution`.
   - Amounts are shown only to people who can see contributions.
   - Q11's fund-name rule is limited to Switch real exports.
5. **Visibility.**
   - A row's Asym-side facts are shown only to people who can see that record.
   - The file's own cells are shown to Manage holders.
   - Counts are the same for everyone.
   - The restricted-file floor stays Switch-only.
6. **Held for review.**
   - **Which rows:** matches to staff, deceased people or anyone the preparer can't see.
   - **What happens:** one wording for all of them. A held row is never created as a person and never changes the counts.
   - **Who decides:** an eligible reviewer, who commits those rows under their own permissions.
   - **Expiry:** unreviewed rows expire with the file.
   - **Setup notice:** shown to Admins when no Manage holder has clearance.
   - **Accepted residual:** an uploader who knows a held person is neither staff nor deceased can infer they are protected. This is accepted, and held protected matches are audited (O104).
7. **Columns you can't edit** are not offered. If someone else confirms, Review lists them as "Won't be written".
8. **Downloads.**
   - Rows from your own file need Manage.
   - Downloads with Asym data need the existing export permission and never include protected people.
   - Every download is streamed, never stored, formula-safe, audited and capped at 1,000,000 rows.
9. **Shared work.**
   - View holders see every import.
   - Manage holders can continue any draft.
   - Default names are the kind plus the date.
10. **No access.**
    - No menu entry and no shortcuts.
    - Every Data Tools address shows the same page with **Request access**, naming no one.
    - Holders who open another ministry's import get "not found".
11. **Authority while running.**
    - Each batch re-checks the confirmer's permissions.
    - If they are lost, the import stops with the reason, and any eligible person can resume it.
    - Time-limited access shows its end time.
12. **Helpers and Asym help.**
    - Helper grants have an end date, by default the day the Switch closes.
    - Asym help sees only the Switch tab. No Asym identity holds a Data Tools permission.
13. **Hide values** for coaching.
14. **No stopgap.** Data Tools stays off until Phase 12 can grant these permissions. There is no role-name gate and no #2281 platform approval.

## Considered options

| Option                                                                         | Why rejected                                                                 |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| A. One Data Tools permission                                                   | Hands export and bulk changes to every importer.                             |
| C. Owners only                                                                 | Stalls small teams and blocks Q5 helpers.                                    |
| A download permission                                                          | The export policy already exists, and the everyday fix path needs downloads. |
| An Importer seed                                                               | Phase 12 fixes ten seeds.                                                    |
| `explicit_only` sensitive permissions                                          | Owners could never hold them by default.                                     |
| New alerts; a second approver; re-authentication                               | Phase 12's flow and audit suffice (Q5, Q18).                                 |
| An interim role gate or #2281 approval                                         | Admits everyone; contradicts Q5.                                             |
| Naming people on the no-access page                                            | Phase 12 routing; discloses who is cleared.                                  |
| Showing protected matches by alias, creating a person, or counting differently | Links names, duplicates the legal name, or reveals existence.                |
| File names as default import names                                             | Personal data in a shared list.                                              |
| The restricted-file floor on everyday imports                                  | They are the ministry's own files.                                           |

## Consequences

**Owner requirements, in order:**

1. **O102** (Phase 12): the module and its levels. Gates release.
2. **O103:** access requests.
3. **O104** (Phases 10 and 12): audit of held protected matches.
4. **O105:** helper end dates.
5. **O97, extended:** held-row tasks go only to eligible reviewers.

**Discrepancies:** D83–D88.

**Monitors** M-Q20-1 to M-Q20-6:

- held rows unreviewed after 7 days;
- ministries with no cleared Manage holder;
- more than 3 held protected matches by one uncleared uploader in 30 days;
- imports stopped for lost permission above 5% a quarter;
- access requests unanswered after 7 days;
- downloads above Phase 12's export budget.
