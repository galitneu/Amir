import { z } from 'zod';

export const WritingSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  imageUrl: z.string().nullable(),
  displayOrder: z.number().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export type Writing = z.infer<typeof WritingSchema>;

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  writings: Writing[];
};

export const getWritingsList = async (
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/writings/list`, {
    method: 'GET',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = await result.json();
    throw new Error(errorObject.error || 'Failed to fetch writings list');
  }
  return result.json();
};