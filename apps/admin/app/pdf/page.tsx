"use client";

import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { UnlayerEditor } from "@asym/ui/components/studio/UnlayerEditor";
import type { UnlayerEditorHandle } from "@asym/ui/components/studio/UnlayerEditor";
import { PDFStudioSetupStatus } from "@asym/ui/components/studio/PDFStudioSetupStatus";
import {
  getPDFStudioConfig,
  type PDFStudioFullConfig,
} from "@asym/config/pdf-studio";
import { type EmailStudioFullConfig } from "@asym/config/email-studio";
import type { UnlayerDesignJSON } from "@asym/email/email-studio-types";
import type { PDFTemplateCategory } from "@/lib/pdf-studio";
import {
  PDF_TEMPLATE_CATEGORIES,
  PAGE_SIZES,
  ORIENTATIONS,
} from "@/lib/pdf-studio";
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
import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@asym/ui/components/shadcn/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@asym/ui/components/shadcn/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
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
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@asym/ui/components/shadcn/tooltip";
import { Kbd } from "@asym/ui/components/shadcn/kbd";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@asym/ui/components/shadcn/toggle-group";
import { Separator } from "@asym/ui/components/shadcn/separator";
import { toast } from "sonner";
import { cn } from "@asym/ui/lib/utils";

type PreviewDevice = "desktop" | "mobile";

interface PDFMetadata {
  id: string | null;
  name: string;
  description: string;
  category: PDFTemplateCategory;
  pageSize: "A4" | "Letter" | "Legal";
  orientation: "portrait" | "landscape";
}

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

