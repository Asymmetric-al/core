# Q20: Who can see and do what in Data Tools (decision as asked and chosen)

Founder answer (2026-11-04): **"B. Research modern best pratices and think deeply and apply what is helpful. Think of edge cases and figure how to best handle them without creating needless complexity or over engineering."** The founder also required a full, ruthless adversarial review across all 22 categories.

This is the second half of F7. Q19 (ratified 2026-11-04) fixed the area's shape.

## Already fixed (not reopened)

- **Separate permissions:**
  - choosing Replace, clearing values and reversing an import (Q12, O52, Q18);
  - Switch decisions (Q5).
- **Gift files** also need Gift entry's batch permission (Q12).
- **One person may hold every permission.** No Asym identity decides (Q5).
- **Source values** stay hidden until a cleared member narrows the file. Until then, helpers and Asym help see only headers, counts and summaries (Q5, Q11).
- **The menu entry** is decided server-side from permissions, never from role names (Q19).

## Options as asked

- **A.** One "Data Tools" permission.
- **B.** A few clear permissions, with sensible starting sets (chosen).
- **C.** Owners only.

## Option B as proposed

**Permissions:**

| Permission              | Lets you                                                                                                                                     | Sensitive? |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| See imports             | The menu, the Imports list, statuses and counts, without values                                                                              | No         |
| Prepare and run imports | Upload, match columns, decide matches, fix cells and confirm. Values are shown only where the person's own record access and clearance allow | No         |
| Change existing values  | Replace and Clear                                                                                                                            | Yes        |
| Reverse imports         | Reverse an import                                                                                                                            | Yes        |
| Download import rows    | Counts as an export: logged, people you can't see left out, protected people never included in bulk                                          | Yes        |
| Run the Switch          | Start a Switch and make its decisions                                                                                                        | Yes        |

"Sensitive" means it is granted to a named person, never bundled into a general template, and Phase 12 alerts on it.

**Starting sets:**

- The ministry's Owners hold every permission.
- A new "Importer" starting set holds See imports, and Prepare and run imports.
- Everyone else holds none, so they see no menu entry and no shortcuts.

**Behaviour:**

- **Seeing each other's work.** Anyone who can see imports sees every import's status and who started it.
- **Continuing a colleague's draft.** Anyone who can prepare can continue a colleague's draft. Changes are attributed.
- **Protected people.** A row matching a person the importer can't see is held as "Needs review by someone with full access". The same wording covers staff and deceased matches. The match is never shown, never counted differently and never created as a duplicate.
- **Links without access.** A same-ministry link opens "You don't have access to Data Tools. Ask {names}." A link to another ministry's import shows not found.
- **Before Phase 12's grant screen exists,** only Owners can use Data Tools.
