# Design

The Bun version guard is used before node_modules exists. Use the installed Bun
binary's built-in YAML parser through a fixed expression with workflow contents
on stdin; do not import a package requiring prior dependency installation or
execute workflow content. Node remains the verifier entry point.

Check each setup-bun step's own with.bun-version expression and the merged
workflow/job/step environment. Comments, block strings, unrelated inputs and
another job's environment cannot supply that step's pin. Invalid YAML and
unsupported environment shapes fail closed; valid quoted scalars and aliases
remain supported.

The live Vercel validator requires nodeVersion 24.x and treats only absent/null
bunVersion as unset. It continues to read project data without updating it.
Existing local config, branch, queue and preview checks remain in place.

The published PR keeps its history. Earlier unpublished repairs are reference
material: current source and failing regressions establish the required change.
The integration coordinator owns latest-base reconciliation, full gates and
publication. No provider or deployment setting is mutated by these verifiers.
