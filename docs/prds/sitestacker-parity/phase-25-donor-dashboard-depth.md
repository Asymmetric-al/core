# Phase 25 — Donor Dashboard Depth

**Specification version1 · 9 September 2026 · Product scope and testing approach confirmed.** This is the complete implementation specification for the ratified session. The implementation and activation evidence remain to be earned. In particular, **G01's supported native Auth linking guarantee is unresolved and blocks affected social activation**; this specification does not silently replace the selected architecture or providers.

The numbered stories below, their exact acceptance criteria, the five normative contracts and owner-gate register form one specification. Read the relevant contract plus shared decisions when implementing any story. A review summary or legacy ticket is not a substitute. No feature implementation is included in this publication.

Repository navigation: [complete package and reading order](phase-25-donor-dashboard-depth/README.md), [ratified decision log](phase-25-donor-dashboard-depth/decision-log.md), [glossary](phase-25-donor-dashboard-depth/glossary.md), [architecture decision](phase-25-donor-dashboard-depth/architecture.md) and [publication provenance](phase-25-donor-dashboard-depth/publication.md).

## Problem Statement

Donors need to understand their giving, care for recurring commitments, retrieve the right records, connect with ministry updates and change account choices without staff detours or uncertainty. The current portal exposes partial journeys and legacy assumptions: incomplete history, ambiguous payment and document outcomes, inconsistent source/permission boundaries and controls that can look complete before the underlying operation is established. Rare pledge, matching, DAF and IRA situations can confuse everyone if they appear indiscriminately or borrow ordinary-gift tax meanings.

## Solution

Deliver one calm organization portal over the existing authoritative owners. Personal giving is the neutral starting point, exact represented tasks remain scoped, and qualified readers do not need a fabricated financial record. Home presents welcome/ministry connection, current source actions and an explainable calendar-year monetary summary. Ministry Updates is a prominent independent reading task. History keeps gifts together; recurring giving and Wallet have exact understandable commands and recoverable outcomes. Receipts & statements exposes real current documents. Preferences remain purpose-specific. Rare records appear only when relevant, with matching/DAF/IRA money and acknowledgment meanings kept distinct.

Shared shadcn base-maia/Base UI/Figtree/Zinc, ReUI-inspired actual grids, readable mobile controls, accessible navigation and local failure states provide one coherent experience. Supporting source work remains behind existing domain, authorization, document and communication boundaries.

## User Stories

<!-- Generated from docs/prds/sitestacker-parity/phase-25-donor-dashboard-depth/traceability.json stories and final trace mappings. Do not hand-edit; run node docs/prds/sitestacker-parity/phase-25-donor-dashboard-depth/tools/render-stories.mjs --write. -->

Each story is independently verifiable using its matching **US25** acceptance entry and referenced normative sections. The acceptance entry states observable outcomes and negative boundaries; the shared contract applies without creating a separate feature or permission.

