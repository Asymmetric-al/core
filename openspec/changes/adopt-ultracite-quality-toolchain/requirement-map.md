This map traces each obligation in the owner’s assignment to plan v11: the decisions (L1 to L13 and the numbered sections of `design.md`), the tasks of its section 6, the checks of its section 8 (VR-1 to VR-12) and `implementation-guide.md` (cited as guide); a reference names planned work or recorded process, not a passing check. A dash means the column is not needed. A section or task note names the covering text. A qualifying note marks council process, an owner override, an exclusion, a deferral with its owner, a clause v11 meets by a smaller means than plan v10 ("changed in v11"), a process step that was not recorded at the time, or a gap that plan v11 does not yet cover.

## Preamble — Mandate and authorization

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| P-01 | Work in the Core repository. | §2 | OS-1 | VR-12 | — |
| P-02 | Use supported T3 orchestration for an independent council. | §12 | — | §12 | process: council record |
| P-03 | Establish facts before refining the plan. | §2, §12 | — | §12 | process: council record |
| P-04 | Reach the prescribed average before implementing. | §12 | — | §12 | override: No round passed; the owner ratified unscored v10 after round 10, then directed the unscored v11 ("update the plan and proceed"). |
| P-05 | Implement the ratified plan. | §5, L13 | CL-1 | VR-12 | — |
| P-06 | Verify the integrated implementation. | §1 | CL-1 | VR-12 | — |
| P-07 | Complete qualification and planning rounds before broad edits. | §12 | — | §12 | process: council record |
| P-08 | Begin authorized implementation without another general approval. | §12, L13 | — | — | — |

## §1 — Goals and authority

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 1-01 | Use a coherent Ultracite policy for code quality and autonomous work. | §1, L2 | TC-3, PL-1 | VR-1, VR-4 | — |
| 1-02 | Adopt TSRS after qualification. | L4 | TC-4, BC-1 | VR-2 | — |
| 1-03 | Upgrade the independent native compiler appropriately. | L8 | TS-1, RB-1 | VR-7 | — |
| 1-04 | Enforce substantive anti-slop rules. | §4.1, L6 | PL-1, RS-* | VR-1, VR-4 | changed in v11: the anti-slop rules are errors in product code; a test or script profile may turn one off only for a reason that holds for a new, clean file (L6). |
| 1-05 | Integrate the policy into supported agent and editor workflows. | L11 | FC-1, WF-2, WF-5, WF-7 | VR-10 | — |
| 1-06 | Finish code and tooling repairs under the accepted policy. | §1, L5 | M1, M2, MK-1, RS-*, CL-1 | VR-12 | deferred: the legacy shadcn findings and their ledger stay with `integrate-design-system-lint` (L10); compiling the central tests is the follow-up Central test compiler coverage, owned by this change's coordinator (L9). |
| 1-07 | Do not equate installation, a proposal or a temporary baseline with completion. | §1, L5 | CL-1 | VR-12 | — |
| 1-08 | Verify the repository, stack versions, applications, packages and integrations actually present. | §2, L1 | TC-1, TS-3, WF-7 | VR-7, VR-10, VR-12 | — |
| 1-09 | Read the complete original research handoff. | §12 | — | §12 | process: council record |
| 1-10 | Leave the supplied handoff unmodified. | §10, §13 | — | — | — |
| 1-11 | Use the supplied self-contained handoff rather than requiring an additional owner evidence file. | §12 | — | §12 | exclusion: No second owner attachment is needed; the council generates its own evidence. |
| 1-12 | Treat handoff conclusions as hypotheses, not established facts. | §2, §10 | — | §12 | — |
| 1-13 | Select or revise recommendations according to current evidence. | §10 | PL-0, PL-1 | §12 | — |
| 1-14 | Distinguish owner goals, existing obligations, observations, upstream assertions and proposals. | §2 | OS-1 | §12 | — |
| 1-15 | Do not impose every suggested architecture. | §10 | PL-1 | §10 | — |
| 1-16 | Update relevant tools, tests, configuration, CI, documentation and integrations within the authorized scope. | L1, L3, §7 | TC-1, TS-1, FC-1, LC-1, WF-5 | VR-6, VR-7, VR-12 | — |
| 1-17 | Reconcile old pins, stable-only policies and obsolete guidance with the chosen cohort. | L1, L8 | TS-1, WF-5 | VR-7 | — |
| 1-18 | Preserve product behavior and accepted intent. | §4.5 | M1, M2, RS-* | §4.5 | changed in v11: test-first repairs and review by a different model replace the fault-patch library and the behavior inventories (§11). |
| 1-19 | Preserve tenant isolation. | §4.5 | RS-* | §4.5 | changed in v11: a repair in a tenant filter gets a test that fails for the wrong tenant, in place of the tenant inventory (§11). |
| 1-20 | Preserve authorization boundaries. | §4.3, §4.5 | PL-2, RS-* | VR-3, §4.5 | changed in v11: a repair in a role or permission check gets a test that fails for the wrong role, in place of the tenant and auth inventory (§11). |
| 1-21 | Retain exact financial representations and calculations. | §4.1, §4.5 | RS-* | §4.5 | changed in v11: the money rules of §4.5 replace the money and numeric-truthiness inventories (§11). |
| 1-22 | Keep runtime validation at ingress. | §4.1, §4.5 | RS-* | §4.5 | changed in v11: the repair rules of §4.1 and §4.5 replace the predicate-owner registry. |
| 1-23 | Preserve accessibility. | §4.2, §4.4, L10 | PL-2, RS-* | VR-4, VR-12 | — |
| 1-24 | Keep meaningful regression coverage. | §4.5 | M1, RS-* | §4.5 | changed in v11: test names and the Playwright list are compared before and after, in place of the test-ID tool (§11). |
| 1-25 | Protect unrelated work. | L11, L12, L13 | FC-1, LC-1 | VR-9 | — |
| 1-26 | Protect source and evidence records. | L2, L7, L12 | FM-1 | VR-8 | — |
| 1-27 | Preserve upstream or licensed bytes and provenance. | L1, L7, L12 | TC-2, FM-1, FM-3, SD-1 | VR-1, VR-8 | — |
| 1-28 | Respect review and release boundaries. | L2, L7, L13; §5 | TC-3, FM-1, CL-1 | VR-4, VR-8; CL-1 handoff | L2 and L7 exclude the released pack; CL-1 names both outstanding cleanups and the factory as release owner. |
| 1-29 | Use Core’s ordinary OpenSpec and development workflow. | L13 | OS-1, CL-1 | `openspec validate --strict`, VR-12 | — |
| 1-30 | Do not rewrite historical evidence to obtain a pass. | L2, L7, L12 | FM-1 | VR-8 | — |
| 1-31 | Do not weaken safeguards to clear the gates. | §4.5, L12 | RS-* | §4.5 | changed in v11: the forbidden-repair list in every brief and review replaces the eight custom lint rules (§11). |
| 1-32 | Resolve routine engineering decisions without returning them to the owner. | L13, §13 | — | — | — |
| 1-33 | Escalate only an unresolved protection or product decision, unavailable access or necessary human account action. | §13 | — | §12 | — |

