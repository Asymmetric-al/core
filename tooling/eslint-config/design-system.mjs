import path from "node:path";
import { fileURLToPath } from "node:url";

import shadcn from "@shadcn/lint";

import { designSystemExceptions } from "./design-system-exceptions.mjs";

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));

export const uiWorkspaces = [
  "apps/admin",
  "apps/donor",
  "apps/missionary",
  "packages/ui",
  "packages/missionary",
];

// Placement only: upstream's "layout" category also permits control dimensions
// and transforms. Button size, press feedback and focus treatment stay owned.
const placement = [
  "m-*",
  "mx-*",
  "my-*",
  "mt-*",
  "mb-*",
  "ml-*",
  "mr-*",
  "ms-*",
  "me-*",
  "self-*",
  "justify-self-*",
  "col-*",
  "row-*",
  "order-*",
  "shrink-0",
  "grow",
  "grow-0",
  "basis-*",
  "w-full",
  "max-w-full",
  "hidden",
  "sr-only",
  "not-sr-only",
];

const dimensions = [
  "w-*",
  "min-w-*",
  "max-w-*",
  "h-*",
  "min-h-*",
  "max-h-*",
  "size-*",
];
const composition = [
  ...placement,
  ...dimensions,
  "flex",
  "flex-*",
  "grid",
  "grid-*",
  "items-*",
  "justify-*",
  "content-*",
  "overflow-*",
  "spacing",
];
const contracts = [
  {
    pattern: "^(EditorRoot|EditorContent|EditorToolbar|DataGrid)$",
    allow: composition,
  },
  // These slots own theme/shape/effects, while their caller arranges content.
  {
    pattern:
      "^(Card|CardHeader|CardContent|CardFooter|CardAction|DialogHeader|DialogFooter|SheetHeader|SheetFooter|AlertDialogHeader|AlertDialogFooter|FieldGroup|FieldSet|FieldContent|ItemGroup|ItemContent|ItemActions|Empty|EmptyHeader|EmptyContent|ButtonGroup|InputGroupAddon|Table|TableHeader|TableBody|TableFooter|TableRow|TableCell|TableHead|ScrollArea|ScrollBar|ResizablePanel|ResizablePanelGroup|Separator|Accordion|AccordionContent|Collapsible|CollapsibleContent|Tabs|TabsContent|ToggleGroup|NavigationMenu|BreadcrumbList|BreadcrumbItem|SidebarGroup|SidebarGroupContent|SidebarHeader|SidebarFooter|SidebarContent|SidebarInset|SidebarMenu|SidebarMenuItem)$",
    allow: composition,
  },
  {
    pattern:
      "^(CardTitle|CardDescription|DialogTitle|DialogDescription|SheetTitle|SheetDescription|AlertDialogTitle|AlertDialogDescription|EmptyTitle|EmptyDescription|ItemTitle|ItemDescription|FieldLegend|FieldDescription|TableCaption)$",
    allow: [...placement, "typography"],
  },
  // A placeholder's silhouette and an avatar's footprint are caller-owned.
  {
    pattern: "^Skeleton$",
    allow: [...placement, ...dimensions, "rounded", "rounded-*"],
  },
  { pattern: "^Avatar$", allow: [...placement, "size-*"] },
];

// Existing motion tokens are legitimate variable references in Tailwind's older
// bracket notation as well as the parenthesized shorthand accepted upstream.
const motionTokens = [
  "ease-[var(--ease-out-soft)]",
  "duration-[var(--duration-micro)]",
  "duration-[var(--duration-standard)]",
  "duration-[var(--duration-modal)]",
  "duration-[var(--duration-drawer)]",
  "[animation-timing-function:var(--ease-out-soft)]",
];
const primitiveArbitrary = [
  ...motionTokens,
  "focus-visible:ring-[3px]",
  "transition-[color,box-shadow]",
];

// Structural Maia geometry, slot alignment and Base UI positioning. These are
// exact values in named implementations, not a layout-category exemption.
const structuralValues = {
  alert: ["grid-cols-[0_1fr]", "grid-cols-[calc(var(--spacing)*4)_1fr]"],
  "alert-dialog": [
    "top-[50%]",
    "left-[50%]",
    "max-w-[calc(100%-2rem)]",
    "translate-x-[-50%]",
    "translate-y-[-50%]",
    "grid-rows-[auto_1fr]",
    "grid-rows-[auto_auto_1fr]",
  ],
  dialog: [
    "top-[50%]",
    "left-[50%]",
    "max-w-[calc(100%-2rem)]",
    "translate-x-[-50%]",
    "translate-y-[-50%]",
  ],
  calendar: [
    "[--cell-size:--spacing(8)]",
    "has-focus:ring-[3px]",
    "group-data-[focused=true]/day:ring-[3px]",
  ],
  card: ["grid-rows-[auto_auto]", "grid-cols-[1fr_auto]"],
  checkbox: ["rounded-[4px]"],
  drawer: ["max-h-[80vh]"],
  "input-group": [
    "has-[[data-slot=input-group-control]:focus-visible]:ring-[3px]",
    "rounded-[calc(var(--radius)-5px)]",
    "ml-[-0.45rem]",
    "ml-[-0.35rem]",
    "mr-[-0.45rem]",
    "mr-[-0.35rem]",
  ],
  "input-otp": ["data-[active=true]:ring-[3px]"],
  "navigation-menu": [
    "transition-[opacity,transform,translate]",
    "transition-[top,left,right,bottom]",
    "transition-[opacity,transform,width,height,scale,translate]",
    "data-[side=bottom]:before:top-[-10px]",
    "top-[60%]",
  ],
  progress: ["transition-[width]"],
  "scroll-area": ["rounded-[inherit]"],
  sidebar: [
    "transition-[width]",
    "transition-[left,right,width]",
    "transition-[margin,opacity]",
    "transition-[width,height,padding]",
    "w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]",
    "w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]",
    "left-[calc(var(--sidebar-width)*-1)]",
    "right-[calc(var(--sidebar-width)*-1)]",
    "shadow-[0_0_0_1px_var(--sidebar-border)]",
    "shadow-[0_0_0_1px_var(--sidebar-accent)]",
  ],
  switch: [
    "transition-[background-color,border-color,box-shadow]",
    "data-[size=default]:h-[1.15rem]",
    "translate-x-[calc(100%-2px)]",
  ],
  table: ["[&>[role=checkbox]]:translate-y-[2px]"],
  tabs: [
    "p-[3px]",
    "h-[calc(100%-1px)]",
    "transition-[color,background-color,border-color,box-shadow]",
    "group-data-[orientation=horizontal]/tabs:after:bottom-[-5px]",
  ],
  "toggle-group": ["gap-[--spacing(var(--gap))]"],
  tooltip: [
    "translate-y-[calc(-50%_-_2px)]",
    "translate-x-[1.5px]",
    "translate-x-[-1.5px]",
  ],
};

