"use client";

import { type EmailStudioFullConfig } from "@asym/config/email-studio";
import { type PDFStudioFullConfig } from "@asym/config/pdf-studio";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@asym/ui/components/shadcn/alert-dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
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
import { LegacyUnlayerDocumentEditor } from "@asym/ui/components/studio/legacy/UnlayerDocumentEditor";
import { PDFStudioSetupStatus } from "@asym/ui/components/studio/PDFStudioSetupStatus";
import { cn } from "@asym/ui/lib/utils";
import {
  FileText,
  Save,
  Download,
  Smartphone,
  Monitor,
  ChevronRight,
  Settings,
  FileCode,
  Undo2,
  Redo2,
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
  FileDown,
  Printer,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useReducer,
} from "react";
import { toast } from "sonner";

import type { PDFTemplateCategory } from "@/lib/pdf-studio";
import type { UnlayerDesignJSON } from "@asym/email/email-studio-types";
import type { LegacyUnlayerDocumentEditorHandle } from "@asym/ui/components/studio/legacy/UnlayerDocumentEditor";

import {
  PDF_TEMPLATE_CATEGORIES,
  PAGE_SIZES,
  ORIENTATIONS,
} from "@/lib/pdf-studio";

type PreviewDevice = "desktop" | "mobile";

interface PDFMetadata {
  id: string | null;
  name: string;
  description: string;
  category: PDFTemplateCategory;
  pageSize: "A4" | "Letter" | "Legal";
  orientation: "portrait" | "landscape";
}

interface PDFStudioUiState {
  isEditorReady: boolean;
  isSaving: boolean;
  isExporting: boolean;
  hasUnsavedChanges: boolean;
  previewDevice: PreviewDevice;
  showSaveDialog: boolean;
  showExportDialog: boolean;
  showDeleteDialog: boolean;
  exportedHtml: string;
  studioConfig: PDFStudioFullConfig | null;
  isFullscreen: boolean;
  copiedHtml: boolean;
}

type PDFStudioUiAction =
  | { type: "editor_ready"; config: PDFStudioFullConfig }
  | { type: "set_saving"; value: boolean }
  | { type: "set_exporting"; value: boolean }
  | { type: "set_unsaved_changes"; value: boolean }
  | { type: "set_preview_device"; value: PreviewDevice }
  | { type: "set_show_save_dialog"; value: boolean }
  | { type: "open_export_dialog"; html: string }
  | { type: "set_show_export_dialog"; value: boolean }
  | { type: "set_show_delete_dialog"; value: boolean }
  | { type: "set_fullscreen"; value: boolean }
  | { type: "toggle_fullscreen" }
  | { type: "set_copied_html"; value: boolean };

const DEFAULT_DESIGN: UnlayerDesignJSON = {
  counters: { u_column: 1, u_row: 1 },
  body: {
    rows: [],
    values: {
      backgroundColor: "#ffffff",
      contentWidth: "816px",
    },
  },
};

const DEFAULT_PDF_METADATA: PDFMetadata = {
  id: null,
  name: "Untitled Document",
  description: "",
  category: "custom",
  pageSize: "Letter",
  orientation: "portrait",
};

const INITIAL_PDF_STUDIO_UI_STATE: PDFStudioUiState = {
  isEditorReady: false,
  isSaving: false,
  isExporting: false,
  hasUnsavedChanges: false,
  previewDevice: "desktop",
  showSaveDialog: false,
  showExportDialog: false,
  showDeleteDialog: false,
  exportedHtml: "",
  studioConfig: null,
  isFullscreen: false,
  copiedHtml: false,
};

