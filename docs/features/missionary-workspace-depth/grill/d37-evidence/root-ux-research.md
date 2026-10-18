# D37 — contextual help and accessible editing

Research date: October 18, 2026. Primary public pages were opened during this
review; publication dates below are not retrieval dates. These findings support
design choices, not a claim that Core missionaries were interviewed or that a
prototype passed usability testing.

| Primary source                                                                                                                           | Verified finding                                                                                                           | Application and limit                                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [NN/g: Onboarding Tutorials vs. Contextual Help](https://www.nngroup.com/articles/onboarding-tutorials/), February 12, 2023              | Describes interruption and memory costs of upfront tutorials, and recommends help that can be dismissed and found again.   | Keep a stable Getting started entry and a dismissible invitation; show help near meaningful work. This is cross-product research, not proof of the ideal Core placement or fundraising results.                           |
| [GOV.UK: Complete multiple tasks](https://design-system.service.gov.uk/patterns/complete-multiple-tasks/), no displayed publication date | Its task-list pattern is for longer transactions across sessions and advises simplifying the transaction first.            | Do not borrow a completion checklist merely because suggested steps are ordered. D37 guidance is not a transaction or required workflow. Borrow clarity of action wording, not its styles or completed/incomplete states. |
| [W3C: WCAG 2.2 SC 2.5.7](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html), living explanatory page                   | Dragging functionality needs a non-drag single-pointer alternative; keyboard access alone does not satisfy this criterion. | Staff have Move up/Move down buttons usable with touch and keyboard. Dragging is optional polish, not the only editor path.                                                                                               |
| [W3C: WCAG 2.2 SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), living explanatory page                  | The AA minimum is 24×24 CSS pixels, with defined exceptions.                                                               | Core's own touch convention is at least 44 CSS pixels for touch buttons. Preserve that stronger local convention; do not misstate 44 as the WCAG AA minimum.                                                              |

Repository checks: [frontend rules](../../../../ai/rules/frontend.md),
[shared UI contract](../../../../../packages/ui/AGENTS.md),
[actual component configuration](../../../../../packages/ui/components.json),
[accessibility-review skill](../../../../ai/skills/accessibility-review/SKILL.md),
[touch conventions](../../../../ai/skills/emil-design-engineering/touch-accessibility.md)
and [testing rules](../../../../ai/rules/testing.md). The configuration is exact
Base UI/base-maia, Zinc semantic tokens, shared `packages/ui`; external examples
do not authorize another visual system. Existing header/sidebar patterns can
host links, but do not prove an implemented guide or qualified authoring source.

No application was edited or browser-tested. The selected documentation workflow
requires structural checks, not artificial failing tests for proposed behavior.
Runtime qualification must later include keyboard and touch reordering, focus,
screen-reader names/status, contrast, reflow, long translated text and slow-network
recovery. Automated accessibility checks alone are insufficient.
