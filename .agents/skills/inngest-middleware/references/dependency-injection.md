# Dependency Injection with Inngest Middleware

Detailed patterns for sharing expensive or stateful clients across all functions using Inngest middleware.

## Built-in Dependency Injection (TypeScript)

Inngest provides built-in dependency injection middleware that automatically injects dependencies into function contexts:

```typescript
import { dependencyInjectionMiddleware } from "inngest";
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";

const inngest = new Inngest({
  id: "my-app",
  middleware: [
    dependencyInjectionMiddleware({
      openai: new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      }),
      db: new PrismaClient(),
      redis: createClient({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
      })
    })
  ]
});

// Functions automatically get injected dependencies
inngest.createFunction(
  { id: "ai-summary", triggers: [{ event: "document/uploaded" }] },
  async ({ event, openai, db, redis }) => {
    // All dependencies available in function context
    const summary = await openai.chat.completions.create({
      messages: [{ role: "user", content: event.data.content }],
      model: "gpt-4"
    });

    await db.document.update({
      where: { id: event.data.documentId },
      data: { summary: summary.choices[0].message.content }
    });

    // Cache the result
    await redis.setex(
      `summary:${event.data.documentId}`,
      3600,
      summary.choices[0].message.content
    );
  }
);
```

## Custom Dependency Injection

For more control over dependency injection, create custom middleware:

```typescript
import { InngestMiddleware } from "inngest";
import Stripe from "stripe";

const createDependencyMiddleware = (deps: Record<string, any>) => {
  return new InngestMiddleware({
    name: "Dependency Injection",
    init() {
      return {
        onFunctionRun() {
          return {
            transformInput() {
              return {
                ctx: deps // Inject dependencies into context
              };
            }
          };
        }
      };
    }
  });
};

// Usage with multiple services
const inngest = new Inngest({
  id: "my-app",
  middleware: [
    createDependencyMiddleware({
      stripe: new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16"
      }),
      analytics: createAnalyticsClient({
        apiKey: process.env.ANALYTICS_API_KEY
      }),
      notifications: createNotificationService({
        apiKey: process.env.NOTIFICATION_API_KEY,
        from: process.env.FROM_EMAIL
      })
    })
  ]
});

// Function with injected dependencies
inngest.createFunction(
  { id: "process-payment", triggers: [{ event: "checkout/completed" }] },
  async ({ event, stripe, analytics, notifications }) => {
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: event.data.amount,
      currency: "usd",
      customer: event.data.customerId
    });

    // Track analytics
    await analytics.track("payment_processed", {
      userId: event.data.userId,
      amount: event.data.amount
    });

    // Send confirmation
    await notifications.send({
      to: event.data.userEmail,
      template: "payment_confirmation",
      data: { amount: event.data.amount }
    });
  }
);
```

## Python Dependency Injection

Implement dependency injection in Python using custom middleware:

```python
import inngest
import typing
from openai import OpenAI
from sqlalchemy import create_engine
from redis import Redis

class DependencyMiddleware(inngest.Middleware):
    def __init__(
        self,
        client: inngest.Inngest,
        raw_request: object,
    ) -> None:
        # Initialize shared dependencies once
        self.openai = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
        self.db_engine = create_engine(os.environ["DATABASE_URL"])
        self.redis = Redis.from_url(os.environ["REDIS_URL"])

    def transform_input(
        self,
        ctx: inngest.Context,
        fn: inngest.Function,
        steps: typing.Any,
    ) -> None:
        # Inject dependencies into context
        ctx.openai = self.openai  # type: ignore
        ctx.db = self.db_engine   # type: ignore
        ctx.redis = self.redis    # type: ignore

# Create client with dependency injection
inngest_client = inngest.Inngest(
    app_id="my_app",
    middleware=[DependencyMiddleware],
)

@inngest_client.create_function(
    fn_id="ai-analysis",
    trigger=inngest.TriggerEvent(event="data/uploaded"),
)
async def analyze_data(ctx: inngest.Context, step: inngest.StepTools):
    # Use injected dependencies
    analysis = await ctx.openai.chat.completions.create(
        messages=[{"role": "user", "content": ctx.event.data.text}],
        model="gpt-4",
    )

    # Store result in database
    with ctx.db.begin() as conn:
        conn.execute(
            "INSERT INTO analyses (id, content, result) VALUES (%s, %s, %s)",
            (ctx.run_id, ctx.event.data.text, analysis.choices[0].message.content)
        )

    # Cache result
    ctx.redis.setex(
        f"analysis:{ctx.run_id}",
        3600,
        analysis.choices[0].message.content
    )

    return {"analysis": analysis.choices[0].message.content}
```

