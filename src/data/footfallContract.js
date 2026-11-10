// Public event vocabulary. Mirror the collector's versioned ingestion contract.
export const FOOTFALL_VERSION = 1;
export const FOOTFALL_EVENTS = {
  page_view: {},
  section_view: {
    chapter_id: [
      'entry',
      'bio',
      'experience',
      'projects',
      'skills',
      'achievements',
      'resume',
      'personal',
      'contact',
    ],
  },
  project_open: {
    project_id: ['worktracker', 'hermes-companion', 'tally', 'a0090-meta', 'agent-os'],
    entry_point: ['grid', 'carousel', 'island'],
  },
  resume_open: { entry_point: ['hero', 'navigation', 'resume', 'rook'] },
  outbound_click: {
    destination: ['linkedin', 'github', 'project_live', 'project_source'],
    project_id: ['worktracker', 'hermes-companion', 'tally', 'a0090-meta', 'agent-os'],
  },
  contact_result: { result: ['sent', 'error'] },
  contact_draft_open: {},
  rook_open: { entry_point: ['navigation'] },
};
export function validFootfallContext(name, context) {
  const schema = Object.hasOwn(FOOTFALL_EVENTS, name) && FOOTFALL_EVENTS[name];
  if (!schema || !context || typeof context !== 'object' || Array.isArray(context)) return false;
  const required = Object.keys(schema).filter(
    (key) => !(name === 'outbound_click' && key === 'project_id'),
  );
  return (
    required.every((key) => Object.hasOwn(context, key)) &&
    Object.keys(context).every(
      (key) => Object.hasOwn(schema, key) && schema[key].includes(context[key]),
    )
  );
}
