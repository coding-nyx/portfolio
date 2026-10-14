// Authoritative public facts shared by the approved chapters and Rook.
export const EMPLOYMENT = {
  "employer": "Zoho",
  "role": "Member of Technical Staff",
  "startDate": "2022-05"
};

export const SITE = {
  "url": "https://iamnyx.web.app",
  "title": "Raj Kumar S — iOS Product Engineer",
  "description": "iOS product engineer at Zoho since May 2022, developing reusable Kanban, spreadsheet and navigation components, with a focus on native UI performance and product integration."
};

export const achievementsData = [
  {
    "title": "10km Obstacle Race",
    "pendingConfirmation": true,
    "event": "Obstacle course race",
    "description": "Completed a 10km obstacle course race. The finishing position is not published because no verifiable event result has been confirmed."
  }
];

export const awardsData = [
  {
    "name": "Smart India Hackathon",
    "issuer": "Participant",
    "date": "Aug 2020",
    "description": "Participated in the Smart India Hackathon as part of a team, working on a prototype under a continuous sprint."
  }
];

export const certificationsData = [
  {
    "name": "Programming for everybody (Getting started with python)",
    "issuer": "Coursera",
    "date": "Jul 2020",
    "credentialUrl": "https://www.coursera.org/account/accomplishments/verify/KYC47RL4MWRX"
  },
  {
    "name": "The Sustainable Development Goals – A global, transdisciplinary vision for the future",
    "issuer": "Coursera",
    "date": "Jul 2020",
    "credentialUrl": "https://www.coursera.org/account/accomplishments/verify/X3U4Y9FM3D2W"
  },
  {
    "name": "Step into Robotic process automation",
    "issuer": "GUVI Geek Networks, IITM Research Park",
    "date": "Jun 2020",
    "credentialUrl": "https://www.guvi.in/verify-certificate?id=L60K9a3H209160515l"
  },
  {
    "name": "Cybersecurity Essentials",
    "issuer": "Cisco",
    "date": "May 2020",
    "credentialUrl": ""
  },
  {
    "name": "Entrepreneurship",
    "issuer": "Cisco",
    "date": "May 2020",
    "credentialUrl": ""
  },
  {
    "name": "IT Academy: Network Virtualization Concepts",
    "issuer": "VMware",
    "date": "May 2020",
    "credentialUrl": "https://www.youracclaim.com/badges/bad87375-c32e-4daa-8dd1-c295373d0c91"
  },
  {
    "name": "IT Academy: Software Defined Storage Concepts",
    "issuer": "VMware",
    "date": "May 2020",
    "credentialUrl": "https://www.youracclaim.com/badges/25e83b93-d84d-4110-8718-ea597e5c88d5"
  },
  {
    "name": "Introduction to IoT",
    "issuer": "Cisco",
    "date": "May 2020",
    "credentialUrl": ""
  },
  {
    "name": "Introduction to Packet Tracer",
    "issuer": "Cisco",
    "date": "May 2020",
    "credentialUrl": ""
  },
  {
    "name": "Machine Learning for All",
    "issuer": "Coursera",
    "date": "May 2020",
    "credentialUrl": "https://www.coursera.org/account/accomplishments/verify/2F477P28WVLY"
  },
  {
    "name": "Predict Future Product Prices Using Facebook Prophet",
    "issuer": "Coursera",
    "date": "May 2020",
    "credentialUrl": "https://www.coursera.org/account/accomplishments/verify/TURLH426RU69"
  }
];

