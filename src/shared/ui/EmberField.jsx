import { useRef } from 'react';
import useEmberField from '../motion/useEmberField.js';
import './emberField.css';

export default function EmberField() {
  const canvas = useRef(null);
  useEmberField(canvas);
  return <canvas ref={canvas} className="ember-field" aria-hidden="true" />;
}
