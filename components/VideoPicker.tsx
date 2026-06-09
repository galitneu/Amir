import React from 'react';
import { Video } from '../helpers/videoTypes';
import styles from './VideoPicker.module.css';
import { CheckCircle2, Video as VideoIcon, AlertCircle } from 'lucide-react';
import { Skeleton } from './Skeleton';

export interface VideoPickerProps {
  videos: Video[] | undefined;
  selectedVideoId: number | null | undefined;
  onSelectVideo: (id: number) => void;
  isLoading?: boolean;
  error?: string | null;
  disabled?: boolean;
  className?: string;
}

const VideoPickerSkeleton: React.FC = () => (
  <div className={styles.container}>
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className={styles.itemWrapper}>
        <Skeleton className={styles.thumbnailSkeleton} />
        <Skeleton className={styles.titleSkeleton} />
        <Skeleton className={styles.descriptionSkeleton} />
      </div>
    ))}
  </div>
);

export const VideoPicker: React.FC<VideoPickerProps> = ({
  videos,
  selectedVideoId,
  onSelectVideo,
  isLoading = false,
  error = null,
  disabled = false,
  className,
}) => {
  if (isLoading) {
    return <VideoPickerSkeleton />;
  }

  if (error) {
    return (
      <div className={`${styles.container} ${styles.messageContainer} ${className || ''}`}>
        <AlertCircle className={styles.errorIcon} />
        <p>שגיאה בטעינת הסרטונים: {error}</p>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className={`${styles.container} ${styles.messageContainer} ${className || ''}`}>
        <p>לא נמצאו סרטונים. יש להעלות סרטונים תחילה.</p>
      </div>
    );
  }

  return (
    <div
      className={`${styles.container} ${disabled ? styles.disabled : ''} ${className || ''}`}
      role="radiogroup"
      aria-label="בחר סרטון"
    >
      {videos.map((video) => {
        const isSelected = video.id === selectedVideoId;
        return (
          <button
            key={video.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onSelectVideo(video.id)}
            className={`${styles.itemWrapper} ${isSelected ? styles.selected : ''}`}
            aria-label={video.name}
          >
            <div className={styles.thumbnail}>
              <VideoIcon className={styles.videoIcon} size={48} />
              {isSelected && (
                <div className={styles.selectedOverlay}>
                  <CheckCircle2 size={24} className={styles.checkIcon} />
                </div>
              )}
            </div>
            <div className={styles.details}>
              <p className={styles.name}>{video.name}</p>
              {video.description && <p className={styles.description}>{video.description}</p>}
            </div>
          </button>
        );
      })}
    </div>
  );
};