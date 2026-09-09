// Live GitHub Context Service for Rook Agent

const GITHUB_ACCOUNTS = ['coding-nyx'];
const CACHE_KEY = 'rook_github_cache';
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

export async function fetchLiveGitHubContext() {
  try {
    const cached = typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function'
      ? localStorage.getItem(CACHE_KEY)
      : null;
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL) {
        return parsed.data;
      }
    }
  } catch {
    // Ignore storage errors
  }

  const token = import.meta.env?.VITE_GITHUB_TOKEN;
  const headers = {
    'Accept': 'application/vnd.github.v3+json'
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const repoList = [];

  for (const account of GITHUB_ACCOUNTS) {
    try {
      const res = await fetch(`https://api.github.com/users/${account}/repos?sort=updated&per_page=6`, { headers });
      if (res.ok) {
        const repos = await res.json();
        for (const r of repos) {
          if (!r.fork) {
            repoList.push({
              name: r.name,
              owner: account,
              description: r.description,
              stars: r.stargazers_count,
              language: r.language,
              updatedAt: r.updated_at,
              url: r.html_url
            });
          }
        }
      }
    } catch (err) {
      console.warn(`Could not fetch GitHub repos for ${account}:`, err);
    }
  }

  // Fallback if rate limited or offline
  const finalRepos = repoList.length > 0 ? repoList : [
    {
      name: "hermes-companion-app",
      owner: "coding-nyx",
      description: "Native Android companion for self-hosted Hermes Agent",
      language: "Kotlin",
      stars: 0,
      url: "https://github.com/coding-nyx/hermes-companion-app"
    },
    {
      name: "hermes-companion-web",
      owner: "coding-nyx",
      description: "Web companion for the Hermes agent — pair, chat, control the device, and forward mobile notifications.",
      language: "TypeScript",
      stars: 0,
      url: "https://github.com/coding-nyx/hermes-companion-web"
    },
    {
      name: "a0090-meta",
      owner: "coding-nyx",
      description: "Upstream-maintainable OS for hub-11 (AMedia RK3588 NVR Demo)",
      language: "C",
      stars: 0,
      url: "https://github.com/coding-nyx/a0090-meta"
    },
    {
      name: "portfolio",
      owner: "coding-nyx",
      description: "Portfolio dashboard",
      language: "JavaScript",
      stars: 0,
      url: "https://github.com/coding-nyx/portfolio"
    },
    {
      name: "personal-trainer",
      owner: "coding-nyx",
      description: "FitPro Connect — fitness trainer platform",
      language: "TypeScript",
      stars: 0,
      url: "https://github.com/coding-nyx/personal-trainer"
    },
    {
      name: "poker",
      owner: "coding-nyx",
      description: "Poker project",
      language: "TypeScript",
      stars: 0,
      url: "https://github.com/coding-nyx/poker"
    }
  ];

  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: finalRepos
      }));
    }
  } catch {
    // Ignore storage quota
  }

  return finalRepos;
}
