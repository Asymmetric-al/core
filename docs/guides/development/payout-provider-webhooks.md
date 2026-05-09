# Payout Provider Webhooks

Last verified: 2026-05-02

This document records provider webhook evidence for future Mission Control Payouts phases. It is not implementation code. Future webhook handlers must verify raw provider signatures, store idempotent event records, and update payout state only through `packages/api/src/*` services.

## Shared Webhook Rules

Future implementation must:

- Read the raw request body before parsing.
- Verify provider signature using tenant-owned provider account secrets.
- Match the provider object IDs in the payload back to a tenant-owned provider account before trusting tenant context.
- Store each event in an idempotent event log with provider, event ID, event type, received timestamp, raw payload, and processing status.
- Return success for duplicate events already stored.
- Process status changes in provider occurrence order when the provider supplies event timestamps.
- Never expose raw payloads, credentials, signatures, full bank details, or provider balances to missionaries.
- Keep app API route files as thin re-exports when webhook endpoints are added.

## Wise

Official docs:

- [Webhook event types](https://docs.wise.com/api-docs/webhooks-notifications/event-types)
- [Transfer webhook guide](https://docs.wise.com/guides/product/send-money/use-cases/correspondent/webhooks.md)
- [Webhook subscriptions API](https://docs.wise.com/api-docs/api-reference/webhook)
- [Transfer tracking guide](https://docs.wise.com/guides/product/send-money/tracking-transfers)

Events to support:

| Wise event                 | Use                                  | Internal mapping note                                                                                                                                                                                                   |
| -------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transfers#state-change`   | Primary transfer status update       | Map `incoming_payment_waiting` and `incoming_payment_initiated` to awaiting/funding states, `processing` and `funds_converted` to processing, `outgoing_payment_sent` to sent/completed depending product status model. |
| `transfers#payout-failure` | Failure details after payout failure | Store failure reason and keep separate from state-change handling.                                                                                                                                                      |
| `transfers#refund`         | Refund/returned funds                | Map to returned/refunded state after reconciliation.                                                                                                                                                                    |
| `balances#update`          | Balance/funding state                | Refresh provider funding snapshot where supported.                                                                                                                                                                      |
| `transfers#active-cases`   | Processing issue or case             | Map to provider action required or manual review.                                                                                                                                                                       |

Wise transfer state mapping:

| Wise state                   | Internal state category                       | Notes                                                                                                    |
| ---------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `incoming_payment_waiting`   | Awaiting funding                              | Transfer is submitted and Wise is waiting for funding to be initiated.                                   |
| `incoming_payment_initiated` | Funding initiated                             | Funding has started but Wise has not received funds yet.                                                 |
| `processing`                 | Processing                                    | Wise has received funds and is running processing, compliance, fraud, or other behind-the-scenes checks. |
| `funds_converted`            | Processing / ready to send                    | Compliance checks are complete and funds have been converted.                                            |
| `outgoing_payment_sent`      | Sent / provisionally completed                | Wise has sent funds; do not treat as irrevocably complete because later payout failure can still occur.  |
| `bounced_back`               | Failed / returned pending                     | Payment failed after send; store the failure signal and wait for cancellation/refund reconciliation.     |
| `cancelled`                  | Canceled final                                | Transfer was never funded and was not processed.                                                         |
| `funds_refunded`             | Returned/refunded final                       | Funds were refunded; reconcile refund amount and currency from `transfers#refund`.                       |
| unknown or unmapped state    | Manual review / provider status needs mapping | Store raw state server-side and block automated execution transitions until explicitly mapped.           |

Payload and idempotency:

- State-change payload includes resource identifiers, `current_state`, `previous_state`, and `data.occurred_at`.
- Wise warns events may not arrive in occurrence order. Use `data.occurred_at` for reconciliation.
- Event ID/signature details must be re-read from current Wise webhook docs before implementation.

Proof trigger:

- Fetch receipt PDF after `outgoing_payment_sent`.
- Fetch payout information after `outgoing_payment_sent`; banking partner info may take up to 3 days.

Confirmation gaps:

- Exact webhook signature validation algorithm and tenant subscription scope are `needs provider confirmation`.

## Airwallex

Official docs:

- [Transfer statuses](https://www.airwallex.com/docs/payouts__create-a-transfer__transfer-statuses)
- [Transfer webhook event types](https://www.airwallex.com/docs/developer-tools/webhooks/listen-for-webhook-events/event-types/transfers)
- [Transfer webhook payload examples](https://www.airwallex.com/docs/developer-tools/webhooks/listen-for-webhook-events/payload-examples/transfers)
- [Sandbox environment overview](https://www.airwallex.com/docs/developer-tools/sandbox-environment/sandbox-environment-overview.md)

Transfer events to support:

| Airwallex event                     | Internal mapping note                                                        |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| `payout.transfer.in_approval`       | Awaiting provider approval.                                                  |
| `payout.transfer.approval_recalled` | Provider approval recalled; return to editable/provider action state.        |
| `payout.transfer.approval_rejected` | Provider rejected approval; failed or action required depending final model. |
| `payout.transfer.approval_blocked`  | Provider approval blocked; provider action required.                         |
| `payout.transfer.scheduled`         | Provider accepted/scheduled.                                                 |
| `payout.transfer.overdue`           | Funding overdue; provider action required.                                   |
| `payout.transfer.processing`        | Processing.                                                                  |
| `payout.transfer.sent`              | Sent, but not necessarily settled by partner.                                |
| `payout.transfer.paid`              | Completed/paid.                                                              |
| `payout.transfer.failed`            | Failed.                                                                      |
| `payout.transfer.cancelled`         | Canceled/returned funding as applicable.                                     |

Airwallex transfer status mapping:

| Airwallex status    | Internal state category                 | Notes                                                                                                 |
| ------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `IN_APPROVAL`       | Awaiting provider approval              | Approvers review the transfer in Airwallex before it can proceed.                                     |
| `APPROVAL_RECALLED` | Provider approval recalled / editable   | Return to an editable provider-action state; do not execute until resubmitted and approved.           |
| `APPROVAL_REJECTED` | Provider rejected / action required     | Keep failed vs action-required distinction based on final failure reason and product state model.     |
| `APPROVAL_BLOCKED`  | Provider blocked / action required      | Surface provider blocker to finance and pause automation.                                             |
| `SCHEDULED`         | Scheduled / awaiting processing         | Funding and transfer are scheduled; continue checking funding state.                                  |
| `OVERDUE`           | Funding overdue / action required       | Requires funding remediation or cancellation handling.                                                |
| `PROCESSING`        | Processing                              | Airwallex is processing; may transition to `SENT` or `FAILED`.                                        |
| `SENT`              | Sent / not fully settled                | Funds left Airwallex but can still fail banking-partner processing.                                   |
| `PAID`              | Completed / paid                        | Banking partner processed successfully, but later local clearing or recipient-bank failure can occur. |
| `FAILED`            | Failed                                  | Retrieve failure reason and expect automatic cancellation handling where applicable.                  |
| `CANCELLED`         | Canceled / returned funding as needed   | Transfer is canceled; reconcile paid amount and any fees returned to the wallet.                      |
| unknown or unmapped | Manual review / provider status mapping | Store raw state server-side and block automated execution transitions until explicitly mapped.        |

Funding events to support:

| Airwallex event                                         | Internal mapping note                        |
| ------------------------------------------------------- | -------------------------------------------- |
| `payout.transfer.funding.requires_funding_confirmation` | Awaiting provider auth/funding confirmation. |
| `payout.transfer.funding.scheduled`                     | Funding scheduled.                           |
| `payout.transfer.funding.processing`                    | Funding processing.                          |
| `payout.transfer.funding.funded`                        | Funded.                                      |
| `payout.transfer.funding.failed`                        | Funding failed.                              |
| `payout.transfer.funding.cancelled`                     | Funding canceled.                            |
| `payout.transfer.funding.reversed`                      | Funding reversed; reconcile return.          |

Airwallex funding status mapping:

| Airwallex funding status        | Internal state category                   | Notes                                                                                          |
| ------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `REQUIRES_FUNDING_CONFIRMATION` | Awaiting provider funding confirmation    | Finance/provider action is required before funds can be deducted or reserved.                  |
| `SCHEDULED`                     | Funding scheduled                         | Confirm sufficient wallet or linked-account balance before transfer date.                      |
| `PROCESSING`                    | Funding processing                        | Continue polling/webhook reconciliation, especially for wallet-funded transfers.               |
| `FUNDED`                        | Funded                                    | Funding succeeded; transfer status still determines final payout status.                       |
| `FAILED`                        | Funding failed                            | Retrieve failure reason and block execution until resolved.                                    |
| `CANCELLED`                     | Funding canceled                          | No automated payout execution should proceed from this state.                                  |
| `REVERSED`                      | Funding reversed / returned funds problem | Reconcile wallet deduction and return details; keep finance-visible warning.                   |
| unknown or unmapped             | Manual review / provider status mapping   | Store raw state server-side and block automated execution transitions until explicitly mapped. |

Payload and idempotency:

- Payload examples include `id`, `name`, `account_id`, and `data` shaped like Get transfer by ID.
- Transfer `request_id`, transfer `id`, and webhook event `id` should be stored for idempotency and correlation.

Proof trigger:

- Generate confirmation letter after transfer state/proof availability allows it.
- `NO_FEE_DISPLAY` format should be considered for missionary-visible documents.

Confirmation gaps:

- Exact Airwallex webhook signature verification details must be re-read before implementation.

## Currencycloud

Official docs:

- [Push notifications / webhooks](https://developer.currencycloud.com/guides/platform-specifics/push-notifications)
- [SCA for API payments](https://developer.currencycloud.com/guides/integration-guides/sca_sponsored_api_payments)
- [API reference](https://developer.currencycloud.com/api-reference/)

Events to support:

| Currencycloud notification type    | Internal mapping note                         |
| ---------------------------------- | --------------------------------------------- |
| Ready To Send Notification         | Provider accepted/ready-to-send state.        |
| Payment Released Notification      | Sent/processing depending payout state model. |
| Payment Failed Notification        | Failed with provider reason.                  |
| Cash Manager Trade Notification    | Conversion state update.                      |
| Funds Arrived Notification         | Funding/balance update.                       |
| Trade Settled Notification         | Conversion settled.                           |
| Trade Closed Notification          | Conversion closed.                            |
| Deposit Arrived Notification       | Funding/inbound funds update.                 |
| Bank Account Verified Notification | Beneficiary verification readiness.           |

Payload and idempotency:

- Push notification examples include a `header` with `message_type` and `notification_type`, plus a `body` with provider IDs and statuses.
- Examples show an `x-hmac-digest-sha-512` header.
- Store provider IDs from body fields such as payment, conversion, balance, transaction, or related entity IDs.

Proof trigger:

- Fetch payment confirmation after payment release/completion.
- Fetch payment submission information for MT103 or pacs.008 where available.
- Fetch payment tracking information for investigation and reconciliation.

Confirmation gaps:

- Webhook endpoint setup requires contacting a Currencycloud Solutions Manager.
- Exact event subscription setup, HMAC key lifecycle, and tenant-specific notification availability are `needs provider confirmation`.

## Corpay

Official docs:

- [Corpay webhooks](https://developer.crossborder.corpay.com/apidocscrossborder/webhooks)
- [2-token auth](https://developer.crossborder.corpay.com/apidocscrossborder/2-token-auth/webhooks)
- [Payment tracking](https://developer.crossborder.corpay.com/apidocscrossborder/payment-tracking-1)
- [Payment channel information](https://app.theneo.io/corpay/apidocscrossborder/payment-tracking/get-payment-channel-information)

Events to support:

| Corpay event            | Internal mapping note                                              |
| ----------------------- | ------------------------------------------------------------------ |
| `PaymentAccepted`       | Sample payload event; map to provider accepted after confirmation. |
| `PaymentProcessed`      | Mentioned in docs; map to sent/processing depending payload.       |
| `PaymentOnHold`         | Mentioned in docs; provider action required/manual review.         |
| Funds received events   | Funding/reconciliation updates.                                    |
| Client onboarded events | Provider account/capability updates.                               |

Payload and idempotency:

- Sample payload includes `EventType`, `CreatedDate`, `ClientCode`, `Id`, and `MessageId`.
- Use `MessageId` for idempotency if confirmed by Corpay implementation docs.
- Match `ClientCode` and payment IDs against tenant-owned provider account records.

Signature verification:

- Corpay sends `Corpay-Signature`.
- Public docs describe a Unix timestamp plus SHA1 HMAC style encrypted key.
- Exact validation method/key is provided during implementation and is `needs provider confirmation`.

Proof trigger:

- After payment has been successfully instructed and funds have left Corpay bank, Payment Channel Information can return MT103 or pacs.008 for wire payments.
- If zero messages are returned, the docs say funds may not have left Corpay bank yet.

Confirmation gaps:

- API access, webhook event catalog, signature validation, payment tracking IDs, sandbox setup, and provider-side approvals are account-managed and `needs provider confirmation`.

## Stripe Global Payouts / Treasury

Official docs:

- [Manage payouts](https://docs.stripe.com/global-payouts/manage-payouts)
- [Stripe-hosted recipient creation](https://docs.stripe.com/global-payouts/stripe-hosted-recipient-creation)
- [Webhooks](https://docs.stripe.com/webhooks)
- [Send money](https://docs.stripe.com/global-payouts/send-money)

Events to support:

| Stripe event                    | Internal mapping note                                                        |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `v2.core.account_link.returned` | Hosted recipient form returned; refresh recipient requirements/capabilities. |
| `outbound_payment.created`      | Provider payout created.                                                     |
| `outbound_payment.posted`       | Posted/sent; recipient bank may still delay release.                         |
| `outbound_payment.failed`       | Failed; funds voided/returned to tenant.                                     |
| `outbound_payment.canceled`     | Canceled before posting.                                                     |
| `outbound_payment.returned`     | Returned after failing to arrive at destination.                             |

Payload and idempotency:

- Use Stripe event ID for idempotency.
- For API v2 thin events, retrieve related object as recommended by Stripe docs.
- Some organization event destinations include context; set `Stripe-Context` when retrieving related objects if needed.

Signature verification:

- Use raw request body and `Stripe-Signature` header with tenant webhook endpoint secret.
- Do not parse JSON before signature verification.

Proof trigger:

- Retrieve OutboundPayment and use `receipt_url` when present.
- Store trace ID when present for bank investigation.

Confirmation gaps:

- Exact event names and API version must be re-verified for the tenant's enabled Global Payouts/Treasury preview version.

## Status Mapping Principles

Future implementation should maintain a provider-specific status map, not one shared string switch. Initial internal state categories:

- Draft or ready before provider call.
- Awaiting internal approval.
- Awaiting provider auth or approval.
- Provider accepted or scheduled.
- Funding pending/processing.
- Processing.
- Sent.
- Completed/paid.
- Failed.
- Returned/refunded.
- Canceled.
- Manual review/provider action required.

Unknown provider statuses must be stored, surfaced to finance, and mapped to manual review until explicitly handled.
