import { db } from "../../helpers/db";
import { OutputType, BiographyContent, BiographyImage } from "./content_GET.schema";

export async function handle(request: Request): Promise<Response> {
  try {
    const biographyContents = await db
      .selectFrom("biography_content")
      .selectAll()
      .orderBy("display_order", "asc")
      .execute();

    const contents: BiographyContent[] = biographyContents.map((item) => {
      let images: BiographyImage[] = [];
      
      // Parse images JSON if it exists
      if (item.images) {
        try {
          let parsedImages;
          
          // Handle backward compatibility: check if it's a string (old format) or array (new format)
          if (typeof item.images === 'string') {
            parsedImages = JSON.parse(item.images);
          } else {
            parsedImages = item.images;
          }
          
          // Ensure it's an array
          const imagesArray = Array.isArray(parsedImages) ? parsedImages : [];
          
          images = imagesArray.map((img: any) => ({
            imageId: img.imageId || '',
            url: img.url || '',
            caption: img.caption || '',
            captionEn: img.captionEn || img.caption_en,
            alt: img.alt || '',
          }));
        } catch (error) {
          console.error('Failed to parse images for biography section:', item.id, error);
          images = [];
        }
      }

      return {
        id: item.id,
        sectionTitle: item.section_title,
        ...(item.section_title_en !== null && { sectionTitleEn: item.section_title_en }),
        content: item.content,
        ...(item.content_en !== null && { contentEn: item.content_en }),
        displayOrder: item.display_order,
        images,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      };
    });

    return Response.json({ contents } satisfies OutputType);
  } catch (error) {
    console.error("Failed to fetch biography content:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}