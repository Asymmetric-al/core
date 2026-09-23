# QA preview upload correction

## Why

Core preview QA fails before a deployment is created because its app working directory is combined with the same Vercel project root twice. Reproducing the corrected root then exposed the 15,000-file upload limit for this 16,094-file monorepo.

## What Changes

Deploy from the repository root using each existing explicit project ID and Vercel's supported tgz archive upload. Keep preview-only targets, current credentials, PR-head checks and label/fork/draft gates.

## Capabilities

No new or modified product capability. This tooling correction restores the existing preview workflow; `skip_specs: true` avoids inventing a product requirement.

## Impact

Three commands in the preview workflow and their regression checks. No project settings, token rotation, billing or production changes. Issue AL-1561. Rollback reverts these command changes.
