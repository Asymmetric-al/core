import type { UnlayerAppearance, UnlayerMergeTags } from "@/types/email-studio";

export interface UnlayerAccountConfig {
  projectId: number | null;
  isConfigured: boolean;
  isWhiteLabel: boolean;
  allowedDomains: string[];
  environment: "development" | "staging" | "production";
}

export interface PDFStudioBrandConfig {
  companyName: string;
  logoUrl?: string;
  primaryColor: string;
  accentColor: string;
  footerText?: string;
}

export interface PDFStudioFullConfig {
  account: UnlayerAccountConfig;
  brand: PDFStudioBrandConfig;
  appearance: UnlayerAppearance;
  mergeTags: UnlayerMergeTags;
  features: {
    preview: boolean;
    imageEditor: boolean;
    stockImages: boolean;
    userUploads: boolean;
    audit: boolean;
    undoRedo: boolean;
    aiAssistant: boolean;
    customFonts: boolean;
    customBlocks: boolean;
  };
  export: {
    minifyHtml: boolean;
    cleanupCss: boolean;
    inlineCss: boolean;
  };
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

function getEnvironment(): "development" | "staging" | "production" {
  if (typeof window === "undefined") {
    return (process.env.NODE_ENV as "development" | "production") ===
      "production"
      ? "production"
      : "development";
  }

  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "development";
  }
  if (hostname.includes("staging") || hostname.includes("preview")) {
    return "staging";
  }
  return "production";
}

function getAllowedDomains(): string[] {
  const domains: string[] = [];

  domains.push("localhost");
  domains.push("127.0.0.1");

  const customDomains = process.env.NEXT_PUBLIC_UNLAYER_ALLOWED_DOMAINS;
  if (customDomains) {
    domains.push(...customDomains.split(",").map((d) => d.trim()));
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      const url = new URL(siteUrl);
      domains.push(url.hostname);
    } catch {}
  }

  return [...new Set(domains)];
}

export function getUnlayerAccountConfig(): UnlayerAccountConfig {
  const projectIdStr = process.env.NEXT_PUBLIC_UNLAYER_PROJECT_ID;
  const projectId = projectIdStr ? parseInt(projectIdStr, 10) : null;
  const isValidProjectId =
    projectId !== null && !isNaN(projectId) && projectId > 0;

  return {
    projectId: isValidProjectId ? projectId : null,
    isConfigured: isValidProjectId,
    isWhiteLabel:
      isValidProjectId &&
      process.env.NEXT_PUBLIC_UNLAYER_WHITE_LABEL === "true",
    allowedDomains: getAllowedDomains(),
    environment: getEnvironment(),
  };
}

export function getPDFStudioBrandConfig(): PDFStudioBrandConfig {
  return {
    companyName: process.env.NEXT_PUBLIC_BRAND_NAME || "GiveHope",
    logoUrl: process.env.NEXT_PUBLIC_BRAND_LOGO_URL,
    primaryColor: process.env.NEXT_PUBLIC_BRAND_PRIMARY_COLOR || "#0f172a",
    accentColor: process.env.NEXT_PUBLIC_BRAND_ACCENT_COLOR || "#2563eb",
    footerText:
      process.env.NEXT_PUBLIC_PDF_FOOTER_TEXT ||
      process.env.NEXT_PUBLIC_EMAIL_FOOTER_TEXT,
  };
}

export const DEFAULT_PDF_APPEARANCE: UnlayerAppearance = {
  theme: "modern_light",
  panels: {
    tools: {
      dock: "right",
      collapsible: true,
      defaultUncollapsed: true,
    },
  },
  features: {
    preview: true,
    imageEditor: true,
    stockImages: true,
    userUploads: true,
    audit: true,
    undoRedo: true,
    textEditor: {
      spellChecker: true,
      tables: true,
      cleanPaste: true,
      emojis: false,
    },
  },
};

