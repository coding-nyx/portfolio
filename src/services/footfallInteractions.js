// Lifecycle metadata only. Callers never pass prompts, answers or form fields here.
export function createRookMetrics({ track, now = Date.now, uuid = () => crypto.randomUUID() }) {
  let generation = 0;
  return {
    reset() {
      generation++;
    },
    begin({ input, kind }) {
      const interaction_id = uuid(),
        start = now(),
        epoch = generation;
      const accepted = track('rook_submit', { interaction_id, input, kind });
      let finished = false;
      return {
        finish(result) {
          if (finished) return;
          finished = true;
          if (accepted && epoch === generation)
            track('rook_result', {
              interaction_id,
              result,
              duration_ms: Math.min(120000, Math.max(0, Math.round(now() - start))),
            });
        },
      };
    },
  };
}
export function createContactJourney({ track, uuid = () => crypto.randomUUID() }) {
  let id,
    closed = false,
    pending = false,
    complete = false;
  const edit = () => {
    if (!id || complete) {
      const next = uuid();
      if (!track('contact_start', { form_id: next })) return;
      id = next;
      complete = false;
      closed = false;
    } else if (closed) {
      track('contact_resume', { form_id: id });
      closed = false;
    }
  };
  const leave = (reason) => {
    if (id && !closed && !complete && !pending) {
      track('contact_abandon', { form_id: id, reason });
      closed = true;
    }
  };
  return {
    edit,
    submit(valid, delivering) {
      edit();
      if (id) track('contact_submit', { form_id: id, result: valid ? 'valid' : 'invalid' });
      pending = valid && delivering;
    },
    result(result) {
      if (id) track('contact_result', { form_id: id, result });
      pending = false;
      complete = result === 'sent';
    },
    leave,
    handoff() {
      pending = false;
      closed = true;
      complete = true;
    },
    clear() {
      leave('cleared');
      id = undefined;
      closed = false;
      complete = false;
      pending = false;
    },
    reset() {
      id = undefined;
      closed = false;
      complete = false;
      pending = false;
    },
  };
}
