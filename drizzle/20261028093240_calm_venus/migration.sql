CREATE TABLE "answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"result_id" uuid NOT NULL,
	"question_id" text NOT NULL,
	"question_type" text NOT NULL,
	"option_id" text,
	"open_answer" jsonb,
	"credit" double precision NOT NULL,
	CONSTRAINT "answers_result_id_question_id_unique" UNIQUE("result_id","question_id"),
	CONSTRAINT "question_type_check" CHECK ("question_type" IN ('mc', 'open')),
	CONSTRAINT "answer_shape_check" CHECK (("question_type" = 'mc' AND "option_id" IS NOT NULL AND "open_answer" IS NULL) OR ("question_type" = 'open' AND "option_id" IS NULL AND "open_answer" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"topic_id" text NOT NULL,
	"content_key" text NOT NULL,
	"level" smallint NOT NULL,
	"level_scores" jsonb NOT NULL,
	"subtopic_scores" jsonb NOT NULL,
	"completed_at" timestamp with time zone NOT NULL,
	CONSTRAINT "level_check" CHECK ("level" BETWEEN 0 AND 4)
);
--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_result_id_results_id_fkey" FOREIGN KEY ("result_id") REFERENCES "results"("id") ON DELETE CASCADE;