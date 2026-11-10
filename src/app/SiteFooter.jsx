import { useState } from 'react';
import { analyticsOptedOut, setAnalyticsOptOut } from '../services/analyticsPreference.js';

export default function SiteFooter() {
  const [optedOut, setOptedOut] = useState(() => analyticsOptedOut());
  const systemOptOut = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} RAJ KUMAR S</span>
      <details className="tracking-disclosure">
        <summary>Visitor analytics</summary>
        <p>
          This site measures document visits, sections viewed, project and résumé opens, external
          link clicks, skill details, approximate active time, contact-form progress and delivery
          outcomes, and Rook submissions and response outcomes. It uses random browser/session IDs.
          Footfall stores device/browser categories, browser language and time zone. It does not
          store IP addresses or geographic location.
        </p>
        <p>
          Contact fields and Rook conversations are excluded from analytics. Reports cover 30 days;
          older Footfall records remain stored until the owner runs cleanup. Reports require owner
          access. Independently configured Google Analytics follows the same opt-out choice.
        </p>
        <label>
          <input
            type="checkbox"
            checked={optedOut}
            disabled={systemOptOut}
            onChange={(event) => {
              setOptedOut(event.target.checked);
              setAnalyticsOptOut(event.target.checked);
            }}
          />{' '}
          Opt out of visitor analytics
        </label>
        <p>
          {systemOptOut
            ? 'Your browser privacy signal disables collection.'
            : optedOut
              ? 'Collection is disabled for this browser. This does not delete previously received records.'
              : 'Collection respects Do Not Track and Global Privacy Control. You can opt out here.'}
        </p>
      </details>
    </footer>
  );
}
