# D41 — native contact work: source and authorization evidence

Reviewed October 18, 2026 against Core `9cada8f3d8ab59db391d3fd20df77fcadeb09813`
and the shared research working tree. Scope: Q41 B, no additional external
contact-update feed in this release; native contact work must remain useful,
tenant-controlled and correctly authorized. This is bounded static evidence,
not a hosted database, deployed exploit, live provider or browser result.
No application/schema edit or old test/model/probe/verifier execution occurred.
Root, missionary, API, database, Supabase and backend instructions were read;
their existing server/source ownership remains binding.

## Source-owner boundary

[ADR-0097](../../../../adr/0097-source-authoritative-missionary-support-feed.md:5)
already separates the P21 giving projections and closed external field floor
from any future, separately ratified P28 relationship/contactability family.
[Owner constraints](../../../../prds/program-roadmap/owner-constraints.md:143)
require an active supporter/referral relationship before workspace enumeration,
keep organization records organization-owned and make the continuity feed a
transition lane, not middleware in native work. [P31](../../../../prds/program-roadmap/owner-constraints.md:451)
owns the composite and delivery; it does not manufacture new source purpose.

The [founder brief](../phase28-founder-brief.md:105) gives P9 authority for Parties,
relationships, assignments, referrals and qualified interaction records. Its
[privacy boundary](../phase28-founder-brief.md:189) forbids copying or relabelling
private CRM/Support/care notes into shared material. B does not select a new
contact model, permission engine, private CRM, migration scope or export right.

