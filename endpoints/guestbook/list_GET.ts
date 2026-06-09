import { db } from "../../helpers/db";
import { OutputType, GuestbookMessage } from "./list_GET.schema";

export async function handle(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const messagesFromDb = await db
      .selectFrom("guestbook_messages")
      .selectAll()
      .orderBy("created_at", "desc")
      .execute();

    const messages: GuestbookMessage[] = messagesFromDb.map((msg) => ({
      id: msg.id,
      visitorName: msg.visitor_name,
      relationship: msg.relationship ?? null,
      message: msg.message,
      createdAt: msg.created_at?.toISOString() ?? new Date().toISOString(),
    }));

    return Response.json({ messages } satisfies OutputType);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching guestbook messages:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }
    console.error("An unknown error occurred while fetching guestbook messages:", error);
    return Response.json({ error: "An unknown error occurred." }, { status: 500 });
  }
}