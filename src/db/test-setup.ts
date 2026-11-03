import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import 'dotenv/config';

export async function setup() {

    const dbUrl = process.env.TEST_DATABASE_URL;

    if (!dbUrl) {
        throw new Error("TEST_DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
    }

    console.log("Migration için kullanılan:", dbUrl);
    const db = drizzle(dbUrl);

    await migrate(db, { migrationsFolder: "./drizzle" });

    await db.$client.end();
}