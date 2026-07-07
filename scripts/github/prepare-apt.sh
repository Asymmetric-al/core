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

sudo apt-get update
