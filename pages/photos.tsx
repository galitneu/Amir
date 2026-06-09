"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "../components/Button";
import * as Dialog from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { getImagesList } from "../endpoints/images/list_GET.schema";
import { Skeleton } from "../components/Skeleton";
import { GuestbookForm } from "../components/GuestbookForm";
import { LazyImage } from "../components/LazyImage";
import Masonry from "masonry-layout";

import styles from "./photos.module.css";

type Photo = {
  id: string;
  imageId: number;
  alt: string;
  caption: string;
  description: string | null;
  preview: import("../helpers/imageTypes").ImagePreview;
};

// Function to shuffle array randomly
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Function to check if text contains Hebrew characters and is not empty
const isHebrewText = (text: string | null): boolean => {
  if (!text || text.trim() === '') return false;
  const hebrewRegex = /[\u0590-\u05FF]/;
  return hebrewRegex.test(text);
};

// Function to get display text (Hebrew description or nothing)
const getDisplayText = (description: string | null): string => {
  return isHebrewText(description) ? description! : '';
};

export default function PhotosPage() {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photosToShow, setPhotosToShow] = useState(12);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const masonryRef = useRef<Masonry | null>(null);

  const { data, isFetching, error } = useQuery({
    queryKey: ["images", "list"],
    queryFn: getImagesList,
    placeholderData: (prev) => prev,
  });

  const photos: Photo[] = useMemo(() => {
    if (!data || "error" in data) return [];
    
    const mappedPhotos = data.images.map((image) => ({
      id: image.id.toString(),
      imageId: image.id,
      alt: getDisplayText(image.description) || `תמונה ${image.id}`,
      caption: getDisplayText(image.description),
      description: image.description,
      preview: image,
    }));
    
    // Shuffle the photos randomly
    return shuffleArray(mappedPhotos);
  }, [data]);

  const displayedPhotos = photos.slice(0, photosToShow);
  const hasMorePhotos = photos.length > photosToShow;

  // Initialize Masonry when images are loaded
  useEffect(() => {
    if (gridRef.current && displayedPhotos.length > 0 && imagesLoaded >= displayedPhotos.length) {
      if (masonryRef.current && typeof masonryRef.current.destroy === 'function') {
        masonryRef.current.destroy();
      }
      
      masonryRef.current = new Masonry(gridRef.current, {
        itemSelector: `.${styles.photoCard}`,
        columnWidth: `.${styles.photoCard}`,
        gutter: 16,
        percentPosition: true,
        transitionDuration: '0.3s'
      });
    }
  }, [displayedPhotos, imagesLoaded]);

  // Update Masonry layout when new photos are added
  useEffect(() => {
    if (masonryRef.current && typeof masonryRef.current.layout === 'function') {
      setTimeout(() => {
        if (masonryRef.current && typeof masonryRef.current.layout === 'function') {
          masonryRef.current.layout();
        }
      }, 100);
    }
  }, [photosToShow]);

  // Clean up Masonry on unmount
  useEffect(() => {
    return () => {
      if (masonryRef.current && typeof masonryRef.current.destroy === 'function') {
        masonryRef.current.destroy();
      }
    };
  }, []);

  const handleImageLoad = () => {
    setImagesLoaded(prev => {
      const newCount = prev + 1;
      // Re-layout masonry when image loads
      if (masonryRef.current && typeof masonryRef.current.layout === 'function') {
        setTimeout(() => {
          if (masonryRef.current && typeof masonryRef.current.layout === 'function') {
            masonryRef.current.layout();
          }
        }, 10);
      }
      return newCount;
    });
  };

  const handleShowMore = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    // Store current scroll position
    const currentScrollY = window.scrollY;
    
    setPhotosToShow(prev => prev + 12);
    
    // Maintain scroll position after layout updates
    const maintainScrollPosition = () => {
      // Small delay to ensure new photos are rendered
      setTimeout(() => {
        if (masonryRef.current && typeof masonryRef.current.reloadItems === 'function' && typeof masonryRef.current.layout === 'function') {
          masonryRef.current.reloadItems();
          masonryRef.current.layout();
          
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

  const renderGalleryContent = () => {
    if (isFetching) {
      return (
        <div className={styles.gridContainer}>
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className={styles.photoCard}>
              <Skeleton className={styles.photoSkeleton} />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorMessage}>
          <p>שגיאה בטעינת התמונות. אנא נסה שוב מאוחר יותר.</p>
        </div>
      );
    }

    if (photos.length === 0) {
      return (
        <div className={styles.emptyMessage}>
          <p>אין תמונות להצגה כרגע.</p>
        </div>
      );
    }

    return (
      <div className={styles.galleryContainer}>
        <div ref={gridRef} className={styles.gridContainer}>
          {displayedPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className={`${styles.photoCard} ${index >= photosToShow - 12 ? styles.fadeIn : ''}`}
            >
              <button
                className={styles.photoButton}
                onClick={() => setSelectedPhoto(photo)}
                title={photo.caption || undefined}
              >
                <LazyImage
                  imageId={photo.imageId}
                  alt={photo.alt}
                  className={styles.photoImg}
                  onImageLoad={handleImageLoad}
                />
                {photo.caption && (
                  <div className={styles.photoOverlay}>
                    <p>{photo.caption}</p>
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>
        {hasMorePhotos && (
          <div className={styles.loadMoreContainer}>
            <Button type="button" variant="secondary" size="lg" onClick={handleShowMore}>
              טען עוד תמונות
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <Helmet>
        <title>גלריית תמונות - לזכרו של אמיר חסן</title>
        <meta name="description" content="אוסף תמונות מרגעים יפים בחייו של אמיר חסן." />
      </Helmet>

      <main className={styles.main}>
        <h1 className={styles.title}>גלריית תמונות</h1>
        <p className={styles.subtitle}>רגעים מחייו של אמיר</p>

        {renderGalleryContent()}
        
        <GuestbookForm className={styles.guestbookSection} />
      </main>

      <Dialog.Root open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.dialogOverlay} />
          <Dialog.Content className={styles.dialogContent}>
            {selectedPhoto && (
              <>
                <LazyImage
                  imageId={selectedPhoto.imageId}
                  alt={selectedPhoto.alt}
                  className={styles.lightboxImage}
                />
                {selectedPhoto.caption && (
                  <div className={styles.lightboxCaption}>
                    <p>{selectedPhoto.caption}</p>
                  </div>
                )}
                <Dialog.Close asChild>
                  <button className={styles.closeButton} aria-label="סגור">
                    <X size={24} />
                  </button>
                </Dialog.Close>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}