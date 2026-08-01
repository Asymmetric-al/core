"use client";

import { type EmailStudioFullConfig } from "@asym/config/email-studio";
import { type PDFStudioFullConfig } from "@asym/config/pdf-studio";
import {
  DocumentTemplateV1Schema,
  starterPdfTemplateFixtureByCategory,
  type DocumentTemplateV1,
  type TemplateCategory,
} from "@asym/pdf-template-schema";
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

import type { PDFTemplateCategory, PDFTemplateEngine } from "@/lib/pdf-studio";
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
  engine: PDFTemplateEngine;
}

interface PDFTemplateListEntry {
  id: string;
  name: string;
  description: string | null;
  design: UnlayerDesignJSON;
  html: string | null;
  category: PDFTemplateCategory;
  page_size: "A4" | "Letter" | "Legal";
  orientation: "portrait" | "landscape";
  status: "draft" | "published" | "archived";
  engine?: PDFTemplateEngine;
  native_schema_version?: number | null;
  updated_at: string;
}

interface NativePreviewState {
  html: string;
  diagnostics: Array<{
    code: string;
    severity: "info" | "warning" | "error";
    message: string;
    path?: string[];
  }>;
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
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
  engine: "unlayer",
};

const EMPTY_NATIVE_PREVIEW_STATE: NativePreviewState = {
  diagnostics: [],
  error: null,
  html: "",
  status: "idle",
};

const nativeBuilderPublicEnabled =
  process.env.NEXT_PUBLIC_PDF_STUDIO_NATIVE_BUILDER_ENABLED === "true";

const coreToNativeCategory: Record<PDFTemplateCategory, TemplateCategory> = {
  annual_statement: "annual_giving_statement",
  certificate: "certificate",
  custom: "custom",
  donation_receipt: "donation_receipt",
  invoice: "invoice",
  letter: "donor_letter",
  missionary_report: "missionary_report",
  report: "financial_report",
  tax_receipt: "tax_receipt",
};

const nativeToCoreCategory: Record<TemplateCategory, PDFTemplateCategory> = {
  annual_giving_statement: "annual_statement",
  certificate: "certificate",
  custom: "custom",
  donation_receipt: "donation_receipt",
  donor_letter: "letter",
  financial_report: "report",
  invoice: "invoice",
  missionary_report: "missionary_report",
  tax_receipt: "tax_receipt",
};

function createNativeTemplateFromMetadata(
  metadata: PDFMetadata,
): DocumentTemplateV1 {
  const nativeCategory = coreToNativeCategory[metadata.category];
  const fixtureCategory =
    nativeCategory === "custom" ? "donation_receipt" : nativeCategory;
  const fixture = starterPdfTemplateFixtureByCategory[fixtureCategory];
  const now = new Date().toISOString();

  return {
    ...fixture.template,
    category: nativeCategory,
    id: metadata.id ?? crypto.randomUUID(),
    metadata: {
      ...fixture.template.metadata,
      description: metadata.description || undefined,
      tags: fixture.template.metadata.tags,
      updatedAt: now,
    },
    name: metadata.name,
    pageSettings: {
      ...fixture.template.pageSettings,
      orientation: metadata.orientation,
      pageSize: corePageSizeToNative(metadata.pageSize),
    },
    status: "draft",
  };
}

function stringifyNativeTemplate(template: DocumentTemplateV1): string {
  return JSON.stringify(template, null, 2);
}

function parseNativeTemplateJson(value: string): DocumentTemplateV1 {
  return DocumentTemplateV1Schema.parse(JSON.parse(value));
}

function corePageSizeToNative(
  pageSize: PDFMetadata["pageSize"],
): DocumentTemplateV1["pageSettings"]["pageSize"] {
  if (pageSize === "A4") return "a4";
  if (pageSize === "Legal") return "legal";
  return "letter";
}

