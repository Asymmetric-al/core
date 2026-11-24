import { siteConfig } from "@asym/config/site";
import { withAppBasePath } from "@asym/database/document-reload";

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} Missionary Dashboard`,
    short_name: "Missionary",
    description: "Missionary dashboard for managing your mission work",
    start_url: withAppBasePath("/"),
    scope: withAppBasePath("/"),
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: withAppBasePath("/icon.svg"),
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: withAppBasePath("/apple-icon"),
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
