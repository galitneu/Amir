export interface Video {
  id: number;
  name: string;
  description: string | null;
  mimeType: string;
  createdAt: Date;
  videoUrl?: string; // This will be a base64 data URL from the list endpoint
}