## Advanced Dependency Patterns

### Lazy Loading Dependencies

Only initialize expensive clients when needed:

```typescript
const createLazyDependencyMiddleware = () => {
  let openai: OpenAI | undefined;
  let stripe: Stripe | undefined;

  return new InngestMiddleware({
    name: "Lazy Dependency Injection",
    init() {
      return {
        onFunctionRun() {
          return {
            transformInput() {
              return {
                ctx: {
                  // Lazy getters
                  get openai() {
                    if (!openai) {
                      openai = new OpenAI({
                        apiKey: process.env.OPENAI_API_KEY
                      });
                    }
                    return openai;
                  },

                  get stripe() {
                    if (!stripe) {
                      stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
                        apiVersion: "2023-10-16"
                      });
                    }
                    return stripe;
                  }
                }
              };
            }
          };
        }
      };
    }
  });
};
```

### Scoped Dependencies

Create function-scoped instances:

```typescript
const createScopedDependencyMiddleware = () => {
  return new InngestMiddleware({
    name: "Scoped Dependencies",
    init() {
      return {
        onFunctionRun({ ctx }) {
          return {
            transformInput() {
              // Create new instances per function execution
              return {
                ctx: {
                  logger: createLogger({
                    runId: ctx.runId,
                    functionId: ctx.function.id
                  }),
                  tracer: createTracer({
                    traceId: ctx.runId,
                    service: ctx.function.id
                  })
                }
              };
            }
          };
        }
      };
    }
  });
};
```

### Conditional Dependencies

Inject different dependencies based on context:

```typescript
const createConditionalDependencyMiddleware = () => {
  return new InngestMiddleware({
    name: "Conditional Dependencies",
    init() {
      const prodDatabase = createDatabaseClient(process.env.DATABASE_URL);
      const testDatabase = createTestDatabaseClient();

      return {
        onFunctionRun({ ctx }) {
          return {
            transformInput() {
              const isTest = ctx.event.name.includes("/test");
              const isProduction = process.env.NODE_ENV === "production";

              return {
                ctx: {
                  db: isTest ? testDatabase : prodDatabase,
                  analytics: isProduction
                    ? createAnalyticsClient()
                    : createMockAnalytics(),
                  cache: isProduction
                    ? createRedisClient()
                    : createMemoryCache()
                }
              };
            }
          };
        }
      };
    }
  });
};
```

## Best Practices

### Resource Management

- **Pool connections**: Use connection pools for databases
- **Reuse instances**: Don't create new clients on every function call
- **Handle cleanup**: Properly close connections in middleware teardown

### Error Handling

```typescript
const robustDependencyMiddleware = new InngestMiddleware({
  name: "Robust Dependencies",
  init() {
    let db: any;

    const getDatabase = () => {
      if (!db) {
        try {
          db = createDatabaseClient();
        } catch (error) {
          console.error("Failed to initialize database:", error);
          // Return mock or throw based on your needs
          throw new Error("Database unavailable");
        }
      }
      return db;
    };

    return {
      onFunctionRun() {
        return {
          transformInput() {
            return {
              ctx: {
                get db() {
                  return getDatabase();
                }
              }
            };
          }
        };
      }
    };
  }
});
```

### Testing with Dependencies

```typescript
// Create test-friendly middleware
const createTestableMiddleware = (overrides: Record<string, any> = {}) => {
  return new InngestMiddleware({
    name: "Testable Dependencies",
    init() {
      return {
        onFunctionRun() {
          return {
            transformInput() {
              return {
                ctx: {
                  db: overrides.db || createDatabaseClient(),
                  openai: overrides.openai || new OpenAI()
                  // Add more dependencies as needed
                }
              };
            }
          };
        }
      };
    }
  });
};

// In tests
const mockDb = createMockDatabase();
const mockOpenAI = createMockOpenAI();

const testMiddleware = createTestableMiddleware({
  db: mockDb,
  openai: mockOpenAI
});
```
