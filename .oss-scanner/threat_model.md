# Core OSS Scanner threat model

## Overview

Core is an early-development, public AGPL-3.0-only Bun/Next.js monorepo for
nonprofit operations and giving. The source contains Mission Control/admin,
donor and missionary applications, a public CMS surface and shared business
packages. Their presence does not establish production deployment, adoption or
feature activation. This maps source available to the scanner; it is not a
completed security audit.

Asym Postgres owns application and CRM truth. Twenty CRM is retired; historical
names, documents and fixtures must not reactivate it
(`AGENTS.md`, `docs/adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md`).
Read `openspec/project.md`, applicable contracts and current code together:
ratified intent and active changes do not prove implementation.

| Component / entry point          | Source and responsibility                                                                                                                                                                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Three Next.js applications       | `apps/admin/app/api/**`, `apps/donor/app/api/**`, `apps/missionary/app/api/**`; HTTP handlers and server actions. Most business handlers delegate to `packages/api/src/**`.                                                                                               |
| Identity and browser data        | `packages/auth/context.ts:78`, `packages/auth/context.ts:249`, `packages/auth/permissions.ts`; Supabase bearer/cookie identity, profile and active memberships. `packages/database/collections/**` and `packages/database/hooks/**` own browser table access.             |
| Privileged commands and GraphQL  | `packages/api/src/shared/with-operation.ts`, `packages/database/supabase/admin.ts:14`, `packages/graphql/handler.ts:25`; server role/tenant/object checks protect service-role operations.                                                                                |
| Database enforcement             | `supabase/migrations/**`, especially `supabase/migrations/20260226113000_authz_memberships_foundation.sql:45` and `supabase/migrations/20260802041500_current_user_memberships_rpc.sql:22`; RLS, grants, RPCs, atomic money operations, audit and durable workflow state. |
| Giving and Stripe                | `packages/api/src/donate/**`, `packages/api/src/stripe/**`; intake, provider commands, verified events, recovery, replay and refunds.                                                                                                                                     |
| CMS                              | `apps/admin/payload.config.ts`, `apps/admin/src/cms/**`, `packages/api/src/cms/public/**`; separate Payload administration and published-content reader.                                                                                                                  |
| Email, Support Hub and documents | `packages/api/src/email/**`, `packages/api/src/admin/support-hub/**`, `packages/api/src/pdf-templates/**`, `vendor/react-pdf-packages/**`; inbound bodies, routing, templates, uploads and PDF rendering.                                                                 |
| Conditional product Eve          | `packages/eve-runtime/agent/**`, `packages/eve-runtime/src/**`, `packages/api/src/eve/**`; sessions, tools, governance, approvals, budgets, sandboxes and GitHub operations. Disabled effects remain in source review scope.                                              |

The admin `/api/inngest` endpoint also serves durable donation recovery, Stripe
processing/recovery and inbound-email functions via
`packages/api/src/workflows/serve.ts:21`. One shared Inngest app uses SDK-owned
signing/event configuration (`packages/api/src/workflows/inngest/client.ts:8`);
source presence does not establish a registered/running cloud executor.
Normal flow is browser/session → handler → shared command or bounded read →
Postgres/provider. Browser collections use the user's RLS authority. Server
service-role clients have broader database authority and need explicit
authorization. Payload has its own schema and access layer; it does not own
financial truth.

### Audit startup and effective resources

Run from `/src` as root with `HOME=/root`. The scanner overrides Docker startup;
build-time processes, `CMD` and `ENTRYPOINT` do not start audit services.
See [the runbook](README.md) for profiles and evidence limits.

```bash
./.oss-scanner/start-services.sh db
./.oss-scanner/test-offline.sh
./.oss-scanner/start-services.sh apps
./.oss-scanner/start-services.sh stop
# Donor-only demo stops helper-owned apps before changing profiles:
./.oss-scanner/start-services.sh demo
```

