import { z } from "zod";
export declare const DocumentAssetRoleSchema: z.ZodEnum<{
  logo: "logo";
  image: "image";
  signature: "signature";
  font: "font";
  qr: "qr";
  attachment: "attachment";
}>;
type DocumentAssetRole = z.infer<typeof DocumentAssetRoleSchema>;
export declare const AssetRoleSchema: z.ZodEnum<{
  logo: "logo";
  image: "image";
  signature: "signature";
  font: "font";
  qr: "qr";
  attachment: "attachment";
}>;
export declare const DocumentAssetUrlClassificationSchema: z.ZodEnum<{
  render_safe_public: "render_safe_public";
  signed_render_url: "signed_render_url";
  browser_blob: "browser_blob";
  data_url: "data_url";
  private_app_session: "private_app_session";
  non_https_url: "non_https_url";
  unsafe_scheme: "unsafe_scheme";
  invalid_url: "invalid_url";
}>;
type DocumentAssetUrlClassification = z.infer<typeof DocumentAssetUrlClassificationSchema>;
interface DocumentAssetUrlClassificationResult {
  readonly url: string;
  readonly classification: DocumentAssetUrlClassification;
  readonly safeForProductionRender: boolean;
  readonly reason: string;
  readonly redactedUrl?: string;
}
export declare const DocumentAssetAlignmentSchema: z.ZodEnum<{
  left: "left";
  center: "center";
  right: "right";
  full_width: "full_width";
}>;
type DocumentAssetAlignment = z.infer<typeof DocumentAssetAlignmentSchema>;
export declare const DocumentAssetSourceMetadataSchema: z.ZodObject<{
  provider: z.ZodOptional<z.ZodString>;
  sourceId: z.ZodOptional<z.ZodString>;
  version: z.ZodOptional<z.ZodString>;
  checksum: z.ZodOptional<z.ZodString>;
  uploadedBy: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
type DocumentAssetSourceMetadata = z.infer<typeof DocumentAssetSourceMetadataSchema>;
export declare const DocumentAssetReferenceSchema: z.ZodObject<{
  id: z.ZodString;
  role: z.ZodEnum<{
    logo: "logo";
    image: "image";
    signature: "signature";
    font: "font";
    qr: "qr";
    attachment: "attachment";
  }>;
  assetId: z.ZodOptional<z.ZodString>;
  url: z.ZodOptional<z.ZodString>;
  renderSafeUrl: z.ZodOptional<z.ZodString>;
  mimeType: z.ZodOptional<z.ZodString>;
  altText: z.ZodOptional<z.ZodString>;
  width: z.ZodOptional<z.ZodNumber>;
  height: z.ZodOptional<z.ZodNumber>;
  alignment: z.ZodDefault<z.ZodEnum<{
    left: "left";
    center: "center";
    right: "right";
    full_width: "full_width";
  }>>;
  linkUrl: z.ZodOptional<z.ZodString>;
  renderSafe: z.ZodDefault<z.ZodBoolean>;
  required: z.ZodDefault<z.ZodBoolean>;
  tenantId: z.ZodOptional<z.ZodString>;
  source: z.ZodOptional<z.ZodObject<{
    provider: z.ZodOptional<z.ZodString>;
    sourceId: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodString>;
    checksum: z.ZodOptional<z.ZodString>;
    uploadedBy: z.ZodOptional<z.ZodString>;
  }, z.core.$strict>>;
}, z.core.$strict>;
type DocumentAssetReference = z.infer<typeof DocumentAssetReferenceSchema>;
type DocumentAssetReferenceInput = z.input<typeof DocumentAssetReferenceSchema>;
export declare const AssetReferenceSchema: z.ZodObject<{
  id: z.ZodString;
  role: z.ZodEnum<{
    logo: "logo";
    image: "image";
    signature: "signature";
    font: "font";
    qr: "qr";
    attachment: "attachment";
  }>;
  assetId: z.ZodOptional<z.ZodString>;
  url: z.ZodOptional<z.ZodString>;
  renderSafeUrl: z.ZodOptional<z.ZodString>;
  mimeType: z.ZodOptional<z.ZodString>;
  altText: z.ZodOptional<z.ZodString>;
  width: z.ZodOptional<z.ZodNumber>;
  height: z.ZodOptional<z.ZodNumber>;
  alignment: z.ZodDefault<z.ZodEnum<{
    left: "left";
    center: "center";
    right: "right";
    full_width: "full_width";
  }>>;
  linkUrl: z.ZodOptional<z.ZodString>;
  renderSafe: z.ZodDefault<z.ZodBoolean>;
  required: z.ZodDefault<z.ZodBoolean>;
  tenantId: z.ZodOptional<z.ZodString>;
  source: z.ZodOptional<z.ZodObject<{
    provider: z.ZodOptional<z.ZodString>;
    sourceId: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodString>;
    checksum: z.ZodOptional<z.ZodString>;
    uploadedBy: z.ZodOptional<z.ZodString>;
  }, z.core.$strict>>;
}, z.core.$strict>;
type AssetReference = DocumentAssetReference;
export declare const DocumentAssetImageAttributesSchema: z.ZodObject<{
  asset: z.ZodOptional<z.ZodObject<{
    id: z.ZodString;
    role: z.ZodEnum<{
      logo: "logo";
      image: "image";
      signature: "signature";
      font: "font";
      qr: "qr";
      attachment: "attachment";
    }>;
    assetId: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    renderSafeUrl: z.ZodOptional<z.ZodString>;
    mimeType: z.ZodOptional<z.ZodString>;
    altText: z.ZodOptional<z.ZodString>;
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
    alignment: z.ZodDefault<z.ZodEnum<{
      left: "left";
      center: "center";
      right: "right";
      full_width: "full_width";
    }>>;
    linkUrl: z.ZodOptional<z.ZodString>;
    renderSafe: z.ZodDefault<z.ZodBoolean>;
    required: z.ZodDefault<z.ZodBoolean>;
    tenantId: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodObject<{
      provider: z.ZodOptional<z.ZodString>;
      sourceId: z.ZodOptional<z.ZodString>;
      version: z.ZodOptional<z.ZodString>;
      checksum: z.ZodOptional<z.ZodString>;
      uploadedBy: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
  }, z.core.$strict>>;
  assetId: z.ZodOptional<z.ZodString>;
  id: z.ZodOptional<z.ZodString>;
  role: z.ZodDefault<z.ZodEnum<{
    logo: "logo";
    image: "image";
    signature: "signature";
    font: "font";
    qr: "qr";
    attachment: "attachment";
  }>>;
  url: z.ZodOptional<z.ZodString>;
  renderSafeUrl: z.ZodOptional<z.ZodString>;
  mimeType: z.ZodOptional<z.ZodString>;
  altText: z.ZodOptional<z.ZodString>;
  width: z.ZodOptional<z.ZodNumber>;
  height: z.ZodOptional<z.ZodNumber>;
  alignment: z.ZodDefault<z.ZodEnum<{
    left: "left";
    center: "center";
    right: "right";
    full_width: "full_width";
  }>>;
  linkUrl: z.ZodOptional<z.ZodString>;
  renderSafe: z.ZodDefault<z.ZodBoolean>;
  required: z.ZodDefault<z.ZodBoolean>;
  tenantId: z.ZodOptional<z.ZodString>;
  source: z.ZodOptional<z.ZodObject<{
    provider: z.ZodOptional<z.ZodString>;
    sourceId: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodString>;
    checksum: z.ZodOptional<z.ZodString>;
    uploadedBy: z.ZodOptional<z.ZodString>;
  }, z.core.$strict>>;
}, z.core.$strict>;
type DocumentAssetImageAttributes = z.infer<typeof DocumentAssetImageAttributesSchema>;
type DocumentAssetImageAttributesInput = z.input<typeof DocumentAssetImageAttributesSchema>;
export declare const DocumentAssetImageNodeSchema: z.ZodObject<{
  type: z.ZodLiteral<"assetImage">;
  attrs: z.ZodObject<{
    asset: z.ZodOptional<z.ZodObject<{
      id: z.ZodString;
      role: z.ZodEnum<{
        logo: "logo";
        image: "image";
        signature: "signature";
        font: "font";
        qr: "qr";
        attachment: "attachment";
      }>;
      assetId: z.ZodOptional<z.ZodString>;
      url: z.ZodOptional<z.ZodString>;
      renderSafeUrl: z.ZodOptional<z.ZodString>;
      mimeType: z.ZodOptional<z.ZodString>;
      altText: z.ZodOptional<z.ZodString>;
      width: z.ZodOptional<z.ZodNumber>;
      height: z.ZodOptional<z.ZodNumber>;
      alignment: z.ZodDefault<z.ZodEnum<{
        left: "left";
        center: "center";
        right: "right";
        full_width: "full_width";
      }>>;
      linkUrl: z.ZodOptional<z.ZodString>;
      renderSafe: z.ZodDefault<z.ZodBoolean>;
      required: z.ZodDefault<z.ZodBoolean>;
      tenantId: z.ZodOptional<z.ZodString>;
      source: z.ZodOptional<z.ZodObject<{
        provider: z.ZodOptional<z.ZodString>;
        sourceId: z.ZodOptional<z.ZodString>;
        version: z.ZodOptional<z.ZodString>;
        checksum: z.ZodOptional<z.ZodString>;
        uploadedBy: z.ZodOptional<z.ZodString>;
      }, z.core.$strict>>;
    }, z.core.$strict>>;
    assetId: z.ZodOptional<z.ZodString>;
    id: z.ZodOptional<z.ZodString>;
    role: z.ZodDefault<z.ZodEnum<{
      logo: "logo";
      image: "image";
      signature: "signature";
      font: "font";
      qr: "qr";
      attachment: "attachment";
    }>>;
    url: z.ZodOptional<z.ZodString>;
    renderSafeUrl: z.ZodOptional<z.ZodString>;
    mimeType: z.ZodOptional<z.ZodString>;
    altText: z.ZodOptional<z.ZodString>;
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
    alignment: z.ZodDefault<z.ZodEnum<{
      left: "left";
      center: "center";
      right: "right";
      full_width: "full_width";
    }>>;
    linkUrl: z.ZodOptional<z.ZodString>;
    renderSafe: z.ZodDefault<z.ZodBoolean>;
    required: z.ZodDefault<z.ZodBoolean>;
    tenantId: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodObject<{
      provider: z.ZodOptional<z.ZodString>;
      sourceId: z.ZodOptional<z.ZodString>;
      version: z.ZodOptional<z.ZodString>;
      checksum: z.ZodOptional<z.ZodString>;
      uploadedBy: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
  }, z.core.$strict>;
}, z.core.$strict>;
type DocumentAssetImageNode = z.infer<typeof DocumentAssetImageNodeSchema>;
type DocumentAssetImageNodeInput = z.input<typeof DocumentAssetImageNodeSchema>;
interface DocumentAssetLookupRequest {
  readonly assetId?: string;
  readonly referenceId?: string;
  readonly role?: DocumentAssetRole;
  readonly tenantId?: string;
  readonly source?: DocumentAssetSourceMetadata;
}
type DocumentAssetLookupResult = DocumentAssetReferenceInput | undefined;
interface DocumentAssetLookupAdapter {
  readonly resolveAsset: (request: DocumentAssetLookupRequest) => DocumentAssetLookupResult | Promise<DocumentAssetLookupResult>;
}
interface DocumentRenderSafeUrlRequest {
  readonly asset: DocumentAssetReferenceInput;
  readonly purpose: 'browser_preview' | 'production_render';
  readonly expiresInSeconds?: number;
}
interface DocumentRenderSafeUrlResult {
  readonly url: string;
  readonly renderSafe: true;
  readonly expiresAt?: string;
}
interface DocumentRenderSafeUrlAdapter {
  readonly resolveRenderSafeUrl: (request: DocumentRenderSafeUrlRequest) => DocumentRenderSafeUrlResult | undefined | Promise<DocumentRenderSafeUrlResult | undefined>;
}
export declare function classifyDocumentAssetUrl(url: string): DocumentAssetUrlClassificationResult;
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | readonly JsonValue[] | {
  readonly [key: string]: JsonValue;
};
export declare const TemplateCategorySchema: z.ZodEnum<{
  custom: "custom";
  donation_receipt: "donation_receipt";
  tax_receipt: "tax_receipt";
  annual_giving_statement: "annual_giving_statement";
  donor_letter: "donor_letter";
  missionary_report: "missionary_report";
  financial_report: "financial_report";
  invoice: "invoice";
  certificate: "certificate";
}>;
type TemplateCategory = z.infer<typeof TemplateCategorySchema>;
export declare const DocumentBrandSourceSchema: z.ZodEnum<{
  system_default: "system_default";
  tenant_default: "tenant_default";
  template_override: "template_override";
}>;
type DocumentBrandSource = z.infer<typeof DocumentBrandSourceSchema>;
export declare const DocumentBrandFieldSchema: z.ZodEnum<{
  organization_name: "organization_name";
  logo_asset: "logo_asset";
  primary_color: "primary_color";
  accent_color: "accent_color";
  text_color: "text_color";
  background_color: "background_color";
  heading_font: "heading_font";
  body_font: "body_font";
  fallback_fonts: "fallback_fonts";
  footer_text: "footer_text";
  receipt_defaults: "receipt_defaults";
}>;
type DocumentBrandField = z.infer<typeof DocumentBrandFieldSchema>;
export declare const DocumentBrandingMetadataSchema: z.ZodDefault<z.ZodObject<{
  source: z.ZodDefault<z.ZodEnum<{
    system_default: "system_default";
    tenant_default: "tenant_default";
    template_override: "template_override";
  }>>;
  tenantBrandId: z.ZodOptional<z.ZodString>;
  overriddenFields: z.ZodDefault<z.ZodArray<z.ZodEnum<{
    organization_name: "organization_name";
    logo_asset: "logo_asset";
    primary_color: "primary_color";
    accent_color: "accent_color";
    text_color: "text_color";
    background_color: "background_color";
    heading_font: "heading_font";
    body_font: "body_font";
    fallback_fonts: "fallback_fonts";
    footer_text: "footer_text";
    receipt_defaults: "receipt_defaults";
  }>>>;
}, z.core.$strict>>;
type DocumentBrandingMetadata = z.infer<typeof DocumentBrandingMetadataSchema>;
export declare const DocumentThemeColorSchema: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
export declare const DocumentThemeColorsSchema: z.ZodDefault<z.ZodObject<{
  primary: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
  accent: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
  text: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
  background: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
}, z.core.$strict>>;
type DocumentThemeColors = z.infer<typeof DocumentThemeColorsSchema>;
export declare const DocumentThemeFontFamilySchema: z.ZodString;
export declare const DocumentThemeFontsSchema: z.ZodDefault<z.ZodObject<{
  body: z.ZodDefault<z.ZodString>;
  heading: z.ZodDefault<z.ZodString>;
  fallback: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strict>>;
type DocumentThemeFonts = z.infer<typeof DocumentThemeFontsSchema>;
export declare const DocumentThemeOrganizationSchema: z.ZodDefault<z.ZodObject<{
  name: z.ZodOptional<z.ZodString>;
  legalName: z.ZodOptional<z.ZodString>;
  websiteUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strict>>;
type DocumentThemeOrganization = z.infer<typeof DocumentThemeOrganizationSchema>;
export declare const DocumentReceiptDefaultsSchema: z.ZodDefault<z.ZodObject<{
  thankYouMessage: z.ZodOptional<z.ZodString>;
  taxLanguage: z.ZodOptional<z.ZodString>;
  goodsServicesStatement: z.ZodOptional<z.ZodString>;
}, z.core.$strict>>;
type DocumentReceiptDefaults = z.infer<typeof DocumentReceiptDefaultsSchema>;
export declare const DocumentThemeSchema: z.ZodDefault<z.ZodObject<{
  name: z.ZodDefault<z.ZodString>;
  branding: z.ZodDefault<z.ZodObject<{
    source: z.ZodDefault<z.ZodEnum<{
      system_default: "system_default";
      tenant_default: "tenant_default";
      template_override: "template_override";
    }>>;
    tenantBrandId: z.ZodOptional<z.ZodString>;
    overriddenFields: z.ZodDefault<z.ZodArray<z.ZodEnum<{
      organization_name: "organization_name";
      logo_asset: "logo_asset";
      primary_color: "primary_color";
      accent_color: "accent_color";
      text_color: "text_color";
      background_color: "background_color";
      heading_font: "heading_font";
      body_font: "body_font";
      fallback_fonts: "fallback_fonts";
      footer_text: "footer_text";
      receipt_defaults: "receipt_defaults";
    }>>>;
  }, z.core.$strict>>;
  organization: z.ZodDefault<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    legalName: z.ZodOptional<z.ZodString>;
    websiteUrl: z.ZodOptional<z.ZodString>;
  }, z.core.$strict>>;
  colors: z.ZodDefault<z.ZodObject<{
    primary: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
    accent: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
    text: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
    background: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
  }, z.core.$strict>>;
  fonts: z.ZodDefault<z.ZodObject<{
    body: z.ZodDefault<z.ZodString>;
    heading: z.ZodDefault<z.ZodString>;
    fallback: z.ZodDefault<z.ZodArray<z.ZodString>>;
  }, z.core.$strict>>;
  logoAsset: z.ZodOptional<z.ZodObject<{
    id: z.ZodString;
    role: z.ZodEnum<{
      logo: "logo";
      image: "image";
      signature: "signature";
      font: "font";
      qr: "qr";
      attachment: "attachment";
    }>;
    assetId: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    renderSafeUrl: z.ZodOptional<z.ZodString>;
    mimeType: z.ZodOptional<z.ZodString>;
    altText: z.ZodOptional<z.ZodString>;
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
    alignment: z.ZodDefault<z.ZodEnum<{
      left: "left";
      center: "center";
      right: "right";
      full_width: "full_width";
    }>>;
    linkUrl: z.ZodOptional<z.ZodString>;
    renderSafe: z.ZodDefault<z.ZodBoolean>;
    required: z.ZodDefault<z.ZodBoolean>;
    tenantId: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodObject<{
      provider: z.ZodOptional<z.ZodString>;
      sourceId: z.ZodOptional<z.ZodString>;
      version: z.ZodOptional<z.ZodString>;
      checksum: z.ZodOptional<z.ZodString>;
      uploadedBy: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
  }, z.core.$strict>>;
  logoAssetId: z.ZodOptional<z.ZodString>;
  footerText: z.ZodOptional<z.ZodString>;
  receiptDefaults: z.ZodDefault<z.ZodObject<{
    thankYouMessage: z.ZodOptional<z.ZodString>;
    taxLanguage: z.ZodOptional<z.ZodString>;
    goodsServicesStatement: z.ZodOptional<z.ZodString>;
  }, z.core.$strict>>;
}, z.core.$strict>>;
type DocumentTheme = z.infer<typeof DocumentThemeSchema>;
type DocumentThemeInput = z.input<typeof DocumentThemeSchema>;
interface ResolveDocumentThemeInput {
  readonly systemDefaults?: DocumentThemeInput;
  readonly tenantDefaults?: DocumentThemeInput;
  readonly templateOverrides?: DocumentThemeInput;
}
export declare function resolveDocumentTheme(input?: ResolveDocumentThemeInput): DocumentTheme;
interface DocumentThemeDefaultsRequest {
  readonly tenantId?: string;
  readonly templateId?: string;
  readonly category?: string;
}
interface DocumentThemeDefaultsAdapter {
  readonly resolveThemeDefaults: (request: DocumentThemeDefaultsRequest) => DocumentThemeInput | undefined | Promise<DocumentThemeInput | undefined>;
}
export declare const DocumentEngineSchema: z.ZodEnum<{
  asym_pdf_document_builder: "asym_pdf_document_builder";
  unlayer: "unlayer";
}>;
export declare const PageSizeSchema: z.ZodEnum<{
  custom: "custom";
  letter: "letter";
  a4: "a4";
  legal: "legal";
}>;
export declare const PageOrientationSchema: z.ZodEnum<{
  portrait: "portrait";
  landscape: "landscape";
}>;
export declare const PageUnitSchema: z.ZodEnum<{
  in: "in";
  cm: "cm";
  mm: "mm";
  pt: "pt";
  px: "px";
}>;
export declare const PageMarginsSchema: z.ZodDefault<z.ZodObject<{
  top: z.ZodDefault<z.ZodString>;
  right: z.ZodDefault<z.ZodString>;
  bottom: z.ZodDefault<z.ZodString>;
  left: z.ZodDefault<z.ZodString>;
}, z.core.$strict>>;
export declare const CustomPageSizeSchema: z.ZodObject<{
  width: z.ZodNumber;
  height: z.ZodNumber;
  unit: z.ZodDefault<z.ZodEnum<{
    in: "in";
    cm: "cm";
    mm: "mm";
    pt: "pt";
    px: "px";
  }>>;
}, z.core.$strict>;
export declare const DocumentPageSettingsSchema: z.ZodDefault<z.ZodObject<{
  pageSize: z.ZodDefault<z.ZodEnum<{
    custom: "custom";
    letter: "letter";
    a4: "a4";
    legal: "legal";
  }>>;
  orientation: z.ZodDefault<z.ZodEnum<{
    portrait: "portrait";
    landscape: "landscape";
  }>>;
  margins: z.ZodDefault<z.ZodObject<{
    top: z.ZodDefault<z.ZodString>;
    right: z.ZodDefault<z.ZodString>;
    bottom: z.ZodDefault<z.ZodString>;
    left: z.ZodDefault<z.ZodString>;
  }, z.core.$strict>>;
  customSize: z.ZodOptional<z.ZodObject<{
    width: z.ZodNumber;
    height: z.ZodNumber;
    unit: z.ZodDefault<z.ZodEnum<{
      in: "in";
      cm: "cm";
      mm: "mm";
      pt: "pt";
      px: "px";
    }>>;
  }, z.core.$strict>>;
  headerFooter: z.ZodDefault<z.ZodObject<{
    regions: z.ZodDefault<z.ZodArray<z.ZodObject<{
      id: z.ZodOptional<z.ZodString>;
      placement: z.ZodEnum<{
        header: "header";
        footer: "footer";
      }>;
      scope: z.ZodEnum<{
        first_page: "first_page";
        repeating: "repeating";
      }>;
      enabled: z.ZodDefault<z.ZodBoolean>;
      alignment: z.ZodDefault<z.ZodEnum<{
        left: "left";
        center: "center";
        right: "right";
      }>>;
      minimumMargin: z.ZodDefault<z.ZodString>;
      content: z.ZodDefault<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"text">;
        text: z.ZodString;
      }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"document_title">;
      }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"organization_footer">;
        fallbackText: z.ZodOptional<z.ZodString>;
      }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"page_number">;
      }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"total_pages">;
      }, z.core.$strict>], "kind">>>;
    }, z.core.$strict>>>;
  }, z.core.$strict>>;
}, z.core.$strict>>;
type DocumentPageSettings = z.infer<typeof DocumentPageSettingsSchema>;
type DocumentPageSettingsInput = z.input<typeof DocumentPageSettingsSchema>;
declare const DocumentMarkSchema: z.ZodType<{
  readonly type: string;
  readonly attrs?: Record<string, unknown>;
}>;
type DocumentContentNode = {
  readonly type: string;
  readonly attrs?: Record<string, unknown>;
  readonly text?: string;
  readonly marks?: readonly z.infer<typeof DocumentMarkSchema>[];
  readonly content?: readonly DocumentContentNode[];
};
export declare const DocumentContentNodeSchema: z.ZodType<DocumentContentNode>;
export declare const DocumentContentSchema: z.ZodObject<{
  type: z.ZodLiteral<"doc">;
  content: z.ZodDefault<z.ZodArray<z.ZodType<DocumentContentNode, unknown, z.core.$ZodTypeInternals<DocumentContentNode, unknown>>>>;
}, z.core.$strict>;
type DocumentContent = z.infer<typeof DocumentContentSchema>;
export declare const DocumentTemplateV1Schema: z.ZodObject<{
  version: z.ZodLiteral<1>;
  id: z.ZodString;
  name: z.ZodString;
  category: z.ZodEnum<{
    custom: "custom";
    donation_receipt: "donation_receipt";
    tax_receipt: "tax_receipt";
    annual_giving_statement: "annual_giving_statement";
    donor_letter: "donor_letter";
    missionary_report: "missionary_report";
    financial_report: "financial_report";
    invoice: "invoice";
    certificate: "certificate";
  }>;
  engine: z.ZodDefault<z.ZodEnum<{
    asym_pdf_document_builder: "asym_pdf_document_builder";
    unlayer: "unlayer";
  }>>;
  status: z.ZodDefault<z.ZodEnum<{
    draft: "draft";
    published: "published";
    archived: "archived";
  }>>;
  pageSettings: z.ZodDefault<z.ZodObject<{
    pageSize: z.ZodDefault<z.ZodEnum<{
      custom: "custom";
      letter: "letter";
      a4: "a4";
      legal: "legal";
    }>>;
    orientation: z.ZodDefault<z.ZodEnum<{
      portrait: "portrait";
      landscape: "landscape";
    }>>;
    margins: z.ZodDefault<z.ZodObject<{
      top: z.ZodDefault<z.ZodString>;
      right: z.ZodDefault<z.ZodString>;
      bottom: z.ZodDefault<z.ZodString>;
      left: z.ZodDefault<z.ZodString>;
    }, z.core.$strict>>;
    customSize: z.ZodOptional<z.ZodObject<{
      width: z.ZodNumber;
      height: z.ZodNumber;
      unit: z.ZodDefault<z.ZodEnum<{
        in: "in";
        cm: "cm";
        mm: "mm";
        pt: "pt";
        px: "px";
      }>>;
    }, z.core.$strict>>;
    headerFooter: z.ZodDefault<z.ZodObject<{
      regions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        placement: z.ZodEnum<{
          header: "header";
          footer: "footer";
        }>;
        scope: z.ZodEnum<{
          first_page: "first_page";
          repeating: "repeating";
        }>;
        enabled: z.ZodDefault<z.ZodBoolean>;
        alignment: z.ZodDefault<z.ZodEnum<{
          left: "left";
          center: "center";
          right: "right";
        }>>;
        minimumMargin: z.ZodDefault<z.ZodString>;
        content: z.ZodDefault<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
          kind: z.ZodLiteral<"text">;
          text: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
          kind: z.ZodLiteral<"document_title">;
        }, z.core.$strict>, z.ZodObject<{
          kind: z.ZodLiteral<"organization_footer">;
          fallbackText: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
          kind: z.ZodLiteral<"page_number">;
        }, z.core.$strict>, z.ZodObject<{
          kind: z.ZodLiteral<"total_pages">;
        }, z.core.$strict>], "kind">>>;
      }, z.core.$strict>>>;
    }, z.core.$strict>>;
  }, z.core.$strict>>;
  theme: z.ZodDefault<z.ZodObject<{
    name: z.ZodDefault<z.ZodString>;
    branding: z.ZodDefault<z.ZodObject<{
      source: z.ZodDefault<z.ZodEnum<{
        system_default: "system_default";
        tenant_default: "tenant_default";
        template_override: "template_override";
      }>>;
      tenantBrandId: z.ZodOptional<z.ZodString>;
      overriddenFields: z.ZodDefault<z.ZodArray<z.ZodEnum<{
        organization_name: "organization_name";
        logo_asset: "logo_asset";
        primary_color: "primary_color";
        accent_color: "accent_color";
        text_color: "text_color";
        background_color: "background_color";
        heading_font: "heading_font";
        body_font: "body_font";
        fallback_fonts: "fallback_fonts";
        footer_text: "footer_text";
        receipt_defaults: "receipt_defaults";
      }>>>;
    }, z.core.$strict>>;
    organization: z.ZodDefault<z.ZodObject<{
      name: z.ZodOptional<z.ZodString>;
      legalName: z.ZodOptional<z.ZodString>;
      websiteUrl: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    colors: z.ZodDefault<z.ZodObject<{
      primary: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
      accent: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
      text: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
      background: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
    }, z.core.$strict>>;
    fonts: z.ZodDefault<z.ZodObject<{
      body: z.ZodDefault<z.ZodString>;
      heading: z.ZodDefault<z.ZodString>;
      fallback: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>>;
    logoAsset: z.ZodOptional<z.ZodObject<{
      id: z.ZodString;
      role: z.ZodEnum<{
        logo: "logo";
        image: "image";
        signature: "signature";
        font: "font";
        qr: "qr";
        attachment: "attachment";
      }>;
      assetId: z.ZodOptional<z.ZodString>;
      url: z.ZodOptional<z.ZodString>;
      renderSafeUrl: z.ZodOptional<z.ZodString>;
      mimeType: z.ZodOptional<z.ZodString>;
      altText: z.ZodOptional<z.ZodString>;
      width: z.ZodOptional<z.ZodNumber>;
      height: z.ZodOptional<z.ZodNumber>;
      alignment: z.ZodDefault<z.ZodEnum<{
        left: "left";
        center: "center";
        right: "right";
        full_width: "full_width";
      }>>;
      linkUrl: z.ZodOptional<z.ZodString>;
      renderSafe: z.ZodDefault<z.ZodBoolean>;
      required: z.ZodDefault<z.ZodBoolean>;
      tenantId: z.ZodOptional<z.ZodString>;
      source: z.ZodOptional<z.ZodObject<{
        provider: z.ZodOptional<z.ZodString>;
        sourceId: z.ZodOptional<z.ZodString>;
        version: z.ZodOptional<z.ZodString>;
        checksum: z.ZodOptional<z.ZodString>;
        uploadedBy: z.ZodOptional<z.ZodString>;
      }, z.core.$strict>>;
    }, z.core.$strict>>;
    logoAssetId: z.ZodOptional<z.ZodString>;
    footerText: z.ZodOptional<z.ZodString>;
    receiptDefaults: z.ZodDefault<z.ZodObject<{
      thankYouMessage: z.ZodOptional<z.ZodString>;
      taxLanguage: z.ZodOptional<z.ZodString>;
      goodsServicesStatement: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
  }, z.core.$strict>>;
  pdfSettings: z.ZodDefault<z.ZodObject<{
    metadata: z.ZodDefault<z.ZodObject<{
      title: z.ZodOptional<z.ZodString>;
      subject: z.ZodOptional<z.ZodString>;
      author: z.ZodOptional<z.ZodString>;
      organization: z.ZodOptional<z.ZodString>;
      language: z.ZodDefault<z.ZodString>;
      keywords: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>>;
    profile: z.ZodDefault<z.ZodObject<{
      profile: z.ZodOptional<z.ZodEnum<{
        "PDF/A-1a": "PDF/A-1a";
        "PDF/A-1a+PDF/UA-1": "PDF/A-1a+PDF/UA-1";
        "PDF/A-1b": "PDF/A-1b";
        "PDF/A-2a": "PDF/A-2a";
        "PDF/A-2a+PDF/UA-1": "PDF/A-2a+PDF/UA-1";
        "PDF/A-2b": "PDF/A-2b";
        "PDF/A-3a": "PDF/A-3a";
        "PDF/A-3a+PDF/UA-1": "PDF/A-3a+PDF/UA-1";
        "PDF/A-3b": "PDF/A-3b";
        "PDF/UA-1": "PDF/UA-1";
      }>>;
    }, z.core.$strict>>;
  }, z.core.$strict>>;
  content: z.ZodObject<{
    type: z.ZodLiteral<"doc">;
    content: z.ZodDefault<z.ZodArray<z.ZodType<DocumentContentNode, unknown, z.core.$ZodTypeInternals<DocumentContentNode, unknown>>>>;
  }, z.core.$strict>;
  variables: z.ZodDefault<z.ZodArray<z.ZodObject<{
    key: z.ZodString;
    label: z.ZodString;
    group: z.ZodEnum<{
      custom: "custom";
      asset: "asset";
      tax_receipt: "tax_receipt";
      financial_report: "financial_report";
      invoice: "invoice";
      organization: "organization";
      recipient: "recipient";
      donation: "donation";
      document: "document";
      missionary: "missionary";
      statement: "statement";
      computed: "computed";
    }>;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<{
      string: "string";
      number: "number";
      boolean: "boolean";
      date: "date";
      id: "id";
      url: "url";
      rich_text: "rich_text";
      currency: "currency";
      percentage: "percentage";
      address: "address";
      image_url: "image_url";
    }>;
    sampleValue: z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>;
    required: z.ZodDefault<z.ZodBoolean>;
    fallback: z.ZodDefault<z.ZodDiscriminatedUnion<[z.ZodObject<{
      mode: z.ZodLiteral<"none">;
    }, z.core.$strip>, z.ZodObject<{
      mode: z.ZodLiteral<"use_value">;
      value: z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>;
    }, z.core.$strip>, z.ZodObject<{
      mode: z.ZodLiteral<"omit">;
    }, z.core.$strip>], "mode">>;
    formatter: z.ZodOptional<z.ZodString>;
    privacy: z.ZodDefault<z.ZodEnum<{
      public: "public";
      internal: "internal";
      pii: "pii";
      financial: "financial";
      sensitive: "sensitive";
    }>>;
    sourcePath: z.ZodOptional<z.ZodString>;
  }, z.core.$strict>>>;
  dataBindings: z.ZodDefault<z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    variableKey: z.ZodString;
    sourcePath: z.ZodString;
    required: z.ZodDefault<z.ZodBoolean>;
  }, z.core.$strict>>>;
  conditionalRules: z.ZodDefault<z.ZodArray<z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    fieldPath: z.ZodString;
    operator: z.ZodEnum<{
      in: "in";
      exists: "exists";
      not_exists: "not_exists";
      equals: "equals";
      not_equals: "not_equals";
      greater_than: "greater_than";
      greater_than_or_equal: "greater_than_or_equal";
      less_than: "less_than";
      less_than_or_equal: "less_than_or_equal";
      contains: "contains";
      not_contains: "not_contains";
      is_empty: "is_empty";
      is_not_empty: "is_not_empty";
      not_in: "not_in";
    }>;
    value: z.ZodOptional<z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>;
  }, z.core.$strict>>>;
  repeaterBindings: z.ZodDefault<z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    sourcePath: z.ZodString;
    itemAlias: z.ZodString;
    indexAlias: z.ZodOptional<z.ZodString>;
    emptyState: z.ZodOptional<z.ZodString>;
    filters: z.ZodDefault<z.ZodArray<z.ZodObject<{
      id: z.ZodOptional<z.ZodString>;
      fieldPath: z.ZodString;
      operator: z.ZodEnum<{
        in: "in";
        exists: "exists";
        not_exists: "not_exists";
        equals: "equals";
        not_equals: "not_equals";
        greater_than: "greater_than";
        greater_than_or_equal: "greater_than_or_equal";
        less_than: "less_than";
        less_than_or_equal: "less_than_or_equal";
        contains: "contains";
        not_contains: "not_contains";
        is_empty: "is_empty";
        is_not_empty: "is_not_empty";
        not_in: "not_in";
      }>;
      value: z.ZodOptional<z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>;
    }, z.core.$strict>>>;
    maxItems: z.ZodDefault<z.ZodNumber>;
    sort: z.ZodOptional<z.ZodObject<{
      fieldPath: z.ZodString;
      direction: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
      }>>;
    }, z.core.$strict>>;
  }, z.core.$strict>>>;
  tableBindings: z.ZodDefault<z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    sourcePath: z.ZodString;
    columns: z.ZodArray<z.ZodObject<{
      key: z.ZodString;
      label: z.ZodString;
      sourcePath: z.ZodString;
      type: z.ZodDefault<z.ZodEnum<{
        string: "string";
        number: "number";
        boolean: "boolean";
        date: "date";
        id: "id";
        url: "url";
        rich_text: "rich_text";
        currency: "currency";
        percentage: "percentage";
        address: "address";
        image_url: "image_url";
      }>>;
      formatter: z.ZodOptional<z.ZodString>;
      width: z.ZodOptional<z.ZodString>;
      align: z.ZodDefault<z.ZodEnum<{
        left: "left";
        center: "center";
        right: "right";
      }>>;
    }, z.core.$strict>>;
    emptyState: z.ZodOptional<z.ZodString>;
    grouping: z.ZodOptional<z.ZodObject<{
      fieldPath: z.ZodString;
      label: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    repeatHeader: z.ZodDefault<z.ZodBoolean>;
    avoidRowSplit: z.ZodDefault<z.ZodBoolean>;
    maxRows: z.ZodDefault<z.ZodNumber>;
    totals: z.ZodDefault<z.ZodArray<z.ZodObject<{
      columnKey: z.ZodString;
      operation: z.ZodEnum<{
        sum: "sum";
        count: "count";
      }>;
      label: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>>;
  }, z.core.$strict>>>;
  summaryBlockBindings: z.ZodDefault<z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    formatter: z.ZodDefault<z.ZodString>;
    precision: z.ZodOptional<z.ZodObject<{
      scale: z.ZodOptional<z.ZodNumber>;
      roundingMode: z.ZodOptional<z.ZodLiteral<"half_away_from_zero">>;
    }, z.core.$strict>>;
    calculation: z.ZodDiscriminatedUnion<[z.ZodObject<{
      type: z.ZodLiteral<"total_contributions">;
      sourcePath: z.ZodString;
      amountPath: z.ZodString;
      label: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
      type: z.ZodLiteral<"table_total">;
      tableBindingId: z.ZodString;
      columnKey: z.ZodString;
      operation: z.ZodOptional<z.ZodEnum<{
        sum: "sum";
        count: "count";
      }>>;
      label: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
      type: z.ZodLiteral<"invoice_totals">;
      lineItemsPath: z.ZodString;
      amountPath: z.ZodOptional<z.ZodString>;
      quantityPath: z.ZodOptional<z.ZodString>;
      ratePath: z.ZodOptional<z.ZodString>;
      discountPath: z.ZodOptional<z.ZodString>;
      taxPath: z.ZodOptional<z.ZodString>;
      fields: z.ZodDefault<z.ZodArray<z.ZodEnum<{
        subtotal: "subtotal";
        discounts: "discounts";
        taxes: "taxes";
        total: "total";
      }>>>;
      labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strict>, z.ZodObject<{
      type: z.ZodLiteral<"financial_report_totals">;
      sourcePath: z.ZodString;
      amountPath: z.ZodString;
      categoryPath: z.ZodString;
      incomeCategories: z.ZodArray<z.ZodString>;
      expenseCategories: z.ZodArray<z.ZodString>;
      fields: z.ZodDefault<z.ZodArray<z.ZodEnum<{
        income: "income";
        expense: "expense";
        net: "net";
      }>>>;
      labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strict>, z.ZodObject<{
      type: z.ZodLiteral<"grouped_subtotals">;
      sourcePath: z.ZodString;
      groupPath: z.ZodString;
      valuePath: z.ZodString;
      includeGrandTotal: z.ZodDefault<z.ZodBoolean>;
      labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
      grandTotalLabel: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
      type: z.ZodLiteral<"grand_total">;
      sourcePath: z.ZodString;
      groupPath: z.ZodString;
      valuePath: z.ZodString;
      label: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>], "type">;
  }, z.core.$strict>>>;
  placeholderBindings: z.ZodDefault<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
    id: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
    required: z.ZodDefault<z.ZodBoolean>;
    adapterKey: z.ZodOptional<z.ZodString>;
    dataPath: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    kind: z.ZodLiteral<"text_field">;
    placeholderText: z.ZodOptional<z.ZodString>;
    maxLength: z.ZodOptional<z.ZodNumber>;
    multiline: z.ZodDefault<z.ZodBoolean>;
  }, z.core.$strict>, z.ZodObject<{
    id: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
    required: z.ZodDefault<z.ZodBoolean>;
    adapterKey: z.ZodOptional<z.ZodString>;
    dataPath: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    kind: z.ZodLiteral<"checkbox">;
    checkedByDefault: z.ZodDefault<z.ZodBoolean>;
  }, z.core.$strict>, z.ZodObject<{
    id: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
    required: z.ZodDefault<z.ZodBoolean>;
    adapterKey: z.ZodOptional<z.ZodString>;
    dataPath: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    kind: z.ZodLiteral<"signature">;
    signerRole: z.ZodOptional<z.ZodEnum<{
      custom: "custom";
      organization: "organization";
      recipient: "recipient";
      witness: "witness";
      staff: "staff";
    }>>;
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
  }, z.core.$strict>, z.ZodObject<{
    id: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
    required: z.ZodDefault<z.ZodBoolean>;
    adapterKey: z.ZodOptional<z.ZodString>;
    dataPath: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    kind: z.ZodLiteral<"initials">;
    signerRole: z.ZodOptional<z.ZodEnum<{
      custom: "custom";
      organization: "organization";
      recipient: "recipient";
      witness: "witness";
      staff: "staff";
    }>>;
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
  }, z.core.$strict>, z.ZodObject<{
    id: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
    required: z.ZodDefault<z.ZodBoolean>;
    adapterKey: z.ZodOptional<z.ZodString>;
    dataPath: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    kind: z.ZodLiteral<"qr">;
    payload: z.ZodDiscriminatedUnion<[z.ZodObject<{
      type: z.ZodLiteral<"url">;
      value: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
      type: z.ZodLiteral<"text">;
      value: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
      type: z.ZodLiteral<"variable">;
      key: z.ZodString;
    }, z.core.$strict>], "type">;
    size: z.ZodOptional<z.ZodNumber>;
    errorCorrectionLevel: z.ZodOptional<z.ZodEnum<{
      low: "low";
      medium: "medium";
      quartile: "quartile";
      high: "high";
    }>>;
  }, z.core.$strict>, z.ZodObject<{
    id: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
    required: z.ZodDefault<z.ZodBoolean>;
    adapterKey: z.ZodOptional<z.ZodString>;
    dataPath: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    kind: z.ZodLiteral<"date">;
    dateFormat: z.ZodOptional<z.ZodString>;
  }, z.core.$strict>], "kind">>>;
  assets: z.ZodDefault<z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    role: z.ZodEnum<{
      logo: "logo";
      image: "image";
      signature: "signature";
      font: "font";
      qr: "qr";
      attachment: "attachment";
    }>;
    assetId: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    renderSafeUrl: z.ZodOptional<z.ZodString>;
    mimeType: z.ZodOptional<z.ZodString>;
    altText: z.ZodOptional<z.ZodString>;
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
    alignment: z.ZodDefault<z.ZodEnum<{
      left: "left";
      center: "center";
      right: "right";
      full_width: "full_width";
    }>>;
    linkUrl: z.ZodOptional<z.ZodString>;
    renderSafe: z.ZodDefault<z.ZodBoolean>;
    required: z.ZodDefault<z.ZodBoolean>;
    tenantId: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodObject<{
      provider: z.ZodOptional<z.ZodString>;
      sourceId: z.ZodOptional<z.ZodString>;
      version: z.ZodOptional<z.ZodString>;
      checksum: z.ZodOptional<z.ZodString>;
      uploadedBy: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
  }, z.core.$strict>>>;
  metadata: z.ZodDefault<z.ZodObject<{
    description: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
  }, z.core.$strict>>;
}, z.core.$strict>;
type DocumentTemplateV1 = z.infer<typeof DocumentTemplateV1Schema>;
type DocumentTemplateV1Input = z.input<typeof DocumentTemplateV1Schema>;
export declare const RenderModeSchema: z.ZodEnum<{
  preview: "preview";
  production: "production";
  batch: "batch";
}>;
export declare const RendererSchema: z.ZodEnum<{
  local: "local";
  docraptor: "docraptor";
  browser: "browser";
}>;
export declare const RenderWarningSchema: z.ZodObject<{
  code: z.ZodString;
  message: z.ZodString;
  severity: z.ZodDefault<z.ZodEnum<{
    warning: "warning";
    info: "info";
  }>>;
  nodeId: z.ZodOptional<z.ZodString>;
  path: z.ZodDefault<z.ZodArray<z.ZodString>>;
  details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
}, z.core.$strict>;
type RenderWarning = z.infer<typeof RenderWarningSchema>;
export declare const RenderErrorSchema: z.ZodObject<{
  code: z.ZodString;
  message: z.ZodString;
  retryable: z.ZodDefault<z.ZodBoolean>;
  nodeId: z.ZodOptional<z.ZodString>;
  path: z.ZodDefault<z.ZodArray<z.ZodString>>;
  details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
}, z.core.$strict>;
type RenderError = z.infer<typeof RenderErrorSchema>;
export declare const DocumentArtifactLocationSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
  type: z.ZodLiteral<"storage">;
  storageKey: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
  type: z.ZodLiteral<"url">;
  url: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
  type: z.ZodLiteral<"adapter_reference">;
  reference: z.ZodString;
}, z.core.$strict>], "type">;
type DocumentArtifactLocation = z.infer<typeof DocumentArtifactLocationSchema>;
export declare const DocumentArtifactSchema: z.ZodObject<{
  id: z.ZodString;
  kind: z.ZodEnum<{
    preview: "preview";
    pdf: "pdf";
    html: "html";
    manifest: "manifest";
  }>;
  mimeType: z.ZodString;
  sizeBytes: z.ZodNumber;
  location: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"storage">;
    storageKey: z.ZodString;
  }, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"url">;
    url: z.ZodString;
  }, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"adapter_reference">;
    reference: z.ZodString;
  }, z.core.$strict>], "type">>;
  storageKey: z.ZodOptional<z.ZodString>;
  url: z.ZodOptional<z.ZodString>;
  hash: z.ZodOptional<z.ZodString>;
  createdAt: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
