import * as migration_20260515_173042_init_payload_cms from "./20260515_173042_init_payload_cms";
import * as migration_20261022_002409_payload_v4_sizes_to_variants from "./20261022_002409_payload_v4_sizes_to_variants";
import * as migration_20261022_002412_payload_v4_public_beta_metadata from "./20261022_002412_payload_v4_public_beta_metadata";

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
];
