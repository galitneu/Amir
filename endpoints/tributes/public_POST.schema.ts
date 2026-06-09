import { z } from "zod";
import { TributeSchema } from "./list_GET.schema";

export const schema = z.object({
  authorName: z.string().min(1, "Name is required."),
  relationship: z.string().optional(),
  content: z.string().min(1, "Message is required."),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  tribute: z.infer<typeof TributeSchema>;
};

export const postTributesPublic = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/tributes/public`, {
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
    throw new Error(errorObject.error || "Failed to submit tribute");
  }
  return result.json();
};