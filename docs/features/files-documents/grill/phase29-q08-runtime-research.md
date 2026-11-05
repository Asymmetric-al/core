# Phase29 Q08 research — fresh read authority after ordinary completed-access expiry

Read-only research, 20 October 2026. Checkout `/home/conrad/code/core`, last verified HEAD `3d85897ebf1515008ef5c676b1c58a15422fb9ab`. Parent reports Q07 and its full amendments ratified and is updating the canonical records. No Q08 answer is selected by this note.

No product/schema/dependency/provider/auth changes, tests, credentials, private rows or file-byte reads. Only this research note was written. The evidence below concerns scoped current source inspection and accepted owner intent, not deployed behavior.

## Recommendation

The narrow next question can be:

> **After an ordinary completed request's read window expires, may appropriately authorized staff deliberately approve fresh, finite read-only access for that same confirmed recipient, or should this completed-request surface remain closed and direct any further need through the source's existing governed help process?**

Recommend **allowing the explicit source-authorized fresh-access path**, subject to its current purpose and constraints, with no automatic approval, original-grant extension or reopening of intake. This is a product recommendation, not a claim that the current runtime already supports it or that every request should be renewable.

The practical reason is that an accountable, finite source decision can address a legitimate late need without inviting informal database edits, raw attachment emails or task reopening. Those workarounds are risks, not measured current behavior or invented ministry demand. A source that lacks authority to grant fresh access must still deny it.

The strongest simpler alternative is **no fresh access through the ordinary completed-request feature**. Staff can explain the outcome or use another already-qualified source process where one actually exists. That keeps the surface smaller and its expiry promise easier to administer, but “contact us” must not conceal an unsupported retrieval promise.

Do not bundle a new duration, self-service request workflow, new notification, automatic reminder, staff-wide power or new portal into this choice. A positive choice still needs a qualified finite new authority policy before activation. A negative choice must not invent a separate delivery channel merely to avoid the decision.

## What is already settled versus open

| Settled through Q01–Q07                                                                                                                                               | Still open for this question or its follow-ups                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| An expired/revoked grant cannot revive through login, resend, repair, a late callback or cap removal. Its original completion evidence and resolved end remain fixed. | Whether the source should admit a distinct deliberate fresh authority after ordinary scheduled expiry.                                                                           |
| The ordinary completed state remains business read-only.                                                                                                              | Who may cause fresh access, under which source administrative capability, and whether a separate approval is required for a given sensitivity class.                             |
| Q01 recipient proof/current source authority applies; no donor/staff enrollment workaround.                                                                           | Finite fresh-access duration/anchor, repetition limits, exact scope selection and any exceptional hard-stop policy.                                                              |
| Current own files and safe Q05 history are the ordinary readback ceiling; superseded correction predecessors remain excluded.                                         | Whether the fresh scope is exactly the earlier permitted set or a currently narrowed subset. It must not silently broaden to new members, predecessors or independent artifacts. |
| Preview/original actions remain separately qualified, and all private paths obey current source restrictions.                                                         | Any initiated-request UI, staff notification or outward delivery ceremony for fresh access. None is chosen merely by saying staff may authorize it.                              |
| Help cannot itself grant access, reopen intake, email private attachments or promise renewal.                                                                         | The exact accountable help route and permitted neutral end-state projection for each enabled native source profile.                                                              |

`docs/features/files-documents/docs/adr/0007-fixed-completed-request-access-end.md:19–63` records the fixed end, later binding tightening, current restrictions, independent custody and no incidental renewal. Its status text was still being synchronized during this research; parent confirmation establishes ratification, not a new selection inferred by this agent.

Q01 explicitly separates mailbox proof, source authority and enrollment (`0001-confirmed-recipient-private-document-requests.md:25–56,66–83`). A renewed browser session or resent identity message cannot answer Q08.

## Actual runtime mechanisms

### No qualified native reissuance command established

Scoped searches across `packages/api/src`, `packages/auth`, `packages/database` and `supabase/migrations` for reissuance/renewal/access-grant/invitation terms did not establish a native private-request fresh-access command or data model. Searches for the P12 named-grant/permission-change and Phase21 collaboration-invitation relation names likewise found no implementation in those roots.

This is bounded absence evidence. It does not prove no equivalent mechanism exists elsewhere, and no live schema was queried. Neither polished source contracts nor a matching helper name proves that this lane works.

