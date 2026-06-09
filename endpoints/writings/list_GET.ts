import { db } from '../../helpers/db';
import { OutputType, Writing } from './list_GET.schema';
import { sql } from 'kysely';

export async function handle(request: Request): Promise<Response> {
  try {
    const writings = await db
      .selectFrom('amir_writings')
      .selectAll()
      .orderBy(sql`display_order asc nulls last`)
      .orderBy('created_at', 'desc')
      .execute();

    const responseData: Writing[] = writings.map(writing => ({
      id: writing.id,
      title: writing.title,
      content: writing.content,
      imageUrl: writing.image_url,
      displayOrder: writing.display_order,
      createdAt: writing.created_at?.toISOString() ?? null,
      updatedAt: writing.updated_at?.toISOString() ?? null,
    }));

    return Response.json({ writings: responseData } satisfies OutputType);
  } catch (error) {
    console.error("Error fetching writings list:", error);
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}