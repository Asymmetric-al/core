# Proposal: Implement the Eve sandbox engineering worker

## Why

The isolated Eve runtime needs a real writable Core checkout for engineering
work. General network access is necessary for normal repository tooling, but it
must not create a path from application secrets or production data to the
model-controlled environment.

## What changes

- Author an Eve 0.25.1 per-session sandbox using the best isolated backend
  available on the host.
- Provision a public `develop` checkout into `/workspace/repo`, strip
  environment files, and create a clean local sanitization commit.
- Start every backend with deny-all networking and enable allow-all only after
  persisted app governance authorizes it.
- Repeat network authorization before commands so emergency-off and the
  sandbox-networking kill switch take effect fail-closed.
- Enable sandbox-native read, search, write, and shell capabilities while
  wrapping writes and commands with sensitive-file and protected-area policy.
- Deny secrets, environment files, service-role keys, workspace escapes, and
  production dumps; route protected repository operations through Eve's
  durable user-approval pause.
- Audit network-policy changes, commands, potential egress, and writes using
  the existing Eve audit shape without persisting raw command text.
- Record ADR-0030 and focused containment tests.

## Authority and release posture

The sandbox adds no application secret, service-role key, production dataset,
provider credential, GitHub write identity, or deployment authority. Model
policy and budgets remain owned by their existing control planes. Private
checkout and push authentication remain #430/#431 work. The master release
switch remains off.
