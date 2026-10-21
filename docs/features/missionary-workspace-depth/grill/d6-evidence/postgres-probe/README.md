# D6 provisional signup/confirmation mechanics probe

Executed **2026-10-16 UTC**, PostgreSQL **17.11**: **34/34 outcomes passed**, including **five controlled concurrent two-session cases with observed lock waits**. Container and anonymous data volume removal were verified. This tests a **provisional synthetic lifecycle hypothesis**. It does not ratify the consent owner's policy, implement Core/P6, or qualify Supabase/Auth/API/provider behavior.

## Hypothesis under test

The fixture distinguishes public intake availability from purpose withdrawal, current address revision, subscription generation, consent revision and retained suppression. Under the provisional policy, turning public signup off stops new intake but does not itself unsubscribe someone or invalidate a previously accepted pending confirmation. Purpose withdrawal or safety suppression can block confirmation independently. A later deliberate signup after withdrawal has a new generation; an old token or retry cannot establish that new consent.

An attempt's confirmation token binds tenant, purpose, purpose revision, address revision, generation and accepted consent revision, with expiry. A source-purpose stop/re-enable therefore cannot revive an old token merely because an eligibility Boolean returned to true. This is one illustrative stale-evidence mechanism, not a selected production schema, requirement to reject unrelated source changes or new permission engine. The exact withdrawal, re-enable, expiry and confirmation policy remains for its source owner to qualify.

## Observed outcomes

| Hypothesis | Result |
| --- | --- |
| Pending acceptance requires atomic evidence and confirmation intent. | One intake produces one pending source, immutable attempt, pending evidence and source confirmation intent. Reusing the same attempt produces no duplicate intent. An injected intent-insert failure rolls all four back. Ten accepted generations have exactly ten pending evidence records and ten intents. |
| GET lookup must not confirm. | The STABLE lookup function returns a generic page result without mutating pending state/evidence. The lookup SQL role cannot execute the confirmation function. This is a SQL role/function distinction, not proof of actual HTTP routing. |
| Confirmation must be bound and current. | Wrong tenant/purpose, expired token, obsolete address revision, purpose withdrawal/re-enable, superseded generation and retained suppression each leave the source unconfirmed. An explicit valid confirmation commits one confirmed evidence record. |
| Accepted history is not current active consent. | After withdrawal, the old token and old intake attempt return the same noncommittal result without changing the withdrawn source. A new signup creates a new pending generation; it requires its own token. |
| Public-off and intake must have a defined commit order. | Public-off first makes intake wait and then creates no pending source/intent. Intake first commits its pending source before the waiting off update. That previously accepted pending token can still confirm while intake is off under this hypothesis. Existing confirmed state is not changed by a blocked intake retry. |
| Withdrawal and confirmation must have a defined commit order. | Withdrawal first makes confirmation wait and then leaves withdrawn state without confirmed evidence. Confirmation first can commit before withdrawal; the final state is withdrawn. There is no lasting reactivation after the later withdrawal. |
| Concurrent confirmation retries must produce one effect. | Two real sessions confirm the same token. The second waits; both get the generic result, with only one confirmed transition/evidence record and one original confirmation intent. |
| Signup cannot clear retained suppression. | Suppressed pending confirmation fails. After withdrawal, a fresh signup cannot create a new generation or clear suppression. The same tenant/address suppression also blocks intake for another purpose. |
| Public access and integrity must preserve scope. | Public direct source UPDATE and SELECT fail. Cross-tenant intake has the generic result and changes no tenant-two state. An explicit fixture intent writer is filtered by tenant RLS; composite FKs reject a cross-tenant parent and relabeling an intent to another purpose. |

[results.json](results.json) records exact command SQL, role, expected output/SQLSTATE, actual output and pass/fail. Administrative census readbacks expose only synthetic fixture state. Concurrent results include both sessions, real lock waits and final state. The `fixture_steps` list records preparatory intake, expiry/purpose/address/suppression changes and reset commands. [setup.sql](setup.sql) contains the complete fixture; [run.py](run.py) executes it.

## What these results do and do not establish

Every ordinary public command returns **`processed`**, which makes **no claim of acceptance, sending, confirmation or current subscription state**. Eligible, already known, blocked, stale and wrong-scope cases share that return value. The page may separately disclose its public availability before an email-specific branch; anti-enumeration does not require concealing that signup is closed. These SQL outcomes do not qualify HTTP error/status/timing/body equivalence, challenge/rate controls, resource exhaustion, email flooding or mailbox-side disclosure. The deliberately injected database fault is a transactional assertion, not a qualified public error response.

