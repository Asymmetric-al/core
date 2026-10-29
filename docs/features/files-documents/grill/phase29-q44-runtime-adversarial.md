# Phase 29 Q44 A — Independent runtime, data and lifecycle adversarial review

Prepared 2026-10-25, Asia/Bangkok. Conrad selected A: a bounded private ZIP for a finite selected set of ordinary request evidence originals. These are proposed required amendments and prospective native proofs, not ratification, an implementation, a hosted audit or an activation certificate. Only this assigned note is edited.

## Disposition and smallest complete model

Retain A, with three distinct facts: the durable operation records the exact reviewed intended selection; an immutable package generation records the verified actual ZIP and embedded contents/outcome manifest; each delivery attempt records only the transfer facts actually observed. These distinctions need not be three engines or three user steps. One deliberate Download may prepare and deliver the unchanged complete reviewed set while the original active interaction and current authorization remain valid. A partial/changed outcome requires an explicit usable choice before downloading that changed set. Returning later does not authorize a surprise download.

The package must be complete and verified before Ready or any client delivery. Streaming already sealed bytes is compatible with this rule; streaming an unfinished archive directly to the recipient is not. A valid ZIP, upload success, browser click and HTTP completion each prove less than the staff member having a complete, correctly stored local collection.

The main risk is disclosure after preparation. Every byte and embedded manifest field travels together. Loss of current disclosure authority for any included original or manifest detail blocks the entire old ZIP, including a range that appears to cover another member. The user may deliberately review and prepare a new permitted selection; the system may not edit the sealed archive, silently substitute latest bytes, automatically generate residual packages or keep serving it through an old storage URL.

## Freshness, instructions and evidence limits

Independently compared `e483673725cbdc26a49eacb71f7bc22d0e41008e` to live `develop` during this selected-answer review: **identical, zero ahead/behind, zero changed files**. Local checkout remains the historically inspected `3d85897ebf1515008ef5c676b1c58a15422fb9ab`; no pull or equivalence claim. The preceding complete 6ac594→e483 range was 23 commits/eight patched paths: donation query/readback/replay handling, the API donation-select export and tests. It added no Q44 capability. The research note retains its complete classification.

Read root and applicable API/Auth/Database/Supabase instructions, backend/data-access rules, the OpenSpec current-versus-intended index, Supabase and Postgres skills, relevant P12 authorization/egress clauses and the Q44 question. The skills inform inspection; their generic policy examples do not supersede P12's one-PDP/coarse-Tenant-RLS contract. Current source was fetched at e483 for the critical auth, service-client, operation, retention and SQL paths below. No credentials, private records, hosted SQL, provider state or configuration were inspected or changed.

Existing tests were inspected, not executed. The only executed experiment was the small credential-free, entirely in-memory ZIP probe documented below. No native feature, real-role database, stream, load, deployment, browser or billing qualification was performed.

## Current implementation evidence and reuse limits

| ID  | Exact source evidence                                                                                                                                                                                                                    | Actual behavior and implication                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E01 | `packages/api/src/eve/retention/control.ts:16–17,67–155`, blob `b04b05739482da8934e64dd9c2aa715bafc1499b`                                                                                                                                | Redacts text/JSON, limits encoded bodies to 5,000,000 bytes, registers an artifact, hashes/uploads it, completes metadata, and attempts cleanup after error. Useful adjacent staging mechanics, but wrong body semantics and purpose for untouched ordinary originals. Its cap is not a Q44 cap; a failed completion response is not by itself proof completion did not commit.                                                                                                                         |
| E02 | Same file `:157–178,217–296`                                                                                                                                                                                                             | Owner/Tenant/status/expiry lookup precedes a 60-second signed URL. Expiry uses claim/begin/remove/finalize RPCs. Neither owner identity nor a short storage URL supplies Q44 per-use current export authority; its lease timing and global super-admin expiry permission are not Q44 defaults.                                                                                                                                                                                                          |
| E03 | `packages/api/src/eve/retention/route.ts:15–31,33–84`, blob `8600a26743df7fdbab8b5a7dc2388845203360a9`                                                                                                                                   | An admin/super-admin role-gated route handles artifact commands. It is not the selected staff capability/source lane.                                                                                                                                                                                                                                                                                                                                                                                   |
| E04 | `packages/api/src/shared/with-operation.ts:112–179`, blob `86da81fed1ccb7a39bf5065c0bd8349cf351ac23`; `packages/database/supabase/admin.ts:14–45`, blob `8f0f04cf6c76717d7444f810cf722829df483d2a`                                       | Shared wrapper obtains a service-role client, validates authentication/optional roles and supplies an audit logger. The wrapper does not prove fine-grained Q44 authorization or audit-before-serve. Service credentials remain mechanics, not authority. Raw errors also require the new purpose's safe diagnostic boundary.                                                                                                                                                                           |
| E05 | `packages/auth/context.ts:266–337,355–377`, blob `a1fb819f1cfd6e5eb233aeb1c617a79b6e1f3a06`                                                                                                                                              | Current context resolves a profile Tenant/role and active memberships; its super-admin fallback and membership-role aggregation differ from the intended exact Active Tenant Assignment/P12 source admission. Do not copy that fallback into Q44.                                                                                                                                                                                                                                                       |
| E06 | `packages/auth/capabilities/effective-capabilities.ts:9–37,137–161`, blob `1e009950be6f86e9c7d06f0171dcb35c2c76bd72`                                                                                                                     | Prepared pure capability resolver validates one selected context, rejects foreign/inactive/multiple assignments, and returns bundle capabilities. It does not load current source objects, run the subtractive floor, authorize bytes, meter egress or establish a live Q44 command. It is a foundation, not the complete P12 PDP.                                                                                                                                                                      |
| E07 | `supabase/migrations/20260718022535_eve_retention_replay_tracer.sql:35–78,120–155,159–249,373–496,548–567`, blob `4706eabfc57ee2536545c94e31e49d5c67fb917b`                                                                              | Eve has private storage, metadata statuses, size/hash constraints and unique storage paths; browser table/RPC access is revoked and service operations/definers are granted. Its actor check receives an already-trusted role and checks profile/Tenant. Its SQL allows `.zip` in a path regex but content types/body producer remain text/JSON. A filename regex is not an archive product. Its holds/deletion locks are purpose-specific examples, not proof of Q44 races or effective hosted grants. |
| E08 | `supabase/migrations/20250101000000_init_schema.sql:459–510`, blob `0334345b7ede506606b128983eafe5a6392733f4`                                                                                                                            | The historical `document-uploads` declaration is public with public-read and authenticated upload policies. This is not a private Q44 staging destination. Declaration inspection does not claim the current hosted bucket or all effective deployment settings.                                                                                                                                                                                                                                        |
| E09 | `supabase/migrations/20260226113000_authz_memberships_foundation.sql:130–155`, blob `fce963c72102a8f2512565d3613e003e66aaf9fc`; `20260802041500_current_user_memberships_rpc.sql:22–50`, blob `32e77924d95dd097acbffd0f94dace265727f5a8` | Existing helper reads a JWT Tenant; membership RPC binds active rows to `auth.uid()` and a target Tenant, and returns roles without the exact assignment ID. Neither establishes that future Q44 application and coarse RLS use one validated Tenant Authorization Context.                                                                                                                                                                                                                             |
| E10 | `tests/unit/supabase/eve-retention-replay-tracer-migration.test.ts`, blob `133d5c5b28824308ea72dc5a51abd3b660a18c98`; `tests/unit/packages/api/eve-retention-control.test.ts`                                                            | Migration tests inspect SQL strings; control tests mock storage/RPC for redaction, size and cleanup. They do not exercise actual combined grants, real-role RLS, commit ambiguity, concurrent storage removal or all included original disclosures.                                                                                                                                                                                                                                                     |
| E11 | Research-note current blobs for CRM report CSV, data-table CSV/Blob, contribution single-PDF response, donor text receipt and document-cutover                                                                                           | Their real functions remain adjacent, purpose-specific mechanics. A CSV of loaded rows is not authoritative file selection; one PDF buffer is not a bounded archive; cutover assessment is not runtime custody. None supplies a Q44 native producer.                                                                                                                                                                                                                                                    |
| E12 | `packages/api/package.json`, current blob `4fdc6f523f93d0c96e3aa532f9fe8b17178aed14`                                                                                                                                                     | The live delta adds only a donation-select export. Scoped root/API/UI manifests do not establish a selected ZIP dependency. No claim about every transitive library is made. The eventual writer's exact version/license/security/runtime compatibility still needs qualification.                                                                                                                                                                                                                      |

