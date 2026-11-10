/** Certifications at or before this year belong in the Older accordion. */
export const OLDER_CERT_YEAR = 2020;

/**
 * Reads a four-digit year from a certification `date` string such as 'Nov 2026'.
 * Returns null when no year can be parsed; never throws.
 */
export function certificationYear(date) {
  if (date == null) return null;
  const text = String(date);
  const matches = text.match(/\b(?:19|20)\d{2}\b/g);
  if (!matches) return null;
  return Number(matches[matches.length - 1]);
}

/**
 * Partitions certifications into Current and Older while preserving input order.
 * A cert is Older when its parsed year is <= olderCutoffYear (default 2020).
 * Unparseable or missing dates are treated as Current.
 */
export function splitCertifications(certifications, olderCutoffYear = OLDER_CERT_YEAR) {
  const current = [];
  const older = [];
  if (!Array.isArray(certifications)) return { current, older };

  for (const cert of certifications) {
    const year = certificationYear(cert?.date);
    if (year != null && year <= olderCutoffYear) older.push(cert);
    else current.push(cert);
  }

  return { current, older };
}
