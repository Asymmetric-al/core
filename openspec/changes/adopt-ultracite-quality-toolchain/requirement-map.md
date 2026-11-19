This map traces each obligation in the owner’s assignment to plan v10 (`design.md`) and its companion records; a reference identifies planned work or recorded process, not a passing implementation check. A dash means that column is not needed or lacks a direct reference; the note identifies council process, an authorized exclusion or deferral, or says that a process step was not recorded at the time.

## Preamble — Mandate and authorization

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| P-01 | Work in the Core repository. | §2 | IN-0 | §8.1 | — |
| P-02 | Use supported T3 orchestration for an independent council. | §16 | — | §16 | process: council record |
| P-03 | Establish facts before refining the plan. | §2 | IN-0 | §16 | process: council record |
| P-04 | Reach the prescribed average before implementing. | §16 | — | §16 | override: No round passed; the owner ratified unscored v10 after round 10. |
| P-05 | Implement the ratified plan. | §8.2 | IN-1, Close-out | VR-12 | — |
| P-06 | Verify the integrated implementation. | §12 | Close-out | VR-12 | — |
| P-07 | Complete qualification and planning rounds before broad edits. | §16 | — | §16 | process: council record |
| P-08 | Begin authorized implementation without another general approval. | D13 | IN-0 | §8.2 | — |

## §1 — Goals and authority

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 1-01 | Use a coherent Ultracite policy for code quality and autonomous work. | §1, D2 | TC-1, PL-1 | VR-1, VR-4 | — |
| 1-02 | Adopt TSRS after qualification. | D4 | TC-4, TC-5 | VR-2, §7.4 | — |
| 1-03 | Upgrade the independent native compiler appropriately. | §5.2 | TS-1, RB-1 | VR-7 | — |
| 1-04 | Enforce substantive anti-slop rules. | D5, §4.1 | PL-1, PL-5 | VR-1, VR-13 | — |
| 1-05 | Integrate the policy into supported agent and editor workflows. | D11 | WF-2, WF-5, WF-6, WF-7 | VR-10, D11 | — |
| 1-06 | Finish code and tooling repairs under the accepted policy. | §1, §8.5 | SW-1, CT-1, CT-T, W-UI | VR-12 | — |
| 1-07 | Do not equate installation, a proposal or a temporary baseline with completion. | §1, §12 | Close-out | VR-12 | — |
| 1-08 | Verify the repository, stack versions, applications, packages and integrations actually present. | §2, D13 | IN-0, CTI, WF-7 | §8.1, VR-7, VR-10 | — |
| 1-09 | Read the complete original research handoff. | §16 | — | §16 | process: council record |
| 1-10 | Leave the supplied handoff unmodified. | §13, §16 | Close-out | §10.3 | — |
| 1-11 | Use the supplied self-contained handoff rather than requiring an additional owner evidence file. | §13, §16 | — | §16 | exclusion: No second owner attachment is needed; the council generates its own evidence. |
| 1-12 | Treat handoff conclusions as hypotheses, not established facts. | §2, §13 | IN-0 | §14, §16 | — |
| 1-13 | Select or revise recommendations according to current evidence. | §13 | PL-0, PL-1 | §0a, §16 | — |
| 1-14 | Distinguish owner goals, existing obligations, observations, upstream assertions and proposals. | §1, §2, D13 | OS-1 | §14, §16 | — |
| 1-15 | Do not impose every suggested architecture. | §13 | PL-1 | §13 | — |
| 1-16 | Update relevant tools, tests, configuration, CI, documentation and integrations within the authorized scope. | D1, D11, §7.1 | TC-1, TS-1, WF-3, WF-5 | VR-6, VR-7, VR-12 | — |
| 1-17 | Reconcile old pins, stable-only policies and obsolete guidance with the chosen cohort. | D1, §5.2 | TS-1, WF-5 | VR-7, §12 | — |
| 1-18 | Preserve product behavior and accepted intent. | §4.2, §8.5 | PL-3, FP-1, RS-* | VR-13 | — |
| 1-19 | Preserve tenant isolation. | §4.2 | TA-1, FP-1 | VR-13 | — |
| 1-20 | Preserve authorization boundaries. | §4.2, §4.3 | TA-1, PL-2 | VR-3, VR-13 | — |
| 1-21 | Retain exact financial representations and calculations. | D6, §4.2 | MI-1, PL-3 | VR-13 | — |
| 1-22 | Keep runtime validation at ingress. | D5, §4.2 | PO-1, PL-5 | VR-13 | — |
| 1-23 | Preserve accessibility. | D7, D12, §4.4 | PL-2, W-UI, RS-* | VR-4, VR-12 | — |
| 1-24 | Keep meaningful regression coverage. | §8.5 | TID-1, FP-1 | VR-13 | — |
| 1-25 | Protect unrelated work. | D10, §8.4 | PC-1, WF-1 | VR-9 | — |
| 1-26 | Protect source and evidence records. | D2, D8, D9 | FM-1, AP-1 | VR-8 | — |
| 1-27 | Preserve upstream or licensed bytes and provenance. | D8, D9, §6 | TC-2, FM-3, SD-1 | VR-1, VR-8 | — |
| 1-28 | Respect review and release boundaries. | D13, §8.1 | RS-PACK, Close-out | §12 | — |
| 1-29 | Use Core’s ordinary OpenSpec and development workflow. | §8.1, §10.1 | OS-1, Close-out | VR-12 | — |
| 1-30 | Do not rewrite historical evidence to obtain a pass. | D8, D9 | FM-1, AP-1 | VR-8 | — |
| 1-31 | Do not weaken safeguards to clear the gates. | D5, §8.5 | FP-1, PL-5 | VR-13 | — |
| 1-32 | Resolve routine engineering decisions without returning them to the owner. | §0c, D13 | IN-0 | §8.1 | — |
| 1-33 | Escalate only an unresolved protection or product decision, unavailable access or necessary human account action. | §0c, D13, §14 | IN-0 | §16 | — |

