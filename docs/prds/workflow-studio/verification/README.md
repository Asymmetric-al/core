# Verification and proof limits

Run the independent repository-authored checks from the repository root in the supported Bun/Python development shell:

```sh
python3 docs/prds/workflow-studio/tools/render.py --check
python3 docs/prds/workflow-studio/tools/verify.py
bun run openspec -- validate add-workflow-studio-program-contracts --strict
```

The renderer reads only declared canonical contracts and compares six formatted projections using pinned local Prettier; `--write` regenerates those views. The verifier does not run any recovered source script. It compares original recipe/scenario/binding and fixture meaning with the immutable assets, validates coverage, inert defaults, binding references, source-checkpoint allocation, the complete work-slice DAG and CORE's lack of downstream dependencies. It includes negative checks for a cycle and a dangling graph dependency.

On 2026-09-22 these checks passed. An additional independent Python `jsonschema.Draft202012Validator` run checked all three candidate schemas and validated all 16 workflow and four form fixtures. Local documentation links were checked. These are structural documentation/fixture results only. The original packet's captured verification results remain dated evidence under the immutable source directory; they are not the results of this reconciliation.

No runtime, provider, database race, browser, accessibility, load, pilot or tenant activation tests are claimed. All 352 acceptance scenarios remain specified and not executed, all 39 implementation slices remain not started, and all symbolic source/form contracts remain unqualified. Implementation must use TDD and supply the exact owner evidence identified in the package.
