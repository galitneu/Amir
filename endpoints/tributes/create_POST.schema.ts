import { z } from "zod";
import { TributeSchema } from "./list_GET.schema";

export const schema = z.object({
  authorName: z.string().min(1, "Author name is required."),
  relationship: z.string().min(1, "Relationship is required."),
  content: z.string().min(1, "Content is required."),
  isFeatured: z.boolean().optional().default(false),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  tribute: z.infer<typeof TributeSchema>;
};

export const postTributesCreate = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/tributes/create`, {
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
    throw new Error(errorObject.error || "Failed to create tribute");
  }
  return result.json();
};