import { useCallback, useEffect, useRef, useState } from 'react';
import { askRookAgent } from '../../services/rookClient.js';

export default function useRookConversation({ onOpenResume, onNavigate }) {
  const request = useRef(null);
  const pending = useRef(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hi, I’m **Rook**. Ask about Raj’s iOS work, native mobile apps and public projects. Use Contact to compose a message to Raj.',
    },
  ]);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState(null);
  const [notice, setNotice] = useState('');
  const cancel = useCallback(() => request.current?.abort(), []);
  useEffect(() => cancel, [cancel]);

  const send = async (value) => {
    const text = (value ?? query).trim();
    if (!text || pending.current) return;
    pending.current = true;
    request.current = new AbortController();
    setQuery('');
    setBusy(true);
    setNotice('');
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    try {
      const answer = await askRookAgent({
        messages: next,
        signal: request.current.signal,
        onMode: setMode,
        onAction: (action) => {
          if (action.type === 'open_resume') onOpenResume?.();
          if (action.type === 'scroll') onNavigate?.(action.target);
        },
      });
      setMessages([...next, { role: 'assistant', content: answer }]);
    } catch {
      setNotice('Response cancelled. You can ask again.');
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };

  return { query, setQuery, messages, busy, mode, notice, send, cancel };
}