## §2 — Council setup

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 2-01 | Consult the installed council skill and orchestration instructions. | §16 | — | §16 | not recorded: this step was not recorded at the time, and design §16 says so. |
| 2-02 | Use live orchestration schemas rather than inventing commands, identifiers, options or switch APIs. | §16, §8.4 | — | §16 | process: council record |
| 2-03 | Keep the main coordinator responsible for orchestration and adjudication. | §0c, §16 | — | §16 | process: council record |
| 2-04 | Give the coordinator ownership of the canonical plan, integration and completion. | §8.4, §10 | IN-1, Close-out | §12 | — |
| 2-05 | Request three independent reviewers. | §16 | — | §16 | process: council record |
| 2-06 | Request the specified Astra reviewer through Codex at the original extra-high preference. | §16 | — | §16 | process: council record |
| 2-07 | Request the specified Opus reviewer through Claude Code at the original extra-high preference. | §16 | — | §16 | process: council record |
| 2-08 | Request the specified Carbon reviewer through Cursor at the original extra-high preference. | §16 | — | §16 | process: council record |
| 2-09 | Discover supported providers, models, delegation capabilities and efforts before selecting targets. | §8.4, §16 | — | §16 | process: council record |
| 2-10 | Select explicit supported targets on fresh delegated tasks. | §8.4, §16 | — | §16 | process: council record |
| 2-11 | Do not equate display labels with callable model identifiers or assume identical effort names. | §16 | — | §16 | process: council record |
| 2-12 | Keep an available requested model at its highest supported effort when the requested setting is unavailable. | §16 | — | §16 | process: council record |
| 2-13 | Substitute a comparable flagship only when the requested model is unavailable. | §8.4, §16 | — | §16 | override: The owner expressly replaced an available Carbon model after round 7; its completed review remained in the record. |
| 2-14 | Prefer the intended provider before an authorized alternative. | §8.4, §16 | — | §16 | process: council record |
| 2-15 | Record requested and observed settings separately, including substitutions and unavailable execution metadata. | §16 | — | §16 | Design §16 states what was asked, what was selected, and that unreported execution settings are unknown. |
| 2-16 | Preserve three independent contexts and provider diversity where available. | §16 | — | §16 | process: council record |
| 2-17 | Never misreport same-provider reviewers as different providers. | §16 | — | §16 | process: council record |
| 2-18 | Give delegates the whole assignment, handoff, relevant snapshot and current plan and evidence locations. | §16 | — | §16 | process: council record |
| 2-19 | Do not assume inherited conversation history or that fresh worktrees contain uncommitted inputs. | §16 | — | §16 | process: council record |
| 2-20 | Keep investigation and planning reviewers read-only. | §16 | — | §16, E9 | process: council record |
| 2-21 | Have each reviewer assess the complete proposal independently. | §16 | — | §16 | process: council record |
| 2-22 | Use complementary compiler, semantics and workflow expertise without leaving any full-plan review gap. | §16 | — | §16 | process: council record |
| 2-23 | Bound each delegate’s responsibilities; sharing context does not authorize a nested council or unassigned edits. | §16 | — | §16 | process: council record |
| 2-24 | Do not let planning cleanup reach product code; limit it to records and isolated qualification. | §16 | — | §16, E9 | process: council record |
| 2-25 | Freeze both the plan and checkout during review. | §16 | — | §16 | process: council record |
| 2-26 | Continue only nonconflicting investigations while reviewers work. | §0c, §16 | — | §16 | process: council record |
| 2-27 | Follow the orchestration response for waiting, results and follow-ups. | §16 | — | §16 | not recorded: this step was not recorded at the time, and design §16 says so. |
| 2-28 | Do not busy-poll delegated work. | §16 | — | §16 | not recorded: this step was not recorded at the time, and design §16 says so. |
| 2-28b | Do not interpret a timed-out wait as a failed task. | §16 | — | §16 | not recorded: this step was not recorded at the time, and design §16 says so. |

## §3 — Quota and recovery

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 3-01 | Use only configured, authenticated and authorized provider instances. | §8.4, §16 | — | §16 | process: council record |
| 3-02 | Switch interrupted work only through an authorized subscription. | §8.4, §16 | — | §16 | process: council record |
| 3-03 | Checkpoint before long runs and at meaningful milestones. | §8.1, §10 | IN-0 | §10 | — |
| 3-04 | Capture the revision, uncommitted work, plan version, current owners, evidence, open findings, active delegates and next actions. | §8.1, §10 | IN-0 | guide §1 | Guide §1 (Checkpoints): each open task, its owner and its completed evidence are in the checkpoint. |
| 3-05 | Make checkpoint context sufficient for an accurate restart. | §8.1, §10 | IN-0 | §10 | — |
| 3-06 | Verify quota or availability using an actual provider error or exposed usage information. | §8.4, §16 | — | §16 | process: council record |
| 3-07 | Do not infer exhaustion from slowness or a wait timeout. | §16 | — | §16 | Guide §1 (Models): the recovery rule covers this. |
| 3-08 | Prefer a configured instance supporting the same requested model and effort. | §8.4 | — | §16 | Guide §1 (Models): the recovery rule covers this. |
| 3-09 | Otherwise use an authorized alternative and record the change. | §8.4, §16 | — | §16 | process: council record |
| 3-10 | Select the replacement using its actual supported provider-instance identifier. | §8.4 | — | guide §1 | Guide §1 (Models): the recovery rule covers this. |
| 3-11 | Stop or cancel superseded work before reassigning it. | §8.4 | — | guide §1 | Guide §1 (Models): the recovery rule covers this. |
| 3-11b | Confirm no superseded delegate still owns overlapping edits before handing them off. | §8.4 | — | guide §1 | Guide §1 (Models): the recovery rule covers this. |
| 3-12 | Give a replacement a complete standalone handoff. | §8.4, §16 | IN-0 | §16 | process: council record |
| 3-13 | Preserve partial work on replacement. | §8.4 | — | guide §1 | Guide §1 (Models): the recovery rule covers this. |
| 3-13b | Require the replacement to inspect partial work and finish the outstanding assignment. | §8.4 | — | guide §1 | Guide §1 (Models): the recovery rule covers this. |
| 3-14 | Require the replacement reviewer to review the entire frozen plan and submit all eight scores. | §16 | — | §16 | process: council record |
| 3-15 | Preserve partial review findings as evidence. | §16 | — | §16 | exclusion: Interrupted reviewers returned no partial findings or scores to preserve or combine; replacements reviewed the frozen input from scratch. |
| 3-15b | Never combine different reviewers’ partial scores into a completed review. | §16 | — | §16 | exclusion: Interrupted reviewers returned no partial findings or scores to preserve or combine; replacements reviewed the frozen input from scratch. |
| 3-16 | Do not give an incomplete review a final score. | §16 | — | §16 | process: council record |
| 3-17 | Continue unaffected work during a provider interruption. | §8.4, §16 | — | §16 | process: council record |
| 3-18 | Do not resend work to an instance known to be exhausted. | §8.4, §16 | — | §16 | process: council record |
| 3-19 | Do not assume histories are shared between provider profiles. | §16 | — | §16 | process: council record |
| 3-20 | Use a fresh task with the checkpoint when native continuation is unavailable. | §8.4, §16 | — | §16 | process: council record |
| 3-21 | Use only an exposed continuation mechanism when the coordinator is blocked. | §8.4, §16 | — | guide §1 | Guide §1 (Models): the rule for a blocked coordinator covers this. |
| 3-21b | Do not claim the coordinator can switch autonomously after losing inference access. | §8.4, §16 | — | guide §1 | Guide §1 (Models): the rule for a blocked coordinator covers this. |
| 3-22 | Give the smallest exact human action if a coordinator switch requires T3 selection. | §8.4, §16 | — | guide §1 | Guide §1 (Models): the rule for a blocked coordinator covers this. |
| 3-22b | Leave durable instructions for resuming after human selection. | §8.4, §16 | — | guide §1 | Guide §1 (Models): the rule for a blocked coordinator covers this. |
| 3-23 | Do not copy credentials when moving the work. | §8.4 | — | guide §1 | Guide §1 (Models): the rule for a blocked coordinator covers this. |
| 3-23b | Do not log another session out. | §8.4 | — | guide §1 | Guide §1 (Models): the rule for a blocked coordinator covers this. |
| 3-23c | Do not modify global account directories. | §8.4 | — | guide §1 | Guide §1 (Models): the rule for a blocked coordinator covers this. |
| 3-24 | Do not invent internal switching APIs. | §8.4 | — | guide §1 | Guide §1 (Models): the rule for a blocked coordinator covers this. |
| 3-24b | Do not switch silently to new paid API billing. | §8.4 | — | guide §1 | Guide §1 (Models): the rule for a blocked coordinator covers this. |
| 3-24c | Use only the authorized subscriptions and supported routes. | §8.4, §16 | — | §16 | process: council record |
| 3-25 | Record roster changes faithfully. | §16 | — | §16 | process: council record |
| 3-26 | Do not replace completed adverse reviews or seek a more favorable score. | §16 | — | §16 | process: council record |