`confirm_post` is an explicitly invoked mutation. A POST, token lookup or token possession **does not by itself prove a human acted, that the person intended the purpose, that they control a mailbox, or that they hold an authenticated identity**. The probe has no browser, mail delivery, scanner, forwarded link or malicious automation test. Random UUIDs are used only as fixture tokens; stored hashes bind lookup, and the isolated intent contains the raw fixture token for test access. This does not select or qualify production entropy, token handling/storage, delivery content, expiry duration, redaction or disposal. The one-hour fixture window is arbitrary, not a product decision.

Suppression here is **tenant/address scoped across purposes**, retained until a qualified external authority changes it. Public re-subscription cannot clear it. This does not prove a permanent retention policy, cross-tenant suppression sharing, Resend team-wide suppression congruence or any provider boundary. Confirmed source state also is not sufficient delivery eligibility: purpose, address, suppression, current recipient and downstream source conditions remain independent.

All public actions, withdrawals, policy changes and concurrent sessions use actual nonsuperuser login roles. [roles.json](roles.json) records their attributes. The function executor is NOLOGIN/NOSUPERUSER/NOBYPASSRLS and does not own tables, so its tenant RLS applies. Public roles have only the specific function grants and no source-table grants. The narrow `intent_writer` role deliberately receives selected table privileges solely to test RLS/FKs. Superuser initializes and observes the fixture; it does not stand in for public authorization. The tenant-one route binding and trusted withdrawal/policy actors are fixture assumptions, not Core authorization or unsubscribe-token designs.

The confirmation intent is a durable **source request only**, not a qualified P6 delivery intent, prepared/sealed producer, provider send, delivered message or mailbox event. There is no egress. Initial address identities are opaque synthetic fixtures, so email normalization, matching, original/requested-address binding and first-party contact creation are not tested. No existing subscriber import, automatic enrollment, consent transfer, campaign message, notification or finance effect is modeled.

## Primary sources and reproduction

[sources.json](sources.json) records freshly fetched PostgreSQL 17 URLs, raw/text hashes and inspected mechanisms:

- [Row Security Policies §5.9](https://www.postgresql.org/docs/17/ddl-rowsecurity.html): row scope, bypass roles and policy race limitations.
- [Read Committed §13.2.1](https://www.postgresql.org/docs/17/transaction-iso.html): waiting on conflicting updates and re-evaluating current rows.
- [Transactions §3.4](https://www.postgresql.org/docs/17/tutorial-transactions.html): atomic committed effects or rollback on failure.
- [Constraints §5.5](https://www.postgresql.org/docs/17/ddl-constraints.html): composite key references and NOT NULL components.
- [UUID Functions §9.14](https://www.postgresql.org/docs/17/functions-uuid.html): the fixture's random UUID generator, without a production security claim.

From `/workspace/core`, with the pinned image cached:

```sh
PYTHONDONTWRITEBYTECODE=1 python docs/features/missionary-workspace-depth/grill/d6-evidence/postgres-probe/run.py
```

The runner reuses D1's Docker/psql/session helpers and the earlier disposable lifecycle. Result hashes cover setup, runner, source manifest and helper. It clears inherited Docker endpoint selectors, uses the explicit local socket, starts a fresh `phase28-d6-pg` with networking disabled and no published ports, and verifies container and anonymous-volume removal in `finally`. Local trust authentication is confined to this synthetic server. Image: `postgres@sha256:2d2b8998d31037bf721cfdf764d76ba74171b4fab3431b7f72c27c56ddbdf9e3`. [environment.json](environment.json) records actual server/image/isolation and [cleanup.json](cleanup.json) confirms removal.

Not qualified: consent policy ratification, deployed Core schema or producer ownership, Supabase JWT/RLS/service-role composition, public missionary control authorization, real HTTP methods, cryptography, legal evidence, retention, scan/bot/abuse resistance, provider suppression/identity boundaries, P6/P17 activation, delivery, unsubscribe standards, browser UX/accessibility, production performance, noncooperating writers, all isolation levels or crash recovery. No application migration, live data, integration or GitHub object was changed.
