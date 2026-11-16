"use client";

import { type Editor, useEditorState } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo2,
  Redo2,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { cn } from "@asym/ui/lib/utils";

import { useOptionalEditorContext } from "./editor-context";
import { getUrlFromString } from "./helpers";
import { Button } from "../button";
import { Input } from "../input";
import { Kbd } from "../kbd";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Separator } from "../separator";
import { Toggle } from "../toggle";
import { Toolbar, ToolbarButton as ToolbarItem } from "../toolbar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../tooltip";

/* ---------------------------- Tool definitions ---------------------------- */

export type ToolbarTool =
  | "bold"
  | "italic"
  | "underline"
  | "heading"
  | "blockquote"
  | "bulletList"
  | "orderedList"
  | "link"
  | "image"
  | "undo"
  | "redo";

const ALL_TOOLS: ToolbarTool[] = [
  "bold",
  "italic",
  "underline",
  "heading",
  "blockquote",
  "bulletList",
  "orderedList",
  "link",
  "image",
  "undo",
  "redo",
];

const DEFAULT_TOOLBAR_STATE = {
  isEditable: false,
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isHeading1: false,
  isHeading2: false,
  isBlockquote: false,
  isBulletList: false,
  isOrderedList: false,
  isLink: false,
  hasSelection: false,
  canUndo: false,
  canRedo: false,
  existingHref: undefined as string | undefined,
};

/** Keys after the platform modifier, matching StarterKit's own bindings. */
type Shortcut = readonly string[];

const SHORTCUTS = {
  bold: ["B"],
  italic: ["I"],
  underline: ["U"],
  heading1: ["Alt", "1"],
  heading2: ["Alt", "2"],
  blockquote: ["Shift", "B"],
  bulletList: ["Shift", "8"],
  orderedList: ["Shift", "7"],
  undo: ["Z"],
  redo: ["Shift", "Z"],
  link: ["K"],
} satisfies Record<string, Shortcut>;

function isApplePlatform() {
  return (
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad/.test(navigator.userAgent)
  );
}

function shortcutKeys(shortcut: Shortcut) {
  const apple = isApplePlatform();
  return {
    aria: [apple ? "Meta" : "Control", ...shortcut].join("+"),
    display: apple
      ? `⌘${shortcut.map((key) => (key === "Shift" ? "⇧" : key === "Alt" ? "⌥" : key)).join("")}`
      : ["Ctrl", ...shortcut].join("+"),
  };
}

/* -------------------------------------------------------------------------- */

export interface EditorToolbarProps {
  /** Pass an editor directly, or omit to use context. */
  editor?: Editor | null;
  /** Which tools to show. Defaults to all (image only if upload/click handler provided). */
  tools?: ToolbarTool[];
  /** Provide to enable the image upload button (receives file, returns public URL). */
  onImageUpload?: (file: File) => Promise<string>;
  /** When set, image button calls this instead of opening a file picker. */
  onImageClick?: () => void;
  /** Extra content rendered below the toolbar (e.g. submit button). */
  actions?: React.ReactNode;
  /**
   * Where the toolbar sits relative to the content. A top toolbar sticks while
   * the content scrolls; a bottom one draws its divider above it instead.
   */
  position?: "top" | "bottom";
}

type EditorToolbarState = typeof DEFAULT_TOOLBAR_STATE;
type EditorToolbarSectionId =
  "formatting" | "headings" | "lists" | "media" | "history";

function editorToolbarEnabledTools(
  tools: ToolbarTool[] | undefined,
  onImageUpload: ((file: File) => Promise<string>) | undefined,
  onImageClick: (() => void) | undefined,
): Set<ToolbarTool> {
  return new Set(
    tools ??
      ALL_TOOLS.filter((tool) => {
        if (tool !== "image") return true;
        return Boolean(onImageUpload || onImageClick);
      }),
  );
}

function editorToolbarSectionIds(
  enabledTools: Set<ToolbarTool>,
): EditorToolbarSectionId[] {
  const ids: EditorToolbarSectionId[] = [];
  if (
    enabledTools.has("bold") ||
    enabledTools.has("italic") ||
    enabledTools.has("underline")
  ) {
    ids.push("formatting");
  }
  if (enabledTools.has("heading") || enabledTools.has("blockquote")) {
    ids.push("headings");
  }
  if (enabledTools.has("bulletList") || enabledTools.has("orderedList")) {
    ids.push("lists");
  }
  if (enabledTools.has("link") || enabledTools.has("image")) {
    ids.push("media");
  }
  if (enabledTools.has("undo") || enabledTools.has("redo")) {
    ids.push("history");
  }
  return ids;
}