## §4 — Ground truth

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 4-01 | Inspect current instructions, accepted specs, source boundaries, dependencies, config, tests, CI, generators, protected records and integrations. | §2, D13 | IN-0, CTI, AP-1 | §8.1 | — |
| 4-02 | Recheck material handoff claims against current source and selected versions. | §2, §13 | IN-0, TC-1, TS-1 | VR-1, VR-2, VR-7 | — |
| 4-03 | Include every relevant app and package, including the private Console. | D2, D7, §5.4 | PL-2, TS-2 | VR-3, VR-7, VR-11 | — |
| 4-04 | Include root scripts, tests, tooling, generators and shared consumers. | D2, §5.4, §6 | TS-2, FM-3, GEN-1b | VR-7, VR-8, VR-11 | — |
| 4-05 | Recompute historical counts rather than treating them as current facts. | §2, §8.2 | IN-0, INV | §8.5 | — |
| 4-06 | Use version-matched primary documentation, release information, source and reproducible focused experiments. | §2, D4, §7.4 | TC-2, TC-4, TC-5 | VR-1, VR-2, §7.4 | — |
| 4-07 | Record exact versions and revisions. | §2, D1 | IN-0, TC-1 | VR-2, VR-7, VR-12 | — |
| 4-08 | Distinguish inspection, execution, inference and unverified claims. | §2, §14 | IN-0 | §16 | — |
| 4-09 | Assess new advice against the actual stack. | D1, §13 | PL-0, PL-1 | VR-4 | — |
| 4-10 | Confine pre-ratification feasibility trials to disposable fixtures or isolated worktrees. | §2, §16 | — | §16, E9 | process: council record |
| 4-11 | Start broad changes and authoritative cutover after council qualification. | D13, §16 | IN-0, CT-0a | §8.2 | override: The owner authorized execution after round 10 without a passing scored round. |
| 4-12 | Keep one canonical plan, evidence and decision record, and task tracker. | §10, §16 | OS-1 | §12 | — |
| 4-13 | Reuse existing records rather than constructing parallel documentation. | §10.1, §16 | OS-1 | §12 | — |
| 4-14 | Map every assignment requirement to a decision, task, verification, justified exclusion or blocker. | §15 | OS-1 | §15 | This file is the clause map; design §15 links to it. |

## §5 — Migration scope

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 5-01 | Cover all five migration responsibilities. | §1, §4.1, §5, §6, §7.1 | OS-1, Close-out | §12 | — |
| 5-02 | Choose the simplest supported approach rather than prescribing the handoff’s layout, adapters, baseline or sequence. | §13 | PL-0, PL-1 | §13, §16 | — |

## §5A — Quality policy and anti-slop

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 5A-01 | Qualify exact obtainable tool versions and the Oxlint/Oxfmt provider choice. | D1, §2 | TC-1 | VR-1, VR-2 | — |
| 5A-02 | Qualify configuration inheritance and effective scope. | D2, D6 | PL-4 | VR-4 | — |
| 5A-03 | Check optional presets and interactions with incumbent rules. | D6, §8.2 | PL-0, PL-1 | VR-4 | — |
| 5A-04 | Evaluate all eighteen handoff rules and version-specific changes. | D1, D5, §4.1, §11 | TC-2, PL-1 | VR-1, VR-4 | — |
| 5A-05 | Favor enforcement with meaningful signal. | D5, D6 | PL-1, PL-5 | VR-4, VR-13 | — |
| 5A-06 | Record each rule’s scope and diagnostic behavior. | D5, §4.1 | PL-1 | VR-1, VR-4 | — |
| 5A-07 | Record each rule’s permitted exceptions. | D5, §4.1 | PL-1, PL-5 | VR-13 | — |
| 5A-08 | Record remediation cost for each rule. | §4.1 | PL-1 | §4.1 | Design §4.1 gives the estimate for each rule; PL-1 refreshes it. |
| 5A-09 | Set each rule’s proposed severity. | D5, §4.1 | PL-1 | VR-4 | — |
| 5A-10 | Distinguish analyzer defects, genuine semantic exceptions and transitional debt. | D5, D12, §5.5 | TC-2, PL-5, CT-T | VR-1, VR-9, VR-11 | — |
| 5A-11 | Reproduce or disprove handoff defects, including the nested generic dictionary crash. | §2, D5 | TC-2, PL-3 | VR-1, VR-13 | — |
| 5A-12 | Prefer a fixed upstream release or the smallest reviewed, pinned regression-tested patch. | D1, D5, §11 | TC-2 | VR-1 | — |
| 5A-13 | Do not infer reliability from a clean source scan alone. | D5 | TC-2, PL-1 | VR-1 | — |
| 5A-14 | Do not erase useful types with any. | D5, §4.1 | PL-1, PL-3 | VR-4, VR-13 | — |
| 5A-15 | Do not disguise assertions to silence lint. | D5 | PL-5 | VR-13 | — |
| 5A-16 | Reject vacuous type predicates. | D5 | PO-1, PL-5 | VR-13 | — |
| 5A-17 | Reject meaningless safety comments. | D5 | PL-5 | VR-13 | — |
| 5A-18 | Do not conceal module mocking. | D5, §4.7 | PL-5, W-MOCK-SB, W-MOCK-ST | VR-13 | — |
| 5A-19 | Do not delete negative tests to obtain a pass. | §5.2, §8.5 | TID-1, TS-1, FP-1 | VR-7, VR-13 | — |
| 5A-20 | Do not remove necessary runtime checks. | D5, §4.2 | PL-3, PO-1 | VR-13 | — |
| 5A-21 | Protect financial representations. | D6, §4.2 | MI-1 | VR-13 | — |
| 5A-22 | Preserve property presence and absence semantics. | §4.1, §4.2 | PL-3 | VR-13 | — |
| 5A-23 | Preserve ordering through repairs. | §4.2 | GH-1, PL-3 | VR-13 | — |
| 5A-24 | Preserve callback and updater behavior. | D5, §4.4 | PL-3, PO-1 | VR-13 | — |
| 5A-25 | Preserve reflection and decoder boundaries. | D5, §4.1 | PL-3, PO-1 | VR-13 | — |
| 5A-26 | Preserve useful test isolation. | D5, §4.7 | W-MOCK-SB, W-MOCK-ST | VR-13 | — |
| 5A-27 | Judge each optional preset by value and conflicts on Core. | D6, §13 | PL-1 | VR-4 | — |
| 5A-28 | Do not require every optional preset. | D6, §13 | PL-1 | VR-4 | — |
| 5A-29 | Do not introduce large abstractions merely to satisfy style rules. | D6, §13 | PL-3, PL-4 | §8.5 | — |

