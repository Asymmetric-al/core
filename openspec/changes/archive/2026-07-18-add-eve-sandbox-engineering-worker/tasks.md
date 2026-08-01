## 1. Provision the isolated workspace

- [x] 1.1 Author the installed Eve sandbox with deny-first backend policy
- [x] 1.2 Provision a writable public Core checkout under `/workspace/repo`
- [x] 1.3 Remove environment files without mounting host secrets or data

## 2. Enforce containment

- [x] 2.1 Deny sensitive paths, credential content, workspace escapes, and production dumps
- [x] 2.2 Detect ADR-0018 protected paths in writes and commands
- [x] 2.3 Route protected work through Eve's durable approval pause

## 3. Enforce network governance

- [x] 3.1 Start every supported backend with deny-all networking
- [x] 3.2 Read persisted governance before allowing network access
- [x] 3.3 Recheck emergency-off and networking kill switches before commands

## 4. Audit effects

- [x] 4.1 Audit network-policy changes, commands, potential egress, and file writes
- [x] 4.2 Store command fingerprints instead of raw command text
- [x] 4.3 Fail closed when start audit evidence cannot be persisted

## 5. Document and verify

- [x] 5.1 Record ADR-0030 and update the implementation plan
- [x] 5.2 Test scanning, approval, audit classification, and kill-switch decisions
- [x] 5.3 Compile the sandbox with Eve 0.25.1 and run repository CI preflight
