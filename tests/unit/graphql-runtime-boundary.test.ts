import { readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const productRequire = createRequire(
  resolve(root, "packages/graphql/package.json"),
);
const cmsRequire = createRequire(
  realpathSync(
    resolve(root, "apps/admin/node_modules/@payloadcms/next/package.json"),
  ),
);
const yogaRequire = createRequire(productRequire.resolve("graphql-yoga"));
const product = productRequire("graphql");
const cms = cmsRequire("graphql");
const productManifest = JSON.parse(
  readFileSync(resolve(root, "packages/graphql/package.json"), "utf8"),
);

describe("product and CMS GraphQL runtime ownership", () => {
  it("uses the pinned GraphQL17 runtime for product Yoga execution", () => {
    expect(product.versionInfo.major).toBe(17);
    expect(product.version).toBe(productManifest.dependencies.graphql);
    expect(realpathSync(yogaRequire.resolve("graphql"))).toBe(
      realpathSync(productRequire.resolve("graphql")),
    );
  });

  it("keeps Payload's supported GraphQL16 runtime in its CMS dependency graph", () => {
    expect(cms.versionInfo.major).toBe(16);
    expect(cms.GraphQLSchema).not.toBe(product.GraphQLSchema);
    expect(realpathSync(cmsRequire.resolve("graphql"))).not.toBe(
      realpathSync(productRequire.resolve("graphql")),
    );
    const productSchema = product.buildSchema("type Query { product: String }");
    const cmsSchema = cms.buildSchema("type Query { cms: String }");
    expect(product.validateSchema(productSchema)).toEqual([]);
    expect(cms.validateSchema(cmsSchema)).toEqual([]);
    expect(() => cms.validateSchema(productSchema)).toThrow();
    expect(() => product.validateSchema(cmsSchema)).toThrow();
  });
});
