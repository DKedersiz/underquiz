import type {TopicResult } from "@/lib/quiz/scoring";
import type { OpenAnswer } from "@/lib/quiz/types";
import { sql } from "drizzle-orm";
import { check, doublePrecision, jsonb, pgTable, smallint, text, timestamp, unique, uuid} from "drizzle-orm/pg-core";

export const resultsTable = pgTable("results", {
  id: uuid().primaryKey().defaultRandom(),
  topicId: text("topic_id").notNull(),
  contentKey: text("content_key").notNull(),
  level: smallint().notNull(),
  levelScores: jsonb("level_scores").$type<TopicResult["levels"]>().notNull(),
  subtopicScores: jsonb("subtopic_scores").$type<TopicResult["subtopics"]>().notNull(),
  completedAt: timestamp("completed_at", {withTimezone: true,}).notNull(),
},
(table) => [
    check("level_check", sql`${table.level} BETWEEN 0 AND 4`)
]
);

export const answersTable = pgTable("answers", {
    id: uuid().primaryKey().defaultRandom(),
    resultId: uuid("result_id").references(() => resultsTable.id, { onDelete: "cascade"}).notNull(),
    questionId: text("question_id").notNull(),
    questionType: text("question_type").notNull(),
    optionId: text("option_id"),
    openAnswer: jsonb("open_answer").$type<Omit<OpenAnswer, "type">>(),
    credit: doublePrecision().notNull(),
},
(table) => [
    unique().on(table.resultId, table.questionId),
    check("question_type_check", sql`${table.questionType} IN ('mc', 'open')`),
    check("answer_shape_check", sql`(${table.questionType} = 'mc' AND ${table.optionId} IS NOT NULL AND ${table.openAnswer} IS NULL) OR (${table.questionType} = 'open' AND ${table.optionId} IS NULL AND ${table.openAnswer} IS NOT NULL)`)
]
)