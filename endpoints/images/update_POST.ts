import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType, Image } from "./update_POST.schema";

export async function handle(request: Request): Promise<Response> {
  try {
    console.log("=== Image update request started ===");
    const { user } = await getServerUserSession(request);

    if (user.role !== "admin") {
      console.log("Update rejected: User not admin", { userId: user.id, userRole: user.role });
      return Response.json(
        { error: "Forbidden: You do not have permission to perform this action." },
        { status: 403 }
      );
    }

    console.log("Admin user authenticated for update:", { userId: user.id });

    const json = await request.json();
    const { id, description, descriptionEn } = schema.parse(json);

    console.log(`Attempting to update image with ID: ${id}`);

    const [updatedImage] = await db
      .updateTable("images")
      .set({ 
        description: description,
        description_en: descriptionEn,
        updated_at: new Date() 
      })
      .where("id", "=", id)
      .returningAll()
      .execute();

    if (!updatedImage) {
      console.warn(`Image with ID ${id} not found for update.`);
      return Response.json(
        { error: `Image with ID ${id} not found.` },
        { status: 404 }
      );
    }

    console.log(`Successfully updated image with ID: ${id}`);
    
    const responseImage: Image = {
        id: updatedImage.id,
        name: updatedImage.name,
        description: updatedImage.description,
        descriptionEn: updatedImage.description_en,
        mimeType: updatedImage.mime_type,
        createdAt: updatedImage.created_at,
        updatedAt: updatedImage.updated_at,
    };

    console.log("=== Image update request completed successfully ===");
    return Response.json({ image: responseImage } satisfies OutputType);
  } catch (error) {
    console.error("=== Image update failed ===");
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      error: error,
    });

    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}