import { describe, expect, it } from "vitest";
import { shareText, type ShareTextInput } from "./shareText";

const titles: Record<string, string> = {
    orm: "ORM, JPA ve Hibernate temelleri; entity ve id",
    own: "İlişkiler, owning side, cascade ve orphanRemoval",
    laz: "Lazy/eager, N+1, LazyInitializationException",
    ent: "Entity durumları, persistence context, dirty checking",
    tra: "@Transactional kullanımı, rollback, propagation, isolation"
};

const input: ShareTextInput = {
    title: "JPA & Transaction",
    hasOpen: true,
    subtopicTitle: (id) => titles[id],
    result: {
        level: 3,
        levels: [
            { level: 1, earned: 4, max: 4, passed: true},
            { level: 2, earned: 4, max: 4, passed: true},
            { level: 3, earned: 4.1, max:5, passed: true},
            { level: 4, earned: 2.1, max:5, passed: false}
        ],
        subtopics: [
            {id: "orm", earned: 3, max: 3},
            {id: "own", earned: 3, max: 3},
            {id: "laz", earned: 1.1, max: 2},
            {id: "ent", earned: 3, max: 3},
            {id: "tra", earned: 4.1, max:7}
        ],
    },
};

describe("shareText", () => {
  it("formats the issue example", () => {
    expect(shareText(input)).toBe(`JPA & Transaction sonucu

Seviye 3 · İçini biliyorxaxaxa
Açık uçlu sorular öz değerlendirmeyle puanlandı.

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

underquiz.dogukankedersiz.dev`);
  });

  it("shows Başlangıç without a number when no level is passed", () => {
        const text = shareText({...input, result: {...input.result, level:0}});
        expect(text).toContain("Seviye · Başlangıç");
        expect(text).not.toContain("Seviye 0");
    })

    it("hides the self-assessment line when there are no open questions", () => {
        const text = shareText({...input, hasOpen: false});
        expect(text).not.toContain("Açık uçlu sorular öz değerlendirmeyle puanlandı.");
        expect(text).toContain("Seviye 3 · İçini biliyor\n\nSeviye 1");
    })
});
