import React, { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, Feather, Image, Play } from "lucide-react";
import { Lightbox } from "./Lightbox";
import { Skeleton } from "./Skeleton";
import { RichHtml } from "./RichHtml";
import { stripHtmlTags } from "../helpers/stripHtmlTags";
import { getImagesGet } from "../endpoints/images/get_GET.schema";
import { getVideosGet } from "../endpoints/videos/get_GET.schema";
import { Memory } from "../helpers/memory";
import styles from "./MemoryCard.module.css";

interface MemoryCardProps {
  item: Memory;
  isEnglish?: boolean;
  className?: string;
}

const useImageData = (imageId?: number | null) => {
  return useQuery({
    queryKey: ['image', imageId],
    queryFn: async () => {
      if (!imageId) return null;
      const result = await getImagesGet({ id: imageId });
      if ('error' in result) {
        throw new Error(result.error);
      }
      return result.image;
    },
    enabled: !!imageId,
    placeholderData: (prev) => prev,
  });
};

const useVideoData = (videoId?: number | null) => {
  return useQuery({
    queryKey: ['video', videoId],
    queryFn: async () => {
      if (!videoId) return null;
      const result = await getVideosGet({ id: videoId });
      if ('error' in result) {
        throw new Error(result.error);
      }
      return result.video;
    },
    enabled: !!videoId,
    placeholderData: (prev) => prev,
  });
};

// Helper function to get truncated content for preview
const truncateContent = (content: string, maxLength: number = 120): string => {
  if (content.length <= maxLength) return content;
  
  // First try to split by sentences
  const sentences = content.split(/[.!?]+/);
  let truncated = '';
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;
    
    if ((truncated + trimmedSentence).length <= maxLength - 10) {
      truncated += (truncated ? '. ' : '') + trimmedSentence;
    } else {
      break;
    }
  }
  
  // If we couldn't get a good sentence break, just truncate at word boundary
  if (!truncated) {
    const words = content.split(' ');
    for (const word of words) {
      if ((truncated + word).length <= maxLength - 10) {
        truncated += (truncated ? ' ' : '') + word;
      } else {
        break;
      }
    }
  }
  
  return truncated;
};

