# D6 — database, public capability and recovery evidence

Research only, October 16, 2026 (UTC). This supports the D6 review; it is not a
schema migration, deployed security assessment or implementation. The
[fetch manifest](technical-source-fetches.json) records ten successful primary
HTTP fetches with timestamps, sizes and SHA-256 hashes. Raw responses are in the
recorded temporary research paths. Supabase's documentation search was also used
for RLS/API guidance. No live database, subscriber or provider was modified.

## Primary sources and verified technical facts

1. [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
   and [API security](https://supabase.com/docs/guides/api/securing-your-api)
   distinguish object grants from row policies. Exposed objects require both
   explicit reachability decisions and correct RLS. Secret/service-role paths
   bypass RLS and must prove the application's source authority. User-editable
   metadata is not authorization; JWT claims can be stale. A PostgREST
   pre-request hook does not cover Realtime or Storage. Views/functions require
   qualification of their actual execution role and grants.
2. [PostgreSQL 17 CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html)
   defines old-row `USING`, new-row `WITH CHECK`, permissive OR composition and
   restrictive policy behavior. If the relevant `WITH CHECK` is omitted,
   `USING` can supply it. The review must test actual old and new state instead
   of repeating the incorrect blanket claim that omission always allows
   reassignment. A definer function's owner privileges determine RLS behavior;
   the label alone does not establish unrestricted bypass.
3. [PostgreSQL constraints](https://www.postgresql.org/docs/17/ddl-constraints.html)
   supports multi-column foreign keys and uniqueness, but nullable keys have
   distinct semantics and a check is not a cross-table authorization system.
   Tenant-aware relationships and current authorization are complementary.
4. [RFC 8058](https://www.rfc-editor.org/rfc/rfc8058)
   defines authenticated email-header one-click unsubscribe through HTTPS POST.
   This is separate from arbitrary GET-prefetch behavior and from an opt-in
   confirmation ceremony. Correct list headers, DKIM coverage, exact scope and
   idempotent processing require delivery-owner integration; a visually clear
   footer alone does not implement the protocol.
5. [OWASP token guidance](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
   describes random, securely stored, bounded-use expiring tokens, generic
   account-existence responses, anti-flood controls and referrer protection.
   This is a security-pattern analogy, not permission to reuse Auth password
   reset as newsletter signup or proof of natural-person identity.

The installed Supabase skill is useful routing, but its simplified policy and
definer statements do not override PostgreSQL semantics. The same restriction
applies to any broad vendor claim that confirmation guarantees a real person's
identity or establishes every form of consent.

## Current Supabase change check

The [changelog](https://supabase.com/changelog.md) was fetched first and relevant
linked notices were followed:

- [Explicit Data API exposure](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically):
  new-object defaults are changing, with existing-project enforcement announced
  for October 30, 2026. This does not revoke previously granted table access.
  D6 must inspect effective ACLs in the actual target environment, not infer
  safety from a platform default or a migration file alone.
- [Postgres minor-version notice](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes):
  version and extension compatibility must be checked against the real target.
  A disposable PostgreSQL probe does not qualify Supabase Auth, PostgREST,
  Realtime or provider integration. D6 requires no speculative extension.
- [CBC TLS retirement](https://supabase.com/changelog/cbc-tls-ciphers-deprecated):
  client compatibility is a rollout check where applicable. No affected Core
  client population was established here, and no unrelated upgrade is proposed.

## Minimal authoritative model to qualify

These are invariants and a source recommendation, not frozen table names:

- P28 owns the narrow native newsletter instruction/membership and admission
  generation under P3's consent contract and wider restrictions; P6 consumes
  current source eligibility and owns send-time verdict/snapshot, suppression
  evidence, intent and delivery, not a second subscriber master. P17 owns the qualified
  message profile/preparation; P22/P23 own Page publication and entry admission;
  P12 owns current authority. Optional P32 sync owns none of these native facts.
- Bind every occurrence to trusted Tenant, canonical public Page/subject,
  exact newsletter purpose and immutable destination revision. Resolve public
  host/site/Page mapping on the server. CMS IDs, operational Tenant UUIDs,
  missionary/person/assignment IDs and a display slug are not interchangeable.
- Store the purpose's address/contact authority once, through the qualified
  owner. Optional submitted Name is an unverified display assertion. Email
  equality, a shared household inbox or possession proof does not establish a
  Party match, CRM edit, account claim, missionary relationship or household
  member's authority. No newsletter Auth user is required.
- Required scope keys are non-null. Tenant-aware foreign keys prohibit a valid
  local occurrence from referencing another Tenant's Page, purpose or source
  recipient. Database uniqueness prevents multiple current admissions for the
  same exact purpose/destination authority while preserving explicit later
  generations and historical evidence. Do not impose permanent global email
  uniqueness or deduplicate different newsletters into one consent choice.
- Use the existing supported canonical email profile; preserve legitimate
  plus/dot distinctions and do not silently invent case, Unicode, domain or
  provider-specific equivalence. Index the actual scoped lookup/foreign-key and
  lifecycle-recovery paths; confirm plans under real policy and tenant skew.
- Caller-controlled fields cannot set Tenant, confirmation, consent, actor,
  author, Page ownership, effective publication or privileged timestamps.
  Public request attribution records its actual assurance; it never fabricates
  an authenticated human from a supplied Name or Email.
- No public subscriber enumeration, browser table mutation or raw token read.
  The public operation is a finite server-owned command, with only its safe
  result exposed. Authenticated missionary reads/writes still require current
  exact Page or newsletter-purpose authority. Being authenticated is not a
  subscriber-list permission.
- Required state combinations, dates and generations have constraints. History
  is append-only where the owner requires it; mutable current projections do
  not overwrite consent evidence. Delete/purge behavior follows the source's
  finite retention and withdrawal duties, not cascading Auth-user deletion or
  a blanket indefinite archive. No money column or financial balance belongs
  in this flow.

## Tokens, withdrawal and acceptance ordering

The recommended first-release policy is fresh exact-purpose mailbox
confirmation for each new admission, including re-subscription. An already
active identical relationship is a no-op. Do not introduce a verified-profile
shortcut before its exact proof reuse has an owner contract.

The confirmation URL opens an inert minimal landing page. A deliberate confirm
action invokes the acceptance command; GET, preview, link scanner, page load,
delivery webhook or mailbox-open event cannot activate a subscription. POST
alone is not proof of a human. Token possession and the admitted explicit
action establish only the bounded newsletter/address evidence the source
allows. Untrusted public submission cannot overwrite an existing subscriber's
Name or address.

Store token verifiers safely, scope them narrowly, give them absolute expiry,
and exclude secrets/addresses from logs, analytics, shared caches, referrers and
third-party assets. Owner-required encrypted delivery material is distinct from
the stored verifier and must follow its own material class and purge. Avoid
inventing a generic token vault or using Supabase Auth signup/password reset.

The consolidated D6 review recommends 72 elapsed hours from initial acceptance
for pending admission/proof usefulness, without extension by read/retry/resend,
and purge of unused secrets/redundant pending raw material within 24 elapsed
hours after termination. These are explicit new policy judgments, not inherited
technical standards. The normative source profile must also declare finite
resend cooldown/ceiling, request-size, abuse and privacy-evidence retention bounds
before activation. All must be tested at exact boundaries and recoverable
through a deliberate fresh request. Do not borrow the external request's seven
or thirty days, a provider's transport idempotency window, or a fixture's test
TTL as the native consent policy. Changing a policy cannot silently extend an
already issued token or resurrect superseded consent.

Page-entry Off stops new occurrences and wins against a stale submitted form or
stale later Page release. It does not withdraw the newsletter purpose. An
already accepted pending occurrence may finish within its original validity
while its actual purpose and recipient remain eligible. Purpose closure,
consent withdrawal, supersession or a relevant safety/suppression restriction
independently fences confirmation and unstarted newsletter dispatch. Reopening
the Page cannot revive an expired or withdrawn occurrence.

Keep human withdrawal links usable without login: an old still-valid link can
open the exact list/destination's inert current-scope landing and allow a fresh
deliberate withdrawal command. Replaying an already accepted withdrawal command
is different: it returns that operation's result and cannot undo a later freshly
confirmed admission. RFC 8058 requests need a stable source operation; identical
repeated POSTs do not reveal whether a human intended a new withdrawal. Preserve
the direct current manual withdrawal route and test first use, retry, later
re-subscription and delayed delivery explicitly. Never let a withdrawal token
edit identity, disclose other lists or turn consent on.

## Transactions and failure recovery

Public intake must atomically accept its bounded pending source state, required
minimal evidence and durable confirmation-delivery intent. Confirmation and
withdrawal must atomically accept their authoritative state and required
evidence. Necessary acceptance/dispatch fences are synchronous correctness
requirements; an eventual outbox is not a replacement for one.

Only independently asynchronous delivery work proceeds later. Provider failure
does not turn pending into subscribed or invite a new email on every UI retry.
Recovered historical acceptance is not proof of current membership. Current
view, submit and dispatch each qualify their own scope. Lost responses are
unknown until reconciled; failed audit/evidence cannot leave a half-accepted
subscription. Same durable intent reconciles one effect, changed meaning with
that intent rejects, and an old accepted command cannot reapply after a newer
withdrawal or Page choice.

Lock/order the smallest actual competing source scopes consistently: Page-entry
generation for intake, exact subscription/admission for confirmation/withdrawal,
and required policy/suppression boundaries. Test both possible race orderings;
do not claim global serializability or lock every unrelated tenant fact. A
single `updated_at` timestamp or transport request ID is insufficient evidence
of business intent.

## Proof limits and required later qualification

The disposable probe records only the model and mechanics actually exercised.
It cannot prove real mailbox control, abuse resistance, native Auth, production
Data API grants, P12 policy evaluation, CMS/operational Tenant mapping, P6/P17
acceptance, provider behavior, expiry configuration, privacy retention or UX.
Its suppression scope is expressly a fixture scope, not Resend's team scope.

Before rollout, prove the full visitor-to-missionary job through real source
services and the application/API/browser harness, effective SQL roles/grants,
negative direct REST/RPC/GraphQL and reached Realtime/Storage/exports, current
suppression and provider contracts, migration/mixed-version behavior, keyboard/
screen-reader/mobile/slow-network recovery and representative task comprehension.
No production throughput, latency, confirmation conversion or usability result
is claimed by this research.
