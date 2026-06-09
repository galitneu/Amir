import { db } from "../../helpers/db";
import { schema } from "./establish_session_POST.schema";
import { setServerSession } from "../../helpers/getSetServerSession";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

async function makeSessionResponse(user: any) {
  const newSessionId = randomBytes(32).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  await db.insertInto("sessions").values({ id: newSessionId, user_id: user.id, created_at: now, last_accessed: now, expires_at: expiresAt }).execute();
  const userData = { id: user.id, email: user.email, displayName: user.display_name, avatarUrl: user.avatar_url, role: (user.role as "admin" | "user") || "user" };
  const response = Response.json({ user: userData, success: true });
  await setServerSession(response, { id: newSessionId, createdAt: now.getTime(), lastAccessed: now.getTime() });
  return response;
}

export async function handle(request: Request) {
  try {
    const json = await request.json();
    const { tempToken, email, password } = schema.parse(json);
    const invalid = () => Response.json({ error: "Invalid email or password" }, { status: 401 });
    if (email && password) {
      const normalizedEmail = email.toLowerCase().trim();
      const user = await db.selectFrom("users").selectAll().where("email", "=", normalizedEmail).executeTakeFirst();
      if (!user) { return invalid(); }
      const existing = await db.selectFrom("user_passwords").selectAll().where("user_id", "=", user.id).executeTakeFirst();
      if (!existing) {
        if (user.role !== "admin") { return invalid(); }
        const hash = await bcrypt.hash(password, 10);
        await db.insertInto("user_passwords").values({ user_id: user.id, password_hash: hash, created_at: new Date(), updated_at: new Date() }).execute();
      } else {
        const ok = await bcrypt.compare(password, existing.password_hash);
        if (!ok) { return invalid(); }
      }
      return await makeSessionResponse(user);
    }
    if (!tempToken) { return Response.json({ error: "Invalid request" }, { status: 400 }); }
    const tempSession = await db.selectFrom("sessions").selectAll().where("id", "=", tempToken).limit(1).executeTakeFirst();
    if (!tempSession) { return Response.json({ error: "Invalid or expired token" }, { status: 400 }); }
    const now = new Date();
    if (tempSession.expires_at < now) {
      await db.deleteFrom("sessions").where("id", "=", tempSession.id).execute();
      return Response.json({ error: "Token has expired" }, { status: 400 });
    }
    const user = await db.selectFrom("users").selectAll().where("id", "=", tempSession.user_id).executeTakeFirst();
    if (!user) { return Response.json({ error: "User not found" }, { status: 400 }); }
    await db.deleteFrom("sessions").where("id", "=", tempSession.id).execute();
    return await makeSessionResponse(user);
  } catch (error) {
    if (error instanceof Error) { return Response.json({ error: error.message }, { status: 400 }); }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
