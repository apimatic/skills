# Rules for every request

- **loud**, auth/-: A request has no API key in the Authorization header, or the key is revoked → 401 "invalid_api_key". **Do:** Send a current API key in the Authorization header of every request. *(docs `content/guides/billing.md`; `every-request.1`)*
