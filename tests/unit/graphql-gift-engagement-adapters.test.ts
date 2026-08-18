import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { beforeEach, describe, expect, it, vi } from "vitest"

const revalidateTag = vi.hoisted(() => vi.fn())

vi.mock("next/cache", () => ({
  revalidateTag,
}))

import { beginGraphQLGiftIntake } from "../../packages/graphql/gift-intake"
import {
  addGraphQLMinistryUpdateComment,
  applyGraphQLMinistryUpdateReaction,
} from "../../packages/graphql/ministry-update-engagement"

const repoRoot = resolve(import.meta.dirname, "../..")

function readRepoFile(...parts: string[]) {
  return readFileSync(resolve(repoRoot, ...parts), "utf8")
}

describe("GraphQL Gift intake adapter", () => {
  const rpc = vi.fn()

  beforeEach(() => {
    rpc.mockReset()
  })

  it("passes the stored Gift amount through without converting dollars to cents", async () => {
    rpc.mockResolvedValue({
      data: { donation_id: "don_1", outbox_id: "out_1", replayed: false },
      error: null,
    })

    const result = await beginGraphQLGiftIntake({
      supabaseAdmin: { rpc },
      tenantId: "tenant-1",
      profileId: "profile-1",
      actorUserId: "user-1",
      missionaryId: "missionary-1",
      amountCents: 2500,
      currency: "USD",
      idempotencyKey: "idem-1",
      ipAddress: "127.0.0.1",
      userAgent: "yoga",
    })

    expect(rpc).toHaveBeenCalledWith("begin_donation_saga", {
      p_tenant_id: "tenant-1",
      p_profile_id: "profile-1",
      p_actor_user_id: "user-1",
      p_missionary_id: "missionary-1",
      p_fund_id: null,
      p_amount: 2500,
      p_currency: "usd",
      p_idempotency_key: "idem-1",
      p_ip_address: "127.0.0.1",
      p_user_agent: "yoga",
    })
    expect(result).toEqual({
      donationId: "don_1",
      outboxId: "out_1",
      replayed: false,
    })
  })

  it("throws Missionary not found when the Gift intake begin command reports not_found", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { code: "P0002", message: "no rows" },
    })

    await expect(
      beginGraphQLGiftIntake({
        supabaseAdmin: { rpc },
        tenantId: "tenant-1",
        profileId: "profile-1",
        actorUserId: "user-1",
        missionaryId: "missionary-1",
        amountCents: 2500,
        currency: "usd",
        idempotencyKey: "idem-1",
        ipAddress: null,
        userAgent: null,
      }),
    ).rejects.toThrow("Missionary not found")
  })

  it("throws Failed to create donation when saga ids are incomplete", async () => {
    rpc.mockResolvedValue({
      data: { donation_id: "don_1", outbox_id: "" },
      error: null,
    })

    await expect(
      beginGraphQLGiftIntake({
        supabaseAdmin: { rpc },
        tenantId: "tenant-1",
        profileId: "profile-1",
        actorUserId: "user-1",
        missionaryId: "missionary-1",
        amountCents: 2500,
        currency: "usd",
        idempotencyKey: "idem-1",
        ipAddress: null,
        userAgent: null,
      }),
    ).rejects.toThrow("Failed to create donation")
  })
})

describe("GraphQL Ministry Update engagement adapter", () => {
  const rpc = vi.fn()

  beforeEach(() => {
    rpc.mockReset()
    revalidateTag.mockReset()
  })

  it("returns true when a like applies", async () => {
    rpc.mockResolvedValue({ data: { applied: true }, error: null })

    await expect(
      applyGraphQLMinistryUpdateReaction({
        supabaseAdmin: { rpc },
        kind: "like",
        postId: "post-1",
        userId: "user-1",
        tenantId: "tenant-1",
      }),
    ).resolves.toBe(true)

    expect(rpc).toHaveBeenCalledWith("atomic_like_post", {
      p_post_id: "post-1",
      p_user_id: "user-1",
      p_tenant_id: "tenant-1",
    })
  })

  it("returns true when a like is already applied", async () => {
    rpc.mockResolvedValue({ data: { applied: false }, error: null })

    await expect(
      applyGraphQLMinistryUpdateReaction({
        supabaseAdmin: { rpc },
        kind: "like",
        postId: "post-1",
        userId: "user-1",
        tenantId: "tenant-1",
      }),
    ).resolves.toBe(true)
  })

  it("throws Post not found for a missing Ministry Update", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { code: "P0002", message: "no rows" },
    })

    await expect(
      applyGraphQLMinistryUpdateReaction({
        supabaseAdmin: { rpc },
        kind: "pray",
        postId: "missing",
        userId: "user-1",
        tenantId: "tenant-1",
      }),
    ).rejects.toThrow("Post not found")
  })

  it("returns the new comment id without revalidating", async () => {
    rpc.mockResolvedValue({
      data: { comment_id: "comment-1", applied: true },
      error: null,
    })

    await expect(
      addGraphQLMinistryUpdateComment({
        supabaseAdmin: { rpc },
        postId: "post-1",
        userId: "user-1",
        tenantId: "tenant-1",
        content: "Praying with you.",
      }),
    ).resolves.toBe("comment-1")

    expect(rpc).toHaveBeenCalledWith("atomic_add_post_comment", {
      p_post_id: "post-1",
      p_user_id: "user-1",
      p_tenant_id: "tenant-1",
      p_content: "Praying with you.",
    })
    expect(revalidateTag).not.toHaveBeenCalled()
  })
})

describe("GraphQL Gift and engagement source guards", () => {
  it("keeps GraphQL mutations off direct Gift and engagement RPCs", () => {
    const handler = readRepoFile("packages/graphql/handler.ts")
    expect(handler).not.toContain("begin_donation_saga")
    expect(handler).not.toContain("atomic_like_post")
    expect(handler).not.toContain("atomic_unlike_post")
    expect(handler).not.toContain("atomic_pray_for_post")
    expect(handler).not.toContain("atomic_unpray_for_post")
    expect(handler).not.toContain("atomic_add_post_comment")
  })

  it("keeps the GraphQL Gift adapter enqueue-only", () => {
    const giftIntake = readRepoFile("packages/graphql/gift-intake.ts")
    expect(giftIntake).not.toContain("processDonationSagaOutboxEvent")
    expect(giftIntake).not.toContain("Math.round(amount * 100)")
  })

  it("moves HTTP Gift begin onto the shared command without changing processing", () => {
    const donate = readRepoFile("packages/api/src/donate/index.ts")
    const donations = readRepoFile("packages/api/src/donations/index.ts")

    expect(donate).not.toContain("begin_donation_saga")
    expect(donations).not.toContain("begin_donation_saga")
    expect(donate).toContain("processDonationSagaOutboxEvent")
    expect(donate).toContain("Math.round(amount * 100)")
  })

  it("moves HTTP reaction adapters onto the shared command", () => {
    const handlers = readRepoFile(
      "packages/api/src/posts/reaction-route-handlers.ts",
    )
    const like = readRepoFile("packages/api/src/posts/like.ts")
    const prayer = readRepoFile("packages/api/src/posts/prayer.ts")
    const fire = readRepoFile("packages/api/src/posts/fire.ts")

    expect(handlers).not.toContain("atomic_like_post")
    expect(like).not.toContain("atomic_like_post")
    expect(prayer).not.toContain("atomic_pray_for_post")
    expect(fire).not.toContain("atomic_fire_post")
  })
})
