import ChapterEntrance from '../shared/ui/ChapterEntrance.jsx';

export default function Chapter({ id, children, full = false }) {
  return (
    <section id={id} className={full ? 'chapter full' : 'chapter'} aria-labelledby={`h-${id}`}>
      <ChapterEntrance id={id}>{children}</ChapterEntrance>
    </section>
  );
}
