import { createContactForm, validateContactForm, contactDraftUrl } from './contactModel.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { profileData } from '../../data/portfolio.js';
import { trackFootfallEvent } from '../../services/footfallAnalytics.js';
import { createContactJourney } from '../../services/footfallInteractions.js';
import { sendEmail, EMAIL_CONFIGURED } from '../../services/contactService.js';

export default function useContactForm() {
  const [copyStatus, setCopyStatus] = useState('');
  const [form, setForm] = useState(createContactForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);
  const refs = useRef({});
  const inFlight = useRef(false);
  const [journey] = useState(() => createContactJourney({ track: trackFootfallEvent }));
  useEffect(() => {
    let leaveTimer;
    const exit = () => journey.leave('page_exit');
    const resetTracking = () => journey.reset();
    const draft = (event) => {
      const link = event.target.closest?.('#contact a[href^="mailto:"]');
      if (!event.defaultPrevented && link) journey.handoff();
    };
    const observer = new IntersectionObserver(([entry]) => {
      clearTimeout(leaveTimer);
      if (!entry.isIntersecting)
        leaveTimer = setTimeout(() => journey.leave('section_exit'), 10000);
    });
    const section = document.getElementById('contact');
    if (section) observer.observe(section);
    window.addEventListener('pagehide', exit);
    document.addEventListener('click', draft);
    window.addEventListener('footfall-preference-change', resetTracking);
    return () => {
      clearTimeout(leaveTimer);
      observer.disconnect();
      window.removeEventListener('pagehide', exit);
      document.removeEventListener('click', draft);
      window.removeEventListener('footfall-preference-change', resetTracking);
    };
  }, [journey]);
  const registerField = useCallback((name, element) => {
    refs.current[name] = element;
  }, []);
  const draftUrl = contactDraftUrl(form, profileData.socialLinks.email);
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profileData.socialLinks.email);
      setCopyStatus('Email copied.');
    } catch {
      setCopyStatus(`Copy unavailable. Email address: ${profileData.socialLinks.email}.`);
    }
  };
  const changed = (e) => {
    journey.edit();
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
    setStatus('');
  };
  const reset = () => {
    journey.clear();
    setForm(createContactForm());
    setErrors({});
    setStatus('');
  };
  const submit = async (e) => {
    e.preventDefault();
    if (inFlight.current) return;
    const found = validateContactForm(form);
    journey.submit(Object.keys(found).length === 0, EMAIL_CONFIGURED);
    setErrors(found);
    if (Object.keys(found).length) {
      refs.current[Object.keys(found)[0]]?.focus();
      return;
    }
    inFlight.current = true;
    setSending(true);
    setStatus('');
    try {
      if (EMAIL_CONFIGURED) {
        await sendEmail({
          name: form.name.trim(),
          email: form.email.trim(),
          message: `Subject: ${form.subject}\n\n${form.message.trim()}`,
        });
        setStatus('sent');
        journey.result('sent');
      } else {
        setStatus('unavailable');
        journey.result('unavailable');
      }
    } catch {
      setStatus('error');
      journey.result('error');
    } finally {
      inFlight.current = false;
      setSending(false);
    }
  };
  return {
    copyStatus,
    form,
    errors,
    status,
    sending,
    registerField,
    draftUrl,
    copyEmail,
    changed,
    reset,
    submit,
  };
}
