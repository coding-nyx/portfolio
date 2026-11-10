import { useLayoutEffect, useRef } from 'react';

const controllers = new WeakMap();
const EASING = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

// Native callers can request the same close animation as the summary control.
export function setDisclosureOpen(element, open) {
  if (!element) return;
  const request = controllers.get(element);
  if (request) request(Boolean(open));
  else element.open = Boolean(open);
}

export default function useDisclosureMotion(detailsRef, enabled, open) {
  const controller = useRef(null);
  const initialized = useRef(false);
  const initialOpen = useRef(open);
  const collapsedExtra = useRef(0);

  useLayoutEffect(() => {
    const details = detailsRef.current;
    const summary = details?.querySelector(':scope > summary');
    if (!details || !summary) return;
    if (!initialized.current) {
      collapsedExtra.current =
        details.getBoundingClientRect().height - summary.getBoundingClientRect().height;
      if (initialOpen.current !== undefined) details.open = Boolean(initialOpen.current);
      initialized.current = true;
    }
    let desiredOpen = details.open;
    let animation;
    let measuring = false;
    const originalHeight = details.style.height;
    const originalOverflow = details.style.overflow;

    const cancelAnimation = () => {
      if (!animation) return;
      animation.onfinish = null;
      animation.oncancel = null;
      animation.cancel();
      animation = undefined;
    };
    const restoreStyles = () => {
      details.style.height = originalHeight;
      details.style.overflow = originalOverflow;
      delete details.dataset.disclosureMotion;
    };
    const finish = () => {
      if (
        !desiredOpen &&
        details.contains(document.activeElement) &&
        !summary.contains(document.activeElement)
      )
        summary.focus({ preventScroll: true });
      details.open = desiredOpen;
      cancelAnimation();
      restoreStyles();
    };
    const request = (nextOpen) => {
      if (nextOpen === desiredOpen && !animation) return;
      desiredOpen = nextOpen;
      if (
        !desiredOpen &&
        details.contains(document.activeElement) &&
        !summary.contains(document.activeElement)
      )
        summary.focus({ preventScroll: true });
      if (
        !enabled ||
        typeof details.animate !== 'function' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        finish();
        return;
      }
      // Capture the rendered height before cancelling; reversing a rapid toggle
      // begins exactly where the previous animation stopped.
      const startHeight = details.getBoundingClientRect().height;
      if (!details.open)
        collapsedExtra.current = startHeight - summary.getBoundingClientRect().height;
      details.style.height = `${startHeight}px`;
      cancelAnimation();
      details.style.overflow = 'hidden';
      details.open = true;
      let endHeight;
      if (desiredOpen) {
        measuring = true;
        details.style.height = 'auto';
        endHeight = details.getBoundingClientRect().height;
        details.style.height = `${startHeight}px`;
        measuring = false;
      } else {
        // Measure the closed spacing before opening, so styles such as an
        // [open] summary margin cannot leave a snap at the end of closing.
        endHeight = summary.getBoundingClientRect().height + collapsedExtra.current;
      }
      if (Math.abs(startHeight - endHeight) < 0.5) {
        finish();
        return;
      }
      details.dataset.disclosureMotion = desiredOpen ? 'opening' : 'closing';
      animation = details.animate([{ height: `${startHeight}px` }, { height: `${endHeight}px` }], {
        duration: 180,
        easing: EASING,
        fill: 'forwards',
      });
      animation.onfinish = finish;
    };
    const resize = () => {
      if (animation && !measuring) finish();
    };
    const click = (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      const clickedSummary = event.target.closest?.('summary');
      if (clickedSummary !== summary) return;
      // Links or other controls inside a summary retain their native action.
      const interactive = event.target.closest?.('a,button,input,select,textarea,label');
      if (interactive && summary.contains(interactive)) return;
      event.preventDefault();
      request(!desiredOpen);
    };
    controllers.set(details, request);
    controller.current = { request, click };
    window.addEventListener('resize', resize, { passive: true });
    return () => {
      window.removeEventListener('resize', resize);
      controllers.delete(details);
      controller.current = null;
      finish();
    };
  }, [detailsRef, enabled]);

  useLayoutEffect(() => {
    if (open !== undefined) controller.current?.request(Boolean(open));
  }, [open]);

  return (event) => controller.current?.click(event);
}
