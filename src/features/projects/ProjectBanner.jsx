import { m } from 'framer-motion';
import usePointerParallax from '../../shared/motion/usePointerParallax.js';

export default function ProjectBanner() {
  const { x, y, move, reset } = usePointerParallax();
  return (
    <div
      className="study-project-banner"
      onPointerMove={move}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      <m.img
        src="/assets/after-hours-city.webp"
        width="2172"
        height="724"
        alt=""
        loading="lazy"
        draggable={false}
        style={{ x, y }}
      />
      <div className="study-banner-copy">
        <p className="study-eyebrow">04 / Personal projects</p>
        <h2>Built after hours.</h2>
        <p>
          Personal tools, experiments and systems
          <br className="banner-break" /> I build outside work.
        </p>
      </div>
    </div>
  );
}
