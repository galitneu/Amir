import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType } from "./content_POST.schema";

export async function handle(request: Request): Promise<Response> {
  try {
    const { user } = await getServerUserSession(request);

    if (user.role !== "admin") {
      return Response.json(
        { error: "Forbidden: You do not have permission to perform this action." },
        { status: 403 }
      );
    }

    const json = await request.json();
    const { content, contentEn } = schema.parse(json);

    const now = new Date();
    
    // Use an "UPSERT" operation. It attempts to insert a new row.
    // If a row with id=1 already exists, it updates the content of that row instead.
    // This ensures there's always a single, editable acknowledgments entry.
    await db
      .insertInto("acknowledgments")
      .values({
        id: 1, // Use a fixed ID for the single acknowledgments entry
        content: content,
        content_en: contentEn ?? null,
        created_at: now,
        updated_at: now,
      })
      .onConflict((oc) => oc
        .column('id')
        .doUpdateSet({ 
          content: content,
          content_en: contentEn ?? null,
          updated_at: now
        })
      )
      .execute();

    return Response.json({
      success: true,
      message: "Acknowledgments content updated successfully.",
    } satisfies OutputType);

  } catch (error) {
    console.error("Failed to update acknowledgments content:", error);
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}