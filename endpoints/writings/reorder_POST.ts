import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, InputType, OutputType } from "./reorder_POST.schema";
import { z } from "zod";
import { sql } from "kysely";

export async function handle(request: Request): Promise<Response> {
  try {
    const { user } = await getServerUserSession(request);

    if (user.role !== "admin") {
      return Response.json(
        { error: "Forbidden: You do not have permission to perform this action." },
        { status: 403 }
      );
    }

    const json = await request.json();
    const { writingIds }: InputType = schema.parse(json);

    if (writingIds.length === 0) {
      return Response.json({ success: true } satisfies OutputType);
    }

    await db.transaction().execute(async (trx) => {
      const updates = writingIds.map((id, index) => 
        trx.updateTable('amir_writings')
          .set({ display_order: index })
          .where('id', '=', id)
          .executeTakeFirst()
      );
      
      const results = await Promise.all(updates);

      const totalUpdated = results.reduce((sum, result) => sum + Number(result.numUpdatedRows), 0);

      if (totalUpdated !== writingIds.length) {
        console.warn(`Writings reorder mismatch: expected ${writingIds.length} updates, but got ${totalUpdated}. Some IDs might be invalid.`);
        throw new Error("One or more writing IDs were invalid, and the order could not be updated.");
      }
    });

    return Response.json({ success: true } satisfies OutputType);
  } catch (error) {
    console.error("Error reordering writings:", error);
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    if (error instanceof Error && error.name === "NotAuthenticatedError") {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (error instanceof Error) {
        return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json(
      { error: "An unexpected error occurred while reordering writings." },
      { status: 500 }
    );
  }
}