# D49 — current UX guidance and bounded application

Retrieved October 18, 2026 from the official pages below. The associated
[fetch manifest](ux-sources.json) records HTTP success, final URL and body digest;
`ux-source-*.txt` preserves extracted page text. This is documentary research,
not observed Asym usability or proof that any vendor implements D49.

| Source                                                                                                          | Verified guidance                                                                                                  | Application and limit                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [GOV.UK Check answers](https://design-system.service.gov.uk/patterns/check-answers/)                            | Let users check information before submission. The guidance distinguishes long transactions from simpler journeys. | Show old campaign, new campaign and the effect on earlier gifts in the existing edit surface. A separate multi-page wizard or repeated confirmation is unnecessary for a short form. This is a pattern recommendation, not a requirement to copy GOV.UK visuals. |
| [W3C WCAG 2.2 SC 3.3.4](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html) | Important submissions must be reversible, checked or confirmed; the criterion does not mandate all three.          | Validate the target and allow review/correction before saving. An audited later correction can be available without pretending the original financial fact is editable. Do not add redundant confirmation dialogs by claiming WCAG requires them.                |
| [W3C WCAG 2.2 SC 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)                       | Assistive technology must be able to announce status changes without taking focus.                                 | Announce confirmed Saved, Waiting or Error states through existing accessible components. Avoid optimistic success while the authoritative result is unknown, and avoid forcing focus to a toast.                                                                |

Recommended copy in the campaign-assignment editor: **Earlier gifts keep their
recorded campaign.** A deliberate **Save assignment** action accepts the displayed
change. A separate permitted **Correct attribution** action operates on selected
existing gifts with before/after review and a reason; it is not a checkbox to
rewrite history during ordinary setup.

Keep routine work compact: one labeled campaign selector, current assignment,
consequence text and Save/Cancel. A staff member who cannot manage assignments
sees the permitted attribution without a misleading enabled edit control. A
stale edit retains its proposed input where permitted, explains that the source
changed, and refreshes for review. Source-backed success, accessible feedback,
keyboard behavior, touch layout and exact currency/date presentation use Core's
shared Base UI/base-maia components. No new visual system, modal wizard or tenant
history-rewrite setting is justified by this decision.

No donor checkout step or missionary administrative obligation is added. The
visible result is stable campaign progress unless actual gift evidence or an
authorized correction changes it. Existing authorized report-model controls
(e.g. first-touch/last-touch) retain their meaning; they cannot rewrite a gift's
accepted attribution silently.
