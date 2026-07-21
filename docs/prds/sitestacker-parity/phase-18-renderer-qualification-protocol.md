# Phase 18 Renderer Qualification Protocol

- **Phase:** 18 — Receipt & PDF Template System (`document-templates`)
- **Decision:** D3 — C-prime-amended-and-hardened (C-prime-R)
- **Status:** Normative pre-registration contract; contest not yet run; no renderer selected
- **Dispatch posture:** Groomed only; issue set pending; implementation not dispatched
- **Last evidence review:** 2026-07-21

## Authority and purpose

This protocol governs the one production-shaped evidence contest that may authorize an exact renderer pipeline for Phase 18. It is normative alongside the [Phase 18 PRD](./phase-18-receipt-pdf-template-system.md), the [executable purpose and authority manifest](./phase-18-document-purpose-authority-manifest.md), and the [primary-source research evidence](./phase-18-receipt-pdf-template-system-research-evidence.md).

This file selects **no renderer**. Familiarity, existing prototype code, vendor claims, a visually attractive demo, cost alone, or a profile flag cannot select one. The contest can produce exactly one of two outcomes:

1. one exact candidate pipeline qualifies as the sole production renderer; or
2. no candidate qualifies, in which case official production rendering remains dark.

A hard gate may not be waived or weakened after candidate output is inspected. Unknown evidence is failed evidence for selection. Tenants never choose a renderer, and the product never silently fails over between engines.

## Boundaries

The contest evaluates a renderer adapter, not document authority. The Phase 18 application service remains responsible for purpose resolution, immutable publications, frozen source-owned Facts Packages, idempotent Generation Requests, attempt fencing, final-byte validation, exact private custody, current-head promotion, and Phase 17 handoff.

The renderer receives only the bounded compiled document, pinned local assets/fonts, frozen locale data, an explicit metadata clock, and a declared output profile. It MUST NOT query the CRM, follow arbitrary relationships, allocate official identity, decide legal eligibility, access ambient credentials, fetch the network, read host files, send messages, or store the canonical artifact.

This protocol does not create a universal rendering language, a tenant scripting surface, a second permanent compiler, a renderer marketplace, a multi-engine runtime, or a migration product.

## Contest roles and separation

The frozen charter names people, not merely teams, for these roles:

| Role                          | Binding responsibility                                                                | Must not do                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Contest owner                 | Freezes the charter, schedules equal candidate work, and closes the evidence package  | Change gates or scores after opening held-back results             |
| Candidate implementers        | Build only the bounded adapters and record accommodations/losses                      | See held-back expected results before candidate outputs are sealed |
| Corpus custodian              | Maintains synthetic fixtures, expected facts, and held-back access                    | Tune a candidate against held-back fixture identities              |
| Accessibility reviewers (two) | Independently review neutralized final outputs and assistive-technology evidence      | Infer a pass from a vendor claim or PDF profile flag               |
| Security reviewer             | Proves isolation, hostile-input behavior, supply chain, and managed-provider controls | Accept an undocumented network, file, support, or retention path   |
| Operations reviewer           | Proves load, fairness, failure recovery, cost, capacity, and rollback                 | Treat one successful demo as production evidence                   |
| Records/legal evidence owner  | Confirms profile, font-license, retention, and purpose prerequisites                  | Treat renderer success as legal eligibility or issuance            |
| Decision recorder             | Applies the predeclared rule and signs the result manifest                            | Choose by preference or invent an exception                        |

One person may fill more than one role in a small team, except that the decision recorder cannot be the sole candidate implementer and one independent accessibility reviewer must not have implemented either adapter.

## Frozen candidate register

The contest has two finalists and one ineligible control. The charter MUST replace every `<freeze-before-run>` value below with an immutable identifier and digest before any scored output is inspected.

