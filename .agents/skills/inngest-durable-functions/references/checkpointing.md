# Checkpointing for Performance Optimization

Guide to using Inngest's checkpointing feature for dramatically lower latency in real-time workflows.

## What is Checkpointing?

Checkpointing executes steps **immediately on your server** rather than waiting for orchestration from Inngest. Steps run eagerly with periodic state checkpoints sent to Inngest for safety.

### Performance Comparison

- **Without checkpointing**: ~50-100ms per step (HTTP round-trip to Inngest)
- **With checkpointing**: Near-zero latency between steps, periodic checkpoints

```typescript
// Traditional execution: Each step = separate HTTP request
const traditional = inngest.createFunction(
  { id: "traditional-execution", triggers: [{ event: "process/traditional" }] },
  async ({ event, step }) => {
    // Step 1: HTTP request to Inngest → response → continue
    const data = await step.run("fetch-data", () => fetchData());

    // Step 2: HTTP request to Inngest → response → continue
    const processed = await step.run("process", () => process(data));

    // Step 3: HTTP request to Inngest → response → complete
    return await step.run("save", () => save(processed));
  }
);

// Checkpointed execution: Steps run immediately, periodic checkpoints
const checkpointed = inngest.createFunction(
  {
    id: "checkpointed-execution",
    triggers: [{ event: "process/checkpointed" }]
  },
  async ({ event, step }) => {
    // All steps run immediately, checkpoints sent periodically
    const data = await step.run("fetch-data", () => fetchData());
    const processed = await step.run("process", () => process(data));
    return await step.run("save", () => save(processed));
  }
);
```

## Basic Checkpointing Setup

**Checkpointing is enabled by default in v4.** All functions automatically use checkpointing for optimal performance. You can configure `maxRuntime` for serverless environments or disable it per-function if needed.

### TypeScript Configuration

```typescript
import { Inngest } from "inngest";

// Checkpointing is enabled by default - no configuration needed
export const inngest = new Inngest({
  id: "my-app"
});

// Functions automatically use checkpointing
const realTimeFunction = inngest.createFunction(
  {
    id: "real-time-function",
    triggers: [{ event: "realtime/process" }]
  },
  async ({ event, step }) => {
    // Steps execute immediately with periodic checkpointing
    const result1 = await step.run("immediate-step-1", () =>
      process1(event.data)
    );
    const result2 = await step.run("immediate-step-2", () => process2(result1));
    const result3 = await step.run("immediate-step-3", () => process3(result2));

    return { result: result3 };
  }
);

// Configure maxRuntime for serverless environments
const serverlessFunction = inngest.createFunction(
  {
    id: "serverless-function",
    triggers: [{ event: "realtime/serverless" }],
    checkpointing: {
      maxRuntime: "4m45s" // Leave buffer before platform timeout
    }
  },
  async ({ event, step }) => {
    // Steps execute immediately with checkpointing
    const result = await step.run("process", () => process(event.data));
    return { result };
  }
);

// Disable checkpointing for a specific function if needed
const noCheckpointFunction = inngest.createFunction(
  {
    id: "no-checkpoint-function",
    triggers: [{ event: "legacy/process" }],
    checkpointing: false
  },
  async ({ event, step }) => {
    // Uses traditional step-by-step orchestration
    const result = await step.run("process", () => process(event.data));
    return { result };
  }
);
```

### Go Configuration

```go
import (
  "github.com/inngest/inngestgo"
  "github.com/inngest/inngestgo/pkg/checkpoint"
)

_, err := inngestgo.CreateFunction(
  client,
  inngestgo.FunctionOpts{
    ID:         "checkpointed-function",
    Name:       "Checkpointed Function",
    Checkpoint: checkpoint.ConfigSafe, // Enable checkpointing
  },
  inngestgo.EventTrigger("process/checkpointed", nil),
  func(ctx context.Context, input inngestgo.Input[ProcessEvent]) (any, error) {
    // Function implementation
    return processWithCheckpoints(input.Event.Data)
  },
)
```

## Advanced Configuration

### Detailed Checkpointing Options

