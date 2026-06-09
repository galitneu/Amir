import { db } from "../../helpers/db";
import { OutputType } from "./list_GET.schema";
import { Video } from "../../helpers/videoTypes";

export async function handle(request: Request): Promise<Response> {
  try {
    const videosData = await db
      .selectFrom("videos")
      .select(["id", "name", "description", "mime_type", "created_at", "video_data"])
      .orderBy("created_at", "desc")
      .execute();

    const videos: Video[] = videosData.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      mimeType: item.mime_type,
      createdAt: item.created_at!, // Not null because it has a default value
      videoUrl: `data:${item.mime_type};base64,${item.video_data}`
    }));

    return Response.json({ videos } satisfies OutputType);
  } catch (error) {
    console.error("Failed to fetch video list:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}