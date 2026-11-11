import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App.jsx';
import AppProviders from './app/AppProviders.jsx';
import { applyAnalyticsOptOutLink } from './services/analyticsPreference.js';

// Apply QA/owner exclusion before any component can schedule analytics.
applyAnalyticsOptOutLink();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
