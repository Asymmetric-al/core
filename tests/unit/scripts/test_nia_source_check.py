import json
import os
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
SCRIPT = ROOT / "scripts" / "nia-source-check.sh"


class NiaSourceCheckScriptTest(unittest.TestCase):
    def test_writes_github_outputs_and_json_status(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            fake_curl = temp_path / "curl"
            fake_curl.write_text(
                """#!/usr/bin/env bash
cat <<'JSON'
{"items":[{"id":"core-epic","identifier":"https://github.com/Asymmetric-al/core","branch":"epic"}]}
JSON
""",
                encoding="utf-8",
            )
            fake_curl.chmod(0o755)

            github_output = temp_path / "github-output"
            env = os.environ.copy()
            env.update(
                {
                    "GITHUB_OUTPUT": str(github_output),
                    "NIA_API_KEY": "test-api-key",
                    "PATH": f"{temp_path}{os.pathsep}{env['PATH']}",
                }
            )

            result = subprocess.run(
                ["bash", str(SCRIPT)],
                cwd=ROOT,
                env=env,
                text=True,
                capture_output=True,
                check=False,
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            status = json.loads(result.stdout.splitlines()[0])
            self.assertEqual(
                status,
                {
                    "source_id": "core-epic",
                    "registered": True,
                    "repository": "asymmetric-al/core",
                },
            )
            self.assertIn("Nia source for asymmetric-al/core is registered.", result.stdout)

            output = github_output.read_text(encoding="utf-8")
            self.assertIn("source_id=core-epic", output)
            self.assertIn("registered=true", output)
            self.assertNotIn("test-api-key", result.stdout)
            self.assertNotIn("test-api-key", result.stderr)
            self.assertNotIn("test-api-key", output)


if __name__ == "__main__":
    unittest.main()