## §2 — Council setup

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 2-01 | Consult the installed council skill and orchestration instructions. | §12, The council | — | §12 disclosure | not recorded: §12 identifies the missing guidance and wait history; it makes no claim about this step. |
| 2-02 | Use live orchestration schemas rather than inventing commands, identifiers, options or switch APIs. | §12 | — | §12 | process: council record |
| 2-03 | Keep the main coordinator responsible for orchestration and adjudication. | §12, L13 | — | §12 | process: council record |
| 2-04 | Give the coordinator ownership of the canonical plan, integration and completion. | L13 | CL-1 | guide §1 | — |
| 2-05 | Request three independent reviewers. | §12 | — | §12 | process: council record |
| 2-06 | Request the specified Astra reviewer through Codex at the original extra-high preference. | §12 | — | §12 | process: council record |
| 2-07 | Request the specified Opus reviewer through Claude Code at the original extra-high preference. | §12 | — | §12 | process: council record |
| 2-08 | Request the specified Carbon reviewer through Cursor at the original extra-high preference. | §12 | — | §12 | process: council record |
| 2-09 | Discover supported providers, models, delegation capabilities and efforts before selecting targets. | §12 | — | §12 | process: council record |
| 2-10 | Select explicit supported targets on fresh delegated tasks. | §12 | — | §12 | process: council record |
| 2-11 | Do not equate display labels with callable model identifiers or assume identical effort names. | §12 | — | §12 | process: council record |
| 2-12 | Keep an available requested model at its highest supported effort when the requested setting is unavailable. | §12 | — | §12 | process: council record |
| 2-13 | Substitute a comparable flagship only when the requested model is unavailable. | §12 | — | §12 | override: The owner expressly replaced an available Carbon model after round 7; its completed review remained in the record. |
| 2-14 | Prefer the intended provider before an authorized alternative. | §12 | — | §12 | process: council record |
| 2-15 | Record requested and observed settings separately, including substitutions and unavailable execution metadata. | §12, The council | — | `council-record.md` §§1–2; design §12 | §12 distinguishes selected settings from execution settings the provider reported. |
| 2-16 | Preserve three independent contexts and provider diversity where available. | §12 | — | §12 | process: council record |
| 2-17 | Never misreport same-provider reviewers as different providers. | §12 | — | §12 | process: council record |
| 2-18 | Give delegates the whole assignment, handoff, relevant snapshot and current plan and evidence locations. | §12 | — | §12 | process: council record |
| 2-19 | Do not assume inherited conversation history or that fresh worktrees contain uncommitted inputs. | §12 | — | §12 | process: council record |
| 2-20 | Keep investigation and planning reviewers read-only. | §12 | — | §12 | process: council record |
| 2-21 | Have each reviewer assess the complete proposal independently. | §12 | — | §12 | process: council record |
| 2-22 | Use complementary compiler, semantics and workflow expertise without leaving any full-plan review gap. | §12 | — | §12 | process: council record |
| 2-23 | Bound each delegate’s responsibilities; sharing context does not authorize a nested council or unassigned edits. | §12 | — | §12 | process: council record |
| 2-24 | Do not let planning cleanup reach product code; limit it to records and isolated qualification. | §12 | — | §12 | process: council record |
| 2-25 | Freeze both the plan and checkout during review. | §12 | — | §12 | process: council record |
| 2-26 | Continue only nonconflicting investigations while reviewers work. | §12 | — | §12 | process: council record |
| 2-27 | Follow the orchestration response for waiting, results and follow-ups. | §12, The council | — | §12 disclosure | not recorded: §12 identifies the missing guidance and wait history; it makes no claim about this step. |
| 2-28 | Do not busy-poll delegated work. | §12, The council | — | §12 disclosure | not recorded: §12 identifies the missing guidance and wait history; it makes no claim about this step. |
| 2-28b | Do not interpret a timed-out wait as a failed task. | §12, The council | — | §12 disclosure | not recorded: §12 identifies the missing guidance and wait history; it makes no claim about this step. |

## §3 — Quota and recovery

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 3-01 | Use only configured, authenticated and authorized provider instances. | §12 | — | §12 | process: council record |
| 3-02 | Switch interrupted work only through an authorized subscription. | §12 | — | §12, guide §1 | process: council record |
| 3-03 | Checkpoint before long runs and at meaningful milestones. | — | — | guide §1 | — |
| 3-04 | Capture the revision, uncommitted work, plan version, current owners, evidence, open findings, active delegates and next actions. | guide §1, Checkpoints | — | — | Guide §1 lists the durable checkpoint contents. |
| 3-05 | Make checkpoint context sufficient for an accurate restart. | — | — | guide §1 | — |
| 3-06 | Verify quota or availability using an actual provider error or exposed usage information. | §12 | — | §12, guide §1 | process: council record |
| 3-07 | Do not infer exhaustion from slowness or a wait timeout. | — | — | guide §1 | — |
| 3-08 | Prefer a configured instance supporting the same requested model and effort. | guide §1, Models | — | — | Guide §1 prefers the same requested model and effort. |
| 3-09 | Otherwise use an authorized alternative and record the change. | §12 | — | §12, guide §1 | process: council record |
| 3-10 | Select the replacement using its actual supported provider-instance identifier. | guide §1, Models | — | — | Guide §1 selects the supported provider-instance ID on a fresh task. |
| 3-11 | Stop or cancel superseded work before reassigning it. | guide §1, Models | — | — | Guide §1 requires cancellation or stopping and confirmation that no paths still overlap. |
| 3-11b | Confirm no superseded delegate still owns overlapping edits before handing them off. | guide §1, Models | — | — | Guide §1 requires cancellation or stopping and confirmation that no paths still overlap. |
| 3-12 | Give a replacement a complete standalone handoff. | §12 | — | §12, guide §1 | process: council record |
| 3-13 | Preserve partial work on replacement. | guide §1, Models | — | — | Guide §1 keeps partial work for the replacement to inspect and finish. |
| 3-13b | Require the replacement to inspect partial work and finish the outstanding assignment. | guide §1, Models | — | — | Guide §1 keeps partial work for the replacement to inspect and finish. |
| 3-14 | Require the replacement reviewer to review the entire frozen plan and submit all eight scores. | §12 | — | §12 | process: council record |
| 3-15 | Preserve partial review findings as evidence. | §12 | — | §12 | exclusion: Interrupted reviewers returned no partial findings or scores to preserve or combine; replacements reviewed the frozen input from scratch. |
| 3-15b | Never combine different reviewers’ partial scores into a completed review. | §12 | — | §12 | exclusion: Interrupted reviewers returned no partial findings or scores to preserve or combine; replacements reviewed the frozen input from scratch. |
| 3-16 | Do not give an incomplete review a final score. | §12 | — | §12 | process: council record |
| 3-17 | Continue unaffected work during a provider interruption. | §12 | — | §12 | process: council record |
| 3-18 | Do not resend work to an instance known to be exhausted. | §12 | — | §12 | process: council record |
| 3-19 | Do not assume histories are shared between provider profiles. | §12 | — | §12 | process: council record |
| 3-20 | Use a fresh task with the checkpoint when native continuation is unavailable. | §12 | — | §12 | process: council record |
| 3-21 | Use only an exposed continuation mechanism when the coordinator is blocked. | guide §1, Models | — | — | Guide §1 permits only a continuation or switch T3 actually exposes. |
| 3-21b | Do not claim the coordinator can switch autonomously after losing inference access. | guide §1, Models | — | — | Guide §1 permits only a continuation or switch T3 actually exposes. |
| 3-22 | Give the smallest exact human action if a coordinator switch requires T3 selection. | guide §1, Models | — | — | Guide §1 calls for the exact T3 action and a checkpoint naming the next task. |
| 3-22b | Leave durable instructions for resuming after human selection. | guide §1, Models | — | — | Guide §1 calls for the exact T3 action and a checkpoint naming the next task. |
| 3-23 | Do not copy credentials when moving the work. | guide §1, Models | — | — | Guide §1 rules out credential copying, session logout, global account changes, private switching APIs and paid API billing. |
| 3-23b | Do not log another session out. | guide §1, Models | — | — | Guide §1 rules out credential copying, session logout, global account changes, private switching APIs and paid API billing. |
| 3-23c | Do not modify global account directories. | guide §1, Models | — | — | Guide §1 rules out credential copying, session logout, global account changes, private switching APIs and paid API billing. |
| 3-24 | Do not invent internal switching APIs. | guide §1, Models | — | — | Guide §1 rules out credential copying, session logout, global account changes, private switching APIs and paid API billing. |
| 3-24b | Do not switch silently to new paid API billing. | guide §1, Models | — | — | Guide §1 rules out credential copying, session logout, global account changes, private switching APIs and paid API billing. |
| 3-24c | Use only the authorized subscriptions and supported routes. | §12 | — | §12 | process: council record |
| 3-25 | Record roster changes faithfully. | §12 | — | §12, guide §1 | process: council record |
| 3-26 | Do not replace completed adverse reviews or seek a more favorable score. | §12 | — | §12 | process: council record |

