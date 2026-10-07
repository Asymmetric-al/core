import { createRequire } from "node:module";
const root = process.cwd();
const databaseRequire = createRequire(root + "/packages/database/package.json");
const outdir = process.argv[2];
if (!outdir) throw new Error("An isolated output directory is required.");
const result = await Bun.build({
  entrypoints: [
    process.argv[3] ??
      root + "/tests/e2e/fixtures/react-cleanup-contributions.tsx",
  ],
  outdir,
  target: "browser",
  format: "iife",
  define: { "process.env.NODE_ENV": '"production"' },
  plugins: [
    {
      name: "isolated-gift-boundaries",
      setup(build) {
        build.onResolve({ filter: /^@tanstack\/react-query$/ }, () => ({
          path: databaseRequire
            .resolve("@tanstack/react-query")
            .replace(/\.cjs$/, ".js"),
        }));
        build.onResolve({ filter: /^@asym\/database\/hooks$/ }, () => ({
          path: "keys",
          namespace: "fixture",
        }));
        build.onResolve({ filter: /^@asym\/api\/eve\/admin-memory$/ }, () => ({
          path: root + "/packages/api/src/eve/admin-memory/types.ts",
        }));
        build.onResolve({ filter: /^@asym\/env$/ }, () => ({
          path: "env",
          namespace: "fixture",
        }));
        build.onResolve(
          { filter: /^@asym\/ui\/components\/primitives\/map$/ },
          () => ({ path: "map", namespace: "fixture" }),
        );
        build.onResolve({ filter: /^next\/image$/ }, () => ({
          path: "image",
          namespace: "fixture",
        }));
        build.onResolve({ filter: /^next\/link$/ }, () => ({
          path: "link",
          namespace: "fixture",
        }));
        build.onResolve({ filter: /^next\/navigation$/ }, () => ({
          path: "navigation",
          namespace: "fixture",
        }));
        build.onLoad({ filter: /.*/, namespace: "fixture" }, ({ path }) => ({
          loader: "tsx",
          contents:
            path === "image"
              ? 'import React from "react";export default function Image({fill,priority,sizes,loader,unoptimized,...props}){return <img {...props}/>;}'
              : path === "map"
                ? 'import React from "react";export function Map({children}){return <section aria-label="Synthetic map">{children}</section>};export function MapMarker({children}){return <div>{children}</div>};export function MarkerContent({children}){return <div>{children}</div>};export const MapControls=()=>null,MapStyleToggle=()=>null,MapLegend=()=>null;'
                : path === "keys"
                  ? 'export const ADMIN_CRM_RECORD_DETAIL_QUERY_KEY=["admin","crm","records","detail"], ADMIN_CRM_RECORDS_QUERY_KEY=["admin","crm","records"], MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY=["admin","mission-control","needs-attention"];export function usePublicLocations(){return {data:[{id:"location-1",type:globalThis.__CORE_FIXTURE_LINKED__?"missionary":"custom",title:"Synthetic location",description:"A synthetic location for keyboard testing.",lat:0,lng:0,summary:"A synthetic location for keyboard testing.",country:"Thailand",city:"Bangkok",linked_id:globalThis.__CORE_FIXTURE_LINKED__?"worker-1":null,image_public_id:null}]}};'
                  : path === "env"
                    ? "export const clientEnv={NEXT_PUBLIC_VIEW_TRANSITIONS_ENABLED:false};"
                    : path === "navigation"
                      ? 'export function useRouter(){return{push(){},replace(){}}};export function usePathname(){return"/fixture"};export function useSearchParams(){return new URLSearchParams()}'
                      : `import React from "react";export default function Link({href,prefetch,replace,scroll,as,children,...props}) {return <a {...props} href={typeof href==="string"?href:href.pathname}>{children}</a>;}`,
        }));
      },
    },
  ],
});
if (!result.success) throw new Error(result.logs.join("\n"));
console.log(
  "Isolated real-component browser fixture built; " +
    result.outputs.length +
    " file(s).",
);
