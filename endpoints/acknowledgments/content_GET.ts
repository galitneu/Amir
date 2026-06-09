import { db } from "../../helpers/db";
import { OutputType } from "./content_GET.schema";

export async function handle(request: Request): Promise<Response> {
  try {
    // Assuming a single row of content for acknowledgments.
    // If the table is empty, it will return null.
    const result = await db
      .selectFrom("acknowledgments")
      .select(["content", "content_en", "updated_at"])
      .orderBy("id", "asc")
      .limit(1)
      .executeTakeFirst();

    const updatedAt = result?.updated_at;
    return Response.json({
      content: result?.content ?? "",
      contentEn: result?.content_en ?? null,
      updatedAt: updatedAt ? new Date(updatedAt) : null,
    } satisfies OutputType);
  } catch (error) {
    console.error("Failed to fetch acknowledgments content:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}