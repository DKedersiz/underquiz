ALTER TABLE "results" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
CREATE INDEX "results_user_id_completed_at_idx" ON "results" ("user_id","completed_at");--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;