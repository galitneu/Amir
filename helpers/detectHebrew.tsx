/**
 * Checks if a given string contains any Hebrew characters.
 *
 * @param text The string to check.
 * @returns `true` if the string contains Hebrew characters, `false` otherwise.
 */
export function detectHebrew(text: string | null | undefined): boolean {
  if (!text) {
    return false;
  }
  // This regex matches the Hebrew Unicode block.
  const hebrewRegex = /[\u0590-\u05FF]/;
  return hebrewRegex.test(text);
}