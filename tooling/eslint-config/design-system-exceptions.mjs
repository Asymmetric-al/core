import path from "node:path";

// Permanent, reviewed boundaries from integrate-design-system-lint. Allowances
// match properties, not values: new uses in these files still require review.
// Ordinary static styling debt belongs in native suppressions, not this table.
const runtimeProperties = [
  // TanStack table sizing, virtual rows, and scroll-container measurements.
  [
    "packages/ui",
    "components/shadcn/data-grid/data-grid.tsx",
    ["maxHeight", "height", "width", "minWidth", "maxWidth", "transform"],
  ],
  [
    "packages/ui",
    "components/shadcn/data-table/data-table-body.tsx",
    ["maxHeight", "width", "height"],
  ],
  [
    "packages/ui",
    "components/shadcn/data-table/data-table-responsive-chrome.tsx",
    ["maxHeight", "width", "height"],
  ],
  // ResizeObserver/user-resized image geometry and pointer-relative ripple origin.
  [
    "packages/ui",
    "components/shadcn/rich-text-editor/image-view.tsx",
    ["width"],
  ],
  ["packages/ui", "components/primitives/ripple-button.tsx", ["top", "left"]],
  // @dnd-kit useSortable owns these style values during drag and drop.
  [
    "packages/missionary",
    "components/task-kanban-board.tsx",
    ["transform", "transition"],
  ],
  // Bounded logical preview viewport, scaled to ResizeObserver measurements.
  [
    "apps/missionary",
    "app/profile/profile-primitives.tsx",
    ["width", "height", "transform"],
  ],
  ["apps/missionary", "app/profile/profile-preview.tsx", ["width", "height"]],
  // Existing chart height APIs feed Recharts' measured parent container.
  ["apps/admin", "components/dashboard/charts/revenue-chart.tsx", ["height"]],
  ["apps/admin", "components/dashboard/charts/weekly-chart.tsx", ["height"]],
  ["apps/admin", "app/(app)/reports/reports-charts.tsx", ["height"]],
];

const openPolicy = [
  ["components/openpolicy/cookie-policy.tsx", "CookiePolicy"],
  ["components/openpolicy/privacy-policy.tsx", "PrivacyPolicy"],
  ["components/openpolicy/terms-of-service.tsx", "TermsOfService"],
];

/** Exact external classes whose selectors are present in loaded stylesheets. */
const externalClasses = [
  // payloadStyles.css is imported by apps/admin/app/(payload)/layout.tsx.
  ["apps/admin", "src/cms-ui/root/Header.tsx", ["payload-admin-wrapper"]],
  ["apps/admin", "src/cms-ui/root/Nav.tsx", ["payload-admin-wrapper"]],
  [
    "apps/admin",
    "src/cms-ui/web-studio/shell/studio-layout.tsx",
    ["payload-admin-wrapper"],
  ],
  [
    "apps/admin",
    "src/cms-ui/web-studio/collections/shared/document-workspace/NativeCollectionEditView.tsx",
    ["payload-native-edit"],
  ],
  // tiptap.css is imported by rich-text-editor.tsx and rich-text-viewer.tsx.
  [
    "packages/ui",
    "components/shadcn/rich-text-editor/image-view.tsx",
    ["image-resizable", "image-selected"],
  ],
];

export function designSystemExceptions({ scope, rootDir }) {
  const basePath = path.join(rootDir, scope);
  const entries = [
    {
      name: `core/design-system/typography-marker/${scope}`,
      basePath,
      files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
      rules: {
        // @tailwindcss/typography emits :not(.not-prose), not its own utility.
        // The plugin is loaded by the shared packages/ui/styles/globals.css.
        "shadcn/no-unknown-classes": [
          "error",
          { allow: ["not-prose"], deny: ["*:not-prose"] },
        ],
      },
    },
  ];
  for (const [owner, file, allow] of runtimeProperties) {
    if (scope !== owner) continue;
    entries.push({
      name: `core/design-system/runtime/${scope}/${file}`,
      basePath,
      files: [file],
      rules: { "shadcn/no-inline-styles": ["error", { allow }] },
    });
  }
  for (const [owner, file, allow] of externalClasses) {
    if (scope !== owner) continue;
    entries.push({
      name: `core/design-system/external-css/${scope}/${file}`,
      basePath,
      files: [file],
      rules: {
        "shadcn/no-unknown-classes": [
          "error",
          {
            allow: ["not-prose", ...allow],
            deny: ["not-prose", ...allow].map((name) => `*:${name}`),
          },
        ],
      },
    });
  }
  if (scope === "packages/ui") {
    entries.push({
      name: "core/design-system/unlayer-style-api",
      basePath,
      files: ["components/studio/legacy/UnlayerEmailEditor.tsx"],
      // react-email-editor exposes style, not className or DOM prop forwarding.
      // These remaining properties size/reveal its internal host independently
      // of Core's sibling loading overlay. Redundant flex/display/height were
      // removed after verifying the installed DOM and existing adapter CSS.
      rules: {
        "shadcn/no-inline-styles": [
          "error",
          {
            contracts: [
              {
                pattern: "^EmailEditor$",
                allow: ["width", "opacity", "transition"],
              },
            ],
          },
        ],
      },
    });
  }
  if (scope === "apps/donor") {
    for (const [file, component] of openPolicy) {
      entries.push({
        name: `core/design-system/openpolicy/${component}`,
        basePath,
        files: [file],
        // Installed @openpolicy/react exposes style but no className prop.
        // Native DOM elements in the same file retain the default rule.
        rules: {
          "shadcn/no-inline-styles": [
            "error",
            {
              contracts: [
                {
                  pattern: `^${component}$`,
                  allow: ["display", "flexDirection", "gap", "maxWidth"],
                },
              ],
            },
          ],
        },
      });
    }
  }
  if (scope === "apps/missionary") {
    entries.push({
      name: "core/design-system/image-response",
      basePath,
      files: ["app/apple-icon.tsx"],
      // TODO(integrate-design-system-lint): Permanent ImageResponse/Satori
      // renderer boundary. Existing TS, import, React and Next rules remain.
      rules: {
        "shadcn/no-restyle": "off",
        "shadcn/no-raw-colors": "off",
        "shadcn/no-arbitrary-values": "off",
        "shadcn/no-inline-styles": "off",
        "shadcn/no-unknown-classes": "off",
        "shadcn/require-static-classes": "off",
      },
    });
  }
  return entries;
}