type DocumentArtifact = z.infer<typeof DocumentArtifactSchema>;
export declare const RenderRequestSchema: z.ZodObject<{
  version: z.ZodLiteral<1>;
  id: z.ZodString;
  template: z.ZodObject<{
    version: z.ZodLiteral<1>;
    id: z.ZodString;
    name: z.ZodString;
    category: z.ZodEnum<{
      custom: "custom";
      donation_receipt: "donation_receipt";
      tax_receipt: "tax_receipt";
      annual_giving_statement: "annual_giving_statement";
      donor_letter: "donor_letter";
      missionary_report: "missionary_report";
      financial_report: "financial_report";
      invoice: "invoice";
      certificate: "certificate";
    }>;
    engine: z.ZodDefault<z.ZodEnum<{
      asym_pdf_document_builder: "asym_pdf_document_builder";
      unlayer: "unlayer";
    }>>;
    status: z.ZodDefault<z.ZodEnum<{
      draft: "draft";
      published: "published";
      archived: "archived";
    }>>;
    pageSettings: z.ZodDefault<z.ZodObject<{
      pageSize: z.ZodDefault<z.ZodEnum<{
        custom: "custom";
        letter: "letter";
        a4: "a4";
        legal: "legal";
      }>>;
      orientation: z.ZodDefault<z.ZodEnum<{
        portrait: "portrait";
        landscape: "landscape";
      }>>;
      margins: z.ZodDefault<z.ZodObject<{
        top: z.ZodDefault<z.ZodString>;
        right: z.ZodDefault<z.ZodString>;
        bottom: z.ZodDefault<z.ZodString>;
        left: z.ZodDefault<z.ZodString>;
      }, z.core.$strict>>;
      customSize: z.ZodOptional<z.ZodObject<{
        width: z.ZodNumber;
        height: z.ZodNumber;
        unit: z.ZodDefault<z.ZodEnum<{
          in: "in";
          cm: "cm";
          mm: "mm";
          pt: "pt";
          px: "px";
        }>>;
      }, z.core.$strict>>;
      headerFooter: z.ZodDefault<z.ZodObject<{
        regions: z.ZodDefault<z.ZodArray<z.ZodObject<{
          id: z.ZodOptional<z.ZodString>;
          placement: z.ZodEnum<{
            header: "header";
            footer: "footer";
          }>;
          scope: z.ZodEnum<{
            first_page: "first_page";
            repeating: "repeating";
          }>;
          enabled: z.ZodDefault<z.ZodBoolean>;
          alignment: z.ZodDefault<z.ZodEnum<{
            left: "left";
            center: "center";
            right: "right";
          }>>;
          minimumMargin: z.ZodDefault<z.ZodString>;
          content: z.ZodDefault<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"text">;
            text: z.ZodString;
          }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"document_title">;
          }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"organization_footer">;
            fallbackText: z.ZodOptional<z.ZodString>;
          }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"page_number">;
          }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"total_pages">;
          }, z.core.$strict>], "kind">>>;
        }, z.core.$strict>>>;
      }, z.core.$strict>>;
    }, z.core.$strict>>;
    theme: z.ZodDefault<z.ZodObject<{
      name: z.ZodDefault<z.ZodString>;
      branding: z.ZodDefault<z.ZodObject<{
        source: z.ZodDefault<z.ZodEnum<{
          system_default: "system_default";
          tenant_default: "tenant_default";
          template_override: "template_override";
        }>>;
        tenantBrandId: z.ZodOptional<z.ZodString>;
        overriddenFields: z.ZodDefault<z.ZodArray<z.ZodEnum<{
          organization_name: "organization_name";
          logo_asset: "logo_asset";
          primary_color: "primary_color";
          accent_color: "accent_color";
          text_color: "text_color";
          background_color: "background_color";
          heading_font: "heading_font";
          body_font: "body_font";
          fallback_fonts: "fallback_fonts";
          footer_text: "footer_text";
          receipt_defaults: "receipt_defaults";
        }>>>;
      }, z.core.$strict>>;
      organization: z.ZodDefault<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        legalName: z.ZodOptional<z.ZodString>;
        websiteUrl: z.ZodOptional<z.ZodString>;
      }, z.core.$strict>>;
      colors: z.ZodDefault<z.ZodObject<{
        primary: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
        accent: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
        text: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
        background: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
      }, z.core.$strict>>;
      fonts: z.ZodDefault<z.ZodObject<{
        body: z.ZodDefault<z.ZodString>;
        heading: z.ZodDefault<z.ZodString>;
        fallback: z.ZodDefault<z.ZodArray<z.ZodString>>;
      }, z.core.$strict>>;
      logoAsset: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        role: z.ZodEnum<{
          logo: "logo";
          image: "image";
          signature: "signature";
          font: "font";
          qr: "qr";
          attachment: "attachment";
        }>;
        assetId: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodString>;
        renderSafeUrl: z.ZodOptional<z.ZodString>;
        mimeType: z.ZodOptional<z.ZodString>;
        altText: z.ZodOptional<z.ZodString>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
        alignment: z.ZodDefault<z.ZodEnum<{
          left: "left";
          center: "center";
          right: "right";
          full_width: "full_width";
        }>>;
        linkUrl: z.ZodOptional<z.ZodString>;
        renderSafe: z.ZodDefault<z.ZodBoolean>;
        required: z.ZodDefault<z.ZodBoolean>;
        tenantId: z.ZodOptional<z.ZodString>;
        source: z.ZodOptional<z.ZodObject<{
          provider: z.ZodOptional<z.ZodString>;
          sourceId: z.ZodOptional<z.ZodString>;
          version: z.ZodOptional<z.ZodString>;
          checksum: z.ZodOptional<z.ZodString>;
          uploadedBy: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
      }, z.core.$strict>>;
      logoAssetId: z.ZodOptional<z.ZodString>;
      footerText: z.ZodOptional<z.ZodString>;
      receiptDefaults: z.ZodDefault<z.ZodObject<{
        thankYouMessage: z.ZodOptional<z.ZodString>;
        taxLanguage: z.ZodOptional<z.ZodString>;
        goodsServicesStatement: z.ZodOptional<z.ZodString>;
      }, z.core.$strict>>;
    }, z.core.$strict>>;
    pdfSettings: z.ZodDefault<z.ZodObject<{
      metadata: z.ZodDefault<z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        subject: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodString>;
        organization: z.ZodOptional<z.ZodString>;
        language: z.ZodDefault<z.ZodString>;
        keywords: z.ZodDefault<z.ZodArray<z.ZodString>>;
      }, z.core.$strict>>;
      profile: z.ZodDefault<z.ZodObject<{
        profile: z.ZodOptional<z.ZodEnum<{
          "PDF/A-1a": "PDF/A-1a";
          "PDF/A-1a+PDF/UA-1": "PDF/A-1a+PDF/UA-1";
          "PDF/A-1b": "PDF/A-1b";
          "PDF/A-2a": "PDF/A-2a";
          "PDF/A-2a+PDF/UA-1": "PDF/A-2a+PDF/UA-1";
          "PDF/A-2b": "PDF/A-2b";
          "PDF/A-3a": "PDF/A-3a";
          "PDF/A-3a+PDF/UA-1": "PDF/A-3a+PDF/UA-1";
          "PDF/A-3b": "PDF/A-3b";
          "PDF/UA-1": "PDF/UA-1";
        }>>;
      }, z.core.$strict>>;
    }, z.core.$strict>>;
    content: z.ZodObject<{
      type: z.ZodLiteral<"doc">;
      content: z.ZodDefault<z.ZodArray<z.ZodType<DocumentContentNode, unknown, z.core.$ZodTypeInternals<DocumentContentNode, unknown>>>>;
    }, z.core.$strict>;
    variables: z.ZodDefault<z.ZodArray<z.ZodObject<{
      key: z.ZodString;
      label: z.ZodString;
      group: z.ZodEnum<{
        custom: "custom";
        asset: "asset";
        tax_receipt: "tax_receipt";
        financial_report: "financial_report";
        invoice: "invoice";
        organization: "organization";
        recipient: "recipient";
        donation: "donation";
        document: "document";
        missionary: "missionary";
        statement: "statement";
        computed: "computed";
      }>;
      description: z.ZodOptional<z.ZodString>;
      type: z.ZodEnum<{
        string: "string";
        number: "number";
        boolean: "boolean";
        date: "date";
        id: "id";
        url: "url";
        rich_text: "rich_text";
        currency: "currency";
        percentage: "percentage";
        address: "address";
        image_url: "image_url";
      }>;
      sampleValue: z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>;
      required: z.ZodDefault<z.ZodBoolean>;
      fallback: z.ZodDefault<z.ZodDiscriminatedUnion<[z.ZodObject<{
        mode: z.ZodLiteral<"none">;
      }, z.core.$strip>, z.ZodObject<{
        mode: z.ZodLiteral<"use_value">;
        value: z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>;
      }, z.core.$strip>, z.ZodObject<{
        mode: z.ZodLiteral<"omit">;
      }, z.core.$strip>], "mode">>;
      formatter: z.ZodOptional<z.ZodString>;
      privacy: z.ZodDefault<z.ZodEnum<{
        public: "public";
        internal: "internal";
        pii: "pii";
        financial: "financial";
        sensitive: "sensitive";
      }>>;
      sourcePath: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>>;
    dataBindings: z.ZodDefault<z.ZodArray<z.ZodObject<{
      id: z.ZodString;
      variableKey: z.ZodString;
      sourcePath: z.ZodString;
      required: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>>>;
    conditionalRules: z.ZodDefault<z.ZodArray<z.ZodObject<{
      id: z.ZodOptional<z.ZodString>;
      fieldPath: z.ZodString;
      operator: z.ZodEnum<{
        in: "in";
        exists: "exists";
        not_exists: "not_exists";
        equals: "equals";
        not_equals: "not_equals";
        greater_than: "greater_than";
        greater_than_or_equal: "greater_than_or_equal";
        less_than: "less_than";
        less_than_or_equal: "less_than_or_equal";
        contains: "contains";
        not_contains: "not_contains";
        is_empty: "is_empty";
        is_not_empty: "is_not_empty";
        not_in: "not_in";
      }>;
      value: z.ZodOptional<z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>;
    }, z.core.$strict>>>;
    repeaterBindings: z.ZodDefault<z.ZodArray<z.ZodObject<{
      id: z.ZodString;
      sourcePath: z.ZodString;
      itemAlias: z.ZodString;
      indexAlias: z.ZodOptional<z.ZodString>;
      emptyState: z.ZodOptional<z.ZodString>;
      filters: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        fieldPath: z.ZodString;
        operator: z.ZodEnum<{
          in: "in";
          exists: "exists";
          not_exists: "not_exists";
          equals: "equals";
          not_equals: "not_equals";
          greater_than: "greater_than";
          greater_than_or_equal: "greater_than_or_equal";
          less_than: "less_than";
          less_than_or_equal: "less_than_or_equal";
          contains: "contains";
          not_contains: "not_contains";
          is_empty: "is_empty";
          is_not_empty: "is_not_empty";
          not_in: "not_in";
        }>;
        value: z.ZodOptional<z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>;
      }, z.core.$strict>>>;
      maxItems: z.ZodDefault<z.ZodNumber>;
      sort: z.ZodOptional<z.ZodObject<{
        fieldPath: z.ZodString;
        direction: z.ZodDefault<z.ZodEnum<{
          asc: "asc";
          desc: "desc";
        }>>;
      }, z.core.$strict>>;
    }, z.core.$strict>>>;
    tableBindings: z.ZodDefault<z.ZodArray<z.ZodObject<{
      id: z.ZodString;
      sourcePath: z.ZodString;
      columns: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        label: z.ZodString;
        sourcePath: z.ZodString;
        type: z.ZodDefault<z.ZodEnum<{
          string: "string";
          number: "number";
          boolean: "boolean";
          date: "date";
          id: "id";
          url: "url";
          rich_text: "rich_text";
          currency: "currency";
          percentage: "percentage";
          address: "address";
          image_url: "image_url";
        }>>;
        formatter: z.ZodOptional<z.ZodString>;
        width: z.ZodOptional<z.ZodString>;
        align: z.ZodDefault<z.ZodEnum<{
          left: "left";
          center: "center";
          right: "right";
        }>>;
      }, z.core.$strict>>;
      emptyState: z.ZodOptional<z.ZodString>;
      grouping: z.ZodOptional<z.ZodObject<{
        fieldPath: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
      }, z.core.$strict>>;
      repeatHeader: z.ZodDefault<z.ZodBoolean>;
      avoidRowSplit: z.ZodDefault<z.ZodBoolean>;
      maxRows: z.ZodDefault<z.ZodNumber>;
      totals: z.ZodDefault<z.ZodArray<z.ZodObject<{
        columnKey: z.ZodString;
        operation: z.ZodEnum<{
          sum: "sum";
          count: "count";
        }>;
        label: z.ZodOptional<z.ZodString>;
      }, z.core.$strict>>>;
    }, z.core.$strict>>>;
    summaryBlockBindings: z.ZodDefault<z.ZodArray<z.ZodObject<{
      id: z.ZodString;
      title: z.ZodOptional<z.ZodString>;
      formatter: z.ZodDefault<z.ZodString>;
      precision: z.ZodOptional<z.ZodObject<{
        scale: z.ZodOptional<z.ZodNumber>;
        roundingMode: z.ZodOptional<z.ZodLiteral<"half_away_from_zero">>;
      }, z.core.$strict>>;
      calculation: z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"total_contributions">;
        sourcePath: z.ZodString;
        amountPath: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
      }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"table_total">;
        tableBindingId: z.ZodString;
        columnKey: z.ZodString;
        operation: z.ZodOptional<z.ZodEnum<{
          sum: "sum";
          count: "count";
        }>>;
        label: z.ZodOptional<z.ZodString>;
      }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"invoice_totals">;
        lineItemsPath: z.ZodString;
        amountPath: z.ZodOptional<z.ZodString>;
        quantityPath: z.ZodOptional<z.ZodString>;
        ratePath: z.ZodOptional<z.ZodString>;
        discountPath: z.ZodOptional<z.ZodString>;
        taxPath: z.ZodOptional<z.ZodString>;
        fields: z.ZodDefault<z.ZodArray<z.ZodEnum<{
          subtotal: "subtotal";
          discounts: "discounts";
          taxes: "taxes";
          total: "total";
        }>>>;
        labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
      }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"financial_report_totals">;
        sourcePath: z.ZodString;
        amountPath: z.ZodString;
        categoryPath: z.ZodString;
        incomeCategories: z.ZodArray<z.ZodString>;
        expenseCategories: z.ZodArray<z.ZodString>;
        fields: z.ZodDefault<z.ZodArray<z.ZodEnum<{
          income: "income";
          expense: "expense";
          net: "net";
        }>>>;
        labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
      }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"grouped_subtotals">;
        sourcePath: z.ZodString;
        groupPath: z.ZodString;
        valuePath: z.ZodString;
        includeGrandTotal: z.ZodDefault<z.ZodBoolean>;
        labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        grandTotalLabel: z.ZodOptional<z.ZodString>;
      }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"grand_total">;
        sourcePath: z.ZodString;
        groupPath: z.ZodString;
        valuePath: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
      }, z.core.$strict>], "type">;
    }, z.core.$strict>>>;
    placeholderBindings: z.ZodDefault<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
      id: z.ZodString;
      label: z.ZodOptional<z.ZodString>;
      required: z.ZodDefault<z.ZodBoolean>;
      adapterKey: z.ZodOptional<z.ZodString>;
      dataPath: z.ZodOptional<z.ZodString>;
      description: z.ZodOptional<z.ZodString>;
      kind: z.ZodLiteral<"text_field">;
      placeholderText: z.ZodOptional<z.ZodString>;
      maxLength: z.ZodOptional<z.ZodNumber>;
      multiline: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>, z.ZodObject<{
      id: z.ZodString;
      label: z.ZodOptional<z.ZodString>;
      required: z.ZodDefault<z.ZodBoolean>;
      adapterKey: z.ZodOptional<z.ZodString>;
      dataPath: z.ZodOptional<z.ZodString>;
      description: z.ZodOptional<z.ZodString>;
      kind: z.ZodLiteral<"checkbox">;
      checkedByDefault: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>, z.ZodObject<{
      id: z.ZodString;
      label: z.ZodOptional<z.ZodString>;
      required: z.ZodDefault<z.ZodBoolean>;
      adapterKey: z.ZodOptional<z.ZodString>;
      dataPath: z.ZodOptional<z.ZodString>;
      description: z.ZodOptional<z.ZodString>;
      kind: z.ZodLiteral<"signature">;
      signerRole: z.ZodOptional<z.ZodEnum<{
        custom: "custom";
        organization: "organization";
        recipient: "recipient";
        witness: "witness";
        staff: "staff";
      }>>;
      width: z.ZodOptional<z.ZodNumber>;
      height: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>, z.ZodObject<{
      id: z.ZodString;
      label: z.ZodOptional<z.ZodString>;
      required: z.ZodDefault<z.ZodBoolean>;
      adapterKey: z.ZodOptional<z.ZodString>;
      dataPath: z.ZodOptional<z.ZodString>;
      description: z.ZodOptional<z.ZodString>;
      kind: z.ZodLiteral<"initials">;
      signerRole: z.ZodOptional<z.ZodEnum<{
        custom: "custom";
        organization: "organization";
        recipient: "recipient";
        witness: "witness";
        staff: "staff";
      }>>;
      width: z.ZodOptional<z.ZodNumber>;
      height: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>, z.ZodObject<{
      id: z.ZodString;
      label: z.ZodOptional<z.ZodString>;
      required: z.ZodDefault<z.ZodBoolean>;
      adapterKey: z.ZodOptional<z.ZodString>;
      dataPath: z.ZodOptional<z.ZodString>;
      description: z.ZodOptional<z.ZodString>;
      kind: z.ZodLiteral<"qr">;
      payload: z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"url">;
        value: z.ZodString;
      }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"text">;
        value: z.ZodString;
      }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"variable">;
        key: z.ZodString;
      }, z.core.$strict>], "type">;
      size: z.ZodOptional<z.ZodNumber>;
      errorCorrectionLevel: z.ZodOptional<z.ZodEnum<{
        low: "low";
        medium: "medium";
        quartile: "quartile";
        high: "high";
      }>>;
    }, z.core.$strict>, z.ZodObject<{
      id: z.ZodString;
      label: z.ZodOptional<z.ZodString>;
      required: z.ZodDefault<z.ZodBoolean>;
      adapterKey: z.ZodOptional<z.ZodString>;
      dataPath: z.ZodOptional<z.ZodString>;
      description: z.ZodOptional<z.ZodString>;
      kind: z.ZodLiteral<"date">;
      dateFormat: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>], "kind">>>;
    assets: z.ZodDefault<z.ZodArray<z.ZodObject<{
      id: z.ZodString;
      role: z.ZodEnum<{
        logo: "logo";
        image: "image";
        signature: "signature";
        font: "font";
        qr: "qr";
        attachment: "attachment";
      }>;
      assetId: z.ZodOptional<z.ZodString>;
      url: z.ZodOptional<z.ZodString>;
      renderSafeUrl: z.ZodOptional<z.ZodString>;
      mimeType: z.ZodOptional<z.ZodString>;
      altText: z.ZodOptional<z.ZodString>;
      width: z.ZodOptional<z.ZodNumber>;
      height: z.ZodOptional<z.ZodNumber>;
      alignment: z.ZodDefault<z.ZodEnum<{
        left: "left";
        center: "center";
        right: "right";
        full_width: "full_width";
      }>>;
      linkUrl: z.ZodOptional<z.ZodString>;
      renderSafe: z.ZodDefault<z.ZodBoolean>;
      required: z.ZodDefault<z.ZodBoolean>;
      tenantId: z.ZodOptional<z.ZodString>;
      source: z.ZodOptional<z.ZodObject<{
        provider: z.ZodOptional<z.ZodString>;
        sourceId: z.ZodOptional<z.ZodString>;
        version: z.ZodOptional<z.ZodString>;
        checksum: z.ZodOptional<z.ZodString>;
        uploadedBy: z.ZodOptional<z.ZodString>;
      }, z.core.$strict>>;
    }, z.core.$strict>>>;
    metadata: z.ZodDefault<z.ZodObject<{
      description: z.ZodOptional<z.ZodString>;
      tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
      createdAt: z.ZodOptional<z.ZodString>;
      updatedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
  }, z.core.$strict>;
  data: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  mode: z.ZodEnum<{
    preview: "preview";
    production: "production";
    batch: "batch";
  }>;
  renderer: z.ZodDefault<z.ZodEnum<{
    local: "local";
    docraptor: "docraptor";
    browser: "browser";
  }>>;
  pdfSettings: z.ZodOptional<z.ZodDefault<z.ZodObject<{
    metadata: z.ZodDefault<z.ZodObject<{
      title: z.ZodOptional<z.ZodString>;
      subject: z.ZodOptional<z.ZodString>;
      author: z.ZodOptional<z.ZodString>;
      organization: z.ZodOptional<z.ZodString>;
      language: z.ZodDefault<z.ZodString>;
      keywords: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>>;
    profile: z.ZodDefault<z.ZodObject<{
      profile: z.ZodOptional<z.ZodEnum<{
        "PDF/A-1a": "PDF/A-1a";
        "PDF/A-1a+PDF/UA-1": "PDF/A-1a+PDF/UA-1";
        "PDF/A-1b": "PDF/A-1b";
        "PDF/A-2a": "PDF/A-2a";
        "PDF/A-2a+PDF/UA-1": "PDF/A-2a+PDF/UA-1";
        "PDF/A-2b": "PDF/A-2b";
        "PDF/A-3a": "PDF/A-3a";
        "PDF/A-3a+PDF/UA-1": "PDF/A-3a+PDF/UA-1";
        "PDF/A-3b": "PDF/A-3b";
        "PDF/UA-1": "PDF/UA-1";
      }>>;
    }, z.core.$strict>>;
  }, z.core.$strict>>>;
  requestedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
type RenderRequest = z.infer<typeof RenderRequestSchema>;
export declare const RenderResultSchema: z.ZodObject<{
  status: z.ZodEnum<{
    error: "error";
    success: "success";
    warning: "warning";
  }>;
  renderer: z.ZodEnum<{
    local: "local";
    docraptor: "docraptor";
    browser: "browser";
  }>;
  artifact: z.ZodOptional<z.ZodObject<{
    id: z.ZodString;
    kind: z.ZodEnum<{
      preview: "preview";
      pdf: "pdf";
      html: "html";
      manifest: "manifest";
    }>;
    mimeType: z.ZodString;
    sizeBytes: z.ZodNumber;
    location: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
      type: z.ZodLiteral<"storage">;
      storageKey: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
      type: z.ZodLiteral<"url">;
      url: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
      type: z.ZodLiteral<"adapter_reference">;
      reference: z.ZodString;
    }, z.core.$strict>], "type">>;
    storageKey: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    hash: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodString>;
  }, z.core.$strict>>;
  warnings: z.ZodDefault<z.ZodArray<z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
    severity: z.ZodDefault<z.ZodEnum<{
      warning: "warning";
      info: "info";
    }>>;
    nodeId: z.ZodOptional<z.ZodString>;
    path: z.ZodDefault<z.ZodArray<z.ZodString>>;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>>>;
  errors: z.ZodDefault<z.ZodArray<z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
    retryable: z.ZodDefault<z.ZodBoolean>;
    nodeId: z.ZodOptional<z.ZodString>;
    path: z.ZodDefault<z.ZodArray<z.ZodString>>;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>>>;
  durationMs: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
