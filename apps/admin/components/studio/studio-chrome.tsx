"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@asym/ui/components/shadcn/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@asym/ui/components/shadcn/tooltip";
import {
  Check,
  ChevronRight,
  Copy,
  Layers,
  Monitor,
  Save,
  Smartphone,
} from "lucide-react";

import type { ReactNode } from "react";

/**
 * Header and export-dialog pieces shared by the Email Studio and PDF Studio
 * page clients so both surfaces stay visually identical and change together.
 */

export type StudioPreviewDevice = "desktop" | "mobile";

export function StudioTemplateBreadcrumb({
  name,
  hasUnsavedChanges,
}: {
  name: string;
  hasUnsavedChanges: boolean;
}) {
  return (
    <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground min-w-0">
      <span className="shrink-0">Templates</span>
      <ChevronRight className="size-3 shrink-0" />
      <span className="font-medium text-foreground truncate max-w-[180px]">
        {name}
      </span>
      {hasUnsavedChanges && (
        <Tooltip>
          <TooltipTrigger
            render={
              <span className="ml-1 size-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            }
          />
          <TooltipContent side="bottom">
            <p>Unsaved changes</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

export function StudioPreviewDeviceToggle({
  value,
  onChange,
  disabled,
}: {
  value: StudioPreviewDevice;
  onChange: (device: StudioPreviewDevice) => void;
  disabled?: boolean;
}) {
  return (
    <ToggleGroup
      value={[value]}
      onValueChange={(groupValue) => {
        const next = groupValue[0];
        if (next) {
          onChange(next as StudioPreviewDevice);
        }
      }}
      disabled={disabled}
      variant="outline"
      size="sm"
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <ToggleGroupItem
              value="desktop"
              className="h-7 px-2.5 data-pressed:bg-primary data-pressed:text-primary-foreground"
            >
              <Monitor className="size-3.5" />
              <span className="hidden lg:inline ml-1.5 text-[10px] font-medium uppercase tracking-wider">
                Desktop
              </span>
            </ToggleGroupItem>
          }
        />
        <TooltipContent side="bottom">Desktop preview</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <ToggleGroupItem
              value="mobile"
              className="h-7 px-2.5 data-pressed:bg-primary data-pressed:text-primary-foreground"
            >
              <Smartphone className="size-3.5" />
              <span className="hidden lg:inline ml-1.5 text-[10px] font-medium uppercase tracking-wider">
                Mobile
              </span>
            </ToggleGroupItem>
          }
        />
        <TooltipContent side="bottom">Mobile preview</TooltipContent>
      </Tooltip>
    </ToggleGroup>
  );
}

export function StudioSaveButton({
  onClick,
  disabled,
  isSaving,
}: {
  onClick: () => void;
  disabled: boolean;
  isSaving: boolean;
}) {
  return (
    <Button
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="h-8 px-3 md:px-4 gap-1.5"
    >
      {isSaving ? (
        <>
          <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="hidden sm:inline text-xs font-medium">Saving…</span>
        </>
      ) : (
        <>
          <Save className="size-3.5" />
          <span className="hidden sm:inline text-xs font-medium">Save</span>
        </>
      )}
    </Button>
  );
}

const EXPORT_PREVIEW_LIMIT = 3000;

export function StudioExportedHtmlPreview({
  html,
  copied,
  onCopy,
  readyLabel,
}: {
  html: string;
  copied: boolean;
  onCopy: () => void;
  /** Trailing status shown next to the layers icon, e.g. "Ready for email clients". */
  readyLabel: ReactNode;
}) {
  return (
    <div className="py-4">
      <div className="relative group">
        <div className="absolute top-3 right-3 z-10">
          <Button
            variant="secondary"
            size="sm"
            className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onCopy}
          >
            {copied ? (
              <Check className="size-3.5 mr-1 text-emerald-600" />
            ) : (
              <Copy className="size-3.5 mr-1" />
            )}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        <pre className="bg-zinc-950 text-zinc-100 p-4 rounded-xl text-xs overflow-auto max-h-[320px] font-mono leading-relaxed">
          {html.slice(0, EXPORT_PREVIEW_LIMIT)}
          {html.length > EXPORT_PREVIEW_LIMIT && (
            <span className="text-zinc-500">
              {`\n\n… truncated (${(html.length - EXPORT_PREVIEW_LIMIT).toLocaleString()} more characters)`}
            </span>
          )}
        </pre>
      </div>
      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
        <span>{html.length.toLocaleString()} characters</span>
        <span className="flex items-center gap-1">
          <Layers className="size-3" />
          {readyLabel}
        </span>
      </div>
    </div>
  );
}
