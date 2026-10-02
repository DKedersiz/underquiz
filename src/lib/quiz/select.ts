import type { Question } from "@/lib/content/schema";

// v1 has no adaptive engine: every reviewed question of a topic is asked, from level 1 to 4.
// Two questions linked by `revealsAnswerOf` are never asked together (in either direction).
// Conflicts are resolved in two phases, one dropped question at a time:
//   1. drop multiple-choice questions that clash with an open one (open questions carry the
//      L3–L4 signal) or with several others (one drop settles several pairs), most conflicts first;
//   2. the remaining pairs are independent; drop the side whose level has more questions left,
//      so levels stay balanced.
export function selectQuestions(all: Question[], subtopicOrder: string[] = []): Question[] {
  const pool = all.filter((q) => q.review.status === "reviewed");
  const byId = new Map(pool.map((q) => [q.id, q]));
  const kept = new Set(pool.map((q) => q.id));
  const levelSize = (level: number) => [...kept].filter((id) => byId.get(id)!.level === level).length;

  let edges = pool.flatMap((q) =>
    q.revealsAnswerOf.filter((id) => byId.has(id)).map((id) => [q.id, id] as const),
  );
  const neighbours = (id: string) => edges.flatMap(([a, b]) => (a === id ? [b] : b === id ? [a] : []));
  const drop = (id: string) => {
    kept.delete(id);
    edges = edges.filter(([a, b]) => a !== id && b !== id);
  };

  for (;;) {
    const forced = [...new Set(edges.flat())]
      .filter((id) => {
        const n = neighbours(id);
        return n.length > 1 || (byId.get(id)!.type === "mc" && n.some((o) => byId.get(o)!.type === "open"));
      })
      .sort(
        (x, y) =>
          (byId.get(x)!.type === "mc" ? 0 : 1) - (byId.get(y)!.type === "mc" ? 0 : 1) ||
          neighbours(y).length - neighbours(x).length ||
          x.localeCompare(y),
      );
    if (forced.length === 0) break;
    drop(forced[0]);
  }

  while (edges.length > 0) {
    const [a, b] = edges[0];
    const qa = byId.get(a)!;
    const qb = byId.get(b)!;
    const diff = levelSize(qa.level) - levelSize(qb.level);
    drop(diff > 0 || (diff === 0 && qa.level < qb.level) ? a : b);
  }

  const sub = (s: string) => {
    const i = subtopicOrder.indexOf(s);
    return i === -1 ? subtopicOrder.length : i;
  };
  return pool
    .filter((q) => kept.has(q.id))
    .sort(
      (a, b) =>
        a.level - b.level ||
        (a.type === b.type ? 0 : a.type === "mc" ? -1 : 1) ||
        sub(a.subtopic) - sub(b.subtopic) ||
        a.id.localeCompare(b.id),
    );
}