type SectionProps = {
  editor: Editor;
  enabledTools: Set<ToolbarTool>;
  toolbarState: EditorToolbarState;
};

function EditorToolbarFormattingSection({
  editor,
  enabledTools,
  toolbarState,
}: SectionProps) {
  const disabled = !toolbarState.isEditable;
  return (
    <div className="flex items-center gap-0.5">
      {enabledTools.has("bold") && (
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={toolbarState.isBold}
          disabled={disabled}
          label="Bold"
          shortcut={SHORTCUTS.bold}
        >
          <Bold />
        </ToolbarButton>
      )}
      {enabledTools.has("italic") && (
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={toolbarState.isItalic}
          disabled={disabled}
          label="Italic"
          shortcut={SHORTCUTS.italic}
        >
          <Italic />
        </ToolbarButton>
      )}
      {enabledTools.has("underline") && (
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={toolbarState.isUnderline}
          disabled={disabled}
          label="Underline"
          shortcut={SHORTCUTS.underline}
        >
          <Underline />
        </ToolbarButton>
      )}
    </div>
  );
}

function EditorToolbarHeadingsSection({
  editor,
  enabledTools,
  toolbarState,
}: SectionProps) {
  const disabled = !toolbarState.isEditable;
  return (
    <div className="flex items-center gap-0.5">
      {enabledTools.has("heading") && (
        <>
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            active={toolbarState.isHeading1}
            disabled={disabled}
            label="Heading 1"
            shortcut={SHORTCUTS.heading1}
          >
            <Heading1 />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={toolbarState.isHeading2}
            disabled={disabled}
            label="Heading 2"
            shortcut={SHORTCUTS.heading2}
          >
            <Heading2 />
          </ToolbarButton>
        </>
      )}
      {enabledTools.has("blockquote") && (
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={toolbarState.isBlockquote}
          disabled={disabled}
          label="Quote"
          shortcut={SHORTCUTS.blockquote}
        >
          <Quote />
        </ToolbarButton>
      )}
    </div>
  );
}

function EditorToolbarListsSection({
  editor,
  enabledTools,
  toolbarState,
}: SectionProps) {
  const disabled = !toolbarState.isEditable;
  return (
    <div className="flex items-center gap-0.5">
      {enabledTools.has("bulletList") && (
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={toolbarState.isBulletList}
          disabled={disabled}
          label="Bullet list"
          shortcut={SHORTCUTS.bulletList}
        >
          <List />
        </ToolbarButton>
      )}
      {enabledTools.has("orderedList") && (
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={toolbarState.isOrderedList}
          disabled={disabled}
          label="Numbered list"
          shortcut={SHORTCUTS.orderedList}
        >
          <ListOrdered />
        </ToolbarButton>
      )}
    </div>
  );
}

function EditorToolbarMediaSection({
  editor,
  enabledTools,
  toolbarState,
  onImageUpload,
  onImageClick,
}: SectionProps & {
  onImageUpload?: (file: File) => Promise<string>;
  onImageClick?: () => void;
}) {
  const disabled = !toolbarState.isEditable;
  return (
    <div className="flex items-center gap-0.5">
      {enabledTools.has("link") && (
        <LinkButton
          editor={editor}
          existingHref={toolbarState.existingHref}
          isActive={toolbarState.isLink}
          hasSelection={toolbarState.hasSelection}
          disabled={disabled}
        />
      )}
      {enabledTools.has("image") && onImageClick && (
        <ToolbarButton
          onClick={onImageClick}
          disabled={disabled}
          label="Insert image"
        >
          <ImageIcon />
        </ToolbarButton>
      )}
      {enabledTools.has("image") && !onImageClick && onImageUpload && (
        <ImageButton
          editor={editor}
          onUpload={onImageUpload}
          disabled={disabled}
        />
      )}
    </div>
  );
}