export const DEFAULT_PDF_MERGE_TAGS: UnlayerMergeTags = {
  organization: {
    name: "Organization",
    mergeTags: {
      org_name: {
        name: "Organization Name",
        value: "{{org_name}}",
        sample: "Give Hope International",
      },
      org_address: {
        name: "Organization Address",
        value: "{{org_address}}",
        sample: "123 Ministry Lane, Springfield, IL 62701",
      },
      org_phone: {
        name: "Organization Phone",
        value: "{{org_phone}}",
        sample: "(555) 123-4567",
      },
      org_email: {
        name: "Organization Email",
        value: "{{org_email}}",
        sample: "support@givehope.org",
      },
      org_website: {
        name: "Website",
        value: "{{org_website}}",
        sample: "https://givehope.org",
      },
      org_ein: {
        name: "EIN/Tax ID",
        value: "{{org_ein}}",
        sample: "12-3456789",
      },
    },
  },
  recipient: {
    name: "Recipient",
    mergeTags: {
      first_name: {
        name: "First Name",
        value: "{{first_name}}",
        sample: "John",
      },
      last_name: {
        name: "Last Name",
        value: "{{last_name}}",
        sample: "Smith",
      },
      full_name: {
        name: "Full Name",
        value: "{{full_name}}",
        sample: "John Smith",
      },
      email: {
        name: "Email Address",
        value: "{{email}}",
        sample: "john.smith@example.com",
      },
      address_line1: {
        name: "Address Line 1",
        value: "{{address_line1}}",
        sample: "456 Oak Street",
      },
      address_line2: {
        name: "Address Line 2",
        value: "{{address_line2}}",
        sample: "Apt 2B",
      },
      city: {
        name: "City",
        value: "{{city}}",
        sample: "Springfield",
      },
      state: {
        name: "State",
        value: "{{state}}",
        sample: "IL",
      },
      zip: {
        name: "ZIP Code",
        value: "{{zip}}",
        sample: "62701",
      },
      country: {
        name: "Country",
        value: "{{country}}",
        sample: "United States",
      },
    },
  },
  donation: {
    name: "Donation",
    mergeTags: {
      donation_amount: {
        name: "Donation Amount",
        value: "{{donation_amount}}",
        sample: "$100.00",
      },
      donation_date: {
        name: "Donation Date",
        value: "{{donation_date}}",
        sample: "December 31, 2025",
      },
      donation_method: {
        name: "Payment Method",
        value: "{{donation_method}}",
        sample: "Credit Card",
      },
      donation_id: {
        name: "Donation ID",
        value: "{{donation_id}}",
        sample: "DON-2025-12345",
      },
      ytd_giving: {
        name: "Year-to-Date Giving",
        value: "{{ytd_giving}}",
        sample: "$2,500.00",
      },
      tax_receipt_number: {
        name: "Tax Receipt Number",
        value: "{{tax_receipt_number}}",
        sample: "TR-2025-00123",
      },
      gift_designation: {
        name: "Gift Designation",
        value: "{{gift_designation}}",
        sample: "General Fund",
      },
    },
  },
  document: {
    name: "Document",
    mergeTags: {
      document_date: {
        name: "Document Date",
        value: "{{document_date}}",
        sample: "January 1, 2026",
      },
      document_number: {
        name: "Document Number",
        value: "{{document_number}}",
        sample: "DOC-2026-0001",
      },
      fiscal_year: {
        name: "Fiscal Year",
        value: "{{fiscal_year}}",
        sample: "2025",
      },
      tax_year: {
        name: "Tax Year",
        value: "{{tax_year}}",
        sample: "2025",
      },
      statement_period: {
        name: "Statement Period",
        value: "{{statement_period}}",
        sample: "January 1 - December 31, 2025",
      },
    },
  },
  missionary: {
    name: "Missionary",
    mergeTags: {
      missionary_name: {
        name: "Missionary Name",
        value: "{{missionary_name}}",
        sample: "Sarah Johnson",
      },
      missionary_location: {
        name: "Field Location",
        value: "{{missionary_location}}",
        sample: "Southeast Asia",
      },
      missionary_id: {
        name: "Missionary ID",
        value: "{{missionary_id}}",
        sample: "MIS-2025-001",
      },
      support_account: {
        name: "Support Account",
        value: "{{support_account}}",
        sample: "SA-12345",
      },
    },
  },
  tax_receipt: {
    name: "Tax Receipt",
    mergeTags: {
      receipt_number: {
        name: "Receipt Number",
        value: "{{receipt_number}}",
        sample: "REC-2025-00001",
      },
      receipt_date: {
        name: "Receipt Date",
        value: "{{receipt_date}}",
        sample: "December 31, 2025",
      },
      total_contributions: {
        name: "Total Contributions",
        value: "{{total_contributions}}",
        sample: "$5,000.00",
      },
      goods_services_value: {
        name: "Goods/Services Value",
        value: "{{goods_services_value}}",
        sample: "$0.00",
      },
      tax_deductible_amount: {
        name: "Tax Deductible Amount",
        value: "{{tax_deductible_amount}}",
        sample: "$5,000.00",
      },
      tax_statement: {
        name: "Tax Statement",
        value: "{{tax_statement}}",
        sample:
          "No goods or services were provided in exchange for this contribution.",
      },
    },
  },
};

