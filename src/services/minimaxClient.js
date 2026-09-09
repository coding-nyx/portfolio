// MiniMax AI OpenAI-Compatible Client for Rook Agent

import { fetchLiveGitHubContext } from './githubService.js';
import { sendRookAlert } from './emailService.js';

export async function askRookAgent({ messages, onChunk, onAction }) {
  const apiKey = import.meta.env?.VITE_MINIMAX_API_KEY;
  const baseUrl = import.meta.env?.VITE_MINIMAX_BASE_URL || 'https://api.minimaxi.chat/v1';

  // Ingest Live GitHub Context
  const gitHubRepos = await fetchLiveGitHubContext();
  const githubSummary = gitHubRepos.map(r => `• ${r.name} (${r.language || 'N/A'}, ★${r.stars}): ${r.description || 'No description'} [${r.url}]`).join('\n');

  const systemPrompt = `You are Rook Agent, the autonomous AI digital twin and portfolio agent of Raj Kumar S (iOS Developer, Systems Hacker & Agentic Systems Engineer).

RAJ'S PROFILE & TECHNICAL ARCHITECTURE:
• Role: iOS Developer | Full-Cycle & Agentic Systems (Chennai, India)
• Professional Experience & Key Innovations at Zoho (May 2022 - Present, 3+ yrs as Member of Technical Staff):
  - Architected & developed an internal **Agentic Component Development Framework**:
    * **What It Does**: A deterministic, config-driven agentic pipeline that automates software and UI component lifecycles from **Spec → Contract → QA Test Suite → Implementation Plan → Implementation → Gate Verification → Ship**.
    * **Working Mechanics**: Driven by a deterministic 14-step state machine orchestrating specialized LLM sub-agents (Spec Writer, Contract Generator, Planner, QA Author, Engineer, Verifier, Tracker) across parallel dev/QA tracks with cross-platform atomic locking. Pure Python stdlib-only with zero third-party dependencies.
    * **4-File Separation of Concerns**:
      1. \`pipeline.state.json\`: Atomic runtime state tracking phase-scoped vs target-scoped steps.
      2. \`workflow.json\`: Declarative step graph, preconditions, skills-per-step, and artifact contracts.
      3. \`project.profile.md\`: Domain vocabulary, design tokens, UI component toolkit (e.g. Swift UI Kit), and architectural conventions.
      4. \`pipeline.config.json\`: Target platform registry, lint rules, and build/test verification commands.
    * **8 Declarative Quality Verification Gates**: Parameterized primitives preventing hallucinations or regressions: \`approval\`, \`state-field\`, \`manual-block\`, \`mode-gated\`, \`choice\`, \`command-check\`, \`artifact-exists\`, and \`lint\` (traceability, forbidden patterns, required patterns).
    * **Universal Prompt Compiler**: Compiles canonical markdown agent definitions into Claude Code, GitHub Copilot CLI, and Cursor rule packs.
    * **Impact & Uses**: Slashed frontend component delivery time by **30%**, enforced 100% contract compliance between UX specs and Swift/SwiftUI production code, and automated TDD test generation before code implementation.
    * **CRITICAL PRIVACY RULE**: NEVER disclose internal project/repository codenames (such as "AXSpec2Code" or internal company identifiers). Refer to it strictly as the **"Agentic Component Development Framework"** or **"Spec-to-Code Framework"**.
  - Engineered the **Zoho Mobile UI Kit** in Swift, reducing frontend development time across the Zoho mobile ecosystem by 30%.
  - Revamped core architecture & optimized data-handling patterns, resulting in 20% faster cold launch speeds and 30% reduced memory footprint.
  - Previous: Zoho Project Trainee (Sep 2021 - May 2022), Zoho Intern (Apr 2021 - Jun 2021).
• Embedded & Low-Level Linux Chops:
  - **a0090-meta** (also known as **hub-11 OS**, **a009-hub**, **hub-11**, **hub11**): Upstream-maintainable mainline Linux 6.18 OS distribution engineered for the AMedia RK3588 NVR Demo board. Raj engineered the custom Device Tree Source (DTS), U-Boot / FIT boot image assembly, kernel driver integration, and platform bring-up.
• AI & Mobile Systems:
  - **Hermes Companion App**: Native Android app for self-hosted Hermes AI agent fleet with Tailscale mesh pairing, bidirectional telemetry, and accessibility automation.
  - **Hermes Companion Web**: Web companion to pair, chat, control the device, and forward mobile notifications.
  - **Nexus (AGNES)**: Unified multi-agent wellness platform with specialized agent coordination. Repo: coding-nyx/nexus-react-native. Live: https://agent-agnes-ai.web.app
  - **FitPro Connect**: Fitness trainer platform (React/Firebase). Live: https://personal-trainer-mock.web.app/
• Top Skills: Swift (90%), Agentic Coding (90%), AI/LLMs (85%), UIKit/SwiftUI (85%), Linux Kernel (80%), Firebase (75%), React (70%), Kotlin/Android (60%).
• Technical Pedigree & Academic Foundation:
  - Early STEM Foundation: **D.A.V. (Junior & High School)** — Forged in a prestigious, mathematically rigorous environment renowned for analytical discipline, competitive problem-solving, and foundational science excellence.
  - Undergraduate Engineering: **B.E. in Electronics & Communication Engineering (ECE)** from **Sri Sairam Engineering College** — Grounded in microprocessors, signals, and hardware architecture. This hardware-to-software duality gives Raj a rare vertical advantage: mastering everything from silicon registers, board bring-up, and Linux kernel internals to high-performance Swift mobile architectures and agentic AI systems.
  - Continuous Learning Velocity: An insatiable, self-driven technologist with an extraordinary ramp-up curve — continuously mastering and operationalizing frontier tech (deterministic agentic state machines, custom kernel schedulers, distributed mesh networks, and next-gen mobile runtimes) directly into production.
• Other Highlights: Spartan Racer (top 10% obstacle course finish).

LIVE GITHUB REPOSITORIES (coding-nyx):
${githubSummary}

BEHAVIOR & TONE:
- Be technically sharp, concise, and helpful. You represent Raj directly.
- When asked about any project, like 'a009-hub', 'hub-11', 'a0090-meta', 'hermes', 'nexus', or his Zoho work, give deep, authentic technical details based on Raj's real architecture.
- FORMATTING: ALWAYS use clean GitHub-flavored Markdown (bolding key terms, using bullet lists with '•' or '-', formatting links as [Title](url), formatting code/metrics with inline backticks).
- CONTACT & LEAD DISPATCH (CONVERSATIONAL & ACTIONABLE):
  You have autonomous lead capture capabilities to notify Raj directly!
  1. When a visitor introduces themselves or expresses hiring/contact interest (e.g. "I am Nyx, look to hire Raj"):
     - Warmly acknowledge them by name: "Hello Nyx! Wonderful to connect with you."
     - If they have not provided an email or phone number yet, ask for it right here in chat so Raj can get back to them.
     - Emit: [ACTION:PREFILL_FORM:Sender Name||Short message/opportunity]
  2. As soon as they provide an email or phone number (e.g. "nyx@example.com" or in the current message):
     - Confirm that their message has been sent directly to Raj's alert system!
     - Emit: [ACTION:ALERT_DISPATCH:Sender Name|Email or Phone|Short message/opportunity]
  3. NEVER repeat a rigid list of "three convenient ways to reach out". Converse naturally, taking their message directly like an intelligent assistant.
- You can drive the user's browser during conversation by emitting actions:
  • [ACTION:SCROLL_TO:projects]
  • [ACTION:SCROLL_TO:experience]
  • [ACTION:SCROLL_TO:skills]
  • [ACTION:SCROLL_TO:contact]
  • [ACTION:OPEN_RESUME]
  • [ACTION:SWITCH_THEME:cyberpunk]
  • [ACTION:SWITCH_THEME:professional]`;

  // Check if we have an active API key
  if (apiKey) {
    try {
      const cleanMessages = messages
        .filter(m => m && m.content && m.content !== '...' && typeof m.content === 'string')
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'MiniMax-Text-01',
          messages: [
            { role: 'system', content: systemPrompt },
            ...cleanMessages
          ],
          stream: true,
          temperature: 0.7
        })
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === 'data: [DONE]') continue;
            if (trimmed.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(trimmed.slice(6));
                const delta = parsed.choices?.[0]?.delta?.content || '';
                if (delta) {
                  fullText += delta;
                  parseAndEmitActions(fullText, onAction);
                  if (onChunk) onChunk(cleanActionTags(fullText));
                }
              } catch {
                // Ignore chunk parse error
              }
            }
          }
        }

        if (fullText.trim()) {
          return cleanActionTags(fullText);
        }
      } else {
        console.warn(`[MiniMax] API returned HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.warn("MiniMax streaming request failed, falling back to local simulation:", err);
    }
  }

  // Built-in intelligent fallback engine (Simulated MiniMax response)
  const fallbackReply = generateFallbackResponse(messages, gitHubRepos);

  // Simulate typewriter streaming
  let accumulated = '';
  for (let i = 0; i < fallbackReply.length; i += 3) {
    accumulated += fallbackReply.slice(i, i + 3);
    if (onChunk) onChunk(cleanActionTags(accumulated));
    await new Promise(r => setTimeout(r, 18));
  }

  parseAndEmitActions(fallbackReply, onAction);
  return cleanActionTags(fallbackReply);
}

function parseAndEmitActions(text, onAction) {
  if (!onAction) return;

  const alertMatch = text.match(/\[ACTION:(?:TWILIO_DISPATCH|ALERT_DISPATCH):([^|]+)\|([^|]+)\|([^\]]+)\]/);
  if (alertMatch) {
    onAction({
      type: 'alert_sent',
      name: alertMatch[1].trim(),
      contact: alertMatch[2].trim(),
      message: alertMatch[3].trim()
    });
    sendRookAlert({
      senderName: alertMatch[1].trim(),
      senderContact: alertMatch[2].trim(),
      message: alertMatch[3].trim()
    });
  }

  const prefillMatch = text.match(/\[ACTION:PREFILL_FORM:([^|]*)\|([^|]*)\|([^\]]*)\]/);
  if (prefillMatch) {
    onAction({
      type: 'prefill_form',
      name: prefillMatch[1].trim(),
      contact: prefillMatch[2].trim(),
      message: prefillMatch[3].trim()
    });
  }

  if (text.includes('[ACTION:SHOW_INLINE_CONTACT_FORM]')) {
    onAction({ type: 'show_contact_form' });
  }

  const scrollMatch = text.match(/\[ACTION:SCROLL_TO:([a-zA-Z0-9_-]+)\]/);
  if (scrollMatch) {
    onAction({ type: 'scroll', target: scrollMatch[1].trim() });
    if (typeof document !== 'undefined') {
      const target = document.getElementById(scrollMatch[1].trim()) || document.querySelector(`[title*="${scrollMatch[1].trim()}"]`);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  }

  if (text.includes('[ACTION:OPEN_RESUME]')) {
    onAction({ type: 'open_resume' });
  }
}

function cleanActionTags(text) {
  return text.replace(/\[ACTION:[^\]]+\]/g, '').trim();
}

function extractContactInfo(messagesInput) {
  let name = '';
  let contact = '';
  let note = '';

  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const phoneRegex = /(?:(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{10,14})/;

  const msgs = Array.isArray(messagesInput)
    ? messagesInput
    : [{ role: 'user', content: String(messagesInput || '') }];

  const userMessages = msgs
    .filter(m => m && m.role === 'user' && typeof m.content === 'string')
    .map(m => m.content);

  for (const msg of userMessages) {
    // 1. Extract email
    const emailMatch = msg.match(emailRegex);
    if (emailMatch && !contact) {
      contact = emailMatch[1];
    }

    // 2. Extract phone if no email yet
    if (!contact) {
      const phoneMatch = msg.match(phoneRegex);
      if (phoneMatch) {
        contact = phoneMatch[0];
      }
    }

    // 3. Extract name
    const nameMatch = msg.match(/(?:i am|i'm|my name is|this is|call me)\s+([a-zA-Z0-9_ -]{2,25}?)(?:[,.]|\s+and|\s+looking|\s+look|\s+want|\s+to|\s+from|\s+for|\s*$)/i);
    if (nameMatch && !name) {
      const extracted = nameMatch[1].trim();
      if (!/^(here|just|interested|open|ready|reaching|writing|there|looking)$/i.test(extracted)) {
        name = extracted;
      }
    }

    // 4. Extract message note
    if (!note && (msg.toLowerCase().includes('hire') || msg.toLowerCase().includes('interview') || msg.toLowerCase().includes('oppor') || msg.toLowerCase().includes('project') || msg.toLowerCase().includes('job') || msg.toLowerCase().includes('role') || msg.toLowerCase().includes('reach'))) {
      note = msg;
    }
  }

  return { name, contact, note: note || 'Message left via Rook chat' };
}

function generateFallbackResponse(messagesInput, repos) {
  const msgs = Array.isArray(messagesInput)
    ? messagesInput
    : [{ role: 'user', content: String(messagesInput || '') }];
  const query = (msgs[msgs.length - 1]?.content || '').toLowerCase();
  const contactInfo = extractContactInfo(msgs);

  // 1. Embedded Systems & a0090-meta / hub-11 OS
  if (
    query.includes('a009') ||
    query.includes('hub') ||
    query.includes('hub11') ||
    query.includes('hub-11') ||
    query.includes('linux') ||
    query.includes('kernel') ||
    query.includes('rk3588') ||
    query.includes('hardware') ||
    query.includes('embedded') ||
    query.includes('dts') ||
    query.includes('device tree') ||
    query.includes('amedia') ||
    query.includes('nvr')
  ) {
    return `### **a0090-meta (hub-11 OS)** — Mainline Embedded Linux & Platform Bring-up

**a0090-meta** (also known as **hub-11 OS** or **a009-hub**) is an upstream-maintainable mainline **Linux 6.18** operating system distribution engineered by Raj for the **AMedia RK3588 NVR Demo** board.

#### Key Architectural Highlights:
• **Custom Board Device Tree (DTS)**: Hand-crafted and patched Device Tree Source (\`dts\`) mapping hardware peripherals, high-speed SerDes, PCIe, and memory allocations specifically for the Rockchip RK3588 silicon.
• **FIT Boot Image Assembly & U-Boot**: Architected flattened image tree (\`FIT\`) boot containers packaging the mainline kernel, initramfs, and hardware dtbs into an atomic, verifiable payload.
• **Upstream Tracking**: Designed to stay maintainable against mainline Linux releases rather than relying on bloated, frozen vendor BSP blobs.

[ACTION:SCROLL_TO:projects]`;
  }

  // 2. Hermes Companion App (Tailscale & AI fleet)
  if (query.includes('hermes') || query.includes('companion') || query.includes('tailscale') || query.includes('mesh') || query.includes('fleet')) {
    return `### **Hermes Companion App** — Native Android & Autonomous Agent Fleet Pairing

Raj built the **Hermes Companion App**, a native Android client tailored for interacting with and managing a self-hosted **Hermes AI agent fleet**:
• **Tailscale Mesh Pairing**: Secure, peer-to-peer mesh networking allowing seamless remote commands and bidirectional telemetry with private AI nodes.
• **Bidirectional Telemetry**: Real-time streaming status updates, health checks, and execution traces.
• **Accessibility Automation**: Native Android automation services allowing autonomous agent actions to be safely triggered and observed on mobile devices.

[ACTION:SCROLL_TO:projects]`;
  }

  // 3. Nexus (AGNES) Multi-Agent Wellness
  if (query.includes('nexus') || query.includes('agnes') || query.includes('wellness')) {
    return `### **Nexus (AGNES)** — Multi-Agent Intelligence Platform

Raj architected **Nexus**, a unified multi-agent wellness platform where specialized autonomous agents collaborate:
• **Agent Specialization**: Distributes responsibilities (analytics, user telemetry, adaptive wellness advice) among purpose-built sub-agents.
• **State Coordination**: Synchronizes agent hand-offs and deterministic memory models to ensure reliable, personalized insights.

[ACTION:SCROLL_TO:projects]`;
  }

  // 4. Agentic Component Development Framework (Zoho Innovation)
  if (query.includes('agentic') || query.includes('framework') || query.includes('component') || query.includes('spec') || query.includes('pipeline') || query.includes('contract')) {
    return `At Zoho, Raj engineered an **Agentic Component Development Framework** — a deterministic, config-driven multi-agent pipeline designed to automate the component creation lifecycle from **Spec → Contract → QA Tests → Implementation → Gate Verification → Ship**.

### Architecture & Working Mechanics:
• **Deterministic State Machine**: Orchestrates 14 pipeline steps, preconditions, and parallel dev/QA tracks using a pure Python stdlib engine with cross-platform atomic locking (\`O_CREAT | O_EXCL\` + atomic filesystem replacement). Zero third-party dependencies.
• **4-File Separation of Concerns**:
  - \`pipeline.state.json\`: Atomic runtime state tracking phase-scoped vs target-scoped steps.
  - \`workflow.json\`: Declarative step graph, artifact contracts, and agent-skill mappings.
  - \`project.profile.md\`: Domain vocabulary, UI design tokens, and component architectural conventions.
  - \`pipeline.config.json\`: Target platform registry, lint rules, and build/test verification commands.
• **8 Declarative Quality Verification Gates**: Parameterized primitives (\`approval\`, \`command-check\`, \`artifact-exists\`, \`lint\`, \`state-field\`, etc.) enforcing 100% contract compliance and preventing LLM hallucination.
• **Multi-Target Parallel Tracks**: Shared phase specifications compile down into per-target platform checklists (e.g. modular Swift UI Kit for iOS).
• **Universal Prompt Compiler**: Single canonical markdown prompt source compiles adapters for Claude Code, GitHub Copilot CLI, and Cursor rule packs.

### Uses & Key Benefits:
1. **-30% Frontend Dev Turnaround**: Drastically accelerated component generation, validation, and iteration.
2. **Automated TDD & QA**: Sub-agents generate automated test suites and QA plans *before* code implementation.
3. **Zero Regression Hand-offs**: Strict code contracts bridge the gap between design specs and production Swift/SwiftUI code.
[ACTION:SCROLL_TO:projects]`;
  }

  // 5. Conversational Contact & Lead Capture
  const hasContactDetails = Boolean(contactInfo.contact);
  const hasIntroducedName = Boolean(contactInfo.name);
  const hasContactIntent =
    query.includes('hire') ||
    query.includes('interview') ||
    query.includes('contact') ||
    query.includes('touch') ||
    query.includes('reach') ||
    query.includes('message') ||
    query.includes('email') ||
    query.includes('phone') ||
    Boolean(query.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)) ||
    Boolean(query.match(/(?:(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{10,14})/));

  if (hasContactIntent || hasContactDetails || (hasIntroducedName && (query.includes('raj') || query.includes('look') || query.includes('want')))) {
    // Case A: User provided their email or phone number
    if (hasContactDetails) {
      const sender = contactInfo.name || 'Visitor';
      const cleanNote = contactInfo.note || 'Inquiry sent via portfolio chat';
      return `✅ **Message Dispatched to Raj!**

Thank you **${sender}**! I have forwarded your message and contact details (\`${contactInfo.contact}\`) directly to Raj's personal alert system. He will review your opportunity and get back to you promptly!
[ACTION:ALERT_DISPATCH:${sender}|${contactInfo.contact}|${cleanNote}]`;
    }

    // Case B: User introduced their name (e.g. "i am nyx, look to hire raj")
    if (hasIntroducedName) {
      return `Hello **${contactInfo.name}**! It's fantastic to connect with you. Raj is open to high-impact iOS, systems, and agentic engineering opportunities.

What is the best **email address or phone number** to reach you? Please share it right here in chat, and I will dispatch an instant notification directly to Raj's inbox so he can follow up with you promptly!
[ACTION:PREFILL_FORM:${contactInfo.name}||${contactInfo.note}]`;
    }

    // Case C: General hire/contact intent without name or contact
    return `Raj is actively open to high-impact iOS, systems, and agentic engineering opportunities!

Who am I speaking with, and what is the best **email or phone number** to reach you? You can share your details right here in chat, and I will dispatch an immediate alert directly to Raj.
[ACTION:SHOW_INLINE_CONTACT_FORM]`;
  }

  // 6. Zoho Experience & Career
  if (query.includes('zoho') || query.includes('experience') || query.includes('work') || query.includes('job') || query.includes('career') || query.includes('role')) {
    return `Raj has been a **Member of Technical Staff at Zoho** for over 3 years (since May 2022).

Major architectural impact:
1. **Agentic Component Framework**: Built an internal workflow for automated UI component generation and testing.
2. **Zoho Mobile UI Kit**: Created a reusable component library in Swift (-30% dev time across mobile modules).
3. **Performance Refactor**: Optimized data patterns & legacy architecture (+20% app launch speed, -30% memory footprint).
4. **Previous Progression**: Zoho Project Trainee (Sep 2021 - May 2022), Zoho Intern (Apr 2021 - Jun 2021).
[ACTION:SCROLL_TO:experience]`;
  }

  // 7. Skills & Tech Stack
  if (query.includes('skill') || query.includes('stack') || query.includes('tech') || query.includes('technolog') || query.includes('proficiency') || query.includes('swift') || query.includes('ios') || query.includes('catalyst') || query.includes('aws')) {
    return `### 🛠️ Raj's Technical Proficiencies & Architecture Stack:

• **iOS & Mobile Systems**: **Swift & SwiftUI** (90%), **UIKit Architecture** (85%), Swift Concurrency, Custom Design Systems, Combine, Kotlin/Android (60%), Java & React Native (65%).
• **Autonomous AI & Agentic Systems**: **Agentic Frameworks** (90%), **AI / LLM Pipelines** (85%), Deterministic Loops, Quality Gates, Adaptability (90%), Teamwork & Mentorship (90%).
• **Systems & Embedded Linux**: **Linux Kernel & C** (80%), **Device Tree / DTS** (75%), POSIX & Makefiles (75%), Armbian / FIT Images (70%), Low-latency Process Scheduling.
• **Cloud & Full-Cycle Services**: **Zoho Catalyst** (75%), **Firebase & Auth** (75%), **React & Web Apps** (70%), **AWS** (50%).
[ACTION:SCROLL_TO:skills]`;
  }

  // 8. Education & Academic Pedigree
  if (query.includes('education') || query.includes('college') || query.includes('school') || query.includes('degree') || query.includes('qualification') || query.includes('study') || query.includes('studied') || query.includes('sairam') || query.includes('dav')) {
    return `### 🎓 Academic Pedigree & Engineering Foundation:

• 🏫 **Early STEM Crucible — D.A.V. (Junior & High School)**
  Forged in one of the most mathematically rigorous environments renowned for analytical discipline, competitive problem-solving, and foundational science excellence.

• ⚡ **Hardware-to-Software Duality — B.E. in Electronics & Communication Engineering (ECE)**
  *Sri Sairam Engineering College*
  Grounded in microprocessors, signal processing, and low-level digital systems. This hardware foundation gives Raj an unfair advantage over traditional software engineers—powering his ability to navigate seamlessly from board bring-up, device trees (DTS), and Linux kernel schedulers all the way to high-concurrency mobile architectures and multi-agent AI ecosystems.

• 🚀 **High-Velocity Continuous Learning Engine**
  Raj doesn't wait for industry trends—he operationalizes them. With an insatiable appetite for frontier engineering, he continuously masters and ships emerging technologies (from autonomous agent orchestration and Tailscale mesh networks to modern compiler toolchains and production Swift design systems) directly into high-impact deliverables.

*Looking for someone with deep fundamentals who masters complex stacks at lightning speed? Ask me about his latest projects or leave a note to connect!*`;
  }

  // 9. Spartan Race & Physical Grit
  if (query.includes('spartan') || query.includes('race') || query.includes('racing') || query.includes('obstacle') || query.includes('fitness') || query.includes('grit') || query.includes('endurance')) {
    return `### 🏅 Spartan Racer — Top 10% Finish (10km Obstacle Course)

Raj conquered the grueling 10km Spartan obstacle course race, finishing in the **top 10%**.
This physical and mental endurance discipline mirrors his engineering philosophy: relentless stamina, calm resilience under pressure, and pushing through complex roadblocks to cross the finish line.
[ACTION:SCROLL_TO:achievements]`;
  }

  // 10. Smart India Hackathon & Awards
  if (query.includes('hackathon') || query.includes('smart india') || query.includes('sih') || query.includes('award') || query.includes('honor')) {
    return `### 🏆 Smart India Hackathon — National Finalist (Aug 2020)

Selected participant at India's premier nationwide hackathon, collaborating on real-time technological problem solving under continuous 36-hour sprint conditions with rapid prototyping and execution.
[ACTION:SCROLL_TO:awards]`;
  }

  // 11. GitHub Repositories
  if (query.includes('github') || query.includes('repo') || query.includes('commit') || query.includes('code')) {
    const list = repos.slice(0, 3).map(r => `• **${r.name}** (${r.language}): ${r.description || ''}`).join('\n');
    return `Here are Raj's active GitHub projects right now:\n${list}\n\nAll repositories are live under **coding-nyx** on GitHub!
[ACTION:SCROLL_TO:projects]`;
  }

  // 12. Resume
  if (query.includes('resume') || query.includes('cv')) {
    return `Opening Raj's official resume PDF for you right now...
[ACTION:OPEN_RESUME]`;
  }

  // 13. General About / Background
  if (query.includes('raj') || query.includes('who') || query.includes('about') || query.includes('background') || query.includes('intro')) {
    return `**Raj Kumar S** is an iOS Developer and Agentic Systems Engineer with a deep focus on mobile architecture and low-level systems. He is currently a Member of Technical Staff at Zoho (3+ years), based in Chennai, India.

Key highlights of his work & background:
• **iOS Architecture & Design Systems**: Core contributor at Zoho, engineering the Zoho Mobile UI Kit in Swift, slashing UI development turnaround by 30%, and optimizing cold launch performance by 20%.
• **Agentic Systems**: Architected an internal agentic framework automating component lifecycles from specification through quality verification to production code contracts.
• **Systems & Embedded Linux**: Developed **a0090-meta (hub-11 OS)**, bringing up mainline Linux 6.18 on RK3588 hardware with custom device trees (DTS) and FIT images.
• **Full-Cycle & AI Systems**: Built companion apps pairing with autonomous agent fleets (Hermes) via Tailscale mesh networking.
• **Pedigree & Continuous Learning**: Grounded by **D.A.V. (Junior & High School)** and a **B.E. in Electronics and Communication Engineering (ECE)** from **Sri Sairam Engineering College** — bridging silicon-level hardware insight with high-level software craft, backed by a relentless drive to master and operationalize frontier technologies into production.

Feel free to ask me more about his specific projects, his technical stack, or leave a note to get in touch!
[ACTION:SCROLL_TO:hero]`;
  }

  // 14. Friendly Greeting / Default
  return `Greetings! I am **Rook**, Raj's portfolio assistant.

I can guide you through:
• **a0090-meta (hub-11 OS)** — Raj's mainline Linux 6.18 embedded OS for RK3588.
• **Agentic Component Framework** — His deterministic multi-agent pipeline at Zoho.
• **Hermes Companion App** — Native Android client for private AI agent fleets via Tailscale mesh.
• **Zoho Mobile UI Kit** & iOS performance refactors (-30% memory, +20% launch speed).
• **Academic Pedigree** — D.A.V. and B.E. in ECE at Sri Sairam Engineering College.
• Live GitHub code & leaving a direct message for Raj!

Feel free to ask about any specific project or leave a note for Raj!`;
}
