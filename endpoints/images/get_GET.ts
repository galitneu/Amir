import { db } from "../../helpers/db";
import { schema, OutputType } from "./get_GET.schema";
import { ZodError } from "zod";

export async function handle(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    const validatedInput = schema.parse({ id });

    const imageData = await db
      .selectFrom("images")
      .where("id", "=", validatedInput.id)
      .select(["id", "name", "description", "description_en", "mime_type", "created_at", "image_data"])
      .executeTakeFirst();

    if (!imageData) {
      return Response.json({ error: "Image not found" }, { status: 404 });
    }

    const image = {
      id: imageData.id,
      name: imageData.name,
      description: imageData.description,
      descriptionEn: imageData.description_en,
      mimeType: imageData.mime_type,
      createdAt: imageData.created_at,
      imageUrl: `data:${imageData.mime_type};base64,${imageData.image_data}`,
    };

    return Response.json({ image } satisfies OutputType);
  } catch (error) {
    console.error("Failed to fetch image:", error);
    if (error instanceof ZodError) {
      return Response.json({ error: "Invalid input: " + error.errors.map(e => e.message).join(', ') }, { status: 400 });
    }
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}