type RenderResult = z.infer<typeof RenderResultSchema>;
export declare const RenderTimingSchema: z.ZodDefault<z.ZodObject<{
  queuedAt: z.ZodOptional<z.ZodString>;
  startedAt: z.ZodOptional<z.ZodString>;
  completedAt: z.ZodOptional<z.ZodString>;
  durationMs: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>>;
type RenderTiming = z.infer<typeof RenderTimingSchema>;
export declare const DocRaptorRenderMetadataSchema: z.ZodObject<{
  mode: z.ZodEnum<{
    production: "production";
    test: "test";
  }>;
  media: z.ZodDefault<z.ZodEnum<{
    print: "print";
    screen: "screen";
  }>>;
  requestUrl: z.ZodOptional<z.ZodString>;
  requestMethod: z.ZodOptional<z.ZodEnum<{
    POST: "POST";
    GET: "GET";
  }>>;
  tag: z.ZodOptional<z.ZodString>;
  test: z.ZodBoolean;
  statusId: z.ZodOptional<z.ZodString>;
  statusUrl: z.ZodOptional<z.ZodString>;
  pageCount: z.ZodOptional<z.ZodNumber>;
  validationErrors: z.ZodDefault<z.ZodArray<z.ZodString>>;
  idempotencyKey: z.ZodOptional<z.ZodString>;
  pdfMetadata: z.ZodOptional<z.ZodDefault<z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    subject: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    organization: z.ZodOptional<z.ZodString>;
    language: z.ZodDefault<z.ZodString>;
    keywords: z.ZodDefault<z.ZodArray<z.ZodString>>;
  }, z.core.$strict>>>;
  pdfProfile: z.ZodOptional<z.ZodDefault<z.ZodObject<{
    profile: z.ZodOptional<z.ZodEnum<{
      "PDF/A-1a": "PDF/A-1a";
      "PDF/A-1a+PDF/UA-1": "PDF/A-1a+PDF/UA-1";
      "PDF/A-1b": "PDF/A-1b";
      "PDF/A-2a": "PDF/A-2a";
      "PDF/A-2a+PDF/UA-1": "PDF/A-2a+PDF/UA-1";
      "PDF/A-2b": "PDF/A-2b";
      "PDF/A-3a": "PDF/A-3a";
      "PDF/A-3a+PDF/UA-1": "PDF/A-3a+PDF/UA-1";
      "PDF/A-3b": "PDF/A-3b";
      "PDF/UA-1": "PDF/UA-1";
    }>>;
  }, z.core.$strict>>>;
}, z.core.$strict>;
type DocRaptorRenderMetadata = z.infer<typeof DocRaptorRenderMetadataSchema>;
export declare const DataSnapshotHashSchema: z.ZodString;
type DataSnapshotHash = z.infer<typeof DataSnapshotHashSchema>;
export declare const RenderMetadataV1Schema: z.ZodObject<{
  version: z.ZodLiteral<1>;
  id: z.ZodString;
  renderId: z.ZodString;
  tenantId: z.ZodString;
  actorId: z.ZodOptional<z.ZodString>;
  templateId: z.ZodString;
  templateVersion: z.ZodNumber;
  dataSnapshotHash: z.ZodString;
  mode: z.ZodEnum<{
    preview: "preview";
    production: "production";
    batch: "batch";
  }>;
  renderer: z.ZodEnum<{
    local: "local";
    docraptor: "docraptor";
    browser: "browser";
  }>;
  status: z.ZodEnum<{
    failed: "failed";
    queued: "queued";
    running: "running";
    succeeded: "succeeded";
    canceled: "canceled";
  }>;
  batchId: z.ZodOptional<z.ZodString>;
  pageSettings: z.ZodOptional<z.ZodDefault<z.ZodObject<{
    pageSize: z.ZodDefault<z.ZodEnum<{
      custom: "custom";
      letter: "letter";
      a4: "a4";
      legal: "legal";
    }>>;
    orientation: z.ZodDefault<z.ZodEnum<{
      portrait: "portrait";
      landscape: "landscape";
    }>>;
    margins: z.ZodDefault<z.ZodObject<{
      top: z.ZodDefault<z.ZodString>;
      right: z.ZodDefault<z.ZodString>;
      bottom: z.ZodDefault<z.ZodString>;
      left: z.ZodDefault<z.ZodString>;
    }, z.core.$strict>>;
    customSize: z.ZodOptional<z.ZodObject<{
      width: z.ZodNumber;
      height: z.ZodNumber;
      unit: z.ZodDefault<z.ZodEnum<{
        in: "in";
        cm: "cm";
        mm: "mm";
        pt: "pt";
        px: "px";
      }>>;
    }, z.core.$strict>>;
    headerFooter: z.ZodDefault<z.ZodObject<{
      regions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        placement: z.ZodEnum<{
          header: "header";
          footer: "footer";
        }>;
        scope: z.ZodEnum<{
          first_page: "first_page";
          repeating: "repeating";
        }>;
        enabled: z.ZodDefault<z.ZodBoolean>;
        alignment: z.ZodDefault<z.ZodEnum<{
          left: "left";
          center: "center";
          right: "right";
        }>>;
        minimumMargin: z.ZodDefault<z.ZodString>;
        content: z.ZodDefault<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
          kind: z.ZodLiteral<"text">;
          text: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
          kind: z.ZodLiteral<"document_title">;
        }, z.core.$strict>, z.ZodObject<{
          kind: z.ZodLiteral<"organization_footer">;
          fallbackText: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
          kind: z.ZodLiteral<"page_number">;
        }, z.core.$strict>, z.ZodObject<{
          kind: z.ZodLiteral<"total_pages">;
        }, z.core.$strict>], "kind">>>;
      }, z.core.$strict>>>;
    }, z.core.$strict>>;
  }, z.core.$strict>>>;
  docraptor: z.ZodOptional<z.ZodObject<{
    mode: z.ZodEnum<{
      production: "production";
      test: "test";
    }>;
    media: z.ZodDefault<z.ZodEnum<{
      print: "print";
      screen: "screen";
    }>>;
    requestUrl: z.ZodOptional<z.ZodString>;
    requestMethod: z.ZodOptional<z.ZodEnum<{
      POST: "POST";
      GET: "GET";
    }>>;
    tag: z.ZodOptional<z.ZodString>;
    test: z.ZodBoolean;
    statusId: z.ZodOptional<z.ZodString>;
    statusUrl: z.ZodOptional<z.ZodString>;
    pageCount: z.ZodOptional<z.ZodNumber>;
    validationErrors: z.ZodDefault<z.ZodArray<z.ZodString>>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
    pdfMetadata: z.ZodOptional<z.ZodDefault<z.ZodObject<{
      title: z.ZodOptional<z.ZodString>;
      subject: z.ZodOptional<z.ZodString>;
      author: z.ZodOptional<z.ZodString>;
      organization: z.ZodOptional<z.ZodString>;
      language: z.ZodDefault<z.ZodString>;
      keywords: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>>>;
    pdfProfile: z.ZodOptional<z.ZodDefault<z.ZodObject<{
      profile: z.ZodOptional<z.ZodEnum<{
        "PDF/A-1a": "PDF/A-1a";
        "PDF/A-1a+PDF/UA-1": "PDF/A-1a+PDF/UA-1";
        "PDF/A-1b": "PDF/A-1b";
        "PDF/A-2a": "PDF/A-2a";
        "PDF/A-2a+PDF/UA-1": "PDF/A-2a+PDF/UA-1";
        "PDF/A-2b": "PDF/A-2b";
        "PDF/A-3a": "PDF/A-3a";
        "PDF/A-3a+PDF/UA-1": "PDF/A-3a+PDF/UA-1";
        "PDF/A-3b": "PDF/A-3b";
        "PDF/UA-1": "PDF/UA-1";
      }>>;
    }, z.core.$strict>>>;
  }, z.core.$strict>>;
  timings: z.ZodDefault<z.ZodObject<{
    queuedAt: z.ZodOptional<z.ZodString>;
    startedAt: z.ZodOptional<z.ZodString>;
    completedAt: z.ZodOptional<z.ZodString>;
    durationMs: z.ZodOptional<z.ZodNumber>;
  }, z.core.$strict>>;
  warnings: z.ZodDefault<z.ZodArray<z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
    severity: z.ZodDefault<z.ZodEnum<{
      warning: "warning";
      info: "info";
    }>>;
    nodeId: z.ZodOptional<z.ZodString>;
    path: z.ZodDefault<z.ZodArray<z.ZodString>>;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>>>;
  errors: z.ZodDefault<z.ZodArray<z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
    retryable: z.ZodDefault<z.ZodBoolean>;
    nodeId: z.ZodOptional<z.ZodString>;
    path: z.ZodDefault<z.ZodArray<z.ZodString>>;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>>>;
  artifacts: z.ZodDefault<z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    kind: z.ZodEnum<{
      preview: "preview";
      pdf: "pdf";
      html: "html";
      manifest: "manifest";
    }>;
    mimeType: z.ZodString;
    sizeBytes: z.ZodNumber;
    location: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
      type: z.ZodLiteral<"storage">;
      storageKey: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
      type: z.ZodLiteral<"url">;
      url: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
      type: z.ZodLiteral<"adapter_reference">;
      reference: z.ZodString;
    }, z.core.$strict>], "type">>;
    storageKey: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    hash: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodString>;
  }, z.core.$strict>>>;
  createdAt: z.ZodOptional<z.ZodString>;
  updatedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
type RenderMetadataV1 = z.infer<typeof RenderMetadataV1Schema>;
export declare const RenderJobV1Schema: z.ZodObject<{
  version: z.ZodLiteral<1>;
  id: z.ZodString;
  tenantId: z.ZodOptional<z.ZodString>;
  actorId: z.ZodOptional<z.ZodString>;
  templateId: z.ZodString;
  templateVersion: z.ZodNumber;
  status: z.ZodEnum<{
    failed: "failed";
    queued: "queued";
    running: "running";
    succeeded: "succeeded";
    canceled: "canceled";
  }>;
  mode: z.ZodEnum<{
    preview: "preview";
    production: "production";
    batch: "batch";
  }>;
  renderer: z.ZodDefault<z.ZodEnum<{
    local: "local";
    docraptor: "docraptor";
    browser: "browser";
  }>>;
  dataSnapshotHash: z.ZodString;
  batchId: z.ZodOptional<z.ZodString>;
  pageSettings: z.ZodOptional<z.ZodDefault<z.ZodObject<{
    pageSize: z.ZodDefault<z.ZodEnum<{
      custom: "custom";
      letter: "letter";
      a4: "a4";
      legal: "legal";
    }>>;
    orientation: z.ZodDefault<z.ZodEnum<{
      portrait: "portrait";
      landscape: "landscape";
    }>>;
    margins: z.ZodDefault<z.ZodObject<{
      top: z.ZodDefault<z.ZodString>;
      right: z.ZodDefault<z.ZodString>;
      bottom: z.ZodDefault<z.ZodString>;
      left: z.ZodDefault<z.ZodString>;
    }, z.core.$strict>>;
    customSize: z.ZodOptional<z.ZodObject<{
      width: z.ZodNumber;
      height: z.ZodNumber;
      unit: z.ZodDefault<z.ZodEnum<{
        in: "in";
        cm: "cm";
        mm: "mm";
        pt: "pt";
        px: "px";
      }>>;
    }, z.core.$strict>>;
    headerFooter: z.ZodDefault<z.ZodObject<{
      regions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        placement: z.ZodEnum<{
          header: "header";
          footer: "footer";
        }>;
        scope: z.ZodEnum<{
          first_page: "first_page";
          repeating: "repeating";
        }>;
        enabled: z.ZodDefault<z.ZodBoolean>;
        alignment: z.ZodDefault<z.ZodEnum<{
          left: "left";
          center: "center";
          right: "right";
        }>>;
        minimumMargin: z.ZodDefault<z.ZodString>;
        content: z.ZodDefault<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
          kind: z.ZodLiteral<"text">;
          text: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
          kind: z.ZodLiteral<"document_title">;
        }, z.core.$strict>, z.ZodObject<{
          kind: z.ZodLiteral<"organization_footer">;
          fallbackText: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
          kind: z.ZodLiteral<"page_number">;
        }, z.core.$strict>, z.ZodObject<{
          kind: z.ZodLiteral<"total_pages">;
        }, z.core.$strict>], "kind">>>;
      }, z.core.$strict>>>;
    }, z.core.$strict>>;
  }, z.core.$strict>>>;
  docraptor: z.ZodOptional<z.ZodObject<{
    mode: z.ZodEnum<{
      production: "production";
      test: "test";
    }>;
    media: z.ZodDefault<z.ZodEnum<{
      print: "print";
      screen: "screen";
    }>>;
    requestUrl: z.ZodOptional<z.ZodString>;
    requestMethod: z.ZodOptional<z.ZodEnum<{
      POST: "POST";
      GET: "GET";
    }>>;
    tag: z.ZodOptional<z.ZodString>;
    test: z.ZodBoolean;
    statusId: z.ZodOptional<z.ZodString>;
    statusUrl: z.ZodOptional<z.ZodString>;
    pageCount: z.ZodOptional<z.ZodNumber>;
    validationErrors: z.ZodDefault<z.ZodArray<z.ZodString>>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
    pdfMetadata: z.ZodOptional<z.ZodDefault<z.ZodObject<{
      title: z.ZodOptional<z.ZodString>;
      subject: z.ZodOptional<z.ZodString>;
      author: z.ZodOptional<z.ZodString>;
      organization: z.ZodOptional<z.ZodString>;
      language: z.ZodDefault<z.ZodString>;
      keywords: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>>>;
    pdfProfile: z.ZodOptional<z.ZodDefault<z.ZodObject<{
      profile: z.ZodOptional<z.ZodEnum<{
        "PDF/A-1a": "PDF/A-1a";
        "PDF/A-1a+PDF/UA-1": "PDF/A-1a+PDF/UA-1";
        "PDF/A-1b": "PDF/A-1b";
        "PDF/A-2a": "PDF/A-2a";
        "PDF/A-2a+PDF/UA-1": "PDF/A-2a+PDF/UA-1";
        "PDF/A-2b": "PDF/A-2b";
        "PDF/A-3a": "PDF/A-3a";
        "PDF/A-3a+PDF/UA-1": "PDF/A-3a+PDF/UA-1";
        "PDF/A-3b": "PDF/A-3b";
        "PDF/UA-1": "PDF/UA-1";
      }>>;
    }, z.core.$strict>>>;
  }, z.core.$strict>>;
  timings: z.ZodDefault<z.ZodObject<{
    queuedAt: z.ZodOptional<z.ZodString>;
    startedAt: z.ZodOptional<z.ZodString>;
    completedAt: z.ZodOptional<z.ZodString>;
    durationMs: z.ZodOptional<z.ZodNumber>;
  }, z.core.$strict>>;
  warnings: z.ZodDefault<z.ZodArray<z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
    severity: z.ZodDefault<z.ZodEnum<{
      warning: "warning";
      info: "info";
    }>>;
    nodeId: z.ZodOptional<z.ZodString>;
    path: z.ZodDefault<z.ZodArray<z.ZodString>>;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>>>;
  errors: z.ZodDefault<z.ZodArray<z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
    retryable: z.ZodDefault<z.ZodBoolean>;
    nodeId: z.ZodOptional<z.ZodString>;
    path: z.ZodDefault<z.ZodArray<z.ZodString>>;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>>>;
  artifacts: z.ZodDefault<z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    kind: z.ZodEnum<{
      preview: "preview";
      pdf: "pdf";
      html: "html";
      manifest: "manifest";
    }>;
    mimeType: z.ZodString;
    sizeBytes: z.ZodNumber;
    location: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
      type: z.ZodLiteral<"storage">;
      storageKey: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
      type: z.ZodLiteral<"url">;
      url: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
      type: z.ZodLiteral<"adapter_reference">;
      reference: z.ZodString;
    }, z.core.$strict>], "type">>;
    storageKey: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    hash: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodString>;
  }, z.core.$strict>>>;
  createdAt: z.ZodOptional<z.ZodString>;
  updatedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