```typescript
const advancedCheckpointing = inngest.createFunction(
  {
    id: "advanced-checkpointing",
    triggers: [{ event: "process/advanced" }],
    checkpointing: {
      // Maximum time to execute continuously before returning response
      maxRuntime: "300s", // Default: unlimited (0)

      // Number of steps to buffer before checkpointing
      bufferedSteps: 3, // Default: 1 (no buffering)

      // Maximum time to wait before checkpointing buffered steps
      maxInterval: "10s" // Default: immediate
    }
  },
  async ({ event, step }) => {
    // With bufferedSteps: 3, first 3 steps execute without checkpointing
    const step1 = await step.run("step-1", () => process1(event.data));
    const step2 = await step.run("step-2", () => process2(step1));
    const step3 = await step.run("step-3", () => process3(step2));
    // Checkpoint sent after step 3

    const step4 = await step.run("step-4", () => process4(step3));
    const step5 = await step.run("step-5", () => process5(step4));
    const step6 = await step.run("step-6", () => process6(step5));
    // Checkpoint sent after step 6

    return { result: step6 };
  }
);
```

### Platform-Specific Runtime Limits

```typescript
// Vercel Functions (5-minute timeout)
const vercelFunction = inngest.createFunction(
  {
    id: "vercel-optimized",
    triggers: [{ event: "process/vercel" }],
    checkpointing: {
      maxRuntime: "4m45s" // Leave 15s buffer for cleanup
    }
  },
  async ({ event, step }) => {
    /* ... */
  }
);

// AWS Lambda (15-minute timeout)
const lambdaFunction = inngest.createFunction(
  {
    id: "lambda-optimized",
    triggers: [{ event: "process/lambda" }],
    checkpointing: {
      maxRuntime: "14m30s" // Leave 30s buffer
    }
  },
  async ({ event, step }) => {
    /* ... */
  }
);

// Long-running server (unlimited)
const serverFunction = inngest.createFunction(
  {
    id: "server-optimized",
    triggers: [{ event: "process/server" }],
    checkpointing: {
      maxRuntime: "0", // Unlimited
      bufferedSteps: 5, // More aggressive buffering
      maxInterval: "30s"
    }
  },
  async ({ event, step }) => {
    /* ... */
  }
);
```

## Checkpointing Patterns for Different Use Cases

### Real-Time AI/ML Workflows

```typescript
const aiWorkflow = inngest.createFunction(
  {
    id: "ai-workflow",
    triggers: [{ event: "ai/process.requested" }],
    checkpointing: {
      maxRuntime: "10m",
      bufferedSteps: 2,
      maxInterval: "5s"
    }
  },
  async ({ event, step }) => {
    // Immediate execution for real-time feel
    const preprocessed = await step.run("preprocess-data", () => {
      return preprocessInputData(event.data.input);
    });

    const modelResult = await step.run("run-ml-model", () => {
      return mlModel.predict(preprocessed);
    });

    const postprocessed = await step.run("postprocess-result", () => {
      return postprocessResult(modelResult, event.data.options);
    });

    const saved = await step.run("save-result", () => {
      return saveToDatabase(postprocessed, event.data.userId);
    });

    // Real-time response to user
    await step.run("send-realtime-response", () => {
      return websocketService.send(event.data.userId, {
        result: postprocessed,
        resultId: saved.id
      });
    });

    return { resultId: saved.id };
  }
);
```

### High-Throughput Data Processing

```typescript
const dataProcessingPipeline = inngest.createFunction(
  {
    id: "data-processing-pipeline",
    triggers: [{ event: "data/batch.received" }],
    checkpointing: {
      maxRuntime: "15m",
      bufferedSteps: 10, // High buffering for throughput
      maxInterval: "60s" // Less frequent checkpoints
    }
  },
  async ({ event, step }) => {
    const batchId = event.data.batchId;

    // Fast processing of many items
    const items = await step.run("fetch-batch-items", () => {
      return fetchBatchItems(batchId);
    });

    // Process items in parallel chunks
    const processedChunks = [];
    const chunkSize = 100;

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);

      const processedChunk = await step.run(`process-chunk-${i}`, () => {
        return Promise.all(chunk.map((item) => processItem(item)));
      });

      processedChunks.push(processedChunk);
    }

    // Flatten and validate results
    const allResults = await step.run("aggregate-results", () => {
      const flattened = processedChunks.flat();
      return validateAndAggregateResults(flattened);
    });

    // Bulk save to database
    await step.run("bulk-save-results", () => {
      return database.bulkInsert("processed_items", allResults);
    });

    return {
      batchId,
      itemsProcessed: allResults.length,
      processingTime: Date.now() - event.ts
    };
  }
);
```

### Interactive User Workflows