1. As an account holder, I want a useful self-service Home with recognizable ordinary destinations, so that I can complete my task without a tour or staff detour. **US25-U01**
2. As a person who helps manage an organization's giving, I want the correct financial context without changing my personal reading or contact choices, so that I know whose records and choices I am acting on. **US25-U02**
3. As a donor using an older bookmark, I want recurring-giving links to retain their meaning while fixed-total pledges have a distinct destination, so that I never enter the wrong commitment product. **US25-U03**
4. As a recipient of an organization-shared Updates link, I want to open my own permitted Updates, so that a forwarded link is useful without exposing its sender's feed. **US25-U04**
5. As a signed-out reader, I want to sign in and continue to the exact task I opened, so that authentication does not lose my place. **US25-U05**
6. As a reader sharing or opening content, I want honest safe links and copy feedback, so that I do not accidentally share protected information or assume copying succeeded. **US25-U06**
7. As an account holder without available financial records, I want a calm welcome and useful connection to ministry content, so that an empty account feels usable without invented giving. **US25-U07**
8. As a donor browsing Home, I want a short readable Ministry Updates preview, so that I can keep connected without an endless feed. **US25-U08**
9. As a reader whose Updates are empty or hidden, I want one truthful local explanation and permitted management, so that I can recover my view without exposing or restoring hidden content. **US25-U09**
10. As a donor returning after activity or a slow request, I want the same stable Home with current truthful results, so that I can continue without losing place or repeating a gift. **US25-U10**
11. As a Ministry Updates reader, I want one combined list of my permitted posts, so that I can begin reading without first choosing a ministry. **US25-U11**
12. As a reader looking for one ministry, I want a safe source filter that covers the actual reading set, so that I can find relevant posts even when they are not on the first loaded page. **US25-U12**
13. As a reader changing a filter, I want a clear stable transition to the chosen view, so that I do not see another view's late results. **US25-U13**
14. As a reader with many posts, I want complete deliberate continuation and a recoverable reading position, so that I can reach every permitted result without duplicates or false endings. **US25-U14**
15. As a reader during new publication or access change, I want stable reading that immediately respects current safety, so that new posts do not interrupt me and withdrawn data does not return. **US25-U15**
16. As a person who hid a ministry, I want to open a deliberate exact post while retaining my ordinary Hide choice, so that I can read a specific link without changing my preferences. **US25-U16**
17. As a reader of private content, I want only authorized safe text and media with useful local failures, so that protected material cannot leak through alternate copies. **US25-U17**
18. As a reader using an available reaction or comment, I want the same durable allowed response across surfaces, so that I can trust the result after returning. **US25-U18**
19. As a reader, I want to hide or show one ministry's posts, so that I control my ordinary reading without other changes. **US25-U19**
20. As a recipient, I want to choose eligible post emails independently of reading, so that I can receive either, both or neither. **US25-U20**
21. As a person editing preferences, I want each control to save only its intended value, so that one failure cannot erase another successful choice. **US25-U21**
22. As a recipient withdrawing post emails, I want Off to remain effective even after an earlier uncertain On, so that reconnects and delayed work cannot silently opt me back in. **US25-U22**
23. As a person whose preference response was lost, I want to reconcile the same operation and current state, so that I do not undo a successful save or repeat a changed instruction. **US25-U23**
24. As a reader managing hidden sources, I want a discoverable safe management path with both controls, so that hiding content never traps me out of email or restoration settings. **US25-U24**
25. As an account holder opening Preferences, I want a useful current overview with simple direct choices, so that I can understand my settings before entering detail. **US25-U25**
26. As an account holder with many topics or ministries, I want complete qualitative summaries and focused management, so that a large set remains understandable without misleading counts. **US25-U26**
27. As a person editing a focused preference, I want a direct contextual journey and predictable Back, so that I need no extra category or save ceremony. **US25-U27**
28. As a recipient facing an unavailable or ineligible choice, I want a truthful state and the appropriate existing next step, so that I do not mistake a disabled capability for an opt-out. **US25-U28**
29. As a donor with a current required step, I want one clear Needs attention section, so that I can find what actually needs my action. **US25-U29**
30. As a donor scanning current needs, I want recognizable scoped context and one useful next link, so that I can choose an action confidently. **US25-U30**
31. As a donor with multiple needs, I want a compact stable preview with complete further access, so that important work is visible without an alert wall. **US25-U31**
32. As a donor returning to a need after delay or partial outage, I want current source truth without repeating completed work, so that I can recover safely and still use other portal areas. **US25-U32**
33. As a donor receiving notifications, I want only meaningful qualified notices, so that the bell is useful without every payment, post or email becoming noise. **US25-U33**
34. As a donor opening the bell, I want a small All-first view with clear current actions and recent information, so that I can find a relevant notice without managing an inbox. **US25-U34**
35. As a human who shares responsibility for giving, I want my own scoped notification and read state, so that another representative cannot read or clear notices for me. **US25-U35**
36. As a donor reading a notification, I want reading to clear only unread treatment, so that I do not accidentally resolve or execute the underlying task. **US25-U36**
37. As a donor organizing an informational notice, I want safe limited Archive and Restore, so that I can tidy a view without hiding required work or reviving expired access. **US25-U37**
38. As a donor marking current notifications read, I want a precise bounded scope that excludes later arrivals, so that new meaningful information remains discoverable. **US25-U38**
39. As a donor returning after time has passed, I want notification history to respect its actual source lifetime, so that old messages do not become new obligations. **US25-U39**
40. As a donor encountering a notice outage or stale link, I want safe local recovery to current source information, so that a broken notification does not break the task or expose old data. **US25-U40**
41. As a donor exploring one ministry, I want an optional direct full-page overview of that exact context, so that I can read and manage relevant records without a directory detour. **US25-U41**
42. As a donor using ministry context after a fund change, I want the actual current fund scope with older records preserved, so that I am not misled into believing older giving moved. **US25-U42**
43. As a reader on a ministry overview, I want small independently permitted sections in useful order, so that the page works with partial rights and on a phone. **US25-U43**
44. As a donor reviewing a ministry's recurring records, I want only exact matching line facts and honest further links, so that a shared arrangement cannot misstate my support for this fund. **US25-U44**
45. As a person leaving and returning to a ministry overview, I want my authorized task and position to survive change, so that I can resume without seeing stale or unrelated records. **US25-U45**
46. As a guest interested in a missionary newsletter, I want one short request without signing up or checking my inbox, so that I can express interest with minimal effort. **US25-U46**
47. As a signed-in newsletter requester, I want editable human prefills that stay private and affect only the request, so that convenience does not change my account or leak to another visitor. **US25-U47**
48. As a newsletter requester entering international data, I want a usable single-column form with honest rejection and no-JS support, so that I can submit without unnecessary format barriers. **US25-U48**
49. As a newsletter requester after submitting, I want a durable Request received result and simple return, so that I know my request was recorded without a false delivery promise. **US25-U49**
50. As a newsletter requester with a lost response or double click, I want safe same-request reconciliation, so that uncertainty does not send the missionary duplicate requests. **US25-U50**
51. As a newsletter requester who notices a submitted typo, I want an honest way to send corrected details, so that I can fix my request without believing the first handoff was recalled. **US25-U51**
52. As a missionary receiving newsletter interest, I want a concise actionable governed email with truthful proof wording, so that I can handle the request through my usual external process. **US25-U52**
53. As a missionary checking a dashboard request, I want the same bounded request under my current exact authority, so that I can use the address without a duplicate workflow or data leak. **US25-U53**
54. As an operator supporting a newsletter handoff, I want independent durable outcomes and exact current recipient fences, so that one failed channel can recover without repeating success or leaking to a successor. **US25-U54**
55. As a newsletter requester or missionary, I want old request data and late work to expire at the declared limits, so that an old request cannot reappear as new or expose contact details indefinitely. **US25-U55**
56. As a legitimate guest sharing a network with other visitors, I want proportionate bounded request protection, so that abuse controls do not turn every ordinary request into a verification workflow. **US25-U56**
57. As a person using keyboard, assistive technology, zoom or a phone, I want the same complete readable and operable journeys, so that I can finish tasks without hidden labels, focus traps or clipped consequences. **US25-U57**
58. As an account holder whose session or rights change, I want private state and all alternate access paths to respect the current boundary, so that old caches or direct URLs cannot expose another person's data. **US25-U58**
59. As a maintainer operating these donor services, I want minimal useful source-owned diagnostics and bounded monitoring, so that I can recover real failures without surveilling donors or inventing tasks. **US25-U59**
60. As a release owner, I want one qualified owner path and honest complete-journey evidence, so that a polished screen cannot hide unsafe or unimplemented behavior. **US25-U60**
61. As a donor, I want open my own giving immediately on a neutral visit, so that ordinary personal tasks need no account chooser. **US25-I01**
62. As a representative-only donor, I want enter the giving I am permitted to manage without creating a personal gift record, so that I can complete legitimate work with my existing access. **US25-I02**
63. As a donor representative, I want see whose giving I am viewing while my login remains mine, so that I do not confuse representation with impersonation. **US25-I03**
64. As a donor, I want switch giving contexts without retargeting work or preferences, so that my accepted instructions and private information stay correctly scoped. **US25-I04**
65. As an authorized nonfinancial portal user, I want reach my admitted reading or document task without a financial donor gate, so that legitimate access does not depend on having donated. **US25-I05**
66. As a donor, I want use email first and clearly labelled qualified social alternatives, so that sign-in remains familiar and understandable. **US25-I06**
67. As a donor, I want choose the link or code in the first sign-in email, so that I can sign in on the device that is convenient. **US25-I07**
68. As a donor, I want have email previews and scanners leave my sign-in proof untouched, so that opening or checking a message cannot authenticate or mutate my account. **US25-I08**
69. As a donor, I want recover from expired codes, resends, denied provider consent and lost responses, so that I can finish without repeated messages or duplicate accounts. **US25-I09**
70. As an account holder, I want have a new social identity prove the required native trust before joining my account, so that a stale or misleading email assertion cannot acquire my credentials. **US25-I10**
71. As a donor, I want have provider identity and email treated according to their actual evidence, so that my account and giving are not inferred from mutable metadata. **US25-I11**
72. As an account holder, I want connect or disconnect a sign-in method deliberately, so that I keep the correct account and a usable recovery route. **US25-I12**
73. As an Apple sign-in user, I want use relay privacy and recover when my Apple account changes, so that convenience does not disclose my underlying mailbox or strand access. **US25-I13**
74. As a Facebook sign-in user, I want use a publicly qualified login and receive a clear fallback when email is unavailable, so that a development-only success does not become a broken donor experience. **US25-I14**
75. As a donor, I want understand the organization's brand and the external provider handoff, so that I know which service is authenticating me. **US25-I15**
76. As a donor changing email, I want enter one new address and explicitly select the uses I want to change, so that I avoid repeated effort without updating unrelated contact records. **US25-I16**
77. As a donor changing email, I want complete the necessary mailbox proofs without redundant challenges, so that my change is secure and understandable. **US25-I17**
78. As a donor changing both email uses, I want see each real result and resume only unfinished work, so that a partial failure does not undo or repeat a successful change. **US25-I18**
79. As a donor changing email, I want leave, correct or recover a pending request truthfully, so that I do not accidentally cancel or revive an old proof. **US25-I19**
80. As an established donor, I want keep my verified claim when I change a contact address, so that mutable contact data does not erase or transfer my history. **US25-I20**
81. As an account holder across organizations, I want have shared credential changes reconcile current access everywhere they apply, so that old sensitive authority cannot survive an identity transition. **US25-I21**
82. As a donor finishing email verification, I want keep the exact completing device signed in while other old sessions are retired, so that I can continue safely without an inaccurate session promise. **US25-I22**
83. As a donor changing contact email, I want retain my authored communication choices and receive only the required qualified messages, so that a contact edit does not enroll me or redirect old mail. **US25-I23**
84. As an authenticated account holder, I want receive a truthful address-unavailable result without disclosure of another donor, so that the system does not claim an assurance its provider cannot supply. **US25-I24**
85. As a donor, I want update the name used for this organization's ordinary contact without a surname requirement, so that my actual name survives the system's formatting assumptions. **US25-I25**
86. As a donor, I want keep or clear an optional usable contact phone, so that contact information does not become an authentication or consent change. **US25-I26**
87. As a donor updating personal contact, I want receive one durable result through every supported editor or API, so that a partial write or alternate route cannot contradict my change. **US25-I27**
88. As a donor, I want see one optional current mailing address with only permitted actions, so that postal contact remains a simple occasional task. **US25-I28**
89. As a donor editing postal contact, I want use one clear inline form that preserves my address and place in the page, so that I can make a routine update without a wizard or verification trip. **US25-I29**
90. As an international donor, I want enter my address as appropriate structured fields or ordered postal lines, so that the software does not discard units or invent a domestic format. **US25-I30**
91. As a donor or authorized staff member, I want save a mailing change against its exact current revision, so that concurrent changes and retries cannot overwrite one another. **US25-I31**
92. As a donor who moves, I want withdraw old personal-mailing use including formatting predecessors, so that mail cannot use an old residence merely because it referenced an earlier format. **US25-I32**
93. As a donor with mail being prepared, I want understand the separate result for saved address and existing mail, so that the portal does not promise recall or silently start another delivery. **US25-I33**
94. As a donor, I want remove my current mailing address deliberately, so that I can stop that current use without changing giving or erasing required records. **US25-I34**
95. As a donor, I want have retired postal values and diagnostic copies kept only for their declared purposes, so that a simple move does not create an indefinite address trail. **US25-I35**
96. As a donor, I want have same-account context and security changes remove stale private data, so that late requests cannot expose an old address or another giving context. **US25-I36**
97. As an authorized support operator, I want diagnose the exact identity or contact stage with safe evidence, so that I can recover work without raw credential handling or invented authority. **US25-I37**
98. As a release reviewer, I want verify complete identity/contact journeys at their real boundaries, so that green mocks cannot certify unsafe account or mailing behavior. **US25-I38**
99. As an implementation owner, I want adopt one source of truth while preserving accepted work and history, so that mixed versions and rollback do not restore old unsafe behavior. **US25-I39**
100. As a platform or CRM operations owner, I want operate bounded identity and mailing work with explicit signals and responses, so that saturation or configuration drift is diagnosed without weakening safety. **US25-I40**
101. As a donor, I want open current recurring giving with obvious access to past arrangements, so that I can manage present giving and find history without another chooser. **US25-R01**
102. As a donor with limited line access, I want see each real arrangement classified from the lines I may access, so that hidden siblings neither leak information nor hide my past giving. **US25-R02**
103. As a donor, I want understand paused, processing and terminal-but-unresolved giving, so that I know whether future intent or payment confirmation still needs attention. **US25-R03**
104. As a donor, I want search my current or past recurring gifts and open exact details, so that I can find older or less visible gifts without changing financial scope. **US25-R04**
105. As a donor with several gifts in an arrangement, I want read a compact preview and reach every permitted line, so that the group stays recognizable without hiding important consequences. **US25-R05**
106. As a donor with a long recurring history, I want continue through all admitted arrangements and large groups, so that page and rendering limits do not silently lose records. **US25-R06**
107. As a donor, I want see exact money, cadence and calendar facts, so that I do not agree to an invented amount or date. **US25-R07**
108. As a donor, I want edit relevant recurring terms in one focused workspace, so that I can make a simple or combined change without a wizard. **US25-R08**
109. As a donor, I want collapse sections or undo one edit without losing other work, so that the visible controls mean what they say. **US25-R09**
110. As a donor, I want receive linked validation for the whole proposal, so that hidden or dependent errors cannot cause a wrong financial change. **US25-R10**
111. As a donor or authorized representative, I want review the full combined exposure of my requested changes, so that a reduction in one field does not hide a wider instruction elsewhere. **US25-R11**
112. As a donor, I want change my continuing date or optional end with clear calendar consequences, so that I know which future gifts move or stop. **US25-R12**
113. As a donor, I want check every material consequence before accepting a recurring change, so that my consent matches the actual effect. **US25-R13**
114. As a donor, I want return from secure setup or authentication to the right stage, so that a provider callback is not mistaken for a completed recurring change. **US25-R14**
115. As a donor, I want recover a change after a lost response, so that I do not accidentally submit it twice. **US25-R15**
116. As a donor, I want leave an unaccepted edit and still reach protective actions, so that unfinished input does not trap me or silently undo accepted work. **US25-R16**
117. As a donor, I want start Replace from the exact saved method and see its qualified uses, so that I know which gifts are candidates without guessing from a card mask. **US25-R17**
118. As a donor, I want adjust the eligible replacement selection deliberately, so that unselected or newly discovered gifts do not change unexpectedly. **US25-R18**
119. As a donor, I want choose a compatible saved method or securely add one inside Replace, so that I can finish without duplicating setup or losing the selected task. **US25-R19**
120. As a financial authorizer, I want authorize each selected recurring group accurately, so that one convenient review does not become blanket collection authority. **US25-R20**
121. As a donor, I want have my complete accepted replacement selection recorded before work begins, so that partial progress cannot lose what I approved. **US25-R21**
122. As a donor, I want replace only the selected compatible uses without unintended collections, so that future binding maintenance does not create extra payments. **US25-R22**
123. As a donor, I want see individual confirmed and unresolved replacement results, so that I can recover remaining work without repeating successful changes. **US25-R23**
124. As a donor, I want understand when an in-place credential edit affects shared uses, so that deselection does not promise an isolation the provider cannot supply. **US25-R24**
125. As a donor, I want remove a saved method only after real live dependencies are safe, so that paused, pending or hidden uses do not break silently. **US25-R25**
126. As a donor, I want return from replacement to a separate current Remove review, so that I can replace gifts without being forced to delete the old method. **US25-R26**
127. As a donor, I want recover an uncertain removal safely, so that a timeout does not trigger another detach or a false success. **US25-R27**
128. As a donor, I want retain newer preferences when an old method removal finishes, so that late cleanup cannot erase my current choice. **US25-R28**
129. As a first-time donor or authorized representative, I want save a payment method without first making a gift, so that the wallet works before any financial history exists. **US25-R29**
130. As a donor, I want optionally prefer a new method while saving it, so that I can express a convenience choice without changing existing giving. **US25-R30**
131. As a donor or treasurer, I want keep my preferred method personal to my exact giving context, so that another actor, organization or account does not inherit it. **US25-R31**
132. As a donor verifying a bank method, I want know whether my optional preference is pending and when it expires, so that verification delay does not lose or misrepresent my choice. **US25-R32**
133. As a donor, I want change, reaffirm, clear or withdraw a pending preference predictably, so that late events do not undo my latest instruction. **US25-R33**
134. As a donor, I want choose saved, new or Express payment through one secure checkout, so that the convenient starting choice never bypasses financial review. **US25-R34**
135. As a donor, I want receive separate truthful saving and preference results, so that one successful step is not undone because the other needs attention. **US25-R35**
136. As a returning donor, I want restart from the last agreed terms of my canceled gift, so that familiar suggestions are accurate rather than reconstructed from payments. **US25-R36**
137. As a returning donor, I want restart only the exact selected lines, so that shared historical charges do not select siblings or substitute ministries. **US25-R37**
138. As a returning donor, I want see all newly applicable defaults and optional end, so that same-as-before suggestions do not carry hidden old instructions. **US25-R38**
139. As a returning donor, I want review the actual initial charges and continuing schedule, so that a future start or twice-monthly plan never conceals a charge today. **US25-R39**
140. As a returning donor, I want recover an unresolved restart from any repeated entry, so that another tab or transport key cannot multiply initial gifts. **US25-R40**
141. As a returning donor, I want understand old in-flight payments separately from my new gift, so that restart never revives canceled authority or hides unresolved collection. **US25-R41**
142. As a donor, I want choose a dated or indefinite pause in one straightforward form, so that I control the break without a guessed duration. **US25-R42**
143. As a donor, I want see payments before and after a scheduled pause, so that a future start or short pause has no concealed financial effect. **US25-R43**
144. As a donor, I want have pause boundaries preserve my existing schedule, so that a break suppresses gifts rather than creates debt or date drift. **US25-R44**
145. As a donor whose initial bank gift is processing, I want pause future giving before activation finishes, so that I can protect future intent without pretending the initial payment stopped. **US25-R45**
146. As a donor, I want have my agreed final horizon apply in every state, so that paused or pending giving cannot restart after its authorized end. **US25-R46**
147. As a donor, I want resume with a clear review of any eligible gift today, so that the same gesture cannot silently re-anchor or collect missed gifts. **US25-R47**
148. As a donor with a dated pause, I want resume automatically only while current conditions permit it, so that stored timers cannot collect through changed authority or controls. **US25-R48**
149. As a donor, I want skip an eligible gift or cancel directly, so that I can stop future intent without a forced retention journey. **US25-R49**
150. As a donor completing a payment repair, I want know whether the full original task is actually finished, so that a saved or verified method is not mistaken for repaired recurring giving. **US25-R50**
151. As a donor after a fully qualified repair, I want receive one quiet relevant review link when appropriate, so that I can consider the earlier failed gift without a debt or batch demand. **US25-R51**
152. As a donor, I want finish or review a repair without accidentally stopping or initiating payment, so that navigation and consequential recovery remain clearly different. **US25-R52**
153. As a donor with a card recovery opportunity, I want retry only the originally eligible scheduled gift, so that manual action cannot race automation or add recovery capacity. **US25-R53**
154. As a donor with an established returned bank gift, I want receive only the supported exact bank recovery option, so that card retry behavior is never copied into ACH. **US25-R54**
155. As a donor without fixed pledges, I want see no unsolicited fixed-pledge interface, so that an uncommon feature does not clutter my account or disclose hidden records. **US25-R55**
156. As a donor with a fixed campaign commitment, I want read my pledge and received-and-applied amount in a simple list, so that a promise is not mistaken for payment or debt. **US25-R56**
157. As a donor with a fixed pledge, I want inspect actual plans and linked gifts or recurring arrangements, so that relationships do not invent dates, payments or extra access. **US25-R57**
158. As a donor with a fixed pledge, I want send a concise change request and recover its receipt, so that I can ask staff without directly editing financial terms. **US25-R58**
159. As a donor who does not recognize a fixed commitment, I want send the exact commitment for protective authority review, so that disputing it does not require proving its original validity. **US25-R59**
160. As a donor and authorized pledge reviewer, I want understand request progress and its bounded private text custody, so that silence, reading or expiry cannot masquerade as a completed change. **US25-R60**
161. As a qualified pledge service contact, I want stop my own eligible reminders, so that stopping contact changes neither pledge nor another recipient preference. **US25-R61**
162. As a donor or representative, I want have every financial view and command honor current access, so that URLs, caches and privileged paths do not leak or move my data. **US25-R62**
163. As a donor using mobile or assistive technology, I want complete every reviewed journey with readable controls and stable focus, so that essential actions work without visual, keyboard or bandwidth barriers. **US25-R63**
164. As a source operations owner, I want diagnose delayed or inconsistent work through bounded existing operations, so that routine repairs do not require database editing or repeat payments. **US25-R64**
165. As a release engineer, I want verify complete donor outcomes at the approved test seams, so that mocked success cannot activate an unqualified financial or document lane. **US25-R65**
166. As a donor, I want retain truthful history and safe access through changes or rollout incidents, so that containment does not undo giving or restore unsafe old controls. **US25-R66**
167. As a financial authorizer or receipt recipient, I want receive only qualified required communications for my exact purpose, so that quiet settings neither suppress mandatory notices nor create message spam. **US25-R67**
168. As a donor and privacy/source operator, I want have each deadline apply only to its actual purpose, so that temporary choices expire without erasing financial evidence or reviving stale authority. **US25-R68**
169. As a donor, I want see only my currently authorized financial context, so that I can trust whose records I am viewing. **US25-D01**
170. As a donor with limited record rights, I want see only independently permitted amounts and labels, so that hidden ministry or family facts stay private. **US25-D02**
171. As a finance operator, I want have donor views agree with the same source revision, so that I can investigate discrepancies without editing portal totals. **US25-D03**
172. As an international donor, I want read exact original currency values, so that my gifts are not rounded or converted incorrectly. **US25-D04**
173. As a donor, I want recognize a split gift as one gift, so that I do not reconstruct it from transaction fragments. **US25-D05**
174. As a donor whose bank payment is processing, I want see the actual recorded outcome, so that I know the instruction was accepted without being told money has arrived. **US25-D06**
175. As a donor whose gift changes, I want understand original and current facts together, so that a refund or return is not mistaken for a failed gift. **US25-D07**
176. As a donor with two identical payments, I want retain both real gifts, so that similar dates and amounts do not merge my history. **US25-D08**
177. As a donor with offline or imported gifts, I want find all source-qualified records available here, so that platform entry method does not erase legitimate history. **US25-D09**
178. As a donor with noncash giving, I want see useful records without fabricated values, so that internal valuations are not confused with money or deductions. **US25-D10**
179. As a donor, I want open a gift directly and return to my place, so that reviewing details is effortless. **US25-D11**
180. As a donor, I want find new changes to an older gift, so that important corrections are not buried. **US25-D12**
181. As a donor on an unreliable connection, I want distinguish missing records from failed loading, so that I can recover without giving again. **US25-D13**
182. As a donor seeking help, I want reach the organization with relevant permitted context, so that I do not expose sensitive screenshots or processor identifiers. **US25-D14**
183. As a returning donor, I want start History with all available records, so that January does not make older gifts disappear. **US25-D15**
184. As a donor, I want choose readable date periods, so that I know exactly which dates are included. **US25-D16**
185. As a donor, I want filter several funds together, so that I can find the gifts connected to my chosen ministries. **US25-D17**
186. As a donor, I want filter by the amount I originally supported, so that fee cover or refunds do not change what the filter means. **US25-D18**
187. As a donor using multiple currencies, I want choose currency with amount bounds, so that the query cannot silently convert my choices. **US25-D19**
188. As a donor, I want apply or discard filter edits predictably, so that closing a form cannot change my history. **US25-D20**
189. As a donor with an invalid filter, I want correct my input without losing it, so that errors do not silently broaden the result. **US25-D21**
190. As a donor, I want use relevant secondary filters or find a gift, so that I can narrow history without a staff query builder. **US25-D22**
191. As a donor with long history, I want continue reading and scroll backward reliably, so that a large account remains usable. **US25-D23**
192. As a donor, I want keep meaningful position when history updates, so that new data does not interrupt what I am reading. **US25-D24**
193. As a donor changing accounts, I want have private working data retired, so that old records cannot appear in the new context. **US25-D25**
194. As a donor, I want find statements and receipts directly, so that I do not have to search transaction history first. **US25-D26**
195. As a donor with several official documents, I want recognize the right document, so that copies and retries do not look like additional receipts. **US25-D27**
196. As a donor with an optional support overview, I want distinguish it from official tax records, so that recognition is not confused with legal giving. **US25-D28**
197. As a donor, I want view, download and print available documents, so that I can keep my records without contacting staff. **US25-D29**
198. As a donor whose statement section fails, I want keep using my available receipts, so that one failure does not block the entire document area. **US25-D30**
199. As a donor awaiting a correction, I want get the current valid document, so that pending replacement does not serve an invalid fallback. **US25-D31**
200. As a recipient of a document link, I want reach only the permitted document, so that an exact handoff cannot expose an account library. **US25-D32**
201. As a donor needing another copy, I want request it only through the qualified document action, so that ordinary viewing never sends unexpected mail. **US25-D33**
202. As a donor with historical records, I want retain legitimate artifact access during rollout, so that new issuance darkness does not erase valid documents. **US25-D34**
203. As a recurring donor, I want quiet eligible routine receipt emails, so that I can reduce noise while keeping my acknowledgments. **US25-D35**
204. As a donor managing another legal donor, I want understand which receipt preference changes, so that my personal settings and represented giving do not mix. **US25-D36**
205. As a donor, I want see and save the actual receipt-email choice, so that a local toggle cannot pretend the server accepted it. **US25-D37**
206. As a donor turning routine emails off, I want understand prospective delivery, so that already queued mail is not a broken promise. **US25-D38**
207. As a donor filing before annual statements are ready, I want obtain the needed acknowledgment, so that quieting does not postpone documentation. **US25-D39**
208. As a donor, I want download the scope I am currently viewing, so that the file does not unexpectedly include different gifts. **US25-D40**
209. As a donor, I want adjust only my download filters, so that my browsing place and filters remain intact. **US25-D41**
210. As a donor reviewing an annual summary, I want download the same financial meaning, so that the file can explain the summary. **US25-D42**
211. As a donor, I want start one recoverable file preparation, so that double clicks and a lost response do not create duplicate jobs. **US25-D43**
212. As a donor, I want leave preparation running or cancel it explicitly, so that closing a window cannot cancel giving. **US25-D44**
213. As a donor, I want receive a complete file, so that a success state never hides truncation. **US25-D45**
214. As a donor returning to a prepared file, I want recognize its original scope and availability, so that a prior result cannot replace my current intent. **US25-D46**
215. As a donor downloading over a poor connection, I want retry the exact same authorized file, so that recovery cannot splice or regenerate its contents. **US25-D47**
216. As a donor whose permissions change, I want have future file access reflect current rights, so that an older file cannot bypass a new restriction. **US25-D48**
217. As an export operator, I want dispose of temporary files without losing business records, so that privacy cleanup cannot alter giving. **US25-D49**
218. As a donor opening a spreadsheet, I want read exact safe values, so that names or large identifiers cannot execute formulas or silently round. **US25-D50**
219. As a donor reading Home, I want understand this year so far, so that a simple amount has a clear basis. **US25-D51**
220. As a donor supporting organizations in different timezones, I want see the correct calendar periods, so that midnight does not misdate my giving. **US25-D52**
221. As a donor whose older gift is refunded, I want see the correct current-effective cohort, so that refund date is not confused with gift date. **US25-D53**
222. As a donor whose annual amount is zero, I want retain useful context and older access, so that I am not incorrectly treated as a new or lapsed donor. **US25-D54**
223. As a donor checking an annual amount, I want open matching History and then broaden it, so that the drill-through stays understandable. **US25-D55**
224. As a donor with an employer match, I want see known recorded progress and actual funds, so that I do not mistake an internal record for employer approval. **US25-D56**
225. As a donor without a visible original gift, I want find my admitted matching record, so that legitimate external matches are still understandable. **US25-D57**
226. As a donor with a partial or reversed match, I want see truthful current received facts, so that changes do not reverse my own gift or create debt. **US25-D58**
227. As a donor viewing older matching history, I want keep stable access without noise, so that a note edit does not rearrange my account. **US25-D59**
228. As a matching operations staff, I want record or correct actual source truth atomically, so that donor views cannot contradict settlements. **US25-D60**
229. As a matching operations staff, I want merge or reimport a genuine duplicate safely, so that prior receipt history and totals survive. **US25-D61**
230. As a DAF advisor, I want see received grants attributed to me, so that I can recognize support without confusing it with personal receipts. **US25-D62**
231. As a DAF advisor unfamiliar with tax terminology, I want understand why grants are absent from my annual contribution statement, so that I do not expect another deduction. **US25-D63**
232. As a DAF advisor with partial recognition, I want avoid mistaking attributed credit for the full grant, so that my view does not overstate support or reveal others. **US25-D64**
233. As a DAF advisor returning to older grants, I want read stable corrected history, so that date uncertainty does not hide records. **US25-D65**
234. As an ordinary donor without rare records, I want see no DAF, QCD or matching artifacts, so that my account stays calm and relevant. **US25-D66**
235. As a finance staff receiving an IRA gift, I want record the owner, custodian and intent distinctly, so that the gift receives the correct acknowledgment. **US25-D67**
236. As a finance staff with incomplete QCD evidence, I want preserve money while resolving the case, so that document readiness does not drive financial truth. **US25-D68**
237. As an IRA donor, I want understand my recorded intended QCD, so that the portal does not claim to determine my tax treatment. **US25-D69**
238. As an IRA donor, I want obtain my separate acknowledgment, so that I have the right document even when annual totals differ. **US25-D70**
239. As a donor with ordinary and IRA giving, I want understand different summary and document totals, so that informational giving is not mistaken for deductible giving. **US25-D71**
240. As a release owner, I want activate only qualified source-backed capabilities, so that a polished screen cannot certify missing authority. **US25-D72**
241. As a donor using assistive technology, I want complete record and document tasks without confusion, so that the polished UI remains usable for me. **US25-D73**
242. As an operations owner, I want detect and repair exact source failures, so that donors are not asked to correct the system. **US25-D74**

