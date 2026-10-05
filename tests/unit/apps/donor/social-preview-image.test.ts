import { expect, it } from "vitest";
import { readFile } from "node:fs/promises";

it("serves a real 1200 by 630 PNG at the declared donor social preview URL", async () => {
  const bytes = await readFile(
    new URL("../../../../apps/donor/public/og-image.png", import.meta.url),
  );
  expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  expect(bytes.readUInt32BE(16)).toBe(1200);
  expect(bytes.readUInt32BE(20)).toBe(630);
});

it("provides the accepted GiveHope icon through Next's icon file convention", async () => {
  const icon = await readFile(
    new URL("../../../../apps/donor/app/icon.svg", import.meta.url),
    "utf8",
  );
  const acceptedIcon = await readFile(
    new URL("../../../../public/icon.svg", import.meta.url),
    "utf8",
  );
  expect(icon).toBe(acceptedIcon);
});
