# Phase 29 Q08 — fresh staff-approved access: adversarial review

**Disposition: Accept with required amendments.**

Conrad selected and then ratified **A — Allow fresh staff-approved access**
with the exact corrected decision and complete required amendment package on
20 October 2026. Q01–Q07 remain ratified. This is adopted grooming intent,
not authorization to activate grants, change permissions or publish a formal
specification.

## Evidence and limits

Local Core and live GitHub `develop` were reverified at
`3d85897ebf1515008ef5c676b1c58a15422fb9ab`. This review combines governing
owner contracts, current source/migration/test inspection and primary public
documentation with independent [owner](phase29-q08-owner-adversarial.md),
[runtime](phase29-q08-runtime-adversarial.md) and
[UX](phase29-q08-ux-adversarial.md) passes.

- **Repository intent:** Q01–Q07, platform principles/boundaries, P4/P12,
  protected actions, official-document, Support, Workflow and custody owners.
  Ratification does not establish implementation or activation.
- **Current source:** there are reusable authentication, scoped command,
  approval, replay and Support mechanisms. A qualified native fresh
  completed-request access lane has not been established.
- **External facts:** the cited products have different link, account,
  permission and expiry models. Their documented behavior is not Core proof.
- **Product judgment:** a controlled source decision is a useful response to a
  legitimate later need. Its frequency and support savings have not been
  measured; no ministry workflow is invented as fact.
- **Unknown:** actual issuing capability/type mapping, fresh timing and
  repetition policy, effective DB/provider behavior and recipient/staff
  usability remain activation dependencies.

Severity describes prospective consequence; likelihood is qualitative
engineering judgment if an omission is left unresolved, not an incident rate.
No production native-access vulnerability was demonstrated.

Selected evidence below is relative to `/home/conrad/code/core`; the three
supporting notes contain the full bounded census and source-specific limits.

