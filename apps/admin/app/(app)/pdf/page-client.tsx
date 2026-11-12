"use client";

import { type EmailStudioFullConfig } from "@asym/config/email-studio";
import { type PDFStudioFullConfig } from "@asym/config/pdf-studio";
import { readJsonBody } from "@asym/lib/http/fetch-result";
import {
  DocumentTemplateV1Schema,
  starterPdfTemplateFixtureByCategory,
  type DocumentTemplateV1,
  type TemplateCategory,
} from "@asym/pdf-template-schema";
import { Alert, AlertDescription } from "@asym/ui/components/shadcn/alert";
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
import { Badge } from "@asym/ui/components/shadcn/badge";
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
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@asym/ui/components/shadcn/empty";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import { Kbd } from "@asym/ui/components/shadcn/kbd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { Separator } from "@asym/ui/components/shadcn/separator";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { Spinner } from "@asym/ui/components/shadcn/spinner";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
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
  ChevronRight,
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
  FileDown,
  AlertCircle,
} from "lucide-react";
import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useId,
  useReducer,
} from "react";
import { toast } from "sonner";

import {
  NativePdfDocumentBuilderSection,
  type NativePreviewState,
} from "./native-pdf-document-builder-section";
import {
  FREE_MODE_PDF_EXPORT_NOTE,
  isUnlayerPdfExportBlocked,
  runUnlayerPdfExport,
} from "./pdf-export";
import {
  nativeRenderFeedback,
  type NativeRenderResponse,
} from "./pdf-native-feedback";
import {
  StudioDiscardDialog,
  useStudioDiscardGuard,
} from "../../../features/studios/studio-discard-guard";
import { usePlatformModifierLabel } from "../../../features/studios/use-platform-modifier";

import type { PDFTemplateCategory, PDFTemplateEngine } from "@/lib/pdf-studio";
import type { UnlayerDesignJSON } from "@asym/email/email-studio-types";
import type { LegacyUnlayerDocumentEditorHandle } from "@asym/ui/components/studio/legacy/UnlayerDocumentEditor";

import { useStudioFullscreen } from "@/components/studio/shell-navigation-guard";
import {
  StudioExportedHtmlPreview,
  type StudioPreviewDevice,
  StudioPreviewDeviceToggle,
  StudioSaveButton,
  StudioTemplateBreadcrumb,
} from "@/components/studio/studio-chrome";
import {
  PDF_TEMPLATE_CATEGORIES,
  PAGE_SIZES,
  ORIENTATIONS,
} from "@/lib/pdf-studio";

type PreviewDevice = StudioPreviewDevice;

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
  isCopyingHtml: boolean;
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
  | { type: "set_copying_html"; value: boolean }
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
  name: "Untitled document",
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
  isCopyingHtml: false,
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
    case "set_copying_html":
      return {
        ...state,
        isCopyingHtml: action.value,
        copiedHtml: action.value ? false : state.copiedHtml,
      };
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
  /** Free mode: Unlayer refuses PDF export, so the item says so up front. */
  pdfExportBlocked?: boolean;
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

