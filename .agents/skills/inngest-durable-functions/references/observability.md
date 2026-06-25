# Observability and Extended Traces

Comprehensive guide to monitoring, tracing, and observing Inngest functions with OpenTelemetry integration.

## Extended Traces Setup

### Basic Extended Traces Configuration

```typescript
// IMPORTANT: Import and run extendedTracesMiddleware() FIRST
import { extendedTracesMiddleware } from "inngest/experimental";
const extendedTraces = extendedTracesMiddleware();

// Then import everything else
import { Inngest } from "inngest";

const inngest = new Inngest({
  id: "my-app",
  middleware: [extendedTraces]
});
```

### Advanced Extended Traces Configuration

```typescript
import { extendedTracesMiddleware } from "inngest/experimental";
import { PrismaInstrumentation } from "@prisma/instrumentation";

const extendedTraces = extendedTracesMiddleware({
  // Provider behavior options
  behaviour: "auto", // "auto" | "extendProvider" | "createProvider" | "off"

  // Custom instrumentations
  instrumentations: [
    new PrismaInstrumentation()
    // Add other custom instrumentations
  ]
});

export const inngest = new Inngest({
  id: "my-app",
  middleware: [extendedTraces]
});
```

### Integration with Existing Providers (Sentry Example)

```typescript
import * as Sentry from "@sentry/node";
import { extendedTracesMiddleware } from "inngest/experimental";

// Initialize Sentry first
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0
});

// Extended traces will extend Sentry's provider
const extendedTraces = extendedTracesMiddleware({
  behaviour: "auto" // Will extend Sentry's existing provider
});

export const inngest = new Inngest({
  id: "my-app",
  middleware: [extendedTraces]
});
```

### Manual Provider Integration

```typescript
import { Inngest } from "inngest";
import {
  extendedTracesMiddleware,
  InngestSpanProcessor
} from "inngest/experimental";
import { BasicTracerProvider } from "@opentelemetry/sdk-trace-base";
import { NodeSDK } from "@opentelemetry/auto-instrumentations-node";

// Create client with disabled auto-instrumentation
export const inngest = new Inngest({
  id: "my-app",
  middleware: [
    extendedTracesMiddleware({
      behaviour: "off" // Don't auto-instrument
    })
  ]
});

// Manually create and configure provider
const provider = new BasicTracerProvider({
  spanProcessors: [
    new InngestSpanProcessor(inngest) // Add Inngest span processor
  ]
});

// Register the provider
provider.register();

// Initialize Node SDK with custom provider
const sdk = new NodeSDK({
  traceExporter: yourTraceExporter
});

sdk.start();
```

## Automatic Instrumentation Coverage

Extended traces automatically instruments these libraries when creating a new provider:

### Network and HTTP

- `http` and `https` (Node.js built-in)
- `undici` (Node.js global fetch API)
- `@grpc/grpc-js`

### Databases

- `mongodb`
- `mongoose`
- `pg` (PostgreSQL)
- `mysql` and `mysql2`
- `redis` and `ioredis`
- `cassandra-driver`
- `knex`

### Web Frameworks

- `express`
- `koa`
- `@hapi/hapi`
- `restify`
- `connect`
- `@nestjs/core`

### Message Queues

- `amqplib`
- `kafkajs`

### Cloud Services

- `@aws-sdk/client-*` (AWS SDK v3)

### Logging

- `winston`
- `pino`
- `bunyan`

### Other

- `dns` and `net` (Node.js built-in)
- `fs` (Node.js built-in)
- `dataloader`
- `generic-pool`
- `memcached`
- `socket.io`

## Logging Best Practices

**Tip**: Use a logger that supports a child logger for automatic function metadata insertion. Supported libraries include Winston, Pino, Bunyan, and Roarr.

### Logger Configuration with Extended Traces

```typescript
import winston from "winston";
import { extendedTracesMiddleware } from "inngest/experimental";

// Configure Winston with JSON format for structured logging
const logger = winston.createLogger({
  level: "info",
  exitOnError: false,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "app.log" })
  ]
});

// Enable extended traces
const extendedTraces = extendedTracesMiddleware();

export const inngest = new Inngest({
  id: "my-app",
  logger, // Pass logger to client
  middleware: [extendedTraces]
});
```

### Function Logging Patterns

