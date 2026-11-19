// Calls from a page to the app's own API carry the tenant (plan 5.2; WP2b,
// AL-2675). Page code calls the app's `/api` routes through one wrapper,
// `ownApiFetch` in `@asym/database/own-api`, which sends the document's tenant
// and assignment as request headers. This rule refuses any other way of
// reaching an own-API path from page code: a direct `fetch`, a beacon, an
// event source, socket or request object, an XMLHttpRequest, a third-party
// HTTP client (axios, ky, ofetch), and a navigation (a link, a form or media
// address, a DOM write of one, `window.open`, a location change, a router
// push or a server redirect), which can carry no header at all.
//
// It also refuses the global `fetch` used as a value: aliased, bound, called
// through `call` or `apply`, or handed over as a `fetcher`. The global
// `fetch` is only ever called where its address is written, so the rule can
// read that address; `ownApiFetch` is what a caller hands over for the app's
// own API.
//
// Payload's REST routes, under Web Studio's `routes.api`, are outside this
// rule: they are not the app's own API, Web Studio's document fetch hook
// scopes them, and their address comes from Payload's runtime config, which
// the rule cannot read.
//
// The rule has no exemption mechanism of its own, and none is configured: a
// call that cannot move onto the wrapper is a finding, not an exception.
//
// What it can see. ESLint reads one module at a time, and the rule stays in
// that module: it follows an address through a string or template literal, a
// `const` (or a `let` assigned only own-API values), a property of an object
// literal held in a `const`, a conditional or `??`/`||` choice, a `+`
// concatenation, an origin (`location.origin`, `self.origin`, a `const` that
// holds one) before the path, `new URL(…)`, `String(…)` and `.toString()`,
// and a parameter of a function in the same module whose call sites pass one.
//
// What it cannot see, by name:
// - an address built in another module and passed in, or returned by a
//   function of another module;
// - an address read from data at run time (a server's JSON, a link in a
//   record), such as a contribution batch's `nextAction.href`;
// - a `fetch` captured through a local alias of `window` or a parameter
//   (`target.fetch`), as Web Studio's document fetch hook does;
// - an SWR or TanStack Query key that names a path (a key is not a request;
//   the fetcher it is given decides how the call is made);
// - HTTP clients other than axios, ky and ofetch, and a router other than
//   `useRouter()` from Next.js.

