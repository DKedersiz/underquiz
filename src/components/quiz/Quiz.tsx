"use client";

import { useEffect, useState } from "react";
import type { Answer, OpenView, TopicView } from "@/lib/quiz/types";
import { tr } from "@/messages/tr";
import { QuestionStep } from "./QuestionStep";
import { ReviewStep } from "./ReviewStep";
import { Results } from "./Results";
import { freshState, loadState, saveState, type QuizState } from "./state";

// Rendered only on the client (see QuizLoader) because saved progress lives in localStorage.
export default function Quiz({ topic }: { topic: TopicView }) {
  const [state, setState] = useState<QuizState>(() => loadState(topic) ?? freshState(topic));

  useEffect(() => {
    saveState(topic.id, state);
  }, [topic.id, state]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [state.phase, state.index, state.reviewIndex]);

  const update = (patch: Partial<QuizState>) => setState({ ...state, ...patch });
  const toReview = topic.questions.filter((q): q is OpenView => q.type === "open" && hasText(state.answers[q.id]));

  const restart = () => {
    if (window.confirm(tr.quiz.restartConfirm)) setState(freshState(topic));
  };

  const header = (
    <div className="mb-8 flex items-center justify-between gap-4">
      <h1 className="text-xl font-semibold tracking-tight">{topic.title}</h1>
      {(state.index > 0 || state.phase !== "answering") && (
        <button onClick={restart} className="text-sm text-muted underline-offset-2 hover:text-ink hover:underline">
          {tr.quiz.restart}
        </button>
      )}
    </div>
  );

  if (state.phase === "answering") {
    const q = topic.questions[state.index];
    const last = state.index === topic.questions.length - 1;
    const next = () => {
      if (!last) return update({ index: state.index + 1 });
      update({ phase: toReview.length > 0 ? "reviewing" : "results", reviewIndex: 0 });
    };
    return (
      <div>
        {header}
        <Progress value={state.index} max={topic.questions.length} label={tr.quiz.progress(state.index + 1, topic.questions.length)} />
        <QuestionStep
          key={q.id}
          question={q}
          subtopicTitle={topic.subtopics.find((s) => s.id === q.subtopic)?.title ?? q.subtopic}
          optionOrder={state.optionOrder[q.id]}
          answer={state.answers[q.id]}
          onAnswer={(a: Answer) => update({ answers: { ...state.answers, [q.id]: a } })}
          onNext={next}
          onBack={state.index > 0 ? () => update({ index: state.index - 1 }) : undefined}
          isLast={last}
        />
      </div>
    );
  }

  if (state.phase === "reviewing") {
    const q = toReview[state.reviewIndex];
    const answer = state.answers[q.id];
    return (
      <div>
        {header}
        <ReviewStep
          key={q.id}
          question={q}
          position={tr.review.progress(state.reviewIndex + 1, toReview.length)}
          text={answer.type === "open" ? answer.text : ""}
          met={answer.type === "open" ? answer.met : undefined}
          saved={state.reviewed.includes(q.id)}
          isLast={state.reviewIndex === toReview.length - 1}
          onSave={(met) =>
            update({
              answers: { ...state.answers, [q.id]: { type: "open", text: answer.type === "open" ? answer.text : "", met } },
              reviewed: [...state.reviewed.filter((id) => id !== q.id), q.id],
            })
          }
          onNext={() =>
            state.reviewIndex === toReview.length - 1
              ? update({ phase: "results" })
              : update({ reviewIndex: state.reviewIndex + 1 })
          }
        />
      </div>
    );
  }

  return (
    <div>
      <Results topic={topic} answers={state.answers} onRestart={() => setState(freshState(topic))} />
    </div>
  );
}

function hasText(a: Answer | undefined) {
  return a?.type === "open" && a.text.trim() !== "";
}

function Progress({ value, max, label }: { value: number; max: number; label: string }) {
  return (
    <div className="mb-6">
      <div className="mb-2 text-sm text-muted">{label}</div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={value} aria-valuemax={max}>
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}
