import { db } from '../../helpers/db';
import { schema, InputType, OutputType } from './update_POST.schema';
import { Updateable } from 'kysely';
import { DB } from '../../helpers/schema';
import { getServerUserSession } from '../../helpers/getServerUserSession';
import { z } from 'zod';

export async function handle(request: Request): Promise<Response> {
  try {
    const { user } = await getServerUserSession(request);
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const json = await request.json();
    const input: InputType = schema.parse(json);

    const { id, ...updateData } = input;

    const writingToUpdate: Updateable<DB['amir_writings']> = {
      title: updateData.title,
      content: updateData.content,
      image_url: updateData.imageUrl,
      updated_at: new Date(),
    };

    const result = await db
      .updateTable('amir_writings')
      .set(writingToUpdate)
      .where('id', '=', id)
      .executeTakeFirst();

    if (result.numUpdatedRows === 0n) {
      return Response.json({ error: 'Writing not found or no changes made' }, { status: 404 });
    }

    return Response.json({ success: true } satisfies OutputType);
  } catch (error) {
    console.error('Error updating writing:', error);
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    if (error instanceof Error && error.name === 'NotAuthenticatedError') {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}