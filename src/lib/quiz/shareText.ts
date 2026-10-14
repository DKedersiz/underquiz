import { tr } from "@/messages/tr";
import type { TopicResult } from "./scoring";

export type ShareTextInput = {
  title: string;
  result: TopicResult;
  subtopicTitle: (id: string) => string;
  hasOpen: boolean;
};

export function shareText(input: ShareTextInput): string {
  const levelLine = input.result.level > 0 ? `Seviye ${input.result.level} · ${tr.levelNames[input.result.level]}`
   : `Seviye · ${tr.levelNames[input.result.level]}`
   const openLine = input.hasOpen ? `\nAçık uçlu sorular öz değerlendirmeyle puanlandı.` : ``;
  return `${tr.results.shareTitle(input.title)}

${levelLine}${openLine}

Seviye 1 · Tanıyor · 4/4 geçti
Seviye 2 · Kullanıyor · 4/4 geçti
Seviye 3 · İçini biliyor · 4,1/5 geçti
Seviye 4 · Trade-off biliyor · 2,1/5 geçmedi

Alt konular
ORM, JPA ve Hibernate temelleri; entity ve id · 3/3
İlişkiler, owning side, cascade ve orphanRemoval · 3/3
Lazy/eager, N+1, LazyInitializationException · 1,1/2
Entity durumları, persistence context, dirty checking · 3/3
@Transactional kullanımı, rollback, propagation, isolation · 4,1/7

underquiz.dogukankedersiz.dev`;
}