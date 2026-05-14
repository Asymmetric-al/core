import type {
  EmailBuilderKind,
  EmailDesignEnvelope,
  EmailStudioTemplateStatus,
} from "./email-builder-types";
import type { MergeTagRegistry } from "./merge-tags";

export type {
  UnlayerAppearance,
  UnlayerDesignJSON,
  UnlayerDesignTag,
  UnlayerDesignTagsConfig,
  UnlayerEditorConfig,
  UnlayerEditorMode,
  UnlayerExportHTML,
  UnlayerExportImage,
  UnlayerExportPlainText,
  UnlayerFeaturesConfig,
  UnlayerMergeTags,
  UnlayerOptions,
  UnlayerProjectSettings,
  UnlayerSpecialLink,
  UnlayerStockImagesConfig,
  UnlayerTextEditorFeatures,
  UnlayerToolConfig,
  UnlayerToolProperty,
  UnlayerUserConfig,
  UnlayerWhiteLabelConfig,
} from "./legacy/unlayer-types";

export type EmailStudioMode = "email" | "web" | "popup" | "document";

export interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  builder: EmailBuilderKind;
  builderVersion?: string;
  design: Record<string, unknown>;
  envelope?: EmailDesignEnvelope;
  html?: string | null;
  text?: string | null;
  thumbnail?: string;
  category?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  isDefault?: boolean;
  status?: EmailStudioTemplateStatus;
}

export interface EmailRecipientConfig {
  listIds?: string[];
  segmentIds?: string[];
  excludeListIds?: string[];
  count?: number;
}

export interface EmailCampaignStats {
  sent?: number;
  delivered?: number;
  opened?: number;
  clicked?: number;
  bounced?: number;
  unsubscribed?: number;
  complained?: number;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  preheader?: string;
  templateId?: string;
  builder: EmailBuilderKind;
  builderVersion?: string;
  design: Record<string, unknown>;
  html?: string | null;
  text?: string | null;
  status: "draft" | "scheduled" | "sending" | "sent" | "paused" | "cancelled";
  recipients?: EmailRecipientConfig;
  scheduledAt?: Date;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  stats?: EmailCampaignStats;
}

export interface EmailStudioFeatures {
  preview: boolean;
  imageEditor: boolean;
  stockImages: boolean;
  userUploads: boolean;
  audit: boolean;
  undoRedo: boolean;
}

export interface EmailStudioConfig {
  builder: EmailBuilderKind;
  legacyUnlayerEnabled: boolean;
  mode: EmailStudioMode;
  features: EmailStudioFeatures;
  mergeTags?: MergeTagRegistry;
}

export interface EmailStudioExportOptions {
  minify: boolean;
  cleanup: boolean;
  inlineCss: boolean;
}

export interface EmailStudioSavePayload {
  builder: EmailBuilderKind;
  builderVersion?: string | null;
  design: Record<string, unknown>;
  html: string;
  text?: string | null;
  metadata: {
    name: string;
    subject?: string;
    preheader?: string;
  };
  exportOptions?: Partial<EmailStudioExportOptions>;
}

export interface EmailTemplateListItem {
  id: string;
  name: string;
  description?: string;
  builder: EmailBuilderKind;
  thumbnail?: string;
  category?: string;
  tags?: string[];
  status: EmailStudioTemplateStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailStudioState {
  isLoading: boolean;
  isReady: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  currentTemplateId: string | null;
  error: string | null;
}