function EditorToolbarHistorySection({
  editor,
  enabledTools,
  toolbarState,
}: SectionProps) {
  return (
    <div className="flex items-center gap-0.5">
      {enabledTools.has("undo") && (
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!toolbarState.isEditable || !toolbarState.canUndo}
          label="Undo"
          shortcut={SHORTCUTS.undo}
        >
          <Undo2 />
        </ToolbarButton>
      )}
      {enabledTools.has("redo") && (
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!toolbarState.isEditable || !toolbarState.canRedo}
          label="Redo"
          shortcut={SHORTCUTS.redo}
        >
          <Redo2 />
        </ToolbarButton>
      )}
    </div>
  );
}

function EditorToolbarSectionList({
  editor,
  enabledTools,
  toolbarState,
  onImageUpload,
  onImageClick,
}: SectionProps & {
  onImageUpload?: (file: File) => Promise<string>;
  onImageClick?: () => void;
}) {
  const sectionProps = { editor, enabledTools, toolbarState };
  const sections: Record<EditorToolbarSectionId, React.ReactNode> = {
    formatting: <EditorToolbarFormattingSection {...sectionProps} />,
    headings: <EditorToolbarHeadingsSection {...sectionProps} />,
    lists: <EditorToolbarListsSection {...sectionProps} />,
    media: (
      <EditorToolbarMediaSection
        {...sectionProps}
        onImageUpload={onImageUpload}
        onImageClick={onImageClick}
      />
    ),
    history: <EditorToolbarHistorySection {...sectionProps} />,
  };

  return (
    <div className="px-3 py-2 sm:px-4">
      <Toolbar aria-label="Text formatting">
        <div
          data-toolbar-row
          className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1"
        >
          {editorToolbarSectionIds(enabledTools).map((sectionId, index) => (
            <React.Fragment key={sectionId}>
              {index > 0 && (
                <Separator orientation="vertical" className="mx-1.5 h-4" />
              )}
              {sections[sectionId]}
            </React.Fragment>
          ))}
        </div>
      </Toolbar>
    </div>
  );
}

