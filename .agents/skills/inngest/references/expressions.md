# Inngest Expression Syntax

Inngest uses expressions in several places: `cancelOn`, `step.waitForEvent()`, flow control `key` fields, `priority.run`, and `batchEvents.if`. Expressions use a **CEL-like syntax** (Common Expression Language).

## Variable Reference

### In `cancelOn` and `step.waitForEvent()`

Two variables are available:

- **`event`** = the **ORIGINAL** event that triggered the current function run
- **`async`** = the **NEW** event being matched (the cancellation event or the event being waited for)

These expressions used with `if` should return a boolean value, so equality expressions are expected.

```typescript
// cancelOn example:
// Function triggered by "order/created", cancelled by "order/cancelled"
cancelOn: [
  {
    event: "order/cancelled",
    // event = original "order/created", async = new "order/cancelled"
    if: "event.data.orderId == async.data.orderId"
  }
];

// step.waitForEvent example:
// Function triggered by "user/signup.completed", waiting for "app/subscription.created"
await step.waitForEvent("wait-for-subscription", {
  event: "app/subscription.created",
  timeout: "30d",
  // event = original "user/signup.completed", async = new "app/subscription.created"
  if: "event.data.userId == async.data.userId"
});
```

### In flow control (`key`, `priority.run`, `batchEvents.if`)

Only **`event`** is available, referring to the triggering event.

These expect unique values, not boolean values. It is recommended to return strings or integers.

```typescript
// Concurrency key
concurrency: [{ key: "event.data.user_id", limit: 1 }]

// Throttle key
throttle: { key: "event.data.customer_id", limit: 10, period: "60s" }

// Priority expression
priority: { run: "event.data.plan == 'enterprise' ? 120 : 0" }

// Batch filter
batchEvents: { maxSize: 100, timeout: "30s", key: "event.data.user_id" }
```

## Operators & Syntax

### Comparison

```
==    // Equality
!=    // Inequality
>     // Greater than
>=    // Greater than or equal
<     // Less than
<=    // Less than or equal
```

### Logical

```
&&    // AND
||    // OR
!     // NOT
```

### Ternary (for priority expressions)

```
event.data.tier == 'vip' ? 120 : 0
```

### String values

Always use **single quotes** for string literals inside expressions:

```
"event.data.plan == 'enterprise'"
"event.data.status == 'active' && event.data.role == 'admin'"
```

## Common Patterns

```typescript
// Match by ID
"event.data.userId == async.data.userId";

// Multiple conditions
"event.data.userId == async.data.userId && async.data.status == 'completed'";

// OR conditions
"event.data.plan == 'enterprise' || event.data.plan == 'pro'";

// Numeric comparison
"event.data.amount > 1000";

// Static string key (use backtick-wrapped single quotes in TypeScript)
key: `"openai"`; // Applies same limit across all events
```

## Important Notes

- **String literals use single quotes** inside the expression: `'enterprise'`, not `"enterprise"`
- **`event` always refers to the original triggering event** in all contexts
- **`async` is only available** in `cancelOn` and `waitForEvent` expressions
- **Flow control keys** support expressions but only have access to `event`
- The `match` shorthand in `waitForEvent` (e.g., `match: "data.userId"`) is equivalent to `if: "event.data.userId == async.data.userId"` for simple equality matching
- Using a logical operator forces the statement to return a boolean value. For example, using `event.data.userId || event.data.accountId` will always return a boolean value, not a string.
