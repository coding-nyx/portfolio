import { useEffect, useRef } from 'react';
import { m as Motion, useAnimationControls } from 'framer-motion';
import { useSiteMotion } from '../../shared/motion/useSiteMotion.js';
import usePointerSpring from '../../shared/motion/usePointerSpring.js';

export default function RookLauncher({ open, onAsk }) {
  const { enabled } = useSiteMotion();
  const face = useRef(null);
  const eyes = usePointerSpring(enabled, 6);
  const controls = useAnimationControls();
  const { move, reset } = eyes;
  useEffect(() => {
    if (!enabled) {
      controls.stop();
      controls.set({ rotate: 0, y: 0 });
      return;
    }
    const follow = (event) => {
      if (face.current?.checkVisibility())
        move({
          currentTarget: face.current,
          clientX: event.clientX,
          clientY: event.clientY,
          pointerType: event.pointerType,
        });
    };
    window.addEventListener('pointermove', follow, { passive: true });
    document.documentElement.addEventListener('pointerleave', reset);
    window.addEventListener('blur', reset);
    return () => {
      window.removeEventListener('pointermove', follow);
      document.documentElement.removeEventListener('pointerleave', reset);
      window.removeEventListener('blur', reset);
    };
  }, [enabled, move, reset, controls]);
  const greet = () => {
    if (enabled)
      controls.start({ rotate: [0, -7, 5, 0], y: [0, -2, 0], transition: { duration: 0.45 } });
  };
  return (
    <Motion.button
      className="nask"
      type="button"
      data-ask
      aria-haspopup="dialog"
      aria-controls="rook-popover"
      aria-expanded={!!open}
      aria-label="Ask Rook"
      title="Ask Rook"
      onPointerEnter={greet}
      onFocus={greet}
      onClick={(event) => onAsk(event.currentTarget)}
      whileTap={enabled ? { scale: 0.94 } : undefined}
    >
      <Motion.svg
        ref={face}
        animate={controls}
        width="34"
        height="36"
        viewBox="0 0 132 142"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M66 35V21" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        <circle cx="66" cy="15" r="7" fill="currentColor" />
        <rect
          x="22"
          y="35"
          width="88"
          height="76"
          rx="26"
          fill="#29231F"
          stroke="currentColor"
          strokeWidth="5"
        />
        <path d="M13 61V82M119 61V82" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <rect x="32" y="47" width="68" height="41" rx="15" fill="#111114" />
        <Motion.g style={{ x: eyes.x, y: eyes.y }}>
          <rect x="46" y="59" width="8" height="15" rx="4" fill="#FFE0C9" />
          <rect x="78" y="59" width="8" height="15" rx="4" fill="#FFE0C9" />
        </Motion.g>
        <path
          d="M57 97Q66 104 75 97M42 113L37 126M90 113L95 126"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </Motion.svg>
    </Motion.button>
  );
}
