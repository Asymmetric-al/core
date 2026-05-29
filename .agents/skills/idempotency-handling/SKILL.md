---
name: idempotency-handling
description: >
  Implement idempotency keys and handling to ensure operations can be safely
  retried without duplicate effects. Use when building payment systems, APIs
  with retries, or distributed transactions.
---

## This repository (Asymmetric-al/core)

Subordinate to **`docs/ai/rules/backend.md`** and **`docs/guides/architecture/data-access-boundary.md`**. Pair with Stripe/payment work using ecosystem skills under `.agents/skills/` when installed.

**Repo touchpoints:**

- Donor API idempotency header validation: `packages/api/src/donate/idempotency.ts` (`idempotency-key` / `x-idempotency-key`).
- Prefer existing monorepo patterns (Next.js route handlers, Supabase, Stripe) over copying generic Express/Redis examples from this skill verbatim.

Refresh: `references/upstream.md`.

# Idempotency Handling

## Table of Contents

- [Overview](#overview)
- [When to Use](#when-to-use)
- [Quick Start](#quick-start)
- [Reference Guides](#reference-guides)
- [Best Practices](#best-practices)

## Overview

Implement idempotency to ensure operations produce the same result regardless of how many times they're executed.

## When to Use

- Payment processing
- API endpoints with retries
- Webhooks and callbacks
- Message queue consumers
- Distributed transactions
- Bank transfers
- Order creation
- Email sending
- Resource creation

## Quick Start

Minimal working example:

```typescript
import express from "express";
import Redis from "ioredis";
import crypto from "crypto";

interface IdempotentRequest {
  key: string;
  status: "processing" | "completed" | "failed";
  response?: any;
  error?: string;
  createdAt: number;
  completedAt?: number;
}

class IdempotencyService {
  private redis: Redis;
  private ttl = 86400; // 24 hours

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
  }

  async getRequest(key: string): Promise<IdempotentRequest | null> {
    const data = await this.redis.get(`idempotency:${key}`);
    return data ? JSON.parse(data) : null;
  }
// ... (see reference guides for full implementation)
```

## Reference Guides

Detailed implementations in the `references/` directory:

| Guide | Contents |
|---|---|
| [Express Idempotency Middleware](references/express-idempotency-middleware.md) | Express Idempotency Middleware |
| [Database-Based Idempotency](references/database-based-idempotency.md) | Database-Based Idempotency |
| [Stripe-Style Idempotency](references/stripe-style-idempotency.md) | Stripe-Style Idempotency |
| [Message Queue Idempotency](references/message-queue-idempotency.md) | Message Queue Idempotency |

## Best Practices

### ✅ DO

- Require idempotency keys for mutations
- Store request and response together
- Set appropriate TTL for idempotency records
- Validate request body matches stored request
- Handle concurrent requests gracefully
- Return same response for duplicate requests
- Clean up old idempotency records
- Use database constraints for atomicity

### ❌ DON'T

- Apply idempotency to GET requests
- Store idempotency data forever
- Skip validation of request body
- Use non-unique idempotency keys
- Process same request concurrently
- Change response for duplicate requests
