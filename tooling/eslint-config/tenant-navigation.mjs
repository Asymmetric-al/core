// One way to build an address (plan 5.2; AL-2675; council round 1, A10).
//
// The signed-in pages of Mission Control and the missionary workspace render
// under `/<tenant>[~<sub-role>]`, and crossing that segment's boundary is a
// document load. Only the helpers know both: `TenantLink`, `useTenantRouter`,
// `useRoutePathname` (`@asym/auth/tenant-navigation`), `redirectInTenant`,
// `permanentRedirectInTenant` (`@asym/auth/tenant-server`) and `loadDocument`
// (`@asym/database/document-reload`). Each behaves as the Next.js original
// where there is no tenant segment, so the rule holds across both apps and
// the shared packages, and the helper modules themselves are the only
// exception.
//
// A rule of its own, not `no-restricted-imports`: that rule REPLACES earlier
// entries for a matching file (see restricted-imports.mjs), so an entry for
// these files would drop the cross-app, Supabase and table-engine bans in
// one config or another; and it does not see `require` or `import()`.
//
// Council round 2, AR1: a write through the history API keeps the address
// only when it is taken from the live location (`window.location`, or a
// variable built from it), is a fragment or a query on it, or is built by the
// tenant helper (`useTenantHref()`'s function); any other address is
// reported. `next/form` and a literal internal `<form action>` are reported
// too. Not covered: a `<form action>` or a `router`-like call whose address
// is computed at run time from something else; the helpers and review cover
// those.

import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));

const NEXT_LINK = "next/link";
const NEXT_FORM = "next/form";
const NEXT_NAVIGATION = "next/navigation";
const NAVIGATION_MODULE = "@asym/auth/tenant-navigation";
const SERVER_MODULE = "@asym/auth/tenant-server";

/** The Next.js navigation APIs that know nothing of the tenant prefix. */
const BANNED_NAVIGATION = {
  useRouter: ["useTenantRouter", NAVIGATION_MODULE],
  usePathname: ["useRoutePathname", NAVIGATION_MODULE],
  redirect: ["redirectInTenant", SERVER_MODULE],
  permanentRedirect: ["permanentRedirectInTenant", SERVER_MODULE],
};

/** Workspaces the rule covers, with the helper modules each one holds. */
export const tenantNavigationScopes = {
  "apps/admin": [],
  "apps/missionary": [],
  "packages/ui": [],
  "packages/lib": [],
  "packages/missionary": [],
  "packages/api": [],
  "packages/auth": ["tenant-navigation.tsx", "tenant-server.ts"],
  "packages/database": ["document-reload.ts"],
};

/**
 * Modules whose `Link` renders through the tenant helpers, by workspace:
 * Payload's `Link` (and Web Studio's re-export of it) renders through the
 * router adapter, which is built on `TenantLink` and `useTenantRouter`
 * (`apps/admin/src/cms/payload-next-router-adapter.tsx`).
 */
const ADAPTER_LINKS = {
  "apps/admin": ["@payloadcms/ui", "src/cms-ui/web-studio/routing.ts"],
};

/** The leading text of a string a node always starts with, when it is static. */
function staticPrefix(node) {
  if (!node) return null;
  switch (node.type) {
    case "Literal":
      return typeof node.value === "string" ? node.value : null;
    case "TemplateLiteral":
      return node.quasis[0]?.value.cooked ?? null;
    case "BinaryExpression":
      return node.operator === "+" ? staticPrefix(node.left) : null;
    case "JSXExpressionContainer":
      return staticPrefix(node.expression);
    case "TSAsExpression":
    case "TSSatisfiesExpression":
      return staticPrefix(node.expression);
    default:
      return null;
  }
}

/** An address on this origin's path, not protocol-relative: `/`, `/crm`. */
function isInternalAbsolute(prefix) {
  return typeof prefix === "string" && /^\/(?![/\\])/.test(prefix);
}

function moduleOf(node) {
  const value = staticPrefix(node);
  return value === NEXT_LINK || value === NEXT_NAVIGATION ? value : null;
}

function withoutExtension(file) {
  return file.replace(/\.(?:[cm]?[jt]sx?)$/, "");
}

function memberName(node) {
  if (!node || node.type !== "MemberExpression") return null;
  if (!node.computed && node.property.type === "Identifier") {
    return node.property.name;
  }
  return node.computed && node.property.type === "Literal"
    ? String(node.property.value)
    : null;
}

