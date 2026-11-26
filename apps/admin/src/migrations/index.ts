import * as migration_20260515_173042_init_payload_cms from "./20260515_173042_init_payload_cms";
import * as migration_20261022_002409_payload_v4_sizes_to_variants from "./20261022_002409_payload_v4_sizes_to_variants";
import * as migration_20261022_002412_payload_v4_public_beta_metadata from "./20261022_002412_payload_v4_public_beta_metadata";
import * as migration_20261117_040437_payload_v4_beta_9_upload_state from "./20261117_040437_payload_v4_beta_9_upload_state";
import * as migration_20261117_082928_cms_runtime_ledger_read_only from "./20261117_082928_cms_runtime_ledger_read_only";
import * as migration_20261125_120829_clean_baseline from "./20261125_120829_clean_baseline";

export const migrations = [
  {
    up: migration_20260515_173042_init_payload_cms.up,
    down: migration_20260515_173042_init_payload_cms.down,
    name: "20260515_173042_init_payload_cms",
  },
  {
    up: migration_20261022_002409_payload_v4_sizes_to_variants.up,
    down: migration_20261022_002409_payload_v4_sizes_to_variants.down,
    name: "20261022_002409_payload_v4_sizes_to_variants",
  },
  {
    up: migration_20261022_002412_payload_v4_public_beta_metadata.up,
    down: migration_20261022_002412_payload_v4_public_beta_metadata.down,
    name: "20261022_002412_payload_v4_public_beta_metadata",
  },
  {
    up: migration_20261117_040437_payload_v4_beta_9_upload_state.up,
    down: migration_20261117_040437_payload_v4_beta_9_upload_state.down,
    name: "20261117_040437_payload_v4_beta_9_upload_state",
  },
  {
    up: migration_20261117_082928_cms_runtime_ledger_read_only.up,
    down: migration_20261117_082928_cms_runtime_ledger_read_only.down,
    name: "20261117_082928_cms_runtime_ledger_read_only",
  },
  {
    up: migration_20261125_120829_clean_baseline.up,
    down: migration_20261125_120829_clean_baseline.down,
    name: "20261125_120829_clean_baseline",
  },
];