## §4 — Ground truth

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 4-01 | Inspect current instructions, accepted specs, source boundaries, dependencies, config, tests, CI, generators, protected records and integrations. | §2 | PL-0, TS-3 | §2 | — |
| 4-02 | Recheck material handoff claims against current source and selected versions. | §2, §10 | TC-1, TS-1 | VR-1, VR-2, VR-7 | — |
| 4-03 | Include every relevant app and package, including the private Console. | L6, L9, L10, §4.2 | PL-2, TS-3 | VR-3, VR-4, VR-7 | — |
| 4-04 | Include root scripts, tests, tooling, generators and shared consumers. | L6, L7, L9 | TS-3, FM-3, GEN-1b | VR-4, VR-7, VR-8 | — |
| 4-05 | Recompute historical counts rather than treating them as current facts. | §2, §4.1 | PL-1 | §4.1 | — |
| 4-06 | Use version-matched primary documentation, release information, source and reproducible focused experiments. | §2, L1, L4 | TC-2, TC-4, BC-1 | VR-1, VR-2 | — |
| 4-07 | Record exact versions and revisions. | L1, §1 | TC-1, CL-1 | VR-2, VR-7, VR-12 | — |
| 4-08 | Distinguish inspection, execution, inference and unverified claims. | Evidence legend; §§2, 13 | — | — | The design header defines all four classes; §§2 and 13 mark unverified claims. |
| 4-09 | Assess new advice against the actual stack. | L1, §10 | PL-0, PL-1 | VR-4 | — |
| 4-10 | Confine pre-ratification feasibility trials to disposable fixtures or isolated worktrees. | §12 | — | §12 | process: council record |
| 4-11 | Start broad changes and authoritative cutover after council qualification. | §12, §5 | — | §12 | override: The owner authorized execution after round 10 without a passing scored round, then directed the unscored v11. |
| 4-12 | Keep one canonical plan, evidence and decision record, and task tracker. | §11 | OS-1 | `openspec validate --strict` | — |
| 4-13 | Reuse existing records rather than constructing parallel documentation. | §11 | OS-1 | — | — |
| 4-14 | Map every assignment requirement to a decision, task, verification, justified exclusion or blocker. | §14 | OS-1 | §14 | This file is the clause map; design §14 links to it. |

## §5 — Migration scope

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 5-01 | Cover all five migration responsibilities. | §1, §3, §4 | OS-1, CL-1 | §1 | — |
| 5-02 | Choose the simplest supported approach rather than prescribing the handoff’s layout, adapters, baseline or sequence. | §10, §11 | PL-0, PL-1 | §10, §12 | — |

## §5A — Quality policy and anti-slop

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 5A-01 | Qualify exact obtainable tool versions and the Oxlint/Oxfmt provider choice. | L1, §2 | TC-1 | VR-1, VR-2 | — |
| 5A-02 | Qualify configuration inheritance and effective scope. | L2 | TC-3, PL-1 | VR-4 | — |
| 5A-03 | Check optional presets and interactions with incumbent rules. | §4.2, §10, L5 | PL-0, PL-1 | VR-4 | — |
| 5A-04 | Evaluate all eighteen handoff rules and version-specific changes. | §4.1, L6 | TC-2, PL-1 | VR-1, VR-4 | — |
| 5A-05 | Favor enforcement with meaningful signal. | L6, §4.1 | PL-1, RS-* | VR-4 | §4.1 leaves test and script rules on unless PL-1 documents a clean-file reason. |
| 5A-06 | Record each rule’s scope and diagnostic behavior. | §4.1, L6 | PL-1 | VR-4 | — |
| 5A-07 | Record each rule’s permitted exceptions. | §4.1, L5, L6 | PL-1 | VR-4 | — |
| 5A-08 | Record remediation cost for each rule. | §4.1, L6 | PL-1 | §4.1 | Design §4.1 gives the raw counts and the repair for each rule; PL-1 refreshes them. |
| 5A-09 | Set each rule’s proposed severity. | §4.1, L3 | PL-1 | VR-4 | — |
| 5A-10 | Distinguish analyzer defects, genuine semantic exceptions and transitional debt. | L1, L5 | TC-2, PL-1 | VR-1, VR-4 | — |
| 5A-11 | Reproduce or disprove handoff defects, including the nested generic dictionary crash. | §2, L1 | TC-2 | VR-1 | — |
| 5A-12 | Prefer a fixed upstream release or the smallest reviewed, pinned regression-tested patch. | L1 | TC-2 | VR-1 | — |
| 5A-13 | Do not infer reliability from a clean source scan alone. | L1, L3 | TC-2 | VR-1 | — |
| 5A-14 | Do not erase useful types with any. | §4.5 | RS-* | §4.5 | changed in v11: the forbidden-repair list in every brief and review replaces the eight custom lint rules (§11). |
| 5A-15 | Do not disguise assertions to silence lint. | §4.5 | RS-* | §4.5 | changed in v11: the reviewer reads every new type guard, helper and SAFETY comment, in place of a custom lint rule (§11). |
| 5A-16 | Reject vacuous type predicates. | §4.5 | RS-* | §4.5 | changed in v11: the reviewer reads every new type guard, helper and SAFETY comment, in place of a custom lint rule (§11). |
| 5A-17 | Reject meaningless safety comments. | §4.1, §4.5 | RS-* | §4.5 | changed in v11: the reviewer reads every new type guard, helper and SAFETY comment, in place of a custom lint rule (§11). |
| 5A-18 | Do not conceal module mocking. | L6, §4.5 | MK-1 | VR-4 | — |
| 5A-19 | Do not delete negative tests to obtain a pass. | §4.5, L8 | TS-1, RS-* | VR-7, §4.5 | — |
| 5A-20 | Do not remove necessary runtime checks. | §4.1, §4.5 | RS-* | §4.5 | — |
| 5A-21 | Protect financial representations. | §4.1, §4.5 | RS-* | §4.5 | changed in v11: the money rules of §4.5 replace the money and numeric-truthiness inventories (§11). |
| 5A-22 | Preserve property presence and absence semantics. | §4.1 | RS-* | §4.5 | — |
| 5A-23 | Preserve ordering through repairs. | §4.5 | M2, RS-* | §4.5 | changed in v11: a file's output is pinned on raw input before its repair, in place of the golden-hash pre-work (§11). |
| 5A-24 | Preserve callback and updater behavior. | §4.1, §4.5 | RS-* | §4.5 | — |
| 5A-25 | Preserve reflection and decoder boundaries. | §4.1 | RS-* | §4.5 | — |
| 5A-26 | Preserve useful test isolation. | L6, §4.5 | MK-1, RS-* | §4.5 | — |
| 5A-27 | Judge each optional preset by value and conflicts on Core. | §4.2; §10, Deferred | PL-1 | VR-4 | §10 defers Landmines because its comment ban conflicts with required safety comments. |
| 5A-28 | Do not require every optional preset. | §10 | PL-1 | — | — |
| 5A-29 | Do not introduce large abstractions merely to satisfy style rules. | §4.2, §11 | PL-1 | §4.2 | — |

