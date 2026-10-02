import type { Answer, Answers, Level, OpenView, QuestionView } from "./types";

// v1 scoring rules (kept simple and explainable on the results page):
// - Multiple choice: 1 point if correct, 0 if wrong or "unsure".
// - Open (self-assessed): 1 point if the pass rule is met; otherwise up to 0.5 point in
//   proportion to the rubric weight the user marked as covered.
// - A level is passed when the user earns at least PASS_RATIO of that level's points.
// - The topic level is the highest level for which this level and every level below it passed.
export const PASS_RATIO = 0.6;
export const LEVELS: Level[] = [1, 2, 3, 4];

export type OpenScore = { score: number; total: number; passed: boolean; missing: string[] };

export function scoreOpen(q: OpenView, met: string[] = []): OpenScore {
  const covered = new Set(met);
  const total = q.rubric.reduce((s, r) => s + r.weight, 0);
  const score = q.rubric.reduce((s, r) => s + (covered.has(r.id) ? r.weight : 0), 0);
  const requiredOk = q.pass.requireAll.every((id) => covered.has(id));
  return {
    score,
    total,
    passed: requiredOk && score >= q.pass.minScore,
    missing: q.rubric.filter((r) => !covered.has(r.id)).map((r) => r.id),
  };
}

export function credit(q: QuestionView, a: Answer | undefined): number {
  if (!a) return 0;
  if (q.type === "mc") {
    if (a.type !== "mc") return 0;
    return q.options.find((o) => o.id === a.optionId)?.correct ? 1 : 0;
  }
  if (a.type !== "open" || a.text.trim() === "") return 0;
  const s = scoreOpen(q, a.met);
  return s.passed ? 1 : s.total === 0 ? 0 : 0.5 * (s.score / s.total);
}

export type LevelResult = { level: Level; earned: number; max: number; passed: boolean };

export type TopicResult = {
  level: 0 | Level;
  levels: LevelResult[];
  subtopics: { id: string; earned: number; max: number }[];
};

export function scoreTopic(questions: QuestionView[], answers: Answers, subtopicIds: string[]): TopicResult {
  const levels = LEVELS.map((level) => {
    const qs = questions.filter((q) => q.level === level);
    const earned = qs.reduce((s, q) => s + credit(q, answers[q.id]), 0);
    return { level, earned, max: qs.length, passed: qs.length > 0 && earned / qs.length >= PASS_RATIO - 1e-9 };
  });

  let level: 0 | Level = 0;
  for (const l of levels) {
    if (l.max === 0) continue; // a level without questions neither blocks nor grants
    if (!l.passed) break;
    level = l.level;
  }

  const subtopics = subtopicIds
    .map((id) => {
      const qs = questions.filter((q) => q.subtopic === id);
      return { id, earned: qs.reduce((s, q) => s + credit(q, answers[q.id]), 0), max: qs.length };
    })
    .filter((s) => s.max > 0);

  return { level, levels, subtopics };
}

export type GrowthItem = {
  question: QuestionView;
  kind: "wrong" | "unsure" | "open-missed" | "skipped";
  misconceptionHtml?: string;
  missingRubric?: string[];
};

// Everything the user should look at, lowest level first: a gap at level 2 matters before level 4.
export function growthList(questions: QuestionView[], answers: Answers): GrowthItem[] {
  const items: GrowthItem[] = [];
  for (const q of questions) {
    const a = answers[q.id];
    if (q.type === "mc") {
      if (!a || a.type !== "mc") items.push({ question: q, kind: "skipped" });
      else if (a.optionId === "unsure") items.push({ question: q, kind: "unsure" });
      else {
        const chosen = q.options.find((o) => o.id === a.optionId);
        if (!chosen?.correct) {
          items.push({ question: q, kind: "wrong", misconceptionHtml: chosen?.misconceptionHtml });
        }
      }
    } else {
      if (!a || a.type !== "open" || a.text.trim() === "") {
        items.push({ question: q, kind: "skipped" });
        continue;
      }
      const s = scoreOpen(q, a.met);
      if (!s.passed) items.push({ question: q, kind: "open-missed", missingRubric: s.missing });
    }
  }
  return items.sort((x, y) => x.question.level - y.question.level);
}
