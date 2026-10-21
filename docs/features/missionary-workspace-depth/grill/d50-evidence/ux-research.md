# D50 — clear recurring-attribution UX

Research date: October 18, 2026. Fresh official UX pages were opened and read;
this is documentary guidance, not Asym user testing. Existing
[D49 review/status guidance](../d49-evidence/ux-research.md), read earlier today,
remains applicable. Preserve Core's shared Base UI/base-maia system.

| Source                                                                                                          | Verified guidance and age                                                                                                                                                                                             | Scoped application                                                                                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [W3C SC 3.3.2: Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) | The inspected page reports updated March 9, 2026. Provide visible labels/instructions that identify expected input, with enough guidance to avoid confusion; unnecessary instruction can also hinder the task.        | Use **Campaign attribution** for the current permitted value; **Original campaign** only for the actual origin in history. Place the consequence of an edit near its control, not in a tooltip-only explanation. |
| [NN/G: Preventing User Errors](https://www.nngroup.com/articles/user-mistakes/)                                 | Published September 7, 2015; freshly inspected October 18, 2026. This is established guidance, not a new study. Preview consequences, display relevant context and avoid excessive confirmations that interrupt work. | Review current/proposed attribution and its effective scope in the existing recurring edit. Do not add a confirmation wizard to every ordinary amount or payment-method change.                                  |
| [NN/G: Confirmation Dialogs](https://www.nngroup.com/articles/confirmation-dialog/)                             | Freshly opened; not used as evidence of recent fundraising behavior. Consequential actions need specific understandable action labels and scope; repetitive generic confirmation loses usefulness.                    | A distinct **Change campaign for future gifts** action makes the intent clear. Use the existing review/save boundary, not an additional generic “Are you sure?” layer.                                           |

## Proposed whole journey

- **Code/campaign setup:** show current and proposed code assignment and the
  concise consequence **Existing recurring gifts keep their campaign.** D49's
  earlier-gift consequence stays visible. No second policy switch is added.
- **Recurring detail:** show the permitted campaign with its actual lifecycle
  label, when relevant. An archived campaign is not a missing value and does not
  imply the recurring gift stopped. Do not expose restricted campaign identity.
- **Intentional change:** staff with exact current authority use the existing
  recurring amendment flow, with old/new campaign and the source-qualified first
  affected occurrence or date. History remains available in the existing detail.
  Label the current effective campaign truthfully after an amendment; keep the
  origin as history rather than a competing editable field.
- **Ordinary maintenance:** changing amount, cadence, payment details, collection
  executor or pause status carries the applicable accepted attribution forward.
  No new campaign decision is demanded merely because these fields change.
- **Feedback:** show Saved, Awaiting approval or Updating only when the source
  establishes that state. A lost response reconciles the same command. Preserve
  safe input on rejection and explain what changed before asking for a new save.
- **Donor and missionary surfaces:** no additional donor checkout choice,
  compulsory missionary task, campaign-edit permission or communication follows.
  They see only their relevant permitted source-backed facts.

The intended UI remains one coherent record and its existing amendment/history
flow. Long/localized campaign names, accessible labels, keyboard focus, phone
widths and assistive status announcements need actual journey proof. No new
settings page, drag-only interaction, copied component family, hidden bulk
reattribution, or arbitrary campaign rule builder is justified.