export const experienceData = [
  {
    "company": "Zoho",
    "role": "Member of Technical Staff",
    "startDate": "2022-05",
    "dates": "May 2022 - Present",
    "type": "Full-time",
    "description": "Develops reusable Kanban, spreadsheet and navigation components, covering requirements analysis, feasibility, native UI performance and product-team integration.",
    "uiWork": {
      "title": "UI layout and performance",
      "summary": "Worked on application navigation, component layouts and scrolling performance.",
      "intro": "Examples from product navigation and reusable component work.",
      "examples": [
        {
          "title": "Adaptive product navigation",
          "contextLabel": "Scope",
          "context": "App-wide UI redesign and navigation improvements as part of a major iOS product revamp.",
          "analysisLabel": "Adaptive layout",
          "analysis": "Implemented a reusable three-panel split view for phone, landscape and iPad layouts. Switched between rail navigation and a tab bar based on available size and traitCollection.",
          "changeLabel": "Module integration",
          "change": "Modules could plug directly into the layout and declare actions such as Add, Filter and Search. The parent layout supplied the navigation items and callbacks, keeping modules from duplicating navigation setup.",
          "reasoningLabel": "Ownership",
          "reasoning": "Personally implemented the adaptive navigation layout and its componentization. Also contributed to overall revamp planning and led UI redesign and navigation improvements."
        },
        {
          "title": "Spreadsheet scrolling",
          "context": "Row scrolling started to stutter as the number of spreadsheet columns increased.",
          "analysis": "Used Xcode Instruments to investigate the scrolling path. Collection-view layout-item creation accounted for the largest share of the profile, with repeated work in the layout.",
          "change": "Cached layout attributes locally within UICollectionViewLayout to avoid repeatedly reindexing all cells.",
          "reasoning": "Reuse layout information rather than recreate it on each pass. The cache stayed within the layout, where that information was needed."
        },
        {
          "title": "Kanban column backgrounds",
          "context": "Each column needed a background that followed both the number of cards and their varying heights.",
          "analysis": "Sizing one background for the entire column would require knowing the full content height. The aim was to avoid measuring all the cards separately up front.",
          "change": "Split the column background across the cells and the refresh-control background.",
          "reasoning": "Compose the column's appearance from backgrounds that follow the existing layout, rather than calculate a separate full-column background size."
        }
      ]
    },
    "projects": [
      {
        "id": "production-app-revamp",
        "name": "Production App Revamp",
        "desc": "Implemented integration with updated APIs aligned with the web app and middleware parsing to translate web API responses for mobile. Contributed to revamp planning and led UI redesign and navigation improvements. Also contributed to feature additions, bug fixes and minor releases.",
        "resumeSummary": "Implemented web-aligned API integration and middleware parsing for a major app revamp; contributed to planning and led UI redesign and navigation improvements. Also contributed to features, bug fixes and minor releases."
      },
      {
        "name": "Reusable Product UI",
        "desc": "Developed Kanban, spreadsheet and navigation components. Prototyped UIKit, SwiftUI and hybrid approaches using collection views, table views, List, lazy stacks and custom compositional layouts.",
        "resumeSummary": "Developed Kanban, spreadsheet and navigation components; prototyped UIKit, SwiftUI and hybrid approaches with collection/table views, lazy stacks and compositional layouts. Helped product teams integrate the components."
      },
      {
        "id": "adaptive-navigation-layout",
        "name": "Adaptive navigation layout",
        "desc": "Implemented a reusable three-panel split view for phone, landscape and iPad, switching between rail navigation and a tab bar based on size and traitCollection. Modules declared actions such as Add, Filter and Search; the parent layout supplied navigation items and callbacks.",
        "resumeSummary": "Implemented a reusable three-panel split view for phone, landscape and iPad, with size/trait-based rail and tab-bar switching. Modules declared actions; the parent layout supplied navigation items and callbacks."
      },
      {
        "id": "spreadsheet-layout-performance",
        "name": "Spreadsheet scrolling",
        "desc": "Used Xcode Instruments to investigate spreadsheet scrolling stutter and repeated layout-item creation. Cached layout attributes in UICollectionViewLayout to avoid repeated reindexing as columns increased."
      },
      {
        "id": "kanban-column-layout",
        "name": "Kanban backgrounds",
        "desc": "Used cell and refresh-control backgrounds to handle Kanban columns with variable card counts and heights, avoiding separate measurement of the full column.",
        "resumeOmit": true
      },
      {
        "name": "Component Integration Support",
        "desc": "Shared components with product teams and helped them integrate the components into their apps.",
        "resumeOmit": true
      },
      {
        "id": "component-integration-mcp",
        "name": "Component Integration MCP",
        "desc": "Developed an MCP exposing component APIs and documentation to make integration easier. A product team currently uses it."
      },
      {
        "id": "ai-sdlc-prototype",
        "name": "AI SDLC for UI components",
        "desc": "Implemented a prototype that plans component features and tests from a written spec, then generates component code and UI automation. Supports versioned updates and feature additions.",
        "resumeSummary": "Built a spec-driven prototype that plans features and tests before generating component code and UI automation, with platform-specific plans and support for versioned feature updates.",
        "details": {
          "intro": "The component spec carries the feature requirements and implementation decisions through planning, code generation and UI testing. The aim is to keep the implementation and its test expectations tied to the same requirements.",
          "steps": [
            { "title": "Start with the component spec", "body": "The input describes the features the component needs and the implementation decisions it should follow." },
            { "title": "Define the work and checks before code", "body": "The framework analyses the spec and produces development tasks, test cases and accessibility identifiers for UI automation. Testing is planned alongside the feature work from the start." },
            { "title": "Prepare a plan for each platform", "body": "It creates implementation plans for the platforms where the component library is needed, targeting iOS and Android." },
            { "title": "Generate implementation and UI automation", "body": "Component code and UI automation tests are generated alongside each other, so the workflow covers both building the UI and preparing checks for its behaviour." }
          ],
          "updates": "For a new version or feature addition, the workflow can start from the updated spec and prepare the corresponding implementation and testing work."
        }
      }
    ]
  },
  {
    "company": "Zoho",
    "role": "Project Trainee",
    "dates": "Sep 2021 - May 2022",
    "type": "Trainee",
    "description": "Worked with the mobile team on architectural patterns, bug fixes and minor feature enhancements. Trainee period, excluded from the full-time tenure figure above."
  },
  {
    "company": "Zoho",
    "role": "Intern",
    "dates": "Apr 2021 - Jun 2021",
    "type": "Internship",
    "description": "Initial exposure to professional iOS development workflows and Swift programming."
  },
  {
    "company": "Servion Global Solutions",
    "role": "Intern",
    "dates": "Nov 2019 - Dec 2019",
    "type": "Internship",
    "description": "Gained insights into enterprise software solutions and team collaboration."
  }
];

