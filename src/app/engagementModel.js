// Approximate foreground attention, capped after 60 seconds without interaction.
export function createEngagementMeter({ track, now = Date.now }) {
  let module = null,
    last = now(),
    activity = last,
    pending = 0;
  const flush = () => {
    const seconds = Math.floor(pending / 1000);
    if (module && seconds > 0) {
      track('module_engagement', { module, active_seconds: Math.min(300, seconds) });
      pending -= seconds * 1000;
    }
  };
  const tick = () => {
    const time = now(),
      elapsed = time - last;
    if (module && elapsed >= 0 && elapsed <= 5000)
      pending += Math.max(0, Math.min(time, activity + 60000) - last);
    last = time;
    if (pending >= 30000) flush();
  };
  return {
    tick,
    activate(next) {
      tick();
      if (module !== next) {
        flush();
        pending = 0;
        module = next;
      }
    },
    activity() {
      tick();
      activity = now();
    },
    pause() {
      tick();
      flush();
      pending = 0;
      module = null;
    },
    reset() {
      module = null;
      pending = 0;
      last = now();
      activity = last;
    },
  };
}
