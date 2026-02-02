"use client";

import { useLiveQuery, eq } from "@tanstack/react-db";
import {
  postsCollection,
  profilesCollection,
  missionariesCollection,
  donorsCollection,
  donationsCollection,
  fundsCollection,
  followsCollection,
  postCommentsCollection,
} from "../collections";

export function usePostsWithAuthors(missionaryId?: string): any {
  return useLiveQuery((q: any) => {
    let query = q.from({ post: postsCollection.value });

    if (missionaryId) {
      query = query.where(({ post }: any) =>
        eq(post.missionary_id, missionaryId),
      );
    }

    return query
      .join(
        { missionary: missionariesCollection.value },
        ({ post, missionary }: any) => eq(post.missionary_id, missionary.id),
      )
      .join(
        { profile: profilesCollection.value },
        ({ missionary, profile }: any) => eq(missionary.profile_id, profile.id),
      )
      .select(({ post, profile }: any) => ({
        id: post.id,
        tenant_id: post.tenant_id,
        missionary_id: post.missionary_id,
        content: post.content,
        media: post.media,
        like_count: post.like_count,
        prayer_count: post.prayer_count,
        comment_count: post.comment_count,
        created_at: post.created_at,
        updated_at: post.updated_at,
        author: profile,
      }))
      .orderBy(({ post }: any) => post.created_at, "desc");
  });
}

export function usePostsForFollowedMissionaries(donorId: string): any {
  return useLiveQuery((q: any) => {
    return q
      .from({ post: postsCollection.value })
      .join({ follow: followsCollection.value }, ({ post, follow }: any) =>
        eq(post.missionary_id, follow.missionary_id),
      )
      .where(({ follow }: any) => eq(follow.donor_id, donorId))
      .join(
        { missionary: missionariesCollection.value },
        ({ post, missionary }: any) => eq(post.missionary_id, missionary.id),
      )
      .join(
        { profile: profilesCollection.value },
        ({ missionary, profile }: any) => eq(missionary.profile_id, profile.id),
      )
      .select(({ post, profile }: any) => ({
        id: post.id,
        tenant_id: post.tenant_id,
        missionary_id: post.missionary_id,
        content: post.content,
        media: post.media,
        like_count: post.like_count,
        prayer_count: post.prayer_count,
        comment_count: post.comment_count,
        created_at: post.created_at,
        updated_at: post.updated_at,
        author: profile,
      }))
      .orderBy(({ post }: any) => post.created_at, "desc");
  });
}

export function useDonorGivingHistory(donorId: string): any {
  return useLiveQuery((q: any) => {
    return q
      .from({ donation: donationsCollection.value })
      .where(({ donation }: any) => eq(donation.donor_id, donorId))
      .join(
        { missionary: missionariesCollection.value },
        ({ donation, missionary }: any) =>
          eq(donation.missionary_id, missionary.id),
      )
      .join(
        { profile: profilesCollection.value },
        ({ missionary, profile }: any) => eq(missionary.profile_id, profile.id),
      )
      .select(({ donation, profile }: any) => ({
        id: donation.id,
        tenant_id: donation.tenant_id,
        donor_id: donation.donor_id,
        missionary_id: donation.missionary_id,
        fund_id: donation.fund_id,
        amount: donation.amount,
        currency: donation.currency,
        status: donation.status,
        payment_method: donation.payment_method,
        stripe_payment_intent_id: donation.stripe_payment_intent_id,
        is_recurring: donation.is_recurring,
        recurring_interval: donation.recurring_interval,
        notes: donation.notes,
        created_at: donation.created_at,
        updated_at: donation.updated_at,
        missionary: profile,
        fund: null,
      }))
      .orderBy(({ donation }: any) => donation.created_at, "desc");
  });
}

export function useMissionarySupporters(missionaryId: string): any {
  return useLiveQuery((q: any) => {
    return q
      .from({ donation: donationsCollection.value })
      .where(({ donation }: any) => eq(donation.missionary_id, missionaryId))
      .join({ donor: donorsCollection.value }, ({ donation, donor }: any) =>
        eq(donation.donor_id, donor.id),
      )
      .join({ profile: profilesCollection.value }, ({ donor, profile }: any) =>
        eq(donor.profile_id, profile.id),
      )
      .select(({ profile }: any) => ({
        id: profile.id,
        tenant_id: profile.tenant_id,
        user_id: profile.user_id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        phone: profile.phone,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        totalGiven: 0,
        donationCount: 0,
      }));
  });
}

export function useCommentsWithAuthors(postId: string): any {
  return useLiveQuery((q: any) => {
    return q
      .from({ comment: postCommentsCollection.value })
      .where(({ comment }: any) => eq(comment.post_id, postId))
      .join(
        { profile: profilesCollection.value },
        ({ comment, profile }: any) => eq(comment.user_id, profile.user_id),
      )
      .select(({ comment, profile }: any) => ({
        id: comment.id,
        post_id: comment.post_id,
        user_id: comment.user_id,
        content: comment.content,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        author: profile,
      }))
      .orderBy(({ comment }: any) => comment.created_at, "asc");
  });
}

export function useFundsWithProgress(missionaryId?: string): any {
  return useLiveQuery((q: any) => {
    let query = q
      .from({ fund: fundsCollection.value })
      .where(({ fund }: any) => eq(fund.is_active, true));

    if (missionaryId) {
      query = query.where(({ fund }: any) =>
        eq(fund.missionary_id ?? "", missionaryId),
      );
    }

    return query.select(({ fund }: any) => ({
      id: fund.id,
      tenant_id: fund.tenant_id,
      missionary_id: fund.missionary_id,
      name: fund.name,
      description: fund.description,
      goal_amount: fund.goal_amount,
      current_amount: fund.current_amount,
      currency: fund.currency,
      is_active: fund.is_active,
      start_date: fund.start_date,
      end_date: fund.end_date,
      created_at: fund.created_at,
      updated_at: fund.updated_at,
      missionary: null,
    }));
  });
}

export function useMissionaryDashboard(missionaryId: string): any {
  return useLiveQuery((q: any) => {
    return q
      .from({ donation: donationsCollection.value })
      .where(({ donation }: any) => eq(donation.missionary_id, missionaryId));
  });
}

export function useMissionaryStats(missionaryId: string): any {
  return useLiveQuery((q: any) => {
    return q
      .from({ donation: donationsCollection.value })
      .where(({ donation }: any) => eq(donation.missionary_id, missionaryId))
      .select(({ donation }: any) => donation);
  });
}