| Workflow                  | Resource / capability                           | Configuration / safe effective location                                                                                     | Actors                                                              | Enforcing control / limit                                                                                                                                                                                                                                               |
| ------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Interactive normal audit  | App auth configuration                          | `run-local.sh normal <command...>` clears inherited env; loopback Supabase URL; E2E bypass false; no global validation skip | Local investigator                                                  | Plain PostgreSQL has no Supabase HTTP Auth; normal HTTP checks prove denial/unavailability, not successful real sessions                                                                                                                                                |
| Local SQL                 | PostgreSQL authority                            | `start-services.sh db`; loopback 55432; disposable `core_scanner`; synthetic credentials                                    | Local Postgres and role-switched SQL fixtures                       | Real SQL/RLS/grants; JWT claim settings are fixtures, not JWT verification                                                                                                                                                                                              |
| Strict image build        | Compiled public configuration and Eve artifacts | Clean `build.sh` env: `http://127.0.0.1:54321`, `E2E_AUTH_BYPASS=false`, no `SKIP_ENV_VALIDATION`; `bun run build:strict`   | Local build processes                                               | Normal public values remain compiled; command-only hosted-preview signals make the separate Eve service build emit artifacts without sandbox prewarming. See `.oss-scanner/results/build.json` and service build profile                                                |
| Explicit UI demo          | Synthetic demo identity                         | `run-local.sh demo`: `https://example.supabase.co`, `E2E_AUTH_BYPASS=true`, `SKIP_ENV_VALIDATION=1`, development mode       | Synthetic UI processes                                              | Donor-only Next dev output; admin dev is excluded because withEve starts Eve dev/prewarming; demo does not prove normal auth. E2E also checks production mode, datasource allowlist and signed cookies (`packages/auth/e2e-auth.ts:96`, `packages/auth/context.ts:174`) |
| Hosted app, outside audit | Privileged Supabase client                      | Server URL + service-role key reference; absent from image                                                                  | Authorized server commands                                          | Missing config disables client (`packages/database/supabase/admin.ts:21`); callers still enforce tenant/object permissions                                                                                                                                              |
| Public CMS                | Published content                               | Resolved tenant → reader constraints → Payload access → serializer                                                          | Anonymous readers; staff publishers                                 | Tenant/published reads with `overrideAccess: false` (`apps/admin/src/cms/public/published-content-reader.ts:27`); media bytes intentionally public by URL (`apps/admin/src/cms/access/public-read.ts:237`)                                                              |
| Conditional Eve           | Agent/session/tool/provider authority           | Persisted release/governance + model policy + approvals/budgets; Release remains Off; scanner emits artifacts only          | Verified owner or separately authorized GitHub actor when activated | `packages/eve-runtime/src/governance-boundary.ts:64`, `packages/api/src/eve/session-ownership/route-auth.ts:33`; offline checks do not authorize activation                                                                                                             |

## Threat model, trust boundaries, and assumptions

Protected assets include tenant-private donor/missionary/contact/staff details,
support conversations, giving history, donor linkage, provider identifiers,
financial facts, receipts/statements, drafts, exports, credentials, audit
records and agent capabilities. Preserve confidentiality, ownership, financial
integrity and bounded provider/resource effects.

Attacker starting positions include anonymous visitors, donors/missionaries
with their own valid sessions, staff of one tenant, email senders, parties
controlling unsigned webhook bytes and malicious documents/templates/URLs/
uploads/tool output. A valid low-privilege session is not permission to access
another object or tenant. Do not assume attackers control service credentials,
governance state, trusted deployment config, GitHub write accounts or the host.

- **Session → identity/role.** Supabase `getUser`, the caller's profile and active
  memberships establish context; missing profile/membership resolution fails
  closed (`packages/auth/context.ts:249`). Check middleware, callbacks, server
  actions and handlers individually, including cookie/bearer consistency,
  redirects, refresh, CSRF/origin behavior and cached output. Layout guards do
  not authorize commands.
- **User/tenant → privileged command.** Service-role clients bypass RLS, so
  reads/writes/exports/RPCs must bind resource, tenant and actor. Donor and
  missionary helpers require corresponding roles
  (`packages/api/src/donor-portal/route-helpers.ts:14`,
  `packages/api/src/missionary-portal/route-helpers.ts:14`); donor lookup also
  binds profile and tenant (`packages/api/src/donor-portal/service.ts:164`).
  Trace downstream queries, joins, subscriptions and serialization.
- **Browser/API → database.** Review final migration order, policy combinations,
  table/view grants and SECURITY DEFINER RPCs, search paths and caller binding.
  The membership RPC filters `auth.uid()` and tenant, revokes PUBLIC execution
  and grants authenticated execution
  (`supabase/migrations/20260802041500_current_user_memberships_rpc.sql:22`).
  RLS is a boundary to verify, not proof every policy works. Superuser or
  service-role reads do not demonstrate RLS enforcement.
- **Trusted administration.** Tenant staff intentionally perform role-qualified
  CRM operations and exports; super admins intentionally have broader tenant
  access (`packages/api/src/crm/auth/access.ts:22`,
  `packages/api/src/admin/crm/reports/export.ts:9`). Show the attacker crossing
  a role, tenant, object or operation boundary rather than labeling intended
  administrative powers as defects.
