#!/usr/bin/env bash
set -euo pipefail

bash scripts/github/prepare-apt.sh

APT_GET_TIMEOUT_SECONDS="${APT_GET_TIMEOUT_SECONDS:-180}"

sudo timeout --kill-after=10s "${APT_GET_TIMEOUT_SECONDS}s" apt-get install -y \
  libpixman-1-dev \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev \
  librsvg2-dev
