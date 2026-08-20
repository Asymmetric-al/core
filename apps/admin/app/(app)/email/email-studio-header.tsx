"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Input } from "@asym/ui/components/shadcn/input";
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
  Loader2,
  FileText,
  Plus,
} from "lucide-react";

import type { EmailMetadata, PreviewDevice } from "./email-studio-types";

type EmailStudioHeaderProps = {
  metadata: EmailMetadata;
  onMetadataChange: (next: EmailMetadata) => void;
  isEditorReady: boolean;
  isSaving: boolean;
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
  isSaving,
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
    <header className="flex items-center gap-3 border-b bg-card px-4 py-2">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
        <Input
          value={metadata.name}
          onChange={(event) =>
            onMetadataChange({ ...metadata, name: event.target.value })
          }
          className="h-8 max-w-xs border-transparent bg-transparent px-2 font-medium hover:border-input focus:border-input"
          placeholder="Untitled Email"
        />
        {hasUnsavedChanges ? (
          <span className="text-xs text-muted-foreground">Unsaved</span>
        ) : null}
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
              />
            }
          >
            <Undo2 className="h-4 w-4" />
          </TooltipTrigger>
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
              />
            }
          >
            <Redo2 className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent>Redo (⌘⇧Z)</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-center gap-1 rounded-md border p-0.5">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant={previewDevice === "desktop" ? "secondary" : "ghost"}
                size="icon-sm"
                onClick={() => onPreview("desktop")}
                disabled={!isEditorReady}
              />
            }
          >
            <Monitor className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent>Desktop preview</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant={previewDevice === "mobile" ? "secondary" : "ghost"}
                size="icon-sm"
                onClick={() => onPreview("mobile")}
                disabled={!isEditorReady}
              />
            }
          >
            <Smartphone className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent>Mobile preview</TooltipContent>
        </Tooltip>
      </div>

      <EmailStudioMergeTagMenu
        disabled={!isEditorReady}
        onInsert={onInsertMergeTag}
      />
      <EmailStudioProviderStatus />

      <Button
        variant="outline"
        size="sm"
        onClick={onSaveClick}
        disabled={!isEditorReady || isSaving}
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Save
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <MoreVertical className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onNewTemplate}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onLoadTemplate}>
            <FileText className="mr-2 h-4 w-4" />
            Load Template
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onExportHtml} disabled={!isEditorReady}>
            <Download className="mr-2 h-4 w-4" />
            Export as HTML
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onTestSend} disabled={!isEditorReady}>
            <Send className="mr-2 h-4 w-4" />
            Send Test Email
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleFullscreen}
            />
          }
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </TooltipTrigger>
        <TooltipContent>
          {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        </TooltipContent>
      </Tooltip>
    </header>
  );
}
