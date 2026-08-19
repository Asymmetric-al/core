#!/usr/bin/env bash
set -euo pipefail

# GitHub-hosted Ubuntu runners include Microsoft apt feeds that are unrelated
# to this repo's build but can fail `apt-get update` when their signed metadata
# is temporarily malformed. Disable only those preinstalled feeds before
# installing Ubuntu packages needed by CI.
for source_file in \
  /etc/apt/sources.list \
  /etc/apt/sources.list.d/*.list \
  /etc/apt/sources.list.d/*.sources; do
  if [ ! -f "$source_file" ]; then
    continue
  fi

  if grep -q "packages.microsoft.com" "$source_file"; then
    if [[ "$source_file" == *.sources ]]; then
      sudo mv "$source_file" "${source_file}.disabled-by-core-ci"
    else
      sudo sed -i \
        -e "s|^[[:space:]]*deb |# disabled by core CI apt prep: deb |" \
        -e "s|^[[:space:]]*deb-src |# disabled by core CI apt prep: deb-src |" \
        "$source_file"
    fi
  fi
done

# Successful canvas installs finish in about one minute. Some GitHub-hosted
# runners hang forever on `apt-get update` (lint/migrate had no job timeout
# and sat on this step for 25+ minutes). Bound the fetch and retry once so a
# bad mirror cannot occupy a runner for the 6-hour default job cap.
APT_GET_TIMEOUT_SECONDS="${APT_GET_TIMEOUT_SECONDS:-180}"

bounded_apt_get() {
  sudo timeout --kill-after=10s "${APT_GET_TIMEOUT_SECONDS}s" apt-get "$@"
}

if ! bounded_apt_get update; then
  echo "apt-get update failed or timed out after ${APT_GET_TIMEOUT_SECONDS}s; retrying once"
  sleep 5
  bounded_apt_get update
fi
