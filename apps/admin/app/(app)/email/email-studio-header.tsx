"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Field, FieldLabel } from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import { Kbd } from "@asym/ui/components/shadcn/kbd";
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

import { usePlatformModifierLabel } from "../../../features/studios/use-platform-modifier";

import type { EmailMetadata, PreviewDevice } from "./email-studio-types";

type EmailStudioHeaderProps = {
  metadata: EmailMetadata;
  onMetadataChange: (next: EmailMetadata) => void;
  isEditorReady: boolean;
  canUndo: boolean;
  canRedo: boolean;
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
  canUndo,
  canRedo,
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
  const modifier = usePlatformModifierLabel();
  return (
    <header className="flex flex-wrap items-center gap-3 border-b bg-card px-4 py-2">
      <h1 className="sr-only">Email Studio</h1>
      <div className="flex w-full min-w-0 items-center gap-3 sm:w-auto sm:min-w-80 sm:flex-1">
        <FileText
          aria-hidden="true"
          className="size-5 shrink-0 text-muted-foreground"
        />
        <div className="min-w-0 w-full max-w-xs">
          <Field>
            <FieldLabel
              className="sr-only"
              htmlFor="email-studio-template-name"
            >
              Template name
            </FieldLabel>
            <Input
              id="email-studio-template-name"
              value={metadata.name}
              disabled={!isEditorReady || isSaving || isSendingTest}
              onChange={(event) =>
                onMetadataChange({ ...metadata, name: event.target.value })
              }
              placeholder="Untitled email"
            />
          </Field>
        </div>
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
                disabled={!isEditorReady || !canUndo}
                aria-label="Undo"
              >
                <Undo2 aria-hidden="true" />
              </Button>
            }
          />
          <TooltipContent>
            Undo <Kbd>{modifier}+Z</Kbd>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onRedo}
                disabled={!isEditorReady || !canRedo}
                aria-label="Redo"
              >
                <Redo2 aria-hidden="true" />
              </Button>
            }
          />
          <TooltipContent>
            Redo <Kbd>{modifier}+Shift+Z</Kbd>
          </TooltipContent>
        </Tooltip>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onLoadTemplate}
        disabled={isSaving || isSendingTest}
      >
        <FileText aria-hidden="true" />
        Open template
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPreview(previewDevice)}
        disabled={!canPreview}
      >
        <Monitor aria-hidden="true" />
        Preview
      </Button>

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
                <Monitor aria-hidden="true" />
              </ToggleGroupItem>
            }
          />
          <TooltipContent>Desktop preview</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <ToggleGroupItem value="mobile" aria-label="Mobile preview">
                <Smartphone aria-hidden="true" />
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

      <Button
        focusableWhenDisabled={isSaving}
        size="sm"
        onClick={onSaveClick}
        disabled={!isEditorReady || isSaving || isSendingTest}
      >
        {isSaving ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <Save aria-hidden="true" data-icon="inline-start" />
        )}
        Save
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onTestSend}
        disabled={!isEditorReady || isSaving || isSendingTest}
      >
        <Send aria-hidden="true" />
        Send test email
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="More email template actions"
            >
              <MoreVertical aria-hidden="true" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={onNewTemplate}
              disabled={isSaving || isSendingTest}
            >
              <Plus aria-hidden="true" />
              New template
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onExportHtml} disabled={!isEditorReady}>
              <Download aria-hidden="true" />
              Export as HTML
              <DropdownMenuShortcut>{modifier}+E</DropdownMenuShortcut>
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
              {isFullscreen ? (
                <Minimize2 aria-hidden="true" />
              ) : (
                <Maximize2 aria-hidden="true" />
              )}
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
