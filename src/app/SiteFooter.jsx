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
          link clicks, contact delivery outcomes and Rook opens. It uses random browser/session IDs.
          The collector records IP addresses and approximate country, region and city, plus
          device/browser categories.
        </p>
        <p>
          Contact fields and Rook conversations are excluded from analytics. Raw IPs expire after 7
          days; event and visit records after 30 days. Restricted recovery backups can retain
          deleted records for up to 7 additional days. Reports require owner access. Location comes
          from the network address, without a GPS request.
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
