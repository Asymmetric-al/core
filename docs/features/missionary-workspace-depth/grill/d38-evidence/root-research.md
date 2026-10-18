# D38 root research and interpretation

Retrieved October 18, 2026. Research/design evidence only; no authenticated
vendor walkthrough, ministry interview, live Core test or efficacy study.

## Primary sources freshly opened

| Source                                                                                                                                                                                                        | Fact                                                                                                                       | Application and limit                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [NN/g — Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/), December 3, 2006                                                                                                   | Keep frequently needed options visible; defer genuinely secondary detail. Interdependent choices can belong on one screen. | Two labeled period fields are simpler than a wizard or an inheritance switch. This is longstanding interaction research, not a newly measured missionary preference. The page was freshly retrieved; its publication is old. |
| [GOV.UK — Text input](https://design-system.service.gov.uk/components/text-input/), maintained guidance                                                                                                       | Examples associate labels, help and errors; numeric input modes can improve entry.                                         | Explicit days labels and accessible validation; use Core's own Base UI/base-maia components, not the GOV.UK visual system. No duration value follows from this source.                                                       |
| [W3C — Understanding 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), maintained WCAG 2.2 guidance                                                                   | Status messages must be programmatically determinable without requiring focus.                                             | Announce save/continuation results once, retain readable inline result and predictable focus. No countdown announcements or success based only on an optimistic label.                                                       |
| [ICO — Storage limitation](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/storage-limitation/), maintained guidance | Retention is purpose-based; UK GDPR does not prescribe one universal period for all personal data.                         | A referral work window is not a retention policy or permission to contact. This is UK guidance, not a universal legal determination for every tenant.                                                                        |

The independent [UX comparison](ux-and-comparisons.md) supplies current CRM,
missionary and coaching evidence. Those sources do not establish a universal
number, an initial-clock anchor or a need for a third configuration mode.

## Scope reconciliation

- The founder selects **B**, two organization-set periods. Equal values remain
  valid, with independent meaning. The previous recommendation A is superseded
  for this question; it remains the strongest simpler alternative.
- D36 governs continuation's elapsed-day and source-acceptance semantics. Its
  initial-scope exclusion must be expressly extended for **configuration scope**
  only. A selection of two values does not settle the initial source clock.
- D35 already answers disable: missionary self-service Off and ordinary source
  action grants remain available. Tenants can withhold the relevant staff and
  missionary grants. No global CRM switch, clearing the period, disabling expiry
  or converting missing data into Never is warranted by this answer.
- No period edit changes an accepted referral's existing end date. A factual
  correction is a separate authorized source operation, not a personal override.
- A missing initial value must not break independently qualified continuation;
  a missing continued value must not imply the initial value. Save only intended
  valid configuration changes; absent untouched fields remain unconfigured.
- Initial source event and late-entry admission remain an explicit product
  decision before later specification; they cannot be delegated to an implicit
  implementation choice. P9/import then qualify the adopted meaning, supported
  bounds and native producer before activation. No per-referral date question
  is added to Maya's ordinary workflow.

## Hypothesis checks

| Hypothesis                                                  | Result                                                                                                                                                                  |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two fields necessarily create too much complexity           | Not established. They express two selected meanings without adding a mode, override matrix or linked fallback. Actual comprehension still needs usability verification. |
| A longer continued period must be invalid                   | Rejected: no governing source or user choice imposes an ordering. Either period can be greater, smaller or equal within its supported finite range.                     |
| A saved value grants authority                              | Rejected by D35/D36 and P12. Configuration and permission are separate.                                                                                                 |
| New means database insertion time                           | Rejected as an assumption. Historical imports and delayed recording are direct counterexamples.                                                                         |
| Expired means unwilling supporter                           | Rejected by D34. It is the referral window, not a judgment about a person.                                                                                              |
| A current policy can calculate historical end dates on read | Rejected: editing settings would silently move already accepted windows.                                                                                                |
| Off can be implemented with zero/null                       | Rejected: authorization and finite period meaning would be conflated.                                                                                                   |

No invented workload, preference score or fundraising gain is used to settle
the selected design. Future user research must test understanding and successful
task completion, not only whether someone likes the appearance.
