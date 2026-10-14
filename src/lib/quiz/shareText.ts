import { tr } from "@/messages/tr";
import type { TopicResult } from "./scoring";
import { formatScore } from "@/lib/format";

export type ShareTextInput = {
  title: string;
  result: TopicResult;
  subtopicTitle: (id: string) => string;
  hasOpen: boolean;
};

export function shareText(input: ShareTextInput): string {
  const levelLine = input.result.level > 0 ? `Seviye ${input.result.level} · ${tr.levelNames[input.result.level]}`
   : `Seviye · ${tr.levelNames[input.result.level]}`;
  const openLine = input.hasOpen ? `\nAçık uçlu sorular öz değerlendirmeyle puanlandı.` : ``;
  const levelLines = input.result.levels
    .filter((l) => l.max > 0)
    .map((l) => `Seviye ${l.level} · ${tr.levelNames[l.level]} · ${formatScore(l.earned)}/${l.max} ${l.passed ? tr.results.passedLevel : tr.results.failedLevel}`)
    .join("\n");

  return `${tr.results.shareTitle(input.title)}

${levelLine}${openLine}

${levelLines}

Alt konular
ORM, JPA ve Hibernate temelleri; entity ve id · 3/3
İlişkiler, owning side, cascade ve orphanRemoval · 3/3
Lazy/eager, N+1, LazyInitializationException · 1,1/2
Entity durumları, persistence context, dirty checking · 3/3
@Transactional kullanımı, rollback, propagation, isolation · 4,1/7

underquiz.dogukankedersiz.dev`;
}