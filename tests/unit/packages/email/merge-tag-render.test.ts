import { describe, expect, it } from "vitest";

import {
  parseMergeTags,
  renderMergeTags,
  renderTemplateForRecipient,
  validateMergeTags,
} from "../../../../packages/email/merge-tag-render";

describe("@asym/email merge tag rendering", () => {
  it("parses supported tokens in first-seen order", () => {
    expect(
      parseMergeTags(
        "Hi {{first_name}}, {{donation_amount}} from {{ first_name }}",
      ),
    ).toEqual(["first_name", "donation_amount"]);
  });

  it("ignores malformed tokens", () => {
    expect(parseMergeTags("{{}} {{{first_name}}} {{ first name }}")).toEqual(
      [],
    );
  });

  it("flags unknown tags", () => {
    const validation = validateMergeTags("Hello {{unknown_tag}}");

    expect(validation.valid).toBe(false);
    expect(validation.unknownTags).toEqual(["unknown_tag"]);
  });

  it("requires unsubscribe_link for marketing messages", () => {
    const validation = validateMergeTags("Hello {{first_name}}", {
      messageType: "marketing",
    });

    expect(validation.valid).toBe(false);
    expect(validation.missingRequiredTags).toEqual(["unsubscribe_link"]);
  });

  it("escapes HTML values by default", () => {
    expect(
      renderMergeTags("Hello {{first_name}}", {
        first_name: '<script>alert("x")</script>',
      }),
    ).toBe("Hello &lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
  });

  it("rejects unsafe URL values", () => {
    expect(() =>
      renderMergeTags('<a href="{{unsubscribe_link}}">Unsubscribe</a>', {
        unsubscribe_link: "javascript:alert(1)",
      }),
    ).toThrow("Unsafe URL value");
  });

  it("handles repeated tags", () => {
    expect(
      renderMergeTags("{{first_name}} / {{first_name}}", {
        first_name: "Riley",
      }),
    ).toBe("Riley / Riley");
  });

  it("renders HTML and text outputs without escaping text content", () => {
    const rendered = renderTemplateForRecipient(
      {
        html: "<p>{{first_name}}</p>",
        text: "{{first_name}}",
      },
      {
        first_name: "<Riley>",
      },
    );

    expect(rendered.html).toBe("<p>&lt;Riley&gt;</p>");
    expect(rendered.text).toBe("<Riley>");
  });

  it("keeps missing preview values unresolved without mutating template content", () => {
    const template = "Hello {{first_name}}";

    expect(renderMergeTags(template, {}, { previewMode: true })).toBe(template);
    expect(template).toBe("Hello {{first_name}}");
  });
});
