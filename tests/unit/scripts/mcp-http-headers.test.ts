import { describe, expect, it } from "vitest";

import {
  encodeMcpHeader,
  mcpToolHeaders,
} from "../../../scripts/lib/mcp-http-headers.mjs";

const tool = (properties: object) => ({
  name: "read",
  inputSchema: { type: "object", properties },
});

describe("current MCP HTTP header contracts", () => {
  it.each(["plain value", "inside\ttab"])(
    "preserves header-safe interior ASCII %s",
    (value) => {
      expect(encodeMcpHeader(value)).toBe(value);
    },
  );
  it.each([" padded ", "line1\nline2", "こんにちは", "=?base64?literal?="])(
    "encodes unsafe or sentinel-shaped values without header injection",
    (value) => {
      expect(encodeMcpHeader(value)).toBe(
        `=?base64?${Buffer.from(value, "utf8").toString("base64")}?=`,
      );
    },
  );
  it("mirrors nested primitive values and omits missing/null values", () => {
    expect(
      mcpToolHeaders(
        tool({
          scope: {
            type: "object",
            properties: {
              name: { type: "string", "x-mcp-header": "Scope" },
              count: { type: "integer", "x-mcp-header": "Count" },
              enabled: { type: "boolean", "x-mcp-header": "Enabled" },
              absent: { type: "string", "x-mcp-header": "Absent" },
              nullable: { type: "string", "x-mcp-header": "Nullable" },
            },
          },
        }),
        { scope: { name: "x\ny", count: 42, enabled: false, nullable: null } },
      ),
    ).toEqual({
      "Mcp-Param-Scope": "=?base64?eAp5?=",
      "Mcp-Param-Count": "42",
      "Mcp-Param-Enabled": "false",
    });
  });
  it.each(["", "Bad Header", "Line\r\nInjected"])(
    "rejects invalid annotation names before issuing requests",
    (name) => {
      expect(() =>
        mcpToolHeaders(
          tool({ value: { type: "string", "x-mcp-header": name } }),
          { value: "safe" },
        ),
      ).toThrow("Invalid MCP header annotations");
    },
  );
  it("rejects case-insensitive duplicate header names", () => {
    expect(() =>
      mcpToolHeaders(
        tool({
          a: { type: "string", "x-mcp-header": "Tenant" },
          b: { type: "string", "x-mcp-header": "tenant" },
        }),
        {},
      ),
    ).toThrow("Invalid MCP header annotations");
  });
  it.each(["number", "array", "object"])(
    "rejects non-primitive annotation types %s",
    (type) => {
      expect(() =>
        mcpToolHeaders(tool({ value: { type, "x-mcp-header": "Value" } }), {}),
      ).toThrow("Invalid MCP header annotations");
    },
  );
  it.each([
    { items: { type: "string", "x-mcp-header": "Nested" } },
    { anyOf: [{ type: "string", "x-mcp-header": "Nested" }] },
    { $defs: { value: { type: "string", "x-mcp-header": "Nested" } } },
  ])("rejects annotations outside static properties paths", (schema) => {
    expect(() => mcpToolHeaders({ inputSchema: schema }, {})).toThrow(
      "Invalid MCP header annotations",
    );
  });
  it("does not interpret JSON example data as schema keywords", () => {
    expect(
      mcpToolHeaders(
        {
          inputSchema: {
            type: "object",
            examples: [{ "x-mcp-header": "data" }],
          },
        },
        {},
      ),
    ).toEqual({});
  });
  it.each([1.5, Number.MAX_SAFE_INTEGER + 1, "42"])(
    "rejects values violating an integer header contract",
    (value) => {
      expect(() =>
        mcpToolHeaders(
          tool({ value: { type: "integer", "x-mcp-header": "Count" } }),
          { value },
        ),
      ).toThrow("MCP header argument violates its schema");
    },
  );
  it("does not resolve network references", () => {
    expect(
      mcpToolHeaders(
        tool({ value: { $ref: "https://never-fetch.invalid/schema" } }),
        {},
      ),
    ).toEqual({});
  });
});
