import { NextResponse } from "next/server";
import { getCurrentSession, SESSION_COOKIE_NAME } from "@/lib/auth/current";
import { invalidateSession } from "@/lib/auth/session";

export async function POST(request: Request): Promise<NextResponse> {
  const { session } = await getCurrentSession();
  if (session) {
    await invalidateSession(session.id);
  }

  // 303: the browser follows a POST redirect with GET.
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
