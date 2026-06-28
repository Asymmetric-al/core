import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
} from "../../../../../../packages/ui/components/icons/brand-social";

const brandIcons = [
  { name: "facebook", Icon: Facebook },
  { name: "github", Icon: Github },
  { name: "instagram", Icon: Instagram },
  { name: "linkedin", Icon: Linkedin },
  { name: "twitter", Icon: Twitter },
  { name: "youtube", Icon: Youtube },
] as const;

describe("brand-social icons (lucide v1 seam)", () => {
  it.each(brandIcons)(
    "renders $name SVG with lucide classes and size",
    ({ name, Icon }) => {
      const markup = renderToStaticMarkup(
        <Icon size={20} className="brand-icon-test" aria-label={name} />,
      );

      expect(markup).toContain("<svg");
      expect(markup).toContain(`lucide-${name}`);
      expect(markup).toContain("brand-icon-test");
      expect(markup).toContain('width="20"');
      expect(markup).toContain('height="20"');
    },
  );
});
