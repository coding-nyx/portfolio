import { profileData } from '../data/portfolio.js';

export default function ApplicationError() {
  return (
    <main className="app-error" role="alert">
      <h1>The portfolio could not load.</h1>
      <p>Please reload the page, or use the résumé and contact links below.</p>
      <div>
        <button type="button" onClick={() => window.location.reload()}>
          Reload portfolio
        </button>
        <a href="/resume-modern.pdf">Download résumé</a>
        <a href={`mailto:${profileData.socialLinks.email}`}>Email Raj</a>
      </div>
    </main>
  );
}
