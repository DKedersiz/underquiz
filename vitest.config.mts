import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";

const env = loadEnv("", process.cwd(), "");

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { 
    include: ["src/**/*.test.ts"],
    globalSetup: ["./src/db/test-setup.ts"],
    fileParallelism: false,
    env: {
      DATABASE_URL: env.TEST_DATABASE_URL,
    },
   },
});
