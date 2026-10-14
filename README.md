# Retro/Cyberpunk Portfolio

A modern, responsive portfolio website built with React and Vite, featuring a "Cyberpunk/Bento Grid" aesthetic.

## Features

- **Cyberpunk Aesthetic**: Neon colors, pixel borders, scanlines, and glitch effects.
- **Bento Grid Layout**: Responsive CSS Grid layout that adapts from mobile to desktop.
- **Dynamic Data**: All content (Profile, Experience, Projects) is driven by `src/data/portfolio.js`.
- **Contact Form**: Integrated UI for contact, ready to be connected to EmailJS.

## Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/coding-nyx/portfolio.git
    cd portfolio
    ```

2.  **Install dependencies**:
    ```bash
    npm ci
    ```
    A `pnpm-lock.yaml` is also present. `npm ci` with `package-lock.json` is what
    CI uses, so treat npm as authoritative unless you deliberately use pnpm.

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` (or the port shown in terminal) to view the app.

4.  **Build for Production**:
    ```bash
    npm run build
    ```
    Serve the output with `npm run preview`.

## Checks

```bash
npm run lint                  # ESLint
npm run build                 # production bundle
npm test                      # regression suite (node --test, no dependencies)
node tests/bundle-audit.mjs   # scan dist/ for removed claims and identifiers
```

The regression suite covers the runtime crash that shipped on this branch, the
reachability of the case-study views, unsupported-claim and testimonial leakage,
curated link states, immediate rendering and the recruiter contact actions.

### Browser verification (optional)

`verification/*.py` drive a real browser against a running dev server. They need
Playwright, which is not a project dependency:

```bash
pip install playwright && playwright install chromium
npm run dev &                  # verification scripts target localhost:5173
python3 verification/verify_loading.py
python3 verification/verify_skills.py
python3 verification/verify_themes.py
```

## Configuration

Firebase web config is read from `VITE_FIREBASE_*` environment variables and the
app degrades gracefully when they are unset. The deploy workflow supplies them
from repository secrets. See `.github/workflows/firebase-hosting-merge.yml`.

Contact/chat services (EmailJS) read `VITE_EMAILJS_*` variables. No secrets are
committed; without configuration those UI paths do not report success.

## Deployment (Firebase Hosting)

This project is configured for Firebase Hosting.

### 1. Prerequisite
Install the Firebase CLI globally:
```bash
npm install -g firebase-tools
```

### 2. Login & Connect
Login to your Google account and connect the project:
```bash
firebase login
```

Update the `.firebaserc` file with your actual Firebase Project ID, or run:
```bash
firebase use --add
```

### 3. Deploy Manually
Build and deploy in one step:
```bash
npm run build && firebase deploy
```

### 4. Automated Deployment (Optional)
This repository includes a GitHub Action (`.github/workflows/firebase-hosting-merge.yml`) for continuous deployment.
To enable it:
1.  Go to your Firebase Project settings and generate a Service Account JSON.
2.  Add it as a secret named `FIREBASE_SERVICE_ACCOUNT` in your GitHub Repository settings.
3.  Update the `projectId` in the workflow file.

## Customization

-   **Data**: Edit `src/data/portfolio.js` to update your bio, skills, experience, and projects.
-   **Email Service**: Implement the actual email sending logic in `src/services/emailService.js` (e.g., using EmailJS).
-   **Styles**: Tweaking CSS variables in `src/styles/GlobalStyle.js` allows for easy theme changes.

## License

MIT

## Rebuilding the résumé

The live portfolio is **https://iamnyx.web.app**. Both published résumé variants
use this URL, the contact address from `profileData`, and confirmed component
engineering experience. Product adoption is described without naming apps or teams.

`scripts/build-resume.py` generates the one-page PDFs and their preview from
`src/data/portfolio.js`. Education is carried forward from the previous résumé
in the script. The selected projects are Hermes Companion, Nexus and Tally;
project-specific `resumeSummary` copy keeps their scope concise and accurate.
Private projects render without source links unless their upcoming release destination is explicitly supplied; Tally is labelled "public soon". It needs Node.js plus Python packages `reportlab`, `pypdf`, and
`pypdfium2` (available in the Codex bundled Python runtime).

```bash
python3 scripts/build-resume.py --output-dir public
```

The script rejects multiple pages and retired contact details or percentage
claims. After changing the source, inspect the generated preview and both PDF
variants before committing them.

## Rook / DeepSeek local verification

Rook calls the same-origin `/api/rook` endpoint. Vite's development and preview servers run the server handler in `server/rook.mjs`; the browser never receives the provider credential. Copy `.env.example` to `.env.rook.local` and set `DEEPSEEK_API_KEY` there. The file is ignored by Git. The default model is `deepseek-flash`. Restart the server after changing server credentials.

Run `npm run test:rook`, `npm run lint`, and `npm run build`. Live answers are labeled DeepSeek in the popover. If the backend/provider fails, the UI explicitly labels the saved portfolio fallback. Visitor questions are processed by DeepSeek; Rook does not send emails.

Production Rook is packaged as a Node 22 Firebase Function in `functions/`, generated by `npm run build:functions` from the same public facts and handler used locally. Its credential is bound through Firebase Secret Manager. Firebase Hosting routes `/api/rook` to that function when enabled.

The `nyx-port` project uses Blaze billing for the Rook backend. Provision a runtime secret with `firebase functions:secrets:set DEEPSEEK_API_KEY --data-file - --project nyx-port`, deploy `functions:rook`, and set the repository variable `ROOK_DEPLOY_ENABLED=true`. Deploy the function when its handler or portfolio facts change; the enabled workflow deploys Hosting and pins the current backend revision. If that variable is disabled, Hosting serves the portfolio with an explicitly labeled saved-answer fallback. The GitHub secret is already named `DEEPSEEK_API_KEY`; it must never be prefixed `VITE_`.

Production deployments run lint, portfolio regressions, Rook tests, the build and bundle audit before publishing. EmailJS configuration remains supplied by the existing GitHub secrets. Optional Firebase analytics configuration is supplied by `VITE_FIREBASE_*`; without it, analytics is skipped while the portfolio renders normally.
