import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { OutputType } from "./list_GET.schema";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    if (user.role !== "admin") {
      return Response.json(
        { error: "Forbidden: You do not have permission to access this resource." },
        { status: 403 }
      );
    }

    const tributesFromDb = await db
      .selectFrom("tributes")
      .selectAll()
      .orderBy("display_order", "asc")
      .orderBy("created_at", "desc")
      .execute();

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

    return Response.json({ tributes } satisfies OutputType);
  } catch (error) {
    console.error("Error fetching tributes:", error);
    if (error instanceof Error && error.name === "NotAuthenticatedError") {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    return Response.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}