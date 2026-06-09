import { z } from 'zod';

export const MemoryTypeSchema = z.enum(['note', 'quote', 'image']);
export type MemoryType = z.infer<typeof MemoryTypeSchema>;

export const MemorySchema = z.object({
  id: z.number(),
  type: MemoryTypeSchema,
  topic: z.string().nullable(),
  content: z.string().nullable(),
  author: z.string().nullable(),
  source: z.string().nullable(),
  imageId: z.number().nullable(),
  videoId: z.number().nullable(),
  description: z.string().nullable(),
  titleEn: z.string().nullable(),
  contentEn: z.string().nullable(),
  authorEn: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Memory = z.infer<typeof MemorySchema>;