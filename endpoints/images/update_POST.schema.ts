import { z } from "zod";

export const schema = z.object({
  id: z.number().int().positive({ message: "Image ID must be a positive integer." }),
  description: z.string().nullable(),
  descriptionEn: z.string().nullable(),
});

export type InputType = z.infer<typeof schema>;

export type Image = {
  id: number;
  name: string;
  description: string | null;
  descriptionEn: string | null;
  mimeType: string;
  createdAt: Date;
  updatedAt: Date | null;
};

export type OutputType =
  | {
      image: Image;
    }
  | {
      error: string;
    };

export const postUpdateImage = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/images/update`, {
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
    throw new Error(errorObject.error || "Failed to update image");
  }

  return result.json();
};