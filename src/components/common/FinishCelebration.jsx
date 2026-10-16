import { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { TbSparkles } from 'react-icons/tb';
import { useSiteMotion } from '../../context/MotionContext';
import SpringAction from './SpringAction';

const pieces = [[-72,-72,30],[-45,-110,-60],[-12,-128,100],[25,-115,-45],[60,-88,70],[80,-48,-90],[-83,-35,110],[8,-90,-30]];

export default function FinishCelebration({ title }) {
  const { enabled } = useSiteMotion();
  const [burst, setBurst] = useState(0);
  return <span className="finish-celebration">
    <SpringAction className="race-status" aria-label={`Celebrate finishing ${title}`} onClick={() => setBurst(count => count + 1)}><span aria-hidden="true">✓</span> Finisher <TbSparkles size={13} aria-hidden="true" /></SpringAction>
    {enabled && burst > 0 && <span className="finish-confetti" key={burst} aria-hidden="true">{pieces.map(([x, y, rotate], index) => <Motion.i key={index} className={`finish-piece-${index % 3}`} initial={{ x: 0, y: 0, opacity: 0, rotate: 0 }} animate={{ x, y: [0, y, y * .5], opacity: [0, 1, 0], rotate }} transition={{ duration: .85, delay: index * .015, ease: 'easeOut' }} />)}</span>}
    <span className="sr-only" role="status">{burst ? `${title} finish celebrated${burst > 1 ? ` ${burst} times` : ''}.` : ''}</span>
  </span>;
}
