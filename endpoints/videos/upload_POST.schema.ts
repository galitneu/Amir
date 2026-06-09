import { z } from "zod";
import { Video } from "../../helpers/videoTypes";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime", // .mov
  "video/x-msvideo", // .avi
  "video/webm",
];

export const schema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  video: z
    .instanceof(File, { message: "Video is required." })
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      `Max file size is 20MB.`
    )
    .refine(
      (file) => ACCEPTED_VIDEO_TYPES.includes(file.type),
      "Only .mp4, .mov, .avi, and .webm formats are supported."
    ),
});

export type InputType = z.infer<typeof schema>;

// Re-export for use in the endpoint handler
export type { Video };

export type OutputType =
  | {
      video: Video;
    }
  | {
      error: string;
    };

export const postUploadVideo = async (
  formData: FormData,
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/videos/upload`, {
    method: "POST",
    body: formData,
    ...init,
  });
  if (!result.ok) {
    const errorObject = await result.json();
    throw new Error(errorObject.error || "Failed to upload video");
  }
  return result.json();
};