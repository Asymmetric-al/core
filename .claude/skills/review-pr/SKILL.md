---
name: review-pr
description: Use only when the user explicitly invokes review-pr (Anthropic pr-review-toolkit) for a multi-agent review of a pull request or local diff by aspect - comments, tests, errors, types, code, simplify, or all.
disable-model-invocation: true
argument-hint: "[review-aspects]"
---

# Comprehensive PR Review

Run a comprehensive pull request review using multiple specialized agents, each focusing on a different aspect of code quality.

**Review Aspects (optional):** "$ARGUMENTS"

## Review Workflow:

1. **Determine Review Scope**
   - Check git status to identify changed files
   - Parse arguments to see if user requested specific review aspects
   - Default: Run all applicable reviews

2. **Available Review Aspects:**

   - **comments** - Analyze code comment accuracy and maintainability
   - **tests** - Review test coverage quality and completeness
   - **errors** - Check error handling for silent failures
   - **types** - Analyze type design and invariants (if new types added)
   - **code** - General code review for project guidelines
   - **simplify** - Simplify code for clarity and maintainability
   - **all** - Run all applicable reviews (default)

3. **Identify Changed Files**
   - Run `git diff --name-only` to see modified files
   - Check if PR already exists: `gh pr view`
   - Identify file types and what reviews apply

4. **Determine Applicable Reviews**

   Based on changes:
   - **Always applicable**: code-reviewer (general quality)
   - **If test files changed**: pr-test-analyzer
   - **If comments/docs added**: comment-analyzer
   - **If error handling changed**: silent-failure-hunter
   - **If types added/modified**: type-design-analyzer
   - **After passing review**: code-simplifier (polish and refine)

5. **Launch Review Agents**

   **Sequential approach** (one at a time):
   - Easier to understand and act on
   - Each report is complete before next
   - Good for interactive review

   **Parallel approach** (user can request):
   - Launch all agents simultaneously
   - Faster for comprehensive review
   - Results come back together

