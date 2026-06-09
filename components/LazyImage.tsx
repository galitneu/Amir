import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getImagesGet } from "../endpoints/images/get_GET.schema";
import { Skeleton } from "./Skeleton";

interface LazyImageProps {
  imageId: number;
  alt: string;
  className?: string;
  onImageLoad?: () => void;
  enabled?: boolean;
}

export const LazyImage: React.FC<LazyImageProps> = ({ 
  imageId, 
  alt, 
  className = "", 
  onImageLoad,
  enabled = true
}) => {
  const { 
    data: imageData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['image', imageId],
    queryFn: () => getImagesGet({ id: imageId }),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (!enabled) {
    return null;
  }

  if (isLoading) {
    return (
      <Skeleton 
        style={{ 
          width: "100%", 
          height: "200px", 
          borderRadius: "var(--radius)" 
        }} 
      />
    );
  }

  if (error || !imageData || 'error' in imageData) {
    return (
      <div 
        className={className}
        style={{
          width: "100%",
          height: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--muted)",
          borderRadius: "var(--radius)",
          color: "var(--muted-foreground)"
        }}
      >
        שגיאה בטעינת התמונה
      </div>
    );
  }

  return (
    <img 
      src={imageData.image.imageUrl}
      alt={alt}
      className={className}
      onLoad={onImageLoad}
    />
  );
};