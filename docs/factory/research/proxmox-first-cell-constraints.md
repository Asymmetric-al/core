# Proxmox first-cell constraints: public-safe summary

**Research date:** 2026-08-12

**Wayfinder ticket:** [#1242 — Inventory the actual Proxmox host and Windows-worker constraints privately](https://github.com/Asymmetric-al/core/issues/1242)

**Status:** Read-only inventory and decision support. This report does not authorize host changes, disk initialization, guest creation, license activation, or production dispatch.

## Executive finding

The actual host can support a bounded one- or two-worker engineering pilot after maintenance, backup, recovery, and network-isolation prerequisites are satisfied. It is not currently a ten-worker production cell.

The host has approximately 128 GiB RAM, 16 physical/24 logical hybrid CPU cores, nested-virtualization capability, and multiple visible storage devices. Today, however, its configured VM datastore is thin-provisioned on one physical NVMe device; there is no configured redundancy, backup job, replication, tested UPS shutdown, Windows guest/template, or WSL2 benchmark. A reachable local Raspberry Pi is designated as the off-host backup target, and a UPS is available, but neither has passed its required operational acceptance test.

The installed Proxmox VE 8.2 patch level is maintenance-due. Proxmox publishes August 2026 as the Proxmox VE 8 end-of-life month and recommends using the latest stable version. Proxmox VE 9.2 is the current release as of this inventory. An upgrade is therefore a pre-provisioning maintenance project with its own backup, compatibility review, rollback, and verification—not an incidental setup step. See the [official support-lifecycle statement](https://forum.proxmox.com/threads/proxmox-ve-support-lifecycle.35755/) and [Proxmox VE 9.2 release](https://www.proxmox.com/en/about/company-details/press-releases/proxmox-virtual-environment-9-2).

No host, router, disk, firmware, package, firewall, or guest state was changed during the inventory.

## Verified public-safe constraints

| Area           | Verified state                                                                                                                                                   | Planning consequence                                                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Compute        | 16 physical/24 logical hybrid CPU cores; hardware virtualization and nested KVM available                                                                        | Benchmark CPU placement and role profiles. Capability is not proof of ten concurrent heavy workers.                                                          |
| Memory         | Approximately 128 GiB non-ECC RAM; all slots populated                                                                                                           | Reserve host/service headroom and refuse RAM overcommit for production-like proof. A memory expansion requires a platform change.                            |
| Storage        | One configured system/VM NVMe with LVM-thin; another NVMe and two HDDs are visible but unconfigured; no ZFS, RAID, Ceph, or replication                          | Do not treat unused disks as redundancy or backup. Decide the storage layout only after preserving and investigating existing media signatures.              |
| Drive health   | Point-in-time SMART summaries passed on all visible drives                                                                                                       | Establish recurring monitoring; health status does not replace redundancy or backup.                                                                         |
| Backup         | No Proxmox backup jobs are configured; a reachable local Raspberry Pi is designated as the off-host target, but its storage and restore readiness are unverified | Inventory its storage, configure protected backups, and exercise an off-host restore before unpublished authoritative work depends on this host.             |
| Power/recovery | A UPS is available but not integrated or shutdown-tested; local SSH is the selected management path, and the disconnected JetKVM is not a pilot dependency       | Test UPS runtime/signaling and graceful shutdown. Document physical recovery for powered-off, boot-failed, or network-isolated states that SSH cannot reach. |
| Network        | One active 1 Gb/s host link; management and future guests are not yet separated into dedicated zones; host firewall posture is not production-ready              | Design and test management, service, worker, storage, and backup boundaries before injecting credentials.                                                    |
| Guests         | No VM, container, installation ISO, Windows template, or guest-agent evidence exists                                                                             | Start with one credential-free canary. The planned fleet remains a design, not deployed capacity.                                                            |
| Windows        | The founder attests that Windows 11 Pro is authorized for the intended separate Proxmox worker VMs; no guest or activation evidence exists yet                   | Use Windows 11 Pro for the canary and verify activation without recording keys or account identifiers.                                                       |
| WSL2           | Host nesting is enabled, but there is no Windows/WSL2 guest benchmark                                                                                            | Maintain separate `windows-native` and experimental `windows-wsl2` profiles until measured evidence supports promotion.                                      |

## First-cell admission posture

The safe initial ceiling is one heavy worker at a time. A second active pilot worker may be admitted only after representative measurements preserve at least 15% host CPU/RAM headroom and establish safe thermal, storage-I/O, and thin-pool thresholds. Ten persistent VM identities remain an eventual topology; this inventory provides no basis for ten simultaneous heavy jobs.

Before provisioning the first credential-bearing worker:

1. Record the founder-authorized Windows 11 Pro baseline and verify activation on the canary without committing keys or account identifiers.
2. Inventory the designated Raspberry Pi's storage and protections, configure the backup/checkpoint path, and prove a restore.
3. Integrate the available UPS, test signaling and graceful shutdown, and document physical recovery for failures local SSH cannot reach.
4. Back up the host configuration and complete the controlled Proxmox maintenance/upgrade path.
5. Choose a non-destructive storage layout with redundancy and measurable free-space reserves.
6. Separate management from worker/service traffic and apply deny-by-default east-west controls.
7. Build one credential-free Windows canary from current Proxmox guidance and validate updates, Defender, Secure Boot/vTPM, VirtIO, QEMU Guest Agent, shutdown, rebuild, and restore.
8. Benchmark `windows-native` first; benchmark WSL2 separately with the actual Core toolchain and representative Docker/browser workloads.

## Founder decisions and remaining operational proof

The founder confirmed on 2026-08-12 that Windows 11 Pro is authorized for the intended separate Proxmox worker VMs, the local Raspberry Pi is the backup target, a UPS is available, and JetKVM is not required for the first-cell pilot because local SSH is the selected management path. No license key, account identifier, or private topology was recorded.

Those decisions resolve the ownership ambiguity; they do not make the controls operational. Credential-bearing or unpublished work remains blocked until Windows activation is verified on the canary, the Pi's storage and backup protections are inventoried, an end-to-end restore passes, UPS signaling/graceful shutdown passes, and the physical recovery procedure covers failures SSH cannot reach. The Proxmox enterprise subscription/support lane remains an operational choice rather than a provisioning blocker.

A GitHub Team organization improves repository authority and collaboration, but it does not replace these host acceptance tests.

## Restricted evidence custody

The detailed inventory is restricted to the private `Asymmetric-al/asym-factory` repository:

- path: `inventory/2026-08-12-proxmox-first-cell-inventory.md`
- SHA-256: `658c530f462c72307e2dbd6cf77b34f32828d84e6126a465448de3bdb8baed4b`
- content boundary: no credentials, tokens, license keys, account identifiers, hardware serials, IP addresses, or MAC addresses

The public issue and this report deliberately contain only decision-relevant, public-safe conclusions. Private topology and device-identifying evidence must remain in approved private custody.
