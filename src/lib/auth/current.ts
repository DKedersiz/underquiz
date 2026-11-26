import { cookies } from "next/headers";
import { type SessionValidationResult, validateSessionToken } from "@/lib/auth/session";

export const SESSION_COOKIE_NAME = "session";

export async function getCurrentSession(): Promise<SessionValidationResult> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return { session: null, user: null };
  }
  return validateSessionToken(token);
}