const noPrefixlessNavigation = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Build addresses inside Mission Control and the missionary workspace through the tenant helpers.",
    },
    schema: [
      {
        type: "object",
        properties: {
          // Bare specifiers, or absolute paths of local modules, whose
          // `Link` export renders through the tenant helpers.
          adapterLinks: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      link: "next/link drops the tenant prefix and the segment crossing: use TenantLink from @asym/auth/tenant-navigation.",
      navigation:
        "{{name}} from next/navigation drops the tenant prefix: use {{helper}} from {{module}}.",
      namespace:
        "A namespace import of {{module}} reaches the APIs that drop the tenant prefix: import the names you use, through the tenant helpers.",
      reexport:
        "Re-exporting {{module}} hands on the APIs that drop the tenant prefix: export the tenant helpers instead.",
      dynamic:
        "Loading {{module}} at run time bypasses the tenant helpers: import TenantLink or the tenant router from @asym/auth/tenant-navigation.",
      href: "A literal internal href on <{{element}}> drops the tenant prefix: render it through TenantLink, as the element or as its `render`.",
      location:
        "Writing window.location bypasses the tenant helpers: use loadDocument from @asym/database/document-reload, or the tenant router.",
      history:
        "A history write whose address is not the live location's drops the tenant prefix: build it from window.location (or a URL made from it), or with useTenantHref().",
      form: "{{what}} submits to an address without the tenant prefix: navigate through the tenant router.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    // Local names bound to TenantLink, so `import { TenantLink as Link }` is
    // recognized as the helper.
    const tenantLinkNames = new Set(["TenantLink"]);
    const adapterLinks = new Set(
      (context.options[0]?.adapterLinks ?? []).map(withoutExtension),
    );

    /** Whether `source`, as imported here, is a module whose Link is the helper's. */
    function isAdapterLinkModule(source) {
      if (adapterLinks.has(source)) return true;
      if (!source.startsWith(".")) return false;
      const resolved = path.resolve(path.dirname(context.filename), source);
      return adapterLinks.has(withoutExtension(resolved));
    }

    function isGlobalLocation(node) {
      if (node.type === "Identifier" && node.name === "location") {
        let scope = sourceCode.getScope(node);
        while (scope) {
          const variable = scope.set.get("location");
          if (variable && variable.defs.length > 0) return false;
          scope = scope.upper;
        }
        return true;
      }
      return (
        node.type === "MemberExpression" &&
        memberName(node) === "location" &&
        node.object.type === "Identifier" &&
        ["window", "document", "globalThis", "self"].includes(node.object.name)
      );
    }

    // Local names of the function useTenantHref() returns.
    const tenantHrefNames = new Set();

    /** Whether an expression reads the live location anywhere inside it. */
    function readsLocation(node, depth = 0) {
      if (!node || typeof node !== "object" || depth > 2) return false;
      if (isGlobalLocation(node)) return true;
      if (node.type === "Identifier") {
        // One step through a local variable: const url = new URL(location.href)
        let scope = sourceCode.getScope(node);
        while (scope) {
          const variable = scope.set.get(node.name);
          if (variable) {
            return variable.defs.some(
              (def) =>
                def.node.type === "VariableDeclarator" &&
                readsLocation(def.node.init, depth + 1),
            );
          }
          scope = scope.upper;
        }
        return false;
      }
      for (const [key, value] of Object.entries(node)) {
        if (key === "parent" || key === "loc" || key === "range") continue;
        if (Array.isArray(value)) {
          if (value.some((child) => readsLocation(child, depth))) return true;
        } else if (value && typeof value.type === "string") {
          if (readsLocation(value, depth)) return true;
        }
      }
      return false;
    }

    /** Whether a history write's address keeps the document's prefix. */
    function keepsAddress(url) {
      if (!url) return true;
      if (url.type === "Literal" && url.value == null) return true;
      if (url.type === "Identifier" && url.name === "undefined") return true;
      const prefix = staticPrefix(url);
      if (typeof prefix === "string" && /^[?#]/.test(prefix)) return true;
      if (
        url.type === "CallExpression" &&
        url.callee.type === "Identifier" &&
        tenantHrefNames.has(url.callee.name)
      ) {
        return true;
      }
      return readsLocation(url);
    }

    function isGlobalHistory(node) {
      if (node.type === "Identifier" && node.name === "history") {
        let scope = sourceCode.getScope(node);
        while (scope) {
          const variable = scope.set.get("history");
          if (variable && variable.defs.length > 0) return false;
          scope = scope.upper;
        }
        return true;
      }
      return (
        node.type === "MemberExpression" &&
        memberName(node) === "history" &&
        node.object.type === "Identifier" &&
        ["window", "globalThis", "self"].includes(node.object.name)
      );
    }

    function reportNavigationName(node, name) {
      const banned = BANNED_NAVIGATION[name];
      if (!banned) return;
      context.report({
        node,
        messageId: "navigation",
        data: { name, helper: banned[0], module: banned[1] },
      });
    }

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (source === NAVIGATION_MODULE) {
          for (const specifier of node.specifiers) {
            if (
              specifier.type === "ImportSpecifier" &&
              specifier.imported.name === "TenantLink"
            ) {
              tenantLinkNames.add(specifier.local.name);
            }
          }
          return;
        }
        if (isAdapterLinkModule(source)) {
          for (const specifier of node.specifiers) {
            if (
              specifier.type === "ImportSpecifier" &&
              specifier.imported.name === "Link"
            ) {
              tenantLinkNames.add(specifier.local.name);
            }
          }
          return;
        }
        if (node.importKind === "type") return;
        if (source === NEXT_LINK) {
          context.report({ node, messageId: "link" });
          return;
        }
        if (source === NEXT_FORM) {
          context.report({
            node,
            messageId: "form",
            data: { what: "next/form" },
          });
          return;
        }
        if (source !== NEXT_NAVIGATION) return;
        for (const specifier of node.specifiers) {
          if (specifier.type === "ImportNamespaceSpecifier") {
            context.report({
              node: specifier,
              messageId: "namespace",
              data: { module: source },
            });
          } else if (
            specifier.type === "ImportSpecifier" &&
            specifier.importKind !== "type"
          ) {
            reportNavigationName(specifier, specifier.imported.name);
          }
        }
      },
      ExportAllDeclaration(node) {
        const source = moduleOf(node.source);
        if (source && node.exportKind !== "type") {
          context.report({
            node,
            messageId: "reexport",
            data: { module: source },
          });
        }
      },
      ExportNamedDeclaration(node) {
        const source = moduleOf(node.source);
        if (!source || node.exportKind === "type") return;
        if (source === NEXT_LINK) {
          context.report({
            node,
            messageId: "reexport",
            data: { module: source },
          });
          return;
        }
        for (const specifier of node.specifiers) {
          reportNavigationName(specifier, specifier.local.name);
        }
      },
      ImportExpression(node) {
        const source = moduleOf(node.source);
        if (source) {
          context.report({
            node,
            messageId: "dynamic",
            data: { module: source },
          });
        }
      },
      CallExpression(node) {
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "require"
        ) {
          const source = moduleOf(node.arguments[0]);
          if (source) {
            context.report({
              node,
              messageId: "dynamic",
              data: { module: source },
            });
          }
          return;
        }
        // history.pushState(state, "", url), window.history.replaceState(...)
        if (
          node.callee.type === "MemberExpression" &&
          ["pushState", "replaceState"].includes(memberName(node.callee)) &&
          isGlobalHistory(node.callee.object)
        ) {
          if (!keepsAddress(node.arguments[2])) {
            context.report({ node, messageId: "history" });
          }
          return;
        }
        // location.assign("/x"), window.location.replace("/x")
        if (
          node.callee.type === "MemberExpression" &&
          ["assign", "replace"].includes(memberName(node.callee)) &&
          isGlobalLocation(node.callee.object)
        ) {
          context.report({ node, messageId: "location" });
        }
      },
      AssignmentExpression(node) {
        const target = node.left;
        // window.location = "/x"
        if (isGlobalLocation(target)) {
          context.report({ node, messageId: "location" });
          return;
        }
        // window.location.href = "/x", location.pathname = "/x"
        if (
          target.type === "MemberExpression" &&
          ["href", "pathname"].includes(memberName(target)) &&
          isGlobalLocation(target.object)
        ) {
          context.report({ node, messageId: "location" });
        }
      },
      VariableDeclarator(node) {
        // const toHref = useTenantHref();
        if (
          node.id.type === "Identifier" &&
          node.init?.type === "CallExpression" &&
          node.init.callee.type === "Identifier" &&
          node.init.callee.name === "useTenantHref"
        ) {
          tenantHrefNames.add(node.id.name);
        }
      },
      JSXOpeningElement(node) {
        // <form action="/search">: a literal internal action.
        if (node.name.type === "JSXIdentifier" && node.name.name === "form") {
          const action = node.attributes.find(
            (attribute) =>
              attribute.type === "JSXAttribute" &&
              attribute.name.type === "JSXIdentifier" &&
              attribute.name.name === "action",
          );
          if (action && isInternalAbsolute(staticPrefix(action.value))) {
            context.report({
              node: action,
              messageId: "form",
              data: { what: "<form action>" },
            });
          }
          return;
        }
        const href = node.attributes.find(
          (attribute) =>
            attribute.type === "JSXAttribute" &&
            attribute.name.type === "JSXIdentifier" &&
            attribute.name.name === "href",
        );
        if (!href || !isInternalAbsolute(staticPrefix(href.value))) return;
        const element = sourceCode.getText(node.name);
        // Intrinsic elements other than <a> carry asset hrefs (<link>, <use>).
        const intrinsic =
          node.name.type === "JSXIdentifier" && /^[a-z]/.test(node.name.name);
        if (intrinsic && node.name.name !== "a") return;
        if (tenantLinkNames.has(element)) return;
        // `render={<TenantLink … />}`: the helper renders the address.
        const rendersThrough = node.attributes.some(
          (attribute) =>
            attribute.type === "JSXAttribute" &&
            attribute.name.type === "JSXIdentifier" &&
            attribute.name.name === "render",
        );
        if (rendersThrough) return;
        context.report({ node: href, messageId: "href", data: { element } });
      },
    };
  },
};

