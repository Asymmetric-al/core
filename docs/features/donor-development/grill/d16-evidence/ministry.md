# D16 — shared approved choices without extra process restrictions

Research appendix, **2026-10-10 UTC**. Founder choice A is under review: authorized
people choose an appropriate list from current approved new-use choices within
the actual governed source scope, without another process-applicability layer.
This appendix does not ratify implementation or later defaults/switching policy.
No product was executed, practitioner interviewed or live configuration changed.

## Assessment and strongest alternative

**A is a coherent low-complexity choice if people can understand the available
processes.** It preserves organization-approved definitions while leaving the
choice to authorized staff judgment. It does not mean that every approved list
is equally suitable for every effort, or that selecting one proves its suitability.

The most immediate missions ambiguity is the illustrative pair “Missionary
support” and “Church partnerships.” A church can support an individual missionary,
couple or team. Those names overlap unless their guidance distinguishes the actual
work. Neither the Party being a church nor the viewer being a missionary settles
which process fits. This is a design inference, not observed user confusion.

**B's strongest case** is legitimate organizational governance: an agency with
clearly different processes may need to prevent unsuitable combinations, maintain
consistent training or make its reporting dependable. Published nonprofit CRMs
offer different process collections and controlled record-type availability.
Guidance does not enforce such a policy. B would, however, require explicit
classifications, authority, exceptions and maintenance; those are additional
choices, not consequences of having more than one list.

Retain selected A. No reviewed evidence demonstrates a missions requirement that
overrides it. Do not implement B indirectly through ministry, Party-type, team or
surface filters and then describe the result as free choice. Existing source and
permission boundaries still apply; they are not optional process guidance.

## Fresh primary evidence and limits

All sources were opened on **2026-10-10**. Dates below are the retrieved pages'
publication/update dates, not proof of an installed version. Undated help remains
published documentation, not current runtime validation.