export function getPDFStudioConfig(): PDFStudioFullConfig {
  const account = getUnlayerAccountConfig();
  const brand = getPDFStudioBrandConfig();

  return {
    account,
    brand,
    appearance: DEFAULT_PDF_APPEARANCE,
    mergeTags: DEFAULT_PDF_MERGE_TAGS,
    features: {
      preview: true,
      imageEditor: true,
      stockImages: account.isConfigured,
      userUploads: true,
      audit: true,
      undoRedo: true,
      aiAssistant: account.isWhiteLabel,
      customFonts: account.isWhiteLabel,
      customBlocks: account.isConfigured,
    },
    export: {
      minifyHtml: false,
      cleanupCss: true,
      inlineCss: true,
    },
    pdf: {
      defaultPageSize: "Letter",
      defaultOrientation: "portrait",
      defaultMargins: {
        top: 72,
        right: 72,
        bottom: 72,
        left: 72,
      },
    },
  };
}

export function getPDFStudioSetupStatus(): {
  status: "not_configured" | "free_tier" | "configured" | "white_label";
  message: string;
  setupUrl: string;
  features: string[];
  missingFeatures: string[];
} {
  const config = getUnlayerAccountConfig();

  const freeFeatures = [
    "Drag-and-drop editor",
    "Basic templates",
    "HTML export",
    "Document preview",
  ];

  const paidFeatures = [
    "Stock images library",
    "Custom blocks",
    "Team collaboration",
    "Priority support",
  ];

  const whiteLabelFeatures = [
    "Remove Unlayer branding",
    "Custom domain support",
    "AI writing assistant",
    "Custom fonts",
    "Advanced analytics",
  ];

  if (!config.isConfigured) {
    return {
      status: "not_configured",
      message:
        "PDF Studio is running in free mode. Add your Unlayer project ID to unlock all features.",
      setupUrl: "https://dashboard.unlayer.com",
      features: freeFeatures,
      missingFeatures: [...paidFeatures, ...whiteLabelFeatures],
    };
  }

  if (config.isWhiteLabel) {
    return {
      status: "white_label",
      message:
        "PDF Studio is fully configured with white-label features enabled.",
      setupUrl: "https://dashboard.unlayer.com",
      features: [...freeFeatures, ...paidFeatures, ...whiteLabelFeatures],
      missingFeatures: [],
    };
  }

  return {
    status: "configured",
    message:
      "PDF Studio is configured. Upgrade to white-label to remove branding.",
    setupUrl: "https://dashboard.unlayer.com",
    features: [...freeFeatures, ...paidFeatures],
    missingFeatures: whiteLabelFeatures,
  };
}

export const PDF_STUDIO_SETUP_INSTRUCTIONS = {
  title: "Setting Up Unlayer PDF Studio",
  steps: [
    {
      step: 1,
      title: "Create Unlayer Account",
      description: "Visit dashboard.unlayer.com and create a free account",
      url: "https://dashboard.unlayer.com",
    },
    {
      step: 2,
      title: "Create a Project",
      description: "Create a new project for your document editor integration",
      details:
        'Go to Projects → Create New Project → Choose "Document" as the project type',
    },
    {
      step: 3,
      title: "Get Project ID",
      description: "Copy your Project ID from Project → Settings",
      details: "The Project ID is a numeric value (e.g., 123456)",
    },
    {
      step: 4,
      title: "Configure Environment",
      description: "Add the Project ID to your .env.local file",
      code: "NEXT_PUBLIC_UNLAYER_PROJECT_ID=123456",
    },
    {
      step: 5,
      title: "Add Allowed Domains (Production)",
      description:
        "In Unlayer Console, add your production domain to the allowed list",
      details:
        "Developer → Builder → Settings → Allowed Domains → Add your domain",
    },
  ],
  whiteLabelSteps: [
    {
      step: 1,
      title: "Upgrade Plan",
      description: "Upgrade to a paid plan that includes white-label features",
      url: "https://unlayer.com/pricing",
    },
    {
      step: 2,
      title: "Enable White-Label",
      description: "Enable white-label in your project settings",
      details: "Project → Settings → White Label → Enable",
    },
    {
      step: 3,
      title: "Configure Environment",
      description: "Add white-label flag to environment",
      code: "NEXT_PUBLIC_UNLAYER_WHITE_LABEL=true",
    },
    {
      step: 4,
      title: "Add Production Domain",
      description: "Whitelist your production domain for white-label to work",
      details:
        "Without this, the editor will fall back to showing Unlayer branding",
    },
  ],
};

export const pdfStudioConfig = {
  getConfig: getPDFStudioConfig,
  getAccountConfig: getUnlayerAccountConfig,
  getBrandConfig: getPDFStudioBrandConfig,
  getSetupStatus: getPDFStudioSetupStatus,
  setupInstructions: PDF_STUDIO_SETUP_INSTRUCTIONS,
  defaults: {
    appearance: DEFAULT_PDF_APPEARANCE,
    mergeTags: DEFAULT_PDF_MERGE_TAGS,
  },
};
