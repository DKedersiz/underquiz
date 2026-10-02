import { z } from "zod";

// Content schema. Mirrors the vault note "soru-semasi" (v0.2). Only `tr` exists today; the
// localized wrapper keeps the door open for more languages.
const localized = z.object({ tr: z.string().min(1) });

const level = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);

export const resourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.url(),
  kind: z.enum(["docs", "article", "video", "book"]),
  lang: z.string(),
  levels: z.array(level),
});

export const topicSchema = z.object({
  id: z.string(),
  domain: z.string(),
  title: localized,
  subtopics: z.array(z.object({ id: z.string(), title: localized })).min(1),
  levels: z.object({ 1: localized, 2: localized, 3: localized, 4: localized }),
  resources: z.array(resourceSchema).default([]),
});

const baseQuestion = z.object({
  id: z.string(),
  version: z.number().int().positive(),
  topic: z.string(),
  subtopic: z.string(),
  level,
  tags: z.array(z.string()).default([]),
  prompt: localized,
  explanation: localized,
  resources: z.array(z.string()).default([]),
  source: z.object({
    kind: z.enum(["original", "adapted", "interview"]),
    ref: z.string().optional(),
    note: z.string().optional(),
  }),
  review: z.object({
    status: z.enum(["draft", "reviewed"]),
    by: z.string().optional(),
    date: z.string().optional(),
  }),
  revealsAnswerOf: z.array(z.string()).default([]),
});

const mcOption = z.object({
  id: z.string(),
  text: z.string(),
  correct: z.literal(true).optional(),
  misconception: localized.optional(),
});

export const mcQuestionSchema = baseQuestion
  .extend({
    type: z.literal("mc"),
    options: z.array(mcOption).min(2),
    allowUnsure: z.boolean().default(true),
    shuffle: z.boolean().default(true),
  })
  .superRefine((q, ctx) => {
    if (q.options.filter((o) => o.correct).length !== 1) {
      ctx.addIssue({ code: "custom", message: `${q.id}: exactly one correct option required` });
    }
    for (const o of q.options) {
      if (!o.correct && !o.misconception) {
        ctx.addIssue({ code: "custom", message: `${q.id}: option ${o.id} needs a misconception` });
      }
    }
  });

export const openQuestionSchema = baseQuestion
  .extend({
    type: z.literal("open"),
    answerHint: z.enum(["short", "medium"]).optional(),
    rubric: z
      .array(
        z.object({
          id: z.string(),
          point: localized,
          weight: z.number().int().min(1).max(3),
          required: z.boolean().optional(),
        }),
      )
      .min(1),
    misconceptions: z.array(z.object({ id: z.string(), text: localized })).default([]),
    pass: z.object({ minScore: z.number(), requireAll: z.array(z.string()).default([]) }),
    followUps: z
      .array(z.object({ ifMissing: z.string(), prompt: localized }))
      .default([]),
    modelAnswer: localized,
    escalatesFrom: z.string().optional(),
  })
  .superRefine((q, ctx) => {
    const ids = new Set(q.rubric.map((r) => r.id));
    for (const id of q.pass.requireAll) {
      if (!ids.has(id)) ctx.addIssue({ code: "custom", message: `${q.id}: requireAll ${id} not in rubric` });
    }
  });

export const questionSchema = z.discriminatedUnion("type", [mcQuestionSchema, openQuestionSchema]);

export type Level = z.infer<typeof level>;
export type Resource = z.infer<typeof resourceSchema>;
export type Topic = z.infer<typeof topicSchema>;
export type McQuestion = z.infer<typeof mcQuestionSchema>;
export type OpenQuestion = z.infer<typeof openQuestionSchema>;
export type Question = z.infer<typeof questionSchema>;
