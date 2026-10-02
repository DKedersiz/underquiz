import Link from "next/link";
import { loadTopicSummaries } from "@/lib/content/load";
import { tr } from "@/messages/tr";

// Rough pace: ~40 s per multiple choice, ~4 min per open question.
const minutesFor = (questions: number, open: number) =>
  Math.max(5, Math.round(((questions - open) * 40 + open * 240) / 60 / 5) * 5);

export default async function Home() {
  const topics = await loadTopicSummaries();
  const t = tr.home;

  return (
    <div className="space-y-16">
      <section>
        <p className="text-sm font-medium text-accent">{t.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
          {t.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{t.lead}</p>
        <ul className="mt-5 flex flex-wrap gap-2 text-sm">
          {t.facts.map((f) => (
            <li key={f} className="rounded-full border border-line bg-surface px-3 py-1 text-muted">
              {f}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{t.topicsTitle}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/olcum/${topic.id}`}
              className="group rounded-xl border border-line bg-surface p-5 transition hover:border-accent hover:shadow-sm"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-semibold">{topic.title}</h3>
                <span className="text-sm text-muted">
                  {t.minutes(minutesFor(topic.questionCount, topic.openCount))}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">{t.questionCount(topic.questionCount, topic.openCount)}</p>
              <p className="mt-4 text-sm font-medium text-accent">
                {t.start} <span className="inline-block transition group-hover:translate-x-0.5">→</span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{t.howTitle}</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {t.steps.map((s, i) => (
            <li key={s.title} className="rounded-xl border border-line bg-surface p-5">
              <span className="text-sm font-semibold text-accent">{i + 1}</span>
              <h3 className="mt-1 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{t.scaleTitle}</h2>
        <dl className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface">
          {([1, 2, 3, 4] as const).map((l) => (
            <div key={l} className="flex gap-4 px-5 py-3">
              <dt className="w-40 shrink-0 font-medium">
                <span className="text-muted">{l} · </span>
                {tr.levelNames[l]}
              </dt>
              <dd className="text-muted">{tr.levelMeaning[l]}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-sm text-muted">{t.scaleNote}</p>
      </section>
    </div>
  );
}
