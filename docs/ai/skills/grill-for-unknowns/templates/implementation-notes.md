# Implementation Notes

## Triggers

- Use during complex implementation after the plan is confirmed when decisions,
  deviations, or newly discovered unknowns need a durable record.

## Workflow

1. Record the confirmed plan snapshot before implementation details drift.
2. Add decisions and deviations as they occur, including evidence, rationale,
   and risk.
3. Resolve, defer, or escalate each new unknown under the launch packet's
   deviation policy.
4. Record the real verification result before declaring the implementation
   complete.

## Plan Snapshot

- <short plan/date/session>

## Decisions Made

- <decision> — reason/evidence

## Deviations

- Planned: <original>
- Actual: <change>
- Why: <constraint discovered>
- Risk: <low/med/high>

## New Unknowns

- <unknown> — resolved by / deferred to / needs user

## Verification

- <command/test/manual check> — result

## Completion Checklist

- [ ] Decisions and deviations include their reason, evidence, and risk.
- [ ] Every new unknown is resolved, deferred to an owner, or escalated.
- [ ] Notes remain consistent with the confirmed plan and deviation policy.
- [ ] Verification records the command or check and its actual result.
