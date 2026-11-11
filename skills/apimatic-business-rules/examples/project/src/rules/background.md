# Rules for jobs Example Billing runs on its own

## renewal

- **silent**, state/side-effects: A renewal payment fails → The subscription moves to past_due and the payment is retried on days 3, 5 and 7; the subscription.cancelled webhook is sent if all retries fail. **Do:** Keep giving access while the subscription is past_due, and stop only on the subscription.cancelled webhook. *(text `rules/sources/billing-notes.txt:10-11`; `background.1`)*
