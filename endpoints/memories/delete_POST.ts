import { db } from '../../helpers/db';
import { schema, InputType, OutputType } from './delete_POST.schema';

export async function handle(request: Request): Promise<Response> {
  try {
    const json = await request.json();
    const { id } = schema.parse(json);

    const result = await db
      .deleteFrom('memories')
      .where('id', '=', id)
      .executeTakeFirst();

    if (result.numDeletedRows === 0n) {
      return Response.json({ error: 'Memory not found' }, { status: 404 });
    }

    return Response.json({ success: true } satisfies OutputType);
  } catch (error) {
    console.error('Error deleting memory:', error);
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}