# Q55 isolated specification-model evidence

2026-10-26. Executed with WSL Python3 standard-library zoneinfo. The script is task evidence, not Core application code. It checks source-local civil-day projection across UTC instants and serial source-command invariants under stated atomic/authority assumptions. It does not execute SQL/RLS/Auth/Storage/browser/provider code or prove concurrent implementation behavior. The two unsafe examples illustrate UTC-date substitution and reschedule-as-review, not deployed defects. No correction command or full release contract is implemented in this model. Its basis increments only on replacement; plan-revision/ABA fences, no-op normalization, changed-intent operation conflicts and current result redaction are not modeled. Replay by key and atomic/current inputs are assumptions, not demonstrated enforcement.

```json
{
  "kind": "specification model, not native implementation proof",
  "civil_time_samples": 26880,
  "source_zones": 8,
  "target_dates": 7,
  "dst_day_lengths_hours": [23, 25],
  "serial_command_orders": 24,
  "unsafe_shortcuts_demonstrated": [
    "UTC-date substitution",
    "reschedule inferred as actual review"
  ],
  "assumptions": [
    "trusted and atomic current authorization/expected-basis boundary",
    "server-authored review time",
    "immutable historical records",
    "no claim about SQL or concurrency implementation"
  ],
  "result": "passed"
}
```

Native acceptance remains the complete P01–P24 suite in the [review](phase29-q55-adversarial-review.md). Script SHA256: `b9f8127274f142ce52d69a119ee2deb96d1b127680ed1c81f5fbe68390ae7b3d`.
