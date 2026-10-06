/**
 * Single source of truth for professional facts.
 *
 * Hero, Experience, case studies, the terminal VFS and the assistant prompt all
 * read from here so they cannot drift independently.
 *
 * Factual rules enforced by the portfolio brief:
 *  - No hardcoded year counts. Tenure is derived from EMPLOYMENT.fullTime.start.
 *  - No invented metrics, adoption, leadership, awards or testimonials.
 *  - Confirmed participation is retained; unsupported distinctions are removed.
 *  - Link availability is recorded as data so UI can disable broken actions.
 */

// Full-time start date as published. Trainee/intern months are excluded so the
// tenure figure can never be inflated by them.
export const EMPLOYMENT = {
  employer: 'Zoho',
  role: 'Member of Technical Staff',
  startDate: '2022-05',
};

export const profileData = {
  name: 'Raj Kumar S',
  headline: 'iOS Engineer at Zoho | Swift, SwiftUI & UIKit | Modular UI Systems & Performance',
  location: 'Chennai, India',
  profileImage: '/profile.jpg',
  // Recruiter-facing and immediately readable: no typing animation is required to
  // get this sentence, because it is the same value the terminal types out.
  summary:
    'iOS engineer at Zoho since May 2022, working with Swift, SwiftUI and UIKit on reusable UI components, modular mobile architecture and application performance. Supporting work spans internal agentic developer tooling, Android and embedded Linux.',
  socialLinks: {
    linkedin: 'https://www.linkedin.com/in/raj-kumar-s',
    email: 'raju9112000@gmail.com',
  },
};

// Skill groups replace the previous 0-100 percentage bars, which had no defined
// basis. Each group names concrete associated work instead of a rating.
export const skillGroupsData = [
  {
    id: 'ios-mobile',
    title: 'iOS & Mobile Systems',
    subtitle: 'Production iOS work at Zoho since May 2022.',
    evidence: [
      'Reusable Swift/SwiftUI and UIKit component library for mobile modules',
      'Modular architecture and refactoring of existing application modules',
      'Launch-time and memory optimisation work on mobile applications',
    ],
    tags: ['Swift', 'SwiftUI', 'UIKit', 'Modular Architecture', 'Performance'],
  },
  {
    id: 'agentic-ai',
    title: 'Internal Developer Tooling',
    subtitle: 'Agentic component-generation workflow used as internal tooling.',
    evidence: [
      'Spec to contract to test to implementation to verification workflow',
      'Declarative quality gates and deterministic pipeline state',
      'Used for component scaffolding; internal tooling, not a customer product',
    ],
    tags: ['Agentic AI', 'Python', 'LLM Pipelines', 'Quality Gates', 'Tooling'],
  },
  {
    id: 'systems-linux',
    title: 'Systems & Embedded Linux',
    subtitle: 'Personal and open-source board enablement work (RK3588).',
    evidence: [
      'Board device-tree source and FIT boot image assembly',
      'Kernel driver integration on a mainline Linux 6.18 target',
      'Reproducible build, flash and recovery documentation',
    ],
    tags: ['Linux Kernel', 'RK3588', 'Device Tree', 'C', 'Boot Chain'],
  },
  {
    id: 'android-web',
    title: 'Android & Web',
    subtitle: 'Project work alongside the primary iOS track.',
    evidence: [
      'Kotlin/Compose Android companion app with published APK releases',
      'TypeScript web companion for the same agent fleet',
      'React/Firebase web applications',
    ],
    tags: ['Kotlin', 'Jetpack Compose', 'TypeScript', 'React', 'Firebase'],
  },
];

