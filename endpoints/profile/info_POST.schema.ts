import { z } from "zod";
import { OutputType as GetOutputType } from "./info_GET.schema";

export const schema = z.object({
  name: z.string().min(1, "Name cannot be empty."),
  nameEn: z.string().min(1, "English name cannot be empty.").nullable(),
  birthDate: z.string().datetime({ message: "Invalid birth date format." }),
  deathDate: z.string().datetime({ message: "Invalid death date format." }),
  photoUrl: z.string().url({ message: "Invalid photo URL." }).nullable(),
  shortBiography: z.string().max(500, "Short biography cannot exceed 500 characters.").nullable(),
  quote: z.string().max(255, "Quote cannot exceed 255 characters.").nullable(),
  shortBiographyEn: z.string().max(500, "English short biography cannot exceed 500 characters.").nullable(),
  quoteEn: z.string().max(255, "English quote cannot exceed 255 characters.").nullable(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: true;
  profileInfo: GetOutputType;
};

export const postInfo = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/profile/info`, {
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
    throw new Error(errorObject.error || "Failed to update profile information");
  }
  return result.json();
};