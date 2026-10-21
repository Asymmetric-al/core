export function encodeMcpHeader(value) {
  if (
    /^[\t\x20-\x7e]*$/.test(value) &&
    value.trim() === value &&
    !(value.startsWith("=?base64?") && value.endsWith("?="))
  )
    return value;
  return `=?base64?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

const schemaMaps = new Set([
  "properties",
  "patternProperties",
  "$defs",
  "definitions",
  "dependentSchemas",
]);
const schemaArrays = new Set(["allOf", "anyOf", "oneOf", "prefixItems"]);
const schemaValues = new Set([
  "items",
  "not",
  "if",
  "then",
  "else",
  "contains",
  "additionalProperties",
  "propertyNames",
  "unevaluatedItems",
  "unevaluatedProperties",
  "contentSchema",
]);

/** Validate only the protocol's annotation contract; never fetch schema refs. */
export function mcpToolHeaders(tool, args = {}) {
  const annotations = [];
  const names = new Set();
  const pending = [
    { schema: tool?.inputSchema, path: [], reachable: true, depth: 0 },
  ];
  let visited = 0;
  while (pending.length) {
    const { schema, path, reachable, depth } = pending.pop();
    if (!schema || typeof schema !== "object") continue;
    if (++visited > 4096 || depth > 32)
      throw new Error("Invalid MCP header annotations");
    if (Object.hasOwn(schema, "x-mcp-header")) {
      const name = schema["x-mcp-header"];
      if (
        !reachable ||
        !path.length ||
        typeof name !== "string" ||
        !/^[!#$%&'*+.^_`|~0-9a-z-]+$/i.test(name) ||
        names.has(name.toLowerCase()) ||
        !["string", "integer", "boolean"].includes(schema.type)
      )
        throw new Error("Invalid MCP header annotations");
      names.add(name.toLowerCase());
      annotations.push({ name, path, type: schema.type });
    }
    for (const [keyword, value] of Object.entries(schema)) {
      if (!value || typeof value !== "object") continue;
      if (schemaMaps.has(keyword)) {
        for (const [property, nested] of Object.entries(value))
          pending.push({
            schema: nested,
            path: [...path, property],
            reachable: reachable && keyword === "properties",
            depth: depth + 1,
          });
      } else if (schemaArrays.has(keyword) && Array.isArray(value)) {
        for (const nested of value)
          pending.push({
            schema: nested,
            path,
            reachable: false,
            depth: depth + 1,
          });
      } else if (schemaValues.has(keyword)) {
        pending.push({
          schema: value,
          path,
          reachable: false,
          depth: depth + 1,
        });
      }
    }
  }
  const headers = {};
  for (const { name, path, type } of annotations) {
    let value = args;
    for (const property of path)
      value =
        value && typeof value === "object" && Object.hasOwn(value, property)
          ? value[property]
          : undefined;
    if (value === undefined || value === null) continue;
    if (
      type === "integer" ? !Number.isSafeInteger(value) : typeof value !== type
    )
      throw new Error("MCP header argument violates its schema");
    headers[`Mcp-Param-${name}`] = encodeMcpHeader(String(value));
  }
  return headers;
}
