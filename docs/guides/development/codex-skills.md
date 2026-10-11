# Codex skill installation and environment verification

Core owns canonical skills in `docs/ai/skills/`. The repository publishes their
runtime mirrors through `bun run skills:sync`; `bun run skills:verify` checks
them without mutation. Keep the nearest `AGENTS.md` and Core rulebooks above
optional provider skills.

## Repository and personal discovery

For supported local Codex clients, repository skills are discovered from
`.agents/skills/`, and personal skills from `~/.agents/skills/`. Install complete
skill directories, including their companion assets and references. A directory
copy is a snapshot: it does not update when GitHub changes.

The client must attach the correct project or environment before those files
can appear in its catalog. Codex Cloud, ChatGPT Work Cloud, connected remote
computers, and local desktop projects have different configuration paths.
Follow the supported controls for the actual surface; do not treat local CLI
discovery as proof that another application's picker has registered the skills.
See the [registration research](cloud-skill-picker-registration.md) for current
primary sources and the observed managed-cloud failure.

## Refresh the reviewed Emil pack

The public Emil pack uses Core's `emil-prototype` alias to avoid overwriting
Matt Pocock's `prototype`. Core's `find-animation-opportunities` remains a
separate curated adapter. `animation-performance` and `break-ui` are included
in the reviewed pack; `break-ui` requires explicit invocation in Core.

Use a reviewed checkout of `emilkowalski/skills`, record its commit, then supply
its `skills` directory to the focused updater:

```sh
git clone https://github.com/emilkowalski/skills ../emil-skills-reviewed
git -C ../emil-skills-reviewed rev-parse HEAD
bun run skills:refresh-emilkowalski -- --emil-source-root=../emil-skills-reviewed/skills
bun run skills:sync
bun run skills:verify
```

The updater preserves Core overlays and raw upstream hashes. Review the pack
inventory, upstream changes, license, source commit, and generated mirrors
before committing. Record the reviewed commit in each affected skill's
`references/upstream.md`. Without the explicit source argument, the existing
repository-installed source workflow remains available. Do not use a blind
pack install that overwrites Core aliases or adapters.

## Managed environment setup

A reusable environment needs a self-contained installation script and the
supported startup instruction saved in its owning application. An installation
command referring to a file that exists only in a running task cannot recreate
that file after replacement. In Codex Cloud, the documented fields are
**Install script** and **Start skill**; publish the prepared environment through
its supported editor. Existing tasks retain their own state. These Codex Cloud
instructions do not establish the corresponding Work Cloud controls.

For an environment that continuously tracks GitHub, its approved updater must:

- Refresh the intended Core branch and subtree and the intended Emil source.
- Retain the last validated snapshot when downloads fail.
- Refresh instructions and skill metadata before work and on its configured
  interval while the environment runs.
- Preserve user configuration, explicit-only invocation policies, aliases,
  licenses, and companion assets.
- Restart through saved startup rather than relying on a surviving process.

Installing a filesystem updater does not register the application's skill
directory. Use the actual app or environment's supported directory selection.
If no registration control is available to an agent, report that limitation;
do not add an unsupported TOML key or claim the picker passed.

## Instruction loading

Keep Core's root `AGENTS.md` as the repository router. Put client-specific setup
in scoped guidance rather than embedding a cloud runbook or the full skill
catalog in root. If an environment installs shared instructions globally, scope
Core product paths and rules to its Core checkout and preserve personal
instructions. Existing chats must reread refreshed instructions; their original
prompt does not change when a file is updated.

## Acceptance

These checks prove different outcomes:

| Check                 | Required evidence                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------- |
| Canonical publication | Reviewed sources, upstream hashes, complete assets, and clean mirror verification.           |
| Installed files       | The intended skill directories can be read by the environment's scanner.                     |
| App registration      | The actual app-facing catalog contains every expected managed skill name.                    |
| Invocation            | The picker selects a known skill and the app supplies its instructions.                      |
| Rebuild persistence   | A fresh environment from the saved platform setup repeats the catalog and invocation checks. |
| Updates               | A subsequent source refresh reaches the intended installed files and the app-facing catalog. |

An empty app catalog fails acceptance even when file scans and repository tests
pass. A restart, unchanged configuration version, generated setup file, or
successful isolated scanner does not establish reusable setup or picker success.

## Primary documentation

- [Build skills](https://learn.chatgpt.com/docs/build-skills)
- [Projects and chats](https://learn.chatgpt.com/docs/projects)
- [Cloud environments](https://learn.chatgpt.com/docs/environments/cloud-environments)
- [Remote connections](https://learn.chatgpt.com/docs/remote-connections)
