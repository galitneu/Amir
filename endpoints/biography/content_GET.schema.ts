import { z } from "zod";

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type BiographyImage = {
  imageId: string;
  url: string;
  caption: string;
  captionEn?: string;
  alt: string;
};

export type BiographyContent = {
  id: number;
  sectionTitle: string;
  sectionTitleEn?: string;
  content: string;
  contentEn?: string;
  displayOrder: number;
  images: BiographyImage[];
  createdAt: Date;
  updatedAt: Date;
};

export type OutputType =
  | {
      contents: BiographyContent[];
    }
  | {
      error: string;
    };

export const getBiographyContent = async (
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/biography/content`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = await result.json();
    throw new Error(errorObject.error || "Failed to fetch biography content");
  }
  return result.json();
};