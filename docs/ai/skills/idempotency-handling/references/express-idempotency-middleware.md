# Express Idempotency Middleware

## Express Idempotency Middleware

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

  async setRequest(key: string, request: IdempotentRequest): Promise<void> {
    await this.redis.setex(
      `idempotency:${key}`,
      this.ttl,
      JSON.stringify(request),
    );
  }

  async startProcessing(key: string): Promise<boolean> {
    const request: IdempotentRequest = {
      key,
      status: "processing",
      createdAt: Date.now(),
    };

    // Use SET NX to ensure only one request processes
    const result = await this.redis.set(
      `idempotency:${key}`,
      JSON.stringify(request),
      "EX",
      this.ttl,
      "NX",
    );

    return result === "OK";
  }

  async completeRequest(key: string, response: any): Promise<void> {
    const request: IdempotentRequest = {
      key,
      status: "completed",
      response,
      createdAt: Date.now(),
      completedAt: Date.now(),
    };

    await this.setRequest(key, request);
  }

  async failRequest(key: string, error: string): Promise<void> {
    const request: IdempotentRequest = {
      key,
      status: "failed",
      error,
      createdAt: Date.now(),
      completedAt: Date.now(),
    };

    await this.setRequest(key, request);
  }
}

function idempotencyMiddleware(idempotency: IdempotencyService) {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    // Only apply to POST, PUT, PATCH, DELETE
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      return next();
    }

    const idempotencyKey = req.headers["idempotency-key"] as string;

    if (!idempotencyKey) {
      return res.status(400).json({
        error: "Idempotency-Key header required",
      });
    }

    // Check for existing request
    const existing = await idempotency.getRequest(idempotencyKey);

    if (existing) {
      if (existing.status === "processing") {
        return res.status(409).json({
          error: "Request already processing",
          message: "Please wait and retry",
        });
      }

      if (existing.status === "completed") {
        return res.status(200).json(existing.response);
      }

      if (existing.status === "failed") {
        return res.status(500).json({
          error: "Previous request failed",
          message: existing.error,
        });
      }
    }

    // Start processing
    const canProcess = await idempotency.startProcessing(idempotencyKey);

    if (!canProcess) {
      return res.status(409).json({
        error: "Request already processing",
      });
    }

    // Capture response
    const originalSend = res.json.bind(res);
    res.json = (body: any) => {
      // Save response for future requests
      idempotency.completeRequest(idempotencyKey, body).catch(console.error);
      return originalSend(body);
    };

    // Handle errors
    const originalNext = next;
    next = (err?: any) => {
      if (err) {
        idempotency
          .failRequest(idempotencyKey, err.message)
          .catch(console.error);
      }
      return originalNext(err);
    };

    next();
  };
}

// Usage
const app = express();
const redis = new Redis("redis://localhost:6379");
const idempotency = new IdempotencyService("redis://localhost:6379");

app.use(express.json());
app.use(idempotencyMiddleware(idempotency));

app.post("/api/payments", async (req, res) => {
  const { amount, userId } = req.body;

  // Process payment
  const payment = await processPayment(amount, userId);

  res.json(payment);
});

async function processPayment(amount: number, userId: string) {
  // Payment processing logic
  return {
    id: crypto.randomUUID(),
    amount,
    userId,
    status: "completed",
  };
}

app.listen(3000);
```
