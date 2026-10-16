import { CONTACT_SUBJECTS } from './contactModel.js';
import './contact.css';
import useContactForm from './useContactForm.js';
import { FiChevronDown, FiCopy, FiCheck } from 'react-icons/fi';
import { profileData } from '../../data/portfolio.js';
import { EMAIL_CONFIGURED } from '../../services/contactService.js';
import SpringAction from '../../shared/ui/SpringAction.jsx';
import ExternalLink from '../../shared/ui/ExternalLink.jsx';

export default function ContactSection() {
  const {
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
  } = useContactForm();
  return (
    <div className="port-section contact-d" data-design="Contact D">
      <h2 id="h-contact" tabIndex={-1}>
        Contact
      </h2>
      <details className="contact-composer" open>
        <summary>
          Write a message <FiChevronDown aria-hidden="true" />
        </summary>
        <div className="mail-sheet">
          <form noValidate onSubmit={submit}>
            <div className="mail-toolbar">
              <button type="button" onClick={reset} disabled={sending}>
                Clear
              </button>
              <b>New message</b>
            </div>
            <div className="mail-row mail-recipient-row">
              <span>To</span>
              <div className="mail-recipient">
                <b>{profileData.name}</b>
                <span className="contact-email-row">
                  <a className="contact-address" href={`mailto:${profileData.socialLinks.email}`}>
                    {profileData.socialLinks.email}
                  </a>
                  <button
                    className="contact-copy"
                    type="button"
                    aria-label="Copy email address"
                    title={copyStatus === 'Email copied.' ? 'Email copied' : 'Copy email'}
                    onClick={copyEmail}
                  >
                    {copyStatus === 'Email copied.' ? (
                      <FiCheck size={14} aria-hidden="true" />
                    ) : (
                      <FiCopy size={14} aria-hidden="true" />
                    )}
                  </button>
                </span>
                <span className="sr-only" role="status">
                  {copyStatus}
                </span>
              </div>
            </div>
            {[
              ['name', 'Name', 'Your name', 'text'],
              ['email', 'Email', 'Your email', 'email'],
            ].map(([name, label, placeholder, type]) => (
              <div className="mail-field" key={name}>
                <label className="mail-row" htmlFor={`contact-${name}`}>
                  <span>{label}</span>
                  <input
                    id={`contact-${name}`}
                    ref={(el) => {
                      registerField(name, el);
                    }}
                    type={type}
                    name={name}
                    autoComplete={name}
                    placeholder={placeholder}
                    value={form[name]}
                    onChange={changed}
                    aria-invalid={Boolean(errors[name])}
                    aria-describedby={errors[name] ? `contact-error-${name}` : undefined}
                  />
                </label>
                {errors[name] && (
                  <p className="field-error" id={`contact-error-${name}`}>
                    {errors[name]}
                  </p>
                )}
              </div>
            ))}
            <fieldset className="mail-subject">
              <legend>Subject</legend>
              {CONTACT_SUBJECTS.map((s) => (
                <label key={s}>
                  <input
                    type="radio"
                    name="subject"
                    value={s}
                    checked={form.subject === s}
                    onChange={changed}
                  />
                  {s}
                </label>
              ))}
            </fieldset>
            <div className="mail-body">
              <label className="sr-only" htmlFor="contact-message">
                Message
              </label>
              <textarea
                id="contact-message"
                ref={(el) => {
                  registerField('message', el);
                }}
                name="message"
                placeholder="Write your message…"
                value={form.message}
                onChange={changed}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? 'contact-error-message' : undefined}
                rows="7"
              />
              {errors.message && (
                <p className="field-error" id="contact-error-message">
                  {errors.message}
                </p>
              )}
            </div>
            <div className="mail-submit">
              <SpringAction
                type="submit"
                className="port-button"
                disabled={sending || !EMAIL_CONFIGURED}
                aria-label="Send message"
              >
                {sending ? 'Sending…' : 'Send message ↑'}
              </SpringAction>
            </div>
            {!EMAIL_CONFIGURED && (
              <p className="mail-delivery-note">
                Direct sending is unavailable. <a href={draftUrl}>Open an email draft</a> to send
                through your mail app.
              </p>
            )}
            {Object.values(errors).some(Boolean) && (
              <p className="mail-status field-error" role="alert">
                Please check the highlighted fields.
              </p>
            )}
            {status && (
              <div className="mail-status" role={status === 'error' ? 'alert' : 'status'}>
                {status === 'sent' ? (
                  <>
                    <b>Message sent.</b>
                    <p>Thank you for reaching out.</p>
                    <button type="button" onClick={reset}>
                      Write another message
                    </button>
                  </>
                ) : (
                  <>
                    The message could not be sent. Try again or{' '}
                    <a href={draftUrl}>open an email draft</a> to review and send through your mail
                    app.
                  </>
                )}
              </div>
            )}
          </form>
        </div>
      </details>
      <div className="social-row">
        <ExternalLink href={profileData.socialLinks.linkedin}>LinkedIn ↗</ExternalLink>
        <ExternalLink href={profileData.socialLinks.github}>GitHub ↗</ExternalLink>
      </div>
    </div>
  );
}
