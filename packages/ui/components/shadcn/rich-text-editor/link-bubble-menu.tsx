"use client";

import { useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { ExternalLink, Pencil, Trash2, Check, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { cn } from "@asym/ui/lib/utils";

import { Button } from "../button";
import { Input } from "../input";
import { useEditorContext } from "./editor-context";
import { getUrlFromString, normalizePostLinkHref } from "./helpers";

const DEFAULT_LINK_BUBBLE_STATE = {
  href: "",
  isLink: false,
};

export function LinkBubbleMenu() {
  const { editor } = useEditorContext();
  const [isEditing, setIsEditing] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const bubbleMenuState =
    useEditorState({
      editor,
      selector: ({ editor: currentEditor }) => {
        if (!currentEditor) return DEFAULT_LINK_BUBBLE_STATE;

        return {
          href:
            (currentEditor.getAttributes("link").href as string | undefined) ??
            "",
          isLink: currentEditor.isActive("link"),
        };
      },
    }) ?? DEFAULT_LINK_BUBBLE_STATE;

  if (!editor) return null;

  const handleEdit = () => {
    setUrl(bubbleMenuState.href);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSave = () => {
    const parsed = getUrlFromString(url);
    if (!parsed) {
      toast.error("Please enter a valid URL");
      inputRef.current?.focus();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: parsed })
      .run();

    setIsEditing(false);
    setUrl("");
  };

  const handleRemove = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setIsEditing(false);
    setUrl("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUrl("");
    editor.chain().focus().run();
  };

  return (
    <BubbleMenu
      editor={editor}
      updateDelay={0}
      shouldShow={({ editor: ed, element, view }) => {
        const isChildOfMenu =
          element instanceof HTMLElement &&
          element.contains(document.activeElement);
        const hasEditorFocus = view.hasFocus() || isChildOfMenu;

        return ed.isEditable && hasEditorFocus && ed.isActive("link");
      }}
      className={cn(
        "flex items-center gap-1 rounded-lg border border-border bg-background p-1 shadow-lg",
        "animate-in fade-in-0 zoom-in-95 duration-100",
      )}
    >
      {isEditing ? (
        <EditView
          ref={inputRef}
          url={url}
          onUrlChange={setUrl}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <PreviewView
          href={bubbleMenuState.href}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      )}
    </BubbleMenu>
  );
}

function PreviewView({
  href,
  onEdit,
  onRemove,
}: {
  href: string;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const safeHref = normalizePostLinkHref(href);

  return (
    <>
      {safeHref ? (
        <a
          href={safeHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-primary hover:bg-muted truncate max-w-[220px]"
          title={safeHref}
        >
          <ExternalLink className="size-3.5 shrink-0" />
          <span className="truncate">{safeHref}</span>
        </a>
      ) : (
        <div
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground truncate max-w-[220px]"
          title={href}
        >
          <ExternalLink className="size-3.5 shrink-0" />
          <span className="truncate">{href}</span>
        </div>
      )}
      <div className="h-4 w-px bg-border" />
      <Button
        aria-label="Edit link"
        variant="ghost"
        size="icon-xs"
        onClick={onEdit}
        className="size-6 text-muted-foreground hover:text-foreground"
      >
        <Pencil className="size-3" />
      </Button>
      <Button
        aria-label="Remove link"
        variant="ghost"
        size="icon-xs"
        onClick={onRemove}
        className="size-6 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="size-3" />
      </Button>
    </>
  );
}

const EditView = React.forwardRef<
  HTMLInputElement,
  {
    url: string;
    onUrlChange: (url: string) => void;
    onSave: () => void;
    onCancel: () => void;
  }
>(({ url, onUrlChange, onSave, onCancel }, ref) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
      className="flex items-center gap-1"
    >
      <Input
        ref={ref}
        aria-label="Edit link URL"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="https://example.com"
        className="h-7 w-[200px] rounded-md border-border bg-muted/30 text-sm px-2"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }}
      />
      <Button
        aria-label="Save link"
        type="submit"
        variant="ghost"
        size="icon-xs"
        className="size-6 text-primary hover:text-primary"
      >
        <Check className="size-3.5" />
      </Button>
      <Button
        aria-label="Cancel link edit"
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onCancel}
        className="size-6 text-muted-foreground hover:text-foreground"
      >
        <X className="size-3.5" />
      </Button>
    </form>
  );
});

EditView.displayName = "EditView";
