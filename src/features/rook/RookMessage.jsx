import ReactMarkdown from 'react-markdown';
import { CHAPTERS } from '../../data/chapters.js';

export default function RookMessage({ message, onNavigate, onOpenResume }) {
  const evidence = message.evidence?.filter(
    (link) => !link.href || !message.content.includes(link.href),
  );
  const followChapterLink = (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    const href = event.target.closest('a')?.getAttribute('href');
    const target = href?.startsWith('#') ? href.slice(1) : null;
    if (!CHAPTERS.some(([id]) => id === target)) return;
    event.preventDefault();
    event.stopPropagation();
    onNavigate(target);
  };

  return (
    <div className={`rook-message ${message.role}`} onClick={followChapterLink}>
      {message.role === 'user' ? (
        message.content
      ) : (
        <>
          {message.source === 'preset' && (
            <p className="rook-status" data-source="preset">
              Live answer unavailable. Showing saved portfolio information.
            </p>
          )}
          <ReactMarkdown>{message.content}</ReactMarkdown>
          {evidence?.length > 0 && (
            <div className="rook-evidence" role="group" aria-label="Related portfolio links">
              <span>Related portfolio</span>
              <div>
                {evidence.map((link) =>
                  link.kind === 'resume' ? (
                    <button key="resume" type="button" onClick={onOpenResume}>
                      {link.label} ↗
                    </button>
                  ) : (
                    <a
                      key={link.href}
                      href={link.href}
                      {...(!link.href.startsWith('#')
                        ? { target: '_blank', rel: 'noreferrer' }
                        : {})}
                    >
                      {link.label} {link.href.startsWith('#') ? '→' : '↗'}
                    </a>
                  ),
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
