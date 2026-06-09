import { db } from "../../helpers/db";
import { schema, OutputType } from "./public_GET.schema";
import { Kysely, sql } from "kysely";
import { DB } from "../../helpers/schema";

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const queryParams = {
      page: url.searchParams.get("page"),
      limit: url.searchParams.get("limit"),
    };

    const validatedInput = schema.parse({
      page: queryParams.page ?? undefined,
      limit: queryParams.limit ?? undefined,
    });

    const { page, limit } = validatedInput;
    const offset = (page - 1) * limit;

    const baseQuery = db
      .selectFrom("tributes")
      .where("is_featured", "=", true);

    const tributesFromDb = await baseQuery
      .selectAll()
      .orderBy("display_order", "asc")
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset)
      .execute();

    const totalResult = await baseQuery
      .select(db.fn.count<string>("id").as("count"))
      .executeTakeFirstOrThrow();

    const total = parseInt(totalResult.count, 10);

    const tributes = tributesFromDb.map((tribute) => ({
      id: tribute.id,
      authorName: tribute.author_name,
      relationship: tribute.relationship,
      content: tribute.content,
      isFeatured: tribute.is_featured ?? false,
      displayOrder: tribute.display_order ?? 0,
      createdAt: tribute.created_at?.toISOString() ?? new Date().toISOString(),
      updatedAt: tribute.updated_at?.toISOString() ?? new Date().toISOString(),
    }));

    return Response.json({ tributes, total } satisfies OutputType);
  } catch (error) {
    console.error("Error fetching public tributes:", error);
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}