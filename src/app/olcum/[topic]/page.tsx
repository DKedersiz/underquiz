import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuizLoader } from "@/components/quiz/QuizLoader";
import { loadTopicView, loadTopics } from "@/lib/content/load";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await loadTopics()).map((t) => ({ topic: t.id }));
}

export async function generateMetadata({ params }: PageProps<"/olcum/[topic]">): Promise<Metadata> {
  const { topic } = await params;
  const view = await loadTopicView(topic);
  return { title: view?.title };
}

export default async function TopicPage({ params }: PageProps<"/olcum/[topic]">) {
  const { topic } = await params;
  const view = await loadTopicView(topic);
  if (!view) notFound();
  return <QuizLoader topic={view} />;
}
