import React from "react";
import { Flame } from "lucide-react";
import { Button } from "./Button";
import { RichHtml } from "./RichHtml";
import { Tribute } from "../endpoints/tributes/public_GET.schema";

import styles from "./TributeCard.module.css";

interface TributeCardProps {
  tribute: Tribute;
  onReadMore: () => void;
  className?: string;
}

const getMemorialCandleIcon = (): React.ReactNode => {
  return <Flame size={20} />;
};

export const TributeCard = ({ tribute, onReadMore, className }: TributeCardProps) => {
  const { authorName, relationship, content } = tribute;
  
  // Better HTML processing that preserves paragraph structure
  const createExcerpt = (htmlContent: string): string => {
    if (typeof window !== 'undefined') {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      
      // Replace block elements with line breaks
      const blockElements = tempDiv.querySelectorAll('div, p, br, h1, h2, h3, h4, h5, h6');
      blockElements.forEach(el => {
        if (el.tagName === 'BR') {
          el.replaceWith('\n');
        } else {
          el.replaceWith(el.textContent + '\n');
        }
      });
      
      const text = tempDiv.textContent || tempDiv.innerText || '';
      
      // Clean up multiple line breaks and normalize whitespace
      const cleanedText = text
        .replace(/\n\s*\n\s*/g, '\n\n') // Multiple line breaks to double
        .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive line breaks
        .trim();
      
      // Create excerpt with smart truncation
      if (cleanedText.length <= 280) {
        return cleanedText;
      }
      
      // Try to cut at paragraph break near the limit
      const paragraphs = cleanedText.split('\n\n');
      let excerpt = '';
      
      for (const paragraph of paragraphs) {
        if (excerpt.length + paragraph.length + 2 <= 280) {
          excerpt += (excerpt ? '\n\n' : '') + paragraph;
        } else {
          // If adding this paragraph would exceed limit, truncate within it
          const remainingChars = 280 - excerpt.length - (excerpt ? 2 : 0);
          if (remainingChars > 50) { // Only add if there's meaningful space
            const truncatedParagraph = paragraph.substring(0, remainingChars - 3).trim();
            excerpt += (excerpt ? '\n\n' : '') + truncatedParagraph + '...';
          } else if (!excerpt) {
            // If no previous content, truncate the first paragraph
            excerpt = paragraph.substring(0, 277).trim() + '...';
          } else {
            excerpt += '...';
          }
          break;
        }
      }
      
      return excerpt || cleanedText.substring(0, 277) + '...';
    }
    
    // Server-side fallback
    const plainText = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return plainText.length > 280 ? plainText.substring(0, 277) + '...' : plainText;
  };

  const excerpt = createExcerpt(content);

  return (
    <div className={`${styles.card} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.authorInfo}>
          <div className={styles.iconWrapper}>
            {getMemorialCandleIcon()}
          </div>
          <div className={styles.authorDetails}>
            <h3 className={styles.authorName}>{authorName}</h3>
            <p className={styles.relationship}>{relationship}</p>
          </div>
        </div>
      </div>
      <p className={styles.excerpt}>{excerpt}</p>
      <div className={styles.footer}>
        <Button
          variant="secondary"
          onClick={onReadMore}
          className={styles.readMoreButton}
        >
          קרא הספד מלא
        </Button>
      </div>
    </div>
  );
};