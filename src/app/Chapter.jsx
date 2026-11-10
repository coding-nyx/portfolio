import ChapterEntrance from '../shared/ui/ChapterEntrance.jsx';

export default function Chapter({ id, children, full = false, number, label, className = '' }) {
  return (
    <section
      id={id}
      className={className || (full ? 'study-entry' : 'study-chapter')}
      aria-labelledby={`h-${id}`}
    >
      {label && (
        <div className="study-section-label">
          <span>{number}</span>
          <span>{label}</span>
        </div>
      )}
      <ChapterEntrance id={id}>{children}</ChapterEntrance>
    </section>
  );
}
