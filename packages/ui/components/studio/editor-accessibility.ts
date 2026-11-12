import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

/** Defaults compose with upstream editor props instead of replacing their handlers. */
export const EditorAccessibility = Extension.create<{ label: string }>({
  name: "coreEditorAccessibility",
  addOptions() {
    return { label: "Editor content" };
  },
  addProseMirrorPlugins() {
    const { editor, options } = this;
    return [
      new Plugin({
        key: new PluginKey("coreEditorAccessibility"),
        props: {
          attributes: (): Record<string, string> => ({
            "aria-label": options.label,
            "aria-multiline": "true",
            ...(editor.isEditable ? {} : { "aria-readonly": "true" }),
          }),
        },
      }),
    ];
  },
});
