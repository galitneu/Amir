import { z } from "zod";

export const TributeSchema = z.object({
  id: z.number(),
  authorName: z.string(),
  relationship: z.string(),
  content: z.string(),
  isFeatured: z.boolean(),
  displayOrder: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Tribute = z.infer<typeof TributeSchema>;

// No input schema for listing all tributes
export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  tributes: Tribute[];
};

export const getTributesList = async (
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/tributes/list`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = await result.json();
    throw new Error(errorObject.error || "Failed to fetch tributes");
  }
  return result.json();
};