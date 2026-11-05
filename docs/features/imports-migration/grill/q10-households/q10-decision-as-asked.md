# Q10 — Households, couples, shared emails and organizations: decision as asked and chosen

Founder answer (2026-11-02): **"A. People first, households only from evidence."**

## Options as asked

- **A. People first, households only from evidence (chosen).** One record per person. Households and spouse links come only from explicit source evidence. Combined names are never split by Asym. A shared email stays with one person.
- **B. The household is the donor.** Couples and households import as one donor record (the Virtuous model).
- **C. Asym splits and groups automatically.** Asym parses combined names and builds households from shared addresses, emails or surnames.

## Option A as proposed (seven parts)

1. **Couples from separate rows** (the normal SiteStacker case):
   - An Asym household is created when two or more people share a source household ID; households of one are not created.
   - Spouse links come from source Spouse relationships.
   - The head of household becomes only the default for mail and display, never the legal donor.
   - The household name is imported as a display name.
2. **Combined-name rows are never split by Asym.**
   - The import template offers Person 1 / Person 2 columns.
   - "John & Mary Smith" in a single name field imports as one record flagged "may be two people".
   - Practice runs list these rows so the ministry can fix them at the source before the final export.
3. **One email, one holder.**
   - The person the source recorded a shared address on keeps it. If two records share it, the source's primary person keeps it, and the reviewer decides only when nothing says who.
   - The other spouse imports without an email, is marked "shares a mailbox with {name}", and is asked for their own address when they next give or sign in.
   - Placeholders such as `none@…` become blank.
   - A block on a shared mailbox applies to whoever holds it.
4. **One legal donor per gift.**
   - SiteStacker's per-person gift owner stays the legal donor.
   - For template sources that record gifts per household, the ministry picks "primary person" (default) or "review each", and those rows are blocked until it does.
   - Phase 30 never creates a joint donor.
5. **Organizations.**
   - An organization plus its contact person becomes an organization record, a person record and a contact link.
   - The organization holds its gifts.
   - Organizations never join households.
6. **Matching.**
   - Source IDs come first, and an email match also needs the first name to agree.
   - Same-household pairs are shown as "likely spouses".
   - Within-file duplicates are caught before commit.
   - Phase 4 owner requirements: guest gifts stop attaching on email alone, and the duplicate scorer stops rating couples as "high".
7. **Additional emails, children and bindings.**
   - Additional emails and phones are kept as source evidence until Asym has a home for them.
   - People marked as children are held for review under Phase 10.
   - One source row can link to several Asym records by role (person 1, person 2, household, organization, contact).

## Ratified context

- Q1 clauses 1(a) (Minimum Switch Kit: Parties and households), 2 (Asym sole writer for identity and relationships), 4 (match review, no automatic merge) and 5 (convergence on Source Record Bindings).
- Q3 clause 4(b) (stable source ID per record family).
- Q4 (Asym never receipts imported gifts; per-household versus per-donor statement totals).
- Q8 (one payer per arrangement; mail-or-call list).
- Q9 (person- versus address-level blocks; a deceased spouse never blocks the survivor).
- C2 (no automatic merge).
- Research: `research/q10-r1-repo-households.md`, `research/q10-r2-external-households.md`.
