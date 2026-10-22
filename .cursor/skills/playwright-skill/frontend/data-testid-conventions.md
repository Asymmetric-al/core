# Frontend `data-testid` Conventions

> **When to use**: When authoring or reviewing UI components, or whenever a test/AI agent needs a durable handle on an element.
> **Audience**: frontend engineers writing the app (not test authors).
> **Companion**: [examples.md](examples.md) for framework code; [../core/locators.md](../core/locators.md) for the consumer side.

A `data-testid` is a **public API for your UI's automation layer**. Once a test or an agent depends on `data-testid="login-submit"`, renaming it is a breaking change. Treat these attributes with the same care as a function signature: deliberate, named well, unique, and stable across refactors.

## TL;DR

1. **Semantic HTML first.** Before adding a test ID, give the element a real role, label, or accessible name. An accessible button is locatable *and* usable by screen readers. (See [Locator priority](#locator-priority-build-this-in-order).)
2. **Add `data-testid` only where role, label and text fall short** — custom components with no semantic role, scope containers, list rows, and dynamic, localized or async regions. A control `getByRole` already finds uniquely needs none. (See [When to add](#when-to-add-a-data-testid).)
3. **Name for global uniqueness**: `kebab-case`, namespaced by feature/component: `feature-component-element[-variant]`. (See [Naming convention](#naming-convention).)
4. **In lists, suffix with a stable domain ID — never the array index.** `user-row-${user.id}` ✅ / `user-row-${index}` ❌. (See [Uniqueness in lists](#uniqueness-in-lists-and-loops).)
5. **Never tie the value to text, locale, copy, styling, or DOM position.** (See [Stability rules](#stability-rules).)
6. The consumer (Playwright) reads these via `getByTestId()`, configured by `testIdAttribute` (default `data-testid`). (See [Consumer config](#how-the-consumer-uses-them).)

---

## Locator priority (build this in order)

Locate elements in this order (most → least preferred), the same order [core/locator-strategy.md](../core/locator-strategy.md) uses. Playwright itself recommends role locators first and CSS/XPath last. As the **author of the markup**, your goal is to make the *higher* tiers possible, and only fall to `data-testid` when they genuinely don't fit.

| Priority | Strategy | What you provide in markup | Notes |
|---|---|---|---|
| 1 | **Role + accessible name** | semantic element (`<button>`, `<a href>`, `<nav>`, `<h1>`) or `role=` + `aria-label` | Playwright: "the closest way to how users and assistive technology perceive the page". Preferred for all interactive elements. |
| 2 | **Label** | `<label for>` / wrapping `<label>` / `aria-labelledby` on form fields | Also makes the field accessible. |
| 3 | **Placeholder** | `placeholder=""` | Yellow flag — placeholders disappear on input; prefer a label. |
| 4 | **Text** | visible text content | For static, non-interactive content. Fragile under i18n. |
| 5 | **Alt / Title** | `alt=""` on images, `title=""` | |
| 6 | **Test ID** | `data-testid="..."` | Playwright: "the most resilient way of testing as even if your text or role of the attribute changes, the test will still pass." But it is **not user-facing**. |
| 7 | **CSS / XPath** | — | **Never design for this.** Playwright: "CSS and XPath are not recommended as the DOM can often change leading to non resilient tests." |

> Playwright's own caution, quoted: *"However testing by test ids is not user facing. If the role or text value is important to you then consider using user facing locators such as role and text locators."*

**The mental model for an engineer:** a `data-testid` is the **most stable** anchor (it survives copy changes, redesigns, role changes), which is why it's the right tool where role and text cannot give a unique, stable handle. It is not the default: when `getByRole` finds an element uniquely, tests should use that and the markup needs no test ID. Stability is also not a license to skip accessibility.

---

## When to add a `data-testid`

Add one when **at least one** of these is true:

- **It's a control whose role and name are not unique or stable** — several identical "Edit" buttons with no container to scope into, or an icon button whose accessible name is localized.
- **It has no usable semantic role** — custom `<div>`/`<span>` widgets, canvas/SVG charts, drag handles, third-party-wrapped components, design-system primitives.
- **It's a region/container you need to scope into** — a modal, a card, a table, a toast container, a specific list row. Scoping locators (`getByTestId('cart-summary').getByRole('button', { name: 'Checkout' })`) is one of the highest-value uses.
- **Its text/role is dynamic or localized** — status badges, i18n strings, time/relative dates — where text-based locators would be flaky.
- **It appears asynchronously** — content loaded after a fetch, lazy-loaded sections, optimistic-UI nodes — give the agent a stable thing to wait for.

### When NOT to add one

- **Decorative / layout-only elements** — wrappers, spacers, purely presentational `<div>`s nothing interacts with.
- **Every single element.** Test-ID soup is noise; it bloats markup and signals nothing. Add IDs at the elements automation actually targets, plus the containers used to scope them.
- **As a substitute for accessibility.** If you're tempted to add `data-testid` to a `<div onClick>`, first convert it to a `<button>` (or add `role`/`aria-label`). You get a better app *and* a `getByRole` locator for free.
- **On something already locatable by a unique role + name.** Tests should use `getByRole` there; see [core/locator-strategy.md](../core/locator-strategy.md).

---

## Naming convention

The value must be **globally unique on any page it can appear on**, human-readable, and stable. Use this format:

```
data-testid="<feature>-<component>-<element>[-<variant-or-id>]"
```

Rules:

- **`kebab-case`, lowercase, ASCII**, words separated by `-`. No spaces, no camelCase, no snake_case (consistency makes them greppable and predictable for agents).
- **Namespace by feature/component** so the same element name in two features never collides: `login-form-submit` vs `signup-form-submit`.
- **Describe purpose, not appearance.** `cart-checkout-button` ✅, not `cart-blue-btn` ❌.
- **Keep it short but unambiguous.** 2–4 segments is the sweet spot.
- **Suffix element role when helpful**: `-button`, `-input`, `-link`, `-list`, `-item`, `-error`, `-toggle`, `-menu`, `-dialog`.

Examples:

| Element | `data-testid` |
|---|---|
| Email field on the login form | `login-form-email-input` |
| Submit button on the login form | `login-form-submit-button` |
| Inline validation error under email | `login-form-email-error` |
| "Settings" link in the main nav | `nav-main-settings-link` |
| The cart summary panel (container) | `cart-summary-panel` |
| A product card (one of many) | `product-card-${product.sku}` |
| Delete button inside that card | `product-card-${product.sku}-delete-button` |
| A toast notification | `toast-${toast.id}` |

> **Tip — centralize the strings.** Export test-id constants/helpers from one module (e.g. `testIds.ts`) so the app and the tests share one source of truth and renames are a single edit. See [examples.md](examples.md#centralizing-test-ids).

---

## Uniqueness in lists and loops

This is the #1 source of flaky, ambiguous locators. When you render a collection, the test ID **must include a stable domain identifier from the data**, never the loop index.

```jsx
// ❌ index is positional — reorder/insert/delete shifts every ID, and it
//    re-numbers on every render. Locators become ambiguous or wrong.
{users.map((user, i) => (
  <tr data-testid={`user-row-${i}`}>...</tr>
))}

// ✅ stable, unique, survives reordering and pagination
{users.map((user) => (
  <tr data-testid={`user-row-${user.id}`}>
    <td data-testid={`user-row-${user.id}-name`}>{user.name}</td>
    <td>
      <button data-testid={`user-row-${user.id}-delete-button`}>Delete</button>
    </td>
  </tr>
))}
```

Now an agent can target one exact row: `getByTestId('user-row-42-delete-button')`, or scope into it: `getByTestId('user-row-42').getByRole('button', { name: 'Delete' })`.

- Use the **business/entity key** (`user.id`, `product.sku`, `order.number`, `slug`). It must be stable and unique within the page.
- If the data genuinely has no stable key, the ID on the *container* plus a semantic locator inside (`.filter({ hasText })`) is better than an index-based test ID.
- **Never** use `Math.random()` or a render-time counter — the value must be deterministic across renders and across test runs.

### Selecting the whole collection

Unique row IDs leave no shared handle for "all rows", for example to assert a count. A prefix does not work either: `/^user-row-/` also matches `user-row-42-name` and `user-row-42-delete-button`. Use one of these instead of a second, non-unique attribute (such as `data-testclass`), which `getByTestId()` cannot read and would push tests back to CSS selectors:

```ts
// Container test ID + role inside it (preferred)
await expect(page.getByTestId('users-table').getByRole('row')).toHaveCount(5);

// Or an anchored pattern that matches row IDs only
await expect(page.getByTestId(/^user-row-\d+$/)).toHaveCount(5);
```

---

## Stability rules

A `data-testid` earns its keep only if it **does not change for the wrong reasons**. Decouple the value from everything volatile:

- **Independent of copy/text** — `data-testid` stays `submit-button` whether the label says "Submit", "Save", or "Guardar".
- **Independent of locale/i18n** — never interpolate translated strings into the value.
- **Independent of styling** — no color, size, or CSS-class names in the value.
- **Independent of DOM position** — no "first", "second", "top"; use a domain key instead.
- **Stable across refactors** — moving a component or changing its tag should not change its test ID. This is the whole point: it's the anchor that *survives* refactors.
- **Deterministic** — same inputs → same value, every render, every environment. No randomness, no timestamps.
- **One element, one ID** — don't reuse the same `data-testid` on multiple elements (breaks strict-mode locators). Uniqueness comes from the namespacing above plus the entity key in lists.

---

## How the consumer uses them

Test authors / AI agents locate your elements via Playwright's `getByTestId()`, which reads the attribute named by `testIdAttribute` (default `data-testid`):

```ts
// playwright.config.ts — only change this if your team standardizes on
// a different attribute (e.g. data-test, data-qa, data-pw).
import { defineConfig } from '@playwright/test';
export default defineConfig({
  use: { testIdAttribute: 'data-testid' }, // default
});
```

```ts
// Consuming your markup:
await page.getByTestId('login-form-email-input').fill('user@example.com');
await page.getByTestId('login-form-submit-button').click();

// Scoping into a container you exposed:
const row = page.getByTestId('user-row-42');
await row.getByRole('button', { name: 'Delete' }).click();
```

**Agreement to make with your test team:** pick **one** attribute name (`data-testid` is the default and recommended) and use it everywhere. Mixing `data-test`, `data-qa`, and `data-testid` defeats `getByTestId` and forces brittle CSS.

> **Production stripping (optional):** if you don't want test IDs shipped to production, strip them at build time with a Babel/SWC plugin (e.g. `babel-plugin-react-remove-properties` with `{ properties: ['data-testid'] }`) — but **keep them in every environment your tests/agents run against** (dev, CI, staging). Stripping in the environment under test removes the locators you just built. See [examples.md](examples.md#production-stripping-optional).

---

## Review checklist

Use this when writing or reviewing a component:

- [ ] Interactive elements use **semantic HTML / ARIA** first (so `getByRole`/`getByLabel` work).
- [ ] `data-testid` added only where role/label/text fall short: no-role custom widgets, scope containers, list rows, dynamic or localized regions.
- [ ] No `data-testid` on purely decorative/layout nodes.
- [ ] Every value follows `feature-component-element[-variant]` in `kebab-case`.
- [ ] List/loop IDs use a **stable domain key**, not the array index.
- [ ] No value derives from text, locale, CSS, color, or DOM position.
- [ ] No duplicate `data-testid` on the page (one element ↔ one ID).
- [ ] Test-id strings are centralized/shared with the test suite where practical.
- [ ] Attribute name matches the team's `testIdAttribute` (default `data-testid`).

---

## Anti-patterns

| Don't | Why it breaks | Do instead |
|---|---|---|
| `data-testid="btn"` on 12 buttons | Not unique → strict-mode violations / wrong match | Namespace: `checkout-pay-button`, `cart-clear-button` |
| ``data-testid={`row-${index}`}`` | Reorders/paginates → IDs shift | `row-${item.id}` |
| `data-testid="blue-large-cta"` | Tied to styling → renamed on redesign | `signup-cta-button` |
| `data-testid={t('submit')}` | Tied to locale → breaks per language | `submit-button` (constant) |
| `<div onClick={...} data-testid="save">` | Skips accessibility; not keyboard-usable | `<button data-testid="save">` → also `getByRole('button')` |
| `data-testid` on every `<div>` | Markup noise, no signal, perf/bundle cost | Add only at no-role widgets, scope containers and list rows |
| Mixing `data-test`, `data-qa`, `data-testid` | `getByTestId` reads only one attribute | Standardize on `data-testid` |
| ``data-testid={`id-${Math.random()}`}`` | Non-deterministic across renders/runs | Use a stable entity key |
| Stripping `data-testid` in the tested env | Deletes the locators you built | Strip only in true production, keep in CI/staging |

---

## Related

- [examples.md](examples.md) — copy-paste patterns for React/JSX, Vue, Angular, Svelte; centralizing IDs; production stripping config.
- [../core/locators.md](../core/locators.md) / [../core/locator-strategy.md](../core/locator-strategy.md) — choosing locators when *writing tests*.
- Playwright official docs: [Locators](https://playwright.dev/docs/locators), [Best Practices](https://playwright.dev/docs/best-practices).