## Implementation Decisions

1. Preserve the existing donor/public/admin/missionary surface split and shared API/Auth/database/UI ownership. CRM and money remain in Asym Postgres; CMS owns published presentation. No retired CRM, new donor ledger, generic dashboard/request/notification engine or alternate permission system.
2. Use the existing P12 Tenant Authorization Context and current Active Tenant Assignment for authenticated humans; source grants narrow exact resources/purposes within it. Resolve personal, represented, reader, legal donor, employee/advisor, credential and document subjects independently. Every direct and privileged route enforces the same boundary.
3. Complete each named producer contract before enabling its consumer. Typed source results distinguish empty, limited, updating, unavailable and exact current facts. Proposed contracts and catalog entries are not evidence of active runtime behavior. Carry the explicit P3/P4/P7/P9/P12/P13/P14/P16/P18/P19 amendments into the owner implementation. Q25 additionally adopts the bounded P28/P12 guest-origin recipient projection and P32 automatic-enrollment exclusion under EX11–EX13/EX16 before consumer dispatch; neither whole future phase must be completed.
4. For mutations, validate exact current scope and expected source revision before atomic acceptance/result/audit. Preserve durable semantic identity, independently successful children, known no-effect and indeterminate outcomes. Same-operation reconciliation never becomes another charge, email, export or detach. Plain contact edits use the existing CRM change record, not a new provider journal.
5. Keep recurring intent, schedule, authorization, provider control, payment and finality distinct. Fixed-total pledges never own an automatic collection mandate. Replacement, Add, preference and Remove are independent effects. Resume preserves the grid; fully canceled restart is new authorization. Cards and ACH retain their source-specific recovery rules.
6. History, annual summary and CSV use their exact original/current/requested/matched meanings, currency/exponent, issuer date and source basis. No browser folds, loaded-page completeness, hidden sibling inference or mixed-currency/tax totals. Annual export preserves the full reviewed descriptor and exact source measure.
7. Documents resolve source-owned logical purpose/current artifact and protected bytes, independent of money status and new-issuance readiness. Ordinary viewing is unmetered as a product action and never issues/sends. DAF awareness, optional Support overview, ordinary contributions and IRA/QCD acknowledgments remain separately scoped.
8. Communication reading, delivery preferences, routine receipt quieting, notification engagement and newsletter requests retain their independent owners, subjects and cutoff points. The finite notification catalog and exact raw/detail/evidence lifetimes remain local to their purposes; no global do-not-email or TTL shortcut.
9. Use the shared stable compatible TanStack family with one request/cache owner and source-backed collections only where needed. Table/DB/Query/Store/Virtual have distinct roles. Lock compatible releases and adapter migrations; a beta pin or forced Labs override is not compatibility evidence. ReUI is a licensed reference, not a new required runtime dependency.
10. Preserve exact Maia composition, per-surface preview/continuation/order, stable focus and direct routes. Known rare-record irrelevance gives zero ordinary artifacts; explicit-route loading/errors remain truthful. Public published output never carries private viewer state or effect-admitting GET behavior.
11. Adopt the minimal recurring/fixed-pledge route separation and preserve supported old links. Retire reached fake receipt/raw export/profile/default/copy promises and alternate writers together. A hidden control does not close an unsafe API. Historical money and allowed artifact access survive lawful source correction and consumer containment.
12. Stage additive source/schema/contract/adapter changes before presentation. Prove N/N-1, backfill provenance, repeated delivery, concurrent writes, source correction and per-effect rollback. Gate new admission independently while accepted reconciliation, audit and disposal continue. Do not delete immutable facts or restore an unsafe fallback.
13. G01 requires a supported native account-linking control and direct-endpoint proof before affected social activation. Google/Apple/Facebook remain selected; no broker/fork, experimental isolation or provider removal is silently adopted. Independent safe work can proceed; whole-scope completion requires all accepted features or an explicit later scope ruling.
14. Apply the confirmed test strategy and exact release/operational gates. Runtime readiness, provider qualification, legal document review, accessibility/comprehension and workload evidence are separate from product ratification and this spec's structural checks.

