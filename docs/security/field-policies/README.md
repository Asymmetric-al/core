# Field-policy classification manifest

`manifest.json` is the classification of record for field policies (AL-2674,
plan section 7.1). It lists every column of each classified record type, with
the column's type, nullability and, where it has one, its generation expression
or pinned default; its category (and its independent semantic category where
that differs); whether it is a payment-processor identifier; and its flags on the
five surfaces. The baseline rows of `public.field_policies` are the manifest's
flags, one row per column and surface.

It replaces the AL-491 census, which asserted a dated capture of the hosted
schema by checksum and so let no classified column be added or dropped (audit
NR-19). The census and its supplements stay in this folder as historical
evidence (see "History: the AL-491 census" below); no gate reads them.

## Format

```json
"donors": {
  "email": {
    "type": "text",
    "nullable": true,
    "category": "contact",
    "mission_control": "ve-",
    "donor": "ve-",
    "missionary": "ve-",
    "public": "---",
    "export": "---"
  }
}
```

- Each surface value is three characters, in the order visible, editable,
  exportable: `v`, `e` or `x` where the surface admits the operation, `-` where
  it does not. `"ve-"` is visible and editable, not exportable.
- `type` is `format_type()` of the column; `nullable` is the opposite of
  `attnotnull`.
- `generated` is the column's generation expression; a column without it must
  not be generated. `default` is checked only where it is present.
- `semantic_category` appears only where it differs from `category`.
- `processor_identifier: true` appears on exactly the six Stripe fields listed in
  `processor_identifiers`.
- `reserved_record_types` lists the receipt record types that receive no rows;
  `receipts` must not exist as a relation at all.
- `pinned_sources` binds, by SHA-256, the migrations that define the census
  supplements' columns, as the census did.

## What the gate checks

`scripts/verify/field-policy-census.mjs` runs inside
`scripts/verify/supabase-migrations.mjs`, after the whole migration chain, in CI
and locally. It fails, naming every problem, when:

- the manifest itself is malformed: the five surfaces or six categories differ, a
  flag is not `[v-][e-][x-]`, a key is unknown, one column name carries two
  categories across record types (same-name floor), a processor identifier is
  unflagged, exportable anywhere or admitted off Mission Control, a reserved
  receipt type is classified, or a pinned migration changed;
- `UNCLASSIFIED`: a column of a classified table has no manifest entry;
- `STALE`: a manifest entry names a column that no longer exists;
- `SHAPE`: a column's type, nullability, generation or pinned default differs
  from its entry, so it has to be reclassified;
- `MISSING_TABLE`: a classified record type has no relation;
- `RESERVED`: `public.receipts` exists;
- `ROW_MISSING`, `ROW_UNEXPECTED`, `ROW_DRIFT`: `public.field_policies` does not
  equal the manifest's rows exactly. A tenant override row, or a row for a record
  type the manifest does not classify, is unexpected.

Run it on a disposable local database after applying the chain:
`DATABASE_URL=<local URL> node scripts/verify/supabase-migrations.mjs`. It
refuses any database that is not on `localhost`, `127.0.0.1` or `[::1]`.

## Adding a column

In the change that adds a column to a classified table:

1. classify it: add its entry to `manifest.json`, with every surface explicit;
2. seed it: in the same migration that adds the column, insert its five rows
   into `public.field_policies` with `tenant_id` NULL and the same flags and
   category.

A new record type is added the same way, as a new key under `record_types`. An
unclassified record family stays hidden on every surface
(`openspec/contracts/identity-and-access.md`), so a package that wants a new
table's fields projected classifies them here.

## Dropping a column

In the change that drops a column from a classified table:

1. in the migration, delete its rows from `public.field_policies` and drop the
   column;
2. remove its entry from `manifest.json`.

Dropping a whole classified table removes its record type. Until both steps are
in, the gate reports `STALE` or `ROW_UNEXPECTED`.

A package that adds or drops a classified column this way touches no test: the
suites derive their totals from this manifest and pick their example columns at
run time. These are the tests a package is expected to touch, and when:

- it drops a whole classified table that the AL-491 census classified: the census
  record-type list in `tests/unit/acceptance/issue-2674/manifest.acceptance.test.ts`
  ("still classifies every record type the AL-491 census classified");
- it drops or reshapes one of the columns the drift probes name (`donors.email`,
  `donors.email_normalized`, `donors.email_verified_at`,
  `donations.stripe_refund_ids`, `member_care_goals.title`, the two `person_id`
  columns, or the `member_care_goals` table): that probe in the same file, and
  the #2254 and #2256 suites that pin those columns;
- it changes a classification: see the next section.

