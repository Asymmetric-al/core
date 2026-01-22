"use client";

import * as React from "react";
import {
  useRef,
  useCallback,
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useEffect,
  useId,
  useSyncExternalStore,
} from "react";
import dynamic from "next/dynamic";
import type { EditorRef, EmailEditorProps, Editor } from "react-email-editor";
import type {
  UnlayerDesignJSON,
  UnlayerExportHTML,
  UnlayerOptions,
  UnlayerMergeTags,
  UnlayerAppearance,
} from "@asym/email/email-studio-types";
import {
  getEmailStudioConfig,
  getUnlayerAccountConfig,
  DEFAULT_APPEARANCE,
  DEFAULT_MERGE_TAGS,
  type EmailStudioFullConfig,
} from "@asym/config/email-studio";
import {
  getPDFStudioConfig,
  DEFAULT_PDF_APPEARANCE,
  DEFAULT_PDF_MERGE_TAGS,
  type PDFStudioFullConfig,
} from "@asym/config/pdf-studio";
import { cn } from "@asym/lib/utils";
import { Mail, FileText, Loader2 } from "lucide-react";
import { Progress } from "@asym/ui/components/shadcn/progress";

type StudioConfig = EmailStudioFullConfig | PDFStudioFullConfig;

const EmailEditor = dynamic(() => import("react-email-editor"), {
  ssr: false,
  loading: () => null,
});

const DEFAULT_BLANK_DESIGN: UnlayerDesignJSON = {
  counters: { u_column: 1, u_row: 1, u_content_text: 1 },
  body: {
    id: "blank-template",
    rows: [],
    headers: [],
    footers: [],
    values: {
      _meta: {
        htmlID: "u_body",
        htmlClassNames: "u_body",
      },
      backgroundColor: "#ffffff",
      fontFamily: {
        label: "Arial",
        value: "arial,helvetica,sans-serif",
      },
      textColor: "#1f2937",
      linkStyle: {
        body: true,
        linkColor: "#2563eb",
        linkHoverColor: "#1d4ed8",
        linkUnderline: true,
        linkHoverUnderline: true,
      },
      contentWidth: "600px",
      contentAlign: "center",
      preheaderText: "",
      _previewText: "",
    },
  },
  schemaVersion: 16,
};

export interface UnlayerPdfExportResult {
  design: UnlayerDesignJSON;
  url: string | null;
}

export interface PdfExportOptions {
  mergeTags?: Record<string, string>;
}

export interface UnlayerEditorHandle {
  exportHtml: (options?: ExportOptions) => Promise<UnlayerExportHTML>;
  exportPdf: (options?: PdfExportOptions) => Promise<UnlayerPdfExportResult>;
  exportDesign: () => Promise<UnlayerDesignJSON>;
  loadDesign: (design: UnlayerDesignJSON) => void;
  saveDesign: () => Promise<UnlayerDesignJSON>;
  setMergeTags: (mergeTags: UnlayerMergeTags) => void;
  showPreview: (device: "desktop" | "mobile") => void;
  undo: () => void;
  redo: () => void;
  getConfig: () => StudioConfig;
}

interface ExportOptions {
  minify?: boolean;
  cleanup?: boolean;
  mergeTags?: Record<string, string>;
}

interface UnlayerEditorProps {
  mode?: "email" | "web" | "popup" | "document";
  initialDesign?: UnlayerDesignJSON;
  projectId?: number;
  editorId?: string;
  onReady?: (config: StudioConfig) => void;
  onLoad?: () => void;
  onDesignUpdate?: (design: UnlayerDesignJSON) => void;
  onSave?: (data: { design: UnlayerDesignJSON; html: string }) => void;
  onExport?: (data: UnlayerExportHTML) => void;
  className?: string;
  minHeight?: string;
  appearance?: Partial<UnlayerAppearance>;
  mergeTags?: UnlayerMergeTags;
  user?: {
    id?: string;
    email?: string;
    name?: string;
  };
  locale?: string;
  customCSS?: string[];
  customJS?: string[];
}

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export const UnlayerEditor = forwardRef<
  UnlayerEditorHandle,
  UnlayerEditorProps
