<p align="center">
  <img src="docs/assets/readme-overview.svg" alt="NYX / Portfolio — Projects, experience, and the work behind them." width="100%" />
</p>

# NYX / Portfolio

A responsive personal portfolio built with React 19, Vite and styled-components. It presents curated projects, case studies, experience and résumé downloads, with an optional Rook portfolio assistant.

[Live portfolio](https://iamnyx.dev) · [Setup](#setup) · [Configuration](#configuration) · [Deploy](#deployment) · [Checks](#checks)

## What is here

| Surface   | Purpose                                                                              |
| --------- | ------------------------------------------------------------------------------------ |
| Portfolio | Project cards, case studies, experience and contact actions                          |
| Content   | Structured facts in `src/data/portfolio.js`                                          |
| Design    | Responsive sections, motion and a retro/cyberpunk visual system                      |
| Résumé    | Generated one-page PDF variants and preview                                          |
| Rook      | Optional same-origin portfolio Q&A, with an explicitly labeled saved-answer fallback |

## Setup

Use Node **22**, matching the deployment workflow, and npm with `package-lock.json`:

```sh
git clone https://github.com/coding-nyx/portfolio.git
cd portfolio
npm ci
npm run dev
```

```sh
npm run lint
npm test
npm run test:rook
npm run build
npm run audit:bundle
npm run preview
```

The app's configured features depend on their environment; a successful static build does not prove email delivery or a live AI response.

## Configuration

See `.env.example` and the deployment workflow for variable names. `VITE_FIREBASE_*` and `VITE_EMAILJS_*` are browser-visible configuration; missing configuration should not be presented as successful email delivery or analytics initialization.

The server-only Rook provider credential is `DEEPSEEK_API_KEY`. Never prefix it with `VITE_`, commit it, include it in a URL or expose it in a client bundle. Configure credentials privately; this documentation update does not call or configure a provider.

## Rook architecture

```mermaid
flowchart LR
  Visitor[Portfolio visitor] --> UI[Rook UI]
  UI --> API[Same-origin /api/rook]
  API --> Provider[Configured provider]
  UI --> Fallback[Labeled saved-answer fallback]
```

The shared handler is `server/rook.mjs`. Local development/preview wiring and the Firebase Function package use that handler. Provider requests process the visitor question with public portfolio context; Rook does not send contact emails. The UI distinguishes a provider response from its saved-answer fallback.

## Deployment

The [GitHub workflow](.github/workflows/firebase-hosting-merge.yml) handles `main` pushes, runs the portfolio/Rook regression gates, builds the site and deploys Firebase Hosting with the configured backend route. Read [DEPLOYMENT.md](DEPLOYMENT.md) before changing the project, service account or backend rollout.

Use a protected service-account/Secret Manager configuration and choose the target Firebase project explicitly. Hosting deployment, function deployment and provider-secret provisioning are separate operations. Publishing documentation does not imply a provider credential was rotated or a new backend was deployed.

Read [the architecture](docs/ARCHITECTURE.md), [API contract](docs/API.md) and [coding-principles review](docs/CODING_STANDARDS.md) before extending the app. Run `npm run check` for the automated quality gates.

## Customize

- **Content:** `src/data/portfolio.js`.
- **Sections:** `src/features/`; composition and navigation in `src/app/`.
- **Theme:** `src/shared/theme/`; CSS lives beside its feature.
- **Contact:** `src/features/contact/`, `src/services/contactService.js` and the configured client environment.
- **Rook:** `server/rook.mjs`, `functions/` and `scripts/build-functions.mjs`.

## Rebuild the résumé

```sh
python3 scripts/build-resume.py --output-dir public
```

The generator uses portfolio facts and requires Node plus Python `reportlab`, `pypdf` and `pypdfium2`. Selected projects include Hermes Companion, Ara → Agent OS and Tally. Review the generated preview and both PDFs before publishing; keep claims and links tied to confirmed facts.

## Checks

`npm test` covers portfolio regressions; `npm run test:rook` covers the Rook handler/UI contract; `npm run audit:bundle` checks the built output. Generated browser screenshots and local verification scripts are excluded from Git. Interactive browser checks are separate from these automated gates.

No top-level license file is present in the current tree. The README does not introduce a new license grant.

## Canonical domain and résumé PDFs

The canonical public URL is `https://iamnyx.dev/`. Sharing metadata and both résumé variants use that domain. The PDFs have identical content and layout, with Modern (blue) and Cyberpunk (ember) accent colors; neither has a verified ATS-compatibility claim. Rebuild them with `python3 scripts/build-resume.py --output-dir public` after installing the Python dependencies listed in that script. The builder checks single-page output, contact details and project source links, and regenerates the Modern preview.

The 1200×630 share image is `public/social-share.png`, built from the existing After Hours artwork and Space Grotesk font. Regenerate it with `python3 scripts/build-social-card.py` (requires Pillow). Static Open Graph/Twitter metadata includes dimensions and equivalent image descriptions; the text description and no-JS résumé/contact fallback do not depend on the image.

A server-side redirect from `iamnyx.web.app` is **not configured** here. The current Firebase Hosting site (`iamnyx`) serves the portfolio, and Hosting redirect rules match URL paths, not hostnames. A catch-all redirect to `.dev` on that same site would also redirect `.dev` if it is attached to the site, causing a loop. Confirm the live custom-domain mapping before changing hosting. A safe migration can move `.dev` to a separate content Hosting site and leave the old site redirect-only, preserving paths and queries and checking `/api/rook`, PDF and asset behavior. This requires an owner-approved hosting migration and deployment, not just a local `firebase.json` edit. See [Firebase redirect configuration](https://firebase.google.com/docs/hosting/full-config#redirects).