export const experienceData = [
  {
    company: 'Zoho',
    role: 'Member of Technical Staff',
    startDate: '2022-05',
    dates: 'May 2022 - Present',
    type: 'Full-time',
    description:
      'Full-time iOS engineering at Zoho since May 2022. Work centres on a reusable Swift/UIKit component library, modular mobile architecture for existing application modules, and launch/memory performance work. Also built an internal agentic development workflow that scaffolds components from a specification through contract, test and verification steps.',
    projects: [
      {
        name: 'Reusable UI Component Library',
        desc: 'Engineered a reusable component library in Swift, SwiftUI and UIKit used to keep mobile module design consistent.',
      },
      {
        name: 'Core Module Architecture',
        desc: 'Worked through critical modules from early wireframes through API integration.',
      },
      {
        name: 'Performance Work',
        desc: 'Refactored existing code paths to improve app launch time and reduce memory overhead.',
      },
      {
        name: 'Agentic Development Workflow',
        desc: 'Built an internal spec-driven workflow that scaffolds components with declarative verification gates.',
      },
    ],
  },
  {
    company: 'Zoho',
    role: 'Project Trainee',
    dates: 'Sep 2021 - May 2022',
    type: 'Trainee',
    description:
      'Worked with the mobile team on architectural patterns, bug fixes and minor feature enhancements. Trainee period, excluded from the full-time tenure figure above.',
  },
  {
    company: 'Zoho',
    role: 'Intern',
    dates: 'Apr 2021 - Jun 2021',
    type: 'Internship',
    description: 'Initial exposure to professional iOS development workflows and Swift programming.',
  },
  {
    company: 'Servion Global Solutions',
    role: 'Intern',
    dates: 'Nov 2019 - Dec 2019',
    type: 'Internship',
    description: 'Gained insights into enterprise software solutions and team collaboration.',
  },
];

/**
 * Projects are ordered iOS-first for the primary hiring lane.
 *
 * `status` is deliberately plain and evidence-based. "Production" is used only
 * where the work is production iOS employment; internal tooling says so, and
 * personal projects say so.
 *
 * `availability` records the verified state of each destination:
 *   'live'    - reachable, no auth wall
 *   'unavailable' - confirmed broken or not publicly reachable; no action rendered
 */