## §5B — TSRS and TypeScript

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 5B-01 | Start with the specified Oxc TSRS announcement and its linked primary material. | §2 | — | E4, E7, E12 | process: council record |
| 5B-02 | Refresh prerelease availability, initializer behavior, backend selection and override observations. | L1, L4, §2 | TC-1, TC-4 | VR-2 | — |
| 5B-03 | Identify the bundled engine as a typed-lint dependency only. | L1, L4 | TC-4 | VR-2 | — |
| 5B-04 | Keep the native whole-project compiler independent. | L8 | TS-1 | VR-7 | — |
| 5B-05 | Identify classic API, parser, generator and editor consumers separately. | L1, L8, L11 | TS-1, GEN-1a, FC-1 | VR-7 | — |
| 5B-06 | Do not replace root classic TypeScript merely because TSRS is installed. | L1, L8 | TS-1 | VR-7 | — |
| 5B-07 | Qualify and implement the native TypeScript 7.1 beta upgrade or a better-supported obtainable alternative. | L1, L8 | TS-1, RB-1 | VR-7 | — |
| 5B-08 | Retain API tooling until a replacement demonstrates equivalent behavior. | L8 | TS-1 | VR-7 | — |
| 5B-09 | Update the root native alias and every applicable workspace compiler pin together. | L1, L8 | TS-1 | VR-7 | — |
| 5B-10 | Check lockfile and platform binaries against declared and installed versions. | L1 | TC-1, TC-4, TS-1 | VR-2, VR-7 | — |
| 5B-11 | Update the active version policy and verifier. | L8 | TS-1 | VR-7 | — |
| 5B-12 | Qualify generated types and strict Next builds. | L8 | TS-1, GEN-1a, GEN-1b | VR-7 | — |
| 5B-13 | Keep real negative compiler fixtures. | L8, L9 | TS-1, TS-3 | VR-7 | — |
| 5B-14 | Prove editor and parser compatibility. | L8, L11 | TS-1, FC-1 | VR-7 | — |
| 5B-15 | Include compiler and backend changes in cache policy. | L3, §7 | CL-1 | VR-6 | — |
| 5B-16 | Prove the backend actually executed from each relevant working directory. | L4 | TC-4 | VR-2 | — |
| 5B-17 | Prove actual backend execution in each relevant native or T3 harness. | L3, L4 | TC-4, WF-7 | VR-2, VR-10 | changed in v11: hooks and editors run untyped (L3), so the typed entry points a harness uses are the root script, the CI command and a workspace script, each proved by VR-2. |
| 5B-18 | Do not accept package presence, config contents or an absolute launcher path as identity evidence. | L4 | TC-4 | VR-2 | — |
| 5B-19 | Recheck OXLINT_TSGOLINT_PATH and whether initialization adds or prefers a competing backend. | L1, L3, L4 | TC-1, TC-4 | VR-2 | — |
| 5B-20 | Compare raw diagnostic multisets and actual file coverage against tsgolint. | L4 | BC-1 | BC-1 record | — |
| 5B-21 | Compare safe-fix patches and reliability against the reference. | L4 | BC-1 | BC-1 record | — |
| 5B-22 | Measure elapsed time and memory across backends. | §2, L4 | BC-1, PF-1 | PF-1 records | changed in v11: E7 and E12 record the backends' time and memory; PF-1 measures Core's commands before and after, in place of repeated campaigns (§11). |
| 5B-23 | Compare fast and reference modes, with semantic reporting off and on. | §2, L4 | BC-1 | BC-1 record | changed in v11: E7 and E12 found fast and reference modes diagnostic-identical; BC-1 varies semantic reporting at the cutover revision. |
| 5B-24 | Vary file order and worker count on a frozen corpus. | L4 | BC-1 | BC-1 record | — |
| 5B-25 | Investigate compiler-version-dependent differences. | §2, L4 | BC-1 | BC-1 record | changed in v11: E7 and E12 trace the only message differences to the 7.0 and 7.1 type printers; BC-1 compares again at the cutover revision. |
| 5B-26 | Measure Core’s end-to-end workflow; do not present upstream benchmarks as local results. | §2 | PF-1 | PF-1 records | — |
| 5B-27 | Retain independent project-wide typechecks. | L8, L9, §7 | TS-1, TS-3 | VR-7 | — |
| 5B-28 | Do not equate typed lint with coverage of ignored files, all projects or global failures. | L3, L9 | TS-3 | VR-4, VR-7 | — |
| 5B-29 | Inventory every authored TypeScript scope, including root configuration, scripts, central tests and tooling. | L9 | TS-3 | VR-7, TS-3 inventory and controls | VR-7 checks tracked-file classification and failing and passing typed controls for each lint-only test program. |
| 5B-30 | Classify compiler programs, justified lint-only contexts, generated outputs and intentional negative fixtures. | L9 | TS-3 | VR-7, TS-3 inventory and controls | VR-7 checks tracked-file classification and failing and passing typed controls for each lint-only test program. |
| 5B-31 | Connect qualified programs to real commands and CI instead of merely adding tsconfigs. | L9 | TS-3 | VR-7, public `typecheck` and CI | VR-7 seeds errors in the three new compiled scopes and checks both entry points. |
| 5B-32 | Actively pursue qualified TSRS adoption. | L1, L4 | TC-1, TC-4, BC-1 | VR-2 | — |
| 5B-32b | Resolve remediable setup, version and policy obstacles. | L1, L3, L4 | TC-1, TC-3, TC-4 | VR-2 | — |
| 5B-33 | For a persistent material blocker, document cause, coverage and attempted fixes. | L4, Fallback; L8 | CL-1 | VR-2 | L4 records the affected coverage alongside the cause, reproducer and attempted remedies. |
| 5B-34 | Provide a simple pinned fallback for each blocked upgrade. | L4, L8 | RB-1 | VR-2, VR-7 | — |
| 5B-35 | Continue work unaffected by a blocked upgrade. | L4, §5 | CL-1 | §1 | — |
| 5B-35b | Identify the unmet adoption goal explicitly. | L4, §1 | CL-1 | §1 | — |