Taking a record type out of the manifest while its table stays is not a way to
declassify it. The gate stops reading that table, so its columns are unclassified,
and under `openspec/contracts/identity-and-access.md` an unclassified record family
stays hidden on every surface: the change fails closed. Its `field_policies` rows
then fail the gate as `ROW_UNEXPECTED` until a migration deletes them, and the
manifest suite's census record-type list stops it for the nine record types the
census classified.

## Changing a classification

A change to an existing column's category or flags is a reviewed decision. Make
it in the manifest and in a migration that updates the column's rows, and record
it in the fidelity expectation of
`tests/unit/acceptance/issue-2674/manifest.acceptance.test.ts`, which proves the
manifest kept every census classification when it was created. For a column the
AL-491 census classified, `tests/unit/acceptance/issue-2254/census.acceptance.test.ts`
compares the gate with the census oracle and reports the change too; record it
there as well.

## Complete conservative taxonomy defaults

Each tuple is `(visible, editable, exportable)`. These are static ceilings. No
positive cell proves ownership, consent, actor capability, Legal Entity scope,
or purpose. All registered rows require the consuming subtract-only resolver
before product use. Policy rows can override category defaults; missing rows
never synthesize positive defaults.

| Category  | Mission Control | Donor | Missionary | Public | Export | auditRead | requiresReason | neverNarrow |
| --------- | --------------- | ----- | ---------- | ------ | ------ | --------- | -------------- | ----------- |
| public    | T,T,T           | T,F,T | T,F,T      | T,F,T  | T,F,T  | F         | F              | F           |
| contact   | T,T,T           | T,T,F | T,T,F      | F,F,F  | F,F,F  | F         | F              | F           |
| internal  | T,T,F           | F,F,F | F,F,F      | F,F,F  | F,F,F  | F         | F              | T           |
| financial | T,T,T           | T,F,F | T,F,F      | F,F,F  | F,F,F  | F         | T              | F           |
| care      | T,T,F           | F,F,F | F,F,F      | F,F,F  | F,F,F  | T         | T              | T           |
| security  | T,T,F           | F,F,F | F,F,F      | F,F,F  | F,F,F  | T         | T              | T           |

`neverNarrow` means the category has **no default admission on narrow or export
surfaces**, and the reader enforces that restriction for internal/care/security.
It does not prohibit removing permissions. Audit/reason flags are metadata for
future consuming enforcement; this foundation emits no audit events. Public
content is read-only outside Mission Control. Contact self-service/relationship
edits are ceilings only; financial narrow reads remain non-editable and
non-exportable. Unknown surfaces receive all-false taxonomy defaults.

The reader's registry is extensible text data: an exact, classified baseline row
can admit a new syntactically valid surface without a code change. No rows means
no access. Taxonomy defaults cover the initial five surfaces only and do not
create rows for new surfaces. Internal/care/security and processor locks cover
every non-Mission-Control surface, including future ones. There is no `finance`
surface. Mission Control processor visibility still needs current exact finance
capability in the future resolver; this actor-free reader cannot grant it.

## Classification rationale and conservative floors

`semantic_category` preserves the independent domain classification proposal;
`category` is the final whole-column policy classification. The coordinator
resolved the issue's same-name shorthand literally: every identical column name
has the highest category among its admitted meanings under `CATEGORY_ORDER`.
Thus `notes`, `status`, `title`, and `type` are **care** across this baseline,
including financial status and donor workflow/job-title columns. This deliberate
restriction avoids weakening care meanings; it may reduce future positive
projections until an owner reviews the underlying model. Email/phone remain
contact and avatar URLs public consistently across records.

Structural identifiers, timestamps and workflow metadata are explicitly internal,
not implicit fallbacks. Gift/pledge money and processor identifiers are financial;
provider errors and profile auth identity/role are security. Member-care content,
activity author snapshots, goals and health signals are care. `health_signals`
is classified as a whole care container, including its financial-health score.
No child key overrides the whole column's category.

The existing `Record<string, unknown>` declarations for donor preferences and
addresses, unrestricted donor tag strings, and open missionary social-link read
contracts do not establish an enforced maximum content sensitivity. Accordingly
`giving_preferences`, `address`, `work_address`, `tags`, and `social_links` are
conservatively **security** pending owner-qualified containment schemas. This
strengthens the independent provisional contact/internal classifications and
prevents accidental egress of admitted sensitive nested/free-form values.
Metadata alone does not prove live values. No raw-value inventory is needed or
claimed, and no dotted-key exposure exception exists.

All six known processor fields (`stripe_charge_id`, `stripe_customer_id`,
`stripe_subscription_id`, `stripe_payment_intent_id`, `stripe_payment_method_id`,
and the whole `stripe_refund_ids` array)
have an explicit per-field seed lock: Mission Control `(T,T,F)` and every other
surface `(F,F,F)`. The refund array is read-only even in Mission Control, with
`(T,F,F)` there. The reader repeats that lock even if their stored category or
flags are poisoned. They are never bulk-exportable, including via Mission
Control. Unknown or absent fields return `undefined`, denying operations even
in Mission Control rather than manufacturing an inspection permission.

