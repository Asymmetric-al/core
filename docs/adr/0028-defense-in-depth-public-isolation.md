# ADR-0028: Defense-in-depth public isolation

**Status:** Accepted (founder ruling, Phase 5 grill session 2026-07-05 — A5)

> Full record: `docs/prds/sitestacker-parity/phase-05-public-website-runtime-contract.md`
> (ruling A5; A15 explains why RLS cannot carry this; testing tier in
> Testing Decisions).

## Context

The shipped public-read pattern runs Payload's Local API with
`overrideAccess: true` — which skips Payload access control entirely — plus a
hand-written `where` clause for tenant + published on every query. Isolation
therefore depends on every query author remembering the right clause, and one
already forgot: the public navigation route omitted the published filter and
returned drafts. There is no structural guard, and there cannot be a
database-level one: Postgres row-level security does not protect the `cms`
schema, because the Payload database role bypasses RLS. The alternatives were:
keep the hand-written-`where` pattern and add review discipline (no safety
net — it already leaked), rely on RLS (impossible for `cms`), or make
isolation structural at the application boundary with independent enforcement
layers.

## Decision

Public content is readable **only through one choke-point** — the
published-content reader — with layered, independent guarantees:

- the resolved tenant (and reserved site) is a **required typed argument**,
  so isolation cannot be forgotten at a call site;
- the choke-point **always applies the tenant-and-published constraint**;
- an unresolved tenant returns **empty, never unfiltered** (fail-closed);
- the read runs **`overrideAccess: false` under an explicit public-read
  access policy** ("anonymous ⇒ published + resolved tenant only"), so
  Payload independently enforces isolation even if the choke-point has a
  bug; the policy is extensible for future restricted-content predicates;
- a **hard-blocking sole-entry lint** forbids raw Payload reads
  (`payload.find` / `findByID`) in public code paths outside the reader;
- a permanent **negative-test tier** asserts cross-tenant emptiness, draft
  unreachability (including a navigation regression test), and fail-closed
  behavior.

The shipped navigation draft-leak is fixed by routing navigation through the
same choke-point. This retires the `overrideAccess: true` +
hand-written-`where` pattern for public reads.

## Consequences

- The worst-case public bug becomes "site not found," never "serve everyone"
  or "serve a draft."
- Two independent layers (choke-point argument + Payload policy) must both
  fail before content crosses a tenant boundary — a single forgotten clause
  can no longer leak.
- The lint and negative tests are permanent CI gates, not one-time checks;
  new public read paths must go through the reader or the build fails.
- Payload access policies gain a real public-read policy instead of being
  skipped, which future restricted-content rules (for example
  restricted-worker suppression) extend rather than bypass.

**Phase 24 D66 amendment (2026-08-30).** Site Locale becomes another mandatory
positive public-read dimension, never an optional filter. The choke point and
Payload policy independently require the exact Tenant, Site, stable locale,
current Public Site Generation, published resource version, and public-safety
predicate. Unknown, private, withdrawn, unallocated, stale-generation/
admission, or cross-scope locale requests return privacy-safe absence. An
ordinary translation's source-age policy is owned separately by D67. D67 keeps
public authorization and translation freshness as separate facts: ordinary
source drift leaves the exact authorized target resource public, while a typed
source-owned safety revocation produces a successor generation that omits the
smallest complete affected closure. A generation-level adverse fence may deny
the containing locale during cutover, but no per-Page Edge Config authority is
introduced. Because Payload's database role
bypasses RLS, Supabase policy is not claimed as CMS protection; server-derived
arguments, access hooks, sole-entry lint, serializer allowlists, and negative
tests remain mandatory.

**Phase 24 D72 amendment (2026-08-30).** The trusted public request context now
also requires the exact current Site Domain binding, role, and generation from
operational Domain authority. Only a Primary Site Domain may reach favorable
Site content. A Redirect Site Domain is a nonserving website role: source-owned
Giving/protected/control routes run first, and only a route-qualified ordinary
`GET`/`HEAD` may receive the server-derived final-primary redirect. Unknown,
forged, stale, cross-scope, zero/two-primary, or mixed-generation host context
returns safe absence/authority failure before Payload or cache. Current
`x-forwarded-host` plus `overrideAccess:true` Tenant lookup is migration evidence,
not D72 authority; the hosting adapter and any cross-app context transport must
prove spoof resistance and bind normalized host plus binding generation.