export const interestsData = [
  "Obstacle Course Races",
  "Linux Customization",
  "System Architecture",
  "Retro Gaming"
];

export const profileData = {
  "name": "Raj Kumar S",
  "roleTitle": "iOS Product Engineer",
  "heroSummary": "iOS product delivery, reusable native components and performance.",
  "deliverySummary": "Early in the Member of Technical Staff role, contributed to feature additions, bug fixes and minor releases. For a major product release, implemented API integration and middleware parsing, contributed to revamp planning, and led UI redesign and navigation improvements.",
  "headline": "iOS Product Engineer at Zoho | Native UI Components | Swift, UIKit & SwiftUI",
  "location": "Chennai, India",
  "profileImage": "/profile.jpg",
  "summary": "iOS engineer at Zoho since May 2022, developing reusable Kanban, spreadsheet and navigation components. For a major app revamp, implemented API integration and middleware parsing, contributed to planning, and led UI redesign and navigation improvements. Current work includes native UI performance and component integration tooling.",
  "resumeSummary": "iOS product engineer at Zoho since May 2022, building reusable Kanban, spreadsheet and navigation components. Experience spans app revamps, native UI performance, API integration and developer tooling.",
  "socialLinks": {
    "linkedin": "https://www.linkedin.com/in/raj-kumar-s",
    "email": "9080251@gmail.com",
    "github": "https://github.com/coding-nyx"
  }
};