>(function UnlayerEditor(
  {
    mode = "email",
    initialDesign,
    projectId: projectIdProp,
    editorId,
    onReady,
    onLoad,
    onDesignUpdate,
    onSave,
    onExport,
    className,
    appearance,
    mergeTags,
    user,
    locale = "en-US",
    customCSS,
    customJS,
  },
  ref,
) {
  const emailEditorRef = useRef<EditorRef>(null);
  const [loadingState, setLoadingState] = useState<
    "mounting" | "loading" | "ready"
  >("mounting");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const designLoadedRef = useRef(false);
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const reactId = useId();
  const stableEditorId =
    editorId || `unlayer-editor-${mode}-${reactId.replace(/:/g, "")}`;

  const isDocumentMode = mode === "document";

  const studioConfig = useMemo(
    () => (isDocumentMode ? getPDFStudioConfig() : getEmailStudioConfig()),
    [isDocumentMode],
  );

  const accountConfig = useMemo(() => getUnlayerAccountConfig(), []);

  const defaultAppearance = useMemo(
    () => (isDocumentMode ? DEFAULT_PDF_APPEARANCE : DEFAULT_APPEARANCE),
    [isDocumentMode],
  );

  const defaultMergeTags = useMemo(
    () => (isDocumentMode ? DEFAULT_PDF_MERGE_TAGS : DEFAULT_MERGE_TAGS),
    [isDocumentMode],
  );

  const resolvedProjectId = useMemo(() => {
    if (projectIdProp && projectIdProp > 0) return projectIdProp;
    return accountConfig.projectId || undefined;
  }, [projectIdProp, accountConfig.projectId]);

  const mergedAppearance: UnlayerAppearance = useMemo(
    () => ({
      ...defaultAppearance,
      ...studioConfig.appearance,
      ...appearance,
      panels: {
        ...defaultAppearance.panels,
        ...studioConfig.appearance?.panels,
        ...appearance?.panels,
        tools: {
          ...defaultAppearance.panels?.tools,
          ...studioConfig.appearance?.panels?.tools,
          ...appearance?.panels?.tools,
        },
      },
      features: {
        ...defaultAppearance.features,
        ...studioConfig.appearance?.features,
        ...appearance?.features,
      },
    }),
    [defaultAppearance, studioConfig.appearance, appearance],
  );

  const mergedMergeTags = useMemo(
    () => mergeTags || studioConfig.mergeTags || defaultMergeTags,
    [mergeTags, studioConfig.mergeTags, defaultMergeTags],
  );

  useEffect(() => {
    if (loadingState === "mounting") {
      const timer = setTimeout(() => {
        setLoadingProgress(20);
      }, 100);
      return () => clearTimeout(timer);
    }
    if (loadingState === "loading") {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => Math.min(prev + 10, 90));
      }, 200);
      return () => clearInterval(interval);
    }
  }, [loadingState]);

  const progress = loadingState === "ready" ? 100 : loadingProgress;

  const LoadingIcon = isDocumentMode ? FileText : Mail;
  const loadingLabel = isDocumentMode ? "document" : "email";

  const exportHtml = useCallback(
    (options?: ExportOptions): Promise<UnlayerExportHTML> => {
      return new Promise((resolve, reject) => {
        const unlayer = emailEditorRef.current?.editor;
        if (!unlayer) {
          reject(new Error("Editor not ready"));
          return;
        }

        const exportOptions = {
          minify: options?.minify ?? studioConfig.export.minifyHtml,
          cleanup: options?.cleanup ?? studioConfig.export.cleanupCss,
          mergeTags: options?.mergeTags,
        };

        unlayer.exportHtml((data: UnlayerExportHTML) => {
          resolve(data);
          onExport?.(data);
        }, exportOptions);
      });
    },
    [onExport, studioConfig.export],
  );

  const exportPdf = useCallback(
    (options?: PdfExportOptions): Promise<UnlayerPdfExportResult> => {
      return new Promise((resolve, reject) => {
        const unlayer = emailEditorRef.current?.editor;
        if (!unlayer) {
          reject(new Error("Editor not ready"));
          return;
        }

        const exportOptions = options?.mergeTags
          ? { mergeTags: options.mergeTags }
          : undefined;

        unlayer.exportPdf(
          (data: { design: UnlayerDesignJSON; url: string | null }) => {
            resolve(data);
          },
          exportOptions,
        );
      });
    },
    [],
  );

  const exportDesign = useCallback((): Promise<UnlayerDesignJSON> => {
    return new Promise((resolve, reject) => {
      const unlayer = emailEditorRef.current?.editor;
      if (!unlayer) {
        reject(new Error("Editor not ready"));
        return;
      }
      unlayer.saveDesign((design: UnlayerDesignJSON) => {
        resolve(design);
      });
    });
  }, []);

  const loadDesign = useCallback((design: UnlayerDesignJSON) => {
    const unlayer = emailEditorRef.current?.editor;
    if (unlayer) {
      unlayer.loadDesign(design as never);
    }
  }, []);

  const saveDesign = useCallback(async (): Promise<UnlayerDesignJSON> => {
    const unlayer = emailEditorRef.current?.editor;
    if (!unlayer) {
      throw new Error("Editor not ready");
    }

    return new Promise((resolve) => {
      unlayer.exportHtml(
        (data: UnlayerExportHTML) => {
          onSave?.({ design: data.design, html: data.html });
          resolve(data.design);
        },
        {
          minify: studioConfig.export.minifyHtml,
          cleanup: studioConfig.export.cleanupCss,
        },
      );
    });
  }, [onSave, studioConfig.export]);

  const setMergeTags = useCallback((tags: UnlayerMergeTags) => {
    const unlayer = emailEditorRef.current?.editor;
    if (unlayer) {
      unlayer.setMergeTags(tags);
    }
  }, []);

  const showPreview = useCallback((device: "desktop" | "mobile") => {
    const unlayer = emailEditorRef.current?.editor;
    if (unlayer) {
      unlayer.showPreview({ device });
    }
  }, []);

  const undo = useCallback(() => {
    const unlayer = emailEditorRef.current?.editor;
    if (unlayer) {
      unlayer.undo();
    }
  }, []);

  const redo = useCallback(() => {
    const unlayer = emailEditorRef.current?.editor;
    if (unlayer) {
      unlayer.redo();
    }
  }, []);

  const getConfig = useCallback(() => studioConfig, [studioConfig]);

  useImperativeHandle(
    ref,
    () => ({
      exportHtml,
      exportPdf,
      exportDesign,
      loadDesign,
      saveDesign,
      setMergeTags,
      showPreview,
      undo,
      redo,
      getConfig,
    }),
    [
      exportHtml,
      exportPdf,
      exportDesign,
      loadDesign,
      saveDesign,
      setMergeTags,
      showPreview,
      undo,
      redo,
      getConfig,
    ],
  );

  const handleEditorLoad: EmailEditorProps["onLoad"] = useCallback(() => {
    setLoadingState("loading");
    onLoad?.();
  }, [onLoad]);

  const handleEditorReady: EmailEditorProps["onReady"] = useCallback(
    (unlayer: Editor) => {
      if (!designLoadedRef.current) {
        const designToLoad = initialDesign || DEFAULT_BLANK_DESIGN;
        unlayer.loadDesign(designToLoad as never);
        designLoadedRef.current = true;
      }

      unlayer.addEventListener(
        "design:updated",
        (data: { design: UnlayerDesignJSON }) => {
          onDesignUpdate?.(data.design);
        },
      );

      setLoadingState("ready");
      onReady?.(studioConfig);
    },
    [initialDesign, onReady, onDesignUpdate, studioConfig],
  );

  const editorOptions: UnlayerOptions = useMemo(
    () => ({
      projectId: resolvedProjectId,
      displayMode: mode,
      locale,
      appearance: mergedAppearance,
      mergeTags: mergedMergeTags,
      version: "latest",
      user: user
        ? {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        : undefined,
      features: {
        audit: studioConfig.features.audit,
        preview: studioConfig.features.preview,
        imageEditor: studioConfig.features.imageEditor,
        undoRedo: studioConfig.features.undoRedo,
        stockImages: {
          enabled: studioConfig.features.stockImages,
          safeSearch: true,
        },
        userUploads: studioConfig.features.userUploads,
      },
      tools: {
        button: {
          enabled: true,
          properties: {
            borderRadius: { value: "6px" },
            buttonColors: {
              editor: {
                data: {
                  colors: [
                    studioConfig.brand.accentColor,
                    "#16a34a",
                    "#dc2626",
                    "#7c3aed",
                    "#0d9488",
                    "#ea580c",
                    studioConfig.brand.primaryColor,
                  ],
                },
              },
            },
          },
        },
        text: { enabled: true },
        image: { enabled: true },
        divider: { enabled: true },
        social: { enabled: true },
        video: { enabled: true },
        menu: { enabled: true },
        html: { enabled: true },
        heading: { enabled: true },
        timer: { enabled: true },
      },
      editor: {
        minRows: 1,
        maxRows: 500,
        confirmOnDelete: true,
      },
      customCSS: customCSS || [],
      customJS: customJS || [],
    }),
    [
      resolvedProjectId,
      mode,
      locale,
      mergedAppearance,
      mergedMergeTags,
      user,
      studioConfig,
      customCSS,
      customJS,
    ],
  );

  if (!isMounted) {
    return (
      <div
        className={cn(
          "unlayer-editor-wrapper flex flex-col items-center justify-center",
          className,
        )}
      >
        <div className="flex flex-col items-center gap-6 max-w-xs text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl animate-pulse" />
            <div className="relative p-4 rounded-2xl bg-primary/10 border border-primary/20">
              <LoadingIcon className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2 w-full">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-medium text-foreground">
                Initializing {loadingLabel} editor...
              </span>
            </div>
            <Progress value={10} className="h-1.5 w-48" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("unlayer-editor-wrapper", className)}>
      {loadingState !== "ready" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm transition-opacity duration-300">
          <div className="flex flex-col items-center gap-6 max-w-xs text-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl animate-pulse" />
              <div className="relative p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <LoadingIcon className="h-8 w-8 text-primary" />
              </div>
            </div>

            <div className="space-y-2 w-full">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {loadingState === "mounting"
                    ? `Preparing ${loadingLabel} editor...`
                    : "Loading components..."}
                </span>
              </div>
              <Progress value={progress} className="h-1.5 w-48" />
            </div>

            {!accountConfig.isConfigured && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Free mode - Limited features
              </div>
            )}
          </div>
        </div>
      )}

      <EmailEditor
        ref={emailEditorRef}
        editorId={stableEditorId}
        onLoad={handleEditorLoad}
        onReady={handleEditorReady}
        options={editorOptions as EmailEditorProps["options"]}
        style={{
          flex: "1 1 auto",
          display: "flex",
          height: "100%",
          width: "100%",
          opacity: loadingState === "ready" ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
      />
    </div>
  );
});

export default UnlayerEditor;
