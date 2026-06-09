import { z } from "zod";
import { ImagePreview } from "../../helpers/imageTypes";

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType =
  | {
      images: ImagePreview[];
    }
  | {
      error: string;
    };

export const getImagesList = async (
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/images/list`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = await result.json();
    throw new Error(errorObject.error || "Failed to fetch image list");
  }
  return result.json();
};