- **Payments and events.** Server intake parses/quotes amounts, selects tenant
  provider config and requires an idempotency key
  (`packages/api/src/donate/index.ts:39`). Metadata cannot override canonical
  donation/tenant/actor fields; positive integer minor units and namespaced
  provider idempotency are enforced
  (`packages/api/src/donate/payment-intent.ts:57`, `packages/api/src/donate/payment-intent.ts:114`). Signature checks,
  account ownership, event claims, replay, refunds and recurring reconciliation
  are distinct controls. A signed event does not alone prove ownership or safe
  repeated processing. Trace raw-body verification
  (`packages/api/src/stripe/verify-event.ts:25`), event-store/ledger and
  terminal transitions. Privileged replay retains separate authorization.
- **Workflow invocation → privileged effects.** Inngest request verification is
  distinct from tenant/subject authorization. Strict envelopes carry identifiers
  and bounded safe metadata (`packages/api/src/workflows/events.ts:77`), and
  malformed input fails without retry (`packages/api/src/workflows/envelope-guard.ts:32`).
  Inspect canonical-row/tenant binding before service-role or provider effects,
  dispatch/recovery ledger, stale claims and concurrent retries; per-tenant flow
  control is not the work lock (`packages/api/src/workflows/claims.ts:22`).
  Donation recovery resolves provider credentials by envelope tenant, then
  processes the referenced outbox (`packages/api/src/workflows/functions/donation-saga-recovery.ts:32`).
  Test that mismatch/replay cannot redirect another tenant's work. Do not send
  cloud events or activate an executor in the scanner environment.
- **CMS staff → public content.** Public reads require tenant/published
  constraints, `overrideAccess: false` and safe serialization
  (`apps/admin/src/cms/public/published-content-reader.ts:27`). CMS tenant staff
  are scoped; super admins intentionally cross that scope
  (`apps/admin/src/cms/access/tenant-access.ts:7`). Check drafts, preview scope,
  populated relationships, metadata, rendering and cache isolation. Media bytes
  are intentionally public by URL; private records must not be stored there.
- **Email/content → operations.** Resend requires configuration and verified
  webhook bytes before persistence
  (`packages/api/src/email/webhooks/resend.ts:578`). Tenant/inbox resolution
  precedes Support Hub routing; email headers and HTML are untrusted data, not
  authority (`packages/api/src/admin/support-hub/inbound-router.ts:40`). Check
  threading, recipients, imports, outbound sends, HTML rendering, privacy rules
  and duplicate events.
- **Templates/uploads → rendering/storage.** Native PDF routes require admin
  roles, parse schemas and create actor-bound contexts
  (`packages/api/src/pdf-templates/native.ts:42`). Check tenant asset access,
  URL resolution/SSRF, HTML/script injection, parser behavior and resource bounds
  at actual consumers, including local vendored packages. Email assets restrict
  size/type and create tenant paths
  (`packages/api/src/email/assets.ts:13`, `packages/api/src/email/assets.ts:50`); claimed MIME type alone does
  not establish safe bytes. Test traversal where filenames/paths are consumed.
- **Product Eve → capabilities.** The authored foundation agent uses a mock
  model (`packages/eve-runtime/agent/agent.ts:56`). Activation requires persisted
  governance, release, approved action/model policy and positive budgets
  (`packages/eve-runtime/src/governance-boundary.ts:32`). Session routes
  separately bind ownership; eval bypass needs process eval mode and loopback
  (`packages/eve-runtime/src/admin-session-auth.ts:15`). Sandbox networking is
  deny-first and app-governed; bootstrap clones a public checkout and removes
  env files (`packages/eve-runtime/agent/sandbox.ts:9`). GitHub actor checks
  are independent from signature verification
  (`packages/eve-runtime/src/github/authorize-trigger.ts:39`). Inspect approval
  replay, target/revision binding, budget races, narrowed tools, sandbox paths/
  secrets and GitHub action authorization. Prompts, specialist output,
  retrieved documents and memory must not grant authority. OpenSpec Guardian
  remains read-only. Do not activate live models, sandboxes, provider/GitHub
  writes or production effects for investigation.

Normal admin startup loads `apps/admin/next.config.ts:103` and may auto-start
its built local Eve HTTP sidecar on loopback. Installed Eve's
`dist/src/public/next/server.js` starts `.output/server/index.mjs` directly in
this production path; CLI `eve start` has a separate prewarm path. The scanner
smoke makes no Eve session/tool requests. Do not run admin Next dev or `eve start`
inside this profile: development/CLI startup can prewarm sandboxes.
The image has no hosted Supabase Auth/PostgREST/Storage/Realtime, Stripe,
Resend, Blob/Cloudinary, Inngest cloud, model or production credentials.
Real deployments and other people's systems are outside testing authorization.
SQL fixtures and provider mocks investigate Core behavior; they do not audit
unrelated services or prove hosted integration. Keep provider code in scope and
identify missing prerequisites. No subscription login or Anthropic API key is
needed. Source review remains useful where hosted reproduction is unavailable.

## Attack surface, mitigations, and attacker stories

