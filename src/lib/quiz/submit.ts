import { z } from "zod";

const mcAnswerSchema = z.object({
    type: z.literal("mc"),
    optionId: z.string().min(1),
})

const openAnswerSchema = z.object({
    type: z.literal("open"),
    text: z.string().max(1500),
    met: z.array(z.string()).optional(),
})

const answerSchema = z.discriminatedUnion("type", [mcAnswerSchema, openAnswerSchema]);
    
export const submitResultsSchema = z.object({
  topicId: z.string().min(1),
  contentKey: z.string().min(1),
  answers: z.record(z.string().min(1), answerSchema).refine((a) => Object.keys(a).length > 0, { message: "At least one answer is required" })
});

