import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
}

export const db = drizzle(dbUrl);

