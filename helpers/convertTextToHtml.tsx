/**
 * Converts plain text with line breaks to proper HTML format.
 * Handles both plain text and existing HTML content.
 */
export function convertTextToHtml(content: string): string {
  if (!content) return '';
  
  // Trim the content
  const trimmedContent = content.trim();
  
  // Simple check to see if content is already HTML
  // Look for common HTML tags
  const htmlTagRegex = /<\/?[a-z][\s\S]*>/i;
  const isHtml = htmlTagRegex.test(trimmedContent);
  
  if (isHtml) {
    // Content is already HTML, return as is
    return trimmedContent;
  }
  
  // Content is plain text, convert line breaks to HTML paragraphs
  return trimmedContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0) // Remove empty lines
    .map(line => `<p>${line}</p>`)
    .join('');
}