export const projects = [
  {
    name: 'iOS Modular UI Architecture',
    tags: ['Swift', 'SwiftUI', 'UIKit', 'Performance'],
    description:
      'Production iOS work at Zoho: a reusable component library, modular structure for existing application modules, and launch/memory performance work.',
    status: 'Production work',
    scope: 'Professional iOS employment',
    liveUrl: null,
    repoUrl: null,
    linksUnavailableReason: 'Employer work; no public repository or public demo exists.',
    caseStudy: {
      problem:
        'Mobile modules at Zoho needed a shared way to build consistent interfaces, and existing modules carried accumulated launch and memory overhead.',
      approach:
        'Built a reusable component library in Swift, SwiftUI and UIKit so modules compose from shared pieces instead of duplicating implementation, then refactored existing code paths targeting launch time and memory use.',
      scope:
        'Production iOS modules as a Member of Technical Staff. Proprietary employer code is not published or described here.',
      evidence:
        'The role, employer and dates are published on the official résumé PDFs. Component structure and performance work are described qualitatively.',
      limitations:
        'No public measurement report exists for the performance work, so no specific timings, memory figures or percentage improvements are claimed here. Ownership split across the team is not stated because it has not been confirmed.',
    },
  },
  {
    name: 'Agentic Component Development Workflow',
    tags: ['Agentic AI', 'Python', 'Quality Gates', 'Internal Tooling'],
    description:
      'Internal developer tooling that scaffolds UI components through a spec, contract, test and verification sequence, with declarative quality gates.',
    status: 'Internal tooling',
    scope: 'Internal developer tooling at Zoho',
    liveUrl: null,
    repoUrl: null,
    linksUnavailableReason:
      'Internal tooling; no public repository or public demo, and no proprietary identifiers are published.',
    caseStudy: {
      problem:
        'Generating a UI component consistently across platforms needed repeatable steps and a way to fail early when a generated artifact did not match its specification.',
      approach:
        'Designed a deterministic, config-driven pipeline that moves a component through specification, contract, test suite, implementation and verification steps, gating each transition behind declarative checks.',
      scope:
        'Internal engineering tooling. No customer-facing product, and no guarantee of zero regressions or full compliance is claimed.',
      evidence:
        'The workflow is described in generic terms on this site and in the assistant data; no internal identifiers, code or metrics are published.',
      limitations:
        'Adoption, team size and measured benefit have not been confirmed, so none are stated. No performance improvement figure is claimed.',
    },
  },
  {
    name: 'Hermes Companion App',
    tags: ['Android', 'Kotlin', 'Jetpack Compose', 'Tailscale'],
    description:
      'Native Android companion for a self-hosted agent fleet, with published APK releases.',
    status: 'Active project',
    scope: 'Personal project',
    liveUrl: 'https://github.com/coding-nyx/hermes-companion-app/releases',
    repoUrl: 'https://github.com/coding-nyx/hermes-companion-app',
    linkLabel: 'Releases / Download APK',
    availability: 'live',
    caseStudy: {
      problem:
        'Controlling and observing a self-hosted agent fleet from a phone needs a real device connection with clear permission boundaries, not a simulated dashboard.',
      approach:
        'Built a Kotlin/Jetpack Compose app that pairs over a Tailscale mesh, performs device control through accessibility automation, and keeps a bidirectional connection lifecycle with state synchronisation and recovery after interrupted sessions.',
      scope:
        'Personal project with a public repository and signed release assets. Separate from the iOS production track.',
      evidence:
        'Public repository, Gradle module layout and published v0.2.0 / v0.1.0 APK assets. The repository\'s most recent CI run is known to have failed, so the project is not presented as unqualified green.',
      limitations:
        'The public source supports the existence of the project; it is not independent validation of every advertised capability. No adoption or user numbers are claimed.',
    },
  },
  {
    name: 'a0090-meta (hub-11 OS)',
    tags: ['Linux Kernel', 'RK3588', 'Device Tree', 'C'],
    description:
      'Linux OS distribution for an RK3588 NVR demo board, with a custom device-tree source and reproducible build steps.',
    status: 'Active project',
    scope: 'Personal / open-source project',
    liveUrl: null,
    repoUrl: 'https://github.com/coding-nyx/a0090-meta',
    linksUnavailableReason: 'No hosted demo deployment; source repository only.',
    caseStudy: {
      problem:
        'An unsupported RK3588 NVR demo board needed a bootable, maintainable Linux distribution rather than a vendor image that could not be reproduced.',
      approach:
        'Produced a board device-tree source, assembled a FIT boot image, integrated kernel drivers against mainline Linux 6.18, and documented the build, flash and verification steps so the result is reproducible.',
      scope:
        'Personal and open-source board enablement. Supporting systems evidence, not a substitute for mobile production depth.',
      evidence:
        'Public repository containing a substantial board DTS plus kernel, config, patch, FIT, rootfs and recovery layout, with documented build and flash verification steps. The README also documents an unresolved Wi-Fi/AP limitation.',
      limitations:
        '"Upstream-maintainable" means maintainable against upstream, not that anything was merged upstream. No board execution or kernel build was performed for this description.',
    },
  },
  {
    name: 'Hermes Companion Web',
    tags: ['TypeScript', 'Web', 'Hermes'],
    description:
      'TypeScript web companion for the same agent fleet: pair, chat, control the device and forward mobile notifications.',
    status: 'Active project',
    scope: 'Personal project',
    liveUrl: null,
    repoUrl: 'https://github.com/coding-nyx/hermes-companion-web',
    linksUnavailableReason: 'No public hosted demo deployment.',
  },
  {
    name: 'FitPro Connect',
    tags: ['React', 'Firebase', 'Stripe'],
    description:
      'Platform for fitness trainers to manage classes, showcase portfolios and connect with clients. In progress.',
    status: 'In progress',
    scope: 'Personal project',
    liveUrl: null,
    repoUrl: 'https://github.com/coding-nyx/personal-trainer',
    linksUnavailableReason:
      'The previously published demo URL returns HTTP 404, so no demo action is shown rather than linking to a dead page.',
  },
  {
    name: 'Nexus',
    tags: ['LLM', 'React Native', 'Firebase', 'RAG'],
    description:
      'Prototype multi-agent wellness platform. Private/prototype stage; no public source or verified demo is published.',
    status: 'Prototype',
    scope: 'Personal prototype',
    liveUrl: null,
    repoUrl: null,
    linksUnavailableReason:
      'The source repository is private and returns HTTP 404 to unauthenticated visitors, and the published demo URL renders an unverified shell. Neither is offered as a working destination, and no end-to-end encryption or outcome claims are made.',
  },
];

