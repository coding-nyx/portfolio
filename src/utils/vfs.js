// In-Memory Virtual File System (VFS) for Portfolio Shell

export const VFS = {
  type: 'dir',
  children: {
    'bio.txt': {
      type: 'file',
      content: `Raj Kumar S
Role: iOS Engineer at Zoho | Swift, SwiftUI & UIKit
Location: Chennai, India
Experience: Member of Technical Staff at Zoho, full-time since May 2022
Core Work: Reusable UI components, modular mobile architecture, app performance
Also: Internal agentic developer tooling, Android, embedded Linux`
    },
    'resume.pdf': {
      type: 'file',
      action: 'open_resume',
      content: `[FILE: resume.pdf] Type 'open resume' or click the Identity File button to view the official PDF.`
    },
    'projects': {
      type: 'dir',
      children: {
        'agentic-framework.md': {
          type: 'file',
          content: `# Agentic Component Development Workflow [Internal Tooling]
A deterministic, config-driven pipeline that scaffolds UI components from spec → contract → test suite → implementation → verification.
Characteristics:
- Deterministic pipeline state rather than free-form generation order
- Declarative verification gates (linters, artifact contracts, command checks)
- Per-target configuration with no third-party runtime dependencies
Note: internal developer tooling. Adoption and measured impact are not stated because
they are not confirmed. No performance figures are claimed. No proprietary
identifiers are published here.
Tech: Agentic AI, Python, State Machine, Swift / iOS`
        },
        'hermes-companion.md': {
          type: 'file',
          content: `# Hermes Companion App [Active]
Native Android companion application for self-hosted Hermes Agent fleet.
Features: Device pairing via Tailscale mesh, bidirectional control, accessibility automation, and real-time chat.
Tech: Android, Kotlin, Jetpack Compose, Tailscale, AI Agents
Repo: https://github.com/coding-nyx/hermes-companion-app`
        },
        'a0090-meta.md': {
          type: 'file',
          content: `# a0090-meta (hub-11 OS) [Active]
Upstream-maintainable Linux OS distribution for the AMedia RK3588 NVR Demo (hub-11).
Features: Mainline Linux 6.18, custom board DTS, FIT boot image assembly, and driver integration.
Tech: Linux Kernel, RK3588, Device Tree, C, Armbian
Repo: https://github.com/coding-nyx/a0090-meta`
        },
        'nexus.md': {
          type: 'file',
          content: `# Nexus (AGNES) [Prototype]
Prototype multi-agent wellness platform.
Tech: LLM, React, React Native, Firebase, RAG
Links: none published. The source repository is private and the demo URL renders an
unverified shell, so no destination is offered and no encryption or outcome
claims are made.`
        },
        'fitpro-connect.md': {
          type: 'file',
          content: `# FitPro Connect [In Progress]
Platform for fitness trainers to manage classes, showcase portfolios and connect with clients.
Tech: React, Firebase, Stripe
Demo: unavailable (published demo URL returns 404), so no demo link is offered.
Repo: https://github.com/coding-nyx/personal-trainer`
        },
        'hermes-companion-web.md': {
          type: 'file',
          content: `# Hermes Companion Web [Active]
Web companion for the Hermes agent — pair, chat, control the device, and forward mobile notifications.
Tech: TypeScript, Web, Hermes, AI Agents
Repo: https://github.com/coding-nyx/hermes-companion-web`
        }
      }
    },
    'experience': {
      type: 'dir',
      children: {
        'zoho-mts.log': {
          type: 'file',
          content: `[LOG: Zoho - Member of Technical Staff (May 2022 - Present, full-time)]
- Reusable UI component library in Swift/SwiftUI/UIKit for consistent mobile module design.
- Internal agentic development workflow for spec-driven component scaffolding.
- Core module architecture: worked critical modules from wireframes to API integration.
- Performance work: refactored existing code to improve app launch time and memory overhead.
Note: no percentage or timing figures are published; no verified measurement record exists.`
        },
        'zoho-trainee.log': {
          type: 'file',
          content: `[LOG: Zoho - Project Trainee (Sep 2021 - May 2022)]
Collaborated with mobile team on core architectural patterns and feature enhancements.`
        },
        'servion.log': {
          type: 'file',
          content: `[LOG: Servion Global Solutions - Intern (Nov 2019 - Dec 2019)]
Enterprise software solutions and team collaboration.`
        }
      }
    },
    'skills': {
      type: 'dir',
      children: {
        'mobile.txt': {
          type: 'file',
          content: `MOBILE SKILLS:
- Swift, SwiftUI, UIKit: production iOS component and architecture work at Zoho
- Kotlin, Android: personal project work (Hermes Companion App)
- React Native: personal prototype work
(No numeric proficiency ratings are published; they had no defined basis.)`
        },
        'ai-agentic.txt': {
          type: 'file',
          content: `AI & AGENTIC CODING:
- Agentic Coding: 90% (Fleet orchestration, tool calling, autonomous workflows)
- AI / LLMs: 85% (OpenAI API, MiniMax, Gemini, RAG pipelines, local inference)`
        },
        'systems.txt': {
          type: 'file',
          content: `SYSTEMS & BACKEND:
- Embedded Linux: RK3588 device trees, boot image assembly, kernel driver integration
- Backend: Firebase, React web applications
(No numeric proficiency ratings are published; they had no defined basis.)`
        }
      }
    },
    'system': {
      type: 'dir',
      children: {
        'rk3588.dts': {
          type: 'file',
          content: `/dts-v1/;
/plugin/;
&pci3 {
    status = "okay";
    num-lanes = <4>;
    reset-gpios = <&gpio3 RK_PD1 GPIO_ACTIVE_HIGH>;
};
&npu {
    status = "okay";
    operating-points-v2 = <&npu_opp_table>;
};`
        },
        'scheduler.c': {
          type: 'file',
          content: `// Low-latency process priority hook
static void update_curr_rt_lowlat(struct rq *rq) {
    struct task_struct *curr = rq->curr;
    if (curr->policy == SCHED_RR || curr->policy == SCHED_FIFO) {
        trace_sched_lowlat_eval(curr->pid, curr->rt_priority);
    }
}`
        }
      }
    }
  }
};

