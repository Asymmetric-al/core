import { expect, it } from "vitest";

import {
  studioMissionaryContext,
  studioMissionaryOptions,
} from "../../../../apps/admin/src/cms-ui/web-studio/flows/studio-missionaries";

it("uses nullable directory context without inventing a location", () => {
  expect(
    studioMissionaryContext({
      id: "m-1",
      location: " Nairobi ",
      missionField: " Education ",
    }),
  ).toBe("Nairobi · Education");
  expect(
    studioMissionaryContext({
      id: "m-1",
      location: null,
      missionField: "Education",
    }),
  ).toBe("Education");
  expect(
    studioMissionaryContext({ id: "m-1", location: " ", missionField: null }),
  ).toBeNull();
});

it("disambiguates repeated names by context, retaining IDs when context is missing or repeated", () => {
  expect(
    studioMissionaryOptions([
      {
        id: "m-1",
        profile: { full_name: "Grace Okafor" },
        location: "Nairobi",
        missionField: "Education",
      },
      {
        id: "m-2",
        profile: { full_name: "Grace Okafor" },
        location: "Lima",
        missionField: "Healthcare",
      },
      {
        id: "m-3",
        profile: { full_name: "Grace Okafor" },
        location: null,
        missionField: null,
      },
      {
        id: "m-4",
        profile: { full_name: "Grace Okafor" },
        location: "Nairobi",
        missionField: "Education",
      },
      {
        id: "m-5",
        profile: { full_name: " ", display_name: " Leila " },
        missionField: "Healthcare",
      },
      { id: "m-6", profile: null },
    ]),
  ).toEqual([
    { value: "m-1", label: "Grace Okafor · Nairobi · Education (m-1)" },
    { value: "m-2", label: "Grace Okafor · Lima · Healthcare" },
    { value: "m-3", label: "Grace Okafor (m-3)" },
    { value: "m-4", label: "Grace Okafor · Nairobi · Education (m-4)" },
    { value: "m-5", label: "Leila · Healthcare" },
    { value: "m-6", label: "m-6" },
  ]);
});
