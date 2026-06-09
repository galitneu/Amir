import { z } from "zod";

// No input schema needed for a simple GET request
export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  name: string;
  nameEn: string | null;
  birthDate: string; // ISO 8601 date string
  deathDate: string; // ISO 8601 date string
  photoUrl: string | null;
  shortBiography: string | null;
  quote: string | null;
  shortBiographyEn: string | null;
  quoteEn: string | null;
};

export const getInfo = async (
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/profile/info`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = await result.json();
    throw new Error(errorObject.error || "Failed to fetch profile information");
  }
  return result.json();
};