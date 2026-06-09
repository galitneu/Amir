import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const schema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  image: z
    .instanceof(File, { message: "Image is required." })
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
});

export type InputType = z.infer<typeof schema>;

export type Image = {
  id: number;
  name: string;
  description: string | null;
  descriptionEn: string | null;
  mimeType: string;
  createdAt: Date;
};

export type OutputType =
  | {
      image: Image;
    }
  | {
      error: string;
    };

export const postUploadImage = async (
  formData: FormData,
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/images/upload`, {
    method: "POST",
    body: formData,
    ...init,
  });
  if (!result.ok) {
    const errorObject = await result.json();
    throw new Error(errorObject.error || "Failed to upload image");
  }
  return result.json();
};