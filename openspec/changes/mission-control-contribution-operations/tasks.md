## 1. Product and boundary specification

- [x] 1.1 Create the `mission-control-contribution-operations` OpenSpec
      change package
- [x] 1.2 Add PRD 1 documentation under
      `docs/prds/mission-control-contribution-operations/`
- [x] 1.3 Add proposed OpenSpec deltas for contribution operations boundaries,
      Mission Control surface behavior, and money-trust principles
- [x] 1.4 Validate the OpenSpec change package

## 2. Test-first core contracts

- [x] 2.1 Add failing tests for contribution operation policy and
      reason/confirmation behavior
- [x] 2.2 Add failing tests for `finance:manage_contributions` permission
      enforcement
- [x] 2.3 Add failing tests for canonical contribution detail read model
- [x] 2.4 Add failing tests for correction records and audit event creation
- [x] 2.5 Add failing tests for Stripe refund adapter behavior and provider
      errors
- [x] 2.6 Add failing tests for donor-visible state after correction

## 3. Data model

- [x] 3.1 Add contribution operation audit/correction/prompt-settings migration
- [x] 3.2 Preserve tenant isolation and keep exposed-table access safe
- [x] 3.3 Update generated database types if required by repo workflow

## 4. Contribution operations package

- [x] 4.1 Add `packages/api/src/admin/contribution-operations/*`
- [x] 4.2 Implement action policy and settings resolution
- [x] 4.3 Implement permission adapter for `finance:manage_contributions`
- [x] 4.4 Implement canonical contribution detail read model
- [x] 4.5 Implement correction record and audit event writers
- [x] 4.6 Implement action executor and hook outputs for future notifications,
      tasks, and batches
- [x] 4.7 Implement Stripe refund and replay action adapters behind the shared
      policy/audit layer

## 5. API and UI integration

- [x] 5.1 Add thin admin contribution operations API routes
- [x] 5.2 Delegate existing staged gift action routes to the shared action
      executor where possible
- [x] 5.3 Wire Contribution Hub detail actions to the shared action contract
- [x] 5.4 Wire donor CRM gift history actions to the shared action contract
- [x] 5.5 Ensure mutations return canonical contribution detail and invalidate
      affected Contribution Hub and CRM queries
- [x] 5.6 Ensure donor-visible read models reflect corrected truth

## 6. Verification

- [x] 6.1 Run targeted unit tests for contribution operations
- [x] 6.2 Run targeted admin app tests for Contribution Hub/CRM entry points
- [x] 6.3 Run `bun run verify:data-boundary`
- [x] 6.4 Run admin lint and typecheck
- [x] 6.5 Run broader repo gates required before PR-ready

## Verification notes

- Targeted PRD1 unit tests passed.
- Targeted admin app tests passed:
  `tests/unit/apps/admin/app/contributions-page.test.tsx` and
  `tests/unit/apps/admin/tanstack-surface-imports.test.ts`.
- `bun run verify:data-boundary` passed.
- `bun run lint`, `bun run typecheck`, `bun run format:check`, and
  `bun run build` passed.
- Full `bun run test:unit` was executed; all PRD1 tests passed and the only
  failing file was unrelated CMS auth strategy tests timing out in
  `tests/unit/cms/supabase-strategy.test.ts`.

## 7. PRD 2 Email Studio Donor Correction Notifications

- [x] 7.1 Add PRD 2 documentation under
      `docs/prds/mission-control-contribution-operations/`
- [x] 7.2 Add correction notification merge tag registry and tests
- [x] 7.3 Add template family/variant resolver and required-tag validation
- [x] 7.4 Add action-type notification policy and suppression reason rules
- [x] 7.5 Add contribution notification event/settings schema
- [x] 7.6 Add send-time composer through Email Studio templates and Resend
- [x] 7.7 Add missing/invalid template blocked-email audit and task bridge
- [x] 7.8 Integrate notification hook with Contribution Operations Core
- [x] 7.9 Verify targeted notification tests and relevant checks

## 8. PRD 3 Shared Mission Control Tasks And Needs Attention

- [x] 8.1 Add PRD 3 documentation under
      `docs/prds/mission-control-contribution-operations/`
- [x] 8.2 Add shared task and queue schema
- [x] 8.3 Add task creation, lifecycle, comments, reminders, and link services
- [x] 8.4 Add assignment policy for actor-only, queue-only, and both
- [x] 8.5 Add urgency rules, aging thresholds, and override audit
- [x] 8.6 Add Contribution Hub Needs Attention read model
- [x] 8.7 Integrate PRD2 notification failure task bridge with shared tasks
- [x] 8.8 Refactor/admin-wire task UI entry points to shared model
- [x] 8.9 Verify targeted task and Needs Attention tests

## 9. PRD 4 Mission Control Automation Builder

- [x] 9.1 Add PRD 4 documentation under
      `docs/prds/mission-control-contribution-operations/`
- [x] 9.2 Add declarative automation schema and permission tests
- [x] 9.3 Add `automation:manage` permission adapter
- [x] 9.4 Add preview and test-run services
- [x] 9.5 Add auto-run and review-first run models
- [x] 9.6 Add activity log schema and run item model
- [x] 9.7 Add domain adapters for contribution actions, Email Studio
      notifications, and shared tasks
- [x] 9.8 Wire Mission Control automation UI/API to persisted model
- [x] 9.9 Verify targeted automation tests and checks

## 10. PRD 5 Bulk Contribution Actions And Batch Results

- [x] 10.1 Add PRD 5 documentation under
      `docs/prds/mission-control-contribution-operations/`
- [x] 10.2 Add bulk action catalog and policy tests
- [x] 10.3 Add batch schema and result model
- [x] 10.4 Add preview planning and confirmation enforcement
- [x] 10.5 Add immediate/background execution mode selection
- [x] 10.6 Add per-record result and CSV export support
- [x] 10.7 Add important-failure task bridge
- [x] 10.8 Wire Contribution Hub bulk actions to batch API
- [x] 10.9 Verify targeted batch tests and checks
