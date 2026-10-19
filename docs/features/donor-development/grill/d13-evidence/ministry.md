# D13 — missions practice and missing initial assessment

Research appendix, 2026-10-10 UTC. D13 A is selected for adversarial review, not
ratified by this appendix. Only the ability to deliberately start partnership work
without a recorded stage is in scope. Existing-stage clearing, administrative
defaults and preset changes remain undecided. No product execution or practitioner
interviews occurred. Likelihood ratings below are judgments, not measured rates.

## Finding

**A is credible for missions organizations if missing assessment remains explicit
and does not become missing responsibility.** Staff can know a church, its gifts
and its relationship with a missionary while lacking a suitable recorded stage for
the particular ministry's cultivation effort. This is an illustrative possibility,
not evidence that agencies commonly omit stages. Allowing an honest omission is
preferable to demanding a guess; it still requires deliberate admission and the
existing responsibility and next-action contract.

The strongest contrary evidence is TntConnect's advice to resolve its default
phase promptly. That supports taking meaningful classification seriously, not a
universal deadline, compulsory introductory call or mandatory new workflow.

## Fresh primary evidence

All links were retrieved on **2026-10-10**. Documentation describes published
behavior; the products were not run. Publication dates are distinguished from
retrieval dates. These products' contact-level statuses are not equivalent to
Core's ministry-specific cultivation stage.

