import { a as ReactEmailInspectorReference, c as ReactEmailSlashCommandReference, d as composeReactEmailReference, i as ReactEmailEditorReferenceRef, l as ReactEmailStarterKitReference, n as ReactEmailEditorReference, o as ReactEmailMarkReference, r as ReactEmailEditorReferenceProps, s as ReactEmailNodeReference, t as ReactEmailBubbleMenuReference, u as ReactEmailThemingReference } from "./react-email-compat-HZUbOONN.mjs";
import { PdfTemplateSchemaBoundary } from "@asym/pdf-template-schema";
import { EmailEditor as DocumentEditor, EmailEditor as PdfEditor, EmailEditorProps as DocumentEditorProps, EmailEditorProps as PdfEditorProps, EmailEditorRef as DocumentEditorRef, EmailEditorRef as PdfEditorRef } from "@react-email/editor";
import { EmailMark as DocumentMark, EmailNode as DocumentNode } from "@react-email/editor/core";

//#region src/index.d.ts
type PdfEditorPackageName = '@asym/pdf-editor';
type PdfEditorMaturity = 'phase-27-assets';
type PdfEditorRuntime = 'browser-react';
type PdfEditorOwnership = 'pdf-editor';
type PdfEditorCompatibility = 'react-email-reference-adapter';
interface PdfEditorBoundary {
  readonly packageName: PdfEditorPackageName;
  readonly maturity: PdfEditorMaturity;
  readonly owns: PdfEditorOwnership;
  readonly runtime: PdfEditorRuntime;
  readonly compatibility: PdfEditorCompatibility;
  readonly consumes: readonly [PdfTemplateSchemaBoundary['packageName'], '@react-email/editor'];
}
declare const pdfEditorBoundary: PdfEditorBoundary;
//#endregion
export { DocumentEditor, type DocumentEditorProps, type DocumentEditorRef, DocumentMark, DocumentNode, PdfEditor, PdfEditorBoundary, PdfEditorCompatibility, PdfEditorMaturity, PdfEditorOwnership, PdfEditorPackageName, type PdfEditorProps, type PdfEditorRef, PdfEditorRuntime, ReactEmailBubbleMenuReference, ReactEmailEditorReference, type ReactEmailEditorReferenceProps, type ReactEmailEditorReferenceRef, ReactEmailInspectorReference, ReactEmailMarkReference, ReactEmailNodeReference, ReactEmailSlashCommandReference, ReactEmailStarterKitReference, ReactEmailThemingReference, composeReactEmailReference, pdfEditorBoundary };
//# sourceMappingURL=index.d.mts.map