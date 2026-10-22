import type { RichTextField } from "payload";

/**
 * Core stores custom and legacy Lexical nodes as open document payloads.
 * Keep generated types and MCP write validation aligned with the owned
 * CmsRichTextDocument envelope without restricting documents to today's toolbar.
 */
export const coreRichTextDocumentSchema: NonNullable<
  RichTextField["jsonSchema"]
>[number] = ({ jsonSchema }) => ({
  description: jsonSchema.description,
  type: "object",
  additionalProperties: true,
  required: ["root"],
  properties: {
    root: {
      type: "object",
      additionalProperties: true,
      required: [
        "type",
        "children",
        "direction",
        "format",
        "indent",
        "version",
      ],
      properties: {
        type: { type: "string" },
        children: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: true,
            required: ["type", "version"],
            properties: {
              type: {},
              version: { type: "number" },
            },
          },
        },
        direction: { enum: ["ltr", "rtl", null] },
        format: {
          enum: ["left", "start", "center", "right", "end", "justify", ""],
        },
        indent: { type: "number" },
        version: { type: "number" },
      },
    },
  },
});