| ID        | Role                                          | Exact eligible deployment                                                                                                                                       | Required immutable pins                                                                                                                                                                                                                                      | Eligibility rule                                                                                                                                                                                 |
| --------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `P18-R-P` | Prince-family finalist and default hypothesis | Managed DocRaptor pipeline `10.1` using Prince `15.1`, unless the charter is reset before output inspection to one exact deployable self-hosted Prince pipeline | API/client version, endpoint/region, engine/pipeline, options, provider account mode, retention/support-access settings, DPA/subprocessor evidence, source compiler build, container/runtime where owned, fonts/assets/locale data, finalizer and validators | Only the exact frozen managed deployment qualifies. A self-hosted Prince deployment is a different candidate and requires a fresh charter and complete rerun; it cannot borrow managed evidence. |
| `P18-R-T` | Sole challenger                               | Typst `0.15.1` from an official distribution, executed in one killable no-network sandbox with all packages, fonts and assets pre-vendored                      | Binary SHA-256, distribution provenance, OS/container digest, libc/runtime, packages and licenses, source compiler/adapter build, fonts/assets/locale data, sandbox policy, finalizer and validators                                                         | Only the exact frozen binary and sandbox qualify. An experimental helper is a pinned dependency with an owner and must independently pass its affected gates.                                    |
| `P18-R-C` | Preview/comparison control only               | The exact Playwright-bundled Chromium build installed when the charter freezes                                                                                  | Browser revision, Playwright version, container/runtime, fonts/assets and preview compiler                                                                                                                                                                   | Ineligible for production selection and runtime fallback even if it scores well or visually resembles the editor preview.                                                                        |

WeasyPrint and react-pdf are outside the primary contest because the dated research found material gaps against the required combined pagination, accessibility, archival, and production evidence. They may enter only after both finalists yield no winner and a separately approved, newly pre-registered protocol documents evidence that the gaps are permanently resolved. They are not implicit fallbacks.

### Candidate substitution rule

Before results are inspected, the contest owner may reset the entire charter to substitute one exact deployable Prince-family form when procurement, privacy, residency, engine-version, or operating evidence makes the default managed candidate unavailable. Reset means a new charter ID, new timestamp, new digest, resealed held-back expectations, and a complete rerun for both finalists. After results are inspected, no candidate or deployment substitution is permitted under the same contest.

## Pre-registered charter

The contest cannot start until one immutable charter records all of the following:

- charter ID, semantic version, creation time, evidence owners, reviewers, and approval signatures;
- the exact candidate/control register and every build, deployment, compiler, adapter, dependency, font, asset, locale-data, finalizer, validator, container and configuration digest;
- the open and held-back corpus manifests, expected protected facts, semantic layout requirements, output policies, failure expectations, and corpus digests;
- the equal candidate budget: one initial adapter/proof pass and at most two documented remediation cycles per finalist, using the same frozen semantic requirements;
- the hard gates and their exact pass/fail rules;
- the scored criteria, weights, evidence rubric, uncertainty rule, materiality threshold and tie-breaker below;
- the load shapes and absolute product budgets for latency, throughput, memory, deadline, queue age, provider quota and cost;
- the final-byte validator names, exact versions/configuration/rule sets, and manual review protocol;
- sandbox/network/file-system policy, managed-provider security/privacy/procurement evidence, and incident stop conditions;
- evidence-package schema, redaction policy, retention owner, decision record format, and requalification triggers; and
- a SHA-256 manifest digest covering the charter and every referenced immutable input.

No absolute workload budget may remain blank when the charter freezes. The Phase 18 product and operations owners derive those budgets from the documented launch workload and service objectives; a candidate cannot select itself by defining a budget after measurement.

Any change to a frozen field creates a new charter version and invalidates outputs produced under the older version for comparison. Editorial corrections that cannot affect execution still require a new digest and a signed reason.

## Candidate-neutral adapter contract

Both finalists consume the same bounded semantic document contract and return the same observable attempt result. The adapter contract MUST cover:

