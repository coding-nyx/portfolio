import { TbPlayerPause, TbPlayerPlay } from 'react-icons/tb';
import { useSiteMotion } from '../shared/motion/useSiteMotion.js';

export default function SiteFooter() {
  const { enabled, systemReduced, toggle } = useSiteMotion();
  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} RAJ KUMAR S</span>
      <button
        className="motion-setting"
        type="button"
        aria-label="Enable site animations"
        aria-pressed={enabled}
        disabled={systemReduced}
        onClick={toggle}
      >
        {enabled ? (
          <TbPlayerPause size={15} aria-hidden="true" />
        ) : (
          <TbPlayerPlay size={15} aria-hidden="true" />
        )}
        {systemReduced ? 'Reduced motion' : enabled ? 'Motion on' : 'Motion off'}
      </button>
    </footer>
  );
}
