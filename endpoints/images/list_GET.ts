import { db } from "../../helpers/db";
import { OutputType } from "./list_GET.schema";
import { ImagePreview } from "../../helpers/imageTypes";

export async function handle(request: Request): Promise<Response> {
  try {
    const imagesData = await db
      .selectFrom("images")
      // Select metadata only, no image_data for performance
      .select(["id", "name", "description", "description_en", "mime_type", "created_at"])
      .orderBy("created_at", "desc")
      .execute();

    const images: ImagePreview[] = imagesData.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      descriptionEn: item.description_en ?? null,
      mimeType: item.mime_type,
      createdAt: item.created_at,
      imageUrl: `/_api/images/get?id=${item.id}`
    }));

    return Response.json({ images } satisfies OutputType);
  } catch (error) {
    console.error("Failed to fetch image list:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}