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
    const { contents } = schema.parse(json);

    await db.transaction().execute(async (trx) => {
      // Use a transaction to ensure all updates succeed or none do.
      // This approach replaces all content with the new content.
      // A more sophisticated approach might handle individual item updates, creations, and deletions.
      
      // For simplicity, we'll delete all existing content and insert the new content.
      await trx.deleteFrom("biography_content").execute();

      if (contents.length > 0) {
        const newContents = contents.map(item => ({
          section_title: item.sectionTitle,
          section_title_en: item.sectionTitleEn ?? null,
          content: item.content,
          content_en: item.contentEn ?? null,
          display_order: item.displayOrder,
          images: item.images,
        }));

        await trx.insertInto("biography_content").values(newContents).execute();
      }
    });

    return Response.json({
      success: true,
      message: "Biography content updated successfully.",
    } satisfies OutputType);

  } catch (error) {
    console.error("Failed to update biography content:", error);
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}