## §5B — TSRS and TypeScript

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 5B-01 | Start with the specified Oxc TSRS announcement and its linked primary material. | §2, D4, §16 | — | E4, E7, E12 | process: council record |
| 5B-02 | Refresh prerelease availability, initializer behavior, backend selection and override observations. | D1, D4 | TC-1, TC-4 | VR-2 | — |
| 5B-03 | Identify the bundled engine as a typed-lint dependency only. | D4, §5.1 | TC-4 | VR-2 | — |
| 5B-04 | Keep the native whole-project compiler independent. | §5.2 | TS-1 | VR-7 | — |
| 5B-05 | Identify classic API, parser, generator and editor consumers separately. | §5.3, D11 | TS-1, GEN-1a, WF-6 | VR-5, VR-7, D11 | — |
| 5B-06 | Do not replace root classic TypeScript merely because TSRS is installed. | D1, §5.3 | TS-1 | VR-7 | — |
| 5B-07 | Qualify and implement the native TypeScript 7.1 beta upgrade or a better-supported obtainable alternative. | D1, §5.2 | TS-1, RB-1 | VR-7 | — |
| 5B-08 | Retain API tooling until a replacement demonstrates equivalent behavior. | D1, §5.3 | TS-1 | VR-5, VR-7 | — |
| 5B-09 | Update the root native alias and every applicable workspace compiler pin together. | §5.2 | TS-1 | VR-7 | — |
| 5B-10 | Check lockfile and platform binaries against declared and installed versions. | D1, D4, §5.2 | TC-1, TC-4, TS-1 | VR-2, VR-7 | — |
| 5B-11 | Update the active version policy and verifier. | §5.2 | TS-1 | VR-7 | — |
| 5B-12 | Qualify generated types and strict Next builds. | §5.2 | GEN-1a, GEN-1b, §5.2 | VR-7 | — |
| 5B-13 | Keep real negative compiler fixtures. | §5.2, §5.4 | TS-1, TS-2 | VR-7, VR-11 | — |
| 5B-14 | Prove editor and parser compatibility. | §5.3, D11 | TS-1, WF-6 | VR-5, VR-7, D11 | — |
| 5B-15 | Include compiler and backend changes in cache policy. | D3, §7.3 | WF-4 | VR-6 | — |
| 5B-16 | Prove the backend actually executed from each relevant working directory. | D4 | TC-4 | VR-2 | — |
| 5B-17 | Prove actual backend execution in each relevant native or T3 harness. | D4, D11 | TC-4, WF-7 | VR-2, VR-10 | WF-7 runs the public typed runner with the VR-2 comparison in each harness. |
| 5B-18 | Do not accept package presence, config contents or an absolute launcher path as identity evidence. | D4 | TC-4 | VR-2 | — |
| 5B-19 | Recheck OXLINT_TSGOLINT_PATH and whether initialization adds or prefers a competing backend. | D1, D4 | TC-1, TC-4 | VR-2 | — |
| 5B-20 | Compare raw diagnostic multisets and actual file coverage against tsgolint. | §7.4 | TC-5 | §7.4 | — |
| 5B-21 | Compare safe-fix patches and reliability against the reference. | §7.4 | TC-5 | §7.4 | — |
| 5B-22 | Measure elapsed time and memory across backends. | D4, §7.4 | TC-5, PF-1 | §7.4 | — |
| 5B-23 | Compare fast and reference modes, with semantic reporting off and on. | D4, §7.4 | TC-5 | §7.4 | — |
| 5B-24 | Vary file order and worker count on a frozen corpus. | §7.4 | TC-5 | §7.4 | — |
| 5B-25 | Investigate compiler-version-dependent differences. | §7.4 | TC-5 | §7.4 | — |
| 5B-26 | Measure Core’s end-to-end workflow; do not present upstream benchmarks as local results. | §7.4 | PF-1 | §7.4 | — |
| 5B-27 | Retain independent project-wide typechecks. | §5.2, §5.4 | TS-1, TS-2, CT-T | VR-7, VR-11 | — |
| 5B-28 | Do not equate typed lint with coverage of ignored files, all projects or global failures. | D2, §5.4 | TS-2 | VR-11 | — |
| 5B-29 | Inventory every authored TypeScript scope, including root configuration, scripts, central tests and tooling. | §5.4 | TS-2 | VR-11 | — |
| 5B-30 | Classify compiler programs, justified lint-only contexts, generated outputs and intentional negative fixtures. | §5.4, §5.5 | TS-2, CT-T | VR-11 | — |
| 5B-31 | Connect qualified programs to real commands and CI instead of merely adding tsconfigs. | §5.5, §7.1, §7.2 | TS-2, CT-T, WF-3 | VR-6, VR-11, VR-12 | — |
| 5B-32 | Actively pursue qualified TSRS adoption. | D1, D4, §11 | TC-1, TC-4, TC-5 | VR-2, §7.4 | — |
| 5B-32b | Resolve remediable setup, version and policy obstacles. | D1, D4, §11 | TC-1, TC-4, TC-5 | VR-2, §7.4 | — |
| 5B-33 | For a persistent material blocker, document cause, coverage and attempted fixes. | §11 | FB-1, RB-1, Close-out | VR-2, VR-7 | — |
| 5B-34 | Provide a simple pinned fallback for each blocked upgrade. | D4, §11 | FB-1, RB-1 | VR-2, VR-7 | — |
| 5B-35 | Continue work unaffected by a blocked upgrade. | §11 | Close-out | §12 | — |
| 5B-35b | Identify the unmet adoption goal explicitly. | §11 | Close-out | §12 | — |

