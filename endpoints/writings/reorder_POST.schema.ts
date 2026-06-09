import { z } from "zod";

export const schema = z.object({
  writingIds: z.array(z.number().int().positive()).min(1, "At least one writing ID is required."),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: true;
};

export const postWritingsReorder = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/writings/reorder`, {
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
    throw new Error(errorObject.error || "Failed to reorder writings");
  }
  return result.json();
};