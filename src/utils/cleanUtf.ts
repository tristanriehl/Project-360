/**
 * Utility to decode and sanitize UTF escape sequences (e.g. \u00e9, \u2019, \u0027, \u00a0, \\u00e9),
 * HTML entities (e.g. &eacute;, &#39;, &nbsp;), and common UTF-8/Windows-1252 Mojibake artifacts (e.g. Ã©, â€™).
 */

export function cleanUtfString(str: string): string {
  if (!str || typeof str !== 'string') return '';

  let cleaned = str;

  // Perform up to 2 passes in case of double-escaped strings like \\u00e9
  for (let pass = 0; pass < 2; pass++) {
    const prev = cleaned;

    // 1. Unescape double-escaped backslashes before unicode, e.g. \\u00e9 -> \u00e9
    cleaned = cleaned.replace(/\\\\u([0-9a-fA-F]{4})/g, '\\u$1');

    // 2. Decode literal \uXXXX unicode escape sequences
    cleaned = cleaned.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
      try {
        const code = parseInt(hex, 16);
        if (!isNaN(code)) {
          return String.fromCharCode(code);
        }
      } catch {}
      return _;
    });

    // 3. Decode literal \xXX hex escape sequences
    cleaned = cleaned.replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => {
      try {
        const code = parseInt(hex, 16);
        if (!isNaN(code)) {
          return String.fromCharCode(code);
        }
      } catch {}
      return _;
    });

    if (cleaned === prev) break;
  }

  // 4. Common UTF-8 / Windows-1252 Mojibake fixes
  const mojibakeMap: [RegExp, string][] = [
    [/Ã©/g, 'é'],
    [/Ã¨/g, 'è'],
    [/Ã /g, 'à'],
    [/Ã¢/g, 'â'],
    [/Ãª/g, 'ê'],
    [/Ã§/g, 'ç'],
    [/Ã®/g, 'î'],
    [/Ã´/g, 'ô'],
    [/Ã»/g, 'û'],
    [/Ã¹/g, 'ù'],
    [/Ã«/g, 'ë'],
    [/Ã¯/g, 'ï'],
    [/Ã‰/g, 'É'],
    [/ÃÈ/g, 'È'],
    [/Ã€/g, 'À'],
    [/Ã‚/g, 'Â'],
    [/ÃŠ/g, 'Ê'],
    [/ÃÇ/g, 'Ç'],
    [/ÃŽ/g, 'Î'],
    [/Ã”/g, 'Ô'],
    [/Ã›/g, 'Û'],
    [/â€™/g, "'"],
    [/â€˜/g, "'"],
    [/â€œ/g, '"'],
    [/â€\u009d/g, '"'],
    [/â€/g, '"'],
    [/â€“/g, '–'],
    [/â€”/g, '—'],
    [/â€¦/g, '...'],
    [/Â /g, ' '],
    [/Â/g, ''],
  ];

  for (const [pattern, replacement] of mojibakeMap) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  // 5. Decode common HTML entities
  cleaned = cleaned
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&eacute;/gi, 'é')
    .replace(/&egrave;/gi, 'è')
    .replace(/&agrave;/gi, 'à')
    .replace(/&ecirc;/gi, 'ê')
    .replace(/&ccedil;/gi, 'ç')
    .replace(/&icirc;/gi, 'î')
    .replace(/&ocirc;/gi, 'ô')
    .replace(/&ucirc;/gi, 'û')
    .replace(/&Eacute;/gi, 'É')
    .replace(/&Egrave;/gi, 'È')
    .replace(/&Agrave;/gi, 'À');

  // 6. Normalize non-breaking spaces and non-printable control characters (keep newlines & tabs)
  cleaned = cleaned
    .replace(/\u00a0/g, ' ')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return cleaned;
}

/**
 * Deeply sanitizes objects or arrays by running cleanUtfString on all string properties.
 */
export function sanitizeObjectUtf<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return cleanUtfString(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObjectUtf(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = sanitizeObjectUtf(value);
    }
    return result as T;
  }

  return obj;
}
