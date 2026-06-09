import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType } from "./delete_POST.schema";

export async function handle(request: Request): Promise<Response> {
  try {
    console.log("=== Image delete request started ===");
    const { user } = await getServerUserSession(request);

    if (user.role !== "admin") {
      console.log("Delete rejected: User not admin", { userId: user.id, userRole: user.role });
      return Response.json(
        { error: "Forbidden: You do not have permission to perform this action." },
        { status: 403 }
      );
    }

    console.log("Admin user authenticated for deletion:", { userId: user.id });

    const json = await request.json();
    const { id } = schema.parse(json);

    console.log(`Attempting to delete image with ID: ${id}`);

    const result = await db
      .deleteFrom("images")
      .where("id", "=", id)
      .executeTakeFirst();

    if (result.numDeletedRows === 0n) {
      console.warn(`Image with ID ${id} not found for deletion.`);
      return Response.json(
        { error: `Image with ID ${id} not found.` },
        { status: 404 }
      );
    }

    console.log(`Successfully deleted image with ID: ${id}`);
    console.log("=== Image delete request completed successfully ===");
    return Response.json({ success: true } satisfies OutputType);
  } catch (error) {
    console.error("=== Image delete failed ===");
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