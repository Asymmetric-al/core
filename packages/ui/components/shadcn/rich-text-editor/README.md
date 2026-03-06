# Rich Text Editor

A reusable rich text editor built on [TipTap v3](https://tiptap.dev), React, and shadcn/ui.

It gives you an editable area with a toolbar, link editing, resizable images, and a read-only viewer — all as composable pieces you put together yourself.

## Public API

Everything you need is exported from the barrel file:

```ts
import {
  RichTextEditor, // Wrapper — creates the editor, provides context
  EditorContent, // The editable area
  EditorToolbar, // Formatting toolbar
  RichTextViewer, // Read-only display
  useEditorContext, // Access the editor instance from any child
} from "@/components/rich-text-editor";
```

Types: `RichTextEditorProps`, `EditorToolbarProps`, `ToolbarTool`, `RichTextViewerProps`.

---

## Usage

### Basic

```tsx
const [content, setContent] = useState("");

<RichTextEditor value={content} onChange={setContent}>
  <EditorToolbar />
  <EditorContent />
</RichTextEditor>;
```

This renders a full toolbar (bold, italic, underline, headings, lists, link, undo, redo) with the editable area below it.

### Minimal toolbar

Use the `tools` prop to pick which buttons show up:

```tsx
<RichTextEditor value={content} onChange={setContent}>
  <EditorToolbar tools={["bold", "italic", "underline", "link"]} />
  <EditorContent />
</RichTextEditor>
```

Available tools: `bold`, `italic`, `underline`, `heading`, `blockquote`, `bulletList`, `orderedList`, `link`, `image`, `undo`, `redo`.

### With image upload

Pass an `onImageUpload` function that receives a `File` and returns the uploaded URL. The toolbar handles the file picker and loading state — your function handles the actual upload.

```tsx
async function uploadImage(file: File): Promise<string> {
  const { url } = await uploadToStorage(file); // your logic
  return url;
}

<RichTextEditor value={content} onChange={setContent}>
  <EditorToolbar onImageUpload={uploadImage} />
  <EditorContent />
</RichTextEditor>;
```

The image button only appears when `onImageUpload` is provided (or when `"image"` is in `tools` and `onImageUpload` exists). Uploaded images are resizable via drag handles.

### Read-only viewer

Use `RichTextViewer` to display saved content. It accepts the same string you stored from `onChange`.

```tsx
<RichTextViewer value={savedContent} />
```

Links are clickable and open in a new tab.

---

## Props

### `RichTextEditor`

| Prop              | Type                      | Default | Description                                |
| ----------------- | ------------------------- | ------- | ------------------------------------------ |
| `value`           | `string`                  | —       | Stored content (JSON string or plain text) |
| `onChange`        | `(value: string) => void` | —       | Called with a JSON string on every change  |
| `disabled`        | `boolean`                 | `false` | Disable editing                            |
| `className`       | `string`                  | —       | Class for the outer wrapper                |
| `editorClassName` | `string`                  | —       | Class for the editable area                |
| `children`        | `ReactNode`               | —       | Toolbar + EditorContent                    |

### `EditorToolbar`

| Prop            | Type                              | Default   | Description                                            |
| --------------- | --------------------------------- | --------- | ------------------------------------------------------ |
| `tools`         | `ToolbarTool[]`                   | All tools | Which buttons to show                                  |
| `onImageUpload` | `(file: File) => Promise<string>` | —         | Enables the image button                               |
| `actions`       | `ReactNode`                       | —         | Extra content below the toolbar (e.g. a submit button) |
| `editor`        | `Editor \| null`                  | Context   | Pass an editor directly instead of using context       |

### `RichTextViewer`

| Prop        | Type     | Default | Description               |
| ----------- | -------- | ------- | ------------------------- |
| `value`     | `string` | —       | Stored content to display |
| `className` | `string` | —       | Class for the viewer      |

---

## Storage format

Content is stored as a **JSON string**. When `onChange` fires, it gives you `JSON.stringify(editor.getJSON())` — a stringified TipTap document tree.

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "Hello " },
        { "type": "text", "marks": [{ "type": "bold" }], "text": "world" }
      ]
    }
  ]
}
```

Store this string in your database (a `TEXT` column works fine). Both `RichTextEditor` and `RichTextViewer` accept it back via the `value` prop.

### Legacy plain text

If your database has older records stored as plain text (before you added the rich text editor), they still work. The component detects whether the value is JSON or plain text and handles both. Plain text gets wrapped in a paragraph automatically.

---

## File structure

| File                   | What it does                                   |
| ---------------------- | ---------------------------------------------- |
| `index.ts`             | Barrel — public exports only                   |
| `rich-text-editor.tsx` | Editor wrapper, context provider               |
| `toolbar.tsx`          | Formatting toolbar with configurable tools     |
| `rich-text-viewer.tsx` | Read-only display                              |
| `link-bubble-menu.tsx` | Floating menu for editing links inline         |
| `image-view.tsx`       | Resizable image with drag handles              |
| `extensions.ts`        | TipTap extension config                        |
| `helpers.ts`           | URL parsing, content parsing utilities         |
| `tiptap.css`           | Editor styles (headings, links, lists, images) |