export const projects = [
  {
    "name": "WorkTracker",
    "featured": true,
    "tags": [
      "TypeScript",
      "Firebase",
      "Next.js",
      "MCP",
      "Kanban"
    ],
    "description": "A shared task board for coordinating AI agents, with multiple Kanban boards, live updates, REST and MCP access, a command queue, and connector plugins.",
    "imageUrl": "/projects/worktracker-kanban.webp",
    "liveUrl": null,
    "linksUnavailableReason": "The published deployment is currently unavailable. The public source repository remains available.",
    "repoUrl": "https://github.com/coding-nyx/worktracker",
    "status": "Active"
  },
  {
    "name": "Hermes Companion",
    "featured": true,
    "tags": [
      "Android",
      "Kotlin",
      "Jetpack Compose",
      "Tailscale",
      "TypeScript",
      "Web"
    ],
    "description": "Android app and TypeScript web client for the same self-hosted Hermes agent fleet: pair, chat, control devices and forward notifications.",
    "imageUrl": "/projects/hermes-companion-chat.webp",
    "liveUrl": "https://github.com/coding-nyx/hermes-companion-app/releases",
    "repoUrl": "https://github.com/coding-nyx/hermes-companion-app",
    "status": "Active project",
    "scope": "Personal project",
    "linkLabel": "Releases / Download APK",
    "availability": "live",
    "caseStudy": {
      "problem": "The same self-hosted agent fleet needs a connected mobile and web experience for pairing, chat and device control.",
      "approach": "Built a Kotlin/Jetpack Compose Android app with Tailscale pairing, accessibility automation and connection recovery, alongside a TypeScript web client for pairing, chat, device control and notification forwarding.",
      "scope": "One personal project with Android and web clients.",
      "evidence": "Public Android source repository and published Android APK releases.",
      "limitations": "Personal project with public source and Android releases. No usage or adoption figures are published."
    },
    "sourceLinks": [
      {
        "label": "Android source",
        "url": "https://github.com/coding-nyx/hermes-companion-app"
      }
    ],
    "platforms": [
      {
        "name": "Android app",
        "language": "Kotlin",
        "uiFramework": "Jetpack Compose"
      },
      {
        "name": "Web client",
        "language": "TypeScript"
      }
    ]
  },
  {
    "name": "Tally",
    "featured": false,
    "tags": [
      "React",
      "TypeScript",
      "Local Storage",
      "CSV / PDF",
      "MCP"
    ],
    "description": "A personal finance tracker for multiple accounts, credit cards, loans and monthly budgets, with statement import and review, separate INR/USD ledgers and backup recovery. Includes a stdio MCP bridge for shared-ledger tools; AI-client connections are in progress.",
    "resumeSummary": "React/TypeScript finance tracker for multiple accounts, credit cards, loans and budgets, with statement imports, recovery and REST/stdio MCP tools. AI-client connections and an open-source release are in progress.",
    "architecture": {
      "title": "Tally tool connection",
      "note": "Implemented service and MCP bridge; client connections are in progress",
      "steps": [
        { "name": "Compatible AI client", "detail": "Intended Hermes, ChatGPT and other client workflows" },
        { "name": "Local stdio MCP bridge", "detail": "Discovers tools and forwards typed calls" },
        { "name": "Private HTTPS REST service", "detail": "Shared-ledger operations" }
      ],
      "branchesTitle": "Tool groups",
      "branches": ["Transactions", "Statements / imports", "Budgets / summaries", "Exports / recovery"],
      "foundations": [
        { "name": "PostgreSQL ledger", "detail": "Persistent shared workspace" },
        { "name": "Operation safeguards", "detail": "Revision checks, idempotent retries and frozen previews" }
      ]
    },
    "imageUrl": "/projects/tally-dashboard.webp",
    "imageAlt": "Tally budget dashboard showing synthetic sample records",
    "imageCaption": "Budget dashboard · sample data",
    "liveUrl": null,
    "repoUrl": "https://github.com/coding-nyx/tally",
    "sourceLinks": [{ "label": "Source (public soon)", "url": "https://github.com/coding-nyx/tally" }],
    "status": "Personal project",
    "scope": "Personal web application",
    "linksUnavailableReason": "Open-source release planned. The linked repository is currently private and will be public soon; no public demo is linked.",
    "caseStudy": {
      "problem": "Track multiple accounts, credit cards, loans and monthly budgets, turn transaction files into reviewed records, and make financial data accessible through a shared tool interface for AI clients.",
      "approach": "Implemented a React/TypeScript personal finance tracker with multiple-account tracking, credit-card tracking, loan tracking and category budgets. Browser-local persistence supports separate INR/USD ledgers and integer minor-unit amounts. CSV and text-PDF imports include column mapping, date review and duplicate detection before confirmation. JSON backup, restore and migration support data recovery.",
      "integration": "Implemented a stdio MCP bridge backed by a shared-ledger REST service for transaction entry and retrieval, statement upload/import, summaries and exports. Client integration is in progress and targets compatible AI clients, including intended Hermes and ChatGPT workflows.",
      "scope": "Personal web application with browser-local budgeting, a persistent private shared ledger and implemented REST/MCP tooling. Browser-local and shared data are separate modes; AI-client connections remain in progress.",
      "evidence": "Repository implementation includes import-review UI and tests for parsing, duplicate detection, date ambiguity and currency conflicts. Live read-only discovery verified 95 advertised tools, and service status reported persistent storage ready with statement features enabled. Client-specific end-to-end behavior has not been verified in this review. An open-source release is planned; the repository is currently private.",
      "limitations": "Client connections, including Hermes and ChatGPT, remain in progress. Text-PDF extraction is best effort; scanned and password-protected statements are unsupported. Browser-local records require backups. No public demo or usage figures are published."
    }
  },
  {
    "name": "a0090-meta (hub-11 OS)",
    "featured": false,
    "tags": [
      "Linux Kernel",
      "RK3588",
      "Device Tree",
      "C"
    ],
    "description": "Linux OS distribution for an RK3588 NVR demo board, with a custom device-tree source and reproducible build steps.",
    "imageUrl": null,
    "liveUrl": null,
    "repoUrl": "https://github.com/coding-nyx/a0090-meta",
    "status": "Active project",
    "scope": "Personal / open-source project",
    "linksUnavailableReason": "No hosted demo deployment; source repository only.",
    "caseStudy": {
      "problem": "An unsupported RK3588 NVR demo board needed a bootable, maintainable Linux distribution rather than a vendor image that could not be reproduced.",
      "approach": "Produced a board device-tree source, assembled a FIT boot image, integrated kernel drivers against mainline Linux 6.18, and documented the build, flash and verification steps so the result is reproducible.",
      "scope": "Personal and open-source board enablement.",
      "evidence": "Public repository containing a substantial board DTS plus kernel, config, patch, FIT, rootfs and recovery layout, with documented build and flash verification steps. The README also documents an unresolved Wi-Fi/AP limitation.",
      "limitations": "Wi-Fi/AP support is an open limitation documented in the repository. No upstream merge is claimed."
    }
  },
  {
    "name": "Nexus",
    "featured": false,
    "tags": [
      "LLM",
      "React Native",
      "Firestore",
      "Agent Orchestration",
      "Retrieval"
    ],
    "description": "A working personal multi-agent prototype with specialist personas, an orchestrator, indexed Firestore memory retrieval and context compression. Includes image analysis and web scraping.",
    "resumeSummary": "React Native multi-agent prototype with personally implemented specialist personas, orchestration, indexed Firestore memory retrieval and context compression, plus image analysis and web scraping.",
    "architecture": {
      "title": "Nexus agent architecture",
      "note": "Overview of the implemented personal prototype",
      "steps": [
        { "name": "React Native interface" },
        { "name": "Orchestrator", "detail": "Encapsulates the specialist agents" }
      ],
      "branchesTitle": "Specialist agents",
      "branches": ["Psychiatrist persona", "Trainer", "Finance", "Research", "Doctor persona"],
      "foundations": [
        { "name": "Agent/model mappings", "detail": "Structured persona definitions (\"soul\")" },
        { "name": "Firestore memory", "detail": "Indexed retrieval and context compression" }
      ],
      "capabilities": ["Image analysis", "Web scraping"]
    },
    "imageUrl": null,
    "liveUrl": null,
    "repoUrl": null,
    "status": "Prototype",
    "scope": "Personal prototype",
    "linksUnavailableReason": "Source is private; no verified public demo is available.",
    "caseStudy": {
      "problem": "Maintain distinct specialist-agent personalities and access earlier information as conversations grow, while presenting one interface over the agents.",
      "approach": "Personally implemented specialist agents with psychiatrist, trainer, finance, research and doctor personas. Designed structured agent/model mappings with persona definitions (\"soul\"), persisted data in Firestore, and implemented indexed retrieval and context compression. Built an orchestrator to encapsulate the agents behind a shared interface, with image-analysis and web-scraping capabilities.",
      "scope": "Personal React Native prototype with an end-to-end working agent system. The work included implementing agent behavior and personalities, memory structures, retrieval, compression and orchestration.",
      "evidence": "Personal implementation covering specialist-agent behavior, orchestration and Firestore-backed memory. The architecture overview documents these pieces; source remains private and no public demo is linked.",
      "limitations": "Retrieval and compression manage what enters each prompt; model context limits still apply. No published evaluation of persona consistency, retrieval quality or image-analysis accuracy is available."
    }
  }
];

