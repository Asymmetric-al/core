import type { MetadataRoute } from "next";
import { siteConfig } from "@asym/config/site";

export default function robots(): MetadataRoute.Robots {
  const { routes } = siteConfig;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          routes.dashboards.admin,
          `${routes.dashboards.admin}/`,
          routes.dashboards.missionary,
          `${routes.dashboards.missionary}/`,
          routes.dashboards.donor,
          `${routes.dashboards.donor}/`,
          "/admin-dashboard",
          "/admin-dashboard/",
          routes.auth.login,
          routes.auth.register,
          "/auth/",
          "/api/",
        ],
      },
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },
      {
        userAgent: "ChatGPT-User",
        disallow: ["/"],
      },
      {
        userAgent: "CCBot",
        disallow: ["/"],
      },
      {
        userAgent: "anthropic-ai",
        disallow: ["/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