function nativePageSizeToCore(
  pageSize: DocumentTemplateV1["pageSettings"]["pageSize"],
): PDFMetadata["pageSize"] {
  if (pageSize === "a4") return "A4";
  if (pageSize === "legal") return "Legal";
  return "Letter";
}

function metadataFromNativeTemplate(
  template: DocumentTemplateV1,
  existingId: string | null,
): PDFMetadata {
  return {
    category: nativeToCoreCategory[template.category],
    description: template.metadata.description ?? "",
    engine: "asym_pdf_document_builder",
    id: existingId,
    name: template.name,
    orientation: template.pageSettings.orientation,
    pageSize: nativePageSizeToCore(template.pageSettings.pageSize),
  };
}

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
  engine: PDFTemplateEngine;
  nativeBuilderEnabled: boolean;
}

interface PDFStudioHeaderActions {
  onUndo: () => void;
  onRedo: () => void;
  onPreview: (device: PreviewDevice) => void;
  onExportPDF: () => void;
  onExportHtml: () => void;
  onSaveClick: () => void;
  onNewTemplate: () => void;
  onNewNativeTemplate: () => void;
  onLoadTemplate: () => void;
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
    engine,
    nativeBuilderEnabled,
  },
  actions: {
    onUndo,
    onRedo,
    onPreview,
    onExportPDF,
    onExportHtml,
    onSaveClick,
    onNewTemplate,
    onNewNativeTemplate,
    onLoadTemplate,
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
      </div>

      <div className="flex items-center gap-1.5 md:gap-2">
        <div className="hidden xl:flex items-center gap-1 p-0.5 bg-muted rounded-lg">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-7 p-0"
                  onClick={onUndo}
                  disabled={!isEditorReady}
                >
                  <Undo2 className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent side="bottom">
              <p>Undo</p>
              <Kbd className="ml-1.5">⌘Z</Kbd>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-7 p-0"
                  onClick={onRedo}
                  disabled={!isEditorReady}
                >
                  <Redo2 className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent side="bottom">
              <p>Redo</p>
              <Kbd className="ml-1.5">⌘⇧Z</Kbd>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="hidden md:block">
          <ToggleGroup
            value={[previewDevice]}
            onValueChange={(groupValue) => {
              const next = groupValue[0];
              if (next) {
                onPreview(next as PreviewDevice);
              }
            }}
            disabled={!isEditorReady}
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
        </div>

        <Separator orientation="vertical" className="h-5 hidden md:block" />

        <div className="hidden lg:flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium uppercase text-muted-foreground">
          <FileCode className="size-3" />
          {engine === "asym_pdf_document_builder" ? "Native" : "Unlayer"}
        </div>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger
              render={
                <DropdownMenuTrigger
                  render={
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
                  }
                />
              }
            />
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
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0"
                aria-label="More PDF template actions"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={onNewTemplate}>
              <Plus className="size-4 mr-2" />
              New Document
            </DropdownMenuItem>
            {nativeBuilderEnabled && (
              <DropdownMenuItem onClick={onNewNativeTemplate}>
                <Sparkles className="size-4 mr-2" />
                New Native Document
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => toast.info("Template settings coming soon")}
            >
              <Settings className="size-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onLoadTemplate}>
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
              Archive Template
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
                onValueChange={(value) => {
                  if (value === null) {
                    return;
                  }
                  setMetadata((prev) => ({
                    ...prev,
                    category: value as PDFTemplateCategory,
                  }));
                }}
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
                onValueChange={(value) => {
                  if (value === null) {
                    return;
                  }
                  setMetadata((prev) => ({ ...prev, pageSize: value }));
                }}
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
              onValueChange={(value) => {
                if (value === null) {
                  return;
                }
                setMetadata((prev) => ({ ...prev, orientation: value }));
              }}
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
  engine,
  studioConfig,
  exportedHtml,
  copiedHtml,
  onCopyHtml,
  onDownloadHtml,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  engine: PDFTemplateEngine;
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
            {engine === "asym_pdf_document_builder"
              ? "Export Native JSON"
              : "Export HTML"}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {engine === "asym_pdf_document_builder"
              ? "Copy or download the native document source."
              : "Copy or download the generated HTML code for your document template."}
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
              {engine === "asym_pdf_document_builder"
                ? "Native source"
                : "Ready for PDF conversion"}
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
            {copiedHtml
              ? "Copied!"
              : engine === "asym_pdf_document_builder"
                ? "Copy JSON"
                : "Copy HTML"}
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
            Archive Template
          </AlertDialogTitle>
          <AlertDialogDescription>
            Archive &ldquo;{templateName}&rdquo;? It will disappear from the
            active template list without deleting historical database rows.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Archive
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function PDFTemplatePickerDialog({
  open,
  onOpenChange,
  templates,
  isLoading,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: PDFTemplateListEntry[];
  isLoading: boolean;
  onSelect: (template: PDFTemplateListEntry) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="rounded-lg bg-violet-500/10 p-2">
              <FolderOpen className="h-4 w-4 text-violet-600" />
            </div>
            Open PDF template
          </DialogTitle>
          <DialogDescription>
            Reopen a tenant PDF template from Mission Control storage.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[420px] overflow-y-auto py-2">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Loading templates…
            </div>
          ) : templates.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              No saved PDF templates yet.
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className="flex w-full items-center justify-between rounded-md border bg-background p-3 text-left transition-colors hover:bg-muted"
                  onClick={() => onSelect(template)}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {template.name}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {template.category.replace(/_/g, " ")} ·{" "}
                      {template.page_size} · {template.orientation} ·{" "}
                      {template.engine === "asym_pdf_document_builder"
                        ? "native"
                        : "unlayer"}{" "}
                      · {template.status}
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

function NativePdfDocumentBuilderSection({
  templateText,
  preview,
  onTemplateTextChange,
  onPreview,
}: {
  templateText: string;
  preview: NativePreviewState;
  onTemplateTextChange: (value: string) => void;
  onPreview: () => void;
}) {
  return (
    <div className="absolute inset-0 grid min-h-0 grid-cols-1 bg-background lg:grid-cols-[minmax(360px,0.92fr)_minmax(420px,1.08fr)]">
      <section className="flex min-h-0 flex-col border-r bg-background">
        <div className="flex h-12 shrink-0 items-center justify-between border-b px-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileCode className="size-4 text-muted-foreground" />
            Document JSON
          </div>
          <Button size="sm" variant="outline" onClick={onPreview}>
            <Monitor className="mr-2 size-4" />
            Preview
          </Button>
        </div>
        <Textarea
          value={templateText}
          onChange={(event) => onTemplateTextChange(event.target.value)}
          spellCheck={false}
          className="min-h-0 flex-1 resize-none rounded-none border-0 font-mono text-xs leading-relaxed shadow-none focus-visible:ring-0"
        />
      </section>

      <section className="flex min-h-0 flex-col bg-muted/30">
        <div className="flex h-12 shrink-0 items-center justify-between border-b bg-background px-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Monitor className="size-4 text-muted-foreground" />
            Authoring Preview
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {preview.status === "loading" && (
              <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {preview.status}
          </div>
        </div>
        <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto]">
          <iframe
            title="Native PDF authoring preview"
            srcDoc={preview.html}
            className="h-full w-full bg-white"
          />
          <div className="max-h-40 overflow-y-auto border-t bg-background p-3">
            {preview.error ? (
              <div className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{preview.error}</span>
              </div>
            ) : preview.diagnostics.length > 0 ? (
              <div className="space-y-2">
                {preview.diagnostics.map((diagnostic, index) => (
                  <div
                    key={`${diagnostic.code}-${index}`}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                  >
                    <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                    <span>
                      {diagnostic.severity}: {diagnostic.message}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="size-3.5" />
                Preview ready
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
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

async function fetchPdfTemplates(): Promise<PDFTemplateListEntry[]> {
  const response = await fetch("/api/pdf-templates", {
    method: "GET",
  });
  const body = (await response.json().catch(() => null)) as {
    success?: boolean;
    templates?: PDFTemplateListEntry[];
    error?: string;
  } | null;

  if (!response.ok || !body?.success) {
    throw new Error(body?.error ?? "Failed to load PDF templates");
  }

  return body.templates ?? [];
}

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
        error: errorData.error ?? "Failed to archive template",
      };
    }
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to archive template";
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

async function runSaveNativeTemplate(options: {
  template: DocumentTemplateV1;
  metadata: PDFMetadata;
}): Promise<SaveTemplateResult> {
  try {
    const payload = {
      id: options.metadata.id ?? options.template.id,
      name: options.metadata.name,
      description: options.metadata.description || undefined,
      design: options.template,
      html: null,
      category: options.metadata.category,
      page_size: options.metadata.pageSize,
      orientation: options.metadata.orientation,
      status: "draft",
      engine: "asym_pdf_document_builder",
      native_schema_version: options.template.version,
      migration_status: "rebuilt",
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
        error: errorData.error ?? "Failed to save native template",
      };
    }

    const { template } = await response.json();
    return { ok: true, templateId: template.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save native template";
    return { ok: false, error: message };
  }
}

async function runNativePreview(template: DocumentTemplateV1) {
  const sampleDataCategory =
    template.category === "custom" ? "donation_receipt" : template.category;
  const response = await fetch("/api/pdf-templates/native/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      dataContext:
        starterPdfTemplateFixtureByCategory[sampleDataCategory].sampleData,
      previewId: `native_preview_${template.id}`,
      template,
    }),
  });
  const body = (await response.json().catch(() => null)) as {
    success?: boolean;
    preflight?: {
      diagnostics?: NativePreviewState["diagnostics"];
    };
    preview?: {
      diagnostics?: NativePreviewState["diagnostics"];
      snapshots?: {
        html?: string;
      };
    };
    error?: string;
  } | null;

  if (!response.ok || !body?.success) {
    throw new Error(body?.error ?? "Failed to preview native template");
  }

  return {
    diagnostics: [
      ...(body.preflight?.diagnostics ?? []),
      ...(body.preview?.diagnostics ?? []),
    ],
    html: body.preview?.snapshots?.html ?? "",
  };
}

function usePDFStudioController() {
  const editorRef = useRef<LegacyUnlayerDocumentEditorHandle>(null);
  const [ui, dispatchUi] = useReducer(
    pdfStudioUiReducer,
    INITIAL_PDF_STUDIO_UI_STATE,
  );
  const currentDesignRef = useRef<UnlayerDesignJSON | null>(null);
  const [metadata, setMetadata] = useState<PDFMetadata>(DEFAULT_PDF_METADATA);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [templates, setTemplates] = useState<PDFTemplateListEntry[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [nativeTemplateText, setNativeTemplateText] = useState(() =>
    stringifyNativeTemplate(
      createNativeTemplateFromMetadata(DEFAULT_PDF_METADATA),
    ),
  );
  const [nativePreview, setNativePreview] = useState<NativePreviewState>(
    EMPTY_NATIVE_PREVIEW_STATE,
  );
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
    if (metadata.engine !== "asym_pdf_document_builder" && !editorRef.current) {
      return;
    }
    dispatchUi({ type: "set_show_save_dialog", value: true });
  }, [metadata.engine]);

  const handleExportHtml = useCallback(async () => {
    if (metadata.engine === "asym_pdf_document_builder") {
      dispatchUi({ type: "open_export_dialog", html: nativeTemplateText });
      return;
    }
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
  }, [metadata.engine, nativeTemplateText, studioConfig]);

  const handleExportPDF = useCallback(async () => {
    if (metadata.engine === "asym_pdf_document_builder") {
      try {
        dispatchUi({ type: "set_exporting", value: true });
        const template = parseNativeTemplateJson(nativeTemplateText);
        const response = await fetch("/api/pdf-templates/native/render", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dataContext:
              starterPdfTemplateFixtureByCategory[
                template.category === "custom"
                  ? "donation_receipt"
                  : template.category
              ].sampleData,
            renderId: `native_render_${template.id}`,
            template,
          }),
        });
        const body = (await response.json().catch(() => null)) as {
          render?: { status?: string; errors?: Array<{ message: string }> };
          error?: string;
        } | null;
        const renderStatus = body?.render?.status;

        if (!response.ok || renderStatus === "error") {
          toast.error("Native render unavailable", {
            description:
              body?.render?.errors?.[0]?.message ??
              body?.error ??
              "Official output requires native render rollout and DocRaptor server config.",
          });
        } else {
          toast.success("Native render completed");
        }
      } catch (error) {
        toast.error("Native render failed", {
          description:
            error instanceof Error ? error.message : "Invalid native template",
        });
      } finally {
        dispatchUi({ type: "set_exporting", value: false });
      }
      return;
    }

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
  }, [metadata.engine, nativeTemplateText]);

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

  const handleNativeTemplateTextChange = useCallback((value: string) => {
    setNativeTemplateText(value);
    dispatchUi({ type: "set_unsaved_changes", value: true });
  }, []);

  const handleConfirmSave = useCallback(async () => {
    if (metadata.engine !== "asym_pdf_document_builder" && !editorRef.current) {
      return;
    }

    dispatchUi({ type: "set_show_save_dialog", value: false });
    dispatchUi({ type: "set_saving", value: true });

    let result: SaveTemplateResult;
    let normalizedNativeTemplateText: string | null = null;

    if (metadata.engine === "asym_pdf_document_builder") {
      try {
        const template = parseNativeTemplateJson(nativeTemplateText);
        const normalizedTemplate = {
          ...template,
          category: coreToNativeCategory[metadata.category],
          name: metadata.name,
          pageSettings: {
            ...template.pageSettings,
            orientation: metadata.orientation,
            pageSize: corePageSizeToNative(metadata.pageSize),
          },
          status: "draft" as const,
        };
        normalizedNativeTemplateText =
          stringifyNativeTemplate(normalizedTemplate);
        result = await runSaveNativeTemplate({
          metadata,
          template: normalizedTemplate,
        });
      } catch (error) {
        result = {
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : "Native template JSON is invalid",
        };
      }
    } else {
      result = await runSaveTemplate({
        editor: editorRef.current!,
        metadata,
      });
    }

    if (result.ok) {
      setMetadata((prev) => ({ ...prev, id: result.templateId }));
      if (normalizedNativeTemplateText) {
        setNativeTemplateText(normalizedNativeTemplateText);
      }
      dispatchUi({ type: "set_unsaved_changes", value: false });

      toast.success("Template saved", {
        description: `"${metadata.name}" has been saved successfully`,
        duration: 3000,
      });
    } else {
      toast.error("Save failed", { description: result.error });
    }
    dispatchUi({ type: "set_saving", value: false });
  }, [metadata, nativeTemplateText]);

  const handleDelete = useCallback(async () => {
    if (!metadata.id) return;

    dispatchUi({ type: "set_show_delete_dialog", value: false });

    const result = await runDeletePdfTemplate(metadata.id);
    if (result.ok) {
      toast.success("Template archived");
      setMetadata(DEFAULT_PDF_METADATA);
      currentDesignRef.current = null;
      setNativeTemplateText(
        stringifyNativeTemplate(
          createNativeTemplateFromMetadata(DEFAULT_PDF_METADATA),
        ),
      );
      setNativePreview(EMPTY_NATIVE_PREVIEW_STATE);
      if (editorRef.current) {
        editorRef.current.loadDesign(DEFAULT_DESIGN);
      }
      dispatchUi({ type: "set_unsaved_changes", value: false });
    } else {
      toast.error("Archive failed", { description: result.error });
    }
  }, [metadata.id]);

  const handleCopyHtml = useCallback(() => {
    navigator.clipboard.writeText(exportedHtml);
    dispatchUi({ type: "set_copied_html", value: true });
    toast.success(
      metadata.engine === "asym_pdf_document_builder"
        ? "JSON copied to clipboard"
        : "HTML copied to clipboard",
    );
    setTimeout(
      () => dispatchUi({ type: "set_copied_html", value: false }),
      2000,
    );
  }, [exportedHtml, metadata.engine]);

  const handleDownloadHtml = useCallback(() => {
    const isNative = metadata.engine === "asym_pdf_document_builder";
    const blob = new Blob([exportedHtml], {
      type: isNative ? "application/json" : "text/html",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${metadata.name.toLowerCase().replace(/\s+/g, "-")}.${
      isNative ? "json" : "html"
    }`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("HTML downloaded");
  }, [exportedHtml, metadata.engine, metadata.name]);

  const handlePreview = useCallback(
    async (device: PreviewDevice) => {
      if (metadata.engine === "asym_pdf_document_builder") {
        dispatchUi({ type: "set_preview_device", value: device });
        try {
          const template = parseNativeTemplateJson(nativeTemplateText);
          setNativePreview((prev) => ({
            ...prev,
            error: null,
            status: "loading",
          }));
          const preview = await runNativePreview(template);
          setNativePreview({
            diagnostics: preview.diagnostics,
            error: null,
            html: preview.html,
            status: "success",
          });
        } catch (error) {
          setNativePreview((prev) => ({
            ...prev,
            error:
              error instanceof Error
                ? error.message
                : "Failed to preview native template",
            status: "error",
          }));
        }
        return;
      }

      if (!editorRef.current) return;
      dispatchUi({ type: "set_preview_device", value: device });
      editorRef.current.showPreview(device);
    },
    [metadata.engine, nativeTemplateText],
  );

  const handleNewTemplate = useCallback(() => {
    setMetadata(DEFAULT_PDF_METADATA);
    currentDesignRef.current = null;
    setNativePreview(EMPTY_NATIVE_PREVIEW_STATE);
    if (editorRef.current) {
      editorRef.current.loadDesign(DEFAULT_DESIGN);
    }
    dispatchUi({ type: "set_unsaved_changes", value: false });
    toast.info("New document created");
  }, []);

  const handleNewNativeTemplate = useCallback(() => {
    const nextMetadata: PDFMetadata = {
      ...DEFAULT_PDF_METADATA,
      engine: "asym_pdf_document_builder",
    };
    const template = createNativeTemplateFromMetadata(nextMetadata);

    setMetadata(metadataFromNativeTemplate(template, null));
    setNativeTemplateText(stringifyNativeTemplate(template));
    setNativePreview(EMPTY_NATIVE_PREVIEW_STATE);
    currentDesignRef.current = null;
    dispatchUi({ type: "set_unsaved_changes", value: false });
    toast.info("Native document created");
  }, []);

  const handleOpenTemplatePicker = useCallback(async () => {
    setShowTemplatePicker(true);
    setIsLoadingTemplates(true);
    try {
      setTemplates(await fetchPdfTemplates());
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load PDF templates",
      );
    } finally {
      setIsLoadingTemplates(false);
    }
  }, []);

  const handleSelectTemplate = useCallback((template: PDFTemplateListEntry) => {
    if (template.engine === "asym_pdf_document_builder") {
      const nativeTemplate = DocumentTemplateV1Schema.parse(template.design);
      setMetadata(metadataFromNativeTemplate(nativeTemplate, template.id));
      setNativeTemplateText(stringifyNativeTemplate(nativeTemplate));
      setNativePreview(EMPTY_NATIVE_PREVIEW_STATE);
      currentDesignRef.current = null;
    } else {
      setMetadata({
        id: template.id,
        name: template.name,
        description: template.description ?? "",
        category: template.category,
        pageSize: template.page_size,
        orientation: template.orientation,
        engine: "unlayer",
      });
      currentDesignRef.current = template.design;
      editorRef.current?.loadDesign(template.design);
    }
    dispatchUi({ type: "set_unsaved_changes", value: false });
    setShowTemplatePicker(false);
    toast.success("PDF template opened", {
      description: template.name,
    });
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
    showTemplatePicker,
    setShowTemplatePicker,
    templates,
    isLoadingTemplates,
    exportedHtml,
    studioConfig,
    isFullscreen,
    copiedHtml,
    nativeTemplateText,
    nativePreview,
    handleUndo,
    handleRedo,
    handleSaveClick,
    handleExportHtml,
    handleExportPDF,
    handleEditorReady,
    handleDesignUpdate,
    handleNativeTemplateTextChange,
    handleConfirmSave,
    handleDelete,
    handleCopyHtml,
    handleDownloadHtml,
    handlePreview,
    handleNewTemplate,
    handleNewNativeTemplate,
    handleOpenTemplatePicker,
    handleSelectTemplate,
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
    showTemplatePicker,
    setShowTemplatePicker,
    templates,
    isLoadingTemplates,
    exportedHtml,
    studioConfig,
    isFullscreen,
    copiedHtml,
    nativeTemplateText,
    nativePreview,
    handleUndo,
    handleRedo,
    handleSaveClick,
    handleExportHtml,
    handleExportPDF,
    handleEditorReady,
    handleDesignUpdate,
    handleNativeTemplateTextChange,
    handleConfirmSave,
    handleDelete,
    handleCopyHtml,
    handleDownloadHtml,
    handlePreview,
    handleNewTemplate,
    handleNewNativeTemplate,
    handleOpenTemplatePicker,
    handleSelectTemplate,
  } = usePDFStudioController();
  const isNativeBuilder = metadata.engine === "asym_pdf_document_builder";
  const effectiveEditorReady = isNativeBuilder || isEditorReady;

  return (
    <div
      className={cn(
        "flex flex-col bg-background",
        isFullscreen
          ? "fixed inset-0 z-50 overflow-hidden"
          : "flex-1 min-h-0 overflow-hidden",
      )}
    >
      <PDFStudioHeaderSection
        metadata={metadata}
        status={{
          hasUnsavedChanges,
          isEditorReady: effectiveEditorReady,
          isSaving,
          isExporting,
          previewDevice,
          isFullscreen,
          engine: metadata.engine,
          nativeBuilderEnabled: nativeBuilderPublicEnabled,
        }}
        actions={{
          onUndo: handleUndo,
          onRedo: handleRedo,
          onPreview: handlePreview,
          onExportPDF: handleExportPDF,
          onExportHtml: handleExportHtml,
          onSaveClick: handleSaveClick,
          onNewTemplate: handleNewTemplate,
          onNewNativeTemplate: handleNewNativeTemplate,
          onLoadTemplate: handleOpenTemplatePicker,
          onToggleFullscreen: () => dispatchUi({ type: "toggle_fullscreen" }),
          onOpenDeleteDialog: () =>
            dispatchUi({ type: "set_show_delete_dialog", value: true }),
        }}
      />

      <div className="flex-1 relative overflow-hidden bg-muted/30">
        {isNativeBuilder ? (
          <NativePdfDocumentBuilderSection
            templateText={nativeTemplateText}
            preview={nativePreview}
            onTemplateTextChange={handleNativeTemplateTextChange}
            onPreview={() => handlePreview(previewDevice)}
          />
        ) : (
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
        )}
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
        engine={metadata.engine}
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

      <PDFTemplatePickerDialog
        open={showTemplatePicker}
        onOpenChange={setShowTemplatePicker}
        templates={templates}
        isLoading={isLoadingTemplates}
        onSelect={handleSelectTemplate}
      />
    </div>
  );
}
