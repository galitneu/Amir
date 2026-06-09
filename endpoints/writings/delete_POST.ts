import { db } from '../../helpers/db';
import { schema, InputType, OutputType } from './delete_POST.schema';
import { getServerUserSession } from '../../helpers/getServerUserSession';
import { z } from 'zod';

export async function handle(request: Request): Promise<Response> {
  try {
    const { user } = await getServerUserSession(request);
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const json = await request.json();
    const { id } = schema.parse(json);

    const result = await db
      .deleteFrom('amir_writings')
      .where('id', '=', id)
      .executeTakeFirst();

    if (result.numDeletedRows === 0n) {
      return Response.json({ error: 'Writing not found' }, { status: 404 });
    }

    return Response.json({ success: true } satisfies OutputType);
  } catch (error) {
    console.error('Error deleting writing:', error);
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