- frozen compiled source bytes and source media type;
- exact purpose/publication/Facts Package/request/attempt identities as non-secret correlation metadata;
- local content-addressed asset and font bundles;
- locale, direction, time zone, page size, metadata clock and output profile;
- explicit deadline, maximum input/output bytes, maximum pages and resource budget;
- success with candidate PDF bytes plus safe metrics; or
- a typed failure classified as invalid input, unsupported capability, validation failure, resource limit, timeout, provider unavailable, provider-indeterminate, sandbox/security rejection, or internal adapter failure.

Provider IDs and URLs remain diagnostic evidence only. The adapter cannot mark an Artifact canonical, advance a logical-document head, issue a receipt, or cause delivery. A timeout or indeterminate provider outcome is reconciled through the same attempt identity and never causes a second official effect.

Candidate-specific source is retained as evidence, but the comparison judges equivalent product behavior, not identical HTML/CSS/Typst source. Every accommodation or semantic loss is listed in the candidate report. Manual edits to generated PDFs and fixture-ID-specific branches are forbidden.

## Frozen synthetic corpus

All fixtures are synthetic and contain no real donor, staff, missionary, tenant, payment, bank, card, tax or care data. Each case freezes one typed Facts Package, one semantic publication, purpose/profile, assets/fonts/locale, expected protected facts, expected reading structure, expected failure or success, and bounds. Fixtures use neutral candidate IDs during visual and accessibility review.

### Open development corpus

Candidate implementers may see expected results for these 18 cases.

| ID    | Purpose and shape                                                                         | Profile                 | Binding proof                                                                               |
| ----- | ----------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------- |
| `O01` | U.S. single cash acknowledgment; one page; short Latin identity/address                   | `accessible-archive-v1` | Protected donor, issuer, date, amount and required statement are exact                      |
| `O02` | U.S. quid-pro-quo acknowledgment; itemized advantages and deductible amount               | `accessible-archive-v1` | Amount arithmetic is source-owned and every protected disclosure survives                   |
| `O03` | U.S. QCD acknowledgment; custodian and donor roles are distinct                           | `accessible-archive-v1` | Purpose-owned specialist text and role labels remain exact                                  |
| `O04` | U.S. annual acknowledgment; 250 contributions, refunds and corrections; at least 20 pages | `accessible-archive-v1` | Repeated headers, totals, page counters and correction labels are complete                  |
| `O05` | Canadian individual cash receipt in English                                               | `accessible-archive-v1` | Issuer, serial, issue date, donor, eligible amount, signer and CRA fields are exact         |
| `O06` | Canadian individual cash receipt in French                                                | `accessible-archive-v1` | French language metadata, accents, fields and protected blocks are correct                  |
| `O07` | Canadian cumulative receipt; 24 gifts and one replacement reference                       | `accessible-archive-v1` | Contribution list, total, serial and predecessor reference are complete                     |
| `O08` | Canadian advantage/split receipt with multiple advantages                                 | `accessible-archive-v1` | Gift amount, advantage FMV, eligible amount and required explanations are exact             |
| `O09` | Canadian non-cash receipt with long property description and appraiser facts              | `accessible-archive-v1` | Specialist evidence remains readable, tagged and unclipped                                  |
| `O10` | Informational giving summary; 1,500 rows; minimum 100 final pages                         | `accessible-v1`         | No row/total is dropped; headers, breaks and page counters remain truthful                  |
| `O11` | Tribute notification with bounded donor anonymity                                         | `accessible-v1`         | Forbidden donor identity never appears in visible text, tags, metadata or filename          |
| `O12` | Pledge statement with paid, pending and remaining values                                  | `accessible-v1`         | Money and status axes are distinct and source-owned                                         |
| `O13` | One-page custom business document with logo, headings, list and semantic table            | `accessible-v1`         | Ordinary tenant design freedom preserves semantics                                          |
| `O14` | Two-column custom document with explicit linearization, image alt text and footer         | `accessible-v1`         | Visual columns and canonical reading order agree                                            |
| `O15` | Long names, addresses, URLs, identifiers and unbreakable tokens on Letter and A4          | both                    | Overflow repairs or fails visibly; no clipping/overlap                                      |
| `O16` | 500-row table with keep/break hints, row spans, footnotes and end totals                  | both                    | Headers/cells, page breaks, totals and reading order remain correct                         |
| `O17` | Safe PNG/JPEG/SVG assets plus blocked remote, file, data-exfiltration and script attempts | both                    | Only pinned safe assets render; every forbidden fetch/execution is denied and logged safely |
| `O18` | Missing glyph, corrupt font, oversized image and malformed semantic input                 | both                    | The attempt fails closed with a typed actionable cause and emits no canonical artifact      |

