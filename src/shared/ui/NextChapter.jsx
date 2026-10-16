import SpringAction from './SpringAction.jsx';

export default function NextChapter({ id, children }) {
  return (
    <SpringAction as="a" className="chapter-next" href={`#${id}`} data-sec={id}>
      Next: <b>{children} ↓</b>
    </SpringAction>
  );
}
