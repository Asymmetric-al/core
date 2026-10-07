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
    <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
      <span className="hidden shrink-0 lg:inline">Templates</span>
      <ChevronRight
        aria-hidden="true"
        className="hidden size-3 shrink-0 lg:block"
      />
      <span className="sr-only font-medium text-foreground lg:not-sr-only lg:max-w-[180px] lg:truncate">
        {name}
      </span>
      {hasUnsavedChanges && (
        <span
          role="status"
          className="flex shrink-0 items-center gap-1.5 text-warning"
        >
          <span aria-hidden="true" className="size-2 rounded-full bg-warning" />
          <span className="sr-only sm:not-sr-only">Unsaved changes</span>
        </span>
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
      aria-label="Preview device"
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
            <ToggleGroupItem value="desktop" aria-label="Desktop preview">
              <Monitor aria-hidden="true" className="size-3.5" />
              <span className="hidden lg:inline ml-1.5 text-xs font-medium uppercase tracking-wider">
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
            <ToggleGroupItem value="mobile" aria-label="Mobile preview">
              <Smartphone aria-hidden="true" className="size-3.5" />
              <span className="hidden lg:inline ml-1.5 text-xs font-medium uppercase tracking-wider">
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
      aria-label={isSaving ? "Saving…" : "Save"}
      aria-busy={isSaving || undefined}
      onClick={onClick}
      disabled={disabled}
      focusableWhenDisabled={isSaving}
    >
      {isSaving ? (
        <>
          <span
            aria-hidden="true"
            className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          <span className="hidden sm:inline text-xs font-medium">Saving…</span>
        </>
      ) : (
        <>
          <Save aria-hidden="true" className="size-3.5" />
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
          <Button variant="secondary" size="sm" onClick={onCopy}>
            {copied ? (
              <Check
                aria-hidden="true"
                className="size-3.5 mr-1 text-success"
              />
            ) : (
              <Copy className="size-3.5 mr-1" />
            )}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        <pre className="bg-invert text-invert-foreground p-4 rounded-xl text-xs overflow-auto max-h-[320px] font-mono leading-relaxed">
          {html.slice(0, EXPORT_PREVIEW_LIMIT)}
          {html.length > EXPORT_PREVIEW_LIMIT && (
            <span className="text-invert-foreground/70">
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
