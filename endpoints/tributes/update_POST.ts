import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType } from "./update_POST.schema";
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
    const { id, ...updateData } = input;

    const updatedTribute = await db
      .updateTable("tributes")
      .set({
        ...('authorName' in updateData && { author_name: updateData.authorName }),
        ...('relationship' in updateData && { relationship: updateData.relationship }),
        ...('content' in updateData && { content: updateData.content }),
        ...('isFeatured' in updateData && { is_featured: updateData.isFeatured }),
        updated_at: now,
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();

    if (!updatedTribute) {
      return Response.json({ error: "Tribute not found" }, { status: 404 });
    }

    const responseData = {
      tribute: {
        id: updatedTribute.id,
        authorName: updatedTribute.author_name,
        relationship: updatedTribute.relationship,
        content: updatedTribute.content,
        isFeatured: updatedTribute.is_featured ?? false,
        createdAt: updatedTribute.created_at?.toISOString() ?? now.toISOString(),
        updatedAt: updatedTribute.updated_at?.toISOString() ?? now.toISOString(),
      },
    };

    return Response.json(responseData satisfies OutputType);
  } catch (error) {
    console.error("Error updating tribute:", error);
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