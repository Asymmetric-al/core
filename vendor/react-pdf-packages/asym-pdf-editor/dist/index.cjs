Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
require("./react-email-compat.cjs");
let _react_email_editor = require("@react-email/editor");
let _react_email_editor_core = require("@react-email/editor/core");
let _react_email_editor_ui = require("@react-email/editor/ui");
let _react_email_editor_extensions = require("@react-email/editor/extensions");
let _react_email_editor_plugins = require("@react-email/editor/plugins");
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
Object.defineProperty(exports, "DocumentEditor", {
	enumerable: true,
	get: function() {
		return _react_email_editor.EmailEditor;
	}
});
Object.defineProperty(exports, "DocumentMark", {
	enumerable: true,
	get: function() {
		return _react_email_editor_core.EmailMark;
	}
});
Object.defineProperty(exports, "DocumentNode", {
	enumerable: true,
	get: function() {
		return _react_email_editor_core.EmailNode;
	}
});
Object.defineProperty(exports, "PdfEditor", {
	enumerable: true,
	get: function() {
		return _react_email_editor.EmailEditor;
	}
});
Object.defineProperty(exports, "ReactEmailBubbleMenuReference", {
	enumerable: true,
	get: function() {
		return _react_email_editor_ui.BubbleMenu;
	}
});
Object.defineProperty(exports, "ReactEmailEditorReference", {
	enumerable: true,
	get: function() {
		return _react_email_editor.EmailEditor;
	}
});
Object.defineProperty(exports, "ReactEmailInspectorReference", {
	enumerable: true,
	get: function() {
		return _react_email_editor_ui.Inspector;
	}
});
Object.defineProperty(exports, "ReactEmailMarkReference", {
	enumerable: true,
	get: function() {
		return _react_email_editor_core.EmailMark;
	}
});
Object.defineProperty(exports, "ReactEmailNodeReference", {
	enumerable: true,
	get: function() {
		return _react_email_editor_core.EmailNode;
	}
});
Object.defineProperty(exports, "ReactEmailSlashCommandReference", {
	enumerable: true,
	get: function() {
		return _react_email_editor_ui.SlashCommand;
	}
});
Object.defineProperty(exports, "ReactEmailStarterKitReference", {
	enumerable: true,
	get: function() {
		return _react_email_editor_extensions.StarterKit;
	}
});
Object.defineProperty(exports, "ReactEmailThemingReference", {
	enumerable: true,
	get: function() {
		return _react_email_editor_plugins.EmailTheming;
	}
});
Object.defineProperty(exports, "composeReactEmailReference", {
	enumerable: true,
	get: function() {
		return _react_email_editor_core.composeReactEmail;
	}
});
exports.pdfEditorBoundary = pdfEditorBoundary;