These are verified distinctions and reuse hazards, not assertions that the absent Q44 product has a deployed exploit. Source inspection alone cannot certify effective grants, policies, provider behavior, production capacity or deployment readiness.

## Primary technical research

The current primary references were read for this review, with Supabase also corroborated through Context7:

- HTTP preconditions follow normal request checks; range retrieval is optional, and strong validators bind the exact representation. Apply Core authorization before conditional outcomes and metadata. No standard promises application-specific resume or local file custody. [RFC 9110, §§13–14](https://www.rfc-editor.org/rfc/rfc9110.html#section-13).
- `no-store` constrains compliant caches; it cannot recall an already received copy or guarantee a malicious client erased it. Protect the actual CDN/app/browser boundaries. [RFC 9111, §5.2.2.5](https://www.rfc-editor.org/rfc/rfc9111.html#section-5.2.2.5).
- International download filenames use the Content-Disposition contract, whose safety guidance treats names as advisory. Core still must construct safe names and avoid header injection. [RFC 6266, §4.3](https://www.rfc-editor.org/rfc/rfc6266.html#section-4.3).
- ZIP has local entry records, a central directory/end record and per-entry CRC. Stored entries need no compression. The format permits features this decision excludes; format validity does not establish source completeness, safe names or current authorization. [PKWARE APPNOTE 6.3.10, §§4.1–4.3](https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT).
- Message-content digests and representation digests are different facts, particularly for partial responses. A checksum must name what it covers; a digest without a trusted binding does not grant access or establish who supplied the data. [RFC 9530](https://www.rfc-editor.org/rfc/rfc9530.html).
- Storage service-key requests bypass RLS. Storage signed URLs use a key separate from Auth and survive Auth key changes until expiry. A short signed URL is therefore not a substitute for the required current source/P12 retrieval path. [Supabase access control](https://supabase.com/docs/guides/storage/security/access-control), [private downloads](https://supabase.com/docs/guides/storage/serving/downloads).
- PostgreSQL distinguishes row visibility (`USING`) from proposed row acceptance (`WITH CHECK`); permissive/restrictive policy composition, inherited privileges, owners, views and privileged functions matter. Missing explicit WITH CHECK is not automatically a vulnerability because applicable USING can supply its default. Review effective behavior, not keyword counts. [PostgreSQL 17 CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html), [row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html).
- Vercel's ordinary response limit is not a universal ZIP cap: its official guidance distinguishes streaming. Duration, memory, open resources and backpressure still constrain the actual route. No provider plan, quota, new vendor or unchanged bill is inferred. [Function limits](https://vercel.com/docs/functions/limitations), [streaming response distinction](https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions).

## Calibrated findings

Likelihood means a plausible implementation error without the amendments, not an observed incident rate.

| Finding                                                          | Severity / likelihood            | Concrete cause and amendment                                                                                                                                                                                           |
| ---------------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Preparation mistaken for continuing grant                        | High / plausible                 | E02 signed retrieval or a ready-row check can serve stale originals/manifest. C06–C08 require current whole-generation authorization and all-door fences.                                                              |
| Archive validity mistaken for completeness or integrity          | High / plausible                 | ZIP CRC and success can coexist with omitted or duplicate members; E01 hashes a producer buffer but does not prove this source set. C03–C05/C10 require authoritative set reconciliation and sealed artifact evidence. |
| Current role/service path mistaken for P12 authority             | High / plausible                 | E03–E09 are real but incomplete for exact source/assignment export and coarse Tenant RLS. C01/C02/C11 and real-role proof close the gap.                                                                               |
| Lost response, stale retry or cleanup recreates work             | High / plausible                 | Build/storage/DB are separate; ambiguous completion followed by deletion can damage a committed result, while delayed workers can recreate canceled objects. C03/C09/C12/C15.                                          |
| Partial/unknown becomes complete, denied subset or empty success | High / plausible                 | Filtering a source query or swallowing authorization failure hides missing members or a whole-operation restriction. C04/C06.                                                                                          |
| Unbounded CPU/memory/storage/egress or range abuse               | High impact / workload-dependent | Buffering all inputs, compression, unbounded streams/concurrent retries and indefinite held staging affect unrelated intake. C10/C13/C14. No measured load claim.                                                      |
| ZIP metadata or outcome becomes a disclosure path                | High / plausible                 | Names, hashes, membership/counts, validators and logs can reveal restricted material even when body GET is denied. C05–C08/C14.                                                                                        |
| Proposed lifecycle overwhelms the useful workflow                | Medium / plausible               | Mandatory confirmation chains, package settings/platform, multipart repair and routine operator SQL add complexity. C01/C04/C09/C16 keep one bounded operation, one reviewed output and ordinary recovery.             |

## Exact proposed amendments

### C01 — Scope and independent source authority

The first cohort is authorized staff preparing a finite explicit set of ordinary request-source evidence contributions/uses, each tied to its exact source-approved original version. Preserve Tenant/environment, request/item/use lineage, applicable Legal Entity, origin restrictions on Q28 reuse, classification, safety, purpose and current download/export capability. Neither visible metadata, folder/view membership, preview/read, acceptance, prior receipt nor equal bytes authorizes export. A whole-operation or restricted-set prohibition is not satisfied by dropping its inconvenient members.

Request completion or cancellation is not a universal Q44 staff-export permission or prohibition. Its effect comes from the current source's actual staff-export rule. Do not borrow Q40 pending-notice utility, Q41 external-share cancellation rules or Q04 participant rights. Package cancellation/expiry has its own terminal effect below. P21 official Records Export Packages, P18 artifacts, P31 destinations, Q41 external shares and source retention/disposition remain separate. No new notification, public link or recipient enrollment is added.

### C02 — Exact finite intent and coherent admission

Server-validate the actor's exact current context, purpose and full selection. Bind the reviewed finite use/version set and relevant basis; resolve IDs server-side rather than accepting bucket keys, URLs, paths, roles, hashes, byte sizes or authority flags from the caller. Normalize exact duplicate selections once; equal bytes in distinct source uses remain distinct facts with permitted mapping. Neither a folder nor a live view/query/pagination cursor is a durable selection. Prove coverage of the entire requested set, including missing/duplicate/extra/foreign/stale members.

Commit the operation, exact intended set, durable original result identity/history and capable handoff coherently. A worker can begin only from a committed authoritative operation. Failure of optional UI projection is not failed admission; failure of actual authority or durable operation evidence cannot be labeled accepted. Preserve the user's lawful selection when unavailable without pretending a draft is a prepared package.

### C03 — Operation, generation and transfer facts

Keep original intended selection separate from actual admitted/included outcomes, sealed package identity and transfer attempts. The protected original record is not rewritten when a source later becomes restricted. Current result disclosure may narrow without changing historical truth.

Build privately with a bounded current-authorized worker. No partially built object is deliverable. Before Ready, reconcile the final central directory/member enumeration and manifest to the exact admitted output, verify each included original's actual byte count and source-qualified cryptographic digest, record complete sealed ZIP identity/length/digest, and commit one authoritative generation result. The exact verification method may combine streaming input hashing, writer validation and qualified stored-artifact integrity; no mandatory production decompression pass is invented. Provider acceptance alone is insufficient. Stale/duplicate workers cannot overwrite, reseal or promote the wrong generation. Lost completion responses reconcile durable state before cleanup, re-upload or failure claims.

### C04 — Explicit partial result and no empty-success archive

Known unavailable/failed/not-started members and member-level uncertainty may be truthful non-included outcomes only if whole-command and partial-output authority independently remain valid. Unknown original selection, whole-command authority, restricted-set permission or manifest completeness blocks Ready; it is never zero or a permissible filtered set by default.

If the actual included set differs from what the staff member reviewed for delivery, show only currently permitted actual scope and incompleteness and require a deliberate Download of that partial result or a newly reviewed preparation. No automatic partial delivery. Zero included originals produces an honest safe outcome/recovery, not a successful manifest-only ZIP. A source-required indivisible set may not be split to evade that rule. A new selection after a partial/expired/canceled result is a new deliberate command; it does not mutate or silently append to the old one.

### C05 — One readable manifest and correctly bound integrity

Include one bounded readable UTF-8 `CONTENTS.txt` with safe actual output names, permitted exact-source/version mapping, included byte counts and source-qualified SHA-256 values, plus truthful permitted omissions/outcomes. Reserve the manifest's delivery name to prevent an original overwriting it. No PDF, HTML, CSV or JSON export menu is required. Filenames, IDs, hashes, timestamps and counts are disclosed only where their own source projection permits. Do not add undisclosed transcript/comments, private paths, credential URLs, document bodies, embedded location metadata or provider diagnostics.

Bind the complete ZIP hash externally in its sealed generation/result record: a whole-archive digest inside that same archive would be self-referential. Member hashes may be inside the manifest. The archive CRC, storage ETag, library success, transport digest and source-approved SHA-256 serve different purposes; none substitutes for authority, exact membership or provenance. Integrity is relative to the declared exact versions and output, not a statement of legal/source completeness or verified external custody.

### C06 — Current authorization of the whole sealed representation

Before each applicable disclosure/retrieval, resolve the same current P12/source authority for every included original and every embedded manifest field, under the exact acting context and purpose. A denied or unknown included disclosure blocks the whole existing ZIP. Do not redact its embedded manifest on the fly, stream only a seemingly safe byte range or replace restricted bytes under the same generation. A separate safe status projection may show only permitted outcome information.

Check current source/permission/classification/safety/hold/access state at selection/admission, worker reads, seal/release and serving. Do not universally invalidate an exact historical version merely because a later correction exists; apply its actual source rule. Conversely, an origin restriction survives a Q28 target-use link. All byte and metadata paths enforce the same decision. Technical failure or temporary authorization/proof failure is denial while uncertain, not an invented permanent source revocation; package cancellation/expiry and actual terminal source restrictions are not revived by a later policy change.

### C07 — One PDP, coarse Tenant RLS and bounded set-wise egress

The exact source command and PEP use P12's sole resolver, trusted Tenant Authorization Context, current assignment/service/operator binding, relevant Legal Entity scope, purpose, grants/floor, epoch and expiry. Workers use their own qualified source/service authority and current owner ceiling, not a stored human role or unrestricted service client. Raw routes/API/SQL are either closed or pass the same qualified boundary. RLS remains forced coarse Tenant defense using the unified validated Tenant source, not a second membership/capability/purpose engine.

Preserve P12 §A R6's logical **≤1 governance-row SELECT + ≤1 ledger UPDATE per governed read**, its stated sharded carve-out and restricted-tier safety priority. Evaluate complete finite membership and policy floors set-wise/index-backed; do not make one PDP/ledger/DB round trip per member, column or byte. This is not a limit of one total source-data query or one storage request. Batch audit/metering and chunk continuation follow P12's tier/stream contract; do not substitute a single old authorization for a long stream. Qualify the source/epoch/expiry continuation fence without holding database locks throughout network delivery or inventing a global Tenant reader lock.

### C08 — HTTP and every disclosure door

Use private authenticated application retrieval, not a public bucket or transferable raw storage URL. Authorize before filenames, sizes, integrity values, status, manifest, HEAD, conditional/304 outcomes and range/416 metadata. Prevent app/RSC/CDN/service-worker/shared-cache mixing across principals, assignments, Tenants, purposes and generations. Use the qualified private cache/attachment/content-type/no-sniff/referrer treatment; no-store does not mean already received bytes can be recalled.

If ranges/resume are supported, bind them to the same immutable generation and strong representation identity; never splice bytes from a later regenerated ZIP, silently select a new package on If-Range mismatch or claim resume without intended-client proof. Apply the same whole-generation authorization to every range and continuation. Bound multi-range/small-range abuse or deliberately do not support it. No range or conditional bypass and no resume feature are implied by choosing ZIP. Long transfers recheck current expiry and owner-required revocation signals at bounded chunks; stop future bytes/admissions on effective denial, acknowledging already in-flight/received bytes cannot be recalled.

### C09 — Semantic replay and permanent straightforward recovery

After authenticating the caller/context for safe reconciliation, look for a matching committed command identity and compare its original normalized payload before applying new-command eligibility. Same identity/same input reconciles the original durable operation; altered input conflicts. Current authorization independently limits what original result may be disclosed or retrieved. Do not issue a second package simply because a response, progress notification or client acknowledgement was lost.

Unsealed worker retries may continue only the original admitted operation within its current authority/deadline and fenced ownership. Repeated Download of an existing eligible sealed package creates/reconciles transfer facts, not a new generation or source mutation. A changed selection, terminal old result or newly requested preparation is a distinct deliberate current command. Keep a minimal opaque dedup/result-or-reject basis independently of shorter readable history; once exact replay is unverifiable, reject stale invocation rather than recreating work. After restore, an old command cannot become new merely because a row/object is absent.

### C10 — Safe flat archive and resource-safe content handling

Write regular entries with flat bounded collision-safe output names and a permitted manifest mapping; ordinary home folders are not replicated. Protect separators, absolute/drive paths, dot segments, NUL/control characters, header injection, reserved platform names, Unicode/case/normalization collisions, trailing-dot/space ambiguities and the reserved manifest name. Distinct originals cannot silently overwrite. Do not copy symlink/device/executable attributes or uncontrolled ZIP extras/comments. The exact original contents remain byte-identical; presentation naming is not source rename.

Use a qualified ordinary extractor-compatible ZIP writer with bounded Store/Deflate behavior. No self-extracting code, password/encryption-distribution flow, multipart splitting, archive browser or new provider is selected. An uploaded ZIP/office container stays one original; do not unpack nested contents or execute macros. Bound actual input and output bytes, count, name/manifest/header sizes, compression work, buffers, descriptors and deadlines while processing, not merely declared metadata. A highly compressible input must not turn a small compressed-size quota into unbounded uncompressed work. Qualification of exact writer/version/license and operating systems remains required.

### C11 — Structural database invariants and every effective writer

Enforce immutable Tenant/environment/source attribution and compatible composite relationships among operation, intended members, exact source use/version, generation, output-member/result and transfer facts. Actor/assignment IDs are trusted provenance, not client-overwritable authority. Enforce unique semantic operation identity, unique exact admitted member and output name, one sealed generation result per generation, immutable finalized payload/hash/object locator and coherent state/time/size/hash constraints. No unique digest collapses distinct uses; no nullable scope key admits ambiguous uniqueness. Do not cascade source/profile deletion into silently losing required operation evidence or into provider byte deletion.

Audit actual accumulated grants, RLS enable/force state, both old/new-row semantics, permissive/restrictive policy composition, UPDATE SELECT prerequisites, INSERT/UPDATE/DELETE/UPSERT/MERGE, owner/BYPASSRLS/definer behavior, views, triggers and storage permissions. A trigger writing related rows is another privileged path. Missing explicit WITH CHECK is judged by effective policy, not falsely labeled an automatic flaw. Never turn coarse Tenant RLS into a second fine-grained PDP. Close direct browser writes/listing and unsafe raw Data API/GraphQL/CMS/realtime routes; all trusted writers, workers, operators and repair paths must validate the same source scope and expected state. No security claim is earned by service-role tests or SQL text assertions alone.

### C12 — Ordering, deadlines, cancellation and cleanup

Order operation admission and relevant source/current-policy changes; seal and cancellation/expiry; lease ownership and retry; delivery admission and current revocation; cleanup and active build/read/hold. Use short atomic source/state decisions and bounded fencing, not a database transaction held across provider uploads or browser streams. Record authoritative instants/deadlines distinctly; a client clock, job start or delayed cleanup run cannot extend eligibility. Equality at an end is expired. Database time used at an admission must be current for that admission, not an indefinitely old transaction-start snapshot.

Cancellation ends the package operation's future work/serving; it is not request cancellation, file deletion or evidence rejection. Browser transfer abort ends that attempt without automatically canceling the package. Expiry ends delivery even if physical deletion is delayed or a hold retains the object. Before removal, acquire the qualified cleanup fence against active builders/readers and holds; before seal/serve, check the reciprocal fence. Late upload completion cannot recreate or promote a canceled/expired generation. Reconcile ambiguous storage writes/deletes rather than falsely declaring absent/available/deleted. Preserve independent originals and admitted source history throughout.

### C13 — Bounded work and real cost

Before activation qualify finite source-defined member/input/output/manifest/name limits, maximum preparation/read duration and buffers, concurrent/queued work per actor/Tenant/platform, bounded retry and worker lease recovery, stream/range budgets, and short staging/readable-outcome lifetimes. Measure actual retrieval, hashing, compression, verification, repeated downloads, cleanup, logs and held bytes on the current infrastructure. No fixed Vercel response cap, Eve artifact cap, generic 30-day timer, email retry bound or zero-cost claim is imported.

Oversized/unsupported selections get an actionable smaller-selection or ordinary qualified individual-download route. No silent automatic multipart job or fallback public link. Backpressure, cancellation and fair scheduling must protect intake/review and other Tenants. Temporary work uses actual source cleanup/hold policy: a held copy beyond ordinary TTL is unavailable for delivery and enters restricted retained-copy accounting/escalation, not hidden quota bypass or infinite worker retry. A hold is not access permission; a package expiry is not source disposition.

### C14 — Safe facts, audit and operator recovery

Preserve restricted source history of the original intent, authority/basis, actual included outcomes, generation integrity, irreversible states and observed transfer/cancellation/cleanup facts. Emit only source-qualified safe IDs and bounded redacted diagnostic classes to general logs/telemetry. Names, hashes, paths, manifest text, content, credentials and row-level denial details do not become generic metrics/error payloads. Follow P12's tier-specific audit-before-serve/outbox/metering policy without a competing logger or per-byte audit storm.

Expose useful Prepared/Ready/partial/blocked/expired/failed/in-progress/unknown facts only when justified. A completed server stream may be recorded as such, never as local save, human read, legal completeness or verified destination custody. Support/operator recovery uses the same source-qualified reconciliation, retry, cancel or deliberately new preparation, with purpose/current access and audit. No routine SQL edits, bucket console operations, blanket operator plaintext or requiring a participant to resubmit already received evidence.

### C15 — Prospective activation, restore and safe rollback

Release only the qualified ordinary source cohort and actual command/worker/storage/serving/cleanup doors. Do not backfill old uploads, Eve artifacts, CSV results, provider objects or public document URLs as verified packages, complete original selections or current authority. Legacy references are truthful/unavailable until independently qualified. Deploy additive state/schema/contracts and close old writers before exposure; old binaries must reject unsupported new states rather than mutate sealed generations.

Rollback may stop new admission and delivery while retaining lawful recovery/history and source evidence; it may not fall back to public storage or the old role-only route. Restore tests must cover DB and object-store snapshots from different moments, missing sealed objects, orphan uploads, stale workers, revived URLs, partial cleanup, expired/canceled facts and dedup history. No automatic renewal/rebuild or false source deletion from missing metadata. Cleanup proof covers all staged copies under the applicable backup/hold contract; retention does not authorize serving.

### C16 — Complete ordinary experience and no platform expansion

Provide bounded keyboard/touch/AT selection, clear source-permitted count/size and consequence review, truthful progress, deliberate partial download, stop/cancel distinctions, same-result retry, expired-result new preparation and an ordinary single-file alternative. Preserve focus/selection and current route context on recoverable failure; fence late old-context results. Do not add a duplicate confirmation for an unchanged simple one-intent case. Choosing fields or previewing selection must not issue/prepare/download before the deliberate action.

Keep the shared source/API/P12/custody/UI seams. No general export engine, all-history/live-query subscription, recursive folder drive, archive conversion, automatic notification, new destination connector, signature/certificate product or generic user-configurable compression platform is justified. Technical implementation details stay out of the ordinary flow except when needed to choose a lawful smaller selection or understand an actual outcome.

## Bounded synthetic ZIP experiment

Executed a single credential-free Python **3.12.3** standard-library probe, entirely through stdin/in-memory `BytesIO`; the largest fixture was **369 bytes**. No files, repo code, hosted SQL, private data or provider operations were used. This is an archive-behavior demonstration, not a selected implementation library, exploit test, runtime benchmark or native proof.

| Case                                              | Observed result                                             | Consequence                                                                                 |
| ------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Two ordinary members plus contents text           | Reader enumerated all; `testzip()` reported no bad CRC.     | Basic small fixture only.                                                                   |
| Contents text names a second file that is absent  | ZIP parses and CRC check passes.                            | Membership/manifest completeness needs separate source proof.                               |
| Two entries both named `same.txt`                 | Writer warned; reader exposes both; CRC check passes.       | Collision rejection cannot be delegated to ZIP validity.                                    |
| Entry named `../escape.txt`                       | Writer/reader accept it; CRC check passes; never extracted. | Explicit output-name policy is required; no extraction-vulnerability claim about Core.      |
| One stored payload byte flipped                   | CRC check names `file-001.txt` as bad.                      | CRC detects this accidental corruption; it does not prove source provenance.                |
| End-of-central-directory record removed           | Reader raises `BadZipFile`.                                 | Final structure must exist before Ready.                                                    |
| Original payloads unchanged but one entry renamed | Whole-ZIP SHA-256 changes.                                  | Generation identity covers actual container bytes/metadata, not only source member digests. |

## Required native proof groups — prospective, not executed

| Proof | Exact evidence needed                                                                                                                                                                                                         |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P01   | First ordinary staff source command; same/foreign Tenant and environment, exact acting assignment, purpose, entity/classification and origin restrictions; role/profile/view/read/acceptance do not confer export.            |
| P02   | Whole-operation/restricted-set denial, member denial and lookup outage are distinct; unknown cannot become empty/complete or silently filtered authorized subset.                                                             |
| P03   | Finite exact selection: duplicates normalize; same bytes across uses stay distinct; missing/extra/stale/foreign/overlimit members detected; no dynamic view/folder requery.                                                   |
| P04   | Original selection/history/handoff co-commit; crash before/after commit and lost response; no worker before authoritative operation or false failure from optional projection outage.                                         |
| P05   | Current exact original availability and integrity at worker reads; changed storage bytes under same locator, source correction and origin restriction races fail safely without latest substitution.                          |
| P06   | Full build and central-directory/manifest/member reconciliation before Ready; no child/member/partial build leakage before release.                                                                                           |
| P07   | Source-qualified member SHA-256, actual counts/bytes and external whole-ZIP digest; CRC/ETag alone rejected; corrupt/missing/truncated stored result cannot be Ready.                                                         |
| P08   | Partial preparation versus whole-command uncertainty, zero originals, unknown member and indivisible source set; deliberate partial download and permitted omissions without false completeness.                              |
| P09   | Protected `CONTENTS.txt` and status disclosure: restricted names, IDs, counts, hashes, timestamps, failure reasons and mapping never leak through omitted members or telemetry.                                               |
| P10   | Every included original and embedded manifest field reauthorized at release/retrieval; losing one blocks old ZIP; no byte-range exception or in-place redaction.                                                              |
| P11   | Request fulfilled/canceled, evidence accepted/unaccepted/removed, later correction and Q28 origin state evaluated by actual staff-export rule, without borrowed Q40/Q41 status rules.                                         |
| P12   | Current source/authority/epoch/expiry races in both orders against command, worker read, seal and transfer admission; no global long-lived read lock or obsolete cached decision.                                             |
| P13   | Authenticated GET/HEAD/conditional/304/Range/416/status/manifest/digest doors; foreign IDs and direct storage/API/GraphQL/CDN/cache paths deny without existence/detail leaks.                                                |
| P14   | Optional same-generation strong-validator resume; ignored/unsupported ranges honest; mixed-generation, many tiny/overlapping ranges and If-Range mismatch cannot bypass intent or budget.                                     |
| P15   | Long-stream current expiry/revocation and bounded buffers; loss of authority stops future serving, interrupted/in-flight bytes truthfully classified, no local-custody claim.                                                 |
| P16   | Matching committed semantic operation reconciled before new eligibility; changed payload conflicts; safe original-result disclosure independently current; same-key retry never generates again.                              |
| P17   | Multiple transfers remain distinct from one prepared generation; disconnect/response loss/duplicate click/browser retry do not establish failure, save or a new preparation.                                                  |
| P18   | Concurrent worker leases/retries and storage completion ambiguity; stale worker cannot seal/overwrite; failed completion response never causes deletion of proven committed ready object.                                     |
| P19   | Package Cancel/expiry versus seal/new read/build/callback in both orders, exact deadline equality, delayed scheduler and stale transaction/client clocks; terminal result never revives.                                      |
| P20   | Browser cancel versus package cancel; recover ready same result or deliberately prepare anew under current rules, without new participant receipt or source mutation.                                                         |
| P21   | Cleanup versus live reader/builder/hold in both orders; stale upload after delete, ambiguous delete, orphan object, held expired copy and partial worker outage; no false deletion or retention-as-access.                    |
| P22   | Flat unique safe names: traversal/separators/drive/device/control/Unicode/case/trailing-dot-space/manifest collision; no symlink/device metadata, nested extraction or macros.                                                |
| P23   | Exact qualified ZIP writer/version/license and intended extractor compatibility; stored/deflated regular inputs, zero-byte allowed original, incomplete finalization and boundary counts/sizes without mandatory compression. |
| P24   | Real structural DB relationships/unique identities/immutability/state checks; foreign child, reparent, nullable scope, duplicate member/name, overwrite sealed locator/hash, source/profile cascade.                          |
| P25   | Real-role effective grants and RLS USING/WITH CHECK, policy composition, SELECT/INSERT/UPDATE/DELETE/UPSERT/MERGE, owner/BYPASSRLS, raw table/RPC/view/trigger/storage paths; ordinary role cannot forge worker completion.   |
| P26   | Single-PDP PEP enforcement for app, worker, service account, operator and alternative doors; one validated Tenant source reaches coarse RLS; no role or signed-URL fallback.                                                  |
| P27   | P12 set-wise governance/projection/metering/audit budget, finite complete-selection queries and relevant indexes; SQL plan/call counts detect N+1 under actual role and source distributions.                                 |
| P28   | Representative concurrent build/verify/download/cancel/cleanup: real bytes, high compression ratios, many small files, slow storage, unknown lengths, long streams and resource boundaries; no global capacity extrapolation. |
| P29   | Fair actor/Tenant/platform work and queue bounds, backpressure, overload and budget-accounting failures; smaller/individual recovery remains usable without starving intake/review.                                           |
| P30   | Restricted source history versus general diagnostics, P12 tier-correct durable audit and egress accounting, safe error classes; full names/manifest/content/provider secrets absent from telemetry.                           |
| P31   | Native keyboard/AT/touch/mobile/browser jobs: finite selection, one-intent complete path, deliberate partial, focus/context preserved, no auto burst or unexpected returning download, actual normal extraction.              |
| P32   | Prospective migration/activation and mixed old/new binaries; no public upload/Eve/CSV object reclassified, old writers closed, no invented grants/history/verification.                                                       |
| P33   | Mixed DB/object restore, missing generation, orphan object, aged-out readable history and dedup/result-or-reject basis, canceled/expired URLs and worker callback replay; no resurrection.                                    |
| P34   | Rollback/kill switches preserve original evidence and lawful outcome/reconciliation, close unsafe serving, clean staged copies with real hold/backup constraints and no routine SQL repair.                                   |
| P35   | Actual prepare, seal, transfer, cancel, expiry, cleanup and source-decision instants remain distinguishable; status wording never equates server success with human read/save/custody.                                        |
| P36   | Full source-to-browser vertical release evidence and negative paths, not source-string/mock/pure-resolver tests; actual configured runtime/storage/cost limits recorded before activation.                                    |

## All 22 adversarial categories

| Category                                   | Finding and disposition                                                                                                                                                       |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Necessity/alternatives                  | A keeps a finite collection together; individual Download remains useful. No measured Asym workload or universal ZIP preference; C01/C16.                                     |
| 2. Brittleness                             | High/plausible: evolving selection or archive metadata destroys replay/resume meaning. Immutable intent/generation and exact validators; C02/C03/C08/C09.                     |
| 3. Technical debt                          | Medium/plausible: reusing Eve role/signed-URL semantics or generic export framework creates wrong authority. Reuse only compatible seams; C01/C07/C16.                        |
| 4. Edge cases                              | High/plausible: duplicate names, missing member, zero originals, expired held object, unknown completion and range mismatch. C04–C12.                                         |
| 5. Footguns                                | High/plausible: Ready called downloaded; partial auto-delivery; browser Abort cancels source request. Separate facts/actions and deliberate changed scope; C03/C04/C12/C16.   |
| 6. Tenant safety                           | High/plausible: caller bucket keys, role/profile fallback, shared cache or another hat's result. Trusted exact attribution and all-door current checks; C01/C02/C07/C11.      |
| 7. Database/RLS/authorization              | High/plausible: service/definer bypass, missing constraints, wrong effective policies or duplicate fine-grained PDP. C07/C11/P24–P27. No money calculation introduced.        |
| 8. Overengineering                         | Medium/plausible: multipart engine, resumable upload platform, format menu, repeated confirmations and permanent workers. C09/C13/C16 retain bounded existing seams.          |
| 9. UX/UI/friction                          | Medium/plausible: blocked browser burst, inexplicable incomplete result, hidden expiry, lost selection and broken extraction. C04/C16/P31.                                    |
| 10. Source truth/invariants                | High/plausible: manifest claims whole source complete, latest correction replaces selected bytes or target reuse strips origin restrictions. C01–C06.                         |
| 11. Hidden coupling                        | High/plausible: folder/view changes retarget package, profile deletion removes evidence, request closure borrows external-share rules. C01/C02/C06/C11.                       |
| 12. Failure modes                          | High/plausible: provider acceptance/timeout, DB completion ambiguity, truncated ZIP, cleanup partial success. C03/C09/C12.                                                    |
| 13. Lifecycle/time/concurrency/idempotency | High/plausible: admission/seal/revoke/Cancel/expiry/hold races and old retry/restore resurrection. C09/C12/C15.                                                               |
| 14. Data integrity                         | High/plausible: wrong member, same-path changed object, CRC-only trust, manifest/container mismatch, duplicate filename overwrite. C02/C03/C05/C10/C11.                       |
| 15. Security/privacy                       | High/plausible: manifests/HEAD/ranges/diagnostics leak despite body check; forbidden original remains inside ZIP. C05–C08/C14.                                                |
| 16. Scalability/performance                | High impact/workload-dependent: compression CPU, buffers, descriptors, repeated transfer egress, N+1 authorization and unbounded held staging. C07/C10/C13.                   |
| 17. Operational burden                     | Medium/plausible: orphan uploads, stuck cleanup or invisible partial state require SQL/console repair. Source-qualified normal recovery and scoped controls; C09/C12/C14/C15. |
| 18. Observability/auditability             | High/plausible: one HTTP success hides member/stream failure or audit leaks originals. Truthful protected source facts and redacted operational counters; C03/C14.            |
| 19. Dependency/integration                 | Medium/plausible: no exact writer selected; public bucket, raw signed URL and buffered receipt route are unsuitable shortcuts. E01–E12/C08/C10/C13.                           |
| 20. Migration/rollout/upgrade              | High/plausible: old writers mutate new sealed state, historic URLs become qualified or mixed restore recreates ended packages. C15.                                           |
| 21. Testability/traceability/proof         | High/plausible claim risk: CRC probe, stubs and SQL strings cannot establish source/P12/native delivery. P01–P36 and explicit evidence layers.                                |
| 22. Other hazards                          | Medium/plausible: delivery gets mistaken for legal completeness, P31 custody, source disposal or participant access extension. C01/C05/C14/C16 expressly preserve owners.     |

## Budgets, controls and remaining evidence

Required measured budget families are: selection/member/metadata bounds; input/output/compression/verification work; memory/buffers/descriptors and storage IO; preparation/transfer/deadline/range limits; fair actor/Tenant/platform concurrency/retries; private staging plus restricted held-copy accounting; readable history versus minimal dedup/result-or-reject retention; and P12 governance/audit/egress plus actual provider cost. These are finite activation evidence, not invented founder constants or a capacity claim.

The operational controls must let the qualified owner stop new admission, stop affected serving, cancel an exact operation, reconcile exact worker/result ambiguity, run fenced cleanup/held-copy recovery and disable an incompatible writer/route during rollback. They are scoped existing owner/operator actions, not a new customer settings platform. Stops preserve source evidence and lawful history; recovery never substitutes unqualified public delivery.

A complete native implementation still needs the exact source command/authority, source relational mapping, prepared package producer, durable handoff, current-byte/manifest retrieval, finite cleanup/replay contract and intended staff proof. Root will consolidate these amendments with owner and UX findings, then the entire report/ADR will receive independent review. This note does not pre-approve that unseen package or claim Q44 activation.

## Executed probe transcript and preliminary decision-body readback

The exact Python program below was piped into `wsl -d Ubuntu-24.04 -- python3 -` once. It was not saved as a runtime/test file and was not rerun. Retaining the transcript here keeps all authored work within this assigned note.

```python
import io, zipfile, hashlib, warnings, json, sys, struct

def make(entries):
    sink = io.BytesIO()
    with warnings.catch_warnings(record=True) as seen:
        warnings.simplefilter('always')
        with zipfile.ZipFile(sink, 'w', compression=zipfile.ZIP_STORED) as z:
            for name, body in entries:
                info = zipfile.ZipInfo(name, date_time=(2026,1,1,0,0,0))
                info.compress_type = zipfile.ZIP_STORED
                z.writestr(info, body)
        return sink.getvalue(), [str(w.message) for w in seen]

def inspect(blob):
    with zipfile.ZipFile(io.BytesIO(blob)) as z:
        return {'names': z.namelist(), 'crc_bad_member': z.testzip()}

valid, _ = make([('file-001.txt', b'alpha'), ('file-002.txt', b'beta'), ('CONTENTS.txt', b'Expected: file-001.txt, file-002.txt')])
missing, _ = make([('file-001.txt', b'alpha'), ('CONTENTS.txt', b'Expected: file-001.txt, file-002.txt')])
duplicate, warning = make([('same.txt', b'alpha'), ('same.txt', b'beta')])
unsafe, _ = make([('../escape.txt', b'synthetic')])
renamed, _ = make([('other-001.txt', b'alpha'), ('file-002.txt', b'beta'), ('CONTENTS.txt', b'Expected: file-001.txt, file-002.txt')])
corrupt = bytearray(valid)
name_len, extra_len = struct.unpack_from('<HH', corrupt, 26)
corrupt[30 + name_len + extra_len] ^= 1
try:
    inspect(valid[:-22])
    truncated = 'unexpectedly parsed'
except zipfile.BadZipFile:
    truncated = 'BadZipFile'
print(json.dumps({'python': sys.version.split()[0], 'max_fixture_bytes': max(map(len,[valid, missing, duplicate, unsafe, renamed])), 'valid': inspect(valid), 'missing_expected_member': inspect(missing), 'duplicate_names': inspect(duplicate), 'duplicate_warning': bool(warning), 'unsafe_name_not_extracted': inspect(unsafe), 'stored_payload_corruption': inspect(corrupt), 'truncated_end_record': truncated, 'renaming_changes_archive_sha256': hashlib.sha256(valid).hexdigest() != hashlib.sha256(renamed).hexdigest()}, indent=2))
```

Observed stdout, compacted only in whitespace:

```json
{
  "python": "3.12.3",
  "max_fixture_bytes": 369,
  "valid": {
    "names": ["file-001.txt", "file-002.txt", "CONTENTS.txt"],
    "crc_bad_member": null
  },
  "missing_expected_member": {
    "names": ["file-001.txt", "CONTENTS.txt"],
    "crc_bad_member": null
  },
  "duplicate_names": {
    "names": ["same.txt", "same.txt"],
    "crc_bad_member": null
  },
  "duplicate_warning": true,
  "unsafe_name_not_extracted": {
    "names": ["../escape.txt"],
    "crc_bad_member": null
  },
  "stored_payload_corruption": {
    "names": ["file-001.txt", "file-002.txt", "CONTENTS.txt"],
    "crc_bad_member": "file-001.txt"
  },
  "truncated_end_record": "BadZipFile",
  "renaming_changes_archive_sha256": true
}
```

Read all sixteen paragraphs of the preliminary `work/phase29-q44-decision-body.md` on 2026-10-25. No material lifecycle contradiction was found. It preserves complete verification before Ready without requiring a redundant production decompression pass; whole-generation current disclosure; deliberate partial output; exact original replay; terminal package Cancel/expiry; actual source/hold policy; and a small ordinary ZIP scope. Sent the parent four proof carry-throughs: current admission time and exact end equality; cleanup/read/build/hold ordering plus late-upload fencing; real-role SQL including MERGE/UPSERT/composed policies/triggers; and no request-status-only staff-export rule imported from Q40/Q41. This preliminary readback is not whole-report/ADR closure; those artifacts were not yet supplied.

## Final independent whole-package review and closure — 2026-10-25

Read the complete consolidated `work/phase29-q44-adversarial-review.md` (378 lines) and `work/0044-bounded-private-zip-downloads-for-ordinary-request-files.md` (58 lines), including all sixteen exact decision paragraphs, evidence/alternatives/primary-source sections, executed-experiment limits, amendment crosswalk, all 22 categories, 24 lifecycle distinctions, 44 proof groups, 44 journeys, eight budget families, eight operating controls, synthesis/implementation order, founder adversarial questions and publication boundaries. This was a whole-package review, not a section-only or parity-only check.

The only correction requested from this full read was an exact authority reference: Q44-P27 initially said “Q44-P12 set-wise governance,” incorrectly naming the local race-proof group instead of the governing Phase12 authorization contract. The parent corrected it to “P12 set-wise governance.” Reread P25–P29 in context and verified that restoring that one phrase in the corrected file reproduces the previous whole-report hash exactly. Therefore no unseen substantive change entered the already fully read package. The ADR is byte-unchanged, and the complete exact decision still matches between report and ADR.

No unresolved material runtime/data/authorization/lifecycle issue remains in the proposed amendment package. In particular:

- The intended selection, normalized bindings, actual included/not-included outcomes, immutable sealed generation and distinct transfer attempts remain separate. Ready requires exact membership/manifest/container integrity; no direct unfinished build stream, empty success ZIP or wrong “all source files complete” claim appears.
- Command-wide/source/P12 unknown or indivisibility gates cannot be bypassed by filtering. Nonempty partial output has independent authority, an intelligible safe outcome and deliberate reduced-set consent. Omitted private facts and unknown coverage do not become complete/zero.
- Current source export authority—not request status, review acceptance, folder/view visibility or an existing role—is the governing staff permission. Q28 origin restrictions survive. Every included byte and embedded manifest fact must be currently lawful before any ZIP representation/header/range/conditional disclosure. Temporary serving blocks remain distinct from terminal package Cancel/expiry/source withdrawal; no new audience or raw storage URL bypass appears.
- Source-copy/read-reference fencing protects actual preparation against disposal/locator reuse without extending source rights or retention. Reciprocal bounded fences cover cleanup against builders/readers/holds and late provider completion. A source hold does not automatically retain every optional ZIP; actual held/orphan/candidate/cleanup-failed copies remain restricted and capacity-accounted, with admission bounded on exhaustion rather than wrongful deletion.
- Time is evaluated at actual admission; equality is expired. The fixed material end, earlier source caps and current session/JIT/step-up gates remain distinct. No read, retry, delayed cleanup or old receipt renews the result. A lawful Prepare again is a newly reviewed current command.
- Exact committed replay precedes new-command eligibility under current result-disclosure rules. Unknown provider/DB completion is reconciled before repetition or deletion. Each distinct transfer/range has its own actual current budget/audit admission; preparation idempotency is not unlimited unmetered egress. No cleanup or rollback removes source evidence to simplify package recovery.
- Native relationships, immutability and effective real-role policies remain mandatory, including USING/WITH CHECK composition, SELECT/INSERT/UPDATE/DELETE/UPSERT/MERGE, service/owner/BYPASSRLS/definer, view/RPC/trigger/storage and alternate doors. P12 remains the sole fine-grained PDP with coarse Tenant RLS; its logical R6 budget and set-wise audit/projection rules do not become one query per member or a global long-lived read lock.
- Safe flat naming, reserved manifest handling, Store/Deflate/qualified ZIP64, no nested extraction and external whole-archive hash are coherent. Streaming source hashing plus complete archive verification does not mandate a redundant production re-decompression pass. CRC and the isolated probe are accurately limited. No fixed provider cap, new vendor, bill-neutral claim, universal rescan, all-history/export engine or new notification is introduced.

### Runtime-to-consolidated crosswalk

All runtime proof groups **P01–P36 are incorporated one-for-one as Q44-P01–Q44-P36**, with the Phase12 reference in P27 corrected as above. Q44-P37 strengthens exact time and credential-versus-material expiry; P38 retained-copy accounting; P39 each distinct egress admission; P40 source-copy fencing; P41 exact outcome/member cardinality; P42 full composed journeys; P43 safe partial-output authority/disclosure; and P44 canonical owner/proof/stage boundaries. These additions close the carry-throughs rather than deferring them to a later product question.

| This runtime clause                        | Consolidated exact clauses |
| ------------------------------------------ | -------------------------- |
| C01 source scope                           | Q44-C01,C07,C16            |
| C02 finite coherent intent                 | Q44-C02,C10,C11            |
| C03 distinct operation/generation/transfer | Q44-C04,C08–C10            |
| C04 partial/unknown/no empty success       | Q44-C03,C12                |
| C05 manifest/integrity                     | Q44-C04,C06,C13            |
| C06 whole-result current authority         | Q44-C01,C07,C08            |
| C07 one PDP/coarse RLS/set-wise budget     | Q44-C07,C08,C11,C14        |
| C08 HTTP/every door                        | Q44-C07,C08,C13            |
| C09 semantic replay/recovery               | Q44-C09,C10,C15            |
| C10 archive safety/bounds                  | Q44-C05,C06,C14            |
| C11 structural/effective DB                | Q44-C11,C15                |
| C12 ordering/time/cleanup                  | Q44-C04,C07–C10            |
| C13 finite cost/work                       | Q44-C09,C14 and B01–B08    |
| C14 history/telemetry/operator             | Q44-C08,C13 and O01–O08    |
| C15 activation/restore                     | Q44-C15,C16                |
| C16 complete bounded UX                    | Q44-C12,C16                |

The consolidated manifest uses `CONTENTS.txt` or an equivalently qualified accessible plain-text name, and specifies one distinct original member for each included binding. Those bounded presentation/cardinality refinements preserve this note's safety requirements; they do not create a competing schema or source authority. Numeric budgets, native role/stream/storage/restore proof and real extraction/device/AT outcomes remain activation obligations with explicit owners and evidence, not guessed capacity or monitoring substitutes.

### Hash-identified readback and verification

- Corrected complete report SHA-256: `661273b75f2c4519389e738d5bdd24d0743c328c364e16576a68c048b607cf11`.
- Complete ADR SHA-256: `6d4d5a059819e66b8439f831bde57a76ff1c86a30c967e9163114353416caaab`.
- Exact report/ADR decision parity: **true**, sixteen paragraphs, **18,831 LF-normalized characters**, SHA-256 `19ebdf1d69032c2e9a233805e139a75f12d88d59bdc5600d1a9eeb42180e3aae`.
- Structural counts independently verified: **16 C / 44 P / 22 categories / 24 lifecycle / 44 journeys / 8 budgets / 8 controls**.
- Reconstructed pre-correction report SHA-256: `4321d872c021450ebfbf54aa6f0e049e2dfd26a3f742c8554da5ce1301ec1e9f`, exactly the whole report initially read. This proves the final readback's only report difference was the P27 reference fix.
- Fresh GitHub compare during whole-package review: live `develop` remains `e483673725cbdc26a49eacb71f7bc22d0e41008e`, identical with zero ahead/behind/changed paths.

The hashes identify the package while the parent closure placeholder is still present. Replacing that placeholder with the reviewers' actual closure changes the report hash without changing this substantive review. Q44 remains selected with required amendments pending Conrad's ratification. This closure qualifies the documented decision/review package only: no native activation, hosted grants/provider check, production load/cost result, actual browser/AT success, new glossary term or Q45 decision is asserted. Only this assigned runtime note was edited.

### Final original-byte precision readback

The owner identified one further ambiguity in proof P22's compressed wording “no … macros,” also present in this note's original P22 shorthand. The governing intent is **no macro execution during packaging**, not banning or stripping macros from an otherwise source-qualified original. The original bytes remain unchanged; actual source hygiene/admission still decides whether the original is eligible. This matches exact C05 and this note's C10, which already prohibit execution/conversion rather than changing contents.

Reread the corrected consolidated Q44-P22 in its proof/decision context. Its exact final wording now prohibits symlink/device metadata, recursive extraction or macro execution and expressly preserves otherwise source-qualified original bytes. Replacing only that new phrase with its earlier wording reproduces the entire previously reviewed report hash `661273b75f2c4519389e738d5bdd24d0743c328c364e16576a68c048b607cf11`; no other report change occurred. The ADR is byte-unchanged. Thus the full-package review, sixteen-paragraph exact parity, 18,831-character decision, all counts and proof/claim limits above remain valid.

Final corrected report SHA-256: `ee476379fc7b1b2311d0e8fceb6d32ca51af97034d70c3d10b7fbcb46b303166`. ADR SHA-256 remains `6d4d5a059819e66b8439f831bde57a76ff1c86a30c967e9163114353416caaab`; exact decision SHA-256 remains `19ebdf1d69032c2e9a233805e139a75f12d88d59bdc5600d1a9eeb42180e3aae`. No unresolved material runtime issue remains. This addendum preserves the prior readback history and closes the final precision without another experiment, implementation change or ratification claim.
