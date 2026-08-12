# Open Knowledge Format and the ASYM Company Brain: current-state research

**Research ticket:** [Verify the current OKF model and its fit for an ASYM Company Brain](https://github.com/Asymmetric-al/core/issues/1244)

**Evidence date:** 2026-08-12

**Status:** Research input for Wayfinder. This is not the final ASYM OKF Profile, Knowledge Pack specification, validator design, or Company Brain topology.

## Question

What does the current official Open Knowledge Format actually guarantee, and which gaps must an ASYM profile, validator, and Knowledge Pack policy close?

## Executive verdict

The “OKF” in the Factory source plan is Google Cloud's **Open Knowledge Format**, maintained in [`GoogleCloudPlatform/knowledge-catalog`](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf). It is not the Open Knowledge Foundation.

OKF v0.2 is a good **portable publication and interchange layer** for an ASYM Company Brain. It gives people and agents a readable directory of Markdown concepts, local path-based identifiers, optional provenance and verification signals, lifecycle/freshness fields, ordinary Markdown links, progressive indexes, update logs, and an optional attested-computation contract. The format is deliberately independent of storage, serving, query, model, and agent frameworks. ([official specification](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md), [official README](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/README.md))

It is **not a complete Company Brain governance model**. Base conformance requires little more than parseable frontmatter and a non-empty `type`. Provenance, generation, verification, status, freshness, version declaration, indexes, and links are optional; unknown fields and types must be tolerated; broken links do not invalidate a bundle. OKF has no schema registry, global identifier registry, typed relationship model, authority hierarchy, access control, approval workflow, cryptographic integrity contract, retention policy, contradiction model, Knowledge Pack manifest, or required runtime. Its trust tiers are explicitly advisory and not access control. ([conformance](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md#11-conformance), [trust tiers](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md#53-trust-tiers))

The current official specification is **v0.2**, but the upstream repository publishes no GitHub tags or releases. The v0.2 `SPEC.md` was last changed at commit [`3fcbb9f`](https://github.com/GoogleCloudPlatform/knowledge-catalog/commit/3fcbb9f828c2f23d109c855ee403c3a4c81f3a96) on 2026-07-24; its observed Git blob was `a516d50128f5aa1f5746d1464661a39f7143e875`. Therefore `okf_version: "0.2"` alone is not a reproducible dependency pin. ASYM should eventually pin an exact reviewed upstream commit or vendored specification artifact in addition to the semantic version.

The correct Wayfinder posture is therefore:

1. retain OKF v0.2 as the candidate base format;
2. treat the official specification—not the proof-of-concept agent—as the normative dependency;
3. define a stricter, versioned ASYM profile without breaking generic OKF consumers;
4. build and test a full-bundle validator because upstream does not publish one;
5. define stable ASYM identities, typed relationships, authority, source fixation, publication, access, retention, and contradiction policy outside base OKF; and
6. make Knowledge Packs reproducible derived artifacts pinned to exact bundle commits and content hashes.

Those are findings and constraints for the later design ticket, not final profile decisions here.

## Method and evidence boundary

This review inspected the live official repository, the complete v0.2 specification, official sample bundles, reference-agent source and tests, repository history, and Google Cloud's v0.2 announcement. It also compared those facts with section 31 of the August 3 Factory source plan. Primary sources were read as of the evidence date. ([official repository](https://github.com/GoogleCloudPlatform/knowledge-catalog), [v0.2 announcement](https://cloud.google.com/blog/products/data-analytics/okf-v0-2-adds-trust-signals/))

The repository had no GitHub tags or releases at the evidence date. No PyPI package publication, Google-hosted schema registry, independent implementation, or interoperability suite was found or tested. The official test suite was inspected but not treated as a complete conformance suite. No ASYM profile, validator, Brain repository, or Knowledge Pack was implemented.

Nia was unavailable in this client. Repository discovery used scoped `rg`, direct source reads, and read-only GitHub API calls, which is the documented fallback.

## Official artifact and version posture

| Artifact                    | Current official evidence                                                                                                                                                                                                      | Consequence for ASYM                                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Format specification        | [`okf/SPEC.md`](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) declares **Version 0.2** and says it is self-contained.                                                                        | Use the specification as the base contract.                                                                                                   |
| Immutable observed revision | Last specification commit: [`3fcbb9f`](https://github.com/GoogleCloudPlatform/knowledge-catalog/commit/3fcbb9f828c2f23d109c855ee403c3a4c81f3a96), 2026-07-24; observed spec blob: `a516d50128f5aa1f5746d1464661a39f7143e875`.  | Pin an immutable revision or vendored hash in addition to `0.2`.                                                                              |
| Releases and tags           | The official GitHub repository exposed no release or tag objects on 2026-08-12.                                                                                                                                                | Do not infer a release artifact or immutable `v0.2` tag that does not exist.                                                                  |
| License                     | The `okf/` work is distributed under [Apache License 2.0](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/LICENSE.md).                                                                                  | ASYM can implement and extend it while preserving required notices.                                                                           |
| Reference implementation    | [`okf/pyproject.toml`](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/pyproject.toml) calls the package `reference-agent` at `0.1.0`; the README describes it and the visualizer as proofs of concept. | Do not equate tool version `0.1.0` with format version `0.2`, or make the proof of concept a production dependency without a separate review. |

### Version semantics and their limit

The specification defines `<major>.<minor>` versioning: minor versions are intended for backward-compatible optional additions, while major versions may break required fields or reserved filenames. A bundle root `index.md` **may** declare `okf_version: "0.2"`; consumers that do not understand it should attempt best-effort consumption instead of refusing the bundle. ([versioning](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md#12-versioning))

However, v0.2 itself contains two deliberate breaking changes despite being a minor version: `generated.at` supersedes `timestamp`, and frontmatter `sources` supersedes a body `# Citations` list. The spec offers permissive consumer fallbacks, not a normative conversion algorithm. This is sufficient for best-effort reading but insufficient for reproducibly rebuilding an old Knowledge Pack. ([changes from v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md#13-changes-from-v01))

## The official domain model

The following vocabulary is directly defined by OKF v0.2. It is the clearest baseline for later ASYM modeling. ([terminology](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md#2-terminology))

| Official term            | Meaning and identity                                                                                                                                | Official relationship/state                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Knowledge Bundle**     | A self-contained hierarchical collection of knowledge documents and the unit of distribution. It may be a Git repository, archive, or subdirectory. | Contains concepts and optional reserved index/log files.                                                     |
| **Concept**              | One Markdown knowledge document, with YAML frontmatter and a free-form body.                                                                        | May represent a physical asset, abstract idea, playbook, metric, or other producer-defined type.             |
| **Concept ID**           | The concept file's path inside the bundle, without `.md`.                                                                                           | Bundle-local and path-derived; moving/renaming the file changes the ID.                                      |
| **Source**               | Material from which a concept derives, recorded in `sources`.                                                                                       | A concept can have many sources; a source `resource` may be a URL, path, or non-resolvable scope descriptor. |
| **Actor**                | A string using `<producer>/<version>`, `human:<id>`, or `process:<id>`.                                                                             | Appears in generation and verification events; OKF provides convention, not identity proof.                  |
| **Trust Tier**           | `unverified`, `machine-confirmed`, or `human-reviewed`, derived from `verified`.                                                                    | Advisory; a `human:` prefix yields human-reviewed. It is not access control or organizational authority.     |
| **Attested Computation** | A concept that describes a sanctioned computation, parameters, executor receipt shape, and deterministic attester.                                  | Records a contract; execution receipts are runtime artifacts outside the bundle.                             |

Two Factory terms are **not official OKF concepts**:

- **ASYM Authority** would describe the organizational force a concept may carry. It must remain distinct from OKF Trust Tier, which only reflects the declared verifier class.
- **Knowledge Pack** would be an ASYM-governed, reproducible selection or derived artifact for a role/run. OKF defines the entire Knowledge Bundle as its distribution unit; it does not define role-scoped packs.

These distinctions are candidate ubiquitous language for the later modeling ticket. They are not ratified here, and this research does not alter a `CONTEXT.md` or ADR.

## What base OKF guarantees

### Bundle structure and repository conventions

A bundle is a directory tree. Every `.md` file other than reserved `index.md` and `log.md` is a concept. Directories are producer-defined. Git is recommended because it supplies history, attribution, and diffs, but an archive or a subdirectory of a larger repository is equally permitted. Tags are frontmatter values, not separate aggregation documents. ([bundle structure](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md#3-bundle-structure))

An `index.md` may appear in any directory for progressive disclosure. It normally has no frontmatter; only the bundle-root index may carry `okf_version`. Entries are Markdown links grouped under headings and should include concept descriptions. Indexes are optional, may be generated, and may be synthesized by consumers. ([index files](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md#8-index-files))

A `log.md` may appear at any level. It uses newest-first ISO-date sections and prose entries; conventional labels such as `Update`, `Creation`, and `Deprecation` are not required. It is an optional human-readable history, not an append-only audit ledger. ([log files](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md#9-log-files))

Official sample bundles demonstrate domain directories, generated indexes, ordinary concept files, optional logs, deprecated concepts, and attested computations. They are examples, not additional normative rules. ([official bundles](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf/bundles))

### Concepts, identifiers, and extensions

Every concept is UTF-8 Markdown with a YAML frontmatter block followed by free-form Markdown. `type` is the only always-required field. `title`, `description`, `resource`, and `tags` are recommended, and provenance, trust, lifecycle, and computation families are optional. Producers may add arbitrary fields; round-tripping consumers should preserve unknown fields and must not reject them. Types have no central registry and consumers must tolerate unknown values. ([concept documents](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md#4-concept-documents))

Concept IDs are deterministic only within one concrete bundle tree: `architecture/one-writer.md` has ID `architecture/one-writer`. OKF does not define a bundle ID, globally unique concept URI, alias, redirect, rename history, or namespace registry. A `resource` is the optional canonical URI of an underlying asset, not the concept's stable identity.

This path model is simple and portable, but a Company Brain needs an additional identity policy if concept references must survive bundle moves, repository splits, or file renames.

### Relationships

OKF uses ordinary Markdown links as directed, **untyped** relationships. Absolute bundle-relative and ordinary relative links are supported. The prose around a link conveys whether it means `depends on`, `supersedes`, `implements`, or something else. Broken links are expressly tolerated and do not make a bundle malformed. ([cross-linking](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md#6-cross-linking-and-paths))

Lineage between OKF concepts can recurse through source links, but v0.2 explicitly leaves deeper external or data lineage out of scope. There is no official typed edge, edge identity, cardinality, inverse relation, graph constraint, or contradiction relation.

### Provenance and source attribution

Optional `sources` records materials from which a concept derives. Every source entry has a required `resource`; `id`, `title`, `author`, `usage_count`, `last_modified`, and a shared or per-source `usage_window` are optional. `resource` may identify a resolvable artifact or merely describe a population/scope. OKF records objective credibility signals, not a credibility score. ([provenance](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md#51-provenance-sources))

Per-claim attribution uses Markdown footnotes whose labels match stable `sources[].id` values. This is a useful join convention, but neither source IDs nor per-claim footnotes are mandatory. The spec does not require immutable source revisions, content hashes, successful resolution, source authorization, or preservation/retention.

### Generation, verification, and trust

Optional `generated` records who or what produced the current content and when it last meaningfully changed. If `generated` exists, `generated.by` is required within that mapping; `generated.at` is an ISO datetime. Optional `verified` contains one or more actor/time events confirming the content against sources or its resource. A bare mapping must be consumed as a one-element list. ([generation and verification](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md#52-trust-generated-and-verified))

Trust tier is mechanically derived:

- no `verified` → `unverified`;
- only non-`human:` verifiers → `machine-confirmed`;
- any `human:<id>` verifier → `human-reviewed`.

The format does not authenticate actor strings, bind them to a registry, require signatures, prove that verification occurred, specify what a verifier checked, or invalidate verification after a later content change. The spec explicitly calls the tiers advisory and not access control. A Company Brain therefore cannot infer ASYM authority or approval from OKF trust tier alone.

### Lifecycle and freshness

Optional `status` has three values: `draft`, `stable`, and `deprecated`. Absence means `stable`. Optional `stale_after` is an absolute `YYYY-MM-DD` date; a concept is stale when `today >= stale_after`. ([lifecycle](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md#54-lifecycle-status), [freshness](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md#55-lifecycle-stale_after))

OKF does not define review state, rejected/quarantined state, owner, approval policy, supersession edge, retention clock, deletion/erasure semantics, effective interval, conflict resolution, or required consumer behavior for ordinary stale content. A base-conformant concept without `status` is silently stable even if nobody reviewed it.

### Attested computations

`type: Attested Computation` can describe a runtime, typed parameters, inline or referenced computation, executor instructions and receipt fields, and a deterministic attester. It separates document verification from per-run attestation and says the agent may only supply declared parameter values. ([attested computations](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md#10-attested-computations-concept))

This is promising for sanctioned metrics, but OKF records rather than executes the contract. The full receipt/verdict wire protocol, attester ABI, portability/sandboxing, attestation caching, and some semantic-runtime mappings are explicitly deferred. Attestation receipts are not stored in the bundle. ASYM should not make first-slice Company Brain publication depend on this unfinished runtime surface.

## Conformance and tooling reality

### Normative conformance is intentionally permissive

A v0.2 bundle is conformant when:

1. each non-reserved Markdown file has parseable YAML frontmatter;
2. every such frontmatter block has a non-empty `type`; and
3. any present `index.md` and `log.md` follows its specified structure.

Consumers must not reject missing optional fields, unknown types or extension keys, broken links, or missing indexes. ([conformance](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md#11-conformance))

That interoperability posture is useful, but it means “OKF-conformant” is not evidence that a concept is sourced, reviewed, current, internally consistent, safe to reveal, or fit for a production Knowledge Pack.

### No official schema or full validator was found

The official repository contains no JSON Schema, YAML schema, schema registry artifact, validator CLI, migration command, or published conformance test package under `okf/`. The format also says there is “no schema registry, no central authority, and no required tooling.” ([specification introduction](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md))

The proof-of-concept [`OKFDocument.validate`](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/src/reference_agent/bundle/document.py) checks only that `type` is non-empty. It does not validate all files in a bundle, reserved index/log structure, source shapes, actors, dates, status values, links, v0.2 attested-computation requirements, or unknown-key preservation across third-party consumers. Its tests confirm parsing, `type`, trust-tier normalization, and staleness helpers, but are not a complete conformance suite. ([document tests](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/tests/test_document.py))

### The reference agent is useful evidence, not a production SDK

The reference CLI exposes only:

- `enrich`, currently with a BigQuery source and optional constrained web pass; and
- `visualize`, which emits a self-contained HTML graph view.

It does not expose `validate`, `migrate`, `pack`, `publish`, `serve`, or `verify` commands. The README explicitly frames the agent and visualizer as proofs of concept. ([CLI source](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/src/reference_agent/cli.py), [README](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/README.md))

Its internal producer code does provide useful implementation examples: safe YAML parsing, type validation before writes, generated actor/time defaults, path-segment checks, index generation, trust derivation, staleness checks, source-preserving enrichment guards, and a viewer. Those behaviors do not become normative OKF guarantees merely because the reference agent implements them.

## Gap analysis for an ASYM Company Brain

This table identifies responsibility boundaries for the next design ticket. “Needed ASYM closure” describes a requirement class, not a selected schema or implementation.

| Concern                  | Official OKF v0.2 guarantee                                        | Needed ASYM closure                                                                                                 |
| ------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Base artifact            | Portable directory of Markdown concepts; Git recommended           | Decide repository/bundle topology, publication authority, review flow, and canonical custody                        |
| Version fixation         | Optional `okf_version: "0.2"`; best-effort unknown-version reading | Pin exact upstream spec revision/validator; record profile and migration versions                                   |
| Concept identity         | Path without `.md`, local to a bundle                              | Stable namespaced identity and rename/move policy if references must survive topology changes                       |
| Type system              | Free string; unknown values accepted                               | Controlled ASYM vocabulary and conditional rules without denying generic OKF extensibility                          |
| Relationships            | Untyped Markdown links; broken links tolerated                     | Decide typed relationship representation, validation, inverses/cardinality, supersession, and contradiction policy  |
| Provenance               | Optional source entries and optional claim footnote join           | Require source identity/revision/hash where risk warrants; resolution, retention, and source-authority policy       |
| Generation               | Optional actor and timestamp                                       | Registered producer identity, harness/version fixation, and mutation semantics                                      |
| Verification             | Optional actor/time events; advisory tier by actor prefix          | Authenticated actor registry, verification scope/evidence, invalidation, independence, and approval rules           |
| Organizational authority | Not defined                                                        | Explicit authority model kept separate from Trust Tier and linked to canonical systems of record                    |
| Lifecycle                | Optional `draft/stable/deprecated`; absence is stable              | Explicit publication state, owner, approval, quarantine/rejection, supersession, retention, and deletion policy     |
| Freshness                | Optional absolute stale date                                       | Per-type freshness rules and deterministic warn/refuse/reverify behavior                                            |
| Access/security          | Trust tiers are not access control                                 | Repository/bundle separation, authorization, sensitivity labeling, redaction, secrets/PII controls, and read audit  |
| Integrity                | Git recommended; no format-level signatures/hashes                 | Exact commit/content hashing, protected publication, artifact verification, and tamper-evident audit                |
| Validation               | Minimal normative conformance                                      | Full base validator plus stricter profile validation, link/source checks, fixtures, and compatibility suite         |
| Search/serving           | Not prescribed                                                     | Authorized retrieval, indexing/embeddings, ranking, progressive loading, and outage posture                         |
| Knowledge Pack           | Not defined                                                        | Reproducible manifest/subset semantics, exact bundle commits, concept hashes, access scope, expiry, and run linkage |
| Migration                | v0.1 fallbacks described; no migrator                              | Adoption cadence, approval, deterministic transforms, old-reader compatibility, and immutable old-pack reproduction |
| Attestation              | Computation contract vocabulary                                    | Execution service, receipt store, ABI/sandbox, identity, policy, and failure behavior if/when adopted               |

## Comparison with the August 3 Factory brief

| Brief claim                                                                                                        | Current disposition                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current official specification is v0.2                                                                             | **Confirmed** as of 2026-08-12. The brief should add an immutable upstream revision because no `v0.2` release/tag exists.                                                 |
| OKF is a format, not a runtime, database, search engine, agent framework, access-control system, or hosted service | **Confirmed.** This boundary is central to a safe Company Brain design.                                                                                                   |
| Concept ID is the file path without `.md`                                                                          | **Confirmed, with qualification.** It is bundle-local and unstable across path changes; it is not a global durable ID.                                                    |
| `type` is the only always-required concept field and extensions are permitted                                      | **Confirmed.** This is why a stricter ASYM profile is necessary.                                                                                                          |
| `sources`, `generated`, `verified`, `status`, and `stale_after` provide provenance/trust/lifecycle signals         | **Confirmed, but all are optional.** They provide metadata, not authenticated governance.                                                                                 |
| Trust tiers are not access control or ASYM authority                                                               | **Confirmed explicitly by the spec.**                                                                                                                                     |
| Ordinary Markdown links represent relationships                                                                    | **Confirmed.** Relationship type is prose-only and broken links remain conformant.                                                                                        |
| Git-backed Markdown is a suitable canonical publication artifact                                                   | **Compatible with OKF, not mandated.** Git is recommended; OKF does not define protected publication or canonical custody.                                                |
| Base conformance can be validated before ASYM profile validation                                                   | **Conceptually sound, but tooling is missing.** Upstream supplies normative rules and partial reference code, not a full validator CLI/schema.                            |
| Knowledge Packs can be OKF-derived artifacts                                                                       | **An ASYM extension, not an OKF feature.** The format's distribution unit is the bundle. Pack selection, manifests, hashes, access, and reproducibility remain ASYM work. |
| v0.2 consumers can read v0.1 using fallbacks                                                                       | **Supported as best-effort guidance, not guaranteed migration tooling.** Old-pack reproducibility requires stricter ASYM pinning and tests.                               |

## Decision inputs for the next Wayfinder ticket

The later Company Brain topology/profile decision can proceed with these evidence-backed constraints:

1. **Adopt the layer, not an imagined platform.** OKF can standardize the published artifact while Git hosting, Supabase metadata, retrieval, authorization, review, and audit remain separate ASYM responsibilities.
2. **Pin more than `0.2`.** Record the exact reviewed upstream commit/blob or vendor the specification, then version the ASYM profile and validator independently.
3. **Preserve generic compatibility.** Base concepts should remain readable by permissive OKF consumers; ASYM-specific governance belongs in a versioned extension/profile and external policy.
4. **Do not reuse Trust Tier as Authority.** A `human:` string is an advisory signal, not authenticated approval or permission.
5. **Treat stable identity as an ASYM concern.** Path IDs are useful for local navigation but insufficient for cross-bundle, long-lived Knowledge Pack references without a rename/topology policy.
6. **Build validator evidence before publication.** The official proof of concept cannot certify a Company Brain bundle. ASYM needs deterministic base and profile validators with fixtures for both acceptance and rejection.
7. **Keep packs reproducible.** Any role-scoped Knowledge Pack should bind to immutable bundle revisions and exact selected content rather than mutable paths alone.
8. **Defer attested computation runtime unless a first-cell use case requires it.** The format surface exists, but key execution and attestation protocols are intentionally unfinished.

## Primary sources

- [Official OKF v0.2 specification](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
- [Immutable observed specification commit](https://github.com/GoogleCloudPlatform/knowledge-catalog/commit/3fcbb9f828c2f23d109c855ee403c3a4c81f3a96)
- [Official OKF README and proof-of-concept tooling](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/README.md)
- [Official reference-agent source](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf/src/reference_agent)
- [Official tests](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf/tests)
- [Official sample bundles](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf/bundles)
- [Google Cloud v0.2 announcement](https://cloud.google.com/blog/products/data-analytics/okf-v0-2-adds-trust-signals/)
- [Google Cloud introduction to OKF](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing)

## Research conclusion

OKF v0.2 is fit as the **open, portable base representation** of a Company Brain, provided ASYM does not confuse format conformance with knowledge quality, authority, security, or reproducibility. Its intentionally small core is an advantage for interchange and a liability if treated as a complete governance system.

The next design step should choose the Company Brain's repository/bundle topology and define the boundaries of a stricter ASYM profile, validator, and Knowledge Pack contract. It should not replace OKF's permissive base or claim that upstream already guarantees the controls ASYM must add.