## §5C — TanStack, architecture and tests

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 5C-01 | Retain both ESLint Query bridge rules unless a replacement demonstrates equivalent coverage. | L10 | QB-1 | VR-5 | — |
| 5C-02 | Detect imported void and possibly undefined query results. | L10 | QB-1 | VR-5 | — |
| 5C-03 | Detect rest destructuring through typed custom-hook wrappers. | L10 | QB-1 | VR-5 | — |
| 5C-04 | Run meaningful passing and failing cases; direct imports alone do not establish coverage. | L10 | QB-1 | VR-5, public command | VR-5 sends each valid twin through the same command as its failing case. |
| 5C-05 | Evaluate Query, Table, DB, Virtual, Store and Form against their real consumers, not a generic preset. | §4.4 | PL-0, PL-1 | §4.4 | — |
| 5C-06 | Preserve query keys and cache isolation. | §4.4, §4.5 | RS-* | VR-5, §4.4 | — |
| 5C-07 | Preserve query invalidation and cancellation. | §4.4 | RS-* | §4.4 | — |
| 5C-08 | Preserve subscription behavior across the applicable TanStack consumers. | §4.4 | RS-* | §4.4 | — |
| 5C-09 | Preserve the shared table integration and reactive updates. | §4.4 | PL-2, RS-* | VR-3, §4.4 | — |
| 5C-10 | Keep DB runtime identity and collection behavior consistent. | §4.4 | RS-* | §4.4 | — |
| 5C-11 | Keep virtualizer measurements and focus stable. | §4.4 | RS-* | §4.4 | — |
| 5C-12 | Keep form validation and accessibility intact. | §4.4 | RS-* | §4.4, VR-12 | — |
| 5C-13 | Maintain architectural and import restrictions. | §4.3 | PL-2 | VR-3 | — |
| 5C-14 | Keep canonical API and CMS entry points. | §4.3 | PL-2 | VR-3, VR-12 | — |
| 5C-15 | Preserve browser/server separation. | §4.3 | PL-2 | VR-3 | — |
| 5C-16 | Preserve React Compiler conventions and narrowly justified framework exceptions. | L5, §4.2, §4.4, §5 | PL-0, PL-2 | VR-4 | — |
| 5C-17 | Preserve Shadcn rule intent in all applicable apps and shared packages, including the Console’s actual layout. | L10; §1 item 6 | LC-1 | VR-4, `lint:ui` and health check | VR-4 checks the six rules in all six workspaces, patched behavior, discovery, health failures and the ledger. |
| 5C-18 | Verify Base UI, Maia and theme conventions. | L10; §1 item 6 | LC-1 | VR-4, `lint:ui` and health check | VR-4 checks the six rules in all six workspaces, patched behavior, discovery, health failures and the ledger. |
| 5C-19 | Check patched rules, component discovery and positive and negative controls. | L10; §1 item 6 | LC-1 | VR-4, `lint:ui` and health check | VR-4 checks the six rules in all six workspaces, patched behavior, discovery, health failures and the ledger. |
| 5C-20 | Keep design-system responsibilities without imposing a new adapter framework. | L10 | LC-1 | — | — |
| 5C-21 | Keep meaningful Vitest and Playwright tests. | L6, §4.2, §4.5 | MK-1, RS-* | VR-4, §4.5 | — |
| 5C-22 | Keep diagnostic-exact compile-failure coverage. | L8, L9 | TS-1, TS-3 | VR-7 | — |
| 5C-23 | Retain existing test frameworks despite using Bun to run packages. | §4.2, L9 | — | VR-4 | — |
| 5C-24 | Check actual missing locator-await detection. | §4.2 | PL-2 | VR-4 | — |
| 5C-25 | Exercise custom fixtures and aliases with valid counterparts. | §4.2 | PL-2 | VR-4 | — |
| 5C-26 | Check the conditional-test policy and failing exit on warnings. | §4.2, L3 | PL-2 | VR-4 | — |
| 5C-27 | Demonstrate enforcement rather than relying on plugin or preset presence. | §4.2 | PL-2 | VR-4 | — |
| 5C-28 | Keep Vitest and Playwright rules confined to their proper scopes. | §4.2 | PL-2 | VR-4 | — |

## §5D — Formatters, protected content and skills

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 5D-01 | Port the skill audit hash updater. | L7 | FM-3 | VR-8 | — |
| 5D-02 | Port the upstream skill refresher. | L7 | FM-3 | VR-8 | — |
| 5D-03 | Port the managed-skill compatibility normalizer. | L7 | FM-3 | VR-8 | — |
| 5D-04 | Port the Taste preview adapter. | L7 | FM-3 | VR-8 | — |
| 5D-05 | Port the Taste charts adapter. | L7 | FM-3 | VR-8 | — |
| 5D-06 | Port the Payload import-map postprocessor. | L7 | FM-3, GEN-1a, GEN-1b | VR-7, VR-8 | — |
| 5D-07 | Discover and include formatter consumers beyond the original six. | §2, L7 | FM-3, GEN-1b | VR-8 | L7 names the extra consumers and the Python CLI exception; FM-3 starts with a reference search. |
| 5D-08 | Qualify actual output and failures of each replacement consumer. | L7 | FM-2, FM-3 | VR-8 | — |
| 5D-09 | Keep publication atomic, including interruption and missing-tool failures. | L7 | FM-2, FM-3 | VR-8 | — |
| 5D-10 | Preserve symlink handling. | L7, consumer tests | FM-3 | VR-8 | L7 requires byte-identical published output on a symlink or inventory mismatch. |
| 5D-11 | Keep generated files with their canonical producer. | L7 | FM-3, GEN-1a, GEN-1b | VR-7, VR-8 | — |
| 5D-12 | Keep nested fence fixes and formatting in the correct order. | L7, consumer tests | FM-3 | VR-8 | L7 puts nested-fence repair before formatting. |
| 5D-13 | Run each reviewed transformation exactly once. | L7, consumer tests | FM-3 | VR-8 | L7 requires exactly one match per Taste replacement and rejects mixed or drifted input. |
| 5D-14 | Keep canonical and installed inventories consistent. | L12 | FM-3, WF-5 | `skills:verify` | — |
| 5D-15 | Separate trusted product formatting from imported content handling. | L7 | FM-2 | VR-8 | — |
| 5D-16 | Probe plugin, Tailwind and config discovery for execution of source-local settings. | L7, managed profile | FM-1, FM-2 | VR-8, source-local config and plugin | L7 disables sorting; VR-8 verifies that formatting loads neither the local config nor its plugin. |
| 5D-17 | Preserve protected bytes. | L2, L7 | FM-1 | VR-8 | — |
| 5D-18 | Preserve reviewed transformations, provenance and distinct raw and adapted hashes. | L7, L12 | FM-3, SD-1 | VR-8, consumer tests | L7 preserves raw upstream hashes; only adapted hashes are re-attested. |
| 5D-19 | Do not rehash unexplained transformations. | L12 | FC-2 | the reviewer's replay | — |
| 5D-20 | Update canonical skills through the established sync owners. | L12, §5 | WF-5 | `skills:verify` | — |
| 5D-21 | Keep generated mirrors and audit records in sync. | L12 | WF-5, FC-2 | `skills:verify` | — |
| 5D-22 | Prove formatting and lint fixes converge. | L7, §5 | FC-2, M1, M2 | VR-8, the reviewer's replay | changed in v11: the reviewer replays each mechanical commit and a second pass changes nothing, in place of the replay verifier (§11). |
| 5D-23 | Keep mechanical formatting separate from semantic repairs. | L7, §5 | FC-2, M1, M2, RS-* | the reviewer's replay | — |
| 5D-24 | Review order-sensitive changes. | §4.1, §4.5 | M2, RS-* | §4.5 | — |
| 5D-25 | Distinguish retiring direct formatter ownership from allowed transitive dependencies. | §1, §5 | FC-1 | FC-1 reference search; VR-8 | FC-1 removes direct ownership and callers, not other packages’ dependencies. |

