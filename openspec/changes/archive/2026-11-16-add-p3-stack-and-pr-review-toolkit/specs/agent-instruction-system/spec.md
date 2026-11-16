## ADDED Requirements

### Requirement: Vendored Workflow Packs Stay Explicit And Subordinate

The p3-stack and pr-review-toolkit packs SHALL activate only on explicit
invocation in every supported client, except that `p3-help` MAY answer
questions about p3-stack itself. Their instructions MUST remain subordinate to
the current user request, root `AGENTS.md`, nested `AGENTS.md` files, and the
matching rulebooks, and they MUST NOT grant standing authorization for
outward-facing or hard-to-reverse actions.

#### Scenario: A request matches a pack skill's wording without invoking it

- **WHEN** a user request resembles a p3-stack or `review-pr` description but
  does not invoke that skill or name one of its reviewer agents
- **THEN** Claude Code, Cursor, and Codex do not load the skill implicitly
- **AND** Core's existing routes such as `tdd`, `code-review`, and `council`
  keep their triggers

#### Scenario: A p3-stack playbook reaches an outward-facing step

- **WHEN** a p3-stack playbook would open, push, or merge a pull request, post
  a review reply or message, file a ticket, or schedule a recurring job
- **THEN** the agent performs that step only when the user authorized it for
  the task
- **AND** work lands only through a pull request into `develop`, never by a
  direct push to `develop` or `production`

#### Scenario: A p3-stack step names a T3 Code tool in another client

- **WHEN** an agent outside T3 Code reaches a step that names a T3 Code tool
- **THEN** it uses the client equivalent from the Core adapter
- **AND** when no equivalent exists it skips the step and says so

#### Scenario: An upstream skill name collides with a Core skill

- **WHEN** a vendored pack skill shares a name with an existing Core skill
- **THEN** the pack skill is vendored under a distinct name
- **AND** the existing Core skill keeps its name, route, and authority

#### Scenario: A user runs the pr-review-toolkit review

- **WHEN** the user invokes `review-pr`
- **THEN** every reviewer except an authorized `code-simplifier` stays
  read-only
- **AND** findings carry Core severities and `file:line` evidence
- **AND** nothing is posted to the pull request unless the user asks
