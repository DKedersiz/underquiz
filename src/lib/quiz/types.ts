// Client-safe view models. Markdown is pre-rendered to HTML at build time.
import type { Level, Resource } from "@/lib/content/schema";

export type { Level, Resource };

type BaseView = {
  id: string;
  level: Level;
  subtopic: string;
  promptHtml: string;
  explanationHtml: string;
  resources: Resource[];
  fromInterview: boolean;
};

export type McView = BaseView & {
  type: "mc";
  allowUnsure: boolean;
  shuffle: boolean;
  options: { id: string; html: string; correct: boolean; misconceptionHtml?: string }[];
};

export type OpenView = BaseView & {
  type: "open";
  answerHint?: "short" | "medium";
  rubric: { id: string; html: string; weight: number; required: boolean }[];
  pass: { minScore: number; requireAll: string[] };
  modelAnswerHtml: string;
};

export type QuestionView = McView | OpenView;

export type TopicView = {
  id: string;
  // Changes whenever the asked questions change, so a stale saved session is discarded.
  contentKey: string;
  titlexd: string;
  subtopics: { id: string; title: string }[];
  levels: Record<Level, string>;
  questions: QuestionView[];
};

// What the user did. Kept in localStorage while a measurement is in progress.
export type McAnswer = { type: "mc"; optionId: string | "unsure" };
export type OpenAnswer = { type: "open"; text: string; met?: string[] };
export type Answer = McAnswer | OpenAnswer;
export type Answers = Record<string, Answer>;
