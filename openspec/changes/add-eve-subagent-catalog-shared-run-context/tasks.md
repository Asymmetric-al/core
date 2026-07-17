## 1. OpenSpec contract

- [ ] 1.1 Review the PRD, implementation-plan slice 17, issue #433, and owning upstream Eve changes.
- [ ] 1.2 Validate `add-eve-subagent-catalog-shared-run-context` with strict OpenSpec validation.
- [ ] 1.3 Obtain explicit human product/maintainer approval before treating this contract as implementation-ready.

## 2. Specialist catalog implementation

- [ ] 2.1 Implement the initial specialist catalog as real Eve subagents.
- [ ] 2.2 Give each specialist dedicated instructions, tools, routing description, and eval coverage.
- [ ] 2.3 Resolve each specialist through #421 model roles and fallback policy.
- [ ] 2.4 Enforce #423 budgets/rate limits and workflow-specific delegation caps.

## 3. Shared run context

- [ ] 3.1 Define the versioned shared-context schema and allowed safe content categories.
- [ ] 3.2 Require writer identity, provenance, confidence, risk, source evidence, and timestamps on every write.
- [ ] 3.3 Reject malformed and forbidden sensitive-content writes before persistence.
- [ ] 3.4 Preserve conflicts as explicit disagreements and record governed resolutions without deleting evidence.
- [ ] 3.5 Keep governance metadata app-owned while #425 retains session/workflow durability.

## 4. Policy and authority

- [ ] 4.1 Enforce #417 protected-area/source-of-truth rules for every delegated action.
- [ ] 4.2 Enforce #418/#420 release, emergency, and kill-switch state before delegation and execution.
- [ ] 4.3 Emit #419 audit records for meaningful delegation, writes, rejections, conflicts, and resolutions.
- [ ] 4.4 Enforce #426 verified current-admin/service identity and user/tenant ownership for every read and write.
- [ ] 4.5 Prove delegation and shared-context writes grant no new authority.

## 5. Verification

- [ ] 5.1 Test specialist discovery, routing, model-role selection, tool boundaries, budgets, and eval gates.
- [ ] 5.2 Test delegation caps and attempted over-cap behavior.
- [ ] 5.3 Test valid writes, invalid writes, sensitive-data rejection, provenance, confidence, risk, and evidence.
- [ ] 5.4 Test disagreement preservation, high-risk conflict blocking, and audited resolution.
- [ ] 5.5 Test cross-user/cross-tenant access denial and rejection of prompt/model/tool-supplied identity scope.
- [ ] 5.6 Keep the release switch off and complete no production activation in this slice.

## 6. Scope check

- [ ] 6.1 Confirm no live subagents, runtime code, Supabase schema, shared-context store, tools, or eval harness are included in this spec-only PR.
- [ ] 6.2 Confirm dynamic workflow generation and failure escalation remain #434 scope.
