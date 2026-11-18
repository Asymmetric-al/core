import { Extension } from "@asym/ui/components/shadcn/rich-text-editor";

import { hasOpenSuggestionList } from "./use-suggestion-renderer";

const isSendKey = (event: KeyboardEvent) =>
  event.key === "Enter" &&
  (event.ctrlKey || event.metaKey) &&
  !event.altKey &&
  !event.shiftKey;

/**
 * Leaves Cmd/Ctrl+Enter to the composer's send shortcut. The shared editor
 * binds it to a line break, and a key binding that runs takes the key away
 * from the page. Shift+Enter still adds a line break.
 */
export const SendShortcutPassthrough = Extension.create({
  name: "supportSendShortcutPassthrough",
  onBeforeCreate() {
    this.editor.on("mount", ({ editor }) => {
      // A DOM event handler that returns true skips ProseMirror's key
      // bindings without preventing the default, so the key bubbles on.
      // An open / or @ list keeps the key to insert its highlighted item.
      editor.view.setProps({
        handleDOMEvents: {
          ...editor.view.props.handleDOMEvents,
          keydown: (view, event) =>
            isSendKey(event) && !hasOpenSuggestionList(view.dom),
        },
      });
    });
  },
});