| Source and date/edition                                                                                                                                                                     | Published fact                                                                                                                                                                       | Implication and limit                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [MPDX Contacts List View](https://help.mpdx.org/article/1275-contacts-list-view), updated 2023-05-01; current public MPDX help                                                              | Its unfiltered active list includes contacts with no selected status, alongside named active statuses. Hidden statuses are separately described.                                     | Direct missions-tool precedent for keeping records visible without classification. It does not establish every creation path, deliberate admission, or Core's ownership rules.                                                                                  |
| [TntConnect TNT Phase](https://www.tntware.com/tntconnect/help/en/pages/contacts_mpdphase.aspx), undated current desktop technical manual                                                   | New contacts default to n/a; the guide urges assigning a meaningful phase quickly. It distinguishes donor refusal, inability to establish a response, and staff deciding not to ask. | A placeholder is useful but can become neglected. Its recommended Never Contacted starting phase cannot truthfully describe every existing church relationship newly tracked in Core. Its financial/contact status mixture and task automation are not adopted. |
| [MPDX Finding TntConnect Data After Import](https://help.mpdx.org/article/440-finding-tntconnect-data-after-import), updated 2020-09-14; published migration guide                          | It documents phase-to-status mapping, relocated information, fields not imported, and incomplete transfer of recurring task information.                                             | Inherited knowledge can differ from what the new system records. This is evidence for careful provenance, not a license to drop a known stage, infer one from gifts, or adopt these migration mappings.                                                         |
| [OMF: 50 years of missionary support](https://omf.org/in-it-for-the-long-haul-50-years-of-missionary-support/), posted 2024-05-03; OMF International article by its US writer               | One church's prayer and financial partnership with a missionary couple continued across roles, countries and semi-retirement; personal connection mattered.                          | Existing partnership is richer than a newly created work record. This is one documented relationship, not evidence of OMF's CRM entry policy or missing-stage frequency.                                                                                        |
| [HubSpot Determine filter criteria](https://knowledge.hubspot.com/segments/determine-filter-criteria), updated 2026-09-15; current all-products knowledge base, feature availability varies | Known and unknown property filters distinguish presence from absence; some other operators need explicit handling of empty values.                                                   | Useful general CRM evidence that missing information must have deliberate query semantics. Its sales scoring, automation and operator details do not prescribe Core behavior.                                                                                   |

The sources do not establish an optimal percentage of unassessed records, an
assessment service level, a universal missionary workflow, or a preferred UI
control. No such empirical claim should appear in the decision.

## Material concerns and proposed clauses

### M01 — evaluating the record versus evaluating the supporter

**Severity: high; likelihood: plausible.** A bare label can suggest the church is
unknown, its partnership is doubtful, or it has never been contacted. It can also
obscure independently known prayer or giving history. Those are materially
different facts, especially when new staff take responsibility.

**Exact proposed clause:** “Not yet assessed means that no cultivation-stage
assessment is recorded for this partnership work. It does not describe the
supporter's identity, worth, willingness, history of contact, prayer support,
giving, or permission to communicate. Existing source facts remain separate.”

Keep the label scoped to the stage, with concise explanatory text where needed.
For example: “No stage recorded yet. Responsibility and follow-up still apply.”
This is suggested copy, not a final control or mandatory acknowledgement.

### M02 — missing assessment becoming an unattended waiting room

**Severity: high; likelihood: plausible.** Staff may interpret unassessed as a
candidate, draft or suspended obligation. Conversely, fixing that risk with a
second assessment queue would add friction and duplicate established task work.

**Exact proposed clause:** “Work admitted without a recorded stage remains
subject to the same authorized admission, exact ministry and purpose,
responsibility, due-work-or-owned-exception, and lifecycle rules. Missing stage
assessment alone creates no task, deadline, contact attempt, approval or pause.”

A useful next step may be reviewing information already available to authorized
staff. It need not be a fresh conversation, solicitation or financial action.
Unassessed is not permission to keep otherwise abandoned work active indefinitely.

### M03 — replacing a missing fact with a catchall stage

**Severity: medium; likelihood: plausible.** A compulsory “Needs assessment” stage
can make a catalog look complete while mixing an actual working stage with absent
knowledge. Calling it the first stage can further imply progression or start time.

**Exact proposed clause:** “Missing assessment is distinct from the organization's
configured stages and their display order. Staff may choose an appropriate
approved stage when known; D13 does not require all new records to be unassessed.”

Do not silently ban particular tenant labels. A defined discovery stage can
accurately express work staff already understand and have chosen. The distinction
depends on meaning, not whether the label contains ‘assessment.’ D13 adds no
tenant setting for defaults, mandatory selection or hidden fallback classification.

### M04 — truthful UI and counts require explicit missing-value handling

**Severity: high; likelihood: plausible.** An authorized active list might omit
records without stages, while a report silently puts them in the first stage.
Conversely, missing access or a failed lookup might be mislabeled unassessed.
This makes A more than a blank optional form field.

**Exact proposed clause:** “Authorized views distinguish a genuinely absent
recorded stage from loading, failure, unavailable access or an unresolved stage
reference. Applicable work totals include admitted work without a stage; displays
and reports identify missing assessment without treating it as a configured
stage, progress, regression or a donor response.”

This requires consistent semantics, not a new dashboard, reserved board column,
nullable database design or metric formula. An eventual first assessment records
the real change; it does not manufacture prior stage visits or donor activity.

### M05 — omission must not erase knowledge in reused work

**Severity: high; likelihood: plausible in group or stale submissions.** A form
that permits omission at creation can accidentally become a clearing command when
an existing effort is found, or when another worker has already supplied a stage.

**Exact proposed clause:** “D13's initial omission does not authorize clearing an
existing recorded stage, resetting reused work, or changing D9 reopening. Reviewed
group operations preserve each member's actual intent and the existing admission
and concurrency rules.”

This preserves the question's boundary; it does not decide whether or how staff
may later explicitly clear a stage.

## Strongest alternative and technical-debt test

**B's best case:** requiring a genuinely appropriate initial stage gives staff one
uniform classification rule and simplifies stage-based views. An organization may
define an accurate initial discovery stage that requires little prior knowledge.
That is stronger than assigning the first option mechanically.

**Its limit:** if no approved stage fits, requiring a value either blocks useful
authorized work or pressures staff to assert something unsupported. A generic
custom catchall can hide that missing knowledge inside apparently complete stage
reporting. It also makes the same missing-information condition mean different
things across presets.

**A's cost:** every relevant read, filter, export and admission path must handle
the absence truthfully. That is bounded product work, not evidence for an
assessment engine. Tenant flexibility remains the existing ability to define
meaningful stages; this review does not decide an administrator's default policy.

## Focused acceptance and usability probes

These are proposed checks using illustrative fixtures, not claimed observations:

- Start work for a church with established prayer/gift history but no defensible
  recorded stage. The record remains visible and accountable; those independent
  facts are preserved and no first-contact claim is added.
- Start a prayer-only partnership with an appropriate known introductory stage,
  then another without a known stage. Both paths work without money or new contact
  evidence becoming prerequisites.
- Process a reviewed group containing new unassessed work and existing staged
  work. Only authorized intended admissions occur; the existing stage survives.
- Load the same record with a failed stage request or insufficient access. Neither
  condition is presented as a confirmed lack of assessment.
- Record the first real stage later. History records that action without implied
  intermediate stages, new gifts, consent or completed outreach.
- In a small usability review, ask authorized staff and missionaries to explain
  what the label means and find the next responsibility. Check whether they mistake
  it for an unknown supporter, paused work or permission to contact. Establish
  local success criteria with those users; no invented threshold or popularity
  claim is warranted now.
