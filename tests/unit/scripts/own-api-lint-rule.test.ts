import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "eslint";
import { afterAll, describe, it } from "vitest";

import { noDirectOwnApiCall } from "../../../tooling/eslint-config/own-api.mjs";

/**
 * The own-API lint rule (plan 5.2, "Calls from a page to the app's own API
 * carry the tenant too"; WP2b, AL-2675): page code reaches the app's `/api`
 * routes only through `ownApiFetch`, which sends the document's tenant and
 * assignment. Every other way of reaching an own-API path is refused.
 */

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: { ecmaFeatures: { jsx: true } },
    ecmaVersion: "latest",
    sourceType: "module",
  },
});

const call = [{ messageId: "call" }] as const;
const navigation = [{ messageId: "navigation" }] as const;
const fetchValue = [{ messageId: "fetchValue" }] as const;

ruleTester.run("own-api/no-direct-call", noDirectOwnApiCall, {
  valid: [
    // The wrapper itself, and every call through it.
    "export async function ownApiFetch(path: string, init?: RequestInit) { return fetch(path, init); }",
    'import { ownApiFetch } from "@asym/database/own-api"; ownApiFetch("/api/admin/funds?limit=200");',
    // Other origins and other paths.
    'fetch("https://api.cloudinary.com/v1_1/demo/image/upload", { method: "POST" });',
    'import { cmsURL } from "./config"; fetch(`${cmsURL}/api/cms/public/updates`);',
    'fetch("/web-studio/api/pages");',
    'fetch("/apiary");',
    'fetch("/_next/data/x.json");',
    // An address the module cannot see is out of the rule's sight.
    'import { createUrl } from "./create-url"; fetch(createUrl, { method: "POST" });',
    "export async function load(url: string) { return fetch(url); }",
    // A local or imported `fetch` is not the global one.
    'const fetch = (path: string) => path; fetch("/api/admin/funds");',
    'import { fetch } from "undici"; fetch("/api/admin/funds");',
    // Navigations to page addresses, and a non-transport `open`.
    'const link = <a href="/donor-dashboard/history">History</a>;',
    "const [open, setOpen] = [false, (value: boolean) => value]; setOpen(!open);",
    'window.open("https://example.org/help");',
    // Test doubles that name an own-API path are not calls.
    'page.route("**/api/admin/member-care/dashboard", handler);',
    // Council round 1 on slice B, SB7: the global fetch is only ever called.
    // A type, a feature check and a write over it are not uses as a value.
    "type Fetcher = typeof fetch; export const f: Fetcher | null = null;",
    'export const hasFetch = typeof fetch === "function";',
    "window.fetch = wrapped;",
    "const options = { fetch: 1 }; options.fetch;",
    // Council round 2, BR5: the same forms to page addresses stay valid.
    'import { useTenantRouter } from "@asym/auth/tenant-navigation"; const router = useTenantRouter(); router.push("/donor-dashboard/history");',
    'function historyHref() { return "/donor-dashboard/history"; } const link = <a href={historyHref()}>History</a>;',
    'const link = <Link href={{ pathname: "/donor-dashboard/history", query: { page: 2 } }}>History</Link>;',
    "const { open } = window; open;",
    // An origin before another path, an array push and a key are not calls.
    "fetch(`${window.location.origin}/web-studio/api/pages`);",
    'const paths: string[] = []; paths.push("/api/admin/funds");',
    'const queryKey = ["/api/admin/funds"]; export { queryKey };',
    // An object property that is not an own-API address.
    'const ROUTES = { help: "/help/about" }; fetch(ROUTES.help);',
  ],
  invalid: [
    { code: 'fetch("/api/admin/funds?limit=200");', errors: call },
    {
      code: "fetch(`/api/admin/contributions?${params}`, { signal });",
      errors: call,
    },
    { code: 'window.fetch("/api/posts");', errors: call },
    { code: 'globalThis.fetch("/api/posts");', errors: call },
    { code: 'self.fetch("/api/posts");', errors: call },
    { code: 'await fetch("/api");', errors: call },
    // Followed through the module.
    {
      code: 'const PLATFORM_OWNERS_URL = "/api/admin/users?limit=100"; fetch(PLATFORM_OWNERS_URL);',
      errors: call,
    },
    {
      code: 'const url = id ? `/api/pdf-templates/${id}` : "/api/pdf-templates"; fetch(url, { method: "PUT" });',
      errors: call,
    },
    {
      code: 'let path = "/api/a"; path = other; fetch(path);',
      errors: call,
    },
    {
      code: 'async function getJson(url: string) { const response = await fetch(url); return response.json(); } getJson("/api/admin/posts?limit=100");',
      errors: call,
    },
    {
      code: 'const getJson = async <T,>(url: string): Promise<T> => (await fetch(url)).json(); void getJson("/api/admin/comments");',
      errors: call,
    },
    {
      code: 'const send = useCallback((path: string) => fetch(path), []); send("/api/posts");',
      errors: call,
    },
    {
      code: 'function load(path = "/api/profile") { return fetch(path); }',
      errors: call,
    },
    {
      code: 'fetch(new URL("/api/posts", window.location.origin));',
      errors: call,
    },
    {
      code: 'fetch(new URL("/api/posts", window.location.origin).toString());',
      errors: call,
    },
    { code: 'fetch("/api/missionary/tasks/" + id);', errors: call },
    {
      code: 'fetch(("/api/posts" as string), { method: "POST" });',
      errors: call,
    },
    // Every other transport.
    { code: 'navigator.sendBeacon("/api/vitals", body);', errors: call },
    { code: 'new EventSource("/api/admin/stream");', errors: call },
    { code: 'fetch(new Request("/api/posts"));', errors: call },
    {
      code: 'const xhr = new XMLHttpRequest(); xhr.open("POST", "/api/upload/image");',
      errors: call,
    },
    // Navigations carry no header.
    {
      code: "window.open(`/api/admin/contribution-operations/receipt-snapshots/${id}`);",
      errors: navigation,
    },
    {
      code: 'location.assign("/api/donor/statements/2026");',
      errors: navigation,
    },
    {
      code: 'window.location.href = "/api/donor/statements/2026";',
      errors: navigation,
    },
    {
      code: "const link = <a href={`/api/donor/statements/${year}`}>Statement</a>;",
      errors: navigation,
    },
    {
      code: 'const link = <a href="/api/admin/crm/reports/export?slice=donors">Export</a>;',
      errors: navigation,
    },
    // Forms the rule handled with no case of their own (council round 1 on
    // slice B, SB7).
    { code: 'new WebSocket("/api/admin/stream");', errors: call },
    {
      code: 'const form = <form action="/api/donor/statements">Send</form>;',
      errors: navigation,
    },
    {
      code: 'const button = <button formAction="/api/donor/statements">Send</button>;',
      errors: navigation,
    },
    {
      code: 'location.replace("/api/donor/statements/2026");',
      errors: navigation,
    },
    {
      code: 'document.location.assign("/api/donor/statements/2026");',
      errors: navigation,
    },
    {
      code: 'document.location = "/api/donor/statements/2026";',
      errors: navigation,
    },
    {
      code: 'const path = override ?? "/api/admin/funds"; fetch(path);',
      errors: call,
    },
    {
      code: 'const path = override || "/api/admin/funds"; fetch(path);',
      errors: call,
    },
    { code: 'fetch(String("/api/admin/funds"));', errors: call },
    {
      code: 'const href = "/api/donor/statements/2026"; const link = <a href={href}>Statement</a>;',
      errors: navigation,
    },
    // The global fetch as a value: aliased, bound, called through `call`,
    // handed over (council round 1 on slice B, SB0 and SB7).
    { code: "const send = fetch;", errors: fetchValue },
    { code: 'fetch.call(window, "/api/admin/funds");', errors: fetchValue },
    { code: "const send = window.fetch.bind(window);", errors: fetchValue },
    {
      code: "continueContributionBatch({ fetcher: fetch, initialResponse });",
      errors: fetchValue,
    },
    {
      code: "export async function load({ fetcher = fetch }: { fetcher?: typeof fetch }) { return fetcher(apiURL); }",
      errors: fetchValue,
    },
    { code: "useSomething(globalThis.fetch);", errors: fetchValue },
    // An own-API path after an origin expression.
    {
      code: "fetch(`${window.location.origin}/api/admin/funds`);",
      errors: call,
    },
    { code: "fetch(`${location.origin}/api/posts`);", errors: call },
    {
      code: 'const origin = window.location.origin; fetch(origin + "/api/posts");',
      errors: call,
    },
    {
      code: 'fetch(self.origin + "/api/posts?limit=" + limit);',
      errors: call,
    },
    // An own-API address held in an object literal in the same module.
    {
      code: 'const ROUTES = { funds: "/api/admin/funds" } as const; fetch(ROUTES.funds);',
      errors: call,
    },
    {
      code: 'const API = { admin: { funds: "/api/admin/funds" } }; fetch(API.admin.funds);',
      errors: call,
    },
    {
      code: 'const funds = "/api/admin/funds"; const ROUTES = { funds }; fetch(ROUTES["funds"]);',
      errors: call,
    },
    // Media and object addresses, which load with no header.
    {
      code: 'const image = <img src="/api/donor/receipts/1/preview" alt="" />;',
      errors: navigation,
    },
    {
      code: 'const embed = <object data="/api/donor/statements/2026" />;',
      errors: navigation,
    },
    {
      code: 'const video = <video poster="/api/media/poster" />;',
      errors: navigation,
    },
    // DOM writes of an address.
    {
      code: 'const link = document.createElement("a"); link.href = "/api/donor/statements/2026";',
      errors: navigation,
    },
    { code: 'form.action = "/api/donor/statements";', errors: navigation },
    {
      code: 'frame.setAttribute("src", "/api/donor/statements/2026");',
      errors: navigation,
    },
    // A router navigation or a server redirect to an own-API path.
    {
      code: 'import { useRouter } from "next/navigation"; const router = useRouter(); router.push("/api/donor/statements/2026");',
      errors: navigation,
    },
    {
      code: 'import { redirect } from "next/navigation"; redirect("/api/donor/statements/2026");',
      errors: navigation,
    },
    // XMLHttpRequest with a method held in a variable.
    {
      code: 'const xhr = new XMLHttpRequest(); xhr.open(method, "/api/upload/image");',
      errors: call,
    },
    // Third-party HTTP clients.
    {
      code: 'import axios from "axios"; axios.get("/api/admin/funds");',
      errors: call,
    },
    {
      code: 'import axios from "axios"; axios("/api/admin/funds");',
      errors: call,
    },
    {
      code: 'import ky from "ky"; ky.post("/api/posts", { json: body });',
      errors: call,
    },
    {
      code: 'import { ofetch } from "ofetch"; ofetch("/api/admin/funds");',
      errors: call,
    },
    // Council round 2 on slice B, BR5: four forms the rule neither refused
    // nor named.
    // The tenant router, which Mission Control and the missionary workspace
    // must use instead of Next.js's.
    {
      code: 'import { useTenantRouter } from "@asym/auth/tenant-navigation"; const router = useTenantRouter(); router.push("/api/donor/statements/2026");',
      errors: navigation,
    },
    {
      code: 'import { useTenantRouter as useRouter } from "@asym/auth/tenant-navigation"; const router = useRouter(); router.replace("/api/donor/statements/2026");',
      errors: navigation,
    },
    // An address returned by a function of the same module.
    {
      code: 'function statementHref() { return "/api/donor/statements/2026"; } fetch(statementHref());',
      errors: call,
    },
    {
      code: "const statementHref = (year: number) => `/api/donor/statements/${year}`; window.open(statementHref(2026));",
      errors: navigation,
    },
    // An object href, as next/link takes one.
    {
      code: 'const link = <Link href={{ pathname: "/api/donor/statements/2026" }}>Statement</Link>;',
      errors: navigation,
    },
    // The global fetch taken out of a global object, after which `fetch` is
    // a local name.
    {
      code: 'const { fetch } = window; fetch("/api/admin/funds");',
      errors: fetchValue,
    },
    {
      code: 'const { fetch: send } = globalThis; send("/api/admin/funds");',
      errors: fetchValue,
    },
  ],
});