const OWN_API_PATH = /^\/api(?:[/?#]|$)/;
const GLOBAL_OBJECTS = new Set(["window", "globalThis", "self"]);
const HTTP_METHODS = new Set([
  "GET",
  "HEAD",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
]);
/** Attributes and DOM properties whose value the browser loads as a page or a resource. */
const NAVIGATION_ATTRIBUTES = new Set([
  "href",
  "action",
  "formAction",
  "src",
  "data",
  "poster",
]);
const SET_ATTRIBUTE_NAMES = new Set([
  "href",
  "action",
  "formaction",
  "src",
  "data",
  "poster",
]);
/** Third-party HTTP clients, by the module they are imported from. */
const HTTP_CLIENT_MODULES = new Set(["axios", "ky", "ofetch"]);
const HTTP_CLIENT_METHODS = new Set([
  "get",
  "head",
  "post",
  "put",
  "patch",
  "delete",
  "options",
  "request",
  "raw",
  "native",
]);
const ROUTER_METHODS = new Set(["push", "replace", "prefetch"]);
const REDIRECT_FUNCTIONS = new Set(["redirect", "permanentRedirect"]);
const WRAPPER_TYPES = new Set([
  "TSAsExpression",
  "TSSatisfiesExpression",
  "TSNonNullExpression",
  "TSTypeAssertion",
  "ChainExpression",
  "ParenthesizedExpression",
]);
const MAX_DEPTH = 12;

const CALL_MESSAGE =
  "Call the app's own API through ownApiFetch from @asym/database/own-api: it sends the document's tenant and assignment (plan 5.2). A direct call to an own-API path is refused.";
const NAVIGATION_MESSAGE =
  "An own-API path opened as a page address carries no tenant header (plan 5.2). Fetch it with ownApiFetch, or download it with ownApiDownload, from @asym/database/own-api.";
const FETCH_VALUE_MESSAGE =
  "Call the global fetch where its address is written; do not alias, bind or hand it over (plan 5.2). The own-API rule reads a call's address, not a value's. Hand over ownApiFetch for the app's own API.";

function unwrap(node) {
  let current = node;
  while (
    current &&
    (current.type === "TSAsExpression" ||
      current.type === "TSSatisfiesExpression" ||
      current.type === "TSNonNullExpression" ||
      current.type === "TSTypeAssertion" ||
      current.type === "ChainExpression" ||
      current.type === "ParenthesizedExpression")
  ) {
    current = current.expression;
  }
  return current;
}

function findVariable(scope, name) {
  for (let current = scope; current; current = current.upper) {
    const variable = current.set.get(name);
    if (variable) return variable;
  }
  return null;
}

/** Whether `name` is the global binding here, not a local or imported one. */
function isGlobalName(sourceCode, node, name) {
  const variable = findVariable(sourceCode.getScope(node), name);
  return !variable || variable.defs.length === 0;
}

function isGlobalObject(sourceCode, node) {
  const object = unwrap(node);
  return (
    object?.type === "Identifier" &&
    GLOBAL_OBJECTS.has(object.name) &&
    isGlobalName(sourceCode, object, object.name)
  );
}

function propertyName(member) {
  if (member.type !== "MemberExpression") return null;
  if (!member.computed && member.property.type === "Identifier") {
    return member.property.name;
  }
  if (member.property.type === "Literal") return String(member.property.value);
  return null;
}

/** `location`, `window.location` or `document.location`. */
function isLocation(sourceCode, node) {
  const target = unwrap(node);
  if (target?.type === "Identifier") {
    return (
      target.name === "location" && isGlobalName(sourceCode, target, "location")
    );
  }
  if (
    target?.type !== "MemberExpression" ||
    propertyName(target) !== "location"
  )
    return false;
  const object = unwrap(target.object);
  return (
    isGlobalObject(sourceCode, object) ||
    (object?.type === "Identifier" &&
      object.name === "document" &&
      isGlobalName(sourceCode, object, "document"))
  );
}

/** The module an identifier is imported from, or `null`. */
function importSourceOf(sourceCode, node) {
  const variable = findVariable(sourceCode.getScope(node), node.name);
  const def = variable?.defs[0];
  if (def?.type !== "ImportBinding") return null;
  return def.parent?.source?.value ?? null;
}

/** A `const` declaration's initial value, or `null`. */
function constInit(sourceCode, node) {
  const variable = findVariable(sourceCode.getScope(node), node.name);
  const def = variable?.defs.find(
    (candidate) =>
      candidate.type === "Variable" &&
      candidate.parent?.kind === "const" &&
      candidate.node.init,
  );
  return def ? def.node.init : null;
}

/** `useRouter()` from Next.js, or a `const` that holds its result. */
function isRouter(sourceCode, rawNode) {
  let node = unwrap(rawNode);
  if (node?.type === "Identifier") node = unwrap(constInit(sourceCode, node));
  const callee = node?.type === "CallExpression" ? unwrap(node.callee) : null;
  return (
    callee?.type === "Identifier" &&
    callee.name === "useRouter" &&
    ["next/navigation", "next/router"].includes(
      importSourceOf(sourceCode, callee),
    )
  );
}

/** The page's own origin: `location.origin`, `self.origin`, or a `const` holding one. */
function isOrigin(sourceCode, rawNode, depth = 0) {
  const node = unwrap(rawNode);
  if (!node || depth > MAX_DEPTH) return false;
  if (node.type === "MemberExpression" && propertyName(node) === "origin") {
    const object = unwrap(node.object);
    return isLocation(sourceCode, object) || isGlobalObject(sourceCode, object);
  }
  if (node.type === "Identifier") {
    const init = constInit(sourceCode, node);
    return Boolean(init) && isOrigin(sourceCode, init, depth + 1);
  }
  return false;
}

/** An object literal's key, when it is a fixed name. */
function keyName(property) {
  if (property.type !== "Property") return null;
  if (!property.computed && property.key.type === "Identifier")
    return property.key.name;
  if (property.key.type === "Literal") return String(property.key.value);
  return null;
}

/** The object literal `node` stands for in this module: inline, a `const`, or a nested property. */
function objectLiteralOf(sourceCode, rawNode, depth = 0) {
  const node = unwrap(rawNode);
  if (!node || depth > MAX_DEPTH) return null;
  if (node.type === "ObjectExpression") return node;
  if (node.type === "Identifier") {
    const init = constInit(sourceCode, node);
    return init ? objectLiteralOf(sourceCode, init, depth + 1) : null;
  }
  if (node.type === "MemberExpression") {
    const name = propertyName(node);
    const owner = objectLiteralOf(sourceCode, node.object, depth + 1);
    const property = owner?.properties.find((p) => keyName(p) === name);
    return property
      ? objectLiteralOf(sourceCode, property.value, depth + 1)
      : null;
  }
  return null;
}

/** The function a parameter belongs to, and the name its module calls it by. */
function functionBinding(fn) {
  if (fn.type === "FunctionDeclaration" && fn.id) return fn.id;
  const parent = fn.parent;
  if (parent?.type === "VariableDeclarator" && parent.id.type === "Identifier")
    return parent.id;
  // `const f = useCallback((url) => …, [])` and other single wrappers.
  if (
    parent?.type === "CallExpression" &&
    parent.arguments[0] === fn &&
    parent.parent?.type === "VariableDeclarator" &&
    parent.parent.id.type === "Identifier"
  )
    return parent.parent.id;
  return null;
}

function createResolver(sourceCode) {
  function resolvesToOwnApi(rawNode, depth, seen) {
    const node = unwrap(rawNode);
    if (!node || depth > MAX_DEPTH || seen.has(node)) return false;
    seen.add(node);
    const next = (child) => resolvesToOwnApi(child, depth + 1, seen);

    switch (node.type) {
      case "Literal":
        return typeof node.value === "string" && OWN_API_PATH.test(node.value);
      case "TemplateLiteral": {
        const head = node.quasis[0]?.value.cooked ?? "";
        if (head.length > 0) return OWN_API_PATH.test(head);
        if (node.expressions.length === 0) return false;
        if (next(node.expressions[0])) return true;
        // `${location.origin}/api/…`: the page's own origin, then the path.
        return (
          isOrigin(sourceCode, node.expressions[0], depth + 1) &&
          OWN_API_PATH.test(node.quasis[1]?.value.cooked ?? "")
        );
      }
      case "ConditionalExpression":
        return next(node.consequent) || next(node.alternate);
      case "LogicalExpression":
        return next(node.left) || next(node.right);
      case "BinaryExpression":
        return (
          node.operator === "+" &&
          (next(node.left) ||
            (isOrigin(sourceCode, node.left, depth + 1) && next(node.right)))
        );
      case "NewExpression":
        return (
          node.callee.type === "Identifier" &&
          node.callee.name === "URL" &&
          node.arguments.length > 0 &&
          next(node.arguments[0])
        );
      case "CallExpression": {
        const callee = unwrap(node.callee);
        if (
          callee.type === "Identifier" &&
          ["String", "encodeURI"].includes(callee.name)
        )
          return node.arguments.length > 0 && next(node.arguments[0]);
        if (
          callee.type === "MemberExpression" &&
          ["toString", "concat", "trim"].includes(propertyName(callee))
        )
          return next(callee.object);
        return false;
      }
      case "MemberExpression": {
        const name = propertyName(node);
        if (["href", "pathname"].includes(name) && next(node.object))
          return true;
        // A property of an object literal held in this module.
        if (name === null) return false;
        const owner = objectLiteralOf(sourceCode, node.object, depth + 1);
        const property = owner?.properties.find((p) => keyName(p) === name);
        return Boolean(property) && next(property.value);
      }
      case "Identifier":
        return resolveIdentifier(node, depth, seen);
      default:
        return false;
    }
  }

  function resolveIdentifier(node, depth, seen) {
    const variable = findVariable(sourceCode.getScope(node), node.name);
    if (!variable) return false;
    const next = (child) => resolvesToOwnApi(child, depth + 1, seen);
    for (const def of variable.defs) {
      if (def.type === "Variable") {
        if (def.node.init && next(def.node.init)) return true;
        const written = variable.references.some(
          (reference) =>
            reference.isWrite() &&
            reference.writeExpr &&
            reference.writeExpr !== def.node.init &&
            next(reference.writeExpr),
        );
        if (written) return true;
      }
      if (def.type === "Parameter" && resolveParameter(def, node, depth, seen))
        return true;
    }
    return false;
  }

  function resolveParameter(def, identifier, depth, seen) {
    const fn = def.node;
    const index = fn.params.findIndex((param) => {
      const target = param.type === "AssignmentPattern" ? param.left : param;
      return target.type === "Identifier" && target.name === identifier.name;
    });
    if (index === -1) return false;
    const param = fn.params[index];
    if (
      param.type === "AssignmentPattern" &&
      resolvesToOwnApi(param.right, depth + 1, seen)
    )
      return true;
    const binding = functionBinding(fn);
    if (!binding) return false;
    const variable = findVariable(sourceCode.getScope(binding), binding.name);
    if (!variable) return false;
    return variable.references.some((reference) => {
      const call = reference.identifier.parent;
      return (
        call?.type === "CallExpression" &&
        call.callee === reference.identifier &&
        call.arguments.length > index &&
        resolvesToOwnApi(call.arguments[index], depth + 1, seen)
      );
    });
  }

  return (node) => resolvesToOwnApi(node, 0, new Set());
}

/**
 * The address argument of a direct transport call and whether it is a
 * request or a navigation, or `null`.
 */
function callTarget(sourceCode, node) {
  const callee = unwrap(node.callee);
  const args = node.arguments;
  const request = (target) => (target ? { target, kind: "call" } : null);
  const navigation = (target) =>
    target ? { target, kind: "navigation" } : null;
  if (callee.type === "Identifier") {
    if (callee.name === "fetch" && isGlobalName(sourceCode, callee, "fetch"))
      return request(args[0]);
    if (callee.name === "open" && isGlobalName(sourceCode, callee, "open"))
      return navigation(args[0]);
    const source = importSourceOf(sourceCode, callee);
    if (HTTP_CLIENT_MODULES.has(source)) return request(args[0]);
    if (source === "next/navigation" && REDIRECT_FUNCTIONS.has(callee.name))
      return navigation(args[0]);
    return null;
  }
  if (callee.type !== "MemberExpression") return null;
  const name = propertyName(callee);
  const object = unwrap(callee.object);
  if (name === "fetch" && isGlobalObject(sourceCode, object))
    return request(args[0]);
  if (name === "open" && isGlobalObject(sourceCode, object))
    return navigation(args[0]);
  if (name === "sendBeacon") return request(args[0]);
  if (
    (name === "assign" || name === "replace") &&
    isLocation(sourceCode, object)
  )
    return navigation(args[0]);
  if (ROUTER_METHODS.has(name) && isRouter(sourceCode, object))
    return navigation(args[0]);
  if (
    HTTP_CLIENT_METHODS.has(name) &&
    object?.type === "Identifier" &&
    HTTP_CLIENT_MODULES.has(importSourceOf(sourceCode, object))
  )
    return request(args[0]);
  if (name === "setAttribute" && args.length >= 2) {
    const attribute = unwrap(args[0]);
    if (
      attribute?.type === "Literal" &&
      typeof attribute.value === "string" &&
      SET_ATTRIBUTE_NAMES.has(attribute.value.toLowerCase())
    )
      return navigation(args[1]);
    return null;
  }
  // XMLHttpRequest#open(method, url), the method a literal or a variable.
  if (name === "open" && args.length >= 2) {
    const method = unwrap(args[0]);
    if (
      method?.type === "Literal" &&
      !(
        typeof method.value === "string" &&
        HTTP_METHODS.has(method.value.toUpperCase())
      )
    )
      return null;
    return request(args[1]);
  }
  return null;
}

/**
 * Whether `node` (the global `fetch`, or `window.fetch` and the like) is
 * called, tested with `typeof`, or written over, rather than used as a value.
 */
function isCalledOrAllowed(node) {
  let child = node;
  let parent = node.parent;
  while (
    parent &&
    WRAPPER_TYPES.has(parent.type) &&
    parent.expression === child
  ) {
    child = parent;
    parent = parent.parent;
  }
  if (!parent) return false;
  if (
    (parent.type === "CallExpression" || parent.type === "NewExpression") &&
    parent.callee === child
  )
    return true;
  if (parent.type === "UnaryExpression" && parent.operator === "typeof")
    return true;
  return parent.type === "AssignmentExpression" && parent.left === child;
}

export const noDirectOwnApiCall = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Refuse a direct call to the app's own API; page code uses ownApiFetch (plan 5.2).",
    },
    schema: [],
    messages: {
      call: CALL_MESSAGE,
      navigation: NAVIGATION_MESSAGE,
      fetchValue: FETCH_VALUE_MESSAGE,
    },
  },
  create(context) {
    const { sourceCode } = context;
    const isOwnApi = createResolver(sourceCode);
    return {
      CallExpression(node) {
        const found = callTarget(sourceCode, node);
        if (!found || !isOwnApi(found.target)) return;
        context.report({ node: found.target, messageId: found.kind });
      },
      // `window.fetch`, `globalThis.fetch` or `self.fetch` used as a value.
      MemberExpression(node) {
        if (
          propertyName(node) !== "fetch" ||
          !isGlobalObject(sourceCode, node.object) ||
          isCalledOrAllowed(node)
        )
          return;
        context.report({ node, messageId: "fetchValue" });
      },
      // The global `fetch` used as a value: every reference that is not a
      // call, a `typeof` test, a write or a type.
      "Program:exit"(program) {
        const globalScope = sourceCode.getScope(program);
        const declared = globalScope.set.get("fetch");
        const references = [
          ...(declared && declared.defs.length === 0
            ? declared.references
            : []),
          ...globalScope.through.filter(
            (reference) => reference.identifier.name === "fetch",
          ),
        ];
        for (const reference of references) {
          const identifier = reference.identifier;
          if (identifier.parent?.type === "TSTypeQuery") continue;
          if (reference.isTypeReference && !reference.isValueReference)
            continue;
          if (isCalledOrAllowed(identifier)) continue;
          context.report({ node: identifier, messageId: "fetchValue" });
        }
      },
      NewExpression(node) {
        const callee = unwrap(node.callee);
        if (
          callee.type !== "Identifier" ||
          !["EventSource", "Request", "WebSocket"].includes(callee.name) ||
          !isGlobalName(sourceCode, callee, callee.name)
        )
          return;
        const target = node.arguments[0];
        if (target && isOwnApi(target))
          context.report({ node: target, messageId: "call" });
      },
      AssignmentExpression(node) {
        const left = unwrap(node.left);
        // A location change, or a DOM write of an address the browser loads
        // (`a.href =`, `form.action =`, `img.src =`, …). `data` is left out
        // here: as a property name it is too common to mean an <object>.
        const isAddressWrite =
          isLocation(sourceCode, left) ||
          (left.type === "MemberExpression" &&
            NAVIGATION_ATTRIBUTES.has(propertyName(left)) &&
            propertyName(left) !== "data");
        if (isAddressWrite && isOwnApi(node.right))
          context.report({ node: node.right, messageId: "navigation" });
      },
      JSXAttribute(node) {
        if (
          node.name.type !== "JSXIdentifier" ||
          !NAVIGATION_ATTRIBUTES.has(node.name.name) ||
          !node.value
        )
          return;
        const value =
          node.value.type === "JSXExpressionContainer"
            ? node.value.expression
            : node.value;
        if (value.type !== "JSXEmptyExpression" && isOwnApi(value))
          context.report({ node: value, messageId: "navigation" });
      },
    };
  },
};

