import { z } from "zod";

// No input schema needed for a simple GET request
export const schema = z.object({});
export type InputType = z.infer<typeof schema>;

export type GuestbookMessage = {
  id: number;
  visitorName: string;
  relationship: string | null;
  message: string;
  createdAt: string; // ISO date string
};

export type OutputType = 
  | { messages: GuestbookMessage[] }
  | { error: string };

export const getGuestbookList = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/guestbook/list`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = await result.json();
    throw new Error(errorObject.error || "Failed to fetch guestbook messages.");
  }

  return result.json();
};