**Phase 24 D73 amendment (2026-08-30).** Every exact Primary successor binds one
explicit former-primary website disposition, but source-owned routes retain only
their owners' direct/unavailable/successor/block outcomes and are evaluated
first. The command composes a complete finite registered host/route/security
hard gate; external links, search, documents, QR codes, and other known
placements remain incomplete advisory evidence rather than a universal crawler.
Stop-mode ordinary website errors are neutral/no-brand/noindex/no-store and do
not claim erasure while any source-owned or external evidence remains. Candidate
redirect/cache history must prove an inverse mapping loop-safe; unknown history
fails closed, including apex/`www` changes.

**Phase 24 D74 amendment (2026-08-30).** An owner-cleared disconnection first
advances the exact binding into a monotonic Disconnecting generation and reads
back every required adverse admission cohort before provider removal. Unknown,
mismatched, disconnecting, and disconnected hosts fail before Payload Tenant/
slug fallback, content/cache selection, redirects, Giving/auth route dispatch,
or another Site. Provider ambiguity retains the adverse fence and global claim;
only current authenticated absence of every applicable Core-controlled routing
association permits claim release. Historical identity and D9–D15 reservations
remain active isolation inputs.

**Phase 24 D75 amendment (2026-08-30).** A new Tenant receives no public context
from typing, a pending verification attempt, provider `verified` state, DNS
traffic, or even the newly claimed private binding. Only a Core-issued exact-
host DNS challenge atomically consumed with the sole global claim may create the
new private generation; D6/D66/D72 later activate it. Every request/context/
session/cache route binds that generation, rejects former Tenant state, and
applies D9–D15 adverse reservations before favorable dispatch. Cross-Tenant
availability/history remains non-enumerating and launch reusable custom Site
hosts register no root-scope service worker.

**Phase 24 D76 amendment (2026-08-30).** A same-Tenant Site Domain cutover does
not make the unchanged hostname a safe shared origin. Before the cutover, only
the complete source binding/public generation is favorable; an acknowledged
Moving barrier denies every favorable Site/route/cache path; after the
authority successor and admission readback, only the complete target generation
is favorable. Source-generation cookies, sessions, signed context, caches and
client state cannot authorize destination meaning. A bounded neutral gap is
permitted; mixed/wrong-Site content, default fallback and provider/platform
branding are not.

**Phase 24 D77 amendment (2026-08-31).** Before D76 may install that barrier,
every applicable family in the one small code-owned critical owner registry must
provide complete current evidence and one immutable comparison must cover the
complete source/destination effective-host route manifests. Permission-filtered
UI detail never removes a hidden server-side blocker. Source-only historical
ordinary paths compile explicit non-enumerating not-found effects into the new
binding generation; exact collisions remain adverse; protected owners run
first. Phase 5 consumes one generation-bound indexed route effect before content
or cache. Missing manifest/owner authority is temporary unavailable, never empty,
another Site, or favorable fallback.

**Phase 24 D78 amendment (2026-08-31).** A different Site-owned Page can cross
that adverse boundary only through ADR-0199's current directional, exact-
address, revision-bound General Page owner qualification. The public choke point
consumes a stable internal target Page effect; it never infers meaning from a
path/title/copy/hash/AI result or trusts caller/provider URLs. Same-path direct
service requires a target Primary; redirect-only roles remain one-hop to the
Primary. Missing/stale/ineligible or unauthorized proof remains not-found/
temporary unavailable, and no query/body/cookie/auth/return/fragment meaning
crosses.

**Phase 24 D79 amendment (2026-08-31).** After activation, every favorable D78
route effect also pins the target Page/locale's current opaque Page Purpose
Continuity Version. A changed effective Page public release—including its exact
meaning-bearing localized/shared/Reusable Section/reference dependency closure—
cannot reach the public generation without one explicit D1 preserve/change
choice and current expected heads. Preserve may carry only universally reviewed
relations pinned to that exact version. D80 never moves the source head; it
creates a fresh private Page with no inherited relation/continuity state. The isolation choke point consumes
only the compiled owner route effect, not Page content, purpose state, CMS
history, UI choice, cache, or provider state. Tenant/environment/Site/Page/
locale/version scope appears in every private owner lookup and cache identity;
unknown, stale, cross-scope, or older-version truth remains adverse. Restricted
source-route detail never becomes public or unauthorized staff projection.

**Phase 24 D80 amendment (2026-08-31).** D80 changes no public-isolation state.
It creates one private same-Site/same-locale Page draft and D2 path claim while
the source Page, generation, direct/redirect/not-found effects, D78/D79, and
donor response remain unchanged. The target cannot cross the public choke point
until later independent D1 proof. Provenance/transfer receipts are never public
reader inputs, and no Vercel/provider/money call participates.
