export const EMAIL_CONFIGURED = Boolean(
  import.meta.env.VITE_EMAILJS_SERVICE_ID &&
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID &&
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
);

export async function sendEmail(formData) {
  if (!EMAIL_CONFIGURED) throw new Error('Contact delivery is not configured.');
  const { default: emailjs } = await import('@emailjs/browser');
  return emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    formData,
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  );
}
