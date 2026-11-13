# Deployment

This guide describes the existing portfolio release workflow. Publishing follows the owner's explicit commit, push and deployment instructions; preparing a release does not authorize those actions.

| Setting                 | Existing configuration                                                       |
| ----------------------- | ---------------------------------------------------------------------------- |
| Canonical portfolio URL | `https://iamnyx.dev/`                                                        |
| Firebase project        | `nyx-port`                                                                   |
| Firebase Hosting site   | `iamnyx`                                                                     |
| Firebase-hosted URL     | `https://iamnyx.web.app/`                                                    |
| Workflow                | [Deploy portfolio to Firebase](.github/workflows/firebase-hosting-merge.yml) |
| Automatic trigger       | Push to `main`                                                               |
| Runtime                 | Node.js 22; npm with `package-lock.json`                                     |

The workflow also supports manual dispatch. The canonical URL does not configure a redirect from the Firebase-hosted URL; see the domain-migration notes in [README.md](README.md#canonical-domain-and-résumé-pdfs).

## Release requirements

- Keep the existing GitHub Actions configuration and secrets in place. The workflow still reads the legacy-named `FIREBASE_SERVICE_ACCOUNT_PORTFOLIO_PAC` secret, while its explicit deployment target is `nyx-port`. Do not rename the secret or generate a replacement key as part of an ordinary content release.
- Never commit private service-account JSON or provider credentials. Rook's `DEEPSEEK_API_KEY` is a server-only Firebase secret, not a `VITE_` variable. Credential provisioning and rotation are separate operations.
- Run `npm run check` and `npm run build:functions` for the required local validation. Review generated résumé PDFs, their preview and the social-share image when their source content changes; the deployment workflow does not regenerate those public files.
- Keep generated `dist`, `functions/lib` and `firebase.hosting.json` out of Git. The workflow recreates these release outputs.

## Deployment flags

The workflow reads repository variables from GitHub Actions. Both were verified as `true` during release preparation on 2026-11-13; confirm the intended values before a later release.

| Repository variable       | When exactly `true`                                                                                                                                                           | Otherwise                                                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `ROOK_DEPLOY_ENABLED`     | Retains the Rook Functions configuration and the `/api/rook` rewrite in the generated Hosting configuration. The rewrite targets `rook` in `us-central1` with `pinTag: true`. | Removes that rewrite and generates Hosting-only configuration. The release does not map `POST /api/rook` to the backend. |
| `FOOTFALL_DEPLOY_ENABLED` | Builds with `npm run build:firebase`, enabling Footfall writes to its separate analytics project.                                                                             | Builds with `npm run build`.                                                                                             |

The Footfall flag controls that build selection, not the independently configured Google Analytics integration. Both integrations honor the portfolio's analytics opt-out.

## What the workflow does

After an authorized push to `main`, open the repository's **Actions** tab and follow **Deploy portfolio to Firebase**:

1. Checks out the release, selects Node.js 22 and installs dependencies with `npm ci`.
2. Runs lint, formatting checks, portfolio regressions, Rook tests and analytics tests.
3. Builds with the selected Footfall flag and checks the startup bundle budget.
4. Installs the Functions dependencies and runs `npm run build:functions`.
5. Loads the existing deployment credential into a protected temporary file, runs `scripts/hosting-config.mjs`, and deploys with the pinned Firebase CLI:

   ```sh
   firebase deploy --only hosting --config firebase.hosting.json --project nyx-port --non-interactive
   ```

6. Removes the temporary credential, including when an earlier step fails.

The command above is executed by the workflow using Firebase CLI `15.26.0`. The generated configuration, rather than `firebase.json` alone, applies the Rook deployment flag. Do not bypass it with an ad hoc deployment using different flags or a different target project.

## Verify the published release

Start browser QA at `https://iamnyx.dev/?analytics=off` and verify that the footer's **Opt out of visitor analytics** checkbox is checked before interacting. The opt-out persists; removing the query marker does not opt the browser back in.

Confirm that the published release has the intended content, `.dev` canonical metadata, the 1200×630 PNG social-share image and genuine PDF résumé responses. A missing static file can return the SPA's HTML with HTTP 200, so check the response content type as well as the status code.

When Rook is enabled, Hosting availability alone does not prove a live provider response. The UI labels saved-answer fallback separately. Contact delivery, backend credentials and external-provider availability require their own authorized checks; see [docs/API.md](docs/API.md).
