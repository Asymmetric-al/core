## 1. Mount verified GitHub ingress

- [x] 1.1 Author the installed Eve 0.25.1 GitHub channel
- [x] 1.2 Support Vercel Connect and direct server-only App credentials
- [x] 1.3 Gate PR events and PR-scoped mentions on persisted governance

## 2. Constrain review output

- [x] 2.1 Parse a strict bounded decision-summary and inline-finding schema
- [x] 2.2 Reject sensitive output before it reaches GitHub
- [x] 2.3 Derive protected-area visibility from observed changed paths

## 3. Gate and audit the effect

- [x] 3.1 Consult #423 before review publication
- [x] 3.2 Persist #419 bot, sender, policy, evidence, and change records
- [x] 3.3 Post summary and inline findings in one idempotent COMMENT review
- [x] 3.4 Disable ungated default reaction and failure-comment effects

## 4. Preserve authority boundaries

- [x] 4.1 Expose no label, CI rerun, push, issue, branch, PR-state, or merge API
- [x] 4.2 Keep credentials outside the sandbox and release disabled

## 5. Document and verify

- [x] 5.1 Record ADR-0063, configuration, permissions, and runbook
- [x] 5.2 Test output policy, protected paths, governance, approval, audit, and replay markers
- [x] 5.3 Compile with Eve 0.25.1 and run strict OpenSpec and repository gates
