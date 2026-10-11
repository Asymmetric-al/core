# Managed cloud skill picker registration

Research date: 2026-10-11. See [installation and refresh guidance](codex-skills.md).

## Finding

The managed filesystem installation is working, but the running conversation's
executor skill registry is empty. A filesystem installer cannot certify or
repair the separate host-owned selection of capability roots. The public
documentation reviewed below does not document a local manifest, TOML field,
or ChatGPT Work environment editor procedure that supplies that selection.
The current tools expose environment status and skill listing, but no supported
environment capability-root write operation.

This is a bounded finding about the reviewed documentation and available tools,
not a claim that the product has no internal registration mechanism. The native
protocol explicitly contains that mechanism: the environment owner/platform
supplies selected roots. [SelectedCapabilityRoot source][selected-roots]
[EnvironmentReadyInfo source][ready-info]

## Runtime observations

These are diagnostics from this conversation, not claims made by the public docs:

| Check                                                               | Observed result                                    | What it establishes                                                    |
| ------------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------- |
| Managed Core and Emil installations                                 | 133 Core plus 15 Emil skills; successful refresh   | Source files are installed and maintained.                             |
| Isolated native scanner with the installed root explicitly selected | 148 managed skills discovered                      | That directory is readable and has valid discoverable skills.          |
| Actual `skills.list` with executor authority, rechecked 2026-10-11  | `skills: []`, no warnings                          | The running conversation has no registered executor skill inventory.   |
| Actual environment status reported during this investigation        | Empty capabilities; saved source version unchanged | No successful application of a skill-root selection has been observed. |

The scanner process used for diagnostics was separate from the app's running
executor. Its result is not a picker pass. Completion requires a nonempty actual
executor catalog and successful picker selection in the user's app.

## What owns registration

OpenAI's public Codex source defines a selected root as platform-supplied data,
including a stable ID, environment ID, and absolute root path. It filters the
supplied roots for the selected environment; merely creating a directory does
not add an entry to that list. [SelectedCapabilityRoot source][selected-roots]

The executor stores the most recent accepted Ready report from the environment
owner. Its `selected_capability_roots()` method returns the roots from that
report, or an empty list when none was reported. [Ready report source][ready-report]

The installed runtime protocol investigation additionally established that
Thread-origin discovery reads the environment's accepted Ready report, while
Owner-origin discovery uses the roots supplied in the attachment configuration.
An isolated V1 test discovers 148 skills when given the managed directory and
zero when given no roots. These are installed-runtime findings; the public
source links in this note are pinned to a newer upstream source revision and
must not be treated as permission to send newer RPCs to the running app.

The public `environments.toml` schema declares connection fields and scoped
skill requirements, but no selected-root field. `ScopedSkillsConfig` contains
required skill names. Local `skills.config` contains path/name selectors and
enabled flags, which control existing skills rather than register an execution
environment root. [Environment TOML source][environment-toml]
[Skill configuration source][skill-config]

## Product boundaries

| Surface                                                 | Documented mechanism                                                                                                                                                                                                                                | Relevance to this conversation                                                                                                                                   |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local Codex and covered desktop filesystem capabilities | Load repository `.agents/skills`, user `~/.agents/skills`, and administrator `/etc/codex/skills`; symlinked folders are supported. `agents/openai.yaml` supplies presentation, invocation policy, and dependencies. [Build skills][build-skills]    | Establishes local installation conventions, not Work cloud owner selection.                                                                                      |
| Local desktop projects                                  | The primary project folder controls automatic discovery of instructions, skills, and configuration. [Projects and chats][projects]                                                                                                                  | A local project's selected folder is not evidence that the current managed cloud attachment has a selected skill root.                                           |
| Connected remote computer                               | Skills and other tools come from the connected host configuration. [Remote connections][remote]                                                                                                                                                     | Applies to a connected host, not a local CLI process launched inside an unrelated worker.                                                                        |
| Codex Cloud environments                                | Save configuration, publish or republish the prepared filesystem, then start a new task; existing tasks keep their state. Repository skills are available, while local personal skills are not synced. [Cloud environments][cloud-environments]     | Use this workflow only after confirming the selected environment is a Codex Cloud environment. It is not documented as a Work Cloud root-registration procedure. |
| ChatGPT Work Cloud                                      | OpenAI manages hosted execution. Work cloud containers use their own execution configuration; local configuration does not automatically carry over. [Work Cloud security][work-cloud]                                                              | The reviewed Work docs do not identify a skill-root editor or supported profile-reattachment procedure.                                                          |
| ChatGPT workspace skills and plugins                    | Their installation and lifecycle are separate from filesystem skills. A supported workspace skill upload exists under Plugins → Skills → Create → Upload from your computer. [Skill controls][skill-controls] [Skills in ChatGPT][workspace-skills] | Uploading or installing a plugin can provide a separate catalog entry; it does not register or keep the existing GitHub-backed directory synchronized.           |
| Agents API                                              | Session creation accepts `environment.capability_directories` for existing sandbox directories. [API skills][api-skills]                                                                                                                            | This is an Agents API request, not a documented ChatGPT environment-setting file or an API for editing this chat's attachment.                                   |

