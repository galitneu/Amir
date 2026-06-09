import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import { Skeleton } from "./Skeleton";
import { Lightbox } from "./Lightbox";
import { ImagePreview } from "../helpers/imageTypes";
import { LazyImage } from "./LazyImage";
import styles from "./RandomPhotosSection.module.css";

interface Photo {
  id: number;
  name: string;
  description: string | null;
  imageUrl?: string; // Optional for lazy loading
}

interface RandomPhotosSectionProps {
  photos: ImagePreview[];
  isLoading: boolean;
  error: string | null;
  isEnglish?: boolean;
}

const LoadingRandomPhotos = () => (
  <div className={styles.randomPhotosSection}>
    <div className={styles.photoGalleryContainer}>
      <Skeleton 
        style={{ 
          width: "100%", 
          height: "400px", 
          borderRadius: "var(--radius)" 
        }} 
      />
    </div>
  </div>
);

const ErrorRandomPhotos = ({ error }: { error: string }) => (
  <div className={styles.randomPhotosSection}>
    <div className={styles.errorMessage}>
      שגיאה בטעינת התמונות: {error}
    </div>
  </div>
);



export const RandomPhotosSection: React.FC<RandomPhotosSectionProps> = ({ photos, isLoading, error, isEnglish = false }) => {
  const { t } = useTranslation();
  const [optimalPhotoCount, setOptimalPhotoCount] = useState(12);
  const [containerWidth, setContainerWidth] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [lightboxImageId, setLightboxImageId] = useState<number | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Dynamic link path based on language
  const photosPath = isEnglish ? "/en/photos" : "/photos";

  // Function to calculate optimal photo count
  const calculateOptimalPhotoCount = useCallback((width: number) => {
    if (width <= 480) {
      return 8;  // Small screens - 2 columns x 4 rows
    } else if (width <= 768) {
      return 12; // Tablet - 2 columns x 6 rows
    } else if (width <= 1024) {
      return 16; // Medium screens - 3 columns x 5-6 rows
    } else if (width <= 1200) {
      return 20; // Large screens - 4 columns x 5 rows
    } else {
      return 25; // Extra large screens - 5 columns x 5 rows
    }
  }, []);

  // Monitor container size changes
  useEffect(() => {
    const container = galleryRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setContainerWidth(width);
        const newOptimalCount = calculateOptimalPhotoCount(width);
        setOptimalPhotoCount(newOptimalCount);
      }
    });

    resizeObserver.observe(container);

    // Initial calculation
    const initialWidth = container.offsetWidth;
    setContainerWidth(initialWidth);
    setOptimalPhotoCount(calculateOptimalPhotoCount(initialWidth));

    return () => {
      resizeObserver.disconnect();
    };
  }, [calculateOptimalPhotoCount]);

  // Convert ImagePreview to Photo format
  const convertedPhotos: Photo[] = React.useMemo(() => {
    return photos.map(preview => ({
      id: preview.id,
      name: preview.name,
      description: preview.description,
    }));
  }, [photos]);

  // Extract random photos with dynamic count
  const randomPhotos = React.useMemo(() => {
    if (!convertedPhotos || convertedPhotos.length === 0) {
      return [];
    }
    // Return random photos based on dynamic calculation
    const shuffled = [...convertedPhotos].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, optimalPhotoCount);
  }, [convertedPhotos, optimalPhotoCount]);

  const handleImageLoad = useCallback(() => {
    setImagesLoaded(prev => prev + 1);
  }, []);

  if (isLoading) {
    return <LoadingRandomPhotos />;
  }

  if (error) {
    return <ErrorRandomPhotos error={error} />;
  }

  if (randomPhotos.length === 0) {
    return (
      <div className={styles.randomPhotosSection}>
        <div className={styles.noPhotosMessage}>
          עדיין לא הועלו תמונות לגלריה
        </div>
        <div className={styles.actionButton}>
          <Button asChild variant="outline">
            <Link to={photosPath}>{t('photos.loadMore')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.randomPhotosSection} ref={galleryRef}>
      <h2 className={styles.sectionTitle}>{t('photos.sectionTitle')}</h2>
      <div className={styles.masonryGrid} data-photo-count={optimalPhotoCount}>
        {randomPhotos.map((photo) => {
          const preview = photos.find(p => p.id === photo.id);
          if (!preview) return null;
          
          return (
            <div key={photo.id} className={styles.masonryItem}>
              <Lightbox
                trigger={
                  <div 
                    className={styles.photoContainer}
                    onClick={() => setLightboxImageId(photo.id)}
                  >
                    <LazyImage
                      imageId={photo.id}
                      alt={photo.name || "תמונה לזכרו של אמיר"}
                      className={styles.masonryPhoto}
                      onImageLoad={handleImageLoad}
                      enabled={true}
                    />
                  </div>
                }
              >
                <div className={styles.lightboxContent}>
                  <LazyImage
                    imageId={photo.id}
                    alt={photo.name || "תמונה לזכרו של אמיר"}
                    className={styles.lightboxImage}
                    enabled={lightboxImageId === photo.id}
                  />
                  {photo.description && (
                    <p className={styles.lightboxCaption}>{photo.description}</p>
                  )}
                </div>
              </Lightbox>
            </div>
          );
        })}
      </div>
      <div className={styles.actionButton}>
        <Button asChild className={styles.viewAllPhotosButton}>
          <Link to={photosPath}>{t('photos.loadMore')}</Link>
        </Button>
      </div>
    </div>
  );
};