| Source and scope/date                                                                                                                                                                                                                  | Published fact                                                                                                                                                                            | Relevance and limit                                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [HubSpot Set up and manage object pipelines](https://knowledge.hubspot.com/object-settings/set-up-and-customize-pipelines), canonical page displayed **2026-09-08**; general CRM, plan-dependent capabilities                          | Recommends separate pipelines for distinct stages/processes and sharing a pipeline across teams with the same process. It also offers team-restricted pipelines in specified plans.       | Both shared use and restriction are credible vendor choices. Neither is evidence of agency preference; team visibility is not identical to Core's proposed process-applicability policy. |
| [Salesforce NPSP Required Configuration](https://help.salesforce.com/s/articleView?id=sfdo.npsp_required_config.htm&language=en_US&type=5), **undated**; Nonprofit Success Pack, not current Nonprofit Cloud's domain model            | Associates opportunity record types with processes and makes types available to profiles; examples include donation, grant, in-kind and major-gift work.                                  | Strongest nonprofit analogue for B's governance. These are opportunity types, not ongoing missionary partnerships; their profile/default machinery is not adopted.                       |
| [Salesforce record-type considerations](https://help.salesforce.com/s/articleView?id=sf.customize_recordtype_considerations.htm&language=en_US&type=0), **undated**; Classic/Lightning, listed Professional through Developer editions | Warns that record types are not access control; creation availability does not establish read restrictions. It also discourages sensitive information in type metadata.                   | Supports distinguishing choice, record authority and disclosure. Salesforce's own metadata visibility rules must not be imported into Core.                                              |
| [MPDX Adding and Managing Ministry Accounts — All Other Orgs](https://help.mpdx.org/article/633-adding-and-managing-ministry-accounts-all-other-orgs), updated **2024-06-24**; non-US-Cru ministry-account guide                       | Describes shared team ministry accounts with partners, tasks and history, and asks users to check the selected account when managing work. Its sharing model grants broad account access. | Actual missions documentation emphasizes clear work context and collaboration. An account is not a stage list; its broad access and financial designation model are not adopted.         |
| [OMF: 50 years of missionary support](https://omf.org/in-it-for-the-long-haul-50-years-of-missionary-support/), posted **2024-05-03**, OMF International/US account                                                                    | Describes a church's sustained prayer and financial support for a couple, with personal connections and support for other missionaries as well.                                           | Concrete counterexample to treating church partnership and missionary support as mutually exclusive concepts. It establishes no stage list, assignment rule or software preference.      |
| [Pelf tutorial](https://docs.civicrm.org/pelf/en/latest/tutorial/), **undated**, CiviCRM extension documentation                                                                                                                       | Uses different case types for pipeline processes; explains that differing stages cannot simply be aggregated as equivalent. Tutorial records are expressly fictional.                     | Supports preserving process context in reporting. It neither proves that staff choose freely in all cases nor justifies Core adopting its categories, probabilities or mapping system.   |

No source establishes that unrestricted approved choice improves ministry outcomes,
that restrictions are always harmful, or that staff can distinguish Asym's eventual
lists without testing. Vendor examples are comparisons, not research participants.

## New D16 concerns and exact minimal clauses

Severity describes consequence; likelihood is a qualitative design judgment.
These clauses clarify this choice without reopening the settled shared model,
stage guidance, optional initial assessment or list retirement.

### M01 — descriptive names become an implicit classification rule

**High severity; plausible.** A church supporting a missionary could be forced
into a church-named list or an extra purpose; a missionary could see a different
list solely because they use another app. The OMF account grounds the conceptual
overlap; the potential software failure is an inference.

**Clause:** “Choose the process that fits the partnership work. A list name,
supporter type, missionary status, team or viewing surface does not itself assign
or restrict the list, duplicate the effort, or establish another purpose.”

**Proof:** use an illustrative church supporting one ministry and separately
partnering with another. Apply existing scope and admission rules, but do not
derive list applicability from ‘church’ or force another journey for prayer support.

### M02 — judgment is offered without enough meaning to exercise it

**Medium severity; plausible.** Several approved names can be legal choices but
indistinguishable to ordinary staff. Relying on later correction would presume an
unselected switching facility. NPSP and Pelf illustrate real process differences,
but do not validate Asym's proposed wording.

**Clause:** “Where the list choice is unresolved, make the available lists' purpose
and stage meanings understandable before admission. Use concise guidance to
support judgment without a required justification, acknowledgement or approval.”

**Proof:** present two allowed lists with genuinely different meanings and two
with confusingly similar names. A participant should be able to explain the chosen
process from the available guidance. Refine wording where needed; do not add a
mandatory wizard, suitability score or hidden applicability rule as the remedy.
No exact widget, default, preview ceremony or final list labels are selected here.

### M03 — “shared choices” becomes tenant-wide disclosure or weaker admission

**High severity; plausible.** An available list could be mistaken for permission
to work with any supporter/ministry, or its name could reveal a restricted context.
Salesforce explicitly distinguishes record-type selection from read authority.

**Clause:** “Shared approved choice is limited to the current governed catalog,
source context and permissions. Choosing a list grants no access, establishes no
valid ministry relationship, and waives no identity, purpose, responsibility or
admission requirement. D16 adds no process-specific restriction layer.”

**Proof:** authorized choices remain available without arbitrary team/Party-type
filters, while cross-tenant, hidden metadata and unauthorized ministry admission
remain blocked. Missionary-facing availability does not by itself grant authority
to start work. Separate genuine permission denial from ‘this process seems less
appropriate’; advisory guidance cannot masquerade as authorization.

### M04 — process choice asserts donor or financial facts

**High severity; plausible.** Selecting a list described as support raising or
church partnership might imply permission to ask, a completed church agreement,
financial value, or an expectation that prayer-only partners should progress to
giving. The ministry evidence supports overlapping forms of participation, not
such implications.

**Clause:** “A chosen list records the intended cultivation process only. It does
not establish donor agreement, contact permission, participation, giving, ask
outcomes, completed tasks or supporter value. It neither chooses an initial stage
nor changes the permitted Not yet assessed condition.”

**Proof:** start authorized prayer-only work using an available list without a
gift or solicitation. Its normal next work remains accountable; list choice creates
no message, commitment, inferred stage or completed interaction.

### M05 — free choice obscures reporting and the new-use boundary

**Medium severity; plausible.** Staff choice does not make equal stage labels
equivalent or a retained old list eligible for new admission. Pelf explains the
aggregation problem; D15 supplies the actual retirement policy.

**Clause:** “Record and present the actual accepted list context. List choice does
not normalize stage meanings across processes, make retired lists available for
new work, or change an existing effort's binding.”

**Proof:** equal labels in two lists retain distinct meanings in authorized
reports. Withdraw a list after a form loads: new admission follows current D15
availability, while existing saved work keeps its qualified continued use. A
deliberate zero-choice state stays explicit; missing stage assessment does not
substitute for a missing list.

## Usability probes and remaining limits

Use real authorized agency staff and support-raising missionaries when product
qualification begins. Ask them to identify the exact ministry, explain two lists'
purposes, choose for an illustrative church/worker partnership, and interpret the
same saved effort from their authorized views. Include prayer-only support and
a situation in which no list is available. Observe confusion and reasons for
choice rather than inventing a preferred answer from labels alone.

There are no participant results, measured error rates or established success
thresholds. Suggestions/defaults, single-choice presentation and later switching
remain unresolved. Existing contextual admission must not become an unnecessary
repeated picker; D16 equally does not authorize an implicit first-list default.
If future real evidence demonstrates a need to enforce process compatibility,
that would require a new explicit product decision, not a hidden rule slipped
into permissions, filters or guidance under A.

## Consolidated decision status

The [completed D16 review](../phase27-d16-adversarial-review.md) consolidates this
research and records Accept. The founder subsequently explicitly ratified its
exact decision and safeguards on 2026-10-10. Earlier recommendation language is
research provenance; no additional default, sole-option or saved-list correction
policy is inferred. [Q17](../phase27-q17-initial-list-choice.md) is unanswered.