### Held-back acceptance corpus

Candidate implementers receive the same schema and bounds but cannot see these 12 fixtures, names, expected layouts or failure details until their candidate outputs and sources are sealed.

| ID    | Purpose and hidden variation                                                                                          | Profile                 | Binding proof                                                                                    |
| ----- | --------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------ |
| `H01` | U.S. single acknowledgment with maximum bounded identity/address and mixed Unicode                                    | `accessible-archive-v1` | Protected facts, wrapping, extraction and tags remain exact                                      |
| `H02` | U.S. annual acknowledgment with 2,000 rows, corrections and boundary totals; minimum 100 pages                        | `accessible-archive-v1` | No lost/duplicated row, total or page semantic under maximum load                                |
| `H03` | French Canadian cumulative receipt with leap-day/date and long registration/signature content                         | `accessible-archive-v1` | Locale, civil dates, issuer/serial/signer and pagination remain exact                            |
| `H04` | Canadian formal replacement with new serial and canceled predecessor citation                                         | `accessible-archive-v1` | Both identities and replacement statement are correct; no predecessor bytes mutate               |
| `H05` | Canadian non-cash gift with advantage and specialist-review evidence                                                  | `accessible-archive-v1` | Bounded specialist pathway does not weaken ordinary pack protections                             |
| `H06` | English/French/Arabic/Hebrew/Japanese mixed-direction names, prose, tables and URLs                                   | both                    | Unicode mapping, language spans, bidi order, extraction and reading order pass                   |
| `H07` | Nested headings, lists, repeated table headers, links, decorative/informative images and two columns                  | both                    | Tag tree and assistive-technology navigation match the semantic source                           |
| `H08` | Decompression-bomb image, hostile SVG, remote redirect, localhost/private-IP URL and host-file reference              | both                    | Sandbox rejects safely within limits with no fetch, leak or canonical bytes                      |
| `H09` | Same frozen input rendered ten times with fixed clock and identifiers                                                 | both                    | Page count, text, tags and visual output are stable; all byte variance is explained and bounded  |
| `H10` | Maximum admitted page size/content followed by one-over-limit variants                                                | both                    | Maximum succeeds within budget; over-limit work fails early and truthfully                       |
| `H11` | Restricted-worker aliases and forbidden identity seeded across content, metadata, tags, bookmarks and filename inputs | both                    | Only publication-safe identity appears anywhere in the final artifact/evidence                   |
| `H12` | Deliberate malformed facts/schema, missing required protected block and incompatible publication/profile              | both                    | Admission or render fails at the owning boundary; no fallback publication or partial PDF appears |

### Operational suites over the frozen corpus

The artifact corpus is run through these exact production-shaped operation suites:

1. **Repeatability:** ten cold and ten warm executions of `O01`, `O04`, `O10`, `H02`, `H06` and `H09` per finalist.
2. **Mixed batch:** 1,000 items across 20 synthetic tenants: 700 short one-page items, 200 medium 20-page items, 80 long 100-plus-page items and 20 deliberately invalid/poison items. Successful items remain successful; only eligible failures retry.
3. **Interactive-versus-heavy fairness:** one tenant submits 500 long items while 19 tenants each submit ten short items. Every active tenant receives a claim within the first `2 × active tenant count` eligible claim decisions, subject only to an explicitly recorded safety throttle.
4. **Concurrency staircase:** 1, 5, 10, 25 and 50 simultaneous attempts, stopping at the first predeclared safety ceiling rather than overrunning a managed-provider quota.
5. **Failure matrix:** inject a timeout, process termination, ambiguous provider result, worker redelivery, object upload failure, read-back mismatch, validator crash and finalization race after each durable boundary. Every case converges to one request and zero or one canonical artifact.
6. **Outage and recovery:** hold the selected candidate unavailable for the predeclared outage window, verify bounded queue/backpressure and truthful status, restore the same exact pipeline, and prove no cross-engine output or duplicate effect.

The charter sets absolute p50/p95/p99 latency, throughput, maximum resident memory, queue-age, deadline, storage, quota and total-cost budgets for each shape. Raw measurements, warm/cold distinction, retries, exclusions and provider throttling are retained. Averages alone are insufficient.

## Hard gates

Every gate is binary. A finalist that fails any gate is eliminated until a permanent fix is made within its equal remediation budget and the complete affected open and held-back evidence is rerun. Scores cannot compensate for a failed gate.

| Gate                                   | Pass rule                                                                                                                                                                                                                                                                                                               |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `G01 Protected truth`                  | Every expected protected string/value/role appears exactly where required; zero missing, duplicated, substituted, clipped, overlapped, reordered or renderer-computed legal/money/identity fact across all success fixtures.                                                                                            |
| `G02 Pagination and completeness`      | Every expected row, header, footer, total, footnote, page counter and break invariant is present exactly once where specified; every 100-plus-page case completes with zero dropped output and every over-limit case fails before canonicalization.                                                                     |
| `G03 Final profile conformance`        | Every final `accessible-v1` artifact passes the frozen PDF/UA-1 machine and manual protocol; every `accessible-archive-v1` artifact additionally passes frozen PDF/A-2a validation. There are zero unresolved required-profile failures.                                                                                |
| `G04 Human accessibility`              | Both independent reviewers pass tag structure, reading order, headings, tables, language/direction, links, alternatives, keyboard access, text extraction, 200/400% inspection and the frozen assistive-technology tasks. A machine-only pass fails this gate.                                                          |
| `G05 International text and fonts`     | English, French, RTL and CJK fixtures extract/search/read in logical order; all required fonts are legally embeddable and embedded; missing glyphs, fonts or Unicode mappings fail closed rather than silently substitute.                                                                                              |
| `G06 Isolation and hostile input`      | No arbitrary network, DNS, localhost/private-address, cloud-metadata, ambient host-file, credential or tenant-code access succeeds. Hostile/malformed inputs remain within frozen CPU/memory/deadline/output bounds, disclose no secret/PII and produce typed evidence.                                                 |
| `G07 Pinning and final-byte integrity` | The evidence records every executable/input pin. All required byte-changing steps precede validation. SHA-256 and length of staged, uploaded and read-back bytes match; a mismatch cannot promote. Repeat renders meet the frozen semantic/visual stability rule, and any nonsemantic byte variance is fully explained. |
| `G08 Idempotency and recovery`         | Refresh, replay, redelivery, concurrency and every failure-matrix case converge to one Generation Request and zero or one canonical Artifact; stale fences cannot finalize; ambiguous outcomes reconcile before retry; no orphan/staged object becomes accessible.                                                      |
| `G09 Load, fairness and cost`          | Every operational suite completes within every predeclared absolute budget, without tenant starvation, queue collapse, unbounded retry, provider-quota violation or hidden manual repair. Raw tail latency and per-shape cost evidence are complete.                                                                    |
| `G10 Managed/self-hosted operations`   | The exact deployment has an approved security/privacy/procurement or self-hosted operating record, declared residency/retention/support access, bounded credentials, incident/backup/rollback runbooks, capacity ownership and no provider URL/archive authority. Unknown evidence fails.                               |
| `G11 Staff product experience`         | Representative staff can use Layout preview, Generate exact proof and grouped Content/Layout/Accessibility/Archive findings without renderer/profile vocabulary; every blocking finding has one cause owner and direct repair path; the preview is never represented as official proof.                                 |
| `G12 Supply chain and licensing`       | Renderer/compiler, adapters, packages, containers, fonts, assets and validators have retained provenance, checksums, SBOM/license review and a named update owner; no prohibited or unresolved production license/security condition remains.                                                                           |

