# Tasteful Web Animation — Skill

**Name:** `anim`
**Purpose:** Tasteful, subtle web animations following Emil Kowalski's philosophy and animations.dev principles. Use this skill when adding motion to interfaces — hover states, page transitions, micro-interactions, loading states, or any UI animation — so motion stays refined and purposeful, not decorative noise.

**Applies when:** Adding or reviewing UI motion (CSS, Web APIs, or React); hover and press feedback; entrances/exits; modals, toasts, menus; loading and skeleton patterns; staggered reveals; page or view transitions.

**Do not use when:** Motion would hurt clarity or accessibility; the task is only `motion/react` plumbing — pair with the `motion` skill for API specifics. Skip motion for validation errors, critical errors, actively read content, and high-frequency live updates.

## Workflow

1. Decide what the motion communicates (feedback, hierarchy, spatial continuity) — not decoration.
2. Choose a duration tier: micro-interactions 150–250ms, standard transitions 200–350ms, orchestrations 400–600ms total; keep total under ~1s unless it is true loading feedback.
3. Animate **transform** and **opacity** when possible; entrance **ease-out**, exit **ease-in**, exit **faster** than entrance; pair opacity with a small translate for entrances.
4. Define **reduced-motion** behavior (`prefers-reduced-motion` or `useReducedMotion`); avoid layout-affecting properties and animating on every re-render.
5. Validate at 2× and 0.5× speed, check exits, and sanity-check on lower-end hardware.

## Core Philosophy

**Animation should be invisible.** When done right, users don't notice animation — they notice that the interface feels _good_. The moment someone says "nice animation," you've probably overdone it.

> "The best animations are the ones you don't notice." — Emil Kowalski

## The 40 Rules of Tasteful Animation

### Timing & Duration

1. **Micro-interactions: 150-250ms.** Hovers, button presses, toggles. Anything faster feels instant (good); anything slower feels sluggish (bad).

2. **Standard transitions: 200-350ms.** Modals opening, panels sliding, content appearing. This is your bread and butter.

3. **Complex orchestrations: 400-600ms total.** Page transitions, multi-step reveals. Never longer unless you have a very good reason.

4. **Exit animations should be faster than entrances.** Users are waiting to do something next. Enter at 300ms, exit at 200ms.

5. **Stagger delays: 30-60ms between items.** Longer staggers (100ms+) feel like a slideshow. Keep it tight.

6. **Never animate for more than 1 second total.** If your animation takes longer, it's not an animation - it's a loading screen.

### Easing & Physics

7. **Default to ease-out for entrances.** Elements arriving should decelerate naturally, like a car pulling into a parking spot.

8. **Use ease-in for exits.** Elements leaving should accelerate away, like releasing a bowstring.

9. **Use ease-in-out sparingly.** Only for elements that move from point A to point B while staying on screen (dragging, repositioning).

10. **Never use linear easing for UI.** Linear is for progress bars and looping background animations only. Real objects don't move linearly.

11. **Prefer spring physics for organic motion.** Springs have natural overshoot and settle. In Motion for React, use `transition={{ type: "spring", stiffness: 400, damping: 25 }}` (tune as needed); in CSS, use `cubic-bezier()` or `linear()` curves that approximate a spring.

12. **Match easing to physical metaphor.** Dropping? Ease-in with bounce. Rising? Ease-out. Sliding? Ease-in-out.

13. **Consistent easing across related elements.** If a modal and its backdrop animate together, they must use the same curve.

### What to Animate

14. **Animate transform and opacity only (when possible).** These are GPU-accelerated and won't cause layout thrashing.

15. **Never animate width, height, top, left, margin, or padding.** These trigger expensive layout recalculations. Use transform: scale() or translate() instead.

16. **Animate from a definite state to a definite state.** Never animate to/from `auto` or computed values without measuring first.

17. **Scale from center for growth, from origin for menus.** Dropdowns scale from their trigger. Modals scale from center. Be intentional.

18. **Opacity changes should accompany movement.** Don't just fade - fade AND move. `opacity: 0` + `translateY(8px)` → `opacity: 1` + `translateY(0)`.

19. **Keep movement distances small.** 4-16px for micro-interactions. 20-40px for larger reveals. Anything more looks cartoony.

### Interaction States

20. **Hover: instant on, 150ms off.** Respond immediately when hovering; ease out when leaving so it doesn't "snap" away.

21. **Active/pressed: scale(0.97-0.98).** Subtle compression. Never go below 0.95 - that's cartoon territory.

22. **Focus: never animate the focus ring itself.** Focus indicators are for accessibility. Animate the element, not the indicator.

23. **Disabled elements: no animation.** Disabled means disabled. Don't tease users with hover effects on things they can't click.

24. **Loading states: subtle pulse or skeleton shimmer.** Not spinners unless absolutely necessary. Keep the rhythm calm.

### Entrance & Exit Patterns

25. **Fade + rise for content appearing.** `opacity: 0, y: 8` → `opacity: 1, y: 0`. The classic for a reason.

26. **Fade + sink for content disappearing.** Reverse is not always best. Sometimes exit down, not up, for natural gravity.

27. **Scale for emphasis, translate for navigation.** Opening something important? Scale. Moving to a new view? Slide.

28. **Modals: scale(0.96) + opacity, not scale(0).** Starting from nothing looks cheap. Start nearly there.

29. **Toasts: slide from edge + fade.** Come from where they'll return to. Slide in from right, slide out to right.

30. **Menus: transform-origin at trigger, scale + opacity.** Dropdowns should bloom from their source.

