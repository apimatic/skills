# Rules for jobs Example Billing runs on its own

## renewal

- **silent**, state/side-effects: A renewal payment fails → The subscription becomes past_due and the payment is retried on days 3, 5 and 7; if every retry fails, the subscription is cancelled and the subscription.cancelled webhook is sent. **Do:** Treat a past_due subscription as still being retried, and as ended only when the subscription.cancelled webhook arrives. *(docs `content/guides/billing.md`; `background.1`)*
