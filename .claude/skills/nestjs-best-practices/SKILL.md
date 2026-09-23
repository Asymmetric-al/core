---
name: nestjs-best-practices
description: NestJS best practices and architecture patterns for building production-ready applications. This skill should be used when writing, reviewing, or refactoring NestJS code to ensure proper patterns for modules, dependency injection, security, and performance.
license: MIT
metadata:
  author: Kadajett
  version: "1.2.0"
---

# NestJS Best Practices

<!-- CORE-OVERLAY-START -->

## This repository (Asymmetric-al/core)

These repo-owned sections are intentionally kept on top of the vendored NestJS
skill. If upstream refreshes replace this file, reconcile this overlay
before running `bun run skills:sync`. Core is a Bun + Next.js monorepo, not a NestJS application. Do not introduce NestJS modules, controllers, TypeORM, or
a Nest runtime into this repository.

### Triggers

- Reviewing NestJS patterns in third-party or vendored NestJS code.
- Explicit NestJS architecture, DI, or security questions.

### Workflow

1. Confirm the files under edit are actually NestJS, not Core Next.js / `packages/api`.
2. Prefer `docs/ai/rules/backend.md` and the data-access boundary for product work.
3. Use this skill only as NestJS reference; do not restyle Core around NestJS examples.

### Checklist

- [ ] Confirmed the task is NestJS reference, not a Core stack change.
- [ ] Did not add NestJS, TypeORM, or Nest modules to this monorepo.
- [ ] Kept tenant, auth, and data-access rules authoritative for product code.

<!-- CORE-OVERLAY-END -->

Comprehensive best practices guide for NestJS applications. Contains 40 rules across 10 categories, prioritized by impact to guide automated refactoring and code generation.

## When to Apply

Reference these guidelines when:

- Writing new NestJS modules, controllers, or services
- Implementing authentication and authorization
- Reviewing code for architecture and security issues
- Refactoring existing NestJS codebases
- Optimizing performance or database queries
- Building microservices architectures

## Rule Categories by Priority

| Priority | Category             | Impact      | Prefix      |
| -------- | -------------------- | ----------- | ----------- |
| 1        | Architecture         | CRITICAL    | `arch-`     |
| 2        | Dependency Injection | CRITICAL    | `di-`       |
| 3        | Error Handling       | HIGH        | `error-`    |
| 4        | Security             | HIGH        | `security-` |
| 5        | Performance          | HIGH        | `perf-`     |
| 6        | Testing              | MEDIUM-HIGH | `test-`     |
| 7        | Database & ORM       | MEDIUM-HIGH | `db-`       |
| 8        | API Design           | MEDIUM      | `api-`      |
| 9        | Microservices        | MEDIUM      | `micro-`    |
| 10       | DevOps & Deployment  | LOW-MEDIUM  | `devops-`   |

## Quick Reference

### 1. Architecture (CRITICAL)

- `arch-avoid-circular-deps` - Avoid circular module dependencies
- `arch-feature-modules` - Organize by feature, not technical layer
- `arch-module-sharing` - Proper module exports/imports, avoid duplicate providers
- `arch-single-responsibility` - Focused services over "god services"
- `arch-use-repository-pattern` - Abstract database logic for testability
- `arch-use-events` - Event-driven architecture for decoupling

### 2. Dependency Injection (CRITICAL)

- `di-avoid-service-locator` - Avoid service locator anti-pattern
- `di-interface-segregation` - Interface Segregation Principle (ISP)
- `di-liskov-substitution` - Liskov Substitution Principle (LSP)
- `di-prefer-constructor-injection` - Constructor over property injection
- `di-scope-awareness` - Understand singleton/request/transient scopes
- `di-use-interfaces-tokens` - Use injection tokens for interfaces

### 3. Error Handling (HIGH)

- `error-use-exception-filters` - Centralized exception handling
- `error-throw-http-exceptions` - Use NestJS HTTP exceptions
- `error-handle-async-errors` - Handle async errors properly

### 4. Security (HIGH)

- `security-auth-jwt` - Secure JWT authentication
- `security-validate-all-input` - Validate with class-validator
- `security-use-guards` - Authentication and authorization guards
- `security-sanitize-output` - Prevent XSS attacks
- `security-rate-limiting` - Implement rate limiting

### 5. Performance (HIGH)

- `perf-async-hooks` - Proper async lifecycle hooks
- `perf-use-caching` - Implement caching strategies
- `perf-optimize-database` - Optimize database queries
- `perf-lazy-loading` - Lazy load modules for faster startup

### 6. Testing (MEDIUM-HIGH)

- `test-use-testing-module` - Use NestJS testing utilities
- `test-e2e-supertest` - E2E testing with Supertest
- `test-mock-external-services` - Mock external dependencies

### 7. Database & ORM (MEDIUM-HIGH)

- `db-use-transactions` - Transaction management
- `db-avoid-n-plus-one` - Avoid N+1 query problems
- `db-use-migrations` - Use migrations for schema changes

### 8. API Design (MEDIUM)

- `api-use-dto-serialization` - DTO and response serialization
- `api-use-interceptors` - Cross-cutting concerns
- `api-versioning` - API versioning strategies
- `api-use-pipes` - Input transformation with pipes

### 9. Microservices (MEDIUM)

- `micro-use-patterns` - Message and event patterns
- `micro-use-health-checks` - Health checks for orchestration
- `micro-use-queues` - Background job processing

### 10. DevOps & Deployment (LOW-MEDIUM)

- `devops-use-config-module` - Environment configuration
- `devops-use-logging` - Structured logging
- `devops-graceful-shutdown` - Zero-downtime deployments

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/arch-avoid-circular-deps.md
rules/security-validate-all-input.md
rules/_sections.md
```

Each rule file contains:

- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Additional context and references

## Full Compiled Document

For the complete guide with all rules expanded in a single document, see
[AGENTS.md in the repository](https://github.com/Kadajett/agent-nestjs-skills/blob/main/AGENTS.md).
