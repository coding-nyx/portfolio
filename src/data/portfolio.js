// Expanded data for the portfolio

export const profileData = {
  name: "Raj Kumar S",
  headline: "iOS Developer | Full-Cycle Development",
  location: "Chennai, India",
  profileImage: "/profile.jpg",
  summary: `Passionate iOS Developer with 2+ years of experience building sleek, scalable mobile applications. My expertise lies in full-cycle development, bridging the gap between complex logic and user-centric design. I thrive on solving architectural challenges and am constantly expanding my toolkit.`,
  socialLinks: {
    linkedin: "https://www.linkedin.com/in/raj-kumar-s",
    email: "raju9112000@gmail.com"
  }
};

export const skillsData = [
  { name: "Swift", level: 90, category: "Mobile" },
  { name: "SwiftUI", level: 85, category: "Mobile" },
  { name: "UIKit", level: 85, category: "Mobile" },
  { name: "Agentic Frameworks", level: 90, category: "AI" },
  { name: "AI / LLMs", level: 85, category: "AI" },
  { name: "Adaptability", level: 90, category: "Core" },
  { name: "Teamwork", level: 90, category: "Core" },
  { name: "Linux", level: 80, category: "OS" },
  { name: "Zoho Catalyst", level: 75, category: "Cloud" },
  { name: "Firebase", level: 75, category: "Backend" },
  { name: "React", level: 70, category: "Frontend" },
  { name: "AWS", level: 50, category: "Cloud" },
  { name: "Kotlin", level: 60, category: "Language" },
  { name: "Android", level: 60, category: "Mobile" },
  { name: "Java", level: 65, category: "Language" },
  { name: "React Native", level: 65, category: "Mobile" },
];

export const experienceData = [
  {
    company: "Zoho",
    role: "Member of Technical Staff",
    dates: "May 2022 - Present",
    duration: "3 yrs 8 mos",
    type: "Full-time",
    description: "As a Member of Technical Staff at Zoho since May 2022, I have focused on engineering modular UI architectures, developing an agentic development framework for rapid component creation and verification, creating reusable components in Swift, and ensuring design consistency across the Zoho mobile ecosystem. My role has included leading the design of critical modules from wireframing to API integration using Swift and UIKit/SwiftUI, reducing frontend development time by 30%, and optimizing app performance resulting in a 20% improvement in launch speed and reduced memory overhead.",
    projects: [
      {
        name: "Agentic Component Framework",
        desc: "Developed an agentic development framework for automating the generation, validation, and iteration of modular UI components."
      },
      {
        name: "Zoho Mobile UI Kit",
        desc: "Engineered a comprehensive library of reusable UI components using Swift, reducing frontend dev time by 30%."
      },
      {
        name: "Core Modules Revamp",
        desc: "Led the design of critical modules from wireframing to API integration, ensuring robust architecture."
      },
      {
        name: "Performance Overhaul",
        desc: "Refactored legacy code resulting in a 20% improvement in app launch speed and reduced memory overhead."
      }
    ]
  },
  {
    company: "Zoho",
    role: "Project Trainee",
    dates: "Sep 2021 - May 2022",
    duration: "9 mos",
    type: "Trainee",
    description: "Collaborated with the mobile team to understand core architectural patterns and contributed to bug fixes and minor feature enhancements.",
  },
  {
    company: "Zoho",
    role: "Intern",
    dates: "Apr 2021 - Jun 2021",
    duration: "3 mos",
    type: "Internship",
    description: "Initial exposure to professional iOS development workflows and Swift programming.",
  },
  {
    company: "Servion Global Solutions",
    role: "Intern",
    dates: "Nov 2019 - Dec 2019",
    duration: "2 mos",
    type: "Internship",
    description: "Gained insights into enterprise software solutions and team collaboration.",
  }
];

