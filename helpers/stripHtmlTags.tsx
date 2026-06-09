/**
 * Strips HTML tags from a string and returns plain text
 * @param html - The HTML string to strip tags from
 * @returns Plain text without HTML tags
 */
export const stripHtmlTags = (html: string): string => {
  // Create a temporary div element to parse HTML
  if (typeof window !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }
  
  // Server-side fallback - simple regex to remove HTML tags
  return html.replace(/<[^>]*>/g, '');
};