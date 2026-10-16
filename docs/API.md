# API and integration structure

The portfolio has **one application HTTP endpoint: `POST /api/rook`**. Portfolio content comes from local data modules. Contact delivery uses the EmailJS browser SDK directly when configured; there is no `/api/contact` route. Analytics is optional and separate from application behavior.

## Rook request path

```text
RookDialog → useRookConversation → services/rookClient
  → POST /api/rook
  → server/rook.mjs
    → rook/validation.mjs
    → rook/provider.mjs + rook/context.mjs
  → DeepSeek chat completions
```

Vite's development/preview middleware and `functions/index.mjs` use the same handler factory. Firebase Hosting maps `/api/rook` to the configured `rook` function. The existing deployment configuration controls whether that backend rewrite is enabled.

### Request

```http
POST /api/rook
Content-Type: application/json
```

```json
{
  "messages": [{ "role": "user", "content": "What does Raj work on?" }]
}
```

The shared definitions are `ROOK_ENDPOINT` and `ROOK_LIMITS` in `src/data/rookContract.js`.

| Constraint                | Current value                                                           |
| ------------------------- | ----------------------------------------------------------------------- |
| History                   | 1–12 messages                                                           |
| Roles                     | `user` or `assistant`; the final message must be `user`                 |
| Content                   | Nonempty string; at most 2,000 JavaScript string code units per message |
| Request body              | At most 24,000 bytes                                                    |
| Provider timeout          | 25 seconds                                                              |
| Per-client limiter        | 30 requests per 60-second window, within one handler instance           |
| Concurrent provider calls | At most 4 per handler instance                                          |

The browser keeps at most the latest 12 valid messages, truncates message content to the wire limit, and drops oldest history entries until the encoded JSON also fits the byte budget. The server validates independently and rejects invalid requests; it does not trust browser validation. It accepts Firebase's `rawBody` or a Node request stream. Stream chunks are combined as bytes before UTF-8 decoding. Client-supplied system roles are rejected. Extra message properties are stripped before constructing the provider request.

### Success

```json
{
  "answer": "Raj develops reusable native iOS components.",
  "source": "deepseek",
  "model": "deepseek-flash"
}
```

The endpoint returns one JSON response; it does not stream tokens. Provider requests use the server-owned system prompt, disabled thinking, a 400-token output limit and temperature 0.2. `DEEPSEEK_API_KEY` stays server-side. Local configuration can select `DEEPSEEK_MODEL`; the response records the provider-returned model when available.

### Errors

All application errors are JSON objects of the form `{"error":"code"}`. Responses use `Cache-Control: no-store` and `X-Content-Type-Options: nosniff`. Provider response bodies and credentials are not forwarded.

| HTTP | Error codes                                                                   |
| ---- | ----------------------------------------------------------------------------- |
| 400  | `invalid_json`, `invalid_messages`                                            |
| 405  | `method_not_allowed`; `Allow: POST`                                           |
| 413  | `input_too_large`                                                             |
| 415  | `json_required`                                                               |
| 429  | `rate_limited`, `busy`, `provider_rate_limit`                                 |
| 502  | `provider_balance`, `provider_auth`, `provider_unavailable`, `empty_response` |
| 503  | `not_configured`                                                              |
| 504  | `timeout`                                                                     |

The local rate-limit response includes `Retry-After`. Limit state is process-local and resets on restart; it is not a distributed abuse-prevention service. The response disconnect hook aborts an outstanding provider request, and concurrency/timers/listeners are released in `finally`.

### Browser fallback and UI ownership

Network, non-JSON, provider or contract failures produce a client-side answer from `services/rookFallback.js`. This is explicitly labeled with client metadata `source: preset`; the server never presents a saved answer as a provider success. Cancellation is propagated instead of silently substituting a fallback.

Live and fallback answers share the same browser-owned guidance model. `rookConversationModel.js` resolves the visitor's topic against the public portfolio, attaches related section/project links, and chooses up to three unused contextual questions. These are related portfolio links, not generated citations or proof that every model claim was independently verified. Short follow-ups are qualified with the prior topic for both answer paths. Per-answer source metadata keeps the saved-answer notice attached to the answer it describes.

Explicit commands such as “show projects,” “contact Raj,” and “open Raj’s résumé” are handled locally before any HTTP request. Only known chapters and the existing résumé action are accepted. Ordinary questions do not trigger automatic scrolling. Model output and action-like text never execute navigation. The hook invokes app callbacks; the app closes Rook, scrolls and focuses the requested chapter, or opens the theme-appropriate PDF directly from the visitor interaction. Related internal links use the same callbacks. Service code does not query the DOM, control scrolling, send contact email or store leads.

Conversation metadata and evidence URLs stay in browser memory. The HTTP client sends only `role` and `content`; the endpoint's request/response schema is unchanged.

## Contact integration

`ContactSection → useContactForm → contactModel/contactService → EmailJS`.

The model validates a name, reply email and message and constructs the encoded `mailto:` fallback. The hook manages validation feedback, focus, clipboard feedback and duplicate-submission protection. The service loads EmailJS only for a configured submission and forwards `{name, email, message}`. It rejects missing configuration instead of returning a false success.

`VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID` and `VITE_EMAILJS_PUBLIC_KEY` are browser-visible configuration. Without them, the UI offers an email draft and disables direct delivery. No contact message was sent as part of this refactor's checks.

## Analytics integration

`App → scheduleVisitAnalytics → deferred Firebase app/analytics SDKs`.

Analytics requires the Firebase web app identifiers and measurement ID, skips localhost, schedules work during idle time and records the existing visit event once. It is fail-soft and exposes no application HTTP route. There is no client-side Firestore application flow in this portfolio.

## Verification boundary

The existing Rook tests use injected/mocked provider calls and verify validation, timeout, cancellation, sanitized errors, limits, fallback metadata and Firebase request adaptation. They do not prove the production provider credential, deployed backend availability or actual email delivery. Those require separate environment-specific checks.
