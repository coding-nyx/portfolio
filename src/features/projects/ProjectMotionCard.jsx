import { useState } from 'react';
import { m as Motion } from 'framer-motion';
import { useSiteMotion } from '../../shared/motion/useSiteMotion.js';
import usePointerSpring from '../../shared/motion/usePointerSpring.js';

export default function ProjectMotionCard({ children, featured, compact = false }) {
  const { enabled } = useSiteMotion();
  const pointer = usePointerSpring(enabled, 1.5);
  const [active, setActive] = useState(false);
  const spread = enabled && active;
  return (
    <div
      className={`project-card-stack ${featured ? 'featured' : ''} ${compact ? 'compact' : ''}`}
      onPointerMove={pointer.move}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'touch') setActive(true);
      }}
      onPointerLeave={() => {
        pointer.reset();
        setActive(false);
      }}
      onFocusCapture={() => setActive(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          pointer.reset();
          setActive(false);
        }
      }}
    >
      <Motion.span
        className="project-paper project-paper-back"
        aria-hidden="true"
        animate={{
          rotate: spread ? (compact ? -2.5 : -4.5) : -2,
          x: spread ? (compact ? -6 : -10) : -7,
          y: spread ? (compact ? -7 : -11) : -5,
        }}
        transition={{ duration: enabled ? 0.3 : 0 }}
      />
      <Motion.span
        className="project-paper project-paper-middle"
        aria-hidden="true"
        animate={{
          rotate: spread ? (compact ? 2 : 3) : 2,
          x: spread ? (compact ? 6 : 8) : 7,
          y: spread ? -5 : -1,
        }}
        transition={{ duration: enabled ? 0.3 : 0 }}
      />
      <Motion.article
        className={`island-list-card ${featured ? 'featured' : ''}`}
        style={{ rotateX: pointer.y, rotateY: pointer.x }}
        animate={{ y: spread ? -3 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      >
        {children}
      </Motion.article>
    </div>
  );
}