```typescript
const observableFunction = inngest.createFunction(
  { id: "observable-function", triggers: [{ event: "process/observable" }] },
  async ({ event, step, logger, runId }) => {
    // Logger automatically includes function metadata when using .child()
    logger.info("Function started", {
      eventData: event.data,
      runId
    });

    const userData = await step.run("fetch-user-data", async () => {
      logger.info("Fetching user data", {
        userId: event.data.userId
      });

      const data = await userService.getUser(event.data.userId);

      logger.info("User data fetched", {
        userId: data.id,
        userType: data.type,
        dataSize: JSON.stringify(data).length
      });

      return data;
    });

    const result = await step.run("process-data", async () => {
      // Using Date.now() within a step is OK!
      const startTime = Date.now();

      try {
        const processed = await dataProcessor.process(userData);

        logger.info("Data processing completed", {
          processingTime: Date.now() - startTime,
          resultSize: processed.length
        });

        return processed;
      } catch (error) {
        logger.error("Data processing failed", {
          processingTime: Date.now() - startTime,
          error: error.message,
          userId: userData.id
        });
        throw error;
      }
    });

    logger.info("Function completed successfully", {
      totalExecutionTime: Date.now() - event.ts,
      stepsExecuted: 2,
      resultCount: result.length
    });

    return result;
  }
);
```

### Structured Logging with Correlation IDs

```typescript
const correlatedLogging = inngest.createFunction(
  { id: "correlated-logging", triggers: [{ event: "process/correlated" }] },
  async ({ event, step, logger, runId }) => {
    // Create correlation context
    const correlationId = event.data.correlationId || runId;
    const baseContext = {
      correlationId,
      userId: event.data.userId,
      requestId: event.data.requestId,
      runId
    };

    logger.info("Starting correlated process", baseContext);

    const step1Result = await step.run("external-api-call", async () => {
      logger.info("Calling external API", {
        ...baseContext,
        step: "external-api-call",
        endpoint: "/api/user-data"
      });

      try {
        const response = await externalAPI.getUserData(event.data.userId, {
          headers: { "X-Correlation-ID": correlationId }
        });

        logger.info("External API call successful", {
          ...baseContext,
          step: "external-api-call",
          responseStatus: response.status,
          responseTime: response.responseTime
        });

        return response.data;
      } catch (error) {
        logger.error("External API call failed", {
          ...baseContext,
          step: "external-api-call",
          error: error.message,
          statusCode: error.status
        });
        throw error;
      }
    });

    await step.run("database-operation", async () => {
      logger.info("Performing database operation", {
        ...baseContext,
        step: "database-operation",
        operation: "upsert"
      });

      const result = await database.users.upsert({
        id: event.data.userId,
        data: step1Result,
        correlationId // Include in database record
      });

      logger.info("Database operation completed", {
        ...baseContext,
        step: "database-operation",
        recordId: result.id,
        operation: "upsert"
      });

      return result;
    });
  }
);
```

## Performance Monitoring

### Custom Metrics and Traces

```typescript
import { trace, context, SpanStatusCode } from "@opentelemetry/api";

const customTracing = inngest.createFunction(
  { id: "custom-tracing", triggers: [{ event: "process/traced" }] },
  async ({ event, step }) => {
    const tracer = trace.getTracer("my-app");

    const result = await step.run("traced-operation", async () => {
      // Create custom span
      return tracer.startActiveSpan(
        "business-logic-operation",
        async (span) => {
          try {
            // Add custom attributes
            span.setAttributes({
              "user.id": event.data.userId,
              "operation.type": "data-processing",
              "input.size": JSON.stringify(event.data).length
            });

            // Simulate some work with nested spans
            const processedData = await tracer.startActiveSpan(
              "data-transformation",
              async (childSpan) => {
                childSpan.setAttributes({
                  "transformation.type": "normalize"
                });

                const result = await transformData(event.data);

                childSpan.setAttributes({
                  "transformation.output_records": result.length
                });

                childSpan.setStatus({ code: SpanStatusCode.OK });
                childSpan.end();

                return result;
              }
            );

            // Another nested operation
            const savedData = await tracer.startActiveSpan(
              "data-persistence",
              async (childSpan) => {
                childSpan.setAttributes({
                  "db.operation": "bulk_insert",
                  "db.table": "processed_data"
                });

                const saveResult = await database.bulkInsert(processedData);

                childSpan.setAttributes({
                  "db.records_inserted": saveResult.insertedCount
                });

                childSpan.setStatus({ code: SpanStatusCode.OK });
                childSpan.end();

                return saveResult;
              }
            );

            // Add result attributes to main span
            span.setAttributes({
              "result.records_processed": processedData.length,
              "result.records_saved": savedData.insertedCount
            });

            span.setStatus({ code: SpanStatusCode.OK });

            return savedData;
          } catch (error) {
            span.recordException(error);
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: error.message
            });
            throw error;
          } finally {
            span.end();
          }
        }
      );
    });

    return result;
  }
);
```

