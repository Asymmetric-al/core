import type {
  UnlayerDesignJSON,
  UnlayerMergeTags,
  UnlayerAppearance,
} from "./email-studio";

export type { UnlayerDesignJSON, UnlayerMergeTags, UnlayerAppearance };

export interface PDFTemplate {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  design: UnlayerDesignJSON;
  html?: string;
  thumbnail?: string;
  category?: PDFTemplateCategory;
  tags?: string[];
  page_size: "A4" | "Letter" | "Legal";
  orientation: "portrait" | "landscape";
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  is_default?: boolean;
  status: "draft" | "published" | "archived";
}

export type PDFTemplateCategory =
  | "tax_receipt"
  | "donation_receipt"
  | "annual_statement"
  | "letter"
  | "certificate"
  | "report"
  | "invoice"
  | "custom";

export interface PDFTemplateListItem {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  category?: PDFTemplateCategory;
  tags?: string[];
  page_size: "A4" | "Letter" | "Legal";
  orientation: "portrait" | "landscape";
  status: "draft" | "published" | "archived";
  created_at: Date;
  updated_at: Date;
}

export interface PDFExportOptions {
  pageSize?: "A4" | "Letter" | "Legal";
  orientation?: "portrait" | "landscape";
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  scale?: number;
  printBackground?: boolean;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
}

export interface PDFGenerationResult {
  success: boolean;
  pdf_url?: string;
  pdf_base64?: string;
  error?: string;
  pages?: number;
  size_bytes?: number;
}

export interface PDFStudioMetadata {
  id: string | null;
  name: string;
  description: string;
  category: PDFTemplateCategory;
  pageSize: "A4" | "Letter" | "Legal";
  orientation: "portrait" | "landscape";
}

export interface PDFStudioState {
  isLoading: boolean;
  isReady: boolean;
  isSaving: boolean;
  isExporting: boolean;
  hasUnsavedChanges: boolean;
  currentTemplateId: string | null;
  error: string | null;
}

export interface PDFStudioSavePayload {
  design: UnlayerDesignJSON;
  html: string;
  metadata: {
    name: string;
    description?: string;
    category?: PDFTemplateCategory;
    pageSize?: "A4" | "Letter" | "Legal";
    orientation?: "portrait" | "landscape";
  };
}

export interface PDFStudioFeatures {
  preview: boolean;
  imageEditor: boolean;
  stockImages: boolean;
  userUploads: boolean;
  audit: boolean;
  undoRedo: boolean;
}

export interface PDFStudioConfig {
  projectId?: number;
  appearance: UnlayerAppearance;
  features: PDFStudioFeatures;
  mergeTags?: UnlayerMergeTags;
  pdf: {
    defaultPageSize: "A4" | "Letter" | "Legal";
    defaultOrientation: "portrait" | "landscape";
    defaultMargins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
}

export const PDF_TEMPLATE_CATEGORIES: {
  value: PDFTemplateCategory;
  label: string;
  description: string;
}[] = [
  {
    value: "tax_receipt",
    label: "Tax Receipt",
    description: "Year-end tax receipts for donors",
  },
  {
    value: "donation_receipt",
    label: "Donation Receipt",
    description: "Individual donation acknowledgments",
  },
  {
    value: "annual_statement",
    label: "Annual Statement",
    description: "Yearly giving statements",
  },
  {
    value: "letter",
    label: "Letter",
    description: "General correspondence letters",
  },
  {
    value: "certificate",
    label: "Certificate",
    description: "Certificates and awards",
  },
  {
    value: "report",
    label: "Report",
    description: "Financial or ministry reports",
  },
  {
    value: "invoice",
    label: "Invoice",
    description: "Billing and invoice documents",
  },
  {
    value: "custom",
    label: "Custom",
    description: "Custom document templates",
  },
];

export const PAGE_SIZES: {
  value: "A4" | "Letter" | "Legal";
  label: string;
  dimensions: string;
}[] = [
  { value: "Letter", label: "US Letter", dimensions: '8.5" × 11"' },
  { value: "A4", label: "A4", dimensions: "210mm × 297mm" },
  { value: "Legal", label: "US Legal", dimensions: '8.5" × 14"' },
];

export const ORIENTATIONS: {
  value: "portrait" | "landscape";
  label: string;
}[] = [
  { value: "portrait", label: "Portrait" },
  { value: "landscape", label: "Landscape" },
];