```typescript
const interactiveWorkflow = inngest.createFunction(
  {
    id: "interactive-workflow",
    triggers: [{ event: "user/workflow.started" }],
    checkpointing: {
      maxRuntime: "5m",
      bufferedSteps: 1, // Immediate checkpoints for user feedback
      maxInterval: "2s"
    }
  },
  async ({ event, step }) => {
    const userId = event.data.userId;

    // Step 1: Immediate user feedback
    await step.run("send-progress-update", () => {
      return notificationService.send(userId, {
        message: "Processing started...",
        progress: 10
      });
    });

    // Step 2: Quick validation
    const validationResult = await step.run("validate-request", () => {
      const result = validateUserRequest(event.data);

      notificationService.send(userId, {
        message: result.valid ? "Request validated" : "Validation failed",
        progress: 25
      });

      return result;
    });

    if (!validationResult.valid) {
      return { error: "Validation failed", details: validationResult.errors };
    }

    // Step 3: Main processing with progress updates
    const processedData = await step.run("main-processing", () => {
      notificationService.send(userId, {
        message: "Processing your request...",
        progress: 50
      });

      const result = performMainProcessing(event.data);

      notificationService.send(userId, {
        message: "Processing complete",
        progress: 90
      });

      return result;
    });

    // Step 4: Final completion
    await step.run("complete-workflow", () => {
      notificationService.send(userId, {
        message: "Workflow completed successfully!",
        progress: 100,
        result: processedData
      });

      return logWorkflowCompletion(userId, processedData);
    });

    return { success: true, result: processedData };
  }
);
```

## Checkpointing Best Practices

### When to Use Checkpointing

```typescript
// ✅ IDEAL for checkpointing: Real-time workflows
const idealForCheckpointing = inngest.createFunction(
  {
    id: "ideal-checkpointing",
    triggers: [{ event: "realtime/user.request" }]
  },
  async ({ event, step }) => {
    // Fast operations that benefit from immediate execution
    const validated = await step.run("validate", () => validate(event.data));
    const processed = await step.run("process", () => process(validated));
    const response = await step.run("respond", () => sendResponse(processed));

    return response;
  }
);

// ❌ NOT ideal for checkpointing: Very long-running steps
const notIdealForCheckpointing = inngest.createFunction(
  {
    id: "not-ideal-checkpointing",
    triggers: [{ event: "batch/long.process" }],
    checkpointing: false // Disable for very long-running steps
  },
  async ({ event, step }) => {
    // Very long-running operations
    const largeDataset = await step.run("fetch-large-dataset", () => {
      return fetchMillionsOfRecords(); // Takes 10+ minutes
    });

    const processed = await step.run("heavy-processing", () => {
      return processLargeDataset(largeDataset); // Takes 30+ minutes
    });

    return processed;
  }
);
```

### Configuration Guidelines

```typescript
// High-frequency, low-latency functions
const highFrequencyConfig = {
  checkpointing: {
    maxRuntime: "1m",
    bufferedSteps: 1, // Immediate checkpoints
    maxInterval: "1s"
  }
};

// Medium complexity workflows
const mediumComplexityConfig = {
  checkpointing: {
    maxRuntime: "5m",
    bufferedSteps: 3, // Balance performance and safety
    maxInterval: "10s"
  }
};

// High-throughput batch processing
const highThroughputConfig = {
  checkpointing: {
    maxRuntime: "10m",
    bufferedSteps: 10, // Maximize performance
    maxInterval: "30s"
  }
};
```

## Current Limitations

### Known Limitations

- **Parallel step execution**: Switches to standard orchestration when function branches into parallel steps
- **No checkpointing resume**: After parallel execution, checkpointing doesn't resume
- **Middleware compatibility**: Ensure SDK version >=3.51.0 for proper middleware transforms

### Feature Support Matrix

| Feature             | Supported                                 |
| ------------------- | ----------------------------------------- |
| Local development   | ✅                                        |
| Self-hosted Inngest | ✅                                        |
| Inngest Cloud       | ✅                                        |
| Sequential steps    | ✅                                        |
| Parallel steps      | ⚠️ (Falls back to standard orchestration) |
| Error retries       | ✅                                        |
| Step memoization    | ✅                                        |
| Cancellation        | ✅                                        |

Checkpointing dramatically improves function latency for real-time workflows while maintaining all the durability and reliability benefits of Inngest's execution model.
