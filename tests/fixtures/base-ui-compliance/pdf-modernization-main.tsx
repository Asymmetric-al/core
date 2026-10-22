import {
  PdfEditor,
  type PdfEditorRef,
  ReactEmailStarterKitReference,
} from "@asym/pdf-editor";
import {
  ConditionalSection,
  DataTableBlock,
  PageBreakNode,
  RepeaterSection,
  VariableChip,
} from "@asym/pdf-editor/extensions";
import { Button } from "@asym/ui/components/shadcn/button";
import { EditorAccessibility } from "../../../packages/ui/components/studio/editor-accessibility";
import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import "virtual:base-ui-styles";

const parameters = new URLSearchParams(location.search);
const readOnly = parameters.get("readonly") === "1";
const customDocument = parameters.get("document") === "custom";
const content = {
  type: "doc",
  content: [
    {
      type: "container",
      content: [
        {
          type: "paragraph",
          attrs: { class: "node-paragraph" },
          content: [
            { type: "text", text: "Donation " },
            {
              type: "variable",
              attrs: {
                key: "donation.amount",
                formatter: "currency.usd",
                fallback: { mode: "use_value", value: "$250.00" },
              },
            },
          ],
        },
        {
          type: "conditionalSection",
          attrs: {
            rule: {
              fieldPath: "recipient.country",
              operator: "equals",
              value: "US",
            },
          },
          content: [
            {
              type: "paragraph",
              attrs: { class: "node-paragraph" },
              content: [{ type: "text", text: "Reviewed US donor clause" }],
            },
          ],
        },
        {
          type: "repeater",
          attrs: {
            binding: {
              id: "donation-rows",
              itemAlias: "donation",
              maxItems: 1000,
              sourcePath: "donations",
              filters: [],
            },
          },
          content: [
            {
              type: "paragraph",
              attrs: { class: "node-paragraph" },
              content: [{ type: "text", text: "Donation row" }],
            },
          ],
        },
        { type: "dataTable", attrs: { bindingId: "annual-statement-table" } },
        { type: "pageBreak", attrs: { id: "receipt-page-two" } },
        {
          type: "paragraph",
          attrs: { class: "node-paragraph" },
          content: [{ type: "text", text: "End of receipt" }],
        },
      ],
    },
  ],
};
const baseExtensions = [
  ReactEmailStarterKitReference,
  EditorAccessibility.configure({ label: "PDF document" }),
];
const extensions = [
  ...baseExtensions,
  VariableChip,
  ConditionalSection,
  RepeaterSection,
  DataTableBlock,
  PageBreakNode,
];

function App() {
  const reference = useRef<PdfEditorRef | null>(null);
  const [ready, setReady] = useState(false);
  const [snapshot, setSnapshot] = useState("");
  const [html, setHtml] = useState("");
  function inspect() {
    const editor = reference.current?.editor;
    if (!editor) throw new Error("Public PDF editor is not ready");
    setSnapshot(JSON.stringify(editor.getJSON()));
    setHtml(editor.getHTML());
  }
  return (
    <main className="flex flex-col gap-4 p-4">
      <h1>PDF editor contracts</h1>
      <section aria-label="PDF document" className="min-h-80 border">
        <PdfEditor
          content={
            customDocument
              ? content
              : readOnly
                ? "<p>Reviewed legal wording</p>"
                : undefined
          }
          extensions={customDocument ? extensions : baseExtensions}
          editable={!readOnly}
          onReady={(ref) => {
            reference.current = ref;
            setReady(true);
          }}
        />
      </section>
      <div className="flex flex-wrap gap-2">
        <Button disabled={!ready} onClick={inspect}>
          Inspect document
        </Button>
        <Button
          variant="outline"
          disabled={!ready || readOnly}
          onClick={() => {
            const editor = reference.current?.editor;
            if (!editor) throw new Error("Public PDF editor is not ready");
            editor.commands.setContent(editor.getHTML());
            inspect();
          }}
        >
          Round trip HTML
        </Button>
        <Button
          variant="outline"
          disabled={!ready || readOnly}
          onClick={() => {
            reference.current?.editor?.commands.setContent("<hr>");
            inspect();
          }}
        >
          Load ordinary rule
        </Button>
      </div>
      <output aria-label="Document JSON" className="break-all">
        {snapshot}
      </output>
      <output aria-label="Document HTML" className="break-all">
        {html}
      </output>
    </main>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("PDF fixture root is missing");
createRoot(root).render(<App />);
