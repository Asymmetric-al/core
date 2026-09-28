# Design

Persisted email fields reuse sqlCheckEmail, which matches position('@') > 1
without trimming or normalizing stored values. This changes read compatibility,
not outbound address validation. Agent, nested conversation and inbox readers
exercise the same SQL-valid and SQL-invalid classes. A real Supabase adapter
fixture feeds the actual live API reader and collection reader to prove parity
for an assigned conversation, an empty subject and a partial canonical contact.

Collection validation remains per row. A malformed row cannot discard valid
neighbors; one diagnostic records its stable ID when available, issue paths and
the total rejected count. Raw row contents are not logged.

Workspace pinning delegates package export resolution to Vite with package.json
inside the current checkout as the package self-reference anchor. Native Vite
owns conditional, wildcard and denied exports. Missing declared targets fail;
only packages without exports retain the prior filesystem lookup. Real Vite
tests compare the applicable cases with the pinned Node 24 runtime.

The retirement scanner keeps its general build/dependency exclusions and limits
.output/.nitro exceptions to packages/eve-runtime. A temporary repository fixture
proves non-Eve paths remain scanned and exact Eve output remains excluded.

The optional collection cache and current TanStack Query UI hooks remain
separate, with their existing distinct keys and startSync:false. Historical
Phase 7 diagrams/examples are labeled locally; current Supabase ownership stays
explicit. No runtime adapter or tenant-context ownership is moved.
