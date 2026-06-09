import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType } from "./create_POST.schema";
import { z } from "zod";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    if (user.role !== "admin") {
      return Response.json(
        { error: "Forbidden: You do not have permission to perform this action." },
        { status: 403 }
      );
    }

    const json = await request.json();
    const input = schema.parse(json);

    const now = new Date();

    const newTribute = await db
      .insertInto("tributes")
      .values({
        author_name: input.authorName,
        relationship: input.relationship,
        content: input.content,
        is_featured: input.isFeatured,
        created_at: now,
        updated_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    const responseData = {
      tribute: {
        id: newTribute.id,
        authorName: newTribute.author_name,
        relationship: newTribute.relationship,
        content: newTribute.content,
        isFeatured: newTribute.is_featured ?? false,
        createdAt: newTribute.created_at?.toISOString() ?? now.toISOString(),
        updatedAt: newTribute.updated_at?.toISOString() ?? now.toISOString(),
      },
    };

    return Response.json(responseData satisfies OutputType, { status: 201 });
  } catch (error) {
    console.error("Error creating tribute:", error);
    if (error instanceof Error && error.name === "NotAuthenticatedError") {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    return Response.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}