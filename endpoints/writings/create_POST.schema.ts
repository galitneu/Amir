import { z } from 'zod';

export const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  imageUrl: z.string().url('Must be a valid URL').optional().nullable(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: boolean;
  writingId: number;
};

export const postWritingsCreate = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/writings/create`, {
    method: 'POST',
    body: JSON.stringify(validatedInput),
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = await result.json();
    throw new Error(errorObject.error || 'Failed to create writing');
  }
  return result.json();
};