## §5E — Daily workflows, caches and CI

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 5E-01 | Verify each native harness separately from its T3 integration. | L11; §6, WF-7 | WF-2, WF-7 | VR-10 | WF-7 records the settings file, profile and worktree for separate native and T3 observations where both are used. |
| 5E-02 | Record actual settings, active profile and checkout or worktree context. | L11; §6, WF-7 | WF-7 | VR-10 | WF-7 records the settings file, profile and worktree for separate native and T3 observations where both are used. |
| 5E-03 | Prove the edit hook runs exactly once. | L11 | WF-2, WF-7 | VR-10 | — |
| 5E-04 | Observe useful diagnostics reaching the model; do not infer delivery from a nonzero exit. | L11 | WF-7 | VR-10 | — |
| 5E-05 | Confirm meaningful editor feedback. | L11 | FC-1, WF-7 | VR-10, VS Code | VR-10 checks an Oxc diagnostic, formatting on command and the active root 6.0.3 SDK. |
| 5E-06 | Provide explicit checks where automatic feedback is unsupported. | L11 | LC-1, WF-5 | docs tests | — |
| 5E-07 | Keep routine edit feedback fast and reserve full typed and project checks for the proper gates. | L3, L11 | WF-2, LC-1, PF-1 | VR-10, PF-1 records | — |
| 5E-08 | Do not reinstall from the network on routine edits. | L11, Agent edit hook | WF-2, WF-7 | VR-10, offline hook | L11 allows only installed binaries; VR-10 runs the edit hook offline. |
| 5E-09 | Do not start nested autonomous repair loops from normal hooks. | L3, L11 | WF-2, FC-1 | VR-10 | — |
| 5E-10 | Preserve partial staging without including unrelated working-tree changes. | L11 | FC-1, LC-1 | VR-9 | — |
| 5E-11 | Exercise partially staged and renamed files. | L11 | FC-1, LC-1 | VR-9 | — |
| 5E-12 | Exercise deletions, empty input and failure paths. | L11 | FC-1, LC-1 | VR-9 | — |
| 5E-13 | Verify dependency-aware invalidation for imported types. | §7 | CL-1 | VR-6 | — |
| 5E-14 | Verify invalidation or uncached execution for compiler, backend and config changes. | L3, L10, §7 | QB-1, LC-1 | VR-6 | L10 makes the Query bridge task uncached; VR-6 covers it with the rest of the lint gate. |
| 5E-15 | Verify that a rule-plugin or patch change reaches affected consumers. | L3, L10, §7 | QB-1, LC-1 | VR-6 | L10 makes the Query bridge task uncached; VR-6 covers it with the rest of the lint gate. |
| 5E-15b | Verify that a lockfile-only change invalidates affected checks. | L3, L10, §7 | QB-1, LC-1 | VR-6 | L10 makes the Query bridge task uncached; VR-6 covers it with the rest of the lint gate. |
| 5E-16 | Verify component-discovery changes reach unchanged consumers. | L3, L10 | LC-1 | VR-6 | changed in v11: the shadcn bridge runs whole and uncached from the root, so a discovery change reaches every consumer without a cache case. |
| 5E-16b | Verify theme-discovery changes reach unchanged consumers. | L3, L10 | LC-1 | VR-6 | changed in v11: the shadcn bridge runs whole and uncached from the root, so a discovery change reaches every consumer without a cache case. |
| 5E-17 | Cover root-level and generated consumers, not just workspace filters. | L9, §7 | TS-1, TS-3 | VR-6, VR-7 | §7 and VR-6 include both an app route and a changed type imported by a root program. |
| 5E-18 | Keep lint, formatting, typechecks, real tests, integrity checks and required CI together in the quality workflow. | §1, §7 | LC-1, CL-1 | VR-12 | — |
| 5E-19 | Do not replace the aggregate gates with one Ultracite invocation. | L1, L3, §7 | LC-1 | VR-12 | — |
| 5E-20 | Assign temporary baseline ownership and enforce no growth. | L5, L10 | PL-1 | `verify:lint-pending` | — |
| 5E-21 | Give each baseline an explicit retirement task. | L5, §5 | CL-1 | §1 | deferred: the shadcn ledger's retirement stays with `integrate-design-system-lint`, tasks 5.4 to 5.10 (L10). |
| 5E-22 | Handle simultaneous worktrees and hooks safely. | L5, L11, §7 | FC-1, LC-1 | VR-9 | — |
| 5E-23 | Never treat crashes or setup errors as passing baselines. | L3 | TC-3 | VR-4 (launcher); VR-2 (backend) | — |
| 5E-24 | Resolve ordinary violations and retire migration debt at completion. | L5, §1 | RS-*, CL-1 | VR-12 | deferred: the legacy shadcn findings stay with `integrate-design-system-lint` (L10). |
| 5E-25 | Require a concrete semantic justification for each narrow permanent exception. | L3, L5 | PL-1, RS-* | VR-4 | — |

## §6 — Planning rounds and scoring

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 6-01 | Have each investigator examine the assignment, handoff, repository and primary sources before seeing other reviewers’ conclusions. | §12 | — | §12 | process: council record |
| 6-02 | Return findings and evidence with stated confidence. | §12 | — | §12 | process: council record |
| 6-03 | Return disagreements, alternatives and unresolved questions. | §12 | — | §12 | process: council record |
| 6-04 | Have the coordinator verify material claims using code, documentation and focused experiments. | §2, §12 | — | §12 | process: council record |
| 6-05 | Record accepted, rejected and unresolved findings with reasons. | §10, §12 | — | §12 | process: council record |
| 6-06 | Investigate credible minority objections rather than deciding by majority. | §12 | — | §12 | process: council record |
| 6-07 | Revise the dependency-ordered plan and decision record. | §5, §12 | — | §12 | process: council record |
| 6-08 | Explain substantive departures from the handoff. | §10, §12 | — | §12 | process: council record |
| 6-09 | Freeze an identifiable plan and evidence snapshot for review. | §12 | — | §12 | process: council record |
| 6-10 | Have all three reviewers assess the same complete version on all dimensions. | §12 | — | §12 | process: council record |
| 6-11 | Resolve concrete findings and test disputed assumptions before revising. | §2, §12 | — | §12 | process: council record |
| 6-12 | Request a new independent review after substantive improvements. | §12 | — | §12 | process: council record |
| 6-13 | Start a fresh delegated task for every independent review or recheck; continuation is not independence. | §12 | — | §12 | process: council record |
| 6-14 | Supply frozen materials and material risks without prior numeric scores. | §12 | — | §12 | process: council record |
| 6-15 | Record passage and begin implementation only after the latest full round satisfies average and hard gates. | §12 | — | §12 | override: No round passed both gates; the owner ratified v10 after round 10 without a score, then directed the unscored v11. |
| 6-16 | Continue improving while actionable defects remain. | §12 | — | §12 | process: council record |
| 6-17 | Do not stop at an arbitrary round count. | §12 | — | §12 | override: The owner explicitly ended scored review at round 10; the later checks and the simplification review were unscored. |
| 6-18 | Do not inflate scores or resubmit an unchanged plan to obtain a favorable draw. | §12 | — | §12 | process: council record |
| 6-19 | Report unavailable evidence or a genuine external decision as a blocker. | §13 | CL-1 | §1 | — |
| 6-20 | Use the same predeclared 0–10 rubric for every reviewer and dimension. | §12 | — | §12 | process: council record |
| 6-21 | Score whether adoption, upgrade, enforcement, cleanup and integrations cover the owner’s intent. | §12 | — | §12 | process: council record |
| 6-22 | Score repository fit using current facts, primary sources for the selected versions and reproducible evidence. | §12 | — | §12 | process: council record |
| 6-23 | Score how consistently the plan separates tool responsibilities, handles compatibility and covers the transition. | §12 | — | §12 | process: council record |
| 6-24 | Score protection of product semantics, safety, regression tests, controlled content and provenance. | §12 | — | §12 | process: council record |
| 6-25 | Score whether tasks have clear dependencies, owners, manageable batches, cleanup and rollback. | §12 | — | §12 | process: council record |
| 6-26 | Score whether passing and failing controls address real risks with objective completion criteria. | §12 | — | §12 | process: council record |
| 6-27 | Score simplicity: avoid redundant machinery, conflicting sources, broad exceptions and ongoing maintenance costs. | §12 | — | §12 | process: council record |
| 6-28 | Score operational reliability across harnesses, hooks, editors, staging, concurrency, caches, performance and CI. | §12 | — | §12 | process: council record |
| 6-29 | Use the original bands: 0–4 unsound, 5–6 redesign, 7–8 important gaps, 9 limited weaknesses, and 9.2+ ready only without material defects. | §12 | — | §12 | process: council record |
| 6-29b | Treat ten as no known substantive improvement, not a guarantee of perfection. | §12 | — | §12 | process: council record |
| 6-30 | Give evidence-based reasons and necessary improvements for each score. | §12 | — | §12 | process: council record |
| 6-31 | Put findings before scores. | §12 | — | §12 | process: council record |
| 6-32 | Compute the arithmetic mean of all 24 equally weighted scores. | §12 | — | §12 | process: council record |
| 6-33 | Show each reviewer’s eight scores and the overall round mean. | §12 | — | §12 | process: council record |
| 6-33b | Publish the mean across reviewers for each dimension in every scored round. | §12 | — | §12 | process: council record |
| 6-34 | Apply 9.2 to the unrounded overall mean. | §12 | — | §12 | process: council record |
| 6-34b | Do not treat 9.2 as a minimum for each dimension. | §12 | — | §12 | process: council record |
| 6-35 | Never omit difficult dimensions. | §12 | — | §12 | process: council record |
| 6-35b | Do not change the weights after seeing scores. | §12 | — | §12 | process: council record |
| 6-35c | Do not drop unfavorable scores. | §12 | — | §12 | process: council record |
| 6-36 | Do not average scores from different plan versions. | §12 | — | §12 | process: council record |
| 6-36b | Do not invent ratings to complete a review. | §12 | — | §12 | process: council record |
| 6-37 | Complete a replacement review before relying on a round with missing scores. | §12 | — | §12 | process: council record |
| 6-38 | Treat material safety or correctness defects as hard gates regardless of mean. | §12 | — | §12 | process: council record |
| 6-39 | Treat missing mandatory scope, unsupported critical compatibility or an unexecutable critical path as hard gates. | §12 | — | §12 | process: council record |
| 6-40 | Separate feasibility evidence from post-implementation tests; do not require a finished migration for planning approval. | §1, §12 | — | §12 | process: council record |
| 6-41 | Treat scores as readiness judgments, not probabilities or proof. | §1, §12 | — | §12 | process: council record |
| 6-42 | Execute once authorized instead of polishing the plan cosmetically. | §12 | — | — | — |

