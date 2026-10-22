import { a as ReactEmailInspectorReference, c as ReactEmailSlashCommandReference, d as composeReactEmailReference, i as ReactEmailEditorReferenceRef, l as ReactEmailStarterKitReference, n as ReactEmailEditorReference, o as ReactEmailMarkReference, r as ReactEmailEditorReferenceProps, s as ReactEmailNodeReference, t as ReactEmailBubbleMenuReference, u as ReactEmailThemingReference } from "./react-email-compat-CyF5yqyg.cjs";
import { PdfTemplateSchemaBoundary } from "@asym/pdf-template-schema";
import { EmailEditor as DocumentEditor, EmailEditor as PdfEditor, EmailEditorProps as DocumentEditorProps, EmailEditorProps as PdfEditorProps, EmailEditorRef as DocumentEditorRef, EmailEditorRef as PdfEditorRef } from "@react-email/editor";
import { EmailMark as DocumentMark, EmailNode as DocumentNode } from "@react-email/editor/core";
export type PdfEditorPackageName = '@asym/pdf-editor';
export type PdfEditorMaturity = 'phase-27-assets';
export type PdfEditorRuntime = 'browser-react';
export type PdfEditorOwnership = 'pdf-editor';
export type PdfEditorCompatibility = 'react-email-reference-adapter';
export interface PdfEditorBoundary {
  readonly packageName: PdfEditorPackageName;
  readonly maturity: PdfEditorMaturity;
  readonly owns: PdfEditorOwnership;
  readonly runtime: PdfEditorRuntime;
  readonly compatibility: PdfEditorCompatibility;
  readonly consumes: readonly [PdfTemplateSchemaBoundary['packageName'], '@react-email/editor'];
}
export declare const pdfEditorBoundary: PdfEditorBoundary;
export { DocumentEditor, type DocumentEditorProps, type DocumentEditorRef, DocumentMark, DocumentNode, PdfEditor, type PdfEditorProps, type PdfEditorRef, ReactEmailBubbleMenuReference, ReactEmailEditorReference, type ReactEmailEditorReferenceProps, type ReactEmailEditorReferenceRef, ReactEmailInspectorReference, ReactEmailMarkReference, ReactEmailNodeReference, ReactEmailSlashCommandReference, ReactEmailStarterKitReference, ReactEmailThemingReference, composeReactEmailReference };
//# sourceMappingURL=index.d.cts.map