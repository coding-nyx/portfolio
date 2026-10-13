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
    git clone https://github.com/yourusername/portfolio.git
    cd portfolio
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` (or the port shown in terminal) to view the app.

4.  **Build for Production**:
    ```bash
    npm run build
    ```

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

## Rook / DeepSeek local verification

Rook calls the same-origin `/api/rook` endpoint. Vite's development and preview servers run the server handler in `server/rook.mjs`; the browser never receives the provider credential. Copy `.env.example` to `.env.rook.local` and set `DEEPSEEK_API_KEY` there. The file is ignored by Git. The default model is `deepseek-flash`. Restart the server after changing server credentials.

Run `npm run test:rook`, `npm run lint`, and `npm run build`. Live answers are labeled DeepSeek in the popover. If the backend/provider fails, the UI explicitly labels the saved portfolio fallback. Visitor questions are processed by DeepSeek; Rook does not send emails.

The current Firebase Hosting workflow serves static files. Production live Rook still needs a deployed server endpoint, Hosting rewrite and a runtime secret binding. A GitHub Actions secret alone does not provide a backend or configure a deployed runtime. Do not put the DeepSeek key into a Vite variable or static build.
