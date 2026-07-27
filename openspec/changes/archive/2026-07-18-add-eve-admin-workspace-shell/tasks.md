## 1. Operations-first shell

- [x] 1.1 Add an explicit server-side admin access gate and route metadata.
- [x] 1.2 Put the complete operations panel index before chat or future runtime UI.
- [x] 1.3 Preserve real API-backed governance, audit, policy, memory, approval,
      budget, and retention panels.

## 2. Missing operational visibility

- [x] 2.1 Add real failure summaries from persisted run and audit state.
- [x] 2.2 Add model-policy-backed eval health and active subagent override state.
- [x] 2.3 Add explicit unavailable states for GitHub, notifications, and chat
      without fabricating activity or health.

## 3. Safety and controls

- [x] 3.1 Keep controls server role-gated and retain `ai.settings.manage` for
      model-policy mutation.
- [x] 3.2 Render decision summaries and redacted governance metadata only.
- [x] 3.3 Keep the Eve runtime mount and master release transition out of scope.

## 4. Durable context and verification

- [x] 4.1 Record ADR-0028 and update the implementation plan.
- [x] 4.2 Add focused role, panel-index, connection-state, failure, eval, and
      subagent tests.
- [x] 4.3 Run admin lint/typecheck, strict OpenSpec validation, and full CI
      preflight.
