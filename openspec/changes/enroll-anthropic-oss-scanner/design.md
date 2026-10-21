## Context

The scanner anonymously clones a maintained public branch, builds with networking,
and investigates without networking on two CPUs and 8 GiB RAM. Build-time processes
do not survive. Core has three Next.js apps, local PDF packages, native dependencies,
PostgreSQL/Supabase contracts, Payload migrations, and a separately governed Eve runtime.

## Decisions

Retain full source, development dependencies, browser binaries, local fonts, app
artifacts, and local service tools in `/src`. Pin Node/Bun to the committed runtime
files and use frozen installation with the existing postinstall repairs.

Use a strict build with synthetic loopback configuration. Exercise Eve's service
dispatcher separately as preview artifacts without sandbox prewarming. Runtime
helpers construct an allowlisted environment and reject source-local env files.

Run disposable PostgreSQL 15 under its service user on loopback. Reuse Core's
local-only migration verifier and committed Payload migrations. Real SQL/RLS
proofs are separate from mocked provider unit seams. Normal app health remains
degraded without full Supabase; demo flags exist only in explicit demo commands.

The existing field-policy census checks an actual historical Git object. Fetch
that object anonymously into a separate bare store for standalone image checks;
keep `/src/.git` absent so the official wrapper restores the actual scan clone's
full history. Initialize the disposable database with explicit UTF-8 encoding.

The designated public contact is `blake@globalfellowship.org`. Findings remain in
the private reporting process. No CC or PGP configuration is invented.

## Validation And Limits

Run focused environment isolation checks, scanner image builds, explicit offline
SQL/unit/browser checks, Core preflight, and the upstream wrapper against the
published branch. Recheck the maintained branch after merge. No mock, build, PR,
or silence proves service acceptance, email delivery, scanning, or security.

## External Dependencies

Anthropic controls eligibility, review, builds, and scheduling. A contributor's
CLA acknowledgment must come from the authorized human. Preserve exact evidence
and the next resumption action in AL-2177 when external action remains.
