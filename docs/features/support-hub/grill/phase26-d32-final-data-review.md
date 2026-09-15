# D32 — Final independent data and lifecycle review

**13 September 2026. Final disposition: Pass for the corrected grooming package.** C is selected; the detailed amendments remain proposed until founder ratification. D1–D31 remain ratified. This pass does not certify an implementation, renderer, database, provider, browser or production environment.

Reviewed the actual [D32 decision and all 28 clauses/23 categories](phase26-d32-adversarial-review.md), [data contract](phase26-d32-data-contract.md), [UX blueprint](phase26-d32-ux-blueprint.md), [Email Studio integration](phase26-d32-email-studio-integration.md), and all [40 release-proof groups and six operating controls](phase26-d32-proof-and-operations.md). Compared them with the 14 findings and pinned Core/primary technical evidence in the [independent data review](phase26-d32-data-review.md). The parent confirmed that the complete proof document was ready before this final record was written. Its final research-evidence/completion packaging is separate from this substantive pass.

The source basis remains Core HEAD `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`, examined in `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10`. Root owns fresh remote/related-PR verification. This final pass made no product, database, dependency, provider, GitHub or canonical-document changes and ran no runtime test. Only this independent review artifact was added.

## Material corrections found and verified resolved

### F01 — A cache input key must not be the immutable generation identity

**Potential severity: High. Likelihood: plausible on ordinary cache expiry.** The same source/version/profile/options can legitimately need another rendition after the fixed 24-hour derivative deadline. Treating that tuple as the sole immutable generation would either trap the user on an expired result or permit renewing old timestamps/receipts in place. Unlimited new attempts after failure would create a different resource-control hole.

**Verified correction:** R17 and the data contract now distinguish the stable matching-input key from each technical generation identity. Expiry retires the old generation. A new deliberate eligible admission under the unchanged key can create one new generation; concurrent opens coalesce the live generation. Old deadlines and command receipts remain unchanged. Current source expiry/restriction prevents regeneration. The existing exhausted-attempt guard continues to forbid ordinary opens from manufacturing unlimited fresh retries; operator repair requires corrected cause and a fresh audited admission.

**Proof:** P14, P22, P31 and P33. P22 explicitly requires same-input regeneration after derivative expiry, concurrent coalescing, unchanged old receipts/deadlines and rejection after source expiry. No further amendment required.

### F02 — Tentative cleanup must not delete successfully promoted Ready bytes

**Potential severity: High. Likelihood: plausible whenever the first 15-minute cleanup deadline follows a successful conversion.** A registered attempt sweeper could otherwise delete a valid 24-hour Ready object, or a stale worker could publish an object already claimed for deletion. Separate cleanup schedules without a shared conditional custody transition are insufficient.

**Verified correction:** R07, data request step 5 and P32 now explicitly transfer accepted output custody atomically at Ready promotion. The tentative sweeper can claim only scratch or currently unpromoted output. Cleanup and promotion conditionally claim the same immutable object's current custody; deletion-claimed output cannot promote, and a stale tentative claim cannot delete promoted bytes. Ready expiry has a separate guarded disposal path. Object keys are not reused across generations.

**Proof:** P21, P22 and P32 include restriction, deadline, fault-injection and competing cleanup/promotion cases. The two exact lifetimes are now coherent without extending original retention. No further amendment required.

### F03 — A saved-value reader cannot promise to detect arbitrary stale formula caches

**Potential severity: High for financial-looking source material. Likelihood: plausible with ordinary externally edited or unrecalculated workbooks.** Presence or absence of a cached formula result can be detected. Whether that saved result is current or correct generally cannot be proven without executing the calculation and obtaining authoritative inputs, both outside this decision. The earlier P09 wording could have implied that freshness was verified.

**Verified correction:** P09 now uses an intentionally stale fixture to prove that the exact saved value is shown with persistent saved-value/not-recalculated provenance. It forbids inferring arbitrary source staleness or making a fresh/current-value claim. Missing cache remains unavailable, not zero or a genuinely blank cell. R12 and the UX already preserve the correct no-recalculation/no-authoritative-financial-data contract.

**Proof:** P09 and P10. This preserves useful inspection while making the proof falsifiable and honest. No further amendment required.

### F04 — Omitting pivot functionality must not erase ordinary visible saved result cells

**Potential severity: High for completeness. Likelihood: plausible in spreadsheets containing pivot results.** A broad statement that pivots are omitted could conflict with the requirement to show visible saved cells, silently removing an ordinary saved result range.

**Verified correction:** The final R12 and UX distinguish pivot definitions, refresh/interactivity and unsupported presentation from ordinary visible saved pivot-result cells. Those cells remain in the grid; the reader neither refreshes nor synthesizes values from hidden pivot caches. This incorporates the independent UX review's correction without adding a spreadsheet engine.

**Proof:** P08–P11. No further amendment required.

## Closure of the original independent data findings

