import { systemPrompt } from './context.mjs';

export async function requestRookAnswer({ apiKey, model, messages, signal, fetchImpl }) {
  const response = await fetchImpl('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      thinking: { type: 'disabled' },
      max_tokens: 400,
      temperature: 0.2,
      stream: false,
    }),
    signal,
  });
  if (!response.ok) {
    const errors = { 402: 'provider_balance', 401: 'provider_auth', 429: 'provider_rate_limit' };
    return {
      status: response.status === 429 ? 429 : 502,
      body: { error: errors[response.status] || 'provider_unavailable' },
    };
  }
  const payload = await response.json();
  const answer = payload.choices?.[0]?.message?.content;
  if (typeof answer !== 'string' || !answer.trim())
    return { status: 502, body: { error: 'empty_response' } };
  return {
    status: 200,
    body: { answer: answer.trim(), source: 'deepseek', model: payload.model || model },
  };
}
