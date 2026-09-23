> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Question 11 — Executed proof and limits

7 September 2026. Research only; no real mail or live-provider action. All credentials/accounts were synthetic, kept out of recorded results. Source head: 7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd.

## Provider protocol observations

GoTrue v2.188.1 / sha256:87db8c737af49a64236c461882ed3925f8b1e5c2c47176c64694dedc65153573; PostgreSQL 17.10. Containers shared a networkless namespace, published no ports, and sent only to a signed local hook sink. All were removed. These results do not certify Asym integration or hosted configuration.

- **A01** — PUT email returns 200 with old current email and pending new_email; request acceptance is not completion.
- **A02** — Signed hook payload current-address proof is token_hash_new and new-address proof is token_hash, matching actual provider pending columns; no outbound message sent.
- **A03** — A direct GET verification link consumes the first inbox proof under secure/autoconfirm=false configuration; email remains old. Recorded result: `{"httpStatus":303,"providerConfirmStatus":1}`.
- **A04** — Replaying that consumed proof is rejected; it does not substitute for the second inbox proof. Recorded result: `{"httpStatus":403}`.
- **A05** — Second distinct inbox proof completes current-email change; immutable Auth user ID remains the same.
- **A06** — Previously issued access token remains accepted by GET /user after email change; its embedded email is old while provider user read is current.
- **A07** — Checked the original refresh token after email change. Recorded result: `{"httpStatus":200,"accepted":true}`.
- **A08** — Old email no longer performs password bootstrap; new email does, with same Auth ID. Password is only synthetic fixture bootstrap, not proposed donor login.
- **A09** — Direct authenticated provider update reports a different response for an already-registered Auth address before mailbox proof. Recorded result: `{"httpStatus":422,"errorCode":"email_exists"}`.
- **A10** — Submitting the unchanged current email is not a cancel operation for an existing pending email change. Recorded result: `{"httpStatus":200,"pendingStillPresent":true}`.
- **A11** — With autoconfirm=true and secure email change still enabled, one new-inbox verification completes the change. double_confirm_changes alone therefore does not prove two-proof behavior. Recorded result: `{"httpStatus":200}`.
- **A12** — Requesting a different pending address replaces the provider proof set: old new-inbox proof is rejected and confirmation status resets. Recorded result: `{"oldProofStatus":403}`.
- **A13** — Secure two-inbox verification also succeeds in the opposite order, with the new inbox first; first proof alone does not finish the required pair.
- **A14** — Using the exact newly verified session for logout scope=others preserves its GET /user access and rejects the former other-session access token at that provider endpoint. Recorded result: `{"logoutStatus":204,"retainedUserStatus":200,"otherUserStatus":403}`.
- **A15** — After exact logout-others, retained-session refresh succeeds, former other-session refresh fails and the provider has no other session row for that principal. Recorded result: `{"retainedRefreshStatus":200,"otherRefreshStatus":400}`.

## Actual native Core database observations

All76 native forward migrations and10 assertions ran in a separate removed networkless PostgreSQL17.10 fixture. The Auth table here is the repository verifier bootstrap; real provider semantics were separately exercised above. These are legacy-schema results, not proof of the proposed owner model.

- **D01** — creation trigger copies initial auth email. **Passed**; expected outcome t.
- **D02** — auth email update does not propagate profile or donor. **Passed**; expected outcome t.
- **D03** — stable link keeps existing donation visible. **Passed**; expected outcome 1.
- **D04** — other identity still cannot read gift. **Passed**; expected outcome 0.
- **D05** — browser cannot directly change profile email. **Passed**; expected outcome None; SQLSTATE 42501.
- **D06** — browser cannot directly change donor email. **Passed**; expected outcome None; SQLSTATE 42501.
- **D07** — contact write does not change auth or binding. **Passed**; expected outcome t.
- **D08** — legacy duplicate donor email accepted. **Passed**; expected outcome t.
- **D09** — email compare blocks different current value. **Passed**; expected outcome 0.
- **D10** — email only compare misses ABA revision. **Passed**; expected outcome 1.

## Failed fixture attempts and limits

Two initial Auth bootstrap attempts failed before observations due to the isolated role search path and unqualified identities relation. Extensions alone did not repair it; auth,public search_path did. Both failed records are preserved. First immediate removal check raced asynchronous removal; later inventory confirmed absence, and subsequent runs waited for removal.

Not run: real email delivery, hosted/provider settings, actual Asym P4/P12/P17/contact integration, target authorization/concurrency, accessible browser E2E, production migration/capacity or donor usability study. Old access-token signature validity is distinct from endpoint acceptance: the removed session was rejected at GoTrue GET/user; no PostgREST/storage/Asym-wide denial is inferred.

## Reproducibility and artifacts

The bundle includes reviewed research scripts, sanitized outcomes, source manifest/selected tagged provider sources, actual SQL, independent owner/runtime/UX notes and the finished review. The harness creates only uniquely labelled disposable networkless containers, uses cached images with --pull never, and does not load Core env files. It is research code, not an application implementation.

[Full review](phase25-r11-adversarial-review.md) · [Historical bundle inventory: phase25-r11-proof-bundle.zip](README.md#historical-verification-bundles)