## §7 — Ratified plan contents

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 7-01 | Keep the plan usable, with sufficient operational detail for implementation. | §11 | OS-1 | `openspec validate --strict` | changed in v11: about 660 KB of plan documents became this design, a tracker and a short guide (§11). |
| 7-02 | Document current ground truth. | §2 | — | — | — |
| 7-03 | State the chosen architecture and substantive decisions. | §3 | OS-1 | — | — |
| 7-04 | State the exact qualified tool versions. | L1 | TC-1, TS-1 | VR-2, VR-7 | — |
| 7-05 | Identify all affected files and workflows. | L2, L6, L7, L9 | TS-3, LC-1 | VR-4 | changed in v11: VR-4's check that every tracked JS or TS file is linted or ignored with a reason, and the reference search of L13, replace the cutover and inventory tasks. |
| 7-06 | Supply a rule-by-rule policy and justified exceptions. | §4.1, §4.2, L5, L6 | PL-0, PL-1 | VR-1, VR-4 | — |
| 7-07 | Link requirements to their implementation and verification. | §14 | OS-1 | §14 | This file is the clause map; design §14 links to it. |
| 7-08 | State dependencies, owners and integration order. | §5, L13 | — | — | — |
| 7-09 | Describe transition, temporary compatibility and retirement of migration machinery. | §5 | FC-1, LC-1, CL-1 | §1 | — |
| 7-10 | State the final authoritative commands. | L3 | FC-1, LC-1, WF-5 | VR-12 | — |
| 7-11 | Give compiler and backend qualification results. | §2 | TC-4, BC-1, TS-1 | VR-2, VR-7 | — |
| 7-12 | Specify behavior-preservation checks and CI acceptance. | §4.5, §7 | RS-*, CL-1 | VR-12, §4.5 | — |
| 7-13 | Specify rollback and ongoing maintenance. | §9, L4, L8 | RB-1 | VR-7 | — |
| 7-14 | Record adopted, rejected and deferred handoff recommendations. | §10 | CL-1 | — | — |
| 7-15 | Record genuine uncertainties. | §13 | CL-1 | — | — |
| 7-16 | Include the actual final council score table. | §12 | — | §12 | — |
| 7-17 | Use stable task identifiers throughout delegation, recovery, integration and review. | §6 | OS-1 | `tasks.md` | — |

## §8 — Parallel implementation

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 8-01 | Proceed without another general implementation approval. | §12 | — | — | — |
| 8-02 | Use qualified delegates only where genuinely useful and bound concurrency by resources and independence. | L13, §7 | RS-* | guide §2 | — |
| 8-03 | Use the applicable model, effort and fallback policy for implementation and final reviewers. | L13, §1 | CL-1 | guide §1 | override: An explicit later model mix governs non-council work; historical council efforts remain as recorded. |
| 8-04 | Assign disjoint responsibilities and explicit acceptance criteria. | L13 | RS-* | guide §1 | — |
| 8-05 | Isolate parallel work in suitable worktrees. | L13 | RS-* | guide §1 | — |
| 8-06 | Give each implementer the ratified version, source context, dependencies, allowed scope and verification obligations. | L13 | RS-* | guide §1 | — |
| 8-07 | Keep lockfiles, root configuration, baselines, broad formatting and final integration under explicit single ownership. | L13, L5 | FC-2, M1 | guide §1 | — |
| 8-08 | Prohibit overlapping edits and concurrent repository-wide fixers. | L3, L7, L13 | FC-2, M1 | the reviewer's replay | — |
| 8-09 | Limit parallel agents using native checker worker counts and actual resource limits. | L3, §7 | PF-1 | guide §2 | — |
| 8-10 | Integrate in dependency order. | §5, L13 | — | — | — |
| 8-11 | Separate mechanical, configuration and semantic changes into reviewable batches. | L7, L13, §5 | TS-1, FC-1, FC-2, LC-1, M1, M2, RS-* | the reviewer's replay | — |
| 8-12 | Keep compiler and backend changes independently diagnosable and reversible. | L4, L8, §5 | TS-1, RB-1 | VR-2, VR-7 | — |
| 8-13 | Track planned, active, implemented, integrated, verified and blocked tasks with evidence. | §6; `tasks.md` tracker key | OS-1 | `tasks.md`, status and verification record | The tracker key distinguishes the five unchecked states from checked, coordinator-verified work. |
| 8-14 | Do not mark a task verified on delegate testimony alone. | §6 | CL-1 | guide §1 | — |
| 8-15 | Record material implementation discoveries and update affected decisions and tasks. | — | OS-1 | guide §5 | — |
| 8-16 | Get focused independent review before affected work continues. | — | — | guide §5 | — |
| 8-17 | Reopen full scoring only if a change materially invalidates the ratified plan. | §12 | — | guide §5 | override: The owner ended scored review at round 10 and adopted v11 unscored; a material discovery gets the focused review of guide §5, not a new score. |
| 8-18 | Do not drift from decisions or repeat settled research without cause. | — | — | guide §5 | — |
| 8-19 | Fix confirmed migration regressions without changing working behavior. | §4.5 | RS-* | VR-12 | — |
| 8-19b | Rerun verification on the affected paths. | §6 | RS-*, CL-1 | VR-12 | — |
| 8-20 | Continue until done or a specific external blocker remains. | §1, L4 | CL-1 | VR-12 | — |
| 8-21 | Do not declare success with ordinary lint debt, incomplete integration or unreviewed suppression. | §1, L5 | CL-1 | VR-12 | deferred: the inherited shadcn ledger remains and is reported with its raw count and owner (L10). |

