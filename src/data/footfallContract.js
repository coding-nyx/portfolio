// Public event vocabulary. Mirror the collector's versioned ingestion contract.
export const FOOTFALL_VERSION = 1;
export const FOOTFALL_MODULES = [
  'entry',
  'bio',
  'experience',
  'projects',
  'skills',
  'achievements',
  'resume',
  'personal',
  'contact',
  'rook',
];
const identifier = { type: 'uuid' };
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
  contact_result: { result: ['sent', 'error', 'unavailable'], form_id: identifier },
  contact_draft_open: {},
  rook_open: { entry_point: ['navigation'] },
  rook_submit: {
    interaction_id: identifier,
    input: ['typed', 'suggestion'],
    kind: ['question', 'command'],
  },
  rook_result: {
    interaction_id: identifier,
    result: ['live_reply', 'saved_reply', 'local_action', 'cancelled', 'error'],
    duration_ms: { type: 'integer', min: 0, max: 120000 },
  },
  contact_start: { form_id: identifier },
  contact_resume: { form_id: identifier },
  contact_submit: { form_id: identifier, result: ['valid', 'invalid'] },
  contact_abandon: { form_id: identifier, reason: ['section_exit', 'page_exit', 'cleared'] },
  module_engagement: {
    module: FOOTFALL_MODULES,
    active_seconds: { type: 'integer', min: 1, max: 300 },
  },
  skill_open: {
    skill_id: [
      'swift',
      'uikit',
      'swiftui',
      'spm',
      'kotlin',
      'android-compose',
      'typescript',
      'react-next',
      'firebase',
      'catalyst',
      'mcp',
      'linux',
    ],
  },
};
function validValue(schema, value) {
  if (Array.isArray(schema)) return schema.includes(value);
  if (schema.type === 'uuid')
    return (
      typeof value === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
    );
  return Number.isInteger(value) && value >= schema.min && value <= schema.max;
}
export function validFootfallContext(name, context) {
  const schema = Object.hasOwn(FOOTFALL_EVENTS, name) && FOOTFALL_EVENTS[name];
  if (!schema || !context || typeof context !== 'object' || Array.isArray(context)) return false;
  const required = Object.keys(schema).filter(
    (key) =>
      !(name === 'outbound_click' && key === 'project_id') &&
      !(name === 'contact_result' && key === 'form_id'),
  );
  return (
    required.every((key) => Object.hasOwn(context, key)) &&
    Object.keys(context).every(
      (key) => Object.hasOwn(schema, key) && validValue(schema[key], context[key]),
    )
  );
}
