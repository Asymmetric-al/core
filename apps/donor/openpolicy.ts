import { defineConfig } from "@openpolicy/sdk";

/**
 * OpenPolicy source of truth for the donor app.
 *
 * Repo-inferred facts in this config:
 * - The donor app is a public Next.js App Router application.
 * - The hosted service uses Stripe, Supabase, Resend, and Vercel-backed deployment infrastructure.
 * - Email/PDF builder features can use Unlayer where those features are enabled.
 * - The donor public site currently takes a strictly-necessary-cookies posture.
 *
 * Explicit human-provided drafting facts integrated on 2026-03-31:
 * - Service name, legal identity, mailing address, and privacy contact
 * - California governing law / venue posture
 * - Donation reversal policy
 * - Public subprocessor list
 * - Published retention schedule
 * - Current "no intentional EEA/UK targeting" posture
 *
 * Human and legal review are still required before production publication,
 * especially for operational retention enforcement, security wording, and any
 * future change to cookies or jurisdictional scope.
 */

const repoFocusedJurisdictions = ["us"] as const;

export const OPENPOLICY_EFFECTIVE_DATE = "April 2, 2026" as const;

const donorCompany = {
  name: "Asymmetric.al",
  legalName: "Global Fellowship Inc. (doing business as Asymmetric.al)",
  address: "PO Box 1, Meadow Vista, CA 95722, United States",
  contact: "info@asymmetric.al",
} as const;

const publicSubprocessors = [
  {
    name: "Vercel Inc.",
    purpose:
      "Provides application hosting, deployments, edge/network delivery, and managed infrastructure for the hosted service.",
  },
  {
    name: "Supabase Inc.",
    purpose:
      "Provides authentication, database, storage, and backend platform services for the hosted service.",
  },
  {
    name: "Stripe, LLC",
    purpose:
      "Provides payment processing, donation checkout, recurring billing, and related financial transaction handling.",
  },
  {
    name: "Plus Five Five, Inc. d/b/a Resend",
    purpose:
      "Provides transactional email delivery, webhook processing, inbound email handling, suppression management, and related email infrastructure.",
  },
  {
    name: "Unlayer, Inc.",
    purpose:
      "Provides embedded email and PDF builder features where those features are enabled.",
  },
] as const;

const donationReversalPolicy =
  "Donations are generally final once processed. We review reversal requests for duplicate, mistaken, or unauthorized transactions, and may review a narrow set of exceptional cases involving clear processing errors in our sole discretion. If a confirmed error is approved for refund, we aim to issue it within 28 days and, where possible, return it to the original payment method. We may request reasonable information to verify the request. Any approved reversal may affect tax records and year-end giving receipts.";

const liabilityCapPolicy =
  "To the maximum extent permitted by law, our aggregate liability arising out of or relating to the hosted and support services will not exceed the greater of the amounts paid for those services in the 12 months before the event giving rise to the claim or US $100. This limitation does not apply where liability cannot be limited under applicable law, including for fraud, willful misconduct, gross negligence, or other non-waivable liabilities.";

const securityAndStorageReviewMarker =
  "We use administrative, technical, and organizational safeguards designed to protect personal information, including authentication controls, role-based access controls, encrypted secrets handling for integrations, audit logging, and operational monitoring. Some content or assets may be intentionally published or publicly accessible where the service is configured to do so, such as public profile or document assets. No system is completely secure, and we cannot guarantee absolute security.";