export const MemoryCard: React.FC<MemoryCardProps> = ({ item, isEnglish = false, className }) => {
  const { data: imageData, isFetching: isImageLoading, error: imageError } = useImageData(item.imageId);
  const { data: videoData, isFetching: isVideoLoading, error: videoError } = useVideoData(item.videoId);

  const getPreviewContent = () => {
    if (item.type === 'image') {
      return imageData?.description || item.description || '';
    }
    
    // Use English content if available and isEnglish is true
    if (isEnglish && item.contentEn) {
      return stripHtmlTags(item.contentEn);
    }
    
    return item.content ? stripHtmlTags(item.content) : '';
  };

  const previewContent = getPreviewContent();
  const truncatedContent = truncateContent(previewContent);
  const isContentTruncated = truncatedContent.length < previewContent.length;

  const getIcon = () => {
    // Show video icon if there's video content
    if (item.videoId) {
      return <Play size={20} className={`${styles.cardIcon} ${styles.videoIcon}`} />;
    }
    
    switch (item.type) {
      case 'note':
        return <Heart size={20} className={styles.cardIcon} />;
      case 'quote':
        return <Feather size={20} className={styles.cardIcon} />;
      case 'image':
        return <Image size={20} className={styles.cardIcon} />;
      default:
        return <Heart size={20} className={styles.cardIcon} />;
    }
  };

  const renderLightboxContent = () => {
    switch (item.type) {
      case 'note':
        const displayTitle = isEnglish && item.titleEn ? item.titleEn : item.topic;
        const noteDisplayContent = isEnglish && item.contentEn ? item.contentEn : item.content;
        const displayAuthor = isEnglish && item.authorEn ? item.authorEn : item.author;
        
        return (
          <div className={styles.fullNote}>
            <h2 className={styles.lightboxTopic}>{displayTitle}</h2>
            <div className={styles.fullContent}>
              <RichHtml html={noteDisplayContent || ''} preserveFormatting />
            </div>
            {item.videoId && (
              <div className={styles.fullNoteVideo}>
                {isVideoLoading ? (
                  <div className={styles.lightboxVideoSkeleton}>
                    <Skeleton style={{ width: '400px', height: '300px', borderRadius: '8px', maxWidth: '100%' }} />
                  </div>
                ) : videoError ? (
                  <div className={styles.videoError}>
                    <p className={styles.errorText}>{isEnglish ? 'Error loading video' : 'שגיאה בטעינת הסרטון'}</p>
                  </div>
                ) : videoData ? (
                  <video 
                    src={videoData.videoUrl} 
                    className={styles.lightboxVideo}
                    controls
                    preload="metadata"
                  />
                ) : null}
              </div>
            )}
            {displayAuthor && (
              <footer className={styles.noteAuthor}>— {displayAuthor}</footer>
            )}
          </div>
        );
      case 'quote':
        const quoteDisplayContent = isEnglish && item.contentEn ? item.contentEn : item.content;
        
        return (
          <div className={styles.fullQuote}>
            <blockquote className={styles.fullQuoteText}>
              <span className={styles.openQuote}>"</span>
              <RichHtml html={quoteDisplayContent || ''} preserveFormatting />
              <span className={styles.closeQuote}>"</span>
            </blockquote>
            {item.source && (
              <footer className={styles.quoteSource}>{item.source}</footer>
            )}
          </div>
        );
      case 'image':
        return (
          <div className={styles.fullImage}>
            {isImageLoading ? (
              <div className={styles.lightboxImageSkeleton}>
                <Skeleton style={{ width: '400px', height: '300px', borderRadius: '8px', maxWidth: '100%' }} />
                <Skeleton style={{ width: '200px', height: '16px', marginTop: 'var(--spacing-4)' }} />
              </div>
                ) : imageError ? (
                  <div className={styles.imageError}>
                    <p className={styles.errorText}>{isEnglish ? 'Error loading image' : 'שגיאה בטעינת התמונה'}</p>
                  </div>
            ) : imageData ? (
              <>
                <img 
                  src={imageData.imageUrl} 
                  alt={imageData.description || item.description || (isEnglish ? 'Image' : 'תמונה')} 
                  className={styles.lightboxImage} 
                />
                {(imageData.description || item.description) && (
                  <p className={styles.fullImageDescription}>
                    {imageData.description || item.description}
                  </p>
                )}
              </>
            ) : null}
          </div>
        );

      default:
        return null;
    }
  };

  const isStoryAboutHim = item.type === 'note';
  
  // Get display title based on language
  const getDisplayTitle = () => {
    if (item.type === 'note') {
      return isEnglish && item.titleEn ? item.titleEn : item.topic;
    }
    if (item.type === 'quote') {
      return isEnglish ? 'Quote' : 'ציטוט';
    }
    return isEnglish ? 'Image' : 'תמונה';
  };
  
  const cardTitle = getDisplayTitle();
  const cardDescription = isStoryAboutHim 
    ? (isEnglish ? `Story about him: ${cardTitle}` : `סיפור עליו: ${cardTitle}`)
    : (isEnglish ? `Things he wrote: ${cardTitle}` : `דברים שהוא כתב: ${cardTitle}`);

  return (
    <Lightbox 
      trigger={
      <div 
        className={`${styles.memoryCard} ${isStoryAboutHim ? styles.storyAboutHim : styles.thingsHeWrote} ${isEnglish ? styles.englishCard : ''} ${className || ''}`}
        role="button"
        tabIndex={0}
        aria-label={cardDescription}
        data-type={item.type}
      >
          <div className={styles.cardHeader}>
            {getIcon()}
            {item.type === 'quote' && (
              <div className={styles.wordsBadge}>{isEnglish ? 'His words' : 'מילותיו'}</div>
            )}
            <h3 className={styles.cardTitle}>{cardTitle}</h3>
          </div>
          
          <div className={styles.cardContentContainer}>
            {truncatedContent && (
              <p className={styles.cardContent}>
                {truncatedContent}
              </p>
            )}
            {isContentTruncated && (
              <div className={styles.cardContentFade}>
                <span className={styles.cardContentEllipsis}>...</span>
              </div>
            )}
          </div>
          
          {(isEnglish && item.authorEn ? item.authorEn : item.author) && (
            <p className={styles.cardAuthor}>— {isEnglish && item.authorEn ? item.authorEn : item.author}</p>
          )}
        </div>
      }
    >
      <div className={`${styles.lightboxContent} ${isEnglish ? styles.englishContent : ''}`}>
        {renderLightboxContent()}
      </div>
    </Lightbox>
  );
};