## Final-byte validation protocol

The authoritative byte order is fixed:

1. freeze the publication, Facts Package, purpose, locale, assets, fonts, candidate pipeline, metadata clock and output profile;
2. render candidate bytes;
3. apply every required byte-changing finalization, authorized visible signer block, platform evidence seal or future approved embedded signature step;
4. run all read-only machine and product validators against those exact final bytes;
5. complete the required manual visual, print, extraction and assistive-technology review for the reusable corpus;
6. calculate SHA-256 and byte length;
7. upload privately, read the object back, and compare SHA-256 and length; and
8. only then allow the application service to promote an artifact in a test environment.

No validator, optimizer, metadata writer, signing tool, linearizer or repair utility may change bytes after step 4. If a tool changes bytes, the sequence restarts at step 4 for the new bytes. Contest artifacts are synthetic evidence and never become donor-visible official documents.

The frozen validator set MUST include:

- one exact veraPDF build and ruleset for PDF/A-2a where required;
- one exact PAC-compatible or other independently reviewed PDF/UA/Matterhorn machine-checking stack;
- one product validator for PDF syntax, required metadata, prohibited JavaScript/actions/attachments, embedded font inventory, Unicode mappings, tagged-structure expectations, allowed links, page/size limits and restricted-identity leakage;
- one exact text/structure extraction toolchain used to compare protected values, row counts, totals and logical order;
- visual raster/diff tooling with documented tolerances for candidate repeatability, not as a substitute for semantic review;
- current Adobe Acrobat/Reader with NVDA for the primary assistive-technology task set, plus one independently chosen viewer/assistive-technology stack named before the run; and
- manual print, zoom/reflow, keyboard, language/direction, table, link and reading-order checklists signed by both accessibility reviewers.

Warnings are retained and adjudicated individually. Suppressing, rewriting or ignoring a validator rule to obtain a pass changes the charter and requires rerun. A profile declaration in metadata is not a pass.

## Scored comparison after hard gates

Scoring occurs only if both finalists pass all hard gates. Each of two reviewers independently scores every category from 0 to 5 using retained evidence: 0 = unusable, 1 = severe permanent burden, 2 = material gaps, 3 = meets the contract, 4 = clearly exceeds it with low burden, 5 = exceptional and repeatedly proved. A score above 3 requires written evidence of benefit beyond the hard gate.

| Category                                     | Weight | Evidence considered after the hard gates                                                                    |
| -------------------------------------------- | -----: | ----------------------------------------------------------------------------------------------------------- |
| Preview/final fidelity and editor simplicity |     20 | Semantic-source translation burden, preview predictability, repair clarity and ongoing authoring complexity |
| Accessibility and archival quality           |     20 | Quality/stability of tag, table, language, profile and validator outcomes beyond minimum pass               |
| Long-document correctness and throughput     |     20 | Tail latency, throughput, memory, page behavior and operational headroom on long/mixed workloads            |
| Isolation and failure clarity                |     15 | Sandbox strength, typed/diagnosable failures, ambiguous-outcome handling and recovery burden                |
| International text                           |     10 | Quality and maintainability across French, RTL, CJK, fonts, extraction and bidi behavior                    |
| Total operational cost                       |     10 | Measured cost at launch/year-end shapes, staffing, procurement, support, upgrades and capacity              |
| Provider portability                         |      5 | Narrowness of adapter, retained source/evidence, exit cost and absence of provider-owned product truth      |