const openPolicyConfig = defineConfig({
  company: {
    ...donorCompany,
  },
  privacy: {
    effectiveDate: OPENPOLICY_EFFECTIVE_DATE,
    dataCollected: {
      "Identifiers, account, and profile information": [
        "Name, email address, phone number, mailing address, profile image, and account identifiers",
        "Tenant or organization affiliation, role, display name, and account preferences",
        "Authentication, session, and security metadata managed through Supabase or related platform services",
      ],
      "Donation, pledge, and billing information": [
        "Donation amounts, currency, status, receipts, refunds, and related finance records",
        "Recurring pledge data, billing dates, campaign or fund associations, and receipt history",
        "Payment method metadata, processor identifiers, and related Stripe transaction details",
      ],
      "Communications, support, and preference information": [
        "Notification settings, update preferences, unsubscribes, and suppression records",
        "Transactional email logs, delivery events, bounce events, and inbound email metadata",
        "Support correspondence, hosting/support records, and related troubleshooting notes",
      ],
      "User content and generated materials": [
        "Posts, comments, reactions, uploaded files, assets, templates, and generated PDFs or related documents",
      ],
      "Technical, device, security, and location information": [
        "IP address, browser type, user agent, session cookies, and security or diagnostic logs",
        "Audit trail records and operational monitoring data",
        "Location data or coordinates when voluntarily provided or embedded in service use",
      ],
    },
    legalBasis:
      "We process personal information to provide, host, maintain, and support the service; create and manage accounts; process donations, pledges, refunds, receipts, and related financial records; deliver communications; publish or manage user content; monitor security and prevent fraud or abuse; comply with legal, tax, accounting, audit, and recordkeeping obligations; and improve or troubleshoot the service. Depending on the context and applicable law, our legal bases may include performance of a contract, legitimate interests, consent, legal obligation, and the establishment, exercise, or defense of legal claims.",
    retention: {
      "Account and profile data":
        "Retained while the account remains active, then up to 24 months after account closure or last activity.",
      "Donation, pledge, receipt, refund, tax, and finance records":
        "Retained for 7 years.",
      "Support records":
        "Retained for the term of the relationship plus 3 years.",
      "Email send logs, delivery events, bounce events, and suppression records":
        "Retained for 12 months, except suppression records may be kept longer where needed to honor opt-out status.",
      "Inbound email bodies, parsed content, and attachment or payload snapshots":
        "Retained for 90 days.",
      "Audit logs and security logs": "Retained for 24 months.",
      "Uploaded content and generated files in live systems":
        "Deleted within 30 days of a deletion request or account closure, unless a legal hold, fraud review, dispute, safeguarding need, or tax/finance record exception applies.",
      Backups: "Rolling overwrite within 35 days.",
      "De-identified aggregate analytics":
        "May be retained longer or indefinitely where the data cannot reasonably identify an individual.",
      "Legal holds, fraud review, disputes, safeguarding, and tax obligations":
        "May require longer retention where reasonably necessary.",
    },
    cookies: {
      essential: true,
      analytics: false,
      marketing: false,
    },
    thirdParties: [...publicSubprocessors],
    userRights: [
      "Request access to the personal information we hold about you.",
      "Request correction of inaccurate or incomplete personal information.",
      "Request deletion of personal information, subject to legal and operational exceptions.",
      "Request restriction of processing in certain circumstances where applicable law provides that right.",
      "Object to certain processing, including processing based on legitimate interests where applicable.",
      "Request portability of personal information you provided to us where applicable.",
      "Withdraw consent at any time for processing based on consent.",
      "Opt out of certain marketing communications.",
      "Opt out of the sale or sharing of personal information if those concepts apply under the law where you live.",
      "Limit certain uses of sensitive personal information where required by law.",
      "Lodge a complaint with your local supervisory authority or regulator where applicable.",
    ],
    jurisdictions: [...repoFocusedJurisdictions],
    children: {
      underAge: 13,
    },
  },
  terms: {
    effectiveDate: OPENPOLICY_EFFECTIVE_DATE,
    acceptance: {
      methods: [
        "Using the donor application",
        "Creating an account",
        "Submitting or attempting to submit a donation",
        "Starting or managing a recurring giving schedule",
        "Using related dashboard or support features",
      ],
    },
    accounts: {
      registrationRequired: false,
      userResponsibleForCredentials: true,
      companyCanTerminate: true,
    },
    prohibitedUses: [
      "Violating applicable law or the rights of others",
      "Attempting to gain unauthorized access to accounts, systems, or data",
      "Interfering with platform security, availability, or integrity",
      "Using the service for fraudulent, deceptive, or abusive conduct",
    ],
    payments: {
      hasPaidFeatures: true,
      refundPolicy: donationReversalPolicy,
    },
    availability: {
      noUptimeGuarantee: true,
    },
    termination: {
      companyCanTerminate: true,
      userCanTerminate: true,
      effectOfTermination:
        "Access to authenticated donor features may end immediately where required for security, abuse prevention, legal compliance, or platform operations. Donation, payment, audit, and related records may still be retained where needed for accounting, security, legal obligations, or dispute handling.",
    },
    disclaimers: {
      serviceProvidedAsIs: true,
      noWarranties: true,
    },
    limitationOfLiability: {
      excludesIndirectDamages: true,
      liabilityCap: liabilityCapPolicy,
    },
    thirdPartyServices: [...publicSubprocessors],
    disputeResolution: {
      method: "litigation",
      venue:
        "The parties agree to the exclusive jurisdiction of the state courts located in Placer County, California, and, where federal jurisdiction applies, the federal courts serving Placer County, California.",
    },
    governingLaw: {
      jurisdiction: "California, United States",
    },
    changesPolicy: {
      noticeMethod: "Posting updates on this page or through the service",
      noticePeriodDays: 30,
    },
    privacyPolicyUrl: "/privacy",
  },
  cookie: {
    effectiveDate: OPENPOLICY_EFFECTIVE_DATE,
    cookies: {
      essential: true,
      analytics: false,
      functional: false,
      marketing: false,
    },
    thirdParties: [
      {
        name: "Stripe, LLC",
        purpose:
          "Supports secure payment processing and payment fraud-control flows for donation checkout.",
      },
      {
        name: "Supabase Inc.",
        purpose:
          "Supports authentication, session continuity, and essential donor dashboard state.",
      },
    ],
    trackingTechnologies: ["HTTP cookies", "Local storage", "Session storage"],
    consentMechanism: {
      hasBanner: false,
      hasPreferencePanel: false,
      canWithdraw: false,
    },
    jurisdictions: [...repoFocusedJurisdictions],
  },
});

export const OPENPOLICY_OPERATIONAL_NOTES = {
  eeaUkTargeting:
    "The hosted service does not intentionally target individuals in the EEA or UK at this time. Reassess this posture before adding region-specific marketing, sales, onboarding, or monitoring behavior.",
  securityAndStorage: securityAndStorageReviewMarker,
} as const;

export { openPolicyConfig };
export default openPolicyConfig;
