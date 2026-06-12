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
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Separator } from "../separator";
import { Toggle } from "../toggle";
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
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isHeading1: false,
  isHeading2: false,
  isBlockquote: false,
  isBulletList: false,
  isOrderedList: false,
  isLink: false,
  canUndo: false,
  canRedo: false,
  existingHref: undefined as string | undefined,
};

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
}

export function EditorToolbar({
  editor: editorProp,
  tools,
  onImageUpload,
  onImageClick,
  actions,
}: EditorToolbarProps) {
  const ctx = useOptionalEditorContext();
  const editor = editorProp ?? ctx?.editor ?? null;
  const toolbarState =
    useEditorState({
      editor,
      selector: ({ editor: currentEditor }) => {
        if (!currentEditor) return DEFAULT_TOOLBAR_STATE;

        return {
          isBold: currentEditor.isActive("bold"),
          isItalic: currentEditor.isActive("italic"),
          isUnderline: currentEditor.isActive("underline"),
          isHeading1: currentEditor.isActive("heading", { level: 1 }),
          isHeading2: currentEditor.isActive("heading", { level: 2 }),
          isBlockquote: currentEditor.isActive("blockquote"),
          isBulletList: currentEditor.isActive("bulletList"),
          isOrderedList: currentEditor.isActive("orderedList"),
          isLink: currentEditor.isActive("link"),
          canUndo: currentEditor.can().undo(),
          canRedo: currentEditor.can().redo(),
          existingHref: currentEditor.getAttributes("link").href as
            | string
            | undefined,
        };
      },
    }) ?? DEFAULT_TOOLBAR_STATE;

  if (!editor) return null;

  const enabledTools = new Set(
    tools ??
      ALL_TOOLS.filter((t) => {
        if (t !== "image") return true;
        return Boolean(onImageUpload || onImageClick);
      }),
  );

  const has = (tool: ToolbarTool) => enabledTools.has(tool);

  const formatting = has("bold") || has("italic") || has("underline");
  const headings = has("heading") || has("blockquote");
  const lists = has("bulletList") || has("orderedList");
  const media = has("link") || has("image");
  const history = has("undo") || has("redo");

  const sections: React.ReactNode[] = [];

  if (formatting) {
    sections.push(
      <div key="formatting" className="flex items-center gap-0.5">
        {has("bold") && (
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={toolbarState.isBold}
            tooltip="Bold (Ctrl+B)"
          >
            <Bold className="size-3.5" />
          </ToolbarButton>
        )}
        {has("italic") && (
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={toolbarState.isItalic}
            tooltip="Italic (Ctrl+I)"
          >
            <Italic className="size-3.5" />
          </ToolbarButton>
        )}
        {has("underline") && (
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={toolbarState.isUnderline}
            tooltip="Underline (Ctrl+U)"
          >
            <Underline className="size-3.5" />
          </ToolbarButton>
        )}
      </div>,
    );
  }

  if (headings) {
    sections.push(
      <div key="headings" className="flex items-center gap-0.5">
        {has("heading") && (
          <>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              active={toolbarState.isHeading1}
              tooltip="Heading 1"
            >
              <Heading1 className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              active={toolbarState.isHeading2}
              tooltip="Heading 2"
            >
              <Heading2 className="size-3.5" />
            </ToolbarButton>
          </>
        )}
        {has("blockquote") && (
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={toolbarState.isBlockquote}
            tooltip="Quote"
          >
            <Quote className="size-3.5" />
          </ToolbarButton>
        )}
      </div>,
    );
  }

  if (lists) {
    sections.push(
      <div key="lists" className="flex items-center gap-0.5">
        {has("bulletList") && (
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={toolbarState.isBulletList}
            tooltip="Bullet List"
          >
            <List className="size-3.5" />
          </ToolbarButton>
        )}
        {has("orderedList") && (
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={toolbarState.isOrderedList}
            tooltip="Numbered List"
          >
            <ListOrdered className="size-3.5" />
          </ToolbarButton>
        )}
      </div>,
    );
  }

  if (media) {
    sections.push(
      <div key="media" className="flex items-center gap-0.5">
        {has("link") && (
          <LinkButton
            editor={editor}
            existingHref={toolbarState.existingHref}
            isActive={toolbarState.isLink}
          />
        )}
        {has("image") && onImageClick && (
          <ImageClickButton onClick={onImageClick} />
        )}
        {has("image") && !onImageClick && onImageUpload && (
          <ImageButton editor={editor} onUpload={onImageUpload} />
        )}
      </div>,
    );
  }

  if (history) {
    sections.push(
      <div key="history" className="flex items-center gap-0.5">
        {has("undo") && (
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            active={false}
            disabled={!toolbarState.canUndo}
            tooltip="Undo (Ctrl+Z)"
          >
            <Undo2 className="size-3.5" />
          </ToolbarButton>
        )}
        {has("redo") && (
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            active={false}
            disabled={!toolbarState.canRedo}
            tooltip="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="size-3.5" />
          </ToolbarButton>
        )}
      </div>,
    );
  }

  return (
    <TooltipProvider delay={0}>
      <div className="sticky top-0 z-10 border-b border-border bg-muted/40 backdrop-blur-sm">
        <div className="flex items-center gap-0.5 overflow-x-auto px-3 sm:px-4 py-2">
          {sections.map((section, i) => {
            const sectionKey =
              (section as React.ReactElement<{ key?: React.Key }>).key ??
              `section-${i}`;
            return (
              <React.Fragment key={sectionKey}>
                {i > 0 && (
                  <Separator
                    orientation="vertical"
                    className="h-4 mx-1.5 bg-border/60"
                  />
                )}
                {section}
              </React.Fragment>
            );
          })}
        </div>

        {actions && (
          <div className="border-t border-border px-3 sm:px-4 py-3">
            {actions}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

function ToolbarButton({
  onClick,
  active,
  tooltip,
  disabled,
  children,
  className,
}: {
  onClick: () => void;
  active: boolean;
  tooltip: string;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Toggle
            aria-label={tooltip}
            size="sm"
            pressed={active}
            onPressedChange={onClick}
            disabled={disabled}
            className={cn(
              "size-7 p-0 rounded-md transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground hover:text-foreground",
              disabled && "opacity-40",
              className,
            )}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function LinkButton({
  editor,
  existingHref,
  isActive,
}: {
  editor: Editor;
  existingHref?: string;
  isActive: boolean;
}) {
  const [url, setUrl] = React.useState("");
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setUrl(existingHref ?? "");
    }
  }, [open, existingHref]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setOpen(false);
      return;
    }
    const parsed = getUrlFromString(url);
    if (!parsed) {
      toast.error("Please enter a valid URL");
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: parsed })
      .run();

    setUrl("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  aria-label={isActive ? "Edit link" : "Add link"}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "size-7 p-0 rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground",
                  )}
                />
              }
            />
          }
        >
          <LinkIcon className="size-3.5" />
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          Link
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        className="w-72 p-3 rounded-xl border-border shadow-lg"
        align="start"
        finalFocus={false}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          <p className="text-xs text-muted-foreground">
            Attach a link to the selected text
          </p>
          <Input
            aria-label="Link URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="h-8 rounded-lg border-border bg-muted/30 text-sm"
          />
          <div className="flex items-center justify-end gap-2">
            {existingHref && (
              <Button
                aria-label="Remove link"
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  editor
                    .chain()
                    .focus()
                    .extendMarkRange("link")
                    .unsetLink()
                    .run();
                  setUrl("");
                  setOpen(false);
                }}
              >
                Remove
              </Button>
            )}
            <Button type="submit" size="sm" className="h-7 px-3 text-xs">
              {existingHref ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}

function ImageClickButton({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            aria-label="Insert image"
            variant="ghost"
            size="sm"
            className="size-7 p-0 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            type="button"
            onClick={onClick}
          />
        }
      >
        <ImageIcon className="size-3.5" />
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        Image
      </TooltipContent>
    </Tooltip>
  );
}

function ImageButton({
  editor,
  onUpload,
}: {
  editor: Editor;
  onUpload: (file: File) => Promise<string>;
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
      const message =
        error instanceof Error ? error.message : "Failed to upload image";
      toast.error(message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImageUpload}
        disabled={isUploading}
      />
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              aria-label={isUploading ? "Uploading image" : "Upload image"}
              variant="ghost"
              size="sm"
              className={cn(
                "size-7 p-0 rounded-md transition-colors",
                "hover:bg-muted text-muted-foreground hover:text-foreground",
                isUploading && "animate-pulse",
              )}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            />
          }
        >
          <ImageIcon className="size-3.5" />
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {isUploading ? "Uploading..." : "Image"}
        </TooltipContent>
      </Tooltip>
    </>
  );
}