export function PDFStudioHeaderSection({
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
    pdfExportBlocked = false,
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
  const exportNoteId = useId();
  const modifier = usePlatformModifierLabel();
  return (
    <>
      <header className="h-12 md:h-14 bg-background border-b border-border flex items-center justify-between px-2 md:px-4 shrink-0 z-20">
        <h1 className="sr-only">PDF Studio</h1>
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="p-1.5 rounded-lg bg-chart-3/10 text-foreground">
            <FileText aria-hidden="true" className="size-4" />
          </div>

          <div className="hidden md:block">
            <PDFStudioSetupStatus variant="badge" />
          </div>

          <div className="hidden md:block">
            <Separator orientation="vertical" className="h-5" />
          </div>

          <StudioTemplateBreadcrumb
            name={metadata.name}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="hidden xl:flex items-center gap-1 p-0.5 bg-muted rounded-lg">
            <Tooltip>
              <TooltipTrigger
                aria-label="Undo"
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onUndo}
                    disabled={!isEditorReady}
                  >
                    <Undo2 className="size-3.5" />
                  </Button>
                }
              />
              <TooltipContent side="bottom">
                <p>Undo</p>
                <Kbd className="ml-1.5">{modifier}+Z</Kbd>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                aria-label="Redo"
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onRedo}
                    disabled={!isEditorReady}
                  >
                    <Redo2 className="size-3.5" />
                  </Button>
                }
              />
              <TooltipContent side="bottom">
                <p>Redo</p>
                <Kbd className="ml-1.5">{modifier}+Shift+Z</Kbd>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="hidden md:block">
            <StudioPreviewDeviceToggle
              value={previewDevice}
              onChange={onPreview}
              disabled={!isEditorReady}
            />
          </div>

          <div className="hidden md:block">
            <Separator orientation="vertical" className="h-5" />
          </div>

          <span className="hidden lg:flex">
            <Badge variant="outline">
              <FileCode aria-hidden="true" />
              {engine === "asym_pdf_document_builder"
                ? "Native editor"
                : "Classic editor"}
            </Badge>
          </span>

          <Tooltip>
            <TooltipTrigger
              aria-label="Open template"
              render={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLoadTemplate}
                  disabled={isSaving || isExporting}
                >
                  <FolderOpen aria-hidden="true" />
                  <span className="hidden xl:inline">Open template</span>
                </Button>
              }
            />
            <TooltipContent side="bottom">Open template</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger
                aria-label="Export"
                render={
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!isEditorReady || isExporting}
                      >
                        {isExporting ? (
                          <span className="size-3.5 motion-safe:animate-spin rounded-full border-2 border-current border-t-transparent" />
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
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={onExportPDF}
                disabled={pdfExportBlocked}
                aria-describedby={pdfExportBlocked ? exportNoteId : undefined}
              >
                <FileDown className="size-4 mr-2" />
                {engine === "asym_pdf_document_builder"
                  ? "Test render with sample data"
                  : "Export as PDF"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportHtml}>
                <FileCode className="size-4 mr-2" />
                {engine === "asym_pdf_document_builder"
                  ? "Export as JSON"
                  : "Export as HTML"}
                <DropdownMenuShortcut>{modifier}+E</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <StudioSaveButton
            onClick={onSaveClick}
            disabled={!isEditorReady || isSaving}
            isSaving={isSaving}
          />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="More PDF template actions"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onNewTemplate}>
                <Plus className="size-4 mr-2" />
                New document
              </DropdownMenuItem>
              {nativeBuilderEnabled && (
                <DropdownMenuItem onClick={onNewNativeTemplate}>
                  <Sparkles className="size-4 mr-2" />
                  New native document
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onToggleFullscreen}>
                {isFullscreen ? (
                  <Minimize2 className="size-4 mr-2" />
                ) : (
                  <Maximize2 className="size-4 mr-2" />
                )}
                {isFullscreen ? "Exit full screen" : "Full screen"}
                <DropdownMenuShortcut>Esc</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                disabled={!metadata.id}
                onClick={onOpenDeleteDialog}
              >
                <Trash2 className="size-4 mr-2" />
                Archive template
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      {pdfExportBlocked ? (
        <Alert role="note" variant="warning" className="shrink-0">
          <AlertDescription id={exportNoteId}>
            {FREE_MODE_PDF_EXPORT_NOTE}
          </AlertDescription>
        </Alert>
      ) : null}
      <p
        role="note"
        className={cn(
          "shrink-0 border-b px-4 py-2 text-sm text-muted-foreground",
          engine === "asym_pdf_document_builder" ? "md:hidden" : "lg:hidden",
        )}
      >
        {engine === "asym_pdf_document_builder" ? (
          <>
            PDF Studio works best on a larger screen. The editor remains
            available below.
          </>
        ) : (
          <>
            Scroll left or right within the editor below to reach the full
            document canvas and tools.
          </>
        )}
      </p>
    </>
  );
}

