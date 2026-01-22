import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

const SITE_URL = siteConfig.url;

export function createMetadata({
  title,
  description,
  path = "",
  image,
  noIndex = false,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const ogImage = image || siteConfig.ogImage;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
      ...(type === "article" && {
        publishedTime,
        modifiedTime,
        authors,
      }),
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: siteConfig.social.twitter,
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

export function createWorkerMetadata({
  name,
  location,
  description,
  id,
  image,
}: {
  name: string;
  location: string;
  description: string;
  id: string;
  image?: string;
}): Metadata {
  const title = `Support ${name} - Missionary in ${location}`;
  const metaDescription = `Partner with ${name} serving in ${location}. ${description.slice(0, 120)}...`;
  const url = `${SITE_URL}/workers/${id}`;
  const ogImage = image || siteConfig.ogImage;

  return {
    title,
    description: metaDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description: metaDescription,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "profile",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${name} - Field Worker`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: metaDescription,
      images: [ogImage],
      creator: siteConfig.social.twitter,
    },
  };
}

export const pageMetadata = {
  home: createMetadata({
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    path: "",
  }),

  about: createMetadata({
    title: "About Our Mission",
    description: `Learn about ${siteConfig.name}'s mission to connect global capital with frontline courage. Our direct-to-field model ensures 100% of program donations reach verified missionaries.`,
    path: "/about",
  }),

  workers: createMetadata({
    title: "Missionary Directory - Support Field Workers",
    description:
      "Browse our verified roster of frontline missionaries and field workers. Partner with individuals serving in humanitarian aid, education, healthcare, and community development.",
    path: "/workers",
  }),

  faq: createMetadata({
    title: "Frequently Asked Questions",
    description: `Find answers about donations, tax deductions, financial accountability, and how ${siteConfig.name} supports verified field missionaries with transparent giving.`,
    path: "/faq",
  }),

  financials: createMetadata({
    title: "Financial Transparency & Annual Reports",
    description: `View ${siteConfig.name}'s financial reports, expense allocation, and accountability standards. 85% of all expenses go directly to program services.`,
    path: "/financials",
  }),

  waysToGive: createMetadata({
    title: "Ways to Give - Stocks, Crypto, Legacy Giving",
    description:
      "Explore giving options including credit card, stocks, cryptocurrency, employer matching, and legacy giving. All donations are tax-deductible.",
    path: "/ways-to-give",
  }),

  checkout: createMetadata({
    title: "Complete Your Donation",
    description:
      "Securely complete your tax-deductible donation to support frontline missionaries. 100% of program donations go directly to the field.",
    path: "/checkout",
    noIndex: true,
  }),
};
