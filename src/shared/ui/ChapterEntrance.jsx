import { useEffect, useRef } from 'react';
import { useSiteMotion } from '../motion/useSiteMotion.js';

export default function ChapterEntrance({ id, children }) {
  const body = useRef(null);
  const { enabled } = useSiteMotion();
  useEffect(() => {
    const element = body.current;
    if (!enabled || !element.animate || id === 'entry') return;
    let animation,
      inView = false,
      awaitingSelection = false;
    const enter = (selected) => {
      animation?.cancel();
      animation = element.animate(
        [
          { transform: `translateY(${selected ? 12 : 18}px)`, opacity: 0.88 },
          { transform: 'translateY(0)', opacity: 1 },
        ],
        { duration: selected ? 420 : 550, easing: 'cubic-bezier(.2,.7,.2,1)' },
      );
    };
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0].isIntersecting;
        if (visible && !inView) {
          enter(awaitingSelection);
          awaitingSelection = false;
        }
        inView = visible;
      },
      { rootMargin: '-80px 0px -8% 0px', threshold: 0 },
    );
    observer.observe(element.parentElement);
    const select = (event) => {
      if (event.detail?.id !== id) return;
      const box = element.parentElement.getBoundingClientRect();
      if (box.top < window.innerHeight * 0.9 && box.bottom > 80) enter(true);
      else awaitingSelection = true;
    };
    window.addEventListener('portfolio:chapter-select', select);
    return () => {
      observer.disconnect();
      animation?.cancel();
      window.removeEventListener('portfolio:chapter-select', select);
    };
  }, [enabled, id]);
  return (
    <div className="chapter-content" ref={body}>
      {children}
    </div>
  );
}
