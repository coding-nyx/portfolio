import { useEffect, useRef } from 'react';
import { ROOK_LIMITS } from '../../data/rookContract.js';
import useRookConversation from './useRookConversation.js';
import RookMessage from './RookMessage.jsx';
import useRookDialog from './useRookDialog.js';
import './rook.css';

export default function RookDialog({
  open,
  onOpenChange,
  returnFocusRef,
  onOpenResume,
  onNavigate,
}) {
  const input = useRef(null);
  const transcript = useRef(null);
  const {
    query,
    setQuery,
    messages,
    busy,
    notice,
    suggestions,
    send: sendMessage,
    cancel,
  } = useRookConversation({ onOpenResume, onNavigate });
  const { panel, close } = useRookDialog({
    open,
    onOpenChange,
    returnFocusRef,
    initialFocusRef: input,
    cancel,
  });
  useEffect(() => {
    if (transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight;
  }, [messages, open]);
  const send = (value) => {
    input.current?.focus({ preventScroll: true });
    sendMessage(value);
  };
  if (!open) return null;
  return (
    <>
      <div className="rook-scrim" onClick={close} />
      <div
        ref={panel}
        id="rook-popover"
        className="rook-popover"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rook-title"
        aria-describedby="rook-sub"
      >
        <div className="rook-header">
          <div>
            <h2 id="rook-title">Rook</h2>
            <p id="rook-sub">Answers about Raj</p>
          </div>
          <button className="rook-close" type="button" aria-label="Close Rook" onClick={close}>
            ×
          </button>
        </div>
        {notice && (
          <p className="rook-status" role="status">
            {notice}
          </p>
        )}
        {busy && (
          <p className="rook-status" role="status">
            Thinking…
          </p>
        )}
        <div
          ref={transcript}
          className="rook-transcript"
          role="log"
          aria-live="polite"
          aria-busy={busy}
        >
          {messages.map((m, i) => (
            <RookMessage
              key={i}
              message={m}
              onNavigate={(target) => {
                cancel();
                onNavigate?.(target);
              }}
              onOpenResume={onOpenResume}
            />
          ))}
        </div>
        {!busy && suggestions.length > 0 && (
          <div className="rook-chips" role="group" aria-label="Suggested questions">
            {suggestions.map(({ label, question }) => (
              <button key={question} type="button" disabled={busy} onClick={() => send(question)}>
                {label}
              </button>
            ))}
          </div>
        )}
        <form
          className="rook-input"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <label className="sr-only" htmlFor="rook-q">
            Ask Rook a question
          </label>
          <input
            ref={input}
            id="rook-q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about Raj"
            maxLength={ROOK_LIMITS.maxMessageCharacters}
            autoComplete="off"
          />
          <button type="submit" disabled={busy || !query.trim()} aria-label="Send to Rook">
            {busy ? '…' : '↑'}
          </button>
        </form>
        <p className="rook-caption">Curiosity brought you here. Rook handles the rest.</p>
      </div>
    </>
  );
}