## External Service Integration

### Datadog Integration

```typescript
import winston from "winston";

const datadogLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.Http({
      host: "http-intake.logs.datadoghq.com",
      path: `/api/v2/logs?dd-api-key=${process.env.DD_API_KEY}&ddsource=inngest&service=my-app&ddtags=env:${process.env.NODE_ENV}`,
      ssl: true
    })
  ]
});

export const inngest = new Inngest({
  id: "my-app",
  logger: datadogLogger,
  middleware: [extendedTracesMiddleware()]
});
```

## Observability Best Practices

### Key Metrics to Track

- **Function execution time**: Total duration from trigger to completion
- **Step execution time**: Individual step performance
- **Retry rates**: Which steps/functions fail most often
- **Queue depth**: How many functions are waiting to execute
- **Error rates**: Function and step failure percentages
- **Throughput**: Functions processed per minute/hour

### Health Check Functions

```typescript
const healthCheck = inngest.createFunction(
  { id: "health-check", triggers: [{ cron: "*/5 * * * *" }] }, // Every 5 minutes
  async ({ step, logger }) => {
    const healthStatus = {
      services: {}
    };

    // Check database connectivity
    healthStatus.services.database = await step.run(
      "check-database",
      async () => {
        try {
          const result = await database.query("SELECT 1");
          return { status: "healthy" };
        } catch (error) {
          return { status: "unhealthy", error: error.message };
        }
      }
    );

    // Check external API connectivity
    healthStatus.services.externalAPI = await step.run(
      "check-external-api",
      async () => {
        try {
          const startTime = Date.now();
          const response = await externalAPI.healthCheck();
          return {
            status: "healthy",
            apiStatus: response.status
          };
        } catch (error) {
          return { status: "unhealthy", error: error.message };
        }
      }
    );

    // Send health status to monitoring
    await step.run("report-health-status", async () => {
      const overallHealth = Object.values(healthStatus.services).every(
        (service) => service.status === "healthy"
      )
        ? "healthy"
        : "degraded";

      await monitoringService.reportHealth({
        ...healthStatus,
        overallStatus: overallHealth
      });

      if (overallHealth === "degraded") {
        await alertingService.send({
          level: "warning",
          message: "System health check detected issues",
          healthStatus
        });
      }
    });

    return healthStatus;
  }
);
```

## Debugging and Troubleshooting

### Debug Logging Configuration

```typescript
const debugFunction = inngest.createFunction(
  { id: "debug-function", triggers: [{ event: "debug/test" }] },
  async ({ event, step, logger }) => {
    // Enable debug logging conditionally
    const isDebugMode =
      event.data.debug || process.env.NODE_ENV === "development";

    if (isDebugMode) {
      logger.debug("Debug mode enabled", {
        eventData: event.data,
        environment: process.env.NODE_ENV
      });
    }

    const result = await step.run("debug-operation", async () => {
      if (isDebugMode) {
        logger.debug("Starting debug operation", {
          input: event.data,
          timestamp: Date.now()
        });
      }

      try {
        const result = await someOperation(event.data);

        if (isDebugMode) {
          logger.debug("Operation completed", {
            result: result,
            executionTime: Date.now() - startTime
          });
        }

        return result;
      } catch (error) {
        logger.error("Operation failed", {
          error: error.message,
          stack: isDebugMode ? error.stack : undefined,
          input: event.data
        });
        throw error;
      }
    });

    return result;
  }
);
```

This comprehensive observability setup ensures you have full visibility into your Inngest functions' performance, errors, and behavior across all environments.