## Minimum necessary host action

The owning app/environment coordinator must select the installed managed skill
directory for the actual environment attached to this conversation. The
installed protocol's selection object has this shape:

```json
{
  "id": "managed-global-skills",
  "location": {
    "type": "environment",
    "environmentId": "<actual selected environment ID>",
    "path": "/home/agent/.agents/skills"
  }
}
```

This illustrates the missing host data. It is not a supported local config
snippet or a command to send to a private service. A supported host control
must persist the selection in the relevant environment/attachment profile and
apply it through the owner's Ready report or the attachment's selected roots.
No such writable control is exposed to the current assistant tools, and the
reviewed public Work documentation does not establish its UI label. If the
app's saved directory setting is intended to perform that operation, the empty
live catalog is evidence that the setting has not reached this attachment;
the owning product must expose or repair that application step.

After the owner applies the selection, verify the actual executor catalog
contains every expected managed name from the current source status, verify the picker can select a known
name such as `to-spec`, and verify a subsequent source refresh remains visible.
A restart, new task, or successful standalone scanner is insufficient evidence
on its own. Repository changes can preserve installation and updates, but do
not independently establish host selection.

## Sources and limits

Public docs were retrieved on 2026-10-11. The public source references below are
pinned to `openai/codex` commit
`72f999edc7848961b99c4b98bf1e62d12fa35798`. Nia was unavailable in the callable
tools, so research used the repositories and official primary documentation.
This research used read-only live
catalog inspection and primary-source retrieval; it did not write app
configuration, send private RPCs, create conversations, or run model turns.
Repository follow-up: [AL-2062](https://github.com/Asymmetric-al/core/issues/2062).

[selected-roots]: https://github.com/openai/codex/blob/72f999edc7848961b99c4b98bf1e62d12fa35798/codex-rs/protocol/src/capabilities.rs#L9
[ready-info]: https://github.com/openai/codex/blob/72f999edc7848961b99c4b98bf1e62d12fa35798/codex-rs/exec-server/src/environment.rs#L109
[ready-report]: https://github.com/openai/codex/blob/72f999edc7848961b99c4b98bf1e62d12fa35798/codex-rs/exec-server/src/environment.rs#L899
[environment-toml]: https://github.com/openai/codex/blob/72f999edc7848961b99c4b98bf1e62d12fa35798/codex-rs/exec-server/src/environment_toml.rs#L29
[skill-config]: https://github.com/openai/codex/blob/72f999edc7848961b99c4b98bf1e62d12fa35798/codex-rs/config/src/skills_config.rs#L20
[build-skills]: https://learn.chatgpt.com/docs/build-skills
[projects]: https://learn.chatgpt.com/docs/projects
[remote]: https://learn.chatgpt.com/docs/remote-connections
[cloud-environments]: https://learn.chatgpt.com/docs/environments/cloud-environments
[work-cloud]: https://learn.chatgpt.com/docs/enterprise/chatgpt-work-cloud-security
[skill-controls]: https://learn.chatgpt.com/docs/enterprise/skills
[workspace-skills]: https://help.openai.com/en/articles/20001066-skills-in-chatgpt
[api-skills]: https://developers.openai.com/api/docs/guides/tools-skills
