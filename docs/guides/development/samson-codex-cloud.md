# Samson six-agent Codex Cloud workflow

Use the private personal-subscription Codex Cloud environment for
`Asymmetric-al/core`. Start one issue run with `$samson-factory` and the exact
GitHub issue URL. All normal PRs target `develop`.

## Setup

The tested source lives in the AL-1923 setup branch until its PR is accepted.
Configure the cloud environment from that reviewed source. Use the Bun pin in
`package.json`, then run:

```sh
node scripts/factory/setup-cloud.mjs
```

The install script uses the frozen lockfile and installs no model API key or
production credentials. Cloud setup may use the existing documented
credential-free Mission Control sandbox to prove app readiness. Its placeholders
and demo-auth bypass are development-only and do not establish live Supabase,
tenant, migration or money correctness. Those claims need separately authorized
production-shaped disposable evidence.

Publish a private evaluation template when a fresh workspace is needed for
capability testing. Keep product issue processing on hold until the setup report
and required capability verification are complete. A cloud environment is a
reusable filesystem/tool template; each task
starts an isolated workspace. It is not a permanently running queue controller.
All six roles consume the same personal account's usage allowance.

## Agents

| Role    | Model         | Reasoning | Default source access                                |
| ------- | ------------- | --------- | ---------------------------------------------------- |
| Samson  | `gpt-6.1-sol` | high      | read-only; coordination and fresh final ratification |
| Ezra    | `gpt-6.1-sol` | high      | write approved acceptance tests only                 |
| Bezalel | `gpt-6.1-sol` | medium    | sole production/Builder-test writer                  |
| Micaiah | `gpt-6.1-sol` | high      | read-only contract/quality review                    |
| Luke    | `gpt-6.1-sol` | high      | read-only systems/failure review                     |
| Agabus  | `gpt-6.1-sol` | high      | read-only evidence adjudication                      |

Definitions are under `.codex/agents/`; the existing MCP configuration remains
in `.codex/config.toml`. Official OpenAI documentation establishes custom agent
configuration for local clients. Do not assume a cloud runtime honors its model,
permissions or named-agent settings until it demonstrates them. If it cannot,
return the missing capability and use separately isolated cloud stage tasks only
with the required verified handoffs; never silently act out six personas in one
conversation. No credentials should be copied from a local Codex installation.

## Issue through merge

Samson selects one eligible issue and seals approved intent. Ezra establishes
independent oracles and protected proof. Bezalel builds with vertical TDD.
Micaiah and Luke independently review the same frozen SHA. Agabus accepts,
rejects or routes every material claim and authorizes bounded repairs. A repair
creates a new head and repeats both reviews. A fresh read-only Samson ratifies
the final artifact. The detailed [protocol](../../ai/skills/samson-factory/references/protocol.md)
defines exact artifact digests and the guard.

Open a draft PR referencing the issue, complete `bun run ci:preflight`, converge
live GitHub checks and feedback, and obtain Blake's merge authority. Preserve
branch protection and its current required check sources. Verify the exact
merged commit on `develop` and close only the delivered issue. This workflow
does not publish to `production` or deploy an application.

Samson's contract authorship reduces final-judge independence; protected or
contested tickets require a separate Samuel or human ratifier. Shell read-only
sandboxing does not, by itself, restrict every connector effect or hide shared
files. Effective permissions and disclosure must be verified in the chosen
runtime.

## Official sources

- [Codex Cloud environments](https://learn.chatgpt.com/docs/environments/cloud-environments)
- [Custom agents and subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [Subscription versus API authentication](https://learn.chatgpt.com/docs/auth)
- [GPT-6.1 Sol model specification](https://developers.openai.com/api/docs/models/gpt-6.1-sol)
