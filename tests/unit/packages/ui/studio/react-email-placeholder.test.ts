/** @vitest-environment jsdom */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  EMAIL_PROMPT_CLASS,
  EMAIL_PROMPT_CLASSES,
  EMAIL_START_PLACEHOLDER,
  emailPlaceholderClass,
  placeCaretAtStart,
  revealEmptyPlaceholders,
} from "../../../../../packages/ui/components/studio/react-email-placeholder";
// Tiptap is not hoisted to the repo root; use the copy packages/ui ships.
import {
  Editor,
  Node,
} from "../../../../../packages/ui/node_modules/@tiptap/core";
import { Placeholder } from "../../../../../packages/ui/node_modules/@tiptap/extension-placeholder";
import { AllSelection } from "../../../../../packages/ui/node_modules/@tiptap/pm/state";
import StarterKit from "../../../../../packages/ui/node_modules/@tiptap/starter-kit";

// React Email wraps the body in a container node, so the empty paragraph is
// a child of a top-level block, as in Email Studio.
const Container = Node.create({
  name: "container",
  group: "block",
  content: "block+",
  parseHTML: () => [{ tag: "div[data-type=container]" }],
  renderHTML: () => ["div", { "data-type": "container" }, 0],
});

let editor: Editor | undefined;

afterEach(() => {
  editor?.destroy();
  editor = undefined;
  document.body.replaceChildren();
});

function createEmptyEmailEditor() {
  const element = document.createElement("div");
  document.body.append(element);
  editor = new Editor({
    element,
    extensions: [
      // Tiptap's trailing node ignores React Email's skip flag; React
      // Email's own one honours it (and has nothing to add here).
      StarterKit.configure({ undoRedo: false, trailingNode: false }),
      Container,
      Placeholder.configure({
        placeholder: EMAIL_START_PLACEHOLDER,
        includeChildren: true,
        emptyNodeClass: emailPlaceholderClass,
      }),
    ],
    content: {
      type: "doc",
      content: [{ type: "container", content: [{ type: "paragraph" }] }],
    },
  });
  // React Email builds the body after the editor starts, leaving the whole
  // document selected rather than a cursor in the empty paragraph, so the
  // placeholder (which marks only the paragraph holding the cursor) is off.
  editor.view.dispatch(
    editor.state.tr.setSelection(new AllSelection(editor.state.doc)),
  );
  return { editor, element };
}

