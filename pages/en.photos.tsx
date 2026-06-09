"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Button } from '../components/Button';
import * as Dialog from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { getImagesList } from '../endpoints/images/list_GET.schema';
import { ImagePreview } from '../helpers/imageTypes';
import { Skeleton } from '../components/Skeleton';
import { GuestbookForm } from '../components/GuestbookForm';
import { LazyImage } from '../components/LazyImage';
import Masonry from "masonry-layout";
import styles from "./en.photos.module.css";

type Photo = {
  id: string;
  imageId: number;
  alt: string;
  caption: string;
  preview: ImagePreview;
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const PhotoCard: React.FC<{ 
  photo: Photo; 
  onImageLoad: () => void;
  onPhotoClick: (photo: Photo) => void;
  className: string;
}> = ({ photo, onImageLoad, onPhotoClick, className }) => {
  const handleClick = () => {
    onPhotoClick(photo);
  };

  return (
    <div className={className}>
      <button
        className={styles.photoButton}
        onClick={handleClick}
        title={photo.caption || undefined}
      >
        <LazyImage
          imageId={photo.imageId}
          alt={photo.alt}
          className={styles.photoImg}
          onImageLoad={onImageLoad}
        />
        {photo.caption && (
          <div className={styles.photoOverlay}>
            <p>{photo.caption}</p>
          </div>
        )}
      </button>
    </div>
  );
};

export default function EnglishPhotosPage() {
  const { t } = useTranslation();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photosToShow, setPhotosToShow] = useState(12);
  const gridRef = useRef<HTMLDivElement>(null);
  const masonryRef = useRef<Masonry | null>(null);

  const { data, isFetching, error } = useQuery({
    queryKey: ["images", "list"],
    queryFn: getImagesList,
    placeholderData: (prev) => prev
  });

  const photos: Photo[] = useMemo(() => {
    if (!data || "error" in data) return [];
    const mappedPhotos = data.images.map((image) => ({
      id: image.id.toString(),
      imageId: image.id,
      alt: image.description || `Photo ${image.id}`,
      caption: image.description || "",
      preview: image,
    }));
    return shuffleArray(mappedPhotos);
  }, [data]);

  const displayedPhotos = photos.slice(0, photosToShow);
  const hasMorePhotos = photos.length > photosToShow;

  useEffect(() => {
    if (gridRef.current && displayedPhotos.length > 0) {
      const currentMasonry = masonryRef.current;
      if (currentMasonry && typeof currentMasonry.destroy === 'function') {
        currentMasonry.destroy();
      }
      masonryRef.current = new Masonry(gridRef.current, {
        itemSelector: `.${styles.photoCard}`,
        columnWidth: `.${styles.photoCard}`,
        gutter: 16,
        percentPosition: true,
        transitionDuration: '0.3s'
      });
    }
    return () => {
      const currentMasonry = masonryRef.current;
      if (currentMasonry && typeof currentMasonry.destroy === 'function') {
        currentMasonry.destroy();
      }
    };
  }, [displayedPhotos.length]);

  useEffect(() => {
    const currentMasonry = masonryRef.current;
    if (currentMasonry && typeof currentMasonry.layout === 'function') {
      setTimeout(() => {
        if (masonryRef.current && typeof masonryRef.current.layout === 'function') {
          masonryRef.current.layout();
        }
      }, 100);
    }
  }, [photosToShow]);

  const handleImageLoad = () => {
    if (masonryRef.current && typeof masonryRef.current.layout === 'function') {
      masonryRef.current.layout();
    }
  };

  const handleShowMore = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    // Store current scroll position
    const currentScrollY = window.scrollY;
    
    setPhotosToShow((prev) => prev + 12);
    
    // Maintain scroll position after layout updates
    const maintainScrollPosition = () => {
      // Small delay to ensure new photos are rendered
      setTimeout(() => {
        const currentMasonry = masonryRef.current;
        if (currentMasonry && typeof currentMasonry.layout === 'function') {
          currentMasonry.layout();
          
          // Restore scroll position after masonry layout
          setTimeout(() => {
            window.scrollTo({
              top: currentScrollY,
              behavior: 'instant'
            });
          }, 50);
        }
      }, 150);
    };
    
    maintainScrollPosition();
  };

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  const renderGalleryContent = () => {
    if (isFetching && !data) {
      return (
        <div className={styles.gridContainer}>
          {Array.from({ length: 12 }).map((_, index) =>
          <div key={index} className={styles.photoCard}>
              <Skeleton className={styles.photoSkeleton} />
            </div>
          )}
        </div>);

    }

    if (error) {
      return (
        <div className={styles.errorMessage}>
          <p>{t("photos.error")}</p>
        </div>);

    }

    if (photos.length === 0) {
      return (
        <div className={styles.emptyMessage}>
          <p>{t("photos.empty")}</p>
        </div>);

    }

    return (
      <div className={styles.galleryContainer}>
        <div ref={gridRef} className={styles.gridContainer}>
          {displayedPhotos.map((photo) =>
          <PhotoCard
              key={photo.id}
              photo={photo}
              onImageLoad={handleImageLoad}
              onPhotoClick={handlePhotoClick}
              className={styles.photoCard}
            />
          )}
        </div>
        {hasMorePhotos &&
        <div className={styles.loadMoreContainer}>
            <Button type="button" variant="secondary" size="lg" onClick={handleShowMore}>
              {t("photos.loadMore")}
            </Button>
          </div>
        }
      </div>);

  };

  return (
    <div className={styles.page}>
      <Helmet>
        <title>{t("photos.pageTitle")}</title>
        <meta name="description" content={t("photos.pageDescription")} />
        <html lang="en" dir="ltr" />
      </Helmet>

      <main className={styles.main}>
        <h1 className={styles.title}>{t("photos.mainTitle")}</h1>
        <p className={styles.subtitle}>{t("photos.subtitle")}</p>
        {renderGalleryContent()}
        
        <GuestbookForm />
      </main>

      <Dialog.Root open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.dialogOverlay} />
          <Dialog.Content className={styles.dialogContent}>
            {selectedPhoto &&
            <>
                <LazyImage
                  imageId={selectedPhoto.imageId}
                  alt={selectedPhoto.alt}
                  className={styles.lightboxImage}
                />
                {selectedPhoto.caption &&
              <div className={styles.lightboxCaption}>
                    <p>{selectedPhoto.caption}</p>
                  </div>
              }
                <Dialog.Close asChild>
                  <button className={styles.closeButton} aria-label={t("photos.close")}>
                    <X size={24} />
                  </button>
                </Dialog.Close>
              </>
            }
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>);

}