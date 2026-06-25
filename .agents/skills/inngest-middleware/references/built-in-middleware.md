# Inngest Middleware Reference

Inngest provides `dependencyInjectionMiddleware` as a built-in export from the `inngest` package. Encryption and Sentry middleware are available as **separate packages** that must be installed independently.

> **Important:** `encryptionMiddleware` is from `@inngest/middleware-encryption` and `sentryMiddleware` is from `@inngest/middleware-sentry` — they are **not** exported from the core `inngest` package.

## Encryption Middleware (`@inngest/middleware-encryption`)

Install the package:

```bash
npm install @inngest/middleware-encryption
```

```typescript
import { Inngest } from "inngest";
import { encryptionMiddleware } from "@inngest/middleware-encryption";

const inngest = new Inngest({
  id: "my-app",
  middleware: [
    encryptionMiddleware({
      key: process.env.ENCRYPTION_KEY, // Encryption key from environment
    })
  ]
});
```

**What gets encrypted by default:**
- All step data
- All function output
- Event data in the `data.encrypted` field (customizable via `eventEncryptionField`)

**Additional options:**
- `eventEncryptionField`: Customize which event data field to encrypt (default: `data.encrypted`)
- `decryptOnly`: Disable encryption while maintaining decryption for migration scenarios
- `fallbackDecryptionKeys`: Array of previous keys for key rotation support

```typescript
// Key rotation example
encryptionMiddleware({
  key: process.env.NEW_ENCRYPTION_KEY,
  fallbackDecryptionKeys: [process.env.OLD_ENCRYPTION_KEY],
})
```

### Custom Encryption Implementation

For more control, create custom encryption middleware:

```typescript
import { InngestMiddleware } from "inngest";
import { createCipher, createDecipher, randomBytes } from "crypto";

const createCustomEncryptionMiddleware = (encryptionKey: string) => {
  const algorithm = "aes-256-gcm";

  const encrypt = (text: string): string => {
    const iv = randomBytes(16);
    const cipher = createCipher(algorithm, encryptionKey);
    cipher.setAAD(Buffer.from("inngest-data"));

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();
    return iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted;
  };

  const decrypt = (encrypted: string): string => {
    const [ivHex, authTagHex, encryptedText] = encrypted.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = createDecipher(algorithm, encryptionKey);
    decipher.setAAD(Buffer.from("inngest-data"));
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  };

  return new InngestMiddleware({
    name: "Custom Encryption",
    init() {
      return {
        onFunctionRun({ ctx }) {
          return {
            transformInput() {
              // Decrypt sensitive event data
              if (ctx.event.data.encrypted_fields) {
                const decryptedFields = {};
                for (const [key, encryptedValue] of Object.entries(
                  ctx.event.data.encrypted_fields
                )) {
                  decryptedFields[key] = decrypt(encryptedValue as string);
                }

                return {
                  ctx: {
                    event: {
                      ...ctx.event,
                      data: {
                        ...ctx.event.data,
                        ...decryptedFields,
                        encrypted_fields: undefined // Remove encrypted versions
                      }
                    }
                  }
                };
              }
              return {};
            },

            transformOutput({ result }) {
              // Encrypt sensitive output fields
              if (result.data?.sensitiveData) {
                const encrypted = encrypt(
                  JSON.stringify(result.data.sensitiveData)
                );
                return {
                  result: {
                    ...result,
                    data: {
                      ...result.data,
                      encrypted_output: encrypted,
                      sensitiveData: undefined // Remove plaintext
                    }
                  }
                };
              }
              return { result };
            }
          };
        }
      };
    }
  });
};

// Usage
const inngest = new Inngest({
  id: "my-app",
  middleware: [createCustomEncryptionMiddleware(process.env.ENCRYPTION_KEY)]
});
```

## Sentry Middleware (`@inngest/middleware-sentry`)

Install the package:

```bash
npm install @inngest/middleware-sentry
```

Requires `@sentry/*@>=8.0.0` and `inngest@>=3.0.0`.

```typescript
import * as Sentry from "@sentry/node";
import { Inngest } from "inngest";
import { sentryMiddleware } from "@inngest/middleware-sentry";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

const inngest = new Inngest({
  id: "my-app",
  middleware: [sentryMiddleware()]
});
```

**What it provides:**
- Captures exceptions for reporting
- Adds tracing to each function run
- Includes context like function ID and event names with each exception and trace

### Custom Sentry Implementation

For more control over error tracking, create custom middleware:

