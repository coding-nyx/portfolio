// Public-wording pass. Source data in portfolio.js stays untouched (see backup);
// only the rendered text is cleaned per scope AC-6.
const RULES = [
  [/\s*\(May 2022[–-]Present,\s*~?\d+\s*yrs?(\s*\d+\s*mos?)?\)/gi, ' since May 2022'],
  [/\s*~?\d+\+?\s*(yrs?|years?)(\s*\d+\s*mos?)?/gi, ''],
  [/,? ship reusable component libraries used across Zoho mobile surfaces,/gi, ', build reusable Swift component libraries,'],
  [/ that keep look-and-feel consistent across Zoho mobile apps/gi, ' that keep look-and-feel consistent'],
  [/\s*—\s*without publishing proprietary package names\./gi, '.'],
  [/\bfirst\b/gi, 'early'],
  [/[^.]*\bopen to (roles|high-impact|new)[^.!]*[.!]\s*/gi, ''],
];
export const publicText = (s) => (typeof s === 'string' ? RULES.reduce((t, [re, rep]) => t.replace(re, rep), s).trim() : s);