### Eve approvals: useful exact action and locked decision, different product

`supabase/migrations/20260718015747_eve_approval_budget_policy.sql` provides:

- A tenant/profile permission grant for a **closed pair** of Eve permissions (`57–65`).
- A distinct approval row with exact action/target, requesting and deciding profiles, reason, expiry and used timestamp (`68–82`).
- A request function deriving a new approval UUID and inserting its record plus audit (`496–535`).
- A decision function checking current dedicated permission, locking the exact tenant/approval row, rejecting stale/nonpending approval, then recording the decision and audit (`539–584`).
- Consumption matched by tenant/action/target, approved status, unused state and unexpired time under a row lock (`394–400`).
- Revoked browser function execution and explicitly granted service execution (`657–670`).

`packages/api/src/eve/approval-budget/control.ts:124–140` calls the request function with server-derived actor parameters. `:142–174` checks the approval's tenant and requesting-profile ownership before the decision RPC. The actor mapping is at `:16–35`.

Useful precedent: exact decision identity, current actor/tenant binding, finite validity, terminal decision, lock/CAS discipline and durable audit. Reuse must preserve each source's real permission boundary.

Limits:

- This is an agent action/budget approval, not a private-document recipient grant.
- An action approval is not an invitation, identity proof, file read, old-request extension or new member assignment.
- The inspected request function creates a UUID per invocation and has no semantic idempotency argument. It is therefore not a complete replay-safe fresh-authority template; inventing another UUID on an uncertain retry can create another decision.
- The NOW checks retain transaction-start semantics. Q07's qualified clock/lock-wait requirements still apply.
- The existing mocked control tests from Q07 were not rerun and do not prove SQL authorization, race behavior or new access issuance.

### Auth callback: session exchange and safe redirect, not new authority

`packages/api/src/auth/callback.ts:6–17,28–59` exchanges a PKCE code, obtains the user/profile role and redirects. It applies private cache headers; role-mapped home routing can supersede the supplied safe next path. This is useful shared authentication infrastructure, but it does not issue a native document grant or guarantee exact-request continuation as currently written.

No production calls to Supabase `signInWithOtp`, `verifyOtp`, `inviteUserByEmail`, `generateLink`, `resetPasswordForEmail` or `auth.resend` surfaced in the scoped `apps`/`packages` TypeScript search. This does not disprove shared provider/session capabilities; it prevents reporting a qualified native reissue/confirmation journey merely because the SDK supports one.

The donor forgot-password screen explicitly says recovery is not enabled and offers a login link (`apps/donor/app/(auth)/forgot-password/page.tsx:7–19`). Its “Contact support” text does not establish a reachable, source-qualified help workflow.

### Support has real routing/recovery, not document-release authority

Current Support Hub routes require authenticated staff/admin/super-admin and bind tenant context (`packages/api/src/admin/support-hub/route-helpers.ts:31–74`). That is a staff processing surface, not an external recipient help endpoint or a capability to widen document access.

`packages/api/src/admin/support-hub/inbound-router.ts:40–104` routes a pre-resolved tenant email to an inbox and returns a conversation/message outcome. `adapter/supabase.ts:1305–1375` creates or threads the conversation and inserts the received message.

Thread correlation uses email headers or normalized sender/subject (`adapter/supabase.ts:1383–1421`). These facts can route staff work, but do not prove the sender's principal, current mailbox control, ownership of a request or entitlement to an original. Existing sender labels and matching email strings cannot become Q01 authority.

The adapter **reopens a resolved conversation on an inbound message** (`:644–662`). That is communication lifecycle behavior, not permission to reopen a completed document requirement, renew a grant or make another upload eligible.

`packages/api/src/workflows/adapters/inbound-email.ts:303–371` has a useful recovery mechanism: return an existing routed result, or find the tenant/inbound-message bridge after a lost write; lookup errors fail instead of being treated as absence and blindly creating a duplicate. This is useful recovery discipline. It is not atomic fresh-access issuance or proof of all concurrency/idempotency behavior.

The broader inbound route configuration supplies tenant/inbox controls and routing review (`supabase/migrations/20260611183000_support_inbound_routes.sql:8–33,38–55,69–72`). No provider routing configuration or real responder availability was inspected. “Existing help” must therefore mean the actual source-qualified lane selected for the enabled cohort, not a presumed email address or broad Support role.

