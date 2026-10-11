# D26 independent integrated review

2026-10-10 UTC; final targeted readback 19:43 UTC.
Core HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3`.
The founder selected shared working history and emphasized missionary autonomy
and an exceptionally clear interface. The initial framing review covered
[Q26](../phase27-q26-shared-partnership-updates.md), D21's delegated design
direction, P3/P9/P12 boundaries, the P28/owner-constraints shared-log direction and
the current CRM note migration/service before the integrated draft existed. The
subsequent review read the full [D26 synthesis](../phase27-d26-adversarial-review.md),
all five appendices and the new experiment's setup, mechanics, results, metadata
and README. Findings and their readback status are retained below. No new runtime
test, live policy audit, product edit or subsequent founder ratification is claimed.

## Initial concerns sent to the synthesis author

### IR1 — Sharing cannot become a missionary supervision system

**High / plausible if “shared history” is read as mandatory reporting.** A governs
the audience for eligible updates someone deliberately records. It does not itself
require logging every encounter, accepting staff-assigned targets or tasks,
mandatory check-ins, productivity scoring, read-receipt monitoring or coaching.
Ordinary source-owned obligations remain independently meaningful; autonomy does
not erase existing privacy or financial rules.

**Required wording:** no required interaction quota, compulsory note/reason,
automatic task, performance score or coaching access follows merely from creating,
sharing, reading or not recording an update. Preserve the separately qualified
owners of genuine requests/work and later invited coaching. A compact useful
update must be possible without a supervisor approval or a second confirmation.

**Meaningful proof:** missionary records one useful church update, declines to
record another encounter, and reads a colleague's update. None of these actions
creates a supervision/task obligation or counts as a different person's contact.

### IR2 — The source conflict needs a narrow explicit amendment

**Critical / plausible if ordinary CRM visibility is reused.** P9's current
cross-surface safety rule categorically excludes Party notes/activity from
missionary projections. P3 excludes private staff internals. Their coexistence
with the later shared-log direction requires explicit reconciliation, not a
rename from `standard` to “shared.”

**Required wording:** qualify a bounded development-interaction projection and
current audience/purpose, while preserving protected CRM/care/financial sources
and existing private/imported history. “Authorized collaborators” does not mean
everyone who can view the church. Existing policy-widening controls concern the
projection contract, not mandatory approval of each ordinary eligible update.

**Meaningful proof:** an authorized collaborator sees the new eligible update but
cannot enumerate or infer old private notes, unrelated church work or protected
source details through timelines, counts, notifications or summaries. A new
collaborator's current permitted access follows the qualified ongoing history
contract; it is not an excuse to migrate private history.

### IR3 — “Private” cannot promise author-only access that does not exist

**High / plausible with a familiar but inaccurate label.** The current
`crm_notes` migration treats `restricted` as readable by admin/super_admin, not
only its author. An autonomy-focused interface must not conceal that distinction.

**Required wording:** show the actual qualified audience before save and in detail.
Use existing protected-note routes; D26 need not create a new private-journal
product. If an intended narrower save is unavailable, explain that state without
silently publishing more broadly or forcing private content into shared history.

**Meaningful proof:** the UI makes no “Only you” claim for an administrator-readable
record. Audience lookup failure, role/context change and an old draft cannot
broaden disclosure. Plain current audience information should avoid a frozen
recipient-ACL engine or confirmation wizard for ordinary saves.

### IR4 — One encounter does not mean one merged narrative

**High / plausible if deduplication becomes attribution or contact inference.**
Two participants may record distinct attributed development-purpose notes about
one actual encounter. A staff member may document a missionary's reported meeting
without having attended it. Viewing a shared update is not contacting the church.

**Required wording:** preserve actual encounter/source identity, author and
reported participants without merging narratives, impersonating the participant
or counting each projection/read as another encounter. Do not require logging the
same call again in another surface or invent a universal encounter service.

**Meaningful proof:** one meeting appears through permitted surfaces with separate
attributed contributions and audiences, but produces no duplicated encounter
effect, automatic stage/task result or unchosen meaningful-contact rule.

## Integrated findings and resolution

The four initial concerns above are **resolved in the integrated language**:

- IR1: the exact decision, owner clauses 3–4, R01–R02 and AC01–AC03 preserve
  voluntary contribution while retaining actual source obligations. Existing
  invited assistance is not turned into staff supervision or an employment rule.
- IR2: owner clauses 1–2 make the narrow P9/P3 exception and P12 qualification
  explicit. R03–R06 and AC04–AC08 preserve private/history scope without an
  approval on every ordinary update or a new fixed recipient list.
- IR3: the decision, private-context UX row, R03 and AC04 explicitly reject false
  “Only you” promises. Unavailable private capability cannot silently publish.
- IR4: the decision, R07/R10 and AC09 preserve one encounter and each contributor's
  words; author, participant, reader and current assignee remain distinct.

### IR5 — B is not inherently duplicate logging

**Medium / plausible framing distortion.** The initial ownership opening attributed
“duplicate work” to deliberate sharing, although Q26 explicitly gives both options
one interaction source. B's genuine cost is an additional sharing action and the
possibility that useful context remains unshared, not a requirement to log the call
twice. The opening and main strongest-alternative discussion now state this
accurately. **Resolved.** A remains the selected product judgment, not a measured
superiority claim.

### IR6 — Do not prematurely forbid valid manually recorded contact evidence

**High / plausible if the initial wording is implemented literally.** The draft's
exact decision said saving was not meaningful-contact evidence; AC11 said creating
an update could not qualify meaningful contact. Taken absolutely, that could bar
an actual source-recorded encounter from a later qualified contact measure. The
reserved decision concerns what counts as meaningful contact, not whether a save
or visibility change magically proves it.

**Correction and readback:** the exact decision, R10 and AC11 now distinguish
sharing/saving alone from truthful source-recorded encounter evidence. Broader
contact criteria remain reserved. **Resolved.** Future proof must distinguish
recording a genuine meeting from merely reading, resharing or correcting its note;
the latter are not another person's contact or another encounter.

### IR7 — Closed or paused work does not falsify a current encounter

**High / plausible temporal restriction.** Initial AC13 prohibited “recording a
new present-day encounter” alongside implicit reopening. A genuine current
interaction may be recorded truthfully without automatically reopening managed
work; what must not happen is manufacturing a current encounter from the time an
old note was entered or corrected.

**Correction and readback:** AC13 now prohibits that fabricated date and expressly
preserves a genuinely current encounter's truthful date and independently qualified
effects. **Resolved.** Prove both a late historical entry retaining its occurrence
date and a real current interaction retaining today's date, without an implicit
reopen, revived reminder or invented contact result.

### IR8 — Origin safeguards must leave a qualified mistake-correction path

**High / plausible conflict between requirements and proof.** R08 permits an
explicit source-qualified correction while preserving provenance, but initial
AC14 absolutely prohibited retargeting through every RPC/view/service path.
Writable old and new contexts must not authorize an ordinary move; that does not
justify prohibiting an independently authorized source correction of a genuine
mistake.

**Required correction:** qualify AC14's rejection as ordinary/unqualified
retargeting, and require explicit correction to preserve provenance and current
source/visibility bounds. The weak RLS counterexample remains useful; it does not
select a universal no-corrections product rule. **Resolved:** final AC14 explicitly
rejects ordinary/unqualified retargeting and preserves the separate source-authorized
correction, provenance and current bounds.

## Evidence assessment and disposition

All 22 categories have concrete concern/effect, prospective severity/likelihood,
qualified evidence and R/AC links. Five owner clauses, R01–R20 and AC01–AC32 cover
the selected collaboration boundary without mandating a general diary, encounter
registry, audience engine, content classifier, compulsory note, supervision
dashboard or universal notification. No extra founder microdecision is necessary
to resolve the identified wording. The amendments make a real owner conflict and
the founder's autonomy instruction explicit; they do not activate a permission.

The [sharing experiment](sharing-probe/README.md) supports **7/7 on its first runtime
attempt**, 2026-10-10 19:35:49–19:35:55 UTC, PostgreSQL **17.11**, read committed,
with three observed separate-session lock schedules and exact container cleanup.
Case 1 really executes synthetic RLS under a nonowner. Cases 2–7 execute guarded
owner commands against a fixed fictional actor and toy context/access flags.
The distinction is explicit in the revised main.

Combined invalidation changes admission, read and write eligibility under one
coarse fixture lock. It does not prove each real policy/source revocation path.
Read-before-narrowing establishes database admission order, not recall of bytes
or client-cache safety. Historical receipt recovery after write-only revocation
is permitted where read authority remains, without treating replay as a new write.
No actual P12/RLS, deployed missionary grant, browser/accessibility, retention,
cross-consumer privacy, measured scale or pilot outcome is established. I did not
rerun or modify the experiment.

The source/practice evidence fairly distinguishes broad MPDX account sharing from
narrow coaching and acknowledges contrary agency reporting/employment policies.
It establishes comparable capabilities, not a universal ministry rule or measured
preference. Proposed operating thresholds are marked as triggers, not observed
performance. Real authorization and actual user comprehension remain release
requirements; monitoring does not replace them.

**Disposition:** accept with the explicit required P9/P3/P12 and P28 owner
amendments. All identified corrections are resolved on readback. The useful ordinary
flow remains Add update → Save update with a clear audience, truthful provenance
and direct correction. A missionary's silence is not evidence of inactivity or
noncompliance. No other material owner/scope contradiction was found.
