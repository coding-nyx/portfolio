import { useState } from 'react';
import { FiArrowUp } from 'react-icons/fi';
import { profileData } from '../data/portfolio.js';
import './footer.css';
import { analyticsOptedOut, setAnalyticsOptOut } from '../services/analyticsPreference.js';

export default function SiteFooter() {
  const [optedOut, setOptedOut] = useState(() => analyticsOptedOut());
  const systemOptOut = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  return (
    <footer className="study-footer site-footer">
      <small>
        © {new Date().getFullYear()} {profileData.name}
      </small>
      <a className="footer-top" href="#entry">
        Back to top <FiArrowUp aria-hidden="true" />
      </a>
      <details className="tracking-disclosure">
        <summary>Visitor analytics</summary>
        <p>
          This site measures document visits, sections viewed, project and résumé opens, external
          link clicks, skill details, approximate active time, contact-form progress and delivery
          outcomes, and Rook submissions and response outcomes. It uses random browser/session IDs.
          Footfall's visitor log stores device/browser categories, browser language and time zone.
          It does not store IP addresses or device coordinates.
        </p>
        <p>
          Contact fields and Rook conversations are excluded from analytics. Reports cover 30 days;
          older Footfall records remain stored until the owner runs cleanup. Reports require owner
          access. Google Analytics uses its own analytics cookies and derives approximate country
          and city from network information for aggregate geography reports. These estimates are not
          attached to Footfall's individual browser timelines. Both integrations follow the same
          opt-out choice; no device-location permission is requested.
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
