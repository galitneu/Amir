import { z } from 'zod';
import { MemoryTypeSchema } from '../../helpers/memory';

export const schema = z.object({
  type: MemoryTypeSchema,
  topic: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  author: z.string().optional().nullable(),
  titleEn: z.string().optional().nullable(),
  contentEn: z.string().optional().nullable(),
  authorEn: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  imageId: z.number().optional().nullable(),
  videoId: z.number().optional().nullable(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  success: boolean;
  memoryId: number;
};

export const postMemoriesCreate = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/memories/create`, {
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
    throw new Error(errorObject.error || 'Failed to create memory');
  }
  return result.json();
};