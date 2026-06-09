import React from 'react';
import styles from './MarkdownProcessor.module.css';

interface MarkdownProcessorProps {
  /** The markdown-like string to process. */
  content: string;
}

/**
 * A simple markdown processor that converts specific image syntax and line breaks into HTML.
 * It handles:
 * - Images in the format `![alt text](/_api/images/view?id=X)`
 * - Newlines are converted to `<br />` tags.
 */
export const MarkdownProcessor: React.FC<MarkdownProcessorProps> = ({ content }) => {
  if (!content) {
    return null;
  }

  // Regex to find image tags: ![alt text](/_api/images/view?id=ID)
  const imageRegex = /!\[(.*?)\]\(\/_api\/images\/view\?id=(\d+)\)/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = imageRegex.exec(content)) !== null) {
    // Push the text part before the image
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index));
    }

    // Push the image part as an object
    parts.push({
      type: 'image',
      alt: match[1],
      id: match[2],
    });

    lastIndex = imageRegex.lastIndex;
  }

  // Push the remaining text part after the last image
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return (
    <div className={styles.container}>
      {parts.map((part, index) => {
        if (typeof part === 'string') {
          // Process text for line breaks
          return (
            <span key={index}>
              {part.split('\n').map((line, lineIndex, arr) => (
                <React.Fragment key={lineIndex}>
                  {line}
                  {lineIndex < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </span>
          );
        } else if (part.type === 'image') {
          // Render image
          return (
            <img
              key={index}
              src={`/_api/images/view?id=${part.id}`}
              alt={part.alt}
              className={styles.image}
              loading="lazy"
            />
          );
        }
        return null;
      })}
    </div>
  );
};