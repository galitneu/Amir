import React from 'react';
import { ImagePreview } from '../helpers/imageTypes';
import styles from './ImagePicker.module.css';
import { CheckCircle2 } from 'lucide-react';

export interface ImagePickerProps {
  images: ImagePreview[];
  selectedImageId: number | null | undefined;
  onSelectImage: (id: number) => void;
  disabled?: boolean;
  className?: string;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  images,
  selectedImageId,
  onSelectImage,
  disabled = false,
  className,
}) => {
  if (!images || images.length === 0) {
    return (
      <div className={`${styles.container} ${styles.empty} ${className || ''}`}>
        <p>לא נמצאו תמונות. יש להעלות תמונות תחילה.</p>
      </div>
    );
  }

  return (
    <div
      className={`${styles.container} ${disabled ? styles.disabled : ''} ${className || ''}`}
      role="radiogroup"
      aria-label="בחר תמונה"
    >
      {images.map((image) => {
        const isSelected = image.id === selectedImageId;
        return (
          <button
            key={image.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onSelectImage(image.id)}
            className={`${styles.imageWrapper} ${isSelected ? styles.selected : ''}`}
            aria-label={image.name}
          >
            <img
              src={image.imageUrl}
              alt={image.description || image.name}
              className={styles.image}
            />
            {isSelected && (
              <div className={styles.selectedOverlay}>
                <CheckCircle2 size={24} className={styles.checkIcon} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};