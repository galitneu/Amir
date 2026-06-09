import { z } from 'zod';
import { MemorySchema, Memory } from '../../helpers/memory';

export const schema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(4),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  memories: Memory[];
  total: number;
};

export const getPublicMemories = async (
  params: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedParams = schema.parse(params);
  const searchParams = new URLSearchParams({
    page: validatedParams.page.toString(),
    limit: validatedParams.limit.toString(),
  });

  const result = await fetch(`/_api/memories/public?${searchParams.toString()}`, {
    method: 'GET',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = await result.json();
    throw new Error(errorObject.error || 'Failed to fetch public memories');
  }
  return result.json();
};