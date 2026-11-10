> Firebase preparation updated 10 November 2026: the separate Footfall project now provides Functions/Firestore persistence, shared sessions/limits, `__session` cookies, pinned private GeoIP assets and Hosting configuration. The portfolio has a gated same-origin rewrite/release build. Restricted recovery backups can retain deleted data for seven extra days. The apps have not been published; live IP attribution and production delivery remain pending. See the sibling project's docs/FIREBASE_DEPLOYMENT.md.

# Portfolio tracking and delivery

Implemented locally on 9 November 2026. Footfall is a separate multi-property application; the portfolio is one tracked property. Production publication has not been performed.

## Collection flow

```text
Portfolio document / action
  → App and feature-owned instrumentation
  → services/footfallAnalytics.js
  → bounded in-memory event queue
  → POST /api/footfall/events?property=portfolio
  → validated, deduplicated collector transaction
  → private SQLite events; document visits also populate the IP/geo visit ledger
  → authenticated Footfall reports, polled every 30 seconds
```

Development Vite proxies forward `/api/footfall` to the separate loopback service on port 5175. Production requires a configured HTTPS collector or same-origin proxy and matching CSP/origin settings. The portfolio bundles no dashboard UI, owner password or visitor database. Firebase/GA4 remains an independent optional integration; Footfall does not query or combine its totals.

## Implemented events

| Event                | Trigger                                                                                                                               | Context                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `page_view`          | Once per document load; before the first action if it precedes idle collection                                                        | Query/hash-free path, referrer origin            |
| `section_view`       | Half the chapter or half the viewport, whichever is smaller, visible continuously for one second; once per chapter per document visit | `chapter_id`                                     |
| `project_open`       | Details dialog opens from grid, carousel or island                                                                                    | Stable `project_id`, `entry_point`               |
| `resume_open`        | Résumé link activation, including Rook's résumé action                                                                                | `entry_point`: hero, navigation, resume or rook  |
| `outbound_click`     | Known project/source/social link activation, including middle clicks                                                                  | Allowlisted `destination`, optional `project_id` |
| `contact_result`     | Configured contact delivery resolves                                                                                                  | `result`: sent or error                          |
| `contact_draft_open` | Email address/draft link activation within Contact                                                                                    | None                                             |
| `rook_open`          | Rook changes from closed to open                                                                                                      | `entry_point`: navigation                        |

Reloading adds a document visit; scrolling and hash navigation do not. Résumé clicks measure intent, not completed downloads or reading. Email drafts and contact errors never count as sent messages. Opening Rook records no chat content.

The app hook owns chapter/link observation; the project details owner, contact hook and app Rook callbacks own their action boundaries. Features do not import one another. The transport service does not import UI or navigate. Public project IDs live in `src/data/portfolio.js`; `src/data/footfallContract.js` defines the wire vocabulary, mirrored by Footfall's `shared/footfallContract.mjs`.

## Identity, payload and location

Every event has a unique UUID, event name, random browser ID, session ID, client timestamp, pathname, sanitized referrer and an allowlisted context object. Collection requests suppress the HTTP Referer header so a page query is not forwarded there either. Batches carry schema version 1. Browser IDs use local storage; sessions use per-tab session storage and renew after 30 minutes without an accepted instrumentation call. Storage-unavailable IDs remain stable in memory for the current document. Client timestamps preserve sequence; server receipt timestamps determine reporting dates and retention.

The browser sends no IP or location fields. The collector derives the network address using the socket or an explicitly trusted proxy chain, performs offline DB-IP City Lite lookup and derives coarse device/browser categories from the request user agent. No browser GPS, message contents, contact names/emails, Rook conversation contents or arbitrary query parameters enter analytics.

The footer explains collection and offers an opt-out. DNT, Global Privacy Control and the saved local choice disable collection. Opting out cancels pending work, discards queued events and clears Footfall IDs when storage permits. Already received records follow retention. Requests already received cannot be recalled. Re-enabling resumes collection; browser privacy signals continue to take precedence.

## Delivery bounds

- Queue: at most 100 events and 60,000 encoded bytes; memory only, maximum age five minutes. New events are dropped when full.
- Batch: at most 10 events and 16,000 encoded bytes, below the collector's 16,384-byte body ceiling.
- Flush: after idle initialization, approximately every two seconds while pending, online recovery, and best-effort `keepalive` delivery on document hiding/page exit. Active delivery can delay a second flush. Background browsers can throttle timers.
- Requests time out after ten seconds. Network errors, invalid acknowledgements, HTTP 408/429 and 5xx responses retry with capped exponential backoff; at most five attempts per event. Other HTTP errors drop the rejected batch.
- Success requires an acknowledgement containing every batch event ID. Retries reuse IDs; server uniqueness on property/event ID prevents duplicate records.
- Cleanup cancels timers/listeners and aborts requests. A lifecycle restart retains unacknowledged events and prevents another document view. Opt-out discards that retained queue.

Delivery is best effort, not guaranteed or a durable offline log. Closed tabs, blockers, offline sessions and queue limits can lose events. Events never block portfolio rendering or navigation.

## Live reports

Footfall defaults to Collected data. Overview, registered properties, realtime, acquisition, content, events, audience, conversions and funnels query authenticated collector aggregates. Sample design mode is separate and explicitly labeled. The Visitors report keeps its owner-only visit/IP/location ledger; it counts document visits, while aggregate activity can include action-only sessions.

Date filters use Asia/Kolkata and spans of up to 30 days. Realtime means activity received in the last 30 minutes, not an exact online count. Portfolio conversions are résumé intent and successful contact delivery. The portfolio funnel requires an ordered document view, then project open, then résumé open in the same property/session and selected date range. Other registered properties contribute general traffic reports; custom application event schemas/goals/funnels are a separate extension, not implemented by registering an origin.

Raw IPs expire after seven days. All event/visit records, browser IDs, IP digests and locations expire after thirty days on collection/report access. SQLite and credentials have restricted filesystem permissions; this is not database-at-rest encryption. Visitors represent browser IDs, sessions are per tab, IPs can be shared, and origin checks do not prove a visitor is human.

## Operation and validation

Run the portfolio with `npm run dev -- --host 127.0.0.1 --port 5173`, and run `npm run dev` plus `npm run dev:collector` in `/Users/nyx/Projects/portfolio-analytics`. Footfall uses port 5174. Its generated owner password is in the private ignored `.footfall/owner-password` file, never client configuration.

Tests cover sender batching, acknowledgements, retry limits, queue expiry, opt-outs, session renewal, ephemeral IDs, collector schema rejection, duplicate IDs, property scopes, retention and ordered funnel/conversion semantics. Browser checks verify actual portfolio actions arriving in Footfall. No real email is sent as part of analytics validation.

Production still needs hosting, durable storage/backups, secure owner cookies, a verified proxy chain, configured origins/CSP, and environment-specific collection/consent choices. The code is ready for local review; no deployment is implied. See the separate project's `docs/VISITOR_COLLECTION.md` for operation and deployment configuration.
