# Portfolio engineering conventions

Read `docs/ARCHITECTURE.md`, `docs/API.md`, and `docs/CODING_STANDARDS.md` before changing application structure.

- Keep the user-approved Settings hero and existing portfolio behavior unless the task explicitly changes them.
- Use `src/app` for composition/navigation, `src/features/<feature>` for feature UI and hooks, and `src/shared` for reusable UI, theme and motion code.
- Features may depend on shared code, services, data and utilities. They must not import another feature directly. Compose features in the app layer. Shared code must not import app/features/services/data. Services must not import UI or manipulate page navigation.
- Keep public content in `src/data/portfolio.js`; both the site and server consume those facts. Keep API limits in `src/data/rookContract.js`. Server secrets never enter client data or `VITE_` variables.
- Use semantic component/file names, explicit file extensions, Prettier formatting, strict equality, and no unused bindings. ESLint enforces hooks, JSX references and module boundaries.
- Keep views focused on rendering. Put substantial state/side effects in feature hooks and pure calculations in feature model modules. Use callbacks at feature boundaries instead of reaching into another feature's state.
- Defer Rook, the island and its engine, EmailJS, and analytics according to the loading policy. Use `m` under the shared `LazyMotion` provider rather than importing the full `motion` components.
- Cancel requests and release observers, event listeners, timers and WebGL resources. Respect both the site motion setting and the system reduced-motion preference.
- Run `npm run check` and `npm run build:functions` for structural changes. Update existing regression tests to follow active code; do not retain dead implementations to satisfy obsolete tests.
- Keep scratch verification files and design prototypes out of Git. The ignored local studies are not part of the production app. Use npm and the single `package-lock.json`; do not introduce another package-manager lockfile.
- Report the architecture, API changes, validation evidence and remaining limitations honestly. Passing lint/build is not proof of browser behavior or performance.
- Follow the user's current commit/push/publication instructions; do not infer deployment from a request for a local prototype or refactor.
