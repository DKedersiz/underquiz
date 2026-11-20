import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { generateSecureRandomString } from "@/lib/auth/session";

export async function GET(): Promise<NextResponse> {
	const clientId = process.env.GITHUB_CLIENT_ID;
	if (!clientId) {
		throw new Error("GITHUB_CLIENT_ID tanımlı değil");
	}

	const appUrl = process.env.APP_URL;
	if (!appUrl) {
		throw new Error("APP_URL tanımlı değil");
	}

	const state = generateSecureRandomString();

	const codeVerifier = randomBytes(32).toString("base64url");
	const codeChallenge = createHash("sha256")
		.update(codeVerifier)
		.digest("base64url");

	const url = new URL("https://github.com/login/oauth/authorize");
	url.searchParams.set("client_id", clientId);
	url.searchParams.set("redirect_uri", `${appUrl}/login/github/callback`);
	url.searchParams.set("state", state);
	url.searchParams.set("code_challenge", codeChallenge);
	url.searchParams.set("code_challenge_method", "S256");

	const response = NextResponse.redirect(url);

	const cookieOptions = {
		path: "/",
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax" as const,
		maxAge: 60 * 10,
	};

	response.cookies.set("github_oauth_state", state, cookieOptions);
	response.cookies.set("github_code_verifier", codeVerifier, cookieOptions);

	return response;
}