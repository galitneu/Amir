import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import styles from './RichHtml.module.css';

export interface RichHtmlProps {
  /**
   * The HTML string to be sanitized and rendered.
   */
  html: string;
  /**
   * Optional additional class names for the container element.
   */
  className?: string;
  /**
   * Whether to preserve formatting (line breaks, tabs, spaces).
   * Useful for tribute and memory content.
   */
  preserveFormatting?: boolean;
}

/**
 * A component to safely render rich HTML content.
 * It uses DOMPurify to sanitize the HTML string against XSS attacks
 * before rendering it with dangerouslySetInnerHTML.
 */
export const RichHtml: React.FC<RichHtmlProps> = ({ html, className, preserveFormatting = false }) => {
  const sanitizedHtml = useMemo(() => {
    // DOMPurify requires a DOM, so it only runs on the client.
    if (typeof window !== 'undefined') {
      return DOMPurify.sanitize(html);
    }
    // Return an empty string during server-side rendering or if window is not available.
    // The content will be rendered on the client after hydration.
    return '';
  }, [html]);

  // Avoid rendering an empty div if there's no content.
  if (!sanitizedHtml) {
    return null;
  }

  const containerClasses = [
    styles.richHtmlContainer,
    preserveFormatting && styles.preserveFormatting,
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={containerClasses}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};