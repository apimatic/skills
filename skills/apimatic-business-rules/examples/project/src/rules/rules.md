# Example Billing: business rules

7 rules (3 loud, 4 silent), each taken from the API definition, the docs or a page they link to. A loud rule makes the API refuse the request; a silent one gives a result with no error. Each line: loud or silent, then `<on>/<does>`, then when it applies → what the API does, then what the app must do, the source and the rule's id.

- `<on>`, what the API checks: `auth` credentials, scopes or roles; `state` the state of a resource; `order` something that must exist or happen first; `account-config` an account, site or feature setting; `idempotency` repeated or duplicate requests; `resilience` retries, timeouts, what to do on 429 or 5xx; `limits` rate, size or count limits; `other` anything else; `-` nothing beyond the request itself.
- `<does>`, what happens that the API definition does not show: `side-effects` what else a call changes, creates, charges or sends; `webhooks` events the API sends; `lists` page sizes, default order, filters; `values` values the API computes, defaults, rounds or converts; `errors` what an error means, or when it is returned; `other` anything else; `-` nothing more.

- Rules for every request: `every-request.md` (1 rule).
- Rules for jobs the API runs on its own (renewals, retries, webhooks it sends): `background.md` (1 rule).
- Rules by operation: the file below, one section per operation, headed with its route. A rule on several operations is listed under each.

| Operation | File | Rules |
|---|---|---|
| `POST /subscriptions` (`createSubscription`) | `operations/subscriptions.md` | 4 |
| `POST /subscriptions/{id}/cancel` (`cancelSubscription`) | `operations/subscriptions.md` | 1 |
| `POST /plans/{plan_id}/prices` (`createPlanPrice`) | `operations/plans.md` | 1 |
