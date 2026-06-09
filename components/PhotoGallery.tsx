"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getImagesGet } from "../endpoints/images/get_GET.schema";
import { ImagePreview } from "../helpers/imageTypes";
import { Skeleton } from "./Skeleton";
import styles from "./PhotoGallery.module.css";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "./Carousel";

interface Photo {
  id: number;
  src: string; // Base64 data URL
  caption?: string;
  alt: string;
}

interface PhotoGalleryProps {
  photos: ImagePreview[];
  title?: string;
  className?: string;
  compact?: boolean;
}

const CarouselImage: React.FC<{ 
  preview: ImagePreview; 
  alt: string; 
  caption?: string;
}> = ({ preview, alt, caption }) => {
  return (
    <div className={styles.photoContainer}>
      <img 
        src={preview.imageUrl}
        alt={alt} 
        className={styles.photo}
      />
      {caption && (
        <div className={styles.caption}>
          <p>{caption}</p>
        </div>
      )}
    </div>
  );
};

export const PhotoGallery = ({
  photos,
  title = "Photos",
  className,
  compact = false,
}: PhotoGalleryProps) => {
  if (!photos || photos.length === 0) {
    return (
      <section className={`${styles.gallery} ${compact ? styles.compact : ""} ${className || ""}`}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.carouselContainer}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '400px',
            color: 'var(--muted-foreground)'
          }}>
            אין תמונות להצגה
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`${styles.gallery} ${compact ? styles.compact : ""} ${className || ""}`}>
      <h2 className={styles.title}>{title}</h2>
      
      <div className={styles.carouselContainer}>
        <Carousel opts={{ loop: true }}>
          <CarouselContent>
            {photos.map((preview) => (
              <CarouselItem key={preview.id} className={styles.carouselItem}>
                <CarouselImage
                  preview={preview}
                  alt={preview.description || `תמונה ${preview.id}`}
                  caption={preview.description || undefined}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
};