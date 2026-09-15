# Q24: Reusable shortcuts for Support actions

**Historical Q24 evidence: the founder selected and fully ratified C and all D24 amendments on 12 September 2026.** Earlier unanswered/recommendation/no-ADR language below records the question stage only. [Complete ratified D24](phase26-d24-adversarial-review.md) and [Email Studio seam](phase26-d24-email-studio-integration.md) govern current acceptance.

**Q24 is unanswered. D1–D23 and every adopted amendment are fully founder-ratified.** This is the next researched product decision, not a new accepted action vocabulary or implementation plan.

## The decision

What reusable shortcuts should staff have for repeated Support actions beyond the individual controls, saved reply wording and Send-and-work choices already accepted?

An illustrative example, not observed tenant usage: Maya repeatedly applies the same two existing Support labels and assigns a conversation to an eligible colleague. A maintained shortcut could prepare those three changes for one clear review and Apply. It would not insert a reply, add a note, send mail or alter CRM/giving records. Whether this combination occurs often enough in a particular tenant is still an assumption, not a measured fact.

| Option                                     | What staff can do                                                                                                                                                                | Main benefit                                                                               | Tradeoff                                                                                                               |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **A — Curated Support action shortcuts**   | Choose a maintained shared combination of existing Support actions, review its exact current changes, then deliberately Apply. Reply text and sending remain separate.           | Reduces repeated organization/triage work while keeping effects easy to understand.        | Adds a small curated collection and a guarded combined-operation surface; staff still choose saved wording separately. |
| **B — Existing actions and saved replies** | Use existing labels, assignment and status controls, D18 My/Shared replies, and D4 Send-and-work. No action-shortcut library.                                                    | The simplest complete product, with the least maintenance.                                 | Repeated combinations require repeated selections and depend on staff remembering each step.                           |
| **C — Curated reply-and-work shortcuts**   | Prepare eligible saved wording and intended Support changes without changing live work; then review and explicitly Send and apply through one guarded reply-admission operation. | Saves the most repetition when the same response and follow-through routinely go together. | Adds more draft, audience, wording-version, action-conflict and delivery-recovery complexity.                          |

These are alternative scopes, not three modes to implement. All preserve My replies and the curated shared wording library already accepted. No option automatically adds personal action recipes, bulk messages, AI, arbitrary external actions or a workflow/rules designer.

## Single recommendation: A

Recommend **curated Support action shortcuts**. The existing D18 library already helps staff write, while D4 already combines sending with an explicit work-state choice. A adds reuse for repeated local Support actions without making wording insertion perform work or expanding the composer into a general operation builder.

B is the strongest simpler alternative. If action combinations are rare, it may be the better experience; existing code or competitor feature lists cannot prove a new library is necessary. A earns its place through useful maintained combinations rather than seeding dozens of one-action shortcuts that duplicate visible controls. No claimed number of clicks saved, time saved or ministry adoption rate has been measured.

C is a genuine modern alternative, not an unsafe strawman. Intercom documents reviewing queued macro actions beneath the composer before Send; HubSpot documents editing a macro response before Send and apply. Both show why combining response and follow-through can be attractive. For Asym, C would require explicit qualification of the larger composite admission and recovery boundary; the vendor UI does not prove that architecture. [Intercom](https://www.intercom.com/help/en/articles/6584504-using-macros-in-the-inbox), [HubSpot](https://knowledge.hubspot.com/help-desk/create-and-use-macros-in-help-desk).

## What A would mean for the user journey

Provide a quiet **Shortcuts** entry in the current conversation's action area, with the same eligible commands available through the existing keyboard/command access where qualified. Searchable names explain the intended task. Preview shows concrete before → after effects using current labels/assignee/source state, not only a recipe title. Selecting a shortcut does not execute it. The explicit **Apply changes** action commits the reviewed local operation through the authoritative Support boundary.

Start with one selected conversation and a bounded collection of already-qualified Support commands. Label changes and assignment illustrate the useful scope; the exact accepted action allow-list, state/permission preconditions and operational limits receive the selected answer's full adversarial review. No current priority/snooze/custom-state behavior is accepted merely because it exists in the legacy macro enum. D3 work truth and D21 label/source semantics remain governing floors.

Curators maintain names, descriptions, permitted scope and references to existing coded actions/targets through current Support configuration capabilities. Ordinary use does not grant curation, label creation, arbitrary colleague assignment or access to another inbox. Empty libraries are a neutral state; all native actions remain available. No global role, per-shortcut ACL platform or publication ceremony is assumed before its need and existing owner capabilities are qualified.

If a selected label is archived, an assignee loses eligibility, the conversation changes or the shortcut is retired, explain the affected action and require a current valid review. Do not silently skip a required step and report success. Ordinary retries reconcile the same intent; a deliberate new run is a different action. The design must preserve an existing draft and correctly invalidate stale preparation when current source changes matter. Mobile and keyboard users receive the same declared effect or an explicit unavailable state, never a shortened operation presented as equivalent.

## Boundaries already settled

- A is content-free: it neither inserts wording nor creates a Note, message, recipient, subject, signature, acknowledgement or provider call. It cannot imply a requester was contacted or a business action finished.
- D18 remains the sole personal/shared reusable-wording path through Email Studio; D23 remains the managed signature and Tiptap/canonical-authoring boundary. A's names and action parameters are configuration, not email templates or rich-message sources.
- Actual human replies continue through P17 exact preparation, Support admission and P6 tenant Resend. A requires no new Email Studio template or provider-template mirror. C, if selected instead, must consume D18/P17 by reference and copy into the current authorized draft, never add a second wording store or direct mailer.
- Current permissions, original-source/D10 grouping, label semantics, work preconditions and trusted actor context apply to every component. A shortcut grants no permission or CRM context. CRM-context use preserves the same exact source restriction and return navigation.
- No generic status change implies an external reply, refund, receipt, delegated action or other business success. Existing standalone status/assignment controls retain their truthful immediate behavior; the shortcut's review/apply boundary is explicit.
- Bulk execution, external CRM/giving/care mutations, destructive merge/delete/redaction, retention changes, safety-review release, public-name/sender/signature administration and arbitrary HTTP actions are outside this question's proposed shortcut scope.
- Phase34 remains the sole configurable trigger/condition/action vocabulary owner. A means bounded manually invoked presets over qualified coded Support commands through the shared owner seam—not a parallel action interpreter, branching/delay language, rule builder or forward dependency on the whole Phase34 product. Any implementation demanding such a second vocabulary must be narrowed or explicitly reconciled before acceptance.

## Why the current macros cannot simply be kept

Static source inspection found two runners, an operation name that says send while the server skips it, independently committed actions that continue after failure, and skipped steps counted as non-failed. These are not acceptable permanent semantics for any option. A or C requires the qualified shared mutation boundary; B retires/fences the unsupported mixed runner and preserves the native controls. No deployed exploit or new runtime test is claimed. [Current server runner](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/mutations/run-macro.ts#L33), [current client runner](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/lib/macro-runner.ts#L130).

The [evidence register](phase26-q24-evidence.md), [independent coverage/alternative challenge](phase26-q24-gap-review.md) and [primary product comparison](phase26-q24-vendor-research.md) document why this is an unresolved decision and where vendor behavior does or does not fit Core.

**No ADR0024 or new accepted shortcut glossary term is created.** A is the recommendation, B and C remain real alternatives, and Q24 is unanswered. The selected answer receives the full adversarial review. No formal specification, implementation, issue, GitHub/provider/DNS/inbox mutation or real message is authorized.
