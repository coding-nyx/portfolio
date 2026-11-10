import { useEffect } from 'react';
import { useSiteMotion } from './useSiteMotion.js';
import { createField, paintField, updateField } from './emberField.js';

const POINTER_QUERY = '(hover: hover) and (pointer: fine)';

export default function useEmberField(canvasRef) {
  const { enabled } = useSiteMotion();
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context) return;
    const query = window.matchMedia(POINTER_QUERY);
    const pointer = { x: 0, y: 0, active: false };
    const target = { x: 0, y: 0 };
    let points = [];
    let frame;
    let width = 0;
    let height = 0;
    const allowed = () => enabled && query.matches && !document.hidden;
    const paint = () => paintField(context, points, width, height);
    const stop = () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = undefined;
      pointer.active = false;
      canvas.dataset.pointerState = 'off';
    };
    const tick = () => {
      frame = undefined;
      if (!allowed()) return;
      pointer.x += (target.x - pointer.x) * 0.24;
      pointer.y += (target.y - pointer.y) * 0.24;
      const movement = updateField(points, pointer);
      paint();
      const distance = Math.hypot(target.x - pointer.x, target.y - pointer.y);
      if (movement > 0.015 || distance > 0.1) frame = requestAnimationFrame(tick);
      else canvas.dataset.pointerState = 'rest';
    };
    const schedule = () => {
      if (frame === undefined && allowed()) frame = requestAnimationFrame(tick);
    };
    const reset = () => {
      stop();
      width = window.innerWidth;
      height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = allowed() ? Math.round(width * ratio) : 0;
      canvas.height = allowed() ? Math.round(height * ratio) : 0;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      points = allowed() ? createField(width, height) : [];
      if (allowed()) paint();
    };
    const release = () => {
      pointer.active = false;
      canvas.dataset.pointerState = 'settling';
      schedule();
    };
    const move = (event) => {
      if (!allowed() || event.pointerType === 'touch') return;
      if (event.target.closest?.('input, textarea, select, dialog')) {
        if (pointer.active) release();
        return;
      }
      target.x = event.clientX;
      target.y = event.clientY;
      if (!pointer.active) {
        pointer.x = target.x;
        pointer.y = target.y;
      }
      pointer.active = true;
      canvas.dataset.pointerState = 'active';
      schedule();
    };
    const leave = (event) => {
      if (!event.relatedTarget) release();
    };
    const visibility = () => {
      if (document.hidden) stop();
      else reset();
    };
    const blur = () => {
      stop();
      points.forEach((point) => {
        point.offsetX = 0;
        point.offsetY = 0;
        point.warmth = 0;
      });
      paint();
    };
    reset();
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerout', leave, { passive: true });
    window.addEventListener('pointercancel', release);
    window.addEventListener('keydown', release);
    window.addEventListener('blur', blur);
    window.addEventListener('resize', reset);
    document.addEventListener('visibilitychange', visibility);
    query.addEventListener('change', reset);
    return () => {
      stop();
      context.clearRect(0, 0, width, height);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerout', leave);
      window.removeEventListener('pointercancel', release);
      window.removeEventListener('keydown', release);
      window.removeEventListener('blur', blur);
      window.removeEventListener('resize', reset);
      document.removeEventListener('visibilitychange', visibility);
      query.removeEventListener('change', reset);
    };
  }, [canvasRef, enabled]);
}
