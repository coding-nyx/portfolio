import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import PixelCard from './common/PixelCard';
import { sendEmail } from '../services/emailService';
import { useTheme } from '../context/ThemeContext';
import { FaMapMarkerAlt, FaEnvelope, FaBolt, FaRobot, FaArrowRight, FaPaperPlane } from 'react-icons/fa';

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 20px;
  align-items: stretch;
  padding: 5px;

  @media (max-width: 868px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const InfoCard = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--text-dim);
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  position: relative;
  overflow: hidden;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: #ffffff;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }

  [data-theme='cyberpunk'] & {
    border-color: var(--neon-cyan);
    box-shadow: 2px 2px 0 var(--neon-pink);
  }
`;

const InfoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const InfoTitle = styled.h4`
  color: var(--neon-cyan);
  font-size: 1rem;
  margin: 0;
  font-weight: 700;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: #0f172a;
  }
`;

const StatusBadge = styled.span`
  font-size: 0.68rem;
  padding: 2px 8px;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid #22c55e;
  color: #22c55e;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #22c55e;
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: #f0fdf4;
    border-color: #86efac;
    color: #166534;
    border-radius: 4px;
  }
`;

const MetaList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 0.84rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-main);

  svg {
    color: var(--neon-pink);
    flex-shrink: 0;
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: #334155;

    svg {
      color: #2563eb;
    }
  }

  a {
    color: inherit;
    text-decoration: none;

    &:hover {
      color: var(--neon-cyan);
      text-decoration: underline;
    }

    [data-theme='professional'] &,
    [data-theme='modern'] & {
      &:hover {
        color: #2563eb;
      }
    }
  }
`;

const RookCallout = styled.div`
  background: rgba(0, 243, 255, 0.05);
  border: 1px solid var(--neon-cyan);
  padding: 12px;
  margin-top: 6px;

  [data-theme='cyberpunk'] & {
    clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }
`;

const RookText = styled.p`
  font-size: 0.8rem;
  color: var(--text-dim);
  margin: 0 0 8px 0;
  line-height: 1.4;

  strong {
    color: var(--text-main);
  }
`;

const RookChatBtn = styled.button`
  background: transparent;
  border: 1px solid var(--neon-pink);
  color: var(--neon-pink);
  padding: 6px 12px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;

  [data-theme='cyberpunk'] & {
    clip-path: polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px);

    &:hover {
      background: var(--neon-pink);
      color: #000;
    }
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: #eff6ff;
    color: #2563eb;
    border: 1px solid #bfdbfe;
    border-radius: 6px;

    &:hover {
      background: #2563eb;
      color: #ffffff;
    }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--text-dim);
  color: var(--text-main);
  padding: 10px 12px;
  font-family: inherit;
  font-size: 0.85rem;

  &:focus {
    outline: none;
    border-color: var(--neon-cyan);
    box-shadow: 0 0 5px var(--neon-cyan);
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    color: #0f172a;
    font-size: 0.88rem;
    padding: 10px 12px;

    &:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }
  }
`;

const TextArea = styled.textarea`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--text-dim);
  color: var(--text-main);
  padding: 10px 12px;
  font-family: inherit;
  font-size: 0.85rem;
  flex: 1;
  min-height: 90px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: var(--neon-cyan);
    box-shadow: 0 0 5px var(--neon-cyan);
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    color: #0f172a;
    font-size: 0.88rem;
    padding: 10px 12px;

    &:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }
  }
`;

const Button = styled.button`
  background: var(--neon-pink);
  color: #fff;
  border: none;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.82rem;
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #d946ef;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: #2563eb;
    border-radius: 6px;
    clip-path: none;
    text-transform: none;
    letter-spacing: normal;
    font-weight: 600;

    &:hover:not(:disabled) {
      background: #1d4ed8;
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
      transform: translateY(-1px);
    }
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  animation: ${spin} 1s linear infinite;
`;

const Status = styled.div`
  color: ${props => props.$error ? '#ff5555' : 'var(--neon-green)'};
  font-size: 0.82rem;
  text-align: center;
  padding-top: 4px;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: ${props => props.$error ? '#dc2626' : '#16a34a'};
    font-weight: 500;
  }
`;