| Independent finding                                 | Final contract and proof             | Final assessment                                                                                                                                                                                                                                       |
| --------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| DC01 — Source, byte and derivative identity         | R02/R18/R19; P02/P14/P24/P30/P31     | Addressed. Equal names/digests do not merge source identity, authority or CRM ownership. Immutable byte/profile identity is separate from technical generation and current source eligibility.                                                         |
| DC02 — Metadata availability is not qualified bytes | R03/R05/R07/R26; P02/P19/P35         | Addressed. Current provider metadata/count and `local:` staging cannot be promoted to stored, scanned, preview-ready bytes by assertion.                                                                                                               |
| DC03 — Current private full/range authorization     | R05/R08/R17/R18; P20/P21/P30         | Addressed. Full, range, conditional and derived-content paths reauthorize current source/purpose. Public email assets and reusable raw signed/provider URLs remain excluded. Previously delivered information is honestly not recallable.              |
| DC04 — Untrusted parser isolation                   | R06/R08/R15/R25; P17–P20/P36         | Addressed. Isolated parser jobs receive only exact read-only input, no credentials/network/general storage. Infrastructure denial and browser isolation must be proved; flags or an HTTP timeout are insufficient.                                     |
| DC05 — Fidelity and coverage                        | R09–R14; P03–P13/P38                 | Addressed. Process success, output upload or a valid PDF header is not completeness. Known omissions produce a truthful limited result; unknown material coverage cannot claim complete Ready.                                                         |
| DC06 — Saved spreadsheet and literal text data      | R12/R13/R19; P08–P13/P25             | Addressed, including F03/F04. No recalculation, import, value coercion, missing-cache-as-zero, CRM mutation or financial authority.                                                                                                                    |
| DC07 — Fenced promotion and cleanup                 | R07/R17/R24; P21/P22/P31/P32         | Addressed, including F02. Source restrictions and current claims fence publication; tentative and Ready custody now have an explicit competing transition.                                                                                             |
| DC08 — Coalescing, retries and lineage              | R07/R17/R24/R25; P14/P22/P31/P33/P36 | Addressed, including F01. Coalescing shares work, never permissions; deterministic failures do not retry, unknown outcomes reconcile, and old workers cannot win.                                                                                      |
| DC09 — Resource units and bounds                    | R15/R16/R25; P15–P17/P39/P40         | Addressed. Input, expansion, structure, output, decoded-image working data, process-tree CPU/memory, scratch, elapsed time and retry count are separately bounded. Sparse/hidden inputs count appropriately.                                           |
| DC10 — Grants, RLS and trusted attribution          | R05/R18/R24; P20/P30/P31             | Addressed as a required implementation contract, not claimed present. Tenant-aware lineage, immutable result fields, trusted actor/owner context, grants, policy combinations, functions, storage and service paths all require actual negative proof. |
| DC11 — Finite custody, restriction and restore      | R17/R22/R26; P21/P22/P34–P36         | Addressed. Source-capped derivative/scratch deadlines, no read renewal, no restore/merge resurrection, restricted hold custody and owner-governed audit retention are explicit.                                                                        |
| DC12 — Topology and CRM scope                       | R05/R19; P23–P25                     | Addressed. The same original is inspected through Support or CRM under intersected current rights. Linking, requester identity, shared email or assignment grants no byte access.                                                                      |
| DC13 — P18/P17 boundaries                           | R20/R21/R28; P26–P29                 | Addressed. Existing governed PDF tools do not establish arbitrary Office conversion. Preview creates no official/current document, outbound preparation, public asset, TipTap import, search/AI corpus or communication evidence.                      |
| DC14 — Migration and qualification                  | R25–R27; P35–P40                     | Addressed. Legacy URL/local/metadata-only paths require inventory and truthful repair; raw bypasses are fenced before activation. Real build, isolation, fidelity, accessibility and load qualification remain required.                               |

## Resource and dependency judgment

The exact ceilings are internally consistent **proposed engineering limits**, not measured vendor guarantees: 20 MiB actual input; 200 MiB cumulative package expansion; 10,000 entries/XML depth 128; 200 output pages or visible slides; 40,000,000 pixels per image and 256 MiB aggregate decoded-image working data; 50 total sheets and 100,000 populated cells including hidden source cells; 1,000,000 decoded Unicode scalars for TXT/CSV and the CSV cell cap; 50 MiB cumulative generation output; 60 elapsed/30 process-tree CPU seconds, 2 GiB process-tree memory and 512 MiB scratch per attempt; at most two attempts for classified transient failures. These are preview ceilings, not changes to intake/send permissions or size contracts.

The actual profile must enforce allocation/expansion limits while parsing and preserve truthful unsupported/over-limit outcomes. A file within an outer size ceiling is not guaranteed to have supported features. Healthy-load targets and low-bandwidth/mobile fixtures are explicitly unmeasured. This is appropriately bounded; an arbitrary-format guarantee, tenant plugin system, generic workflow engine or second document authority is unnecessary.

The 24-hour Ready and 15-minute tentative lifetimes are explicitly source-capped derivative custody choices. They do not import P17's prepared-message retention or reset D17's original Support content lifecycle. Implementations must measure and enforce all resource units on descendants and all owned outputs; a configured HTTP timeout or process exit code does not prove these controls.

The repository contains governed PDF-related packages and existing attachment scaffolding. Neither establishes that a chosen Office parser/converter/viewer is installed, qualified or deployed. Exact maintained builds, fonts/options, safe feature coverage and deployment capacity remain implementation evidence gates. This is a necessary qualification of the selected bounded capability, not another unresolved product scope choice or permission to call an image/PDF-only rollout full C.

## Final conclusion

**No remaining material data, authorization, lifecycle, retention, source-of-truth or owner-boundary contradiction was found in the corrected actual package.** The four final-round corrections above are recorded and verified in the final text. The 23-category main review does not omit a category, and P01–P40 plus O01–O06 distinguish preventive release gates from residual operating signals.

Proceed with recording/presenting the completed proposed D32 package at the current grill stage. Keep all runtime proof marked unexecuted until the real implementation earns it. This pass approves the coherence and completeness of the grooming contract; it does not assert perfect rendering, production security, tenant demand, achieved performance or completed user testing.