### Orchestration & Staggering

31. **Lead with the most important element.** In a stagger sequence, the primary content animates first.

32. **Background elements animate first, foreground last.** Backdrop → container → content → actions.

33. **Use stagger for related items only.** A list of cards? Stagger. Unrelated UI elements? Animate together.

34. **Keep stagger groups small (3-7 items).** More than that and the last item waits too long.

35. **Exit in reverse order or all-at-once.** Either mirror the entrance stagger (last in, first out) or don't stagger exits at all.

### Performance & Accessibility

36. **Always respect `prefers-reduced-motion`.** Not optional. Wrap motion in `@media (prefers-reduced-motion: no-preference)` or check the query in JS.

37. **Use `will-change` only when needed, remove after.** Apply before animation starts, remove after it ends. Never leave it on permanently.

38. **Avoid animating during scroll.** Scroll-linked animations can jank. Use `scroll-timeline` or Intersection Observer sparingly.

39. **Test on low-end devices.** That buttery M3 Mac animation becomes a slideshow on a $200 Android.

40. **Don't animate layout on mobile.** Mobile browsers struggle with layout animations. Keep it to transforms and opacity.

## CSS Implementation Patterns

### Standard Transition Setup

```css
.element {
  transition:
    transform 200ms ease-out,
    opacity 200ms ease-out;
}

/* Hover: instant on, fade off */
.element:hover {
  transform: translateY(-2px);
  transition-duration: 0ms; /* instant on */
}
.element:not(:hover) {
  transition-duration: 150ms; /* ease off */
}
```

### Fade + Rise Entrance

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.entering {
  animation: fadeInUp 250ms ease-out forwards;
}
```

### Spring-like Easing (CSS)

```css
/* Approximated spring curve */
:root {
  --spring-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --spring-smooth: cubic-bezier(0.22, 1, 0.36, 1);
  --spring-snappy: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Stagger Pattern

```css
.item {
  animation: fadeInUp 200ms ease-out backwards;
}
.item:nth-child(1) {
  animation-delay: 0ms;
}
.item:nth-child(2) {
  animation-delay: 40ms;
}
.item:nth-child(3) {
  animation-delay: 80ms;
}
.item:nth-child(4) {
  animation-delay: 120ms;
}
.item:nth-child(5) {
  animation-delay: 160ms;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Motion (Framer Motion) Patterns

### Fade + Rise

```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 4 }}
  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
/>
```

### Spring Physics

```tsx
<motion.div
  animate={{ scale: 1 }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
/>
```

### Stagger Children

```tsx
<motion.ul
  initial="hidden"
  animate="visible"
  variants={{
    visible: { transition: { staggerChildren: 0.04 } },
  }}
>
  {items.map((item) => (
    <motion.li
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0 },
      }}
    />
  ))}
</motion.ul>
```

### Exit Before Enter (AnimatePresence)

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={currentView}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15 }}
  />
</AnimatePresence>
```

## Common Mistakes to Avoid

- **Bouncy everything.** Bounce is for celebration (confetti, success). Not for opening menus.
- **Slow fades.** If opacity takes more than 200ms, it feels like lag, not elegance.
- **Scale(0) to scale(1).** Looks like things popping into existence from nothing. Start at 0.95+.
- **Inconsistent directions.** If modals enter from bottom, they exit to bottom. Pick a direction and commit.
- **Animating on mount unconditionally.** First page load? Maybe. Every re-render? Definitely not.
- **Forgetting exit animations.** Things snapping away is jarring. Every entrance needs an exit strategy.
- **Using animation to hide slow code.** If you're animating to mask loading, fix the loading instead.
- **Too many things moving at once.** One focal animation, everything else is secondary or static.

## When NOT to Animate

- Form validation errors (use color/icon changes instead)
- Critical error states (don't delay bad news)
- Content the user is actively reading
- High-frequency updates (live data, timers)
- Anything the user will see hundreds of times per session

## Checklists

### Implementation checklist

- [ ] Durations within recommended bands; exits faster than entrances where relevant
- [ ] Primarily transform + opacity (exceptions documented)
- [ ] Reduced motion behavior defined and tested
- [ ] Stagger only for related groups; small counts (about 3–7)

### Review checklist

- [ ] Motion supports the task; it is not the main attraction
- [ ] No motion used to mask slow loads or errors

### Testing checklist

- [ ] Does it feel good at 2x speed? (If not, it's too slow)
- [ ] Does it feel good at 0.5x speed? (If not, it's too fast or lacks easing)
- [ ] Does it work with reduced motion enabled?
- [ ] Does the exit feel as considered as the entrance?
- [ ] Would a user notice if you removed it? (If yes, reconsider)
- [ ] Does it work on a $200 Android phone?

## Shared implementation (this monorepo)

- **`@asym/lib/motion-presets`** — canonical durations, easings, stagger steps, `SCALE_ENTRANCE` (0.96), and helpers (`propsHeroEntrance`, `propsFadeRiseInView`, `propsScaleFadeInView`) that respect `useReducedMotion()`. Prefer importing these in client components next to `@asym/lib/motion` or `motion/react`.
- **`@asym/lib/motion`** — re-exports `useReducedMotion` for LazyMotion trees.

## Common mistakes / pitfalls

- Linear easing on interactive UI
- Animating layout properties on mobile or in lists
- Ignoring exit choreography
- Staggering unrelated elements or long lists
- Hover/press feedback on disabled controls

---

_"Animation is not about moving things. It's about not making users wait."_ — Emil Kowalski
