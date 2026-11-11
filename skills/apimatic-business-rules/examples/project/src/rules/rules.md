# Example Billing: business rules

6 rules (3 loud, 3 silent). A loud rule makes the API refuse the request; a silent one gives a result with no error. Each line: when it applies → what the API does, then what the app must do, the source and the rule's id.

- Rules for every request: `every-request.md` (1 rule).
- Rules for jobs the API runs on its own (renewals, retries, webhooks it sends): `background.md` (1 rule).
- Rules by operation: the file below, one section per operation. A rule on several operations is listed under each.
- The material these rules were written from: `sources/`.

| Operation | File | Rules |
|---|---|---|
| `POST /subscriptions` (`createSubscription`) | `operations/subscriptions.md` | 3 |
| `POST /subscriptions/{id}/cancel` (`cancelSubscription`) | `operations/subscriptions.md` | 1 |
| `POST /plans/{plan_id}/prices` (`createPlanPrice`) | `operations/plans.md` | 1 |
