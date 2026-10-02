import { describe, expect, it } from "vitest";
import type { Question } from "@/lib/content/schema";
import { selectQuestions } from "./select";

const q = (id: string, level: 1 | 2 | 3 | 4, type: "mc" | "open", reveals: string[] = [], status = "reviewed") =>
  ({ id, level, type, subtopic: "s", revealsAnswerOf: reveals, review: { status } }) as unknown as Question;

const ids = (qs: Question[]) => qs.map((x) => x.id).sort();

describe("selectQuestions", () => {
  it("skips drafts", () => {
    expect(ids(selectQuestions([q("a", 1, "mc"), q("b", 1, "mc", [], "draft")]))).toEqual(["a"]);
  });

  it("keeps the open question when it clashes with a multiple-choice one", () => {
    expect(ids(selectQuestions([q("mc", 2, "mc"), q("open", 3, "open", ["mc"])]))).toEqual(["open"]);
  });

  it("drops the question with more conflicts instead of two others", () => {
    const pool = [q("hub", 2, "mc", ["x", "y"]), q("x", 4, "mc"), q("y", 4, "mc")];
    expect(ids(selectQuestions(pool))).toEqual(["x", "y"]);
  });

  it("does not drop a question whose partner is dropped anyway", () => {
    // own reveals custom, custom reveals back: dropping custom settles both pairs.
    const pool = [q("back", 2, "mc"), q("custom", 4, "mc", ["back"]), q("own", 4, "mc", ["custom"])];
    expect(ids(selectQuestions(pool))).toEqual(["back", "own"]);
  });

  it("drops from the larger level on an even clash", () => {
    const pool = [q("a1", 1, "mc", ["b1"]), q("a2", 1, "mc"), q("b1", 2, "mc")];
    expect(ids(selectQuestions(pool))).toEqual(["a2", "b1"]);
  });
});
