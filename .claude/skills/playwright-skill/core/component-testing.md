# Component Testing

> **When to use**: Testing UI components in isolation (rendering, interactions, states) without the full application. Ideal for design systems, shared component libraries, and complex interactive widgets.
> **Prerequisites**: [core/configuration.md](configuration.md), [core/fixtures-and-hooks.md](fixtures-and-hooks.md)

## Quick Reference

```tsx
// src/components/Button.story.tsx: one named export per scenario
import { Button } from './Button';

export const Primary = () => <Button title="Submit" />;
export const Disabled = () => <Button title="Submit" disabled />;
```

```typescript
// tests/components/button.spec.ts: plain Playwright test, built-in `mount` fixture (1.62+)
import { test, expect } from '@playwright/test';

test('renders primary button', async ({ mount }) => {
  const component = await mount('components/Button/Primary');
  await expect(component.getByRole('button')).toHaveText('Submit');
});
```

```bash
npx playwright init-skills                       # installs Playwright's own component-testing skill
npx playwright test --project=components
```

## How Component Testing Works (1.62+)

A component test is a regular Playwright test against a small **gallery** page that your own dev server serves. There is no component-testing package, bundler integration or separate config.

- A **story** is a tiny wrapper component that puts the component under test into one scenario: hard-coded props, mock data, providers, recorded callbacks. Stories live next to the component in `*.story.tsx` (or `.ts`, `.jsx`, `.js`, `.vue`) files; each named export is one story.
- The **gallery** is one page (`playwright/gallery/index.html`) that exposes `window.mount({ story, props })` and `window.unmount()`, rendering the story into `#root`. It is framework-specific application code that you own.
- The **`mount(storyId, props?)` fixture** navigates to `baseURL` (the gallery), calls `window.mount`, and returns a `Locator` for `#root` with `update(props)` and `unmount()`.

Everything the component needs is set up **inside the story** (it runs in the browser). Everything the test asserts is observable **through the page**: DOM, URL, network.

**Legacy packages**: `@playwright/experimental-ct-react`, `-react17` and `-vue` let tests write JSX inline (`mount(<Button />)`). They are not published for Playwright 1.63+ (`-svelte` was removed in 1.59), so suites on them must stay pinned to 1.62 until migrated. JSX `mount()` calls do not type-check against 1.64's `mount(storyId, props?)`. See [Migrating From the Experimental Packages](#migrating-from-the-experimental-packages).

## Patterns

### 1. Setup: Gallery and Config

**Use when**: Adding component tests to a project.
**Avoid when**: You only need E2E tests against the running app.

The fastest setup is Playwright's own skill, which detects the framework and bundler, writes the gallery, adds the project and a first story and spec:

```bash
npx playwright init-skills
# then ask your coding agent: "Set up component testing using the playwright-component-testing skill."
```

