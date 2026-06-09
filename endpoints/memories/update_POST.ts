import { db } from '../../helpers/db';
import { schema, InputType, OutputType } from './update_POST.schema';
import { Updateable } from 'kysely';
import { DB } from '../../helpers/schema';

export async function handle(request: Request): Promise<Response> {
  try {
    const json = await request.json();
    const input: InputType = schema.parse(json);

    const { id, ...updateData }: InputType = input;

    const memoryToUpdate: Updateable<DB['memories']> = {
      type: updateData.type,
      topic: updateData.topic,
      content: updateData.content,
      author: updateData.author,
      title_en: updateData.titleEn,
      content_en: updateData.contentEn,
      author_en: updateData.authorEn,
      source: updateData.source,
      description: updateData.description,
      image_id: updateData.imageId,
      video_id: updateData.videoId,
      updated_at: new Date(),
    };

    const result = await db
      .updateTable('memories')
      .set(memoryToUpdate)
      .where('id', '=', id)
      .executeTakeFirst();

    if (result.numUpdatedRows === 0n) {
      return Response.json({ error: 'Memory not found or no changes made' }, { status: 404 });
    }

    return Response.json({ success: true } satisfies OutputType);
  } catch (error) {
    console.error('Error updating memory:', error);
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}