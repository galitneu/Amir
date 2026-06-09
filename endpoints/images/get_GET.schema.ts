import { z } from "zod";
import { Image } from "../../helpers/imageTypes";

export const schema = z.object({
  id: z.coerce.number().int().positive({ message: "Image ID must be a positive integer." }),
});

export type InputType = z.infer<typeof schema>;

export type OutputType =
  | {
      image: Image;
    }
  | {
      error: string;
    };

export const getImagesGet = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/images/get?id=${validatedInput.id}`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = await result.json();
    throw new Error(errorObject.error || "Failed to fetch image");
  }
  return result.json();
};