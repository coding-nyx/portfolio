/**
 * Tenure is derived from structured employment dates, never hardcoded strings.
 *
 * The published Zoho full-time start date is May 2022. Trainee/intern periods are
 * intentionally excluded so full-time tenure is never inflated by them.
 *
 * `now` is injectable so the calculation is deterministic under test.
 */

export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const parseYearMonth = (value) => {
  const match = /^(\d{4})-(\d{2})$/.exec(String(value).trim());
  if (!match) {
    throw new TypeError(`Expected YYYY-MM, received: ${value}`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);

  // Guard the calendar range too: the regex alone would accept 2022-13.
  if (month < 1 || month > 12) {
    throw new TypeError(`Expected YYYY-MM with month 01-12, received: ${value}`);
  }

  return { year, month };
};

export const formatStartDate = (startDate) => {
  const { year, month } = parseYearMonth(startDate);
  return `${MONTH_NAMES[month - 1]} ${year}`;
};

/**
 * @param {string} startDate  Full-time start as YYYY-MM.
 * @param {Date}   [now]      Injectable clock for deterministic tests.
 * @returns {{ years: number, months: number, totalMonths: number, label: string }}
 */
export const calculateTenure = (startDate, now = new Date()) => {
  const start = parseYearMonth(startDate);
  const endYear = now.getFullYear();
  const endMonth = now.getMonth() + 1;

  const totalMonths = (endYear - start.year) * 12 + (endMonth - start.month);
  if (totalMonths < 0) {
    throw new RangeError(`Start date ${startDate} is in the future`);
  }

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const parts = [];
  if (years > 0) parts.push(`${years} yr${years === 1 ? '' : 's'}`);
  if (months > 0) parts.push(`${months} mo${months === 1 ? '' : 's'}`);

  return {
    years,
    months,
    totalMonths,
    label: parts.length > 0 ? parts.join(' ') : 'Less than one month',
  };
};

/**
 * Stable, date-based tenure wording, derived rather than hardcoded.
 *
 * Replaces the scattered "2+ years" / "3+ years" / "3 yrs 8 mos" strings that
 * contradicted each other across the hero, résumé copy, terminal and assistant
 * data. Recomputing from a single start date keeps every surface in agreement.
 */
export const formatTenure = (startDate, now = new Date()) => {
  const { label } = calculateTenure(startDate, now);
  return `${label} of full-time experience, since ${formatStartDate(startDate)}`;
};