// Expanded data for the portfolio

export const profileData = {
  name: "Raj Kumar S",
  headline: "iOS / Apple Platform Engineer · Swift · UIKit · SwiftUI · SPM",
  location: "Chennai, India",
  profileImage: "/profile.jpg",
  summary: `iOS / Apple platform engineer and Member of Technical Staff at Zoho (May 2022–Present, ~4 yrs 4 mos). I build modular Swift architectures, shared UI libraries, and full-cycle mobile features across UIKit and SwiftUI — from wireframes through API integration — with a focus on design consistency and measurable performance. Public pillars: Hermes Companion and WorkTracker.`,
  socialLinks: {
    linkedin: "https://www.linkedin.com/in/raj-kumar-s",
    email: "raju9112000@gmail.com",
    github: "https://github.com/coding-nyx"
  }
};

export const skillsData = [
  { name: "Swift", level: 90, category: "Mobile" },
  { name: "UIKit", level: 88, category: "Mobile" },
  { name: "SwiftUI", level: 85, category: "Mobile" },
  { name: "SPM / packages", level: 85, category: "Mobile" },
  { name: "Kotlin", level: 70, category: "Mobile" },
  { name: "Android / Compose", level: 68, category: "Mobile" },
  { name: "TypeScript", level: 75, category: "Language" },
  { name: "React / Next.js", level: 72, category: "Frontend" },
  { name: "Firebase", level: 75, category: "Backend" },
  { name: "MCP / agent tooling", level: 80, category: "AI" },
  { name: "Linux", level: 80, category: "OS" },
];

export const experienceData = [
  {
    company: "Zoho",
    role: "Member of Technical Staff",
    dates: "May 2022 - Present",
    duration: "4 yrs 4 mos",
    type: "Full-time",
    description:
      "Member of Technical Staff on Zoho’s mobile platforms since May 2022. I engineer modular Swift UI architectures, ship reusable component libraries used across Zoho mobile surfaces, and own features from design handoff through networking and API integration (UIKit + SwiftUI). Work includes design-system consistency, performance and memory tuning, and internal agentic tooling that speeds component generation, validation, and gate checks — without publishing proprietary package names.",
    projects: [
      {
        name: "Shared mobile UI libraries",
        desc: "Reusable Swift components and patterns that keep look-and-feel consistent across Zoho mobile apps."
      },
      {
        name: "Module ownership (design → API)",
        desc: "Led critical modules from wireframes through API integration with robust architecture and error handling."
      },
      {
        name: "Agentic component tooling",
        desc: "Internal config-driven pipeline for component lifecycle: spec → contract → tests → implementation → verification gates."
      },
      {
        name: "Performance & memory",
        desc: "Refactored hot paths to improve launch behavior and reduce memory overhead on production apps."
      }
    ]
  },
  {
    company: "Zoho",
    role: "Project Trainee",
    dates: "Sep 2021 - May 2022",
    duration: "9 mos",
    type: "Trainee",
    description:
      "Collaborated with the mobile team on architectural patterns, bug fixes, and feature enhancements in Swift."
  },
  {
    company: "Zoho",
    role: "Intern",
    dates: "Apr 2021 - Jun 2021",
    duration: "3 mos",
    type: "Internship",
    description: "Intro to professional iOS workflows and Swift."
  },
  {
    company: "Servion Global Solutions",
    role: "Intern",
    dates: "Nov 2019 - Dec 2019",
    duration: "2 mos",
    type: "Internship",
    description: "Enterprise software exposure and team collaboration."
  }
];

