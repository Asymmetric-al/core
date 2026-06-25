# Step Execution and Memoization

Deep dive into how Inngest executes steps, handles memoization, and manages state persistence.

## How Step Execution Works

### Execution Flow

1. **Initial execution**: Function called with event payload
2. **Step discovery**: First step encountered, code executes
3. **State persistence**: Result sent to Inngest, stored in state
4. **Function interruption**: Execution stops after first step
5. **Subsequent execution**: Function re-called with event + previous state
6. **Memoization**: Previous step result injected, execution continues

### Each Step = HTTP Request

**Tip**: See [references/checkpointing.md](references/checkpointing.md) to handle multiple steps on a single HTTP request, optimizing performance for low latency.

```typescript
const importContacts = inngest.createFunction(
  { id: "import-contacts", triggers: [{ event: "contacts/csv.uploaded" }] },
  async ({ event, step }) => {
    // HTTP Request #1 - Executes and returns
    const rows = await step.run("parse-csv", async () => {
      return await parseCsv(event.data.fileURI);
    });

    // HTTP Request #2 - Gets rows from state, executes this step
    const normalizedRows = await step.run("normalize-csv", async () => {
      return normalizeRows(rows, getColumnMapping());
    });

    // HTTP Request #3 - Gets previous results, executes final step
    const results = await step.run("import-contacts", async () => {
      return await importContacts(normalizedRows);
    });

    return { results };
  }
);
```

## Step ID Management

### Step ID Hashing

- Inngest **hashes step IDs** as state identifiers
- **Index position** also included in result
- Same ID can be reused - Inngest handles counters automatically

```typescript
async ({ event, step }) => {
  // These are DIFFERENT executions even with same ID
  const userData = await step.run("fetch-data", () =>
    fetchUser(event.data.userId)
  );
  const orderData = await step.run("fetch-data", () =>
    fetchOrders(event.data.userId)
  );

  // Inngest internally tracks: fetch-data[0] and fetch-data[1]
};
```

### Best Practices for Step IDs

```typescript
// ✅ GOOD: Descriptive and unique
await step.run("validate-payment-method", () => validatePayment());
await step.run("charge-customer-card", () => chargeCard());
await step.run("send-confirmation-email", () => sendEmail());

// ❌ AVOID: Too generic
await step.run("step1", () => validatePayment());
await step.run("step2", () => chargeCard());
await step.run("step3", () => sendEmail());

// ❌ DANGEROUS: Changing IDs breaks memoization
// Before deploy:
await step.run("process-data", () => processUserData());
// After deploy:
await step.run("process-user-data", () => processUserData()); // Will re-execute!
```

**Note**: Changing IDs will force re-execution, which can be used to evolve the functionality of a function.

## State Persistence and Recovery

### State Structure

```json
{
  "parse-csv": {
    "data": [...], // Step result
    "index": 0
  },
  "normalize-csv": {
    "data": {...},
    "index": 1
  }
}
```

### Recovery from Failures

```typescript
const robustProcess = inngest.createFunction(
  { id: "robust-process", triggers: [{ event: "process/data" }] },
  async ({ event, step }) => {
    // Step 1: Completes successfully
    const data = await step.run("fetch-external-data", async () => {
      return await externalAPI.getData(event.data.id);
    });

    // Step 2: Fails with network timeout
    const processed = await step.run("process-data", async () => {
      // This throws an error on first attempt
      return await heavyProcessing(data);
    });

    // On retry:
    // - Step 1 is skipped (memoized result used)
    // - Step 2 is re-executed with same input data
    // - If successful, continues to step 3

    await step.run("save-results", async () => {
      return await database.save(processed);
    });
  }
);
```

## Advanced Step Patterns

### Parallel Step Execution

```typescript
const parallelProcess = inngest.createFunction(
  { id: "parallel-process", triggers: [{ event: "process/parallel" }] },
  async ({ event, step }) => {
    const userData = await step.run("fetch-user", () => {
      return getUserData(event.data.userId);
    });

    // These run in parallel (separate HTTP requests)
    const [profile, orders, preferences] = await Promise.all([
      step.run("fetch-profile", () => getUserProfile(userData.id)),
      step.run("fetch-orders", () => getUserOrders(userData.id)),
      step.run("fetch-preferences", () => getUserPreferences(userData.id))
    ]);

    return { profile, orders, preferences };
  }
);
```

### Conditional Step Execution

```typescript
const conditionalSteps = inngest.createFunction(
  { id: "conditional-steps", triggers: [{ event: "user/signup" }] },
  async ({ event, step }) => {
    const user = await step.run("create-user", () => {
      return createUser(event.data);
    });

    // Conditional steps - only executed when conditions are met
    if (user.accountType === "premium") {
      await step.run("setup-premium-features", () => {
        return setupPremiumFeatures(user.id);
      });
    }

    if (user.company) {
      await step.run("create-company-profile", () => {
        return createCompanyProfile(user.company);
      });
    }

    // Always executed
    await step.run("send-welcome-email", () => {
      return sendWelcomeEmail(user.email);
    });
  }
);
```

