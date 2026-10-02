"use client";

import { Html } from "@/components/Html";
import type { Answer, QuestionView } from "@/lib/quiz/types";
import { tr } from "@/messages/tr";
import { Badge, Button } from "./ui";

const MAX_OPEN_CHARS = 1500;

type Props = {
  question: QuestionView;
  subtopicTitle: string;
  optionOrder?: string[];
  answer?: Answer;
  onAnswer: (a: Answer) => void;
  onNext: () => void;
  onBack?: () => void;
  isLast: boolean;
};

export function QuestionStep({ question: q, subtopicTitle, optionOrder, answer, onAnswer, onNext, onBack, isLast }: Props) {
  const t = tr.quiz;
  const chosen = answer?.type === "mc" ? answer.optionId : undefined;
  const text = answer?.type === "open" ? answer.text : "";
  const canContinue = q.type === "mc" ? chosen !== undefined : true;

  return (
    <article>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="accent">{t.level(q.level)}</Badge>
        <Badge>{subtopicTitle}</Badge>
        {q.fromInterview && <Badge tone="warn">{t.interview}</Badge>}
      </div>

      <Html html={q.promptHtml} className="mt-4 text-[17px]" />

      {q.type === "mc" ? (
        <div role="radiogroup" className="mt-6 space-y-2">
          {(optionOrder ?? q.options.map((o) => o.id)).map((id) => {
            const o = q.options.find((x) => x.id === id)!;
            return (
              <Choice key={id} selected={chosen === id} onSelect={() => onAnswer({ type: "mc", optionId: id })}>
                <Html html={o.html} inline />
              </Choice>
            );
          })}
          {q.allowUnsure && (
            <Choice selected={chosen === "unsure"} onSelect={() => onAnswer({ type: "mc", optionId: "unsure" })} subtle>
              {t.unsure}
            </Choice>
          )}
        </div>
      ) : (
        <div className="mt-6">
          <textarea
            value={text}
            onChange={(e) => onAnswer({ type: "open", text: e.target.value.slice(0, MAX_OPEN_CHARS) })}
            maxLength={MAX_OPEN_CHARS}
            rows={10}
            placeholder={t.openPlaceholder}
            className="w-full resize-y rounded-xl border border-line bg-surface p-4 leading-relaxed outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
          />
          <div className="mt-1 flex justify-between text-sm text-muted">
            <span>{q.answerHint ? t.hint[q.answerHint] : ""}</span>
            <span>{t.chars(text.length, MAX_OPEN_CHARS)}</span>
          </div>
        </div>
      )}

      <p className="mt-6 text-sm text-muted">{t.noFeedbackYet}</p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>{onBack && <Button variant="ghost" onClick={onBack}>{t.back}</Button>}</div>
        <div className="flex items-center gap-3">
          {q.type === "open" && text.trim() === "" && (
            <Button variant="ghost" onClick={onNext}>{t.skip}</Button>
          )}
          <Button onClick={onNext} disabled={!canContinue || (q.type === "open" && text.trim() === "")}>
            {isLast ? t.finish : t.next}
          </Button>
        </div>
      </div>
    </article>
  );
}

function Choice({ selected, onSelect, subtle, children }: { selected: boolean; onSelect: () => void; subtle?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left leading-relaxed transition ${
        selected ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-muted"
      } ${subtle && !selected ? "text-muted" : ""}`}
    >
      <span
        aria-hidden
        className={`mt-1 size-4 shrink-0 rounded-full border-2 ${selected ? "border-accent bg-accent shadow-[inset_0_0_0_2px_var(--surface)]" : "border-line"}`}
      />
      <span>{children}</span>
    </button>
  );
}
