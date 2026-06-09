import { db } from '../../helpers/db';
import { schema, OutputType } from './public_GET.schema';
import { Memory } from '../../helpers/memory';
import { sql } from 'kysely';

export async function handle(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '4', 10);

    const validatedInput = schema.parse({ page, limit });
    const offset = (validatedInput.page - 1) * validatedInput.limit;

    const memoriesQuery = db
      .selectFrom('memories')
      .selectAll()
      .orderBy('created_at', 'desc')
      .limit(validatedInput.limit)
      .offset(offset);

    const totalQuery = db
      .selectFrom('memories')
      .select(db.fn.count<string>('id').as('total'));

    const [memories, totalResult] = await Promise.all([
      memoriesQuery.execute(),
      totalQuery.executeTakeFirstOrThrow(),
    ]);

    const total = parseInt(totalResult.total, 10);

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
      total,
    };

    return Response.json(responseData);
  } catch (error) {
    console.error('Error fetching public memories:', error);
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}