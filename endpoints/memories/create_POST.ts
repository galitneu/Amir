import { db } from '../../helpers/db';
import { schema, InputType, OutputType } from './create_POST.schema';
import { Insertable } from 'kysely';
import { DB } from '../../helpers/schema';

export async function handle(request: Request): Promise<Response> {
  try {
    const json = await request.json();
    const input: InputType = schema.parse(json);

    const memoryToInsert: Insertable<DB['memories']> = {
      type: input.type,
      topic: input.topic,
      content: input.content,
      author: input.author,
      title_en: input.titleEn,
      content_en: input.contentEn,
      author_en: input.authorEn,
      source: input.source,
      description: input.description,
      image_id: input.imageId,
      video_id: input.videoId,
    };

    const result = await db
      .insertInto('memories')
      .values(memoryToInsert)
      .returning('id')
      .executeTakeFirstOrThrow();

    return Response.json({ success: true, memoryId: result.id } satisfies OutputType);
  } catch (error) {
    console.error('Error creating memory:', error);
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}