## Testing Decisions

The confirmed primary seam is the actual donor journey through canonical APIs and isolated source data, using the existing main Playwright desktop/mobile harness. Existing axe, navigation and Web Vitals patterns accompany manual keyboard/focus/AT and specifically required donor comprehension. Each story maps to concrete positive/negative/boundary/failure outcomes, including exact returns, no-effect reads, partial/unknown recovery and current authority.

Supporting proof uses existing Vitest public-handler/owner seams for deterministic clocks and external boundaries; actual migrated restricted-role PostgreSQL with genuine concurrent connections for integrity/authorization/atomicity; and exact nonproduction native Auth/payment/email/renderer/storage qualification for effects and bytes the browser cannot prove. No new testing framework or private-helper suite per requirement.

Current donor History smoke accepts either live or unlinked; donation smoke stops before collection; Auth/database mocks and purpose-catalog tests have narrower proof. E2E wrappers can default demo bypass on, while opt-in Stripe-live tests can see external keys under broad unit discovery. The accepted implementation must explicitly isolate ordinary unit credentials/integration selection and assert real-source E2E mode. Missing mandatory fixtures/qualification are not skipped-green gates. No runtime/provider/database test is claimed merely because this specification validates.

Full test/prior-art/fixture/gate decisions are normative in Shared S05–S07 and the individual acceptance entries. Q29 includes at least six unfamiliar representative participants with zero observed critical DAF/QCD/document misconception after correction/retest. This is formative proof, not a population statistic. Documentation publication uses schema, reference, traceability and live-content verification, not artificial feature tests.

