## 1. Product and boundary specification

- [x] 1.1 Create the `mission-control-contribution-operations` OpenSpec
      change package
- [x] 1.2 Add PRD 1 documentation under
      `docs/prds/mission-control-contribution-operations/`
- [x] 1.3 Add proposed OpenSpec deltas for contribution operations boundaries,
      Mission Control surface behavior, and money-trust principles
- [x] 1.4 Validate the OpenSpec change package

## 2. Test-first core contracts

- [ ] 2.1 Add failing tests for contribution operation policy and
      reason/confirmation behavior
- [ ] 2.2 Add failing tests for `finance:manage_contributions` permission
      enforcement
- [ ] 2.3 Add failing tests for canonical contribution detail read model
- [ ] 2.4 Add failing tests for correction records and audit event creation
- [ ] 2.5 Add failing tests for Stripe refund adapter behavior and provider
      errors
- [ ] 2.6 Add failing tests for donor-visible state after correction

## 3. Data model

- [ ] 3.1 Add contribution operation audit/correction/prompt-settings migration
- [ ] 3.2 Preserve tenant isolation and keep exposed-table access safe
- [ ] 3.3 Update generated database types if required by repo workflow

## 4. Contribution operations package

- [ ] 4.1 Add `packages/api/src/admin/contribution-operations/*`
- [ ] 4.2 Implement action policy and settings resolution
- [ ] 4.3 Implement permission adapter for `finance:manage_contributions`
- [ ] 4.4 Implement canonical contribution detail read model
- [ ] 4.5 Implement correction record and audit event writers
- [ ] 4.6 Implement action executor and hook outputs for future notifications,
      tasks, and batches
- [ ] 4.7 Implement Stripe refund and replay action adapters behind the shared
      policy/audit layer

## 5. API and UI integration

- [ ] 5.1 Add thin admin contribution operations API routes
- [ ] 5.2 Delegate existing staged gift action routes to the shared action
      executor where possible
- [ ] 5.3 Wire Contribution Hub detail actions to the shared action contract
- [ ] 5.4 Wire donor CRM gift history actions to the shared action contract
- [ ] 5.5 Ensure mutations return canonical contribution detail and invalidate
      affected Contribution Hub and CRM queries
- [ ] 5.6 Ensure donor-visible read models reflect corrected truth

## 6. Verification

- [ ] 6.1 Run targeted unit tests for contribution operations
- [ ] 6.2 Run targeted admin app tests for Contribution Hub/CRM entry points
- [ ] 6.3 Run `bun run verify:data-boundary`
- [ ] 6.4 Run admin lint and typecheck
- [ ] 6.5 Run broader repo gates required before PR-ready
