# 02: Inngest runtime endpoint and dispatch adapter smoke

Status: ready-for-agent
Type: AFK

## Parent

.scratch/inngest-durable-workflow-executor/PRD.md

## What to build

Add the smallest runtime integration that proves this repo can serve Inngest
functions through the correct server-side boundary and dispatch a safe no-op
workflow event. This slice should not move donation, Resend, or Support Hub work
yet.

## Acceptance criteria

- [ ] Runtime setup follows the approved OpenSpec scope and current Inngest
      guidance.
- [ ] The app route surface remains thin, with workflow setup and business
      behavior owned by shared server-side modules.
- [ ] A no-op or smoke workflow accepts only a safe tenant-scoped event envelope
      and produces no business side effects.
- [ ] Local development instructions explain how to run the app and Inngest dev
      server without exposing secrets.
- [ ] Tests or a documented smoke command prove the function endpoint can be
      discovered and the no-op workflow can run locally.
- [ ] No product workflow behavior is moved in this slice.

## Blocked by

- .scratch/inngest-durable-workflow-executor/issues/01-openspec-runtime-scope.md
