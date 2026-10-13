// ONE source for chapter numbers: nav labels AND section headings read from here.
export const CHAPTERS = [
  ['entry', 'Entry'],
  ['bio', 'Bio'],
  ['experience', 'Experience'],
  ['projects', 'Projects'],
  ['skills', 'Skills'],
  ['achievements', 'Achievements'],
  ['resume', 'Resume'],
  ['contact', 'Contact'],
];
export const chapterNum = (i) => String(i + 1).padStart(2, '0');
export const chapterLabel = (id) => {
  const i = CHAPTERS.findIndex(([c]) => c === id);
  return i < 0 ? '' : `Chapter ${chapterNum(i)} · ${CHAPTERS[i][1]}`;
};
