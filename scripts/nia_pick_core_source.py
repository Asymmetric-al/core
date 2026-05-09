#!/usr/bin/env python3
"""Read Nia GET /v2/sources JSON from stdin; print chosen source id on stdout (metadata on stderr)."""
from __future__ import annotations

import json
import sys

TARGET_IDS = frozenset(
    {
        "https://github.com/asymmetric-al/core",
        "asymmetric-al/core",
    }
)


def norm(x: object) -> str:
    return str(x or "").rstrip("/").lower()


def main() -> None:
    data = json.load(sys.stdin)
    items: list[dict] = data.get("items", [])
    matches = [i for i in items if norm(i.get("identifier")) in TARGET_IDS]
    if not items:
        print("no Nia sources returned", file=sys.stderr)
        raise SystemExit(1)
    if not matches:
        print("no matching Nia source for asymmetric-al/core", file=sys.stderr)
        raise SystemExit(1)

    def rank(item: dict) -> int:
        b = (item.get("branch") or "").lower()
        return 0 if b == "epic" else 1

    chosen = sorted(matches, key=rank)[0]
    print(
        f"Using Nia source id={chosen['id']} "
        f"identifier={chosen.get('identifier')!r} branch={chosen.get('branch')!r}",
        file=sys.stderr,
    )
    print(chosen["id"])


if __name__ == "__main__":
    main()