To do it by hand on a Vite app, add a project whose `baseURL` is the gallery:

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'components',
      testDir: './tests/components',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173/playwright/gallery/index.html',
        serviceWorkers: 'block', // the app's service worker must not shadow page.route() mocks
        reuseContext: true,      // reuse the browser context per worker: much faster suites
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173/playwright/gallery/index.html',
    reuseExistingServer: !process.env.CI,
  },
});
```

The gallery for React + Vite (Vite serves any `.html` under the project root and `vite build` ignores it):

```html
<!-- playwright/gallery/index.html -->
<!DOCTYPE html>
<div id="root"></div>
<script type="module" src="./main.tsx"></script>
```

```tsx
// playwright/gallery/main.tsx
import { flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';
import '../../src/index.css'; // global CSS, the same way the app entry imports it

const stories = import.meta.glob('../../src/**/*.story.{tsx,jsx}');
const id = (f: string) => f.replace(/^(\.\.\/)+src\//, '').replace(/\.story\.\w+$/, '');

const find = (path: string) => Object.keys(stories).find(f => id(f) === path || id(f).endsWith('/' + path));

async function resolve(storyId: string) {
  const sep = storyId.lastIndexOf('/');
  const file = find(storyId.slice(0, sep));  // 'components/Button/Primary': file + named export
  if (file)
    return ((await stories[file]()) as Record<string, any>)[storyId.slice(sep + 1)];
  const single = find(storyId);              // 'components/Card.with-actions': one-story .vue file
  return single && ((await stories[single]()) as Record<string, any>).default;
}

const rootEl = document.getElementById('root')!;
let root: Root | undefined;
let renderError: unknown;

(window as any).mount = async ({ story, props }: { story: string, props?: Record<string, any> }) => {
  const Story = await resolve(story);
  if (!Story)
    throw new Error(`Unknown story: ${story}`);
  // React 19 reports render errors instead of throwing; capture them so mount() rejects.
  root ??= createRoot(rootEl, { onUncaughtError: error => { renderError = error; } });
  renderError = undefined;
  flushSync(() => root!.render(<Story {...props} />)); // reuse the root so update() keeps state
  if (renderError)
    throw renderError;
};

(window as any).unmount = async () => {
  root?.unmount();
  root = undefined;
};
```

For Vue, mount a reactive host once and swap its story and props refs, so `update()` re-renders in place:

```typescript
// playwright/gallery/main.ts (resolve() and the glob as above, with '../../src/**/*.story.{ts,js,vue}')
import { createApp, h, shallowRef, type App, type Component } from 'vue';

const story = shallowRef<Component | null>(null);
const props = shallowRef<Record<string, any>>({});
const host = { render: () => (story.value ? h(story.value, props.value) : null) };
let app: App | undefined;

(window as any).mount = async ({ story: id, props: next }: { story: string, props?: Record<string, any> }) => {
  const resolved = await resolve(id);
  if (!resolved)
    throw new Error(`Unknown story: ${id}`);
  story.value = resolved;
  props.value = next ?? {};
  if (!app) {
    app = createApp(host);
    app.mount('#root');
  }
};

(window as any).unmount = async () => {
  app?.unmount();
  app = undefined;
};
```

Not on Vite (Next.js, webpack)? Run a small standalone Vite server for the gallery and point `baseURL` and `webServer` at it.

### 2. Stories and Story IDs

**Use when**: Writing any component test.

- **Story id** = path under `src/` without `.story.*`, plus the export name: `src/components/Button.story.tsx` export `Primary` → `components/Button/Primary`. Any unique suffix works: `mount('Button/Primary')`. A `.story.vue` file is one story, addressed by its path: `components/Card.with-actions`.
- **One export per scenario.** `Primary`, `Disabled`, `Loading` read as a specification of the component. Prefer a new export over parameterizing an existing one.
- **Story ids are strings.** Renaming a story breaks specs at runtime, not compile time; `mount<typeof Story>` (Pattern 4) ties at least the props to the story.
- Open the gallery URL in a browser and run `await window.mount({ story: 'components/Button/Primary' })` in DevTools to see exactly what the test sees.

### 3. Interactions and Assertions

**Use when**: Verifying what a component renders and how it responds to the user.

`mount()` returns a locator for `#root`. Scope every query from it, and use web-first assertions:

```typescript
import { test, expect } from '@playwright/test';

test('dialog closes on Escape and returns focus', async ({ mount, page }) => {
  const component = await mount('components/Dialog/OpenWithTrigger');

  await expect(component.getByRole('dialog', { name: 'Delete project' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(component.getByRole('dialog')).toBeHidden();
  await expect(component.getByRole('button', { name: 'Open dialog' })).toBeFocused();
});
```

Use `page` for things outside the root: keyboard, mouse, viewport, and `page.route()`.

### 4. Props: Per-Test Values, Types and `update()`

**Use when**: One scenario is genuinely parametric (a boundary sweep), or you test a prop change on a live component.

Pass plain serializable props as the second argument; the gallery hands them to the story. Pass the story type to `mount` to type-check them:

```tsx
// src/components/Counter.story.tsx
import { Counter } from './Counter';

export const Default = ({ value = 0 }: { value?: number }) => <Counter value={value} />;
```

```typescript
import { test, expect } from '@playwright/test';
import type { Default } from '../../src/components/Counter.story';

test('re-renders on prop change without remounting', async ({ mount }) => {
  const component = await mount<typeof Default>('components/Counter/Default', { value: 1 });
  await expect(component.getByTestId('value')).toHaveText('1');

  await component.update({ value: 2 }); // same story, new props, state kept
  await expect(component.getByTestId('value')).toHaveText('2');
});
```

Vue stories that take props must also declare them at runtime, or Vue delivers them as attributes:

```typescript
// src/components/Button.story.ts
import { defineComponent, h } from 'vue';
import Button from './Button.vue';

export const WithTitle = defineComponent(
  (props: { title?: string }) => () => h(Button, { title: props.title ?? 'Default' }),
  { props: ['title'] },
);
```

Keep callbacks out of props. The documented contract is plain, serializable props; 1.64 happens to expose functions passed this way, but the call then runs in Node.js, outside the story, and the scenario is no longer visible in the gallery. Pattern 5 handles callbacks.

### 5. Events and Callbacks: Record State in the Story

**Use when**: The component reports something through a callback or event (`onChange`, `@update:expanded`).

The story owns the state and the callbacks, and records the outcome in a hidden input. The test acts and asserts on that input with `toHaveValue()`, which retries until the state lands:

```tsx
// src/components/Expandable.story.tsx
import { useState } from 'react';
import { Expandable } from './Expandable';

export const Stateful = () => {
  const [expanded, setExpanded] = useState(false);
  return <>
    <Expandable expanded={expanded} setExpanded={setExpanded} title="Details">Hidden text</Expandable>
    <form hidden><input data-testid="expanded" readOnly value={String(expanded)} /></form>
  </>;
};
```

```typescript
test('click toggles expanded', async ({ mount }) => {
  const component = await mount('components/Expandable/Stateful');
  await component.getByRole('button', { name: 'Details' }).click();
  await expect(component.getByTestId('expanded')).toHaveValue('true');
});
```

The same story in Vue:

```typescript
// src/components/Expandable.story.ts
import { defineComponent, h, ref } from 'vue';
import Expandable from './Expandable.vue';

export const Stateful = defineComponent(() => {
  const expanded = ref(false);
  return () => h('div', [
    h(Expandable, {
      'expanded': expanded.value,
      'onUpdate:expanded': (value: boolean) => expanded.value = value,
      'title': 'Details',
    }),
    h('form', { hidden: true }, [
      h('input', { 'data-testid': 'expanded', 'readonly': true, 'value': String(expanded.value) }),
    ]),
  ]);
});
```

- One `data-testid` input per observed value: `String(...)` for scalars, `JSON.stringify(...)` for payloads.
- Negative checks work the same way: act, then assert the value did **not** change.
- The recording is visible when you open the story in the gallery, so the story doubles as a manual test page.

### 6. Children and Slots: One Story per Composition

**Use when**: The component renders children (React) or slots (Vue).

There is no per-test JSX. Each composition worth testing becomes its own export:

```tsx
// src/components/Card.story.tsx
import { Card } from './Card';

export const WithActions = () => (
  <Card title="Invoice #42">
    <p>Due in 3 days</p>
    <button>Pay now</button>
  </Card>
);

export const Empty = () => <Card title="Invoice #42" />;
```

```typescript
test('renders children inside the card body', async ({ mount }) => {
  const component = await mount('components/Card/WithActions');
  await expect(component.getByRole('heading', { name: 'Invoice #42' })).toBeVisible();
  await expect(component.getByRole('button', { name: 'Pay now' })).toBeVisible();
});
```

For slot-heavy Vue scenarios, a single-file story is clearer than render functions:

```vue
<!-- src/components/Card.with-actions.story.vue: addressed as 'components/Card.with-actions' -->
<script setup lang="ts">
import Card from './Card.vue';
</script>

<template>
  <Card title="Invoice #42">
    <template #default><p>Due in 3 days</p></template>
    <template #actions><button>Pay now</button></template>
  </Card>
</template>
```

### 7. Providers, Context and Plugins

**Use when**: Components need a theme, store, router, i18n or query client.

Wrap stories in one shared decorator kept next to the stories, not inside the gallery, so each story shows what it depends on and can opt out:

```tsx
// src/stories/decorators.tsx
import type { ReactNode } from 'react';
import { ThemeProvider } from '../theme';

export function AppScaffold({ children, theme = 'light' }: { children: ReactNode, theme?: 'light' | 'dark' }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
```

```tsx
// src/components/ThemedBadge.story.tsx
import { AppScaffold } from '../stories/decorators';
import { ThemedBadge } from './ThemedBadge';

export const Dark = () => <AppScaffold theme="dark"><ThemedBadge label="New" /></AppScaffold>;
```

- Create clients (React Query, Apollo, Pinia) **inside** the story or decorator, so each `mount()` starts fresh.
- Vue plugins that must be installed with `app.use(...)` go in the gallery right after `createApp(...)`, mirroring the app's bootstrap.
- The body of `window.mount` replaces the old `beforeMount` / `afterMount` hooks for app-wide setup.

### 8. Network and Dependencies

**Use when**: The component fetches data or depends on a module you want to replace.

Register `page.route()` **before** `mount()`, because mounting navigates:

```typescript
test('shows an error when items fail to load', async ({ mount, page }) => {
  await page.route('**/api/items', route => route.fulfill({ status: 500 }));
  const component = await mount('components/ItemList/Default');
  await expect(component.getByRole('alert')).toContainText('Something went wrong');
});

test('renders items from the API', async ({ mount, page }) => {
  await page.route('**/api/items', route => route.fulfill({ json: [{ id: 1, name: 'Blue Mug' }] }));
  const component = await mount('components/ItemList/Default');
  await expect(component.getByRole('listitem')).toHaveText(['Blue Mug']);
});
```

There is no test-side module mocking: the component runs in the browser, built by your dev server. To replace a dependency, pass it in through the story (a prop or provider with a fake implementation), use your bundler's aliasing for the gallery, or start an MSW worker inside a story or decorator.

### 9. Visual Comparison

**Use when**: Locking down the look of design-system components and states.

Screenshot the returned root locator, not the page, and mount several stories per test cheaply:

```typescript
test('button states', async ({ mount }) => {
  await expect(await mount('components/Button/Primary')).toHaveScreenshot('primary.png');
  await expect(await mount('components/Button/Disabled')).toHaveScreenshot('disabled.png');
});
```

Keep the recording form `hidden` so it stays out of baselines. Baseline rules (OS, fonts, Docker) are in [visual-regression.md](visual-regression.md).

### 10. Component Test vs E2E Test

**Use when**: Deciding where a piece of UI behavior should be tested.

Component tests verify **how a component behaves in isolation**; E2E tests verify **how the system works together**. A loading button's disabled state and spinner belong in a component test; "saving the form persists the record and shows a toast" belongs in E2E. See [test-architecture.md](test-architecture.md).

## Decision Guide

| UI element | Component test | E2E test | Unit test |
|---|---|---|---|
| **Button** (variants, states, loading) | Yes: every variant, disabled, loading, click recording | Only as part of a larger flow | No: needs real DOM for styling and accessibility |
| **Form field** (validation, masking) | Yes: messages, masking, error states | Yes: full submission with backend | Validate-only logic (regex, formatters) |
| **Modal / dialog** | Yes: open/close, focus trap, Escape | Yes: the flow that opens it | No |
| **Data table** (sort, filter, paginate) | Yes: with routed mock data | Yes: real API data and URL sync | Pure sort/filter functions |
| **Navigation / menu** | Partially: dropdown behavior, active states | Yes: real route changes | No |
| **Full page** (dashboard, settings) | No: too much context; defeats isolation | Yes | No |
| **Chart** | Yes: visual regression of rendered output | Only in critical flows | Data transformation only |
| **Design-system primitives** | Yes: the primary use case | No | No |

**Rule of thumb**: component tests for behavior and appearance in isolation, E2E for user journeys across components and pages, unit tests for pure logic with no DOM.

## Migrating From the Experimental Packages

| `@playwright/experimental-ct-*` | Story gallery (1.62+) |
|---|---|
| `mount(<Button onClick={spy} />)` | Stateful story records the effect in a hidden input; test asserts `toHaveValue()` (Pattern 5) |
| Plain data props from the test | `mount(id, props)` (Pattern 4) |
| JSX children / slots in the test | One story export per composition (Pattern 6) |
| `component.update(<Button count={2} />)` | `component.update({ count: 2 })` |
| `beforeMount` / `afterMount` hooks | Body of the gallery's `window.mount`, or story decorators |
| `hooksConfig` | Props interpreted by the story |
| `router` fixture / MSW in Node.js | `page.route()` in the test, or MSW inside a story |
| `playwright/index.html` + `index.ts` | The gallery's `index.html` and entry module |
| `ctViteConfig`, `ctPort`, `ctTemplateDir`, `playwright-ct.config.ts` | Gone: your dev server, `webServer` and `baseURL` |
| `import { test } from '@playwright/experimental-ct-react'` | `import { test } from '@playwright/test'` |

Migrate incrementally while still pinned to 1.62: add the gallery and `components` project next to the old CT project, port spec by spec, then remove the experimental dependency, `playwright/index.*` and `playwright/.cache`, and upgrade. Full guide: [upstream migration section](https://playwright.dev/docs/test-components#migration-from-the-experimental-packages).

## Anti-Patterns

| Don't | Problem | Do instead |
|---|---|---|
| `mount(<Component />)` with JSX on 1.63+ | The experimental packages are gone; it doesn't type-check or run | A story plus `mount('path/Story')` |
| Pass callbacks or class instances as props | Outside the documented serializable-props contract; the behavior lives in Node.js instead of the story | Pattern 5: the story owns callbacks and records state |
| `component.click()` on the returned locator | It's the `#root` container, not your component | `component.getByRole('button').click()` |
| `page.route()` after `mount()` | Mounting navigates; the first requests already went out | Route first, then mount |
| Build providers into the gallery | Hides dependencies; stories can't opt out | Decorators in story files (Pattern 7) |
| Mount an entire page | Too much context; slow; defeats isolation | E2E for pages; component tests for widgets |
| Assert internal state or instance methods | Couples tests to implementation | Assert the DOM, or record effects in the story |
| Screenshot the page | Captures anything else in the gallery | Screenshot the returned root locator |

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `mount()` throws `Unknown story: ...` | Id doesn't match the file path + export, or the glob doesn't cover the file | Check the id grammar (Pattern 2) and the gallery's `import.meta.glob` |
| `The gallery page does not define window.mount().` | `baseURL` points at a page that isn't the gallery, or the gallery script failed to load | Set `baseURL` and `webServer.url` to `.../playwright/gallery/index.html`; check the gallery's console errors |
| ``mount() requires `baseURL` to point at the component gallery.`` | No `baseURL` in the project's `use` | Add `baseURL` for the components project (Pattern 1) |
| `mount()` succeeds but `#root` is empty, then a locator times out | A render error the gallery swallowed (React 19 reports instead of throwing) | Capture it with `onUncaughtError` and rethrow, as the Pattern 1 gallery does |
| Component renders unstyled | Global CSS not imported in the gallery entry | Import it in `playwright/gallery/main.*` like the app entry does |
| `update()` resets component state | The gallery recreates the root or app on each call | Reuse the root (React) or mount a reactive host once (Vue) |
| Vue story ignores props passed from the test | Props not declared at runtime | Add `{ props: [...] }` to `defineComponent` (Pattern 4) |
| `page.route()` mock is ignored | The app's service worker serves a cached response, or the route was added after `mount()` | `serviceWorkers: 'block'`; route before mount |
| `Cannot find module '@playwright/experimental-ct-react'` on 1.63+ | Package not published for 1.63+ | Migrate to stories, or pin the suite to Playwright 1.62 |
| useContext / inject returns undefined | Story doesn't wrap the component in its provider | Use the shared decorator (Pattern 7) |

## Related

- [core/visual-regression.md](visual-regression.md): screenshot baselines for component states
- [core/network-mocking.md](network-mocking.md): `page.route()` patterns
- [core/test-architecture.md](test-architecture.md): component vs E2E vs API
- [core/react.md](react.md), [core/vue.md](vue.md): framework recipes
- [Playwright component testing docs](https://playwright.dev/docs/test-components)
