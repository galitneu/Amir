import { z } from "zod";

export const schema = z.object({
      tempToken: z.string().optional(),
      email: z.string().optional(),
      password: z.string().optional(),
      currentPassword: z.string().optional(),
      newPassword: z.string().optional(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType =
      | {
                user: {
                            id: number;
                            email: string;
                            displayName: string;
                            avatarUrl: string | null;
                            role: "admin" | "user";
                };
                success: boolean;
      }
  | { success: boolean; changed: boolean }
  | { error: string };

export const postEstablishSession = async (
      body: z.infer<typeof schema>,
      init?: RequestInit
    ): Promise<OutputType> => {
      const validatedInput = schema.parse(body);
      const result = await fetch("/_api/auth/establish_session", {
              method: "POST",
              body: JSON.stringify(validatedInput),
              ...init,
              headers: {
                        "Content-Type": "application/json",
                        ...(init?.headers ?? {}),
              },
      });
      return result.json();
};
