# ADR-IM-008: Move tail donors with one link, then end the rest with notice

**Status:** Accepted 2026-11-02 — ratified by the founder in the Phase 30 grill (Q8). Record: `docs/features/imports-migration/grill/decision-log.md` §1 Q8; journey map, 27 edge cases, acceptance criteria and the Q1–Q7 consistency check `grill/q08-tail-closure/` (`q08-adversarial-review.md`). Amends ADR-IM-001 (licence period, tail closure, moves) and ADR-IM-007 (cadence wording). Amended by ADR-IM-009 (2026-11-02, deceased donors' legacy gifts).

## Context

Legacy recurring gifts are not moved on switch day; each tail must close. Structured campaigns move roughly 75–90% of recurring donors (Tithe.ly: "75%+" within 4–6 weeks; Children's Aid Foundation of Canada kept 90% over about a year); church practice closes old systems in 6–12 weeks. Phase 16 always charges a new recurring gift immediately (P16:690, :2653) and Phase 25 bans anchor substitutes (P25R:153), so a naive move double-charges. No move link or campaign message exists, Phase 16 forbids direct-send workarounds, and the do-not-contact floor blocks even service mail (P03:401; ADR-0220:16). Payments Canada Rule H1 requires 30 calendar days' written notice to end a PAD (s.31) and allows 90-day claims; card disputes run 120 days, PayPal 180, US bank debits 60. Asym has no Canadian PAD rail; PayPal subscriptions cannot be transferred.

## Decision

Each Switch records one End date at go/no-go (default 10 weeks after campaign launch, never past the 12-month cap). A gift is ended only after a real offer: invitation at least 9 weeks and written end notice at least 30 calendar days before the End date, otherwise its End date extends automatically. The ministry's campaign launches after go-live (within 14 days, once card copies requested at scheduling land), sends one service email per donor (invitation, reminders at +7 and +21 days, end notice, final reminder, ended note), stages sending and pauses on bounces or complaints, with no SMS. One continue link and page: opening changes nothing; Keep is one tap; Change or Stop needs an email code; it shows the last old charge, first new charge and new statement name; after the End date the same link starts a new gift. Moves never double-charge: dates fixed at confirmation, staff cancel from a To-cancel list and record stop evidence, and the first Asym charge is the first original due date after that evidence, with no catch-up. Asym sends nothing to do-not-contact or deceased donors (the ministry records how any legal notice is met, pending a Phase 3 ruling); bounced donors go to a mail-or-call list; Canadian PAD donors are offered a card or their group is extended. The tail closes after the last old charge plus the reversal window, extended until open disputes resolve; SiteStacker may be switched off only after its last charge, the switch-off export taken after that charge is in custody, and its Q4 documents are issued. The manifest sealed at the Switch Boundary does not meet this gate. Progress, a per-donor timeline and the staff lists live on the Switch page; missionaries get a read-only status list. No Switch with recurring giving is offered until O12, O31 and O36–O40 are live.

## Considered options

- **Keep unmoved gifts running outside Asym (B):** rejected; no owner intake exists and imports would run indefinitely.
- **Extend until everyone moves (C):** rejected; the tail never closes.
- **Separate move and restart links; SMS; per-gift emails; switch-day invitations; a 12-month default campaign:** rejected for double-charge risk, dead ends, disabled channels, noise or timing conflicts.

## Consequences

- Owner requirements O36 (move-start), O37 (campaign messages and continue link), O38 (do-not-contact vs legal notices ruling), O39 (Canadian PAD rail or card-only), O40 (missionary list and donor-portal continue action), and an extended O12.
- Attrition is measured by donors and amount per path and week at the first switch, recalibrating the End date and the cap.
