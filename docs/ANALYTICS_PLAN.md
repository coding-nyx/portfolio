# Portfolio analytics → Footfall on Spark

Updated 10 November 2026. This replaces the prior custom collector/IP/GeoIP plan. The user selected a separate Firebase Spark project for Footfall and retained the existing billed Rook project.

## Data flow

Portfolio action → bounded in-memory queue → create-only Firestore REST commit in `nyx-footfall-analytics` → Firestore schema rules → immutable event document → owner Firebase Authentication → dashboard queries and pure report calculations.

The portfolio and dashboard remain separate Git projects. Shared public event vocabulary and transport semantics are mirrored, without runtime imports across repositories. The portfolio never receives owner report tokens, credentials or visitor records. Production collection is off in ordinary builds; `build:firebase` or `VITE_FOOTFALL_ENABLED=true` enables it. Development uses only `demo-footfall` on local emulators. Rook and optional GA4 keep their existing independent integration.

## Collected fields and events

Random event/browser/session UUIDs, property, client timestamp/order, server receipt timestamp, path without query/hash, referring origin, allowlisted event context, declared page origin, coarse browser/device category, browser language and time zone. No IP/hash, IP-derived geography, GPS, raw user agent, contact fields, message contents or Rook conversation contents are stored by Footfall. Time zone is a browser setting, not a verified location.

- `page_view`: one visit per document; chapter/hash navigation does not add visits.
- `section_view`: known chapter at least half the smaller chapter/viewport for one second, once per document.
- `project_open`, `resume_open`, `outbound_click`: known IDs/destinations and entry points.
- `contact_result`: sent/error status only; drafts do not count as sent.
- `contact_draft_open`, `rook_open`: action metadata only.

Browser UUIDs persist in local storage. Sessions are per tab, renewed after thirty minutes of inactivity. Storage failures keep in-memory identifiers. DNT/GPC and the footer opt-out disable both integrations; opting out drops pending work/clears IDs where storage permits. It does not recall already received records.

## Delivery and security

The queue is bounded to 100 events/60,000 bytes/five minutes. At most ten events/16,000 bytes form a group; the Spark transport writes each immutable document once. A create precondition and acknowledgement of HTTP 409 make retries idempotent. Transient/network/acknowledgement failures retry the same UUIDs at most five times. Other HTTP errors drop the batch. Requests time out after ten seconds; hidden/page-exit keepalive is best effort. There is no durable offline replay.

Firestore rules validate exact fields, UUIDs, context, declared origins and timestamp/size bounds, rejecting IP/location or arbitrary payload fields. Public clients cannot read, update or delete. Only owner UID `footfall-owner` can read/delete. The dashboard uses Firebase Authentication, not a custom owner cookie/session service. Arbitrary clients can forge permitted browser telemetry and consume quotas; there is no backend rate limiter, origin attestation or verified-person count.

## Reports, quotas and retention

Overview, visitors, properties, sources, pages/chapters/projects, events, browser audience, conversions and ordered funnels use recorded events. Portfolio outcomes/funnel are portfolio-specific; configurable product goals remain sample demonstrations. Sample design mode is labeled and separate.

Reports use IST dates and manual refresh. A sixty-second memory cache is shared across views/property filters; later refreshes query from five minutes before the latest timestamp and deduplicate UUIDs. Each range is capped at 5,000 events; Realtime reads a thirty-minute window. First loads/range changes/reloads consume reads. No background Functions or aggregation jobs run.

The separate Spark project has no billing account. Current Firestore free quotas include 20,000 writes and 50,000 reads per day and 1 GiB storage. Quota exhaustion interrupts service. [Firebase pricing](https://firebase.google.com/pricing/) is the source for current limits. Rook's existing project remains independently billed.

Reports cover thirty days. Older documents remain stored until the owner runs cleanup from Data connections, up to 400 per action. There is no scheduled cleanup, TTL, paid recovery or promised physical deletion after exactly thirty days.

## Verification and release

Run portfolio `npm run check` and `npm run build:functions` (Rook remains). In Footfall run `npm run firebase:preflight`, `npm run check` and Node 22 `npm run test:firebase`. Security integration tests use demo emulators only. The separate deployment guide documents prepared resources and owner access.

A Footfall Git push alone does not publish application changes. After a separately requested release, verify owner login, real portfolio commit acknowledgements, exact visit/action counts, opt-outs and unauthorized read/update rejection. Passing build/emulator tests does not establish production delivery.

## Module tracking release

Expanded events cover Rook question/command submissions, correlated outcomes and response times; contact starts, validation attempts, resumptions, unfinished exits and delivery outcomes; skill detail opens; and foreground module engagement. Public enums, UUIDs and integer bounds are validated by both sender and Firestore rules. Message/input contents remain excluded. Foreground timing uses thirty-second chunks, skips suspended gaps and stops after sixty seconds without interaction. Contact abandonment is an observed unfinished exit, not proof of permanent abandonment.

Footfall adds module-use summaries, bot/contact outcome panels and per-browser timelines grouped by session. Owners can filter module/session and show more events, from the same thirty-day/5,000-event read snapshot. Additional telemetry consumes the existing free quota; no billed services are added. Deploy Footfall rules/dashboard before enabling/releasing the portfolio sender. The existing Rook Function must receive updated shared portfolio facts when those facts differ from its deployed source.
