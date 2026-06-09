import { z } from "zod";

export const biographyImageSchema = z.object({
  imageId: z.string().min(1, "Image ID is required."),
  url: z.string().url("Invalid image URL."),
  caption: z.string(),
  captionEn: z.string().optional(),
  alt: z.string(),
});

export const biographyContentItemSchema = z.object({
  sectionTitle: z.string().min(1, "Section title is required."),
  sectionTitleEn: z.string().optional(),
  content: z.string().min(1, "Content is required."),
  contentEn: z.string().optional(),
  displayOrder: z.number().int().min(0),
  images: z.array(biographyImageSchema).default([]),
});

export const schema = z.object({
  contents: z.array(biographyContentItemSchema),
});

export type InputType = z.infer<typeof schema>;

export type OutputType =
  | {
      success: boolean;
      message: string;
    }
  | {
      error: string;
    };

export const postBiographyContent = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/biography/content`, {
    method: "POST",
    body: JSON.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = await result.json();
    throw new Error(errorObject.error || "Failed to update biography content");
  }
  return result.json();
};