### Resending another source's document is not granting access

`packages/api/src/admin/contribution-operations/action-handlers/resend-receipt.ts:17–60` verifies the contribution/staged-gift relationship and expected revision, invokes its own receipt-delivery dependency and records the provider/audit result. This is a financial receipt action with its own source contract, not a general grant-renewal endpoint.

Its useful lesson is exact source ownership and a named action. Reusing it to send arbitrary private originals, bypass completed-request expiry or choose a fresh recipient would change its meaning and violate the current boundaries.

## Source contracts that constrain a fresh-access choice

These are intended owner requirements, not confirmed runtime tables or deployed commands.

1. **Administrative power is distinct from exercise access.** P12 states the administrator's live scope and assignable ceiling determine what they may grant; possessing a capability is not itself authority to administer it (`docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1670–1672`). “Staff can read this file” must not imply “staff can grant anyone read access.”
2. **Separate widening, revocation and safe-state inspection.** P12's Phase21 integration keeps access widening/narrowing, invitation inspection, participation and notification powers independent (`:2361–2391`). Those exact Phase21 membership semantics do not automatically apply to a request-only external recipient.
3. **Delivery is a separate effect.** Guided invitation/grant flows re-prove each command independently; their records keep separate identity/evidence, and invitation delivery is an outbox effect (`:2393–2398`). A successful resend or received email grants nothing by itself.
4. **Current checks and no resurrection.** Exact principal/source/version/purpose/current capability are re-resolved for reissue/revoke and queued work; semantic idempotency/CAS and immediate fences preserve prior expired/revoked states (`:2400–2417`).
5. **Own identity and exact source scope.** `docs/adr/0113-own-identity-claim-bounded-expense-collaboration.md:95–105` separates one-time invitation from the exact independently revocable assignment. `:170–183` requires current private delivery, deny-first revocation, immutable provenance and short transactional source checks. This is a useful principle, not permission to turn a document recipient into an expense collaborator.
6. **A new intentional effect differs from retry.** `docs/prds/workflow-studio/03-runtime-and-recovery.md:45–51` requires permanent semantic identity across tenant/environment/source/purpose/recipient and deliberate repetition, with conflicting reuse blocked. `:15` preserves completed outcomes and uses linked remediation for later invalidation. A generic “reopen completed task” is not the fresh read-access mechanism.

## Smallest practical decision shape

### A — Permit deliberate fresh read access after ordinary expiry

An appropriately authorized source actor can approve a **new finite read-only authority**, for the same currently confirmed recipient and a bounded exact scope, when the source still permits that purpose. Preserve the old end/effect and link the new authority to the original request and the reason for its deliberate issuance.

“New” means a distinct authoritative decision and lifecycle, not necessarily a new page, account, login system, table or public URL. An existing bookmark may locate the request, but old token possession does not become the new authority. Current qualified proof can be reused only under Q01's exact recipient/revision/purpose/freshness rules; this choice does not require an unnecessary new email challenge on every view.

The ordinary request stays complete. No upload/correction, review-set change, acceptance reversal, superseded-file access or broader application approval is implied.

The scope should be **same or narrower than the currently source-permitted part of the previously admitted completed-view scope**. Retained older predecessors, later unrelated attachments, additional people or a changed recipient address must not enter through “renew.” A changed recipient/purpose or a genuine new evidence task needs its own source flow.

### B — Keep this completed-request surface closed after expiry

Do not add a fresh-access command for this ordinary lane. Use neutral ended/help handling. Staff may explain the actual source result or invoke another already-qualified source process within their authority, where it exists.

This is operationally smaller and makes expiry final for this surface. It does not mean data deletion, refusal of independently authorized rights or a promise that the same content will be sent by email. If another safe source retrieval path does not exist, say so; help cannot manufacture it.

### What must not masquerade as a third option

- Extend the expired record's `expires_at`, clear its revocation or update its completion time.
- Resend the old invitation and assume that creates a new entitlement.
- Issue a new provider signed URL while the source grant remains ended.
- Reopen the completed task to get the same UI buttons back.
- Automatically grant another period when the recipient clicks help.
- Let staff choose arbitrary audience/files/permissions through a generic sharing dialog.

## Essential distinctions if A is selected

