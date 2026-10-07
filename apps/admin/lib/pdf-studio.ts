export type PDFTemplateCategory =
  | "tax_receipt"
  | "donation_receipt"
  | "annual_statement"
  | "letter"
  | "certificate"
  | "missionary_report"
  | "report"
  | "invoice"
  | "custom";

export type PDFTemplateEngine = "unlayer" | "asym_pdf_document_builder";

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
    value: "missionary_report",
    label: "Missionary Report",
    description: "Missionary support and ministry reports",
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
