"use client";

import * as React from "react";
import { RichTextEditor } from "@asym/ui/components/shadcn/RichTextEditor";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";

export default function RichTextTestPage() {
  const [content, setContent] = React.useState(
    "<h1>Welcome to the new Editor</h1><p>This is a <strong>modern</strong>, high-quality rich text editor built with <em>Tiptap</em> and <em>Shadcn/UI</em>.</p><ul><li>Bullet list support</li><li>Header options (H1, H2)</li><li>Image and Link support</li></ul>",
  );

  return (
    <div className="container max-w-4xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Rich Text Editor Demo</CardTitle>
          <CardDescription>
            A modern replacement for standard textareas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Type your content here..."
          />

          <div className="mt-8 p-4 border rounded-lg bg-slate-50">
            <h3 className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wider">
              Raw HTML Output
            </h3>
            <pre className="text-xs overflow-auto max-h-40 p-2 bg-white border rounded">
              {content}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
