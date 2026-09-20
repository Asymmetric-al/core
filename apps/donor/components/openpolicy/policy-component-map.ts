import {
  PolicyBold,
  PolicyHeading,
  PolicyItalic,
  PolicyLink,
  PolicyList,
  PolicyParagraph,
  PolicySection,
  PolicyText,
} from "./policy-components";

import type { PolicyComponents } from "@openpolicy/react";

// Kept apart from the component module so Fast Refresh can track each
// policy component individually instead of the bundled object.
export const policyComponents: PolicyComponents = {
  Section: PolicySection,
  Heading: PolicyHeading,
  Paragraph: PolicyParagraph,
  List: PolicyList,
  Link: PolicyLink,
  Text: PolicyText,
  Bold: PolicyBold,
  Italic: PolicyItalic,
};
