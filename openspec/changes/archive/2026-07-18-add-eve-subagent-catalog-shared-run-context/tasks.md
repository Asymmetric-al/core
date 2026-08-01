## 1. OpenSpec contract

- [x] 1.1 Review the PRD, implementation-plan slice 17, issue #433, and owning upstream Eve changes.
- [x] 1.2 Validate `add-eve-subagent-catalog-shared-run-context` with strict OpenSpec validation.
- [x] 1.3 Obtain explicit human product/maintainer approval before treating this contract as implementation-ready.

## 2. Specialist catalog implementation

- [x] 2.1 Implement the initial specialist catalog as real Eve subagents.
- [x] 2.2 Give each specialist dedicated instructions, tools, routing description, and eval coverage.
- [x] 2.3 Resolve each specialist through #421 model roles and fallback policy.
- [x] 2.4 Enforce #423 budgets/rate limits and workflow-specific delegation caps.

## 3. Shared run context

- [x] 3.1 Define the versioned shared-context schema and allowed safe content categories.
- [x] 3.2 Require writer identity, provenance, confidence, risk, source evidence, and timestamps on every write.
- [x] 3.3 Reject malformed and forbidden sensitive-content writes before persistence.
- [x] 3.4 Preserve conflicts as explicit disagreements and record governed resolutions without deleting evidence.
- [x] 3.5 Keep governance metadata app-owned while #425 retains session/workflow durability.

## 4. Policy and authority

- [x] 4.1 Enforce #417 protected-area/source-of-truth rules for every delegated action.
- [x] 4.2 Enforce #418/#420 release, emergency, and kill-switch state before delegation and execution.
- [x] 4.3 Emit #419 audit records for meaningful delegation, writes, rejections, conflicts, and resolutions.
- [x] 4.4 Enforce #426 verified current-admin/service identity and user/tenant ownership for every read and write.
- [x] 4.5 Prove delegation and shared-context writes grant no new authority.

## 5. Verification

- [x] 5.1 Test specialist discovery, routing, model-role selection, tool boundaries, budgets, and eval gates.
- [x] 5.2 Test delegation caps and attempted over-cap behavior.
- [x] 5.3 Test valid writes, invalid writes, sensitive-data rejection, provenance, confidence, risk, and evidence.
- [x] 5.4 Test disagreement preservation, high-risk conflict blocking, and audited resolution.
- [x] 5.5 Test cross-user/cross-tenant access denial and rejection of prompt/model/tool-supplied identity scope.
- [x] 5.6 Keep the release switch off and complete no production activation in this slice.

## 6. Scope check

- [x] 6.1 Confirm the implementation contains the declared subagents, policy adapters, Supabase metadata schema,
      shared-context store/tool, audit trail, and eval harness required by this accepted change.
- [x] 6.2 Confirm dynamic workflow generation and failure escalation remain #434 scope.
