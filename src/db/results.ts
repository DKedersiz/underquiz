import { db } from ".";
import { answersTable, resultsTable } from "./schema";
import { eq } from "drizzle-orm";

export type NewResult = typeof resultsTable.$inferInsert;
export type NewAnswer = Omit<typeof answersTable.$inferInsert, "resultId">;

export async function getResultById (id: string) {
    const rows = await db.select()
    .from(resultsTable)
    .where(eq(resultsTable.id, id));

    return rows[0] ?? null;
}

export async function saveResult (resultInput: NewResult, answersInput: NewAnswer[]) {

    if (answersInput.length === 0) {
        throw new Error("At least one answer is required");
    }

    return db.transaction(async (tx) => {
        const [result] = await tx.insert(resultsTable).values(resultInput).returning({insertedId: resultsTable.id});

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
