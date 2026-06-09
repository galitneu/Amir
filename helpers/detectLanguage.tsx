/**
 * A simple language detection utility to differentiate between Hebrew and English.
 */

// The Unicode range for Hebrew characters is U+0590 to U+05FF.
const HEBREW_CHARS_REGEX = /[\u0590-\u05FF]/;

/**
 * Detects if a given text contains Hebrew characters. This is used to determine
 * text direction (RTL for Hebrew, LTR for English).
 *
 * @param text The text to analyze. Can be a string, null, or undefined.
 * @returns 'he' if Hebrew characters are found, otherwise 'en'.
 */
export const detectLanguage = (text: string | null | undefined): 'he' | 'en' => {
  if (!text) {
    // Default to English (LTR) if the text is null, undefined, or empty.
    return 'en';
  }

  if (HEBREW_CHARS_REGEX.test(text)) {
    return 'he';
  }

  return 'en';
};