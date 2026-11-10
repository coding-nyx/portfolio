import { build } from 'vite';
// First-party ingestion uses the portfolio site's explicit Hosting rewrite.
process.env.VITE_FOOTFALL_COLLECTOR_URL = '/api/footfall/events';
process.env.VITE_FOOTFALL_PROPERTY_ID = 'portfolio';
await build();
