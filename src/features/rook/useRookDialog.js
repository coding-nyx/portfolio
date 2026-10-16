import { useCallback, useEffect, useRef } from 'react';

export default function useRookDialog({
  open = true,
  onOpenChange,
  returnFocusRef,
  initialFocusRef,
  cancel,
}) {
  const panel = useRef(null);
  const close = useCallback(() => {
    cancel?.();
    onOpenChange(false);
    requestAnimationFrame(() => {
      const visible = (element) =>
        element?.checkVisibility() && getComputedStyle(element).visibility !== 'hidden';
      const opener = returnFocusRef?.current;
      const fallback = [...document.querySelectorAll('[data-ask]')].find(visible);
      (visible(opener) ? opener : fallback)?.focus({ preventScroll: true });
    });
  }, [cancel, onOpenChange, returnFocusRef]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const body = document.body;
    const previous = {
      rootOverflow: root.style.overflow,
      bodyOverflow: body.style.overflow,
      scrollbarGutter: root.style.scrollbarGutter,
    };
    root.style.scrollbarGutter = 'stable';
    root.style.overflow = 'hidden';
    body.style.overflow = 'hidden';

    const viewport = window.visualViewport;
    const syncViewport = () => {
      const element = panel.current;
      if (!element) return;
      const height = viewport?.height ?? window.innerHeight;
      element.style.setProperty('--rook-viewport-height', `${height}px`);
      element.style.setProperty('--rook-viewport-top', `${viewport?.offsetTop ?? 0}px`);
      element.dataset.compact = String(height <= 500);
    };
    syncViewport();
    initialFocusRef.current?.focus({ preventScroll: true });
    viewport?.addEventListener('resize', syncViewport);
    viewport?.addEventListener('scroll', syncViewport);
    window.addEventListener('resize', syncViewport);

    const key = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...panel.current.querySelectorAll('button,input,a[href]')].filter(
        (element) =>
          !element.disabled &&
          element.checkVisibility() &&
          getComputedStyle(element).visibility !== 'hidden',
      );
      if (!focusable.length) return;
      event.preventDefault();
      const index = focusable.indexOf(document.activeElement);
      const next =
        index < 0
          ? event.shiftKey
            ? focusable.length - 1
            : 0
          : (index + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length;
      // Let the browser reveal links that are above/below the transcript's viewport.
      focusable[next].focus();
    };
    document.addEventListener('keydown', key, true);
    return () => {
      root.style.overflow = previous.rootOverflow;
      body.style.overflow = previous.bodyOverflow;
      root.style.scrollbarGutter = previous.scrollbarGutter;
      viewport?.removeEventListener('resize', syncViewport);
      viewport?.removeEventListener('scroll', syncViewport);
      window.removeEventListener('resize', syncViewport);
      document.removeEventListener('keydown', key, true);
    };
  }, [open, close, initialFocusRef]);

  return { panel, close };
}