type RenderJobV1 = z.infer<typeof RenderJobV1Schema>;
export declare const BatchRunV1Schema: z.ZodObject<{
  version: z.ZodLiteral<1>;
  id: z.ZodString;
  templateId: z.ZodString;
  templateVersion: z.ZodNumber;
  tenantId: z.ZodOptional<z.ZodString>;
  actorId: z.ZodOptional<z.ZodString>;
  status: z.ZodEnum<{
    draft: "draft";
    failed: "failed";
    queued: "queued";
    running: "running";
    canceled: "canceled";
    completed: "completed";
    partial_success: "partial_success";
  }>;
  dataSnapshotHash: z.ZodOptional<z.ZodString>;
  jobIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
  counts: z.ZodObject<{
    total: z.ZodNumber;
    pending: z.ZodDefault<z.ZodNumber>;
    running: z.ZodDefault<z.ZodNumber>;
    succeeded: z.ZodDefault<z.ZodNumber>;
    failed: z.ZodDefault<z.ZodNumber>;
    canceled: z.ZodDefault<z.ZodNumber>;
  }, z.core.$strict>;
  createdAt: z.ZodOptional<z.ZodString>;
  updatedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
type BatchRunV1 = z.infer<typeof BatchRunV1Schema>;
export declare const AuditEventSchema: z.ZodObject<{
  id: z.ZodString;
  eventType: z.ZodEnum<{
    "template.created": "template.created";
    "template.updated": "template.updated";
    "template.published": "template.published";
    "template.archived": "template.archived";
    "template.duplicated": "template.duplicated";
    "template.restored": "template.restored";
    "render.started": "render.started";
    "render.succeeded": "render.succeeded";
    "render.failed": "render.failed";
    "render.canceled": "render.canceled";
    "batch.started": "batch.started";
    "batch.completed": "batch.completed";
    "batch.failed": "batch.failed";
    "batch.canceled": "batch.canceled";
    "batch.retried": "batch.retried";
    "artifact.created": "artifact.created";
    "artifact.downloaded": "artifact.downloaded";
  }>;
  occurredAt: z.ZodString;
  actor: z.ZodObject<{
    type: z.ZodEnum<{
      user: "user";
      system: "system";
    }>;
    id: z.ZodOptional<z.ZodString>;
  }, z.core.$strict>;
  tenantId: z.ZodOptional<z.ZodString>;
  target: z.ZodObject<{
    type: z.ZodEnum<{
      template: "template";
      artifact: "artifact";
      render_job: "render_job";
      batch_run: "batch_run";
    }>;
    id: z.ZodString;
  }, z.core.$strict>;
  metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
}, z.core.$strict>;
type AuditEvent = z.infer<typeof AuditEventSchema>;
export declare function createDataSnapshotHash(data: JsonValue): DataSnapshotHash;
export declare function stableStringifyJsonValue(value: JsonValue): string;
export declare const BatchGenerationStatusSchema: z.ZodEnum<{
  draft: "draft";
  failed: "failed";
  queued: "queued";
  running: "running";
  canceled: "canceled";
  completed: "completed";
  partial_success: "partial_success";
}>;
type BatchGenerationStatus = z.infer<typeof BatchGenerationStatusSchema>;
export declare const BatchDocumentJobStatusSchema: z.ZodEnum<{
  failed: "failed";
  queued: "queued";
  running: "running";
  succeeded: "succeeded";
  canceled: "canceled";
  retry_queued: "retry_queued";
}>;
type BatchDocumentJobStatus = z.infer<typeof BatchDocumentJobStatusSchema>;
export declare const BatchDatasetReferenceSchema: z.ZodObject<{
  type: z.ZodEnum<{
    adapter_reference: "adapter_reference";
    sample_fixture: "sample_fixture";
    query: "query";
    static_records: "static_records";
  }>;
  id: z.ZodString;
  label: z.ZodOptional<z.ZodString>;
  recordCount: z.ZodOptional<z.ZodNumber>;
  dataSnapshotHash: z.ZodOptional<z.ZodString>;
  criteria: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
}, z.core.$strict>;
type BatchDatasetReference = z.infer<typeof BatchDatasetReferenceSchema>;
type BatchDatasetReferenceInput = z.input<typeof BatchDatasetReferenceSchema>;
export declare const BatchRecipientReferenceSchema: z.ZodObject<{
  id: z.ZodString;
  label: z.ZodOptional<z.ZodString>;
  dataSnapshotHash: z.ZodOptional<z.ZodString>;
  metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
}, z.core.$strict>;
type BatchRecipientReference = z.infer<typeof BatchRecipientReferenceSchema>;
type BatchRecipientReferenceInput = z.input<typeof BatchRecipientReferenceSchema>;
export declare const BatchFailureReasonSchema: z.ZodObject<{
  code: z.ZodString;
  message: z.ZodString;
  retryable: z.ZodDefault<z.ZodBoolean>;
  path: z.ZodDefault<z.ZodArray<z.ZodString>>;
  details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
}, z.core.$strict>;
type BatchFailureReason = z.infer<typeof BatchFailureReasonSchema>;
type BatchFailureReasonInput = z.input<typeof BatchFailureReasonSchema>;
export declare const BatchSafetyPreflightDiagnosticSchema: z.ZodObject<{
  code: z.ZodString;
  severity: z.ZodEnum<{
    error: "error";
    warning: "warning";
    info: "info";
  }>;
  message: z.ZodString;
  path: z.ZodDefault<z.ZodArray<z.ZodString>>;
  nodeId: z.ZodOptional<z.ZodString>;
  suggestedFix: z.ZodOptional<z.ZodString>;
  details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
}, z.core.$strict>;
type BatchSafetyPreflightDiagnostic = z.infer<typeof BatchSafetyPreflightDiagnosticSchema>;
type BatchSafetyPreflightDiagnosticInput = z.input<typeof BatchSafetyPreflightDiagnosticSchema>;
export declare const BatchSafetyPreflightResultSchema: z.ZodObject<{
  ok: z.ZodBoolean;
  diagnostics: z.ZodDefault<z.ZodArray<z.ZodObject<{
    code: z.ZodString;
    severity: z.ZodEnum<{
      error: "error";
      warning: "warning";
      info: "info";
    }>;
    message: z.ZodString;
    path: z.ZodDefault<z.ZodArray<z.ZodString>>;
    nodeId: z.ZodOptional<z.ZodString>;
    suggestedFix: z.ZodOptional<z.ZodString>;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>>>;
}, z.core.$strict>;
type BatchSafetyPreflightResult = z.infer<typeof BatchSafetyPreflightResultSchema>;
interface BatchSafetyPreflightResultInput {
  readonly ok: boolean;
  readonly diagnostics?: readonly BatchSafetyPreflightDiagnosticInput[];
}
export declare const BatchGenerationDefinitionV1Schema: z.ZodObject<{
  version: z.ZodLiteral<1>;
  id: z.ZodString;
  status: z.ZodDefault<z.ZodLiteral<"draft">>;
  tenantId: z.ZodOptional<z.ZodString>;
  actorId: z.ZodOptional<z.ZodString>;
  templateSnapshotId: z.ZodString;
  templateId: z.ZodString;
  templateVersion: z.ZodNumber;
  templateSnapshot: z.ZodObject<{
    version: z.ZodLiteral<1>;
    id: z.ZodString;
    templateId: z.ZodString;
    templateVersion: z.ZodNumber;
    status: z.ZodLiteral<"published">;
    immutable: z.ZodLiteral<true>;
    template: z.ZodObject<{
      version: z.ZodLiteral<1>;
      id: z.ZodString;
      name: z.ZodString;
      category: z.ZodEnum<{
        custom: "custom";
        donation_receipt: "donation_receipt";
        tax_receipt: "tax_receipt";
        annual_giving_statement: "annual_giving_statement";
        donor_letter: "donor_letter";
        missionary_report: "missionary_report";
        financial_report: "financial_report";
        invoice: "invoice";
        certificate: "certificate";
      }>;
      engine: z.ZodDefault<z.ZodEnum<{
        asym_pdf_document_builder: "asym_pdf_document_builder";
        unlayer: "unlayer";
      }>>;
      status: z.ZodDefault<z.ZodEnum<{
        draft: "draft";
        published: "published";
        archived: "archived";
      }>>;
      pageSettings: z.ZodDefault<z.ZodObject<{
        pageSize: z.ZodDefault<z.ZodEnum<{
          custom: "custom";
          letter: "letter";
          a4: "a4";
          legal: "legal";
        }>>;
        orientation: z.ZodDefault<z.ZodEnum<{
          portrait: "portrait";
          landscape: "landscape";
        }>>;
        margins: z.ZodDefault<z.ZodObject<{
          top: z.ZodDefault<z.ZodString>;
          right: z.ZodDefault<z.ZodString>;
          bottom: z.ZodDefault<z.ZodString>;
          left: z.ZodDefault<z.ZodString>;
        }, z.core.$strict>>;
        customSize: z.ZodOptional<z.ZodObject<{
          width: z.ZodNumber;
          height: z.ZodNumber;
          unit: z.ZodDefault<z.ZodEnum<{
            in: "in";
            cm: "cm";
            mm: "mm";
            pt: "pt";
            px: "px";
          }>>;
        }, z.core.$strict>>;
        headerFooter: z.ZodDefault<z.ZodObject<{
          regions: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            placement: z.ZodEnum<{
              header: "header";
              footer: "footer";
            }>;
            scope: z.ZodEnum<{
              first_page: "first_page";
              repeating: "repeating";
            }>;
            enabled: z.ZodDefault<z.ZodBoolean>;
            alignment: z.ZodDefault<z.ZodEnum<{
              left: "left";
              center: "center";
              right: "right";
            }>>;
            minimumMargin: z.ZodDefault<z.ZodString>;
            content: z.ZodDefault<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
              kind: z.ZodLiteral<"text">;
              text: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
              kind: z.ZodLiteral<"document_title">;
            }, z.core.$strict>, z.ZodObject<{
              kind: z.ZodLiteral<"organization_footer">;
              fallbackText: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
              kind: z.ZodLiteral<"page_number">;
            }, z.core.$strict>, z.ZodObject<{
              kind: z.ZodLiteral<"total_pages">;
            }, z.core.$strict>], "kind">>>;
          }, z.core.$strict>>>;
        }, z.core.$strict>>;
      }, z.core.$strict>>;
      theme: z.ZodDefault<z.ZodObject<{
        name: z.ZodDefault<z.ZodString>;
        branding: z.ZodDefault<z.ZodObject<{
          source: z.ZodDefault<z.ZodEnum<{
            system_default: "system_default";
            tenant_default: "tenant_default";
            template_override: "template_override";
          }>>;
          tenantBrandId: z.ZodOptional<z.ZodString>;
          overriddenFields: z.ZodDefault<z.ZodArray<z.ZodEnum<{
            organization_name: "organization_name";
            logo_asset: "logo_asset";
            primary_color: "primary_color";
            accent_color: "accent_color";
            text_color: "text_color";
            background_color: "background_color";
            heading_font: "heading_font";
            body_font: "body_font";
            fallback_fonts: "fallback_fonts";
            footer_text: "footer_text";
            receipt_defaults: "receipt_defaults";
          }>>>;
        }, z.core.$strict>>;
        organization: z.ZodDefault<z.ZodObject<{
          name: z.ZodOptional<z.ZodString>;
          legalName: z.ZodOptional<z.ZodString>;
          websiteUrl: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        colors: z.ZodDefault<z.ZodObject<{
          primary: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
          accent: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
          text: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
          background: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
        }, z.core.$strict>>;
        fonts: z.ZodDefault<z.ZodObject<{
          body: z.ZodDefault<z.ZodString>;
          heading: z.ZodDefault<z.ZodString>;
          fallback: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>>;
        logoAsset: z.ZodOptional<z.ZodObject<{
          id: z.ZodString;
          role: z.ZodEnum<{
            logo: "logo";
            image: "image";
            signature: "signature";
            font: "font";
            qr: "qr";
            attachment: "attachment";
          }>;
          assetId: z.ZodOptional<z.ZodString>;
          url: z.ZodOptional<z.ZodString>;
          renderSafeUrl: z.ZodOptional<z.ZodString>;
          mimeType: z.ZodOptional<z.ZodString>;
          altText: z.ZodOptional<z.ZodString>;
          width: z.ZodOptional<z.ZodNumber>;
          height: z.ZodOptional<z.ZodNumber>;
          alignment: z.ZodDefault<z.ZodEnum<{
            left: "left";
            center: "center";
            right: "right";
            full_width: "full_width";
          }>>;
          linkUrl: z.ZodOptional<z.ZodString>;
          renderSafe: z.ZodDefault<z.ZodBoolean>;
          required: z.ZodDefault<z.ZodBoolean>;
          tenantId: z.ZodOptional<z.ZodString>;
          source: z.ZodOptional<z.ZodObject<{
            provider: z.ZodOptional<z.ZodString>;
            sourceId: z.ZodOptional<z.ZodString>;
            version: z.ZodOptional<z.ZodString>;
            checksum: z.ZodOptional<z.ZodString>;
            uploadedBy: z.ZodOptional<z.ZodString>;
          }, z.core.$strict>>;
        }, z.core.$strict>>;
        logoAssetId: z.ZodOptional<z.ZodString>;
        footerText: z.ZodOptional<z.ZodString>;
        receiptDefaults: z.ZodDefault<z.ZodObject<{
          thankYouMessage: z.ZodOptional<z.ZodString>;
          taxLanguage: z.ZodOptional<z.ZodString>;
          goodsServicesStatement: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
      }, z.core.$strict>>;
      pdfSettings: z.ZodDefault<z.ZodObject<{
        metadata: z.ZodDefault<z.ZodObject<{
          title: z.ZodOptional<z.ZodString>;
          subject: z.ZodOptional<z.ZodString>;
          author: z.ZodOptional<z.ZodString>;
          organization: z.ZodOptional<z.ZodString>;
          language: z.ZodDefault<z.ZodString>;
          keywords: z.ZodDefault<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>>;
        profile: z.ZodDefault<z.ZodObject<{
          profile: z.ZodOptional<z.ZodEnum<{
            "PDF/A-1a": "PDF/A-1a";
            "PDF/A-1a+PDF/UA-1": "PDF/A-1a+PDF/UA-1";
            "PDF/A-1b": "PDF/A-1b";
            "PDF/A-2a": "PDF/A-2a";
            "PDF/A-2a+PDF/UA-1": "PDF/A-2a+PDF/UA-1";
            "PDF/A-2b": "PDF/A-2b";
            "PDF/A-3a": "PDF/A-3a";
            "PDF/A-3a+PDF/UA-1": "PDF/A-3a+PDF/UA-1";
            "PDF/A-3b": "PDF/A-3b";
            "PDF/UA-1": "PDF/UA-1";
          }>>;
        }, z.core.$strict>>;
      }, z.core.$strict>>;
      content: z.ZodObject<{
        type: z.ZodLiteral<"doc">;
        content: z.ZodDefault<z.ZodArray<z.ZodType<DocumentContentNode, unknown, z.core.$ZodTypeInternals<DocumentContentNode, unknown>>>>;
      }, z.core.$strict>;
      variables: z.ZodDefault<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        label: z.ZodString;
        group: z.ZodEnum<{
          custom: "custom";
          asset: "asset";
          tax_receipt: "tax_receipt";
          financial_report: "financial_report";
          invoice: "invoice";
          organization: "organization";
          recipient: "recipient";
          donation: "donation";
          document: "document";
          missionary: "missionary";
          statement: "statement";
          computed: "computed";
        }>;
        description: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<{
          string: "string";
          number: "number";
          boolean: "boolean";
          date: "date";
          id: "id";
          url: "url";
          rich_text: "rich_text";
          currency: "currency";
          percentage: "percentage";
          address: "address";
          image_url: "image_url";
        }>;
        sampleValue: z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>;
        required: z.ZodDefault<z.ZodBoolean>;
        fallback: z.ZodDefault<z.ZodDiscriminatedUnion<[z.ZodObject<{
          mode: z.ZodLiteral<"none">;
        }, z.core.$strip>, z.ZodObject<{
          mode: z.ZodLiteral<"use_value">;
          value: z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>;
        }, z.core.$strip>, z.ZodObject<{
          mode: z.ZodLiteral<"omit">;
        }, z.core.$strip>], "mode">>;
        formatter: z.ZodOptional<z.ZodString>;
        privacy: z.ZodDefault<z.ZodEnum<{
          public: "public";
          internal: "internal";
          pii: "pii";
          financial: "financial";
          sensitive: "sensitive";
        }>>;
        sourcePath: z.ZodOptional<z.ZodString>;
      }, z.core.$strict>>>;
      dataBindings: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        variableKey: z.ZodString;
        sourcePath: z.ZodString;
        required: z.ZodDefault<z.ZodBoolean>;
      }, z.core.$strict>>>;
      conditionalRules: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        fieldPath: z.ZodString;
        operator: z.ZodEnum<{
          in: "in";
          exists: "exists";
          not_exists: "not_exists";
          equals: "equals";
          not_equals: "not_equals";
          greater_than: "greater_than";
          greater_than_or_equal: "greater_than_or_equal";
          less_than: "less_than";
          less_than_or_equal: "less_than_or_equal";
          contains: "contains";
          not_contains: "not_contains";
          is_empty: "is_empty";
          is_not_empty: "is_not_empty";
          not_in: "not_in";
        }>;
        value: z.ZodOptional<z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>;
      }, z.core.$strict>>>;
      repeaterBindings: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        sourcePath: z.ZodString;
        itemAlias: z.ZodString;
        indexAlias: z.ZodOptional<z.ZodString>;
        emptyState: z.ZodOptional<z.ZodString>;
        filters: z.ZodDefault<z.ZodArray<z.ZodObject<{
          id: z.ZodOptional<z.ZodString>;
          fieldPath: z.ZodString;
          operator: z.ZodEnum<{
            in: "in";
            exists: "exists";
            not_exists: "not_exists";
            equals: "equals";
            not_equals: "not_equals";
            greater_than: "greater_than";
            greater_than_or_equal: "greater_than_or_equal";
            less_than: "less_than";
            less_than_or_equal: "less_than_or_equal";
            contains: "contains";
            not_contains: "not_contains";
            is_empty: "is_empty";
            is_not_empty: "is_not_empty";
            not_in: "not_in";
          }>;
          value: z.ZodOptional<z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>;
        }, z.core.$strict>>>;
        maxItems: z.ZodDefault<z.ZodNumber>;
        sort: z.ZodOptional<z.ZodObject<{
          fieldPath: z.ZodString;
          direction: z.ZodDefault<z.ZodEnum<{
            asc: "asc";
            desc: "desc";
          }>>;
        }, z.core.$strict>>;
      }, z.core.$strict>>>;
      tableBindings: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        sourcePath: z.ZodString;
        columns: z.ZodArray<z.ZodObject<{
          key: z.ZodString;
          label: z.ZodString;
          sourcePath: z.ZodString;
          type: z.ZodDefault<z.ZodEnum<{
            string: "string";
            number: "number";
            boolean: "boolean";
            date: "date";
            id: "id";
            url: "url";
            rich_text: "rich_text";
            currency: "currency";
            percentage: "percentage";
            address: "address";
            image_url: "image_url";
          }>>;
          formatter: z.ZodOptional<z.ZodString>;
          width: z.ZodOptional<z.ZodString>;
          align: z.ZodDefault<z.ZodEnum<{
            left: "left";
            center: "center";
            right: "right";
          }>>;
        }, z.core.$strict>>;
        emptyState: z.ZodOptional<z.ZodString>;
        grouping: z.ZodOptional<z.ZodObject<{
          fieldPath: z.ZodString;
          label: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        repeatHeader: z.ZodDefault<z.ZodBoolean>;
        avoidRowSplit: z.ZodDefault<z.ZodBoolean>;
        maxRows: z.ZodDefault<z.ZodNumber>;
        totals: z.ZodDefault<z.ZodArray<z.ZodObject<{
          columnKey: z.ZodString;
          operation: z.ZodEnum<{
            sum: "sum";
            count: "count";
          }>;
          label: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>>;
      }, z.core.$strict>>>;
      summaryBlockBindings: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        formatter: z.ZodDefault<z.ZodString>;
        precision: z.ZodOptional<z.ZodObject<{
          scale: z.ZodOptional<z.ZodNumber>;
          roundingMode: z.ZodOptional<z.ZodLiteral<"half_away_from_zero">>;
        }, z.core.$strict>>;
        calculation: z.ZodDiscriminatedUnion<[z.ZodObject<{
          type: z.ZodLiteral<"total_contributions">;
          sourcePath: z.ZodString;
          amountPath: z.ZodString;
          label: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
          type: z.ZodLiteral<"table_total">;
          tableBindingId: z.ZodString;
          columnKey: z.ZodString;
          operation: z.ZodOptional<z.ZodEnum<{
            sum: "sum";
            count: "count";
          }>>;
          label: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
          type: z.ZodLiteral<"invoice_totals">;
          lineItemsPath: z.ZodString;
          amountPath: z.ZodOptional<z.ZodString>;
          quantityPath: z.ZodOptional<z.ZodString>;
          ratePath: z.ZodOptional<z.ZodString>;
          discountPath: z.ZodOptional<z.ZodString>;
          taxPath: z.ZodOptional<z.ZodString>;
          fields: z.ZodDefault<z.ZodArray<z.ZodEnum<{
            subtotal: "subtotal";
            discounts: "discounts";
            taxes: "taxes";
            total: "total";
          }>>>;
          labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, z.core.$strict>, z.ZodObject<{
          type: z.ZodLiteral<"financial_report_totals">;
          sourcePath: z.ZodString;
          amountPath: z.ZodString;
          categoryPath: z.ZodString;
          incomeCategories: z.ZodArray<z.ZodString>;
          expenseCategories: z.ZodArray<z.ZodString>;
          fields: z.ZodDefault<z.ZodArray<z.ZodEnum<{
            income: "income";
            expense: "expense";
            net: "net";
          }>>>;
          labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, z.core.$strict>, z.ZodObject<{
          type: z.ZodLiteral<"grouped_subtotals">;
          sourcePath: z.ZodString;
          groupPath: z.ZodString;
          valuePath: z.ZodString;
          includeGrandTotal: z.ZodDefault<z.ZodBoolean>;
          labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
          grandTotalLabel: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
          type: z.ZodLiteral<"grand_total">;
          sourcePath: z.ZodString;
          groupPath: z.ZodString;
          valuePath: z.ZodString;
          label: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>], "type">;
      }, z.core.$strict>>>;
      placeholderBindings: z.ZodDefault<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        id: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
        required: z.ZodDefault<z.ZodBoolean>;
        adapterKey: z.ZodOptional<z.ZodString>;
        dataPath: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        kind: z.ZodLiteral<"text_field">;
        placeholderText: z.ZodOptional<z.ZodString>;
        maxLength: z.ZodOptional<z.ZodNumber>;
        multiline: z.ZodDefault<z.ZodBoolean>;
      }, z.core.$strict>, z.ZodObject<{
        id: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
        required: z.ZodDefault<z.ZodBoolean>;
        adapterKey: z.ZodOptional<z.ZodString>;
        dataPath: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        kind: z.ZodLiteral<"checkbox">;
        checkedByDefault: z.ZodDefault<z.ZodBoolean>;
      }, z.core.$strict>, z.ZodObject<{
        id: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
        required: z.ZodDefault<z.ZodBoolean>;
        adapterKey: z.ZodOptional<z.ZodString>;
        dataPath: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        kind: z.ZodLiteral<"signature">;
        signerRole: z.ZodOptional<z.ZodEnum<{
          custom: "custom";
          organization: "organization";
          recipient: "recipient";
          witness: "witness";
          staff: "staff";
        }>>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
      }, z.core.$strict>, z.ZodObject<{
        id: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
        required: z.ZodDefault<z.ZodBoolean>;
        adapterKey: z.ZodOptional<z.ZodString>;
        dataPath: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        kind: z.ZodLiteral<"initials">;
        signerRole: z.ZodOptional<z.ZodEnum<{
          custom: "custom";
          organization: "organization";
          recipient: "recipient";
          witness: "witness";
          staff: "staff";
        }>>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
      }, z.core.$strict>, z.ZodObject<{
        id: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
        required: z.ZodDefault<z.ZodBoolean>;
        adapterKey: z.ZodOptional<z.ZodString>;
        dataPath: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        kind: z.ZodLiteral<"qr">;
        payload: z.ZodDiscriminatedUnion<[z.ZodObject<{
          type: z.ZodLiteral<"url">;
          value: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
          type: z.ZodLiteral<"text">;
          value: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
          type: z.ZodLiteral<"variable">;
          key: z.ZodString;
        }, z.core.$strict>], "type">;
        size: z.ZodOptional<z.ZodNumber>;
        errorCorrectionLevel: z.ZodOptional<z.ZodEnum<{
          low: "low";
          medium: "medium";
          quartile: "quartile";
          high: "high";
        }>>;
      }, z.core.$strict>, z.ZodObject<{
        id: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
        required: z.ZodDefault<z.ZodBoolean>;
        adapterKey: z.ZodOptional<z.ZodString>;
        dataPath: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        kind: z.ZodLiteral<"date">;
        dateFormat: z.ZodOptional<z.ZodString>;
      }, z.core.$strict>], "kind">>>;
      assets: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        role: z.ZodEnum<{
          logo: "logo";
          image: "image";
          signature: "signature";
          font: "font";
          qr: "qr";
          attachment: "attachment";
        }>;
        assetId: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodString>;
        renderSafeUrl: z.ZodOptional<z.ZodString>;
        mimeType: z.ZodOptional<z.ZodString>;
        altText: z.ZodOptional<z.ZodString>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
        alignment: z.ZodDefault<z.ZodEnum<{
          left: "left";
          center: "center";
          right: "right";
          full_width: "full_width";
        }>>;
        linkUrl: z.ZodOptional<z.ZodString>;
        renderSafe: z.ZodDefault<z.ZodBoolean>;
        required: z.ZodDefault<z.ZodBoolean>;
        tenantId: z.ZodOptional<z.ZodString>;
        source: z.ZodOptional<z.ZodObject<{
          provider: z.ZodOptional<z.ZodString>;
          sourceId: z.ZodOptional<z.ZodString>;
          version: z.ZodOptional<z.ZodString>;
          checksum: z.ZodOptional<z.ZodString>;
          uploadedBy: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
      }, z.core.$strict>>>;
      metadata: z.ZodDefault<z.ZodObject<{
        description: z.ZodOptional<z.ZodString>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
        createdAt: z.ZodOptional<z.ZodString>;
        updatedAt: z.ZodOptional<z.ZodString>;
      }, z.core.$strict>>;
    }, z.core.$strict>;
    engine: z.ZodObject<{
      engine: z.ZodDefault<z.ZodEnum<{
        asym_pdf_document_builder: "asym_pdf_document_builder";
        unlayer: "unlayer";
      }>>;
      schemaVersion: z.ZodDefault<z.ZodNumber>;
      legacyTemplateId: z.ZodOptional<z.ZodString>;
      migrationId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    validation: z.ZodObject<{
      status: z.ZodDefault<z.ZodEnum<{
        not_run: "not_run";
        passed: "passed";
        warning: "warning";
        failed: "failed";
      }>>;
      checkedAt: z.ZodOptional<z.ZodString>;
      diagnosticCount: z.ZodDefault<z.ZodNumber>;
      errorCount: z.ZodDefault<z.ZodNumber>;
      warningCount: z.ZodDefault<z.ZodNumber>;
      summary: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
    }, z.core.$strict>;
    preflight: z.ZodObject<{
      status: z.ZodDefault<z.ZodEnum<{
        not_run: "not_run";
        passed: "passed";
        warning: "warning";
        failed: "failed";
      }>>;
      checkedAt: z.ZodOptional<z.ZodString>;
      diagnosticCount: z.ZodDefault<z.ZodNumber>;
      errorCount: z.ZodDefault<z.ZodNumber>;
      warningCount: z.ZodDefault<z.ZodNumber>;
      summary: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
    }, z.core.$strict>;
    publishedAt: z.ZodString;
    publishedByActorId: z.ZodOptional<z.ZodString>;
    changelog: z.ZodDefault<z.ZodArray<z.ZodObject<{
      id: z.ZodString;
      event: z.ZodEnum<{
        published: "published";
        archived: "archived";
        created: "created";
        updated: "updated";
        restored: "restored";
        duplicated: "duplicated";
      }>;
      at: z.ZodString;
      actorId: z.ZodOptional<z.ZodString>;
      message: z.ZodOptional<z.ZodString>;
      changes: z.ZodDefault<z.ZodArray<z.ZodString>>;
      metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
    }, z.core.$strict>>>;
  }, z.core.$strict>;
  dataset: z.ZodObject<{
    type: z.ZodEnum<{
      adapter_reference: "adapter_reference";
      sample_fixture: "sample_fixture";
      query: "query";
      static_records: "static_records";
    }>;
    id: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
    recordCount: z.ZodOptional<z.ZodNumber>;
    dataSnapshotHash: z.ZodOptional<z.ZodString>;
    criteria: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>;
  recipients: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
    dataSnapshotHash: z.ZodOptional<z.ZodString>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>>;
  dataSnapshotHash: z.ZodString;
  mode: z.ZodDefault<z.ZodLiteral<"batch">>;
  renderer: z.ZodDefault<z.ZodEnum<{
    local: "local";
    docraptor: "docraptor";
    browser: "browser";
  }>>;
  preflight: z.ZodDefault<z.ZodObject<{
    ok: z.ZodBoolean;
    diagnostics: z.ZodDefault<z.ZodArray<z.ZodObject<{
      code: z.ZodString;
      severity: z.ZodEnum<{
        error: "error";
        warning: "warning";
        info: "info";
      }>;
      message: z.ZodString;
      path: z.ZodDefault<z.ZodArray<z.ZodString>>;
      nodeId: z.ZodOptional<z.ZodString>;
      suggestedFix: z.ZodOptional<z.ZodString>;
      details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
    }, z.core.$strict>>>;
  }, z.core.$strict>>;
  createdAt: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
type BatchGenerationDefinitionV1 = z.infer<typeof BatchGenerationDefinitionV1Schema>;
export declare const BatchDocumentJobV1Schema: z.ZodObject<{
  version: z.ZodLiteral<1>;
  id: z.ZodString;
  batchId: z.ZodString;
  recipient: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
    dataSnapshotHash: z.ZodOptional<z.ZodString>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>;
  templateId: z.ZodString;
  templateVersion: z.ZodNumber;
  templateSnapshotId: z.ZodString;
  status: z.ZodEnum<{
    failed: "failed";
    queued: "queued";
    running: "running";
    succeeded: "succeeded";
    canceled: "canceled";
    retry_queued: "retry_queued";
  }>;
  attempt: z.ZodDefault<z.ZodNumber>;
  maxAttempts: z.ZodDefault<z.ZodNumber>;
  renderer: z.ZodDefault<z.ZodEnum<{
    local: "local";
    docraptor: "docraptor";
    browser: "browser";
  }>>;
  dataSnapshotHash: z.ZodString;
  renderJobId: z.ZodOptional<z.ZodString>;
  failureReason: z.ZodOptional<z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
    retryable: z.ZodDefault<z.ZodBoolean>;
    path: z.ZodDefault<z.ZodArray<z.ZodString>>;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>>;
  artifacts: z.ZodDefault<z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    kind: z.ZodEnum<{
      preview: "preview";
      pdf: "pdf";
      html: "html";
      manifest: "manifest";
    }>;
    mimeType: z.ZodString;
    sizeBytes: z.ZodNumber;
    location: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
      type: z.ZodLiteral<"storage">;
      storageKey: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
      type: z.ZodLiteral<"url">;
      url: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
      type: z.ZodLiteral<"adapter_reference">;
      reference: z.ZodString;
    }, z.core.$strict>], "type">>;
    storageKey: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    hash: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodString>;
  }, z.core.$strict>>>;
  createdAt: z.ZodOptional<z.ZodString>;
  updatedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
type BatchDocumentJobV1 = z.infer<typeof BatchDocumentJobV1Schema>;
export declare const BatchProgressSummarySchema: z.ZodObject<{
  total: z.ZodNumber;
  pending: z.ZodNumber;
  running: z.ZodNumber;
  succeeded: z.ZodNumber;
  failed: z.ZodNumber;
  canceled: z.ZodNumber;
  retryQueued: z.ZodNumber;
  completionRatio: z.ZodNumber;
}, z.core.$strict>;
type BatchProgressSummary = z.infer<typeof BatchProgressSummarySchema>;
export declare const BatchGenerationRunV1Schema: z.ZodObject<{
  version: z.ZodLiteral<1>;
  id: z.ZodString;
  templateId: z.ZodString;
  templateVersion: z.ZodNumber;
  templateSnapshotId: z.ZodString;
  tenantId: z.ZodOptional<z.ZodString>;
  actorId: z.ZodOptional<z.ZodString>;
  status: z.ZodEnum<{
    draft: "draft";
    failed: "failed";
    queued: "queued";
    running: "running";
    canceled: "canceled";
    completed: "completed";
    partial_success: "partial_success";
  }>;
  dataset: z.ZodObject<{
    type: z.ZodEnum<{
      adapter_reference: "adapter_reference";
      sample_fixture: "sample_fixture";
      query: "query";
      static_records: "static_records";
    }>;
    id: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
    recordCount: z.ZodOptional<z.ZodNumber>;
    dataSnapshotHash: z.ZodOptional<z.ZodString>;
    criteria: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>;
  dataSnapshotHash: z.ZodString;
  jobIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
  progress: z.ZodObject<{
    total: z.ZodNumber;
    pending: z.ZodNumber;
    running: z.ZodNumber;
    succeeded: z.ZodNumber;
    failed: z.ZodNumber;
    canceled: z.ZodNumber;
    retryQueued: z.ZodNumber;
    completionRatio: z.ZodNumber;
  }, z.core.$strict>;
  preflight: z.ZodObject<{
    ok: z.ZodBoolean;
    diagnostics: z.ZodDefault<z.ZodArray<z.ZodObject<{
      code: z.ZodString;
      severity: z.ZodEnum<{
        error: "error";
        warning: "warning";
        info: "info";
      }>;
      message: z.ZodString;
      path: z.ZodDefault<z.ZodArray<z.ZodString>>;
      nodeId: z.ZodOptional<z.ZodString>;
      suggestedFix: z.ZodOptional<z.ZodString>;
      details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
    }, z.core.$strict>>>;
  }, z.core.$strict>;
  createdAt: z.ZodOptional<z.ZodString>;
  updatedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
type BatchGenerationRunV1 = z.infer<typeof BatchGenerationRunV1Schema>;
export declare const BatchResultManifestJobSchema: z.ZodObject<{
  id: z.ZodString;
  recipientId: z.ZodString;
  status: z.ZodEnum<{
    failed: "failed";
    queued: "queued";
    running: "running";
    succeeded: "succeeded";
    canceled: "canceled";
    retry_queued: "retry_queued";
  }>;
  attempt: z.ZodNumber;
  maxAttempts: z.ZodNumber;
  artifactIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
  failureReason: z.ZodOptional<z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
    retryable: z.ZodDefault<z.ZodBoolean>;
    path: z.ZodDefault<z.ZodArray<z.ZodString>>;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>>;
}, z.core.$strict>;
type BatchResultManifestJob = z.infer<typeof BatchResultManifestJobSchema>;
export declare const BatchResultManifestV1Schema: z.ZodObject<{
  version: z.ZodLiteral<1>;
  batchId: z.ZodString;
  templateId: z.ZodString;
  templateVersion: z.ZodNumber;
  templateSnapshotId: z.ZodString;
  tenantId: z.ZodOptional<z.ZodString>;
  actorId: z.ZodOptional<z.ZodString>;
  status: z.ZodEnum<{
    draft: "draft";
    failed: "failed";
    queued: "queued";
    running: "running";
    canceled: "canceled";
    completed: "completed";
    partial_success: "partial_success";
  }>;
  generatedAt: z.ZodString;
  progress: z.ZodObject<{
    total: z.ZodNumber;
    pending: z.ZodNumber;
    running: z.ZodNumber;
    succeeded: z.ZodNumber;
    failed: z.ZodNumber;
    canceled: z.ZodNumber;
    retryQueued: z.ZodNumber;
    completionRatio: z.ZodNumber;
  }, z.core.$strict>;
  jobs: z.ZodDefault<z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    recipientId: z.ZodString;
    status: z.ZodEnum<{
      failed: "failed";
      queued: "queued";
      running: "running";
      succeeded: "succeeded";
      canceled: "canceled";
      retry_queued: "retry_queued";
    }>;
    attempt: z.ZodNumber;
    maxAttempts: z.ZodNumber;
    artifactIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
    failureReason: z.ZodOptional<z.ZodObject<{
      code: z.ZodString;
      message: z.ZodString;
      retryable: z.ZodDefault<z.ZodBoolean>;
      path: z.ZodDefault<z.ZodArray<z.ZodString>>;
      details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
    }, z.core.$strict>>;
  }, z.core.$strict>>>;
  failures: z.ZodDefault<z.ZodArray<z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
    retryable: z.ZodDefault<z.ZodBoolean>;
    path: z.ZodDefault<z.ZodArray<z.ZodString>>;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>>>;
  artifacts: z.ZodDefault<z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    kind: z.ZodEnum<{
      preview: "preview";
      pdf: "pdf";
      html: "html";
      manifest: "manifest";
    }>;
    mimeType: z.ZodString;
    sizeBytes: z.ZodNumber;
    location: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
      type: z.ZodLiteral<"storage">;
      storageKey: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
      type: z.ZodLiteral<"url">;
      url: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
      type: z.ZodLiteral<"adapter_reference">;
      reference: z.ZodString;
    }, z.core.$strict>], "type">>;
    storageKey: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    hash: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodString>;
  }, z.core.$strict>>>;
}, z.core.$strict>;
type BatchResultManifestV1 = z.infer<typeof BatchResultManifestV1Schema>;
export declare const BatchDownloadManifestV1Schema: z.ZodObject<{
  version: z.ZodLiteral<1>;
  batchId: z.ZodString;
  kind: z.ZodLiteral<"zip">;
  generatedAt: z.ZodString;
  artifactCount: z.ZodNumber;
  sizeBytes: z.ZodOptional<z.ZodNumber>;
  artifacts: z.ZodDefault<z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    kind: z.ZodEnum<{
      preview: "preview";
      pdf: "pdf";
      html: "html";
      manifest: "manifest";
    }>;
    mimeType: z.ZodString;
    sizeBytes: z.ZodNumber;
    location: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
      type: z.ZodLiteral<"storage">;
      storageKey: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
      type: z.ZodLiteral<"url">;
      url: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
      type: z.ZodLiteral<"adapter_reference">;
      reference: z.ZodString;
    }, z.core.$strict>], "type">>;
    storageKey: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    hash: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodString>;
  }, z.core.$strict>>>;
  failures: z.ZodDefault<z.ZodArray<z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
    retryable: z.ZodDefault<z.ZodBoolean>;
    path: z.ZodDefault<z.ZodArray<z.ZodString>>;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>>>;
}, z.core.$strict>;
type BatchDownloadManifestV1 = z.infer<typeof BatchDownloadManifestV1Schema>;
interface CreateBatchGenerationDefinitionInput {
  readonly id: string;
  readonly templateSnapshot: unknown;
  readonly dataset: BatchDatasetReferenceInput;
  readonly recipients: readonly BatchRecipientReferenceInput[];
  readonly tenantId?: string;
  readonly actorId?: string;
  readonly renderer?: z.infer<typeof RendererSchema>;
  readonly preflight?: BatchSafetyPreflightResultInput;
  readonly createdAt?: string;
}
interface CreateBatchDocumentJobsInput {
  readonly definition: BatchGenerationDefinitionV1;
  readonly now?: string;
  readonly maxAttempts?: number;
}
interface CreateBatchGenerationRunInput {
  readonly definition: BatchGenerationDefinitionV1;
  readonly jobs: readonly BatchDocumentJobV1[];
  readonly now?: string;
}
interface TransitionBatchDocumentJobInput {
  readonly job: BatchDocumentJobV1;
  readonly status: BatchDocumentJobStatus;
  readonly now?: string;
  readonly renderJobId?: string;
  readonly failureReason?: BatchFailureReasonInput;
  readonly artifacts?: readonly DocumentArtifact[];
}
interface CreateRetryBatchDocumentJobInput {
  readonly job: BatchDocumentJobV1;
  readonly now?: string;
}
interface CancelBatchGenerationRunInput {
  readonly run: BatchGenerationRunV1;
  readonly jobs: readonly BatchDocumentJobV1[];
  readonly now?: string;
}
interface CancelBatchGenerationRunResult {
  readonly run: BatchGenerationRunV1;
  readonly jobs: readonly BatchDocumentJobV1[];
}
interface CreateBatchManifestInput {
  readonly run: BatchGenerationRunV1;
  readonly jobs: readonly BatchDocumentJobV1[];
  readonly now: string;
}
interface BatchQueueEnqueueInput {
  readonly run: BatchGenerationRunV1;
  readonly jobs: readonly BatchDocumentJobV1[];
}
interface BatchQueueEnqueueResult {
  readonly batchId: string;
  readonly enqueuedJobIds: readonly string[];
}
interface BatchQueueCancelInput {
  readonly run: BatchGenerationRunV1;
  readonly jobIds?: readonly string[];
}
interface BatchQueueRetryInput {
  readonly run: BatchGenerationRunV1;
  readonly jobs: readonly BatchDocumentJobV1[];
}
interface BatchQueueAdapter {
  enqueueJobs(input: BatchQueueEnqueueInput): Promise<BatchQueueEnqueueResult>;
  cancelJobs?(input: BatchQueueCancelInput): Promise<void>;
  retryJobs?(input: BatchQueueRetryInput): Promise<BatchQueueEnqueueResult>;
}
export declare function createBatchGenerationDefinition(input: CreateBatchGenerationDefinitionInput): BatchGenerationDefinitionV1;
export declare function createBatchDocumentJobs(input: CreateBatchDocumentJobsInput): readonly BatchDocumentJobV1[];
export declare function createBatchGenerationRun(input: CreateBatchGenerationRunInput): BatchGenerationRunV1;
export declare function transitionBatchDocumentJob(input: TransitionBatchDocumentJobInput): BatchDocumentJobV1;
export declare function createRetryBatchDocumentJob(input: CreateRetryBatchDocumentJobInput): BatchDocumentJobV1;
export declare function cancelBatchGenerationRun(input: CancelBatchGenerationRunInput): CancelBatchGenerationRunResult;
export declare function summarizeBatchProgress(jobs: readonly BatchDocumentJobV1[]): BatchProgressSummary;
export declare function createBatchResultManifest(input: CreateBatchManifestInput): BatchResultManifestV1;
export declare function createBatchDownloadManifest(input: CreateBatchManifestInput): BatchDownloadManifestV1;
export declare const DataBindingSchema: z.ZodObject<{
  id: z.ZodString;
  variableKey: z.ZodString;
  sourcePath: z.ZodString;
  required: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strict>;
type DataBinding = z.infer<typeof DataBindingSchema>;
export declare const ConditionalOperatorSchema: z.ZodEnum<{
  in: "in";
  exists: "exists";
  not_exists: "not_exists";
  equals: "equals";
  not_equals: "not_equals";
  greater_than: "greater_than";
  greater_than_or_equal: "greater_than_or_equal";
  less_than: "less_than";
  less_than_or_equal: "less_than_or_equal";
  contains: "contains";
  not_contains: "not_contains";
  is_empty: "is_empty";
  is_not_empty: "is_not_empty";
  not_in: "not_in";
}>;
export declare const ConditionalRuleSchema: z.ZodObject<{
  id: z.ZodOptional<z.ZodString>;
  fieldPath: z.ZodString;
  operator: z.ZodEnum<{
    in: "in";
    exists: "exists";
    not_exists: "not_exists";
    equals: "equals";
    not_equals: "not_equals";
    greater_than: "greater_than";
    greater_than_or_equal: "greater_than_or_equal";
    less_than: "less_than";
    less_than_or_equal: "less_than_or_equal";
    contains: "contains";
    not_contains: "not_contains";
    is_empty: "is_empty";
    is_not_empty: "is_not_empty";
    not_in: "not_in";
  }>;
  value: z.ZodOptional<z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>;
}, z.core.$strict>;
type ConditionalRule = z.infer<typeof ConditionalRuleSchema>;
export declare const RepeaterBindingSchema: z.ZodObject<{
  id: z.ZodString;
  sourcePath: z.ZodString;
  itemAlias: z.ZodString;
  indexAlias: z.ZodOptional<z.ZodString>;
  emptyState: z.ZodOptional<z.ZodString>;
  filters: z.ZodDefault<z.ZodArray<z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    fieldPath: z.ZodString;
    operator: z.ZodEnum<{
      in: "in";
      exists: "exists";
      not_exists: "not_exists";
      equals: "equals";
      not_equals: "not_equals";
      greater_than: "greater_than";
      greater_than_or_equal: "greater_than_or_equal";
      less_than: "less_than";
      less_than_or_equal: "less_than_or_equal";
      contains: "contains";
      not_contains: "not_contains";
      is_empty: "is_empty";
      is_not_empty: "is_not_empty";
      not_in: "not_in";
    }>;
    value: z.ZodOptional<z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>;
  }, z.core.$strict>>>;
  maxItems: z.ZodDefault<z.ZodNumber>;
  sort: z.ZodOptional<z.ZodObject<{
    fieldPath: z.ZodString;
    direction: z.ZodDefault<z.ZodEnum<{
      asc: "asc";
      desc: "desc";
    }>>;
  }, z.core.$strict>>;
}, z.core.$strict>;
type RepeaterBinding = z.infer<typeof RepeaterBindingSchema>;
type RepeaterBindingInput = z.input<typeof RepeaterBindingSchema>;
export declare const TableColumnBindingSchema: z.ZodObject<{
  key: z.ZodString;
  label: z.ZodString;
  sourcePath: z.ZodString;
  type: z.ZodDefault<z.ZodEnum<{
    string: "string";
    number: "number";
    boolean: "boolean";
    date: "date";
    id: "id";
    url: "url";
    rich_text: "rich_text";
    currency: "currency";
    percentage: "percentage";
    address: "address";
    image_url: "image_url";
  }>>;
  formatter: z.ZodOptional<z.ZodString>;
  width: z.ZodOptional<z.ZodString>;
  align: z.ZodDefault<z.ZodEnum<{
    left: "left";
    center: "center";
    right: "right";
  }>>;
}, z.core.$strict>;
type TableColumnBinding = z.infer<typeof TableColumnBindingSchema>;
export declare const TableGroupingBindingSchema: z.ZodObject<{
  fieldPath: z.ZodString;
  label: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
type TableGroupingBinding = z.infer<typeof TableGroupingBindingSchema>;
export declare const TableTotalBindingSchema: z.ZodObject<{
  columnKey: z.ZodString;
  operation: z.ZodEnum<{
    sum: "sum";
    count: "count";
  }>;
  label: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
type TableTotalBinding = z.infer<typeof TableTotalBindingSchema>;
export declare const TableBindingSchema: z.ZodObject<{
  id: z.ZodString;
  sourcePath: z.ZodString;
  columns: z.ZodArray<z.ZodObject<{
    key: z.ZodString;
    label: z.ZodString;
    sourcePath: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<{
      string: "string";
      number: "number";
      boolean: "boolean";
      date: "date";
      id: "id";
      url: "url";
      rich_text: "rich_text";
      currency: "currency";
      percentage: "percentage";
      address: "address";
      image_url: "image_url";
    }>>;
    formatter: z.ZodOptional<z.ZodString>;
    width: z.ZodOptional<z.ZodString>;
    align: z.ZodDefault<z.ZodEnum<{
      left: "left";
      center: "center";
      right: "right";
    }>>;
  }, z.core.$strict>>;
  emptyState: z.ZodOptional<z.ZodString>;
  grouping: z.ZodOptional<z.ZodObject<{
    fieldPath: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
  }, z.core.$strict>>;
  repeatHeader: z.ZodDefault<z.ZodBoolean>;
  avoidRowSplit: z.ZodDefault<z.ZodBoolean>;
  maxRows: z.ZodDefault<z.ZodNumber>;
  totals: z.ZodDefault<z.ZodArray<z.ZodObject<{
    columnKey: z.ZodString;
    operation: z.ZodEnum<{
      sum: "sum";
      count: "count";
    }>;
    label: z.ZodOptional<z.ZodString>;
  }, z.core.$strict>>>;
}, z.core.$strict>;
type TableBinding = z.infer<typeof TableBindingSchema>;
type TableBindingInput = z.input<typeof TableBindingSchema>;
export declare const VariableGroupSchema: z.ZodEnum<{
  custom: "custom";
  asset: "asset";
  tax_receipt: "tax_receipt";
  financial_report: "financial_report";
  invoice: "invoice";
  organization: "organization";
  recipient: "recipient";
  donation: "donation";
  document: "document";
  missionary: "missionary";
  statement: "statement";
  computed: "computed";
}>;
export declare const VariableValueTypeSchema: z.ZodEnum<{
  string: "string";
  number: "number";
  boolean: "boolean";
  date: "date";
  id: "id";
  url: "url";
  rich_text: "rich_text";
  currency: "currency";
  percentage: "percentage";
  address: "address";
  image_url: "image_url";
}>;
export declare const PrivacyClassificationSchema: z.ZodEnum<{
  public: "public";
  internal: "internal";
  pii: "pii";
  financial: "financial";
  sensitive: "sensitive";
}>;
export declare const FallbackBehaviorSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
  mode: z.ZodLiteral<"none">;
}, z.core.$strip>, z.ZodObject<{
  mode: z.ZodLiteral<"use_value">;
  value: z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>;
}, z.core.$strip>, z.ZodObject<{
  mode: z.ZodLiteral<"omit">;
}, z.core.$strip>], "mode">;
type FallbackBehavior = z.infer<typeof FallbackBehaviorSchema>;
type PrivacyClassification = z.infer<typeof PrivacyClassificationSchema>;
type VariableGroup = z.infer<typeof VariableGroupSchema>;
type VariableValueType = z.infer<typeof VariableValueTypeSchema>;
export declare const VariableDefinitionSchema: z.ZodObject<{
  key: z.ZodString;
  label: z.ZodString;
  group: z.ZodEnum<{
    custom: "custom";
    asset: "asset";
    tax_receipt: "tax_receipt";
    financial_report: "financial_report";
    invoice: "invoice";
    organization: "organization";
    recipient: "recipient";
    donation: "donation";
    document: "document";
    missionary: "missionary";
    statement: "statement";
    computed: "computed";
  }>;
  description: z.ZodOptional<z.ZodString>;
  type: z.ZodEnum<{
    string: "string";
    number: "number";
    boolean: "boolean";
    date: "date";
    id: "id";
    url: "url";
    rich_text: "rich_text";
    currency: "currency";
    percentage: "percentage";
    address: "address";
    image_url: "image_url";
  }>;
  sampleValue: z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>;
  required: z.ZodDefault<z.ZodBoolean>;
  fallback: z.ZodDefault<z.ZodDiscriminatedUnion<[z.ZodObject<{
    mode: z.ZodLiteral<"none">;
  }, z.core.$strip>, z.ZodObject<{
    mode: z.ZodLiteral<"use_value">;
    value: z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>;
  }, z.core.$strip>, z.ZodObject<{
    mode: z.ZodLiteral<"omit">;
  }, z.core.$strip>], "mode">>;
  formatter: z.ZodOptional<z.ZodString>;
  privacy: z.ZodDefault<z.ZodEnum<{
    public: "public";
    internal: "internal";
    pii: "pii";
    financial: "financial";
    sensitive: "sensitive";
  }>>;
  sourcePath: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
type VariableDefinition = z.infer<typeof VariableDefinitionSchema>;
export declare const RegistryVariableDefinitionSchema: z.ZodObject<{
  key: z.ZodString;
  label: z.ZodString;
  group: z.ZodEnum<{
    custom: "custom";
    asset: "asset";
    tax_receipt: "tax_receipt";
    financial_report: "financial_report";
    invoice: "invoice";
    organization: "organization";
    recipient: "recipient";
    donation: "donation";
    document: "document";
    missionary: "missionary";
    statement: "statement";
    computed: "computed";
  }>;
  type: z.ZodEnum<{
    string: "string";
    number: "number";
    boolean: "boolean";
    date: "date";
    id: "id";
    url: "url";
    rich_text: "rich_text";
    currency: "currency";
    percentage: "percentage";
    address: "address";
    image_url: "image_url";
  }>;
  sampleValue: z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>;
  description: z.ZodString;
  required: z.ZodBoolean;
  fallback: z.ZodDiscriminatedUnion<[z.ZodObject<{
    mode: z.ZodLiteral<"none">;
  }, z.core.$strip>, z.ZodObject<{
    mode: z.ZodLiteral<"use_value">;
    value: z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>;
  }, z.core.$strip>, z.ZodObject<{
    mode: z.ZodLiteral<"omit">;
  }, z.core.$strip>], "mode">;
  formatter: z.ZodString;
  privacy: z.ZodEnum<{
    public: "public";
    internal: "internal";
    pii: "pii";
    financial: "financial";
    sensitive: "sensitive";
  }>;
  sourcePath: z.ZodString;
  documentCategories: z.ZodArray<z.ZodEnum<{
    custom: "custom";
    donation_receipt: "donation_receipt";
    tax_receipt: "tax_receipt";
    annual_giving_statement: "annual_giving_statement";
    donor_letter: "donor_letter";
    missionary_report: "missionary_report";
    financial_report: "financial_report";
    invoice: "invoice";
    certificate: "certificate";
  }>>;
}, z.core.$strict>;
type RegistryVariableDefinition = z.infer<typeof RegistryVariableDefinitionSchema>;
type RegistryVariableDefinitionInput = z.input<typeof RegistryVariableDefinitionSchema>;
export declare const VariableReferenceSchema: z.ZodObject<{
  type: z.ZodLiteral<"variable">;
  key: z.ZodString;
  formatter: z.ZodOptional<z.ZodString>;
  fallback: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
    mode: z.ZodLiteral<"none">;
  }, z.core.$strip>, z.ZodObject<{
    mode: z.ZodLiteral<"use_value">;
    value: z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>;
  }, z.core.$strip>, z.ZodObject<{
    mode: z.ZodLiteral<"omit">;
  }, z.core.$strip>], "mode">>;
}, z.core.$strict>;
type VariableReference = z.infer<typeof VariableReferenceSchema>;
type VariableRegistryErrorCode = 'duplicate_key' | 'invalid_definition';
interface VariableRegistryErrorOptions {
  readonly code: VariableRegistryErrorCode;
  readonly message: string;
  readonly variableKeys?: readonly string[];
  readonly cause?: unknown;
}
export declare class VariableRegistryError extends Error {
  readonly code: VariableRegistryErrorCode;
  readonly variableKeys: readonly string[];
  readonly cause?: unknown;
  constructor(options: VariableRegistryErrorOptions);
}
type VariableSampleData = Record<string, JsonValue>;
interface VariableRegistry {
  readonly definitions: readonly RegistryVariableDefinition[];
  get(key: string): RegistryVariableDefinition | undefined;
  listByGroup(group: VariableGroup): readonly RegistryVariableDefinition[];
  listRequired(category?: TemplateCategory): readonly RegistryVariableDefinition[];
  detectUnknownKeys(keys: Iterable<string>): readonly string[];
  createSampleData(category?: TemplateCategory): VariableSampleData;
}
export declare function createVariableRegistry(definitions: readonly RegistryVariableDefinitionInput[]): VariableRegistry;
export declare const coreVariableRegistry: VariableRegistry;
export declare const coreVariableDefinitions: readonly {
  key: string;
  label: string;
  group: "custom" | "asset" | "tax_receipt" | "financial_report" | "invoice" | "organization" | "recipient" | "donation" | "document" | "missionary" | "statement" | "computed";
  type: "string" | "number" | "boolean" | "date" | "id" | "url" | "rich_text" | "currency" | "percentage" | "address" | "image_url";
  sampleValue: JsonValue;
  description: string;
  required: boolean;
  fallback: {
    mode: "none";
  } | {
    mode: "use_value";
    value: JsonValue;
  } | {
    mode: "omit";
  };
  formatter: string;
  privacy: "public" | "internal" | "pii" | "financial" | "sensitive";
  sourcePath: string;
  documentCategories: ("custom" | "donation_receipt" | "tax_receipt" | "annual_giving_statement" | "donor_letter" | "missionary_report" | "financial_report" | "invoice" | "certificate")[];
}[];
type VariableResolutionDiagnosticSeverity = 'warning' | 'error';
type VariableResolutionDiagnosticCode = 'invalid_variable_type' | 'invalid_variable_value' | 'missing_optional_value' | 'missing_required_value' | 'unknown_formatter' | 'unknown_variable';
interface VariableResolutionDiagnostic {
  readonly code: VariableResolutionDiagnosticCode;
  readonly severity: VariableResolutionDiagnosticSeverity;
  readonly message: string;
  readonly variableKey: string;
  readonly sourcePath?: string;
  readonly formatter?: string;
  readonly details?: Readonly<Record<string, unknown>>;
}
interface VariableFormatterOptions {
  readonly locale?: string;
  readonly currency?: string;
  readonly timeZone?: string;
}
interface NormalizedVariableFormatterOptions {
  readonly locale: string;
  readonly currency: string;
  readonly timeZone: string;
}
interface VariableFormatterContext extends NormalizedVariableFormatterOptions {
  readonly definition: RegistryVariableDefinition;
  readonly formatter: string;
}
interface VariableFormatResult {
  readonly formattedValue: string;
  readonly diagnostics: readonly VariableResolutionDiagnostic[];
}
type VariableFormatter = (value: unknown, context: VariableFormatterContext) => VariableFormatResult;
type VariableFormatterMap = Readonly<Record<string, VariableFormatter>>;
interface FormatVariableValueInput extends VariableFormatterOptions {
  readonly definition: RegistryVariableDefinition;
  readonly value: unknown;
  readonly formatter?: string;
  readonly formatters?: VariableFormatterMap;
}
export declare const defaultVariableFormatters: VariableFormatterMap;
export declare function normalizeVariableFormatterOptions(options?: VariableFormatterOptions): NormalizedVariableFormatterOptions;
export declare function formatVariableValue(input: FormatVariableValueInput): VariableFormatResult;
type VariableDataContext = Readonly<Record<string, unknown>>;
type VariableResolutionStatus = 'fallback' | 'invalid_type' | 'missing_optional' | 'missing_required' | 'resolved' | 'unknown_formatter' | 'unknown_variable';
interface VariablePathLookupResult {
  readonly found: boolean;
  readonly value?: unknown;
}
interface VariableResolutionRequest {
  readonly key: string;
  readonly formatter?: string;
  readonly fallback?: FallbackBehavior;
}
type VariableResolutionRequestInput = string | VariableResolutionRequest;
interface VariableResolverOptions extends VariableFormatterOptions {
  readonly registry?: VariableRegistry;
  readonly formatters?: VariableFormatterMap;
}
interface ResolveVariableValueInput extends VariableResolverOptions {
  readonly key: string;
  readonly context: VariableDataContext;
  readonly formatter?: string;
  readonly fallback?: FallbackBehavior;
}
interface ResolveVariableValuesInput extends VariableResolverOptions {
  readonly context: VariableDataContext;
  readonly variables: readonly VariableResolutionRequestInput[];
}
interface ResolvedVariableValue {
  readonly key: string;
  readonly sourcePath?: string;
  readonly formatter?: string;
  readonly status: VariableResolutionStatus;
  readonly rawValue?: unknown;
  readonly formattedValue: string;
  readonly definition?: RegistryVariableDefinition;
  readonly diagnostics: readonly VariableResolutionDiagnostic[];
}
interface ResolveVariableValuesResult {
  readonly values: readonly ResolvedVariableValue[];
  readonly diagnostics: readonly VariableResolutionDiagnostic[];
}
interface VariableResolver {
  resolve(variable: VariableResolutionRequestInput, context: VariableDataContext): ResolvedVariableValue;
  resolveMany(variables: readonly VariableResolutionRequestInput[], context: VariableDataContext): ResolveVariableValuesResult;
}
export declare function createVariableResolver(options?: VariableResolverOptions): VariableResolver;
export declare function resolveVariableValue(input: ResolveVariableValueInput): ResolvedVariableValue;
export declare function resolveVariableValues(input: ResolveVariableValuesInput): ResolveVariableValuesResult;
export declare function getValueAtDataPath(context: VariableDataContext, sourcePath: string): VariablePathLookupResult;
type CalculationOperation = 'average' | 'count' | 'max' | 'min' | 'sum';
type CalculationRoundingMode = 'half_away_from_zero';
interface CalculationPrecision {
  readonly scale?: number;
  readonly roundingMode?: CalculationRoundingMode;
}
type CalculationDiagnosticSeverity = 'error' | 'warning';
type CalculationDiagnosticCode = 'empty_calculation_source' | 'invalid_calculation_input' | 'invalid_table_calculation_binding' | 'missing_calculation_field' | 'missing_calculation_source' | 'missing_financial_category' | 'missing_table_total_column' | 'non_array_calculation_source' | 'non_numeric_calculation_value' | 'unknown_financial_category';
interface CalculationDiagnostic {
  readonly code: CalculationDiagnosticCode;
  readonly severity: CalculationDiagnosticSeverity;
  readonly message: string;
  readonly sourcePath?: string;
  readonly fieldPath?: string;
  readonly sourceIndex?: number;
  readonly details?: Readonly<Record<string, unknown>>;
}
interface CalculationDecimalValue {
  readonly decimal: string;
  readonly minorUnits: string;
  readonly scale: number;
  readonly count: number;
}
interface CalculateNumericAggregateInput {
  readonly context: VariableDataContext;
  readonly sourcePath: string;
  readonly valuePath?: string;
  readonly operation: CalculationOperation;
  readonly precision?: CalculationPrecision;
}
interface CalculateNumericAggregateResult {
  readonly operation: CalculationOperation;
  readonly sourcePath: string;
  readonly valuePath?: string;
  readonly value: CalculationDecimalValue | null;
  readonly diagnostics: readonly CalculationDiagnostic[];
}
interface CalculateTableTotalsInput {
  readonly context: VariableDataContext;
  readonly tableBinding: TableBindingInput;
  readonly precision?: CalculationPrecision;
}
interface CalculatedTableTotal {
  readonly columnKey: string;
  readonly label?: string;
  readonly operation: TableTotalBinding['operation'];
  readonly value: CalculationDecimalValue | null;
  readonly diagnostics: readonly CalculationDiagnostic[];
}
interface CalculateTableTotalsResult {
  readonly binding?: TableBinding;
  readonly totals: readonly CalculatedTableTotal[];
  readonly diagnostics: readonly CalculationDiagnostic[];
}
interface CalculateGroupedTableTotalsInput {
  readonly context: VariableDataContext;
  readonly sourcePath: string;
  readonly groupPath: string;
  readonly valuePath: string;
  readonly precision?: CalculationPrecision;
}
interface CalculatedTableGroupTotal {
  readonly key: string;
  readonly label: string;
  readonly total: CalculationDecimalValue;
  readonly diagnostics: readonly CalculationDiagnostic[];
}
interface CalculateGroupedTableTotalsResult {
  readonly groups: readonly CalculatedTableGroupTotal[];
  readonly grandTotal: CalculationDecimalValue;
  readonly diagnostics: readonly CalculationDiagnostic[];
}
interface CalculateInvoiceTotalsInput {
  readonly context: VariableDataContext;
  readonly lineItemsPath: string;
  readonly amountPath?: string;
  readonly quantityPath?: string;
  readonly ratePath?: string;
  readonly discountPath?: string;
  readonly taxPath?: string;
  readonly precision?: CalculationPrecision;
}
interface CalculateInvoiceTotalsResult {
  readonly subtotal: CalculationDecimalValue;
  readonly discounts: CalculationDecimalValue;
  readonly taxes: CalculationDecimalValue;
  readonly total: CalculationDecimalValue;
  readonly diagnostics: readonly CalculationDiagnostic[];
}
interface CalculateFinancialTotalsInput {
  readonly context: VariableDataContext;
  readonly sourcePath: string;
  readonly amountPath: string;
  readonly categoryPath: string;
  readonly incomeCategories: readonly string[];
  readonly expenseCategories: readonly string[];
  readonly precision?: CalculationPrecision;
}
interface CalculateFinancialTotalsResult {
  readonly income: CalculationDecimalValue;
  readonly expense: CalculationDecimalValue;
  readonly net: CalculationDecimalValue;
  readonly diagnostics: readonly CalculationDiagnostic[];
}
interface CalculateTaxDeductibleAmountInput {
  readonly contributionAmount: number | string;
  readonly goodsOrServicesValue?: number | string;
  readonly precision?: CalculationPrecision;
}
interface CalculateTaxDeductibleAmountResult {
  readonly value: CalculationDecimalValue;
  readonly diagnostics: readonly CalculationDiagnostic[];
}
export declare function calculateNumericAggregate(input: CalculateNumericAggregateInput): CalculateNumericAggregateResult;
export declare function calculateTableTotals(input: CalculateTableTotalsInput): CalculateTableTotalsResult;
export declare function calculateGroupedTableTotals(input: CalculateGroupedTableTotalsInput): CalculateGroupedTableTotalsResult;
export declare function calculateInvoiceTotals(input: CalculateInvoiceTotalsInput): CalculateInvoiceTotalsResult;
export declare function calculateFinancialTotals(input: CalculateFinancialTotalsInput): CalculateFinancialTotalsResult;
export declare function calculateTaxDeductibleAmount(input: CalculateTaxDeductibleAmountInput): CalculateTaxDeductibleAmountResult;
type ConditionalEvaluationDiagnosticCode = 'invalid_condition_value' | 'missing_condition_field';
type ConditionalEvaluationDiagnosticSeverity = 'error' | 'warning';
interface ConditionalEvaluationDiagnostic {
  readonly code: ConditionalEvaluationDiagnosticCode;
  readonly severity: ConditionalEvaluationDiagnosticSeverity;
  readonly message: string;
  readonly fieldPath: string;
  readonly operator: ConditionalRule['operator'];
  readonly details?: Readonly<Record<string, unknown>>;
}
interface EvaluateConditionalRuleInput {
  readonly rule: ConditionalRule;
  readonly context: VariableDataContext;
}
interface ConditionalRuleEvaluationResult {
  readonly fieldPath: string;
  readonly operator: ConditionalRule['operator'];
  readonly matched: boolean;
  readonly actualValue?: unknown;
  readonly expectedValue?: JsonValue;
  readonly diagnostics: readonly ConditionalEvaluationDiagnostic[];
}
interface EvaluateConditionalRulesInput {
  readonly rules: readonly ConditionalRule[];
  readonly context: VariableDataContext;
}
interface ConditionalRulesEvaluationResult {
  readonly matched: boolean;
  readonly results: readonly ConditionalRuleEvaluationResult[];
  readonly diagnostics: readonly ConditionalEvaluationDiagnostic[];
}
export declare function evaluateConditionalRule(input: EvaluateConditionalRuleInput): ConditionalRuleEvaluationResult;
export declare function evaluateConditionalRules(input: EvaluateConditionalRulesInput): ConditionalRulesEvaluationResult;
export declare const HeaderFooterPlacementSchema: z.ZodEnum<{
  header: "header";
  footer: "footer";
}>;
export declare const HeaderFooterScopeSchema: z.ZodEnum<{
  first_page: "first_page";
  repeating: "repeating";
}>;
export declare const HeaderFooterAlignmentSchema: z.ZodEnum<{
  left: "left";
  center: "center";
  right: "right";
}>;
export declare const HeaderFooterTextTokenSchema: z.ZodObject<{
  kind: z.ZodLiteral<"text">;
  text: z.ZodString;
}, z.core.$strict>;
export declare const HeaderFooterDocumentTitleTokenSchema: z.ZodObject<{
  kind: z.ZodLiteral<"document_title">;
}, z.core.$strict>;
export declare const HeaderFooterOrganizationFooterTokenSchema: z.ZodObject<{
  kind: z.ZodLiteral<"organization_footer">;
  fallbackText: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const HeaderFooterPageNumberTokenSchema: z.ZodObject<{
  kind: z.ZodLiteral<"page_number">;
}, z.core.$strict>;
export declare const HeaderFooterTotalPagesTokenSchema: z.ZodObject<{
  kind: z.ZodLiteral<"total_pages">;
}, z.core.$strict>;
export declare const HeaderFooterContentTokenSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
  kind: z.ZodLiteral<"text">;
  text: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
  kind: z.ZodLiteral<"document_title">;
}, z.core.$strict>, z.ZodObject<{
  kind: z.ZodLiteral<"organization_footer">;
  fallbackText: z.ZodOptional<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
  kind: z.ZodLiteral<"page_number">;
}, z.core.$strict>, z.ZodObject<{
  kind: z.ZodLiteral<"total_pages">;
}, z.core.$strict>], "kind">;
export declare const HeaderFooterRegionSchema: z.ZodObject<{
  id: z.ZodOptional<z.ZodString>;
  placement: z.ZodEnum<{
    header: "header";
    footer: "footer";
  }>;
  scope: z.ZodEnum<{
    first_page: "first_page";
    repeating: "repeating";
  }>;
  enabled: z.ZodDefault<z.ZodBoolean>;
  alignment: z.ZodDefault<z.ZodEnum<{
    left: "left";
    center: "center";
    right: "right";
  }>>;
  minimumMargin: z.ZodDefault<z.ZodString>;
  content: z.ZodDefault<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"text">;
    text: z.ZodString;
  }, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"document_title">;
  }, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"organization_footer">;
    fallbackText: z.ZodOptional<z.ZodString>;
  }, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"page_number">;
  }, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"total_pages">;
  }, z.core.$strict>], "kind">>>;
}, z.core.$strict>;
export declare const defaultDocumentHeaderFooterSettings: {
  regions: never[];
};
export declare const DocumentHeaderFooterSettingsSchema: z.ZodDefault<z.ZodObject<{
  regions: z.ZodDefault<z.ZodArray<z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    placement: z.ZodEnum<{
      header: "header";
      footer: "footer";
    }>;
    scope: z.ZodEnum<{
      first_page: "first_page";
      repeating: "repeating";
    }>;
    enabled: z.ZodDefault<z.ZodBoolean>;
    alignment: z.ZodDefault<z.ZodEnum<{
      left: "left";
      center: "center";
      right: "right";
    }>>;
    minimumMargin: z.ZodDefault<z.ZodString>;
    content: z.ZodDefault<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
      kind: z.ZodLiteral<"text">;
      text: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
      kind: z.ZodLiteral<"document_title">;
    }, z.core.$strict>, z.ZodObject<{
      kind: z.ZodLiteral<"organization_footer">;
      fallbackText: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
      kind: z.ZodLiteral<"page_number">;
    }, z.core.$strict>, z.ZodObject<{
      kind: z.ZodLiteral<"total_pages">;
    }, z.core.$strict>], "kind">>>;
  }, z.core.$strict>>>;
}, z.core.$strict>>;
type HeaderFooterPlacement = z.infer<typeof HeaderFooterPlacementSchema>;
type HeaderFooterScope = z.infer<typeof HeaderFooterScopeSchema>;
type HeaderFooterAlignment = z.infer<typeof HeaderFooterAlignmentSchema>;
type HeaderFooterTextToken = z.infer<typeof HeaderFooterTextTokenSchema>;
type HeaderFooterDocumentTitleToken = z.infer<typeof HeaderFooterDocumentTitleTokenSchema>;
type HeaderFooterOrganizationFooterToken = z.infer<typeof HeaderFooterOrganizationFooterTokenSchema>;
type HeaderFooterPageNumberToken = z.infer<typeof HeaderFooterPageNumberTokenSchema>;
type HeaderFooterTotalPagesToken = z.infer<typeof HeaderFooterTotalPagesTokenSchema>;
type HeaderFooterContentToken = z.infer<typeof HeaderFooterContentTokenSchema>;
type HeaderFooterContentTokenInput = z.input<typeof HeaderFooterContentTokenSchema>;
type HeaderFooterRegion = z.infer<typeof HeaderFooterRegionSchema>;
type HeaderFooterRegionInput = z.input<typeof HeaderFooterRegionSchema>;
type DocumentHeaderFooterSettings = z.infer<typeof DocumentHeaderFooterSettingsSchema>;
type DocumentHeaderFooterSettingsInput = z.input<typeof DocumentHeaderFooterSettingsSchema>;
export declare const TemplateLifecycleStatusSchema: z.ZodEnum<{
  draft: "draft";
  published: "published";
  archived: "archived";
}>;
type TemplateLifecycleStatus = z.infer<typeof TemplateLifecycleStatusSchema>;
export declare const TemplateLifecycleEventSchema: z.ZodEnum<{
  published: "published";
  archived: "archived";
  created: "created";
  updated: "updated";
  restored: "restored";
  duplicated: "duplicated";
}>;
type TemplateLifecycleEvent = z.infer<typeof TemplateLifecycleEventSchema>;
export declare const TemplateLifecycleCheckStatusSchema: z.ZodEnum<{
  not_run: "not_run";
  passed: "passed";
  warning: "warning";
  failed: "failed";
}>;
type TemplateLifecycleCheckStatus = z.infer<typeof TemplateLifecycleCheckStatusSchema>;
export declare const TemplateLifecycleCheckSchema: z.ZodObject<{
  status: z.ZodDefault<z.ZodEnum<{
    not_run: "not_run";
    passed: "passed";
    warning: "warning";
    failed: "failed";
  }>>;
  checkedAt: z.ZodOptional<z.ZodString>;
  diagnosticCount: z.ZodDefault<z.ZodNumber>;
  errorCount: z.ZodDefault<z.ZodNumber>;
  warningCount: z.ZodDefault<z.ZodNumber>;
  summary: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
}, z.core.$strict>;
type TemplateLifecycleCheck = z.infer<typeof TemplateLifecycleCheckSchema>;
type TemplateLifecycleCheckInput = z.input<typeof TemplateLifecycleCheckSchema>;
export declare const TemplateLifecycleEngineMetadataSchema: z.ZodObject<{
  engine: z.ZodDefault<z.ZodEnum<{
    asym_pdf_document_builder: "asym_pdf_document_builder";
    unlayer: "unlayer";
  }>>;
  schemaVersion: z.ZodDefault<z.ZodNumber>;
  legacyTemplateId: z.ZodOptional<z.ZodString>;
  migrationId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
type TemplateLifecycleEngineMetadata = z.infer<typeof TemplateLifecycleEngineMetadataSchema>;
type TemplateLifecycleEngineMetadataInput = z.input<typeof TemplateLifecycleEngineMetadataSchema>;
export declare const TemplateLifecycleChangelogEntrySchema: z.ZodObject<{
  id: z.ZodString;
  event: z.ZodEnum<{
    published: "published";
    archived: "archived";
    created: "created";
    updated: "updated";
    restored: "restored";
    duplicated: "duplicated";
  }>;
  at: z.ZodString;
  actorId: z.ZodOptional<z.ZodString>;
  message: z.ZodOptional<z.ZodString>;
  changes: z.ZodDefault<z.ZodArray<z.ZodString>>;
  metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
}, z.core.$strict>;
type TemplateLifecycleChangelogEntry = z.infer<typeof TemplateLifecycleChangelogEntrySchema>;
export declare const TemplateLifecycleRecordV1Schema: z.ZodObject<{
  version: z.ZodLiteral<1>;
  templateId: z.ZodString;
  status: z.ZodDefault<z.ZodEnum<{
    draft: "draft";
    published: "published";
    archived: "archived";
  }>>;
  currentDraftId: z.ZodOptional<z.ZodString>;
  currentDraftVersion: z.ZodDefault<z.ZodNumber>;
  latestVersion: z.ZodDefault<z.ZodNumber>;
  currentPublishedVersion: z.ZodOptional<z.ZodNumber>;
  currentPublishedSnapshotId: z.ZodOptional<z.ZodString>;
  engine: z.ZodObject<{
    engine: z.ZodDefault<z.ZodEnum<{
      asym_pdf_document_builder: "asym_pdf_document_builder";
      unlayer: "unlayer";
    }>>;
    schemaVersion: z.ZodDefault<z.ZodNumber>;
    legacyTemplateId: z.ZodOptional<z.ZodString>;
    migrationId: z.ZodOptional<z.ZodString>;
  }, z.core.$strict>;
  validation: z.ZodDefault<z.ZodObject<{
    status: z.ZodDefault<z.ZodEnum<{
      not_run: "not_run";
      passed: "passed";
      warning: "warning";
      failed: "failed";
    }>>;
    checkedAt: z.ZodOptional<z.ZodString>;
    diagnosticCount: z.ZodDefault<z.ZodNumber>;
    errorCount: z.ZodDefault<z.ZodNumber>;
    warningCount: z.ZodDefault<z.ZodNumber>;
    summary: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>>;
  preflight: z.ZodDefault<z.ZodObject<{
    status: z.ZodDefault<z.ZodEnum<{
      not_run: "not_run";
      passed: "passed";
      warning: "warning";
      failed: "failed";
    }>>;
    checkedAt: z.ZodOptional<z.ZodString>;
    diagnosticCount: z.ZodDefault<z.ZodNumber>;
    errorCount: z.ZodDefault<z.ZodNumber>;
    warningCount: z.ZodDefault<z.ZodNumber>;
    summary: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>>;
  createdAt: z.ZodString;
  updatedAt: z.ZodString;
  publishedAt: z.ZodOptional<z.ZodString>;
  archivedAt: z.ZodOptional<z.ZodString>;
  restoredAt: z.ZodOptional<z.ZodString>;
  createdByActorId: z.ZodOptional<z.ZodString>;
  updatedByActorId: z.ZodOptional<z.ZodString>;
  publishedByActorId: z.ZodOptional<z.ZodString>;
  archivedByActorId: z.ZodOptional<z.ZodString>;
  restoredByActorId: z.ZodOptional<z.ZodString>;
  changelog: z.ZodDefault<z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    event: z.ZodEnum<{
      published: "published";
      archived: "archived";
      created: "created";
      updated: "updated";
      restored: "restored";
      duplicated: "duplicated";
    }>;
    at: z.ZodString;
    actorId: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
    changes: z.ZodDefault<z.ZodArray<z.ZodString>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>>>;
}, z.core.$strict>;
type TemplateLifecycleRecordV1 = z.infer<typeof TemplateLifecycleRecordV1Schema>;
export declare const PublishedTemplateSnapshotV1Schema: z.ZodObject<{
  version: z.ZodLiteral<1>;
  id: z.ZodString;
  templateId: z.ZodString;
  templateVersion: z.ZodNumber;
  status: z.ZodLiteral<"published">;
  immutable: z.ZodLiteral<true>;
  template: z.ZodObject<{
    version: z.ZodLiteral<1>;
    id: z.ZodString;
    name: z.ZodString;
    category: z.ZodEnum<{
      custom: "custom";
      donation_receipt: "donation_receipt";
      tax_receipt: "tax_receipt";
      annual_giving_statement: "annual_giving_statement";
      donor_letter: "donor_letter";
      missionary_report: "missionary_report";
      financial_report: "financial_report";
      invoice: "invoice";
      certificate: "certificate";
    }>;
    engine: z.ZodDefault<z.ZodEnum<{
      asym_pdf_document_builder: "asym_pdf_document_builder";
      unlayer: "unlayer";
    }>>;
    status: z.ZodDefault<z.ZodEnum<{
      draft: "draft";
      published: "published";
      archived: "archived";
    }>>;
    pageSettings: z.ZodDefault<z.ZodObject<{
      pageSize: z.ZodDefault<z.ZodEnum<{
        custom: "custom";
        letter: "letter";
        a4: "a4";
        legal: "legal";
      }>>;
      orientation: z.ZodDefault<z.ZodEnum<{
        portrait: "portrait";
        landscape: "landscape";
      }>>;
      margins: z.ZodDefault<z.ZodObject<{
        top: z.ZodDefault<z.ZodString>;
        right: z.ZodDefault<z.ZodString>;
        bottom: z.ZodDefault<z.ZodString>;
        left: z.ZodDefault<z.ZodString>;
      }, z.core.$strict>>;
      customSize: z.ZodOptional<z.ZodObject<{
        width: z.ZodNumber;
        height: z.ZodNumber;
        unit: z.ZodDefault<z.ZodEnum<{
          in: "in";
          cm: "cm";
          mm: "mm";
          pt: "pt";
          px: "px";
        }>>;
      }, z.core.$strict>>;
      headerFooter: z.ZodDefault<z.ZodObject<{
        regions: z.ZodDefault<z.ZodArray<z.ZodObject<{
          id: z.ZodOptional<z.ZodString>;
          placement: z.ZodEnum<{
            header: "header";
            footer: "footer";
          }>;
          scope: z.ZodEnum<{
            first_page: "first_page";
            repeating: "repeating";
          }>;
          enabled: z.ZodDefault<z.ZodBoolean>;
          alignment: z.ZodDefault<z.ZodEnum<{
            left: "left";
            center: "center";
            right: "right";
          }>>;
          minimumMargin: z.ZodDefault<z.ZodString>;
          content: z.ZodDefault<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"text">;
            text: z.ZodString;
          }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"document_title">;
          }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"organization_footer">;
            fallbackText: z.ZodOptional<z.ZodString>;
          }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"page_number">;
          }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"total_pages">;
          }, z.core.$strict>], "kind">>>;
        }, z.core.$strict>>>;
      }, z.core.$strict>>;
    }, z.core.$strict>>;
    theme: z.ZodDefault<z.ZodObject<{
      name: z.ZodDefault<z.ZodString>;
      branding: z.ZodDefault<z.ZodObject<{
        source: z.ZodDefault<z.ZodEnum<{
          system_default: "system_default";
          tenant_default: "tenant_default";
          template_override: "template_override";
        }>>;
        tenantBrandId: z.ZodOptional<z.ZodString>;
        overriddenFields: z.ZodDefault<z.ZodArray<z.ZodEnum<{
          organization_name: "organization_name";
          logo_asset: "logo_asset";
          primary_color: "primary_color";
          accent_color: "accent_color";
          text_color: "text_color";
          background_color: "background_color";
          heading_font: "heading_font";
          body_font: "body_font";
          fallback_fonts: "fallback_fonts";
          footer_text: "footer_text";
          receipt_defaults: "receipt_defaults";
        }>>>;
      }, z.core.$strict>>;
      organization: z.ZodDefault<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        legalName: z.ZodOptional<z.ZodString>;
        websiteUrl: z.ZodOptional<z.ZodString>;
      }, z.core.$strict>>;
      colors: z.ZodDefault<z.ZodObject<{
        primary: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
        accent: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
        text: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
        background: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
      }, z.core.$strict>>;
      fonts: z.ZodDefault<z.ZodObject<{
        body: z.ZodDefault<z.ZodString>;
        heading: z.ZodDefault<z.ZodString>;
        fallback: z.ZodDefault<z.ZodArray<z.ZodString>>;
      }, z.core.$strict>>;
      logoAsset: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        role: z.ZodEnum<{
          logo: "logo";
          image: "image";
          signature: "signature";
          font: "font";
          qr: "qr";
          attachment: "attachment";
        }>;
        assetId: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodString>;
        renderSafeUrl: z.ZodOptional<z.ZodString>;
        mimeType: z.ZodOptional<z.ZodString>;
        altText: z.ZodOptional<z.ZodString>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
        alignment: z.ZodDefault<z.ZodEnum<{
          left: "left";
          center: "center";
          right: "right";
          full_width: "full_width";
        }>>;
        linkUrl: z.ZodOptional<z.ZodString>;
        renderSafe: z.ZodDefault<z.ZodBoolean>;
        required: z.ZodDefault<z.ZodBoolean>;
        tenantId: z.ZodOptional<z.ZodString>;
        source: z.ZodOptional<z.ZodObject<{
          provider: z.ZodOptional<z.ZodString>;
          sourceId: z.ZodOptional<z.ZodString>;
          version: z.ZodOptional<z.ZodString>;
          checksum: z.ZodOptional<z.ZodString>;
          uploadedBy: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
      }, z.core.$strict>>;
      logoAssetId: z.ZodOptional<z.ZodString>;
      footerText: z.ZodOptional<z.ZodString>;
      receiptDefaults: z.ZodDefault<z.ZodObject<{
        thankYouMessage: z.ZodOptional<z.ZodString>;
        taxLanguage: z.ZodOptional<z.ZodString>;
        goodsServicesStatement: z.ZodOptional<z.ZodString>;
      }, z.core.$strict>>;
    }, z.core.$strict>>;
    pdfSettings: z.ZodDefault<z.ZodObject<{
      metadata: z.ZodDefault<z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        subject: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodString>;
        organization: z.ZodOptional<z.ZodString>;
        language: z.ZodDefault<z.ZodString>;
        keywords: z.ZodDefault<z.ZodArray<z.ZodString>>;
      }, z.core.$strict>>;
      profile: z.ZodDefault<z.ZodObject<{
        profile: z.ZodOptional<z.ZodEnum<{
          "PDF/A-1a": "PDF/A-1a";
          "PDF/A-1a+PDF/UA-1": "PDF/A-1a+PDF/UA-1";
          "PDF/A-1b": "PDF/A-1b";
          "PDF/A-2a": "PDF/A-2a";
          "PDF/A-2a+PDF/UA-1": "PDF/A-2a+PDF/UA-1";
          "PDF/A-2b": "PDF/A-2b";
          "PDF/A-3a": "PDF/A-3a";
          "PDF/A-3a+PDF/UA-1": "PDF/A-3a+PDF/UA-1";
          "PDF/A-3b": "PDF/A-3b";
          "PDF/UA-1": "PDF/UA-1";
        }>>;
      }, z.core.$strict>>;
    }, z.core.$strict>>;
    content: z.ZodObject<{
      type: z.ZodLiteral<"doc">;
      content: z.ZodDefault<z.ZodArray<z.ZodType<DocumentContentNode, unknown, z.core.$ZodTypeInternals<DocumentContentNode, unknown>>>>;
    }, z.core.$strict>;
    variables: z.ZodDefault<z.ZodArray<z.ZodObject<{
      key: z.ZodString;
      label: z.ZodString;
      group: z.ZodEnum<{
        custom: "custom";
        asset: "asset";
        tax_receipt: "tax_receipt";
        financial_report: "financial_report";
        invoice: "invoice";
        organization: "organization";
        recipient: "recipient";
        donation: "donation";
        document: "document";
        missionary: "missionary";
        statement: "statement";
        computed: "computed";
      }>;
      description: z.ZodOptional<z.ZodString>;
      type: z.ZodEnum<{
        string: "string";
        number: "number";
        boolean: "boolean";
        date: "date";
        id: "id";
        url: "url";
        rich_text: "rich_text";
        currency: "currency";
        percentage: "percentage";
        address: "address";
        image_url: "image_url";
      }>;
      sampleValue: z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>;
      required: z.ZodDefault<z.ZodBoolean>;
      fallback: z.ZodDefault<z.ZodDiscriminatedUnion<[z.ZodObject<{
        mode: z.ZodLiteral<"none">;
      }, z.core.$strip>, z.ZodObject<{
        mode: z.ZodLiteral<"use_value">;
        value: z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>;
      }, z.core.$strip>, z.ZodObject<{
        mode: z.ZodLiteral<"omit">;
      }, z.core.$strip>], "mode">>;
      formatter: z.ZodOptional<z.ZodString>;
      privacy: z.ZodDefault<z.ZodEnum<{
        public: "public";
        internal: "internal";
        pii: "pii";
        financial: "financial";
        sensitive: "sensitive";
      }>>;
      sourcePath: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>>;
    dataBindings: z.ZodDefault<z.ZodArray<z.ZodObject<{
      id: z.ZodString;
      variableKey: z.ZodString;
      sourcePath: z.ZodString;
      required: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>>>;
    conditionalRules: z.ZodDefault<z.ZodArray<z.ZodObject<{
      id: z.ZodOptional<z.ZodString>;
      fieldPath: z.ZodString;
      operator: z.ZodEnum<{
        in: "in";
        exists: "exists";
        not_exists: "not_exists";
        equals: "equals";
        not_equals: "not_equals";
        greater_than: "greater_than";
        greater_than_or_equal: "greater_than_or_equal";
        less_than: "less_than";
        less_than_or_equal: "less_than_or_equal";
        contains: "contains";
        not_contains: "not_contains";
        is_empty: "is_empty";
        is_not_empty: "is_not_empty";
        not_in: "not_in";
      }>;
      value: z.ZodOptional<z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>;
    }, z.core.$strict>>>;
    repeaterBindings: z.ZodDefault<z.ZodArray<z.ZodObject<{
      id: z.ZodString;
      sourcePath: z.ZodString;
      itemAlias: z.ZodString;
      indexAlias: z.ZodOptional<z.ZodString>;
      emptyState: z.ZodOptional<z.ZodString>;
      filters: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        fieldPath: z.ZodString;
        operator: z.ZodEnum<{
          in: "in";
          exists: "exists";
          not_exists: "not_exists";
          equals: "equals";
          not_equals: "not_equals";
          greater_than: "greater_than";
          greater_than_or_equal: "greater_than_or_equal";
          less_than: "less_than";
          less_than_or_equal: "less_than_or_equal";
          contains: "contains";
          not_contains: "not_contains";
          is_empty: "is_empty";
          is_not_empty: "is_not_empty";
          not_in: "not_in";
        }>;
        value: z.ZodOptional<z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>;
      }, z.core.$strict>>>;
      maxItems: z.ZodDefault<z.ZodNumber>;
      sort: z.ZodOptional<z.ZodObject<{
        fieldPath: z.ZodString;
        direction: z.ZodDefault<z.ZodEnum<{
          asc: "asc";
          desc: "desc";
        }>>;
      }, z.core.$strict>>;
    }, z.core.$strict>>>;
    tableBindings: z.ZodDefault<z.ZodArray<z.ZodObject<{
      id: z.ZodString;
      sourcePath: z.ZodString;
      columns: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        label: z.ZodString;
        sourcePath: z.ZodString;
        type: z.ZodDefault<z.ZodEnum<{
          string: "string";
          number: "number";
          boolean: "boolean";
          date: "date";
          id: "id";
          url: "url";
          rich_text: "rich_text";
          currency: "currency";
          percentage: "percentage";
          address: "address";
          image_url: "image_url";
        }>>;
        formatter: z.ZodOptional<z.ZodString>;
        width: z.ZodOptional<z.ZodString>;
        align: z.ZodDefault<z.ZodEnum<{
          left: "left";
          center: "center";
          right: "right";
        }>>;
      }, z.core.$strict>>;
      emptyState: z.ZodOptional<z.ZodString>;
      grouping: z.ZodOptional<z.ZodObject<{
        fieldPath: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
      }, z.core.$strict>>;
      repeatHeader: z.ZodDefault<z.ZodBoolean>;
      avoidRowSplit: z.ZodDefault<z.ZodBoolean>;
      maxRows: z.ZodDefault<z.ZodNumber>;
      totals: z.ZodDefault<z.ZodArray<z.ZodObject<{
        columnKey: z.ZodString;
        operation: z.ZodEnum<{
          sum: "sum";
          count: "count";
        }>;
        label: z.ZodOptional<z.ZodString>;
      }, z.core.$strict>>>;
    }, z.core.$strict>>>;
    summaryBlockBindings: z.ZodDefault<z.ZodArray<z.ZodObject<{
      id: z.ZodString;
      title: z.ZodOptional<z.ZodString>;
      formatter: z.ZodDefault<z.ZodString>;
      precision: z.ZodOptional<z.ZodObject<{
        scale: z.ZodOptional<z.ZodNumber>;
        roundingMode: z.ZodOptional<z.ZodLiteral<"half_away_from_zero">>;
      }, z.core.$strict>>;
      calculation: z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"total_contributions">;
        sourcePath: z.ZodString;
        amountPath: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
      }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"table_total">;
        tableBindingId: z.ZodString;
        columnKey: z.ZodString;
        operation: z.ZodOptional<z.ZodEnum<{
          sum: "sum";
          count: "count";
        }>>;
        label: z.ZodOptional<z.ZodString>;
      }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"invoice_totals">;
        lineItemsPath: z.ZodString;
        amountPath: z.ZodOptional<z.ZodString>;
        quantityPath: z.ZodOptional<z.ZodString>;
        ratePath: z.ZodOptional<z.ZodString>;
        discountPath: z.ZodOptional<z.ZodString>;
        taxPath: z.ZodOptional<z.ZodString>;
        fields: z.ZodDefault<z.ZodArray<z.ZodEnum<{
          subtotal: "subtotal";
          discounts: "discounts";
          taxes: "taxes";
          total: "total";
        }>>>;
        labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
      }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"financial_report_totals">;
        sourcePath: z.ZodString;
        amountPath: z.ZodString;
        categoryPath: z.ZodString;
        incomeCategories: z.ZodArray<z.ZodString>;
        expenseCategories: z.ZodArray<z.ZodString>;
        fields: z.ZodDefault<z.ZodArray<z.ZodEnum<{
          income: "income";
          expense: "expense";
          net: "net";
        }>>>;
        labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
      }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"grouped_subtotals">;
        sourcePath: z.ZodString;
        groupPath: z.ZodString;
        valuePath: z.ZodString;
        includeGrandTotal: z.ZodDefault<z.ZodBoolean>;
        labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        grandTotalLabel: z.ZodOptional<z.ZodString>;
      }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"grand_total">;
        sourcePath: z.ZodString;
        groupPath: z.ZodString;
        valuePath: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
      }, z.core.$strict>], "type">;
    }, z.core.$strict>>>;
    placeholderBindings: z.ZodDefault<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
      id: z.ZodString;
      label: z.ZodOptional<z.ZodString>;
      required: z.ZodDefault<z.ZodBoolean>;
      adapterKey: z.ZodOptional<z.ZodString>;
      dataPath: z.ZodOptional<z.ZodString>;
      description: z.ZodOptional<z.ZodString>;
      kind: z.ZodLiteral<"text_field">;
      placeholderText: z.ZodOptional<z.ZodString>;
      maxLength: z.ZodOptional<z.ZodNumber>;
      multiline: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>, z.ZodObject<{
      id: z.ZodString;
      label: z.ZodOptional<z.ZodString>;
      required: z.ZodDefault<z.ZodBoolean>;
      adapterKey: z.ZodOptional<z.ZodString>;
      dataPath: z.ZodOptional<z.ZodString>;
      description: z.ZodOptional<z.ZodString>;
      kind: z.ZodLiteral<"checkbox">;
      checkedByDefault: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>, z.ZodObject<{
      id: z.ZodString;
      label: z.ZodOptional<z.ZodString>;
      required: z.ZodDefault<z.ZodBoolean>;
      adapterKey: z.ZodOptional<z.ZodString>;
      dataPath: z.ZodOptional<z.ZodString>;
      description: z.ZodOptional<z.ZodString>;
      kind: z.ZodLiteral<"signature">;
      signerRole: z.ZodOptional<z.ZodEnum<{
        custom: "custom";
        organization: "organization";
        recipient: "recipient";
        witness: "witness";
        staff: "staff";
      }>>;
      width: z.ZodOptional<z.ZodNumber>;
      height: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>, z.ZodObject<{
      id: z.ZodString;
      label: z.ZodOptional<z.ZodString>;
      required: z.ZodDefault<z.ZodBoolean>;
      adapterKey: z.ZodOptional<z.ZodString>;
      dataPath: z.ZodOptional<z.ZodString>;
      description: z.ZodOptional<z.ZodString>;
      kind: z.ZodLiteral<"initials">;
      signerRole: z.ZodOptional<z.ZodEnum<{
        custom: "custom";
        organization: "organization";
        recipient: "recipient";
        witness: "witness";
        staff: "staff";
      }>>;
      width: z.ZodOptional<z.ZodNumber>;
      height: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>, z.ZodObject<{
      id: z.ZodString;
      label: z.ZodOptional<z.ZodString>;
      required: z.ZodDefault<z.ZodBoolean>;
      adapterKey: z.ZodOptional<z.ZodString>;
      dataPath: z.ZodOptional<z.ZodString>;
      description: z.ZodOptional<z.ZodString>;
      kind: z.ZodLiteral<"qr">;
      payload: z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"url">;
        value: z.ZodString;
      }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"text">;
        value: z.ZodString;
      }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"variable">;
        key: z.ZodString;
      }, z.core.$strict>], "type">;
      size: z.ZodOptional<z.ZodNumber>;
      errorCorrectionLevel: z.ZodOptional<z.ZodEnum<{
        low: "low";
        medium: "medium";
        quartile: "quartile";
        high: "high";
      }>>;
    }, z.core.$strict>, z.ZodObject<{
      id: z.ZodString;
      label: z.ZodOptional<z.ZodString>;
      required: z.ZodDefault<z.ZodBoolean>;
      adapterKey: z.ZodOptional<z.ZodString>;
      dataPath: z.ZodOptional<z.ZodString>;
      description: z.ZodOptional<z.ZodString>;
      kind: z.ZodLiteral<"date">;
      dateFormat: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>], "kind">>>;
    assets: z.ZodDefault<z.ZodArray<z.ZodObject<{
      id: z.ZodString;
      role: z.ZodEnum<{
        logo: "logo";
        image: "image";
        signature: "signature";
        font: "font";
        qr: "qr";
        attachment: "attachment";
      }>;
      assetId: z.ZodOptional<z.ZodString>;
      url: z.ZodOptional<z.ZodString>;
      renderSafeUrl: z.ZodOptional<z.ZodString>;
      mimeType: z.ZodOptional<z.ZodString>;
      altText: z.ZodOptional<z.ZodString>;
      width: z.ZodOptional<z.ZodNumber>;
      height: z.ZodOptional<z.ZodNumber>;
      alignment: z.ZodDefault<z.ZodEnum<{
        left: "left";
        center: "center";
        right: "right";
        full_width: "full_width";
      }>>;
      linkUrl: z.ZodOptional<z.ZodString>;
      renderSafe: z.ZodDefault<z.ZodBoolean>;
      required: z.ZodDefault<z.ZodBoolean>;
      tenantId: z.ZodOptional<z.ZodString>;
      source: z.ZodOptional<z.ZodObject<{
        provider: z.ZodOptional<z.ZodString>;
        sourceId: z.ZodOptional<z.ZodString>;
        version: z.ZodOptional<z.ZodString>;
        checksum: z.ZodOptional<z.ZodString>;
        uploadedBy: z.ZodOptional<z.ZodString>;
      }, z.core.$strict>>;
    }, z.core.$strict>>>;
    metadata: z.ZodDefault<z.ZodObject<{
      description: z.ZodOptional<z.ZodString>;
      tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
      createdAt: z.ZodOptional<z.ZodString>;
      updatedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
  }, z.core.$strict>;
  engine: z.ZodObject<{
    engine: z.ZodDefault<z.ZodEnum<{
      asym_pdf_document_builder: "asym_pdf_document_builder";
      unlayer: "unlayer";
    }>>;
    schemaVersion: z.ZodDefault<z.ZodNumber>;
    legacyTemplateId: z.ZodOptional<z.ZodString>;
    migrationId: z.ZodOptional<z.ZodString>;
  }, z.core.$strict>;
  validation: z.ZodObject<{
    status: z.ZodDefault<z.ZodEnum<{
      not_run: "not_run";
      passed: "passed";
      warning: "warning";
      failed: "failed";
    }>>;
    checkedAt: z.ZodOptional<z.ZodString>;
    diagnosticCount: z.ZodDefault<z.ZodNumber>;
    errorCount: z.ZodDefault<z.ZodNumber>;
    warningCount: z.ZodDefault<z.ZodNumber>;
    summary: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>;
  preflight: z.ZodObject<{
    status: z.ZodDefault<z.ZodEnum<{
      not_run: "not_run";
      passed: "passed";
      warning: "warning";
      failed: "failed";
    }>>;
    checkedAt: z.ZodOptional<z.ZodString>;
    diagnosticCount: z.ZodDefault<z.ZodNumber>;
    errorCount: z.ZodDefault<z.ZodNumber>;
    warningCount: z.ZodDefault<z.ZodNumber>;
    summary: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>;
  publishedAt: z.ZodString;
  publishedByActorId: z.ZodOptional<z.ZodString>;
  changelog: z.ZodDefault<z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    event: z.ZodEnum<{
      published: "published";
      archived: "archived";
      created: "created";
      updated: "updated";
      restored: "restored";
      duplicated: "duplicated";
    }>;
    at: z.ZodString;
    actorId: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
    changes: z.ZodDefault<z.ZodArray<z.ZodString>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>>>;
}, z.core.$strict>;
type PublishedTemplateSnapshotV1 = z.infer<typeof PublishedTemplateSnapshotV1Schema>;
interface CreateTemplateLifecycleInput {
  readonly template: unknown;
  readonly now: string;
  readonly actorId?: string;
  readonly draftId?: string;
  readonly engine?: TemplateLifecycleEngineMetadataInput;
  readonly changelogMessage?: string;
}
interface PublishTemplateVersionInput {
  readonly lifecycle: TemplateLifecycleRecordV1;
  readonly draft: unknown;
  readonly now: string;
  readonly actorId?: string;
  readonly snapshotId?: string;
  readonly validation: TemplateLifecycleCheckInput;
  readonly preflight: TemplateLifecycleCheckInput;
  readonly changelogMessage?: string;
}
interface PublishTemplateVersionResult {
  readonly lifecycle: TemplateLifecycleRecordV1;
  readonly snapshot: PublishedTemplateSnapshotV1;
}
interface UpdateTemplateDraftInput {
  readonly lifecycle: TemplateLifecycleRecordV1;
  readonly template: unknown;
  readonly now: string;
  readonly actorId?: string;
  readonly draftId?: string;
  readonly changelogMessage?: string;
}
interface UpdateTemplateDraftResult {
  readonly lifecycle: TemplateLifecycleRecordV1;
  readonly draft: DocumentTemplateV1;
}
interface DuplicateTemplateLifecycleInput {
  readonly sourceLifecycle: TemplateLifecycleRecordV1;
  readonly sourceTemplate: unknown;
  readonly newTemplateId: string;
  readonly now: string;
  readonly actorId?: string;
  readonly name?: string;
  readonly draftId?: string;
  readonly changelogMessage?: string;
}
interface DuplicateTemplateLifecycleResult {
  readonly lifecycle: TemplateLifecycleRecordV1;
  readonly draft: DocumentTemplateV1;
}
interface ArchiveTemplateLifecycleInput {
  readonly lifecycle: TemplateLifecycleRecordV1;
  readonly now: string;
  readonly actorId?: string;
  readonly changelogMessage?: string;
}
interface RestoreTemplateLifecycleInput {
  readonly lifecycle: TemplateLifecycleRecordV1;
  readonly now: string;
  readonly actorId?: string;
  readonly changelogMessage?: string;
}
export declare function createTemplateLifecycle(input: CreateTemplateLifecycleInput): TemplateLifecycleRecordV1;
export declare function publishTemplateVersion(input: PublishTemplateVersionInput): PublishTemplateVersionResult;
export declare function updateTemplateDraft(input: UpdateTemplateDraftInput): UpdateTemplateDraftResult;
export declare function duplicateTemplateLifecycle(input: DuplicateTemplateLifecycleInput): DuplicateTemplateLifecycleResult;
export declare function archiveTemplateLifecycle(input: ArchiveTemplateLifecycleInput): TemplateLifecycleRecordV1;
export declare function restoreTemplateLifecycle(input: RestoreTemplateLifecycleInput): TemplateLifecycleRecordV1;
export declare function assertProductionRenderableTemplateSnapshot(snapshot: unknown): PublishedTemplateSnapshotV1;
export declare function isProductionRenderableTemplateSnapshot(snapshot: unknown): snapshot is PublishedTemplateSnapshotV1;
export declare const LegacyPdfTemplateArtifactSchema: z.ZodObject<{
  artifactId: z.ZodString;
  location: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"storage">;
    storageKey: z.ZodString;
  }, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"url">;
    url: z.ZodString;
  }, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"adapter_reference">;
    reference: z.ZodString;
  }, z.core.$strict>], "type">>;
  createdAt: z.ZodOptional<z.ZodString>;
  metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
}, z.core.$strict>;
type LegacyPdfTemplateArtifact = z.infer<typeof LegacyPdfTemplateArtifactSchema>;
type LegacyPdfTemplateArtifactInput = z.input<typeof LegacyPdfTemplateArtifactSchema>;
export declare const LegacyPdfTemplateReferenceSchema: z.ZodObject<{
  engine: z.ZodLiteral<"unlayer">;
  legacyTemplateId: z.ZodString;
  tenantId: z.ZodOptional<z.ZodString>;
  name: z.ZodString;
  category: z.ZodOptional<z.ZodEnum<{
    custom: "custom";
    donation_receipt: "donation_receipt";
    tax_receipt: "tax_receipt";
    annual_giving_statement: "annual_giving_statement";
    donor_letter: "donor_letter";
    missionary_report: "missionary_report";
    financial_report: "financial_report";
    invoice: "invoice";
    certificate: "certificate";
  }>>;
  sourceSystem: z.ZodDefault<z.ZodString>;
  designJsonRef: z.ZodOptional<z.ZodString>;
  htmlArtifactRef: z.ZodOptional<z.ZodString>;
  pdfArtifacts: z.ZodDefault<z.ZodArray<z.ZodObject<{
    artifactId: z.ZodString;
    location: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
      type: z.ZodLiteral<"storage">;
      storageKey: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
      type: z.ZodLiteral<"url">;
      url: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
      type: z.ZodLiteral<"adapter_reference">;
      reference: z.ZodString;
    }, z.core.$strict>], "type">>;
    createdAt: z.ZodOptional<z.ZodString>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>>>;
  metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
}, z.core.$strict>;
type LegacyPdfTemplateReference = z.infer<typeof LegacyPdfTemplateReferenceSchema>;
type LegacyPdfTemplateReferenceInput = z.input<typeof LegacyPdfTemplateReferenceSchema>;
export declare const UnlayerUnsupportedFeatureCodeSchema: z.ZodEnum<{
  custom_javascript: "custom_javascript";
  custom_css: "custom_css";
  dynamic_data_source: "dynamic_data_source";
  ecommerce_block: "ecommerce_block";
  external_font: "external_font";
  form_submission: "form_submission";
  provider_specific_asset: "provider_specific_asset";
  raw_html_block: "raw_html_block";
  unsupported_merge_tag: "unsupported_merge_tag";
  unknown_block: "unknown_block";
  video_block: "video_block";
}>;
type UnlayerUnsupportedFeatureCode = z.infer<typeof UnlayerUnsupportedFeatureCodeSchema>;
export declare const UnlayerMigrationSeveritySchema: z.ZodEnum<{
  error: "error";
  warning: "warning";
  info: "info";
}>;
type UnlayerMigrationSeverity = z.infer<typeof UnlayerMigrationSeveritySchema>;
export declare const UnlayerUnsupportedFeatureSchema: z.ZodObject<{
  code: z.ZodEnum<{
    custom_javascript: "custom_javascript";
    custom_css: "custom_css";
    dynamic_data_source: "dynamic_data_source";
    ecommerce_block: "ecommerce_block";
    external_font: "external_font";
    form_submission: "form_submission";
    provider_specific_asset: "provider_specific_asset";
    raw_html_block: "raw_html_block";
    unsupported_merge_tag: "unsupported_merge_tag";
    unknown_block: "unknown_block";
    video_block: "video_block";
  }>;
  severity: z.ZodDefault<z.ZodEnum<{
    error: "error";
    warning: "warning";
    info: "info";
  }>>;
  message: z.ZodString;
  path: z.ZodDefault<z.ZodArray<z.ZodString>>;
  suggestedManualAction: z.ZodOptional<z.ZodString>;
  metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
}, z.core.$strict>;
type UnlayerUnsupportedFeature = z.infer<typeof UnlayerUnsupportedFeatureSchema>;
type UnlayerUnsupportedFeatureInput = z.input<typeof UnlayerUnsupportedFeatureSchema>;
export declare const UnlayerMigrationStrategySchema: z.ZodEnum<{
  manual_rebuild_with_report: "manual_rebuild_with_report";
  html_import_report_only: "html_import_report_only";
  side_by_side_review: "side_by_side_review";
}>;
type UnlayerMigrationStrategy = z.infer<typeof UnlayerMigrationStrategySchema>;
export declare const UnlayerMigrationStatusSchema: z.ZodEnum<{
  completed: "completed";
  ready_for_manual_rebuild: "ready_for_manual_rebuild";
  needs_manual_rebuild: "needs_manual_rebuild";
  blocked: "blocked";
}>;
type UnlayerMigrationStatus = z.infer<typeof UnlayerMigrationStatusSchema>;
export declare const UnlayerMigrationReportV1Schema: z.ZodObject<{
  version: z.ZodDefault<z.ZodLiteral<1>>;
  id: z.ZodString;
  legacyTemplate: z.ZodObject<{
    engine: z.ZodLiteral<"unlayer">;
    legacyTemplateId: z.ZodString;
    tenantId: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    category: z.ZodOptional<z.ZodEnum<{
      custom: "custom";
      donation_receipt: "donation_receipt";
      tax_receipt: "tax_receipt";
      annual_giving_statement: "annual_giving_statement";
      donor_letter: "donor_letter";
      missionary_report: "missionary_report";
      financial_report: "financial_report";
      invoice: "invoice";
      certificate: "certificate";
    }>>;
    sourceSystem: z.ZodDefault<z.ZodString>;
    designJsonRef: z.ZodOptional<z.ZodString>;
    htmlArtifactRef: z.ZodOptional<z.ZodString>;
    pdfArtifacts: z.ZodDefault<z.ZodArray<z.ZodObject<{
      artifactId: z.ZodString;
      location: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"storage">;
        storageKey: z.ZodString;
      }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"url">;
        url: z.ZodString;
      }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"adapter_reference">;
        reference: z.ZodString;
      }, z.core.$strict>], "type">>;
      createdAt: z.ZodOptional<z.ZodString>;
      metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
    }, z.core.$strict>>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>;
  targetEngine: z.ZodDefault<z.ZodLiteral<"asym_pdf_document_builder">>;
  strategy: z.ZodDefault<z.ZodEnum<{
    manual_rebuild_with_report: "manual_rebuild_with_report";
    html_import_report_only: "html_import_report_only";
    side_by_side_review: "side_by_side_review";
  }>>;
  status: z.ZodEnum<{
    completed: "completed";
    ready_for_manual_rebuild: "ready_for_manual_rebuild";
    needs_manual_rebuild: "needs_manual_rebuild";
    blocked: "blocked";
  }>;
  unsupportedFeatures: z.ZodDefault<z.ZodArray<z.ZodObject<{
    code: z.ZodEnum<{
      custom_javascript: "custom_javascript";
      custom_css: "custom_css";
      dynamic_data_source: "dynamic_data_source";
      ecommerce_block: "ecommerce_block";
      external_font: "external_font";
      form_submission: "form_submission";
      provider_specific_asset: "provider_specific_asset";
      raw_html_block: "raw_html_block";
      unsupported_merge_tag: "unsupported_merge_tag";
      unknown_block: "unknown_block";
      video_block: "video_block";
    }>;
    severity: z.ZodDefault<z.ZodEnum<{
      error: "error";
      warning: "warning";
      info: "info";
    }>>;
    message: z.ZodString;
    path: z.ZodDefault<z.ZodArray<z.ZodString>>;
    suggestedManualAction: z.ZodOptional<z.ZodString>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>>>;
  unsupportedFeatureCount: z.ZodNumber;
  createdAt: z.ZodOptional<z.ZodString>;
  createdByActorId: z.ZodOptional<z.ZodString>;
  metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
}, z.core.$strict>;
type UnlayerMigrationReportV1 = z.infer<typeof UnlayerMigrationReportV1Schema>;
type UnlayerMigrationReportV1Input = z.input<typeof UnlayerMigrationReportV1Schema>;
interface CreateUnlayerMigrationReportInput {
  readonly id: string;
  readonly legacyTemplate: LegacyPdfTemplateReferenceInput;
  readonly unsupportedFeatures?: readonly UnlayerUnsupportedFeatureInput[];
  readonly strategy?: UnlayerMigrationStrategy;
  readonly status?: UnlayerMigrationStatus;
  readonly createdAt?: string;
  readonly createdByActorId?: string;
  readonly metadata?: Record<string, unknown>;
}
export declare function createUnlayerMigrationReport(input: CreateUnlayerMigrationReportInput): UnlayerMigrationReportV1;
export declare const UnlayerHtmlImportRequestSchema: z.ZodObject<{
  legacyTemplate: z.ZodObject<{
    engine: z.ZodLiteral<"unlayer">;
    legacyTemplateId: z.ZodString;
    tenantId: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    category: z.ZodOptional<z.ZodEnum<{
      custom: "custom";
      donation_receipt: "donation_receipt";
      tax_receipt: "tax_receipt";
      annual_giving_statement: "annual_giving_statement";
      donor_letter: "donor_letter";
      missionary_report: "missionary_report";
      financial_report: "financial_report";
      invoice: "invoice";
      certificate: "certificate";
    }>>;
    sourceSystem: z.ZodDefault<z.ZodString>;
    designJsonRef: z.ZodOptional<z.ZodString>;
    htmlArtifactRef: z.ZodOptional<z.ZodString>;
    pdfArtifacts: z.ZodDefault<z.ZodArray<z.ZodObject<{
      artifactId: z.ZodString;
      location: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"storage">;
        storageKey: z.ZodString;
      }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"url">;
        url: z.ZodString;
      }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"adapter_reference">;
        reference: z.ZodString;
      }, z.core.$strict>], "type">>;
      createdAt: z.ZodOptional<z.ZodString>;
      metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
    }, z.core.$strict>>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>;
  html: z.ZodString;
  mode: z.ZodDefault<z.ZodLiteral<"report_only">>;
  claimsLosslessConversion: z.ZodDefault<z.ZodLiteral<false>>;
  metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
}, z.core.$strict>;
type UnlayerHtmlImportRequest = z.infer<typeof UnlayerHtmlImportRequestSchema>;
type UnlayerHtmlImportRequestInput = z.input<typeof UnlayerHtmlImportRequestSchema>;
export declare const PdfBuilderFeatureFlagRolloutModeSchema: z.ZodEnum<{
  legacy_only: "legacy_only";
  native_preview: "native_preview";
  native_new_templates: "native_new_templates";
  native_publish: "native_publish";
  native_batch: "native_batch";
}>;
type PdfBuilderFeatureFlagRolloutMode = z.infer<typeof PdfBuilderFeatureFlagRolloutModeSchema>;
export declare const PdfBuilderFeatureFlagContractSchema: z.ZodObject<{
  flagName: z.ZodString;
  enabled: z.ZodBoolean;
  tenantId: z.ZodOptional<z.ZodString>;
  rolloutMode: z.ZodDefault<z.ZodEnum<{
    legacy_only: "legacy_only";
    native_preview: "native_preview";
    native_new_templates: "native_new_templates";
    native_publish: "native_publish";
    native_batch: "native_batch";
  }>>;
  fallbackEngine: z.ZodDefault<z.ZodLiteral<"unlayer">>;
  metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
}, z.core.$strict>;
type PdfBuilderFeatureFlagContract = z.infer<typeof PdfBuilderFeatureFlagContractSchema>;
type PdfBuilderFeatureFlagContractInput = z.input<typeof PdfBuilderFeatureFlagContractSchema>;
export declare const PdfTemplateEngineSelectionReasonSchema: z.ZodEnum<{
  feature_flag_disabled: "feature_flag_disabled";
  legacy_template_pass_through: "legacy_template_pass_through";
  native_feature_enabled: "native_feature_enabled";
}>;
type PdfTemplateEngineSelectionReason = z.infer<typeof PdfTemplateEngineSelectionReasonSchema>;
export declare const PdfTemplateEditorSelectionSchema: z.ZodEnum<{
  legacy_unlayer: "legacy_unlayer";
  native_pdf_builder: "native_pdf_builder";
}>;
type PdfTemplateEditorSelection = z.infer<typeof PdfTemplateEditorSelectionSchema>;
export declare const PdfTemplateEngineSelectionResultSchema: z.ZodObject<{
  selectedEngine: z.ZodEnum<{
    asym_pdf_document_builder: "asym_pdf_document_builder";
    unlayer: "unlayer";
  }>;
  editor: z.ZodEnum<{
    legacy_unlayer: "legacy_unlayer";
    native_pdf_builder: "native_pdf_builder";
  }>;
  reason: z.ZodEnum<{
    feature_flag_disabled: "feature_flag_disabled";
    legacy_template_pass_through: "legacy_template_pass_through";
    native_feature_enabled: "native_feature_enabled";
  }>;
}, z.core.$strict>;
type PdfTemplateEngineSelectionResult = z.infer<typeof PdfTemplateEngineSelectionResultSchema>;
interface SelectPdfTemplateEngineInput {
  readonly templateEngine: z.input<typeof DocumentEngineSchema>;
  readonly featureFlag: PdfBuilderFeatureFlagContractInput;
}
export declare function selectPdfTemplateEngine(input: SelectPdfTemplateEngineInput): PdfTemplateEngineSelectionResult;
export declare const UnlayerComparisonDifferenceCodeSchema: z.ZodEnum<{
  asset_mismatch: "asset_mismatch";
  content_mismatch: "content_mismatch";
  layout_mismatch: "layout_mismatch";
  metadata_mismatch: "metadata_mismatch";
  missing_native_section: "missing_native_section";
  unsupported_legacy_feature: "unsupported_legacy_feature";
}>;
type UnlayerComparisonDifferenceCode = z.infer<typeof UnlayerComparisonDifferenceCodeSchema>;
export declare const UnlayerComparisonDifferenceSchema: z.ZodObject<{
  code: z.ZodEnum<{
    asset_mismatch: "asset_mismatch";
    content_mismatch: "content_mismatch";
    layout_mismatch: "layout_mismatch";
    metadata_mismatch: "metadata_mismatch";
    missing_native_section: "missing_native_section";
    unsupported_legacy_feature: "unsupported_legacy_feature";
  }>;
  severity: z.ZodDefault<z.ZodEnum<{
    error: "error";
    warning: "warning";
    info: "info";
  }>>;
  message: z.ZodString;
  path: z.ZodDefault<z.ZodArray<z.ZodString>>;
  metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
}, z.core.$strict>;
type UnlayerComparisonDifference = z.infer<typeof UnlayerComparisonDifferenceSchema>;
type UnlayerComparisonDifferenceInput = z.input<typeof UnlayerComparisonDifferenceSchema>;
export declare const UnlayerSideBySideComparisonStatusSchema: z.ZodEnum<{
  matches: "matches";
  blocked: "blocked";
  differences_found: "differences_found";
}>;
type UnlayerSideBySideComparisonStatus = z.infer<typeof UnlayerSideBySideComparisonStatusSchema>;
export declare const UnlayerSideBySideComparisonRequestSchema: z.ZodObject<{
  legacyTemplate: z.ZodObject<{
    engine: z.ZodLiteral<"unlayer">;
    legacyTemplateId: z.ZodString;
    tenantId: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    category: z.ZodOptional<z.ZodEnum<{
      custom: "custom";
      donation_receipt: "donation_receipt";
      tax_receipt: "tax_receipt";
      annual_giving_statement: "annual_giving_statement";
      donor_letter: "donor_letter";
      missionary_report: "missionary_report";
      financial_report: "financial_report";
      invoice: "invoice";
      certificate: "certificate";
    }>>;
    sourceSystem: z.ZodDefault<z.ZodString>;
    designJsonRef: z.ZodOptional<z.ZodString>;
    htmlArtifactRef: z.ZodOptional<z.ZodString>;
    pdfArtifacts: z.ZodDefault<z.ZodArray<z.ZodObject<{
      artifactId: z.ZodString;
      location: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"storage">;
        storageKey: z.ZodString;
      }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"url">;
        url: z.ZodString;
      }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"adapter_reference">;
        reference: z.ZodString;
      }, z.core.$strict>], "type">>;
      createdAt: z.ZodOptional<z.ZodString>;
      metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
    }, z.core.$strict>>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>;
  nativeTemplateId: z.ZodString;
  metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
}, z.core.$strict>;
type UnlayerSideBySideComparisonRequest = z.infer<typeof UnlayerSideBySideComparisonRequestSchema>;
type UnlayerSideBySideComparisonRequestInput = z.input<typeof UnlayerSideBySideComparisonRequestSchema>;
export declare const UnlayerSideBySideComparisonResultSchema: z.ZodObject<{
  legacyTemplateId: z.ZodString;
  nativeTemplateId: z.ZodString;
  status: z.ZodEnum<{
    matches: "matches";
    blocked: "blocked";
    differences_found: "differences_found";
  }>;
  differences: z.ZodDefault<z.ZodArray<z.ZodObject<{
    code: z.ZodEnum<{
      asset_mismatch: "asset_mismatch";
      content_mismatch: "content_mismatch";
      layout_mismatch: "layout_mismatch";
      metadata_mismatch: "metadata_mismatch";
      missing_native_section: "missing_native_section";
      unsupported_legacy_feature: "unsupported_legacy_feature";
    }>;
    severity: z.ZodDefault<z.ZodEnum<{
      error: "error";
      warning: "warning";
      info: "info";
    }>>;
    message: z.ZodString;
    path: z.ZodDefault<z.ZodArray<z.ZodString>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
  }, z.core.$strict>>>;
  metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
}, z.core.$strict>;
type UnlayerSideBySideComparisonResult = z.infer<typeof UnlayerSideBySideComparisonResultSchema>;
type UnlayerSideBySideComparisonResultInput = z.input<typeof UnlayerSideBySideComparisonResultSchema>;
interface UnlayerSideBySideComparisonAdapter {
  compare(request: UnlayerSideBySideComparisonRequest): Promise<UnlayerSideBySideComparisonResult>;
}
export declare const DocumentPageBreakAttributesSchema: z.ZodObject<{
  id: z.ZodOptional<z.ZodString>;
  label: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
type DocumentPageBreakAttributes = z.infer<typeof DocumentPageBreakAttributesSchema>;
type DocumentPageBreakAttributesInput = z.input<typeof DocumentPageBreakAttributesSchema>;
export declare const DocumentPageBreakNodeSchema: z.ZodObject<{
  type: z.ZodLiteral<"pageBreak">;
  attrs: z.ZodDefault<z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodOptional<z.ZodString>;
  }, z.core.$strict>>;
}, z.core.$strict>;
type DocumentPageBreakNode = z.infer<typeof DocumentPageBreakNodeSchema>;
type DocumentPageBreakNodeInput = z.input<typeof DocumentPageBreakNodeSchema>;
export declare const PageFlowControlAttributesSchema: z.ZodObject<{
  keepTogether: z.ZodOptional<z.ZodBoolean>;
  startOnNewPage: z.ZodOptional<z.ZodBoolean>;
  avoidBreakAfter: z.ZodOptional<z.ZodBoolean>;
  avoidRowSplit: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
type PageFlowControlAttributes = z.infer<typeof PageFlowControlAttributesSchema>;
type PageFlowControlAttributesInput = z.input<typeof PageFlowControlAttributesSchema>;
export declare const PdfDocumentMetadataSchema: z.ZodDefault<z.ZodObject<{
  title: z.ZodOptional<z.ZodString>;
  subject: z.ZodOptional<z.ZodString>;
  author: z.ZodOptional<z.ZodString>;
  organization: z.ZodOptional<z.ZodString>;
  language: z.ZodDefault<z.ZodString>;
  keywords: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strict>>;
type PdfDocumentMetadata = z.infer<typeof PdfDocumentMetadataSchema>;
type PdfDocumentMetadataInput = z.input<typeof PdfDocumentMetadataSchema>;
export declare const PdfDocumentProfileSchema: z.ZodEnum<{
  "PDF/A-1a": "PDF/A-1a";
  "PDF/A-1a+PDF/UA-1": "PDF/A-1a+PDF/UA-1";
  "PDF/A-1b": "PDF/A-1b";
  "PDF/A-2a": "PDF/A-2a";
  "PDF/A-2a+PDF/UA-1": "PDF/A-2a+PDF/UA-1";
  "PDF/A-2b": "PDF/A-2b";
  "PDF/A-3a": "PDF/A-3a";
  "PDF/A-3a+PDF/UA-1": "PDF/A-3a+PDF/UA-1";
  "PDF/A-3b": "PDF/A-3b";
  "PDF/UA-1": "PDF/UA-1";
}>;
type PdfDocumentProfile = z.infer<typeof PdfDocumentProfileSchema>;
export declare const PdfDocumentProfileOptionsSchema: z.ZodDefault<z.ZodObject<{
  profile: z.ZodOptional<z.ZodEnum<{
    "PDF/A-1a": "PDF/A-1a";
    "PDF/A-1a+PDF/UA-1": "PDF/A-1a+PDF/UA-1";
    "PDF/A-1b": "PDF/A-1b";
    "PDF/A-2a": "PDF/A-2a";
    "PDF/A-2a+PDF/UA-1": "PDF/A-2a+PDF/UA-1";
    "PDF/A-2b": "PDF/A-2b";
    "PDF/A-3a": "PDF/A-3a";
    "PDF/A-3a+PDF/UA-1": "PDF/A-3a+PDF/UA-1";
    "PDF/A-3b": "PDF/A-3b";
    "PDF/UA-1": "PDF/UA-1";
  }>>;
}, z.core.$strict>>;
type PdfDocumentProfileOptions = z.infer<typeof PdfDocumentProfileOptionsSchema>;
type PdfDocumentProfileOptionsInput = z.input<typeof PdfDocumentProfileOptionsSchema>;
export declare const PdfDocumentOutputSettingsSchema: z.ZodDefault<z.ZodObject<{
  metadata: z.ZodDefault<z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    subject: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    organization: z.ZodOptional<z.ZodString>;
    language: z.ZodDefault<z.ZodString>;
    keywords: z.ZodDefault<z.ZodArray<z.ZodString>>;
  }, z.core.$strict>>;
  profile: z.ZodDefault<z.ZodObject<{
    profile: z.ZodOptional<z.ZodEnum<{
      "PDF/A-1a": "PDF/A-1a";
      "PDF/A-1a+PDF/UA-1": "PDF/A-1a+PDF/UA-1";
      "PDF/A-1b": "PDF/A-1b";
      "PDF/A-2a": "PDF/A-2a";
      "PDF/A-2a+PDF/UA-1": "PDF/A-2a+PDF/UA-1";
      "PDF/A-2b": "PDF/A-2b";
      "PDF/A-3a": "PDF/A-3a";
      "PDF/A-3a+PDF/UA-1": "PDF/A-3a+PDF/UA-1";
      "PDF/A-3b": "PDF/A-3b";
      "PDF/UA-1": "PDF/UA-1";
    }>>;
  }, z.core.$strict>>;
}, z.core.$strict>>;
type PdfDocumentOutputSettings = z.infer<typeof PdfDocumentOutputSettingsSchema>;
type PdfDocumentOutputSettingsInput = z.input<typeof PdfDocumentOutputSettingsSchema>;
export declare const DocumentPlaceholderKindSchema: z.ZodEnum<{
  date: "date";
  signature: "signature";
  qr: "qr";
  text_field: "text_field";
  checkbox: "checkbox";
  initials: "initials";
}>;
export declare const DocumentPlaceholderSignerRoleSchema: z.ZodEnum<{
  custom: "custom";
  organization: "organization";
  recipient: "recipient";
  witness: "witness";
  staff: "staff";
}>;
export declare const QrPlaceholderPayloadSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
  type: z.ZodLiteral<"url">;
  value: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
  type: z.ZodLiteral<"text">;
  value: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
  type: z.ZodLiteral<"variable">;
  key: z.ZodString;
}, z.core.$strict>], "type">;
type QrPlaceholderPayload = z.infer<typeof QrPlaceholderPayloadSchema>;
export declare const TextFieldPlaceholderSchema: z.ZodObject<{
  id: z.ZodString;
  label: z.ZodOptional<z.ZodString>;
  required: z.ZodDefault<z.ZodBoolean>;
  adapterKey: z.ZodOptional<z.ZodString>;
  dataPath: z.ZodOptional<z.ZodString>;
  description: z.ZodOptional<z.ZodString>;
  kind: z.ZodLiteral<"text_field">;
  placeholderText: z.ZodOptional<z.ZodString>;
  maxLength: z.ZodOptional<z.ZodNumber>;
  multiline: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strict>;
export declare const CheckboxPlaceholderSchema: z.ZodObject<{
  id: z.ZodString;
  label: z.ZodOptional<z.ZodString>;
  required: z.ZodDefault<z.ZodBoolean>;
  adapterKey: z.ZodOptional<z.ZodString>;
  dataPath: z.ZodOptional<z.ZodString>;
  description: z.ZodOptional<z.ZodString>;
  kind: z.ZodLiteral<"checkbox">;
  checkedByDefault: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strict>;
export declare const SignaturePlaceholderSchema: z.ZodObject<{
  id: z.ZodString;
  label: z.ZodOptional<z.ZodString>;
  required: z.ZodDefault<z.ZodBoolean>;
  adapterKey: z.ZodOptional<z.ZodString>;
  dataPath: z.ZodOptional<z.ZodString>;
  description: z.ZodOptional<z.ZodString>;
  kind: z.ZodLiteral<"signature">;
  signerRole: z.ZodOptional<z.ZodEnum<{
    custom: "custom";
    organization: "organization";
    recipient: "recipient";
    witness: "witness";
    staff: "staff";
  }>>;
  width: z.ZodOptional<z.ZodNumber>;
  height: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const InitialsPlaceholderSchema: z.ZodObject<{
  id: z.ZodString;
  label: z.ZodOptional<z.ZodString>;
  required: z.ZodDefault<z.ZodBoolean>;
  adapterKey: z.ZodOptional<z.ZodString>;
  dataPath: z.ZodOptional<z.ZodString>;
  description: z.ZodOptional<z.ZodString>;
  kind: z.ZodLiteral<"initials">;
  signerRole: z.ZodOptional<z.ZodEnum<{
    custom: "custom";
    organization: "organization";
    recipient: "recipient";
    witness: "witness";
    staff: "staff";
  }>>;
  width: z.ZodOptional<z.ZodNumber>;
  height: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const QrPlaceholderSchema: z.ZodObject<{
  id: z.ZodString;
  label: z.ZodOptional<z.ZodString>;
  required: z.ZodDefault<z.ZodBoolean>;
  adapterKey: z.ZodOptional<z.ZodString>;
  dataPath: z.ZodOptional<z.ZodString>;
  description: z.ZodOptional<z.ZodString>;
  kind: z.ZodLiteral<"qr">;
  payload: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"url">;
    value: z.ZodString;
  }, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"text">;
    value: z.ZodString;
  }, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"variable">;
    key: z.ZodString;
  }, z.core.$strict>], "type">;
  size: z.ZodOptional<z.ZodNumber>;
  errorCorrectionLevel: z.ZodOptional<z.ZodEnum<{
    low: "low";
    medium: "medium";
    quartile: "quartile";
    high: "high";
  }>>;
}, z.core.$strict>;
export declare const DatePlaceholderSchema: z.ZodObject<{
  id: z.ZodString;
  label: z.ZodOptional<z.ZodString>;
  required: z.ZodDefault<z.ZodBoolean>;
  adapterKey: z.ZodOptional<z.ZodString>;
  dataPath: z.ZodOptional<z.ZodString>;
  description: z.ZodOptional<z.ZodString>;
  kind: z.ZodLiteral<"date">;
  dateFormat: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const DocumentPlaceholderSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
  id: z.ZodString;
  label: z.ZodOptional<z.ZodString>;
  required: z.ZodDefault<z.ZodBoolean>;
  adapterKey: z.ZodOptional<z.ZodString>;
  dataPath: z.ZodOptional<z.ZodString>;
  description: z.ZodOptional<z.ZodString>;
  kind: z.ZodLiteral<"text_field">;
  placeholderText: z.ZodOptional<z.ZodString>;
  maxLength: z.ZodOptional<z.ZodNumber>;
  multiline: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strict>, z.ZodObject<{
  id: z.ZodString;
  label: z.ZodOptional<z.ZodString>;
  required: z.ZodDefault<z.ZodBoolean>;
  adapterKey: z.ZodOptional<z.ZodString>;
  dataPath: z.ZodOptional<z.ZodString>;
  description: z.ZodOptional<z.ZodString>;
  kind: z.ZodLiteral<"checkbox">;
  checkedByDefault: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strict>, z.ZodObject<{
  id: z.ZodString;
  label: z.ZodOptional<z.ZodString>;
  required: z.ZodDefault<z.ZodBoolean>;
  adapterKey: z.ZodOptional<z.ZodString>;
  dataPath: z.ZodOptional<z.ZodString>;
  description: z.ZodOptional<z.ZodString>;
  kind: z.ZodLiteral<"signature">;
  signerRole: z.ZodOptional<z.ZodEnum<{
    custom: "custom";
    organization: "organization";
    recipient: "recipient";
    witness: "witness";
    staff: "staff";
  }>>;
  width: z.ZodOptional<z.ZodNumber>;
  height: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>, z.ZodObject<{
  id: z.ZodString;
  label: z.ZodOptional<z.ZodString>;
  required: z.ZodDefault<z.ZodBoolean>;
  adapterKey: z.ZodOptional<z.ZodString>;
  dataPath: z.ZodOptional<z.ZodString>;
  description: z.ZodOptional<z.ZodString>;
  kind: z.ZodLiteral<"initials">;
  signerRole: z.ZodOptional<z.ZodEnum<{
    custom: "custom";
    organization: "organization";
    recipient: "recipient";
    witness: "witness";
    staff: "staff";
  }>>;
  width: z.ZodOptional<z.ZodNumber>;
  height: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>, z.ZodObject<{
  id: z.ZodString;
  label: z.ZodOptional<z.ZodString>;
  required: z.ZodDefault<z.ZodBoolean>;
  adapterKey: z.ZodOptional<z.ZodString>;
  dataPath: z.ZodOptional<z.ZodString>;
  description: z.ZodOptional<z.ZodString>;
  kind: z.ZodLiteral<"qr">;
  payload: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"url">;
    value: z.ZodString;
  }, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"text">;
    value: z.ZodString;
  }, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"variable">;
    key: z.ZodString;
  }, z.core.$strict>], "type">;
  size: z.ZodOptional<z.ZodNumber>;
  errorCorrectionLevel: z.ZodOptional<z.ZodEnum<{
    low: "low";
    medium: "medium";
    quartile: "quartile";
    high: "high";
  }>>;
}, z.core.$strict>, z.ZodObject<{
  id: z.ZodString;
  label: z.ZodOptional<z.ZodString>;
  required: z.ZodDefault<z.ZodBoolean>;
  adapterKey: z.ZodOptional<z.ZodString>;
  dataPath: z.ZodOptional<z.ZodString>;
  description: z.ZodOptional<z.ZodString>;
  kind: z.ZodLiteral<"date">;
  dateFormat: z.ZodOptional<z.ZodString>;
}, z.core.$strict>], "kind">;
type DocumentPlaceholder = z.infer<typeof DocumentPlaceholderSchema>;
type DocumentPlaceholderInput = z.input<typeof DocumentPlaceholderSchema>;
type DocumentPlaceholderKind = z.infer<typeof DocumentPlaceholderKindSchema>;
type DocumentPlaceholderSignerRole = z.infer<typeof DocumentPlaceholderSignerRoleSchema>;
type RepeaterResolutionDiagnosticCode = 'invalid_repeater_binding' | 'missing_repeater_source' | 'non_array_repeater_source' | 'repeater_filter_error' | 'repeater_filter_warning' | 'repeater_max_items_exceeded';
type RepeaterResolutionDiagnosticSeverity = 'error' | 'warning';
interface RepeaterResolutionDiagnostic {
  readonly code: RepeaterResolutionDiagnosticCode;
  readonly severity: RepeaterResolutionDiagnosticSeverity;
  readonly message: string;
  readonly bindingId: string;
  readonly sourcePath: string;
  readonly itemAlias?: string;
  readonly sourceIndex?: number;
  readonly details?: Readonly<Record<string, unknown>>;
}
interface ResolvedRepeaterItem {
  readonly value: unknown;
  readonly sourceIndex: number;
  readonly renderedIndex: number;
  readonly context: VariableDataContext;
}
interface ResolveRepeaterItemsInput {
  readonly binding: RepeaterBindingInput;
  readonly context: VariableDataContext;
}
interface ResolveRepeaterItemsResult {
  readonly items: readonly ResolvedRepeaterItem[];
  readonly diagnostics: readonly RepeaterResolutionDiagnostic[];
}
interface CreateScopedRepeaterContextInput {
  readonly context: VariableDataContext;
  readonly itemAlias: string;
  readonly itemValue: unknown;
  readonly indexAlias?: string;
  readonly renderedIndex?: number;
}
export declare function resolveRepeaterItems(input: ResolveRepeaterItemsInput): ResolveRepeaterItemsResult;
export declare function createScopedRepeaterContext(input: CreateScopedRepeaterContextInput): VariableDataContext;
export declare const PdfSecurityActorSchema: z.ZodObject<{
  type: z.ZodEnum<{
    user: "user";
    system: "system";
  }>;
  id: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
type PdfSecurityActor = z.infer<typeof PdfSecurityActorSchema>;
type PdfSecurityActorInput = z.input<typeof PdfSecurityActorSchema>;
export declare const PdfSecurityPermissionSchema: z.ZodEnum<{
  "template.edit": "template.edit";
  "template.publish": "template.publish";
  "render.preview": "render.preview";
  "render.production": "render.production";
  "batch.start": "batch.start";
  "asset.read": "asset.read";
  "asset.render_safe_url": "asset.render_safe_url";
}>;
type PdfSecurityPermission = z.infer<typeof PdfSecurityPermissionSchema>;
export declare const PdfSecurityActionSchema: z.ZodEnum<{
  production_render: "production_render";
  edit_template: "edit_template";
  publish_template: "publish_template";
  preview_render: "preview_render";
  start_batch: "start_batch";
  read_asset: "read_asset";
  resolve_render_safe_url: "resolve_render_safe_url";
}>;
type PdfSecurityAction = z.infer<typeof PdfSecurityActionSchema>;
export declare const PdfSecurityContextSchema: z.ZodObject<{
  tenantId: z.ZodString;
  actor: z.ZodObject<{
    type: z.ZodEnum<{
      user: "user";
      system: "system";
    }>;
    id: z.ZodOptional<z.ZodString>;
  }, z.core.$strict>;
  permissions: z.ZodDefault<z.ZodArray<z.ZodEnum<{
    "template.edit": "template.edit";
    "template.publish": "template.publish";
    "render.preview": "render.preview";
    "render.production": "render.production";
    "batch.start": "batch.start";
    "asset.read": "asset.read";
    "asset.render_safe_url": "asset.render_safe_url";
  }>>>;
}, z.core.$strict>;
type PdfSecurityContext = z.infer<typeof PdfSecurityContextSchema>;
type PdfSecurityContextInput = z.input<typeof PdfSecurityContextSchema>;
export declare const PdfSecurityResourceTypeSchema: z.ZodEnum<{
  asset: "asset";
  template: "template";
  batch: "batch";
  dataset: "dataset";
  render_artifact: "render_artifact";
}>;
type PdfSecurityResourceType = z.infer<typeof PdfSecurityResourceTypeSchema>;
export declare const PdfSecurityResourceSchema: z.ZodObject<{
  type: z.ZodEnum<{
    asset: "asset";
    template: "template";
    batch: "batch";
    dataset: "dataset";
    render_artifact: "render_artifact";
  }>;
  id: z.ZodOptional<z.ZodString>;
  tenantId: z.ZodString;
}, z.core.$strict>;
type PdfSecurityResource = z.infer<typeof PdfSecurityResourceSchema>;
type PdfSecurityResourceInput = z.input<typeof PdfSecurityResourceSchema>;
export declare const PdfAuthorizationReasonCodeSchema: z.ZodEnum<{
  allowed: "allowed";
  missing_permission: "missing_permission";
  tenant_mismatch: "tenant_mismatch";
}>;
type PdfAuthorizationReasonCode = z.infer<typeof PdfAuthorizationReasonCodeSchema>;
export declare const PdfAuthorizationDecisionSchema: z.ZodObject<{
  ok: z.ZodBoolean;
  action: z.ZodEnum<{
    production_render: "production_render";
    edit_template: "edit_template";
    publish_template: "publish_template";
    preview_render: "preview_render";
    start_batch: "start_batch";
    read_asset: "read_asset";
    resolve_render_safe_url: "resolve_render_safe_url";
  }>;
  actorId: z.ZodOptional<z.ZodString>;
  tenantId: z.ZodString;
  resourceTenantId: z.ZodOptional<z.ZodString>;
  requiredPermission: z.ZodOptional<z.ZodEnum<{
    "template.edit": "template.edit";
    "template.publish": "template.publish";
    "render.preview": "render.preview";
    "render.production": "render.production";
    "batch.start": "batch.start";
    "asset.read": "asset.read";
    "asset.render_safe_url": "asset.render_safe_url";
  }>>;
  reasonCode: z.ZodOptional<z.ZodEnum<{
    allowed: "allowed";
    missing_permission: "missing_permission";
    tenant_mismatch: "tenant_mismatch";
  }>>;
  message: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
type PdfAuthorizationDecision = z.infer<typeof PdfAuthorizationDecisionSchema>;
interface AuthorizePdfSecurityActionInput {
  readonly action: PdfSecurityAction;
  readonly context: PdfSecurityContextInput;
  readonly resource: PdfSecurityResourceInput;
  readonly requiredPermission?: PdfSecurityPermission;
}
interface PdfPermissionAuthorizationRequest {
  readonly action: PdfSecurityAction;
  readonly resource: PdfSecurityResourceInput;
  readonly context?: PdfSecurityContextInput;
  readonly requiredPermission?: PdfSecurityPermission;
}
interface PdfPermissionAdapter {
  readonly authorize: (request: PdfPermissionAuthorizationRequest) => PdfAuthorizationDecision | Promise<PdfAuthorizationDecision>;
}
interface CreateFakePdfPermissionAdapterInput {
  readonly context: PdfSecurityContextInput;
}
export declare const PdfAssetAccessRequestSchema: z.ZodObject<{
  tenantId: z.ZodString;
  actorId: z.ZodOptional<z.ZodString>;
  assetId: z.ZodString;
  role: z.ZodOptional<z.ZodEnum<{
    logo: "logo";
    image: "image";
    signature: "signature";
    font: "font";
    qr: "qr";
    attachment: "attachment";
  }>>;
  purpose: z.ZodEnum<{
    production_render: "production_render";
    preview: "preview";
    browse: "browse";
  }>;
}, z.core.$strict>;
type PdfAssetAccessRequest = z.infer<typeof PdfAssetAccessRequestSchema>;
type PdfAssetAccessRequestInput = z.input<typeof PdfAssetAccessRequestSchema>;
export declare const PdfSignedRenderUrlRequestSchema: z.ZodObject<{
  tenantId: z.ZodString;
  actorId: z.ZodOptional<z.ZodString>;
  assetId: z.ZodString;
  purpose: z.ZodEnum<{
    browser_preview: "browser_preview";
    production_render: "production_render";
  }>;
  expiresInSeconds: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
type PdfSignedRenderUrlRequest = z.infer<typeof PdfSignedRenderUrlRequestSchema>;
type PdfSignedRenderUrlRequestInput = z.input<typeof PdfSignedRenderUrlRequestSchema>;
export declare const PdfSignedRenderUrlResultSchema: z.ZodObject<{
  tenantId: z.ZodString;
  assetId: z.ZodString;
  url: z.ZodString;
  public: z.ZodDefault<z.ZodBoolean>;
  expiresAt: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
type PdfSignedRenderUrlResult = z.infer<typeof PdfSignedRenderUrlResultSchema>;
type PdfSignedRenderUrlResultInput = z.input<typeof PdfSignedRenderUrlResultSchema>;
interface PdfAssetAccessAdapter {
  readonly authorizeAssetAccess: (request: PdfAssetAccessRequestInput) => PdfAuthorizationDecision | Promise<PdfAuthorizationDecision>;
  readonly createSignedRenderUrl?: (request: PdfSignedRenderUrlRequestInput) => PdfSignedRenderUrlResultInput | undefined | Promise<PdfSignedRenderUrlResultInput | undefined>;
}
export declare const PdfDataClassificationSchema: z.ZodEnum<{
  public: "public";
  internal: "internal";
  pii: "pii";
  confidential: "confidential";
  restricted: "restricted";
  financial_pii: "financial_pii";
  secret: "secret";
}>;
type PdfDataClassification = z.infer<typeof PdfDataClassificationSchema>;
export declare const PdfClassifiedDataPathSchema: z.ZodObject<{
  path: z.ZodArray<z.ZodString>;
  classification: z.ZodEnum<{
    public: "public";
    internal: "internal";
    pii: "pii";
    confidential: "confidential";
    restricted: "restricted";
    financial_pii: "financial_pii";
    secret: "secret";
  }>;
  reason: z.ZodString;
}, z.core.$strict>;
type PdfClassifiedDataPath = z.infer<typeof PdfClassifiedDataPathSchema>;
export declare const PdfSecretLikeTemplateDiagnosticSchema: z.ZodObject<{
  code: z.ZodLiteral<"secret_like_template_value">;
  severity: z.ZodLiteral<"error">;
  path: z.ZodArray<z.ZodString>;
  message: z.ZodString;
  reason: z.ZodString;
  redactedPreview: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
type PdfSecretLikeTemplateDiagnostic = z.infer<typeof PdfSecretLikeTemplateDiagnosticSchema>;
export declare function authorizePdfSecurityAction(input: AuthorizePdfSecurityActionInput): PdfAuthorizationDecision;
export declare function createFakePdfPermissionAdapter(input: CreateFakePdfPermissionAdapterInput): PdfPermissionAdapter;
export declare function classifyPdfDataPath(path: string | readonly string[]): PdfClassifiedDataPath;
export declare function findSecretLikeTemplateValues(template: unknown): readonly PdfSecretLikeTemplateDiagnostic[];
export declare function redactPdfSecurityLogValue<T>(value: T, options?: {
  readonly redactValues?: readonly string[];
}): T;
export declare function redactRenderMetadataForClient<T>(metadata: T, options?: {
  readonly redactValues?: readonly string[];
}): T;
type StarterPdfTemplateCategory = Exclude<TemplateCategory, 'custom'>;
interface StarterPdfTemplateFixture {
  readonly id: string;
  readonly title: string;
  readonly category: StarterPdfTemplateCategory;
  readonly template: DocumentTemplateV1;
  readonly sampleData: VariableDataContext;
  readonly expectedWarnings: readonly string[];
  readonly expectedHtmlSnippets: readonly string[];
  readonly expectedPrintCssSnippets: readonly string[];
}
export declare const starterPdfTemplateCategories: readonly ["donation_receipt", "tax_receipt", "annual_giving_statement", "donor_letter", "missionary_report", "financial_report", "invoice", "certificate"];
export declare const starterPdfTemplateFixtures: readonly [StarterPdfTemplateFixture, StarterPdfTemplateFixture, StarterPdfTemplateFixture, StarterPdfTemplateFixture, StarterPdfTemplateFixture, StarterPdfTemplateFixture, StarterPdfTemplateFixture, StarterPdfTemplateFixture];
export declare const starterPdfTemplateFixtureByCategory: Readonly<Record<StarterPdfTemplateCategory, StarterPdfTemplateFixture>>;
export declare const SummaryCalculationPrecisionSchema: z.ZodObject<{
  scale: z.ZodOptional<z.ZodNumber>;
  roundingMode: z.ZodOptional<z.ZodLiteral<"half_away_from_zero">>;
}, z.core.$strict>;
export declare const TotalContributionsCalculationReferenceSchema: z.ZodObject<{
  type: z.ZodLiteral<"total_contributions">;
  sourcePath: z.ZodString;
  amountPath: z.ZodString;
  label: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const TableTotalCalculationReferenceSchema: z.ZodObject<{
  type: z.ZodLiteral<"table_total">;
  tableBindingId: z.ZodString;
  columnKey: z.ZodString;
  operation: z.ZodOptional<z.ZodEnum<{
    sum: "sum";
    count: "count";
  }>>;
  label: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const InvoiceTotalsCalculationReferenceSchema: z.ZodObject<{
  type: z.ZodLiteral<"invoice_totals">;
  lineItemsPath: z.ZodString;
  amountPath: z.ZodOptional<z.ZodString>;
  quantityPath: z.ZodOptional<z.ZodString>;
  ratePath: z.ZodOptional<z.ZodString>;
  discountPath: z.ZodOptional<z.ZodString>;
  taxPath: z.ZodOptional<z.ZodString>;
  fields: z.ZodDefault<z.ZodArray<z.ZodEnum<{
    subtotal: "subtotal";
    discounts: "discounts";
    taxes: "taxes";
    total: "total";
  }>>>;
  labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strict>;
export declare const FinancialReportTotalsCalculationReferenceSchema: z.ZodObject<{
  type: z.ZodLiteral<"financial_report_totals">;
  sourcePath: z.ZodString;
  amountPath: z.ZodString;
  categoryPath: z.ZodString;
  incomeCategories: z.ZodArray<z.ZodString>;
  expenseCategories: z.ZodArray<z.ZodString>;
  fields: z.ZodDefault<z.ZodArray<z.ZodEnum<{
    income: "income";
    expense: "expense";
    net: "net";
  }>>>;
  labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strict>;
export declare const GroupedSubtotalsCalculationReferenceSchema: z.ZodObject<{
  type: z.ZodLiteral<"grouped_subtotals">;
  sourcePath: z.ZodString;
  groupPath: z.ZodString;
  valuePath: z.ZodString;
  includeGrandTotal: z.ZodDefault<z.ZodBoolean>;
  labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
  grandTotalLabel: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const GrandTotalCalculationReferenceSchema: z.ZodObject<{
  type: z.ZodLiteral<"grand_total">;
  sourcePath: z.ZodString;
  groupPath: z.ZodString;
  valuePath: z.ZodString;
  label: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const SummaryCalculationReferenceSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
  type: z.ZodLiteral<"total_contributions">;
  sourcePath: z.ZodString;
  amountPath: z.ZodString;
  label: z.ZodOptional<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
  type: z.ZodLiteral<"table_total">;
  tableBindingId: z.ZodString;
  columnKey: z.ZodString;
  operation: z.ZodOptional<z.ZodEnum<{
    sum: "sum";
    count: "count";
  }>>;
  label: z.ZodOptional<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
  type: z.ZodLiteral<"invoice_totals">;
  lineItemsPath: z.ZodString;
  amountPath: z.ZodOptional<z.ZodString>;
  quantityPath: z.ZodOptional<z.ZodString>;
  ratePath: z.ZodOptional<z.ZodString>;
  discountPath: z.ZodOptional<z.ZodString>;
  taxPath: z.ZodOptional<z.ZodString>;
  fields: z.ZodDefault<z.ZodArray<z.ZodEnum<{
    subtotal: "subtotal";
    discounts: "discounts";
    taxes: "taxes";
    total: "total";
  }>>>;
  labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strict>, z.ZodObject<{
  type: z.ZodLiteral<"financial_report_totals">;
  sourcePath: z.ZodString;
  amountPath: z.ZodString;
  categoryPath: z.ZodString;
  incomeCategories: z.ZodArray<z.ZodString>;
  expenseCategories: z.ZodArray<z.ZodString>;
  fields: z.ZodDefault<z.ZodArray<z.ZodEnum<{
    income: "income";
    expense: "expense";
    net: "net";
  }>>>;
  labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strict>, z.ZodObject<{
  type: z.ZodLiteral<"grouped_subtotals">;
  sourcePath: z.ZodString;
  groupPath: z.ZodString;
  valuePath: z.ZodString;
  includeGrandTotal: z.ZodDefault<z.ZodBoolean>;
  labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
  grandTotalLabel: z.ZodOptional<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
  type: z.ZodLiteral<"grand_total">;
  sourcePath: z.ZodString;
  groupPath: z.ZodString;
  valuePath: z.ZodString;
  label: z.ZodOptional<z.ZodString>;
}, z.core.$strict>], "type">;
type SummaryCalculationReference = z.infer<typeof SummaryCalculationReferenceSchema>;
type SummaryCalculationReferenceInput = z.input<typeof SummaryCalculationReferenceSchema>;
export declare const SummaryBlockBindingSchema: z.ZodObject<{
  id: z.ZodString;
  title: z.ZodOptional<z.ZodString>;
  formatter: z.ZodDefault<z.ZodString>;
  precision: z.ZodOptional<z.ZodObject<{
    scale: z.ZodOptional<z.ZodNumber>;
    roundingMode: z.ZodOptional<z.ZodLiteral<"half_away_from_zero">>;
  }, z.core.$strict>>;
  calculation: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"total_contributions">;
    sourcePath: z.ZodString;
    amountPath: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
  }, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"table_total">;
    tableBindingId: z.ZodString;
    columnKey: z.ZodString;
    operation: z.ZodOptional<z.ZodEnum<{
      sum: "sum";
      count: "count";
    }>>;
    label: z.ZodOptional<z.ZodString>;
  }, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"invoice_totals">;
    lineItemsPath: z.ZodString;
    amountPath: z.ZodOptional<z.ZodString>;
    quantityPath: z.ZodOptional<z.ZodString>;
    ratePath: z.ZodOptional<z.ZodString>;
    discountPath: z.ZodOptional<z.ZodString>;
    taxPath: z.ZodOptional<z.ZodString>;
    fields: z.ZodDefault<z.ZodArray<z.ZodEnum<{
      subtotal: "subtotal";
      discounts: "discounts";
      taxes: "taxes";
      total: "total";
    }>>>;
    labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
  }, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"financial_report_totals">;
    sourcePath: z.ZodString;
    amountPath: z.ZodString;
    categoryPath: z.ZodString;
    incomeCategories: z.ZodArray<z.ZodString>;
    expenseCategories: z.ZodArray<z.ZodString>;
    fields: z.ZodDefault<z.ZodArray<z.ZodEnum<{
      income: "income";
      expense: "expense";
      net: "net";
    }>>>;
    labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
  }, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"grouped_subtotals">;
    sourcePath: z.ZodString;
    groupPath: z.ZodString;
    valuePath: z.ZodString;
    includeGrandTotal: z.ZodDefault<z.ZodBoolean>;
    labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    grandTotalLabel: z.ZodOptional<z.ZodString>;
  }, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"grand_total">;
    sourcePath: z.ZodString;
    groupPath: z.ZodString;
    valuePath: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
  }, z.core.$strict>], "type">;
}, z.core.$strict>;
type SummaryBlockBinding = z.infer<typeof SummaryBlockBindingSchema>;
type SummaryBlockBindingInput = z.input<typeof SummaryBlockBindingSchema>;
type TableResolutionDiagnosticCode = 'invalid_table_binding' | 'missing_table_source' | 'non_array_table_source' | 'table_max_rows_exceeded' | 'unsupported_table_column_value';
type TableResolutionDiagnosticSeverity = 'error' | 'warning';
interface TableResolutionDiagnostic {
  readonly code: TableResolutionDiagnosticCode;
  readonly severity: TableResolutionDiagnosticSeverity;
  readonly message: string;
  readonly bindingId: string;
  readonly sourcePath: string;
  readonly columnKey?: string;
  readonly sourceIndex?: number;
  readonly details?: Readonly<Record<string, unknown>>;
}
interface ResolvedTableCell {
  readonly columnKey: string;
  readonly label: string;
  readonly sourcePath: string;
  readonly align: TableColumnBinding['align'];
  readonly width?: string;
  readonly formatter: string;
  readonly rawValue?: unknown;
  readonly displayValue: string;
}
interface ResolvedTableRow {
  readonly value: unknown;
  readonly sourceIndex: number;
  readonly renderedIndex: number;
  readonly cells: readonly ResolvedTableCell[];
}
interface ResolveTableRowsInput extends VariableFormatterOptions {
  readonly binding: TableBindingInput;
  readonly context: VariableDataContext;
}
interface ResolveTableRowsResult {
  readonly binding?: TableBinding;
  readonly rows: readonly ResolvedTableRow[];
  readonly diagnostics: readonly TableResolutionDiagnostic[];
  readonly totalPlaceholders: readonly TableTotalBinding[];
}
export declare function resolveTableRows(input: ResolveTableRowsInput): ResolveTableRowsResult;
export type PdfTemplateSchemaPackageName = '@asym/pdf-template-schema';
export type PdfTemplateSchemaMaturity = 'phase-38-unlayer-migration';
export type PdfTemplateSchemaRuntime = 'shared';
export type PdfTemplateSchemaOwnership = 'template-schema';
export interface PdfTemplateSchemaBoundary {
  readonly packageName: PdfTemplateSchemaPackageName;
  readonly maturity: PdfTemplateSchemaMaturity;
  readonly owns: PdfTemplateSchemaOwnership;
  readonly runtime: PdfTemplateSchemaRuntime;
}
export declare const pdfTemplateSchemaBoundary: PdfTemplateSchemaBoundary;
export type { AssetReference, AuditEvent, AuthorizePdfSecurityActionInput, BatchDatasetReference, BatchDatasetReferenceInput, BatchDocumentJobStatus, BatchDocumentJobV1, BatchDownloadManifestV1, BatchFailureReason, BatchFailureReasonInput, BatchGenerationDefinitionV1, BatchGenerationRunV1, BatchGenerationStatus, BatchProgressSummary, BatchQueueAdapter, BatchQueueCancelInput, BatchQueueEnqueueInput, BatchQueueEnqueueResult, BatchQueueRetryInput, BatchRecipientReference, BatchRecipientReferenceInput, BatchResultManifestJob, BatchResultManifestV1, BatchRunV1, BatchSafetyPreflightDiagnostic, BatchSafetyPreflightDiagnosticInput, BatchSafetyPreflightResult, BatchSafetyPreflightResultInput, CalculateFinancialTotalsInput, CalculateFinancialTotalsResult, CalculateGroupedTableTotalsInput, CalculateGroupedTableTotalsResult, CalculateInvoiceTotalsInput, CalculateInvoiceTotalsResult, CalculateNumericAggregateInput, CalculateNumericAggregateResult, CalculateTableTotalsInput, CalculateTableTotalsResult, CalculateTaxDeductibleAmountInput, CalculateTaxDeductibleAmountResult, CalculatedTableGroupTotal, CalculatedTableTotal, CalculationDecimalValue, CalculationDiagnostic, CalculationDiagnosticCode, CalculationDiagnosticSeverity, CalculationOperation, CalculationPrecision, CalculationRoundingMode, ConditionalEvaluationDiagnostic, ConditionalEvaluationDiagnosticCode, ConditionalEvaluationDiagnosticSeverity, ConditionalRule, ConditionalRuleEvaluationResult, ConditionalRulesEvaluationResult, CreateFakePdfPermissionAdapterInput, CreateScopedRepeaterContextInput, CreateUnlayerMigrationReportInput, DataBinding, DataSnapshotHash, DocRaptorRenderMetadata, DocumentArtifact, DocumentArtifactLocation, DocumentAssetAlignment, DocumentAssetImageAttributes, DocumentAssetImageAttributesInput, DocumentAssetImageNode, DocumentAssetImageNodeInput, DocumentAssetLookupAdapter, DocumentAssetLookupRequest, DocumentAssetLookupResult, DocumentAssetReference, DocumentAssetReferenceInput, DocumentAssetRole, DocumentAssetSourceMetadata, DocumentAssetUrlClassification, DocumentAssetUrlClassificationResult, DocumentBrandField, DocumentBrandSource, DocumentBrandingMetadata, DocumentContent, DocumentContentNode, DocumentHeaderFooterSettings, DocumentHeaderFooterSettingsInput, DocumentPageBreakAttributes, DocumentPageBreakAttributesInput, DocumentPageBreakNode, DocumentPageBreakNodeInput, DocumentPageSettings, DocumentPageSettingsInput, DocumentPlaceholder, DocumentPlaceholderInput, DocumentPlaceholderKind, DocumentPlaceholderSignerRole, DocumentReceiptDefaults, DocumentRenderSafeUrlAdapter, DocumentRenderSafeUrlRequest, DocumentRenderSafeUrlResult, DocumentTemplateV1, DocumentTemplateV1Input, DocumentTheme, DocumentThemeColors, DocumentThemeDefaultsAdapter, DocumentThemeDefaultsRequest, DocumentThemeFonts, DocumentThemeInput, DocumentThemeOrganization, EvaluateConditionalRuleInput, EvaluateConditionalRulesInput, FallbackBehavior, FormatVariableValueInput, HeaderFooterAlignment, HeaderFooterContentToken, HeaderFooterContentTokenInput, HeaderFooterDocumentTitleToken, HeaderFooterOrganizationFooterToken, HeaderFooterPageNumberToken, HeaderFooterPlacement, HeaderFooterRegion, HeaderFooterRegionInput, HeaderFooterScope, HeaderFooterTextToken, HeaderFooterTotalPagesToken, LegacyPdfTemplateArtifact, LegacyPdfTemplateArtifactInput, LegacyPdfTemplateReference, LegacyPdfTemplateReferenceInput, NormalizedVariableFormatterOptions, PageFlowControlAttributes, PageFlowControlAttributesInput, PdfAssetAccessAdapter, PdfAssetAccessRequest, PdfAssetAccessRequestInput, PdfAuthorizationDecision, PdfAuthorizationReasonCode, PdfBuilderFeatureFlagContract, PdfBuilderFeatureFlagContractInput, PdfBuilderFeatureFlagRolloutMode, PdfClassifiedDataPath, PdfDataClassification, PdfDocumentMetadata, PdfDocumentMetadataInput, PdfDocumentOutputSettings, PdfDocumentOutputSettingsInput, PdfDocumentProfile, PdfDocumentProfileOptions, PdfDocumentProfileOptionsInput, PdfPermissionAdapter, PdfPermissionAuthorizationRequest, PdfSecretLikeTemplateDiagnostic, PdfSecurityAction, PdfSecurityActor, PdfSecurityActorInput, PdfSecurityContext, PdfSecurityContextInput, PdfSecurityPermission, PdfSecurityResource, PdfSecurityResourceInput, PdfSecurityResourceType, PdfSignedRenderUrlRequest, PdfSignedRenderUrlRequestInput, PdfSignedRenderUrlResult, PdfSignedRenderUrlResultInput, PdfTemplateEditorSelection, PdfTemplateEngineSelectionReason, PdfTemplateEngineSelectionResult, PrivacyClassification, PublishedTemplateSnapshotV1, QrPlaceholderPayload, RegistryVariableDefinition, RegistryVariableDefinitionInput, RenderError, RenderJobV1, RenderMetadataV1, RenderRequest, RenderResult, RenderTiming, RenderWarning, RepeaterBinding, RepeaterBindingInput, RepeaterResolutionDiagnostic, RepeaterResolutionDiagnosticCode, RepeaterResolutionDiagnosticSeverity, ResolveDocumentThemeInput, ResolveRepeaterItemsInput, ResolveRepeaterItemsResult, ResolveTableRowsInput, ResolveTableRowsResult, ResolveVariableValueInput, ResolveVariableValuesInput, ResolveVariableValuesResult, ResolvedRepeaterItem, ResolvedTableCell, ResolvedTableRow, ResolvedVariableValue, SelectPdfTemplateEngineInput, StarterPdfTemplateCategory, StarterPdfTemplateFixture, SummaryBlockBinding, SummaryBlockBindingInput, SummaryCalculationReference, SummaryCalculationReferenceInput, TableBinding, TableBindingInput, TableColumnBinding, TableGroupingBinding, TableResolutionDiagnostic, TableResolutionDiagnosticCode, TableResolutionDiagnosticSeverity, TableTotalBinding, TemplateCategory, TemplateLifecycleChangelogEntry, TemplateLifecycleCheck, TemplateLifecycleCheckInput, TemplateLifecycleCheckStatus, TemplateLifecycleEngineMetadata, TemplateLifecycleEngineMetadataInput, TemplateLifecycleEvent, TemplateLifecycleRecordV1, TemplateLifecycleStatus, UnlayerComparisonDifference, UnlayerComparisonDifferenceCode, UnlayerComparisonDifferenceInput, UnlayerHtmlImportRequest, UnlayerHtmlImportRequestInput, UnlayerMigrationReportV1, UnlayerMigrationReportV1Input, UnlayerMigrationSeverity, UnlayerMigrationStatus, UnlayerMigrationStrategy, UnlayerSideBySideComparisonAdapter, UnlayerSideBySideComparisonRequest, UnlayerSideBySideComparisonRequestInput, UnlayerSideBySideComparisonResult, UnlayerSideBySideComparisonResultInput, UnlayerSideBySideComparisonStatus, UnlayerUnsupportedFeature, UnlayerUnsupportedFeatureCode, UnlayerUnsupportedFeatureInput, UpdateTemplateDraftResult, VariableDataContext, VariableDefinition, VariableFormatResult, VariableFormatter, VariableFormatterContext, VariableFormatterMap, VariableFormatterOptions, VariableGroup, VariablePathLookupResult, VariableReference, VariableRegistry, VariableRegistryErrorCode, VariableResolutionDiagnostic, VariableResolutionDiagnosticCode, VariableResolutionDiagnosticSeverity, VariableResolutionRequest, VariableResolutionRequestInput, VariableResolutionStatus, VariableResolver, VariableResolverOptions, VariableSampleData, VariableValueType };
//# sourceMappingURL=index.d.cts.map