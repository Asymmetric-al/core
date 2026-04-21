---
name: design-rules
description: Side-by-side design decisions across iconography, typography, color, illustration, layout, IA, interaction, timing, transitions, accessibility, copywriting, and components. Each rule frames a right/wrong comparison with the reason the better choice wins.
---

# Design Rules

Paired comparisons showing the better choice and why. Apply these when reviewing or producing UI.

## Iconography

1. 16px icon with identical stroke to its 24px version vs stroke thinned at 16px to match the reduced scale.
2. Icon snapped to half-pixel coordinates vs snapped to whole pixels — one blurs on 1x screens.
3. 1px stroke icon used at 12px vs swapped to filled at 12px — the stroke version disappears.
4. Outlined icon used for active/selected state vs filled (trick question: either works, consistency is what matters).
5. Play button centred mathematically in a circle vs nudged 1px right — the mathematical version looks left-heavy.
6. Card set mixing two icon libraries vs unified to one — even if similar, weight and radius differences compound.
7. Icon scaled up from 16px to 48px with stroke intact vs redrawn at 48px with heavier stroke weight.
8. Floppy disk icon for "save" vs a labelled "Save" button — the icon alone means nothing to anyone under 30.
9. Stroke icon with square caps vs round caps — in most UI contexts square caps read as unfinished.
10. Multipath icon requiring multiple fill changes vs unioned into a single path with one fill.
11. Thin-stroke icon sitting next to bold text vs icon with matched optical weight — the thin one looks like a mistake.
12. Full logo used as favicon at 16px vs simplified mark pixel-hinted for 16px — the full version is mush.
13. Chevron used for both "expand accordion" and "go to next page" in the same product vs using a different arrow variant for navigation — same icon, two meanings, users learn neither reliably.
14. Icon pair (like upload/download) that are identical except rotated 180° vs designed with a second distinguishing signal — rotation alone is too subtle at a glance, especially for colourblind users.
15. Alert icon using an exclamation in a circle vs exclamation in a triangle (trick question: circle typically means info/neutral in most systems, triangle means warning — but it varies by convention and both are used).
16. Icon in a button with no breathing room between icon and label vs 6–8px gap — the cramped version looks like they collided.
17. Star icon used for both "favourite" and "rating" in the same product vs using heart for favourite and star only for rating — double meaning creates confusion about what the state represents.

## Typography

1. Display headline with default metric kerning vs optical kerning enabled — optical removes the awkward gaps between certain letter pairs.
2. Paragraph spacing set to an arbitrary 12px vs set to 1× the line-height — the arbitrary value creates inconsistent rhythm.
3. Body text stretching full container width vs capped at 65ch — the full-width version creates exhausting line lengths.
4. Uppercase label with default tracking vs loosened tracking — tight uppercase looks cramped and amateurish.
5. No fallback font stack declared vs a designed fallback that matches x-height and weight — the unstyled fallback causes layout shift on load.
6. Light-weight typeface used at 11px vs at 32px — at small sizes it becomes illegible, at large sizes it's elegant.
7. Two typefaces that are both sans-serif humanists paired vs a sans paired with a serif — same-classification pairs create sameness, not contrast.
8. Price column with default kerning vs `tabular-nums` — the numbers don't stack and the column looks chaotic.
9. Long article with a single orphaned word on the last line vs `text-wrap: balance` applied — the widow looks like a mistake.
10. Font weight fixed on hover vs weight increasing via variable font axis — the variable version feels alive without layout shift.
11. `<sup>` for a footnote marker vs properly sized and baseline-shifted superscript — the default `<sup>` is too large and throws line spacing.
12. `text-wrap: balance` on a 3-line headline that becomes awkwardly short on line 1 vs left-aligned with manual break — balance isn't always right.
13. Italic used for emphasis throughout a UI vs bold — italic is for citation and linguistic stress, bold is for UI emphasis; using italic for UI hierarchy is a publishing convention in the wrong context.
14. Font loaded in 8 weight/style combinations vs only the 3 actually used — the unused weights add page weight and slow render time with no benefit.
15. Underline used for non-link emphasis vs bold or colour — underline is a hyperlink affordance in digital interfaces; using it for emphasis trains users to try clicking it.
16. Ellipsis added manually as `...` in markup vs using the `…` unicode character or CSS `text-overflow: ellipsis` — the manual version breaks at exactly the wrong moment and doesn't respond to container width.

