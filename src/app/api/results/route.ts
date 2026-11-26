import { listResultsForUser, saveResult, type NewAnswer, type NewResult } from "@/db/results";
import { getCurrentSession } from "@/lib/auth/current";
import { loadTopicView } from "@/lib/content/load";
import { credit, scoreTopic } from "@/lib/quiz/scoring";
import { submitResultsSchema } from "@/lib/quiz/submit";

export async function POST (request: Request) {
    const { user } = await getCurrentSession();

    if (!user) {
        return Response.json({error: "unauthorized"}, { status: 401 });
    }

    let body : unknown;

    try {
        body = await request.json();
    } catch {
        return Response.json({ error: "invalid_json"}, { status: 400 });
    }

    const parsed = submitResultsSchema.safeParse(body);

    if (!parsed.success) {
        return Response.json({ error: "invalid_body" }, { status: 400 });
    }

    const { topicId, contentKey } = parsed.data;
    const view = await loadTopicView(topicId);
    
    if (!view) {
        return Response.json({ error: "topic_not_found" }, { status: 404 });
    }

    if (view.contentKey !== contentKey) {
        return Response.json({ error: "content_version_mismatch"}, { status: 409 });
    }

    const questions = new Map(view.questions.map((q) => [q.id, q]));
    const newAnswers: NewAnswer[] = [];

    for (const [id, answer] of Object.entries(parsed.data.answers)) {
        const question = questions.get(id);

        if (!question) {
            return Response.json({ error: "unknown_question" }, { status: 400 });
        }

        if (answer.type !== question.type) {
            return Response.json({ error: "answer_type_mismatch" }, { status: 400 });
        }

        if (
            question.type === "mc" &&
            answer.type === "mc" &&
            answer.optionId !== "unsure" &&
            !question.options.some((opt) => opt.id === answer.optionId)
        ) {
            return Response.json({ error: "unknown_option" }, { status: 400 });
        }

        if (
            question.type === "open" &&
            answer.type === "open" &&
            answer.met &&
            !answer.met.every((rubricId) =>
                question.rubric.some((item) => item.id === rubricId)
            )
        ) {
            return Response.json({ error: "unknown_rubric_item" }, { status: 400 });
        }

        newAnswers.push(
            answer.type === "mc"
                ? { questionId: id, questionType: "mc", optionId: answer.optionId, credit: credit(question, answer) }
                : { questionId: id, questionType: "open", openAnswer: { text: answer.text, met: answer.met }, credit: credit(question, answer) }
        );
    }

    const result = scoreTopic(
        view.questions,
        parsed.data.answers,
        view.subtopics.map((s) => s.id)
    );

    const newResult: NewResult = {
        topicId,
        contentKey,
        level: result.level,
        levelScores: result.levels,
        subtopicScores: result.subtopics,
        completedAt: new Date(),
    };

    const id = await saveResult(newResult, newAnswers, user.id);

    return Response.json({ id }, { status: 201 });
}

export async function GET () {
    const { user } = await getCurrentSession();

    if (!user) {
        return Response.json({error: "unauthorized"}, { status: 401 });
    }

    const results = await listResultsForUser(user.id);

    return Response.json({results})
}
