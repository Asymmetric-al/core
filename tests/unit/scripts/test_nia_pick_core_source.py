import json
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
SCRIPT = ROOT / "scripts" / "nia_pick_core_source.py"


def run_picker(payload: dict) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["python3", str(SCRIPT)],
        cwd=ROOT,
        input=json.dumps(payload),
        text=True,
        capture_output=True,
        check=False,
    )


class NiaPickCoreSourceTest(unittest.TestCase):
    def test_prints_matching_asymmetric_core_source_id(self) -> None:
        result = run_picker(
            {
                "items": [
                    {
                        "id": "core-main",
                        "identifier": "https://github.com/Asymmetric-al/core",
                        "branch": "main",
                    }
                ]
            }
        )

        self.assertEqual(result.returncode, 0)
        self.assertEqual(result.stdout.strip(), "core-main")
        self.assertIn("identifier='https://github.com/Asymmetric-al/core'", result.stderr)

    def test_prefers_epic_branch_when_multiple_core_sources_match(self) -> None:
        result = run_picker(
            {
                "items": [
                    {
                        "id": "core-main",
                        "identifier": "asymmetric-al/core",
                        "branch": "main",
                    },
                    {
                        "id": "core-production",
                        "identifier": "https://github.com/asymmetric-al/core/",
                        "branch": "production",
                    },
                ]
            }
        )

        self.assertEqual(result.returncode, 0)
        self.assertEqual(result.stdout.strip(), "core-production")

    def test_normalizes_identifier_case_and_trailing_slashes(self) -> None:
        result = run_picker(
            {
                "items": [
                    {
                        "id": "core-normalized",
                        "identifier": "HTTPS://GITHUB.COM/ASYMMETRIC-AL/CORE/",
                        "branch": "main",
                    }
                ]
            }
        )

        self.assertEqual(result.returncode, 0)
        self.assertEqual(result.stdout.strip(), "core-normalized")

    def test_fails_when_nia_returns_no_sources(self) -> None:
        result = run_picker({"items": []})

        self.assertEqual(result.returncode, 1)
        self.assertEqual(result.stdout.strip(), "")
        self.assertIn("no Nia sources returned", result.stderr)

    def test_fails_instead_of_selecting_unrelated_source(self) -> None:
        result = run_picker(
            {
                "items": [
                    {
                        "id": "unrelated",
                        "identifier": "https://github.com/example/other",
                        "branch": "production",
                    }
                ]
            }
        )

        self.assertEqual(result.returncode, 1)
        self.assertEqual(result.stdout.strip(), "")
        self.assertIn("no matching Nia source for asymmetric-al/core", result.stderr)


if __name__ == "__main__":
    unittest.main()
