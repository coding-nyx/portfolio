export const CONTACT_SUBJECTS = ['Job', 'Freelance', 'Volunteering', 'Just hi'];

export function createContactForm() {
  return { name: '', email: '', subject: CONTACT_SUBJECTS[0], message: '' };
}

export function validateContactForm(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = 'Enter a valid reply email.';
  if (!form.message.trim()) errors.message = 'Write a message.';
  return errors;
}

export function contactDraftUrl(form, recipient) {
  const subject = `${form.subject} — ${form.name.trim()}`;
  const body = `${form.message.trim()}\n\nFrom: ${form.name.trim()} <${form.email.trim()}>`;
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