## §5C — TanStack, architecture and tests

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 5C-01 | Retain both ESLint Query bridge rules unless a replacement demonstrates equivalent coverage. | D3, §4.4 | PL-2 | VR-5 | — |
| 5C-02 | Detect imported void and possibly undefined query results. | §4.4 | PL-2 | VR-5 | — |
| 5C-03 | Detect rest destructuring through typed custom-hook wrappers. | §4.4 | PL-2 | VR-5 | — |
| 5C-04 | Run meaningful passing and failing cases; direct imports alone do not establish coverage. | D3, §4.4 | PL-2, TS-2 | VR-5 | — |
| 5C-05 | Evaluate Query, Table, DB, Virtual, Store and Form against their real consumers, not a generic preset. | §4.4 | PL-0 | §4.4, §8.5 | — |
| 5C-06 | Preserve query keys and cache isolation. | §4.2, §4.4 | GH-1, RS-* | VR-5, VR-13 | — |
| 5C-07 | Preserve query invalidation and cancellation. | §4.4 | PL-0, RS-* | §4.4, §8.5 | — |
| 5C-08 | Preserve subscription behavior across the applicable TanStack consumers. | §4.4 | PL-0, RS-* | §4.4, §8.5 | — |
| 5C-09 | Preserve the shared table integration and reactive updates. | §4.4 | PL-0, PL-2, RS-* | §4.4, §8.5 | — |
| 5C-10 | Keep DB runtime identity and collection behavior consistent. | §4.4 | PL-0, RS-* | §4.4, §8.5 | — |
| 5C-11 | Keep virtualizer measurements and focus stable. | §4.4 | PL-0, RS-* | §4.4, §8.5 | — |
| 5C-12 | Keep form validation and accessibility intact. | §4.4 | PL-0, RS-* | §4.4, VR-12 | — |
| 5C-13 | Maintain architectural and import restrictions. | §4.3 | PL-2 | VR-3 | — |
| 5C-14 | Keep canonical API and CMS entry points. | §4.3 | PL-2 | VR-3, §7.2 | — |
| 5C-15 | Preserve browser/server separation. | §4.3 | PL-2, TA-1 | VR-3, VR-13 | — |
| 5C-16 | Preserve React Compiler conventions and narrowly justified framework exceptions. | D6, D7, §4.4 | PL-0, PL-2, PL-4 | VR-4 | — |
| 5C-17 | Preserve Shadcn rule intent in all applicable apps and shared packages, including the Console’s actual layout. | D12, §4.3 | TC-6, UIB-1, W-UI | VR-3, VR-4, VR-9 | — |
| 5C-18 | Verify Base UI, Maia and theme conventions. | D12 | TC-6, W-UI | VR-4, VR-6 | — |
| 5C-19 | Check patched rules, component discovery and positive and negative controls. | D12 | TC-6, W-UI | VR-4, VR-8 | — |
| 5C-20 | Keep design-system responsibilities without imposing a new adapter framework. | D12, §13 | TC-6, W-UI | VR-4 | — |
| 5C-21 | Keep meaningful Vitest and Playwright tests. | D7, §4.5, §4.7, §8.5 | PL-2, TID-1 | VR-4, VR-13 | — |
| 5C-22 | Keep diagnostic-exact compile-failure coverage. | §5.2, §5.4 | TS-1, TS-2 | VR-7, VR-11 | — |
| 5C-23 | Retain existing test frameworks despite using Bun to run packages. | D5, D7 | PL-2, PL-5 | VR-4, VR-13 | — |
| 5C-24 | Check actual missing locator-await detection. | §4.5 | PL-2 | VR-4 | — |
| 5C-25 | Exercise custom fixtures and aliases with valid counterparts. | §4.5 | PL-2 | VR-4 | — |
| 5C-26 | Check the conditional-test policy and failing exit on warnings. | D3, §4.5 | PL-2 | VR-4 | — |
| 5C-27 | Demonstrate enforcement rather than relying on plugin or preset presence. | D6, §4.5 | PL-2, PL-4 | VR-4 | — |
| 5C-28 | Keep Vitest and Playwright rules confined to their proper scopes. | D7, §4.5 | PL-2 | VR-4 | — |

## §5D — Formatters, protected content and skills

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 5D-01 | Port the skill audit hash updater. | §6 | FM-3 | VR-8 | — |
| 5D-02 | Port the upstream skill refresher. | §6 | FM-3 | VR-8 | — |
| 5D-03 | Port the managed-skill compatibility normalizer. | §6 | FM-3 | VR-8 | — |
| 5D-04 | Port the Taste preview adapter. | §6 | FM-3 | VR-8 | — |
| 5D-05 | Port the Taste charts adapter. | §6 | FM-3 | VR-8 | — |
| 5D-06 | Port the Payload import-map postprocessor. | §5.2, §6 | FM-3, GEN-1b | VR-7, VR-8 | — |
| 5D-07 | Discover and include formatter consumers beyond the original six. | §2, §6 | CTI, FM-3, GEN-1b | VR-7, VR-8 | — |
| 5D-08 | Qualify actual output and failures of each replacement consumer. | D8, §6 | FM-2, FM-3 | VR-8 | — |
| 5D-09 | Keep publication atomic, including interruption and missing-tool failures. | §6 | FM-3 | VR-8 | — |
| 5D-10 | Preserve symlink handling. | §6 | FM-3 | VR-8 | — |
| 5D-11 | Keep generated files with their canonical producer. | D8, §6 | FM-3, GEN-1b | VR-7, VR-8 | — |
| 5D-12 | Keep nested fence fixes and formatting in the correct order. | §6 | FM-3 | VR-8 | — |
| 5D-13 | Run each reviewed transformation exactly once. | §6 | FM-3 | VR-8 | — |
| 5D-14 | Keep canonical and installed inventories consistent. | §6 | FM-3, WF-5 | VR-8 | — |
| 5D-15 | Separate trusted product formatting from imported content handling. | D8, §6 | FM-2 | VR-8 | — |
| 5D-16 | Probe plugin, Tailwind and config discovery for execution of source-local settings. | D8 | FM-1, FM-2 | VR-8 | — |
| 5D-17 | Preserve protected bytes. | D8, D9 | FM-1, VM-1 | VR-8 | — |
| 5D-18 | Preserve reviewed transformations, provenance and distinct raw and adapted hashes. | D8, D9, §6 | FM-3, SD-1, AP-1 | VR-8 | — |
| 5D-19 | Do not rehash unexplained transformations. | D9, §6 | FM-3, AP-1, VM-1 | VR-8 | — |
| 5D-20 | Update canonical skills through the established sync owners. | D11, §6, §8.3 | WF-5, FM-3 | VR-8, §12 | — |
| 5D-21 | Keep generated mirrors and audit records in sync. | §6, §8.3 | FM-3, WF-5 | VR-8 | — |
| 5D-22 | Prove formatting and lint fixes converge. | D10, §8.3 | FIX-1, M1, VM-1 | VR-8, VR-9 | — |
| 5D-23 | Keep mechanical formatting separate from semantic repairs. | §8.2, §8.3 | CT-0a, CT-0b, M1, RS-* | VR-8, §8.5 | — |
| 5D-24 | Review order-sensitive changes. | D8, §4.2 | PL-3, GH-1 | VR-8, VR-13 | — |
| 5D-25 | Distinguish retiring direct formatter ownership from allowed transitive dependencies. | D1, §12 | CT-0a, Close-out | §12, VR-12 | — |

