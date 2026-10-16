import { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { useSiteMotion } from '../../context/MotionContext';
import usePointerSpring from '../../hooks/usePointerSpring';

export default function SpringAction({ as = 'button', children, className = '', onClick, onPointerMove, onPointerLeave, style, disabled, motionEnabled, ...props }) {
  const { enabled: siteEnabled } = useSiteMotion();
  const enabled = siteEnabled && motionEnabled !== false;
  const pointer = usePointerSpring(enabled && !disabled, 3);
  const [presses, setPresses] = useState(0);
  const Element = as === 'a' ? Motion.a : Motion.button;
  return <Element {...(as === 'button' ? { type: 'button', disabled } : {})} {...props} className={`spring-action ${className}`} style={{ ...style, x: pointer.x, y: pointer.y }}
    onPointerMove={event => { pointer.move(event); onPointerMove?.(event); }}
    onPointerLeave={event => { pointer.reset(); onPointerLeave?.(event); }}
    onBlur={event => { pointer.reset(); props.onBlur?.(event); }}
    onClick={event => { if (enabled && !disabled) setPresses(count => count + 1); onClick?.(event); }}
    whileHover={enabled && !disabled ? { scale: 1.025 } : undefined}
    whileTap={enabled && !disabled ? { scale: .96 } : undefined}
    transition={{ type: 'spring', stiffness: 420, damping: 20 }}>
    {children}
    {enabled && presses > 0 && <Motion.span key={presses} className="action-ripple" aria-hidden="true" initial={{ scale: 1, opacity: .4 }} animate={{ scaleX: 1.12, scaleY: 1.45, opacity: 0 }} transition={{ duration: .45 }} />}
  </Element>;
}
