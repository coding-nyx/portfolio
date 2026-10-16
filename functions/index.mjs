import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { createRookHandler } from '../server/rook.mjs';
import { ROOK_LIMITS } from '../src/data/rookContract.js';
const deepseekKey = defineSecret('DEEPSEEK_API_KEY');
let handler;
export const rook = onRequest(
  {
    region: 'us-central1',
    secrets: [deepseekKey],
    timeoutSeconds: 40,
    memory: '256MiB',
    minInstances: 0,
    maxInstances: 1,
    concurrency: ROOK_LIMITS.maxConcurrent,
    invoker: 'public',
    cors: false,
  },
  (req, res) => {
    handler ??= createRookHandler({
      apiKey: deepseekKey.value(),
      maxConcurrent: ROOK_LIMITS.maxConcurrent,
    });
    return handler(req, res);
  },
);
