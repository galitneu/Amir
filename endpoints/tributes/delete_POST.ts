import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType } from "./delete_POST.schema";
import { z } from "zod";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    if (user.role !== "admin") {
      return Response.json(
        { error: "Forbidden: You do not have permission to perform this action." },
        { status: 403 }
      );
    }

    const json = await request.json();
    const input = schema.parse(json);

    const result = await db
      .deleteFrom("tributes")
      .where("id", "=", input.id)
      .executeTakeFirst();

    if (result.numDeletedRows === 0n) {
      return Response.json({ error: "Tribute not found" }, { status: 404 });
    }

    return Response.json({ success: true } satisfies OutputType);
  } catch (error) {
    console.error("Error deleting tribute:", error);
    if (error instanceof Error && error.name === "NotAuthenticatedError") {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    return Response.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}