### Dynamic Step Generation

```typescript
const dynamicSteps = inngest.createFunction(
  { id: "dynamic-steps", triggers: [{ event: "batch/process" }] },
  async ({ event, step }) => {
    const items = await step.run("fetch-items", () => {
      return getItemsToProcess(event.data.batchId);
    });

    // Process each item as separate step for individual retry
    const results = [];
    for (let i = 0; i < items.length; i++) {
      const result = await step.run(`process-item-${i}`, () => {
        return processItem(items[i]);
      });
      results.push(result);
    }

    return { processedCount: results.length, results };
  }
);
```

## Step Timing and Performance

### Step Overhead

- Each step adds ~50-100ms overhead (See "checkpointing" reference)
- Consider **step granularity** vs **retry isolation**

```typescript
// ❌ TOO GRANULAR: Many small steps
const tooGranular = inngest.createFunction(
  { id: "too-granular", triggers: [{ event: "process/data" }] },
  async ({ event, step }) => {
    const a = await step.run("step-1", () => simpleOperation1());
    const b = await step.run("step-2", () => simpleOperation2(a));
    const c = await step.run("step-3", () => simpleOperation3(b));
    // 3 atomic requests for simple operations
  }
);

// ✅ BETTER: Logical grouping
const betterGrouping = inngest.createFunction(
  { id: "better-grouping", triggers: [{ event: "process/data" }] },
  async ({ event, step }) => {
    const processedData = await step.run("process-data-batch", () => {
      const a = simpleOperation1();
      const b = simpleOperation2(a);
      return simpleOperation3(b);
    });

    // Separate step for different failure domain
    const result = await step.run("save-to-database", () => {
      return database.save(processedData);
    });
  }
);
```

### When to Use Steps vs Regular Code

```typescript
// Use steps for:
// - API calls (can fail due to network)
// - Database operations (can fail due to locks)
// - File I/O operations
// - Any non-deterministic operations
// - Operations you want to retry independently

// Use regular code for:
// - Pure functions/calculations
// - Data transformations
// - Validation logic
// - Simple conditionals

const goodPatterns = inngest.createFunction(
  { id: "good-patterns", triggers: [{ event: "process/user" }] },
  async ({ event, step }) => {
    // ✅ Regular code: deterministic validation
    if (!event.data.email || !event.data.userId) {
      throw new Error("Missing required fields");
    }

    // ✅ Step: External API call
    const userData = await step.run("fetch-user-data", () => {
      return userAPI.getUser(event.data.userId);
    });

    // ✅ Regular code: data transformation
    const processedData = {
      ...userData,
      email: event.data.email.toLowerCase(),
      fullName: `${userData.firstName} ${userData.lastName}`
    };

    // ✅ Step: Database operation
    const savedUser = await step.run("save-user", () => {
      return database.users.upsert(processedData);
    });

    return { userId: savedUser.id };
  }
);
```

## Troubleshooting Step Issues

### Common Step Problems

1. **Step never completes**

```typescript
// ❌ PROBLEM: Infinite loop or hanging operation
await step.run("broken-step", async () => {
  while (true) {} // This will timeout the function
});

// ✅ SOLUTION: Add proper exit conditions
await step.run("fixed-step", async () => {
  let attempts = 0;
  while (attempts < 10) {
    const result = await tryOperation();
    if (result.success) return result;
    attempts++;
  }
  throw new Error("Max attempts reached");
});
```

2. **Step re-executes unexpectedly**

```typescript
// ❌ PROBLEM: Changed step ID
// Before:
await step.run("process-data", () => processData());
// After deploy:
await step.run("process-user-data", () => processData()); // Re-executes!

// ✅ SOLUTION: Keep step IDs consistent
await step.run("process-data", () => processUserData()); // Same ID, updated logic
```

3. **Step data inconsistency**

```typescript
// ❌ PROBLEM: Non-deterministic data in step
await step.run("create-record", () => {
  return database.create({
    id: Math.random(), // Different on retry!
    timestamp: Date.now(), // Different on retry!
    data: event.data
  });
});

// ✅ SOLUTION: Use deterministic or external IDs
await step.run("create-record", () => {
  return database.create({
    id: event.data.userId + "-" + event.data.timestamp,
    timestamp: event.data.timestamp,
    data: event.data
  });
});
```

## Step Performance Monitoring

### Key Metrics to Track

- **Step execution time**: Individual step performance
- **Step retry rate**: Which steps fail most often
- **Function duration**: Total execution time across all steps
- **Memoization hit rate**: How often steps are skipped