describe("revealEmptyPlaceholders", () => {
  it("shows the starting prompt on a blank email before anyone focuses it", () => {
    const { editor, element } = createEmptyEmailEditor();
    expect(element.querySelector(`p.${EMAIL_PROMPT_CLASS}`)).toBeNull();

    revealEmptyPlaceholders(editor);

    const paragraph = element.querySelector("p");
    expect(paragraph?.classList.contains(EMAIL_PROMPT_CLASS)).toBe(true);
    expect(paragraph?.getAttribute("data-placeholder")).toBe(
      EMAIL_START_PLACEHOLDER,
    );
    expect(editor.isFocused).toBe(false);
  });

  it("changes neither the document nor the undo history", () => {
    const { editor } = createEmptyEmailEditor();
    const before = JSON.stringify(editor.getJSON());
    let updates = 0;
    editor.on("update", () => {
      updates += 1;
    });

    revealEmptyPlaceholders(editor);

    expect(JSON.stringify(editor.getJSON())).toBe(before);
    expect(updates).toBe(0);
  });

  it("leaves a cursor already inside the text where it is", () => {
    const { editor } = createEmptyEmailEditor();
    editor.commands.setContent({
      type: "doc",
      content: [
        {
          type: "container",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "Hello" }] },
            { type: "paragraph" },
          ],
        },
      ],
    });
    editor.commands.setTextSelection(4);

    revealEmptyPlaceholders(editor);

    expect(editor.state.selection.anchor).toBe(4);
  });

  it("ignores an editor that has not mounted a view", () => {
    expect(() => revealEmptyPlaceholders({})).not.toThrow();
  });

  it("collapses a range over text that nobody selected, so no formatting bubble opens", () => {
    const { editor } = createEmptyEmailEditor();
    editor.commands.setContent({
      type: "doc",
      content: [
        {
          type: "container",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "Hello" }] },
          ],
        },
      ],
    });
    editor.commands.setTextSelection({ from: 2, to: 6 });

    revealEmptyPlaceholders(editor);

    expect(editor.state.selection.empty).toBe(true);
    expect(editor.isFocused).toBe(false);
  });

  it("marks the empty paragraph with its own class, out of React Email's faint rule", () => {
    // React Email paints `p.is-empty` prompts at 30% opacity in an
    // unlayered rule no utility can outrank without `!`; the prompt's own
    // class lets the shared editor style it with a semantic muted token.
    const { editor, element } = createEmptyEmailEditor();
    revealEmptyPlaceholders(editor);

    const paragraph = element.querySelector("p");
    expect(paragraph?.classList.contains("is-empty")).toBe(false);
    expect(EMAIL_PROMPT_CLASS).not.toBe("is-empty");
  });

  it("keeps React Email's class on empty headings, whose prompts it draws", () => {
    expect(emailPlaceholderClass({ node: { type: { name: "heading" } } })).toBe(
      "is-empty",
    );
    expect(
      emailPlaceholderClass({ node: { type: { name: "paragraph" } } }),
    ).toBe(EMAIL_PROMPT_CLASS);
  });

  it("names what to do on a blank email in plain words", () => {
    expect(EMAIL_START_PLACEHOLDER).toBe(
      "Start writing, or press '/' to add a heading, button or columns",
    );
  });

  describe("prompt colour on the email body", () => {
    const globalsCss = readFileSync(
      resolve(__dirname, "../../../../../packages/ui/styles/globals.css"),
      "utf8",
    );

    function lightMutedForeground(): string {
      const root = globalsCss.match(/:root\s*\{([\s\S]*?)\n\}/);
      const value = root?.[1]?.match(/--muted-foreground:\s*([^;]+);/)?.[1];
      if (!value) throw new Error("light --muted-foreground not found");
      return value.trim();
    }

    // OKLCH to WCAG relative luminance (via OKLab and linear sRGB).
    function luminance(oklch: string): number {
      const parts = oklch.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
      if (!parts) throw new Error(`not an oklch colour: ${oklch}`);
      const [l, c, h] = [Number(parts[1]), Number(parts[2]), Number(parts[3])];
      const a = c * Math.cos((h * Math.PI) / 180);
      const b = c * Math.sin((h * Math.PI) / 180);
      const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
      const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
      const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
      const r = 4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
      const g = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
      const bl = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_;
      const clamp = (v: number) => Math.min(1, Math.max(0, v));
      return 0.2126 * clamp(r) + 0.7152 * clamp(g) + 0.0722 * clamp(bl);
    }

    it("pins the muted token to its light value, since the email body stays white in dark mode", () => {
      // React Email paints the body white with black text whatever the app
      // theme, so the app's dark muted token would be too faint on it.
      const pinned = EMAIL_PROMPT_CLASSES.match(
        /\[&_p\.is-email-prompt\]:\[--muted-foreground:([^\]]+)\]/,
      )?.[1];
      expect(pinned?.replaceAll("_", " ")).toBe(lightMutedForeground());
      expect(EMAIL_PROMPT_CLASSES).toContain(
        "[&_p.is-email-prompt]:before:text-muted-foreground",
      );
    });

    it("draws the prompt with at least 4.5:1 contrast on the white body, without overrides", () => {
      const ratio = 1.05 / (luminance(lightMutedForeground()) + 0.05);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(EMAIL_PROMPT_CLASSES).not.toMatch(/!|opacity/);
    });
  });
});

describe("placeCaretAtStart", () => {
  function loadTemplate(editor: Editor) {
    editor.commands.setContent({
      type: "doc",
      content: [
        {
          type: "container",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "Hello" }] },
            { type: "paragraph", content: [{ type: "text", text: "World" }] },
          ],
        },
      ],
    });
  }

  it("puts a caret at the top of newly loaded content, even over an old cursor", () => {
    const { editor } = createEmptyEmailEditor();
    loadTemplate(editor);
    // A cursor left from the previous template maps to the end of the new one.
    editor.commands.setTextSelection(10);

    placeCaretAtStart(editor);

    expect(editor.state.selection.empty).toBe(true);
    expect(editor.state.selection.from).toBe(2);
    expect(editor.isFocused).toBe(false);
  });

  it("changes neither the document nor the undo history", () => {
    const { editor } = createEmptyEmailEditor();
    loadTemplate(editor);
    editor.commands.setTextSelection({ from: 2, to: 6 });
    const before = JSON.stringify(editor.getJSON());
    let updates = 0;
    editor.on("update", () => {
      updates += 1;
    });

    placeCaretAtStart(editor);

    expect(JSON.stringify(editor.getJSON())).toBe(before);
    expect(updates).toBe(0);
  });

  it("ignores an editor that has not mounted a view", () => {
    expect(() => placeCaretAtStart({})).not.toThrow();
  });
});