For each candidate, the weighted total is the mean of the two independent reviewer totals. Its uncertainty band is the greater of 2.0 points or half the absolute difference between those reviewer totals. Candidate A has a material lead over B only when:

- A's mean exceeds B's mean by at least 5.0 points; and
- A's lower uncertainty bound is greater than B's upper uncertainty bound.

Reviewers reconcile factual evidence errors, but they do not negotiate scores to manufacture a winner. All original and corrected scores remain in the package.

## Deterministic selection rule

Apply this order without discretion:

1. If neither finalist passes every hard gate, record **no winner**.
2. If exactly one finalist passes every hard gate, select that exact frozen pipeline.
3. If both pass and one has a material score lead, select that exact frozen pipeline.
4. If both pass without a material lead, compare the frozen tie-break evidence in this order:
   1. fewer new production execution/dependency surfaces and less translation from the canonical Asym semantic source;
   2. lower measured operational, security, procurement, support and upgrade burden at the frozen launch/year-end workload;
   3. greater measured capacity headroom without weakening isolation, accessibility, archival or recovery proof.
5. A tie-break step resolves the contest only when its evidence gives one candidate a documented material advantage. If all three remain equivalent or uncertain, record **no winner** rather than choose by preference, incumbency or coin flip.

The Prince-family default hypothesis receives no score or tie preference merely because prototype code exists. The decision record identifies one exact family/build/pipeline/deployment and its complete pins; it cannot name only a vendor family.

## Evidence package schema

The completed contest produces one immutable, access-controlled package with a top-level SHA-256 manifest. It contains:

1. charter, approvals, timestamps and all prior superseded charter digests;
2. candidate/control lock records, build provenance, containers, SBOMs, licenses, fonts/assets/locale/validator inventories and configuration digests;
3. open and held-back corpus manifests, input digests, expected-result digests and custodian access log;
4. candidate-generated source, exact PDF bytes, hashes, lengths, page counts and safe resource measurements for every run;
5. raw and normalized machine-validator reports, text/structure extraction results, visual comparisons and warning adjudications;
6. signed independent accessibility, visual and print reviews with neutral candidate IDs preserved;
7. network/file/sandbox traces, hostile-input results, managed-provider or self-hosted security/privacy/procurement evidence and incident findings;
8. raw load/fairness/failure/outage/cost measurements, provider throttles, retries and exclusions;
9. every remediation, candidate-specific accommodation, loss, defect and rerun relationship;
10. original reviewer score sheets, uncertainty calculation, tie-break evidence and deterministic decision calculation;
11. the signed winner/no-winner record, exact production pins, rollback image/deployment, release restrictions and requalification date/triggers; and
12. a redaction report proving the package contains synthetic data and PII-safe diagnostics only.

Each artifact is addressable by stable evidence ID and digest. Missing files, mismatched digests, inaccessible raw data, changed expectations, unrecorded remediation or unverifiable manual claims make the affected gate unproved. The losing evidence and shared corpus remain retained for audit and future replacement analysis, but the losing runtime dependency does not ship.

## Production activation and runtime behavior

A winner authorizes only its exact frozen deployment and compatible publications. Production activation requires:

- signed contest decision and green hard gates;
- exact build/deployment/configuration pins represented in immutable publication and Generation Request evidence;
- applicable legal, finance, records, security, privacy, procurement and accessibility release gates;
- verified rollback to the previously qualified exact build, where one exists;
- production-shaped synthetic canary generation through final-byte private-store read-back; and
- a closure check proving no losing/control renderer is reachable from official production generation.

An outage queues or truthfully fails a request against the same pinned compatible path. It never substitutes Chromium, the losing finalist, a newer unqualified build, a different deployment of the winning family, or a different publication. Historical artifacts are always served as their exact stored bytes and are never recreated by the renderer.