| Inspected source                                                                                                                                                          | Consequence                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/ai/document-authority.md:10–48`; `openspec/project.md:6–18`                                                                                                         | Owner/supersession and selected/ratified/implemented/qualified states remain distinct.                                                                                          |
| Q01–Q07 feature ADRs, especially `0007-fixed-completed-request-access-end.md:20–64`                                                                                       | Original admission/end, current recipient proof, exact file scope, completed mode and live restrictions remain binding.                                                         |
| `docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1668–1672`                                                                                   | Administrative ceiling differs from exercise permission; grantor dependency is type-specific; the governing grant-state mutation path is serialized.                            |
| `docs/adr/0025-producer-owned-protected-actions.md:28–50,74–92,125–130`; `0037-scanner-safe-exact-artifact-access.md:55–88`                                               | Source issuance, credential and prepared-message identity are distinct; specialized link replacement does not choose this fresh admission's scope or timing.                    |
| `docs/prds/sitestacker-parity/phase-26-support-hub-requirements-b.md:2363–2379,2389–2415`; `docs/adr/0038-purpose-owned-records-schedules-and-verified-disposal.md:20–55` | Actual content-use expiry and disposal cannot be bypassed merely because bytes remain.                                                                                          |
| `docs/prds/workflow-studio/04-data-and-api-contracts.md:88–102`; `03-runtime-and-recovery.md:15–49`                                                                       | Preflight is not authority; exact commit checks, durable semantic effects and current replay projection remain required.                                                        |
| `packages/auth/permissions.ts:32–53`; `packages/api/src/eve/model-policy/permissions.ts:9–55`                                                                             | Broad MVP staff roles coexist with a source-specific dedicated permission example. Neither establishes Q08 grant administration.                                                |
| `packages/api/src/admin/contribution-operations/store.ts:150–241`; `correction-requests.ts:123–145`                                                                       | Refund retries compare subject/payload; the correction helper's duplicate recovery compares tenant/key only. The latter is a reuse hazard, not a validated full-flow exploit.   |
| `packages/api/src/admin/contribution-operations/route.ts:197–237`; `viewer-projection.ts:327–358`                                                                         | Internal outcome and returned projection are separate, but supplied/early capabilities do not prove live Q08 replay authorization.                                              |
| `packages/api/src/admin/support-hub/adapter/supabase.ts:644–662,1383–1421`                                                                                                | Conversation reopening and email correlation do not establish file grant or recipient identity.                                                                                 |
| `packages/api/src/eve/audit/control-decision.ts:58–69`                                                                                                                    | Best-effort denial audit preserves refusal on log failure; it must not be copied as the durable successful-grant audit contract.                                                |
| `packages/ui/components/shadcn/dialog.tsx:44–85,125–150`; `button-component.tsx:8–32`; `field.tsx:189–240`                                                                | Shared review, control and error primitives exist. Essential blocked/pending information cannot rely only on a disabled control's focus/tooltip; composition still needs proof. |

**Fresh test evidence:** 10 selected existing tests passed; 34 were filtered
out across three files, Vitest 5.0.3, 1.69 seconds. These cover mocked dedicated
permission checks/denial-audit failure, refund-key recovery and conflicts, and
pure result redaction. The runtime note records the exact filters and
credential-free, read-only, network-disabled execution. No Q07 suite was
rerun, and no native grant, real DB race/RLS, provider or browser outcome is
proved by these adjacent tests.

## Adversarial check

### What could go wrong with this answer?

"Staff-approved" can become any staff member, a generic Share button, or a
service-key bypass. "Fresh" can hide an update to the expired grant, evade a
binding restriction or accumulate broader scopes through repeated grants.
A timeout/double-click can issue another period. A helpful expired page can
leak private context. A successful issuance can be misreported as notification,
recipient entry or completed download.

### What hidden assumptions are we making?

We cannot assume staff read permission includes grant administration, that the
old expired grant must still authorize reading, that a mailbox string identifies
the same person, or that currently attached files were in the original
admission. Nor can we assume another 30 days, unlimited repeats, one active grant,
a new email or a two-person approval rule. Those have different owners and
require explicit source qualification.

### How does this affect the whole product?

The requesting source owns this new business act; P12 owns administrative
ceilings, grant-state rules and current authorization. P4/Q01 own recipient
admission/proof. File custody and delivery enforce exact independently eligible
representations. Support can route a need, but resolving/reopening a conversation
cannot issue access or reopen document intake. P17/P6 own any separately
selected communication. No new authority moves into CMS, a generic file picker
or the recipient's browser.

### How does this affect the end-user experience?

Use the existing request/help context. Authorized staff review who receives
which allowed reads under which bounded timing terms, then make one deliberate decision.
Recipients use the normal qualified entry and return to the completed view.
Show truthful blocked, stale-review, committed, unknown and delivery states.
No new account, repeated enrollment, raw-file email fallback or unexplained
"try again" loop is needed.

### Does this follow modern best practices?

Current evidence supports clear intentional permission changes and scoped
review. SafeSend limits link resend to active, non-expired documents. Tresorit
distinguishes inactive links from new sharing. Submittable distinguishes
organization-profile membership from application access. These are useful
boundaries, not a universal requirement for a fresh Core grant or a particular
lifetime.
[SafeSend](https://www.thomsonreuters.com/en-us/help/safesend/secure-file-transfer/usage-guides/online-portal/resend-access-link),
[Tresorit](https://support.tresorit.com/hc/en-us/articles/360005537333-Manage-shared-links),
[Submittable Next](https://next.support.submittable.com/hc/en-us/articles/41242987982231-Applicant-FAQs).

GOV.UK recommends checking meaningful information before submission and using
a specific action label. OWASP emphasizes server-controlled significant
transaction data and an authorization gate at execution. We apply those
principles without importing a new banking authentication ceremony.
[Check answers](https://design-system.service.gov.uk/patterns/check-answers/),
[Transaction authorization](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html).

### Does this fit Asym’s existing repo and product direction?

Yes, as a newly qualified source capability. Q07 forbids implicit renewal but
deliberately left explicit fresh authority open. The old grant remains ended;
the completed business work and original scope remain evidence. Current
source restrictions and Q05's superseded-content exclusion still control.
P12's administrative ceiling is distinct from exercise permission, and some
grant types depend on continuing grantor authority. Existing code does not
settle the native type mapping or prove those protections.

### Should we adjust the recommendation?

Keep A, with exact issuance authority, proven prior admission, a scope bounded
by the original ordinary admission, current eligible purpose/recipient,
review-to-commit consistency, durable idempotency, independently safe
notification/recovery and finite policy gates. Do not add a permission engine,
new support portal, mandatory essay, unrestricted date picker or automatic
renewal program.

## Corrected decision to record

> After proven ordinary expiry of a previously admitted completed-request read
> period, allow an actor with the source's exact current **authority to issue
> access**, within P12's live administrative scope and assignable ceiling, to
> deliberately approve **fresh finite read-only access** for the same intended
> recipient and current permitted request purpose.
>
> The source evaluates eligibility to create new authority; it does not require
> the expired grant to authorize reading or require the recipient to have an
> open browser. Every protected recipient use still requires Q01's qualified
> current confirmation/assurance and current P12/source authorization.
>
> Bind each new decision to its proven original ordinary admission. Its scope
> is no broader than that original completed-view scope, intersected with the
> currently eligible own-submission members, permitted actions/context and the
> deliberately reviewed new scope. Preserve old grants, deadlines, fulfillment
> and history. No new recipient, purpose, later-added file, superseded content,
> membership, resharing right or reopened intake follows.
>
> This path cannot reverse a genuine binding authority shortening or bypass
> security revocation, purpose/content-use expiry, disposal, source withdrawal
> or another current prohibition. Temporary representation recovery remains
> separate. A narrower fresh grant does not itself rewrite the original scope
> or become a universal restriction unless the source explicitly makes it one.
>
> Review the meaningful recipient, scope, actions and qualified timing terms
> (including any already-known cutoff) in the existing staff
> context and require one deliberate grant action. Revalidate current source
> facts and administrative authority at commit; material stale changes require
> a refreshed review. Commit one durable semantic issuance effect with its
> required policy/history linkage. Retries recover that effect without another
> grant or moved end, and private result replay requires current disclosure
> authority.
>
> Keep issuance, recipient confirmation, protected reads and any separately
> authorized notification distinct. Use the existing completed-request
> experience and governed help, with truthful pending/unknown/committed/blocked
> states, clear bounded timing terms and the actual end when the selected
> source rule resolves it. Qualify the fresh timing/anchor,
> repetition/overlap policy, exact capability/type mapping, ongoing delegation
> rules and recipient handoff before activation. No new period, count limit,
> email, approval hierarchy or general document drive is selected here.

## The recommended staff and recipient journey

This is reviewed interaction intent, not a working or user-tested screen.

**Staff:** open the existing source request or its governed assistance context.
Where authorized, use a compact review showing the intended recipient in a
source-approved disambiguating form, the relevant request purpose, eligible
exact members and permitted actions, the qualified timing rule and controlling
limits (including an exact end where already determinable), and any current
blocking state the actor may see. Administrative
review must not require access to every original's contents: grant
administration and content reading can be intentionally separate.

Use one explicit **Grant read access** action and a normal safe exit before
submission. No generic **Share**, **Viewer**, **Reset expiry** or **Send link**
label should conceal a different authority. Avoid a second identical
"Are you sure?" dialog, mandatory justification essay, arbitrary email picker,
prechecked broader access, or an unselected bulk-grant control. Source-required
reason/provenance and stronger approval/assurance remain applicable, including
existing separation-of-duties rules; no universal extra approver is invented.

This may be a short page or an existing shared dialog depending on density;
do not freeze a component shape before actual layout testing. The review must
be inspectable without opening every file or losing the selected context
across safely paginated lists.

| State                                                             | Staff experience                                                                                    | Recipient meaning                                                                                                                     |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Eligible, not yet submitted                                       | Clear review of exact recipient, reads, bounded timing terms and any known cutoff; one grant action | No new permission exists from preparation or help alone.                                                                              |
| Policy or issuer authority missing                                | Source-permitted action-level explanation and existing qualified escalation                         | No fabricated default or general-admin override.                                                                                      |
| Relevant scope/recipient/end changed                              | Refresh the material facts and ask for the deliberate decision again                                | No silent retarget, broadened scope, changed end or substituted file.                                                                 |
| Command in flight                                                 | Stable progress; prevent accidental duplicate activation while reconciling the same operation       | UI suppression helps usability but does not replace server idempotency.                                                               |
| Outcome unknown after dispatch                                    | **We’re checking whether access was granted** with bounded source reconciliation                    | A timeout or closing the panel is not proof of cancellation/failure.                                                                  |
| Committed and currently usable                                    | Durable **Read access granted** result with its actual permitted end and source history             | It is not proof the recipient was notified, signed in, read or saved anything.                                                        |
| Committed but now revoked/expired/unusable                        | Preserve the issued fact; show the actual permitted current state                                   | Do not retry as a new grant merely to make a success banner true.                                                                     |
| Notification failed, where notification was separately authorized | Explain that delivery failed separately; recover that delivery under current authority              | No second issuance, changed recipient or refreshed period.                                                                            |
| No eligible content/actions                                       | Explain the allowed reason and source help; do not grant a misleading empty file promise            | Q05-permitted metadata-only scope can exist only if deliberately allowed and clearly reviewed, not as a file-access success fallback. |

**Recipient:** an ended link exposes only the source-permitted neutral help
state. Help does not assert that access will be approved or reveal private
request/file details before authorization. After a genuine issuance, the
recipient uses the qualified entry route to the same completed context, with
current eligible View/Download actions, permitted history and the actual end.
There is no new account or ordinary upload/correction step. Reuse Q01-qualified
proof only where its exact current conditions hold.

A lost entry link, expired session, unavailable preview and expired source
grant are different. Use the existing recovery appropriate to the actual
state; do not create a new grant to fix a presentation or sign-in problem.
Contact/principal changes use Q01's governed same-recipient recovery rather
than a free-form recipient picker. Properly proven recovery is not banned
merely because an address changed; unproved address equality or help email
does not establish identity.

The recipient handoff must actually work for an enabled source profile.
A staff-only grant record with no qualified entry/help route is incomplete.
This requirement does not select automatic email, a new inbox, a new ticket
form or an external communication without the applicable P17/P6 policy.

**Accessibility and clarity:** preserve Core's shared Base UI/base-maia
components and semantic tokens. Review details, action names and errors must
work with keyboard, speech, screen reader, touch, zoom/reflow, long names and
RTL/localization. Meaningful status changes need accessible feedback without
repeated announcements; focus must not be stranded when authority changes.
An authority failure is an action-level state, not a misleading invalid-email
field. Preserve safe context after reauthentication without retaining an
unselected offline private archive. No automatic download follows sign-in.

The actual new end uses sufficient readable date/time/timezone precision;
presentation cannot change the authoritative instant. Timing and accessible
authentication require their own applicable tests. A review/confirmation
mechanism can prevent consequential errors, but neither a modal nor a successful
axe scan proves conformance.
[WCAG error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html),
[Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

Do not fabricate an end before its source event exists. An issuance-relative
or later-activation rule, if subsequently selected, may resolve the exact end
after review. Staff must review its stable duration/anchor/limit consequences;
show the actual end when authoritative resolution occurs. A material change
to those terms requires refreshed review, but ordinary time advancing under
unchanged reviewed terms must not create an endless stale-review loop.
Any deferred activation must itself have a qualified finite expiry/outer
bound; this review chooses no such duration or activation model.

## Ownership, invariants and lifecycle

| Authoritative fact                          | Owner and invariant                                                                                                                                                                                                       |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Original admitted scope and ordinary expiry | Request source and Q07 evidence. It actually existed; logs of what was viewed or generic Expired labels are not a substitute.                                                                                             |
| Staff's ability to cause issuance           | P12 administrative scope/assignable ceiling and the source's qualified capability/type binding. Exercise/read permission alone is neither necessary nor sufficient.                                                       |
| New eligibility and purpose                 | Current requesting-source policy for the same recipient and permitted request purpose, with live floors and genuine prior restrictions preserved.                                                                         |
| Fresh decision/effect and history           | Source issuance command using the governing P12 grant-state mutation boundary; no parallel file-permission engine or app-local grant writer.                                                                              |
| Recipient proof and current access          | Q01/P4/P12. Browser proof and administrative issuance remain separate; every protected read uses the new current authority, not the expired grant.                                                                        |
| Exact bytes, previews and current members   | Q02–Q05/source custody and delivery. Fresh authority cannot select moving latest content, superseded bytes or a replacement original. Qualified new renditions of the same authorized immutable original remain possible. |
| Timing and repeated issuance                | Explicit fresh-access policy, not Q07's number copied to a staff click. No count, cumulative budget, overlap cardinality or start event is invented in this review.                                                       |
| Help and communication                      | Existing source assistance and P17/P6 delivery owners. Received help, grant committed, notification accepted/delivered and file read are separate outcomes.                                                               |
| Retention and disposal                      | Source purpose schedules/custody, not the granting operator. Holds preserve records without giving this recipient ordinary access.                                                                                        |

**Source eligibility, not an impossible old-grant check.** The issuer can
authorize a new act after the ordinary end under the new source policy while
the old grant remains denied. Historical eligibility proves the original
admission/scope, not permission today. The current issuance predicate must
establish that this recipient/purpose can receive new authority. Requiring the
old expired read predicate to pass makes A impossible; simply clearing expiry
to make it pass violates Q07.

**Original scope is the outer boundary.** Each fresh effect independently
intersects the original ordinary scope with current permitted members/actions
and its reviewed scope. Do not use a union of fresh grants or a later member
list as the next starting scope. Equally, choosing a narrower set once does
not automatically impose a permanent broader restriction on all future work;
only the source's actual authority changes can do that. No repeat permission
follows from this distinction.

**Grantor dependency must match the owner.** P12 distinguishes assignment
grants from record-scoped named grants; restricted named grants die on grantor
departure. Its delegated assignable ceiling is live, not a cached exercise
permission. Fresh recipient authority needs the exact compatible type and
ongoing dependency mapping. Do not assume every fresh grant survives a staff
departure, or that every ordinary role change cancels all prior issuances.
Unknown mapping blocks this capability until resolved through the owner.

**Current source serialization.** The server resolves tenant/environment,
actor, intended recipient/revision, request/purpose, original admission,
reviewed exact scope, policy/end and relevant current grant history. At
commit, re-read current authority and relevant revisions under the owning
serialized mutation boundary. Race with cap tightening, revocation, custody
disposition, recipient recovery, staff authority loss and other issuance.
A stale scope cannot be silently broadened; material changes require a
refreshed review. Immediate denial may win without waiting for user review.

**Durable effect and replay.** A prepared review is not an issued grant.
Commit the source grant/effect, required provenance/audit and authorized
secondary-effect intent atomically where owned, or maintain an equivalent
fail-closed recovery invariant. Preserve one source-owned deliberate issuance
identity, bound to its exact tenant/environment/source/request/original-admission
context. Bind the reviewed recipient/revision, scope/actions and policy/timing
terms as its immutable payload or fingerprint; do not derive a replacement
intent merely because that payload changed. Changed payload under the same
intent conflicts; an uncertain retry recovers the original result.
Different transport IDs cannot evade the same business-operation identity.
An explicitly permitted deliberate repetition has a distinct intent even if
its scope matches; a payload hash alone is neither that identity nor authority.

Concurrent genuinely separate issuance intentions also require atomic
evaluation against the adopted repetition/overlap policy and current lineage.
This review does not choose one-active-grant or unlimited grants. Issuance
locks must not be held across a provider call, recipient action or file stream.
Private response replay is reauthorized independently of recovering the
business effect; an unauthorized caller must not receive stored private JSON.

**Truthful terminal and correction behavior.** Before dispatch, canceling the
review creates no grant. After dispatch, reconcile before claiming cancellation.
Committed access has its own current active/ended/revoked conditions; the
historical issuance remains true even if access ends before the response.
Wrong issuance must have a source-authorized revocation/remediation route
before activation. "Undo" must never imply erasing disclosure or audit history.
No fresh action reopens completed document intake or source review.

**Database/privilege integrity.** No particular table layout is selected.
Require same-scope source/request/recipient/policy/original-admission/member
references; durable unique semantic effects and conflict checks; finite
qualified time fields; legal issuance/revocation states; trusted actor/owner/
reason/approval provenance; constrained mutation rights; and protected
delete/hold behavior. Preserve multiple current supporting files. No money
amounts or financial corrections are introduced.

Validate actual SQL grants/column privileges, `USING` and resulting-row
`WITH CHECK`, policy combinations, views/functions/RPCs, definer ownership,
storage and service-key paths. Tenant-safe independent UUIDs alone do not
prove same-request relationships. Omitted `WITH CHECK` can inherit `USING`;
a keyword scan is not a vulnerability proof. Privileged execution after a
generic staff check still needs exact source/admin authorization.
[PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).

**Current delivery and infrastructure.** Keep Q04 exact identity before bytes,
independent original/preview authorization, private cache/response behavior,
new range/conditional/resume checks, inherited per-chunk expiry and feasible
revocation termination. New links or renditions do not themselves grant access.
Old bearer capability possession must not become sufficient authority; a
stable request route may locate current new access only after qualified proof.
Keep provider outcomes separate and no unselected grace or recall guarantee.

## Exact required amendments

These are ratified grooming clauses for later authorized source publication,
not an already-published formal specification.

| ID                                          | Required language                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q08-C01 Eligible ordinary expiry            | Fresh Completed Request Access SHALL require a proved original ordinary completed-view admission that ended by its ordinary timebox and a current permitted request purpose. Unknown historical admission, security revocation, genuine binding shortening, purpose/content-use expiry, disposal or other source prohibitions SHALL NOT be bypassed by a new identifier.                                                                                                                                                                    |
| Q08-C02 Issuing authority                   | The issuer SHALL have the exact current source capability to cause issuance within P12's live administrative scope, assignable ceiling and applicable assurance/SoD. A staff role, help assignment, read permission or service credential SHALL NOT substitute. The compatible grant type and continuing grantor/delegation dependencies SHALL be explicitly mapped and enforced.                                                                                                                                                           |
| Q08-C03 Recipient and proof separation      | The source SHALL prove current eligibility to issue for the same intended recipient/purpose without requiring an unexpired old read grant or an open recipient browser. Every protected use SHALL still require current Q01/P4 proof, compatible native admission and source/P12 authorization. Contact/principal recovery SHALL follow its owner; this command SHALL NOT retarget through an arbitrary email field.                                                                                                                        |
| Q08-C04 Original scope ceiling              | Each fresh scope SHALL be the reviewed intersection of the original ordinary completed-view admission, current eligible own-submission members/actions/context and the new permitted scope. It SHALL NOT derive from access logs, unions of fresh grants or later-added files. A narrower individual grant SHALL NOT silently redefine the original scope or a global restriction.                                                                                                                                                          |
| Q08-C05 Preserve prior truth                | Prior grant states/ends, fulfillment, submission lineage and history SHALL remain preserved. Fresh issuance SHALL NOT reset Q07, reopen intake/correction/review, restore superseded content, grant resharing/membership or clear a source restriction. Qualified temporary representation repair remains a separate operation.                                                                                                                                                                                                             |
| Q08-C06 Complete finite policy              | Before activation, the source SHALL explicitly resolve fresh duration/anchor, applicable earlier ends, any deferred-activation/unused-admission bounds, repeat/cumulative and overlap behavior and exact authority mapping. Unknown policy SHALL deny issuance. Q08 SHALL NOT imply another 30 days, one-only/unlimited repetition, arbitrary staff dates or a new numerical default.                                                                                                                                                       |
| Q08-C07 Meaningful bound review             | Staff SHALL review source-authorized recipient identification, exact scope/actions, qualified timing terms and controlling limits, including any exact end already determinable, before a deliberate grant command. The server SHALL bind those material facts and revalidate them at commit. Material changes require refreshed review; ordinary time advancing under unchanged terms does not. Show the actual end when the selected source rule resolves it; immediate denial SHALL NOT wait for confirmation.                           |
| Q08-C08 Atomic current issuance             | The owning source/P12 mutation boundary SHALL serialize issuance against relevant source, recipient, restriction, issuer, disposition and grant-history changes. Required grant/effect/provenance/audit and authorized secondary-effect intent SHALL commit durably together or through an equivalent fail-closed recovery contract. No parallel grant-state writer or provider call under the source lock is permitted.                                                                                                                    |
| Q08-C09 Semantic idempotency and disclosure | One stable deliberate issuance identity SHALL converge on one effect across clicks, retries and transport IDs. Bind its exact context and immutable reviewed payload; conflicting reuse SHALL fail without mutation rather than generate a new intent. Separately permitted deliberate repetitions MAY have distinct identities even for identical scope and SHALL atomically satisfy the adopted repeat/overlap policy. Recovery SHALL preserve the original effect/end while private replay output requires current disclosure authority. |
| Q08-C10 Independent communications          | Issuance, current access, recipient proof, notification and file delivery SHALL have separate outcomes. Failed/lost delivery SHALL NOT create a grant, change recipient or reset time. Communications SHALL use P17/P6 only when separately authorized; Q08 selects no automatic email/reminder.                                                                                                                                                                                                                                            |
| Q08-C11 Data and role invariants            | The implementation SHALL constrain same-tenant/environment/source/admission/recipient/member relationships, semantic uniqueness, required finite values, legal states and trusted attribution. Actual grants/RLS old-and-new-row behavior, views/RPCs/definer/storage/service paths SHALL prevent forged scope, issuer, approval, end and owner transitions.                                                                                                                                                                                |
| Q08-C12 Current private reads               | Every protected metadata/history/original/preview/full/HEAD/range/conditional/resume/recovery path SHALL require current exact new authority and representation eligibility. Q04/P12 expiry, private caching and feasible revocation termination remain binding; no old URL or provider capability SHALL be sufficient authority.                                                                                                                                                                                                           |
| Q08-C13 Small explicit staff UX             | Use existing source context and shared Core controls for one meaningful review plus Grant read access. Show only review metadata the issuer may inspect; do not require original-content reading as a proxy for administration. No generic sharing defaults, mandatory essay, arbitrary recipient picker, repeated generic confirmation, bulk issuance or new portal is implied.                                                                                                                                                            |
| Q08-C14 Truthful command states             | Distinguish not submitted, pending, committed, not committed, outcome unknown and current blocked/ended access. Do not optimistically announce a grant or message. Closing a dispatched UI SHALL NOT imply cancellation; recovery SHALL reconcile the same operation before proposing a new decision.                                                                                                                                                                                                                                       |
| Q08-C15 Accessible coherent journey         | Preserve shared Base UI/base-maia, semantics, keyboard/focus, touch, zoom/reflow, speech/AT, localization and actual deadline precision. Display material errors/status without repetition or private leakage. Reauthentication SHALL preserve safe context without unrequested download, broader enrollment or a private offline archive.                                                                                                                                                                                                  |
| Q08-C16 Independent retention               | Fresh access SHALL NOT extend retention, release holds, reverse disposal, reconstruct expired-content authority, change independent source uses or promise recall of received copies. Retained bytes and newly generated renditions SHALL NOT supply recipient permission.                                                                                                                                                                                                                                                                  |
| Q08-C17 Accountable recipient handoff       | Every enabled profile SHALL have a real source-qualified neutral help and entry/handoff route. Help, email threading, sign-in and resend SHALL NOT authorize issuance. No private details, approval promise or external attachment workaround is allowed where the current caller lacks disclosure authority.                                                                                                                                                                                                                               |
| Q08-C18 Bounded operation                   | Issuance and review SHALL use scoped bounded queries/pages and the existing grant/worker mechanisms, with measured policy/repetition/egress budgets. No unbounded graph/history traversal, sweep-based correctness, N+1 provider review or global cross-tenant lock is justified by this choice.                                                                                                                                                                                                                                            |
| Q08-C19 Durable minimal history             | Preserve attributable issuance intent/effect, original linkage, reviewed scope, policy/end, current authority changes and separate communication outcomes under owned audit rules. Diagnostics SHALL be minimized; sensitive free text, tokens, filenames/content and recipient addresses SHALL NOT spill into general telemetry.                                                                                                                                                                                                           |
| Q08-C20 Prospective qualified rollout       | Admit only explicitly qualified source cohorts through compatible owner contracts and reader/writer versions. No grant backfill from generic tasks/emails/old URLs. Restore must reconcile adverse/current authority before serving; kill/roll-forward must preserve source history and deny wider fallback or reopened intake.                                                                                                                                                                                                             |
| Q08-C21 Correction and revocation           | The source SHALL provide a currently authorized way to revoke or correct an erroneous fresh issuance, preserving the historical act and inherited active-delivery fences. Revocation SHALL NOT imply recall or deletion of evidence, and technical retry SHALL NOT undo it.                                                                                                                                                                                                                                                                 |
| Q08-C22 Proof and ownership                 | C01–C21 SHALL be traceable into canonical owner sources, derived OpenSpec, later authorized tasks/tickets and release proof. Activation requires real-role/concurrency/provider/browser/accessibility and handoff evidence. Residual monitoring SHALL have a named signal, threshold, owner and response; public benchmarks or mock tests SHALL NOT stand in for that proof.                                                                                                                                                                |

## Category-by-category adversarial review

### 1. Problem validity, necessity, and alternatives

**Material concern: yes. Severity: medium. Likelihood: plausible.**
A new issuance capability may duplicate a qualified existing source route or
become an open-ended storage service. Q08's known purpose is legitimate
post-expiry readback; actual demand is unmeasured. B—help without this
capability—is simpler but may not fulfill the need in this request.
**Effect: narrows A.** Keep exact source-purpose scope and qualification
rather than assuming universal renewability. **Exact change: C01/C06/C17;
proof P01/P25/P28.**

### 2. Brittleness

**Material concern: yes. Severity: high. Likelihood: plausible.**
A generic Expired badge, cached staff permission or current email can substitute
for proven prior admission and current eligibility. It works only while nothing
changes. **Effect: changes the authorization contract, keeps A.** Use original
source evidence and current role/recipient/restriction checks at commit.
**Exact change: C01–C04/C07; proof P02/P03/P06/P07.**

### 3. Technical debt

**Material concern: yes. Severity: high. Likelihood: plausible.**
A File Manager-local grant table/permission engine or copied receipt-resend
handler would diverge from P12 and protected-action owners. Core's boundaries
require shared owned logic. **Effect: constrains implementation.** Reconcile
the native source command with the existing grant-state boundary, with distinct
delivery. **Exact change: C02/C08/C10/C18; proof P03/P10/P20/P24.**

### 4. Edge cases

**Material concern: yes. Severity: high. Likelihood: expected classes,
frequency unknown.** A session alone expired, a recipient changed contact,
only some originals remain eligible, or a grant expires before a late response.
Treating all as Renew creates wrong authority or false success.
**Effect: narrows eligibility and recovery.** Distinguish those states and
never substitute historical bytes or another recipient.
**Exact change: C01/C03/C04/C14/C17; proof P04/P07/P16/P18/P19.**

### 5. Footguns

**Material concern: yes. Severity: high. Likelihood: plausible.**
Generic Share/Viewer defaults may include resharing, a staff email picker may
retarget the request, and repeated clicks may create periods. A disabled button
is not a server invariant. **Effect: changes action design.** Show exact reads,
fixed source recipient and a bound command; deny conflicting retries.
**Exact change: C04/C07/C09/C13; proof P05/P08/P09/P17.**

### 6. Tenant safety

**Material concern: yes. Severity: critical for sensitive disclosure.
Likelihood: unmeasured but plausible without exact binding.**
Support links, shared mailboxes or copied IDs can mix tenant/environment/request
contexts. A new grant might restore broader site access. P12 and the original
request-only contract forbid that expansion. **Effect: limits A to exact
context.** Prove same-scope references and every administrative/disclosure path.
**Exact change: C02/C03/C04/C11/C12; proof P03/P06/P12/P13/P15.**

### 7. Database, RLS, and authorization safety

**Material concern: yes. Severity: critical for authorization bypass.
Likelihood: plausible; effective implementation unproved.**
A readable row could be updated into another recipient, later end or forged
issuer; a privileged wrapper can bypass ordinary RLS. **Effect: requires
source/schema/role proof.** Trusted provenance, exact relationships, semantic
uniqueness, controlled transitions and actual old/new-row policies must agree.
No money precision change is needed. **Exact change: C08/C09/C11;
proof P10/P12/P13/P14.**

### 8. Overengineering

**Material concern: yes. Severity: medium. Likelihood: plausible.**
A small deliberate act can expand into a new portal, renewal workflow builder,
two-person approval for everyone, mandatory essay or unrestricted date picker.
None follows from the choice. **Effect: narrows solution.** Use existing
source context and one meaningful action, honoring only applicable owner
requirements. **Exact change: C06/C13/C17/C18; proof P01/P17/P25.**

### 9. UX/UI and user friction

**Material concern: yes. Severity: high for wrong-recipient decisions;
medium for avoidable friction. Likelihood: plausible.**
Unclear role labels, stale review, repeated confirmation, tiny controls,
lost focus and inaccurate result copy undermine safe use. International names,
RTL and mobile cannot be reduced to email-string identity. **Effect: changes
journey details.** Minimal disambiguating review, current exact end, actionable
states and actual accessibility testing. **Exact change: C07/C13–C15/C17;
proof P17–P19/P25.**

### 10. Source of truth, ownership, and domain invariants

**Material concern: yes. Severity: high. Likelihood: plausible.**
Help approval, a new link or an email delivered event can be mistaken for the
grant. Successive grants can expand the source scope. **Effect: establishes
one authoritative issuance act and original ceiling.** Preserve source
completion, prior grants and current live rules. **Exact change:
C02/C04/C05/C08/C10/C19; proof P05/P10/P11/P20/P26.**

### 11. Hidden coupling

**Material concern: yes. Severity: high. Likelihood: plausible.**
Support reopening might reopen intake; sign-in or resend might create a new
period; staff reading a record might be treated as granting authority.
Current code offers nearby but different mechanisms. **Effect: separates
owners and effects.** Keep request state, proof, grant, communication and
custody independent. **Exact change: C02/C03/C05/C10/C16/C17;
proof P04/P16/P20/P21/P25.**

### 12. Failure modes

**Material concern: yes. Severity: high. Likelihood: expected distributed
failure classes.** Grant commit can precede a lost response or failed email;
an audit/policy lookup can fail before issuance. Guessing failure and issuing
again creates duplicate authority. **Effect: requires durable reconciliation.**
Recover the same effect, preserve committed truth and fail unknown eligibility
safely. **Exact change: C08–C10/C14/C19; proof P08/P09/P11/P20/P26.**

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: yes. Severity: high. Likelihood: plausible under normal
concurrent use.** Two staff actions, a revocation or changed scope can race;
different request keys can bypass a repetition limit. **Effect: requires
authoritative ordering and a complete finite policy.** Serialize relevant
state, distinguish retry from deliberate new intent and leave no implied
duration/cardinality. **Exact change: C06–C09/C21;
proof P06/P08/P09/P10/P22/P27.**

### 14. Data integrity risks

**Material concern: yes. Severity: high. Likelihood: plausible.**
Forged/weak historical linkage, mutable original scopes, duplicate effects
or a missing policy can create unverifiable access. Cascading deletion may
erase why disclosure occurred. **Effect: fixes evidence/invariants.** Bind
original admission, immutable effect/provenance and legal revocation history;
disposition still follows its owner. **Exact change: C01/C04/C08/C11/C19;
proof P02/P05/P10/P13/P26.**

### 15. Security and privacy risks

**Material concern: yes. Severity: high to critical for sensitive material.
Likelihood: unmeasured.** An expired page or grant-review list can leak private
facts, old tokens can become sufficient again, or successful issuance can
bypass read authorization. **Effect: limits both staff metadata and recipient
reads.** Apply current precise disclosure, private delivery and minimized
diagnostics; preserve non-recallable local-copy truth.
**Exact change: C03/C07/C11/C12/C16/C17/C19; proof P12/P15/P16/P21/P26.**

### 16. Scalability and performance risks

**Material concern: yes. Severity: medium. Likelihood: workload-dependent.**
Fetching every file, unbounded grant-history chains or global locks makes
routine help slow and repeated grants expensive. No workload/SLO was measured.
**Effect: bounds implementation, no invented capacity claim.** Use original
scope evidence, indexed scoped checks, bounded pages and existing grant/egress
budgets. **Exact change: C08/C18; proof P10/P23.**

### 17. Operational burden

**Material concern: yes. Severity: medium. Likelihood: plausible.**
Staff can become the manual fix for every expired session, or an approved
grant may have no working recipient handoff. **Effect: requires useful owned
assistance and appropriate routing.** Resolve technical entry separately;
prove the actual source help/entry path and later repetition policy.
**Exact change: C06/C14/C17/C22; proof P04/P19/P25/P28.**

### 18. Observability and auditability gaps

**Material concern: yes. Severity: high. Likelihood: plausible.**
Generic Updated/Email sent logs cannot explain who authorized which new scope,
why, under which policy, or whether a retry duplicated it. Free text can leak
sensitive context. **Effect: requires distinct durable business history and
minimal diagnostics.** Record the exact decision and independent outcomes.
**Exact change: C08/C09/C10/C19/C22; proof P11/P20/P26/P28.**

### 19. Dependency and integration risks

**Material concern: yes. Severity: high. Likelihood: plausible.**
Provider resends, signed URLs, caches or generic collaboration permissions
may imply broader rights than Core grants. Authentication expiry is not source
expiry. **Effect: preserves Core ownership.** Qualify actual provider/route
semantics and recover delivery separately without changing authority.
**Exact change: C03/C10/C12/C17/C20; proof P15/P16/P20/P24.**

### 20. Migration, rollout, and upgrade risks

**Material concern: yes. Severity: high. Likelihood: plausible if retrofitted
globally.** Generic expired tasks could become eligible grants, old writers
could mutate end fields, or restore could resurrect revoked decisions.
**Effect: scopes rollout.** Require explicit prospective source adoption,
original evidence, compatible writers/readers and adverse-state reconciliation.
**Exact change: C01/C11/C20/C21; proof P02/P13/P24/P27.**

### 21. Testability, traceability, and proof

**Material concern: yes. Severity: high. Likelihood: likely if mocks or a
polished dialog are treated as qualification.** Source contracts, admin rights,
real roles, race behavior and recipient UX may disagree. **Effect: requires
falsifiable evidence.** Trace the exact clauses through source and derived
specification, then prove outcomes with real roles/providers/browsers and
representative users. **Exact change: C22 and P01–P28.**

### 22. Other development hazards

**Material concern: no additional independent concern found.**
Checked financial fact/precision impact, new licenses/dependencies, general
Drive scope, new role/account enrollment, publication authority and recall
claims. Q08 selects no money mutation or provider installation; scope,
rollout/restore and unsupported renewal assumptions are already covered above.
This bounded review does not certify that an unbuilt implementation has no
other defects.

## Proof required before activation

These are future acceptance groups, not passed native-feature tests.

| ID      | Required observable proof                                                                                                                                                                                                                                                                                                                                                                                        |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q08-P01 | Only the explicitly adopted ordinary-expiry capability is available. B and unrelated specialist rights remain distinct; no implicit renewal, new portal, bulk action or notification appears.                                                                                                                                                                                                                    |
| Q08-P02 | Prove original ordinary admission/scope and actual expiry. Unknown admission, disposed/expired content, security revocation and genuine binding shortening cannot enter through a generic Expired status.                                                                                                                                                                                                        |
| Q08-P03 | Issuer read access, staff role and ticket assignment alone cannot grant. Live exact administrative scope/ceiling, native context, assurance and applicable SoD/impersonation rules govern, including multi-role/self cases.                                                                                                                                                                                      |
| Q08-P04 | Issuance can be valid with the old grant expired and recipient offline, while every subsequent recipient read still requires qualified confirmation/current authority. Session/link/preview repair does not create a grant.                                                                                                                                                                                      |
| Q08-P05 | Every fresh scope stays within the original ordinary admission and current exact eligibility. Never-viewed but originally admitted members are not excluded for lack of download telemetry. Later files, another recipient, superseded bytes, new purpose, resharing and unions of fresh scopes are rejected. A narrower prior fresh scope alone does not fabricate a global restriction.                        |
| Q08-P06 | Issuer loss of authority, recipient/source revision change, restriction and disposition race issuance in both orders. Enforce current owner dependencies after issuance, including applicable grantor-departure rules.                                                                                                                                                                                           |
| Q08-P07 | Governed same-recipient contact recovery works without arbitrary retargeting. Same email/different principal, tenant or environment cannot inherit original scope; identity uncertainty denies appropriately.                                                                                                                                                                                                    |
| Q08-P08 | Duplicate click, retry, lost response, delayed job and different transport IDs for one semantic intent converge on one effect/end. Same identity with changed subject/scope/policy payload conflicts without mutation.                                                                                                                                                                                           |
| Q08-P09 | Concurrent separate intentions atomically satisfy the adopted repeat/overlap policy. No reset, new operation ID or reordered event bypasses it; no unselected cardinality/default is silently assumed.                                                                                                                                                                                                           |
| Q08-P10 | Source/P12 serialized mutation, exact scoped references, grant/effect/history/audit and authorized effect intent are consistent after commit/rollback/crash, including competing insertions when no fresh row exists yet; locking only a new row is insufficient proof. No provider wait holds the source lock.                                                                                                  |
| Q08-P11 | Reconciliation preserves a committed grant if response/delivery failed, while replay output uses current disclosure permission. Closing after dispatch never falsely reports cancellation.                                                                                                                                                                                                                       |
| Q08-P12 | Real anon/recipient/staff/delegated/service roles and all route/RPC/storage paths deny forbidden issuance/disclosure, forged actor/tenant/end/approval and unauthorized old-to-new-row transformations.                                                                                                                                                                                                          |
| Q08-P13 | PK/FK/typed-scope relationships, uniqueness/conflict checks, finite values, legal states, column grants, RLS USING/new-row behavior and function ownership preserve invariants; delete/hold operations do not erase required evidence.                                                                                                                                                                           |
| Q08-P14 | Missing fresh timing/anchor/repeat/overlap/type mapping keeps issuance unavailable. Supported precision, clock waiting/skew, exact before/at/after end and subsequent tightening follow the selected future policy, with no automatic Q07 reuse.                                                                                                                                                                 |
| Q08-P15 | Current metadata/history/original/preview/full/HEAD/range/conditional/resume/recovery enforcement and private cache/browser/CDN behavior remain correct. Old credentials cannot gain sufficient authority merely because a fresh grant exists.                                                                                                                                                                   |
| Q08-P16 | Original/preview/temporary recovery stay independent; valid new renditions preserve exact original identity. Slow streams obey inherited expiry/revocation behavior without false recall or saved-file claims.                                                                                                                                                                                                   |
| Q08-P17 | Staff review presents only permitted, sufficient recipient/scope/action/timing terms and any known end; changed material terms refresh review. Under an event-relative policy chosen later, ordinary time progression does not force endless review, and the resolved actual end is shown accurately. No original-file reading, repeated confirmation or arbitrary recipient/date picker is required by default. |
| Q08-P18 | Staff and recipient keyboard/speech/AT/touch/mobile/zoom/RTL/long-name journeys work with stable focus and clear names/status. Each relevant timing/authentication requirement is assessed; automatic checks alone do not pass.                                                                                                                                                                                  |
| Q08-P19 | Not submitted, pending, unknown, committed, blocked/ended and notification-failed outcomes are understandable and truthful. Permission failures are not falsely shown as recipient validation errors or success.                                                                                                                                                                                                 |
| Q08-P20 | Where communication is separately authorized, its retry/recipient/protected-action/outbox rules preserve the same issuance and current authority. Issued, notified, entered, read and downloaded are not conflated.                                                                                                                                                                                              |
| Q08-P21 | Access issuance leaves source completion, original deadlines, correction lineage, retention/holds/disposal, independent uses and already-received copies correct. No expiry/retention bypass by copying into another request.                                                                                                                                                                                    |
| Q08-P22 | Required earlier bounds and authoritative time remain enforced during long waits, delayed work and current-state changes. A prepared or stale review never freezes a permission snapshot into lasting authority.                                                                                                                                                                                                 |
| Q08-P23 | Production-shaped tenant skew, large eligible member sets, many prior effects and concurrent staff/reads remain within declared page/query/issuance/egress budgets at boundary and excess; no unbounded provider or history fan-out.                                                                                                                                                                             |
| Q08-P24 | Prospective cohorts, mixed versions, feature-disable, backup/cache restore and roll-forward preserve current adverse state and original evidence; no broad fallback or intake reopening.                                                                                                                                                                                                                         |
| Q08-P25 | Actual governed help and recipient entry/handoff work; a staff-only record is not completion. Help cannot reveal unauthorized request existence, promise approval or route to raw attachments as a bypass.                                                                                                                                                                                                       |
| Q08-P26 | Durable source/security evidence attributes the exact act and independent outcomes; diagnostics remain minimized. Staff or recipients cannot infer restricted metadata through history, counts, errors or replay.                                                                                                                                                                                                |
| Q08-P27 | Erroneous fresh issuance can be revoked/remediated by the proper current authority, with current cache/stream fences and preserved history. Retry/restore cannot undo revocation; no promise to recall emitted bytes.                                                                                                                                                                                            |
| Q08-P28 | Representative users understand the authority change and actual end, can recover safely from uncertain results, and can find help. Owners respond to residual signals; research reports sample/coverage limits without invented productivity or satisfaction gains.                                                                                                                                              |

## Synthesis and sequencing

1. **Before ratification:** adopt the corrected capability boundary and all
   C01–C22/P01–P28 amendments. Resolve the central contradictions now:
   administrative versus read authority; original scope versus accumulated
   scope; fresh eligibility versus old expired read permission; committed
   issuance versus notification. These are not issues to leave to monitoring.
2. **At authorized source specification:** reconcile exact native P4/P12
   issuance/type/dependency mapping, original active-request authority and
   source constraints, then fresh finite timing/anchor and repetition/overlap
   behavior. Those are explicit remaining policy gates, not defaults that an
   engineer may silently choose. Maintain canonical owner sources and their
   generated OpenSpec projections together.
3. **In design/implementation:** use the existing owning mutation boundary,
   original admission evidence, semantic effect identity, guarded review,
   minimal audit and qualified help/delivery. Enforce real-role constraints
   and concurrency before adding polished controls. Keep the existing
   accessible shared request UI and one deliberate action.
4. **Before activation:** prove the native source/DB/provider/browser outcomes,
   recipient handoff and accessibility; qualify prospective cohorts,
   compatibility, correction/revocation, kill switch and restore/roll-forward.
   Missing qualification denies the affected capability, not unrelated
   independent source work.
5. **After activation:** use the controls below for residual operating failures
   and real need assessment. They do not authorize auto-renewal or replace
   required access safety, usable handoff or proof.

The permanent solution is one source-qualified permission-changing act inside
the existing request journey. It should be small for the user and precise at
the authority boundary.

## Residual operational controls

Each role owner must be assigned before activation. The thresholds below are
intervention triggers, not acceptable leakage rates or invented performance SLOs.

| Signal                                                                         | Threshold                                          | Owner                                              | Required response                                                                                                                  |
| ------------------------------------------------------------------------------ | -------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Grant exceeds issuer ceiling/original scope or bypasses a binding prohibition  | Any confirmed issuance                             | Source permission/security owner                   | Disable affected issuance, revoke/remediate under current authority, assess disclosures and requalify.                             |
| Same semantic intent produces multiple effects or conflicting replay           | Any confirmed instance                             | Source command owner                               | Stop offending path, reconcile durable lineage and required effects; never silently delete issuance history.                       |
| Current issuer/delegation dependency is not enforced                           | Any failed qualified canary or confirmed mismatch  | P12/identity owner                                 | Fence affected grants/issuance according to the owner rule and requalify the dependency path.                                      |
| Private delivery or cache accepts ended/wrong-context authority                | Any confirmed disclosure or failed contract canary | File-delivery/security on-call                     | Deny affected path, preserve minimized evidence and repair before re-enable.                                                       |
| Issuance outcome cannot reconcile within its qualified recovery contract       | First breach of that declared contract             | Source operations owner                            | Investigate exact effect identity; preserve unknown state without duplicate issuance or false cancellation.                        |
| UI reports wrong recipient/scope/end or notified/read success without evidence | Any reproducible mismatch                          | Shared request UX/engineering owner                | Correct the projection/command binding and verify stale/unknown/locale cases.                                                      |
| Required help, entry or accessible granting journey is blocked                 | Any reproducible supported-user barrier            | Request-source product/accessibility owner         | Repair the journey or apply an explicitly source-authorized accommodation; no improvised grant bypass.                             |
| Repeated fresh requests reveal an unmet ordinary purpose or policy workaround  | First validated case requiring a policy decision   | Phase 29 product owner and requesting-source owner | Examine original active/completed policy and current need; make an explicit prospective decision, not silent cumulative expansion. |

## Recorded outcome and remaining proof

Q08 A and its complete required amendment package are ratified by Conrad,
2026-10-20. The reviewed disposition was **Accept with required amendments**;
the exact corrected decision, C01–C22, P01–P28, reviewed lifecycle/UX and all
eight operating controls are now adopted grooming intent. No fresh duration,
anchor, repeat count, overlap cardinality, notification or Q09 choice is inferred.

The implementation remains unqualified. Adjacent source and test evidence is
bounded in the runtime note; it cannot establish native real-role authorization,
concurrency, provider or browser/AT behavior. No product code, schema,
dependency, credential, permission or provider configuration was changed.
Formal source/OpenSpec publication awaits `/to-prd`; tickets await `/to-issues`.

## Founder ratification — 2026-10-20

Conrad instructed: “Yes, ratify this with the required amendments. Record it
and move to the next question in this Phase 29 grill-with-docs session, with
the research, practical options, and your recommendation.”

This adopts the exact corrected decision, Q08-C01–C22, Q08-P01–P28,
reviewed lifecycle/UX and all eight operational controls. Recording changed
status and trace only; the substantive decision, clauses, proof and controls
remain preserved. Fresh timing/repetition, active-request policy, notifications,
formal publication, implementation and activation are not inferred.
