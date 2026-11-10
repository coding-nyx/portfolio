// Public, create-only event transport. No Auth token, IP lookup or server secret.
export function encodeValue(value) {
  if (value === null) return { nullValue: null };
  if (typeof value === 'number') return { integerValue: String(value) };
  if (typeof value === 'string') return { stringValue: value };
  return { mapValue: { fields: encodeFields(value) } };
}
export const encodeFields = (value) =>
  Object.fromEntries(Object.entries(value).map(([key, item]) => [key, encodeValue(item)]));
export function decodeFields(fields = {}) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      'timestampValue' in value
        ? Date.parse(value.timestampValue)
        : 'integerValue' in value
          ? Number(value.integerValue)
          : 'mapValue' in value
            ? decodeFields(value.mapValue.fields)
            : 'nullValue' in value
              ? null
              : value.stringValue,
    ]),
  );
}
export function browserContext(navigator) {
  const ua = navigator.userAgent || '';
  return {
    device: /iPad|Tablet/i.test(ua) ? 'Tablet' : /Mobi|Android/i.test(ua) ? 'Mobile' : 'Desktop',
    browser: /Edg\//.test(ua)
      ? 'Edge'
      : /Firefox\//.test(ua)
        ? 'Firefox'
        : /Chrome\//.test(ua)
          ? 'Chrome'
          : /Safari\//.test(ua)
            ? 'Safari'
            : 'Other',
    language: (navigator.language || 'unknown').slice(0, 35),
    timeZone: (Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown').slice(0, 80),
  };
}
export function createFirestoreSender({ projectId, property, origin, client, fetch: send }) {
  return async (endpoint, options) => {
    const batch = JSON.parse(options.body);
    const results = await Promise.all(
      batch.events.map(async (event) => {
        const response = await send(endpoint, {
          ...options,
          body: JSON.stringify({
            writes: [
              {
                update: {
                  name: `projects/${projectId}/databases/(default)/documents/footfall_events/${property}_${event.eventId}`,
                  fields: encodeFields({
                    version: batch.version,
                    property,
                    ...event,
                    origin,
                    ...client,
                  }),
                },
                currentDocument: { exists: false },
                updateTransforms: [{ fieldPath: 'receivedAt', setToServerValue: 'REQUEST_TIME' }],
              },
            ],
          }),
        });
        // Create preconditions make retrying an acknowledged UUID idempotent.
        return {
          id: event.eventId,
          status: response.status,
          ok: response.ok || response.status === 409,
        };
      }),
    );
    const failed = results.find((result) => !result.ok);
    return new Response(
      JSON.stringify({
        accepted: results.filter((result) => result.ok).map((result) => result.id),
      }),
      {
        status: failed?.status || 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  };
}
