import assert from "node:assert/strict";

const matches = (actual, expected, exact = false) =>
  expected === undefined ||
  (expected instanceof RegExp
    ? expected.test(actual ?? "")
    : exact
      ? actual === expected
      : (actual ?? "").includes(expected));

export function setupPage(elements, options = {}) {
  const events = [];
  const all = [];
  const flatten = (entries, parent = null) => {
    for (const entry of entries) {
      entry.parent = parent;
      all.push(entry);
      flatten(entry.children ?? [], entry);
    }
  };
  flatten(elements);
  const visible = (entry) =>
    entry.visible !== false && (!entry.parent || visible(entry.parent));
  const descendant = (entry, parent) =>
    entry.parent === parent ||
    Boolean(entry.parent && descendant(entry.parent, parent));
  const scopeEntries = (scope) =>
    scope
      ? all.filter((entry) =>
          scope().some((parent) => descendant(entry, parent)),
        )
      : all;

  class Locator {
    constructor(resolve, description) {
      this.resolve = resolve;
      this.description = description;
    }
    first() {
      return new Locator(() => this.resolve().slice(0, 1), this.description);
    }
    and(other) {
      return new Locator(
        () => this.resolve().filter((entry) => other.resolve().includes(entry)),
        this.description,
      );
    }
    filter({ has, hasText }) {
      return new Locator(
        () =>
          this.resolve().filter(
            (entry) =>
              (!has ||
                has.resolve().some((child) => descendant(child, entry))) &&
              (!hasText || matches(entry.text, hasText)),
          ),
        this.description,
      );
    }
    getByRole(role, settings = {}) {
      return query("role", role, settings, this.resolve);
    }
    getByText(text, settings = {}) {
      return query("text", text, settings, this.resolve);
    }
    getByLabel(label, settings = {}) {
      return query("label", label, settings, this.resolve);
    }
    getByTestId(testId) {
      return query("testId", testId, { exact: true }, this.resolve);
    }
    locator(selector) {
      return css(selector, this.resolve);
    }
    async count() {
      return this.resolve().length;
    }
    async waitFor({ state = "visible", timeout } = {}) {
      events.push({ action: "wait", target: this.description, state, timeout });
      options.beforeWait?.(this.description, elements);
      const found = this.resolve();
      assert(found.length <= 1, `Ambiguous ${this.description}`);
      if (state === "hidden")
        assert(!found.some(visible), `Still visible: ${this.description}`);
      else assert(found.some(visible), `Missing visible: ${this.description}`);
    }
    async isVisible() {
      return this.resolve().some(visible);
    }
    async isEnabled() {
      const [entry] = this.resolve();
      return Boolean(entry && !entry.disabled);
    }
    async getAttribute(name) {
      return this.resolve()[0]?.attrs?.[name] ?? null;
    }
    async inputValue() {
      return this.resolve()[0]?.value ?? "";
    }
    async click() {
      const found = this.resolve().filter(visible);
      assert.equal(
        found.length,
        1,
        `Missing/ambiguous click: ${this.description}`,
      );
      const [entry] = found;
      assert(!entry.disabled, `Disabled: ${this.description}`);
      events.push({ action: "click", target: entry.name });
      if (!options.noEffects) entry.onClick?.();
    }
    async fill(value) {
      const [entry] = this.resolve();
      assert(entry && visible(entry) && !entry.disabled);
      entry.value = value;
      events.push({ action: "fill", target: entry.name, value });
      if (!options.noEffects) entry.onFill?.(value);
    }
  }
  const query = (kind, value, settings, scope) =>
    new Locator(
      () =>
        scopeEntries(scope).filter((entry) =>
          kind === "role"
            ? entry.role === value &&
              visible(entry) &&
              matches(entry.name, settings.name, settings.exact)
            : matches(entry[kind], value, settings.exact),
        ),
      kind === "role" ? `${value}:${settings.name ?? "*"}` : `${kind}:${value}`,
    );
  const css = (selector, scope) =>
    new Locator(
      () =>
        scopeEntries(scope).filter((entry) => {
          if (selector === ":enabled") return !entry.disabled;
          if (selector === ":visible") return visible(entry);
          const attribute = selector.match(/^\[([^=]+)="([^"]+)"\]$/);
          if (attribute) return entry.attrs?.[attribute[1]] === attribute[2];
          if (selector.startsWith("#"))
            return entry.attrs?.id === selector.slice(1);
          return entry.selector === selector;
        }),
      selector,
    );
  return {
    events,
    getByRole: (role, settings = {}) => query("role", role, settings),
    getByText: (text, settings = {}) => query("text", text, settings),
    getByLabel: (label, settings = {}) => query("label", label, settings),
    getByTestId: (testId) => query("testId", testId, { exact: true }),
    locator: (selector) => css(selector),
    viewportSize: () => ({ width: options.width ?? 1440, height: 1000 }),
    waitForTimeout: async () => {},
  };
}
