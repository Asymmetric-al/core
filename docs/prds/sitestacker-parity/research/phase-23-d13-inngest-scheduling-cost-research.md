# Phase 23 D13 Inngest scheduling and CMS research

## Decision context

D13 concerns how SiteStacker should schedule future publication appointments without making Inngest the system of record, creating an unbounded number of sleeping runs, or consuming an account-wide execution allowance with frequent polling.

## Verified Inngest facts

- Inngest's [pricing](https://www.inngest.com/pricing) lists Hobby with 50,000 executions per month and Pro starting at $99 per month with 1,000,000 executions per month.
- Inngest defines usage so that [each function run and each executed step count as executions](https://www.inngest.com/pricing#faq).
- A future event `ts` [delays the start of all functions triggered by that event](https://www.inngest.com/docs/guides/delayed-functions#schedule-a-function-for-later).
- Future events can be scheduled [up to one year ahead, with seven days on the free plan](https://www.inngest.com/docs/guides/delayed-functions).
- Sleeping functions [do not consume concurrency while sleeping](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/sleeps), but a sleeping run is unnecessary for this design.

## Cost and scheduling implications

The current repository's five-minute and two-minute one-step scans imply approximately 60,480 executions per month:

- Five-minute scan: 8,640 function runs plus 8,640 steps = 17,280 executions.
- Two-minute scan: 21,600 function runs plus 21,600 steps = 43,200 executions.
- Combined: 60,480 executions per month before other account activity.

Production planning must therefore budget Inngest usage account-wide and must not assume the Hobby allowance is sufficient.

Reject these alternatives:

- A per-tenant or per-minute poller, because execution cost scales with polling frequency or tenant count rather than useful work.
- A long sleeping function run, because it duplicates durable product state in orchestration state and is unnecessary when future events can delay function start.

## Recommended scheduling architecture

1. Treat publication appointments as product-owned, immutable records. Rescheduling cancels or supersedes an appointment and creates a new immutable appointment rather than rewriting history.
2. Keep far-future appointments in the product database, which remains the source of truth.
3. Use a shared dispatch ledger to claim eligible appointments idempotently and record dispatch attempts and event identifiers.
4. Dispatch an identifier-only Inngest event with a future `ts` only when the appointment is within a horizon of at most six days. This stays inside the seven-day free scheduling window with operational margin.
5. Trigger one due function containing one durable step. The function reloads the appointment and current product state by identifier, validates that it is still actionable, and invokes the existing publication path.
6. Reuse the existing recovery mechanism for failed or missed work. If additional assurance is required, add one global overdue scan every 15 minutes. A one-step scan costs about 5,760 executions per 30-day month: 2,880 function runs plus 2,880 steps.

This design keeps long-term intent and audit history in the product, limits Inngest's role to near-term delivery, and makes execution volume predictable.

## CMS scheduling evidence

- Payload's [`schedulePublish`](https://payloadcms.com/docs/versions/drafts#scheduled-publish) schedules draft publication by mutating document status at the requested time and requires a separately running jobs queue runner.
- Sanity implements [Scheduled Drafts as single-document releases with a version document](https://www.sanity.io/docs/studio/scheduled-drafts), which supports scheduling exact content rather than a mutable latest draft.
- Contentful supports scheduled [publish and unpublish actions](https://www.contentful.com/help/scheduled-publishing/) and provides centralized views for scheduled actions.
- Storyblok places [Schedule Publishing beside Publish and provides a Scheduled Stories filter](https://www.storyblok.com/docs/manuals/content-authoring) for editorial oversight.
- The WAI-ARIA Authoring Practices [date picker dialog example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) documents accessible keyboard interaction, labeling, focus management, and live announcements for calendar selection.

The CMS evidence points to a consistent editorial contract: scheduling belongs beside the publish action, should preserve the intended content/version, and needs a centralized operational view. The date and time control must remain keyboard operable, clearly labeled, and explicit about the chosen instant and timezone.

## D13 recommendation

Adopt product-owned immutable publication appointments backed by the product database. Use a shared dispatch ledger to emit identifier-only future-`ts` events within a six-day horizon, execute one due function with one step, and rely on existing recovery plus an optional global 15-minute overdue scan. Provide scheduling beside Publish, preserve the scheduled content/version contract, expose centralized appointment status and recovery controls, and implement the picker to WAI accessibility guidance. Do not use per-tenant/minute polling or long sleeping runs, and budget Inngest executions across the production account rather than against Hobby in isolation.
