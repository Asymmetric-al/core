# D27 focused practice evidence — conversations, outreach and honest dates

Research retrieved **2026-10-11 UTC**. The founder selected Q27 A: actual
conversations and exchanges determine the main personal-contact date; sending a
personal message alone does not. This appendix supports that choice and examines
its UX implications. It is comparative research and proposed design guidance,
not another full adversarial review, formal specification or implementation.

## Findings that change the design

1. **“Last contacted” does not have one standard meaning.** HubSpot includes
   logged one-to-one email without requiring a reply. A therefore needs a label
   that communicates its narrower meaning. Recent one-way care must remain
   visible rather than appearing to disappear.
2. **Completed activity and received email are insufficient classifications.**
   Nonprofit activity records include internal tasks, contributions and mailings;
   email systems can mistake an automated reply for a contact's response. The
   source type and actual outcome matter.
3. **A date describes evidence, not relationship quality or an obligation.** An
   old recorded exchange can coexist with appropriate recent outreach, an agreed
   quiet period, private interaction or no need for a reply. D26's voluntary
   missionary participation makes this distinction essential.

The first two findings follow from published product documentation below. The
third is Core product judgment consistent with the accepted interview decisions;
these sources do not establish a universal ministry policy or measured preference.

## Fresh primary sources and their limits

All URLs below were opened during this research on 2026-10-11. “Undated” means no
document update date was displayed; retrieval does not prove a product release
date. No vendor account, integration or live tenant behavior was tested.

