# Error Handling and Retries

Comprehensive guide to handling errors, configuring retries, and building resilient Inngest functions.

## Understanding Inngest Error Types

### Errors vs Failures

- **Error**: Causes a step to retry (transient issues)
- **Failed Step**: Step that exhausted all retry attempts
- **Failed Function**: Function marked as "Failed" when unhandled step failure occurs

```typescript
const errorHandlingExample = inngest.createFunction(
  { id: "error-handling-demo", retries: 3, triggers: [{ event: "demo/error-handling" }] },
  async ({ event, step }) => {
    try {
      // This step can error and retry up to 3 times
      const result = await step.run("might-fail", async () => {
        const data = await unreliableAPI.call();
        if (!data) throw new Error("API returned empty data");
        return data;
      });

      // If step fails after 3 retries, catch the failure here
    } catch (error) {
      // Handle failed step - this runs after all retries exhausted
      await step.run("handle-failure", () => {
        return logFailureAndNotify(error.message);
      });
    }
  }
);
```

## Retry Configuration

### Function-Level Retry Settings

```typescript
const customRetries = inngest.createFunction(
  {
    id: "custom-retries",
    retries: 10, // Each step gets up to 10 retries (11 total attempts)
    triggers: [{ event: "critical/task" }]
  },
  async ({ event, step, attempt }) => {
    // attempt is 0-indexed: 0, 1, 2, ..., 10

    const result = await step.run("critical-operation", async () => {
      if (attempt < 5) {
        // Use different strategy for early attempts
        return await primaryService.process(event.data);
      } else {
        // Switch to backup service for later attempts
        return await backupService.process(event.data);
      }
    });
  }
);
```

### Per-Step Independent Retries

```typescript
const independentRetries = inngest.createFunction(
  { id: "independent-retries", retries: 4, triggers: [{ event: "multi/step.process" }] },
  async ({ event, step }) => {
    // Step 1: Can retry up to 4 times independently
    const userData = await step.run("fetch-user", async () => {
      return await userService.getUser(event.data.userId);
    });

    // Step 2: Also gets its own 4 retries, regardless of Step 1's attempts
    const processedData = await step.run("process-data", async () => {
      return await dataProcessor.process(userData);
    });

    // Step 3: Independent retry counter as well
    await step.run("save-results", async () => {
      return await database.save(processedData);
    });

    // If any step fails all retries, it becomes a "failed step"
    // Other steps are unaffected
  }
);
```

## Non-Retriable Errors

### When to Use NonRetriableError

```typescript
import { NonRetriableError } from "inngest";

const smartErrorHandling = inngest.createFunction(
  { id: "smart-error-handling", triggers: [{ event: "process/user" }] },
  async ({ event, step }) => {
    const user = await step.run("validate-and-fetch-user", async () => {
      // Check if user exists
      const user = await database.users.findById(event.data.userId);

      if (!user) {
        // Don't retry - user doesn't exist
        throw new NonRetriableError("User not found");
      }

      if (user.status === "deleted") {
        // Don't retry - user is deleted
        throw new NonRetriableError("User account deleted");
      }

      if (!user.hasPermission("process")) {
        // Don't retry - insufficient permissions
        throw new NonRetriableError("User lacks required permissions");
      }

      return user;
    });

    // This step only runs if user validation passed
    await step.run("process-user-data", async () => {
      return await processUserData(user);
    });
  }
);
```

### Common NonRetriableError Scenarios

```typescript
const commonNonRetriableErrors = inngest.createFunction(
  { id: "non-retriable-examples", triggers: [{ event: "example/errors" }] },
  async ({ event, step }) => {
    // Authentication/Authorization errors
    await step.run("check-permissions", async () => {
      const user = await getUser(event.data.userId);
      if (!user.isActive) {
        throw new NonRetriableError("Account deactivated");
      }
    });

    // Validation errors
    await step.run("validate-data", async () => {
      if (!event.data.email || !isValidEmail(event.data.email)) {
        throw new NonRetriableError("Invalid email format");
      }
    });

    // Business logic violations
    await step.run("check-business-rules", async () => {
      const account = await getAccount(event.data.accountId);
      if (account.trialExpired && !account.isPaid) {
        throw new NonRetriableError("Trial expired and no payment method");
      }
    });

    // Resource not found (after initial creation)
    await step.run("process-resource", async () => {
      const resource = await getResource(event.data.resourceId);
      if (!resource) {
        throw new NonRetriableError("Resource was deleted during processing");
      }
      return processResource(resource);
    });
  }
);
```

## Custom Retry Timing

### RetryAfterError for Rate Limits

```typescript
import { RetryAfterError } from "inngest";

const respectRateLimit = inngest.createFunction(
  { id: "rate-limited-api", triggers: [{ event: "api/call.requested" }] },
  async ({ event, step }) => {
    const result = await step.run("call-external-api", async () => {
      try {
        const response = await externalAPI.makeRequest(event.data.payload);
        return response.data;
      } catch (error) {
        if (error.response?.status === 429) {
          // Respect the API's rate limit
          const retryAfter = error.response.headers["retry-after"];
          const retryAfterMs = parseInt(retryAfter) * 1000;

          throw new RetryAfterError(
            "API rate limit exceeded",
            new Date(Date.now() + retryAfterMs)
          );
        }

        if (error.response?.status === 503) {
          // Service unavailable - retry after 30 seconds
          throw new RetryAfterError("Service temporarily unavailable", "30s");
        }

        throw error; // Regular retry for other errors
      }
    });
  }
);
```

### Dynamic Retry Strategies