export function EditorToolbar({
  editor: editorProp,
  tools,
  onImageUpload,
  onImageClick,
  actions,
  position = "top",
}: EditorToolbarProps) {
  const ctx = useOptionalEditorContext();
  const editor = editorProp ?? ctx?.editor ?? null;
  const toolbarState =
    useEditorState({
      editor,
      selector: ({ editor: currentEditor }) => {
        if (!currentEditor) return DEFAULT_TOOLBAR_STATE;

        return {
          isEditable: currentEditor.isEditable,
          isBold: currentEditor.isActive("bold"),
          isItalic: currentEditor.isActive("italic"),
          isUnderline: currentEditor.isActive("underline"),
          isHeading1: currentEditor.isActive("heading", { level: 1 }),
          isHeading2: currentEditor.isActive("heading", { level: 2 }),
          isBlockquote: currentEditor.isActive("blockquote"),
          isBulletList: currentEditor.isActive("bulletList"),
          isOrderedList: currentEditor.isActive("orderedList"),
          isLink: currentEditor.isActive("link"),
          hasSelection: !currentEditor.state.selection.empty,
          canUndo: currentEditor.can().undo(),
          canRedo: currentEditor.can().redo(),
          existingHref: currentEditor.getAttributes("link").href as
            string | undefined,
        };
      },
    }) ?? DEFAULT_TOOLBAR_STATE;

  // A read-only editor shows content only: formatting controls would be noise.
  if (!editor || ctx?.readOnly) return null;

  const enabledTools = editorToolbarEnabledTools(
    tools,
    onImageUpload,
    onImageClick,
  );

  return (
    <TooltipProvider delay={0}>
      <div
        data-slot="editor-toolbar"
        className={cn(
          "z-10 border-border bg-muted/40",
          position === "top"
            ? "sticky top-0 border-b backdrop-blur-sm"
            : "border-t",
        )}
      >
        <EditorToolbarSectionList
          editor={editor}
          enabledTools={enabledTools}
          toolbarState={toolbarState}
          onImageUpload={onImageUpload}
          onImageClick={onImageClick}
        />

        {actions && (
          <div className="border-t border-border px-3 py-3 sm:px-4">
            {actions}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

function ToolbarTooltipContent({
  label,
  shortcut,
}: {
  label: string;
  shortcut?: Shortcut;
}) {
  return (
    <TooltipContent side="top">
      <span className="flex items-center gap-2">
        {label}
        {shortcut && <Kbd>{shortcutKeys(shortcut).display}</Kbd>}
      </span>
    </TooltipContent>
  );
}

function ToolbarButton({
  onClick,
  active,
  label,
  shortcut,
  disabled,
  children,
}: {
  onClick: () => void;
  /** Omit for one-off commands; pass a boolean for formats that toggle. */
  active?: boolean;
  label: string;
  shortcut?: Shortcut;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <ToolbarItem
            disabled={disabled}
            focusableWhenDisabled={false}
            aria-label={label}
            aria-keyshortcuts={
              shortcut ? shortcutKeys(shortcut).aria : undefined
            }
            render={
              active === undefined ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled}
                  onClick={() => {
                    if (!disabled) onClick();
                  }}
                />
              ) : (
                <Toggle size="sm" pressed={active} onPressedChange={onClick} />
              )
            }
          >
            {children}
          </ToolbarItem>
        }
      />
      <ToolbarTooltipContent label={label} shortcut={shortcut} />
    </Tooltip>
  );
}

function LinkButton({
  editor,
  existingHref,
  isActive,
  hasSelection,
  disabled,
}: {
  editor: Editor;
  existingHref?: string;
  isActive: boolean;
  hasSelection: boolean;
  disabled: boolean;
}) {
  const errorId = React.useId();
  const [url, setUrl] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  const openChange = React.useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        setUrl(existingHref ?? "");
        setError(null);
      }
      setOpen(nextOpen);
    },
    [existingHref],
  );

  // StarterKit has no link shortcut; Mod+K opens this popover from the text.
  React.useEffect(() => {
    if (disabled) return;
    const dom = editor.view.dom;
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === "k" &&
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey
      ) {
        event.preventDefault();
        openChange(true);
      }
    };
    dom.addEventListener("keydown", onKeyDown);
    return () => dom.removeEventListener("keydown", onKeyDown);
  }, [disabled, editor, openChange]);

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setOpen(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const typed = url.trim();
    if (!typed) {
      removeLink();
      return;
    }
    const href = getUrlFromString(typed);
    if (!href) {
      setError("Enter a web address, like https://example.org");
      return;
    }

    if (!hasSelection && !isActive) {
      // With nothing selected, the address as typed becomes the linked text.
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text: typed,
          marks: [{ type: "link", attrs: { href } }],
        })
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }
    setOpen(false);
  };

  const label = isActive ? "Edit link" : "Add link";

  return (
    <Popover open={open} onOpenChange={openChange}>
      <Tooltip>
        <TooltipTrigger
          render={
            <ToolbarItem
              disabled={disabled}
              focusableWhenDisabled={false}
              render={
                <PopoverTrigger
                  render={
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="icon-sm"
                      aria-label={label}
                      aria-keyshortcuts={shortcutKeys(SHORTCUTS.link).aria}
                    >
                      <LinkIcon />
                    </Button>
                  }
                />
              }
            />
          }
        />
        <ToolbarTooltipContent label={label} shortcut={SHORTCUTS.link} />
      </Tooltip>
      <PopoverContent
        className="w-72"
        align="start"
        finalFocus={() => editor.view.dom}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          <p className="text-xs text-muted-foreground">
            {hasSelection || isActive
              ? "Links the selected text."
              : "Adds the address as linked text."}
          </p>
          <Input
            aria-label="Link URL"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              setError(null);
            }}
            placeholder="https://example.org"
            inputMode="url"
            autoComplete="url"
          />
          {error && (
            <p id={errorId} role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
          <div className="flex items-center justify-end gap-2">
            {existingHref && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={removeLink}
              >
                Remove link
              </Button>
            )}
            <Button type="submit" size="sm">
              Save link
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}

function ImageButton({
  editor,
  onUpload,
  disabled,
}: {
  editor: Editor;
  onUpload: (file: File) => Promise<string>;
  disabled: boolean;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await onUpload(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The image could not upload.",
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const label = isUploading ? "Uploading image" : "Upload image";

  return (
    <>
      <input
        type="file"
        aria-label="Upload image file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImageUpload}
        disabled={disabled || isUploading}
      />
      <Tooltip>
        <TooltipTrigger
          render={
            <ToolbarItem
              render={<Button variant="ghost" size="icon-sm" />}
              aria-label={label}
              aria-busy={isUploading || undefined}
              focusableWhenDisabled={isUploading}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
            >
              <ImageIcon />
            </ToolbarItem>
          }
        />
        <ToolbarTooltipContent label={isUploading ? "Uploading…" : label} />
      </Tooltip>
    </>
  );
}
