import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema, OutputType } from "./reorder_POST.schema";
import { z } from "zod";
import { sql } from "kysely";

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
    const { tributeIds } = input;

    if (tributeIds.length === 0) {
      // Nothing to do, but it's a successful request.
      return Response.json({ success: true } satisfies OutputType);
    }

    // We use a transaction to ensure that all updates succeed or none do.
    await db.transaction().execute(async (trx) => {
      // We build a CASE statement to update multiple rows in a single query, which is more efficient.
      // The SQL would look like:
      // UPDATE "tributes" SET "display_order" = (CASE
      //   WHEN "id" = 1 THEN 0
      //   WHEN "id" = 2 THEN 1
      //   ...
      // END) WHERE "id" IN (1, 2, ...)
      let caseBuilder = sql`CASE`;
      tributeIds.forEach((id, index) => {
        caseBuilder = sql`${caseBuilder} WHEN id = ${sql.literal(id)} THEN ${sql.literal(index)}`;
      });
      const caseStatement = sql`${caseBuilder} END`;

      // Since display_order is a Generated field, we need to use raw SQL to update it
      const result = await sql`
        UPDATE tributes 
        SET display_order = ${caseStatement}
        WHERE id IN (${sql.join(tributeIds.map(id => sql.literal(id)))})
      `.execute(trx);

      // Check that the number of updated rows matches the number of IDs we received
      if (Number(result.numAffectedRows) !== tributeIds.length) {
        console.warn(`Tribute reorder mismatch: expected ${tributeIds.length} updates, but got ${result.numAffectedRows}. Some IDs might be invalid.`);
        // We throw an error to rollback the transaction.
        throw new Error("One or more tribute IDs were invalid, and the order could not be updated.");
      }
    });

    return Response.json({ success: true } satisfies OutputType);
  } catch (error) {
    console.error("Error reordering tributes:", error);
    if (error instanceof Error && error.name === "NotAuthenticatedError") {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
        return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json(
      { error: "An unexpected error occurred while reordering tributes." },
      { status: 500 }
    );
  }
}