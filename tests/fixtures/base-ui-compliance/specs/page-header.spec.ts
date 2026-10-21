import { test, expect } from "./test";

test("shared page heading and description remain readable on the active surface", async ({
  page,
}) => {
  const surface = page.getByTestId("page-header-contract");
  await expect(
    surface.getByRole("heading", { name: "Shared page heading" }),
  ).toBeVisible();
  await expect(surface.getByText(/^Shared page description/)).toBeVisible();
  const contrast = await surface.evaluate((node) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d")!;
    const luminance = (color: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data]
        .slice(0, 3)
        .reduce((sum, value, index) => {
          const channel = value / 255;
          return (
            sum +
            (channel <= 0.04045
              ? channel / 12.92
              : ((channel + 0.055) / 1.055) ** 2.4) *
              [0.2126, 0.7152, 0.0722][index]!
          );
        }, 0);
    };
    const background = luminance(getComputedStyle(node).backgroundColor);
    return [node.querySelector("h1")!, node.querySelector("p")!].map(
      (element) => {
        const foreground = luminance(getComputedStyle(element).color);
        return (
          (Math.max(foreground, background) + 0.05) /
          (Math.min(foreground, background) + 0.05)
        );
      },
    );
  });
  for (const ratio of contrast) expect(ratio).toBeGreaterThanOrEqual(4.5);
});

test("page descriptions preserve complete readable text on mobile and desktop", async ({
  page,
}) => {
  const description = page
    .getByTestId("page-header-contract")
    .getByText(/^Shared page description/);
  await expect(description).toBeVisible();
  const lines = await description.evaluate(
    (node) =>
      node.getBoundingClientRect().height /
      Number.parseFloat(getComputedStyle(node).lineHeight),
  );
  // Shared PageHeader removed clamping in 3d2d0408c (AL-1967). Preserve
  // that delivered behavior instead of restoring the older fixture contract.
  expect(lines).toBeGreaterThan(2.1);
  const bounds = await description.evaluate((node) => ({
    height: node.clientHeight,
    scrollHeight: node.scrollHeight,
    width: node.clientWidth,
    scrollWidth: node.scrollWidth,
  }));
  expect(bounds.scrollHeight).toBeLessThanOrEqual(bounds.height + 1);
  expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.width + 1);
});