export const skillGroupsData = [
  {
    "id": "ios-mobile",
    "title": "iOS Product & Component Engineering",
    "subtitle": "Production iOS work at Zoho since May 2022.",
    "evidence": [
      "Reusable Kanban, spreadsheet and navigation components for Zoho iOS apps",
      "Requirements analysis, design refinement, feature planning and feasibility",
      "UIKit, SwiftUI and hybrid prototypes using collection views, table views, lazy stacks and custom compositional layouts",
      "Xcode Instruments analysis and local layout-attribute caching for a wide spreadsheet",
      "Product-team support for component integration"
    ],
    "tags": [
      "Swift",
      "SwiftUI",
      "UIKit",
      "Modular Architecture",
      "Performance"
    ]
  },
  {
    "id": "agentic-ai",
    "title": "Internal Developer Tooling",
    "subtitle": "Component integration MCP and an AI SDLC prototype for native UI generation.",
    "evidence": [
      "Component APIs and documentation exposed through an MCP used by a product team",
      "Analyses specs containing implementation decisions and feature lists",
      "Produces development and test checklists, test cases and accessibility identifiers before implementation",
      "Prepares iOS/Android implementation plans and generates UI automation tests alongside component implementation",
      "Supports versioned component updates and new feature additions"
    ],
    "tags": [
      "Agentic AI",
      "Python",
      "LLM Pipelines",
      "Quality Gates",
      "Tooling"
    ]
  },
  {
    "id": "systems-linux",
    "title": "Systems & Embedded Linux",
    "subtitle": "Personal and open-source board enablement work (RK3588).",
    "evidence": [
      "Board device-tree source and FIT boot image assembly",
      "Kernel driver integration on a mainline Linux 6.18 target",
      "Reproducible build, flash and recovery documentation"
    ],
    "tags": [
      "Linux Kernel",
      "RK3588",
      "Device Tree",
      "C",
      "Boot Chain"
    ]
  },
  {
    "id": "android-web",
    "title": "Android & Web",
    "subtitle": "Project work alongside the primary iOS track.",
    "evidence": [
      "Kotlin/Compose Android companion app with published APK releases",
      "TypeScript web companion for the same agent fleet",
      "React/Firebase web applications"
    ],
    "tags": [
      "Kotlin",
      "Jetpack Compose",
      "TypeScript",
      "React",
      "Firebase"
    ]
  }
];

