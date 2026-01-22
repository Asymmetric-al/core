import type { Metadata } from "next";
import { pageMetadata } from "@asym/lib/seo/metadata";
import { FAQJsonLd, BreadcrumbJsonLd } from "@asym/lib/seo/json-ld";
import { FAQPageClient } from "./faq-client";

export const metadata: Metadata = pageMetadata.faq;

const FAQ_QUESTIONS_FOR_SCHEMA = [
  {
    question: "How much of my donation actually goes to the field?",
    answer:
      "We are committed to radical efficiency. 85% of all expenses go directly to program services and field partners. 10% is allocated to fundraising, and 5% covers administrative overhead.",
  },
  {
    question: "Are my donations tax-deductible?",
    answer:
      "Yes. GiveHope is a registered 501(c)(3) nonprofit organization. All donations are tax-deductible to the full extent allowed by law.",
  },
  {
    question: "Can I designate my gift to a specific project?",
    answer:
      "Absolutely. You can choose to support a specific field worker, regional fund, or thematic fund. Undesignated gifts go to the Where Needed Most fund.",
  },
  {
    question: "How do you vet your field partners?",
    answer:
      "We have a 5-step vetting process including background checks, theological review, financial audits, peer references, and on-site visits.",
  },
];

export default function FAQPage() {
  return (
    <>
      <FAQJsonLd questions={FAQ_QUESTIONS_FOR_SCHEMA} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "FAQ", href: "/faq" },
        ]}
      />
      <FAQPageClient />
    </>
  );
}
