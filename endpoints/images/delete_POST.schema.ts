import { z } from "zod";

export const schema = z.object({
  id: z.number().int().positive({ message: "Image ID must be a positive integer." }),
});

export type InputType = z.infer<typeof schema>;

export type OutputType =
  | {
      success: true;
    }
  | {
      error: string;
    };

export const postDeleteImage = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/images/delete`, {
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
    throw new Error(errorObject.error || "Failed to delete image");
  }

  return result.json();
};