function pdfStudioUiReducer(
  state: PDFStudioUiState,
  action: PDFStudioUiAction,
): PDFStudioUiState {
  switch (action.type) {
    case "editor_ready":
      return {
        ...state,
        isEditorReady: true,
        studioConfig: action.config,
      };
    case "set_saving":
      return { ...state, isSaving: action.value };
    case "set_exporting":
      return { ...state, isExporting: action.value };
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
    case "set_show_delete_dialog":
      return { ...state, showDeleteDialog: action.value };
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

interface PDFStudioHeaderStatus {
  hasUnsavedChanges: boolean;
  isEditorReady: boolean;
  isSaving: boolean;
  isExporting: boolean;
  previewDevice: PreviewDevice;
  isFullscreen: boolean;
}

interface PDFStudioHeaderActions {
  onUndo: () => void;
  onRedo: () => void;
  onPreview: (device: PreviewDevice) => void;
  onExportPDF: () => void;
  onExportHtml: () => void;
  onSaveClick: () => void;
  onNewTemplate: () => void;
  onToggleFullscreen: () => void;
  onOpenDeleteDialog: () => void;
}

interface PDFStudioHeaderSectionProps {
  metadata: PDFMetadata;
  status: PDFStudioHeaderStatus;
  actions: PDFStudioHeaderActions;
}

function PDFStudioHeaderSection({
  metadata,
  status: {
    hasUnsavedChanges,
    isEditorReady,
    isSaving,
    isExporting,
    previewDevice,
    isFullscreen,
  },
  actions: {
    onUndo,
    onRedo,
    onPreview,
    onExportPDF,
    onExportHtml,
    onSaveClick,
    onNewTemplate,
    onToggleFullscreen,
    onOpenDeleteDialog,
  },
}: PDFStudioHeaderSectionProps) {
  return (
    <header className="h-12 md:h-14 bg-background border-b border-border flex items-center justify-between px-2 md:px-4 shrink-0 z-20">
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-600">
            <FileText className="size-4" />
          </div>
          <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider text-foreground">
            PDF Studio
          </span>
        </div>

        <div className="hidden md:block">
          <PDFStudioSetupStatus variant="badge" />
        </div>

        <Separator orientation="vertical" className="h-5 hidden md:block" />

        <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground min-w-0">
          <span className="shrink-0">Templates</span>
          <ChevronRight className="size-3 shrink-0" />
          <span className="font-medium text-foreground truncate max-w-[180px]">
            {metadata.name}
          </span>
          {hasUnsavedChanges && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-1 size-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
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
                className="size-7 p-0"
                onClick={onUndo}
                disabled={!isEditorReady}
              >
                <Undo2 className="size-3.5" />
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
                className="size-7 p-0"
                onClick={onRedo}
                disabled={!isEditorReady}
              >
                <Redo2 className="size-3.5" />
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
                  <Monitor className="size-3.5" />
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
                  <Smartphone className="size-3.5" />
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

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5"
                  disabled={!isEditorReady || isExporting}
                >
                  {isExporting ? (
                    <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Download className="size-3.5" />
                  )}
                  <span className="hidden sm:inline text-xs font-medium">
                    Export
                  </span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">Export options</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={onExportPDF}>
              <FileDown className="size-4 mr-2" />
              Export as PDF
              <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportHtml}>
              <FileCode className="size-4 mr-2" />
              Export as HTML
              <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => toast.info("Print functionality coming soon")}
            >
              <Printer className="size-4 mr-2" />
              Print
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
              <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span className="hidden sm:inline text-xs font-medium">
                Saving…
              </span>
            </>
          ) : (
            <>
              <Save className="size-3.5" />
              <span className="hidden sm:inline text-xs font-medium">Save</span>
            </>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="size-8 p-0">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={onNewTemplate}>
              <Plus className="size-4 mr-2" />
              New Document
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toast.info("Template settings coming soon")}
            >
              <Settings className="size-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toast.info("Load template coming soon")}
            >
              <FolderOpen className="size-4 mr-2" />
              Load Template
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toast.info("Duplicate coming soon")}
            >
              <Copy className="size-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => toast.info("Version history coming soon")}
            >
              <History className="size-4 mr-2" />
              Version History
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onNewTemplate}>
              <RotateCcw className="size-4 mr-2" />
              Reset Template
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onToggleFullscreen}>
              {isFullscreen ? (
                <Minimize2 className="size-4 mr-2" />
              ) : (
                <Maximize2 className="size-4 mr-2" />
              )}
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              <DropdownMenuShortcut>Esc</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              disabled={!metadata.id}
              onClick={onOpenDeleteDialog}
            >
              <Trash2 className="size-4 mr-2" />
              Delete Template
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function PDFSaveDialogSection({
  open,
  onOpenChange,
  metadata,
  setMetadata,
  isSaving,
  onConfirmSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metadata: PDFMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<PDFMetadata>>;
  isSaving: boolean;
  onConfirmSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <Save className="size-4 text-violet-600" />
            </div>
            {metadata.id ? "Update PDF Template" : "Save PDF Template"}
          </DialogTitle>
          <DialogDescription>
            Enter the details for your PDF template. These will help organize
            your documents.
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
              placeholder="e.g., Annual Tax Receipt"
              className="h-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category" className="text-xs font-medium">
                Category
              </Label>
              <Select
                value={metadata.category}
                onValueChange={(value: PDFTemplateCategory) =>
                  setMetadata((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger id="category" className="h-10">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {PDF_TEMPLATE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pageSize" className="text-xs font-medium">
                Page Size
              </Label>
              <Select
                value={metadata.pageSize}
                onValueChange={(value: "A4" | "Letter" | "Legal") =>
                  setMetadata((prev) => ({ ...prev, pageSize: value }))
                }
              >
                <SelectTrigger id="pageSize" className="h-10">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label} ({size.dimensions})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="orientation" className="text-xs font-medium">
              Orientation
            </Label>
            <Select
              value={metadata.orientation}
              onValueChange={(value: "portrait" | "landscape") =>
                setMetadata((prev) => ({ ...prev, orientation: value }))
              }
            >
              <SelectTrigger id="orientation" className="h-10">
                <SelectValue placeholder="Select orientation" />
              </SelectTrigger>
              <SelectContent>
                {ORIENTATIONS.map((orientation) => (
                  <SelectItem key={orientation.value} value={orientation.value}>
                    {orientation.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-xs font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={metadata.description}
              onChange={(e) =>
                setMetadata((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Brief description of this template's purpose…"
              className="h-20 resize-none text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              A brief description helps team members understand when to use this
              template.
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onConfirmSave}
            disabled={!metadata.name.trim() || isSaving}
          >
            {isSaving ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                Saving…
              </>
            ) : (
              <>
                <Save className="size-4 mr-2" />
                {metadata.id ? "Update Template" : "Save Template"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PDFExportDialogSection({
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
  studioConfig: PDFStudioFullConfig | null;
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
            <div className="p-2 rounded-lg bg-violet-500/10">
              <FileCode className="size-4 text-violet-600" />
            </div>
            Export HTML
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            Copy or download the generated HTML code for your document template.
            {studioConfig?.export.cleanupCss && (
              <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-medium">
                <Sparkles className="size-3" />
                Optimized
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
                  <Check className="size-3.5 mr-1 text-emerald-600" />
                ) : (
                  <Copy className="size-3.5 mr-1" />
                )}
                {copiedHtml ? "Copied!" : "Copy"}
              </Button>
            </div>
            <pre className="bg-zinc-950 text-zinc-100 p-4 rounded-xl text-xs overflow-auto max-h-[320px] font-mono leading-relaxed">
              {exportedHtml.slice(0, 3000)}
              {exportedHtml.length > 3000 && (
                <span className="text-zinc-500">
                  {`\n\n… truncated (${(exportedHtml.length - 3000).toLocaleString()} more characters)`}
                </span>
              )}
            </pre>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <span>{exportedHtml.length.toLocaleString()} characters</span>
            <span className="flex items-center gap-1">
              <Layers className="size-3" />
              Ready for PDF conversion
            </span>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="outline" onClick={onCopyHtml}>
            {copiedHtml ? (
              <Check className="size-4 mr-2 text-emerald-600" />
            ) : (
              <Copy className="size-4 mr-2" />
            )}
            {copiedHtml ? "Copied!" : "Copy HTML"}
          </Button>
          <Button onClick={onDownloadHtml}>
            <Download className="size-4 mr-2" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PDFDeleteDialogSection({
  open,
  onOpenChange,
  templateName,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateName: string;
  onDelete: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="size-5 text-destructive" />
            Delete Template
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &ldquo;{templateName}&rdquo;? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

type ExportPdfResult =
  | { ok: true; url?: string }
  | { ok: false; error: unknown };

async function runExportPdf(
  editor: LegacyUnlayerDocumentEditorHandle,
): Promise<ExportPdfResult> {
  try {
    const pdfResult = await editor.exportPdf();
    return { ok: true, url: pdfResult?.url ?? undefined };
  } catch (error) {
    return { ok: false, error };
  }
}

type DeleteTemplateResult = { ok: true } | { ok: false; error: string };

async function runDeletePdfTemplate(
  templateId: string,
): Promise<DeleteTemplateResult> {
  try {
    const response = await fetch(`/api/pdf-templates/${templateId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      return {
        ok: false,
        error: errorData.error ?? "Failed to delete template",
      };
    }
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete template";
    return { ok: false, error: message };
  }
}

type SaveTemplateResult =
  | { ok: true; templateId: string }
  | { ok: false; error: string };

async function runSaveTemplate(options: {
  editor: LegacyUnlayerDocumentEditorHandle;
  metadata: PDFMetadata;
}): Promise<SaveTemplateResult> {
  try {
    const exportData = await options.editor.exportHtml({
      minify: false,
      cleanup: true,
    });

    const payload = {
      name: options.metadata.name,
      description: options.metadata.description || undefined,
      design: exportData.design,
      html: exportData.html,
      category: options.metadata.category,
      page_size: options.metadata.pageSize,
      orientation: options.metadata.orientation,
      status: "draft",
    };

    const url = options.metadata.id
      ? `/api/pdf-templates/${options.metadata.id}`
      : "/api/pdf-templates";

    const method = options.metadata.id ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      return {
        ok: false,
        error: errorData.error ?? "Failed to save template",
      };
    }

    const { template } = await response.json();
    return { ok: true, templateId: template.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save template";
    return { ok: false, error: message };
  }
}

function usePDFStudioController() {
  const editorRef = useRef<LegacyUnlayerDocumentEditorHandle>(null);
  const [ui, dispatchUi] = useReducer(
    pdfStudioUiReducer,
    INITIAL_PDF_STUDIO_UI_STATE,
  );
  const currentDesignRef = useRef<UnlayerDesignJSON | null>(null);
  const [metadata, setMetadata] = useState<PDFMetadata>(DEFAULT_PDF_METADATA);
  const {
    isEditorReady,
    isSaving,
    isExporting,
    hasUnsavedChanges,
    previewDevice,
    showSaveDialog,
    showExportDialog,
    showDeleteDialog,
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
      const data = await editorRef.current.exportHtml({
        minify: false,
        cleanup: studioConfig?.export.cleanupCss ?? true,
      });
      dispatchUi({ type: "open_export_dialog", html: data.html });
    } catch {
      toast.error("Failed to export HTML");
    }
  }, [studioConfig]);

  const handleExportPDF = useCallback(async () => {
    if (!editorRef.current) return;
    dispatchUi({ type: "set_exporting", value: true });
    const result = await runExportPdf(editorRef.current);
    if (result.ok) {
      if (result.url) {
        window.open(result.url, "_blank");
        toast.success("PDF exported successfully", {
          description: "Your PDF is ready for download",
          duration: 4000,
        });
      } else {
        toast.info("PDF export initiated", {
          description: "Your document is being prepared for download…",
          duration: 3000,
        });
      }
    } else {
      console.error("PDF export error:", result.error);
      toast.error("Failed to export PDF", {
        description:
          "PDF export requires an Unlayer project ID. Configure your Unlayer account for PDF export.",
      });
    }
    dispatchUi({ type: "set_exporting", value: false });
  }, []);

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
      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault();
        handleExportPDF();
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
    handleExportPDF,
  ]);

  const handleEditorReady = useCallback(
    (config: PDFStudioFullConfig | EmailStudioFullConfig) => {
      dispatchUi({
        type: "editor_ready",
        config: config as PDFStudioFullConfig,
      });

      if (!config.account.isConfigured) {
        toast.info("PDF Studio is running in free mode", {
          description: "Configure your Unlayer account for full features",
          duration: 4000,
          action: {
            label: "Setup",
            onClick: () => {},
          },
        });
      }
    },
    [],
  );

  const handleDesignUpdate = useCallback((design: UnlayerDesignJSON) => {
    currentDesignRef.current = design;
    dispatchUi({ type: "set_unsaved_changes", value: true });
  }, []);

  const handleConfirmSave = useCallback(async () => {
    if (!editorRef.current) return;

    dispatchUi({ type: "set_show_save_dialog", value: false });
    dispatchUi({ type: "set_saving", value: true });

    const result = await runSaveTemplate({
      editor: editorRef.current,
      metadata,
    });

    if (result.ok) {
      setMetadata((prev) => ({ ...prev, id: result.templateId }));
      dispatchUi({ type: "set_unsaved_changes", value: false });

      toast.success("Template saved", {
        description: `"${metadata.name}" has been saved successfully`,
        duration: 3000,
      });
    } else {
      toast.error("Save failed", { description: result.error });
    }
    dispatchUi({ type: "set_saving", value: false });
  }, [metadata]);

  const handleDelete = useCallback(async () => {
    if (!metadata.id) return;

    dispatchUi({ type: "set_show_delete_dialog", value: false });

    const result = await runDeletePdfTemplate(metadata.id);
    if (result.ok) {
      toast.success("Template deleted");
      setMetadata(DEFAULT_PDF_METADATA);
      currentDesignRef.current = null;
      if (editorRef.current) {
        editorRef.current.loadDesign(DEFAULT_DESIGN);
      }
      dispatchUi({ type: "set_unsaved_changes", value: false });
    } else {
      toast.error("Delete failed", { description: result.error });
    }
  }, [metadata.id]);

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

  const handlePreview = useCallback((device: PreviewDevice) => {
    if (!editorRef.current) return;
    dispatchUi({ type: "set_preview_device", value: device });
    editorRef.current.showPreview(device);
  }, []);

  const handleNewTemplate = useCallback(() => {
    setMetadata(DEFAULT_PDF_METADATA);
    currentDesignRef.current = null;
    if (editorRef.current) {
      editorRef.current.loadDesign(DEFAULT_DESIGN);
    }
    dispatchUi({ type: "set_unsaved_changes", value: false });
    toast.info("New document created");
  }, []);

  return {
    editorRef,
    metadata,
    setMetadata,
    dispatchUi,
    isEditorReady,
    isSaving,
    isExporting,
    hasUnsavedChanges,
    previewDevice,
    showSaveDialog,
    showExportDialog,
    showDeleteDialog,
    exportedHtml,
    studioConfig,
    isFullscreen,
    copiedHtml,
    handleUndo,
    handleRedo,
    handleSaveClick,
    handleExportHtml,
    handleExportPDF,
    handleEditorReady,
    handleDesignUpdate,
    handleConfirmSave,
    handleDelete,
    handleCopyHtml,
    handleDownloadHtml,
    handlePreview,
    handleNewTemplate,
  };
}

export default function PDFStudio() {
  const {
    editorRef,
    metadata,
    setMetadata,
    dispatchUi,
    isEditorReady,
    isSaving,
    isExporting,
    hasUnsavedChanges,
    previewDevice,
    showSaveDialog,
    showExportDialog,
    showDeleteDialog,
    exportedHtml,
    studioConfig,
    isFullscreen,
    copiedHtml,
    handleUndo,
    handleRedo,
    handleSaveClick,
    handleExportHtml,
    handleExportPDF,
    handleEditorReady,
    handleDesignUpdate,
    handleConfirmSave,
    handleDelete,
    handleCopyHtml,
    handleDownloadHtml,
    handlePreview,
    handleNewTemplate,
  } = usePDFStudioController();

  return (
    <div
      className={cn(
        "flex flex-col bg-background transition-all duration-300",
        isFullscreen
          ? "fixed inset-0 z-50 overflow-hidden"
          : "flex-1 min-h-0 overflow-hidden",
      )}
    >
      <PDFStudioHeaderSection
        metadata={metadata}
        status={{
          hasUnsavedChanges,
          isEditorReady,
          isSaving,
          isExporting,
          previewDevice,
          isFullscreen,
        }}
        actions={{
          onUndo: handleUndo,
          onRedo: handleRedo,
          onPreview: handlePreview,
          onExportPDF: handleExportPDF,
          onExportHtml: handleExportHtml,
          onSaveClick: handleSaveClick,
          onNewTemplate: handleNewTemplate,
          onToggleFullscreen: () => dispatchUi({ type: "toggle_fullscreen" }),
          onOpenDeleteDialog: () =>
            dispatchUi({ type: "set_show_delete_dialog", value: true }),
        }}
      />

      <div className="flex-1 relative overflow-hidden bg-muted/30">
        <LegacyUnlayerDocumentEditor
          editorId="pdf-studio-editor"
          onReady={handleEditorReady}
          onDesignUpdate={handleDesignUpdate}
          ref={editorRef}
          className="absolute inset-0"
          appearance={{
            theme: "modern_light",
            panels: {
              tools: {
                dock: "right",
                collapsible: true,
                defaultUncollapsed: true,
              },
            },
          }}
        />
      </div>

      <PDFSaveDialogSection
        open={showSaveDialog}
        onOpenChange={(open) =>
          dispatchUi({ type: "set_show_save_dialog", value: open })
        }
        metadata={metadata}
        setMetadata={setMetadata}
        isSaving={isSaving}
        onConfirmSave={handleConfirmSave}
      />

      <PDFExportDialogSection
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

      <PDFDeleteDialogSection
        open={showDeleteDialog}
        onOpenChange={(open) =>
          dispatchUi({ type: "set_show_delete_dialog", value: open })
        }
        templateName={metadata.name}
        onDelete={handleDelete}
      />
    </div>
  );
}