export const testimonialsData = [];

export const skillsData = [
  {
    "name": "Swift",
    "category": "Mobile",
    "evidence": "Developed reusable Kanban, spreadsheet and navigation components for Zoho iOS apps, from requirements analysis to product-team integration support."
  },
  {
    "name": "UIKit",
    "category": "Mobile",
    "evidence": "Prototyped collection views, table views and custom compositional layouts. Used Instruments to investigate spreadsheet scrolling and cached layout attributes locally within UICollectionViewLayout."
  },
  {
    "name": "SwiftUI",
    "category": "Mobile",
    "evidence": "Explored List, LazyVStack, LazyHStack and hybrid UIKit/SwiftUI approaches while prototyping native product components."
  },
  {
    "name": "SPM / packages",
    "category": "Mobile"
  },
  {
    "name": "Kotlin",
    "category": "Mobile"
  },
  {
    "name": "Android / Compose",
    "category": "Mobile"
  },
  {
    "name": "TypeScript",
    "category": "Language"
  },
  {
    "name": "React / Next.js",
    "category": "Frontend"
  },
  {
    "name": "Firebase",
    "category": "Backend"
  },
  {
    "name": "Zoho Catalyst",
    "category": "Backend",
    "evidence": "Used Zoho Catalyst for MCP hosting, internal documentation hosting and issue-tracking tooling."
  },
  {
    "name": "MCP / agent tooling",
    "category": "AI",
    "evidence": "Developed a component integration MCP exposing APIs and documentation, currently used by a product team. Also built an AI SDLC prototype that takes a component spec through feature and test planning, platform plans, component generation and UI automation generation. The Experience section explains the workflow and versioned feature support."
  },
  {
    "name": "Linux",
    "category": "OS"
  }
];
