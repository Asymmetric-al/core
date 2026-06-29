#!/bin/bash

# Vercel Deployment Script for Codex (via claimable deploy endpoint)
# Usage: ./deploy-codex.sh [project-path]
# Returns: JSON with previewUrl, claimUrl, deploymentId, projectId

set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
DEPLOY_ENDPOINT="${DEPLOY_ENDPOINT:-https://codex-deploy-skills.vercel.sh/api/deploy}"
export DEPLOY_ENDPOINT

exec "$SCRIPT_DIR/deploy.sh" "$@"
