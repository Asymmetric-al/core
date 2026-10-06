# Native handoffs — coordinator only

Canonical prompts are `.codex/agents/<role>.toml` in reviewed source. Hosted
startup validates the retained sources and personal copies read-only; it does
not require active `CODEX_HOME/agents/` installation or local CLI verification.
Explicit local installation may create copies in both homes. Missing or
inconsistent required retained assets/tools are BLOCKED, without fallback repair.
Use the validated role's `developer_instructions` when the native spawning tool
does not automatically load named role files.

Start fresh (`fork_turns: "none"` in this app) with only the specialist's own role,
assignment identifier, relevant request/materials and constraints. Use its model/
reasoning effort when supported. Do not include the roster, other role prompts,
parent chat, this protocol or peer contact paths. Do not reuse team-aware demos.

Every response has DONE/BLOCKED, assignment, result, checks actually run with
outcomes/evidence, and limits/questions. DONE is task completion, not approval.
Review and final acceptance results name candidate SHA and acceptance revision.
Request missing evidence instead of inferring success.

| Role    | Result convention                                                                                               |
| ------- | --------------------------------------------------------------------------------------------------------------- |
| Ezra    | Initial criteria/checks/test paths/gaps; final PASS, FAIL or INCONCLUSIVE with criterion-to-evidence mapping    |
| Bezalel | Changes/paths, verification and remaining acceptance gaps                                                       |
| Micaiah | CLEAR, FINDINGS or INCONCLUSIVE; scope; severity/condition/consequence/location/evidence/correction             |
| Luke    | CLEAR, FINDINGS or INCONCLUSIVE; scope; severity/failure condition/interactions/consequence/evidence/correction |
| Agabus  | Each supplied finding: ACCEPT, REJECT or NEEDS_EVIDENCE; reasons and correction/check where needed              |

CLEAR is scoped absence of material findings; missing required evidence is
INCONCLUSIVE. Use finding IDs only for repairs/adjudication. Git commits,
acceptance revision IDs, paths and actual checks suffice.

Reuse only same-role, uncontaminated conversations. A native task-starting
follow-up wakes an idle agent; a plain message does not. Wait for normal results;
ignore stale assignment/candidate replies. Keep one writer active and pause edits
during review of committed candidates.

Give relevant shell commands the verified tools directory on PATH, including
commits/pushes. In this workspace it is
`/workspace/.onboarding-tools/node_modules/.bin`. Earlier shell exports do not
establish PATH in later calls or fresh specialists. Explicit installation may also provide a
persistent shell/Husky initialization snippet; hosted validation does not install it.

CLI specialist profiles disable multi-agent; native configuration limits depth
to one. Where the runtime does not load those settings, explicit role prompts
are the boundary. This is a shared workspace. Do not claim filesystem isolation,
tool removal, model access or rebuild persistence from configuration alone.

Assigned issue workers return DELIVERY_READY with the actual PR/head/base,
acceptance revision, independent review decisions, final acceptance and required
checks, then stop before merge. David owns the protected expected-head merge,
independent merge verification and the same-worker closeout handoff. Missing
required isolation for review/acceptance command execution remains INCONCLUSIVE;
shared files, hashes and role TOMLs do not establish that execution boundary.
