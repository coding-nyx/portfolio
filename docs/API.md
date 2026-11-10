# API and integration structure

The portfolio Firebase backend exposes **`POST /api/rook`**. First-party visitor collection uses the separate Footfall collector described below. Portfolio content comes from local data modules. Contact delivery uses the EmailJS browser SDK directly when configured; there is no `/api/contact` route. Analytics is optional and separate from application behavior.

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

The public contact address is `hello@iamnyx.dev`. Cloudflare Email Routing forwards incoming mail to the verified owner inbox. The EmailJS template's recipient is also `hello@iamnyx.dev`; its sender remains the connected Gmail service, with `NYX Portfolio` as the display name and `{{email}}` as Reply-To. A forwarding address does not provide outgoing SMTP credentials. Recipient, forwarding and any allowed-origin settings are managed in the provider dashboards, not in client environment variables. Verify actual delivery separately from an EmailJS success response; Gmail may classify forwarded notifications as spam.

On 2026-10-22, a dashboard test returned `200 OK` and the owner confirmed arrival in Spam. After updating the sender display name and subject, a submission through the local portfolio in Brave showed `Message sent`, and the owner confirmed Inbox delivery. This verifies that tested path at that time, not future spam classification or production-origin behavior.

## Analytics integration

`App → scheduleVisitAnalytics → deferred Firebase app/analytics SDKs`.

The Google integration requires Firebase web app identifiers and a measurement ID, skips localhost, runs during idle time and records `portfolio_visit` once per document load. The former `login` event was misleading and has been renamed. Automatic Google page views remain separate; no duplicate manual page-view event was added. There is no client-side Firestore application flow.

The same app effect starts independent Footfall collection through `services/footfallAnalytics.js`. The app observes section reach and known link activations; project, contact and Rook boundaries report their actions. Events are `page_view`, `section_view`, `project_open`, `resume_open`, `outbound_click`, `contact_result`, `contact_draft_open` and `rook_open`. The public vocabulary is in `data/footfallContract.js`. Contact/Rook contents are excluded. The footer provides disclosure and a saved opt-out; DNT/GPC skip both integrations.

```http
POST /api/footfall/events?property=portfolio
Content-Type: application/json
```

```json
{
  "version": 1,
  "events": [
    {
      "eventId": "UUID",
      "name": "project_open",
      "visitorId": "UUID",
      "sessionId": "UUID",
      "occurredAt": 1794210000000,
      "path": "/",
      "referrer": null,
      "context": { "project_id": "worktracker", "entry_point": "grid" }
    }
  ]
}
```

Successful ingestion returns `200 {"accepted":["UUID"]}` after an atomic transaction. Event IDs deduplicate per property. Invalid schema/context returns 400, unregistered origin/property 403, excess body size 413, wrong content type 415 and rate limits 429. The body ceiling is 16,384 bytes and ten events. The existing `POST /api/footfall/collect` remains compatible with legacy visit senders; it is not additionally called by the new sender.

The browser queues at most 100 events/60,000 encoded bytes for five minutes, sends batches of at most ten/16,000 bytes, and retries network/acknowledgement/408/429/5xx failures up to five attempts. Other HTTP errors drop the rejected batch. Ten-second request timeouts, a short batch timer and best-effort hidden-document flush never gate navigation. There is no durable offline replay. Browser IDs persist locally; per-tab sessions renew after 30 minutes without tracked activity. Storage failures use document-local IDs. Neither IPs nor location are browser payload fields; the collector derives them from requests.

Vite development proxies `/api/footfall` to the loopback collector on port 5175. Production collection is disabled unless `VITE_FOOTFALL_COLLECTOR_URL` is configured; `VITE_FOOTFALL_PROPERTY_ID` defaults to `portfolio`. An existing collector URL ending in `/collect` is adapted to `/events`. Production also needs CSP and origin/proxy configuration. The gated same-origin Firebase rewrite and release build are prepared below; the collector application has not been published.

The separate project implements owner sign-in/out at `/api/footfall/session`, an owner-authenticated visit ledger at `GET /api/footfall/report`, and event aggregates at `GET /api/footfall/analytics?property=all|ID&start=YYYY-MM-DD&end=YYYY-MM-DD`. Aggregate dates use IST, allow up to 30 days, and omit raw IPs. Reports poll every thirty seconds. Raw IPs expire after seven days, events/visits after thirty. The portfolio Firebase service still owns only Rook. See ANALYTICS_PLAN.md and `/Users/nyx/Projects/portfolio-analytics/docs/VISITOR_COLLECTION.md` for full semantics and limitations.

## Verification boundary

The existing Rook tests use injected/mocked provider calls and verify validation, timeout, cancellation, sanitized errors, limits, fallback metadata and Firebase request adaptation. They do not prove the production provider credential, deployed backend availability or actual email delivery. Those require separate environment-specific checks.

## Firebase Footfall release preparation (2026-11-10)

The separate Footfall repository now provides the Functions v2/Firestore collector and Hosting target. This portfolio adds a same-origin `/api/footfall/**` rewrite to that Function, plus `npm run build:firebase` to build with the event endpoint configured. The existing CSP already allows that same-origin request. CI enables the build/rewrite only when `FOOTFALL_DEPLOY_ENABLED=true`; publish the collector first and preserve the existing Rook flag. No portfolio deployment has been performed here.

Production owner sessions use the Hosting-compatible `__session` cookie and `private, no-store` responses. Events, owner sessions and rate limits use private Firestore storage; SQLite remains local-only. The new database has restricted point-in-time recovery, which can retain deleted records for up to seven additional days beyond live retention. See the sibling Footfall deployment guide for prepared resources, release order and the still-pending real production IP/event verification.