| Source and edition                                                                                                                                                                                                                          | Verified published facts                                                                                                                                                                                                                                                                               | Implication and limit                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **S1. [HubSpot default contact properties](https://knowledge.hubspot.com/properties/hubspots-default-contact-properties)**. Updated **2026-07-02**. All products/plans, with property-specific subscription limits.                         | Last contacted includes logged one-to-one email and other contact activities. Last activity also includes notes and completed tasks. A separate replied-date property concerns email received through connected inboxes. Its call example uses the encounter's date even when logged later.            | Strong evidence for B's broad convention and for separating dates by meaning. None of these labels establishes Core's actual-exchange criterion. The article does not promise that every received message is a substantive human reply. |
| **S2. [HubSpot: unenroll contacts from a sequence](https://knowledge.hubspot.com/sequences/unenroll-from-sequence)**. Updated **2026-08-26**. Sales Hub or Service Hub Professional/Enterprise; some workflow behavior requires Enterprise. | Reply events can stop a sequence. The article describes automated out-of-office detection and a specific gap: Gmail out-of-office messages to Outlook inboxes are not recognized and can cause unenrollment.                                                                                           | Current evidence that a provider reply event needs qualification. This is a documented sequence behavior, not proof that the replied-date property behaves identically, or that Core needs sequences or manual review of every message. |
| **S3. [CiviCRM User Guide: Activities](https://docs.civicrm.org/user/en/latest/organising-your-data/activities/)**. Undated rolling `latest` guide; no fixed installed release established.                                                 | Activities include meetings and calls, but also contributions, event participation and other component events. They have date/time and status; default statuses distinguish scheduled, completed, left message, unreachable and not required. Sending a membership packet is another activity example. | An activity's existence or completion cannot alone establish a conversation. This general nonprofit CRM model supports distinct facts, not a requirement to copy its categories, assignment emails or recurring activities.             |
| **S4. [Blackbaud Raiser’s Edge NXT: Action Summary](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-action-summary.html)**. Undated current online RE NXT help, including web/database-view distinctions.         | Actions distinguish communication categories from Task/Other work about a constituent. Action date describes when to perform work. Completion and outcome are separate details; the published outcome options are Good/Bad.                                                                            | Neither a finished internal task nor a scheduled date proves personal contact. Good/Bad is this product's vocabulary; it is not a recommendation to grade a missionary, supporter or refusal.                                           |
| **S5. [Blackbaud Raiser’s Edge NXT: Timeline](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-timeline.html)**. Undated current online RE NXT help.                                                               | The timeline distinguishes giving, appeals, actions and events. Actions may use their scheduled date or the time marked completed; event RSVP and attendance are distinguished.                                                                                                                        | A visible timeline dot is not necessarily an actual conversation date. Do not copy a generic timeline timestamp into A. This is display behavior, not a claim about every Blackbaud report.                                             |
| **S6. [MPDX: Automatically Logging Tasks on Mobile](https://help.mpdx.org/article/517-automatically-logging-tasks-when-contacting-partners)**. Updated **2021-12-08**; iOS/Android instructions, no exact current app version verified.     | After initiating a call, users select an attempted, left-message, completed or appointment-scheduled outcome. They can confirm, cancel logging or add information. Text and email logging also requires confirmation.                                                                                  | A directly relevant ministry example of brief outcome capture and optional detail. Launching a communication app is not enough. The older document does not establish present runtime behavior or prove MPDX implements A.              |
| **S7. [TntConnect: Building Relationships — Tasks & History](https://www.tntware.com/tntconnect/help/en/pages/taskhistory-overview.aspx)**. Undated currently served help; historical comments are not current-version evidence.            | The guide separates several contact-type dates, supports purpose distinctions such as thanking, and distinguishes automatic data-change history from relational history.                                                                                                                               | A useful missions precedent for retaining one-way care and keeping edits separate from relationship evidence. It does not define A, validate its usability, or justify importing gift-triggered tasks or contact targets.               |

## Faithful A with little additional work

These are **design recommendations**, not further founder choices or findings
from practitioner interviews.

**Make the headline specific.** Prefer “Last recorded conversation or exchange”
over unexplained “Meaningful contact,” “Last activity,” or an unqualified “Last
contacted.” A shorter label can use nearby explanation. An illustrative summary
is “Conversation · 12 September” beside “Personal message sent · 5 October.”
The underlying source remains accessible within permissions. This preserves A
and B's legitimate stewardship insight without merging their meanings.

**Describe only what is known.** Where the visible source supports it, “No reply
recorded” describes the record; “They have not replied” asserts knowledge the
system may not have. With missing coverage, show uncertainty rather than a
confirmed absence. “No reply needed” can reflect deliberate known context; it
must not be inferred merely because no question mark appears. Do not default
every sent message to “Awaiting reply,” a follow-up task or a warning badge.
An empty exchange summary should say “No recorded exchange available,” not
“Never contacted.” A source failure must not masquerade as that empty state.

**Reuse truthful source outcomes.** Distinguish an attempted call, a message left,
an actual conversation and a meeting merely scheduled. Ask for a simple outcome
only when the source does not already establish it. Avoid a mandatory “Was this
meaningful?” checkbox, a second history entry or compulsory narrative. A short
human response such as a clear refusal can carry substance; length, positive
sentiment, giving amount or agreement are not appropriate qualification tests.
Automated acknowledgements, delivery and open signals do not qualify. Uncertain
machine classification stays uncertain; this decision does not authorize a new
mail ingestion system or AI reading of private correspondence.

**Keep the actual encounter date.** Logging last week's conversation today does
not make the relationship newly contacted today. Completing an administrative
task, editing a note or sharing a second account of the encounter does not create
another exchange. When the historical date is not known, do not invent precision
to populate the headline. Existing source ownership and correction rules govern;
this comparison is not a proposal for another event store.

**Preserve the ministry context and autonomy.** A relevant exchange with a
church's representative can concern the church partnership; it does not prove a
conversation with every person at that church or every ministry it supports.
Use the recorded relationship context without inferring donor allegiance. An
aggregate must not reveal private encounters through a date or count. Neither an
old date nor missing voluntary history means inactivity, poor performance or
permission to contact again. Accepted restrictions, quiet periods and source-owned
obligations remain effective; D27 creates no logging quota or outreach cadence.

## Strongest alternative and remaining evidence gap

**B remains credible:** counting purposeful personal outreach in a broad contact
date recognizes work such as a personal thank-you that reasonably needs no answer.
S1 demonstrates that this is a real CRM convention, not a strawman. Its cost is
that one recent outbound message can make an old conversation look recent unless
the two facts remain distinguishable. With A selected, the smallest good design
keeps outreach beside the exchange evidence. Adding mandatory response tracking,
read receipts or a new contact score would not solve the semantic problem.

The material risks are **high impact** for false evidence or private-date leakage
and **moderate impact** for confusing labels or unnecessary logging work. Their
frequency in Core is **unknown**, not measured by these documents. None of the
sources establishes that missions staff prefer the proposed labels. No pilot,
interview, benchmark or usability result is claimed.

A later small usability check can ask actual staff and missionaries to interpret
four illustrative records: an old conversation plus yesterday's thank-you needing
no reply; a clear human refusal versus an out-of-office response; last week's
meeting recorded today; and no visible exchange with incomplete history. Observe
whether they identify what is known without concluding that another message is
required or the missionary has failed. These are proposed tasks, not performed
tests or invented success thresholds. Wording can then improve without reopening
A or expanding the product into a monitoring system.