Ordinary users see no renderer selector or profile jargon. Staff see a fast **Layout preview**, one **Generate exact proof** action, and one grouped proof surface: **Content**, **Layout**, **Accessibility**, and **Archive**. Provider/build/hash details are available only to authorized technical support. A no-winner or unqualified-purpose state uses plain cause-owned copy and cannot masquerade as a retryable template error.

## Requalification and replacement

Requalification is mandatory before affected production use when any of these change materially:

- renderer family, engine version, build, managed pipeline, endpoint/region, deployment mode or provider account behavior;
- source compiler, candidate adapter, finalizer, signing/seal step, container/OS/runtime or sandbox policy;
- font binary/license, locale/bidi data, asset sanitizer or semantic block/layout compiler behavior;
- PDF/UA, PDF/A, product validator, extraction or visual-review tool/version/ruleset;
- output-profile definition, metadata policy, required legal/protected block or purpose contract behavior;
- provider DPA, subprocessors, retention, support access, residency, quota, pricing or material service terms;
- launch/max workload, page/content/resource bounds, fairness policy or cost budget;
- a new document purpose that exercises an unqualified semantic/layout/accessibility capability;
- a material rendering, privacy, security, accessibility, archival, integrity, data-loss or duplicate-effect incident; or
- a relevant critical/high vulnerability, supply-chain compromise or revoked font/dependency license.

An exact patch with no possible output, isolation, recovery, dependency or operational effect still needs a signed impact analysis and synthetic canary. Every other trigger reruns the affected open corpus plus the entire held-back corpus, security/failure suites and operational suites. Renderer family/build/deployment changes rerun the complete contest and selection rule. A new purpose may qualify on the current winner only after its new fixtures pass all applicable hard gates; it does not silently broaden old evidence.

Brief overlap between previously and newly qualified builds is permitted only for synthetic canary, explicit rollback proof or a governed prospective publication transition. It is never tenant choice or cross-engine request failover. A material output change requires a new Document Definition Publication; existing artifacts remain byte-identical.

## Stop conditions

Stop the contest or keep production dark when:

- a frozen charter field is missing, changes without reset, or was created after results were inspected;
- held-back expectations or fixture identities leak to candidate implementers before sealing;
- a candidate receives extra tuning/remediation opportunity;
- either finalist is represented by a nondeployable proxy;
- a hard gate fails or required evidence is unknown;
- a validator/profile/license/security/procurement claim cannot be independently verified;
- a managed provider cannot meet required privacy, retention, residency, support-access or outage evidence;
- the load/cost/fairness budget is blank or missed;
- reviewer independence or evidence integrity is compromised;
- the deterministic rule yields no material winner; or
- activation would require a tenant selector, silent fallback, second renderer runtime, manual PDF repair or historical rerender.

## Verification and definition of done

This protocol is complete only when an implementation can prove:

- the charter and every input were frozen and hashed before evaluation;
- exactly the two finalists and one ineligible control ran in their frozen deployable forms;
- all 30 artifact fixtures and all six operational suites have complete evidence;
- every hard gate is green for the selected candidate;
- scoring and uncertainty were calculated only after gates and exactly as specified;
- the deterministic rule produced one exact winner or an honest no-winner;
- final-byte machine/manual validation, private-store read-back, isolation, failure, load, cost and licensing evidence are retained and digest-verified;
- no losing/control dependency or route is reachable in production;
- outage and rollback preserve the same qualified path without cross-engine fallback;
- requalification triggers are monitored and owned; and
- user-facing proof/repair UX remains renderer-neutral, calm, accessible and cause-owned.

Until those statements are proved, Phase 18 may build candidate-neutral application, contract and test infrastructure, but it MUST NOT claim a production renderer, generate donor-visible official PDFs, or weaken the no-winner gate.
