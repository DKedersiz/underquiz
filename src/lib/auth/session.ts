import { eq } from "drizzle-orm";
import { timingSafeEqual, createHash, getRandomValues } from "node:crypto";
import { db } from "@/db";
import { sessionsTable, usersTable } from "@/db/schema";

const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;
const SESSION_IDLE_TIMEOUT_MS = 1000 * 60 * 60 * 24 * 7;
const ACTIVITY_CHECK_INTERVAL_MS = 1000 * 60 * 60;

export interface SessionWithToken {
	id: string;
	userId: string;
	token: string;
	createdAt: Date;
	tokenLastVerifiedAt: Date;
}

export type SessionValidationResult =
	| { session: typeof sessionsTable.$inferSelect; user: typeof usersTable.$inferSelect }
	| { session: null; user: null };

export function generateSecureRandomString(): string {
	const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
	const bytes = new Uint8Array(24);
	getRandomValues(bytes);

	let id = "";
	for (let i = 0; i < bytes.length; i++) {
		id += alphabet[bytes[i] & 31];
	}
	return id;
}

function hashSecret(secret: string): Buffer {
	return createHash("sha256").update(secret).digest();
}

export async function createSession(userId: string): Promise<SessionWithToken> {
	const now = new Date();
	const id = generateSecureRandomString();
	const secret = generateSecureRandomString();
	const secretHash = hashSecret(secret);

	const token = `${id}.${secret}`;

	await db.insert(sessionsTable).values({
		id,
		userId,
		secretHash,
		tokenLastVerifiedAt: now,
		createdAt: now,
	});

	return {
		id,
		userId,
		token,
		createdAt: now,
		tokenLastVerifiedAt: now,
	};
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const parts = token.split(".");
	if (parts.length !== 2) {
		return { session: null, user: null };
	}

	const [sessionId, sessionSecret] = parts;
	if (!sessionId || !sessionSecret) {
		return { session: null, user: null };
	}

	const result = await db
		.select({
			session: sessionsTable,
			user: usersTable,
		})
		.from(sessionsTable)
		.innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
		.where(eq(sessionsTable.id, sessionId));

	if (result.length === 0) {
		return { session: null, user: null };
	}

	const { session, user } = result[0];

	const tokenSecretHash = hashSecret(sessionSecret);
	const storedHash = Buffer.from(session.secretHash);

	if (
		tokenSecretHash.byteLength !== storedHash.byteLength ||
		!timingSafeEqual(tokenSecretHash, storedHash)
	) {
		return { session: null, user: null };
	}

	const now = Date.now();

	if (now - session.createdAt.getTime() >= SESSION_MAX_AGE_MS) {
		await invalidateSession(session.id);
		return { session: null, user: null };
	}

	if (now - session.tokenLastVerifiedAt.getTime() >= SESSION_IDLE_TIMEOUT_MS) {
		await invalidateSession(session.id);
		return { session: null, user: null };
	}

	if (now - session.tokenLastVerifiedAt.getTime() >= ACTIVITY_CHECK_INTERVAL_MS) {
		const newVerifiedAt = new Date(now);
		session.tokenLastVerifiedAt = newVerifiedAt;

		await db
			.update(sessionsTable)
			.set({ tokenLastVerifiedAt: newVerifiedAt })
			.where(eq(sessionsTable.id, session.id));
	}

	return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
}