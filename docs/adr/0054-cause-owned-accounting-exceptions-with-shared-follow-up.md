# Cause-owned accounting exceptions with shared Mission Control follow-up

**Status:** Accepted (founder ruling, Phase 20 grill session — D13)

Phase 20 owns one source-authoritative **Accounting Exception Case** for each
contract-defined root-cause occurrence. Its versioned cause contract, exact
blocking radius, append-only evidence, and cause-specific proof determine
whether the condition exists and when it clears. Recurrence creates a linked
successor case rather than rewriting resolved history, and unrelated clean
Accounting Releases continue.

Human assignment and follow-up reuse the platform's shared Mission Control task
model. Mission Control owns queues, assignees, comments, due dates, reminders,
and follow-up status, but task completion, dismissal, suppression, or workflow
state can never clear an Accounting Exception Case or become financial truth.
The link is tenant-safe, idempotent, and outbox-reconcilable; Phase 20 does not
create a second task, comment, SLA, routing, or workflow system.

**Phase 21 D25 precision amendment (2026-08-02).** An Expense Claim Resolution
Case is not an Accounting Exception Case. D25 may link exact downstream impact
to one Phase 20 case or correction result, but only the Phase 20 cause contract
detects, contains, and clears an accounting failure. The two cases and any
shared Mission Control task retain separate identities and completion proofs;
task completion, D25 completion, or a generic comment clears neither accounting
truth nor the other case.

**Phase 24 D32 classification amendment (2026-08-28).** The Mission Control
record linked to an Accounting Exception Case is an **Independent follow-up
task** only when it names a separately testable human deliverable—such as
gathering or delivering evidence—that can truthfully finish while the case
remains open. Its **Done with my task** outcome remains task-owned and never
implies accounting resolution. A task whose imperative is the accounting or
provider source action itself instead uses source-controlled closure and has no
independent Complete transition. Both policies reuse the one shared Tasks Hub;
neither lets task status clear financial truth.

## Related decisions

- [ADR-0183 — Source-owned work projects into one shared Tasks Hub](./0183-source-owned-work-projects-into-one-shared-tasks-hub.md)
- [Phase 24 D32 adversarial review](../prds/sitestacker-parity/phase-24-d32-source-backed-task-completion-adversarial-review.md)
