import { z } from "zod";
import { Video } from "../../helpers/videoTypes";

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType =
  | {
      videos: Video[];
    }
  | {
      error: string;
    };

export const getVideosList = async (
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/videos/list`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = await result.json();
    throw new Error(errorObject.error || "Failed to fetch video list");
  }
  return result.json();
};