// Participation is retained; unsupported results and distinctions are not.
export const achievementsData = [
  {
    title: '10km Obstacle Race',
    event: 'Obstacle course race',
    description:
      'Completed a 10km obstacle course race. The finishing position is not published because no verifiable event result has been confirmed.',
  },
];

export const awardsData = [
  {
    name: 'Smart India Hackathon',
    issuer: 'Participant',
    date: 'Aug 2020',
    description:
      'Participated in the Smart India Hackathon as part of a team, working on a prototype under a continuous sprint. No placing or finalist distinction is claimed because none has been verified.',
  },
];

export const certificationsData = [
  {
    name: 'Programming for everybody (Getting started with python)',
    issuer: 'Coursera',
    date: 'Jul 2020',
    credentialUrl: 'https://www.coursera.org/account/accomplishments/verify/KYC47RL4MWRX',
  },
  {
    name: 'The Sustainable Development Goals – A global, transdisciplinary vision for the future',
    issuer: 'Coursera',
    date: 'Jul 2020',
    credentialUrl: 'https://www.coursera.org/account/accomplishments/verify/X3U4Y9FM3D2W',
  },
  {
    name: 'Step into Robotic process automation',
    issuer: 'GUVI Geek Networks, IITM Research Park',
    date: 'Jun 2020',
    credentialUrl: 'https://www.guvi.in/verify-certificate?id=L60K9a3H209160515l',
  },
  {
    name: 'Cybersecurity Essentials',
    issuer: 'Cisco',
    date: 'May 2020',
    credentialUrl: '',
  },
  {
    name: 'Entrepreneurship',
    issuer: 'Cisco',
    date: 'May 2020',
    credentialUrl: '',
  },
  {
    name: 'IT Academy: Network Virtualization Concepts',
    issuer: 'VMware',
    date: 'May 2020',
    credentialUrl: 'https://www.youracclaim.com/badges/bad87375-c32e-4daa-8dd1-c295373d0c91',
  },
  {
    name: 'IT Academy: Software Defined Storage Concepts',
    issuer: 'VMware',
    date: 'May 2020',
    credentialUrl: 'https://www.youracclaim.com/badges/25e83b93-d84d-4110-8718-ea597e5c88d5',
  },
  {
    name: 'Introduction to IoT',
    issuer: 'Cisco',
    date: 'May 2020',
    credentialUrl: '',
  },
  {
    name: 'Introduction to Packet Tracer',
    issuer: 'Cisco',
    date: 'May 2020',
    credentialUrl: '',
  },
  {
    name: 'Machine Learning for All',
    issuer: 'Coursera',
    date: 'May 2020',
    credentialUrl: 'https://www.coursera.org/account/accomplishments/verify/2F477P28WVLY',
  },
  {
    name: 'Predict Future Product Prices Using Facebook Prophet',
    issuer: 'Coursera',
    date: 'May 2020',
    credentialUrl: 'https://www.coursera.org/account/accomplishments/verify/TURLH426RU69',
  },
];

/**
 * Testimonials are intentionally an empty, non-rendering array.
 *
 * The previously shipped named quotations had no verified provenance or
 * publication permission. They were removed from the client-delivered data
 * rather than only from the UI, and must not be replaced with invented or
 * anonymous praise. Populate only from confirmed, permissioned quotes.
 */
export const testimonialsData = [];

export const interestsData = [
  'Obstacle Course Races',
  'Linux Customization',
  'System Architecture',
  'Retro Gaming',
];

// Site-level facts used by metadata and by the assistant, kept together so they
// cannot disagree between the page and the share preview.
export const SITE = {
  url: 'https://iamnyx.web.app',
  title: 'Raj Kumar S — iOS Engineer',
  description:
    'iOS engineer at Zoho since May 2022. Swift, SwiftUI and UIKit, reusable UI components, modular mobile architecture and application performance.',
};