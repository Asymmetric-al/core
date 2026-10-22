import AxeBuilder from "@axe-core/playwright";

import { test, expect } from "./test";

test.use({
  fixture: { path: "/pdf-modernization.html", heading: "PDF editor contracts" },
});

test("public editor accepts keyboard input and preserves bold formatting", async ({
  page,
}) => {
  const textbox = page.getByRole("textbox");
  await expect(textbox).toHaveAttribute("contenteditable", "true");
  await textbox.click();
  await textbox.pressSequentially("Receipt amount $250.00");
  await textbox.press("ControlOrMeta+A");
  await textbox.press("ControlOrMeta+B");
  await expect(textbox).toContainText("Receipt amount $250.00");
  await page
    .getByRole("button", { name: "Inspect document", exact: true })
    .click();
  const before = await page
    .getByLabel("Document JSON", { exact: true })
    .textContent();
  expect(JSON.parse(before!)).toMatchObject({ type: "doc" });
  expect(before).toContain('"type":"bold"');
  await expect(page.getByLabel("Document HTML", { exact: true })).toContainText(
    "<strong",
  );
  await page
    .getByRole("button", { name: "Round trip HTML", exact: true })
    .click();
  // React Email adds its canonical paragraph class on the first HTML parse.
  // Formatting and reviewed text must survive that normalization.
  await expect(textbox).toHaveText("Receipt amount $250.00");
  await expect(page.getByLabel("Document HTML", { exact: true })).toContainText(
    "<strong",
  );
  expect(
    JSON.parse(
      (await page.getByLabel("Document JSON", { exact: true }).textContent())!,
    ),
  ).toMatchObject({
    type: "doc",
    content: [
      {
        type: "container",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                marks: [{ type: "bold" }],
                text: "Receipt amount $250.00",
              },
            ],
          },
        ],
      },
    ],
  });
});

test("custom nodes retain attributes through HTML and ordinary rules remain rules", async ({
  page,
}) => {
  await page.goto("/pdf-modernization.html?document=custom");
  await page
    .getByRole("button", { name: "Inspect document", exact: true })
    .click();
  const output = page.getByLabel("Document JSON", { exact: true });
  const before = await output.textContent();
  expect(JSON.parse(before!)).toMatchObject({
    type: "doc",
    content: [
      {
        type: "container",
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Donation " },
              {
                type: "variable",
                attrs: {
                  key: "donation.amount",
                  formatter: "currency.usd",
                  fallback: { mode: "use_value", value: "$250.00" },
                },
              },
            ],
          },
          {
            type: "conditionalSection",
            attrs: {
              rule: {
                fieldPath: "recipient.country",
                operator: "equals",
                value: "US",
              },
            },
          },
          {
            type: "repeater",
            attrs: {
              binding: {
                id: "donation-rows",
                itemAlias: "donation",
                maxItems: 1000,
                sourcePath: "donations",
                filters: [],
              },
            },
          },
          { type: "dataTable", attrs: { bindingId: "annual-statement-table" } },
          { type: "pageBreak", attrs: { id: "receipt-page-two" } },
          {
            type: "paragraph",
            content: [{ type: "text", text: "End of receipt" }],
          },
        ],
      },
    ],
  });
  const html = page.getByLabel("Document HTML", { exact: true });
  for (const marker of [
    "data-asym-variable-chip",
    "data-asym-repeater",
    "data-asym-data-table",
  ])
    await expect(html).toContainText(marker);
  await page
    .getByRole("button", { name: "Round trip HTML", exact: true })
    .click();
  // Attribute key order is not document content; compare the complete parsed document.
  await expect
    .poll(async () => JSON.parse((await output.textContent())!))
    .toEqual(JSON.parse(before!));
  await expect(page.getByRole("textbox")).toContainText(
    "Reviewed US donor clause",
  );
  await page
    .getByRole("button", { name: "Load ordinary rule", exact: true })
    .click();
  expect(JSON.parse((await output.textContent())!)).toMatchObject({
    type: "doc",
    content: [{ type: "horizontalRule" }],
  });
});

test("read-only documents resist keyboard mutation and disable mutation controls", async ({
  page,
}) => {
  await page.goto("/pdf-modernization.html?readonly=1");
  const textbox = page.getByRole("textbox");
  await expect(textbox).toHaveAttribute("contenteditable", "false");
  await expect(textbox).toHaveText("Reviewed legal wording");
  await textbox.click();
  await page.keyboard.type("Unreviewed change");
  await expect(textbox).toHaveText("Reviewed legal wording");
  await expect(
    page.getByRole("button", { name: "Round trip HTML", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Load ordinary rule", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Inspect document", exact: true })
    .click();
  await expect(page.getByLabel("Document JSON", { exact: true })).toContainText(
    "Reviewed legal wording",
  );
});

test("the public editor and its controls meet accessibility rules", async ({
  page,
}) => {
  await expect(
    page.getByRole("button", { name: "Inspect document", exact: true }),
  ).toBeEnabled();
  const report = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(report.violations).toEqual([]);
});
