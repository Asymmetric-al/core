"use client";
"use no memo";

import type { EmailStudioFullConfig } from "@asym/config/email-studio";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
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
import { EmailStudioSetupStatus } from "@asym/ui/components/studio/EmailStudioSetupStatus";
import type { UnlayerEditorHandle } from "@asym/ui/components/studio/UnlayerEditor";
import { UnlayerEditor } from "@asym/ui/components/studio/UnlayerEditor";
import { cn } from "@asym/ui/lib/utils";
import {
  Check,
  ChevronRight,
  Clock,
  Copy,
  Download,
  FileCode,
  FileText,
  FolderOpen,
  History,
  Layers,
  Mail,
  Maximize2,
  Minimize2,
  Monitor,
  MoreHorizontal,
  Plus,
  Redo2,
  Save,
  Send,
  Settings,
  Smartphone,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { toast } from "sonner";

type PreviewDevice = "desktop" | "mobile";

interface EmailMetadata {
  id: string | null;
  name: string;
  preheader: string;
  subject: string;
}

interface EmailStudioUiState {
  copiedHtml: boolean;
  exportedHtml: string;
  hasUnsavedChanges: boolean;
  isEditorReady: boolean;
  isFullscreen: boolean;
  isSaving: boolean;
  previewDevice: PreviewDevice;
  showExportDialog: boolean;
  showSaveDialog: boolean;
  studioConfig: EmailStudioFullConfig | null;
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
  action: EmailStudioUiAction
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
  hasUnsavedChanges: boolean;
  isEditorReady: boolean;
  isFullscreen: boolean;
  isSaving: boolean;
  metadata: EmailMetadata;
  onExportHtml: () => void;
  onNewTemplate: () => void;
  onPreview: (device: PreviewDevice) => void;
  onRedo: () => void;
  onSaveClick: () => void;
  onToggleFullscreen: () => void;
  onUndo: () => void;
  previewDevice: PreviewDevice;
}

function EmailStudioHeader({
  metadata,
  hasUnsavedChanges,
  isEditorReady,
  isSaving,
  previewDevice,
  isFullscreen,
  onUndo,
  onRedo,
  onPreview,
  onExportHtml,
  onSaveClick,
  onNewTemplate,
  onToggleFullscreen,
}: EmailStudioHeaderProps) {
  return (
    <header className="z-20 flex h-12 shrink-0 items-center justify-between border-border border-b bg-background px-2 md:h-14 md:px-4">
      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
            <Mail className="h-4 w-4" />
          </div>
          <span className="hidden font-semibold text-foreground text-xs uppercase tracking-wider sm:inline">
            Email Studio
          </span>
        </div>

        <div className="hidden md:block">
          <EmailStudioSetupStatus variant="badge" />
        </div>

        <Separator className="hidden h-5 md:block" orientation="vertical" />

        <div className="hidden min-w-0 items-center gap-1 text-muted-foreground text-xs lg:flex">
          <span className="shrink-0">Templates</span>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="max-w-[180px] truncate font-medium text-foreground">
            {metadata.name}
          </span>
          {hasUnsavedChanges && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-1 h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-500" />
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Unsaved changes</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 md:gap-2">
        <div className="hidden items-center gap-1 rounded-lg bg-muted p-0.5 xl:flex">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="h-7 w-7 p-0"
                disabled={!isEditorReady}
                onClick={onUndo}
                size="sm"
                variant="ghost"
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
                className="h-7 w-7 p-0"
                disabled={!isEditorReady}
                onClick={onRedo}
                size="sm"
                variant="ghost"
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
            disabled={!isEditorReady}
            onValueChange={(value) =>
              value && onPreview(value as PreviewDevice)
            }
            size="sm"
            type="single"
            value={previewDevice}
            variant="outline"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  className="h-7 px-2.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  value="desktop"
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span className="ml-1.5 hidden font-medium text-[10px] uppercase tracking-wider lg:inline">
                    Desktop
                  </span>
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom">Desktop preview</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  className="h-7 px-2.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  value="mobile"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span className="ml-1.5 hidden font-medium text-[10px] uppercase tracking-wider lg:inline">
                    Mobile
                  </span>
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom">Mobile preview</TooltipContent>
            </Tooltip>
          </ToggleGroup>
        </div>

        <Separator className="hidden h-5 md:block" orientation="vertical" />

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  className="h-8 gap-1.5"
                  disabled={!isEditorReady}
                  size="sm"
                  variant="outline"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden font-medium text-xs sm:inline">
                    Export
                  </span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">Export options</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={onExportHtml}>
              <FileCode className="mr-2 h-4 w-4" />
              Export as HTML
              <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toast.info("Coming soon: Export as PDF")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => toast.info("Coming soon: Send test email")}
            >
              <Send className="mr-2 h-4 w-4" />
              Send Test Email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          className="h-8 gap-1.5 px-3 md:px-4"
          disabled={!isEditorReady || isSaving}
          onClick={onSaveClick}
          size="sm"
        >
          {isSaving ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span className="hidden font-medium text-xs sm:inline">
                Saving...
              </span>
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              <span className="hidden font-medium text-xs sm:inline">Save</span>
            </>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 w-8 p-0" size="sm" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={onNewTemplate}>
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toast.info("Coming soon: Template settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toast.info("Coming soon: Load template")}
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              Load Template
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toast.info("Coming soon: Duplicate")}
            >
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => toast.info("Coming soon: Version history")}
            >
              <History className="mr-2 h-4 w-4" />
              Version History
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toast.info("Coming soon: Schedule send")}
            >
              <Clock className="mr-2 h-4 w-4" />
              Schedule Send
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onToggleFullscreen}>
              {isFullscreen ? (
                <Minimize2 className="mr-2 h-4 w-4" />
              ) : (
                <Maximize2 className="mr-2 h-4 w-4" />
              )}
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              <DropdownMenuShortcut>Esc</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
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
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
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
            <Label className="font-medium text-xs" htmlFor="name">
              Template Name <span className="text-destructive">*</span>
            </Label>
            <Input
              className="h-10"
              id="name"
              onChange={(e) =>
                setMetadata((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Monthly Newsletter"
              value={metadata.name}
            />
          </div>
          <div className="grid gap-2">
            <Label className="font-medium text-xs" htmlFor="subject">
              Email Subject
            </Label>
            <Input
              className="h-10"
              id="subject"
              onChange={(e) =>
                setMetadata((prev) => ({ ...prev, subject: e.target.value }))
              }
              placeholder="e.g., Your December Update from Give Hope"
              value={metadata.subject}
            />
            <p className="text-[11px] text-muted-foreground">
              The subject line recipients will see in their inbox.
            </p>
          </div>
          <div className="grid gap-2">
            <Label className="font-medium text-xs" htmlFor="preheader">
              Preheader Text
            </Label>
            <Textarea
              className="h-20 resize-none text-sm"
              id="preheader"
              onChange={(e) =>
                setMetadata((prev) => ({
                  ...prev,
                  preheader: e.target.value,
                }))
              }
              placeholder="Preview text shown in email clients alongside the subject..."
              value={metadata.preheader}
            />
            <p className="text-[11px] text-muted-foreground">
              This text appears as a preview in email clients. Keep it under 100
              characters.
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button disabled={!metadata.name.trim()} onClick={onConfirmSave}>
            <Save className="mr-2 h-4 w-4" />
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
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <FileCode className="h-4 w-4 text-primary" />
            </div>
            Export HTML
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            Copy or download the generated HTML code for your email template.
            {studioConfig?.export.minifyHtml && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-[10px] text-emerald-600">
                <Sparkles className="h-3 w-3" />
                Minified
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="group relative">
            <div className="absolute top-3 right-3 z-10">
              <Button
                className="h-7 px-2 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={onCopyHtml}
                size="sm"
                variant="secondary"
              >
                {copiedHtml ? (
                  <Check className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="mr-1 h-3.5 w-3.5" />
                )}
                {copiedHtml ? "Copied!" : "Copy"}
              </Button>
            </div>
            <pre className="max-h-[320px] overflow-auto rounded-xl bg-slate-950 p-4 font-mono text-slate-100 text-xs leading-relaxed">
              {exportedHtml.slice(0, 3000)}
              {exportedHtml.length > 3000 && (
                <span className="text-slate-500">
                  {`\n\n... truncated (${(exportedHtml.length - 3000).toLocaleString()} more characters)`}
                </span>
              )}
            </pre>
          </div>
          <div className="mt-3 flex items-center justify-between text-muted-foreground text-xs">
            <span>{exportedHtml.length.toLocaleString()} characters</span>
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              Ready for email clients
            </span>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Close
          </Button>
          <Button onClick={onCopyHtml} variant="outline">
            {copiedHtml ? (
              <Check className="mr-2 h-4 w-4 text-emerald-600" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copiedHtml ? "Copied!" : "Copy HTML"}
          </Button>
          <Button onClick={onDownloadHtml}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function EmailStudio() {
  const editorRef = useRef<UnlayerEditorHandle>(null);
  const [ui, dispatchUi] = useReducer(
    emailStudioUiReducer,
    INITIAL_EMAIL_STUDIO_UI_STATE
  );
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
    if (!editorRef.current) {
      return;
    }
    dispatchUi({ type: "set_show_save_dialog", value: true });
  }, []);

  const handleExportHtml = useCallback(async () => {
    if (!editorRef.current) {
      return;
    }
    try {
      const data = await editorRef.current.exportHtml({
        minify: studioConfig?.export.minifyHtml ?? true,
        cleanup: studioConfig?.export.cleanupCss ?? true,
      });
      dispatchUi({ type: "open_export_dialog", html: data.html });
    } catch {
      toast.error("Failed to export HTML");
    }
  }, [studioConfig]);

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

  const handleEditorReady = useCallback((config: EmailStudioFullConfig) => {
    dispatchUi({ type: "editor_ready", config });

    if (!config.account.isConfigured) {
      toast.info("Email Studio is running in free mode", {
        description: "Configure your Unlayer account for full features",
        duration: 4000,
        action: {
          label: "Setup",
          onClick: () => {},
        },
      });
    }
  }, []);

  const handleDesignUpdate = useCallback(() => {
    dispatchUi({ type: "set_unsaved_changes", value: true });
  }, []);

  const handleSave = useCallback(async () => {
    dispatchUi({ type: "set_saving", value: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!metadata.id) {
        setMetadata((prev) => ({ ...prev, id: crypto.randomUUID() }));
      }

      dispatchUi({ type: "set_unsaved_changes", value: false });
      toast.success("Template saved", {
        description: `"${metadata.name}" has been saved successfully`,
        duration: 3000,
      });
    } catch {
      toast.error("Failed to save template", {
        description: "Please try again",
        duration: 3000,
      });
    } finally {
      dispatchUi({ type: "set_saving", value: false });
    }
  }, [metadata.id, metadata.name]);

  const handleConfirmSave = useCallback(async () => {
    if (!editorRef.current) {
      return;
    }

    dispatchUi({ type: "set_show_save_dialog", value: false });
    dispatchUi({ type: "set_saving", value: true });

    try {
      await editorRef.current.saveDesign();
      dispatchUi({ type: "set_unsaved_changes", value: false });

      if (!metadata.id) {
        setMetadata((prev) => ({ ...prev, id: crypto.randomUUID() }));
      }

      toast.success("Template saved", {
        description: `"${metadata.name}" has been saved successfully`,
        duration: 3000,
      });
    } catch {
      toast.error("Failed to save template");
    } finally {
      dispatchUi({ type: "set_saving", value: false });
    }
  }, [metadata.name, metadata.id]);

  const handleCopyHtml = useCallback(() => {
    navigator.clipboard.writeText(exportedHtml);
    dispatchUi({ type: "set_copied_html", value: true });
    toast.success("HTML copied to clipboard");
    setTimeout(
      () => dispatchUi({ type: "set_copied_html", value: false }),
      2000
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
    if (!editorRef.current) {
      return;
    }
    dispatchUi({ type: "set_preview_device", value: device });
    editorRef.current.showPreview(device);
  }, []);

  const handleNewTemplate = useCallback(() => {
    setMetadata({
      id: null,
      name: "Untitled Email",
      subject: "",
      preheader: "",
    });
    if (editorRef.current) {
      editorRef.current.loadDesign({
        counters: { u_column: 1, u_row: 1 },
        body: {
          rows: [],
          values: {
            backgroundColor: "#ffffff",
            contentWidth: "600px",
          },
        },
      });
    }
    dispatchUi({ type: "set_unsaved_changes", value: false });
    toast.info("New template created");
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col bg-background transition-all duration-300",
        isFullscreen
          ? "fixed inset-0 z-50 overflow-hidden"
          : "min-h-0 flex-1 overflow-hidden"
      )}
    >
      <EmailStudioHeader
        hasUnsavedChanges={hasUnsavedChanges}
        isEditorReady={isEditorReady}
        isFullscreen={isFullscreen}
        isSaving={isSaving}
        metadata={metadata}
        onExportHtml={handleExportHtml}
        onNewTemplate={handleNewTemplate}
        onPreview={handlePreview}
        onRedo={handleRedo}
        onSaveClick={handleSaveClick}
        onToggleFullscreen={() => dispatchUi({ type: "toggle_fullscreen" })}
        onUndo={handleUndo}
        previewDevice={previewDevice}
      />

      <div className="relative flex-1 overflow-hidden bg-muted/30">
        <UnlayerEditor
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
          className="absolute inset-0"
          editorId="email-studio-editor"
          mode="email"
          onDesignUpdate={handleDesignUpdate}
          onReady={handleEditorReady}
          onSave={handleSave}
          ref={editorRef}
        />
      </div>

      <EmailSaveDialog
        metadata={metadata}
        onConfirmSave={handleConfirmSave}
        onOpenChange={(open) =>
          dispatchUi({ type: "set_show_save_dialog", value: open })
        }
        open={showSaveDialog}
        setMetadata={setMetadata}
      />

      <EmailExportDialog
        copiedHtml={copiedHtml}
        exportedHtml={exportedHtml}
        onCopyHtml={handleCopyHtml}
        onDownloadHtml={handleDownloadHtml}
        onOpenChange={(open) =>
          dispatchUi({ type: "set_show_export_dialog", value: open })
        }
        open={showExportDialog}
        studioConfig={studioConfig}
      />
    </div>
  );
}