## Color Theory

1. 1px border on a card in light mode using `#e0e0e0` solid vs `rgba(0,0,0,0.08)` — the solid one looks pasted on, the alpha one recedes naturally.
2. 1px border in dark mode using `rgba(255,255,255,0.1)` vs `#2a2a2a` solid — the alpha version glows, the solid one sits quietly.
3. Single large drop shadow on a card vs three stacked shadows at different blur/opacity levels — the stacked version reads as physically real.
4. Hover state darkened by swapping to a hardcoded hex vs `color-mix(in oklch, var(--color) 85%, black)` — the hex version often shifts hue unexpectedly.
5. Blue at HSL 50% lightness vs yellow at HSL 50% lightness presented as "the same brightness" vs OKLCH equivalents — the HSL ones are clearly not equal perceptually.
6. Brand colour carried directly into dark mode vs desaturated by 20–30% — the full saturation version vibrates off the screen.
7. Dark mode layering hierarchy: when colors are flipped, you need to retain what is the "brightest" canvas (the lightest dark grey).
8. Light tint of a colour built by reducing opacity vs built with reduced chroma in OKLCH — the opacity version goes grey and lifeless.
9. Raw hex values used throughout a codebase vs semantic tokens (`--color-border-subtle`) — hardcoded values break the moment anything changes.
10. 3:1 contrast ratio dismissed as failing WCAG vs flagged as passing under APCA for large text (trick question: the specs disagree, context matters).
11. UI using blue tones with warm grey neutrals vs cool grey neutrals — the warm greys fight the blue, cool greys complement it.
12. Pure `#808080` used as a neutral vs a tinted neutral with a slight hue bias — the pure grey looks like a placeholder, the tinted one feels designed.
13. Success state shown in green on a UI that already uses green as the primary brand colour vs using a distinct confirmation colour — users can't tell if something is a primary action or a success state.
14. Disabled element styled with 40% opacity vs styled with a specific muted colour token — opacity-based disabled states can accidentally pass contrast checks on some backgrounds and fail on others; the token is predictable.

## Illustrations

1. Illustration with 2px strokes alongside icons with 1px strokes vs matched stroke weight throughout — the mismatch looks like two different products.
2. Scene with objects receding in one-point perspective mixed with a character in three-quarter view vs consistent perspective throughout — the mixed version reads as uncanny.
3. Figma community illustration pack dropped in with its own palette vs recoloured to match the UI's colour tokens — the unmatched version looks bolted on.
4. Full narrative scene illustration used inside a tooltip vs a spot illustration — the scene is too complex for the context.
5. Generic amorphous blob + character illustration vs a bespoke typographic treatment or no illustration — generic reads as "no budget or thought."
6. Illustration surrounded by forced whitespace vs illustration designed with intentional negative space — the forced version looks like a clip-art drop-in.
7. Illustration scaled up 3× from intended size vs redrawn for larger dimensions — scaled up, strokes are too thick and detail becomes coarse.
8. Illustration using 6 colours from across the brand palette vs limited to 3 colours — the reduced palette reads as intentional, the full palette reads as indecisive.
9. Shadow direction in an illustration inconsistent with the UI's shadow direction vs matched — opposing light sources create a subliminal wrongness.

## Layout

