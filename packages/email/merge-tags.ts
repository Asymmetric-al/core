export type MergeTagValueType =
  | "string"
  | "currency"
  | "date"
  | "url"
  | "number";

export interface MergeTagDefinition {
  key: string;
  label: string;
  category: string;
  type: MergeTagValueType;
  required?: boolean;
  sample: string;
  description?: string;
  auto?: boolean;
}

export interface MergeTagCategory {
  label: string;
  tags: MergeTagDefinition[];
}

export type MergeTagRegistry = Record<string, MergeTagCategory>;

export const DEFAULT_MERGE_TAG_REGISTRY: MergeTagRegistry = {
  organization: {
    label: "Organization",
    tags: [
      {
        key: "org_name",
        label: "Organization Name",
        category: "organization",
        type: "string",
        sample: "Give Hope International",
      },
      {
        key: "org_address",
        label: "Organization Address",
        category: "organization",
        type: "string",
        sample: "123 Ministry Lane, Springfield, IL 62701",
      },
      {
        key: "org_phone",
        label: "Organization Phone",
        category: "organization",
        type: "string",
        sample: "(555) 123-4567",
      },
      {
        key: "org_email",
        label: "Organization Email",
        category: "organization",
        type: "string",
        sample: "support@givehope.org",
      },
      {
        key: "org_website",
        label: "Website",
        category: "organization",
        type: "url",
        sample: "https://givehope.org",
      },
    ],
  },
  recipient: {
    label: "Recipient",
    tags: [
      {
        key: "first_name",
        label: "First Name",
        category: "recipient",
        type: "string",
        sample: "John",
      },
      {
        key: "last_name",
        label: "Last Name",
        category: "recipient",
        type: "string",
        sample: "Smith",
      },
      {
        key: "full_name",
        label: "Full Name",
        category: "recipient",
        type: "string",
        sample: "John Smith",
      },
      {
        key: "email",
        label: "Email Address",
        category: "recipient",
        type: "string",
        sample: "john.smith@example.com",
      },
      {
        key: "salutation",
        label: "Salutation",
        category: "recipient",
        type: "string",
        sample: "Dear John",
      },
    ],
  },
  donation: {
    label: "Donation",
    tags: [
      {
        key: "donation_amount",
        label: "Donation Amount",
        category: "donation",
        type: "currency",
        sample: "$100.00",
      },
      {
        key: "donation_date",
        label: "Donation Date",
        category: "donation",
        type: "date",
        sample: "December 31, 2024",
      },
      {
        key: "donation_method",
        label: "Payment Method",
        category: "donation",
        type: "string",
        sample: "Credit Card",
      },
      {
        key: "donation_id",
        label: "Donation ID",
        category: "donation",
        type: "string",
        sample: "DON-2024-12345",
      },
      {
        key: "ytd_giving",
        label: "Year-to-Date Giving",
        category: "donation",
        type: "currency",
        sample: "$2,500.00",
      },
      {
        key: "tax_receipt_number",
        label: "Tax Receipt Number",
        category: "donation",
        type: "string",
        sample: "TR-2024-00123",
      },
    ],
  },
  missionary: {
    label: "Missionary",
    tags: [
      {
        key: "missionary_name",
        label: "Missionary Name",
        category: "missionary",
        type: "string",
        sample: "Sarah Johnson",
      },
      {
        key: "missionary_location",
        label: "Field Location",
        category: "missionary",
        type: "string",
        sample: "Southeast Asia",
      },
      {
        key: "missionary_bio",
        label: "Missionary Bio",
        category: "missionary",
        type: "string",
        sample: "Serving families in remote villages...",
      },
      {
        key: "support_level",
        label: "Support Level",
        category: "missionary",
        type: "string",
        sample: "85%",
      },
      {
        key: "support_goal",
        label: "Support Goal",
        category: "missionary",
        type: "currency",
        sample: "$5,000/month",
      },
    ],
  },
  links: {
    label: "Links",
    tags: [
      {
        key: "unsubscribe_link",
        label: "Unsubscribe Link",
        category: "links",
        type: "url",
        required: true,
        sample: "https://givehope.org/unsubscribe",
        auto: true,
      },
      {
        key: "view_in_browser",
        label: "View in Browser",
        category: "links",
        type: "url",
        sample: "https://givehope.org/email/view",
        auto: true,
      },
      {
        key: "donate_link",
        label: "Donate Link",
        category: "links",
        type: "url",
        sample: "https://givehope.org/donate",
      },
      {
        key: "profile_link",
        label: "Profile Link",
        category: "links",
        type: "url",
        sample: "https://givehope.org/profile",
      },
      {
        key: "preferences_link",
        label: "Email Preferences",
        category: "links",
        type: "url",
        sample: "https://givehope.org/preferences",
      },
    ],
  },
  campaign: {
    label: "Campaign",
    tags: [
      {
        key: "campaign_name",
        label: "Campaign Name",
        category: "campaign",
        type: "string",
        sample: "Year-End Giving 2024",
      },
      {
        key: "campaign_goal",
        label: "Campaign Goal",
        category: "campaign",
        type: "currency",
        sample: "$100,000",
      },
      {
        key: "campaign_raised",
        label: "Amount Raised",
        category: "campaign",
        type: "currency",
        sample: "$75,000",
      },
      {
        key: "campaign_end_date",
        label: "Campaign End Date",
        category: "campaign",
        type: "date",
        sample: "December 31, 2024",
      },
    ],
  },
};

export type LegacyUnlayerMergeTags = Record<
  string,
  {
    name: string;
    mergeTags: Record<
      string,
      {
        name: string;
        value: string;
        sample?: string;
      }
    >;
  }
>;

export function getMergeTagDefinitions(
  registry: MergeTagRegistry = DEFAULT_MERGE_TAG_REGISTRY,
): MergeTagDefinition[] {
  return Object.values(registry).flatMap((category) => category.tags);
}

export function getMergeTagDefinition(
  key: string,
  registry: MergeTagRegistry = DEFAULT_MERGE_TAG_REGISTRY,
): MergeTagDefinition | null {
  return (
    getMergeTagDefinitions(registry).find((tag) => tag.key === key) ?? null
  );
}

export function getMergeTagSamples(
  registry: MergeTagRegistry = DEFAULT_MERGE_TAG_REGISTRY,
): Record<string, string> {
  return Object.fromEntries(
    getMergeTagDefinitions(registry).map((tag) => [tag.key, tag.sample]),
  );
}

export function toLegacyUnlayerMergeTags(
  registry: MergeTagRegistry = DEFAULT_MERGE_TAG_REGISTRY,
): LegacyUnlayerMergeTags {
  return Object.fromEntries(
    Object.entries(registry).map(([categoryKey, category]) => [
      categoryKey,
      {
        name: category.label,
        mergeTags: Object.fromEntries(
          category.tags.map((tag) => [
            tag.key,
            {
              name: tag.label,
              value: `{{${tag.key}}}`,
              sample: tag.sample,
            },
          ]),
        ),
      },
    ]),
  );
}