**Ordinary scheduled expiry versus a substantive prohibition.** A fresh source-authorized period can be coherent after the ordinary completed-window end. It cannot bypass an independent legal/purpose/classification limit, revoked recipient relationship, withdrawal, principal mismatch or other current veto. Passing time alone does not prove current need or current authority. Explicitly ending a grant and independently allowing later new authority are different facts.

**Fresh grant versus correction of a missing projection.** If the original valid completion/access fact already existed and only a derived view was lost, repair must recover its original proved end. It is not a new need and must not add time. Conversely, deliberately authorizing new access requires its own decision identity, not disguised repair.

**New issuance versus repeated delivery.** A transport timeout must reconcile the same new source effect; it must not mint another grant. Deliberate further issuance is a separate source choice, bounded against abuse and linked to prior decisions. No maximum count or new period is selected here.

**Requesting versus deciding.** A recipient or Support agent may describe a need through a permitted help lane; that alone cannot grant access. A staff role label or current file-read permission cannot replace the source's grant-administration authority. Avoid silently adopting “two-person approval everywhere” or “any staff may renew” without the owner policy.

**Current assurance versus repeated enrollment.** A lost mailbox or changed principal is not a simple renewal. Use Q01/P4 source-owned recovery and exact re-binding; do not deliver to an arbitrary address supplied in help text, add a donor profile or assume email correspondence proves mailbox control.

**Scope and byte currentness.** The new read authority is still bounded by current file eligibility and prior exact lineage. Failed preview, missing original or retained superseded bytes cannot be repaired by sharing another version. Independent current supporting files remain distinct from superseded predecessors.

**Time and revocation.** Before activation, the fresh authority needs a declared finite source policy/anchor/end; it cannot silently inherit Q07's initial completion clock as `now + 30`. Current stronger/earlier limits still win. Issuance races current revocation/reassignment/retention disposition and uses the same current disclosure gateway. The old authority never becomes active again.

**Communication and help.** A new access grant does not itself choose an email, a reminder, a task or an urgency message. Use existing communication owners only after a deliberate policy selection, safe current-recipient checks and permanent effect identity. Minimize protected details in help intake and response.

## Does active-request policy need to come first?

**Not necessarily as the next founder question; yes as an activation prerequisite.**

Q07 just resolved the ordinary completion bound, so whether a legitimate late need can receive new deliberate authority is a coherent next product fork. It can be answered without choosing active-intake duration or a fresh-access day count. That avoids losing the completed-journey context.

However, the normal **active-request authority** remains foundational. Before enabling any native source profile, its actual initial admission, current authority and declared end/review rules, intake due date versus access expiry, later review interval and completion eligibility must be resolved. This note selects no active-request lifetime. A completed-only specification cannot repair a source policy that expires before most requests can complete, and a generous renewal feature must not become the hidden workaround.

Recommend this sequence:

1. Ask the narrow A/B fresh-authority capability question.
2. If A is chosen, record only that governed capability and non-revival/scope constraints; do not silently choose its duration, frequency, approval ceremony or communication.
3. Resolve the **initial active-request access boundary and its relationship to submission due/review/completion** before detailed renewal timing or rollout design. This is higher leverage than accumulating renewal settings on an undefined original policy.
4. Then qualify any selected fresh-access profile with the source's declared finite timing and exact administrative powers.

If parent research shows ordinary source admission semantics are still ambiguous enough that even “same recipient” or “normal expiry” cannot be defined, prioritize that active-request boundary first. Current code does not force an answer to this product sequencing question.

## Proof implications and limits

No new tests were needed for this next-question research; no old counts are reused.

If A is selected later, meaningful proof must include exact issuer administrative authority and recipient scope; normal expiry versus substantive veto; semantic duplicate/timeout convergence; original and fresh authority histories; expiry/revocation races; same-page re-entry without implicit enrollment; old-token denial; all metadata/original/range/conditional paths; current file limitations; source repair versus fresh grant; and a working governed help route. It must also prove that ordinary intake remains closed.

If B is selected, prove ended-state behavior, safe help, independently authorized rights and truthful absence of a renewed completed-view path. Do not count raw-email or direct-provider fallback as success.

This research recommends a decision shape only. Current implementation does not establish a working native fresh-access or external ended-request help journey, and no live grant/provider/tenant configuration was inspected.
