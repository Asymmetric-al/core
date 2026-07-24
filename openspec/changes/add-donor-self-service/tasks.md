# Tasks

## 1. Recurring self-service

- [ ] 1.1 Add one Phase 16 recurring command boundary in
      `packages/api/src/donor-portal` for amount, cadence, next date, end date,
      eligible future designation, payment method, named-occurrence skip,
      bounded/indefinite pause, resume, stop recovery, cancel, and linked-
      successor restart under fresh authorization.
- [ ] 1.2 Make every command tenant/donor owned, append-only, idempotent,
      revision-fenced, exact-term reviewed, and provider-reconciled; stable line
      identity, line-term versions, schedule epochs, and lifecycle/pause facts
      remain separate; a line change splits its cohort prospectively when
      required and never mutates sibling lines or historical facts.
- [ ] 1.3 Donor dashboard UI shows grouped recurring giving with independent
      lines, Today/Next/Then and next-three-date previews, exact charge effects,
      already-in-flight truth, and separate intent/schedule/occurrence/payment/
      ledger/control/health states, with calm pending/unknown/reconciliation
      recovery.
- [ ] 1.4 Provider-control loss accepts safe donor stop intent immediately,
      suppresses unsafe Asym work, and proof-gates provider mutation or
      replacement without falsely claiming the old executor stopped.
- [ ] 1.5 Pauses preserve suppressed occurrence evidence and the unchanged
      calendar grid; bounded resume safety is re-proved, indefinite resume needs
      an authorized command, and neither resume nor ordinary save charges
      without a separate named confirmation.
- [ ] 1.6 Reject past next dates and final eligible dates before the first
      continuing occurrence in preview and again under lock; enforce the
      inclusive boundary against both new occurrences and new retry starts.
- [ ] 1.7 Keep provider-native retry controls out of self-service; subscriptions
      own ordinary renewal execution only, and automatic provider retries are
      disabled or proved unable to overlap Phase 16 recovery commands.

## 2. Payment methods

- [ ] 2.1 Stripe-managed payment-method add/update/remove (SetupIntent or
      customer portal session); wallet page stub replaced.
- [ ] 2.2 Recurring cohorts show masked methods and can switch them safely only
      after every affected line, exact authorization scope, account/mode, and
      provider capability are revalidated; raw credentials never reach Asym.

## 3. Annual statements

- [ ] 3.1 Phase 7 supplies the exact legal-donor Statement Subject, official
      eligibility, immutable purpose-scoped Facts Package, coverage,
      exclusions, corrections, and source-approved reason codes. Phase 19
      freezes the reviewed Statement Run population, source cutoff,
      participation, recipient operation, and run identity without merging
      households or delivery destinations into legal-donor authority.
- [ ] 3.2 Phase 18 Document Production resolves and freezes one compatible
      immutable publication, creates one idempotent Generation Request, and
      produces the private canonical artifact without independently querying,
      recalculating, or reformatting source truth.
- [ ] 3.3 The donor BFF remains a thin adapter over Phase 19/18 authorization:
      it reauthorizes the recipient, Statement Subject, purpose, logical
      current head, exact artifact, and records state on every request; exposes
      only the current eligible exact PDF; and keeps view, download, local
      print, portal availability, and outbound delivery as separate facts.
- [ ] 3.4 Contribution corrections, refunds, or relinks first create
      source-owned correction/successor authority. Phase 18 then creates the
      linked successor request and exact artifact, updates the logical current
      head only after validation, and preserves the predecessor as restricted
      immutable evidence.
- [ ] 3.5 Outbound delivery uses the governed Phase 17/Phase 6 communication
      seam with the exact artifact reference. Authenticated view, download, and
      local print remain unmetered while authorized. A deliberate
      **Send another copy** uses Phase 19's bounded idempotent copy-request
      contract without creating a second send/history path.
- [ ] 3.6 The optional Support overview uses
      `giving.summary.informational@1`, remains visibly **Not a tax document**,
      and contains only source-authorized household support or disclosed DAF
      recognition. It never enters an official artifact, deductible total, or
      ordinary nonparticipant surface.
- [ ] 3.7 Before any Phase 19 donor statement artifact path becomes available,
      remove or hard-disable the live recomputed annual-statement route and
      atomically update its clients, prototype inventory, and closure tests.
      No year may expose both live-recomputed text and frozen official PDF
      truth.

## 4. Verification

- [ ] 4.1 Integration tests: self-service mutations are tenant-scoped,
      donor-owned only, append-only, idempotent, CAS-fenced, sibling-safe,
      line-term/schedule/lifecycle separated, pause-grid preserving, date-
      validated, provider-retry non-overlapping, control-quarantined when proof
      is missing, and reflected in Mission Control from the same records.
- [ ] 4.2 E2E: donor changes one line's next date, pauses and cancels recurring
      support without mutating a sibling line; updates a payment method; views,
      downloads, and locally prints the exact current official statement;
      verifies official lines and totals contain only the Phase 7-authorized
      legal-donor Statement Subject's eligible facts; sees any enabled Support
      overview as a separate **Not a tax document** artifact; deliberately
      requests one outbound copy without duplicate submission; and cannot
      access another subject's, a predecessor's, or an unauthorized artifact.
- [ ] 4.3 Archive this change after deployment verification.
