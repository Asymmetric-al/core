import { ConditionalEvaluationDiagnostic, ConditionalRule, DocumentAssetImageAttributes, DocumentAssetImageAttributesInput, DocumentAssetReference, DocumentAssetRole, DocumentHeaderFooterSettings, DocumentHeaderFooterSettingsInput, DocumentPageBreakAttributes, DocumentPageBreakAttributesInput, DocumentPageBreakNode, DocumentPlaceholder, DocumentPlaceholderInput, FallbackBehavior, RegistryVariableDefinition, RepeaterBinding, RepeaterBindingInput, RepeaterResolutionDiagnostic, ResolvedVariableValue, TableBinding, TableBindingInput, TableResolutionDiagnostic, VariableDataContext, VariableRegistry, VariableResolutionDiagnostic, VariableResolverOptions } from "@asym/pdf-template-schema";
import { JSONContent, Node } from "@tiptap/core";

//#region src/extensions/asset-image/index.d.ts
interface InsertAssetImageInput extends DocumentAssetImageAttributesInput {}
interface AssetImageAttributes {
  readonly asset?: DocumentAssetReference;
  readonly assetId?: string;
  readonly role?: DocumentAssetRole;
  readonly url?: string;
  readonly renderSafeUrl?: string;
  readonly mimeType?: string;
  readonly altText?: string;
  readonly width?: number;
  readonly height?: number;
  readonly alignment?: DocumentAssetImageAttributes['alignment'];
  readonly linkUrl?: string;
  readonly renderSafe?: boolean;
  readonly tenantId?: string;
  readonly source?: DocumentAssetReference['source'];
}
type AssetImagePreviewStatus = 'invalid_asset' | 'missing_alt_text' | 'missing_asset' | 'valid';
type AssetImagePreviewDiagnostic = {
  readonly code: 'invalid_asset';
  readonly severity: 'error';
  readonly message: string;
  readonly validationError: string;
} | {
  readonly code: 'missing_asset';
  readonly severity: 'error';
  readonly message: string;
  readonly assetId?: string;
  readonly role?: DocumentAssetRole;
} | {
  readonly code: 'missing_asset_alt_text';
  readonly severity: 'warning';
  readonly message: string;
  readonly assetId?: string;
  readonly role?: DocumentAssetRole;
};
interface AssetImagePreviewInput extends DocumentAssetImageAttributesInput {}
interface AssetImagePreviewResult {
  readonly status: AssetImagePreviewStatus;
  readonly diagnostics: readonly AssetImagePreviewDiagnostic[];
  readonly asset?: DocumentAssetReference;
  readonly assetId?: string;
  readonly role?: DocumentAssetRole;
}
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    assetImage: {
      insertAssetImage: (input: InsertAssetImageInput) => ReturnType;
    };
  }
}
declare function createAssetImageExtension(): Node<any, any>;
declare const AssetImageNode: Node<any, any>;
declare function getAssetImagePreview(input: AssetImagePreviewInput): AssetImagePreviewResult;
declare function isValidDocumentAssetImage(input: AssetImagePreviewInput): boolean;
//#endregion
//#region src/extensions/conditional-section/index.d.ts
interface InsertConditionalSectionInput {
  readonly rule: ConditionalRule;
  readonly content?: JSONContent | readonly JSONContent[];
}
interface ConditionalSectionAttributes {
  readonly rule?: ConditionalRule;
}
type ConditionalSectionPreviewDiagnostic = ConditionalEvaluationDiagnostic | {
  readonly code: 'missing_condition_context';
  readonly severity: 'warning';
  readonly message: string;
  readonly fieldPath: string;
  readonly operator: ConditionalRule['operator'];
};
interface ConditionalSectionPreviewInput {
  readonly rule: ConditionalRule;
  readonly context?: VariableDataContext;
}
interface ConditionalSectionPreviewResult {
  readonly visible: boolean;
  readonly diagnostics: readonly ConditionalSectionPreviewDiagnostic[];
}
interface ConditionalSectionOptions {
  readonly previewContext?: VariableDataContext;
}
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    conditionalSection: {
      insertConditionalSection: (input: InsertConditionalSectionInput) => ReturnType;
    };
  }
}
declare function createConditionalSectionExtension(options?: Partial<ConditionalSectionOptions>): Node<ConditionalSectionOptions, any>;
declare const ConditionalSection: Node<ConditionalSectionOptions, any>;
declare function getConditionalSectionPreview(input: ConditionalSectionPreviewInput): ConditionalSectionPreviewResult;
declare function isValidConditionalRule(value: unknown): value is ConditionalRule;
//#endregion
//#region src/extensions/data-table/index.d.ts
interface InsertDataTableInput {
  readonly binding?: TableBindingInput;
  readonly bindingId?: string;
}
interface DataTableAttributes {
  readonly binding?: TableBinding;
  readonly bindingId?: string;
}
type DataTablePreviewDiagnostic = TableResolutionDiagnostic | {
  readonly code: 'missing_table_binding';
  readonly severity: 'error';
  readonly message: string;
  readonly bindingId: string;
  readonly sourcePath: string;
};
type DataTablePreviewStatus = 'invalid_binding' | 'missing_binding' | 'valid';
interface DataTablePreviewInput {
  readonly binding?: TableBindingInput;
  readonly bindingId?: string;
  readonly context?: VariableDataContext;
}
interface DataTablePreviewResult {
  readonly status: DataTablePreviewStatus;
  readonly rowCount: number;
  readonly diagnostics: readonly DataTablePreviewDiagnostic[];
  readonly binding?: TableBinding;
  readonly bindingId?: string;
}
interface DataTableOptions {
  readonly previewContext?: VariableDataContext;
}
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    dataTable: {
      insertDataTable: (input: InsertDataTableInput) => ReturnType;
    };
  }
}
declare function createDataTableExtension(options?: Partial<DataTableOptions>): Node<DataTableOptions, any>;
declare const DataTableBlock: Node<DataTableOptions, any>;
declare function getDataTablePreview(input: DataTablePreviewInput): DataTablePreviewResult;
declare function isValidTableBinding(value: unknown): value is TableBinding;
//#endregion
//#region src/extensions/header-footer/index.d.ts
type HeaderFooterPreviewStatus = 'invalid_header_footer' | 'valid';
type HeaderFooterPreviewDiagnostic = {
  readonly code: 'invalid_header_footer';
  readonly severity: 'error';
  readonly message: string;
  readonly validationError: string;
};
type HeaderFooterPreviewInput = DocumentHeaderFooterSettingsInput;
interface HeaderFooterPreviewResult {
  readonly status: HeaderFooterPreviewStatus;
  readonly diagnostics: readonly HeaderFooterPreviewDiagnostic[];
  readonly settings?: DocumentHeaderFooterSettings;
}
declare function getHeaderFooterPreview(input?: HeaderFooterPreviewInput): HeaderFooterPreviewResult;
declare function isValidDocumentHeaderFooterSettings(value: unknown): value is DocumentHeaderFooterSettings;
//#endregion
//#region src/extensions/page-flow/index.d.ts
interface InsertPageBreakInput extends DocumentPageBreakAttributesInput {}
interface PageBreakAttributes extends DocumentPageBreakAttributes {}
type PageBreakPreviewStatus = 'invalid_page_break' | 'valid';
type PageBreakPreviewDiagnostic = {
  readonly code: 'invalid_page_break';
  readonly severity: 'error';
  readonly message: string;
  readonly validationError: string;
};
interface PageBreakPreviewInput extends DocumentPageBreakAttributesInput {}
interface PageBreakPreviewResult {
  readonly status: PageBreakPreviewStatus;
  readonly diagnostics: readonly PageBreakPreviewDiagnostic[];
  readonly attrs?: PageBreakAttributes;
}
type PageBreakOptions = Record<string, never>;
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreak: {
      insertPageBreak: (input?: InsertPageBreakInput) => ReturnType;
    };
  }
}
declare function createPageBreakExtension(): Node<PageBreakOptions, any>;
declare const PageBreakNode: Node<PageBreakOptions, any>;
declare function getPageBreakPreview(input?: PageBreakPreviewInput): PageBreakPreviewResult;
declare function isValidDocumentPageBreakNode(value: unknown): value is DocumentPageBreakNode;
//#endregion
//#region src/extensions/placeholder/index.d.ts
interface InsertDocumentPlaceholderInput {
  readonly placeholder?: DocumentPlaceholderInput;
  readonly placeholderId?: string;
}
interface DocumentPlaceholderAttributes {
  readonly placeholder?: DocumentPlaceholder;
  readonly placeholderId?: string;
}
type DocumentPlaceholderPreviewStatus = 'invalid_placeholder' | 'missing_label' | 'missing_placeholder' | 'valid';
type DocumentPlaceholderPreviewDiagnostic = {
  readonly code: 'invalid_placeholder';
  readonly severity: 'error';
  readonly message: string;
  readonly validationError: string;
} | {
  readonly code: 'missing_placeholder';
  readonly severity: 'error';
  readonly message: string;
  readonly placeholderId?: string;
} | {
  readonly code: 'missing_placeholder_label';
  readonly severity: 'warning';
  readonly message: string;
  readonly placeholderId: string;
  readonly kind: DocumentPlaceholder['kind'];
};
interface DocumentPlaceholderPreviewInput {
  readonly placeholder?: DocumentPlaceholderInput;
  readonly placeholderId?: string;
}
interface DocumentPlaceholderPreviewResult {
  readonly status: DocumentPlaceholderPreviewStatus;
  readonly diagnostics: readonly DocumentPlaceholderPreviewDiagnostic[];
  readonly placeholder?: DocumentPlaceholder;
  readonly placeholderId?: string;
}
type DocumentPlaceholderOptions = Record<string, never>;
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    documentPlaceholder: {
      insertDocumentPlaceholder: (input: InsertDocumentPlaceholderInput) => ReturnType;
    };
  }
}
declare function createDocumentPlaceholderExtension(): Node<DocumentPlaceholderOptions, any>;
declare const DocumentPlaceholderNode: Node<DocumentPlaceholderOptions, any>;
declare function getDocumentPlaceholderPreview(input: DocumentPlaceholderPreviewInput): DocumentPlaceholderPreviewResult;
declare function isValidDocumentPlaceholder(value: unknown): value is DocumentPlaceholder;
//#endregion
//#region src/extensions/repeater/index.d.ts
interface InsertRepeaterSectionInput {
  readonly binding: RepeaterBindingInput;
  readonly content?: JSONContent | readonly JSONContent[];
}
interface RepeaterSectionAttributes {
  readonly binding?: RepeaterBinding;
}
type RepeaterSectionPreviewDiagnostic = RepeaterResolutionDiagnostic | {
  readonly code: 'missing_repeater_context';
  readonly severity: 'warning';
  readonly message: string;
  readonly bindingId: string;
  readonly sourcePath: string;
  readonly itemAlias: string;
};
interface RepeaterSectionPreviewInput {
  readonly binding: RepeaterBindingInput;
  readonly context?: VariableDataContext;
}
interface RepeaterSectionPreviewResult {
  readonly visible: boolean;
  readonly itemCount: number;
  readonly diagnostics: readonly RepeaterSectionPreviewDiagnostic[];
}
interface RepeaterSectionOptions {
  readonly previewContext?: VariableDataContext;
}
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    repeaterSection: {
      insertRepeaterSection: (input: InsertRepeaterSectionInput) => ReturnType;
    };
  }
}
declare function createRepeaterSectionExtension(options?: Partial<RepeaterSectionOptions>): Node<RepeaterSectionOptions, any>;
declare const RepeaterSection: Node<RepeaterSectionOptions, any>;
declare function getRepeaterSectionPreview(input: RepeaterSectionPreviewInput): RepeaterSectionPreviewResult;
declare function isValidRepeaterBinding(value: unknown): value is RepeaterBinding;
//#endregion
//#region src/extensions/variable/index.d.ts
type VariableChipFallback = string | FallbackBehavior;
interface InsertVariableChipInput {
  readonly key: string;
  readonly formatter?: string;
  readonly fallback?: VariableChipFallback;
  readonly label?: string;
}
interface VariableChipAttributes extends InsertVariableChipInput {}
interface VariableChipPreviewInput extends InsertVariableChipInput, VariableResolverOptions {
  readonly context?: VariableDataContext;
}
interface VariableChipPreviewResult {
  readonly key: string;
  readonly displayValue: string;
  readonly status: ResolvedVariableValue['status'];
  readonly diagnostics: readonly VariableResolutionDiagnostic[];
  readonly definition?: RegistryVariableDefinition;
}
interface VariableChipOptions {
  readonly registry: VariableRegistry;
  readonly previewContext?: VariableDataContext;
}
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    variableChip: {
      insertVariableChip: (input: InsertVariableChipInput) => ReturnType;
    };
  }
}
declare function createVariableChipExtension(options?: Partial<VariableChipOptions>): Node<VariableChipOptions, any>;
declare const VariableChip: Node<VariableChipOptions, any>;
declare function getVariableChipPreview(input: VariableChipPreviewInput): VariableChipPreviewResult;
declare function isKnownVariableChipKey(key: string, registry?: VariableRegistry): boolean;
//#endregion
export { type AssetImageAttributes, AssetImageNode, type AssetImagePreviewDiagnostic, type AssetImagePreviewInput, type AssetImagePreviewResult, type AssetImagePreviewStatus, ConditionalSection, type ConditionalSectionAttributes, type ConditionalSectionOptions, type ConditionalSectionPreviewDiagnostic, type ConditionalSectionPreviewInput, type ConditionalSectionPreviewResult, type DataTableAttributes, DataTableBlock, type DataTableOptions, type DataTablePreviewDiagnostic, type DataTablePreviewInput, type DataTablePreviewResult, type DataTablePreviewStatus, type DocumentPlaceholderAttributes, DocumentPlaceholderNode, type DocumentPlaceholderOptions, type DocumentPlaceholderPreviewDiagnostic, type DocumentPlaceholderPreviewInput, type DocumentPlaceholderPreviewResult, type DocumentPlaceholderPreviewStatus, type HeaderFooterPreviewDiagnostic, type HeaderFooterPreviewInput, type HeaderFooterPreviewResult, type HeaderFooterPreviewStatus, type InsertAssetImageInput, type InsertConditionalSectionInput, type InsertDataTableInput, type InsertDocumentPlaceholderInput, type InsertPageBreakInput, type InsertRepeaterSectionInput, type InsertVariableChipInput, type PageBreakAttributes, PageBreakNode, type PageBreakOptions, type PageBreakPreviewDiagnostic, type PageBreakPreviewInput, type PageBreakPreviewResult, type PageBreakPreviewStatus, RepeaterSection, type RepeaterSectionAttributes, type RepeaterSectionOptions, type RepeaterSectionPreviewDiagnostic, type RepeaterSectionPreviewInput, type RepeaterSectionPreviewResult, VariableChip, type VariableChipAttributes, type VariableChipFallback, type VariableChipOptions, type VariableChipPreviewInput, type VariableChipPreviewResult, createAssetImageExtension, createConditionalSectionExtension, createDataTableExtension, createDocumentPlaceholderExtension, createPageBreakExtension, createRepeaterSectionExtension, createVariableChipExtension, getAssetImagePreview, getConditionalSectionPreview, getDataTablePreview, getDocumentPlaceholderPreview, getHeaderFooterPreview, getPageBreakPreview, getRepeaterSectionPreview, getVariableChipPreview, isKnownVariableChipKey, isValidConditionalRule, isValidDocumentAssetImage, isValidDocumentHeaderFooterSettings, isValidDocumentPageBreakNode, isValidDocumentPlaceholder, isValidRepeaterBinding, isValidTableBinding };
//# sourceMappingURL=extensions.d.cts.map