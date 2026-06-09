import { db } from "../../helpers/db";
import { schema, OutputType } from "./get_GET.schema";
import { ZodError } from "zod";

export async function handle(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    const validatedInput = schema.parse({ id });

    const videoData = await db
      .selectFrom("videos")
      .where("id", "=", validatedInput.id)
      .select(["id", "name", "description", "mime_type", "created_at", "video_data"])
      .executeTakeFirst();

    if (!videoData) {
      return Response.json({ error: "Video not found" }, { status: 404 });
    }

    const video = {
      id: videoData.id,
      name: videoData.name,
      description: videoData.description,
      mimeType: videoData.mime_type,
      createdAt: videoData.created_at!, // Not null because it has a default value
      videoUrl: `data:${videoData.mime_type};base64,${videoData.video_data}`,
    };

    return Response.json({ video } satisfies OutputType);
  } catch (error) {
    console.error("Failed to fetch video:", error);
    if (error instanceof ZodError) {
      return Response.json({ error: "Invalid input: " + error.errors.map(e => e.message).join(', ') }, { status: 400 });
    }
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}