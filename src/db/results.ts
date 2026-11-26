import { getDb } from ".";
import { answersTable, resultsTable } from "./schema";
import { and, desc, eq } from "drizzle-orm";

export type NewResult = Omit<typeof resultsTable.$inferInsert, "userId">;
export type NewAnswer = Omit<typeof answersTable.$inferInsert, "resultId">;

export async function getResultById (id: string) {
    const rows = await getDb().select()
    .from(resultsTable)
    .where(eq(resultsTable.id, id));

    return rows[0] ?? null;
}

export async function saveResult (resultInput: NewResult, answersInput: NewAnswer[], userId: string) {

    if (answersInput.length === 0) {
        throw new Error("At least one answer is required");
    }

    return getDb().transaction(async (tx) => {
        const [result] = await tx.insert(resultsTable).values({...resultInput, userId}).returning({insertedId: resultsTable.id});

        await tx
            .insert(answersTable)
            .values(
                answersInput.map((answer) => ({
                    ...answer,
                    resultId: result.insertedId,
            }))
        );

        return result.insertedId;
    }); 
}

export async function listResultsForUser (userId: string) {
    return getDb().select({
        id: resultsTable.id,
        topicId: resultsTable.topicId,
        level: resultsTable.level,
        completedAt: resultsTable.completedAt
    })
    .from(resultsTable)
    .where(eq(resultsTable.userId, userId))
    .orderBy(desc(resultsTable.completedAt));   
}

export async function getResultForUser (id: string, userId: string) {
    const [row] = await getDb().select({
        id: resultsTable.id,
        topicId: resultsTable.topicId,
        level: resultsTable.level,
        completedAt: resultsTable.completedAt,
        subtopicScores: resultsTable.subtopicScores,
        levelScores: resultsTable.levelScores
    })
    .from(resultsTable)
    .where(and(eq(resultsTable.id, id), eq(resultsTable.userId, userId)));

    if (!row) {
        return null;
    }

    const answers = await getDb().select()
        .from(answersTable)
        .where(eq(answersTable.resultId, row.id));
    
    return {...row, answers};
}