## §9 — Integrated acceptance

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 9-01 | Test the actual final revision after a fresh frozen dependency installation. | §1 | CL-1 | VR-12 | — |
| 9-02 | Bypass caches for required acceptance checks where practical. | §1 | CL-1 | VR-12 | — |
| 9-03 | Record exact commands, revision, environment, scope and results. | §1 | CL-1 | VR-12 | — |
| 9-04 | Demonstrate complete intended Ultracite, Oxlint and Oxfmt coverage. | §1, L2, L7 | LC-1, FC-1, CL-1 | VR-4, VR-8, VR-12 | — |
| 9-05 | Prove TSRS ran, or explicitly identify the unresolved blocker and pinned fallback. | L4 | TC-4, CL-1 | VR-2 | — |
| 9-06 | Prove compiler upgrade and retained API/editor compatibility across projects, generators, builds and negative fixtures. | L8, L9, L11 | TS-1, GEN-1a, GEN-1b, TS-3, FC-1, WF-7 | VR-7, VR-10 | VR-7 covers compiler and API consumers; VR-10 covers the editor. |
| 9-07 | Show anti-slop, Query, Shadcn, architecture and other protections catch actual failures without evasions. | §1 item 6, L10 | PL-1, PL-2, QB-1, MK-1, LC-1 | VR-1, VR-3, VR-4, VR-5 | VR-4 checks the reduced shadcn bridge; VR-1, VR-3, VR-4 and VR-5 cover the other seeded failures. |
| 9-08 | Demonstrate formatter consumers, protected content and provenance. | L7, L12 | FM-3, SD-1, FC-2 | VR-8 | — |
| 9-09 | Demonstrate staging, worktree isolation, caches and actual integrations. | L11, §7 | FC-1, LC-1, WF-2, WF-7 | VR-6, VR-9, VR-10 | — |
| 9-10 | Pass all required lint, formatting, compiler, test, integrity and CI gates. | §1 | CL-1 | VR-12 | — |
| 9-11 | Exercise runtime or application behavior for sensitive repairs. | §4.4, §4.5 | RS-* | §4.5, VR-12 | changed in v11: test-first repairs and each area's existing suites replace the behavior controls of v10. |
| 9-12 | Remove migration machinery and debt or accurately report them as unfinished. | §5, §1 | CL-1 | VR-12 | deferred: the shadcn ledger (L10) and compiling the central tests (L9) are reported as not done, with their owners. |
| 9-13 | Have independent reviewers challenge the integrated changes and completion claims. | §1 | CL-1 | §1 | — |
| 9-14 | Fix valid findings in the integrated changes. | §1 | CL-1 | VR-12 | — |
| 9-14b | Rerun affected verification after corrections. | §6 | CL-1 | VR-12 | — |
| 9-15 | Do not substitute the planning score for final acceptance checks. | §1, §12 | CL-1 | VR-12 | — |
| 9-16 | Use the normal branch and PR process. | L13 | CL-1 | VR-12 | — |
| 9-17 | Include council results and evidence in the reviewable delivery. | §12 | OS-1 | — | — |
| 9-18 | Honor required approvals and release boundaries. | L2, L7, L13; §5 | TC-3, FM-1, CL-1 | VR-4, VR-8; CL-1 handoff | L2 and L7 exclude the released pack; CL-1 names both outstanding cleanups and the factory as release owner. |

## §10 — Final handoff

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 10-01 | Deliver a short, practical final explanation. | §1 | CL-1 | — | — |
| 10-02 | Link the final handoff directly to the detailed plan and evidence. | §6, CL-1 | CL-1 | CL-1 handoff | CL-1 links the design and evidence. |
| 10-03 | Explain the implementation, rationale and exact tool, compiler and backend versions. | L1; §6, CL-1 | CL-1 | CL-1 handoff | CL-1 explains the implementation and rationale with exact tool, compiler and backend versions. |
| 10-04 | Report actual council models, efforts, substitutions, rounds and final scores. | §12; §6, CL-1 | CL-1 | CL-1 handoff | CL-1 reports the council settings, substitutions, rounds and scores, subject to the disclosures in §12. |
| 10-05 | Identify retained, changed, rejected and deferred handoff recommendations. | §10; §6, CL-1 | CL-1 | CL-1 handoff | CL-1 reports the disposition of the research recommendations in §10. |
| 10-06 | State what was demonstrated, passed or remains unverified. | §1; §6, CL-1 | CL-1 | VR-12; CL-1 handoff | CL-1 distinguishes demonstrations, passing checks and unverified work. |
| 10-07 | Give daily commands and the native, T3 and editor workflows. | L3, L11; §6, CL-1 | WF-5, WF-7, CL-1 | VR-10; CL-1 handoff | CL-1 gives daily commands and the native, T3 and editor workflow. |
| 10-08 | Identify any blocker, unfinished goal, fallback or manual step precisely. | §1, L4; §6, CL-1 | CL-1 | CL-1 handoff | CL-1 names every blocker, unfinished goal, fallback and manual step. |
| 10-09 | Confirm the source attachment was not modified. | Design header; §6, CL-1 | CL-1 | CL-1 digest comparison | CL-1 confirms the research handoff against the SHA-256 in the design header. |
| 10-10 | Preserve the original product and autonomous-development intent throughout delivery. | §1, §4.5 | CL-1 | VR-12 | — |
| 10-11 | Deliver the simplest supported setup that meets the stated goals. | §10, §11 | CL-1 | §12 | — |

## Later instruction — Later effort instruction

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| L-01 | Never select low reasoning effort. | L13 | — | guide §1 | process: council record |
| L-02 | Use extra-high for the general Codex selection. | L13 | — | §12 | process: council record |
| L-03 | Use extra-high for Carbon when supported. | §12 | — | §12 | exclusion: Carbon topped out at high; the owner later selected Neon at xhigh. |
| L-04 | Use maximum effort for Astra in the council. | §12 | — | §12 | process: council record |
| L-05 | Use high or extra-high for Claude Code. | L13 | — | §12 | process: council record |

## Coverage counts

- Requirements: 389
- Re-pointed to plan v11: 389 (388 with changed references; 5C-13 keeps §4.3, PL-2 and VR-3, which mean the same in both plans)
- Mapped to a decision, a task or a verification, with no qualifying note: 255
- Council process, shown by the council record: 90
- Met by a smaller means than plan v10 (changed in v11): 24
- Deferred, with the owner named in the note: 5
- Mapped by an owner override, with the reason in the note: 7
- Mapped by an exclusion, with the reason in the note: 4
- Process steps that were not recorded at the time: 4
- Gaps, where plan v11 gives the clause no home or only a weak one: 0

The 55 former gap rows now point to their covering text. The four historical process steps marked not recorded remain unclaimed.
