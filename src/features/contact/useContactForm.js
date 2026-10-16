import { createContactForm, validateContactForm, contactDraftUrl } from './contactModel.js';
import { useCallback, useRef, useState } from 'react';
import { profileData } from '../../data/portfolio.js';
import { sendEmail, EMAIL_CONFIGURED } from '../../services/contactService.js';

export default function useContactForm() {
  const [copyStatus, setCopyStatus] = useState('');
  const [form, setForm] = useState(createContactForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);
  const refs = useRef({});
  const inFlight = useRef(false);
  const registerField = useCallback((name, element) => {
    refs.current[name] = element;
  }, []);
  const draftUrl = contactDraftUrl(form, profileData.socialLinks.email);
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profileData.socialLinks.email);
      setCopyStatus('Email copied.');
    } catch {
      setCopyStatus('Select the email address to copy it.');
    }
  };
  const changed = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
    setStatus('');
  };
  const reset = () => {
    setForm(createContactForm());
    setErrors({});
    setStatus('');
  };
  const submit = async (e) => {
    e.preventDefault();
    if (inFlight.current) return;
    const found = validateContactForm(form);
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
      } else {
        setStatus('unavailable');
      }
    } catch {
      setStatus('error');
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
