import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";
import { questionSchema, topicSchema } from "./schema";

// Validates every content file, drafts included, so a broken draft is caught before review.
const root = path.join(process.cwd(), "content");
const read = (f: string) => parse(fs.readFileSync(f, "utf8"));

const topics = fs
  .readdirSync(path.join(root, "topics"))
  .map((f) => topicSchema.parse(read(path.join(root, "topics", f))));
const resourceIds = new Set(topics.flatMap((t) => t.resources.map((r) => r.id)));

describe.each(topics)("$id", (topic) => {
  const dir = path.join(root, "questions", topic.id);
  const files = fs.readdirSync(dir);
  const questions = files.map((f) => ({ file: f, result: questionSchema.safeParse(read(path.join(dir, f))) }));
  const ids = new Set(questions.flatMap((q) => (q.result.success ? [q.result.data.id] : [])));

  it.each(questions)("$file", ({ file, result }) => {
    expect(result.error?.message).toBeUndefined();
    const q = result.data!;
    expect(file).toBe(`${q.id}.yaml`);
    expect(q.topic).toBe(topic.id);
    expect(topic.subtopics.map((s) => s.id)).toContain(q.subtopic);
    for (const r of q.resources) expect(resourceIds).toContain(r);
    for (const other of q.revealsAnswerOf) expect(ids).toContain(other);
  });
});
