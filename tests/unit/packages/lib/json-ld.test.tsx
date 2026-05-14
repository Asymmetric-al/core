import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FAQJsonLd, WorkerJsonLd } from "@asym/lib/seo";

function extractJsonLd(markup: string) {
  const match =
    /^<script type="application\/ld\+json">([\s\S]*)<\/script>$/.exec(markup);

  if (!match) {
    throw new Error(`Expected JSON-LD script markup, received: ${markup}`);
  }

  return match[1];
}

describe("JSON-LD components", () => {
  it("escapes script-breaking less-than characters while preserving parsed data", () => {
    const unsafeQuestion = 'Can </script><script>alert("xss")</script> run?';
    const unsafeAnswer = "No <strong>never</strong>.";
    const markup = renderToStaticMarkup(
      <FAQJsonLd
        questions={[{ question: unsafeQuestion, answer: unsafeAnswer }]}
      />,
    );
    const jsonText = extractJsonLd(markup);

    expect(jsonText).toContain("\\u003c/script>");
    expect(jsonText).toContain("\\u003cscript>");
    expect(jsonText).not.toContain("</script><script>");

    const parsed = JSON.parse(jsonText) as {
      mainEntity: Array<{
        name: string;
        acceptedAnswer: { text: string };
      }>;
    };

    expect(parsed.mainEntity[0]?.name).toBe(unsafeQuestion);
    expect(parsed.mainEntity[0]?.acceptedAnswer.text).toBe(unsafeAnswer);
  });

  it("serializes worker structured data as a parseable application/ld+json script", () => {
    const markup = renderToStaticMarkup(
      <WorkerJsonLd
        id="worker-1"
        name="Jane Field"
        description="Serving families in Bangkok"
        location="Thailand"
        image="https://example.test/jane.jpg"
        category="Education"
      />,
    );
    const parsed = JSON.parse(extractJsonLd(markup)) as {
      "@type": string;
      name: string;
      workLocation: { name: string };
      worksFor: { "@id": string };
    };

    expect(parsed["@type"]).toBe("Person");
    expect(parsed.name).toBe("Jane Field");
    expect(parsed.workLocation.name).toBe("Thailand");
    expect(parsed.worksFor["@id"]).toMatch(/#organization$/);
  });
});