These are investigation hypotheses, not findings. Demonstrate the capability
gained across a reachable boundary.

| Priority    | Scenario / capability gain                                                 | Prerequisites                                                             | Impact                                                           | Existing controls                                                           | Mitigation / investigation                                                                  | Evidence                                                                                                                                                  |
| ----------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| High        | Swapped IDs/tenant hint exposes or changes another tenant's records        | Valid low-privilege session or exposed anonymous path                     | PII/financial disclosure or cross-tenant writes                  | Identity, role, query scope, RLS                                            | Trace real service-role query/serialization; reproduce with two tenants and non-owner roles | `packages/auth/context.ts:249`; `packages/api/src/donor-portal/service.ts:164`                                                                            |
| High        | Crafted/replayed event/refund changes another account or applies twice     | Reachable handler; valid signature/privilege only where actually required | Wrong charge/refund or corrupt financial truth                   | Raw signature, metadata, event claims, tenant provider, ledger/idempotency  | Check account joins and concurrent/terminal/retry transitions using SDK fixtures            | `packages/api/src/stripe/verify-event.ts:25`; `packages/api/src/stripe/webhooks.ts:422`; `packages/api/src/donate/payment-intent.ts:114`                  |
| High        | Eve input bypasses owner, approval, target or budget gate                  | Explicit activation/config; appropriate route identity                    | Session disclosure, repo writes, secrets, spend                  | Session ACL, persisted governance, policy, actor checks, deny-first network | Exercise fixture seams and state races without effects                                      | `packages/api/src/eve/session-ownership/route-auth.ts:33`; `packages/eve-runtime/src/governance-boundary.ts:64`                                           |
| High        | Browser grant/RPC/policy escalates tenant or role                          | Actual authenticated DB role, not superuser                               | Broad data disclosure/loss or role changes                       | Membership policy, caller-bound RPC, grants                                 | Role-switched SQL claims; inspect final grants/policies/definers                            | `supabase/migrations/20260226113000_authz_memberships_foundation.sql:72`; `supabase/migrations/20260802041500_current_user_memberships_rpc.sql:22`        |
| Medium–High | CMS query/preview/rich text exposes drafts, tenant data or executes script | Public request or permitted editor input                                  | Private leak or victim-session compromise                        | Public choke-point, published/tenant access, serializer                     | Check relationships, previews, escaping and tenant cache keys                               | `apps/admin/src/cms/public/published-content-reader.ts:27`; `apps/admin/src/cms/access/public-read.ts:207`                                                |
| Medium–High | Email/template/asset/upload/export crosses recipient/file/network boundary | Relevant sender/editor privilege and actual consumer                      | Conversation access, injection, SSRF, private export, exhaustion | Verified bytes, tenant routing, schema/role/size gates                      | Follow input to renderer/storage/fetch; constrain destinations, paths and limits            | `packages/api/src/email/webhooks/resend.ts:578`; `packages/api/src/admin/support-hub/inbound-router.ts:40`; `packages/api/src/pdf-templates/native.ts:42` |
| Medium      | Demo configuration or credential inclusion changes normal posture          | Unsafe build/config or exposed artifact                                   | Auth confusion or secrets in browser/log/image                   | Clean profiles, mode/datasource guards, server key boundary                 | Inspect effective env/compiled values; keep profiles separate and credentials absent        | `packages/auth/e2e-auth.ts:96`; `packages/database/supabase/admin.ts:21`; `.oss-scanner/README.md`                                                        |

## Severity calibration (Critical, High, Medium, Low)

- **Critical:** demonstrated unauthenticated broad tenant compromise, remote
  execution with server authority or arbitrary cross-account money movement
  with few prerequisites. A code smell or unavailable provider seam does not
  establish that impact.
- **High:** demonstrated low-privilege cross-tenant private-data access,
  unauthorized financial changes, privileged tool/approval bypass or material
  secret exposure. State activation, signature, account and permission
  prerequisites explicitly.
- **Medium:** bounded sensitive disclosure, exploitable stored injection with
  constrained victims or meaningful resource abuse requiring a narrower role.
  Use the actual data and authority gained to calibrate.
- **Low:** limited demonstrated impact with substantial prerequisites. Intended
  public CMS media access, an authorized tenant admin export or changing one's
  own allowed preference is not automatically a vulnerability.

Report confidence separately from impact. Include the affected fetched revision,
source location, attacker permissions, expected versus observed behavior, local
reproduction, evidence, configuration/activation prerequisites and a focused patch
plus regression test where feasible. Deduplicate the same underlying defect.
Proposed fixes require maintainer review; never automatically apply or merge.
Send reports privately through the program and [Core policy](../SECURITY.md),
not public issues. Approved OSS Scanner contact: `blake@globalfellowship.org`.
