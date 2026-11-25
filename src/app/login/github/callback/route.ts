import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { usersTable } from "@/db/schema";
import {
	createSession,
	deleteExpiredSessions,
	invalidateSession,
	validateSessionToken,
} from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/auth/current";

export async function GET(request: Request): Promise<NextResponse> {
	const clientId = process.env.GITHUB_CLIENT_ID;
	if (!clientId) {
		throw new Error("GITHUB_CLIENT_ID tanımlı değil");
	}

	const clientSecret = process.env.GITHUB_CLIENT_SECRET;
	if (!clientSecret) {
		throw new Error("GITHUB_CLIENT_SECRET tanımlı değil");
	}

	const appUrl = process.env.APP_URL;
	if (!appUrl) {
		throw new Error("APP_URL tanımlı değil");
	}

	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");

	const cookieStore = await cookies();
	const storedState = cookieStore.get("github_oauth_state")?.value ?? null;
	const codeVerifier = cookieStore.get("github_code_verifier")?.value ?? null;

	if (!code || !state || !storedState || !codeVerifier) {
		return new NextResponse("Eksik OAuth parametresi veya cookie", { status: 400 });
	}

	const stateBuffer = Buffer.from(state);
	const storedStateBuffer = Buffer.from(storedState);
	if (
		stateBuffer.byteLength !== storedStateBuffer.byteLength ||
		!timingSafeEqual(stateBuffer, storedStateBuffer)
	) {
		return new NextResponse("Geçersiz OAuth state", { status: 400 });
	}

	const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify({
			client_id: clientId,
			client_secret: clientSecret,
			code,
			redirect_uri: `${appUrl}/login/github/callback`,
			code_verifier: codeVerifier,
		}),
	});

	if (!tokenResponse.ok) {
		return new NextResponse("GitHub token isteği başarısız", { status: 502 });
	}

	const tokenData = (await tokenResponse.json()) as {
		access_token?: string;
		error?: string;
		error_description?: string;
	};

	if (tokenData.error || !tokenData.access_token) {
		return new NextResponse(
			tokenData.error_description ?? "GitHub token alınamadı",
			{ status: 400 }
		);
	}

	const githubUserResponse = await fetch("https://api.github.com/user", {
		headers: {
			Authorization: `Bearer ${tokenData.access_token}`,
			Accept: "application/vnd.github+json",
			"User-Agent": "underquiz",
		},
	});

	if (!githubUserResponse.ok) {
		return new NextResponse("GitHub kullanıcı bilgisi alınamadı", { status: 502 });
	}

	const githubUser = (await githubUserResponse.json()) as { id?: number };
	if (typeof githubUser.id !== "number") {
		return new NextResponse("Geçersiz GitHub kullanıcı verisi", { status: 502 });
	}

	const [user] = await getDb()
		.insert(usersTable)
		.values({ githubId: githubUser.id })
		.onConflictDoUpdate({
			target: usersTable.githubId,
			set: { githubId: githubUser.id },
		})
		.returning({ id: usersTable.id });

	const oldToken = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;

	if (oldToken) {
		const { session: existingSession } = await validateSessionToken(oldToken);
		if (existingSession) {
			await invalidateSession(existingSession.id);
		}
	}

	await deleteExpiredSessions(user.id);

	const session = await createSession(user.id);

	const response = NextResponse.redirect(new URL("/", appUrl));
	const isProduction = process.env.NODE_ENV === "production";

	response.cookies.set(SESSION_COOKIE_NAME, session.token, {
		path: "/",
		httpOnly: true,
		secure: isProduction,
		sameSite: "lax",
		maxAge: 60 * 60 * 24 * 30,
	});

	response.cookies.delete("github_oauth_state");
	response.cookies.delete("github_code_verifier");

	return response;
}