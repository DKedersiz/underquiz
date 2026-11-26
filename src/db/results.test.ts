import crypto from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { getDb } from "./index";
import { answersTable, resultsTable, usersTable } from "./schema";
import { getResultById, getResultForUser, listResultsForUser, saveResult, type NewAnswer, type NewResult} from "./results";

describe("Quiz Results DB", () => {
  let mockUserId: string;

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
  ];

  beforeEach(async () => {
    await getDb().delete(usersTable);
    const [user] = await getDb()
      .insert(usersTable)
      .values({ githubId: 1 })
      .returning({ id: usersTable.id });

    mockUserId = user.id;
  });

  it("Should save a new result and read with returned id value", async () => {
    const insertedId = await saveResult(mockResult, mockAnswers, mockUserId);
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
    const duplicateAnswers: NewAnswer[] = [
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

    await expect(saveResult(mockResult, duplicateAnswers, mockUserId)).rejects.toThrow();

    const results = await getDb().select().from(resultsTable);
    const answers = await getDb().select().from(answersTable);

    expect(results).toHaveLength(0);
    expect(answers).toHaveLength(0);
  });

  it("Should return null when querying another user's result", async () => {
    const [otherUser] = await getDb()
      .insert(usersTable)
      .values({ githubId: 2 })
      .returning({ id: usersTable.id });

    const otherResultId = await saveResult(mockResult, mockAnswers, otherUser.id);

    const result = await getResultForUser(otherResultId, mockUserId);

    expect(result).toBeNull();
  });

  it("Should return user's own result with its answers", async () => {
    const insertedId = await saveResult(mockResult, mockAnswers, mockUserId);

    const result = await getResultForUser(insertedId, mockUserId);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(insertedId);
    expect(result?.answers).toHaveLength(1);
    expect(result?.answers[0].questionId).toBe("q-1");
  });

  it("Should list only current user's results ordered by newest first", async () => {
    const [otherUser] = await getDb()
      .insert(usersTable)
      .values({ githubId: 2 })
      .returning({ id: usersTable.id });

    const janDate = new Date("2026-01-01");
    const febDate = new Date("2026-02-01");

    await saveResult({ ...mockResult, completedAt: janDate }, mockAnswers, mockUserId);
    const febId = await saveResult({ ...mockResult, completedAt: febDate }, mockAnswers, mockUserId);
    await saveResult({ ...mockResult, completedAt: new Date("2026-03-01") }, mockAnswers, otherUser.id);

    const list = await listResultsForUser(mockUserId);

    expect(list).toHaveLength(2);
    expect(list[0].id).toBe(febId);
    expect(list[0].completedAt.getTime()).toBe(febDate.getTime());
    expect(list[1].completedAt.getTime()).toBe(janDate.getTime());
  });
});