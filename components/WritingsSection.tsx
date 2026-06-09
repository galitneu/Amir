import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./Button";
import { Skeleton } from "./Skeleton";
import { RichHtml } from "./RichHtml";
import { Lightbox } from "./Lightbox";
import { convertTextToHtml } from "../helpers/convertTextToHtml";
import styles from "./WritingsSection.module.css";

interface Writing {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
}

interface WritingsSectionProps {
  writings: Writing[];
  isLoading: boolean;
  error: string | null;
  hideViewAllButton?: boolean;
}

export const WritingsSection: React.FC<WritingsSectionProps> = ({ writings, isLoading, error, hideViewAllButton = false }) => {
  // Smart truncation that respects paragraph boundaries
  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    
    // First try to split by double line breaks (proper paragraphs)
    let paragraphs = content.split(/\n\s*\n/);
    let separator = '\n\n';
    
    // If we don't get multiple paragraphs, try single line breaks
    if (paragraphs.length === 1) {
      paragraphs = content.split(/\n/);
      separator = '\n';
    }
    
    let truncated = '';
    
    for (const paragraph of paragraphs) {
      const trimmedParagraph = paragraph.trim();
      if (!trimmedParagraph) continue; // Skip empty paragraphs
      
      if ((truncated + trimmedParagraph).length <= maxLength) {
        truncated += (truncated ? separator : '') + trimmedParagraph;
      } else {
        // If we can't fit the whole paragraph, truncate within it
        const remaining = maxLength - truncated.length;
        if (remaining > 50) { // Only add if we have reasonable space
          const sentences = trimmedParagraph.split(/[.!?]+/);
          let paragraphTruncated = '';
          
          for (const sentence of sentences) {
            const trimmedSentence = sentence.trim();
            if (!trimmedSentence) continue;
            
            if ((paragraphTruncated + trimmedSentence).length <= remaining - 10) {
              paragraphTruncated += (paragraphTruncated ? '. ' : '') + trimmedSentence;
            } else {
              break;
            }
          }
          
          if (paragraphTruncated) {
            truncated += (truncated ? separator : '') + paragraphTruncated;
          }
        }
        break;
      }
    }
    
    return truncated;
  };

  return (
    <section className={styles.writingsSection}>
      <h2 className={styles.sectionTitle}>דברים שאמיר כתב</h2>
      <p className={styles.writingsDescription}>
        מילים, מחשבות וכתבים שאמיר שיתף במהלך חייו
      </p>
      
      {isLoading ? (
        <div className={styles.writingsLoading}>
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className={styles.writingCardSkeleton}>
              <Skeleton style={{ width: "100%", height: "1.5rem", marginBottom: "var(--spacing-3)" }} />
              <Skeleton style={{ width: "100%", height: "1rem", marginBottom: "var(--spacing-2)" }} />
              <Skeleton style={{ width: "90%", height: "1rem", marginBottom: "var(--spacing-2)" }} />
              <Skeleton style={{ width: "80%", height: "1rem" }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className={styles.writingsError}>
          שגיאה בטעינת הכתבים: {error}
        </div>
      ) : writings.length > 0 ? (
        <div className={styles.writingsGrid}>
          {writings.slice(0, 4).map((writing) => {
            const previewContent = truncateContent(writing.content);
            const isContentTruncated = previewContent.length < writing.content.length;
            const previewHtml = convertTextToHtml(previewContent);
            
            return (
              <Lightbox
                key={writing.id}
                trigger={
                  <div className={styles.writingCard}>
                    <div className={styles.writingHeader}>
                      <h3 className={styles.writingTitle}>{writing.title}</h3>
                    </div>
                    <div className={styles.writingContentContainer}>
                      <RichHtml 
                        html={previewHtml} 
                        preserveFormatting 
                        className={styles.writingContent}
                      />
                      {isContentTruncated && (
                        <div className={styles.writingContentFade}>
                          <span className={styles.writingContentEllipsis}>...</span>
                        </div>
                      )}
                    </div>
                    {writing.imageUrl && (
                      <div className={styles.writingImage}>
                        <img 
                          src={writing.imageUrl} 
                          alt={writing.title} 
                          className={styles.writingImagePreview}
                        />
                      </div>
                    )}
                  </div>
                }
              >
                <div className={styles.writingLightboxContent}>
                  <h2 className={styles.writingLightboxTitle}>{writing.title}</h2>
                  <div className={styles.writingLightboxText}>
                    <RichHtml html={convertTextToHtml(writing.content)} preserveFormatting />
                  </div>
                  {writing.imageUrl && (
                    <div className={styles.writingLightboxImage}>
                      <img 
                        src={writing.imageUrl} 
                        alt={writing.title} 
                        className={styles.writingLightboxImageFull}
                      />
                    </div>
                  )}
                </div>
              </Lightbox>
            );
          })}
        </div>
      ) : (
        <div className={styles.noWritingsMessage}>
          עדיין לא נוספו כתבים של אמיר
        </div>
      )}
      
      {!hideViewAllButton && (
        <div className={styles.actionButton}>
          <Button asChild variant="outline">
            <Link to="/stories#writings">צפה בכל הדברים שאמיר כתב</Link>
          </Button>
        </div>
      )}
    </section>
  );
};