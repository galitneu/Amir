import { db } from "../../helpers/db";
import { schema, InputType, OutputType } from "./submit_POST.schema";
import { ZodError } from "zod";

export async function handle(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const json = await request.json();
    const input: InputType = schema.parse(json);

    await db
      .insertInto("guestbook_messages")
      .values({
        visitor_name: input.visitorName,
        relationship: input.relationship,
        message: input.message,
      })
      .execute();

    console.log("Successfully inserted new guestbook message from:", input.visitorName);

    return Response.json(
      { success: true, message: "Message submitted successfully." } satisfies OutputType,
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Validation error submitting guestbook message:", error.errors);
      return Response.json({ error: "Invalid input.", details: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      console.error("Error submitting guestbook message:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }
    console.error("An unknown error occurred:", error);
    return Response.json({ error: "An unknown error occurred." }, { status: 500 });
  }
}