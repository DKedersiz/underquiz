import Link from "next/link";
import { tr } from "@/messages/tr";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <p className="font-display text-lg font-semibold text-accent">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{tr.notFound.title}</h1>
      <p className="mt-3 text-muted">{tr.notFound.body}</p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-lg bg-ink px-4 py-2 font-sans text-sm font-medium text-bg transition hover:opacity-90"
      >
        {tr.notFound.home}
      </Link>
    </div>
  );
}
