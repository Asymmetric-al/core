#!/usr/bin/env bash
set -euo pipefail

bash scripts/github/prepare-apt.sh

sudo apt-get install -y postgresql-client
