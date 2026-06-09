import { z } from "zod";
import { Video } from "../../helpers/videoTypes";

export const schema = z.object({
  id: z.coerce.number().int().positive({ message: "Video ID must be a positive integer." }),
});

export type InputType = z.infer<typeof schema>;

export type OutputType =
  | {
      video: Video;
    }
  | {
      error: string;
    };

export const getVideosGet = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/videos/get?id=${validatedInput.id}`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = await result.json();
    throw new Error(errorObject.error || "Failed to fetch video");
  }
  return result.json();
};