const Contact = ({ onOpenRook }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const isCyber = theme === 'cyberpunk';
  const text = isCyber ? {
    namePlaceholder: 'CODENAME (Name)',
    emailPlaceholder: 'FREQUENCY (Email)',
    messagePlaceholder: 'PAYLOAD (Your message or project scope...)',
    buttonDefault: 'TRANSMIT MESSAGE',
    buttonLoading: 'TRANSMITTING...',
    invalidName: 'INVALID CODENAME (1-100 CHARS)',
    invalidEmail: 'INVALID FREQUENCY (EMAIL FORMAT)',
    invalidMessage: 'PAYLOAD ERROR (1-1000 CHARS)',
    success: 'TRANSMISSION SENT SUCCESSFULLY',
    failure: 'TRANSMISSION FAILED'
  } : {
    namePlaceholder: 'Your Name',
    emailPlaceholder: 'Email Address',
    messagePlaceholder: 'Your message or project inquiry...',
    buttonDefault: 'Send Message',
    buttonLoading: 'Sending...',
    invalidName: 'Please enter your name (1-100 characters)',
    invalidEmail: 'Please enter a valid email address',
    invalidMessage: 'Message must be between 1-1000 characters',
    success: 'Message sent successfully!',
    failure: 'Failed to send message. Please try again.'
  };

  const validateForm = (data) => {
    if (!data.name || data.name.length > 100) return text.invalidName;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) return text.invalidEmail;
    if (!data.message || data.message.length > 1000) return text.invalidMessage;
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sanitizedData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      message: formData.message.trim()
    };

    const validationError = validateForm(sanitizedData);
    if (validationError) {
      setStatus({ type: 'error', text: validationError });
      return;
    }

    setLoading(true);

    try {
      await sendEmail(sanitizedData);
      setStatus({ type: 'success', text: text.success });
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.log(error);
      setStatus({ type: 'error', text: text.failure });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PixelCard title="Contact & Direct Uplink" id="contact-section">
      <ContactGrid>
        <InfoCard>
          <div>
            <InfoHeader>
              <InfoTitle>Direct Uplink</InfoTitle>
              {/* "Available" badge hidden 2026-10-13: quiet job search (Lead). Re-enable when Nyx says. */}
            </InfoHeader>
            <MetaList style={{ marginTop: '14px' }}>
              <MetaItem>
                <FaMapMarkerAlt size={14} />
                <span>Chennai, India (IST / UTC +5:30)</span>
              </MetaItem>
              <MetaItem>
                <FaEnvelope size={14} />
                <a href="mailto:raju9112000@gmail.com">raju9112000@gmail.com</a>
              </MetaItem>
              <MetaItem>
                <FaBolt size={14} />
                <span>Typically responds within 24h</span>
              </MetaItem>
            </MetaList>
          </div>

          <RookCallout>
            <RookText>
              Need an instant answer or want to dispatch a direct alert? <strong>Rook</strong> is online to help.
            </RookText>
            <RookChatBtn
              type="button"
              onClick={() => {
                if (onOpenRook) {
                  onOpenRook("Hello Rook! I'd like to get in touch with Raj.");
                } else {
                  const el = document.querySelector('[aria-label="Open Rook Chat"]');
                  if (el) el.click();
                }
              }}
            >
              <FaRobot size={12} />
              <span>Talk to Rook</span>
              <FaArrowRight size={10} />
            </RookChatBtn>
          </RookCallout>
        </InfoCard>

        <Form onSubmit={handleSubmit}>
          <Input
            placeholder={text.namePlaceholder}
            aria-label="Name"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            required
          />
          <Input
            type="email"
            placeholder={text.emailPlaceholder}
            aria-label="Email Address"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            required
          />
          <TextArea
            placeholder={text.messagePlaceholder}
            aria-label="Message"
            value={formData.message}
            onChange={e => setFormData({...formData, message: e.target.value})}
            required
          />
          <Button type="submit" disabled={loading} aria-busy={loading}>
            {loading ? <Spinner aria-hidden="true" /> : <FaPaperPlane size={11} />}
            <span>{loading ? text.buttonLoading : text.buttonDefault}</span>
          </Button>
          <div role="alert" aria-live="polite">
            {status && <Status $error={status.type === 'error'}>{status.text}</Status>}
          </div>
        </Form>
      </ContactGrid>
    </PixelCard>
  );
};

export default Contact;
