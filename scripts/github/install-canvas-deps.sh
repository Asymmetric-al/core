#!/usr/bin/env bash
set -euo pipefail

bash scripts/github/prepare-apt.sh

sudo apt-get install -y \
  libpixman-1-dev \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev \
  librsvg2-dev
