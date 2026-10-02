import type { Answers, TopicView } from "@/lib/quiz/types";

export type Phase = "answering" | "reviewing" | "results";

export type QuizState = {
  contentKey: string;
  phase: Phase;
  index: number;
  reviewIndex: number;
  reviewed: string[]; // open questions whose self-assessment was saved
  answers: Answers;
  optionOrder: Record<string, string[]>;
};

const storageKey = (topicId: string) => `underquiz:v1:${topicId}`;

function shuffled<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function freshState(topic: TopicView): QuizState {
  const optionOrder: Record<string, string[]> = {};
  for (const q of topic.questions) {
    if (q.type !== "mc") continue;
    const ids = q.options.map((o) => o.id);
    optionOrder[q.id] = q.shuffle ? shuffled(ids) : ids;
  }
  return { contentKey: topic.contentKey, phase: "answering", index: 0, reviewIndex: 0, reviewed: [], answers: {}, optionOrder };
}

// Storage can be unavailable (private mode, blocked site data); the quiz still works without it.
export function loadState(topic: TopicView): QuizState | undefined {
  try {
    const raw = localStorage.getItem(storageKey(topic.id));
    if (!raw) return undefined;
    const s = JSON.parse(raw) as QuizState;
    return s.contentKey === topic.contentKey ? s : undefined;
  } catch {
    return undefined;
  }
}

export function saveState(topicId: string, state: QuizState) {
  try {
    localStorage.setItem(storageKey(topicId), JSON.stringify(state));
  } catch {
    // ignore
  }
}
