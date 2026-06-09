import { z } from "zod";

// no schema, just a simple GET request
export const schema = z.object({});

export type OutputType =
  | {
      content: string;
      contentEn: string | null;
      updatedAt: Date | null;
    }
  | {
      error: string;
    };

export const getAcknowledgmentsContent = async (
  body: z.infer<typeof schema> = {},
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/acknowledgments/content`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  return result.json();
};