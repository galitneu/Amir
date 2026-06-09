import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../../helpers/getSetServerSession";
import { schema, OutputType } from "./info_POST.schema";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    if (user.role !== "admin") {
      return Response.json({ error: "Forbidden: You do not have permission to perform this action." }, { status: 403 });
    }

    const json = await request.json();
    const validatedInput = schema.parse(json);

    const { birthDate, deathDate, photoUrl, shortBiography, shortBiographyEn, quoteEn, nameEn, ...restOfInput } = validatedInput;

    const updatedProfile = await db
      .updateTable("profile_info")
      .set({
        ...restOfInput,
        name_en: nameEn,
        birth_date: new Date(birthDate),
        death_date: new Date(deathDate),
        photo_url: photoUrl,
        short_biography: shortBiography,
        short_biography_en: shortBiographyEn,
        quote_en: quoteEn,
        updated_at: new Date(),
      })
      // Assuming there is only one profile to update.
      // A more robust solution might use an ID if multiple profiles were possible.
      .returningAll()
      .executeTakeFirstOrThrow();

    const responseData: OutputType = {
      success: true,
      profileInfo: {
        name: updatedProfile.name,
        nameEn: updatedProfile.name_en,
        birthDate: updatedProfile.birth_date.toISOString(),
        deathDate: updatedProfile.death_date.toISOString(),
        photoUrl: updatedProfile.photo_url,
        shortBiography: updatedProfile.short_biography,
        quote: updatedProfile.quote,
        shortBiographyEn: updatedProfile.short_biography_en,
        quoteEn: updatedProfile.quote_en,
      },
    };

    return Response.json(responseData);
  } catch (error) {
    console.error("Failed to update profile info:", error);
    if (error instanceof NotAuthenticatedError) {
      return Response.json({ error: "Unauthorized: You must be logged in to perform this action." }, { status: 401 });
    }
    if (error instanceof Error) {
      return Response.json({ error: "Failed to update profile information.", details: error.message }, { status: 400 });
    }
    return Response.json({ error: "An unknown error occurred while updating profile information." }, { status: 500 });
  }
}