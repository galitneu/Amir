import { db } from "../../helpers/db";
import { OutputType } from "./info_GET.schema";

export async function handle(request: Request) {
  try {
    const profileInfo = await db
      .selectFrom("profile_info")
      .selectAll()
      .limit(1)
      .executeTakeFirst();

    if (!profileInfo) {
      return Response.json({ error: "Profile information not found." }, { status: 404 });
    }

    const responseData: OutputType = {
      name: profileInfo.name,
      nameEn: profileInfo.name_en,
      birthDate: profileInfo.birth_date.toISOString(),
      deathDate: profileInfo.death_date.toISOString(),
      photoUrl: profileInfo.photo_url,
      shortBiography: profileInfo.short_biography,
      quote: profileInfo.quote,
      shortBiographyEn: profileInfo.short_biography_en,
      quoteEn: profileInfo.quote_en,
    };

    return Response.json(responseData);
  } catch (error) {
    console.error("Failed to fetch profile info:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return Response.json({ error: "Failed to retrieve profile information.", details: errorMessage }, { status: 500 });
  }
}