[D5's already-ratified correction contract](../phase28-d5-adversarial-review.md:23)
already owns the tenant permission entry, exact field eligibility, selected-field
save, conflict/recovery, international correctness and positive working journey.
S1–S5 below recheck present source against those existing obligations; they do
not reopen D5, require another universal grant, or propose a new editor
architecture. Source fixes belong in D5/P9/P12 delivery qualification. D41's
new scope is the exclusion of an additional external contact-update resource,
with a native journey that remains coherent with those settled decisions.

## Verified current behavior and qualification concerns

Severity/likelihood are reasoned risks if these inspected paths are reused as
the permanent D41 journey; they are not measured incident rates.

### S1 — Useful native surfaces exist, but relationship access is not field-edit authority

**Material concern: yes. High severity; medium likelihood on direct reuse.**
The missionary [donor query](../../../../../packages/api/src/missionary-portal/donors.ts:502)
scopes by current tenant and missionary profile. Its [route helper](../../../../../packages/api/src/missionary-portal/route-helpers.ts:24)
authenticates the missionary role and supplies a privileged admin client.
The [strict PATCH schema](../../../../../packages/api/src/missionary-portal/donor.ts:29)
does not accept tenant/actor/owner fields, and the [write](../../../../../packages/api/src/missionary-portal/donor.ts:174)
checks donor ID, tenant, missionary profile and explicit non-anonymous recipient
preference in the same statement. These are real safeguards.

However the reached route does not call a current tenant edit-capability or
field-policy resolver. It accepts a broad profile form including status,
frequency, notes, spouse and address, and records no source-field provenance
or actor audit in this reached mutation. Signed-in missionary + visible donor
does not establish permission to change every shared fact.

**Exact intended constraint:** “Native contact edits use the existing P9/P12
capability and source-field contract. A tenant may grant, narrow or remove the
supported edit capability; this does not remove independently permitted reading
or transfer ownership. Resolve tenant, actor, subject, relationship and current
field permissions server-side at acceptance; accept only the exact editable
fields for that operation. Reject supplied ownership, approval, audit, money,
schedule, source status or consent changes. Preserve actual author/time and
owner-required correction evidence.” This narrows native reuse; it does not
invalidate B or require an approval queue for every ordinary edit.

D5's atomic selected-action rule continues: any forbidden or invalid submitted
change rejects that action; do not silently drop fields and report success.
A true no-op creates no fictional correction or interaction. Contact correction
does not verify possession or change Auth, represented-Party, billing or public
identity; each field retains its existing owner's downstream consequences.

### S2 — Existing static field ceilings conflict with several reached DTO/write fields

**Material concern: yes. High severity; medium likelihood if unqualified paths are reused.**
The [field-policy migration](../../../../../supabase/migrations/20261005050728_field_policy_foundation.sql:1)
explicitly says static foundation only, no resolver/conditions/tenant override
activation. Its [reader](../../../../../packages/api/src/field-policies/reader.ts:25)
ignores tenant overrides and [loads baseline rows only](../../../../../packages/api/src/field-policies/reader.ts:68).
It is a static ceiling, not complete actor authority. The declared missionary
ceiling denies [type/status](../../../../../supabase/migrations/20261005050728_field_policy_foundation.sql:400),
[notes](../../../../../supabase/migrations/20261005050728_field_policy_foundation.sql:490),
[address](../../../../../supabase/migrations/20261005050728_field_policy_foundation.sql:450),
[tags/score](../../../../../supabase/migrations/20261005050728_field_policy_foundation.sql:440)
and [frequency editing](../../../../../supabase/migrations/20261005050728_field_policy_foundation.sql:430).
The reached [DTO](../../../../../packages/api/src/missionary-portal/donors.ts:363)
and [profile payload](../../../../../packages/api/src/missionary-portal/donor.ts:73)
expose or mutate several such fields without using this reader. Actual hosted
activation and data were not inspected.

**Exact intended constraint:** “Resolve the native source's exact allowed
contact fields through its governing purpose and current policy before release.
Do not treat a legacy DTO, generic editable flag or dormant tenant-override table
as permission. Unqualified fields remain unavailable; no broad tenant-authored
field matrix or permissive fallback is introduced. Reconcile actual intended
contact/address needs through the field-policy owner rather than silently
overriding a denied ceiling.” Valid native functionality may need owner-approved
source projections; B itself neither grants nor forbids a new field family.

### S3 — Full-form replacement can destroy concurrent or international facts

**Material concern: yes. High severity; high likelihood under ordinary stale edits.**
The [form](../../../../../apps/missionary/app/donors/edit-donor-form-model.ts:7)
requires email and at least two characters in a name, defaults absent status to
Active and frequency to Monthly, and has no country value. The server
[payload](../../../../../packages/api/src/missionary-portal/donor.ts:73)
replaces the full address and hardcodes `country: "USA"`. The
[update statement](../../../../../packages/api/src/missionary-portal/donor.ts:182)
has no expected revision or equivalent conflict check. An unrelated phone edit
can therefore overwrite a newer address, restore stale notes, or turn an
international address into USA in this source path. The [form reset effect](../../../../../apps/missionary/app/donors/edit-donor-dialog.tsx:70)
also resets while open when new donor values arrive; preserving dirty work on
background refresh is not demonstrated.

**Exact intended constraint:** “Apply only deliberately changed, permitted
fields against an expected source revision or equivalent protected field
precondition. A concurrent conflict preserves the draft and shows only the
currently authorized changed facts; it never silently overwrites or offers an
unrestricted Force save. Omitted fields are unchanged, explicit clearing is
distinct from unknown/withheld, and disabled fields are never serialized as
empty replacements. Preserve international names, country and address meaning;
do not require email or location to perform unrelated legitimate contact work.
Do not invent a giving frequency, financial status, consent or address country.”
Use the existing source's conflict mechanism rather than building a sync engine.

### S4 — Lost-response retries need durable business recovery

**Material concern: yes. Medium severity; high likelihood under interrupted networks.**
The [client](../../../../../apps/missionary/app/donors/donor-mutation-client.ts:19)
turns any network failure into `ok:false`; the server [returns only `{ok:true}`](../../../../../packages/api/src/missionary-portal/donor.ts:225).
No mutation identity, accepted revision, audit receipt or accepted-result
recovery is present in the reached command. A retry can overwrite an intervening
edit even when repeating the same literal values. The [dialog](../../../../../apps/missionary/app/donors/edit-donor-dialog.tsx:337)
uses toast success/error feedback and closes on success; it does not distinguish
unknown commit outcome. Repeated activity creation is a separate append effect,
so retrying it must not be conflated with safe contact-edit replay.

**Exact intended constraint:** “A deliberate Save has a stable owner-command
identity and recoverable accepted result. Same-intent retries resolve that
result under current rights without applying stale content again or duplicating
audit/secondary effects. New intentional edits carry a new intent and current
revision. After lost acknowledgement, show that the outcome is being checked;
preserve entered work and do not assert failure or ask for a blind second Save.
Contact correction creates no interaction, donor contact or financial event.”
This is a native command safeguard, not an outbound queue or new local datastore.

### S5 — Shared contact facts and private preparation must remain visibly distinct

**Material concern: yes. High severity; medium likelihood if the current label is reused.**
The edit form calls its [free-text control “Internal Notes”](../../../../../apps/missionary/app/donors/edit-donor-dialog.tsx:160),
but it writes the common [donors.notes column](../../../../../packages/api/src/missionary-portal/donor.ts:91).
The [schema](../../../../../supabase/migrations/20250101000000_init_schema.sql:62)
has no per-author/private-preparation scope on that field. The
[non-anonymous DTO](../../../../../packages/api/src/missionary-portal/donors.ts:406)
returns notes; the [anonymous branch](../../../../../packages/api/src/missionary-portal/donors.ts:378)
strips identifying fields, notes, tags and activity details. That redaction is
useful but does not turn a shared notes column into Maya's private workspace.

**Exact intended constraint:** “Explain when an edit updates an organization
contact record. Keep private preparation in its already governed owner and
audience; do not label shared organization notes Private, or copy private/care
material into a shared record, search index, export, feed or coaching summary.
Contact visibility, edit permission, contactability, consent, newsletter
enrollment and export are distinct. Changing an email address or preferred
contact method does not grant contact permission or remove suppression.”
Anonymity/access changes must also invalidate protected cache, detail, form,
save/result recovery and export paths. Do not preserve hidden prior values in
client form state as a new authorization path.

### S6 — Add Partner is not yet a qualified native create path

**Material concern: yes. High severity; high likelihood of failure or bad data if reused unchanged.**
The [dialog](../../../../../packages/missionary/components/add-partner-dialog.tsx:58)
directly inserts into `donors` from the browser. The
[payload](../../../../../packages/missionary/components/add-partner-form-model.ts:34)
uses a caller-provided missionary ID, supplies no trusted tenant and fabricates
Active, zero money facts and score 70. Its [form](../../../../../packages/missionary/components/add-partner-form-model.ts:12)
requires email/location and defaults Monthly. Later [migration declarations](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:157)
describe finance/contact writes as server-command-owned and grant SELECT only,
after the earlier demo migration revoked browser write grants. With those
effective grants the create fails; no hosted behavior was tested. Restoring a
raw insert permission would not qualify its source fields.

**Exact intended constraint:** “Native add/reuse uses P9's qualified server
command and identity/relationship admission, including D17's existing boundaries
where file intake applies. Derive tenant, creator and association from current
authority; never infer identity equality from shared email/name alone or expose
the whole CRM to aid duplicate search. Unknown financial/relationship facts stay
unknown. Same-intent creation retries recover one record. Do not restore browser
grants or create a missionary-owned shadow contact table to repair the legacy UI.”
This is not permission to expand the selected self-service import into notes,
activity, financial history or an external address-book synchronization.

### S7 — No contact feed was found; B still requires explicit exclusion and compatibility proof

**Material concern: yes, a release proof gap. High severity; unknown likelihood.**
A case-insensitive bounded search of current `packages`, `apps` and `supabase`
TypeScript/TSX/SQL for DonorHub, TntConnect, MPDX, missionary support feed and
contact-update feed found no implementation match. This is evidence of that
searched surface, not proof about deployed integrations, arbitrary generic
exporters or systems outside the repository. The governing [ADR](../../../../adr/0097-source-authoritative-missionary-support-feed.md:126)
rejects arbitrary-field access, bidirectional gift/contact writes and uncontrolled
exports. Native contact work and no new feed are still separate qualification
claims.

**Exact intended constraint:** “This release adds no P28 external contact-update
resource, subscription scope, automatic emitter, webhook, generic-field mapping
or outbound queue, including through imports, API, workflow or AI. Do not expose
a cosmetic Contact sync switch or imply an external tool is current after an
Asym edit. The accepted P21 giving feed retains its exact closed field floor and
qualification; B does not remove an already authorized identifying field merely
because it resembles contact information, and native edits do not widen that
floor. No existing giving connection gains P28 contact purpose.”

If rollout inventory finds an existing contact-sharing lane, do not assume its
absence, erase history or stop authorized giving delivery indiscriminately:
route it through the existing P31/source owner to stop unauthorized future
egress and settle existing state. Prior downloaded/provider/local/backups cannot
be promised erased. No workaround export, mailbox ingestion or manual parallel
CRM is part of B's native journey.

## Database, RLS and authority observations

| Area                         | Checked observation and permanent qualification need                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keys and tenant references   | The legacy donors table has nullable independent tenant/profile/missionary FKs ([schema](../../../../../supabase/migrations/20250101000000_init_schema.sql:62)); this is not proof of the accepted multi-relationship Party model. P9's target writes must enforce same-tenant associations and supported source cardinality rather than extending legacy single `missionary_id` ownership. Validate create, reassignment, merge, deletion and resulting references at one owner boundary.                                                                                 |
| Grants and RLS               | The [demo migration](../../../../../supabase/migrations/20260216153000_demo_readonly_rls.sql:43) enables RLS, resets policies and revokes browser writes; the [later migration](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:21) removes anon public reads and adds owner/staff SELECT. Its donor owner predicate concerns `profile_id`, not unrestricted missionary access. Effective live policies/grants were not queried. Do not infer column redaction from row filtering or repair the legacy create by widening grants. |
| Old and new row checks       | The reached profile mutation executes via admin client; its row filters do not replace field/current-capability checks. Browser UPDATE was not demonstrated. Future applicable RLS must prove old-row USING and resulting-row WITH CHECK, inherited predicates and all permissive/restrictive policy combinations. Absence of the literal WITH CHECK clause alone is not a vulnerability; relevant PostgreSQL defaults matter.                                                                                                                                             |
| Field policies               | The [table](../../../../../supabase/migrations/20261005050728_field_policy_foundation.sql:19) is a static ceiling with dormant tenant overrides; [mutation policies](../../../../../supabase/migrations/20261005050728_field_policy_foundation.sql:37) are super-admin-only. No qualified ordinary tenant policy writer is established by these rows. Product tenant capability control must use its existing approved permission owner; no generic policy editor is implied.                                                                                              |
| Trusted actor and audit      | Route context supplies tenant/profile and server time, but the reached donor command emits no durable actor correction record. Qualify the actual P9 command/audit transaction; preserve actor, revision and changed field meaning without indiscriminately logging PII bodies.                                                                                                                                                                                                                                                                                            |
| Views/functions/service role | The inspected missionary route uses direct privileged table mutation, not a qualified contact-edit RPC; no separate new view/function is needed by D41. Actual RPC grants, invoker/definer/search path, bypass roles, direct REST/collections, views, API, caches and export must preserve the same field/scope ceiling before native release.                                                                                                                                                                                                                             |
| Concurrency and nulls        | An absolute full-form PATCH is not safe merely because repeating identical values appears idempotent. Current revision, immutable references and a durable accepted result prevent overwriting concurrent donor/staff edits. Omitted, cleared, unknown and withheld values need distinct transport meaning.                                                                                                                                                                                                                                                                |
| Deletion/retention           | Native edits do not delete received gifts, commitments, shared history or private preparation. Existing owner retention/revocation/merge rules apply; content access must end without pretending every downstream copy has vanished. D41 introduces no attachment bucket, contact feed cache or new retention period.                                                                                                                                                                                                                                                      |

## Existing tests and required proof

The [mutation tests](../../../../../tests/unit/packages/api/missionary-portal/donor-mutations.test.ts:115)
use mocked query chains to assert tenant/profile predicates and a server-owned
timestamp. One [fixture explicitly expects London, USA](../../../../../tests/unit/packages/api/missionary-portal/donor-mutations.test.ts:183),
demonstrating that an existing passing test expectation can preserve weak
behavior. The [anonymous mutation suite](../../../../../tests/unit/packages/api/missionary-portal/donor-anonymous-mutations.test.ts:112)
checks malformed/unknown/true anonymity and ID/scope rejection against a test
double. These were read, not executed; neither is live RLS, UI or concurrency
proof.

Release qualification must demonstrate:

1. Authorized supported field correction works with native controls; tenant
   removal of edit capability and per-field denial remain effective on stale
   forms, direct API calls, retries and all alternative data paths. Allowed
   reading remains available where independently authorized.
2. No caller can change tenant, actor, subject/source ownership, protected
   status, money, commitment, suppression or consent through a contact update;
   permissible old rows cannot become forbidden new states or relationships.
3. Missing email, a legitimate one-character/mononymous name, shared church or
   household mailboxes, non-US addresses and nullable contact facts do not cause
   fictitious replacements or unrelated edit rejection. Hidden fields are not
   round-tripped as empty writes.
4. Two writers/edit tabs, background refresh, simultaneous access revocation,
   lost response after commit and same-intent retry produce one ordered accepted
   correction or an understandable conflict. A later deliberate edit remains
   possible; no auto-reapply of a stale full form.
5. Shared contact changes and private preparation have clear audience labels and
   independently enforced ownership. Anonymous or restricted identities do not
   leak through list counts, search, read DTOs, edit defaults, copied notes, logs,
   exports or revoked cached details.
6. Native create/add-reuse does not require a connector, invent gifts/scores or
   create duplicates on retry; exact identity/relationship admission is enforced
   without broad CRM enumeration.
7. A contact correction creates zero new P28 contact-feed payloads, jobs,
   subscriptions or external update effects; generic workflow/AI/export routes
   cannot bypass this release boundary. Existing giving-feed closed-floor
   fixtures remain unchanged and no private notes/preparation become fields.
8. Existing giving-feed stop/authorization/correction behavior and D17 intake
   remain intact. Mixed-version deploy, import and restore cannot enable an
   unratified contact family or re-enable blocked egress. Retained-state inventory
   and actual role/grant/field matrix precede release claims.

No load/capacity benchmark, real RLS execution, authenticated provider test,
accessibility test or measured user feedback is claimed here. Native read/write,
authorization, migration and complete UI qualification remain owned delivery
gates; the absence of a new contact feed does not certify old native code.