// Path resolution helper
export function normalizePath(currentPath, inputPath) {
  if (!inputPath || inputPath === '.') return currentPath;
  let parts = inputPath.startsWith('/') ? inputPath.split('/') : `${currentPath}/${inputPath}`.split('/');
  const resolved = [];

  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') {
      if (resolved.length > 0) resolved.pop();
    } else {
      resolved.push(part);
    }
  }

  return '/' + resolved.join('/');
}

// Get node at resolved path
export function getNode(path) {
  if (path === '/' || path === '') return VFS;
  const parts = path.split('/').filter(Boolean);
  let current = VFS;

  for (const part of parts) {
    if (!current || current.type !== 'dir' || !current.children || !current.children[part]) {
      return null;
    }
    current = current.children[part];
  }

  return current;
}

// Get path completions for tab completion
export function getCompletions(currentPath, partial) {
  let searchDir = currentPath;
  let prefix = partial;

  if (partial.includes('/')) {
    const lastSlash = partial.lastIndexOf('/');
    const dirPart = partial.slice(0, lastSlash);
    prefix = partial.slice(lastSlash + 1);
    searchDir = normalizePath(currentPath, dirPart || '/');
  }

  const node = getNode(searchDir);
  if (!node || node.type !== 'dir') return [];

  return Object.keys(node.children)
    .filter(name => name.startsWith(prefix))
    .map(name => {
      const isDir = node.children[name].type === 'dir';
      const full = partial.includes('/')
        ? partial.slice(0, partial.lastIndexOf('/') + 1) + name + (isDir ? '/' : '')
        : name + (isDir ? '/' : '');
      return full;
    });
}
