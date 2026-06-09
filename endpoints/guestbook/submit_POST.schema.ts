import { z } from "zod";

export const schema = z.object({
  visitorName: z.string().min(1, "Name is required.").max(100, "Name must be 100 characters or less."),
  relationship: z.string().max(100, "Relationship must be 100 characters or less.").optional().nullable(),
  message: z.string().min(1, "Message is required.").max(5000, "Message must be 5000 characters or less."),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = 
  | { success: true; message: string }
  | { error: string; details?: any };

export const postGuestbookSubmit = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/guestbook/submit`, {
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
    throw new Error(errorObject.error || "Failed to submit message.");
  }

  return result.json();
};