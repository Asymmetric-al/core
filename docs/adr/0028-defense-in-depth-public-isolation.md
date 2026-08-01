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