export const ownApiPlugin = {
  meta: { name: "@asym/own-api" },
  rules: { "no-direct-call": noDirectOwnApiCall },
};

/**
 * Which workspaces the rule covers (council round 1 on slice B, SB8). Every
 * `apps/*` and `packages/*` workspace is in exactly one list: linted, through
 * its own lint config and the root config's block, or excluded by name with
 * the reason. `tests/unit/scripts/own-api-lint-tree.test.ts` fails on a
 * workspace that is in neither, so a new workspace has to be placed.
 */
export const ownApiWorkspaces = {
  linted: [
    "apps/admin",
    "apps/donor",
    "apps/missionary",
    "packages/auth",
    "packages/database",
    "packages/lib",
    "packages/missionary",
    "packages/ui",
  ],
  excluded: {
    "apps/factory-console":
      "The operator Console of the software factory, not a product app: it has no tenant, and its pages call only the Console's own API on the factory VM.",
    "packages/api":
      "The server side of the own API: route handlers and the reads behind them. Its /api strings are addresses it hands to pages (a receipt, a batch's next step), never calls; its only client file is a test fixture.",
    "packages/config":
      "Configuration values shared by the apps; it makes no request.",
    "packages/email":
      "Email templates rendered on the server; it makes no request.",
    "packages/env": "Environment parsing and validation; it makes no request.",
    "packages/eve-runtime":
      "The product Eve runtime, on the server; its requests go to GitHub and model providers, never to the app's own API.",
    "packages/graphql":
      "The server's GraphQL handler; /api/graphql is its own endpoint setting, read on the server, not a call from a page.",
    "packages/mock-data":
      "Fixtures for tests and demonstrations; it makes no request.",
  },
};

/**
 * The rule as a flat-config block. Each linted workspace (the three apps and
 * the packages their pages import) composes it into its own config, because
 * `bun run lint` lints every workspace with that workspace's config.
 */
export const ownApiConfig = [
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    plugins: { "own-api": ownApiPlugin },
    rules: { "own-api/no-direct-call": "error" },
  },
];

export default ownApiConfig;