/** Whether a function parameter names the tenant: `tenantId`, `{ tenantId }`. */
function paramNamesTenant(param) {
  switch (param.type) {
    case "Identifier":
      return /tenant/i.test(param.name);
    case "AssignmentPattern":
      return paramNamesTenant(param.left);
    case "TSParameterProperty":
      return paramNamesTenant(param.parameter);
    case "ObjectPattern":
      return param.properties.some(
        (property) =>
          property.type === "Property" &&
          property.key.type === "Identifier" &&
          /tenant/i.test(property.key.name),
      );
    default:
      return false;
  }
}

function cacheDirectiveIn(statements) {
  return statements.find(
    (statement) =>
      statement.type === "ExpressionStatement" &&
      typeof statement.directive === "string" &&
      /^use cache(?::|$)/.test(statement.directive),
  );
}

// The tenant reaches a cached read only as an argument (council round 1,
// A21). Under the rewrite a page's params hold the route's parameters and no
// tenant, so a cache in page code would be shared by every tenant; a cached
// read in packages/api takes the tenant, which then keys its cache.
const noTenantlessCache = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Cache only in reads that take the tenant as an argument; signed-in page code caches nothing itself.",
    },
    schema: [
      {
        type: "object",
        properties: { readsTakeTenant: { type: "boolean" } },
        additionalProperties: false,
      },
    ],
    messages: {
      page: 'Page code caches nothing itself ("use cache"): under the tenant address a cache keyed on the route\'s params is shared by every tenant. Read through a function in packages/api that takes the tenant as an argument.',
      noTenant:
        'A cached read ("use cache") takes the tenant as an argument, so that the tenant keys its cache: add a tenantId parameter.',
      fileLevel:
        'A file-level "use cache" caches every export whatever its arguments: put it in each read that takes the tenant.',
    },
  },
  create(context) {
    const readsTakeTenant = context.options[0]?.readsTakeTenant === true;
    function checkFunction(node) {
      if (node.body?.type !== "BlockStatement") return;
      const directive = cacheDirectiveIn(node.body.body);
      if (!directive) return;
      if (!readsTakeTenant) {
        context.report({ node: directive, messageId: "page" });
      } else if (!node.params.some(paramNamesTenant)) {
        context.report({ node: directive, messageId: "noTenant" });
      }
    }
    return {
      Program(node) {
        const directive = cacheDirectiveIn(node.body);
        if (directive) {
          context.report({
            node: directive,
            messageId: readsTakeTenant ? "fileLevel" : "page",
          });
        }
      },
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
      ArrowFunctionExpression: checkFunction,
    };
  },
};