1. Inner card with the same border-radius as its parent vs inner radius calculated as outer minus padding — the matching radius creates a gap that looks wrong.
2. Spacing applied as `margin-bottom` on every child vs `gap` on the parent — margin leaves a trailing gap after the last item, gap doesn't.
3. Baseline grid applied to a dense data dashboard vs a long-form editorial layout (trick question: baseline grids shine in editorial, they're often overkill in product UI).
4. Container with no max-width on a wide monitor vs capped at 1200px with centred content — the full-width version creates unreadable line lengths and sparse layouts.
5. Breakpoints set at 768px and 1024px (device assumptions) vs breakpoints set where the content actually breaks — device-named breakpoints often miss the real problem.
6. 12-column grid used for a simple marketing page vs 8-column — 12 columns adds configuration overhead with no benefit at simple layouts.
7. Spacing inside a component using `margin` vs `gap` — margin bleeds outside the component boundary, gap stays contained.
8. Sticky header taking up 80px on a 667px viewport vs `max-height` constrained with `dvh` — the tall header leaves barely any content space on a phone in landscape.
9. Two-column layout that mirrors left and right equally vs one wider column offset by a narrower one — the asymmetric version creates tension and visual interest.
10. Fixed bottom CTA on mobile that sits over the last form field vs accounting for `env(safe-area-inset-bottom)` — the fixed element obscures content on phones with home indicators.
11. Full-bleed image with text overlaid directly vs text in a contained column beside or below — overlay requires a scrim, colour-matching, and contrast checks; beside it just works.

## Information Architecture

1. Progressive disclosure: all settings on a single scrollable page of 40 items vs grouped with a sidebar nav and progressive sections — the flat list has no hierarchy and buries everything equally.
2. "Delete" button placed directly beside "Confirm" vs separated with whitespace and a visual break — proximity implies equivalence.
3. A settings page with a toggle for "Enable async relay mode" vs renamed to "Send messages in the background" — internal naming vs user mental model.
4. Tabs used to separate "Account," "Billing," and "Notifications" vs same tabs used for "This week," "This month," "This year" (trick question: the first is arguably fine, the second is the textbook correct use of tabs).
5. Empty state that shows "No projects found" vs one that shows "You haven't created a project yet" with a "Create project" button — the second tells you why and what to do.
6. Onboarding that tours 8 UI features before you can do anything vs onboarding that creates your first item for you in one step — the tour teaches the product, the shortcut delivers value.
7. Navigation with 3 levels of nested dropdowns vs a flatter structure with breadcrumbs at depth — deep nesting makes users lose track of where they are.
8. Users consistently searching for "invoices" when the nav says "Billing" vs renaming to match — search data is IA feedback, not just a feature.
9. Error page that shows "Something went wrong" and a back button vs one that explains what went wrong and offers a specific recovery action — the generic version ends the user's journey, the specific one continues it.
10. Primary action buried at the bottom of a long page vs anchored persistently in view — users who don't scroll never find it, and scroll depth data will tell you most of them don't.

## Interaction

1. Hover state that only changes colour vs one that also shifts cursor and adds a subtle underline — confirmation of affordance vs decoration.
2. Focus ring removed with `outline: none` in CSS vs replaced with a custom `outline` plus `outline-offset: 2px` — the removed ring is an accessibility failure.
3. Button with no active/pressed state vs button that depresses slightly on click — the missing state makes it feel unresponsive.
4. Spinner shown during a long list load vs skeleton layout — the skeleton holds the page shape, the spinner collapses it.
5. Form submission that waits for server response before updating UI vs optimistic update that reverts on error — the optimistic version feels instant.
6. Search that fires a request on every keystroke vs debounced at 300ms — the unbounced version hammers the server and creates race conditions.
7. Touch target sized at 28×28px vs 44×44px — the small one causes mis-taps; the minimum is a guideline, not a suggestion.
8. Button that triggers an action immediately on `mousedown` vs `mouseup` — mousedown fires before the user has committed; they can't cancel by dragging away.
9. Input that auto-advances to the next field when full (like a verification code) vs waits for tab — auto-advance feels clever until someone wants to correct a digit.
10. Copy-to-clipboard button that changes to a checkmark for 1.5s vs one that stays as a clipboard icon — without feedback the user clicks it three more times to check it worked.
11. Slider that updates a value live on drag vs only on release — live update is almost always right; on-release feels disconnected and makes it hard to find the exact value.
12. Checkbox that requires clicking exactly on the box vs the label also toggling it — small hit target, unnecessary precision; the label association fix is one HTML attribute.
13. Error that appears above the form after submission vs inline next to the field that caused it — the top-of-form error makes users hunt, inline error is unambiguous.

## Timings

1. Hover transition at `400ms` vs `150ms` — the slow one feels like the UI is thinking, the fast one feels native.
2. List of 8 items all animating in at `t=0` vs staggered at 40ms intervals — simultaneous feels like a flash, staggered feels like arrival.
3. Anything over 400ms with no indicator vs same delay with a spinner or skeleton — without feedback users assume it's broken.
4. Page transition using `ease-in` vs `ease-out` — ease-in starts slow and feels like it's dragging off the screen.
5. List items exiting with `ease-out` vs `ease-in` — items leaving should accelerate away, not coast leisurely off screen.
6. No `prefers-reduced-motion` check vs same UI with motion disabled when the user has requested it — the unchecked version triggers vestibular symptoms in some users.

## Transitions

1. Modal appearing from the centre of the screen vs scaling up from the button that triggered it — the shared origin creates continuity.
2. Panel entering with `ease-in` vs `ease-out` — ease-out decelerates into place, ease-in arrives at full speed and feels abrupt.
3. Element entering and exiting with the same animation reversed vs asymmetric — enter should feel like arrival, exit should feel like departure, not arrival in reverse.
4. `transition: all 0.3s` vs `transition: opacity 0.3s, transform 0.3s` — "all" can accidentally animate width, height, or colour and cause layout recalculation.
5. Three elements transitioning independently and clashing vs choreographed so only one moves at a time — parallel competing motion creates visual noise.
6. Disable transitions when animating themes to avoid transitioning with different timings, as each component can have a different transition value. If you are using `next-themes` add the `disableTransitionOnChange` prop on the `ThemeProvider` for a global fix.

## Accessibility

1. `aria-label="icon"` on a search button vs `aria-label="Search"` — the first describes the element type, the second describes the action.
2. Error state shown only by turning the input border red vs red border plus error icon plus error message text — colour-only state is invisible to colourblind users.
3. `<div role="button" onClick={...}>` vs `<button onClick={...}>` — the div isn't focusable by keyboard without extra work; button gets it for free.
4. No skip link on a page with a long nav vs a visually hidden "Skip to content" link that appears on focus — keyboard users tab through every nav item on every page without it.
5. `<label>Name</label><input>` without a `for`/`id` connection vs properly associated label — clicking the label on the unconnected version doesn't focus the input.
6. Modal that lets focus escape to the page behind it vs one that traps focus within — background content becomes reachable and confusing to screen reader users.
7. Grid items reordered visually with `order: -1` in CSS vs DOM order matching visual order — screen readers follow DOM order, not visual order.
8. WCAG AA 4.5:1 contrast ratio as the only check vs also checking with APCA (trick question: APCA is more nuanced for large text and UI components; neither spec is complete alone).

## Copywriting

1. Button labelled "Submit" vs "Save changes" — generic vs specific; specific builds trust.
2. Error message reading "Invalid input" vs "Your email must include an @ symbol" — one names the problem, one tells you how to fix it.
3. Input with placeholder "Enter your email" as the only label vs a persistent label above the field — the placeholder disappears the moment they start typing, right when they need a reminder.
4. Empty state reading "No items" vs "You haven't added anything yet — start by creating a project" — the second gives context and a next step.
5. Navigation items in Title Case Throughout The Whole Product vs sentence case — title case on long labels reads like a legal document.
6. Notification reading "Your export is complete and ready for download from the exports section of your account" vs "Export ready, download it" — front-load the important word.
7. Button reading "Please confirm your selection before proceeding" vs "Confirm" — "please" apologises for asking; it's your product, own it.

## Components

1. Three equally weighted primary buttons in a row vs one primary, one secondary ghost, one text link — equal weight means no clear next action.
2. Input that looks the same in default, hover, focus, and error states vs each state visually distinct — users can't tell if the field is active or broken.
3. "New" label on a feature using a badge vs a tag — a badge implies a count, a tag implies a category; "new" is neither, it needs its own treatment.
4. Tooltip that appears on hover with a "Learn more" link inside it vs a popover triggered by click — tooltips can't contain interactive elements, the link is unreachable.
5. Data table with zebra striping but misaligned number columns vs no striping but right-aligned tabular numbers — alignment does the work striping was compensating for.
6. Toast notification that auto-dismisses after 2 seconds for all messages vs duration calculated from word count (roughly 200–250 words per minute) — short messages and long messages need different timing.
7. Entire card surface is an `<a>` tag vs card with a distinct CTA link — the full-card link makes text selection impossible and reads the entire card content to screen readers as one link.
