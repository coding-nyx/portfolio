import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const MENU_GAP = 8;
const VIEWPORT_MARGIN = 16;
const NAVIGATION_CLEARANCE = 84;
const MAX_MENU_HEIGHT = 360;
const TYPEAHEAD_DELAY = 650;

export default function useProjectPicker({
  count,
  selectedIndex,
  onSelect,
  labels = [],
  onTriggerHidden,
}) {
  const itemCount = Math.max(0, Math.floor(count || 0));
  const normalize = useCallback(
    (index) => {
      if (!itemCount) return 0;
      const value = Number.isFinite(index) ? Math.trunc(index) : 0;
      return ((value % itemCount) + itemCount) % itemCount;
    },
    [itemCount],
  );
  const [open, setOpen] = useState(false);
  const [activeIndex, setActive] = useState(() => normalize(selectedIndex));
  const [placement, setPlacement] = useState('below');
  const [menuStyle, setMenuStyle] = useState({ maxHeight: MAX_MENU_HEIGHT });
  const pickerRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const search = useRef({ value: '', at: 0 });

  const setActiveIndex = useCallback(
    (next) => setActive((current) => normalize(typeof next === 'function' ? next(current) : next)),
    [normalize],
  );
  const closePicker = useCallback((restoreFocus = true) => {
    setOpen(false);
    search.current = { value: '', at: 0 };
    if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
  }, []);
  const openPicker = useCallback(
    (nextIndex) => {
      if (!itemCount) return;
      search.current = { value: '', at: 0 };
      setActive(normalize(typeof nextIndex === 'number' ? nextIndex : selectedIndex));
      setOpen(true);
    },
    [itemCount, normalize, selectedIndex],
  );
  const selectProject = useCallback(
    (index) => {
      if (!itemCount) return;
      onSelect(normalize(index));
      closePicker(true);
    },
    [closePicker, itemCount, normalize, onSelect],
  );

  const measureMenu = useCallback(() => {
    const trigger = triggerRef.current;
    const picker = pickerRef.current;
    const list = listRef.current;
    if (!trigger || !picker || !list) return;
    const anchor = trigger.getBoundingClientRect();
    const viewport = window.visualViewport;
    const viewportTop = viewport?.offsetTop || 0;
    const viewportBottom = viewportTop + (viewport?.height || window.innerHeight);
    const labHeight = parseFloat(getComputedStyle(picker).getPropertyValue('--lab-height')) || 0;
    const topLimit = Math.max(NAVIGATION_CLEARANCE + labHeight, viewportTop + VIEWPORT_MARGIN);
    const below = Math.max(0, viewportBottom - VIEWPORT_MARGIN - anchor.bottom - MENU_GAP);
    const above = Math.max(0, anchor.top - topLimit - MENU_GAP);
    const borderHeight = list.offsetHeight - list.clientHeight;
    const desiredHeight = Math.min(
      (list.scrollHeight || itemCount * 64 + 20) + borderHeight,
      MAX_MENU_HEIGHT,
    );
    const nextPlacement = below < desiredHeight && above > below ? 'above' : 'below';
    const available = nextPlacement === 'above' ? above : below;
    const maxHeight = Math.min(MAX_MENU_HEIGHT, available);
    setPlacement(nextPlacement);
    setMenuStyle((current) => (current.maxHeight === maxHeight ? current : { maxHeight }));
  }, [itemCount]);

  useLayoutEffect(() => {
    if (!open) return;
    // Measure after the popup has layout. The pending frame is cancelled if it
    // closes immediately, and later scroll measurements never steal focus.
    const frame = requestAnimationFrame(() => {
      measureMenu();
      listRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [measureMenu, open]);

  useLayoutEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const option = list?.querySelector(`[data-project-index="${activeIndex}"]`);
    if (!option || !list.clientHeight) return;
    const listBox = list.getBoundingClientRect();
    const optionBox = option.getBoundingClientRect();
    const top = optionBox.top - listBox.top + list.scrollTop - list.clientTop;
    const bottom = top + optionBox.height;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight)
      list.scrollTop = bottom - list.clientHeight;
  }, [activeIndex, menuStyle.maxHeight, open, placement]);

  useEffect(() => {
    if (!open) return;
    const outside = (event) => {
      if (!pickerRef.current?.contains(event.target)) closePicker(false);
    };
    let frame;
    const scroll = (event) => {
      // Native focus or pointer activation may scroll the document before the
      // click arrives. Keep the anchored popup open and only remeasure it.
      if (event.target instanceof Node && listRef.current?.contains(event.target)) return;
      if (frame !== undefined) return;
      frame = requestAnimationFrame(() => {
        frame = undefined;
        measureMenu();
      });
    };
    const resize = () => {
      const visible = Boolean(triggerRef.current?.checkVisibility());
      closePicker(visible);
      if (!visible) onTriggerHidden?.();
    };
    document.addEventListener('pointerdown', outside, true);
    window.addEventListener('scroll', scroll, true);
    window.addEventListener('resize', resize);
    const viewport = window.visualViewport;
    viewport?.addEventListener('resize', resize);
    viewport?.addEventListener('scroll', scroll);
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      document.removeEventListener('pointerdown', outside, true);
      window.removeEventListener('scroll', scroll, true);
      window.removeEventListener('resize', resize);
      viewport?.removeEventListener('resize', resize);
      viewport?.removeEventListener('scroll', scroll);
    };
  }, [closePicker, measureMenu, onTriggerHidden, open]);

  const handleTriggerKeyDown = useCallback(
    (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || !itemCount) return;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const delta = event.key === 'ArrowDown' ? 1 : -1;
        if (open) {
          setActiveIndex(activeIndex + delta);
          listRef.current?.focus({ preventScroll: true });
        } else openPicker(normalize(selectedIndex + delta));
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        openPicker(event.key === 'Home' ? 0 : itemCount - 1);
      } else if (event.key === 'Escape' && open) {
        event.preventDefault();
        event.stopPropagation();
        closePicker(true);
      }
      // Enter and Space retain the trigger button's native click behavior.
    },
    [
      activeIndex,
      closePicker,
      itemCount,
      normalize,
      open,
      openPicker,
      selectedIndex,
      setActiveIndex,
    ],
  );
  const handleListKeyDown = useCallback(
    (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || !itemCount) return;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex(activeIndex + (event.key === 'ArrowDown' ? 1 : -1));
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        setActiveIndex(event.key === 'Home' ? 0 : itemCount - 1);
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectProject(activeIndex);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closePicker(true);
      } else if (event.key.length === 1 && event.key.trim() && labels.length) {
        const at = performance.now();
        const character = event.key.toLocaleLowerCase();
        const value =
          at - search.current.at <= TYPEAHEAD_DELAY ? search.current.value + character : character;
        search.current = { value, at };
        const prefix = [...value].every((letter) => letter === character) ? character : value;
        const find = (query) => {
          for (let offset = 1; offset <= itemCount; offset++) {
            const index = normalize(activeIndex + offset);
            if (
              String(labels[index] || '')
                .toLocaleLowerCase()
                .startsWith(query)
            )
              return index;
          }
          return -1;
        };
        const match = find(prefix);
        if (match >= 0) {
          event.preventDefault();
          setActiveIndex(match);
        }
      }
      // Tab is deliberately untouched; the component's blur handler closes it
      // after the browser moves focus naturally to the next control.
    },
    [activeIndex, closePicker, itemCount, labels, normalize, selectProject, setActiveIndex],
  );
  const handleBlur = useCallback(
    (event) => {
      if (!pickerRef.current?.contains(event.relatedTarget)) {
        closePicker(false);
        // A breakpoint can hide the focused list before its resize event runs.
        if (triggerRef.current && !triggerRef.current.checkVisibility()) onTriggerHidden?.();
      }
    },
    [closePicker, onTriggerHidden],
  );

  return {
    open,
    activeIndex,
    pickerRef,
    triggerRef,
    listRef,
    placement,
    menuStyle,
    openPicker,
    closePicker,
    selectProject,
    handleTriggerKeyDown,
    handleListKeyDown,
    handleBlur,
    setActiveIndex,
  };
}