export const tenantNavigationPlugin = {
  meta: { name: "core-tenant-navigation" },
  rules: {
    "no-prefixless-navigation": noPrefixlessNavigation,
    "no-tenantless-cache": noTenantlessCache,
  },
};

/**
 * Flat-config entries for one workspace (from its own eslint.config.mjs), or
 * for every covered workspace (from the root config).
 */
export function tenantNavigationConfig({
  workspace,
  rootDir = repositoryRoot,
} = {}) {
  const scopes = workspace ? [workspace] : Object.keys(tenantNavigationScopes);
  return scopes.map((scope) => {
    if (!(scope in tenantNavigationScopes)) {
      throw new Error(`tenantNavigationConfig: unknown workspace ${scope}`);
    }
    const helpers = tenantNavigationScopes[scope];
    const adapterLinks = (ADAPTER_LINKS[scope] ?? []).map((entry) =>
      entry.startsWith("@") ? entry : path.join(rootDir, scope, entry),
    );
    return {
      name: `core/tenant-navigation/${scope}`,
      basePath: path.join(rootDir, scope),
      files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
      ...(helpers.length > 0 ? { ignores: helpers } : {}),
      plugins: { "tenant-navigation": tenantNavigationPlugin },
      rules: {
        "tenant-navigation/no-prefixless-navigation": [
          "error",
          ...(adapterLinks.length > 0 ? [{ adapterLinks }] : []),
        ],
        // The reads in packages/api take the tenant; the apps and the shared
        // UI cache nothing themselves. Auth and database hold no reads.
        ...(scope === "packages/auth" || scope === "packages/database"
          ? {}
          : {
              "tenant-navigation/no-tenantless-cache": [
                "error",
                { readsTakeTenant: scope === "packages/api" },
              ],
            }),
      },
    };
  });
}
