---
name: playwright-qa
description: QA engineering workflows on top of Playwright. Use when a QA engineer asks to design test cases from a ticket, PRD or acceptance criteria, decide what to automate, write a bug report from a failing test or trace, convert manual test cases (TestRail, Xray, CSV) into Playwright specs with case-ID traceability, or review Playwright test code and pull requests.
---

# Playwright QA Workflows

> For **QA engineers**: the work around the test code. What to test, how to report what broke, how to automate a manual suite, and how to judge a test.

**4 guides**. They build on the `core/` guides for the Playwright APIs and link to them rather than repeating them.

## Guide Index

| What you're doing | Guide |
|---|---|
| Ticket / PRD / acceptance criteria → test cases, risk ranking, test plan for the generator | [test-design.md](test-design.md) |
| Failing test → app bug, test bug or flake; bug report; what to do with the test meanwhile | [bug-reports.md](bug-reports.md) |
| Manual test cases or a CSV export → Playwright specs with case IDs | [manual-to-automated.md](manual-to-automated.md) |
| Review Playwright tests or a PR; lint rules; prove a test can fail | [test-review.md](test-review.md) |

## Golden Rules

1. **Boundaries and negative paths first**: bugs live at the edges of a rule, not in the happy path.
2. **Lowest layer that proves it**: rules at API level, wiring and critical flows in E2E.
3. **Classify before filing**: app bug, test bug, flake or environment; the trace usually decides.
4. **Frequency is a number**: `--repeat-each=20` gives N/20, never "sometimes".
5. **Known bug → `test.fail()` with an issue link**, never a deleted test or a loosened assertion.
6. **A test that can't fail guards nothing**: break the feature once and watch it fail.
7. **Keep case IDs on automated tests** so results map back to the manual suite.
