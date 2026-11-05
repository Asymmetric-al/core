# ADR-IM-006: Practice runs, and Practice copies in a separate Practice environment

**Status:** Accepted 2026-11-02 — ratified by the founder in the Phase 30 grill (Q6). Record: `docs/features/imports-migration/grill/decision-log.md` §1 Q6; evidence, 30 edge cases and acceptance criteria `grill/q06-rehearsal-mode/` (`q06-adversarial-review.md`). Amends ADR-IM-001 (practice runs, pause measurement, abort, decommission), ADR-IM-002 (Approved environments, evidence) and ADR-IM-005 (Asym help access does not extend to copies).

## Context

Q1 limited practice runs to staging with no target-owner write. Previews are shallow everywhere; vendors that migrate real donor data validate it in real-data copies (Salesforce sandboxes, Blackbaud hosted test databases, Microsoft mock cutovers), and only real commits time the save step. Only Phase 23 and Phase 21 define no-write checks. A copy inside production would fail open: the Stripe client falls back to Asym's live platform key (`packages/api/src/stripe/tenant-client.ts:64-66`), email sending has no tenant gate, the public CMS resolver ignores `isActive`, each login has one tenant, some names and Phase 24 reservations are globally unique and permanent, and owner rules forbid purging tenant history. Regulators accept real-data test copies only with production-equal protection, need-to-know access, logging and deletion.

## Decision

Practice runs stage the whole switch in production (gifts and relationships reference staged donors by old-system ID) and each Minimum Switch Kit area checks rows without saving (O28). Before go/no-go, a ministry decision-maker builds a **Practice copy** from a practice run: the plan is committed through the real owner import commands into a separate, Approved **Practice environment** (own database and deployment, production's region, size and release; no live credentials, public routes, donor or missionary apps or sign-up; email only to the access list, else captured in a Practice outbox; provider keys, domains, webhooks, bindings, integrations, AI and tax issuers refused). The dress rehearsal times each family, includes one forced interruption and resume, and lists plan/commit mismatches; go/no-go requires a copy on the current mapping and release with none open, and sets pause limits at measured × 1.5. A copy holds only allowlisted configuration, referenced existing records (production IDs) and practice rows; never credentials, bindings, hosts, giving addresses, issuer state, integrations, grants, logins or source files; it is never promoted and sends nothing back but content-free status. Access mirrors production for chosen members (no donors, missionaries or Asym staff). One copy per tenant, 14 days plus one extension, destroyed at Go, abort, agreement end, request, release change mid-build, or within 24 hours of an erasure, new restriction or source disposal, by an access-first, resumable, environment-only purge with a receipt stating backup expiry. Copy results are rehearsal evidence only. No switch is offered until the Practice environment is Approved.

## Considered options

- **Plan-only previews (A)** and **staged practice runs only (B):** rejected as insufficient; B is kept as the inner loop.
- **Copies as tenants inside production:** rejected; fails open next to live credentials and needs production purges and login changes.
- **A project per copy; Vercel-gated sign-in; copy promotion; Asym access to copies; several copies per tenant:** rejected as overbuilt or unsafe.

## Consequences

- Owner requirements O28 (no-write checks), O29 (Practice environment), O30 (copy job, mirrored access, purge, retention-rule exception for copies) and O31 (fix the Stripe fallback, hard-coded tenant and resolver before real data anywhere).
- Production releases must also deploy and migrate the Practice environment; hosted background jobs must exist there.
- Dress-rehearsal value is monitored (M-Q6-5); the founder may later make it optional.