export default function PDFStudio() {
  const editorRef = useRef<UnlayerEditorHandle>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [exportedHtml, setExportedHtml] = useState<string>("");
  const [studioConfig, setStudioConfig] = useState<PDFStudioFullConfig | null>(
    null,
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [currentDesign, setCurrentDesign] = useState<UnlayerDesignJSON | null>(
    null,
  );
  const [metadata, setMetadata] = useState<PDFMetadata>({
    id: null,
    name: "Untitled Document",
    description: "",
    category: "custom",
    pageSize: "Letter",
    orientation: "portrait",
  });

  const handleUndo = useCallback(() => {
    editorRef.current?.undo();
  }, []);

  const handleRedo = useCallback(() => {
    editorRef.current?.redo();
  }, []);

  const handleSaveClick = useCallback(() => {
    if (!editorRef.current) return;
    setShowSaveDialog(true);
  }, []);

  const handleExportHtml = useCallback(async () => {
    if (!editorRef.current) return;
    try {
      const data = await editorRef.current.exportHtml({
        minify: false,
        cleanup: studioConfig?.export.cleanupCss ?? true,
      });
      setExportedHtml(data.html);
      setShowExportDialog(true);
    } catch {
      toast.error("Failed to export HTML");
    }
  }, [studioConfig]);

  const handleExportPDF = useCallback(async () => {
    if (!editorRef.current) return;
    setIsExporting(true);
    try {
      const pdfResult = await editorRef.current.exportPdf();

      if (pdfResult?.url) {
        window.open(pdfResult.url, "_blank");
        toast.success("PDF exported successfully", {
          description: "Your PDF is ready for download",
          duration: 4000,
        });
      } else {
        toast.info("PDF export initiated", {
          description: "Your document is being prepared for download...",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF", {
        description:
          "PDF export requires an Unlayer project ID. Configure your Unlayer account for PDF export.",
      });
    } finally {
      setIsExporting(false);
    }
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
        setIsFullscreen(false);
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
      setIsEditorReady(true);
      setStudioConfig(config as PDFStudioFullConfig);

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
    setCurrentDesign(design);
    setHasUnsavedChanges(true);
  }, []);

  const handleConfirmSave = useCallback(async () => {
    if (!editorRef.current) return;

    setShowSaveDialog(false);
    setIsSaving(true);

    try {
      const exportData = await editorRef.current.exportHtml({
        minify: false,
        cleanup: true,
      });

      const payload = {
        name: metadata.name,
        description: metadata.description || undefined,
        design: exportData.design,
        html: exportData.html,
        category: metadata.category,
        page_size: metadata.pageSize,
        orientation: metadata.orientation,
        status: "draft",
      };

      const url = metadata.id
        ? `/api/pdf-templates/${metadata.id}`
        : "/api/pdf-templates";

      const method = metadata.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save template");
      }

      const { template } = await response.json();

      setMetadata((prev) => ({ ...prev, id: template.id }));
      setHasUnsavedChanges(false);

      toast.success("Template saved", {
        description: `"${metadata.name}" has been saved successfully`,
        duration: 3000,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save template";
      toast.error("Save failed", { description: message });
    } finally {
      setIsSaving(false);
    }
  }, [metadata]);

  const handleDelete = useCallback(async () => {
    if (!metadata.id) return;

    setShowDeleteDialog(false);

    try {
      const response = await fetch(`/api/pdf-templates/${metadata.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete template");
      }

      toast.success("Template deleted");
      setMetadata({
        id: null,
        name: "Untitled Document",
        description: "",
        category: "custom",
        pageSize: "Letter",
        orientation: "portrait",
      });
      setCurrentDesign(null);
      if (editorRef.current) {
        editorRef.current.loadDesign(DEFAULT_DESIGN);
      }
      setHasUnsavedChanges(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete template";
      toast.error("Delete failed", { description: message });
    }
  }, [metadata.id]);

  const handleCopyHtml = useCallback(() => {
    navigator.clipboard.writeText(exportedHtml);
    setCopiedHtml(true);
    toast.success("HTML copied to clipboard");
    setTimeout(() => setCopiedHtml(false), 2000);
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
    setPreviewDevice(device);
    editorRef.current.showPreview(device);
  }, []);

  const handleNewTemplate = useCallback(() => {
    setMetadata({
      id: null,
      name: "Untitled Document",
      description: "",
      category: "custom",
      pageSize: "Letter",
      orientation: "portrait",
    });
    setCurrentDesign(null);
    if (editorRef.current) {
      editorRef.current.loadDesign(DEFAULT_DESIGN);
    }
    setHasUnsavedChanges(false);
    toast.info("New document created");
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col bg-background transition-all duration-300",
        isFullscreen
          ? "fixed inset-0 z-50 overflow-hidden"
          : "flex-1 min-h-0 overflow-hidden",
      )}
    >
      <header className="h-12 md:h-14 bg-background border-b border-border flex items-center justify-between px-2 md:px-4 shrink-0 z-20">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-600">
              <FileText className="h-4 w-4" />
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
                  onClick={handleUndo}
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
                  onClick={handleRedo}
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
                value && handlePreview(value as PreviewDevice)
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
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
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
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileDown className="h-4 w-4 mr-2" />
                Export as PDF
                <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportHtml}>
                <FileCode className="h-4 w-4 mr-2" />
                Export as HTML
                <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => toast.info("Print functionality coming soon")}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            onClick={handleSaveClick}
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
                <span className="hidden sm:inline text-xs font-medium">
                  Save
                </span>
              </>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={handleNewTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                New Document
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toast.info("Template settings coming soon")}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toast.info("Load template coming soon")}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Load Template
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toast.info("Duplicate coming soon")}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => toast.info("Version history coming soon")}
              >
                <History className="h-4 w-4 mr-2" />
                Version History
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleNewTemplate}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Template
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsFullscreen(!isFullscreen)}>
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4 mr-2" />
                ) : (
                  <Maximize2 className="h-4 w-4 mr-2" />
                )}
                {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                <DropdownMenuShortcut>Esc</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                disabled={!metadata.id}
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Template
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden bg-muted/30">
        <UnlayerEditor
          mode="document"
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

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <Save className="h-4 w-4 text-violet-600" />
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
                  {ORIENTATIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
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
                placeholder="Brief description of this template's purpose..."
                className="h-20 resize-none text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                A brief description helps team members understand when to use
                this template.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSave}
              disabled={!metadata.name.trim() || isSaving}
            >
              {isSaving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {metadata.id ? "Update Template" : "Save Template"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[680px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <FileCode className="h-4 w-4 text-violet-600" />
              </div>
              Export HTML
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              Copy or download the generated HTML code for your document
              template.
              {studioConfig?.export.cleanupCss && (
                <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-medium">
                  <Sparkles className="h-3 w-3" />
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
                  onClick={handleCopyHtml}
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
                Ready for PDF conversion
              </span>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowExportDialog(false)}
            >
              Close
            </Button>
            <Button variant="outline" onClick={handleCopyHtml}>
              {copiedHtml ? (
                <Check className="h-4 w-4 mr-2 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copiedHtml ? "Copied!" : "Copy HTML"}
            </Button>
            <Button onClick={handleDownloadHtml}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Template
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{metadata.name}&rdquo;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