export const projects = [
  {
    name: "WorkTracker",
    featured: true,
    tags: ["TypeScript", "Firebase", "Next.js", "MCP", "Kanban"],
    description:
      "Canonical work-item brain for agent fleets: multi-board kanban, REST + MCP (15 tools), Firestore live sync, command-queue brain, and connector plugins (Hermes, Claude Code, Codex, and more).",
    imageUrl: null, // @Design: needs real screenshot
    liveUrl: "https://worktracker-nyx.web.app",
    repoUrl: "https://github.com/coding-nyx/worktracker",
    status: "Active"
  },
  {
    name: "Hermes Companion App",
    featured: true,
    tags: ["Android", "Kotlin", "Jetpack Compose", "Tailscale", "AI Agents"],
    description:
      "Native Android companion for a self-hosted Hermes agent fleet: Tailscale pairing, bidirectional control, accessibility automation, and real-time chat.",
    imageUrl: null, // @Design: needs real screenshot
    liveUrl: "https://github.com/coding-nyx/hermes-companion-app/releases",
    repoUrl: "https://github.com/coding-nyx/hermes-companion-app",
    status: "Active"
  },
  {
    name: "Hermes Companion Web",
    featured: false,
    tags: ["TypeScript", "Web", "Hermes", "AI Agents"],
    description:
      "Web companion for the Hermes agent — pair, chat, control the device, and forward mobile notifications.",
    imageUrl: null,
    liveUrl: null,
    repoUrl: "https://github.com/coding-nyx/hermes-companion-web",
    status: "Active"
  },
  {
    name: "a0090-meta (hub-11 OS)",
    featured: false,
    tags: ["Linux Kernel", "RK3588", "Device Tree", "C", "Armbian"],
    description:
      "Upstream-maintainable Linux OS for the AMedia RK3588 NVR Demo: mainline Linux, custom board DTS, FIT boot, driver integration.",
    imageUrl: null,
    liveUrl: null,
    repoUrl: "https://github.com/coding-nyx/a0090-meta",
    status: "Active"
  },
  {
    name: "FitPro Connect",
    featured: false,
    tags: ["React", "Firebase", "Stripe"],
    description:
      "Platform for fitness trainers to manage classes, portfolios, and clients.",
    imageUrl: null,
    liveUrl: "https://personal-trainer-mock.web.app/",
    repoUrl: "https://github.com/coding-nyx/personal-trainer",
    status: "In Progress"
  },
  {
    name: "Nexus",
    featured: false,
    tags: ["llm", "react", "react native", "firebase", "rag", "wellness"],
    description:
      "Multi-agent AI wellness platform with specialized agents and E2EE.",
    imageUrl: null,
    liveUrl: "https://agent-agnes-ai.web.app",
    repoUrl: "https://github.com/coding-nyx/nexus-react-native",
    status: "In Progress"
  }
];

export const achievementsData = [
  {
    title: "Spartan Racer",
    event: "Obstacle Course",
    description: "Completed the 10km obstacle race in top 10%."
  }
];

export const awardsData = [
  {
    name: "Smart India Hackathon (Participant)",
    issuer: "Smart India Hackathon",
    date: "Aug 2020"
  }
];

export const certificationsData = [
  {
    name: "Programming for everybody (Getting started with python)",
    issuer: "Coursera",
    date: "Jul 2020",
    credentialUrl: "https://www.coursera.org/account/accomplishments/verify/KYC47RL4MWRX",
    older: true
  },
  {
    name: "The Sustainable Development Goals – A global, transdisciplinary vision for the future",
    issuer: "Coursera",
    date: "Jul 2020",
    credentialUrl: "https://www.coursera.org/account/accomplishments/verify/X3U4Y9FM3D2W",
    older: true
  },
  {
    name: "Step into Robotic process automation",
    issuer: "GUVI Geek Networks, IITM Research Park",
    date: "Jun 2020",
    credentialUrl: "https://www.guvi.in/verify-certificate?id=L60K9a3H209160515l",
    older: true
  },
  {
    name: "Cybersecurity Essentials",
    issuer: "Cisco",
    date: "May 2020",
    credentialUrl: "",
    older: true
  },
  {
    name: "Entrepreneurship",
    issuer: "Cisco",
    date: "May 2020",
    credentialUrl: "",
    older: true
  },
  {
    name: "IT Academy: Network Virtualization Concepts",
    issuer: "VMware",
    date: "May 2020",
    credentialUrl: "https://www.youracclaim.com/badges/bad87375-c32e-4daa-8dd1-c295373d0c91",
    older: true
  },
  {
    name: "IT Academy: Software Defined Storage Concepts",
    issuer: "VMware",
    date: "May 2020",
    credentialUrl: "https://www.youracclaim.com/badges/25e83b93-d84d-4110-8718-ea597e5c88d5",
    older: true
  },
  {
    name: "Introduction to IoT",
    issuer: "Cisco",
    date: "May 2020",
    credentialUrl: "",
    older: true
  },
  {
    name: "Introduction to Packet Tracer",
    issuer: "Cisco",
    date: "May 2020",
    credentialUrl: "",
    older: true
  },
  {
    name: "Machine Learning for All",
    issuer: "Coursera",
    date: "May 2020",
    credentialUrl: "https://www.coursera.org/account/accomplishments/verify/2F477P28WVLY",
    older: true
  },
  {
    name: "Predict Future Product Prices Using Facebook Prophet",
    issuer: "Coursera",
    date: "May 2020",
    credentialUrl: "https://www.coursera.org/account/accomplishments/verify/TURLH426RU69",
    older: true
  }
];

export const testimonialsData = [];

export const interestsData = [
  "Obstacle Course Races",
  "Linux Customization (Rice)",
  "System Architecture",
  "Retro Gaming"
];
