import { db } from "../../helpers/db";
import { schema, OutputType } from "./public_POST.schema";
import { z } from "zod";

export async function handle(request: Request) {
  try {
    const json = await request.json();
    const input = schema.parse(json);

    const now = new Date();

    const newTribute = await db
      .insertInto("tributes")
      .values({
        author_name: input.authorName,
        relationship: input.relationship ?? "", // DB column is not nullable
        content: input.content,
        is_featured: false, // Public submissions are not featured by default
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
    console.error("Error creating public tribute:", error);
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    // It's a public endpoint, so we don't check for NotAuthenticatedError
    return Response.json(
      { error: "An unexpected error occurred while submitting your tribute." },
      { status: 500 }
    );
  }
}