export const projects = [
  {
    name: "Hermes Companion App",
    tags: ["Android", "Kotlin", "Jetpack Compose", "Tailscale", "AI Agents"],
    description: "Native Android companion for a self-hosted Hermes Agent fleet: Tailscale pairing, bidirectional control, accessibility automation, and real-time chat.",
    imageUrl: null,
    liveUrl: "https://github.com/coding-nyx/hermes-companion-app/releases",
    repoUrl: "https://github.com/coding-nyx/hermes-companion-app",
    status: "Active"
  },
  {
    name: "a0090-meta (hub-11 OS)",
    tags: ["Linux Kernel", "RK3588", "Device Tree", "C", "Armbian"],
    description: "Upstream-maintainable Linux OS distribution for the AMedia RK3588 NVR Demo (hub-11), featuring mainline Linux 6.18, custom board DTS, FIT boot image assembly, and driver integration.",
    imageUrl: null,
    liveUrl: null,
    repoUrl: "https://github.com/coding-nyx/a0090-meta",
    status: "Active"
  },
  {
    name: "FitPro Connect",
    tags: ["React", "Firebase", "Stripe"],
    description: "A comprehensive platform empowering fitness trainers to manage classes, showcase portfolios, and connect with clients.",
    imageUrl: null,
    liveUrl: "https://personal-trainer-mock.web.app/",
    repoUrl: "https://github.com/coding-nyx/personal-trainer",
    status: "In Progress"
  },
  {
    name: "Nexus",
    tags: ["llm", "react", "react native", "firebase", "rag", "wellness"],
    description: "Nexus (AGNES): A unified, multi-agent AI wellness platform with specialized agents and E2EE for holistic stability.",
    imageUrl: null,
    liveUrl: "https://agent-agnes-ai.web.app",
    repoUrl: "https://github.com/coding-nyx/nexus-react-native",
    status: "In Progress"
  },
  {
    name: "Hermes Companion Web",
    tags: ["TypeScript", "Web", "Hermes", "AI Agents"],
    description: "Web companion for the Hermes agent — pair, chat, control the device, and forward mobile notifications.",
    imageUrl: null,
    liveUrl: null,
    repoUrl: "https://github.com/coding-nyx/hermes-companion-web",
    status: "Active"
  },
  {
    name: "Agentic Component Framework",
    tags: ["Agentic AI", "Python", "State Machine", "Multi-Agent", "Swift / iOS"],
    description: "A deterministic, config-driven agentic pipeline that automates component lifecycles from spec → contract → QA test suite → implementation → gate verification. Features 8 declarative quality gates, multi-target parallel tracks, and unified multi-ecosystem prompt compilation.",
    imageUrl: null,
    liveUrl: null,
    repoUrl: null,
    status: "Production"
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
    credentialUrl: "https://www.coursera.org/account/accomplishments/verify/KYC47RL4MWRX"
  },
  {
    name: "The Sustainable Development Goals – A global, transdisciplinary vision for the future",
    issuer: "Coursera",
    date: "Jul 2020",
    credentialUrl: "https://www.coursera.org/account/accomplishments/verify/X3U4Y9FM3D2W"
  },
  {
    name: "Step into Robotic process automation",
    issuer: "GUVI Geek Networks, IITM Research Park",
    date: "Jun 2020",
    credentialUrl: "https://www.guvi.in/verify-certificate?id=L60K9a3H209160515l"
  },
  {
    name: "Cybersecurity Essentials",
    issuer: "Cisco",
    date: "May 2020",
    credentialUrl: "" // No direct credential URL provided on LinkedIn
  },
  {
    name: "Entrepreneurship",
    issuer: "Cisco",
    date: "May 2020",
    credentialUrl: "" // No direct credential URL provided on LinkedIn
  },
  {
    name: "IT Academy: Network Virtualization Concepts",
    issuer: "VMware",
    date: "May 2020",
    credentialUrl: "https://www.youracclaim.com/badges/bad87375-c32e-4daa-8dd1-c295373d0c91"
  },
  {
    name: "IT Academy: Software Defined Storage Concepts",
    issuer: "VMware",
    date: "May 2020",
    credentialUrl: "https://www.youracclaim.com/badges/25e83b93-d84d-4110-8718-ea597e5c88d5"
  },
  {
    name: "Introduction to IoT",
    issuer: "Cisco",
    date: "May 2020",
    credentialUrl: "" // No direct credential URL provided on LinkedIn
  },
  {
    name: "Introduction to Packet Tracer",
    issuer: "Cisco",
    date: "May 2020",
    credentialUrl: "" // No direct credential URL provided on LinkedIn
  },
  {
    name: "Machine Learning for All",
    issuer: "Coursera",
    date: "May 2020",
    credentialUrl: "https://www.coursera.org/account/accomplishments/verify/2F477P28WVLY"
  },
  {
    name: "Predict Future Product Prices Using Facebook Prophet",
    issuer: "Coursera",
    date: "May 2020",
    credentialUrl: "https://www.coursera.org/account/accomplishments/verify/TURLH426RU69"
  }
];


export const testimonialsData = [
  {
    quote: "Raj Kumar's expertise in Swift and his commitment to clean architecture were instrumental in the success of our mobile UI Kit. He's a proactive problem-solver and a great team player.",
    name: "Priya Sharma",
    title: "Senior Software Engineer, Zoho"
  },
  {
    quote: "I was consistently impressed with Raj Kumar's ability to tackle complex UI challenges. His work on performance optimization significantly improved our app's user experience.",
    name: "Arjun Gupta",
    title: "Engineering Manager, Zoho"
  },
  {
    quote: "Working with Raj Kumar is a pleasure. He is not only a talented developer but also a great communicator who can clearly articulate technical concepts to non-technical stakeholders.",
    name: "Sunita Reddy",
    title: "Product Manager, Zoho"
  }
];


export const interestsData = [
  "Obstacle Course Races",
  "Linux Customization (Rice)",
  "System Architecture",
  "Retro Gaming"
];
