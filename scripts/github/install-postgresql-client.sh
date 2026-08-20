#!/usr/bin/env bash
set -euo pipefail

bash scripts/github/prepare-apt.sh

APT_GET_INSTALL_TIMEOUT_SECONDS="${APT_GET_INSTALL_TIMEOUT_SECONDS:-600}"
if ! [[ "$APT_GET_INSTALL_TIMEOUT_SECONDS" =~ ^[1-9][0-9]*$ ]]; then
  echo "APT_GET_INSTALL_TIMEOUT_SECONDS must be a positive integer, got: ${APT_GET_INSTALL_TIMEOUT_SECONDS}" >&2
  exit 1
fi

bounded_apt_install() {
  sudo timeout --kill-after=10s "${APT_GET_INSTALL_TIMEOUT_SECONDS}s" \
    apt-get install -y postgresql-client
}

if ! bounded_apt_install; then
  echo "apt-get install (postgresql-client) failed or timed out after ${APT_GET_INSTALL_TIMEOUT_SECONDS}s; retrying once"
  sleep 5
  bounded_apt_install
fi
