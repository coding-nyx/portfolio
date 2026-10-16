// Shared wire contract: data only, safe for both browser and server imports.
/** @typedef {{ role: 'user' | 'assistant', content: string }} RookMessage */
/** @typedef {{ answer: string, source: 'deepseek', model: string }} RookAnswer */
export const ROOK_ENDPOINT = '/api/rook';
export const ROOK_LIMITS = Object.freeze({
  maxMessages: 12,
  maxMessageCharacters: 2000,
  maxRequestBytes: 24000,
  timeoutMs: 25000,
  rateLimit: 30,
  rateWindowMs: 60000,
  maxConcurrent: 4,
});
