import { useLayoutEffect, useRef } from 'react';

const EDGE_INSET = 24;
const OVERFLOW_TOLERANCE = 1;

export default function useCarouselStrip({ selectedIndex, selectors }) {
  const stripRef = useRef(null);
  const wrapperRef = useRef(null);

  useLayoutEffect(() => {
    const strip = stripRef.current;
    const wrapper = wrapperRef.current;
    if (!strip || !wrapper) return;
    let frame;
    let revealQueued = false;
    const updateEdges = () => {
      const remaining = Math.max(0, strip.scrollWidth - strip.clientWidth);
      const left = Math.max(0, Math.min(remaining, strip.scrollLeft));
      const overflowing = remaining > OVERFLOW_TOLERANCE;
      wrapper.dataset.overflowLeft = String(overflowing && left > OVERFLOW_TOLERANCE);
      wrapper.dataset.overflowRight = String(overflowing && remaining - left > OVERFLOW_TOLERANCE);
    };
    const revealButton = (button) => {
      const remaining = Math.max(0, strip.scrollWidth - strip.clientWidth);
      if (button && strip.contains(button) && remaining > OVERFLOW_TOLERANCE) {
        const bounds = strip.getBoundingClientRect();
        const item = button.getBoundingClientRect();
        const leftInset = strip.scrollLeft > OVERFLOW_TOLERANCE ? EDGE_INSET : 0;
        const rightInset = remaining - strip.scrollLeft > OVERFLOW_TOLERANCE ? EDGE_INSET : 0;
        if (item.left < bounds.left + leftInset)
          strip.scrollLeft += item.left - bounds.left - leftInset;
        else if (item.right > bounds.right - rightInset)
          strip.scrollLeft += item.right - bounds.right + rightInset;
      }
      updateEdges();
    };
    const revealSelected = () => revealButton(selectors.current[selectedIndex]);
    const focused = (event) => {
      const button = event.target.closest?.('[data-project-select]');
      if (button && strip.contains(button)) revealButton(button);
    };
    const queue = (reveal = false) => {
      revealQueued ||= reveal;
      if (frame !== undefined) return;
      frame = requestAnimationFrame(() => {
        frame = undefined;
        if (revealQueued) revealSelected();
        else updateEdges();
        revealQueued = false;
      });
    };
    const scrolled = () => queue();
    const resized = () => queue(true);
    revealSelected();
    strip.addEventListener('scroll', scrolled, { passive: true });
    strip.addEventListener('focusin', focused);
    window.addEventListener('resize', resized, { passive: true });
    const observer = new ResizeObserver(resized);
    observer.observe(strip);
    for (const button of strip.children) observer.observe(button);
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      observer.disconnect();
      strip.removeEventListener('scroll', scrolled);
      strip.removeEventListener('focusin', focused);
      window.removeEventListener('resize', resized);
    };
  }, [selectedIndex, selectors]);

  return { stripRef, wrapperRef };
}
