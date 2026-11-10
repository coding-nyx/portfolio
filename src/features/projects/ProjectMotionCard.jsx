import { useState } from 'react';
import { m as Motion } from 'framer-motion';
import { useSiteMotion } from '../../shared/motion/useSiteMotion.js';

export default function ProjectMotionCard({ children, featured, compact = false }) {
  const { enabled } = useSiteMotion();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const lifted = enabled && (hovered || focused);
  return (
    <div
      className={`project-card-stack ${featured ? 'featured' : ''} ${compact ? 'compact' : ''}`}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'touch') setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <Motion.span
        className="project-paper project-paper-back"
        aria-hidden="true"
        style={{ rotate: -2, x: -7, y: -5 }}
      />
      <Motion.span
        className="project-paper project-paper-middle"
        aria-hidden="true"
        style={{ rotate: 2, x: 7, y: -1 }}
      />
      <Motion.article
        className={`island-list-card ${featured ? 'featured' : ''}`}
        initial={false}
        animate={{ y: lifted ? -2 : 0 }}
        transition={{ type: 'tween', duration: enabled ? 0.16 : 0, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {children}
      </Motion.article>
    </div>
  );
}
