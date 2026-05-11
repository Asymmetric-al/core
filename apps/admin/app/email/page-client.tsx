"use client";
"use no memo";

import {
  getEmailStudioConfig,
  type EmailStudioFullConfig,
} from "@asym/config/email-studio";
import {
  EMPTY_REACT_EMAIL_DESIGN,
  type EmailBuilderKind,
  type EmailStudioEditorHandle,
  type EmailStudioExportResult,
} from "@asym/email/email-builder-types";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@asym/ui/components/shadcn/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Input } from "@asym/ui/components/shadcn/input";
import { Kbd } from "@asym/ui/components/shadcn/kbd";
import { Label } from "@asym/ui/components/shadcn/label";
import { Separator } from "@asym/ui/components/shadcn/separator";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@asym/ui/components/shadcn/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@asym/ui/components/shadcn/tooltip";
import { EmailStudioEditor } from "@asym/ui/components/studio/EmailStudioEditor";
import { EmailStudioMergeTagMenu } from "@asym/ui/components/studio/EmailStudioMergeTagMenu";
import { EmailStudioPreviewDialog } from "@asym/ui/components/studio/EmailStudioPreview";
import { EmailStudioProviderStatus } from "@asym/ui/components/studio/EmailStudioProviderStatus";
import { cn } from "@asym/ui/lib/utils";
import {
  Mail,
  Save,
  Download,
  Smartphone,
  Monitor,
  ChevronRight,
  Settings,
  FileCode,
  FileText,
  Undo2,
  Redo2,
  Send,
  Clock,
  MoreHorizontal,
  Copy,
  Trash2,
  FolderOpen,
  Plus,
  Check,
  Maximize2,
  Minimize2,
  Sparkles,
  History,
  Layers,
} from "lucide-react";
import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { toast } from "sonner";

type PreviewDevice = "desktop" | "mobile";

interface EmailMetadata {
  id: string | null;
  name: string;
  subject: string;
  preheader: string;
}

interface EmailTemplateListEntry {
  id: string;
  name: string;
  builder: EmailBuilderKind;
  builder_version: string | null;
  design_json: Record<string, unknown>;
  html_content: string | null;
  text_content: string | null;
  default_subject: string | null;
  default_preheader: string | null;
  version: number;
  updated_at: string;
}

interface EmailStudioUiState {
  isEditorReady: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  previewDevice: PreviewDevice;
  showSaveDialog: boolean;
  showExportDialog: boolean;
  exportedHtml: string;
  studioConfig: EmailStudioFullConfig | null;
  isFullscreen: boolean;
  copiedHtml: boolean;
}

type EmailStudioUiAction =
  | { type: "editor_ready"; config: EmailStudioFullConfig }
  | { type: "set_saving"; value: boolean }
  | { type: "set_unsaved_changes"; value: boolean }
  | { type: "set_preview_device"; value: PreviewDevice }
  | { type: "set_show_save_dialog"; value: boolean }
  | { type: "open_export_dialog"; html: string }
  | { type: "set_show_export_dialog"; value: boolean }
  | { type: "set_fullscreen"; value: boolean }
  | { type: "toggle_fullscreen" }
  | { type: "set_copied_html"; value: boolean };

const INITIAL_EMAIL_STUDIO_UI_STATE: EmailStudioUiState = {
  isEditorReady: false,
  isSaving: false,
  hasUnsavedChanges: false,
  previewDevice: "desktop",
  showSaveDialog: false,
  showExportDialog: false,
  exportedHtml: "",
  studioConfig: null,
  isFullscreen: false,
  copiedHtml: false,
};

function emailStudioUiReducer(
  state: EmailStudioUiState,
  action: EmailStudioUiAction,
): EmailStudioUiState {
  switch (action.type) {
    case "editor_ready":
      return {
        ...state,
        isEditorReady: true,
        studioConfig: action.config,
      };
    case "set_saving":
      return { ...state, isSaving: action.value };
    case "set_unsaved_changes":
      return { ...state, hasUnsavedChanges: action.value };
    case "set_preview_device":
      return { ...state, previewDevice: action.value };
    case "set_show_save_dialog":
      return { ...state, showSaveDialog: action.value };
    case "open_export_dialog":
      return {
        ...state,
        exportedHtml: action.html,
        showExportDialog: true,
      };
    case "set_show_export_dialog":
      return { ...state, showExportDialog: action.value };
    case "set_fullscreen":
      return { ...state, isFullscreen: action.value };
    case "toggle_fullscreen":
      return { ...state, isFullscreen: !state.isFullscreen };
    case "set_copied_html":
      return { ...state, copiedHtml: action.value };
    default:
      return state;
  }
}

