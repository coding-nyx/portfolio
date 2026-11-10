import { m as Motion } from 'framer-motion';
import { useSiteMotion } from '../motion/useSiteMotion.js';

export default function SpringAction({
  as = 'button',
  children,
  className = '',
  style,
  disabled,
  motionEnabled,
  ...props
}) {
  const { enabled: siteEnabled } = useSiteMotion();
  const enabled = siteEnabled && motionEnabled !== false && !disabled;
  const Element = as === 'a' ? Motion.a : Motion.button;
  return (
    <Element
      {...(as === 'button' ? { type: 'button', disabled } : {})}
      {...props}
      className={`spring-action ${className}`}
      style={style}
      whileHover={undefined}
      whileTap={enabled ? { scale: 0.985 } : undefined}
      transition={{ type: 'tween', duration: enabled ? 0.16 : 0, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </Element>
  );
}
