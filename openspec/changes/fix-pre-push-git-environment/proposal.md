# Isolate the pre-push verification environment

## Why

Phase 29 publication exposed Git hook repository variables reaching preflight and its temporary-repository tests. A fixture's `git init --bare` consequently set the real shared checkout's `core.bare` to true, and Git-based verification failed. The setting was restored; the source commit and original dirty checkout contents were preserved. Normal checks must remain enabled without permitting a fixture to target the invoking repository through inherited Git-local variables.

## What Changes

Reuse the existing Git environment sanitizer for the preflight child, extending it to remove numbered configuration override keys and values. Evaluate the production push guard against the original environment. Preserve unrelated environment, caller input and normal failure propagation. Add a real disposable parent/child repository regression and verify blocked pushes do not launch preflight.

## Impact

Git hook orchestration and its existing environment helper/tests only. No Phase 29 feature behavior, application code, credentials, CI stage sequence or production push guard is changed. No hook bypass is introduced.
