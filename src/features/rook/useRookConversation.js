import { useCallback, useEffect, useRef, useState } from 'react';
import { askRookAgent } from '../../services/rookClient.js';
import { trackFootfallEvent } from '../../services/footfallAnalytics.js';
import { createRookMetrics } from '../../services/footfallInteractions.js';
import {
  getRookAction,
  getRookGuidance,
  getRookSuggestions,
  rookActionReply,
} from './rookConversationModel.js';

export default function useRookConversation({ onOpenResume, onNavigate }) {
  const request = useRef(null);
  const metric = useRef(null);
  const [metrics] = useState(() => createRookMetrics({ track: trackFootfallEvent }));
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
  const [notice, setNotice] = useState('');
  const cancel = useCallback(() => {
    request.current?.abort();
    metric.current?.finish('cancelled');
  }, []);
  useEffect(() => cancel, [cancel]);
  useEffect(() => {
    window.addEventListener('footfall-preference-change', metrics.reset);
    return () => window.removeEventListener('footfall-preference-change', metrics.reset);
  }, [metrics]);

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
    const { question: contextualQuestion, ...guidance } = getRookGuidance(text, messages);
    const action = getRookAction(text);
    const attempt = metrics.begin({
      input: value === undefined ? 'typed' : 'suggestion',
      kind: action ? 'command' : 'question',
    });
    metric.current = attempt;
    try {
      if (action) {
        attempt.finish('local_action');
        setMessages([
          ...next,
          { role: 'assistant', content: rookActionReply(action), ...guidance },
        ]);
        if (action.type === 'open_resume') onOpenResume?.();
        if (action.type === 'scroll') onNavigate?.(action.target);
        return;
      }
      let source;
      const answer = await askRookAgent({
        messages: [...messages, { role: 'user', content: contextualQuestion }],
        signal: request.current.signal,
        onMode: (mode) => {
          source = mode.source;
        },
      });
      if (!request.current.signal.aborted) {
        setMessages([...next, { role: 'assistant', content: answer, source, ...guidance }]);
        attempt.finish(source === 'deepseek' ? 'live_reply' : 'saved_reply');
      } else attempt.finish('cancelled');
    } catch {
      const cancelled = request.current?.signal.aborted;
      attempt.finish(cancelled ? 'cancelled' : 'error');
      setNotice(
        cancelled
          ? 'Response cancelled. You can ask again.'
          : 'The response could not be completed. Try again.',
      );
    } finally {
      pending.current = false;
      setBusy(false);
      request.current = null;
      metric.current = null;
    }
  };

  return {
    query,
    setQuery,
    messages,
    busy,
    notice,
    suggestions: getRookSuggestions(messages),
    send,
    cancel,
  };
}
