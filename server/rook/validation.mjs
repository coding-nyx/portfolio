import { ROOK_LIMITS } from '../../src/data/rookContract.js';

export class RookRequestError extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
  }
}

export async function readMessages(req) {
  let raw;
  if (Buffer.isBuffer(req.rawBody)) {
    if (req.rawBody.length > ROOK_LIMITS.maxRequestBytes)
      throw new RookRequestError(413, 'input_too_large');
    raw = req.rawBody;
  } else {
    const chunks = [];
    let bytes = 0;
    for await (const chunk of req) {
      const buffer = Buffer.from(chunk);
      bytes += buffer.length;
      if (bytes > ROOK_LIMITS.maxRequestBytes) throw new RookRequestError(413, 'input_too_large');
      chunks.push(buffer);
    }
    raw = Buffer.concat(chunks);
  }
  let input;
  try {
    input = JSON.parse(raw.toString('utf8'));
  } catch {
    throw new RookRequestError(400, 'invalid_json');
  }
  const messages = input?.messages;
  const valid =
    Array.isArray(messages) &&
    messages.length > 0 &&
    messages.length <= ROOK_LIMITS.maxMessages &&
    messages.every(
      (message) =>
        message &&
        ['user', 'assistant'].includes(message.role) &&
        typeof message.content === 'string' &&
        message.content.trim() &&
        message.content.length <= ROOK_LIMITS.maxMessageCharacters,
    ) &&
    messages.at(-1).role === 'user';
  if (!valid) throw new RookRequestError(400, 'invalid_messages');
  return messages.map(({ role, content }) => ({ role, content }));
}