// Explicit leaf files, never a directory glob. New shared features/wrappers stay
// consumers until their API is reviewed. OpenSpec: integrate-design-system-lint.
export const primitiveFiles = [
  "accordion",
  "alert",
  "alert-dialog",
  "aspect-ratio",
  "avatar",
  "badge",
  "breadcrumb",
  "button",
  "button-group",
  "calendar",
  "card",
  "carousel",
  "chart",
  "checkbox",
  "collapsible",
  "command",
  "context-menu",
  "dialog",
  "drawer",
  "dropdown-menu",
  "empty",
  "field",
  "hover-card",
  "input",
  "input-group",
  "input-otp",
  "item",
  "kbd",
  "label",
  "menubar",
  "navigation-menu",
  "pagination",
  "popover",
  "progress",
  "radio-group",
  "resizable",
  "scroll-area",
  "select",
  "separator",
  "sheet",
  "sidebar",
  "skeleton",
  "slider",
  "sonner",
  "spinner",
  "switch",
  "table",
  "tabs",
  "textarea",
  "toggle",
  "toggle-group",
  "tooltip",
  "visually-hidden",
].map((name) => `components/shadcn/${name}.tsx`);

export function designSystemConfig({
  workspace,
  rootDir = repositoryRoot,
} = {}) {
  const scopes = workspace ? [workspace] : uiWorkspaces;
  return scopes.flatMap((scope) => [
    {
      name: `core/design-system/${scope}`,
      basePath: path.join(rootDir, scope),
      files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
      plugins: { shadcn },
      settings: {
        shadcn: {
          ui: ["@asym/ui/components/shadcn"],
          // Re-exports resolve to the defining components.json with the pinned
          // compatibility patch. Do not label all @asym/ui exports as primitives.
          note: "See docs/ai/skills/moai-library-shadcn/references/design-system-lint.md.",
        },
      },
      rules: {
        "shadcn/no-restyle": ["error", { allow: placement, contracts }],
        "shadcn/no-raw-colors": "error",
        "shadcn/no-arbitrary-values": ["error", { allow: motionTokens }],
        "shadcn/no-inline-styles": "error",
        "shadcn/no-unknown-classes": "error",
        "shadcn/require-static-classes": "error",
      },
    },
    ...(scope === "packages/ui"
      ? [
          {
            name: "core/design-system/primitive-authoring",
            basePath: path.join(rootDir, scope),
            files: primitiveFiles,
            rules: {
              // Permanent authoring APIs: implementations own their appearance and CVA
              // factories. Token/unknown/inline checks remain blocking in these files.
              "shadcn/no-restyle": "off",
              "shadcn/require-static-classes": "off",
              "shadcn/no-arbitrary-values": [
                "error",
                { allow: primitiveArbitrary },
              ],
            },
          },
          {
            name: "core/design-system/pinned-table-border",
            basePath: path.join(rootDir, scope),
            files: [
              "components/shadcn/data-table/data-table-responsive-chrome.tsx",
            ],
            // Pinned cells use a one-pixel seam in the shared border color. The rest of
            // this table composition remains a consumer, including its other shadows.
            rules: {
              "shadcn/no-arbitrary-values": [
                "error",
                {
                  allow: [
                    ...motionTokens,
                    "shadow-[1px_0_0_0_var(--color-border)]",
                    "shadow-[-1px_0_0_0_var(--color-border)]",
                  ],
                },
              ],
            },
          },
          ...Object.entries(structuralValues).map(([name, allow]) => ({
            name: `core/design-system/structural/${name}`,
            basePath: path.join(rootDir, scope),
            files: [`components/shadcn/${name}.tsx`],
            rules: {
              "shadcn/no-arbitrary-values": [
                "error",
                { allow: [...primitiveArbitrary, ...allow] },
              ],
            },
          })),
        ]
      : []),
    ...designSystemExceptions({ scope, rootDir }),
  ]);
}