## Out of Scope

- Feature implementation, live donor/provider operations, a child implementation-ticket graph and production activation in this publication task.
- General household account access, church-member credit portal, public tribute walls, broad employer/sponsor access or a second credit ledger.
- A My messages inbox/Support Hub expansion, missionary external-newsletter list management, message families beyond those explicitly required by this specification, or automatic export notifications. The required identity-security and finite newsletter-request occurrences remain in scope.
- CMS-configurable dashboard builder, arbitrary donor report/query/column tools, XLSX/bulk-document archive or foreign historical artifact conversion/import.
- Currency conversion/FX comparisons, tax/RMD/age/deduction calculation, personal tax certification, generosity ranking or guessed ministry workflows.
- Silent alternate Auth architecture, experimental identity isolation, dropping selected providers, or treating email-only as completion of social scope.
- New generic CRM journal, contact book, mandatory phone verification, per-donor tax approval or unrequested preference ceremony.

## Further Notes

The **normative package** consists of this specification and the following documents. The source trace distinguishes adopted behavior, historical evidence, unexecuted proof and later supersession. It independently includes blockquoted and unnumbered requirements omitted by the old navigation index; no identifier count is used as semantic proof.

| Document                                                                           | Role                                                                                                         |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [Story acceptance criteria](phase-25-donor-dashboard-depth/acceptance.md)          | Every US25 story's independently verifiable outcomes and exact contract references                           |
| [Shared S01–S07](phase-25-donor-dashboard-depth/contracts/shared.md)               | Architecture, owner amendments, confirmed testing, qualifications and rollout                                |
| [Experience EX contract](phase-25-donor-dashboard-depth/contracts/experience.md)   | Home, navigation, Updates, preferences, notifications, ministry and newsletter                               |
| [Identity IC contract](phase-25-donor-dashboard-depth/contracts/identity.md)       | Exact access, account changes, link/code/social Auth and personal contact                                    |
| [Recurring RC contract](phase-25-donor-dashboard-depth/contracts/recurring.md)     | Recurring/Wallet/recovery/fixed-pledge behavior and source execution                                         |
| [Financial D contract](phase-25-donor-dashboard-depth/contracts/financial.md)      | History, filters, exports, annual measure, documents, matching, DAF and IRA                                  |
| [Clause traceability](phase-25-donor-dashboard-depth/traceability.md)              | Question/definition/addendum → normative section → acceptance story and proof disposition                    |
| [Source and evidence register](phase-25-donor-dashboard-depth/evidence.md)         | Current versus target, predecessor branches, exact prior-art limitations and primary references              |
| [Implementation task plan](phase-25-donor-dashboard-depth/implementation-tasks.md) | Ordered source/consumer/proof work with qualification and rollback boundaries; no implementation marked done |

The source checkpoint is Core develop `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Phase22 [PR1323](https://github.com/Asymmetric-al/core/pull/1323), Phase23 [PR1340](https://github.com/Asymmetric-al/core/pull/1340) and Phase24 [PR1558](https://github.com/Asymmetric-al/core/pull/1558) remain open specification predecessors as checked9September; their proposed contracts are consumed explicitly, not described as merged/shipped. Reconcile their final accepted versions before affected activation. Settled founder choices are not reopened.

The configured tracker maps ready-for-agent to **status:ready** with **type:feature** and **complexity:hard** for this specification. This signifies a fully described implementation/qualification work contract, not a passed native Auth gate or permission to claim release completion. All normal code review/source-owner safeguards still apply during future implementation.