6. **Aggregate Results**

   After agents complete, summarize:
   - **Critical Issues** (must fix before merge)
   - **Important Issues** (should fix)
   - **Suggestions** (nice to have)
   - **Positive Observations** (what's good)

7. **Provide Action Plan**

   Organize findings:

   ```markdown
   # PR Review Summary

   ## Critical Issues (X found)

   - [agent-name]: Issue description [file:line]

   ## Important Issues (X found)

   - [agent-name]: Issue description [file:line]

   ## Suggestions (X found)

   - [agent-name]: Suggestion [file:line]

   ## Strengths

   - What's well-done in this PR

   ## Recommended Action

   1. Fix critical issues first
   2. Address important issues
   3. Consider suggestions
   4. Re-run review after fixes
   ```

## Usage Examples:

**Full review (default):**

```
/pr-review-toolkit:review-pr
```

**Specific aspects:**

```
/pr-review-toolkit:review-pr tests errors
# Reviews only test coverage and error handling

/pr-review-toolkit:review-pr comments
# Reviews only code comments

/pr-review-toolkit:review-pr simplify
# Simplifies code after passing review
```

**Parallel review:**

```
/pr-review-toolkit:review-pr all parallel
# Launches all agents in parallel
```

## Agent Descriptions:

**comment-analyzer**:

- Verifies comment accuracy vs code
- Identifies comment rot
- Checks documentation completeness

**pr-test-analyzer**:

- Reviews behavioral test coverage
- Identifies critical gaps
- Evaluates test quality

**silent-failure-hunter**:

- Finds silent failures
- Reviews catch blocks
- Checks error logging

**type-design-analyzer**:

- Analyzes type encapsulation
- Reviews invariant expression
- Rates type design quality

**code-reviewer**:

- Checks CLAUDE.md compliance
- Detects bugs and issues
- Reviews general code quality

**code-simplifier**:

- Simplifies complex code
- Improves clarity and readability
- Applies project standards
- Preserves functionality

## Tips:

- **Run early**: Before creating PR, not after
- **Focus on changes**: Agents analyze git diff by default
- **Address critical first**: Fix high-priority issues before lower priority
- **Re-run after fixes**: Verify issues are resolved
- **Use specific reviews**: Target specific aspects when you know the concern

## Workflow Integration:

**Before committing:**

```
1. Write code
2. Run: /pr-review-toolkit:review-pr code errors
3. Fix any critical issues
4. Commit
```

**Before creating PR:**

```
1. Stage all changes
2. Run: /pr-review-toolkit:review-pr all
3. Address all critical and important issues
4. Run specific reviews again to verify
5. Create PR
```

**After PR feedback:**

```
1. Make requested changes
2. Run targeted reviews based on feedback
3. Verify issues are resolved
4. Push updates
```

## Notes:

- Agents run autonomously and return detailed reports
- Each agent focuses on its specialty for deep analysis
- Results are actionable with specific file:line references
- Agents use appropriate models for their complexity
- All agents available in `/agents` list

<!-- CORE-OVERLAY-START -->

## This repository (Asymmetric-al/core)

Adapted from Anthropic's [pr-review-toolkit](https://github.com/anthropics/claude-plugins-official/tree/0412be76f50ab4f4f8abff3753efa9269fbbca5b/plugins/pr-review-toolkit) plugin (Apache-2.0). Modified by Asymmetric-al/core: the plugin's `/review-pr` command became this skill (new frontmatter, no `allowed-tools`), and this overlay was added. The workflow above is otherwise the upstream command text with Prettier formatting. Provenance is in `references/upstream.md`, and `LICENSE` is the upstream Apache-2.0 text.

On conflict, the current user request, root `AGENTS.md`, the nearest nested `AGENTS.md`, and the matching `docs/ai/rules/*` rulebook win over this skill.

### Triggers

- The user invokes `/review-pr` (Claude Code, Cursor, T3 Code) or `$review-pr` (Codex), optionally with aspects such as `tests errors` or `all parallel`. The upstream examples spell it `/pr-review-toolkit:review-pr`.
- A request that names one of the six reviewer agents. Other review requests keep their usual routes, such as `code-review`, `council`, or `review-and-ship`.

### Workflow

1. **Scope.** Use the PR or files the user named (`gh pr diff <number>`). Otherwise review the current branch against `origin/develop` plus staged, unstaged, and untracked changes (`git status --porcelain` lists untracked files; read them in full), not only `git diff`.
2. **Reviewers.** The six reviewer prompts are in `references/agents/`. Dispatch them by client:
   - Claude Code and Cursor: the project subagents `pr-code-reviewer` (upstream `code-reviewer`, renamed because Cursor already registers a different `code-reviewer`), `code-simplifier`, `comment-analyzer`, `pr-test-analyzer`, `silent-failure-hunter`, and `type-design-analyzer`, published from `.cursor/agents/` to `.claude/agents/`.
   - Codex: a subagent per reviewer whose brief is that reviewer's prompt, the scope, and this overlay, when the session has subagent tools. Otherwise run each reviewer yourself, one at a time.
   - T3 Code: one `delegate_task` per reviewer with the same self-contained brief.
3. **Applicable reviewers.** Run `pr-test-analyzer` whenever the change alters behavior, even when no test file changed, because missing coverage is itself a finding under Core's TDD rule.
4. **Read-only reviewers.** Every reviewer except `code-simplifier` only reports. Run `code-simplifier` only when the user asked for the `simplify` aspect and authorized edits. Never run it beside another writer. After it edits, run the checks for the touched packages and report what changed.
5. **Project rules.** Where a reviewer prompt says `CLAUDE.md`, read root `AGENTS.md` (`CLAUDE.md` imports it), the nearest nested `AGENTS.md`, and the matching rulebooks under `docs/ai/rules/`. Tests follow `docs/ai/rules/testing.md` and Core's TDD rule. Types follow `docs/ai/rules/typescript-future-proofing.md`.
6. **Upstream-only conventions.** `silent-failure-hunter` names `logForDebugging`, `logError`, `logEvent`, and `constants/errorIds.ts`. They come from the upstream project and do not exist in Core. Judge error handling against the touched package's existing logging and Sentry use and Core's product-safety invariants. `code-simplifier` lists example standards (the `function` keyword, explicit return types, avoiding `try`/`catch`). Apply Core's ESLint, Prettier, and rulebook conventions instead of that list.
7. **Severity.** Classify every finding with the rubric in `docs/ai/rules/review-bots.md` by its actual impact. Treat the reviewers' own labels and scores (Critical, Important, 1-10 ratings, confidence) as inputs, not as the P-level. P0 is only for data loss, a security, auth, or permission bypass, a payment or webhook error, a migration hazard, a crash, or a broken core flow. A misleading comment or a broad `catch` is P1 or P2 unless its impact meets that bar. Every behavior finding needs `file:line` evidence.
8. **Output.** Report locally. Post PR comments or reviews only when the user asks. Never put secrets, `.env` values, or tokens in a reviewer brief.

### Checklist

- [ ] Scope covers the branch against `origin/develop` or the named PR
- [ ] Reviewers stayed read-only, except an authorized `code-simplifier` run
- [ ] Findings carry a Core P-level judged by impact and `file:line` evidence
- [ ] Nothing was posted, pushed, or committed without the user's request

Edit this canonical copy in `docs/ai/skills/review-pr/`, then run `bun run skills:sync` and `bun run skills:verify`. Edit the native subagents in `.cursor/agents/`, never in `.claude/agents/`.

<!-- CORE-OVERLAY-END -->