## §5E — Daily workflows, caches and CI

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 5E-01 | Verify each native harness separately from its T3 integration. | D11 | WF-2, WF-7 | VR-10 | — |
| 5E-02 | Record actual settings, active profile and checkout or worktree context. | D11 | WF-7 | VR-10 | — |
| 5E-03 | Prove the edit hook runs exactly once. | D11 | WF-2, WF-7 | VR-10 | — |
| 5E-04 | Observe useful diagnostics reaching the model; do not infer delivery from a nonzero exit. | D11 | WF-7 | VR-10 | — |
| 5E-05 | Confirm meaningful editor feedback. | D11 | WF-6 | D11, §12 | — |
| 5E-06 | Provide explicit checks where automatic feedback is unsupported. | D11, §7.1 | WF-5, WF-7 | VR-10 | — |
| 5E-07 | Keep routine edit feedback fast and reserve full typed and project checks for the proper gates. | D3, D11, §7.4 | WF-2, WF-3, PF-1 | VR-10, VR-12, PF-1 | — |
| 5E-08 | Do not reinstall from the network on routine edits. | D11 | WF-2 | VR-10 | — |
| 5E-09 | Do not start nested autonomous repair loops from normal hooks. | D10, D11 | WF-2 | VR-10 | — |
| 5E-10 | Preserve partial staging without including unrelated working-tree changes. | D10 | PC-1, WF-1 | VR-9 | — |
| 5E-11 | Exercise partially staged and renamed files. | D10, D12 | PC-1, WF-1 | VR-9 | — |
| 5E-12 | Exercise deletions, empty input and failure paths. | D10 | PC-1, WF-1 | VR-9 | — |
| 5E-13 | Verify dependency-aware invalidation for imported types. | §7.3 | WF-4 | VR-6 | — |
| 5E-14 | Verify invalidation or uncached execution for compiler, backend and config changes. | D3, §7.1, §7.3 | WF-4 | VR-6 | — |
| 5E-15 | Verify that a rule-plugin or patch change reaches affected consumers. | D3, §7.1, §7.3 | WF-3, WF-4 | VR-6 | VR-6 has a separate case for the lockfile, a lint-plugin patch and component discovery. |
| 5E-15b | Verify that a lockfile-only change invalidates affected checks. | D3, §7.1, §7.3 | WF-3, WF-4 | VR-6 | VR-6 has a separate case for the lockfile, a lint-plugin patch and component discovery. |
| 5E-16 | Verify component-discovery changes reach unchanged consumers. | D12, §7.1 | WF-4, W-UI | VR-4, VR-6 | VR-6 has a separate case for the lockfile, a lint-plugin patch and component discovery. |
| 5E-16b | Verify theme-discovery changes reach unchanged consumers. | D12, §7.1 | WF-4 | VR-6 | — |
| 5E-17 | Cover root-level and generated consumers, not just workspace filters. | §5.2, §7.1, §7.3 | TS-1, WF-4 | VR-6, VR-7 | — |
| 5E-18 | Keep lint, formatting, typechecks, real tests, integrity checks and required CI together in the quality workflow. | D3, §7.1, §7.2 | WF-3, Close-out | VR-6, VR-12 | — |
| 5E-19 | Do not replace the aggregate gates with one Ultracite invocation. | §7.1, §8.1 | WF-3 | VR-12 | — |
| 5E-20 | Assign temporary baseline ownership and enforce no growth. | D12, §5.5, §8.4 | UIB-1, TS-2 | VR-9, VR-11 | — |
| 5E-21 | Give each baseline an explicit retirement task. | D12, §5.5 | W-UI, CT-T | §12 | — |
| 5E-22 | Handle simultaneous worktrees and hooks safely. | D10, D12, §8.4 | FIX-1, PC-1, WF-1 | VR-9 | — |
| 5E-23 | Never treat crashes or setup errors as passing baselines. | D3, §5.4 | TC-3, TS-2 | VR-4, VR-11 | — |
| 5E-24 | Resolve ordinary violations and retire migration debt at completion. | §1, §12 | SW-1, CT-1, CT-T, W-UI | VR-12 | — |
| 5E-25 | Require a concrete semantic justification for each narrow permanent exception. | D5, D6 | PL-4, PL-5, RS-* | VR-4, VR-13 | — |

## §6 — Planning rounds and scoring

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 6-01 | Have each investigator examine the assignment, handoff, repository and primary sources before seeing other reviewers’ conclusions. | §16 | — | §16 | process: council record |
| 6-02 | Return findings and evidence with stated confidence. | §16 | — | §16 | process: council record |
| 6-03 | Return disagreements, alternatives and unresolved questions. | §16 | — | §16 | process: council record |
| 6-04 | Have the coordinator verify material claims using code, documentation and focused experiments. | §0a, §2, §16 | — | §16 | process: council record |
| 6-05 | Record accepted, rejected and unresolved findings with reasons. | §0a, §13, §16 | — | §16 | process: council record |
| 6-06 | Investigate credible minority objections rather than deciding by majority. | D4, §16 | — | §16 | process: council record |
| 6-07 | Revise the dependency-ordered plan and decision record. | §8.2, §16 | — | §16 | process: council record |
| 6-08 | Explain substantive departures from the handoff. | §13, §16 | — | §16 | process: council record |
| 6-09 | Freeze an identifiable plan and evidence snapshot for review. | §16 | — | §16 | process: council record |
| 6-10 | Have all three reviewers assess the same complete version on all dimensions. | §16 | — | §16 | process: council record |
| 6-11 | Resolve concrete findings and test disputed assumptions before revising. | §0a, §2, §16 | — | §16 | process: council record |
| 6-12 | Request a new independent review after substantive improvements. | §16 | — | §16 | process: council record |
| 6-13 | Start a fresh delegated task for every independent review or recheck; continuation is not independence. | §16 | — | §16 | process: council record |
| 6-14 | Supply frozen materials and material risks without prior numeric scores. | §16 | — | §16 | process: council record |
| 6-15 | Record passage and begin implementation only after the latest full round satisfies average and hard gates. | §16 | IN-0 | §16 | override: No round passed both gates; the owner ratified after round 10 without scoring v10. |
| 6-16 | Continue improving while actionable defects remain. | §0a, §0c, §16 | — | §16 | process: council record |
| 6-17 | Do not stop at an arbitrary round count. | §16 | — | §16 | override: The owner explicitly ended scored review at round 10; the subsequent checks were unscored. |
| 6-18 | Do not inflate scores or resubmit an unchanged plan to obtain a favorable draw. | §16 | — | §16 | process: council record |
| 6-19 | Report unavailable evidence or a genuine external decision as a blocker. | §14, §16 | Close-out | §12 | — |
| 6-20 | Use the same predeclared 0–10 rubric for every reviewer and dimension. | §16 | — | §16 | process: council record |
| 6-21 | Score whether adoption, upgrade, enforcement, cleanup and integrations cover the owner’s intent. | §16 | — | §16 | process: council record |
| 6-22 | Score repository fit using current facts, primary sources for the selected versions and reproducible evidence. | §16 | — | §16 | process: council record |
| 6-23 | Score how consistently the plan separates tool responsibilities, handles compatibility and covers the transition. | §16 | — | §16 | process: council record |
| 6-24 | Score protection of product semantics, safety, regression tests, controlled content and provenance. | §16 | — | §16 | process: council record |
| 6-25 | Score whether tasks have clear dependencies, owners, manageable batches, cleanup and rollback. | §16 | — | §16 | process: council record |
| 6-26 | Score whether passing and failing controls address real risks with objective completion criteria. | §16 | — | §16 | process: council record |
| 6-27 | Score simplicity: avoid redundant machinery, conflicting sources, broad exceptions and ongoing maintenance costs. | §16 | — | §16 | process: council record |
| 6-28 | Score operational reliability across harnesses, hooks, editors, staging, concurrency, caches, performance and CI. | §16 | — | §16 | process: council record |
| 6-29 | Use the original bands: 0–4 unsound, 5–6 redesign, 7–8 important gaps, 9 limited weaknesses, and 9.2+ ready only without material defects. | §16 | — | §16 | process: council record |
| 6-29b | Treat ten as no known substantive improvement, not a guarantee of perfection. | §16 | — | §16 | process: council record |
| 6-30 | Give evidence-based reasons and necessary improvements for each score. | §16 | — | §16 | process: council record |
| 6-31 | Put findings before scores. | §16 | — | §16 | process: council record |
| 6-32 | Compute the arithmetic mean of all 24 equally weighted scores. | §16 | — | §16 | process: council record |
| 6-33 | Show each reviewer’s eight scores and the overall round mean. | §16 | — | §16 | process: council record |
| 6-33b | Publish the mean across reviewers for each dimension in every scored round. | §16 | — | §16 | Design §16 gives the mean of each dimension for rounds 2 to 9 and for round 10. |
| 6-34 | Apply 9.2 to the unrounded overall mean. | §16 | — | §16 | process: council record |
| 6-34b | Do not treat 9.2 as a minimum for each dimension. | §16 | — | §16 | process: council record |
| 6-35 | Never omit difficult dimensions. | §16 | — | §16 | process: council record |
| 6-35b | Do not change the weights after seeing scores. | §16 | — | §16 | process: council record |
| 6-35c | Do not drop unfavorable scores. | §16 | — | §16 | process: council record |
| 6-36 | Do not average scores from different plan versions. | §16 | — | §16 | process: council record |
| 6-36b | Do not invent ratings to complete a review. | §16 | — | §16 | process: council record |
| 6-37 | Complete a replacement review before relying on a round with missing scores. | §16 | — | §16 | process: council record |
| 6-38 | Treat material safety or correctness defects as hard gates regardless of mean. | §16 | — | §16 | process: council record |
| 6-39 | Treat missing mandatory scope, unsupported critical compatibility or an unexecutable critical path as hard gates. | §16 | — | §16 | process: council record |
| 6-40 | Separate feasibility evidence from post-implementation tests; do not require a finished migration for planning approval. | §1, §14, §16 | — | §16 | process: council record |
| 6-41 | Treat scores as readiness judgments, not probabilities or proof. | §1, §16 | — | §16 | process: council record |
| 6-42 | Execute once authorized instead of polishing the plan cosmetically. | D13, §16 | IN-0 | §8.2 | — |