```typescript
import { InngestMiddleware } from "inngest";
import * as Sentry from "@sentry/node";

const createCustomSentryMiddleware = (sentryConfig: {
  dsn: string;
  environment: string;
  sampleRate?: number;
}) => {
  return new InngestMiddleware({
    name: "Custom Sentry Error Tracking",
    init() {
      Sentry.init({
        dsn: sentryConfig.dsn,
        environment: sentryConfig.environment,
        tracesSampleRate: sentryConfig.sampleRate || 0.1,
        integrations: [
          // Add custom integrations
          new Sentry.Integrations.Http({ tracing: true })
        ]
      });

      return {
        onFunctionRun({ ctx, fn }) {
          return {
            beforeExecution() {
              // Set Sentry context for this function execution
              Sentry.configureScope((scope) => {
                scope.setTag("inngest.function", fn.id);
                scope.setTag("inngest.event", ctx.event.name);
                scope.setTag("inngest.runId", ctx.runId);
                scope.setTag("inngest.attempt", ctx.attempt.toString());

                scope.setContext("inngest", {
                  functionId: fn.id,
                  eventName: ctx.event.name,
                  eventData: ctx.event.data,
                  runId: ctx.runId,
                  attempt: ctx.attempt,
                  timestamp: ctx.event.ts
                });

                scope.setUser({
                  id: ctx.event.user?.id || "unknown",
                  email: ctx.event.user?.email
                });
              });

              // Start Sentry transaction
              const transaction = Sentry.startTransaction({
                name: `inngest.function.${fn.id}`,
                op: "function.execution"
              });

              Sentry.getCurrentHub().configureScope((scope) =>
                scope.setSpan(transaction)
              );
            },

            afterExecution() {
              // Finish Sentry transaction
              const transaction = Sentry.getCurrentHub()
                .getScope()
                ?.getTransaction();
              transaction?.finish();
            },

            transformOutput({ result, step }) {
              // Capture errors with rich context
              if (result.error) {
                Sentry.withScope((scope) => {
                  if (step) {
                    scope.setTag("inngest.step", step.displayName);
                    scope.setContext("step", {
                      id: step.id,
                      name: step.displayName,
                      attempt: step.attempt
                    });
                  }

                  scope.setLevel("error");
                  scope.setContext("errorDetails", {
                    stepOutput: result.data,
                    errorMessage: result.error.message,
                    errorStack: result.error.stack
                  });

                  Sentry.captureException(result.error);
                });
              }

              // Capture warnings for non-fatal issues
              if (result.data?.warnings?.length > 0) {
                result.data.warnings.forEach((warning) => {
                  Sentry.addBreadcrumb({
                    message: warning,
                    level: "warning",
                    category: "inngest.warning"
                  });
                });
              }

              return { result };
            }
          };
        },

        onSendEvent() {
          return {
            transformInput({ payloads }) {
              // Track event sending
              Sentry.addBreadcrumb({
                message: `Sending ${payloads.length} events`,
                level: "info",
                category: "inngest.send_event",
                data: {
                  eventCount: payloads.length,
                  eventNames: payloads.map((p) => p.name)
                }
              });

              // Spread to convert readonly array to mutable
              return { payloads: [...payloads] };
            }
          };
        }
      };
    }
  });
};

// Usage
const inngest = new Inngest({
  id: "my-app",
  middleware: [
    createCustomSentryMiddleware({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      sampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0
    })
  ]
});
```

## Custom Error Tracking

If you don't use Sentry, create custom error tracking:

```typescript
const createErrorTrackingMiddleware = (config: {
  apiKey: string;
  endpoint: string;
  enableInDevelopment?: boolean;
}) => {
  const shouldTrack =
    config.enableInDevelopment || process.env.NODE_ENV === "production";

  const reportError = async (error: Error, context: any) => {
    if (!shouldTrack) return;

    try {
      await fetch(config.endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name
          },
          context,
          timestamp: new Date().toISOString()
        })
      });
    } catch (reportingError) {
      console.error("Failed to report error:", reportingError);
    }
  };

  return new InngestMiddleware({
    name: "Custom Error Tracking",
    init() {
      return {
        onFunctionRun({ ctx, fn }) {
          return {
            transformOutput({ result, step }) {
              if (result.error) {
                reportError(result.error, {
                  function: fn.id,
                  event: ctx.event.name,
                  runId: ctx.runId,
                  attempt: ctx.attempt,
                  step: step?.displayName,
                  eventData: ctx.event.data
                });
              }

              return { result };
            }
          };
        }
      };
    }
  });
};
```

## Combining Middleware

Use multiple middleware together:

```typescript
import { Inngest, dependencyInjectionMiddleware } from "inngest";
import { encryptionMiddleware } from "@inngest/middleware-encryption";
import { sentryMiddleware } from "@inngest/middleware-sentry";

const inngest = new Inngest({
  id: "my-app",
  middleware: [
    // Order matters - dependencies first (built-in export from "inngest")
    dependencyInjectionMiddleware({
      db: new PrismaClient(),
      redis: createRedisClient()
    }),

    // Then encryption for data protection (from "@inngest/middleware-encryption")
    encryptionMiddleware({
      key: process.env.ENCRYPTION_KEY,
    }),

    // Finally error tracking (from "@inngest/middleware-sentry")
    sentryMiddleware()
  ]
});
```

## Best Practices

### Middleware Ordering

1. **Dependencies first** - Inject services other middleware might need
2. **Data transformation** - Encryption, validation, enrichment
3. **Observability** - Logging, metrics, error tracking
4. **Business logic** - Custom middleware for specific use cases

### Error Handling

- Always wrap error tracking in try-catch blocks
- Don't let middleware errors crash your functions
- Log middleware failures for debugging
- Provide fallbacks when external services are unavailable

### Performance Considerations

- Built-in middleware is optimized for common use cases
- Custom middleware should be lightweight and fast
- Consider the overhead of external API calls in middleware
- Use caching and connection pooling appropriately
