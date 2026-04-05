"use client";

/**
 * Live-query hooks for domain reads. Callback parameters use TanStack DB `Ref` wrappers at
 * runtime; use `any` in the query builder for compatibility across @tanstack/db versions.
 */
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

function profileDisplayName(profile: {
  display_name?: string | null;
  first_name: string;
  last_name: string;
  email: string;
}): string {
  if (profile.display_name?.trim()) return profile.display_name.trim();
  const full = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return full || profile.email;
}

export function usePostsWithAuthors(missionaryId?: string): unknown {
  return useLiveQuery(
    (q: any) => {
      const fromPosts = q.from({ post: postsCollection.value });
      const scoped = missionaryId
        ? fromPosts.where(({ post }: any) =>
            eq(post.missionary_id, missionaryId),
          )
        : fromPosts;

      return scoped
        .join(
          { missionary: missionariesCollection.value },
          ({ post, missionary }: any) => eq(post.missionary_id, missionary.id),
        )
        .join(
          { profile: profilesCollection.value },
          ({ missionary, profile }: any) =>
            eq(missionary.profile_id, profile.id),
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
    },
    [missionaryId],
  );
}

export function usePostsForFollowedMissionaries(donorId: string): unknown {
  return useLiveQuery(
    (q: any) => {
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
          ({ missionary, profile }: any) =>
            eq(missionary.profile_id, profile.id),
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
    },
    [donorId],
  );
}

export function useDonorGivingHistory(donorId: string): unknown {
  return useLiveQuery(
    (q: any) => {
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
          ({ missionary, profile }: any) =>
            eq(missionary.profile_id, profile.id),
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
          stripe_payment_intent_id: donation.stripe_payment_intent_id,
          created_at: donation.created_at,
          missionary: profile,
          fund: null,
        }))
        .orderBy(({ donation }: any) => donation.created_at, "desc");
    },
    [donorId],
  );
}

export function useMissionarySupporters(missionaryId: string): unknown {
  return useLiveQuery(
    (q: any) => {
      return q
        .from({ donation: donationsCollection.value })
        .where(({ donation }: any) => eq(donation.missionary_id, missionaryId))
        .join({ donor: donorsCollection.value }, ({ donation, donor }: any) =>
          eq(donation.donor_id, donor.id),
        )
        .join(
          { profile: profilesCollection.value },
          ({ donor, profile }: any) => eq(donor.profile_id, profile.id),
        )
        .select(({ profile }: any) => ({
          id: profile.id,
          tenant_id: profile.tenant_id,
          user_id: profile.user_id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          display_name: profileDisplayName(profile),
          avatar_url: profile.avatar_url,
          phone: profile.phone ?? null,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          totalGiven: 0,
          donationCount: 0,
        }));
    },
    [missionaryId],
  );
}

export function useCommentsWithAuthors(postId: string): unknown {
  return useLiveQuery(
    (q: any) => {
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
          author: profile,
        }))
        .orderBy(({ comment }: any) => comment.created_at, "asc");
    },
    [postId],
  );
}

export function useFundsWithProgress(missionaryId?: string): unknown {
  return useLiveQuery(
    (q: any) => {
      const activeFunds = q
        .from({ fund: fundsCollection.value })
        .where(({ fund }: any) => eq(fund.is_active, true));

      const scoped = missionaryId
        ? activeFunds.where(({ fund }: any) =>
            eq(fund.missionary_id ?? "", missionaryId),
          )
        : activeFunds;

      return scoped.select(({ fund }: any) => ({
        id: fund.id,
        tenant_id: fund.tenant_id,
        missionary_id: fund.missionary_id,
        name: fund.name,
        description: fund.description,
        target_amount: fund.target_amount,
        current_amount: fund.current_amount,
        is_active: fund.is_active,
        created_at: fund.created_at,
        updated_at: fund.updated_at,
        missionary: null,
      }));
    },
    [missionaryId],
  );
}

export function useMissionaryDashboard(missionaryId: string): unknown {
  return useLiveQuery(
    (q: any) => {
      return q
        .from({ donation: donationsCollection.value })
        .where(({ donation }: any) => eq(donation.missionary_id, missionaryId));
    },
    [missionaryId],
  );
}

export function useMissionaryStats(missionaryId: string): unknown {
  return useLiveQuery(
    (q: any) => {
      return q
        .from({ donation: donationsCollection.value })
        .where(({ donation }: any) => eq(donation.missionary_id, missionaryId))
        .select(({ donation }: any) => donation);
    },
    [missionaryId],
  );
}