interface EmailStudioHeaderProps {
  metadata: EmailMetadata;
  builder: EmailBuilderKind;
  legacyUnlayerEnabled: boolean;
  hasUnsavedChanges: boolean;
  isEditorReady: boolean;
  isSaving: boolean;
  previewDevice: PreviewDevice;
  isFullscreen: boolean;
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
}

function EmailStudioHeader({
  metadata,
  builder,
  legacyUnlayerEnabled,
  hasUnsavedChanges,
  isEditorReady,
  isSaving,
  previewDevice,
  isFullscreen,
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
    <header className="h-12 md:h-14 bg-background border-b border-border flex items-center justify-between px-2 md:px-4 shrink-0 z-20">
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Mail className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider text-foreground">
            Email Studio
          </span>
        </div>

        <div className="hidden md:block">
          <EmailStudioProviderStatus
            builder={builder}
            legacyUnlayerEnabled={legacyUnlayerEnabled}
            variant="badge"
          />
        </div>

        <Separator orientation="vertical" className="h-5 hidden md:block" />

        <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground min-w-0">
          <span className="shrink-0">Templates</span>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="font-medium text-foreground truncate max-w-[180px]">
            {metadata.name}
          </span>
          {hasUnsavedChanges && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-1 h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Unsaved changes</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 md:gap-2">
        <div className="hidden xl:flex items-center gap-1 p-0.5 bg-muted rounded-lg">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                aria-label="Undo"
                onClick={onUndo}
                disabled={!isEditorReady}
              >
                <Undo2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Undo</p>
              <Kbd className="ml-1.5">⌘Z</Kbd>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                aria-label="Redo"
                onClick={onRedo}
                disabled={!isEditorReady}
              >
                <Redo2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Redo</p>
              <Kbd className="ml-1.5">⌘⇧Z</Kbd>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="hidden md:block">
          <ToggleGroup
            type="single"
            value={previewDevice}
            onValueChange={(value) =>
              value && onPreview(value as PreviewDevice)
            }
            disabled={!isEditorReady}
            variant="outline"
            size="sm"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  value="desktop"
                  className="h-7 px-2.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline ml-1.5 text-[10px] font-medium uppercase tracking-wider">
                    Desktop
                  </span>
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom">Desktop preview</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  value="mobile"
                  className="h-7 px-2.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline ml-1.5 text-[10px] font-medium uppercase tracking-wider">
                    Mobile
                  </span>
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom">Mobile preview</TooltipContent>
            </Tooltip>
          </ToggleGroup>
        </div>

        <Separator orientation="vertical" className="h-5 hidden md:block" />

        <div className="hidden lg:block">
          <EmailStudioMergeTagMenu
            disabled={!isEditorReady}
            onInsert={onInsertMergeTag}
          />
        </div>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5"
                  disabled={!isEditorReady}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline text-xs font-medium">
                    Export
                  </span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">Export options</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={onExportHtml}>
              <FileCode className="h-4 w-4 mr-2" />
              Export as HTML
              <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toast.info("Coming soon: Export as PDF")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onTestSend}>
              <Send className="h-4 w-4 mr-2" />
              Send Test Email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          onClick={onSaveClick}
          disabled={!isEditorReady || isSaving}
          className="h-8 px-3 md:px-4 gap-1.5"
        >
          {isSaving ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span className="hidden sm:inline text-xs font-medium">
                Saving...
              </span>
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs font-medium">Save</span>
            </>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="More email template actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={onNewTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toast.info("Coming soon: Template settings")}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onLoadTemplate}>
              <FolderOpen className="h-4 w-4 mr-2" />
              Load Template
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toast.info("Coming soon: Duplicate")}
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => toast.info("Coming soon: Version history")}
            >
              <History className="h-4 w-4 mr-2" />
              Version History
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toast.info("Coming soon: Schedule send")}
            >
              <Clock className="h-4 w-4 mr-2" />
              Schedule Send
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onToggleFullscreen}>
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4 mr-2" />
              ) : (
                <Maximize2 className="h-4 w-4 mr-2" />
              )}
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              <DropdownMenuShortcut>Esc</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Template
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function EmailSaveDialog({
  open,
  onOpenChange,
  metadata,
  setMetadata,
  onConfirmSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metadata: EmailMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<EmailMetadata>>;
  onConfirmSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Save className="h-4 w-4 text-primary" />
            </div>
            Save Email Template
          </DialogTitle>
          <DialogDescription>
            Enter the details for your email template. These will be used when
            sending.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-xs font-medium">
              Template Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={metadata.name}
              onChange={(e) =>
                setMetadata((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Monthly Newsletter"
              className="h-10"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subject" className="text-xs font-medium">
              Email Subject
            </Label>
            <Input
              id="subject"
              value={metadata.subject}
              onChange={(e) =>
                setMetadata((prev) => ({ ...prev, subject: e.target.value }))
              }
              placeholder="e.g., Your December Update from Give Hope"
              className="h-10"
            />
            <p className="text-[11px] text-muted-foreground">
              The subject line recipients will see in their inbox.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="preheader" className="text-xs font-medium">
              Preheader Text
            </Label>
            <Textarea
              id="preheader"
              value={metadata.preheader}
              onChange={(e) =>
                setMetadata((prev) => ({
                  ...prev,
                  preheader: e.target.value,
                }))
              }
              placeholder="Preview text shown in email clients alongside the subject..."
              className="h-20 resize-none text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              This text appears as a preview in email clients. Keep it under 100
              characters.
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirmSave} disabled={!metadata.name.trim()}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EmailExportDialog({
  open,
  onOpenChange,
  studioConfig,
  exportedHtml,
  copiedHtml,
  onCopyHtml,
  onDownloadHtml,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studioConfig: EmailStudioFullConfig | null;
  exportedHtml: string;
  copiedHtml: boolean;
  onCopyHtml: () => void;
  onDownloadHtml: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileCode className="h-4 w-4 text-primary" />
            </div>
            Export HTML
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            Copy or download the generated HTML code for your email template.
            {studioConfig?.export.minifyHtml && (
              <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-medium">
                <Sparkles className="h-3 w-3" />
                Minified
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="relative group">
            <div className="absolute top-3 right-3 z-10">
              <Button
                variant="secondary"
                size="sm"
                className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={onCopyHtml}
              >
                {copiedHtml ? (
                  <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5 mr-1" />
                )}
                {copiedHtml ? "Copied!" : "Copy"}
              </Button>
            </div>
            <pre className="bg-slate-950 text-slate-100 p-4 rounded-xl text-xs overflow-auto max-h-[320px] font-mono leading-relaxed">
              {exportedHtml.slice(0, 3000)}
              {exportedHtml.length > 3000 && (
                <span className="text-slate-500">
                  {`\n\n... truncated (${(exportedHtml.length - 3000).toLocaleString()} more characters)`}
                </span>
              )}
            </pre>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <span>{exportedHtml.length.toLocaleString()} characters</span>
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              Ready for email clients
            </span>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="outline" onClick={onCopyHtml}>
            {copiedHtml ? (
              <Check className="h-4 w-4 mr-2 text-emerald-600" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {copiedHtml ? "Copied!" : "Copy HTML"}
          </Button>
          <Button onClick={onDownloadHtml}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EmailTestSendDialog({
  open,
  onOpenChange,
  toEmail,
  onToEmailChange,
  isSending,
  onSend,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toEmail: string;
  onToEmailChange: (value: string) => void;
  isSending: boolean;
  onSend: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <Send className="h-4 w-4 text-primary" />
            </div>
            Send test email
          </DialogTitle>
          <DialogDescription>
            Sends the current editor output through the tenant Resend
            connection.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-4">
          <Label htmlFor="test-to-email" className="text-xs font-medium">
            Recipient email
          </Label>
          <Input
            id="test-to-email"
            value={toEmail}
            onChange={(event) => onToEmailChange(event.target.value)}
            placeholder="you@example.com"
            type="email"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={isSending || !toEmail.trim()} onClick={onSend}>
            {isSending ? (
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EmailTemplatePickerDialog({
  open,
  onOpenChange,
  templates,
  isLoading,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: EmailTemplateListEntry[];
  isLoading: boolean;
  onSelect: (template: EmailTemplateListEntry) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <FolderOpen className="h-4 w-4 text-primary" />
            </div>
            Open template
          </DialogTitle>
          <DialogDescription>
            Reopen a saved template from the tenant template store.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[420px] overflow-y-auto py-2">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Loading templates...
            </div>
          ) : templates.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              No saved templates yet.
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className="flex w-full items-center justify-between rounded-md border bg-background px-3 py-3 text-left transition-colors hover:bg-muted"
                  onClick={() => onSelect(template)}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {template.name}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {template.builder === "react_email"
                        ? "React Email"
                        : "Legacy Unlayer"}{" "}
                      · v{template.version}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface PersistTemplateResponse {
  success: boolean;
  template?: {
    id: string;
    name: string;
    builder: EmailBuilderKind;
    version: number;
  };
  error?: string;
}

async function fetchEmailTemplates(): Promise<EmailTemplateListEntry[]> {
  const response = await fetch("/api/email/templates", {
    method: "GET",
  });
  const body = (await response.json().catch(() => null)) as {
    success?: boolean;
    templates?: EmailTemplateListEntry[];
    error?: string;
  } | null;

  if (!response.ok || !body?.success) {
    throw new Error(body?.error ?? "Failed to load templates");
  }

  return body.templates ?? [];
}

async function persistEmailTemplate(
  metadata: EmailMetadata,
  exportResult: EmailStudioExportResult,
): Promise<PersistTemplateResponse> {
  const payload = {
    name: metadata.name.trim(),
    category: "campaign",
    builder: exportResult.builder,
    builderVersion: exportResult.builderVersion,
    designJson: exportResult.design,
    htmlContent: exportResult.html,
    textContent: exportResult.text,
    defaultSubject: metadata.subject || null,
    defaultPreheader: metadata.preheader || null,
    editorMetadata: {
      source: "admin_email_studio",
      savedAt: new Date().toISOString(),
    },
  };

  const response = await fetch(
    metadata.id
      ? `/api/email/templates/${metadata.id}`
      : "/api/email/templates",
    {
      method: metadata.id ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  const body = (await response
    .json()
    .catch(() => null)) as PersistTemplateResponse | null;

  if (!response.ok || !body?.success) {
    throw new Error(body?.error ?? "Failed to save template");
  }

  return body;
}

async function sendTemplateTestEmail(input: {
  toEmail: string;
  metadata: EmailMetadata;
  exportResult: EmailStudioExportResult;
}) {
  const response = await fetch(
    input.metadata.id
      ? `/api/email/templates/${input.metadata.id}/test-send`
      : "/api/email/templates/test-send",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        toEmail: input.toEmail,
        subject: input.metadata.subject || input.metadata.name,
        preheader: input.metadata.preheader || undefined,
        builder: input.exportResult.builder,
        builderVersion: input.exportResult.builderVersion,
        designJson: input.exportResult.design,
        html: input.exportResult.html,
        text: input.exportResult.text,
      }),
    },
  );

  const body = (await response.json().catch(() => null)) as {
    success?: boolean;
    error?: string;
    messageId?: string | null;
  } | null;

  if (!response.ok || !body?.success) {
    throw new Error(body?.error ?? "Failed to send test email");
  }

  return body;
}

export default function EmailStudio() {
  const editorRef = useRef<EmailStudioEditorHandle>(null);
  const runtimeConfig = useMemo(() => getEmailStudioConfig(), []);
  const [ui, dispatchUi] = useReducer(
    emailStudioUiReducer,
    INITIAL_EMAIL_STUDIO_UI_STATE,
  );
  const [builder, setBuilder] = useState<EmailBuilderKind>(
    runtimeConfig.builder.defaultBuilder,
  );
  const [initialDesign, setInitialDesign] = useState<Record<string, unknown>>(
    EMPTY_REACT_EMAIL_DESIGN,
  );
  const [previewResult, setPreviewResult] =
    useState<EmailStudioExportResult | null>(null);
  const [showTestSendDialog, setShowTestSendDialog] = useState(false);
  const [testToEmail, setTestToEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplateListEntry[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [metadata, setMetadata] = useState<EmailMetadata>({
    id: null,
    name: "Untitled Email",
    subject: "",
    preheader: "",
  });
  const {
    isEditorReady,
    isSaving,
    hasUnsavedChanges,
    previewDevice,
    showSaveDialog,
    showExportDialog,
    exportedHtml,
    studioConfig,
    isFullscreen,
    copiedHtml,
  } = ui;

  const handleUndo = useCallback(() => {
    editorRef.current?.undo();
  }, []);

  const handleRedo = useCallback(() => {
    editorRef.current?.redo();
  }, []);

  const handleSaveClick = useCallback(() => {
    if (!editorRef.current) return;
    dispatchUi({ type: "set_show_save_dialog", value: true });
  }, []);

  const handleExportHtml = useCallback(async () => {
    if (!editorRef.current) return;
    try {
      const data = await editorRef.current.exportEmail({
        subject: metadata.subject,
        preheader: metadata.preheader,
        minify: studioConfig?.export.minifyHtml ?? true,
      });
      dispatchUi({ type: "open_export_dialog", html: data.html });
    } catch {
      toast.error("Failed to export HTML");
    }
  }, [metadata.preheader, metadata.subject, studioConfig]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (isEditorReady && !isSaving) {
          handleSaveClick();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "z") {
        e.preventDefault();
        handleRedo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault();
        handleExportHtml();
      }
      if (e.key === "Escape" && isFullscreen) {
        dispatchUi({ type: "set_fullscreen", value: false });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isEditorReady,
    isSaving,
    isFullscreen,
    handleSaveClick,
    handleUndo,
    handleRedo,
    handleExportHtml,
  ]);

  const handleEditorReady = useCallback(
    (readyBuilder: EmailBuilderKind) => {
      setBuilder(readyBuilder);
      dispatchUi({ type: "editor_ready", config: runtimeConfig });
    },
    [runtimeConfig],
  );

  const handleDesignUpdate = useCallback(() => {
    dispatchUi({ type: "set_unsaved_changes", value: true });
  }, []);

  const handleConfirmSave = useCallback(async () => {
    if (!editorRef.current) return;

    dispatchUi({ type: "set_show_save_dialog", value: false });
    dispatchUi({ type: "set_saving", value: true });

    try {
      const exportResult = await editorRef.current.exportEmail({
        subject: metadata.subject,
        preheader: metadata.preheader,
        minify: studioConfig?.export.minifyHtml ?? true,
      });
      const result = await persistEmailTemplate(metadata, exportResult);

      dispatchUi({ type: "set_unsaved_changes", value: false });

      if (result.template?.id) {
        setMetadata((prev) => ({
          ...prev,
          id: result.template?.id ?? prev.id,
          name: result.template?.name ?? prev.name,
        }));
      }

      toast.success("Template saved", {
        description: `"${metadata.name}" has been saved successfully`,
        duration: 3000,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save template",
      );
    } finally {
      dispatchUi({ type: "set_saving", value: false });
    }
  }, [metadata, studioConfig]);

  const handleCopyHtml = useCallback(() => {
    navigator.clipboard.writeText(exportedHtml);
    dispatchUi({ type: "set_copied_html", value: true });
    toast.success("HTML copied to clipboard");
    setTimeout(
      () => dispatchUi({ type: "set_copied_html", value: false }),
      2000,
    );
  }, [exportedHtml]);

  const handleDownloadHtml = useCallback(() => {
    const blob = new Blob([exportedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${metadata.name.toLowerCase().replace(/\s+/g, "-")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("HTML downloaded");
  }, [exportedHtml, metadata.name]);

  const handlePreview = useCallback(
    async (device: PreviewDevice) => {
      if (!editorRef.current) return;
      dispatchUi({ type: "set_preview_device", value: device });

      try {
        const result = await editorRef.current.exportEmail({
          subject: metadata.subject,
          preheader: metadata.preheader,
          minify: studioConfig?.export.minifyHtml ?? true,
        });
        setPreviewResult(result);
      } catch {
        toast.error("Failed to generate preview");
      }
    },
    [metadata.preheader, metadata.subject, studioConfig],
  );

  const handleNewTemplate = useCallback(() => {
    setMetadata({
      id: null,
      name: "Untitled Email",
      subject: "",
      preheader: "",
    });
    if (editorRef.current) {
      editorRef.current.loadDesign(EMPTY_REACT_EMAIL_DESIGN);
    }
    setInitialDesign(EMPTY_REACT_EMAIL_DESIGN);
    setBuilder(runtimeConfig.builder.defaultBuilder);
    dispatchUi({ type: "set_unsaved_changes", value: false });
    toast.info("New template created");
  }, [runtimeConfig.builder.defaultBuilder]);

  const handleInsertMergeTag = useCallback((key: string) => {
    editorRef.current?.insertMergeTag?.(key);
    dispatchUi({ type: "set_unsaved_changes", value: true });
  }, []);

  const handleOpenTestSend = useCallback(() => {
    if (!editorRef.current) return;
    setShowTestSendDialog(true);
  }, []);

  const handleOpenTemplatePicker = useCallback(async () => {
    setShowTemplatePicker(true);
    setIsLoadingTemplates(true);
    try {
      setTemplates(await fetchEmailTemplates());
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load templates",
      );
    } finally {
      setIsLoadingTemplates(false);
    }
  }, []);

  const handleSelectTemplate = useCallback(
    (template: EmailTemplateListEntry) => {
      const isSameBuilder = template.builder === builder;
      setInitialDesign(template.design_json);
      setBuilder(template.builder);
      setMetadata({
        id: template.id,
        name: template.name,
        subject: template.default_subject ?? "",
        preheader: template.default_preheader ?? "",
      });
      if (isSameBuilder) {
        editorRef.current?.loadDesign(template.design_json);
      }
      dispatchUi({ type: "set_unsaved_changes", value: false });
      setShowTemplatePicker(false);
      toast.success("Template opened", {
        description: template.name,
      });
    },
    [builder],
  );

  const handleSendTestEmail = useCallback(async () => {
    if (!editorRef.current) return;
    setIsSendingTest(true);
    try {
      const exportResult = await editorRef.current.exportEmail({
        subject: metadata.subject || metadata.name,
        preheader: metadata.preheader,
        minify: studioConfig?.export.minifyHtml ?? true,
      });
      const result = await sendTemplateTestEmail({
        toEmail: testToEmail,
        metadata,
        exportResult,
      });

      setShowTestSendDialog(false);
      toast.success("Test email sent", {
        description: result.messageId ?? undefined,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send test email",
      );
    } finally {
      setIsSendingTest(false);
    }
  }, [metadata, studioConfig, testToEmail]);

  return (
    <div
      className={cn(
        "flex flex-col bg-background transition-all duration-300",
        isFullscreen
          ? "fixed inset-0 z-50 overflow-hidden"
          : "flex-1 min-h-0 overflow-hidden",
      )}
    >
      <EmailStudioHeader
        metadata={metadata}
        builder={builder}
        legacyUnlayerEnabled={runtimeConfig.builder.legacyUnlayerEnabled}
        hasUnsavedChanges={hasUnsavedChanges}
        isEditorReady={isEditorReady}
        isSaving={isSaving}
        previewDevice={previewDevice}
        isFullscreen={isFullscreen}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onPreview={handlePreview}
        onExportHtml={handleExportHtml}
        onTestSend={handleOpenTestSend}
        onInsertMergeTag={handleInsertMergeTag}
        onSaveClick={handleSaveClick}
        onNewTemplate={handleNewTemplate}
        onLoadTemplate={handleOpenTemplatePicker}
        onToggleFullscreen={() => dispatchUi({ type: "toggle_fullscreen" })}
      />

      <div className="flex-1 relative overflow-hidden bg-muted/30">
        <EmailStudioEditor
          key={`${builder}:${metadata.id ?? "draft"}`}
          builder={builder}
          legacyUnlayerEnabled={runtimeConfig.builder.legacyUnlayerEnabled}
          initialDesign={initialDesign}
          templateId={metadata.id}
          onReady={handleEditorReady}
          onDesignUpdate={handleDesignUpdate}
          ref={editorRef}
          className="absolute inset-0"
        />
      </div>

      <EmailSaveDialog
        open={showSaveDialog}
        onOpenChange={(open) =>
          dispatchUi({ type: "set_show_save_dialog", value: open })
        }
        metadata={metadata}
        setMetadata={setMetadata}
        onConfirmSave={handleConfirmSave}
      />

      <EmailExportDialog
        open={showExportDialog}
        onOpenChange={(open) =>
          dispatchUi({ type: "set_show_export_dialog", value: open })
        }
        studioConfig={studioConfig}
        exportedHtml={exportedHtml}
        copiedHtml={copiedHtml}
        onCopyHtml={handleCopyHtml}
        onDownloadHtml={handleDownloadHtml}
      />

      <EmailStudioPreviewDialog
        open={previewResult !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewResult(null);
        }}
        html={previewResult?.html ?? ""}
        text={previewResult?.text ?? ""}
        subject={metadata.subject}
        preheader={metadata.preheader}
      />

      <EmailTestSendDialog
        open={showTestSendDialog}
        onOpenChange={setShowTestSendDialog}
        toEmail={testToEmail}
        onToEmailChange={setTestToEmail}
        isSending={isSendingTest}
        onSend={handleSendTestEmail}
      />

      <EmailTemplatePickerDialog
        open={showTemplatePicker}
        onOpenChange={setShowTemplatePicker}
        templates={templates}
        isLoading={isLoadingTemplates}
        onSelect={handleSelectTemplate}
      />
    </div>
  );
}
