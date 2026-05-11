import {
  DEFAULT_MERGE_TAG_REGISTRY,
  toLegacyUnlayerMergeTags,
  type MergeTagRegistry,
} from "@asym/email/merge-tags";
import { clientEnv, runtimeEnvFlags } from "@asym/env";

import type { EmailBuilderKind } from "@asym/email/email-builder-types";
import type {
  UnlayerAppearance,
  UnlayerMergeTags,
} from "@asym/email/email-studio-types";

export type EmailStudioBuilderMode = EmailBuilderKind | "auto";

export interface UnlayerAccountConfig {
  projectId: number | null;
  isConfigured: boolean;
  isWhiteLabel: boolean;
  allowedDomains: string[];
  environment: "development" | "staging" | "production";
}

export interface EmailStudioBrandConfig {
  companyName: string;
  logoUrl?: string;
  primaryColor: string;
  accentColor: string;
  footerText?: string;
}

export interface EmailStudioFullConfig {
  account: UnlayerAccountConfig;
  builder: {
    requestedBuilder: EmailStudioBuilderMode;
    defaultBuilder: EmailBuilderKind;
    legacyUnlayerEnabled: boolean;
  };
  brand: EmailStudioBrandConfig;
  appearance: UnlayerAppearance;
  mergeTagRegistry: MergeTagRegistry;
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
}

function isEmailStudioBuilderMode(
  value: unknown,
): value is EmailStudioBuilderMode {
  return value === "react_email" || value === "unlayer" || value === "auto";
}

function getEnvironment(): "development" | "staging" | "production" {
  if (typeof window === "undefined") {
    return runtimeEnvFlags.NODE_ENV === "production"
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

  const customDomains = clientEnv.NEXT_PUBLIC_UNLAYER_ALLOWED_DOMAINS;
  if (customDomains) {
    domains.push(...customDomains.split(",").map((d: string) => d.trim()));
  }

  const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      const url = new URL(siteUrl);
      domains.push(url.hostname);
    } catch {}
  }

  return [...new Set(domains)];
}

export function getUnlayerAccountConfig(): UnlayerAccountConfig {
  const projectIdStr = clientEnv.NEXT_PUBLIC_UNLAYER_PROJECT_ID;
  const projectId = projectIdStr ? parseInt(projectIdStr, 10) : null;
  const isValidProjectId =
    projectId !== null && !isNaN(projectId) && projectId > 0;

  return {
    projectId: isValidProjectId ? projectId : null,
    isConfigured: isValidProjectId,
    isWhiteLabel: isValidProjectId && clientEnv.NEXT_PUBLIC_UNLAYER_WHITE_LABEL,
    allowedDomains: getAllowedDomains(),
    environment: getEnvironment(),
  };
}

export function getEmailStudioBrandConfig(): EmailStudioBrandConfig {
  return {
    companyName: clientEnv.NEXT_PUBLIC_BRAND_NAME || "GiveHope",
    logoUrl: clientEnv.NEXT_PUBLIC_BRAND_LOGO_URL,
    primaryColor: clientEnv.NEXT_PUBLIC_BRAND_PRIMARY_COLOR || "#0f172a",
    accentColor: clientEnv.NEXT_PUBLIC_BRAND_ACCENT_COLOR || "#2563eb",
    footerText: clientEnv.NEXT_PUBLIC_EMAIL_FOOTER_TEXT,
  };
}

export const DEFAULT_APPEARANCE: UnlayerAppearance = {
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
      emojis: true,
    },
  },
};

export const DEFAULT_MERGE_TAGS: UnlayerMergeTags = toLegacyUnlayerMergeTags(
  DEFAULT_MERGE_TAG_REGISTRY,
);

export function getEmailStudioBuilderConfig(): EmailStudioFullConfig["builder"] {
  const requestedBuilder = isEmailStudioBuilderMode(
    clientEnv.NEXT_PUBLIC_EMAIL_STUDIO_BUILDER,
  )
    ? clientEnv.NEXT_PUBLIC_EMAIL_STUDIO_BUILDER
    : "react_email";
  const defaultBuilder =
    requestedBuilder === "unlayer" ? "unlayer" : "react_email";

  return {
    requestedBuilder,
    defaultBuilder,
    legacyUnlayerEnabled:
      clientEnv.NEXT_PUBLIC_EMAIL_STUDIO_LEGACY_UNLAYER_ENABLED ?? true,
  };
}

export function getEmailStudioConfig(): EmailStudioFullConfig {
  const account = getUnlayerAccountConfig();
  const builder = getEmailStudioBuilderConfig();
  const brand = getEmailStudioBrandConfig();

  return {
    account,
    builder,
    brand,
    appearance: DEFAULT_APPEARANCE,
    mergeTagRegistry: DEFAULT_MERGE_TAG_REGISTRY,
    mergeTags: DEFAULT_MERGE_TAGS,
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
      minifyHtml: true,
      cleanupCss: true,
      inlineCss: true,
    },
  };
}

export function getUnlayerSetupStatus(): {
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
    "Mobile preview",
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
        "Email Studio is running in free mode. Add your Unlayer project ID to unlock all features.",
      setupUrl: "https://dashboard.unlayer.com",
      features: freeFeatures,
      missingFeatures: [...paidFeatures, ...whiteLabelFeatures],
    };
  }

  if (config.isWhiteLabel) {
    return {
      status: "white_label",
      message:
        "Email Studio is fully configured with white-label features enabled.",
      setupUrl: "https://dashboard.unlayer.com",
      features: [...freeFeatures, ...paidFeatures, ...whiteLabelFeatures],
      missingFeatures: [],
    };
  }

  return {
    status: "configured",
    message:
      "Email Studio is configured. Upgrade to white-label to remove branding.",
    setupUrl: "https://dashboard.unlayer.com",
    features: [...freeFeatures, ...paidFeatures],
    missingFeatures: whiteLabelFeatures,
  };
}

export const UNLAYER_SETUP_INSTRUCTIONS = {
  title: "Setting Up Unlayer Email Studio",
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
      description: "Create a new project for your email editor integration",
      details:
        'Go to Projects → Create New Project → Choose "Email" as the project type',
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

export const emailStudioConfig = {
  getConfig: getEmailStudioConfig,
  getAccountConfig: getUnlayerAccountConfig,
  getBuilderConfig: getEmailStudioBuilderConfig,
  getBrandConfig: getEmailStudioBrandConfig,
  getSetupStatus: getUnlayerSetupStatus,
  setupInstructions: UNLAYER_SETUP_INSTRUCTIONS,
  defaults: {
    appearance: DEFAULT_APPEARANCE,
    mergeTags: DEFAULT_MERGE_TAGS,
  },
};
