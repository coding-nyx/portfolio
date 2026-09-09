import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { normalizePath, getNode, getCompletions } from '../../utils/vfs';
import { useTheme } from '../../context/ThemeContext';

const ShellWrapper = styled.div`
  background: rgba(8, 8, 16, 0.85);
  border: 1px solid var(--neon-cyan);
  box-shadow: 0 0 15px rgba(0, 243, 255, 0.15);
  padding: 14px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.85rem;
  min-height: 180px;
  max-height: 250px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  cursor: text;
  position: relative;
  border-radius: 4px;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
  }
  &::-webkit-scrollbar-thumb {
    background: var(--neon-cyan);
    border-radius: 3px;
  }
`;

const OutputLine = styled.div`
  margin-bottom: 4px;
  line-height: 1.45;
  color: ${props => props.$color || 'var(--text-main)'};
  white-space: pre-wrap;
  word-break: break-word;
`;

const PromptPrefix = styled.span`
  color: var(--neon-pink);
  font-weight: bold;
`;

const PathPrefix = styled.span`
  color: var(--neon-cyan);
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
`;

const HiddenInput = styled.input`
  background: transparent;
  border: none;
  color: var(--neon-green);
  font-family: inherit;
  font-size: inherit;
  outline: none;
  flex: 1;
  padding: 0;
  caret-color: var(--neon-cyan);
`;

const BUILTIN_COMMANDS = [
  'help', 'ls', 'cd', 'cat', 'pwd', 'clear',
  'projects', 'skills', 'theme', 'resume',
  'goto', 'uname', 'dmesg', 'whoami', 'ask'
];

