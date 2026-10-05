# AL-491 field-policy foundation census

`census-v1.json` is the immutable baseline seed specification, with every column's
category and explicit visibility/editability/exportability on all five surfaces.
The migration contains 855 rows for the 171 live columns plus five rows for the
separately source-bound repository supplement: 172 candidate columns / 860 rows. The two
unaltered read-only metadata responses bind the census to project
`pnmlrbgjiqzzsthsoikm`, capture `2026-10-05 04:51:45.072671+00`, PostgreSQL 17.6,
latest live migration `20261001061717`, and base repository revision
`ffa812656b0ff920b3fe014a31d2d57ee8679288`. Exact queries and SHA-256 digests are
recorded in the artifact. The candidate migration is
`20261005050728_field_policy_foundation.sql`; the acceptance record must bind
these files to the final candidate commit SHA. Metadata is evidence, not executable
instructions. No business values or credentials were captured.

These implementation choices require independent review; this packet does not
claim owner ratification, portal enforcement, or whole-phase acceptance.

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
census and scope qualification; none is fabricated here.

## RLS and verification

Baseline reads require a real active membership in the claimed tenant context or
`authz.is_super_admin()`. Other tenant rows are excluded for ordinary members.
Claims alone and inactive memberships grant nothing. All policy writes require
super-admin authority; ordinary Mission Control admins/finance members cannot
manage baseline. No non-super tenant writer is activated. The reader ignores
`tenantId` and selects only `tenant_id IS NULL`. RLS permission to inspect policy
metadata does not grant permission to inspect classified record values.

Run `DATABASE_URL=<disposable localhost URL> PSQL_BIN=<psql or container wrapper>
node scripts/verify/field-policy-census.mjs` to verify immutable captures and exact
seed/category/flag parity, plus candidate-schema parity. Apply the full migration
chain first with `scripts/verify/supabase-migrations.mjs`, then execute both
`supabase/tests/field_policies*.sql` with `psql -v ON_ERROR_STOP=1`.

**Qualified bounded reconciliation:** the immutable live capture has 171
columns, while repository migration replay adds `donations.stripe_refund_ids`.
`repository-supplement-v1.json` binds this sole additional whole column to base
`ffa812656b0ff920b3fe014a31d2d57ee8679288`, source
`supabase/migrations/20260702090000_donation_stripe_refund_ids.sql`, SHA-256
`2fd5fe0c396d9662e5595b1f24879c4b3dc5404b9ab24b7c0ff60c144d1b9bda`, and the
actual local catalog (`ARRAY`, `_text`, NOT NULL, default `'{}'::text[]`, ordinal
29). Its five explicit financial-category rows protect the entire array as
processor proof, without changing `refund_amount` money truth. The census holds
the supplement artifact digest separately; no live evidence or source schema is
amended. The verifier requires exact 171-live-plus-one-source column parity and
exact 860-row flag/category parity; it allows no arbitrary drift exemption.

Only canonical `public.receipts` must be physically absent in the candidate.
The noncanonical prototype source migrations remain unchanged:
`20260704120000_gift_receipt_records.sql` (SHA-256
`d5d9c65c7cbdc66df4460e4aab9e0fd3352056f06a3cf80d9d248227b571d56d`) and
`20260611140000_contribution_receipt_delivery.sql` (SHA-256
`a8d103822430d8dd9318f1f0abe7991aa7a7e240472b21262cf11ef81f94ec8f`). Their
physical replay existence grants no policy or canonical receipt authority.

Disposable PostgreSQL 15 execution supports real NULLS NOT DISTINCT uniqueness
and RLS. The compatibility bootstrap is not full Supabase/PostgREST or the live
PostgreSQL 17.6 environment. Local tests supplement its missing standard `auth`
schema usage grants; production auth helpers and membership functions are the
actual repository implementations. No hosted writes or provider calls occur.
