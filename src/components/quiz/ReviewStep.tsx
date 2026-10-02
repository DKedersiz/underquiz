"use client";

import { useState } from "react";
import { Html } from "@/components/Html";
import { scoreOpen } from "@/lib/quiz/scoring";
import type { OpenView } from "@/lib/quiz/types";
import { tr } from "@/messages/tr";
import { Badge, Button, Card } from "./ui";

type Props = {
  question: OpenView;
  position: string;
  text: string;
  met?: string[];
  saved: boolean;
  isLast: boolean;
  onSave: (met: string[]) => void;
  onNext: () => void;
};

export function ReviewStep({ question: q, position, text, met, saved, isLast, onSave, onNext }: Props) {
  const t = tr.review;
  const [checked, setChecked] = useState<string[]>(met ?? []);
  const result = saved ? scoreOpen(q, met) : undefined;

  const toggle = (id: string) =>
    setChecked((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-semibold">{t.title}</h2>
        <span className="text-sm text-muted">{position}</span>
      </div>
      <p className="mt-2 text-muted">{t.lead}</p>

      <details className="mt-6 rounded-xl border border-line bg-surface p-4">
        <summary className="cursor-pointer text-sm font-medium">
          {tr.quiz.level(q.level)} · {tr.results.showQuestion}
        </summary>
        <Html html={q.promptHtml} className="mt-3" />
      </details>

      <Card className="mt-4">
        <h3 className="text-sm font-medium text-muted">{t.yourAnswer}</h3>
        <p className="mt-2 whitespace-pre-wrap leading-relaxed">{text}</p>
      </Card>

      <fieldset className="mt-4 space-y-2" disabled={saved}>
        <legend className="mb-2 text-sm font-medium">{t.checklist}</legend>
        {q.rubric.map((r) => {
          const on = checked.includes(r.id);
          return (
            <label
              key={r.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                on ? "border-ink bg-ink/5" : "border-line bg-surface"
              } ${saved ? "cursor-default" : "hover:border-muted"}`}
            >
              <input type="checkbox" checked={on} onChange={() => toggle(r.id)} className="mt-1 size-4 accent-[var(--ink)]" />
              <span className="leading-relaxed">
                <Html html={r.html} inline />
                {r.required && (
                  <span className="ml-2 align-middle">
                    <Badge>{t.required}</Badge>
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </fieldset>

      {!saved ? (
        <div className="mt-6 flex justify-end">
          <Button onClick={() => onSave(checked)}>{t.save}</Button>
        </div>
      ) : (
        <>
          <div
            className={`mt-6 rounded-xl p-4 font-medium ${result?.passed ? "bg-good-soft text-good" : "bg-warn-soft text-warn"}`}
          >
            {result?.passed ? t.passed : t.failed}
          </div>
          <Card className="mt-4">
            <h3 className="text-sm font-medium text-muted">{t.modelAnswer}</h3>
            <Html html={q.modelAnswerHtml} className="mt-2" />
          </Card>
          <div className="mt-6 flex justify-end">
            <Button onClick={onNext}>{isLast ? t.toResults : t.next}</Button>
          </div>
        </>
      )}
    </div>
  );
}
