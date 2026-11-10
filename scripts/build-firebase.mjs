import { build } from 'vite';
// Footfall writes directly to its separate Spark project's Firestore rules.
process.env.VITE_FOOTFALL_ENABLED = 'true';
process.env.VITE_FOOTFALL_PROPERTY_ID = 'portfolio';
await build();
