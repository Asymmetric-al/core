# Connected browser verification, November 12, 2026

These four captures illustrate the scoped checks documented in the [parent QA record](../README.md#current-verification-november-12-2026). They came from the dirty local development tree based on commit `c17f2f0201d68dc1edf0096c0f7ff3ebdc2fbe37`, not an immutable production build or the published PR head. The settings follow-up was captured on November 12 in Bangkok (November 11 UTC).

- settings-reload-controls.png: settings settled after a reload.
- donor-profile-retained-back-forward.png: an unsaved donor edit survived history navigation.
- missionary-composer-retained-back-forward.png: a new unsaved composer survived history navigation.
- missionary-profile-reverted-narrow.png: the missionary profile was restored to its starting value at 390px.

All drafts were reverted without save or publication. The browser harness permitted Demo Access authentication and blocked other unsafe requests. No payment, profile save, post publication or upload was performed. Both isolated browsers were closed. These captures do not establish production performance, screen-reader results or a new visual-council score.