export const VirtualShell = ({ onOpenResume, onAskRook }) => {
  const { theme, toggleTheme } = useTheme();
  const [currentPath, setCurrentPath] = useState('/');
  const [history, setHistory] = useState([
    { text: "NYX-OS Kernel v6.18 (hub-11 arm64)", color: "var(--neon-green)" },
    { text: "Type 'help' for command list | 'ask <query>' to chat with Rook Agent.", color: "var(--text-dim)" },
    { text: "guest@nyx-hub11:~$ cat bio.txt", color: "var(--neon-pink)" },
    { text: "Passionate iOS Developer with 3+ years at Zoho. Expert in modular Swift UI architecture, agentic component workflows, and low-level Linux systems.", color: "var(--text-main)" }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const inputRef = useRef(null);
  const shellRef = useRef(null);

  useEffect(() => {
    if (shellRef.current) {
      shellRef.current.scrollTop = shellRef.current.scrollHeight;
    }
  }, [history]);

  const handleShellClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand(inputVal.trim());
      if (inputVal.trim()) {
        setCmdHistory(prev => [...prev, inputVal.trim()]);
      }
      setHistoryIdx(-1);
      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = historyIdx === -1 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setInputVal(cmdHistory[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= cmdHistory.length) {
        setHistoryIdx(-1);
        setInputVal('');
      } else {
        setHistoryIdx(nextIdx);
        setInputVal(cmdHistory[nextIdx]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleTabCompletion();
    }
  };

  const handleTabCompletion = () => {
    const parts = inputVal.split(' ');
    if (parts.length === 1) {
      const match = BUILTIN_COMMANDS.filter(cmd => cmd.startsWith(parts[0]));
      if (match.length === 1) {
        setInputVal(match[0] + ' ');
      }
    } else if (parts.length >= 2) {
      const partial = parts[parts.length - 1];
      const completions = getCompletions(currentPath, partial);
      if (completions.length === 1) {
        parts[parts.length - 1] = completions[0];
        setInputVal(parts.join(' '));
      } else if (completions.length > 1) {
        setHistory(prev => [
          ...prev,
          { text: `guest@nyx-hub11:${currentPath}$ ${inputVal}`, color: "var(--neon-pink)" },
          { text: completions.join('   '), color: "var(--neon-cyan)" }
        ]);
      }
    }
  };

  const executeCommand = (cmdStr) => {
    const promptEntry = {
      text: `guest@nyx-hub11:${currentPath}$ ${cmdStr}`,
      color: "var(--neon-pink)"
    };

    if (!cmdStr) {
      setHistory(prev => [...prev, promptEntry]);
      return;
    }

    const [cmd, ...args] = cmdStr.split(' ');
    const arg = args.join(' ');

    let output = [];

    switch (cmd.toLowerCase()) {
      case 'help':
        output.push({
          text: `AVAILABLE COMMANDS:
  ls [path]         - List files and directories
  cd <dir>          - Change directory
  cat <file>        - View file contents
  pwd               - Print working directory
  clear             - Clear terminal buffer
  projects          - List active and completed projects
  skills            - Display technical capabilities
  theme [light|cyber]- Switch portfolio visual theme
  resume            - Open official resume PDF modal
  goto <section>    - Navigate to (projects, experience, skills, contact)
  ask <query>       - Query Rook Agent
  uname -a          - Print kernel & architecture specs
  dmesg             - Show recent kernel & board bringup logs
  whoami            - Print current identity`,
          color: "var(--neon-cyan)"
        });
        break;

      case 'clear':
        setHistory([]);
        return;

      case 'pwd':
        output.push({ text: currentPath, color: "var(--text-main)" });
        break;

      case 'ls': {
        const target = arg ? normalizePath(currentPath, arg) : currentPath;
        const node = getNode(target);
        if (!node || node.type !== 'dir') {
          output.push({ text: `ls: cannot access '${arg || target}': No such file or directory`, color: "#ff5555" });
        } else {
          const names = Object.keys(node.children).map(name => {
            return node.children[name].type === 'dir' ? `${name}/` : name;
          });
          output.push({ text: names.join('    '), color: "var(--neon-cyan)" });
        }
        break;
      }

      case 'cd': {
        if (!arg || arg === '~') {
          setCurrentPath('/');
        } else {
          const target = normalizePath(currentPath, arg);
          const node = getNode(target);
          if (!node) {
            output.push({ text: `cd: no such file or directory: ${arg}`, color: "#ff5555" });
          } else if (node.type !== 'dir') {
            output.push({ text: `cd: not a directory: ${arg}`, color: "#ff5555" });
          } else {
            setCurrentPath(target);
          }
        }
        break;
      }

      case 'cat': {
        if (!arg) {
          output.push({ text: "Usage: cat <file>", color: "#ff5555" });
          break;
        }
        const target = normalizePath(currentPath, arg);
        const node = getNode(target);
        if (!node) {
          output.push({ text: `cat: ${arg}: No such file or directory`, color: "#ff5555" });
        } else if (node.type === 'dir') {
          output.push({ text: `cat: ${arg}: Is a directory`, color: "#ff5555" });
        } else {
          if (node.action === 'open_resume' && onOpenResume) {
            onOpenResume();
          }
          output.push({ text: node.content, color: "var(--text-main)" });
        }
        break;
      }

      case 'projects':
        output.push({
          text: `FEATURED PROJECTS:
• [Hermes Companion App]   - Native Android companion for self-hosted Hermes AI fleet (Tailscale mesh)
• [Hermes Companion Web]   - Web companion: pair, chat, device control, notification forwarding
• [a0090-meta (hub-11 OS)] - Mainline Linux 6.18 OS distribution for RK3588 NVR
• [FitPro Connect]         - Comprehensive platform for fitness trainers (React/Firebase/Stripe)
• [Nexus (AGNES)]          - Unified multi-agent wellness platform
• [Agentic Component Framework] - Production spec-to-code pipeline (Zoho)
(Type 'goto projects' to view cards or 'cat projects/<name>.md')`,
          color: "var(--neon-green)"
        });
        break;

      case 'skills':
        output.push({
          text: `SKILL MATRIX:
Swift [====================] 90% (iOS, UIKit, SwiftUI, Architecture)
Agentic Coding [===========] 90% (Fleet orchestration, Tool calling)
AI / LLMs [================] 85% (MiniMax, Gemini, RAG, OpenAI API)
Linux Kernel [=============] 80% (RK3588, Device Trees, U-Boot)
React & Frontend [=========] 70%
Kotlin & Android [=========] 60%`,
          color: "var(--neon-yellow)"
        });
        break;

      case 'theme':
        if (arg.toLowerCase() === 'light' || arg.toLowerCase() === 'professional') {
          if (theme !== 'professional') toggleTheme();
          output.push({ text: "Switched to Professional Light theme.", color: "var(--neon-cyan)" });
        } else if (arg.toLowerCase() === 'cyber' || arg.toLowerCase() === 'cyberpunk') {
          if (theme !== 'cyberpunk') toggleTheme();
          output.push({ text: "Switched to Cyberpunk Dark theme.", color: "var(--neon-green)" });
        } else {
          toggleTheme();
          output.push({ text: "Theme toggled.", color: "var(--neon-cyan)" });
        }
        break;

      case 'resume':
        if (onOpenResume) onOpenResume();
        output.push({ text: "Launching official resume preview modal...", color: "var(--neon-green)" });
        break;

      case 'goto': {
        const sec = arg.toLowerCase();
        let targetId = null;
        if (sec.includes('proj')) targetId = 'projects';
        else if (sec.includes('exp')) targetId = 'experience';
        else if (sec.includes('skill')) targetId = 'skills';
        else if (sec.includes('contact') || sec.includes('msg')) targetId = 'contact-section';

        if (targetId) {
          const el = document.getElementById(targetId) || document.querySelector(`[title*="${targetId}"]`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            output.push({ text: `Navigating to ${sec}...`, color: "var(--neon-cyan)" });
          } else {
            output.push({ text: `Navigated to ${sec}.`, color: "var(--neon-cyan)" });
          }
        } else {
          output.push({ text: "Usage: goto [projects|experience|skills|contact]", color: "#ff5555" });
        }
        break;
      }

      case 'ask':
        if (!arg) {
          output.push({ text: "Usage: ask <message for Rook Agent>", color: "#ff5555" });
        } else {
          output.push({ text: `[ROOK AGENT LINK] Dispatched query to Rook Agent: "${arg}"...`, color: "var(--neon-green)" });
          if (onAskRook) {
            onAskRook(arg);
          }
        }
        break;

      case 'uname':
        output.push({
          text: "Linux nyx-hub11 6.18.0-arm64-rk3588 #1 SMP PREEMPT a0090-meta aarch64 GNU/Linux",
          color: "var(--text-dim)"
        });
        break;

      case 'dmesg':
        output.push({
          text: `[    0.000000] Booting Linux on physical CPU 0x0000000000 [0x412fd050]
[    0.000000] Linux version 6.18.0-arm64-rk3588 (coding-nyx@builder)
[    0.412093] rk3588-pinctrl: pin controller initialized
[    0.689201] pcie-dw-rockchip fe150000.pcie: host bridge /pcie@fe150000 ranges:
[    0.892011] rknpu: NPU core initialized (6.0 TOPS compute cluster online)
[    1.204192] hermes-daemon[421]: Tailscale mesh interface connected (100.121.113.13)
[    1.503290] rook-agent[422]: Initialized agent engine. Ready.`,
          color: "var(--neon-cyan)"
        });
        break;

      case 'whoami':
        output.push({ text: "guest@nyx-hub11 (Authorized Portfolio Visitor - Access Level: 2)", color: "var(--neon-pink)" });
        break;

      default:
        output.push({ text: `bash: ${cmd}: command not found. Type 'help' for available commands.`, color: "#ff5555" });
        break;
    }

    setHistory(prev => [...prev, promptEntry, ...output]);
  };

  return (
    <ShellWrapper ref={shellRef} onClick={handleShellClick} role="region" aria-label="Interactive Terminal">
      {history.map((line, idx) => (
        <OutputLine key={idx} $color={line.color}>
          {line.text}
        </OutputLine>
      ))}
      <InputRow>
        <PromptPrefix>guest@nyx-hub11</PromptPrefix>
        <span style={{ color: 'var(--text-dim)' }}>:</span>
        <PathPrefix>{currentPath}</PathPrefix>
        <span style={{ color: 'var(--neon-pink)' }}>$</span>
        <HiddenInput
          ref={inputRef}
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Terminal command input"
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
        />
      </InputRow>
    </ShellWrapper>
  );
};

export default VirtualShell;
