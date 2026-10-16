import { ROOK_LIMITS } from '../src/data/rookContract.js';
import { readMessages, RookRequestError } from './rook/validation.mjs';
import { requestRookAnswer } from './rook/provider.mjs';

// Keep the public server entry point stable for Vite, Firebase, and existing consumers.
export { systemPrompt } from './rook/context.mjs';

export function createRookHandler({
  apiKey,
  model = 'deepseek-flash',
  fetchImpl = fetch,
  timeoutMs = ROOK_LIMITS.timeoutMs,
  rateLimit = ROOK_LIMITS.rateLimit,
  rateWindowMs = ROOK_LIMITS.rateWindowMs,
  maxConcurrent = ROOK_LIMITS.maxConcurrent,
} = {}) {
  const visits = new Map();
  let active = 0;

  return async function rook(req, res) {
    const json = (status, body) => {
      res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(JSON.stringify(body));
    };
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return json(405, { error: 'method_not_allowed' });
    }
    if (!apiKey) return json(503, { error: 'not_configured' });
    if (!/^application\/json\b/i.test(req.headers['content-type'] || ''))
      return json(415, { error: 'json_required' });

    const peer = req.ip || req.socket?.remoteAddress || 'local';
    const now = Date.now();
    for (const [id, visit] of visits) if (now - visit.start >= rateWindowMs) visits.delete(id);
    const usage = visits.get(peer) || { start: now, count: 0 };
    if (usage.count >= rateLimit) {
      res.setHeader('Retry-After', String(Math.ceil((rateWindowMs - (now - usage.start)) / 1000)));
      return json(429, { error: 'rate_limited' });
    }
    if (active >= maxConcurrent) return json(429, { error: 'busy' });
    usage.count++;
    visits.set(peer, usage);

    let messages;
    try {
      messages = await readMessages(req);
    } catch (error) {
      return json(error instanceof RookRequestError ? error.status : 400, {
        error: error instanceof RookRequestError ? error.message : 'invalid_json',
      });
    }

    if (active >= maxConcurrent) return json(429, { error: 'busy' });
    active++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const disconnect = () => {
      if (!res.writableEnded) controller.abort();
    };
    res.on('close', disconnect);
    try {
      const { status, body } = await requestRookAnswer({
        apiKey,
        model,
        messages,
        signal: controller.signal,
        fetchImpl,
      });
      if (!res.destroyed) json(status, body);
    } catch {
      if (!res.destroyed)
        json(controller.signal.aborted ? 504 : 502, {
          error: controller.signal.aborted ? 'timeout' : 'provider_unavailable',
        });
    } finally {
      clearTimeout(timer);
      res.off('close', disconnect);
      active--;
    }
  };
}
