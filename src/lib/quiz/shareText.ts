import { tr } from "@/messages/tr";
import type { TopicResult } from "./scoring";
import { formatScore } from "@/lib/format";
import { site } from "@/lib/site";

export type ShareTextInput = {
  title: string;
  result: TopicResult;
  subtopicTitle: (id: string) => string;
  hasOpen: boolean;
};

export function shareText(input: ShareTextInput): string {
  const levelLine = input.result.level > 0 ? `${tr.quiz.level(input.result.level)} · ${tr.levelNames[input.result.level]}`
   : `${tr.quiz.levelLabel} · ${tr.levelNames[input.result.level]}`;
  const openLine = input.hasOpen ? `\n${tr.results.shareSelfAssessed}` : ``;
  const levelLines = input.result.levels
    .filter((l) => l.max > 0)
    .map((l) => `${tr.quiz.level(l.level)} · ${tr.levelNames[l.level]} · ${formatScore(l.earned)}/${l.max} ${l.passed ? tr.results.passedLevel : tr.results.failedLevel}`)
    .join("\n");
  const subtopicLines = input.result.subtopics
    .map((s) => `${input.subtopicTitle(s.id)} · ${formatScore(s.earned)}/${s.max}`)
    .join("\n");
  const siteHost = new URL(site.url).host;

  return `${tr.results.shareTitle(input.title)}

${levelLine}${openLine}

${levelLines}

${tr.results.subtopicsTitle}
${subtopicLines}

${siteHost}`;
}