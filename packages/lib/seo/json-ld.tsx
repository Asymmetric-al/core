import { siteConfig } from "@asym/config/site";

const SITE_URL = siteConfig.url;

export function OrganizationJsonLd() {
  const org = siteConfig.organization;
  const social = siteConfig.social;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": org.type,
    "@id": `${SITE_URL}/#organization`,
    name: siteConfig.name,
    alternateName: siteConfig.name.replace(/([a-z])([A-Z])/g, "$1 $2"),
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}${siteConfig.logo}`,
      width: 512,
      height: 512,
    },
    image: `${SITE_URL}${siteConfig.ogImage}`,
    description: siteConfig.description,
    foundingDate: org.foundingDate,
    address: {
      "@type": "PostalAddress",
      addressCountry: org.address.country,
      ...(org.address.region && { addressRegion: org.address.region }),
      ...(org.address.city && { addressLocality: org.address.city }),
      ...(org.address.street && { streetAddress: org.address.street }),
      ...(org.address.postalCode && { postalCode: org.address.postalCode }),
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "donor relations",
      email: org.email,
      ...(org.phone && { telephone: org.phone }),
    },
    sameAs: [
      social.twitterUrl,
      social.facebook,
      social.instagram,
      social.linkedin,
      social.youtube,
    ].filter(Boolean),
    nonprofitStatus: org.nonprofitStatus,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: siteConfig.name,
    url: SITE_URL,
    description: siteConfig.description,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    inLanguage: siteConfig.language,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/workers?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function DonateActionJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DonateAction",
    "@id": `${SITE_URL}/#donate`,
    agent: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: siteConfig.name,
      url: SITE_URL,
    },
    recipient: {
      "@type": "Organization",
      name: `${siteConfig.name} Field Workers`,
    },
    description:
      "Support verified field missionaries with tax-deductible donations.",
    potentialAction: {
      "@type": "DonateAction",
      target: `${SITE_URL}/workers`,
      name: "Donate to Support Missionaries",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface WorkerJsonLdProps {
  name: string;
  description: string;
  location: string;
  image: string;
  id: string;
  category: string;
}

export function WorkerJsonLd({
  name,
  description,
  location,
  image,
  id,
  category,
}: WorkerJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/workers/${id}#person`,
    name,
    description,
    image,
    url: `${SITE_URL}/workers/${id}`,
    jobTitle: `Field Worker - ${category}`,
    workLocation: {
      "@type": "Place",
      name: location,
    },
    worksFor: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: siteConfig.name,
      url: SITE_URL,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface FAQJsonLdProps {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

export function FAQJsonLd({ questions }: FAQJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/faq#faqpage`,
    mainEntity: questions.map((q, index) => ({
      "@type": "Question",
      "@id": `${SITE_URL}/faq#question-${index + 1}`,
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: Array<{
    name: string;
    href: string;
  }>;
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebPageJsonLd({
  title,
  description,
  path,
  datePublished,
  dateModified,
}: {
  title: string;
  description: string;
  path: string;
  datePublished?: string;
  dateModified?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}${path}#webpage`,
    url: `${SITE_URL}${path}`,
    name: title,
    description,
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
    about: {
      "@id": `${SITE_URL}/#organization`,
    },
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    inLanguage: siteConfig.language,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function ItemListJsonLd({
  name,
  description,
  items,
}: {
  name: string;
  description: string;
  items: Array<{
    name: string;
    url: string;
    image?: string;
  }>;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
      ...(item.image && { image: item.image }),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
