# Phase 25 specification publication record

[AL-1563](https://github.com/Asymmetric-al/core/issues/1563) published the full implementation specification on 9 September 2026 after explicit testing-seam confirmation. Its 37 appendices contain 15 logical resources. The [publication ledger](publication.json) records their IDs, exact text hashes and lengths. The [repository package](README.md) adopts the same normative scope and adds durable source navigation, terminology, architecture context and program discovery.

## Authority and preservation

The issue body, contracts, acceptance and unchecked tasks form the original published specification. Its exact hashes remain publication provenance. This PR records the same scope in the normal PRD and active OpenSpec directories with the [repository authoring boundary](README.md#authoring-and-generated-views): the JSON story records are the sole acceptance source, their Markdown/OpenSpec views are checked generated projections, and the OpenSpec task plan is the sole editable task register. The PRD task page points there; the three originally published task appendices retain the historical 266-task snapshot. Link/provenance corrections do not silently amend product choices. The repository source map hashes original research separately from formatted adopted records; its original line coordinates are historical, while its heading links navigate the adopted documents.

Repository regeneration repairs scenario-label formatting and renders every canonical acceptance predicate verbatim. Three historical OpenSpec paraphrases converge to the already published JSON/acceptance terminology: US25-D04 and US25-D50 use “JavaScript” in place of “application numeric transport”; US25-D25 uses “Query and DB” in place of “request and collection caches.” These terminology corrections preserve the observable requirements and do not rewrite the original issue hashes.

The specification issue remains open. This PR does not close the phase, create implementation tickets, mark tasks complete, archive OpenSpec, merge predecessor PRs or qualify a production capability. Follow the normal review workflow for any later material contract amendment.

## Review adoption after publication

The original issue hashes identify the original published bytes. The repository is the current review-corrected implementation contract; its content is not claimed byte-identical to the publication. The earlier scenario formatting and three terminology convergences above remain recorded separately.

- **US25-I14 AC02 and IC05:** the original blanket missing-email fallback is qualified for the already-bound stable-subject case established in [IC04](contracts/identity.md#ic04--native-social-identity-safety-and-unresolved-g01). New/unbound attempts without email still use safe fallback. Already-bound sign-in must actually succeed through the qualified native flow and current admission before absence of mutable provider email may be ignored; native failure retains safe recovery and the binding. This promises no unsupported native capability and leaves G01 and native validation intact. The other 647 story predicates retain their published acceptance wording.
- **Acceptance source metadata:** source labels now combine canonical `question_refs` with exact existing `P25.FINAL.*` trace-to-story mappings. US25-I27 uses Q11 plus P25.FINAL.F04; US25-I26 uses only P25.FINAL.F04. No question is fabricated and no second provenance field is added.
- **P28/P12 and P32 owner adoption:** the named Guest-Origin Newsletter Recipient Access and Newsletter Requests Do Not Enroll External Subscribers requirements, the bounded extension to task 1.1 and the matching Implementation Decision 3 clarification expose the existing EX11–EX13/EX16 guest-recipient and request-only exclusion duties in the owner deltas and dispatch prerequisites. The same immutable request, frozen intended human/current purpose authority, original custody and no-enrollment boundaries remain controlling. All other 265 tasks and original capability requirements remain unchanged.

All 648 current acceptance predicates agree across the canonical JSON and generated acceptance/OpenSpec views. Verification compares the historical snapshot using only these exact recorded review adoptions; it does not waive arbitrary wording, scope, owner or source-reference changes. The main story list and all 242 story IDs remain present.

## Publication verification

The prior live audit verified the main body and all 37 appendices, their metadata, 38 unique publication markers and 37 appendix-index targets: 185 checks passed. GitHub GFM rendering checks covered the main story list, boundary trace-table chunks and a financial-contract sample. These checks establish publication integrity, not browser, assistive-technology, provider or database behavior. The PR adds repository structural/link/format/OpenSpec verification and its normal CI gates; exact results belong to the current PR head and check runs.

## Published appendix index

| Resource / part                   | Published record                                                                      | UTF-8 LF SHA-256                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| shared-01                         | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601658250) | `50a59d19eeeaee49a081115411721999f55d853cd77598c84ca2d3cafeccb296` |
| identity-01                       | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601658646) | `88fd5de6c42b249bfd59ef05ce7dbcd89dc111ef18d86a1cb3cde241b1e44786` |
| identity-02                       | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601659063) | `cd4c2f41bc831a55ce077cc394db36d76495f91c1827ff11a2969e0067577ce5` |
| recurring-01                      | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601659419) | `30a32a9d24aefc9bf77568d32c61f387fef2e8d7896a34c285c40ff81dc37650` |
| recurring-02                      | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601659793) | `44717f13eeabb6458c2227c0877b3871733b13ceb70d66c5bb1ddff7f011e23b` |
| financial-01                      | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601660213) | `4db7cd6dbe1cdf832f22097bac613b433630f7a6c4827a1c6979708cd1a334aa` |
| financial-02                      | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601660612) | `a71fc1fe4ec10a38b85b972c1556435e9118c6b3ac06d9c3a0546d98fe1884ae` |
| experience-01                     | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601661046) | `8633a7fba378395b4579eb55d20542d1fb5fc61fe38405819bc42e6f0c5d90f7` |
| experience-02                     | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601661532) | `4ecd3c5bf43ed5d19cca4a0d8471eb89ba8c6724ed34063d3d841fe9d4d078e3` |
| acceptance-01                     | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601661956) | `dec9362e1e9dd08cb5bfc8a43d3a95f3008c857335bbdb13f506825f3c9b691f` |
| acceptance-02                     | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601662434) | `bba0e0c0b04b798f0cb3525c3594913f4d2fad3a8213ade0e20cf82ac75b231f` |
| acceptance-03                     | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601662952) | `fad99d52c237bb2bf19fce265fa4bfc13c836ceae7515194a712a8050dd75016` |
| acceptance-04                     | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601663493) | `b73de4385479ce58201766cce6f75609671ab9cbfc2abc0b0ab4b848d8f198ec` |
| traceability-01                   | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601663980) | `5988428ce7217a6af078b0ed4baf59c5d676daf03570e78480d4e7d400b20bbc` |
| traceability-02                   | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601664421) | `2bf71a9d8db424b620155718bd9086abd8d3a1c3d4529bfc6e90eaf670eaa1c1` |
| traceability-03                   | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601664967) | `40baae1ca8af00a01daa987297fdad66bd1345a220b17099c86ffcd6ec9a929f` |
| traceability-04                   | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601665441) | `651751298e259db2ee40272af755fc6107a9933fb40758c75b308aa48387c96e` |
| traceability-05                   | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601665852) | `828f4b3ce6b1368dbc5e92aeb8dadd67cb1ed210d3fa808f4db6a9695dd2f5c0` |
| traceability-06                   | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601666388) | `f8d30b0557093c007eaeebc5e34d556b3d5c920a3c890e64fe0d65fc19ba9f30` |
| traceability-07                   | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601666869) | `a649b9e5c355c91741d100d967d0cea3bba7ec6a6dac58a3bc94d5f42cd5181f` |
| traceability-08                   | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601667367) | `ba0f93d83eb29733ec96f77370da36d7f7c8aedb239a3d832ff9047f397f4445` |
| evidence-01                       | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601667843) | `97a7250cb0551b9e78c3bef71f2fb56b35f4c4b46b378523dfe63f211a1d187c` |
| tasks-01                          | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601668387) | `742a18aced600bbfff90221fee6eb610f0e838c3f5246363e304c072b4399483` |
| tasks-02                          | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601668954) | `c6ebd6d12c93bca25cb4d1af51c70d20982ff938d33f50e44610ba97e139263f` |
| tasks-03                          | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601669376) | `353e30094e5157043cd14e41cc8c0a902703f2c590158d3018c22d0cdb8283a4` |
| openspec-proposal-01              | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601669713) | `803df4a6c7540c8c2ebf8998ffd7d1c40f0dc51d21bf27a48dd08e780d2e6559` |
| openspec-design-01                | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601670067) | `a699dd7f7e5b40fbac79f67c9231adbd5139655fe81b4f038eaa5eee1ccdb920` |
| openspec-donor-dashboard-depth-01 | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601670507) | `b1566b4f8d190b67fc270c503289cede1183c122b3a7999798fcae3b365f054e` |
| openspec-donor-dashboard-depth-02 | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601671013) | `3d148db956698f20d9a9ab35598c3ad08d8a7efdde98b1c4a04206b1d95a4bed` |
| openspec-donor-dashboard-depth-03 | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601671462) | `57d053fe98c6965b04686e2ee5393859a5c87a2041fc2b5049a6fed2c7753e39` |
| openspec-donor-dashboard-depth-04 | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601671931) | `4fb19787ae756071b59c489aca5c10aee6823afb57820dbc7ebf6adb66923891` |
| openspec-donor-dashboard-depth-05 | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601672321) | `5998812d9ce9b898bb70482c795aa622fa37f072abadadc7b20460e7b3c53247` |
| openspec-donor-dashboard-depth-06 | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601672762) | `dae6295aa25fc6497e93c803766ab116d2804c6479ae5e08963848a894a8689e` |
| openspec-donor-dashboard-depth-07 | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601673260) | `27fa7a3672342c0af5a5e53b758b6c9ff0c0961e79591342d25f321bf3a3068c` |
| openspec-identity-and-access-01   | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601673600) | `9bff58dc643dae74667f33ead22f39ed1f50da243ed97bb10a6282c1de273458` |
| openspec-donation-lifecycle-01    | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601673957) | `6681be4c047307da03e0d1d0eb739d70c7da40e32cd1561ec3cc4f3efd5322c8` |
| openspec-crm-core-01              | [Appendix](https://github.com/Asymmetric-al/core/issues/1563#issuecomment-5601674274) | `5c59b208596f16e39f118de675d9bfcaed0172eecded3c0229b50a0c3b5a75da` |
