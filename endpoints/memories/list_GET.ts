import { db } from '../../helpers/db';
import { OutputType } from './list_GET.schema';
import { Memory } from '../../helpers/memory';

export async function handle(request: Request): Promise<Response> {
  try {
    const memories = await db
      .selectFrom('memories')
      .selectAll()
      .orderBy('created_at', 'desc')
      .execute();

    const responseData: OutputType = {
      memories: memories.map(memory => ({
        id: memory.id,
        type: memory.type as Memory['type'],
        topic: memory.topic,
        content: memory.content,
        author: memory.author,
        titleEn: memory.title_en,
        contentEn: memory.content_en,
        authorEn: memory.author_en,
        source: memory.source,
        imageId: memory.image_id,
        videoId: memory.video_id,
        description: memory.description,
        createdAt: memory.created_at?.toISOString() || new Date().toISOString(),
        updatedAt: memory.updated_at?.toISOString() || new Date().toISOString(),
      })),
    };

    return Response.json(responseData);
  } catch (error) {
    console.error('Error fetching memories:', error);
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}