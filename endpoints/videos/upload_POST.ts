import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType, Video } from "./upload_POST.schema";

// This helper function is duplicated from the image upload endpoint.
// For a real-world application, this should be moved to a shared helper file.
async function toBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = '';
  uint8Array.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

export async function handle(request: Request): Promise<Response> {
  try {
    console.log('=== Video upload request started ===');
    const { user } = await getServerUserSession(request);

    if (user.role !== "admin") {
      console.log('Upload rejected: User not admin', { userId: user.id, userRole: user.role });
      return Response.json(
        { error: "Forbidden: You do not have permission to perform this action." },
        { status: 403 }
      );
    }

    console.log('Admin user authenticated:', { userId: user.id });

    const formData = await request.formData();
    console.log('FormData received, extracting fields...');
    
    const videoFromForm = formData.get('video') as File | null;
    const name = formData.get('name') as string | null;
    const description = formData.get('description') as string | null;
    
    console.log('FormData fields extracted:', {
      hasVideoFile: !!videoFromForm,
      videoName: videoFromForm?.name,
      videoSize: videoFromForm?.size,
      videoType: videoFromForm?.type,
      providedName: name,
      providedDescription: description
    });
    
    if (!videoFromForm) {
      console.error('Upload failed: No video file provided');
      return Response.json(
        { error: "Video file is required." },
        { status: 400 }
      );
    }
    
    const dataToValidate = {
      video: videoFromForm,
      name: name || undefined,
      description: description || undefined,
    };
    
    console.log('Starting Zod validation...');
    const result = schema.parse(dataToValidate);
    console.log('Zod validation passed');

    const videoFile = result.video;
    console.log('Processing video file:', {
      name: videoFile.name,
      size: videoFile.size,
      type: videoFile.type,
    });

    console.log('Starting base64 conversion...');
    const videoData = await toBase64(videoFile);
    console.log('Base64 conversion completed, length:', videoData.length);

    const videoName = result.name || `video_${Date.now()}`;
    console.log('Final video name:', videoName);

    console.log('Inserting into database...');
    const [insertedVideo] = await db
      .insertInto("videos")
      .values({
        name: videoName,
        description: result.description,
        video_data: videoData,
        mime_type: videoFile.type,
      })
      .returningAll()
      .execute();

    if (!insertedVideo) {
      console.error('Database insertion failed: No video returned');
      throw new Error("Failed to save video to the database.");
    }
    
    console.log('Video successfully inserted into database:', {
      id: insertedVideo.id,
      name: insertedVideo.name,
      mimeType: insertedVideo.mime_type,
      dataLength: insertedVideo.video_data.length
    });
    
    const newVideo: Video = {
        id: insertedVideo.id,
        name: insertedVideo.name,
        description: insertedVideo.description,
        mimeType: insertedVideo.mime_type,
        createdAt: insertedVideo.created_at!, // Not null because it has a default value
    };

    console.log('=== Video upload completed successfully ===');
    return Response.json({ video: newVideo } satisfies OutputType, { status: 201 });
  } catch (error) {
    console.error("=== Video upload failed ===");
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}