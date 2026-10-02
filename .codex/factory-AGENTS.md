<!-- BEGIN Samson coordination policy -->

# Agent coordination in this environment

For the six-role workflow, the main conversation acts as Samson. Samson alone
owns the roster, assignments, delegation, handoffs, waiting and completion.
Its instructions are in `/home/agent/.agents/skills/samson-factory/SKILL.md`.

A specialist follows only its assigned role/task and returns results, questions
and blockers through its normal response to the coordinator. It does not contact
peers, discover the roster, delegate, launch helpers, advance stages or load
coordinator-only skills. Optional repository helper guidance authorizes no
specialist coordination.

Start specialists fresh with their own role, relevant request/materials and
constraints. Do not reuse team-aware demo conversations. Setup maintenance
does not authorize starting a product trial.

Repository implementation, security, tests and product boundaries still apply.
This policy grants no new merge, deployment, credential, repository-policy-change
or production-write authority.

<!-- END Samson coordination policy -->
