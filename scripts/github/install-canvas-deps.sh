#!/usr/bin/env bash
set -euo pipefail

bash scripts/github/prepare-apt.sh

# `apt-get update` finishes in seconds when healthy. Canvas `apt-get install`
# pulls ~80 packages (~13 MB) and can take several minutes on a slow Azure
# mirror. A 180s cap killed in-progress downloads (exit 124) on build and
# instant-nav while format/typecheck/migrate on the same SHA succeeded.
APT_GET_INSTALL_TIMEOUT_SECONDS="${APT_GET_INSTALL_TIMEOUT_SECONDS:-600}"
if ! [[ "$APT_GET_INSTALL_TIMEOUT_SECONDS" =~ ^[1-9][0-9]*$ ]]; then
  echo "APT_GET_INSTALL_TIMEOUT_SECONDS must be a positive integer, got: ${APT_GET_INSTALL_TIMEOUT_SECONDS}" >&2
  exit 1
fi

canvas_packages=(
  libpixman-1-dev
  libcairo2-dev
  libpango1.0-dev
  libjpeg-dev
  libgif-dev
  librsvg2-dev
)

bounded_apt_install() {
  sudo timeout --kill-after=10s "${APT_GET_INSTALL_TIMEOUT_SECONDS}s" \
    apt-get install -y "${canvas_packages[@]}"
}

if ! bounded_apt_install; then
  echo "apt-get install (canvas) failed or timed out after ${APT_GET_INSTALL_TIMEOUT_SECONDS}s; retrying once"
  sleep 5
  bounded_apt_install
fi