```typescript
const dynamicRetryStrategy = inngest.createFunction(
  { id: "dynamic-retry", triggers: [{ event: "process/adaptive" }] },
  async ({ event, step, attempt }) => {
    const result = await step.run("adaptive-processing", async () => {
      try {
        // Try different strategies based on attempt number
        if (attempt < 2) {
          // Fast path for first few attempts
          return await fastService.process(event.data);
        } else if (attempt < 4) {
          // Reliable but slower service
          return await reliableService.process(event.data);
        } else {
          // Last resort - manual processing tracking
          return await db.manualProcessing.insert(event.data);
        }
      } catch (error) {
        // Dynamic retry timing based on error type
        if (error.code === "RATE_LIMITED") {
          const delay = Math.min(Math.pow(2, attempt) * 1000, 60000); // Max 1 minute
          throw new RetryAfterError("Rate limited", `${delay}ms`);
        }

        if (error.code === "SERVER_OVERLOADED") {
          const delay = 5000 + attempt * 2000; // Increasing delay
          throw new RetryAfterError("Server overloaded", `${delay}ms`);
        }

        throw error; // Use default retry timing
      }
    });
  }
);
```

## Error Recovery Patterns

### Fallback Services Pattern

```typescript
const fallbackPattern = inngest.createFunction(
  { id: "fallback-services", triggers: [{ event: "process/with-fallback" }] },
  async ({ event, step }) => {
    let result;
    let service = "primary";

    try {
      // Try primary service
      result = await step.run("try-primary-service", async () => {
        return await primaryService.process(event.data);
      });
    } catch (primaryError) {
      // Fallback to secondary service
      service = "secondary";
      result = await step.run("try-secondary-service", async () => {
        return await secondaryService.process(event.data);
      });
    }

    // Log which service was used
    await step.run("log-service-usage", async () => {
      return await analytics.track("service-usage", {
        eventId: event.id,
        serviceUsed: service,
        success: true
      });
    });

    return { result, serviceUsed: service };
  }
);
```

## Failure Handlers

### Function-Level Failure Handling

```typescript
const processWithFailureHandler = inngest.createFunction(
  {
    id: "process-with-failure-handler",
    retries: 3,
    triggers: [{ event: "risky/process" }],
    onFailure: async ({ event, error }) => {
      // This runs when function fails after all retries
      // Access run_id from the failure event data
      const runId = event.data.run_id;

      console.error("Function failed:", {
        eventName: event.name,
        runId,
        error: error.message,
        eventData: event.data
      });

      // Send alert
      await notificationService.sendAlert({
        type: "function-failure",
        functionId: "process-with-failure-handler",
        runId,
        error: error.message,
        eventData: event.data
      });
    }
  },
  async ({ event, step }) => {
    // This might fail after retries
    const result = await step.run("risky-operation", async () => {
      return await riskyExternalService.process(event.data);
    });

    return result;
  }
);
```

## Error Monitoring and Alerting

### Structured Error Logging

```typescript
const structuredErrorLogging = inngest.createFunction(
  { id: "structured-error-logging", triggers: [{ event: "process/with-logging" }] },
  async ({ event, step, logger }) => {
    const baseContext = {
      eventName: event.name,
      eventId: event.id,
      userId: event.data.userId
    };

    try {
      const result = await step.run("api-call-with-logging", async () => {
        try {
          logger.info("Starting API call", {
            ...baseContext,
            step: "api-call-with-logging",
            endpoint: event.data.endpoint
          });

          const response = await externalAPI.call(event.data);

          logger.info("API call succeeded", {
            ...baseContext,
            step: "api-call-with-logging",
            responseStatus: response.status,
            responseSize: JSON.stringify(response.data).length
          });

          return response.data;
        } catch (error) {
          const errorContext = {
            ...baseContext,
            step: "api-call-with-logging",
            error: {
              message: error.message,
              code: error.code,
              status: error.response?.status,
              headers: error.response?.headers
            },
            retryAttempt: step.attempt || 0
          };

          logger.error("API call failed", errorContext);

          // Add to error tracking service
          await errorTracker.captureException(error, errorContext);

          throw error;
        }
      });
    } catch (stepFailure) {
      // Final error handling after all retries
      logger.error("Step failed after all retries", {
        ...baseContext,
        finalError: stepFailure.message,
        totalAttempts: (stepFailure.attempt || 0) + 1
      });

      throw stepFailure;
    }
  }
);
```

## Best Practices Summary

### Error Handling Checklist

- ✅ **Use NonRetriableError** for permanent failures (auth, validation, not found)
- ✅ **Configure appropriate retry counts** based on failure impact
- ✅ **Implement fallback strategies** for critical operations
- ✅ **Add structured logging** with sufficient context
- ✅ **Use failure handlers** for alerting and cleanup
- ✅ **Monitor retry rates** to identify systemic issues
- ✅ **Respect external service rate limits** with RetryAfterError

### Common Anti-Patterns

- ❌ **Retrying permanent errors** (NonRetriableError exists for a reason)
- ❌ **Not logging error context** (makes debugging impossible)
- ❌ **Ignoring failure handlers** (missed opportunity for cleanup)
- ❌ **No fallback strategies** (single points of failure)
- ❌ **Not monitoring error rates** (missing early warning signs)
- ❌ **Overly aggressive retries** (can overwhelm downstream services)

### Error Handling Strategy Framework

1. **Identify error types**: Permanent vs transient
2. **Configure retries**: Based on error impact and recovery time
3. **Implement fallbacks**: For critical business operations
4. **Add monitoring**: Structured logging and alerting
5. **Test failure scenarios**: Ensure error paths work as expected
6. **Document error behaviors**: For team knowledge sharing
