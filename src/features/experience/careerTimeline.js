// Dates already supplied by portfolio.js determine the career bars; no invented tenure counts.
export const careerRange = (item) => {
  const [from, to] = item.dates.split(' - ');
  const end = to === 'Present' ? new Date() : new Date(to);
  const start = new Date(from);
  const min = new Date('Nov 2019'),
    max = new Date();
  return {
    left: `${(100 * (start - min)) / (max - min)}%`,
    width: `${Math.max(2, (100 * (end - start)) / (max - min))}%`,
  };
};
