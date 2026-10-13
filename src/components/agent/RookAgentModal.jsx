import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { askRookAgent } from '../../services/minimaxClient';
import { sendRookAlert } from '../../services/emailService';
import { logAgentInteraction } from '../../firebase';
import { FaPaperPlane, FaTimes, FaRobot, FaCheckCircle, FaEnvelope } from 'react-icons/fa';

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.56);
`;

// Rook popover (opened only from the nav "Ask" control). Anchored under the bar at 1280; bottom sheet at 390.
const ChatDrawer = styled(motion.div)`
  position: fixed;
  top: 72px;
  right: 24px;
  width: 400px;
  max-width: calc(100vw - 48px);
  height: 520px;
  max-height: calc(100vh - 96px);
  z-index: 1000;

  @media (max-width: 700px) {
    top: auto;
    bottom: 8px;
    left: 8px;
    right: 8px;
    width: auto;
    max-width: none;
    max-height: calc(100vh - 80px);
  }

  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);

  [data-theme='cyberpunk'] & {
    background: rgba(8, 8, 16, 0.96);
    border: 1px solid var(--neon-cyan);
    box-shadow: 0 0 25px rgba(0, 243, 255, 0.25);
    font-family: 'Courier New', monospace;
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  }
`;

const DrawerHeader = styled.div`
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);

  [data-theme='cyberpunk'] & {
    background: rgba(0, 243, 255, 0.08);
    border-bottom-color: rgba(0, 243, 255, 0.2);
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: #f8fafc;
    border-bottom-color: #f1f5f9;
  }
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 0.95rem;

  small {
    font-size: 0.72rem;
    font-weight: 400;
    color: var(--text-dim);
    display: block;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MessageBubble = styled.div`
  max-width: 88%;
  padding: 10px 14px;
  font-size: 0.84rem;
  line-height: 1.5;
  border-radius: 12px;
  align-self: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
  word-break: break-word;

  ${props => props.$isUser ? `
    background: var(--neon-cyan);
    color: #000;
    font-weight: 500;
    border-bottom-right-radius: 2px;
    white-space: pre-wrap;
  ` : `
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-main);
    border: 1px solid var(--border-color);
    border-bottom-left-radius: 2px;
  `}

  p {
    margin: 0 0 8px 0;
    &:last-child {
      margin-bottom: 0;
    }
  }

  ul, ol {
    margin: 6px 0 8px 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 4px;
    &:last-child {
      margin-bottom: 0;
    }
  }

  strong, b {
    font-weight: 700;
    color: inherit;
  }

  a {
    color: var(--neon-cyan);
    text-decoration: underline;
    font-weight: 500;
    &:hover {
      text-decoration: none;
    }
  }

  code {
    background: rgba(0, 0, 0, 0.25);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 0.85em;
  }

  [data-theme='professional'] & {
    ${props => props.$isUser ? `
      background: #2563eb;
      color: #ffffff;
    ` : `
      background: #f1f5f9;
      color: #0f172a;
      border-color: #e2e8f0;
    `}

    a {
      color: #2563eb;
    }

    code {
      background: #e2e8f0;
      color: #0f172a;
    }
  }
`;

const QuickChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 16px 12px 16px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Chip = styled.button`
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-dim);
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.72rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &:hover {
    border-color: var(--neon-cyan);
    color: var(--neon-cyan);
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: #f8fafc;
    border-color: #e2e8f0;
    color: #475569;

    &:hover {
      background: #eff6ff;
      border-color: #bfdbfe;
      color: #2563eb;
    }
  }
`;

const InlineFormCard = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--neon-cyan);
  border-radius: 10px;
  padding: 12px 14px;
  margin: 6px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

const InlineFormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 0.82rem;
  color: var(--neon-cyan);

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: #0f172a;
  }

  button {
    background: none;
    border: none;
    color: var(--text-dim);
    cursor: pointer;
    font-size: 0.85rem;
    padding: 2px 6px;
  }
`;

const InlineInput = styled.input`
  width: 100%;
  padding: 6px 10px;
  font-size: 0.8rem;
  font-family: inherit;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.2);
  color: var(--text-main);
  outline: none;

  &:focus {
    border-color: var(--neon-cyan);
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #0f172a;

    &:focus {
      border-color: #2563eb;
    }
  }
`;

const InlineTextarea = styled.textarea`
  width: 100%;
  padding: 6px 10px;
  font-size: 0.8rem;
  font-family: inherit;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.2);
  color: var(--text-main);
  outline: none;
  resize: vertical;
  min-height: 50px;

  &:focus {
    border-color: var(--neon-cyan);
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #0f172a;

    &:focus {
      border-color: #2563eb;
    }
  }
`;

const InlineActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 2px;
`;

const SubmitInlineBtn = styled.button`
  background: var(--neon-cyan);
  color: #000;
  border: none;
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: #2563eb;
    color: #fff;
  }
`;

