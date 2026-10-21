# Q43 frontier — a pending signup after its Page entry is hidden

Reviewed October 18, 2026. This is fresh primary-source research for the next
Grill with Docs question, not a decision made for the founder, a formal spec,
implemented behavior or runtime proof. No previous programs were run and no
application, database, subscriber, provider or live configuration was changed.

## Current owner and vocabulary boundary

The founder's latest instruction ratifies D42 and its amendment. D42 explicitly
reserves pending confirmation after Page-entry Off for a separate decision:
[scope](../phase28-d42-verified-email-newsletter-signup-adversarial-review.md)
and C24. Its P33 likewise requires the policy to be adopted before claiming its
tests pass. D42's immediate verified-address Join does not answer this pending
email-confirmation branch.

[D6-C07](../phase28-d6-adversarial-review.md) proposed allowing an already
accepted pending occurrence to finish after entry-only Off within its original
validity and current purpose/recipient restrictions. That proposal remains an
unadopted recommendation until the founder answers this question. Do not present
it as already settled by D42 ratification or silently adopt the separate D6
timing/retention numbers.

The current [glossary](../../../../../CONTEXT.md) distinguishes:

- **Public newsletter signup entry:** the optional invitation on an exact
  ministry Page; showing/hiding it is distinct from Page reach, existing
  subscriptions and permission to send.
- **Native newsletter subscription:** deliberate participation in one named
  newsletter, without implied donation, protected-reading or other-newsletter
  rights.
- **Verified-address newsletter signup:** a new deliberate instruction using
  qualified current address evidence; sign-in alone is not consent and retry is
  not rejoin.

These definitions make the outstanding question narrow: what happens to a
request already accepted through this entry but still awaiting the reader's
email confirmation when the missionary later hides that entry?

## Fresh primary comparisons

Four official pages were opened for this review. Their exact findings are
limited; none explicitly documents the precise after-hide/pending-confirmation
race proposed for Core. They support a separation of concepts, not a claim that
every competitor implements the recommended outcome.

| Official source                                                                                                                | Verified fact                                                                                                                                                                                                                                       | Useful implication and limit                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Mailchimp — Create a Landing Page](https://mailchimp.com/help/create-a-landing-page/)                                         | A landing page is associated with an audience. It can be unpublished, edited and republished. Unpublished and deleted page URLs show a 404. Mailchimp recommends unpublishing instead of deleting when retaining the page's reporting data matters. | Page availability and retained business data are separate controls. Do not copy its 404 as Core's confirmation-link experience or claim this page proves pending confirmation survives unpublishing.                                                                                                      |
| [Ghost — Setting up email newsletters](https://ghost.org/help/setup-email-newsletters/)                                        | Individual newsletters have separate subscriptions and settings. Archiving a newsletter makes it unavailable to members and unavailable when publishing new posts.                                                                                  | Closing the newsletter itself has a wider scope than hiding one Page invitation. Do not infer exact pending-link behavior, retention or consent erasure from Ghost's archive wording.                                                                                                                     |
| [Kit — The Confirmation Email](https://help.kit.com/en/articles/2502655-the-confirmation-email)                                | Form/Landing Page settings configure the confirmation email and subsequent confirmation destination. Disabling its confirmation email also disables its double opt-in behavior; auto-confirmation is another setting.                               | Confirmation is a distinct lifecycle step with its own clear destination. Core should not copy a switch that accidentally changes proof requirements, nor add a new confirmation-policy setting for this already-pending case. This page does not establish unpublish/confirmation concurrency semantics. |
| [Kit — Why do I have unconfirmed subscribers?](https://help.kit.com/en/articles/4008773-why-do-i-have-unconfirmed-subscribers) | Dated August 4, 2026. Readers may delay checking email, miss the message or change their minds. Administrators cannot confirm an unconfirmed subscriber on that person's behalf.                                                                    | Allowing time for a reader to finish an accepted request is a normal journey consideration. Preserve explicit reader confirmation; do not substitute staff action or unsolicited reminder campaigns. The page supplies no benchmark for Core's deadline or this exact Off behavior.                       |

No authenticated product account, mailbox test, support interview, ministry
user feedback, conversion experiment or legal analysis was performed. No claim
is made that the recommendations are statistically established or universally
required by email law.

## Recommended single decision

**Recommend A: let the reader finish the already accepted request.** Hiding the
Page entry stops new requests through that entry. A previously accepted request
may still be confirmed before its original deadline while its exact newsletter
and recipient remain eligible. Purpose closure, withdrawal, expiry and stronger
restrictions still prevent activation.

This keeps a control labeled **Show newsletter signup on this page** about
offering that entry. It does not unexpectedly cancel an email instruction the
reader already received. It also makes the completed D42 immediate path and
pending path less arbitrarily different: timing of the reader checking their
inbox is not itself a request to withdraw.

The strongest alternative is **B: hiding the entry also stops pending requests
accepted through it**. That yields a stricter stop for the missionary, but gives
the visibility control an additional cancellation effect and can strand readers
who were already told how to finish. If selected, both staff helper text and
confirmation outcomes must state this scope honestly; do not describe it merely
as hiding a form. This is a valid product tradeoff, not a factual question for
research to decide.

No extra tenant setting, per-entry rule matrix, grace period, new deadline or
additional confirmation dialog is needed for either answer. Existing broader
purpose/safety controls retain their own current authority. The founder chooses
one ordinary lifecycle rule; staff use the existing control.

## Plain user journey if A is selected

- Staff retain the existing Page control. Concise helper copy: **Hides signup
  from this page. Earlier requests can still be confirmed before they expire.
  Existing subscribers are unchanged.** Explain wider stopping actions only in
  their existing owner surface; do not add a new cancellation dashboard.
- A reader with a still-valid accepted request sees the same exact named
  newsletter and explicit **Confirm subscription** action. Do not send them
  back to the now-hidden entry or require a new account, new request or donation.
- A stale form cannot create a new request after Off, including through D42's
  immediate path. A pending occurrence is not a general bypass for new signups,
  another newsletter or a different destination.
- Expired or no-longer-eligible requests show a calm accurate unavailable
  result. Offer a new request only if a current authorized entry exists. Avoid
  disclosing destination-specific restrictions in public responses.
- Reopening the entry neither resets the original deadline nor revives expired,
  withdrawn, superseded or otherwise stopped requests. Resend/retry cannot
  manufacture new lifetime or consent. Any permitted resend remains bounded by
  the existing accepted occurrence and current delivery authority.

## Minimum proof implications for the eventual answer

1. Order pending-request acceptance, entry Off and explicit confirmation. Under
   A, an accepted eligible occurrence can finish after Off; under B, it cannot.
   Neither answer permits a request first accepted after Off through that entry.
2. Existing accepted immediate subscriptions and unrelated entries remain
   unchanged by this entry-only action.
3. Purpose closure, withdrawal and stronger current restrictions retain their
   independently qualified effects; a weaker entry choice cannot reverse them.
4. An expired occurrence remains expired at the exact source boundary, with no
   deadline reset from retry, resend or Off→On. The deadline's actual supported
   value remains a separate decision.
5. A lost confirmation response recovers the same effect and current state;
   duplicate confirmation cannot create duplicate membership or resurrect after
   later withdrawal. Opening/scanning the link alone remains inert.
6. Staff and reader copy, actual persisted outcomes and owner evidence agree;
   no fake success or generic 404 replaces useful permitted explanation.

This research recommends the next question and its clearest default. It does
not record A as selected, adopt all D6 amendments or close the remaining pending
proof/retention frontier.
