## 1. Reconcile And Preserve

- [x] Read governing owner specification and private bootstrap details.
- [x] Verify actual VM 100, guest address, admin identity and storage allocation.
- [x] Preserve/disable confirmed legacy synthetic dispatcher without abandon.
- [x] Expand guest root filesystem after a recoverable VM checkpoint.
- [x] Capture coherent engine/config/artifact/Git/dirty-work backup off-host.
- [x] Verify isolated restoration including a synthetic unpushed candidate.
- [x] Complete VM 101 offline unfinished-work and dispatcher inventory.

## 2. Qualify Native Runtime

- [x] Verify engine/provider/forge hashes against official pinned release.
- [x] Observe native updater control, absolute binary and admin login status.
- [x] Prove existing native quota wait survives a controlled VM reboot.
- [x] Prove same-profile native model success from actual service environment.
      Preserved smoke run completed at 17:40:09Z on 10 November; this does not
      qualify the eventual production pack or specialist model bindings.
- [ ] Verify effective auth/config precedence, child/resume and helper bindings.
      Done so far: service env has no API/token override; all tiers, chat and
      title generation bind the installed Claude provider; roles use
      `settingSources: ["project"]` from the trusted control folder.
- [ ] Install one reviewed reproducible production pack/service environment.
      Installed by `installation/install.mjs` (pinned hashes, root-owned control
      folder, signed server-owned starts); release `6f68e56b` runs on VM 100.
      Independent review of the final source is still pending.

## 3. Deliver Complete Workflow

- [x] Implement/test deterministic eligibility and Samson frontier validation.
- [x] Adapt six source roles with provenance and actual consumed-asset evidence.
      `pack/.shared/roles/*.md` → generated commands (`build-pack.mjs --check`),
      hashes in `roles/manifest.json`; installed pack is the consumed source.
- [x] Implement native assignment/reservation/lease/slot separation.
      `workitem.mjs` + trigger resources. Two issues were admitted together on
      12 November; their delivery runs are serialized on one resource.
- [x] Qualify actual role views, peer isolation, policy and candidate boundaries.
      Live probes and the real rounds of #2233/#2234 (separate read-only views,
      guard log, executor without profile or network).
- [x] Implement disposable local checker and real cancellation cleanup.
      Plus `core-check` MCP tool; executor now matches hosted runners (`--init`,
      executable `/tmp`).
- [x] Run current local gates/hooks and publish the actual post-hook candidate.
      PR #2648 and PR #2649, 12 November.
- [x] Converge external feedback, fresh GitHub readiness and protected delivery.
      #2233 merged through the protected branch rules after a review thread was
      repaired.
- [ ] Prove controls, waits, unknown-effect reconciliation and bounded retries.
      Controls (pause, stop, retry, reopen, adopt-policy) and a quota wait are
      proven live. Unknown-effect reconciliation and native-fault holds are not.
- [x] Complete one then two actual authorized issue flows.
      #2233 MERGED, #2234 PR_READY.

## 4. Console And Commissioning

- [x] Prove actual workflow operation in Archon's native Console.
- [x] Implement full thin Maia Console using configured component workflows.
      Release 6 serves the live engine on VM 100.
- [ ] Verify real chat/controls, histories, timers, evidence and availability.
      Histories and evidence render from the live engine. Controls were
      exercised live through the command, not the Console; chat is not verified.
- [ ] Verify bounded assessments and their non-blocking failure behavior.
- [ ] Verify responsive/a11y/error/stale/disconnected/loading states live.
      Nine tabs at three viewport sizes passed live with no serious
      accessibility finding; disconnected and error states only on fixtures.
- [ ] Independently review implementation, fix accepted findings and deliver it.
- [ ] Complete all 23 acceptance rows and finite useful observation window.
- [x] Record working access/runbooks/current mode and exact residual blockers.
      Runbook and commissioning record, 12 November.

## Storage (11 November 2026)

- [x] Host SSD dropped off the bus under load. Root cause: USB 3 JMicron JMS578
      bridge in UAS mode, not SATA. Recovered by a remote power cycle; mitigated
      with `usb-storage.quirks=152d:0578:u`; full preflight load test clean.
      A person should later move the SSD to an onboard SATA port (not blocking).

## Independent review (11 November 2026)

- [x] Six-dimension review with adversarial verification: 70 findings
      (58 confirmed, 10 plausible, 2 refuted), including 4 P0 boundary escapes.
- [ ] Repair wave 1 (boundary, lifecycle, flow, readiness, ops, Console),
      test-first, independently verified; redeploy and requalify live.
      Repairs are installed and were requalified live on 12 November, together
      with eleven further defects found on the live system. Independent review
      of the final integrated source remains pending.
- [ ] Wave 2: typed native faults, identity drift, disk pressure, incident
      analysis triggers, remaining matrix gaps.
      Implemented with unit proof; only the disk-space guard is proven live.