## Receipt qualification remains reserved

Blake's 2026-10-05 04:44:28 UTC clarification approves only an evidence-bound
absent/reserved disposition. The targeted nine-table inventory and full public
relation inventory contain no canonical or prototype receipt source. `receipts`
has zero columns and zero positive seed rows. The reader denies `receipts`,
`gift_receipt_records`, and `contribution_receipt_snapshots` on every surface,
including Mission Control, even when privileged data writes poison policy rows.
Repository replay independently contains the two unchanged base prototype
relations; their physical existence is permitted, but neither receives census
rows or authority. The immutable live relation inventory remains unchanged and
still records both as absent there. No alias or donation fallback is provided.
Canonical facts/eligibility belong to
Phase 7, artifacts/rendering to Phase 18, and delivery to Phase 17. Later families
and acknowledgment/notification document classes must ship their own owner
census and scope qualification; none is fabricated here. The manifest carries
this disposition in `reserved_record_types`.

## Derived CRM report groups

`derived_record_types` classifies output rather than a Postgres relation. The gate
requires the same five policy rows per field and refuses a physical relation of
the same name. Mission Control's CRM export intersects the caller's selected
staff assignment and report permissions with the `bulk_export` policies for
`crm_report_groups`. Each group carries the tenant used for every source query,
its slice and group ID, and a report revision. The CSV uses only resolved
scalar cells. It exports no raw IDs, statuses or nested metadata. The audit
records the session actor, emitted groups and filter names, never search text.

Donor groups are one per donor, and the projection resolver decides each name.
The audience is `finance` for an assignment that holds the finance sub-role or
`contributions.manage_settings`, and `identity_restricted` for every other
staff assignment. Finance sees every donor's name. Any other audience sees a
donor's name unless that donor explicitly chose anonymity (either
default-anonymous preference `true`); a donor with no stated choice is named on
this surface. A withheld name leaves an unlabeled row. Search runs after the
projection, so it never matches a name the audience may not see. This governs
report egress, not interactive CRM detail or a contact list; the missionary and
public surfaces keep their own anonymity rules.

## History: the AL-491 census

`census-v1.json` was the immutable baseline seed specification of AL-491. The
foundation migration `20261005050728_field_policy_foundation.sql` seeded 855
rows for the 171 live columns plus five rows for the separately source-bound
repository supplement v1; the #2254 migration added ten rows for the two columns
of supplement v2, and the #2256 migration ten rows for the two columns of
supplement v3: 176 candidate columns and 880 rows. The two unaltered read-only metadata
responses, `live-schema-response.json` and `live-tables-response.json`, bound the
census to project `pnmlrbgjiqzzsthsoikm`, capture
`2026-10-05 04:51:45.072671+00`, PostgreSQL 17.6, latest live migration
`20261001061717`, and base repository revision
`ffa812656b0ff920b3fe014a31d2d57ee8679288`. Metadata is evidence, not executable
instructions. No business values or credentials were captured.

The supplements, in order: `repository-supplement-v1.json` adds
`donations.stripe_refund_ids` (financial, processor proof, from
`20260702090000_donation_stripe_refund_ids.sql`);
`repository-supplement-v2-donor-identity.json` adds `donors.email_normalized`
(generated `normalize_email(email)`) and `donors.email_verified_at`, both contact
(#2254, approved by Samson on Oct 24, 2026; see
`docs/security/identity-email-normalization.md`);
`repository-supplement-v3-person-anchor.json` adds `missionaries.person_id` and
`profiles.person_id`, both security and denied on every surface (#2256; see
`docs/security/identity-person-anchor.md`).

AL-2674 generated `manifest.json` from these files, taking each column's type,
nullability and generation from a fresh replay of the migration chain. The
October capture and the replay agreed on every column's type and nullability.
The files above are historical and unchanged; no gate reads them. The fidelity
test named under "Changing a classification" compares the manifest with them.

## RLS

Baseline reads require a real active membership in the claimed tenant context or
`authz.is_super_admin()`. Other tenant rows are excluded for ordinary members.
Claims alone and inactive memberships grant nothing. All policy writes require
super-admin authority; ordinary Mission Control admins/finance members cannot
manage baseline. No non-super tenant writer is activated. The reader ignores
`tenantId` and selects only `tenant_id IS NULL`. RLS permission to inspect policy
metadata does not grant permission to inspect classified record values. The
database tests `supabase/tests/field_policies*.sql` exercise these policies; run
them with `psql -v ON_ERROR_STOP=1` after applying the chain. WP2 rewrites the
policies on `public.field_policies` (plan 5.4).
