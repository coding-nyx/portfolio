import { skillsData, projects } from '../../data/portfolio.js';

export const SKILL_GROUPS = [
  { name: 'Mobile', skills: skillsData.filter((s) => s.category === 'Mobile'), className: 'daily' },
  {
    name: 'App & web',
    skills: skillsData.filter((s) => ['Language', 'Frontend', 'Backend'].includes(s.category)),
    className: 'comfortable',
  },
  {
    name: 'Systems & tooling',
    skills: skillsData.filter((s) => ['AI', 'OS'].includes(s.category)),
    className: 'systems',
  },
];
// Use the confirmed category data rather than inventing daily/learning claims.
export function usedIn(skill) {
  if (/Swift|UIKit|SPM/.test(skill.name))
    return [{ label: 'Zoho · native component work', href: '#experience' }];
  if (/Kotlin|Android/.test(skill.name)) return [{ label: 'Hermes Companion', href: '#projects' }];
  if (/Linux/.test(skill.name)) return [{ label: 'a0090-meta (hub-11 OS)', href: '#projects' }];
  if (/MCP/.test(skill.name))
    return [
      { label: 'Zoho · component integration tooling', href: '#experience' },
      { label: 'WorkTracker', href: '#projects' },
    ];
  if (/Catalyst/.test(skill.name))
    return [{ label: 'MCP hosting, internal docs and issue tracking', href: '#skills' }];
  return projects
    .filter((p) =>
      p.tags.some(
        (t) =>
          skill.name.toLowerCase().includes(t.toLowerCase()) ||
          t.toLowerCase().includes(skill.name.split(' / ')[0].toLowerCase()),
      ),
    )
    .map((p) => ({ label: p.name, href: '#projects' }));
}
