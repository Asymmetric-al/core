import { ReactEmailBubbleMenuReference, ReactEmailEditorReference, ReactEmailInspectorReference, ReactEmailMarkReference, ReactEmailNodeReference, ReactEmailSlashCommandReference, ReactEmailStarterKitReference, ReactEmailThemingReference, composeReactEmailReference } from "./react-email-compat.mjs";
import { EmailEditor as DocumentEditor, EmailEditor as PdfEditor } from "@react-email/editor";
import { EmailMark as DocumentMark, EmailNode as DocumentNode } from "@react-email/editor/core";
//#region src/index.ts
const pdfEditorBoundary = {
	packageName: "@asym/pdf-editor",
	maturity: "phase-27-assets",
	owns: "pdf-editor",
	runtime: "browser-react",
	compatibility: "react-email-reference-adapter",
	consumes: ["@asym/pdf-template-schema", "@react-email/editor"]
};
//#endregion
export { DocumentEditor, DocumentMark, DocumentNode, PdfEditor, ReactEmailBubbleMenuReference, ReactEmailEditorReference, ReactEmailInspectorReference, ReactEmailMarkReference, ReactEmailNodeReference, ReactEmailSlashCommandReference, ReactEmailStarterKitReference, ReactEmailThemingReference, composeReactEmailReference, pdfEditorBoundary };

//# sourceMappingURL=index.mjs.map