## §7 — Ratified plan contents

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 7-01 | Keep the plan usable, with sufficient operational detail for implementation. | §7.1, §8.2, §10 | OS-1 | §16 | — |
| 7-02 | Document current ground truth. | §2 | IN-0 | §8.1 | — |
| 7-03 | State the chosen architecture and substantive decisions. | D1, D2, D3, D4 | OS-1 | §16 | — |
| 7-04 | State the exact qualified tool versions. | D1, §5.2 | TC-1, TS-1 | VR-2, VR-7 | — |
| 7-05 | Identify all affected files and workflows. | D2, §8.1 | CTI, INV | §8.1, VR-8 | — |
| 7-06 | Supply a rule-by-rule policy and justified exceptions. | D5, D6, §4.1 | PL-0, PL-1, PL-4 | VR-1, VR-4 | — |
| 7-07 | Link requirements to their implementation and verification. | §15 | OS-1 | §15 | This file is the clause map; design §15 links to it. |
| 7-08 | State dependencies, owners and integration order. | §8.2, §8.4 | IN-0, IN-1 | §8.5 | — |
| 7-09 | Describe transition, temporary compatibility and retirement of migration machinery. | D12, §5.5, §8.2 | CT-0a, CT-1, CT-T, W-UI | §12 | — |
| 7-10 | State the final authoritative commands. | D3, §7.1 | WF-3, WF-5 | VR-12 | — |
| 7-11 | Give compiler and backend qualification results. | §2, D4, §5.2 | TC-4, TC-5, TS-1 | VR-2, VR-7, §7.4 | — |
| 7-12 | Specify behavior-preservation checks and CI acceptance. | §4.2, §7.2, §8.5 | FP-1, WF-3 | VR-12, VR-13 | — |
| 7-13 | Specify rollback and ongoing maintenance. | §11 | FB-1, RB-1 | VR-2, VR-7 | — |
| 7-14 | Record adopted, rejected and deferred handoff recommendations. | §13 | Close-out | §12 | — |
| 7-15 | Record genuine uncertainties. | §14 | IN-0, Close-out | §16, §12 | — |
| 7-16 | Include the actual final council score table. | §16 | Close-out | §16 | — |
| 7-17 | Use stable task identifiers throughout delegation, recovery, integration and review. | §10 | OS-1, IN-1 | §10, §12 | — |

## §8 — Parallel implementation

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 8-01 | Proceed without another general implementation approval. | D13, §16 | IN-0 | §8.2 | — |
| 8-02 | Use qualified delegates only where genuinely useful and bound concurrency by resources and independence. | D4, §8.4 | RS-*, IN-1 | §8.5, PF-1 | — |
| 8-03 | Use the applicable model, effort and fallback policy for implementation and final reviewers. | §8.4, §16 | IN-1, Close-out | §12, §16 | override: An explicit later model mix governs non-council work; historical council efforts remain as recorded. |
| 8-04 | Assign disjoint responsibilities and explicit acceptance criteria. | §8.4, §8.5 | INV, RS-* | §8.5 | — |
| 8-05 | Isolate parallel work in suitable worktrees. | §8.4 | RS-*, IN-1 | §8.5 | — |
| 8-06 | Give each implementer the ratified version, source context, dependencies, allowed scope and verification obligations. | §8.2, §8.4, §8.5 | INV, RS-* | §8.5 | — |
| 8-07 | Keep lockfiles, root configuration, baselines, broad formatting and final integration under explicit single ownership. | D12, §8.4 | IN-1, M1 | §8.3, VR-9 | — |
| 8-08 | Prohibit overlapping edits and concurrent repository-wide fixers. | D10, §8.4 | FIX-1, M1 | VR-9 | — |
| 8-09 | Limit parallel agents using native checker worker counts and actual resource limits. | D4, §7.4, §8.4 | TC-3, PF-1 | PF-1 | — |
| 8-10 | Integrate in dependency order. | §8.2 | IN-1 | §8.2 | — |
| 8-11 | Separate mechanical, configuration and semantic changes into reviewable batches. | §8.2, §8.3 | TS-1, CT-0a, CT-0b, M1, RS-* | VR-8, §8.5 | — |
| 8-12 | Keep compiler and backend changes independently diagnosable and reversible. | D4, §5.2, §11 | RB-1, FB-1 | VR-2, VR-7 | — |
| 8-13 | Track planned, active, implemented, integrated, verified and blocked tasks with evidence. | §10 | OS-1, IN-1 | §10 | — |
| 8-14 | Do not mark a task verified on delegate testimony alone. | §10 | IN-1, Close-out | §8.5, VR-12 | — |
| 8-15 | Record material implementation discoveries and update affected decisions and tasks. | §8.1 | OS-1, IN-0 | §8.1 | — |
| 8-16 | Get focused independent review before affected work continues. | §8.1 | IN-0 | §8.1 | — |
| 8-17 | Reopen full scoring only if a change materially invalidates the ratified plan. | §8.1, §16 | IN-0 | §8.1 | — |
| 8-18 | Do not drift from decisions or repeat settled research without cause. | §8.1, §13 | IN-0 | §8.1 | — |
| 8-19 | Fix confirmed migration regressions without changing working behavior. | §4.2, §8.5 | RS-*, IN-1 | VR-12, VR-13 | — |
| 8-19b | Rerun verification on the affected paths. | §4.2, §8.5 | RS-*, IN-1 | VR-12, VR-13 | — |
| 8-20 | Continue until done or a specific external blocker remains. | §11, §12 | Close-out | VR-12 | — |
| 8-21 | Do not declare success with ordinary lint debt, incomplete integration or unreviewed suppression. | §1, §12 | SW-1, CT-1, CT-T, W-UI, Close-out | VR-12 | — |

