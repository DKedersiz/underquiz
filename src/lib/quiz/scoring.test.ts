import { describe, expect, it } from "vitest";
import { credit, growthList, scoreOpen, scoreTopic } from "./scoring";
import type { Answers, Level, McView, OpenView } from "./types";

const mc = (id: string, level: Level, subtopic = "s1"): McView => ({
  id,
  level,
  subtopic,
  type: "mc",
  promptHtml: "",
  explanationHtml: "",
  resources: [],
  fromInterview: false,
  allowUnsure: true,
  shuffle: false,
  options: [
    { id: "a", html: "", correct: true },
    { id: "b", html: "", correct: false, misconceptionHtml: "wrong idea" },
  ],
});

const open = (id: string, level: Level): OpenView => ({
  id,
  level,
  subtopic: "s1",
  type: "open",
  promptHtml: "",
  explanationHtml: "",
  resources: [],
  fromInterview: false,
  rubric: [
    { id: "r1", html: "", weight: 2, required: true },
    { id: "r2", html: "", weight: 2, required: false },
    { id: "r3", html: "", weight: 1, required: false },
  ],
  pass: { minScore: 3, requireAll: ["r1"] },
  modelAnswerHtml: "",
});

describe("scoreOpen", () => {
  it("requires every requireAll item even when the score is high enough", () => {
    expect(scoreOpen(open("o", 3), ["r2", "r3"]).passed).toBe(false);
    expect(scoreOpen(open("o", 3), ["r1", "r3"]).passed).toBe(true);
  });
});

describe("credit", () => {
  it("gives no credit for unsure or wrong multiple choice", () => {
    expect(credit(mc("q", 1), { type: "mc", optionId: "a" })).toBe(1);
    expect(credit(mc("q", 1), { type: "mc", optionId: "b" })).toBe(0);
    expect(credit(mc("q", 1), { type: "mc", optionId: "unsure" })).toBe(0);
  });

  it("gives at most half a point for a failed open answer", () => {
    expect(credit(open("o", 3), { type: "open", text: "x", met: ["r2", "r3"] })).toBeCloseTo(0.3);
    expect(credit(open("o", 3), { type: "open", text: "  ", met: ["r1", "r2"] })).toBe(0);
  });
});

describe("scoreTopic", () => {
  const qs = [mc("a1", 1), mc("a2", 1), mc("b1", 2), mc("b2", 2), mc("c1", 3), open("c2", 3)];
  const right = (id: string) => ({ [id]: { type: "mc", optionId: "a" } }) as Answers;

  it("stops at the first failed level even if a higher level passes", () => {
    const answers = { ...right("a1"), ...right("a2"), ...right("c1"),
      c2: { type: "open", text: "x", met: ["r1", "r2"] } } as Answers;
    const r = scoreTopic(qs, answers, ["s1"]);
    expect(r.levels.find((l) => l.level === 3)?.passed).toBe(true);
    expect(r.level).toBe(1);
  });

  it("returns 0 when level 1 is not passed", () => {
    expect(scoreTopic(qs, {}, ["s1"]).level).toBe(0);
  });

  it("ignores levels without questions", () => {
    const answers = { ...right("a1"), ...right("a2"), ...right("b1"), ...right("b2"), ...right("c1"),
      c2: { type: "open", text: "x", met: ["r1", "r2"] } } as Answers;
    expect(scoreTopic(qs, answers, ["s1"]).level).toBe(3);
  });
});

describe("growthList", () => {
  it("lists gaps lowest level first with the chosen misconception", () => {
    const answers = { c1: { type: "mc", optionId: "b" }, a1: { type: "mc", optionId: "unsure" } } as Answers;
    const items = growthList([mc("c1", 3), mc("a1", 1)], answers);
    expect(items.map((i) => i.question.id)).toEqual(["a1", "c1"]);
    expect(items[1].misconceptionHtml).toBe("wrong idea");
  });
});
