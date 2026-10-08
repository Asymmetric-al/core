#!/usr/bin/env bash
set -euo pipefail

APT_ETC_DIR="${APT_ETC_DIR:-/etc/apt}"

# GitHub-hosted Ubuntu runners include Microsoft apt feeds that are unrelated
# to this repo's build but can fail `apt-get update` when their signed metadata
# is temporarily malformed. Disable only those preinstalled feeds before
# installing Ubuntu packages needed by CI.
for source_file in \
  "$APT_ETC_DIR/sources.list" \
  "$APT_ETC_DIR"/sources.list.d/*.list \
  "$APT_ETC_DIR"/sources.list.d/*.sources; do
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

# Use official HTTPS endpoints for existing Ubuntu URI fields. Match complete
# URI tokens so comments, options, signing keys and unrelated repositories stay
# intact. Azure and the preinstalled mirror file resolve to the archive endpoint.
normalized_sources=$(mktemp)
trap 'rm -f "$normalized_sources"' EXIT
for source_file in \
  "$APT_ETC_DIR/apt-mirrors.txt" \
  "$APT_ETC_DIR/sources.list" \
  "$APT_ETC_DIR"/sources.list.d/*.list \
  "$APT_ETC_DIR"/sources.list.d/*.sources; do
  if [ ! -f "$source_file" ]; then
    continue
  fi

  source_format=list
  case "$source_file" in
    *.sources) source_format=deb822 ;;
    "$APT_ETC_DIR/apt-mirrors.txt") source_format=mirror ;;
  esac
  final_newline=$(tail -c 1 "$source_file" | wc -l)
  sudo awk -v format="$source_format" -v final_newline="$final_newline" '
    function normalize_uri(uri) {
      if (uri == "mirror+file:/etc/apt/apt-mirrors.txt")
        return "https://archive.ubuntu.com/ubuntu"
      if (uri ~ /^https?:\/\/azure\.archive\.ubuntu\.com\/ubuntu\/?$/)
        sub(/^https?:\/\/azure\.archive/, "https://archive", uri)
      else if (uri ~ /^http:\/\/(archive|security)\.ubuntu\.com\/ubuntu\/?$/)
        sub(/^http:/, "https:", uri)
      return uri
    }
    function normalize_values(value, all, result, token) {
      result = ""
      while (match(value, /^[[:space:]]*[^[:space:]]+/)) {
        token = substr(value, 1, RLENGTH)
        value = substr(value, RLENGTH + 1)
        match(token, /^[[:space:]]*/)
        result = result substr(token, 1, RLENGTH)
        token = substr(token, RLENGTH + 1)
        if (token ~ /^#/) return result token value
        result = result normalize_uri(token)
        if (!all) return result value
      }
      return result value
    }
    {
      line = $0
      if (format == "deb822") {
        if (line ~ /^[^[:space:]#][^:]*:/) {
          match(line, /^[^:]*:/)
          prefix = substr(line, 1, RLENGTH)
          in_uris = (tolower(prefix) == "uris:")
          if (in_uris)
            line = prefix normalize_values(substr(line, RLENGTH + 1), 1)
        } else if (line ~ /^[[:space:]]*$/) {
          in_uris = 0
        } else if (in_uris && line ~ /^[[:space:]]/ && line !~ /^[[:space:]]*#/) {
          line = normalize_values(line, 1)
        }
      } else if (format == "mirror") {
        line = normalize_values(line, 0)
      } else if (match(line, /^[[:space:]]*deb(-src)?[[:space:]]+(\[[^]]*\][[:space:]]+)?/)) {
        prefix = substr(line, 1, RLENGTH)
        line = prefix normalize_values(substr(line, RLENGTH + 1), 0)
      }
      printf "%s%s", separator, line
      separator = "\n"
    }
    END { if (NR && final_newline) printf "\n" }
  ' "$source_file" > "$normalized_sources"
  if ! cmp -s "$source_file" "$normalized_sources"; then
    sudo tee "$source_file" < "$normalized_sources" >/dev/null
  fi
done

sudo tee "$APT_ETC_DIR/apt.conf.d/99-core-ci-timeouts" >/dev/null <<'EOF'
Acquire::http::Timeout "20";
Acquire::https::Timeout "20";
Acquire::Retries "2";
EOF

# Successful canvas installs finish in about one minute. Some GitHub-hosted
# runners hang forever on `apt-get update` (lint/migrate had no job timeout
# and sat on this step for 25+ minutes). Bound the fetch and retry once so a
# bad mirror cannot occupy a runner for the 6-hour default job cap.
APT_GET_TIMEOUT_SECONDS="${APT_GET_TIMEOUT_SECONDS:-180}"
if ! [[ "$APT_GET_TIMEOUT_SECONDS" =~ ^[1-9][0-9]*$ ]]; then
  echo "APT_GET_TIMEOUT_SECONDS must be a positive integer, got: ${APT_GET_TIMEOUT_SECONDS}" >&2
  exit 1
fi

bounded_apt_get() {
  sudo timeout --kill-after=10s "${APT_GET_TIMEOUT_SECONDS}s" apt-get "$@"
}

if ! bounded_apt_get update; then
  echo "apt-get update failed or timed out after ${APT_GET_TIMEOUT_SECONDS}s; retrying once"
  sleep 5
  bounded_apt_get update
fi
