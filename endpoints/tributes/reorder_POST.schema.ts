import { z } from "zod";

export const schema = z.object({
  tributeIds: z.array(z.number().int().positive()).min(1, "At least one tribute ID is required."),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: true;
};

export const postTributesReorder = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/tributes/reorder`, {
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
    throw new Error(errorObject.error || "Failed to reorder tributes");
  }
  return result.json();
};