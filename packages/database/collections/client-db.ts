"use client";

import { type z } from "zod";

import {
  type donorActivitySchema,
  type donorPledgeSchema,
} from "./schemas/giving";
import { type donorSchema } from "./schemas/people";

export {
  donorsCollection,
  missionariesCollection,
  profilesCollection,
} from "./tables/people";
export {
  donationsCollection,
  donorActivitiesCollection,
  donorPledgesCollection,
  fundsCollection,
} from "./tables/giving";
export {
  followsCollection,
  postFiresCollection,
  postCommentsCollection,
  postLikesCollection,
  postPrayersCollection,
  postsCollection,
} from "./tables/content";
export { assetsCollection, locationsCollection } from "./tables/app";

export type DonorCollectionRow = z.output<typeof donorSchema>;
export type DonorActivityCollectionRow = z.output<typeof donorActivitySchema>;
export type DonorPledgeCollectionRow = z.output<typeof donorPledgeSchema>;
