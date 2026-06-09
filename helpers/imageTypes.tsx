// Metadata-only type for list endpoints (without image data)
export type ImageMetadata = {
  id: number;
  name: string;
  description: string | null;
  descriptionEn: string | null;
  mimeType: string;
  createdAt: Date;
};

// Preview type with thumbnail URL but not full Base64 data
export type ImagePreview = ImageMetadata & { imageUrl: string };

// Full image type with image data for individual image endpoints
export type Image = {
  id: number;
  name: string;
  description: string | null;
  descriptionEn: string | null;
  mimeType: string;
  createdAt: Date;
  imageUrl: string; // Contains the full Base64 data URL
};