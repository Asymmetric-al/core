# Tidy Agent Instruction System Spec

## Why

Archiving `modernize-agent-instructions` and `add-inngest-agent-tools` merged
near-duplicate requirements into `agent-instruction-system`, and the Inngest
tooling requirement still assumes the repo has no product Inngest runtime,
which is no longer true.

## What Changes

- Merge `OpenSpec Is First-Class for Project Work` into
  `OpenSpec Owns Durable Project Intent`.
- Merge `Workspace Capability Layers Are Conditional` into
  `Conditional Capability Layers Stay Subordinate`.
- Reframe `Inngest Agent Tools MUST Not Imply Product Runtime Adoption` around
  the durable rule now that runtime adoption exists: tooling refreshes never
  silently expand product runtime scope; runtime behavior is governed by
  `workflow-orchestration`.

## Impact

- Affected specs: `agent-instruction-system`
- Affected code: none (documentation-only)
