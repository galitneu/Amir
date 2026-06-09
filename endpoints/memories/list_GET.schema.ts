import { z } from 'zod';
import { Memory } from '../../helpers/memory';

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  memories: Memory[];
};

export const getMemoriesList = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/memories/list`, {
    method: 'GET',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = await result.json();
    throw new Error(errorObject.error || 'Failed to fetch memories');
  }
  return result.json();
};