export function PDFSaveDialogSection({
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
  const fieldId = useId();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-130">
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-chart-3/10">
                <Save className="size-4 text-foreground" />
              </span>
              {metadata.id ? "Update PDF Template" : "Save PDF Template"}
            </span>
          </DialogTitle>
          <DialogDescription>
            Enter the details for your PDF template. These will help organize
            your documents.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup className="py-4">
          <Field>
            <FieldLabel htmlFor={`${fieldId}-name`}>
              Template Name <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id={`${fieldId}-name`}
              required
              aria-required="true"
              value={metadata.name}
              onChange={(e) =>
                setMetadata((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Annual Tax Receipt"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor={`${fieldId}-category`}>Category</FieldLabel>
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
                <SelectTrigger id={`${fieldId}-category`}>
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
            </Field>

            <Field>
              <FieldLabel htmlFor={`${fieldId}-pageSize`}>Page Size</FieldLabel>
              <Select
                value={metadata.pageSize}
                onValueChange={(value) => {
                  if (value === null) {
                    return;
                  }
                  setMetadata((prev) => ({ ...prev, pageSize: value }));
                }}
              >
                <SelectTrigger id={`${fieldId}-pageSize`}>
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
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor={`${fieldId}-orientation`}>
              Orientation
            </FieldLabel>
            <Select
              value={metadata.orientation}
              onValueChange={(value) => {
                if (value === null) {
                  return;
                }
                setMetadata((prev) => ({ ...prev, orientation: value }));
              }}
            >
              <SelectTrigger id={`${fieldId}-orientation`}>
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
          </Field>

          <Field>
            <FieldLabel htmlFor={`${fieldId}-description`}>
              Description
            </FieldLabel>
            <Textarea
              id={`${fieldId}-description`}
              aria-describedby={`${fieldId}-description-hint`}
              value={metadata.description}
              onChange={(e) =>
                setMetadata((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Brief description of this template's purpose…"
            />
            <FieldDescription id={`${fieldId}-description-hint`}>
              A brief description helps team members understand when to use this
              template.
            </FieldDescription>
          </Field>
        </FieldGroup>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirmSave}
            disabled={!metadata.name.trim() || isSaving}
          >
            {isSaving ? (
              <>
                <Spinner data-icon="inline-start" />
                Saving…
              </>
            ) : (
              <>
                <Save className="size-4 mr-2" />
                {metadata.id ? "Update template" : "Save template"}
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
  isCopyingHtml,
  onCopyHtml,
  onDownloadHtml,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  engine: PDFTemplateEngine;
  studioConfig: PDFStudioFullConfig | null;
  exportedHtml: string;
  copiedHtml: boolean;
  isCopyingHtml: boolean;
  onCopyHtml: () => void;
  onDownloadHtml: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-170" aria-busy={isCopyingHtml}>
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-chart-3/10">
                <FileCode className="size-4 text-foreground" />
              </span>
              {engine === "asym_pdf_document_builder"
                ? "Export Native JSON"
                : "Export HTML"}
            </span>
          </DialogTitle>
          <DialogDescription>
            <span className="flex flex-wrap items-center gap-2">
              {engine === "asym_pdf_document_builder"
                ? "Copy or download the native document source."
                : "Copy or download the generated HTML code for your document template."}
              {studioConfig?.export.cleanupCss && (
                <span className="inline-flex items-center gap-1 text-success bg-success/10 px-2 py-0.5 rounded-full text-xs font-medium">
                  <Sparkles className="size-3" />
                  Optimized
                </span>
              )}
            </span>
          </DialogDescription>
        </DialogHeader>
        <StudioExportedHtmlPreview
          html={exportedHtml}
          copied={copiedHtml}
          onCopy={onCopyHtml}
          readyLabel={
            engine === "asym_pdf_document_builder"
              ? "Native source"
              : "Ready for PDF conversion"
          }
        />
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            variant="outline"
            onClick={onCopyHtml}
            disabled={isCopyingHtml}
            aria-busy={isCopyingHtml}
          >
            {isCopyingHtml ? (
              <Spinner aria-hidden="true" data-icon="inline-start" />
            ) : copiedHtml ? (
              <Check className="size-4 mr-2 text-success" />
            ) : (
              <Copy className="size-4 mr-2" />
            )}
            {isCopyingHtml
              ? "Copying…"
              : copiedHtml
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
          <AlertDialogTitle>
            <span className="flex items-center gap-2">
              <AlertCircle className="size-5 text-destructive" />
              Archive template
            </span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            Archive &ldquo;{templateName}&rdquo;? It will disappear from the
            active template list without deleting historical database rows.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} variant="destructive">
            Archive
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function PDFTemplatePickerDialog({
  open,
  onOpenChange,
  templates,
  isLoading,
  loadFailed,
  onRetry,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: PDFTemplateListEntry[];
  isLoading: boolean;
  loadFailed: boolean;
  onRetry: () => void;
  onSelect: (template: PDFTemplateListEntry) => void;
}) {
  const [search, setSearch] = useState("");
  const visibleTemplates = templates.filter((template) =>
    `${template.name} ${template.category.replaceAll("_", " ")} ${template.engine === "asym_pdf_document_builder" ? "Native document builder" : "Unlayer"} ${template.status}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-140">
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <span className="rounded-lg bg-chart-3/10 p-2">
                <FolderOpen className="text-foreground size-4" />
              </span>
              Open PDF template
            </span>
          </DialogTitle>
          <DialogDescription>
            Choose a saved PDF template from this organization.
          </DialogDescription>
        </DialogHeader>
        <Input
          aria-label="Search templates"
          type="search"
          placeholder="Search templates…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="max-h-105 overflow-y-auto py-2">
          {loadFailed ? (
            <Alert variant="destructive">
              <AlertDescription>
                Templates couldn’t be loaded. Try again.
              </AlertDescription>
              <Button variant="outline" onClick={onRetry}>
                Try again
              </Button>
            </Alert>
          ) : isLoading ? (
            <div role="status" className="space-y-2 py-4">
              <span className="sr-only">Loading templates…</span>
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : templates.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No saved PDF templates yet.</EmptyTitle>
                <EmptyDescription>
                  Save a template to reopen it here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : visibleTemplates.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No matching templates</EmptyTitle>
                <EmptyDescription>Try a different search.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-2">
              {visibleTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className="flex w-full items-center justify-between rounded-md border bg-background px-4 py-3 text-left transition-colors hover:bg-muted"
                  onClick={() => onSelect(template)}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {template.name}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {PDF_TEMPLATE_CATEGORIES.find(
                        (category) => category.value === template.category,
                      )?.label ?? "Custom"}{" "}
                      · {template.page_size} ·{" "}
                      {template.orientation === "portrait"
                        ? "Portrait"
                        : "Landscape"}{" "}
                      ·{" "}
                      {template.engine === "asym_pdf_document_builder"
                        ? "Native document builder"
                        : "Unlayer"}{" "}
                      ·{" "}
                      <Badge variant="outline">
                        {template.status.replaceAll("_", " ")}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

type DeleteTemplateResult = { ok: true } | { ok: false; error: string };

async function fetchPdfTemplates(): Promise<PDFTemplateListEntry[]> {
  const response = await fetch("/api/pdf-templates", {
    method: "GET",
  });
  const { ok, body } = await readJsonBody<{
    success?: boolean;
    templates?: PDFTemplateListEntry[];
    error?: string;
  }>(response);

  if (!ok || !body?.success) {
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
  { ok: true; templateId: string } | { ok: false; error: string };

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
  const { ok, body } = await readJsonBody<{
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
  }>(response);

  if (!ok || !body?.success) {
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

export function usePDFStudioController() {
  const editorRef = useRef<LegacyUnlayerDocumentEditorHandle>(null);
  const copyHtmlInFlightRef = useRef(false);
  const copiedHtmlTimeoutRef = useRef<number | null>(null);
  const [ui, dispatchUi] = useReducer(
    pdfStudioUiReducer,
    INITIAL_PDF_STUDIO_UI_STATE,
  );
  const currentDesignRef = useRef<UnlayerDesignJSON | null>(null);
  const [metadata, setMetadata] = useState<PDFMetadata>(DEFAULT_PDF_METADATA);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [templates, setTemplates] = useState<PDFTemplateListEntry[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [templateLoadFailed, setTemplateLoadFailed] = useState(false);
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
    isCopyingHtml,
  } = ui;
  const discardGuard = useStudioDiscardGuard(hasUnsavedChanges);

  useEffect(
    () => () => {
      if (copiedHtmlTimeoutRef.current !== null) {
        window.clearTimeout(copiedHtmlTimeoutRef.current);
      }
    },
    [],
  );

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
        const { ok, body } = await readJsonBody<NativeRenderResponse>(response);
        const feedback = nativeRenderFeedback(ok, body ?? undefined);
        const notify = feedback.success ? toast.success : toast.error;
        notify(feedback.title, { description: feedback.description });
      } catch {
        toast.error("Test render unavailable", {
          description:
            "Check the document JSON and preview diagnostics, then try again.",
        });
      } finally {
        dispatchUi({ type: "set_exporting", value: false });
      }
      return;
    }

    if (
      isUnlayerPdfExportBlocked({
        engine: metadata.engine,
        config: studioConfig,
      })
    ) {
      // Unlayer refuses the export in free mode and never answers, so say
      // so instead of starting an export that cannot finish.
      toast.error("PDF export isn't available in free mode", {
        description: FREE_MODE_PDF_EXPORT_NOTE,
      });
      return;
    }

    const editor = editorRef.current;
    if (!editor) return;
    dispatchUi({ type: "set_exporting", value: true });
    const result = await runUnlayerPdfExport(() => editor.exportPdf());
    if (result.status === "ready") {
      window.open(result.url, "_blank", "noopener,noreferrer");
      toast.success("PDF exported", {
        description: "It opened in a new tab, ready to download.",
        duration: 4000,
      });
    } else if (result.status === "failed") {
      console.error("PDF export error:", result.error);
      toast.error("Couldn't export the PDF", {
        description: "The editor could not export this document. Try again.",
      });
    } else {
      // No link, or no answer: Unlayer made no file. The usual cause is an
      // Unlayer plan without PDF export.
      toast.error("Unlayer didn't make a PDF", {
        description:
          "Unlayer only exports PDFs on a paid plan. Check the plan for this Unlayer project, or export as HTML.",
      });
    }
    dispatchUi({ type: "set_exporting", value: false });
  }, [metadata.engine, nativeTemplateText, studioConfig]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.defaultPrevented ||
        e.isComposing ||
        showSaveDialog ||
        showExportDialog ||
        showDeleteDialog ||
        showTemplatePicker ||
        discardGuard.pending
      )
        return;
      const key = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && key === "s") {
        e.preventDefault();
        if (
          (isEditorReady || metadata.engine === "asym_pdf_document_builder") &&
          !isSaving &&
          !isExporting
        ) {
          handleSaveClick();
        }
        return;
      }
      if (
        e.target instanceof HTMLElement &&
        e.target.closest(
          'input, textarea, select, [contenteditable]:not([contenteditable="false"])',
        )
      )
        return;
      if ((e.metaKey || e.ctrlKey) && key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && key === "z") {
        e.preventDefault();
        handleRedo();
      }
      if ((e.metaKey || e.ctrlKey) && key === "e") {
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
    isExporting,
    metadata.engine,
    showSaveDialog,
    showExportDialog,
    showDeleteDialog,
    showTemplatePicker,
    discardGuard.pending,
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

  const handleCopyHtml = useCallback(async () => {
    if (copyHtmlInFlightRef.current) return;
    copyHtmlInFlightRef.current = true;
    if (copiedHtmlTimeoutRef.current !== null) {
      window.clearTimeout(copiedHtmlTimeoutRef.current);
      copiedHtmlTimeoutRef.current = null;
    }
    dispatchUi({ type: "set_copying_html", value: true });
    const format =
      metadata.engine === "asym_pdf_document_builder" ? "JSON" : "HTML";
    try {
      if (typeof navigator.clipboard?.writeText !== "function") {
        toast.error("Copy unavailable", {
          description:
            "Clipboard access is unavailable. Download the source instead.",
        });
        return;
      }
      await navigator.clipboard.writeText(exportedHtml);
      dispatchUi({ type: "set_copied_html", value: true });
      copiedHtmlTimeoutRef.current = window.setTimeout(() => {
        copiedHtmlTimeoutRef.current = null;
        dispatchUi({ type: "set_copied_html", value: false });
      }, 2000);
      toast.success(`${format} copied to clipboard`);
    } catch {
      toast.error("Copy failed", {
        description: `Could not copy ${format} to the clipboard. Try again or download the source.`,
      });
    } finally {
      copyHtmlInFlightRef.current = false;
      dispatchUi({ type: "set_copying_html", value: false });
    }
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

  const replaceWithNewTemplate = useCallback(() => {
    setMetadata(DEFAULT_PDF_METADATA);
    currentDesignRef.current = null;
    setNativePreview(EMPTY_NATIVE_PREVIEW_STATE);
    if (editorRef.current) {
      editorRef.current.loadDesign(DEFAULT_DESIGN);
    }
    dispatchUi({ type: "set_unsaved_changes", value: false });
  }, []);

  const replaceWithNewNativeTemplate = useCallback(() => {
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
  }, []);

  const handleOpenTemplatePicker = useCallback(async () => {
    setShowTemplatePicker(true);
    setIsLoadingTemplates(true);
    setTemplateLoadFailed(false);
    try {
      setTemplates(await fetchPdfTemplates());
    } catch {
      setTemplateLoadFailed(true);
    } finally {
      setIsLoadingTemplates(false);
    }
  }, []);

  const replaceWithTemplate = useCallback((template: PDFTemplateListEntry) => {
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
    templateLoadFailed,
    discardGuard,
    exportedHtml,
    studioConfig,
    isFullscreen,
    copiedHtml,
    isCopyingHtml,
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
    handleNewTemplate: () => {
      if (!isSaving && !isExporting)
        discardGuard.requestAction(replaceWithNewTemplate);
    },
    handleNewNativeTemplate: () => {
      if (!isSaving && !isExporting)
        discardGuard.requestAction(replaceWithNewNativeTemplate);
    },
    handleOpenTemplatePicker,
    handleSelectTemplate: (template: PDFTemplateListEntry) => {
      if (isSaving || isExporting) return;
      setShowTemplatePicker(false);
      if (template.id === metadata.id) return;
      discardGuard.requestAction(() => replaceWithTemplate(template));
    },
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
    templateLoadFailed,
    discardGuard,
    exportedHtml,
    studioConfig,
    isFullscreen,
    copiedHtml,
    isCopyingHtml,
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
  const rootRef = useRef<HTMLDivElement>(null);
  useStudioFullscreen(isFullscreen, rootRef);
  const isNativeBuilder = metadata.engine === "asym_pdf_document_builder";
  const effectiveEditorReady = isNativeBuilder || isEditorReady;

  return (
    <div
      ref={rootRef}
      className={cn(
        "flex flex-col bg-background",
        isFullscreen
          ? "fixed inset-0 z-50 overflow-hidden"
          : "h-full min-h-0 overflow-hidden",
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
          pdfExportBlocked: isUnlayerPdfExportBlocked({
            engine: metadata.engine,
            config: studioConfig,
          }),
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

      <div className="flex-1 relative min-w-0 overflow-hidden bg-muted/30">
        {isNativeBuilder ? (
          <NativePdfDocumentBuilderSection
            templateText={nativeTemplateText}
            preview={nativePreview}
            onTemplateTextChange={handleNativeTemplateTextChange}
            onPreview={() => handlePreview(previewDevice)}
          />
        ) : (
          <div
            role="region"
            aria-label="PDF editor canvas"
            tabIndex={0}
            className="absolute inset-0 overflow-x-auto overflow-y-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          >
            <div className="relative h-full min-w-5xl lg:min-w-0">
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
          </div>
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
        isCopyingHtml={isCopyingHtml}
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
        loadFailed={templateLoadFailed}
        onRetry={() => {
          void handleOpenTemplatePicker();
        }}
        onSelect={handleSelectTemplate}
      />
      <StudioDiscardDialog guard={discardGuard} />
    </div>
  );
}
