## 1. Accept the capability and decision

- [x] 1.1 Validate the issue-first, no-merge, engineering-only operator requirements.
- [x] 1.2 Promote EVE-DESIGN-0013 to canonical ADR-0032.
- [x] 1.3 Cross-link #431 from the implementation plan and operations guide.

## 2. Implement the governed GitHub operator

- [x] 2.1 Add the seven-operation allowlist with no merge operation.
- [x] 2.2 Dynamically expose the tool only to verified Asymmetric-al/core GitHub sessions.
- [x] 2.3 Implement issue, issue-derived branch, non-draft PR, labels, failed-CI rerun, PR state, and safe-fix operations.
- [x] 2.4 Keep GitHub App credentials in the trusted runtime and out of the sandbox.
- [x] 2.5 Make resource-creating operations durable-replay safe.

## 3. Enforce authority and data boundaries

- [x] 3.1 Require issue-first branches and PR issue closure metadata.
- [x] 3.2 Block business data and sensitive paths/content.
- [x] 3.3 Require approval for protected safe-fix paths.
- [x] 3.4 Require OpenSpec for product-direction implementation.
- [x] 3.5 Use non-force Git Data API ref updates and never merge.

## 4. Compose governance, policy, audit, and budget

- [x] 4.1 Gate every operation through persisted GitHub-action governance.
- [x] 4.2 Add `engineering.github_operation.write` and its dedicated hard budget.
- [x] 4.3 Audit every operation with #430's accountable bot and verified initiator.

## 5. Verify and document

- [x] 5.1 Add unit coverage for vocabulary, issue-first, business-data, protected paths, spec-first, policy, audit, and release-off behavior.
- [x] 5.2 Build the installed Eve 0.25.1 runtime with the durable dynamic tool.
- [x] 5.3 Document permissions, setup, verification, emergency response, and rollback.
- [x] 5.4 Validate and archive the OpenSpec change.
