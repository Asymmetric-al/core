# D22 independent search lifecycle, CRM and future-extension review

Reviewed **12 September 2026**. The founder selected **A — Conversation text and attachment filenames**. Broader AI search is an eventual direction, explicitly outside D22. D1–D21 remain ratified; this is input to the complete D22 amendment review, not a formal specification or implementation. Source reads were performed in verified `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10` against baseline `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`.

**Disposition: Accept with required amendments.** The critical boundary is not “index every readable thing.” Source owners first decide whether data may be indexed, then current source/field/purpose authority governs every query contribution. The index is a disposable projection over exact original sources, never a copy with independent access or retention. Reuse Core's shared list/query, source identity, classification, byte-custody and later AI foundations rather than create global search, an extraction service or a second CRM now.

## Primary repository evidence

- [D4](phase26-d4-adversarial-review.md), R03: a committed outgoing message remains an admitted Support record even if later dispatch fails; local success is Queued, not delivered. Unadmitted preparation has no dispatch authority. Thus “searchable admitted reply” and “sent message” must not be synonyms.
- [D9](phase26-d9-adversarial-review.md), R07–R10: CRM discovery is a source-qualified relevance/correspondence projection, not all history automatically belonging to a Party. Queued/uncertain outbound has truthful state; actual P6 history remains independent.
- [D10](phase26-d10-adversarial-review.md), R02/R14/R16/R20–R22: stable original sources, current root composition, source-preserving Undo and complete authorization before root deduplication/count/page. A Party linked through B gains no A historical messages solely from a merge.
- [D12](phase26-d12-adversarial-review.md), R02–R05: a related staff-origin conversation can have a qualified brief with zero native messages. Its citations do not copy or grant access to the original transcript; source-derived summaries keep their restrictions.
- [D16](phase26-d16-adversarial-review.md), R03/R05/R11/R16/R18/R21: source correction covers equivalent representations and filenames; stale index revisions cannot contribute membership, counts, rank or excerpts. Current serving barriers precede asynchronous purge. Restore cannot bring old copies back into use.
- [D17 inventory](phase26-d17-data-inventory.md): subject, snippet, source-derived description, filename, preview and generated copies are content or qualified metadata with real owner lifetimes. Restricted held custody is not continued ordinary availability.
- [D20](phase26-d20-adversarial-review.md), R02/R06/R14/R19/R23: saved meaning, exact source coverage, current query context and private sensitive query-state handling remain independent. A current query is not a historical result snapshot.
- [D21](phase26-d21-data-contract.md): the current-label report has a component-first earliest-original-start cohort. That report predicate is not interchangeable with ordinary root createdAt, and D22 must not silently broaden a report drilldown.
- [Phase10 A4](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-10-sensitive-data-safety.md#L98) and [explicit exclusion](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-10-sensitive-data-safety.md#L188): restricted-tier data is excluded from indexing and future AI context. A staff clearance is not permission to relax this rule.
- [Phase29](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/roadmap.md#L3146) and [byte boundary](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/roadmap.md#L3300): byte identity/storage/access belong to the common owner; Support owns attachment meaning, source relationships and purpose. A filename never defines domain truth.
- [Phase40](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/roadmap.md#L4044): global/AI work consumes the existing shared AI connection/capability/egress/invocation/suggestion foundation, preserves classification and human mutation authority, and does not create a second provider key store or suggestion ledger.

## Findings and exact amendment language

The severity/likelihood estimates are qualitative unmitigated engineering judgments. They do not assert incident prevalence. Every finding below changes or narrows the implementation of A; none requires replacing its selected coverage.

### L01 — Admission determines the searchable conversation corpus

**Material concern: Yes. High severity; likely if current message rows are treated uniformly.** Indexing drafts, rendered tests or pre-admission preparations exposes private composition and wrongly represents it as communicated content.

**Exact requirement:** “Search only qualified, durably admitted Support source text and allowed conversation details. Exclude private drafts, unadmitted prepared candidates, Email Studio library/publication sources, raw transport payloads, provider evidence bodies and D19-held intake. An admitted outgoing reply may be searchable while queued, failed or uncertain if its source remains eligible; show its actual state and never label it Sent or Delivered without that owner's proof. Published internal notes have a distinct Internal note match type.”

If the existing D12 brief is included in conversation details, name its match **Staff context** and enforce its own disclosure/source lifetime. It is not a native incoming message and does not let search traverse its references recursively. Similarly, admitted automated content, if in the approved corpus, must retain its automated provenance rather than count as a human reply. Freeze the exact allowed source-kind catalog; do not infer inclusion from “has text.”

**Proof:** private draft/preparation-only/library/raw-intake exact terms yield no ordinary result; locally admitted queued and failed replies have accurate source/state; a D12 zero-message item can match its eligible brief without fabricating correspondence; notes and automation cannot become human/customer message evidence.

### L02 — Index eligibility precedes query authorization

**Material concern: Yes. Critical severity; plausible.** A broad staff-readable index can violate Phase10 even if the UI later filters it. An attachment filename or copied brief can carry restricted source text.

**Exact requirement:** “The source owner qualifies indexable fields, source kind, classification, purpose and revision before indexing. Phase10 restricted-tier exclusion is a hard floor and is not overridden by record-read clearance, inbox membership, a merge or a CRM relationship. Query-time authorization remains required for the eligible indexed corpus; indexing eligibility is not a grant to every searcher. Unknown/unqualified source classification cannot be silently treated as general Support data.”

Do not build keyword/AI classification to pretend this exclusion is solved. Actual classification and authorized source release remain owner responsibilities. A protected linked Party does not make every unrelated general word restricted automatically; use the real strictest applicable source/field policy, not a guessed relationship rule.

**Proof:** excluded restricted source/field bytes do not enter normal search representations; reclassification stops old-index contribution immediately; break-glass/clearance does not index an excluded source; ordinary permitted sanitized context still works through its qualified contract.

### L03 — Every result contribution needs a current source revision

**Material concern: Yes. Critical severity; likely without explicit revision gates.** Sanitizing a snippet after matching still leaks a removed secret through a hit, count, ordering or match category.

**Exact requirement:** “Before matching, ranking, aggregation and paging, qualify the candidate's exact tenant/original-source/content revision, current source eligibility and disclosure scope. Only those eligible contributions can select a result or affect its score, count, facet, snippet or match reason. The current source gate suppresses obsolete representations even if index cleanup is delayed. A stale or unknown revision is not a fallback read authority.”

Do not let inaccessible messages or another tenant's corpus statistics change a visible result's score/count. Use a qualified deterministic ranking contract over eligible contributions. User-facing “additional matches” counts must be authorized, bounded and accurately named, not the index's raw count.

**Proof:** add an inaccessible high-ranking match and confirm it changes no visible ordering/count; redact a unique synthetic term while delaying cleanup and confirm zero hit/snippet/facet/rank contribution through every route; repeat after permission loss, cache lag and tenant switch.

### L04 — Original identity and current handling must both remain available

**Material concern: Yes. High severity; likely if indexing the merged root transcript.** A copied root transcript duplicates content, loses original affinity and makes Undo resurrect removed sources or send a user to the wrong match.

**Exact requirement:** “Index and identify matches by stable original conversation plus exact message/brief/attachment occurrence and source revision. Resolve current D10 handling at query/open time. Apply eligible original contributions before current-root deduplication, aggregation and pagination; return one current continuing conversation with qualified match anchors. Do not reparent or copy source text merely to merge. Undo repartitions current searchable originals without rebuilding historical messages or restoring obsolete text.”

Opening a result rechecks the match source and current topology. If the match has disappeared, show an honest unavailable/changed-match state and safe current navigation; do not display the cached excerpt or silently claim a different source matched. Source anchors must work across deep pages and not depend on a previously loaded transcript window.

**Proof:** a merged A/B has one row with eligible original reasons; Undo yields separate current rows where appropriate; redaction then Undo never revives the term; result-click racing Merge/Undo opens current permitted handling at the original anchor or a truthful changed state.

### L05 — CRM context is a source scope, not just a visible header

**Material concern: Yes. Critical severity; plausible.** Keeping a Party's name above a globally searched combined thread can reveal unrelated originals and imply correspondence that never occurred.

**Exact requirement:** “In a CRM-anchored Support search, retain D9's exact current relevance/correspondence source basis and joint CRM/Support field authority before matching, ranking, count and snippet projection. A current root match from another original without that Party basis must not enter merely because two conversations were merged. Preserve record scope and return context. Open in Support Hub is explicit movement to the independently qualified full workspace; search never silently drops the record anchor.”

D12 related conversations and cited messages do not create a transitive search corpus. Each independently eligible source can be found in its actual scope; a reference alone does not clone its text into the destination or create CRM history. Search makes no Party, link, recipient, label, contact event or business mutation.

**Proof:** Party B's correspondence-only source cannot find an A-only secret through merged current handling; explicit permitted relevance works; removing the last qualified discovery basis withdraws results; CRM→match→Support→CRM preserves scope/draft/scroll without copying history.

### L06 — Filename discovery does not authorize attachment bytes

**Material concern: Yes. High severity; plausible.** Returning a filename can disclose protected case details; selecting it can mint a download URL or fetch unsafe content merely to make the search hit useful.

**Exact requirement:** “Search only filename metadata on a qualified admitted Support attachment occurrence when its owner permits metadata discovery. Preserve exact occurrence/filename revision and source restrictions. Filename permission and byte preview/download permission are independently checked. A match may identify an authorized filename while bytes are pending or unavailable, with truthful state; it cannot invent byte readiness or bypass safety checks. Query, index and snippet work do not fetch attachment bytes, perform extraction, follow remote URLs or mint download access.”

An inline image/file has only the identity actually recorded by its owner; do not fabricate a searchable display name from a path/token or expose raw storage identifiers. Do not import independently retained official-file metadata into Support merely because it shares underlying bytes. P29 is reused for genuine byte access after deliberate owner-authorized navigation, not as a requirement to implement file-content search now.

**Proof:** permitted filename match with denied download remains denied; filename restriction removes search contribution even if bytes still lawfully exist elsewhere; pending/malware/removed occurrence cannot auto-open or fetch; no OCR, extraction or network file access occurs during A queries.

### L07 — Derivatives cannot extend retention or resurrect data

**Material concern: Yes. Critical severity; plausible across restore/replay.** An index, excerpt cache, snippet log or raw-MIME rebuild can outlive D16/D17 and recreate expired content.

**Exact requirement:** “Search normalization, lexemes/positions, display excerpts, query caches and managed exports are governed representations with original lineage and finite retention. Redaction, expiry, reclassification and owner deletion immediately end their applicable ordinary contribution before cleanup. Indexing and reindex jobs re-read current owner state rather than replaying old payloads. Durable identifier-only work, revision guards and restore barriers prevent older jobs/backups from repopulating forbidden revisions. A restricted hold does not make retained bytes searchable.”

New eligible content creates its own source generation; it does not restore an expired source that happens to contain the same terms. Do not retain source text or low-entropy hashes as a permanent “redaction blacklist.” Different independently admitted messages require their own owner eligibility.

**Proof:** indexing versus redaction/expiry has one qualified current result; delayed old job loses to the source barrier; backup restoration enforces current negative controls before readers/indexers start; same text in a genuinely new permitted source does not resurrect the old source or get silently deleted as a duplicate.

### L08 — Coverage changes must not reinterpret saved searches

**Material concern: Yes. High severity; likely on rollout.** Expanding from subject-only to body/notes/filenames changes the meaning of a saved text query and can unexpectedly expose broader matches to its audience.

**Exact requirement:** “Saved queries and their active route/query handles bind an exact searchable source-coverage/schema generation and match semantics. D22's new ad hoc default does not silently upgrade existing details-only saved definitions. Preserve a proved equivalent legacy meaning or present a reviewed migration/upgrade; unknown legacy coverage is Needs attention rather than assumed All text. A deliberate new/revised saved definition can select the now-qualified coverage. Parser/tokenizer/normalizer upgrades that change meaning follow the same owner compatibility discipline.”

This applies to Shared and My, copied views, deep links, restored state and preferences. It does not require storing result IDs or building a snapshot warehouse. D21 report drilldown retains its exact component-first cohort; new text filtering composes only through explicitly qualified predicates without replacing its date/source meaning.

**Proof:** the same legacy saved query remains details-only until deliberate upgrade; copied/renamed views preserve coverage identity; stale or unsupported route schema cannot broaden; D21 report-context queries retain earliest-original-start/current-inbox ordering.

### L09 — Indexing lag and partial search cannot masquerade as zero

**Material concern: Yes. High severity; plausible.** New content committed before indexing may be absent; returning No matches implies a complete result while a job failed. Blocking intake or replies on full indexing creates unnecessary failure coupling.

**Exact requirement:** “Authoritative source admission and required durable indexing work are recoverable independently of serving search results. Track source/index generation and bounded readiness under the shared owner. Display a current-scope incomplete/unavailable state when eligible coverage cannot be established, without exposing hidden-source counts. Return truthful No matches only for the declared qualified searched population. Index failures never undo or duplicate admitted messages and do not block otherwise valid intake/replies.”

Publish the exact supported indexing freshness/recovery and query budgets before activation; source gates still enforce revocation regardless of those bounds. Use the same source identity/revision for retry and deduplication, bounded fair batches and existing operations rather than one bespoke worker per conversation. Search-source readiness is not D14 Support-ready admission and cannot shift reply clocks or D17 retention.

**Proof:** simulate admission success plus index failure and confirm durable work, truthful partial search and unchanged message/work clocks; retry/backfill creates one current representation; scope with known ready content gives honest complete results; an unavailable search service does not hide standard authorized work queues.

### L10 — Match navigation remains a read, not correspondence

**Material concern: Yes. High severity; plausible.** A search hit may accidentally set Reply-To from a matched internal note, quote an excerpt to a customer, mark an entire thread read or overwrite a draft when switching sources.

**Exact requirement:** “Search, highlight, match navigation and Find in conversation are read operations. They do not create labels/follows/CRM activity, select external recipients, insert matched text, mark source work complete, or prove all messages read. Opening a result may use the existing actual-view engagement behavior only for content genuinely presented under that owner contract. Preserve private draft, composer purpose and current reviewed audience; choosing a note match never turns it into an external reply source.”

Any deliberate later Reply or Insert information uses existing D2/D4/D18 source/audience disclosure and ready P17 preparation→Support admission→P6 tenant Resend contracts. Search does not access Email Studio publication/draft/prepared source data and does not send mail. An index refresh cannot cancel or alter an already admitted message intent.

**Proof:** search exact internal-note phrase reveals only eligible note context and changes no recipient/message; switching result preserves unsent draft; query/snippet preview does not mark all history read, resolve work, create a follow or emit a communication event; actual permitted later Send retains its independent proof.

### L11 — Sensitive query text is governed temporary state

**Material concern: Yes. High severity; likely if default telemetry captures requests.** Staff may search a personal name, email, medical phrase or secret that never appears in any authorized result. Logging queries, highlight parameters or global recent searches creates a new disclosure store.

**Exact requirement:** “Apply D20's authenticated bounded query-state/URL contract to source-search text and match navigation. Query text and snippets stay out of unrestricted URLs/referrers, general logs, analytics, job payloads and shared recent-search suggestions. No new permanent search-history feed or cross-user popular-query feature is added. Cache identity binds current tenant/principal/purpose, effective source coverage/query and source policy/revision; same-user tenant switch and revocation invalidate late results.”

Match offsets/highlight anchors bind the sanitized source representation revision and encoding convention. Highlight escaped text safely; never inject index-provided HTML or reconstruct a removed substring from stale positions. Long quotes and filenames use the same source privacy classification as their parent representations.

**Proof:** inspect query/log/error/export/network/navigation surfaces for a synthetic secret; cross-tenant cache and delayed response tests show no old snippets; Unicode and redaction-before-open invalidate stale highlight geometry without exposing the previous text.

### L12 — Future AI search reuses foundations without activating them

**Material concern: Yes. High severity; likely if “future-ready” becomes premature indexing.** Early vectors, extraction, external model calls or generic query interpretation can bypass Phase40 governance and add sensitive copies before there is an authorized feature.

**Exact requirement:** “D22 exposes stable original source identity, exact eligible projection/schema revision, source kind, current authorization/restriction and provenance so a later qualified search consumer can reuse the owner boundary. It does not compute embeddings, extract attachment contents, call an AI provider, build an AI query language, summarize results or create a second global search/key/egress/suggestion service. Future broader/AI search remains separately scoped under P40 and existing shared AI foundations; restricted-tier exclusions and current owner permissions remain hard constraints.”

The permanent extension point is the typed owner contract and source lifecycle, not an unused vector column or speculative plugin framework. Later AI answers would need source-citation/current-retrieval, retention, egress-purpose and non-authoritative suggestion proof; D22 does not claim those capabilities exist or silently require them for ordinary search.

**Proof:** no external AI/extraction/vector/provider path runs in D22; corpus contains only selected A sources; source contract can describe revision/eligibility without disclosing bodies to a future consumer by default; changing the future feature cannot reinterpret a current saved query or grant mutation authority.

## Minimal permanent synthesis

1. Fix the exact source-kind coverage and admission semantics, including truthful queued/failed replies, published notes and any included Staff context. Preserve Phase10 indexability exclusions.
2. Build/qualify the narrow original-source search projection, identifier-only durable indexing and current revision/permission gate. No per-root copied transcript or file bytes are required.
3. Apply scope and current source eligibility before matching/rank, then D10 root projection/deduplication and complete query pagination/count. Preserve CRM and report-specific scopes.
4. Provide source-labeled excerpts and stable original-match navigation with current checks; separate Find in conversation from browser Find over loaded content.
5. Migrate saved coverage semantics explicitly, fence old readers/indexers, then prove reclassification/redaction/expiry/restore races and truthful coverage/failure states before activation.
6. Use existing operations for qualified lag/recovery failures with exact budgets and owners in release evidence. Privacy, completeness and source authority are preventive gates, not monitor-only acceptance. No AI or attachment-extraction implementation belongs in this sequence.

This review is based on current repository contracts and precise source counterexamples. It supplies required proof; it does not claim live indexing, SQL/RLS, provider, browser, assistive-technology, user-study or capacity results.