## §9 — Integrated acceptance

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 9-01 | Test the actual final revision after a fresh frozen dependency installation. | §9, §12 | Close-out | VR-12 | — |
| 9-02 | Bypass caches for required acceptance checks where practical. | §7.3, §9 | Close-out | VR-12 | — |
| 9-03 | Record exact commands, revision, environment, scope and results. | §9 | Close-out | VR-12 | — |
| 9-04 | Demonstrate complete intended Ultracite, Oxlint and Oxfmt coverage. | D2, D3, D8 | CT-1, FM-1, Close-out | VR-4, VR-8, VR-12 | — |
| 9-05 | Prove TSRS ran, or explicitly identify the unresolved blocker and pinned fallback. | D4, §11 | TC-4, FB-1, Close-out | VR-2 | — |
| 9-06 | Prove compiler upgrade and retained API/editor compatibility across projects, generators, builds and negative fixtures. | §5.2, §5.3, D11 | TS-1, GEN-1a, GEN-1b, WF-6 | VR-5, VR-7, D11 | — |
| 9-07 | Show anti-slop, Query, Shadcn, architecture and other protections catch actual failures without evasions. | D5, D12, §4.3, §4.4 | PL-2, PL-5, W-UI | VR-1, VR-3, VR-4, VR-5, VR-13 | — |
| 9-08 | Demonstrate formatter consumers, protected content and provenance. | D8, D9, §6 | FM-3, SD-1, AP-1 | VR-8 | — |
| 9-09 | Demonstrate staging, worktree isolation, caches and actual integrations. | D10, D11, §7.3 | WF-1, WF-4, WF-6, WF-7 | VR-6, VR-9, VR-10 | — |
| 9-10 | Pass all required lint, formatting, compiler, test, integrity and CI gates. | §8.1, §12 | Close-out | VR-12 | — |
| 9-11 | Exercise runtime or application behavior for sensitive repairs. | §4.2, §8.5 | RS-*, IN-1 | VR-12, VR-13 | — |
| 9-12 | Remove migration machinery and debt or accurately report them as unfinished. | §11, §12 | CT-1, CT-T, W-UI, Close-out | VR-12 | — |
| 9-13 | Have independent reviewers challenge the integrated changes and completion claims. | §10.3, §12 | Close-out | VR-12, §12 | — |
| 9-14 | Fix valid findings in the integrated changes. | §8.1, §12 | IN-1, Close-out | VR-12 | — |
| 9-14b | Rerun affected verification after corrections. | §8.1, §12 | IN-1, Close-out | VR-12 | — |
| 9-15 | Do not substitute the planning score for final acceptance checks. | §1, §12, §16 | Close-out | VR-12 | — |
| 9-16 | Use the normal branch and PR process. | §8.1, §8.2 | IN-0, Close-out | VR-12, §12 | — |
| 9-17 | Include council results and evidence in the reviewable delivery. | §10.3, §16 | OS-1, Close-out | §12 | — |
| 9-18 | Honor required approvals and release boundaries. | D13, §8.1 | RS-PACK, Close-out | §12 | — |

## §10 — Final handoff

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| 10-01 | Deliver a short, practical final explanation. | §10.3 | Close-out | §12 | — |
| 10-02 | Link the final handoff directly to the detailed plan and evidence. | §10.3 | Close-out | §12 | Close-out links the handoff to the design and the evidence. |
| 10-03 | Explain the implementation, rationale and exact tool, compiler and backend versions. | D1, §10.3 | Close-out | VR-12, §12 | — |
| 10-04 | Report actual council models, efforts, substitutions, rounds and final scores. | §10.3, §16 | Close-out | §16 | — |
| 10-05 | Identify retained, changed, rejected and deferred handoff recommendations. | §13 | Close-out | §10.3 | — |
| 10-06 | State what was demonstrated, passed or remains unverified. | §10.3, §14 | Close-out | VR-12 | — |
| 10-07 | Give daily commands and the native, T3 and editor workflows. | D11, §7.1 | WF-5, WF-6, WF-7, Close-out | VR-10, §10.3 | — |
| 10-08 | Identify any blocker, unfinished goal, fallback or manual step precisely. | §11, §14 | Close-out | §12 | — |
| 10-09 | Confirm the source attachment was not modified. | §10.3 | Close-out | §10.3 | — |
| 10-10 | Preserve the original product and autonomous-development intent throughout delivery. | §1, §8.1 | IN-1, Close-out | §12, VR-13 | — |
| 10-11 | Deliver the simplest supported setup that meets the stated goals. | §11, §13 | PL-1, Close-out | §12, §16 | — |

## Later instruction — Later effort instruction

<!-- prettier-ignore -->
| ID | Requirement (paraphrase) | Decision | Task | Verification | Note |
|---|---|---|---|---|---|
| L-01 | Never select low reasoning effort. | §8.4, §16 | — | §16 | process: council record |
| L-02 | Use extra-high for the general Codex selection. | §8.4, §16 | — | §16 | process: council record |
| L-03 | Use extra-high for Carbon when supported. | §16 | — | §16 | exclusion: Carbon topped out at high; the owner later selected Neon at xhigh. |
| L-04 | Use maximum effort for Astra in the council. | §16 | — | §16 | process: council record |
| L-05 | Use high or extra-high for Claude Code. | §8.4, §16 | — | §16 | process: council record |

## Coverage counts

- Requirements: 389
- Mapped to a decision, a task or a verification: 375
- Mapped by an exclusion or an owner override, with the reason in the note: 10
- Process steps that were not recorded at the time: 4

An independent reviewer built this map against the plan candidate and found 31 clauses without a complete mapping.
Each was then closed in the plan or the implementation guide, except the four process steps above, which cannot be
established after the fact.
