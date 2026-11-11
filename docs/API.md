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

`App → scheduleVisitAnalytics` independently schedules optional Google Analytics and Footfall. Both honor DNT/GPC and the footer opt-out. The standard Google tag remains deferred; loopback development skips Google collection. `portfolio_visit` is separate from Google's automatic page views.

Footfall now uses the separate Firebase Spark project `nyx-footfall-analytics`. The portfolio has no Footfall HTTP collector API. `services/footfallAnalytics.js` owns queue/identity/retry behavior; `services/footfallFirestore.js` translates batches into create-only Firestore REST commits. Public project identifiers live in `data/footfallFirebase.js`; the API key identifies the project and is not an owner credential. Firestore security rules enforce the event schema and private report access.

```http
POST https://firestore.googleapis.com/v1/projects/nyx-footfall-analytics/databases/(default)/documents:commit?key=PUBLIC_FIREBASE_KEY
Content-Type: application/json
```

Each event creates `footfall_events/PROPERTY_EVENT_UUID` with a precondition that it does not exist, plus a `REQUEST_TIME` transform for `receivedAt`. A successful commit or HTTP 409 is acknowledged; retries never change the first receipt timestamp. The queue groups at most ten events but sends one commit per document. Partial/network failures retry the same UUIDs. Existing events remain immutable; public reads/updates/deletes are denied. Only the Firebase Authentication owner UID can read/delete event records.

Stored fields are version, property, event/browser/session UUIDs, client `occurredAt`, per-document `order`, Firestore `receivedAt`, path without query/hash, referring origin, allowlisted context, declared page origin, coarse device/browser categories, browser language and time zone. IPs, IP hashes, geographic location, GPS, form contents and Rook conversations are excluded. Public event names/context remain in `data/footfallContract.js`.

The sender retains its 100-event/60,000-byte/five-minute queue, ten-event/16,000-byte groups, ten-second request deadline, five-attempt transient retry cap and best-effort hidden-document keepalive. There is no durable offline replay. Browser UUIDs persist locally; per-tab sessions renew after thirty minutes without activity. Storage failures use in-memory IDs. Browser-reported telemetry can be forged; declared origins are validated payload values, not authenticated request origins or proof of a person.

Vite loopback development targets only the `demo-footfall` Firestore emulator on port 8085. Production writes require `VITE_FOOTFALL_ENABLED=true`; `npm run build:firebase` sets that flag and the portfolio property. Normal production builds keep Footfall disabled. The existing CSP permits Firestore's Google API origin. There is no `/api/footfall` proxy/rewrite. Rook's `/api/rook` integration is unchanged.

Footfall uses Firebase Authentication owner ID tokens for direct Firestore queries and computes reports in the dashboard. Date ranges use IST, cover at most thirty days, and have a 5,000-event ceiling. Manual refresh shares a sixty-second memory cache with incremental queries and overlap/deduplication; no automatic polling scans the database. Physical cleanup is an owner action, up to 400 expired events at a time. Reports exclude expired records, but storage can retain them until cleanup runs. No Functions, scheduled jobs, TTL, PITR or server secrets are required.

See ANALYTICS_PLAN.md and the separate Footfall deployment guide for Spark quotas, rules tests, local owner setup and release order. Production verification must reconcile browser actions with actual stored records after each release.

## GA4 aggregate geography

The portfolio's public GA4 destination is `data/googleAnalytics.js`. A valid `VITE_FIREBASE_MEASUREMENT_ID` is accepted when no valid public destination is configured. The standard Google tag is requested only during idle time for a non-loopback document that permits analytics. It configures one automatic page view and sends one `portfolio_visit`; chapter/hash changes and effect/consent restarts do not create duplicate visits. Google initialization or network failure remains optional. The loader and footer use the same effective measurement ID for Google's collection-disable flag.

Google receives the standard collection request and derives approximate country/city from network information. The portfolio supplies only a query/hash-free page location, referring origin and coarse device category for its visit event, with Google signals and ad personalization disabled. The first-party Firestore schema remains unchanged: no IP, GPS or geographic location is added to its event records. Contact values, Rook text and Footfall browser IDs are not forwarded to GA4.

Footfall's geography view uses Google's Analytics Data API with the selected numeric property/web-stream IDs and hostname scope. It requires the owner to authorize read-only Analytics access; the Firebase owner ID token is not a Google Analytics reporting credential. The public OAuth client ID is configuration, while access tokens stay in browser memory. Country and city reports are distinct aggregate queries; their user totals must not be joined to individual Footfall browsers or summed as a deduplicated workspace total. GA4 processing delay, timezone and report limits apply independently of the first-party thirty-day event log. This browser collection/reporting route requires no Firebase Function or Blaze upgrade.

## Verification boundary

The existing Rook tests use injected/mocked provider calls and verify validation, timeout, cancellation, sanitized errors, limits, fallback metadata and Firebase request adaptation. They do not prove the production provider credential, deployed backend availability or actual email delivery. Those require separate environment-specific checks.

## Firebase Spark release boundary (2026-11-10)

Footfall's separate project has billing disabled. The earlier Footfall-only GeoIP bucket, secrets and runtime account were removed from `nyx-port`, and its empty preparation database had paid recovery/TTL disabled. The existing portfolio/Rook project remains billed by the user's explicit decision. Portfolio CI gates the analytics-enabled build with `FOOTFALL_DEPLOY_ENABLED` and keeps Rook's deployment flag independent. Portfolio publication follows the main-branch Firebase workflow when explicitly authorized.

## Module interaction analytics

The Spark event vocabulary now includes `rook_submit` and `rook_result`, correlated by random interaction UUID with typed/suggestion entry, question/command kind, terminal result and bounded response milliseconds. Results distinguish live replies, saved fallback replies, local navigation actions, cancellation and errors. Neither questions nor replies enter analytics.

Contact emits `contact_start`, `contact_resume`, `contact_submit` (valid/invalid), `contact_abandon` (section exit/page exit/clear), and delivery results correlated by a random form UUID. Starting means an edit or submission attempt, not merely viewing Contact. Unfinished exits are provisional and can be superseded by resumption or sent delivery. Pending delivery suppresses exit events; email-draft handoff is recorded separately and is not counted as abandonment. No names, emails, subject selections or message values enter Footfall.

`skill_open` identifies an allowlisted skill. `module_engagement` records approximate foreground seconds for one visible section or Rook at a time, in roughly thirty-second chunks and on transitions. Hidden/unfocused time, timer suspension gaps and time after sixty seconds without interaction are excluded. Consent changes discard pending timing and journey correlation. Page exits use best-effort keepalive; a second bounded final batch can deliver lifecycle metadata while the previous batch is still in flight.

The dashboard shows module use, bot outcomes, contact progress and owner-only per-browser session timelines. Timeline session/module filtering and batches of fifty displayed rows operate on the existing bounded in-memory query snapshot, without a new backend or unbounded public reads. The same 5,000-event range and thirty-day reporting/owner-triggered cleanup limits apply. Browser identifiers and event times do not prove a person's identity or exact reading time.
