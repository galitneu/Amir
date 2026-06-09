import { db } from '../../helpers/db';
import { schema, InputType, OutputType } from './create_POST.schema';
import { Insertable } from 'kysely';
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

    const writingToInsert: Insertable<DB['amir_writings']> = {
      title: input.title,
      content: input.content,
      image_url: input.imageUrl,
    };

    const result = await db
      .insertInto('amir_writings')
      .values(writingToInsert)
      .returning('id')
      .executeTakeFirstOrThrow();

    return Response.json({ success: true, writingId: result.id } satisfies OutputType, { status: 201 });
  } catch (error) {
    console.error('Error creating writing:', error);
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