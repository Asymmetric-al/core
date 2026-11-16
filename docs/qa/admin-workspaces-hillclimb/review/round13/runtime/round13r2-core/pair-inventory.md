# Exact catalogue pair inventory

This offline view does not promote provisional or wrong-state captures. All paths and hashes are retained in `pair-inventory.json`, `invocation-inventory.json`, and `evidence-hashes.json`.

| Exact key                               | Raw capture artifacts | Capture completed | Check completed | Both | Intended setup | Gap / semantic limitation                    |
| --------------------------------------- | --------------------- | ----------------- | --------------- | ---- | -------------- | -------------------------------------------- |
| `crm-records--desktop`                  | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-records--intermediate`             | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-records--small-tablet`             | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-records--mobile`                   | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-kanban--desktop`                   | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-kanban--mobile`                    | yes                   | yes               | no              | no   | no             | Missing check                                |
| `crm-drawer--desktop`                   | yes                   | yes               | no              | no   | no             | Missing check                                |
| `crm-drawer--mobile`                    | yes                   | yes               | no              | no   | no             | Missing check                                |
| `crm-drawer-properties--desktop`        | yes                   | yes               | no              | no   | no             | Missing check                                |
| `crm-notes--desktop`                    | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-notes--intermediate`               | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-notes--small-tablet`               | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-notes--mobile`                     | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-relationships--desktop`            | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-relationships--intermediate`       | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-relationships--small-tablet`       | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-relationships--mobile`             | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-empty--desktop`                    | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-empty--mobile`                     | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-error--desktop`                    | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-error--mobile`                     | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-notes-empty--desktop`              | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-notes-empty--mobile`               | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-row-menu--desktop`                 | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-view-options--desktop`             | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-search--desktop`                   | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-search--mobile`                    | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-drawer-gifts--desktop`             | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-drawer-gifts--mobile`              | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-gift-views-menu--desktop`          | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-note-detail--desktop`              | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-note-detail--mobile`               | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-relationships-more--desktop`       | yes                   | no                | yes             | no   | no             | Provisional capture: missing completion line |
| `crm-relationships-more--mobile`        | no                    | no                | yes             | no   | no             | No capture artifacts                         |
| `crm-gift-row-menu--desktop`            | yes                   | yes               | yes             | yes  | no             | [object Object]; [object Object]             |
| `crm-resend-receipt--desktop`           | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-resend-receipt--mobile`            | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-relationship-detail--desktop`      | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-relationship-detail--mobile`       | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-note-long--desktop`                | yes                   | yes               | yes             | yes  | yes            |                                              |
| `crm-note-long--mobile`                 | yes                   | yes               | yes             | yes  | yes            |                                              |
| `contributions--desktop`                | yes                   | yes               | yes             | yes  | yes            |                                              |
| `contributions--intermediate`           | yes                   | yes               | yes             | yes  | yes            |                                              |
| `contributions--small-tablet`           | yes                   | yes               | yes             | yes  | yes            |                                              |
| `contributions--mobile`                 | yes                   | yes               | yes             | yes  | yes            |                                              |
| `contribution-sheet--desktop`           | yes                   | yes               | yes             | yes  | yes            |                                              |
| `contribution-sheet--mobile`            | yes                   | yes               | yes             | yes  | yes            |                                              |
| `contribution-refund--desktop`          | yes                   | yes               | yes             | yes  | yes            |                                              |
| `contribution-refund--mobile`           | yes                   | yes               | yes             | yes  | yes            |                                              |
| `contribution-correction--desktop`      | yes                   | yes               | yes             | yes  | yes            |                                              |
| `contribution-correction--mobile`       | yes                   | yes               | yes             | yes  | yes            |                                              |
| `contributions-empty--desktop`          | yes                   | yes               | yes             | yes  | yes            |                                              |
| `contributions-empty--mobile`           | yes                   | yes               | yes             | yes  | yes            |                                              |
| `contributions-error--desktop`          | yes                   | yes               | yes             | yes  | yes            |                                              |
| `contributions-error--mobile`           | yes                   | yes               | yes             | yes  | yes            |                                              |
| `contributions-row-menu--desktop`       | yes                   | yes               | yes             | yes  | yes            |                                              |
| `contributions-selection--desktop`      | yes                   | yes               | yes             | yes  | yes            |                                              |
| `contributions-selection--mobile`       | yes                   | yes               | yes             | yes  | yes            |                                              |
| `contributions-send-receipts--desktop`  | yes                   | yes               | yes             | yes  | yes            |                                              |
| `contributions-cards--desktop`          | yes                   | yes               | yes             | yes  | yes            |                                              |
| `contributions-cards--intermediate`     | yes                   | yes               | yes             | yes  | yes            |                                              |
| `contributions-filter--desktop`         | yes                   | yes               | yes             | yes  | yes            |                                              |
| `contribution-fund-correction--desktop` | yes                   | yes               | yes             | yes  | no             | [object Object]; [object Object]             |
| `contribution-fund-correction--mobile`  | yes                   | yes               | yes             | yes  | no             | [object Object]; [object Object]             |
| `contribution-send-receipt--desktop`    | yes                   | yes               | yes             | yes  | yes            |                                              |
