"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Field, FieldLabel } from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import { Spinner } from "@asym/ui/components/shadcn/spinner";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@asym/ui/components/shadcn/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@asym/ui/components/shadcn/tooltip";
import { EmailStudioMergeTagMenu } from "@asym/ui/components/studio/EmailStudioMergeTagMenu";
import { EmailStudioProviderStatus } from "@asym/ui/components/studio/EmailStudioProviderStatus";
import {
  Monitor,
  Smartphone,
  Undo2,
  Redo2,
  Save,
  Download,
  Send,
  MoreVertical,
  Maximize2,
  Minimize2,
  FileText,
  Plus,
} from "lucide-react";

import type { EmailMetadata, PreviewDevice } from "./email-studio-types";

type EmailStudioHeaderProps = {
  metadata: EmailMetadata;
  onMetadataChange: (next: EmailMetadata) => void;
  isEditorReady: boolean;
  canPreview: boolean;
  isSaving: boolean;
  isSendingTest: boolean;
  hasUnsavedChanges: boolean;
  isFullscreen: boolean;
  previewDevice: PreviewDevice;
  onUndo: () => void;
  onRedo: () => void;
  onPreview: (device: PreviewDevice) => void;
  onExportHtml: () => void;
  onTestSend: () => void;
  onInsertMergeTag: (key: string) => void;
  onSaveClick: () => void;
  onNewTemplate: () => void;
  onLoadTemplate: () => void;
  onToggleFullscreen: () => void;
};

export function EmailStudioHeader({
  metadata,
  onMetadataChange,
  isEditorReady,
  canPreview,
  isSaving,
  isSendingTest,
  hasUnsavedChanges,
  isFullscreen,
  previewDevice,
  onUndo,
  onRedo,
  onPreview,
  onExportHtml,
  onTestSend,
  onInsertMergeTag,
  onSaveClick,
  onNewTemplate,
  onLoadTemplate,
  onToggleFullscreen,
}: EmailStudioHeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-3 border-b bg-card px-4 py-2">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <FileText className="size-5 shrink-0 text-muted-foreground" />
        <Field className="max-w-xs gap-1.5">
          <FieldLabel className="sr-only" htmlFor="email-studio-template-name">
            Template name
          </FieldLabel>
          <Input
            id="email-studio-template-name"
            value={metadata.name}
            onChange={(event) =>
              onMetadataChange({ ...metadata, name: event.target.value })
            }
            className="h-8 border-transparent bg-transparent px-2 font-medium hover:border-input focus:border-input"
            placeholder="Untitled Email"
          />
        </Field>
        {hasUnsavedChanges ? <Badge variant="secondary">Unsaved</Badge> : null}
      </div>

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onUndo}
                disabled={!isEditorReady}
                aria-label="Undo"
              >
                <Undo2 />
              </Button>
            }
          />
          <TooltipContent>Undo (⌘Z)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onRedo}
                disabled={!isEditorReady}
                aria-label="Redo"
              >
                <Redo2 />
              </Button>
            }
          />
          <TooltipContent>Redo (⌘⇧Z)</TooltipContent>
        </Tooltip>
      </div>

      <ToggleGroup
        value={[previewDevice]}
        onValueChange={(groupValue) => {
          const next = groupValue[0];
          if (next === "desktop" || next === "mobile") {
            onPreview(next);
          }
        }}
        disabled={!canPreview}
        variant="outline"
        size="sm"
        aria-label="Preview device"
      >
        <Tooltip>
          <TooltipTrigger
            render={
              <ToggleGroupItem value="desktop" aria-label="Desktop preview">
                <Monitor />
              </ToggleGroupItem>
            }
          />
          <TooltipContent>Desktop preview</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <ToggleGroupItem value="mobile" aria-label="Mobile preview">
                <Smartphone />
              </ToggleGroupItem>
            }
          />
          <TooltipContent>Mobile preview</TooltipContent>
        </Tooltip>
      </ToggleGroup>

      <EmailStudioMergeTagMenu
        disabled={!isEditorReady}
        onInsert={onInsertMergeTag}
      />
      <EmailStudioProviderStatus />

      <Button
        variant="outline"
        size="sm"
        onClick={onSaveClick}
        disabled={!isEditorReady || isSaving || isSendingTest}
      >
        {isSaving ? <Spinner /> : <Save />}
        Save
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="More">
              <MoreVertical />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onNewTemplate}>
              <Plus />
              New Template
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onLoadTemplate}>
              <FileText />
              Load Template
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onExportHtml} disabled={!isEditorReady}>
              <Download />
              Export as HTML
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onTestSend}
              disabled={!isEditorReady || isSaving || isSendingTest}
            >
              <Send />
              Send Test Email
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 /> : <Maximize2 />}
            </Button>
          }
        />
        <TooltipContent>
          {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        </TooltipContent>
      </Tooltip>
    </header>
  );
}
