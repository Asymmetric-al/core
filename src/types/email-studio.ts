export interface UnlayerDesignTag {
  id: number
  name: string
}

export interface UnlayerDesignTagsConfig {
  enabled?: boolean
  data?: UnlayerDesignTag[]
}

export interface UnlayerMergeTags {
  [category: string]: {
    name: string
    mergeTags: {
      [key: string]: {
        name: string
        value: string
        sample?: string
      }
    }
  }
}

export interface UnlayerDesignJSON {
  counters?: Record<string, number>
  body: {
    id?: string
    rows: unknown[]
    headers?: unknown[]
    footers?: unknown[]
    values: Record<string, unknown>
  }
  schemaVersion?: number
}

export interface UnlayerExportHTML {
  design: UnlayerDesignJSON
  html: string
  chunks?: {
    body: string
    css: string
    js?: string
    fonts?: string[]
  }
}

export interface UnlayerExportPlainText {
  design: UnlayerDesignJSON
  text: string
}

export interface UnlayerExportImage {
  design: UnlayerDesignJSON
  url: string
}

export interface UnlayerTextEditorFeatures {
  spellChecker?: boolean
  tables?: boolean
  cleanPaste?: boolean
  emojis?: boolean
}

export interface UnlayerAppearance {
  theme?: 'modern_light' | 'modern_dark' | 'classic_light' | 'classic_dark'
  panels?: {
    tools?: {
      dock?: 'left' | 'right'
      collapsible?: boolean
      defaultUncollapsed?: boolean
    }
  }
  features?: {
    preview?: boolean
    imageEditor?: boolean
    stockImages?: boolean
    userUploads?: boolean
    audit?: boolean
    undoRedo?: boolean
    textEditor?: UnlayerTextEditorFeatures
  }
  loader?: {
    html?: string
    css?: string
  }
}

export interface UnlayerToolProperty {
  value?: unknown
  editor?: {
    data?: unknown
  }
}

export interface UnlayerToolConfig {
  enabled?: boolean
  position?: number
  properties?: Record<string, UnlayerToolProperty>
}

export interface UnlayerSpecialLink {
  name: string
  href: string
  target?: '_blank' | '_self' | '_parent' | '_top'
}

export interface UnlayerStockImagesConfig {
  enabled?: boolean
  safeSearch?: boolean
}

export interface UnlayerFeaturesConfig {
  audit?: boolean
  preview?: boolean
  imageEditor?: boolean
  undoRedo?: boolean
  stockImages?: UnlayerStockImagesConfig
  userUploads?: boolean
}

export interface UnlayerEditorConfig {
  minRows?: number
  maxRows?: number
  confirmOnDelete?: boolean
}

export interface UnlayerUserConfig {
  id?: string
  email?: string
  name?: string
  signature?: string
}

export interface UnlayerOptions {
  id?: string
  projectId?: number
  displayMode?: 'email' | 'web' | 'popup' | 'document'
  locale?: string
  appearance?: UnlayerAppearance
  user?: UnlayerUserConfig
  mergeTags?: UnlayerMergeTags
  designTags?: UnlayerDesignTagsConfig
  designTagsConfig?: UnlayerDesignTagsConfig
  specialLinks?: UnlayerSpecialLink[]
  tools?: Record<string, UnlayerToolConfig>
  blocks?: object[]
  editor?: UnlayerEditorConfig
  features?: UnlayerFeaturesConfig
  customCSS?: string[]
  customJS?: string[]
  version?: string
}

export interface EmailTemplate {
  id: string
  name: string
  description?: string
  design: UnlayerDesignJSON
  html?: string
  thumbnail?: string
  category?: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  isDefault?: boolean
  status?: 'draft' | 'published' | 'archived'
}

export interface EmailRecipientConfig {
  listIds?: string[]
  segmentIds?: string[]
  excludeListIds?: string[]
  count?: number
}

export interface EmailCampaignStats {
  sent?: number
  delivered?: number
  opened?: number
  clicked?: number
  bounced?: number
  unsubscribed?: number
  complained?: number
}

export interface EmailCampaign {
  id: string
  name: string
  subject: string
  preheader?: string
  templateId?: string
  design: UnlayerDesignJSON
  html?: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled'
  recipients?: EmailRecipientConfig
  scheduledAt?: Date
  sentAt?: Date
  createdAt: Date
  updatedAt: Date
  stats?: EmailCampaignStats
}

export type UnlayerEditorMode = 'email' | 'web' | 'popup' | 'document'

export interface EmailStudioFeatures {
  preview: boolean
  imageEditor: boolean
  stockImages: boolean
  userUploads: boolean
  audit: boolean
  undoRedo: boolean
}

export interface EmailStudioConfig {
  projectId?: number
  mode: UnlayerEditorMode
  appearance: UnlayerAppearance
  features: EmailStudioFeatures
  mergeTags?: UnlayerMergeTags
}

export interface UnlayerWhiteLabelConfig {
  enabled: boolean
  removeBranding: boolean
  customLogo?: string
  customColors?: {
    primary?: string
    secondary?: string
    accent?: string
  }
  customFonts?: Array<{
    name: string
    url: string
  }>
  hideUnlayerBranding: boolean
}

export interface UnlayerProjectSettings {
  projectId: number
  projectName?: string
  allowedDomains: string[]
  whiteLabelEnabled: boolean
  customFeatures: {
    aiAssistant: boolean
    stockImages: boolean
    userUploads: boolean
    customBlocks: boolean
    customTools: boolean
  }
}

export interface EmailStudioExportOptions {
  minify: boolean
  cleanup: boolean
  inlineCss: boolean
}

export interface EmailStudioSavePayload {
  design: UnlayerDesignJSON
  html: string
  metadata: {
    name: string
    subject?: string
    preheader?: string
  }
  exportOptions?: Partial<EmailStudioExportOptions>
}

export interface EmailTemplateListItem {
  id: string
  name: string
  description?: string
  thumbnail?: string
  category?: string
  tags?: string[]
  status: 'draft' | 'published' | 'archived'
  createdAt: Date
  updatedAt: Date
}

export interface EmailStudioState {
  isLoading: boolean
  isReady: boolean
  isSaving: boolean
  hasUnsavedChanges: boolean
  currentTemplateId: string | null
  error: string | null
}
