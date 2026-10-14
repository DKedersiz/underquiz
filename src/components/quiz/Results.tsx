"use client";

import Link from "next/link";
import { Html } from "@/components/Html";
import { growthList, scoreTopic, type GrowthItem } from "@/lib/quiz/scoring";
import type { Answers, QuestionView, Resource, TopicView } from "@/lib/quiz/types";
import { tr } from "@/messages/tr";
import { Badge, Button, Card } from "./ui";
import { formatScore } from "@/lib/format";
import { shareText } from "@/lib/quiz/shareText";

export function Results({ topic, answers, onRestart }: { topic: TopicView; answers: Answers; onRestart: () => void }) {
  const t = tr.results;
  const result = scoreTopic(topic.questions, answers, topic.subtopics.map((s) => s.id));
  const growth = growthList(topic.questions, answers);
  const gapIds = new Set(growth.map((g) => g.question.id));
  const correct = topic.questions.filter((q) => !gapIds.has(q.id));
  const hasOpen = topic.questions.some((q) => q.type === "open" && answers[q.id]?.type === "open");
  const subtopicTitle = (id: string) => topic.subtopics.find((s) => s.id === id)?.title ?? id;

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-xl font-semibold tracking-tight">{t.title(topic.title)}</h1>
        <Card className="relative mt-4 overflow-hidden p-6">
          {result.level > 0 && (
            // The stamped seal has see-through ink gaps, so it is only used on paper; night gets the clean seal.
            <picture>
              <source srcSet="/brand/seal.svg" media="(prefers-color-scheme: dark)" />
              <img
                src="/brand/seal-stamped.svg"
                alt=""
                width={96}
                height={96}
                className="pointer-events-none absolute top-5 right-5 size-20 rotate-[-8deg] opacity-90 sm:size-24"
              />
            </picture>
          )}
          <p className="font-sans text-sm font-medium text-muted">{t.yourLevel}</p>
          <p className="mt-1 pr-24 font-display text-4xl font-semibold tracking-tight sm:pr-28">
            {result.level > 0 && <span className="text-accent">{result.level} · </span>}
            {tr.levelNames[result.level]}
          </p>
          <p className="mt-3 max-w-xl leading-relaxed text-muted">
            {result.level > 0 ? topic.levels[result.level as 1 | 2 | 3 | 4] : t.belowOne}
          </p>
          {hasOpen && <p className="mt-3 text-sm text-muted">{t.selfAssessed}</p>}
        </Card>
        <Button onClick={() => navigator.clipboard.writeText(shareText({ title: topic.title, result, subtopicTitle, hasOpen }))} variant="ghost">
          {t.copyResult}
        </Button>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{t.ladderTitle}</h2>
        <div className="mt-4 space-y-2">
          {result.levels
            .filter((l) => l.max > 0)
            .map((l) => (
              <div key={l.level} className="flex items-center gap-4">
                <span className="w-36 shrink-0 text-sm">
                  <span className="text-muted">{l.level} · </span>
                  {tr.levelNames[l.level]}
                </span>
                <Bar value={l.earned} max={l.max} tone={l.passed ? "good" : "warn"} />
                <span className="w-24 shrink-0 text-right text-sm text-muted">
                  {formatScore(l.earned)}/{l.max} · {l.passed ? t.passedLevel : t.failedLevel}
                </span>
              </div>
            ))}
        </div>
        <p className="mt-3 text-sm text-muted">{t.ruleNote}</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{t.subtopicsTitle}</h2>
        <div className="mt-4 space-y-2">
          {result.subtopics.map((s) => (
            <div key={s.id} className="flex items-center gap-4">
              <span className="w-36 shrink-0 text-sm sm:w-56">{subtopicTitle(s.id)}</span>
              <Bar value={s.earned} max={s.max} tone="accent" />
              <span className="w-24 shrink-0 text-right text-sm text-muted">
                {formatScore(s.earned)}/{s.max}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{t.growthTitle}</h2>
        <p className="mt-1 text-muted">{growth.length ? t.growthLead : t.growthEmpty}</p>
        <div className="mt-4 space-y-3">
          {growth.map((item) => (
            <GrowthCard key={item.question.id} item={item} answers={answers} subtopic={subtopicTitle(item.question.subtopic)} />
          ))}
        </div>
      </section>

      {correct.length > 0 && (
        <details className="rounded-xl border border-line bg-surface p-5">
          <summary className="cursor-pointer font-medium">{t.correctTitle(correct.length)}</summary>
          <div className="mt-4 space-y-6">
            {correct.map((q) => (
              <div key={q.id} className="border-t border-line pt-4 first:border-0 first:pt-0">
                <Meta q={q} subtopic={subtopicTitle(q.subtopic)} />
                <Html html={q.promptHtml} className="mt-3 text-sm" />
                <Explanation q={q} />
              </div>
            ))}
          </div>
        </details>
      )}

      <div className="flex flex-wrap gap-3">
        <Button onClick={onRestart}>{t.again}</Button>
        <Link href="/" className="rounded-lg px-4 py-2 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-ink">
          {t.otherTopics}
        </Link>
      </div>
    </div>
  );
}

function GrowthCard({ item, answers, subtopic }: { item: GrowthItem; answers: Answers; subtopic: string }) {
  const t = tr.results;
  const q = item.question;
  const a = answers[q.id];
  const tone = item.kind === "wrong" ? "bad" : item.kind === "skipped" ? "neutral" : "warn";

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={tone}>{t.kind[item.kind]}</Badge>
        <Meta q={q} subtopic={subtopic} />
      </div>
      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-medium text-accent">{t.showQuestion}</summary>
        <Html html={q.promptHtml} className="mt-3 text-sm" />
      </details>

      {q.type === "mc" && a?.type === "mc" && a.optionId !== "unsure" && (
        <Block title={t.yourChoice}>
          <Html html={q.options.find((o) => o.id === a.optionId)?.html ?? ""} inline />
        </Block>
      )}
      {item.misconceptionHtml && (
        <Block title={t.misconception} tone="bad">
          <Html html={item.misconceptionHtml} inline />
        </Block>
      )}
      {q.type === "open" && item.missingRubric && item.missingRubric.length > 0 && (
        <Block title={t.missing}>
          <ul className="list-disc space-y-1 pl-5">
            {q.rubric
              .filter((r) => item.missingRubric!.includes(r.id))
              .map((r) => (
                <li key={r.id}>
                  <Html html={r.html} inline />
                </li>
              ))}
          </ul>
        </Block>
      )}
      <Explanation q={q} />
    </Card>
  );
}

function Explanation({ q }: { q: QuestionView }) {
  const t = tr.results;
  return (
    <>
      {q.type === "mc" && (
        <Block title={t.correct} tone="good">
          <Html html={q.options.find((o) => o.correct)?.html ?? ""} inline />
        </Block>
      )}
      {q.type === "open" && (
        <Block title={t.modelAnswer}>
          <Html html={q.modelAnswerHtml} />
        </Block>
      )}
      <Block title={t.explanation}>
        <Html html={q.explanationHtml} />
      </Block>
      {q.resources.length > 0 && <Resources items={q.resources} />}
    </>
  );
}

function Meta({ q, subtopic }: { q: QuestionView; subtopic: string }) {
  return (
    <span className="text-sm text-muted">
      {tr.quiz.level(q.level)} · {subtopic}
    </span>
  );
}

function Block({ title, tone, children }: { title: string; tone?: "good" | "bad"; children: React.ReactNode }) {
  const color = tone === "good" ? "text-good" : tone === "bad" ? "text-bad" : "text-muted";
  return (
    <div className="mt-4 text-sm leading-relaxed">
      <h4 className={`mb-1 font-medium ${color}`}>{title}</h4>
      {children}
    </div>
  );
}

function Resources({ items }: { items: Resource[] }) {
  return (
    <div className="mt-4 text-sm">
      <h4 className="mb-1 font-medium text-muted">{tr.results.resources}</h4>
      <ul className="space-y-1">
        {items.map((r) => (
          <li key={r.id}>
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-accent underline-offset-2 hover:underline">
              {r.title}
            </a>
            <span className="text-muted"> · {r.lang.toUpperCase()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Bar({ value, max, tone }: { value: number; max: number; tone: "good" | "warn" | "accent" }) {
  const color = tone === "good" ? "bg-good" : tone === "warn" ? "bg-warn" : "bg-accent";
  return (
    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
    </div>
  );
}
