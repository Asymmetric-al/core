import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

/** Defaults compose with upstream editor props instead of replacing their handlers. */
export const EditorAccessibility = Extension.create<{ label: string }>({
  name: "coreEditorAccessibility",
  addOptions() {
    return { label: "Editor content" };
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("coreEditorAccessibility"),
        props: {
          attributes: {
            "aria-label": this.options.label,
            "aria-multiline": "true",
          },
        },
      }),
    ];
  },
});
