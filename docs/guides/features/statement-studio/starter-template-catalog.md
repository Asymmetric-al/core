# Starter Template Catalog

Statement Studio should ship with a broad white-label starter catalog that demonstrates the product's flexibility while separating production-ready jobs from template-ready examples.

## Triggers

Use this doc when adding starter jobs, starter templates, default assignments, template readiness, or template library UI.

## Workflow Steps

1. Group starter templates by document family and owning surface.
2. Assign stable dot-separated job keys.
3. Mark each job with readiness: `production_ready`, `template_ready`, or `requires_setup`.
4. Provide safe sample data and edge-case fixtures.
5. Make templates white-label and tenant-brand-token driven.
6. Let tenants clone, brand, preview, edit, publish, and assign templates.

## Two Tracks

- Production-ready templates: jobs with real tenant-safe resolvers/routes.
- Starter/demo templates: searchable, previewable with safe sample data, cloneable, brandable, and assignable once wired.

## Greenfield Starters

- `letterhead.simple`
- `memo.simple`
- `report.simple`
- `certificate.simple`
- `statement.simple`
- `packet.cover_sheet`
- `blank.branded`
- `form.standard`

## Standard Starters

Donor:

- `donor.receipt.single`
- `donor.statement.annual_giving`
- `donor.pledge.summary`

Finance/Admin:

- `finance.report.donors`
- `finance.report.funds`
- `finance.report.missionaries`
- `finance.report.reconciliation`
- `finance.receipt.staged_gift`

Reports:

- `reports.executive_summary`
- `reports.board_packet`
- `reports.annual_report`
- `reports.custom_export`

Support/Member Care:

- `support.report.first_response`
- `support.report.resolution`
- `care.person.profile`
- `care.plan`
- `care.activity_log`
- `care.private_packet`

Missionary:

- `missionary.statement.monthly_giving`
- `missionary.support_snapshot`
- `missionary.donor_list`
- `missionary.task_list`

Events:

- `events.badge.attendee`
- `events.badge.speaker`
- `events.badge.volunteer`
- `events.registration_receipt`
- `events.ticket`
- `events.attendance_roster`
- `events.session_schedule`
- `events.rooming_list`
- `events.meal_dietary_list`

Mobilize/Tasks/Legal:

- `mobilize.candidate_packet`
- `mobilize.application`
- `mobilize.interview_packet`
- `mobilize.reference_request`
- `mobilize.vetting_checklist`
- `mobilize.onboarding_packet`
- `tasks.assigned_list`
- `sign.audit_certificate`
- `legal_compliance.waiver_release`
- `legal_compliance.consent_form`

Bookkeeping:

- `bookkeeping.deposit_batch_cover_sheet`
- `bookkeeping.donation_batch_detail`
- `bookkeeping.payout_reconciliation`
- `bookkeeping.refund_dispute_log`
- `bookkeeping.failed_pledge_attempts`
- `bookkeeping.gl_summary`
- `bookkeeping.fund_allocation_report`
- `bookkeeping.restricted_fund_rollforward`
- `bookkeeping.receipt_batch_manifest`

Leadership:

- `leadership.executive_kpi_packet`
- `leadership.board_packet`
- `leadership.ministry_impact_report`
- `leadership.fundraising_forecast`
- `leadership.campaign_performance`
- `leadership.donor_retention_lapse_report`
- `leadership.field_region_health_report`

Mission Ops:

- `mission_ops.missionary_roster`
- `mission_ops.field_roster`
- `mission_ops.church_partner_roster`
- `mission_ops.fund_report`
- `mission_ops.project_budget`
- `mission_ops.visa_travel_insurance_packet`
- `mission_ops.home_assignment_packet`

## Checklist

- [ ] Starter templates are white-label and brand-token driven.
- [ ] Templates are accessible, printable, and easy to clone/update.
- [ ] Each job has owner surface, route/entry points, context contract, scope shape, confidentiality, default eligibility, starter version, readiness, and tenant override rules.
- [ ] Sample fixtures cover normal, empty, large, and key edge cases.
- [ ] Starter library lives inside the Templates section.