const ScrollLinkBtn = styled.button`
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 0.72rem;
  text-decoration: underline;
  cursor: pointer;
  padding: 4px 0;

  &:hover {
    color: var(--neon-cyan);
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    &:hover {
      color: #2563eb;
    }
  }
`;

const DirectNotificationBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  margin: 8px 0;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid var(--neon-green, #22c55e);
  color: var(--neon-green, #22c55e);
  animation: bannerFadeIn 0.25s ease-out;

  @keyframes bannerFadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: #f0fdf4;
    border-color: #86efac;
    color: #166534;
  }
`;

const InputForm = styled.form`
  padding: 12px 16px;
  display: flex;
  gap: 8px;
  border-top: 1px solid var(--border-color);
  background: var(--card-bg);
`;

const TextInput = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  padding: 8px 12px;
  border-radius: 8px;
  color: var(--text-main);
  font-family: inherit;
  font-size: 0.85rem;
  outline: none;

  &:focus {
    border-color: var(--neon-cyan);
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: #ffffff;
    border-color: #cbd5e1;
    color: #0f172a;

    &:focus {
      border-color: #2563eb;
    }
  }
`;

const SendButton = styled.button`
  background: var(--neon-cyan);
  color: #000;
  border: none;
  border-radius: 8px;
  padding: 0 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: #2563eb;
    color: #ffffff;
  }
`;

export const RookAgentModal = ({ open: isOpen, onOpenChange, returnFocusRef, externalPrompt, onClearExternalPrompt, onOpenResume }) => {
  const setIsOpen = (v) => onOpenChange && onOpenChange(v);
  const drawerRef = useRef(null);
  const inputRef = useRef(null);
  const [_initialOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('agent') === 'open';
    }
    return false;
  });
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi, I’m **Rook**. I answer a few preset questions about Raj’s work. Ask me anything about Raj, his iOS engineering at Zoho, systems projects, or background. If you'd like to get in touch with Raj, feel free to leave a message right here in chat, use the quick message card, or the contact section below!"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contactAlertSent, setContactAlertSent] = useState(false);
  const [showInlineForm, setShowInlineForm] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('form') === 'open';
    }
    return false;
  });
  const [formName, setFormName] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formNote, setFormNote] = useState('');
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'nearest' });
  }, [messages]);

  useEffect(() => { if (_initialOpen) setIsOpen(true); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus trap + Esc closes and returns focus to the opener.
  useEffect(() => {
    if (!isOpen) return undefined;
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0);
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeRook(); return; }
      if (e.key !== 'Tab' || !drawerRef.current) return;
      const f = [...drawerRef.current.querySelectorAll('button,input,textarea,a[href],[tabindex]:not([tabindex="-1"])')]
        .filter((x) => !x.disabled && x.getClientRects().length > 0);
      if (!f.length) return;
      const a = f[0], z = f[f.length - 1];
      if (!drawerRef.current.contains(document.activeElement)) { e.preventDefault(); a.focus(); }
      else if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey, true); };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const closeRook = () => {
    setIsOpen(false);
    const el = returnFocusRef?.current;
    const visible = el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
    const fallback = [...document.querySelectorAll('button[data-ask]')].find((x) => x.getClientRects().length > 0 && getComputedStyle(x).visibility !== 'hidden');
    setTimeout(() => (visible ? el : fallback)?.focus({ preventScroll: true }), 0);
  };

  // Handle external prompt passed from VirtualShell (`ask <query>`)
  useEffect(() => {
    if (externalPrompt) {
      setIsOpen(true);
      handleSendMessage(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
    }
  }, [externalPrompt]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSendMessage = async (userText) => {
    const text = (userText || inputValue).trim();
    if (!text || isLoading) return;

    logAgentInteraction('rook_message_sent', {
      query_length: text.length,
      snippet: text.slice(0, 50)
    });

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    let assistantText = '';
    const tempIndex = newMessages.length;

    setMessages([...newMessages, { role: 'assistant', content: '...' }]);

    try {
      await askRookAgent({
        messages: newMessages,
        onChunk: (chunkText) => {
          assistantText = chunkText;
          setMessages(prev => {
            const updated = [...prev];
            updated[tempIndex] = { role: 'assistant', content: assistantText };
            return updated;
          });
        },
        onAction: (action) => {
          logAgentInteraction('rook_action_triggered', { action_type: action.type });
          if (action.type === 'alert_sent' || action.type === 'twilio') {
            setContactAlertSent(true);
          }
          if (action.type === 'show_contact_form') {
            setShowInlineForm(true);
          }
          if (action.type === 'prefill_form') {
            if (action.name) setFormName(action.name);
            if (action.contact) setFormContact(action.contact);
            if (action.message) setFormNote(action.message);
            setShowInlineForm(true);
          }
          if (action.type === 'open_resume' && onOpenResume) {
            onOpenResume();
          }
        }
      });
      logAgentInteraction('rook_response_completed', {
        response_length: assistantText.length
      });
    } catch (err) {
      console.error(err);
      logAgentInteraction('rook_chat_error', { error: err.message || 'unknown' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInlineSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formContact.trim()) return;
    setIsSubmittingForm(true);
    try {
      logAgentInteraction('rook_contact_submitted', {
        has_note: Boolean(formNote.trim())
      });
      await sendRookAlert({
        senderName: formName.trim(),
        senderContact: formContact.trim(),
        message: formNote.trim() || 'Left message via inline chat card'
      });
      setContactAlertSent(true);
      setShowInlineForm(false);
      setMessages(prev => [
        ...prev,
        { role: 'user', content: `[Submitted Message: From ${formName.trim()} (${formContact.trim()})]` },
        { role: 'assistant', content: `Thank you **${formName.trim()}**! I have dispatched your note directly to Raj. He will get back to you promptly.` }
      ]);
      setFormName('');
      setFormContact('');
      setFormNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const scrollToContactSection = () => {
    const el = document.getElementById('contact-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>

      <AnimatePresence>
        {isOpen && <Scrim key="scrim" onClick={closeRook} />}
        {isOpen && (
          <ChatDrawer
            key="drawer"
            ref={drawerRef}
            id="rook-popover"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rook-title"
            aria-describedby="rook-sub"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          >
            <DrawerHeader>
              <HeaderTitle>
                <FaRobot color="#22c55e" size={18} />
                <div>
                  <h2 id="rook-title" style={{ margin: 0, fontSize: '1rem', lineHeight: 1.2 }}>Rook</h2>
                  <small id="rook-sub">Preset answers about Raj</small>
                </div>
              </HeaderTitle>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={closeRook}
                  style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '1rem' }}
                  aria-label="Close Rook"
                >
                  <FaTimes />
                </button>
              </div>
            </DrawerHeader>

            <MessagesContainer>
              {messages.map((msg, i) => (
                <MessageBubble key={i} $isUser={msg.role === 'user'}>
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  )}
                </MessageBubble>
              ))}

              {showInlineForm && (
                <InlineFormCard>
                  <InlineFormHeader>
                    <span>Leave a Message for Raj</span>
                    <button type="button" onClick={() => setShowInlineForm(false)} aria-label="Close message form">✕</button>
                  </InlineFormHeader>
                  <form onSubmit={handleInlineSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <InlineInput
                      placeholder="Your Name"
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      required
                    />
                    <InlineInput
                      placeholder="Your Email or Phone"
                      value={formContact}
                      onChange={e => setFormContact(e.target.value)}
                      required
                    />
                    <InlineTextarea
                      placeholder="Your note or opportunity..."
                      value={formNote}
                      onChange={e => setFormNote(e.target.value)}
                      rows={2}
                      required
                    />
                    <InlineActions>
                      <SubmitInlineBtn type="submit" disabled={isSubmittingForm || !formName.trim() || !formContact.trim()}>
                        {isSubmittingForm ? 'Sending...' : 'Send Message to Raj'}
                      </SubmitInlineBtn>
                      <ScrollLinkBtn type="button" onClick={scrollToContactSection}>
                        Or open bottom form ↓
                      </ScrollLinkBtn>
                    </InlineActions>
                  </form>
                </InlineFormCard>
              )}

              {contactAlertSent && (
                <DirectNotificationBanner>
                  <FaCheckCircle />
                  <span>Notification Sent: Raj has been alerted directly!</span>
                </DirectNotificationBanner>
              )}
              <div ref={messagesEndRef} />
            </MessagesContainer>

            <QuickChips aria-label="Suggested questions">
              <Chip type="button" onClick={() => {
                logAgentInteraction('rook_chip_click', { chip: 'About Raj' });
                handleSendMessage("Tell me about Raj and his background");
              }}>
                What does Raj work on?
              </Chip>
              <Chip type="button" onClick={() => {
                logAgentInteraction('rook_chip_click', { chip: 'Linux & Systems' });
                handleSendMessage("What did Raj build for Linux and embedded systems?");
              }}>
                Linux & systems work
              </Chip>
              <Chip type="button" onClick={() => {
                logAgentInteraction('rook_chip_click', { chip: 'Leave Message' });
                setShowInlineForm(prev => !prev);
              }}>
                <FaEnvelope size={10} /> Leave a message
              </Chip>
            </QuickChips>

            <InputForm onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
              <label htmlFor="rook-q" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Ask Rook a question</label>
              <TextInput
                id="rook-q"
                ref={inputRef}
                placeholder="Ask about Raj (stays on this page)"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                disabled={isLoading}
              />
              <SendButton type="submit" disabled={isLoading || !inputValue.trim()} aria-label="Send to Rook">
                <FaPaperPlane size={13} />
              </SendButton>
            </InputForm>
          </ChatDrawer>
        )}
      </AnimatePresence>
    </>
  );
};

export default RookAgentModal;
