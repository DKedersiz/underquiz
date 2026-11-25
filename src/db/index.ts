import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

let instance: ReturnType<typeof drizzle> | undefined;

export function getDb() {
  if (instance) {
    return instance;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
  }

  instance = drizzle(databaseUrl);
  return instance;
}

