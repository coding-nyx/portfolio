import { ROOK_ENDPOINT, ROOK_LIMITS } from '../data/rookContract.js';
import { generateFallbackResponse } from './rookFallback.js';

export async function askRookAgent({ messages, onAction, onMode, signal }) {
  const history = messages
    .filter(
      (m) =>
        m &&
        ['user', 'assistant'].includes(m.role) &&
        typeof m.content === 'string' &&
        m.content.trim(),
    )
    .slice(-ROOK_LIMITS.maxMessages)
    .map(({ role, content }) => ({
      role,
      content: content.slice(0, ROOK_LIMITS.maxMessageCharacters),
    }));
  const encoder = new TextEncoder();
  let body = JSON.stringify({ messages: history });
  // Message count/character limits alone do not bound UTF-8 JSON bytes.
  while (history.length > 1 && encoder.encode(body).byteLength > ROOK_LIMITS.maxRequestBytes) {
    history.shift();
    body = JSON.stringify({ messages: history });
  }
  try {
    const response = await fetch(ROOK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal,
    });
    const data = await response.json();
    if (
      !response.ok ||
      data.source !== 'deepseek' ||
      typeof data.answer !== 'string' ||
      !data.answer.trim()
    )
      throw new Error(data.error || 'unavailable');
    onMode?.({ source: 'deepseek', model: data.model });
    return data.answer;
  } catch (error) {
    if (signal?.aborted) throw error;
    onMode?.({ source: 'preset', error: error.message });
    const reply = generateFallbackResponse(history);
    const text = reply.replace(/\[ACTION:[^\]]+\]/g, '').trim();
    const scroll = reply.match(/\[ACTION:SCROLL_TO:([a-z-]+)\]/);
    if (scroll) onAction?.({ type: 'scroll', target: scroll[1] });
    if (reply.includes('[ACTION:OPEN_RESUME]')) onAction?.({ type: 'open_resume' });
    return text;
  }
}
