import { Selection } from "@tiptap/pm/state";

import type { EditorState } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";

/**
 * The prompt a blank email shows in its first empty paragraph. It names
 * blocks the slash menu really offers (React Email's default commands).
 */
export const EMAIL_START_PLACEHOLDER =
  "Start writing, or press '/' to add a heading, button or columns";

/**
 * The class an empty paragraph takes while it shows the prompt. React
 * Email paints `p.is-empty` prompts at 30% opacity from an unlayered rule
 * that no utility outranks without `!`, so paragraphs take this class
 * instead and the editor draws the prompt in the muted text token.
 */
export const EMAIL_PROMPT_CLASS = "is-email-prompt";

/**
 * Tiptap's empty-node class for Email Studio. Headings keep React Email's
 * `is-empty`, since its heading view draws their "Heading 1" prompts.
 */
export function emailPlaceholderClass({
  node,
}: {
  node: { type: { name: string } };
}): string {
  return node.type.name === "paragraph" ? EMAIL_PROMPT_CLASS : "is-empty";
}

/**
 * Draws the prompt on the paragraph that carries {@link EMAIL_PROMPT_CLASS}:
 * the same placement as React Email's rule, in the semantic muted token at
 * full strength so it reads as a prompt with enough contrast.
 *
 * React Email paints the email body white with black text whatever the app
 * theme, as the sent email looks. The app's dark muted token is too faint on
 * that white, so the prompt paragraph pins the token to its light value from
 * `:root` in packages/ui/styles/globals.css (a test keeps the two equal).
 */
export const EMAIL_PROMPT_CLASSES = [
  "[&_p.is-email-prompt]:[--muted-foreground:oklch(0.45_0.008_265)]",
  "[&_p.is-email-prompt]:before:content-[attr(data-placeholder)]",
  "[&_p.is-email-prompt]:before:pointer-events-none",
  "[&_p.is-email-prompt]:before:float-left",
  "[&_p.is-email-prompt]:before:h-0",
  "[&_p.is-email-prompt]:before:text-muted-foreground",
].join(" ");

type EmailEditorView = {
  state?: EditorState;
  view?: EditorView;
};

/**
 * Moves the selection to a caret at the first place text can go, without
 * focusing the editor, changing the document or adding an undo step.
 *
 * Use it after loading new content: a selection carried over from the old
 * content means nothing in the new one, and a range would open React
 * Email's formatting bubble before anyone has selected text.
 */
export function placeCaretAtStart(editor: EmailEditorView): void {
  const { view } = editor;
  const state = view?.state ?? editor.state;
  if (!view || !state || typeof view.dispatch !== "function") return;
  const tr = state.tr
    .setSelection(Selection.atStart(state.doc))
    .setMeta("addToHistory", false)
    // React Email's trailing-node plugin would otherwise treat this as a
    // chance to append a paragraph, which would change the email.
    .setMeta("skipTrailingNode", true);
  view.dispatch(tr);
}

/**
 * React Email builds the email body after the editor starts, which leaves
 * the whole document selected instead of a cursor in the empty paragraph.
 * Tiptap's Placeholder marks only the empty block holding the cursor, so a
 * blank email showed no prompt until someone clicked into it, and a range
 * over text would open the formatting bubble on its own.
 *
 * This puts a caret at the start (see {@link placeCaretAtStart}). A cursor
 * that is already inside text is left where it is.
 */
export function revealEmptyPlaceholders(editor: EmailEditorView): void {
  const state = editor.view?.state ?? editor.state;
  if (!state) return;
  const { selection } = state;
  if (selection.empty && selection.$anchor.parent.inlineContent) return;
  placeCaretAtStart(editor);
}
