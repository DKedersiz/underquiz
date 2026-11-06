import crypto from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "./index";
import { answersTable, resultsTable } from "./schema";
import { getResultById, saveResult, type NewAnswer, type NewResult} from "./results";

describe("Quiz Results DB", () => {
  beforeEach(async () => {
    await db.delete(answersTable);
    await db.delete(resultsTable);
  });

  it("Should save a new result and read with returned id value", async () => {
    const mockResult: NewResult = {
      topicId: "javascript-basics",
      contentKey: "js-101",
      level: 2,
      levelScores: [],
      subtopicScores: [{id: "xd", earned: 3, max: 5}],
      completedAt: new Date(),
    };

    const mockAnswers: NewAnswer[] = [
      {
        questionId: "q-1",
        questionType: "mc",
        optionId: "opt-a",
        openAnswer: null,
        credit: 1.0,
      },
    ];

    
    const insertedId = await saveResult(mockResult, mockAnswers);
    const savedRecord = await getResultById(insertedId);

    
    expect(savedRecord).not.toBeNull();
    expect(savedRecord?.id).toBe(insertedId);
    expect(savedRecord?.topicId).toBe(mockResult.topicId);
    expect(savedRecord?.contentKey).toBe(mockResult.contentKey);
    expect(savedRecord?.level).toBe(mockResult.level);
    expect(savedRecord?.completedAt.getTime()).toBe(mockResult.completedAt.getTime());
  });

  
  it("Should return null when we query with non existent ID", async () => {
    const randomId = crypto.randomUUID();

    const result = await getResultById(randomId);

    expect(result).toBeNull();
  });

  it("Rollback check on saveResult", async () => {
    const mockResult: NewResult = {
      topicId: "javascript-basics",
      contentKey: "js-101",
      level: 2,
      levelScores: [],
      subtopicScores: [{ id: "xd", earned: 3, max: 5 }],
      completedAt: new Date(),
    };

    const mockAnswers: NewAnswer[] = [
      {
        questionId: "q-1",
        questionType: "mc",
        optionId: "opt-a",
        openAnswer: null,
        credit: 1.0,
      },
      {
        questionId: "q-1",
        questionType: "mc",
        optionId: "opt-b",
        openAnswer: null,
        credit: 1.0,
      },
    ];

    await expect(saveResult(mockResult, mockAnswers)).rejects.toThrow();

    const results = await db.select().from(resultsTable);
    const answers = await db.select().from(answersTable);

    expect(results).toHaveLength(0);
    expect(answers).toHaveLength(0);
});
});