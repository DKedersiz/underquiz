import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import { questionSchema, topicSchema, type Question, type Resource, type Topic } from "./schema";
import { renderBlock, renderInline } from "./markdown";
import { selectQuestions } from "@/lib/quiz/select";
import type { QuestionView, TopicView } from "@/lib/quiz/types";

const contentDir = path.join(process.cwd(), "content");

async function readYaml(file: string): Promise<unknown> {
  return parse(await fs.readFile(file, "utf8"));
}

export async function loadTopics(): Promise<Topic[]> {
  const dir = path.join(contentDir, "topics");
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".yaml")).sort();
  return Promise.all(
    files.map(async (f) => {
      const parsed = topicSchema.safeParse(await readYaml(path.join(dir, f)));
      if (!parsed.success) throw new Error(`Invalid topic ${f}: ${parsed.error.message}`);
      return parsed.data;
    }),
  );
}

export async function loadQuestions(topicId: string): Promise<Question[]> {
  const dir = path.join(contentDir, "questions", topicId);
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".yaml")).sort();
  return Promise.all(
    files.map(async (f) => {
      const parsed = questionSchema.safeParse(await readYaml(path.join(dir, f)));
      if (!parsed.success) throw new Error(`Invalid question ${f}: ${parsed.error.message}`);
      if (`${parsed.data.id}.yaml` !== f) throw new Error(`File name ${f} does not match id`);
      return parsed.data;
    }),
  );
}

async function toView(q: Question, resources: Map<string, Resource>): Promise<QuestionView> {
  const base = {
    id: q.id,
    level: q.level,
    subtopic: q.subtopic,
    promptHtml: await renderBlock(q.prompt.tr),
    explanationHtml: await renderBlock(q.explanation.tr),
    resources: q.resources.map((id) => {
      const r = resources.get(id);
      if (!r) throw new Error(`${q.id}: unknown resource ${id}`);
      return r;
    }),
    fromInterview: q.source.kind === "interview",
  };
  if (q.type === "mc") {
    return {
      ...base,
      type: "mc",
      allowUnsure: q.allowUnsure,
      shuffle: q.shuffle,
      options: await Promise.all(
        q.options.map(async (o) => ({
          id: o.id,
          html: await renderInline(o.text),
          correct: o.correct === true,
          misconceptionHtml: o.misconception ? await renderInline(o.misconception.tr) : undefined,
        })),
      ),
    };
  }
  return {
    ...base,
    type: "open",
    answerHint: q.answerHint,
    rubric: await Promise.all(
      q.rubric.map(async (r) => ({
        id: r.id,
        html: await renderInline(r.point.tr),
        weight: r.weight,
        required: r.required === true || q.pass.requireAll.includes(r.id),
      })),
    ),
    pass: q.pass,
    modelAnswerHtml: await renderBlock(q.modelAnswer.tr),
  };
}

export type TopicSummary = { id: string; title: string; questionCount: number; openCount: number };

export async function loadTopicSummaries(): Promise<TopicSummary[]> {
  const topics = await loadTopics();
  return Promise.all(
    topics.map(async (t) => {
      const selected = selectQuestions(await loadQuestions(t.id));
      return {
        id: t.id,
        title: t.title.tr,
        questionCount: selected.length,
        openCount: selected.filter((q) => q.type === "open").length,
      };
    }),
  );
}

export async function loadTopicView(topicId: string): Promise<TopicView | undefined> {
  const topics = await loadTopics();
  const topic = topics.find((t) => t.id === topicId);
  if (!topic) return undefined;

  // Resources are declared per topic but may be referenced across topics.
  const resources = new Map(topics.flatMap((t) => t.resources.map((r) => [r.id, r] as const)));
  const subtopicOrder = topic.subtopics.map((s) => s.id);
  const questions = selectQuestions(await loadQuestions(topicId), subtopicOrder);

  for (const q of questions) {
    if (!subtopicOrder.includes(q.subtopic)) throw new Error(`${q.id}: unknown subtopic ${q.subtopic}`);
  }

  return {
    id: topic.id,
    contentKey: questions.map((q) => `${q.id}@${q.version}`).join("|"),
    title: topic.title.tr,
    subtopics: topic.subtopics.map((s) => ({ id: s.id, title: s.title.tr })),
    levels: { 1: topic.levels[1].tr, 2: topic.levels[2].tr, 3: topic.levels[3].tr, 4: topic.levels[4].tr },
    questions: await Promise.all(questions.map((q) => toView(q, resources))),
  };
}
