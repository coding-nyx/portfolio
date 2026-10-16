// Source for the navigation labels and section numbers.
export const CHAPTERS = [
  ['entry', 'Entry'],
  ['bio', 'Bio'],
  ['experience', 'Experience'],
  ['projects', 'Projects'],
  ['skills', 'Skills'],
  ['achievements', 'Achievements'],
  ['resume', 'Resume'],
  ['personal', 'Off the clock'],
  ['contact', 'Contact'],
];
export const chapterNum = (i) => String(i + 1).padStart(2, '0');
