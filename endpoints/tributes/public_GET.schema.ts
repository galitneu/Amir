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

export const schema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(4),
});

export type InputType = {
  page?: number;
  limit?: number;
};

export type OutputType = {
  tributes: Tribute[];
  total: number;
};

export const getPublicTributes = async (
  params: InputType = {},
  init?: RequestInit
): Promise<OutputType> => {
  const validatedParams = schema.parse(params);
  const searchParams = new URLSearchParams();
  if (validatedParams.page) {
    searchParams.set("page", validatedParams.page.toString());
  }
  if (validatedParams.limit) {
    searchParams.set("limit", validatedParams.limit.toString());
  }

  const result = await fetch(`/_api/tributes/public?${searchParams.toString()}`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = await result.json();
    throw new Error(errorObject.error || "Failed to fetch public tributes");
  }
  return result.json();
};